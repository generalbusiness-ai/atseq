---
date: 2026-10-01
status: baseline captures complete; integrated check and observer tests passed; independent review pending
request: bdf1e7915251660070440259baf199598de3a061
---

# Performance baseline and optimization choices

Preserve the old implementation as a measured baseline. The evidence supports
two separate changes: retain authenticated history boundaries so warm readers do
not verify the complete prefix again, and offer materialized checkpoints so a
new reader can become useful before a full audit. Growing application state has
another cost: each subsequent complete-state fold still inspects and validates
that state. A checkpoint alone does not remove it.

These are options for different circumstances, not latency targets. The native
ordering and checkpoint implementation is still pending; this note does not
claim that the proposed improvements have shipped.

## Captures and method

The in-memory captures use Node 26.10.0 on macOS 27 arm64, an Apple M5 Max with
18 logical CPUs and 64 GiB RAM. Each combination of 100, 1,000 and 10,000 actions,
one or 16 actors, and bounded or growing state has three samples. Ordinary
desktop processes remain active. There is no CPU affinity, thermal control or
capacity guarantee. Agent builds and tests were held during the retained 10k
growing-state measurement.

Every sample checks the full signed prefix, expected state and frontier, and
absence of a stall. Each fixture records its exact public input SHA-256; capture
metadata names the exact harness Git head and source hash. Captures made before
later harness changes retain their own heads. The fixture inputs retain public
keys and signatures, without private signing keys or account credentials.

The verification stage includes canonical decoding, key checks, signatures and
history checks. At N actions it makes 2N WebCrypto verification calls, 4N key
imports and 2N key exports. The SHA-256 implementation does not use WebCrypto
digest, so a zero digest counter is not a zero hashing cost. The separately
measured entry-CID traversal repeats that work; it is not exclusive attribution
inside verification.

Interpretation runs on that already verified prefix. The observed fold region
includes evaluation, source access, canonical input/output guards and scheduling.
It is not pure evaluator time. Official Lexicon validation is nested within
schema validation; WebCrypto durations and other nested measurements must not
be added as independent parts of wall time. Memory values are process-boundary
observations rather than peaks or isolated per-app requirements.

## Cold verification and interpretation

The following are medians of three samples, in milliseconds. State size is
canonical JSON UTF-8 bytes. The raw captures retain every sample, including outliers.

| Actions | Actors | State | Verification | Interpretation | State validation | Fold region | State bytes |
| ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: |
|100|1|bounded|68.0|16.9|0.7|7.9|34|
|100|1|growing|62.8|34.0|4.6|21.6|325|
|100|16|bounded|63.8|14.8|0.6|6.7|34|
|100|16|growing|63.3|33.5|4.7|21.5|325|
|1000|1|bounded|636.4|153.1|5.8|69.3|35|
|1000|1|growing|627.3|1959.2|426.3|1447.1|3927|
|1000|16|bounded|630.5|150.3|5.7|65.9|35|
|1000|16|growing|611.8|1947.3|422.7|1443.1|3927|
|10000|1|bounded|6051.0|1416.2|56.6|634.5|36|
|10000|1|growing|6149.4|186057.7|43207.3|141460.6|48929|
|10000|16|bounded|6090.3|1413.3|56.6|627.0|36|
|10000|16|growing|6201.1|184299.3|42933.5|139877.6|48929|

At 10k the JSON history is about 11.55 MB in both state variants. Growing-state
interpretation takes about 184–186 seconds in the median samples, versus about
1.4 seconds with bounded state. Growing from 1k to 10k raises interpretation by
about 95 times, consistent with repeatedly traversing growing state. This is
evidence about these fixtures and guards, not a theorem about every app.
One 16-actor growing sample took 260 seconds; the other two took 184 and 181 seconds.
Keep that spread. It does not demonstrate a16-actor penalty.

The independent kernel capture measures validation, evaluation, encoding, CID
hashing, canonical JSON and cloning on the same growing-state shapes. The
evaluator's reported step count stays 18 while inspected bytes grow from 290 to
293,670. A constant evaluator step count therefore does not imply constant
elapsed cost. Kernel timings are independent repetitions and cannot be
subtracted from the whole-fold capture as exclusive components.

