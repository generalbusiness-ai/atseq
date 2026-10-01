# Native wire foundation on approved identity main

Date: 2026-10-01. Status: integration candidate awaiting independent review.
This is the partial N1-F1 wire foundation, not a supported native application
profile or complete N1 implementation.

Tracking: request `1012e4e248120172e25d4d1c5abb47153de7691e`, promise
`b19339413d9fa6e567730297b796b67d987ea4cb`. Parent N1 stays open.

## Integration and exact provenance

The released candidate is `a75f950ab80c781400572976e2e73b6655a8129a`.
Its source/test candidate is `cf2dc0952129f24516112a2c2a87fe0f163597f6`.
The new approved base is `3a40d2c5e230cd7698f9cd4b9e8e9729054be33e`,
which includes the released I1-F1 R2 identity work. The integrated source before
this results packet is `7e59d2eca65ba50abe6820f6eb4cc14b23ed25f6`.

Only the eight wire-owned commits were cherry-picked. The old merge of pending
identity candidate `412b0c9b83c921c86f95d847dabbba381767d783` was omitted, so
approved main's identity, application and source changes remain intact.

All three native protocol modules, the vector writer, fixture, shared corpus,
browser wrapper and original foundation report/evidence are byte-identical to
the released candidate. Their exact hashes are in the
[new evidence manifest](../experiments/post-spike-evidence/2026-10-01/native-wire-integration/manifest.json).
The original captures remain unchanged at their original paths. The manifest
also hashes the approved identity/application basis and fixture lock used here.
No package, lock, dependency approval, public export, supported-profile or
runtime-policy change belongs to this integration.

## Fresh checks and inherited browser evidence

Fresh validation on approved main passed:

- `npm run build`, including installed runtime file-integrity verification;
- `npm run check`: types, formatting, layer boundaries and the actual reviewed
  147-package runtime closure;
- the independent fixture writer's `--check`, reproducing retained CBOR blocks,
  digests and CIDs and independently verifying the retained signatures;
- all 53 shared wire-conformance cases in Node 22.19.0 and Node 26.10.0.

The two fresh Node result arrays agree exactly, and match the original Node and
Chromium arrays. The cases cover canonical paths and safe bounds, closed records,
both repository-key curves, P-256 device/control signatures, R0 retry identity,
context binding, account-method exclusions, exact retained bytes and unchanged
current supported-profile identities. Logs, fresh Node JSON and the small
reproducible Node-only runner are in the new evidence directory.

Chromium 153.0.8010.12 captures are inherited from the released foundation.
They were measured on published base `4b6ebab5` with identity dependency candidate
`412b0c9b` pending at that measurement. Chromium was not rerun on the approved
base; matching source hashes and fresh Node results do not turn those captures
into fresh browser measurements. No browser, benchmark or PDS publication trial
was run for this integration.

Both installations used their exact retained locks without lifecycle scripts.
The root installation reported no vulnerabilities. The unchanged PDS fixture
installation remains test support and reported its existing eight high-severity
advisories; it does not change the reviewed production runtime closure. The build
emitted the existing browser-bundle size warning. No heavy process remains.

## Scope and next gates

The [original foundation report](2026-10-01-atseq-native-wire-foundation-results.md)
still describes the exact framing implementation and its original measurement
basis. This report records the new integration basis and fresh checks.
The adopted G/null/disabled-role revision rule remains framing/vector material;
this module does not execute an authority reducer.

The foundation supplies strict native shapes, paths, signatures, byte framing,
file identity and receipt framing. Shape-valid content cannot mint source
admission, authenticated publication or authority. The preparation descriptor
remains labelled preparation; no final semantic descriptor is adopted here.

Native source/action admission and its proposed raw-projection identity,
outcome provenance, I2 authority, atomic fold integration, native CAS/publication,
receipt assurance and offline checkpoint restoration remain separate gates.
The source-only D2/outcome notes and frozen source captures were not changed by
this integration. No claim of whole N1 completion follows from these checks.
