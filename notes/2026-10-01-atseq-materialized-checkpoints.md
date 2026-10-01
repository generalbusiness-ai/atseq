---
date: 2026-10-01
status: independently reviewed; restore clarifications adopted; exact P4 bytes and implementation open
examined_at: bcc9c92cf194b27f23f0b347ef67e6c707b8a978
requests:
  - bf870fc6d775c9392dda46c36828f12635cc6280
  - 1f13a0dcbbae3fd55a08049416ef16175a66c72d
promises:
  - f067a6bd65465e36e1b8b5b24fb2e77e4cec6726
  - 75852b84bcbd905e954b3fb8a81fc9a425b41b68
---

# Materialized state, suffix verification and checkpoint audit

Persist one coherent local materialization, restore it through an explicit
trusted-storage verifier, and extend it with the native reader's verified suffix.
For a new reader, allow an authenticated app-authority assertion to supply early
state, with its assurance stated explicitly. Independent replay from genesis is
a separate audit of that assertion. Neither path needs another Merkle tree.

P3 owns local durable materialization and restore. P4 owns portable checkpoint
publication, early assertion acceptance and independent audit. This proposal
joins their boundaries without claiming either implementation is complete. It
does not change runtime, wire schemas, descriptors, dependencies or evaluator
semantics. No tests or performance experiments were run for it.

## Evidence and source basis

The inspected source is published main at the full `examined_at` commit above.
Relevant code is [Folder](../src/application/folder.ts),
[host application](../src/host/application.ts),
[writer lease](../src/host/lease.ts),
[history and retry verifier](../src/protocol/log.ts),
[browser evaluator](../src/browser/evaluator.ts),
[archive reader](../src/archive/archive.ts),
[Node integrity adapter](../src/integrity/node.ts),
[browser integrity adapter](../src/integrity/browser.ts) and
[build provenance generator](../scripts/build.mjs).

The corrected P2 reader proposal was inspected at
`c80eaeed9fd6f864923c70768ae0ab70abe6a8bd`, adopting assessment
`f48d15409da9b841892d54362677499c8fb76804`, and its selected-root wording
successor at `2d831d0a69278161894a58c91186a84a4bad8b75`.
The coordinated NW0 proposal is
`notes/2026-10-01-atseq-native-wire-contract.md` at
`10e656b3594e41cfa096c03e390cc721776cf57e`, successor to inspected `dff4b617`
with recovery above governance and the exact five-field fold metadata
`app/genesis/position/principal/execution`. Root has since confirmed that corrected
D5 and NW0-3 are ratified. Its owner
confirmed that `certify` is reserved but enables no operation before P4 review.
Final field names, closed unions and canonical checkpoint bytes require the
coordinated NW0/P4 review; this note fixes responsibilities and trust choices.

Ratified independent review `0412eb82bd82f1b0aad682dfe73acc108bb87d47`
accepted this preparation and recommended P34-1's reviewed cross-build equivalence
route. This successor adopts that route, bounded referenced-generation retention
and the uncompromised-origin browser trust clarification. P3 and P4 implementation
remain open; the separate exact P4 policy proposal still needs review.

The existing Folder can fold a verified tail, but its optional persistence
callback receives a copied full projection. That copy omits the verified prefix,
retry index, pending tail and coherent restore authority. The host opens Folder
without that callback. The SQLite writer lease stores a last-observed head and
explicitly does not store application state. Browser worker recovery replays
retained inputs rather than restoring a durable verified capability. These paths
do not already implement the proposed checkpoint contract.

The published [P0 baseline](2026-10-01-atseq-performance-baseline-results.md)
and [dimensions report](2026-10-01-atseq-performance-dimensions-results.md)
show different costs. At 10,000 old-wire entries, full catch-up rechecks 20,000
signatures and takes about 6.2 seconds. Already verified delta-zero/one
interpretation still takes about 5 ms and copies a 2.21 MB projection dominated by
outcomes. A growing-state 10,000-action workload takes about 186 seconds to
interpret; a checkpoint does not make its next complete-state fold cheap.
The roughly 273-byte SQLite lease write is a different operation from full
projection persistence. These are retained baseline results, not forecasts for
P3/P4 or the native successor.

## Three distinct frontiers

Keep NW0/P2's distinctions rather than introducing another cursor union:

