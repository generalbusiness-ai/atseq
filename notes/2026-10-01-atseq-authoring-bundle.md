# Single-document authoring and reconstructable discovery

Date: 2026-10-01

Status: decision independently reviewed; implementation complete in the B0
candidate, with exact-head review and landing pending. The discovery schema's
profile advance is independently approved.

Workroom task: B0, request `29bfbe650def15a33faec19ac33e64ed9c876762`.

The independent assessment `75465898` approved this direction with four
conditions: full source is requested explicitly, discovery has a validated
versioned schema, the retained file table names exactly the supplied paths,
and an omitted authoring profile is filled from the installed runtime. These
conditions are incorporated below.

## Problem and recommendation

An author can already create an application from a directory containing a
manifest, Lexicons, initial state and JSONata programs. A standard CAR retains
these exact source bytes. Discovery returns the manifest and parsed Lexicons,
but omits the programs and other source files. A person or agent arriving with
only the discovery response cannot reconstruct or inspect the whole definition.

Add one bounded JSON source document and portable conversion helpers. Keep the
existing definition manifest, raw-file CIDs and standard CAR as the authoritative
source closure. The document is an authoring and discovery representation of
that closure, not a second execution language or a new repository record.

Use the AT Protocol JSON representation of bytes, `{ "$bytes": "..." }`, with
canonical unpadded base64. This retains CRLF, whitespace, trailing newlines,
Unicode bytes and binary files without parsing and rewriting source. JSON source
files can still be edited as ordinary files before conversion. Embedding parsed
Lexicons or program strings alone would make reconstruction dependent on a new
serialization convention.

## Document shape

```json
{
  "format": "atseq-source",
  "version": 1,
  "manifest": {
    "$type": "ai.generalbusiness.atseq.definition",
    "version": 1,
    "profile": { "$link": "<installed application profile CID>" },
    "title": "Example application",
    "lexicons": ["schemas/app.json"],
    "state": { "ref": "example.app.data#state", "initial": "initial.json" },
    "actions": [{ "ref": "example.app.data#add", "fold": "add.jsonata" }],
    "queries": [],
    "views": []
  },
  "sources": [
    { "path": "add.jsonata", "content": { "$bytes": "<exact bytes>" } },
    { "path": "initial.json", "content": { "$bytes": "<exact bytes>" } },
    { "path": "schemas/app.json", "content": { "$bytes": "<exact bytes>" } }
  ]
}
```

The envelope and each source item are closed objects. Unknown fields and
unsupported format versions are refused. The manifest has the existing closed
definition shape, except that a newly authored document may omit `files`.
It may also omit `profile`; conversion fills the current installed application
profile CID. A supplied profile must be supported by the installed runtime.
Export includes the complete profile and never replaces it silently.
Conversion derives that table, sorted by ASCII path, using the existing raw CID
algorithm. Export always includes the complete retained manifest, including its
`files` table. If an imported document supplies `files`, every listed path and
CID must match the supplied bytes exactly, and that table's order is preserved.
Its path set must equal the supplied source path set; neither extras nor missing
paths are accepted. When the table is omitted, every supplied source item is
retained, including files not referenced by an action, query or view binding.
Supplying a stale CID is an error, never a request to replace it silently.

Preserving a supplied table is necessary: the current loader admits a unique
file table in any order, even though the ordinary packer sorts it. Sorting an
already admitted table on export would change its root CID. Ordinary source
items are sorted on export; their order does not affect the retained manifest.
Identical source bytes can serve several paths and share one CAR block.

The document does not carry an author-declared compatibility or execution CID.
C0 owns the decision about derived execution identity. If that identity is
later exposed in discovery, it must be calculated from verified source under
the adopted contract. A transport encoding cannot establish compatibility.

## Admission and identity

Parsing is bounded to 1 MiB of UTF-8 JSON, depth 32 and 63 source items before
base64 decoding. Object-based library inputs receive the same serialized-value
and depth checks, without getters, cycles or unusual object prototypes. The
1 MiB limit includes JSON escaping and the manifest; it is a transport bound,
not a larger source allowance.

Paths retain the existing ASCII relative-path rules and 200-character manifest
bound. Empty, duplicate, absolute, URL, traversal and backslash paths are
refused. Every byte wrapper has exactly one `$bytes` string; alphabet, length
and round-trip re-encoding must establish canonical unpadded base64. Total
decoded file bytes are charged per named path, including aliases, and cannot
exceed 512 KiB. Check encoded lengths before allocating decoded arrays.

Conversion builds the complete CAR and calls the existing `SourceBundle.read`
and `LoadedDefinition.load` admission path. This checks the 512 KiB CAR bound
including framing, 64-block bound, 64 KiB manifest block, closure identities,
schema and program validity, profile support and optional views. No caller can
use a JSON document to bypass ordinary definition admission. No network lookup
or filesystem access occurs in the portable helpers.

