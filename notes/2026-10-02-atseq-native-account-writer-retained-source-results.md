# Native account writer retained-source delivery correction

Date: 2026-10-02

This source-only successor makes the account-writer evidence verifiable from a clean Git checkout. It tracks 17 maintained dependency source excerpts that were present locally and listed in the original manifest but ignored by Git because their retained paths contain `node_modules`.

The work remains under AW-F2 request `b8d9ec1eab341d9fd412d527b001917404d82d33` and producer promise `3baf258ad443641e4d1323c27c8fa4721ad4030c`. Root assigned the delivery correction in effective statement `695bcbd8a36c52dc04d525b899525eb4ad5b5040`. The immutable predecessor is `ea30f527fe33c30f012cd5c4e3f76736819cd333`, against programme base `5006a5c6489ce348944a85d158dfe89fd979099c`. The original production runtime evidence remains bound to source producer `16f36988179a0ccacf1189eeb7b2b0e3453d6836`.

## What was missing

The predecessor had 394 changed Git paths. Its local manifest listed 392 files, but only 375 of those were in its Git tree. The remaining 17 were ignored maintained-source excerpts. The 394-path Git delivery also contained 19 changed paths outside the local manifest: 16 production/test files, the mint-scope question note, the manifest itself and its verification log.

The old manifest was therefore a local evidence manifest, not a complete candidate inventory. It remains unchanged. The additive [delivery inventory](../experiments/post-spike-evidence/2026-10-02/native-account-writer-retained-source-aw-f2/delivery-inventory.json) includes every original changed Git path, every newly tracked excerpt and every additive correction path. It explicitly distinguishes these three groups and lists the 19 original paths outside the old manifest.

## Exact retained source

The 17 excerpts cover the maintained OAuth client/session/server-agent sources and package metadata, the original compiler and browser-wrapper tool metadata/source, and the reference PDS upload/blob code and SQLite package metadata. They total 162,905 bytes. Each was copied byte-for-byte from its original retained location and checked against both the recorded physical-runtime pin and the actual original physical dependency file before copying. The [provenance record](../experiments/post-spike-evidence/2026-10-02/native-account-writer-retained-source-aw-f2/retained-source-provenance.json) records each physical path, retained path, byte count, SHA-256 and Git blob.

Only these 17 exact ignored evidence paths were force-added. No dependency was installed and no ignore policy, production code, test, executable helper, package metadata, public export or runtime limit changed. The original worktree, its ignored files, manifest, physical-runtime pins, reports and captures remain untouched.

The clean-checkout verifier compares retained Git bytes with the already recorded physical-to-retained pins. It does not require an installed dependency tree or access to the original worktree. The recorded original physical equality is a retained observation; it is not a claim that this clean checkout has the SDK or PDS installed.

## Clean-checkout results

A fresh detached checkout at `ea30f527` had no installed dependencies and none of the 17 ignored excerpts. Its original `verify-results.py` failed with `FileNotFoundError`, exit 1. The [raw initial failure](../experiments/post-spike-evidence/2026-10-02/native-account-writer-retained-source-aw-f2/initial-clean-checkout.log) and runtime/source attribution are retained.

After tracking the excerpts, both the unchanged original verifier and the new read-only inventory verifier passed from a fresh detached checkout without copying ignored files or installing dependencies. The checkout remained clean. Exact source commits, commands, timestamps, Python/Git binary hashes and verifier hashes are recorded in [clean-checkout results](../experiments/post-spike-evidence/2026-10-02/native-account-writer-retained-source-aw-f2/clean-checkout-results.json). The final frozen candidate is also checked from another clean checkout; its external ready inventory records that exact-head backstop.

The new verifier checks all 394 original Git blobs, all 392 original local manifest hashes, all 17 newly tracked excerpt blobs and their physical pin mapping, unchanged source-producer attribution, and the complete current delivery inventory. The original verifier also checks its existing retained build, wrapper, vector and runtime-capture predicates. These are read-only evidence checks. No new Node, browser, SQLite, PDS, provider or production runtime experiment was executed for this correction.

## Inventory closure and reproduction

A content inventory cannot contain its own byte hash. Three generated clean-verification records also describe checks against that inventory. These four paths are explicitly marked as self-referential records whose exact bytes are closed by the frozen Git tree and the external ready inventory. All other delivery entries carry their byte counts and SHA-256. The checker requires every inventory path to match `git show HEAD:path`, including the four self-referential paths, and requires the path set to equal the entire diff from the programme base. This prevents a local ignored tree from supplying untracked evidence.

Run the two read-only checks from a checkout with no dependency installation:

```sh
python3 experiments/post-spike-evidence/2026-10-02/native-account-writer-aw-f2/verify-results.py
python3 experiments/post-spike-evidence/2026-10-02/native-account-writer-retained-source-aw-f2/check.py
```

The [clean-checkout driver](../experiments/post-spike-evidence/2026-10-02/native-account-writer-retained-source-aw-f2/verify-clean.py) creates a new detached shared clone, verifies no installed dependencies are present, runs both commands and records their exact attribution. Its arguments are a new clone path, an exact Git ref and an output directory. It does not modify the checked checkout.

## Recommendation and remaining work

Use this complete successor for independent exact-head review and publication. Retain the predecessor as evidence of the delivery defect. The original account-writer runtime results and limitations remain exactly as reported; adding their referenced source bytes does not strengthen their trust or provider claims.

Full AW, A1, A2 and P3-F3 remain open. This correction does not implement the publisher, close public-provider or provisioning work, or substitute for their independent review. Root owns publication, independent `atseq-reviewer` review, governed merge and push.
