import { AtseqError } from '../../src/core/errors.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import { deriveIdentityBinding } from '../../src/protocol/identity-binding.ts';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import { decodeBlock } from '../../src/protocol/wire.ts';
import { authenticateAuthorityEntry } from '../../src/application/native-authority-evidence.ts';
import {
  interpretNativeAuthority,
  nativeAuthoritySnapshot,
  openNativeAuthority,
} from '../../src/application/native-authority.ts';
import { readNativeAuthoritySnapshot } from '../../src/application/native-authority-snapshot.ts';
import type { AuthorityPublicFixture } from './native-authority-fixture.ts';

/** Public native CARs, exact signed requests and retained method bytes; no keys or trust flags. */
export async function replayAuthorityFixtures(fixtures: AuthorityPublicFixture[]) {
  const cases: string[] = [];
  for (const fixture of fixtures) {
    const anchor = await NativeAnchor.from(fixture.genesis, { app: fixture.genesis.app, genesis: fixture.genesisCid });
    const binding = await deriveIdentityBinding(fixture.genesis.app, {
      assuranceClass: 'plc-audit-v1',
      auditBytes: new Uint8Array(fixture.appIdentity.auditBytes),
      selectedTipCid: fixture.appIdentity.selectedTipCid,
    });
    const appEvidence = {
      assuranceClass: 'plc-audit-v1' as const,
      auditBytes: new Uint8Array(fixture.appIdentity.auditBytes),
      selectedTipCid: fixture.appIdentity.selectedTipCid,
    };
    if (binding.signingKeyDid !== fixture.appKey)
      throw new Error('App fixture trust context differs from signed method binding');
    let state = await openNativeAuthority(anchor);
    const priorStates = new Map([[1, state]]);
    const content = new Map(fixture.content.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
    const reader = {
      get: async (cid: string) => {
        const raw = content.get(cid);
        if (!raw) throw new AtseqError('content_unavailable', 'Retained fixture bytes are missing');
        return raw;
      },
    };
    for (const vector of fixture.vectors) {
      const appRepo = await authenticateRepo({
        carBytes: new Uint8Array(vector.appCar),
        expectedDid: fixture.genesis.app,
        trustedSigningKeyDid: binding.signingKeyDid,
      });
      const authenticated = await authenticateAuthorityEntry({
        anchor,
        appRepo,
        entry: decodeBlock(new Uint8Array(vector.entry)),
        reader,
        prior: state,
        appIdentity: { before: appEvidence, after: appEvidence },
      });
      const interpreted = interpretNativeAuthority(state, authenticated);
      const snapshot = nativeAuthoritySnapshot(interpreted.state);
      if (
        canonicalJson(snapshot, 32 * 1024 * 1024) !== canonicalJson(vector.snapshot, 32 * 1024 * 1024) ||
        JSON.stringify(interpreted.outcome) !== JSON.stringify(vector.outcome)
      )
        throw new Error(`Cross-runtime authority disagreement: ${vector.name}`);
      await readNativeAuthoritySnapshot(snapshot, anchor);
      state = interpreted.state;
      priorStates.set(vector.snapshot.frontier.position + 1, state);
      cases.push(vector.name);
    }
    for (const vector of fixture.hostile) {
      const appRepo = await authenticateRepo({
        carBytes: new Uint8Array(vector.appCar),
        expectedDid: fixture.genesis.app,
        trustedSigningKeyDid: vector.claimedAppKey ?? binding.signingKeyDid,
      });
      let caught: unknown;
      const prior = priorStates.get((decodeBlock(new Uint8Array(vector.entry)) as any).position)!;
      const priorProjection = canonicalJson(nativeAuthoritySnapshot(prior), 32 * 1024 * 1024);
      try {
        const authenticated = await authenticateAuthorityEntry({
          anchor,
          appRepo,
          entry: decodeBlock(new Uint8Array(vector.entry)),
          prior,
          appIdentity: {
            before: appEvidence,
            after: vector.appIdentityAfter
              ? {
                  assuranceClass: 'plc-audit-v1',
                  auditBytes: new Uint8Array(vector.appIdentityAfter.auditBytes),
                  selectedTipCid: vector.appIdentityAfter.selectedTipCid,
                }
              : appEvidence,
          },
          reader: {
            get: async (cid) => {
              if (cid === vector.missingContent)
                throw new AtseqError('content_unavailable', 'Required retained chunk is missing');
              return reader.get(cid);
            },
          },
        });
        if (vector.stage === 'interpret') interpretNativeAuthority(prior, authenticated);
      } catch (error) {
        caught = error;
      }
      if (!(caught instanceof AtseqError) || caught.code !== vector.expectedCode)
        throw new Error(`${vector.name}: expected ${vector.expectedCode}, got ${String(caught)}`);
      if (canonicalJson(nativeAuthoritySnapshot(prior), 32 * 1024 * 1024) !== priorProjection)
        throw new Error(`${vector.name}: failed authentication/transition changed accepted prior`);
      cases.push(vector.name);
    }
  }
  return cases;
}
