---
date: 2026-10-02
status: internal implementation candidate; independent exact-source review required
request: b052638e409bdb9d60b536c5e3c86b49260f8c38
promise: 555dd11a50f680f5e00d653b3e22e92d0a99057d
baseline: 65e7042a01184f4d755bf0a7853e92411e6dee9f
source: 1e8dd409c69f5c216ccc6b288a6c38ca9e6b4722
decision-adoption: bf9d182b73df7149f6e98af1808adcb09c4e4ded
assessment: 39d4c72cbf480d5b9961d7ae956752a7db8f11e3
---

# Native observation implementation results

The internal host observer now prepares requests from accepted I2 authority
state, obtains and verifies public identity and repository evidence, and retains
that evidence for offline interpretation. Genuine signed PLC logs and native
repositories pass through the observer and then through I2 on Node 22.19, 24 and
26. Chromium verifies the same retained account and app evidence. HTTP delivery
in the observer fixtures is simulated; these results do not establish real PDS
provider interoperability.

This implements the corrected
[observer proposal](2026-10-01-atseq-native-observer-preparation.md) and the
D3 clarification retained at source `17a2298064a156c178d43621cc24c3488022bc78`, with both
mandatory D3 assessment corrections. Original notes and historical evidence are
unchanged. The implementation source is frozen at `1e8dd409`. This report and its
evidence are publication descendants; their manifest pins the complete source,
the approved baseline and the compiled files used for testing.

## What changed

`src/host/native-observer.ts` implements `fromAnchor`, `prepareAccount`,
`prepareRecovery`, `observePrepared` and `observeApp`. The observer checks the
external app/genesis pin and loads the exact genesis-appointed observation policy.
It supports the existing fixed algorithm, appointed PLC directory, web allowance
and native-publication checkpoint. Caller-supplied keys, resolvers, permission
callbacks and observation policies are absent.

Preparations capture a genuine private I2 state. They check app/genesis scope,
next position, predecessor, expected epoch and observation floor; recovery also
checks the exact typed unsigned intent and consumed actor nonce. Empty frozen
objects backed by private WeakMaps carry preparations and captures. Copied,
forged, cross-observer or independently reconstructed state cannot substitute
for them. `readCapture` returns owned copies; `assertCapturePrior` requires the
same current accepted prior before handoff. A host with a newer frontier must
prepare again explicitly or preserve an existing exact signed request for retry.

`src/protocol/native-observer-car.ts` owns the selected commit and hash-checked
body blocks. It uses maintained CAR/CID utilities and the existing P1 verifier;
there is no second signature or MST verifier. Each `getBlocks` response has an
exact requested/returned body CID set, at most 64 returned entries including
duplicates, and a hash check on every entry. Empty, unrelated or multiple header
roots remain bounded CAR syntax and do not select authority. Recomposition uses
the original signed commit. Unrequested body blocks are invalid input; omitted
requested body blocks are unavailable and may use the bounded full-export route.

The narrow existing `IdentityFetch.assertActive` checks the transport's original
deadline and caller signal at phase boundaries and immediately before capture
or refusal. It prevents local hashing and evidence construction from minting a
capture after the network reservation expires. The transport's guarded fetch,
secrecy, body accounting and failure classification are otherwise unchanged.

No dependency, package export, supported semantic registration, lexicon, policy
schema or authority interpreter changed. Observation assertions cannot authorize
a device, appoint control, prove their own publication or establish external app
bootstrap trust.

## Observation sequence and refusal priority

One `IdentityFetch` reservation covers at most three complete attempts: 30 seconds,
64 requests and a cumulative 32 MiB of response bodies. Exact missing CIDs are
batched across known subject paths, with at most 64 CIDs per request. The retained
proof has at most 16 MiB and 50,000 unique blocks, and at most sixteen required
subject paths. Shared limits survive all retries.

An attempt derives the before-method binding, authenticates the selected signed
commit, discovers the required native records, then independently derives the
after-method binding before returning a capture or source refusal. A changed
binding or PLC tip discards pending evidence or refusal and restarts the whole
attempt. A stable missing/replaced source path produces an immutable diagnostic
and no descriptor, completed request, nonce consumption or ordered history result.
Unexpected runtime and integrity faults retain their original identity.

For epoch advance and participant recovery, authenticated `epochCurrent/self`
is checked before the requested transition's absence or replacement. A stable
pointer mismatch raises the existing `envelope` refusal, including when the
target path is demonstrably absent or replaced. A pointer still on the prior
epoch is the same refusal for an unpublished advance. The caller must publish
the exact transition and current pointer, then prepare again. The observer never
silently selects another transition or retargets the request. An after-method
change discards even this pending mismatch before retrying.

