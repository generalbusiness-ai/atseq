# Native path extraction: implementation results — 2026-10-02

A genuine authenticated repository can now produce an owned standalone CAR for its requested paths. The operation uses the existing issuing owner, cache, checked MST walk and maintained CAR writer. Fresh offline consumers reproduce found CIDs, raw record bytes and authenticated absence. A required missing block withholds the entire output.

This implements only P1 extraction child request `f91fcd5849700fd518ab2014782170526f4490ac` and promise `69f2a8c48594acb845944f9e00b420f43cc2fb4c`, from exact main `87eec6aa872ce7acc58dc641f8e84f47ca7bbbb1`. Executable source is `2ec1738a` (full pin in the [inspection](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-p2-f1/source-inspection.json)). Full P2 request `3a7f6bb3d6c1c763619b6082558d83056a0ef7b2` and promise `9f591c28f9fb14e0dba2f0e1086aa2d65a54a406` remain open. Root owns independent atseq-reviewer code review and governed landing; this report claims no merge or code approval.

The independently accepted [API design](2026-10-02-atseq-native-proof-extraction-intake.md) remains byte-for-byte frozen at `e08c10f38f60cc2b7cbac8fa2398cb333874090a`: report `fea8c97826aad8e2ffa1041185cffe323b1cee1c`, ratification `04804437aa57133a67f1bbef8f4c1c450b79f02c`, source adoption `97be58fccdd42286efa5feb38796f5791aa989b0`. Its original checker/capture describe that historical source-only packet; they are preserved evidence, not a successful rerun against this implementation. The new [checker](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-p2-f1/check-packet.py) checks this implementation packet.

## What changed

Only `src/protocol/native-proof.ts` and its protocol-barrel export changed in production. The supported `AuthenticatedRepo` shape and existing seven runtime/four type exports stay unchanged. The module-only `extractNativeRepoPaths(repo, requests, signal?)` returns CAR bytes. Its operation is registered only at the existing successful authentication site; one private WeakMap replaces the old WeakSet. There is no second issuer, parser, cache, index, registrar or caller reader.

Public lookup delegates to one shared checked walk without exposing the private collector, even when a caller passes extra arguments. Its predicates, interval/error cleanup and copied raw record bytes remain unchanged. Extraction records every encountered checked node and found raw record through that private walk. It takes bounded owned copies only after CID/entry framing, byte and unique-block admission. Its unexposed internal lookup result uses existing private cache bytes; public lookup always copies. This avoids an extra record copy when collection already overflowed.

Request count is captured before allocation; closed path/CID values and charged tuple-array bytes are captured before any await. Indexed capture ignores a caller iterator and later array growth. Signal validation checks native AbortSignal branding. The selected commit comes from the original cache and is held for this operation only. Eviction produces unavailable evidence, even when a surviving node can still answer an online lookup. No commit is attached to every live capability.

The actual maintained writer's first header yield supplies preflight header size; its published TypeScript declaration omits the runtime internal header serializer, so that undeclared helper is not used. Canonical CIDs sort lexically and deduplicate; the final allocation includes header, CID and entry-varint bytes. A collector that would overflow copies no offending block and finishes only its current bounded walk. Exposed structural invalidity outranks missing/limit; otherwise missing is unavailable and complete overflow is `native_proof_limit`. No next path or partial CAR is returned. Cancellation checks run between paths and writer chunks.

## Actual verification

The [run matrix](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-p2-f1/runs.json) records ten serial runtime invocations: source, extraction emitted and R1 emitted on Node 22.19.0, 24.21.0 and 26.10.0, then actual Chromium 153.0.8010.12. Each source invocation runs four top-level tests; the browser invocation runs two. Seventeen extraction case groups, 51 unchanged P1 cases and 29 unchanged R1 cases pass across source, actual emitted production and browser execution. PX17 is the actual platform/build matrix; all eighteen PX obligations are mapped in the [stage coverage](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-p2-f1/stage-coverage.json), with broader claim limits retained.

The producer fixtures use real P256/secp256k1 signing, maintained MST construction and genuine P1 authentication. They cover complete/absent sparse paths, exact all-encountered raw bytes, selected-commit and post-success record eviction, missing node/record, a truly unvisited malformed branch, hostile inherited intervals, request/output mutation, closed input and fake handles/signals, native cancellation/error identity, fixed byte/count limits and original-capability same-cache refill. Signed native genesis/head/entry paths also verify offline. That is a receipt path proof use case, not a complete receipt/source/participant export.

Pinned MST 1.1.1 found/absence lookup descends or moves within a frame; it does not naturally retreat. Genuine found/absence tests independently compare the exact encountered checked-node/record/commit set and bytes against maintained traversal and the original fixture. No natural retreat case or manufactured production machinery is claimed. Original hostile interval/cleanup predicates still execute unchanged.

