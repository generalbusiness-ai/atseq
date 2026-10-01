---
date: 2026-10-01
status: implemented candidate; independent exact-head review pending
category: native proof evidence
request: d22a606dcd584df143acda4523c2dcae0e03b1bc
validated_source_head: 50bdce3f7bea7ef8353a7d02ab41793bc2fbf0ad
base_main: 2c759838
---

# Native proof resource-limit results

Native proof readers now distinguish local policy exhaustion from invalid input.
A reader that reaches its configured budget throws
`ProtocolError('native_proof_limit', ...)` with kind `transient`. The existing
host boundary reports HTTP 503, `Unavailable`, and `permanent: false`. This
failure establishes neither validity nor invalidity and cannot become a
replicated fold outcome.

The implementation follows the independently assessed and adopted
[resource-limit decision](2026-10-01-atseq-native-proof-resource-limits.md),
including assessment `fc59503e173c3cb26c960afcdf6416acd513aef4`'s correction:
protocol syntax and maxima precede stricter local policy. Exact-head
implementation review remains pending.

## Change and validation

The validated source revision is
`50bdce3f7bea7ef8353a7d02ab41793bc2fbf0ad`, on the isolated
`fix/native-proof-limits` branch based on landed main `2c759838`.

| Boundary | Result |
|---|---|
| CAR byte/header/block-count/block-byte budgets | `native_proof_limit` when the separate local resource comparison fails |
| Native block bytes, node entries, lookup/tree node loads, walker depth and CBOR depth | The same transient code, including reads from previously verified cached blocks |
| Single-CAR retained-cache bytes or block count | The same transient code, with failed admission preserving previous evidence |
| Wrong CAR/path type, invalid node shape, truncated or zero header | Invalid input; mixed guards are split |
| Unknown, nonpositive, fractional, nonfinite or unsafe-integer budget configuration | Invalid caller input, not a repository-history verdict |
| Invalid MST key syntax or more than 1,024 characters | Invalid input before the local character policy |
| Valid MST key exceeding a stricter character policy | `native_proof_limit`; sufficient policy recovers the original result |
| Invalid signatures, CID/root/DID mismatches, malformed or noncanonical encoding, hostile tree structure | Existing invalid-input boundary retained |
| Missing blocks, record absence, full-tree completion and genuine runtime faults | Existing distinct results or error identities retained |

A private native framing wrapper translates only the native reader's local
nesting limit. The shared CBOR parser, strict Atseq `decodeBlock` behavior,
normative wire limits and semantic profile descriptors were not changed.
The new code is in `HOST_ERRORS` only. Existing independent profile vectors
still match the log, evaluator and application contract CIDs, and
`interpretationCode` rejects this host-only code.

The failed-walk catch paths no longer perform another range/depth inspection
that could overwrite the first failure. Normal successful walks still validate
ranges and depth. Shared controls inject an incomplete walker whose cleanup
would exceed the depth bound, and verify that runtime, resource, invalid-input
and missing-evidence failures retain their original meaning in both lookup and
full-tree validation. No incomplete walk produces a membership or absence
claim.

