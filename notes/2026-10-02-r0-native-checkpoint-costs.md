# Native checkpoint, proof, authority and retry costs — 2026-10-02

This experiment measures existing native data and APIs. It does not introduce a checkpoint producer, certify a checkpoint, or restore accepted application state. There is no performance target. The results characterize options for different workloads and trust choices.

The governed R0-F1 request is `4aa51255618f47d4bd798025ad2fc0c8569ad5df`, promise `c114f72e8c5fa5147a131940b20dbb2d591c3f1d`. It preserves full R0 request `2ba34dc60c9211f0a6503b7687d4fcc2fd2c7afc` and promise `bb91eeb1f8fa8199f772e2ab6d2793b9ef0254fb`.

## What is measured

N is the number of domain actions. Admissions and revocations are additional ordered entries. All cells use one participant identity and one epoch; the number of device signers and grants varies. No epoch is retired in this fixture. The four patterns are one long-lived grant, sixteen long-lived grants, one hundred grants retired in batches except the last, and one grant per action retired except the last.

The finite generator uses genuine P-256 signed native requests, signed PLC audit fixtures and repository commits, actual maintained ATproto MST algorithms and CARs, native content records, and the supported source interpreter. An ordinary TypeScript arithmetic oracle independently determines state and outcomes, and a separate ledger predicts grant/epoch/floor/control projection. Captured PLC evidence is offline; no external directory, DID provider, PDS or authorization server is exercised. Deterministic injective fixture nonces do not replace the adopted random 16-byte signer nonce contract.

Readers execute existing checkpoint history, outcome, source and evidence DATA codecs, derive request/signer-and-nonce/descriptor indexes, verify native framing, original entry/request bytes and signatures, check authority/history agreement, and authenticate each retained participant method/root/selected MST record. A separate real R1 application owner executes authority and source where default cold reconstruction permits it. Standalone proofs and DATA do not mint an accepted application generation.

Each cell is consumed by fresh Node22/24/26 source and compiled processes and a real compiled Chromium context. Canonical component hashes, counts, participant proof results, original/alternate/conflicting receipt results, allocator outcomes and storage status are compared exactly. Times, memory observations and backend overhead are recorded separately. One cold capture per runtime/cell is not a statistical estimate; other authorized agents may load the same machine. First calls include maintained dependency admission and cold code costs.

Actual SQLite and IndexedDB adapters use their existing defaults: 1,000 changes per commit, 48MiB logical storage, 100,000 rows, 1MiB per row, bounded pages and generation/pin retention. Successful runs close, reopen, compare every row byte and bounded page count, and check exact logical accounting. A refused batch also reopens the last confirmed generation and compares all confirmed rows exactly. Multiple raw commits are not atomic P3 accepted restore.

## Results

All 12 cells and 84 fresh runtime captures complete. Canonical projections, proof results, retry outcomes, allocator outcomes and raw-storage status agree across all seven modes per cell. Default refusals are retained; no trusted budget was raised.

| Actions | Pattern | Ordered entries | Grants / retired | Descriptors | Native evidence MiB | Authority JSON MiB | Raw rows confirmed / requested | Cold owner |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 100 | one | 101 | 1 / 0 | 1 | 0.274 | 0.002 | 639 / 639 | verified |
| 100 | sixteen | 116 | 16 / 0 | 16 | 0.367 | 0.012 | 774 / 774 | verified |
| 100 | retired | 299 | 100 / 99 | 199 | 1.334 | 0.068 | 2426 / 2426 | verified |
| 100 | one-use | 299 | 100 / 99 | 199 | 1.334 | 0.068 | 2426 / 2426 | verified |
| 1000 | one | 1001 | 1 / 0 | 1 | 2.618 | 0.002 | 6057 / 6057 | verified |
| 1000 | sixteen | 1016 | 16 / 0 | 16 | 2.711 | 0.012 | 6192 / 6192 | verified |
| 1000 | retired | 1199 | 100 / 99 | 199 | 3.679 | 0.068 | 7845 / 7845 | verified |
| 1000 | one-use | 2999 | 1000 / 999 | 1999 | 13.326 | 0.669 | 24111 / 24111 | verified |
| 10000 | one | 10001 | 1 / 0 | 1 | 26.077 | 0.002 | 60252 / 60252 | refused |
| 10000 | sixteen | 10016 | 16 / 0 | 16 | 26.171 | 0.012 | 60387 / 60387 | refused |
| 10000 | retired | 10199 | 100 / 99 | 199 | 27.139 | 0.068 | 62041 / 62041 | refused |
| 10000 | one-use | 29999 | 10000 / 9999 | 19999 | 133.305 | 6.677 | 64000 / 240957 | refused |

