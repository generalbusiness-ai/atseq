# Native wire foundation: results and integration requirements

Date: 2026-10-01. Status: implementation candidate, awaiting independent foundation
review. This delivers content framing and conformance preparation, not the native
host, account-authority reducer or a supported application profile.

Tracking: N1 request `fea766bc0c93b73199c016d1a402ef251e0d42f5`, implementation
promise `9626c49589f6a39c8998b3288109c021e229709c`. The adopted logical contract is
[NW0](2026-10-01-atseq-native-wire-contract.md) at `10e656b3`, reviewed in
`a5f46ba7` and corrected-confirmation report `4d4f6f8d`. The literal genesis-role
initializer below is a review supplement, not an already accepted initializer.

The exact source and test candidate is `cf2dc095`. It starts from published
`4b6ebab5` and merges the unchanged, separately reviewed I1 dependency candidate
`412b0c9b83c921c86f95d847dabbba381767d783`. That foundation was pending independent
review when these measurements were made; this report does not claim its merge
or approval. The retained result files hash the actual source, fixtures, package
and lock used. No dependency, approval, current-profile or public-export edits
belong to this foundation change.

## What works

Three isolated modules own a separate native registry, strict content validation,
and a clearly labelled preparation descriptor. They are not imported by the
current supported-profile registry.

- Genesis, head and entry use version 2; account epoch/current/grant/revoke,
  source-file locators and content records use version 1. Typed requests, control
  requests, observations, app bindings, action-contract framing and sparse
  receipts use closed schemas. Unknown fields, unreviewed union members and
  coercion fail. Control requests are framing only; there is no control reducer.
- Canonical native keys retain the complete genesis CID. Entries append a dot
  and 16 decimal digits for a positive safe integer, including the maximum safe
  integer. Maintained Lexicon syntax checks the native path. Record reads compare
  the key with the exact decoded content; they do not authenticate membership.
- Device and control signatures require compressed P-256 `did:key`, compact
  SHA-256 signatures, and low-S verification over the entire unsigned intent.
  Repository-binding representation accepts P-256 and secp256k1 separately.
  Every account field uses the maintained ATproto DID validator and the
  hostname-only web boundary, including roles, owner, control pairs and targets.
  A device key is never accepted as an account principal.
- Two independently produced valid signatures retain different signed bytes
  while sharing the unsigned request CID and canonical retry tuple. Mutating
  principal, nonce, payload, epoch, execution or grant breaks the signature.
  The helper derives identity; the host still needs an authenticated complete
  prefix and durable first-request index before it can resolve retries.
- Account imports require their exact outer position and predecessor. Their
  observation subject commits the complete request with only its observation
  reference omitted. Recovery uses the equivalent omission inside the unsigned
  control intent. This avoids a request/descriptor CID cycle without omitting
  its expected epoch, floor, actor or intended context.
- The fold metadata projection has exactly `app`, `genesis`, `position`,
  `principal` and `execution`. Device, grant and epoch changes are authorization
  details and do not add ambient fold inputs. The projection is not an action
  eligibility capability.
- Exact retained bytes use 32 KiB chunks and a bounded length-bearing manifest.
  Each fetched chunk must match its content CID and canonical chunk length.
  A source locator's record CID remains distinct from the raw source-file CID.
  Missing bytes and a caller's smaller byte budget remain transient failures;
  malformed content does not become an ineffective application action.
- Definition framing retains supplied file order and unreferenced assets.
  Reordering or pruning changes the exact manifest CID. Duplicate paths and
  CBOR locator CIDs substituted for raw-file CIDs fail. Full executable source
  admission, source-path checks and exact closure validation are integration
  requirements, not claims made by this shape-only loader.

The preparation descriptor has CID
`bafyreidyxc6ljf2tyob24cncq2gz6wx7s4guurbrxh4tn4vv5uhpwelaoi`.
Its literal object is retained in the evidence directory. It expressly excludes
native publication, identity proof acceptance, authority interpretation and
adopted expected semantic CIDs. Its name is not a supported profile. The current
log/application/evaluator profile CIDs still match their retained fixtures.
Routine service RPC schemas are outside this separate preparation registry.

## Validation

The independent writer imports Node OpenSSL, `@ipld/dag-cbor` and `multiformats`,
not the protocol implementation or its registry. Public TEST scalars 1, 2 and 3
provide P-256 device/control keys and a secp256k1 repository key. Retained low-S
signatures are independently verified before reuse, so the writer's `--check`
reproduces every literal CBOR block, digest and CID without claiming deterministic
ECDSA. Placeholder semantics, native roots, source schemas and PLC responses are
explicitly not authenticated or executable examples.

The same 53-case corpus passed in Node 26.10.0 and Node 22.19.0, and agreed exactly
with Chromium 153.0.8010.12 in both runs. Each wrapper reports 54 tests including
its parent test. Cases include all golden records/operations, malformed and
coerced content, full/maximal position keys, wrong external pins, high-S
signatures, unsigned retry identity, account-context mismatch, observation
projection, both repository curves, account-method exclusions, chunk tampering,
resource stalls, retained assets and unchanged current profiles. These are
correctness cases, not performance measurements or real PDS publication tests.

