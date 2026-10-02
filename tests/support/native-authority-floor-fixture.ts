import { AuthorityHarness } from './native-authority-fixture.ts';
import { nativeAuthorityHistory } from '../../src/application/native-authority.ts';
import { NATIVE_NSID, nativeRef } from '../../src/protocol/native-schema.ts';
import type { FloorHistoryFixture } from './native-authority-floor-corpus.ts';

/** Genuine app/account repositories and retained I1 evidence, then the live full-history join. */
export async function produceFloorHistoryFixture(): Promise<FloorHistoryFixture> {
  const harness = await AuthorityHarness.create();
  const epoch = await harness.epoch(1);
  const grant = await harness.grant(1, epoch);
  const request = await harness.accountRequest({ $type: nativeRef('admitGrant'), grant }, [
    `${NATIVE_NSID.epochCurrent}/self`,
    `${NATIVE_NSID.epoch}/${epoch}`,
    `${NATIVE_NSID.grant}/${grant.id}`,
  ]);
  await harness.append('floor descriptor retained by genuine grant admission', request, { decision: 'effective' });
  return {
    genesis: harness.anchor.genesis,
    genesisCid: harness.anchor.cid,
    history: nativeAuthorityHistory(harness.state),
  };
}