The source check included the locked `@atcute/mst` key rules and
`@atcute/repo` safeguards. The matching native default is the 1,024-character
key bound, so `assertMstKey` runs before local `pathCharacters`. The pinned
repository reader's 8,192-entry and 256-depth constants are documented
abuse safeguards and differ from Atseq's local defaults. The
[ATproto repository specification](https://atproto.com/specs/repository#security-considerations)
asks implementations to bound object size, nesting, node entries and tree depth
without prescribing those numeric values. The
[data model specification](https://atproto.com/specs/data-model#usage-and-implementation-guidelines)
likewise separates its validation guide from the formal specification. No
additional numeric protocol maximum coinciding with the other local defaults
was found in these sources.

## Test results and retained evidence

At the exact source revision above, on a clean tracked worktree:

- The shared native corpus passed all 49 named cases in Node v26.10.0 and all
  49 in real Chromium. Several cases exercise multiple operations or bound
  values. The case lists were compared and are identical.
- Chromium also verified the shared Node-produced p256 and secp256k1 signing
  fixtures; the executed corpus bundle was 444,671 bytes. This bundle includes
  the test harness and is not a product bundle-size measurement.
- Restrictive valid policies were applied to actual canonical signed fixtures.
  The same inputs succeed under sufficient bounds. Additional controls cover
  cached native block bytes, native header/node depth, node-entry count,
  walker-depth policy and both cache budgets.
- The 1,025-character default-policy path remains invalid input. Invalid path
  syntax and wrong path type also stay invalid under a stricter character
  policy. A protocol-valid path above that stricter policy is transient.
- A truncated declared header above the selected header budget remains invalid
  input. Malformed node shape precedes its entry-count policy. A deeply nested
  non-commit can first exhaust policy; raising that policy then exposes its
  invalid commit shape, demonstrating that a resource result never certifies
  validity.
- The host test obtains real native authentication failures and injects them
  at the existing host boundary. Both the HTTP response and `AtseqClient`
  observe 503/nonpermanent for resource exhaustion, and 400/permanent for the
  invalid binding control. Native P2/I1 consumers are not wired into host
  procedures by this test.
- `npm test` passed 360/360 tests, with zero failures, cancellations or skips.
  `npm run build` and `npm run check` also passed. The latter includes TypeScript,
  formatting, layer checks and installed dependency provenance.

An initial focused run preceded the checkout's build and could not resolve the
browser integrity adapter. Building supplied its expected local output; the
focused rerun passed 16/16, and the retained final full-suite run passed on the
clean committed source. A hostile test's explicit type cast was also corrected
before the final source commit. These preparation issues did not change the
error contract or profile identities.

Retained raw files are under
[the evidence directory](../experiments/post-spike-evidence/2026-10-01/native-proof-limits/validation.json):

| File | Contents | SHA-256 |
|---|---|---|
| `validation.json` | Exact source revision, runtime/platform, source hashes, commands, case counts and raw-file hashes | `6136b774b83072f3cb9257a7c015d7eb2b06e47b0b8033aace7bfc2a62031aa7` |
| `full-test.txt` | Unchanged full-suite console output | `87be96e955d06c4556f18619e6b3d8ae4238e94076f1a564f164e4cb734e9f14` |
| `browser.json` | Actual Chromium version, corpus cases, signing-fixture result and executed bundle hash | `789dadb90e900f4db03a3030476eaa1ca0cf8ddbfb93eb93bee0e1fee289184b` |
| `node.json` | Native case list extracted from the full-suite corpus output | `e77802a8aa6d0077dbff6e17b4c1adb95ef198e85564817478529c15b6013833` |
| `build.txt`, `check.txt` | Successful final build and required checks | Individual hashes in `validation.json` |

The source changes are confined to `src/core/errors.ts`,
`src/protocol/native-proof.ts`, `tests/support/native-proof-corpus.ts`,
`tests/host-availability.test.ts` and `tests/profiles.test.ts`. The two dated
notes and retained evidence complete the delivery. Manifests, lockfiles,
dependency approvals, integrity pins, semantic descriptors and profile vectors
have no diff from the base. M0's dependency approval work remains separate.

## Guidance for later consumers

P2 should surface `native_proof_limit` as a distinct stall reason identifying
the exhausted budget, retain the established frontier, and avoid classifying
history invalid. I1 should withhold admission under the selected policy.
Budget configuration mistakes remain caller errors and must not enter the
branch that judges signed proof data.

A hostile peer can force resource exhaustion deliberately. Neither consumer may
lower assurance, silently increase an authorized policy, or retry unchanged
work in a loop. Missing evidence still differs from authenticated absence; a
resource exception supplies neither conclusion.

The browser currently preserves nonpermanent queued work. Once a consumer can
surface this code during submission, its message should explain that the host
cannot verify within its configured limits. That wording belongs to the later
consumer task; PB1 makes no outbox, retry or consent changes.
