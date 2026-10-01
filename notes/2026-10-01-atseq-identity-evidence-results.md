---
date: 2026-10-01
status: internal foundations implemented; independent delivery review pending
runtime-source: fb5acd9ac3876de93917348e3ac12e080a885ef0
baseline: 4b6ebab532d0ae1de5adbbe3326d70e0a80f0136
request: 71b93a9c916f99f9828da61d3737553117e454ab
---

# Retained identity evidence: implementation results

The portable identity verifier and host fetch boundary now implement the adopted
[I1 design](2026-10-01-atseq-account-admission-design.md) and its independently
reviewed canonical-tip correction `e00cf34a`. The complete serial suite passed
380 tests. The shared 57-case identity corpus passed in Node, actual Chromium,
and a fresh installed package consumer. These are internal foundations, not a
completed account-admission flow or a new public API.

The [retained evidence manifest](../experiments/post-spike-evidence/2026-10-01/identity-evidence/manifest.json)
names the exact runtime source, package and fixture lock hashes, commands, raw
logs, public fixtures and capture hashes. It preserves the interrupted parallel
attempt separately. The earlier [source-preparation note](2026-10-01-atseq-identity-evidence-preparation.md)
describes its historical baseline and has not been rewritten as a runtime claim.

## Implemented boundaries

One strict retained-JSON parser feeds the same deterministic binding extraction
in Node and browser. It rejects malformed UTF-8, a BOM, duplicate decoded object
names, comments, trailing data and excessive depth. Maintained schema validation
is a precheck; PLC hashes and signatures use the original parsed signed operation,
never a projected schema result. A malformed signed object cannot lose unknown
fields during verification.

PLC verification uses `@atcute/did-plc@1.0.2` to authenticate the exact genesis DID,
operation signatures, predecessors and recovery hierarchy. It checks canonical
signature encoding, unsigned branch annotations and the complete computed
canonical tip. Selecting an older operation from a supplied full log fails; a
tombstone cannot be hidden by selecting an earlier active operation. Binding is
derived through maintained `normalizeOp` from the verified tip. A tip change
counts as an observation change even if it leaves the repository key and PDS
unchanged. Both supported curves and legacy genesis normalization are covered.

Hostname `did:web` derives its binding from exact retained document bytes. The
document DID and key controller must match the principal. Key representations
normalize through the existing maintained P1 curve checks. Service selection
uses the first matching supported service; a malformed first service cannot be
skipped for a later convenient answer. Endpoints must be HTTPS origins without
credentials, path, query or fragment. Method evidence cannot substitute the
weaker web assurance class for PLC evidence.

Limits are explicit: PLC responses are at most 1 MiB, with 512 rows, 7,500 canonical
CBOR bytes per operation and 64-element containers; web responses are at most
32 KiB with 64-element arrays. Retained JSON depth is 32. Exhausting a local
resource policy yields `content_unavailable`, rather than claiming that an
otherwise authentic account or history is invalid. Malformed evidence remains
an input error; genuine unexpected runtime or integrity faults are preserved.

The separate host `IdentityFetch` uses maintained
`@atproto-labs/fetch-node@0.4.0`. Each sequential observation attempt has a
30-second deadline, 64 requests and a cumulative 32 MiB body budget. Failed
oversized bodies still consume that budget. It refuses HTTP, data URLs, private
addresses and redirects; sends no authorization or cookie credentials; and uses
`cache: no-store`. There is no development/private-network bypass. This module
provides bounded GET operations; method resolution and same-root proof completion
are still integration work.

## Trust that verification does not supply

PLC evidence blocks an app PDS from inventing a signed history for an arbitrary
principal. Authenticity is separate from currentness: a dishonest directory or
observer can withhold a later operation, supply a genuine truncated history, or
tell a stale branch story using unsigned directory metadata and timestamps.
Before/after equality does not prove uninterrupted currentness. No 72-hour wait
is introduced, and this verifier does not claim to eliminate PLC recovery races.

Web evidence has no equivalent authenticated operation history. Under the
default app-publication observation policy, the app PDS can fabricate retained
web DID bytes, a matching root and grant for any claimed web principal, even
without controlling that principal's host. Product assurance display and archive
export must disclose that limitation. The foundations return the assurance class;
those product surfaces remain unimplemented. No WebVH support is claimed.

An account PDS also holds the participant repository signing key and can publish
or replace native device grants. That authenticates account-PDS publication, not
separate user interaction. It cannot forge an existing uncompromised device
signature. I2 must pin admitted grant CIDs and apply explicit epochs, revokes,
entitlements and recovery rules.

## Installed graph and support cost

