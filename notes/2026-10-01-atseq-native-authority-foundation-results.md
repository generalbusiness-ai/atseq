---
date: 2026-10-01
status: partial internal foundation implemented; independent delivery review pending
runtime-source: d08104ddae3e737b8de9e13a3e89116e65d84afc
dependency-basis: 412b0c9b83c921c86f95d847dabbba381767d783
request: 0e55c16dc2d5fb359e3e033c1b901fd97cb2cb6e
promise: 942365bffda572511f6697783be31955db4c2cc4
---

# Native authority: foundation results

The authority reducer now applies immutable grant admission, terminal revocation,
epoch retirement, observation floors, appointed recovery and ordered role/control
changes from retained authenticated evidence. The same 54 public cases agree in
Node 26.10.0 and Chromium 153.0.8010.12, including complete projected snapshots.
Node 22.19.0 replays that exact fixture successfully. This is an internal
foundation. The complete I2 implementation remains open.

The [capture manifest](../experiments/post-spike-evidence/2026-10-01/native-authority-foundation/manifest.json)
names the source, commands, package and fixture locks, individual source hashes,
raw logs and public fixture hashes. The retained fixture contains real native
CARs, signed requests, method evidence and expected outcomes. It contains no
private keys, credentials or supplied `trusted` flag. Its compressed form can be
replayed through `tests/support/native-authority-corpus.ts`.

## Authentication and authority are separate

`native-authority-evidence.ts` accepts a real P1 `AuthenticatedRepo`, an explicit
external application/genesis pin, prior opaque authority and retained I1 method
evidence. It checks exact genesis and entry membership, descriptor publication,
operation subject/context, account DID, method binding and exact native subject
records. Application before/after evidence must agree and its extracted signing
key must equal the application repository key. A root authenticated against an
arbitrary caller's claimed key is insufficient. PLC extraction verifies the
canonical retained-log tip, including genesis derivation and authorized history.

Participant proofs use that extracted account key, the exact designated root,
closed native record decoding and exact grant/revoke/epoch paths and CIDs.
Revoke import needs neither the target grant nor its epoch. Grant deletion does
not revoke a previously admitted grant. The account PDS can publish replacement
grants, but the reducer pins each admitted CID and never unions two grants' role
scopes. Device signatures remain a separate requirement.

Duplicate request, actor nonce and descriptor checks run against private accepted
state before observation fetching, and repeat in the reducer. Missing proof or
retained content stalls as `content_unavailable`; proved absence and malformed
history remain invalid. Valid ineffective operations consume their descriptor
and advance the ordered frontier. Normal accepted observations advance floors
even when their delegated change is ineffective. Failed appointed recovery
consumes evidence but changes neither participant floor nor epoch.

The evidence constructor is internal preparation, not a complete account
identity/admission API. Configured semantic/policy acceptance, native app-binding
envelope dispatch, trusted bootstrap-currentness acceptance and the online
observer are still integration gates. There is no live resolution, time-based
decision, app permission callback or public constructor for a forged capability.
Retained before/after equality does not prove uninterrupted currentness or global
latestness. A genuine truncated PLC history can still tell a stale observation
story. Directory branch metadata is not independent signed currentness evidence.

Hostname `did:web` retains its weaker assurance class. Under publication-only
observation trust, the app PDS can invent web DID bytes, roots and grants for any
claimed web principal without controlling its host. Raw web evidence cannot
substitute for an independently trusted bootstrap observation. Both application
and participant PDS custody must be disclosed; assurance display and archive
export remain integration work. No WebVH or real-provider success is claimed.

## Deterministic state and its projection

`native-authority.ts` mints opaque state only from an explicitly pinned genesis or
a successful authenticated transition. Private `WeakMap` storage refuses cloned
or fabricated states and entries. An owned snapshot copy cannot mutate accepted
authority. Throws leave prior state unchanged. Ordinary actions and activation
stall until a privately derived, supported source/action capability exists;
shape-valid execution CIDs or authorization objects cannot grant eligibility.

Genesis appointments root control authority and the owner principal. Owner role
administration uses one exact live device grant and its allowed domain-role
scope; it does not appoint governance. Governance may assign a domain role
without a target device grant. Initial enabled assignments use genesis CID `G`,
absent assignments have revision `null`, and effective changes, including
disable, use the unsigned request CID. Stale revisions cannot revive an old
assignment. Active definition identity belongs to opaque prior authority and
starts at the genesis definition; this foundation does not activate successors.

