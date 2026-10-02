# E1 native fixture preparation — 2026-10-02

E1-F1 now provides genuine signed native fixtures and independent workload
oracles for later performance measurements. Six representative histories at
100, 1,000 and 10,000 ordered entries pass cryptographic, chain and complete-tree
checks within the existing limits. This delivery measures preparation work and
checks correctness. Full E1 reader, host, persistence, checkpoint, audit,
provider and offline measurements remain open.

The tracked request is `443018dc14130da954873a507b7a0ba503706379`, with promise
`a5380c898ad8a6e425e74c27a3aafdf1baadaee3`, under full E1 request
`8eec1d657cdffa2edaeafb28294797c56e605dfc` and promise
`621d4cea355cd3249d39b9184b981af61ae70f83`. The basis is
`7de9dcd447658679f3a94866c7f0eb5506c63659`; actual final fixture generation and
conformance source is `dd2f97bd710c88fa5c3f629f8efa6f00f837e5b1`.

## Workload and matrix

`N` is the final ordered-entry count, including grant admissions and activation.
For a valid update cell, `base = N - delta`, `target = N`, and `delta <= N`.
The matrix records all requested N and delta combinations, including the
explicitly invalid N=100/delta=1,000 cell. There are eleven valid cells. This
convention does not use N as the number of actions before an update.

Each N has two generated scenarios:

- One actor, bounded counter state, no activation, all actions effective.
- Sixteen actors, growing numeric-array state, one activation, and one signed
  action with an invalid payload. Activation doubles subsequent action amounts;
  the invalid action has a framework `invalid_action` outcome and leaves state
  unchanged.

The generator supports both actor counts, both state forms, optional activation
and the explicit invalid-action plan. These six captures are representative
cases, not a claim that every combination was generated. The matrix and oracle
checks also cover both actor counts and activation choices at every N.

The independent oracle uses ordinary TypeScript arithmetic and collection
operations. It does not use evaluator or NativeApplication output to compute
expected state, outcomes or admitted actors. Actual request contents are checked
against the deterministic plan. Small native replay checks every intermediate
state and outcome, final source, grant facts, frontier and query. Hand-calculated
N=100 final counts are 540 and 666. An altered stored expectation is rejected.

## Genuine construction and retained volume

One installed `@atcute/mst` NodeStore/NodeWrangler updates the application MST
incrementally. Only selected roots are signed; NodeWalker `nodeCids()` and
`entries()` collect their reachable blocks. Blocks are deduplicated by CID;
intermediate unreferenced nodes are discarded at selected roots and powers of
two. Full CARs are constructed on demand for selected roots, rather than stored
for every entry. The fixture stores no per-entry application snapshots.

Signer nonces are actual 16-byte values with a fixed experiment namespace and
an injective integer encoding. They do not use a repeated fill byte. Keys are
created during preparation and excluded from the serialized public fixture.
DID PLC logs, device signatures, participant repository proofs, application
commits, source closures and MST records are real cryptographic inputs. The
identities and example endpoints are local fixtures; no live directory, PDS
account or provider trial is claimed.

The final generation used Node 26.10.0 on macOS arm64, M5 Max, 18 CPUs and
64 GiB RAM. These single preparation observations include key creation,
signing, source admission, oracle construction and public fixture-array
construction. Outer JSON/gzip serialization and independent validation are
separate. They are not controlled reader timings or evidence for a latency
threshold, speedup or asymptotic runtime claim.

| Ordered entries | Scenario | Domain actions | Preparation ms | Retained app block bytes | App blocks | Largest selected CAR bytes | Final state bytes |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | Bounded, one actor | 99 | 555.14 | 120,039 | 174 | 113,634 | 34 |
| 100 | Growing, sixteen actors, activation | 83 | 83.60 | 201,431 | 275 | 197,621 | 237 |
| 1,000 | Bounded, one actor | 999 | 712.61 | 1,024,753 | 1,356 | 1,055,623 | 35 |
| 1,000 | Growing, sixteen actors, activation | 983 | 657.64 | 1,102,707 | 1,431 | 1,138,615 | 2,353 |
| 10,000 | Bounded, one actor | 9,999 | 7,223.33 | 9,975,956 | 12,717 | 10,436,998 | 36 |
| 10,000 | Growing, sixteen actors, activation | 9,983 | 7,382.14 | 10,075,275 | 12,905 | 10,536,633 | 23,504 |

Retained app block totals include the selected hostile roots and participant
proof/identity byte manifests published as content records. Source bytes and
retained-content bytes are reported separately in raw captures; retained
content also appears in the app block total and must not be added twice.
App record writes, one hostile-tail deletion, app signed commits, participant
record writes/commits, identity signed operations, signed requests, discarded
blocks and maximum working app block count have separate counters. Maximum
working block count is not peak process memory.

All selected CARs fit the unchanged 32 MiB proof budget; both domain states fit
the unchanged 128 KiB state contract. This says nothing about native database
row expansion, transaction fit, installed storage overhead or a 128 KiB state
benchmark. Random key/genesis data can change MST shape; later comparisons
should use the same retained signed bytes.

## Actual checks