The graph grew from 135 to 147 runtime paths. All original path versions and all
original package file hashes equal reviewed B0 `fd7dab4b`; the addition has 12
paths. Direct `@atproto/did@0.3.0` reuses a package already in that closure.
The new direct packages are PLC 1.0.2, valibot 1.5.0, jsonc-parser 3.3.1 and
fetch-node 0.4.0. The older fetch/pipe dependencies remain unchanged where other
packages require them. The semantic profile remains `atseq-app-v2`; existing
profile conformance passed without a profile identity change.

The exact optional valibot TypeScript peer is excluded as reviewed non-executed
typechecking metadata. Other peer rules are unchanged. A maintained AST check
refuses direct runtime edges to that peer and computed imports before applying
the exception; ordinary pinned file checks still cover package mutation. The
fresh packed consumer installs no standalone TypeScript package. Existing
vendored compiler code elsewhere in the baseline is not being reclassified.

[`scripts/regenerate-dependencies.mjs`](../scripts/regenerate-dependencies.mjs)
records actual installed metadata, paths, imports and file hashes. It does not
approve a graph. The recorded generation command was
`node --import tsx scripts/regenerate-dependencies.mjs`; `bundleDependencies: true`
was preserved in the package and root lock metadata.

The new installed files total 7,248,757 bytes, including declarations, documents
and tooling. Of that, the seven new transport paths occupy 5,085,463 bytes. The
adapter installs three Undici aliases: 6.29.0, 7.30.0 and 8.11.2. These are actual
installed costs, not a runtime speed or browser payload measurement. The final
package is 13,309,401 bytes compressed and 70,040,446 bytes unpacked, with 12,157
entries. No baseline packed-size comparison was run.

The identity corpus browser bundle measured 569,863 bytes. It contains test
fixture constructors and the shared corpus; it is not a standalone library cost
or an incremental application-shell delta. Its build contained no host transport
runtime module. Dependency metadata remains available to portable integrity
checks. Package and bundle hashes are in the manifest.

Minimum Node support is now 22.19; package engines, CI and current operational
documentation say so. Historical 22.13 captures retain their historical labels.
This deliberately adopts the maintained transport's supported floor; prior
patch compatibility was not a goal. Windows and successful real-provider
observations were not tested here.

## Verification and recommendations

| Gate | Actual result |
| --- | --- |
| Complete suite, Node 26.10.0 | Serial command in manifest: 380/380; no skipped or cancelled tests; 206,762.785 ms. |
| Identity corpus | Same 57 cases in Node, Chromium 153.0.8010.12 and fresh compiled package; Chromium also verified two public Node-signed PLC fixtures. |
| Compiled package conformance | 211/211 cases, including all 57 retained-identity cases; existing APIs, CLI, host and profile checks passed. |
| Node 22.19.0 and 24.21.0 | Focused identity, network and peer gates: 5/5 tests on each line. |
| Production network guard, all three Node lines | Real maintained dispatcher; six private/literal targets refused; two DNS answers simulated public then private at connection time; zero loopback TCP connections. |
| Packed internal host smoke, Node 26.10.0 | Production compiled `IdentityFetch` refused six private targets; installed v8 Agent resolved from the packed dependency tree. |
| Request/body policy | Separate mock-response case checked credentials, cache, redirect, 64-request and failed-body cumulative limits. |
| Build and checks | Package build passed; `npm run check` passed types, formatting, layers and installed provenance. |
| N2 notices | Pre-graph default order equalled explicit English order; new graph generated 127 notices and `--check` passed. N0 check-only behavior remains intact. |

Network logs distinguish Node's bundled global-fetch version from the selected
installed dispatcher. Node 22.19 used builtin 6.21.2 with installed 6.29.0; Node
24.21 used builtin 7.29.1 with installed 7.30.0; Node 26.10 used builtin 8.10.2
with installed 8.11.2. Resolution paths and production dispatcher calls are
retained. Mock responses are not positive TLS or provider compatibility evidence.

The initial default parallel `npm test` stopped progressing in browser session
tests and was interrupted after roughly eight minutes. Its log is retained as
an unsuccessful run; no global concurrency workaround was added. The isolated
browser-session suite subsequently passed 14/14, and the complete serial suite
passed. This does not establish a current-main defect or a default parallel pass.

Recommend independent review of these bounded foundations and their actual
graph/provenance delta now. Keep the remaining I1 task open: final policy-CID
dispatch and exports, native proof/record linkage, method observer orchestration,
exact descriptor construction and retention, ordered floor/consumption rules,
assurance display/export and real-provider trials still require the reviewed
NW0/I2/N1 integration. No observation or authority wire contract is frozen by
this delivery. The separate N2 comparator follow-up can close after this exact
candidate is independently approved and landed.
