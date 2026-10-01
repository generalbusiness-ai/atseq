---
date: 2026-10-01
status: untimed Node and Chromium preparation passed; coordinated timing pending
request: 4a7a21e824fbd864a25e9e4baeaf7105dc52b720
promise: aeb8063544e179bbb74555356d5c6f5c633af0bc
basis: 781732f47f02d26332942147bfbe8f4e95526231
structural-source: fb5943354259b57837c0cc3f497d6e0155990a12
functional-source: 630c4216e8ceb0b9705fc4ae414e8671da5e9e71
---

# Complete-state cap: measurement preparation

The existing complete-state contract admits the prepared 128 KiB states in Node
and Chromium. All 21 fixtures pass their supported loader, schema, fold and query
checks with byte-equivalent results. Seven separate current Folder/query/archive
flows also reach and replay an exact 128 KiB state. Timed measurements have not
run. These results establish inputs and measurement obligations, not latency,
capacity, a worst case or a reason to replace complete-state folds.

This is E1-K1 preparation for the cap-based gate in the independently reviewed
S0 options (`notes/2026-10-01-atseq-effects-transaction-options.md`), read at `562e8ed9`
on its separate branch. That source-only note remains a proposal outside this
main basis. The baseline here includes the landed V0 ASCII-token optimization
and S1 selective reads. There are no runtime, dependency, profile or public API
changes. The three supported profile CIDs remain those of main `781732f4`.
The broader native end-to-end E1 matrix remains open.

The [evidence manifest](../experiments/post-spike-evidence/2026-10-01/complete-state-cap/manifest.json)
retains exact source heads, hashes, commands, public fixture bytes and all raw
structural results. Compressed fixture inputs expand byte-for-byte to the
recorded raw hashes. No private signing keys are retained. Historical P0 and V0
captures remain unchanged, including their old source/profile labels.

## Fixture matrix and independent outputs

There are seven families, each with small, near-cap and at-cap states. Near-cap
means exactly 126,976 canonical JSON UTF-8 bytes; at-cap means exactly 131,072.
Generic small fixtures are 4,096 bytes. Small unchanged samples contain ten rows
and use 306, 466 or 552 bytes. Padding is explicit experimental state data or
sample text within the existing field limits; it is not transport whitespace.

| Family | Near/at-cap items | Structure and action |
| --- | ---: | --- |
| Generic scalar | No rows | One large ASCII string and scalar fields; append one character or toggle a scalar. |
| Generic primitive array | 15,864 / 16,376 | Seven-digit integer values; append one integer or toggle a scalar without changing the array. |
| Generic row array | 1,000 | Typed rows with ID, text and integer; append one row or toggle a scalar. |
| Generic wide object | 4,096 | Explicitly declared integer properties; insert the last property or toggle a scalar. Width is a fixture choice, not a new global contract cap. |
| Unchanged taskboard | 1,000 | Add the last retained task; bounded control repeats an existing ID and is ineffective. |
| Unchanged guitar | 1,000 | Add the last candidate; bounded control repeats an existing ID and is ineffective. |
| Unchanged ledger | 1,000 | Add the last entry with alternating positive/negative minor units; bounded control repeats an existing ID and is ineffective. |

Generic definitions use the current supported source format and Lexicon subset.
They do not raise the current sequence, state, source or evaluator limits. The
three samples use their exact main source-document bytes, with their 1,000-row
and 120-character ID/title/description limits. The taskboard completion list is
empty in these fixtures. Ledger balances stay within its existing ±1,000,000
minor-unit bound. No larger ledger or taskboard requirement is inferred.

Each fixture retains its exact CAR, state, directly constructed predecessor,
action payload, expected effective successor, bounded-control outcome and query
value. The expected values come from ordinary fixture construction and arithmetic,
not from accepting the evaluator's own answer as an oracle. The growing kernel
performs one actual final append or insertion from N−1 to N; repeated timing
samples reuse that predecessor. The bounded kernel starts with the prepared full
state. Direct preparation is outside measurement and does not stand for the cost
of replaying a growing prefix to reach that state. No 10,000-action replay is run
or extrapolated here.

Node and actual Chromium 153.0.8010.12 agree on every result, source CID, diagnostic
output fingerprint, evaluator step/inspection count and observed method count.
The 13 operations per fixture cover canonical state admission, JSON copying,
structured cloning, supported CBOR encoding, supported state CID construction,
state schema, action schema, raw growing evaluation, growing fold, bounded fold,
action-plus-successor admission, query evaluation and owned query-state capture
plus query validation. The last is the state portion of Folder.query; it omits
head/frontier metadata, concurrent scheduling and history. It is not a measurement
of that whole API.

## Structural observations, without a clock

Hooks delegate to the actual encoder, official Lexicon validator and clone
methods, then restore them. They collect calls and byte counts without elapsed
time. Evaluator steps and inspected bytes come from the supported evaluator.
A separate direct canonical guard uses its actual charge callback. Shape counts
are fixture facts, not a count of every engine or validator traversal.

