---
date: 2026-10-01
status: independently reviewed; required corrections applied; implementation pending
examined_at: a3c306aa8f5be555a88df8cb5b2bc30dc5ba1995
request: 6213c7bf83d149454921c601c1f4d3bb78beafaf
---

# Native wire and authority contract

Use native app repository publication for ordering, one signed request format for
device and app-control work, and one deterministic authority interpreter. Keep
ordinary grants exact to an action's execution contract. Keep the observation
policy and application semantics immutable within one genesis. Version service
RPC contracts independently, so a description or transport improvement does not
replace an application's identity. This note proposes the concrete first native
format; it does not amend runtime code, Lexicons or dependency approvals.

The adopted direction remains: the app PDS holding the repository signing key
can construct another ordering. Every credential holder allowed to write the
Atseq collections shares that custody. Native publication cannot forge an
uncompromised device or appointed control signature. Retained floors detect
encountered conflicts; this format does not prove global non-equivocation.

## Inputs and status

This joins corrected I1 at e00cf34ade8c251e75cb2cb024a0e811e9b2a3cc, corrected I2
at 46268091f4f227c58dbb556197efb06ea916aaf1, corrected N1 at
9224b2074d03f2cf991a87bb7293687ead24e41a, R0 at
266ad025473108d58f8b1be0de2a5fd71b1a5d32, and C0's landed
[activation contract](2026-10-01-atseq-activation-compatibility.md). Joint
assessment 91c4241c0174fe6ecfa67f6d891bec6e817af3f9 adopted the logical I2/N1
direction; assessment cc21a77c204cbd5aa021eeee3f7cb7c9b5835ad0 required I1's
computed canonical PLC tip. R0's corrected decision is 981bbcd7c276a3b4b1974b842f2a71fc966aa06f.
Those earlier decisions did not approve this concrete encoding. Ratified NW0
assessment a5f46ba7bd8148b1c432f89f2c4fef44141e4c36 accepts decisions 1–4, 6 and
7, requires recovery authority above governance (NW0-1), and recommends minimal
fold metadata (NW0-2). This successor applies both and makes the consequence of
one recovery-key compromise explicit. Ratified confirmation
4d4f6f8d18506ba126e700d08b8d4adc38da4d32 accepts the corrected D5 and minimal
metadata. Ratified NW0-3 assessment 83cd03d42f287d4016e21132dc367c2f7fa30d28
confirms initial assignment revisions and the map-pressure limits below. These
are design decisions; literal bytes/CIDs and runtime conformance remain gates.

P2's corrected reader requirements are at
2d831d0a69278161894a58c91186a84a4bad8b75, adopting ratified assessment
f48d15409da9b841892d54362677499c8fb76804. PB1's local proof-budget successor is
approved PB1-R1 at 03116bdd478467e4d7b333f68629255d3df755cc, independently
accepted and ratified under review 3cdb7fa492cf13e3905d3c726783ab5000010374;
the earlier 83a78701 proposal was rejected. B0 landed and was pushed at fd7dab4b,
from validated candidate d22d106. It uses v2 application/log identity because
the present descriptor includes service schemas;
the native successor deliberately separates that coupling. No compatibility
promise with either spike format is a goal.

Source inspection covered core/contracts.ts, core/profile.ts, protocol/log.ts,
protocol/wire.ts, protocol/native-proof.ts, definition/load.ts,
definition/schemas.ts, definition/source.ts, definition/activation.ts and
application/folder.ts. I1's portable preparation at
7b1b5e13598f5d436f892c011597f9cac5c51bab already exposes typed retained method
bytes without fixing descriptor wire. No build, benchmark or runtime test was
run for this proposal. Source checks are not implementation conformance evidence.

## Names, canonical bytes and bounds

All names below are under the owned ai.generalbusiness.atseq namespace; defs#name
abbreviates ai.generalbusiness.atseq.defs#name. Use the existing genesis, head,
entry and definition names with version 2 records; account epoch, epochCurrent,
grant, revoke, file and content are new record collections with version 1.
Framework object definitions live under defs. A version mismatch is
unsupported history, never an invitation to interpret old bytes as the new format.

The notation CID means a canonical lowercase base32 CIDv1, dag-cbor, sha2-256 link.
RawCID means the same hash/version/base encoding with the raw codec, carried as a
string. Bytes means native byte data, represented by the existing canonical
unpadded-base64 JSON wrapper at an XRPC boundary. JSON-to-CBOR conversion uses the
existing strict wire path, not JSON.stringify of a signed object.

All Atseq CBOR blocks keep the existing 64 KiB encoded-block, 128 KiB canonical
JSON and depth-32 limits. All framework objects are closed; reject duplicate or
unknown fields and unknown closed-union members. Numbers are safe integers and
exclude negative zero. Verify received canonical CBOR by decode/re-encode equality
and exact CID; do not normalize a malformed signed object into valid content.
Native commit/MST parsing retains its separate P1 bounds and native format rules.

| Value | Proposed first-format bound |
| --- | --- |
| Account DID | ATproto-supported did:plc or hostname did:web, native maximum 2,048 ASCII characters; no handle substitution |
| Device/control signer | Canonical compressed P-256 did:key, at most 128 characters |
| Actor signature | Exactly 64 bytes, compact low-S P-256/SHA-256 over canonical unsigned intent bytes |
| Nonce and creation discriminator | Exactly 16 cryptographically random bytes |
| Ordinary payload | Owned plain JSON object, existing 32 KiB action bound and depth 32 |
| Full action/schema reference | Canonical full NSID#definition, at most 300 ASCII characters |
| Domain role | ASCII [a-z][a-z0-9_]{0,63}; govern, recover, certify and owner are reserved |
| Initial/control appointment map | At most 16 distinct principal/signer pairs; each has a nonempty unique sorted subset of govern, recover, certify |
| Initial domain assignments | At most 63 distinct principal/role pairs |
| Grant ordinary scopes / role-administration scopes | At most 63 entries each, sorted and unique |
| Observation required paths | At most 16 sorted unique path/CID pairs |
| Evidence byte chunk | At most 32 KiB, nonempty |
| Evidence byte manifest | At most 1,024 ordered chunk links and 32 MiB reconstructed bytes |

Keep repository signing-key support distinct: P1/I1 may authenticate native P-256
or secp256k1 repository keys. That does not add secp256k1 device signing to this
proposal. Preserve the existing pure evaluator, state and source limits; S0 owns
any reviewed change to complete-state operations.

