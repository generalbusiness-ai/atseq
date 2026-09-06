# Atseq v0 protocol

This is the S1 wire contract for the local spike. It preserves the adopted
single app DID, pinned genesis, sequencer, and folder split. It supplies no
PDS storage or domain interpreter by itself. The namespace `test.atseq` is
reserved for local tests; it claims no production Lexicon registration.
Production publication requires an owned namespace and a new protocol version.

## Schemas and ecosystem code

The authored framework IDL is in [Lexicon documents](../lexicons/test/atseq/).
`@atproto/lexicon` validates these at runtime. A small admission wrapper closes
framework objects to extra fields and checks that validation did not change
signed content. It does not replace Lexicon's field/type validation. Method
responses reference `genesis#value` and `head#value` object definitions because
this validator cannot nest a record declaration through a ref. Tests keep
these object definitions equal to their corresponding record bodies.

| Schema | Purpose |
|---|---|
| [defs](../lexicons/test/atseq/defs.json) | Intent, actor proof, cursor, receipt, query availability, outcomes |
| [genesis](../lexicons/test/atseq/genesis.json) | Initial immutable anchor, record key `self` |
| [entry](../lexicons/test/atseq/entry.json) | Sequencer-signed record, positive position key |
| [head](../lexicons/test/atseq/head.json) | Current chosen tip, record key `self` |
| [create](../lexicons/test/atseq/create.json) | Local provisioning request |
| [describe](../lexicons/test/atseq/describe.json) | Definition and progress discovery |
| [submit](../lexicons/test/atseq/submit.json) | Submit a canonical signed block |
| [query](../lexicons/test/atseq/query.json) | Named query at a reported frontier |
| [receipt](../lexicons/test/atseq/receipt.json) | Receipt and interpreted outcome lookup |

