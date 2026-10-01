---
date: 2026-10-01
status: measured baseline; independent review pending
category: performance evidence
request: bdf1e7915251660070440259baf199598de3a061
measured_head: a29ae7cb237ecae62d6e6805008e6d3ce18048e4
---

# Warm catch-up, copying and activation evidence

Returning readers already fold only the new actions, but the ordinary catch-up
API still verifies the complete history. At 10,000 entries, even a zero-action
update takes about 6.2 seconds and verifies 20,000 signatures in this capture.
Passing an already verified history avoids those checks; its zero-action update
still copies the retained projection, including accumulated outcomes.

This is baseline evidence for the
[verification and bootstrap design](2026-10-01-atseq-verification-and-bootstrap.md),
not an implemented incremental verifier or checkpoint format. The user has set
no fixed performance targets. These results identify costs and decision points.

## Scope and retained evidence

The script ran once in a reserved quiet window, on a clean tracked worktree at
`a29ae7cb237ecae62d6e6805008e6d3ce18048e4`, using Node v26.10.0 on an
Apple M5 Max, macOS Darwin 27.0.0, with 18 logical CPUs and 64 GiB memory.
The raw capture records the exact runtime, hardware and source hashes.

It used the six already retained public bounded-state fixtures: 100, 1,000 and
10,000 entries with one or sixteen actors. Their signed histories and source
CARs were copied unchanged; no new bounded histories were generated. Each valid
combination of those inputs and deltas 0, 1, 100 and 1,000 ran three times:
22 cases and 66 samples. A delta larger than the complete input was excluded.

A separate, tiny public signed fixture tests an authorized definition activation.
It was generated once outside timing and retained without private keys. It does
not extend or replace the bounded fixtures.

Retained files:

- [Raw results](../experiments/post-spike-evidence/2026-10-01/performance-dimensions/results.json), SHA-256 `421ca6aa826c3e76abfd818f677dc78780f9e8b9c88367a371ac066cec8a9e6e`.
- [Archive manifest](../experiments/post-spike-evidence/2026-10-01/performance-dimensions/manifest.json), SHA-256 `95703425b8077ff08773cb532c06818451e4c85b36bee616bb3ac21f5aa9466f`.
- The manifest lists every retained public fixture, source CAR and raw console
  capture with its size and SHA-256. Each compressed bounded input was expanded
  and compared byte-for-byte with the original copied fixture before archiving.

## Measurements

Values below are medians of three samples, in milliseconds. Full catch-up calls
`Folder.catchUp` with the complete unverified input. Verified interpretation
calls `Folder.catchUpVerified` on a separate prepared folder with an already
verified full history. These are separate API measurements, not stages to add
or subtract. Prefix verification and folding, source loading and the cold
correctness reference are preparation outside each timed update.

| Entries | Actors | Delta | Full catch-up | Verified interpretation | Signature checks |
|---:|---:|---:|---:|---:|---:|
| 100 | 1 | 0 | 68.35 | 0.135 | 200 |
| 100 | 1 | 1 | 64.81 | 0.245 | 200 |
| 100 | 1 | 100 | 77.04 | 14.42 | 200 |
| 1,000 | 1 | 0 | 627.23 | 0.502 | 2,000 |
| 1,000 | 1 | 1 | 621.87 | 0.680 | 2,000 |
| 1,000 | 1 | 100 | 648.81 | 14.79 | 2,000 |
| 1,000 | 1 | 1,000 | 759.28 | 144.55 | 2,000 |
| 10,000 | 1 | 0 | 6,245.80 | 5.00 | 20,000 |
| 10,000 | 1 | 1 | 6,248.19 | 5.04 | 20,000 |
| 10,000 | 1 | 100 | 6,417.22 | 19.23 | 20,000 |
| 10,000 | 1 | 1,000 | 6,453.74 | 145.90 | 20,000 |
| 10,000 | 16 | 0 | 6,209.11 | 4.89 | 20,000 |
| 10,000 | 16 | 1 | 6,299.35 | 4.95 | 20,000 |
| 10,000 | 16 | 100 | 6,182.37 | 18.99 | 20,000 |
| 10,000 | 16 | 1,000 | 6,338.44 | 146.18 | 20,000 |

All full catch-up samples performed exactly 2N signature verifications, 4N key
imports and 2N key exports. Verified interpretation performed none of these
crypto operations. Both paths performed exactly delta action validations,
state validations and successful ordinary fold regions. The raw capture also
contains the smaller sixteen-actor cases. This small, sequentially sampled
matrix does not establish an actor-count effect or capacity limit.

