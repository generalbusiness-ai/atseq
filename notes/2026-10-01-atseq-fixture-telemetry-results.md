---
date: 2026-10-01
status: fix and preload-sensitive regression validated; exact-head independent review pending
examined_at: cb3fd8472ccec1208b72e8adc81884ccfb1860d4
delivery_base: 853f671bd0acafe4619ad486b17967f602c9fc3f
request: b5106f06
---

# Disposable fixture telemetry isolation

The disposable PDS child now receives an explicit environment allowlist and
`OTEL_SDK_DISABLED=true`. Inherited OTLP, Jaeger, Node preload, service configuration
and credential variables do not reach it. The effective inheritance vector is a
Node preload that loads the pinned `@atproto/pds/telemetry` entry; OTLP/Jaeger
variables alone do not start an SDK on the ordinary library launch path.
Independent review `8508b62a` found that the earlier collector regression passed
even with the old environment spread, so its zero-export results are retained
below as pre-correction evidence, not proof of this boundary.
The corrected regression distinguishes both paths: the legacy child environment
emitted **56 HTTP exports under the original lock and 58 under the refreshed
lock**, while the allowlist emitted **zero**. Each path completed the same
29 real account/repository operations and restart.

Keep the existing in-process mock PLC. Its pinned library entry does not start a
telemetry SDK; an extra PLC subprocess would add lifecycle complexity without
addressing an observed fixture startup path. The caller must use a runner without
externally preloaded telemetry instrumentation. No global `process.env` mutation
was added. This implements MF2, separately from fixture dependency patches in MF1
and production provisioning in A2.

## Change and boundaries

`tests/support/pds/child-environment.mjs` copies only `PATH`, `Path`, `SystemRoot`,
`SYSTEMROOT`, `WINDIR`, `TMPDIR`, `TMP` and `TEMP` when present. It adds fixed
`TZ=UTC`, `LOG_ENABLED=false` and `OTEL_SDK_DISABLED=true`. The PDS fork uses that
helper and still clears inherited Node execution arguments. It inherits no
`NODE_OPTIONS`, `OTEL_*` exporter configuration, Jaeger settings, home-directory
configuration, cloud credentials or PDS service overrides. The input environment
is unchanged, including when the PDS is restarted.

Both services retain their existing loopback binding. This is configuration
isolation, not a network sandbox. The fixture disables SSRF protection and rate
limits and uses dev-mode synthetic accounts. `npm run dev:app` uses this same
fixture; the interaction and host guides now explicitly require loopback access
and synthetic accounts/data and prohibit using real accounts or exposing the
fixture publicly. The interaction setup command now names the actual isolated
fixture directory, `tests/support/pds`.

The mock PLC shares the runner process. Environment variables alone do not install
an SDK in the inspected library path, but an SDK installed by the caller before
the helper runs can instrument that process. `NODE_OPTIONS`, `--import`, `--require`
or caller code may preload such instrumentation. That caller owns exporter
configuration before starting the runner; this helper cannot uninstall an
existing global provider. This boundary is documented rather than hidden by
temporarily mutating the environment of unrelated concurrent tests.

## Actual startup inspection

The fixture imports `@atproto/crypto` and the `@did-plc/server` library entry in
the runner, then `@atproto/pds` in the child. The installed fixture remains pinned
to PDS 0.5.31, crypto 0.5.4 and PLC server 0.0.1. MF2 changes no lockfile.
The final delivery incorporates the separately reviewed MF1 dependency patches
from main `853f671b` and was retested against their refreshed fixture lock.

Inspection of PLC's distributed library and database bundles and its bundled
PLC library found no OpenTelemetry/Jaeger SDK import or telemetry startup call.
`Database.mock()` is the in-memory path. PDS's ordinary library entry does not
import its separately exported `@atproto/pds/telemetry` startup module. Its
OpenTelemetry API event calls do not themselves install a provider. The separate
startup module calls the ATproto wrapper's `setup`, whose endpoint/disabled gate
consults inherited environment. An inherited `NODE_OPTIONS` preload can load this
entry even though `pds-server.mjs` does not import it. The child allowlist drops
that preload and forces the disable flag. It does not promise that arbitrary
future upstream changes are safe.

Inspected installed file SHA-256 values, unchanged across both fixture locks:

