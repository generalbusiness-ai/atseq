---
date: 2026-10-01
status: prepared for narrow whole-replay measurement; decision review pending
examined_at: c242ca20e823ea510e3939a8466a608f3ab860ba
request: 1c284142e7488e4242a77a67ec1cda349efd8151
promise: 98cc092fcd4b0c9522438fe68352fec188216fa2
parent_request: fe6f8e1263f22e6b3d81070d1f58f0e3cd819016
---

# Whole replay under the complete-state contract

Measure actual interpretation of a complete history before refining the S0
disposition. The [cap results](2026-10-01-atseq-complete-state-cap-results.md)
measured separate kernels, including one final append. Repeating that final
append does not measure history replay. This experiment starts a fresh current
`Folder` at frontier zero and interprets all distinct signed entries once.

The matrix has four existing workloads and histories of 100 and 1,000 actions.
One thousand is the admitted sample collection bound. One hundred compares a
short tail represented as a new seeded genesis with the longer history. Those
two points characterize scale; they are not targets, limits or a throughput
guarantee. Every final domain state is exactly 131,072 canonical JSON UTF-8
bytes. There is one actor, one writer and no activation or persistence adapter.

| Workload | Initial state at N=100 / N=1,000 | Actions and final state |
| --- | --- | --- |
| Retained experimental row-array cap fixture | 131,072 / 131,072 bytes; 1,000 rows | Existing `bounded` revision toggle; every action effective and complete state remains at cap. |
| Task-board completion | 130,172 / 122,073 bytes; 1,000 tasks with 900 / zero completed IDs | Complete every remaining task exactly once; finish with 1,000 completed IDs at cap. |
| Existing guitar selection extension | 131,066 / 131,066 bytes; 1,000 candidates, empty selection | Alternate selection of the first and last retained candidates; finish at cap with the last selected. |
| Ledger append | 126,022 / 48 bytes; 900 / zero entries | Append the remaining retained journal entries in order; finish with 1,000 entries and zero balance at cap. |

The task-board and ledger use the accepted cap source's unchanged schemas,
actions and queries. Guitar selection uses the already defined
[guitar evolution fixture](../testdata/apps/evolution.ts), which has a selection
action and query; the B0 guitar document has neither. It receives the accepted
cap candidates as data. Its summary contract differs from B0's monetary sum.
No new expression, action, schema or application query is introduced.

The sample definitions change only their initial-state files and have their own
source CIDs. The row-array definition's existing initial state already matches
the retained cap state, so its source and CID stay unchanged. Seeded state is an explicit new genesis input, not a checkpoint or
proof of preceding history. Task-board completion would exceed cap with all
the original title padding, so preparation shortens existing titles while
keeping each at least one character. Guitar removes enough title padding to
fit its selected field. The independently expected final states, derivative
source CARs, signed entries and source CIDs are retained in
[public inputs](../experiments/post-spike-evidence/2026-10-01/s0-replay/public-inputs.json.gz)
and [input manifest](../experiments/post-spike-evidence/2026-10-01/s0-replay/input-manifest.json).
Private signing keys are not retained.

The source fixture JSON is inherited without alteration from E1-K1, SHA-256
`bc0ead4ddb710a1a5c3cb5d1d3836d19a60b33360f8ca36d0138a37aac663b4d`.
Preparation validates both initial and final states under the existing schema.
Its expected task IDs, selected ID and ledger balances are calculated outside
the evaluator. After each whole replay an independent loop checks domain
uniqueness, references and journal sum. The ledger audit is a correctness oracle
outside timing, not a new application audit query or an audit latency result.

Source reconstruction, source/runtime admission, signature/history verification,
module loading, one ten-entry warmup per cell, final exported snapshot, existing
query and all expected-result checks run outside the timed span. The clock
includes actual `Folder.catchUpVerifiedStatus` across all N entries, its
framework outcome validation, entry/intent CID encoding, frontier advancement,
outcome retention and returned status. It excludes persistence, final full
projection copying, signing, transport, native repository evidence, authority
admission and checkpoint/restore. This is a historical protocol engine baseline
on the current source, not a native ATproto end-to-end measurement.

Use two samples per cell in Node and Chromium, sequentially, with every sample
retained. Sample ranges describe this machine and session. No percentile or
pristine-machine claim is supported. Existing correctness probes at N=100
passed all four workloads in Node 26.10.0 and Chromium 153.0.8010.12; their
incidental elapsed values are outside the coordinated measurement window.

## Preparation corrections and retained limits

The first prepared input metadata used `tasks` instead of the unchanged
task-board summary's `count`. That metadata was corrected before correctness
probes and inputs were regenerated; the original preparation inputs and
manifest remain under `initial-preparation-*`. They are superseded, not timed
inputs. The first browser launch failed at the sandbox's loopback listener with
`EPERM`; the raw failure and successful normally escalated probe are retained.
An initial TypeScript-only check caught an unsupported `mtime` option in the
experiment and missing built public declarations. The option was removed and
the ordinary build followed by `npm run check` passed. No production file,
dependency, profile or prior evidence capture changed.

Before the timed runs, a provenance audit found that the row-array metadata
incorrectly listed its already identical initial-state file as changed. That
list is corrected to empty without changing any source CAR, signed entry,
expected state or action. The prior metadata is retained under
`pre-sourcepath-correction-*`; only the corrected public-input packet is timed.

The next report will reconcile these measurements with the already adopted
complete-state default, V0 guard optimization, S1 selective reads and the
remaining native/durable/restore gates. It will require independent review
before any S0 completion claim. Effects remain conditional on a concrete
application requirement and a reviewed complete contract.