A primary `getRecord` 404 or unavailable response is transport evidence only.
It may use one bounded `getRepo` fallback to select an authenticated full-export
root when no root was selected. The observer proves membership or nonmembership
from that root; it never turns the 404 into authenticated absence. Once a root
has been selected, a different authenticated full-export root restarts the whole
attempt. Advance/recovery pointer discovery still comes first, so rootless
recovery cannot let an absent target outrank stable pointer mismatch. If the one
fallback remains incomplete, the attempt is unavailable.

Recovery captures remain unsigned until a device signs the completed intent.
The observer captures facts even for an unappointed recovery controller or an
old-epoch grant. The existing I2 interpreter alone returns `control_unappointed`
or `epoch_conflict`. Completed original request retry lookup belongs to R1 before
observation; this observer contains no second retry or permission evaluator.

## Executed checks

The [evidence manifest](../experiments/post-spike-evidence/2026-10-02/native-observer/manifest.json)
pins commands, exact public fixtures, logs, source and build provenance. Observer
HTTP fixtures replace delivery at the existing transport seam while preserving
its request, body and deadline reservation. The separate production transport
tests execute the maintained connection-time DNS and private-address guards.

| Runtime | Result |
| --- | --- |
| Node 22.19.0, 24.21.0, 26.10.0 | All 13 focused tests pass on each version: observer, whole-reservation limits, production identity transport, I1, P1 and I2. Each observer capture contains 71 case labels: 34 host cases, 20 portable CAR cases and 17 exact retained replays. |
| Compiled Node consumers, all three versions | Four cells each: P-256/secp256k1 repositories crossed with PLC/hostname-web participants. Actual compiled observer/P1/I2 modules prepare, capture, interpret offline and verify retained app publication. Compiled private state is created independently; source-module state is rejected. |
| Chromium 153.0.8010.12 | Four browser tests pass: I1, P1, I2 and observer retained replay. Observer corpus has 20 portable CAR cases and 17 exact Node-produced account/app replays. Its portable bundle is 806,997 bytes. Host transport is not imported into the browser. |
| Source/build checks | TypeScript, formatting, layer boundaries, dependency closure and normal package build pass. Source and output hashes are retained with the compiled probe results. |
| Full Node 26 suite | All 460 tests pass on the frozen source, with no failures, cancellations or skips. |

Positive account paths cover admission, exact revoke, linked epoch advance and
recovery followed by genuine actor signature and I2 authorization. Four basic
curve/method cells retain full public content and expected whole I2 snapshots;
additional fixtures retain explicit publication after D3-2 refusal, recovery,
ineffective controller and old-epoch results. Five app captures include hostname
web bootstrap and exact genesis/entry membership. Replaying retained account
content makes no live method or repository lookup. Chromium consumes the exact
Node-produced fixtures and compares the whole expected authority snapshots.

Hostile checks include forged/cross-owner preparation and captures, wrong prior,
scope/frontier/floor, consumed nonce, pre-cancellation, malformed diagnostic time,
stable missing/replaced subjects, mandatory D3 priority, invalid/unavailable
after-method evidence, same-root export recovery, omitted/extra body blocks,
busy pruning, same-key PLC-tip rotation and repository-key/PDS migration. The
migration test discards a pending pointer mismatch and succeeds only after a
complete observation at the new endpoint, key and root. A genuinely signed
retired-key commit with an invented high revision cannot regain authority under
the newly observed key. Portable CAR cases exercise both curves, header-root
variations, body corruption, ownership and the 64/65-entry boundary.

The deadline test waits through the actual unchanged 30-second reservation during
final proof construction after both method reads. It returns unavailable without
capture or state change on every Node version; it does not replace the timeout.
Actual caller cancellation at the same phase prevents account and app capture.
The cumulative-body test uses a valid 15,213,076-byte signed CAR and different
authorized PLC tips. Two whole attempts consume the shared budget; the third
fails without reset or capture. The existing transport suite separately verifies
the 64-request boundary, partial failed-body accounting, credential/cache/redirect
policy and connect-time rejection of private DNS answers.

## Recommendations and remaining gates

Accept this internal implementation after independent exact-source review, then
compose the retained capture with R1 retry handling and the N1 host publication
transaction. Recheck the captured prior immediately before publication. Keep
source refusal, proof unavailability and ordered ineffective authority outcomes
distinct at that boundary.

Full I1 adoption still needs a genuine provider trial, supported native profile
and policy dispatch, host publication/ordering integration and restore wiring.
The proposed app-PDS signing authority remains: a PDS holding the repository
signing key can construct another ordering. This observer supplies evidence for
that ordering; it does not change the app's authority model.

Stable before/after observations are a bounded observation, not a proof of global
latestness or uninterrupted stability. A directory can withhold a valid newer
PLC history; the executed truncated-log case remains authentic. Hostname web
retains the weaker `web-observation-v1` assurance and has no retained key-history
continuity equivalent to PLC. Neither a high repository revision nor a local
timestamp proves freshness beyond the accepted observation floor. Rapid method
changes or repository pruning may exhaust retries and remain unavailable. No
`did:webvh` support, provider-success claim or external app trust capability is
introduced by these fixtures.
