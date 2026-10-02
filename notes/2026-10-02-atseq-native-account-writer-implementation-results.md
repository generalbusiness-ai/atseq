# Owned native account writer: implementation results

Date: 2026-10-02. Status: implementation candidate; independent exact-head code and evidence review remains required before merge.

The internal native account writer now uses an A1-owned OAuth session for standard
AT Protocol account operations. It shares the existing PDS operation builders and
response decoder. It requires a validated repository commit condition for every
write. The candidate has passed the source, emitted JavaScript, Chromium,
installed-package and reference-PDS checks recorded below.

This report belongs to AW-F2 request
`b8d9ec1eab341d9fd412d527b001917404d82d33`, promise
`3baf258ad443641e4d1323c27c8fa4721ad4030c`. It also supplies implementation
evidence for original A2-F1 request `9a0294ddd700cd5bacfb75436f32424e42e279e7`,
promise `f0b05a7f41afd119fe41c74760571f6904e999cb`. The parent owns both
workroom reports, independent review, merge and push. These results do not close
the full identity or native-publication programme.

The production and ordinary test producer is
`16f36988179a0ccacf1189eeb7b2b0e3453d6836`, based on reviewed custody commit
`5006a5c6489ce348944a85d158dfe89fd979099c`. Later additions in this packet
retain captures, test-only experiment scripts, provenance and this report.
They do not change the measured production modules. Evidence lives in
`experiments/post-spike-evidence/2026-10-02/native-account-writer-aw-f2/`.

## What is implemented

`src/protocol/oauth.ts` privately records handles returned by successful A1
`complete` and `restore`. The recorded value captures the verified account DID
and closures over the owned flow. The writer uses those closures rather than
mutable public handle methods. Public constructors, prototype lookalikes,
structured clones and copied properties cannot produce a positive writer input.
The writer itself is frozen, exposes its immutable DID and serializes as `{}`.

A1 constructor configuration and its SDK factory remain trusted, as specified by
the adopted design. The WeakMap proves the verified A1-to-writer handoff; it does
not authenticate an arbitrarily replaced trusted SDK factory. Actual positive
tests use maintained Node/browser loaders. Hostile configured SDKs are separate
negative dispatch probes. No registrar, public trust flag, SDK shape classifier,
credential owner or permission callback was added.

The writer provides `get`, one `list` page, `latestCommit`, `applyConditional`
and `upload`. It validates account/collection/key/CID shapes, a page limit of
1–100, UTF-8 cursors up to 8 KiB, returned commit shapes and upload RAW CID,
exact byte size and bounded MIME type. Conditional writes capture the serialized
batch before awaiting A1, preserve the condition across maintained refresh,
and reject a missing or malformed condition before dispatch. There is no
unconditional native write method, write reconciliation or writer-level retry.
Replies remain transport candidates; they establish neither application
permission nor an inclusion proof or receipt.

`src/transport/pds-operations.ts` owns the shared builders and decoder.
`src/host/pds.ts` re-exports the same `PdsError` constructor. Legacy transport,
15-second send deadlines, 8 MiB success decoding, error handling and list
aggregation retain their previous behavior. All 35 existing predicates pass.
Native decoding uses the adopted 1 MiB success and 64 KiB error limits and finite
provider codes. Local byte-limit refusal is `input`; actual transport/body
unavailability remains `content_unavailable`. The legacy local
`AuthenticationUnavailable` owner stays separate from a provider-supplied
string of that name, which becomes `RequestFailed` in native decoding.

## Fixed resource-body allowance

Only the private writer routes for exact POST `com.atproto.repo.applyWrites`
and `com.atproto.repo.uploadBlob` receive a 1 MiB outgoing allowance. Each route
captures an independent body copy. Dispatch must match the freshly resolved
resource URL, method, authenticated request and exact captured bytes. The guard
checks equality again on maintained SDK retries and clears the allowance in
`finally`. Different origins, paths, queries, methods and changed retry bodies
are refused by hostile dispatch probes.

Ordinary public A1 requests and nested discovery, metadata, PAR, token, refresh
and revoke requests retain the 64 KiB outgoing cap. Actual byte reads determine
limits. Content-Length and remote status 413 are not treated as byte evidence.
All HTTP requests and responses within one A1 invocation still share its
64-request, 32 MiB cumulative and 30-second network/SDK budget. Each writer
method gets its own invocation; explicit pages do not share a whole-traversal
budget. Browser lock acquisition and stalled global IndexedDB operations are
not given a new hard deadline by this change.

