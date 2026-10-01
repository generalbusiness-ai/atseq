---
date: 2026-10-01
status: proposed; independently assessed; prototype validation pending
planned_at: e082fc4edf8d7f49bf49746b13014c51c22a7b3e
category: direction and identity
companion: 2026-10-01-atseq-verification-and-bootstrap.md
---

# ATproto account identity and application authority

An Atseq participant should be identified by an ATproto account DID. Devices,
agents and hosting services exercise explicit authority for that principal;
their keys and sessions are not substitute identities. Individuals should be
able to use an existing account or a conveniently hosted web identity without
inventing a separate Atseq account system.

This proposed design compares durable evidence and delegation choices before
settling the wire contract. Backward compatibility with the spike is not a goal.
Runtime implementation and migration of existing applications are outside this
investigation. All roles are in scope, including app ownership and sequencing.

## Implementation direction update

The user subsequently preferred native app-PDS ordering unless significant
concrete evidence argues against it. The [native authority decision](2026-10-01-atseq-native-authority-decision.md)
supersedes the separate-sequencer custody default below and records the changed
recovery, observation, certification and proof-delivery boundaries. The
[implementation programme](2026-10-01-atseq-implementation-programme.md) tracks
reviewed decisions and deliveries. The alternatives and limits in this original
design-space assessment remain evidence; they are not simultaneous runtime modes.

The later [account admission design](2026-10-01-atseq-account-admission-design.md), [authority design](2026-10-01-atseq-account-authority-design.md), [native ordering requirements](2026-10-01-atseq-native-ordering-requirements.md) and [retry decision](2026-10-01-atseq-retry-uniqueness.md) record the selected continuation. They replace the historical backbone below with native publication, exact action-scoped grants, appointed app control and signer-key retry identity. Implementation remains open; retained PLC history authenticates key succession while web evidence remains an observation policy.

## Historical backbone

Use account DIDs (`did:plc` and hostname `did:web`) as principals, with immutable
repository grants/revokes for device and agent signers. Keep a separately
authorized sequencer; make it the default online admission observer and checkpoint
certifier. Start with one owner principal and explicit definition-administration
and recovery authority. OAuth enrols/revokes signers; ordinary signed participation
does not require an OAuth session.

This preserves offline signed work and independent ordering custody while reusing
ATproto account identity, PDS publication and proofs. Direct repo actions and
WebVH remain useful comparisons, with revisit conditions rather than mandatory
prototype paths. Host operator account login is a deployment option; the existing
private setup/access boundary can remain while the protocol identity changes.

## Review and validation status

These notes were independently assessed by `atseq-reviewer` in gitseq reports
`564ea662`, `bd453363`, `6352f14b` and `a71b29a4`. The revisions distinguish
identity observation from state derivation, make compromise recovery account-wide,
and reserve governance/succession/certifier powers for keys already appointed in
the genesis-rooted authority chain. The final review's participation-key boundary
clarification is included here.

The design direction is ready for prototype validation. The experiments below
have not been run; these notes do not establish a finished wire contract or
measured improvement.

## What exists

The app already has a PDS account DID (`src/host/application.ts`, `create`), but
the host generates a separate sequencer key and genesis pins activation keys.
Participant attribution is a P-256 `did:key`; the browser retains a local device
key and the CLI retains an exportable key. There is no account enrolment or
delegation evidence. Definition activation checks the pinned key list in
`src/application/folder.ts`, `interpret`.

`src/protocol/log.ts` binds retries to app, signer key and nonce. Its entries have
positions but no trusted timestamp. `src/browser/outbox.ts` and the CLI resend
the original signed bytes. Archives replay without network identity lookups.
Host operator access is a separate bearer-token boundary in `src/host/http.ts`.
`src/host/accounts.ts` provisions/logs into app accounts using local credentials.
The current PDS reader checks record CIDs and Atseq signatures; it does not
authenticate the native repository commit/MST (see [host guide](../docs/pds-host.md)).