| Fact | Meaning |
| --- | --- |
| Native root/revision | Account-wide authenticated observation and advisory fetch cursor; it is not an app acceptance floor. |
| Accepted app floor / verified head | Exact position and entry CID for this `(app DID, genesis CID)`, with declared prefix verification and duplicate coverage. |
| Interpreted frontier | Exact position and entry CID whose state, source, authority and outcomes have committed together. It may lag the verified head. |

The highest retained app floor cannot be replaced by an older checkpoint.
Participant admission floors belong to I2 and retain its explicit recovery
exception; they are not interchangeable with the app floor. Multiple apps in one
account may share native blocks and binding evidence, but must retain separate
genesis-scoped floors, retries, authority and state. A lower native revision or
equal revision with another root triggers P2 recovery under accepted I1 binding;
it does not automatically reject a preserved app prefix or erase another app's
floor.

## P3: one local transaction

Use the existing storage families: a host SQLite transaction and a browser
IndexedDB transaction. Do not first add a portable checkpoint record as the
host's persistence mechanism. A single committed generation names all local
components; readers see either the prior complete generation or its successor.
Storage schema version is separate from app semantics and installed build
provenance. A storage migration cannot reinterpret signed protocol bytes.

The transaction retains these logical components:

| Component | Required content and frontier |
| --- | --- |
| Pin and implementation | App DID, genesis CID, exact supported semantic/observation policy identities and actual trusted source/build/dependency provenance. Service-schema version does not redefine app consent. |
| Verified prefix | Exact verified head, chain CID references and all accepted R0 unsigned-intent-CID / canonical-signer-plus-nonce rows, with original position/entry pointers; complete consumed-observation descriptor identities through that head. |
| Interpreted state | Exact frontier, complete domain state, active definition/source closure and I2 authority at that frontier. |
| Authority | Control tip and appointed powers, owner and role assignment revisions, current and retired principal epoch anchors, accepted participant observations/floors, immutable admitted grants and terminal tombstones. Retain data, not just an unusable digest. |
| Interpretation results | Available outcomes keyed by their actual ordered positions, with explicit coverage; exact stalled entry/reason and verified but uninterpreted tail. |
| Evidence and floors | Exact entry/request/source/observation bytes, necessary native proof and binding evidence, every known app floor, and receipt/outbox references which establish a newer confirmed floor. |

Keep duplicate prevention through the verified head distinct from effective
authority through the interpreted frontier. An unavailable activation or
authority operation may leave these frontiers different. Its retry or descriptor
identity is already consumed by valid ordered history; that does not imply its
authority effect was executed. The pending tail must resume at the exact same
entry after recovery.

Content-addressed immutable blocks may be staged before the transaction. Their
existence confers no authority. Commit references only after checking exact bytes
and required availability; garbage collection must preserve every still-referenced
generation, pending audit/export and retained receipt proof. Keep the current
generation and one previous complete generation by default; separately referenced
audit/export generations consume a configured bounded retention budget. Release
unreferenced generations before staging more, or return unavailable when active
references prevent staying within the budget. Retained receipt proofs need their
exact evidence, not indefinite retention of every full state generation. Shared evictable
native fetch caches are separate from pinned archive evidence. Eviction can make
an operation unavailable, never lower a trust floor.

Append index and outcome rows rather than serializing all old rows for every
action. First restoration may load and validate the complete retry and
consumed-descriptor indexes in bounded batches: this is explicitly O(N) work,
without old signature checks or domain folding. It is the simplest complete
initial writer contract. Selective outcomes avoid copying their whole history
into routine queries/status. Optimizing index startup through lazy storage is a
later measured choice, not an implicit completeness shortcut.
Restore must not assume a dense outcome array beginning at position one. S1's
approved selective-outcome direction (`93eaeffc`) allows an imported checkpoint
to omit older outcomes. A missing outcome at/before interpreted frontier is
explicit unavailable history or an integrity fault when promised coverage was
violated; it is never permanently pending. Only positions beyond frontier can be
awaiting interpretation. The raw storage adapter returns indexed bytes/absence;
the application validator and status adapter own this distinction.