| File under `tests/support/pds/node_modules/` | SHA-256 |
| --- | --- |
| `@did-plc/server/dist/index.js` | `ed096a3438e99aa489e6cc170c6c0b94ec7515046395589b29858a6cb4339dfa` |
| `@did-plc/server/dist/db/index.js` | `3d9de53b7e9cecc6d7b5211c733033874f89726fbee173d43fac7042e1be673a` |
| `@did-plc/lib/dist/index.js` | `dfc7388ecfa546482efd8b7beda0eee36e601c2cb6d3bfc581b313011f0d21bb` |
| `@atproto/pds/dist/index.js` | `fe976c5f8b7f4f67531b79f478a02eb5f43d4908205b3225de0d9a51a73fb1b0` |
| `@atproto/pds/dist/telemetry.js` | `c34f885371185418cb36b0769691dd1b8bba672812d0a0695dd7eb1899e86621` |
| `@atproto-labs/opentelemetry-node/dist/index.js` | `71e813b1921bb9a4477ed9bd12d0c521011c69eab13fa62a208ad1293859afc2` |

These are the actual installed entry paths, not claims inferred from package
names or the presence of an exporter dependency. Recheck startup boundaries when
refreshing those packages.

## Regression and results

`tests/pds-telemetry.test.ts` first verifies the allowlist using synthetic secret,
service, exporter and preload settings, and verifies that its input is unchanged.
Its integration test launches a separate probe runner with `OTEL_SDK_DISABLED=false`,
Jaeger propagation, OTLP HTTP exporters for traces/metrics/logs, short exporter
intervals and HTTP/UDP collectors on dynamically selected loopback ports. It does
not modify the test runner's global environment. The runner receives only a
harmless `NODE_OPTIONS=--no-warnings` sentinel, never the SDK preload.
Resource detection is restricted to `OTEL_NODE_RESOURCE_DETECTORS=env` so this
synthetic positive control does not contact cloud metadata endpoints or defer
exports behind their detection timeouts. An initial preload attempt with default
resource detection did not export before the quick fixture shutdown; the test
now requires emission during real operations, without adding an idle sleep.

Inside this isolated test probe only, a fork wrapper maps any retained sentinel
to the absolute pinned telemetry entry's `--import` file URL when launching the
PDS child. The allowlist path still uses the production helper's selected child
environment; the legacy positive path uses the original spread map. Both execute
the same account/repository work and restart. Imported builtin fork bindings are
restored in `finally`. This is test instrumentation, not a fixture API change or
an SDK installed in the runner. The regression requires legacy HTTP exports and
zero exports through the allowlist. Configured Jaeger propagation and a reachable
UDP collector do not themselves prove a Jaeger UDP exporter was activated.

The collectors each receive a positive control before the probe starts. The test
then counts requests/datagrams throughout actual account/repository work and
PDS restart/shutdown. It does not establish success by merely sleeping with an
idle service. The contaminated probe runner:

1. Creates a synthetic `.test` account and resolves its handle.
2. Reads its DID document directly from the local PLC.
3. Writes and reads back 12 records, checking each CID/value.
4. Exports a nonempty native repository CAR.
5. Stops/restarts the PDS and reads the final persisted record.
6. Confirms its inherited exporter/preload variables are unchanged and the child
   helper emits only the forced disable flag from those variable families.

Before the preload correction, the 29 operations above succeeded; collectors
observed **0 HTTP requests and 0 UDP datagrams** after their positive controls
under both locks. These configurations were inert and did not distinguish the
old spread from the allowlist. Node was
26.10.0. The original result was copied byte-for-byte to a dated evidence path
before rebasing or rerunning; the refreshed result is separately retained.

| Capture | Fixture lock SHA-256 | Raw result SHA-256 |
| --- | --- | --- |
| Original MF2, pre-correction, 14:45:14 UTC | `227b88499a22dffc15fcdc4aed0f6ee81fcfc11531ee2e2c8de49c991175ee41` | `60746382a40f1d5265b0e42b63140d8e8c758c8beaa3f3ba8458d4f59967936c` |
| Refreshed MF1 lock, pre-correction, 14:56:58 UTC | `762b412e3aa383b3e094bc1d2f6a0cc4389df7444ef0726f693cb026788b3dcd` | `72a92e57ba617b139a13bbfd4b0e851bb15592ac2646322bc1a7dcd767669bda` |

