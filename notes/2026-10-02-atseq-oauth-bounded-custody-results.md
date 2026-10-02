# Bounded browser OAuth custody: implementation results

Date: 2026-10-02

A1-F3 implements the accepted browser custody boundary. Atseq now owns the
credential database and journals each credential operation before the maintained
OAuth client can use a credential. An interrupted operation requires explicit
re-enrolment rather than an automatic retry of a possibly consumed refresh token.
The candidate awaits independent review. Full A1 remains open.

Request `e19379e8dd8205d13e43708f9073a58cbc31bf24`, promise
`c87cdc6d5fc3bd89876799ccd497fc9977c58b69`. These are workroom event hashes.
The implementation follows A1-D2 adoption
`80111ff33975762e4f6ec9152342d176f2c01427` and assessment
`fb88a94ccb0379fcdbd0d94009ca8b66e17936f7`. That adoption supersedes the original
note's proposed configuration and 1 MiB metadata defaults: the limits below are
fixed. There is no configuration flow.

## What changed

The browser adapter constructs the public `OAuthClient` exported by the official
[`@atproto/oauth-client-browser` package](https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-browser).
It supplies owned state/session stores and a small WebCrypto/Web Locks runtime.
The SDK still performs PKCE, PAR, DPoP, issuer discovery, token exchange and
refresh. No private SDK database, signer, runtime or authentication manager is
imported, patched or migrated. The public `WebcryptoKey.fromKeypair()` seam
reconstructs structured-cloned non-extractable private keys after reload.

The SDK imports occur after the existing dependency check. Opening, ordinary
operations and active-document housekeeping use the same custody lock and the
existing guarded 30-second, 64-request, 32 MiB operation budget. Proof/identity
lookups retain the caller's maintained resolver and guarded fetch. SDK account
locks use a different name prefix. There is no process-local lock fallback.

| Local rule | Implemented boundary |
| --- | --- |
| Pending authorizations | At most 10; expire after 10 minutes; one pending enrolment per DID. |
| Retained accounts | At most 10 slots, counting reserved, live, uncertain and retiring rows. Replacement of the same DID uses its existing slot. |
| Consent lifetime | 30 days from accepted explicit completion. Refresh and resource requests never extend it. |
| Credential metadata | At most 65,536 UTF-8 JSON bytes per complete pending/account row, including its journal. Only the opaque CryptoKeyPair is excluded. |
| Persistence | One owned version-1 IndexedDB database, numeric expiry indexes and a unique SDK-state index. A store write succeeds only when its transaction completes. |
| Cleanup | On opening, before operations, and every minute while the shell document is active. A background failure emits a fixed, non-secret `atseq-oauth-custody-unavailable` event. |

Counts, reservation changes, single-use marks and session writes are atomic
IndexedDB transactions. The outer Web Lock spans the entire callback. Consuming
an Atseq transaction marks it consumed; it does not remove the SDK state before
the SDK's own get/delete calls. The current private operation retains the
expected DID, pending reservation and operation identifier. A session write
for another subject is refused before allocation or commitment.

The A1-F2 callback fix remains: the SDK's callback nonce selects its retained
`appState`, which selects the owned Atseq transaction. Unknown, malformed and
duplicate callbacks leave other pending transactions usable. The revised browser
regression uses two distinct synthetic DIDs because concurrent pending enrolments
for one DID are now deliberately refused.

## Credential operations and recovery

Before restore, info, refresh, revoke or a resource request, Atseq commits an
uncertain operation marker. This includes implicit refresh and refresh after a
resource 401. Only the current private operation can read its marked account;
SDK writes preserve that marker and the consent deadline. Completion clears the
marker only after the existing expected-subject, exact-scope, callback-issuer
and fresh account/AS/PDS checks succeed. A failed final live-marker transaction
returns no accepted handle and leaves the committed credential uncertain.

Reopening cannot restore an uncertain or retiring row. Cleanup makes one
best-effort public server-agent revocation attempt per retained account in the
current batch, using a retained refresh token or otherwise its access token.
It runs outside SDK refresh locks. All attempts share the existing operation
budget. Local deletion is independent of remote success; there is no durable
remote retry queue and no automatic one-use refresh-token retry.

The actually selected nested `simple-store@0.5.1` propagates failed writes.
The maintained SDK's demonstrated callback/refresh write-failure paths attempt
new-token revocation. The owned store does not add a throwing update hook or a
reentrant `client.revoke()` call under an SDK refresh lock.

If local deletion aborts, the row stays uncertain/retiring, remains counted and
cannot be used. Later operations refuse until storage repair permits cleanup or
a trusted explicit reset succeeds. Failed authorization before credential use
removes its pending reservation without retiring an existing live account.

Reset is an internal trusted credential-shell management operation. It checks
the dedicated secure origin, client pin and Web Lock, deletes the owned database
and the former convenience-client database without decoding it, then requires
fresh adapter construction and explicit enrolment. Application records and
archives do not invoke it. An existing convenience-client database is refused
until that trusted reset or deployment on a freshly provisioned custody origin.
No live user origin was reset during this work.

## Observed results

All final captures use runtime/test producer
`214635a9abc38d14428422679b8613fb6c990a10`, based on approved main
`93295649c992180c98bbf0bf75cd8f7d58a16df2`. That baseline includes the approved
A1-F2 successor and the independent PDS listener fix. Builds and tests ran in the
isolated worktree; root user package/Wrangler edits were not changed.