The maintained positives send exactly 1 MiB for both apply JSON and raw upload,
then refuse one byte over before resource transport. Captured caller mutation
does not alter sent bytes. A genuinely accepted native application fixture
selects the largest effective entry in that fixture, “activate authored denial”:
1,187 CBOR bytes and 2,304 bytes for the entry/head conditional JSON. Adding two
valid 32 KiB native content chunks produces an unchanged 90,308-byte batch.
Those two chunks are transport primitives, not a claim that they form the
selected entry's source closure. Source admission, actual PLC/repository proofs,
authority and evaluator oracles for the selected fixture are executed separately.

The earlier 33,652 / 34,622 / 78,580-byte padded preparation established framing
and HTTP transport only. It did not establish admitted native ordering. Its
attempted 64,200-byte action is refused by the actual 32,768-byte action profile
before signing; invented padding is not an accepted application source. The
failed input and raw captures are retained. The adopted 285,369-byte worst-case
transport calculation remains a conservative bound, not an attained entry size.
No near-64-KiB admitted entry is claimed by this candidate.

The 512 KiB raw upload positive is a standard upload primitive, including real
PDS storage and exact recovery. Governed native source publication still uses
`NativeFile.bytes` as a `NativeContent<ByteManifest>` CID and verified 32 KiB
`ByteChunk` records. This candidate does not replace that format with blob
references or change source identity. The parent accepted this scope refinement
before implementation review.

## First owned refusal and recovery instruction

The maintained SDK can swallow an oversized refresh request and return the
original resource 401. Independent source review approved a small private
handoff that retains the first owned refusal for a native operation. A later SDK
success, exception, revoke attempt or custody-finalization failure cannot replace
it. Subsequent authenticated resource sends are blocked. Operation cleanup
removes the handoff and allowance so later native and generic requests are not
poisoned.

The adopted base is frozen `a6bbfb38964b38036eb20f20fabc353cc5ac1b62`, review
`660fa684c4480f35ad01534dade58e2b72d2ef17`, adoption
`4cff7a51d506a368082072f079166fb586e5b5f3`. The recovery refinement is frozen
`7b54ad86c5f56c1a5237ba71f2168e1ce10e4f98`, review
`d9276b5df8fd91cb9b73d372cb0cdd156e486ae0`, adoption
`6a2187cb8aa5b0790a16679b2f4a58406c212b49`. Both frozen packets remain unchanged.

For actual counted outgoing default-cap overflow in the existing maintained
credential-request shape during the private native marker, the supported
byte-stable error remains `input` / `invalid_input` with this fixed text:

> OAuth credential request exceeds the byte limit; reauthorization is required

It exposes no token, provider text or request body. No public code or recovery
API was added. A cumulative-pool refusal dominates a simultaneous per-body
overflow. Incoming response overflow, other shapes and ordinary A1 requests do
not receive this instruction.

The native marker begins after fresh A1 authority verification. An earlier
`#verify('auto')` refresh remains governed by the existing generic A1 sanitizer;
its explicit regression returns the original generic `input` condition. The
instruction does not claim to cover that earlier phase.

Node and Chromium actually count the encoded refresh request at 65,656 bytes.
The Node raw refresh token is 21,864 bytes; the Chromium stored metadata is
22,358 bytes. Encoding `+` characters expands the browser request beyond its
64 KiB request cap while staying within the existing storage cap. All five
writer methods retain the exact instruction, send no oversized refresh, and
perform no automatic retry. The browser live row remains live without an
invented dispatch witness. Page reload and a separate actual persistent-context
close/reopen both restore that row and reproduce the instruction. New
authorization with a bounded credential succeeds; an AS can issue another
oversized credential, which is again refused. A genuinely dispatched bounded
token failure still causes existing CF-1 retirement.

## Executed checks and attribution

