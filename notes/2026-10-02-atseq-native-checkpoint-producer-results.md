---
date: 2026-10-02
request: d5fb37bfa8621a703ef9b45cd95439f80337af5a
promise: 7c04c01689b19b3c74cdee8dd333d9d4d7ee0fbb
parent_request: 1f13a0dcbbae3fd55a08049416ef16175a66c72d
base: 1db5e12fbfe8ea2b478ccfacd132abc522284f08
executable: ea1195ccc560fdb8984dde0d050141d4d7272ce7
status: implemented DATA producer; independent exact-head code review pending
---

# Produce deterministic checkpoint bytes

The internal [producer](../src/protocol/native-checkpoint-producer.ts) now encodes the adopted checkpoint assertion, tables, pages and native content records. It takes supplied original bytes, captures them before its first await, and returns bytes, content CIDs, exact native paths and serialized-byte counters. It accepts no generation capability or publication credential. The [shared assertion reader](../src/protocol/checkpoint-data.ts) adds the closed 15-field structural DATA check. Package exports, dependencies, semantic descriptors and existing reader signatures are unchanged.

The optional original `payloads` inventory is deliberately DATA only. Each supplied raw payload is framed exactly, but a row may name an original payload that the caller did not supply. This producer does not require, reconstruct or certify complete referenced closure. P4-F3 and the genuine captured-generation owner still owe original-payload closure checks, source/state admission and the authenticated publication/admission boundary. Missing bytes cannot become proof of membership or successful acceptance through this function.

Whole canonical rows are packed greedily into pages of at most 128 KiB and depth 32. Empty tables have no pages. One oversized row is refused. Existing complete-table readers check counts, positions, cross-page order and boundaries; the existing history DATA derivation checks duplicate identities. Source files retain their original order, including unused assets. Complete outcomes cover every position through the interpreted frontier and match history. Valid selective coverage exports `null`; it makes no completeness claim. Malformed selective rows still refuse.

Native content framing uses the existing 32 KiB chunks, at most 1024 chunks per 32 MiB payload, and 64 KiB native record bound. The invocation's transient deduplication inventory has the existing 48 MiB/100,000-record envelope capacity; captured input has separate 48 MiB/100,000-item capacity. There is no persistent content cache. These bounds do not increase any source, proof, storage or public-write quota. The supplied compact-authority header must match scope, frontier and active definition. The assertion frontier must name the exact supplied history entry even when outcomes are omitted. A stall must name precisely the first pending entry. Full authority semantics remain with the existing application DATA reader; canonical bytes cannot certify those semantics or state execution.

## Actual results

The [final execution captures](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-p4-f1/runs.json) pass on Node 22.19.0, 24.21.0 and 26.10.0, both source and actual emitted production modules, and Chromium 153.0.8010.12. All 30 new cases agree. The unchanged 91 checkpoint DATA and 103 outcome cases also agree across those source/emitted runtimes and actual Chromium. `npm run build` and `npm run check` pass. This includes the real layer, formatting and installed-dependency checks.

A [separate encoder](../tests/support/native-checkpoint-producer-oracle.mjs), using existing development dependencies `@ipld/dag-cbor` and `multiformats` with its own canonical JSON encoder, imports no Atseq production module. Its frozen [literal](../tests/vectors/native-checkpoint-producer.json) agrees with every returned record byte, path, CID, table/page/assertion byte and counter. Preparation reads the unchanged existing fixture, whose decoded SHA-256 is `885826c82e93de564330c1b1ca3f601b387642a9d5b719a20217e853092d9b41`. The fixture supplies real original history and authority DATA; its state/provenance examples and the new all-effective outcome input are supplied assertions, not a fresh execution of that history.

| Supplied DATA case | Unique content records | Actual serialized record bytes | Pages |
| --- | ---: | ---: | ---: |
| 13-row history, retained original payloads and complete outcomes | 221 | 656,824 | 4 |
| Same projections with a 32 MiB patterned raw payload | 276 | 8,320,889 | 4 |
| Source row filling exactly one 128 KiB page | 224 | 787,714 | 4 |

The patterned 32 MiB payload has 1024 ordered chunk references; repeated chunks share content records. The count and storage reduction above are measured for this input, not a general compression or allocator result. Empty payloads, exact 32 KiB, the next byte, 1024 chunks, refusal at 1025 chunks, exact/+1 pages, a subsequent row starting another page, depth 32/33, mutation after capture, substitution, gaps, extra fields, scope changes and malformed outcomes are covered. Counters describe actual new unique encoded records and logical payload/page bytes. Peak heap, native allocator copies, crypto-operation counts and timing regions are unmeasured. There is no latency target or 10,000-action fit claim.

## Attribution and limits

The [packet checker](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-p4-f1/check-packet.py) pins 331 execution inputs, all 147 build-source and 476 emitted-output hashes, compiler/tool files, actual runtime binaries, actual Chromium bundle and binary, and the forced installed runtime check covering 194 physical packages and 14,234 files. Emitted tests transpile test wrappers only and import actual `dist` production modules; their wrapper and module hashes are captured. Build source hashes match the final production bytes; the outcome-only test successor did not change emitted production.

Raw exploratory logs are retained. The first core test failed in the exact-page fixture's padding calculation; the first browser wrapper failed before browser launch because its fixture filename was wrong. Both were corrected and the full matrix rerun. Those early exploratory attempts lack separate execution-time wrapper inventories; they are not presented as fully attributed passes. The separately attributed earlier 21-case and 27-case matrices are retained. The final freeze inspection found that omitted outcomes needed an explicit history/frontier comparison; the single comparison and direct negative/stalled-boundary tests were added before publication, and the full matrix was rerun. An oracle namespace spelling was corrected against the existing schema before the first comparison; its earlier unaccepted output is not a literal. No tool approval was requested or rejected.

The [original 106 vectors](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-p4-f1/inputs/handoff-vectors.json) retain their exact source-only wording and `UNEXECUTED` labels. The [coverage report](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-p4-f1/coverage.json) maps this child's actual byte tests separately. Owned generation capture, retained-reference closure acquisition, state/source admission, authenticated assertion publication, installation trust, private generation restore, floors, pending dispatch, actual SQLite/IndexedDB, native PDS, offline independent replay and deferred/full audit remain other tracked work. Missing supplied referenced payloads are not manufactured or verified by this pure producer. No prefix, authority or writer brand is issued. Full P3 and P4 remain open.

Use this single deterministic producer for the forthcoming genuine owner capture and publication joins. Preserve the existing separately authenticated native publication model: **The app PDS holding the repository signing key can construct another ordering.** Publication may also assert false computed state; independently replaying the exact target detects false derivation. This producer grants no publication authority. Original identity-method evidence and did:web's web-observation limitation remain unchanged.
