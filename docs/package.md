# Using Atseq as a package

Atseq provides portable library APIs, a JSON CLI and a Node host. The 0.1 API remains experimental. Its semantic contract CIDs are separate from its package version and source build.

## Build and install locally

From a prepared checkout:

```sh
npm run build
npm pack
```

Install the resulting `.tgz` in another project with `npm install /absolute/path/to/atseq-0.1.0.tgz`. No npm publication is required. The distribution includes compiled JavaScript, declarations, retained Lexicons, browser source for host builds, notices, the shrinkwrap lock and bundled runtime dependencies. Bundling preserves the reviewed dependency layout and bytes; ordinary hoisting or dependency replacement must not silently change interpretation. The host's Vite builder remains a runtime dependency.

The build uses TypeScript to emit JavaScript and declarations. Its small final step relocates the installation-metadata imports to the package root, removes TypeScript's copied root manifests from `dist`, makes the executables runnable, and verifies the installed runtime file closure. An emitted Inlay adapter bundles its pinned core and renderer together because the upstream renderer contains an extensionless generated import that native Node cannot load. The adapter preserves their shared element identity; its source, compiler, dependency metadata and output hashes are retained separately from semantic contract CIDs in `dist/build-provenance.json`. Application expressions are neither bundled nor rewritten.

## Public entry points

| Import              | APIs                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `atseq`             | Portable `protocol`, `runtime`, `application`, `client` and `archive` namespaces             |
| `atseq/protocol`    | Wire encoding/CIDs, invitation pins, signatures, log verification and supported profiles     |
| `atseq/runtime`     | Bounded evaluation/folding, profile and coded errors                                         |
| `atseq/application` | `Applications`, `Folder`, `SourceBundle`, loading and compatible changes                     |
| `atseq/client`      | `AtseqClient`, explicit identity/signing and browser `DeviceStore`                           |
| `atseq/archive`     | Export, import and replay of retained inputs                                                 |
| `atseq/host`        | Node-only PDS client, sequencer, application host, account provider and HTTP/build functions |

For example, in an installed Node project:

```js
import { supportedProfiles } from 'atseq/protocol';
import { evaluate } from 'atseq/runtime';
import { AtseqClient } from 'atseq/client';

console.log(await supportedProfiles());
console.log((await evaluate('state.count + 1', { state: { count: 1 } })).value);
const client = new AtseqClient('http://127.0.0.1:7777');
console.log(await client.call('list'));
```

Browser applications should use a bundler and portable entry points. `DeviceStore` needs IndexedDB; Node file signing belongs in the CLI. Imported archives supply retained data and require the installed trusted interpreter; they never install executable runtime code.

## Executables

`atseq` reads one JSON request on stdin and prints one JSON result. Use `atseq --help`, then [the interaction guide](interaction.md#json-cli-adapter) for identity, source packing, preview, creation, submit, queries and archive replay. Source checkout commands can still use `npm run atseq --`; an installed CLI uses ordinary Node and does not require `tsx`.

`atseq-host` connects to a PDS that permits local account provisioning:

```sh
atseq-host --pds http://127.0.0.1:2583 --directory /absolute/private/atseq-data
```

It restores retained app accounts, builds the shared browser shell and listens on loopback. It prints the host URL and private token file path. The data directory contains owner-readable credentials and writer keys. The default account suffix is `.test`; use `--handle-suffix` for a separately configured local PDS. Public PDS provisioning, deployment and distributed writer failover remain operator work. Library hosts can provide their own `AccountProvider`.

For the disposable demonstration PDS and sample source, run `npm run dev:app` from a checkout after `npm run setup`.
