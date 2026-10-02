---
date: 2026-10-01
status: measured proposed disposition; independent review pending
examined_at: c242ca20e823ea510e3939a8466a608f3ab860ba
request: 1c284142e7488e4242a77a67ec1cda349efd8151
promise: 98cc092fcd4b0c9522438fe68352fec188216fa2
parent_request: fe6f8e1263f22e6b3d81070d1f58f0e3cd819016
parent_promise: 053e043c3b5b482dbb6e703d2eb7cba816dd50cb
timed_source: 7ae19979b72f735ffe6f08012a5e9185b6dc04e4
---

# Complete state remains the simplest supported application contract

Keep complete-state folds as the default for the examined task-board, guitar
and ledger applications. Their existing contracts fit the admitted byte and
row bounds. No identified application requires state beyond those bounds. The
reviewed cap measurements expose substantial shape and complete-value work;
they do not by themselves justify the additional read/write, schema and atomic
commit semantics of keyed effects.

This is a proposed disposition under S0-M1, not a new runtime decision or a
completion receipt. Independent `atseq-reviewer` review must decide whether the
requirements, adopted default and narrow evidence satisfy the design scope.
Broader native/durable/bootstrap E1 gates remain separate and open.

## Concrete requirements and what is already supported

| Application | Necessary read/write behavior | Schema and invariants | Query and audit scope |
| --- | --- | --- | --- |
| Task board | Find an ID before add; find a task and completed ID before completion. Append a task or completed ID atomically while retaining both ordered arrays. | At most 1,000 tasks and 1,000 completed IDs; strings 1–120 characters. Folds enforce task uniqueness, completed uniqueness and reference existence. Missing task is `unknown_task`; duplicates are `already_added` / `already_completed`. | Existing summary counts tasks and completed IDs at one captured frontier. Populated completion is an existing action, not a new API. |
| Guitar | Test duplicate candidate IDs before append; existing selection extension checks the selected candidate exists and changes one string while retaining the whole ordered array. | At most 1,000 candidates; strings 1–120 characters; per-item price 0–1,000,000 pence. Missing selection is `unknown_candidate`; duplicate add is `already_listed`. | B0 summary recomputes price sum with reviewed bound 1,000,000,000. B0 has no selection action; the existing evolution fixture supplies selection and its small query. |
| Ledger | Check duplicate entry ID; append the entry and update stored balance atomically in one successor. Preserve journal order and fixed currency. | At most 1,000 entries; strings 1–120 characters; safe integer minor units, entry amount and stored balance ±1,000,000. Duplicate is `already_recorded`; invalid successor balance produces `fold_failed/schema_value`, retaining prior journal and balance together. | Existing summary returns count, stored balance and `GBP`. An independent journal sum is a correctness oracle, not an admitted application audit query. |

These requirements come from the retained
[requirements note](2026-10-01-atseq-state-requirements.md), the landed source
documents and the existing guitar evolution fixture. Its historical guitar
aggregate defect was resolved by independent decision `77e604a5`: aggregate
output permits the exact product of item count and per-item maximum. This
disposition reads the corrected guitar document SHA-256
`1d1a5163f18f53e7eeae178f90fda440fee0efe42e6f8bcf5de7f1952dce9643`.
Task-board and ledger source document hashes remain
`bf2c631de02840922a58d61f921e6c3d3ddd7367ed05f21ec05c85651c03df20`
and `f0b35532e77430223b076a1b33b9cffebdab09ea02971f4275d12154ac615f82`.

All states also obey the 128 KiB canonical JSON UTF-8 limit. Row count alone
does not establish admissibility: long text and retained extra fields consume
that byte budget. Arrays retain observable order. Exact Unicode IDs, absent
versus null, coercion refusal, reserved keys and owned input/output remain
meaningful. ATproto Lexicons supply the existing schema validation; physical
keyed storage would not automatically provide a logical typed-map or
cross-record invariant contract.

## Adopted choice and shipped improvements

Ratified assessment `a03c7402ab2e946608ae8e6fb007fc7b70954acb`, ratifier
`633621dc06265471c4f1f8cd531681b7b9c01617`, already adopts option A:
complete-state folds, the V0 guard improvement and checkpoints as the default.
It does not authorize an effects prototype. The
[effects comparison](2026-10-01-atseq-effects-transaction-options.md)
documents why patch output alone does not make validation incremental, why
declared point reads plus typed writes are the conditional next comparison, and
why evaluator-driven host I/O adds no demonstrated value for these examples.

V0 shipped at `2a6870ca`; S1 selective status/outcome/query capture shipped at
`781732f4`. V0 reduces redundant ASCII token encoding while retaining admission
and canonical checks. S1 avoids copying full outcome history for routine status,
exact outcome and query observations. Neither change makes complete-state folds
or queries proportional to the number of changed records.

