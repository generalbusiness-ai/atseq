# OAuth foundation review fixes

Date: 2026-10-01. Final validation: 2026-10-02.

The two required OAuth foundation review fixes are implemented. Fresh validation
passed in Node 22.19, 24.21 and 26.10, and in Chromium 153. These results use the
maintained clients with a synthetic authorization server. They establish no
external provider result or full A1 completion.

## Scope and review basis

A1-F2 request `c4b3dcc84f75c93be0e08a64d75c3ec38d76f207`, promise
`f0dcc5058228c4ecc248124ff03f395f9b2894fc`, addresses the two required changes
in independent review `ba23344628dba87676fb8d1cd0878725582a651c`, adopted by
ratification `4ed28a2901e93a84831bfb33c029904766606908`.

The isolated branch integrates approved main
`c242ca20e823ea510e3939a8466a608f3ab860ba` with frozen OAuth foundation
`7807cd9a3b89c6255169280fe0d75925d05948e9`, then approved checkpoint reader
merge `db0c81747f17f180a034c67791ff1cd287c67a6a`. Final validated source is
`022404f525131318ebe450f7ee20bed64a8b0408`. The final delivery adds only this
report and its retained evidence to that source. The foundation's previous
reports and captures remain unchanged.

This remains an internal foundation. It adds no public enrolment flow,
persistence policy or publication flow. Accepted bounded-custody policy will be
implemented under a separate followup. Native execution, checkpoint trust,
restore and host readiness are outside this fix.

## Callback ownership

`complete(params)` accepts one callback, with no separately supplied transaction
ID. The official SDK generates the callback `state` nonce. The application's
transaction ID passed to `authorize({ state: id })` is retained as `appState`;
it is **not** the callback nonce.

After callback shape and issuer URL checks, each local client subclass reads
`appState` through the SDK's declared protected `stateStore` hook. This read and
the following consume run under the adapter's custody lock. The recovered ID
selects only the owned pending transaction; the SDK then consumes its matching
callback nonce. Returned application state, subject, scopes, current PDS and
issuer are checked before returning an opaque session. Keys and credentials do
not leave custody.