PDS publication and a local database transaction cannot be atomic together.
After native CAS succeeds but local persistence fails, refuse new writes until
the selected native suffix has been reconciled and its rows committed. A missing
local retry row never proves that a nonce is new. On successful confirmation,
retain the new floor and exact receipt with the coherent local generation before
acknowledging durable local acceptance. Preserve any higher floor established by
a concurrent confirmed write when publishing an in-flight read result.
Sparse confirmed receipt evidence may establish a floor above the locally
verified prefix. Persist that floor without manufacturing prefix acceptance;
reconciliation must bridge the gap before further appends.
Native CAS remains the ordering boundary; a local lease/reservation is only
process coordination. Never re-sign, retarget or rewrite queued work to recover.

## Local restore is an explicit trust boundary

P3's restore verifier accepts a storage adapter explicitly configured as trusted
local storage, not arbitrary JSON, an archive, an app-provided blob or a copied
`VerifiedHistory` shape. The existing in-memory brand cannot survive cloning or
deserialization. Restore must issue its own exact-base capability only after all
required checks; it must record that historical execution is reused from a
trusted local installation rather than newly replayed.
It does not establish today's repository key/PDS or newest app head. Online
readiness and appends still perform I1's accepted current observation and P2's
selected-root/boundary/suffix checks before claiming those online facts.

Check the external app/genesis pin; storage version and generation consistency;
semantic and observation policy support; head/frontier/floor relationships;
exact predecessor/tip CIDs; complete retry and descriptor indexes; outcome and
pending-tail coverage; active source and authority closure; and retained bytes
against their CIDs. Reject cross-app/genesis rows and source/authority/frontier
transplants. Validate source, state and framework shapes under the supported
contracts. Backend integrity checks and content hashes detect corruption; neither
turns attacker-controlled local storage into trusted execution evidence.

For the complete-index restore, derive retry identities and descriptor references
from the retained canonical requests/entries, compare their committed CID/position
inventory and both retry access paths, and refuse gaps, conflicts or extra rows.
This bounded linear pass re-establishes index coverage without redoing previously
trusted actor crypto or folding. A row count alone cannot establish completeness.
The trusted committed generation supplies the acceptance provenance for those
historical bytes; an imported package must use P4 assertion or full verification,
not this local shortcut.

For Node, actually run the installed dependency/file/resolution verification and
bind the materialization to reviewed source execution or verified distribution
bytes/provenance. A matching copied `build-provenance.json` hash is insufficient:
its asserted output hashes must correspond to the installed bytes, and its
source/dependency closure must be accepted. A fresh process check or explicit
forced recheck must cover the running installation; a stale success flag is not
new evidence after files change. Browser restore binds the trusted
installed bundle identity through its installation adapter. The browser integrity
function is deliberately a no-op; it does not audit a filesystem and must not be
described as doing so.

Permit interpreted-state reuse under the same accepted actual execution
provenance, or an explicitly accepted independently reviewed equivalence decision
whose CID binds the old and new actual execution/build provenance identities,
identical semantic descriptors, and state/authority/index equivalence. Restore
checks the exact directed old-to-new pair and the installed target bytes, not only
the decision's label or a copied provenance document. The release/installation
trust adapter must accept that decision independently; a snapshot or app assertion
cannot appoint its own equivalence reviewer. Otherwise a corrected build or
dependency change requires replay to re-establish state, authority and outcomes,
even if semantic CIDs stay unchanged.
Retained raw bytes can be reused as inputs after the new verifier admits them;
they do not inherit an in-memory verification brand. Do not infer transitive
equivalence from unrelated approvals. Build provenance is
not added to semantic identity as a substitute for that decision.

Corrupt/incomplete local materialization is a failed restore, not evidence that
the remote app history is invalid. Preserve usable raw evidence and higher known
floors, then recover/replay under them. Storage quota, unavailable source,
unsupported installed semantics and integrity failure stop promotion; they are
not ordered domain denials. An already observed malformed/signature/chain or
duplicate fault remains invalid evidence. PB1's observed structural fault
precedence applies before missing-block/resource-limit reports.

