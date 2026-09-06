---
date: 2026-09-06
status: adopted for implementation; S0 implemented and awaiting review; S1–S6 not started
companion: notes/2026-09-06-atseq-architecture.md
planned_at: 133071b
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:95a7a733307fc1d78d8de0cf32c76f9a1b0e4502
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
---

# Atseq initial spike: create, use, evolve, and replay a unique app

## 1. Outcome and scope

Build a local experiment that creates two unrelated applications after the
shared host has started. Each application has a unique atproto DID/repository,
Lexicon schemas, JSONata behavior, and declarative views. A person and an agent
use the same discoverable actions. Their signed intents receive one order in
the app repository. The browser and host reproduce the same result from the
retained log and definitions.

Then change one application's definition at an explicit position, resolve a
pending action from the old definition honestly, export the app, and rebuild
its projection from retained inputs.

The [architecture note](2026-09-06-atseq-architecture.md) is the companion design.
This plan is self-contained for execution. Workroom proposal #28 adopted it
for implementation after the user's authorization. The
[S0 result](2026-09-06-atseq-runtime-feasibility.md) records the first experiment.

**Success means a small working composition**, not adoption of every candidate
library. GitSeq supplies development-workroom tooling and architectural
precedent only. There is no GitSeq package, format, replay, or compatibility gate
in the atseq product.

In scope: a local host, disposable PDS, shared browser shell, structured agent
CLI, two applications, a bounded state model, one compatible activation, and
failure/replay tests. Out of scope: production hosting, real private data,
full OAuth account delegation, general key rotation or sequencer failover,
large-state optimization, destructive migrations, side-effect automation,
cross-app transactions, a built-in LLM service, or a visual app builder.

## 2. Repository baseline and working discipline

The planning baseline is commit `133071b`. It contains `AGENTS.md`, `CLAUDE.md`,
`LICENSE`, `NOTICE`, and `notes/README.md`; no application code, dependency
manifest, build, or test command exists yet. Do not claim the verification
commands below have run: S0 must create them as the spike's command contract.

Before implementation:

```sh
git status --short --branch
git diff --stat 133071b..HEAD
git log -5 --oneline
```

Reconcile any new implementation or newer dated decision before following
this plan. Unrelated documentation changes do not invalidate the plan.
Preserve unrelated local changes. Use a `request/<slug>` worktree, GitSeq
requests, and a commit trailer naming the governing event. The repository's
current `AGENTS.md` governs; do not import the policies of another repository.
The GitSeq workroom skill governs use of that tool, including independent
review of the exact implementation head.

The local reference checkout inspected for this plan was Tailapps commit
`7ecffd53013fd6ca45693a1a8e28b7c8d52432e8` at `~/play/tailapp`:

- `jsonataddl/load.go:24`: `LoadApplication(files fs.FS, root, name string,
  dialect Dialect, runtimeProfile string)`.
- `jsonataddl/application.go`: immutable handles expose `ReadPlan` and
  `SchemaSQL`; `Evaluate` consumes the declared input.
- `jsonataddl/dialect.go`: source layout calls `DefinitionPath` a DDL document;
  the topology policy is a constrained two-stage pipeline.
- `jsonataddl/authorizer.go`: imports `github.com/ncruces/go-sqlite3`.
- `jsonataddl/example_test.go`: complete compile-and-evaluate example.

These are integration evidence, not a dependency on the sibling checkout.
If chosen, resolve a published module and checksum in an isolated experiment.
No `replace` directive pointing to a developer's working tree belongs in the
delivered spike. No edits to GitSeq or Tailapps are commissioned by this plan.

## 3. Smallest execution contract

### State and programs

Use one Lexicon-typed state object per application. The initial state is part
of its definition. A fold receives:

```text
{ meta: { app, position, actorKey, definition }, act: typedPayload, state }
```

It returns exactly one of:

```text
{ decision: "effective", state: completeNextState }
{ decision: "ineffective", reason: stableCode, message?: explanation }
```

An ineffective result cannot carry successor state. Each action binding names
an input schema and one fold source. Each query binding names parameter/result
schemas and one pure expression receiving `{params, state}`. The manifest and
binding shapes have framework Lexicons. There is no authored SQL, arbitrary
JavaScript, query DSL, or network read inside a fold.

