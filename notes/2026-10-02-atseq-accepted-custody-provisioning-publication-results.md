# Accepted browser custody and account provisioning: publication results

Date: 2026-10-02. Status cutoff: 2026-10-02T05:51:30Z, at main
`526111bfd51172dfb3c06aa3557b3beb0a5d8964`. Request `a1bea03b`, promise
`862c94a9`; exact-head publication review is pending.

This change makes two accepted design packets available in the main source tree.
It adds 56 exact Git blobs: all 27 additions from A1-D2 `bb41a0ba` against
`eec0c8e8`, including its six public SDK experiment files, and all 29 additions
from A2-D1 successor `2549de98` against `0df4aa12`. The latter contains the 25
original files from `364457c8` and four reviewed clarification files. The
[publication manifest](../experiments/post-spike-evidence/2026-10-02/accepted-custody-provisioning-publication/manifest.json)
pins every copied path, full producer/base commit, Git blob, byte count and
SHA-256 hash. Original proposed and pending wording, failed captures and
unexecuted vectors remain historical evidence. Use the later decisions below
when implementing them.

## Accepted browser custody policy

The [A1-D2 note](2026-10-01-atseq-oauth-bounded-stores.md) selects the official
browser package's public core client, stores, key and runtime APIs. One owned
versioned IndexedDB database supplies atomic reservations, counts, numeric
expiry and credential-operation journaling. Secure Web Locks coordinate
custody and the SDK's separate account lock. Interrupted credential operations
require retirement and explicit re-enrolment; a read-only operation can also
require this after a crash. Local deletion proceeds independently of bounded
best-effort remote revocation. Logical deletion does not prove forensic erasure.

Independent assessment `fb88a94ccb0379fcdbd0d94009ca8b66e17936f7`, ratified by
`ba978ca0d46d866e2524231256c9d0b38d67413e`, accepted this source-only decision.
Adoption `80111ff33975762e4f6ec9152342d176f2c01427` supersedes the original
1 MiB metadata proposal and configurable limits. The implementation constants
are **64 KiB of UTF-8 JSON metadata per row**, excluding the opaque CryptoKeyPair,
10 pending authorizations, 10 retained accounts including reservations and
retiring rows, 10-minute pending expiry and 30 days from explicit consent.
Refresh cannot extend that lifetime. Configuration and reconfiguration are
outside this initial contract.

The retained experiments show six actual public-core cases on Node 22, 24 and
26 and Chromium 153. Chromium used actual IndexedDB aborts, non-extractable key
reload and cross-document Web Locks. The selected OAuth dependency is nested
`simple-store` 0.5.1, which propagates write errors; root 0.3.0 is different.
These experiments use synthetic provider responses. They establish the public
SDK seam and its failure behavior, rather than production policy conformance or
provider interoperability. Five failed attempt captures remain intact.

## Accepted account provisioning contract

Prefer an existing ATproto account, which requires no owned hostname. One native
account writer should adapt the reviewed A1 session request operation and reuse
existing bounded XRPC decoders and conditional publication. Account login,
repository signing, appointed app control/owner and private host operator access
remain separate boundaries. **The app PDS holding the repository signing key
can construct another ordering.** Recovery must preserve accepted history,
governance, exact pending writes and newer local floors.

The [original provisioning note](2026-10-02-atseq-app-provisioning-boundary.md)
and [review clarification](2026-10-02-atseq-app-provisioning-review-clarification.md)
form one accepted contract. Original assessment
`c2139bbeafe3bb494b7bca4537d5dae573fe1b49`, ratified by
`ad60fc290fa8eef4bad186fe45a27eec44547ac4`, required the temporary web-key
lifecycle before code. Successor assessment
`504aea8e07a66a00e001ac88a2f970d157ecd680`, ratified by
`5959093ad1219ba71a9b69af244a194b5d07632c`, accepted exact head `2549de98` as
the simplest complete implementation contract. Adoption
`533183810188466b3f541d2b8556dfa344539de6` accepts that successor and the
preserved original packet; the source-only A2-D1 task is closed.

The successor overrides the original expired-token refresh answer. Generate a
temporary web key just in time within a fixed private custody window which a
restart cannot renew. Mint one exact short-lived audience/method-bound service
JWT; this is a local rule, not provider idempotency or single use. Rotate the
public web key promptly when the staged account is identified. Independently
read back the destination binding, then delete the owned key, token and signing
handles **before activation**. A failed readback or deletion stops activation.
Expiry or abandonment requires deletion even if readback has not succeeded,
and disclosure of the incomplete public binding. Lost-reply reconciliation
cannot silently refresh a token, extend custody or create another account.
The unavailable-old-PDS web migration path has the same restrictions.