Retain trust floors independently of evictable derived state and preserve them
when replacing a materialization. A single trusted-store transaction still cannot
detect rollback of the entire database and all local floor/outbox copies to an
old backup. Nor can ordinary IndexedDB promise survival of origin eviction.
Report that limit; rebootstrap requires a retained external pin/floor/receipt or
an explicit fresh trust choice. An optional external witness/backup can strengthen
rollback detection, but is not a new mandatory consensus mechanism. Do not label
an erased or rolled-back store as having preserved a floor it no longer knows.
Trusted browser restore also assumes an uncompromised origin: XSS and privileged
extensions can rewrite IndexedDB, including coherent-looking state and provenance.
Neither content hashes nor the browser integrity no-op defend that trust boundary.

## P4: authenticated assertion, then independent audit

The initial portable choice is the app's native publication assertion under the
genesis observation policy. Reuse native content records and bounded byte
manifests for checkpoint payloads; authenticate the exact assertion and referenced
bytes with I1/P1, native MST membership and content CIDs. A mutable native map
authenticates publication, not execution or checkpoint completeness. The app PDS
holding the repository signing key can construct another ordering or publish an
incorrect state assertion; this is the accepted custody model, not a new proof
of computation.

The assertion must bind the app/genesis and semantic/observation policies,
asserted chain head and interpreted frontier, exact definition/source, state,
authority capsule, retry/descriptor coverage and outcome availability policy,
and exact payload/index/evidence commitments. It must say whether there is a
verified but uninterpreted tail and a stall. Verification cannot silently treat
an asserted interpreted frontier as the selected repository's newest head.
The selected publication root and its binding evidence stay separate from the
assertion's own content, avoiding a CID cycle. Use NW0's cursor/frontier and
authority definitions; P4 review owns exact canonical bytes and closed unions.

An existing reader refuses a checkpoint behind its retained floor or conflicting
at the same position. A checkpoint ahead of a known floor requires the exact
chain bridge from that floor, with suffix signatures, duplicate checks and native
membership under the selected root. A fresh reader may accept the app assertion
as the prior prefix only under its explicit checkpoint policy. In either case,
current source/grant availability cannot replace retained historical evidence.
An app authority claim never appoints its own certifier or relaxes the pin.

NW0 reserves `certify` but enables no stronger certification operation. Keep it
disabled in this first choice. Future designated/quorum certification requires
separate review of exact assertion/policy bytes, thresholds, authority closure and
revocation/frontier rules. Appoint certifiers from pinned genesis or a previously
accepted control-certificate chain, never from the checkpoint's claimed power
map. Even an authorized signature authenticates an assertion rather than proving
the evaluator ran it. No quorum infrastructure is needed for initial P4.

Choose two explicit reader modes already admitted by R0:

| Mode | Initial cost and claim |
| --- | --- |
| Complete asserted prior indexes | Load and validate all retry/descriptor rows and receipt pointers; certification/publication asserts their historical completeness. New suffix duplicates can be checked against them. Independent genesis replay remains pending. |
| Deferred prior uniqueness audit | Load bounded state/source/authority and verify suffix work plus known retained tuples. Prior completeness and cross-prefix uniqueness remain trusted to the designated checkpoint authority and ordering service, with that limitation exposed. |

The ordering host's first P3 implementation requires complete trusted-local or
fully replay-reconstructed indexes before append. Portable deferred-index mode
is reader bootstrap, not permission to append blindly. Portable writer restore
from asserted indexes without full replay is a separate policy choice; do not
enable it implicitly. A sparse receipt proves neither complete uniqueness nor
authority effectiveness. Keep original receipt content and recover it
selectively under its retained root; current `getRecord` is not a historical-root
proof service. Do not add the deferred native retry tree/accumulator without
measured evidence that complete loading and explicit deferred audit are inadequate.

Expose independent claims using NW0's assurance dimensions: publication, prefix
and uniqueness coverage, interpretation, identity observation policy and
checkpoint assertion/audit. An authority assertion can make bounded reads and
explicitly policy-trusting client work available early; it is not labeled
independently executed. Work requiring independent state/authority correctness
waits for audit. Identity remains `plc-audit-v1` or `web-observation-v1` as applicable;
state replay does not prove historical online currentness or strengthen did:web
observation into a PLC audit.

## Audit and recovery ownership

