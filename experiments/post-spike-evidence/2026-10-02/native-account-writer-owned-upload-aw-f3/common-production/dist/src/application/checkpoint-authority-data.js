/** Compact authority DATA; no accepted-state or publication capability. */
import { canonicalJson } from '../core/values.js';
import { ProtocolError } from '../core/errors.js';
import { readCheckpointJson, deriveCheckpointIndexes, } from '../protocol/checkpoint-data.js';
import {} from '../protocol/native-wire.js';
import { readAuthorityData } from './native-authority-data.js';
import { readNativeAuthoritySnapshot } from './native-authority-snapshot.js';
export async function readCheckpointAuthorityData(raw, anchor, maximumBytes) {
    const data = await readAuthorityData(readCheckpointJson(raw, maximumBytes), anchor, true);
    if (data.frontier.position === 0) {
        // Expected plain genesis data, without invoking the accepted-state constructor.
        const expected = {
            format: 'atseq-checkpoint-authority',
            version: 1,
            app: anchor.genesis.app,
            genesis: anchor.cid,
            activeDefinition: anchor.genesis.definition.$link,
            frontier: { position: 0, entry: anchor.cid },
            control: {
                tip: anchor.cid,
                appointments: structuredClone(anchor.genesis.control),
                owner: anchor.genesis.owner,
                recoverGovernance: anchor.genesis.recoverGovernance,
            },
            roles: anchor.genesis.roles.map((row) => ({ ...row, enabled: true, revision: anchor.cid })),
            principals: [],
            grants: [],
        };
        const ascii = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
        expected.control.appointments.sort((a, b) => ascii(JSON.stringify([a.principal, a.actorKey]), JSON.stringify([b.principal, b.actorKey])));
        expected.roles.sort((a, b) => ascii(JSON.stringify([a.principal, a.role]), JSON.stringify([b.principal, b.role])));
        if (canonicalJson(data, 32 * 1024 * 1024, 32) !== canonicalJson(expected, 32 * 1024 * 1024, 32))
            throw new ProtocolError('envelope', 'Compact genesis authority differs from exact initialization');
    }
    return data;
}
/** Historical crosschecks only after complete asserted history coverage. Still returns DATA. */
export async function checkCheckpointAuthorityHistory(raw, history, head, anchor, maximumBytes) {
    const compact = await readCheckpointAuthorityData(raw, anchor, maximumBytes);
    if (head.position !== history.length ||
        (head.position === 0 ? head.entry !== anchor.cid : head.entry !== history.at(-1)?.entry) ||
        compact.frontier.position > head.position ||
        compact.frontier.entry !==
            (compact.frontier.position === 0 ? anchor.cid : history[compact.frontier.position - 1]?.entry))
        throw new ProtocolError('envelope', 'Compact authority frontier differs from complete history');
    const indexes = deriveCheckpointIndexes(history, { app: anchor.genesis.app, genesis: anchor.cid }, compact.frontier.position);
    return readNativeAuthoritySnapshot({ ...compact, format: 'atseq-native-authority', ...indexes }, anchor);
}
//# sourceMappingURL=checkpoint-authority-data.js.map