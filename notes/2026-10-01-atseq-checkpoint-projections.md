---
date: 2026-10-01
status: source-only history consolidation after independent review; successor review and runtime gates open
request: b6bdfc6f74b8d3c9504ffd01cc93b8cc1d54de8d
promise: 3594f3b7f317ef8e2cd6ef3154d1af1ab55bbad7
parent_request: 1f13a0dcbbae3fd55a08049416ef16175a66c72d
predecessor_at: 72e0965bbdd4be15b59f50d420f06fd7e66ba562
independent_assessment: 07f50c71449b62353d6a7e9f87a14a422213d6e3
examined_at: 20f72a8557e0d78bbb59664a3b5313ad7e8a02a9
outer_proposal_at: 2fec4532bb316906c2c6e183cb2179546a9628a8
native_framing_at: a75f950a
identity_authority_source_at: d08104ddae3e737b8de9e13a3e89116e65d84afc
common_outcome_proposal_at: 4ad0d904950a3f8898d765d9fe47fd637bca9707
---

# Checkpoint projections and exact retained bytes

Use the existing native byte framing for these closed checkpoint projections.
Prefer a compact authority projection of frozen I2, without repeating its
request/retry/descriptor arrays inside authority and again in portable tables.
Retain one history row per original entry, including its actor identity, and
derive all three indexes from that history. No separate request or descriptor
table or cross-table completeness claim is needed. Preserve original signatures,
nonces, source order and proof contexts. Parsing any of these bytes establishes data, not authority.

This supplements the adopted [outer assertion proposal](2026-10-01-atseq-checkpoint-policy-bytes.md).
Ratified independent assessment `07f50c71449b62353d6a7e9f87a14a422213d6e3`
confirmed the predecessor proposal and reproduced its vectors. This successor
adopts its P4D2-1 simplification: consolidate request and descriptor facts into
history. The original `72e0965b` notes, generator and captures remain retained in
Git and the unchanged predecessor evidence packet. Successor review remains open.

The original outer note bytes, SHA-256
`197a06f219ad7606a3c257beafaf8baa1ee392a01e475f69174d7f4c390cdd69`,
are retained in the evidence packet. The accompanying wording update makes
`stall != null` require `frontier.position < head.position`, and distinguishes
checkpoint reference strings from embedded original native record projections.
It changes no native record union, protocol tree, trust policy, runtime parser,
serializer or package export. Full P4 and native act/activation integration remain
open. The common outcome shape below is a **new joint decision proposal**, not a
claim that the present I2 or Folder already implements it.

## Shared encoding and scope

All objects and branches below are closed: every required field occurs once,
optional fields are only those explicitly named, and unknown fields fail.
`CID` means the supported canonical CID string; raw source/file/CAR bytes use a
canonical raw SHA-256 CID. A checkpoint reference is a byteManifest **content
record** CID, not an arbitrary payload hash. Embedded `NativeGrant` data retains
N1's original `$type`, `$link` and `$bytes` forms. Do not rewrite those embedded
records to make their fields resemble checkpoint references.

Payloads use the exact existing `canonicalJson` subset: well-formed Unicode,
safe integers excluding negative zero, supported plain owned JSON values,
unchanged array order, sorted object keys and no insignificant whitespace.
This is the project's encoding, not an assertion of compatibility with another
JSON canonicalization standard. A retained JSON parser must reject malformed
UTF-8, BOMs, duplicate decoded names and unsupported values; re-encoding must
reproduce the exact bytes. Decoding and re-encoding cannot repair a signed/native
record. Original native CBOR is retained and hash checked separately.

Pages have at most 128 KiB canonical UTF-8 and depth 32. N1's actual byteManifest
bound is 32 MiB and 1024 chunks, each full 32 KiB except the last; an empty payload
has no chunks. Each native block retains its existing 64 KiB limit. Aggregate
fetch, parse, storage and history capacities remain independently chosen local
limits. A valid larger package beyond local capacity is unavailable, not invalid
ordered history. The one-source 512 KiB/64-unique-block CAR bound, the named-file
decoded bound, and the retained source pool's 16 MiB/2048-block policy remain
separate from byteManifest transport capacity.

