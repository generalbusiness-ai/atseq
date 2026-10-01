---
date: 2026-10-01
status: measured successor; independent review pending
request: 4a7a21e824fbd864a25e9e4baeaf7105dc52b720
promise: aeb8063544e179bbb74555356d5c6f5c633af0bc
timed-source: 0be27cc73f01dfe7379f05d31563d52ff0f95a1e
approved-main: 3a40d2c5e230cd7698f9cd4b9e8e9729054be33e
---

# Complete-state cap: results and recommendations

State structure matters substantially within the existing 128 KiB cap. In this
retained run, the seven at-cap action-and-successor kernels had medians from
0.66 to 26.03 ms in Node and 1.3 to 66.1 ms in Chromium. These are actual warm
single-action results for specified fixtures. They supply neither a worst-case
bound nor integrated replay latency. Keep the reviewed complete-state contract
with V0, S1 and checkpoints as the default; these results alone do not justify
adding keyed effects or transactions.

This closes E1-K1's cap-kernel measurement preparation, subject to independent
review. The broader native end-to-end E1 matrix remains open. There are no
runtime, dependency, profile or public API changes. In particular, the 128 KiB
state cap, sample 1,000-row caps, complete-state checks and 64 KiB protocol-block
limit are unchanged.

## Exact source, inputs and method

The [timing manifest](../experiments/post-spike-evidence/2026-10-01/complete-state-cap-timing/manifest.json)
records exact source and fixture hashes, profile CIDs, commands, machine details,
process conditions and all retained captures. The frozen timed source is
`0be27cc7`, based on independently approved main `3a40d2c5` and its actual
147-path dependency graph. The machine is an Apple M5 Max, 18 logical CPUs,
64 GiB memory, arm64 macOS kernel 27.0.0; runtimes are Node 26.10.0 and actual
Chromium 153.0.8010.12. The supported profiles remain `atseq-log-v2`,
`atseq-jsonata-v1` and `atseq-app-v2`, with their full CIDs in the manifest.

The [original preparation](2026-10-01-atseq-complete-state-cap-preparation.md)
retains all input bounds, independently constructed expected values, structural
instrumentation and historical functional flows. The
[current graph preparation](2026-10-01-atseq-complete-state-cap-current-preparation.md)
records unchanged core/sample bytes, all 10,913 original package-file identities,
and fdir's changed optional-peer metadata representation. Those earlier notes
and captures are immutable; their pending-timing labels describe their own
publication state. This is their measured successor.

There are 21 fixtures: scalar, primitive array, row array, wide object, and the
unchanged taskboard, guitar and ledger samples, each at small, near-cap and
at-cap sizes. Generic small states are 4,096 canonical JSON UTF-8 bytes; small
samples have ten rows and 306–552 bytes. Near-cap is exactly 126,976 bytes and
at-cap exactly 131,072 bytes. At-cap primitive arrays hold 16,376 seven-digit
integers; generic row and sample arrays hold 1,000 rows; wide objects have 4,096
explicit declared integer properties. Scalar and row text padding is actual
validated state data. Sample text stays within 120 characters. These are chosen
shapes, not a representative application population or new limits.

Node ran first, then Chromium, sequentially. Each fixture has 13 actual methods,
two warmup calls per method and seven single-call samples: 1,911 timed spans and
546 warmup calls per environment. Method order rotates within each sample.
Each span includes the method and its normal await boundary. Loader admission,
source reconstruction, fixture creation, module loading, browser bundle/fixture
transfer, warmups, instrumentation and output comparison are outside the clock.
All references and structural counters match before and after timing and across
Node, Chromium and the current untimed captures.

The growing fold performs only the final N−1 to N action from a directly
prepared predecessor. Every repetition reuses that predecessor; none measures
preparing it through earlier actions. The generic bounded fold toggles a scalar
while retaining full state; the sample bounded controls repeat an existing ID
and are ineffective. The thirteen independent kernels overlap in work and
cannot be added or subtracted as exclusive replay stages.

## Recorded activity and distributions

