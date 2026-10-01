---
date: 2026-10-01
status: independently accepted logical direction; wire and implementation pending
examined_at: 66977be7e59527eccf3df91c55285e55914f3add
request: 0e55c16d
promise: 942365bf
---

# Grants, account resets and application authority

Use one deterministic authority interpreter for account grants, explicit revokes,
account epochs, principal roles and app-control appointments. Keep participation
and app control separate. An account's PDS can issue its device grants; it cannot
appoint that account as app owner or turn its devices into governance keys.

The app PDS holding the repository signing key can construct another ordering.
This accepted custody choice also authenticates default identity observations
through app publication. It does not replace actor signatures or governance
certificates. The [adopted native authority decision](2026-10-01-atseq-native-authority-decision.md)
and [per-action compatibility decision](2026-10-01-atseq-activation-compatibility.md)
are the starting constraints. This proposal narrows delegated administration and
recovery to the smallest complete contract for independent review.

Joint independent assessment `91c4241c` accepts this direction with C1–C4.
This revision applies its custody, simplicity, descriptor and integer-bound
corrections. This is I2 design work, not implementation completion. I1's retained-identity
proposal at `c1a22945`, under review `51ef0861`, and N1's ordering contract remain
provisional. The logical fields below do not freeze Lexicons, encoding, record
paths, descriptor bytes, budgets or semantic-profile CIDs. No runtime,
dependency, build or acceptance tests were run for this note.

## Independently accepted choices

1. Give an optional app-appointed owner principal permission to assign domain
   participation roles. Its device still needs a live grant explicitly permitting
   this operation. Only app-control governance changes the owner appointment.
2. Ordinary grants name exact action references and C0 execution-contract CIDs.
   Do not implement a persistent cross-contract ordinary grant or infer carry-over.
   Activation requires an already appointed app-control governance key; owner
   participation grants cannot activate definitions. This deliberately chooses
   a narrower rule than the earlier notes' permitted delegated-administrator
   alternative.
3. Normal epoch changes follow authenticated account reset succession. Bypassing
   a participant's retained epoch branch or repository admission floor requires
   an already appointed app recovery key and a freshly observed, previously
   unaccepted account epoch. Current DID control alone cannot bypass those floors.
4. The recovery exception changes only that principal's future participation
   anchor and admission floor. It does not replace the app chain, prior outcomes,
   terminal grant tombstones, app-control appointments or other principals.
5. Keep one app chain. Recover native account access by restoring the exact
   accepted prefix and appending changes. An unreconcilable app-history fork
   requires an explicit new trust decision/new genesis; do not add a same-genesis
   branch-replacement protocol or silently reset a returning reader's floor.
6. Consume one retained observation per account-authority operation, including
   a well-formed operation that is ineffective. A new operation needs a fresh
   online observation; replay never performs a live check. A valid accepted
   observation may advance the admission floor even when the requested grant
   change is ineffective. That floor is observation state, not delegated power.

The logical choices are accepted; final wire and implementation still need
independent workroom review. In particular, choice 3 trades availability for a retained authority boundary: an
account recovered behind an app's floor needs that app's appointed recovery
custodian. Loss of all applicable app-control keys cannot be repaired by a new
DID document or a new owner participation grant.

## Starting trust and the two authority checks

A reader pins the app account DID and genesis CID externally. Genesis declares
native ordering, the supported semantic and observation policies, initial
app-control keys/powers, and the optional owner and initial domain roles. It does
not embed the native commit root containing itself: that would create a CID
cycle. Bootstrap publication root/key evidence is retained separately.

Each app-control appointment names an account principal DID and canonical signer
key, appointed by genesis or an effective certificate from already appointed keys.
The DID is the principal; the key is the signer. A certificate's claimed principal
must equal that appointment. The signer need not be its account's repository key
or a currently live participation device. App DID recovery credentials are a separate
operational capability. A certificate cannot provide missing PDS write access,
and account access cannot manufacture a governance certificate. Initial key/principal
pairs are explicit genesis trust. Retained account-to-key attribution evidence
belongs to bootstrap or appointment evidence under I1, outside the genesis CID
cycle; its precise proof requirement remains a joint decision. Account evidence
alone cannot install powers. Account reset or routine migration cannot silently
rewrite an already appointed control pair; change it through the control chain.

