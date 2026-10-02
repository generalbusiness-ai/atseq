import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { atomicFile, readJson } from './files.js';
import { PdsClient, PdsError } from './pds.js';
/** Local provisioning helper. Passwords stay in owner-readable files, never in app source. */
export class LocalAccounts {
    url;
    directory;
    handleSuffix;
    constructor(url, directory, handleSuffix = '.test') {
        this.url = url;
        this.directory = directory;
        this.handleSuffix = handleSuffix;
        new PdsClient(url, 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa', ''); // Apply the transport origin policy.
    }
    async open(id) {
        if (!/^[a-f0-9-]{36}$/.test(id))
            throw new Error('Invalid creation ID');
        const path = join(this.directory, id, 'account-secret.json');
        let credentials = await readJson(path);
        if (!credentials) {
            credentials = {
                handle: `a${randomBytes(8).toString('hex')}${this.handleSuffix}`,
                password: randomBytes(32).toString('hex'),
            };
            // Persist the account identity before calling the PDS. A lost reply can log
            // back in to that same account instead of allocating a second application.
            await atomicFile(path, JSON.stringify(credentials));
        }
        const call = (method, body) => PdsClient.account(this.url, method, body);
        try {
            return await call('com.atproto.server.createSession', {
                identifier: credentials.handle,
                password: credentials.password,
            });
        }
        catch (error) {
            if (!(error instanceof PdsError) || !['AuthenticationRequired', 'InvalidIdentifier'].includes(error.code))
                throw error;
        }
        try {
            return await call('com.atproto.server.createAccount', { ...credentials, email: `${id}@example.test` });
        }
        catch (error) {
            try {
                return await call('com.atproto.server.createSession', {
                    identifier: credentials.handle,
                    password: credentials.password,
                });
            }
            catch {
                throw error;
            }
        }
    }
}
//# sourceMappingURL=accounts.js.map