# Browser OAuth custody: failure recovery correction

Date: 2026-10-02

A plain resource connection failure now preserves an unchanged browser OAuth
session and its existing consent deadline. A failure after a token request is
handed to transport, or after an SDK session write/delete is attempted, still
retires local credentials. This corrects CF-1 from independent assessment
`ae36a3502400a2decb324a093471d93f03913b3e`, ratified as `8952de3d`.
The tested successor awaits exact-head independent review; full A1 remains open.

Request `e19379e8dd8205d13e43708f9073a58cbc31bf24`, promise
`c87cdc6d5fc3bd89876799ccd497fc9977c58b69`. Final production and test source is
`aafa48d681cc6caf2b6774fc37fd2a58ff8c754c`, in isolated worktree
`/private/tmp/atseq-oauth-custody-failure-20261002`. Frozen predecessors
`bc36c99cc18a2f1e95e846900892831334d1aae5` and
`f6e7fbd626f072229b54c3ab240b87079fac9df1`, their reports, manifests and raw
captures are preserved. This report supersedes their blanket retirement claim
for failed restore, read-only info and resource requests. Fixed capacity, consent,
metadata, keys, locks, callback handling and cleanup policy remain unchanged.

## Decision and implementation

The earlier adapter retired any account touched by a failed operation. The
reviewer reproduced a plain XRPC connection reset: no token request occurred,
but the account was revoked and deleted. The next request required enrolment.
That loss was unnecessary because the operation had not changed credentials.

Every operation still commits an uncertainty journal before credential access.
Only its current private context can use that row. Within that operation:

| Outcome or operation | Custody result |
| --- | --- |
| Failed restore, read-only info or resource request; no token dispatch and no SDK session write/delete attempt | Await an atomic transition to live, retaining the original consent deadline and original sanitized error. |
| Any SDK session write/delete attempt, including an attempt that fails before commit | Treat credentials as potentially changed; a failed operation retires them. |
| Token request handed to transport | Treat credentials as potentially changed before transport can throw or an abort can race with dispatch. An unresolved token request retires credentials. |
| Complete, explicit refresh or signout | Retain conservative retirement rules. Signout retires unconditionally. |
| Reopened uncertainty after a crash | Retire without automatically retrying a refresh token. In-memory dispatch knowledge is not used to explain a crash. |
| Failure completing the safe transition to live | Leave the row uncertain and unusable. Await transaction completion; withhold the operation result. |

An SDK session write clears the unresolved-token flag only after the actual
IndexedDB transaction completes. It retains the uncertainty journal until the
adapter's existing subject, exact scopes, issuer and fresh authority checks have
completed. A successful write alone does not restore live custody.

The selected maintained SDK can catch a failed 401 refresh and return the
original resource 401. That apparent operation success does not prove token
safety. An unresolved token dispatch still retires custody; the adapter preserves
the original SDK response instead of inventing a different HTTP response.

## Token dispatch classification

The guard uses the pinned public OAuth client behavior, not an endpoint suffix,
error wording or an arbitrary application form. It inspects the normalized
Request after the existing URL, headers, body and budget checks. It marks only a
maintained-client POST without Authorization, whose media type is
`application/x-www-form-urlencoded`, with the configured public `client_id` and
an `authorization_code` or `refresh_token` grant. Media-type comparison ignores
case and charset parameters. Additional or repeated form fields do not suppress
marking. The mark occurs immediately before the guarded transport handoff.

The selected public SDK always adds Authorization to its resource requests;
its metadata calls are GET, and its PAR/revoke forms lack a token grant. The
identity resolver now has a distinct guarded fetch, so resolver-owned forms do
not enter the maintained-token classifier. All URL and budget policy still
applies to both paths. This classifier is deliberately tied to the pinned SDK:
a future SDK upgrade needs to recheck these maintained request shapes. A false
positive causes conservative consent loss; a false negative could allow unsafe
credential reuse.

## Actual browser and runtime evidence

Seven added Chromium custody cases use real browser IndexedDB, locks, the
maintained public SDK and synthetic fixture origins. Native route aborts produce
actual connection resets before a resource response or after the fixture has
constructed a token response. No real provider, account or credential is used.

- A plain XRPC reset performs no token or revoke request, preserves live custody
  and the original deadline, and permits the next resource request to succeed.
- An authenticated resource form containing OAuth-like fields is not classified
  as token dispatch, including mixed-case media type and charset.
- A 401 refresh whose token response is lost retires custody. The SDK's original
  401 is observed and a subsequent restore sends no token retry.
- A public SDK fetch decorator adds optional token form fields and changes
  media-type case/charset before normalization. Lost-response retirement still
  works. This fixture's `/token` match is test wiring, not production policy.
- A real aborted IndexedDB transaction prevents safe live finalization. The
  original transient error is preserved, the row stays uncertain, and another
  document retires it without refresh retry.
