# Atseq source definitions and folders

S3 loads unique applications into one running interpreter. Application source
contains Lexicon schemas, JSONata programs, initial JSON state and retained
Inlay templates. It contains no executable JavaScript, authored SQL or DDL.
The examples in `testdata/apps/` are test authors, outside the host runtime.

## One retained source closure

A standard CAR carries one root: the canonical DAG-CBOR
[`ai.generalbusiness.atseq.definition`](../lexicons/ai/generalbusiness/atseq/definition.json) manifest.
The manifest lists relative file paths and raw-byte CIDs. Each named file must
be present and match its CID before the definition can load. The CAR may not
contain undeclared blocks. Identical file contents can share one block.

An activation attempt's evidence CAR uses a larger transport bound so verifiers
can receive and reject an oversized signed closure. `SourceBundle.readClosure`
and `collectClosure` admit only transport; loading an actual definition still
uses the bounds below. See [evolution](evolution.md).

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
  "$type": "ai.generalbusiness.atseq.definition",
  "version": 1,
  "profile": { "$link": "<application runtime CID>" },
  "title": "Garden rainfall",
  "lexicons": ["schemas/rainfall.json"],
  "state": { "ref": "ai.generalbusiness.atseq.examples.rainfall#state", "initial": "state.json" },
  "actions": [{ "ref": "ai.generalbusiness.atseq.examples.rainfall#record", "fold": "record.jsonata" }],
  "queries": [
    { "name": "summary", "ref": "ai.generalbusiness.atseq.examples.rainfall#summary", "program": "summary.jsonata" }
  ],
  "views": [{ "name": "main", "source": "main.json", "query": "summary" }]
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
match its pinned Lexicon. Lexicon objects are open: undeclared payload fields
pass through validation and can enter state if a fold copies them. Authors
should construct intended state fields explicitly; copying arbitrary payloads
can exceed the state cap and produce a framework refusal. An ineffective action
preserves the prior state.

Unknown actions, invalid action inputs and intents naming an old definition
produce explicit ineffective outcomes. Malformed program output, invalid
successor state and resource exhaustion produce `fold_failed/<code>`, retain
prior state and advance the interpretation frontier. These are framework
refusals, separate from a program's own domain reason. The next entry can still
apply or activate a compatible repaired definition.

Only restorable missing/corrupt source and projection persistence failure pause
before an entry. The snapshot retains the complete prior state, outcomes and
frontier, plus the observed head and a tagged stalled reason. Restore content or
repair storage, then retry the same prefix. Queries do not change this frontier.

Queries evaluate `{params, state}` after Lexicon parameter validation, then
validate the result against the declared output. An available or unavailable
query response names the exact captured interpretation frontier. Catch-up
cannot relabel a query with a later frontier. A query can use a complete prior
projection while interpretation is behind the canonical head.

`Folder.catchUp` verifies a complete signed prefix before interpreting new entries. `Folder.catchUpVerified` accepts only an immutable history issued by the shared verifier for that pinned genesis; copied or forged objects are refused. Both paths refuse rollback and forks across the retained frontier. The host interprets that verified history in memory and rebuilds from initial state on restart. It does not write a projection file or copy the growing outcomes list after each entry. Library callers can supply an optional persistence callback; memory then advances only after the callback succeeds. The atomic-file example and its coherence checks live in test support. Saved projections are never trusted as signed history.

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

The [current semantic contracts](../src/core/contracts.ts) specify log verification,
evaluation, definition admission and application behavior. Their canonical CIDs
are independent of source layout and formatting. The installed
[profile registry](../src/protocol/identity.ts) supports log/application v2 and the unchanged evaluator v1; historical spike
profiles are deliberately refused after the pre-adoption wire break. The
[runtime profile](runtime-profile.md#identity-and-compatibility) explains how future
versions retain replay support and how dependency equivalence is reviewed.

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

## Authoring without a compiled SDK

A single JSON document can carry a complete definition. Its format is
`atseq-source`, version `1`, with `manifest` and a `sources` array of
`{path, content: {"$bytes": "<canonical unpadded base64>"}}` items. These are the
exact source bytes, including whitespace and line endings. Conversion produces
the same standard CAR and runs the ordinary definition loader. The document
allows an omitted manifest `profile`, which is filled from the installed
runtime, and omitted `files`, which is derived from every supplied source item.
A supplied profile must match the installed runtime; a supplied file table must
name exactly the supplied paths and matching raw CIDs. Export retains the full
manifest and its file-table order, preserving the definition CID.

The document is bounded to 1 MiB of JSON, depth 32 and 63 source items. Existing
512 KiB source and CAR limits also apply. Aliased bytes count separately toward
the named-source byte allowance. No conversion reads remote URLs or extracts
untrusted paths to the filesystem.

Portable `atseq/application` APIs provide `sourceDocumentToBundle`,
`sourceDocumentFromBundle`, `sourceDocumentFromDefinition` and
`serializeSourceDocument`. These accept or return owned source data; named
file bytes can be read from a loaded definition with `definition.bytes(path)`.
The CLI provides `packDocument` and `unpackDocument`; both write one file and
retain its existing output protections. See the
[interaction guide](interaction.md#json-cli-adapter).

The [taskboard](../testdata/source-documents/taskboard.atseq.json),
[guitar shortlist](../testdata/source-documents/guitar.atseq.json) and
[ledger](../testdata/source-documents/ledger.atseq.json) examples are complete
single-document definitions with `views: []`. Generic action forms and query
inspection work without an authored view. Guitar prices and ledger amounts use
integer minor units. Local preview simulates a fold with an empty actor key;
it does not establish whether an actor will be admitted or authorized.

Routine discovery returns `version`, `cid`, `manifest` and parsed `lexicons`.
Request `describe` with `includeSource: true` to obtain a complete `source`
document that can be reconstructed and checked against `cid`. Source identity
establishes the bytes. Verify and replay the pinned history to establish which
definition is active at a particular frontier.

Ask the JSON CLI for `{ "operation": "runtime" }` to obtain the installed
application `profile` CID. Use that CID in `manifest.json`. A definition folder
and the `pack`, `validate`, `preview`, `create`, `submit`, `query` and `outcome`
operations are sufficient; an author need not import host modules or rebuild a
client. The runtime profile is immutable and is not inferred from a package
version string.

A minimal retained view can be written directly as JSON:

```json
{
  "root": "test.example.Summary",
  "imports": ["did:plc:localview"],
  "records": {
    "at://did:plc:localview/at.inlay.component/ai.generalbusiness.atseq.ui.Text": { "$type": "at.inlay.component" },
    "at://did:plc:localview/at.inlay.component/test.example.Summary": {
      "$type": "at.inlay.component",
      "imports": ["did:plc:localview"],
      "body": {
        "$type": "at.inlay.component#bodyTemplate",
        "node": {
          "$": "$",
          "type": "ai.generalbusiness.atseq.ui.Text",
          "props": {
            "children": ["Total: ", { "$": "$", "type": "at.inlay.Binding", "props": { "path": ["props", "total"] } }]
          }
        }
      }
    }
  }
}
```

These AT URIs are retained local record keys, never a request to resolve that
example DID. Use `ai.generalbusiness.atseq.ui.Panel` to contain children, `ai.generalbusiness.atseq.ui.Text`
for text, or `ai.generalbusiness.atseq.ui.Action` with `action` and `label` properties to open a
form. Declare a local record for each primitive used. Binding paths read the
selected query's object result. There are no scripts, event handlers or remote
resources. The generic query inspector can chart and export an object result's
array of rows with a text label and integer value, up to 100 rows; it does not
require a special application schema or template.