P0 measured actual old-engine 10,000-action growing replay at about 186 seconds
median interpretation and about 6 seconds verification on its retained Node
fixtures. That is total replay, not a single action, and its final 48,929-byte
primitive-array state is not a 10,000-row task-board or ledger. P0 predates V0/S1
and must not be used as a direct before/after claim against different fixtures.

Reviewed E1-K1 candidate `940f0ad09281180ff3e915d683050648b6bc8bb0`
landed in main `c242ca20e823ea510e3939a8466a608f3ab860ba`.
Its [cap report](2026-10-01-atseq-complete-state-cap-results.md) retains seven
shapes at small, near-cap and at-cap sizes with Node and Chromium kernels.
At cap, single action-and-successor medians range from 0.66–26.03 ms in Node
and 1.3–66.1 ms in Chromium. Shape matters at equal encoded bytes. Overlapping
kernel timings cannot be added or subtracted into exclusive replay stages.

The same evidence distinguishes valid domain JSON from protocol CBOR. All
fourteen near/at-cap fixture states exceed the 64 KiB single-block bound;
their CBOR/state-CID kernels correctly refuse with `wire_size`. Refusal timing
is not successful state encoding. Standard chunked checkpoint content is a
separate reviewed representation; this disposition changes neither limit.

## Narrow whole-replay result

The [replay preparation](2026-10-01-atseq-s0-replay-preparation.md) fixes
four admitted workloads at N=100 and N=1,000. It includes actual populated
task-board completion, the existing sparse guitar selection extension and
ledger appends with an independent untimed journal audit. It interprets each
whole signed history from frontier zero once per timed sample; repeated final
actions are not substituted for replay.

All eight cells passed in both environments, two whole replays per cell:
32 timed spans and 17,600 actually interpreted entries. Each sample checked
every outcome was effective, exact final state and frontier, no stall, the
existing query result and independently computed domain invariants outside the
clock. Node and Chromium final references match exactly. The
[raw Node capture](../experiments/post-spike-evidence/2026-10-01/s0-replay/node-timing.json),
[raw Chromium capture](../experiments/post-spike-evidence/2026-10-01/s0-replay/chromium-timing.json)
and [statistics](../experiments/post-spike-evidence/2026-10-01/s0-replay/statistics.json)
retain every span; no timed failure or sample was discarded.

The table shows the full range of two whole-replay samples, rounded to 0.01
seconds. Raw captures retain fractional milliseconds. There are no timing
thresholds, population percentiles or inferred maximum latencies.

| Workload | Actions | Initial / final domain bytes | Node whole replay, seconds | Chromium whole replay, seconds |
| --- | ---: | ---: | ---: | ---: |
| Row-array revision toggle | 100 | 131,072 / 131,072 | 1.65–1.66 | 4.38–4.39 |
| Populated task-board completion | 100 | 130,172 / 131,072 | 2.76–2.97 | 6.53–6.60 |
| Sparse guitar selection | 100 | 131,066 / 131,072 | 2.42–2.57 | 5.61–5.61 |
| Ledger append | 100 | 126,022 / 131,072 | 2.47–2.58 | 6.07–6.12 |
| Row-array revision toggle | 1,000 | 131,072 / 131,072 | 16.29–16.50 | 46.77–47.89 |
| Populated task-board completion | 1,000 | 122,073 / 131,072 | 24.43–24.70 | 62.43–65.04 |
| Sparse guitar selection | 1,000 | 131,066 / 131,072 | 21.67–22.24 | 56.10–57.01 |
| Ledger append | 1,000 | 48 / 131,072 | 14.16–14.39 | 31.87–32.17 |

Changing a single selection string still interprets complete state. Finite row
bounds do not make an arbitrarily long history cheap. The growing 1,000-action
ledger starts empty; its lower total cannot be compared as though every action
started at cap. Its retained text padding is concentrated in earlier rows.
The 100-action ledger starts with 900 rows at a newly defined genesis and
measures that different byte trajectory. Task-board state also grows through
completed IDs while retaining all 1,000 tasks. These are specified workloads,
not an application traffic distribution, randomized order, scaling law or
10,000-action post-V0 result.

The clock includes actual `Folder.catchUpVerifiedStatus` from frontier zero,
with complete-state interpretation, framework outcome checks, entry/intent CID
encoding, frontier updates, retained outcomes and returned status. It excludes
source loading/admission, complete history/signature verification, input signing,
one ten-entry warmup per cell, final complete snapshot, queries and the domain
oracle. There is no persistence callback. It therefore supplies a current-source
historical-protocol interpretation baseline, not total bootstrap or submission
latency. No exclusive validation/evaluation/encoding/copying decomposition is
inferred by subtraction, and native identity/repository/authority, durable
storage, worker transfer, archive and checkpoint restore remain unmeasured.

## Provenance, execution conditions and corrections

