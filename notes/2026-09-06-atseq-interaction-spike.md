---
date: 2026-09-06
status: S4 participation gate passes; awaiting independent review
companion: notes/2026-09-06-atseq-initial-spike.md
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
---

# Atseq interaction spike

S4 joins the reviewed writer and folder into a generic local browser shell and
JSON CLI. An existing agent can pack a definition, validate it, produce a
browser preview link, create an app, sign an action and inspect its outcome
through the documented adapter. No application-specific route or form was added
to the host. See [interaction.md](../docs/interaction.md) for reproduction and
its explicit local-spike limits.

S3 candidate `9b00143e7e62b781394ce26f81129017e56ea314` was independently approved
and landed at `8becbb0e47a26dd47c45feb5048f7c5fa8fa02bb`. Its review reproduced
224 combined tests and both retained source/history replays. S4 retains the same
canonical engine and application profile; it adds interaction and operational
service methods. The source contract now states that open Lexicon object fields
pass through to folds, addressing a non-blocking S3 review observation. The
rainfall fixture now returns zero for its empty initial total, so its first
preview has a valid query result; a host check covers that case.

## What this slice establishes

A draft remains local until an explicit Start. Its source, grant keys and stable
creation ID are persisted before publication. The host preserves account and
sequencer material before remote writes and reconciles a lost response against
the same pinned genesis. Publication cannot silently reuse its ID for different
content. A separate local identity signs each browser's or CLI's contributions.
Reading and rendering create no identity, signature or commitment.

An action is signed once and stored before network I/O. The UI distinguishes
queued, recorded and interpreted progress, retains an uncertain or refused
request, and renders explicit ineffective outcomes. The worker verifies the
signed prefix and folds it before the browser marks an act Applied. A local
pending preview estimates the retained queue without changing canonical state.
The activity inspector separates intent, receipt and effect.

The development shell follows sketches A–C: draft/sample/Start, local identity,
runtime forms and queries, and receipt/outcome feedback. Its layout stacks at
390 pixels and keeps labeled controls and visible keyboard focus. Retained
Inlay Action primitives only open forms. HTML text, external references and
unsupported auto-submit properties cannot acquire signing or network effects.

## Evidence and remaining stages

`npm run test:flows -- --group participation` reports 18 passing tests: six
host scenarios, ten browser/CLI scenarios and their two parents. The combined
S0–S4 `npm test` run reports 242 passes with no failures or skips. Retained
[host evidence](../experiments/host-flows.json) and
[browser/CLI evidence](../experiments/participation.json) name every case,
versions, elapsed times and tested source hashes. Reruns go beneath
`experiments/generated/`; a partial run cannot report a complete gate pass.

[Desktop and mobile screenshots](../experiments/evidence/s4/) show the actual
shell after participation. The flow tests also check offline publication,
lost create/submit replies, a double click, refused transport, a conflicting
no-op, and retention of the active form during background refresh. Host reads
are serialized per app so a slow earlier read cannot masquerade as a rollback,
and every method reports a head at or ahead of its interpretation frontier.

The first implementation checks found and repaired the PDS handle-length
constraint, a nullable preview outcome declaration, invitation-fragment
navigation, and form replacement during refresh. These were repaired before
publishing the review candidate. The browser checks use two isolated
profiles and a third CLI key against the official local PDS, not a mocked log.
Fixture generation supplies synthetic application source; it does not count as
S6's separate agent-authoring exercise.

S4 does not implement a production identity system, PDS fleet provisioning,
subscriptions, token-refresh daemon, fast projection restoration or disconnected
shell bootstrap. It retains full-prefix verification and the reviewed bounded
runtime. S5 adds compatible activation and review of stale pending work; S6
adds complete archives, offline bootstrap/rebuild, chart export and measurements.