A table uses exactly the adopted fields `format`, `version`, `app`, `genesis`,
`kind`, `through`, `rows`, `pages`. Page references have exactly `payload`, `rows`.
Each page is just an array of the row type for that kind; no producer-selected
row schema is accepted. Zero rows means zero pages; every present page has at
least one row. Sum counts with safe arithmetic, require exact declared page and
total counts, and check order/uniqueness across page boundaries. Hash identity
alone does not validate kind, scope, counts or coverage.

Every table matches the assertion's exact app/genesis and the specified target:

| Table | `through` and coverage |
| --- | --- |
| history | Head; positions 1 through head, exactly once, chained from G; includes unsigned request, actor/nonce and each observation use |
| outcomes | Interpreted frontier; every position 1 through frontier, or the entire table is omitted with null |
| sources | Head as inventory target; exact sources required for interpreted history and audit, without claiming every catalogued candidate was activated/admitted |
| evidence | Head as inventory target; exact retained bytes needed by the target's original verification/audit contexts |

At position zero the tip is G. Equal head/frontier positions require equal entry
CIDs. An authority/state frontier cannot exceed the head. For nonzero positions,
use the corresponding history row's entry. A stall has exactly frontier+1 and
that first remaining history entry; it requires a strictly later head. An
unattempted pending tail need not have a stall. Derive pending work from history
frontier+1 through head; there is no duplicate pending table.

## Prefer compact authority; retain exact I2 as a baseline

The preferred canonical authority payload has exactly I2's current authority
fields, with format `atseq-checkpoint-authority` and without
`consumedObservations`, `requests` or `retries`. Those index facts have one wire
representation in history rows. This is a new checkpoint
projection proposal, not a change to frozen I2 or permission to feed a partial
object to its reader.

Deferred readers can immediately expose app-asserted state for reads/bootstrap,
but a fresh unknown suffix request, actor/nonce or descriptor generally stalls
until complete prior coverage is obtained. This is not continuous unchecked
suffix verification. Repeated app-asserted checkpoints are an explicit
near-continuous read/bootstrap option with separately scheduled independent audits.

The rejected-as-preferred baseline retains the complete exact I2 snapshot as the
outer authority payload. It is simple to validate with today's data reader, but
already embeds all three prior index arrays. Deferred mode would still load those
O(prefix) bytes and complete mode would load history carrying the same facts again.
Skipping old history pages would only defer detailed coverage checks, not avoid loading
prior duplicate indexes. Preserve that baseline's literal bytes/sizes for an
honest comparison rather than claim that it implements true deferral.

The preferred compact object is closed with these exact fields:

~~~typescript
{
  format: 'atseq-checkpoint-authority', version: 1,
  app: DID, genesis: CID, activeDefinition: CID,
  frontier: { position: NonnegativeSafeInteger, entry: CID },
  control: {
    tip: CID,
    appointments: [{ principal: DID, actorKey: DeviceDidKey,
                     powers: ('certify' | 'govern' | 'recover')[] }],
    owner: DID | null, recoverGovernance: boolean
  },
  roles: [{ principal: DID, role: DomainRole, enabled: boolean, revision: CID }],
  principals: [{
    principal: DID, epoch: CID | null,
    epochs: [{ cid: CID, id: Base64Of16OriginalBytes, previous: CID | null }],
    observation: null | {
      cid: CID, root: CID, rev: NativeTid,
      signingKeyDid: RepoDidKey, pdsOrigin: CanonicalHttpsOrigin,
      assuranceClass: 'plc-audit-v1' | 'web-observation-v1'
    }
  }],
  grants: [{ principal: DID, id: CanonicalBase32Of16Bytes,
             cid: CID | null, grant: NativeGrant | null, revoked: boolean }]
}
~~~

`NativeGrant` is the exact closed N1 data object with `$type` equal to the native
grant NSID, version 1, `id`, `app`, `genesis: {$link: CID}`,
`epoch: {$link: CID}`, `actorKey`,
`actions: [{action: FullActionRef, execution: {$link: CID}}]`, and `assignRoles`.
There is no added signature or currentness flag. Reconstruct its canonical CBOR,
compare its content CID and retained original bytes, and preserve its complete
immutable scope even after revocation or epoch retirement.

