---
date: 2026-10-01
status: source-based options; measurement and independent contract review gates remain open
examined_at: bcc9c92cf194b27f23f0b347ef67e6c707b8a978
request: fe6f8e1263f22e6b3d81070d1f58f0e3cd819016
promise: 053e043c3b5b482dbb6e703d2eb7cba816dd50cb
---

# State effects and atomic application transactions

Keep complete-state folds, V0's approved guard optimization and checkpoints as
the default. Measure that contract at its supported state cap. If a concrete
application needs larger state or more rows than it supports, the most promising
next comparison is a bounded set of declared
point reads followed by a pure program returning typed local writes. This note
defines that candidate's obligations; it does not select or implement it.

The [S0 requirements](2026-10-01-atseq-state-requirements.md) require P0/E1 stage
evidence before choosing effects or starting a prototype. P0 now demonstrates
repeated complete-value costs. V0's small guard optimization is now approved as
a design, with isolated evidence; its production implementation is pending.
Native end-to-end E1 results are not yet available. There is
no fixed latency target, and prior compatibility is not a goal. Those facts
permit exploring a different contract; they do not establish that its extra
semantics and storage obligations are worthwhile.

## Source and evidence examined

The source basis is the revision in the header: TypeScript, pinned JSONata,
official ATproto Lexicons and the existing Node/browser runtime. The
[P0 baseline](2026-10-01-atseq-performance-baseline-results.md) and
[performance dimensions](2026-10-01-atseq-performance-dimensions-results.md)
separate verification, interpretation, guards, copying and storage kernels.
V0's preparation was read at `8034b247093a10b4a027ea6af9234e3820fca29d`, from
`notes/2026-10-01-atseq-canonical-guard-proposal.md` on its separate branch. It
is preparation with isolated results, not a shipped end-to-end improvement.
Decision `e28c0d229bea433a450bc9d183939f04da466f39` has since ratified that design;
production implementation and integrated measurements remain pending.

The task-board, ledger and guitar source documents were read from B0 candidate
`d22d10600ed42997d3cd6178604c894bfd21e444`, without changing it. B0 has since been
independently approved by assessment `008be622` and merged/pushed at `fd7dab4b`.
The documents were not present in the original source basis above; their read
revision and hashes remain unchanged here.
Their exact document hashes are:

| Document | SHA-256 |
| --- | --- |
| `testdata/source-documents/taskboard.atseq.json` | `bf2c631de02840922a58d61f921e6c3d3ddd7367ed05f21ec05c85651c03df20` |
| `testdata/source-documents/ledger.atseq.json` | `f0b35532e77430223b076a1b33b9cffebdab09ea02971f4275d12154ac615f82` |
| `testdata/source-documents/guitar.atseq.json` | `1d1a5163f18f53e7eeae178f90fda440fee0efe42e6f8bcf5de7f1952dce9643` |

This guitar successor includes the independently approved aggregate bound of
1,000,000,000. The earlier S0 hashes and captures remain historical evidence.
Sparse guitar selection is the separate
[existing extension](../testdata/apps/evolution.ts), not an action in B0's
viewless guitar document.

### Where complete-value work occurs

Let B be complete encoded state bytes, R the row count, N interpreted actions,
and k an object's property count. These are source-derived costs, not new
measurements. Ranked by relevance to growing-state writes:

