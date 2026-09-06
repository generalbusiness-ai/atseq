# Design and Implementation Notes

Dated notes (YYYY-MM-DD-title.md) to capture designs, implementation plans,
and discussion summaries.  Frontmatter "status" should be maintained.

| Note | Status | Purpose |
|---|---|---|
| [Atseq architecture](2026-09-06-atseq-architecture.md) | Adopted for the spike | Framework contracts, ecosystem reuse, and scope |
| [Initial spike](2026-09-06-atseq-initial-spike.md) | S0–S4 landed; S5 and S6 gates pass and await review | Work packages, critical UI flows, and acceptance gates |
| [Runtime feasibility](2026-09-06-atseq-runtime-feasibility.md) | S0 independently approved and landed | Shared evaluator, runtime Lexicon validation, Inlay control and measured evidence |
| [Protocol spike](2026-09-06-atseq-protocol-spike.md) | S1 independently approved and landed | Canonical bytes, independent proofs, retry identity and history verification |
| [PDS spike](2026-09-06-atseq-pds-spike.md) | S2 independently approved and landed | Real PDS appends, crash recovery, source retention and verified catch-up |
| [Definition and runtime spike](2026-09-06-atseq-runtime-spike.md) | S3 independently approved and landed | Retained source closure, fold/query behavior, atomic projections and late-loaded apps |
| [Interaction spike](2026-09-06-atseq-interaction-spike.md) | S4 independently approved and landed | Generic browser and CLI, local identities, recoverable publication and participation |
| [Evolution spike](2026-09-06-atseq-evolution-spike.md) | S5 gate passes; awaiting review | Compatible activation, retained offline work, explicit replacement and ordered outbox |
| [Spike results](2026-09-06-atseq-spike-results.md) | S6 acceptance passes; awaiting review | Archives, offline rebuild, chart export, agent authoring and measured scaling costs |
| [Plan review](2026-09-06-atseq-plan-review.md) | Review; recommendations not yet adopted | Efficiency, adoption, and expressiveness findings against the architecture and spike plan at `efbd900` |

The architecture and spike plan are companions. Read the architecture for the
design basis and the plan for execution. New experiment results get their own
dated note; this index should link them and distinguish planned from shipped
behavior. GitSeq tracks repository work only and is not an atseq runtime
dependency.
