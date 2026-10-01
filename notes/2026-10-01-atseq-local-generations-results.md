# Local generation storage: implementation results

Date: 2026-10-01. Status: narrow adapter foundation delivered for independent review; full P3 remains open.

Workroom request: `bf870fc6d775c9392dda46c36828f12635cc6280`. Implementation promise: `f067a6bd65465e36e1b8b5b24fb2e77e4cec6726`.

This delivery adds internal SQLite and IndexedDB adapters for coherent local generations. Each commit compares the expected generation, writes only supplied keyed changes, retires eligible versions, checks retention quotas and advances the current pointer in one transaction. The caller gets either the old generation or the complete new generation. The existing Folder, host, browser sessions, application descriptors, package exports and dependencies are unchanged. Stored bytes do not create accepted authority, trusted replay state or a verified flag.

The actual source basis is `2a6870cadecbd89bb12d8a38c088282cf3202ef4`; the tested source and test commit is `558f396183904c01450bb2b7eb939a36f56f3a24`. The later evidence/report commit changes no implementation bytes. The separately frozen proposal commit `2fec4532bb316906c2c6e183cb2179546a9628a8` contains `notes/2026-10-01-atseq-materialized-checkpoints.md` and `notes/2026-10-01-atseq-checkpoint-policy-bytes.md`. They provide the wider design context; publication is a separate packet and their full integration gates remain open.

## Storage boundary

`src/core/local-generations.ts` defines one small asynchronous interface. `current` and `read` return copied generation metadata; `row` and `page` return copied raw bytes for an exact retained generation. `commit(expected, metadata, changes)` returns the next local generation number. `pin` and `release` retain generations by caller-owned reference. `close` is idempotent. These numbers are local storage revisions, not application positions or native repository revisions.

Rows have a bounded ASCII key and one of eight purposes: history, requests, descriptors, outcomes, authority, sources, evidence or pending work. The purpose is a storage partition, not an admission verdict. A null change is a deletion; reads select the newest version at or before the requested generation, including deletion versions. Inputs are copied before asynchronous work can observe caller mutations. Returned metadata, individual rows and pages cannot mutate stored bytes. ASCII ordering is the same in both backends; the future consumer must choose a numeric-position key encoding when lexical order must follow application position.

A file or database name belongs to one exact caller-selected scope. The caller must choose its app/genesis scope and, for Node, a private directory and permissions. This adapter does not manage credentials, encrypt data or authenticate the scope. It cannot detect whole-store rollback. Browser storage assumes an uncompromised origin: scripts, XSS or privileged extensions with access can rewrite it.

The configurable default policy allows 48 MiB of logical retained payload/key bytes, 100,000 row versions, four retained generations, 16 pin references, 1,000 changes per commit, 1 MiB per row, 128 KiB of generation metadata, and pages of at most 1,000 rows and 1 MiB. These are operational choices, not protocol maxima or performance targets. Logical accounting excludes SQLite/WAL and IndexedDB backend overhead. Reads of existing stores remain possible under a smaller caller policy; writes must satisfy that policy. One row exceeding the page byte budget gives an explicit quota error rather than an empty continuation loop.

Current and immediate predecessor are retained, plus bounded pinned generations. A commit which cannot preserve a still-referenced generation within the configured bound aborts; it never silently releases a pin. Row versions may outlive the generation metadata that created them when they remain the visible baseline for another retained generation. Releasing a pin is explicit and transactional. Quota, CAS conflict, unavailable generation, closed store, invalid caller input and detected local corruption have distinct local error codes. SQLite busy/locked and FULL errors preserve the engine error as their cause; other observed failures retain their original identity. None is an invalid-history verdict.

## Actual backends and work

