---
date: 2026-10-02
status: proposed; source inspection only; independent decision required
baseline: 0df4aa12126d9ea2dd01332a0a6f99d389eebb32
request: f999b4a17086f87a0d5f65a4d0bcec2a09f8d994
promise: 916b84edba91a081576209c591a822879200be30
parent-request: 110166f98b30a4ae5de2684d011e2252c97102f7
---

# Provision an application account and recover its access

Use an existing ATproto account when possible. For a new account, use a PDS's
ordinary account setup, with an independent PLC recovery key where supported,
or a hostname `did:web` account when the operator can maintain its web identity.
Atseq should connect account write access to its native publisher, rather than
create another account, identity resolver or authorization service.

The app PDS holding the repository signing key can construct another ordering.
That [adopted authority choice](2026-10-01-atseq-native-authority-decision.md)
remains the default. Account recovery restores access to the accepted app history;
it cannot silently replace that history, app governance or a returning reader's
floor. These are proposed operational APIs and tests, not implemented setup or
provider success. A1, I1, I2, N1 and retry/restore implementation still gate use.

## Four separate boundaries

| Boundary | Custody and effect |
| --- | --- |
| App account DID and repository signing key | The DID method determines account control; the active PDS holds the repository key and signs publication. PLC rotation authority or web hosting control can change that binding. Atseq does not request the repository private key for ordinary operation. |
| Account write credentials | OAuth sessions authorize PDS requests, with their own DPoP keys and scopes. Account-management credentials are used separately for setup/migration operations that cannot use OAuth. Losing a session does not lose the repository key or revoke an Atseq actor grant. |
| App control and optional owner | Genesis and accepted I2 certificates appoint control principal/key pairs. An optional owner can assign participation roles within I2 rules. Account possession, PDS administration and OAuth login do not manufacture these appointments. |
| Host operator | Retain the existing private directory, loopback listener and host token. This permits local setup/management; it does not supply a governance signature or grant participation authority. Public OAuth metadata/callback hosting must not expose this management service. |

Keep independent PLC recovery material outside the app PDS and outside routine
OAuth custody. App-control keys may have the same custodian, but their explicit
appointments and powers remain separate. Also distinguish a confidential OAuth
client authentication key, if later needed, from DPoP and all the above keys.
No confidential-client requirement is introduced by this proposal.

## Small API change and owners

The existing `AccountProvider.open(creationId)` returns the concrete password/JWT
`PdsClient`. `LocalAccounts` provisions by a generated handle/password, and the
current `ApplicationHost.create` separately generates a sequencer key. Those are
spike behaviors; they cannot be presented as native app setup.

| Owner | Proposed narrow change |
| --- | --- |
| `src/host/accounts.ts` | Retain `AccountProvider.open` as the host entry point. Return an account writer interface rather than a concrete JWT client. Add an existing-account provider backed by an owned A1 session and an explicit account DID. A new-account provider performs bounded official setup, then opens the same writer. |
| `src/host/pds.ts` | Separate the existing bounded XRPC operations from authentication. Keep one method/body/CAS decoder. Supply either the A1 session's `request` transport or the temporary account-management transport; do not extract OAuth tokens or build a second refresh manager. |
| `src/host/main.ts`, `src/cli/main.ts` | Select existing account or explicitly requested new account and a private configuration file. No secrets in command arguments, stdout, report, URL, source CAR or archive. Show safe setup state and next operation. |
| `src/host/application.ts` and native host integration | Consume the selected DID and writer, explicit source/policy and genesis control appointments. Preserve the immutable app DID/genesis pin. Remove separate sequencer-key custody in the native path. A2 does not implement a second native publisher. |
| Existing A1 adapters and loader | Authorize/restore the exact account and requested operations, verify DID/PDS/issuer linkage, keep credential custody and refresh here. A1-F2 source supplies `OAuthSessionHandle.info`, `request`, and `revoke`; it is unreviewed at this inspection and cannot be assumed landed. Durable custody waits for its accepted followup. |
| Existing I1 observer/P1 verifier and I2 interpreter | Observe current public binding/proofs and interpret grants, floors, control and recovery. The setup adapter cannot mint accepted authority from configuration or account responses. |

