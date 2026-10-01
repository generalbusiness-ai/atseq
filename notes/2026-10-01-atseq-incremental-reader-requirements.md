---
date: 2026-10-01
status: independently accepted with advisory-cursor correction; implementation gates pending
examined_at: 2c7598389f58519af2ed86b8d561f8f9725866b5
request: 3a7f6bb3d6c1c763619b6082558d83056a0ef7b2
promise: 9f591c28f9fb14e0dba2f0e1086aa2d65a54a406
---

# Incremental native reader requirements

Retain an accepted application prefix and P1's verified native blocks. Fetch a
repository revision diff, authenticate one selected root, and verify the exact
application suffix against the retained predecessor. This removes repeated
prefix signature verification without adding a Merkle tree, accumulator or
second block-cache implementation.

This is a bounded P2 implementation proposal. The joint I2/N1 logical direction
was accepted under `91c4241c0174fe6ecfa67f6d891bec6e817af3f9`; N1's corrected
note is at `9224b2074d03f2cf991a87bb7293687ead24e41a`. Final native wire and
authority encoding remain gates. I1's tip-only PLC binding correction is at
`e00cf34ade8c251e75cb2cb024a0e811e9b2a3cc`. PB1's resource-policy proposal is
`notes/2026-10-01-atseq-native-proof-resource-limits.md` at
`9027d2dadde120ff204a33aa1b69e79598f8b349`; its review/implementation must precede
P2's final error handling. No runtime or protocol change is made here.

Independent assessment `f48d15409da9b841892d54362677499c8fb76804` is ratified.
This revision adopts its advisory native revision/root cursor, preserves every
known pair-scoped app floor across selected-root recovery, and requires PB1's
observed-interval-fault precedence. The retained prefix, immutable exact-base
capability, boundary membership check, suffix verification, compact responses and
explicit deferred checkpoint audit remain accepted. Implementation is still open.

## Evidence that narrows the implementation

The landed [P0 baseline](2026-10-01-atseq-performance-baseline-results.md) and
[dimensions report](2026-10-01-atseq-performance-dimensions-results.md) identify
two avoidable warm-read costs. At 10,000 entries, complete-prefix catch-up still
verifies 20,000 signatures and takes about 6.2 seconds even with delta zero.
Already verified interpretation takes about 5 ms for delta zero/one, but still
copies a 2.21 MB projection containing accumulated outcomes. These are old-wire
baseline measurements, not timings of this proposal.

[P1](2026-10-01-atseq-native-proof-results.md) already demonstrates native diffs
over a real 10,000-entry reference repository. One new entry plus a changed head
used a 3,250-byte diff versus a 2,330,500-byte full export. Retained verified
blocks supplied paths absent from the diff, and a full export restored deliberately
missing evidence. Use that existing path rather than inventing an additional
authenticated index. It still needs integrated N1/P2 measurements.

The current [native API](../src/protocol/native-proof.ts) authenticates a root
once and exposes bounded `lookup` and `validateTree` methods. In contrast,
[verifyHistory](../src/protocol/log.ts) requires a complete prefix and the
[host reader](../src/host/sequencer.ts) lists ordinary JSON records. Passing only
new records to that verifier is not an incremental implementation. The
[folder](../src/application/folder.ts) already folds a verified tail, but its
input capability and routine snapshot still contain the complete history.

## Retained state and minimal API boundary

Use the existing reader and verifier ownership boundaries. The logical API is:

```text
readUpdate(pinnedApp, acceptedPrefix, accountContext, readPolicy)
    -> selected repository evidence + verified extension + compact status
```

This is a responsibility boundary, not a new Lexicon or fixed method signature.
The verifier issues an immutable extension capability bound to its exact base,
target head and new entries. A caller cannot manufacture acceptance by supplying
a floor, boolean, cloned object or empty suffix. Cold verification and extension
must share N1's checks; do not create a weaker fast-path verifier.

| Scope                    | Retain and bind                                                                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account DID              | P1 `VerifiedRepoBlocks`, accepted I1 signing-key/PDS binding and evidence policy, selected native root/revision and bounded in-flight fetches.                                            |
| App DID + genesis CID    | Semantic contract, exact verified head/floor, accepted entry CID references needed for history/audit, R0 retry identity and unsigned-CID access paths, consumed I1-descriptor identities. |
| Interpreted app frontier | Coherent state, active source, I2 authority and outcomes at that frontier, plus any verified but uninterpreted tail and stall.                                                            |
| Persistence/restore      | P3's trust/build-provenance rules and coherent commit boundary. A serialized capability is not trusted by its shape.                                                                      |

Repository identity/revision is shared by apps in one account. Each app's chain,
authority, retry index and floor is separate by the full pair. A root selected
while reading app A does not establish app B's head until B's required paths
have been checked. Native root/revision, authenticated advertised head, verified
app head and interpreted frontier are four distinct facts.

