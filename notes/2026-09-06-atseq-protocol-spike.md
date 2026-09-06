---
date: 2026-09-06
status: S1 implemented; gate passes; awaiting independent review
companion: notes/2026-09-06-atseq-initial-spike.md
rests_on:
  - git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:73bcf31fb42c5509ffd07714d6b361a8bf9659a0
---

# Atseq protocol spike

S1 defines and implements the local v0 protocol: canonical atproto CBOR and
CIDs, a pinned genesis, P-256 actor and sequencer proofs, explicit order, and
content-based retry identity. The [protocol contract](../docs/protocol.md)
links the authored framework Lexicons. The existing S0 runtime source now has
a content-addressed descriptor; no runtime behavior changed in this stage.

## Measured result

`npm run check`, `npm test`, and `npm run test:protocol` pass. The combined test
run has 150 passing tests: the existing S0 corpus and the new protocol corpus.
The protocol gate runs 73 fixtures identically in Node 26.8.1 and Chromium
153.0.8010.12. [Raw retained results](../experiments/protocol.json) include
source hashes. A rerun writes `experiments/generated/protocol-results.json`.

The fixtures verify independently encoded CBOR/CID blocks and independently
signed actor and sequencer proofs. Two distinct valid actor signatures over
one intent return the same content identity and original receipt. Changing
app, genesis, definition, payload, nonce, action, actor key or domain fails.
High-S and damaged signatures fail. Malformed, duplicate-key, unordered,
trailing, float, invalid-Unicode and oversized wire inputs fail. History
verification checks missing, duplicate and skipped positions, altered
predecessors, chosen-head mismatch and duplicate/conflicting retry content.
All framework method schemas load and validate through Lexicon itself.

The vector writer uses `@ipld/dag-cbor` 7.0.3, `multiformats` 9.9.0 and Node's
OpenSSL signing interface. It imports no Atseq or atcute code and uses explicitly
public test keys. Expected bytes and signatures are retained, never generated
by the implementation under test. The live signing path is also exercised in both hosts.

## Boundaries for the next stage

The functions prove and construct records; they do not persist them. S2 must
provision a real disposable PDS, retain chosen anchors, lock the single writer,
reconcile the head and retry index, and atomically append entry/head with
`applyWrites` and `swapCommit`. It must establish lost-response and crash
recovery with the real service. These tests make no claim about that behavior.

The framework method names are local `test.atseq` Lexicons, not a production
namespace. Method behavior and the source import/retention format remain S2–S4
work. Source closure, interpretation/frontier atomics, activation and outbox
behavior retain the adopted plan. No S2–S6 gate is reported as implemented.

The S0 reviewer approved and landed the corrected baseline before this S1
candidate was published. Their nonblocking observations about container-heavy
work and repeated full-state references should inform S3's realistic fixtures.
The separate plan-review recommendations remain unadopted.
