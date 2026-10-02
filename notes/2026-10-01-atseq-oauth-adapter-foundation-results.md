# OAuth adapter foundation results

Date: 2026-10-01

The internal Node and browser adapters use the official ATproto OAuth clients
0.5.8. They preserve the approved identity foundation, keep OAuth executable
modules out of ordinary application startup, and enforce callback, account,
scope and HTTP boundaries around the maintained clients. The retained full
serial suite passed 395 tests. Native account publication, deployed consent
shells, real-provider trials and startup/session latency measurements remain
implementation follow-ups under A1.

## Tracking and source

Parent request: `13d42e4adec8f8d9570e48306846dad046a0036f`.
Parent promise: `676577467fa4e57c61e0191cf1864da781d0f4b3`.
The official-family decision is `f3c65906b134740f3e4e17ce7d5fb2c48b9955bf`;
its C1 metadata clarification is
`862135c760e0d566cfb978a0a62ab7f31e77eb33`. Both were ratified before this
implementation. These are workroom event hashes in this repository.

Recovered OAuth source is
`5a204a2c7ed3188e9e8197c4862da182dd4c1f6c`, based on approved identity main
`3a40d2c5e230cd7698f9cd4b9e8e9729054be33e`. The integrated validation source
is `035e405ec8e807626d050469973b2fa1b32c3d47`, which includes independently
approved native wire main `fc8e20936c849d20e8e28be688afa08b29ce02ed`.
All 19 recovered OAuth source, graph and test files remain byte-identical after
that integration. The source-runner, production build and public exports are
unchanged.

