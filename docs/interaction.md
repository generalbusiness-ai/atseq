# Local human and agent interaction

S4 joins the reviewed PDS writer and folder through a generic browser shell
and a JSON CLI. Applications bring their own Lexicons, JSONata and retained
Inlay views. The host contains no application-specific forms or domain routing.
This remains a local spike with synthetic data on a disposable test PDS.

## Run the shell

```sh
npm ci
npm ci --prefix tests/support/pds
npx playwright install chromium
npm run dev:app
```

The command builds the browser shell, starts the official loopback test PDS
and prints the Atseq URL plus two example preview links. It publishes no app.
The chosen port is random unless `ATSEQ_PORT` is supplied. Ctrl-C stops those
services and leaves marked `.atseq-local/` data for inspection. This development
runner starts a fresh test environment each time; the restart integration test
separately proves host restoration against the same retained PDS. The GitSeq
resident is unrelated and is not restarted.

Keep this development fixture on loopback and use only synthetic accounts and
test data. Never expose it publicly or use real accounts. The PDS child ignores
inherited exporter/service settings and forces telemetry off. The mock PLC shares
the development runner, whose library imports do not start a telemetry SDK; run
it without externally preloaded telemetry instrumentation. See the
[fixture boundary](pds-host.md) for the exact environment and runner limits.

Open a preview link or import a definition CAR. Preview actions use sandbox
state; Start uses the declared initial state. Starting requires an explicit
local identity and shows **Test PDS · public demo data**. Its initial activation
key grant is explicit. The local key is a P-256 `did:key`, not a verified atproto
account or a role in the application. Reading creates neither a key nor an act.

An imported source revision has an immutable CID. Importing an edited folder
creates a new source revision. Device draft writes use an expected revision;
publication freezes source, grant keys and one UUID creation ID before network
I/O. Offline failure retains that draft. Retrying with the same creation ID
reconciles the same account and genesis; different content with that ID fails.
Account credentials and the sequencer key are persisted before publication in
owner-readable host files. A lost account response logs back into that account.
The PDS limits service-issued handle prefixes to 18 characters, so the helper
uses a persisted random 17-character prefix. It does not derive app identity
from the handle's spelling.

## Participate and interpret progress

Retained Action primitives open generic forms. Scalar properties become labeled
controls; nested objects, arrays, refs and unions use JSON fields validated
against the declared Lexicon. A deliberate Save validates, signs once and stores
the complete signed block in IndexedDB before sending it. Duplicate clicks are
disabled while that operation is in progress. A retry resends those bytes and
nonce; rendering and reconnection never sign replacement content.

| Label                                  | Evidence                                                             |
| -------------------------------------- | -------------------------------------------------------------------- |
| Queued on device                       | The original signed intent is durably in the device outbox           |
| Saved, awaiting interpretation         | The sequencer returned a confirmed receipt; the folder may be behind |
| Applied / Not applied                  | The browser verified and interpreted the entry's prefix              |
| Transport refused · retained on device | The request was refused and its original signed work is retained     |

A failed or lost response stays uncertain until a verified prefix establishes
what happened. The browser can derive the receipt from that verified entry even
when the response was lost. An ineffective act remains in activity history with
its reason. A transport refusal does not fabricate an entry. The inspector
shows intent, canonical receipt and computed effect separately.

The last verified state remains visible while offline or unavailable. Pending
preview estimates this device's outbox in its local order, starting from that
state. It is labeled as an estimate and rebases after refresh; concurrent actors
can change its result. At most 100 waiting actions per app are admitted on one
device. This preview never advances the canonical frontier.

Evaluation, source admission, signature/history verification, query execution
and Inlay resolution run in a browser worker. IndexedDB holds owned verified
inputs, outbox and local identity. Only verified inputs replace the canonical
cache. The worker receives no private key. Text nodes are constructed with DOM
text APIs, and views receive no network or signing capability. CSP restricts
scripts and workers to the shell origin. A worker watchdog/cancel terminates
local evaluation; it does not change the retained log or queued intent.

S4 can keep working offline in an already loaded shell and reload its retained
inputs when the shell is available again. Disconnected shell bootstrap and
complete archive import are S6 work; a service worker is not claimed here.