Observed node22-source wall seconds, one capture per cell. A missing complete-prefix/application value means the default route refused, not fast successful bootstrap.

| Actions / pattern | History signature/hash/chain | DATA index decode | Authority decode/copy | Authority/history | Participant methods/roots/MST | Full DATA clone | Source-only fold | Complete cold prefix | Actual authority/source replay | Raw commit attempt | Exact reopen reads |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 / one | 0.216 | 0.015 | 0.002 | 0.010 | 0.537 | 0.000 | 0.049 | 0.167 | 0.450 | 0.006 | 0.010 |
| 100 / sixteen | 0.208 | 0.015 | 0.007 | 0.016 | 0.532 | 0.000 | 0.045 | 0.171 | 0.553 | 0.006 | 0.010 |
| 100 / retired | 0.370 | 0.022 | 0.030 | 0.058 | 0.724 | 0.001 | 0.043 | 0.394 | 1.714 | 0.028 | 0.037 |
| 100 / one-use | 0.428 | 0.024 | 0.034 | 0.077 | 0.863 | 0.001 | 0.047 | 0.450 | 1.987 | 0.026 | 0.039 |
| 1000 / one | 1.743 | 0.098 | 0.002 | 0.056 | 0.540 | 0.001 | 0.424 | 1.342 | 4.435 | 0.082 | 0.086 |
| 1000 / sixteen | 2.122 | 0.125 | 0.008 | 0.080 | 0.663 | 0.002 | 0.510 | 1.924 | 4.588 | 0.086 | 0.088 |
| 1000 / retired | 2.049 | 0.190 | 0.030 | 0.130 | 0.794 | 0.002 | 0.426 | 1.672 | 6.950 | 0.120 | 0.118 |
| 1000 / one-use | 3.781 | 0.162 | 0.262 | 0.553 | 2.765 | 0.005 | 0.436 | 4.148 | 29.868 | 0.444 | 0.336 |
| 10000 / one | 19.604 | 1.067 | 0.002 | 0.544 | 1.639 | 0.016 | 4.206 | refused | — | 0.821 | 0.837 |
| 10000 / sixteen | 19.552 | 0.933 | 0.008 | 0.607 | 2.020 | 0.018 | 4.438 | refused | — | 0.897 | 0.856 |
| 10000 / retired | 18.287 | 0.931 | 0.031 | 0.640 | 0.897 | 0.016 | 4.411 | refused | — | 1.336 | 0.911 |
| 10000 / one-use | 39.618 | 1.637 | 2.616 | 6.598 | 23.345 | 0.079 | 4.732 | refused | — | 0.983 | — |

Observed chromium wall seconds, one capture per cell. A missing complete-prefix/application value means the default route refused, not fast successful bootstrap.

| Actions / pattern | History signature/hash/chain | DATA index decode | Authority decode/copy | Authority/history | Participant methods/roots/MST | Full DATA clone | Source-only fold | Complete cold prefix | Actual authority/source replay | Raw commit attempt | Exact reopen reads |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 / one | 0.191 | 0.007 | 0.001 | 0.003 | 0.008 | 0.000 | 0.038 | 0.170 | 0.433 | 0.052 | 0.142 |
| 100 / sixteen | 0.200 | 0.008 | 0.008 | 0.010 | 0.026 | 0.000 | 0.041 | 0.182 | 0.545 | 0.084 | 0.173 |
| 100 / retired | 0.427 | 0.014 | 0.020 | 0.065 | 0.238 | 0.001 | 0.038 | 0.503 | 1.870 | 0.342 | 0.635 |
| 100 / one-use | 0.427 | 0.014 | 0.021 | 0.061 | 0.228 | 0.001 | 0.038 | 0.481 | 1.707 | 0.283 | 0.637 |
| 1000 / one | 2.181 | 0.054 | 0.002 | 0.022 | 0.009 | 0.002 | 0.473 | 1.830 | 5.202 | 1.234 | 2.114 |
| 1000 / sixteen | 2.167 | 0.056 | 0.006 | 0.040 | 0.052 | 0.001 | 0.449 | 1.894 | 5.126 | 0.993 | 1.711 |
| 1000 / retired | 2.431 | 0.058 | 0.025 | 0.092 | 0.246 | 0.002 | 0.461 | 2.170 | 6.852 | 1.274 | 2.046 |
| 1000 / one-use | 4.591 | 0.120 | 0.299 | 0.621 | 2.386 | 0.018 | 0.492 | 5.959 | 28.032 | 4.446 | 7.294 |
| 10000 / one | 23.090 | 0.540 | 0.001 | 0.241 | 0.015 | 0.014 | 4.589 | refused | — | 12.482 | 19.622 |
| 10000 / sixteen | 29.875 | 0.695 | 0.008 | 0.342 | 0.046 | 0.018 | 5.668 | refused | — | 14.613 | 19.529 |
| 10000 / retired | 24.832 | 0.702 | 0.047 | 0.323 | 0.256 | 0.024 | 4.957 | refused | — | 14.275 | 22.238 |
| 10000 / one-use | 56.131 | 1.243 | 3.392 | 6.595 | 26.860 | 0.087 | 5.249 | refused | — | 13.859 | — |

