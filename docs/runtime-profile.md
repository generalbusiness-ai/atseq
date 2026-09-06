# S0 candidate runtime profile

`atseq-jsonata-js-2.2.2-candidate-1` uses unmodified `jsonata` 2.2.2 in Node and
the browser. This name is provisional until S1 defines the wire descriptor and
its content identity. A later profile change must have a different identity;
historical interpretation cannot silently adopt it.

## Expression and value contract

Fold input is `{meta, act, state}`. An effective fold returns exactly
`{decision:"effective", state:<object>}`. An ineffective fold returns exactly
`{decision:"ineffective", reason:<stable_code>, message?:<string>}`. A query
receives `{params,state}` and returns a JSON value checked against its declared
Lexicon output. Schema checks around app execution are composed by the worker
in S0; full definition binding belongs to S3.

The candidate admits JSONata paths, field selection, array filtering, object
and array construction, conditions, blocks, local data variables, and ordinary
arithmetic, comparison, boolean, membership and string-concatenation operators.
Local variables retain normal JSONata names. Built-ins cannot be replaced or
used as values. Calls must directly name one of:

```text
abs ceil floor round count sum min max length exists not lookup
append merge contains substring lowercase uppercase
```

No dynamic function application, function aliases, user-defined functions,
partial application, transforms, pipelines, regexes, generated ranges,
wildcards, descendant traversal, sort nodes, clock, randomness or `$eval`.
No external callbacks or variable bindings. This is an admission profile around
the existing interpreter, not a second implementation of JSONata semantics.

Only plain JSON values are admitted. Every number, including an intermediate
result, must be a safe integer; negative zero is rejected. Division that yields
a fraction is an error. Use integer minor units or explicit decimal strings.
Absent and null remain different, arrays retain order, and extra object fields
are retained. Undefined, sparse arrays, functions, symbols, accessors, cycles,
non-plain objects and malformed Unicode are rejected. Keys `__proto__`,
`constructor`, `prototype` and `_jsonata_*` are reserved in this candidate.
Engine-owned sequence metadata is removed when materializing an evaluated
array; caller-supplied extra array properties are refused.

Sorted-key JSON encoding measures evaluation limits. It is **not** the wire
signing format; S1 must specify canonical atproto CBOR separately.

## Bounds and failure

The exact constants live in `src/runtime/profile.ts`:

| Bound | Value |
|---|---:|
| State | 128 KiB |
| Complete input / output | 256 KiB each |
| Action | 32 KiB |
| Program | 64 KiB |
| Schema source set | 512 KiB, 64 files |
| JSON container depth | 32 |
| AST walk size / depth | 4,096 visited containers / 64 |
| Evaluator nesting | 64 |
| Evaluator entry visits | 100,000 |
| Intermediate sequence length option | 16,384 |
| One intermediate result | 1 MiB |
| Nodes visited while inspecting intermediate results | 2,000,000 |

The engine's pinned symbol entry/exit hooks count evaluation visits and inspect
returned data. These are deterministic units, **not** CPU instructions or a
hard process-memory quota. Built-in work is bounded by the admitted functions
and bounded input/result data. Temporary allocations happen inside the engine
before a result is checked. The sequence option is a supplementary engine
guard, not an assertion that every array allocation uses that path.

Evaluation errors propagate. A malformed result or exhausted budget never
returns an ineffective decision. The browser experiment runs evaluations off
the main thread and terminates its worker after a 15-second operational
watchdog; it preserves sample state and requires reload before retry. The
watchdog is not part of semantic effectiveness. A later host must provide the
same worker/process failure boundary and atomic projection/frontier handling.

S0 enforces the schema-set cap. S3 must enforce the same source-closure cap
across **all** manifest, schema, program and view files together; independently
passing sub-bundles do not establish that complete-closure gate.

## Lexicon reuse

`@atproto/lexicon` 0.7.12 parses documents and validates data at runtime. Atseq's
small profile check admits objects, strings, integers, booleans, arrays, refs,
closed unions, query definitions and params. Nested objects use Lexicon refs.
References must resolve within the supplied schema set. Standard bounds,
enum/const and string formats are accepted where the library supports them.
No authored DDL or per-app generated client is required.

Default values are rejected at source admission because the validator can
otherwise materialize absent values. Validation must return the same data;
Atseq retains the supplied value rather than a stripped or coerced replacement.
Open unions, blobs, bytes, unknown types, records, procedures and subscriptions
are outside this **domain-state** experiment. S1 needs separate framework
record/method schemas. This restriction does not claim those constructs are
invalid Lexicon.

## Inlay reuse

`@inlay/core` 0.0.13 and `@inlay/render` 0.3.1 expand retained component records.
Imports resolve only from the supplied source set. External component bodies,
external imports and XRPC calls are refused. The shipped version requires
bindings such as `['props','summary']`; its README's older `['summary']` example
does not work at this version.

Atseq registers Panel, Text and Action primitives under a local test namespace.
They have exact allowed props. Templates cannot add HTML, scripts, event
handlers or auto-submit properties. The DOM adapter creates text nodes and
ordinary controls. It gets no signing key; only the control's explicit submit
handler invokes the sample action. A missing component or binding is an error.
The renderer also limits source size, expansion depth and node count.

These local test names are not claims of a registered production namespace.
