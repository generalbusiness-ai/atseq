---
date: 2026-10-01
status: corrected internal observer proposal; successor decision review required
baseline: 9c345e8fb5e27b29265c69614d9d9ddfb52de301
request: 78f93cda6b29274d80616afe4fe1fef4bb97f10e
promise: cc8b5a9ef438fb4ea3d8874a264a8524aed32a53
parent-request: 71b93a9c916f99f9828da61d3737553117e454ab
assessment: 3141a57333cca9d3530016c73615d5d1ef5ab6be
---

# Native observation and public evidence retention

Propose a host-only observer that captures the public evidence required by the
adopted [account admission design](2026-10-01-atseq-account-admission-design.md),
then builds the existing native observation or app-binding content. It uses the
installed I1 interpreter and guarded `IdentityFetch`, P1 native proof capabilities
and maintained CAR utilities. It introduces no dependency, private key, OAuth
client, custom resolver, live replay lookup or observer signature.

Ratified assessment `3141a573` accepts the direction and the untrusted last-row
PLC candidate helper, with required batching and source-refusal corrections.
This successor adopts those corrections. Original proposal `8ab04b3e` and its
source-inspection manifest remain unchanged in Git history. No runtime or provider
approval follows from this source-only decision.

This is internal preparation. Native framing source `cf2dc095` and authority
foundation `d08104dd` define the proposed interfaces, but a supported native
semantic/profile and public policy-dispatch ABI are not yet adopted. A captured
descriptor cannot appoint its policy, authorize a device, authenticate its own
app publication or establish an independently trusted app bootstrap binding.

## API and ownership

Own `src/host/native-observer.ts` and, if needed, a narrow portable CAR-composition
helper. Reuse protocol framing and the existing authority snapshot/context APIs
without changing their source or package exports. The proposed internal API is:

| Operation | Input and result |
| --- | --- |
| `NativeObserver.fromAnchor` | Explicit external app/genesis pin and retained policy reader. Load the exact genesis-appointed policy CID, check closed native content and supported fixed algorithm, directory origin, web allowance and checkpoint mode. Private owned configuration; no caller binding/key/permission callback. |
| `prepareAccount` | Opaque prior I2 state and a fresh account-operation subject without its observation reference. Scope, intended position/predecessor and expected floor/epoch must match the captured prior. Derive principal, required record paths and exact requested grant/revoke/epoch references from the operation. |
| `prepareRecovery` | Opaque prior I2 state and a fresh unsigned recovery intent without its observation reference. Validate the complete typed subject, captured prior scope/frontier and actor nonce. Final actor signature and control authority remain I2 checks. The observer never signs the request. |
| `observePrepared` | An owned preparation, cancellation signal and optional diagnostic timestamp. Return either a privately owned capture with descriptor CID/content blocks and the completed account operation or unsigned recovery intent, or a distinct source-subject refusal. |
| `observeApp` | Explicit anchor and either genesis bootstrap or a checked native entry. Derive exact native paths/CIDs and observe the application account using the same method/proof sequence. Return either retained app-binding/proof capture with assurance or a distinct source-subject refusal. Capture is an observation assertion, not an external bootstrap trust capability. |

Returned byte arrays and projections are owned copies. WeakMap-backed preparations
and captures cannot be reconstructed by parsing arbitrary JSON. Retained content
and descriptors themselves remain ordinary content-addressed records; the opaque
capture is not an I2 accepted-entry or authority capability. Both observing APIs
use an internal discriminated result, separate from an ordered history outcome:

```ts
type ObservationResult<Capture> =
  | { kind: 'captured'; capture: Capture }
  | { kind: 'refused'; refusal: NativeSubjectRefusal };
type NativeSubjectRefusal =
  | {
      code: 'subject_absent';
      path: string;
      expectedCid: string | null;
      observedCid: null;
      root: string;
    }
  | {
      code: 'subject_replaced';
      path: string;
      expectedCid: string;
      observedCid: string;
      root: string;
    };
```

Refusal data is an owned immutable diagnostic projection. `expectedCid: null`
means a required existing path, such as `epochCurrent/self`, whose record CID
was not fixed by the request; it does not mean the path was optional. A replaced
subject always has an exact expected CID. A refusal creates no descriptor,
completed request, receipt, accepted authority or new history outcome.

Completed original signed/request retry lookup belongs before this API. It must
use the original exact unsigned request CID and actor retry tuple, return an
existing receipt when available and bypass observer work. An omitted-observation
subject is a new preparation, not the original signed retry. It cannot be silently
retargeted to a new predecessor, floor, epoch or descriptor. Reusing a known actor
nonce for fresh preparation fails before remote work. A descriptor and final
request CID do not exist until construction; their final duplicate checks run
after construction and before publication. I2 repeats them on ordered acceptance.

The observer holds the captured prior object. The host must recheck that same
prior before publication; a newer app frontier requires an explicit new unsigned
preparation or preserves the old exact signed request for N1 retry handling.
There is no callback that supplies an arbitrary supposedly accepted prior.

## Method observation and selected-root proof

