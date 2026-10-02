# Checkpoint browser test directory independence

Date: 2026-10-02

The pure checkpoint producer browser test now creates its exact capture directory before writing its bundle or results. It runs alone without a sibling test creating that directory. The owned-input browser test already creates its own exact directory and needs no change.

This corrects reviewer finding H-1 under P4-F1 request `d5fb37bfa8621a703ef9b45cd95439f80337af5a` and promise `7c04c01689b19b3c74cdee8dd333d9d4d7ee0fbb`. Independent report `fff3f4cdac38d1a3e11e98bb85153291639a9e1e` requested changes; it was not merge approval. Root accepted that finding in assignment `679bd0ab8eef288e6fb40324e69d1e21f9a7ac87`. This successor starts at immutable `5bf6ccda36e2d83a372fec4f2579d22adce466e0`; its executable change is `ca4b1e0604657b6da547126e501b35443402ca31`.

## Defect and correction

The [browser test](../tests/native-checkpoint-producer-browser.test.ts) created only `.atseq-local`, then wrote into `.atseq-local/native-checkpoint-producer`. A sibling created the child directory in the full suite. Without that sibling, the test failed with `ENOENT` opening `browser-bundle.js`.

The correction changes one line: create `.atseq-local/native-checkpoint-producer` with recursive directory creation. Its existing capture paths, fixture, literal oracle, corpus, browser bundle and assertions remain unchanged. The [owned-input browser test](../tests/native-checkpoint-producer-owned-input-browser.test.ts) already creates `.atseq-local/native-checkpoint-producer-owned-input` before writing.

The [retained standalone failure](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-browser-directory-p4-f1/standalone-before.log) records the genuine directory defect with the build present, original browser bytes and exit 1. An earlier attempt before building stopped at unresolved `#atseq-integrity`; that raw failed attempt and its metadata are also retained. The initial metadata's timestamp was recorded after that first attempt; its corrected companion labels it `finishedUTC`.

## Actual results

Every command began with both default capture directories absent and all four capture-path overrides unset. Successful capture directories were moved into a retained run directory between commands, so later commands could not inherit them. No siblings ran in either standalone mode. Chromium 153.0.8010.12 executed the same 30 producer cases and 21 owned-input cases; each browser test compared its result with the same source corpus running in Node.

| Node wrapper | Execution | Seconds for command | Result |
| --- | --- | ---: | --- |
| v22.19.0 | Producer browser alone | 10.04 | Pass |
| v22.19.0 | Owned-input browser alone | 2.15 | Pass |
| v24.21.0 | Producer browser alone | 8.79 | Pass |
| v24.21.0 | Owned-input browser alone | 2.13 | Pass |
| v26.10.0 | Producer browser alone | 8.50 | Pass |
| v26.10.0 | Owned-input browser alone | 2.27 | Pass |
| v26.10.0 | Both browsers and both producer tests, concurrency 4 | 8.78 | Pass |

The concurrent command ran both browser tests and both source producer tests with concurrency 4. Both source results matched their respective browser results. These are command elapsed times, including bundling, browser startup and repeated corpus execution, not isolated performance measurements or targets.

`npm run build` and `npm run check` passed with TypeScript 7.0.2 and the pinned private dependency installation. The latter checks types, formatting, layers and dependency integrity. These new executions use source test wrappers and actual Vite browser bundles with the existing build prerequisite. They do not claim new direct execution of emitted production modules, actual SQLite, IndexedDB, a native PDS or installed provenance acceptance.

## Preserved and current evidence

The successor preserves all 205 original Git pins. Of these, 204 files remain byte-identical at their original paths; the previous browser test bytes are retained separately because that one test changes. Neither the original worktrees nor their reports, captures and verification files were edited.

Earlier executed evidence remains bound to immutable producer `13e777b0` and its recorded full execution head. It has not been relabelled as evidence for the changed browser test. The new packet records its own executable head, exact UTC command times, Node and Chromium binary hashes, wrapper/source/fixture inputs, build outputs, private physical tool files and actual browser bundle bytes.

Inspect the [closed manifest](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-browser-directory-p4-f1/manifest.json) and verify both preserved and current layers without rerunning the corpus:

```sh
python3 experiments/post-spike-evidence/2026-10-02/native-checkpoint-browser-directory-p4-f1/check.py
```

After installing the pinned dependencies and building in a disposable checkout, the [runner](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-browser-directory-p4-f1/run.py) reproduces the standalone and concurrent commands. It requires both capture directories to be absent initially. The simplest standalone command is:

```sh
node scripts/source-run.mjs --test tests/native-checkpoint-producer-browser.test.ts
```

## Scope and recommendation

This is a one-line test-only correction. Production producer and reader bytes, ownership rules, dependencies, package metadata, exports and limits are unchanged. The producer remains DATA only; it does not capture an accepted generation, establish payload closure, publish authority or grant trust.

All 106 original source-only vectors remain preserved with their original status. This harness correction does not execute or close their full integration conditions. Full P3 and P4 remain open, including generation joins, archive and original payload closure, publication and restoration.

Submit the exact successor to `atseq-reviewer` for independent approval before governed merge. Root owns publication, merge and push.
