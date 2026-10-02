import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = resolve('.');
const source = join(root, '.atseq-local/writer-compiled-final-16f-node26/tests/native-account-writer-browser.test.js');
const output = join(root, '.atseq-local/writer-compiled-final-16f-node26/tests/native-account-writer-browser-persistent.test.js');
const evidence = join(root, 'experiments/post-spike-evidence/2026-10-02/native-account-writer-aw-f2/final');
const original = await readFile(source);
let text = original.toString();
const start = '    const browser = await chromium.launch();\n    const context = await browser.newContext();\n    await context.route';
assert.equal(text.split(start).length, 2);
text = text.replace(start, '    const profile = resolve(".atseq-local/native-writer-profile-reopen-16f");\n    let context = await chromium.launchPersistentContext(profile);\n    let browser = context.browser();\n    const attachRoutes = async () => { await context.route');
const end = '    });\n    const page = await context.newPage();';
assert.equal(text.split(end).length, 2);
text = text.replace(end, '    }); };\n    await attachRoutes();\n    let page = await context.newPage();');
const reload = '        await page.reload();';
assert.equal(text.split(reload).length, 3);
const index = text.lastIndexOf(reload);
text = text.slice(0, index) + '        await context.close();\n        context = await chromium.launchPersistentContext(profile);\n        browser = context.browser();\n        await attachRoutes();\n        page = await context.newPage();' + text.slice(index + reload.length);
text = text.replace('reloadLive: true,', 'reloadLive: true,\n                actualPersistentContextClosedAndReopened: true,');
text = text.replace('Chromium native writer uses maintained browser OAuth and actual guarded fetch with bounded custody', 'Chromium persistent context close/reopen preserves native overflow live custody and reauthorization');
await writeFile(output, text);
await writeFile(join(evidence, 'persistent-browser-executable-16f-node26.js'), text);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
await writeFile(join(evidence, 'persistent-browser-wrapper-pins-16f-node26.json'), JSON.stringify({
  sourceProducer: '16f36988179a0ccacf1189eeb7b2b0e3453d6836', runtime: process.version,
  originalCompiledWrapper: source, originalCompiledWrapperSHA256: hash(original),
  actualWrapper: output, actualWrapperSHA256: hash(text),
  generator: fileURLToPath(import.meta.url), generatorSHA256: hash(await readFile(fileURLToPath(import.meta.url))),
  compiledInputs: '.atseq-local/writer-compiled-final-16f-node26/compiled-pins.json',
  preparedBeforeExecution: new Date().toISOString(),
  scope: 'Test-only wrapper transformation: persistent browser profile, close/reopen actual context at the second reload, reattach synthetic fixture routes. All production modules and test browser probe remain unchanged emitted16f. Dedicated browser bundle pins are captured before browser execution.',
}, null, 2) + '\n');
