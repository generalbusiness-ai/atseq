---
date: 2026-10-01
status: implementation started; full programme open
examined_at: 824527132a6cfc6099d57685d37320e37f99ee4e
request: cbafc791
---

# Post-spike implementation programme

This programme implements the two dated [verification/bootstrap](2026-10-01-atseq-verification-and-bootstrap.md)
and [ATproto identity](2026-10-01-atseq-identity.md) notes. The user prefers native
app-PDS ordering unless significant evidence argues against it; the
[native authority decision](2026-10-01-atseq-native-authority-decision.md) records
the replacement boundary. Prior spike compatibility and fixed performance
targets are not requirements.

Gitseq requests are the work ledger. All implementation packages are assigned to
`atseq-codex`; independent decisions and exact deliveries go to `atseq-reviewer`.
Dependencies below are implementation gates, not a claim that an open upstream
request has been satisfied. Work that only investigates or builds isolated
evidence can begin before dependent runtime contracts are approved.

The programme request is `git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:cbafc791d2d69bed46e5c104bc8cfd886240cc6d`.
Request hashes below use the same repository prefix
`git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:`.

| Package | Request    | Scope                                                             | Gates                                        |
| ------- | ---------- | ----------------------------------------------------------------- | -------------------------------------------- |
| D0      | `cde3cb20` | Choose the native repository authority contract                   | None                                         |
| P0      | `bdf1e791` | Capture and instrument the performance baseline                   | None                                         |
| P1      | `00d3dcd5` | Implement native repository proof primitives                      | D0                                           |
| I1      | `71b93a9c` | Implement account resolution and retained admission evidence      | D0, P1                                       |
| I2      | `0e55c16d` | Implement grants, revocation, epochs and app governance           | D0, I1                                       |
| N1      | `fea766bc` | Implement native app ordering and portable receipts               | D0, P1                                       |
| R0      | `2ba34dc6` | Decide retry/index semantics with evidence                        | D0, P0                                       |
| R1      | `5ebd3df1` | Implement selected retry and selective outcome storage            | R0, N1, I2                                   |
| P2      | `3a7f6bb3` | Implement verified incremental native reads                       | P1, N1, I2                                   |
| P3      | `bf870fc6` | Persist coherent local materialization                            | P2, R1                                       |
| P4      | `1f13a0dc` | Implement portable checkpoints and independent audit              | D0, P1, I2, R1, P3                           |
| A1      | `13d42e4a` | Implement account enrolment in library, CLI and browser           | D0, I1, I2, N1                               |
| A2      | `110166f9` | Implement provisioning, web identity and operational recovery     | A1, I2                                       |
| E1      | `8eec1d65` | Characterize performance, trust and adoption end to end           | P0, P4, A2                                   |
| T1      | `e4aa9571` | Complete conformance, documentation and packaging                 | E1                                           |
| G0      | `47004674` | Concurrent plan-review gap assessment                             | Independent recommendation review            |
| C0      | `6f758f21` | Decide activation and queued-intent compatibility                 | Independent decision review                  |
| B0      | `29bfbe65` | Implement single-document authoring and reconstructable discovery | Independent bundle/discovery contract        |
| C1      | `0332c6ca` | Design and implement actor-specific discovery                     | I2 and independent capability decision       |
| S0      | `fe6f8e12` | Decide complete-state versus keyed effects after measurements     | P0/E1 evidence                               |
| Q0      | `6f3fd8c5` | Assess confidentiality direction and public scope                 | Independent decision review                  |
| M0      | `9e6a9894` | Resolve the bundled brace-expansion advisory narrowly             | Independent dependency equivalence review    |
| M1      | `3b0bab47` | Classify disposable PDS test dependency advisories                | Independent decision review                  |
| F0      | `1c3db0c1` | Initial programme/probe/gap/stage-harness delivery                | Decision assessment and exact-head review    |
| MF1     | `5f0517cc` | Patch compatible disposable-PDS dependencies in place             | M1 assessment and exact-head review          |
| MF2     | `b5106f06` | Isolate fixture telemetry and document local demo boundaries      | M1 assessment and exact-head review          |
| F1      | `c873691d` | Publish adopted continuation decisions and audit evidence         | Exact-head review                            |
| CI1     | `0933ee4d` | Fix archive offline transport boundary                            | Exact-head review; shipped                   |
| CI2     | `0c2b8bce` | Preserve current participation form focus                         | Exact-head review; shipped                   |
| CI3     | `966cdaa3` | Observe Linux matrix after CI1/CI2                                | Actual pushed-main matrix                    |
| PB1     | `d22a606d` | Distinguish native resource exhaustion from invalid history       | Adopted API decision; implementation review  |
| V0      | `592e7c33` | Characterize and simplify canonical validation overhead           | Differential semantics and measured evidence |
| F2      | `f9abfb7e` | Publish continuation designs and current status                   | Exact-head documentation review              |

