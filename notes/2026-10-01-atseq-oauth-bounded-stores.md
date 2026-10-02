# Bounded browser OAuth custody

Date: 2026-10-01

Proposed decision under A1-D2. Use the official package's exported core
`OAuthClient` with small owned IndexedDB state/session stores and a WebCrypto/
Web Locks runtime. Keep the official OAuth machinery, non-extractable keys,
guarded network path and existing 194-path dependency graph. Replace the
convenience browser constructor after independent review; keep the frozen
OAuth foundation unchanged while this decision is reviewed.

The experiments also correct an earlier assessment: **the selected OAuth
session store does propagate write failures**. The older root `simple-store`
copy swallows them, but OAuth resolves its nested 0.5.1 copy. The proposal
therefore needs no extra post-commit verification hook to compensate for
swallowed writes. Transaction completion is the store's success boundary.

## Tracking and evidence basis

Request `66af6bdfd0bcd7f2f4c09c81b7b4194301df7e18`, promise
`b55b6b77c69320e160dfdfa6a9780240e88ec307`; full A1 request
`13d42e4adec8f8d9570e48306846dad046a0036f` remains open. These are workroom
event hashes in this repository.

This branch starts at approved main
`eec0c8e877b66413a6a4781f826e0fbbcfdea462`. Experiments read the exact installed
SDK files from frozen OAuth candidate
`7807cd9a3b89c6255169280fe0d75925d05948e9`. They make no production, package,
dependency, public-export or client-construction changes. The experiment source
commit and exact selected source hashes are in the evidence manifest.