The maintained clients and transport come from the
[ATproto repository](https://github.com/bluesky-social/atproto). The adapters
reuse their PAR, PKCE, DPoP, nonce handling and refresh machinery. This slice
adds internal loaders and adapters; it does not add an enrolment command or
connect credentials to native publication.

## Implemented boundaries

- Each transaction retains its expected account DID and exact requested scopes.
  Completion requires one `iss`, `state` and `code`, checks expiry, and consumes
  the transaction under a lock before calling the library. Returned subject,
  scopes and fresh authorization-server/PDS binding are checked before returning
  a session handle. Mismatches trigger credential cleanup.
- A resource request checks the session again, including after a maintained
  resource-401 refresh, before another credential-bearing dispatch. Scope
  escalation in that refresh is refused before the resource retry.
- Node uses private in-memory stores and the SDK's shared `requestLocalLock`.
  Restart discards this slice's credentials and pending state. Persistent Node
  credential files, including their ownership and mode requirements, remain a
  separate delivery boundary.
- Browser custody requires its configured secure origin and Web Locks. One
  client ID is pinned on that origin; application display and publisher origins
  must differ from it. The maintained browser retains private non-extractable
  CryptoKeys in its IndexedDB. Origin compromise can still use keys and tokens;
  non-extractability does not establish protection against that compromise.
- All maintained HTTP edges use the adapter's fetch, including discovery, PAR,
  token, refresh, revoke, nonce retries and resource requests. The supported
  caller identity hook receives that same fetch and deadline; Node's default
  handle resolver is disabled. URL checks require HTTPS and refuse IP literals,
  localhost, user information and fragments. Requests forbid redirects and
  cookies and omit ambient credentials.
- Each operation has a shared 30-second deadline, 64-request limit and 32 MiB
  byte budget, with 64 KiB request and 1 MiB response limits. Pending transactions
  are capped at 10 and expire after 10 minutes. Returned handles serialize as
  empty objects; underlying client errors are replaced with fixed messages.

Browser URL and request guards do not pin DNS. Node uses the maintained guarded
dispatcher for actual DNS/connect policy. The synthetic OAuth tests verify that
dispatcher is supplied; they do not make a new real-network DNS-rebinding claim.

## Dependency and import results

The installed runtime graph has 194 paths: 147 prior paths preserved exactly,
plus 47 OAuth paths. Exact installed file identities and prior approved package
entries match the identity foundation. Direct `common-web@0.5.10` and
`syntax@0.7.5` pins preserve that foundation; newer incompatible requirements
have compatible nested copies. Notices grow from 127 to 146, adding 19 MIT
package/version notices and removing none. The dependency generator and its
ordinary approval process are unchanged.

Actual esbuild metafiles cover browser main, browser worker, portable verifier,
Node CLI main and Node host main. Their dependency executable input sets are
equal before and after the OAuth graph addition. Every input under the 47 new
paths is an exact `package.json`. These inert manifests are allowed by the
ratified C1 clarification. Lazy loaders verify the installed graph before
loading adapter code, and the SDK imports retain a second dynamic boundary.

The extra provenance has a visible cost. These are complete minified bundle
deltas against the 147-path provenance overlay, in bytes:

| Entry | Raw delta | Gzip delta |
| --- | ---: | ---: |
| Browser main | 90,436 | 8,329 |
| Browser worker | 102,686 | 9,079 |
| Portable verifier | 90,248 | 9,457 |
| Node CLI main | 345,573 | 95,063 |
| Node host main | 333,325 | 94,487 |

The added manifests account for 54,920 browser bytes or 54,967 Node bytes in
metafile `bytesInOutput`. A separate standalone capture of those same manifests
is 55,001 raw bytes and 5,217 gzip bytes. Gzip contributions are not additive;
that separate capture is not an attribution of the full bundle's gzip delta.
The remaining delta includes ordinary provenance and integrity metadata.
These measurements describe bundle size and reachability, not startup latency.
The lazy entry/chunk inventory retains exact initial and deferred graphs in
`lazy-chunks.json`; existing integrity code can dominate those standalone entry
bundles. No elapsed-time benefit or new dependency exception is inferred.

## Validation and retained failures

Before native wire integration, Node 26.10 ran the complete suite serially:
395 passed, zero failed. This includes 28 synthetic maintained-client Node
scenarios, actual Chromium 153.0.8010.12 custody/reload/refresh operations,
cross-document callback consumption, origin and persistence refusals, C1
metafile checks and the fresh packed Node consumer. Its packed conformance
corpus has 219 passing cases. The package test also mutates an installed OAuth
dependency and instruments the internal adapter, proving integrity refusal
occurs before lazy adapter execution.

At the integrated source, all 28 Node scenarios passed separately on 22.19.0
and 24.21.0. Fresh production build, full `npm run check`, both bundle tests and
installed dependency-preservation checks passed. The full suite, packed
consumer and Chromium custody test were not repeated after integrating the
disjoint approved wire files; their exact earlier captures and unchanged OAuth
source hashes are retained as earlier evidence.

The scenarios cover issuer, subject, scope and authority mismatches; callback
duplicates, expiry and restart; refresh rotation and escalation; unsafe URLs,
escaped resource paths, oversized bodies and request/byte budgets; cancellation;
and failures at PAR, token, refresh, resource and revoke edges. Synthetic
endpoints check maintained PKCE/PAR fields and DPoP headers/nonce retries. They
are not an independent server-side DPoP certification or provider trial.

Earlier attempts are retained. The first broad run lacked the disposable PDS
fixture's native SQLite binding. After rebuilding that fixture, its 12 archive
tests passed. Ordinary parallel runs exposed an existing shared-build race:
the package test removes checkout `dist` while browser integrity resolves it.
The final serial run passed without a source-runner, production-build or
concurrency-policy change. The separate T1 harness task tracks that race.

## Browser SDK physical retention

Static inspection of the pinned browser SDK found an expiry-index mismatch.
`BrowserOAuthDatabase.createStore()` stores `expiresAt` as an ISO string, while
`cleanup()` uses numeric `Date.now()` as the index upper bound. IndexedDB orders
number keys before string keys, so that range does not select the ISO-string
expiry rows. Expired `get()` still deletes and refuses a state; the adapter's
own callback expiry and single-use checks remain decisive. Abandoned PAR rows
and their private CryptoKeys can remain physically after expiry.

Refresh-token sessions have a null SDK expiry and this browser adapter adds no
physical session-catalog count limit. The adapter's bounded pending count is a
logical callback bound, not a promise of bounded SDK database size or timed
credential erasure. This is a pinned-source finding, not a newly executed
cleanup experiment. The manifest records exact inspected file hashes.

Keep the maintained client and documented supported API in this foundation.
Pursue browser physical cleanup and session management through a separately
reviewed supported-store approach or an upstream SDK correction. Private SDK
database mutation would add a new custody dependency. Real deployment should
also validate live provider consent, all-network failures, retained session
cleanup and actual cold/warm entry costs before full A1 closure.

## Evidence

[The evidence manifest](../experiments/post-spike-evidence/2026-10-01/oauth-adapters/manifest.json)
pins both source commits, all 19 source-file hashes, inspected SDK hashes,
summary captures, readable final logs and every raw archive member.
The verified `raw-captures.tar.gz` retains all earlier attempts and current
bundle payloads/metafiles. Final logs and the pre-integration packed conformance
capture are also available directly in that evidence directory. Every OAuth
exchange uses synthetic accounts and credentials; provider success is false.
