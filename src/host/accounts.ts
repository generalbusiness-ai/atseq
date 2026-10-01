import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { atomicFile, readJson } from './files.ts';
import { PdsClient, PdsError } from './pds.ts';

export interface AccountProvider {
  open(creationId: string): Promise<PdsClient>;
}
/** Local provisioning helper. Passwords stay in owner-readable files, never in app source. */
export class LocalAccounts implements AccountProvider {
  constructor(
    private readonly url: string,
    private readonly directory: string,
    private readonly handleSuffix = '.test',
  ) {
    new PdsClient(url, 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa', ''); // Apply the transport origin policy.
  }
  async open(id: string): Promise<PdsClient> {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Invalid creation ID');
    const path = join(this.directory, id, 'account-secret.json');
    let credentials = await readJson<{ handle: string; password: string }>(path);
    if (!credentials) {
      credentials = {
        handle: `a${randomBytes(8).toString('hex')}${this.handleSuffix}`,
        password: randomBytes(32).toString('hex'),
      };
      // Persist the account identity before calling the PDS. A lost reply can log
      // back in to that same account instead of allocating a second application.
      await atomicFile(path, JSON.stringify(credentials));
    }
    const call = (
      method: 'com.atproto.server.createSession' | 'com.atproto.server.createAccount',
      body: Record<string, unknown>,
    ) => PdsClient.account(this.url, method, body);
    try {
      return await call('com.atproto.server.createSession', {
        identifier: credentials.handle,
        password: credentials.password,
      });
    } catch (error) {
      if (!(error instanceof PdsError) || !['AuthenticationRequired', 'InvalidIdentifier'].includes(error.code))
        throw error;
    }
    try {
      return await call('com.atproto.server.createAccount', { ...credentials, email: `${id}@example.test` });
    } catch (error) {
      try {
        return await call('com.atproto.server.createSession', {
          identifier: credentials.handle,
          password: credentials.password,
        });
      } catch {
        throw error;
      }
    }
  }
}
