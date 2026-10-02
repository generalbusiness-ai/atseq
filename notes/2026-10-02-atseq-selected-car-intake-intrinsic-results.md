# Native CAR intrinsic byte-bound results

Date: 2026-10-02

Request: `8ae492b28309e9c143eb63e22c34edbebbe0d0a2`.
Promise: `1a4adfe4f02ad40a0577b0f273257228723584b0`.
Adopted source: `97be58fccdd42286efa5feb38796f5791aa989b0`.

The selected-CAR intake now measures genuine typed-array storage before allocation. A caller's own or inherited `length` property cannot bypass the 32 MiB input or 1 MiB selected-commit limit. Captured TypedArray kind, length and copy intrinsics copy owned DATA without reading caller length, buffer, byte offset, constructor, slice, subarray, set, iterator or tag properties. Proxy, fake and other typed views receive an input refusal. Genuine Uint8Array subclasses and Node Buffer retain ordinary bytes and behavior. The existing same-realm Uint8Array guard remains in place. Foreign selected-commit property errors keep their identity outside the maintained CAR parser's error classification.

The defect was observed independently against frozen delivery `5331281b02167d2e4bffa126ae51f3c8c2901417`, whose runtime producer was `16a2361108deccc4c8a0317a51ee96639fbd614d`. A real CBOR block of 1,048,591 bytes with an own `length` of zero produced a 1,048,730-byte admission CAR containing the oversized block. The exact original probe, diagnostics and observation are retained under this packet's `actual/root-failure/`; that candidate remains unchanged. Executing the identical probe on the repaired source returns `native_proof_limit` with the same actual 1,048,591-byte input.

The final runtime producer is `593b3337e620ddd5985301bb08a9a7565d24979a`, based on that frozen delivery. Only `src/protocol/native-observer-car.ts`, the portable test corpus and the new attributed runner changed in the executable commit. The single private owning helper applies to both raw CAR and selected-commit input. It does not create a proof issuer, change dependency or public exports, modify a profile, or raise a cap.

## Executed results

All 19 matrix commands passed on Node 22.19.0, 24.21.0 and 26.10.0, with actual Chromium execution. Each Node ran build, normal check, compiler-input capture, source intake plus host tests, actual emitted-production intake, and actual emitted-production host tests. Chromium ran both the portable intake and existing portable observer tests. The seven source, emitted and Chromium intake consumers retained all 24 intake cases, 20 original observer-CAR cases and 51 original P1 cases. Their eight output CAR hashes are identical to the frozen first producer's independently written fixtures and outputs. No fixture was regenerated.

The added portable controls check own and inherited subclass lengths, real over-limit raw and commit storage, caller property/method isolation, Proxy/fake/other-view refusal and foreign selected-byte getter identity. All report zero caller byte properties executed. The six Node consumers additionally execute genuine Buffer controls; Chromium makes no Buffer claim. The same original capability, fixed root/DID/key, atomic cache refusal, private prefix inventory/floor, physical count before deduplication, exact set and framed/unique-raw byte predicates remain asserted.

Each actual build captures 146 source hashes and 472 emitted hashes. The packet verifies 194 physical packages and all 14,234 actual dependency file hashes in this new private installation. The separate PDS test dependency installation is also a private physical copy. It enables normal compiler checks but no new PDS trial is claimed. The earlier 32 MiB cumulative observer budget and 30-second reservation gates remain attributed to producer `bf290d7018060e4a2ecc1fd0d3964f6eedceaec0`; this successor does not relabel them as newly executed.

## Retained attempts and limits

The initial Node 26 pilot build and intake succeeded before the executable commit was frozen. A pilot typecheck failed because the isolated PDS test dependency tree had not yet been copied; its exact missing-module diagnostic is retained. After installing that private tree, all final normal checks passed. These attempts are retained with their actual stage, rather than presented as final matrix commands. The exact original root defect and the final remediation probe have separate source and runtime attribution.

The unchanged predecessor documentation, captures, source drivers and evidence remain byte-for-byte retained; the two intentionally repaired live files are pinned separately to both Git producers. Peak memory, allocation and hash-call counters remain unobserved. This helper and its focused tests do not complete the full P2 observer, persistence, provider, restart, checkpoint or performance obligations. Independent implementation review remains pending; no merge or push was performed by this worker.

The new packet checker verifies source, actual build/output, unchanged fixture and old evidence hashes, executed bundle bytes, runtime controls and meaningful negative controls. Run `python3 experiments/post-spike-evidence/2026-10-02/p2-selected-car-intake-intrinsic-successor/check-packet.py --repo . --self-test` from this worktree.
