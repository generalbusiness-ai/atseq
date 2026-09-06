---
date: 2026-09-06
status: S3 gates pass; awaiting independent review
companion: notes/2026-09-06-atseq-initial-spike.md
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
---

# Atseq definition and runtime spike

S3 makes the folder half executable. A running generic interpreter loads a
complete CAR source closure, validates its Lexicons and bindings, then folds
signed entries and runs declared queries. Application behavior stays in source
definitions. The [source contract](../docs/definitions.md) documents the manifest,
execution rules, identity and authoring limits.

S0–S2 are independently approved and landed. S2's corrected candidate
`70f4c89d517fad69724b12caa76d1425ef9564cf` landed at
`71d912ec7dea238f8709d336c5c988d035ceb18f`. This S3 candidate rests on that code
and the adopted initial plan; it is awaiting its own independent review.

## Measured result

`npm run test:runtime` reports 42 passes: 40 shared runtime fixtures, their
parent, and the host projection-file test. The same 40 fixtures pass in Node
and a Chromium worker. `npm run test:dynamic-apps` reports one pass. Retained
results are [runtime.json](../experiments/runtime.json) and
[dynamic.json](../experiments/dynamic.json); reruns write ignored files beneath
`experiments/generated/`. Evidence names versions and hashes of tested sources. The combined S0–S3
`npm test` run reports 224 passes, zero failures and zero skips.

The corpus uses independently specified expected states and outcomes. It
checks fold/query agreement, invalid input and explicit no-ops, replay identity,
state/outcome/frontier atomicity, failed persistence and retry, a query racing
catch-up, malformed program output, noninteger results, source availability and
integrity, runtime identity, invalid bindings and bounded resource exhaustion.
Mutating supplied source/history or returned snapshots cannot change owned
runtime state. Concurrent opens cannot replace an already reserved app anchor.

The file test observes the projection during 20 appends: every visible state
and outcome count matches its frontier. Deleting that marked disposable cache
and replaying the signed history produces the same complete projection.

The dynamic gate starts a child process containing only the generic runtime
before it constructs two newly namespaced definitions. Garden rainfall declares
a reading list, record action and total query. Weekend guitar search declares
candidate objects, duplicate handling and a different state/query shape. Both
load and interpret through IPC without rebuilding or changing host sources.
The retained [CAR files and public histories](../experiments/evidence/s3/) contain
no private keys or PDS credentials. This proves late loading with generated
fixtures; it does not claim agent authoring or the S4 HTTP/browser flow.

## Decisions and limits

Lexicon remains the schema and query IDL. The manifest is another small Lexicon:
it binds those interfaces to retained files. Standard CAR and atcute CID/CBOR
code provide transport and content identity. No DDL, SQL or copied evaluator
was introduced. Retained Inlay templates use the existing three local primitives.

The application runtime descriptor links the unchanged S0 engine profile and
adds hashes for definition admission, protocol verification and folder behavior.
Both genesis and loaded definition must name this full identity. S1's protocol
vectors remain unchanged; S2's opaque persistence fixtures still do not interpret
their source. There is no implied compatibility with GitSeq or Tailapps.

An effective entry commits state, outcome and frontier together. Invalid
interpretation preserves the prior projection and stalls; it does not invent
an ineffective outcome. Query results retain their own captured frontier.
Initial source loss prevents opening a folder; activation/source loss during
evolution remains S5 work.

The loader performs bounded empty-data program preflights and partial-data
view preflights, with the exact caveats in the source contract. They establish
admission and confinement, not correctness for all future inputs. Source JSON
uses standard parsing semantics; canonical manifest/wire CBOR remains strict.
The host file cache always rebuilds and does not yet offer fast restoration.
Full-prefix verification and growing outcome copies require S6 measurement.

S4 still owes the local identity, preview/publish, runtime forms, public CLI,
browser outbox and honest progress flows. S5 adds compatible activation and
pending-intent review. S6 adds complete offline archives, chart export,
measurements and the separate agent-authoring exercise.
