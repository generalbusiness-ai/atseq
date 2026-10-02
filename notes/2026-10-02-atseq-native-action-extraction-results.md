# Native action extraction results — 2026-10-02

The native application owner now has one private path for an ordinary action's grant and role gate, input validation, fold evaluation, and successor validation. The frozen application results and existing call-site fault predicates agree before and after the extraction in Node 22, 24 and 26 and actual Chromium. This completes the C1-F1 implementation foundation, subject to independent exact-head review. Full actor discovery, simulation and host preflight remain open.

Request: `git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:02dd44819e00efbff8df7f1c0861d23c0177b13a`.
Promise: `git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:71287495b64edcf6541ea0488f9c5ff9c54fdc26`.
The private worktree began at landed main `316439928e0c0d41965b086f2dace19a9249dba7`. The reviewed R1 producer is `5bb836a0522bd075cff513d4aaf4766bcbea5b97`, approved by review `2afbd00114ae51317b9590fc40eb25ce25e9acfd`. The adopted source contracts are C1 `aa8855d932473cfacb51167911c6dbc18fd0246c` and NH clarification `f65f625b0059d5d5b54ddda36f49323fef2aed33`.

The workroom request and internal decision inspections retain their dated staleness fields. The root agent confirmed that retirement of an obsolete A1 delivery basis does not revoke this task or the adopted C1/NH contracts. This report does not claim task closure, adoption of this implementation, or a merge.

## What changed

The production producer is `7fa56038edc81c85dd18f6bcde5d2a94769498dd`, with changes in two files:

- `src/application/native-authority.ts` has private `#actionGate` and `#action` methods on the existing `NativeApplicationOwner`. The gate preserves grant admission, exact grant CID, revocation, epoch, signer, signed action/execution scope, action existence, required role and selected execution precedence. The action method owns input/fold/successor handling and returns the internal outcome, optional successor and available evaluator counters.
- `src/runtime/evaluator.ts` has the internal module helper `foldEvaluation`. It executes `evaluate` once, preserves the existing fold output validation and error order, and retains that evaluation's `steps` and `inspectedBytes`. The supported `fold` function delegates and returns only its original `FoldResult`.

The internal helper choice is recorded in effective workroom decision `1aedbe393c6b3e2b14019d1f71d367dc8bd715c4`. Supported index/package exports are unchanged. A direct internal module export is deliberately used for the owner-to-evaluator call; no result metadata side channel, second evaluation, execution constructor or public authority flag was introduced.

The ordinary ordered caller passes its captured base, genuine authority snapshot, owned domain copy, authenticated principal/key, actual action and `nativeFoldMetadata(data.entry)`. Metadata still has exactly the existing five fields. Construction now occurs at the ordered helper call, before the private gate, and stays outside stage catches. Its signed ordinary-action predicates have already been established by the authenticated entry and branch. The helper uses `base.source`, so there is no independent source/authority capture supplied by a caller.

Entry authentication, duplicates, account/control operations, activation, ordering, persistence, poisoning and final generation publication retain their existing owner paths. The helper checks the same captured generation immediately after the fold await, including a designated fold denial. Stored domain copying and program retrieval stay outside the fold catches. Input and successor catches remain tied to their existing `NATIVE_FOLD_FAILURE_STAGES` sets. Authored ineffective outcomes pass through the unchanged outcome parser. Thrown calls have unavailable counters (`null` internally); zero is not fabricated.

The current ordered caller consumes the outcome and successor and does not publish the internal counters. No discovery, simulation, host or import caller was added. No private caller-selected preflight mode exists yet. A future host preflight must reuse the adopted private gate/input path and stop before evaluation, with its caller boundary reviewed separately.

## Frozen oracle and actual execution

Before source edits, the unchanged R1 gzip was decoded to `/private/tmp/atseq-c1-f1-oracle-20261002.json`. Its exact decoded size is **8,371,247 bytes**, SHA-256 **`f7c6d9c3740208973de828da976107b32a6107ad3c62085412476fdbb2e874e6`**. The original gzip is 837,118 bytes, SHA-256 `c5761072363bf18b74bbda960ba2085426b09010f6531b2578f09b4aa3e6ff6a`, retained at the R1 source pin. R1 was clean when the oracle was frozen.

Every before/after application gate sets `ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH` to that decoded file. Expected fixtures were never regenerated with refactored `app.process`. The unchanged corpus compares full application projections/outcomes with its 40 frozen vectors and checks 18 additional behavior/error/concurrency predicates. Reports contain the 58 executed case names, rather than a second serialized expected projection.

| Environment | Before and after source | Before and after emitted production | Agreement |
| --- | --- | --- | --- |
| Node 22.19.0 | 58 portable + 24 call-site fault cases | 58 cases | Same case/fault JSON and frozen oracle |
| Node 24.21.0 | 58 portable + 24 call-site fault cases | 58 cases | Same case/fault JSON and frozen oracle |
| Node 26.10.0 | 58 portable + 24 call-site fault cases | 58 cases | Same case/fault JSON and frozen oracle |
| Chromium 153.0.8010.12 | 58 portable + 24 call-site fault cases | Browser portable bundle | Same case/fault JSON and frozen oracle |

