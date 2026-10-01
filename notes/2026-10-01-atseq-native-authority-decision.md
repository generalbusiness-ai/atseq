---
date: 2026-10-01
status: adopted authority backbone; concrete wire and implementation validation pending
examined_at: 824527132a6cfc6099d57685d37320e37f99ee4e
request: cde3cb20
---

# Native repository authority: implementation decision

Prefer actor-signed intents ordered under the application account's native signed
repository root. The app PDS holding its repository signing key can construct
another ordering. This is an accepted custody choice to assess and implement,
not an optimization that preserves the spike's separate ordering authority.
The user's instruction supersedes the separate-sequencer default in the two
[verification](2026-10-01-atseq-verification-and-bootstrap.md) and
[identity](2026-10-01-atseq-identity.md) notes. Keep the simpler native model unless
significant functional, trust or measured adoption evidence argues against it.

This decision selects the authority backbone and its verification boundaries.
The final Lexicons and retry namespace still need the reviewed N1/R0 contracts.
It does not declare native ordering implemented, prove a speedup or complete the
identity and performance programme.

## Selected contract

- Pin the app account DID and genesis CID. New genesis explicitly declares native
  repository ordering and the new semantic contract; it must not carry an ignored
  `sequencerKey`. Preserve positions and predecessor CIDs in the application chain.
- Keep actor signatures over exact intents and explicit account-to-device grants.
  Authenticate native commit DID/signature, genesis, selected head and relevant
  entry paths/CIDs under one selected root. A record CID by itself or an ordinary
  `repo.getRecord` JSON response is not a membership proof.
- The ordering service validates and conditionally publishes entries/head to the
  PDS; it needs account write access, not a separate per-entry ordering key. Use
  atomic native `applyWrites` with `swapCommit`, retaining confirmations/proofs.
  CAS arbitrates conflicting writes; it is not distributed leadership or consensus.
- Structural, actor-signature, chain and duplicate-retry faults make history
  invalid and fail closed. An authentic ordered action whose grant is revoked or
  out of scope is a deterministic ineffective outcome; unavailable retained
  evidence stalls. An entry lacking required principal/grant references or
  carrying invalid proof is structurally invalid; a well-formed reference to an
  unadmitted grant is ineffective. A malicious account writer can invalidate the log just as it
  can delete/rewrite it. This is an explicit custody limitation, not a new domain
  verdict. N1/I2 must test each distinction; verifiers must not invent authorization.
- A returning reader retains an exact app floor. A suffix must extend its
  predecessor and authenticate entries under the selected native root. Reject
  rollback, gaps and encountered forks. Record the policy for current repository
  mutation detection separately from reuse of a previously verified prefix.
  Prefer `getRepo(since=retainedRev)`: authenticate one returned root and reuse
  retained verified blocks plus the diff to prove new entry/head membership.
  Missing required blocks trigger full-export recovery. Sparse `sync.getRecord`
  remains useful for a receipt; independently fetched proofs can span roots and
  must not be silently combined into a single-root suffix.
- A receipt contains the exact entry position/CID, intent identity, selected root
  and native membership/key-binding evidence, shared where possible. It proves
  ordering/publication, not domain effectiveness. A lost write confirmation uses
  verified exact-content retry lookup, never creates a second act by guessing.
- Key-only commits and ordinary PDS/key/handle changes are not new app positions.
  Online admission verifies the current account binding. Old archive roots need
  retained trusted bindings or later membership evidence after rotation. Neither
  a revision nor a historical key establishes that an old root was current.
- The default archive selects one recently observed root covering the chosen
  log, retains its full or adequate sparse CAR and the trusted observed key
  binding, and checks the root once plus required paths. Renew root membership
  evidence after rotation when exporting; a later rotation does not alter the
  already retained archive trust decision. Partial proof retention must cover
  every record needed for replay, not just the final entry.
- Offline replay consumes retained root/path/identity evidence. It never fetches
  a DID document or treats an arbitrary bundled DID document as a trust anchor.

