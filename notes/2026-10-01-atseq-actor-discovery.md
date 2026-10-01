---
date: 2026-10-01
status: independently assessed direction; I2 and implementation review pending
examined_at: 66977be7e59527eccf3df91c55285e55914f3add
request: 0332c6ca
---

# Discover actions for a principal without granting authority

Use the same versioned description for a browser, CLI and agent. Let a caller
select a principal and signer, optionally filtering to one grant, and report
which actions that subject is eligible to attempt at one retained application
frontier. Simulate an exact candidate payload locally using the same retained
inputs and interpretation path. Do not create another permission service,
enforced precondition language or source authority.

The recommendation separates two questions: **does a retained grant permit
an attempt, and what would this exact payload do in a simulation?** Neither
promises the eventual ordered outcome. I2 authorization
and the domain fold still decide an authentic action immediately before its
ordered position. Discovery never creates a grant, changes an account epoch or
turns a claimed role into authority.

This is design preparation for C1, not an implementation or a finalized Lexicon.
Implementation remains gated on I2's retained principal/grant state and independent
review. The [native authority decision](2026-10-01-atseq-native-authority-decision.md)
and adopted [per-action execution contracts](2026-10-01-atseq-activation-compatibility.md)
remain in force. B0's independently reviewed source-document and lean discovery
decision is the transport basis; C1 extends it rather than replacing it.

## Current evidence and the missing behavior

At the examined revision:

- `src/application/definition.ts`, `describeDefinition`, returns source CID,
  manifest and parsed Lexicons. It accepts no principal/grant context.
- `src/host/application.ts`, `describe`, refreshes and returns genesis, definition,
  head and interpreted frontier. The current describe Lexicon leaves definition
  as `unknown`; B0 is implementing its reviewed typed, versioned replacement.
- `src/definition/load.ts`, `DefinitionManifest`, binds actions to `ref` and
  `fold`. There is no capability or hint binding. Unknown manifest fields are
  refused, so an unreviewed `allow` property cannot already work.
- `src/browser/main.ts` lists every declared action and disables buttons only
  when interpretation is stalled. It does not evaluate actor-specific affordances.
- `src/application/folder.ts`, `interpret`, supplies the current state and actor
  key to the fold. Its current authorization model predates I2 account grants.
- `src/runtime/evaluator.ts` provides the existing bounded, pure JSONata evaluator.
  Reuse it; there is no need for an additional policy interpreter.
- Current sample preview uses a synthetic app and empty actor key. The interaction
  guide documents it as anonymous local preview, not authenticated participation.

F3 in the [plan review](2026-09-06-atseq-plan-review.md) proposes an `allow`
expression used both for discovery and as a fold precondition. That is a possible
new execution rule, not the only way to make actions discoverable. This proposal
uses existing I2 authorization and exact-payload simulation. It avoids introducing
a second domain enforcement surface or an additional hint-program contract.

## Why this choice

| Choice                                       | Benefit                                                                                       | Cost and risk                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| List all bindings                            | Already implemented; minimal source contract                                                  | Gives clients no principal-specific help and exposes no useful distinction between denied and unavailable                            |
| I2 eligibility with exact-payload simulation | Reuses ordered authorization, retained source and bounded evaluator; preserves fold authority | A no-payload list cannot predict all domain conditions; an exact simulation is needed for a candidate                                |
| Add advisory hint programs                   | Could suggest state-dependent actions before a payload exists                                 | Extra manifest/program/context contract and suggestion states; hints can disagree with folds                                         |
| Enforced `allow` rule shared with discovery  | A single definition predicate supplies an additional ordered rejection rule                   | New execution semantics, rejection outcomes and source closure; a state-only rule still cannot decide every payload-dependent action |

Select the second option. Independent assessment
`9cdbe3c33118aa070ce59d3027d933d5fdaa0863` accepts the structure with this
simplification (C1-1): defer all hint programs and suggestion states from the
first delivery. It adds no manifest hint binding and requires no profile advance
for one. Security-critical conditions remain in I2 checks and folds, which already
run for every ordered action. A later demonstrated need for hints or shared
enforced guards requires a separate reviewed contract; an enforced guard must
enter the governed action's execution identity under C0.

