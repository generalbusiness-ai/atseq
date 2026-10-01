---
date: 2026-10-01
status: proposed; independently assessed; prototype validation pending
planned_at: e082fc4edf8d7f49bf49746b13014c51c22a7b3e
category: direction and performance
companion: 2026-10-01-atseq-identity.md
---

# Verification, retained state and rapid bootstrap

Atseq should do work in proportion to what changed for returning readers, and
offer fresh readers clear choices between immediate use and independent replay.
The design should reuse ATproto's repository machinery before adding another
tree, service or proof system. This is a design-space assessment and experiment
plan; none of the proposed paths is implemented.

There are no fixed performance targets. The output is a map of costs, limits and
trust assumptions from which an application can select a suitable configuration.
Prior compatibility is not a goal. A change in authority or semantics needs a
clearly identified new contract, but does not need a migration for spike data.

## Chosen backbone and decision order

Keep an explicitly authorized sequencer separate from the app PDS. Retain local
verified history, retry state and materialized interpretation; extend it from an
exact floor using authenticated entries. Use native repository proofs for account
authority and checkpoint publication. A full native repository mirror is an
optional retention/distribution choice, not a prerequisite for safe catch-up.

First characterize cached key imports, bounded concurrent verification and
suffix delivery. Then measure materialization and bootstrap/index options.
Checkpoint certification defaults to the currently authorized sequencer; owner
governance can appoint a different certifier. Independent replay remains available.
This keeps one authority model while reusing ATproto identity and storage.

Native repository ordering, a full live MST mirror and a lazy index remain
documented alternatives. Revisit them only for the custody, retention or proof
conditions below, rather than implementing every row in the comparison.

## Review and validation status

These notes were independently assessed by `atseq-reviewer` in gitseq reports
`564ea662`, `bd453363`, `6352f14b` and `a71b29a4`. The revisions distinguish
identity observation from state derivation, make compromise recovery account-wide,
and reserve governance/succession/certifier powers for keys already appointed in
the genesis-rooted authority chain. The final review's participation-key boundary
clarification is included here.

The design direction is ready for prototype validation. The experiments below
have not been run; these notes do not establish a finished wire contract or
measured improvement.

## Evidence and current behavior

At 10,000 entries, the final spike measurement takes 7.65 seconds for a complete
PDS read and verification, 7.68 seconds for cold Node replay, 6.24 seconds for
one-entry catch-up from unverified complete input, and 14.33 seconds for browser
replay and result transfer. These are small samples on one machine, not capacity
claims. See [the measurements and raw captures](../docs/host-performance.md).

The fixture has one actor, one definition and bounded small state. It does not
characterize growing state, many actors, definition changes or slow networks.
The current reader/writer limit is 20,000 entries. Experiments beyond it must use
an isolated harness rather than silently changing production limits.

Relevant code, checked at the revision above:

| Location | Behavior |
|---|---|
| `src/protocol/log.ts`, `verifyHistory` | Requires `head.position === records.length`; verifies both signatures per entry and reconstructs the retry index |
| `src/protocol/log.ts`, `RetryIndex` | Remembers each retry identity and original receipt; seals the index after verification |
| `src/host/sequencer.ts`, `readSnapshot` / `SnapshotReader` | Reads all entry records; caches only while repository commit is unchanged |
| `src/application/folder.ts`, `advanceVerified` | Folds only after the interpreted frontier, but receives a complete verified history |
| `src/host/lease.ts`, `src/host/application.ts` | Saves a verified rollback floor; rebuilds application state after restart |
| `lexicons/ai/generalbusiness/atseq/sync.json` | Transfers a complete prefix and source to clients |
| `src/browser/evaluator.ts`, `src/archive/archive.ts` | Retains/replays inputs; does not restore a portable materialized checkpoint |

The current trust boundary is deliberate: `VerifiedHistory` is an in-memory
capability issued by verification. Deserializing a file must not recreate it
without an explicit restore verifier and local-storage trust policy.

## Cost model

