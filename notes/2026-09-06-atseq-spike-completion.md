---
date: 2026-09-06
status: S0–S6 independently approved and landed; follow-on work is separate
companion: notes/2026-09-06-atseq-spike-results.md
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:fc90064e2a7373e65df91bc7110533a8d94c13ae
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:168677fe088151adc064955e1b4224ab268ce229
---

# Atseq spike completion

The adopted S0–S6 spike is complete. The source, tests and retained evidence
are independently approved and landed on `main` through
`a68466608bc1f269d7296a5ed7d6d613d6cbd303`. This note records that completion
without changing runtime code, regenerating evidence or adopting another
implementation phase.

The spike supports unique applications described by retained Lexicon schemas,
JSONata behavior and Inlay views, with signed participation, exact retry,
compatible definition activation and offline replay. GitSeq and Tailapps remain
architectural precursors; neither is a runtime dependency or compatibility gate.

## Reviewed heads and landings

Each row names the exact candidate independently reviewed by `atseq-reviewer`
and its subsequent workroom-controlled landing by `atseq-codex`.

| Stage | Reviewed candidate | Landing on main |
|---|---|---|
| S0 — engine feasibility | `be868fd2db3c817047d4108f5f125716792c2858` | `ba7d5f447b468373cad7bf05114cf62522e12602` |
| S1 — protocol | `4651478aa193e0e71b6097cc25eb3b7fb9197662` | `1f7a7a1ebb7189b91c3fd7aa3d6f8c9264c6529e` |
| S2 — PDS persistence | `70f4c89d517fad69724b12caa76d1425ef9564cf` | `71d912ec7dea238f8709d336c5c988d035ceb18f` |
| S3 — retained definitions and folder | `9b00143e7e62b781394ce26f81129017e56ea314` | `8becbb0e47a26dd47c45feb5048f7c5fa8fa02bb` |
| S4 — browser and CLI interaction | `b765e6bd7902c0042baf1c6ec98c9a85e6d02215` | `6477b73f3be27880fd592f7015b4c7dcb1eda74a` |
| S5 — compatible evolution | `fe418e89900cb87500ca2306f3ec8d5aca3f4043` | `6493a2bbfd25594a1d43ee89d45a2658408a7a14` |
| S6 — archives and acceptance | `e60e603ce2f57fd0a3a85ef39c024f18533513a9` | `a68466608bc1f269d7296a5ed7d6d613d6cbd303` |

S5 approval is the workroom report ending `fc90064e2a7373e65df91bc7110533a8d94c13ae`;
S6 approval ends `168677fe088151adc064955e1b4224ab268ce229`. Their full event IDs
are in this note's provenance. Both approvals were ratified before landing.
The separate workroom ref is
`refs/seq/fa8d62ed900d7697380a68652abb3e45d950a677`.

## Evidence and decision

The S6 reviewer reproduced all 13 acceptance commands, 283 full-suite passes
and 12 archive-gate passes. The reviewer verified the source hashes in all 13
experiment reports, all 13 retained-output hashes and all 13 command-log hashes.
The authoring exercise records 22 adapter calls and five signed entries, with
all 51 captured source/build hashes unchanged. See the
[result note](2026-09-06-atseq-spike-results.md),
[acceptance report](../experiments/acceptance.json),
[command logs](../experiments/acceptance-logs/) and
[agent-authored application](../experiments/agent-authored/).

At 10,000 entries the retained run measured 18.66 seconds for median confirmed
append and 15.42 seconds for browser replay plus transfer. These are local
measurements on one machine, not capacity targets. The decision remains to
revise complete-prefix serving and verification before using this host for
long-lived, growing histories. Preserve cold replay as the correctness oracle
while investigating verified prefixes and authenticated extensions. That
implementation is a follow-on, not part of this completed spike.

## Review lessons and remaining limits

The S5 corrections make every reader judge the same available signed source
closure, even when it exceeds the definition-admission bound. Missing or corrupt
named content pauses interpretation. The S6 corrections preserve existing
genesis pins on archive import, honor the longer worker replay budget and
retain failed acceptance runs. Their regressions failed under the reviewer's
targeted mutations.

The approvals also retain these operational limits and smaller test gaps:

- A first archive import bootstraps trust from that file. It does not prove
  ownership of its claimed DID, and there is currently no device unpin flow.
- An activation-key holder can name a closure above the 16 MiB transport budget
  or exhaust shared history/source limits, making sync unavailable. Some 503
  branches lack direct tests. Transport limits fail loudly; they do not supply
  every reader with a complete interpretation.
- Restoring a host stops at the first incompatible old-profile application.
  The broad catch for an available invalid activation can also classify a
  catchable transient fault as invalid; this trade-off is documented.
- The CLI supplies an invitation pin only when both app and genesis are given.
  The evaluator timer test needs its own failure deadline; some archive bound
  rejection assertions do not pin the rejection reason. Evidence and authoring
  hash checks run as scripts rather than dedicated mutation tests.
- General migrations, runtime upgrades, production authentication, private
  application data, account delegation and deployment remain outside the spike.

The detailed contracts remain in [evolution](../docs/evolution.md),
[archives](../docs/archives.md) and the [runtime profile](../docs/runtime-profile.md).
These findings inform future work; this completion note does not silently
adopt fixes or broaden the implementation scope.

## Populated rendering documents and Noseq

The subsequent design discussion proposes letting a fold directly maintain a
populated renderable document: an interface with inline data, SVG or a scene
for Three.js/WebGL. Objects could carry stable IDs, semantic values, asset
references and declarative action bindings. A separate queryable dataset would
be optional. Camera movement, animation and GPU rendering can remain local;
the shared deterministic result would be the document and its meaning.

This is a hypothesis for a later experiment. The S6 chart export queries folded
state and then generates static SVG/HTML; it does not establish direct fold
rendering or a 3D pipeline. A 3D experiment must also address the current
integer-only evaluation profile and bounded source/state sizes.

The user requested a separate task to apply the completed spike's learnings to
`~/play/noseq`, whose context is confidential applications over Nostr. That
task should assess the final evidence, update Noseq's design and prototype
plan, and coordinate with work already in progress. Atproto-specific transport
and identity choices should be reassessed for Nostr. The request carries the
populated-document hypothesis, but does not establish it as validated behavior
or authorize every proposed Noseq implementation phase.