At 9,999 retained items, the three-sample kernel medians are 23.8 ms for evaluation,
32.3 ms for the fold, 8.1 ms for input-state validation and 9.7 ms for successor
validation. Canonical JSON takes 2.8 ms, CBOR encoding 2.9 ms, state-CID construction
3.1 ms and structured cloning 0.1 ms. These independent operations include
overlapping work. Their relative sizes support investigating state traversal and
guards before treating copying alone as the dominant growing-state cost.

## Warm reads, storage and activation recovery

The [delta/storage capture](2026-10-01-atseq-performance-dimensions-results.md)
passed 66 samples: 100/1,000/10,000 actions, one/16 actors, and each valid
delta 0/1/100/1,000, with three samples per combination. It primes N−delta entries
outside the clock, then measures actual complete-prefix catch-up separately
from interpretation of an already verified suffix. Every result equals the
complete cold projection; all observed methods are restored.

At 10k, complete-prefix catch-up medians remain 6.18–6.45 seconds across those
deltas, with 2N verification calls. The separate verified interpretation medians
are about 5 ms at delta 0/1, 19 ms at delta 100 and 146 ms at delta 1,000. These are
independent runs, not exclusive components to add together. Even delta 0/1 copies
the complete projection: its 2.21 MB JSON includes accumulated outcomes, despite
the tiny current app state. The observed snapshot clone takes about 5 ms. Retained
verification boundaries need selective outcome storage as well if readers are
to avoid carrying the entire history of results.

Storage kernels distinguish an optional full projection snapshot from the
running host's SQLite writer-lease/head persistence. The present host does not
install the Folder full-projection persistence callback. Do not describe an
optional O(N)-sized snapshot experiment as a write the host performs on each act.
Saving a changed 273-byte lease head took about 0.13–0.17 ms in the separate kernel;
the optional flushed full-projection file took about 6–16 ms. These kernels do
not establish atomicity or throughput of the future materialization store.

A separate authorized activation input tests missing and corrupt source closure,
stall and subsequent recovery. Both cases retain frontier 1 and the old source,
then resume identical entries to the healthy projection. They do not mutate the
measured bounded fixture history or exercise the future identity/grant contract.

## Network, browser and remaining evidence

The [real-PDS capture](../experiments/post-spike-evidence/2026-10-01/performance-observed-results.json)
passed all three sizes. Setup uses signed conditional batches of up to 99 entries
plus the head, outside acknowledgment timing. Each size then has nine actual
single-submit confirmations. These are the old implementation, a real disposable
PDS 0.5.31 with SQLite/file blobs, mock PLC and loopback HTTP. There are no rate
limits or simulated WAN delays.

| Actions | Acknowledgment p50 / p95 ms | Snapshot retrieval and verification ms | Replay ms | Warm delta1 ms | Snapshot requests / response bytes |
| ---: | ---: | ---: | ---: | ---: | ---: |
|100|80.4 /159.6|81.0|82.6|65.0|6 /131531|
|1000|712.6 /1420.4|685.1|768.3|615.6|15 /1306403|
|10000|7672.3 /15342.4|7644.1|7599.2|6216.2|105 /13073096|

Nearest-rank p95 of nine samples is the largest sample; it is not a service
capacity estimate. The initial submit in each size does more cold reconciliation
work: request counts range 8–13, 17–31 and 107–211 respectively. Median received
body bytes per confirmed submit are 128,243, 1,303,109 and 13,069,796. The network
observer records methods and paths without credentials, queries or headers.
It counts decoded application body bytes, excluding HTTP framing, compression
and TLS. Stream counting adds observer overhead. Snapshot retrieval, replay and
warm catch-up each independently verify 2N signatures; these are different API
boundaries, not one exclusive timing decomposition.

