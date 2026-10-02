---
date: 2026-10-02
request: d5fb37bfa8621a703ef9b45cd95439f80337af5a
promise: 7c04c01689b19b3c74cdee8dd333d9d4d7ee0fbb
predecessor: 5d7e3f1cf47de0ed8215f29c81abcd5512385e15
executable: 13e777b0482d374e1ae14dcd7be6711eb6464868
status: owned-input correctness repair; independent exact-head code review pending
---

# Capture checkpoint bytes without caller copy methods

The previous checkpoint DATA producer called the input's `slice()` method and read its `length` property. A genuine `Uint8Array` can override both. The [root probe](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-owned-input-p4-f1/inputs/root-byte-ownership-probe.ts) made `slice()` return the original array, called the producer with `{"x":1}`, then changed it to `{"x":2}`. The reproduced [before result](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-owned-input-p4-f1/inputs/root-probe-before.log) committed the later bytes. This violated synchronous owned capture. The predecessor's normal mutation test did not exercise a caller-supplied copy method.

The [repaired producer](../src/protocol/native-checkpoint-producer.ts) captures the genuine typed-array kind and length getters and `Uint8Array#set` when the module loads. It checks the intrinsic Uint8Array brand and actual byte count, refuses capacity overflow before allocating a fresh array, and copies through that captured intrinsic. Caller `slice`, `length`, `byteLength`, buffer/offset, constructor, iterator and toStringTag properties are ignored. Genuine Uint8Array subclasses work without invoking species or overridden copy methods; byte proxies, forged prototypes and other typed-array kinds refuse. This does not promise protection from a compromised JavaScript realm or atomic capture across concurrently changing shared memory.

Each row-array count is read once and must be a nonnegative safe integer, excluding negative zero, before quota arithmetic or row enumeration. Unsafe values cannot poison the aggregate item counter. The existing per-row own-descriptor checks remain. A foreign fault thrown by a caller's row-count getter retains its original identity. Array proxies with a valid count still undergo the same bounded descriptor capture; they gain no permission or proof through it.

## Actual results

The [after result](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-owned-input-p4-f1/inputs/root-probe-after.log) commits the original state CID, `bafyreidhxage47k64gbiv62solpwhzwitjp2xgs3jyjs66kzdksmj7zcxu`, instead of the later CID, `bafyreibg57tynislqmphmpybcdn4ia6qimlffj2s2sjjlcbhk2m73covra`.

All [21 new controls](../tests/support/native-checkpoint-producer-owned-input-corpus.ts) pass in the final [seven-run matrix](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-owned-input-p4-f1/runs.json): source and actual emitted production code on Node 22.19.0, 24.21.0 and 26.10.0, plus actual Chromium 153.0.8010.12. They cover aliasing state, original row and binary bytes; ignored caller fields/methods; subclasses; proxies and forged views; hidden per-payload and aggregate byte sizes; negative, negative-zero, NaN, infinite, fractional, string and null counts; refusal before descriptor enumeration; a count read once; accessor-row refusal; and exact foreign-fault identity.

The original 30 producer cases and exact independent literal, 91 checkpoint DATA cases and 103 outcome cases remain unchanged and pass across the same source/emitted runtimes and actual Chromium. The original byte counters also remain unchanged. `npm run build` and the final `npm run check` pass, including types, formatting, layer rules and installed dependencies. No new dependencies, package exports, profiles, authority creation or transport variant were added. Allocation/copy counters and peak heap remain unmeasured; refusing before allocation is checked through actual intrinsic size and the code's order, not an invented allocator count.

The [checker](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-owned-input-p4-f1/check-packet.py) checks 336 execution inputs, 147 compiled source hashes and 476 output hashes, actual runtime and Chromium bytes, transformed emitted test wrappers, the complete physical private tool graph, and the forced runtime self-check's 194 packages and 14,234 files. The exact pre-fix source/probe inputs and raw result are retained. Final runs pin their inputs and compiler graph at execution time. Exploratory source/browser checks also passed; their raw logs remain and are separate from the fully attributed final matrix.

## Preserved boundaries

The frozen predecessor worktree is unchanged. Its [143-file inventory](../experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-owned-input-p4-f1/predecessor-files.json), dated report, raw matrices, 106 original source-only vectors and historical captures are preserved. In the successor, 142 predecessor files still have the exact original bytes; the one corrected production file is preserved separately as its exact original Git blob. The old checker is historical and was not rerun against the changed producer as though its old hash manifest covered this repair.

The producer remains DATA only. Its optional original payload inventory may omit referenced originals; it does not prove complete retained closure, admit source/state, issue an accepted generation, authenticate publication or restore authority. P4-F3 and the genuine captured-generation owner still owe those joins. Full P3/P4 and their original obligations remain open. The adopted native publication model remains: **The app PDS holding the repository signing key can construct another ordering.** This repair changes byte ownership, not that authority or identity assurance.

Use this successor for independent review and later joins. Root owns workroom publication, atseq-reviewer exact-head review, governed merge and push. No tool approval was requested or rejected.