For each ordinary action, intersect two checks:

| Check                                                          | Source of authority                                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| May this key act for this principal on this action contract?   | One admitted, live, immutable account grant, with matching signer, app/genesis, epoch and exact scope. |
| May this principal exercise the action's required domain role? | The app's ordered role assignments and enforced action rule at that position.                          |

A grant's asserted role never supplies the second check. A role never supplies
a device grant. Select exactly one referenced grant per intent; do not combine
two grants' actions, roles or bounds. Another device's broader scope cannot
repair this intent's narrower grant. The applicable execution contract includes
any enforced definition role rule; a changed assignment is authority state rather
than a changed fold. C1/N1 must agree on the exact enforced-rule interface.

A principal may have a domain role before it enrols a device. Conversely, an
admitted device grant gives no app role. Identity is not entitlement. Optional
public/open participation is an explicit genesis or enforced definition policy,
not a default inferred from successful account resolution.

## Minimal account records

Use four logical account record shapes, published in the participant account:

| Record                | Logical contents and meaning                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grant                 | Unique ID, app DID/genesis, current account epoch reference, canonical subject key, exact ordinary action/contract scope, optional explicit role-administration scope. |
| Revoke                | Target grant ID and app DID/genesis. Explicitly and terminally withdraw that grant when imported.                                                                      |
| Epoch transition      | Fresh epoch ID and predecessor transition CID, or null for account initialization. Its CID identifies that immutable transition.                                       |
| Current epoch pointer | Exact current transition path/CID and epoch ID. The selected account root proves this pointer and transition together.                                                 |

Derive the issuer from the authenticated account repository DID, not from a
claimed grant field. If an issuer is redundantly encoded, require equality. Every
referenced account record must be at its declared collection/key and exact CID.
Grants/revokes bind this app and genesis; epochs are account-wide. A unique grant
ID must never be reused within its issuer/app/genesis namespace, across epochs
or after revocation. Globally fresh IDs are the publication recommendation;
a verifier does not claim knowledge of unknown repositories or applications.

A grant is immutable once admitted: store its exact CID and fields. A different
CID at the same source path is a conflicting admission candidate, not an edit to
accepted authority. A fresh scope/key needs a fresh grant ID. A repeated admission
of the same CID changes no delegated power. Deletion and recreation of identical
bytes yields the same CID and cannot undo a terminal revoke.

There is no position-bound or wall-clock grant expiry in the initial contract.
Explicit revoke and account reset withdraw authority. Participants cannot predict
positions advanced by others, and no concrete position-expiry need has been
identified. An intent signed earlier but ordered later uses authority at its
actual position. No timestamp, account TID or repository revision defines epoch
order. Time expiry would need a separately reviewed time authority and concrete
use case; do not infer it from publication or diagnostic timestamps.

Epoch transitions and grants retain separate identities. Every fresh epoch
changes authority even when the participant key is unchanged. A reset record's
predecessor is a transition CID, not an inferred time. A current pointer update
alone cannot authenticate missing transition bytes.

## Minimal retained app state

The authority state contains:

- The genesis-rooted control tip and current appointed key/power map; the optional
  owner principal and current domain-role assignments.
- For each observed principal, its current epoch anchor, previously accepted
  epoch IDs/CIDs, and its last accepted account observation floor: repository
  revision/root and retained identity binding reference.
- For each referenced grant ID, its immutable admitted CID/fields or terminal
  revoked marker. An unknown ID can acquire a revoked marker before admission.
- The operation consumption/frontier information needed to forbid reuse of an
  observation and to perform exact expected-state checks.

A retired epoch never becomes current again in this app. Old grants remain
inspectable but are inactive after epoch replacement. Epoch replacement need not
walk every grant: liveness compares each grant's epoch with the current principal
anchor and checks its terminal marker. This avoids a reset cost proportional to
all devices and prevents a never-seen old-epoch grant from slipping through later.
A checkpoint must retain enough state to preserve tombstones, epoch non-reuse,
observation consumption and the control tip; a digest alone is not usable state.

All app authority, role, retry, checkpoint and floor state is keyed by the full
`(app DID, genesis CID)` identity, even when several apps share one account.
Participant epochs are account-wide publication, but their imported anchors and
effective boundaries remain separate for each app. Sharing verified content blocks
by CID does not share app authority. Existing DID-only host maps/leases need the
N1 implementation audit before repository reuse is supported.

