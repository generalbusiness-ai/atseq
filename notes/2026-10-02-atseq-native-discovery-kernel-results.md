# Native discovery kernel results and recommendations

Date: 2026-10-02. Frozen implementation/test producer: `7234f492089a993588d78472e3399abcc24bcc15`. These are actual retained execution results for the private C1 kernel, pending independent exact-head review.

The frozen original 58 portable application cases and 24 actual callsite fault probes passed before and after the change on Node 22.19.0, 24.21.0 and 26.10.0 and actual Chrome 153.0.8010.12. All 58 cases also passed against actual emitted production modules on each Node version. The unchanged decoded R1 application fixture is 8,371,247 bytes, SHA-256 `f7c6d9c3740208973de828da976107b32a6107ad3c62085412476fdbb2e874e6`; runs use `ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH`. Expectations were not regenerated through the refactored application. Original N1-F3 predicates remain the oracle; their existing R1 schema adaptation is inherited.

The new matrix passed 31 genuine component records, six separately transformed callsite probes, and six workload rows (one or 32 grants at 100, 1,000 and 10,000 actions). Node source, actual emitted Node production modules and Chrome produced byte-identical component results and workload semantic/counter records. Four source/browser runs agreed on the transformed probes. Those probes are not compiled production evidence. The checkpoint codec, shared wire codec, schema validator, profiles, package files and supported exports are unchanged. Eighty-three existing runtime/native tests and the final repository check also passed.

The 31 genuine records plus six probes cover 36 unique kernel vector identities because K5-03 occurs in both. Foundation parity, cross-runtime byte agreement and workload characterization provide evidence for three further identities. FULL-03 remains open. K3-05's maximum-safe branch is test-only, and K1-06 is a genuine prefix accessor check rather than a coordinator root-only ingestion test. Thus this report does not claim all 40 vectors were genuinely executed or that full C1 is complete.

## What the workloads show

Each workload uses real signed requests, principal/device grants, app repository CARs, authenticated MSTs and actual accepted native prefix processing. The expected counter/version/frontier is constructed independently of discovery. Unique 16-byte counter nonces avoid retry aliases. CAR construction retains reachable original MST nodes and record blocks, rather than writer transient nodes; the signed root is unchanged and normal tree verification runs before acceptance.

The final Node 26 source sample below ran concurrently with Node 22 and 24. It characterizes this machine and fixture, not a performance target. Bootstrap at 1,000 and 10,000 rows processes the suffix after the prior cut. Other runtimes, full timing/heap readings and proof sizes are retained in the [performance summary](../experiments/post-spike-evidence/2026-10-02/native-discovery-kernel-implementation/performance-summary.json).

| Grants | Actions | Cold row visits | Warm row visits | Candidate visits | Cold/warm discovery at 10k | 1k→10k replay |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 100 / 1,000 / 10,000 | 19 at each cut | 7 at each cut | 2 at each cut | 0.47 / 0.14 ms | See retained measurements |
| 32 | 100 / 1,000 / 10,000 | 205 at each cut | 100 at each cut | 64 at each cut | 1.00 / 0.37 ms | 45.74 s |

Selection reads no history, outcomes or transport. History length does not increase its measured row work in these fixtures. Grant count does: subject preparation is linear in all current authority rows, then selection is bounded by actions times that subject's admitted candidates and scopes (at most 63). Cold commitments additionally traverse current authority and encode state/compact authority; warm reads reuse their immutable pair but pay their own copies. Owner byte charges are conservative bounds, actual fold counters are separate, and dependency allocations are unmeasured.

The workload's concurrent reads begin after the warm memo. Separately transformed K5-02/K5-03 probes force genuine readers to overlap one pending pair, test withholding until both hashes finish, failure rejection/deletion and later explicit recovery. This separation avoids presenting warmed concurrency timings as cold pending measurements.

Final 10k CARs are 10,546,485 and 11,177,983 bytes for one and 32 grants. Direct genesis-to-head cold opens have 10,001 and 10,032 ordered entries and exceed the unchanged 10,000-entry prefix delta bound. Their actual `content_unavailable` refusals are retained. Processing cuts 100→1,000→10,000 succeeds with that bound unchanged. Current discovery does not solve replay bootstrap; P3/P4 materialization and checkpoint audit work remains necessary. No arbitrary performance or capacity target was added.

Heap data is actual Node process heap-used or Chrome `performance.memory` before/after a phase. Garbage collection is not forced, retained owners and fixtures affect it, and peak heap is unmeasured. Conservative 16 MiB ledger accounting must not be presented as a 16 MiB heap guarantee.

## Recommendations and retained failures

Keep the simple current-authority scan and generation memo. These results give no evidence that a second grant index, history-position scan or tree is warranted. Reconsider an index only against representative action/grant/authority/state distributions with an explicit maintenance and ownership cost. Use the pending checkpoint/materialization route to reduce replay cost while preserving its origin and exact-target audit rules.

Next, implement the reviewed typed native service document and real host/CLI/browser/agent routes under FULL-03's tracked request. Preserve the distinction between public subject inspection, authenticated submission and anonymous preview; a preflight result gives no lease. Test stale subject/application callbacks and actual host TOCTOU ordering through those routes. P3 hooks may evolve in their own worktree after this four-path handoff; this delivery stays frozen.

Original failed construction attempts are retained rather than overwritten: an old nonce helper wrapped at 256 and caused a real duplicate retry; unpruned writer CARs exceeded the existing 32 MiB proof cap; the corrected producer retained only the genuine reachable tree closure. Failed type checks, a patch context mismatch, a stripped-TypeScript runner error, a short Git-ID ambiguity, an OS file-descriptor process-creation error, and a report-inspection KeyError are listed in [failures.json](../experiments/post-spike-evidence/2026-10-02/native-discovery-kernel-implementation/failures.json). No approval prompt, escalation or automatic approval rejection occurred. Full captures, original source vectors, source/build pins, actual emitted module inventories and the packet checker are retained in the evidence directory.
