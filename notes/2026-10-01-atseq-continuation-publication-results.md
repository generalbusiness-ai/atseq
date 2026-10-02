---
date: 2026-10-01
status: documentation delivery; independent publication review pending
examined_at: c242ca20e823ea510e3939a8466a608f3ab860ba
status_observed_at: 2026-10-02T02:40:02.144925+00:00
request: 901c088573f58880fbe66e4667f3fac8e54d6e9b
promise: d9878e1c3261acf1edc89cc2c75238f2aa8ffe70
---

# Accepted designs, shipped foundations and remaining work

The internal identity, wire, authority and local storage foundations are shipped.
They make the next implementation steps concrete, but they do not yet provide
complete native Atseq operation, authenticated enrolment or fast trusted
checkpoint bootstrap. This report publishes accepted source notes and their
exact public evidence, then refreshes the [programme](2026-10-01-atseq-implementation-programme.md)
and [plan-review gap map](2026-10-01-atseq-plan-review-gaps.md).

This publication starts from `eec0c8e8` and records pushed main through
`c242ca20`. Later in-progress work is named separately below. Gitseq remains the
current ledger. Each short event ID uses `git:sha1:fa8d62ed900d7697380a68652abb3e45d950a677#git:sha1:`.

## Shipped implementation

| Foundation | Reviewed delivery and landing | Actual result and remaining limit |
| --- | --- | --- |
| I1-F1 retained identity/network evidence | `9c345e8f`, approval `0dfff26b`, main `3a40d2c5` | PLC/web interpreter and guarded host transport, including TCP-reset body classification and Node 22.19 support. Observer orchestration and native participant admission remain open. |
| N1-F1 native wire framing | `13c9977c`, approval `c595f3cf`, main `fc8e2093` | Closed native record shapes, exact paths/bytes/signatures, retry context and independent vectors. Preparation descriptors do not enable supported native interpretation. |
| P3-F1 atomic raw storage | `0d6eebce`, approval `c3c62d29`, main `1bb122ec` | SQLite/IndexedDB generations, copied bytes, CAS, pins and exact quota accounting. The L1 correction reclaims redundant tombstones while preserving pinned live values. Stored bytes create no trusted authority or restore capability. |
| I2-F1 authenticated authority transitions | `29f5b2cd`, approval `9080a267`, main `eec0c8e8` | Authenticated entry capabilities and deterministic grants, epochs, revocation, roles and appointed control. Ordinary actions and activation still need source-derived eligibility and atomic application integration. |

