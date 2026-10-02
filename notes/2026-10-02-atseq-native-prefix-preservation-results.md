# Native prefix preservation: implementation results — 2026-10-02

The private prefix owner can now check that an authenticated repository preserves everything it already knows about an application's ordering, without processing that application's new suffix. This is P2-I1, the first production stage of the incremental-reader work. It does not install an account cursor or complete P2.

The tracked request is `edfbae3904aae489c18c2f7557c5a2e558f514e6`; the promise is `c47764b47fbe5868d5a70c562373921aab5a7ad7`. The full P2 request `3a7f6bb3d6c1c763619b6082558d83056a0ef7b2` and promise `9f591c28f9fb14e0dba2f0e1086aa2d65a54a406` remain open. This implements the first-stage conditions reviewed in source packet `c015a39f85698654135bd724f0c1bc44ff240dd7`, independent followup `ff8331fbfd07cff9f4b23f2dcea53817bead9e9f`, and ratification `dc827268d05f67fc8eaecd1eb9a0aef02feefc4d`. That source review does not approve this implementation; root must request independent exact-head code review before landing it.

The baseline is reviewed main `316439928e0c0d41965b086f2dace19a9249dba7`. Production and test code are pinned at `b713fd396b046069b03716732b21d5d78e45be57`; the complete source and matrix driver are pinned at `5868ef2a20a58672c2e777268e3e4d006428d143`. Exact Git blobs and SHA-256 values are in the [source inspection](../experiments/post-spike-evidence/2026-10-02/native-prefix-preserved-p2-i1/source-inspection.json).

## What changed

[assertNativePrefixPreserved](../src/application/native-prefix.ts) is a module-only internal function returning `Promise<void>`. The application barrel uses explicit exports and does not export it. No package export, dependency, schema, quota or public profile changed. Existing layer rules allow a later host caller to import the internal application module directly.

A genuine view resolves its existing private owner. The check captures the owner's current accepted view and its observed floor before awaiting proofs. An old registered view therefore cannot hide a newer accepted boundary. The observed floor can also be higher than the accepted view when a fully verified extension was deliberately left unaccepted.

The supplied repository must be genuinely issued by P1 and have the pinned application DID. The audit proves the pinned genesis and reads the actual selected head. That head must not lower either known boundary. If its position equals a known boundary, its entry reference must agree as well. The audit proves the exact entry CID at each nonzero accepted and observed boundary, deduplicates equal boundaries, and checks every retained accepted interior entry at its deterministic path. Position zero names genesis; no synthetic entry is created.

There is one retained-path loop, shared with ordinary `stageRows`. The ordinary rollback-recovery counters and predicates are unchanged. The audit rechecks current-view and floor identities after all awaits, and rejects existing or newly exposed contradiction/pending-fault poison. It neither clears nor reconciles poison.

It never calls `publication()` or `stageRows()`, derives I1 identity, reads a descriptor or content reader, or verifies actor signatures. It installs no rows, views, extension, floor, indexes, coverage or receipt. Completion returns no numbers or acceptance token. P1 may update its existing block-cache recency while performing a lookup; that is not prefix acceptance.

Missing proof bytes produce `content_unavailable`. Authenticated absence, a lower head, wrong DID or contradictory boundary remain invalid. The existing P1 `input` CID-mismatch error and wire `target` scope error retain their original types. A genuine runtime exception retains its object identity.

## Executed results

The [portable corpus](../tests/support/native-prefix-preserved-corpus.ts) contains 32 checks against genuinely signed repositories and genuine prefix owners. It covers higher discarded floors, old views versus current owners, genesis zero, changed/absent/missing required paths, contradictory heads, deduplication, concurrent floor/current/poison changes, runtime-fault identity and unchanged inventories, original entries, provenance and receipts.

One real authority suffix has valid entry/context records but missing descriptor bytes. Negative preservation succeeds with the required retained paths; ordinary staging still reports `content_unavailable`. A separate selected head at position 100001 contains unrelated unvalidated suffix material. The audit checks its known paths and does not apply the ordinary suffix delta budget, accept that suffix, or raise its floor to 100001. This is a scope test, not a 100001-entry performance measurement.

The test hook delays or counts the maintained MST walk and then calls the original implementation. It does not wrap, clone or substitute the genuine repository capability. P256 verification is counted after repository authentication and prefix setup. The measured successful audits perform zero crypto checks and zero reader calls. Their exact path counts are 2 for genesis zero, 4 for an accepted position-2 boundary, 5 with a higher unaccepted position-3 floor, and 6 for the accepted position-4 descriptor-gap example.