The official clients and key implementation are from the
[ATproto repository](https://github.com/bluesky-social/atproto). Every interface
below is checked against the pinned public package exports, not a private file
import or an assumption about a newer release.

## Supported extension and corrected failure behavior

`BrowserOAuthClientOptions` deliberately omits custom state/session stores,
runtime and caches. Its constructor creates a private database. That database
class and `BrowserRuntimeImplementation` are not exported through its supported
package entry point. A separate session catalog and the public update/deletion
hooks cannot make its existing private writes and catalog writes atomic.
`dispose()` closes resources; it does not erase credentials. `abortRequest()`
is a no-op in the pinned core and cannot clean up abandoned local PAR state.

The browser package's public root re-exports `OAuthClient`, `StateStore`,
`SessionStore`, `RuntimeImplementation` and `WebcryptoKey`. Core options accept
the two stores and runtime alongside the existing guarded fetch and supported
identity resolver. Each store implements `get(key)`, `set(key, value)` and
`del(key)`; optional enumeration is an owned-store management operation, not an
OAuth extension. Runtime needs key generation, random bytes, digest and a lock.
A compile-only check confirms those imports and construction types.

The concrete Node and browser resolution checks select
`@atproto/oauth-client/node_modules/@atproto-labs/simple-store@0.5.1`.
Its `CachedGetter.setStored()` awaits the supplied write and propagates errors.
The root `simple-store@0.3.0` has different behavior and is not the superclass
used by this OAuth session getter. Package name alone was an insufficient
inspection basis. Both copies and their exact hashes are retained so the
correction can be independently checked.

Actual public-core experiments establish:

| Case | Observed result |
| --- | --- |
| State write refused | Authorization rejects before PAR. |
| Session write refused | Callback rejects; SDK storage and callback error paths attempt refresh-token revocation; no session row remains. |
| Refresh write refused | Refresh rejects; SDK attempts new refresh-token revocation and removes the prior local row. |
| Refresh revocation also refused | Refresh still rejects and local deletion succeeds in the experiment. |
| Successful update hook | Hook observes the committed row and reconstructed non-extractable key. |
| Hook throws after a successful callback write | Callback rejects and attempts revocation, but the committed row remains until explicit public revoke. |

The last case is a reason to avoid adding a redundant throwing update hook.
Success of owned `set()` means the IndexedDB transaction completed, not that
`put()` was merely queued. The maintained SDK then provides its existing
persistence failure path. A future dependency update must retain these tests
against the actually selected package path. Do not apply a swallowing wrapper
to the credential stores.

## Proposed local policy

These are deployment custody settings, not actor entitlement, protocol identity
or producer checkpoint policy. They do not change the meaning of native signed
records. Recommended initial defaults are:

| Setting | Proposed default and rule |
| --- | --- |
| Pending authorizations | 10 globally on the pinned custody origin/client; 10-minute expiry, preserving the adopted limit. |
| Retained accounts | 10 slots including live, reserved and retiring session rows, matching the existing Node foundation's count. Refuse a new account at capacity. |
| Local consent lifetime | 30 days from accepted explicit enrolment. Refresh never extends it. Explicit re-enrolment establishes a new lifetime. |
| Credential metadata | At most 1 MiB of UTF-8 JSON metadata per state/session row, excluding the opaque CryptoKeyPair. Validate before starting the write transaction. |
| Cleanup | On opening, before operations, and every minute while the credential shell is active. No exact deletion deadline while it is closed. |
| Remote cleanup | One best-effort attempt per retiring account in a cleanup batch, within one shared existing 30-second/64-request/32 MiB operation budget; then local deletion. No durable remote-retry queue. |

Session count and lifetime are explicitly configurable positive finite limits.
Validate counts and timestamps as safe integers and validate the metadata
budget before storage. A configuration change retires excess/expired rows under
an explicit management operation; it does not silently evict a live account.
When capacity is full, offer explicit revoke/forget before another enrolment.
The defaults and supported configuration ranges need independent review; they
are proposed product policy, not findings about provider requirements.

Count and metadata bounds cover stored logical records. CryptoKey storage is
opaque. They do not bound the browser's database file, physical memory, browser
backups or forensic remnants. Access-token expiry is separate from this local
consent deadline: a valid refresh token does not extend the local deadline.

## Owned storage and atomicity

Use one versioned database owned by the credential shell, with pending and
account stores. Use numeric `expiresAt` throughout, with numeric indexes. Keep
client ID/origin pinning in trusted custody configuration. Store only closed
owned metadata and the structured-cloned CryptoKeyPair; never serialize private
JWKs, tokens or key handles into Atseq archives, results, application data or
evidence.

Before beginning authorization, atomically reserve a pending slot and, for a
new DID, an account slot. Each DID has at most one pending enrolment. A pending
row starts with trusted expected DID, scope set, expiry and local transaction
ID. Public `StateStore.set(sdkState, value)` attaches the SDK state/key/verifier
to that reservation using the retained `appState` correlation. A unique SDK
state index implements subsequent get/delete. Cancel, expiry and failure remove
the whole pending row and release unused reservations; no private SDK scan is
needed.

Count checks, expiry pruning, reservation updates, puts and deletes belong in
the same IndexedDB transaction. A replacement of the same account does not
consume a second account slot. Refuse duplicate live reservations and writes
without the expected trusted operation context. The session store refuses a
subject different from the reserved expected DID before committing it; existing
issuer, exact scope and fresh account/AS/PDS checks still run before completion
is accepted. A count or quota refusal rejects the store promise after abort.

Pending callback get/delete is still two SDK calls. Preserve the outer secure
Web Lock across the entire callback and the adapter's single-use consume.
IndexedDB transactions enforce physical counts even if two documents attempt
different writes. The outer lock also covers cleanup and local management.
Consuming the adapter transaction marks it consumed rather than discarding the
SDK state before its own `get()`/`del()`. The current private operation retains
the trusted expected DID/scopes and account reservation after SDK state deletion;
other documents cannot reuse that context. Failure or completion removes the
remaining pending/reservation metadata atomically.

Key generation remains `WebcryptoKey.generate(algs, ..., {extractable:false})`
in the browser. Store its `cryptoKeyPair` and key ID; reconstruct with the public
`WebcryptoKey.fromKeypair()`. Check private non-extractability on writes and
reads. The maintained library handles signing and algorithm negotiation. The
runtime delegates random bytes/digest to WebCrypto and refresh locks to secure
`navigator.locks`; there is no process-local fallback. Custody and SDK lock names
must be distinct. Never reacquire the custody lock from inside its operation.

## Failure and crash recovery

Use the existing account row as a small operation journal. Before any SDK
operation that may read/use/replace a credential, atomically mark that account
with an owned operation ID and an uncertain phase. This deliberately includes
operations which may refresh implicitly or after a resource 401. Avoid trying
to predict the SDK's refresh heuristic.

Only the current private operation context may read its uncertain row. Other
operations and reopened documents cannot restore it as a live session. SDK
writes retain the marker. Clear it and mark the row live only after the SDK
operation and the existing subject/scope/issuer/authority checks succeed. New
consent deadlines are fixed at accepted explicit completion; refresh writes
preserve the old deadline. Network calls and key decoding occur outside short
IndexedDB write transactions.

| Interruption | Recovery on reopening under the custody lock |
| --- | --- |
| Reserved authorization never reaches PAR | Expire/cancel pending state and release an unused account reservation. |
| Callback consumes state, then stops | Remove abandoned pending state; retire the uncertain account/reservation. Begin a new explicit authorization. |
| Token response arrives before the session write commits | The old row/reservation remains marked uncertain. Attempt cleanup with any retained credential, then delete locally. The newly issued token may be unknown. |
| New session commits before final account/scope checks | Keep its uncertain marker; do not return/restore a handle. Cleanup the retained new credential, then delete. |
| Refresh rotates remotely before local persistence | Retire the uncertain row, including any now-obsolete token. Never retry that refresh token automatically after reopening. |
| Local deletion fails | Leave the row uncertain/retiring and counted. Refuse its use and additional capacity until storage recovery or explicit origin reset. |

These markers favour explicit re-enrolment after an interrupted operation over
guessing whether a one-use refresh succeeded. A crash during an otherwise
read-only request can also require re-enrolment; that conservative loss is an
explicit tradeoff proposed for review.

For ordinary store-write errors, use the SDK's demonstrated error cleanup.
After the operation has unwound, the adapter's failure path retires/purges its
owned row in `finally`. For startup expiry/crash cleanup, use the public server
factory/agent with the retained key and refresh token, falling back to access
token, under the shared guarded budget. Cleanup is separate from a held SDK
refresh lock; do not call `client.revoke(sub)` recursively from an update hook.
The SDK already uses its server factory directly on write failure and does not
require an added reentrant hook.

Local deletion is independent of remote success. Unknown newly issued tokens,
provider refusal and a closed browser prevent a guarantee of remote revocation.
One attempt per current batch is an operational bound, not a promise that a
power failure can durably record an attempt. There is no new credential-bearing
retry log. Disclose cleanup failure through fixed non-secret status only.

## Re-enrolment and preserved adoption constraints

Prior compatibility is not a goal. Do not decode or migrate the convenience
client's private database. For an origin previously using it, require explicit
credential-origin storage reset/re-enrolment, or a freshly provisioned custody
origin, before claiming a bounded owned store. Reset is a trusted management
action; application content and imported archives cannot trigger it. Fresh
origin storage does not erase old origin data or revoke unknown remote sessions.
Deployment must communicate that distinction and validate its chosen reset
mechanism in supported browsers.

Preserve the adopted C1–C6 conditions: lazy adapter/SDK loading and ordinary
manifest-only import graphs; a dedicated secure custody origin and one client
ID separated from publisher and app display; mandatory callback issuer and
expected subject/exact scopes/fresh authority checks; single use and secure
cross-document locking; the same guarded identity/HTTP path and shared operation
budgets; and exact preserved dependency files/notices. Public re-exports avoid
adding dependencies. The convenience package root has existing module side
effects, so implementation must rerun actual initial/lazy graph checks rather
than infer bundle results from the smaller constructor.

## Experiment results and limits

Six public-core cases passed on Node 22.19.0, 24.21.0 and 26.10.0. The same six
passed in Chromium 153.0.8010.12 with real IndexedDB write-transaction aborts and
Web Locks. Chromium additionally established the expired ISO-row/numeric-range
premise in an experiment-owned database, maintained non-extractable keypair
reload and refresh, and a second document blocked on the actual SDK account lock
until release. No private SDK database was opened.

The Node experiment uses native WebCrypto key generation plus the public keypair
reconstruction seam: JOSE's Node conditional generator produces KeyObjects,
while its browser generator produces CryptoKeys. Chromium uses the maintained
browser `WebcryptoKey.generate`. Node 26 emits a retained conversion deprecation
warning. These are public-interface experiments, not a change to the production
Node adapter or a portability claim for the convenience browser constructor.

Earlier failed harness attempts are retained: the first omitted the fixture's
request-policy flags, the next selected JOSE's Node key generator, and the third
expected the incorrectly inferred swallowed-write behavior. The first Chromium
launch was denied by the managed sandbox; the unrestricted run passed. A first
compile command required TypeScript 7's explicit `--ignoreConfig`; the corrected
public-export type check passed.

The experiments demonstrate the supported SDK seams and failure behavior. They
do not implement/test the proposed count policy, journals, crash recovery,
configuration changes, storage reset or production factory. Those need
implementation-level fault injection after review. No real provider ran, no
credential/key values appear in captured results, and full A1 remains open.

[The evidence manifest](../experiments/post-spike-evidence/2026-10-01/oauth-bounded-stores/manifest.json)
pins experiment source, original fixture, actual selected Node/browser store
resolution, SDK file identities and all public synthetic captures.