| Rank | Source | Work and cost | Smallest comparison and risk |
| --- | --- | --- | --- |
| 1 | [Schema validation](../src/definition/schemas.ts:152) and [successor admission](../src/application/folder.ts:212) | Successful validation makes three complete canonical walks around the official validator. Each canonical walk visits the value and sorts object keys: O(B + sum(k log k)); the validator adds its schema traversal. | V0's token byte-count change preserves traversal and checks. Skipping a walk needs a separately proved ownership/validator boundary. |
| 2 | [Evaluator input](../src/runtime/evaluator.ts:101), [intermediate guards](../src/runtime/evaluator.ts:171) and [fold](../src/runtime/evaluator.ts:193) | Input and output copying and canonical inspection include complete state; each evaluated data result is charged. A small AST can repeatedly inspect large values. | Bounded inputs and outputs could remove total-state work, but change the fold contract and its observable budgets. |
| 3 | B0's decoded `add.jsonata`, `complete.jsonata`, `record.jsonata` | Array filters scan for duplicate/missing IDs and appends construct complete successor arrays. O(R) lookup and at least O(R) materialization are independent of the runtime guards. | A keyed row store must preserve uniqueness, absence and ordered iteration; replacing a filter with an index alone leaves complete successor costs. |
| 4 | [Snapshots](../src/application/folder.ts:78), [optional persistence](../src/application/folder.ts:147) and [queries](../src/application/folder.ts:218) | Owned complete projections include state and accumulated outcomes. Even a small query first clones that projection. If optional persistence is used per action, complete history copies can accumulate O(N squared) work. | Coherent selective reads and transactional roots could avoid routine complete copies. Actual host persistence is currently the small writer lease/head, not this optional callback. |

P0's 10,000-action growing primitive-array case had approximately 185–186
seconds of median interpretation versus approximately 1.4 seconds for bounded
state. The one-actor growing run included about 43 seconds in state validation
and 141 seconds in the fold region; the regions contain overlapping work and
must not be added as exclusive attribution. AST visits stayed constant while
inspected bytes grew. This supports investigating complete-value work, not a
universal complexity claim or a claim that the object examples admit 10,000
rows. Their arrays are bounded at 1,000; profile byte limits can bind earlier.
The approximately 186 seconds is total replay across 10,000 actions whose state
grows throughout replay, not one-action latency. The 128 KiB complete-state cap
bounds A's per-action input size. No worst-case latency at that cap has been
measured here, and extrapolated tens-of-milliseconds estimates are not results.

V0's known-ASCII token counting reduces encoding allocations while preserving
strings, traversal, charge sequence and error order. Its isolated kernels do
not establish a new end-to-end result. Its counterexamples also show why
caching the first canonical string cannot automatically replace comparison
after validation: validators can mutate inputs, and plain-looking proxies can
change descriptors. A CID, frozen object or plain prototype is not proof that
an arbitrary value has crossed a controlled immutable boundary.

## Four concrete options

| Option | Contract and authority | Cost that can improve | Cost and complexity that remain |
| --- | --- | --- | --- |
| A. Complete state with smaller guards | Keep current pure fold and full successor schema checks. Apply only independently reviewed equivalent optimizations. | Encoding allocations and other measured constants; selective outcome APIs can reduce unrelated history copying. | Full-state traversal and array duplicate scans remain. Lowest additional semantic burden. |
| B. Patch, then full validation | Fold returns changed paths/rows; runtime materializes the complete successor and applies the current canonical/schema checks. Ordinary app authority remains unchanged. | Smaller program output or transport packet, if measured. | Full validation stays proportional to B, array edits/copies can stay proportional to R. Adds patch ordering, path and failure rules without proving incremental validation. |
| C. Declared point reads and typed writes | Runtime reads bounded selected rows/scalars at one frontier; pure JSONata returns bounded local writes. New logical state and validation contract. | Point lookups, changed-row validation and stored-count queries can depend on read/write size and index paths. | Requires an owned store, inductive admission, atomic metadata/index updates, query rules, restoration assurance and new semantic identities. Full audits/exports remain proportional to complete data. |
| D. Program-driven read/write callbacks | Evaluator calls host transaction functions, possibly with reads depending on previous results. New evaluator capability contract. | More general data-dependent transactions. | Adds callback lifecycle, I/O isolation, asynchronous failure and charging semantics. Current examples provide no evidence requiring this generality. |

A with V0 and checkpoints remains the default and the first measured comparison. B is
an honest intermediate only if it has a demonstrated benefit; calling it
incremental validation would be misleading. C stays parked pending a concrete
application requirement beyond the supported state or row cap and actual
at-cap Node/Chromium E1 measurements after V0. D remains open for a concrete application
that cannot express bounded reads ahead of evaluation; the examined examples do
not justify introducing it now.

