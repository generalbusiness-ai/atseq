---
date: 2026-09-06
status: S6 independently approved and landed; retained acceptance snapshot
companion: notes/2026-09-06-atseq-initial-spike.md
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
---

# Atseq spike results

Review annotation: the acceptance candidate `e60e603ce2f57fd0a3a85ef39c024f18533513a9`
was independently approved and landed at `a68466608bc1f269d7296a5ed7d6d613d6cbd303`.
The [completion record](2026-09-06-atseq-spike-completion.md) retains the exact
review event and residual findings. Measurements below are unchanged from the
generated acceptance snapshot. Regenerating this note restores that pre-review
snapshot; review and landing remain recorded separately.

The spike supports the proposed source and log architecture: unique applications
load from Lexicon schemas, JSONata behavior and retained Inlay views; independent
keys contribute signed actions; compatible changes take effect at a recorded
boundary; complete retained copies replay without the PDS. GitSeq and Tailapps
remain architectural precursors, not runtime dependencies or compatibility targets.

The decision is **revise the complete-prefix serving and verification path before
using this host for long-lived, growing histories**. Keep the declarative source,
signing, retry, activation and replay contracts. This run establishes semantics
and recovery, and also measures the cost that the next small implementation
must address. It does not establish production hosting or unbounded scale.

## Measured behavior

| Entries | Confirmed append p50 | p95 | Node full replay | Node one-entry catch-up | Browser replay + transfer |
|---:|---:|---:|---:|---:|---:|
| 100 | 173.6 ms | 186.0 ms | 87.3 ms | 75.4 ms | 154.8 ms |
| 1,000 | 1.46 s | 1.49 s | 810.6 ms | 646.4 ms | 1.36 s |
| 10,000 | 18.66 s | 39.52 s | 7.89 s | 6.59 s | 15.42 s |

Measurements were taken on Apple M5 Max, arm64,
18 logical CPUs, 64 GiB RAM,
darwin 25.6.0, Node v26.8.1.
The official PDS 0.5.31 runs HTTP/SQLite/file blobs on loopback with its mock PLC.
Nine individually confirmed sequencer appends near each size supply the raw
nearest-rank percentiles. Conditional signed batch seeding is setup, excluded
from those samples. Node replay uses memory without per-entry projection fsync;
catch-up still verifies the full prefix. These are measurements of one local
run, not load targets or capacity estimates.

Chromium 153.0.8010.12 kept a button and animation frames active
while workers replayed each prefix. Worker startup was
35.3 ms, 19.4 ms, 18.8 ms respectively.
The isolated Chromium processes' summed RSS after each run was
453 MiB, 580 MiB, 1294 MiB.
RSS includes shared pages counted by multiple processes and the test shell;
it is not per-application retained heap. Full inputs, duplicate verification,
projection copies and retained outcomes explain substantial avoidable work.

## Acceptance evidence

All 13 recorded commands completed successfully.
Dependency installation is a setup prerequisite, outside these 13 commands.
The plan's checks are composed with four explicit S6 commands: archive flows,
Node measurements, browser measurements and retained authoring verification.
[Machine-readable acceptance](../experiments/acceptance.json) lists command
arguments, exit codes, elapsed times and log hashes. The retained command logs
are in [acceptance-logs](../experiments/acceptance-logs/). Individual stage
reports were rerun and refreshed against the tested source; independent S1
expected vectors were not regenerated.
Each run replaces the retained acceptance status before executing a command.
Failures retain their command logs and failed report, and prevent this result
generator from reporting success. The report also checks retained output hashes
so a later evidence rerun cannot silently substitute its output for this run.

The archive gate verifies evolved and earlier prefixes, rejects missing source,
tampered history, inventory/runtime mismatches and conflicting invitations,
removes only a marked disposable projection file, and compares a separate CLI
rebuild's state, active definition, outcomes and frontier. Rebuilt retry receipts
are also compared with the live sequencer's lookup results; the host does not
persist a separate retry-index file. Chromium
bootstraps its installed shell offline, imports the archive without a signing
identity, and exports the same verified projection again. Retained
[archives, chart and screenshots](../experiments/evidence/s6/) demonstrate this
flow and a small CSV import with static SVG/table source-head metadata.
The importer reads the CSV and submits its four rows as signed actions; the fold
derives chart state from those actions. The retained CSV documents that input.
An existing device genesis pin survives a conflicting archive import. The worker
honors the longer replay budget while keeping the shorter preview default.
The held-message cancellation fixture pins cancellation UI and retained outbox
behavior; it does not measure interruption of CPU work inside an evaluator.

The first S6 review at dd34b5e reproduced the gates and measurements, then
required three corrections: preserve the existing genesis pin on archive import,
honor the longer worker timeout, and retain failed acceptance runs. Those paths
now have regressions. This run also includes S5's corrected oversized-closure
transport, so an invalid available activation replays consistently offline.

The existing authoring agent built **Mending circle: shared tool desk** after the host started,
using only documented JSON adapter calls and source files. Its original run
is retained separately from the repeat publication under the corrected S5
runtime, with the repeated run named by the final evidence. It exercised two
participants, competing requests, identity-dependent returns and exact retry.
The parent captured host source and built shell hashes before and after that
exercise. The retained build bytes and current source are checked against them;
this is inspectable capture evidence, not an independent observer of the process.
Source, the sanitized tool transcript, archive and independent replay
verification are in [agent-authored](../experiments/agent-authored/).
This is separate from the automated fixture-generation gate.

One useful authoring gap surfaced: sample preview uses an empty actor key,
whereas recorded actions use their signed actor. The agent made that case
explicit in its fold before publishing. The sample CAR and actual request/result
history are retained. Preview identity simulation remains a later usability
choice; it is not silently equated with signed participation.

## Next smallest change

Retain a verified prefix by its exact genesis/head and process only authenticated
extensions in normal append and catch-up paths, while preserving complete cold
replay and fork/rollback checks. Start with the measured single-writer host;
do not add another event store or a per-domain backend. Measure the same three
histories again and keep the full-prefix implementation as a verification oracle.
Checkpoint/cache boundaries must not silently change canonical outcomes.

General state migrations, runtime upgrades, account delegation, private data,
production authentication, token renewal, subscriptions and deployment remain
outside this spike. Archives require the named installed runtime, and missing
upstream standalone license notices are reported as such. Notice text and replay
instructions are retained packaging metadata, not runtime identity checks.
Independent review and workroom landing, which remained outstanding when this
acceptance snapshot was generated, are now recorded in the completion note.
