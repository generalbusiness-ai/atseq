---
date: 2026-10-02
status: implementation candidate; independent exact-head review pending
request: fd118ca81712ba47d6059fafedff55b6acf0f976
root_promise: 3073d4101911b08f66b80bc559e19f9629ebe5a0
source_producer: 695a1ab5bd43999641417fce439973aaf7ecb562
predecessor: 39db7182b19d224091c0b50c44d8212055207d01
---

# OAuth HTTP outage results

CF-1a preserves unchanged browser consent when fresh identity or OAuth metadata lookup returns HTTP 429 or a server error. The guarded fetch raises an owned `content_unavailable` error before resolver/body parsing. The existing custody journal can then restore an unchanged row to live with its original consent deadline. Authenticated resource responses still pass to the caller; dispatched token failures and explicit signout still retire locally.

Independent change assessment `cfef2d20226d098383987e3e3a82e7098d5077df`, ratified as `7d18d589`, identified this regression in predecessor `39db7182`. Its earlier connection-reset correction did not cover HTTP error responses. This successor is tracked by request `fd118ca81712ba47d6059fafedff55b6acf0f976` and root promise `3073d4101911b08f66b80bc559e19f9629ebe5a0`. Full A1 provider, CLI/native publisher and programme acceptance remain open.

## What changed and why

Actual Chromium controls over unchanged predecessor production reproduced both a plain identity HTTP 503 response during resource verification and authorization-server HTTP 500 during restore. Each became sanitized `input`, dispatched no token or resource request, made one revoke request, deleted the live account and failed the next healthy request. Those captures remain in `reproduction-plain-identity.log` under their frozen test producer.

Inspection of the selected maintained SDK explains the missing class. Its metadata resolvers turn a non-200 response into `FetchResponseError` with the Request as cause. `OAuthResolverError` preserves a cause chain, but the original response never became an owned transient failure. The adapter therefore treated it as definitive and signed out. The trusted fixture identity resolver also parses its response body; an HTTP outage's parse failure became `input` through the same route.

The production change is seven lines in [the shared guarded fetch](../src/protocol/oauth.ts). After redirect/opaque-response/URL checks, an actual normalized Request without Authorization and a response status of 429 or at least 500 produces the owned transient error. The body is cancelled without parsing or retaining error descriptions. The current operation's existing error/deadline capture and custody finalization remain in place. There is no error-text classifier or automatic HTTP retry.

The maintained session handler always sets Authorization on resource requests. Those requests keep their bounded response status/body, including 429, 500 and 503. Public-client token requests have no Authorization, but the existing normalized POST/form marker is set before transport handoff. Their uncertainty remains conservative even when the HTTP failure becomes `content_unavailable` or the SDK returns the original resource 401 after failed refresh. An attempted session write/delete also remains a mutation; completion and explicit refresh retain their existing conservative rule. Explicit signout remains unconditional local retirement.

The SDK intentionally suppresses best-effort remote revoke errors. A signout with revoke HTTP 503 may resolve while its `finally` deletes local credentials. The new control checks that actual behavior; it does not promise successful remote revocation.

No custody-store, browser timer, Web Locks, private-key handling, origin policy, Node adapter, public export, semantic profile, dependency or capacity change was made. The Node adapter retains its existing persistence and verification cleanup behavior. The shared HTTP error classification also applies at its guarded edge, without adding Node persistence.

This worktree descends from the frozen OAuth predecessor. It separately incorporates the independently reviewed one-file H4 configuration commit `f7a22dcb57db0598d9d7e8d80dc2f64075221b8a`, cherry-picked as `82975f82`, so normal checking excludes retained historical evidence. Its `tsconfig.json` is byte-identical to reviewed main `51079ecf9bb9b1f024589c341ce5cd473dd064e1`. That configuration attribution does not claim the whole current main tree was integrated or tested here.

## Actual runtime evidence

The new HTTP cases use real Chromium fetch, IndexedDB, structured-cloned non-extractable keys and Web Locks on isolated synthetic origins. Playwright's HTTPS routes supply controlled status/body responses to the browser. These are not external provider or live-account trials. No private key, credential or HTTP error body is included in the captures.

Eighteen outage cases cover identity, authorization-server discovery and protected-resource metadata; each runs HTTP 500, 503 and 429 during resource requests and restore. Before healthy retry, every case observes:

- Sanitized `content_unavailable`, no token, revoke or resource dispatch, and one live account.
- The original explicit-consent deadline and identical logical account metadata.
- The same public DPoP JWK and private-key type/non-extractability.
- A successful next resource request after removing the outage.

The account comparison stays within the fixture browser. It compares all ordinary row metadata except the opaque `CryptoKeyPair`, plus the exported public JWK and private-key properties. It exports no private key and makes no forensic byte-identity claim.

Three authenticated resource controls verify unchanged HTTP status/body and live consent for 500, 503 and 429, with no token/revoke and a healthy next request. Six token controls cover those statuses during explicit refresh and resource-401 refresh. Each observes one token dispatch, local retirement and no automatic refresh retry. For these controls the fixture processes the token request before substituting the outage response, demonstrating why a dispatched request cannot be safely reused merely because its response failed. The resource-401 cases preserve the SDK's apparent successful return of the original 401 while retiring uncertainty.

One explicit signout-503 case observes zero token requests, one best-effort revoke request, local deletion and next-request refusal. The predecessor's actual abort/quota/storage-finalization, cleanup failure, capacity/expiry, nonce/callback, cross-document, non-extractable-key, crash/lost-token-response and definitive issuer/scope cases remain in the source and compiled custody runs.