This correction is recorded in workroom assertion
`48f54fc1178227ab4e4e5c8c5d6e5503cecc973a`. It replaces the earlier assumption
that callback state equals transaction ID and the attempted direct access to a
protected SDK member. The implementation uses small local subclasses of the
published [AT Protocol OAuth clients](https://github.com/bluesky-social/atproto/tree/main/packages/oauth),
without accessing private browser database internals or replacing SDK policy.

The Node and Chromium regressions create two genuine pending SDK transactions.
Unknown, duplicate and malformed callbacks exchange no token and leave both
transactions usable. Each valid callback subsequently completes, including
reverse order. The existing Chromium race after reload permits exactly one
completion across two documents. Missing issuer, expired transaction and
replayed callbacks are refused.

A failed `begin()` keeps its transaction because the client may leave orphan
PAR state. That transaction occupies the same ten-entry cap and expires after
ten minutes. This fix does not introduce a new retention policy.

## Failure classes and bounded transport

Native fetch rejection, failed body reading and the actual operation deadline
become `content_unavailable` / `transient`, with fixed messages. Project-owned
`origin` failures retain their code with a fixed message. The operation boundary
follows bounded `Error.cause` and `AggregateError` chains for those project-owned
codes. It does not classify server descriptions or arbitrary error names.

URL, byte, count, callback, scope and SDK authorization or refresh HTTP refusals
remain `input` / `invalid_input`. Resource HTTP refusals remain observable
`Response` values, as with fetch: receiving HTTP 400 is not a transport rejection.
Unexpected SDK failures outside the native fetch/read boundary retain the
existing fixed `input` failure.

The Node wrapper's duplicate size transform is bypassed with its supported
`responseMaxSize: Infinity` option. That option returns the response unchanged,
without buffering it. The owned reader still enforces a 1 MiB response limit
and the shared 32 MiB operation budget on every edge. This avoids the wrapper's
untyped size error, which otherwise looks like a dropped socket body. The
oversized-response regression requires `input`.

Node DNS or dispatch refusals inside native fetch, and browser
`redirect: error` rejections, can be indistinguishable from network failures.
They remain refused and are reported as unavailable. The Chromium test confirms
that a redirect target is not dispatched. Observable policy checks before fetch
and SDK errors from received HTTP refusals retain their deterministic class.

The Node test uses an actual local socket to drop a connection before headers,
drop it while its body is being read, and leave the body open until the adopted
30-second deadline. It does not substitute a timeout exception or accelerate
the timer. Its test-only route forwards only an AbortSignal to the fault socket,
with no OAuth credentials or request body. A test wrapper gives the real socket
response stream its synthetic HTTPS response URL so the production URL guard
remains in force. These are transport fault results, not provider observations.

## Fresh validation

Build completed before checks and tests. Both test suites used their default
parallel execution. No coordinated measurement window remained outstanding.

| Validation | Result |
| --- | --- |
| Fresh build | Passed; 131 source pins and 430 installed output pins |
| Type, formatting, layers and dependency checks | Passed |
| Node 22.19 OAuth | 2 tests, including the same 35 probe cases; passed |
| Node 24.21 OAuth | 2 tests, including the same 35 probe cases; passed |
| Node 26.10 focused suite | 67 tests; passed |
| Chromium 153.0.8010.12 OAuth | Maintained clients, reload, cross-document consume, two pending transactions, non-extractable keys, transport and HTTP refusals; passed |
| Ordinary Node 26.10 suite | 454 tests; passed; the 20,000-entry boundary was separately excluded |
| Installed packed consumer, in each suite | 219 actual compiled conformance cases; passed |

The focused suite includes OAuth, package, lazy integrity, native wire,
authority, portable proofs and real browser conformance. Package builds run in
private copied staging roots. Both captures confirm that the shared checkout's
`dist` sentinel and integrity adapter survive the package test. The installed
consumer refuses a tampered OAuth dependency at lazy enrolment. The separate
20,000-entry boundary was not rerun for this OAuth-only change.

The same six package, shrinkwrap, dependency, file-approval and notice files are
byte-identical to OAuth foundation `7807cd9a`. Its 194-package runtime graph
still consists of the previous 147 exact packages plus the same 47 additions.
Checks verified the physical installed closure. No new dependency, public
export or semantic profile is introduced by these fixes.

Ordinary start bundles still exclude executable OAuth modules, while retaining
the approved package metadata. Their measured added cost is 90,248–102,686 raw
bytes and 8,329–9,457 gzip bytes for browser/verifier graphs, and
333,325–345,573 raw bytes and 94,487–95,063 gzip bytes for Node start graphs.
These are specific synthetic bundle comparisons, not universal startup costs.
A separate grouped-metadata gzip measurement is not an additive contribution
to the ordinary bundle. Dynamic adapter and client chunk boundaries remain.

## Evidence and limits

The [evidence manifest](../experiments/post-spike-evidence/2026-10-01/oauth-review-fixes/manifest.json)
binds exact final source files, commands, environment, build provenance,
focused and ordinary package results, installed SDK inspection, bundle graphs
and all raw logs. Final command exit codes are zero. Source and runtime code
were not changed during fresh validation.

All first, second and third draft captures are retained unchanged. The first
draft failed callback correlation. The second exposed protected SDK access,
a concurrent build/check resolution failure and transport harness defects.
The third Node checks passed, while Chromium rejected a stale assertion that
expected an HTTP-style refusal for a native redirect rejection. The final
source corrects that assertion. Earlier captures lacking exact source pins are
identified as draft evidence, not retrospectively attributed to final source.

The final results support independent exact-head review of A1-F2. They do not
establish external provider interoperability, bounded persistent credential
custody, browser physical retention guarantees, operational enrolment or a
production publication host. Those remain explicit implementation and review
gates in the programme.
