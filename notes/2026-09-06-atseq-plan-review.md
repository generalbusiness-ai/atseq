---
date: 2026-09-06
status: independent review of the proposed architecture and spike plan; no plan change adopted yet
reviews:
  - notes/2026-09-06-atseq-architecture.md
  - notes/2026-09-06-atseq-initial-spike.md
reviewed_at: efbd900
corrected_after: git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:b1b80609adc9fc79396fe2ab95c17bd5ff7624a0
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:95a7a733307fc1d78d8de0cf32c76f9a1b0e4502
---

# Atseq plan review: efficiency, adoption, and expressiveness

This note is an independent analysis of the architecture note and the initial
spike plan at commit `efbd900`, read against the design goals recorded in the
originating discussion. It asks three questions. Is the proposed system
efficient enough, at the spike and beyond it? Is it easy to adopt, for the
people who join an app and for the agents that write one? Is the authoring
language expressive enough for the broad range of applications the design
claims, without becoming opinionated?

The short answer: the contracts are sound and unusually honest about failure
states, and the plan should proceed. Six choices deserve revision before the
work packages that depend on them, and one gap between the motivating examples
and the substrate needs a stated decision. None of them requires abandoning
the design. Four of the recommendations (F1, F2, F4, F7) would change an
accepted contract or gate, so they are proposals for a replacement decision,
not amendments the plan can absorb in place. The current plan stays governed
by the adopted commission until such a decision is adopted.

This revision corrects the first version after independent review
(verdict `ff7624a0`): it names which recommendations change accepted
contracts, narrows the F2 efficiency claim, and qualifies the F6 statement
about the JavaScript engine's built-in limits.

## 1. What the design is for

The originating discussion set these goals, in the commissioner's own words:

- "the 'small application model over a decentralized substrate' that enables
  rapid/instant creation of coordination-spaces for tasks, status, gameplay…
  'shared state' with a fairly-traditional data modeling expression, with an
  interaction over it for multiple actors, and with local-first or optimistic
  commit"
- "Total order (within one application!) and did-per-app seems closest to
  what I'm looking for."
- "Reducing the adoption friction it would be good to have lightweight
  infrastructure (ok to host on cloudflare or a hyperscalar) and some
  browser-only experience that might later extend to an executable/client/
  mobile/app shell"
- An app is "the thing that helps you go through a process", spun up by a
  service or a personal agent, that "reaches out to other people and agents
  who would be useful within the process, and they each participate according
  to different roles and capabilities."
- "I'm very resistant to making obligations explicit for *people* unless they
  have a specific commercial role to play." The application "doesn't even
  'belong' to a specific person."
- The same model must cover "I'm looking (not very actively) for a 1968 Les
  Paul" and "My investment portfolio", as well as a task board, a game, and
  "Joe's in hospital".

The discussion also proposed a design test for the authoring language: could
the same small language comfortably express a task board, the Les Paul search,
and the investment portfolio without special cases? This review uses that
test.

The commission that governs both notes adds three constraints: GitSeq is a
precursor only, authoring is Lexicon-first with no direct DDL, and humans and
agents share one interaction path. The review treats those as fixed.

## 2. What the plan gets right

These should not change.

- **Order and interpretation are separated.** The sequencer authenticates and
  orders; the fold decides effect. A recorded act can be ineffective and stay
  attributable. This is the property that makes the log rebuildable and is
  stated clearly in architecture section 4.
- **Five outcome states, named honestly.** Queued, saved, applied, not
  applied, paused. Transport refusal is kept apart from recorded outcomes, and
  a timeout can never become a domain verdict. Most systems in this space
  blur exactly these lines.
- **The explicit hash chain.** Position and predecessor CID in the entry, not
  repository revisions or relay cursors. The discussion identified this as the
  decisive mismatch between an atproto repository and a log, and the plan
  answers it correctly.
- **Retry identity bound to content, not signature bytes.** ECDSA malleability
  is handled at the right layer.
- **Activation at an explicit boundary, judged under the old rules.** No
  retroactive reinterpretation of history.
- **No owner.** Genesis names an activation grant, not a permanent role. This
  matches the commissioner's strongest stated preference.
- **Speculation is ordinary semantics.** The browser runs the same fold over
  canonical state plus its outbox. No CRDT leaks into the application model.
- **Failure gates that refuse to hide.** The plan repeatedly says a failed
  experiment is published, not disguised. Keep that.

## 3. Findings

