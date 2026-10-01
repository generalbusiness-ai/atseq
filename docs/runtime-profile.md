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
Only restorable missing/corrupt retained source and persistence failure pause
the frontier. Oversized blocks and ordinary actions never create a permanent pause.
Repair source or storage and replay the same prefix to resume.

Browser workers have an operational watchdog. A killed worker or transport
failure is not a signed domain verdict. The verified history remains available
for replay, and queries cannot change state or advance the frontier.

## Lexicon and retained views

The domain schema profile admits objects, strings, integers, booleans, arrays,
refs, closed unions, query definitions and parameters. References resolve only
within retained schemas. Validation must preserve supplied values exactly;
defaults and coercion are refused. Open unions, blobs, bytes, unknown values,
records, procedures and subscriptions are outside the domain state profile.
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

The [approved dependency closure](../src/core/dependencies-approved.json) records
exact direct and transitive versions, lockfile integrity and dependency edges.
The runtime checks the actual installed package metadata and locked closure
before execution, in both Node and browser builds. It refuses an unmatched set.
Source and build hashes remain provenance in test reports and archives.

A dependency update requires a new semantic contract or an independently reviewed
claim that the new closure preserves the existing contract, supported by the
full conformance and acceptance suites. Approval updates the separate provenance
manifest. It never silently widens the semantic contract. Any behavior change
requires a new versioned descriptor and CID.

This first version makes one planned break before external adoption. It refuses
old `test.atseq.*` records, candidate profiles and spike archives. Those artifacts
retain their original bytes and signed identities. Use the retained original
interpreter to replay them; do not relabel their signatures or profile links.
Future profile changes must retain interpreters for previously supported CIDs
in the registry, or provide an explicit independently reviewed migration and
historical replay path. A CID is never reassigned to different interpretation.
