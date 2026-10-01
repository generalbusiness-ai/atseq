---
date: 2026-10-01
status: proposed; independent API and identity review pending
category: native proof resource policy
request: d22a606dcd584df143acda4523c2dcae0e03b1bc
examined_head: 3cdf0b0747336b201fbecb2f414a25957b3a8dda
---

# Resource limits are not invalid native history

An honest repository can exceed a reader's memory or traversal budget. The
reader then cannot establish its result. It must not declare that history
invalid, prove a record absent, or advance a verified frontier using the
unfinished proof.

Add one host-only error code, `native_proof_limit`, with the existing
`transient` kind. Throw it through the existing `ProtocolError` class. Preserve
all current proof validation and the existing found, absent and missing result
shapes. No new error class, error kind or result union is needed.

This proposal addresses the nonblocking finding in the independently approved
P1 assessment `58fb6809fdf153b12973afab0309868b87ec1a80`, before P2 or I1
classifies native proof failures. The
[native proof results](2026-10-01-atseq-native-proof-results.md) document the
landed foundation. This note proposes an API decision; it does not implement it.

## Evidence in the landed code

The source was inspected at the revision above. Tests were not run for this
source-only proposal.

| Source | Current behavior |
|---|---|
| `src/protocol/native-proof.ts` | Labels the native proof and cache bounds as resource budgets, not wire or ATproto maxima; currently throws `ProtocolError(input)` for budget excess |
| `src/core/errors.ts` | Defines `invalid_input`, `transient` and `runtime_fault`; already separates host-only codes from interpretation codes |
| `src/host/errors.ts` | Treats `input` as a final bad request, with HTTP 400 and `permanent: true`; transient AtseqErrors retain HTTP 503, `Unavailable` and `permanent: false` |
| `src/core/contracts.ts` | Includes only `interpretationErrorTags` in the semantic descriptors, not the host-only code table |
| `src/protocol/wire.ts` | The shared framing parser currently reports nesting excess as `wire_depth`, an invalid-input code |
| `tests/support/native-proof-corpus.ts` | Exercises actual native byte, count, traversal and cache limits, but currently expects the same invalid-input class as hostile structure |
| `tests/native-proof.test.ts`, `tests/native-proof-browser.test.ts` | Run the shared corpus in Node and real Chromium; browser execution also checks shared Node-produced signing fixtures |

Reusing `input` would keep the ambiguity reported by the reviewer. Reusing
`content_unavailable` would hide that a local resource policy stopped the proof,
rather than a source failing to provide evidence. The existing interpretation
budget codes express deterministic fold semantics and would be the wrong
boundary for a native repository reader. One precise host-only code is smaller
than introducing a separate resource error hierarchy or a new union case in
all native result types.

## Proposed public boundary

Add `native_proof_limit: 'transient'` to `HOST_ERRORS` in `src/core/errors.ts`.
Native proof resource guards throw
`new ProtocolError('native_proof_limit', message)`. The stable code and kind
provide the typed distinction; consumers must not use `instanceof ProtocolError`
alone as an invalid-history verdict. Messages identify the exhausted budget for
operators, but are not a machine-readable contract. No additional structured
budget payload is required for this first change.

The existing native error adapter preserves transient AtseqErrors, so the new
code survives authentication, lookup and full-tree validation. Existing
`hostFailure` behavior provides the intended public response without a broad
host refactor:

- HTTP 503; `error: 'Unavailable'`.
- `code: 'native_proof_limit'`; `permanent: false`.
- The error establishes neither proof validity nor invalidity. The caller
  retains its last independently established state and frontier.

Here `transient` means the result remains unavailable and may be established
later. Retrying identical work under the same budget will usually fail again.
Recovery can use a larger authorized local budget, another adequately resourced
reader, or a smaller equivalent proof/delivery where available. Consumers must
not remove bounds or repeatedly retry without a change in circumstances.
A resource error is not permission to trust an unchecked checkpoint or proof.

Existing PDS snapshot/append limits retain their current behavior. They belong
to different APIs and are not renamed by this work.

## Which checks change

Every native local resource budget needs the same code. Keep their configured
values and accounting unchanged.

| Budget | Resource exhaustion |
|---|---|
| `carBytes` | Supplied CAR bytes exceed the selected byte budget |
| `headerBytes` | A well-framed declared header extends beyond the local header-size budget |
| `carBlocks` | CAR iteration reaches more blocks than allowed |
| `blockBytes` | A staged or subsequently read native block exceeds the allowed bytes |
| `nodeEntries` | An otherwise shaped MST node has more entries than allowed |
| `pathLoads` | Lookup node-load accounting or the current walker-depth guard exceeds its selected bound |
| `treeLoads` | Full-tree validation exceeds its node-load budget |
| `pathCharacters` | A string lookup path exceeds the selected local character budget |
| `depth` | Native CAR-header or native-block framing inspection reaches beyond the configured nesting budget |
| Cache `bytes`, `blocks` | One authenticated CAR cannot be admitted within the retained cache policy |