Reconstruct this state from ordered retained evidence on restore. Host caches,
OAuth sessions and fresh resolver responses cannot substitute for it. P3/P4 own
its bounded checkpoint encoding and consistency with state/definition/frontier.
Each role assignment retains a revision/identity so a device can sign an exact
expected assignment; an ineffective attempt must not silently reinstate an
intervening role change.

## One deterministic transition interpreter

The logical interface is:

```text
interpretAuthority(prior, appContext, operation, retainedEvidence)
  -> { nextAuthority, outcome }
  | invalidHistory
  | stalled
```

`appContext` supplies pinned app/genesis, candidate position, exact app predecessor
and the relevant expected authority frontier. Positions are safe integers from zero through `Number.MAX_SAFE_INTEGER`
(9,007,199,254,740,991); entry positions are positive. Refuse a new append before
addition would exceed that limit. N1's 16-digit padded position remains lexically
ordered, but padding does not admit all 16-digit integers. The wire review validates
the full canonical genesis CID plus period plus padded position against record-key
length/characters; never truncate a CID. N1 validates the containing native
root, entry chain, actor/control signatures and retry identity; I2 verifies the
specific authority transition with the same context. Shared validation can be
implemented once rather than duplicated between host and replay. All returned
changes, domain results and frontier persistence must commit atomically.

There is no resolver, clock, token lookup or hidden current-state cache in this
function. Online preparation obtains I1's bounded observation and native proofs;
replay interprets the same retained bytes. Missing evidence stalls before any
consumption or state change. Invalid structural evidence fails closed. Once a
well-formed operation is interpreted, an ineffective outcome still advances its
ordered app position and consumes its observation, where applicable. A second
consumption of that descriptor is invalid history, in parallel with a duplicate
R0 actor request; the host refuses it before ordering. Readers consult the retained
consumed-descriptor index without reinterpreting the previous authority operation.
Fresh observation bytes/context produce a different descriptor, not a second use.

An observation names exactly this logical operation and its exact subject
records. Bind it to the expected app predecessor/position, operation kind,
principal and record paths/CIDs without a self-referential CID: the operation may
reference the descriptor CID, but the descriptor cannot simultaneously commit to
that resulting operation CID. N1/I1 choose a non-circular context/digest or nonce
binding. A descriptor listed as evidence for one operation cannot authorize a
second operation, even a byte-identical attempted re-admission. No extra observer
signature duplicates native app publication under the default policy.

Account operations use one descriptor for all their relevant account evidence:
current epoch pointer/transition and grant for admission, current pointer/reset
path for progression, or the exact revoke record for revocation. A revoke needs
no still-present target grant or unnecessary epoch proof.
Admitting a grant may initialize or advance its principal's epoch in that same
operation; this is one transition, not descriptor reuse by two entries.
Destructive recovery uses one account observation plus its appointed control
certificate. A pure role/control operation needs no participant resolution unless
it also claims an account-authority change; it uses its established signer and
retained appointment/grant state.

## Ordinary account transitions

| Operation                                 | Preconditions                                                                                                                                                                                         | Result                                                                                                                                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initialize principal / admit grant        | Fresh valid I1 observation; complete required grant/current-epoch evidence; app/genesis and subject match; current epoch equals grant epoch; ID not conflicting or revoked; normal floor rule passes. | Establish the observed current epoch as this app's initial anchor, pin grant CID, retain observation floor. Initial anchor need not retrieve all resets before this app knew the principal. |
| Admit another grant                       | Same checks; current observed epoch extends the app's retained epoch through required linked resets, if different.                                                                                    | Atomically advance epoch if necessary and pin the fresh grant. Unrelated grants remain as stored; only current-epoch ones can act.                                                          |
| Advance epoch                             | Fresh valid observation proving the current pointer and the complete new transition path back to the retained epoch; no reused ID/CID or conflicting transition; normal floor rule passes.            | Retire old and intermediate epochs, set the observed current epoch, deactivate every older-epoch grant, retain new floor.                                                                   |
| Revoke grant                              | Fresh account observation proves exact explicit revoke for this issuer/app/genesis/ID; normal floor rule passes.                                                                                      | Set an irreversible tombstone, including for an unadmitted ID. Other grants and app roles are unchanged.                                                                                    |
| Repeat revoke / identical grant admission | Valid observation and exact records, but no new delegated change.                                                                                                                                     | Stable ineffective/no-op reason; consume observation and retain its accepted normal floor.                                                                                                  |

