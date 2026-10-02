---
date: 2026-10-02
status: actual small integration passed; independent review and full E1 open
request: 443018dc14130da954873a507b7a0ba503706379
promise: a5380c898ad8a6e425e74c27a3aafdf1baadaee3
parent_request: 8eec1d657cdffa2edaeafb28294797c56e605dfc
parent_promise: 621d4cea355cd3249d39b9184b981af61ae70f83
basis: 316439928e0c0d41965b086f2dace19a9249dba7
previous_fixture_delivery: 2395c470283111e4817dde1342e973edd5e4e419
previous_h4_delivery: 7b7093fb58f1dcbc794a67ad4de4c9f18901067f
experiment_source: c0f8c377b11e18c3f168076612978a309db54ae2
integration_source: 684d3df8ebaf283fd951bb2b7b2d614eccd88a6b
---

# E1 fixture integration with the merged native prefix

The retained E1 fixtures work with the merged R1 implementation. Normal checks and the original four source conformance tests pass on Node 22.19, 24.21 and 26.10. A new test-only helper validates the same two small fixtures through actual production `dist` modules on all three versions. Actual compiled Chromium validates those same bytes and agrees with every Node result. No original experiment assertion, fixture or independent oracle needed to change.

This is E1-F1 integration against exact main `316439928e0c0d41965b086f2dace19a9249dba7`. It does not complete the full E1 performance, persistence, host, checkpoint or audit work. [The packet manifest](../experiments/post-spike-evidence/2026-10-02/e1-fixture-r1-integration/manifest.json) records actual commands, source/runtime/build pins and new captures. Old measurements and failed attempts retain their original attribution.

## What changed

The seven experiment/test files are byte-identical to frozen H4 successor `7b7093fb58f1dcbc794a67ad4de4c9f18901067f`; their source-only cherry-pick is `c0f8c377b11e18c3f168076612978a309db54ae2`. The original six signed fixtures, their deterministic ordinary TypeScript workload oracles, all 61 original captures, both previous reports and the H4 packet are copied unchanged. No 1k/10k fixture generation ran again. The original `r1-check.ts` remains pinned to historical R1 `5bb836a0522bd075cff513d4aaf4766bcbea5b97` and was not rerun or relabeled as a new current-main measurement.

The only new executable experiment file is [compiled-conformance.mjs](../experiments/e1-native/compiled-conformance.mjs). Following the repository's existing compiled conformance pattern, it transpiles test-only modules and resolves every production import to actual `dist` output. It retains exact original test-source hashes, executed transformed module bytes and hashes, and the actual production module hashes. It requires the retained fixture directory and does not generate its replay fixtures. It checks genuine signed roots/records, independent per-position state and outcomes, source/grant/frontier/query facts, fresh replay equality, hand-calculated final states 540/666, and rejection of a tampered expected state.

The original fourth source test still creates a throwaway N=100 fixture to check that workload capture happens before asynchronous key generation. That is a generator ownership test, not regeneration of the six frozen fixtures or an application-derived oracle. No original expectation was recomputed from `NativeApplication` output.

The current production and helper changes come entirely from reviewed main R1. Relative to the old fixture producer, 12 previous source pins differ: five production files, six existing tests/helpers and the reviewed H4 compiler configuration. Build source attribution changes six old inputs and adds `src/application/native-prefix.ts`: 145 current inputs versus 144 previously. The new build has 468 pinned output files: 16 older outputs differ, four prefix outputs are added, and none are removed. These differences required real integration checks; the prior H4 proof of identical 464 outputs did not establish current R1 interoperability.

## Actual checks and results

| Gate | Node 22.19.0 | Node 24.21.0 | Node 26.10.0 |
| --- | --- | --- | --- |
| Normal `npm run check` | Passed | Passed | Passed |
| Original source fixture tests | 4 passed | 4 passed | 4 passed |
| Actual production-output fixture conformance | 2 retained fixtures passed | 2 retained fixtures passed | 2 retained fixtures passed |
| Normal compiler input list | Passed | Passed | Passed |