Let N be retained entries, Δ newly seen entries, C repository commits processed,
S materialized state bytes, R retry-index bytes, O outcome bytes, B changed
repository/source bytes, and F(i,S) the cost of folding entry i over its state.
These variables are independent: Δ can be zero while a definition or repository
key changes; S can grow even when individual intents remain small.

Full replay costs retrieval of history and source, about 2N entry signature
checks today, encoding/hashing, ΣF(i,S), and copying/transfer. Repeating it after
each append can produce quadratic total verification work. Growing-state folds
or repeated outcome copies can remain quadratic even after cryptographic
verification becomes incremental. No checkpoint removes an expensive fold of
the *next* action over a large state.

Measure stages separately; elapsed replay time divided by N is not a measured
signature cost. Report HTTP requests, bytes, signature counts/time, hash/CBOR/MST
time, CryptoKey import counts, verification concurrency, fold time,
copying/worker transfer, peak memory and durable storage.

`proof()` calls `key()` for every signature; that imports and re-exports the
public key before verification. `verifyHistory()` verifies entries serially.
Compare a bounded cache of validated imported keys and bounded parallel checks
first. Preserve canonical-key/low-S checks and deterministic ordered chain/retry
validation after the checks finish; do not cache successful signatures by key
or accept a partially checked prefix. Bound cache and concurrent work for hostile
many-key inputs. These are cost hypotheses until measured.

## Invariants

1. Pin app DID, genesis CID and semantic contract. Repo revision, verified app
   head and interpreted frontier are three different cursors.
2. Extend an exact known `(position, entry CID)`; reject rollback, gaps and forks.
   A source or runtime stall can leave interpretation behind verified history.
3. Exact retries return the original receipt. Reusing the identity with different
   content conflicts, including when old history is represented by an index.
4. Every committed interpretation step has coherent state, active definition,
   authority state and outcome. Resume a stall at the same entry.
5. A hash/signature authenticates a checkpoint claim. It does not prove the
   checkpoint was derived by the fold.
6. Replay uses retained inputs, including identity evidence, and never depends
   on a live resolver. Freshness of admission is a separately recorded policy.
7. A checkpoint restore never silently changes assurance from trusted claim to
   independently replayed result.

## Delivery alternatives

