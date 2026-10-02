# Native source admission and execution capabilities

Date: 2026-10-01. Status: source-only decision proposal; no runtime implementation
or supported-profile adoption.

Request `d67d16683c2b6eae0f036ea8c87c6d225cdf746d`, promise
`83c7b891f6051624c17147ef47879e4202da79db`, under the continuing N1 programme.
This note starts from frozen N1-F1 candidate `a75f950a`; it changes neither that
candidate nor its source/captures. C0's per-action direction was adopted in review
`3dcab9c1` and report `55d74888`. NW0's concrete source/action interface is
`10e656b3`, reviewed by `a5f46ba7` and corrected confirmation `4d4f6f8d`.
Initializer assessment `83cd03d4` adopts G/null/disabled intent revisions.

Independent assessment `62d654857e18db90ab6690ed243ffe968d1ecb03` accepted
the design structure at frozen `4ad0d904`, with decisions D2-1 and D2-3 and
bound-order clarification D2-2 to record before freezing literal vectors.
This successor chooses raw projection-byte identity and the same editorial
annotation rule for both projections. It clarifies normative bounds before
smaller local capacity. These choices remain source-only; independent successor
confirmation and the implementation gates below remain open.

Admit exact retained native source under a compiled, reviewed semantic contract,
then derive private per-action capabilities from it. I2 must check those
capabilities against its accepted active source and ordered authority before
issuing permission to execute. A caller-supplied execution CID, parsed contract,
archive object, support boolean or authorization callback supplies no authority.
Ordinary actions and activation remain unavailable until this route is reviewed
and implemented with the native authority/fold integration.

## Current source and the remaining gap

The existing [loader](../src/definition/load.ts) verifies immutable files,
closed manifests, source bounds, schemas, initial state, programs and local
views. Its private TypeScript constructor is useful encapsulation, but it is not
a runtime proof brand. It accepts manifest version 1 and compares its profile
with the current application runtime CID. The [current descriptors](../src/core/contracts.ts)
include service RPC schemas inside log semantics. Neither is a native successor.

The [source bundle](../src/definition/source.ts) supplies owned hash-verified raw
and CBOR blocks, standard CAR framing and a closed retained reader. The
[source document](../src/definition/document.ts) preserves an explicitly supplied
file table and permits declared unused assets. The
[schema wrapper](../src/definition/schemas.ts) uses maintained ATproto validation,
checks the admitted subset and rejects coercion. The
[activation comparison](../src/definition/activation.ts) already walks reachable
state definitions and retains current state instead of the successor's initial
state. Its walk is evidence to generalize, not a complete action-contract loader.

Native F1 adds strict record/content framing, raw-file locators, chunks,
manifest version 2 authorization members and a preparation descriptor. It does
not admit an executable source or supported semantic contract. In particular,
shape-valid `defs#actionContract` is not an execution permission.

Reuse the pure [evaluator](../src/runtime/evaluator.ts), owned source primitives
and maintained schema validator. Add one native admission owner and one shared
reachable-schema projection. Do not teach the legacy loader that every native
version-2-shaped object is an approved current profile. Do not add an alternate
permission language, a source equivalence claim or a second source Merkle tree.

## Exact admission input and closure

A native definition root is the canonical version-2 definition record itself.
Its source-definition CID hashes its complete CBOR bytes, including title,
file-table order, initial-state binding, queries and views. `profile` in the
successor manifest names the supported application semantic CID and must equal
this app genesis's `semantics` when selected for that app.

The logical source CAR has exactly one root and the unique block set:

~~~text
{definition CBOR CID} union {each declared raw-file CID}
~~~

A file locator's native record CID is not that raw-file identity. Native locators
and byte manifests reconstruct exact bytes for the logical CAR; they do not
replace its identities. Semantic descriptors, native proofs and action-contract
projection chunks are retained separately from this logical source closure.