Sort control pairs by `JSON.stringify([principal,actorKey])` and their powers by
ASCII; roles by `[principal,role]`; principals by principal; each principal's
epochs by CID; and grants by `[principal,id]`, as I2 does. All are unique.
Temporary rebuilt I2 index arrays are sorted by their exact strings. Role names and grant/device/account bindings
retain N1's actual syntax. Epoch IDs and retry nonces are canonical unpadded
base64 of 16 bytes. A retry string is precisely
`JSON.stringify([app,G,actorKey,nonceBase64])`, not a comma-concatenated key.

Reuse I2's closed row/intrinsic self-consistency rules in the future compact
data reader; do not invent empty index arrays to pass today's whole-snapshot
reader. The rules cover immutable recovery policy; current
epoch present among retained epochs; unique epoch IDs per principal; epoch bytes
matching their CIDs; grant/tombstone relationships; exact grant scope/CID and
retained epoch; canonical floor key/origin/TID and method assurance; control/role
revision syntax. Historical control/role/floor references and the request count
are additionally checked when complete history is loaded, as described below. The first accepted
current epoch may retain a previous pointer outside the app's accepted epoch set;
there is no invented requirement to replay all pre-app epochs.

Frozen I2's snapshot reader checks current-epoch membership, unique IDs and exact
immutable epoch CIDs; it does not check connectivity or acyclicity of the whole
retained epoch set. Its evidence traversal rejects a repeated CID on the normal
advance path it actually traverses. The reducer requires that a normal advance
connect to the previously accepted current epoch; initial import and recovery
may import only the selected transition. Recovery requires a fresh, never-seen
epoch/ID and retains older epochs, without requiring the fresh transition to
connect to them. The literal position-20 fixture has a fresh current epoch with
previous null and two retained retired epochs outside that current ancestry.
Accept that retained forest; do not require all retired branches to connect to
today's current epoch. Full audit derives legal transitions under I2. Additional
whole-forest structural checks would require a separate joint decision and are
not silently added to the compact parser.

A never-admitted revoked grant has both CID and grant null with revoked true. An admitted grant
retains both forever within the complete authority projection.

Initial listed roles are enabled with revision G. A role never assigned is an
absent row: its logical expected-assignment revision is null, not a serialized
row with null revision. An effective disable has its unsigned intent CID as
revision. Genesis authority at frontier zero must equal the exact initialization
from the pinned genesis; parsed arrays cannot invent a different initial owner,
control map or omitted initial role. State at frontier zero must likewise equal
the admitted source's actual initial state. At later frontiers, self-consistency
alone cannot prove that the asserted authority/state is the result of execution.

The authority frontier equals the assertion frontier, and activeDefinition equals
its definition. Complete mode derives temporary I2 `requests`, `retries` and
`consumedObservations` from the single history restricted to
positions at or below frontier. These arrays include authentic ineffective/no-op
operations which were processed and exclude stalled/unattempted entries. Combine
them with the kernel under I2's exact snapshot format and run its data reader;
this validates owned data and historical references, **not** its private accepted
state capability. Do not canonically store/publish another duplicate set of those
arrays. Full trusted-local restore may derive the exact I2 data through its
separate complete coverage/admission route.

Deferred mode cannot make those historical references/uniqueness checks from
missing history pages. It retains claimed compact authority as app-asserted data with
explicit deferred coverage; no empty/sparse I2 arrays, invented absence or
`trusted:true` is supported. Known local identities/floors and every subsequently
processed identity remain available. No partial descriptor consumption, floor,
epoch, role or control change survives an interpretation stall.

## Closed history rows and derived indexes

~~~typescript
type HistoryRow = {
  position: PositiveSafeInteger, entry: CID, request: CID,
  actor: null | { actorKey: DeviceDidKey, nonce: Base64Of16OriginalBytes },
  entryBytes: ByteManifestCID, requestBytes: ByteManifestCID,
  observations: CID[]
};
~~~

History order is consecutive position order. `actor` is required and is null
for account origin; it retains the original actor key and nonce for signed
origin. For present N1 operations, `observations` is empty or contains precisely
the one original observation descriptor: accountOperation or signed
recoverParticipant. A different future operation requires reviewed schema
support; do not accept arbitrary descriptor lists.