ATproto repositories are signed mutable maps backed by a Merkle Search Tree
(MST). Native CAR exports, record proofs and authenticated transitions provide
storage evidence. They do not establish application execution or an append-only
history on their own. The app chain supplies order. See the
[repository](https://atproto.com/specs/repository) and
[sync](https://atproto.com/specs/sync) specifications.

| Reader circumstance | Candidate | Main cost / limitation |
|---|---|---|
| First independent open | Full CAR, retained source, history verification and fold | O(N) history work; complete audit |
| Returning reader with retained app history | Chain-verified record suffix | Δ verification/folds; old repository mutations are not checked |
| Intermittent reader with verified repository cache | `getRepo(since=rev)`, authenticate reachable MST and compare roots | Changed blocks/paths plus Δ; recovery if blocks are missing |
| Continuous host or observer | Validated `subscribeRepos` diffs | Changed data per commit; stream gaps and backfill |
| Restart with local materialization | Restore trusted local state, then delta sync | Load S+R and needed indexes, then changed work |
| Fresh reader accepting a certifier | Portable checkpoint plus authenticated tail | State/evidence and required index proofs; historical derivation is trusted |
| Fresh reader also auditing | Same early-use path plus background full replay | Early readiness can be small; eventual audit still reads/folds history |

For a small suffix, reading the selected head followed by bounded parallel
`getRecord` calls for known position keys avoids cursor dependence. Verify every
selected entry and its link to the local boundary. Treat entries as immutable
by the application contract, not by PDS enforcement: missing/replaced records
fail verification or trigger recovery. A newer head during retrieval need not
invalidate a complete valid suffix to the already selected head.
The selected head must be at or above the retained floor; do not select backwards.

Do not invent a position cursor without testing the endpoint. Our position keys
are zero-padded decimal numbers. The official PDS's `reverse:false` lists them
descending; `reverse:true` lists ascending. Cursor semantics are not specified
as an arbitrary starting record key by the Lexicon. A descending tail read can
use only returned cursors and stop after the complete selected suffix. Check
positions, predecessor, exact boundary and selected head, not just page order.
See the [official record reader](https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/actor-store/record/reader.ts).

A retained chain plus suffix can still succeed after an old record was deleted
from the PDS. Current full reads reject that situation. Decide explicitly
whether retained local history is sufficient, or current repository retention
must also be checked. Native tree comparison can enforce the latter.

For `getRepo(since)`, the revision is a transport hint. Merge the returned blocks
with verified retained blocks, validate the signed root and required reachable
nodes, then compare old/new trees, skipping identical subtrees. Missing required
blocks trigger full export recovery. A partial cache needs proof support for
the paths it checks; it cannot claim complete mutation detection merely because
the commit signature is valid. See the
[endpoint](https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/sync/getRepo.json)
and [reader implementation](https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/actor-store/repo/sql-repo-reader.ts).

For live diffs, verify transition completeness by native operation inversion or
an actual authenticated tree diff. Track stream cursor separately from repo
root/revision. Gaps, resets and incomplete slices require backfill. An identity
event is a resolver invalidation hint, not evidence of the new signing key.
Neither polling nor streaming proves global freshness or excludes all signer
equivocation. Retained floors and comparison with other observers can detect
conflicts encountered locally; global agreement is a separate trust question.

## A larger simplification worth testing

Compare the existing two-signature entry with an actor-signed intent ordered
under the app account's native signed repository root. In the second candidate,
the root authenticates the selected genesis, head and entry membership; the
hash chain still establishes order. A latest root can cover old entries without
checking an old repository signature for each entry.

This is a proposed authority change: the app PDS holding the repository signing
key can construct another ordering. Today it needs the separately pinned
sequencer key. Genesis must explicitly name the new authority model; leaving
`sequencerKey` present but ignoring it is unacceptable. App-account ownership,
PDS custody, ordered governance and archive trust must be defined with the
identity plan.

For N entries under one latest root, signature counts could fall from 2N to N+1.
For C warm commits containing Δ intents, they become Δ+C; one commit per intent
still has two signature checks. Native mirroring while keeping both entry
signatures costs 2Δ+C. These counts are hypotheses about the designs, not speed
measurements. MST and identity verification also cost work.

Sparse receipts in the native-authority candidate need entry membership,
signed-root and identity evidence, possibly shared across a session. An entry
receipt establishes ordering, not effectiveness. An old archived root needs a
retained trusted identity/key epoch or later membership evidence after key
rotation. Native authority should not be adopted solely for an assumed speedup.

Keep separate sequencer custody as the default. Revisit native ordering if PDS
custody is deliberately acceptable and cold audit/proof distribution dominates,
or separate key operations are a demonstrated adoption obstacle. It is not a
necessary optimization for returning clients.

## Checkpoint contents and trust

A local materialization needs the exact app/genesis/profile, verified head,
interpreted frontier, state, active definition and required source, authority
state, sealed retry state, outcome storage/index, stalled entry and reason,
pending verified tail, and highest observed floor. Commit these coherently.
Bind a local cache to interpreter build/dependency provenance as well as semantic
CIDs; invalidate and rederive it after a corrected or changed build. Corruption,
partial writes or mismatched bindings require recovery, not silent acceptance.
Use the packaged `dist/build-provenance.json` as the existing provenance input;
also bind the actual installed interpreter/dependency integrity checks, not an
unchecked copied metadata file.
Specifically, bind successful Node `verifyInstalledDependencies` checks and the
distribution build-provenance hash. Browser caches bind the trusted installed
bundle/build identity; the browser integrity adapter is not a filesystem audit.

A portable checkpoint can be an ordinary app repository record naming
content-addressed payload blobs, frontier, state/definition/authority CIDs,
verified head, retry/outcome index commitments, retained evidence and certifier
policy. This is a conceptual shape, not a Lexicon proposal yet. Use a verified
publication proof; do not require a new Merkle structure merely to hash payloads.

Authenticate the certifier from pinned genesis/previously accepted governance,
retained succession evidence or an explicit reader-selected trust anchor. The
checkpoint's own claimed authority state cannot authorize its signer. Bind the
certification to exact app/genesis, contract, head/frontier and all payload/index
commitments; reject substitution and preserve a newer local floor.
The identity note's self-standing governance/succession certificate chain supplies
the default certifier bootstrap; its size follows authority changes, not acts.

| Starting trust | Meaning of rapid restore |
|---|---|
| Local state previously derived by this trusted build | Reuse prior verified work under the local-storage assumption |
| App authority or designated attestor | Accept its assertion about the materialized prefix |
| Several attestors | Accept the stated quorum and independence assumptions; not a proof of execution |
| Independent replay | Verify the prefix and fold; no shortcut to arbitrary computation is supplied |

A reader may use an accepted checkpoint while auditing in the background. On
mismatch, stop promoting dependent results, retain conflicting evidence and
recover from a replayed prefix or require operator choice. If it submitted acts
based on the claimed state, later audit cannot retract their already recorded
effects. Applications requiring independent derivation must wait for replay
before decisions that depend on it. Readiness and audit completion are separate
measurements and user-visible assurance states.

Use shared vocabulary but separate assurance dimensions: state can be
`replayed`, `certified by X at p; audit pending`, or `audit failed at p`; account
attribution can remain `observed by sequencer under policy Y` even after full
state replay. Replaying a recorded observation does not prove historical identity
currentness. One status panel can display both without suggesting they are equal.

## The index problem

A small state does not imply a small checkpoint. The retry map and full outcomes
grow with N. Copying them wholesale can defeat rapid bootstrap. Returning hosts
can maintain local indexed storage; clients need only their own receipt/outcome
queries until they audit more history.

Fresh verification of future nonce uniqueness still needs authority over the
old retry set. Compare loading the full map, trusting sequencing during deferred
audit, and a lazy authenticated index. For the latter, test ordinary app repo
records keyed by a digest of the full retry tuple, with the tuple and original
receipt in the value; use native membership/nonmembership evidence. Insert an
entry, retry record and head atomically. A digest collision or tuple mismatch
must fail. A checkpoint certification covers index completeness; an authentic
index root alone does not prove that it contains every historical retry.

Every lazy lookup must prove membership/absence at the exact certified index
root or at a successor reached through completely verified index transitions.
`com.atproto.sync.getRecord` selects the current repository root, not an arbitrary
past root. A later authentic proof cannot be substituted for checkpoint evidence.
Retain the required old native MST/record blocks in an archive or proof-serving
cache, or advance the certified root with validated changes before querying.
Reuse native CAR/path proofs, but test their actual retrieval/retention cost.
Missing historical proof blocks require recovery or an explicit stall. This may
make full-index loading or deferred audit simpler than the lazy alternative.

Likewise, immutable outcome pages or indexed records can support selective
reads. Authentication shows what was asserted, not correct interpretation.
Only replay or the chosen checkpoint authority establishes the latter.
Full historical outcomes need not be loaded into a state checkpoint; retain
them for selective receipts and recompute them during audit.

A semantic alternative is a monotonic counter per signing identity, whose last
accepted number lets a fresh reader reject duplicates with one high-water mark
per retained signer. Compare strictly consecutive counters with increasing
counters that allow gaps. Neither is automatically equivalent to random nonces:
concurrent copies of a key can allocate the same number; cancelled drafts can
leave gaps; reordering can strand old unrecorded work. A mark alone cannot check
the content of an arbitrary old retry. Retrieve its authenticated original
receipt/history before returning it or diagnosing a conflicting retry; missing
evidence is unavailable, not proof of a match. The host receipt index remains
O(N) storage, even if the bootstrap duplicate-prevention state is O(signers).
Count retired/rotated signers and grant tombstones too; many one-use keys may
erase the size benefit. This counter experiment is higher priority than a lazy
tree because it may simplify the semantic contract itself.

Consider another accumulator only if compact historical audit proofs have a
demonstrated need that the repository MST cannot meet. A cryptographic execution
proof system would require a different runtime/proof model and considerable
complexity; there is no current evidence justifying it.

## Recommendation and experiments

The leading architecture is retained local fold/history state with entry suffix
verification and a shared native proof verifier for identity/publication. Native
repo mirrors are available when current retention/distribution needs justify
them. Portable checkpoints add a stated starting authority and preserve audit.
The separate sequencer remains the custody default. These are chosen invariants
and ranked experiments, not backward-compatibility phases.

Run the following experiments in isolated worktrees, tracked by gitseq:

1. Instrument the existing baseline without changing its semantics. Use
   `scripts/performance.ts` and `scripts/browser-performance.ts`; keep the machine
   idle and save hardware, runtimes, exact head, raw samples and fixture hashes.
   First compare unchanged verification with key-import caching and bounded
   parallel checks; record concurrency and many-actor behavior.
2. Compare full listing with keyed and paged record suffixes
   at N=100/1,000/10,000 and Δ=0/1/100/1,000 where valid. Add larger N only in a
   separately bounded harness. Vary actors, bounded/growing state, activations,
   missing/invalid source, no-entry repo commits and slow/disconnected networks.
3. For every valid case, require delta/cache interpretation, retry receipts,
   outcomes and stalls to equal full replay byte for byte. Report old-record
   deletion/rewrite detection separately for chain-only and native readers.
4. Exercise truncated CARs, omitted operations, fork/rollback, stale replies,
   concurrent appends, lost write confirmation, cache corruption, build change,
   key rotation and restart at each persistence boundary. Native CAR/diff fault
   cases apply only if that deferred mirror path is subsequently prototyped.
5. Compare random nonce sets with signer counters and full-index/deferred-audit
   checkpoints, measuring early
   readiness, audit completion, payload/storage size, missing proofs and a
   certifier lying about state, authority or retry completeness. Include counter
   gaps, cancellation, cloned keys, reordering and old retry content conflicts.
   Prototype a lazy index only if the preceding choices are insufficient. Race a lazy
   lookup against an append, delete/rewrite an old retry record, and make old
   checkpoint proof blocks unavailable; never accept evidence at the wrong root.
6. If the custody/adoption condition above arises, compare separate entry
   signatures with native app ordering, cold and warm,
   batched and single-action commits. Demonstrate the differing PDS compromise
   and archive/key-rotation behavior, not just timings.

An executor should first run the following and recheck evidence if it changed:

```sh
git diff --stat e082fc4e..HEAD -- src scripts tests lexicons docs
```

Read the full companion plan. Reuse maintained libraries from [ATproto](https://github.com/bluesky-social/atproto)
and [atcute](https://github.com/mary-ext/atcute); evaluate browser portability and
dependency size before selecting a validator. Do not write a new MST, resolver
or proof format when an existing conforming implementation suffices.

Baseline commands from this repository: `npm run check`, `npm test`,
`node scripts/source-run.mjs scripts/performance.ts`, and
`node scripts/source-run.mjs scripts/browser-performance.ts`. The first two must
remain green for a prototype; the benchmark commands produce raw captures, not
pass/fail latency gates. Use `tests/protocol.test.ts`, `tests/pds.test.ts` and
`tests/projection.test.ts` as the existing correctness patterns.

The investigation is done when reproducible captures separate costs, every
valid equivalence case agrees, hostile cases fail with the documented guarantee,
and the comparison states which reader circumstances favor each option. Do not
implement all variants or choose a default from a single timing. If a proposed
shortcut changes authority, freshness or retention guarantees, record that
change and obtain an independent design review before calling it an optimization.
Stop after the leading-path matrix is reproducible and its remaining costs are
attributed; expand only for an unresolved decision or unexplained effect. No
requirement says full replay must become fold-dominated: small constant-state
folds may legitimately cost less than cryptographic verification.