Require canonical CBOR, canonical raw SHA-256 CIDs, valid unique local paths,
63 or fewer named files and 64 or fewer distinct source blocks. Retain the
512 KiB CAR bound including framing, and the existing loader's decoded bound
counting root bytes plus each named file occurrence. Two paths may deliberately
name identical bytes: block storage deduplicates their CID, while the named-file
count and decoded bound still charge both. The rule is explicit rather than an
accidental dependence on a local cache.

Check normative declared lengths and counts before applying a smaller local
capacity. From verified framing/metadata, enforce the 512 KiB CAR and decoded
length limits, 64-block and 63-file limits, including every named occurrence.
A complete signed closure already exceeding a normative limit is invalid
activation after the prior authority/context check; do not fetch its bodies just
to discover that a smaller host cannot hold it. Only a normatively admissible
closure may stall because local capacity is smaller. Missing metadata needed to
decide the bounds still stalls; an unauthenticated transport length cannot prove
that the intended source is invalid. Actual reconstructed bytes must match the
verified declared lengths, and framing is charged to the normative CAR limit.

Fetch and hash-verify every source block needed for admission. Validate the entire
manifest and all declared files before publishing any admission/action capability.
Check duplicate Lexicon paths, document IDs, action references, query names and
view names; source references must resolve to declared retained files and schema
definitions. Check initial state, all fold/query programs and all local templates
as the current loader does. Unused assets must exist, match their raw CIDs and
fit bounds; arbitrary asset bytes do not become JSON or UTF-8 merely because they
are retained. Files actually used as JSON, text or programs receive those checks.
There is no partial definition that admits its good actions while skipping a bad
query, view or other declared binding.

Preserve supplied file-table order and assets. An omitted authoring table uses
B0's ASCII path-order construction. Do not sort, prune or rewrite a supplied
retained manifest. The native source-document transport keeps B0's closed shape
with version 2 and successor manifest. Omitted authoring `profile` may insert the
software's selected supported application CID before hashing; supplied `profile`
must match that selection. Export always includes the exact resulting manifest.
This authoring convenience never repairs a retained block or a signed activation.

Source bytes may arrive from a native content record, CAR, archive or another
hash-verified public store. Their authenticity follows the trusted source CID,
not an arbitrary store's identity. Intrinsic source admission is not a native
membership capability. If a surrounding proof package claims membership under a
selected native root, P1 must verify that claim separately; a later source fetch
must not be relabelled as membership in an old root.

## One strict interpretation of source JSON

For this new native profile, reject BOMs, malformed UTF-8, comments, trailing
commas, trailing data and duplicate decoded object names. Then apply the existing
owned JSON checks, safe integers, negative-zero exclusion, Unicode, depth and
size bounds. Escaped duplicate names count as duplicates. Source JSON does not
silently choose the last duplicate declaration.

Reuse I1's maintained `jsonc-parser` visitor machinery through a small shared
pure retained-JSON parser, with typed parse failures. Keep its identity adapter's
behavior unchanged. The source adapter maps a fully available source's normative
syntax/depth/size failure to source admission failure. It must not reuse I1's
operational `content_unavailable` limits as a replicated source verdict, or map
an unexpected interpreter/integrity fault to invalid activation. This is an
explicit new source-admission rule under the new application semantic contract,
not a silent edit to current v2 source meaning.

Preflight still uses the admitted pure evaluator subset. Expected failures from
missing placeholder state/action/query data do not by themselves invalidate a
program; the existing static-error classification must be retained as explicit
contract data. Unexpected parser, validator, stack, integrity or runtime faults
stall and mint no capability. Reuse maintained validation rather than claiming
the profile accepts every possible ATproto Lexicon type. Hostile recursive,
shared and long-reference fixtures are required before support is approved.

## One projection for state compatibility and action identity

