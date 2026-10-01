# Design and Implementation Notes

Dated notes (YYYY-MM-DD-title.md) to capture designs, implementation plans,
and discussion summaries.  Frontmatter "status" should be maintained.

| Note | Status | Purpose |
|---|---|---|
| [Atseq architecture](2026-09-06-atseq-architecture.md) | Adopted for the spike | Framework contracts, ecosystem reuse, and scope |
| [Initial spike](2026-09-06-atseq-initial-spike.md) | S0–S6 independently approved and landed | Work packages, critical UI flows, and acceptance gates |
| [Runtime feasibility](2026-09-06-atseq-runtime-feasibility.md) | S0 independently approved and landed | Shared evaluator, runtime Lexicon validation, Inlay control and measured evidence |
| [Protocol spike](2026-09-06-atseq-protocol-spike.md) | S1 independently approved and landed | Canonical bytes, independent proofs, retry identity and history verification |
| [PDS spike](2026-09-06-atseq-pds-spike.md) | S2 independently approved and landed | Real PDS appends, crash recovery, source retention and verified catch-up |
| [Definition and runtime spike](2026-09-06-atseq-runtime-spike.md) | S3 independently approved and landed | Retained source closure, fold/query behavior, atomic projections and late-loaded apps |
| [Interaction spike](2026-09-06-atseq-interaction-spike.md) | S4 independently approved and landed | Generic browser and CLI, local identities, recoverable publication and participation |
| [Evolution spike](2026-09-06-atseq-evolution-spike.md) | S5 independently approved and landed | Compatible activation, retained offline work, explicit replacement and ordered outbox |
| [Spike results](2026-09-06-atseq-spike-results.md) | S6 independently approved and landed; retained acceptance snapshot | Archives, offline rebuild, chart export, agent authoring and measured scaling costs |
| [Spike completion](2026-09-06-atseq-spike-completion.md) | S0–S6 complete; follow-on hypotheses remain unimplemented | Exact reviewed heads and landings, residual limits, and the Noseq handoff |
| [Plan review](2026-09-06-atseq-plan-review.md) | Review; recommendations not yet adopted | Efficiency, adoption, and expressiveness findings against the architecture and spike plan at `efbd900` |
| [Verification and bootstrap](2026-10-01-atseq-verification-and-bootstrap.md) | Proposed; independently assessed; prototypes pending | Performance cost space, retained state, verified suffixes and checkpoint trust |
| [ATproto identity](2026-10-01-atseq-identity.md) | Proposed; independently assessed; prototypes pending | Account principals, device/agent authority, web identity adoption and recovery |

The architecture and spike plan are companions. Read the architecture for the
design basis and the plan for execution. New experiment results get their own
dated note; this index should link them and distinguish planned from shipped
behavior. GitSeq tracks repository work only and is not an atseq runtime
dependency.

The post-spike notes characterize options without fixed latency/capacity targets
or a backward-compatibility requirement. Their current recommendation retains
separate sequencer custody, verifies suffixes against retained state, and uses
ATproto account identity with sequenced repository grants and revocations. The
sequencer is the default admission observer and checkpoint certifier. Alternatives
remain documented with conditions for revisiting them. Experiments are proposed,
not completed. Gitseq requests `c93e8909` and `c83c4b44` track this work; independent
assessments `564ea662`, `bd453363`, `6352f14b` and `a71b29a4` informed the revisions.
