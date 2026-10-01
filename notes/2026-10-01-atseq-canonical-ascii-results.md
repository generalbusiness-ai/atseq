# Canonical ASCII token results — 2026-10-01

Canonical JSON now counts punctuation, safe integers, booleans and `null` by
string length. These emitted tokens are ASCII, so their UTF-16 length equals
their UTF-8 size. Strings and keys still use TextEncoder. The implementation
retains all three schema guards, eager paths, traversal and validation checks.
Recommend accepting this local change through independent equivalence review.

This implements V0 request `592e7c3327a8740f7a701b64e32a454cc7213aaa` under
ratified decision `e28c0d229bea433a450bc9d183939f04da466f39`. The original
proposal and evidence at `8034b247093a10b4a027ea6af9234e3820fca29d` remain
unchanged. The final implementation source head is
`8743d44e61211945047428b3efe78361dcf6e1f7`, based on main
`4b6ebab532d0ae1de5adbbe3326d70e0a80f0136`, including B0, PB1-R1, M0 and N0.
Independent exact-head review remains required before merging.

## Scope and equivalence

The production diff changes only [values.ts](../src/core/values.ts): an internal
token flag and nine calls that emit known ASCII. The other two calls emit a
string or key and retain the original encoder. The flag changes no charge
calls or values; charging still precedes accumulated byte-limit refusal.
Depth, safe integers, negative zero, Unicode, reserved keys, prototypes,
accessors, sparse arrays, cycles, key ordering and error text remain checked
at their existing locations. Schema mutation, alias and coercion behavior
remain unchanged because no pass is removed and no value is cached.

Dependencies, approvals, descriptors and notices are byte-identical to the
final main basis. The root shrinkwrap remains SHA-256
`5017272a6fbd7bcc1b2d3a460a071f0d519a61749ff31cc17104995a3e27d54b`;
the PDS fixture lock remains
`762b412e3aa383b3e094bc1d2f6a0cc4389df7444ef0726f693cb026788b3dcd`.
Clean installation took place on the first fd7 basis; the combined basis has
the same locks and the installed dependency/file checks passed again.
Generated build provenance records the changed implementation source.

The [hostile differential](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-differential.json)
compares the pre-change compiled guard against both the actual imported guard
and its compiled source across 1,054 cases. Both comparisons pass. The 54 named
cases and 1,000 deterministic seeded values compare returned text, error
name/code/kind/message and every charged token. They cover all boundaries
above, charge failures, callback mutation of upcoming data, descriptor proxies,
ignored nonenumerable members and engine-array annotations.

[Node before](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-shared-baseline.json)
and [Node after](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-shared-actual.json)
each pass 146 shared assertions with identical results and current log-v2,
evaluator-v1 and app-v2 CIDs. The actual capture uses the normal on-disk guard.
Baseline substitution changes only the guard in an isolated process. The
[Chromium comparison](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-browser.json)
passes both differential comparisons and 134 shared assertions in each bundle.
Its actual bundle has no source substitution. Twelve Node-only evolution
assertions remain covered in Node. The 21 controlled actual schema/XRPC wrapper
outcomes also match across both versions and environments, including mutation,
coercion, mapped validation errors and host faults.

## Bounded actual-method measurement

The [timing harness](../experiments/canonical-ascii/timing.mjs) times the actual
unchanged `Schemas.validate` class method, with separate equivalent official
Lexicon instances. Baseline uses its original guard through a process-local
import substitution; the actual class imports production source normally.
The unchanged schema source is checked against the final main basis. Baseline
class compilation uses the locked ts-morph TypeScript API; actual loading uses
the normal source runner. Both execute the same three passes.

The original P0 input is verified by compressed and raw SHA-256. Its retained
application uses app-v1 and is correctly [refused by current application
loading](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-profile-refusal.json).
This kernel reuses only its exact Lexicon documents and reconstructed
state shapes through normal current `Schemas` construction. It does not admit
the old application, alter its bytes or claim prior compatibility.

The [raw capture](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-timing.json)
contains 104 sample rows: four sizes, two versions and thirteen samples of five
calls, following five warmup samples with alternating order. Measurements used
the same Node process on an Apple M5 Max. Our own heavy processes and the
coordinated I1/B1 builds and tests were stopped. Unrelated host or reviewer
activity, JIT and GC remain possible noise.

Median milliseconds per actual `Schemas.validate` call:

| Reconstructed state length | Before | After |
| --- | ---: | ---: |
| 0 | 0.0062 | 0.0050 |
| 99 | 0.1025 | 0.0385 |
| 999 | 0.7980 | 0.2217 |
| 9,999 | 8.3357 | 2.4718 |

Outside timing, the exact compiled guard source was also checked with an
injected counting encoder. On the 9,999-item state, one canonical walk changed
from 20,007 encoding calls to three, with all 48,922 charged bytes unchanged.
The remaining encoded strings and keys account for 28 bytes. Encoding counts
are a guard allocation observation, rather than measured heap or RSS savings.

This reduces a constant cost. Revalidating a growing append-only state at each
action still has quadratic cumulative work. Checkpoints and bootstrap design
remain separate followups. No integrated catch-up speedup, heap improvement or
unbounded performance claim is made.

## Final validation

Validation used Node 26.10.0, npm 11.19.1 and Chromium 153.0.8010.12 on macOS
arm64. Current-basis results are separate from the first fd7 run.

| Gate | Result |
| --- | --- |
| Build, TypeScript, formatting, layers and dependency/file integrity | Passed |
| N0 notice consistency check | Passed; no notice changes |
| Full suite | 374/374, no skips |
| Fresh packed consumer | 154 assertions; actual compiled APIs, declarations, JSON CLI and host passed |
| Native Chromium execution | 51 cases and shared Node P-256/secp256k1 fixtures passed |
| Hostile and shared before/after checks | Node and Chromium passed as described above |
| Final full acceptance | 13/13 stages passed; [summary and dated logs](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-acceptance.json) |

The [packed evidence](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-package-conformance.json),
[native browser evidence](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-native-browser.json)
and [build provenance](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-build-provenance.json)
identify actual artifacts. The [final evidence manifest](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-manifest.json) retains sources,
harnesses, command logs and hashes. First-run fd7 evidence has its own prefix
and acceptance archive; it does not stand in for the final combined-basis gates.
Acceptance's legacy performance stages are correctness execution evidence,
without a speed recommendation. Historical generated reports are restored
byte for byte after capturing the new run. The [acceptance archive manifest](../experiments/post-spike-evidence/2026-10-01/canonical-ascii-acceptance-capture.json)
identifies the original result, all thirteen command logs and thirteen reports,
with every member checked against its recorded hash before capture.

These checks support retaining the existing semantic descriptors and CIDs;
they do not prove equivalence for every possible input. The source proof is
local: each flagged token is ASCII by construction under the runtime's trusted
JavaScript builtins. Independent review should examine that proof, the exact
production diff and the retained results before accepting equivalence.