All final gates use frozen production/test source `695a1ab5bd43999641417fce439973aaf7ecb562`:

| Gate | Result |
| --- | --- |
| Build, normal check and third-party notices | Passed |
| Node 22.19.0 focused adapter/browser | 5/5, including actual maintained Node 35-case probe |
| Node 24.21.0 same focus | 5/5, including the same 35-case probe |
| Node 26.10.0 adapter/browser/custody/startup graphs/integrity | 66/66, including 57 source Chromium custody cases and the same 35-case Node probe |
| Actual compiled production Chromium 153.0.8010.12 | 57/57 custody cases: 29 predecessor cases and 28 new HTTP cases |
| Packed native consumer | 219/219 conformance cases; shared dist preserved |
| Exact build and installed-file inspection | 143 source inputs, 460 actual outputs and all 14,234 approved runtime files verified |

The inspector also pins four changed files, nineteen unchanged files and twenty-two selected installed SDK files. The runtime graph remains exactly 194 package paths: 147 prior paths and 47 previously approved OAuth additions. Ordinary startup retains OAuth manifest data without executable OAuth modules; the existing lazy loader boundary remains.

The unchanged full ordinary suite, explicit 20,000-entry case and 60-second BFCache lifecycle gate were not rerun. Their prior source/capture attribution remains preserved. In particular, unchanged browser adapter and custody files are pinned to `39db7182`; this report does not relabel their prior BFCache gate as a newly executed test.

## Capture attribution and retained attempts

Packet: [oauth-http-outage](../experiments/post-spike-evidence/2026-10-02/oauth-http-outage/manifest.json). The manifest pins this report, helper inputs, validation, SDK/build inspection and every raw capture, excluding itself. [Source inspection](../experiments/post-spike-evidence/2026-10-02/oauth-http-outage/source-inspection.json) verifies 132 prior delivery files against the frozen `bc36`, `f6e7`, `deeb` and `39db` candidates and actual current bytes. No predecessor capture was rewritten.

[Attempts](../experiments/post-spike-evidence/2026-10-02/oauth-http-outage/attempts.json) records each earlier command's source scope and outcome:

- `cf92f96e` froze the initial reproduction tests with unchanged `39db` production. Discovery-500 reproduced consent loss. The initial JSON identity-outage body was tolerated by the fixture resolver and allowed the resource request, so that control failed its intended unavailable predicate. This first attempt remains intact.
- `8b0256b9` froze the plain-text identity outage fixture. Both targeted controls then reproduced input classification, one revoke, local loss and failed healthy retry, with no token/resource request.
- The evolving uncommitted guard draft passed its first 27 HTTP cases. A separate signout draft incorrectly expected rejection; reading the SDK showed remote errors are deliberately suppressed. The control was corrected to assert actual local deletion and no retry. That failed capture remains.
- The first normal check lacked the copied fixture PDS module and fresh dist declarations. The isolated fixture dependencies were copied and production built before the final passing check. No checked-in dependency graph changed.
- A successful build at frozen `579fb105` preceded the signout test correction. Its raw log remains under that source attribution; final build and runtime gates use `695a1ab5`.
- The first packed run failed while writing its result because `experiments/generated` did not exist in this fresh worktree. Creating that disposable output directory and rerunning produced the final passing capture.
- The first evidence-validator draft treated the packed cases array as a number. The corrected validator checks all 219 case predicates; the draft and diagnostic transcribed from tool output remain explicitly labelled as an evidence-tool failure, not runtime behavior. Delivery-manifest assembly also initially mixed relative and absolute paths; `metadata-first.json` records that transcribed diagnostic and correction without altering raw captures.

The source inspector was authored after the runtime freeze; its exact script hash records the inspection input separately. Its first draft resolved the actual full `695a1ab5` commit before checking; the final helper uses that explicit full pin. Both inspection passes and the earlier draft text are retained. Source assertions and capture arithmetic do not substitute for the executed Node, compiled Chromium and packed gates.

## Limits and recommendation

The fixed ten pending transactions, ten retained account slots, ten-minute pending lifetime, thirty-day deadline from explicit consent and exact 64-KiB metadata bound remain unchanged. Refresh cannot extend consent. A crash with an unknown journal remains conservative even during a logical read. Failed reenrolment after token dispatch can still retire existing consent. Failed local purge remains counted and unusable until storage is repaired or a trusted isolated-origin reset is performed.

The thirty-second networking/SDK/pre-finalization budget remains separate from awaited local storage completion and lock acquisition. Safe restoration requires the actual IndexedDB transaction completion; there is no new overall IDB abort deadline. HTTP outage bodies are not read, and cancellation is best effort; this is not a forensic physical-storage or total wire-byte guarantee. Remote revocation and cleanup while the browser is closed remain unguaranteed. Clock rollback N-1 remains explicitly deferred, with the existing wall-clock limitations unchanged.

Only the chosen unauthenticated statuses receive the new transient classification. Definitive identity/issuer/scope/audience validation and origin failures remain retirement paths. A transient response does not prove credentials valid or grant permission; the operation is withheld and a later request repeats fresh checks. Prefix/source/app identity design, provider admission and public support registration are outside this fix.

Recommend independent atseq-reviewer exact-head assessment of this narrow successor, then the parent's tracked merge process. No workroom, main, push or external-account action was performed by this implementation agent.
