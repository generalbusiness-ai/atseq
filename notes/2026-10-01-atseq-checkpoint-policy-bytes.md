---
date: 2026-10-01
status: independently reviewed; P4-A through P4-D corrected; joint schema/vector gates and implementation open
examined_at: bcc9c92cf194b27f23f0b347ef67e6c707b8a978
materialization_note_at: b27ed603e39e8a5247632f88c337fa331a44b695
native_wire_note_at: 10e656b3594e41cfa096c03e390cc721776cf57e
request: 1f13a0dcbbae3fd55a08049416ef16175a66c72d
promise: 75852b84bcbd905e954b3fb8a81fc9a425b41b68
---

# Checkpoint assertion and restore policy bytes

Use the supported checkpoint assertion format to interpret exact checkpoint bytes
retained through NW0's existing byte chunks and manifests. Version 1's authority is
native app publication. The reader can load complete asserted duplicate indexes
or explicitly defer their prior-prefix audit. Neither choice manufactures a
trusted local execution history or enables an ordering writer from an incomplete
index. Independent audit starts from the pinned genesis.

This is the concrete outer assertion and restore-policy proposal following
ratified review `0412eb82bd82f1b0aad682dfe73acc108bb87d47` of the
[materialization note](2026-10-01-atseq-materialized-checkpoints.md).
P3/P4 implementation remains open. NW0's exact source basis is
`10e656b3594e41cfa096c03e390cc721776cf57e`; root has confirmed that corrected
recovery-over-govern D5 and NW0-3 are ratified. Its five-field fold metadata is
`app/genesis/position/principal/execution`. This proposal neither extends that
metadata nor changes appointments, grants, source identity or authority outcomes.
NW0's owner confirmed that existing byte manifests can transport these separately
reviewed payloads without adding a native content-body union member.
Ratified review `3f022792302ccc8a52fca4ef1d693bb961335017` accepts the trust and
restore-equivalence direction and requires P4-A's local reader choice. This
successor also adopts P4-B through P4-D: derive pending history, omit constant and
duplicated fields, and bind a stall to precisely the first uninterpreted entry.

## Exact bytes and identity

Every object proposed below is a closed plain-JSON object. Its bytes are the
existing canonical JSON encoding: sorted object keys, unchanged array order,
owned values, strict UTF-8, no insignificant whitespace, no duplicate keys, unsafe
numbers, negative zero or unknown fields. Decode and re-encode must reproduce the
exact bytes before use. CID fields in these JSON payloads are canonical CID
strings, not JSON link wrappers. Signed/native records retained as evidence keep
their exact canonical CBOR bytes; do not reconstruct signatures from JSON.

A payload reference is the CID of NW0's complete `byteManifest` content record.
Its ordered chunk links resolve to NW0 `byteChunk` records, using full-size
32 KiB chunks except the last, with exact byte-length checks. Published manifest
and chunk paths derive from their native content-record CIDs. Local/archive bytes
can be reconstructed by exact CID without claiming current native membership.
There is no invented authenticated lookup tree, state accumulator or new content
union. A manifest is retention framing, not proof that its contents are correct.

Assertion identity is its manifest CID, which commits to its complete canonical
payload bytes. Neither a payload nor its manifest contains its own CID. A caller
accepts the supported format/version and app trust independently of the supplied
checkpoint. A checkpoint cannot install a trust rule or select the reader's mode.
Literal manifest/chunk CIDs and native/JSON vectors must be frozen from the final
NW0 encoder before implementation; this note does not fabricate them.

## Reader mode is local configuration

The caller configures `priorIndexes` as `complete` or `deferred`; this is not a
producer field, policy payload or policy CID. Version 1 of
`atseq-checkpoint-assertion` implies `native-publication-v1`. Complete mode loads
both non-null prior indexes before prefix extension, verifies exact bytes and
internal consistency, and still treats historical completeness as an app-authority
assertion. Deferred mode loads neither index and does not claim complete prior
uniqueness merely because a suffix or sparse receipt is valid. Both modes check
known retained tuples and every new suffix duplicate, and preserve known floors.

Neither mode enables `certify`, changes genesis observation policy, app-control
powers or semantic descriptors, or permits a portable asserted-index ordering
writer. A stronger certification needs a new separately reviewed assertion
version/format. A writer-restore trust change likewise needs separate review.
Changing this transport/consumer configuration never rewrites signed actions or
their execution contracts. A producer carrying both tables can be read in either
mode according to the caller's independently chosen policy.

