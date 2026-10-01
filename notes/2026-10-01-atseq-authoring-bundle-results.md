# Single-document authoring results

Date: 2026-10-01

Status: implementation complete in the B0 candidate; independent exact-head
review and landing remain pending. The code tested is
`51783e276e5a3aa4fb64c37c47aeb9138d9b939b`, rebased onto reviewed main
`a3c306aa8f5be555a88df8cb5b2bc30dc5ba1995`. The successor report and evidence
add no runtime, dependency, source-document or test changes.

Workroom task: B0, request `29bfbe650def15a33faec19ac33e64ed9c876762`.
Decision assessments: `75465898`, `3528d227` and `77e604a5`.

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
worker and Node. The taskboard's duplicate completion remained ineffective. The guitar CLI/PDS
flow submitted two distinct signed candidates priced at 1,000,000 each and
returned an available summary with a 2,000,000 total. Cheap maximum-state cases
validate 1,000 maximum-valued guitar candidates and rainfall readings, evaluate
the retained queries and validate their exact 1,000,000,000 totals in Node,
Chromium and the compiled consumer.

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
| Guitar shortlist | 3,683 | 4,684 | 2,209 | 6,902 |
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
encoder generated new v2 profile and protocol vectors. This successor inherits
the independently reviewed P1 native-proof closure and M0 security patch. A clean
install regenerated all 135 package-path approvals and file trees; the graph,
file hashes and 115 notices match reviewed main exactly. B0 advances the
provenance profile label to v2 and records its integrated basis without another
dependency change. The package build retains fresh source and output provenance.
See the [compatibility policy](../docs/runtime-profile.md#identity-and-compatibility).

## Verification and retained evidence

`npm run build` and the final `npm run check` passed. The final full suite at the
code head above passed **373 of 373 tests**, including Node, Chromium, reference
PDS and the fresh compiled package consumer. The shared runtime corpus has 67
cases, including eight source-document cases; the protocol corpus has 85 cases;
the compiled package corpus has 154 passing cases. The document host/browser
flow has four passing cases, reported as five tests including its parent. The
existing host flow has eight passing cases. Inherited fixture child-environment,
participation focus and offline archive/package checks also passed.

The first integrated run passed 369 of 371 tests. Its new guitar test attempted
to call the CLI's `outcome` alias as an XRPC method. The client method is
`receipt`; correcting that test call left product code unchanged. The guitar
subtest and its parent account for the two failures; the final full rerun passed
all four document flow cases. Earlier profile-change test corrections still
preserve their original archive tampering and retry assertions.

Current immutable evidence, all retained under a new successor directory:

- [Validation counts, exact source head and artifact hashes](../experiments/post-spike-evidence/2026-10-01/source-document-successor/validation.json).
- [Source/fixture inventory and exact byte hashes](../experiments/post-spike-evidence/2026-10-01/source-document-successor/inventory.json).
- [Reference PDS, CLI and viewless browser flow](../experiments/post-spike-evidence/2026-10-01/source-document-successor/flow-results.json).
- [Node and Chromium worker corpus](../experiments/post-spike-evidence/2026-10-01/source-document-successor/runtime-results.json).
- [Compiled package corpus and package hash](../experiments/post-spike-evidence/2026-10-01/source-document-successor/package-results.json).
- [Independent protocol vectors in Node and Chromium](../experiments/post-spike-evidence/2026-10-01/source-document-successor/protocol-results.json).
- [S3: definitions generated after host startup](../experiments/post-spike-evidence/2026-10-01/source-document-successor/s3-results.json), with its exact [rainfall CAR](../experiments/post-spike-evidence/2026-10-01/source-document-successor/s3-rainfall.car) and [interpretation](../experiments/post-spike-evidence/2026-10-01/source-document-successor/s3-rainfall.json).
- [Current package build provenance](../experiments/post-spike-evidence/2026-10-01/source-document-successor/build-provenance.json).

The inventory includes full reconstructed documents and deterministic CARs for
all three viewless examples and both current S3 fixtures. The updated viewless
guitar definition is
`bafyreibd4esaloqg3yfoui4ndueevdrw45vux7cjdw2wmhht53vjist5sm`; the default
rainfall fixture is
`bafyreianksdohdjeynj3t3r3jdnznqb5xkdwi2phu242icfo2ld5uabyia`.
The guitar and rainfall query bounds change only their sample source identities;
the framework profile CIDs above remain unchanged.

The original five `source-document-*.json` captures at candidate `a357f342`
remain byte-for-byte unchanged and are superseded by this directory. Its
`supersedes` fields identify each predecessor. The historical S3 files under
`experiments/evidence/s3/` also remain unchanged; current default fixtures and
the current generated-host exercise have separate retained CARs. Flow captures
project out installed test-dependency file hashes; project source and fixture
locks remain, while the approved runtime closure and package provenance cover
the shipped dependency bytes. No historical archive or source CID was relabelled.

These correctness checks ran alongside other correctness work. Their elapsed
durations are not performance measurements. B0 does not settle activation
compatibility, capability discovery, production identity admission or native
repository ordering; those remain separately tracked tasks.
