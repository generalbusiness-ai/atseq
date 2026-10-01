# Disposable PDS compatible patch results — 2026-10-01

Status: implemented and validated; independent exact-head review and landing
remain pending.

Workroom: MF1 request `5f0517cc`, promise `8290c6fb`, following the accepted M1
assessment `e23495f5`. Source baseline: main `cb3fd847`.

## Result

The single reference fixture in `tests/support/pds` now selects six patched
dependency versions within their existing parent ranges. Its manifest, official
PDS 0.5.31 baseline, mock PLC, harness and root dependency graph are unchanged.
There are no added or removed package nodes and no unrelated resolution changes.

Clean installs, build, required checks and all **352 tests passed**. The targeted
PDS persistence/restart, browser-session and archive set passed **50 tests**.
The real PDS native probe passed all **nine checks**, including a `getRepo(since)`
diff that authenticates the appended record and head under one selected root.

The registry audit changed from **13 vulnerable package records** (10 high and
3 moderate) to **8 records** (all high). Remaining findings concern the existing
OpenTelemetry, Nodemailer and PLC/Kysely dependencies and their ancestors. This
is a bounded dependency patch, not a claim that the fixture or a production PDS
has no vulnerabilities.

## Exact dependency change

The update used:

```sh
cd tests/support/pds
npm update --package-lock-only --ignore-scripts --no-audit --no-fund express body-parser qs @grpc/grpc-js brace-expansion
```

| Locked path/component | Before | After | Existing parent constraint |
| --- | --- | --- | --- |
| Express | 4.22.2 | 4.22.3 | PDS `^4.17.2`; PLC `^4.18.2` |
| body-parser | 1.20.6 | 1.20.8 | Express `~1.20.5` |
| qs | 6.15.3 | 6.16.0 | Updated Express/body-parser declare `~6.16.0` |
| `@grpc/grpc-js` | 1.14.4 | 1.14.5 | OTLP exporters `^1.14.3` |
| brace-expansion | 2.1.4 | 2.1.7 | minimatch `^2.0.2` |
| Nested brace-expansion under `@ts-morph/common` | 5.0.9 | 5.0.12 | nested minimatch `^5.0.8` |

Express also raises its path-to-regexp constraint from `~0.1.12` to `~0.1.13`.
The fixture already locked version 0.1.13, so that node did not change. Both
Express and body-parser's updated qs edges are part of their patch release
metadata. No overrides were added. The complete old/new metadata for all six
changed nodes is retained in `pds-patch-lock-diff.json`.

The old fixture lock SHA-256 is:

```text
227b88499a22dffc15fcdc4aed0f6ee81fcfc11531ee2e2c8de49c991175ee41
```

The new fixture lock SHA-256 is:

```text
762b412e3aa383b3e094bc1d2f6a0cc4389df7444ef0726f693cb026788b3dcd
```

Historical spike and initial performance captures remain immutable and refer to
the old graph. This is an in-place update of one fixture, not another installable
fixture tree. New reports must identify the new hash when using this graph.

## Validation and retained evidence

Validation used Node 26.10.0 and npm 11.19.1. Clean `npm ci --no-audit --no-fund`
ran in the root and fixture directory. A native in-memory SQLite open/close
smoke passed. `npm run build` passed before checks and tests.

The following then passed in sequence:

1. `node scripts/source-run.mjs --test tests/pds.test.ts tests/browser-sessions.test.ts tests/archive.test.ts`
   — 50 passed, none failed, skipped or cancelled. This covers actual PDS
   persistence, restart/crash recovery, compare-and-swap, retained browser trust
   and device work, and offline archive replay.
2. `npm run check` — TypeScript, formatting, layer and dependency checks passed.
3. `npm test` — 352 passed, none failed, skipped or cancelled, including the
   packed fresh-consumer and browser tests.
4. `node experiments/native-authority-probe.mjs` — nine checks passed against the
   changed fixture. The maintained repo/MST probe packages were installed under
   the existing ignored `.atseq-local/native-proof-probe` path; this is an isolated
   verifier experiment, not another PDS installation or runtime dependency.

The native probe verified sparse membership with the current mock-PLC key;
rejected wrong DID, path and key, truncated CAR and a tampered referenced block;
checked agreement with the full CAR reader; and authenticated an appended entry
and head from a native since diff. It also compiled the browser bundle without
Node imports. The retained membership proof is 566 bytes and diff is 916 bytes.
These are small three-record smoke fixtures, not evidence of large-tree partial
diff sufficiency, production identity currentness or browser verifier execution.
P1 still owns those broader obligations.

All new public evidence is under
[`experiments/post-spike-evidence/2026-10-01`](../experiments/post-spike-evidence/2026-10-01/):

- `pds-patch-audit-before.json`, `pds-patch-audit-after.json` and their corresponding
  capture metadata: complete audit responses, tools, timestamps, exit statuses and
  input/output hashes. Audit exits remain 1 because residual findings remain.
- `pds-patch-lock-diff.json`: exact changed nodes and before/after lock hashes.
- `pds-patch-validation.json`: actual command exits, test counts and output hashes.
  Full temporary test logs remain ignored under `experiments/generated/pds-patches`.
- `pds-patch-native-results.json`, `pds-patch-native-capture.json`,
  `pds-patch-native-proof.car` and `pds-patch-native-diff.car`: actual public probe
  results, proof bytes, source hash and exact verifier experiment dependency
  versions/integrities.

These files contain no account passwords, tokens, private keys or inherited
environment values. Correctness tests ran after P0 released its capture window;
other agents could run correctness work concurrently. This report makes no
performance comparison or timing claim.

## Remaining limitations and recommendation

Keep the narrow patches. Do not cross the declared OpenTelemetry SDK, Nodemailer
or PLC/Kysely compatibility ranges to reduce the remaining audit count. The audit
reports package presence and propagated findings; it does not establish exploit
reachability through this harness. The M1 assessment describes the affected
configuration conditions and why the mock/PostgreSQL PLC fixture does not meet
the Kysely advisory's MySQL condition.

MF2 separately owns deterministic telemetry isolation. This delivery does not
change the inherited child environment or the parent mock PLC. Both services
still bind to loopback, and the fixture deliberately disables SSRF protection and
rate limits and allows synthetic account registration. The local demo uses this
same fixture and remains suitable only for local synthetic test data. Production
provisioning, recovery custody and provider policies remain A2.

The root packaged dependency patch remains M0. This fixture-only update does not
claim to remediate or change the shipped Atseq runtime graph. Later reference PDS
upgrades should get their own bounded graph review and native protocol evidence.