ATproto Lexicons already describe named schemas and XRPC response objects; shared
definitions can be referenced from related methods. Use that machinery under
`ai.generalbusiness.atseq.*`, rather than an untyped capability JSON endpoint.
OAuth permissions govern account operations such as record writes and RPC
access; they do not replace Atseq's ordered device grants and domain decisions.
See the [Lexicon](https://atproto.com/specs/lexicon),
[XRPC](https://atproto.com/specs/xrpc) and
[permissions](https://atproto.com/specs/permission) specifications.

## One shared document, one selected frontier

Keep B0's lean definition description unchanged:
`{ version: 1, cid, manifest, lexicons }`, with complete exact source included
only when explicitly requested. Define one typed outer description shared by
host responses and locally computed browser/CLI results. Add a description
version and optional subject results to the existing genesis/definition/head/
frontier envelope. The sketch below names logical fields, not approved wire
names or CIDs:

```text
description = {
  version,
  genesis, definition, head, frontier,
  subject?: { principal, signer, grantID? },
  actions?: [{ ref, execution, authority }],
  basis: { authorityCommitment, stateCommitment, assurance }
}
authority = { status: eligible | denied | unavailable, grantID?, reason? }
```

Here `definition.cid` identifies exact retained source, while each action's
`execution` is locally derived under C0. Never accept an author's claimed
compatibility CID. State and authority commitments refer to the coherent retained
projection at `frontier`; use P3/P4's commitments when those are implemented,
not another tree or an independent checkpoint format. I2/N1 must settle the
canonical authority snapshot identity before these fields are frozen.

Capture source, state, authority and frontier together before asynchronous
evaluation. The verified head can be ahead of the interpreted frontier. Results
apply only to that frontier and do not imply that a stalled tail is current or
safe to ignore. Preserve distinct state assurance (replayed or certified) and
identity observation policy; an independently replayed state does not prove
historical account currentness. Host-supplied results are claims until a client
checks retained inputs and recomputes them under its own accepted trust policy.

Use a principal/signer pair and an optional grant-ID filter on the existing
`describe` query for lean action-level discovery. Refuse a partial or malformed
pair, or a grant filter without the pair. With no selector, return the ordinary
source description and omit actor conclusions. Do not turn an
omitted principal into an empty authenticated identity. The caller need not
prove possession to inspect a public subject's public eligibility: the response
means “evaluation for this subject,” not “this caller is that account.”

The proposed selector is limited to ordinary I2 participation. Do not infer
governance, recovery or activation powers from it. Those require accepted
certificate-chain appointments and their separately defined checks.

Do not include source bytes, state or every historical grant merely to return
an action list. Local verification obtains the required retained inputs through
the existing sync/archive path; offline use uses an already retained copy.
Payload-specific evaluation stays local initially. No new network endpoint or
GET query containing an entire action payload is needed.

## Deterministic evaluation and reasons

One portable helper accepts a validated definition, a coherent accepted
state/authority projection, app/genesis pins and a selected subject. It checks
ordinary eligibility using the same I2 helper that ordered interpretation uses.
The selector's principal must match the accepted grant issuer; the signer and
app/genesis scope must match too. Check admitted grant, account epoch, terminal
revocation, role, action/execution scope and any deterministic position bound.
Never resolve a DID, read a clock or take claimed roles from caller JSON here.

Assessment C1-2 removes mandatory grant selection from the caller. With a grant
filter, evaluate that exact admitted grant for each action. Without a filter,
select the earliest-admitted matching **eligible** ordinary grant per action and
return its ID. Use I2's deterministic admission order and tie rule; do not choose
by wall time, map insertion order or resolver response order. A revoked or
out-of-scope earlier grant cannot hide a later eligible one. Different actions
may select different grants; the resulting intent must explicitly bind the one
selected for its action, subject to the reviewed I2 wire contract.

Each eligibility result must be supported by one grant together with accepted
principal roles as I2 defines. Do not union scopes or roles from separate grants
to manufacture authority no single grant supplies. If no eligible grant exists
in complete authority state, reuse I2's deterministic reason selection. A
selected grant can become ineffective before ordering; selection grants no lease.

When a position bound needs an attempt position, use `frontier.position + 1`
as an explicitly simulated next position. Discovery at that position does not
reserve it. Intervening entries can change authority or state. Exact bound
inclusivity is I2's contract and must be shared, not reimplemented by C1.

| Condition in complete accepted inputs                                                                                                                           | Discovery result                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Matching admitted ordinary grant and required role/scope at the simulated position                                                                              | `eligible`: an attempt passes the known framework authority checks; success remains a fold question |
| Filtered grant is unadmitted, revoked/expired, in an old epoch or mismatched; without a filter, no matching eligible grant exists in complete authority state   | `denied`, with I2's stable authority reason, including required role/scope checks                   |
| Required accepted authority/source/state input is unavailable, interpretation is stalled ahead of this frontier, profile unsupported or evaluator locally fails | `unavailable` for the affected evaluation; never fabricate denied authority                         |
| Malformed selector or impossible app/genesis/source binding                                                                                                     | Reject the request/input; do not disguise it as a domain denial                                     |
| Valid complete-root proof establishes absence of evidence an ordered authority entry was required to supply                                                     | Invalid selected evidence/history under N1/I2; do not return an endless missing-data status         |

An unadmitted grant in complete authority state is denied, rather than a prompt
to fetch arbitrary live grants. A cache missing required proof blocks is not
complete authority state and cannot establish denial. A retained grant remains
admitted across routine handle/PDS/repository-key changes; only ordered authority
changes affect its eligibility, as I2 specifies.

The host's deployment admission policy, quota or
temporary refusal is separate again; this public description neither promises
host acceptance nor grants operator access.

## Matching cost and payload-dependent conditions

Calling I2 once per action does not itself bound matching-grant search. Reuse
I2's bounded/indexed subject-grant selection and its deterministic ordering.
If A actions each scan G candidate grants, eligibility can cost O(A × G); an
index can reduce the candidates inspected but is not evidence of constant-time
matching. Record candidates inspected, eligibility calls, action/grant counts,
index maintenance/storage and aggregate elapsed/budget use. Do not claim
O(actions) merely because there is one outer action loop.

Charge lookup and predicate work under an aggregate discovery budget, with no
recursive discovery. An exhausted budget yields explicit unavailable results
for unevaluated actions, not invented denials. Exact bounds and reason codes
must reuse the reviewed I2 contract and be validated with P0/E1 evidence. Local
payload simulation also pays for state copying and fold/schema evaluation;
bounded result count does not make these costs independent of state size.

N1 must review separation of service-contract identity from execution identity:
today's service Lexicons participate in the app profile, so extending the typed
outer description cannot simply be declared identity-neutral. This first
delivery introduces no hint source, suggestion result or hint-induced manifest/
profile change.

The no-payload list cannot prove “all transfer amounts will succeed” or that a
specific item is available. Present input schemas, then evaluate the exact
candidate payload through the same local authorization and fold path on copied
state. Report a separate simulation result, with payload CID and the complete
evaluation basis. Validate payload and successor state, retain the fold's
effective/ineffective reason, and never mutate canonical state or the outbox.
Payload-dependent domain authority belongs in that fold. Do not invent new
payload-scoped grant semantics that I2 has not defined.

Signed expected-version checks stay in action payloads/folds under C0. A preview
that succeeds at version 7 is no assurance it will succeed after version 8 is
ordered. Neither discovery nor simulation silently rewrites an expected version,
changes a contract/grant, re-signs queued bytes or reserves state.

## Examples and required implementation evidence

The following are proposed fixtures, not tests already run:

| Fixture                                                                                                                                                   | Expected observation                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alice is an accepted lender and Bob only a borrower; both use correctly bound device grants                                                               | Different I2 eligibility for role-scoped actions. Caller-chosen Alice selector never lets Bob sign as Alice.                                                                                               |
| Alice may lend only an item she owns, while Bob owns another item                                                                                         | Action list is advisory; exact candidate payload simulation distinguishes the two items. Forged or directly submitted work still passes ordinary I2/fold checks at its ordered position.                   |
| A delegated transfer has a domain amount/balance condition                                                                                                | Without payload, report eligibility and no promise about amounts; simulation of two amounts yields their actual current fold outcomes.                                                                     |
| Grant revoke/reset is ordered after discovery but before candidate action                                                                                 | Discovery's earlier eligibility stays labelled at its old frontier. Ordered action is ineffective under new authority. No “discovered permission” token bypasses revocation.                               |
| State changes after successful simulation                                                                                                                 | A signed expected version fails as the fold defines; an action without that expectation evaluates current state. Neither preview result is a lease.                                                        |
| Change a view or unrelated action; then change the selected action's fold                                                                                 | First changes preserve C0 action contract where its closure is unchanged; changed selected fold changes its contract and exact-contract grant eligibility. Source identity remains inspectable throughout. |
| Remove required cached identity/proof/source blocks; separately prove required evidence absent at a complete root                                         | Missing input yields unavailable/recovery; proven protocol-required absence yields invalid history, not denied participation.                                                                              |
| Several matching grants: earlier revoked/out-of-scope grant, two eligible grants, and two grants with scopes that do not individually authorize an action | Without a filter, return the earliest-admitted eligible grant's ID under I2's deterministic ordering; an exact filter evaluates only its grant. Never combine separate insufficient scopes into authority. |
| Many grants and actions, including unavailable matching inputs and exhausted aggregate budget                                                             | Measure actual candidate work and indexed selection; incomplete evaluation reports unavailable, not denied.                                                                                                |
| Offline retained archive and two subjects, then unsigned draft with hypothetical roles                                                                    | Retained accepted authority produces labelled frontier-bound evaluation without live resolution. Draft/hypothetical context is visibly `simulation`, never authenticated participation.                    |
| Same fixture/source/context in Node and Chromium                                                                                                          | Byte-identical deterministic authority/candidate results, selected grant IDs and stable reasons; actual browser execution, not merely successful bundling                                                  |

Generic clients should show a reason for denied actions and an explicit retry/
refresh state for unavailable evaluation. Show the returned selected grant and
allow inspection of source/schema. Label the retained frontier and simulated
next position on eligibility and payload results. Do not use action hiding as
access control or confidentiality.
Bind results and UI callbacks to the selected app/genesis/frontier/subject; discard
stale display results after a subject or application switch.

Offline preview must show `simulation`, selected frontier, simulated next
position and state/identity
assurance. A hypothetical principal/grant/role is permitted only in a separate
simulation context which never enters retained accepted authority or a signed
submission automatically. Anonymous draft preview has no authenticated subject;
the current empty actor-key sentinel must not be presented as a real participant.

## Review and remaining decisions

Independent assessment `9cdbe3c33118aa070ce59d3027d933d5fdaa0863` accepts the shared
description and retained-authority structure with C1-1 and C1-2 refinements,
incorporated above. The first contract is I2 eligibility, exact-payload local
simulation and a typed outer B0 description. It defers all hint programs and
suggestion states. I2 owns canonical subject/grant context, bounded/indexed grant
selection, deterministic reason codes and position semantics. N1 owns source/execution/service
identity separation and C0 action descriptors. B0 owns exact-source conversion
and lean/opt-in transport; this proposal changes neither source bytes nor CAR
identity. P3/P4 own coherent retained snapshot commitments, not C1.

Do not freeze JSON field names, outer version number, authority commitment
encoding or aggregate evaluator budget until those owners supply their reviewed
contracts. These remaining wire/limit choices do not require implementing several
capability modes. A1/T1 own honest browser/CLI/agent labels and public disclosure.

The C1 request remains open: it asks for design and implementation. This note
delivers the reviewable design preparation only. Validation was a current source,
request, adopted-note and primary-specification review on 2026-10-01. No runtime,
Lexicon, dependency or programme files changed, and no new tests or performance
measurements were run. Implementation requires the fixture evidence above,
relevant checks and independent exact-head review before landing.