Final Node 22.19.0, 24.21.0 and 26.10.0 runs each pass four experiment tests using
the same two captured N=100 fixtures. Actual Chromium 153.0.8010.12 passes the
portable validation and replay corpus and matches Node exactly. The two native
projection digests are identical across all three Node versions and Chromium:

- `f196f3a2343aa29cccc160a29576fcbd1e8ff2e46629c994c55812cf0d38e640`
- `ff59bc688d9d748a404bb334917131e082271db4b78bc7326f2baa203b09874c`

Final preparation verifies all 22,200 healthy chain entries, actual signatures
and healthy uniqueness, plus all 42 selected application roots/complete MSTs.
The complete trees include exact genesis/head membership. Preparation and
verification are outside later reader timings.

The optional `r1-check.ts` validates against the unchanged R1 candidate
`5bb836a0522bd075cff513d4aaf4766bcbea5b97`. It uses that checkout's own genuine
anchor, identity binding, authenticated repository and prefix interfaces;
it does not pass capabilities minted by another module instance. All 22 valid
warm cells pass exact stage-counter checks, including delta=0/1/100/1,000.
Preacceptance index writes are zero; accepted writes are two per new entry.
Expected signatures count signed actions/control entries separately from
account admissions. The older fixed view retains its original inventory.

Eighteen genuine duplicate-request, actor-nonce-conflict and same-height-fork
publications are rejected without changing accepted inventory or the original
stored signed request/receipt bytes. These are publication-prefix checks.
They neither perform an actual local persistence transaction nor implement a
native host writer. Missing admission evidence, genesis source and activation
source are explicit retained reader-fault plans, not executed recovery or
independent-audit measurements in this delivery.

The final production build, format check, layer check and dependency check
pass. A temporary proposed-H4 compiler configuration excludes only
`experiments/post-spike-evidence`; its actual compiler list is identical on all
three Node versions, includes every new E1 experiment/test input, and has 276
live src/scripts/tests/experiments compiler inputs (257 `.ts`, four `.mts` and
fifteen imported `.json`). This is not a normal `npm run check` pass. On the 7de
basis, normal check still exits 1 with the same 74 frozen-official-excerpt
diagnostics tracked by T1-H4. Normal check after reviewed H4 integration and
actual pushed-main CI remain required merge gates. No ordinary local full
suite was repeated for this experiment-only change.

## Preserved attempts

The evidence retains the initial type/API diagnostics and fixture source, the
first growing-source failure caused by raw CBOR wrapper symbols, and the
complete draft trial with all six generated fixtures. That draft trial failed
validation at N=10,000 because the experiment compared an aggregate plan with
the protocol's default 256 KiB canonical-value bound. The corrected validator
compares plan and outcome rows individually. This was a validation-harness
error, not a genuine native proof/state refusal; no accepted bound was raised.
Recovered validation of the exact draft 10,000-entry growing fixture is also
retained. An initial manifest input-count assertion classified only `.ts`
files; its failure and script are retained, and the corrected count includes
all inherited H4 live compiler inputs. Draft source copies identify the uncommitted working inputs; their
recorded repository HEAD was the basis and is not presented as their source
freeze. Final generation reports a clean working tree at dd2f97bd.

## Reproduction and remaining E1 work

In an independently installed checkout, build first, then run:

```sh
npm run build
node scripts/source-run.mjs experiments/e1-native/run.ts .atseq-local/e1-fixtures
ATSEQ_E1_FIXTURE_DIRECTORY=.atseq-local/e1-fixtures node scripts/source-run.mjs --test tests/e1-fixture.test.ts tests/e1-fixture-browser.test.ts
```

Fresh generation creates new keys and signed fixture bytes. Reproduce exact
published checks by decompressing the six retained final fixtures into an
ignored directory and supplying that directory to the tests. The optional R1
check requires the exact R1 checkout named above. It is a separately pinned
validation interface and is not a dependency of ordinary project tests.

Use these fixtures for the next joined measurements, preserving distinct
root/I1/source/history authentication, interpretation, copies, storage and
transport stages. Keep N/base/target and action/ordered-entry counts explicit.
A selected-root CAR reconstruction is preparation, not a network observation.
The retained S0 runner remains an already-verified engine/domain baseline;
do not compare its narrow clock with native end-to-end time as a speedup.

Full E1 still owes cold/warm/restart/checkpoint/audit browser+Node measurements,
actual host single/batched publication, actual SQLite/IndexedDB generations and
restore, fixed-target independent checkpoint audit and readiness, provider
setup/resources/recovery, network variations, credentials-deleted offline
comparison, recommendations and residual limits. The current projection
persistence callback is not actual durable materialization. Generic raw storage
allows 1,000 row changes; the pending native installation clarification proposes
100,000 cold changes. Neither implies that 1,000 warm actions or 10,000 native
entries fit an actual native transaction. P3 must establish real row expansion
and IO policy before those measurements.

Evidence and byte pins are in
[the manifest](../experiments/post-spike-evidence/2026-10-02/e1-fixture-preparation/manifest.json).
Independent exact-head review, reviewed H4 integration and pushed-main CI are
still required; this note does not close full E1.
