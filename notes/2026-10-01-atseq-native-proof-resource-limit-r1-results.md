---
date: 2026-10-01
status: PB1-R1 corrected candidate; independent exact-head review pending
category: native proof evidence
request: d22a606dcd584df143acda4523c2dcae0e03b1bc
validated_source_head: f95622cd5ed2c92c9301a49681aeceefccbb1ac2
predecessor_candidate: 83a787017812b6ea1c7415ab13b1fade16a81e0c
base_main: 2c759838
---

# Preserve observed interval faults before reporting missing or limited evidence

PB1-R1 restores the distinction between an observed invalid tree and an
unfinished proof. If a walked node lies outside its inherited key interval,
lookup and full-tree validation now report invalid input even when the next
child is withheld or a node-load budget stops the walk. A secondary depth
policy does not overwrite the original failure.

Independent assessment `ea227dc086432172ac781955dea09376694fdb13` found the
regression in predecessor `83a78701`. Removing the whole failed-walk range
check had also removed its structural interval checks. The reader could report
missing evidence after it had already walked an out-of-interval node. This was
a classification defect: it could stall on an invalid tree, though it did not
produce false membership or acceptance. The
[previous report](2026-10-01-atseq-native-proof-resource-limit-results.md) is
marked as a rejected predecessor, and all its raw captures remain unchanged.

## Correction

`src/protocol/native-proof.ts` now separates the structural interval check
from the depth policy. Successful walk checkpoints check intervals first,
then depth. Failed walks use the following precedence:

| Original failure | Failed-walk behavior |
|---|---|
| Missing block | Check already walked intervals; throw input if they violate their range, otherwise return missing |
| `native_proof_limit` | Check already walked intervals; throw input if they violate their range, otherwise preserve the resource error |
| Existing input error | Preserve the original input error without another cleanup inspection |
| Genuine runtime fault | Preserve its original identity without another cleanup inspection |

Failed-walk cleanup never executes the depth guard. The pinned native adapter
also preserves an existing `ProtocolError(input)` object instead of replacing
it. Other malformed pinned-reader failures retain their established input
classification.

The host-only `native_proof_limit` code, HTTP mapping, protocol-before-policy
checks, cache bounds and native framing wrapper are otherwise unchanged.
The [adopted decision](2026-10-01-atseq-native-proof-resource-limits.md) records
this structural-before-availability clarification. No profile, wire,
dependency, manifest, consumer or workroom implementation was added.

## Signed regression and results

The new shared corpus cases construct a real signed three-level tree:

- The height-two root has key k2 and a left child X.
- X has a locally valid height-one key k1 greater than k2. Its inherited
  interval ends at k2, so this placement is structurally invalid.
- X points left to a height-zero leaf with key k0 below k1 and k2. That leaf
  is withheld from the CAR.

Both `lookup(k0)` and `validateTree()` now throw `ProtocolError(input)`.
A second case permits loading only the root and X: the next node load exhausts
policy before reading the withheld leaf. Both operations still throw input
because the walked interval violation is already established.

Before changing production code, the newly added signed regression failed
against predecessor production bytes. The retained red log reports
"walked interval fault lookup accepted": this is the test helper's wording
for failure to throw the required input error, not a membership claim.
After the correction, the focused suite passed 16/16 tests, including real
Chromium execution. Existing controls still show that a depth-only cleanup
failure cannot replace missing evidence or the original resource, input or
runtime error; input and runtime identities are explicitly checked.

The full validation ran on clean source revision
`f95622cd5ed2c92c9301a49681aeceefccbb1ac2`:

- `npm test`: 360/360 passed, zero failures, cancellations or skips.
- The same 51 named native cases passed in Node v26.10.0 and real Chromium;
  the retained case lists were compared and are identical. Several cases
  perform multiple operations and assertions.
- Chromium also verified the shared Node-produced p256 and secp256k1 signing
  fixtures. Its executed test bundle was 445,627 bytes, including the corpus.
- `npm run check` and `npm run build` passed. Host HTTP status/permanence,
  independent profile CID vectors, all resource limits, hostile signature and
  canonicality checks, cache behavior, missing evidence and proven absence
  remain covered by the full suite.

## Immutable evidence and scope

Successor captures are separate from the predecessor directory:

| File under `experiments/post-spike-evidence/2026-10-01/native-proof-limits-r1/` | SHA-256 |
|---|---|
| `validation.json` | `60aa8a4ed00dd1acc18a37e40fea03f1a36fe185951780acd9779a77b7cfc58f` |
| `full-test.txt` | `0d629e5912327c56ae100bbfaf004fc6a64b9fbeff8d782614bdd9767deec406` |
| `browser.json` | `3e46de989392fec2f379b043c58f670cb498049d9225e89ffb464416d1ea9ec2` |
| `node.json` | `841955abb10aee39afcf9d86bfac730cd4a19a95881c84e60c9c76edb1c45bfb` |
| `regression-red.txt` | `f7626fb8eda3a7f7b50d485681d77b15b1814585f410a4e1dd4e4d5c01722f79` |

[The successor validation metadata](../experiments/post-spike-evidence/2026-10-01/native-proof-limits-r1/validation.json)
records exact source hashes, commands, runtime/platform, predecessor candidate,
review, the red-regression context, and hashes for `build.txt` and `check.txt`.
The predecessor validation SHA remains
`6136b774b83072f3cb9257a7c015d7eb2b06e47b0b8033aace7bfc2a62031aa7`;
every raw predecessor file was checked against its original hash. Literal
console captures retain Vite's trailing whitespace without rewriting evidence.

This correction changes only `src/protocol/native-proof.ts`, the shared native
corpus and dated notes/evidence. Core code-table, host HTTP tests and profile
tests retain their preceding PB1 implementation. Manifests, locks, approvals,
semantic descriptors and identity vectors have no diff from base `2c759838`.
The branch remains based there as requested.

P2 and I1 must treat an observed structural fault as invalid, while a resource
limit with structurally consistent observed data remains unavailable under
local policy. Missing evidence and authenticated absence remain distinct.
Neither a budget exhaustion nor withheld evidence may lower assurance or
advance the frontier. Consumer and browser messaging work remains separate.
