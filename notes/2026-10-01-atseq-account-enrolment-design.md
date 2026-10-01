---
date: 2026-10-01
status: independently accepted with corrections; wire and dependency gates pending
examined_at: bcc9c92cf194b27f23f0b347ef67e6c707b8a978
request: 13d42e4adec8f8d9570e48306846dad046a0036f
---

# Enrol an account device or agent

Use maintained ATproto OAuth clients to authorize publication of an I2 native
grant. Keep the reusable enrolment workflow independent of browser navigation,
callback servers and OAuth storage. A device or agent signs actions with its
own key after admission; it does not need the account's OAuth session to act.
This is source research and a proposed boundary, not implemented enrolment or
successful provider evidence. I1, I2 and N1/NW0 still own admission and wire rules.

## Reuse decision

Choose the maintained family after an exact installed-closure, integrity and
browser-bundle comparison, with a bias towards the existing Atcute dependencies.
The official pair is justified only by measured cost or a concrete capability
gap, such as missing nonce handling or refresh locking in the alternative.
Neither family is selected by this note. Keep runtime adapters separate from the
portable verifier. Do not implement PAR, PKCE, DPoP, token refresh or account/issuer
authentication again.

| Inspected package | Concrete reuse and cost |
| --- | --- |
| `@atproto/oauth-client-node@0.5.8` | `NodeOAuthClient`, injected fetch, state/session stores and refresh lock; own package requires Node >=22. Shared core is `@atproto/oauth-client ^0.8.8`; newer DID/JWK/resolver dependencies need a closure review. |
| `@atproto/oauth-client-browser@0.5.8` | Instance `BrowserOAuthClient`, sign-in/callback/restore/revoke, browser-managed storage and injected fetch. Adds `core-js ^3.50.0`; actual bundle/provenance impact is unmeasured. |
| `@atcute/oauth-node-client@2.0.1` | Viable smaller-family alternative: `OAuthClient`, actor resolver, custom fetch/stores/lock, automatic localhost metadata. Reuses several existing Atcute dependencies, but savings require an actual closure comparison. |
| `@atcute/oauth-browser-client@5.1.0` | `configureOAuth` plus authorization/finalization/user-agent functions. Module-global configuration fits the single browser deployment and separate runtime adapter proposed here; it does not by itself justify another family. No cost comparison was executed. |

