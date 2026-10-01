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

| Package | Request    | Scope                                                             | Gates                                     |
| ------- | ---------- | ----------------------------------------------------------------- | ----------------------------------------- |
| D0      | `cde3cb20` | Choose the native repository authority contract                   | None                                      |
| P0      | `bdf1e791` | Capture and instrument the performance baseline                   | None                                      |
| P1      | `00d3dcd5` | Implement native repository proof primitives                      | D0                                        |
| I1      | `71b93a9c` | Implement account resolution and retained admission evidence      | D0, P1                                    |
| I2      | `0e55c16d` | Implement grants, revocation, epochs and app governance           | D0, I1                                    |
| N1      | `fea766bc` | Implement native app ordering and portable receipts               | D0, P1                                    |
| R0      | `2ba34dc6` | Decide retry/index semantics with evidence                        | D0, P0                                    |
| R1      | `5ebd3df1` | Implement selected retry and selective outcome storage            | R0, N1, I2                                |
| P2      | `3a7f6bb3` | Implement verified incremental native reads                       | P1, N1, I2                                |
| P3      | `bf870fc6` | Persist coherent local materialization                            | P2, R1                                    |
| P4      | `1f13a0dc` | Implement portable checkpoints and independent audit              | D0, P1, I2, R1, P3                        |
| A1      | `13d42e4a` | Implement account enrolment in library, CLI and browser           | D0, I1, I2, N1                            |
| A2      | `110166f9` | Implement provisioning, web identity and operational recovery     | A1, I2                                    |
| E1      | `8eec1d65` | Characterize performance, trust and adoption end to end           | P0, P4, A2                                |
| T1      | `e4aa9571` | Complete conformance, documentation and packaging                 | E1                                        |
| G0      | `47004674` | Concurrent plan-review gap assessment                             | Independent recommendation review         |
| C0      | `6f758f21` | Decide activation and queued-intent compatibility                 | Independent decision review               |
| B0      | `29bfbe65` | Implement single-document authoring and reconstructable discovery | Independent bundle/discovery contract     |
| C1      | `0332c6ca` | Design and implement actor-specific discovery                     | I2 and independent capability decision    |
| S0      | `fe6f8e12` | Decide complete-state versus keyed effects after measurements     | P0/E1 evidence                            |
| Q0      | `6f3fd8c5` | Assess confidentiality direction and public scope                 | Independent decision review               |
| M0      | `9e6a9894` | Resolve the bundled brace-expansion advisory narrowly             | Independent dependency equivalence review |
| M1      | `3b0bab47` | Classify disposable PDS test dependency advisories                | Independent decision review               |
| F0      | `1c3db0c1` | Initial programme/probe/gap/stage-harness delivery                | Decision assessment and exact-head review |

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

## Initial results and remaining work

D0/P0 and G0 started first. The initial delivery adds benchmark-only observation
and an isolated maintained-library/native-PDS proof probe. It changes no runtime
protocol or source semantics. See [initial evidence](2026-10-01-atseq-implementation-results.md)
and the [gap report](2026-10-01-atseq-plan-review-gaps.md).

The full implementation remains open. An approved initial decision or useful
benchmark is not completion of P0, identity adoption, native protocol, checkpoint
bootstrap, end-to-end measurements or release conformance. Update each dated
results report and this index from actual workroom dispositions.

D0/G0 decisions are supported by independent reports `4f823d99` and `9136c7bb`.
P1 additionally owes large-repository partial-diff/recovery evidence; N1/I2/C0
owe proven-absence versus transient-unavailability classification; A2 owes real
provider recovery-key permission evidence. These refinements remain required.
The exact public stage inputs are retained in gitseq evidence `1fa0ddc4`, whose
compressed attachment contains the fixtures and results JSON.
