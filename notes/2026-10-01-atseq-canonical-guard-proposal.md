# Canonical guard optimization proposal — 2026-10-01

Recommend a small first change: count tokens emitted from punctuation, safe
integers, booleans and `null` by their string length. These tokens are always
ASCII, so their UTF-16 length equals their UTF-8 byte length. Keep TextEncoder
for every string and object key. Keep the existing traversal, paths, schema
guards, error order and per-token charge callback.

This is V0 design preparation for workroom request
`592e7c3327a8740f7a701b64e32a454cc7213aaa`, based on main
`c5048df5060125a079196dadbb6bffdf23b50b13` and P0 assessment
`48368128a26338a3a3132927a6e6d8d1824463f5`. No production source, package pin,
dependency approval or semantic descriptor changed. Experimental substitutions
run only in isolated processes or browser bundles. Independent decision review
is required before implementing the proposal.

## What costs time

P0's [measured baseline](2026-10-01-atseq-performance-baseline-results.md) shows
growing-state validation as a major cost. The independent assessment attributes
about 43.2 seconds to state validation at 10,000 actions, with about 1.68 seconds
inside the nested official Lexicon validator. Those timings are nested, rather
than independent costs to add together.

[Schemas.validate](../src/definition/schemas.ts) and its XRPC helper first guard
the supplied value, then validate it through the pinned ecosystem library, then
guard both the returned value and the supplied value again for comparison.
Success therefore invokes three canonical walks. Failure can stop earlier.

[canonicalJson](../src/core/values.ts) sorts object keys, reads owned descriptors,
checks types and depth, detects cycles, emits canonical tokens, charges their
UTF-8 sizes and builds the result. Every token currently creates an encoded
byte array, including one-character punctuation. Each child also builds an
error-path string, even when no error occurs.

For one value, let B be emitted bytes and k each object's property count. The
walk costs O(B + Σ k log k), with bounded nesting, and O(B) output storage.
Three guards retain that complexity with a large constant. Revalidating an
append-only state at every action still performs quadratic cumulative work in
history length until a profile limit is reached. This proposal reduces constants;
it does not solve that growing-history pattern or replace checkpoints.

| Priority | Source location and finding | Proposed treatment | Risk |
| --- | --- | --- | --- |
| 1 | `src/core/values.ts:21`, TextEncoder allocation for each token | Bypass encoding only for known ASCII emitters; same bytes and charge calls | Low, localized proof and differential tests |
| 2 | `src/definition/schemas.ts:153` and `:172`, three guards on successful validation | Retain all passes under the current behavior | Removing passes changes mutation, alias or proxy behavior |
| 3 | `src/core/values.ts:28`, eager paths for every child | Retain current paths for this first change | Extra path-stack machinery has no clear measured benefit |

The skill's static core scan produced loop leads, not a complexity proof. Source
inspection and the bounded measurements above identify the relevant hot paths.
No unrelated scanner finding is proposed for implementation here.

## Isolated measurements

The [Node capture](../experiments/post-spike-evidence/2026-10-01/canonical-guard-node.json)
contains every sample, encoding count, differential result and shortcut
counterexample. The [exact candidate sources](../experiments/post-spike-evidence/2026-10-01/canonical-guard-sources.json)
retain both TypeScript and transpiled JavaScript for all eight variants. The
[harness](../experiments/canonical-guard/run.mjs) verifies the compressed and raw
hashes of P0's retained 1,000-action input, loads its exact source definition,
and reconstructs the same growing-state shapes used in P0's independent kernels.
It does not replay a 10,000-action growing history.

Measurements used Node 26.10.0 on an Apple M5 Max, macOS arm64. Each row has nine
samples of three calls, after three warmup samples, with rotated variant order.
The final timing capture ran after this worktree's browser, build and check
processes finished. Other programme or host activity, JIT and GC remain possible
noise. These independent kernels do not establish an end-to-end speedup.

Median milliseconds per call:

| Input and kernel | Current | Proposed known ASCII | ASCII regex for all tokens | Manual UTF-8 count | Lazy paths only |
| --- | ---: | ---: | ---: | ---: | ---: |
| 99-item state, canonical | 0.035 | 0.015 | 0.017 | 0.015 | 0.036 |
| 999-item state, canonical | 0.242 | 0.082 | 0.098 | 0.083 | 0.245 |
| 9,999-item state, canonical | 2.579 | 0.721 | 0.891 | 0.749 | 2.516 |
| 9,999-item state, three guards plus official validation | 8.564 | 2.416 | 2.890 | 2.511 | 8.477 |
| 1,000 small records, canonical | 1.929 | 0.855 | 0.594 | 0.528 | 1.854 |
| 128 KiB ASCII string, canonical | 0.057 | 0.059 | 0.086 | 0.142 | 0.058 |
| 64 Ki UTF-16 units of BMP text, canonical | 0.066 | 0.069 | 0.071 | 0.103 | 0.066 |

