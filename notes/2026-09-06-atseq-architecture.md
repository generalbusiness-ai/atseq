---
date: 2026-09-06
status: adopted for the initial spike; implementation started
companion: notes/2026-09-06-atseq-initial-spike.md
origin: declarative application framework discussion and reviewed design draft
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:95a7a733307fc1d78d8de0cf32c76f9a1b0e4502
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
---

# Atseq: declarative applications on atproto

Atseq is a framework for agents to create unique applications for particular
purposes. An application may last ten minutes or many years. Its vocabulary,
behavior, interface, and participation rules can change as the purpose changes.
The execution model is a **folder over a log**: authenticated acts have one
order; a declarative definition determines their effect.

This note records the proposed architecture. The [initial spike plan](2026-09-06-atseq-initial-spike.md)
turns a deliberately small subset into an experiment with observable gates.
Neither note describes shipped software or authorizes starting implementation.

## 1. Intent and lineage

An instrument search, a chart, a support circle, a game, and a business can
each have their own model. Creation should produce content that an existing
host loads, without deploying another application server or rebuilding its
browser client. Shared vocabularies and components are useful building blocks;
an application category, owner role, task lifecycle, or obligation model is
never mandatory.

GitSeq is an architectural precursor with its own Git-oriented ecosystem. It
informs the distinction between authenticated ordering and interpretation.
It creates **no runtime dependency or source, wire, data, signature, or
behavioral compatibility requirement** for atseq. Atseq defines its own
contracts and fixtures. [GitSeq background](https://pkg.go.dev/github.com/generalbusiness-ai/gitseq/host)

Tailapps is a related declarative execution precedent. Its `jsonataddl` module
is a candidate for code reuse, subject to a bounded integration experiment.
The GitSeq workroom used to develop this repository is development tooling
only; its requests and roles do not become atseq application semantics.

## 2. The architecture

```text
human UI / agent adapter
          |
     signed intent
          v
      sequencer ---- atomic append ----> app DID's PDS repository
                                                 |
                                       verify log and definitions
                                                 v
                                         Lexicon + JSONata
                                                 |
                                        state + interpretation frontier
                                                 v
                                         queries / views / agents
```

The repository retains the authoritative inputs: acts, their order, definitions,
and required content. The sequencer authenticates and orders. The folder
interprets. Cached projections, receipts about effectiveness, and query results
identify the log prefix they describe and can be rebuilt.

One service can sequence many applications, each with its own DID, repository,
genesis, and order. There is no global application order. Cross-application
atomic transactions are outside the initial design.

## 3. Application definitions

Authors supply Lexicon definitions, JSONata programs, and declarative views.
The authoring representation is:

```text
manifest.json          purpose, initial state, runtime, bindings, dependency CIDs
lexicons/*.json        acts, state values, fold and query contracts
folds/*.jsonata        deterministic transitions
queries/*.jsonata      computed query results
views/*.json           component trees and action/query bindings
```

The manifest roots an immutable, retained dependency graph. The directory is
an authoring convenience; hosting does not require a filesystem per app.
Only the user-visible purpose and necessary application content enter the
published definition, not private agent reasoning or credentials.

Lexicon is the sole authored IDL, including logical state and the inputs and
results seen by the folder. Framework binding records have their own Lexicons
and reference application schemas. They do not duplicate field declarations
or insert undocumented execution attributes into standard schema objects.

Lexicon query definitions describe interfaces. Query computation still needs
an expression or documented host convention. JSONata supplies that computation.
Authored DDL is unnecessary; physical storage and indexes belong to the host.
[Lexicon specification](https://atproto.com/specs/lexicon)

An app carries its own pinned schemas and can use them immediately. Public
NSID discovery additionally needs the existing namespace publication mechanism.
A provider can provision names under its own authority; users need no manual
DNS setup for the spike. Bundling a schema alone does not make it publicly
resolvable. [Publishing Lexicons](https://atproto.com/guides/publishing-lexicons)

## 4. Admission and interpretation

The sequencer checks protocol shape, signatures, target application, transport
bounds, and retry identity. It does not execute the application or decide
business permissions. A well-formed signed act can be recorded and then have
no application effect. That attempt remains attributable history.

For example, two participants update the same candidate from the same prior
version. Both acts enter the log. The application makes the first effective
and the second ineffective because its precondition is no longer true.

Distinguish:

- **Queued on this device:** signed locally; canonical receipt unknown.
- **Saved, awaiting interpretation:** committed to the PDS, beyond the folder's frontier.
- **Applied:** recorded and effective at the stated prefix.
- **Not applied:** recorded and ineffective, with an attributable reason.
- **Interpretation paused:** missing content, unsupported runtime, invalid
  history, invalid program output, or execution failure prevents progress.

A transport refusal is separate from all recorded outcomes. A timeout or
process failure cannot become a deterministic domain rejection. Atomically
commit the next state, effectiveness outcome, and interpretation frontier;
failure leaves the previous projection intact.

## 5. The atproto log

| Requirement | Proposed mechanism |
|---|---|
| Stable application identity | Application DID plus a pinned genesis CID |
| Actor attribution | Actor-signed intent bound to the app, definition, and payload |
| Verifiable order | Sequencer-signed entry with position and predecessor CID |
| Discoverable progress | Head record naming the latest entry CID and position |
| Atomic append | Create entry and advance head in one conditional repository batch |
| Content retention | Referenced records/blobs plus a complete export manifest |
| Replay | Verify the chain and dependency closure before interpreting each prefix |

Atproto repositories are mutable snapshots of public content. Their native
commit history is not our durable log. Explicit entry links, retained records,
writer discipline, and verification provide the log semantics. A known head
detects a conflicting or truncated history; signatures alone cannot prevent
equivocation or guarantee availability. [Repository specification](https://atproto.com/specs/repository)

The genesis fixes the protocol/runtime identifiers, initial definition, initial
sequencer key, and initial activation authority. An invitation/export carries
the app DID and genesis CID. First-open trust in that anchor is explicit;
later discovery of a different genesis for the same app is an error. Current
DID resolution supplies routing and publication context, not retroactive proof
of every historical actor key.

Initial state comes exclusively from the referenced definition; genesis does
not duplicate it. The genesis runtime identifier must agree with that definition.

Retain actor and sequencing proofs independently of the PDS repository
signature. Actors sign application intent; the sequencer signs position and
predecessor. Specify domain separation, canonical bytes, key encoding, and
signature verification in atseq's own test vectors. Reuse existing atproto
cryptographic implementations rather than inventing cryptography.

The initial deployment has one designated writer per app. Sequencer failover,
key rotation, and account recovery need later explicit protocols. A PDS
compare-and-swap operation is not by itself a leadership protocol.

## 6. Canonical writes and delivery

1. Verify the signed intent and protocol limits.
2. Reconcile the verified head and the retry index derived from retained intents.
3. Return the original receipt for an exact retry; reject reuse of its retry
   identity with different signed content.
4. Construct the next signed entry.
5. Atomically create it and advance the head using `com.atproto.repo.applyWrites`
   with `swapCommit`.
6. Acknowledge after PDS confirmation. Projection and notification follow.

On a conflict, verify the new head before retrying the unchanged intent. After
an uncertain response, find its existing entry before choosing a new position.
The concrete batch operation is supplied by the PDS. [applyWrites contract](https://raw.githubusercontent.com/bluesky-social/atproto/main/lexicons/com/atproto/repo/applyWrites.json)

Notifications tell clients to fetch; they do not establish order or replace
durable retrieval. Bootstrap, reconnect, and polling recover from a pinned head
using repository reads or an export, validating predecessor links and CIDs.
Never infer order from notification arrival, relay cursors, or timestamps.
During concurrent growth, finish the chosen prefix and then advance to a new
verified head. Missing or overwritten content pauses verification.

PDS availability and write latency are on the commit path. A local optimistic
preview does not make an offline act canonical.

## 7. Execution and reuse

The initial spike uses **one bounded Lexicon-typed state document per app**.
Folds receive the preceding state, the act, and explicit verified metadata.
They return a complete effective successor state, or an ineffective reason.
Queries are pure expressions over that state and their parameters.

This is a spike profile, not a large-state storage commitment. It avoids
designing another query DSL while testing runtime authoring, shared interaction,
and replay. The plan specifies byte bounds and measures history replay. Larger
state, incremental keyed reads, and indexes require a later performance decision.

The local Tailapps source demonstrates `LoadApplication`, immutable application
handles, bounded evaluation, typed read/mutation plans, and a SQLite read
authorizer. Its loader still consumes DDL and its dialect exposes a constrained
two-stage topology. A new dialect alone does not prove a suitable Lexicon
frontend or browser build. Assess a facade or generated internal bridge;
otherwise evaluate one existing JSONata interpreter shared by host and browser.
Keep the accepted atseq contract independent of that choice. [Core documentation](https://github.com/generalbusiness-ai/tailapps/blob/main/jsonataddl/README.md)

The runtime profile pins evaluator, validation, canonicalization, numeric
rules, bindings, and deterministic limits. It excludes ambient clock,
randomness, network, and arbitrary host callbacks. Inputs from the outside
world enter as attributed acts. Decimal encodings must be explicit because
the atproto data model excludes floats. [Data model](https://atproto.com/specs/data-model)

The host validates input/output schemas as well as execution limits. Resource
exhaustion stalls interpretation; it does not produce a successful empty
result. Essential offline use requires the same admitted execution profile in
the browser. A server-only implementation must say that browser replay remains
unproven.

## 8. Evolution and authority

Definition publication and activation are separate. An activation act at
position N is interpreted under the preceding definition and authority rules.
If effective, the new definition applies from N+1. Retain both definitions and
all referenced content. An ineffective activation leaves the old definition active.
Unavailable candidate content pauses interpretation until it can be verified;
only an available candidate can be judged deterministically invalid.

The first spike requires exact matching between an ordinary intent's declared
definition CID and the active definition. An old outbox intent is retained but
ineffective with `definition_changed`. It is never rewritten or re-signed
automatically. A user can review a replacement action under the new definition.

Creation confers no permanent special authority. Genesis names an explicit
initial activation grant; future delegation/replacement must be governed by
the prior rules. The spike tests a fixed initial grant and refusal of an
unauthorized activation. It does not implement general governance or key rotation.

The first activation experiment preserves the state schema and runtime while
adding an action/query/view. State-transforming migrations remain later work.
Replaying history uses each definition at its original boundary; it does not
apply the newest program retroactively to every act.

## 9. Human and agent interaction

A shared client discovers an app's purpose, schemas, actions, queries, and views
at runtime. An agent adapter exposes those same contracts as structured tools.
Descriptions and constraints explain participation; schema shapes alone cannot.
The application may express offers, evidence, observations, or decisions without
imposing work obligations on participants.

Views bind to named queries and construct declared actions. Controls submit
through the same signing path as agents, and render the resulting outcome.
The interface shows progress using ordinary language, while an inspector can
show the definition, position, CID, and signatures behind it.

Inlay's component records, template resolution, and host primitives are strong
reuse candidates. Atsui describes primitive interfaces through Lexicon.
Test a small view and action binding before adopting the renderer. Essential
views need local implementations and pinned dependencies; external rendering
endpoints remain optional live services. [Inlay](https://tangled.org/danabra.mov/inlay/)

Generated views are data interpreted through allowlisted primitives. Templates
cannot access signing keys, execute script/HTML, or submit actions on load.
Human submission requires an explicit control interaction; agent submission
requires an explicit adapter call. The spike resolves content only from its
configured test PDS or retained archive.

Keep a generic form, result view, and schema inspector as recovery/authoring
affordances. A missing custom component should not erase access to the app's
meaning or silently submit a different action.

## 10. Ecosystem boundaries

| Project | Reuse decision for the spike |
|---|---|
| atcute / official atproto tooling | Use existing XRPC, Lexicon, CID, CBOR, crypto and client machinery; verify dynamic validation against a pinned bundle. |
| Inlay / Atsui | Test the portable view model; keep one small generic renderer available. |
| HappyView | Candidate later host if its runtime registration reduces glue. Default user-repo writes and automatic schema updates need adaptation. |
| atproto-wc | Optional record/profile components and inspection; not the folder. |
| Block Buzz | Learn shared human/agent participation and attention design. Buzz uses Nostr, so its relay is not an atproto dependency. |

Sources: [atcute packages](https://github.com/mary-ext/atcute),
[HappyView schema lifecycle](https://happyview.dev/guides/lexicons),
[atproto-wc](https://github.com/iammatthias/atproto-wc),
[Buzz](https://github.com/block/buzz).

The spike selects only the components needed for its gates. It does not stack
every candidate framework together. OAuth and service permissions can later
authenticate API access, but do not themselves sign an exact durable act or
decide its business effect. The initial local-key identity limitation is
visible in the plan and UI. [Permissions](https://atproto.com/specs/permission)

## 11. Scope and review conclusions

The review clarified the trust anchor, actor-key distinction, catch-up path,
activation boundary, stale-intent outcome, interpretation failures, and minimum
state model. These are framework contracts, not hidden adapter behavior.

The initial spike must prove two unrelated definitions loaded after host start,
attributable concurrent interaction, honest pending/ineffective states, one
definition evolution, export/rebuild, and browser replay of the chosen profile.
It uses synthetic data on a disposable test PDS. Ordinary PDS publication is
public; UI filtering cannot provide privacy. Real hospital, personnel, customer,
or financial records need a separate confidentiality design before use.

External side effects, real account delegation, production deployment,
large-state query optimization, state-transforming migrations, multi-writer
failover, and automated background agents are outside the first spike. The
long-term purpose remains broader; the experiment should establish whether
this small basis is useful before adding those capabilities.