An app that first sees the account starts from its freshly observed current epoch,
not from an implicit universal epoch zero. A grant cannot supply the anchor by
itself. A never-seen grant from before a reset fails the current-epoch comparison,
including in an app unknown to the owner when the reset was published. This
statement depends on the currentness policy: an observer deceived into accepting
an authentic old account branch can still start a fresh app on that old epoch.
It is not global knowledge of the newest account state.

For a returning app, a different current epoch must connect to its accepted
anchor. A missing link stalls; an authenticated conflicting path is ineffective
as ordinary progression. The host must not silently treat that account as new.
A malformed/cyclic reset structure is invalid evidence. An authentic stale,
conflicting or reused epoch candidate is ineffective ordinary progression; never
return to a retired epoch. The same chain validation and bounds apply online and offline.

Retained account records can be recovered from retained authenticated evidence;
new transitions still need the exact selected-root proof required by I1. A long
unobserved reset path can exceed the observation policy's resource budget. Report
that limit and stop admission. Do not silently truncate it or infer order from
revision numbers. An explicitly reviewed destructive recovery with a fresh epoch
is the escape path; changing budgets is another explicit policy decision.

Importing a revoke does not require re-admitting its target grant or pretending
the grant is still present. A participant may delete a source grant after
admission; its app authority survives until an ordered revoke or reset. **Deleting the source record does not revoke the app grant.** A revoke for
an unknown ID remains a tombstone against later old or new-epoch import of that ID.

Monitoring periodically refreshes known principals and accepts direct submissions
of public revoke/reset proofs from anyone. The host renews I1 observation for the
operation rather than trusting the submitter or an old proof's claimed currency.
Submissions, polling and stream hints can prompt processing; none changes replay
by itself. Each app's imported reset/revoke position is the effective boundary.
There is no promised number of seconds to revoke, and a withholding app PDS or
ordering service can prevent import altogether.

## Observation floors and the explicit recovery exception

Normal new account-authority admission accepts a greater repository revision, or
the same revision and root. A lower revision or a different root at the same
revision is a stable ineffective admission refusal. Revision is a signer-controlled
ordering field, not proof of time or continuous history. This rule does not
retroactively invalidate an already accepted observation or an earlier grant.
A normal accepted observation advances the floor independently of whether the
requested delegated change succeeds. Missing/invalid evidence cannot do so.

Routine repository-key rotation, PDS migration and handle change preserve accepted
grants and epoch state. They do not lower the floor automatically. A recovered
account or copied backup may legitimately have a lower revision or a conflicting
epoch branch; the default availability cost is that new admission stops until
an explicit authorized recovery occurs.

`recoverParticipant` requires all of:

1. A certificate signed by a key already holding the app's `recover` power at
   the immediately preceding accepted control tip. Its app/genesis, exact app
   predecessor, control tip and expected target principal epoch/floor are bound.
2. Fresh I1 observation of that same principal proving its current epoch pointer
   and exact reset transition under its current native binding. The selected
   epoch is fresh to this app: neither its ID nor CID was previously accepted or
   retired here. If a backup points to an old epoch, publish a new reset first.
3. An explicit replacement operation naming the previous accepted epoch/floor,
   the new anchor and the newly selected root/revision/binding. The certificate
   authorizes that exact exception; it cannot be silently retargeted after a race.

This permits a conflicting account predecessor path or lower repository revision
as a documented replacement, without declaring it ordinary succession. Store the
exception and new observation floor in retained authority history. Keep every
prior epoch retired and every grant tombstone terminal. Existing grants remain
inspectable and inactive; none is rebound to the new epoch. Re-admission uses a
fresh grant ID and exact current scope.

A current participant DID document, valid new repository signature, new owner
session or participation grant cannot authorize this exception alone. A recovery
certificate also cannot fabricate a participant's native reset proof. The default
I1 observation trust remains in force; a compromised app PDS can publish dishonest
observations but cannot forge the independent appointed recovery signature.

