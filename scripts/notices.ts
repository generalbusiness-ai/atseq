import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
const root = JSON.parse(await readFile('package.json', 'utf8')), seen = new Set<string>(), result: any[] = [];
async function visit(name: string, from = process.cwd()) {
  let directorySearch = resolve(from), path = '';
  for (;;) {
    const candidate = resolve(directorySearch, 'node_modules', name, 'package.json');
    try { await readFile(candidate); path = candidate; break; } catch {}
    const parent = dirname(directorySearch); if (parent === directorySearch) throw new Error(`Installed package missing: ${name}`); directorySearch = parent;
  }
  const pkg = JSON.parse(await readFile(path, 'utf8')), key = `${pkg.name}@${pkg.version}`; if (seen.has(key)) return; seen.add(key);
  const directory = dirname(path), files = (await readdir(directory)).filter(name => /^(licen[cs]e|copying|notice)([-_.]|$)/i.test(name));
  const texts = Object.fromEntries(await Promise.all(files.sort().map(async file => [file, await readFile(resolve(directory, file), 'utf8')])));
  if (!files.length) {
    if (!['@inlay/core', '@inlay/render'].includes(pkg.name)) {
      if (!pkg.license) throw new Error(`No license declaration for ${key}`);
      texts.NOTICE = `Published package ${key} declares ${pkg.license} and includes no standalone license text. Author: ${JSON.stringify(pkg.author ?? null)}. Repository: ${JSON.stringify(pkg.repository ?? null)}. This archive retains the published declaration; the runtime must be installed separately.`;
    } else {
    texts.NOTICE = `Upstream package ${key} includes no standalone license text. Author: ${pkg.author ?? 'Dan Abramov'}. Inlay declares MIT in its published source README at https://tangled.org/danabra.mov/inlay/blob/f6d4f5808e5a822ae98d330ee8efff866bab0346/README.md (License section). This archive preserves that declaration; it does not invent an upstream copyright notice.`;
    pkg.license = 'MIT (upstream declaration; standalone notice absent)';
    }
  }
  result.push({ name: pkg.name, version: pkg.version, license: pkg.license ?? 'See text', texts });
  for (const dependency of Object.keys(pkg.dependencies ?? {})) await visit(dependency, directory);
}
result.push({ name: root.name, version: root.version, license: root.license, texts: { LICENSE: await readFile('LICENSE', 'utf8') } });
for (const name of Object.keys(root.dependencies)) await visit(name);
await writeFile('src/archive/notices.json', JSON.stringify(result.sort((a,b) => a.name.localeCompare(b.name)), null, 2) + '\n');
console.log(`Retained ${result.length} installed runtime package notices.`);
