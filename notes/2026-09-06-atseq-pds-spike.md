---
date: 2026-09-06
status: S2 implemented; gate passes; awaiting independent review
companion: notes/2026-09-06-atseq-initial-spike.md
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
---

# Atseq PDS spike

S2 implements real PDS persistence behind the S1 protocol: genesis/head
provisioning, conditional entry/head batches, one local writer lease, receipt
lookup, verified bootstrap/catch-up, and retained source bytes. Local XRPC
submit and receipt methods share the authored framework Lexicons. The
[host contract and reproduction steps](../docs/pds-host.md) explain the limits.

## Measured result

The gate runs 21 integration scenarios against official PDS 0.5.31 with real
HTTP and SQLite storage. Node's test runner reports 22 passing tests including
the parent. Combined S0, S1 and S2 tests report 179 passes. The final verified
fixture history has 111 entries and spans real PDS listing pages.
[Retained evidence](../experiments/pds.json) records each result, elapsed time,
versions and source hashes; reruns write `experiments/generated/pds-results.json`.

The scenarios establish concurrent contiguous appends, exact and re-signed
retries, conflicting retry refusal, a rejected conditional batch with no partial
head advance, a racing unrelated repository write, and a lost response after
a real successful commit. Separate writer processes prove lease exclusion and
recovery after SIGKILL before and after acknowledgment. A PDS SIGKILL/restart
preserves acknowledged history and retained blobs. Receipt responses name
pending interpretation, never an invented domain effect.

Catch-up works without a subscription or delivered notification. A retained
head detects rollback; changed signed content fails verification. Missing and
tampered source references, missing blob files and corrupted blob bytes all
fail retrieval until exact content is restored. A repository CAR retains the
reference records but does not contain those blob bytes.

One useful PDS finding: removing the last source reference can delete the blob
immediately. Restoring the reference alone returns `BlobNotFound`; recovery
must upload retained bytes before restoring the record. No application object
is treated as retained merely because its CID appears somewhere in the log.

## Interpretation of the result

The persistence part of “folder over a log” now has an executable proof. The
folder is still S3 work. Source fixtures in S2 are explicitly opaque and do not
pretend to implement the application definition format. Genesis remains pinned
by the invitation. The writer records well-formed actor intents; it does not
authorize domain effects or activate definitions.

The native PDS harness follows the upstream development pattern. Its PLC uses
the official in-memory test database and remains running during PDS restart.
All accounts and corruption targets are disposable, loopback-only test data;
the GitSeq resident at port 8001 is separate. Dependencies, secrets and data
directories are ignored. The isolated PDS/PLC dependency graph has 11 reported
audit findings; see the host document before reusing that environment.

Full-history reverification and a 20,000-record host cap are deliberate spike
limits. They do not establish long-running throughput. S3–S6 still owe source
closure, deterministic interpretation and atomic frontier updates, generic
human/agent interaction, activation boundaries, and complete archive replay.
The existing UI remains the S0 experiment; no new UI flow is claimed here.
