import { cp, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';

/** Build from owned copies so parallel browser tests keep their checkout's dist. */
export async function preparePackageBuild(root: string, directory: string) {
  await mkdir(directory);
  for (const path of [
    'package.json',
    'npm-shrinkwrap.json',
    'tsconfig.json',
    'tsconfig.build.json',
    'scripts',
    'src',
    'lexicons',
    'docs',
    'README.md',
    'CONTRIBUTING.md',
    'LICENSE',
    'node_modules',
  ])
    await cp(join(root, path), join(directory, path), {
      recursive: true,
      // Runtime integrity rejects package aliases. Copies also keep the build's
      // writes independent; relative .bin links must resolve inside this stage.
      verbatimSymlinks: true,
      mode: constants.COPYFILE_FICLONE,
    });
  return directory;
}
