# Source map

The protocol and interpreter operate on public data. They do not depend on a
browser, host transport, filesystem or application vocabulary.

| Layer       | Purpose                                                       | May import                                             |
| ----------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| core        | Shared values, limits, errors, NSIDs and semantic descriptors | core; the conditional integrity adapter                |
| protocol    | Canonical signed records, history, invitations and identities | core, protocol                                         |
| runtime     | Bounded JSONata evaluation and folds                          | core, runtime                                          |
| view        | Portable retained-view resolution                             | core, view                                             |
| definition  | Source bundles, schemas, admission and view bindings          | core, protocol, runtime, view, definition              |
| application | App registry, activation, projections and queries             | core, protocol, runtime, view, definition, application |
| transport   | Public method shapes and byte transport                       | core, protocol, transport                              |
| client      | Participant API, identities and device storage                | portable layers, client                                |
| archive     | Complete verified public-history export and replay            | portable layers, archive                               |
| host        | PDS accounts, sequencing, HTTP and shell build                | portable layers, host, storage, integrity              |
| cli         | JSON operations and local participant files                   | portable layers, client, archive, cli, storage         |
| browser     | DOM, worker orchestration and user actions                    | portable layers, client, archive, browser              |
| storage     | Node filesystem helpers                                       | storage                                                |
| integrity   | Environment adapters for installation checks                  | core, integrity                                        |

Here, portable layers means core through transport in this table. Client and
archive remain portable too. Portable code cannot import Node built-ins, whether
written as `node:fs` or `fs`. Side-effect and dynamic imports obey the same rules;
computed import targets are refused by the dependency check.

`core/dependencies.ts` selects `#atseq-integrity` through package conditional
imports. Node selects the filesystem verifier; a browser build selects the
portable adapter. This is the one environment selection point. The Node
adapter does not enter browser bundles. Definition depends on view because
view admission is part of loading a retained definition; view cannot depend on
definition, DOM, signing or transport. CLI and host share the storage helper.

Application vocabulary belongs in retained definitions, not in this source
registry. Add an application by publishing its source, schemas and bindings.
Adding framework behavior, changing admitted values or altering interpretation
requires a versioned semantic descriptor and new CID. Formatting, file moves and
implementation corrections that preserve a contract keep its identity, with
conformance checks and independent review. See [the profile policy](../docs/runtime-profile.md).

`npm run check:layers` checks every source directory against this map.