## Candidate C: the smallest useful boundary

### Select first, evaluate once, commit once

An action definition declares a finite set of named point reads from named row
collections and small scalar fields. Key selectors are retained, bounded pure
expressions over the already validated action and metadata, without access to
application state. The runtime resolves all reads against one pre-action root
and passes owned values to the existing pure expression engine. Absence is an
explicit `found` distinction, not `null` or an omitted value silently standing
for absence. There are no network, SQL or repository callbacks in the program.

The program returns either an ineffective reason or a bounded list of typed
local writes. A minimal starting comparison needs insertion of an absent row
and replacement of a declared scalar. It does not need arbitrary path mutation,
deletion, scans or a general transaction language to model these examples.
Writes must target declared addresses and be checked against the read root;
duplicate destinations are rejected rather than acquiring implicit list-order
semantics. Any broader operation set needs an example and review. These are
logical obligations, not settled field names or a published wire schema.

Authorization is checked at the same pre-action authority frontier before any
domain writes are accepted. Effects never address activation, roles, grants,
definition sources or ordering controls. The separate
[native ordering requirements](2026-10-01-atseq-native-ordering-requirements.md)
own those controls. NW0's current `notes/2026-10-01-atseq-native-wire-contract.md`
at `dff4b617` remains a source-only proposal, not implemented native behavior.
This design does not add new authority to the app PDS:
its signing key can already construct another ordering under the proposed
native authority model. Repository authentication does not prove execution.

Changing the fold result from complete `state` to writes requires new semantic
identity. Read selectors, logical state schemas, effect rules, budgets and the
program must be covered by the applicable execution contract. The current
[engine descriptor](../src/core/contracts.ts:137) itself specifies the complete
state result, so unchanged JSONata evaluation alone does not justify retaining
its existing descriptor/CID. Profile names, per-action identity coverage and
activation admission require their own review before implementation.

### The examples fit without evaluator I/O

| Action | Declared reads | Atomic writes | Invariants and failure |
| --- | --- | --- | --- |
| Task-board add | Task at `act.id`, including absence | Insert task, append its position to ordered task iteration, update derived count | Duplicate gives `already_added`; collection/schema/byte overflow accepts no task. |
| Task-board complete | Task at `act.id` and completion at that ID | Insert completion, preserve completion order, update count | Missing task gives `unknown_task`; duplicate gives `already_completed`. Completion references an existing task by program logic, not row schema alone. |
| Ledger record | Entry at `act.id`, balance and currency | Insert entry, preserve journal order, replace balance, update count | Duplicate gives `already_recorded`. Invalid successor balance leaves both journal and balance unchanged. Equality of balance to journal sum relies on valid initialization plus the reviewed program; audit still recomputes it. |
| Guitar add | Candidate at `act.id` | Insert candidate, preserve candidate order, update count | Duplicate gives `already_listed`. The existing summary recomputes total price; an indexed write does not make that sum query constant cost. |
| Guitar select, in the separate extension | Candidate at the selected ID | Replace selected ID | Sparse update needs no complete candidate input; missing-candidate behavior remains explicit in the app's program. |

Counts can be store-derived metadata. Balance is application state, not a
runtime-trusted derived aggregate. A stored price sum would be another explicit
application or index contract with atomic maintenance and auditing obligations.
Changing a completed-ID array to a boolean on each task would lose its observed
completion order unless another ordered index retained it. This is an example
of representation design affecting semantics even when compatibility is not a
goal.

### Incremental admission needs a proof boundary