Keep the account's native revision/root as an advisory fetch cursor and
contradiction evidence, not an app acceptance floor. A lower revision or equal
revision/different root triggers a full selected-root fetch. Accept its result
only under an I1-accepted binding and after preserving every already known
pair-scoped app floor for that account. Do not lower, erase or silently skip a
known app floor when its records are missing, conflicting or unavailable.
An authentic restored repository with lower revision can resume when those checks
pass; revision alone does not justify rejecting the preserved app history.
A new genesis creates a separate app floor and never erases an older one.
I2's participant admission floors and reviewed appointed-recovery exception remain
separate; this cursor change does not relax them.

Keep the complete derived retry index for the ordering host, as R0 requires.
Stage suffix insertions and consumed-descriptor checks before committing the new
verified head. Do not copy the entire index just to return a read result. P3 owns
durable indexing and recovery; P2 must expose the coherent verification boundary
it persists. Readers starting from a checkpoint must identify accepted prior
retry completeness or explicit deferred audit; this is not independent genesis
verification merely because the suffix is valid.

Routine responses should contain new entries, compact status and requested
receipts/outcomes, not the whole accumulated projection. Integrate the extension
with the folder without retransmitting or cloning every old entry/outcome.
Keep full snapshots/archives explicit and report their O(N) cost. Selective
durable outcome storage belongs to P3; do not add another materialization engine
inside P2 or claim that prefix verification makes state folding O(delta).

## Read and accept one selected root

1. Obtain an accepted app-account binding under I1's policy. PLC binding comes
   from the verifier's selected computed canonical signed tip, not an unsigned
   DID document. Retained/offline evidence has its own stated assurance and does
   not claim currentness. A handle or relay notification is not an authority.
2. Fetch `com.atproto.sync.getRepo` using the account's retained revision as
   `since`, or a full export when no reusable native state exists. Authenticate
   the returned CAR through P1 with expected DID and accepted canonical key.
   The returned commit selects the root; a revision or HTTP response alone does
   not authenticate it. Keep all lookups for this update under that capability.
   On a lower revision or equal-revision/different-root response, recover with a
   full selected-root export, recheck accepted binding and preserve all known
   app floors for the account before accepting it. Native revision is advisory.
3. Authenticate the selected genesis and head using N1's genesis-scoped paths.
   Check the external pin and app/head fields. Reject a head behind the retained
   floor or a different tip at the same position. Never select another genesis
   because the expected paths are unavailable.
4. For the proposed default prefix-reuse policy, check the retained boundary
   entry's current membership/CID when the floor is nonzero. Authenticate the
   deterministic paths for every position after it through the selected head.
   Check target, consecutive positions, predecessor CIDs, canonical decoding,
   actor signatures, required evidence and R0/descriptor duplicates. Final tip
   must equal the selected head. N1 must confirm this boundary-path requirement
   before implementation; it does not audit every older path.
5. Publish the verified extension atomically after its complete required checks.
   Interpretation then applies I2/C0 and folds in order, advancing its own
   coherent frontier. Required interpretation evidence may stall it while the
   verified head remains ahead. Required verification evidence that is missing
   must not advance the verified head past the unchecked entry.

No old actor signatures are checked again merely because the repo root changes.
Do not skip checks of new entries or silently weaken canonical-key/low-S rules.
Use a bounded validated-key import cache within the verifier if justified by the
observed repeated imports; cache only exact canonical keys and their validation
rule, not account authority or signature success by key. Bound any parallel
verification and finish chain/duplicate checks before accepting an extension.
P1 does not promise one hash/decode per shared MST node across all path lookups;
measure actual work rather than asserting O(delta) for the whole read.

## Missing diffs, rotation and stalled interpretation

P1 lookup distinguishes found bytes, authenticated absence and a missing-block
CID. Missing nodes/records after diff fetch or cache eviction require recovery,
not an ineffective action or proof of absence. Fetch a bounded full export.
If it selects the same root, restore required blocks and continue that update.
If it selects a different root, restart validation from the last accepted app floor
under the new capability; never label mixed-root lookups one snapshot. Do not
assume the transport can fetch a historical root on demand. Preserve pinned
receipt/archive evidence separately under its exact root.

Bound attempts and network/body/cache/traversal resources. A stale response or
unavailable diff can trigger full recovery; repeated unchanged resource failures
return unavailable rather than an unbounded retry loop. A failed fetch or update
keeps the last accepted floor and usable coherent projection. Verified block
admission can be retained without accepting an app update; block availability
is separate from app verification. Cache eviction must never erase a trust floor.

Bound the requested delta before enumerating positions or allocating arrays;
safe-integer head syntax does not authorize millions of lookups. An update that
cannot finish its required checks within local limits remains unavailable.
Future chunked acceptance would need a precise distinction between an accepted
partial prefix and the unverified remainder of the advertised head; do not add
that API implicitly in this first implementation.

Key-only commits and unrelated-app/source-record writes can change the native
root without advancing this app. Authenticate the new root and required paths;
return delta zero and unchanged interpreted state. A new I1 PLC tip matters even
when key and PDS are unchanged. Refresh observation evidence accordingly. When
the accepted repo key changes, authenticate the selected publication under the
new binding; do not treat an old key as current merely because it still verifies
a cached root. Retained old roots remain evidence of their accepted snapshot.

