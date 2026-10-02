---
date: 2026-10-01
status: independently assessed; concurrent followups requested
examined_at: c242ca20e823ea510e3939a8466a608f3ab860ba
status_observed_at: 2026-10-02T02:40:02.144925+00:00
request: 47004674
---

# Plan-review gaps and concurrent followups

The [plan review](2026-09-06-atseq-plan-review.md) is an assessment of the original
architecture at `efbd900`, not a list of features automatically adopted by that
review. This gap assessment compares its findings with current code, retained
spike/Adoption evidence, and the identity/performance implementation programme.
A separate read-only audit supplied the finding map; `atseq-reviewer` reviews the
recommendations independently before they become implementation decisions.
“Completed” means supported by code and retained evidence, not a fresh execution
of every historical gate.

Account identity, checkpoints and most native infrastructure questions already
have tasks. The additional concurrent work is actor-specific discovery, simpler
authoring, activation compatibility, a measured state-model decision, and an
explicit confidentiality direction. Do not duplicate programme tasks or reopen
completed spike gates.

## Finding map

Paths refer to the examined revision. Line numbers are starting points, not
stable API references.

| Finding                                | Current disposition and evidence                                                                                                                                                                                                                               | Work to pursue                                                                                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1: PDS commit path                    | Proposed private canonical store superseded by the user's native-PDS preference. `src/host/sequencer.ts:227` atomically writes one entry plus head; this is not multiple-intent batching.                                                                      | D0/N1 define custody/CAS; P0/E1 measure batching and commit costs. No reordering of completed S2/S4.                                                                                  |
| F2: complete successor state           | Open contract choice. Whole state enters `src/runtime/evaluator.ts:195`; successor validation remains at `src/application/folder.ts:212`; 128 KiB state cap remains. Small-state timings do not establish that whole-state validation dominates.               | P0/E1 growing-state characterization; a separate reviewed effects-versus-state decision after meaningful evidence. No automatic effects implementation.                               |
| F3: authority hidden in folds          | Open. Action bindings have `ref` and `fold` (`src/definition/load.ts:26`); browser exposes every action (`src/browser/main.ts:455`); discovery lacks actor-conditioned capability results (`src/host/application.ts:242`).                                     | Concurrent capability/discovery decision and subsequent scoped implementation, coordinated with I2/A1.                                                                                |
| F4: all-definition invalidation        | Open policy choice; explicit recovery exists. `src/application/folder.ts:165` requires the exact active definition. Browser offers replacement (`src/browser/main.ts:522`); `tests/evolution.test.ts:211` expects `definition_changed`.                        | Concurrent activation/queued-intent decision before N1 envelope freeze. Grant carry-over in I2 does not solve intent compatibility.                                                   |
| F5: bare key identity                  | Fully covered, implementation pending. Current fold metadata has `actorKey` (`src/application/folder.ts:194`).                                                                                                                                                 | I1/I2/A1/A2/N1 implement authenticated principals. An ignored optional DID placeholder is obsolete; spike vector compatibility is not required.                                       |
| F6: evaluator ordering                 | Completed; historical scheduling obsolete. JavaScript JSONata is production (`src/runtime/evaluator.ts:1`); Node/Chromium shared corpus exists (`tests/runtime.test.ts:12`).                                                                                   | T1 preserves conformance. No new Go/SQL/WASM selection work is justified by this finding.                                                                                             |
| F7: generic views                      | Substantially implemented. Schema forms exist (`src/browser/forms.ts:23`), queries/actions render generically (`src/browser/main.ts:454`), zero views are permitted in the manifest.                                                                           | Prove the viewless end-to-end path with authoring/T1. Removing Inlay is a separate evidence-led dependency decision.                                                                  |
| F8: checkpoints                        | Fully covered, implementation pending. The current host checkpoint saves a rollback head (`src/host/sequencer.ts:204`), not portable interpreted state; `verifyHistory` needs a full prefix (`src/protocol/log.ts:299`).                                       | P2/P3/P4/R1/I2/E1. The new notes specify state, retries, evidence, authority and certification/audit boundaries missing from the original one-schema suggestion.                      |
| F9: authoring surface                  | Partial. Directory pack is at `src/cli/main.ts:63`; `SourceBundle.pack` accepts manifest+bytes (`src/definition/source.ts:146`); describe omits fold/query/view bytes (`src/application/definition.ts:6`). Actual agent directory authoring already succeeded. | Concurrent single-document bundle and reconstructable discovery. Provide task-board/guitar/ledger examples; reuse E1 growing-state fixture. CAR transport is not an authoring bundle. |
| F10: private examples/public substrate | Direction remains open; disclosure exists. Architecture excludes real confidential data (`2026-09-06-atseq-architecture.md:307`); identity note repeats public evidence limits.                                                                                | Concurrent confidentiality assessment. Do not infer authorization to add encryption/private storage; compare implications and report a recommendation first.                          |

