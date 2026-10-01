---
date: 2026-10-01
status: implemented and validated; independent exact-head review pending
request: d91eddf6e423d166e41217313ff3681224ad4f86
promise: 5960abe2a95ec1374051ef675c373a324e20708c
baseline: 4b6ebab532d0ae1de5adbbe3326d70e0a80f0136
tested_runtime_source: fda7686355bd301cd9d59b243d906a09d2cc9216
tested_host_flow: 3405510088279517bde80828d45bb808faaad458
---

# Selective application reads under complete-state semantics

Queries now capture owned state, head and frontier without copying accumulated
outcomes. Routine host metadata and receipt reads also avoid full projections.
A receipt uses its verified recorded position to read one outcome and checks
the stored position and unsigned intent CID before returning it. The current
complete-state evaluator, schemas, semantic profiles and dependency graph are
unchanged.

This implements S1, the concurrent read improvement recommended by the
independent S0 assessment `a03c7402`. It does not select state effects or implement
native suffix synchronization or durable outcome indexes.

## What changed

[Folder](../src/application/folder.ts) exposes three additive reads:

- `status()` returns an owned head, interpretation frontier and optional stall,
  without state or outcomes.
- `outcomeAt(position, intentCid)` returns the same coherent metadata and one
  owned matching outcome. Unprocessed positions, mismatching intents and invalid
  positions return no outcome. The host continues to report pending for a
  verified receipt whose outcome is not yet available.
- `catchUpVerifiedStatus(history)` uses the same verified-history admission and
  queued advance logic as `catchUpVerified`, returning owned metadata instead
  of a full export. Routine host refresh uses this method, including empty
  deltas. Changing only the final host response would have left this discarded
  full projection copy in every refresh.

Query capture takes the active definition and owned state/head/frontier before
its first await. Concurrent catch-up or activation cannot relabel its result or
switch the query program/schema to another definition. Host describe likewise
captures progress and definition synchronously before awaiting serialization.

The original `snapshot()`, `catchUp()` and `catchUpVerified()` retain full owned
exports. Optional persistence still receives complete state and outcomes before
the interpreted state/frontier advances. Definition comparisons, replay audits,
archives and browser sync retain their explicit full-data paths.

## Bounded clone-work characterization

The shared case generates and verifies 1,000 distinct signed unknown-action
intents. Each records an ineffective outcome while state remains
`{"readings":[]}`. It intercepts actual `structuredClone` calls during each
operation and counts history-array rows, state copies and UTF-8 JSON bytes of
the arguments. Node, Chromium and the installed compiled package produce the
same [capture report](../experiments/post-spike-evidence/2026-10-01/selective-captures/clone-work.json).

| Operation | Clone calls | Serialized bytes presented for cloning | History-array rows copied | State copies |
| --- | ---: | ---: | ---: | ---: |
| Explicit full snapshot | 1 | 248,570 | 1,000 | 1 |
| Summary query | 1 | 461 | 0 | 1 |
| Status | 1 | 437 | 0 | 0 |
| One requested outcome | 1 | 527 | 0 | 0 |
| Empty-delta status catch-up | 2 | 709 | 0 | 0 |

The requested outcome does copy that one outcome object; the history-row column
counts outcome arrays rather than individual selected objects. Empty-delta
catch-up copies the verified head and returned status. These are payload/work
counts, not structured-clone heap allocation, latency or throughput estimates.
The unchanged full snapshot is the control for exactly the same interpreted
history. Its full array and state remain available and owned.

Routine status and outcome access no longer depend on history size through
cloning or scanning. Queries still copy their complete state and perform the
existing evaluation and schema checks. Verified catch-up still checks its
prefix and constructs the required suffix. Full verification, transport,
snapshots/exports, accumulated outcome storage and optional persistence retain
their existing costs; in particular, per-action full persistence can still copy
growing history quadratically. P2/P3 and the native E1 matrix own those separate
changes and measurements.

## Validation and retained evidence

At the runtime source head in the header, `npm run check` passes, including
formatting, layers and installed dependency integrity. The source distribution
build is exercised by the fresh package consumer. The following scoped checks
pass on Node 26.10.0 and Chromium 153.0.8010.12:

- [Shared runtime results](../experiments/post-spike-evidence/2026-10-01/selective-captures/runtime-results.json):
  70 cases agree in Node and a Chromium worker; 71 test-runner tests pass.
- [Real-PDS host flows](../experiments/post-spike-evidence/2026-10-01/selective-captures/host-flows-results.json):
  nine flow cases pass, including a guard that refuses full Folder exports during
  creation retry, describe, submit retry, receipt and query; 11 runner tests pass.
  Existing held-refresh and moving-floor races retain their assertions.
- [Fresh packed conformance](../experiments/post-spike-evidence/2026-10-01/selective-captures/package-conformance.json):
  157 compiled cases pass, including all three selective-read cases, plus the
  package's API/declaration/CLI/host consumer test.
- The initial broader runtime/projection/host-performance scope passed 78 tests
  at `d4111434`. It includes coherent file persistence/rebuilding and immutable
  history, retained heads, receipt reads during writes and confirmation races.
  Relevant runtime, host-flow and compiled checks were then rerun after changes.

New shared cases check owned metadata/outcomes, invalid and wrong-intent
positions, stalled persistence with pending observations, resumption, retained
full persistence contents, query ownership and old/new programs across
concurrent activation. The full original exports continue through existing
replay and projection checks.

The first host-flow run at `d4111434` failed an unchanged refresh-count assertion
because its second race probe still intercepted the old full catch-up method.
The probe now intercepts the host's additive metadata method. After that fix,
the frozen runtime source passed. Final evidence collection also corrected the
host report's expected case count from eight to nine for the added case; all
nine case bodies had already passed. The final host-flow head differs from the
runtime source only in that expected-count field.

[Validation manifest](../experiments/post-spike-evidence/2026-10-01/selective-captures/validation.json)
records source hashes, exact heads, artifact hashes, counts and raw logs,
including the initial failure. The retained build provenance lists the unchanged
log-v2, app-v2 and evaluator-v1 contract CIDs. Raw initial-failure output retains
four reporter blank lines containing spaces; they are the only full diff-check
warnings, and source/document/non-log checks pass. No full `npm test` suite, new
latency/throughput benchmark or native P2/P3 end-to-end matrix was run for S1.
The recommendation is to land this scoped read improvement after independent
exact-head review, while retaining complete-state semantics as the S0 default.