Normal checks include TypeScript, formatting, layer boundaries and installed dependency verification. No temporary compiler exclusion was used. All seven original E1 TypeScript inputs remain present. The compiler lists agree across versions: 1,230 total inputs, including 283 live `src/scripts/tests/experiments` inputs. The new `.mjs` compiled helper is covered by formatting and captured separately; it is not miscounted as an eighth TypeScript input.

A fresh actual build on Node 26.10.0 passed and verified installed runtime closure. The dependency roots are independent physical copies, not root-worktree symlinks. The packet checks all 194 runtime packages and 14,234 actual file hashes against the retained graph. No dependency, production, export, schema, profile or cap was edited.

Chromium 153.0.8010.12 passed its actual browser test against the same two retained signed fixtures. Its executed Vite bundle is 1,497,290 bytes, SHA-256 `6ef60ec086b9ddf0868bcea602b64ba05f8155feb1af87f90b555f36ecef38d8`, and is retained separately. The Node production gate captures seven transpiled test/helper modules and 13 direct production imports; the full 468-file build inventory also covers their production dependencies. The browser gate is a real compiled source bundle, not a Node substitute or a claim that it loaded the Node `dist` module files.

All three Node source runs, all three actual production-output runs and Chromium agree on these **new current-R1 snapshot digests**:

- Bounded single actor: `d40deb2cf0640d3e4fa7bb00ded9d65a46f7723211a11b154e9d36bf30c608fb`.
- Growing state, 16 actors, activation and ineffective action: `cd843d8e93738edd75ce956e34129a06bb5ea0a4b802a5b7aec4dda253369a6e`.

The old `f196f3a2…` and `ff59bc68…` digests remain in the original captures. They describe the earlier snapshot representation. R1 removed authority identity arrays and added a genuine verified-publication view, so the aggregate snapshot bytes differ while the independent state, effective/ineffective outcomes, active source, grants, interpreted frontier, queries and fresh replay predicates continue to pass. New agreement is measured; old equality is not fabricated.

The first normal-check attempt ran before this fresh worktree had a build. It failed with two `#atseq-integrity` type-resolution diagnostics because the package's default type path points to built output. The exact log is retained. Building the existing package resolved the setup requirement without changing source or compiler configuration, and all three subsequent normal checks passed. The first packet-verifier draft then refused the already successful check logs because I used incorrect layer/dependency success-message literals. Its attempted bytes, traceback and metadata are retained under `attempts/`; correcting those literals changes packet validation only. No runtime gate needed to repeat. The existing build's large-chunk notice is retained; it did not fail the build. Earlier original normal-check failures and temporary-H4 captures remain unchanged and are not reinterpreted as current successes.

## Limits and recommendation

The retained fixture bytes, actual cryptographic/root proofs and semantic oracle predicates are suitable inputs for subsequent joined E1 measurements. These checks establish small current-main interoperability. They do not measure reader performance or provide a speedup, throughput, latency, peak-memory or linear-runtime claim. Captured subprocess durations describe gate execution only. Old preparation counters printed by the source tests remain old fixture metadata, outside any reader timing.

The complete full E1 work remains open: cold/warm/restart/checkpoint/audit measurements at requested sizes/deltas, actual provider/native host integration, real SQLite/IndexedDB materialization and restore/CAS/uncertain-commit behavior, independent fixed-target genesis audit, network-denied credential-free offline trials, resource/recovery results and circumstance-based recommendations. The generic raw storage change limit remains 1,000; the proposed native cold installation limit of 100,000 changes does not prove that 1k actions fit one transaction or that every 10k native workload fits storage. No arbitrary target, quota expansion or spike compatibility requirement was added.

The packet's verifier checks current exact source/build/dependency/capture hashes, preserved predecessor bytes, runtime agreement, all original compiler inputs and the delivery path list. It also rejects changed sources/captures, fabricated cross-runtime agreement, a removed compiler input, relabeled historical producer or false full-E1 completion. These are packet checks, not substitutes for runtime tests. Required exact-head independent review remains with atseq-reviewer through root's gitseq process before merge/push. This worker made no main, workroom or push mutation.
