---
date: 2026-10-01
status: requirements prepared; state-contract decision and independent review pending
examined_at: 66977be7e59527eccf3df91c55285e55914f3add
request: fe6f8e1263f22e6b3d81070d1f58f0e3cd819016
---

# Application state requirements before choosing effects

Task boards, shortlists and ledgers need consistent reads and atomic writes at
one interpreted application frontier. Their examples already distinguish a
small logical change from the cost of handling the complete state. Establish
those requirements and measure the separate costs before deciding whether folds
should return complete successor state or keyed effects.

This is S0 requirements preparation, not a state-contract decision or an effects
prototype. The [landed P0 baseline](2026-10-01-atseq-performance-baseline-results.md) makes the question concrete. V0 now characterizes canonical guard overhead before an effects choice; E1's native end-to-end evidence remains open. There is no fixed latency
target, and preserving the spike's contract is not a goal. Choose the simplest
complete approach for the measured circumstances. The
[gap analysis](2026-10-01-atseq-plan-review-gaps.md) tracks F2 and S0; the
[bootstrap note](2026-10-01-atseq-verification-and-bootstrap.md) explains why
checkpoints and cheap folds solve different parts of the problem.

## Examples examined

The main revision above contains the
[guitar fixture](../testdata/apps/fixtures.ts) and its
[selection extension](../testdata/apps/evolution.ts). It does not yet contain the
task-board or ledger authoring documents. Those were read from B0's preparation
at `a357f34288851399562a2fb85e588113074f96b1`, without changing that worktree:

| B0 source document                               | SHA-256 of the exact document read                                 |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| `testdata/source-documents/taskboard.atseq.json` | `bf2c631de02840922a58d61f921e6c3d3ddd7367ed05f21ec05c85651c03df20` |
| `testdata/source-documents/guitar.atseq.json`    | `4ef268e1cb51880d6d8422c47f55f9a011cb7ddc25998f6b4e19c6936b548555` |
| `testdata/source-documents/ledger.atseq.json`    | `f0b35532e77430223b076a1b33b9cffebdab09ea02971f4275d12154ac615f82` |

Each B0 document retains its initial state, Lexicons, folds and query bytes in
the versioned source document. The requirements below describe those exact
examples. Proposed measurement cases are labelled separately; they are not
claims that additional actions or query APIs have been implemented.

| Example                    | Reads needed for its existing writes                                          | Complete successor writes                                                         | Existing query                                                       |
| -------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Task board                 | Find a task by ID; for completion, test whether that ID is already completed. | Add appends one task; complete appends one completed ID. Both return both arrays. | Counts all tasks and completed IDs.                                  |
| B0 guitar shortlist        | Find a candidate by ID before adding it.                                      | Append one candidate and return the complete candidate array.                     | Candidate count and sum of `pricePence`.                             |
| Main guitar with selection | Find a candidate by ID before adding or selecting.                            | Add appends a candidate; select changes one string and retains all candidates.    | Count and selected ID; the extension also exposes a selection query. |
| B0 minor-unit ledger       | Find an entry by ID; read the current balance and currency.                   | Append one entry and update balance together, retaining currency.                 | Entry count, stored balance and currency.                            |

These ID checks use JSONata array filters. No example has an indexed lookup
contract. Append order is observable array order and must survive any storage
change. Selecting one guitar is a useful sparse-write case: almost all domain
data stays unchanged, while the current runtime still handles the full state.

## Schema and domain requirements

All three B0 collections permit at most 1,000 items. IDs and titles or
descriptions contain 1–120 characters. Completed task IDs have the same string
bound. The arrays' bounds are separate from the runtime's encoded-state bound;
long strings and retained extra fields can exhaust the byte budget before an
array reaches 1,000 items.

The task board must preserve unique task IDs, unique completed IDs and the rule
that a completed ID names an existing task. `add` returns `already_added` for a
duplicate. `complete` returns `unknown_task` or `already_completed` as applicable.
These are domain decisions in the retained fold, not relationships proved by
the array item schemas. A changed-row validator alone cannot establish them.

The guitar shortlist must preserve unique candidate IDs and retain every
candidate's integer price. Duplicate additions return `already_listed`. The
main selection extension rejects a missing candidate with `unknown_candidate`.
Its selected ID must refer to an existing candidate, except for the initial
empty selection. The B0 guitar document has no selection field or action.

