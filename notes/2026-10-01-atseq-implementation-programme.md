---
date: 2026-10-01
status: implementation started; full programme open
examined_at: 781732f47f02d26332942147bfbe8f4e95526231
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
| NW0     | `6213c7bf` | Freeze native wire and authority operation contracts              | Adopted recovery decision; exact vectors open |
| N0      | `d62b5a88` | Check generated attribution without writing                       | Shipped; exact-head review                    |
| N2      | `1acd7587` | Pin attribution ordering during the identity graph refresh        | Identity foundation review and landing        |
| B1      | `05ba889d` | Preserve typed malformed source-document byte errors              | Shipped; exact-head review                    |
| S1      | `d91eddf6` | Avoid full outcome-history copies in routine reads                | Shipped; exact-head review                    |
| F3      | `4851a077` | Publish continuation assessments and corrected notes              | Exact-head documentation review              |
| N1-F1   | `1012e4e2` | Deliver isolated native wire framing and conformance preparation  | Exact-head review; parent N1 remains open      |
| I1-F1   | `de0005d3` | Deliver internal retained identity/network verification foundations | Exact-head review; parent I1 remains open   |

## Completion and reports

Every delivery reports actual code/artifacts, exact revision, commands/fixtures,
raw captures where relevant, results, recommendations, trust/functional limits
and remaining cases. Design decisions are reviewed before the affected contract
is implemented. Changes are independently reviewed at an exact head, merged
through gitseq and pushed under the user's authorization.

D0 selected the independently reviewed authority backbone. NW0 and R0 now settle
the logical wire and retry contracts; N1/R1 still owe their complete implementation.
C0 adopted per-action execution compatibility, while C1 still owes its enforced
role and capability interfaces. An unresolved choice cannot
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
  remains distinct from independent audit. V0's independently approved local
  optimization preserves all schema passes and semantic identities. Its actual
  validation kernel changed from about 8.34 ms to 2.47 ms at 9,999 items; this
  is not an integrated catch-up measurement.
- **P1 is shipped.** The [native proof foundation](2026-10-01-atseq-native-proof-results.md)
  verifies exact roots/record bytes, sparse versus missing/absent evidence,
  visited/full-tree structure, bounded retained blocks and actual large-tree
  diffs in Node and Chromium. PB1 adds the adopted host-only resource-limit
  distinction before I1/P2 consumer classification. The corrected
  [PB1-R1 result](2026-10-01-atseq-native-proof-resource-limit-r1-results.md)
  is shipped: observed invalid tree intervals still take precedence over missing
  prerequisites and local capacity limits.