Derive projections from owned decoded authored schema documents, not the
maintained registry's mutable `lex:`-rewritten objects. Resolve relative schema
references within their document, make default `main` explicit, and use complete
`documentID#definitionName` identities. The manifest's ordinary action reference
is already a full native action reference. Validate normalized roots against the
native contract's bounds.

Use an iterative worklist and visited identities. Follow only schema positions
and actual `ref`/closed `union` dependencies; do not reinterpret strings inside
descriptions or constants as references. Strip authored `description` annotations
only at document/schema annotation positions from both projections. Preserve
literal properties named `description`, constants, defaults, enums, constraint
values and array order. Normalize reference strings in copied schema nodes;
never mutate retained documents. Repeated or recursive referenced
identities occur once in the map. Reject unresolved or unsupported references.

Descriptions remain in the exact source and are available for display and
provenance. They do not affect validation, and no current consent UI presents
their wording as consented execution meaning. One stripped projection rule is
simpler: fixing an editorial typo does not require new grants or a new genesis.
This decision changes neither retained source identity nor the current profile.

The state-only projection is canonical JSON bytes of:

~~~text
{stateRoot, definitions}
~~~

The per-action projection is canonical JSON bytes of:

~~~text
{stateRoot, actionRoot, definitions}
~~~

Each contains all and only definitions reachable from its named roots. Document
metadata and unreachable definitions stay outside that projection. Bound the
resulting canonical UTF-8 bytes at 512 KiB. A legal-looking source whose derived
projection exceeds the bound does not mint a partial action capability.

The projection identity is the canonical raw SHA-256 CID of its canonical UTF-8
JSON bytes. Transport and retain those bytes with the exact F1 byte framing:
full 32 KiB chunks except the last, each inside its typed content record, plus a
length-bearing manifest. The byte-manifest CID is a locator, never the projection
identity. Hash the reconstructed bytes and check the raw projection CID. This
matches raw source-file identity and makes chunk framing independent of execution
identity without another identity wrapper. Derive exactly this
content record:

~~~text
{$type: ai.generalbusiness.atseq.content, version: 1,
 body: {$type: ai.generalbusiness.atseq.defs#actionContract,
        semantics: applicationSemanticCID,
        schemas: {stateRoot, actionRoot, closure: projectionRawCID},
        fold: rawFoldCID,
        authorization: openParticipation | requiredRole}}
~~~

This changes the proposed action-contract closure field from F1's CBOR manifest
link to a raw CID string. Its closed Lexicon/codec guard must change under the
reviewed native successor before use. F1's frozen schema, preparation descriptor
and fixtures stay unchanged; they do not accept this proposed successor shape.

The execution CID hashes this whole content record, not just its body, source
locator or a caller's declaration. Derive it from admitted source even when a
transport also supplies a contract record; compare the supplied record with the
derived bytes before using it. Do not accept a published contract as independent
proof that the source was admitted.

Changing an action's fold bytes, reachable schema or enforced rule changes that
action's contract. Adding an unrelated action, view, query, title, asset, file
path or retained file-table reordering does not change an unchanged action's
contract. A schema annotation-only description edit changes neither projection
nor action contract. A literal constraint or property edit still changes it.
The shared state interface enters every action. A successor's initial state is
validated but excluded from ordinary action identity because activation retains current
state. Action identity promises meaning, not the state or entitlement at ordering.

## Private capability chain

The source owner proposes these logical APIs; names can follow existing modules:

~~~text
LoadedNativeDefinition.load(definitionCID, retainedSource)
  -> admitted-definition capability
LoadedNativeDefinition.action(fullActionRef)
  -> native-action-contract capability or known absence
readNativeActionContract(capability)
  -> owned immutable {definitionCID, applicationSemanticsCID,
                      actionRef, executionCID, authorization}
~~~

Use module-private WeakMaps or private fields with explicit membership checks,
not `instanceof` or TypeScript privacy alone. No exported constructor, generic
`fromJSON`, caller-supplied support object, authorization callback or trust boolean
can mint a capability. Return copies of bytes and owned frozen projections;
private maps are never exposed for mutation. Loading an archive means verifying
its source and known semantic contract afresh, not deserializing a proof brand.
Admission carries source facts, not governance, publication or live grant authority.

