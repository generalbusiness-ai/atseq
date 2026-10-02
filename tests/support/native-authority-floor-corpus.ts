import { AtseqError } from '../../src/core/errors.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { NativeAnchor, type NativeGenesis } from '../../src/protocol/native-wire.ts';
import { readNativeAuthoritySnapshot } from '../../src/application/native-authority-snapshot.ts';
import { readAuthorityData, type NativeAuthoritySnapshot } from '../../src/application/native-authority-data.ts';

export interface FloorHistoryFixture {
  genesis: NativeGenesis;
  genesisCid: string;
  history: NativeAuthoritySnapshot;
}
const exact = (value: unknown) => canonicalJson(value, 32 * 1024 * 1024, 32);
function check(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

/** DATA checks only. The Node producer obtains history from the genuine live owner join. */
export async function floorHistoryCorpus(fixture: FloorHistoryFixture): Promise<string[]> {
  const anchor = await NativeAnchor.from(fixture.genesis, {
    app: fixture.genesis.app,
    genesis: fixture.genesisCid,
  });
  const original = exact(fixture.history);
  const full = await readNativeAuthoritySnapshot(fixture.history, anchor);
  check(exact(full) === original, 'Genuine full-history export changed in the full reader');
  check(full.frontier.position === 1 && full.requests.length === 1, 'Expected genuine one-entry history');
  const floor = full.principals.find((row) => row.observation !== null)?.observation;
  check(floor !== null && floor !== undefined, 'Genuine admission must establish a principal floor');
  check(full.consumedObservations.includes(floor.cid), 'Positive join must retain the floor descriptor');

  const { requests, retries, consumedObservations, ...kernel } = full;
  const compact = { ...kernel, format: 'atseq-checkpoint-authority' };
  const compactBefore = await readAuthorityData(compact, anchor, true);
  check(!('consumedObservations' in compactBefore), 'Compact DATA unexpectedly retained an identity array');

  const missing = structuredClone(full);
  missing.consumedObservations = missing.consumedObservations.filter((cid) => cid !== floor.cid);
  check(
    missing.consumedObservations.length === full.consumedObservations.length - 1,
    'Negative case must remove exactly one consumed descriptor',
  );
  check(
    exact({ ...missing, consumedObservations }) === original,
    'Negative case changed something besides the consumed floor inventory',
  );
  let caught: unknown;
  try {
    await readNativeAuthoritySnapshot(missing, anchor);
  } catch (error) {
    caught = error;
  }
  check(
    caught instanceof AtseqError &&
      caught.code === 'envelope' &&
      caught.message === 'Floor descriptor was not consumed',
    `Expected exact missing-floor rejection, got ${String(caught)}`,
  );
  check(exact(await readAuthorityData(compact, anchor, true)) === exact(compactBefore), 'Compact acceptance changed');
  check(exact(fixture.history) === original, 'Negative parsing mutated the genuine exported history');
  check(
    exact(await readNativeAuthoritySnapshot(fixture.history, anchor)) === original,
    'Positive join no longer parses',
  );
  return [
    'genuine-full-history-join-roundtrip',
    'compact-DATA-without-identity-arrays',
    'RV1-floor-descriptor-missing-exact-rejection',
    'original-export-and-compact-acceptance-unchanged',
  ];
}