Each finding names the affected section, the evidence, and a recommendation
with its cost. They are ordered by how early they bite.

### F1. The PDS is on the commit path, and the plan's largest package proves the substrate before the hypothesis

**Where:** architecture sections 5 and 6; spike section 4 (write behavior)
and S2.

**Evidence.** Every canonical write is `applyWrites` with `swapCommit` against
a PDS, acknowledged only after PDS confirmation. S2 requires a real disposable
PDS, provisioning, account prefixes, Docker, and crash and concurrency tests
against it. The discussion recommended the opposite order: keep the
sequencer's own log canonical first, add PDS publication as a second stage,
and make the publisher "optional in the first prototype", because "if you make
PDS account provisioning, repo semantics, relays and PLC machinery a
prerequisite for proving the application model, you'll learn much more
slowly." It also noted that this "avoids putting PDS latency or operational
behavior on your transaction path."

**Efficiency.** A PDS write is a repository commit: a Merkle tree update, a
signed commit, a relay event. A game or a status board produces many small
acts. Each one becomes a full commit on the hot path. That is the wrong cost
shape for the chattiest of the motivating apps, and it is a cost the design
pays even where nobody needs public replication.

**Adoption.** The plan's answer to "what is required for the infrastructure"
is currently: a PDS account per app, a DID per app, and a sequencer. The
discussion's Level 0 was a static browser shell plus a hosted sequencing
service. The gap between those two answers is exactly S2.

**Recommendation.** Define the log store as an interface in S1 with two
implementations: an in-process append-only store used by S3, S4, and the unit
suites, and the PDS-backed store. Move S2 after S4. Keep the PDS store's gate
mandatory before S6, so the experiment still proves that conditional PDS
writes preserve the log contract. The architecture note should then describe
publication to the PDS as the durable, portable representation, and the
sequencer's store as the commit path, which is what the discussion's Stage 2
proposed. Cost: one interface and one reordering. Benefit: the hypothesis
(authoring, shared interaction, replay) is tested weeks earlier, and the
design regains the Level 0 deployment shape.

Be clear about what this changes. Retaining the PDS gate is not the same as
retaining the current contract. The accepted architecture makes the PDS
repository the canonical log and the commit path; this recommendation makes
the sequencer's store canonical and the PDS a publication of it. It also
reorders S2, which the plan lists as an explicit prerequisite of S4. Both are
changes to accepted contracts and need a replacement decision before anyone
builds to them.

If the authors prefer to keep the PDS canonical on principle, the note should
say why the discussion's staged argument was rejected, and should add entry
batching (several queued intents in one `applyWrites`) to S2 so the commit
cost is amortised.

### F2. Complete-successor-state folds make every act cost O(state)

**Where:** architecture section 7; spike section 3 (state and programs) and
the caps table.

**Evidence.** A fold returns "a complete effective successor state". The host
validates the output against the state Lexicon, canonicalises it, and replaces
the projection. State is capped at 128 KiB; fold input and output at 256 KiB.

**Efficiency.** Per act: decode, verify, validate the input, evaluate JSONata
over the whole document, validate the whole output document, re-encode, and
write. Full-document validation twice per act is the dominant cost, and it
grows with state, not with the change. Replay of 10,000 acts at 128 KiB is
about 1.3 GB of validated JSON. S6 measures this; the review predicts that the
measurement will show validation and serialisation, not JSONata evaluation,
as the cost, and that the number will not be acceptable for the portfolio
class of app.

**Expressiveness.** Apply the three-app test. A task board fits in a document.
The Les Paul search fits, with candidates, sightings, and rejections as small
lists. The investment portfolio does not: its state is a growing set of
positions, lots, transactions, and decisions. The note says "repeated acts can
produce a long history while the current state remains bounded", which is true
for a counter and false for a ledger. The spike's own examples (guitar search,
support circle) are both of the bounded kind, so the plan does not currently
exercise the case that breaks the assumption.

**Recommendation.** Change the fold output contract from a complete successor
state to a set of effects over keyed records: put, delete, and a bounded
top-level patch. The state Lexicon then describes a small root plus named
collections of records, each record validated on its own. The host applies
the effects; folds are expressed as reads over state and writes over the
records they touch. The discussion proposed exactly this shape, with the
semantic action and its deterministic effects both retained in the entry.
Three consequences follow:

- Validation is O(change) instead of O(state). That is the narrow claim.
  Reads inside a fold, queries, indexes, and serialisation of the state a
  client holds can still depend on state size; the effects model lets a host
  make those incremental later, it does not make them so by itself.
