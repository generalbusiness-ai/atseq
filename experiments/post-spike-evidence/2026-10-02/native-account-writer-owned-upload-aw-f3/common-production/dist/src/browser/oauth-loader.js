import { assertDependencies } from '../core/dependencies.js';
/** Trusted credential shell entry, separate from the ordinary application display. */
export async function loadBrowserOAuthAdapter(options) {
    assertDependencies();
    const { browserOAuthAdapter } = await import('./oauth-adapter.js');
    return browserOAuthAdapter(options);
}
//# sourceMappingURL=oauth-loader.js.map