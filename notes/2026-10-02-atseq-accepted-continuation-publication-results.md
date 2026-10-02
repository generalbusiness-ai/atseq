---
date: 2026-10-02
status: accepted source publication; independent exact-head publication review pending
examined_at: 65e7042a01184f4d755bf0a7853e92411e6dee9f
status_observed_at: 2026-10-02T04:53:12Z
request: 688aefa42d299063a67f157e0de0190970b17929
promise: 7436927d979521ef810a5f95972a7980b74bd8fb
---

# Accepted continuation designs and replay results

This delivery publishes four accepted source packets: observer clarification,
application ownership, incremental retry storage, and complete-state replay.
All 50 source files, including earlier retry notes and original measurement
captures, retain their exact reviewed bytes. The
[copy manifest](../experiments/post-spike-evidence/2026-10-02/accepted-continuation-publication/source-publication.json)
records each source revision, path, byte count and SHA-256 hash.

The cutoff is approved main `65e7042a`. It includes the reviewed P4-F2 outcome
DATA parser at `0df4aa12` and N1-F2 private source owner at `65e7042a`. Their
[pushed-main](https://github.com/generalbusiness-ai/atseq/actions/runs/36963207512)
[matrices](https://github.com/generalbusiness-ai/atseq/actions/runs/36964633615)
passed Node 22.19/24/26. These foundations are internal. They do not yet provide
supported native application operation, participant enrolment or trusted
checkpoint bootstrap.

Each event ID below uses the Gitseq prefix
`git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:`.
Frozen notes that say “proposal” or “review pending” describe their earlier
state. The decisions below record the later accepted dispositions; this report
does not rewrite their evidence or claim a new runtime result.

## Accepted design decisions

| Decision and exact source | Independent assessment | Adopted result |
| --- | --- | --- |
| [I1-D3 observer clarification](2026-10-01-atseq-native-observer-clarification.md), `17a2298064a156c178d43621cc24c3488022bc78` | `39d4c72cbf480d5b9961d7ae956752a7db8f11e3`, ratification `93d21c4580c15985542ac95ef7c4d351c43bfe58` | Adoption `bf9d182b73df7149f6e98af1808adcb09c4e4ded`. Stable explicit advance/recovery pointer mismatch takes precedence over absence/replacement. `getBlocks` CAR roots are selection metadata; complete body hashing and exact requested membership precede reconstruction under the authenticated original root. |
| [N1-D5 application ownership](2026-10-01-atseq-native-coordinator-ownership.md), `85f0033e8c5d0ae636d5cc952c11a56baf9cc3f7` | `de72b10f847a00b9aaf562f15b36078bff287dbf` | Adoption `9a79d89d8618d033a0d7d0ce0c0b8a288346413f`. One private application container owns source, state, authority and immutable outcome boundaries. Source-derived execution and exact fold-stage classification remain private. Persistence precedes exposure; an impossible post-persistence base failure poisons the instance pending reconciliation. |
| [Revised R1-D1 retry and prefix boundary](2026-10-02-atseq-retry-prefix-boundary.md), `66a05ce14bd92b4539f77e67f0e6fc6e0778f735` | `85661ed3a5756f46b812049adfa7a5a703f9ed54` | Adoption `fbb33b78ead782473c7442fc7109b313df0b307d`. One verified append-only prefix owns request/retry uniqueness. Compact live authority removes duplicate history arrays in the same migration. Missing interpretation evidence may stall behind verified ordering; stale extensions are rejected and staged again. |
| [S0 complete-state disposition](2026-10-01-atseq-s0-complete-state-disposition.md), `a9f222a2e022abde6fb013772bb23f57f10f277d` | `689f05503c0a69316619c8e942e1f59ac448960b`, ratification `13777aa0b066ae8b766f0a21030c40f482f95bfa` | Adoption `91b289d61b1e2674a4788f8bb8e48d88929ba7cf`. Keep option A: complete state, V0, S1 and checkpoints as the default. Keyed effects need a concrete requirement beyond the current state contract. This closes the S0 design/source disposition, including its parent design scope. |

The retry successor preserves the [original note](2026-10-01-atseq-retry-prefix-boundary.md)
and its 36 symbolic scenarios. The [revision report](2026-10-02-atseq-retry-prefix-boundary-revision-results.md)
records two clarified answers and 11 additional scenarios. None of the observer,
coordinator or retry decision vectors is an executed runtime test. Their 30,
53 and 47 current expectations are implementation acceptance requirements.

## Replay evidence and recommendation

S0 retains 32 actual whole-replay spans and 17,600 interpreted entries in Node
26.10 and Chromium 153: four workloads at N=100 and N=1,000, two samples per
cell and environment. Node and Chromium final references agree. The
[statistics](../experiments/post-spike-evidence/2026-10-01/s0-replay/statistics.json)
retain every sample; this publication checks them without rerunning timings.
At N=1,000, the observed whole-replay ranges are 14.16–24.70 seconds in Node
and 31.87–65.04 seconds in Chromium across these different workloads.

These are busy shared-host observations of historical supported-protocol
interpretation from frontier zero. They include complete-state interpretation,
entry/outcome work and returned status; source and signature verification,
preparation, final queries and correctness oracles are outside the clock.
They are not latency bounds, service targets, post-V0 10,000-action results,
native admission, durable replay or total bootstrap. The growing ledger starts
empty at N=1,000, so its lower total does not establish a cheaper at-cap fold.
Bounded state does not bound history, authority, retry or restoration costs.

S0-M1 completion `d07d0423264ec1a1299e7834e3478d05b2eb2a71` is ratified by
`393cea12f64d76318c402d5af44dda96412e3bf0`. Parent S0 completion
`88d393d6c9f000edc614973ab64ac651a02de1de` is ratified by
`3fdd63c3eb3baf76d89ba86f4a79093f74a12743`. These source/design completions
leave the E1 native, durable and bootstrap measurements open.

## Implementation work still open

I1-F2 observer orchestration and N1-F3 application integration are in progress.
The A1-F2 OAuth successor has completed actual validation and provenance
and awaits independent exact-head review; T1-H2's real PDS startup race correction still needs exact-head review and
landing. R1 runtime migration follows reviewed application integration because
both change the same authority ownership boundary. App-provisioning A2-D1 is
excluded from this delivery: its separately assessed packet still needs the
required temporary-key lifecycle addition before implementation.

The full I1, I2, N1, R1, P2, P3, P4, A1, A2, E1, T1, C1 and NW0 gates remain
open as applicable. They include native source/execution integration, real
provider enrolment, conditional app publication, incremental reads and retained
receipts, coherent materialization, checkpoint certification, independent
replay and provenance-bound restoration. The
[programme](2026-10-01-atseq-implementation-programme.md) and
[plan-review gap map](2026-10-01-atseq-plan-review-gaps.md) provide the larger
context; Gitseq remains the current task ledger.

The preferred authority remains: the app PDS holding the repository signing
key can construct another ordering. It can also delete or withhold records;
it cannot forge device signatures. This publication adds no independent
currentness, non-equivocation or trust to retained data.

## Publication checks and limits

The [verification script](../experiments/post-spike-evidence/2026-10-02/accepted-continuation-publication/verify-publication.py)
and [validation capture](../experiments/post-spike-evidence/2026-10-02/accepted-continuation-publication/validation.json)
check all 50 exact source copies, frozen packet hashes, exact Git source pins,
retained maintained-source hashes and excerpts, scenario counts, predecessor
preservation, S0 public input and every retained timing range/reference. Local
note links resolve. Only new notes and experiment paths are changed. Runtime,
packages, locks, integrity approvals, profiles, registries, public exports and
prior evidence remain byte-identical to the cutoff.

The four published S0 JavaScript/TypeScript experiment files pass the normal
Prettier check. Existing `notes/` and retained-evidence exclusions cover their
immutable source packets; no new formatting exception is needed. Git whitespace
checking reports one original trailing space in the retained Vite build capture,
`s0-replay/build.log:5`; that historical capture remains byte-exact. The
[whitespace capture](../experiments/post-spike-evidence/2026-10-02/accepted-continuation-publication/whitespace-check.log)
records the sole diagnostic. No build,
install, service suite, provider trial or new performance experiment is run by
this publication. Its exact head requires independent `atseq-reviewer` review
before merge and push.
