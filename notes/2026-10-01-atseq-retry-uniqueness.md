---
date: 2026-10-01
status: independently adopted direction; native wire and checkpoint costs pending
examined_at: 66977be7e59527eccf3df91c55285e55914f3add
request: 2ba34dc6
---

# Retry uniqueness and retained receipts

Prefer a fresh random nonce for each newly signed request, with no counter
allocation or mandatory arrival order. Keep a complete local retry/receipt index
at the ordering host. Offer full prior retry-state loading to a reader that wants
to check suffix uniqueness immediately, or explicit deferred historical audit
to a reader that accepts checkpoint authority for that part of verification.
Do not add a lazy authenticated retry tree unless measured checkpoint costs make
both paths insufficient for an actual deployment.

Independent assessment `b4403ae5` accepted random nonces, unsigned-content equality
and full-or-deferred audit, and required the signer namespace correction below.
This is not a completed R0 measurement programme or an implemented native protocol.
The small experiment below tests
isolated semantic models and serialized JSON sizes. It does not measure native
proofs, portable checkpoints or running Atseq behavior.

The [native authority decision](2026-10-01-atseq-native-authority-decision.md),
[identity direction](2026-10-01-atseq-identity.md) and
[activation decision](2026-10-01-atseq-activation-compatibility.md) supply the
boundaries: the app PDS may construct another ordering; account grants and actor
signatures remain independently checked; recorded authority and execution
contracts determine effectiveness at each position. A retry never repeats that
position's action or silently updates its consent.

Corrected independent assessment `981bbcd7` accepts the signer-key namespace and exact-content-first lookup below. Its full assessment was originally misbound as `a9a8c63c`; the corrected filing binds that decision to R0. Native integration and cost gates remain open.

## Adopted identity and equality

For every actor-signed request, use the retry identity
`(app DID, genesis CID, canonical signer key, nonce)`. The signature authenticates
this namespace without replaying authority. Account and app-control entry kinds
share this rule; their type and authority claims remain signed content.
Generate exactly 16 nonce bytes with a cryptographic random generator once,
before signing, and persist the original signed work for offline resubmission.
Reject any other nonce length structurally. Require one canonical key encoding
(reviewed compressed-point did:key multikey form) and strict canonical unsigned
intent decoding, so another encoding cannot split one key across namespaces.
The nonce is opaque. It does not encode a timestamp, account epoch, device number,
application position or ATproto revision.

Do not put claimed principal, grant ID, account epoch, entry type, action or
execution contract in the uniqueness identity. Put them in signed content.
Changing any of those fields under the same signer and nonce conflicts. A nonce
reused under a different key is a new, separately evaluated intent; protocol
uniqueness does not protect against that misuse. The normative client rule is:
never re-sign queued work, and use explicit new consent, a fresh nonce and a new
signature for every replacement. Rotation or renewal never silently upgrades
queued consent. N1/I2 own the final versioned encoding and entry-type distinctions.
Proof-derived grant/revoke/reset imports have their immutable authority-transition
identities and I2 idempotency rules; this proposal does not convert them into
ordinary actor actions or let an actor nonce authorize them.

The earlier principal namespace was unsafe: an unrelated key could see a victim's
nonce, sign different work claiming the victim principal, and consume that
principal's identity through an ineffective entry. This was front-running, not
random guessing. An unadmitted, wrong-principal, expired or revoked key can now
consume only its own namespace. A signature forged under the victim's declared
key is structurally invalid and consumes nothing. A compromised copy of the
victim key can still conflict within that key's namespace; this rule does not
undo key compromise.

Equality means the same canonical **unsigned intent bytes**, represented by their
verified content CID. It includes every signed field: app/genesis, semantic
profile, entry type, principal, signer, exact grant reference, execution/source expectation,
action, payload and nonce. Valid alternative signatures over those same bytes
are the same intent; signature bytes and delivery proof packaging are not a new
transport identity. Incoming actor signatures still need validation. If a proof
or policy reference is itself a signed field, changing it changes the intent.

The original entry fixes the receipt's intent CID, position and entry CID.
Returning it after expiry, revocation, epoch reset or activation adds no act and
does not evaluate the request again. The receipt proves ordering/publication;
the original deterministic outcome is separate. If interpretation is stalled or
its outcome is unavailable, say so rather than claiming a domain success.

After structural and signature validation, lookup order is fixed: find the exact
unsigned intent CID and return its original receipt if found; otherwise look up
the signer-plus-nonce identity and report a conflict if found; otherwise append.
Preserve the first stored signature. Both access paths are needed: CID-only
lookup misses different content under one nonce, while the tuple catches a second
encoding if strict decoding ever incorrectly admits it. Canonical decoding and
key normalization are mandatory wire gates, not optional index behavior.