The first three 10,000-action patterns fail with `content_unavailable` because their ordered entries exceed the default 10,000 delta. The one-use10,000 pattern fails earlier with `native_proof_limit: CAR bytes exceed budget`; its 93,417,453-byte app CAR exceeds the default 32MiB CAR limit. That cell also reaches the raw 48MiB logical store quota after 64 commits and 64,000 exact rows (49,629,164 accounted bytes); its requested 240,957 rows are not fully stored. All confirmed rows survive reopen byte-exact; this is not an accepted restore.

Across the successful eight cells, all original/alternate-signature retries preserve original intent/entry/position/first signature, and signed content conflicts return retry_conflict. There are 168 selected original retry measurements across seven modes, ranging 0.464–8.430 ms. This mixed-runtime single-capture range is not an SLA. The missing-old-publication-block refusal also agrees. Four10k receipt/whole-authority gates stay unavailable.

The full exact-row read after a quota refusal was executed and asserted but was not assigned its own phase timer. Its latency is explicitly unmeasured; the reported recovery timing covers reopening, and the timed commit phase covers the failed attempt. Successful-store complete reopen reads are measured.

The complete Node22/24/26 production builds have identical source, executable output and semantic-contract hashes. Only shell provenance and its manifest differ because they record the Node version (`src/host/build.ts:64`). A premature all-output equality assertion is retained separately from the corrected metadata-aware comparison; normal check/build gates passed.



## What the results recommend

1. Complete the trusted-local P3 restore and P4 asserted/deferred bootstrap paths before choosing a universal bootstrap target. Current DATA readers, storage and full cold replay answer different questions. A structural reader cannot mint trust merely because it parses matching bytes.
2. Preserve original content and receipt pointers while evaluating prevention-index space separately. Counter marks cannot replace original receipt/history evidence. Keep random signer nonces until a reviewed counter contract justifies durable allocation, cloned devices, concurrency, cancellation, gaps, reordering, renewal, rotation and exhaustion.
3. Keep existing ATproto repository roots/MST membership and content-addressed native manifests/chunks as the publication and byte-authentication primitives. These measurements do not establish a need for another Merkle tree or a lazy authenticated retry index. Any proposed index must identify the authority that authenticates first occurrence and its coverage.
4. Separate parsing, owned copies, byte hashing, original signature checks, participant proof validation, authority execution, source fold, raw storage and public proof production. In particular, an early default refusal is not rapid successful bootstrap. The repeated original cryptographic checks are a concrete region to examine for trusted-local reuse; their removal needs the adopted P3 trust and crash/floor boundaries.
5. Measure checkpoint production/publication and a streaming or paged reader once those APIs exist. This development fixture sends one large JSON container including base64 native bytes and independent oracles; its transfer/parse/heap costs are not a deployed ATproto checkpoint transport recommendation.
6. Profile the actual authority/application owner under many grants before changing its data structure. The fixture measures admitted and retired authority as well as native proof retention; compact domain state alone does not describe that workload. Full outcome projections are copied at snapshot or with an installed persistence callback; this experiment installs no such callback, so it does not measure per-entry durable projection copying.