Derive request-CID, actor/nonce retry and descriptor-use indexes from those same
rows. They may be sorted transiently for I2 or stored as derived local P3/R1
access paths; they are not separate portable table kinds or assertion fields.
A derived descriptor entry keeps its history position/entry/request context.
Complete history checks request, retry tuple and descriptor uniqueness across
all pages. No cross-table duplicate coverage rule is needed.

`entryBytes` reconstructs the exact original native entry CBOR and hashes to
entry. `requestBytes` reconstructs its exact nested signedRequest or
accountOperation CBOR. For signed origin, request is the CID of its **unsigned
intent**, actor is exactly its actorKey/nonce, and original sig remains in
requestBytes and entryBytes. For account origin, request is the CID of the
original accountOperation and actor is null. The account operation's position
and previous-entry context match the enclosing entry. Never manufacture an actor
nonce/signature for account origin or substitute the signed wrapper's CID for R0.

Nonce and signature projections in vector metadata are their original canonical
`$bytes` base64: 16 and 64 decoded bytes respectively. They are not duplicate
checkpoint fields or permission to re-sign/rewrite queued work. Scope, principal,
operation, grant/epoch/contract references and expected state stay in the original
request bytes. With complete history, CID and actor/nonce uniqueness are checked across all
history pages; descriptor use is unique across the same history. A grant denial,
revocation, inactive action or no-op never removes its ordered retry identity.

These head-level rows name **verified ordered uses**, not successful grant
admissions. A portable assertion claims those historical facts until independently
audited. Merely extracting a syntactic observation CID is insufficient to advance
a P2 verified head: missing required verification evidence, bad context,
signature/chain/duplicate faults or missing selected-root completion keep that
verification frontier back. Once ordering is verified, interpretation-only source,
semantic support, authority execution, runtime or persistence unavailability may
leave interpretation behind it. Keep the two frontiers and their assurance apart.

## Outcome rows and selective local coverage

An outcome row has exactly `{position,entry,outcome}`. It is ordered by consecutive
position through frontier and matches history. No replicated stall outcome is
introduced. The proposed common outcome is exactly one of:

~~~typescript
{ decision: 'effective' }
{ decision: 'ineffective', source: 'framework', reason: FrameworkReason }
{ decision: 'ineffective', source: 'fold', reason: FoldReason, message?: string }
~~~

Use the separately frozen common-outcome proposal `4ad0d904950a3f8898d765d9fe47fd637bca9707`,
`notes/2026-10-01-atseq-native-outcome-provenance.md`, SHA-256
`cd215b9926431736c2b2c7bbba1cd5a9366efb751c51bccf738193b4d138b4fb`.
Framework reasons are exact reviewed members or supported deterministic
`fold_failed/<code>` members, at most 76 ASCII characters, with no message.
Fold reasons keep the existing 64-character grammar; optional messages retain
unchanged well-formed Unicode, at most 1024 code points and 4096 UTF-8 bytes.
The full framework member/code table and precedence remain a common native
application contract/conformance gate, not an open exception-string namespace.

The actual future checked callsite chooses source, not a caller flag or a parsed
checkpoint. Current I2 authority-only literals mechanically map its actual
ineffective result to framework; its existing result interface is unchanged.
Ordinary act and activation serialization/runtime compatibility is **not** claimed.
Full audit compares source, reason and optional message as well as decision.

A non-null assertion outcome table is complete through frontier. If a local
materialization has only selective rows, export null rather than a partial table
claiming completeness. Local rows use actual positions; they do not become a
dense array from one. Missing outcomes at/before frontier are unavailable history,
or a local fault if promised coverage was violated; they are never permanently
pending. Complete/deferred prior index loading remains local reader configuration:
complete loads every history page through head; deferred loads only history
pages required for the pending tail or chosen read/bootstrap operation.
The inventory's ordered page row counts locate candidate tail pages; every fetched
page must reproduce its declared count and expected position range. Until all
prior pages are loaded, global chain/identity coverage remains asserted/deferred,
not independently checked by sparse loading.
Deferred coverage cannot enable an ordering writer or claim full prior uniqueness.