If all eligible control/recovery keys are lost or removed, the exception is
unavailable. Preserve history and report the limitation. A new trust decision/new
genesis is required rather than manufacturing a replacement authority. This is
an explicit review choice, not evidence that routine migration revokes grants.

## Owner-assigned roles and app-control certificates

The optional owner is a principal appointed in genesis or by an effective
`govern` certificate. This is a role administrator, not an inferred property of
being the first account, app host, PDS operator or person who owns a domain.
There need not be a commercial owner or any owner principal at all.

An owner device may `assignParticipationRole` only when its one referenced grant
is live and explicitly permits the target domain role. Bind target principal,
role, enabled/disabled decision and exact expected assignment revision in the
signed request. The app must still recognize the signer principal as its current
owner. The operation is an ordered change to app entitlements; it is not an
account grant and needs no newly resolved target account. That account must later
admit its own signer before using the role.

Owners may assign only domain participation roles. Reserved control powers and
the owner appointment itself cannot be targets of this operation. Removing an
owner blocks its further role administration; it does not implicitly revoke
all its ordinary device grants or erase already effective assignments. Governance
can remove those assignments explicitly. If there is no owner, `govern` keys can
set domain roles through the control chain. A compromised owner's account PDS can
issue role-administration grants and exercise its assigned power; that custody
is disclosed. It cannot expand the set of permitted app-control operations.

Keep one control certificate chain rooted in genesis. Every certificate binds
app/genesis, its previous control tip, exact app predecessor/position, signer and
one declared operation. Verify powers against the prior appointment map before
applying changes. A certificate cannot appoint its own signer and then use that
appointment within the same transition.

| Control power | Allowed operations                                                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `govern`      | Appoint/remove/transfer control keys and powers; set owner or domain roles; activate a definition with C0's exact expected/target source and validated compatible closure. |
| `recover`     | Exact destructive participant epoch/floor recovery; reappoint lost governance through a certificate when genesis policy grants that recovery operation.                    |
| `certify`     | Sign the explicitly selected stronger checkpoint assertion policy; no appointment, role or reset powers.                                                                   |

Genesis must declare the exact power transfer/removal rules and whether `recover`
can replace governance. Recommend enabling that recovery by default, with an
independently held recovery key. Self-transfer is allowed only for a power whose
prior policy explicitly permits it; a certifier cannot appoint its replacement
by merely signing a checkpoint. A `govern` key can appoint a new key through the
ordinary chain; an already effective recovery appointment is required to recover
a lost governance key. Removing the last applicable recovery/governance key has
the stated loss consequence, not an implicit account-control fallback.

Activation is an app-control operation, with exact active and target definition
CIDs and the complete retained source closure. Ordinary participation role names
such as “administrator” do not authorize it. A view-only successor does not waive
the exact expected-source check. Two simultaneous successors from the same source
can produce at most one effective activation; the other is ineffective. A control
certificate's predecessor/frontier bindings mean it must be deliberately issued
again after a CAS/order race, not transparently re-signed by the host.

The default checkpoint assertion is native app publication under genesis policy;
there is no separate certifier signature. A `certify` appointment matters only
when an explicitly stronger policy is selected. It cannot certify its own
appointment. The authority chain authenticates powers, not state correctness or
unseen global non-equivocation. P4 must retain the relevant authority chain and
state/identity assurance distinctions.

## Native account recovery and conflicting app histories

App DID control recovers native publication; app certificates recover domain
control. Neither supplies the other. A2 must establish actual provider permission
and operational custody for app DID recovery, including independent higher-priority
PLC rotation authority where supported. This note does not claim those trials
have been run or that every provider permits that setup.

Recover or migrate the app account, republish the exact accepted genesis/entry
prefix, observe the new native binding, and append authorized control changes.
Native key-only commits are not new app positions. Preserve app positions and
predecessors; a PDS backup is not permission to forget a later accepted receipt.

If a returning reader has already accepted a different descendant, normal sync
rejects the conflict even when the new native root is authentic. Our minimum
proposal supplies no same-genesis app-floor replacement. Preserve both histories.
Restoring the reader's exact accepted prefix can resume that reader; two genuinely
divergent accepted branches cannot be merged into one linear prefix. Choosing an
unreconcilable branch is an explicit new trust decision/new genesis, not a normal
participant recovery or an automatic governance succession. Stronger branch
reconciliation can be reviewed separately if a concrete use case requires it.

