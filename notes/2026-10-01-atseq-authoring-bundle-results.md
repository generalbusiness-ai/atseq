# Single-document authoring results

Date: 2026-10-01

Status: implementation complete in the B0 candidate; independent exact-head
review and landing remain pending.

Workroom task: B0, request `29bfbe650def15a33faec19ac33e64ed9c876762`.
Decision assessments: `75465898` and `3528d227`.

## Result and recommendation

One JSON document now carries an application's complete retained source.
Portable APIs and the JSON CLI convert it to and from the existing standard CAR,
preserving each raw source byte and the definition CID. New authors may omit
the file table and application profile; conversion derives the table and fills
the installed profile. Supplied identities are checked, not silently replaced.

Routine discovery remains lean. `describe` adds a reconstructable source
document only with `includeSource: true`. The Lexicon validates discovery
version 1 and its fields. The client additionally closes the definition and
manifest shapes; a supplied complete source must reconstruct its advertised CID,
manifest and parsed Lexicons. This checks source bytes and metadata. Verification
and replay of the pinned history still establish the active definition and
frontier.

Prefer this representation for sharing source and for agents using the JSON CLI.
Use the CAR for repository storage and existing source transport. Keep complete
source export explicit: even these small examples make a full discovery response
about three times the size of the lean response. No capacity or latency claim
is derived from the correctness runs.

## What was demonstrated

The retained [taskboard](../testdata/source-documents/taskboard.atseq.json),
[guitar shortlist](../testdata/source-documents/guitar.atseq.json) and
[ledger](../testdata/source-documents/ledger.atseq.json) documents all have
`views: []`. Each passed CLI packing, validation, preview, application creation,
signed submission, query and outcome inspection against the real reference PDS
and mock PLC. An explicit host/CLI discovery response reconstructed the same
root, CAR and every source block. Routine and `includeSource: false` discovery
omitted the complete source.

A fresh browser reader used the taskboard's generic action form to sign and
submit a completion action, observed its effective outcome, and inspected the
query result without an authored view. All three examples also ran the same
portable conversion, identity, preview and query checks in a real Chromium
worker and Node. The taskboard's duplicate completion remained ineffective.

Exact binary bytes, CRLF, Unicode bytes, aliases, unused source files and a
reordered retained manifest table survived reconstruction. Hostile paths,
duplicate source paths, stale CIDs, malformed/noncanonical base64, unknown
fields/versions, extra or missing table paths, source/document/count limits,
accessors and unsupported profiles were refused. The CLI refused input symlinks,
input replacement and implicit output overwrite.

The fresh packaged consumer ran the same document corpus against compiled
modules, used the public conversion APIs and declarations, and executed the
installed CLI's `packDocument` and `unpackDocument` operations with ordinary
Node. Source checkout tooling was unnecessary for the consumer.

| Example | Source CAR bytes | Exported document bytes | Lean discovery JSON bytes | Full discovery JSON bytes |
| --- | ---: | ---: | ---: | ---: |
| Taskboard | 4,314 | 5,483 | 2,478 | 7,970 |
| Guitar shortlist | 3,680 | 4,680 | 2,206 | 6,895 |
| Ledger | 4,263 | 5,458 | 2,462 | 7,929 |

The document sizes use deterministic serialization including its final newline;
discovery sizes use compact JSON. These figures describe the retained fixtures,
not an upper bound on applications. Source and CAR allowance remains 512 KiB;
the JSON document allowance is 1 MiB, depth 32 and 63 source items.

## Explicit profile change

The current semantic descriptors include service Lexicons. Versioned discovery
therefore required the independently approved profile advance, even though log
ordering and the evaluator remain unchanged:

| Contract | Current CID |
| --- | --- |
| `atseq-log-v2` | `bafyreia3v3wcbtdnmvomgim66hnmnndtdfprcdjqxmdpavnkrsrnccsbui` |
| `atseq-app-v2` | `bafyreihjm5qgtokmfkgrwa5lagznvhybbuox4sif4oqtbwjzdpgwcpfnsu` |
| Unchanged `atseq-jsonata-v1` | `bafyreid5y7di742qa3u22dyoozcsuvsabsytc33jzz4gzlltodx3jpwxjm` |

Current application opening and source loading reject v1 profiles with
`unsupported_runtime`. The historical v1 vectors and experiment captures were
left byte-for-byte unchanged. They require their original interpreter; no
signatures, source identities or archives were relabelled. The independent
encoder generated new v2 profile and protocol vectors. Dependency versions,
lockfiles and approved package-file hashes are unchanged; only the provenance
profile label advances to v2. See the [compatibility policy](../docs/runtime-profile.md#identity-and-compatibility).

## Verification and retained evidence

`npm run build` and `npm run check` passed. The final full suite passed **364 of
364 tests**, including Node, Chromium, reference PDS and the fresh compiled
package consumer. The shared runtime corpus has 65 cases, including seven
source-document cases; the protocol corpus has 85 cases; the compiled package
corpus has 152 passing cases. The new host/browser flow has four passing cases.

Earlier failures exposed two stale test assumptions after the approved service
and profile change. The archive tamper fixture now changes the current version
instead of setting it to the already-current value 2. The CLI retry mock now
returns an actual versioned definition instead of an empty object. The original
tampering and retry assertions remain in place; the focused regressions and
final full suite passed.

Immutable public evidence and exact source inputs:

- [Source inventory and byte hashes](../experiments/post-spike-evidence/2026-10-01/source-document-inventory.json).
- [Reference PDS, CLI and viewless browser flow](../experiments/post-spike-evidence/2026-10-01/source-document-flow-results.json).
- [Node and Chromium worker corpus](../experiments/post-spike-evidence/2026-10-01/source-document-runtime-results.json).
- [Compiled package corpus and package hash](../experiments/post-spike-evidence/2026-10-01/source-document-package-results.json).
- [Independent protocol vectors in Node and Chromium](../experiments/post-spike-evidence/2026-10-01/source-document-protocol-results.json).

These correctness checks ran alongside other correctness work. Their elapsed
durations are not performance measurements. B0 does not settle activation
compatibility, capability discovery, production identity admission or native
repository ordering; those remain separately tracked tasks.