The frozen timed producer is `7ae19979b72f735ffe6f08012a5e9185b6dc04e4`,
based on approved main `c242ca20`; Node 26.10.0 ran before actual Chromium
153.0.8010.12. Machine details are Apple M5 Max, 18 logical CPUs, 64 GiB RAM,
arm64 macOS kernel 27.0.0. The runtime still uses the approved 147-path dependency
graph and existing supported profile identities recorded in the Node capture.
This isolated basis predates the concurrent P4 merge; no new native reader cost
is attributed to that merge. The ordinary build and `npm run check` passed
during preparation. Only experiment scripts, new evidence and dated notes are
added; production, dependencies, profiles and prior captures are unchanged.

The corrected public-input JSON is 7,315,389 bytes, SHA-256
`53c4b6b3c76548d9678d81037972506fcb75d02e544b00350e209d3e017be88a`.
The [input manifest](../experiments/post-spike-evidence/2026-10-01/s0-replay/input-manifest.json)
pins all sources and expectations. Retained source CARs contain explicit
initial-state seeds, not authenticated checkpoints. Row-array source is
unchanged; each sample definition changes only its initial-state file. Source
loading proves those source bytes, not any preceding application history.

Root paused project artifact publication and heavy validation for the runs.
The observation bracket is 2026-10-02 02:44:11–02:58:32 UTC, still October 1 in
the project's local timezone. This includes preparation and gaps between spans;
it is not one measured replay duration. Node's `capturedAt` records metadata
construction before its run; Chromium's records capture assembly after its run.
The [process observations](../experiments/post-spike-evidence/2026-10-01/s0-replay/process-before.txt)
also cover Node, the stage boundary, Chromium and the completed window.

The shared host remained active. During Node, `ps` recorded another process
named `node` at 249.5%, Spotlight `mds_stores` at 74.1%, keep-skill Python at
96.4% and a user Chrome renderer at 39.0%. During Chromium, the measurement
browser was 247.8%, an unrelated artroom gitseq process 99.1% and WindowServer
27.6%. These are process-accounting samples, not interval utilization or causal
attribution. No user/system process was changed; no pristine-machine claim is
made. JIT, scheduling, garbage collection and fixed cell order remain possible
influences, with only two observations per cell.

The preparation note records a corrected task-board query expectation, an
unsupported experiment-only gzip option found by TypeScript, and the retained
sandbox `EPERM` browser failure followed by a successful normal escalation.
Before timing, source-provenance metadata also corrected the unchanged
row-array initial-state path to an empty changed-path list. Frozen draft
`094972d0` and the prior public-input/manifest captures are retained; comparison
confirmed every source CAR, signed entry and expected value remained unchanged
across that metadata correction. No timing was rerun after the frozen producer.
The final `npm run check` also passed after adding the report and statistics
generator.

## Remaining gates and minimal followups

| Gate | Smallest justified followup |
| --- | --- |
| Exact independent S0 disposition | Review the requirements, adopted A default, E1-K1 and actual whole-replay packet; decide whether the design scope is satisfied. No author declares S0 or E1 complete here. |
| Integrated native source/action/activation and authority | Land independently reviewed literal contracts and source-private capabilities before claiming ordinary native actions. Then measure genuine admitted repository/identity/grant histories, including authority and revocation. |
| Native whole-history shape and tail | Measure distinct total state, action count, actors/grants, retry retention and authority/control history. Hold byte shape and meaning constant where comparing algorithms. |
| Durable storage and warm restore | Measure actual atomic persistence, complete restoration, validated baseline plus tail, byte copying, indexed reads and browser/Node storage. An in-memory replay with no persistence adapter supplies none of these results. |
| Portable checkpoint trust modes | Measure accepted checkpoint publication, availability, certification versus full audit, transfer, verification and restore. Retain malformed, unavailable, forked and inconsistent content cases. |
| Application audit/query expansion | Introduce a journal audit, point query or page query only if a concrete application requires it; define captured frontier, order and completeness first. The existing outside-clock journal oracle supplies no query contract. |
| Effects comparison | First identify an application that exceeds the admitted contract or an observed operation requirement it cannot satisfy. Review bounded reads/writes, absence/uniqueness checks, budgets, logical schema, aggregate atomicity and exact failures before the smallest comparison prototype. |

A bounded domain state does not bound all work. Authority maps, grants,
revocation/recovery history, retry evidence, outcomes and total accepted history
have their own dimensions and retention obligations. A small domain fold cannot
remove scans, cloning or sorting of a growing native authority projection.
P3 indexing and accepted checkpoint/restore mechanisms can address those costs
without replacing application complete-state semantics.

The proposed disposition is therefore to keep A and its existing ecosystem
Lexicon validation, complete the explicitly tracked native and persistence
measurements, and leave effects conditional. It carries forward measured limits
and identified gates instead of inventing larger application requirements.