Use application schemas for nested arrays/objects and ordinary JSONata
selection/aggregation. Whole-state processing is intentionally limited: it
tests the authoring and replay model, not indefinite state growth. Repeated
acts can produce a long history while the current state remains bounded.

### Limits and validation

Freeze these starting caps in a versioned profile and test exact boundaries:

| Item | Spike cap |
|---|---|
| State, encoded as canonical JSON for evaluation | 128 KiB |
| Complete fold input/output | 256 KiB each |
| One action payload | 32 KiB |
| One program source | 64 KiB |
| Definition source closure, excluding installed runtime | 512 KiB |
| Definition files | 64 |
| Input container depth | 32 |
| Integers | JavaScript-safe signed integer range |

Wire values must also satisfy the atproto data model. Preserve absent versus
null, array order, and signed content. Avoid implicit number or string coercion.
Use integer minor units or explicit decimal strings when needed; no wire floats.
Define supported Lexicon constructs and limits explicitly. Unsupported schemas
fail definition validation with a path and explanation before publication.

S0 must establish evaluator confinement: no ambient clock/randomness, dynamic
evaluation, external functions, or unbounded callbacks. Document the admitted
expression subset and deterministic depth/operation limits actually enforced.
An operational watchdog may kill a worker, but a timeout is an interpretation
failure, never a domain `ineffective` verdict. Invalid output or resource
exhaustion preserves the last good state/frontier and pauses the app.

### Runtime and storage choice

Default host: TypeScript on Node with atcute's client, XRPC server/Node adapter,
CBOR/CID and crypto packages. Default browser: TypeScript with a small Vite
shell. Use one shared runtime interface and the same evaluator/profile in both
environments. Pin chosen package versions and integrity hashes at S0.

Evaluate Tailapps' `jsonataddl` first for a facade over the state-document
contract. Internal generated DDL or a Go/WASM facade is acceptable if it stays
inside the adapter and preserves authored source meaning. Measure actual browser
compilation and loading; do not infer feasibility from the word "host-neutral."

If its topology, SQL dependency, or browser packaging makes the facade fail,
record the failing fixture and evaluate an existing JSONata engine usable in
both Node and the browser. Freeze atseq's own bounded profile around that one
engine. Do not create two interpreters, copy a private core fork, or weaken
limits to claim success. If neither option passes S0, deliver the evidence and
a focused runtime decision instead of proceeding with an invented engine.

For this capped spike, a host projection may be an atomically replaced local
snapshot containing state, outcomes, and frontier. It is disposable and rebuilt
from the PDS. Browser copies live in IndexedDB. Add a database only if required
by the selected adapter; do not add Redis, a relay, or an AppView to this slice.

## 4. Protocol choices to freeze before building UI

### Identity, genesis, and authority

Each app uses a disposable test-PDS account and one genesis record. Provision
accounts through a local test helper; never distribute PDS administration or
app repository credentials to the browser. Give users an app link carrying
the app DID and genesis CID. Existing cached anchors cannot be silently replaced.

Generate P-256 actor keys with existing crypto tooling. A self-authenticating
key identifier is sufficient in v0; a displayed name is a local label, not a
verified atproto account identity. The browser stores its own key locally; the
agent CLI uses a separate owner-readable key file outside version control.
Losing a key requires a new identity in this spike; account recovery is deferred.

Genesis references the initial definition, which is the sole source of initial
state. It declares the protocol/profile, sequencer public key, and explicit
activation-authority keys; its profile must agree with the definition. Creation does
not establish an irrevocable owner role. The spike grants its test editor
explicitly and tests that another participant cannot activate definitions.
Initial grants are fixed for this experiment; production governance comes later.