Every structurally valid ordered actor request consumes its retry identity,
including ineffective work. A second entry with that identity makes history
invalid even if its content is identical or its authority is revoked. A
pre-order transport refusal consumes no global identity and is not a replicated
outcome. Cancelling a local draft does not undo a recorded action.

## Why counters remain an alternative, rather than the default

For comparison, a counter belongs to one immutable grant or app-control
appointment, scoped to app/genesis and its authenticated party. It starts at 1.
A fresh grant/appointment gets a fresh namespace; routine account repo-key/PDS
changes do not reset an existing grant. Never use JavaScript floating-point
increments beyond the supported integer range; exhaustion needs a fresh binding,
not wraparound. N1 would have to fix the exact bound if this option were selected.

| Option                             | Duplicate-prevention state             | Offline and concurrency consequences                                                                                                                                                                        |
| ---------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Random signer nonce                | One identity per ordered request       | Independent devices issue without an allocator. Arrival order has no nonce constraint. A deliberate or accidental collision under the same key conflicts.                                                   |
| Strictly consecutive grant counter | One high-water mark per retained grant | Cancelled drafts leave a gap. Higher work cannot pass missing lower work without a new skip/cancellation protocol. Concurrent copies of one grant can allocate the same number.                             |
| Strictly increasing grant counter  | One high-water mark per retained grant | Allows cancellation gaps, but ordering 9 before unrecorded 8 permanently prevents 8 from being ordered in that namespace. Offline batches can therefore strand authentic work. Cloned grants still collide. |

Counters can work well when a grant has one durable allocator and callers accept
those ordering constraints. Separate device grants avoid sharing that allocator,
but increase the retained namespace count. Cloning a key and its grant clones its
counter state; a restart from an old device backup does not know the current mark
while offline. A random nonce also cannot stop a malicious clone deliberately
reusing a known token, but ordinary allocation needs no shared mutable state.

Both counter designs still need authenticated old content and receipts. A mark
of 100 proves neither what counter 7 contained nor whether 7 ever existed when
gaps are allowed. An exact old retry must return its old receipt; different
content at that identity must conflict. If the original evidence is unavailable,
the answer is unavailable, not a guessed match or a fabricated conflict. A lower
unused increasing counter is stale, not an existing receipt. A writer may refuse
it; inserting it into a history whose structural rule requires increasing
counters would invalidate that history.

Retired grants still matter. Revoked but authentic ordered work is ineffective,
not structurally absent, and its duplicates must remain detectable. Dropping
old marks merely because a grant is revoked would require another reviewed rule
or retained evidence. Many one-use grants make the number of marks approach N;
authority tombstones and original receipt storage remain additional costs.

The independently assessed choice is therefore partly semantic, not an elapsed-time contest. Counters
buy smaller prevention state when grants are reused, at the cost of allocation
and delivery constraints. There is no demonstrated requirement for those
constraints here. Preserve offline independent issuance unless measured costs
and a concrete use case justify trading it away.

## Writer, reset and activation races

