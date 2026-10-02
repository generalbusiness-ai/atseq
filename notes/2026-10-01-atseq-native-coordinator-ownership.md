# Native execution: one private coordinator

Date: 2026-10-01

This is the source-only N1-D5 decision packet for request
`8cd6eee91eaefd263003ac2d63bdb7286c47ee28` and promise
`cf2dc06b8f67731bee3f004ae6dda375f78b441e`. It proposes the missing native action,
activation and query integration. No runtime change or executable conformance
test is included. The accompanying vectors are unexecuted acceptance requirements.

## Recommendation

Keep the asynchronous application coordinator beside I2's private authority
state in `src/application/native-authority.ts`. It owns the current admitted
source, domain state, authority, outcomes and one immutable generation. Reuse the
existing authority rules, source owner, maintained schema validator, evaluator
and serial queue. Do not export an operation that completes a transition from
caller-supplied state, source facts, outcomes, permission callbacks or booleans.

At genesis, derive the complete source closure inside the existing bounded source
owner from hash-verified root metadata. Genesis needs no new field or supplied
closure vector. Activation continues to use its exact signed closure vector;
derivation must never repair that vector.

This is the smallest route to a complete producer without a second permission
evaluator or a broker between new transition brands. It does not add a host,
public supported-profile registration, native prefix reader or trusted restore.
Those remain separately reviewed integration gates.

## Exact basis and limits

The inspected base is approved main
`098d3dffb04998d43eb51bb3ab6b9f38cce03b20`. Its runtime matches the earlier
`db0c81747f17f180a034c67791ff1cd287c67a6a` checkpoint foundation. I2 already
authenticates selected native publication and retained identity/participant
evidence. Its immutable authority transition covers account operations, grant
administration, roles, control and recovery. Ordinary act and activation still
throw unavailable errors.

The inspected source-owner implementation is
`378880b45d178a6f4cbdfece7327626df7f4e7fc`, candidate
`9f00c861d6b77609010c8ed6d844bb6725dc83d6`. It copies its target before awaiting,
verifies complete source and returns facts directly. The independent D4
assessment `5dc2b51f6b768c80d3e7311f654d1191aea869df`, ratification
`077b410509bd94ffb5a84b573872a33b931cbc93` and adoption
`5c54cc850851313a6de6096874f477543d72bac6` supersede the earlier assessment-token
proposal. There is no queued or cached source-result handoff requiring that extra
token. This coordinator must call the owner directly and consume that return in
the same captured operation.

The inspected P4-F2 candidate is
`c84a52e690873a16611a1a8c82f9ff1ae354c3ed`. Its native outcome parser validates
closed data; it cannot prove an outcome's producer or authorize execution. Both
implementation candidates still require their own independent exact-head review.
D5 approval must not stand in for either review.

The [source pins](../experiments/post-spike-evidence/2026-10-01/native-coordinator-d5/source-pins.json)
record exact commit, path, byte count and SHA-256 for 20 inspected files. Existing
source packets and captures are unchanged. This note changes no dependency,
schema literal, semantic CID, supported profile or public export.

## Bootstrap from the external pin

The application entry point takes a checked external `NativeAnchor`, a source
reader and local resource options. It rechecks the anchor's complete genesis
against the explicit app/genesis pin rather than trusting an arbitrary object
or archive label. A pin appoints the genesis control pairs, owner and roles; it
does not authenticate native publication or establish a current account key.

Before creating an application instance, check compiled native conformance and
require `genesis.semantics` to equal the compiled native semantic CID. Require the
initial definition to use the compiled application semantic CID. Unknown support
is unavailable; caller descriptors or discovery objects cannot register support.
Native publication authentication remains a separate obligation of the native
bootstrap/prefix integration, using the retained I1 binding policy. This internal
pin-based bootstrap must not advertise that additional assurance.

Add one internal genesis admission route to the existing source owner. It receives
the exact root from checked genesis, not a caller source object, closure vector,
validator or support registry. Within the same collection attempt it:

1. Streams the selected root through the existing maintained SHA-256 check and
   bounded retention. Hash disagreement, missing bytes and local read limits
   remain unavailable. A completely verified oversized root is invalid source.
2. Decodes its owned canonical root bytes and validates the root's file metadata
   sufficiently to select only its declared raw-CID dependencies. Malformed root,
   codec, file/count or canonical-shape facts reject bootstrap at their existing
   checked source branches.
3. Derives the distinct root-plus-file CID set, with deterministic ordering, and
   verifies every selected dependency. Duplicate named occurrences still count
   toward decoded occurrence bytes. Do not fetch undeclared global-pool repairs.
4. Runs the existing complete closure, canonical logical CAR, decoded occurrence,
   schema, initial state, program, query, view and projection checks. Share the
   verified root, retained bytes and per-attempt resource counters with the
   ordinary collector; do not add a second unbounded root read.

