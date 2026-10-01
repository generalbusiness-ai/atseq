---
date: 2026-10-01
status: implemented; independent exact-head review pending
request: 00d3dcd5
baseline: cb3fd8472ccec1208b72e8adc81884ccfb1860d4
---

# Native repository proofs: implementation and results

Atseq now has reusable primitives for authenticating one native repository root
and looking up records under that root. This implements P1, following independent
decision assessment `06110ff6`. It supplies proof inputs for identity admission,
native ordering, incremental reads and archives. It does not implement those
higher-level protocols or establish that a repository root was current.

The [source](../src/protocol/native-proof.ts) exports `authenticateRepo`,
`VerifiedRepoBlocks`, `normalizeRepoSigningKey` and `assertAuthenticatedRepo`.
`authenticateRepo` requires the expected account DID and a previously trusted,
canonical signing `did:key`. The optional expected root binds a receipt or archive;
a primary `getRepo(since)` response instead selects its one authenticated CAR root.
The immutable capability exposes the signed DID, version, revision, MST root,
commit CID and signing key. Consumers enforce account observation policy,
repository revision floors and application predecessor/position floors separately.

A lookup returns authenticated raw record bytes and their CID, proven absence on
the searched path, or the CID of a missing required block. Corruption, malformed
encountered structure, wrong expected CIDs and exhausted budgets throw. Atseq
records must subsequently pass `decodeBlock`: membership cannot bypass its
64 KiB and depth-32 limits. A shared Node/Chromium case demonstrates a 70 KiB
native record whose membership is valid and whose Atseq decoding is refused.

## Verification and retention

