---
date: 2026-10-02
status: source-only candidate; independent review pending; full A2 open
baseline: 0df4aa12126d9ea2dd01332a0a6f99d389eebb32
request: f999b4a17086f87a0d5f65a4d0bcec2a09f8d994
promise: 916b84edba91a081576209c591a822879200be30
parent-request: 110166f98b30a4ae5de2684d011e2252c97102f7
---

# Application provisioning: source results and recommendation

The [design candidate](2026-10-02-atseq-app-provisioning-boundary.md) recommends
one account-writer interface over existing PDS operations and A1 credential
custody. Existing accounts need no new domain. New PLC setup verifies actual
independent recovery-key priority; hostname web setup includes a real imported
account, destination key installation, activation and OAuth, rather than only
publishing a DID document. Account recovery must preserve accepted app history,
governance and newer local floors. Keep WebVH conditional and outside baseline.

This work inspected source and prepared a decision packet. It did not implement,
configure, deploy, create or recover an account. It does not complete A2 or claim
provider interoperability. Independent `atseq-reviewer` assessment and explicit
workroom adoption still gate the proposed interface and operational procedure.

## Actual inspection

| Material | Actual result |
| --- | --- |
| Workroom requests | Read exact A2-D1 request `f999b4a1` and full A2 parent `110166f9`; kept source-only scope and A1/I2 dependency gates. |
| Approved project sources | Inspected 22 exact Git blobs at approved main `0df4aa12`, including existing provisioning/transport, loopback/private storage, native wire/I2 and adopted identity/authority/enrollment notes. |
| A1 candidate | Inspected three exact OAuth source blobs at `022404f5`. These are an unreviewed implementation dependency, not approved current main functionality. No mutable worktree content was used for pins. |
| Official source | Retained 18 public files, 94,909 bytes, from exact ATproto, PDS distribution and PLC repository commits. Hashes, paths, upstream URLs and retrieval date are in the inspection manifest. |
| Decisive code observations | Recorded 14 exact source literals with line numbers. Imported-DID creation checks service-auth issuer and creates a deactivated account; destination activation refuses OAuth; destination recommendations return its own public repo key; PLC creation can prepend supplied recovery key. |
| Proposed acceptance | Wrote 44 symbolic scenarios, all explicitly unexecuted. No passed runtime cases, latency samples or provider successes are asserted. |

Official pinned commits are:

- [ATproto `3cd9fa60`](https://github.com/bluesky-social/atproto/tree/3cd9fa6013efad3ab57704ae804952be097e5d26).
- [PDS distribution `d02a23e5`](https://github.com/bluesky-social/pds/tree/d02a23e5ba60b403728697bd50f7be15c69aeb66).
- [PLC method `9c8ea2fe`](https://github.com/did-method-plc/did-method-plc/tree/9c8ea2fe23b89a5c1011246cbb4957dad9dbf7db).

The current official [DID](https://atproto.com/specs/did),
[OAuth](https://atproto.com/specs/oauth),
[permissions](https://atproto.com/specs/permission),
[migration](https://atproto.com/guides/account-migration),
[recovery](https://atproto.com/guides/account-recovery) and
[WebVH v1.0](https://identity.foundation/didwebvh/v1.0/) pages were checked on
2026-10-02. Their live URLs are time-dependent references; frozen implementation
source is separately pinned. The procedure is an inference from these primary
sources and project constraints, not a provider-executed recipe.

## Recommendation and remaining gates

Adopt the existing-account writer adaptation first, using A1's owned session
request operation and the native publisher's conditional append path. Do not
wrap OAuth tokens in the password client, expose unconditional native writes,
build another resolver/refresh manager, or expand host operator login.

For the web setup experiment, use the official reference PDS and maintained
service-JWT tooling in an isolated operational harness. Validate exact tool
dependency/custody and both curves before implementing a production setup helper.
Retain provider-specific requirements/refusals. A documented `recoveryKey` field
or source handler is insufficient evidence that every PDS accepts the required
higher-priority key. Account management and OAuth may have different permitted
operations; deactivated account activation needs the former in inspected source.

DNS/TLS/domain hosting, app PDS ordering/observation custody and web's weaker
retained identity assurance remain explicit. WebVH history alone cannot make the
default native observer independently trustworthy or make a hostname account
portable. No actual companion adoption requirement was established.

Full A2 still needs implemented adapters and operational tests for existing/new
accounts, public hostname setup, actual provider OAuth/permission support, PLC
rotation/recovery/migration, web migration, key versus credential loss, owner
control versus operator access, and crash/uncertain-write/floor preservation.
Use genuine I1/I2/R1/materialized prefix gates; a setup journal cannot certify
history. Preserve separate local-fixture and public-provider results and obtain
independent exact-head review before merging any implementation.

The [evidence manifest](../experiments/post-spike-evidence/2026-10-02/app-provisioning-boundary/manifest.json)
pins both notes and all retained packet files. Mechanical packet verification
checks those hashes, official copies, all local Git blob pins, exact observation
lines and all vector execution-status labels. This is evidence consistency,
not runtime testing. Authored notes/JSON pass Git whitespace checks. The retained
official PLC specification has three original trailing-space lines; the full
diff check reports them, and they are preserved for exact upstream hashes.
Build, dependency installs, ordinary tests, browser tests,
DNS/TLS setup, account allocation, secret writes and provider operations were
not run for this source-only task. Production source, exports, dependency
graph, semantic registry and root user's package edits are unchanged.