The validation kernel is a hand-extracted three-guard wrapper around the actual
locked Lexicon validator. It is not a timing of an altered production Schemas
method. Functional checks below exercise the real methods through isolated
module substitution.

The proposed shortcut reduced encoding calls on the 9,999-item state from
20,007 to three, while preserving all 48,922 charged bytes. The remaining
encodings are its keys and string value. This allocation reduction is concrete;
heap or RSS improvement was not measured.

The general regex and manual byte counter are faster on the small-record shape,
but add work on long strings. They need their own workload decision and broader
Unicode/counting review before adoption. Combining lazy paths with known ASCII
changed the 9,999-item canonical median to 0.690 ms in this capture; the small,
mixed differences do not justify extra path-stack control flow. No variant wins
every shape. The known ASCII shortcut gives a substantial reduction on the P0
numeric-state case with the least new behavior to prove.

## Why retain the three guards

Reusing the initial string is not equivalent to comparing the two values after
validation. A controlled validator that changes `{n:1}` to `{n:2}` in place and
returns that object passes the current comparison. Comparing its result with
the cached initial string instead raises `schema_coercion`. The same difference
occurs when the validator mutates the input and returns an equal distinct object.
These characterize the existing wrapper; they are not reports of observed
upstream mutation on ordinary admitted values.

Reducing two post-validation guards to one when the returned object aliases the
input also changes behavior. A plain-prototype proxy can return changing owned
descriptor values on successive walks. The current comparison can detect a
difference; an identity shortcut accepts it. Prototype checks alone do not prove
absence of a proxy. The initial guard also cannot replace post-validation checks
for an aliased result that has become invalid.

The [controlled real-wrapper cases](../experiments/canonical-guard/schema-probe.ts)
exercise actual `Schemas.validate`, `queryParams` and `queryResult` methods with
artificial validator receivers. Their 21 outcomes match between baseline and
the proposal in Node and Chromium, including mutation, distinct coercion,
negative zero, mapped ValidationError, host faults and changing descriptors.
This preserves current behavior without claiming that it is a stronger immutable
input contract. A future reduction in pass count needs a separately reviewed
ownership/immutability boundary or an explicit contract change.

## Correctness evidence and remaining gates

Seven candidates and a compiled baseline each matched the actual guard across
1,054 cases in Node, and again in both Chromium bundles. The corpus includes
1,000 seeded values and 54 named hostile/boundary cases. It compares returned
text, error name/code/kind/message and the entire per-token charge sequence.
Cases cover byte and depth limits, Unicode and invalid surrogates, safe integers,
intermediate negative zero, prototypes, symbols, reserved keys, enumerable
accessors, ignored nonenumerable members, holes, cycles, shared references,
engine-array annotations, charge failures and callback mutation of upcoming data.

The [Node baseline](../experiments/post-spike-evidence/2026-10-01/canonical-guard-shared-baseline.json)
and [Node proposal](../experiments/post-spike-evidence/2026-10-01/canonical-guard-shared-ascii.json)
each pass 145 shared protocol/runtime/evolution assertions with matching case
results and three semantic CIDs. A process-local loader replaces only the guard
module. The [Chromium capture](../experiments/post-spike-evidence/2026-10-01/canonical-guard-browser.json)
executes 133 shared protocol/runtime assertions in both baseline and proposed
source bundles, with matching results and CIDs. The twelve evolution assertions
that import Node's assertion library are covered in Node; they were not ported
to Chromium. Chromium version is 153.0.8010.12. Production source is unchanged.

Clean root/fixture installation, the normal build and `npm run check` passed for
this proposal worktree. The build checks the unchanged installed closure. It
does not publish the experimental guard. Exact source, harness, input and
validation hashes are retained in the [evidence manifest](../experiments/post-spike-evidence/2026-10-01/canonical-guard-manifest.json).

Decision requested: approve the explicit known ASCII shortcut only, with all
existing schema passes and eager paths retained. Its implementation should use
an internal token flag, set only at punctuation and validated primitive emission
sites. String/key emission keeps the original encoder. Byte accounting, charge
order and all validation predicates stay in place; no serialization cache is added.

After independent decision review, implement against then-current main and
recheck the exact source basis, including any M0 provenance update. Run the
shared hostile/semantic gates, current full suite, actual packed-consumer and
browser tests, build/integrity checks and full acceptance. Preserve descriptors
and CIDs only through independently reviewed equivalence with those actual
implementation results. No installed-consumer test, full suite, full acceptance,
end-to-end catch-up timing or post-change production measurement is claimed by
this source-only proposal. No new P0 growing replay is needed to decide this
first local change; a bounded actual-method before/after kernel belongs in its
implementation report.
