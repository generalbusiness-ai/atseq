---
date: 2026-10-02
status: R1-F2 candidate; independent review pending
request: ef61efd8e8531623f0313ada9b66208130e773f1
promise: edaedca8cf15d9450862c998b5da7bd061ebe44c
baseline: 316439928e0c0d41965b086f2dace19a9249dba7
test_source: c9f6734e465c076bb25c9393f0a8942c64994a70
review_basis: 2afbd00114ae51317b9590fc40eb25ce25e9acfd
---

# Cold admission limit and the consumed floor check

R1-F2 addresses two nonblocking observations from the independent R1-F1 review.
It adds a direct missing-descriptor regression and records the existing cold
admission limit. Production code, limits, dependencies, schema, profiles and
exports are unchanged. The approved R1-F1 report and captures stay unchanged.

Both cold admission and warm extension default to `maximumDelta = 10_000`.
The limit counts **all ordered entries**, including participant admissions,
source activations and domain actions. Genesis itself is the position-zero
anchor; it is not one of those entries. A warm extension counts selected head
position minus the retained head position. `openNativePrefix` stages from zero,
so a process restart at a head above 10,000 ordered entries is unavailable under
the default: `content_unavailable`, "Native prefix suffix exceeds local delta
budget". The caller can explicitly supply a different delta limit, or a future
checked trusted-local restore route can avoid cold admission from zero. This
follow-up selects no different limit and implements no restore. Raw SQLite/IndexedDB bytes
and the current persistence callback are not checked restore.

Keep this explicit limit while P2 characterizes cold admission and P3 implements
restore. A workload described as 10,000 domain actions can already be above
10,000 ordered entries once its admissions and activations are included. No
10,000-entry fit, latency, memory or restart benchmark was run here, and this
note raises no quota or default. The existing cold/warm source predicate is
pinned in the [source inspection](../experiments/post-spike-evidence/2026-10-02/native-floor-history-r1-f2/source-inspection.json).

The regression creates an actual one-entry full-history export through the
existing `AuthorityHarness`: signed synthetic app/account repositories, retained
PLC method evidence, real CAR/MST/signature admission, a genuine native prefix,
grant admission and `nativeAuthorityHistory`'s live prefix/authority join. It
first checks that the complete export parses unchanged and retains the principal
floor descriptor. It then removes **only that descriptor** from the exported
consumed inventory. `readNativeAuthoritySnapshot` must reject with code
`envelope` and the exact message "Floor descriptor was not consumed". It also
checks that parsing did not mutate the original export and that compact DATA
acceptance remains unchanged. Compact DATA deliberately has no historical
identity arrays; the negative uses the full reader rather than imposing a
historical-inventory requirement on the compact parser.

| Run | Actual result |
| --- | --- |
| Node 22.19.0, 24.21.0 and 26.10.0 source | Three top-level tests passed on each runtime: the four-check floor regression, existing authority test and existing 91-case checkpoint DATA corpus. |
| Actual emitted production, all three runtimes | Four floor checks passed using newly produced genuine history joins through real `dist/src` modules. The existing 54-case authority corpus also passed on each runtime. Only test modules were transpiled by the driver; production modules were loaded from the actual build. |
| Actual Chromium 153.0.8010.12, Node 26.10.0 driver | Three browser tests passed: four floor checks, existing 54-case authority corpus, and existing 91-case checkpoint DATA corpus. The floor browser checks use the exact Node-produced genuine export; they do not claim independent browser repository admission or restore. |
| Build and project check | `npm run build` and `npm run check` passed on Node 26.10.0; formatting, TypeScript, source layers and installed dependency closure passed. |

The build used TypeScript 7.0.2 on Node 26.10.0. Production source is the exact
merged baseline `316439928e0c0d41965b086f2dace19a9249dba7`; test source is
`c9f6734e465c076bb25c9393f0a8942c64994a70`. The browser run preceded its
driver-only formatting commit; all browser-used source bytes are unchanged.
The [closed manifest](../experiments/post-spike-evidence/2026-10-02/native-floor-history-r1-f2/manifest.json)
retains raw logs, exact exported fixtures, browser bundle, build provenance,
actual forced dependency-file inventory and source pins. Large captures use
lossless deterministic gzip; the checker also verifies uncompressed hashes.
The installation has its own physical dependency tree; no shared tree was
modified. Actual forced checks covered 194 runtime packages. These are execution
attribution records, not accepted restore provenance or an approved build pair.

Earlier attempts remain under `draft-attempts`. A pre-build typecheck recorded
missing local build/PDS dependencies and a new test's environment-variable type
error; setup and the type declaration corrected those before the final runs.
The first project check found driver formatting, then the final check passed.
The first parallel version probe was read in the wrong output order, so two
initial directory names mislabeled Node 24.13.0 and Node 22.19.0; their captured
`process.version` values remain truthful. Those complete attempts are preserved,
and the final matrix was rerun with explicitly verified Node 22.19.0/24.21.0/
26.10.0 paths. Precommit draft logs are retained as attempts, not represented as
an exact final-source experiment.

Reproduce the focused source test after installing the unchanged lock:

```sh
node scripts/source-run.mjs --test tests/native-authority-floor.test.ts
npm run build
node experiments/native-authority-floor/compiled-conformance.mjs
node scripts/source-run.mjs --test tests/native-authority-floor-browser.test.ts
python3 experiments/post-spike-evidence/2026-10-02/native-floor-history-r1-f2/verify-packet.py
```

Use each named Node runtime for the recorded source/compiled commands in
`runs.json`. Existing authority/DATA predicates and fixtures, application fault
files, production modules and the frozen P3 design are preserved byte for byte.
The checker validates evidence without rerunning timing, providers or browsers.

Recommend accepting this narrow regression and disclosure after independent
exact-head review. Full R1, P2 and P3 remain open: indexed durable inventory and
restore, independent installation acceptance, real crash/two-writer gates and
performance characterization still need implementation and measured evidence.
The fixtures are synthetic; no real PDS/provider, Linux, whole-package test rerun,
durable restart or cross-build equivalence is claimed here. Process-local floors
retain their existing restart limits. The app PDS holding the repository signing
key can construct another ordering.