The [official Node client](https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-node)
and [browser client](https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-browser)
document the runtime adapters. The alternative is maintained in
[Atcute](https://github.com/mary-ext/atcute); the inspected browser release's
registry repository points to its [Tangled repository](https://tangled.org/did:plc:pljn5qch4tgadongtc7i6qij).
The [inspection manifest](../experiments/post-spike-evidence/2026-10-01/account-enrolment/source-inspection.json)
records exact versions, SHA-512 tarball integrity and direct dependencies.
Only these four own-package tarballs were fetched and inspected; their complete
transitive graphs and implementations were not audited or executed.

## Authorization and key boundaries

OAuth must verify the callback state and issuer, PKCE S256, DPoP binding/nonces,
returned account `sub` and granted scopes. An account chosen before navigation
must match the returned DID. Provider-first login needs the same independently
resolved account/issuer check. Prefer account-DID entry for the first workflow.
Treat a handle as a locator and display label, not the grant issuer.
[ATproto OAuth](https://atproto.com/specs/oauth) specifies these checks.

Keep four key purposes separate: account repository signing key held by the PDS;
OAuth DPoP session key; optional confidential-client authentication key; and
Atseq actor/control keys. Enrolment never requests the PDS repository private
key, PLC rotation keys or the private actor key of a remote agent. Signing and
secret storage are caller capabilities. Show the canonical actor public key,
principal, app DID/genesis, exact action contracts and requested participation
scope before publishing. An authenticated OAuth session cannot appoint app
governance, create an owner/admin entitlement, or substitute for an I1 proof.

Native publication authenticates account-PDS issuance, not separate human
interaction. All credential holders allowed to write the relevant collections
share that issuance custody. An uncompromised actor key still prevents them
from forging existing actor signatures. Scope intersection and immutable grant
admission belong to I2; never union unrelated grants or infer roles from OAuth.

## Smallest publication flow

1. Pin the app DID/genesis and reviewed contract. Generate or select the actor
   key locally; accept only a canonical public key from a remote agent.
2. Authorize the selected account with only the publication operations needed.
   Keep returned tokens and DPoP material inside the runtime adapter.
3. Read the current epoch and required native state. For a first account with no
   epoch or `epochCurrent/self`, prepare an initial epoch transition with
   `previous: null`, its current pointer and the grant referencing that epoch CID.
   Show this initialization and its extra create scopes on the consent screen.
   For an initialized account, prepare only a grant in its current epoch, with
   explicit app/contract scope. Inconsistent or incomplete existing state needs
   the management/recovery workflow, not automatic reinitialization.
4. Publish the first epoch, pointer and grant with atomic create operations and
   an expected repository commit. Never use an initial put or an update to make
   creation appear successful. A concurrent loser re-reads the winner's pointer
   and current epoch, rebuilds its unpublished grant reference and obtains fresh
   consent if the public grant context changed; it does not publish another
   initial transition. Routine grants also use create with random record IDs:
   a collision fails and cannot overwrite a different grant. On ambiguous write
   completion, find the exact expected grant CID and initialization state before
   retrying the same publication; do not generate another key/grant to hide
   uncertainty. A repository CAS loss is a re-read, never an account reset.
5. Use I1 retained native proof and ordered I2 admission. Report publication,
   admission, effective entitlement and first successful signed action separately.
   A published grant is not yet an effective app permission.

Account-wide epoch changes and recovery require the separate reviewed management
workflow. Logout/revoking an OAuth session does not revoke an admitted grant;
deleting the grant record does not revoke it either. Explicit I2 revoke/reset is
required. Losing OAuth write access may prevent publication of that revocation;
report it rather than claiming the actor was disabled.

## Narrow permissions and runtime delivery

Use `atproto` plus the explicit collection/action scopes below. The collection
placeholders await NW0's final owned NSIDs. Initialization is included only when
the selected account needs it, with deliberate consent. If that need is discovered
after authorization without its scopes, request new consent rather than widen
the credential silently. Later management requests only its actual operations.

| Workflow | Repository scopes |
| --- | --- |
| Routine enrolment into an existing epoch | `repo:<grant-collection>?action=create` |
| First account initialization with enrolment | Grant create, `repo:<epoch-collection>?action=create` and `repo:<epochCurrent-collection>?action=create`; the initial epoch/pointer/grant are one atomic CAS batch. |
| Explicit epoch advance/reset | Epoch create and epochCurrent update; no pointer update scope in routine enrolment. |
| Explicit grant revocation | Revoke create; deleting a grant does not revoke it. |

Neither `transition:generic`, repository wildcards,
identity management nor CAR-import permission is an enrolment default.
Permission sets add update-time indirection and are unnecessary for this small
first workflow.

ATproto's [permissions specification](https://atproto.com/specs/permission)
restricts repository writes by collection and create/update/delete action.
It has no record-key, app/genesis, contract or actor-key attenuation. Consequently
an enrolment credential can create grants for other app scopes in that same
collection; local validation limits this client, not stolen credentials. Use a
short-lived enrolment session by default. A dedicated app account remains the
recommended production ordering custody boundary, as N1 specifies.

| Surface | Proposed delivery |
| --- | --- |
| Library | Inject an authenticated publication adapter and actor signer. Return public grant/evidence/status; expose runtime-specific OAuth adapters through separate entry points, not the portable verifier bundle. |
| CLI | Bind an ephemeral callback listener only to `127.0.0.1` or `[::1]`. Use `http://localhost` virtual client metadata with encoded scopes and exact callback path when the provider supports it. Close after one validated callback or timeout. |
| Browser | Public HTTPS client metadata and registered HTTPS callback, no client secret. Keep tokens/DPoP storage separate from actor storage; handle denied/quota-lost storage explicitly. XSS can still act through either live capability. |
| Remote/headless agent | Enrol its public key through the owner's browser workflow; transfer only pinned public enrolment context and resulting public grant reference. Do not forward OAuth codes/tokens or actor private keys. |

The localhost metadata exception is **optional** for authorization servers.
Public HTTPS metadata is needed for normal deployed clients: exact client ID,
HTTP 200 JSON and declared redirects/scopes. Native HTTPS/custom-scheme callback
options are deployment-specific; merely hosting metadata does not promise a
portable CLI HTTP-loopback redirect. If a provider refuses the localhost flow,
use browser enrolment of the CLI's public key rather than inventing a code relay.
These constraints follow [OAuth's client metadata and redirect rules](https://atproto.com/specs/oauth).

## Operational limits and evidence still needed

Propose a 10-minute, single-use authorization transaction with at most 10 pending
states per local client; callback requests <=16 KiB and exact path/method/parameter
checks. Namespace state/session storage by client ID and runtime, retain no
secrets in reports, and coordinate concurrent callback consumption and refresh.
Only explicitly requested durable sessions survive enrolment. Host-side discovery,
metadata/token and PDS fetches need I1's approved public-address/connect-time DNS,
redirect, deadline and byte guards. OAuth metadata caching is separate from I1's
fresh retained-observation policy. Confirm injected fetch reaches every network
edge in the selected exact dependency closure before claiming those guards.

Hostname `did:web` allows independent HTTPS publication but still requires a PDS
and compatible OAuth provider. Domain/TLS loss or compromise controls identity;
there is no native domain-loss recovery or signed historical log. Its I1 web
assurance must remain visible separately from PLC signed-history assurance.
ATproto supports hostname-level web DIDs, not path-based web identities or WebVH.
See the [DID specification](https://atproto.com/specs/did).

Before implementation closure, retain tests for state/issuer/sub/scope mismatch,
duplicate or replayed callback, expired state, denied reduced scopes, missing
collection permissions, refresh races, storage loss and OAuth revocation versus
grant revocation. Run both curves and real browser/Node paths, key/PDS migration,
write ambiguity and CAS loss. Include first-account initialization, simultaneous
first enrolments, initial create collision, random grant collision and refusal to
use put/update for initialization. A two-provider report must separately show discovery,
scope consent/enforcement, grant publication, native proof, ordered admission,
signed action and revoke/reset on each provider. Providers need compatible OAuth
and granular permissions, client-metadata reachability, supported callback flow,
browser CORS where applicable, and native proof endpoints. Account access and
metadata hosting are prerequisites; no two-provider success is claimed here.

Only official-document browsing, registry metadata, integrity-checked own-package
source inspection, source formatting and diff checks ran. No install, graph edit,
runtime networking implementation, OAuth login, publication, compiler, build or
implementation test was performed. Independent assessment `01253121` accepted
the direction with the first-epoch, concurrency and family-selection corrections
incorporated above. The separate comparison report must justify the adapter family
before dependency/runtime work; final wire and provider evidence gates remain.
