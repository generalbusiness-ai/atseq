# Native verified prefix and compact authority results — 2026-10-02

R1-F1 implements the narrow runtime boundary in the adopted retry-prefix design. It is a candidate for independent review. A single private owner now verifies native publication ordering and owns request, actor-nonce and observation-descriptor identities. The existing application coordinator uses that owner, compact authority and one captured application generation. This does not complete the full R1, P2 or P3 programme.

The implementation request is `b3dde96b24378184e8e769108ff949ce06111688`, with promise `ff3f2062fdb838327eb3c5598f99ef870b8a57be`. The adopted design is `notes/2026-10-02-atseq-retry-prefix-boundary.md` at `66a05ce14bd92b4539f77e67f0e6fc6e0778f735`, adopted by `fbb33b78ead782473c7442fc7109b313df0b307d`. The implementation starts from main `526111bfd51172dfb3c06aa3557b3beb0a5d8964`; its frozen production and test source is `fbc96631e8a7e7f5d62754dd8d2f490ce6363733`. The implementation basis does not itself contain the separately reviewed design note.

## What changed

Cold admission authenticates the selected application root under the existing I1 method binding, verifies actual genesis and head membership, checks the supported native semantic identity and observation policy, and verifies the complete chain from genesis. A warm extension proves the exact retained boundary and checks a bounded suffix. There is no checkpoint, snapshot or installed-provenance acceptance constructor.

Opaque frozen views refer to one private owner. Each view has a fixed head, root and coverage; older views cannot see later accepted rows. Clones, prototype copies and parsed snapshots cannot preserve genuine authority. The application repository proof and raw caller entry cannot mint an authenticated authority entry: the sole route consumes the genuine prefix and exact genuine interpreted prior. Caller entries in the coordinator remain untrusted expectations compared with the checked published bytes.

The three historical authority arrays, their scans and their live append/sort work are removed together. The observer's corresponding guards use the same genuine fixed prefix at the captured interpreted frontier. The historical DATA parser and an explicit full historical export remain available for diagnostics. They cannot construct accepted authority. The reviewed authority rules and existing interpreter/coordinator remain in place. No dependencies, package exports, native record schemas or semantic identities changed.

Publication and interpretation are distinct. A complete signed ordering may retain a larger verified head while participant or source evidence is unavailable. Every identity through that head remains consumed, including later positions after a pending or contradicted entry. A later exposed participant contradiction preserves the verified head and those identities, leaves the interpreted frontier before the fault, and blocks promotion. Missing transport bytes, wrong fetched bytes, local limits and errors thrown by a reader do not manufacture a participant contradiction.

A fully checked unpublished candidate records only one negative in-memory floor: its authenticated head position and CID. It does not insert rows or identities. Lower candidates and higher forks that fail to include that exact floor are rejected. Same-floor restaging and genuine descendants are permitted. Acceptance checks the floor again, including after awaiting persistence. This floor is process-local knowledge, distinct from the durably committed accepted projection. It does not establish restart, restore or whole-storage-rollback protection.

Retry lookup requires an accepted view. A genuine staged view may support internal verification and projection work, but cannot return a receipt or report a staged request as missing. After acceptance, lookup verifies incoming signed content, checks its intent CID before the actor tuple, and returns the immutable first published entry and signature. An outcome is returned only within the same captured coordinator generation's interpreted outcome boundary. An exact old request remains identifiable after current grant revocation.

Old views keep their ordering answers fixed. Their contradiction field reports conservative later knowledge about a fault within that view's own head; it cannot acquire a fault position beyond that head. The owner still blocks further promotion after any accepted or pending contradiction. A plain snapshot already returned to a caller remains an owned copy.

## Persistence and failure boundaries

Both normal interpretation and pending-tail retention use the existing single coordinator generation. When a configured persistence callback is present, it receives the proposed coherent projection before the accepted prefix or application generation changes. A stale base is rejected; publication does not restage, recompute or retry automatically.

That callback is a trusted adapter contract: resolution confirms commit, and ordinary rejection must guarantee no commit. An adapter unable to establish that guarantee must use `NativePersistenceUncertain`; arbitrary error text or public error codes do not establish an abort. The signal only withholds authority and poisons the instance. Successful persistence followed by a stale owner or higher staged floor also poisons the instance. Failed contradiction persistence poisons it and preserves the negative owner block. Poisoned instances refuse snapshots, queries, retries and further processing until an actual reconciliation route is implemented.