The exact public results, including source hashes, are
[original](../experiments/post-spike-evidence/2026-10-01/pds-telemetry-original-results.json)
and [refreshed](../experiments/post-spike-evidence/2026-10-01/pds-telemetry-refreshed-results.json).
Each records 29 successful operations, 12 records, verified restart, unchanged
runner environment, successful HTTP/UDP collector controls and zero telemetry.
They contain no account credentials, tokens, environment values or collector
payloads. Historical evidence was not rewritten. Future test runs continue to
write only the replaceable `experiments/generated/pds-telemetry-results.json`.

## Corrected preload evidence

The two corrected captures run the allowlist and legacy paths separately. Each
path creates and verifies an account and PLC document, performs 12 record
write/read pairs, exports a CAR, restarts the PDS and verifies its retained final
record. Each reports an unchanged runner environment. The legacy path preloads
the SDK in both PDS child launches; the allowlist path preloads neither.

| Fixture graph | Legacy HTTP exports | Allowlist HTTP/UDP exports | Corrected raw result SHA-256 |
| --- | --- | --- | --- |
| Original lock `227b8849` | 56 | 0 / 0 | `5881d81d5d2059b0f7365f37cb9738aafc75033ac0b0b9a51208b180a55a7713` |
| Reviewed MF1 lock `762b412e` | 58 | 0 / 0 | `db5d2718f0003bbfd4afe0b7fe7333a32552fe40e2f61e2ff57d30a9ec2789c8` |

Raw files retain both modes, counts, collector-reachability controls, timestamp
and source/lock hashes:
[original preload result](../experiments/post-spike-evidence/2026-10-01/pds-telemetry-preload-original-results.json)
and [refreshed preload result](../experiments/post-spike-evidence/2026-10-01/pds-telemetry-preload-refreshed-results.json).
Exact export counts vary with scheduling; the requirement is positive legacy
HTTP emission and zero emission through the allowlist, not a count threshold.
Both legacy UDP counts were zero; this report does not claim a Jaeger UDP
exporter was activated.

A bounded mutation in this isolated worktree then replaced only the production
fork's allowlist selection with the original `{ ...process.env, LOG_ENABLED:
'false' }` spread. The negative test failed specifically on **55 HTTP exports**
with `Allowlist must block HTTP exports`, exit status 1. The source was restored
byte-for-byte in `finally`; the refreshed fixture lock was also restored exactly.
The [mutation witness](../experiments/post-spike-evidence/2026-10-01/pds-telemetry-preload-mutation-results.json)
retains the assertion output, counts and source/lock hashes; its SHA-256 is
`033ec67c709fa3e7d03109dc86478e9b9d4b8cfcf602602a9497bfe033225394`.
This demonstrates that restoring the vulnerable inheritance path makes the
regression fail, addressing independent assessment `8508b62a`.

Original MF2 passed `npm run build`, `npm run check` and **354/354 `npm test`
tests**, including PDS persistence/recovery, the new regression, browser flows
and Node/Chromium agreement. After rebasing onto `853f671b`, clean
`npm ci --prefix tests/support/pds` installed the refreshed graph; both focused
telemetry tests and the required `npm run check` passed. All six inspected startup
file hashes above remain unchanged. The targeted rerun exposed no concern, so
the full suite was not repeated under the combined head; MF1's own full-suite
results are in its [patch report](2026-10-01-atseq-pds-patch-results.md).
After the evidence correction, focused tests passed **2/2 under each lock**.
Following the bounded mutation and exact restoration, focused tests passed 2/2
again and `npm run check` passed. The full suite was not repeated for this
test/evidence correction. No production helper/API changes were needed.

MF2 changes neither package manifest nor root/fixture lockfile relative to its
reviewed MF1 base. No production runtime source, wire contract, deployed service
or public account was changed.

## Recommendations and limits

Keep this small configuration boundary and the existing PLC lifecycle. The MF1
refresh is now incorporated and this regression passes under its new lock hash.
Reassess the parent import path if a future PLC release introduces
SDK startup. A subprocess would then be a concrete option rather than speculative
infrastructure now.

The regression covers the actual pinned startup paths with inherited synthetic
exporter settings and the corrected test adds the actual PDS child preload
vector. It does not prove absence of all outbound network activity,
test an externally preinstalled parent SDK, remediate residual dependency
advisories, or certify the fixture for production. Exact-head independent review
and the tracked merge remain pending.
