# Native application coordinator: implementation results

Date: 2026-10-02

N1-F3 request `99f4ccdb5fe4ff5a39013b396f8f9e989e37a591` and promise
`a72c0e907c42e9d42f1aa1bdc5c6c80e10d8aaec` have a private implementation candidate
ready for independent review. The frozen code and test source is
`112aa445f98f60d9974fb3eb7ac4d9eedc18df60`, based on approved main
`65e7042a01184f4d755bf0a7853e92411e6dee9f`. It supplies checked bootstrap,
ordinary actions, activation, authority operations and coherent queries in one
private application owner. Full native publication, prefix and host integration
remain separate gates.

## Implemented transition

`openNativeApplication` is an internal checked construction route. A frozen
facade exposes processing, queries and owned snapshots; it hides the runtime
constructor and the actual generation. A snapshot is plain data and cannot
construct an accepted application. The application layer's public barrel and
supported profiles remain unchanged.

Bootstrap copies the externally pinned genesis and checks its native semantics.
The source owner hash-verifies the selected root, derives the distinct root and
named-file closure from that root's metadata, and completes admission in the
same bounded collection attempt. The root is fetched once. No genesis closure
field, caller-supplied vector or accepted-source flag was introduced. Authority
initialization follows complete source admission. The external app/genesis pin
is still a trust choice: bootstrap alone does not prove that genesis was
published in an ATproto repository.

The private owner captures the actual admitted source, frozen domain state,
accepted I2 authority and fixed outcome-row boundary before asynchronous work.
It authenticates the entry against that authority itself. Caller entry and app
identity data are copied before queueing; genuine repository capabilities keep
their identity. It checks the captured generation again after authentication,
fold evaluation and activation source collection. Source facts never arrive as
caller input.

Ordinary actions use the existing grant/epoch/signer checks, exact one-grant
signed action/execution scope, actual current-source action lookup, current role,
execution identity, input schema, fold and successor schema in that order.
There is one permission reducer and a direct private checked continuation, with
no separate eligibility token, action handoff queue or duplicate identity index.
The existing five-field native fold metadata route is reused.

Activation checks control context, tip, appointment, power and expected source
before fetching the target. It calls the source owner directly with the captured
exact signed closure vector. Complete-byte precedence is preserved. Known
invalidity, unsupported semantics, changed state-only schema projection and a
rejected current state have explicit outcomes. Missing bytes, local capacity,
cancellation and foreign reader faults escape without consuming history.
Successful activation retains the current domain state rather than installing
the target's initial state. Same-source activation has no invented no-op denial.

An effective or ineffective authenticated entry prepares one complete next
state, authority, source and outcome row. Optional persistence receives an owned
complete projection and must succeed before memory publishes the transition.
A refused write leaves the previous generation untouched. If persistence reports
success and the captured base has changed, the instance is poisoned: it returns
no committed result and permits no further processing or query results. That
condition requires P3 durable reconciliation, not a retry.

Queries capture source, state, parameters and frontier together. A concurrent
commit cannot relabel their results. Query failures produce local unavailable
results; they do not append ordered outcomes.

## Adopted design and failure ownership

This implements the independent D5 assessment
`de72b10f847a00b9aaf562f15b36078bff287dbf` and adoption
`9a79d89d8618d033a0d7d0ce0c0b8a288346413f` with its four clarifications:

- Existing I2 request, retry and consumed-observation arrays remain the sole
  uniqueness owner for this stage. The later R1 migration must change the
  producer, prefix index and compact authority state together.
- The original eligible-action WeakMap proposal is dropped. The same private
  captured operation consumes eligibility immediately.
- Outcomes use append-only private rows and immutable generation boundaries.
  Volatile transitions do not copy the whole outcome history.
- Durable success followed by a stale base poisons the instance; matching error
  codes at the wrong producer stage cannot become ordered fold failures.

The frozen original D5 packet `85f0033e8c5d0ae636d5cc952c11a56baf9cc3f7` remains
unchanged. Its proposed token is historical, not the adopted implementation.
The source owner was independently approved at exact candidate
`9f00c861d6b77609010c8ed6d844bb6725dc83d6` by assessment
`d8789ad8c2499b3667069c6ede649fa214ef0898` before this integration.

The coordinator uses the compiled `foldFailureStages` table rather than a new
reason table. Only the exact `InterpretationError` constructor and stage's
allowed code at the designated input, fold or successor callsite are handled.
Authored fold denial remains in the fold namespace, including a reason that
looks like a framework code. Stored-state canonicalization, program retrieval,
metadata construction, final outcome parsing and authentication lie outside
those catches. A same-class `unicode`, `value_bytes` or `reserved_key` error at a
stored-state callsite escapes unchanged without an outcome.