Propose an internal `NativeAccountWriter` with immutable `did`, the existing
`get`/`list` record reads, `latestCommit`, `applyConditional` and `upload` methods.
Reuse their bounded response decoders. The native publisher owns which records
and operations it requests; this interface conveys write custody, not a checked
root, app permission or trusted publication. `latestCommit` remains a remote
candidate until independently verified. Do not expose unconditional `apply` in
the native writer interface. Its implementation takes an owned A1 handle, never
a caller-supplied `isAuthorized`/`verify` callback.

The account writer needs only bounded typed XRPC reads, conditional `applyWrites`
and blob transport. Native proof reads
remain credential-free through I1/P1, even when the writer is authenticated.
Do not pass tokens as a `PdsClient` constructor substitute. Adapt the A1 handle's
request operation after checking its current `info()` and exact configured DID;
leave token renewal and authority-change checks in A1. A PDS migration makes the
old writer unavailable until fresh A1 authorization resolves the new binding.

Persist one private setup record before any remote allocation. It records the
creation ID, selected mode/DID, expected provider, public recovery key, safe
phase and exact intended genesis CID when available. Credential references stay
private and separate; do not duplicate credential contents into this record.
Serialize setup through the existing host queue/lease and private-file routines.
After a lost reply, reconcile the same account and exact publication before
continuing. The identifier is local correlation, not an idempotency promise by
the provider. An ambiguous remote allocation must never automatically allocate
another DID. A setup phase is a progress journal, never protocol authority.

## Existing account: no new domain

1. Select an existing supported account DID; a handle is only a locator. A user
   can reuse hosted PDS and OAuth services without owning a domain. Prefer a
   dedicated app account to avoid unrelated writes and broad custody, but make
   reuse explicit rather than prohibit it.
2. Open A1 authorization for native app collections and exact required operations.
   Separate routine append/blob consent from account migration and participant
   grant/epoch management. Do not silently request unrestricted account access
   when a provider refuses granular permissions.
3. Independently verify the public current DID/key/PDS binding and selected root
   using I1/P1. Inventory native genesis/head paths. An existing different genesis
   at the singleton path is a refusal; an exact existing app goes through verified
   restore. A missing or unavailable proof is not evidence of an empty account.
4. For a new app, require explicit initial control appointments and externally
   pinned genesis, then use the single native host bootstrap/CAS path. Show PDS
   ordering/observation custody and recovery limitations before use.
5. Retain public proofs separately from credentials. Publish, verify and interpret
   are separate steps; account login does not prove a successful app bootstrap.