Before and after builds ran `scripts/build.mjs` under Node 26.10.0 with TypeScript 7.0.2. Each build captures all 145 source hashes and 468 output hashes. Only the two production source hashes changed; semantic-contract identities agree. The compiled corpus transpiles its test driver and imports the actual emitted `dist/src/...js` production modules. Their observed hashes agree with the relevant build's output manifest. Transformed fault bundles are separate test evidence and are never described as compiled production.

The normal Chromium corpus bundle's size/hash is retained in its original report; its body was not saved by the unchanged browser harness. The actual transformed fault bundle body is retained for each phase, and the counter probe's normal browser bundle body is retained. Source pins and build manifests permit rebuilding. This limitation does not turn a rebuilt bundle into an original capture.

## Fault predicate attribution

The original N1-F3 source is pinned at `526111bfd51172dfb3c06aa3557b3beb0a5d8964`. The retained N1-to-R1 diff identifies the schema adaptation: authenticated duplicate fixtures and repeated head/entry observations replaced the old identity-array duplicate case; stalled activation now distinguishes verified head from interpreted frontier; the injection markers name R1's owned authority and `#persist` calls. The fault-probe predicates themselves are byte-exact from N1-F3 through R1 and this extraction. All four original application fixture/corpus/fault source files remain byte-exact from R1.

The 24 probes execute the actual moved call sites in a test-only transformed bundle:

- Fifteen designated `InterpretationError` codes are injected at the evaluator fold-input marker, now inside `foldEvaluation`, and become the same framework fold failures.
- Four wrong constructor/subclass or non-designated code cases escape as the exact thrown object and leave the projection unchanged.
- Three designated typed codes injected at stored domain copying escape from that wrong call site as the exact object.
- One authenticated-entry stale-generation probe refuses continuation; one post-persistence stale-base probe poisons the instance and refuses later commits/results/queries.

The portable corpus separately covers natural invalid input, malformed fold output, successor rejection, Unicode/message bounds, precedence, owned snapshots and concurrent source changes. The 24 injection probes do not claim every error constructor at every stage; metadata/program retrieval and arbitrary input/successor constructor injection are not additional claimed probes.

## Counter evidence and other checks

The test-only measurement producer is `44822ab97441cb6a2a968bc3679139719d026436`. Four focused probes compare internal measured fold with a separate reference engine evaluation and the public fold API. Source, actual emitted evaluator modules and actual Chromium agree in all three Node versions. For the small effective example, counters are 13 steps and 122 inspected bytes; authored denial is 7 steps and 113 inspected bytes. Two malformed output programs preserve the exact `InterpretationError` constructor and `fold_output` code with unavailable thrown-call counters. Public results gain no counter fields, and the input state is unchanged. These examples are counter ABI evidence, not a performance characterization or discovery workload result.

`npm run check` passed type checking, formatting, layer/public import checks and installed dependency provenance. The first attempt failed because this isolated worktree lacked the private PDS development fixture's dependency directory; the exact error/log is retained. Physically copying the frozen R1 private PDS fixture dependencies into this private worktree fixed the check. There was no install, shared dependency or package/shrinkwrap change.

The shared runtime, projection, native prefix, authority, source, observer and observer-limit tests passed **82/82** on Node 26, including an actual Chromium worker. They ran after the mandatory frozen-baseline gate. No production source changed after that gate, so it was not repeated for these test-only additions.

Other retained inspection failures are the first capture parser's `StopIteration` when it assumed only TAP-prefixed JSON instead of Node's direct JSON reporter, and a read-only workroom inspect using the unconfigured default `codex` actor. The parser was corrected without changing tests; the workroom inspection succeeded with `atseq-codex`. These were tooling/inspection failures, not suppressed conformance passes. The original logs and correction attribution are in the packet.

## Review and remaining work

The packet at `experiments/post-spike-evidence/2026-10-02/native-action-extraction/` contains exact task/decision inspections, source pins, frozen oracle metadata, both production/attribution diffs, before/after command logs/results/build provenance, actual fault bundles, counter captures, the original failures and a hash inventory. Identical large capture bytes are stored once as gzip with an explicit decoded hash/size for every original observation; this is evidence storage, not a new application state or trust container. Run its `check.py` to verify the pins, delivery bytes, complete matrices, emitted/build agreement, single-evaluation/private-owner shape and negative controls. The checker does not execute or regenerate application expectations.

For reproduction, decode the original pinned R1 gzip first and set `ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH`; use separate clean worktrees at the pinned pre-edit basis and production producer. The retained gate runner records the exact executable paths, environment seam, commands and captures used here. Those absolute Node paths are environment-specific and must be replaced with the same recorded versions on another machine. The compiled driver requires a fresh build. A fresh reproduction is separate evidence, not replacement of these captures.

Independent exact-head implementation review and root-owned workroom adoption/merge remain required. Full C1 discovery selection, coherent owner query capture/memoized commitments, candidate-work ledger, real authenticated/offline simulation and host preflight are **UNEXECUTED**. Native checkpoint origin/restore/audit and the all-ordered-entry cold-open limitation beyond 10,000 entries are separate open work. This extraction adds reusable semantics and preserves results; it does not claim to solve those larger tasks or improve their performance.