B0 guitar prices range from 0 to 1,000,000 pence, but its summary also limits
`totalPence` to 1,000,000. Thus two individually valid additions can produce valid
state with an unavailable summary. Before using this query as a success
benchmark, B0 must decide whether to widen the aggregate output bound or enforce
a total-price invariant. This note makes neither change. A query failure must
remain distinct from an invalid application state or failed write.

The ledger uses exact integer minor units and the fixed currency `GBP`. Each
entry amount and the stored balance range from −1,000,000 to 1,000,000. Duplicate
entry IDs return `already_recorded`. Recording an entry must atomically append
it and add its amount to the balance. A valid amount that puts the successor
balance outside its schema bound must leave both old entries and old balance
unchanged. At the examined runtime it becomes `fold_failed/schema_value`, and
interpretation advances with the prior state. It must never leave a journal
entry without its balance update, or the reverse.

The balance is a stored aggregate. Its equality to the sum of journal amounts
is a fold invariant, not a property enforced by the state Lexicon. A later
comparison should include independently recomputing that sum as an audit case;
the current summary merely reads the stored balance. Domain duplicate IDs are
also distinct from protocol retries of the same signed intent. Do not use one
as a substitute for the other. These examples do not implement transfers,
multiple accounts, double-entry accounting or currency conversion.

## Required consistency across storage choices

Each successful action publishes one coherent state and outcome at one entry.
Two participants adding the same ID must produce one effective addition and
the later duplicate outcome according to the selected ordering. Completion or
selection before its referenced item exists must retain its existing missing-item
outcome; a future item must not satisfy an earlier read. A local preview is a
simulation and cannot reserve that ordering or guarantee effectiveness.

Queries must name the frontier they actually read. Counts, selected IDs, entry
lists and aggregates must never combine different frontiers. If materialized
indexes or counts are introduced, their updates belong to the same atomic
transition as the domain records, and their derivation must remain checkable.
They must not create a second unreviewed authority for application state.

The current [folder](../src/application/folder.ts) validates the successor before
publishing it, persists an owned complete projection before memory advances,
and captures a complete projection for a query before awaiting evaluation.
Deterministic invalid-input failures retain prior state; missing required source,
runtime faults and persistence failure stall rather than invent a domain outcome.
These distinctions remain requirements for any successor contract.

Use the adopted [native authority](2026-10-01-atseq-native-authority-decision.md)
and [per-action execution identity](2026-10-01-atseq-activation-compatibility.md)
directions. State changes must not bypass ordered grant checks or change an
action's meaning outside its execution contract. Keep exact retained source and
credential-free replay. Bind restored state, active definition, authority,
outcomes and retry evidence to the same accepted frontier under the bootstrap
rules. Native repository membership authenticates published bytes and ordering;
it does not prove that a state, aggregate or index was derived correctly.

## Current complete-state costs and limits

The [runtime profile](../docs/runtime-profile.md) and
[constants](../src/core/profile.ts) admit 128 KiB of canonical JSON UTF-8 state,
256 KiB each of complete input and output, 32 KiB actions, depth 32,
100,000 evaluation visits, a 16,384-element intermediate sequence limit,
1 MiB per intermediate result and 16 MiB of cumulative intermediate inspection.
Sequence length is not a universal state-array length allowance. Host history
has its own [20,000-entry policy](../src/core/limits.ts). Neither a row count nor
a history count replaces byte, schema, depth or inspection bounds.

The present cost paths are explicit:

- [Folding and evaluation](../src/runtime/evaluator.ts) validate the complete
  action and current state, make an owned copy of complete input, inspect
  canonical intermediate results, copy the output and check successor size.
  A constant AST visit count does not mean constant bytes inspected.
- [Schema validation](../src/definition/schemas.ts) checks canonical input,
  invokes the ecosystem's Lexicon validator, then compares canonical validated
  and supplied values to refuse coercion. These are separate full-value walks.
- [Canonical ownership](../src/core/values.ts) uses canonical serialization and
  parsing for `jsonCopy`; it is not a reference-only copy.
- The folder's optional persistence copies the complete projection and growing
  outcomes for each accepted entry. Final snapshots and query capture also copy
  complete projections. In-memory measurements without that persistence do not
  characterize durable per-entry copying or storage.

The supported domain schemas reuse `@atproto/lexicon`: objects, arrays, primitive
types, references and closed unions. The admitted object schema has explicit
properties; it has no typed arbitrary-key map or custom cross-record invariant
constraint. A physical keyed store does not by itself provide a reviewed logical
schema for keyed state. Arrays retain order, absent differs from null, and extra
object fields are retained. An optimization must not silently drop those fields,
coerce values or relax reserved-key, integer, Unicode and ownership checks.