Reusing the official row Lexicons avoids inventing another primitive/schema
language. The current Lexicon object type declares named properties; it does
not supply a generic typed-key map or arbitrary cross-row constraint. A table
of keyed rows therefore needs an explicit Atseq container contract, not an
unvalidated `unknown` map advertised as the existing complete-state schema.
Missing, `null` and other values remain distinct. See the
[Lexicon specification](https://atproto.com/specs/lexicon).

The store must start from fully admitted initial data, or restore under a
disclosed checkpoint assurance policy. Admission includes the required domain
invariants: a row schema alone cannot establish, for example, that the initial
ledger balance equals its journal sum. The examined empty initial journals make
that check simple; general imported state needs an explicit check or accepted
assurance. The store alone allocates and retains internal
immutable rows and indexes. Every replacement crosses canonical ownership,
row-schema and non-coercion checks; it cannot retain caller objects. An internal
brand can identify values created through that boundary, but is not accepted
from external storage. Cross-row invariants are proved by valid initialization
and reviewed transition programs, or checked through explicit additional
bounded reads. A schema that needs a global scan keeps that scan or is rejected
by the bounded contract; it is not silently considered locally proved.

The store also checks key/row-ID agreement, duplicate absence, count limits,
ordered positions and scalar bounds before publishing a successor. Global
canonical byte/depth limits need exact checked metadata accounting for keys,
punctuation, ancestors and retained extra fields. The current 128 KiB state cap
must not disappear through local validation. If its exact accounting cannot be
proved incremental, retain the full guard while specifying a separately
reviewed new size contract. A new Merkle representation's root is not the old
complete-JSON CID.

Domain string IDs may contain Unicode. Preserve exact identity without silent
normalization, and store keys without prototype-property ambiguity. Mapping
them directly to repository record keys is not generally valid: native keys
are restricted ASCII, case-sensitive, 1–512 characters and exclude `.` and `..`.
Any mapping needs a reviewed injective encoding or a collision-checked binding;
the logical ID remains in the row. See the
[record-key specification](https://atproto.com/specs/record-key).

### Atomicity and failure are part of the contract

Each interpreted action stages row writes, scalar changes, ordered indexes,
counts and size metadata without exposing them. The durable commit and memory
publication cover domain root, authority frontier, outcome, active source and
interpretation frontier together. They also cover retry/deduplication metadata
required by native ordering. P3/P4 checkpoint work assumes precisely this
coherence with today's complete state; effects must preserve it, not make rows
independently visible.

| Event | Required behavior |
| --- | --- |
| Application returns an ineffective reason | No domain writes; atomically record outcome and advance interpretation frontier. |
| Invalid deterministic program/schema/budget/effect input | Discard the entire staged domain successor; apply the reviewed ineffective failure classification and advance atomically. Exact new error codes remain unsettled. |
| Missing/corrupt retained content, storage failure or runtime fault | No partial state, outcome or frontier publication; stall and retry the same interpreted action after repair. |
| Local root changed before commit | Discard/retry against the coherent root using ordered-action checks. Never reuse reads from a different frontier. |
| Query failure | Return unavailable at its captured frontier; do not advance or mutate state. |

SQLite can provide a local transaction and stable read snapshot, but errors do
not uniformly roll back an entire transaction automatically. An adapter must
explicitly finish or roll back the staged action, including a failed commit;
there is no inference from one failed statement to whole-action atomicity.
Browser storage needs the same independently tested contract. See
[SQLite transaction control](https://www.sqlite.org/lang_transaction.html).
This is a prospective adapter boundary. The current host's lease/head storage
is not already an atomic keyed projection store.

Local projection commits and the remote PDS transaction are distinct. Do not
place remote writes inside deterministic evaluation or claim a distributed
transaction between them. After a crash, reconcile retained verified ordering
and resume the local frontier under the native recovery rules.

## Merkle reuse, queries and honest complexity bounds

ATproto already provides deterministic key-ordered MSTs, content-addressed
records, signed commits and CAR repository exports/diffs. Reuse the existing
native publication and proof foundation where it meets the required boundary;
first compare a private local indexed projection without making every domain
write another remote repository write. A Merkle proof authenticates published
data at a root, not whether Atseq derived an index or balance correctly. An
MST's key order also does not preserve an application's append order by itself.
These are design implications of the
[repository specification](https://atproto.com/specs/repository), not new
guarantees conferred by an app PDS.

For an indexed implementation let r/w be read/write counts, b the inspected
bytes in those values and h the actual bounded index-path work. The candidate
aims for work shaped like O(b + (r + w)h), plus small scalar/metadata checks.
That bound depends on the physical store and proof obligations. Cloning a
JavaScript map remains O(R); rebuilding a tree or taking a complete projection
snapshot restores total-state cost. No unconditional logarithmic bound is
claimed for adversarial native MST keys. Node sizes, path depth, proof blocks
and retained metadata must have explicit budgets.

Point reads and stored counts can be small. Recomputed sums, complete snapshots,
complete archives and global audit remain proportional to the data consumed.
A query needs its own declared read contract and coherent root; changing only
action folds leaves today's query snapshot/evaluator costs intact. Stable pages
also need order, frontier, bounds and completeness rules. They are not assumed
as already implemented APIs.

On restoration, choose full validated rebuilding/audit or an explicitly
accepted checkpoint assurance mode. A root hash alone does not admit persisted
derived counts, ordinals or aggregate values. An accepted certificate can skip
replay only under its stated trust policy; it does not convert an assertion
into replay verification. Corrupt local metadata stalls or rebuilds from an
admitted basis. Retain enough blocks and source to audit the same transition
contract later.

## Gates and concrete next work

1. Complete the independently reviewed V0 comparison and native E1 stage
   measurements. Record exact heads/profiles/fixtures, raw repetitions and
   overlapping timing regions. Measure real bounded object examples, sparse
   selection and growing appends within their existing caps; larger exploration
   uses an explicit reviewed fixture/profile. Measure per-action complete-state
   costs at the supported cap after V0 in Node and Chromium, and total replay
   for realistic action counts at that cap. Record the concrete application's
   required state bytes and row count before considering a larger contract.
2. Compare complete-state A first. Separately attribute schema guards,
   expression/intermediate inspection, array lookup/copy, encoding/root work,
   selective versus complete snapshots, actual durable writes and Node/browser
   restore/tail/checkpoint trust modes. Include no-op and duplicate actions.
3. Only if a concrete app needs state or row counts beyond the supported cap,
   and the at-cap measurements support considering C, submit a
   contract decision specifying owned admission, logical tables/order,
   selector/write restrictions, global bounds, schema/invariant obligations,
   outcome classification, authority coverage, queries, restore and identity.
   Independent atseq-reviewer assessment precedes an effects prototype.
4. An authorized prototype must compare admitted complete-state reference
   behavior where retained, and explicitly document intentional new semantics.
   Verify duplicate/missing rows, scalar overflow, row/count/byte/depth caps,
   Unicode/extra fields, injected validator mutation, conflicting roots and
   every staged-write failure. Kill/restart between stages and durable commit;
   verify no half ledger entry, half completion or mismatched frontier.
5. Measure indexed reads and changed-row writes separately from recomputed
   sums, full snapshots/exports, verification, persistent index maintenance and
   outcome history. Publish costs that remain global and the extra retention
   obligations. Full Node/Chromium, compiled-package and replay/checkpoint
   conformance gates follow the actual reviewed contract changes.

Preparation used source reads, the complexity scan and primary specification
checks. No runtime source, dependencies, descriptors or shared programme files
were changed. No effects prototype, build, test, install or benchmark was run.
The relevant later checks are `npm run check`, `npm test` and the shared
Node/Chromium runtime corpus, plus the scoped transactional regressions above;
they are not evidence supplied by this note. S0 remains open, and the broader
E1 performance/adoption matrix is a separate open task.

Independent assessment `a03c7402ab2e946608ae8e6fb007fc7b70954acb` ratifies these
options with the cap-based gate above. Its concurrent selective-snapshot/outcome
follow-up is S1; it changes neither the complete-state contract nor permission
to prototype effects. V0 implementation and its real-validator measurements
are another separately tracked follow-up.