Root coordinated a pause of project agents' heavy work. The bounded process
snapshots bracket the runs at 20:44:55–20:48:32 UTC. Before the runs, `ps` reported
a gs reader at 24.1% CPU, WindowServer 22.6% and iTerm2 20.5%. Afterward it reported
an unrelated gs reader at 87.5%, a user Chrome renderer at 40.5% and WindowServer
25.3%. Root had also observed substantial Spotlight indexing before the window;
Spotlight rows are retained in both snapshots. These are `ps` process-accounting
values, not interval utilization measurements or attribution to specific spans.
No user or system process was changed. This was a coordinated project pause on
a noisy machine, and is not a pristine-machine experiment.

Every sample is retained. The following cells show the median and the entire
minimum–maximum range of seven calls. There are no timing gates, discarded
samples, repeat-until-good runs or inferred population percentiles. Chromium's
observed timer increments are coarse for these small calls; recorded zero means
below the clock's observed resolution, not free work. Environment differences
can include runtime, scheduling, JIT and garbage collection. The captures do not
identify which caused a particular delay.

## One action and its admitted successor

`admitSuccessor` validates the action against its actual schema, runs the
supported complete-state fold, then validates the effective successor against
the state schema. It starts with an already admitted owned predecessor, as the
ordinary Folder action path does. It omits identity/signature/proof verification,
ordering, authority, outcomes, persistence and concurrent scheduling; it is not
a timed Folder API or end-to-end submission.

| State at 128 KiB | Node median [minimum–maximum], ms | Chromium median [minimum–maximum], ms |
| --- | ---: | ---: |
| Scalar | 0.66 [0.51–0.80] | 1.3 [1.2–1.9] |
| Primitive array | 22.22 [21.77–22.73] | 19.1 [18.6–21.7] |
| Row array | 18.37 [17.36–18.98] | 47.4 [45.2–61.6] |
| Wide object | 17.16 [16.72–18.52] | 47.0 [32.0–48.3] |
| Taskboard | 19.60 [19.07–21.90] | 50.9 [35.2–60.0] |
| Guitar | 22.19 [21.54–23.21] | 57.4 [42.9–65.0] |
| Ledger | 26.03 [24.38–27.68] | 66.1 [45.0–75.3] |

All generic-small and ten-row sample admission medians were below 1.2 ms in these
runs, but one Chromium taskboard-small sample took 15.6 ms. Near-cap medians
sometimes exceeded at-cap medians; with seven observations under recorded noise,
this does not establish a reversal of scaling. The complete distributions for
all 21 fixtures, rather than a fit or extrapolation, are in the
[statistics](../experiments/post-spike-evidence/2026-10-01/complete-state-cap-timing/statistics.json).

At-cap growing-fold medians, excluding the separate action/successor schema
calls, range from 0.55 to 22.27 ms in Node and 1.1 to 65.1 ms in Chromium. Their
separate state-schema medians range from 0.06 to 4.65 ms and 0.3 to 7.2 ms.
These are independently measured calls, not an attribution obtained by
subtracting their medians. Sample duplicate controls still scan complete state;
their at-cap bounded-fold medians are 6.94–7.76 ms in Node and 10.9–12.6 ms in
Chromium. Ineffective therefore does not mean constant-time.

Equal encoded size clearly does not imply equal observed work. The scalar's
large ASCII string has only 13 canonical token charges, compared with 32,765
for the primitive array. Generic growing evaluation takes only 21–27 evaluator
steps, while inspecting roughly 1 MiB across guards; the samples take
4,020–4,032 steps and inspect approximately 1.3–1.6 MiB. V0's reduced token
encoding is preserved, but traversals and complete-state semantics remain.
The structural preparation names the precise counters; they count actual
observed operations, not heap allocations or every internal traversal.

## Owned query-state capture and validation

`queryCaptureAndValidate` captures an owned full state and runs query parameters,
the supported evaluator and result validation. It is the state portion of
Folder.query and excludes metadata, outcome history, queue coordination and
worker transport. Every at-cap call clones exactly 131,072 bytes once. A small
query result does not remove its full-state input and guards.