Source diagnostics remain unchanged: the existing source corpus uses them, and
moving them would not improve the real private provenance seam. The separately
noted possibility of classifying a signed-set mismatch before fetching every
listed block remains a future liveness decision. This implementation preserves
the adopted complete-byte order.

## Checks and actual evidence

| Check | Result |
| --- | --- |
| Portable application corpus, Node 22.19.0, 24.21.0 and 26.10.0 | Same 58 cases passed on each |
| Real Chromium 153.0.8010.12 | Same 58 portable cases passed |
| Test-only transformations at actual producer callsites | Same 24 cases passed on all three Node versions and Chromium |
| Actual compiled production modules, all three Node versions | Same 58 portable cases passed on each |
| Production build | Passed; all 137 source and 436 output hashes match |
| TypeScript, formatting, layers and dependency integrity | Passed at frozen final source |
| Retained authority corpus, Node 22 and 24 | Same 54 cases passed; historical fixtures unchanged |
| Retained source-owner corpus, Node 22 and 24 | Same 93 cases and three pure-call fault bundles passed |
| Ordinary parallel Node 26 suite at `8ab632d2` | 456 tests passed, no failures; the unrelated `entry 20000` case was explicitly excluded |

The last source commit strengthens a test assertion only: it submits an already
consumed authentic request at a valid next position and requires the exact I2
duplicate rejection. All seven focused runs were repeated after that commit.
Production source is unchanged from `8e1ef2b5`; the subsequent compiled-loader
correction `8ab632d2` and final duplicate assertion affect only validation code.
The ordinary parallel suite therefore tested the same production bytes, with the
prior test assertion. These checks are conformance and integration results, not
performance measurements or a claim that the full 20,000-entry test was rerun.

All seven final runs use the same 8,397,991-byte public fixture, SHA-256
`7cde6269de0402aea937c01cc478cf60fda492131f0966a11ab16c70110ea5bb`.
Forty genuine signed and repository-published vectors include real native heads,
CAR/MST evidence, source variants and independently specified expected state,
authority and outcome projections. They contain no retained private keys.
Eighteen additional portable cases exercise bootstrap, forged capabilities,
caller mutation, cancellation, atomic persistence refusal, source stalls,
queries and replay. Healthy processing, repeated live refusals followed by
success, and a fresh genesis replay have identical canonical complete snapshots.
This is live resume and fresh replay evidence; trusted checkpoint restore is not
implemented here.

The 24 fault cases include all 15 designated fold codes, foreign constructors
and codes, three wrong-callsite typed errors, stale authentication continuation,
and post-persistence poisoning. They are Vite transformations of actual module
callsites in test-only bundles. Production has no fault registry or injection
callback. The retained transformed bundle is separate from the actual compiled
production probes. The compiled probes load `dist/src` modules and transpile only
the test corpus; they do not import TypeScript production source. They report 58
cases, not 82 or a claim of compiled fault-injection coverage.

Evidence is in
`experiments/post-spike-evidence/2026-10-02/native-coordinator-f3/`.
`manifest.json` pins commands, decisions, each artifact and build scope;
`source-pins.json` pins the eleven changed source/test/script files and fifteen
unchanged boundary files. `case-comparison.json` records exact case and fixture
agreement. The public fixture and actual test-only fault bundle are retained as
deterministic gzip archives. Compiled captures and build provenance are
byte-preserving copies. The focused Chromium JSON is reconstructed from its
exact saved stdout, avoiding a default browser capture that the later ordinary
suite overwrote. Prior successful captures remain separately attributable.

`attempts.json` preserves the initial Unicode expectation failure and its exact
available tool excerpt. JSONata substring preserves a Unicode code point; the
fixture was corrected to use an ASCII escaped malformed surrogate, with no
production change. It also preserves the first actual compiled-loader failure:
the default TypeScript export lacked `ScriptTarget`. The existing `ts-morph`
TypeScript API corrected that one-line test-only loader issue. Neither failed
attempt is attributed to the final tested source.

## Recommendation and remaining gates

Recommend independent exact-head review and landing of this private coordinator,
then the R1 atomic prefix/compact-authority migration. I2 still copies and sorts
its historical identity arrays, so its per-entry work remains linear in history
and total replay can remain quadratic. Explicit complete snapshots and
persistence projections also copy the outcome rows. The append-only volatile
outcome change removes an additional copy; it is not a performance claim for the
whole system.

A persistence callback must atomically store the complete projection or reject
without a partial durable write. It must not await a reentrant queued update.
The current callback is an internal seam, not an implemented PDS compare-and-swap
or an answer to ambiguous network-write outcomes. Those require host integration
and P3 reconciliation.

Native selected-head/prefix acceptance, repository ordering ownership, actual
host/PDS publication, trusted restore and public native support remain explicit
gates. No public exports, registration, dependencies, lock files, approved
runtime catalogs or historical fixtures changed. This candidate closes the
private coordinator task only after review; it does not close full N1, I2 or the
identity and performance programme.