Routine observations cannot lower retained revision floors or resurrect retired
epochs. App-appointed recovery may replace one participant's floor only with a
never-accepted epoch and an exact prior floor/epoch expectation. It retains
terminal revoke tombstones and old epoch history. Participant account-key
publication cannot appoint application control or override the app chain.

Control changes follow the adopted mixed-power rules: govern preserves each
recover pair's complete powers; recovery rotation preserves lower powers;
recovery-to-govern obeys immutable genesis policy. Any single recovery key can
remove honest peers. The combined 16-pair limit remains a real liveness limit.
The tested three-step prune/rotate route applies to one mixed recover pair plus
15 non-recover certifiers. A full mixed recover/certify map without govern and
with recovery-to-govern disabled can remain blocked.

`native-authority-snapshot.ts` validates a closed, bounded, self-consistent JSON
projection and returns owned data. It never mints accepted authority. Shared
native DID/device and identity-key validators avoid a second parser policy.
Snapshot provenance, full replay and trusted-local restore are separate gates.

| Projection field | Retained rows |
| --- | --- |
| Scope | Format/version, app DID, genesis CID, active definition CID and position/entry frontier. |
| Control | Effective tip, sorted principal/key/power appointments, owner or null and immutable recovery-to-govern policy. |
| Roles | Sorted principal/role, enabled state and effective assignment revision. |
| Principals | Current epoch, immutable accepted epoch CID/ID/predecessor rows and last accepted descriptor/root/revision/key/PDS/assurance floor. |
| Grants | Sorted principal/grant ID, immutable admitted CID/body or null, and terminal revoke bit. |
| Ordered identities | Sorted consumed observation CIDs, unsigned request CIDs and exact app/genesis/actor-key/nonce retry tuples. |

The maximum snapshot is 32 MiB at JSON depth 32. PLC method bytes are limited to
1 MiB and web documents to 32 KiB. Account CAR content has a 32 MiB aggregate
fetch/reconstruction bound and uses the portable P1 cache default of 16 MiB;
cache exhaustion is unavailable. Native record and descriptor limits remain the
shared wire contract's bounds. A reset predecessor proof must fit its bounded
subject-record list; catch-up beyond that list is not demonstrated here.

## Verification and costs

| Gate | Actual result |
| --- | --- |
| Shared authority corpus | 54 cases, real authenticated method/native/device contexts; Node 26 and Chromium agree on outcomes and whole snapshots. |
| Node support floor | Node 22.19 replays the exact retained Chromium fixture: 54/54. |
| Hostile boundaries | Claimed-key P1 root, changed app tip, absent/missing native records, missing method chunk, bad device signature, wrong descriptor subject, reused descriptor/nonce and unsupported ordinary execution. |
| Shared native wire integration | Existing isolated native-wire suite: 54/54, including its Node/Chromium checks. |
| Build and checks | `npm run build` and `npm run check` pass types, formatting, layers and installed dependency integrity. |
| Installed graph | Existing 147 runtime paths; package, shrinkwrap, approvals, profile and package exports unchanged. |

The public fixture is 23,114,637 bytes, compressed to 1,933,520 bytes. It repeats
growing complete CARs for independently replayable cases; this is not a compact
archive measurement. Its four final snapshot projections are 14,131, 2,468, 2,392
and 4,185 bytes. The browser test bundle is 783,800 bytes and contains the test
replayer and dependency validation. It is neither a standalone library cost nor
an application-shell delta.

The reducer clones the full projection, searches arrays and sorts retained rows
on each accepted transition. It establishes deterministic behavior, not a
large-state performance strategy. Incremental maps/pages, P3 local generation
storage and P4 checkpoint/restore integration must preserve this contract while
avoiding repeated full projection work. No 10k-state timing claim is made.

The failed check/wire attempt during a concurrent build is retained separately:
the build was replacing generated integrity modules. Both gates passed after
the build finished. No global concurrency workaround was added. Full `npm test`,
a compiled package consumer, Node 24, provider enrolment, online observation and
checkpoint restore were not run for this partial foundation.

## Remaining work

Review this foundation's actual capability boundary and transition precedence
before integration. Complete supported native source admission, one ordered
required-role/open eligibility gate and activation through private source
capabilities. Then connect the authority reducer to the atomic folder, ordering
host, browser reader and archive verifier, including exact semantic/policy
dispatch, bootstrap/current observation, evidence retention and assurance
surfaces. Checkpoint and local restore must authenticate provenance rather than
turning this snapshot parser into an authority constructor. Whole I2 stays open
until those paths and their end-to-end gates pass.
