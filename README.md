# Atseq

Atseq is an experimental framework for small, purpose-specific applications on
[AT Protocol](https://github.com/bluesky-social/atproto). An application is a
bundle of schemas, rules and views that a shared host loads without rebuilding
its server or browser client. People and agents participate through the same
declared actions and queries.

Every action is signed and recorded in an ordered history. The application's
rules determine which actions take effect and how they change its state.
Retaining both the history and the rules makes that state independently
verifiable and rebuildable, including offline.

The **S0–S6 research spikes are complete**, independently reviewed and merged.
This repository contains the working prototype, example applications, tests and
retained evidence. It establishes the design's feasibility; production hosting
and efficient handling of long histories remain future work.

## Why use it for agent coordination?

AT Protocol gives agents durable identities through DIDs (decentralized
identifiers) and public records in each account's signed repository. Others can
copy and verify that data. Those are useful foundations for communication, but
coordinating shared state requires
additional agreements: what order actions happen in, which actions take effect,
and how everyone derives the same result. Arrival order and timestamps across
separate repositories do not establish one agreed order, and the protocol does
not supply an application's rules or rebuildable shared state.

Atseq provides one verified order per app, rules shipped as data, and state
derived from that history. When two participants claim a shared resource, the
rules resolve the contention and govern its hand-back. An action refused by
the application rules stays in the history with its reason; exact retries do
not add duplicate actions. A reader with the installed runtime can replay the
retained definitions and history without the PDS to check how the shared state
was reached. The tool-sharing example below demonstrates this with signed
borrow and return actions.

**Current identity limit:** participants sign with local keys. An agent's
existing AT Protocol account DID is not yet its Atseq participant identity;
account authentication and delegation remain future work.

## What you can do

- **Create an application from data.** Define its vocabulary, initial state,
  actions, queries and interface in a source bundle. Load unrelated applications
  into the same running host without adding application-specific server code.
  Agents can author these bundles as well as participate in the resulting apps.
- **Preview and participate.** Test a definition locally, then start it on the
  test PDS. People use the generic browser interface; agent harnesses use the
  [JSON CLI](docs/interaction.md#json-cli-adapter) to validate and preview source,
  create apps, submit signed actions, query state and inspect recorded outcomes.
- **Keep attributable history.** Concurrent attempts have one verified order.
  An action that fails an application rule remains in the history with its
  reason. Retrying the same action returns its original receipt.
- **Change rules at a recorded boundary.** Compare and activate a compatible
  definition while retaining the old rules for replay. Offline actions signed
  under an old definition remain available for explicit review and replacement.
- **Retain and rebuild an app.** Export its definitions and verified history,
  replay them without the PDS using the installed runtime, and export query
  results as static charts and tables.

The completed pre-v1 spike included the [mending-circle tool desk](experiments/agent-authored/mending-circle-tool-desk/README.md)
for shared sewing tools. In that retained historical app, two people could attempt to borrow the same shears:
the first borrow took effect, the second was recorded as `tool_in_use`, and only
the borrower's signing key could return them. Its schemas, rules and view were
application content loaded through the generic host. An agent authored the app
and used the JSON CLI without changing the host; its retained
[transcript](experiments/agent-authored/mending-circle-tool-desk/transcript.json)
records 22 adapter calls. The S6 authoring gate verifies its original source and
replays its signed history with the retained pre-v1 interpreter. The v1 runtime
refuses that historical profile. Current examples track garden rainfall and a guitar search.

## How the design fits into AT Protocol

AT Protocol supplies application identity, repository storage and transport.
Each Atseq app has its own DID (decentralized identifier) and repository on a
PDS (Personal Data Server). The repository retains its definitions, signed
actions and explicit log records.

An application definition combines three parts:

| Part                                                      | Role                                                                          |
| --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Lexicon schemas                                           | Describe state, action inputs and query interfaces; validate them at runtime. |
| [JSONata](https://github.com/jsonata-js/jsonata) programs | Decide an action's effect, compute successor state and answer queries.        |
| Retained view templates                                   | Bind query results and action controls to a small set of local UI primitives. |

The execution model is a **fold over a log**: start with the declared initial
state and apply each recorded action's rules in order. The code calls this
interpreter the _folder_. The server and browser use the same bounded execution
profile, so either can derive state from the same verified inputs.

1. A participant signs an action bound to an app and definition.
2. The sequencer verifies the submission and assigns its position. It atomically
   writes a signed entry and advances the head using the PDS's `applyWrites`
   operation.
3. The folder verifies the history and retained definitions, then interprets
   the actions. It records whether each action took effect.
4. Queries and views describe the resulting state at an exact interpreted
   position. A downloaded archive can reproduce that same state.

AT Protocol repositories are mutable snapshots. Atseq adds explicit predecessor
links, positions, actor signatures and sequencer signatures to retain a
verifiable application log. Order comes from those records, rather than
notification arrival or timestamps. The sequencer orders actions; application
rules decide their business effect. A saved action may therefore be awaiting
interpretation or be recorded without taking effect.

The [protocol](docs/protocol.md), [PDS host](docs/pds-host.md) and
[definition contracts](docs/definitions.md) describe the implementation and trust
boundaries, including the participant identity limit noted above.

## Try an application

Use Node 22.13 or later; the retained acceptance run used Node 26.10.0.
From this checkout:

```sh
npm ci
npm ci --prefix experiments/pds
npm run dev:app
```

Open one of the printed preview links for **Garden rainfall** or **Weekend
guitar search**. Try sample actions locally, create a signing identity, then
choose **Start** to publish the app on the disposable loopback test PDS. Use
synthetic data: PDS publication is public. Ctrl-C stops the services; each run
starts a fresh test environment and leaves marked local data for inspection.

The [interaction guide](docs/interaction.md) explains source import, signing,
progress labels and the JSON CLI for agent harnesses. The
[evolution guide](docs/evolution.md) covers definition changes and queued work;
[archives and replay](docs/archives.md) covers offline use and static exports.

## What the spikes were for

The spikes tested the uncertain parts of the architecture in successive,
bounded experiments: could declarative apps run consistently in a browser and
host, use a real PDS as their retained substrate, evolve, and remain recoverable?
They also measured the costs before committing to a larger implementation.

| Spike                                                                     | What it established                                                                                                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [S0 — runtime feasibility](notes/2026-09-06-atseq-runtime-feasibility.md) | One bounded evaluator in Node and a browser worker, runtime Lexicon validation and local view rendering; comparison with the alternative Go core. |
| [S1 — protocol](notes/2026-09-06-atseq-protocol-spike.md)                 | Canonical signed bytes, verifiable order and exact retry identity, checked against independent vectors.                                           |
| [S2 — persistence](notes/2026-09-06-atseq-pds-spike.md)                   | Atomic appends, crash recovery and source retention through the official PDS's real HTTP and SQLite implementation.                               |
| [S3 — definitions and state](notes/2026-09-06-atseq-runtime-spike.md)     | Retained source bundles, deterministic interpretation and queries, and unrelated apps loaded after host startup.                                  |
| [S4 — participation](notes/2026-09-06-atseq-interaction-spike.md)         | A generic browser and JSON CLI sharing contracts, independent signing identities and recoverable publication.                                     |
| [S5 — evolution](notes/2026-09-06-atseq-evolution-spike.md)               | Compatible definition activation, historical rule boundaries and explicit handling of stale offline actions.                                      |
| [S6 — retention and acceptance](notes/2026-09-06-atseq-spike-results.md)  | Complete archives, offline rebuild, static exports, agent authoring and performance measurements through 10,000 entries.                          |

The completed acceptance run passed all 13 gates, including 305 full-suite
tests. The [completion record](notes/2026-09-06-atseq-spike-completion.md)
records the pre-v1 review and landing; the [results](notes/2026-09-06-atseq-spike-results.md)
and [acceptance report](experiments/acceptance.json) retain the measurements
and evidence. The current reports and most screenshots and archives were
regenerated under v1; the spike notes describe the original measurements at
[26d1528](https://github.com/generalbusiness-ai/atseq/tree/26d15287f3955eebd543f2c519c8506378c63d60).
The agent-authored mending-circle example is a retained pre-v1 capture, replayed
with its original interpreter.

To reproduce the complete acceptance run, install the dependencies above,
Chromium and Go 1.26.7 or later (Go is used only for the S0 core comparison):

```sh
npx playwright install chromium
npm run spike:acceptance
```

This runs the documented gates and measurements and overwrites retained
experiment evidence. The [acceptance runner](scripts/acceptance.ts) lists all
13 commands, including archive, performance and authoring checks. The
[spike plan](notes/2026-09-06-atseq-initial-spike.md) records the original gates
and their setup. Use `npm run test:archive` for the archive gate alone, or
`npm run dev:experiment` for the original S0 browser probe.

## Current limits

The prototype uses one bounded state document per app, an integer-only
evaluation profile, a restricted expression language and three local UI
primitives. Deterministic execution failures record an ineffective outcome and preserve
state; later entries continue. Missing required content, failed storage or runtime faults pause
interpretation until repaired. The v1 contracts use the owned `ai.generalbusiness.atseq.*` namespace and semantic
CIDs, with source and dependency provenance recorded separately. They deliberately
refuse historical spike profiles. See the [runtime profile](docs/runtime-profile.md) for exact
bounds.

The current host repeatedly serves and verifies the full history. At 10,000
entries, the retained local run measured a median confirmed append of 15.23
seconds and browser replay plus transfer of 14.68 seconds. Efficient verified
catch-up is needed before using this host for long-lived, growing histories.
These measurements describe one machine, rather than production capacity.

Private application data, production deployment and authentication,
state-transforming migrations, creation of successor apps under new profiles, sequencer failover and external
side effects remain outside the completed spikes.

## Related projects and design material

- [GitSeq](https://github.com/generalbusiness-ai/gitseq) supplies the architectural
  precedent of authenticated ordering with separate application interpretation.
  Its workroom tracks development of this repository.
- [Tailapps](https://github.com/generalbusiness-ai/tailapps) supplies a declarative
  execution precedent. Its Go `jsonataddl` core was evaluated in S0; the selected
  Atseq runtime uses the JavaScript JSONata evaluator.
- [atcute](https://github.com/mary-ext/atcute) supplies reused AT Protocol
  encoding, content-identifier, archive and cryptographic tooling.

GitSeq and Tailapps are architectural precursors, with no Atseq runtime
dependency or compatibility requirement. For the broader rationale, read the
[architecture](notes/2026-09-06-atseq-architecture.md), written before the
experiments; the [notes index](notes/README.md) distinguishes design proposals,
completed results and remaining work.