The [ATproto DID specification](https://atproto.com/specs/did) restricts account
principals to PLC and hostname web methods. did:webvh or other methods are not
accepted by this first contract or silently treated as did:web. Supporting another
method needs explicit ecosystem and retained-evidence review, not a parser alias.

The [ATproto data model](https://atproto.com/specs/data-model) supplies the native
data representation. These stricter Atseq bounds and closed objects are protocol
choices. Changing an authority rule, accepted byte interpretation or deterministic
bound requires a new supported semantic descriptor. Local proof/cache capacity,
network deadlines and persistence failures are operational availability limits,
not replicated denials or evidence that an account history is invalid.

## Native paths and bootstrap

Let G be the complete canonical genesis CID and P a positive safe integer.
The canonical app record paths are:

~~~text
ai.generalbusiness.atseq.genesis/G
ai.generalbusiness.atseq.head/G
ai.generalbusiness.atseq.entry/G.<P as exactly 16 decimal digits>
ai.generalbusiness.atseq.definition/<definition manifest CID>
ai.generalbusiness.atseq.file/<RawCID of source bytes>
ai.generalbusiness.atseq.content/<CID of this complete content record>
~~~

These record Lexicons use key any; application validation enforces the exact
derivation. Entry positions run from 1 through 9,007,199,254,740,991. Parse digits
without rounding and require exact pad-and-roundtrip equality. Zero is not an
entry key; genesis is the position-zero predecessor. Refuse append before addition
would overflow. A SHA-256 CBOR CID is 59 base32 characters, giving a 76-character
entry rkey. Never truncate it. Validate the complete native path and rkey with
maintained ATproto syntax validation as well as this stricter rule. The
[record-key specification](https://atproto.com/specs/record-key) permits key any,
the characters used here and keys up to 512 characters.

Genesis version 2 has exactly these fields, in addition to its collection $type:

~~~text
version: 2
app: DID
creation: Bytes(16)
semantics: CID
definition: CID
observationPolicy: CID
control: [{principal: DID, actorKey: did:key, powers: [power]}]
recoverGovernance: boolean
owner: DID | null
roles: [{principal: DID, role: roleName}]
~~~

Sort appointments by principal then actorKey, powers by ASCII value, and roles
by principal then role. Reject duplicates, empty power sets and reserved domain
roles. Recommend at least one govern appointment and an independently held
recover appointment, with recoverGovernance true. An intentionally empty control
map is allowed and permanently gives up same-genesis governance/recovery. Genesis
may also choose govern appointments without any recover pair, but that permanently
gives up same-genesis recovery: govern cannot create a recovery appointment later.
The nonempty result rule for setRecovery does not invent a key for such a genesis.

Compute G from those bytes before publication. Genesis embeds neither G nor its
containing native commit root. Compute initial head with version 2, app, genesis G,
position 0 and entry G. Publish genesis and head together with create operations
and swapCommit; an existing namespace is not replaced. The external invitation
pins (app DID, G). Selected native root/key binding is separate retained bootstrap
evidence and is never accepted merely because an archive supplies it.

The initial appointed principal/key pairs are explicit trust in the pin, not
proof that each key is the principal's current repository or device key. The UI
must describe that appointment. No participant observation or signature whose
payload contains G is required inside genesis: that would create a CID cycle.
The initial owner/roles are likewise explicit appointments, not handle/domain
ownership or a verified current grant. Ordinary use still needs grant admission.

Each enabled principal/role pair listed in genesis initializes its assignment
revision to G. A pair never assigned has revision null. A later effective enable
or disable uses that assignment's unsigned intent CID; disabled rows retain their
revision. No-change requests remain role_unchanged. Derive G after hashing the
finished genesis bytes; do not embed it into genesis or create a separate initial
assignment ID. Test expectedAssignment=G, stale null for a genesis assignment and
stale G after a later effective change.

A new genesis in an existing trusted account uses a fresh creation discriminator,
new validated initialization and explicit new pin/appointments/grants. The same
app DID with different G is a distinct app. Reusing key bytes does not inherit old
powers. Old namespaces and receipts remain retained. No checkpoint transplant,
queued-intent rewrite or implicit role/grant carry-over is allowed.

For production/busy use recommend a dedicated app account. Supported shared-account
use requires collection-scoped OAuth, shared repository CAS and explicit custody
disclosure; permissions do not isolate genesis rkeys inside a collection. Never
silently fall back to an app password when a provider lacks required granular
permissions. A2 must run the actual provider trial. Only an explicit disposable
development fixture may use the documented app-password exception.

## One ordered entry, two request origins

Head version 2 has the existing app, genesis, position and entry fields; its native
membership is authoritative. Entry version 2 has exactly app, genesis, position,
prev and request, plus collection $type/version. request is a closed union:

~~~text
signed: { $type: defs#signedRequest, intent: UnsignedIntent, sig: Bytes(64) }
account: { $type: defs#accountOperation, app, genesis, position, prev,
           principal, expectedEpoch, expectedObservation,
           operation: typed admitGrant | advanceEpoch | revokeGrant,
           observation: CID }

admitGrant: {$type: defs#admitGrant, grant: {id: grantID, cid: CID}}
advanceEpoch: {$type: defs#advanceEpoch, epoch: CID}
revokeGrant: {$type: defs#revokeGrant, revoke: {id: grantID, cid: CID}}
~~~

There is no sequencer key or ordering signature. Authenticating the app's selected
native commit and entry path supplies publication authority. App entries still
form an explicit contiguous previous-CID chain; native commits are mutable-map
snapshots, not the app chain. A native revision, event cursor, current head and
interpreted frontier remain different values.

Every actor-signed request uses this unsigned envelope:

~~~text
$type: defs#intent
version: 2
app: DID
genesis: CID
principal: DID
actorKey: canonical P-256 did:key
nonce: Bytes(16)
operation: closed typed operation
~~~

The signer signs encodeBlock of that entire envelope, not its JSON spelling or
CID string. Canonical unsigned-intent CID is its request identity. Entry retains
the first authenticated signed envelope, including the original signature.
Alternative valid low-S signatures over identical intent bytes do not create
another request or alter any control/assignment revision.

Ordinary act has exactly grant {id, cid}, epoch CID, action full reference,
execution CID and payload object. It does not bind a source-definition CID or
position/predecessor: it deliberately acts on state at its eventual ordered
position. assignRole has grant {id, cid}, epoch CID, target DID, role, enabled
boolean and expectedAssignment CID-or-null. Control operations additionally
bind position, prev and controlTip. A grant CID reference is signed consent to
that immutable admitted record; an ID alone is insufficient for replacement.

Apply R0 after structural/target/signature checks: look up unsigned intent CID
first and return its original receipt; then look up (app, G, actorKey, nonce).
Same tuple with different unsigned CID is refused. Principal, epoch, grant, kind
and contract are signed contents, never new nonce namespaces. Authentic ineffective
requests consume the tuple. A second ordered occurrence of either identity is
invalid history. Indexes are derived from the accepted prefix and are retained
or explicitly audited before a checkpoint reader claims complete uniqueness.

Account-native proof imports have no invented actor nonce or submitter signature.
Their request identity is the canonical CID of the complete accountOperation.
An exact operation retry returns its old receipt before descriptor consumption
checks. A fresh observation/context is another operation, even for an unchanged
grant or revoke. The host needs both operation-CID and consumed-descriptor indexes.

## Participant native records

All account records below use collection $type and version 1. Authenticate issuer
from the selected participant commit DID; do not add a redundant issuer field.
Native account publication supplies their authority. A published grant is not
proof of separate user interaction. An app admits its exact CID, never a mutable
record alias or an unproved JSON repo.getRecord response.

| Collection / key | Exact additional fields |
| --- | --- |
| epoch / transition CID | id: Bytes(16), previous: transition CID-or-null |
| epochCurrent / self | epoch: transition CID, id: same epoch Bytes(16) |
| grant / grant ID | id: grant ID, app: DID, genesis: CID, epoch: transition CID, actorKey: did:key, actions: [{action, execution CID}], assignRoles: [roleName] |
| revoke / target grant ID | id: target grant ID, app: DID, genesis: CID |

A grant ID is the lowercase unpadded RFC 4648 base32 encoding of 16 random bytes:
exactly 26 characters with canonical decode/re-encode equality. Generate it fresh
across this issuer's grants; no wall time/TID authority. The same ID names the
grant and its revoke. Revoke may precede grant admission or grant publication.
At least one ordinary or role-administration scope is required; each list is
unique and sorted. Do not use wildcard actions, role unions, expiry clocks,
position bounds, persistent cross-contract scopes or delegation graphs.

An epoch's CID is its identity; its random id also detects malicious reuse of
an earlier epoch ID with changed bytes. Derive predecessor paths from the complete
previous CID. epochCurrent identifies the selected transition and repeats its id
for exact consistency checks. The current pointer is account-wide; imported
epoch anchors, floors and grant authority remain scoped to (app, G, principal).
Native revision/TID does not order epochs. The explicit predecessor does.

For first admission, require a freshly observed current pointer/transition and
grant at one selected root; initialize from that current epoch without replaying
resets predating this app. For a known principal, collect the transition path
back to its retained anchor before accepting a changed current epoch. Never infer
succession from a CID, timestamp or higher repository revision. More than the
policy's 16 subject paths stops admission as unavailable; do not truncate the
chain. An explicit larger bounded policy requires a new genesis in this proposal,
or appointed recovery with a freshly published epoch can be used.

AdmitGrant operation selects one exact grant path/CID from its observation;
advanceEpoch selects current pointer/transition and required reset path; revokeGrant
selects only its exact revoke. Each operation's typed fields include the target
grant ID/CID when applicable. A revoke does not require a still-present grant or
epoch. The descriptor's exact subject list is checked against this operation,
not accepted as arbitrary authorization data.

An accepted normal observation can advance the principal's retained observation
floor even when its delegated change is an explicit no-op. Normal floors accept
a greater signed revision or equal revision/equal root, refuse lower revision
and equal-revision/different-root, and derive key/PDS from the retained binding.
Greater revision is not evidence of latestness. Keep immutable grants, terminal
tombstones, accepted/retired epoch IDs and CIDs, and the last accepted observation.
Only the current-epoch grants act. Deleting a source grant does not revoke admitted
authority; explicit imported revoke/reset does.

Every accountOperation's position/prev must exactly match its containing entry.
Its expectedEpoch/expectedObservation must name the relevant prior app authority
state. The app predecessor prevents transplanting it across an intervening entry.
A well-formed stale expected authority value is ineffective authority_stale;
wrong outer app context or subject evidence is invalid history. Each valid
operation consumes exactly one descriptor, including a no-op or ineffective
admission; no partially accepted state/floor/consumption survives a stall.

## Observation content and non-circular context

Use one content record collection instead of separate custom evidence transports.
Its outer shape is collection $type, version 1, body: a closed union of
defs#byteChunk, defs#byteManifest, defs#observationPolicy, defs#observation,
defs#appBinding, defs#actionContract and the supported semantic descriptor objects. Every such
complete record has its own CID and canonical content/CID path when published.
No content object embeds its own CID. Its storage path is not authority by itself.

byteChunk contains only bytes, at most 32 KiB. byteManifest contains byteLength
and an ordered chunks array. Require nonempty full-size chunks except the last;
allow empty bytes only as byteLength zero/chunks empty. Check each chunk CID,
reconstruction length and the consumer's policy before parsing. A manifest is
flat retention framing, not a second ordering/state Merkle tree. Hash sharing
deduplicates identical retained response bytes without creating another trust
layer. Large native CAR evidence uses the same framing; source raw files retain
their existing RawCID identities and exact bytes.

The definition record is the manifest itself, without a content wrapper; its
native record CID remains the source-definition CID. A file version-1 record has
exactly collection $type, version, cid: RawCID and bytes: byteManifest CID. Its key
is that full RawCID, not the different CID of the CBOR file locator. Verify native
locator membership when claiming publication, then reconstruct and verify the
raw bytes against cid. A locator cannot change what bytes a source CID means.
SourceReader.get(RawCID) therefore retains its current contract; get(definition
CID) returns exact manifest CBOR. Keep the current standard source CAR containing
the manifest and raw files, at most 64 unique blocks/512 KiB including framing.
Evidence framing/locator blocks are separate retention, not extra source files
or an implicit increase of the source allowance. Hash-verified local/archive raw
bytes need no live locator to be used as source. A full retained source closure
is unchanged in meaning: exact manifest plus its declared raw files.

Preserve the existing file-table and unused-file identity rules in native manifest
version 2. B0's nonblocking source-identity observations, retained under root
assertion 397e966fe6941e3ec1194b41975e4bb52a3cd79f, identify both deliberately
supported cases: declared files need not be referenced by an action/query/view,
and changing the retained file-table array order changes the definition CID.
There is no demonstrated native-publication requirement to restrict either.
Unused files may be intentional assets or explanatory source; exact manifest
bytes already commit to array order. Both still count against file/byte bounds.

When an authoring document supplies a files table, preserve its exact array order,
require unique valid paths and require its complete path/CID set to equal the
supplied exact source bytes. Reject extras, omissions or mismatches; never drop an
unused item or silently sort the retained table. When a newly authored document
omits the table, the existing converter's ASCII-path sort remains a deterministic
construction convention, not a restriction on already authored or retained
manifests. Export/import must preserve the definition CID and every file byte.
Hash/size-check unused files, but do not interpret an unused binary asset as a
program or infer authority from its presence. Referenced schemas/programs/views
and initialization retain their full current preflight requirements.

Reordering the table, adding/removing an unused file or changing its bytes creates
a different source definition and therefore still needs exact-CID activation,
even when every ordinary action contract remains unchanged. Native paths derive
from that new CID without rewriting the old record. An author who deliberately
normalizes source makes a new candidate; the service cannot do that as a hidden
transport conversion. No new sorted-table or referenced-files-only admission rule
is proposed.

An observation's exact fields are:

~~~text
$type: defs#observation
policy: CID
principal: DID
context: {app: DID, genesis: CID, position: positiveSafeInteger,
          prev: CID, subject: CID}
binding: {signingKeyDid: canonical repository did:key,
          pdsOrigin: canonical HTTPS origin}
before: plcAudit | webDocument
after: same typed method as before
repositoryRoot: native commit CID
records: [{path: native path, cid: CID}]
proofs: [byteManifest CID]
observedAt: strict UTC diagnostic timestamp

plcAudit: {$type: defs#plcAudit, bytes: byteManifest CID,
           source: designated audit URL, selectedTip: CID}
webDocument: {$type: defs#webDocument, bytes: byteManifest CID,
              source: exact supported well-known URL}
~~~

subject is computed before adding the observation reference: hash the closed
{$type: defs#observationSubject, request: projection} wrapper, where projection is
the complete accountOperation with its observation property absent, or the complete
unsigned recoverParticipant intent with only operation.observation absent. This projection
has the same types/fields as the final proposal except that one explicitly omitted
property. It is not an independently executable operation. All other fields,
including nonce/signer, control tip, target, expected authority and selected new
epoch where applicable, remain in the hash. Recompute it from the containing
request, never trust a supplied alternate projection. The observation commits to
that subject; the final request commits to the observation CID. Neither commits
to the final request CID in both directions. The wrapper's distinct type provides
domain separation from executable requests and other content objects.

The native app root must prove the observation content/CID path as well as the
entry. Stage immutable evidence content first if necessary, then atomically create
the observation and entry and update head in one bounded applyWrites. The entry
links the descriptor, which links its exact evidence. Retained replay verifies
the original publication root and all hash links; it does not require that a
later current mutable map still contains every historical content path. Unfetched
content is stalled, not native absence. A selected publication root proving its
claimed observation absent is invalid proof. Repeated consumption of a descriptor
is invalid history, not another no-op; the host refuses it before append.

The immutable genesis-appointed observationPolicy has exactly these body fields:

~~~text
$type: defs#observationPolicy
algorithm: "atseq-account-observation-v1"
plcDirectory: canonical HTTPS origin
allowWeb: boolean
checkpoint: "native-publication-v1"
~~~

The supported algorithm fixes I1's method interpretations and default evidence
bounds below; there is no arbitrary permission or interpreter program. Default
PLC origin is https://plc.directory; allowWeb true enables convenient hostname
account adoption with its disclosed weaker trust. Origin is at most 2,048 ASCII
characters and has no credentials/path/query/fragment. Check exact source URLs:
designated PLC origin plus the requested DID's audit path, or maintained
didWebToUrl for that principal. Source URL is routing provenance, not signature
authority. A larger algorithm policy is unsupported until independently reviewed
and implemented, not a host-side increase of these fixed retained-evidence rules.

The policy does not name a bootstrap root that
contains itself. This proposal omits same-genesis policy replacement: an observation
cannot appoint its own policy, and changing currentness trust/budgets must remain
an explicit new trust choice. Local smaller budgets can still refuse availability.

PLC before/after retains each exact strict UTF-8 JSON audit response and asserted
tip. The maintained verifier must compute that tip as its final canonical row,
reject a tombstone tip, and derive binding through normalizeOp of that signed tip.
Compare tip CIDs even if key/PDS did not change. No authoritative PLC DID document.
Web retains each exact well-known document and compares principal/canonical
key/PDS. Web is observation-only assurance; app publication can fabricate those
unsigned bytes. PLC authenticates authorized key history but can still present
old authentic history and misleading unsigned directory metadata. Neither proves
global currentness. Display/export the assurance class separately from outcome.

Apply I1's exact strict JSON/UTF-8/no-BOM/duplicate-decoded-key/depth rules, supported
key extraction and endpoint rules. Method bounds remain web 32 KiB and 64 key/service
entries; PLC 1 MiB, 512 rows, 7,500 canonical CBOR bytes per signed operation and
64 entries per operation container. At most 16 subject paths and 32 MiB native
proof bytes per observation. Bound proofs to at most 16 byte manifests and enforce
the aggregate policy budget, not 32 MiB independently per manifest. Native proof
completion keeps the selected root; fetching a different root starts a new
observation. Before/after network work is uncached, public, redirect-free and
credential-free with I1's approved SSRF/connect-time DNS protections.

Operational first-policy defaults are three attempts, 64 proof-completion requests
per attempt and a 30-second total deadline. Those do not expire admitted authority
or promise revocation latency. Replay has no resolver, network or clock. Retain
only public responses, native proofs and exact source: no OAuth tokens, sessions,
passwords, authorization headers or private keys.

## Minimal enforced role interface and fold metadata

Definition manifest version 2 retains the existing source/state/action/query/view
structure. Native service source-document version 2 retains B0's exact-byte outer
transport with this successor manifest; it does not become an enforced description
or new execution language. Keep B0's current-format version 1 unchanged.
Each action additionally requires exactly
one closed authorization member:

~~~text
{$type: defs#openParticipation}
or
{$type: defs#requiredRole, role: domainRoleName}
~~~

There is no omitted default, role expression, permission program, role union or
payload-dependent grant logic. Open participation skips only the app-role check;
it still requires one live admitted grant matching principal, signer, epoch and
this exact action/execution CID. Role assignment alone never admits a device.
This deliberately small rule supports public queues and member/admin workflows.
Payload-dependent domain checks stay in the deterministic fold; discovery cannot
promise their outcome without exact-payload local simulation.

Derive one actionContract content object with exactly this body:

~~~text
$type: defs#actionContract
semantics: application semantic CID
schemas: {stateRoot: full reference, actionRoot: full reference,
          closure: byteManifest CID}
fold: RawCID
authorization: openParticipation | requiredRole
~~~

The closure is canonical JSON of
{stateRoot, actionRoot, definitions}, with full normalized references, each
reachable schema visited once and definitions keyed by full reference. Preserve
schema descriptions and array order; exclude schema document metadata outside
reachable definitions. Canonical JSON bytes use the existing sorted-key function
and remain within the 512 KiB definition bound. Chunking prevents a large legal
closure from forcing an oversized 64 KiB contract block. Check reconstructed
canonical bytes, reachable completeness and bounds before deriving the CID.

Title, outer discovery/source-document transport, queries/views, unused files, source paths and
successor initial state stay outside ordinary execution identity. Validate the
entire source closure anyway. Do not trust author-supplied contract CIDs: derive
them from the validated exact source and compare. Unchanged fold bytes relocated
to another path keep identity; whitespace changes do not. Shared state-schema
changes affect all actions; an unrelated action or view change does not.
Retained file-table order likewise stays outside ordinary execution identity;
it remains committed by the source-definition CID under the preservation decision
above. Execution projection does not normalize or replace that retained source.

Evaluate fold with precisely the following owned plain-JSON metadata, converting
CID links to canonical strings and never exposing byte/link wrappers:

~~~text
meta: {app, genesis, position, principal, execution}
act: the signed payload object
state: the complete prior domain state
~~~

Do not expose source-definition CID, service contract, live identity responses,
query/view data or authority maps. Keep actorKey, grant ID/CID and epoch out of fold
metadata: they remain signed authorization details. Domain outcomes therefore do
not implicitly depend on device enrolment, grant renewal or account reset. No
time, nonce randomness, ambient imports or role lookup callbacks. This is a new
application semantic interface; it preserves the existing pure evaluator behavior
but does not silently reuse old application meaning. Adding metadata later requires
a reviewed semantic change and new execution identity.
Eligibility is checked against ordered authority at this position, followed by
input schema, deterministic fold and successor state validation. State, authority,
outcome, source, retry/descriptor indexes and frontier commit together.

## App control, owner and recovery operations

One signed typed control intent is the certificate. Its operation contains exact
position, prev and controlTip, plus one payload below. Initial controlTip is G;
an effective certificate advances it to the unsigned intent CID. An ineffective
request still consumes R0 identity but does not advance controlTip. Verify the
principal/key pair and its power in the prior appointment map before changes.
Native app publication is never an implicit govern or recover signature.

| Control operation | Payload and prior power |
| --- | --- |
| setControl | Complete sorted replacement map, preserving every prior recover pair and its entire power set exactly; govern |
| setRecovery | Complete sorted nonempty new recover pair list, at most 16 pairs; recover |
| setOwner | owner DID-or-null; govern |
| setRole | target DID, role, enabled, expectedAssignment CID-or-null; govern |
| activate | expected active definition CID, target definition CID, sorted unique complete source closure CID strings (at most 64); govern |
| recoverParticipant | target DID, expectedEpoch/expectedObservation, fresh selected epoch CID, observation CID; recover |
| recoverGovernance | Complete sorted new govern pair list, at most 16 pairs; recover and immutable recoverGovernance true |

recover outranks govern. Define a pair as the exact principal/actorKey tuple and
apply the following transformations to the prior appointment map, before advancing
the control tip. Authorize the signer against that prior map, never the replacement.

- setControl is a bounded whole-map replacement by govern. Every prior pair with
  recover must occur with its identical full power set. No new pair may acquire
  recover. Pairs without prior recover, including new pairs, may be added, removed or changed,
  and their resulting powers are a subset of govern/certify. This also freezes
  govern/certify bits on a mixed pair containing recover. A govern request stripping
  or altering any such pair is ineffective control_power, not a structural failure.
- setRecovery is signed by a prior recover pair. Its recovery payload is a sorted
  nonempty list of principal/actorKey pairs, without a powers field. Remove recover
  from every prior pair, preserve all existing govern/certify bits, then add recover
  to precisely that list. Drop a pair only if no powers remain. A listed pair may
  already hold lower powers; adding recover forms a mixed pair without inventing or
  discarding those lower powers. A new pair receives recover only. A signer may
  rotate itself and its peers, including removing itself, in this one transition.
- recoverGovernance, when enabled in genesis, replaces only govern membership by
  its sorted governance pair list. Remove prior govern bits, preserve recover and
  certify bits, add govern to the selected pairs, then drop empty pairs. Its list
  may be empty to intentionally remove governance. It changes no recovery power.

For every operation require the resulting combined map to fit 16 distinct pairs;
the individual input-list bound does not waive this check. A well-formed request
whose merged map exceeds the bound is ineffective control_map_limit. An empty
setRecovery list is structurally invalid under its nonempty Lexicon bound; the
first contract has no irreversible remove-all-recovery operation. setControl and
setRecovery no-change results are ineffective control_unchanged. This keeps one
certificate chain and explicit power sets without a permission language or quorum.

An independently held recovery key protects against compromise of a govern-only
key because that key cannot remove recovery. It does not protect recovery from
itself. Any one appointed recover signer can replace all peer recovery appointments
through setRecovery and, when enabled, replace governance. Compromise of one such
key may therefore maliciously eliminate every honest recovery path; compromise
of every recovery key is not required. Nonempty replacement does not prove anyone
still possesses an uncompromised private key. Loss/removal of all usable recovery
keys, or malicious replacement by a compromised recover signer, can require a new
genesis. Native DID/PDS account recovery cannot manufacture app-control powers or
relax a retained app floor. No threshold/quorum protection is claimed.

The 16-pair bound also limits recovery liveness. A one-for-one replacement of a
recover-only pair is count-neutral because the old pair drops. A mixed pair keeps
its lower powers when recover is removed, so replacing it can require an extra
slot. For example, R=[certify,recover] plus 15 certify-only pairs fills the map;
rotation R to a new pair gives 17 and is ineffective control_map_limit.
recoverGovernance alone cannot remove certify bits. If enabled, it can give
existing R the govern bit without adding a pair; R then uses setControl to prune
the non-recover pairs, and setRecovery can rotate. This three-step path describes
that specific example, not every possible full map. Without a usable govern key
or enabled recoverGovernance, a full map with mixed recover pairs may permanently
block rotation. No universal rotation-liveness guarantee is made.

Genesis and rotation tooling should recommend recover-only appointments, warn
about mixed recover pairs at the bound, and show the resulting combined map/count
before signing. Required vectors include the count-neutral recover-only case,
the mixed-pair overflow, the enabled three-step prune and the disabled/no-govern
blocked case. Keep the existing operations; add no reset or quorum rule.

certify is a recognized appointment power but authorizes no operation in this
first native wire. Default checkpoint assertions use native publication. P4 must
separately review the exact stronger checkpoint-policy/assertion bytes before
enabling any certify request. It must not silently add certifier signatures to
entries or infer replacement powers. This reservation does not make an unsigned
checkpoint independently verified state.

Only the current owner principal can use ordinary assignRole, through one live
referenced grant explicitly listing that role in assignRoles. This changes a
domain assignment, not owner/control powers. No target account resolution is
needed. Domain role revision is the last effective assignment intent CID, or null
if never assigned. Disabled assignments retain their revision. Compare the exact
expectedAssignment; a stale race is ineffective. A no-change assignment is an
explicit ineffective role_unchanged and does not replace its revision. Removing
the owner does not erase ordinary grants or prior assignments.

setOwner/recoverGovernance similarly reject no-change with control_unchanged. Activation
keeps current state, requires exact expected source and the same supported runtime
and complete state interface, and validates all supplied source bytes before
compatibility acceptance. Missing supplied bytes stall. A complete supplied
closure omitting a dependency or failing validation is ineffective invalid_activation.
There is no schema migration or broad action-contract override.

recoverParticipant requires an already appointed recover pair, its exact intended
app/control context and target expected epoch/observation. Its one fresh I1
observation proves the target's current pointer and fresh epoch transition at one
selected participant root. Neither the ID nor CID may have been accepted/retired
in this app. A restored old epoch requires publishing a fresh reset first. On
success it explicitly replaces that participant's epoch anchor/admission floor,
retains every older epoch as retired and every grant tombstone terminal, and keeps
all older grants inspectable but inactive. It cannot lower any reader's accepted
pair-scoped app floor or replace the app chain. Fresh grant IDs are required afterward.

A structurally valid signed control request may be ordered after its intended
position/predecessor: return ineffective control_context_stale, not invalid history.
This applies to recovery as well. Its observation's subject hashes the request's
intended context; verify complete evidence and consume that descriptor even if the
recovery certificate is ineffective. No replacement epoch/floor is applied on a
failed recovery. Ordinary account imports instead require their outer context to
match the containing entry exactly. Hosts refuse stale control work in preflight;
readers must still classify a maliciously published authentic stale request.

The I1/I2 owner confirmed this stale-recovery rule during preparation: a failed
recovery changes neither normal admission floor nor epoch; it still consumes the
verified descriptor. This is included in the required cross-runtime regressions,
not presented as executed evidence.

No automatic re-signing or retargeting follows CAS loss. Return the exact receipt
if that unsigned intent already exists; otherwise a new certificate needs fresh
deliberate consent, nonce and matching observation where required.

## Native publication, receipts and reader assurance

Use applyWrites with swapCommit for observation/entry creates plus head update.
Stage hash-verified immutable source/evidence records in bounded batches first;
their existence grants no power. A separate source-only/key-only/unrelated commit
does not add an app position. On CAS loss refresh selected native root and app
head, preserve exact signed bytes, and repeat R0 operation identity checks. Local
queues/leases help scheduling but are not leadership or authority. The maintained
[applyWrites Lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/repo/applyWrites.json)
supplies the native conditional-write surface.

Do not issue a receipt on an unverified write reply. Confirm exact native membership
under one authenticated root. Lost confirmation can return a later root proving
the same immutable request/entry; name that actual root, not an imagined original
write root. An original retained proof package keeps its own root unchanged.

Receipt version 2 contains app, genesis, request CID, position, entry CID and a
publication proof package: root CID, app-binding evidence reference and native
proof byte-manifest references. The exact receipt shape is:

~~~text
$type: defs#receipt
version: 2
app: DID
genesis: CID
request: CID
position: positiveSafeInteger
entry: CID
publication: {root: CID, binding: appBinding content CID,
              proofs: [byteManifest CID], head: CID | null}
~~~

proofs is nonempty, at most 16 manifest links, with local aggregate native-proof
budgets applied before materialization. If head is non-null, verify that record's
canonical path/CID and exact app scope and require its selected position to cover
the receipt; the proof package supplies its record bytes. Null makes no head claim.
appBinding's content body has exactly $type defs#appBinding, policy CID, principal
DID, binding {signingKeyDid, pdsOrigin}, typed before/after evidence and repositoryRoot
CID. Its principal/root must match the publication app/root; before/after derivation
uses the same I1 rules. Retaining this snapshot is not an automatic currentness
claim. Bootstrap/restore must receive caller-accepted binding provenance; a
package cannot appoint itself by including its own web document. No appBinding
is required to be a member of the root which it names, which would create a
publication cycle. It can be retained locally or published afterward as immutable
content. Observation descriptors, by contrast, require their original app-native
publication proof as stated above.

request means unsigned intent CID or complete
accountOperation CID according to its authenticated entry. Expected native paths
derive from app/G/position; no caller-selected path alias is trusted. A proof package
also retains the head record CID/value if it claims inclusion within that root's
selected head. Later proof renewal names a new root/package for the same request,
position and entry; it never relabels old proof bytes.

Report independent assurance dimensions, not a single trusted flag:

| Dimension | Claim |
| --- | --- |
| publication | One authenticated native root proves the exact entry at its canonical path; head membership only when supplied |
| prefix | none, accepted-boundary-reuse, or audited-through position/CID, with declared R0/descriptor uniqueness coverage |
| interpretation | unavailable, or exact replayed frontier/state contract; never implied by sparse publication |
| identity | plc-audit-v1 or web-observation-v1 and appointed policy CID for each relevant binding |
| checkpoint | none or native-publication-v1 assertion; stronger certification requires P4 |

A sparse receipt does not prove the whole prefix, previous uniqueness, effective
authority, materialized state correctness or newest root. Those labels are derived
local verification results, not self-authorizing receipt assertions.

P2's default warm reader checks current genesis/head, its accepted boundary entry
and the suffix at one selected native root. Retain accepted prefix and prior native
blocks; getRepo since revision and exact-CID completion avoid replaying old native
proofs. Missing nodes are unavailable, while authenticated absence is a distinct
fact. Do not combine another root's membership proof into the selected root.
Current-map audit of every historical path and complete native-tree audit are
separate explicit costs. The [repository specification](https://atproto.com/specs/repository)
defines the mutable native map and root-bearing CAR diffs; reuse of a previously
accepted app prefix is this application's additional assurance choice.

Account-wide native root/revision/key caches are shared across app namespaces;
accepted app prefixes, retries, participant floors, consumed observations and
state are scoped to app DID plus G. Native revision/root is an advisory fetch cursor
and contradiction evidence, not an app acceptance floor. A lower revision or equal
revision/different root requires a full selected-root fetch under I1-accepted
binding, preserving every known pair-scoped app floor for that account. No missing,
conflicting or unavailable old app is silently skipped. An authentic restored
root can resume if those checks pass. A new G never erases an older app floor.
I2's participant admission floors retain their separate recovery exception.
PB1 must check already observed MST interval faults before reporting missing
blocks/resource limits; an exposed invalidity cannot be hidden by an unavailable
child. Missing/corrupt source/evidence
may leave verified ordering ahead of interpretation, with exact stalled frontier.
No response secretly returns/copies all old entries/outcomes for a one-entry update.

## Retention and deterministic classifications

Keep exact genesis/semantic/policy objects, source closures for every accepted
activation, signed requests and entries, all consumed observations and chunks,
selected native commits and necessary MST/record blocks, trusted app binding
evidence and checkpoint/retry/authority frontiers. Shared chunks/blocks are stored
by CID once. Retained data is public and permits credential-free offline replay.
Device-local key/draft/history storage has no Atseq encryption-at-rest guarantee;
this native format adds none. P3 owns durable storage/export implementation and
P4 owns checkpoint assertions; neither may deserialize an untrusted archive as an
authenticated capability or discard authority/retry indexes without weaker labels.

Use one shared validation/authority evaluator. The proposed stable reason groups
below are framework-reserved outcomes; user fold reasons remain in their existing
separate result namespace. Freeze precise members in conformance vectors before
implementation review, not arbitrary host exception strings.

| Verdict | Required cases / proposed reason |
| --- | --- |
| Invalid history | Noncanonical/malformed framework bytes, wrong app/genesis/path, broken chain, unsafe position, invalid actor/control signature, duplicate R0 identity, second descriptor consumption, context/subject substitution, native signature/CID mismatch, proven absence of claimed required record |
| Stalled / unavailable | Unfetched evidence/source/MST nodes, unsupported semantic or observation policy, local native-proof/resource/deadline limit, dependency/integrity fault, persistence failure; no partial advance |
| Ineffective ordinary | grant_unadmitted, grant_revoked, grant_epoch, grant_signer, grant_scope, grant_conflict, role_missing, execution_changed, unknown_action, invalid_action, fold_failed/code, or the fold's deterministic denial |
| Ineffective normal account import | observation_rollback, observation_conflict, epoch_conflict, epoch_reused, grant_scope, grant_conflict, grant_revoked, authority_stale, authority_unchanged; accepted normal observation may still advance its floor |
| Ineffective role/control | role_owner, role_scope, role_stale, role_unchanged, control_unappointed, control_power, control_map_limit, control_tip_stale, control_context_stale, control_unchanged, recovery_epoch_reused, invalid_activation, incompatible_definition |

Determine a stable precedence rather than choosing whichever failing predicate a
host happens to check first: structural/target/signature and retry-history validity;
required evidence availability/authentication; operation context and expected
frontiers; prior control power or live grant/epoch/scope; app role; exact execution;
input schema; fold; successor state. For a control request test intended context,
then tip, appointment and power. For an act test admission, immutable CID, revoke,
epoch, signer, scope, role and execution. Unknown semantic interpretation cannot
become a domain denial. A diagnostic error code from I1/P1 is not automatically
an ordered ineffective reason.

Known malformed/oversized identity source during online preparation prevents
admission and creates no entry. A published descriptor claiming valid evidence
which fully supplied bytes contradict is invalid history, except a documented
operational evidence limit that the reader cannot process: unavailable. Keep the
distinction between invalid proof, local capacity and a well-formed but ineffective
grant. Grant deletion, resolver outage or handle change alone never rewrites an
already accepted outcome.

## Counterexamples and implementation gates

### Required NW0-1 and NW0-2 vectors

R1, R2, R3, G1 and G2 below denote distinct canonical principal/P-256-key pairs.
Each vector uses valid signed context/control tip unless the case explicitly
changes it. Power sets are shown in sorted order. Let M be the exact prior map:
R1 = [certify, govern, recover], R2 = [recover], G1 = [govern]. These are required
fixture inputs/expected transitions, not claims that runtime tests have run.

| Vector | Exact expected result |
| --- | --- |
| G1 setControl omits R2 | Ineffective control_power; M and controlTip unchanged; authentic request's R0 tuple consumed |
| G1 setControl changes R1 to [recover] or adds certify to R2 | Ineffective control_power, including changes only to lower bits of a mixed recover pair; same unchanged authority result |
| G1 setControl preserves R1/R2 exactly and replaces G1 with G2 [govern] | Effective; only govern-only pair replaced; tip becomes that unsigned intent CID |
| R2 setRecovery selects [R3] from M | Effective exact map: R1 [certify, govern], G1 [govern], R3 [recover]; R2 absent; no owner/role/participant changes |
| R3 recoverGovernance selects [G2] from the preceding result | Effective exact map: R1 [certify], G2 [govern], R3 [recover]; no recovery/certify changes |
| R2 setRecovery selects [R1, R2] from M | Ineffective control_unchanged; adding an existing recover bit does not create a new revision |
| R2 setRecovery selects the empty list | Structurally invalid; no host append/R0 consumption; a published occurrence is invalid history |
| Replacement recover list has 16 new pairs while 15 retained govern-only pairs remain | Ineffective control_map_limit because combined map has 31 pairs; neither tip nor map changes |
| A new R3 signs an operation which would appoint itself | Ineffective control_unappointed under prior M; proposed replacement does not authorize its signer |
| One compromised R2 selects only attacker-controlled R3 | Can be effective, exactly as the replacement vector; disclosure must say one recovery-key compromise may remove all honest recovery paths |
| Valid recovery/rotation with stale position, predecessor or controlTip | Ineffective control_context_stale/control_tip_stale under fixed precedence; no appointment changes |
| Valid act at the same app/genesis/position/principal/execution uses another independently eligible P-256 device and exact grant/epoch | Exact five-field fold metadata and fold result equal for equal payload/prior domain state; authority checks/indexes retain the actual distinct signed details |
| Program attempts ambient metadata key/grant/epoch lookup | Those metadata properties are absent, never injected from authority state; retain exact behavior under existing undefined/result rules |
| P-256 device/control key versus secp256k1 target/control signer | Canonical P-256 imports/signatures work; secp256k1 is rejected as a device/control key even when it is a valid native repository key |
| Native repository proof signed by either supported curve | P1/I1 accepts valid P-256 or secp256k1 under the accepted binding; neither silently appoints app-control power |

For each effective/ineffective vector freeze literal canonical record/request
bytes, unsigned/signed CIDs, first retained signature, exact map/owner/roles,
control tip, outcome reason and R0/descriptor index changes. Check Node and Chromium
against the same fixtures and compare whole retained authority state; do not test
only a UI success message. Include exact retry after rotation, old removed recovery
signer refusal, mixed-pair target addition/removal, invalid points/alternate key
encodings, combined bound at 16 versus 17, and no-change/error precedence. These
vector bytes/CIDs remain an implementation gate and are not fabricated here.

Key import, enrolment and recovery documentation must distinguish P-256 device/
control signing from the two supported repository curves. A secp256k1 repository
key cannot be imported or appointed as a control signer. Do not infer an appointment
from a current DID document/PDS key or coerce one curve into another. Native account
rotation/recovery and app-control recovery remain separate operations. Before a
human rotates recovery, the flow must make the target pair, surviving recovery
pairs, resulting combined map and single-key authority consequence reviewable;
advise validating access to the target private key because nonempty public-key
membership is not possession evidence. State where imported private keys are held
and the existing device-local encryption-at-rest limitation. These are requirements
for the implementation/key-import docs, not new signatures or a quorum mechanism.

| Counterexample | Required evidence |
| --- | --- |
| Two apps share one repository; another client writes unrelated records | Both app chains remain separate, shared swapCommit race is retried, native key/root cache advances without inventing app positions |
| Broad third-party collection writer forks/reorders valid device work | Authentic publication can occur; returning prefix/floor detects encountered conflict; fresh reader sees only its selected branch |
| Grant role A and another grant role B, neither sufficient alone | No scope union; one referenced exact grant plus the independently ordered role is required |
| View-only activation while queued A waits | A's execution and grant stay valid; full source activation remains exact and validated |
| Owner/grant signer attempts activation or self-appointment | Authentic request ineffective; current owner/role does not imply govern/recover |
| Compromised govern-only key removes recovery or edits a mixed recover pair | Ineffective control_power; map/control tip unchanged, R0 identity consumed |
| One compromised recover key replaces all peers with its key | Can be effective under the declared single-signature rule; retain and disclose lost honest recovery, never claim a quorum/all-key protection |
| Exact signed action retried after reset or activation | Original receipt/outcome returned before current authority checks; different intent with reused nonce refused |
| Descriptor inserted in a second entry or rebound to another request | Invalid history; proof-derived exact retry does not append |
| Fresh observation repeats identical revoke at a new context | New operation/descriptor, stable no-op, accepted normal floor retained |
| PLC full log selects an earlier active operation | Invalid evidence even if that old key/PDS matches the proof |
| Participant restored lower revision but only current DID control | Normal import ineffective; appointed recovery plus a never-accepted fresh epoch required |
| Recovery certificate loses app CAS race | Exact retry finds original if present; otherwise stale request consumes its descriptor but changes no floor/epoch; second use is invalid, with no automatic retarget |
| App key rotates without data changes, or selected proof misses a node | Refresh binding; root-specific missing completion stalls; neither becomes an app action |
| Original receipt proof retained after native record deletion | Original snapshot still authentic; current-map audit separately reports deletion; no historical-root getRecord claim |
| Giant schema closure / PLC audit / native CAR | Chunk retention stays within block bounds; normative consumer and local proof budgets remain distinct |
| Archive supplies fabricated web app binding | Archive cannot appoint its own initial app trust; explicit pin/binding trust decision remains required |
| Strong checkpoint requested with only certify appointment | Unsupported until P4's exact policy/assertion contract is reviewed; no invented state-verification claim |

Independent assessment a5f46ba7 accepts decisions 1–4, 6 and 7 below. This successor
applies its required NW0-1 authority correction and adopts NW0-2 for decision 3.
Ratified confirmations 4d4f6f8d and 83cd03d4 adopt the corrected disposition.
Runtime/Lexicon changes still require literal byte/vector and implementation review:

1. Adopt version-2 native genesis/head/entry/intents and the content record closed
   union, with account records version 1 and canonical paths above.
2. Adopt the omitted-observation subject projection, one-use descriptor rule and
   explicit stale-recovery behavior, including no failed-recovery floor replacement.
3. Adopt one required role or explicit open action rule, exact metadata fields and
   chunked canonical reachable schema closure, with unchanged evaluator semantics.
4. Freeze observation policy within genesis and split native/application semantic
   descriptors from independently versioned service contracts. Policy replacement
   and stronger certify operations remain separately reviewed extensions.
5. Adopt recover above govern; recovery-preserving setControl, nonempty recover-signed
   setRecovery and govern-only recoverGovernance replacement, with exact mixed-pair
   merging and combined-map bound; explicit owner revisions, no expiry/permission DSL.
6. Confirm P2 boundary reuse and honest publication/prefix/interpretation/identity
   labels; confirm complete retry/descriptor coverage before claiming audited prefix.
7. Preserve unique retained file-table order and declared unused assets in native
   manifest version 2, with exact path/CID-set checks and byte/identity roundtrips;
   keep newly constructed omitted tables sorted without rewriting supplied ones.

Implementation then requires exact byte/CID/signature vectors for every record
and operation, both Node and Chromium results, native PDS sparse membership/CAS
and lost-confirmation/crash cases, every classification above, complete retained
offline replay with all network/token access disabled, and conformance/provenance
against reviewed semantic descriptors. Verify actual scoped OAuth on a real
provider in A2 separately from disposable PDS fixtures. Measure source/evidence
sizes, per-suffix work and aggregate I2 grant-search budgets. No unrun case in this
note is a result, and the NW0 decision does not itself complete N1/I2/P2/P3/P4.

## Descriptor split to implement

Use descriptor names atseq-native-v1, atseq-app-native-v1 and atseq-service-v1;
their own content bodies carry name and version 1. Keep atseq-jsonata-v1's exact
evaluator descriptor if its pure evaluation rules stay unchanged. Record/manifest
version 2 and descriptor version 1 serve different boundaries and are not aliases.

nativeContract contains the canonical wire, typed framework record/object schemas,
signature/retry/path rules, observation consumption/authority rules, deterministic
reason precedence and immutable observation-policy interpretation interface.
applicationContract references nativeContract and the existing evaluator descriptor,
plus manifest/source/schema/activation, enforced authorization, action-contract
derivation, metadata and fold outcome rules. The supported observationPolicy CID
is a genesis input; account proofs cannot change it. Descriptors are canonical
content objects with approved expected CIDs and retained conformance vectors;
the host cannot manufacture a new trusted profile simply by hashing its code.

Large canonical schema/descriptor collections use bounded byte manifests rather
than expanding a CBOR block beyond 64 KiB. Descriptor identity includes those exact
hash links; it cannot rely on mutable installed Lexicons. No descriptor pins its
own CID or an application genesis which contains it. The implementation report
must retain the final literal descriptor objects and approved expected CIDs, not
only these prose labels.

Keep invalid DID syntax, unsupported method and supported-method resolution failure
as distinct diagnostics. The new native DID bound follows ATproto instead of the
spike's 256-character genesis field; every enclosing block/JSON bound still applies.
No claim that all maximal arrays of maximal strings fit one block follows from
their individual bounds.

serviceContract has its own version/CID and typed describe/list/create/submit/sync/
receipt/source/query/preview/draft/activation-comparison RPC schemas and discovery
description. Its version and supported application semantics are reported by the
service, not embedded in G or an action execution descriptor. Signed object and
record validation schemas belong to nativeContract even when an RPC references
them. Routine service descriptions, pagination, diagnostics or transport changes
therefore do not change app consent. An actual semantic/wire change still requires
a new supported native/application descriptor and explicit new app trust choice.

Source/dependency build provenance remains separate from all three identities.
Implementation must replace the present logDescriptor's inclusion of every RPC
Lexicon with these explicit sets, inspect the final diff rather than an automatic
all-imports list, and retain positive and negative identity vectors: editorial
service edit unchanged semantics; authority/metadata/action-role edit changed
semantics; view-only edit unchanged action contract; exact fold-byte edit changed
contract. B0's current v2 migration remains the reviewed current-format change;
this proposal does not retrospectively relabel it.
