# Disposable PDS startup: results

Date: 2026-10-02. Workroom task: T1-H2, request `099933250a7ffc33135f6a3330529e00e64e3623`, promise `27b130b095ccf3b15c4a3f014548f2a0b293a4e5`.

The test fixture now keeps its PDS port reserved until the real official PDS adopts the listening socket. This removes the gap that caused the Node 22 archive test to fail in [CI run 36961116196](https://github.com/generalbusiness-ai/atseq/actions/runs/36961116196). The original failure log is retained in the [evidence packet](../experiments/post-spike-evidence/2026-10-02/pds-startup-h2/initial-ci-node22.log). The observed error was `EADDRINUSE` on `127.0.0.1:39435`; the log reports 437 passing tests and one failure.

The earlier helper selected a port with a temporary listener, closed it, and started the real service later. Another process could acquire that port in between. Both the PLC and PDS used this pattern. PLC now binds port zero through its own real HTTP server and reports that server's actual port. PDS needs its actual port before constructing its advertised service URL, so the parent keeps a loopback `net.Server` listening, sends that server through the existing child IPC channel, and lets the official PDS's Express HTTP server adopt it. The parent closes its copy only after the child reports readiness. The child leaves the adopted handle under the HTTP server's ownership.

This uses Node's documented [server-handle IPC API](https://nodejs.org/api/child_process.html#example-sending-a-server-object) and [listener adoption API](https://nodejs.org/api/net.html#serverlistenhandle-backlog-callback). It uses the maintained PDS and PLC application listeners and returned server objects; no library implementation is patched. The source inspection records exact installed library hashes. The existing 30-second startup deadline remains. There is one startup attempt: socket, process, storage and configuration failures escape. Cleanup releases the parent reservation and terminates a still-running failed child. An occupied restart port is refused before spawning; an explicit restart retains the original URL.

## Verification

The final runtime and test source is `5e8c773e` and the standalone reproduction producer is `9b83287d`; the manifest records full commit IDs and exact file hashes. The four test files `pds-startup`, `archive`, `pds` and `pds-telemetry` passed all 42 cases on each of Node 22.19.0, Node 24.21.0 and Node 26.10.0. These are real official PDS 0.5.31 services, SQLite databases and local PLC 0.0.1 services.

The four new regression cases demonstrate:

- A competing actual listener receives `EADDRINUSE` while each initial port is held, and again exactly when the parent releases the transferred PDS listener. Account creation and its PLC service endpoint succeed.
- Six official PDS instances start concurrently, use distinct ports, create six distinct accounts and publish the correct service endpoint through their real PLC services.
- A process crash followed by occupation of the original port causes an immediate, precise restart refusal. No child is spawned and no alternative URL is selected. Releasing that port permits an explicit restart at the original URL.
- Replacing the actual SQLite data directory with a file causes one genuine child startup failure. Restoring the directory permits an explicit restart at the same port; the failed attempt did not retain the reservation.

The existing PDS regression retains 113 entries and passes its 23 checks, including crash recovery, conditional writes and competing writers. Archive replay and the inherited telemetry tests also pass. Fresh build and repository checks pass.

The [standalone experiment](../experiments/pds-startup-h2/reproduce-port-race.mjs) provides a direct control. It reconstructs the exact original fixture from main `098d3dffb04998d43eb51bb3ab6b9f38cce03b20`, binds a real competing socket at the original release gap and observes the official PDS fail with `EADDRINUSE`. The same intervention against the fixed fixture is refused after the parent's handoff, and the real PDS serves HTTP 200. This control passed on all three Node versions; each raw log includes the original child error. Run it with `node experiments/pds-startup-h2/reproduce-port-race.mjs` after installing the isolated PDS graph for that Node version.

## Preparation and remaining scope

The evidence retains the original CI failure and all local preparation captures. The first exploratory draft incorrectly closed the child's handle after adoption, yielding `ECONNREFUSED`; a transcribed observation and the erroneous child draft are retained because that first shell command did not save a raw log. The corrected HTTP and restart probe passed. A Node 22 preparation run failed because the copied SQLite binary had the Node 26 ABI. Rebuilding that isolated native test dependency for the matching Node version resolved it; package versions and lock files are unchanged. One strengthened test initially probed PLC shutdown as well as PDS handoff and failed after cleanup; restricting that probe to the parent's reservation socket corrected the test. These failures are separate from the original CI race and remain visible in the packet.

The three-version runs were on macOS. Linux CI verification follows independent review and landing; no Linux or Windows pass is claimed here. The fixture changes no production code, dependencies, authority, protocol, exports or runtime profiles. This completes the narrow startup repair subject to independent review; it does not complete the wider T1 programme or native identity and performance work.
