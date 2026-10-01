---
date: 2026-10-01
status: independently reviewed; adopted public-scope direction
examined_at: cb3fd8472ccec1208b72e8adc81884ccfb1860d4
request: 6f3fd8c5
---

# Confidentiality: supported scope and future choices

Keep Atseq's current implementation and the identity/performance programme
explicitly public. They support applications whose actions, source and
participation can be published. Do not add encryption or a private storage mode
without a concrete confidentiality requirement and a separately reviewed
contract. Neither option is implemented, and neither is a small configuration
change to the selected design.

If a future application needs private content but accepts public participation
and ordering metadata, investigate encrypted content under the existing native
app-repository authority first. If it needs private participation or protection
from the ordering operator, that is a different and larger requirement. Do not
promise it through payload encryption. These are investigation gates, not a
selected encryption scheme or authorization to implement one.

This report addresses F10 in the [plan review](2026-09-06-atseq-plan-review.md)
and Q0 in the [implementation programme](2026-10-01-atseq-implementation-programme.md).
It preserves the [preferred native PDS authority](2026-10-01-atseq-native-authority-decision.md).
No significant evidence here overturns that choice for the public applications
currently supported. The older suggestion that private storage would be nearly
free relied on a staged canonical store that is not the adopted backbone.

## What is public today

The following observations come from source and documentation at the revision
above, rather than a privacy experiment:

| Evidence | Consequence |
| --- | --- |
| `src/protocol/log.ts`, `Intent`, `Entry` | The signed intent contains actor key, app/genesis/definition, nonce, action and plaintext JSON payload. Entries retain the signed intent and position/predecessor. Signatures authenticate bytes; they do not conceal them. |
| `src/host/sequencer.ts`, `provisionLog` and `append` | Genesis, head and entries are published as ordinary PDS repository records. Loopback host access does not make that publication private. |
| `src/host/source.ts`, `SourceStore` | Exact definition/source bytes are uploaded as blobs referenced by repository records and retrieved through `sync.getBlob`. Schemas, folds, views and initial data can disclose information too. |
| `src/host/http.ts`, request dispatch | The host binds to loopback and checks origin. Its token gates procedures other than submit; read queries, sync, receipts and retained drafts do not require that token. This is the current local service boundary, not a confidential multi-user deployment. |
| `src/archive/archive.ts`, `RetainedInput`, `exportArchive`, `replayInput` | Export deliberately retains public signed history and exact source, excluding host/device credentials. Offline replay reconstructs state and retry evidence from it. A downloaded archive is another readable copy. |
| `src/host/lease.ts`, `acquireWriterLease` | The current durable checkpoint is a last-observed head, not encrypted materialized state or a private portable checkpoint. |
| [Identity note](2026-10-01-atseq-identity.md), candidate grant contract | Planned public account grants and retained proofs connect account DIDs, signer keys, application scopes and revocations. They are proposed identity work, not already implemented privacy controls. |