## Governance is a replacement decision

The original architecture says ownership is optional and creation confers no
permanent role. The identity proposal starts with one owner principal and pinned
governance/recovery appointments. D0/I2 must explain the revision rather than
silently equate protocol administration with domain ownership or human obligation.

The native authority decision proposes one bootstrap appointment for minimal
protocol powers, with explicit transfer/removal and all-keys-lost behavior.
Domain roles and commercial ownership remain optional. Native PDS ordering can
reorder/withhold valid acts; it cannot manufacture an actor signature or an
accepted governance certificate. Owner participation grants never acquire
certificate-chain powers. Review this boundary through D0/I2; it needs no new
user question merely because the historical architecture used different terms.

## Smaller observations

- Positions and predecessor CIDs already work together (`src/protocol/log.ts:308`).
  N1/P2 preserve both and the fork/gap tests.
- Sixteen decimal position keys are documented (`docs/protocol.md:105`);
  safe-integer limits and current 20,000-entry capacity bind earlier. No new task.
- The local writer lock and the lack of distributed leadership are explicit
  (`docs/pds-host.md:41`). D0/N1/A2 must preserve that honesty.
- Money uses safe integer minor units or explicit decimal strings. Add rounding,
  overflow and money examples to the ledger fixture; do not invent an unsupported
  Lexicon string `format`. Broader decimal arithmetic needs its own reviewed
  deterministic-runtime decision.
- A four-row CSV import already becomes four acts; this does not solve arbitrary
  bulk imports under the 32 KiB payload bound. Characterize bounded rowwise import
  and document limits. Arbitrary blob-reference actions need explicit retained
  availability/purity semantics before implementation; definition source blobs
  do not supply that contract.
- The disposable PDS explicitly uses a local official mock PLC
  (`tests/support/pds/environment.mjs:63`). Production provisioning remains A2.
- CLI and browser use the same describe response, but `describe.definition` is
  still `unknown` (`lexicons/ai/generalbusiness/atseq/describe.json:33`). The
  capability/authoring work needs one versioned validated discovery shape with
  frontier and retained source identities.
- Disposable measurements disable rate limits. Production submit rate/admission
  policy is absent (`docs/pds-host.md:108`). Account identity is not a quota;
  finite history capacity is not one either. Add explicit shared deployment
  admission coverage to A2, with a separate implementation request if required.

## Concurrent scopes and decision gates