| Check | Actual result |
| --- | --- |
| Build, complete check, notices | Passed. |
| Node 22.19.0 focused OAuth/browser/integrity tests | 21/21 passed, including the unchanged 35-case maintained Node OAuth corpus. |
| Node 24.21.0 same focused tests | 21/21 passed, including the same 35-case corpus. |
| Node 26.10.0 ordinary parallel suite | 477/477 passed; the separate 20,000-entry boundary was excluded. |
| Fresh packed native consumer | 219 actual compiled cases passed within the ordinary suite; checkout dist and integrity adapter remained intact. |
| Chromium 153.0.8010.12 owned custody | 14/14 cases passed from source and from actual built browser JavaScript. |
| Dependency preservation | All 194 runtime package records preserved; the prior 147 records and the previously approved 47 OAuth additions remain exact. No new packages. |
| Physical dependency files | 14,234 approved runtime files hash-checked. |
| Build provenance | 143 source pins and 460 compiled output pins hash-checked. |
| Package/profile/export preservation | 15 baseline files hash-checked unchanged, including six package/provenance files, seven public barrels, the profile registry and the Node adapter. |

The Chromium cases use real IndexedDB transactions, real non-extractable
CryptoKeyPair structured cloning, real Web Locks and actual document closure.
The authorization server/PDS responses are public synthetic fixtures, not a real
provider. No live account, credential or private key appears in the evidence.

The 14 custody cases cover:

- Physical pending/account caps, one pending enrolment per DID, numeric expiry,
  expired-consent refusal and refresh preserving the fixed consent deadline.
- Actual callback and refresh session-write transaction aborts, propagated SDK
  failures, new-token revocation and local purge.
- Document closure during a logical read, after callback session commitment but
  before authority checks, and after a refresh response is issued but before its
  local commitment. Reopening makes no automatic refresh attempt.
- Actual cross-document custody serialization and separate SDK/custody locks,
  with non-extractable key reload. During refresh, `navigator.locks.query()`
  observes both held lock prefixes.
- A real Chromium quota override causing an owned write to abort; no partial
  slot survives, and ordinary enrolment succeeds after quota restoration.
- Local deletion transaction aborts retaining counted, unusable rows; storage
  repair and trusted reset permitting fresh enrolment.
- Remote revocation refusal with independent local deletion, and refusal of a
  former SDK database until trusted reset without private database migration.
- Exact 65,536-byte journal-inclusive metadata acceptance and one-byte-over
  refusal, excluding only the opaque keypair.
- Final live-marker transaction abort withholding the handle; journal-write
  abort preventing any credential dispatch; foreign-subject refusal before
  allocation; and a resource 401 refresh preserving the journal and checking
  exact scopes before a second credential-bearing resource dispatch.

Actual ordinary/lazy graph tests also passed. Ordinary browser, worker, portable
verifier, CLI-start and host-start graphs add only approved OAuth package
manifests. Maintained OAuth executable modules remain behind the internal lazy
adapter path. The evidence includes actual initial/lazy graph captures and the
packed consumer's source/output verification, rather than inferring those facts
from the constructor change.

## Earlier attempts and limits

The raw captures retain initial type/fixture preparation failures, preliminary
passes and failed harness assumptions. The first transaction-abort test hit the
pre-touch marker instead of the later SDK refresh write; the first callback
crash pause hit the SDK's identity check before its session commitment. Those
were corrected to exercise the intended real boundaries. A remote-refusal test
incorrectly expected the maintained revocation agent to reject an HTTP 400;
its local purge and one actual dispatch are now checked directly.

The first compiled harness retained `.ts` extensions when selecting emitted
`.js` files. A first replacement command left that harness unchanged, so its
repeated failure is retained too. Moving SDK imports behind the dependency check
then exposed a reset test opening the owned database before its stores had been
initialized; required opening cleanup now initializes and checks custody before
returning the adapter. Earlier uncommitted drafts do not have an exact frozen
source snapshot; their raw failure logs are retained without inventing one.
Only the final producer and final gates support the completed implementation
claims. A preliminary 476-case ordinary run belongs to the earlier producer;
the final 477-case run covers the revised opening path and the additional
subject/resource-401 case.

A crash during a logically read-only request can conservatively lose local
consent. An unknown newly issued token, provider refusal or closed browser
prevents a remote-revocation guarantee. There is no exact cleanup deadline while
the shell is closed. Logical row/metadata limits do not bound browser database
files, memory, browser backups or forensic remnants. Reset on a new or existing
origin cannot prove deletion of unknown old-origin credentials or remote
sessions. Trusted reset/re-enrolment is required; there is no private SDK
migration or trust in caller-supplied row status.

This work adds browser custody only. It does not add production Node persistence,
real provider enrolment, CLI/browser deployment, native account publishing,
provisioning or independent recovery. These remain full-A1/A2/native programme
gates. The existing browser-visible URL policy does not prove provider CORS,
DNS/connect enforcement or deployment success.

[The evidence manifest](../experiments/post-spike-evidence/2026-10-02/oauth-bounded-custody/manifest.json)
pins the final source, selected public SDK files and nested store resolution,
unchanged baseline files, build output, actual raw captures and earlier attempts.
