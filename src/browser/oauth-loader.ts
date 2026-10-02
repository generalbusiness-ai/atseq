import { assertDependencies } from '../core/dependencies.ts';
import type { BrowserOAuthOptions } from './oauth-adapter.ts';

/** Trusted credential shell entry, separate from the ordinary application display. */
export async function loadBrowserOAuthAdapter(options: BrowserOAuthOptions) {
  assertDependencies();
  const { browserOAuthAdapter } = await import('./oauth-adapter.ts');
  return browserOAuthAdapter(options);
}
