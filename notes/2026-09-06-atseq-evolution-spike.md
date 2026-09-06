---
date: 2026-09-06
status: S5 evolution gate passes; awaiting independent review
companion: notes/2026-09-06-atseq-initial-spike.md
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
---

# Atseq evolution spike

S5 changes a running app through its own log. A retained definition adds a new
action, query and view while preserving the complete state schema and existing
data. An explicitly granted key signs the activation, which takes effect at one
recorded boundary. The next entry uses the new definition. See the
[evolution contract](../docs/evolution.md) for reproduction and limits.

S4 was independently approved at `b765e6bd7902c0042baf1c6ec98c9a85e6d02215`
and landed at `6477b73f3be27880fd592f7015b4c7dcb1eda74a`. S5 extends that host,
worker, shell and JSON adapter under the adopted implementation plan. GitSeq
continues to track repository work only; it is not a runtime dependency.

## Boundary and review behavior

Activation is a reserved Lexicon control action carried by the existing signed
intent and entry contracts. It cannot be rebound by a domain definition. The
folder checks the fixed genesis grant and expected current definition before
loading a candidate's signed source closure. Exact reachable state-schema and
runtime equality establish this deliberately narrow compatibility rule.

State and active definition persist together. Missing or corrupt content pauses
interpretation; repair resumes the same position. A malformed or available
invalid candidate has an ineffective outcome. A racing activation from an old
definition is retained as `definition_changed`. These decisions are reproduced
by full replay, including after a real host restart against the same PDS.

Sketch D is implemented as Import updated definition CAR, a local comparison
with interface and replay checks, and explicit Apply. The comparison creates no
signature or PDS write. Apply stages source, then signs and queues the activation.
Only the granted key can apply; there is no implicit creator authority or key
switch in the worker. CLI compare, stage, prepare and activate use the same
public contracts and preserve immutable intent files.

The browser retains an old offline action byte for byte. After another client
activates, reconnect delivers that old action exactly once and reports its
ineffective outcome. Review with updated form preserves values; only Save signs
a replacement with a new nonce and current definition. Both entries remain in
history. Two offline actions also preserve device order, so adding a candidate
then selecting it works when replayed. IndexedDB admission and sequence assignment
are one transaction; at most 100 waiting actions per app are admitted.

## Evidence

`npm run test:flows -- --group evolution` reports 27 passes: twelve core scenarios,
thirteen real-PDS browser/CLI scenarios, and their two parent tests. The combined
S0–S5 suite reports 269 passes with no failures or skips. Evidence is retained in
[evolution-runtime.json](../experiments/evolution-runtime.json) and
[evolution.json](../experiments/evolution.json), with case timings, versions and
tested source hashes. Screenshots in [evidence/s5](../experiments/evidence/s5/)
show the updated app and reviewed stale action. Reruns write generated evidence;
a partial gate cannot report completion.

The S4 participation followups now perform an actual local sample action, block
sync during cached-input reload, check the pending preview's value, and use a
real deliberate Save as a positive signing-counter control before hostile
rendering. A full concurrent suite exposed a test that reloaded before its
identity write finished; it now waits for the visible saved identity.
The transport path preserves verified terminal outcomes and does not repeatedly
submit recorded actions. Malformed query JSON is a client-input refusal.

## What remains

S5 pins the new `atseq-folder-activation-v0` application profile. The S0 engine
CID and S1 independent vectors remain unchanged. Earlier apps require their
original S3/S4 installed application runtime. This is explicit versioning,
not a silent upgrade of existing applications. Within an S5 app, activation
preserves the same pinned runtime.

This slice does not migrate state schemas, change grants, delegate keys or
provide unbounded evolution. Candidate/source-pool bounds and complete-prefix
verification remain explicit. S6 must measure histories through 10,000 entries,
refresh retained evidence, export complete verified archives, rebuild offline,
produce a chart export, and exercise the adapter with an additional independently
authored purpose-specific app. The final proceed/revise/stop decision belongs to
that measured acceptance run and independent review.

## Independent review corrections

The first S5 review at `757c76f54746d3ab1577a9d08819069525077fab` found that a
manifest dependency omitted from the signed closure could produce different
outcomes on the full PDS reader and a client's closure-only reader. Activation
now freezes the signed blocks and loads exclusively from that isolated bundle.
An available incomplete or extra closure is deterministically invalid on both
readers, including when followed by another entry. Missing or corrupt bytes
actually named by the signed closure still pause for repair.

The same boundary converts available view-loader failures, including Inlay's
missing binding error in a query-less view, to invalid activation. Two focused
regressions cover these review findings. The application runtime descriptor
pins the corrected source; the engine identity remains unchanged. CLI compare
and stage now accept the documented `expected` field, with `definition` as an
alias. S4 host and participation evidence is refreshed at this corrected source.
The subsequent review at `b070ffbffd814ab9cea091b222ddeee77f46be99` confirmed
those fixes and found that sync omitted an available signed closure larger than
512 KiB. Sync now transports that evidence under its separate 16 MiB budget;
the unchanged definition bound rejects it during replay on both host and client.
Two additional regressions mix two valid 300 KiB staged definitions, assert full
projection equality, and continue through a subsequent ordinary action using
the CLI and a fresh browser. That real transport exposed an argument-stack
limit in the hand-written base64 encoder; the existing `@atcute/cbor` encoder
now supplies the same unpadded bytes representation without spreading a large
buffer into function arguments. Independent S1 vectors remain unchanged.
The dead post-load closure comparison is removed,
the CLI gate uses `expected`, and the broad exception-classification trade-off
and current restore behavior are explicit in the contract. Retained S1–S5 reports
and S3–S5 source examples and screenshots are refreshed for this candidate.
The original S0 feasibility report remains stage-local evidence; S6 refreshes
the complete series.