- A plain caller abort preserves unchanged consent and its unavailable error.
- A marked token handoff that synchronously rejects in transport still retires
  custody, even when the fixture server receives no token request.

The existing 14 custody cases and callback/class checks still pass. They retain
actual non-extractable key reload, cross-document serialization, single-use
callbacks, aborted SDK writes, capacity/expiry, crash and cleanup/reset coverage.
The lifecycle case still performs three genuine persisted BFCache restorations
and waits for actual 60-second housekeeping, without synthetic lifecycle events
or accelerated time. A separate controlled lifecycle regression verifies that
storage finalization crossing the network deadline preserves the original failed
work's error class. It is a timing/classification test, not storage/crash proof.

Final gates at the exact source producer:

| Gate | Result |
| --- | --- |
| Build, full check and third-party notice verification | Passed |
| Node 22.19 focused adapters, browser, custody, lifecycle, bundle and integrity | 30/30; actual Node SDK probe retains its 35 cases |
| Node 24.21 same focused gates | 30/30; actual Node SDK probe retains its 35 cases |
| Node 26.10 ordinary suite | 486/486; explicit 20,000-entry boundary test excluded |
| Compiled production Chromium custody and lifecycle | 22/22: 21 custody plus genuine BFCache |
| Packed consumer conformance | 219 cases; separate staging preserves shared dist |
| Lazy graphs and installed file integrity | Passed; 194 package paths, exactly 147 prior plus 47 approved OAuth additions |

The packet pins seven changed source/test files, 143 actual build inputs, 460
actual outputs, 19 selected installed SDK files, two further dispatch-specific SDK files,
15 unchanged baseline files and
all 14,234 approved physical runtime files. There is no added package, changed
public barrel, semantic profile or production Node persistence. The ordinary
startup graphs still contain added OAuth manifest data without executable OAuth
modules; internal enrolment remains a dynamic loader boundary.

## Capture attribution and retained attempts

The evidence packet is
`experiments/post-spike-evidence/2026-10-02/oauth-custody-failure/`.
Its manifest pins this report and the delivered evidence, excluding itself.

Final `*-frozen.log` files and build/packed/graph artifacts come from
`aafa48d681cc6caf2b6774fc37fd2a58ff8c754c`. Earlier `*-final.log` captures came
from `3dbc0167f09955aa180034dbc0eb290a0bd4c919`; they passed before the final
error-deadline refinement. Earlier `*-refined.log` gates came from
`8d7c6ff89b1fbee9527e47eca0397c5b64e6b418`, with the same refined production bytes but an incompletely typed new
test fixture. Its type check failed because the synthetic metadata lacked
`redirect_uris`; the fixture was corrected and formatted before the final source
freeze. Controlled classification-only captures were run against the matching
refined draft before its source commit. `check-precommit.log` used the corrected
final bytes before commit. Early Chromium/build captures were from evolving,
uncommitted CF-1 drafts in this isolated worktree and are not final source proof.

The first type check failed because generated `#atseq-integrity` build artifacts
were absent in the fresh worktree. Building resolved it. Both that failure and
the later test metadata typing failure are retained, alongside the subsequent
passing checks. No failed capture has been replaced by a passing one. The
inspector verifies all 65 predecessor delivery files byte-for-byte and verifies
historical predecessor source pins against their frozen Git commits, rather than
claiming those old hashes describe intentionally changed current source.

## Limits and recommendations

A crash remains conservative even during a logical read: an unknown journal
loses consent because it cannot prove whether a refresh happened. A failed
explicit reenrolment of an already enrolled DID can also retire its preexisting
session after token dispatch; this implementation does not promise to preserve
old consent through a failed replacement authorization.

N-1 clock rollback is explicitly deferred as nonblocking for this correction.
Custody expiry and future-deadline validation still use wall-clock time. A
backward jump can cause conservative refusal or consent loss; this successor
adds no persisted high-water clock or monotonic deadline scheme.

The shared 30-second budget covers networking, SDK work and the check before
finalization. Web Lock acquisition and awaited local IndexedDB completion are
separate. There is no guaranteed overall IndexedDB deadline. The original work
failure's deadline state is preserved while finalization completes. Safe live
recovery requires actual transaction completion; a completion failure leaves
uncertainty rather than returning a usable handle. Local deletion remains
independent of best-effort remote revocation and does not acquire a new abort
deadline.

Capacity and the exact 64 KiB UTF-8 JSON metadata limit are logical bounds, not a
forensic physical-storage bound. Closed browsers cannot guarantee timely cleanup,
and remote revocation remains best effort. Failed local purge still counts
against capacity until storage is fixed or a trusted isolated-origin reset is
performed. The fixture resets no live user origin. No provider, native publisher,
CLI enrolment or full A1 acceptance is claimed. Recommend independent exact-head
review of this successor before merge; keep the pinned request classifier under
future SDK upgrade conformance checks.
