# Native proof extraction browser fixture independence

Date: 2026-10-02

The browser test now runs independently. It prepares its own genuine signed extraction fixture and generic-record workloads through the existing fixture factories. It does not read files written by another test. Explicit fixture paths remain supported. The test retains its exact input bytes and their hashes in its own capture directory.

This is the P2-F1-N1 followup, request `fcb5cdf3b35b99ecc9af2814db4838af262312d0`, promise `d0d4796654a3539dc415b7a08fe64a9642f8a622`. The approved predecessor was `5ea6bfc6ad347ee1db446cfd6321723002c2c546`; reviewer report `b081bb7d243d123d2ea277238082cd67ea22f14d` identified the test dependency. The executable repair is `56d1930f0df8a2843ce2d3b6f635ef22b038253f`.

## What failed and what changed

With both default producer files absent and both explicit fixture environment variables unset, the predecessor browser test failed with `ENOENT` opening `.atseq-local/native-proof-extraction/fixture.json`. The retained [initial failure](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-browser-fixture-p2-f1-n1/standalone-before.log) records exit 1.

Only [the browser test](../tests/native-proof-extraction-browser.test.ts) changed. Its default preparation now calls `createExtractionFixtures()` and `extractionWorkload()` directly and awaits them before launching the browser. The factories, signed corpus, workloads, browser probe and production implementation are unchanged. The capture directory belongs to the browser test; it no longer depends on producer-file availability or test order.

## Actual results

Each browser run used Chromium 153.0.8010.12 and passed the same 17 extraction cases, 13 workload measurements and unchanged 51-case proof corpus. Both default producer files remained absent throughout every run. The concurrent run also passed the separate 17-case source producer test and its 13-measurement workload test.

| Node wrapper | Execution | Seconds for command | Result |
| --- | --- | ---: | --- |
| v22.19.0 | Browser alone | 33.33 | Pass |
| v24.21.0 | Browser alone | 30.00 | Pass |
| v26.10.0 | Browser alone | 29.80 | Pass |
| v26.10.0 | Browser and both producers, concurrency 3 | 28.14 | Pass |

These elapsed times include fixture preparation, bundling, browser startup and the workload. They are test-command measurements, not performance targets or isolated extraction timings. The workloads contain generic repository records at 100, 1,000, 10,000 and 40,000 records, including the existing portable block-cap refusal; they do not demonstrate integrated ordered-action performance.

`npm run build` and `npm run check` passed with TypeScript 7.0.2 and the private pinned dependencies. The latter checks types, formatting, layers and installed dependency integrity. Chromium executed a Vite bundle from source. No direct execution of emitted production modules is claimed by this narrow harness followup; the build output inventory is retained separately. Browser execution does not constitute installed provenance acceptance.

## Reproduce and inspect

After installing the pinned private dependencies and building in a disposable checkout, run the browser test alone with both `ATSEQ_NATIVE_EXTRACTION_FIXTURE_PATH` and `ATSEQ_NATIVE_EXTRACTION_WORKLOAD_FIXTURE_PATH` unset:

```sh
node scripts/source-run.mjs --test tests/native-proof-extraction-browser.test.ts
```

The retained [runner](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-browser-fixture-p2-f1-n1/run.py) records three standalone Node versions and the concurrent command. It sets separate capture directories for the producers and browser, retains randomized genuine fixture bytes losslessly as gzip, and records exact UTC execution times, runtime binary hashes and commands. Fixture hashes may differ on a fresh run because the genuine fixtures generate keys and signed repositories.

Verify the frozen evidence without rerunning the workload:

```sh
python3 experiments/post-spike-evidence/2026-10-02/native-proof-extraction-browser-fixture-p2-f1-n1/check.py
```

The [manifest](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-browser-fixture-p2-f1-n1/manifest.json) closes the packet over source, physical tools, build outputs, actual browser bundles, exact input captures and raw logs. All 102 predecessor paths are pinned: 101 remain byte-identical in this successor, while the original browser test bytes are retained separately. The original frozen worktree and captures were not changed.

## Scope and recommendation

This followup changes one test harness file. Production code, dependencies, package metadata, exports, identity rules and quotas are unchanged. No new authority or observer capability is created. Full P2 and P4 remain open; their observer, selected-root, installed restore, checkpoint and integration obligations are not closed by these results.

Submit this exact repair and packet to `atseq-reviewer` before governed merge. Root owns review publication, merge and push.