A CAR is bounded before copying or decoding, then indexed and block-hashed once.
The native commit is authenticated once. Repeated lookups reuse that index, rather
than invoking the upstream convenience verifier on the entire export for every
record. Maintained [atcute repository](https://github.com/mary-ext/atcute/tree/trunk/packages/utilities/repo)
and [MST](https://github.com/mary-ext/atcute/tree/trunk/packages/utilities/mst)
primitives supply commit validation and tree traversal. Atseq adds explicit DID,
key, root, framing and resource checks; it does not implement another MST.
Upstream `NodeStore` also hashes/deserializes loaded nodes: this implementation
accepts that additional path work and does not claim exactly one hash of each
node across all lookups.

On each searched path, upstream node decoding checks optimal prefixes, strictly
sorted keys and equal SHA-256 key layers. Unknown node/entry fields are refused. Its untrusted walker checks descending
child layers. Atseq additionally checks every visited frame's key interval and
traversal budgets. An empty node is accepted only as the selected data root; a
non-root empty node must use the canonical null link. `validateTree` applies those checks to the whole tree and
requires every referenced record block. Signed hostile fixtures test mixed key
layers, unordered keys, wrong child layers and overlapping child intervals in
both sparse and full-tree modes. Sparse membership or exclusion says nothing
about unvisited branches' canonicality. A later encountered structural fault
rejects that root; the primitive does not certify unseen whole-tree validity.
These rules follow the [repository specification](https://atproto.com/specs/repository).

The cache owns copied block bytes and exposes neither a mutable block map nor
upstream node objects. Returned bytes are copies. Admission verifies the complete
supplied CAR and the signature before a synchronous cache transaction; failed
or individually oversized admission does not evict existing evidence. Content is
reused only by CID. LRU eviction makes older capabilities report missing evidence;
it cannot turn an unfetched or evicted node into proven absence. A full export
can restore the missing blocks without silently changing the capability's root.

These are operator budgets, not protocol maxima:

| Resource | Default |
| --- | --- |
| CAR | 32 MiB; 100,000 blocks |
| Individual block / CAR header | 1 MiB / 16 KiB |
| General native CBOR nesting | 64 |
| MST entries per node | 4,096 |
| Node loads per path / full audit | 64 / 100,000 |
| Path length | 1,024 characters |
| Portable/browser retained cache | 16 MiB; 50,000 blocks |
| Explicit host retained cache preset | 128 MiB; 400,000 blocks |

All configured budgets must be positive safe integers. Native proofs require
exactly one CAR root, canonical CBOR/SHA-256 CIDs, a native v3 commit, a canonical
TID revision and a 64-byte compact, low-S signature. Both supported curves are
tested. Account resolution, currentness, rotation observation and archive trust
anchors belong to I1/N1; an arbitrary supplied DID document is never trusted here.

## Large reference-PDS evidence

The [capture](../experiments/post-spike-evidence/2026-10-01/native-proofs/pds-results.json)
uses the official disposable PDS 0.5.31 with local mock PLC. Each initial map has
1,000 or 10,000 existing probe entries plus one head record. Deltas add exactly
1 or 100 entries and replace the head; both use the retained initial revision.
The runner uses `applyWrites` for fixture construction. These are public synthetic
map records, not the final Atseq ordering wire contract or a claim of batched
application intent processing.

| Existing entries | New entries | Diff CAR bytes | Current full CAR bytes | Diff/full | Full audit nodes |
| --- | --- | --- | --- | --- | --- |
| 1,000 | 1 | 4,042 | 232,825 | 1.74% | 268 |
| 1,000 | 100 | 26,854 | 255,637 | 10.50% | 293 |
| 10,000 | 1 | 3,250 | 2,330,500 | 0.14% | 2,726 |
| 10,000 | 100 | 27,456 | 2,354,706 | 1.17% | 2,763 |

All four cases authenticate the new entries and head under one selected native
root using the diff and retained verified blocks. Each full tree has the expected
record count. An old path fails with a missing MST-node CID when only the diff is
available, succeeds with retained blocks, and fails again when that needed node
is deliberately omitted from the retained cache. Importing the full export at
the same selected root restores it. Every retained public CAR was also
[reverified after the independent review corrections](../experiments/post-spike-evidence/2026-10-01/native-proofs/reverified-review.json).
The historical reverification file remains intact; its scope text incorrectly
said 31 corpus cases where the associated capture contained 33. The successor
records that correction, hashes the original capture and all ten CAR inputs,
and records the current 41-case shared Node/Chromium corpus.
This establishes that a real partial diff over a large existing map suffices
with retained blocks; the earlier three-record probe could not establish that.

Whole-probe peak RSS was 322,944 KiB (about 315 MiB), measured with
`process.resourceUsage().maxRSS`. This includes the runner's setup, local mock PLC,
all four cases, CAR captures and diagnostic indexes. It excludes the child PDS
process and is not a proof-only memory measurement. The 10k/100 retained raw-block
cache held 1,868,613 bytes in 12,874 blocks. Those numbers describe different
resources; the cache byte limit is not a process-RSS limit. Concurrent correctness
work may have run, so this report makes no uncontended timing or throughput claim.
P0/E1 still owe performance characterization of the complete native application.

Reproduce with:

```sh
npm ci
npm ci --prefix tests/support/pds
node scripts/source-run.mjs scripts/native-proof-pds.ts
```

The exact disposable PDS lock SHA-256 is
`227b88499a22dffc15fcdc4aed0f6ee81fcfc11531ee2e2c8de49c991175ee41`.
Raw public CARs are generated under `experiments/generated/native-proof/pds/`.
Their paths, roots, DIDs, trusted public keys, byte counts and hashes are in the
capture. The compressed public-input attachment prepared for gitseq is
`.atseq-local/native-proof-public-inputs.json.gz`, 2,987,098 bytes, SHA-256
`f65d5d67e14dad3e6072734d4f86149ecd6975ff842a14a204ac04c7c1f72cc5`.
It includes exact CAR bytes, result JSON and source hashes, with no account tokens,
passwords or private keys. The parent delivery records its durable attachment.

## Integration with the reviewed fixture patches

The candidate was rebased onto `66977be7e59527eccf3df91c55285e55914f3add`.
The original four-case capture and equivalence evidence retain their original
baseline and lock hashes. After installing the six independently reviewed MF1
fixture patches, this command passed the same native proof/recovery checks over
100 existing entries and a one-entry delta:

```sh
node scripts/source-run.mjs scripts/native-proof-pds.ts --smoke
```

The [integration smoke](../experiments/post-spike-evidence/2026-10-01/native-proofs/integration-smoke.json)
authenticates 102 records and 25 MST nodes, with a 1,388-byte diff versus a
23,556-byte current full export. Deliberate missing-node detection and full-export
recovery pass. Its fixture lock hash is
`762b412e3aa383b3e094bc1d2f6a0cc4389df7444ef0726f693cb026788b3dcd`.
`--smoke` writes separately, preserving the original large-repository captures.
`npm run check` passes on the rebased candidate. This is bounded integration
confirmation, not a repeated 10k benchmark or a claim that the original capture
used the patched fixture.

## Keys, dependencies and equivalent existing behavior

Legacy uncompressed K-256 keys are validated and compressed with maintained Noble
curve code. Canonical multicodec/base58 encoding uses maintained atcute multibase.
This small formatting step avoids an upstream atcute 2.4.4 Node export limitation:
its `exportPublicKey` assumes an uncompressed OpenSSL SPKI point even after a
compressed-key import. P-256 uses the existing atcute/WebCrypto importer/exporter.
Both legacy forms are cross-checked against the reference `formatDidKey` and
shared Node-produced signed CAR fixtures execute in Chromium. Off-curve points,
wrong key lengths, noncanonical retained encodings, high-S and noncompact
signatures are refused. Normalizing representation confers no account authority.

Direct dependency pins add repo 1.1.0 and MST 1.1.1. Their declared minimums require
CAR 6.1.0, CBOR 2.3.8 and CID 2.5.0; their closure requires uint8array 1.2.0.
These are the only four existing runtime package version changes. Eight runtime
packages are added, from 127 to 135: repo, MST, atcute lexicons/util-text, the latter's
nested unicode-segmenter, oomfware/eval, standard-schema/spec and esm-env.
Noble secp256k1 3.2.0, multibase 1.2.5 and varint 2.0.2 are promoted from the already
locked closure to direct pins for the APIs used here. The proposal's 3.1.0/2.0.1
minimum examples were corrected to preserve these existing versions.

Dependency metadata and installed file hashes are regenerated; the semantic
contracts and independent vector files remain byte-identical to `cb3fd847`.
The [equivalence manifest](../experiments/post-spike-evidence/2026-10-01/native-proofs/equivalence.json)
retains baseline hashes and profile CIDs. The dependency update does not activate
native ordering or alter the v1 interpretation contract. B0's separately reviewed
service/profile advance must be retained when this work is integrated; P1 does
not predeclare it on the unchanged baseline.

An initial packed-consumer run found that `npm install` expanded
`bundleDependencies: true` into the original dependency list before adding new
packages. Restoring the intended `true` and regenerating lock bundling metadata
ships the new closure. The fresh compiled-package consumer then passed. There is
no extra lexicons direct pin or unrelated dependency upgrade to disguise that fix.

The original standalone minified browser proof bundle was 405,187 JavaScript bytes before
compression, including Atseq's existing dependency-provenance checking metadata.
The original hostile-corpus bundle also includes fixture construction and was 435,514 bytes.
After the review corrections, the [standalone bundle](../experiments/post-spike-evidence/2026-10-01/native-proofs/library-bundle-review.json)
is 407,296 bytes and the [corpus bundle](../experiments/post-spike-evidence/2026-10-01/native-proofs/browser-review-results.json)
is 439,031 bytes.
These are measured bundles, not upstream package-size estimates. The earlier
37,632-byte upstream-only probe bundle excluded the Atseq wrapper and its
provenance boundary; it is not this implementation's footprint. Downstream P2/E1
should measure incremental cost in the final application bundle and reuse shared
metadata, rather than claim this whole standalone size is a new application cost.

## Validation and recommendations

The original candidate capture passed 354 tests and 33 native corpus cases.
Independent assessment `7f26f640` reproduced an intermittent packed-consumer
cancellation, accepted an empty non-root MST node, and found that maintained
reader/walker structural errors could escape as temporary runtime faults.

The [stdin correction](2026-10-01-atseq-integrity-stdin.md) drains the resolver
child's UTF-8 stdin asynchronously. Its production-path regression completes
twenty batches of a 552,961-byte dependency graph, checking both resolutions for
all 4,096 edges per batch. The native wrapper now rejects empty non-root nodes
and maps known bounded CAR/CBOR/MST structural failures to `ProtocolError(input)`.
Missing blocks still report missing evidence; a synthetic unexpected walker
fault retains its original identity. Sparse lookup and full-tree validation use
the same checks. New cases also retain acceptance of a canonical empty root.

The [combined successor validation](../experiments/post-spike-evidence/2026-10-01/native-proofs/review-validation.json)
passes all 355 tests, with zero failures, cancellations or skipped tests, on
Node 26.10.0, macOS arm64. Build, formatting, source-layer and dependency checks
pass. The unchanged [protocol](../experiments/post-spike-evidence/2026-10-01/native-proofs/protocol-review-results.json),
[runtime](../experiments/post-spike-evidence/2026-10-01/native-proofs/runtime-review-results.json) and
[evolution](../experiments/post-spike-evidence/2026-10-01/native-proofs/evolution-runtime-review-results.json)
vectors pass in Node and Chromium; the fresh
[compiled-package consumer](../experiments/post-spike-evidence/2026-10-01/native-proofs/package-review-conformance.json)
passes. Both native runtimes pass the same 41 named cases. The retained four
large-repository cases pass without reseeding a PDS, including all new entries,
old retained paths, standalone full-tree validation, diff-only missingness,
deliberate omission and same-root full-export recovery. Run that successor with:

```sh
node scripts/source-run.mjs scripts/reverify-native-proof.ts
```

It requires the retained public CARs under `experiments/generated/native-proof/pds/`
and a current Chromium corpus capture. It writes a separate successor and never
changes the historical capture. No live provider, key rotation/recovery,
application-chain floor or final native checkpoint case is claimed by these tests.

Prefer one authenticated `getRepo(since)` root with retained blocks for P2.
Missing evidence should trigger same-root full-export recovery; corruption or
encountered noncanonical placement should reject the root. Keep receipts and
archives explicitly bound to their selected root and trust evidence. Keep
identity currentness outside this proof capability, and feed every Atseq record
through the existing strict decoder. The measured partial-diff sizes support
this simpler native path without an additional Merkle-tree design. Independent
exact-head review and the normal gitseq merge gate remain required before landing.
