---
date: 2026-10-01
status: independently reviewed and adopted logical direction; final wire and implementation pending
examined_at: cdc17356b4ec9df19d3d0cd52b96d99867d9b154
request: fea766bc0c93b73199c016d1a402ef251e0d42f5
---

# Native application ordering and portable receipt requirements

Use the application account's native signed repository root to authenticate
publication. Keep Atseq's explicit position and predecessor chain to define
application order. Actor signatures authenticate consent; ordered authority
determines eligibility; interpretation determines effectiveness. No extra
ordering or identity-observer signature is needed in the default model.

The [adopted authority decision](2026-10-01-atseq-native-authority-decision.md)
supplies this custody choice: the app PDS holding the repository signing key can
construct another ordering. This proposal makes its logical ordering and
retention requirements concrete. It does not freeze I1/I2 identity fields,
Lexicons, parser rules, semantic profile names or final encoding, and it does
not implement N1. Independent assessment
`91c4241c0174fe6ecfa67f6d891bec6e817af3f9` accepted the joint I2/N1 direction;
this revision incorporates its C1–C4 corrections. Final wire, certificate bytes,
semantic identity and implementation still require their own review gates.

## Inputs and current implementation

The examined main still has a separate sequencer key and per-entry ordering
signature in [the log](../src/protocol/log.ts). Its
[sequencer](../src/host/sequencer.ts) conditionally writes an entry and head,
then rereads to confirm persistence, including after a lost response. Its reader
compares repository revisions around ordinary JSON reads and verifies the app
chain. Native membership verification must replace that JSON-read trust boundary;
merely removing the ordering signature would leave publication unauthenticated.

This proposal also uses these parallel candidates and adopted directions:

- P1 successor `ebe3cf9735d16ab85ab880a36f9425f7d49a425c`: the maintained native
  proof API, not a claim that this candidate has landed or implements N1.
- R0 direction at `266ad025473108d58f8b1be0de2a5fd71b1a5d32`, accepted under
  corrected assessment `981bbcd7c276a3b4b1974b842f2a71fc966aa06f`. Its full
  assessment is `a9a8c63cee9d8531856cc6f1dc244fbc93161b7d`; the corrected report
  attaches the same assessment to R0. This supersedes the old principal-based
  retry candidate in the identity note.
- [C0 per-action execution scope](2026-10-01-atseq-activation-compatibility.md),
  preserving exact source expectations for activation.
- B0 at `a357f34288851399562a2fb85e588113074f96b1`: lean versioned source
  description, with complete retained source requested explicitly. Discovery
  does not establish the active definition without verified interpretation.
- I2 logical proposal at `f70ac4fabb6635963f5fe72004ad89ff6c9e7abd`, coordinated
  with its owner. Its fields and encodings remain subject to the I1/I2 reviews.

