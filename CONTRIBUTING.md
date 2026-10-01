# Contributing to Atseq

Use gitseq requests to track work. Agree on the intended behaviour before implementing it, keep changes simple, and request an independent review of the exact tested commit before merging. User-facing explanations should use plain English.

## Set up and verify

Use Node 22.13 or later. From a clean checkout:

```sh
npm run setup
npm run check
npm test
```

Setup installs the root dependencies, the isolated official PDS/PLC test dependencies, Chromium and its Linux system dependencies, then builds the public JavaScript APIs and executables. It needs network access. CI runs setup and checks, then runs the same tests in two steps: the main suite followed by the real 20,000-entry boundary test, without other tests competing for CPU. Tests create marked disposable loopback data under `.atseq-local`; never use production records or credentials as test fixtures.

`npm-shrinkwrap.json` is the root installation lock and is included in packed distributions. The isolated PDS test environment keeps its own lock under `tests/support/pds`. Test helpers and browser harnesses live under `tests/support`; retained experiment results remain under `experiments`. Do not rewrite old evidence to make a new implementation appear measured. Retain new results separately, with commands, timestamps, source hashes and limitations.

## Source map and dependency direction

| Directory         | Purpose and allowed inputs                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/core`        | Semantic contracts, bounds, values and errors. Other core modules only.                                          |
| `src/protocol`    | Canonical wire data, identities, signatures and log verification. Core and protocol.                             |
| `src/runtime`     | Bounded evaluation and folding. Core and runtime.                                                                |
| `src/view`        | Restricted local declarative rendering. Core and view.                                                           |
| `src/definition`  | Retained source, schemas, loading and compatible changes. Core, protocol, runtime and view.                      |
| `src/application` | App instances, projections and interpretation. Definition and the lower layers.                                  |
| `src/transport`   | Shared public XRPC schemas and response bounds. Core and protocol.                                               |
| `src/archive`     | Retained exports and replay. Application and lower portable layers.                                              |
| `src/client`      | XRPC client, explicit signing and device storage. Application and lower portable layers.                         |
| `src/browser`     | Shell sessions, worker protocol, outbox, keys, forms and exports. Portable layers; no host capability.           |
| `src/host`        | PDS transport, writer lease, local accounts, HTTP and shell builds. Lower layers, integrity and private storage. |
| `src/cli`         | JSON adapter and protected file output. Portable layers and private storage.                                     |
| `src/integrity`   | Node installation verification and the browser build adapter. Core only.                                         |
| `src/storage`     | Private-file handling. Storage only.                                                                             |
| `src/api`         | Portable public package entry points. Application, client, archive and lower layers.                             |

`npm run check:layers` enforces imports, re-exports, dynamic imports, workers and portable boundaries. Only core selects the conditional integrity adapter. Portable layers cannot import Node built-ins or host code. Keep authority at the host, shell or CLI boundary; authored expressions and views receive data, not credentials or signing capabilities.

## Extension points

Most applications need a source bundle rather than changes to Atseq. Define action and state Lexicons, bounded folds, queries and local views; pack them with `SourceBundle`. [Definitions](docs/definitions.md) and [compatible changes](docs/evolution.md) describe that contract. A custom host can supply an `AccountProvider`. A library caller can supply a `SourceReader` and an optional projection persistence callback. [Package usage](docs/package.md) lists public entry points.

Add a new portable capability in its owning layer and expose only the required API. Add meaningful tests for its observable behaviour. Keep signed-input verification separate from interpretation. A receipt proves ordering; a projection outcome says whether an action took effect.

## Changing identity or dependencies

A semantic CID identifies a versioned contract, not a source build. Change a contract version when normative wire, validation or interpretation behaviour changes. Update independent vectors and conformance checks in both Node and Chromium, document the compatibility decision, and preserve old captures. Source edits and packaging changes do not by themselves change a semantic CID.

Dependency versions, file bytes, resolution edges and build output are separate provenance. Changing a dependency requires updating the root lock, the approved dependency and file closure, notices and conformance evidence together. Do not relax the verifier to accommodate an installation that differs from the reviewed closure. Source and compiled package entry points must fail closed in the same way.

## Inlay license evidence

The pinned `@inlay/core` 0.0.13 package declares MIT. `@inlay/render` 0.3.1 omits a license field. Neither published package contains standalone license text. The retained notice quotes the MIT declaration from the [pinned upstream README](https://tangled.org/danabra.mov/inlay/blob/f6d4f5808e5a822ae98d330ee8efff866bab0346/README.md); that is the available evidence, not confirmation from its author. Atseq preserves that declaration and does not invent a copyright notice. The missing package license text and lack of direct author confirmation remain a distribution risk to resolve before treating those notices as complete. See `src/archive/notices.json`.

When a dependency or package version changes, regenerate attribution with
`node scripts/source-run.mjs scripts/notices.ts` and review the notice delta.
CI checks the installed runtime closure with
`node scripts/source-run.mjs scripts/notices.ts --check`; this command reports
stale notices without changing them. The generator's existing license and
notice-retention policy applies to both modes.