## Assertion payload

Version 1 has exactly these fields:

~~~text
format: "atseq-checkpoint-assertion"
version: 1
app: account DID
genesis: genesis CID
head: {position: nonnegative safe integer, entry: CID}
frontier: {position: nonnegative safe integer, entry: CID}
definition: active definition CID
state: payload-manifest CID
authority: payload-manifest CID
requests: table-manifest payload CID | null
descriptors: table-manifest payload CID | null
outcomes: table-manifest payload CID | null
history: table-manifest payload CID
sources: table-manifest payload CID
evidence: table-manifest payload CID
stall: {position: positive safe integer, entry: CID,
        diagnostic: string of at most 1024 characters} | null
producer: execution-provenance payload-manifest CID
~~~

Position zero's entry is genesis. Require frontier at or before head, exact
matching tips when equal, and coherent active source/state/authority at frontier.
Derive semantic and observation policy from the pinned genesis; do not copy them
into assertion fields. The history inventory names the contiguous prefix through
head. Derive the pending tail as history positions frontier+1 through head, empty
exactly when frontier equals head. A stall, when present, has position exactly
frontier.position+1 and entry equal to that first history row's entry CID. Require
frontier below head before this addition, so an empty tail cannot have a stall.
A pending tail may also be
unattempted without a stall. `diagnostic` is producer availability information,
never a replicated denial or evidence that the next entry is invalid.

State payload bytes are exactly the complete canonical domain JSON, without a
wrapper that changes state depth/size. Authority payload bytes are the complete
I2 checkpoint projection under the supported NW0 authority serializer: control
tip/powers, owner/role revisions, principal anchors and retired epochs, accepted
observations/floors, immutable grants and terminal tombstones. P3's complete
restore checks apply. Do not use an app-provided `verified` flag or invent another
authority operation union. The exact I2 projection row schemas and literal
genesis/disabled-role/retired-epoch vectors remain a joint NW0/P3/P4 gate; approving
this outer policy alone does not waive them.

The producer supplies both requests/descriptors or both null. A reader in complete
mode requires both and validates them; a reader in deferred mode loads neither
regardless of presence, and labels prior uniqueness coverage deferred. Non-null
tables assert complete coverage through head. Outcomes, when
present, cover every position through frontier; null makes no historical-outcome
correctness/availability claim. Audit can reconstruct omitted outcomes and
indexes, but must distinguish reconstruction from comparison to a claimed table.
Inventory references are retained even when a deferred reader has not loaded them.
Local materializations may have selective outcome coverage after importing a
checkpoint which omitted historical outcomes (S1, approved `93eaeffc`). Store
those rows by actual position; do not assume a dense array beginning at one or
re-export a partial table as complete. An absent outcome at/before interpreted
frontier is unavailable history, or a fault if promised coverage is violated;
it is never permanently pending. A version-1 assertion with partial local outcome
coverage uses null outcomes rather than inventing a sparse completeness claim.

The producer reference records claimed public execution provenance. Native
publication authenticates that claim; copied producer metadata is not evidence
that an untrusted producer actually ran the asserted build. Portable assertion
acceptance is therefore separate from P3's trusted-local execution restore.

Keep publication proof outside these assertion bytes. It contains the selected
native root, caller-accepted I1 app-binding evidence, assertion/manifest/chunk
membership and required genesis/head/boundary proof bytes. An assertion must not
contain the root of its own publication, which would create a CID cycle. The
selected head may be later than the asserted head; prove coverage and the exact
asserted boundary, then verify the suffix. Do not relabel older receipt roots.

## Flat inventories and bounded pages

A table is canonical JSON with exactly:

~~~text
format: "atseq-checkpoint-table"
version: 1
app: DID
genesis: CID
kind: requests | descriptors | outcomes | history | sources | evidence
through: {position, entry}
rows: nonnegative safe integer
pages: [{payload: page payload-manifest CID, rows: positive safe integer}]
~~~

Every page is a canonical JSON array of rows. Empty tables have zero rows and no
pages. Page order is retained; require the sum of page row counts to equal rows
without unsafe arithmetic. Verify kind, scope, through, exact page bytes, counts
and global order/uniqueness across page boundaries before claiming a complete
table. Page position is framing, not another app position. A caller cannot select
row types or swap a table from a different frontier merely because its CID verifies.