Repositories are mutable authenticated maps. Native `prev` is ordinarily null;
the app's explicit chain still supplies order. Native revision and relay cursor
remain separate from application position. These boundaries follow the
[repository](https://atproto.com/specs/repository) and
[sync](https://atproto.com/specs/sync) specifications.

## Governance, observation and certification

Whoever controls the app DID controls which PDS/repository key supplies native
ordering. App ordering recovery therefore uses native account control, not the
governance certificate chain alone. For `did:plc`, provisioning must leave the
app's independent recovery custodian holding a higher-priority rotation key than
the PDS's, with that binding recorded and verified. It can be the governance key
or a separately bound rotation key under the same custodian. PLC recovery has
its specified 72-hour nullification window and directory trust/availability;
it is not an indefinite undo guarantee. For `did:web`, domain control is the
root and domain loss may be unrecoverable. Repo signing keys are distinct from
DID rotation authority. See the
[PLC specification](https://github.com/did-method-plc/did-method-plc/blob/main/website/spec/v0.1/did-plc.md)
and [account migration guide](https://atproto.com/guides/account-migration).

The certificate chain continues to control domain/definition powers and any
separately appointed certifier. Recovering ordering through DID control does not
invent a replacement domain-governance signer. Conversely, a governance signer
without app DID control and PDS provisioning/write access cannot recover ordering
from a hostile or vanished PDS. I2 owns the explicit binding; A2 owns operational
provisioning/recovery trials.

Native ordering does not make the PDS a domain administrator. Genesis appoints
minimal governance/recovery keys with explicit powers and transfer/removal rules.
Only already appointed certificate-chain keys can exercise app governance,
recovery or certify an authority succession. A participation grant issued by an
owner account cannot manufacture those powers. Definition administration may be
an explicitly assigned participation role, subject to the chosen governance rule.

The original architecture's optional domain ownership remains useful. One
bootstrap governance appointment supplies protocol administration/recovery;
it creates no mandatory commercial owner, domain role or human obligation.
Appointments may be transferred or removed by the accepted chain rules. If all
accepted recovery keys are lost or deliberately removed, no actor can manufacture
a replacement from a fresh DID document: a new trust decision/genesis is required.
D0/I2 must preserve this distinction in code and user-facing descriptions.

The app ordering/admission service is the default online identity observer.
The native app root authenticates its retained observation record; there is no
extra observer signature merely duplicating publication. Readers therefore trust
the union of the ordering host's online check and the app PDS's publication
authority. These may be the same operator or different operators; configuration
and deployment determine custody. Signatures/proofs still
bind the participant repository issuer and grant contents, but replay does not
prove the observation was current. A compromised app PDS can publish a false
observation using otherwise authentic old evidence. An independent observer is
an explicit stronger policy, not an implicit guarantee of the default.

Default checkpoint certification is likewise the native app root's publication
of a checkpoint assertion under genesis policy. The checkpoint cannot authorize
its own issuer/certifier. Native repository binding supplies the app authority;
accepted governance defines any separately appointed certifier. Authenticated
state is an assertion until independently replayed. Preserve separate state
and identity assurance dimensions and newer local floors.

## Significant evidence that could change the preference

The PDS can withhold acts, delete or rewrite published records, reorder valid
signed work into a different chain, and present different roots to readers.
It cannot forge an uncompromised actor signature or an appointed governance
certificate. No design here provides global non-equivocation. Retained floors
and observer comparisons detect conflicts encountered locally; fresh readers
cannot detect unseen alternate histories unaided.

Apps that need ordering integrity against third-party infrastructure should keep
the app account on a PDS controlled by their own trusted operator and retain app
DID recovery authority. If using a third-party PDS, disclose its power to withhold,
rewrite, reorder and publish false observations in setup and public documentation.
The current host accepts a configured PDS; no universal same-operator deployment
is assumed. A2/T1 own the production disclosure.

These are disclosed custody limits, not by themselves evidence against the user's
preferred model. Reconsider native authority if a required deployment must keep
ordering or identity observation secure against its app PDS, if proof retention
makes offline use impractical, or if browser/provider evidence prevents a simple
conforming implementation. First test the actual need and the smallest remedy;
do not implement two authority modes merely to preserve the spike.

Compare cold and warm, single-action and batched native commits with retained
spike evidence. N actor signatures plus one native root is a signature-count
hypothesis for cold verification, not a measured elapsed-time guarantee. Native
MST, hashing, observation, fold and copying costs still matter.

## Proof-library evidence and recommendation

Evaluate pinned `@atcute/repo` 1.1.0 and `@atcute/mst` 1.1.1 first. Their published
unpacked sizes are 37,583 and 88,454 bytes respectively; these are package sizes,
not bundled or installed closure sizes. The alternative `@atproto/repo` 0.10.15
is 359,726 bytes and introduces a different dependency closure. Existing Atseq
already uses atcute CAR/CBOR/CID/crypto. Published metadata shows required newer
CAR/CBOR/CID versions, so P1 must deliberately regenerate dependency/integrity
approval and demonstrate semantic equivalence rather than silently upgrading.
See [atcute repository utilities](https://github.com/mary-ext/atcute/tree/trunk/packages/utilities/repo),
[MST utilities](https://github.com/mary-ext/atcute/tree/trunk/packages/utilities/mst)
and the [reference repo package](https://github.com/bluesky-social/atproto/tree/main/packages/repo).

`verifyRecord` checks referenced block hashes, expected DID, supplied public key
signature and signed-root reachability. DID and key are optional upstream; Atseq
must require both. The convenience verifier does not validate whole-tree shape,
indexes the supplied CAR for each call, and does not expose a verified-root
capability. Calling it N times on one full export would recreate quadratic work.
P1 must authenticate/index a bounded root once, reuse maintained MST primitives
for paths, and distinguish sparse membership from whole-tree validation. Do not
copy a new MST implementation into Atseq.

Legacy PDS DID documents may expose uncompressed secp256k1 verification keys.
The atcute controller parser recognizes the legacy representation, while its
Node secp256k1 raw importer expects compressed bytes. The probe uses the reference
crypto package's `formatDidKey` to validate/normalize that key before importing
it. P1 needs reviewed cross-platform key normalization and fixtures, not an
unchecked hand-written point conversion.

Reproduce the isolated evidence with:

```sh
npm ci --prefix tests/support/pds
npm install --prefix .atseq-local/native-proof-probe --save-exact @atcute/repo@1.1.0 @atcute/mst@1.1.1
node experiments/native-authority-probe.mjs
```

The probe writes public proof bytes and results under
`experiments/generated/native-authority/`. It is library/PDS evidence, not a
runtime verifier or a native Atseq implementation. The results report names
actual passed cases and limitations; browser bundle compilation does not prove
browser execution. Currentness uses the local official mock PLC, not a live
provider. P1/I1/N1/A2/E1 owe the full hostile, browser, rotation and real-provider
cases.

## Review corrections and ownership

Independent assessment `4f823d99` supports the native authority backbone subject
to C1–C6. This revision binds operational recovery to app DID control (I2/A2),
uses native single-root diffs (P1/P2), makes invalid versus ineffective/stalled
classification explicit (I2/N1/C0), discloses deployment custody (A2/T1), selects
a single observed archive root (N1), and identifies host-plus-PDS observation trust.
The additional diff probe tests new entry/head membership from one reference-PDS
`since` response. Final wire/limits and real recovery/provider cases remain
implementation gates, not approved by this observation report.

Independent reassessment `9136c7bb` accepted the C1–C6 corrections and permits
adoption of this backbone. Its remaining refinements are explicit task conditions:
P1 must show partial diffs over a large existing repository, not merely the
three-record probe; N1/I2/C0 distinguish unfetched evidence from proven absence
at a complete selected root; A2 tests real-provider permission to install a
higher-priority recovery key and discloses providers that do not permit it.
