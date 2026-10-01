# Design and Implementation Notes

Dated notes (YYYY-MM-DD-title.md) to capture designs, implementation plans,
and discussion summaries. Frontmatter "status" should be maintained.

| Note                                                                         | Status                                                             | Purpose                                                                                                |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [Atseq architecture](2026-09-06-atseq-architecture.md)                       | Adopted for the spike                                              | Framework contracts, ecosystem reuse, and scope                                                        |
| [Initial spike](2026-09-06-atseq-initial-spike.md)                           | S0–S6 independently approved and landed                            | Work packages, critical UI flows, and acceptance gates                                                 |
| [Runtime feasibility](2026-09-06-atseq-runtime-feasibility.md)               | S0 independently approved and landed                               | Shared evaluator, runtime Lexicon validation, Inlay control and measured evidence                      |
| [Protocol spike](2026-09-06-atseq-protocol-spike.md)                         | S1 independently approved and landed                               | Canonical bytes, independent proofs, retry identity and history verification                           |
| [PDS spike](2026-09-06-atseq-pds-spike.md)                                   | S2 independently approved and landed                               | Real PDS appends, crash recovery, source retention and verified catch-up                               |
| [Definition and runtime spike](2026-09-06-atseq-runtime-spike.md)            | S3 independently approved and landed                               | Retained source closure, fold/query behavior, atomic projections and late-loaded apps                  |
| [Interaction spike](2026-09-06-atseq-interaction-spike.md)                   | S4 independently approved and landed                               | Generic browser and CLI, local identities, recoverable publication and participation                   |
| [Evolution spike](2026-09-06-atseq-evolution-spike.md)                       | S5 independently approved and landed                               | Compatible activation, retained offline work, explicit replacement and ordered outbox                  |
| [Spike results](2026-09-06-atseq-spike-results.md)                           | S6 independently approved and landed; retained acceptance snapshot | Archives, offline rebuild, chart export, agent authoring and measured scaling costs                    |
| [Spike completion](2026-09-06-atseq-spike-completion.md)                     | S0–S6 complete; follow-on hypotheses remain unimplemented          | Exact reviewed heads and landings, residual limits, and the Noseq handoff                              |
| [Plan review](2026-09-06-atseq-plan-review.md)                               | Review; recommendations not yet adopted                            | Efficiency, adoption, and expressiveness findings against the architecture and spike plan at `efbd900` |
| [Verification and bootstrap](2026-10-01-atseq-verification-and-bootstrap.md) | Proposed; independently assessed; prototypes pending               | Performance cost space, retained state, verified suffixes and checkpoint trust                         |
| [ATproto identity](2026-10-01-atseq-identity.md)                             | Proposed; independently assessed; prototypes pending               | Account principals, device/agent authority, web identity adoption and recovery                         |
| [Implementation programme](2026-10-01-atseq-implementation-programme.md)     | Started; full implementation open                                  | Assigned packages, dependency and independent-review gates                                             |
| [Native authority decision](2026-10-01-atseq-native-authority-decision.md)   | Adopted backbone; implementation pending                              | Preferred native PDS ordering, DID recovery, proofs and custody                                        |
| [Plan-review gaps](2026-10-01-atseq-plan-review-gaps.md)                     | Independently assessed; followups tracked                          | F1–F10 disposition and concurrent work                                                                 |
| [Initial implementation results](2026-10-01-atseq-implementation-results.md) | Initial evidence; full programme open                              | Native proof probe, stage baseline and recommendations                                                 |
| [Activation compatibility](2026-10-01-atseq-activation-compatibility.md) | Independently assessed; adopted direction; wire pending | Per-action execution contracts, queued consent, grants and activation |
| [PDS dependency assessment](2026-10-01-atseq-pds-dependency-assessment.md) | Independently assessed; maintenance tracked | Disposable fixture advisories, bounded patches and telemetry isolation |
| [Confidentiality direction](2026-10-01-atseq-confidentiality-direction.md) | Independently reviewed; public scope adopted | Public evidence, private-mode requirements, key/replay/checkpoint limits |

The architecture and spike plan are companions. Read the architecture for the
design basis and the plan for execution. New experiment results get their own
dated note; this index should link them and distinguish planned from shipped
behavior. GitSeq tracks repository work only and is not an atseq runtime
dependency.

The post-spike notes characterize options without fixed performance targets or a
backward-compatibility requirement. The subsequent implementation preference is
native app-PDS ordering with retained state and native proof verification. The
ordering host and app PDS supply default identity observation and checkpoint
certification under the documented custody policy. The programme tracks runtime
implementation still to do; the initial results report records the proof probe
and measured stage baseline already completed. Historical assessments remain
linked in their dated notes.