The row responsibilities are fixed; exact retained records remain NW0 bytes:

| Kind | Rows and canonical order |
| --- | --- |
| requests | Position, entry CID and request CID for every ordered entry; signed-origin rows additionally contain canonical actorKey and exact nonce, account-origin rows use no invented signer/nonce. Position order. Construct unsigned-CID and signer/nonce access paths from the same rows, never two unrelated completeness assertions. |
| descriptors | Descriptor CID, first consuming position/entry and operation/request CID. Canonical descriptor-CID order; no second use. |
| outcomes | Position, entry CID and exact supported outcome. Consecutive position order through interpreted frontier. |
| history | Position, entry CID, exact request/entry byte-manifest references and required observation references. Consecutive position order through verified head. |
| sources | Exact definition CID, original manifest-byte reference and each declared file's RawCID / byte-manifest reference, preserving supplied file-table order and unused assets. Definition-CID order; active definition and every required historical activation closure retained. |
| evidence | Exact content/block CID or supported RawCID, its byte-manifest reference and I1/N1 evidence context. Canonical CID order, one exact value per CID. Binding/proof contexts retain their own roots; no mixed-root proof. |

Rows are a proposed projection of supported NW0 types, not permission to encode a
new action, grant or observation schema. Freeze their complete closed JSON schemas
and account-operation/signature/nonce encoding vectors jointly before runtime.
Use canonical unpadded-base64 for a retained nonce projection and compare it with
the original bytes; never substitute a random new nonce. A full trusted-local
restore derives indexes from retained requests and compares these rows/inventory.
A portable complete-index reader validates the asserted tables; full replay
independently derives and compares them.

The first page admission budget is 128 KiB canonical JSON/depth 32, matching the
existing wire JSON bound. Split pages before that bound and reject a single row
which cannot use the supported projection. The table inventory itself uses
bounded byte manifests; it need not fit in one native block. Apply NW0's manifest
limit and local aggregate restore/transfer/quota limits before parsing or fetching.
Current host history policy is 20,000 entries; rows/tables cannot imply unlimited
allocation from a safe-integer head. Valid larger history/package exceeding local
capacity is unavailable, not invalid app history. A malformed checkpoint remains
an invalid checkpoint without blaming otherwise valid ordered app history.

## Actual provenance and reviewed restore mapping

Normalize actual execution provenance as a canonical JSON payload with exactly:

~~~text
format: "atseq-execution-provenance"
version: 1
environment: node-source | node-distribution | browser-bundle
runtime: {name: "node", version: exact Node runtime version} | null
source: source-inventory payload-manifest CID
dependencies: dependency/file/resolution-inventory payload-manifest CID
outputs: output-inventory payload-manifest CID | null
~~~

Inventories commit to exact reviewed path/hash or dependency-resolution data;
they contain no secrets. Node-source has no emitted outputs; distribution/browser
has a non-null exact output inventory. Node validates actual installed files and
resolution; distribution compares actual outputs to accepted build provenance.
The browser installation adapter checks trusted bundle output identity and
accepted build input inventories, not a nonexistent browser filesystem audit.
Its runtime field is null: the browser platform is a trusted execution assumption,
not an attested browser-binary inventory. Capture actual Chromium version in test
evidence without treating a user-agent string as an integrity proof. Node-source
and Node-distribution require the exact Node runtime field.
An uncompromised origin is an assumption; XSS/privileged extensions can replace
trusted IndexedDB state. This normalized identifier does not replace those checks
or claim that the browser adapter detects compromised browser/platform software.

The local restore mapping is canonical JSON with exactly:

~~~text
format: "atseq-local-restore-policy"
version: 1
semantics: application semantic CID
observationPolicy: CID
from: old actual execution-provenance payload-manifest CID
to: installed target execution-provenance payload-manifest CID
equivalence: independently accepted equivalence payload-manifest CID | null
~~~

Same from/to requires null equivalence. Different from/to requires an independently
accepted directed equivalence decision with exactly:

~~~text
format: "atseq-execution-equivalence"
version: 1
from: old actual execution-provenance payload-manifest CID
to: new actual execution-provenance payload-manifest CID
semantics: {native: CID, application: CID, evaluator: CID}
observationPolicy: CID
review: canonical workroom assessment event reference
evidence: evidence-inventory payload-manifest CID
~~~