Source staging does not activate source. An ordered activation requires its
complete retained closure and app-control checks. Missing/corrupt transport
source stalls at the same entry; restoring exact bytes resumes that entry and
must match healthy replay. Complete available but invalid activation source has
N1/C0's deterministic ineffective outcome. Imported participant identity changes
are ordered I2 operations; routine live resolution does not rewrite historical
authority or retroactively reevaluate old outcomes. Expose identity assurance
separately from replayed state, including the weaker web observation policy.

## State the audit policy precisely

| Policy                                  | Claim and cost                                                                                                                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prefix reuse, proposed normal warm path | Reuse accepted historical work; authenticate current genesis/head/boundary and all suffix paths. Does not establish that every older interior path is still present and unchanged in the current map. |
| Audit current accepted-prefix records   | Also look up each retained old entry path at the selected root and compare its CID. This is O(N) native path work; it need not repeat actor signatures or folds for unchanged bytes.                  |
| Whole native-tree audit                 | P1 `validateTree` checks all MST branches and requires their records. Sparse app-path checks do not make this claim. It can include unrelated apps/content and exceed local policy.                   |

The API and user status must name the policy performed. Do not silently weaken
a requested current-map audit to prefix reuse after a missing path or budget
failure. A later encountered contradiction stops promotion of that update and
retains evidence; an older independently accepted snapshot remains identified
by its old root. Detecting local rollback/forks does not prove global
non-equivocation. Fresh readers cannot detect unseen alternate orderings from
native publication alone, and every Atseq-collection write credential holder
shares the native ordering custody disclosed by N1.

PB1 proposes a host-only transient `native_proof_limit` error. Exceeding local
resources establishes neither invalid history nor absence. An already observed
malformed/signature/chain fault is invalid; a missing block is unavailable;
wrong caller configuration is caller misuse, not a verdict on history. Preserve
those distinctions through host and worker adapters. None becomes a replicated
fold outcome. An authenticated proof of a protocol-required missing record is
invalid selected history; an ordinary transport 404 is not that proof.
The PB1 successor must check observed MST interval faults before reporting a
missing-block or resource-limit result. A fault already exposed by available
bytes cannot be hidden by whichever unavailable child or limit is encountered
first. This does not require guessing faults in unfetched bytes or unbounded
validation beyond the local budget.

## Focused implementation and verification gates

First agree N1's final records and boundary-path policy, I1/I2 evidence checks,
PB1 classification, and P3 restore/index ownership. Then replace full-list
retrieval and complete-prefix issuance in the host reader with the P1 diff path
and verifier extension. Preserve invalidation/generation handling so an old
in-flight read cannot lower a floor established by a confirmed write. Adapt the
worker/folder to consume verified extensions and report compact status. Do not
add a second native cache or a new signature/accumulator format.

| Focused case                                                                                        | Required evidence                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cold versus warm, delta 0/1/100 over 100/1,000/10,000 supported native entries                      | Exact state, source, authority, retries, outcomes and frontiers equal the new-contract cold reference. Count new actor verifications/root authentications, fetched bytes and path work separately. |
| Gap, wrong predecessor, duplicate position/nonce/descriptor, wrong app/genesis and forged signature | Fail closed without accepting a new verified floor or recording a domain denial.                                                                                                                   |
| Lower native revision/equal-revision different root; app rollback, fork and boundary replacement | Full selected-root recovery may accept a preserved app prefix under accepted binding; every known pair-scoped app floor remains strict. Current-prefix audit catches interior mutation; prefix reuse labels its narrower assurance. |
| Partial diff, omitted/evicted block, stale reply and full export selecting a different root | Same-root recovery or bounded restart with advisory native revision; no mixed-root result, fabricated absence or infinite retry. |
| Key-only rotation, PLC tip change with identical binding, source-only and other-app writes          | Correct binding refresh/root proof, unchanged app position and no unnecessary old actor/fold work.                                                                                                 |
| Activation/authority evidence unavailable then repaired                                             | Exact stalled entry resumes; no partial source/authority/state/outcome publication.                                                                                                                |
| Two apps in one account and concurrent appends/in-flight reads                                      | Pair-scoped floors and indexes; repo-wide revision sharing; generation checks prevent stale result publication.                                                                                    |
| Restrictive proof/cache limits, invalid configuration and malicious structure                       | PB1 unavailable versus caller misuse versus invalid proof; observed MST interval faults precede missing/resource reports; identical valid bytes succeed under sufficient authorized bounds. |
| Worker restart, offline retained inputs and corrupt/partial local restore                           | No acceptance of a serialized brand or arbitrary bundled key; P3 restore trust/floor rules and credential-free replay preserved.                                                                   |

Run meaningful conformance in Node, real Chromium and the reference PDS after
implementation. Preserve exact public fixtures, raw counters and source/runtime
hashes. E1 can then measure integrated warm/cold behavior; this proposal sets no
latency threshold and makes no delta-only elapsed-time promise. It ran only source
and retained-report inspection, with no builds, tests or benchmarks. P2 remains
open for reviewed implementation.
