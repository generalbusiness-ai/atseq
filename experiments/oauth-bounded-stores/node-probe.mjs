import { runPublicHookCases } from './public-hooks.mjs';
try {
  console.log(JSON.stringify({ node: process.version, ...(await runPublicHookCases()) }, null, 2));
  process.exit(0);
} catch (error) {
  console.log(JSON.stringify({ failed: true, errorType: error?.name ?? 'unknown' }));
  process.exit(1);
}