| Situation                                                                                                  | Required result under the proposed nonce contract                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two deliveries carry the same unsigned intent, with the same or different valid signatures                 | One entry. The later delivery returns its original receipt.                                                                                                                                      |
| Two devices use distinct nonces for separate requests                                                      | Both may be ordered without shared allocation; their domain outcomes still depend on ordered state.                                                                                              |
| A clone of the same signer uses a known nonce with different payload, principal, grant or entry type       | First recorded content fixes the identity; later submission conflicts. It is not a second ineffective entry.                                                                                     |
| An unrelated, wrong-principal, unadmitted or revoked key front-runs a victim's nonce                       | Its authentic ineffective entry consumes only its own key's namespace. The victim request can still order. Forging the victim key's signature is invalid.                                        |
| First write commits but its response is lost                                                               | Refresh native state and find the exact original entry. Never generate a fresh nonce automatically.                                                                                              |
| Crash occurs after PDS commit but before local retry-row persistence                                       | Reconcile the native suffix and reconstruct the row before accepting new writes. A missing local row does not prove a new nonce.                                                                 |
| Two writers build from the same selected root                                                              | Use `applyWrites` with `swapCommit`. After one wins, the loser refreshes the root/history and repeats lookup. Identical requests return one receipt; distinct requests can append after refresh. |
| CAS fails because an authority change or activation won first                                              | Re-read ordered authority/definition and recompute eligibility/outcome using the original bytes. Never re-sign, change contract/grant or invent a new nonce.                                     |
| Grant revoke/reset precedes an unrecorded offline action                                                   | Transport may refuse it, or authentic ordered work is ineffective under the recorded authority. An earlier signing time proves no continuing authority.                                          |
| Reset or revoke follows an already recorded action                                                         | Retry returns the old receipt/outcome. Historical effectiveness is not recomputed under the new epoch.                                                                                           |
| Renewal changes the grant under the same signer and a caller reuses its nonce                              | Different intent content conflicts if that nonce was recorded. An explicit replacement uses a fresh nonce.                                                                                       |
| Rotation/renewal changes signer and a caller reuses a nonce                                                | This is a new separately evaluated intent, not a retry conflict. The client must never re-sign queued work; an explicit replacement always uses a fresh nonce.                                   |
| View/query/unrelated-action activation leaves this action's execution contract unchanged                   | Original queued bytes remain eligible under current grant/state rules.                                                                                                                           |
| This action's execution contract changes, it is removed, or an activation's exact expected source is stale | Ordered authentic work is ineffective under C0; replacement is explicit. An exact previously recorded retry still returns its old outcome.                                                       |
| Required original receipt/path/identity evidence cannot be obtained                                        | Recover or return unavailable. Do not append another entry merely because a lookup failed.                                                                                                       |
| Selected complete proof package establishes absence of a protocol-required record                          | Invalid proof/history package; a missing cache block alone establishes no absence.                                                                                                               |
| PDS presents another ordering or deletes/rewrites index records                                            | Retained chain floors and audited indexes detect encountered contradictions. A fresh checkpoint-trusting reader cannot claim global non-equivocation.                                            |

The native atomic write contains the new entry and head. The host's local index
is derived from confirmed native history; it is not another ordering authority.
It cannot be committed atomically with a remote PDS. P3 must persist one coherent
local root/frontier/index/state snapshot and replay a confirmed suffix after a
crash. A provisional local reservation can coordinate a process, but cannot
replace native CAS or count as a durable global retry decision.