Copy and storage kernels ran independently after each sample. They are not
additive components of replay. The following are medians for one-actor inputs
and delta one:

| Entries | Owned projection JSON bytes | Snapshot copy | JSON encoding | Optional flushed projection file | Actual SQLite lease-head save |
|---:|---:|---:|---:|---:|---:|
| 100 | 22,292 | 0.055 | 0.010 | 4.31 | 0.135 |
| 1,000 | 220,295 | 0.477 | 0.077 | 5.07 | 0.145 |
| 10,000 | 2,209,298 | 5.19 | 0.729 | 7.61 | 0.167 |

The application state remains bounded in these inputs. Its outcome history
still grows with N, so copying the complete projection has O(N) work.
Consequently verified interpretation is not strictly O(delta) in wall time:
delta zero and one still take about 5 ms at 10,000 entries to copy the retained
projection, even though only the delta is interpreted. The owned-projection clone, JSON encoding and flushed file write measure
an optional persistence approach: the current host supplies Folder no
projection-persistence callback. They are not existing durable-checkpoint work.

The actual SQLite lease stores only the head: 271, 272 and 273 JSON bytes for
these inputs. Delta-positive samples save a changed head after first saving
the floor; delta zero rewrites the same head. Every saved head and optional
projection file was read back and compared with its expected value. A lease
head is a rollback floor, not a saved interpreted state or outcome history.

## Correctness and activation

Every warm sample matched its cold reference in complete state, outcomes,
active definition and frontier, without a stall. Each cold bounded state was
also checked against its expected final selection. Observer installation and
restoration were checked around every nested observation, including the
original own-property descriptors for WebCrypto methods, structuredClone,
Schemas.validate and Lexicons.validate.

For the tiny activation fixture, unavailable next-definition evidence stalls
at position two with `content_unavailable`; corrupted bytes stall at the same
position with `content_corrupt`. Both retain the old definition, frontier one
and the single prior outcome. Supplying the original source bytes and retrying
the identical signed entries produces the same complete projection as healthy
replay. The fixture, both source CARs and these observations are retained.

The successful ordinary-fold observer follows the initially active schema.
Its activation and stalled-path calls cannot support complete action/fold
attribution across definition changes. The activation results are correctness
evidence; no fold count or performance recommendation is inferred from them.

## Recommendations and limits

Prioritize retaining verified history and authenticating a suffix from its
exact floor. Delta-only interpretation already works; repeated complete-prefix
verification masks that advantage. The prototype must preserve chain, retry,
rollback and provenance checks when it stops rechecking the prefix. These
measurements do not show that implementation or establish the trust required
for restoring a serialized verified state.

After that change, profile projection copying separately. Even delta zero
copies accumulated outcomes, while state is small. A materialization design
should state which history/index/outcome data it retains and copies, and which
parts can be shared or loaded separately. It should not infer a full-state
persistence cost from the constant-size lease-head write. Growing-state folds
need their own measurements: a checkpoint cannot remove the next fold's cost.

Timed API calls include observer instrumentation and its restoration checks.
The raw observer spans are inclusive and may be nested. Summed crypto spans
are not exclusive attribution. Boundary RSS and heap readings are not peak
memory. Three repeats on one machine provide a useful baseline, not a general
performance guarantee. Network retrieval and browser transfer are measured in
separate parent-owned captures, not by this script.

## Reproduction and validation

At the measured head, install its locked root dependencies. Expand the six
retained `public-inputs/bounded-*.json.gz` files into
`experiments/generated/performance-dimensions/fixtures/`, preserving their
base filenames without `.gz`, and copy retained `activation.json` into that
same directory. Run:

`node scripts/source-run.mjs scripts/performance-dimensions.ts`

The script verifies the public signatures and content identities, archives the
exact input bytes, and checks all sample invariants described above. The input
source CARs are also independently retained. It neither needs nor reconstructs
the signing keys. Run in a quiet window; default matrix preparation and capture
take several minutes.

The full capture exited zero, with all 66 samples and both activation cases
present. No runtime, dependency, wire-format or persistence implementation was
changed. After the reserved performance window ended, `npm run build` and
`npm run check` passed. The latter covers TypeScript, formatting, source
layer checks and installed dependency provenance. No full-suite repeat was
needed for this script-only delivery; its measured run executes the focused
correctness checks described above.