Keep the accepted ordered head and interpreted frontier indexes distinct. P2
preflight compares a newly extending ordered entry against all accepted head uses;
I2 processing the already ordered pending tail compares only against the processed
prefix. Passing a full head index to interpretation would incorrectly reject
those pending requests as already processed. For an exact retry already at/below
head, return its existing receipt/status; do not publish it again or invent a
finished outcome while it remains pending.

A known prior duplicate is invalid before mutation. In deferred mode, a miss in
known local/request/nonce/descriptor caches is unresolved, not authenticated
absence. Obtain complete prior asserted history coverage or independently replayed
coverage before advancing a new verified head or mutating interpreted authority.
A reader may fetch/hash-check candidate suffix bytes while stalled, but cannot
call that a verified prefix extension. The ordering writer still requires its
separately accepted complete local replay/index route, not an assertion factory.

Native position-keyed MST membership does not provide reverse-index absence of an
unsigned request CID, actor nonce or descriptor across old entries. No sparse
lookup response, missing page, producer flag or empty cache substitutes for the
complete coverage check. The existing flat history has no authenticated search
boundary summaries; proving prior absence for an unknown key requires complete prior coverage.
Do not add a new tree or claim constant absence work in this proposal. Complete
bootstrap therefore costs O(history/authority bytes loaded); deferred avoids
unneeded prior history pages for read/bootstrap but incurs explicit readiness/audit
debt. Current principal/epoch/grant authority can still grow with history and remains a measured
cost rather than a promised constant-size capsule.

## Source and evidence rows

~~~typescript
type SourceRow = {
  definition: CID, manifest: ByteManifestCID,
  files: [{ path: SourcePath, cid: RawCID, bytes: ByteManifestCID }]
};
type EvidenceRow = { cid: CID | RawCID, bytes: ByteManifestCID };
~~~

Source rows sort uniquely by definition CID, but each files array preserves the
supplied manifest's original order. Paths and RawCIDs exactly match the decoded
manifest's complete file table; unused assets remain. Manifest bytes hash to the
original logical source definition root, not a locator or action-contract CID.
Each file's reconstructed raw bytes hash to its RawCID. Aliased RawCIDs deduplicate
stored blocks but retain/count every named occurrence. Check the admitted
source's entire declared closure under its own bounds. A catalog row by itself
is not an admitted source or action capability. Required historical activated
sources are retained for audit; an unsuccessful or pending activation's raw
closure can be evidence without inventing a successfully selected source.

This matches B0/N1 and the separately proposed source-admission successor
`b029720fc965303f662165554a35bace79f29e1c` (SHA-256
`1e5a67bfe32252f964845145b8a6ad891d3c45a0d65ba6fbba60a914bda3f2e3`).
Its original source reconstruction boundary is unchanged from `d118f156`; its
projection raw-CID identities remain distinct from byteManifest locators.
The successor confirmation is pending and adds no loader support merely by being referenced
here. Active source admission under the exact pinned application semantic
contract remains required before accepting executable checkpoint state.

Evidence rows sort uniquely by exact CID. They reconstruct/hash-check the
original bytes, with the CID's supported codec. A CAR payload's RawCID is not its
native root. The context remains in N1's existing observation/appBinding records,
their original path/CID lists, subject and before/after method evidence, referenced
proof CARs, and the external checkpoint publication proof. Do not add a second
context/certificate union to these rows or trust a supplied context label.
Every context actually used must bind its exact app/genesis/position/previous
entry/request subject, principal, method assurance and selected root through I1/N1.
One byte value may serve multiple retained contexts by CID; identical storage
bytes do not merge those contexts or relabel membership under another root.

The inventory excludes its own bytes, current assertion framing and proof of
that assertion's publication, avoiding a CID cycle. Those belong to the external
publication package. It may retain older receipt/publication proofs or unused
hashed evidence without granting them current membership. Resolve all required
transitive references before the corresponding availability/admission claim.
Hash-corrupt or contradictory supplied bytes fail; unfetched bytes remain
unavailable. Only authenticated absence under the exact complete selected root
establishes absence of a claimed required native record. An archive/cache miss
alone cannot make that assertion.