## Preliminary performance evidence

P0's captures at `8b7e8f61598d5369cc0352e744cfe729b8fe326b` used Node 26.10.0 on
one Apple M5 Max machine. For 10,000 growing-state actions, median interpretation
was about 186.1 seconds with one actor and 184.3 seconds with sixteen actors;
median history verification was about 6.1 and 6.2 seconds respectively. The
sixteen-actor interpretation samples ranged from 181.5 to 260.3 seconds. Final
state was 48,929 JSON bytes. These are preliminary in-memory measurements, not
browser, PDS, durable-storage or actor-scaling conclusions.

The instrumented regions put about 43 seconds of the one-actor median sample
inside successor validation and about 141 seconds inside the fold region.
That fold region includes several guards and evaluation. Lexicon validation
timings are nested within validation regions; independent kernel timings also
overlap their constituent operations. Do not add these measurements together or
claim exclusive attribution to schema, encoding, copying or expression logic.

In P0's separate kernels, evaluator visits remain 18 while inspected bytes grow
from 290 at an empty array to 293,670 at 9,999 elements. This supports investigating
repeated complete-value work. It does not select keyed effects or show that
signature optimization alone solves growing-state interpretation.

The evidence read is P0-owned and still awaiting its delivery/review:

| Pending retained evidence path under `experiments/post-spike-evidence/2026-10-01/` | SHA-256                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `performance-stages-instrumented-10000-growing.json`                               | `5b8a1a7882fe0518c3103ab32058f16a9ac3dad1efe2c86f25db9f6796406d72` |
| `performance-kernels.json`                                                         | `c7a07d208e8121f255e7056d0ccb4f1b023dcb0a64a9dca1b1f397d0d887a69f` |

The growing fixture uses a primitive array with its own schema. Its 10,000
elements do not establish that these object-based examples accept 10,000 rows;
their current schemas cap collections at 1,000. Fixture shape, state bytes,
history length, changed records and actor/grant counts must be reported
independently.

## Measurement and decision gates

1. Finish P0/E1 stage evidence. Attribute validation, expression evaluation,
   canonical guards, encoding/CIDs, copying and durable storage independently
   where instrumentation can support it. State overlapping regions explicitly.
   Record exact source/fixture hashes, runtime, repeats and raw samples.
2. Compare growing appends with bounded-state updates, and a sparse guitar
   selection with an append. Vary record count and text size within the declared
   profile. Use an explicitly reviewed fixture/profile if exploring beyond its
   caps; do not silently raise production limits for the benchmark.
3. Measure point lookup, array traversal, counts, a recomputed monetary sum and
   complete snapshot/archive construction separately. Point-lookup and audit
   queries are proposed comparison workloads, not existing example APIs. A
   future page query needs explicit stable order, frontier and completeness
   rules; paging is not assumed here.
4. Measure replay, warm local restore, tail catch-up and accepted portable
   checkpoints in their respective trust modes. Include browser and durable
   storage where E1 supports them. A checkpoint reduces historical bootstrap;
   it does not necessarily reduce each new fold's state work.
5. First compare the smallest complete-state optimization that the measurements
   justify. If effects remain justified, document bounded reads and writes,
   absence/uniqueness checks, atomic aggregate updates, logical schema, budgets,
   query/snapshot costs and exact failure semantics before a prototype. A Merkle
   proof can authenticate a key or its absence at a root; completeness and
   correct derivation still require the chosen replay or certification policy.
6. Obtain independent contract review before implementing an effects runtime.
   Record which costs improve, which remain proportional to total state, and
   the additional contract and retention obligations. Do not equate O(change)
   write validation with O(change) reads, queries, snapshots or verification.

No S0 runtime, effects prototype, build, test or benchmark was run for this
requirements note. The work was source inspection and reading already captured
public evidence. Next steps are P0/E1 evidence assessment, resolution of the B0
aggregate-query bound, and a reviewed state-contract recommendation under S0.

## Subsequent reviewed sample correction

Independent decision `77e604a5` adopts widening guitar and rainfall aggregate output bounds to 1,000,000,000, the exact product of their item count and per-item bounds. B0 prepares that correction and maximum-state/query regressions; the source hashes and defect discussion above remain the examined historical inputs. This fixture correction does not select a new state/effects contract.