Use one `IdentityFetch` reservation for the complete observation, with its
30-second deadline, 64-request and cumulative 32 MiB body limits shared across
retries. Permit at most three complete attempts, restarted only for an observed
method-binding/tip change or a different selected root during full-export recovery.
All requests are sequential,
credential-free, redirect-refusing and uncached; private-address/DNS rebinding
checks apply at connection time. Cancellation and missing/over-budget responses
are unavailable. A new attempt does not reset the shared network budget.

1. Fetch exact method bytes from the appointed PLC directory audit path, or the
   maintained hostname `did:web` URL. Verify the PLC full log, compute its canonical
   tip and derive the binding through the same `deriveIdentityBinding` used by
   replay. Web uses exact document bytes and the same extraction. A packet cannot
   supply a selected older PLC operation or its own directory/key. PLC document
   fetching is omitted.
   The existing extractor requires an asserted tip CID. A narrow online helper
   may take the last audit row's CID as an untrusted candidate after the same
   strict bounded JSON precheck, then pass the untouched response and candidate
   into the existing full verifier. Its computed canonical-tip equality remains
   decisive; the precheck never supplies a key, filters nullified branches or
   selects an earlier convenient operation. This adds no second PLC verifier.
2. Fetch `com.atproto.sync.getRecord` for the exact primary subject from the
   derived PDS. It selects the current repository commit. Authenticate the commit
   DID/signature under the observed binding with P1, preserving that exact commit
   as the selected root. Additional records are looked up under this root; another
   `getRecord` response cannot select or complete it.
3. Run a P1 lookup pass over every currently known required path. Collect and
   deduplicate every returned missing CID before making a request. Fetch that
   entire discovery round through `sync.getBlocks`'s `cids[]` parameter, chunked
   only at the numeric 64-CID per-request cap and within the remaining response/body
   budget. Repeat the lookup pass after filling the round, including newly
   discovered epoch paths. Do not issue one request per CID. The maintained-CAR
   adapter allows at most 64 returned blocks per getBlocks response, with the
   existing per-block and response byte limits. It verifies every block hash and
   requires exact requested/returned CID-set equality: extra or unrelated blocks
   are input errors; an omitted requested CID is unavailable. Duplicate blocks
   still count against the 64-block response cap and cannot add another CID.
   Compose the hash-verified requested blocks around the original selected signed
   commit and reauthenticate with `expectedRoot`. The adapter cannot select a
   returned response root, a new commit, or an arbitrary claimed-key root.
4. If exact-block recovery is unavailable, allow one bounded full `getRepo`
   recovery in an attempt. Authenticate it under the observed binding. A different
   selected root restarts the complete observation, including method observation;
   it cannot repair the old-root proof by mixing commits. No historical-revision
   selection capability is assumed for either endpoint.
5. Fetch method bytes again and interpret them independently. PLC requires the
   same canonical tip CID; web requires the same principal, canonical key and PDS.
   A changed binding/tip discards the entire candidate and retries. A proven
   absent/replaced subject still gets this after-method observation once before
   returning its refusal. A changed binding takes the bounded rotation-race
   restart; unchanged binding returns the nonretryable refusal immediately.
   Missing or invalid after-method evidence preserves its availability/input
   failure; it cannot certify a stable comparison. On a known
   structural/signature proof failure, this comparison may detect a rotation race
   before deciding whether to retry; an unchanged binding preserves the proof
   error. Unexpected runtime/integrity faults do not become automatic retries.

An unchanged repository head is not required. Later commits may change unrelated
records while the originally selected root remains valid evidence. Before/after
identity agreement does not prove continuous currentness, prevent ABA races or
authenticate unsigned directory metadata. The host/app-PDS currentness assertion
and PLC authorized-history assurance remain separate.

Busy-account liveness is bounded rather than guaranteed. A PDS may prune a
selected root's blocks after getRecord and before getBlocks. Exact-CID completion
then becomes unavailable; full-export recovery can select a newer root and force
a complete restart. Repeated writes/pruning can exhaust the three attempts or
shared network budget without a capture. Include a deterministic fixture that
writes/prunes between these endpoints on every attempt and confirms this bounded
unavailability, no mixed roots and no manufactured stable-subject refusal.

The proof adapter proposes the existing P1 native maxima: at most 32 MiB input
CAR, 1 MiB per native block, 100,000 blocks, 16 KiB header and depth 64. For this
portable retained-proof foundation, also cap the final unique CAR/cache at the
16 MiB/50,000-block portable preset. Keep the original commit in each composed
authentication input, and retain one final deduplicated proof CAR. These are local
resource refusals, not claims that a larger account is invalid. No full-tree audit
or new MST implementation is added. At most 16 exact subject records must fit
the existing native observation framing; epoch catch-up that needs more cannot
silently become destructive participant recovery.

## Record and retention construction

The operation determines the required subject set, not a caller-provided list.
Grant admission proves its exact grant CID, `epochCurrent/self`, and the selected
epoch predecessor path to the prior accepted anchor. Initial admission needs the
selected current transition only. Epoch advance proves the current pointer and
required transition path. Revoke import proves only the exact revoke record.
App-appointed participant recovery proves the requested current fresh transition;
I2 checks its authorization, prior expectation and never-accepted epoch rule.
All issuer identity comes from the authenticated repository DID. Shared native
record decoding closes fields and enforces path/CID/ID links.

