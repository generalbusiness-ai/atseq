# Atseq

A lightweight framework for unique, purpose-specific applications: a folder over
a log, with atproto as the retained substrate. Apps declare Lexicon schemas,
JSONata behavior and views. GitSeq and Tailapps are architectural precursors;
neither is a product dependency.

Implementation is at **S0: runtime feasibility**. The local sandbox validates and
interprets sample data. It has no signing identity, PDS persistence, activation,
archive or agent adapter yet. See the [design](notes/2026-09-06-atseq-architecture.md),
[plan](notes/2026-09-06-atseq-initial-spike.md) and
[measured S0 result](notes/2026-09-06-atseq-runtime-feasibility.md).

## Try the experiment

Use Node 22.12 or later (tested with Node 26.8.1). From this checkout:

```sh
npm ci
npm run dev:experiment
```

Open the loopback URL printed by Vite. The page renders a retained Inlay
template and runs a declared action against sample state in a browser worker.
Reloading starts a new sample. Nothing is published.

## Reproduce S0

Also install Go 1.26.7 or later for the published-core comparison and Chromium:

```sh
npx playwright install chromium
npm run check
npm test
npm run spike:feasibility
```

The feasibility command builds and runs the published Go core natively and in
Chromium, builds the JavaScript experiment, runs the shared corpus in both
environments, and exercises the browser action. It records package versions,
integrities, licenses, fixture outcomes, bundle sizes and measured load times
in `experiments/feasibility.json`. It overwrites that evidence on each run.
Build output, screenshots and the full installed dependency tree go in ignored
`experiments/generated/`. No sibling checkout is required.

The commands for S1–S6 currently exit nonzero with “not implemented”. Their
presence is a command contract, not a claim that those gates passed.

## Current boundaries

The [candidate runtime profile](docs/runtime-profile.md) documents exactly what
is admitted. Unsupported input, expression, output or work exhaustion raises
an interpretation error; it never fabricates an ineffective application act.
Schemas load at runtime through `@atproto/lexicon`. Views use only local Inlay
templates and three registered primitives; rendering receives no signing or
network capability. Prototype UI and business examples are in `experiments/`.

Dependency versions are exact in `package-lock.json` and the independent Go
probe's `go.mod`/`go.sum`. Do not copy an evaluator into the repository or add
authored SQL to application definitions.
