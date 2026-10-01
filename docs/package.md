# Using Atseq as a package

Atseq provides portable library APIs, a JSON CLI and a Node host. The 0.1 API remains experimental. Its semantic contract CIDs are separate from its package version and source build.

## Build and install locally

From a prepared checkout:

```sh
npm run build
npm pack
```

Install the resulting `.tgz` in another project with `npm install /absolute/path/to/atseq-0.1.0.tgz`. No npm publication is required. The distribution includes compiled JavaScript, declarations, retained Lexicons, a prebuilt browser shell, notices, the shrinkwrap lock and bundled semantic runtime dependencies. Bundling preserves the reviewed dependency layout and bytes; ordinary hoisting or dependency replacement must not silently change interpretation. Vite and its native build tools are development dependencies and are absent from the installed host.

The package targets Node 22.13 or newer on macOS and Linux, with x64 or arm64 CPUs. Packing on one of these platforms produces portable JavaScript and browser assets for the others; the distribution needs no packing-platform native binding. CI covers Node 22.13, 24 and 26 on Linux. The consumer test also removes shell build tools and native bindings before importing the host and starting it. Windows has not been validated.

The build uses TypeScript to emit JavaScript and declarations. Its final steps relocate the installation-metadata imports to the package root, remove TypeScript's copied root manifests from `dist`, make the executables runnable, verify the installed runtime file closure and compile the browser shell. The installed host checks every shell asset against its shipped SHA-256 manifest before copying it into the serving directory. Source-checkout development still builds with Vite.

An emitted Inlay adapter bundles its pinned core and renderer together because the upstream renderer contains an extensionless generated import that native Node cannot load. The adapter preserves their shared element identity. The packed-consumer test runs the same authored view, runtime and activation conformance cases against the installed compiled modules, including hostile views, missing bindings and view-dependent activation outcomes. It retains the cases, their source hashes and the adapter/package hashes in `experiments/generated/package-conformance.json`. Source, compiler, dependency metadata and output hashes remain separate from semantic contract CIDs in `dist/build-provenance.json`. Application expressions are neither bundled nor rewritten. Removing Vite from runtime reduces the package size; the remaining upstream Inlay dependency closure still includes developer tools such as Prettier and ts-morph.

The retained [Node 22.13 capture](../experiments/adoption-g/compiled-node22.json) and [Node 26 capture](../experiments/adoption-g/compiled-node26.json) each contain 145 passing cases against the compiled adapter. They name the measured source revision and hashes; later documentation changes do not claim the same tarball hash.

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

It restores retained app accounts, verifies and installs the shipped browser shell, and listens on loopback. It prints the host URL and private token file path. The data directory contains owner-readable credentials and writer keys. The default account suffix is `.test`; use `--handle-suffix` for a separately configured local PDS. Public PDS provisioning, deployment and distributed writer failover remain operator work. Library hosts can provide their own `AccountProvider`.

For the disposable demonstration PDS and sample source, run `npm run dev:app` from a checkout after `npm run setup`.