| Gate at producer 16f36988 | Node 22.19 | Node 24 | Node 26.10 |
| --- | ---: | ---: | ---: |
| Writer + A1/custody source checks | 105 pass | 105 pass | 105 pass |
| Actual build and normal check | pass | pass | pass |
| Same checks using emitted production | 105 pass | 105 pass | 105 pass |
| Dedicated emitted Chromium writer | 1 pass | 1 pass | 1 pass |
| Legacy source / emitted PDS predicates | 35 / 35 pass | 35 / 35 pass | 35 / 35 pass |
| Actual reference-PDS source / emitted cases | 6 / 6 pass | 6 / 6 pass | 6 / 6 pass |
| Existing fresh-package conformance | 1 pass | 1 pass | 1 pass |
| Installed-package native writer checks | 43 pass | 43 pass | 43 pass |

No gate in this table failed, cancelled or skipped. Final JSON pins identify
each actual selected runtime, production build, test-only wrapper compiler and
executable outputs before execution. Production builds use TypeScript 7.0.2;
test wrappers use ts-morph's embedded TypeScript 5.9.2. The emitted Node gates
use plain Node children and actual `dist/src` production imports. Ancillary
existing A1 browser-integrity harness conditionals remain labelled in the
compiled pins; the dedicated writer Chromium bundle uses emitted production
without the source condition. Its actual executable bundle bytes and hashes
are captured before Chromium receives them.

The supplementary emitted checks use the final common Node26-built outputs on
all three runtimes, explicitly recorded separately from the original per-runtime
build matrix. They cover exact valid 1 MiB record responses, one byte over,
malformed commit/result/page shapes, an over-cap two-record page with one send
followed by caller-selected limit 1, and an actually oversized incoming maintained
token response without the outgoing-credential recovery tag. They are not
native application-record admission tests.

Chromium is 153.0.8010.12. Maintained clients are the approved Node/browser 0.5.8
family with shared OAuth client 0.8.8. The physical 194-package runtime closure
and integrity pins pass normal checks and actual packed-loader operations.
There are no dependency, profile, package-export or public-API changes.

The reference PDS is pinned `@atproto/pds` 0.5.31, with actual SQLite storage,
get/latest/upload/exact bytes, conditional apply, stale-condition refusal,
explicit 100 + 2 + empty cursor pages, and one accepted write whose reply is
deliberately lost. The writer sends that lost-reply operation once and leaves
reconciliation to the publisher. These tests use a synthetic AS and a test-only
loopback Bearer bridge. They do not establish public-provider or official-PDS
DPoP acceptance. External providers remain unexecuted.

The official PDS transactor chooses `fileTypeResult?.mime || fallbackMime`.
Its actual 68-byte PNG upload requested `application/octet-stream` and returned
`image/png`. Producer 7ec055bb incorrectly required MIME echo equality and
refused that successful reply. Both original failure observations are retained.
Producer 16f36988 accepts a bounded valid PDS-selected type while preserving
input validation, RAW CID and exact size. Actual PDS record/blob association
and 68-byte recovery pass on all three runtimes.

## Retained failures and remaining work

Preparation preserves wrong SQLite ABI failures, unref'ed synthetic deadline
cancellations, compiler-harness child/path mistakes, rejected padded source
attempts, the swallowed-refresh observation and the PNG metadata refusal.
The first packed-writer experiment also incorrectly expected unpublished build
scripts inside the package; its exact script and failure remain. The corrected
probe verifies every root producer input, every published source and every
emitted installed output before native execution. These failures are attributed
to their original producers and are not relabelled as final implementation
results. Some early preparation outputs lack contemporaneous executable hashes;
final captures have explicit pre-execution pins.

The vector coverage packet maps the 43 original design, 29 resource-policy,
25 refusal-handoff and 20 recovery-refinement rows. Original 64 KiB native
apply/upload expectations are explicitly superseded by the adopted fixed 1 MiB
policy. The near-cap acceptance row is explicitly refined as described above.
Publisher preflight before signing/enqueueing remains its separately tracked
owner's obligation; no publisher implementation is supplied here.

Use the shared writer for later native publication, with publisher-owned
preflight, lost-response reconciliation and an explicit total budget for any
page collector. Keep standard blob upload separate from the existing native
manifest/chunk source path. Permission proof, public inclusion proof,
provisioning, migration, recovery, native host/publisher closure and full A1/A2
completion remain outside this candidate. Independent atseq-reviewer exact-head
review and governed merge/push are still required.