| Runtime | New source / emitted cases | Unchanged R1 source / emitted cases |
| --- | --- | --- |
| Node 22.19.0 | 32 / 32 | 29 / 29 |
| Node 24.21.0 | 32 / 32 | 29 / 29 |
| Node 26.10.0 | 32 / 32 | 29 / 29 |
| Chromium 153.0.8010.12 | 32, source bundle | 29, source bundle |

All ten matrix invocations passed. Chromium ran two browser tests using the exact Node-produced portable fixtures. Node emitted tests resolve every production import to actual `dist` output, with separate production-module hashes. The unchanged R1 corpus and fixture producer retain their baseline Git blobs, including their pending-tail, recovery, contradiction and persistence-refusal predicates.

`npm run build` and `npm run check` passed with Node 26.10.0 and TypeScript 7.0.2. Build started before the matrix-driver-only commit; all production and executable test bytes were already the final bytes. Build provenance records their exact source and output hashes. This worktree has its own physical `node_modules`, installed with `npm ci --ignore-scripts`, and its own PDS test dependencies. A forced installed-closure check passed; 194 runtime package inventories were measured from actual files. These are execution attribution, not accepted installation provenance, a restore contract or a provenance-equivalence pair. Browser integrity's current no-op does not become installation acceptance through these tests.

## Captures and reproduction

The [packet manifest](../experiments/post-spike-evidence/2026-10-02/native-prefix-preserved-p2-i1/manifest.json) closes the source/report/capture inventory. [runs.json](../experiments/post-spike-evidence/2026-10-02/native-prefix-preserved-p2-i1/runs.json) records actual versions, executable hashes, commands, environments, exits and source pins. Large fixtures and raw build/check logs are losslessly gzip-compressed; [compression.json](../experiments/post-spike-evidence/2026-10-02/native-prefix-preserved-p2-i1/compression.json) pins their original bytes. The original R1 fixture is copied exactly from its frozen accepted Git blob. Source runtimes consume one common new genuine fixture, so case and work projections can be compared exactly.

After installing dependencies and building, expand the retained `fixtures/r1-prefix.json.gz` to a local JSON file and run [run-matrix.py](../experiments/native-prefix-preserved/run-matrix.py) with `--node22`, `--node24`, `--node26`, `--capture-dir` and `--r1-fixture`. The driver rejects incorrectly labelled Node majors. It writes raw JSON fixtures; compression is a subsequent capture-preservation step. Run the [packet checker](../experiments/post-spike-evidence/2026-10-02/native-prefix-preserved-p2-i1/verify-packet.py) to verify the retained inventory, source pins, shared-loop/export boundary, build attribution and cross-runtime results. Its negative controls check that altered pins and missing/altered case inventories are refused.

Exploratory attempts remain separate from final evidence. An initial TypeScript fixture error treated a CAR root link as a CID object. The initial snapshot comparator rejected genuine typed-array provenance. Its exact selected diagnostic is retained, but full stdout of that first exploratory attempt was not redirected. A later complete failing log records a test expecting `envelope` where the unchanged wire reader correctly returned `target`; only the test expectation changed. Passing draft logs are retained and do not claim final-source attribution. Install stdout was captured from tool responses and is labelled accordingly. No failed capture was rewritten into a success.

## Limits and next steps

The app PDS holding the repository signing key can construct another ordering. This audit preserves previously known boundaries against the selected authenticated paths. It does not establish global canonicality, current identity authority or historical truth for unvisited branches. The later observer must retain and recheck every known lineage and its registry before installing a cursor, and must preserve the existing I1 before/root/after identity checks.

P1 path extraction, bounded exact CAR intake, the shared observer transport lifetime, one-use PD2 capture and account-cursor installation are not implemented here. The original 36 design vectors keep their historical `UNEXECUTED` labels; these stage results do not claim that full matrix has run. [Remaining gates](../experiments/post-spike-evidence/2026-10-02/native-prefix-preserved-p2-i1/remaining-gates.json) also retain genuine P4 asserted-origin construction, P3 installed-provenance restore, real SQLite/IDB transitions, the reference PDS and full performance/platform matrix as unexecuted dependencies.

At this source, no genuine `native-publication` prefix constructor exists. Asserted DATA cannot mint the complete-from-genesis brand. The future P4 branch must use its checked assertion boundary and the same owner; deferred or unknown coverage stays unavailable. Preservation must not promote its origin or assurance. No Linux, real provider/PDS, restart, materialization-fit or latency claim is made here.