## Completion and reports

Every delivery reports actual code/artifacts, exact revision, commands/fixtures,
raw captures where relevant, results, recommendations, trust/functional limits
and remaining cases. Design decisions are reviewed before the affected contract
is implemented. Changes are independently reviewed at an exact head, merged
through gitseq and pushed under the user's authorization.

D0 selected the independently reviewed authority backbone; N1 still owes concrete Lexicons/wire details.
R0 must decide retry semantics before N1/R1 freezes them. Activation compatibility
and discoverable capabilities from the gap assessment must likewise be settled
before the final envelope/discovery shape is fixed. An unresolved choice cannot
be smuggled in as a performance refactor.

Optional alternatives have explicit decision gates: a lazy retry tree only if
simpler full-index/deferred-audit choices are insufficient; WebVH companion work
only for a demonstrated adoption/audit need; native mirror/stream support only
when needed for the selected root/proof delivery or retention policy. The
programme does not implement every option merely because it appears in a note.

P0 and E1 characterize the space and attribute costs, including growing state,
not impose a latency threshold. Correctness gates are strict: byte-equivalent
state/outcomes/receipts/stalls, exact floors/root evidence, deterministic authority,
bounded hostile-input handling and credential-free offline replay.

A1/A2 real-provider trials may need accounts, client metadata hosting or provider
provisioning support. Prepare concrete flows and report which prerequisites are
missing; a mock PDS, local PLC or browser build is not a live-provider success.
Do not weaken evidence requirements or mark required cases done when unrun.

## Current results and remaining work

The workroom remains the current ledger; this snapshot distinguishes shipped
foundations from accepted designs and unfinished integration.

- **P0 is shipped.** The [performance baseline](2026-10-01-atseq-performance-baseline-results.md)
  and [dimension results](2026-10-01-atseq-performance-dimensions-results.md)
  include 10,000-action bounded/growing state, warm deltas, real-PDS request costs,
  activation failure recovery and Chromium transfer. Early checkpoint readiness
  remains distinct from independent audit. V0 measures canonical guard overhead
  before S0 decides whether a new state/effects contract is warranted.
- **P1 is shipped.** The [native proof foundation](2026-10-01-atseq-native-proof-results.md)
  verifies exact roots/record bytes, sparse versus missing/absent evidence,
  visited/full-tree structure, bounded retained blocks and actual large-tree
  diffs in Node and Chromium. PB1 adds the adopted host-only resource-limit
  distinction before I1/P2 consumer classification; that implementation is open.
