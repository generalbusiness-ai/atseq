# Native proof extraction and bounded CAR intake — 2026-10-02

Reuse the existing [atcute CAR and MST libraries](https://github.com/mary-ext/atcute) and authenticated repository to produce a small standalone CAR for the paths actually needed by a receipt or observation. Fill its existing block cache with a CAR containing the selected commit and only the newly fetched blocks. Keep the supported repository interface unchanged.

This is a proposed source-only API clarification under P2-D4 request `261f4bd98074d54e269844ba21c478db73f824cc` and promise `edaec0d48bfda92f0514e0bd41d5d026edf052c2`. Full P2 request `3a7f6bb3d6c1c763619b6082558d83056a0ef7b2` remains open. The exact base is committed main `5006a5c6489ce348944a85d158dfe89fd979099c`; its proof, CAR, protocol barrel and observer source blobs are unchanged from reviewed `3164399`. Root's live working-tree state was not copied. The accepted D4 source is `c015a39f85698654135bd724f0c1bc44ff240dd7`, independently satisfied by `ff8331fbfd07cff9f4b23f2dcea53817bead9e9f` and ratified by `dc827268d05f67fc8eaecd1eb9a0aef02feefc4d`.

This packet changes no production code, public API, dependency, quota or profile. The choices below require independent workroom source review before code. They refine the allowed D4 extraction output and close the API and byte-ownership seams; the existing PD-1 and PD-2 decisions stay intact.

## Keep one issuing owner

Today [native-proof.ts](../src/protocol/native-proof.ts) owns the only repository capability registry and the only copied verified block cache. Its returned object is frozen. Authentication validates the commit, canonical key and low-S signature before atomic admission. `authenticateRepo` invokes the original `VerifiedRepoBlocks` prototype implementation, even if a caller supplies a subclass.

The protocol barrel currently export-stars that module. Adding `extractPaths` to `AuthenticatedRepo` would therefore add a supported runtime method and type member. Exporting a free function there without changing the barrel would also add a supported name. Neither happens invisibly.

**Chosen API1:** add a module-only operation and replace that one barrel export-star with the same explicit names it exposes now:

- Runtime: `NATIVE_PROOF_LIMITS`, `NATIVE_CACHE_BROWSER`, `NATIVE_CACHE_HOST`, `normalizeRepoSigningKey`, `assertAuthenticatedRepo`, `VerifiedRepoBlocks`, `authenticateRepo`.
- Types: `NativeLookup`, `NativeTree`, `AuthenticatedRepo`, `AuthenticateRepoOptions`.

The other barrel exports stay unchanged. `AuthenticatedRepo`, its methods and the package export map stay unchanged. A later host caller can directly import the internal module under existing layer rules. This is an internal interface, not a secrecy boundary against code running in the same process.

Convert the existing `authenticatedRoots` WeakSet into one private WeakMap containing the issuer-owned extraction operation. Only the existing successful authentication site registers it. `assertAuthenticatedRepo` still checks that same registry. The internal extractor invokes the registered operation; it does not call a supplied object's `.lookup`, accept a reader or cache callback, or expose registration. Clones, parsed objects and prototypes cannot become capabilities. No second brand, cache, index or trust registrar is needed.

The public-method alternative is shorter to expose but creates an unnecessary supported surface. Moving the entire issuer into another module or introducing an exported cross-module registration callback adds more changes without improving this boundary. Workroom review must confirm the explicit preserved export inventory before implementation.

## Return the existing ATproto evidence format

**Chosen API2:** return only newly owned CAR bytes:

```ts
// Internal module interface; proposed, not implemented.
extractNativeRepoPaths(
  repo: AuthenticatedRepo,
  requests: readonly { path: string; expectedCid?: string }[],
  signal?: AbortSignal,
): Promise<Uint8Array>
```

The caller already retains its requested paths and can obtain their results through existing `lookup`. A cold offline consumer authenticates the returned CAR and repeats those lookups. This avoids a second output-row profile and its duplicated result metadata. D4 permitted owned bytes and path/CID results; review must explicitly confirm that a separate result-row output is not owed. If review requires rows, their format and bytes must be separately closed before code. They are not part of this chosen interface.

Capture the count before allocating the request snapshot. Then capture bounded path and expected-CID values before any await. Validate closed row fields, existing MST syntax, canonical expected CIDs and the cancellation signal. Path syntax and the protocol's 1024-character maximum precede a stricter captured local character budget, as in today's lookup. Duplicate request rows remain charged before output-block deduplication. Zero rows may produce a commit-only diagnostic CAR; they prove no record membership, absence or whole tree.

Factor the existing checked path walk once for public `lookup` and the internal extractor. Continue using the same `BoundedNodes`, maintained `NodeStore`/`NodeWalker`, interval checks, framing/canonical node checks and error cleanup. Record exact raw bytes from every encountered node whose checks contributed to the operation, then the found record's exact bytes. Do not re-encode nodes or add record/schema validation; found records remain raw member bytes for the existing native consumers to interpret.

The maintained `findRpathAndBuildProof` returns node CIDs from the walker's final stack. It is useful as a test oracle for inclusion/exclusion, but it does not expose P1's walker for its interval cleanup, apply its resource policy, return record bytes, or retain every encountered node used by P1 checks. Replacing P1's checked walk with it would lose the existing verification boundary. Reuse the maintained walker rather than invent another tree verifier.

Deduplicate transient output by canonical CID. Its header selects only the original issuer root. Include its selected commit, required encountered nodes and found record bytes; a proved-absent diagnostic path needs no record bytes. Sort entries lexically by canonical CID for reproducible output. Use the maintained CAR writer, with exact framed size checked before allocating the final output. Required native paths still treat authenticated absence as invalid in their existing consumers.

Any required missing commit, node or record makes the complete extraction unavailable. A previously successful online lookup does not make missing bytes available now. Return no partial CAR. Expected-CID mismatches and foreign runtime errors retain their current classifications and identity. Unvisited branches remain unvalidated.

## Keep selected-commit ownership visible

**Chosen API3:** the extraction operation reads its selected commit from the same existing block cache and takes an owned operation-local copy. It does not attach a new retained commit to every issued capability. The commit counts in that output's byte and block budgets. If it has been evicted, extraction reports unavailable even when some online record lookups still succeed.

D4 separately requires the future bounded observer transport context to retain one selected-commit DATA copy for its active account selection. That copy is at most the existing 1-MiB block limit. This packet does not install that context or settle its account-slot lifetime. It must not accumulate an uncharged copy for every historical capability. Its future slot/count/byte policy belongs to the separately reviewed registry/lifetime join.

The context can supply its owned commit with newly fetched blocks to genuine authentication on the same cache. The operation rechecks the fixed selected root, DID and appointed key. Retain the original capability object after a same-root fill; it already closes over that cache. The new authentication result is only a checked fill candidate. Never retarget an existing capability to a new root or key, and never turn a stored commit/key tuple into a serialized capability.

## Share bounded CAR intake

**Chosen API4:** add two module-only DATA operations in [native-observer-car.ts](../src/protocol/native-observer-car.ts):

```ts
selectNativeObservationCommit(raw: Uint8Array): {
  root: string;
  bytes: Uint8Array;
}

exactAdmissionCar(
  raw: Uint8Array,
  requested: readonly string[],
  selectedCommit: { root: string; bytes: Uint8Array },
): Promise<Uint8Array>
```

The selection operation shares the constructor's existing parser, selected-root checks and portable unique-byte/block budget. It returns the original selected commit as owned DATA. It is neither authentication nor a trust token. A forged DATA pair must still pass its block hash and the later fixed-root/DID/key authentication.

Factor the exact-set predicate out of `addExact` once and share it with the new intake operation. Preserve the existing CAR parser and owned-error handling. Count physical response blocks before CID deduplication. Validate the full requested/returned CID set before serialization or admission. Extra blocks, malformed/hash-invalid bytes and omitted requested blocks keep their distinct refusals; a valid-looking subset of a failed response is never admitted.

Copy the response, request list and selected root/bytes before the first await. Validate 1–64 unique canonical CBOR requested CIDs. Response header roots are bounded syntax only; they do not choose authority. Compose a small CAR selecting the retained root and containing that owned commit plus the checked new response blocks. If the response already includes the commit, CID deduplication counts it once. Preserve existing duplicate physical-block set semantics within the 64-block ceiling; 65 physical duplicates refuse before deduplication.

Use the maintained writer and exact size preflight. Pass the result to `authenticateRepo` with the same retained cache and fixed expected root, DID, appointed key and proof limits. Its original prototype implementation rechecks the supplied hashes and commit signature, then admits the complete batch atomically. Do not dispatch an overridable caller method or add a skip-verification API. Failure cannot evict old verified bytes. Check the returned fields and retain the original capability identity.

Initial selection still parses and verifies its input through the byte owner and P1. Each fill repeats intake hashes, supplied-block P1 hashes, constant selected-commit/key/low-S verification and serialization of the small batch. The gain is avoiding the current entire retained Map copy, sort, CAR reconstruction and rehash on every fill. It is not zero verification work.

## Apply the existing resource space

These proposed local bounds reuse existing constants; no transport, cache or public quota is raised.

| Resource | Proposed operation bound |
| --- | --- |
| Captured request rows | 0 through the lower of issuer `carBlocks` and default 100000; count duplicates |
| Captured request bytes | Existing portable 16 MiB, counted incrementally as UTF-8 tuple-array JSON including framing; resource accounting, not a wire profile |
| Extracted unique blocks | Lower of issuer `carBlocks` and portable 50000; commit counts once |
| Extracted serialized CAR | Lower of issuer `carBytes` and portable 16 MiB; header, CID and varint framing count |
| Blocks / traversal | Captured issuer bounds; defaults 1-MiB blocks, 64 path loads, 4096 node entries and depth 64 |
| Exact block response | Existing raw 32 MiB; 64 physical blocks before dedup; 1-MiB blocks and 16-KiB header |
| Intake output | Actual serialized 16 MiB; at most 65 unique blocks including the commit; P1 independently applies its bounds |
| Initial selected input | Existing constructor: raw 32 MiB, physical 100000, unique 50000 and unique raw bytes 16 MiB |
| Retained cache | Existing browser 16 MiB/50000; host 128 MiB/400000; neither expands portable output |

The exact CAR size is the maintained header length plus, for each unique entry, the varint length of `(CID bytes + block bytes)` and those bytes themselves. Check this before allocating the complete output. Count copied request-row bytes incrementally before admitting another row to the captured snapshot.

A collector that would exceed its output budget retains no oversized copied block. Mark overflow and complete only the current already bounded checked walk. That lets its existing exposed structural faults keep precedence. Missing evidence remains unavailable; a valid complete path that overflows reports `native_proof_limit`. Stop before the next path. The implementation must test this ordering rather than add an early exception that hides an already exposed interval fault.

These are separate ownership and serialized-resource bounds, not a promise about total heap. The transient input parser, maintained per-path NodeStore, copied requests/blocks, writer chunks and final output can coexist. Measure their actual allocation/work. Traversal starts sequentially; no signature-result cache is introduced, and the validated-key cache remains zero entries.

Keep the existing I1 reservation of 30 seconds, 64 HTTP requests and 32 MiB across full observation retries. The extractor can check a supplied cancellation signal between paths and writer chunks. The host checks its same active reservation before and after local calls. A synchronous decode cannot be interrupted, and this is not a guaranteed overall CPU/storage/lock deadline. The existing sixteen account-subject-path cap is untouched; a later bounded app-suffix caller must be reviewed separately.

## Review and implementation sequence

Independent source review must decide API1–API4 before code. After adoption, the P1 extraction and CAR intake changes can be implemented in parallel: they own different production files and focused tests. Neither overlaps C1's ordinary-authority/evaluator extraction. Preserve original P1 and R1 corpus predicates and add genuine producer tests using the existing fixtures. Dedicated emitted drivers and actual Chromium gates are required for implementation, not claimed here.

The observer join follows both. It owns the installation-scoped account transport lifetime, known-lineage registration, root/method retries, current/floor/registry rechecks and cursor handoff. PD-1's frozen `48a5634a` implementation candidate was awaiting independent code review at this packet's cutoff; the proposed internal floor audit remains a dependency, not proof that an account cursor is installed. PD-2 still consumes a genuine capture by deleting its WeakMap registration before returning owned publication input. Encoded DATA cannot recreate it.

Later coordination on 2026-10-02: independent P2-I1 review `8ef8823469718221b7c06a18a88b919f9c6b1446` approved frozen `48a5634a` with no changes required. The original source cutoff stays unchanged; the [later coordination record](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-intake-api/later-coordination.json) preserves that exact report separately. Root reported ratification/merge queued at message time, so this packet does not claim a later merge.

The future observer/recovery caller conservatively inherits the approved audit: a contradiction or pending fault in any registered lineage withholds the shared account cursor for every app. Its floor facts remain unchanged. This is an availability coupling, not an identified safety gap. A floor-fact-only audit for a contradicted owner is an open alternative requiring a separate reviewed private seam and genuine recovery, concurrency and no-effects tests before the caller is built. API1–API4 do not settle that choice, alter the frozen audit or implement the observer.

P4's native-publication origin must use its checked private assertion boundary and the same owner. Unknown or deferred coverage remains unavailable; extraction/fill cannot mint complete-from-genesis coverage or promote origin/identity assurance. P3 installed-provenance restore and actual SQLite/IDB transitions remain separate gates.

The app PDS holding the repository signing key can construct another ordering. Sparse proof export preserves its selected authenticated root and requested path scope. It does not establish current identity, global canonicality, non-equivocation or a complete replay/source/participant closure. Offline consumers must separately retain the accepted method and genesis evidence needed by their actual claim.

The [original 36 vectors and 12 obligations](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-intake-api/original-p2-vectors.json) are copied byte-for-byte from accepted D4, including their historical `UNEXECUTED` wording. [Thirty proposed seam vectors](../experiments/post-spike-evidence/2026-10-02/native-proof-extraction-intake-api/decision-vectors.json) are also all `UNEXECUTED`. Full P2's actual integrated 100/1k/10k and delta 0/1/100 space, several apps under account rollback, real PDS, offline proof/receipt/export, restart/restore and Node/Chromium/platform gates remain open. No runtime or provider experiment was run for this packet.
