---
date: 2026-10-02
status: source-only successor prepared; independent revised decision review pending
request: 373638c4a1c444592b6f8055d1641bc1a83bae4f
promise: 6752d5d6dde29d779387fcae880f8fd598c586a0
predecessor: 7aff44f01170b2832da6f2e1739277278538f8f8
---

# Retry/prefix ownership revision: results

The [revised decision](2026-10-02-atseq-retry-prefix-boundary.md) adopts the
independent review's three changes without runtime edits. The October 1 packet
and its original manifest/vectors remain unchanged. Full P2, R1 and P3 remain
open; this report records source inspection and packet validation only.

R1-1 now assigns request, actor retry and descriptor uniqueness exclusively to
the prefix owner and uses compact live I2 authority. The evidence owner only
mints the existing authenticated-entry capability after reading through a genuine
prefix handle and binding the exact interpreted prior. There is no raw-entry
fallback or caller-supplied checked-fact route. The descriptor reference is
consumed in verified ordering even while participant proof/interpretation is
stalled; I2 does not consume it again.

The migration follows N1-D5 D5-1: the coordinator may land first with existing I2
arrays as its sole owner and no coordinator index, then R1 switches the prefix
producer, uniqueness and compact state together. Healthy, resumed and fresh
replay must compare exact state/source/authority/outcomes/frontiers and identity
sets across that switch. The coordinator's private append-only outcome rows and
direct colocated eligibility return align with D5-1 and D5-2; no redundant
eligible-action token or second current-state owner is proposed.

R1-2 now specifies late invalid proof at p after verified head has passed p:
head and consumed identities through it remain unchanged; receipts retain only
publication assurance; contradiction status names p and interpretation stays
before p. Promotion and append readiness stop without lowering floors or making
those later identities available for reuse.

R1-3 has one result: reject stale-base publication. The caller stages again from
the current genuine base; publication does not revalidate or recompute.

## What was inspected

Read the actual ratified R1 assessment
`6e3d5811b02625ff3ad253b8de00f3c53f6854ff`, its ratification
`96af8911cb1dbb76b067effe3863c5692e23ca72`, frozen N1-D5
`85f0033e8c5d0ae636d5cc952c11a56baf9cc3f7`, and the actual D5 assessment
`de72b10f847a00b9aaf562f15b36078bff287dbf`. Coordinated the exact handoff and
staged migration with the native execution owner. Source pins record these
inspected frozen note/fixture/authority inputs separately from runtime results.

The old authority generator inserts an entry path and signs an app CAR without
publishing a native head. The old corpus passes raw entry/appRepo directly to
`authenticateAuthorityEntry`. The revision therefore calls for successor
fixtures with actual genesis/head membership and a genuine prefix path. No
synthetic head proof, test-only production mint or historical capture rewriting
is permitted. New source must cover the complete old authority/hostile case set
with its honest new fixture hashes; past exact-CAR replay remains past evidence.

## Packet validation and limits

The [manifest](../experiments/post-spike-evidence/2026-10-02/retry-prefix-boundary/manifest.json)
records byte hashes, inspected Git source identities, unchanged predecessor
artifacts and static validation. Forty-seven scenarios have unique IDs and a
closed four-field shape. They are symbolic unexecuted expectations, including
all 36 predecessor cases and 11 added migration/handoff cases. Runtime cases
executed: zero. Local Markdown links, formatting and Git whitespace are checked.
The source diagram is explanatory; no runtime state machine was exercised.

No runtime source, dependency, semantic/profile registry, public export, source
fixture or old capture was changed. No build, Node/Chromium conformance,
SQLite/IndexedDB restart, native CAS, provider test or benchmark was run for this
packet. The revised decision needs independent review before the R1 runtime
migration. Subsequent implementation must obtain exact-head review with actual
portable, compiled, hostile, crash and reference-PDS evidence.