ATproto repositories are mutable authenticated maps. Their roots authenticate
record membership, not an immutable application ordering or complete receipt
index. The [repository specification](https://atproto.com/specs/repository),
[sync specification](https://atproto.com/specs/sync) and
[applyWrites Lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/repo/applyWrites.json)
provide the native structures and CAS boundary; Atseq still supplies chain,
retry and authority rules.

## Index and bootstrap paths

**Ordering host:** retain a complete local index from verified history, keyed by
`(app, genesis, canonical signer key, nonce)` and pointing to original intent CID,
position and entry CID. Exact intent-CID lookup runs before signer-plus-nonce
conflict lookup. Both are derived access paths into the same confirmed history.
Preserve exact
unsigned content, ordered entries and evidence for receipt proofs. Never delete
rows on activation, renewal, revocation, outcome failure or local outbox removal.
An untrusted or incomplete restore must be recovered before appending blindly.

**Full prior prevention state:** a checkpoint may carry a complete retry table
or a projection containing all consumed tuples. Checking this table's digest and
certification authenticates an assertion of completeness. Replay establishes
that assertion independently. Once accepted at a specified frontier, combine
the table with every verified suffix insertion and detect duplicate tuples.
Original receipts can be retained separately and fetched selectively; a set of
tuples alone never answers a content-conflict query.

**Deferred audit:** a reader may accept the designated checkpoint authority and
ordering service for prior/future cross-prefix uniqueness while loading state
and a verified suffix. It still verifies actor/native proofs, chain extension,
known floors and duplicates among the suffix entries and prior tuples it already
retained. Expose that prior
retry completeness has not been independently audited. A retained membership
proof for a receipt does not discharge global uniqueness. Later full replay
upgrades the assurance or finds a contradiction; it must not silently overwrite
a newer retained local floor or falsely label an earlier result fully replayed.

**Lazy authenticated lookup, deferred:** if the first two paths prove inadequate,
use ordinary native records keyed by a digest of the signer/nonce tuple including
app/genesis, with the
tuple and original receipt pointer in the value. Check tuple equality to catch
a mismatched value or digest collision. Atomically publish entry, index insertion
and head; validate every update and retain required historical MST blocks. A
checkpoint must separately certify index completeness. Native membership or
absence at a later mutable root is not proof about the checkpoint's index.
The [getRecord Lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/sync/getRecord.json)
has no historical-root selection parameter. Missing historical path blocks
require recovery or unavailability. Use P1's maintained native primitives; do
not add another Merkle tree or accumulator speculatively.

Outcome history need not be loaded into every state checkpoint. Keep original
outcomes available for selective retrieval or recomputation during audit. An
authenticated asserted outcome is not independently executed merely because
its record has a native proof. R1/P3/P4 own physical persistence and certification
formats after the reviewed decision; this note does not prescribe a new public
native index before the need is measured.

## Isolated model evidence

The [probe](../experiments/retry-uniqueness-probe.mjs) ran successfully with
**40 model checks and 12 storage cases**. Reproduce with
`node experiments/retry-uniqueness-probe.mjs`. The immutable
[successor result](../experiments/post-spike-evidence/2026-10-01/retry-uniqueness-signer-model.json)
retains its source hash, Node version and explicit limitations.
The [original principal model](../experiments/post-spike-evidence/2026-10-01/retry-uniqueness-model.json)
is preserved unchanged as pre-correction evidence from commit `f8118814`; its
33 passing checks did not test the unsafe namespace. The successor records that
capture's hash, old source hash and reviewer assessment as explicit provenance.

Checks cover exact/changed-content retries, unavailable old evidence, an arbitrary
old token below the newest mark, clone conflicts, cancellation gaps, reordering,
ineffective duplicate detection, distinct genesis namespaces, grant renewal and
independent device grants, unrelated/wrong-principal/unadmitted/revoked front-running,
same-key grant renewal, shared account/control uniqueness and exact nonce-fixture
length. Authority is an input flag in this model; it does not
implement grants, epochs, C0 activation, signatures, canonical real signer-key
encoding or native CAS. Nonce tests use sixteen-byte hex fixtures rather than
the final binary wire decoder. Different valid
signature delivery and crash/CAS cases above are design requirements, not claimed
executed tests of this probe.

For 10,000 actions, compact JSON prevention rows with app/genesis shared outside
the rows produced these illustrative sizes:

| Grant pattern                                  | Nonce rows | Counter marks retained | Nonce JSON bytes | Counter JSON bytes |
| ---------------------------------------------- | ---------: | ---------------------: | ---------------: | -----------------: |
| One long-lived grant                           |     10,000 |                      1 |          450,001 |                 84 |
| Sixteen long-lived grants                      |     10,000 |                     16 |          453,751 |              1,303 |
| One hundred grants; 99 retired                 |     10,000 |                    100 |          459,001 |              8,191 |
| One-use grant/signer per action; 9,999 retired |     10,000 |                 10,000 |          478,891 |            818,891 |

Both receipt indexes still contain 10,000 records in every case. Raw results
also include repeated full-scope JSON sizes and receipt-row serialization sizes.
JSON escaping, repeated identifiers and synthetic hash widths affect those byte
counts, including the different lengths of synthetic signer labels; they are
not production encoding, proof or database sizes, nor a claim
that one representation always stores receipts more efficiently. Grant/epoch
state, native evidence, compression and database overhead are excluded. No
latency, heap, browser transfer or checkpoint verification timing was measured.

## Evidence needed before completing R0

P0/E1 should capture actual supported checkpoint/index encodings for N=100,
1,000 and 10,000 with one/sixteen long-lived grants, many retired grants and
one-use grants. Separate prevention state, receipt pointers, authority tombstones,
outcomes and native proof bytes. Measure cold decode/validation/copy/heap and
browser transfer/persistence, not just a JSON length. Include receipt lookups
for oldest/middle/latest original and conflicting content after a restart.

Compare full prevention-table loading with explicit deferred audit under the
same trust policy. Measure counter variants further only if prevention-table
loading is the binding cost for a concrete deployment. Those prototypes must
retain the original receipt index and report allocator persistence/concurrency,
cancellation and stranded out-of-order work. Do not count only live signers or
claim high-water marks replace history. Native proof-serving/index experiments
are needed only if the first paths
do not meet a stated deployment need; there is no fixed performance target.

Independent assessment `b4403ae5` selected the signer namespace, unsigned-content
equality, ineffective-work consumption and assurance disclosures; this revision
implements that correction in the proposal and model. Before R1/N1 wire
implementation, N1/I2 must agree final entry kinds, grant/principal derivation,
canonical key and unsigned-intent encodings, strict 16-byte nonces, the normative
client replacement rule and authority-import idempotency.
Implementation must then test the complete race table against actual native
ordering, browser outbox, durable restart and checkpoints, including unrelated-key
and wrong-principal-grant front-running. This preparatory note
does not satisfy those remaining measurement and conformance conditions.
