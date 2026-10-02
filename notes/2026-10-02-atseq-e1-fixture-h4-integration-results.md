# E1 fixture preparation on reviewed H4 — 2026-10-02

The normal project check now passes on Node 22.19.0, 24.21.0 and 26.10.0 using
the reviewed repository configuration. The experiment source, signed fixtures
and successful runtime results are unchanged. This successor closes E1-F1's
local H4 integration gate; independent exact-head review and pushed-main CI
remain required before landing. Full E1 measurements remain open.

The request is `443018dc14130da954873a507b7a0ba503706379`, with promise
`a5380c898ad8a6e425e74c27a3aafdf1baadaee3`. The reviewed basis is main
`51079ecf9bb9b1f024589c341ce5cd473dd064e1`, containing independently approved H4
candidate `9f5544dfa82a32bb1ed741235e1193fdf3b2e282` (review
`5ddc66e63982a7b91501daa5b05e68923cebba1f`, ratification
`283bb746836ceeeea968128fc72df737b9fce109`). The actual checked successor source
is `d32dabe0aadd34a01f7e34a546b5cf38f368690a`.

## Original evidence remains intact

Original delivery `2395c470283111e4817dde1342e973edd5e4e419` and fixture producer
`dd2f97bd710c88fa5c3f629f8efa6f00f837e5b1` are preserved in their original
worktree. The successor carries all seven experiment/test files, the original
report and all original captured evidence byte for byte.

The [original report](2026-10-02-atseq-e1-fixture-preparation-results.md) retains
its actual 7de-basis attribution. Its failed normal check still has 74 frozen
upstream excerpt diagnostics, and its successful compiler check used an
explicit temporary proposed-H4 configuration. Those historical statements were
not rewritten to suggest that normal check had passed then.

The original manifest digest remains
`b1d63ba01fe69f662cbfca8262e8c33c5d6e3dca725db5898765d820ff11647e`.
All 61 captured-file hashes and the original report hash match. Of its 313
source pins, only `tsconfig.json` differs in the successor: its bytes now match
the reviewed main configuration, which excludes `experiments/post-spike-evidence`
without changing the live include frontier or compiler options.

## Actual successor checks

A fresh isolated worktree contains physical root and PDS dependencies copied
privately from the original E1 checkout. Every one of the 194 recorded runtime
package directories is physical; all 14,234 recorded runtime file hashes match
the original. No dependency graph, profile, export or production source was
changed by this delivery.

The Node 26 production build passes. Its 144 build-source pins differ only at
reviewed `tsconfig.json`. All 464 emitted output hashes are identical to the
original successful build. The current outputs were individually checked
against both build manifests.

| Runtime | Normal `npm run check` | Normal compiler list | All seven E1 inputs present |
| --- | --- | --- | --- |
| Node 22.19.0 | Passed | Passed | Yes |
| Node 24.21.0 | Passed | Passed | Yes |
| Node 26.10.0 | Passed | Passed | Yes |

Each normal check includes TypeScript, formatting, source-layer boundaries and
installed dependency provenance. The actual compiler lists match across all
three runtimes and, after normalizing worktree paths, match the original
proposed-H4 compiler list. They retain 276 live src/scripts/tests/experiments
inputs, including all five new experiment modules and both new test files.
No temporary compiler configuration is needed for these successor checks.

Fixture generation and the already successful Node/Chromium immutable fixture
tests were not repeated. Their source and dependency bytes, all actual compiled
outputs and all retained signed input bytes are unchanged. The only new build
input controls archival compiler scope; it does not change those executable
outputs. The earlier six-fixture, 22,200-entry, 42-root validation, Node
22/24/26 small conformance, Chromium equality and exact R1 stage/fault checks
remain attributed to their original producer. No ordinary full suite was
repeated locally for this configuration integration.

## Packet verification and delivery

[The successor manifest](../experiments/post-spike-evidence/2026-10-02/e1-fixture-preparation-h4-integration/manifest.json)
pins the current source, report, normal-check logs, runtime records, compiler
lists, actual build provenance and comparisons. The packet checker verifies
the successor and original captured hashes, the reviewed configuration bytes,
physical dependencies and actual build outputs. After building an independently
installed successor checkout, run:

```sh
python3 experiments/post-spike-evidence/2026-10-02/e1-fixture-preparation-h4-integration/verify-packet.py --repo .
```

The delivery list names every path added relative to reviewed main. The source
producer precedes this documentation/evidence-only freeze so that artifact
hashes do not depend on a self-referential delivery commit.

The actual Linux [Check run 37006369336](https://github.com/generalbusiness-ai/atseq/actions/runs/37006369336)
is tracked by the parent agent. This packet makes no success claim for that
run or for later E1 landing CI. Independent review and actual integration CI
remain gates. Native-host/provider measurements, durable restart and installed
restore, checkpoint readiness and fixed-target audit, offline credentials-free
comparison, recommendations and residual limits remain full E1 obligations.
