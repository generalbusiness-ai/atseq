---
date: 2026-09-06
status: S6 acceptance passes; awaiting independent review
companion: notes/2026-09-06-atseq-initial-spike.md
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
---

# Atseq spike results

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
| 100 | 361.2 ms | 385.5 ms | 169.5 ms | 129.5 ms | 148.1 ms |
| 1,000 | 1.68 s | 1.95 s | 823.1 ms | 660.7 ms | 1.39 s |
| 10,000 | 16.49 s | 26.75 s | 7.90 s | 6.67 s | 15.12 s |

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
34.5 ms, 17.9 ms, 18.2 ms respectively.
The isolated Chromium processes' summed RSS after each run was
452 MiB, 591 MiB, 1319 MiB.
RSS includes shared pages counted by multiple processes and the test shell;
it is not per-application retained heap. Full inputs, duplicate verification,
projection copies and retained outcomes explain substantial avoidable work.

## Acceptance evidence

All 13 recorded commands completed successfully.
[Machine-readable acceptance](../experiments/acceptance.json) lists command
arguments, exit codes, elapsed times and log hashes. The retained command logs
are in [acceptance-logs](../experiments/acceptance-logs/). Individual stage
reports were rerun and refreshed against the tested source; independent S1
expected vectors were not regenerated.

The archive gate verifies evolved and earlier prefixes, rejects missing source,
tampered history, inventory/runtime mismatches and conflicting invitations,
removes only a marked disposable projection file, and compares a separate CLI
rebuild's state, active definition, outcomes, retries and frontier. Chromium
bootstraps its installed shell offline, imports the archive without a signing
identity, and exports the same verified projection again. Retained
[archives, chart and screenshots](../experiments/evidence/s6/) demonstrate this
flow and a small CSV import with static SVG/table source-head metadata.

The existing authoring agent built **Mending circle: shared tool desk** after the host started,
using only documented JSON adapter calls and source files. Its original run
is retained separately from the repeat publication under the corrected S5
runtime, with the repeated run named by the final evidence. It exercised two
participants, competing requests, identity-dependent returns and exact retry.
The host source and built shell hashes were identical before and after that
exercise. Source, the sanitized tool transcript, archive and independent replay
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
upstream standalone license notices are reported as such. Independent review of
the exact S6 candidate and workroom landing are still required before marking
the series complete.