## Proposed opaque publication admission boundary

Future suffix extension needs a separate publication-asserted authority boundary.
Do not deserialize a snapshot as I2's existing independently processed authority
capability. Propose one specialized reader whose trusted creation config contains
an explicit app/genesis pin, supported assertion version and local priorIndexes
choice. A checkpoint supplies none of those choices.

Its publication-admission method must itself check accepted I1 app identity
binding/observation policy, authenticate the exact native repository root through
P1, prove the genesis/head/assertion manifest/chunk membership and boundary bridge,
reconstruct the supported payloads, and apply the closed schema, bounds,
source/state/compact-authority and requested-coverage consistency checks above.
Run checks on mandatory current state/source/authority, actual selected-root
publication/boundary/known-floor proofs, and loaded complete-index consistency.
Do not require all historical signature/observation replay merely to authenticate
the app assertion; those remain explicit audit work. Any original prefix bytes
actually loaded must match their claimed identities/projections, while unused
original audit evidence remains retained and addressable. It must
preserve every known pair-scoped app floor and reject behind/conflicting bounds;
a new genesis cannot replace an existing floor. A supplied signing key, typed
binding object, callback or claimed proof boolean is not a substitute for running
those checks inside this accepted boundary.

Only this method can mint a frozen empty object in a module-private WeakMap,
provisionally `PublishedCheckpointAuthority`. The private record binds actual
reader config, checkpoint CID, selected publication root/binding, assertion
head/frontier, owned authority/state/source and verified retained-byte identities,
coverage and origin assurance. No public constructor/fromJSON, deserialized brand,
`trusted:true`, `verified:true` or writer conversion exists. Parsing before this
step returns only owned untrusted data. A locally reconstructed hash alone cannot
invoke publication admission without its exact app-native proof.

The distinct asserted capability may be a seed for a future shared checked pure
transition implementation; each suffix uses real P2 verification, resolved prior duplicate coverage and atomic I2
interpretation. Derived capabilities retain their asserted origin/boundary,
app-asserted-prefix plus locally checked suffix assurance, and complete/deferred
coverage. They must not be passed as the current independently replayed I2 brand,
mint a P2 full-prefix VerifiedHistory, or enable an ordering writer. Use one pure
transition implementation behind the separately branded admission routes rather
than an alternate permission evaluator. The final I2/P2 integration API still
needs joint review before this factory is implemented.

Native app publication is the adopted authority for this weaker assertion: the
app PDS holding the repository key can construct another ordering and can also
assert incorrect derived state/authority. This boundary authenticates the app's
claim, not independent participant-history or execution truth. Full fixed-target
replay from genesis is what detects a false assertion and independently establishes
that truth. It never seeds from the claimed state, grants or indexes. No certify
operation, self-authorizing policy, additional Merkle tree or quorum is introduced.

A matched audit is bound to its exact target checkpoint/root/head/frontier and
actual independently checked execution provenance. It cannot upgrade another
newer generation. Trusted-local restore is a third route: coherent local store,
uncompromised origin/private file assumption, exact actual build provenance or
independently accepted directed equivalence, and complete restore checks. Neither
parsed data nor newly imported publication assertions acquire that route by
copying producer provenance or a review reference. Storage still cannot detect
whole-store rollback or compromised-origin rewriting on its own.

## Literal evidence and implementation gates

The source-only generator reuses **exact** I2 public fixture bytes from the frozen
candidate archive (raw 23,114,637 bytes; SHA-256
`a6ca8f0aa56a1986e6fc4e39f13da8b6609d3a6829c1349e94487c9496e4e019`).
It never regenerates keys or public inputs. It validates six full I2 baseline authority projections
with the actual I2 reader, confirms those parsed objects cannot be used as its
private authority capability, separately frames compact counterparts without the
three duplicate arrays, reconstructs temporary exact I2 data from complete
history restricted to frontier, checks original signed contents and chain through
13 entries, compares restricted request/retry/descriptor sets to I2, and frames
all exact JSON/CBOR bytes with the unchanged N1 encoder/reconstructor. It covers
G/absent/disabled role revision, retired epochs, recovery, original nonces and
signatures, cross-page counts, supplied source order/unused assets, omitted
outcomes and strict stalled-tail bounds. Empty, exactly 32 KiB and two-chunk
payloads have literal native framing records.