- Effects are recorded, so the activity inspector can show what an act did,
  not only that it was effective.
- Incremental storage, keyed reads, and indexes later become a host decision
  with no change to authored programs. Today they would require rewriting
  every fold.

This alters the accepted fold contract, as F1, F4 and F7 alter other accepted
contracts and gates, and it should be decided before S3. The document model can stay as the browser's
in-memory representation. If the authors keep complete-state output for the
spike, the plan should add a third fixture app with ledger-shaped state and
make S6 replay it, so the limit is measured rather than assumed.

### F3. Authority is expressible but not declared, so nobody can see it

**Where:** architecture sections 8 and 9; spike section 4 (definition
activation) and sketch B.

**Evidence.** The fold "supplies domain validation, stale-definition checks,
authorization for control acts, and application effectiveness". Authority
therefore lives inside each fold's JSONata. The discussion put `can(actor,
action, state)` at the foundation and treated roles as optional bundles.

**Expressiveness.** An author can write authorization in a fold today. What
they cannot do is tell a client about it. The discussion's key interaction was
two people opening the same link and seeing different actions because their
capabilities differ, and a "for me" view of what needs attention. The current
contract cannot render either: the shell learns that an act was ineffective
only after it was signed, sequenced, and recorded. Agents suffer the same way.
A structured tool list that includes actions the agent may not perform is a
poor tool list.

**Recommendation.** Add an optional `allow` expression to the action binding
Lexicon: a pure JSONata expression over `{meta, state}` returning a boolean.
The host evaluates it in three places: to filter the discovered actions for a
given actor, to show an honest affordance in views, and as a precondition
before the fold runs. The fold remains the authority, and an act that passes
`allow` may still be ineffective. Cost: one field, one evaluation. Benefit:
generic clients can implement the two flows above without a domain switch
statement, which the S4 gate already forbids.

### F4. Exact definition-CID matching will invalidate every outbox on every compatible change

**Where:** architecture section 8; spike section 4 (definition activation)
and sketch D.

**Evidence.** "The first spike requires exact matching between an ordinary
intent's declared definition CID and the active definition." The first
activation experiment deliberately preserves the state schema and runtime and
adds a query and a view.

**Adoption.** Under this rule, adding a view invalidates every pending intent
in every participant's outbox, and each participant sees "One queued action
used the previous app definition." The plan's own first activation is a change
that should affect no pending action at all. The rule is strict where the
discussion asked for rebase semantics: "perform this action against whatever
current state exists when accepted", with strictness expressed as a
precondition when an action needs it.

**Recommendation.** Bind an intent to the CID of its action binding (input
schema plus fold source), not to the whole definition. This changes the
signed intent (its compatibility field), the exact-match rule, and the
meaning of `definition_changed`, all of which the spike plan freezes at S1;
it is a contract change that needs adoption, not an amendment. An activation that
leaves an action's binding unchanged leaves that action's pending intents
effective; one that changes the binding produces `definition_changed` as now.
The fold always runs under the active definition. Actions that must see the
state they were signed against declare an expected version in their input
schema and check it in the fold, which is the strict mode from the discussion.
Cost: one CID computed per binding at definition validation. Benefit: sketch D
becomes the exception it should be.

### F5. Actor identity is a bare key, and the intent has no place for the DID

**Where:** architecture section 10 (permissions); spike section 4 (identity).

**Evidence.** Actors hold local P-256 keys. "A displayed name is a local label,
not a verified atproto account identity." OAuth and delegation are deferred.
The intent Lexicon lists an actor key identifier and no actor DID.

**Adoption.** Deferring OAuth for the spike is right. The discussion's model,
though, was an atproto DID that proves persistent identity and registers
per-device keys that sign offline. Leaving the DID out of the intent means the
intent envelope changes when OAuth arrives, and every vector, fixture, and
retained entry from the spike describes a different wire format.

**Recommendation.** Reserve an optional `actor` DID field in the intent
Lexicon at S1 and carry it unverified in the spike, with a stated rule that
the spike's admission ignores it. Define, but do not implement, the control
act that binds a device key to a DID. Cost: one optional field and one
paragraph. Benefit: the S1 vectors survive the identity work.

### F6. The evaluator experiment is ordered against the harder gate

**Where:** architecture section 7; spike section 3 (runtime choice) and S0.

**Evidence.** "Evaluate Tailapps' jsonataddl first for a facade over the
state-document contract", then fall back to "an existing JSONata engine usable
in both Node and the browser". Browser replay of the same profile is a hard
completion criterion. jsonataddl compiles DDL to SQLite, uses a Go SQLite
driver, and exposes a two-stage topology; the note already says a new dialect
alone does not prove a browser build.

**Efficiency of the plan itself.** The browser gate is the constraint that
decides the question. The candidate most likely to satisfy it is the
JavaScript JSONata implementation (`jsonata`, 2.2.2 at the time of this
review), which runs unchanged in Node and the browser. A Go-and-SQLite facade compiled to WebAssembly is many megabytes and
would still need a facade to hide DDL from authors. Ordering the experiment
with jsonataddl first spends the first package on the option least likely to
pass.

**Recommendation.** Start S0 with the JavaScript engine and freeze the bounded
profile around it. Treat jsonataddl as a later host-side option if the
effects model in F2 grows a SQL-backed store. Two facts to record when the
profile is frozen. First, `jsonata` 2.2.2 has built-in evaluation options for
a wall-clock timeout, a maximum stack depth, and a maximum sequence length,
plus evaluation entry and exit hooks; a deterministic operation counter is
not built in and needs a wrapper on those hooks. Second, the plan's rule that
limit exhaustion pauses interpretation rather than producing a verdict is
what keeps the wall-clock limit from making host and browser disagree; the
depth and sequence limits are deterministic and can be part of the profile. Cost: a
reordering. Benefit: S0 answers the browser question first.

### F7. Views: the generic renderer should be the gate and Inlay the experiment

**Where:** architecture section 9; spike S0 and S4.

**Evidence.** S0 must "render one Inlay template into local primitives"; the
generic form, result view, and inspector are described as "recovery/authoring
affordances".

**Adoption.** For an agent that has just written a definition, the generic
renderer is the first thing it sees and the only thing it can rely on. Inlay
is an external project with its own record model and resolution rules. The
plan's own sketches are all forms, lists, and status lines, which a generic
renderer produces from schemas and query results with no template at all.

**Recommendation.** Make the schema-driven generic renderer the S0 and S4
gate, with declared views as optional refinement, and keep the Inlay fixture
as an experiment recorded in `experiments/`. This replaces the S0 gate's
Inlay rendering requirement with a different requirement, so it is a gate
change that needs adoption. Cost: none in code; it removes an external
dependency from the critical path.

### F8. No checkpoint in the protocol

**Where:** architecture sections 2 and 6; spike S6.

**Evidence.** Caches are disposable and rebuilt from the log. Bootstrap
"recover[s] from a pinned head using repository reads or an export". There is
no signed checkpoint record. The discussion assumed one, so that "browser
startup doesn't require replaying 100,000 transactions", and the motivating
apps include ones that last "many years".

**Efficiency.** Without a checkpoint, a new participant's first open costs the
whole history. F2 lowers the constant; it does not change the shape.

**Recommendation.** Define a checkpoint record at S1 (state CID, active
definition CID, position, sequencer signature) and reserve it in the
framework Lexicons. Implementation can wait for S6, where it turns the
10,000-entry replay measurement into a choice rather than a fact. A client
that distrusts a checkpoint can always replay from genesis. Cost: one schema.

### F9. The authoring surface is five artifact kinds in three notations

**Where:** architecture section 3; spike sections 3 and 6.

**Evidence.** A definition is a manifest, Lexicon files, fold programs, query
programs, and view documents. A task board needs, at minimum, a state schema,
three action schemas, three folds, one or two queries, and a view: about ten
files.

**Adoption.** The author is usually an agent in an existing harness. Agents
write single documents far more reliably than coherent directory trees with
cross-references by file name, and every cross-reference is a validation
failure waiting to happen. Lexicon is verbose for small types, and it has no
place to state a state invariant, so invariants end up repeated in each fold.

**Recommendation.** Keep the directory layout as the retained, published form
and add a single-document authoring bundle that the CLI accepts and expands,
with `describe` returning the same bundle. Provide the three-app test set
(task board, Les Paul search, portfolio) as complete bundles in
`testdata/apps/`, so an agent has three worked examples spanning loose,
medium, and strict semantics. Cost: one converter and three fixtures. Benefit:
the S6 manual exercise, where an existing agent writes a definition through
the adapter alone, has a fair chance of succeeding.

### F10. The motivating examples are mostly private, and the substrate is public

**Where:** architecture section 11.

**Evidence.** "Ordinary PDS publication is public; UI filtering cannot provide
privacy. Real hospital, personnel, customer, or financial records need a
separate confidentiality design before use." The design goals list a hospital
situation, an investment portfolio, an insurance claim, a house purchase, and
a funeral.

**Assessment.** The note is honest, and the spike's synthetic data is the
right choice. But the gap is not a later refinement. Of the motivating
examples, only the task board, the game, and public status fit a public log.
Everything with a commercial role in it is confidential. The design decision
that matters is whether confidentiality will be achieved by encrypting act
payloads in the log (folds then run only where keys are held, which changes
where the sequencer can validate) or by a private host mode where publication
to a PDS is optional. F1's staged log store makes the second option nearly
free; the first constrains the fold contract and should be known before F2 is
settled.

**Recommendation.** State the intended confidentiality direction in the
architecture note now, as a decision to be made rather than a feature to be
added, and name which motivating examples the spike's posture supports. No
implementation in the spike.

## 4. Smaller observations

- **Positions and predecessor CIDs both appear in the entry.** Either alone
  detects a gap; both together are cheap and let a reader verify without
  fetching the predecessor. Keep both.
- **Zero-padded record keys** sort correctly in the repository and make range
  reads possible. Good. Document the width, since it fixes the maximum
  history length.
- **One writer per app, enforced by a local lock**, is the right honesty for
  the spike. The note's statement that a compare-and-swap is not a leadership
  protocol should stay in the architecture, because it will be quoted when
  someone proposes otherwise.
- **Decimal handling.** The rule "integer minor units or explicit decimal
  strings" is right for the portfolio class; put it in the framework Lexicon
  as a named string format so folds and views can agree.
- **32 KiB action payloads** exclude bulk imports such as "import statement"
  from the discussion. That is acceptable for the spike if the note says so;
  blobs referenced by CID are the eventual answer.
- **DID minting for apps** is not described. A disposable test PDS creates
  `did:plc` identities through the PLC directory unless configured with a
  local one. S2 should pin which, since it decides whether the experiment
  needs the public directory.
- **Discovery document.** The CLI `describe` output and the browser shell's
  discovery response should be one document with one schema, so an agent and
  a person see the same actions, queries, and views. The plan implies this;
  say it.
- **Rate limits.** Public relays limit events per PDS. Irrelevant to the
  disposable PDS, relevant to adoption; a chatty app on a shared PDS will hit
  them. F1's entry batching is the mitigation.

## 5. Recommended plan changes, in order

1. Before S1: decide F2 (effects versus complete state) and F10 (direction
   for confidentiality). Record both in the architecture note.
2. S1: add the optional actor DID (F5), the checkpoint record (F8), and the
   action-binding CID as the intent's compatibility anchor (F4). Define the
   log store interface (F1).
3. S0: JavaScript engine first (F6); generic renderer as the gate (F7).
4. S3: implement the effects model and the `allow` expression (F3); add the
   portfolio fixture as the third app (F2, F9).
5. S4: the single-document bundle and `describe` round trip (F9).
6. Move S2 after S4 (F1). Keep its gate mandatory before S6.
7. S6: replay the three fixtures; report the checkpoint's effect on first
   open.

Four of these change accepted contracts or gates and need a replacement
decision before they govern work: F1 (canonical store and S2 ordering), F2
(fold output contract), F4 (intent compatibility anchor), and F7 (S0 Inlay
gate replaced by the generic renderer). The rest are additive. Two gates get
harder under this list: S3 must prove effects application and `allow`
evaluation, and S6 must replay a ledger-shaped app. One gate changes shape:
S0 proves a generic renderer instead of an Inlay template.

## 6. Decisions for the commissioner

These cannot be settled by review.

- Whether the sequencer's own store or the PDS is canonical for the commit
  path (F1). The review recommends the store, with PDS publication as the
  portable representation.
- Whether the fold contract changes to effects before S3 (F2). The review
  recommends yes.
- Whether intents bind to the action binding rather than the whole
  definition (F4). The review recommends yes.
- Whether the S0 view gate is the generic renderer rather than an Inlay
  template (F7). The review recommends yes.
- The confidentiality direction (F10), because it constrains F2.

## 7. Method

Read both notes in full at `efbd900`, the notes index, the originating
discussion, and the Tailapps `jsonataddl` README at the reference checkout
named in the plan. Applied the three-app test from the discussion to the
state and fold contracts. No code exists yet, so no gate was run; every
efficiency claim above is an argument from the stated contracts, and S6 is
where they become measurements.
