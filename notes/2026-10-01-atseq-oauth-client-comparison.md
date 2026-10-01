# OAuth client comparison

Date: 2026-10-01. Source and installation measurements for A1 request `13d42e4adec8f8d9570e48306846dad046a0036f`, promise `676577467fa4e57c61e0191cf1864da781d0f4b3`, under ratified decision `01253121bfaaf66b40df849e8f89d9dffde2fd6b`.

## Recommendation for independent decision review

Keep Atcute as the preferred reuse choice where its supported interfaces meet the contract. For a browser enrolment shell that must pass every OAuth HTTP edge through a caller's transport guard, the inspected Atcute browser release has a concrete interface gap. Its custom identity resolver does not cover metadata, PAR, token, refresh, revocation or resource fetches. Supplying a `fetch` property does not work. The official browser client has that supported interface, and actual Chromium discovery reached it.

The narrow proposed choice for that requirement is Atcute Node 2.0.1 plus official browser 0.5.8, with separate platform adapters and an explicit browser origin/client custody boundary. Both official clients are a reasonable simpler family if maintaining two adapter contracts costs more than the measured standalone Node import difference. The mixed choice does not save total installed bytes: it adds 22,872 bytes over both official clients in these installs. Its selected Node bundle is 48,380 rather than 1,754,142 bytes. Those are standalone bundles, not an implemented host footprint or measured startup advantage.

Both Atcute clients remain the smallest measured choice if a separately reviewed browser contract can use ordinary ambient browser transport. No supported general browser transport seam was found in 5.1.0. A global `fetch` patch, a fork, or a privileged proxy is not proposed here. Choosing ambient browser transport would change the required guard contract and needs independent review first.

The official browser convenience client also has a limitation: different client IDs on one origin share its fixed IndexedDB and synchronization names. Do not infer publisher/runtime credential isolation from different metadata URLs. For the proposed narrow choice, use a dedicated origin and one OAuth client ID for the runtime shell, with publisher credentials in a separate custody boundary. If reusable same-origin multi-client storage is required, compare a maintained lower-level official `OAuthClient` plus caller stores/runtime against other supported approaches in a new reviewed proposal. The internal database constructor's name option is not a public `BrowserOAuthClient` option.

This note does not select or implement a production family. The reviewer should ratify the transport requirement, custody boundary and resulting client choice before packaging work starts.

## Basis and method

The worktree source base is main `4b6ebab532d0ae1de5adbbe3326d70e0a80f0136`. Dependency measurements use the projected, frozen I1 runtime foundation `fb5acd9ac3876de93917348e3ac12e080a885ef0`, subsequently included unchanged in I1 candidate `412b0c9b`. Its copied manifest, shrinkwrap and dependency/file approvals are retained in the [evidence directory](../experiments/post-spike-evidence/2026-10-01/oauth-closure/). Large raw captures are retained losslessly in `raw-captures.tar.gz` in that directory; raw filenames below refer to its members. `capture-manifest.json` lists exact file hashes, and `archive-info.json` records the archive hash and verified member count. The harness README explains extraction. No production dependency file, descriptor, source module or approval was changed.

That foundation has 147 installed runtime paths and 62,527,035 actual unpacked bytes. It includes the I1 additions and M0 graph. The named, optional, non-executed Valibot 1.5.0 TypeScript peer is the only excluded graph edge. All direct dependencies, required edges, installed optional edges and installed peer edges are followed. Package files, maps, documentation and declarations count toward bytes; each nested package is counted separately. Exact file hashes, graph edges and lock identities are in `graphs.json`. This is an installed closure measurement, not an estimate from registry unpacked sizes.

Each candidate begins with `npm ci --omit=dev --ignore-scripts --no-audit --no-fund` against the foundation. Candidate installs use the same flags and exact direct OAuth pins. The two preserved variants additionally promote the already installed `@atproto/common-web@0.5.10` and `@atproto/syntax@0.7.5` to exact direct pins in disposable manifests. New parents receive compatible newer nested versions. No override places an old version outside a parent's range. This demonstrates that baseline replacement is avoidable; the extra direct promotions and nested approvals still need review during implementation.