- **MF1, MF2, CI1 and CI2 are shipped.** Their
  [PDS patch](2026-10-01-atseq-pds-patch-results.md),
  [telemetry isolation](2026-10-01-atseq-fixture-telemetry-results.md),
  [archive transport](2026-10-01-atseq-archive-offline-ci.md) and
  [focus](2026-10-01-atseq-participation-focus-ci.md) reports retain actual tests
  and limits. P1 passed Linux Node 22.13/24/26 at `3cdf0b07`, run `36893763670`.
  CI3 passed the later full Node 22.13/24/26 matrix after both CI fixes at `2c759838`, [run `36897498460`](https://github.com/generalbusiness-ai/atseq/actions/runs/36897498460). Subsequent deliveries still need their own checks.
- **I1, I2, N1, R0 and C1 have reviewed directions.** Their
  [admission](2026-10-01-atseq-account-admission-design.md),
  [authority](2026-10-01-atseq-account-authority-design.md),
  [ordering](2026-10-01-atseq-native-ordering-requirements.md),
  [retry](2026-10-01-atseq-retry-uniqueness.md) and
  [discovery](2026-10-01-atseq-actor-discovery.md) notes do not constitute shipped
  account identity or native Atseq ordering. Final operation/certificate bytes,
  enforced role interface, profile identity, runtime integration and actual
  provider permissions remain gates. I1's planned maintained transport requires
  an explicit Node minimum change from 22.13 to 22.19, together with support docs,
  CI and real host private-address/DNS-rebinding checks.
- **B0 is in implementation; S0 is requirements work.** The reviewed authoring
  contract needs its explicit v2 profile, final dependency provenance and packed
  conformance. Guitar/rainfall aggregate-bound correction `77e604a5` is prepared
  with real-query and cheap maximum-state regressions. The
  [state requirements](2026-10-01-atseq-state-requirements.md) remain proposed;
  no keyed effects contract is selected. **M0 is shipped.** Its [runtime patch report](2026-10-01-atseq-runtime-advisory-results.md) records the single-node brace-expansion patch, separately identified current-closure attribution refresh, unchanged profile CIDs, 355 passing tests and 13 passing acceptance stages. B0's dependency integration now follows that landed graph.

P2/P3/P4, R1, A1/A2, E1 and T1 remain open. Account reuse needs pair-scoped state,
collection-scoped OAuth publication and demonstrated provider behavior; dedicated
accounts are recommended for production or busy repositories. Native ordering
custody includes every credential holder able to write the Atseq collections.
No accepted design supplies unseen non-equivocation or independently proves
current identity/state. Source-only work may proceed in parallel; unsettled wire
and overlapping dependency changes remain ordered to reduce rework.

The [initial evidence snapshot](2026-10-01-atseq-implementation-results.md)
retains its historical probes and captures. Later reports supersede those probes
for current recommendations; no old timing capture is silently rewritten.

## Continuation decisions and work

C0 is satisfied as a decision: adopt independently reviewed
[per-action execution contracts](2026-10-01-atseq-activation-compatibility.md).
An unrelated feature addition preserves unchanged actions and their contract-scoped
grants. Each contract includes the exact fold, reachable input/state schemas and
semantic profile; ordinary fold metadata exposes that action contract. N1/I2
still owe the concrete wire, implementation and conformance cases. Review
`3dcab9c1` and final report `55d74888` record this decision.

M1 is satisfied as an assessment. The
[PDS dependency report](2026-10-01-atseq-pds-dependency-assessment.md) distinguishes
the disposable fixture from the shipped graph and identifies narrow compatible
patches. Update one fixture in place; retain old captures with their old lock
hashes. MF1 implements the patches and MF2 isolates inherited telemetry. Their
implementation and exact-head delivery gates remain separate from the assessment.
Review `e23495f5` and final report `e94181a5` record the accepted recommendation.

Q0 is satisfied as a direction: the
[public/confidentiality scope](2026-10-01-atseq-confidentiality-direction.md) remains
explicitly public. A confidential mode needs a concrete requirement and separate
reviewed contract; no speculative encryption mode is added. A1/A2/T1 own first-run,
README and device-local storage disclosures. Review `a54acf1c` and final report
`e5c4ce11` record the decision.

P1 native proof primitives are shipped; B0 source-document conversion remains in implementation after independent boundary assessments `06110ff6` and `75465898`. P1 preserves semantic bytes while supplying bounded native evidence; PB1 refines local resource classification. B0 routine discovery stays lean; complete source is opt-in.
Its service schema currently participates in the app profile, so review `3528d227`
requires an explicit v2 profile advance with regenerated conformance evidence.
N1's later native profile must review a separate service-contract identity so
routine API evolution does not require a new app genesis.

P0 baseline characterization is shipped; V0 and E1 continue the measured performance work. Full native ordering, account
adoption, durable materialization, portable checkpoints and final end-to-end
characterization remain open. The adopted decisions above are not completion of
their downstream implementation.
