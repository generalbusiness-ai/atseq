# Atseq source definitions and folders

S3 loads unique applications into one running interpreter. Application source
contains Lexicon schemas, JSONata programs, initial JSON state and retained
Inlay templates. It contains no executable JavaScript, authored SQL or DDL.
The examples in `testdata/apps/` are test authors, outside the host runtime.

## One retained source closure

A standard CAR carries one root: the canonical DAG-CBOR
[`test.atseq.definition`](../lexicons/test/atseq/definition.json) manifest.
The manifest lists relative file paths and raw-byte CIDs. Each named file must
be present and match its CID before the definition can load. The CAR may not
contain undeclared blocks. Identical file contents can share one block.

`SourceBundle.pack(manifest, files)` derives file CIDs and the root from owned
bytes. `SourceBundle.read(car)` checks an import. Both enforce 512 KiB including
CAR framing and at most 64 blocks. Loading allows at most 63 named files plus
the manifest and also bounds their combined bytes to 512 KiB, counting aliases
separately. The root retains the protocol's 64 KiB CBOR limit. File names are
ASCII relative paths without empty, `.` or `..` segments; URLs are not paths.

The loader can instead read through a configured `SourceReader`, including
S2's PDS `SourceStore`. It verifies the same complete manifest closure. A CID
does not cause a network lookup by itself. Missing bytes yield `content_missing`;
wrong bytes yield `content_corrupt`. No partial definition becomes active.

A manifest has this shape; `pack` supplies `files`, and the installed runtime
supplies the actual profile CID:

```json
{
  "$type": "test.atseq.definition",
  "version": 0,
  "profile": {"$link": "<application runtime CID>"},
  "title": "Garden rainfall",
  "lexicons": ["schemas/rainfall.json"],
  "state": {"ref": "test.rainfall#state", "initial": "state.json"},
  "actions": [{"ref": "test.rainfall#record", "fold": "record.jsonata"}],
  "queries": [{"name": "summary", "ref": "test.rainfall#summary", "program": "summary.jsonata"}],
  "views": [{"name": "main", "source": "main.json", "query": "summary"}]
}
```

The action identity is its input schema reference. State and action inputs
must reference declared Lexicon object definitions. Query bindings reference
Lexicon query definitions, which already declare parameters and result schema.
The manifest adds only the program and view bindings. Extra manifest fields,
duplicate bindings and undeclared paths are refused. JSON files use fatal UTF-8
decoding followed by standard `JSON.parse`: formatting is retained in source,
and the last duplicate JSON member wins. Subsequent value admission refuses
unsafe numbers, negative zero and reserved keys. Manifest CBOR is stricter and
refuses duplicate fields at the wire boundary.

## Interpretation and query behavior

The immutable [engine profile](runtime-profile.md) applies to every program.
`state` is the current state, `act` the validated payload, and `meta` supplies
the app DID, entry position, actor key and current definition CID. An action
returns either `{decision:"effective", state:...}` or
`{decision:"ineffective", reason:..., message?:...}`. Effective state must
match its pinned Lexicon. An ineffective action preserves the prior state.

Unknown actions, invalid action inputs and intents naming an old definition
produce explicit ineffective outcomes. Malformed program output, invalid
successor state, resource exhaustion or failed projection persistence stalls
interpretation before that entry. These failures never become domain no-ops.
The snapshot retains the complete prior state, outcomes and frontier, plus the
observed head and a separate stalled reason. Retrying can resume the same entry.

Queries evaluate `{params, state}` after Lexicon parameter validation, then
validate the result against the declared output. An available or unavailable
query response names the exact captured interpretation frontier. Catch-up
cannot relabel a query with a later frontier. A query can use a complete prior
projection while interpretation is behind the canonical head.

`Folder.catchUp` verifies a complete signed prefix before interpreting new
entries. It refuses rollback or a fork across its retained frontier. The host
may persist each complete projection with `projectionFile`, which syncs a
temporary file and atomically renames it. Memory advances only after persistence
returns. The cache is disposable: opening a folder rebuilds from initial state
and verified history, rather than trusting a saved projection. S3 does not yet
implement browser storage, public interaction or definition activation.

## What import validation establishes

Import loads every named source file, validates schemas and initial state,
checks bindings and runs bounded program/view preflights. Program preflight
uses the unchanged S0 evaluator with empty `meta`, `act`, `params` and `state`.
Its AST admission rejects unsupported syntax, functions, variables and source
complexity before execution. Data-dependent failures are deferred to execution,
except numeric/reserved-value failures, which also reject import. Thus an
otherwise usable program whose empty-data branch produces a fractional value
can fail import. Authors should use a valid empty-data branch. This preflight
is not a proof that every future input produces valid state or output.

A view names a retained local Inlay document and optionally a named query.
Only Panel, Text and Action primitives are registered. A missing query binding
during preflight is deferred until rendering with query data; later properties
in that template may therefore be checked only at render time. Every actual
render uses the same bounded, capability-free resolver. It has no signing,
network or HTML execution capability. S4 supplies the separate human interaction
controller and tests its hostile-view boundary.

## Runtime identity

S1's descriptor remains the immutable S0 engine identity used by its independent
protocol vectors. S3's
[`application-profile.json`](../src/runtime/application-profile.json) links that
engine and pins the additional manifest, source loader, wire/schema verification
and folder code plus exact ecosystem library versions. Real interpreted apps
pin this complete application runtime CID in both genesis and definition.
Tests check the source hashes; semantic changes require a new descriptor/CID.
The descriptor excludes itself to avoid a self-hash and excludes disposable
host storage, which cannot change a successful fold's meaning.

The simple implementation verifies the whole prefix and copies a growing
outcome list. Repeated catch-up is not yet an incremental performance design.
S6 must measure it at the planned history sizes before a long-lived application
claim can be made.

## Reproduce

```sh
npm run check
npm run test:runtime
npm run test:dynamic-apps
```

The runtime gate shares 40 fixtures between Node and a Chromium worker; a
separate file-persistence test observes atomic snapshots and rebuilds after
deleting the cache. The dynamic gate starts a generic Node host process before
generating two unrelated schema-shaped applications, then loads and interprets
both through IPC without changing host code. This is fixture generation, not
the additional agent-authoring exercise required by S6. See the
[S3 result](../notes/2026-09-06-atseq-runtime-spike.md) for retained evidence.
