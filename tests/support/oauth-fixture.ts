import type { OAuthAdapterOptions } from '../../src/protocol/oauth.ts';

export const OAUTH_DID = 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa';
export const OAUTH_OTHER_DID = 'did:plc:bbbbbbbbbbbbbbbbbbbbbbbb';
export const OAUTH_PDS = 'https://pds.atseq-probe.net';
export const OAUTH_ISSUER = 'https://auth.atseq-probe.net';
export const OAUTH_CUSTODY = 'https://custody.atseq-probe.net';
export const OAUTH_SCOPE = 'atproto repo:ai.generalbusiness.atseq.grant?action=create';
export const oauthMetadata: OAuthAdapterOptions['metadata'] = {
  client_id: OAUTH_CUSTODY + '/oauth.json',
  application_type: 'web',
  redirect_uris: [OAUTH_CUSTODY + '/callback'],
  response_types: ['code'],
  grant_types: ['authorization_code', 'refresh_token'],
  token_endpoint_auth_method: 'none',
  dpop_bound_access_tokens: true,
  scope: OAUTH_SCOPE,
};
const json = (value: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
/** Synthetic AS/PDS, never a provider. No real account or credential is used. */
export class OAuthFixture {
  readonly calls: string[] = [];
  readonly states: string[] = [];
  readonly nonces = new Set<string>();
  tokenDid = OAUTH_DID;
  tokenScope = OAUTH_SCOPE;
  pds = OAUTH_PDS;
  issuer = OAUTH_ISSUER;
  invalidTokenOnce = false;
  redirectResource = false;
  tokenEndpoint = OAUTH_ISSUER + '/token';
  issuerSupport = true;
  challenge = false;
  refuse = '';
  resourceBytes = 0;
  tokenPadding = 0;
  #rotation = 0;
  readonly fetch: typeof globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url),
      path = url.pathname;
    this.calls.push(url.origin + path);
    if (request.redirect !== 'error' || request.credentials !== 'omit' || request.cache !== 'no-store')
      throw new Error('Fixture observed an unguarded request');
    if (path === '/bulk') return new Response(new Uint8Array(this.resourceBytes));
    if (path === this.refuse) return json({ error: 'access_denied' }, 400);
    if (url.hostname === 'identity.atseq-probe.net') return json({ did: decodeURIComponent(path.slice(1)) });
    if (path === '/.well-known/oauth-protected-resource')
      return json({ resource: OAUTH_PDS, authorization_servers: [this.issuer] });
    if (path.startsWith('/.well-known/oauth-authorization-server'))
      return json({
        issuer: this.issuer,
        authorization_endpoint: OAUTH_ISSUER + '/authorize',
        token_endpoint: this.tokenEndpoint,
        pushed_authorization_request_endpoint: OAUTH_ISSUER + '/par',
        revocation_endpoint: OAUTH_ISSUER + '/revoke',
        response_types_supported: ['code'],
        response_modes_supported: ['query', 'fragment'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        token_endpoint_auth_methods_supported: ['none'],
        dpop_signing_alg_values_supported: ['ES256'],
        code_challenge_methods_supported: ['S256'],
        authorization_response_iss_parameter_supported: this.issuerSupport,
        client_id_metadata_document_supported: true,
        require_pushed_authorization_requests: true,
        protected_resources: [OAUTH_PDS],
        scopes_supported: OAUTH_SCOPE.split(' '),
      });
    const form = new URLSearchParams(request.body ? await request.text() : '');
    const stage = path === '/token' ? form.get('grant_type')! : path;
    if (this.challenge && !this.nonces.has(stage)) {
      this.nonces.add(stage);
      return json({ error: 'use_dpop_nonce' }, path.startsWith('/xrpc/') ? 401 : 400, {
        'dpop-nonce': 'synthetic-nonce-' + this.nonces.size,
        'www-authenticate': 'DPoP error="use_dpop_nonce"',
      });
    }
    if (path === '/par') {
      if (!form.get('state') || !form.get('code_challenge') || form.get('code_challenge_method') !== 'S256')
        throw new Error('Fixture expected maintained PAR/PKCE');
      this.states.push(form.get('state')!);
      return json(
        { request_uri: 'urn:ietf:params:oauth:request_uri:synthetic-' + this.states.length, expires_in: 90 },
        201,
      );
    }
    if (path === '/token')
      return json({
        access_token: 'synthetic-access-' + ++this.#rotation + 'a'.repeat(this.tokenPadding),
        refresh_token: 'synthetic-refresh-' + this.#rotation,
        token_type: 'DPoP',
        scope: this.tokenScope,
        expires_in: 3600,
        sub: this.tokenDid,
      });
    if (path === '/revoke') return new Response(null, { status: 200 });
    if (path.startsWith('/xrpc/')) {
      if (this.redirectResource)
        return new Response(null, { status: 302, headers: { location: OAUTH_ISSUER + '/redirect-target' } });
      if (this.invalidTokenOnce) {
        this.invalidTokenOnce = false;
        return json({ error: 'invalid_token' }, 401, { 'www-authenticate': 'DPoP error="invalid_token"' });
      }
      if (!request.headers.get('authorization')?.startsWith('DPoP synthetic-access-') || !request.headers.get('dpop'))
        throw new Error('Fixture expected maintained DPoP resource request');
      return this.resourceBytes ? new Response(new Uint8Array(this.resourceBytes)) : json({ accepted: true });
    }
    throw new Error('Unknown synthetic endpoint');
  };
  readonly resolveIdentity: OAuthAdapterOptions['resolveIdentity'] = async (identifier, { fetch, signal }) => {
    const response = await fetch('https://identity.atseq-probe.net/' + encodeURIComponent(identifier), { signal });
    const { did } = await response.json();
    return {
      did,
      handle: 'handle.invalid',
      didDoc: {
        id: did,
        service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: this.pds }],
      },
    };
  };
  options(): OAuthAdapterOptions {
    return { metadata: oauthMetadata, resolveIdentity: this.resolveIdentity };
  }
  callback() {
    return new URLSearchParams({ iss: this.issuer, state: this.states.at(-1)!, code: 'synthetic-code' });
  }
  count(path: string) {
    return this.calls.filter((call) => new URL(call).pathname === path).length;
  }
}
