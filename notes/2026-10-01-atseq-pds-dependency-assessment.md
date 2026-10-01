# Disposable PDS dependency assessment — 2026-10-01

Status: assessment complete; proposed fixture maintenance needs independent review
and implementation. No dependency or harness changes are included.

Workroom scope: M1, request `3b0bab47`, assessed against main `cb3fd847`.

## Recommendation

Keep the existing locked PDS fixture as the identified source of the historical
spike and initial performance evidence. Maintain a separate, explicitly identified
current fixture baseline through narrow reviewed changes. Start with compatible
patches to Express/body-parser/qs, gRPC and the two brace-expansion copies. Do not
use an automatic whole-graph audit fix or override Nodemailer, Kysely or the
OpenTelemetry SDK across their declared compatibility ranges merely to make the
audit count disappear.

A separate small harness change should disable inherited telemetry explicitly.
The current child process inherits the developer's environment. Loopback listeners
limit inbound exposure, but they do not prevent an inherited telemetry endpoint
from receiving data. This also introduces avoidable variation into measurements.
Keep the fixture limited to synthetic local accounts and test data; its deliberately
disabled SSRF protection and rate limits are unsuitable for a deployed PDS.

These changes are maintenance of the reference fixture. They are separate from
M0's patch to the dependency bundled in the shipped Atseq package and from A2's
production provisioning and custody work.

## Retained audit and graph

`npm audit --json` ran in `tests/support/pds` at 14:13 UTC on 2026-10-01, using
Node 26.10.0 and npm 11.19.1. It exited 1 because it reported findings. This
worktree had no installed fixture dependencies: the observation concerns the
locked graph, rather than an assertion about a running service. No PDS was started.

The report contains **13 vulnerable package records: 10 high and 3 moderate**,
with 592 total dependency records. These are package-level counts, not 13
independent flaws. Ancestors such as `@atproto/pds` and the OpenTelemetry SDK
inherit findings from dependencies. A package may also have several advisories.

The fixture pins `@atproto/pds` 0.5.31, `@atproto/crypto` 0.5.4 and
`@did-plc/server` 0.0.1 in its own private package and lockfile. Root runtime
dependencies and the package's `files` list do not include this fixture.
Development setup installs it separately; tests, performance scripts and the
local demo import it. Production Atseq host code uses a supplied PDS URL rather
than importing this server. The independent root dependency finding remains M0.

Raw public evidence is retained in
[`experiments/post-spike-evidence/2026-10-01`](../experiments/post-spike-evidence/2026-10-01/):

- `pds-audit.json`: complete registry audit response.
- `pds-audit-capture.json`: command, timestamp, exit status, tools, source hashes
  and audit hash.
- `pds-audit-graph.json`: affected locked packages and relevant declared edges.
- `pds-audit-candidates.json`: registry metadata for candidate versions; availability
  and declared ranges do not prove behavioral compatibility.
- `pds-audit-source-inspection.json`: integrity-checked pinned registry tarballs,
  file hashes and source locations supporting configuration findings.

The evidence contains no account credentials, environment values or test secrets.
The lockfile and historical evidence are unchanged.

## Findings and feasible changes

| Locked component | Assessment and next step |
| --- | --- |
| Express 4.22.2, body-parser 1.20.6, qs 6.15.3 | Both parent packages inherit the qs findings. Existing `~6.15.1` ranges cannot select qs 6.16.0. Express 4.22.3 and body-parser 1.20.8 declare `~6.16.0`, and their patch versions fit the current parents' ranges. Review a targeted lock update to those three packages and its required closure. HTTP parser exposure is plausible; this assessment has not traced a specific exploit through the PDS routes. |
| `@grpc/grpc-js` 1.14.4 | Version 1.14.5 fits the locked OTLP exporters' `^1.14.3` ranges and fixes both reported gRPC advisories. The high advisory requires a server using `getAuthContext` for authentication with client certificates optional. The fixture configures an HTTP PDS, not that gRPC server. Its presence as an exporter dependency does not establish that precondition. |
| brace-expansion 2.1.4 and nested 5.0.9 | Patched 2.1.7 and 5.0.12 fit the respective minimatch ranges `^2.0.2` and `^5.0.8`. Both must be handled in this lockfile. The recursion and quadratic expansion advisories concern crafted brace patterns; no path from arbitrary PDS records to these build/file-pattern tools was demonstrated. |
| OpenTelemetry Jaeger propagator 2.8.0; SDK 0.219.0 | The Jaeger finding needs an active Jaeger propagator. Pinned SDK 0.219.0 requires Jaeger 2.8.0 exactly. SDK 0.220.0 uses patched Jaeger 2.9.0, but does not fit the ATproto wrapper's `^0.219.0` range. This is a coordinated SDK/wrapper change, not a compatible isolated patch. Disable fixture telemetry and retain the limitation until an upstream-compatible refresh is reviewed. |
| Nodemailer 6.10.1 | Multiple address parsing, message, transport and access-control advisories propagate to the PDS. The reported advisory set extends through 10.0.5; candidate 10.0.6 is outside the PDS's `^6.8.0` range. Do not force that major upgrade as a fixture-only override. The pinned PDS defaults to JSON transport when no email configuration is supplied, so SMTP/TLS advisories do not establish default SMTP exposure. Address parsing and JSON message normalization still exist; absence of SMTP does not remove every finding. |
| PLC's nested Kysely 0.23.5 | The advisory concerns MySQL string-literal escaping. The harness calls `Database.mock()`, which returns the in-memory mock; the pinned PLC server's real database path is PostgreSQL. This does not meet the stated MySQL condition. Patched 0.28.14 falls outside `^0.23.4`. The distributed PLC database file also includes bundled Kysely code, so overriding only the external dependency would not establish remediation of the distributed implementation. Retain this qualified fixture limitation and review an upstream server refresh when needed. |

