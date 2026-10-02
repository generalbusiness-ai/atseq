/** Compact authority DATA; no accepted-state or publication capability. */
import { canonicalJson } from '../core/values.ts';
import { ProtocolError } from '../core/errors.ts';
import {
  readCheckpointJson,
  deriveCheckpointIndexes,
  type CheckpointHistoryRow,
  type CheckpointThrough,
} from '../protocol/checkpoint-data.ts';
import { type NativeAnchor } from '../protocol/native-wire.ts';
import { readAuthorityData, type CompactAuthorityData } from './native-authority-data.ts';
import { readNativeAuthoritySnapshot } from './native-authority-snapshot.ts';
import type { NativeAuthoritySnapshot } from './native-authority.ts';
export type { CompactAuthorityData } from './native-authority-data.ts';
export async function readCheckpointAuthorityData(
  raw: Uint8Array,
  anchor: NativeAnchor,
  maximumBytes: number,
): Promise<CompactAuthorityData> {
  const data = await readAuthorityData(readCheckpointJson(raw, maximumBytes), anchor, true);
  if (data.frontier.position === 0) {
    // Expected plain genesis data, without invoking the accepted-state constructor.
    const expected: CompactAuthorityData = {
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
    const ascii = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
    expected.control.appointments.sort((a, b) =>
      ascii(JSON.stringify([a.principal, a.actorKey]), JSON.stringify([b.principal, b.actorKey])),
    );
    expected.roles.sort((a, b) => ascii(JSON.stringify([a.principal, a.role]), JSON.stringify([b.principal, b.role])));
    if (canonicalJson(data, 32 * 1024 * 1024, 32) !== canonicalJson(expected, 32 * 1024 * 1024, 32))
      throw new ProtocolError('envelope', 'Compact genesis authority differs from exact initialization');
  }
  return data;
}
/** Historical crosschecks only after complete asserted history coverage. Still returns DATA. */
export async function checkCheckpointAuthorityHistory(
  raw: Uint8Array,
  history: readonly CheckpointHistoryRow[],
  head: CheckpointThrough,
  anchor: NativeAnchor,
  maximumBytes: number,
): Promise<NativeAuthoritySnapshot> {
  const compact = await readCheckpointAuthorityData(raw, anchor, maximumBytes);
  if (
    head.position !== history.length ||
    (head.position === 0 ? head.entry !== anchor.cid : head.entry !== history.at(-1)?.entry) ||
    compact.frontier.position > head.position ||
    compact.frontier.entry !==
      (compact.frontier.position === 0 ? anchor.cid : history[compact.frontier.position - 1]?.entry)
  )
    throw new ProtocolError('envelope', 'Compact authority frontier differs from complete history');
  const indexes = deriveCheckpointIndexes(
    history,
    { app: anchor.genesis.app, genesis: anchor.cid },
    compact.frontier.position,
  );
  return readNativeAuthoritySnapshot({ ...compact, format: 'atseq-native-authority', ...indexes }, anchor);
}
