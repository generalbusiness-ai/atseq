# Browser OAuth custody: transient verification recovery

Date: 2026-10-02

An identity lookup or authorization-server discovery outage now preserves an
unchanged browser session and its existing consent deadline. Definitive account,
scope, issuer, audience, input and origin failures still retire credentials. This
successor closes a verification-stage gap in the first CF-1 correction. It awaits
independent exact-head review; full A1 remains open.

Request `e19379e8dd8205d13e43708f9073a58cbc31bf24`, promise
`c87cdc6d5fc3bd89876799ccd497fc9977c58b69`. CF-1 remains tracked under independent
assessment `ae36a3502400a2decb324a093471d93f03913b3e`, ratified as `8952de3d`.
Final production/test source is `3c520cb0d7fcb926e5b213a51f140579ee8254d3`, in
isolated worktree `/private/tmp/atseq-oauth-custody-verification-20261002`.
Frozen predecessor `deeb8fd0decd14a04d407dec3edd3de1bafbad7b` and all earlier
candidates, reports and captures remain unchanged. This report supersedes the
predecessor's incomplete verification-stage recovery behavior, while preserving
its token dispatch, attempted SDK write/delete and unknown-crash rules.

## Reproduction and correction

Root inspection found that verification still called `session.signOut()` on
every error. Restore repeated that cleanup after verification. Resource dispatch
checks used the same unconditional cleanup. A healthy session could therefore be
deleted during fresh identity or discovery verification, even before a token or
resource request was dispatched.

An independent actual Chromium reproduction against unchanged predecessor
production confirmed the gap. A native connection reset at the fresh identity
lookup produced zero token requests, zero resource requests, one revoke request
and no remaining account row. Removing the network fault did not make the next
resource request succeed. The first failing positive test and the subsequent
retry-observing control are both retained.

The correction uses the existing trusted failure classifier, without error-text
matching. Before any awaited cleanup, it captures the sanitized error and the
network-deadline state in an operation-local WeakMap. That preserves the original
failure through signout and final storage completion. A nested callback catch
recognizes the same classified error and does not sign out twice.

Only a known `content_unavailable` failure skips verification signout when owned
browser custody exists. The existing custody context then decides whether the
operation can safely restore the same row to live. A token dispatch, attempted
SDK session write/delete, explicit refresh or completion still causes conservative
retirement after failure. Unknown crash journals still retire without automatic
refresh retry. Definitive validation failures retain signout. Restore's redundant
signout catch around verification has been removed.

A fresh SDK restore can reject definitive issuer metadata before returning any
session handle. That boundary now uses the maintained public `client.revoke(did)`
for definitive failures, after the failed restore has released its SDK locks.
Its selected implementation deletes stored credentials in `finally`, even if
metadata resolution prevents remote revocation. Known transient restore failures
skip that cleanup. There is no private SDK store access or cleanup update hook.

The Node adapter file, factory and persistence remain unchanged. With no owned
custody lifecycle, Node retains its existing transient verification signout.
Shared classification before cleanup, definitive restore cleanup and duplicate
signout removal also apply to Node. No new Node persistence or whole-programme
acceptance is claimed.

## Actual tests and final gates

Six new actual Chromium cases cover fresh identity and authorization-server
discovery failures during restore, read-only info and resource requests. Each
uses a real connection reset and the maintained SDK with owned IndexedDB and
Web Locks. Before retry, each observes zero token, revoke and resource requests,
a live account with the same deadline, and the original unavailable error. The
next resource request succeeds after the fault is removed.

Two additional Chromium cases verify definitive retirement before resource
dispatch. Changed issuer metadata retires locally with zero token or resource
requests; unusable metadata prevents a remote revoke, which is not guaranteed.
A stored scope mismatch retires locally with one revoke and zero token/resource
requests. The scope fixture changes only a synthetic account inside actual
IndexedDB, retaining its structured-cloned keys in the browser. It exports no
private key or account credential.

A controlled lifecycle regression makes a definitive scope failure's awaited
signout cross the network deadline and fail itself. The original input class is
preserved and cleanup occurs once. This is error/timing coverage, not a physical
storage or crash proof. The predecessor's actual storage-abort, token handoff,
lost-refresh response, keys, cross-document callbacks, capacity, expiry, cleanup,
reset and crash cases continue to pass.