## JSON CLI adapter

Use Node 22.13 or later. An existing agent harness writes source files and invokes
one JSON request on stdin. The CLI prints one JSON `{ok,result}` or `{ok:false,
error}` response and uses a nonzero exit for errors. It hosts no model or chat.
Keep key and intent files outside the source folder and out of version control.

```sh
npm run --silent atseq <<'JSON'
{"operation":"identity","name":"My agent","keyFile":"/absolute/private/agent-key.json"}
JSON
```

The identity command returns only name and public key. Its regular key file has
mode 0600. Later commands read that file; they never send its private material
to the host. The browser uses a separate non-extractable device key and offers no actor switch.
See [browser sessions and device storage](browser-device.md) for key loss, trust pins, retry rules and the IndexedDB schema.

A source folder contains `manifest.json` in the shape documented in
[definitions.md](definitions.md), omitting `files`, plus all retained source
files. `pack` derives their raw CIDs and the CAR root. Its output must be outside the real source directory, including directory aliases. It creates a new file by default; set `"overwrite": true` explicitly to replace an existing CAR. Supplied key and intent files are always protected. It refuses symlinks and
writes the resulting CAR outside that source folder.

```json
{ "operation": "pack", "directory": "/absolute/source", "output": "/absolute/draft.car" }
```

For a single `atseq-source` JSON document, use `packDocument`. To reconstruct a
document from an admitted CAR, use `unpackDocument`:

```json
{ "operation": "packDocument", "source": "/absolute/app.atseq.json", "output": "/absolute/app.car" }
```

```json
{ "operation": "unpackDocument", "source": "/absolute/app.car", "output": "/absolute/app.atseq.json" }
```

