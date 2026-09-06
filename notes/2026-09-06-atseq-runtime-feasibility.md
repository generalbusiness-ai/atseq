---
date: 2026-09-06
status: S0 implemented; gate passes; awaiting independent review
companion: notes/2026-09-06-atseq-initial-spike.md
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
---

# Atseq runtime feasibility

The S0 composition works: a single bounded JSONata profile runs in Node and a
browser worker, two unrelated Lexicon bundles validate at runtime, and an Inlay
template produces a local query display and an explicit action control. This
is the first implementation slice. Signing, the PDS log, generic application
creation, activation and replay are still unimplemented.

## Measured result

`npm run check`, `npm test` and `npm run spike:feasibility` pass. The latter runs
75 identical fixtures in Node and Chromium, compares their outcomes, exercises
keyboard submission, tests hostile-text escaping and checks the narrow layout.
It observes zero submissions during rendering and one from an explicit
control. Source, input, state, output, schema-count and schema-size boundary
fixtures include the exact cap and a value over it. Dynamic references, nested
arrays, closed unions and optional/nullable values are exercised without
per-app code generation.

Raw evidence is [experiments/feasibility.json](../experiments/feasibility.json).
The script regenerates it rather than presenting proposed tests as results.
Representative [desktop](../experiments/evidence/desktop.png) and
[mobile](../experiments/evidence/mobile.png) screenshots are retained in Git.
The same command regenerates them and records their hashes with the bundles.

Measured on an Apple M5 Max, macOS arm64, Node 26.8.1, Go 1.27.0 and Chromium
153.0.8010.12. The instrumented browser loaded its worker and rendered its first
query in about 29 ms from a local production-preview server. The shell JS is
about 390 KB raw / 99 KB gzip and the worker about 586 KB raw / 155 KB gzip.
These include test instrumentation and duplicate schema/UI dependencies; they
are observations, not optimized-runtime size claims or network benchmarks.

## Candidate selection

| Candidate | Experiment | Result |
|---|---|---|
| Published jsonataddl 0.2.0 | Native run, generated state-document facade, actual Go/WASM browser build and execution | Facade works; not selected for the spike profile |
| jsonata 2.2.2 | Same sources and expected results in Node/browser, bounded wrapper | Selected |
| @atproto/lexicon 0.7.12 | Runtime schema and data validation | Selected |
| @inlay/core 0.0.13 + @inlay/render 0.3.1 | Local template, bindings, absent/hostile content, explicit control | Selected |

The Go result corrects an uncertainty in the plan: SQLite does **not** prevent
this published module from compiling or running in a browser. The measured
WASM is about 20.9 MB, and the complete local load/probe took about 180 ms.
A generated facade successfully carries state-document and ineffective
results through the core's opaque fact output.

However, the current closed core profile rejects the `$append` and multiplication
fixtures. Its public limits expose depth/range and a 2-second watchdog, with no
deterministic operation counter. A facade cannot add that counter inside the
published evaluator. The planned fallback supplies these capabilities without
a private fork or two different host/browser interpreters. No authored SQL is
introduced. The Go comparison remains an isolated experiment, pinned by module
version and checksum; Atseq's runtime has no Go or Tailapps dependency.

The JavaScript wrapper admits a documented subset and limits evaluator visits,
nesting, inspected intermediate data and output sizes. It does not claim a hard
heap quota. Watchdog and budget errors pause interpretation. The exact contract
is in [docs/runtime-profile.md](../docs/runtime-profile.md).

## Independent review corrections

The first review requested changes. Candidate 2 charges encoded intermediate
bytes instead of visited nodes, excludes host-dependent Unicode casing and
grapheme constraints, and maps the engine's stack/sequence failures to explicit
interpretation errors. It removes a shadowed depth hook and validates the AST
in one pass. Schema admission treats inherited type names as unsupported
schemas. Added shared fixtures cover the exact byte-work cap, engine and AST
boundaries, fold state/result contracts, Unicode keys, schema admission, and
view size/count/depth. The reviewer’s large-string reproducer now stops at the
byte budget. This candidate also preserves the separately landed plan-review
note and retains the representative screenshots.

## Ecosystem reuse and licenses

Lexicon supplies runtime IDL and query contracts directly. JSONata supplies
execution. A small profile check restricts unsupported constructs and prevents
default insertion; it does not replace Lexicon's validator. Inlay supplies
component records, template expansion and prop bindings. Atseq supplies only
local resolution policy and registered host controls.

The lockfile records exact npm versions, integrity hashes and the complete
resolved graph; the Go probe records its own module graph. Runtime packages
declare MIT. `@inlay/render` omits that field in its package metadata, but its
published revision's [upstream README](https://tangled.org/danabra.mov/inlay/blob/f6d4f5808e5a822ae98d330ee8efff866bab0346/README.md)
declares MIT. Build tooling includes unmodified MPL-2.0 lightningcss. Package
notices remain in their distributions; this work changes no dependency source.
The Apache-2.0 repository license and NOTICE are unchanged.

## What this does not establish

This sandbox has one fixture-specific form. It proves the local declarative
control boundary, not S4's generic renderer, signing, outbox or two-actor flow.
There is no projection/frontier or PDS evidence yet. The schema-set bounds do
not substitute for S3's full definition-closure check. Browser verification is
Chromium-only. Automated fixtures prove dynamic validation, not agentic
application creation; that remains a separate S6 exercise.

S1 is the next gate: canonical atproto encoding, actor and sequencer proofs,
genesis/head conventions, and independent signature/chain/retry vectors. Retain
the adopted canonical-PDS and exact-definition activation contracts unless a
subsequent decision changes them. The separate plan review is advice, not an
implicit replacement for that adoption.
