---
date: 2026-10-01
status: internal data foundation implemented; independent review and full P4 integration open
request: d882d0d250488079f7afaf53fcb7e41ecfb720ca
promise: c89c3d3896e59e4b06aefe131c2ffce84a80772e
parent_request: 1f13a0dcbbae3fd55a08049416ef16175a66c72d
base: eec0c8e877b66413a6a4781f826e0fbbcfdea462
implementation_source: bc340cceb1469f44b3caead00e404e3c9ef6b3ed
accepted_projection_source: 8e7dc9a23693d356db84a7dfc82b8ecde5613767
---

# Checkpoint data foundation results

The internal reader now checks exact checkpoint bytes, flat table inventories,
history/source/evidence rows and compact authority data. One complete history
produces request, retry and descriptor indexes. It shares existing native byte
framing and I2 authority checks. The same 91 checkpoint cases pass on Node 22.19,
Node 26.10 and Chromium 153. Independent review is required before landing.

These functions return owned data. They do not authenticate an app publication,
admit executable source or domain state, restore authority, audit execution,
establish prior absence or enable a writer. No accepted/replayed/published state
capability, public package export or supported-profile registration was added.
Full P4 remains open.

## What changed

[The pure JSON helper](../src/protocol/strict-json.ts) uses the existing
`jsonc-parser` visitor followed by `JSON.parse`. It reports typed lexical faults:
invalid call, byte/depth limit, BOM, UTF-8, decoded duplicate name and JSON syntax.
[I1's wrapper](../src/protocol/identity-json.ts) preserves its existing messages,
error classes, codes and unavailable treatment of its local limits. It does not
match error text or broadly convert unexpected exceptions.

[The checkpoint reader](../src/protocol/checkpoint-data.ts) separately applies
fixed format bounds: pages have at most 128 KiB canonical UTF-8 and depth 32;
other payloads retain the existing native byteManifest limit of 32 MiB. Smaller
operational byte/row limits cause unavailable results. A format, shape, canonical
byte, immutable hash, count, scope or uniqueness fault rejects checkpoint data;
it does not declare otherwise valid native ordered history invalid. Missing
required bytes remain unavailable. Unexpected reader failures propagate unchanged.

Byte manifests and chunks are reconstructed by existing N1 readers. A supplied
raw payload is also compared with the exact deterministic native manifest
identity committed by its reference. Native root membership is a separate future
proof boundary. Header counts use safe arithmetic; complete pages must reproduce
declared counts, references and global order. History positions are consecutive
through head. Source and evidence row keys are unique across pages. Source file
order and unused assets remain unchanged, and every supplied original file or
evidence byte value is checked against its immutable identity.

The complete-table operational byte budget counts reconstructed JSON header/page
bytes, not backend storage, native framing overhead or network requests. Ports
still need their own aggregate fetch/storage limits. No timing or constant-memory
claim follows from these checks.

History rows retain their original actor identity, unsigned request CID and
observation use. The complete-history data reader detects request, actor/nonce
and descriptor duplicates across page boundaries. It derives I2 arrays through
interpreted frontier while still checking uniqueness through ordered head. Exact
original entry/request bytes, signatures and chain can be checked separately for
bytes actually supplied. Complete asserted history loading alone does not
independently replay all original verification or interpretation evidence.

[Shared authority data validation](../src/application/native-authority-data.ts)
keeps I2's existing full snapshot reader and adds the separately closed compact
shape. Compact intrinsic checks do not invent empty historical arrays. They check
immutable policy, account/device bindings, role syntax, exact grant/epoch CIDs,
current epoch membership and grant/tombstone relationships. Exact genesis
initialization is compared with plain expected data, without calling the accepted
state constructor. Once complete asserted history is supplied, temporary real
indexes restricted to frontier permit the existing I2 data reader to check
historical control, role and observation references. Its result is still data.

The legal recovery forest is preserved: position 20's fresh current epoch has
previous null and two retained retired epochs outside its ancestry. No whole-set
connectivity or acyclicity rule was silently introduced. The accepted I2 state
brand, reducer, authenticated-entry admission and existing private WeakMaps are
unchanged.

## Evidence and results

The retained fixture contains the exact accepted P4-D2 public native records;
keys, signatures, nonces and input bytes are not regenerated. Its raw JSON is
1,055,377 bytes, SHA-256
`885826c82e93de564330c1b1ca3f601b387642a9d5b719a20217e853092d9b41`,
with 147 payload references and 288 exact native records. It derives from the
accepted vector inventory
`175a20c68b576cbd76e1a9db7b740de788d93ec08dca777705ccd22d1e685517`.
The fixture remains a structural/data example: its source/semantic placeholders
are not admitted application support.

| Check on implementation source | Result |
| --- | --- |
| Shared checkpoint corpus | 91 identical case names/results on Node 22.19.0, Node 26.10.0 and actual Chromium 153.0.8010.12 |
| Existing I1 corpus | All 60 cases passed on both Node versions and Chromium; shared PLC fixtures also passed |
| Existing I2 corpus | All 54 cases passed on both Node versions and Chromium, including exact whole snapshots |
| Differential I1 extraction | 72 cases per Node version, zero differences in value or error class/code/kind/message |
| Differential full I2 data reader | 84 cases per Node version, zero differences against the reviewed predecessor |
| Fresh compiled build | Passed; installed runtime closure verified |
| TypeScript, formatting, layer and dependency checks | Passed |

The shared checkpoint cases cover six exact authority baselines and compact
counterparts, 13 original signed/account entry projections, head/frontier index
separation, source order/unused binary bytes, evidence identities and native
chunk boundaries. Hostile mutations cover duplicate decoded JSON names, BOM and
invalid UTF-8, noncanonical bytes/numbers, unsupported fields and old table kinds,
counts/order/scope, cross-page identity reuse, modified original bytes, chain and
unsigned/signed identity confusion, false historical references, malformed
compact rows, unavailable limits/missing pages, immutable returned data and
unexpected reader failures.

[The evidence packet](../experiments/post-spike-evidence/2026-10-01/checkpoint-data-foundation/manifest.json)
retains commands, exact source/fixture/capture hashes, differential predecessor
identities and browser bundle/case summaries. Earlier 79-case preparation logs
are retained separately and do not claim the final source's expanded coverage.
Build's existing large-chunk warning is retained unchanged. No full ordinary
suite, packed artifact, live PDS, provider flow, benchmark or checkpoint admission
ran for this narrow slice.

## Remaining gates

Outcome table headers can be read, but outcome rows remain unavailable in this
foundation. N1-D3's exact literal tables at `80e39957` were independently accepted
during this delivery (assessment `eda5273203fad1d3c3ecccd83faba6c398c3a55a`,
ratification `8e1cc3ea2497098265eacd04821730022eefd1c8`). A followup must implement
one shared parser with the native application; these frozen captures do not claim
that integration. No regex-only framework namespace or caller support
registry was added. This slice does not read/admit the complete outer assertion
or execution-provenance/restore policy.

The next work should connect accepted native publication and source/state
admission to the independently reviewed private asserted-authority boundary.
Suffix interpretation needs resolved complete prior coverage and atomic I2/P2
integration. Deferred caches cannot prove absence. Fixed-target audit and actual
build-equivalence restore remain separate routes with separate evidence. Local
P3/R1 indexes may be derived from these rows; durable generations and writer
readiness require their own complete integration checks.