All final gates use the exact source producer above:

| Gate | Result |
| --- | --- |
| Build, full check and third-party notices | Passed |
| Node 22.19 focused adapter/browser/custody/lifecycle/bundle/integrity | 39/39, including the same 35 actual Node SDK cases |
| Node 24.21 same focused gates | 39/39, including the same 35 actual Node SDK cases |
| Node 26.10 ordinary suite | 495/495; explicit 20,000-entry boundary case excluded |
| Compiled production Chromium custody and lifecycle | 30/30: 29 custody plus genuine persisted BFCache |
| Packed consumer conformance | 219 cases; separate staging preserves shared dist |
| Startup/lazy graph and installed file integrity | Passed |

The actual BFCache case still performs three persisted restorations of the same
document and waits for a real 60-second housekeeping callback. It uses no
synthetic lifecycle event or accelerated time. Fixtures use isolated synthetic
origins and accounts, not an external provider or live user origin.

Inspection pins three changed files, 143 actual build inputs, 460 actual outputs,
19 selected installed SDK files plus two further dispatch-specific SDK files,
15 unchanged baseline files and all 14,234 approved physical runtime files.
The package graph remains exactly 194 paths: 147 prior and 47 approved OAuth
additions. No dependency, public barrel or semantic profile changes. Ordinary
startup still includes OAuth manifest data without executable OAuth modules;
internal enrolment keeps its dynamic loader boundary.

## Provenance and retained attempts

Packet: `experiments/post-spike-evidence/2026-10-02/oauth-custody-verification/`.
The manifest pins this report and delivered evidence, excluding itself. The
inspector verifies all 103 predecessor delivery files byte-for-byte, and checks
16 historical source pins against their frozen Git commits. Those historical
hashes are not presented as hashes of intentionally changed current source.

Final `*-final.log` files and the build, packed and graph artifacts come from
`3c520cb0d7fcb926e5b213a51f140579ee8254d3`. Baseline build and the two failed
reproduction controls used unchanged predecessor production from `deeb8fd0`,
with its source producer `aafa48d681cc6caf2b6774fc37fd2a58ff8c754c`. Reproduction
fixtures were appended as uncommitted tests in this isolated worktree; their
captures establish the observed control, not final source conformance.

Earlier classification, identity, verification, format and check captures used
evolving uncommitted successor drafts. The first six outage cases passed. The
first mismatch run failed twice: issuer failure revealed the SDK restore boundary
before a session exists, and the scope fixture mistakenly tried to read a
credential from the deliberately redacted row inspector. The first was fixed
using public SDK revoke for definitive restore failure; the second was corrected
to edit the fixture row directly within actual browser storage. Both failures
remain in `verification-first.log`. The subsequent eight-case run passed. Final
attributable gates ran only after production and tests were committed and frozen.
No failed capture was replaced by a passing one.

## Limits and recommendation

The fixed ten pending transactions, ten retained account slots, ten-minute
pending lifetime, thirty-day explicit consent deadline and exact 64 KiB UTF-8
JSON metadata bound are unchanged. Refresh does not extend consent. An unknown
crash marker remains conservative even during a logical read; a failed explicit
reenrolment can retire preexisting consent after token dispatch. Unresolved 401
refresh response loss still retires custody even if the SDK returns the initial
resource 401. Safe restoration requires actual IndexedDB transaction completion;
a failed completion leaves uncertainty unusable and withholds a usable result.

N-1 clock rollback remains explicitly deferred as nonblocking. Custody still uses
wall-clock expiry and future-deadline validation; a backward jump can cause
conservative refusal or consent loss. There is no new clock policy in this fix.

The thirty-second budget covers networking, SDK work and the check before
finalization. Lock acquisition and awaited local storage completion are separate,
with no guaranteed overall IndexedDB deadline. Capturing the original failure
before cleanup does not add a storage abort deadline. Local deletion remains
independent of best-effort remote revocation. Logical bounds do not guarantee
forensic physical storage size or cleanup deadlines while the browser is closed.
Failed local purge still counts against capacity until storage is fixed or a
trusted isolated-origin reset occurs.

Recommend exact-head independent review of this successor before merge. Provider,
CLI/native publisher enrolment and full A1 acceptance remain open. Keep the
pinned maintained token request classifier and SDK cleanup paths under upgrade
conformance checks.
