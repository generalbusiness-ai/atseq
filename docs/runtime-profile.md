# Runtime profile

Atseq's first versioned application contract is `atseq-app-v1`. It includes
`atseq-log-v1` and `atseq-jsonata-v1`. The [semantic descriptors](../src/core/contracts.ts)
are canonical data identified by CBOR CIDs. The same evaluator and admission
checks run in Node and browser workers.

## Expression and value contract

Fold input is `{meta, act, state}`. An effective fold returns exactly
`{decision:"effective", state:<object>}`. An ineffective fold returns exactly
`{decision:"ineffective", reason:<stable_code>, message?:<string>}`. Reasons match
`[a-z][a-z0-9_]{0,63}`; messages contain at most 1,024 Unicode code points. A query
receives `{params,state}` and returns a JSON value checked against its declared
Lexicon output.

The profile admits JSONata paths, field selection, array filtering, object and
array construction, conditions, blocks, local data variables, and arithmetic,
comparison, boolean, membership and string concatenation. Built-ins cannot be
replaced or used as values. Calls must directly name one of:

```text
abs ceil floor round count sum min max length exists not lookup
append merge contains substring
```

No dynamic function application, aliases, user functions, recursion, partial
application, transforms, pipelines, regular expressions, generated ranges,
wildcards, descendant traversal, sort nodes, clock, randomness or `$eval`.
No Unicode casing functions, external callbacks or caller bindings. Programs run
on the pinned JSONata interpreter with host admission, inspection and a checked
integer `$sum`; this is not a second general JSONata implementation.

Only owned plain JSON is admitted. Input and output numbers must be safe
integers and exclude negative zero. Intermediate negative zero is inspected as
zero and may be consumed by later arithmetic; an output that remains negative
zero is rejected. Other fractional or unsafe intermediate values fail. `$sum`
accumulates exactly and rejects any intermediate total outside the safe integer
range, even if later terms would cancel it. Use integer minor units or explicit
decimal strings.

Absent and null differ. Arrays retain order; extra object fields are retained.
Undefined, sparse arrays, functions, symbols, accessors, cycles, non-plain
objects and malformed Unicode are rejected. Keys `__proto__`, `constructor`,
`prototype` and `_jsonata_*` are reserved. Engine sequence metadata is removed
when materializing an evaluated array; caller extra array properties are refused.
Sorted-key JSON measures evaluation caps. Wire signing uses canonical DAG-CBOR.

## Bounds and failure

The [shared constants](../src/core/profile.ts) specify:

| Bound                                   |                                Value |
| --------------------------------------- | -----------------------------------: |
| State                                   |                              128 KiB |
| Complete input / output                 |                         256 KiB each |
| Action                                  |                               32 KiB |
| Program                                 |                               64 KiB |
| Complete definition closure             | 512 KiB, 64 files including manifest |
| JSON container depth                    |                                   32 |
| AST size / depth                        |        4,096 visited containers / 64 |
| Active evaluator nesting                |                                   64 |
| Evaluator entry visits                  |                              100,000 |
| Intermediate sequence length            |                               16,384 |
| One intermediate result                 |                                1 MiB |
| Cumulative inspected intermediate bytes |                               16 MiB |
| Ineffective message                     |            1,024 Unicode code points |
| Expanded view nodes / depth             |                           2,048 / 24 |

Symbol hooks count evaluation visits and inspect every canonical intermediate
result: keys, strings, punctuation and repeated values all consume the byte
budget. These units bound admitted work; they are not CPU instructions or a
hard process-memory quota. Temporary allocations occur before results are checked.

The AST walk counts object and array containers, so 64 AST levels admit 32
nested array expressions. Evaluator depth counts active AST ancestors, skipping
inactive nodes. Concurrent object fields and groups are siblings and do not
consume each other's depth. Recursion and dynamic user calls are excluded.
Sequence errors map to `sequence_limit`; a top-level absent result fails with
`absent_result`.

The [error registry](../src/core/errors.ts) assigns every code a tag:
`transient`, `invalid_input` or `runtime_fault`. The folder uses these tags,
rather than ad hoc code lists, to decide whether interpretation can continue.
Deterministic program, schema, state, size or budget failures record
`fold_failed/<code>`, preserve prior state and advance to the next entry.
A program's own ineffective decision remains a separate domain outcome.
Missing or corrupt retained source, persistence failure and runtime faults pause
the frontier without recording an outcome. A hash-valid oversized source block
is invalid input, so its activation is ineffective. Repair source or storage and
replay the same prefix to resume. An unexpected TypeError, RangeError or engine
fault requires a corrected interpreter; it never becomes replicated state.
If the same runtime fault occurs on every host, the app stays paused until that
implementation fix ships. A fix that restores the existing contract keeps its
CID after independent review and conformance checks; it needs no new genesis.
Dependency mismatch refuses execution before interpretation begins.

Browser workers have an operational watchdog. A killed worker or transport
failure is not a signed domain verdict. The verified history remains available
for replay, and queries cannot change state or advance the frontier.

## Lexicon and retained views