Preserve A1's sanitized typed request failures through the writer; add no second
classifier or unconditional retry. A submitted PLC migration operation and its
resulting full signed history must retain the independent recovery key at
higher priority than PDS-controlled keys. Recommendations or a latest DID
document cannot establish this. Web hosting control and retained unsigned web
observations have weaker trust properties; WebVH remains deferred unless a
concrete deployment or audit need warrants a separately reviewed companion.

The original 44 and successor 12 provisioning vectors are **all unexecuted**.
Eighteen frozen official source copies, 25 project Git pins and 14 literal
observations support the design assessment. Six live research URLs preserve
what the original packet read; this publication did not retrieve them again or
assert current provider support.

## Implementation status at the cutoff

| Work | Exact accepted implementation and remaining limits |
| --- | --- |
| OAuth foundation A1-F2 | Candidate `fe7f4514`, source `022404f5`, independently approved by `a7a81f5741bfe29f07bdb321e02597d9147fbb7e` and landed in `93295649`. The original notes' pending-review wording predates this landing. Full A1 and real-provider operation remain open. |
| PDS startup fixture T1-H2 | Candidate `3e65d1c0`, approved by `c1c6d68199a43fc409fb98f50a0573f044600e00`, landed in `e2d0324c`; all three Linux Node jobs passed. This is fixture reliability evidence, not native publication or provider success. |
| Native observer I1-F2 | Candidate `a2a1bcef`, approved by `777e0b2b45efa53f4768ada192a51b30e026c746`, landed in `f520350f`. Genuine signed repository and identity fixtures exercise bounded stable observations. Full I1 and real-provider/host integration remain open. |
| Native coordinator N1-F3 | Candidate `50fc2371`, approved by `7174dc2c2328134ce0fe3b0e35e36ee14b09a8f6`, landed in cutoff main `526111bf`. Private captured generations, source assessment, staged interpretation and persistence-before-exposure are implemented; compact prefix, native publisher and trusted restore remain open. |
| Owned browser custody A1-F3 | Candidate `bc36c99` is ready for independent review, not merged at this cutoff. Its report retains 477 ordinary tests, 219 packed checks and 14 actual Chromium cases, with source and compiled coverage and synthetic responses. Those are that candidate's reported results; this publication neither reran nor independently approved it. |
| Shallow bundle test T1-H3 | Candidate `2f953500` is ready for independent review, not merged at this cutoff. It reports two focused tests in six shallow/no-Git Node environments. Linux CI confirmation remains pending. |

Frozen F5 publication is separate. These statuses do not import its files or
change its report. Full A1/A2 still need actual CLI/host/provider flows and
operational custody/recovery. Native conditional publication and reconciliation,
compact verified prefix, durable materialization, trusted restore, independent
checkpoint verification and rapid bootstrap remain implementation gates.

## Reproducible publication checks

Run from this checkout, supplying a physical installed SDK tree matching the
original packet's approved 194-path graph:

```sh
python3 experiments/post-spike-evidence/2026-10-02/accepted-custody-provisioning-publication/verify-publication.py --sdk-root /private/tmp/atseq-oauth-adapters-20261001
```

The checker compares all 56 files with frozen Git blobs and their manifest
hashes; checks both original packet manifests, six harness producer blobs, all
24 installed SDK identity pins and recorded Node/browser dependency resolution;
checks all 18 official copies, 25 local Git pins and 14 exact line observations;
and verifies the 44+12 unique vectors remain unexecuted. It checks the stored
synthetic experiment outcomes and the five recorded failed captures, authored
notes' local links and retained source-only review/adoption scopes.

[The retained result](../experiments/post-spike-evidence/2026-10-02/accepted-custody-provisioning-publication/verification.json)
is deterministic evidence consistency. No SDK/provider/browser experiment,
account allocation, key generation, timing measurement, install or production
build ran for this publication. Official files retain their original whitespace,
including three trailing-space lines in the PLC specification. This task adds
only source experiments, evidence and notes; production code, dependencies,
package metadata, exports, workflow and supported profile are outside its scope.
Independent exact-head `atseq-reviewer` review still gates publication merge.
