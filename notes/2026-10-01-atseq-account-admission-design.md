---
date: 2026-10-01
status: independently accepted direction with canonical-tip correction; implementation pending
examined_at: 66977be7e59527eccf3df91c55285e55914f3add
request: 71b93a9c916f99f9828da61d3737553117e454ab
---

# Account admission and retained identity evidence

Recommend one online observation operation for each new account authority
admission, followed by deterministic interpretation of its retained evidence.
For PLC accounts, retain and verify the signed operation audit log by default
with maintained `@atcute/did-plc` 1.0.2 and derive the binding from its computed
canonical tip through `normalizeOp`. For hostname web accounts, retain the
observed document with its weaker historical assurance. Use one extraction
function for both online admission and offline replay, P1's native root verifier,
and the application's publication authority. Add no observer signing key,
live replay resolver, or custom PLC signature/recovery verifier.
The default PLC policy requires its typed history slot; unavailable/over-budget
history does not downgrade to an observation-only binding.

This proposal implements the observation boundary in the adopted
[native authority decision](2026-10-01-atseq-native-authority-decision.md).
It does not select the final grant, account epoch, governance certificate or
ordering envelope fields. I2 owns those authority records; N1 owns their ordered
references and native retention. The
[activation compatibility decision](2026-10-01-atseq-activation-compatibility.md)
owns the default per-action execution contract scope.

Independent assessment `cc21a77c` accepts the direction and dependency choices,
requires rejecting an earlier selected operation in a full PLC log, and recommends
deriving PLC binding directly from its verified tip. This revision adopts both.
The support change to Node >=22.19 and transport/closure costs are explicit below;
implementation evidence and exact-head review still gate landing.

## What an admission establishes

An online observer checks the principal's supported DID, resolved PDS and current
repository signing key, and a specific authority record under one signed
participant repository root. Its retained observation says that this check
succeeded under a named policy. It does not prove global freshness, uninterrupted
control of the DID, user interaction, or the absence of another repository root.

The default observer is the application host. The app PDS authenticates its
observation by publishing it under the app's native root. Readers trust the
host's check and the app PDS for the claim that the evidence was observed current.
An independent
observer is a separate policy requiring explicit appointment and its own evidence;
do not put an unused observer signature into the default format.

Under an observation-only policy, the app PDS signer can fabricate DID response
bytes naming its own key, then sign a participant root and grant for any claimed
principal. It can do this without the host's involvement. A later external audit
can expose the false binding; offline replay cannot. This is the default web
account limitation and would also apply to PLC without retained signed history.
The proposed PLC history requirement blocks invented bindings for an existing
PLC DID unless an authorized rotation key is available. It still permits old
authentic history to support a false claim of currentness. No app-PDS signature
makes unsigned DID bytes or directory metadata independently authentic.

Participant repository-key custody also matters. A participant PDS holding the
account repository signing key can publish or replace a grant record. Native
membership authenticates account-PDS publication, not a separate act of user
consent. It cannot forge an uncompromised device's signature over an intent.
I2 must pin each admitted immutable grant CID and reject implicit replacement or
scope expansion; a changed record at the same path is a new admission candidate.

## Small retained evidence shape

Retain one content-addressed observation descriptor and its public evidence
blocks. Its proposed logical fields are:

| Field              | Meaning                                                                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `policy`           | Exact observation-policy CID appointed by genesis or accepted governance; a packet cannot appoint its own policy.                                                                                                                                      |
| `principal`        | Requested account DID; also the authenticated participant commit DID.                                                                                                                                                                                  |
| `binding`          | Canonical PDS origin and canonical repository signing `did:key`.                                                                                                                                                                                       |
| `identityEvidence` | Typed before/after evidence: `plc-audit-v1` (signed audit response and asserted canonical tip CID) or `web-observation-v1` (DID document). Each slot names bounded exact response-byte manifests and source URLs. Identical evidence can share blocks. |
| `repositoryRoot`   | Exact authenticated participant commit CID. Signed revision and data CID are available from that commit, not duplicated authority fields.                                                                                                              |
| `records`          | Exact native path/CID pairs required by I2 for this operation. A grant path/CID is mandatory for grant admission. All pairs use this participant root.                                                                                                 |
| `proof`            | References to retained CAR/block evidence sufficient to authenticate that root and those paths. Deduplicate shared blocks.                                                                                                                             |
| `observedAt`       | Diagnostic host time only. It must never participate in admission, replay, expiry, PLC window checks or any other authority decision.                                                                                                                  |

