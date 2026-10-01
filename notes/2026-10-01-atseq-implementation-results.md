---
date: 2026-10-01
status: initial evidence; full implementation open
examined_at: 824527132a6cfc6099d57685d37320e37f99ee4e
request: 1c3db0c1
---

# Implementation results: first evidence and recommendations

The [programme](2026-10-01-atseq-implementation-programme.md) has started. This
report covers the initial native proof probe and benchmark-only stage harness;
it does not report native Atseq ordering or identity/checkpoints as implemented.
Runtime source, semantic contracts and dependency pins are unchanged.

## Later results

This is the initial evidence snapshot. The [native proof foundation](2026-10-01-atseq-native-proof-results.md) and [performance baseline](2026-10-01-atseq-performance-baseline-results.md) have since been independently reviewed and landed. Their reports supersede the initial probes for present recommendations and cover the previously missing large-tree, 10,000-action, growing-state and browser cases. Native ordering, account admission, materialization and checkpoints remain implementation work; see the [current programme](2026-10-01-atseq-implementation-programme.md).

## Native proof results

The isolated probe uses official PDS 0.5.31 with the local official mock PLC,
`@atcute/repo` 1.1.0 and `@atcute/mst` 1.1.1. All nine checks passed:

- Native record membership agrees with the created CID and public record bytes,
  using the current key obtained from the mock PLC document.
- Wrong DID, path and key are rejected.
- Truncated CAR and a damaged referenced block are rejected.
- Full native CAR iteration agrees with the sparse proof.
- A native `getRepo(since)` diff proves the new entry and head under one root.
- Browser production compilation succeeds without Node imports in output.

The proof is 566 bytes in this single-record fixture. The compiled browser
library is 37,632 JavaScript bytes, uncompressed, for this bundling configuration.
Neither is a general proof/bundle size prediction. Browser execution and live
provider currentness were not tested. Public [raw results](../experiments/post-spike-evidence/2026-10-01/native-proof-results.json)
and [proof CAR](../experiments/post-spike-evidence/2026-10-01/native-proof.car)
and the [916-byte native diff CAR](../experiments/post-spike-evidence/2026-10-01/native-diff.car)
are retained; the [probe](../experiments/native-authority-probe.mjs) reproduces them.

Recommendation: proceed with the preferred native authority backbone and evaluate
these maintained primitives first, following independent assessments `4f823d99` and `9136c7bb`. P1 must index
and authenticate a root once, enforce mandatory DID/key/root/path checks and
untrusted-input bounds, normalize legacy keys through maintained code and keep
sparse membership distinct from whole-tree validation. The convenience record
verifier is not the complete runtime trust boundary.

## Measured stage baseline

The new [harness](../scripts/performance-stages.ts) uses unchanged v1 verification
and interpretation, with in-memory signed fixtures. This capture has three ordered
samples per case, N=100 and 1,000, one or sixteen actors, bounded state or a growing
integer-array state. Source, public signed fixture and harness hashes are retained
with the captures; private keys are never written. Samples ran after the initial
smoke run and other benchmark/test processes finished. No claim is made that the
entire computer had no unrelated workload.

Median elapsed milliseconds from the [raw capture](../experiments/post-spike-evidence/2026-10-01/performance-stages.json):

| State   | Actors |     N | Full verification | Interpretation of verified history | State bytes |
| ------- | -----: | ----: | ----------------: | ---------------------------------: | ----------: |
| Bounded |      1 |   100 |             68.98 |                              16.78 |          34 |
| Bounded |      1 | 1,000 |            637.22 |                             147.01 |          35 |
| Bounded |     16 |   100 |             59.78 |                              14.01 |          34 |
| Bounded |     16 | 1,000 |            597.09 |                             138.12 |          35 |
| Growing |      1 |   100 |             60.04 |                              32.18 |         325 |
| Growing |      1 | 1,000 |            598.65 |                           1,909.78 |       3,927 |
| Growing |     16 |   100 |             60.20 |                              32.07 |         325 |
| Growing |     16 | 1,000 |            608.08 |                           1,925.23 |       3,927 |

Every case reached its expected frontier/state with no stall. This is not the
full delta/cache equivalence matrix. Each verification performed 2N WebCrypto
signature checks, 4N key imports and 2N key exports. These are observed call
counts, not inferred from elapsed time. WebCrypto digest calls were zero because
the CID implementation uses a different hash path; zero does not mean no hashing.
The observation wrapper restores original methods even after an error, refuses
nested measurement scopes and has a focused correctness test.

The bounded cases show that there is substantial work outside the signature
operation itself. The growing fixture's interpretation is much more expensive
than the bounded fixture at the same history length, even at only 3,927 state
bytes. This supports measuring the complete-state/effects question concurrently;
it does not yet attribute the difference to validation, evaluation, serialization
or copying individually, and does not select an effects contract.

Recommendation: remove repeated key imports where valid, make native root/proof
verification reusable, and retain the growing-state fixture in later tests. Then
separate fold, schema validation, encoding and copying before deciding the state
model. Native ordering can reduce ordering signatures but cannot remove growing
state costs. No result implies a required latency target or that sixteen actors
are inherently faster than one.

## Measurement limits and next work

The observer adds overhead and summed operation durations can overlap during
concurrency. Explicit entry-CID traversal is separately measured; it is not an
internal breakdown of `verifyHistory`. Interpretation timing combines fold,
validation, per-entry identity work and final snapshot copying. Memory is sampled
at boundaries, not a measured peak. Three samples on one machine describe this
capture, not general capacity.

The harness defaults to N=100/1,000/10,000 and three samples but this initial
retained stage capture stops at 1,000. P0/E1 still owe 10,000-entry stage captures,
HTTP/bytes and browser transfer attribution, deltas, activations/source failures,
network/corruption cases, counters/index comparisons and optimization results.
No native versus separate-authority timing comparison was run.

The existing real-PDS performance script was also run successfully to 10,000 and
reproduced the previous cost shape (roughly 7.5 seconds full verification and 6.2
seconds one-entry catch-up). That exploratory run overlapped other local tests/
smoke measurements, so it is not used as the authoritative stage comparison and
needs an isolated recapture for P0. This report does not disguise that limitation.

The first clean baseline build and existing tests passed (351 tests). The new
focused observer test passed. Current delivery check/test commands and independent
exact-head review are reported in the workroom artifact; do not interpret the
historical baseline count as the final changed-head test count.

Exact public stage fixture bytes are retained in gitseq assertion `1fa0ddc4` as
a compressed attachment alongside the raw captures. That evidence does not
contain private keys or credentials. The nine-case native probe only has three
records; its diff includes all relevant MST nodes. It validates the mechanism,
not yet partial-diff sufficiency over an existing large tree. P1 owns that test.
