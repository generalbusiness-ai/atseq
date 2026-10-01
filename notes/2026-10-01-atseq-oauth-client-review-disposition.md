# OAuth client review and adopted disposition

Date: 2026-10-01. Report-only successor for A1 request `13d42e4adec8f8d9570e48306846dad046a0036f` and promise `676577467fa4e57c61e0191cf1864da781d0f4b3`.

## Adopted choice

Use both official clients, `@atproto/oauth-client-node@0.5.8` and `@atproto/oauth-client-browser@0.5.8`, as one maintained OAuth family, subject to the six conditions below. This is the disposition proposed after independent assessment `f3c65906b134740f3e4e17ce7d5fb2c48b9955bf`. The requester ratified this assessment on 2026-10-01; A1 remains open. This successor implements no client, dependency, profile or custody change.

The [original comparison](2026-10-01-atseq-oauth-client-comparison.md) at source head `3347c3a33a31c2199ce09b8441ebb0e9995f1c45` remains unchanged, including its conditional mixed-family recommendation. Its measurements, source archives, failed probe attempts and capture hashes are preserved. This note records the received assessment and the adopted disposition; it does not rewrite the earlier evidence as if it had selected both official clients.

The reviewer read the note and evidence index, extracted the retained published source archives, and checked key custody and URL-validation claims directly. They did not reinstall candidates, rerun bundles or repeat Chromium probes. The workroom assessment is event `git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:f3c65906b134740f3e4e17ce7d5fb2c48b9955bf`, sequence 7542. It recommends both official clients and explicitly keeps A1 open.

## Why the proposed choice changed

The reviewer considers browser key custody decisive. Atcute crypto 1.0.1 generates extractable DPoP keys and exports private JWKs; Atcute browser 5.1.0 stores those JSON keys beside tokens in localStorage. The official browser's inspected Webcrypto/JOSE generation defaults private keys to non-extractable and retains CryptoKeyPairs in IndexedDB. These are findings from the exact published source, not a newly run key-extraction experiment.

Non-extractability limits export of that key. It does not make a compromised origin or OAuth session safe. Code running on that origin can invoke the key and use the session to perform scoped requests. Malicious code may retain a foothold on the origin; this assessment establishes no limit on that persistence, provider behavior or resulting account writes. Keep the credential origin tightly scoped and separate from app-supplied content. Tokens, key handles and session access still require custody and cleanup.

The official browser also offers the supported HTTP injection interface that Atcute browser 5.1.0 lacks. That permits a reviewed browser URL/request policy on every OAuth HTTP edge. It does not reproduce the host's DNS pinning or private-address checks after DNS resolution. The browser controls connection routing and its own CORS and local-network protections.

Once the official browser brings its shared OAuth core, using its Node client avoids a second metadata, callback, nonce, store and lock contract. The measured ordinary official pair adds 45 installed paths and 6,515,599 bytes; the mixed pair adds 44 paths and 6,538,471 bytes. The proposed foundation-preserved official pair adds 47 paths and 6,823,068 bytes and leaves all original 147 paths and file hashes unchanged. These existing measurements support the dependency comparison; this successor performs no new installation.

Atcute Node still has the smaller measured standalone selected bundle: 48,380 versus 1,754,142 bytes. That Node bundle is not delivered to browser users. Lazy import is proposed to keep OAuth out of unrelated start paths, but neither this assessment nor the earlier bundle measurements establish an actual startup or memory benefit. Measure those effects before claiming them. Revisit the mixed family only if a material measured CLI/host cost remains and justifies its additional adapter contract.

## Conditions to carry into implementation

| Condition | Required implementation behavior and evidence |
| --- | --- |
| C1: import boundaries | Load the OAuth adapter lazily only for enrolment and session operations. Host, CLI and verifier startup must not import it. Prove portable verifier and ordinary browser runtime bundles contain no `@atproto/oauth-client*` module. Measure actual lazy-load startup and session-entry costs separately; do not infer benefit from source structure alone. |
| C2: custody | Use a dedicated enrolment/session custody origin with one OAuth client ID. Keep publisher credentials on a separate origin. Render no app-supplied HTML or views on the credential origin. The official convenience client's fixed per-origin IndexedDB and synchronization names require this boundary. Keep Node private JWK/token stores owner-only, with files mode 0600 and protected parent storage; exclude credentials from archives, runtime results, evidence and actor/control fields. Test those exclusions and origin boundaries. |
| C3: callback identity | Require callback `iss` before calling the library, regardless of advertised server metadata. Pin the expected account DID in the adapter transaction; check returned `sub`, granted scopes and authorization-server authority before publication. A mismatch cleans up credentials and never publishes. |
| C4: single use and refresh | Serialize callbacks or use a separately reviewed atomic consume, with expiry and a bounded pending count. Require browser Web Locks in a secure context; refuse the library's process-local fallback when multiple documents can be open. A shared Node store needs a shared `requestLock`. Test replay, duplicate callback, expired state, restart, refresh rotation, persistence failure and revoke. |
| C5: guarded identity and HTTP | Inject supported guarded identity hooks in both platforms and prevent use of the official Node default handle resolver. Pass the reviewed fetch policy through client metadata loading, protected-resource/authorization-server discovery, PAR, token, refresh, revocation, DPoP retry and resource requests. Prove every edge reaches the hook, including failure and fallback paths. |
| C6: preserved foundation | Promote `@atproto/common-web@0.5.10` and `@atproto/syntax@0.7.5` to exact direct pins as measured in the preserved variant. Resolve incompatible newer parent requirements to compatible nested copies; do not force old versions outside their ranges. Review new installed paths, files, approvals and notices under the ordinary provenance process, preserving I1 foundation file identities. |

For C5, the reviewed browser policy should require HTTPS endpoints; refuse IP-literal and localhost hosts at the URL level; set redirects to `error` and credentials to `omit`; and impose per-request deadlines, body-size limits and a bounded transaction count. This describes what page JavaScript can enforce. It is not a browser DNS-pinning claim. Keep the host's stronger I1 transport policy separate and test each platform's actual boundary.

An enrolment/session shell may render its own trusted consent and session controls on its dedicated origin. Application views belong on another origin. Different client metadata URLs, localStorage names or library instances alone do not create that separation. If a future deployment needs several same-origin OAuth clients or publisher/runtime co-location, prepare a new supported-store/runtime proposal rather than treating the convenience client's internal database name option as a public API.

## What remains open

Implementation tracking follows the workroom process. Implement the thin official-family adapters and the corrected A1 account-publication contract: first-account epoch(previous null), `epochCurrent/self` and grant create/CAS; losing concurrent initialization reads the winner; routine grant creation and management epoch changes retain distinct scopes. OAuth credentials authorize scoped account operations and do not replace Atseq admission, entitlement, actor/control signatures or accepted-action checks.

Executable all-network refusal tests remain necessary for token, refresh, revocation and resource edges; these were source-traced in the comparison. Duplicate callback, restart, state bounds, refresh rotation, revoke, storage/origin isolation and output exclusion tests remain open. So do actual lazy-loading measurements, real-provider trials, package consumers, real Chromium session behavior and normal build/integrity/acceptance gates. Maintained packages, an effective review event and successful stopped discovery probes do not establish those results.

This successor changes only this dated report. The original note, source scripts, raw archive, summaries and capture hashes are unchanged. Formatting and Git diff checks are appropriate validation for this report-only change; no new production tests or provider-success claims are made.

Publication status: the requester ratified assessment `f3c65906` on 2026-10-01.
Both official clients and conditions C1–C6 are adopted for the A1 implementation.
The original measurement recommendation remains historical evidence.
