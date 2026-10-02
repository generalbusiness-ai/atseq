# Native source admission implementation: preparation

Date: 2026-10-01

This is an implementation checkpoint for N1-F2, not a completion report. The
request is `1521c26e9317a5324a8870a51ac92288c4479b3e`, and the accepted promise is
`19d2e6d1ce4e9465342b1bd983df1e68c0de844e`. The worktree started from main
`c242ca20e823ea510e3939a8466a608f3ab860ba`. It has no public API, supported-profile,
package, dependency, authority or coordinator changes.

## Prepared source boundary

The new internal owner admits a definition and its actions only after checking
the complete declared closure, strict source JSON, maintained schemas, initial
state, every fold and query program, every view, and derived action contracts.
Admission uses private WeakMaps. Returned facts are frozen, returned bytes are
copied, and action absence is available only from an admitted definition.
Admission establishes source facts; a later owner must authenticate which
definition and closed set a native genesis or activation selects.

The transport checks every listed body hash before reporting a closure mismatch
or normative size violation, except decisive authenticated root/count failures.
It counts canonical logical CAR framing and every decoded named occurrence
separately. Named aliases share a block but count separately toward decoded
source size. Smaller local retention or read capacity remains unavailable.

Streaming uses the maintained, already pinned `@noble/hashes` 1.8.0 SHA-256
primitive. A fixed 32 KiB owned scratch region feeds the hash and retained bytes;
one bounded buffer replaces per-chunk retained objects. Intrinsic typed-array
accessors prevent overridden length or subarray properties from becoming size
evidence. Empty chunks do not accumulate retained objects, and delivered chunk
count is bounded by the larger of 64 and the local read-byte budget. These are
operational limits, not replicated validity rules. Retention is capped at the
normative 512 KiB; decoding the root requires at most the existing 64 KiB wire
scratch. This describes retained bytes, not a measured process-memory bound.

The iterative projection follows normalized reachable references once and
strips schema/output/error annotations while retaining literal description,
const, default, enum and known-value data. Its raw canonical JSON identity is
separate from its 32 KiB content locator. The existing maintained admitted schema
subset remains in force; preserving a literal default in projection does not
make an unsupported default constraint admissible.

## Validation so far

Own-worktree package and PDS fixture dependencies are installed. The literal
conformance gate passes on Node 26.10.0 and resolves the maintained primitive to
`node_modules/@noble/hashes/esm/sha2.js`. Its native, application and evaluator
identities exactly match the reviewed N1-D3 literals from
`80e39957b6cd0d1f113f0722f6d8ef782f42e96f`.

The first gate caught an implementation error: evaluator transport frames its
canonical CBOR, whereas native schemas and rule documents frame canonical JSON.
That framing error was corrected before the passing capture.

The retained passing capture is
`experiments/post-spike-evidence/2026-10-01/native-source-admission/literal-node26.json`.
Its SHA-256 is
`a9a09345a78689d1e1a3b567ffcfff7693c4aa649ef4d6a407425385b9309395`.

The portable source/hostile corpus and actual compiled-build probe are written
but have not run. They cover retained independent block/source identities,
recursive/shared and long references, annotation and literal preservation,
strict/owned JSON, whole-definition validation, closure omissions/extras,
aliases, CAR framing, local limits, full oversized stream verification,
corruption precedence, ownership and forged capabilities. Node/Chromium equality,
Node 22, the compiled build and the required complete checks remain pending.

## Remaining integration and decision

The owner imports P4's shared `src/protocol/strict-json.ts`. It does not duplicate
the parser. Approved P4-F1 `f31fa246fbd7bb7606137f2ea91aa1f25e588216` still needs
to land before this worktree can integrate and validate that dependency. The
current type check has only the absent module and its resulting error-narrowing
diagnostic; it is not a passing complete check.

A later coordinator must not derive replicated invalidity from an arbitrary
exception code. Reader callbacks can throw their own `AtseqError`, including
`invalid_activation`. Foreign reader, interpreter and integrity faults currently
propagate without admitting source. Before connecting source failure to an
outcome producer, review private owner-issued failure evidence tied to the exact
root and closed set, or an equivalent internal typed result. That evidence must
distinguish proven invalid/incompatible source from an unbranded callback fault.
No outcome-producing rule or failure capability has been added at this checkpoint.

After that direction and the shared-parser landing, finish the focused Node,
Chromium and compiled gates, complete the checks, replace this preparation
status with exact source/capture pins, and request independent review. Full N1,
activation, grants, eligible execution and coordinator integration remain open.