For that new-genesis escape, the operator explicitly selects the new
`(app DID, genesis CID)` pin and independently establishes owner/domain-role and
control-key appointments, publication access and operational recovery custody.
Existing uncompromised keys and the same owner principal may be deliberately
reused; their powers are granted anew in the new scope, never inherited from the
old chain. The handoff record and UI preserve both old branches and identify the
break in trust. Operator consent is a new trust choice, not a certificate proving
the old app authorized succession when its accepted governance keys are lost.

Joint assessment `91c4241c` accepts genesis-scoped native paths: publish the new
genesis/head/entries in a distinct namespace in an existing trusted or recovered
app account. Identity remains `(app DID, genesis CID)`; a fresh DID is not required
for authority isolation. Never overwrite the old namespace or relax its floors.
A dedicated new account remains an operational choice, and the fallback when old
account control or PDS custody is lost/untrusted. Selected-root absence does not
prove that a repository never held a deleted application.

For production or busy accounts, recommend a dedicated app account. In a shared
personal account, ordering custody includes the PDS, ordering host and every
credential holder with write access to the Atseq collections, including third-party
clients with broad OAuth permissions or app passwords. Subject to the permissions
they hold, those writers can reorder, withhold, fork or delete records; they cannot
forge uncompromised actor/control signatures. The host must publish with OAuth
credentials scoped to the Atseq collections, never an app password. Logical
namespaces do not isolate repository signing or collection-write custody. Unrelated
account writes also lose `swapCommit` races and enlarge diffs; N1/E1 measure that
cost rather than promising repository reuse is free.

Start from the new genesis's explicitly validated initial definition/state.
Reusing old domain data requires a separately authored, validated initialization
or reviewed import mechanism, with provenance shown to the operator; do not
promote an old checkpoint assertion into independently verified new initial state.
No automatic state migration is part of this minimal escape.

A new scope requires a different canonical genesis CID. Reusing identical bytes
in the same account does not create it. N1 must select a bounded explicit creation
discriminator or independently authored different initialization before publication;
a new display name is insufficient. Never overwrite an existing identical scope.

Old intents, grants and receipts continue to name the old app DID/genesis. They
remain historical evidence and cannot act under the new scope. Re-enrol the same
participant, if desired, with a fresh grant ID for the new app/genesis and current
account epoch. Reusing a device key does not reuse its authority. Queued work is
replaced only by deliberate human save or agent instruction, newly signed app
scope and R0 retry identity. Never reinterpret, re-sign, silently carry over or
discard its old bytes or receipts. Returning readers must explicitly approve the
new pin; discovery or an operator's announcement cannot update it automatically.

## Verdicts and concrete races

| Case                                                                                                                                                                                                                             | Required interpretation                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing/malformed principal or grant reference, actor signature invalid, wrong request/envelope app/genesis, broken app chain, unsafe-integer position, reused retry or second observation-descriptor consumption inside history | Invalid history; host refuses before ordering.                                                                                                                  |
| An authority operation claims grant/reset/revoke/observation bytes which are unfetched                                                                                                                                           | Stall with no partial state/frontier/consumption update.                                                                                                        |
| A complete selected root proves a claimed required evidence record absent, or its exact CID/proof is invalid                                                                                                                     | Invalid history/proof package.                                                                                                                                  |
| Complete authority state has no admission for a well-formed grant reference                                                                                                                                                      | Ineffective unadmitted grant, without resolving the account.                                                                                                    |
| Authentic action has a revoked, old-epoch, wrong signer or out-of-scope grant; lacks its app-assigned role; or execution CID differs                                                                                             | Ineffective with stable reason. Invalid actor signature is checked first and remains invalid history.                                                           |
| Authentic grant candidate belongs to another app scope, has an already pinned ID with a different CID, or a terminal tombstone                                                                                                   | Ineffective scope/conflict/revoked admission; never mutate accepted grant.                                                                                      |
| Valid observation is below the admission floor, conflicts at equal revision, or reset path conflicts with the epoch anchor                                                                                                       | Ineffective ordinary admission; existing history remains accepted.                                                                                              |
| Unknown semantic policy, genuine interpreter/integrity fault, or failed local persistence                                                                                                                                        | Interpretation unavailable/stalled, not a replicated domain denial.                                                                                             |
| Account role assignment is stale or exceeds the live grant/current owner permission                                                                                                                                              | Ineffective; no entitlement changes.                                                                                                                            |
| Certificate uses an unappointed key, stale control tip/predecessor, or exceeds its previously assigned power                                                                                                                     | Well-formed signed control request is ineffective; malformed/invalid signature is invalid history. N1 must preserve the distinction when wrapping certificates. |
| Valid activation omits a dependency in its supplied complete closure or has incompatible source/state/runtime                                                                                                                    | Ineffective invalid activation, distinct from unfetched transport evidence.                                                                                     |