The callback currently persists an explicit whole projection containing compact authority, publication status, domain/source identity and outcome history. This is a snapshot bridge, not a delta transaction adapter or durable prefix-index implementation. Copying its outcome history is O(N). The new prefix boundary removes repeated history identity scans and signature verification from the healthy suffix path; it does not make the entire persisted application path O(delta).

## Evidence

The [manifest](../experiments/post-spike-evidence/2026-10-02/native-prefix/manifest.json) pins source, fixtures, build outputs, the independent physical 194-package runtime closure and every retained capture. Browser bundles are frozen with hashes checked against the actual executed bundles. Large byte fixtures and diagnostic DATA are gzip-compressed; the manifest records both compressed and decoded hashes. Existing archives and historical evidence were left unchanged.

| Check | Result |
| --- | --- |
| Node 22.19.0, 24.21.0 and 26.10.0 source | 54 authority cases; 58 application cases and 24 actual callsite fault checks; 71 observer cases; 29 prefix cases |
| Actual compiled production on each Node version | 54 authority, 58 application, 29 prefix and four observer curve/method cells |
| Actual Chromium 153.0.8010.12 | 54 authority, 58 application plus 24 fault checks, 29 prefix; 20 observer CAR and 17 retained-handoff cases |
| Actual prior I2 source at `526111bf` on each Node version | 44 states: exact compact authority, outcomes and historical identity inventories equal the successor fixture |
| Build and repository checks | Passed with independent physical dependencies and reviewed runtime closure |
| Full Node 26 source suite | 473 tests passed |

The original success and hostile predicates remain exercised. Coverage includes cloned capabilities, foreign/lowered lineage, exact prior binding, true signed duplicate publication, bad signatures, CID-before-tuple precedence, immutable original signatures, source unavailability, live resume/fresh replay equality, pending tails, late participant faults, confirmed abort, uncertain commit and post-success stale persistence. The actual observer 30-second deadline and cumulative 32 MB three-attempt budget remain exercised on each Node version. New held-reader tests show that caller changes to delta limits or the reader method cannot alter the publication input captured before asynchronous work. Held persistence also tests a higher verified staging floor without accepting either suffix.

For a healthy warm base at N=100, the actual counters are:

| Delta | New actor signature checks | Entry loads | Reused boundary entries | Identity Map/Set reads | Staged writes | Accepted writes | Publication lookups |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 1 | 0 | 0 | 0 | 3 |
| 1 | 1 | 1 | 1 | 4 | 2 | 2 | 4 |
| 100 | 100 | 100 | 1 | 400 | 200 | 200 | 103 |

The sampled suffix contains signed role operations, without observation descriptors. Each ordinary identity check counts the actual accepted Map lookup and transient Set check; accepted index writes remain zero until acceptance. Lower account revision or a changed root at the same revision audits all retained paths: at N=100, 102 publication lookups and 100 reused entries, with no repeated actor signature checks. Account revision remains advisory and cannot lower the application floor.

These counters do not measure wall time, cold CAR parsing, I1 method work, individual MST lookup complexity, domain/authority size, garbage collection, snapshot export or durable storage. They demonstrate the narrow suffix mechanism. They are not the P2 N=0/10k/100k performance matrix or a general latency target.

## Recommendation and remaining work

Adopt this boundary after independent exact-head review, then connect it to the separately reviewed joined native host/publication work. Keep the PDS repository signing key's ability to construct another ordering explicit. Retained authenticated application floors reject encountered rollback or a fork through those floors; this does not prove global uniqueness or prevent unseen equivocation.

P3 must establish real SQLite/IndexedDB generation transactions, atomic indexed rows and metadata, adapter-specific uncertain-commit reconciliation, and installed-provenance restore before claiming durable retry coverage. P2 must characterize cold, warm, pending, contradicted, export and storage paths across larger histories. Checkpoints remain closed until their authority and provenance rules are implemented. No public native executable profile, provider publishing trial, native append host, trusted restore or full R1 completion is claimed here.

The earlier `f4e2911a` gates remain under `previous-f4e2911a/`, with their own source/build attribution. They preceded the captured-input, unpublished-retry and bounded-fault fixes and do not prove the final source. Draft comparison/test mistakes are retained separately and described without inventing a source commit attribution.