Audit an immutable exact target, not a moving latest snapshot. Retain the assertion
CID, target head/frontier and all compared commitments. A separate auditor starts
from the externally pinned genesis, verifies the entire chosen chain and R0 /
descriptor uniqueness, interprets authority and folds state using exact retained
source/evidence, then compares canonical state, source, authority and indexes at
that target. Reconstruct outcomes if they are claimed; selective availability is
not a claim that omitted outcomes were checked. The checkpoint must not seed the
audit state, authority or duplicate sets which it is meant to verify.

Verify publication membership for the chosen prefix under the fixed native target
root required by N1, using retained target-root blocks. Older independent receipt
roots stay separate evidence; they do not fill a missing target-root path. When
the asserted verified head is ahead of its interpreted frontier, verify the chain
and duplicate indexes through the head but compare execution at the exact
interpreted frontier. A reported source stall is an availability observation, not
a permanent domain denial. Repaired source may let live interpretation continue
without moving the audit's comparison target.

Retained account observation descriptors are replay inputs under their pinned
policy. Audit does not resolve today's DID documents to rewrite old authority.
Offline replay has no OAuth, network or resolver dependency. Missing historical
proof/source bytes stall the audit; authentic selected-root absence or exposed
malformation is distinct. Bounded current-root recovery may supply immutable
exact-CID bytes, but cannot relabel another root's proof as the audit root.

Persist audit progress and evidence separately from the operational generation.
Keep every audit step bound to the same target and independently verified audit
frontier. A restart either restores that audit through the trusted-local rule or
replays from its last trusted point. A completed audit upgrades only its target
and subsequently independently verified extension, not every newer live result.
Generation checks prevent late audit/read replies from replacing newer floors.

Report pending, stalled, matched and mismatched audit results as separate local
facts, with the last independently checked frontier. P4/NW0 decide their final
wire spelling. On mismatch, preserve both the assertion and replay result, stop
promotion/use that requires its incorrect derived state, and recover from the
independent replay under retained floors. Do not silently overwrite the evidence
or retract already recorded actions. Checkpoint-based decisions made before audit
remain decisions made under assertion trust; a later mismatch cannot undo them.

## Bounds and costs to characterize

Apply existing semantic bounds to decoded state/action/source. At this source
basis, complete state is bounded at 128 KiB; Atseq encoded blocks at 64 KiB and
wire canonical JSON at 128 KiB/depth 32. The canonical evaluator input and output
bounds are separately 256 KiB each; an action is bounded at 32 KiB.
One definition/source CAR is bounded at 512 KiB including CAR framing and 64
unique source blocks (`PROFILE.definitionBytes` / `definitionFiles`). The
16 MiB / 2,048-block source-pool limit applies to retained application source
across definitions and activations, not one definition. Closure transport uses
the 16 MiB byte ceiling, while `SourceBundle.collectClosure` still permits at most
64 closure blocks; this transport allowance does not raise definition semantics.
Current host history policy is 20,000 entries and archive transport is 48 MiB. These are
current implementation constraints, not a claim that one monolithic archive
always fits or a new native checkpoint identity. NW0 proposes 32 KiB evidence
chunks and bounded flat manifests; reuse its adopted scheme rather than freezing
another chunk union here. Large retry/authority/outcome data must be independently
bounded/chunked, not squeezed into a single state or CBOR block.

Native proof/cache budgets stay operational: presently 32 MiB CAR, 100,000 CAR
blocks, 1 MiB native block, 16 KiB header, 4,096 node entries, 64 path loads and
100,000 tree loads; 16 MiB browser or 128 MiB host cache. Native protocol maxima
and canonical syntax must be checked before stricter local policy, as PB1 requires.
A valid package too large for local policy is unavailable, not invalid history.
Do not copy the older implementation's conflated budget errors into P3/P4.

Bound restore rows/bytes, pending delta, source/evidence fetch attempts, audit
batches, retained generations and storage quota before allocating. The default
unreferenced-generation retention is current plus one predecessor; pending
audit/export pins count against the explicit total generation/byte budget and may
block new staging until released. Never evict a live reference or trust floor to
meet a cache target. Use the
supported current history/source bounds as initial admission policy; expose the
reason when complete index/evidence loading cannot finish. Every batch belongs to
one generation/target and acceptance requires complete declared coverage. Batching
does not mint a partially complete writer index. Validate caller configuration;
never turn its invalid bounds into a verdict on someone else's history.

