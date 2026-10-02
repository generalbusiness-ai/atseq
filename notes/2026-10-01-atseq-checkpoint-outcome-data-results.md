---
date: 2026-10-01
status: internal outcome data implemented and validated; independent review and full P4 integration open
request: 181f8aa03883dacd899b30f003ce4569c0ff3cf2
promise: 77863571a9ee1e1a53c6680383a538925e035dda
parent_request: 1f13a0dcbbae3fd55a08049416ef16175a66c72d
base: db0c81747f17f180a034c67791ff1cd287c67a6a
implementation_source: bdd21674af4e6ccbef1926073b90dd6383235bcb
accepted_outcome_contract: 80e39957b6cd0d1f113f0722f6d8ef782f42e96f
---

# Checkpoint outcome data results

The internal reader uses one closed native outcome parser for both
standalone outcome data and checkpoint rows. Complete non-null outcome tables
must contain consecutive positions from 1 through the interpreted frontier and
match the corresponding retained history entries. All 103 shared outcome cases
pass on Node 22.19, Node 26.10, emitted runtime modules and actual Chromium 153.
Independent review is required before landing.

These results concern data. An outcome's `source` field does not identify its
actual producer, certify execution or grant authority. The change adds no source
or domain state admission, accepted state, restore, publication or writer
capability. Full P4 integration remains open.

## What changed

[The shared protocol parser](../src/protocol/native-outcome.ts) implements the
three adopted branches: effective, ineffective from the framework and
ineffective from the authored fold. Fields are closed on each branch. Framework
reasons use the exact 30 names and the 17 exact `fold_failed/` codes from the
accepted N1-D3 decision; a matching string pattern cannot add another framework
reason. Authored fold reasons have their separate bounded namespace. Their
optional messages must be well-formed Unicode, at most 1,024 code points and at
most 4,096 UTF-8 bytes. The returned data is owned by the reader.

The immutable reason/code tables are shared for later native application use.
There is no generic classifier or producer helper. Producer callsites and their
stage precedence remain a separate implementation task.

[The checkpoint reader](../src/protocol/checkpoint-data.ts) now reads exact
outcome row fields and validates table headers, page references, immutable byte
identities, counts and consecutive global positions. A complete table's final
entry must equal its declared frontier. The complete outcome reader also checks
the requested interpreted frontier and every row's entry against supplied
history data. A null or absent outer outcome table remains a future outer
assertion decision; this reader handles a supplied non-null complete table.

Missing required pages or history and smaller local byte/row budgets remain
typed unavailable results. Malformed outcome branches, table shapes, hashes,
coverage or history relationships reject the supplied checkpoint data. These
checks do not declare an otherwise valid native ordered history invalid.
Unexpected faults are not remapped by matching error messages.

## Evidence and results

The exact adopted outcome table JSON is 4,965 bytes, SHA-256
`787879fb8306b0fd13870bd5109dc9a1fa372172b664ae7dda074d15f7157b93`.
The exact adopted outcome vectors are 17,165 bytes, SHA-256
`7eb0c5075f437a94d62db5e08026c2ad816afb5b1380c7e8486504838f608cda`.
Both are retained as gzip fixtures whose decompressed bytes match the original
decision packet. The P4-D2 native records remain the unchanged P4-F1 retained
fixture, SHA-256
`885826c82e93de564330c1b1ca3f601b387642a9d5b719a20217e853092d9b41`.
No predecessor literal or capture was rewritten.

The shared corpus includes all 60 adopted positive and hostile outcome vectors,
extra capability/provenance fields, excluded operational failure reasons,
separate authored/framework namespaces, exact Unicode message bounds and owned
return values. Real retained outcome tables cover interpreted frontiers 12 and
13 with ordered head 13. Mutated pages recompute their native byte identities to
reach cross-page position, count, frontier and history checks rather than merely
failing the outer hash. Missing coverage and local limits have separate cases.

| Check on implementation source | Result |
| --- | --- |
| Shared outcome corpus | 103 identical case names/results on Node 22.19.0, Node 26.10.0 and Chromium 153.0.8010.12 |
| Compiled runtime imports | The same 103 cases passed on both Node versions; imported module hashes match the fresh build |
| Existing checkpoint corpus | All 91 cases passed on both Node versions and Chromium; the former unsupported-outcome case now tests the adopted shared parser |
| Fresh compiled build | Passed; installed runtime closure verified |
| TypeScript, formatting, layer and dependency checks | Passed |

The compiled probe strips types from the test driver only; its runtime imports
resolve to the actual emitted JavaScript. The browser test uses a compiled
portable bundle, compares its exact case list with Node and retains its bundle
hash. There is no browser simulation. The final build's runtime module bytes
match both compiled probe captures.

[The evidence packet](../experiments/post-spike-evidence/2026-10-01/checkpoint-outcome-data/manifest.json)
records source, fixture, command and capture identities. The initial source at
`8da97b0d` passed its Node/Chromium data cases and checks, but its compiled driver
failed before running the corpus because TypeScript 7 no longer exposes the
older transpiler API. Those exact attempts are retained separately. The corrected
driver at the implementation source above uses Node's native type stripping;
no runtime reader or test case changed. Final captures were rerun after freezing
that successor. The existing build chunk-size warning is retained unchanged.

The I1 JSON wrapper, strict JSON helper, I2 authority readers/reducer/evidence,
accepted state brand, public barrels, package metadata and dependency lock are
byte-identical to the approved base. No full ordinary suite, live PDS, packed
artifact, producer execution, provider flow, benchmark or checkpoint admission
ran for this narrow slice.

## Dependencies and remaining work

P4-F1 was independently approved by assessment
`e96fd5110b4ab475c80b7c7125ec3dcefe149a32` and landed in the base used here.
N1-D3's exact literals were independently accepted by assessment
`eda5273203fad1d3c3ecccd83faba6c398c3a55a` and ratification
`8e1cc3ea2497098265eacd04821730022eefd1c8`.

Independent exact-head review is still required for this slice. Native execution
producers must use the shared tables under their separately reviewed stage
rules. Full checkpoint assertions still need publication membership, admitted
source and state, the private asserted-authority boundary and complete coverage
before suffix interpretation. Audit, restore and writer readiness remain
separate capability routes with their own evidence.