Primary advisory sources:
[qs](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g),
[qs array limit](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx),
[gRPC certificate handling](https://github.com/advisories/GHSA-m9gg-hp2v-232j),
[gRPC error disclosure](https://github.com/advisories/GHSA-f596-whhp-79r4),
[brace expansion](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr),
[brace recursion](https://github.com/advisories/GHSA-qhr7-859c-m2p7),
[Jaeger](https://github.com/advisories/GHSA-45rx-2jwx-cxfr),
[Nodemailer parser](https://github.com/advisories/GHSA-v53p-9fqp-m79j),
[Nodemailer JSON transport](https://github.com/advisories/GHSA-wqvq-jvpq-h66f),
and [Kysely](https://github.com/advisories/GHSA-8cpq-38p9-67gx).
The raw audit retains every advisory URL, including the additional Nodemailer and
brace-expansion advisories.

## Actual fixture boundaries

`environment.mjs` and `pds-server.mjs` bind both official PDS and mock PLC listeners
to `127.0.0.1` on dynamically selected ports. The configuration points the PDS at
the local PLC, disables crawlers and points AppView/moderation at an unused local
port. It uses dev mode, `.test` handles, open registration, no rate limits and
disabled SSRF protection. Tests create synthetic `.test`/`example.test` accounts
with random passwords. This is local isolation, not a sandbox against malicious
local clients or other processes running as the same user.

PDS admin password, JWT secret and PLC rotation key are generated per fixture;
the configuration file is written with mode 0600. A marked `.atseq-local/pds-*`
directory holds state. Reset checks its real path, marker and recorded PDS process
before deleting it. Closing the demo intentionally retains marked data for
inspection. These protections limit accidental misuse and deletion; they do not
make the dependency graph safe for production or protect secrets from the owning
user. This assessment did not inspect actual generated secret files.

The child receives `{ ...process.env, LOG_ENABLED: 'false' }`. The pinned ATproto
telemetry wrapper enables its SDK when an OTLP endpoint is configured unless
`OTEL_SDK_DISABLED` is true. The ordinary default therefore does not enable the
Jaeger condition, but inherited configuration can enable telemetry. No environment
values were collected and no request was sent to test exploit reachability.

## Scoped followups and validation cost

Propose two separately reviewable implementation requests:

1. **Compatible fixture dependency patches.** Update only this fixture's lockfile
   for Express 4.22.3, body-parser 1.20.8, qs 6.16.0, gRPC 1.14.5 and
   brace-expansion 2.1.7/5.0.12, including narrowly necessary transitive changes.
   Retain before/after audits and inspect the exact graph diff. Run clean
   `npm ci --prefix tests/support/pds`, targeted PDS persistence/restart,
   browser-session and archive tests, then the required project checks and full
   test suite before exact-head review. Exercise native `getRepo(since)` evidence
   when P1 depends on the changed reference graph. This needs server startup,
   native SQLite installation and browser execution; schedule outside P0 captures.
   Every new performance/protocol report must identify the updated fixture lock
   hash. Do not overwrite the older capture or assert that residual findings are
   fixed.
2. **Deterministic fixture telemetry isolation.** Force `OTEL_SDK_DISABLED=true`
   for the child and make the parent mock PLC's telemetry boundary explicit.
   Determine whether the PLC imports any startup instrumentation before choosing
   the smallest change; do not mutate the parent process environment globally.
   Validate with deliberately inherited OTLP/Jaeger settings and a local fake
   collector, showing that no telemetry is emitted while account/repository
   operations still work. Use synthetic metadata only. This is a fixture behavior
   change and deserves its own exact-head review.

No new PDS test or exploit test ran for this assessment. Source inspection,
registry metadata and the retained locked-graph audit support these recommendations;
they do not certify execution reachability, patched behavior or production safety.
