import { AtseqError } from '../../src/core/errors.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import { deriveIdentityBinding } from '../../src/protocol/identity-binding.ts';
import {
  openNativePrefix,
  stageNativePrefix,
  acceptNativePrefix,
  nativePrefixEntry,
  nativePrefixCandidate,
  type NativePrefix,
} from '../../src/application/native-prefix.ts';
import { NativeAnchor, verifyNativeEntryContents } from '../../src/protocol/native-wire.ts';
import { decodeBlock, encodeBlock, sameBytes } from '../../src/protocol/wire.ts';
import { authenticateAuthorityEntry } from '../../src/application/native-authority-evidence.ts';
import {
  interpretNativeAuthority,
  nativeAuthoritySnapshot,
  nativeAuthorityHistory,
  nativeAuthorityPrefix,
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
      assuranceClass: 'plc-audit-v1' as const,
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
    let prefix: NativePrefix | null = null;
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
      const publication = { anchor, appRepo, reader, appIdentity: { before: appEvidence, after: appEvidence } };
      prefix = prefix
        ? acceptNativePrefix(prefix, await stageNativePrefix(prefix, publication))
        : await openNativePrefix(publication);
      const authenticated = await authenticateAuthorityEntry({ prefix, reader, prior: state });
      const interpreted = interpretNativeAuthority(state, authenticated);
      const snapshot = nativeAuthoritySnapshot(interpreted.state);
      if (
        canonicalJson(snapshot, 32 * 1024 * 1024) !== canonicalJson(vector.snapshot, 32 * 1024 * 1024) ||
        JSON.stringify(interpreted.outcome) !== JSON.stringify(vector.outcome)
      )
        throw new Error(`Cross-runtime authority disagreement: ${vector.name}`);
      await readNativeAuthoritySnapshot(nativeAuthorityHistory(interpreted.state), anchor);
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
        const claimed = await verifyNativeEntryContents(decodeBlock(new Uint8Array(vector.entry)), anchor);
        const hostileReader = {
          get: async (cid: string) => {
            if (cid === vector.missingContent)
              throw new AtseqError('content_unavailable', 'Required retained chunk is missing');
            return reader.get(cid);
          },
        };
        const retainedPrefix = nativeAuthorityPrefix(prior);
        const hostilePublication = {
          anchor,
          appRepo,
          reader: hostileReader,
          appIdentity: {
            before: appEvidence,
            after: vector.appIdentityAfter
              ? {
                  assuranceClass: 'plc-audit-v1' as const,
                  auditBytes: new Uint8Array(vector.appIdentityAfter.auditBytes),
                  selectedTipCid: vector.appIdentityAfter.selectedTipCid,
                }
              : appEvidence,
          },
        };
        const hostilePrefix = retainedPrefix
          ? nativePrefixCandidate(await stageNativePrefix(retainedPrefix, hostilePublication))
          : await openNativePrefix(hostilePublication);
        if (
          !sameBytes(
            encodeBlock(nativePrefixEntry(hostilePrefix, claimed.entry.position).row.entry),
            encodeBlock(claimed.entry),
          )
        )
          throw new AtseqError('envelope', 'Claimed entry differs from selected publication');
        const authenticated = await authenticateAuthorityEntry({ prefix: hostilePrefix, prior, reader: hostileReader });
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
