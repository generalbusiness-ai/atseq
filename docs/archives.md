# Retain and rebuild an application

**Download app and verified history** creates a `.atseq.json` copy through the
last completely interpreted entry. It includes the pinned genesis, signed entry
prefix and chosen head; initial and relevant candidate source CARs; verified
source inventory; exact application/engine descriptors; installed dependency
license notices; and replay instructions. It excludes device identities, outbox,
sequencer keys, PDS credentials and tokens. Export neither deletes nor closes
an app.

The archive is a versioned JSON transport envelope, not a new atproto repository
format. Its entries and source manifests retain their existing canonical CBOR
identities and signatures. Its head identifies a chosen verified prefix, not
proof of the latest globally observed head. An earlier prefix retains the rules
that applied there. If activation source is missing, export offers only the
last complete prefix; requesting a later position fails explicitly.

Import checks the installed runtime identity, genesis, every signed entry,
retry uniqueness, complete source CIDs, inventory and deterministic replay. It
accepts no partial archive as complete. Missing content or an unsupported runtime
fails visibly. Runtime code inside an arbitrary archive is never installed or
executed. The trusted named Atseq runtime and locked dependencies must already
be installed. Inlay and some transitive packages omit standalone license text;
the archive records their published declarations and this omission rather than
inventing upstream notices. Full notices present in installed packages are
retained verbatim.

A genesis CID identifies its bytes; it does not by itself prove ownership of the
app DID. A first archive import establishes the invitation supplied by that file.
When the device already knows an invitation for that DID, import must match it.
A conflicting genesis fails verification without changing the pin, sidebar,
verified inputs or open app. The device retains the pin across reloads and checks
it again when opening an invitation. The CLI can require the same check with
its optional app/genesis arguments. License notices and replay text are retained
metadata; different packaging text does not change the installed runtime CID
or prevent an otherwise valid replay, and is never executed.

The current source contract declares all interpretation dependencies in the
manifest's named files. Arbitrary external URLs or undeclared blob references
are not resolved. The archive uses the existing 20,000-entry, 32-candidate and
16 MiB source-pool bounds and has a 48 MiB outer import/export limit. These are
operational limits, not a promise that work at their maximum is fast.
Candidate CARs can carry oversized invalid activation closures as evidence;
definition admission still enforces 512 KiB. Offline replay uses that evidence
to reproduce the invalid outcome and continue with the following entries.

## CLI copy and offline replay

```json
{"operation":"export","host":"http://127.0.0.1:PORT","app":"APP_DID","genesis":"GENESIS_CID","output":"/absolute/application.atseq.json"}
```

An optional `position` chooses an earlier complete prefix. The reply names the
exported head. `export` verifies and replays public `sync` data locally before
writing. Rebuild needs no host or private key:

```json
{"operation":"replay","source":"/absolute/application.atseq.json","outputDirectory":"/absolute/new-rebuild-directory"}
```

The output directory must not exist. It receives `projection.json`,
`retry-index.json` and the verified archive. Add `app` and `genesis` when an
invitation is already pinned and must match. The CLI never removes an existing
application or directory. Acceptance recovery removes only one known disposable
projection file inside a marked test environment, then compares the separate
rebuild's state, definition, outcomes, retry index and frontier.

## Browser and static query exports

After **Shell saved for offline use**, the service worker retains only the
installed shell's HTML, scripts and styles. It does not cache XRPC, credentials
or imported data. IndexedDB separately retains verified inputs and the device
outbox. Offline reload starts the same installed shell; **Import app archive**
verifies and replays the file in a worker without creating a signing identity.
Existing queued work remains on the device. Online refresh may find newer
entries, which must pass the same pinned verification rules.

Evaluation stays in a worker. Long local replay/export has a visible working
message and can be cancelled; cancellation terminates the worker and retains
stored inputs and queued intent bytes. Refresh rebuilds from those inputs.
A new action cannot be saved while interpretation is stalled by required source.
Replay, import, export and comparison use a 120-second operational watchdog;
ordinary preview uses 15 seconds. The cancellation fixture holds a worker
message before dispatch to test the UI and outbox boundary; it does not measure
the interruption of CPU-bound interpretation.

An available query result containing up to 100 object rows can be shown as a
chart or table. Choose a text label and integer value, then **Draw chart**. Bars
use zero as their common baseline, support negative values, show exact numbers
and an accompanying table, and add no decorative area encoding. **Download SVG**
and **Download table** retain the data plus app/genesis/definition, query params
and the exact source frontier in embedded metadata. They work without Atseq.
Text is escaped; these exports contain no executable application template.

## Measurement boundaries

The performance scripts time signed single appends through the real sequencer
and loopback official PDS at histories of 100, 1,000 and 10,000 entries. Signed
history is seeded in conditional batches as fixture setup; those batches are
excluded from acknowledgment samples. Nine individual confirmations near each
size supply raw values and nearest-rank p50/p95. This small local sample is not
a load or capacity guarantee.

Node replay uses the in-memory folder; it does not include per-entry projection
file fsync. Catch-up measures one entry with the existing complete-prefix
verification. Browser measurements include worker transfer and returned state,
with a click and animation frames observed during replay. Browser RSS sums the
isolated Chromium processes and may double-count shared pages; it is not a
per-app retained heap measurement. The report preserves these distinctions.

The current complete-prefix paths have growing acknowledgment, replay and memory
costs. Measured results decide the next change; no invented latency threshold
turns a slow result into a different application outcome.