These operations need no running host. They enforce the document and source
bounds, reject input symlinks, and write one output file without extracting its
source paths. They refuse to overwrite the input file or a supplied key, intent
or token file, including aliases. Existing output files require explicit
`"overwrite": true`. The [definition guide](definitions.md#authoring-without-a-compiled-sdk)
explains exact source identity and the retained examples.

The remaining requests include `host`, the printed Atseq origin. Operator procedures (`validate`, `preview` and `create`) also
include `hostTokenFile`, the absolute path printed by the host. It is a regular
file owned by the current user with mode 0600. The CLI sends its token only to
the selected host; output commands protect the token file from replacement.
Read methods (`list`, `describe`, `query`, `outcome` and `export`) remain public:

| Operation  | Additional input                                                             | Result                                                     |
| ---------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `validate` | `source`: CAR path                                                           | Validated manifest and Lexicons                            |
| `preview`  | `source`; optional `action`, `payload`, `state`                              | Sandbox state/outcome, views and a `previewUrl` to open    |
| `create`   | `source`, `keyFile`, stable `creationId` UUID v4                             | Pinned genesis, head and interpretation frontier           |
| `list`     | None                                                                         | Available local app invitations                            |
| `describe` | `app`, `genesis`; optional `includeSource: true`                             | Versioned definition and progress; exact source on request |
| `submit`   | `app`, `genesis`, `definition`, `action`, `payload`, `keyFile`, `intentFile` | Intent CID and canonical receipt                           |
| `query`    | `app`, `genesis`, `name`, `params`                                           | Available/unavailable result at its exact frontier         |
| `outcome`  | `app`, `genesis`, `intent`                                                   | Receipt and pending/effective/ineffective result           |

`genesis` and `definition` in CLI input are plain CID strings. Preserve the
creation ID across an uncertain create. Preserve `intentFile` across a submit
retry: the CLI atomically creates that file before sending, verifies its signed
bytes before reuse, and refuses to reuse it for different work. An explicit
new action uses a new file. A source edit or a stale action must be reviewed
before signing a replacement. See [compatible changes](evolution.md) for activation and explicit replacement.

Both clients use the same public Lexicon methods: the five S1 contracts plus
`list`, `validateDraft`, `preview`, `readDraft`, `sync`, `compareDefinition` and
`stageDefinition`. Preview URLs identify
content-addressed local drafts; loading them does not publish. Draft storage is a bounded cache: previews can be evicted. Public `readDraft` needs no host token and updates the draft’s last-used time. Anyone who knows its CID can keep it recent while it remains cached. `sync` carries
the pinned genesis, complete signed prefix and retained source CAR for client
verification. Its entry values use the same unknown-record convention as PDS
listing and must pass the existing signed-entry verifier, not just its outer
method schema. `create` carries the stable UUID in the `Idempotency-Key` header.

The local service accepts its exact Host and Origin, permits CLI calls without
an Origin header and enables no cross-origin browser access. JSON import bodies
are bounded to 768 KiB; signed blocks retain their 64 KiB limit, definitions
512 KiB, and read responses 32 MiB. These operational bounds do not expand the
runtime profile. Operator procedures (`preview`, `validateDraft`, `create`,
`compareDefinition` and `stageDefinition`) require the retained host token. The CLI names the last two operations `compare` and `stage`.
Participant `submit` is authenticated by its signed intent and needs no operator
token. All requests retain the same Origin, Host, size and signature checks.
Browser invitation links work for participants without host credentials.
**Host access** lets an operator enter a token from the private file; it stays
in that tab’s session storage. Preview URLs contain no token and are safe to
print. Authentication failure is an explicit host-access state, not a permanent
refusal of signed work.

The default host caps applications at 32, including incomplete creations, and
retained drafts at 32 files / 16 MiB. Drafts are evicted least-recently-used first to make room; create sends its own source bytes and does not depend on the preview cache. Repeating an existing creation ID remains possible within its allocation. Authentication, application quota, draft quota and temporary availability failures keep signed work queued. Invalid signature, key, envelope, payload or canonical wire bytes, and nonce conflicts, are permanent refusals. Complete-prefix bounds (`snapshot_limit`, `definition_history_limit`) and the append capacity bound (`append_limit`) return HTTP 413 with a permanent code. Integrity and temporary availability failures use HTTP 503. Refusal retains the signed bytes on the device; an explicit resend uses those same bytes.

PDS credentials live only in the host. Expired access sessions renew once using
the retained refresh credential; concurrent requests share renewal. Unusable
credentials report `host_authentication`. Restore attempts each app independently
and writes `restore-errors.json` with failures. Production account provisioning
is an operator concern.

## Verification

```sh
npm run check
npm run test:flows -- --group participation
```

The gate runs actual HTTP/SQLite PDS tests, isolated Chromium profiles and a
separate CLI process/key. It covers preview/no publication, offline and lost
create replies, exact create retry, guest reading, offline submit, double click,
retained retry across reload, competing no-op, lost submit reply, transport
refusal, mobile width, keyboard focus and hostile templates. It checks worker
results against PDS entries and observable outcomes. Screenshots are evidence
of the exercised shell, not screenshots of the earlier S0 sandbox.

## Preview identity and invitations

Sample preview uses a synthetic app DID, position 1 and an empty `meta.actorKey`.
It does not impersonate the device's signing identity. An identity-dependent
fold should explicitly handle this anonymous sample or be checked through signed
test participation. Preview currently has no actor override.

A created app's invitation is the host origin, app DID and pinned genesis CID.
The live browser URL is `HOST/#app=URL_ENCODED_APP_DID&genesis=GENESIS_CID`;
construct the fragment with `URLSearchParams`. Loading it creates no signature.
The `previewUrl` returned by preview identifies a draft, which remains unpublished.

Host previews are a bounded cache, separate from published source and device
drafts. Reading or replacing a preview keeps it recent; older previews are
evicted at the count or byte limit. An expired preview returns `draft_not_found`
with 404 and can be recreated from its source. A single preview larger than the
byte budget returns `draft_limit`.

Complete-prefix limits have stable codes `snapshot_limit` and
`definition_history_limit`, status 413 and `permanent: true`: retrying the same
prefix cannot fit this host's bounds. They never retire valid signed work.
Source transport failures retain `content_unavailable` rather than becoming a
history-limit error. A known dead PDS credential is remembered until the host
restarts and the account provider logs in again. Restore diagnostics keep the
original error name and message in the local `restore-errors.json`.