Let N be prior entries, delta the suffix, S complete state bytes, A retained
authority bytes, R retry/descriptor bytes, O retained outcomes and E proof/source
bytes needed by the chosen path. Characterize these independently:

| Path | Work to measure; no promised latency |
| --- | --- |
| Cold replay | Native/history verification over N, full uniqueness reconstruction, every fold, retained evidence decode/transfer and state growth. |
| Trusted local restore | Installed integrity/build validation; bounded state/source/authority loading; complete index validation O(R); required evidence and pending-tail checks. No claim of constant-size startup. |
| Warm suffix | Selected-root authentication and native paths/cache recovery, delta signatures/chain/index insertions, delta interpretation and atomic persistence. Complete-state fold/copy may still depend on S. |
| Portable complete-index bootstrap | Assertion/proof validation and transfer/decode of S+A+R+needed E; prior execution/uniqueness completeness asserted until audit. |
| Portable deferred-index bootstrap | S+A+needed E and suffix checks; lower initial prior-index cost with explicitly weaker uniqueness assurance. |
| Independent audit | Full replay to fixed target, index/outcome comparison and recovery/retention cost; can run after early readiness. |
| Explicit full export/current-map audit | O(N+O+E) copying/serialization or old path checks; never hide this in a one-entry status/query. |

Measure state/index/authority/source/proof bytes, peak heap and browser transfer,
decode/hash/crypto/fold/copy/serialization/storage counts and time separately.
Include N=100/1,000/10,000, delta 0/1/100/1,000 where valid, bounded versus growing
state, long-lived versus many retired/one-use grants, tombstones, and head-ahead-of-
frontier stalls. Vary checkpoint cadence by observed replay/storage costs rather
than inventing a latency target. Compare checkpoint at every committed frontier,
periodic portable publication and on-demand export; local atomic correctness does
not require a portable checkpoint after every action. Actual timing needs an
isolated window and exact public fixtures/build/source evidence.

## Implementation and adversarial evidence required

P3 proceeds after N1/I1/I2, PB1 and P2/R1 expose their reviewed capability and
storage boundaries. P4 follows the exact assertion policy/encoding review. Both
remain open. The implementation reports must retain exact source/build identities,
public fixture bytes, raw results and honest executed versus unrun claims.

| Case | Required result |
| --- | --- |
| Crash before/after every local transaction and remote CAS boundary | Restore old complete generation or new complete generation; reconcile confirmed native suffix before new writes; byte-equivalent cold replay. |
| Wrong genesis/source/build, swapped authority/outcomes/index rows, missing tail or corrupt block | No restored capability; retain floors and recover. Arbitrary deserialization never issues a verified brand. |
| Old materialization plus newer retained receipt/floor; stale worker/read result | No regression; exact chain bridge or unavailable/conflict. Entire-store rollback limit remains explicit. |
| Complete native proof omits required record; missing block; valid package over budget; observed hostile interval plus missing child | Invalid history versus unavailable versus local resource limit; observed structural fault remains stronger. |
| Duplicate nonce/unsigned content conflict or reused observation across checkpoint boundary | Complete-index mode catches it; deferred mode states prior coverage and later audit detects it. No fabricated old receipt or silent new nonce. |
| Activation/authority evidence unavailable or corrupt, then exact bytes restored | Verified head and interpreted frontier remain distinct; exact stalled entry resumes with identical cold result; no partial authority/source/state publication. |
| Revoke before admission, retired epoch, destructive recovery and stale role/control expected state | Restored tombstones, epochs, floors and revisions preserve the same deterministic result as genesis replay. |
| False app state assertion or unauthorized/self-appointed certifier | Publication may authenticate false app assertion; independent audit mismatches. Unaccepted certifier cannot authorize its own checkpoint. |
| Two apps sharing one account; restored lower native revision; key-only/PDS rotation | Separate app floors/authority, accepted I1 binding, advisory cursor recovery, no invented app position or erased floor. |
| Local quota/eviction, corrected build, audit interrupted, target changed while live suffix advances | Explicit failed restore/stall or replay; same immutable audit target and generation ownership; no accidental assurance upgrade. |
| Credential-free retained replay in Node and real Chromium | Same state/source/authority/index/outcome/frontiers; no hidden resolver/clock/network input; distinct identity observation assurance preserved. |