The descriptor is an assertion until its authorized native app membership and
referenced evidence are checked. Exactly one I2 authority operation may consume
its CID, and that operation's exact subject path/CID must appear in `records`.
A second consumption is a duplicate; I2 owns its verdict. It is not a reusable
bearer credential. I2/N1 should refer to the
descriptor CID rather than copy its nested bytes into every intent or entry.
Only public evidence is retained: no OAuth tokens, passwords, cookies, private
keys, authorization headers or authenticated account responses.

Response evidence retains the exact bounded UTF-8 JSON bytes. A response manifest
references ordered CBOR byte chunks of at most 32 KiB each; reconstruction checks
the manifest's total byte length and policy limit. This accommodates a PLC audit
response without relaxing the 64 KiB Atseq evidence-block limit. The requested
DID, source URL and extracted binding are checked against the descriptor. The
bytes explain the observation; web documents are not self-authorizing evidence.
The policy specifies JSON parsing and method-specific binding extraction without
fetching JSON-LD contexts. PLC DID-document responses, if fetched for diagnostics,
are outside authoritative identity evidence and cannot replace the signed tip. Transport metadata remains diagnostic.

For offline replay, the caller must first trust the selected app root through a
pinned retained app binding or an explicitly performed online archive observation,
and verify genesis plus the accepted policy/authority chain. Then verify the
observation's native app path/CID, extract its asserted participant binding, and
authenticate the participant root and exact record membership under that binding.
Derive the record issuer from the participant commit DID. A record's redundant
issuer, if I2 includes one, must agree. Never accept an archive document as the
initial app trust anchor, infer authority from a document's presence, or fall back
to live resolution when retained evidence is missing.

Use P1's raw membership bytes and CID. Atseq authority records must pass the
existing strict 64 KiB/depth-32 block decoder before I2 interprets them. Missing
proof blocks stall replay; invalid signatures, altered bytes or path/CID mismatch
invalidate the asserted proof. Required-record absence proven under the selected
root invalidates an authority assertion claiming that record. An authentic
well-formed action naming an unadmitted grant remains ineffective, as D0/C0
require; missing evidence must not be converted into that verdict.

## One deterministic identity interpreter

Propose `deriveIdentityBinding(policy, principal, typedEvidence)` as the only
binding interpreter. It is asynchronous only for hashing/signature verification;
it consumes exact retained bytes, reads no clock and performs no network calls.
Admission runs it on the captured bytes, then replay runs the same function on
the referenced bytes. A resolver's zod/valibot result may be a precheck, never the
source of the accepted binding. The policy CID fixes these rules:

- Apply response length limits before parsing. Reject UTF-8 decoding errors and
  an initial UTF-8 BOM; do not silently strip or replace bytes.