For an existing PLC account, the official [recovery guide](https://atproto.com/guides/account-recovery)
describes adding a self-custodied public rotation key through the account's
email-confirmed management flow. Its maintained
[`goat` tooling](https://github.com/bluesky-social/indigo/tree/main/cmd/goat)
can perform that operation; Atseq should reuse this path and verify the result,
without importing the private recovery key into routine host custody.

Existing app PLC accounts need independent higher-priority recovery custody to
meet the adopted recovery condition. Read the verified complete PLC history;
the DID document omits rotation keys. Do not infer priority from a
`getRecommendedDidCredentials` suggestion. If a provider will not install the
required key, report that this deployment lacks independent ordering recovery
and leave the A2 condition unsatisfied. Do not silently change authority modes or
block ordinary participant enrollment on this app-custody requirement.

## New PLC app account

Use `com.atproto.server.describeServer` to establish declared account/invite
requirements, and the provider's real signup workflow for requirements not
expressed there. Submit `createAccount` with a supplied independent public
`recoveryKey` where supported. The pinned reference handler puts this before
the PDS rotation key; verify the actual resulting signed PLC history and custody
after creation. Its optional Lexicon field is not a universal provider guarantee.
See the exact [createAccount Lexicon](https://github.com/bluesky-social/atproto/blob/3cd9fa6013efad3ab57704ae804952be097e5d26/lexicons/com/atproto/server/createAccount.json)
and [reference handler](https://github.com/bluesky-social/atproto/blob/3cd9fa6013efad3ab57704ae804952be097e5d26/packages/pds/src/api/com/atproto/server/createAccount.ts).

Recover a lost creation reply by logging into the recorded handle/account through
the provider's account-management path. Resolve and pin its DID; if the account
cannot be identified safely, stop allocation and report uncertainty. Email,
password, invite/challenge and signup JWTs are temporary private setup data.
Do not give the PDS the independent recovery private key. Once the account is
active, use A1 OAuth to open the same app writer and the existing-account path.
Managed PDS provisioning may require provider UI rather than generic XRPC.

## Hostname web account: complete parameterized path

Use separate names: `H` is the identity hostname, `P` the public PDS origin,
`C` the public Atseq OAuth client origin, and `L` the private loopback host.
They can share a trusted operator, but need not share a hostname or server.
The supported principal is `did:web:H`, resolved at
`https://H/.well-known/did.json`. Path-based web principals are unsupported;
localhost/encoded ports are development exceptions only. A DID document contains
its exact ID, handle alias, `#atproto` public key/controller, and
`#atproto_pds` service of type `AtprotoPersonalDataServer` pointing to `P`.
Use the existing maintained extraction, not a new DID resolver.
[ATproto's DID specification](https://atproto.com/specs/did) defines these fields.

The following is the proposed setup procedure, inferred from inspected official
APIs. It has not been exercised against a local or public PDS:

1. Establish DNS and valid HTTPS for `H`, `P` and `C`. Configure the official PDS
   distribution at `P`, private persistent data, blob storage, account email and
   invite policy; use its current installer/compose guide. Keep PDS administration
   secrets and PLC server rotation material out of web document hosting. The
   [official PDS repository](https://github.com/bluesky-social/pds) owns this setup;
   its sample uses `PDS_HOSTNAME`, private JWT/admin secrets, data/blob directories,
   directory and email settings. Discover the destination service DID using
   `server.describeServer` at the explicitly configured `P`, and check it against
   any configured service DID override. This is provider configuration discovery,
   not an app identity proof. It must match the actual destination audience;
   do not guess it from the app DID.
2. Create a temporary locally controlled repository signing key using maintained
   tooling and publish its public key in `did:web:H`, with the intended handle
   and `P`. Configure the handle's DNS TXT or HTTPS resolution to this DID and
   confirm the reverse handle alias. This is a temporary import authorization
   key, not an Atseq actor or a permanent key passed to the PDS.
3. Prove existing-DID control to `createAccount` at `P` with a short-lived service
   JWT: issuer `did:web:H`, audience the destination PDS service DID, method
   `com.atproto.server.createAccount`. Sign with the temporary key using official
   `createServiceJwt`/crypto tooling. Keep this tool outside portable runtime;
   exact dependency approval and executable setup coverage are required before
   adding it to Atseq. Never hand-write a JWT signer or add an auth manager.
   For an existing active account, the old PDS's `getServiceAuth` is the normal
   source of this token instead.
4. Call `createAccount` with `did`, handle, required email/password/invite or
   challenge data and that bearer token. The inspected reference PDS checks
   requested DID against service-auth issuer, generates its own repository key
   and creates a deactivated account. Retain private account-management access;
   OAuth cannot yet authorize this deactivated account.
5. Authenticate account management on the staged PDS. Fetch
   `identity.getRecommendedDidCredentials`, check its service and handle, and
   replace the web document's temporary `#atproto` key with the returned PDS
   public key. Decode its canonical `did:key` to the standard `Multikey`
   representation using maintained key tooling; do not put that whole DID string
   into `publicKeyMultibase`. Read back public bytes independently and check exact
   DID/key/PDS/handle agreement. A recommendation is input, not an accepted
   binding or permission. No private repository key leaves the PDS.
6. Check staged account/repository status and call `server.activateAccount`
   through account management. The inspected reference explicitly refuses OAuth
   activation. With public identity and active account aligned, perform actual
   OAuth discovery and consent from `C`, then the existing-account app bootstrap.
   Do not report success merely because the DID file or HTTP health check works.

Reference owners are [service-auth creation](https://github.com/bluesky-social/atproto/blob/3cd9fa6013efad3ab57704ae804952be097e5d26/packages/xrpc-server/src/auth.ts),
[recommended credentials](https://github.com/bluesky-social/atproto/blob/3cd9fa6013efad3ab57704ae804952be097e5d26/packages/pds/src/api/com/atproto/identity/getRecommendedDidCredentials.ts)
and [account activation](https://github.com/bluesky-social/atproto/blob/3cd9fa6013efad3ab57704ae804952be097e5d26/packages/pds/src/api/com/atproto/server/activateAccount.ts).
Provider refusal, missing import support, handle policy, unavailable service auth
or failed public readback stops the procedure. No automatic PLC fallback or new
principal is created.

## OAuth hosting and transport

Host public client metadata at `https://C/oauth-client-metadata.json` with its
exact `client_id`, declared scopes, redirects, code/refresh grants and DPoP.
Use the selected A1 adapters for PAR, PKCE, callback nonce/issuer checks and
refresh. Keep browser and Node credential custody separate. A public browser
callback at `C` need not expose `L`; a Node callback listener must preserve its
separate state/expected-origin policy, rather than weaken the management token
route. The current management server binds only `127.0.0.1` and checks Host,
Origin and bearer token on management procedures.

The localhost client-ID exception is provider optional; it is not a production
support guarantee. Do not use it to waive A1's guarded network policy or label a
local fake provider as public interoperability. Publishing application-owned
metadata at `C` can support existing-account users without their own domain.
Actual CLI/native redirect compatibility and browser CORS/connect policy remain
A1/T1 implementation gates. [ATproto OAuth](https://atproto.com/specs/oauth) and
[permissions](https://atproto.com/specs/permission) own the public protocol.

## Recovery without changing app authority

| Event | Required operational path and retained boundary |
| --- | --- |
| Lost/revoked OAuth credentials | Purge the affected custody, recover account access through its provider if needed, reauthorize the exact DID/current issuer, and reconcile exact pending writes. Do not rotate the repository key, change genesis or revoke actor grants as a side effect. |
| Participant actor key lost/compromised | Publish explicit I2 revoke or normal epoch succession through recovered account write access and import fresh proof. Queued work is checked against ordered authority. App-appointed participant recovery is needed when account reset cannot extend the retained branch/floor. |
| App-control key lost | Use another already appointed effective control key with the required power, if one exists. Account/DNS/PDS possession cannot appoint its replacement. With all applicable control keys lost, require explicit new trust/genesis. |
| PDS repository signing key lost or compromised | Restore safe PDS state or provision a replacement, update the app DID through its separate control, retain/revalidate exact app prefix and all newer local floors, then obtain fresh native root evidence and write credentials. An unreconcilable fork fails; no same-genesis replacement chain. |
| PLC PDS/key migration | Stage a destination account with service auth, import verified public repo and referenced blobs, retain independent higher-priority recovery key, update PLC through existing authorized rotation custody, verify canonical full history, activate destination and reauthorize. Old PDS credentials do not authorize the new one. |
| Host directory/token lost | Recover only from explicitly trusted local backup and restore checks, or replace host operator access while preserving app pin/history. Never derive app governance from possession of a new operator token. |
| Web DNS/TLS/hosting outage or compromise | While still controlling `H`, restore its web document and account binding, independently read back, then reconcile current app history. A transferred/lost hostname may be unrecoverable; a new hostname is a different ATproto web principal and needs explicit rebinding/new app trust as applicable. |

For cooperative PLC migration, use `getServiceAuth`, destination `createAccount`,
`sync.getRepo`/`repo.importRepo`, blob export/upload, status checks and identity
recommendations. For PDS-managed rotation, the old PDS's
`identity.requestPlcOperationSignature` and `signPlcOperation` produce an operation;
the destination's `submitPlcOperation` validates/submits it. For independent PLC
custody, use maintained PLC tooling with the authorized rotation key instead.
Verify the resulting canonical history, including key priority; preserve the
independent key even when recommendations omit it. Activate the destination and
only then retire the old account when safe. These APIs and deactivated staging
are described by the [official migration guide](https://atproto.com/guides/account-migration).

A higher-priority PLC key can recover specified recent changes within the
directory's 72-hour window; it is not indefinite undo. Retained signed history
authenticates authorized succession, not latestness or absence of an unseen
ordering. The [PLC method repository](https://github.com/did-method-plc/did-method-plc)
owns its directory rules. Atseq's observer reuses its existing maintained verifier;
A2 must not implement another recovery-window interpreter. App floors and
participant admission branches remain independent I2/R1 checks after migration.

For web migration, stage the replacement PDS using current signing-key service
auth, import complete retained content, update the same `H` document to the
destination key/PDS, check it publicly, then activate and reauthorize. If the old
PDS is unavailable, web control can temporarily publish a self-controlled key to
authorize destination account creation; rotate to the destination key afterward.
This changes account binding, not app governance. Pause app appends during the
handoff; resume only after the genuine verified/materialized prefix and exact
pending-write reconciliation gates pass. Missing old history is not a blank app.

## Trust disclosure and optional WebVH

Web setup depends on continuing domain registration, DNS, certificate issuance,
TLS serving and hosting control. Managed subdomains make their provider part of
identity recovery. The app PDS can rewrite/order/publicize app assertions; a
participant PDS can publish grants but cannot forge an uncompromised actor's
signature. Under default web observation, an app PDS can fabricate purported
web DID response bytes without controlling that hostname. Public readback detects
an encountered mismatch; retained unsigned web bytes do not make offline
currentness independently provable. Signed PLC history blocks invented key
succession for an existing DID, but not withholding of later authentic history.

Keep WebVH out of baseline provisioning. The existing ATproto principal remains
hostname `did:web`; `did:webvh` is not a native supported account method. WebVH
v1.0 supports a signed history and parallel web document; reading only that
export discards history verification. Portability preserves its SCID/history
while changing its DID string; it does not preserve the exported hostname web
principal. See [WebVH v1.0](https://identity.foundation/didwebvh/v1.0/) and its
[GitHub repository](https://github.com/decentralized-identity/didwebvh).

Revisit a companion adapter only when a real deployment already maintains WebVH
or needs independently anchored web-key history beyond default observation.
That followup needs a reviewed explicit trust anchor for SCID/update policy,
exact export/account mapping, retained authenticated history and version floor,
and no silent downgrade. An alias fetched from the same compromised hostname
does not supply that anchor. History does not prove latestness/non-equivocation,
restore a lost domain or appoint app control. No such deployment requirement is
established here, so propose no WebVH runtime, resolver, new policy or witness
system in A2's baseline.

## Implementation gates and evidence

The [inspection packet](../experiments/post-spike-evidence/2026-10-02/app-provisioning-boundary/source-inspection.json)
pins approved local sources, the unreviewed A1 candidate and official source
commits. The [symbolic vectors](../experiments/post-spike-evidence/2026-10-02/app-provisioning-boundary/acceptance-vectors.json)
are all unexecuted. Source inspection cannot establish provider import/permission
support, account recoverability, actual DNS/TLS/CORS behavior or absence of leaks.

Review the account-writer transport split, existing-account baseline, web import
sequence, recovery-key/provider refusal behavior, setup journal reconciliation,
loopback/public callback separation and conditional WebVH deferral first.
Implement the adapter only against accepted A1 custody, native publisher and
genuine I1/I2/R1 boundaries. Then exercise official local PDS/PLC lifecycle tests,
both key curves, public web hosting and actual provider OAuth/permissions; retain
safe raw public bytes and sanitized operation outcomes. Include crash/lost-reply,
hostile identity/provider/CAS, stale backup, key loss and no-network replay cases.
Report local fixtures and real provider results separately. Full A2 stays open
until its complete code, tests, operational recovery and independent exact-head
review are delivered.