ATproto sync is a public distribution protocol. Its full repository export is
unauthenticated and includes records, tree nodes and the signed commit. Record
deletion changes future repository snapshots; previously retained copies cannot
be recalled by a UI or grant revocation. The sync specification asks mirrors to
honor changes promptly, so this is not a recommendation to bulk-redistribute
static historical datasets. See the [sync specification](https://atproto.com/specs/sync).

Native Merkle proofs authenticate membership of record bytes under a root. They
are not a confidentiality mechanism. A source blob reference also needs its
actual bytes for interpretation; the repository CAR alone does not necessarily
include blobs. See the [repository specification](https://atproto.com/specs/repository)
and [blob specification](https://atproto.com/specs/blob).

OAuth tokens, host tokens, PDS credentials and private signing keys must remain
outside retained public evidence. Protecting those credentials prevents some
unauthorized operations; it does not restrict who can read published records.
Account identity and app authorization are likewise separate from permission to
read private data.

Device-local data is another disclosure boundary. `src/client/store.ts` retains
browser keys, drafts, queued actions and verified history in IndexedDB;
`src/browser/identity.ts` stores nonextractable browser signing keys, while
`src/client/identity.ts` and `src/cli/main.ts` support CLI private-key and intent
files. Atseq supplies no encryption at rest for these stores. A nonextractable
browser key constrains key export through the API; it does not establish that
the browser's on-disk storage is encrypted. CLI file permissions and browser/OS
controls remain separate protections. A1/A2/T1 own clear local-storage and backup
disclosure, including unpublished drafts and queued work.

## Three different storage choices

| Choice | Who reads content? | Native authority and ecosystem fit | Retention and principal cost |
| --- | --- | --- | --- |
| Public baseline | Anyone obtaining published records, source or exports | Uses the selected app PDS root, ordinary CAR/MST proofs and public synchronization directly | Public credential-free replay; retention is useful for verification and also preserves disclosure |
| Private host storage | The host operator and whoever its access policy admits; endpoints/devices/backups still matter | A local canonical log without PDS publication loses native root authority. A restricted PDS deployment may keep repo signing/proofs but gives up ordinary public sync/discovery and requires its own access/distribution policy | Authorized complete exports could still replay without live credentials, but they contain readable private data. Access, backup, erasure and recovery become operator responsibilities |
| Encrypted public evidence | Parties with the required decryption material, plus compromised endpoints or recipients that disclose it | Native PDS root can still order and prove encrypted records. Ordinary indexes can read only public envelopes; domain interpretation requires a new contract | Anyone can retain ciphertext. Authorized historical replay needs retained plaintext or historical decryption material; new readers need explicit access and bootstrap policy |

Private-host storage is not supplied by putting the existing service behind a
login. The PDS's public records and blobs remain a separate read path. Suppressing
publication or restricting every sync/blob route changes availability and
distribution assumptions. Public native roots over private commitments could
attest selected hashes, but would not by themselves deliver private records,
prove their domain effects or make the current verifier usable. That hybrid is
additional protocol work, not a fourth implemented mode.

For encrypted evidence, native root authority remains the selected authority:
the app PDS can withhold, delete, reorder valid encrypted intents or show
different histories. Encryption may hide content from that PDS when the host
and PDS are separate and the PDS has no decryption keys. It does not remove the
PDS's ordering power. If the interpreting host holds keys, its operator can read
content even when the PDS cannot. If only participants hold keys, the host must
order opaque work and cannot perform plaintext schema/fold checks. Readers would
need specified deterministic checks after decryption; current plaintext submit,
source and interpretation rules cannot simply be reused unchanged.

Any encrypted-intent contract must bind actor authenticity, ciphertext and its
app/genesis/definition context without allowing a publisher to substitute a
different decrypted action. It must also define the exact bytes used for retry
identity and receipts. This note leaves that contract open. A public grant proof
CAR retains the grant record bytes; encrypting a copy elsewhere does not conceal
fields in the record used for public admission.

## What encryption would still disclose

Encrypting only `payload` leaves the app/account relationship, actor signer,
grant relationships, action name, definition identity, position, predecessor,
record paths and ciphertext size public. Repository updates also expose activity
and approximate timing. Encrypting more of the envelope reduces some disclosure
but complicates public admission, retry validation and receipt lookup. It does
not hide that the repository exists or updates. Public grant scopes and retained
identity proofs can reveal participation even if action names are hidden.

Schemas, views, source inventories, outcome indexes, retry tuples, plaintext
checkpoints and exported query results are additional disclosure surfaces. Every
public derivative needs review; hiding the original payload is insufficient.
An unkeyed CID/hash of a low-entropy secret can let an observer test candidate
values or link equal values. It must not be described as encryption. If private
objects are content-addressed, a future contract should distinguish plaintext
identities from public ciphertext identities and decide what commitments reveal.

For example, HPKE is a maintained specification for hybrid public-key encryption,
not an Atseq confidentiality protocol. It does not hide plaintext length without
padding, protect metadata automatically, supply Atseq retry semantics or give
forward secrecy against compromise of a long-term recipient key. See
[RFC 9180, sections 9.7 and 9.9](https://www.rfc-editor.org/rfc/rfc9180.html#section-9.7).
This report recommends no cryptographic suite or home-grown replacement.

## Keys, revocation and historical replay

An account signing key or an action-signing device key is not automatically an
encryption key or a recovery key. A future design needs independently specified
decryption custody, access grants, device enrolment, rotation, recovery and export
behavior. An OAuth session alone cannot reproduce an old private fold offline.

Removing a member can prevent access to future keys if the key policy does so.
It cannot remove plaintext or historical keys that member already retained.
Forward secrecy depends on deleting past secrets; indefinite reconstruction of
old encrypted history needs some retained ability to recover it. MLS's security
model explicitly relies on deletion of old secrets and message keys; see
[RFC 9420, section 16.6](https://www.rfc-editor.org/rfc/rfc9420.html#section-16.6).
The application must choose its retention/access promise rather than claiming
both universal historical replay and unrecoverable historical key deletion.

The current guarantee is credential-free replay of retained **public** input.
A confidential extension could offer replay without live OAuth/PDS credentials,
but would still require locally available decryption secrets or a protected
plaintext export. Neither belongs in a public archive. Reusing the current
archive format and silently adding private keys would violate its boundary.

Exact interpretation source, semantic contract and installed build provenance
remain necessary. Public code can interpret private data, but private source or
initial state must also be made available to authorized readers. All bytes and
identity evidence required at the selected frontier must be retained. A missing
key or inaccessible private input prevents interpretation; a fresh live fetch
must not silently alter historical results. Authentication of ciphertext alone
cannot establish that a plaintext payload conforms to its domain schema.

Materialized state, outcomes and checkpoints can contain the same secrets as the
actions. Encrypt those where required, bind certification to exact encrypted
payload and app/frontier/authority commitments, and define who may decrypt and
verify the claimed state. A reader without keys may verify publication/order,
but cannot independently replay the private fold. A reader accepting a decrypted
checkpoint still trusts its certifier until replay; encryption supplies no proof
of computation. P3/P4 should keep their public contracts explicit and need not
invent private checkpoint fields now.

Availability also changes: losing all retained decryption material can make
authentic history unusable. A PDS, private content host or key service can
withhold necessary data. Multiple retained copies help availability but increase
the set of places that must protect secrets. Migration must transfer required
content and key access, not merely resolve a new PDS. Native DID recovery restores
ordering control; it does not recover deleted decryption keys or erase disclosure.

## Which examples fit

Suitability depends on actual data, consent and disclosure needs, not an
application label. The plan review's claim that every commercial role is
confidential is too broad: some commercial activity is intentionally public.

| Example | Public scope supported today | Boundary needing a different design |
| --- | --- | --- |
| Task board or agent coordination | Public issues, volunteered public roles, synthetic tasks and public outcomes | Internal work, customer identifiers, private plans, secrets in agent inputs and participation relationships |
| Game or public status | Public moves/state and deliberately public service updates | Hidden moves, private messages, unreleased results or identifiers not intended for publication |
| Guitar search or public marketplace | Public catalogue, listing attributes and public offers intentionally disclosed | Buyer contact, payment, private negotiation and confidential commercial terms |
| Portfolio or ledger | Synthetic fixtures, public treasury reporting or intentionally public accounting | Personal holdings, account identifiers, statements and private transactions |
| Hospital, personnel, insurance, house purchase or funeral coordination | Synthetic exercises or carefully separated public status that contains no private record | Medical/personal records, claims evidence, addresses, documents and private participation |

Keeping private documents elsewhere and submitting an opaque reference is useful
only when the public transition does not need their contents. Atseq currently
does not fetch arbitrary external URLs or undeclared interpretation dependencies.
If a fold needs that private evidence, its exact retained bytes and access policy
are part of the confidentiality problem. A public coordination log must not
claim independently verified private facts that were only asserted by a host.

## Recommendation and followup gates

1. **Complete the public programme.** A1/A2/T1 should disclose public grants,
   payloads, source and persistent copies before first publication/enrolment.
   T1 owns a public-scope statement in the README that a fresh reader encounters
   before app creation or enrolment; A1/A2 own the corresponding setup flow.
   Shared-host admission and operator access stay distinct from data privacy.
   B0 examples and T1 documentation should identify synthetic/public fixtures.
   These are existing owners, not new privacy implementation tasks.
2. **Require a concrete case before another storage mode.** Record which fields
   and relationships are secret, from whom, whether the interpreting host is
   trusted, who receives past history, and how long reconstruction must work.
   Public ordering/participation is a deciding constraint. That assessment merits
   a separate request only when an application actually requires it.
3. **Prefer a bounded encrypted-content feasibility study when public metadata
   is acceptable.** It should keep native PDS ordering, use maintained cryptography
   and test wrong-app/frontier/key substitution, revoked future access, retained
   historical replay, ciphertext size, missing keys, browser/Node agreement and
   checkpoint/export disclosure. Review the envelope/key/interpreter contract
   before code. Evidence may instead show that ordinary private storage is simpler
   for that application's trust requirements.
4. **Treat private participation as a separate decision.** Public grants/proofs
   do not meet it. Compare a private host or restricted deployment against the
   ecosystem features lost and operator authority accepted. It is not covered by
   the encrypted-content study and does not silently replace native authority.

Independent assessment `a54acf1c`, ratified in the workroom, accepted this direction
and permits Q0 to close. Its two nonblocking refinements are included above:
explicit device-local storage disclosure and T1 ownership of the README's public
scope statement. It does not require a privacy implementation, select HPKE/MLS, guarantee
anonymity, design legal retention policy or endorse the use of real confidential
records. No runtime, Lexicon, dependency, archive or checkpoint changes accompany
this note. Validation was a source/document review and primary-specification
check on 2026-10-01; no encryption prototype or performance measurements were run.