`npm run build` and `npm run check` passed against the candidate's exact installed
147-package runtime closure. The build emitted the existing large-browser-bundle
warning. The independent fixture check also passed. Retained public results,
source hashes and logs are in
[the evidence directory](../experiments/post-spike-evidence/2026-10-01/native-wire-foundation/).
No running browser or benchmark remains from this validation.

## Review supplement: initial role revision

An explicitly listed genesis role should initialize to enabled with revision
`G`. A never-assigned principal/role pair has revision null. An effective disable
retains the disabling unsigned intent CID even though enabled becomes false.
Future compare-and-set requests therefore distinguish absent from disabled.

The independent fixture retains these exact proposed values:

| Case | Revision |
| --- | --- |
| Listed enabled genesis role | `bafyreif2gwp7mxfr6nopg3lxsdmotb6imoc4wxqvbxfj2izsncypdybhci` |
| Never assigned | null |
| Effective disable using `disableRoleIntent` | `bafyreigkscuksn2oh5a5ckzxmatevqctihixhx4ozoxtybcind37lncetq` |

Genesis contains only the role assignments. The authority initializer inserts
`G` after hashing genesis, so genesis never embeds its own CID. The disable
fixture is exact unsigned content, not proof that an authority reducer executed
it. I2 must implement and independently test this initializer, the disabled
state and stale expected-assignment behavior.

## Review supplement: recovery under map pressure

These are required reducer vectors, not results from this foundation. Every
failed operation retains the complete prior map. Let `R` and `R2` be different
principal/key pairs and the maximum combined map size be 16.

| Prior map and operation | Required result |
| --- | --- |
| Recover-only R plus 15 govern-only pairs; rotate recovery to R2 | Remove empty R, add R2; 16 pairs fit |
| R has govern+recover plus 15 certify-only pairs; rotate to new R2 | Retaining R's govern and adding R2 makes 17; ineffective `control_map_limit` |
| Same map; enabled recoverGovernance clears govern, then rotate | R becomes recover-only; subsequent one-for-one rotation fits |
| R has certify+govern+recover plus 15 certify-only pairs; clear govern, then rotate to new R2 | R still retains certify; 17 pairs still do not fit |
| A govern-only attacker tries to remove an appointed recover pair or its lower powers | Ineffective `control_power`; that whole recover-containing pair is preserved |
| One appointed recover key replaces the recovery set with only itself | May remove every other honest recovery appointment; nonempty does not mean quorum |

A bounded map does not universally guarantee convenient recovery rotation.
Retained certify powers can prevent adding a fresh pair, and compromise of one
recover key may remove all honest recover appointments. Documentation must state
both limits. This candidate does not add quorum, a bypass, or another recovery
operation. Initial genesis may deliberately omit recovery, with permanent-loss
consequences disclosed.

## Remaining gates and recommended next implementation

Use the smallest shared evidence interface: P1 authenticates the native
publication and participant root; I1 derives the selected before/after binding
from retained exact bytes; I2's private capability constructor binds those proofs
to the published descriptor, exact subject, relevant records and entry context.
A shape-valid observation or action-contract body cannot mint that capability.
There is no `trusted: true` switch in this foundation.

The next native integration must provide:

1. Account and control authority interpretation, consumed-descriptor and complete
   R0 indexes, role initialization and immutable snapshots, with reason precedence
   and map-pressure cases above. Ordinary action eligibility remains unavailable
   until a nonforgeable capability derives its exact contract from admitted native
   source and a supported semantic descriptor.
2. Full native source admission and concrete native/application descriptors with
   literal approved CIDs, retained conformance and action-closure identity. The
   current content union accepts six framing bodies; semantic descriptor bodies
   and the independently versioned service successor remain explicit gates.
   No service description may become an implicit genesis authority update.
3. Actual `applyWrites`/`swapCommit`, retained native receipts, verified prefix
   interpretation, CAS contention, lost confirmation and crash recovery. The
   receipt framing here cannot authenticate its own app binding or infer prefix,
   effectiveness, state correctness, or newest-root status.
4. Full retained replay with network and credentials disabled, incremental reader
   floors/cursors and checkpoint serializer integration. Local partial material
   and unavailable evidence must not advance state or erase app-scoped floors.

Key-import and recovery documentation must distinguish P-256 device/control
keys from both repository curves. A host's collection-scoped OAuth permission
uses the PDS's repository signing authority; users need not export the repository
key to obtain a device key. All holders of collection-write credentials share
ordering custody. Browser nonextractability does not imply Atseq encryption of
local storage; CLI private-key files also need an explicit storage disclosure.
Backed-up device keys and appointed control/recovery keys are different powers,
which must be explained before importing a key or choosing recovery. These user
flow disclosures belong to the surrounding implementation and documentation work.