Queued device work signed before revoke/reset but ordered afterward is ineffective.
A recorded exact retry afterward returns the original receipt and outcome; it is
not evaluated or appended again. R0 owns the retry namespace. I2 does not create
a replacement nonce or change signed bytes. Exact proof-derived operation retries
likewise return their original receipt rather than consuming a descriptor twice.
A fresh observation bound to another context is a different authority operation,
even when it refers to the same immutable grant; it may produce the explicit
no-op/floor update above. N1 must fix that operation identity without inventing an
actor nonce for account-native proof imports.

An attacker with a device key can sign only within that grant and the principal's
current app entitlement. An attacker with account-PDS repository-key custody can
publish another grant, revoke or epoch reset; account publication is not proof
of a separate user interaction. Neither can forge an uncompromised already
appointed app-control signature. A malicious app PDS can reorder valid signed
work, withhold changes and invalidate or fork a log. Floors detect encountered
conflicts, not unseen alternatives for a fresh reader.

With the proposed default signed PLC history, invented bindings for an existing
PLC DID require an authorized operation chain, but authentic old histories,
unsigned directory branch metadata and withholding can still support stale
observations. For hostname `did:web`, a compromised app observer/PDS can fabricate
retained DID response bytes and grant proofs for any claimed principal under the
weaker observation-only policy. No note here upgrades either policy to proof of
global currentness. Identity assurance and deterministic authorization are separate.

An account key rotation between I1's before/after checks can prevent new admission.
Two equal observations do not prove uninterrupted currency. A later PLC recovery
or domain change does not rewrite past folds: it leads to a new ordered reset,
revoke or explicitly authorized recovery. Resolver/PDS outage prevents new
admission but does not suspend already admitted offline device authority.

## Implementation and evidence after review

Coordinate N1/I1 before freezing operation contexts, evidence record requirements,
certificate bytes, power scopes and descriptor consumption. Confirm C1's enforced
role interface. Version the global semantic contract for these rules and C0's
execution metadata; do not silently reuse the spike profile. Keep dependency
provenance separate from authority/semantic identity.

Required Node and Chromium fixtures include one principal with browser/CLI/agent
keys; issuer/app/genesis substitution; two grants without scope union; forged
owner/admin claims; assigned role without grant and grant without role; owner
replacement; explicit role revision races; exact per-action contract changes and
unrelated-action preservation; grant deletion/recreation and conflicting CIDs;
terminal revoke before first grant admission; reset of already known and never-seen
grants; unknown-app initial anchor; missed reset succession and missing/overbudget
links; retired epoch reuse; migration preserving grants; lower/equal-conflicting
revision floors across restore; fresh account recovery without app certificate
refusal; appointed recovery with fresh epoch acceptance; old backup epoch refusal;
loss of all control keys; governance/certifier self-appointment; control/activation
predecessor races; app write loss; conflicting reader branches; exact retries after
revocation; and offline retained replay with network/tokens unavailable.

Capture byte-identical authority states/outcomes across runtimes and checkpoints.
Delete one required proof block to demonstrate stalled replay, then supply complete
absence to demonstrate invalid history. Show that an authentic unadmitted grant
is ineffective. Record actual provider/rotation trials separately from deterministic
fixtures. Report observation/proof/state sizes and operational limits without
claiming revocation latency or performance targets that were never measured.

The recommendation is one interpreter, four account record shapes, one app
control chain, exact per-action grants, and no implicit identity-based recovery
or general delegation graph. Every stronger policy or extra recovery mechanism
needs a concrete need and independent decision before adding another authority path.
