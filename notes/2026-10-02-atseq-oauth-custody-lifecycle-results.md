# Browser OAuth custody: lifecycle correction and deadline boundary

Date: 2026-10-02

This A1-F3 successor fixes housekeeping after a real browser back/forward cache
(BFCache) restoration. The same adapter now resumes exactly one cleanup interval
when its preserved document becomes active again. It also clarifies that the
shared network/SDK budget does not impose a wall-clock deadline on local storage
completion. The successor awaits independent review. Full A1 remains open.

Request `e19379e8dd8205d13e43708f9073a58cbc31bf24`, promise
`c87cdc6d5fc3bd89876799ccd497fc9977c58b69`. This is a descendant of frozen,
unreviewed candidate `bc36c99cc18a2f1e95e846900892831334d1aae5`; the predecessor
report, evidence and raw failures remain byte-exact. This report supersedes that
report's unqualified active-document housekeeping and operation-budget wording.
The fixed custody limits and substantive implementation are unchanged.

## Observed defect and minimal correction

A native local TLS fixture loaded the actual predecessor adapter without
Playwright request interception. Full Chromium 153.0.8010.12 returned the same
document instance with both `pagehide.persisted` and `pageshow.persisted` true.
The predecessor's active 60-second interval count changed from one to zero.
Its once-only `pagehide` listener cleared the interval and no listener restarted
it. Before-operation cleanup still worked, but an idle restored document never
resumed periodic housekeeping.

The production correction changes only the timer lifecycle in
`src/browser/oauth-adapter.ts`:

- Keep an optional timer and start it only if absent.
- On every `pagehide`, clear the timer and set its reference to undefined.
- On `pageshow`, start the timer idempotently. Initial construction also starts
  it, whether the initial pageshow event has already occurred or not.

Repeated restoration does not add another timer. Cleanup still uses the same
outer custody lock, guarded operation, owned stores and fixed non-secret failure
event. Before-operation cleanup and local deletion independent of remote success
remain unchanged. The deadline clarification below changes no runtime behavior.

## Actual lifecycle evidence

The new fixture uses an ephemeral self-signed local TLS certificate and native
HTTPS requests. Full Chromium runs with Playwright's default BFCache-disabling
switch omitted. It does not use request interception, dispatch synthetic
pagehide/pageshow events, accelerate browser time or invoke timer callbacks by
hand. OpenSSL generates test-only TLS material, which is removed after the test;
no certificate private key, account credential or real provider is retained in
the evidence. The fixture uses the existing installed Chromium and SDK packages;
there is no new package dependency.

For each final run, the fixture:

1. Constructs the actual browser adapter and observes one active 60-second timer.
2. Navigates away and back three times. Each return has a persisted pageshow
   event, the same document UUID, and exactly one active timer.
3. Inserts literal pre-PAR reservation rows into the actual owned IndexedDB
   stores. These exercise idle expiry cleanup without account credentials or
   an authorization-server exchange.
4. Waits for an actual 60-second interval firing. No adapter operation is called
   after restoration. The registered cleanup removes both expired reservation
   rows, and one active timer remains.

This establishes genuine persisted restoration and idle housekeeping, including
actual IndexedDB work. It does not claim a provider authorization flow from the
literal reservation fixture; the separate 14 custody cases continue to exercise
maintained OAuth, keys, transactions, revocation, refresh and crash recovery.

The first routed probe and default-headless-shell native TLS probe did not enter
BFCache; their masked non-restoration records are retained. Full Chromium did
restore the document, but an initial `goBack()` harness waited for a new `load`
event and timed out. A restored document emits pageshow without a fresh load.
Waiting for navigation commit permits the genuine persisted lifecycle to be
observed. The retained successful predecessor probe proves the original one-to-
zero timer defect; synthetic events alone are not used as proof.

## Network budget and local storage completion

The shared 30-second signal begins after the outer custody Web Lock is acquired.
It guards HTTP requests/body reads and the maintained identity/OAuth path, and
`#run` checks it after the SDK operation and existing authority checks, before
successful finalization. The existing 64-request and 32 MiB cumulative limits
remain shared across that operation and its remote cleanup attempts.

