---
date: 2026-10-01
status: correction prepared; focused execution and independent review pending
examined_at: 66977be7e59527eccf3df91c55285e55914f3add
request: 0933ee4d
---

# Archive cancellation: disconnect the actual host transport

The archive browser fixture should stop the application HTTP service during its
offline phase. Keep the installed service worker, cached shell and device data,
then restore the host on its original port only after closing the browser context.
This establishes a real disconnect for imported-archive replay and queued-work
cancellation. It preserves the assertion that the host still has exactly four
entries and every retained device byte is unchanged by cancellation.

Only `tests/archive.test.ts` changes. There is no product, dependency, semantic
profile or service-worker change. The correction is prepared; execution waits
until the concurrent performance capture has finished.

## Observed CI failure and diagnosis

[Main run 36880585181](https://github.com/generalbusiness-ai/atseq/actions/runs/36880585181)
failed on Linux with Node 22.13.0 at 2026-10-01 14:59:45 UTC. The archive subtest
“cancelling a held worker export keeps verified inputs and an offline signed
action” reached its final server assertion, where head position was 5 instead of
4. The preceding checks for saved state, a queued signed action and unchanged
IndexedDB contents did not fail. Other Node matrix jobs passed this assertion.
The exact failure is retained in the run log at `tests/archive.test.ts:354`.

The fixture had installed an active service worker, registered an XRPC abort
route and enabled browser offline emulation. The application HTTP service was
still running. Product `Outbox.drain` deliberately submits exact queued bytes;
it does not use `navigator.onLine` as an authoritative transport gate. A submit
whose confirmation is unavailable remains queued for exact retry. A queued
action therefore does not establish that the server never recorded it.

`src/host/build.ts` caches only shell assets. Its generated service worker has a
fetch listener but does not call `respondWith` for XRPC. The Playwright
[routing reference](https://playwright.dev/docs/api/class-browsercontext#browser-context-route)
warns about service-worker request interception, while its
[service-worker guide](https://playwright.dev/docs/service-workers#network-events-and-routing)
distinguishes frame-owned and worker-owned requests. Do not treat an abort route
as a hard network boundary for this installed-worker fixture.

The CI log contains no trace identifying the particular escaped request or
whether it happened during initial save or reload retry. It supports a narrower
conclusion: the assumed disconnection allowed a write to reach the live host,
while the device still lacked a verified receipt. It does not establish that
cancellation mutated the outbox or that the host fabricated an entry. This
correction removes that instrumentation assumption instead of weakening the
four-entry assertion or changing product retry behavior.

## Concrete correction and preserved checks

After the shell is saved and service-worker control is established, close the
real application service. Assert that the Node API can no longer sync with it,
then retain browser offline emulation for the browser's offline status. The PDS
can stay running: the browser participant API addresses the application service,
whose socket is now closed.

Keep that service stopped across archive import/export, forged-genesis refusal,
identity creation, saving an offline signed action, holding an export worker
message, cancellation and page reload. All existing state, invitation, exact
IndexedDB comparison, queued status and replay assertions remain. The test still
uses the actual installed service worker; it does not disable or replace it.

Close the browser context before restoring the host and starting its service on
the original port. This prevents the intentionally queued action from reaching
the reconnected host. The same Node API and retained host token then check that
head position remains 4. Later chart/export/invalid-activation cases use the
restored service as before. Cleanup handles both the running and stopped-service
paths, including a failure during restore.

The cancellation hold still tests a worker-message/UI boundary, not interruption
of a CPU-bound fold. The fix does not broaden that claim.

## Separate earlier CI failure

[Run 36880209217](https://github.com/generalbusiness-ai/atseq/actions/runs/36880209217)
failed in a different Node 26 browser test:
`tests/participation.test.ts:370`, “hostile template text stays text and rendering
cannot sign or fetch external resources.” It timed out after five seconds waiting
for `Applied`; the captured form had `id: positive`, price 100, an empty title and
the application still at entry 0. That is not the archive head-5 failure and is
not addressed by this change. The authoring/form work owner was notified to
investigate it separately.

## Verification still required

Source and CI-log review, primary Playwright documentation checks and
`git diff --check` completed. No installs, PDS/browser runs or suite runs were
performed while the concurrent large-state performance capture was active.

After that capture, run the complete archive test with the real PDS and Chromium,
checking all eleven subtests, retained flow evidence and the final four-entry
assertion. Check source formatting and types. Independent exact-head review must
precede landing. A passing Linux Node 22/24/26 CI run is still needed before
claiming the original Linux instability is resolved; a local pass alone is not
that evidence.