The isolated installation has 194 runtime package paths and 14234 physical files, checked by genuine `verifyInstalledDependencies(true)` and captured separately. Actual build provenance binds 146 source inputs and 472 emitted outputs. The build ran before the executable commit but its complete hashes exactly match that source and actual executed dist. Tests transpile only test modules for the emitted driver; every production import uses real dist. `npm run build` and `npm run check` pass. Browser execution and its captured bundle are actual tests; existing browser no-op dependency admission and build-provenance JSON do not establish trusted installed provenance or full P3 restore acceptance.

Failed exploratory actions and corrected attempts remain in the [attempt inventory](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-p2-f1/attempts/tool-errors.json) and raw logs. One command was rejected before process creation with OS error 24; its serialized retry succeeded. It was not a permission rejection. No root package/user bytes, dependencies, profiles or supported exports changed. Large fixture/build/physical inventories are losslessly compressed with decoded hashes in the [compression inventory](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-p2-f1/compressed-inputs.json).

## Performance space and bounds

These are single observed runs on Darwin arm64 under concurrent programme work, without explicit performance targets or statistical repetition. Fixtures contain 100, 1000 and 10000 genuinely signed generic MST records; request sets are all records and warm 0/1/100 paths. They are not ordered action replay, account rollback recovery or integrated observer delta measurements. Fresh offline consumers validate the complete requested generic tree or selected subset after each export.

| Runtime | All 10k paths (ms) | 0 paths (ms) | 1 path (ms) | 100 paths (ms) |
| --- | ---: | ---: | ---: | ---: |
| Node 22 source | 2348.41 | 0.04 | 0.23 | 23.05 |
| Node 22 emitted | 1501.01 | 0.03 | 0.19 | 17.05 |
| Node 24 source | 2370.90 | 0.09 | 0.44 | 25.15 |
| Node 24 emitted | 1706.65 | 0.04 | 0.21 | 16.82 |
| Node 26 source | 1898.67 | 0.04 | 0.28 | 21.41 |
| Node 26 emitted | 5057.74 | 0.05 | 0.55 | 27.92 |
| Chromium | 1428.90 | 0.00 | 0.20 | 15.40 |

At 10k records, all-path extraction performs 56658 maintained NodeStore gets, emits 12667 unique blocks and 1682256 framed bytes, and copies 1211040 collector block bytes. Its warm 100-path request performs 565 node gets and emits 131 blocks/20286 framed bytes. A zero-path request emits only its 285-byte selected commit CAR and makes no membership/absence claim. Instrumented repository-signature calls during extraction are zero; supplied proof bytes and retained fixed root already passed genuine authentication. NodeStore still hashes/deserializes walked nodes. Hash calls, key normalization and peak/per-operation heap are uninstrumented and remain null, not zero. Source/emitted process-memory snapshots include entire test workloads and are not allocation/peak attribution.

The actual host-cache byte case exports 23 records with 16104731 framed bytes and refuses 24 records under the fixed portable 16777216-byte cap. Exact stricter issuer framing admits its boundary and refuses one byte less. A 40k-record closure has 50742 blocks but only 6740313 framed bytes: its export refuses the fixed 50000-unique-block ceiling, with no partial output or retained-cache inventory change. This isolates the block ceiling from bytes. That refused request can still consume substantial work (the Node26 source capture took about36 seconds). Boundaries limit retained/output resources; they are not a CPU deadline. Cancellation is cooperative, and no timer scheduling, preemption or whole-command storage/lock deadline is claimed.

The measured space supports small requested proofs and makes broad export costs visible. Keep these fixed bounds; the already separate future observer route must charge its caller path set and retain its actual I1/registry lifetime checks. A shared checked-path/batch optimization can be evaluated later if workloads justify it, with the same raw evidence and refusal predicates. No target, hidden quota increase or new cache is inferred from these runs.

## Scope still open

The app PDS holding the repository signing key can construct another ordering. Export preserves the selected authenticated root and requested evidence scope; it establishes no global canonicality, non-equivocation, current identity or complete replay.

Parallel CAR selection/intake, installation-scoped observer lifetime and all-lineage registry/cursor, PD2 one-use capture, P3 checked real SQLite/IDB restore and installed provenance, P4 asserted-origin construction, app/source/participant closure, real PDS, restart/recovery, integrated ordered100/1k/10k and delta0/1/100, several-app rollback and full platform/E1 gates remain open. The conservative approved poison/pendingFault coupling remains unchanged; any floor-fact-only observer recovery alternative needs its own reviewed seam/tests. No P4 origin or assurance is promoted by these bytes.

The original full P2 [36 historical UNEXECUTED vectors and twelve obligations](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-intake-api/original-p2-vectors.json) remain byte-for-byte intact. The [manifest](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-p2-f1/manifest.json) closes this stage's source, capture and report inventory; broader implementation claims remain unexecuted.