P-256 and low-S verification follow existing atproto crypto conventions.
`@atcute/crypto` signs input bytes by hashing internally, so verify the exact
library behavior and avoid an accidental second hash. [Crypto API](https://raw.githubusercontent.com/mary-ext/atcute/trunk/packages/utilities/crypto/README.md),
[atproto cryptography](https://atproto.com/specs/cryptography).

### Signed intents and entries

Specify framework Lexicons and exact canonical bytes for:

- Intent: version/domain separator, app DID, genesis CID, definition CID,
  actor key identifier, random retry nonce, action/schema reference, payload.
- Actor signature over that entire intent, excluding the signature field.
- Entry: position, predecessor CID, complete signed intent, sequencing key,
  protocol/domain separator, and sequencer signature over its unsigned contents.
- Genesis and head record schemas, including exact initial-position conventions.

Use established canonical CBOR/CID utilities. Reject duplicate fields,
unsupported encodings, and trailing bytes before signing/verification. S1 must
specify exactly how Lexicon JSON is transformed to canonical signed bytes.
Store and verify original signed content; validation must not strip extra
fields and then substitute re-encoded content for what the actor signed.

Use zero-padded position record keys and an explicit predecessor CID. The head
record points to the current entry. Order comes from these verified fields,
not record timestamps, relay arrival, or a presumed PDS history chain.

Retry identity is `(app, actorKey, nonce)`. The index binds it to canonical
intent content, not signature bytes: ECDSA may produce another valid signature
for the same content. An exact content retry returns the original receipt;
different content using the same identity is a transport conflict. Rebuild
this index from retained entries.

### Write and read behavior

`submit` validates the framework envelope and signature but does no domain
evaluation. Atomically create the entry and advance head with `applyWrites`
and `swapCommit`; acknowledge only after confirmation. If the PDS response is
lost, reconcile the head and retry index before writing again. Keep one
writer per app and refuse a second local process holding that writer lease.
The process lock is local coordination, not a distributed failover promise.

The folder supplies domain validation, stale-definition checks, authorization
for control acts, and application effectiveness. A recorded action unknown to
the active definition is ineffective with an explicit code. Invalid actor or
sequencer proof is corrupted history and pauses verification.

Expose a small fixed XRPC surface for definition discovery, app creation,
signed submission, named queries, and receipt/outcome lookup. Names are selected
under an owned namespace during S1, not invented as globally registered names
in this note. Standard PDS APIs supply records and exports. Schema-driven
clients load domain definitions at runtime; no domain SDK build is required.

Return both the canonical head and interpretation frontier. A query either
returns a value with its exact prefix or a typed unavailable result. It never
labels a lagging projection as current. Polling head is sufficient for v0;
notifications are optional hints using the same recovery path.

### Definition activation

An activation entry at N checks authorization and compatibility under the
definition/state at N-1. Its signed payload names the expected old definition,
new definition CID, and dependency closure. If effective, N+1 uses the new
definition. A second activation racing from the same old definition is
recorded ineffective. Invalid shape/unsupported code fails draft validation;
a malicious recorded invalid activation is ineffective under the control rules.
Unavailable candidate content pauses interpretation; it cannot be treated as
invalid just because a host failed to fetch it. Preserve the prior projection
and retry the same entry once its dependency closure is available.

Keep state schema and runtime unchanged in the first activation. Add a new
action/query/view using existing state fields. Old action intents remain signed
for their old definition and are recorded ineffective with `definition_changed`.
The UI preserves entered values and lets the user review a new action; no
automatic re-signing, silent reset, or retroactive use of the latest fold.

### Export and rebuild

Export a verified chosen prefix: app/genesis/head anchors, retained entries,
definition history, schemas, program and view content, and referenced blobs.
Verify every CID and list the complete application dependency closure. Include
the exact runtime/profile descriptor, licenses, and replay instructions. The
archive requires that trusted runtime to be installed; it does not authorize
execution of arbitrary runtime code found inside an archive.

Never export signing keys, PDS credentials, or operational tokens. Recovery
deletes only disposable test projection caches, imports into a separate test
directory, verifies the archive, and replays to the exported frontier. Missing
content or runtime is explicit. A static chart export can be viewed without
the runtime and carries a manifest identifying its source head.

## 5. Critical user flows and sketches

These sketches specify behavior, labels, and information hierarchy. They are
low-fidelity implementation targets, not an additional UI framework. The same
flows must work at a narrow mobile width with stacked panels, visible focus,
labeled inputs, keyboard operation, and text status alongside any color.

### A. From purpose to a reviewable app

An existing agent harness creates the definition using documented CLI/API
operations. Atseq does not implement model hosting or a fake working chat box.
The user opens the resulting draft preview in the shared browser shell.

```text
Agent conversation (existing harness)
"Help me compare second-hand guitars for this weekend."
                |
           [Open app preview]
                v
+------------------------------------------------------------+
| Weekend guitar search                     Draft · only here |
| Compare candidates, keep evidence, record your preferences. |
|                                                            |
| Candidates                                                 |
| Name                 Asking price         Interest         |
| Example instrument   £780                 Considering      |
| [Add candidate]      [Compare]                              |
|                                                            |
| This app lets participants add evidence and preferences.   |
| It will not contact sellers or make purchases.              |
|                                                            |
| [Try with sample data] [Inspect definition] [Start this app] |
+------------------------------------------------------------+
```

Preview uses sandbox state and the proposed programs. Draft changes have an
expected revision to prevent lost edits. Starting an app shows its destination
and publication scope, then provisions genesis and the retained definition.
Sample acts never enter the live log. Offline publication keeps the draft
local; failure offers retry without duplicate app creation. Creation itself
needs a stable draft creation ID and resumable provisioning result.

The spike labels the destination **Test PDS · public demo data**. Use synthetic
examples only. Publication is a real commit boundary; clicking Start is its
explicit action, not something opening the preview does automatically.

### B. Open and participate without assumed obligations

```text
+------------------------------------------------------------+
| Weekend support circle            Test PDS · public demo data|
| A place to share updates and optional offers of help.       |
|                                                            |
| Latest update                    Offers                    |
| "A lift would be useful."        Alex: available Saturday   |
|                                                            |
| [Read updates]                   [Make an offer]            |
|                                                            |
| To contribute, create a signing identity on this device.    |
| Display name [Sam________________] [Continue]               |
| Local demo identity; not linked to an atproto account.      |
+------------------------------------------------------------+
```

Reading is not acceptance of a role or commitment. Continue creates this
device's key, then opens the selected action form. Participation policy belongs
to the application; an offer has only the meaning its definition gives it.
Never provide a production control that switches the user into another actor's
identity. Automated tests use isolated browser profiles and a separate agent key.

### C. Submit, wait, retry, and understand an ineffective act

```text
+------------------------------------------------------------+
| Add evidence for Example instrument                        |
| Note [Seller reports a repaired headstock________________] |
| Source [https://example.test/listing/42__________________] |
| [Save evidence]                                            |
|                                                            |
| Offline — saved on this device. 1 action waiting.          |
| [View pending action]                                      |
+------------------------------------------------------------+

Queued on device -> Saved, awaiting interpretation -> Applied
                                      |
                                      +-> Not applied

+------------------------------------------------------------+
| Your change was not applied                                |
| This candidate changed before your update arrived.         |
| Your original entry is kept in the activity history.       |
| [Compare current values] [Review a new update]              |
+------------------------------------------------------------+
```

Disable duplicate clicks for the same draft; retransmission uses the same
signed intent and retry nonce. An uncertain response stays pending until its
receipt is resolved. Mark optimistic changes as pending, retain the last
verified projection, and rebase the preview when the canonical prefix grows.
Show transport refusal beside the retained draft rather than fabricating a log
entry. The activity inspector distinguishes actor intent, canonical receipt,
and computed effect.

### D. Evolve an app and deal with old pending work

```text
+------------------------------------------------------------+
| Proposed change to Weekend guitar search                   |
| Add an evidence summary and a way to mark evidence checked. |
|                                                            |
| Current                     Preview                        |
| Candidate comparison        Comparison + evidence summary |
|                                                            |
| Existing data is preserved.                                |
| New action: Mark evidence checked                          |
| Checks: schema valid · sample replay passes                |
| [Inspect changes] [Keep draft] [Apply change]               |
+------------------------------------------------------------+
                 |
     Saved -> applied at an explicit log boundary
                 v
+------------------------------------------------------------+
| App updated                                                |
| One queued action used the previous app definition.         |
| It was saved in history but not applied.                    |
| [Review it with the updated form]                           |
+------------------------------------------------------------+
```

Only a key with the explicit activation grant can apply. The preview compares
the old/new action and view contracts and shows test results; it cannot promise
a concurrent action will succeed. If the expected definition moved, preserve
the draft and ask the user to refresh its comparison. Unsupported state changes
produce a clear validation result; there is no Reset button as a shortcut.

### E. Missing content, restart, and recovery

```text
+------------------------------------------------------------+
| Weekend guitar search                  Showing saved state |
| Updates paused: a required definition file is unavailable.  |
| Last verified update: #37. Newer entries have not been used. |
| [Retry download] [Inspect problem] [Export verified history]|
|                                                            |
| Candidate comparison (read only)                           |
| ...                                                        |
+------------------------------------------------------------+
```

For the spike, pause new action controls when required interpretation is
unavailable. Preserve the outbox and explain it. Recovery verifies inputs and
resumes at the missing position; it does not clear app history or silently
switch runtime. A conflicting genesis/signature is shown as a verification
problem with no automatic trust reset.

### F. Finish a transient app or take a durable copy

```text
+------------------------------------------------------------+
| Export this app                                            |
| ( ) Current chart or table                                 |
| (o) App and verified history                               |
|                                                            |
| Includes definitions and data through update #52.          |
| Replay needs the named Atseq runtime. Signing keys excluded.|
| [Download]                                                 |
+------------------------------------------------------------+
```

Export is a download, not deletion or closure. The bounded chart example
exercises the first choice; a reusable archive exercises the second. If the
requested prefix is incomplete, offer only the last complete prefix and name
it honestly. No archive is labeled complete with missing application objects.

## 6. Implementation layout

Keep the initial code in one TypeScript package; add a Go experiment module
only for the evaluator assessment. Suggested paths are an implementation plan,
not existing files:

```text
src/protocol/       schemas, canonical encoding, signatures, log verification
src/definition/     source closure, runtime schema validation, action bindings
src/runtime/        pure fold/query interface, selected evaluator, validation
src/host/           local service, PDS writer, provisioning, projection cache
src/client/         retrieval, verified prefix, IndexedDB outbox and preview
src/ui/             routes, forms, declarative components, outcome rendering
src/agent/          JSON CLI adapter over the same service contracts
experiments/        bounded evaluator/Inlay feasibility fixtures and findings
lexicons/          stable framework schemas; no fixed business vocabulary
testdata/apps/     synthetic domain definitions; absent from host routing logic
tests/             unit, integration, browser, and replay acceptance cases
scripts/           test PDS, reset guards, acceptance and evidence commands
notes/             architecture, plan, and dated spike result
```

Keep all generated build output, credentials, temporary PDS data, browser
profiles, and experiment databases in ignored, task-specific directories.
Do not change `LICENSE`, `NOTICE`, or sibling repositories while implementing.

## 7. Work packages and gates

S0 precedes all product work. S1 precedes S2/S3. S4 joins S2 and S3; S5 follows
S4; S6 is the final evidence run. Track actual assignments as workroom requests.
Each package ends with a small inspectable commit and its evidence.

### S0 — Establish the runtime, schema, and UI feasibility baseline

Create the package/test harness and `experiments/` fixtures. Record chosen
versions, license compatibility, and the complete dependency graph. Assess
the state-document facade over jsonataddl, including a real browser build;
use the fallback rule in section 3 if it fails. Verify the chosen engine can
run the same normal, ineffective, malformed, and limit cases in host and browser.

Load two Lexicon bundles at runtime with nested objects, refs, arrays, optional
versus nullable fields, and schema errors. Existing schema parsers/codegen do
not automatically prove runtime data validation; test the actual validator.
Restrict and document the initial supported subset instead of coercing data.

Render one Inlay template into local primitives with a form/query/action
binding. Test local dependency resolution and an absent component. If Inlay
cannot support the essential flow, keep its record/composition lessons and use
a small declarative host renderer for the same bindings; record the missing
capability. Do not add a second state or action system for the UI experiment.

Allow only registered local primitives. Escape text and reject executable HTML,
scripts, template access to signing keys, and action invocation on load/render.
Resolve source dependencies only from the configured test PDS or retained
archive. A human control interaction or explicit agent adapter call is required
to submit an action; rendering a view is never a signing operation.

**Gate:** `npm run spike:feasibility` exits 0 only when the selected evaluator,
runtime validator, browser execution, and one declarative action control pass.
It writes `experiments/feasibility.json` with selected/rejected candidates,
actual versions, fixture results, browser load size/time, and limitations.
If no candidate passes, stop product work and publish the failed experiment.

### S1 — Freeze and verify the atseq protocol

Implement `src/protocol/`, fixed framework Lexicons, and independent signed
vectors for section 4. Freeze the genesis convention, owned/local namespace
strategy, nonce behavior, signature encoding, canonicalization, and bounds.
Publish the readable contract in `docs/protocol.md` with generated schema links.

**Gate:** `npm run test:protocol` rejects changed app/genesis/payload/definition,
invalid signatures, noncanonical inputs, altered predecessors, duplicate or
skipped positions, and conflicting retry content. Exact retries and two valid
signatures over the same intent content resolve to the same intent identity.
Expected vectors must not be generated by the implementation under test.

### S2 — Append to a real disposable PDS and recover

Implement provisioning, the one-writer service, conditional entry/head batches,
receipt lookup, and verified bootstrap/catch-up. Retain source objects through
references supported by the PDS; verify export includes blobs rather than
assuming repository CAR export contains them. Bootstrap from a chosen head,
then catch up to a later head without treating page arrival as ordering.

The test helper owns a clearly marked disposable directory and account prefix.
Reset refuses any unmarked directory or non-test PDS. No test wipes an existing
user account or production repository. Credentials are supplied through local
ignored files/environment and never printed or archived.

**Gate:** `npm run test:pds` passes against the real test PDS: two concurrent
submissions, conflicting unrelated repo writes, duplicate retries, lost response
after successful commit, restart before/after acknowledgment, missed
notifications, and deleted/tampered source content. The log has exactly the
expected entries; a rejected batch leaves no half-advanced head. Tests involving
corruption target disposable copies and must not silently skip when Docker/PDS
is unavailable.

### S3 — Load and interpret arbitrary definitions

Implement `src/definition/` and `src/runtime/`. Validate a complete source
closure and initial state. Bind action inputs and query outputs to the same
pinned schemas, execute the selected bounded engine, and atomically replace
the projection/outcomes/frontier. Expose explicit schema errors and stalled
interpretation. Keep all domain logic in test definitions.

**Gate:** `npm run test:runtime` validates pure fold/query behavior, malformed
output, ineffective state preservation, numeric/null rules, state/input caps,
unsupported runtime and unavailable source. Restart/replay matches independently
specified outcomes. `npm run test:dynamic-apps` starts the host before generating
two differently named/schema-shaped definitions and loads them without rebuild.

### S4 — Build the human and agent path

Implement sketches A–C with local-key identity, preview/publish, runtime forms,
queries, activity and honest progress labels. Implement a JSON CLI supporting
describe, validate draft, preview, create, submit, query, and outcome lookup.
The CLI calls the same service contracts and signs as its own key. Document
how an existing agent harness invokes it; MCP is optional subsequent packaging.

Use a browser worker for evaluation, IndexedDB for outbox and verified inputs,
and one retained nonce per submitted action. Only mark an optimistic result as
canonical after observing the relevant receipt and interpreting its prefix.
Local outbox order supplies a preview only; concurrent actors can change results.

**Gate:** `npm run test:flows -- --group participation` exercises two isolated
browser identities plus the CLI; online/offline submit; double click; lost
response; conflict/no-op; transport refusal; mobile layout and keyboard access.
No action form or host switch statement names a particular demo domain.
Include hostile view fixtures: scripts/HTML cannot execute, unsupported external
resources do not load, and an auto-submit template produces no signature or act.

### S5 — Activate a definition and preserve pending work

Implement sketch D, control-act authorization, and N/N+1 activation. Keep the
state schema/runtime stable while adding an independently declared action,
query, and view. Stage an old-definition action offline, activate the change
from another client, then deliver the old intent unchanged.

**Gate:** `npm run test:flows -- --group evolution` proves authority is checked
under the old rules, unauthorized and racing activations have no effect,
old/new boundaries replay correctly, and the stale intent is recorded exactly
once as `definition_changed`. Reviewing a replacement creates a new intent
only on an explicit user action. Failed validation preserves the current app.

### S6 — Export, rebuild, and assess the experiment

Implement sketches E–F and archive verification. Remove only the marked test
projection cache, rebuild under the same installed runtime, and compare state,
active definition, per-entry outcomes, retry index, and frontier. Rebuild the
browser from exported/cached content while disconnected. Demonstrate a small
imported-data chart and a static SVG/table export with source-head metadata.

Run history sizes 100, 1,000, and 10,000 with bounded current state. Report
PDS acknowledgment p50/p95, catch-up and full-replay time, browser memory and
runtime load cost. Record hardware/PDS topology and raw measurements. Numeric
latency targets are observations for the next decision, not fabricated pass
thresholds. Responsiveness still requires a usable UI with evaluation off the
main thread and visible progress/cancellation of local preview work.

Have an existing agent create one additional purpose-specific definition after
the host starts, using only its documented adapter. Preserve its source and
tool transcript with secrets removed. Automated fixture generation proves
dynamic loading; this manual exercise tests whether the interface is sufficient
for an agent. Do not represent fixtures as evidence of autonomous generation.

**Gate:** `npm run spike:acceptance` runs all gates and writes a machine-readable
report; `npm run spike:report` creates `notes/YYYY-MM-DD-atseq-spike-results.md`
from measured evidence. A failed gate stays failed, with its exact reproduction.
The result recommends proceed, revise one contract, or stop this approach.

## 8. Verification command contract

These commands must be introduced by S0 and extended by later packages. They
are proposed commands, not a claim that an existing test suite was run.

| Command, from repository root | Required result |
|---|---|
| `npm ci` | Reproduce the committed lockfile after initial setup |
| `npm run check` | Typecheck and static checks, exit 0 |
| `npm test` | Unit tests, including hostile/malformed inputs, pass |
| `npm run spike:feasibility` | Selected runtime/schema/UI/browser fixtures pass |
| `npm run test:protocol` | Independent vectors and chain/retry tests pass |
| `npm run test:pds` | Real test-PDS crash/concurrency/recovery cases pass |
| `npm run test:runtime` | Fold/query/schema and failure semantics pass |
| `npm run test:dynamic-apps` | Two new definitions loaded after host start |
| `npm run test:flows -- --group participation` | Sketches A–C browser/CLI cases pass |
| `npm run test:flows -- --group evolution` | Sketch D activation/outbox cases pass |
| `npm run spike:acceptance` | All required gates, including export/offline replay, pass |
| `npm run spike:report` | Evidence and dated result note emitted without secrets |

Browser flow tests should use Playwright with stable accessible labels and
assert outcomes, not screenshots alone. Preserve representative desktop/mobile
screenshots as review evidence. Unit fixtures use an in-process fake PDS for
focused failure injection; the real-PDS gate is additional and mandatory.

## 9. Completion and decision record

The spike is complete only when all of the following are true:

- Every command above has a recorded result; no required gate was skipped.
- Two unrelated applications and the additional agent-authored example load
  after host start with identical host/client build hashes before and after.
- The definition source sets contain no authored DDL or custom executable JS.
- Browser and agent submit signed acts through the same public contracts.
- The PDS is the canonical log store; caches are demonstrably disposable.
- Queued, recorded, effective, ineffective, and stalled outcomes are distinct
  in APIs and UI, with the source prefix identifiable.
- Activation, old outbox work, export/rebuild, and offline browser replay pass.
- A clean-checkout setup guide reproduces the experiment without sibling repos.
- The exact candidate head has independent architecture, security, and
  simplification review, then is landed and synced under the project workflow.
- The dated results note reports actual capabilities, failed assumptions,
  measurements, and the next smallest implementation decision.

Pause dependent work and record a focused blocker if no bounded shared
evaluator works, conditional PDS writes cannot preserve the log contract,
runtime schema validation requires per-app client generation, or replay needs
unrecorded input. Preserve the experiment and propose the smallest changed
assumption. These are reasons to revise the design, not to conceal a substitute
implementation behind passing demo screens.

## 10. Maintenance and deferred decisions

Keep this note's `status` and the [notes index](README.md) current. Implementation
results belong in a new dated note; do not rewrite failed experiments as if the
original plan predicted their outcome. Amend this plan in place while its
decision stays the same, and use explicit replacement links when it changes.

Subsequent decisions should address large-state access, privacy, OAuth-backed
actor delegation and recovery, activation governance, general migrations,
external effects, and hosting. None should require unique applications to
conform to a fixed workflow or business template. Each new runtime profile must
preserve historical interpretation through retained versions or an explicit
migration decision.
