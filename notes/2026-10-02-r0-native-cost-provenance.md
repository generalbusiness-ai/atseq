# Native-cost measurement provenance clarification — 2026-10-02

This note supplements the [native checkpoint cost report](2026-10-02-r0-native-checkpoint-costs.md) and frozen delivery `91fa28f54238ce6fff0e9a18de4b720297f1980d`, under R0-F1 request `4aa51255618f47d4bd798025ad2fc0c8569ad5df` and promise `c114f72e8c5fa5147a131940b20dbb2d591c3f1d`. It corrects the provenance inventory and wording. It does not change any measured source, fixture, capture, outcome, original manifest or frozen head. The original 84 captures were not rerun.

All 36 Node compiled probes, running on Node 22, 24 and 26, loaded the common main executable tree left by the final Node 26 build. The build driver first ran the three builds in order, then transpiled the experiment wrapper, then began probing. A probe's Node version identifies its runtime; it does not mean that it selected the output of that version's earlier build. The same probes used the separately frozen R1 executable tree, also built on Node 26. The 36 Node source probes used their selected runtime and source imports. Chromium used its 12 separately retained Vite bundles.

The three main build records still establish build conformance. Their source, executable and semantic-contract hashes agree. Only shell provenance and its manifest differ, because they contain the builder's Node version. The [inventory correction](../experiments/post-spike-evidence/r0-native-f1/provenance-correction/inventory-correction.json) records the common Node 26 main/R1 build records and exact output hashes. `experiments/r0-native/matrix.mjs:70–91` and `node-run.mjs:19–39` show the build order and compiled import selection.

The original generator inventory omitted an actively used input: `testdata/native-source/source-identity-vectors.json`. `tests/support/native-application-fixture.ts` imports it at line 2 and reads the first source vector in `applicationSource()`. Its exact immutable bytes are identical in both recorded generator commits, `e4f00b351651ef40b0da2937c545a16348e328e1` and `812f6e3453e872be22759890c78928d7e7f185d2`, and in the current tree:

- Size: 38,747 bytes.
- Git blob: `bd0895b8d45aaafb10b4d51d524ed443aa0e8fa8`.
- SHA-256: `1dc718d65cf44e80bb6df32ec8b2fc0c79adf0f105638ec59adfbd3fa67f5135`.

[Exact producer bytes](../experiments/post-spike-evidence/r0-native-f1/provenance-correction/source-identity-vectors.producer.json) and both immutable Git references are retained. This is an additive inventory correction, not a claim that the original preparation log recorded the missing digest.

The historical experiment compile recipe imports the public `ts` export from `ts-morph`. Its original pins record the two wrapper source hashes. They do not record compiler runtime details or execution-time wrapper output hashes. The production build compiler recorded in the build provenance is TypeScript 7.0.2; it must not be conflated with the experiment wrapper transpiler.

The new [post-freeze wrapper reproduction](../experiments/post-spike-evidence/r0-native-f1/provenance-correction/wrapper-recompilation.json) observes TypeScript 5.9.2 through `ts-morph` 27.0.2 and `@ts-morph/common` 0.28.1, and records current compiler file hashes. Two independent in-memory compilations produce identical bytes, preserving the original absolute import URLs. Those bytes also match the current physical wrappers in the measured worktree:

| Wrapper | Bytes | Post-freeze SHA-256 |
| --- | ---: | --- |
| `probe.js` | 28,167 | `afcb4958b325f085bf58bfebaace878a2f92b2e48638d81b82e1c395aef05870` |
| `unsupported-counters.js` | 6,005 | `1bd815f37b4863c4305f1029e59fb3e07b8d4bb16495c3d33b8fa2e48061a981` |

These are present reproducibility and physical-byte observations made after freezing the measurement. Historical wrapper execution-output hashes remain unrecorded. Matching current files cannot create a contemporaneous capture retrospectively. The reproducer writes only new correction files; it does not overwrite the original wrappers or execute another benchmark.

The first inventory checker contained a transcription error in the expected digest: it omitted the leading `1`. Its failed script and raw log are retained separately. Exact immutable producer bytes and their Git blob matched throughout; the corrected checker passes. This was a metadata checker error, not a fixture or runtime mismatch.

The correction leaves all performance and trust boundaries unchanged: single cold captures, current default refusals, raw storage rather than atomic accepted restore, and the open P3/P4/public receipt-proof integration gates. Independent exact-head review remains required before adoption.