A selected root proving the requested source record absent, or proving a changed
CID at that path, prevents construction. After one successful stable after-method
comparison, return `subject_absent` or `subject_replaced` with exact path,
expected/observed CID and selected root. This is a deterministic nonretryable
preparation refusal, not `content_unavailable`, an automatic three-attempt
failure or an ordered effectiveness verdict. The caller must explicitly prepare
again from current state; the observer cannot retarget the old subject or hide
the refusal behind another root selection. A changed binding/tip instead follows
the complete bounded rotation-race restart. Malformed CAR/tree/record evidence
remains a protocol input error. If a later ordered
descriptor falsely claims the absent record, I2 still treats that assertion as
invalid history. A valid old-epoch grant that remains published can be retained;
I2 may order it ineffectively while advancing its accepted observation floor.
The observer must not reinterpret that as a revoke or union another grant's scope.

Retain exact before/after raw response bytes, with 1 MiB PLC and 32 KiB web limits.
Chunk them into the existing 32 KiB byte-content records and ordered manifests.
Identical chunks/manifests share their CID. Retain the final composed proof CAR
through the same representation. A bounded owned map collects these public blocks
and descriptor content for one successful capture; failed attempt content is not
returned as accepted evidence. Do not retain tokens, cookies, authorization
headers, private keys or authenticated account responses.

The descriptor pins the genesis policy CID, requested account DID, complete
omitted-observation subject hash, app/genesis/intended position/predecessor,
extracted canonical key/PDS, exact source URLs, selected root, sorted exact subject
path/CID rows, proof reference and typed before/after method slots. `observedAt`
is diagnostic only; callers may supply it or the host may fill it once. It never
affects replay, expiry, ordering, floor acceptance or the PLC recovery window.
Assurance is derived from the verified typed method slots and must be preserved
in exported capture metadata and eventual UI/receipts.

Application binding is constructed after its selected native publication exists.
For a receipt, observe the exact published entry path/CID plus genesis, not a
caller-supplied old CAR labelled current. Retain the binding/proof outside that
selected root for receipt/archive transport; do not require the root to contain
the app-binding object that references it. A newer observed root containing the
entry may be selected. It must match the returned app-binding/proof root exactly.
Genesis bootstrap follows the same explicit external pin and cannot establish
that the operator trusted a web snapshot merely by capturing it.

PLC evidence prevents inventing an existing principal's authorized key history,
but an observer can still withhold later authentic history and claim stale
currentness. With web evidence, the app PDS can fabricate DID bytes, a matching
participant root and grants for any claimed web principal without controlling
its hostname. Participant PDS custody permits grant publication/replacement,
not device signature forgery. No independent observer or WebVH policy is implied.

## Source evidence and implementation gates

The current official
[`getRecord` Lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/sync/getRecord.json)
accepts DID, collection and record key and returns current-record proof CARs;
there is no revision parameter. The
[`getBlocks` Lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/sync/getBlocks.json)
fetches exact block CIDs. The [sync specification](https://atproto.com/specs/sync)
separates signed repository data from identity/currentness and calls for private
address protection on outbound requests. These primary sources were checked
on 2026-10-01.

Pinned fixture `@atproto/pds@0.5.31` calls `storage.getRoot()` in its getRecord
handler. Its `@atproto/repo@0.10.12` provider writes the selected commit and path
blocks into a CAR rooted at that commit. The getBlocks handler instead calls
`blocksToCarStream(null, got.blocks)`, producing an empty root list. That endpoint
reads stored exact CIDs without accepting a root/revision selector. The
[source-inspection manifest](../experiments/post-spike-evidence/2026-10-01/identity-observer-preparation/source-inspection.json)
records exact file and fixture-lock hashes. This is source evidence, not a runtime
provider-success claim. No installation, graph change, build or observation test
has been run for this proposal.

Before implementation, independently review the API/preflight boundary, guarded
shared retry budget, batched CAR composition/exact-set checks, selected-root
recovery, typed nonretryable source-subject refusal and externally trusted
app-bootstrap requirement.
Then exercise deterministic public fixtures for both methods/curves, sparse
missing-block completion, wrong/withheld CIDs, malformed and unrelated blocks,
root change, unchanged-key PLC tip change, key/PDS migration, ABA limits, canceled
and over-budget responses, no-network replay and exact descriptor linkage.
Include multi-path batching with shared missing nodes, per-request/per-response
caps, omitted/extra blocks, stable absent/replaced refusal without automatic retry,
one after-method check before refusal, changed binding overriding the pending
refusal with a complete restart, and busy-root pruning between record/block reads.
Production network refusal/rebinding checks must exercise `IdentityFetch` on
Node 22.19, 24 and 26; mock success alone is not provider interoperability.
Policy/support dispatch, ordering/floor acceptance, public exports and real
provider trials remain later joint integration gates.
