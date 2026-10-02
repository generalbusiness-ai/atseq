import { assertDependencies } from '../core/dependencies.ts';
import type { OAuthAdapterOptions } from '../protocol/oauth.ts';

/** Internal enrolment/session entry only; main/CLI/verifier do not import this adapter. */
export async function loadNodeOAuthAdapter(options: OAuthAdapterOptions) {
  assertDependencies();
  const { nodeOAuthAdapter } = await import('./oauth-adapter.ts');
  return nodeOAuthAdapter(options);
}
