---
date: 2026-10-01
status: implemented candidate; independent exact-head review pending
request: 05ba889d70eb823c32222216dfcbffe119002d06
validated_source_head: c02662fa0630fb9a2e4d3cf166195bfe1a70e9c5
---

# Preserve typed errors for malformed authoring bytes

Source documents now report `InterpretationError('wire_bytes')` when the pinned
Base64 decoder rejects nonzero trailing bits. They already refused those bytes,
but the upstream plain error bypassed the shared host, client and CLI error
classification. The correction wraps only decoding; valid bytes, size checks,
canonical re-encoding and ordinary definition admission remain unchanged.

This implements the nonblocking B0 assessment `008be622`. It does not change
semantic descriptors, source identities, dependencies, notices or file approvals.
The reviewer's separate file-table order and unused-asset observations are tracked
in NW0; this fix preserves the current exact-byte behavior.

## Regression and validation

At clean regression head `497fb45f9ffc0c929607900d498c63ba6c287760`, the two new
shared cases failed with upstream `invalid base64 string` errors. They exercise
both two-character and three-character unpadded remainders, `AB` and `AAB`.
All eight existing source-document cases still passed. The red capture and
its exact source hashes are retained separately.

At corrected source head `c02662fa0630fb9a2e4d3cf166195bfe1a70e9c5`:

- All 79 targeted tests passed, with no failures, cancellations or skips. They
  cover runtime, packed distribution, document flows and CLI trust.
- The same 69 runtime/source-document cases passed in Node and a real Chromium
  worker, including both typed-error regressions and exact source round trips.
- The installed compiled package passed all 156 conformance cases, including
  both new regressions.
- Task-board, guitar and ledger CLI/host flows and viewless browser participation
  passed. These are valid-document flows; they are not a separate malformed-byte
  HTTP experiment.
- The clean installed build and required repository checks passed.

The worktree includes the approved PB1-R1 and N0 changes from main `4b6ebab5`.
The full repository suite and spike acceptance were not repeated for this local
decoder classification change; the targeted runs above exercise the changed
boundary in source, browser and installed compiled execution.

## Retained evidence

[Validation metadata](../experiments/post-spike-evidence/2026-10-01/authoring-byte-errors/validation.json)
records commands, exit statuses, source and package hashes and capture hashes.
The same directory retains the red regression, complete targeted console log,
Node/Chromium results, compiled package results, document-flow results, build
provenance and build/check logs. Raw console bytes are retained unchanged.
Independent review of the final candidate gates merge and push.