Current version metadata and 14 exact published source archives are retained. Each archive's SHA-512 SRI matches the actual installed lock, and its SHA-256 is recorded. Archives include the original sources, declarations and licenses. Installation logs, failed setup attempts and final probe logs are retained. Initial browser discovery lacked the official required identity resolver; initial storage observation ran before asynchronous IndexedDB open completed, followed by a misplaced diagnostic in its harness; an initial final Node rerun omitted its required output argument. Those setup failures are retained and classified, then corrected public-constructor probes passed. They are not provider failures. `experiments/oauth-closure/` contains the measurement scripts. The production fixture and root dependency graph are untouched.

## Installed closure results

| Candidate | Total runtime paths | Added paths | Added unpacked bytes | Changed foundation paths |
| --- | ---: | ---: | ---: | --- |
| Atcute Node 2.0.1 + browser 5.1.0 | 157 | 10 | 731,902 | None |
| Official Node + browser 0.5.8 | 192 | 45 | 6,515,599 | common-web and syntax |
| Atcute Node + official browser | 191 | 44 | 6,538,471 | common-web and syntax |
| Official pair, foundation preserved | 194 | 47 | 6,823,068 | None |
| Mixed pair, foundation preserved | 193 | 46 | 6,845,940 | None |

No candidate removes a foundation path. Both preserved variants keep every old path, version and file hash unchanged. Standard npm installation updates `common-web` 0.5.10 to 0.5.13 and `syntax` 0.7.5 to 0.7.6. These are actual resolution changes, not a claim that OAuth requires changing the root copies.

Atcute reuses the foundation's identity, lexicon, Valibot and fetch utilities. Its ten additions include the two clients, identity resolver, OAuth crypto/types/keyset, Atcute client and three nested nanoid copies. The official additions include shared OAuth core, JWK/JOSE/XRPC, newer DID/resolver/store versions, and multiple nested copies where existing foundation ranges differ. `core-js@3.50.0` is already in the foundation: the official browser entry adds active Symbol disposal polyfill imports, not a new installed core-js path.

The retained graph has each actual dependency, peer, optional and root import edge. These are installed-path counts, not counts of unique package names. A future package can only omit optional files/exports or restructure the shipped closure under a separately reviewed provenance rule; this note does neither.

## Import and browser bundle results

The script bundles the exact installed entries using esbuild 0.28.2, ESM, ES2022, minification, no source map and gzip level 9. It measures all public exports and a selected enrolment entry. The latter retains `NodeOAuthClient` and `requestLocalLock`, or Atcute `OAuthClient` and `MemoryStore`; browser entries retain the official `BrowserOAuthClient`, or Atcute configure/begin/finalize/session/delete/user-agent APIs. Full entry source and metafiles are captured, so the selection is reviewable.

| Client entry | All exports bytes / gzip | Selected API bytes / gzip | Parsed inputs / contributing files, selected |
| --- | ---: | ---: | ---: |
| Official Node | 1,767,579 / 545,760 | 1,754,142 / 541,569 | 713 / 603 |
| Atcute Node | 51,233 / 15,919 | 48,380 / 14,903 | 111 / 61 |
| Official browser | 254,729 / 69,390 | 242,104 / 64,096 | 384 / 279 |
| Atcute browser | 18,789 / 7,193 | 18,613 / 7,140 | 53 / 30 |

Parsed inputs include modules later removed by tree shaking. Contributing files have a positive esbuild `bytesInOutput`; neither number proves that every branch executes. External Node builtins and dynamic import information remain in metafiles. Mixed and preserved official browser bundles have the same exact output SHA-256 as the ordinary official browser candidate. The mixed Node bundle matches the Atcute candidate.

These bundles exclude Atseq application code and its integrated imports. The foundation already ships substantial network and tooling code; standalone bundle savings need not translate to integrated shell savings. There is no timing, memory, startup or overall performance claim.

The foundation declares Node >=22.19.0. Both official clients declare >=22; the Atcute browser's nested nanoid 6 declares `^22 || ^24 || >=26`. All observed installed engine ranges permit Node 22.19.0. Actual Node 22.19.0 and 26.10.0 imported and constructed both Node clients and reached injected discovery fetches. This tests the bounded discovery path, not all APIs or every Node release.

## Protocol and network interfaces