Local IndexedDB transaction completion is awaited separately. The final
live-marker transaction does not have an AbortSignal listener or a second
post-completion deadline check. It can therefore complete, and return a handle,
after the network/SDK/pre-finalization budget has elapsed. Waiting for the outer
Web Lock is also outside that budget. This implementation does not promise an
overall 30-second wall-clock completion deadline for storage or lock acquisition.
These are code-inspection facts, not a measured bound on delayed disk work.

The success boundary remains the completed IndexedDB transaction. The uncertain
marker is cleared only after the SDK and existing subject/scope/issuer/fresh
account checks have succeeded; a failed final write returns no accepted handle.
Local purge is awaited independently of remote success or an expired network
budget. Aborting local cleanup when that network timer expires would violate
this adopted local-deletion rule, so no new storage abort deadline was added.
Independent review should assess this disclosed boundary rather than infer a
guaranteed overall IndexedDB deadline.

## Results and provenance

Final runtime/test producer:
`fb17129a976c4f59d8c0651f2292a9453eb04c10`, directly descended from frozen `bc36`.
Exactly two source/test files change after that predecessor: the browser adapter
and the new lifecycle test. Final gates ran in the new isolated worktree
`/private/tmp/atseq-oauth-custody-lifecycle-20261002`; the original predecessor
worktree remains clean. No root, workroom, main, push, user package or live-origin
management action was performed.

| Final gate | Result |
| --- | --- |
| Build, complete check, notices | Passed. |
| Node 22.19.0 focused OAuth/browser/integrity/lifecycle tests | 22/22 passed, including the unchanged 35-case Node SDK corpus. |
| Node 24.21.0 same focused tests | 22/22 passed, including the same 35-case corpus. |
| Node 26.10.0 ordinary parallel suite | 478/478 passed; the separate 20,000-entry boundary was excluded. |
| Fresh packed native consumer | 219 actual compiled cases passed; shared checkout dist and integrity remained intact. |
| Actual built browser JavaScript | 15/15 passed: 14 custody cases and the real BFCache/minute-cleanup case. |
| Predecessor preservation | All 43 delivery hashes and seven predecessor source pins verified against the frozen files/Git commit. |
| Unchanged baseline and maintained SDK | 15 baseline files and 19 selected SDK files remain exact. |
| Build provenance | 143 source pins and 460 compiled output pins verified. |
| Physical runtime dependencies | All 14,234 approved files checked; all 194 runtime packages remain unchanged. |

The source lifecycle case also passed in the Node 22/24 focused runs and the
Node 26 ordinary suite. In every final fixture, three actual BFCache restores
preserve one timer and the real minute timer performs idle cleanup. Its one-
minute wait runs concurrently with the other tests; it is not a performance
target or bootstrap-latency measurement.

An initial corrected source fixture passed before source commit, from matching
uncommitted bytes in the predecessor worktree. Those two files were then moved
to the new descendant worktree, and the predecessor was restored to its frozen
state before final gates. The initial capture retains its original location
attribution; final claims use the committed successor and final captures.

All prior A1-F3 limits still apply: a read crash can conservatively require
re-enrolment; closed documents have no exact cleanup deadline; logical metadata
and row caps do not bound browser files, memory, backups or forensic remnants;
remote revocation is best effort; reset cannot erase unknown remote or old-origin
sessions. This successor adds no production Node persistence, real provider
adoption, native publishing, recovery or public export/profile claim. Linux CI
and other browser implementations have not been claimed from local macOS runs.

[The successor evidence manifest](../experiments/post-spike-evidence/2026-10-02/oauth-custody-lifecycle/manifest.json)
pins the actual predecessor defect and ineligible/timeout attempts, final source,
build output, native lifecycle/custody captures, graph checks and packed results.
The [preceding custody report](2026-10-02-atseq-oauth-bounded-custody-results.md)
and its manifest preserve the broader implementation evidence.
