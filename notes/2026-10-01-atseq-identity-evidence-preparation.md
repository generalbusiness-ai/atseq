---
date: 2026-10-01
status: source preparation only; dependency and runtime integration pending
baseline: 2c7598389f58519af2ed86b8d561f8f9725866b5
request: 71b93a9c916f99f9828da61d3737553117e454ab
---

# Retained identity verification: source preparation

This isolated candidate prepares the portable verification part of I1 against
accepted assessment `cc21a77c` and its canonical-tip correction `e00cf34a`.
It contains source and a shared test corpus; it is not an implementation delivery
or proof of runtime conformance. Package/dependency approval and provenance changes
are held while M0/B0 integration settles. No dependency was added or installed,
and no implementation tests, compilation, browser execution or build were run.

The proposed internal modules are:

| Module | Boundary |
| --- | --- |
| `src/protocol/identity-json.ts` | Exact retained UTF-8 bytes, BOM refusal, strict jsonc visitor, decoded duplicate names and depth 32, then JSON.parse of the same text. |
| `src/protocol/identity-key.ts` | Shared key representation/curve checks through P1 and maintained crypto/multibase; HTTPS-origin extraction. |
| `src/protocol/identity-plc.ts` | Whole retained audit, bounded signed fields/arrays/maps/bytes, exact DID/CIDs, canonical signature encoding and timestamp checks, maintained indexed verification, computed-tip equality and normalizeOp binding. |
| `src/protocol/identity-binding.ts` | Adopted method-specific evidence and assurance result; web document extraction and PLC tip extraction; pure before/after comparison. |

These helpers implement the adopted default method policies internally. Final
appointment of an exact policy CID and descriptor/operation encoding remains the
I1/I2/N1 wire boundary. The helpers are not exported through package entry points.
Existing `protocol/identity.ts` semantic-profile identity is untouched. Nothing
here performs a resolver/PDS request or chooses an app root, principal entitlement,
account epoch or authority transition.

PLC schema results are prechecks only: hashes and signatures use the original
parsed signed operations. All signed fields are retained; unknown operation or
service fields are refused. The maintained verifier's ordinary crypto defaults
supply low-S checks; the wrapper supplies compact/unpadded encoding checks.
The asserted tip must equal the final computed canonical row, and a tombstone tip
fails regardless of an earlier active selection. Binding derives only from that
tip through maintained normalization. Earlier genuine history can still be
truncated by a dishonest source; signature verification is not global latestness.

PLC observations compare computed tip CIDs, including a tip change which leaves
key/PDS unchanged. Web observations compare principal/key/PDS and carry the weaker
web assurance class. The output exposes the class for later display/export;
this preparation does not implement those product surfaces.

The shared corpus in `tests/support/identity-corpus.ts` is consumed by prepared
Node and actual-Chromium tests. It includes signed fixtures for both curves,
older selection with later canonical operations present, deliberately truncated
valid history, exact genesis DID, issuer substitution, valid-hash bad and high-S
signatures, padded signatures, tombstone selection, duplicate CIDs, false unsigned
nullification, higher-priority recovery/timestamp rules, no lossy signed fields,
legacy original genesis bytes, strict JSON/UTF-8/depth, and web endpoint/controller/
array/fragment/method rules. The browser consumer also takes public Node-produced
signed PLC fixtures. None of these prepared cases has been executed yet.

Source formatting and `git diff --check` were run. They do not substitute for
TypeScript or runtime verification. After package graph release, install only
the independently approved exact dependency closure, implement the narrowly named
valibot optional-typechecking-peer exception and runtime-edge refusal, regenerate
provenance, and run the prepared corpus in both runtimes. Expand it for any missing
adopted limits/hostile cases found during validation. Measure actual package and
browser-provenance cost rather than infer it from tarball sizes.

The host transport remains separate work: Node >=22.19 support/CI/docs, exact
maintained fetch-node adapter and private-address/connect-time DNS rebinding gates
on 22.19/24/26 are unimplemented and unrun. Same-root native proof completion,
observation retention/consumption, restore floors, display/export, provider trials
and final app-authority/ordering integration likewise remain outstanding. No
runtime claim or task-completion verdict is made by this note.
