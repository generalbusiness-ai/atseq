# Package tests preserve shared browser build outputs

Date: 2026-10-01. Status: implementation candidate awaiting independent review.

Tracking: T1-H1 request `d10cec26f86ec41d2bf58a05855588950c5f59e9`, promise
`8ed7aadce34a1a1387ef569661277495a7685733`. The full T1 implementation remains open.

## Problem and change

The ordinary test command runs files in parallel. The packed-consumer test ran
`npm run build` in the shared checkout. That production build removes the entire
`dist` directory before compiling it again. Concurrent Vite/browser tests resolve
the package's default `#atseq-integrity` adapter from that directory, so their
resolution could race its deletion and replacement.

The package test now copies its build inputs and the real installed dependency
tree into a private temporary directory. It builds and packs there using the
unchanged production commands. Its fresh consumer remains a separate directory,
and conformance cases continue to redirect source imports to the installed
compiled package. Native Node consumers still run without the source resolution
condition.

The copy includes package metadata and shrinkwrap, both TypeScript configurations,
scripts, source, lexicons, packaged documentation and licenses, and `node_modules`.
It excludes checkout `dist`. Ordinary copied files can be changed independently;
relative dependency binary links continue to resolve within the copied tree.
`COPYFILE_FICLONE` is a best-effort filesystem copy optimization; ownership does
not depend on support for that optimization.

The production build, package imports, supported profiles, dependency approvals,
source runner and parallel test command are unchanged. Source commit
`f38da4f8c6530aa0db1a4870e1aae046a5e6fcd1` changes only
`tests/helpers/package-build.ts` and `tests/package.test.ts`, on approved base
`fc8e20936c849d20e8e28be688afa08b29ce02ed`.

## Copy ordering and exact package bytes

The first staged consumer correctly refused a dependency mismatch. Its copied
runtime tree matched the approved bytes, but npm pack omitted seven bundled
`CHANGELOG.md` files. Packing the original isolated checkout included those files.

The cause was npm's hidden installation lock, `node_modules/.package-lock.json`.
Arborist accepts that cache only when its timestamp is at least as recent as the
installed package directories. A recursive copy can write it before those
directories. A stale cache makes npm read upstream package metadata again;
restrictive upstream `files` lists then omit the changelogs. The existing valid
installation cache instead supplies the metadata used by the original package
build.

The helper copies the existing hidden lock's unchanged bytes last. This preserves
the source installation's cache validity. The staged tarball then contained the
same 12,172 paths as the original tarball, with no omitted or added paths. The
unchanged production build verifies the copied dependency tree, and the fresh
consumer independently verifies the installed tree. No approved file was removed
from the integrity checks.

The [file-list comparison](../experiments/post-spike-evidence/2026-10-01/package-isolation/pack-file-list-comparison.json)
records the seven omissions and their resolution. Original npm JSON captures are
retained as gzip files with their uncompressed hashes and lengths recorded there.

## Results

Fresh checks on macOS arm64 passed:

| Check | Result |
| --- | --- |
| Final-source `npm run check` | Types, formatting, layers and the reviewed 147-package runtime closure passed. |
| Package and conflicting browser groups, in ordinary parallel mode | 71 tests passed; real Chromium 153.0.8010.12 executed browser-session, identity, native-proof and native-wire cases. |
| Full ordinary parallel suite using CI's 20,000-entry exclusion | 443 tests passed, zero failures, approximately 41 seconds. |
| Fresh packed native Node consumer | APIs, declarations, JSON CLI, host and 219 shared conformance cases passed in both successful runs. |
| Staged build provenance | All 116 recorded source hashes matched the original checkout. |
| Installed output provenance | All 370 recorded output hashes matched installed files. |
| Shared checkout preservation | Its unique `dist` sentinel and real browser integrity adapter survived the actual staged build. |
| Node 22.19 helper probe | Exact metadata, independently writable copies, relative binaries within the stage, excluded `dist`, unchanged hidden-lock bytes and copied dependency integrity passed. |

The full package/browser runs used Node 26.10.0 and npm 11.19.1. The Node 22.19
probe checks the changed copy helper and dependency integrity; it is not a second
full package/browser matrix run. The large 20,000-entry boundary fixture was
excluded exactly as it is in CI's ordinary-suite command and was not rerun here.

Stage copying took approximately 2.34 seconds in the focused run and 5.34 seconds
in the broader parallel run. These are separate setup-overhead measurements under
concurrent load. They are not application latency measurements, targets, or a
claim about filesystem space saved. The full installed toolchain is copied to
keep this harness simple and avoid installing or assembling a second dependency
closure.

The [focused capture](../experiments/post-spike-evidence/2026-10-01/package-isolation/focused-package-conformance.json)
and [ordinary-suite capture](../experiments/post-spike-evidence/2026-10-01/package-isolation/ordinary-package-conformance.json)
retain actual build provenance, case results, source/output verification counts,
shared adapter hash, copy overhead, and adapter/package hashes. The
[evidence manifest](../experiments/post-spike-evidence/2026-10-01/package-isolation/manifest.json)
pins source and every retained capture.

## Failures retained and remaining work

The deterministic red run changed only the package build's working directory
back to the shared root. The real production build deleted the sentinel and the
new assertion failed with `ENOENT`. Its exact test source and log are retained.
This establishes that the guard detects the original destructive behavior.

The first focused command encountered managed-sandbox restrictions on npm-cache
writes and loopback binds. The same tests were rerun with the required execution
permission. The first unrestricted run exposed the changelog omission described
above. A diagnostic also exceeded its default output buffer; the retry retained
npm's full file lists. The first Node 22 probe compared a macOS temporary-path
alias with its real path; correcting the probe to compare real paths resolved
that assertion. All failed captures remain available alongside the passing ones. Retained raw logs
produce 15 `git diff --check` whitespace findings from original Vite output and
blank lines in original failure traces; those capture bytes were preserved. The
changed test/helper source and this report pass the whitespace check.

The candidate is ready for independent review and integration. The pending OAuth
candidate separately adds a packed-consumer tampering case to the same test file;
that assertion must be retained when the candidates are integrated. This result
covers the current approved 147-package basis and does not claim validation of
that pending OAuth graph or completion of the whole T1 programme.
