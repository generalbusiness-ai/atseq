# Frozen research evidence and typechecking — 2026-10-02

T1-H4 fixes the compiler scope that caused [Linux CI run 36979205325](https://github.com/generalbusiness-ai/atseq/actions/runs/36979205325) to fail after the F6 research publication. The only configuration change adds `experiments/post-spike-evidence` to `tsconfig.json`'s exclusion list. The existing live-source include patterns and all compiler options remain unchanged.

Request `fdcfdb639510167320eb73fdecc57d8ccd26ee36`, promise `96e6495d2cf697159362f1ceab56f22834d54f22`; basis main `7de9dcd447658679f3a94866c7f0eb5506c63659`; frozen configuration source `f7a22dcb57db0598d9d7e8d80dc2f64075221b8a`. Independent exact-head review remains required before landing, followed by the actual Linux CI matrix.

The `experiments/**/*.ts` glob selected seven retained excerpts from the [official ATproto repository](https://github.com/bluesky-social/atproto/tree/3cd9fa6013efad3ab57704ae804952be097e5d26). Those excerpts retain their original imports and need their upstream repository context. This produced missing-module and related diagnostics in Atseq's compiler. The evidence subtree was already excluded from formatting. Its byte-exact research copies remain intact.

An isolated checkout with independent physical dependencies completed a production build before the control typecheck. The Node 26 control failed with all 74 diagnostics from the saved Linux Node 26 failure, matching exactly after removal of CI prefixes. The fixed typecheck passed. Actual compiler input lists give the following comparison:

| Input scope | Before | After |
| --- | --- | --- |
| Live `src` inputs | 116 | 116 |
| Live `scripts` inputs | 20 | 20 |
| Live `tests` inputs | 114 | 114 |
| Live `experiments` inputs | 19 | 19 |
| Frozen official TypeScript excerpts | 7 | 0 |
| Total compiler inputs, including declarations | 1,278 | 1,216 |

Every one of the 269 live inputs is unchanged, and no compiler input was added. In addition to the seven excerpts, 55 `node_modules` declaration files reachable through those excerpts leave the compiler program. These are declaration reachability changes; no installed dependency or live source file was removed. The fixed compiler file list is identical under Node 22.19.0, 24.21.0 and 26.10.0. `npm run check` passes under all three versions, and the production build passes.

The [evidence manifest](../experiments/post-spike-evidence/2026-10-02/research-evidence-typecheck/manifest.json) pins the failed CI log, control and fixed compiler lists, diagnostic comparison, source and build attribution, per-runtime checks, and seven official source hashes and citations. All 811 existing frozen evidence files were compared by byte count and SHA-256 and remain unchanged. The F6 publication checker also passes against this checkout's physical 194-package runtime graph, preserving its frozen producer, delivery, research and synthetic-experiment attribution. Its historical claims and unexecuted acceptance vectors retain their original scope.

This task changes compiler configuration and adds its own dated results and evidence. Production code, tests, package metadata, dependencies, exports, workflow and existing evidence are unchanged. A repeated ordinary local full suite adds little evidence for this configuration-only change; the actual Linux matrix will run the repository checks and full suite after reviewed landing. The separate R1 native-prefix candidate and prior-I2 review baseline were preserved.
