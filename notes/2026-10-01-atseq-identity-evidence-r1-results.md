---
date: 2026-10-01
status: required review corrections implemented; successor independent review pending
runtime-source: 1106015a6217a5321608278f061fad8d5faac296
original-candidate: 412b0c9b83c921c86f95d847dabbba381767d783
request: de0005d38cad97ebb2fef942da7b561d761a8c00
---

# Retained identity evidence: review corrections

This successor corrects the two failures found in independent assessment
`d1d1d9a9`. An interrupted response body now produces `content_unavailable` for
known transport failures. A web DID document now selects the first entry with
the requested ATproto ID and validates that entry; malformed entries cannot be
skipped for a later acceptable answer.

The [evidence manifest](../experiments/post-spike-evidence/2026-10-01/identity-evidence-r1/manifest.json)
names the exact source, red-test revisions, commands, installed source basis and
retained artifact hashes. The [original results](2026-10-01-atseq-identity-evidence-results.md)
and their raw captures remain unchanged. Their 380-test full-suite result uses
original source `fb5acd9a` and baseline `4b6ebab5`; it is not a full-suite result
for this successor. This source incorporates reviewed main `2a6870ca` (including
B1 and V0) and reviewed S1 `781732f4`. The package test's adjacent required-case
lists were combined, retaining both identity and S1 checks.
Raw logs retain their original whitespace; `git diff --check` flags emitted blank
lines in the two red captures and one Vite reporter line. Source and report checks
pass without changing those captured bytes.

## Interrupted response bodies

The original reader allowed `TypeError('terminated')` from a response stream to
escape as an unexpected fault. A real HTTP server sent 1,000 bytes of an
advertised 100,000-byte body and cut the connection. Before correction, the reader
exposed that TypeError with cause `UND_ERR_SOCKET`. After correction it reports
`content_unavailable`, keeps the 1,000 consumed bytes in its cumulative budget,
and clears the active-request flag.

Classification requires a TypeError with the exact `terminated` message, an
Error cause and one of four known cause codes: `UND_ERR_SOCKET`,
`UND_ERR_BODY_TIMEOUT`, `UND_ERR_RES_CONTENT_LENGTH_MISMATCH` or
`UND_ERR_RES_EXCEEDED_MAX_SIZE`. Pinned Undici 8.11.2 creates the response errors
in its HTTP dispatcher and wraps a terminated stream with that TypeError in its
fetch implementation. The retained manifest hashes those inspected installed
files. This is a narrow list of known response failures, not a general conversion
of every Undici or application error into an availability result.

The mock stream regression covers all four codes, charges the 27 bytes consumed
across nine failed reads, and successfully fetches again. Five controls preserve
the exact original error object: a programming TypeError, a terminated TypeError
without a cause, an invalid-argument cause, a request-content-length cause and an
Atseq integrity error. A separate red capture proves the response-length case
failed before the list was extended. Existing deadline, credential, redirect,
request-count, failed-body budget and SSRF rules remain in force.

The socket-cut fixture injects global fetch to reach a loopback HTTP server. It
proves the body-reader failure path, not production permission to access private
addresses. The separate real maintained-dispatcher test still refuses six
private/literal targets and a connect-time DNS rebind, with zero private TCP
connections. No successful TLS-provider observation is claimed.

## First matching ATproto ID

Binding extraction follows the maintained ATproto DID-document selection rule:
find the first entry by its own-DID or relative fragment ID, then validate its
contents. For `#atproto`, the selected key must have the principal's controller
and a supported canonical key representation. For `#atproto_pds`, the selected
service must have the expected type and a valid HTTPS origin endpoint. Later
entries with the same ID do not repair the selected entry.

Three new shared cases place a valid duplicate after a first entry with a bad
service type, a foreign key controller, or unsupported `JsonWebKey2020` key type.
All refuse with `input`, alongside the existing bad-first-endpoint case. The
same 60-case identity corpus passes in Node, actual Chromium and the fresh
compiled consumer. The packed test explicitly requires the three new case names.

This corrects the original note's “first matching supported service” wording:
selection is by ID alone, before type, controller or endpoint validation. The
maintained `@atproto/common-web` DID-document implementation inspected for this
rule is hashed in the successor manifest.

## Integrity claim and remaining scope

The optional type-peer AST check is a useful tripwire for direct runtime imports
and computed imports. It is not a complete proof against arbitrary JavaScript:
for example, aliasing a loader can evade its syntax checks. The real guarantee
for the reviewed installed package is its exact pinned file hashes, verified by
Node, browser and packed-consumer integrity checks. This correction does not
broaden that AST check or change the reviewed exception.

The 147-path installed graph, package manifests, both lock files, dependency and
file approvals, and semantic contract descriptors are byte-identical to original
candidate `412b0c9b`. The three supported semantic profile CIDs are unchanged.
The build provenance records the combined successor source and actual compiled
files. No native identity wire files or authority rules change here.

| Gate on source `1106015a` | Result |
| --- | --- |
| Focused Node 26.10 identity, transport and type-peer checks | 7/7 tests; identity corpus 60 cases; real truncated HTTP body classified correctly. |
| Actual Chromium 153.0.8010.12 identity corpus | 60 cases plus two public Node-signed PLC fixtures; no host transport runtime modules in the bundle. |
| Node and actual Chromium worker runtime corpus | 72 identical cases in each environment, including S1 selective reads; 73/73 runner tests. |
| Fresh packed native Node consumer | 219/219 compiled cases, including all 60 identity cases; APIs, declarations, CLI and host smoke passed. |
| Build and checks | Build, types, formatting, layers and installed provenance passed. |
| Notices | Check-only verification passed for 127 installed runtime packages. |

These are focused successor checks. The reviewer's earlier complete 380-test run
and the independent S1 complete run remain separate evidence; no complete suite,
Node 22/24, Windows or successful provider trial was repeated for this successor.
The broader I1 observer, policy dispatch, native linkage, consumption ordering and
assurance display/export work remains open under the reviewed adoption design.