| Scope                            | Begin now                                                                                                       | Gate and meaningful validation                                                                                                                                                                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actor-specific discovery         | Design actor/grant input, advisory versus precondition semantics and unavailable versus denied results.         | Review before schema/runtime change. Two actors see different actions; stale state/grants, forged submissions, payload-dependent limits, offline preview and Node/browser agreement. Keep fold authority. Empty-key preview must be labelled simulation. |
| Single-document authoring        | Implement an isolated converter prototype and shared discovery proposal using existing manifest+source storage. | Review bounds/schema; exact bytes and bundle→CAR→bundle identities; malicious paths/limits; viewless browser+CLI+packed-consumer flow; fresh agent exercise.                                                                                             |
| Whole-state versus keyed effects | Define fixture/schema/read-write needs while P0/E1 runs.                                                        | Recommend after stage evidence; compare only the smallest useful effects prototype. O(change) validation does not make reads/evaluation/snapshots O(change). Contract replacement requires review.                                                       |
| Activation compatibility         | Produce counterexamples and options before N1 freezes its envelope.                                             | Include view-only change, action meaning, shared state/schema closure/runtime/authority changes, revoked grants and expected-state preconditions. Never silently rewrite/re-sign queued work.                                                            |
| Confidentiality direction        | Classify public examples and compare public-only, private-host and encrypted-public options.                    | Report metadata/proof leaks, key custody, retention/replay/checkpoint/availability consequences. Later implementation needs a scoped request.                                                                                                            |
| Shared deployment admission      | Extend A2 coverage or create a dependent scope.                                                                 | Operator exposure policy, participant enrolment versus submit permission, quotas, retry fairness and unavailable versus permanent refusal; keep loopback private by default.                                                                             |

## Existing dependency maintenance