Version 1 implies full equivalence of accepted prefix, state, authority, source,
retry/descriptor indexes and outcomes. No claims field or partial-scope language
is supported; a future partial-equivalence format needs separate review. The
release/installation trust adapter accepts the decision CID and ratified
independent assessment through its configured approval path. An app, snapshot,
unsigned review reference or copied approval file cannot grant that acceptance.
Require both actual provenance objects, exact installed target matches, unchanged
native/application/evaluator descriptors and observation policy, full version-1 scope
and directed from/to equality. No inferred transitive chain or wildcard build
approval. The `review` reference is informative only; runtime cannot turn that
workroom event string into acceptance authority. The independently configured
installation adapter approval path is the authority. Evidence binds reviewed
changes/conformance and required projection
equivalence. Missing decision, unsupported scope, changed semantics or failed
actual integrity checks requires replay rather than reuse.

This policy records the existing-contract equivalence route recommended in
P34-1; it does not itself approve any build pair. Newly imported portable assertions
do not become trusted-local histories by presenting such a decision. After an
independent full audit under accepted execution, P3 may persist its locally
established provenance and capability through its normal trusted-store boundary.

## Verify, restore and audit without conflating their claims

1. Check the external app/genesis pin, supported caller-accepted format/version and
   genesis semantic/observation policy. Obtain accepted I1 binding, authenticate
   the selected native publication and reconstruct exact assertion bytes.
2. Check outer fields, scope, head/frontier relationships and required inventory
   references. Preserve every known app floor. Reject a behind/conflicting
   checkpoint; for an ahead checkpoint require the exact bridge from the known
   floor. New genesis does not replace an old floor.
3. Load bounded state, active exact source and complete authority. Complete mode
   additionally validates both prior indexes before extension; deferred mode
   exposes its incomplete prior uniqueness coverage. Source definition is
   512 KiB/64 unique blocks, whereas retained source pool is 16 MiB/2,048 blocks;
   closure transport allowance does not enlarge definition semantics.
4. Verify all suffix paths under one selected root, chain/signatures/known and
   suffix duplicates through P2/N1, and interpret under I2/C0. Preserve an exact
   stall, pending tail and separate frontiers. Commit the locally accepted
   assertion-backed materialization with its weaker assurance intact; do not
   mint a fully replayed prefix or ordering-writer readiness.
5. Audit the fixed assertion CID, native root, head and interpreted frontier from
   genesis, using retained target-root proofs and historical observation/source
   evidence. Never seed state/authority/indexes from the assertion. Compare all
   claimed components at their exact frontiers, and report independent identity
   observation assurance separately. No resolver/clock/OAuth input rewrites replay.

P4 audit results are local facts, not fields by which an assertion certifies
itself. Pending, stalled, matched and mismatched results remain separately bound
to the immutable target and independently checked frontier. A completed audit
does not upgrade an unrelated newer generation. Preserve mismatch evidence, stop
dependent promotion, and recover under retained floors; previously recorded work
cannot be silently rewritten or undone. Known malformed/signature/chain/duplicate
faults fail closed; missing bytes and local proof/storage budgets are unavailable;
authenticated absence of a claimed required record is a distinct invalidity.

## Evidence still required before implementation

Freeze canonical payload/page bytes, chunk/native record CIDs, supported
projection schemas and same/changed-provenance policy vectors after joint review.
Node and real Chromium must use the same corpus: unsupported format/self-authorized
trust, cross-app/genesis/frontier table swaps, count/order/duplicate corruption,
complete versus deferred coverage, initial/disabled roles and retired epochs,
recover-over-govern state, nonce/descriptor duplicates across the checkpoint
boundary, source table order/unused assets, repaired stalls, archive-root mixing,
false state/authority/index assertions, matched/mismatched fixed-target audit,
quota/crash/whole-store rollback, compromised-origin limits and unapproved versus
approved actual cross-build restore. Reuse P3/P4's larger adversarial matrix.

Capture literal producer and independently accepted equivalence identities and
the actual installed-source/bundle checks; semantic CID equality alone must fail
the changed-build reuse case. Measure complete/deferred bootstrap, integrity and
index startup, suffix work, state folding and audit separately with no fixed
latency target. The predecessor's removed policy strings were mechanically checked
and hashed, but are no longer proposed protocol bytes. No schema/runtime edits, runtime tests, builds or
benchmarks were run for this source-only proposal. Exact vectors and implementation
remain open.