The source-row example and outer assertion literals are **structural/framing
examples, not admissible checkpoints**. I2's public fixtures intentionally use an
unsupported semantic/source placeholder; the standalone source example is not
that active definition. Claimed producer inventories are examples and no app
publication or trusted-local checkpoint admission ran. The vectors explicitly
record these limits. They do not prove a false state assertion acceptable or
claim ordinary-act compatibility. Native CID derivation does not depend on these
missing trust/admission gates.

The fixed fixture app is `did:plc:puhubn7uku6ehbcl5nsfkssh`; G is
`bafyreifqm3r5qfsbw4tvzhsk6juej6juiad6swqypowzu55i2arfwb2pjq`.
The literal authority comparison measures canonical UTF-8 bytes, including each
format name. These are small real fixture states, not extrapolated latency targets:

| Frontier | Exact full I2 bytes | Preferred compact bytes | Net bytes avoided |
| ---: | ---: | ---: | ---: |
| 0 | 896 | 847 | 49 |
| 1 | 2155 | 1984 | 171 |
| 2 | 2411 | 1985 | 426 |
| 12 | 5164 | 2838 | 2326 |
| 13 | 5461 | 3011 | 2450 |
| 20 | 7347 | 3703 | 3644 |

At frontier 13 compact avoids 2450 bytes (about 45%) in authority itself. Complete
readers still load the complete history and build transient indices; this is
removal of duplicate persistent bytes, not removal of their verification work.
Deferred readers avoid unneeded prior history pages initially but still load all current
authority and state bytes. The fixture's growing grants/epochs remain in compact
authority; neither representation is constant in history. The generator does
not time these operations.

### History consolidation comparison

Using the same 13 original entries and two rows per page, consolidation reduces
history plus index payloads from 21 to 8, and canonical UTF-8 bytes from 11,525 to
6,338 (5,187 bytes avoided, about 45%). It removes two table kinds and two outer
assertion fields. It retains actor identity directly in history, rather than
requiring a separate per-position request projection or a descriptor table.

| Retained mechanical corpus | Predecessor | Consolidated history |
| --- | ---: | ---: |
| Payloads | 160 | 147 |
| Sum of exact payload bytes | 763,250 | 757,616 |
| Unique native CBOR records | 314 | 288 |
| Sum of unique native CBOR bytes | 772,912 | 763,629 |

Payload-byte sums and deduplicated native-record sums are separate quantities.
This corpus includes full-I2 comparison baselines and structural examples; these
are not production checkpoint sizes or latency estimates. All original entry,
request, evidence, compact/full authority, source and outcome payload bytes and
native manifest identities remain unchanged. Only history/index framing and
outer assertion payloads differ. The generator checks those unchanged identities.

Complete mode still performs O(history bytes) loading and derives complete
indexes; consolidation removes duplicate bytes and cross-table rules, not that
work. Deferred mode can load just needed tail pages for reads/bootstrap, but an
unknown suffix request/retry/descriptor still stalls until complete prior
coverage is available. Local derived caches remain useful without introducing
new portable tables, reverse-index absence proofs or a Merkle tree. This proposal
changes unsupported checkpoint preparation bytes, with no prior compatibility
requirement and no change to the original native entries or frozen I2 runtime.

Selected literal identities (the last assertion row is structural only):