- **MF1, MF2, CI1 and CI2 are shipped.** Their
  [PDS patch](2026-10-01-atseq-pds-patch-results.md),
  [telemetry isolation](2026-10-01-atseq-fixture-telemetry-results.md),
  [archive transport](2026-10-01-atseq-archive-offline-ci.md) and
  [focus](2026-10-01-atseq-participation-focus-ci.md) reports retain actual tests
  and limits. P1 passed Linux Node 22.13/24/26 at `3cdf0b07`, run `36893763670`.
  CI3 passed the later full Node 22.13/24/26 matrix after both CI fixes at `2c759838`, [run `36897498460`](https://github.com/generalbusiness-ai/atseq/actions/runs/36897498460). Subsequent deliveries still need their own checks.
  The B1 fix and combined V0 implementation passed their pushed-main Linux
  matrices at `ab309023` ([run `36909739355`](https://github.com/generalbusiness-ai/atseq/actions/runs/36909739355))
  and `2a6870ca` ([run `36910654142`](https://github.com/generalbusiness-ai/atseq/actions/runs/36910654142)).
  S1 passed the pushed-main matrix at `781732f4` ([run `36914299375`](https://github.com/generalbusiness-ai/atseq/actions/runs/36914299375)).
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
  Original internal foundation candidate `412b0c9b` received required corrections
  in review `d1d1d9a9`. Successor `2b9e255c` is submitted for replacement review
  under the narrower I1-F1 request; no approval or landing is assumed. It retains a completed serial 380-test suite, 57 shared
  Node/Chromium/installed-consumer identity cases and actual guarded-dispatch
  network checks. Its interrupted parallel attempt is retained separately.
  Observer orchestration, descriptor/native record linkage, admission floors,
  retention, assurance display/export and provider trials remain parent I1 work.
- **B0 and B1 are shipped.** The [authoring result](2026-10-01-atseq-authoring-bundle-results.md)
  retains the explicit v2 log/application profile, source-document/CAR identities,
  opt-in complete source, actual CLI/host/viewless-browser flows and installed
  consumer checks. Guitar/rainfall aggregate correction `77e604a5` has real-query
  and maximum-state regressions. The [B1 correction](2026-10-01-atseq-authoring-byte-error-results.md)
  preserves typed invalid-input classification for malformed Base64 trailing bits.
- **S0 keeps complete state as the default.** The independently reviewed
  [options note](2026-10-01-atseq-effects-transaction-options.md) prefers the
  present 128 KiB state contract with V0 and checkpoints. A new effects contract
  waits for a concrete application need beyond that bound and measured at-cap
  Node/Chromium costs. S1 is shipped at `781732f4`: its [selective-capture result](2026-10-01-atseq-selective-captures-results.md)
  records owned query/status/receipt captures without changing that contract.
  On 1,000 retained outcomes, query/status captures avoid all historical outcome
  rows; full persistence and export still retain their complete-projection costs.
- **M0 and N0 are shipped.** The [runtime patch report](2026-10-01-atseq-runtime-advisory-results.md)
  records the narrow brace patch, separately identified attribution refresh,
  unchanged profile CIDs and actual acceptance. The [notice check](2026-10-01-atseq-notice-check-results.md)
  validates generated output in CI without writing. N2 pins the comparator's
  locale in the upcoming identity attribution refresh.

The [native wire note](2026-10-01-atseq-native-wire-contract.md) records accepted
encoding/source decisions and the corrected recovery hierarchy. Corrected
recovery and map-pressure decisions are adopted; literal implementation vectors
remain gates. The
[incremental reader requirements](2026-10-01-atseq-incremental-reader-requirements.md)
treat account revisions as advisory cursors, preserve every known app floor and
reuse a current boundary without claiming an interior audit. The
[materialization/checkpoint note](2026-10-01-atseq-materialized-checkpoints.md)
separates trusted local atomic restore, native publication assertions and
independent genesis replay. The [checkpoint byte note](2026-10-01-atseq-checkpoint-policy-bytes.md) adopts
reviewed outer-shape simplifications: local reader mode, version-implied native
publication, derived pending history and no duplicated constant claims. Joint
closed row schemas and literal native payload vectors remain gates. These designs are not shipped native ordering or persistence.

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
hashes. MF1 shipped the patches and MF2 shipped telemetry isolation, each through its own
independent exact-head review.
Review `e23495f5` and final report `e94181a5` record the accepted recommendation.

Q0 is satisfied as a direction: the
[public/confidentiality scope](2026-10-01-atseq-confidentiality-direction.md) remains
explicitly public. A confidential mode needs a concrete requirement and separate
reviewed contract; no speculative encryption mode is added. A1/A2/T1 own first-run,
README and device-local storage disclosures. Review `a54acf1c` and final report
`e5c4ce11` record the decision.

P1 native proof primitives and B0 source-document conversion are shipped after
their independent boundary reviews. P1 preserves semantic bytes while supplying
bounded native evidence; shipped PB1-R1 refines local resource classification.
B0 routine discovery stays lean; complete source is opt-in. Its service schema
currently participates in the app profile, so review `3528d227` required the
explicit v2 profile advance that B0 now ships with regenerated conformance evidence.
N1's later native profile must review a separate service-contract identity so
routine API evolution does not require a new app genesis.

P0 baseline characterization and V0 canonical optimization are shipped; E1 continues the measured performance work. Full native ordering, account
adoption, durable materialization, portable checkpoints and final end-to-end
characterization remain open. The adopted decisions above are not completion of
their downstream implementation.
