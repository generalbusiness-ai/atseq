# OAuth bundle checks without Git history — 2026-10-02

## Result

Both existing OAuth bundle tests pass in a genuine depth-one clone and a
Git-free source archive on Node 22.19.0, 24.21.0 and 26.10.0. All six runs
perform the actual esbuild comparisons. This fixes the failed bundle test in
CI run [36967961153](https://github.com/generalbusiness-ai/atseq/actions/runs/36967961153).
Linux CI after integration and independent review are still pending.

The change is limited to the bundle test and one checked fixture. Every existing
test body, including its before/after overlays, executable-module comparisons,
47-package assertion and lazy-loader checks, is byte-identical to approved main.
Production code, dependencies, approval files, package metadata and the workflow
are unchanged.

## Cause and change

The test loaded its historical dependency baseline with `git show` at module
initialization. The workflow uses the default shallow checkout. Its historical
commit was absent, so the test file failed before either test ran. A local
depth-one clone reproduced the same failure with the actual test command.

The test now reads `tests/vectors/oauth-predecessor.json.gz`. It retains the six
exact historical files from commit
`3a40d2c5e230cd7698f9cd4b9e8e9729054be33e`: dependency source, dependency approvals,
file approvals, notices, package metadata and shrinkwrap. Their combined original
size is 1,492,050 bytes. The compressed fixture is 530,152 bytes; its decoded JSON
is 1,574,925 bytes, including paths, basis, byte counts and hashes.

Before using the overlay, the test checks the pinned compressed SHA-256, schema,
basis, exact six-path membership, and every restored file's byte count and
SHA-256. Decoding has a 2 MiB output limit. The fixture contains complete UTF-8
text; each decoded file was compared byte-for-byte with its historical Git blob.
The historical 147 package rows remain unchanged in the current 194-package
approval, which adds exactly 47 rows.

Fetching all history would repair this workflow but leave ordinary shallow
clones and source archives unable to run the check. The existing OAuth closure
capture archive contains only four of the six exact files, and the adapter
capture archive contains none. A single complete local fixture keeps the test
independent of history, network access and research-archive extraction.

## Validation

Implementation source is frozen at
`0e1ff71700877d826f4506a1aaf8769bda046f62`, based on approved main
`93295649c992180c98bbf0bf75cd8f7d58a16df2`.

Each of the six runs used its specified Node executable and this command:

```text
node scripts/source-run.mjs --test tests/oauth-bundle.test.ts
```

Each run passed both tests: twelve test passes in total. The shallow clone reports
`--is-shallow-repository=true`, contains one commit, and cannot read the historical
basis object. The source archive was extracted from `git archive` of the frozen
source commit; it has no `.git` directory and `git rev-parse` fails. Both copies
use physical copies of the approved installed dependency graph. No dependency
installation or shared dependency symlink was used.

All 34 generated JavaScript files and metafiles have identical bytes across the
six runs. Their captured graph reports are also identical except for gzip
measurements. Node 22, 24 and 26 use different zlib versions; those measurements
are retained as observed rather than treated as a compressed-byte equivalence
claim. These tests measure bundle composition and size, not startup latency.

The unchanged production build and full `npm run check` pass in the implementation
worktree. The build verifies the installed runtime file closure; the check covers
TypeScript, formatting, layers and dependency provenance. The fixture PDS package
and lock file are unchanged. This focused change did not rerun the complete suite
or change any OAuth protocol, custody, provider or native-publication behavior.

## Evidence and earlier failures

The packet is
`experiments/post-spike-evidence/2026-10-02/oauth-bundle-shallow-h3/`.
Its verification file records seventeen exact source pins, nine unchanged files,
the six historical byte comparisons and runtime versions. Its run list records
the actual isolated paths, commands and results. The deterministic capture archive
retains each raw test log, graph report and generated-output hash list; every
member was checked against the capture inventory.

The failed Linux CI log and original shallow-clone reproduction are retained.
The first full check in the new worktree failed because its initial setup lacked
the built integrity adapter and PDS fixture dependencies. After physically copying
the existing fixture dependency graph and running the unchanged build, the full
check passed. A separate evidence check initially guessed a nonexistent PDS
shrinkwrap filename; correcting it to the existing `package-lock.json` required
no source changes or test reruns. These failures and corrections remain recorded.

Tracked work: T1-H3 request `6088d8d5a65da02e58905ec8f06d753d35816839`,
promise `46db0c167fcc15ea2703353c3635c1409cf2857a`, under T1. This result is ready
for independent exact-head review; it does not close the wider T1 programme.