The [ATproto OAuth specification](https://atproto.com/specs/oauth) requires a coordinated protocol, including PAR, PKCE, DPoP and account/issuer verification. Both candidates contain these mechanisms. This comparison follows their exact release source; it is not a conformance certification or a real provider compatibility result. The official packages come from [bluesky-social/atproto](https://github.com/bluesky-social/atproto); Atcute is maintained in [mary-ext/atcute](https://github.com/mary-ext/atcute), with current browser package metadata also pointing to its Tangled repository.

| Concern | Atcute Node | Atcute browser | Official Node/browser |
| --- | --- | --- | --- |
| OAuth HTTP injection | Supported `fetch` | No general supported hook | Supported `fetch` |
| Identity lookup | Caller ActorResolver | Caller identityResolver | Caller identityResolver/handle resolver options |
| PAR, S256 PKCE, DPoP | Present | Present | Present in shared core |
| DPoP nonce retry | Origin cache; one retry | Origin cache and in-flight gate; one retry | Origin cache; one retry |
| Initial account DID pin | Stored `sub` for account-target login | Caller must pin expected DID | Caller must pin expected DID |
| Public Node client | Supported | Browser client | Supported |
| Node client authentication | Optional client keyset | Public, or optional backend client assertion | Optional Node keyset; convenience browser is public |

Atcute Node's injected fetch is threaded through protected-resource and authorization-server metadata resolvers, server factory/agent, OAuth-session resource fetch and DPoP retry. Official core does the same through its metadata resolvers, server factory/agent, session and DPoP wrapper. The official static `fetchMetadata`/browser `load` call must also receive the guarded fetch. Caller identity resolvers need their own I1-compatible network policy. The official Node constructor creates a default handle resolver if none is supplied; a custom guarded identity resolver must be used for the actual identity path rather than relying on that default DNS policy.

Atcute browser metadata discovery and both DPoP attempts call ambient fetch. `fetchClientAssertion` only obtains an optional confidential-client assertion. It is not a transport hook for the other edges. Its browser metadata validation checks issuer/resource relations and some protocol capabilities, but its authorization URL helper accepts HTTP as well as HTTPS and is less comprehensive than the shared Node/official schema validation. A guarded identity lookup does not guard the token endpoint learned later.

The sentinel experiments stopped every provider request. In Chromium 153.0.8010.12, official discovery made two injected metadata attempts and no ambient fetch. Atcute made one ambient protected-resource attempt and no call to the unsupported injected option. Both Node candidates used injected metadata attempts without ambient escape. The temporary ambient fetch sentinel existed only in each isolated experiment process/page to expose routing. It is not a production global patch proposal. Token/refresh/revocation/resource routing is source-traced here and still needs executable adapter edge tests.

Host I1 DNS/private-address protections are not browser DNS-pinning guarantees. A browser hook can enforce the reviewed URL, redirect, body, timeout and request policy available to browser JavaScript; the browser controls actual DNS and connection routing. The decision must state that boundary explicitly. Existing CORS, secure-context and origin constraints remain. No real provider, DNS pin, successful callback or repository publication was tested.

## State, refresh and credential custody

Atcute Node supplies caller-owned state/session stores. Its stored authorization state has an `expiresAt` value, but callback does not itself enforce that value: the chosen state store must expire entries. Its MemoryStore defaults to unlimited size and TTL zero; the bounded probe uses `ttl: 600000, maxSize: 10`. Official Node also requires caller state/session stores and an explicit bounded expiry policy. Its store API uses `del`; Atcute uses `delete`. Neither asynchronous Node get/delete callback sequence is an atomic consume by itself. The enrolment adapter must serialize callbacks or provide a reviewed consume transaction around callback execution, with expiry and a bounded pending count.

Atcute Node pins the DID resolved for an account-target login and checks callback `sub`. For service-target login there was no initial account DID to pin. Atcute browser and official shared core retain application state, but do not store the initial resolved account DID as an enforced expected subject. An account-target enrolment adapter must keep its own expected DID in the transaction and compare the returned subject before grant publication; an unexpected session requires cleanup, not publication. Issuer, state, scopes and account/authorization-server authority checks remain separate mandatory checks. Both Node clients and official shared core reject missing callback `iss` only when server metadata advertises support; Atcute browser requires it unconditionally. The adopted A1 adapter must require `iss` before calling a Node or official callback, regardless of that library fallback.

Atcute browser stores state and sessions as localStorage JSON, including private DPoP JWKs, PKCE verifier and tokens. State has a ten-minute TTL. Its supported `storageName` prefixes records and synchronization channels. Module-global configuration is workable for one shell/client, but simultaneous reconfiguration must not mix transactions. LocalStorage namespaces do not prevent same-origin scripts reading another namespace.

The official browser stores CryptoKeyPairs and token records in IndexedDB. The default browser WebcryptoKey generation passes no extractability override to JOSE; its browser generator defaults private keys to non-extractable. That is a source finding, not an XSS defence or an experimental extraction test. Same-origin script can still invoke the stored key/session. Node official DPoP stores serialize private JWKs, so host storage remains sensitive. Neither OAuth DPoP nor optional client-authentication keys belong in an Atseq archive, durable runtime result, evidence upload or actor/control key field.

The real browser storage probe constructed two synthetic client IDs on one origin. Official clients opened only `@atproto-oauth-client`, despite an unsupported extra `storageName` option. Exact source keys sessions by DID and constructs the database without a name option. Atcute supported configuration produced `atseq-runtime:version` and `atseq-publisher:version`. No credential record was written or leaked in this observation. It demonstrates naming, not a successful login or an isolation guarantee against same-origin code.

Atcute Node has per-client cached request deduplication and an optional `requestLock`; shared stores require a corresponding shared lock. Atcute browser requires Web Locks in a secure context, combines per-DID pending work with cross-document locks, and reconciles competing refresh rotation using stored revisions. Official core uses a supplied lock, falling back to a process-local lock; the convenience browser uses Web Locks when available and otherwise warns and falls back. Require the reviewed lock mechanism rather than interpreting a successful constructor as cross-process refresh safety. All clients need explicit tests for duplicate callback, restart, expired state, refresh rotation, revoke, persistence failure and runtime/publisher separation.

## Exact source map

`published-sources.json` identifies the source archives and locked release identities. These paths inside their archives support the main comparison:

| Source package | Files inspected |
| --- | --- |
| Atcute Node 2.0.1 | `dist/oauth-client.js`, `dist/oauth-client.d.ts`, `dist/session-getter.js`, `dist/utils/memory-store.js`, resolvers, server factory/agent and session |
| Atcute browser 5.1.0 | `dist/environment.js` / `.d.ts`, `dist/resolvers.js`, `dist/dpop.js`, `dist/store/db.js`, `dist/agents/exchange.js`, `dist/agents/sessions.js`, server/user agents and runtime helper |
| Atcute crypto 1.0.1 | DPoP fetch/proof/key and PKCE helpers |
| Official core 0.8.8 | `dist/oauth-client.js`, `dist/fetch-dpop.js`, `dist/session-getter.js`, `dist/runtime.js`, metadata resolvers, server factory/agent and session |
| Official browser 0.5.8 | `dist/browser-oauth-client.js`, `dist/browser-oauth-database.js`, `dist/browser-runtime-implementation.js`, entry and IndexedDB wrappers |
| Official Node 0.5.8 | `dist/node-oauth-client.js`, `dist/node-dpop-store.js` |
| Official Webcrypto/Jose keys and JOSE 5.10.0 | `dist/webcrypto-key.js`, `dist/jose-key.js`, `dist/browser/runtime/generate.js` |

## Implementation gates after review

The [ATproto permissions model](https://atproto.com/specs/permission) and the adopted A1 contract still govern repository writes. OAuth credentials allow scoped account operations; they do not grant Atseq governance or action authority. Keep repository signing, OAuth DPoP, optional OAuth client authentication, and Atseq actor/control keys separate.

Before production packaging, ratify the browser guard requirement, single-origin/client custody choice and family. Then implement thin platform adapters with bounded transactions, expected-DID/issuer/scope checks, single-use callbacks and reviewed refresh/storage boundaries. First account setup must include epoch(previous null), `epochCurrent/self` and grant create/CAS; a losing concurrent initializer reads the winner. Routine grant creation and management epoch-pointer changes have separate scopes and consent. Preserve the corrected A1 enrolment note's publication, admission, entitlement and accepted-action stages.

Required followup checks are all-network edge refusal tests, callback/replay/race and state-bound tests, provider capability/scope handling, actual package consumers, real Chromium persistence/refresh/locks/custody and the normal Node/build/integrity/acceptance gates. Tests must prove that no credentials reach application archives or runtime output. Provider success remains an explicit future test; it cannot be inferred from maintained packages or these stopped discovery calls.

This source-only task ran six isolated installs, twenty bundles, two Node discovery probes at each of two Node versions, real Chromium discovery and storage probes, published-source SRI checks and evidence assertions. Production full-suite/build/acceptance tests were not run because production source and dependencies are unchanged. No package family, graph publication or semantic profile was changed.
