# Design and Implementation Notes

Dated notes (YYYY-MM-DD-title.md) to capture designs, implementation plans,
and discussion summaries.  Frontmatter "status" should be maintained.

| Note | Status | Purpose |
|---|---|---|
| [Atseq architecture](2026-09-06-atseq-architecture.md) | Adopted for the spike | Framework contracts, ecosystem reuse, and scope |
| [Initial spike](2026-09-06-atseq-initial-spike.md) | S0 awaiting review; S1–S6 not started | Work packages, critical UI flows, and acceptance gates |
| [Runtime feasibility](2026-09-06-atseq-runtime-feasibility.md) | S0 gate passes; awaiting review | Shared evaluator, runtime Lexicon validation, Inlay control and measured evidence |
| [Plan review](2026-09-06-atseq-plan-review.md) | Review; recommendations not yet adopted | Efficiency, adoption, and expressiveness findings against the architecture and spike plan at `efbd900` |

The architecture and spike plan are companions. Read the architecture for the
design basis and the plan for execution. New experiment results get their own
dated note; this index should link them and distinguish planned from shipped
behavior. GitSeq tracks repository work only and is not an atseq runtime
dependency.