The new design must cover those boundaries rather than adding only a login
button. The independent readiness assessment is gitseq report `8b871223`;
the alternatives below correct its historical-evidence and deletion assumptions.

## Identity, roles and starting trust

| Role                                | Proposed subject and authority                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| Human or independent agent          | ATproto account DID                                                                               |
| Device or agent acting for an owner | Distinct signer with an account-issued scope, grant ID and revocation rule                        |
| Application                         | App account DID and pinned genesis CID; genesis names governance and ordering policy              |
| Ordering service                    | Explicitly delegated sequencer signer; app repository authority is a deferred custody alternative |
| Definition/governance administrator | Explicit role; neither hosting nor ordering gives activation authority implicitly                 |
| Host operator                       | Account-authenticated management plus local deployment permission, kept separate from app roles   |

A DID is an identifier and controller mechanism, not proof of a human, uniqueness,
good behavior or entitlement to participate. Handles are discovery/display names.
Application admission and domain permissions remain application decisions.

A reader starts with a pinned app DID/genesis and an explicit policy for accepting
account-key bindings. An online reader can resolve current account authority;
an offline reader must already trust a retained binding, identity history plus
the necessary observation policy, or a designated attestor. An arbitrary DID
document bundled into an archive is not sufficient.

## Native identity and convenient adoption