The collector's two selection routes are private implementation branches:
derive from verified genesis-root metadata, or preserve the activation's supplied
signed vector exactly. There is no exported trusted-mode flag. Refactoring this
shared collector must retain the source owner's existing corruption, normative
size, local capacity and semantic-mismatch precedence.

Fully supplied invalid genesis source rejects bootstrap without an invented
outcome. Unavailable source/support prevents an instance. On successful admission,
copy and freeze the owner's validated initial state and then initialize authority
with the existing `openNativeAuthority` rules. Its active definition must equal
the admitted root. Genesis roles retain revision G. No grants are inferred from
roles or control appointments.

## Owned generation and nonforgeable routes

The application container has one private current generation. A generation holds
the checked anchor, actual `NativeSourceDefinition` capability, owned frozen
domain JSON, actual `NativeAuthorityState` capability, complete owned outcomes
and the identity of this exact generation. Frontier and consumed identities come
from that authority, rather than a second independently mutable index. Snapshot
methods return owned data copies and never reveal mutable private maps.

The container's constructor/registration operation is private at runtime, not
merely a TypeScript `private` declaration on an exported constructor. A
nonexported implementation class can keep its genuinely private fields while
the module exports only checked bootstrap and operational access. Bootstrap is the
only route that registers its first generation. No public or internal exported
factory can register a caller projection, authority snapshot or chosen domain
state as an accepted application. The container may be a class with genuinely
private fields; there is no need for an additional application token solely to
make its data look opaque.

Entry processing runs through the existing `SerialQueue`. At operation start it
captures the exact generation, source capability, authority capability, domain
state, current outcome array and frontier. Authentication receives that captured
authority. `authenticateAuthorityEntry` checks content/signature, context/retry
identities, app publication, appointed binding and required observation evidence
before the producer interprets it. A forged, copied, prototype-derived or parsed
authenticated-entry token fails its existing WeakMap read.

I2 mints a private eligible-action capability only after its ordered checks pass.
Its private WeakMap binds the actual captured generation/authority, authenticated
entry, selected admitted definition, actual action capability, payload and exact
five-field metadata. No mint/register function is exported. The sole consumer is
the colocated producer, which checks WeakMap membership and exact identity of
all those captures. A definition/action capability alone, a contract CID, an
outcome parser result, a copied role row or a caller boolean cannot enter this
route. No consumer accepts an eligibility substitute supplied by a caller.

The source owner remains the only source provenance authority. Add narrow
capability-checked schema methods there for state, action payload, query params
and query result validation. Each method first reads the private definition
WeakMap. For an action it also requires that definition's private action map to
contain the exact supplied action capability. It never accepts a `Schemas`
instance, mutable schema document or validation callback from the caller and
never returns the private validator. Query program selection likewise comes
from that actual admitted definition, not caller source text.

These methods reuse the maintained `@atproto/lexicon` validator and its existing
no-coercion check. Validating data does not mint permission, choose an active
definition or restore authority. Source files returned for display remain owned
copies. No new query capability is needed when the coordinator already holds
the admitted definition and owns selection of its query binding.

## One action gate and exact outcomes

The existing `liveGrant` implementation serves both ordinary acts and ordinary
owner role administration. Extend its operation typing without copying its
admission, immutable CID, revocation, epoch or signer predicates. For an act,
continue with the exact signed action/execution pair in that same grant. Then
check action existence in the complete admitted active map, required role,
current derived execution and input schema in the adopted order. Open
participation skips only the role check. Unsupported or unavailable selected
source is not a grant denial.

The producer uses `nativeFoldMetadata(entry)` and owned payload/current domain
state. Metadata contains exactly `app`, `genesis`, `position`, `principal` and
`execution`, with canonical CID strings. Actor key, grant, epoch, definition CID,
authority, clock and caller callbacks remain absent. Distinct eligible devices
therefore produce equal fold input and domain results for the same principal,
position, execution, payload and state.

Reuse the compiled `application-rules.json.foldFailureStages`, checked by the
existing native source conformance gate. Do not invent another reason table or
copy all public interpretation errors into an outer catch. Only an exact typed
`InterpretationError` at the designated producer callsite, with a code allowed
for that stage, becomes an ineffective outcome:

- Input schema's `schema_value`/`schema_coercion` become `invalid_action`.
- The 15 designated evaluator/fold codes become `fold_failed/<code>`.
- Successor schema's `schema_value`/`schema_coercion` become their designated
  `fold_failed/<code>`.

Framework outcomes have `source: 'framework'` and no replicated message. An
authored fold denial has `source: 'fold'` and retains its exact bounded reason
and optional well-formed message. Fold output cannot inject its own source field.
Validate the completed outcome against the shared closed native DATA parser as
a conformance check, not as producer evidence. Unexpected parser/static source,
engine, dependency, proof, persistence or foreign constructor failures escape
without an outcome or partial advance.