Split guards that currently combine malformed input and policy exhaustion:
wrong CAR byte type is input; unsafe, zero or truncated CAR header lengths are
input; wrong MST node shape is input; wrong lookup path type is input. Only the
separate resource comparison produces `native_proof_limit`.

Check a declared header against the available bytes before classifying its
local size budget. A truncated oversized declaration must remain a malformed
CAR, rather than masquerading as an honest large header. Split block count
from block size for clear messages; split node shape from node-entry count.

Translate `wire_depth` only at the two native uses of the framing parser,
through a small private native wrapper. Native nesting is controlled by the
local `depth` option. Leave `validateCborFraming`, `decodeBlock`, Atseq wire
bounds and their normative invalid-input behavior unchanged. Other framing
failures continue through the existing invalid-input adapter.

A budget may stop inspection before a later malformed field or invalid
signature can be checked. The resource result therefore means validity was
not established; it does not certify that the whole input is honest. No new
unbounded preflight should try to prove every structural property before
honoring a budget. Structural faults already observed within the permitted
work remain invalid input. Avoid letting catch cleanup replace an already
observed failure with a second resource failure when preserving the original
error is possible.

## Boundaries that remain distinct

Invalid signatures, root/DID/CID mismatches, malformed or noncanonical CBOR/CAR,
invalid MST keys and structure, overlapping child ranges, and noncanonical
empty children retain `ProtocolError(input)` with `kind: 'invalid_input'`.
Unexpected runtime failures retain their identity. The native resource error
must not be swallowed or reclassified by the pinned-reader error adapter.

Sparse lookup still returns `missing` when a required retained block or record
is unavailable. LRU eviction can produce missing evidence, never absence.
An authenticated, sufficiently evidenced search can still return `absent`;
a complete tree can still return `complete`. Resource exhaustion produces none
of those conclusions. A selected commit missing from the supplied CAR retains
the foundation's existing authentication failure; this proposal does not
change the required authentication envelope.

Unknown budget option names, zero, negative, fractional, nonfinite or unsafe
integer bound values are caller misuse and remain `ProtocolError(input)`.
They are invalid configuration, not evidence that repository history is
invalid. P2/I1 must keep their own configuration errors outside the branch that
judges hostile signed proof data. No automatic configuration adjustment is
introduced. A valid but restrictive positive budget is policy, so exceeding it
is the resource code rather than caller misuse.

## Identity and implementation scope

The semantic interpretation contract does not change. Add the new code only
to the host-only table. Do not add it to `INTERPRETATION_ERRORS`, change the
normative Atseq wire bounds, edit semantic descriptors, or regenerate profile
identity vectors. `interpretationCode` must continue rejecting host-only errors
instead of recording them as replicated fold outcomes.

Conformance should demonstrate unchanged log, evaluator and application
profile CIDs using the existing independent vectors. Implementation source and
build provenance change as usual; they remain separate from semantic identity.
Native resource values remain local policy, with the same defaults and option
shapes. Dependencies and lockfiles need no change.

## Validation after adoption

Extend the existing shared native corpus so Node and Chromium both assert the
resource code and kind for every listed budget. Use actual signed canonical
fixtures under deliberately restrictive positive limits, then show that the
same proof succeeds under sufficient bounds. Add node-entry, path-character,
native depth and cache-byte/count controls where current coverage is missing.

Keep the hostile structural/signature/canonicality cases asserting the
invalid-input boundary. Add malformed type, truncated oversized-header and
caller-bound misuse controls so splitting guards cannot turn them into policy
errors. Retain missing versus absent, cache non-eviction on failed admission,
copy ownership, and genuine runtime fault controls.

Use focused host tests to verify that the real `hostFailure` maps the new error
to 503/nonpermanent and keeps invalid request errors distinct. Verify that the
new host-only code cannot become an interpretation outcome, and that the
existing profile CID vectors are unchanged. Run the native corpus in Node and
real Chromium, required repository checks and the appropriate broader tests;
retain dated raw results and record the exact validated source head.

Independent review of this API/identity decision must precede implementation.
An adopted direction will then receive a separate exact-head implementation
review under PB1 before the parent merges or pushes it.