| Exact payload | Bytes | Native byteManifest content CID |
| --- | ---: | --- |
| `authority-0.json` | 896 | `bafyreidhgybmh3f4u5gkv4izijzrahszupz4e43fr7mw47ejbsrjnqd25q` |
| `authority-2.json` | 2411 | `bafyreicrdlfd4j5ee7tjpoxjkkw4ja3rzhlpvr2ekgmbyhfln2j2inloha` |
| `authority-13.json` | 5461 | `bafyreifpt5edqaak6rspvll6yvazzdpngxtabydjqwceevqboe32m6dgzq` |
| `checkpoint-authority-0.json` | 847 | `bafyreidvpvj37mdnb2qy2jxzjmzwdgncxwlewvvpwlhmkucpbzi53zuawu` |
| `checkpoint-authority-2.json` | 1985 | `bafyreicrxq7ewduk6yz7ghw2mljaujq5nrom677btmddrmqg7iq5fojxcm` |
| `checkpoint-authority-13.json` | 3011 | `bafyreifv5xt54cdtaciqm2ibeumxwxkvkeqzo472x6z5fli2e5avc5c4au` |
| `history-table.json` | 874 | `bafyreihrwnmubnpyl6dvtzablozqwxmeuqxit2ho7hwzf4o5nfknt4kmgm` |
| `framework-denial-namespace.json` | 72 | `bafyreie2tby3cz5ipdjqz7mvgmyhhxskal36ftzlj6tpe2eq47fgw2qlze` |
| `chunk-boundary-0.bin` | 0 | `bafyreien6ye5umq46ovejqb23p4rqcxqv2b6oddx7sq5obfubbxpl2kfbu` |
| `chunk-boundary-32768.bin` | 32768 | `bafyreihhgqz26gm7nkvxgtg4bxevwmwuoafosw7eef72kaaqpcpbkn274e` |
| `chunk-boundary-32769.bin` | 32769 | `bafyreifjimuw2h5ls2kfswvqgsmn75zsqtcw6ylrp7trlaiqobk6lqxh74` |
| `assertion-stalled-shape.json` | 1078 | `bafyreia6pwetxqufa4u2q4e4mzqmbvua76xlwiiukhsylymfe5edeqgqxe` |

The original disabled-role request at position two has unsigned CID
`bafyreidcawvpjicfqsonilvomzy2rpop7p5vun5kixucbzoacuktzfjcaa`, nonce
`AQEBAQEBAQEBAQEBAQEBAQ` and original 64-byte signature projection
`mzPo28pwnoeq0lewye53yivCySqjaOnZguFfI/QMS7R9MnBLuweVWqYAU526sYL1NC0vSP6nedVwbf5H69nTcw`. The complete original CBOR, including all unchanged
expected-assignment/grant/epoch fields, is in the retained vector bytes.

The 72-byte canonical framework-denial payload is exactly:

~~~json
{"decision":"ineffective","reason":"grant_revoked","source":"framework"}
~~~

Node 22.19.0 and 26.10.0 produced the same successor vector inventory SHA-256
`175a20c68b576cbd76e1a9db7b740de788d93ec08dca777705ccd22d1e685517`:
seven mechanical check groups, 147 exact payloads and 288 native content records.
The unchanged predecessor inventory is
`9ac0cdeffbe296e7e54fa1e1e9198d4f411deff5de17ebe5489cc06eefa5eddb`,
with six groups, 160 payloads and 314 records. Every successor record/payload and
its digest is retained; archived CBOR can be checked independently of JSON
display. No P4 Chromium parser/admission check ran; that remains an implementation
gate.

Joint review must approve the row schemas, common outcome ABI, source boundary,
page/frontier relationships, literal byte identities and the proposed separately
branded factory. Runtime implementation then needs shared Node/real Chromium
adversarial admission/audit tests: unknown/extra branches, duplicate decoded JSON
names, malformed/canonical byte differences, scope/frontier/page-count and
cross-page order swaps, signed/unsigned identity confusion, changed original
nonce/signature, pending descriptor reuse, false state/authority/index assertions,
complete/deferred coverage, partial outcome export, source-order/unused-file changes,
root/context mixing, matched/mismatched fixed-target audit and exact local restore
provenance/equivalence. Existing I2/N1 cross-runtime tests remain evidence for their
own frozen implementations; they are not a P4 parser/admission test.

Mechanical results and exact native content/JSON bytes are retained with the
input archive, generator/source hashes and commands in the
[successor evidence packet](../experiments/post-spike-evidence/2026-10-01/checkpoint-history-projections/manifest.json)
and [unchanged predecessor packet](../experiments/post-spike-evidence/2026-10-01/checkpoint-projections/manifest.json). No P4 implementation/integration suite, build, benchmark, PDS operation or checkpoint
admission was run for this proposal; no production source changed. The generator's Node checks are specifically
mechanical projection/framing checks, not a claim to close those integration gates.