The [I1](https://github.com/generalbusiness-ai/atseq/actions/runs/36922875534)
and [N1](https://github.com/generalbusiness-ai/atseq/actions/runs/36935261684)
pushed-main matrices passed Node 22.19/24/26. P3's
[run](https://github.com/generalbusiness-ai/atseq/actions/runs/36940311459) passed
Node 22.19/26; Node 24 passed 444 of 445 ordinary tests and reproduced the
shared-dist package/browser race. That is a test-build race, not a storage test
failure. I2's later [matrix](https://github.com/generalbusiness-ai/atseq/actions/runs/36942802499)
passed all three versions, including the separately run 20,000-entry gate.
I2's successful run predates the separate package-race correction.
The retained CI snapshots preserve each actual head, job and result.

T1-H1's private package-test staging at `4be60f1b` is independently approved by
`3fcd8d7a`, landed and pushed at `b0a5d066`. It keeps the shared build output
intact and checks exact build-source and installed-consumer provenance. Its retained local
71 focused parallel tests, 443 ordinary parallel tests and 219 packed cases
passed; the reviewer independently ran the concurrent package/browser race,
17 of 17 passed. Its [pushed-main matrix](https://github.com/generalbusiness-ai/atseq/actions/runs/36945783974)
passed Node 22.19/24/26, including the separately run 20,000-entry gate. Full
T1 and later OAuth packed-consumer integration remain open.

## Accepted source-only designs

The [copy manifest](../experiments/post-spike-evidence/2026-10-01/continuation-publication-f4/source-publication.json)
records all 22 published source paths with full Git revisions, byte counts and
matching source/published SHA-256 hashes. All copies are exact. Status labels
such as “proposal” or “review pending” inside these frozen notes describe their
original source state; the dispositions below describe the later accepted
reviews. Original archives, captures and predecessor notes have not been edited.

- **N1-D2 source admission:** [source owner and projection](2026-10-01-atseq-native-source-admission.md)
  from `b029720f` and unchanged [outcome provenance](2026-10-01-atseq-native-outcome-provenance.md)
  from `4ad0d904`. Completion report `438a983f` records the independently accepted
  successor. Source-derived capabilities, raw semantic projection identities,
  transport locator distinctions and framework/fold provenance are decided.
  Subsequent N1-D3 settles literal contract and stage-table choices; supported
  profiles, compiled conformance and runtime enforcement remain gates.
- **I1-D2 observer:** [bounded public observation](2026-10-01-atseq-native-observer-preparation.md)
  and unchanged source-inspection manifest from `daade18c`. Completion report
  `a9324f44` records accepted batching and stable source-refusal corrections.
  One shared reservation bounds the whole attempt; changed identity/root may
  restart, while a stable selected-root absence/replacement has a distinct
  nonretryable refusal. This does not implement the observer, independently
  prove current identity or complete provider trials.
- **P4-D2 checkpoint projection:** [closed projections](2026-10-01-atseq-checkpoint-projections.md),
  [outer bytes](2026-10-01-atseq-checkpoint-policy-bytes.md), generator and
  successor packet from `8e7dc9a2`. Ratified successor assessment `78c3a674`
  accepts one portable history table and derived request/retry/descriptor
  indexes. Compact authority omits duplicate arrays. Through-head index claims,
  interpreted-frontier state, deferred absence, publication assertions and
  independent replay remain distinct. The report `448abd6a` records the decision;
  it does not claim runtime admission or a checkpoint trust capability.

The P4 successor preserves seven cases, 147 payloads and 288 native records.
For the same 13-entry history fixture, history/index framing changes from 21 to
8 payloads and from 11,525 to 6,338 canonical UTF-8 bytes. These are exact fixture
inventory counts, not production checkpoint size or performance estimates. The
original packet remains exact: 160 payloads, 314 native records and its earlier
notes/generator. Both packets retain unsupported source/semantic placeholders.
Fresh runs of the unchanged accepted generator in Node 22.19 and 26 reproduced
the successor vector inventory exactly using the original pinned `d08104dd`
source in a read-only checkout. That historical source retains pre-V0 canonical
validation; six other pinned framing/authority modules match examined main. This
is exact historical fixture reproduction, not a run against changed production
inputs. No checkpoint parser, publication admission,
restore, audit, browser admission or provider flow was exercised by F4.

## Recommendations and next gates

E1-K1's complete-state measurement at `940f0ad0` is independently approved by
`788175db`, landed and pushed at `c242ca20`. Its
[matrix](https://github.com/generalbusiness-ai/atseq/actions/runs/36947475821)
passed Node 22.19/24/26, including the separate 20,000-entry gate. It retains
21 legal fixtures, 13 operations and seven samples per operation in Node and Chromium. At-cap
warm action/successor medians range from 0.66–26.03 ms in Node and 1.3–66.1 ms
in Chromium. They are neither end-to-end replay nor worst-case bounds. Keep the
128 KiB complete-state contract, V0, S1 and checkpoints as the default. Size
alone does not predict cost; no effects prototype is justified by these results.
Existing archives replay legal 128 KiB states. Future checkpoint state payloads
must use chunks across the 64 KiB protocol-block limit.

N1-D3 (`fe02ea5e`) now has an accepted source-only decision at `80e39957`,
assessment `eda52732`. It settles literal native/application/service contracts
and exact stage reasons/precedence. N1-F2 (`1521c26e`) is implementing the private
source owner and source capabilities; those capabilities are not an accepted
ActiveDefinition or eligible execution. P4-F1's DATA parser is independently
approved at `f31fa246`, with landing in progress at `db0c8174` and no push assumed
in this snapshot. It mints no accepted/replayed/published/restore/writer
capability. Full assertion admission, suffix and audit APIs still need joint
review and implementation. These later source decisions and deliveries are not
part of the 22 frozen files published by F4.

OAuth foundation `7807cd9a` needs required review corrections: preserve transient
network/deadline/read failure classes and select the pending callback transaction
from its own state. A1-F2 (`c4b3dcc8`) is implementing the integrated successor;
no foundation approval or landing is assumed. A1-D2's accepted source-only
supported-store decision (`fb88a94c`) adopts one owned numeric-expiry store,
10 pending authorizations, 10 accounts, 10-minute pending expiry, 30-day local
consent and 64 KiB row metadata. Uncertain credential operations require
re-enrolment after a crash. Bounded-store implementation, fault/crash coverage,
product enrolment and real-provider trials remain gates. The original browser
SDK's physical-retention limitation is not fixed merely by that design approval.

S0-M1 (`1c284142`) is preparing realistic-N total replay measurements and a
requirements disposition using supported complete-state fixtures. Repeated final
actions are not total replay. Keep the adopted complete-state default; no effects
prototype or new performance threshold is authorized by this characterization.

The full I1/I2/N1/P2/P3/P4/R1/A1/A2/S0/E1/T1/C1 requests remain open. The next
integration gates are source admission and eligibility, activation, bounded
observer capture, atomic native application ordering, incremental suffix reads,
retained retry/receipt lookup, coherent materialization, accepted checkpoint
publication, independent genesis replay and provenance-bound restoration.
Discovery, first-run provisioning/recovery and the native end-to-end performance
matrix follow those boundaries. App-PDS ordering remains the preferred authority
model: the app PDS holding the repository signing key can construct another ordering, delete or withhold
records; they cannot forge device signatures. No checkpoint supplies unseen
non-equivocation or independent currentness.

## Publication checks and limits

The [validation packet](../experiments/post-spike-evidence/2026-10-01/continuation-publication-f4/validation.json)
records source/copy equality, archive-member hashes, the original fixture hash,
fresh generator inventories, note links and unchanged production paths. This
is a documentation/experiments delivery with one narrow `.prettierignore` entry
for the independently reviewed source-only generator, authorized by the effective
scope extension `2b3e8086`. The unchanged source
fails the ordinary style check; reformatting would break the required exact
publication. The single-path exception preserves reviewed bytes and follows the
existing immutable-evidence policy. Its original style refusal and successful
exception check are retained for independent review. Runtime source, packages, locks,
profiles, supported registries and product interfaces are unchanged from its
basis. Existing implementation reports supply their own conformance evidence;
F4 did not rerun the full suite, provider flows, trusted restore or native support.
Every changed delivery path still needs independent exact-head publication
review before merge and push.
