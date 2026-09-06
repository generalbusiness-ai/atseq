# Local PDS host

S2 adds one local writer per application, two transport XRPC methods and exact
source retention. Application definitions are still opaque source objects in
this stage. S3 adds interpretation; S4 adds provisioning and interaction flows.

## Reproduce

Use Node 22.13 or later; the measured run uses 26.8.1. The local lease uses
[`node:sqlite`](https://nodejs.org/api/sqlite.html), available without an
experimental flag from 22.13. A native compiler may be needed for the official
PDS's SQLite package if that platform has no prebuilt binary.

```sh
npm ci
npm ci --prefix experiments/pds
npx playwright install chromium
npm run check
npm test
```

`npm test` includes the PDS gate. Use `npm run test:pds` to run just that gate.

The PDS gate starts the unmodified official `@atproto/pds` 0.5.31 with its real
HTTP APIs, repository storage and SQLite transactions. The local PLC uses the
official server with its in-memory test database, following the upstream
[development environment](https://github.com/bluesky-social/atproto/tree/main/packages/dev-env).
The test's PDS restarts preserve disk data while PLC stays alive. This does not
test a public PLC service, federation or PDS account migration.

Docker is not required. Missing packages or startup failure fail the gate;
there is no availability skip. Each run owns a new `.atseq-local/pds-*`
directory, marked with `ATSEQ_DISPOSABLE_PDS.json`, and a new `atseq-*.test`
account. Both services bind to loopback. Secrets stay in ignored files with
mode 0600 and are excluded from evidence. Tests remove the writer key/token file
on normal cleanup and leave the stopped PDS directory for inspection.
`resetDisposable` in `experiments/pds/environment.mjs` accepts
only a marked directory directly under this checkout's `.atseq-local`, refuses
a running PDS, and accepts no remote URL or account. Close the test host first.

## Append and receipt

`provisionLog` writes genesis and head together and refuses to replace an
existing log. `Sequencer` acquires a local
SQLite exclusive lock and retains the last verified head in the same database.
This is an operational cache and process lease; application authors write no
SQL. Process death releases the kernel lock. The lease is local to one machine
and directory; it is not distributed failover or protection against copying
the sequencer private key to another host.

For each signed submission the writer reads and verifies a complete PDS
snapshot, checks retained retry identity, then conditionally writes one entry
and its head in a single `applyWrites` batch with `swapCommit`. A repository
commit reply must contain a valid CID and a nonempty revision. Provisioning and
append call an API that requires a valid swap CID at runtime; missing data
cannot silently turn either operation into an unconditional write. A repository
conflict or uncertain write response triggers reconciliation. A receipt is
returned only after observing the signed entry in verified persistent history.
Retrying the same unsigned content returns its original receipt, including
when a different valid signature represents that content. Reusing its nonce
for different content fails.

`startSequencerService` exposes loopback `test.atseq.submit` and
`test.atseq.receipt`, using the S1 Lexicons for inputs and outputs. It verifies
the app and genesis on receipt queries. S2 always reports `frontier: null` and
receipt lookup reports a pending outcome: ordering does not establish domain
effect. Unknown receipts return `Unavailable` with HTTP 404. Service and
transport uncertainty return HTTP 503; callers must retain the original signed
intent. Cross-origin access is not enabled. S4 will provide the shared UI and
agent transport and its explicit signing flow.

`readSnapshot` brackets reads with repository commit checks, verifies record
CIDs and the full position/predecessor chain, and rejects rollback or a changed
retained prefix. It follows actual PDS pagination but orders by signed position.
It requires no live notification to catch up. It does not verify the PDS's
repository CAR signature itself: its trust anchor is the pinned genesis plus
actor and sequencer proofs. PDS transport uses HTTPS except on loopback.

## Source retention

The authored [`test.atseq.source` Lexicon](../lexicons/test/atseq/source.json)
stores a content CID and an ordinary atproto blob reference. The record key is
the content CID. Source files use raw CIDs; canonical CBOR objects use their
CBOR CIDs and are stored as blob bytes. Reads verify the retention record CID,
Lexicon shape, raw blob hash and size, then the requested content CID. CBOR
objects also pass canonical wire verification. No remote URL discovery occurs.

The actual repository CAR includes source retention records, not the blobs.
Export must fetch and verify every source blob separately. Deleting the last
retention record can remove its blob immediately; restoring only the old
record then fails with `BlobNotFound`. Source repair is manual in S2.
`SourceStore.put` creates missing retention records but refuses an existing
record whose reference or blob is corrupt or unavailable. The tests act as an
operator: they upload retained bytes and restore references with standard PDS
APIs, or restore deliberately corrupted physical fixture files. The host does
not perform that repair automatically. Source closure and an archive format
remain S3 and S6 respectively.

## Bounds and limits

The host limits one response to 8 MiB for JSON, 512 KiB for source blobs and
128 MiB for a CAR. Snapshot listing stops at 20,000 records per collection and
rejects repeated cursors. Network calls time out after 15 seconds; a changing
repository or uncertain append has at most eight reconciliation attempts.
These are host operational limits, not new application schema contracts.

Every append currently reverifies the full history. This favors an inspectable
correctness baseline but gives quadratic total work over repeated growth. The
111-entry pagination fixture is not a throughput benchmark. S6 must measure
the planned larger replay cases before any performance claim.

The official PDS/PLC test packages have their own lockfile and are not Atseq
runtime dependencies. At this run, `npm audit` reports 11 vulnerable packages
in that isolated graph (8 high, 3 moderate); the root graph reports zero. The
test configuration has no SMTP delivery, MySQL database or public listener.
This is a disposable integration environment, not a deployment recipe. Its
unmodified upstream packages remain pinned so results can be reproduced.
`@atcute/car` 6.0.2, added to the root package for standard CAR reading, uses
the BSD Zero Clause license.
