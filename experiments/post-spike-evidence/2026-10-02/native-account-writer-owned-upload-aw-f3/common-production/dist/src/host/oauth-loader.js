import { assertDependencies } from '../core/dependencies.js';
/** Internal enrolment/session entry only; main/CLI/verifier do not import this adapter. */
export async function loadNodeOAuthAdapter(options) {
    assertDependencies();
    const { nodeOAuthAdapter } = await import('./oauth-adapter.js');
    return nodeOAuthAdapter(options);
}
//# sourceMappingURL=oauth-loader.js.map