## Activation and coherent queries

Reuse the existing control prefix: context, tip, prior appointment and govern
power. Then compare the signed expected active definition; stale expected source
is `definition_changed` before any target fetch. Owner/participant role or device
grant does not authorize activation.

For an authorized current request, capture its exact target root, signed closure
vector and compiled application semantics, then call `assessNativeSource`
directly. No API accepts a precomputed, prefetched, cached or caller-shaped source
fact. Reader callbacks sit outside classification catches: even a real public
`invalid_activation` error from a reader must escape without a replicated denial.

The owner return maps proven invalid source to `invalid_activation`, or different
semantics to `incompatible_definition`, at that actual callsite. Full signed-byte
availability and normative closure checks precede semantic comparison; a
different semantic pin beats unsupported target program interpretation. For an
admitted successor, compare complete state-only projection bytes, not merely
roots, action IDs or a caller asserted hash. Different interface is
`incompatible_definition`. The successor validates captured current state;
known validation rejection is `invalid_activation`. Its own initial state was
validated separately during complete admission and never replaces current state.
No migration or extra activation no-change reason is introduced. Only effective
activation changes active source and control tip.

Queries capture the actual current source and an owned state/frontier snapshot
before awaiting. The owner selects and validates params, program and result.
Concurrent entry processing cannot relabel the answer with a newer frontier.
Query failures are unavailable results; no authority, state, consumed identity,
outcome or frontier changes. Runtime diagnostics are bounded local information,
not replicated outcome messages.

## Atomic commit and persistence boundary

After every asynchronous authentication, source or evaluation phase, compare the
exact captured generation with the current private generation before consuming
results. In particular, perform that check before classifying an owner result
and before calling persistence. Stale results do not become stale-source denials,
retry consumption or a replacement transition. Never recompute eligibility on
an intervening generation to make the old continuation succeed.

Construct one owned successor only after the entire operation succeeds. Existing
authority rules produce its authority changes; private finalization adds request,
retry/descriptor consumption and advances the frontier exactly once. An
authenticated ineffective entry retains domain/source as applicable while still
committing its proper authority/index/frontier changes. An exception commits none
of them. Outcomes are appended to a new owned array rather than mutating the
captured generation's array.

If configured, persistence receives an owned complete successor snapshot and
must succeed before memory changes. It is an I/O callback, not an authority or
outcome evaluator. It cannot supply replacement state, source, permissions or a
completion result. Mutating its snapshot cannot change the producer's successor.
After it returns, recheck the captured generation and replace the current private
generation in one synchronous step. No await occurs between final base check and
replacement. Only then return a committed local result to downstream consumers.

This assumes the callback atomically stores the complete projection or rejects
without a durable partial write, does not mutate private container fields, and
does not await a queued reentrant update on that same container. An uncertain
commit, process crash or external competing writer requires P3's separately
reviewed durable transaction/restore integration. D5 does not claim to solve that
by an extra callback flag. A volatile container's failure leaves its prior memory
unchanged but cannot certify that arbitrary external storage did nothing.

Native entry publication normally already exists at replay time; this coordinator
does not publish it. A future host must not expose a committed outcome/materialized
state/checkpoint assertion before its complete local commit. Native append CAS,
ambiguous publication retry and crash recovery remain host/PDS gates. Native
publication proof never substitutes for interpretation or persistence.

## Acceptance and remaining work

The [decision vectors](../experiments/post-spike-evidence/2026-10-01/native-coordinator-d5/decision-vectors.json)
are proposed expectations, not executed tests. Implement them with the same
portable Node/Chromium corpus and probes of actual compiled production output.
Pin canonical entry/request bytes, signatures, metadata, domain state, complete
authority/index projection, outcome and frontier. Retain existing I2 and source
owner conformance rather than replacing them with narrower coordinator tests.

Healthy processing and retry after each unavailable source/evidence/evaluation
or persistence boundary must end with byte-identical state, source identity,
authority, outcomes, consumed identities and frontier. Also compare fresh replay
from pinned genesis. Plain checkpoint JSON is not accepted restore: trusted
checkpoint bootstrap and durable restart need P3/P4 provenance and equivalence
gates. No test should claim those gates from retrying a still-live instance.

Independent review should approve or simplify closure derivation, colocated
private ownership, exact producer/consumer routes, stage classification and the
persistence assumptions before implementation. Then independently review the
exact implementation head and actual Node/Chromium/compiled results. Full N1/I2,
native host/public service, incremental prefix integration, trusted restore,
real providers, supported-profile registration and broader programme completion
remain open. No performance measurement or runtime check was run for this packet.