Encoding uses unmodified `@atcute/cbor` 2.3.6, CID creation uses `@atcute/cid`
2.4.2, and signatures use `@atcute/crypto` 2.4.4. These packages declare 0BSD.
They implement existing [atproto data encoding](https://atproto.com/specs/data-model)
and [cryptographic conventions](https://atproto.com/specs/cryptography).
The lockfile pins their resolved dependencies. Independent test vectors use a
separate CBOR implementation and Node's OpenSSL signing interface.

## Canonical data and identity

The in-process boundary is plain Lexicon JSON. Ordinary JSON types map to
CBOR types. Exactly `{"$bytes":"<base64>"}` maps to a byte string, and exactly
`{"$link":"<cid>"}` maps to a tag-42 CID link. Atseq v0 requires unpadded,
canonical standard base64 in these JSON wrappers. A wrapper with extra fields
is invalid. CID links use base32 CIDv1, CBOR codec `0x71`, SHA-256 `0x12/0x20`.
Raw blob CIDs belong to the later source-retention layer, outside signed v0
record links. `$type` is a string domain identifier; other `$` fields are not
admitted except the two exact wrappers.

Canonical CBOR uses the atproto subset of DRISL: map keys ordered by UTF-8
byte length, then byte value; shortest integer and length encodings; definite
containers; and no floats. All integers must be JavaScript-safe, excluding
negative zero. Unicode must be well formed. Null and missing fields remain
distinct. Arrays preserve order. No default insertion or stripping is allowed.
The evaluator's reserved key/value restrictions also apply before encoding.

The library rejects malformed encodings, duplicate or unordered map keys,
unsupported tags and trailing data. Atseq then validates decoded values and
requires exact equality between the supplied block and its re-encoding. That
also rejects float encodings of integers and malformed UTF-8 normalization.
Decode returns owned data; proof functions copy inputs before awaiting crypto.

| Limit | Value |
|---|---:|
| One signed block or genesis/head record | 64 KiB CBOR |
| Lexicon JSON admission representation | 128 KiB UTF-8 |
| Nested JSON containers | 32 |
| Action payload | 32 KiB canonical JSON |
| Retry nonce | 16 random bytes |
| P-256 signature | 64 bytes |
| Initial activation grants | 1–16 distinct keys |
| Position | 0 through 9,007,199,254,740,991; entries start at 1 |

CIDs identify complete canonical blocks. Signature fields are included in entry
CIDs. Intent identity instead hashes the unsigned intent alone. The runtime
profile has its own [descriptor](../src/protocol/runtime-descriptor.json) and
CBOR CID, including pinned package versions and SHA-256 hashes of the S0 engine
sources. S3's [application profile](../src/runtime/application-profile.json)
links that immutable engine and additionally pins definition admission, protocol
verification and folder behavior. Interpreted applications pin this complete
profile in both genesis and definition. Tests refuse changed sources with old
descriptors; interpretation changes get a new profile identity. S1's independent
vectors retain their original engine CID; see [source loading](definitions.md).

## Genesis and initial head

An app invitation pins `(app DID, genesis CID)`. The genesis record includes
that app DID, version 0, initial definition CID, runtime profile CID, sequencer
P-256 `did:key`, and explicit initial activation keys. It contains no initial
state: the referenced definition supplies that once. The creator acquires no
implicit permanent authority. Grant changes and key rotation are deferred.

Genesis is position zero. The initial head has `position:0` and `entry` equal
to the genesis CID. There is no position-zero entry. The first entry has
`position:1` and `prev` equal to the genesis CID. Entry record keys are positive
positions padded to 16 decimal digits, such as `0000000000000001`. Later heads
must point to an entry, and verification must reach the pinned genesis.

The invitation is the trust anchor. A PDS record signature does not replace
actor or sequencer proofs. Genesis needs no separate application signature:
its exact content is authenticated by the invitation CID. S2 must check the
requested app DID when provisioning/resolving it. A different genesis cannot
silently replace an existing invitation or cached anchor.

## Actor and sequencer proofs

An intent contains `$type:"test.atseq.defs#intent"`, version 0, app DID,
genesis link, definition link, actor key, nonce bytes, action Lexicon reference,
and an object payload. The actor signs the canonical bytes of this whole
object. A signed intent wraps it with `$type:"test.atseq.defs#signedIntent"`
and `sig`. Extra payload fields remain signed data; unknown framework fields
are rejected. The sequencer does not inspect application schemas, active
bindings, authorization rules, or effectiveness.

An entry contains `$type:"test.atseq.entry"`, version 0, app DID, genesis link,
position, predecessor link, complete signed intent, and sequencer key. Its
`sig` covers the canonical entry with only its own `sig` field omitted. The
nested actor signature is covered. Changing either domain identifier, target,
payload, definition, actor proof, position or predecessor invalidates a proof.

Both proofs use P-256, SHA-256, and low-S IEEE P1363 encoding: 32-byte unsigned
big-endian R followed by 32-byte S. High-S variants are rejected. Public keys
are canonical compressed P-256 multikeys in `did:key` form. A displayed actor
name is a local label, not verified atproto-account identity. `sign(data)` in
the [atcute crypto API](https://raw.githubusercontent.com/mary-ext/atcute/trunk/packages/utilities/crypto/README.md)
hashes internally. Atseq passes canonical bytes directly, with no second hash.

## Retry and history verification

The retry key is the tuple `(app DID, actor key, nonce bytes)`. It binds to the
CID of the unsigned intent. Two different valid ECDSA signatures over the same
intent resolve to the original receipt. Changed content with that same tuple
fails with `retry_conflict`. A canonical history containing the tuple twice
fails with `duplicate_retry`; a retry must never append a second entry.

`verifyHistory` receives an anchor, a chosen head and a complete prefix. It
verifies each actor and sequencer proof, sorts by signed position, checks exact
positions 1 through N, checks every predecessor CID, compares the final CID to
the chosen head, and rebuilds the retry index. Record/page arrival is irrelevant.
Missing records, duplicate/skipped positions and conflicting links fail. This
is full-prefix verification; incremental fetching and reconciliation are S2.
A chosen historical head is legitimate. Detecting a live server's rollback
requires comparing it to a retained known head, which S2 must preserve.

`sequence` constructs the next signed entry from a supplied verified head.
It does not persist, deduplicate or claim a writer lease. S2 must first verify
and reconcile the head/index, return an existing exact retry, otherwise use
one conditional PDS batch to create the entry and advance the head, and only
acknowledge confirmed persistence. These functions alone are not a sequencer
service and do not establish atomicity or crash recovery.

## XRPC surface and user-visible progress

The five method names above are fixed for the local spike. They use ordinary
Lexicon JSON/XRPC contracts, including the standard JSON representation for
bytes. `submit.block` carries the complete canonical signed-intent CBOR bytes.
The service must decode and verify those original bytes before storing them.
The unsigned outer HTTP JSON is not the signed object. This keeps duplicate
CBOR field and trailing-byte checks at the actual signed boundary.

`create.source` is a bounded source import (at most 512 KiB); its source-folder
format and retained closure are defined in S3. `activationKeys` makes the
initial grant explicit. Account credentials stay in the local provisioning
helper. `describe` returns the current definition and progress. `query` names
a declared query and carries JSON params in a string query parameter;
`receipt` addresses the unsigned intent CID.

Every successful method response carries the observed canonical head and the
interpretation frontier. A null frontier means no initialized projection is
available. An available query reports its exact frontier; a typed unavailable
result carries a reason. A pending receipt is distinct from effective or
ineffective. These contracts support the adopted UI sketches; this stage has
no new UI or persistence implementation. S2–S5 must implement the behavior and
must not present the head as an interpreted result.

## Verification

`npm run test:protocol` runs the same 80 fixtures in Node and Chromium. It
checks the independent CBOR/CID blocks and two distinct valid actor signatures,
then exercises mutation, malformed encoding, key/signature, retry, chain and
boundary cases. It also loads every framework Lexicon and validates the fixed
method contracts with the ecosystem validator. The gate never regenerates its
expected vectors.

[protocol-v0.json](../tests/vectors/protocol-v0.json) records the literal input,
CBOR hex, CID and SHA-256 for each vector. Its provenance names `@ipld/dag-cbor`
7.0.3, `multiformats` 9.9.0, and Node's OpenSSL ECDSA-SHA256 interface. The
[standalone writer](../scripts/vectors/generate.mjs) imports no Atseq or atcute
code. It uses explicitly public test scalars 1 and 2. Running it deliberately
creates new valid signature bytes, which must be reviewed as new evidence.
Tests also sign through the actual browser/Node runtime. Neither identity,
provisioning, replay performance nor production browser support is inferred
from these protocol checks.
