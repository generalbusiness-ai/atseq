# Local generation adapters on the approved identity foundation

Date: 2026-10-01. Status: P3-F1 candidate for independent review. Full P3 remains open.

Workroom delivery request: `0a53491d00dfa61facfcff6923498feee357c568`. Promise: `92a2d479167aa6975a3f85adb0f6be7911b13324`.

The SQLite and IndexedDB adapters are integrated onto approved main `3a40d2c5e230cd7698f9cd4b9e8e9729054be33e`. All eight implementation and test files are byte-identical to source `558f396183904c01450bb2b7eb939a36f56f3a24`. The original [results](2026-10-01-atseq-local-generations-results.md), raw captures and manifest remain unchanged. The delivery adds raw transactional storage; it does not restore accepted authority, publish checkpoints, change existing Folder behavior or close the wider storage design.

Fresh isolated installation, setup/build and `npm run check` passed against the approved 147-path runtime graph. The Node 26.10 SQLite corpus passed all 22 cases, including real quota, commit failure, crash recovery and indexed retirement. Its 500-row fixture again visited one retirement key and retained 501 row versions. These are correctness and work-count checks, not latency measurements.

The earlier Node 22.13, 22.19, 24.21 and Chromium results are inherited evidence on identical adapter/test bytes; they were not rerun after this integration. The earlier broader-suite run and its ten PDS startup failures remain disclosed in the original report. No new full-suite or provider success is claimed. Packages, locks, dependency approvals, existing runtime source and public exports are unchanged from approved main.

[The integration manifest](../experiments/post-spike-evidence/2026-10-01/local-generations-integration/manifest.json) records the exact tested head, original source hashes, verified original capture hashes and fresh command logs. The tests ran before this report-only successor was added.

Independent review should assess transaction/CAS consistency, retention with nonadjacent pins, abort and error preservation, copied byte ownership, incremental retirement and the disclosed full metadata scan on pin release. Logical quotas exclude backend file overhead. The future consumer must validate complete indexes and provenance, classify missing interpreted outcomes as unavailable or a local fault, and use the separately reviewed I2/P4 trust routes.