I2's owner confirmed that its opaque snapshot owns `activeDefinitionCID`,
initialized from genesis and advanced only through validated activation. For an
ordinary act, I2 receives that prior authority capability, an authenticated entry
capability and an admitted definition/action capability. It must verify source
selection, application semantics and exact app/genesis/frontier before checking
one immutable live grant, epoch, signer, scope, ordered role and execution.
`openParticipation` skips only the role check. No grant union or inferred role.
Known absence in the admitted action map yields `unknown_action`; a missing
admitted source/semantic capability yields unavailable, never that denial.

I2 then issues a distinct private eligible-action capability bound to the exact
prior authority object, entry/request CID, frontier and admitted action. The
source capability alone is never sufficient. Fold execution uses the captured
private coherent projection, the authenticated payload and only the five metadata
fields `{app, genesis, position, principal, execution}`. Callers cannot substitute
payload, source, metadata, state or a newer frontier after authorization.

The folder owns that coherent prior projection and rechecks its exact base before
atomic commit. State, source selection, authority, outcome, retry/descriptor indexes
and frontier advance together. A capability minted before an intervening entry
cannot be committed against the newer projection. This is the same required
atomic fold boundary, not a new authority cache or independent transaction layer.
Local previews may use admitted source and the shared checks on a captured
simulation; preview results cannot mint the real authenticated-entry or eligible
execution capability and remain labelled by retained frontier/simulated position.

## Activation uses two stages, with no public authorization switch

First, I2 checks authenticated intent framing, retry history, intended context,
control tip, appointment and power against the exact prior authority. It checks
`expected` against the snapshot's accepted active-definition CID. No source fetch
is needed to turn a stale or unauthorized activation into its ordered reason.
Required native proof/identity evidence still precedes those verdicts; this shortcut
does not waive recovery's observation rules.

An authorized activation produces a private authorization capability bound to the
same prior authority object, entry/request identity, frontier, expected/target
source and exact signed closure set. Second, the source owner:

1. Obtains every listed signed closure block, verifies hashes and freezes a reader
   over precisely that set. A global pool cannot repair an omitted dependency.
2. Requires the set to equal the target root plus its declared unique raw files.
   Admits all source as above under the same supported application semantics.
3. Requires equal complete state-only projection bytes and validates the current
   state against the successor. No state migration or initial-state replacement.
4. Produces a prospective admitted-definition/compatibility capability. It does
   not appoint itself or commit state. I2 and the folder recheck the original
   authority/projection base before accepting it in the atomic next state.

An exact recorded retry returns its original result before fresh source or grant
checks. Two administrators can propose view-only successors with identical action
CIDs but the same expected source: only the first effective activation still meets
that expectation. Do not rewrite or automatically re-sign the second request.

## Concrete descriptor split and retention

Use three closed content bodies; the following are proposed exact field sets,
not literal approved descriptor bytes or expected CIDs. `name` and `version` are
constants, `namespace` is the owned framework prefix, and all links are canonical
CBOR CIDs:

~~~text
nativeContract:
 {$type: defs#nativeContract, name: "atseq-native-v1", version: 1,
  namespace: "ai.generalbusiness.atseq", schemas: byteManifestCID,
  rules: byteManifestCID}
applicationContract:
 {$type: defs#applicationContract, name: "atseq-app-native-v1", version: 1,
  native: nativeContentCID,
  evaluator: {cid: existingEvaluatorCID, bytes: byteManifestCID},
  rules: byteManifestCID}
serviceContract:
 {$type: defs#serviceContract, name: "atseq-service-v1", version: 1,
  native: nativeContentCID, schemas: byteManifestCID, rules: byteManifestCID}
~~~