| State at 128 KiB | Node median [minimum–maximum], ms | Chromium median [minimum–maximum], ms |
| --- | ---: | ---: |
| Scalar | 0.15 [0.14–0.16] | 0.3 [0.2–1.1] |
| Primitive array | 11.20 [10.95–12.01] | 9.7 [9.5–9.9] |
| Row array | 8.48 [7.62–8.85] | 23.5 [12.3–28.2] |
| Wide object | 6.09 [5.68–6.93] | 13.0 [10.6–28.7] |
| Taskboard | 4.88 [4.53–5.10] | 9.9 [8.4–20.2] |
| Guitar | 10.97 [10.84–11.41] | 32.3 [20.4–34.1] |
| Ledger | 7.62 [6.79–8.35] | 25.6 [12.5–27.3] |

Standalone at-cap structured-clone medians are 0.007–0.59 ms in Node and
0.0–0.5 ms in Chromium; JSON-copy medians are 0.05–1.43 ms and 0.1–2.4 ms.
The wide-object Chromium clone still has a retained 12.4 ms observation, and
row-array JSON copy a 16.4 ms observation. Faster typical cloning is not a proof
that cloning can replace canonical admission or that its occasional delay can
be ignored. S1 already avoids outcome-history copies in routine query/status
paths. These cap kernels measure no many-outcome or persistence behavior and do
not replace S1's separate correctness and clone-work evidence.

## Refused states and the distinct wire boundary

All 27 strict controls still fail as intended: seven 131,073-byte states are
rejected by the canonical guard, fold input and hash-valid source loader
(`value_bytes`), and each unchanged sample separately rejects 1,001 rows and
121-character text (`schema_value`). No beyond-cap state was accepted.

All fourteen near/at-cap states remain legal complete-state values but exceed
the protocol's single-block 64 KiB CBOR limit. Both CBOR encoding and state CID
kernels report `wire_size`: 28 refused operation/fixture pairs, accounting for
196 of the 1,911 timed spans per environment. Statistics label those refusal
paths separately from 1,715 completed spans. Successful small-state encoding/CID
calls are retained too. Refusal duration must not be presented as successful
large-state encoding or hashing. The narrow recording wrapper is inside these
wire clocks; other faults still fail the run.

Diagnostic actual at-cap CBOR lengths are 81,937–131,064 bytes. The raw CID of
canonical JSON retained for output equality is only a diagnostic fingerprint,
not an admitted state/block identity. Existing archive flows store source and
signed history, then replay state; their seven successful cap flows remain
historical `630c4216`/135-graph evidence, not fresh 147-graph archive captures.
The reviewed [checkpoint framing proposal](2026-10-01-atseq-checkpoint-policy-bytes.md)
uses bounded 32 KiB byte chunks and manifests. Its implementation and native
integration remain open; these kernels do not establish that path works.

## Recommendations and remaining gates

1. Keep S0's complete-state A default with landed V0/S1 and the reviewed
   checkpoint direction. The cap bounds each action's state input; P0's roughly
   186 seconds characterized total growing 10,000-action replay, not one action.
   Checkpoints address how many earlier actions must be replayed; they do not
   remove the complete-state work of each newly interpreted action.
2. Complete the existing native authority, framing and checkpoint work, then
   measure the actual E1 submission, worker/query, bootstrap and audit paths.
   Include near/at-cap state, bounded and growing histories, and noisy browser
   distributions. These independent warm kernels supply only the complete-state
   part of that matrix. They cannot predict signing, proof, PDS, storage,
   network, cold loader, receipt or restore costs.
3. Use the retained canonical/schema/evaluator work counts to choose a narrow
   comparison only if a concrete application's measured behavior warrants it.
   Repeated complete walks and owned copies are candidates for investigation,
   not permission to skip checks. Any changed admission or ownership boundary
   needs a separate design, byte-equivalence and failure-case review.
4. Keep S0's keyed-effects option C conditional on an actual application needing
   more than the supported state/row caps and the broader E1 evidence. This
   study establishes legal fixtures and observed cap costs; it does not show
   that a new read/write contract, indexes and transaction atomicity are the
   simplest warranted solution. No effects prototype has been started here.

The source and input hashes, all seven samples per method, exact references,
rejection controls and raw process snapshots are retained. The summary helper
validates sampling order/counts and reference equality without running a timed
method. Build and graph/file-integrity checks passed during the current-graph
preparation; no full suite or new build was run during timing. Independent
review of this measured delivery is still required.