The domain schema profile admits objects, strings, integers, booleans, arrays,
refs, closed unions, query definitions and parameters. References resolve only
within retained schemas. Validation must preserve supplied values exactly;
defaults and coercion are refused. Open unions, blobs, bytes, unknown values,
records, procedures and subscriptions are outside the domain state profile.
Array items may contain inline object schemas: the ecosystem runtime validator
supports these, although its document parser excludes them. Atseq validates
document metadata and every supported node shape before runtime validation;
malformed references, constraints and view bindings are deterministic input
errors. Unclassified library faults always propagate and pause interpretation.
Framework records and methods have their own [Lexicons](../lexicons/ai/generalbusiness/atseq).
ICU-dependent grapheme limits and Unicode casing are excluded for portability.

Inlay imports resolve only within retained source. External bodies, imports and
XRPC calls are refused. Bindings use paths such as `['props','summary']`.
Atseq registers `ai.generalbusiness.atseq.ui.Panel`, `.Text` and `.Action`, with
exact allowed properties. Templates cannot add HTML, scripts, event handlers or
auto-submit behavior. Rendering receives query data, without signing keys or
callbacks. The DOM adapter creates text and ordinary controls; signing follows
an explicit user action. View bounds apply to source and expanded nodes.

## Identity and compatibility

The [registry](../src/protocol/identity.ts) exposes the three supported v1 CIDs.
Genesis and definition pin `atseq-app-v1`. The descriptor binds normative
validation shapes, wire/signature rules, admitted evaluation behavior, limits,
error outcomes, source loading and activation rules. Editorial Lexicon descriptions
are excluded; all validation fields remain part of the contract.

Formatting, source paths and implementation hashes do not enter these CIDs.
Independent [wire vectors](../tests/vectors/protocol-v1.json),
[contract CID vectors](../tests/vectors/profiles-v1.json), and shared Node/browser
conformance checks provide evidence that the implementation follows the contract.
Adding a regression vector alone does not change an identity.

The [approved interpreter dependency closure](../src/core/dependencies-approved.json)
records exact direct and transitive versions, lockfile integrity and dependency
edges, including installed optional and peer packages required by those packages.
The Node integrity check takes about 350–430 ms once per process on the measured
machine. It reads package files synchronously and uses a child Node process to
check import and require resolution. Successful checks are cached for that
process; a later filesystem change requires a new process.

The declared closure includes ts-morph, prettier, yargs and pino through
`@inlay/core` → `@atproto/lex` and its builder, installer and repository packages.
These are upstream production dependency declarations, even though Inlay's
shipped core JavaScript does not call the Lex tooling. We retain the complete
declared closure rather than claim these installed packages are absent.

The [file manifest](../src/integrity/files-approved.json) records their file bytes, including Pino's shipped nested test fixture
from a clean `npm ci`. Node checks those hashes before its first protocol or
interpreter operation and uses Node's import and require resolvers, including
package exports, to check the real paths reached by every dependency edge. It
refuses patched files, missing packages and unlisted nested packages. Successful
checks are cached for the process lifetime. This detects accidental or partial
installation drift; it is not a boundary against an attacker who can modify the
installation, verifier or Node itself, including changes after that check.
Node built-in modules belong to the trusted installed Node runtime.

Vite is a separately pinned host build tool under runtime dependencies. The
shell builder checks the interpreter closure before bundling and writes
`build-provenance.json`, with the dependency pins, interpreter file-manifest
hash, Node version and SHA-256 hashes of every emitted shell bundle. Keep that
provenance with a published build so readers can compare bytes against a known
build. It is excluded from semantic identity. Archives carry semantic runtime
descriptors, not this build-integrity manifest.

The browser selects a portable integrity adapter, never the Node filesystem
adapter. Its installed bundle embeds the checked dependency metadata. The
service worker compares downloaded bytes with the build's recorded hashes to
detect stale builds, transit or cache corruption. The page, worker, hashes and
service worker come from the serving host; this check does not authenticate that
host, and the first page load precedes service-worker installation. Trust the
runtime distribution and compare its published build provenance independently.

A dependency update requires a new semantic contract or an independently reviewed
claim that the new closure preserves the existing contract, supported by the
full conformance and acceptance suites. Approval updates the separate provenance
manifests. It never silently widens the semantic contract. Any behavior change
requires a new versioned descriptor and CID.

Every app keeps its profile for its lifetime. A new semantic profile means a
new genesis and a new app; activation cannot change the profile. Hosts retain
an interpreter for every CID they advertise in the supported registry. A CID
is never reassigned to different interpretation. Implementation corrections
within a contract follow the conformance and independent-review rule above.

This first version makes one planned break before external adoption. The active
registry contains only the three v1 contracts; the pre-v1 `test.atseq.*`
interpreter is historical, not registered for new apps. Its signed records,
profiles and archives are refused by v1. The agent-authored pre-v1 capture and
v0 vectors retain their original bytes and are replayed with their retained
original interpreter. Other spike reports, CARs, screenshots and s6 archives
were regenerated to exercise v1. Their original evidence remains at
[26d1528 on GitHub](https://github.com/generalbusiness-ai/atseq/tree/26d15287f3955eebd543f2c519c8506378c63d60/experiments).
Do not relabel old signatures or profile links.
