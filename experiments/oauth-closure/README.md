# OAuth source and closure comparison

This directory supports the dated [A1 comparison](../../notes/2026-10-01-atseq-oauth-client-comparison.md). It changes no production dependencies or OAuth implementation. Raw manifests, shrinkwraps, source tarballs, bundles, failures and final results are in `experiments/post-spike-evidence/2026-10-01/oauth-closure/`.

Large raw captures are stored without loss in `raw-captures.tar.gz`; `archive-info.json` records its SHA-256 and `capture-manifest.json` records each raw member. Small result summaries remain directly readable. To inspect original source tarballs, locks, graphs, bundles, metafiles and logs, extract into a disposable directory or the evidence directory in a fresh review worktree:

```sh
tar -xzf experiments/post-spike-evidence/2026-10-01/oauth-closure/raw-captures.tar.gz -C experiments/post-spike-evidence/2026-10-01/oauth-closure
```

`archive-evidence.py` checks every inventory member before packing and verifies the unpacked archive hashes. It does not remove original captures.

The original capture copied I1 foundation `fb5acd9ac3876de93917348e3ac12e080a885ef0` into six isolated `.tmp/oauth-closure/<variant>` directories and installed exact candidate pins. The retained locks reproduce those actual resolutions without re-resolving current registry ranges.

To reproduce, use a fresh worktree at the report's source basis, install root tools with `npm ci --no-audit --ignore-scripts`, then create each isolated candidate directory (`foundation`, `official`, `atcute`, `hybrid`, `official-preserved`, `hybrid-preserved`). Copy its retained `<variant>-package.json` as `package.json` and `<variant>-shrinkwrap.json` as `npm-shrinkwrap.json`. Run `npm ci --omit=dev --ignore-scripts --no-audit --no-fund` within each directory. Do not replace the production manifest or lock.

From the worktree root:

```sh
node experiments/oauth-closure/graph.mjs
node experiments/oauth-closure/bundle.mjs
node experiments/oauth-closure/node-probe.mjs current
npm exec --yes --package=node@22.19.0 -- node experiments/oauth-closure/node-probe.mjs floor
node experiments/oauth-closure/browser-probe.mjs
node experiments/oauth-closure/browser-storage-probe.mjs
node experiments/oauth-closure/source-capture.mjs
node experiments/oauth-closure/validate-evidence.mjs
```

The browser probes need the project's Playwright Chromium installation. They serve synthetic bundles on loopback, stop provider fetches and write no OAuth credentials. The temporary ambient fetch sentinel is an observation tool in isolated pages/processes, not a supported transport interface. Storage observation uses distinct synthetic metadata URLs and no session/state records.

`capture-manifest.mjs` copies this task's `/tmp/atseq-oauth-*.log` capture logs and records file/source hashes and failure classifications. It describes the original successful command exits, so a reproduction must record its own exits and use a successor evidence directory. Keep the original evidence immutable after review.

Package archives retain original licenses. Bundle metafiles distinguish parsed inputs, files contributing output and external imports; the bundles do not establish provider success or integrated application size. Root production build/full-suite/acceptance tests were not run for this source-only report.
