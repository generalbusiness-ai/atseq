import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { builtinModules } from 'node:module';
import { execFileSync } from 'node:child_process';
import approved from '../core/dependencies-approved.json';
import files from './files-approved.json';
import { InterpretationError } from '../core/errors.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const integrityEnvironment = 'node';
let verified = false;
function fail(message: string): never {
  throw new InterpretationError('dependency_mismatch', message);
}
export function installedTree(path: string, installationRoot = root): Record<string, string> {
  const tree: Record<string, string> = {};
  function walk(directory: string, prefix = '') {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === 'node_modules') {
        // Only package-root dependency directories are reviewed separately.
        // A directory below dist/, lib/, etc. changes resolution for those files.
        if (!entry.isDirectory()) fail(`Unapproved dependency directory: ${path}/${prefix}/node_modules`);
        if (!prefix) continue;
        // Pino publishes this test fixture directory in its npm tarball. Its
        // complete contents are hashed too; adding a shadow package changes them.
        if (path !== 'node_modules/pino' || prefix !== 'test/fixtures/eval')
          fail(`Unapproved dependency directory: ${path}/${prefix}/node_modules`);
      }
      const name = prefix ? `${prefix}/${entry.name}` : entry.name;
      const file = join(directory, entry.name);
      if (entry.isDirectory()) walk(file, name);
      else if (entry.isFile()) tree[name] = createHash('sha256').update(readFileSync(file)).digest('hex');
      else fail(`Unsupported dependency file: ${path}/${name}`);
    }
  }
  walk(resolve(installationRoot, path));
  return tree;
}
export function resolvedPackage(parent: string, name: string, installationRoot = root): string | undefined {
  let base = parent;
  for (;;) {
    const candidate = `${base ? `${base}/` : ''}node_modules/${name}`;
    if (existsSync(resolve(installationRoot, candidate, 'package.json'))) {
      if (realpathSync(resolve(installationRoot, candidate)) !== resolve(installationRoot, candidate))
        fail(`Dependency alias: ${candidate}`);
      return candidate;
    }
    if (!base) return;
    const next = dirname(base);
    base = next === '.' ? '' : next;
  }
}
function nestedPackages(directory: string, installationRoot = root): string[] {
  if (!existsSync(resolve(installationRoot, directory))) return [];
  const found: string[] = [];
  for (const name of readdirSync(resolve(installationRoot, directory))) {
    if (name.startsWith('.')) continue;
    const path = `${directory}/${name}`;
    if (name.startsWith('@')) {
      for (const child of readdirSync(resolve(installationRoot, path))) found.push(`${path}/${child}`);
    } else found.push(path);
  }
  return found.filter((path) => existsSync(resolve(installationRoot, path, 'package.json')));
}
function checkInstalledDependencies(force = false, installationRoot = root): void {
  installationRoot = realpathSync(installationRoot);
  if (verified && !force && installationRoot === root) return;
  const packages = new Set(Object.keys(approved.packages));
  function sourceDirectories(directory: string): void {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'package.json') fail(`Source package scope: ${directory}/package.json`);
      if (entry.name === 'node_modules') fail(`Source dependency shadow: ${directory}/node_modules`);
      if (entry.isDirectory()) sourceDirectories(join(directory, entry.name));
      else if (!entry.isFile()) fail(`Source alias or special file: ${directory}/${entry.name}`);
    }
  }
  sourceDirectories(resolve(installationRoot, 'src'));
  const manifest = JSON.parse(readFileSync(resolve(installationRoot, 'package.json'), 'utf8'));
  if (JSON.stringify(manifest.imports) !== JSON.stringify(approved.imports))
    fail('Unapproved integrity adapter imports');
  const edges: { parent: string; name: string; target: string }[] = [];
  for (const path of packages) {
    const actual = JSON.parse(readFileSync(resolve(installationRoot, path, 'package.json'), 'utf8'));
    const expected = (files as Record<string, Record<string, string>>)[path];
    if (!expected) fail(`No reviewed file closure: ${path}`);
    const tree = installedTree(path, installationRoot);
    if (
      Object.keys(tree).length !== Object.keys(expected).length ||
      Object.entries(tree).some(([name, hash]) => expected[name] !== hash)
    )
      fail(`Dependency file bytes differ: ${path}`);
    for (const nested of nestedPackages(`${path}/node_modules`, installationRoot))
      if (!packages.has(nested)) fail(`Unlisted nested dependency: ${nested}`);
    for (const name of Object.keys(actual.dependencies ?? {})) {
      const target = resolvedPackage(path, name, installationRoot);
      if (!target || !packages.has(target)) fail(`Unapproved resolved dependency: ${path} -> ${name}`);
      edges.push({ parent: path, name, target });
    }
    for (const name of [
      ...Object.keys(actual.optionalDependencies ?? {}),
      ...Object.keys(actual.peerDependencies ?? {}),
    ]) {
      const target = resolvedPackage(path, name, installationRoot);
      if (target && !packages.has(target)) fail(`Unapproved resolved optional/peer dependency: ${path} -> ${name}`);
      if (target) edges.push({ parent: path, name, target });
    }
  }
  for (const name of Object.keys(approved.direct)) {
    const target = resolvedPackage('', name, installationRoot);
    if (!target || !packages.has(target)) fail(`Unapproved direct resolution: ${name}`);
    edges.push({ parent: '', name, target });
  }
  // Use Node's own import and require resolution, including exports conditions.
  const script = `import {createRequire} from 'node:module';import {readFileSync,realpathSync} from 'node:fs';
    const edges=JSON.parse(readFileSync(0,'utf8'));const out=edges.map(e=>{
      const results=[];for(const mode of ['import','require'])try{
        const resolved=mode==='import'?import.meta.resolve(e.name,e.parent):createRequire(e.parent).resolve(e.name);
        if (resolved.startsWith('node:') || (mode==='require' && !resolved.includes('/'))) results.push('node:'+e.name);
        else results.push(realpathSync(mode==='import'?new URL(resolved):resolved));
      }catch(error){if(error.code!=='ERR_PACKAGE_PATH_NOT_EXPORTED'&&error.code!=='MODULE_NOT_FOUND'&&error.code!=='ERR_MODULE_NOT_FOUND')throw error;}
      return results;});process.stdout.write(JSON.stringify(out));`;
  const resolutions = JSON.parse(
    execFileSync(process.execPath, ['--experimental-import-meta-resolve', '--input-type=module', '-e', script], {
      input: JSON.stringify(
        edges.map((edge) => ({
          ...edge,
          parent: pathToFileURL(resolve(installationRoot, edge.parent, 'package.json')).href,
        })),
      ),
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
    }),
  ) as string[][];
  for (const [index, edge] of edges.entries()) {
    const expected = resolve(installationRoot, edge.target) + '/';
    if (
      !resolutions[index]?.length ||
      resolutions[index]!.some(
        (path) => !path.startsWith(expected) && !(builtinModules.includes(edge.name) && path === 'node:' + edge.name),
      )
    )
      fail(`Node resolves outside approved package: ${edge.parent} -> ${edge.name}`);
  }
  if (installationRoot === root) verified = true;
}

export function verifyInstalledDependencies(force = false, installationRoot = root): void {
  try {
    checkInstalledDependencies(force, installationRoot);
  } catch (error) {
    if (error instanceof InterpretationError) throw error;
    fail(`Installed dependency check failed: ${error instanceof Error ? error.message : 'unavailable files'}`);
  }
}