Each is wrapped in version-1 native content. Native and application semantic
identities are their complete content-record CIDs. Genesis and action contracts
pin the application CID. Application pins native; neither includes the service
CID, app DID, genesis, installed dependencies or its own CID. There is no cycle.
A routine service schema/diagnostic/pagination change can change service identity
without changing application consent. Supported application CIDs are reported by
service discovery, not installed into genesis by a service announcement.

The evaluator link keeps the existing `atseq-jsonata-v1` descriptor's exact
standalone canonical CBOR CID. Its bytes manifest transports that exact block;
reconstruct and check the inner CBOR CID and compiled expected descriptor. Do not
wrap it and silently call the wrapper its old identity. This reuses generic byte
framing rather than adding a separate evaluator record collection.

The schema manifests contain canonical JSON arrays of explicitly selected
framework Lexicon documents, sorted by document ID. Native includes all signed
object/record/receipt validation shapes. Service includes only RPC shapes and
explicit references to native wire. Framework schema annotations named
`description` are editorial; strip only document/schema annotation positions,
never a literal property or a value inside `const`, `enum` or `default`. This
same annotation rule applies to the authored reachable-schema projections. Their
exact retained documents still preserve descriptions. Do not infer schema
membership from every file or import in the repository.

Rules manifests contain canonical JSON normative data with closed, reviewed
fields, bounded at 512 KiB each. Native must bind byte/path/signature/retry rules,
I1 observation interpretation, authority/control/role transitions and exact reason
precedence. Application must bind source/JSON/schema admission, raw projection
identity and transport framing, enforced authorization/metadata,
activation/state compatibility, fold/query/view behavior and deterministic
outcome/error rules. Service binds its
request/response and availability conventions. The actual complete rules values
and schema lists must be retained and independently approved before any expected
CID is adopted; this note's shorthand is not a hidden rules manifest.

Retain exact descriptor records, manifests/chunks, evaluator block, source closures
and per-action projection records/chunks in exports. Retain the raw projection
CID with its manifest locator and check both on reconstruction. Reconstruct all
referenced bytes offline. Published descriptor objects do not appoint themselves: a compiled
support registry has literal approved native/application/evaluator CIDs and their
objects/conformance. Hashing new code or arbitrary archive JSON cannot add support.
Unsupported semantics stall. Build/source/dependency provenance remains separate.
Maintenance changes preserving the same reviewed meaning and conformance need no
semantic CID change; meaning changes require new reviewed support and explicit
app consent/new genesis under the adopted same-semantic activation restriction.

## Deterministic failure boundaries

| Situation | Required treatment |
| --- | --- |
| Source capability or supported application semantics not implemented/available | Interpretation unavailable; no grant or domain verdict substitutes |
| Wrong source capability for the accepted active source or app semantics | Refuse the capability; do not override accepted selection |
| Malformed framework envelope/signature, substituted entry context or duplicate ordered retry | Invalid history before source interpretation |
| Missing/corrupt listed source bytes, smaller local capacity or unexpected runtime/integrity fault | Stall; keep complete prior projection |
| All listed activation bytes verified, but omitted dependency, extra closure block, invalid source/JSON, or normative bounds exceeded | Ineffective `invalid_activation` after prior authorization/context checks |
| Verified declared source lengths/counts already exceed normative limits, even on a host with smaller capacity | Ineffective `invalid_activation` before body fetch/local-capacity refusal; not a stall |
| Complete successor names different app semantics or changed state interface | Ineffective `incompatible_definition`; no runtime replacement/migration |
| Authentic live-grant act whose action is absent or current execution differs | Ordered `unknown_action`/`execution_changed`, after adopted I2 precedence |
| Deterministic input/fold/successor-state failure | Existing reviewed ineffective rules; retain prior domain state, commit coherent next frontier |
| Invalid fully supplied genesis source | No app instance; reject creation/bootstrap interpretation rather than retrying as a stall, with no invented genesis outcome |