The initial fresh root `npm audit` reports one high-severity vulnerable package:
`brace-expansion` 5.0.9, pinned in `npm-shrinkwrap.json` and bundled in the approved
runtime closure. Its ancestry is Inlay core → ATproto Lex/lex-builder → ts-morph
→ ts-morph common → minimatch → brace-expansion. This is packaged tooling,
not automatically a live Atseq exploit; runtime reachability remains to assess.
See the [maintainer advisory](https://github.com/advisories/GHSA-qhr7-859c-m2p7).

A narrow maintenance request should classify reachability, replace the affected
version through its legitimate dependency graph, regenerate approved closure/
file integrity, and run installed-consumer and runtime equivalence checks with
independent review. Do not run a broad automatic audit fix. The separate disposable
PDS graph reports additional advisories; classify those as test infrastructure
in a separate report rather than silently changing the historical fixture version.

## Results and limits

This assessment supports concurrent work on the listed gaps. It does not adopt
all historical recommendations or prove their efficiency predictions. Identity
and checkpoint implementation is already fully tracked; effects, privacy and
intent-compatibility choices need evidence and reviewed decisions. Detailed
programme requests and reports are the current work ledger; this note is the
human-readable finding map.

Independent assessments `4f823d99` and `9136c7bb` accept this finding map and
nonduplicating followup ownership. C0 (activation), B0 (authoring), C1 (actor
discovery), S0 (state model), Q0 (confidentiality), M0 (bundled dependency) and
M1 (test-fixture advisories) are assigned requests in the programme. Shared
deployment admission belongs to A2. Assessment approval does not approve each
future contract or implementation.

## Current disposition after the foundation deliveries

The finding map above retains the original examined revision. This current
snapshot records pushed main through `c242ca20`, from publication basis
`eec0c8e8`; the [programme](2026-10-01-atseq-implementation-programme.md) and
[continuation report](2026-10-01-atseq-continuation-publication-results.md) separate
shipped internal foundations, accepted designs and remaining integration.

F2 has measured growing-state evidence and an independently reviewed
[options note](2026-10-01-atseq-effects-transaction-options.md). Keep the current
128 KiB complete-state contract with V0, S1 and checkpoints as the default.
The 186-second growing replay is the total for 10,000 actions, not one-action
latency. E1-K1's `940f0ad0` measurement delivery is independently approved;
it is shipped at `c242ca20` and its
[matrix](https://github.com/generalbusiness-ai/atseq/actions/runs/36947475821)
passed Node 22.19/24/26. It characterizes 21 legal state fixtures
with 13 warm kernels in Node and Chromium. Size alone does not predict cost,
and these kernels are not integrated replay or a worst-case bound. A new effects
contract still needs a concrete application requirement beyond the cap and a
separate reviewed decision. Existing archives already replay legal 128 KiB
states; future checkpoints must use byte chunks across the 64 KiB block limit.
S0-M1 is preparing realistic-N total replay characterization without an effects
prototype or latency threshold.

F3 has an adopted [actor-discovery direction](2026-10-01-atseq-actor-discovery.md).
I2-F1 now ships authenticated authority transitions, but ordinary actions still
need source-derived eligibility, followed by C1's enforced discovery interface.
F4 has adopted [per-action compatibility](2026-10-01-atseq-activation-compatibility.md)
and [source admission](2026-10-01-atseq-native-source-admission.md).
N1-D3's source-only literal identities and stage-specific reasons/precedence
are accepted. N1-F2 is implementing the private source owner; native actions and
activation still need eligible execution and atomic integration.

F5 has shipped I1-F1's retained PLC/web interpreter and guarded host transport,
N1-F1's native wire framing, and I2-F1's pure grants, epochs, roles and appointed
control. Their [identity](2026-10-01-atseq-identity-evidence-r2-results.md),
[wire](2026-10-01-atseq-native-wire-integration-results.md) and
[authority](2026-10-01-atseq-native-authority-integration-results.md) reports retain
actual evidence. The accepted [observer design](2026-10-01-atseq-native-observer-preparation.md)
still needs implementation, native linkage and provider trials. Full authenticated
participation and ordering are open; did:web observation retains its stated
trust/currentness limits. OAuth candidate `7807cd9a` needs the adopted transient
failure and callback-state corrections; A1-F2 is implementing the integrated successor. A1-D2's accepted
supported-store design fixes limits and consent lifetime; its bounded stores
are not implemented by the original foundation. A2 still owns production
provisioning, recovery and shared deployment admission.

F8 now has P3-F1's reviewed SQLite/IndexedDB raw storage and
[deletion-marker correction](2026-10-01-atseq-local-generation-tombstone-results.md).
It does not restore trusted interpreted state. The accepted
[checkpoint projection successor](2026-10-01-atseq-checkpoint-projections.md)
uses one portable history table, deriving request/retry/descriptor indexes, with
exact public predecessor and successor packets. P4-F1's DATA parser is
independently approved, with landing in progress. P2's native reader, R1's retained
retry/receipt lookup, coherent application persistence, caller-accepted publication, suffix verification,
independent genesis replay and provenance-bound restore remain open.

F9 authoring is shipped, including the v2 source-document contract, actual
viewless/browser/CLI flows, reviewed sample aggregate bounds and the B1 typed
malformed-byte correction. F10 adopts the existing
[public scope](2026-10-01-atseq-confidentiality-direction.md); no confidential
mode has been selected. These concurrent decisions do not close their downstream
implementation or disclosure work.

M0's narrow runtime patch and N0's generated attribution check replace the initial
advisory observation above. I1's shipped graph refresh pins attribution sorting
explicitly. M1's fixture assessment and MF1/MF2 maintenance remain distinct from
the production graph.

The pushed I1 and N1 matrices passed Node 22.19/24/26. P3's
[run](https://github.com/generalbusiness-ai/atseq/actions/runs/36940311459) passed
Node 22.19/26, while Node 24 passed 444 of 445 ordinary tests and reproduced the
shared-dist package/browser race. T1-H1's isolated package build is independently
approved, landed and pushed at `b0a5d066`; its
[matrix](https://github.com/generalbusiness-ai/atseq/actions/runs/36945783974)
passed Node 22.19/24/26. I2's later [matrix](https://github.com/generalbusiness-ai/atseq/actions/runs/36942802499)
passed all three versions and the separate 20,000-entry gate; that success does
not erase the reproduced race or prove an unfinished native runtime.

Full I1/I2/N1/P2/P3/P4/R1/A1/A2/S0/E1/T1/C1 integration remains open. The existing
workroom requests cover the followups; no duplicate task or new design decision
is introduced by this status refresh.
