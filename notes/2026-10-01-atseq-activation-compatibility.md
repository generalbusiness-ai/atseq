---
date: 2026-10-01
status: decision proposal; independent review and implementation pending
examined_at: cb3fd8472ccec1208b72e8adc81884ccfb1860d4
request: 6f758f21
---

# Definition activation and queued actions

Bind ordinary actions to one derived execution contract for the active definition,
instead of its complete source CID. Keep exact source-definition matching for
activation itself. This lets a view or query update preserve queued actions while
keeping changes to executable action meaning explicit. Prefer a single execution
contract initially: it is more conservative and simpler than separate contracts
for every action. An unrelated action edit will still invalidate queued actions.

This is a proposed replacement contract for N1/I2 to review and implement, not a
claim about current behavior or a finalized Lexicon. Prior spike compatibility is
not required. The [native authority decision](2026-10-01-atseq-native-authority-decision.md)
remains the authority backbone. The app PDS can construct another ordering;
compatibility never makes actor consent, grant authority or state independent of
that ordering.

## Evidence from the current implementation

The [plan review's F4](2026-09-06-atseq-plan-review.md#f4-exact-definition-cid-matching-will-invalidate-every-outbox-on-every-compatible-change)
identifies the concrete problem: adding a query or view changes the complete
definition CID and therefore invalidates previously signed actions. It proposes
an action-input-schema-plus-fold CID. That proposal needs a larger dependency
closure before it can safely replace the current rule.

At the examined revision:

- `src/application/folder.ts`, `Folder.interpret`, rejects a different definition
  CID before evaluating any action. It also supplies `meta.definition` as the
  complete active definition CID. A fold can inspect that value. Excluding views
  from a hash alone therefore does not preserve the fold's observable input.
- `src/definition/activation.ts`, `compatibleDefinition`, already compares the
  complete reachable state-schema interface and runtime, then validates current
  state against the successor. It does not migrate state or reset to the new
  definition's initial state.
- `src/definition/load.ts` loads immutable fold bytes and action/schema bindings.
  `src/definition/schemas.ts` resolves local and cross-document schema references.
  Hashing just the action's top-level schema would miss referenced definitions.
- `src/core/contracts.ts` describes semantic runtime behavior separately from
  build provenance. A new execution identity must use the new reviewed semantic
  contract, not a source-build hash or a statement that two builds are similar.
- `src/browser/outbox.ts` retains exact signed bytes for resubmission.
  `src/browser/main.ts` offers an explicit replacement form after
  `definition_changed`; `tests/evolution.test.ts` asserts that replacement is
  signed only on Save. This recovery behavior should survive the new contract.

These are code and retained-test observations. This decision-only task ran no
runtime tests and does not claim that any proposed identity is implemented.

## Three options

| Option | Preserved queued work | Cost and limitation |
| --- | --- | --- |
| Exact complete definition CID | Only an identical definition | Already implemented; even a view update requires explicit replacement and potentially new delegation. |
| One derived execution contract CID | View/query/title and source-layout changes that leave the operational projection identical | One projection and one identity per definition; changes to any action conservatively invalidate all ordinary queued actions. |
| One derived contract per action | Also survives changes to unrelated actions | Needs shared state/runtime/metadata/authority closure in every binding, per-action grant scope and discovery. It is not just an input-schema-plus-fold hash. |

Select the middle option. No observed workflow yet establishes a need for
independent action compatibility, whereas view-only invalidation is demonstrated.
Do not add both compatibility modes. If later evidence justifies per-action
contracts, review that semantic change separately. Do not infer equivalence from
unchanged action names, schema compatibility, tests, or a governance declaration.

## What the execution contract covers

Derive a bounded canonical descriptor from a fully validated definition. The
following are logical contents; N1 owns the final versioned encoding and limits:

1. A descriptor version and the supported Atseq application semantic-contract
   CID, covering evaluator behavior, limits, metadata, authorization and outcome
   rules. This global semantic CID is distinct from this particular definition's
   execution CID.
2. The state-schema root and every reachable schema definition.
3. Every ordinary action's full schema reference and exact fold-source CID,
   with every schema definition reachable from those inputs. Include the entire
   action set, sorted by reference; reject duplicates before deriving the CID.
4. Any future definition-declared rule that can reject or authorize a domain
   transition. A capability rule used only for advisory discovery is excluded;
   if it becomes an enforced precondition it must enter this contract.

Resolve references to full `documentID#definitionName` identities, retaining the
complete referenced schema objects and recursively following `ref` and closed
`union` members. Visit each identity once, including recursive references. Use
the project's canonical data encoding and existing CID primitives. Hash exact
fold bytes, not a normalized AST or a claim of behavioral equivalence. Moving
unchanged fold bytes to another local source path does not change the execution
descriptor. A whitespace change in fold bytes does.

Retain schema descriptions and array order initially. This deliberately rejects
some harmless schema edits, but avoids a new semantic normalization language.
Schema document metadata outside the reachable definitions is excluded. The
existing `stateContract` traversal supplies useful evidence, not an approved
ready-made descriptor: implementation must cover action schemas as well as state,
canonical full references, bounds and hostile fixtures.

Exclude title, queries, views, unused files and source path names. The definition
source CID still commits to all of them and remains necessary for reconstruction
and exact activation. Exclude the successor's initial state from ordinary action
execution identity: accepted activation retains current state; genesis already
pins initialization. Fully validate the successor's entire source, including its
initial state, queries and views, before accepting activation. Exclusion from
execution identity does not relax source validation or permit missing source.

Ordinary fold metadata must stop exposing the complete source-definition CID.
Expose the execution contract identity instead, under a new reviewed semantic
profile; do not relabel the old field without documenting the change. Source
definition identity remains available in discovery, projection and inspectable
activation history. Without this metadata change, a view update can change a
fold's result even when its purported execution contract is unchanged.

Folds have no ambient file/query/view access. If future runtime changes allow
such access, the execution closure must expand or those changes require a new
semantic profile. App/genesis binding, payload, principal, signer, grant and retry
identity remain signed. Changing their wire representation belongs to N1/I2/R0,
not this note.

## Grant scope and governance

I2 should make exact execution-contract scope the default for delegated ordinary
actions, rather than complete source-definition scope. A view-only activation
then needs neither a replacement action nor a replacement grant. An execution
change requires a fresh explicit grant for newly signed work. Do not rebind an
existing grant in place. A grant with a deliberately persistent app/action scope
can authorize newly signed work across changes, but the old intent still binds
its original execution contract; broad grants do not upgrade queued consent.

Grant checks and execution matching are separate. Current ordered authority
state determines admission, revocation, account epoch, domain role, action scope
and deterministic expiry. Routine handle, PDS or repository-key changes do not
silently change admitted grants. An authentic action can match its execution
contract and still be ineffective because its grant was revoked before ordering.
Retaining the original grant reference does not retain its former authority.

A changed domain-role assignment is an ordered authority/state change, not a new
fold program by itself. Evaluate it at the action's ordered position. A changed
definition-enforced role rule enters the execution descriptor; a changed
framework authorization rule needs a new semantic profile. App governance and
DID-control recovery remain distinct as specified in D0/I2. No compatibility
marker or account participation grant can create governance powers.

Activation remains an explicit control action with the exact expected active
source-definition CID, target source-definition CID and complete retained
closure. Check appointed activation authority at its position. A stale expected
definition is ineffective even when both definitions share an execution CID:
administrators must not unknowingly overwrite each other's presentation changes.
Keep the initial same-runtime/same-state-schema activation restriction. State
migrations and runtime replacement need their own reviewed protocol.

## State preconditions and examples

An ordinary queued action runs against the state and authority immediately
before its ordered position, provided the execution contract still matches.
Matching executable semantics does not guarantee its outcome. Keep expected
state/version checks in signed action payloads and folds, as F4 recommends;
do not add a second general framework precondition language for this change.

For example, a transfer payload may include the account's expected version.
The fold checks it before changing balances. The state must increment that
version on every relevant change if the app needs to reject a change followed
by a restoration to the same balance. Merely signing an expected balance does
not prevent that restoration case. A reservation action that intentionally
accepts current availability may omit the version and return its ordinary
domain outcome. Off-device preview is advisory, not a promise about either case.

| Change after signing | Required outcome |
| --- | --- |
| Add a view/query; unchanged execution descriptor and live grant | Original bytes remain eligible; the fold evaluates current state normally. |
| Change `borrow` from reservation to ownership transfer under the same action/schema names | Changed fold CID changes execution identity; old intent is ineffective. Schema compatibility is insufficient. |
| Edit a nested referenced input schema, shared state constraint, enforced role rule or supported runtime meaning | Execution identity changes, or activation is disallowed by the same-schema/runtime rule. Never accept old work on a top-level-only hash. |
| Change an unrelated ordinary action | Single execution identity changes; old queued work is conservatively ineffective. This is an accepted cost of simplicity. |
| Change only view source, but a fold formerly read `meta.definition` | Proposed profile supplies execution identity instead; old-profile behavior is not silently reused. |
| Valid grant revoked/reset/out of scope before the original action's position | Ineffective, even if signed while authorized and even if execution still matches. |
| State changes before an action with an expected version | Its fold records the defined precondition failure; no automatic rebase or version rewrite. |
| State changes before an action without an expected version | Fold evaluates new state; a valid contract match can yield a different domain outcome. |
| Exact recorded retry arrives after activation/revocation | Return its original receipt/outcome; do not append or evaluate another action. |
| Two administrators activate from the same exact expected source definition | At most the first effective activation meets that expectation. Execution equality does not let the second overwrite it. |

## Invalid, ineffective and stalled are separate

Protocol validation precedes domain interpretation. N1/I2 must preserve these
distinctions, including across checkpoints and partial repository proofs:

| Evidence or action | Classification |
| --- | --- |
| Malformed envelope, invalid actor signature, wrong app/genesis, broken position/predecessor chain, malformed required principal/grant reference, invalid native proof, or duplicate retry embedded in history | Invalid history; fail closed. No ineffective outcome legitimizes it. Exact retry lookup outside history is allowed; a second ordered copy is not. |
| Well-formed authentic reference to an unadmitted grant, or an admitted grant revoked/expired/reset/out of scope | Ineffective under recorded authority. Do not invent admission from the participant's claimed role or a fresh DID document. |
| Authentic action whose execution contract differs, whose declared state precondition fails, or whose deterministic fold/input/successor validation fails | Ineffective with a stable reviewed reason; retain state and advance the interpreted frontier atomically. |
| Required root/path blocks, accepted identity evidence or definition bytes cannot yet be fetched | Stall; retain the last coherent state/authority/definition/frontier. Missing partial-diff blocks require recovery, not an invented denial. |
| A valid proof under the complete selected root proves that a protocol-required entry/head/evidence record is absent | Invalid selected history/proof package; absence is established, not a perpetual availability stall. A missing cache block by itself is not this proof. |
| Complete signed activation source closure omits a declared source dependency, or available source is not a valid compatible definition | Ineffective invalid activation, after checking its structural/signature/authority requirements. This is not missing transport evidence. |
| Unsupported semantic profile, interpreter fault or failed local persistence | Interpretation unavailable/stalled; never publish a replicated domain verdict derived from the local fault. |

Absence of an admission in complete retained authority state makes a well-formed
grant reference unadmitted and ineffective. It is distinct from proven absence
of a protocol-required evidence record that an ordered authority entry claims
to supply. N1/I2 must define which evidence each entry type requires so readers
agree on that distinction. A transport rejection is a transport result, not a
replicated outcome or a license to discard original signed work.

## Implementation and review gates

N1 owns the execution descriptor, metadata and ordinary/control envelope change.
I2 owns grant scope and ordered authority checks. C1 must identify whether its
capability rules are advisory or enforced before their closure treatment freezes.
B0 remains a transport/source reconstruction task: expose the derived execution
identity when implemented, but never accept an author-supplied compatibility
declaration. Packing the same source through another transport changes neither
source identity nor execution meaning. P3/P4 retain execution identity with the
coherent projection and the evidence needed to reproduce it.

Before implementation lands, obtain independent workroom approval of this choice
and the N1/I2 wire contract. Validate descriptor determinism in Node and browser;
view/query-only equality; unrelated-action inequality; recursive/shared schema
closure; fold metadata; forged compatibility declarations; grants and epoch/reset
ordering; stale activation; expected-version/restoration examples; complete-root
absence versus missing partial blocks; and exact retries before/after activation.
For queued work, demonstrate byte-for-byte resubmission and explicit replacement:
show the changed semantics/authority/precondition, require a deliberate save or
agent instruction, use a fresh retry identity, and retain the old record/receipt.
Never silently rewrite, re-sign, re-grant or discard a queued action.

This proposal favors a bounded, exact operational projection over semantic
inference. Independent review may reject its conservative all-actions binding
if concrete workflow evidence shows the extra invalidation matters. The current
evidence supports fixing presentation-only invalidation first, without promising
that unchanged bytes imply unchanged state, authority or eventual outcome.