## Boundaries and remaining full R0 work

P3 trusted-local atomic restore, rollback floors and crash recovery are unimplemented here. P4 checkpoint assertions, deferred verification and audit remain open. There is no native public original receipt-proof producer or serving path; private R1 pointers are not that proof. Runtime nonce semantics, wire contracts, profiles, production source, public exports and dependencies are unchanged. Raw database reopening never revives a serialized capability.

Oldest/middle/latest action retries are exercised only after a real maintained R1 owner independently reconstructs the prefix. A different valid signature over the same unsigned content returns the original intent CID, entry CID, position and first stored signature. Different signed content under the same signer/nonce is a conflict. Removing the old native publication block makes a fresh reconstruction unavailable and cannot alter the accepted owner's inventory. Default cold budget refusals leave those receipt/application gates unavailable rather than supplying model results.

The counter code is an unsupported alternative retaining every old content/receipt pointer and retired namespace. Actual SQLite/IndexedDB CAS allocation gives one concurrent winner, rejects a stale cloned allocator, retains allocation through restart/cancellation and refuses safe-integer wraparound. Consecutive counters expose gaps; increasing counters can strand lower in-flight requests. Renewal and signer/repository-key rotation consequences are explicitly recorded. These are not new native wire or a trusted restore path.

The pre-H4 74-diagnostic normal compiler failure and corrected draft experiment errors are retained. The exact reviewed H4 exclusion is a separately attributed config commit. A later private-fixture typecheck failure was corrected by copying the existing PDS fixture dependencies into the isolated worktree; no package/dependency change was made. Draft logs are labeled separately from final exact-source captures.

## Source and reproduction

The baseline is main `7de9dcd447658679f3a94866c7f0eb5506c63659`, with reviewed H4 config `f7a22dcb57db0598d9d7e8d80dc2f64075221b8a` independently applied at `2b2e1c72b12c68129c70b6e0b67a5b4ddcb0df44`. R1 source and compiled outputs are frozen at `5bb836a0522bd075cff513d4aaf4766bcbea5b97`. The E1 helper algorithm basis is `dd2f97bd710c88fa5c3f629f8efa6f00f837e5b1`; E1 final capture `2395c470283111e4817dde1342e973edd5e4e419` is read-only and its original one/sixteen workload does not stand in for these new grant patterns.

Generator source hashes are identical under recorded producer commits `e4f00b351651ef40b0da2937c545a16348e328e1` and `812f6e3453e872be22759890c78928d7e7f185d2`; only the measured consumer ledger changed between them. Final consumers stay at `812f6e3453e872be22759890c78928d7e7f185d2`. Build records pin 608 main and 613 R1 source/output files, and the installed approved dependency closure is checked by the normal/build gates.

Source inventory: `src/protocol/checkpoint-data.ts` lines24/37/149/308/339/391/471 define bounds, table kinds, framing, indexes and original checks; `src/application/checkpoint-authority-data.ts` lines15/51 read/crosscheck authority DATA; frozen R1 `src/application/native-prefix.ts` lines172/311/490 own default delta, reconstruction and retry lookup; `src/application/native-authority.ts` lines173/575/601/824 own snapshots, receipt/outcome access and conditional durable projections. `src/core/local-generations.ts` lines17/38 and the host/browser adapters define raw storage and defaults.

Reproduction uses the committed `experiments/r0-native/matrix.mjs` prepare/build/probe/compare stages with the exact read-only R1 worktree. The fixture and producer records pin actual bytes; the compiled driver uses actual production dist; the browser driver retains its compiled bundle. Root owns workroom publication, independent exact-head atseq-reviewer assessment and governed merge/push.

The retained packet is [raw results and recommendations](../experiments/post-spike-evidence/r0-native-f1/results.json), [all runtime measurements](../experiments/post-spike-evidence/r0-native-f1/measurements.csv), [exact seven-runtime comparison](../experiments/post-spike-evidence/r0-native-f1/cross-runtime-comparison.json), [build and dependency gates](../experiments/post-spike-evidence/r0-native-f1/build-runs.json), and [private SQLite retention pins](../experiments/post-spike-evidence/r0-native-f1/private-sqlite-retention.json). The SQLite main-file size in runtime results excludes WAL/SHM; the retention manifest separately pins all three actual files. Chromium origin usage is an estimate, not exact physical IndexedDB file size.