ATproto currently supports account DIDs using `did:plc` and hostname-level
`did:web`. `did:key` can represent a signer but is not an ATproto account DID.
An account document supplies its repository signing key and PDS service.
Path-based `did:web` is unsupported; localhost/ports are development exceptions.
See the [ATproto DID specification](https://atproto.com/specs/did).

| Method / route                 | Adoption benefit                                                | Functional or trust limit                                                                 |
| ------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Existing `did:plc` account     | Reuse account, hosted PDS, handle and OAuth tooling             | PDS custody and directory ordering/availability; currentness still needs observation      |
| Hostname `did:web` account     | Publish a small HTTPS document on a controlled domain/subdomain | DNS/TLS/hosting trust, domain loss, no intrinsic historical proof or portable identifier  |
| `did:web` with WebVH companion | Web hosting with optional verifiable key history                | Additional keys/log tooling and trust anchoring; ecosystem still sees a `did:web` account |
| Native `did:webvh` account DID | Verifiable history as the identifier method                     | Not an ATproto-supported account method today                                             |

`did:web` support should not mean mandatory domain purchase or self-hosting.
People who already have an account can use it. A managed subdomain lowers setup
work but makes its provider part of the identity trust and recovery story. A
static DID document alone does not supply a PDS account or repository. Measure
the complete setup path, including account import and OAuth, not file publication.
The [account migration guide](https://atproto.com/guides/account-migration)
describes existing-DID import and self-controlled identity updates; test actual
PDS provisioning behavior rather than assuming every provider accepts it.

WebVH v1.0 has a self-certifying identifier, signed update history and optional
pre-rotation, witnesses and portability. It can publish a parallel `did:web`
document. Resolving only that export loses history verification. Portability
changes the WebVH DID string while retaining its SCID/history; it does not make
the exported web DID portable or automatically migrate an ATproto account.
See [WebVH v1.0](https://identity.foundation/didwebvh/v1.0/) and its
[repository](https://github.com/decentralized-identity/didwebvh).

Proposed use: retain the supported account DID; offer companion history as
optional evidence. Pin the companion SCID/log through an accepted account
observation, verify keys and export mapping, and prohibit silent assurance
downgrade. An unpinned alias fetched over HTTPS is not a new independent trust
anchor. A move needs explicit account rebinding; history authenticity does not
prove latestness, non-equivocation, ownership of a prior domain or social trust.
Do not require witnesses merely to enrol an individual; state what they add and
what their availability/governance costs are.

Keep WebVH out of baseline enrolment. Revisit it when an individual already has
companion hosting, or independent key-history audit is wanted beyond the default
sequencer observation. Its value and unsupported native-account status remain
documented in the adoption comparison.

## Action-attribution alternatives

| Candidate                                       | Durable attribution                                       | Main trade-off                                                                         |
| ----------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| OAuth login and host receipt                    | Host says which account submitted an act                  | Simple, but independent readers trust that assertion                                   |
| Account publishes each intent in its own repo   | Signed commit and MST record proof bind intent to account | Native publication; PDS write/proof needed per action, offline publication unavailable |
| Account publishes a scoped signing grant        | Repo proof authorizes device/agent key; key signs acts    | Offline signed participation; explicit grant lifecycle and ordered authority state     |
| Give clients the account repository private key | Direct signature                                          | Broad account signing authority defeats normal PDS/OAuth separation; avoid as default  |

OAuth authenticates a session and permits PDS operations; it is not a durable
signature over a particular intent. DPoP does not sign request bodies. Use
maintained clients, verify DID/PDS/authorization-server linkage and expected
token subject, and request narrow collection permissions. Browser/native and
server clients have distinct credential boundaries; do not reuse tokens or
DPoP keys across devices. See [OAuth](https://atproto.com/specs/oauth),
[permissions](https://atproto.com/specs/permission) and
[DPoP](https://www.rfc-editor.org/rfc/rfc9449.html#section-11.7).

Direct repo intents are a serious simple candidate for predominantly online
applications. Drafting can remain offline, but account publication is its
attribution event. Repository grants are the leading candidate when retaining
Atseq's offline signed browser/CLI/agent participation: OAuth is then needed for
enrolment and authority changes, not every act. Keep direct publication as a
written comparison; prototype it only if public per-account activity or absence
of offline signing becomes a concrete requirement. Do not combine both merely
to offer more modes; use the same principal and authorization result at the fold boundary.

## Retained evidence is not current authority

A native record proof authenticates membership or absence under a signed repo
root. The repo's revision is signer-controlled, and historical signing keys do
not prove when a commit was made. Its latest root should verify under the current
account key. See the [repository specification](https://atproto.com/specs/repository)
and [record proof endpoint](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/sync/getRecord.json).

PLC supplies signed linked operations, but recovery can nullify branches in a
72-hour window. Directory timestamps and fork ordering need trust; a collection
of valid operation signatures is insufficient to establish the canonical current
state. See the [PLC specification](https://github.com/did-method-plc/did-method-plc/blob/main/website/spec/v0.1/did-plc.md).

Counterexample: a retired repository key signs a new commit containing a grant
and an old-looking revision. A verifier accepting any key ever present in PLC
history admits unauthorized new authority. A WebVH history can have the same
currentness problem. An old root with grant membership also survives revocation.

For online admission, resolve the supported account DID, locate the authoritative
PDS, verify the current commit/key and exact record proof, and record the result
under a named observation policy. Follow account/key changes and revalidate
periodically; stream identity notifications are only hints. Sequential checks
are not an atomic globally current snapshot: a rotation/revocation can race them.
Specify a bounded observation/renewal policy and its trust in the observer rather
than claiming cryptographic global freshness. Resolver failure must be distinct
from a deterministic unauthorized act.

The authorized sequencer is the single default observer: its authority entry
attests the exact binding/key, record path, commit/proof CAR and observation
policy it accepted. It is accountable for the online check, not just ordering.
Additional independent observers are optional when a stronger policy is needed.
An account compromise or malicious participant PDS can publish grants; delegation
cannot distinguish them from legitimate account control by itself.

Historical audit checks signatures, evidence consistency and observed conflicts.
It cannot infer that a PLC rotation preceded an Atseq admission position without
a trusted relation between those timelines. PLC timestamps or an observer's
claimed time alone do not provide that relation. Stronger temporal audit needs
independent retained observations or another agreed time/freshness authority.

For plain `did:web`, retain a signed observer attestation of the HTTPS binding
and accepted key. That yields reproducible attribution under that observer's
policy, not independent historical DNS/TLS proof. An independently replaying
client can recompute the fold while still relying on this identity attestation.
State these assurance dimensions separately. Web identities should be usable
with an honest stated limitation rather than excluded behind a PLC-only rule.
Use the same contract for PLC and web principals; describe their differing
evidence/audit capabilities. Share the bootstrap plan's assurance vocabulary,
while keeping state derivation and account attribution as separate dimensions.

## Candidate authority contract

The following is proposed, not a finalized Lexicon:

```text
grant = { id, issuerDID, subjectKey, appDID, genesisCID,
          accountEpoch, role/actionScope, definitionScope, optionalLastPosition }
revoke = { grantID, issuerDID, appDID, genesisCID }
epoch-reset = { issuerDID, previousEpoch, nextEpoch }
intent = { principalDID, subjectKey, grantID, appDID, genesisCID,
           definitionCID, nonce, action, payload }
authority-entry = { position, evidenceCID, observationPolicyCID,
                    verifiedAccountKeyBinding, authorityChange }
```

Grant IDs are unique and immutable. Renewal/regrant uses a fresh ID. Evidence
includes account commit, exact record path/CID and MST proof, required identity
history/binding and observer attestation. Public payloads and proof CARs are
retained by CID; OAuth tokens and private device keys never enter the log.

Derive a grant/revoke/reset issuer from the authenticated repository commit DID
and its observed key binding, never from the record's `issuerDID` field. If that
field is retained, require equality with the derived issuer. Bind the proof to
the exact collection/record key and require intent principal to equal the grant's
derived account issuer. An attacker publishing a victim's DID in their own repo
cannot grant authority for the victim. Revoke authority must similarly match its
target account and app/genesis; account-wide reset authority must match the
authenticated target account.

Application role assignment and account-to-device delegation are separate
checks. App-owner governance assigns a role to a principal; that principal grants
a signer authority to act for it. A participant's own `role` field cannot appoint
it definition administrator or owner. Alternatively, an owner-granted signer
acts as the owner, with that delegation visible. These fixed two checks do not
permit arbitrary recursive delegation.

Certificate-chain powers (governance, recovery, sequencer succession and certifier
appointment) are exercised only by keys already bound in that authority chain,
never by account-delegated participation signers, including those acting as the
owner. Participation signers exercise domain actions and any explicitly appointed
participation-level roles, such as delegated definition administration if the app
permits it. Account epochs reset those delegations; app-control appointments
change through the chain. Shared grant format does not imply interchangeable powers.

Define whether a grant follows application evolution. The safe candidate default
for delegated actions is an exact definition CID (or explicitly enumerated CIDs).
Activating a different definition then requires renewal before new acts use it.
A persistent app role can deliberately span governance-approved definitions, but
must say so in its scope. Schema compatibility or reuse of an action identifier
does not imply unchanged authority: a `borrow` act could change from reservation
to ownership transfer. Compare the safety/setup cost of these two policies; do
not silently upgrade a device's delegated meaning during activation.

A middle policy can carry particular action authority across an activation when
governance explicitly declares that meaning is preserved. It trusts that
declaration rather than inferring it from schema compatibility. Compare its
friction and accountability with definition-bound grants; autonomous/high-risk
delegations can stay definition-bound. Renewal friction must be measured.

Sequence authority changes before dependent acts. A grant applies after its
accepted authority entry; an explicit revoke is terminal for that grant ID and
takes effect at its ordered position. Import failure is not a fabricated revoke.
Deleting a record is not the only revocation signal: nonmembership proves absence
in one supplied snapshot, not currentness, and delete/recreate of identical bytes
has the same CID. Prefer an explicit immutable revoke record to remove ambiguity.

Repository revocation and application-effective revocation are distinct. A
published revoke takes effect in an app when imported; a withholding sequencer
can delay it. Choose and document renewal bounds for grants, direct revocation
submission and monitoring. Position bounds give deterministic validity but do
not promise a duration in seconds or protect a stopped log. If real-time expiry
is required, define retained trusted time observations and their ordering;
never let each replaying verifier's clock change results.

Routine repo-key rotation, PDS migration or handle change does not revoke an
admitted device grant. Revalidation observes new bindings for new evidence; it
does not rewrite accepted grant state. Explicit revoke, deterministic expiry or
an ordered account-epoch reset ends authority.

Compromise recovery needs an account-wide reset, including apps and grants the
owner has never seen. Every participation grant binds the account epoch while
retaining its app/genesis scope. Publish the current epoch in one dedicated
account collection/record, retaining reset transitions by CID. At grant admission,
the sequencer checks against the observed current account epoch. For admitted
principals it monitors/imports later epoch changes, including evidence anyone
submits. Each app sequences the observed reset at its own position; one account
publication covers unknown apps as well, subject to observation/withholding limits.

A reset replaces the epoch and rejects all prior-epoch participation grants,
including later imports of previously unseen ones. New grants use the new epoch.
Bind reset transitions to the preceding epoch, use a fresh ID and reject stale
or replayed transitions. Do not define "issued before" using timestamps, TIDs or
commit revisions. The same current-account observation rules authenticate resets;
their app-effective boundary is the recorded position. Per-app resets are a
deferred finer-grained option, not the compromise-recovery mechanism.
An observer with a newer retained epoch rejects rollback. A malicious PDS can
still mislead a never-updated app by serving an older epoch; without a retained
newer floor or independent observation, a signed snapshot does not prove freshness.

Explicit app governance/recovery appointments are governed by the app's retained
authority certificate chain. An account-epoch observation cannot install new
governance keys or bypass already accepted governance/recovery approval. Reset
participation grants through the account record; revoke/replace app-control
appointments through a valid authority certificate. If no accepted recovery
signer survives, a new trust decision/new genesis is still required. The common
grant representation does not erase these distinct authority checks.

Stable accepted history is necessary. Later account recovery can cause a new
freeze/revoke/rebind entry, not silently change previous fold results. This
guarantees authorization under the recorded evidence and policy, not that future
identity recovery will agree with every earlier admission.

Domain acts should expose principal, signer and delegation separately. The fold
checks deterministic authorization before the domain transition. Structurally
valid but revoked/out-of-scope recorded work becomes ineffective; unavailable
required proof stalls at that entry. A transport may reject currently invalid
new work before ordering, but cannot reinterpret already accepted receipts.

One retry candidate is app/genesis, account principal and nonce, independent
of device rotation. Bind exact signed intent/evidence identity so a different
payload or grant under the same retry identity conflicts. An already recorded
retry returns its original receipt after expiry/revocation; it adds no new act.
An unrecorded offline intent sequenced after revocation is unauthorized even if
created earlier. Replacing it requires a new intent/nonce with current authority.

This nonce tuple is a candidate, not selected wire semantics. Random nonces avoid
central allocation but cannot prevent a cloned signer deliberately colliding.
Compare signer-local monotonic counters as specified in the bootstrap plan.
Bind principal through the exact grant and define the counter namespace across
grant renewal/key rotation. Keep original receipt lookup/content validation for
old retries; neither an account-level nonce tuple nor a high-water mark removes
that need.

Grant-to-agent-key is sufficient for an agent acting for an owner. An independent
agent uses its own account. Account-to-account delegation and recursive chains
need separate bounded semantics if a real use case needs them; do not assume
delegation is transitive or let cycles create authority.

## App ownership, sequencing and operations

Genesis binds the app account, one owner principal and initial governance/recovery
signer bindings, with explicit role grants.
Governance and recovery signer bindings use the same owner-issued grant format,
with role scope and retained genesis evidence; they are not a parallel identity
mechanism. A succession/certifier/governance certificate identifies app/genesis,
prior authority certificate/epoch, exact app predecessor and authorized successor.
It must be signed by already accepted governance, or by a replaced authority
explicitly permitted to transfer its own role. Governance-role changes require
governance approval. Retain this certificate chain from genesis for fresh-reader
verification, O(authority changes), without replaying every ordinary act. It
authenticates authority, not derived app state or unseen global non-equivocation.

Definition changes and emergency recovery require that governance; actor identity
does not confer authority merely by being first to submit or by hosting the app.

Compare native app-repository ordering with a separately signed delegated
sequencer, as described in the bootstrap plan. Native ordering reduces duplicated
proof machinery but accepts PDS signing custody. A separate sequencer keeps
ordering independent of PDS mutation and needs an ordered succession rule and
retained grants/key epochs. Neither is a consensus protocol: known floors detect
encountered forks; fresh readers cannot detect an unseen alternative alone.

For a separate signer, transfer authority at an exact entry/epoch and bind
successor evidence and predecessor. Define recovery if the old signer is lost
without requiring its signature: genesis governance must authorize that path.
The successor's first entry must name the exact predecessor and carry approval
verified under already accepted governance/recovery signer authority. A new
sequencer's assertion that it just resolved the owner is not sufficient to
authorize itself. A policy permitting recovery through fresh account control
needs independently authenticated evidence or a separately pinned recovery
observer; the failing or untrusted successor cannot supply its own trust bridge.
Start with previously granted governance/recovery signing keys. If those are
also lost, explicitly require a new trust decision/new genesis rather than
pretending offline replay can recover authority from a bare current DID document.
An owner-selected branch rule must also govern returning readers: if they already
accepted a conflicting descendant of that predecessor, their floor cannot be
silently replaced. Preserve both branches and require an explicit recovery choice.
Do not let current DID resolution retrospectively replace the ordering signer.
Native app-key rotation likewise requires current-key observation and archive
trust, rather than treating all historical keys as current authorities.

Writer recovery also needs write access to the app's PDS account. If those
credentials or hosting are lost, operational account recovery/migration is a
separate prerequisite; an authorized signing key alone does not supply access.

Host operator login can use ATproto account authentication followed by explicit
local access policy; it is not required by the initial protocol. Loopback setup
can retain its private credential/access boundary and use a bootstrap credential to
appoint the first operator. It is not a public application grant. App creation
needs an account-provider interface for an existing or newly provisioned account;
do not assume local password-based test provisioning is the adoption flow.

Public grants/intents disclose participating accounts, keys and app relationships;
revocation does not erase retained history. Require a first-run disclosure before
enrolment. If an application needs private participation, it needs a separate evidence and storage
design; public ATproto records cannot be made private by omitting a UI field.

## Browser, CLI and library adoption

Use ecosystem OAuth/resolution/proof libraries from
[ATproto](https://github.com/bluesky-social/atproto) or
[atcute](https://github.com/mary-ext/atcute). Keep account resolution and online
admission outside the deterministic runtime. The reusable library consumes
retained evidence and authorization results, while browser/CLI/host adapters
handle sessions and publication. Do not implement OAuth, PLC or MST from scratch.

Browser and CLI enrolment should support the same principal using different keys.
Publish actual client metadata and use supported redirect types. The localhost
OAuth exception is optional at servers and intended for development; a random
local browser shell cannot assume universal login. Compare hosted HTTPS shell,
native CLI callback and CLI-assisted local-shell enrolment on real providers.

The leading CLI/local-shell path is one publicly hosted HTTPS client-metadata
document for a public native client, with a loopback IP callback. The current
reference authorization server permits HTTP `127.0.0.1`/`[::1]` callbacks for
native clients; its matching code supports variable ports when the registered
loopback callback has no explicit port. This is separate from optional virtual
`http://localhost` development client IDs. See the
[metadata validator](https://github.com/bluesky-social/atproto/blob/main/packages/oauth/oauth-provider/src/client/client-manager.ts)
and [redirect matcher](https://github.com/bluesky-social/atproto/blob/main/packages/oauth/oauth-provider/src/lib/util/redirect-uri.ts).
Confirm actual provider behavior, callback ownership, state/PKCE and session/key
isolation on two providers before promising universal setup. Different browser
deployment types may still need distinct metadata/client identities.

Measure steps, elapsed setup, needed hosted resources, recovery and portability
as well as runtime performance. A claimed one-command experience must include
client metadata, DID/PDS account and key custody, not hide manual prerequisites.

## Experiments and done criteria

Use isolated, gitseq-tracked prototypes. First compare
`git diff --stat e082fc4e..HEAD -- src tests lexicons docs` and recheck code evidence
if it changed. Keep the main runtime untouched during design exploration.

1. Existing PLC account: publish a scoped device grant and locally signed intent.
   Capture exact repo/identity proofs and measure network dependencies, proof
   size, setup and offline behavior. Direct repo intents remain a written
   comparison unless the revisit condition above arises.
2. Enrol browser and CLI keys for one principal; authorize owner-agent key and
   independent-agent account. Attempt app/genesis/grant substitution, wrong-role
   activation, cross-key nonce reuse and exact retries across revocation. Change
   an action's meaning while retaining its identifier and schema; demonstrate
   definition-bound renewal versus explicitly persistent role authority.
   Publish a victim issuer DID in an attacker's repository; refuse the issuer
   substitution. Test self-issued administrator scope against owner role policy.
3. Sequence enrolment/revoke around queued acts; delete/recreate grants; omit a
   revoke notification. Demonstrate the renewal/ingestion limit instead of
   claiming immediate ecosystem-wide revocation.
   Recover an account, reset its epoch, and import an attacker-issued old-epoch
   grant never seen before the reset; it must remain unauthorized. Confirm that
   routine key/PDS/handle changes preserve admitted non-revoked grants.
   Include an attacker grant for an app unknown to the owner: one account-wide
   reset must invalidate its old epoch when observed, without a per-app owner
   action. Confirm that the reset cannot self-appoint new app governance.
4. Retire a repo key and have it sign a fresh old-looking root; reject current
   admission. Exercise PLC recovery/nullification and PDS migration. Previously
   accepted replay remains unchanged; recovery enters as new authority evidence.
5. Provision hostname `did:web` with PDS/OAuth, retain its binding attestation,
   and replay offline. Rotate/lose domain control and test unavailable resolution.
   A WebVH companion prototype is conditional on the adoption/audit need above;
   then compare pinned export mapping and domain move, and verify that unsupported
   native WebVH is not presented as an ATproto account.
6. Test app governance, writer succession/failover, native root authority,
   definition administrator grants and host operator access separately. Show
   what compromised PDS, operator and device keys can each do. Reject a successor
   self-attesting the owner's binding; test both a retained governance key and
   loss of all accepted recovery keys, plus an already observed conflicting branch.
   Include loss of PDS write credentials separately from loss of the signing key.
   Have a compromised owner account grant a new participation key that attempts
   a succession/certifier certificate; refuse it unless the existing authority
   chain separately appointed that key.
7. Delete sessions/tokens and disable all network access. Rebuild byte-identical
   state, outcomes, receipts and authority frontier in Node and Chromium from
   retained archives. Remove/tamper proof dependencies and require the specified
   invalid/stalled result, never a live resolver fallback.

Baseline verification is `npm run check` and `npm test`; existing patterns are
`tests/protocol.test.ts`, `tests/evolution-runtime.test.ts`, `tests/archive.test.ts`
and `tests/browser-sessions.test.ts`. A prototype must add fixtures for the cases
above and leave these checks green. Exact test names/commands for a new identity
prototype belong to its implementation request, once a contract is selected.

The design investigation is done when the leading grant path has concrete
evidence and deferred routes have explicit revisit conditions, every role has an
authority/recovery boundary, offline replay passes without credentials/resolution,
and web-identity setup/trust limits
are demonstrated. Stop and revisit the design if a shortcut needs private repo
keys in clients, live replay resolution, implicit authority or an untrusted old
key admitted as current. The checkpoint format must commit to the chosen
authority state and retained evidence before it can support fresh tail verification.