At exact 128 KiB:

| Family | Token charges in one canonical walk | Encoding calls in state schema | Bytes encoded in state schema | Growing evaluation steps / inspected bytes |
| --- | ---: | ---: | ---: | ---: |
| Scalar | 13 | 12 | 393,171 | 21 / 1,048,575 |
| Primitive array | 32,765 | 12 | 165 | 22 / 1,048,530 |
| Row array | 14,013 | 15,012 | 348,189 | 21 / 1,039,163 |
| Wide object | 16,397 | 12,300 | 282,597 | 27 / 1,056,829 |
| Taskboard | 10,010 | 12,006 | 375,192 | 4,024 / 1,472,758 |
| Guitar | 14,005 | 15,003 | 360,204 | 4,020 / 1,341,710 |
| Ledger | 14,013 | 15,012 | 364,689 | 4,032 / 1,603,710 |

State schema validation still makes three complete canonical walks and one
official validation call. Every direct canonical walk charges all 131,072 bytes.
V0 avoids encoding known ASCII punctuation and numeric tokens; the primitive
array's 165 encoded bytes therefore do not mean only 165 bytes were traversed.
Rows retain many encoded strings and keys. These counters identify different
work within equal byte caps; they are not heap measurements or speed results.

Owned query-state capture clones exactly 131,072 bytes once for every at-cap
fixture, without an outcome history. Even a scalar result still passes the whole
state through evaluator input ownership and intermediate guards. Generic growing
programs use 21–27 steps despite substantial inspected bytes. Sample duplicate
checks visit their rows. Step count alone is not a wall-time bound.

## Rejected controls and the distinct block limit

All seven 131,073-byte controls are refused by the state canonical guard, by
fold input admission and by the loader when placed in hash-valid initial source:
21 `value_bytes` controls. Sample 1,001-row and 121-character controls are separately
small enough for the state cap and fail their actual schema: six `schema_value`
controls. The preparation accepts no overcap state.

A legal state need not fit one supported protocol block. The protocol's
encodeBlock/contentCid methods still refuse CBOR above 64 KiB. All fourteen
near/at-cap fixtures hit that boundary in both operations: 28 retained
`wire_size` refusals. Their actual maintained CBOR lengths are recorded
separately as diagnostics. Exact at-cap CBOR sizes range from 81,937 to 131,064
bytes. The successful small-state wire kernels and refused large-state kernels
must be reported separately in timing results.

The labelled raw CID of canonical JSON is only an output fingerprint. It is not
an admitted native state/block identity, a policy bypass or a new checkpoint
encoding. The pending checkpoint design separately discusses bounded 32 KiB byte
chunks and manifests. That pending native
path is not implemented or measured by this preparation.

Brief source inspection and seven actual untimed flows establish the current
functional boundary. Each derivative definition replaces only initial-state
bytes with the exact prepared predecessor and has its own recorded source CID.
A real signed current app-chain action reaches the expected 128 KiB state;
Folder.query returns the expected value at frontier 1. Current archive export
and import replay that same state. The archives are 330,104–679,775 bytes. This
archive stores retained source and signed history and derives state again;
it does not serialize state as one protocol CBOR block. No genuine current archive
failure was found at this cap. These are one-action current API probes, not a
native vNext authority/order proof, network trial, worker archive integration or
complete end-to-end E1 result.

## Quiet-window measurement obligations

The runnable harnesses are in [experiments/complete-state-cap](../experiments/complete-state-cap/).
Without an explicit `--measure`, they only prepare fixtures or collect untimed
conformance and structural counts. Timing remains held for root coordination.
The proposed matrix is Node 26.10 followed by Chromium, sequentially: 21 fixtures
× 13 operations × seven single-call samples = 1,911 timed spans per environment.
Each operation has two warmup calls, and operation order rotates across samples.
An initial five-minute reservation is a scheduling allowance, not a measured
latency estimate. Retain every raw sample and report median and spread.

Source reconstruction, fixture creation, admission, hooks, output comparisons,
CAR transfer, module/bundle loading and warmups stay outside timed spans. A normal
await/Promise boundary remains inside each method call. Wire kernels include
only the narrow wrapper that records their expected size refusal. Every fixture
is characterized before and after timing to detect changed outputs or counters.
Keep measurements from each environment separate. Do not add or subtract these
independent operations as exclusive replay stages.

The current source/dependency tree, shared profile CIDs and all fixture/output
hashes must be named in the capture. Record machine/browser/Node details and
coordinated activity limitations. This matrix measures no signing, native proof,
PDS request, checkpoint restore, storage commit, worker transfer or full growing
replay. It supplies no fixed target and no contract decision. Complete-state A
with V0, S1 and checkpoints remains the S0 default until a concrete beyond-cap
application need and actual measurements justify reconsidering effects.

Build and `npm run check` pass. These check-only results do not substitute for
pending timed measurements or independent review of the final delivery.