The [browser capture](../experiments/post-spike-evidence/2026-10-01/browser-performance-observed-results.json)
passed with Chromium 153.0.8010.12, using those exact network-fixture bytes. One
cold worker per size took 163 ms, 1,346 ms and 14,552 ms for replay plus transfers.
A responsiveness click succeeded in every run; maximum animation gaps were
17.7 ms, 17.5 ms and 71.1 ms. This supports using a worker for interactive readiness,
without claiming that long replay has disappeared.

At 10k an independent echo worker took median 9.4 ms to enqueue the 11.36 MB history
and 42.2 ms for its round trip. The 2.21 MB projection took 1.6 ms to enqueue and 7.8 ms
round trip. Three samples are retained per input; the initial sample also
includes echo-worker startup. Round trips include two clones and scheduling.
They must not be subtracted from replay as exclusive one-way transfer time.
The process-RSS sum after 10k was about 1,557 MiB, including shared pages counted
per Chromium process and memory remaining from earlier sizes. This is neither
retained JavaScript heap nor a per-app minimum.

## Recommendations by reader circumstance

| Circumstance | First implementation choice | Remaining cost or trust |
| --- | --- | --- |
| Warm reader with a verified prefix | Persist the coherent verified boundary and check only authenticated native suffix membership plus the app chain. | Bounded caches and contradiction checks remain mandatory; returning a complete outcome history still costs O(N). |
| New reader that accepts the designated checkpoint authority | Load a materialized checkpoint and required source/authority closure, then verify a suffix. Use the existing native MST proof primitives. | Early state is an authority assertion until audit. A native root proves publication, not execution or global non-equivocation. |
| Reader requiring independent execution from genesis | Retain full-audit mode and its exact inputs; audit in a worker while reporting readiness separately. | Full replay remains linear with bounded state and can approach quadratic with growing complete-state traversal. |
| App whose later actions inspect large state | Characterize schemas, evaluator inspection and output guards on concrete app requirements. | Checkpoints skip previous folds but do not make the next fold cheap. S0 remains an open contract decision. |
| Host that needs stable retry receipts | Retain a complete derived index and selectively retrieve outcomes, rather than placing every result in every reader snapshot. | Prevention/index/receipt storage remains O(N); certification and later audit must disclose completeness assurance. |

Do not add a separate Merkle tree or accumulator from this baseline. P1 already
demonstrates native diff proofs with retained blocks; P2/P3/P4 and E1 will measure
their integrated read, restore and checkpoint paths. Key caching can reduce
repeated key work, but it is subordinate to removing repeated complete-prefix
verification and must preserve canonical encoding, curve and low-S checks.

The raw in-memory evidence is retained at:

- [100/1000 stage capture](../experiments/post-spike-evidence/2026-10-01/performance-stages-instrumented-1000.json).
- [10k bounded stage capture](../experiments/post-spike-evidence/2026-10-01/performance-stages-instrumented-10000-bounded.json).
- [10k growing stage capture](../experiments/post-spike-evidence/2026-10-01/performance-stages-instrumented-10000-growing.json).
- [Independent kernel capture](../experiments/post-spike-evidence/2026-10-01/performance-kernels.json).

[The input manifest](../experiments/post-spike-evidence/2026-10-01/performance-inputs/manifest.json)
retains all 15 exact JSON inputs for the stage/kernel/network/browser captures;
bounded inputs reuse the dimensions archive. The dimensions archive separately
retains both activation CARs and exact source bytes. Capture heads are preserved
in the delivery's Git ancestry, so a fresh checkout can reproduce the historical
baseline without forcing future profiles to accept it.

Earlier `performance-stages.json` remains as pre-instrumentation evidence;
its original input bytes were not retained and its timing figures are not used
for these recommendations. The revised captures and original metadata are
immutable; integrated source changes do not rewrite their heads or hashes.

Integrated `npm run check` and all three observer tests pass. The actual captures
exercise the unchanged runtime, PDS and browser; the dimensions branch also passed
its build/check before integration. No full-suite repeat is claimed for this
benchmark-only delivery. P0 remains open until independent review and landing
are complete.
E1 will compare the implemented
native/checkpoint paths, fault cases and adoption costs. The state requirements
task S0 keeps complete-state versus keyed effects open until that evidence
justifies a contract change.