- Require strict JSON: no comments, trailing commas or trailing values. Reject
  duplicate decoded property names in every object, including escaped spellings
  of the same name. Bound nesting to 32 before recursive parsing. Use the
  maintained [`jsonc-parser`](https://github.com/microsoft/node-jsonc-parser)
  3.3.1 scanner/visitor for framing, depth and duplicate checks, with comments
  disabled and every error fatal; then use `JSON.parse` on that same text.
  This is one fixed interpretation path, not online/offline parser choices.
- For `web-observation-v1`, a DID document must be an object with own string
  `id` exactly equal to the requested DID. Supplied key/service arrays must be
  arrays within their bound. Missing usable signing key or PDS service fails.
- For web, select the first valid `#atproto` key in array order. Its ID must be
  the relative fragment or that exact DID plus fragment, with controller equal
  to that DID. Accept supported Multikey and legacy p256/k256 representations
  only after bounded decoding and P1 curve validation. Normalize the selected
  point to canonical compressed `did:key`.
- For web, select the first matching own-DID/relative `#atproto_pds` service with
  type `AtprotoPersonalDataServer`. A malformed first matching service fails
  rather than selecting a later endpoint. Ignore unneeded context, handle and
  unrelated fields after bounded JSON checks; never resolve contexts or grant
  power to an inherited property.
- For `plc-audit-v1`, verify the whole retained audit response as below. Require
  the asserted selected operation CID to equal the verifier's computed canonical
  tip CID. Reject an empty canonical result or tombstone tip. Use maintained
  `normalizeOp` on that verified tip's operation, then extract its own
  `verificationMethods.atproto` key and `services.atproto_pds` service with type
  `AtprotoPersonalDataServer`. Neither a document nor an earlier audit row may
  supply the binding. Hash and verify original legacy genesis bytes before
  normalization; do not derive its DID from a normalized projection.
- Both methods use the same bounded key validation and canonical compressed
  `did:key` rule. Both require the chosen PDS endpoint to be an HTTPS origin
  without userinfo, path prefix, query or fragment, normalized to URL origin.
  Its presence supplies routing/race evidence, not a separate signing authority.
- Do not normalize the principal's case. A handle is optional display metadata;
  it does not affect either method's accepted binding.

This is one authoritative function with a typed method branch and shared
key/endpoint rules. PLC binding is signed operation data; web binding is retained
observation data. An optional PLC DID-document fetch can explain an upstream
projection mismatch diagnostically, but cannot change admission, add an equality
requirement or trigger an authoritative retry. The default does not fetch it.

## Retained PLC history authenticity

Use the designated PLC directory's public `/<did>/log/audit` response, retaining
all supplied rows including nullified branches. The proposed typed slot contains
the exact audit response and asserted selected canonical-tip CID. Process every
supplied row, including later valid operations and nullified branches. Require
a complete path from signed genesis and compute `canonical` with the maintained
indexed-log verifier. The selected CID must equal `canonical.at(-1).cid`; an older
non-nullified row is insufficient. Never accept an audit suffix whose starting key
comes from a claimed key or unsigned document.

The exact `@atcute/did-plc` 1.0.2 tarball supplies `defs.indexedEntryLog`,
`processIndexedEntryLog`, `processIndexedEntry`, `normalizeOp` and
`deriveDidFromGenesisOp`. Its maintained verifier derives the exact PLC DID from
the original signed genesis (including legacy `create`), checks each operation
CID, authenticates allowed rotation-key signatures and predecessors, and checks
higher-priority authority when nullifying a branch. It uses retained directory
timestamps for recovery; the `isDisputePeriodActive`/`getDisputeCandidates` clock
helpers are excluded from replay. See
[the maintained PLC package](https://github.com/mary-ext/atcute/tree/trunk/packages/identity/did-plc).

The adapter applies strict bounded JSON first, validates the maintained schema,
and preserves the actual signed operation fields. Require every row's DID to
equal the requested principal, unique operation CIDs, finite directory timestamps
in the declared UTC representation, and nondecreasing audit order. For a recovery
operation, require its timestamp strictly later than the previous canonical tip,
matching the reference directory's additional ordering check. Invoke the
maintained indexed-entry primitives; do not recreate signature or recovery logic.
Require declared `nullified` flags to match the verifier's computed branches, and
reject a computed tombstone tip, even if the packet selects an earlier active
operation. Derive the account binding only from `normalizeOp` on that computed
tip. Its `atproto` key and `atproto_pds` service pass the same canonical-key and
HTTPS-origin rules as web extraction. Reject unknown signed operation/service
fields under the current PLC schemas rather than silently dropping them before
hashing. Preserve legacy genesis bytes for its DID and signature checks. Require
canonical unpadded base64url and compact 64-byte low-S p256/k256 signatures.

These checks authenticate that the account key arose from an authorized PLC
history. Directory timestamps, audit order and nullification annotations are
unsigned. A directory or app-PDS signer can withhold/truncate a valid history,
present an old authentic key as current, or supply a different recoverable branch
with a misleading observation story. A previously authorized retired key can
then forge repository/grant contents. Signed history raises the cost of inventing
an existing principal's binding; it does not solve latestness or historical branch
selection. Selection of an older operation while later canonical operations
remain in the same full retained log is rejected; it is not a disclosed downgrade.
Retained floors and later observer comparisons detect encountered
conflicts, not unseen forks. Do not label this as trustless identity.

Propose at most 1 MiB per audit response, 512 rows, and 7,500 canonical CBOR bytes
per signed operation; these are admission resource budgets, not claims that a
larger historical account is invalid. Limit each operation's arrays/maps to 64
entries before schema/crypto work. Require UTC timestamps in exact
`YYYY-MM-DDTHH:mm:ss.sssZ` form, with parse-and-roundtrip equality. The maintained
verifier copies/scans canonical
prefixes, so its worst-case quadratic bookkeeping is bounded by 512 rows.
Responses share unchanged evidence chunks across observations where possible.
An over-budget history prevents admission under this policy; an operator may
appoint a larger bounded policy. A partial suffix without a retained previously
authenticated chain anchor is not an automatic fallback.

## Observation and renewal policy

Propose the following explicit default, identified by a versioned policy CID:

1. Validate the requested DID and fetch its method's designated HTTPS evidence
   without application or HTTP cache reuse (`cache: 'no-store'`). Capture exact
   bounded response bytes before parsing. For PLC, fetch the audit log from the
   configured directory, compute its canonical tip and derive key/PDS through
   `normalizeOp`. For web, fetch the hostname's well-known document. Run the one
   deterministic interpreter; do not fetch an authoritative PLC DID document.
2. Fetch the grant's public `sync.getRecord` CAR from that derived PDS, accepting
   its signed root as the selected current root. P1 authenticates DID, signing key
   and the exact grant path/CID. If I2 requires additional paths, use P1's missing
   CID results to request exact blocks through `sync.getBlocks`. Compose bounded
   CAR evidence with maintained CAR utilities and the original commit root, and
   authenticate it with `expectedRoot` pinned. Never combine another proof's
   different commit into the selected-root claim. A bounded full/diff `getRepo`
   response remains a recovery alternative; selecting its different root restarts
   the observation. This avoids exporting a large account's whole repository for
   a single grant. Retained blocks assist recovery, not root selection.
3. Fetch and interpret the same typed identity evidence again without cache reuse
   after proof verification. For PLC, require identical computed canonical tip
   CIDs. A different tip retries even if the normalized key/PDS remain equal;
   equal bindings alone do not hide an intervening retained operation. For web,
   require the same DID, normalized key and PDS origin. Other web document changes,
   including handle or unrelated service changes, do not require a retry.
4. If the method's comparison fails, discard the candidate and restart the complete
   observation. Do not combine a proof fetched from the old PDS with the new
   binding. Publish the successful observation only through the I2/N1 authority
   operation which requested it.

The PLC path removes two DID-document requests per complete before/after attempt
and removes an authoritative document-versus-audit mismatch outcome. Its two audit
responses are still verified independently; identical chunks may share storage.
A tip CID comparison is not proof that the directory never changed or withheld
operations between reads.

These public endpoints are native operations: the
[`sync.getRecord` Lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/sync/getRecord.json)
returns a current record proof CAR, and
[`sync.getBlocks`](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/sync/getBlocks.json)
retrieves intermediate MST/record blocks by exact CID. An ordinary JSON
`repo.getRecord` response is insufficient evidence.

Before/after agreement narrows observable rotation and migration races. It does
not prove that no change occurred between reads or after the last read; an ABA
change, stale upstream response or dishonest PDS/directory can escape it. We do
not require two identical repository heads: an active repository may advance
without changing the grant, and repeated equality retries would needlessly
prevent admission. A selected root is a contemporary source observation, not an
atomic transaction spanning DID resolution and repository publication.

Derive the online participant floor from prior successful ordered observations
for that principal in retained app history; restore/replay reconstructs it rather
than trusting a host-only cache. Admission refuses a lower signed revision and
reports a different root at the same revision as an encountered conflict. This
is an admission rule, not an extra replay-invalidity rule. A higher revision is
not proof that the grant was never
deleted or the repository never forked. Recovery which conflicts with a retained
floor needs the explicit reviewed recovery/reset route; do not quietly erase the
floor or infer an account epoch from a signing-key change. The provisional I2
contract permits a lower/conflicting floor only through an explicit certificate from an already app-appointed recovery key plus a fresh
account epoch; ordinary reset proof succession alone cannot override that floor.
I2 owns the final exception and its reconciliation with app history. Neither
route replaces the app's own chain floor or rewrites previous outcomes.

Renew the binding and native root evidence for each new grant admission, reset,
revocation import or other account-authority operation that claims a current
repository observation. Do not reuse an earlier successful observation to admit
a new authority record. An unchanged grant may share bytes, but its renewed
observation/root evidence is a new assertion. Receipt/export renewal follows N1's
selected app-root policy after app signing-key rotation.

Already admitted grants have no implicit wall-clock lease in this default.
Routine account key/PDS/handle changes and deletion of the source grant do not
rewrite old app interpretation or automatically revoke an admitted grant. An
ordered I2 revoke/reset changes effectiveness from its app position. This avoids
making offline results depend on network availability or a reader's clock.
Periodic polling or identity stream hints may trigger an online refresh, but
cannot themselves revoke or establish currentness. If an application needs
automatic time-bound participation, I2 must define a separate explicit expiry
contract and time authority; do not invent one inside this resolver adapter.

User documentation must say plainly: deleting the grant record from your account
repository does not revoke its admitted app authority. Use the app's explicit
revoke or reset operation. Polling may use deletion as a hint to prompt that action;
it is not itself an ordered revocation.

Proposed operational budgets are a 30-second total observation deadline, at most
three complete attempts, and at most 32 KiB per DID response. They bound resource
use, not authority lifetime or a promised revocation latency. Limit extracted
service/key arrays to 64 elements each; reuse P1 native proof/cache budgets.
Propose at most 16 subject paths, 64 proof-completion requests and 32 MiB total
native response bytes per observation attempt. Every completion retains the
original selected root; an HTTP not-found response is unavailable evidence,
not a native absence proof.
Operators may select different bounded budgets through an explicit policy.
Timeout, unsupported method, malformed document, unsafe endpoint and binding race
are distinct outcomes. Unavailable or changing sources prevent new admission;
they do not make existing history invalid or authorize a cached-key fallback.

## Resolver and key implementation boundary

The first proposal reused the locked `@atproto-labs/did-resolver` 0.2.6. Its
[maintained methods](https://github.com/bluesky-social/atproto/tree/main/packages/internal/did-resolver)
already provide URL building and uncached PLC/web requests, but return parsed zod
documents rather than retained bytes. Capturing responses through that wrapper
and then applying another binding extractor complicates the boundary. Prefer its
already locked `@atproto/did` 0.3.0 syntax validators and `didWebToUrl`, promoted
to an exact direct dependency, with the bounded fetch adapter and one retained-byte
interpreter. This preserves maintained method syntax/URL handling while omitting
an unnecessary parsed-document layer. There is no cached or singleflight request
sharing between the before and after checks. Do not add a second resolver stack.

For PLC use exact `@atcute/did-plc` 1.0.2 and `valibot` 1.5.0, with the wrapper
checks above. Both online and browser/offline verification use their same pinned
rules. Four additional closure nodes are did-plc, identity 2.0.2, util-fetch 2.0.2
and valibot 1.5.0; the P1 closure already satisfies its other package ranges.
`jsonc-parser` 3.3.1 adds one dependency-free node. The exact lock must preserve
those existing P1 versions; do not allow a fresh install to silently advance
otherwise compatible ranges. Keep `bundleDependencies: true` and rerun package
consumer/integrity checks after the reviewed promotions/additions.

The approved narrow provenance exception concerns valibot's optional
`typescript` >=5 peer. The current closure checker follows every installed optional
peer, so the project's dev TypeScript would be newly classified as runtime.
Assessment `cc21a77c` approves recording this optional typechecking-only peer as
one narrow named closure exception, keeping its declaration intact and the
build tool independently pinned, rather than shipping TypeScript through the runtime/browser closure.
Record `valibot@1.5.0`, peer name `typescript` and the non-executed
typechecking-only reason in approved closure metadata. The checker must fail if a runtime import resolves
that peer. Static inspection found no TypeScript string/import in the exact
valibot tarball's four runtime JS files. Packed-consumer evidence still gates
the exception. This is not blanket permission to exclude optional peers. Exact lock/closure counts and packed-consumer checks must
show the effect; the five-node metadata comparison is not a resolved lock result.

The ATproto adapter accepts `did:plc` and hostname-level `did:web`, with the
protocol's DID length/case and hostname restrictions. General path-based web
resolution being supported by a library does not make it valid for ATproto.
Development localhost/HTTP exceptions require an explicit separate policy.
For web, require the retained document's `id` to equal the requested DID and
follow ATproto's ordered selection of its valid `#atproto` key and `#atproto_pds`
service; accept relative and own-DID-qualified fragment IDs. Key controller must equal that DID.
Require a production HTTPS PDS origin without userinfo, path prefix, query or
fragment. A confirmed handle is optional display metadata, never the principal.
PLC uses its verified normalized operation instead of projecting it back through
a document. These are constraints from the [ATproto DID specification](https://atproto.com/specs/did).

Normalize modern Multikey and supported legacy uncompressed p256/k256 formats
through P1's bounded curve validation/normalization. Compare canonical `did:key`
strings, not original encodings. Reject unsupported curves, off-curve points,
noncanonical multicodec/base58 and invalid key lengths; never treat a legacy raw
key as though it already contains a Multikey prefix. Test both curves and their
legacy/modern equivalence in Node and Chromium.

All DID document, PLC audit, `getRecord`, `getBlocks` and recovery `getRepo`
requests use the same transport policy: bound response bytes, total deadline and
cancellation, reject redirects, `cache: 'no-store'`, no authentication credentials,
and connect-time private-address protection. Existing `PdsClient` origin validation
does not provide DNS protection. Recommend the maintained host-only
[`@atproto-labs/fetch-node`](https://github.com/bluesky-social/atproto/tree/main/packages/internal/fetch-node)
0.4.0 `safeFetchWrap` adapter and raise the supported Node floor from 22.13 to
22.19. Assessment `cc21a77c` approves that default and support change subject to
actual integration evidence. Set production HTTP/private-address exceptions off, reject redirects explicitly, and allow
valid HTTPS PDS custom ports explicitly. Use separate response budgets for DID,
audit and native CAR responses, all inside the observation's total deadline.
Localhost PLC/PDS exceptions belong only to the development policy.

The exact 0.4.0 tarball was inspected. It checks policy at dispatch time on every
issued URL, also protects literal IPs, and uses a connection-time DNS guard.
It eagerly imports Undici 6/7/8, selects the matching Agent for Node's built-in
Undici major, and fails if the Agent lacks dispatcher composition. The suggested
exact closure is fetch-node 0.4.0, fetch 0.3.6, pipe 0.2.4, ipaddr.js 2.5.0 and
aliased Undici 6.29.0/7.30.0/8.11.2. These seven nodes have no further new
dependencies. Existing fetch 0.2.3/pipe 0.1.1 must remain available to their old
callers. Undici 8 requires Node >=22.19; the package's own >=22 declaration is
insufficient to support the old 22.13 floor. Raising the floor avoids an implicit
unsupported dependency promise and retaining an older transport patch.

Before landing, change `engines` to >=22.19, the CI minimum from 22.13.0 to
22.19.x, and README/contributor support documentation together. Name this support
change in the landing report so the user sees the actual new prerequisite. The
host must load and demonstrate private/literal-address rejection and connect-time
DNS rebinding protection on Node 22.19, 24 and 26. Record exact patch versions.
No inspected tarball or browser-only check substitutes for those host gates.
Three eagerly imported Undici majors and about 5 MB unpacked host transport
contents are the accepted explicit cost, pending exact installed/bundle/provenance
measurements; host-only does not mean zero shared browser metadata cost.

The smaller alternative is pinned Undici 6.29.0 plus ipaddr.js 2.5.0, with a small
host adapter supplying URL rules, connection-time lookup checks and response/
deadline budgets. It adds two nodes instead of seven and supports the old floor,
but Atseq would own the integration and safety policy. Prefer the maintained
wrapper unless actual adoption/bundle evidence outweighs that simpler ownership.
Published unpacked sizes are 5,085,463 bytes for the seven-node transport closure
versus 1,265,330 for the alternative. Those are package contents, not application
bundle sizes or browser overhead. Runtime/browser-provenance measurements and
tarball integration must report actual changes before landing. Never import
fetch-node or Undici into the browser. Hostname-only checks are not a fallback.
Browser same-origin/CORS constraints may require the appointed host observer.
An arbitrary proxy response does not become a new trust anchor. A1 OAuth token
issuer/PDS linkage remains a separate authentication boundary.

## Rotation, recovery and historical limits

A retired repository key can still sign an apparently valid root with an invented
revision. New admission rejects it against the newly observed current key; neither
a high revision nor a valid old signature restores that key's authority. Earlier
retained archives continue to use their explicit observed binding, without
claiming that it was current beyond their observation. They cannot be promoted to
a new online admission by supplying an old DID document.

PLC rotation/recovery keys are separate from repository signing keys. Higher
priority PLC keys can nullify a lower-priority update within the specified
72-hour recovery window. Directory ordering/withholding and availability remain
trust limits even with signed operation histories; operation signatures alone do
not prove that the presented branch is latest. The default retained audit evidence
can expose encountered conflicts but does not remove these limits. An admission
near a PLC update may later be affected by nullification within its 72-hour window.
Do not impose a default waiting period or use `observedAt` to decide that window.
A nullified binding does not retroactively rewrite app history: recovery
uses newly observed authority and an explicit ordered I2 reset/revoke where needed.
See the [PLC specification](https://github.com/did-method-plc/did-method-plc/blob/main/website/spec/v0.1/did-plc.md).

Hostname `did:web` is convenient for an individual who controls a domain and can
publish its well-known document. Current resolution trusts DNS, HTTPS and domain
control; a retained response plus observer assertion is not independent proof of
historical domain ownership. Domain loss has no native recovery or migration
mechanism in this method. Later domain control can publish a new key; only explicit
app authority changes govern what previously admitted participation can do.
The [web method specification](https://w3c-ccg.github.io/did-method-web/) supplies
the HTTPS resolution mechanism; ATproto restricts its accepted identifier forms.

Do not add WebVH to this path. It is not a blessed native ATproto account method.
An optional companion history/witness policy is worth a separate decision only
when an application needs independently inspectable web history and accepts its
extra retention, resolver and trust costs. It cannot be presented as native
ATproto support or an automatic cure for freshness and withholding.

## Assurance shown to readers and preserved in exports

Show the admitted assurance class, `plc-audit-v1` or `web-observation-v1`, wherever
a participant admission is displayed or exported. Include its policy/evidence
references with receipts, authority history and archives as applicable. Different
admissions for one principal may have different policies; do not replace an old
admission's assurance with a later account badge. Discovery and library responses
must make it available to browser/CLI/agent clients rather than hiding it in host
logs.

Explain that PLC authenticates retained authorized key history while currentness
still relies on directory/host/app-PDS observation. Web rests on retained
host/app-PDS observation and does not independently prove historical domain/key
control. Domain effectiveness, independently derived state and identity assurance
remain separate properties. T1 owns final presentation; N1/P4 preserve the exact
class and policy in exported evidence.

## Static source findings and remaining gates

The revised proposal addresses assessments `6106f769` and `cc21a77c`, adopts
the approved maintained PLC/parser/transport choices, and corrects canonical-tip
selection. The current note is a source-only correction, not implementation
acceptance. Exact published
tarballs and metadata were inspected without executing their runtime code. The
immutable metadata/hashes are retained in
[source inspection evidence](../experiments/post-spike-evidence/2026-10-01/account-admission/source-inspection.json).

| Candidate               | Finding                                                                                                                                                                                                                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@did-plc/lib` 0.0.4    | Latest npm release is from April 2023. Its tarball differs from the maintained directory workspace lib 0.1.0: old recovery uses `Date.now()`, genesis accepts longer DID prefixes, and signature encoding checks differ. Do not adopt this old published closure as though it were current directory code. |
| `@atcute/did-plc` 1.0.2 | Published September 2026; exact tarball supplies the indexed verification primitives described above and reuses P1's crypto/CBOR/CID stack. Typed schema preserves rather than strips unknown properties, so the adapter must enforce accepted signed fields.                                              |
| `jsonc-parser` 3.3.1    | Exact tarball has strict-mode scanner/visitor APIs for decoded names, errors and nesting checks. Use its visitor with strict JSON settings; ordinary parser defaults are insufficient.                                                                                                                     |
| `fetch-node` 0.4.0      | Exact dist code, rather than the earlier 0.3.7 source, has per-dispatch URL guards and eager three-major Undici imports. Node support and source/provenance overhead require actual integration evidence.                                                                                                  |

The five PLC/JSON candidate packages total 2,163,294 published unpacked bytes,
including types and tooling, before the optional-peer decision. These are not
minified browser bytes. Browser imports can omit the PLC network client and host
transport, but the current common dependency-provenance manifest still records
the full runtime closure; its browser size effect must be measured, not assumed
zero. The proposed transport and fallback package-size comparison appears above.
No package version or integrity approval has been changed by this investigation.

The investigation read the locked resolver/cache/method source, exact candidate
tarballs, current upstream source and primary specifications on 2026-10-01.
It ran no resolver, rotation,
browser, PDS or recovery acceptance tests. No runtime implementation is included
in this note. The budgets and contract now reflect independent assessment
`cc21a77c`, with the mandatory canonical-tip correction included. Publish this
corrected proposal in the workroom before implementation. Coordinate final
consumption/operation wire fields with the joint I2/N1 review; exact implementation,
dependency and support-policy evidence still gate landing.

Required implementation evidence includes same-root sparse proof completion
through exact-CID block retrieval on a large existing account, withholding and
root-change recovery; both supported DID methods, both curves,
legacy/modern keys, strict document/endpoint errors, uncached resolution, bounded
fetch cancellation, exact grant CID/issuer/membership, unavailable versus absent
proof, and deterministic replay with every network call disabled. Exercise
retired-key roots with invented high revisions; rotations and PDS changes before,
during and after observation; a change-and-return race; PLC recovery/nullification;
same-revision conflict and rollback floors; source record replacement; and old
archive replay after rotation. Distinguish local deterministic fault injection
from actual provider/recovery trials. No unrun case is an implementation result.

Also test every parser/extraction rule identically online and offline, fabricated
observation-only web/PLC bindings versus invented PLC history, strict signed-field
and signature encodings, a full authentic log selecting an earlier active
operation despite a later canonical tip, tombstone-tip selection of an earlier active row, legacy genesis
normalization after exact-byte checks, before/after tip change with unchanged
key/PDS, optional PLC document disagreement that has no authority effect,
truncated valid PLC logs and false unsigned directory metadata,
legitimate/nullified recovery branches, host restore deriving floors from ordered app history, single descriptor
consumption, and proof-fetch redirect/cache/SSRF rules. Test the reviewed Node
minimum and current Node, including actual connect-time address rejection/DNS
rebinding, and record exact dependency/integrity/packed-consumer and Chromium
bundle/provenance results. Run the actual host private-address and connect-time
DNS rebinding cases on 22.19, 24 and 26. No Node-floor or transport security runtime
case has been run by this source-only investigation.

The [ATproto sync specification](https://atproto.com/specs/sync) makes identity
events hints rather than authenticated freshness and separates revision/cursor
ordering from authoritative time. The implementation must preserve that limit
in its tests, result labels and user-facing explanation.