The definition root CID and every named raw-file CID must survive
document → CAR → document → CAR. The emitted CAR has one root, unique
raw blocks in first sorted-path occurrence order, followed by the root block.
Importing a CAR with a different block
order preserves its identities and bytes but canonicalizes CAR framing/order;
its original whole-CAR byte string is not the source identity. The document's
own JSON spacing and object-member order are likewise not source identity.

## API, CLI and discovery

Expose portable helpers on `atseq/application`:

- Parse and validate an `atseq-source` document into an admitted `SourceBundle`.
- Export an admitted source closure into a document with the full manifest.
- Serialize a document deterministically for storage or sharing.

Keep directory `pack` behavior. Add `packDocument` to read one JSON document and
write a validated CAR, and `unpackDocument` to read a CAR and write one JSON
document. Reuse the existing output protection rules: no overwrite by default,
no symlinks, and protection for explicitly named key, intent and token files.
The operations write one file; they do not extract untrusted paths to disk.

`describeDefinition` normally returns lean versioned discovery:
`{ version: 1, cid, manifest, lexicons }`. `describe` accepts the optional
`includeSource` boolean parameter; only `true` adds the complete source document
for that same loaded definition. The CLI exposes the same explicit option.
Worker synchronization, validation and comparison stay lean. Retain the existing manifest
and parsed Lexicon convenience fields because forms already consume them;
derive all three from one loaded source closure. This deliberately duplicates
some schema bytes but avoids a new fetch protocol or a second schema authority.
The document can be reconstructed and its root compared with `cid` by a fresh
client. Versions other than 1 are unsupported until an explicit extension.

The `describe` Lexicon validates the versioned discovery fields instead of
leaving the whole definition as `unknown`. The current log contract includes
that Lexicon in its semantic identity, so changing it also changes the log and
application profile CIDs. Independent decision `3528d227` approved explicit
`atseq-log-v2` and `atseq-app-v2` descriptors and CIDs, while retaining the
unchanged `atseq-jsonata-v1` evaluator CID. No identity inputs are omitted and
no historical schemas are duplicated. Application opening and source loading
refuse historical v1 profiles with `unsupported_runtime`. The prior captures
remain unchanged and require their retained original interpreter. Host and
worker discovery use the same helper.
Discovery remains a source
description: its host-supplied head, source and frontier become authoritative
only through the verification and replay path. A matching source CID proves
bytes; it does not prove that a host selected the correct active definition.

## Viewless authoring evidence

Provide retained, single-document examples for a taskboard, guitar shortlist
and ledger. Each has `views: []`, state and input Lexicons, exact folds, initial
state and at least one named query. Use integer minor units for ledger and
guitar money; do not introduce a novel Lexicon money format. The taskboard
supports adding and completing an item. The ledger records an entry and
returns the balance. The guitar example lists candidates and returns a
summary. These are application source, not application-specific host code.

Run each example through document conversion, validation, local preview,
application creation, signed submit, query and outcome inspection. For one
example, fetch discovery from the real host, reconstruct its CAR using only
the returned source document, and compare every retained source CID and byte.
Exercise the generic browser with no authored view: action forms and query
inspection must remain available. The existing preview's empty actor-key
simulation is documented as local preview; B0 does not claim an authorization
decision or implement C1 capability discovery.

## Review and verification gates

The decision reviews confirmed the representation, optional/retained file
table rule, transport bounds, lean/opt-in discovery shape and explicit profile
advance before the affected implementation. Retain evidence for exact bytes,
aliases, reordered retained file tables,
canonical base64, duplicate/traversal paths, unsupported versions, stale CIDs,
size/count limits and source identity preservation. Add a browser execution
case for portable conversion; a successful browser build alone is insufficient.
Finally run source checks and the relevant source, host, CLI, browser and
packaged-consumer gates, with an independent exact-head review before landing.

No source/network authority, capability metadata, encryption, compiled action
language or arbitrary directory extraction is added by this task.

## Existing implementation evidence

The [implementation result](2026-10-01-atseq-authoring-bundle-results.md) reports
the real PDS, CLI, Chromium and packaged-consumer checks and retains exact source
inputs and hashes. The final full suite passes 364 tests.

- [`SourceBundle`](../src/definition/source.ts) packs raw bytes, verifies CAR
  blocks and enforces transport limits.
- [`LoadedDefinition`](../src/definition/load.ts) checks manifest shape, paths,
  the complete source closure, schemas, programs and optional views.
- [`describeDefinition`](../src/application/definition.ts) currently omits
  exact source bytes; host and browser worker share it.
- [`JSON CLI`](../src/cli/main.ts) provides directory packing and generic
  creation, submit, query and outcome operations.
- [`describe` Lexicon](../lexicons/ai/generalbusiness/atseq/describe.json)
  currently leaves the definition representation unversioned and unknown.
- [Definition guide](../docs/definitions.md) explains the existing retained
  closure; [interaction guide](../docs/interaction.md) explains generic forms
  and the JSON CLI.
