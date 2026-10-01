---
date: 2026-10-01
status: body-read phase correction implemented; independent successor review pending
runtime-source: c079a412a4b4d0e6a43e326f7bc06061111944d6
predecessor-candidate: 2b9e255cf74ab5413d0baad49967ba1eda34906a
request: de0005d38cad97ebb2fef942da7b561d761a8c00
---

# Identity transport: body-read phase correction

Identity evidence becomes unavailable when reading an accepted response body
fails. This successor adopts the simpler phase boundary preferred in ratified
independent review `b3ec610b`. It replaces the previous four-code list, which
missed an ordinary TCP reset carrying `ECONNRESET`.

The [successor evidence manifest](../experiments/post-spike-evidence/2026-10-01/identity-evidence-r2/manifest.json)
records the red-test revision, corrected source, exact commands and artifact
hashes. The [previous report](2026-10-01-atseq-identity-evidence-r1-results.md) and
its captures remain unchanged. That review accepted the first-ID DID binding
correction; this successor changes only the host transport and its tests.

## Phase boundary and preserved faults

After headers arrive, a catch around `reader.read()` maps non-Atseq failures to
`content_unavailable`. It does not inspect an OS, TLS or Undici cause code.
An AtseqError from the stream retains its exact original object. Request
construction, URL and input validation, byte accounting, budget checks, chunk
collection and final byte copying stay outside this catch. The existing request
failure and deadline handling is unchanged.

This intentionally changes the earlier mock stream controls: an arbitrary
TypeError raised while reading a remote body is now an availability failure.
That read is the transport phase, not our application validation or construction
code. The programmer-TypeError control instead runs at the fetch/request boundary,
where it remains unchanged, alongside a bare terminated TypeError, invalid-argument
and request-length errors, and an Atseq integrity error. The stream separately
preserves an Atseq integrity error. No general catch over our own body-processing
code was added.

Eleven mock non-Atseq body failures cover the prior four Undici causes, TCP reset,
pipe and timeout causes, a TLS cause, two TypeErrors without recognized causes and
a non-Error stream rejection. All become unavailable evidence. The five request
controls and one Atseq stream control preserve their original objects. The mock
retains 36 consumed bytes across twelve failed body reads and successfully fetches
again; failed body reads still consume the cumulative budget and clear the active
request flag. Existing request-count and oversized-body controls also pass.

## Real connection termination and checks

A test-only revision `abc52b7c` first reproduced the reviewer’s reset: a real HTTP
server sent 1,000 bytes of a declared 100,000-byte body, then called
`resetAndDestroy()`. The previous implementation exposed TypeError `terminated`
with cause `ECONNRESET`. The retained red capture failed its expected availability
assertion. The corrected source passes the reset, `destroy()` and `end()` cases,
retaining 1,000 received bytes for each.

These loopback fixtures inject global fetch to exercise the body reader. They do
not establish production access to private networks or successful TLS-provider
compatibility. The separate production maintained-dispatcher guard still refuses
six private/literal targets and a connect-time DNS rebind, with no private TCP
connections.

| Focused checks on source `c079a412` | Result |
| --- | --- |
| Node 22.19.0 | 9/9 tests; three real termination cases; 60 unchanged identity cases; installed Undici 6.29.0 selected. |
| Node 24.21.0 | 9/9 tests; same cases; installed Undici 7.30.0 selected. |
| Node 26.10.0 | 9/9 tests; same cases; installed Undici 8.11.2 selected. |
| Build and checks | Build, types, formatting, layers and installed provenance passed. |

All 147 runtime paths, package manifests, lock files, dependency and file approval
bytes, semantic descriptors and shared identity/browser/package test files equal
candidate `2b9e255c`. Semantic profile CIDs are unchanged. The new build provenance
names the corrected host source and compiled files. Raw logs preserve their
original emitted whitespace; source, report and JSON diff checks pass.

The preceding 60-case Chromium and 219-case packed conformance captures remain
historical evidence at source `1106015a`; their package hash does not describe
this new build. As the ratified assessment requested for a host-only correction,
Chromium and packed conformance were not repeated. No complete-suite, Windows or
successful provider result is claimed. Native identity, observer orchestration,
authority and assurance-display integration remain open under the adopted design.