Primary ATproto material was checked on 2026-10-01. A repository is a mutable
record map authenticated by a signed commit and MST. Record deletion does not
retain a historical tombstone. Commit `prev` is normally null, so Atseq cannot
use it as its application chain. These are native boundaries from the
[repository specification](https://atproto.com/specs/repository), not additional
Atseq guarantees.

## Minimal logical records and account scope

Use native paths scoped by genesis, supporting reuse of an existing trusted
ATproto account. Recommend a dedicated account for production or busy ordering;
existing-account reuse remains useful for trusted, low-volume operation.
This replaces the first draft's assumption that every app
needs fixed `self` paths and a separate account. Collection names, integer
bounds and canonical path derivation still belong to the wire review.

| Logical record | Required meaning                                                                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Genesis        | App DID, explicit native ordering model, semantic contract, initial source definition, observation/certification policy and initial appointed control keys/powers. Initial participant roles may be empty. |
| Head           | App/genesis, last ordered position and exact entry CID; position zero points to genesis. No domain-success claim.                                                                                          |
| Entry          | App/genesis, consecutive position, exact predecessor CID and one typed operation with its signed request or required retained evidence references. No separate sequencer signature.                        |
| Receipt        | Original unsigned request identity, position and entry CID, plus an exact selected native publication root and sufficient retained membership/key-binding evidence for its declared verification scope.    |

Genesis identity is externally pinned as `(app DID, genesis CID)`. Genesis must
not embed the commit root that contains itself: that would make a CID cycle.
The bootstrap publication root and its accepted key binding are separate
evidence. Likewise, an entry cannot embed its containing publication root.

### Compare account and path choices

| Choice                                           | Adoption and operation                                                                                                                                                                                                     | Additional contract or cost                                                                                                                                                                                     |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One app per account with fixed `self` paths      | Simple singleton lookup; dedicated account can isolate repository-key custody, lifecycle and CAS traffic. Each additional app needs another account's provisioning, credentials/session, handle and recovery arrangements. | Does not accommodate another genesis alongside the first. Lost control or conflicting histories require another account under this convention. It still needs external genesis pins and native proof retention. |
| App DID plus genesis-scoped paths in one account | An individual or agent operator can reuse a trusted account and its hosting/recovery setup. Independent apps and an explicitly chosen replacement genesis can coexist with retained old histories.                         | Derive and validate bounded record keys; isolate app state/floors by the pair; writes still contend on the whole repository commit. All apps share account/PDS custody and lifecycle.                           |

The adoption advantage is supported by native structure and current source,
not a measured provider trial. The
[account specification](https://atproto.com/specs/account) gives each account
its own identity, hosting, authorization and lifecycle. The current
[local account helper](../src/host/accounts.ts) creates and persists a distinct
handle/password/session per creation ID. Requiring that process for every
coordination app imposes repeated account management. In contrast,
[Anchor](../src/protocol/log.ts), host method parameters and R0 already identify
the scope by app DID **and** genesis CID. They need no new global app identifier.

The native [record-key specification](https://atproto.com/specs/record-key)
supports `any` keys for known-path lookups and permits the base32 characters and
period used below, within its 512-character bound. A canonical 59-character CID
plus a period and a 16-digit position is 76 characters. The final contract must
check its admitted CID and integer widths explicitly. Positions are positive
safe integers, at most `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991), padded
to exactly 16 decimal digits. The full 16-digit decimal range is not admitted.
Validate every derived rkey's native character set and length; never truncate
a CID or introduce an alias hash merely to shorten these paths.

```text
<genesis collection>/<canonical genesis CID>
<head collection>/<canonical genesis CID>
<entry collection>/<canonical genesis CID>.<fixed-width position>
```

These are ordinary two-segment native paths; the collection placeholders stand
for owned Atseq NSIDs. Genesis and head share the same rkey in different
collections. Derive entry keys from the pinned genesis and declared position,
then check the record's target, position and predecessor against that derivation.
The full CID prefix separates genesis scopes; fixed-width positions preserve
lexical order within one scope. No registry, new Merkle index or authenticated
alias service is needed. A reader given `(app DID, genesis CID)` derives all
required paths directly. Optional app listing is discovery, not a prerequisite
for opening a pinned app.

Compute canonical genesis bytes and their CID before writing. The path is an
external name derived from those bytes, not a field inside them. An entry names
the already computed genesis CID, avoiding a cycle. Identical genesis bytes
produce the same scope: opening that scope is idempotent, not a new application.
Creating an otherwise identical fresh scope needs a bounded explicit creation
discriminator in genesis; its field/encoding is a wire-review choice. Persist
the creation choice before publication so a lost reply cannot create another
genesis accidentally.

"Immutable genesis" and append-only entries remain Atseq acceptance rules,
not PDS enforcement. Provision only the selected genesis namespace. If its
genesis/head already form the exact valid app, reconcile and return it without
resetting its head; contradictory or orphaned selected records refuse creation.
Other genesis namespaces are allowed. An absent current path never proves that
its scope was never used or deleted. Preserve existing pins/floors and reject
rollback even when the PDS deletes and recreates the same paths.

Share unchanged retained source and proof blocks by CID where practical. That
does not merge app authority, retry indexes or projections. Source staging and
one app's writes can alter the native root used by another app; `swapCommit`
will make concurrent writers refresh. A shared local account publication
coordinator can reduce needless CAS collisions, but native CAS remains the
boundary. The repository revision/key-binding cache is account-scoped; app
positions, outcomes, control chains and floors are genesis-scoped.

There is real implementation work beyond string concatenation. The current
[host registry](../src/host/application.ts) is keyed only by app DID, and the
[writer lease](../src/host/lease.ts) holds one DID-keyed head row. N1/P3 must
isolate those app records by `(app DID, genesis CID)` while sharing account
access safely. Archive expected-pin selection and browser/outbox storage also
need a pair-scoping audit. This is bounded integration work, not an additional
ordering authority or Merkle structure.

Sharing a repository does not isolate custody. Every credential holder able to
write the Atseq collections shares ordering custody, including a third-party
client with an app password or broad OAuth scope, as well as the host and PDS.
Such a writer can reorder, withhold, fork or delete records; it cannot forge
uncompromised actor or app-control signatures. Account deletion, migration and
key recovery affect all hosted apps.

The production host must publish using OAuth credentials scoped to its required
Atseq collections and operations, never an app password. The
[permission specification](https://atproto.com/specs/permission) supports
collection/action scopes; it does not provide a genesis-rkey permission boundary.
Collection scope protects unrelated record types, not sibling Atseq apps in the
same account. A2 must test actual provider support and enforcement; do not
silently broaden production credentials when a provider lacks it. The existing
password/session provisioning helper is an explicit exception only for
disposable development fixtures, not a production access model.

App-control keys may differ by genesis, but they do not remove shared native
ordering custody. Recommend dedicated accounts for production or busy use to
limit credential exposure and unrelated CAS losses. Full-export recovery may
include other apps and unrelated public records; measure transfer and contention
before recommending a crowded account.

The small path rule buys account reuse and a concrete new-genesis escape using
existing native facilities. There is no evidence yet requiring a separate
account for every app. Genesis-scoped paths are the accepted protocol direction,
with dedicated accounts recommended for production or busy operation. Native and provider
conformance, permission behavior and multi-app costs remain implementation
gates; no measured adoption or performance improvement is claimed here.

### Make new-genesis recovery explicit

If the app account remains trusted or has been recovered under an accepted new
native binding, the operator may deliberately create a distinct genesis in that
same repository. The I2 owner confirms that a fresh DID was a consequence of
the earlier fixed-path assumption, not an authority requirement. If account
control or PDS custody remains unavailable/untrusted, use a new app-account DID
and the same genesis-scoped protocol instead.

The operator explicitly selects the new `(app DID, genesis CID)` pin and its
validated initial source/state, owner/role assignments and control-key/principal
appointments. Readers select that new pin deliberately; it never replaces a
same-genesis floor automatically. Keep old branches, receipts and proof/source
evidence under their old pins, leaving old repository paths in place where the
operator controls retention. A replacement cannot recover already deleted
history without retained evidence.

Uncompromised keys may be reused as keys, but all powers are appointed anew.
Participants need fresh grant IDs scoped to the new genesis and current account
epoch. Old grants, signatures, queued intents and receipts stay in the old
scope; no automatic carry-over or re-signing. Start from validated new-genesis
initialization. Reusing old domain data requires explicitly authored validated
initial state or a separately reviewed import, not an implicit checkpoint
transplant. This is a new trust decision, not a certificate proving succession
from lost governance or a reconciliation of conflicting old branches.

## One application chain, several operation roles

All ordered operation kinds advance the same application position and name the
same preceding entry. A new entry is exactly one position after the selected
head. Position 1 names genesis as predecessor; the final entry CID must equal
the published head's tip. Actor work is never sorted by nonce, signing time,
record-key timestamp, relay cursor or repository revision.

Logical roles are ordinary signed actions, explicitly scoped owner role
administration, actor-signed app-control requests and proof-derived
account-authority operations. This is a separation of checks,
not a final union encoding. Ordinary actions bind principal, signer, grant,
per-action execution contract and payload under I2/C0. Activation also checks
its exact expected source definition and is app-control-only under the I2
proposal. Ordinary owner/administrator participation does not authorize it.
App-control work needs the appropriate
already appointed control authority. A participant grant, account possession or
native app publication cannot manufacture a governance certificate.

Every actor-signed request uses R0's shared identity
`(app DID, genesis CID, canonical signer key, nonce)`, including app-control
requests. After structural and signature validation, look up exact canonical
unsigned intent CID first; return its original receipt if found. Otherwise
check signer-plus-nonce for conflicting content, then consider appending.
Preserve the first stored signature. Principal, grant, epoch, operation kind,
action, contract and payload are signed content, not uniqueness namespaces.

Use exactly 16 cryptographically random nonce bytes, one canonical compressed
`did:key` multikey representation and strict canonical unsigned-intent decoding.
Apply the same canonical-key rule to chain-appointed app-control signers; curve
admission and encoding details still need N1/I2 review. Authentic ineffective
ordered work consumes its identity. A second ordered copy invalidates history.
An exact retry after revocation or activation adds nothing and does not rerun
the original action. Never re-sign queued work; replacements require explicit
new consent, a fresh nonce and a new signature.

Proof-derived grant/revoke/reset imports have I2's immutable transition
identities and idempotency rules. They are not ordinary actor actions whose
authority can be supplied by a nonce. Final operation kinds must distinguish
those identities from R0 actor-request identity.

## Provisional authority interface

Coordinate around this logical function, without committing to field names:

```text
interpretAuthority(priorState, exactAppContext, operation,
                   verifiedRetainedEvidence)
    -> next authority state + outcome, published atomically
```

The context binds app/genesis, candidate position, exact predecessor and the
expected relevant authority frontier. The function has no resolver or clock.
I2's proposed operations admit a grant, revoke a grant with a terminal ID
tombstone, advance a linked account epoch, or apply an appointed app-control
certificate. Grant admission may atomically initialize or advance the observed
account epoch. An optionally appointed owner principal can assign domain roles
through one live grant explicitly scoped to that operation, never by unioning
separate grants or appointing owner/control powers. Account control and app
governance remain distinct powers.

An account-authority operation consumes one I1 observation descriptor identifying
the exact issuer, selected root, subject paths/CIDs and required epoch/grant/revoke
evidence. Online admission obtains a new observation for that operation under
the selected policy; replay checks the retained evidence only. Native app
publication authenticates the host's observation assertion. It does not prove
that the participant evidence was current when observed.

Every account operation consumes its descriptor even when its delegated outcome
is ineffective; an accepted normal observation can advance the observation floor
independently of that outcome. A revoke requires its exact current revoke proof
and binding, not a still-present target grant or epoch record. Bind descriptor
and operation context without an operation-CID/descriptor-CID cycle. An exact
operation retry returns its old receipt; a fresh observation of the same account
record may instead order a no-op and advance the accepted floor. I2 still owns
the final operation identity and idempotency encoding. A second consumption of
the same descriptor is invalid history, like a duplicate R0 identity; the host
must refuse to order it. Retain the consumed-descriptor index so readers detect
it without replaying authority. A fresh descriptor for the same records is
distinct and can yield an ordered no-op. No optional grant last-position bound
is included: explicit revoke/reset supplies withdrawal without another per-action
position check.

Ordinary account-native epoch progression requires linked reset evidence.
Destructive recovery of a participant floor requires an already app-appointed
recovery key and a fresh previously unseen account epoch, retaining prior
history and app floors. A fresh participant DID document cannot erase those
floors or appoint app control keys. These logical I2 requirements are accepted
under the joint assessment; final operation encoding remains gated.

## Conditional publication and recovery

Authenticate one selected app root, its pinned genesis/head and the history or
accepted retained prefix needed to establish the current retry and authority
state. Validate the incoming request independently. Resolve exact retries before
new-work eligibility checks so changed current authority cannot erase an old
receipt. Unavailable original evidence must not be treated as a new nonce.

Construct the candidate entry from that exact head. Publish the entry creation
and head update in one `com.atproto.repo.applyWrites` transaction with
`swapCommit` equal to the selected commit CID. The
[applyWrites Lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/repo/applyWrites.json)
defines this batch transaction and rejects it when the current commit differs.
Always supply CAS; malformed input or missing commit metadata must never fall
back to an unconditional write. Native CAS arbitrates conforming competing
writers; a local lease or queue does not replace it or provide distributed
leadership. PDS Lexicon validation does not enforce the Atseq chain or authority.

After success, CAS loss, timeout or lost reply, reread and authenticate native
publication before issuing a confirmed receipt. On CAS loss refresh root,
chain, retry index and ordered authority, then repeat exact-CID-first lookup.
Keep the actor's original bytes and nonce. Recompute new-work eligibility at
the new position; do not silently retarget a certificate or operation whose
signed content fixes a predecessor or authority frontier.

The confirming root may be later than the commit that first inserted the entry.
That is acceptable if it proves the exact original entry, extends retained app
floors and covers the selected chain. Name that actual root in the receipt;
do not claim to have proved an earlier commit from a later proof. A normal write
reply's CID/revision is a reconciliation hint, not native membership evidence.

The local retry index and projection cannot be committed atomically with a
remote PDS transaction. After a crash, reconcile native history and reconstruct
missing local rows before accepting fresh work. Keep entry, unsigned content,
retry identity and receipt pointers durably. Persist coherent root, verified
floor, authority, source and interpreted projection under P3; never advance
domain state or expose a fabricated receipt from a tentative local reservation.
Bound retries and return uncertainty/unavailability when recovery cannot finish.

## Roots, receipts and retained prefixes

P1's `authenticateRepo` takes the expected app DID, an accepted canonical signing
key and optional expected root. Its `AuthenticatedRepo` capability supplies
root, revision, MST data CID and bounded lookups. `lookup` returns found raw bytes,
authenticated path absence or missing-block identity. Atseq must then decode
and validate those bytes under its own record bounds. `VerifiedRepoBlocks`
retains verified blocks by CID; eviction is missing evidence, not absence.

Use `getRepo(since=retainedRev)` plus retained blocks to authenticate a single
new root and prove the new head and required suffix paths. The
[getRepo Lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/sync/getRepo.json)
offers revision-based diffs. Missing required blocks need full-export recovery
or an explicit unavailable result. Independently fetched record proofs may name
different roots and cannot be combined into one claimed snapshot.

Keep these facts separate:

| Retained fact                                    | What it establishes                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Native commit CID and its accepted key binding   | One authenticated repository publication snapshot; currentness depends on I1 policy.                      |
| Native revision                                  | Repository synchronization/CAS progress, not application position.                                        |
| Relay stream cursor                              | Delivery resumption for that stream, not an app predecessor.                                              |
| Verified app floor: genesis, position, entry CID | An already accepted prefix that new history must extend.                                                  |
| Interpreted frontier                             | The last coherent state/authority/source/outcome transition; it may lag the verified head during a stall. |
| Source definition and per-action contract CID    | Exact source and executable consent identity; neither is a repository revision.                           |

The [sync specification](https://atproto.com/specs/sync) defines repository
revisions and stream cursors separately. Key rotation can publish a commit
without changing the MST data root; it does not add an application position.
Source staging, unrelated record writes and handle/PDS changes likewise do not
advance the app chain by themselves. Only an accepted ordered activation changes
the active source definition. Refresh CAS and key-binding evidence when needed
without inventing a domain action.

A portable receipt fixes unsigned intent CID, original position and exact entry
CID. Retain the selected signed commit, needed MST/record blocks and accepted
key-binding/observation evidence, shared by CID where practical. The first
confirmed receipt's root is immutable within that package. Later export may
offer a separately identified proof under a newer accepted root for the same
original IDs; it must not relabel the old evidence or imply historical key
currentness. Key rotation does not alter the entry or its original outcome.

A sparse receipt proves the entry's publication and its declared position under
app publication authority. It does not by itself establish validity of the
complete prefix, global retry uniqueness or effectiveness. Include genesis/head
proofs and chain extension evidence whenever the receipt's declared scope relies
on them. Clients must expose whether they have only publication evidence, an
accepted verified prefix or a separately obtained interpreted outcome.

The [getRecord Lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/sync/getRecord.json)
selects current-repository evidence, without a historical-root parameter.
Keep exact old proof blocks or explicitly renew evidence; do not promise that
the PDS can reconstruct any old receipt on demand. A single-root archive must
cover all records needed for its declared replay scope and retain required
source and identity evidence. An arbitrary bundled DID document is no trust
anchor, and credential-free replay performs no live resolution.

Reusing a previously verified prefix is distinct from auditing that every old
record remains unchanged in the current mutable repository. P2/N1 must expose
which policy is applied. A valid extending head does not prove that unrelated
older paths were not deleted or replaced. Sparse path verification does not
certify unvisited MST branches; use P1 whole-tree validation when claiming that
assurance, with appropriate budgets.

## Failure and race matrix

These are required implementation cases, not tests run for this note. Include
duplicate descriptor consumption, safe-integer/rkey boundaries and a separate
collection-write credential holder rewriting otherwise authentic entries.

| Scenario                                                                                                 | Required handling                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Concurrent provisioning of the same genesis                                                              | At most one genesis/head pair is created by CAS; matching confirmed state is idempotent, contradictory or orphaned selected records refuse replacement. |
| Two apps share one account and identical positions/nonces                                                | Genesis-scoped paths and retry identities remain distinct; native CAS still arbitrates repository-wide writes.                                          |
| Explicit new genesis in a recovered trusted account                                                      | Publish distinct scoped genesis/head records; preserve old pins/branches and reappoint all powers deliberately. No queued-intent or grant carry-over.   |
| Two writers append distinct requests from one root                                                       | One transaction wins; the loser refreshes and retries under the new position and authority without changing consent.                                    |
| Same request arrives twice, including alternative valid signatures                                       | Preserve the first entry/signature and return its original receipt. No second ordered copy.                                                             |
| Same signer/nonce carries different content or operation kind                                            | Conflict after exact unsigned-CID lookup. Do not append an ineffective duplicate.                                                                       |
| Unrelated, wrong-principal, unadmitted or revoked key front-runs a nonce                                 | Authentic work consumes only that signer's namespace; it cannot consume the victim key's identity. Forged victim signatures are invalid.                |
| Successful write response is lost or process crashes before local indexing                               | Reconcile confirmed native history; restore original IDs and index rows. Never generate a new nonce to escape uncertainty.                              |
| Crash before native write                                                                                | No global retry identity is consumed by an unconfirmed local reservation. Preserve the queued signed request.                                           |
| Activation or authority change wins CAS first                                                            | Refresh and apply C0/I2 at the new position. Exact already recorded retries still return original receipts.                                             |
| Revocation follows an effective action                                                                   | Old receipt/outcome stays historical; a new request is checked under the later authority.                                                               |
| Certificate binds a stale predecessor/frontier                                                           | Do not edit or re-sign it automatically. Follow the reviewed stale-operation outcome/refusal and explicit replacement rules.                            |
| Key-only, source-only or unrelated-record commit races with append                                       | Refresh the native root/key binding and CAS; do not infer a new app position.                                                                           |
| PDS reports write success but authenticated entry/head confirmation fails                                | Return uncertain/unavailable or reject proven inconsistency; never fabricate publication proof.                                                         |
| Partial diff, evicted blocks or required source/evidence not yet obtained                                | Recover or stall at the last coherent interpreted frontier. Missing bytes do not prove absence or denial.                                               |
| Authenticated path proves a claimed protocol-required genesis/head/entry/evidence record absent          | Reject the selected history/proof package. A transport 404 alone is not authenticated absence.                                                          |
| Malformed envelope, wrong target, bad actor/native signature, broken chain or duplicate retry in history | Invalid history; fail closed. Do not legitimize it with an ineffective outcome.                                                                         |
| Authentic well-formed ordinary request names an unadmitted/revoked/reset/out-of-scope grant              | Deterministic ineffective outcome under complete retained authority, distinct from missing required admission evidence.                                 |
| Complete activation closure is invalid, or omits a declared dependency                                   | Ineffective invalid activation after required structural/authority checks; unavailable transport bytes instead stall.                                   |
| Local interpreter or persistence fails                                                                   | Unavailable/stalled, with no replicated verdict invented from the local fault.                                                                          |
| New root rolls back or contradicts a retained app floor                                                  | Reject encountered rollback/fork and retain conflicting evidence. Current DID resolution cannot erase the floor.                                        |
| Old receipt proof is unavailable after rotation/deletion                                                 | Recover retained evidence or return unavailable; do not silently select a new trust anchor or append the request again.                                 |
| Fresh reader sees a different authentic ordering                                                         | Disclose native custody; no local receipt or unseen-floor policy establishes global non-equivocation.                                                   |

## Review and implementation gates

N1 needs an agreed I1 observation/key-binding contract and I2 operation,
authority-state, idempotency and classification contract before final records.
Resolve canonical actor/control key rules, strict nonce/intent decoding,
operation unions, integer/path bounds, execution descriptors and metadata with
C0/R0. Integrate B0's versioned lean description without accepting host discovery
as ordering or source authority. Identify the replacement semantic contract;
do not preserve an ignored old sequencer field or add parallel authority modes.

The joint assessment accepts the minimal logical roles, genesis-scoped paths,
pinning, receipt scopes and authority distinctions, with the corrections above.
Final wire/union and certificate review must precede code. Then test the matrix against real reference-PDS
CAS, concurrent writers, induced lost replies, crash/restart and Node/browser
receipt/archive replay. Include different key epochs, complete-root absence,
partial-diff recovery and old proof loss. A2/E1 own provider and deployment
trials; P0/E1 own cost characterization. No assumed signature-count improvement
or successful build substitutes for those results.

Also exercise two independent apps in one repository, cross-genesis record/grant/
receipt substitution, pair-scoped host/browser/archive persistence, concurrent
cross-app CAS loss, shared-source reuse and explicit new-genesis initialization
without overwriting old histories. Compare an empty/dedicated account with a
shared account containing unrelated records. The selected genesis paths must
work with standard record-key and native proof libraries; final Lexicons must
describe those keys rather than retain the old `literal:self` contract.

No runtime, package, Lexicon or programme change, build, test or benchmark was
performed for this note. It is a reviewable logical proposal grounded in the
examined source, accepted directions, provisional I2 coordination and current
primary protocol material. N1 remains open.
