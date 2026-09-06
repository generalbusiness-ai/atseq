import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';

const goRoot = execFileSync('go', ['env', 'GOROOT'], { encoding: 'utf8' }).trim();
const wasm = await readFile('experiments/generated/jsonataddl.wasm');
const shim = await readFile(`${goRoot}/lib/wasm/wasm_exec.js`);
const html = `<script src="/wasm_exec.js"></script><script>
window.probe={logs:[],errors:[]};
console.log=(...xs)=>window.probe.logs.push(xs.join(' '));
console.error=(...xs)=>window.probe.errors.push(xs.join(' '));
(async()=>{const started=performance.now();try {
  const go=new Go();go.exit=(code)=>window.probe.exit=code;
  const {instance}=await WebAssembly.instantiateStreaming(fetch('/probe.wasm'),go.importObject);
  await go.run(instance);
} catch(e) {window.probe.errors.push(String(e));}
window.probe.ms=performance.now()-started;window.probe.done=true;})();
</script>`;
const server = createServer((req, res) => {
  const body = req.url === '/probe.wasm' ? wasm : req.url === '/wasm_exec.js' ? shim : html;
  res.setHeader('Content-Type', req.url === '/probe.wasm' ? 'application/wasm' : req.url === '/wasm_exec.js' ? 'text/javascript' : 'text/html');
  res.end(body);
});
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const address = server.address() as { port: number };
  await page.goto(`http://127.0.0.1:${address.port}`);
  await page.waitForFunction(() => (window as any).probe.done, undefined, { timeout: 45_000 });
  const result = await page.evaluate(() => (window as any).probe);
  result.bytes = wasm.length;
  result.browser = browser.version();
  console.log(JSON.stringify(result, null, 2));
  await writeFile('experiments/generated/go-browser.json', JSON.stringify(result, null, 2) + '\n');
} finally { await browser.close(); server.close(); }
