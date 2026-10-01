# Runtime dependency patch results — 2026-10-01

The shipped runtime closure now pins `brace-expansion` 5.0.12. The root npm audit
changed from one high-severity package record, covering three advisories, to
zero findings. Shared contract checks passed before and after the patch with
the same three semantic profile CIDs. Recommend accepting the patch through
the existing independently reviewed equivalence route.

This implements M0, workroom request
`9e6a98942df81bec18668124c9a7922c8b7e95a5`, after the P1 merge at
`3cdf0b0747336b201fbecb2f414a25957b3a8dda`. The implementation code head is
`a501e1c5f83cf7316ef8840b6efd0600719f4a2b`. The accompanying report and evidence
commit adds no further runtime, dependency, approval or notice changes.
Independent exact-head security and equivalence review remains required before
merging M0.

## Dependency and file changes

The [package delta](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-patch-delta.json)
records the entire shrinkwrap comparison, file comparison and artifact hashes.
Exactly one node changed: `node_modules/brace-expansion`, from 5.0.9 to 5.0.12,
with the published URL and SRI. No package was added or removed. No manifest,
override, parent range or `balanced-match` pin changed.

The clean installed tree was compared against all 135 approved package paths.
Only brace expansion's file subtree changed: nine of its 13 files changed,
with no file additions or removals. Its approval entry now records the new
version and integrity. The file verifier and actual dependency resolution
checks retain their existing behavior. The PDS fixture lock is unchanged at
SHA-256 `762b412e3aa383b3e094bc1d2f6a0cc4389df7444ef0726f693cb026788b3dcd`.
Root Wrangler work and historical evidence were not included in this patch.

| Root shrinkwrap | SHA-256 |
| --- | --- |
| Before | `ad408a2ce81f63bbeaf4a0800b37c5306870f4400729325a073e67f885f10502` |
| After | `5017272a6fbd7bcc1b2d3a460a071f0d519a61749ff31cc17104995a3e27d54b` |

The [preparation note](2026-10-01-atseq-runtime-advisory-preparation.md) traces
the declared Inlay → Lex builder → ts-morph → minimatch ancestry and its
separation from admitted Atseq execution. Its verified public source evidence
remains unchanged. The affected APIs remain callable upstream tooling; the
patch repairs code shipped to adopters even though no admitted Atseq record
path to brace expansion was found.

## Attribution refresh

Regenerating notices exposed stale attribution metadata already present after
P1. The authorized refresh is separate from the one-node dependency change.
The [notice delta](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-notice-delta.json)
compares the previous and generated notices and classifies them against the
locked graph before P1 merged.

P1's new or updated package/version notices are `@atcute/car` 6.1.0,
`@atcute/cbor` 2.3.8, `@atcute/cid` 2.5.0, `@atcute/lexicons` 2.1.1,
`@atcute/mst` 1.1.1, `@atcute/repo` 1.1.0, `@atcute/uint8array` 1.2.0,
`@atcute/util-text` 1.3.4, `@oomfware/eval` 0.1.0, `@standard-schema/spec`
1.1.0, `esm-env` 1.2.2 and the additional `unicode-segmenter` 0.17.3.
The existing 0.14.5 Unicode segmenter notice remains. Older unrelated stale
entries were Atseq's own version, now 0.1.0, and Prettier, already pinned to
3.9.9 before P1. M0 adds the brace-expansion 5.0.12 notice.

The generator and license policy are unchanged. No notice text changed for an
unchanged package/version. The generated 115 notices cover all 114 distinct
dependency package/version pairs across the 135 approved paths, plus Atseq
itself. The comparison found no missing approved dependency notice and no
extra dependency notice. New upstream notices retain their published MIT or
0BSD text. Updated distribution/archive notice bytes are intentional provenance
changes; independent review must examine this full attribution delta.

## Validation and equivalence

Validation used Node v26.10.0, npm 11.19.1 and Chromium 153.0.8010.12 on macOS.
Clean root and existing PDS-fixture installation completed. The fixture's
native SQLite smoke query succeeded. npm reported unapproved optional install
scripts; no install-script policy was widened. The build succeeded using the
installed platform binaries.

| Check | Result and retained evidence |
| --- | --- |
| Root npm audit before/after | One high package record → zero; [before](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-audit-before.json), [after](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-audit-after.json) |
| Shared protocol, authored runtime and activation/evolution assertions | 145/145 before and after; matching case results and three profile CIDs; [before](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-equivalence-before.json), [after](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-equivalence-after.json) |
| Build and dependency/file/resolution checks | Passed; [build](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-build.log), [check](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-check.log), [build provenance](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-build-provenance.json) |
| Runtime suite | 60/60, no skips; [log](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-runtime.log) |
| Full suite | 355/355, no skips; [log](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-tests.log) |
| Fresh packed native Node consumer | Passed APIs, declarations, JSON CLI, host and 145 shared cases; [consumer evidence](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-package-conformance.json) |
| Native Chromium execution | 41 hostile/valid cases and shared Node P-256/secp256k1 fixtures; [browser evidence](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-native-browser.json) |
| Full acceptance | 13/13 stages passed; [summary and dated log links](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-acceptance.json) |
| Patched-package security smoke | Four bounded subprocess cases passed; [evidence](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-security.json) |

The full suite also executes application interpretation in Node and a Chromium
worker, integrity drift refusal, native repository proof cases, persistence,
sessions and archive flows. An initial `npm run check` before the first build
could not resolve generated integrity adapter declarations. Following the
documented setup order, building first and rerunning check passed without a
source correction.

The shared assertions evaluate contract behavior on each installation; fixture
keys and nonces are fresh. Their equality does not claim byte equality of those
randomly generated logs or prove equivalence over every possible input. The
three descriptors and CIDs remain unchanged. Source tracing and these results
support the proposed existing-contract equivalence claim.

The upstream patch changes behavior for pathological patterns by introducing
bounds. Keeping the Atseq contract is justified by the absence of an admitted
tooling pattern path and observed contract conformance, rather than universal
upstream function equivalence. Independent review remains the acceptance gate.

The patched-package [security probe](../experiments/runtime-advisory-security.mjs)
checks exact ordinary expansion output and successful return for representative
comma parsing, nested expansion and repeated rewrite advisory inputs. Each
input runs in a separate Node subprocess with a three-second timeout and
four-MiB output budget. This is a smoke check of the installed patch, not an
exhaustive security proof or demonstration of an Atseq exploit path.

The [acceptance capture manifest](../experiments/post-spike-evidence/2026-10-01/runtime-advisory-acceptance-capture.json)
identifies the compressed original result, all 13 command logs and each retained
report. Every archived artifact was checked against the recorded SHA-256 before
capture. Original archive paths describe the temporary execution workspace.
The acceptance summary links to dated log copies. Historical experiment files
regenerated by acceptance were restored byte for byte after capture.

No performance recommendation is drawn from the legacy acceptance timings;
they are correctness execution evidence during concurrent programme work. No
old-version exploit execution or deployed-host exposure test is claimed. The
PDS fixture's separately assessed residual advisories remain outside this root
runtime patch; the zero-finding root audit does not describe that fixture.
