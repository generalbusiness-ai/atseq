import { resolve } from 'node:path';
import { buildShell } from '../src/host/build.ts';

await buildShell(resolve('dist/shell'));