The Node adapter uses the built-in [Node 22.19 SQLite API](https://nodejs.org/download/release/v22.19.0/docs/api/sqlite.html), WAL and synchronous FULL. A write starts with BEGIN IMMEDIATE. Read transactions keep the generation check and selected rows coherent with concurrent retirement. The browser adapter uses standard [IndexedDB transactions](https://www.w3.org/TR/IndexedDB/) and requests strict durability. Row headers and values occupy separate IndexedDB stores, so retirement can inspect headers without loading payloads. There is no new dependency or backend plugin framework.

Both adapters maintain logical usage counters inside the same transaction. An ordinary commit retires row versions by visiting keys changed in the preceding generation through a generation index. It does not clone all live rows or serialize old outcomes. Version selection considers all retained generations, including nonadjacent pins. A pin release which actually retires an old generation deliberately scans all row-key metadata; this is O(total stored row versions). Pagination may also visit extra version/deletion metadata before finding the requested live rows. These costs are disclosed rather than described as universally bounded by the requested delta or page length.

The 500-row fixture retained 501 versions after repeated updates to one key. Actual SQLite instrumentation saw one retirement key; its query plan used `local_rows_generation`. Chromium recorded four metadata cursor continuations, zero old payload reads and one payload addition for the one-key commit. A ten-row page loaded ten payloads, with 12 cursor continuations. Releasing an old pin recorded 1,004 metadata cursor continuations and zero payload reads. Both backends agreed on 137,794 logical bytes. These are observed work counts from a bounded correctness fixture, not timing measurements or end-to-end scaling claims.

## Validation and retained evidence

The shared corpus has 17 cases. It covers byte ownership, paging and byte budgets, exact prior/current visibility, tombstones, CAS conflicts, reopen, scope mismatch, caller errors, quota rollback, persistent pins, nonadjacent pinned versions through 14 generations, retirement and closed stores. It runs against actual file-backed SQLite and actual Chromium IndexedDB.

SQLite adds five cases, for 22 total per supported-version capture: an actual production COMMIT fault with original-error preservation; a real SQLite FULL engine failure; SIGKILL before and after the real COMMIT; and indexed retirement/accounting over 500 rows. Test-only interception restores built-in methods in finally blocks. The isolated crash child pauses directly around COMMIT; the parent observes the old/new generation, tests a busy competing writer, kills the child and reopens the file. The FULL test sets the real connection's maximum page count to eight before a 4 MiB write. It observes engine code 13, a typed quota cause, the original pointer and no new row. This tests SQLite's page limit, not an exhausted operating-system disk. The [SQLite result codes](https://www.sqlite.org/rescode.html#full) and [maximum page count](https://www.sqlite.org/pragma.html#pragma_max_page_count) document that mechanism.

Chromium adds actual transaction abort, work-count and pin-release cases, for 20 corpus cases. It also tests an actual physical quota abort and two renderer crashes. The fresh origin has an active, checked 1 MiB quota before its first IndexedDB operation, set by the [DevTools quota override](https://chromedevtools.github.io/devtools-protocol/tot/Storage/#method-overrideQuotaForOrigin). A 4 MiB incompressible write produces QuotaExceededError as the retained cause and leaves generation one intact. Before renderer crash, actual requests keep the transaction alive; after crash and reopen, only generation one is visible. Crashing after commit restores complete generation two. These tests prove process/renderer crash behavior, not sudden power-loss durability or behavior in every browser.

| Check | Result |
| --- | --- |
| Node 22.13.0 SQLite corpus | 22 cases passed |
| Node 22.19.0 SQLite corpus | 22 cases passed |
| Node 24.21.0 SQLite corpus | 22 cases passed |
| Node 26.10.0 SQLite corpus | 22 cases passed |
| Chromium 153.0.8010.12 | 20 corpus cases, real quota and both crash cases passed |
| `npm run build` | Passed; existing bundle-size warning retained |
| `npm run check` | TypeScript, formatting, layer and dependency provenance checks passed |
| Ordinary suite excluding unrelated 20,000-entry boundary | 285 passed; 10 failed at PDS startup because the isolated fixture installation lacks its better-sqlite3 native addon |

The broader suite was started once before deciding that the focused foundation gates were sufficient. Its failure is retained, not presented as a pass or a code regression diagnosis beyond the observed missing addon. It was not repeated, and the unrelated 20,000-entry boundary was not run. The fixture dependencies were installed with scripts disabled for existing TypeScript imports; changing or rebuilding that separate dependency environment is outside this delivery.

Raw JSON captures, command logs, timestamps, source hashes and the complete artifact inventory are under [the immutable evidence directory](../experiments/post-spike-evidence/2026-10-01/local-generations/558f3961/manifest.json). Manifest SHA-256: `dba9968347ddd875a7e715a71bfe6cb892acbffafc23dbb9fbe51878bec22dcd`. The capture source hashes match the frozen implementation commit. Both focused and ordinary-suite captures are retained. The Chromium capture records the generated bundle hash; rebuilding from the exact source and lock regenerates the probe, whose transient served bytes were not separately archived.

Two earlier quota-probe attempts incorrectly applied a lower quota after the origin had already used IndexedDB; their writes succeeded and the probes failed. The corrected test uses a separate fresh origin before any IDB access. A clearly labelled reconstruction of those observations is retained; their original raw stdout was not retained, and they are not claimed as physical-quota successes.

## Remaining P3 integration

The consumer must commit the admitted state, authority frontier, source/provenance identity, accepted app floors, immutable indexes, outcomes and retry metadata coherently, using the final I2 schemas. The adapter's raw row purposes do not freeze those wire schemas. I2's closed snapshot parser can validate owned data without minting authority; actual restore admission still needs the separately reviewed local provenance/equivalence and accepted-authority route.

Selective outcomes remain keyed by their actual position. A raw missing row is only raw absence. At or before an interpreted frontier, the consumer must report unavailable historical outcome data, or a local-integrity fault when a promised row is absent; it must not label that outcome permanently pending. A portable assertion consumer needs the separate P4 assertion and independent-audit gates. These adapters do not publish assertions, accept checkpoints, validate native proofs, accelerate bootstrap or close full P3/P4.