Except for an already decisive normative declared-bound failure, before judging
activation source invalid, fetch and hash-verify every block in the signed set
as current activation does. A supplied wrong body for an expected CID
is corruption/unavailability, not proof that the intended source is invalid.
After that boundary, a manifest dependency omitted from the closed signed set is
invalid activation even if the host could fetch it elsewhere. Local retention
pool/proof budgets are operational limits, not changes to semantic source bounds.
No source-layer catch converts arbitrary foreign faults into replicated outcomes.

## Review and implementation gates

The decision request should approve the capability chain, strict native source JSON
rule, exact closure/bounds and descriptor field sets. The proposed body extension
must receive its own closed Lexicon schema/conformance review before native
registration; F1's preparation registry and captured hashes remain untouched.
Do not adopt prose labels as final expected CIDs.

The implementation review must retain literal complete descriptor/rules/schema
objects, independently encoded blocks and expected CIDs. Both maintained parser
and pure evaluator behavior need actual source-level and compiled-package checks.
Required vectors include:

| Vector | Required result |
| --- | --- |
| Same retained source through document, native locator/chunks, CAR and offline archive | Exact definition, action and descriptor identities; no credential/network fallback |
| Unused asset or file-table reorder | Changed definition CID; unchanged unaffected action CID; whole closure still verified |
| Move unchanged fold or add unrelated action/query/view/title | Unchanged surviving action contracts |
| Exact fold-byte edit, nested validation constraint/union-array change, or authorization-rule edit | Changed affected action CID |
| State-schema description-only edit | Changed exact source CID; identical state/action projections and execution CIDs; same-state activation remains eligible without re-grants/new genesis |
| Action-schema description-only edit | Changed exact source CID; identical affected action projection/CID; retained display/provenance wording changes |
| Literal property named `description`, or description-shaped value inside const/enum/default, changes | Retained in projection; changed affected identity as validation/meaning requires |
| Same canonical projection bytes transported with a different legal locator/framing | Same raw projection/action CIDs; each locator still independently hash-verified and checked under its supported framing |
| Shared state-schema edit | All action CIDs change; same-state activation restriction refuses incompatible successor |
| Recursive/shared reference, unresolved reference, alias/default-main normalization and maximal normalized root | One complete bounded projection or explicit source rejection/stall; no partial capability |
| Duplicate/escaped-duplicate JSON name, BOM, bad UTF-8, unsafe integer or negative zero | Native source admission refuses; current-profile behavior is not relabelled |
| Extra/missing signed source block versus missing transport bytes | Invalid complete closure versus stall |
| Verified declared length/count exceeds a normative cap and smaller local capacity simultaneously | Every host decides `invalid_activation` from the normative bound first; a legal closure exceeding only local capacity stalls |
| Published counterfeit contract, copied brand, forged prototype, arbitrary support object or mutated returned bytes | Cannot mint admission or eligible execution |
| Genuine capability for another source/genesis/frontier | Cannot replace selected source or authorize this entry |
| Grant/role change without action-source change | I2 ordered authority outcome, no execution-identity rewrite |
| Two same-expected-source view activations, or intervening entry before commit | Exact stale/context behavior, no partially committed state or source |
| Exact retry after revocation/activation | Original receipt/outcome; no second execution |
| Routine service RPC/diagnostic meaning edit | Service CID changes; application/native identities remain unchanged |
| Framework schema annotation-only edit | All three semantic identities remain unchanged under the explicit editorial projection |
| Framework role/metadata/authority/parse meaning edit | Native/application semantic CID changes as applicable; software cannot self-approve it |
| Fully supplied invalid genesis source | No app instance or retriable bootstrap stall |

These are pending vectors, not executed results. This source-only task ran no
build, test or benchmark. N1 native host publication, I2 authority and source
capability integration, S1 atomic fold and P3/P4 retained restoration remain open.
