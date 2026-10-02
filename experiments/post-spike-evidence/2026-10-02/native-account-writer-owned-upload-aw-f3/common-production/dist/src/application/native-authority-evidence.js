/** Offline authentication only. No resolver, observer signature or delegated permission. */
import { didWebToUrl, isDidWeb } from '@atproto/did';
import { createSync, CODEC_DCBOR, toString } from '@atcute/cid';
import { deepFreeze } from '../core/freeze.js';
import { AtseqError, ProtocolError } from '../core/errors.js';
import { deriveIdentityBinding, sameIdentityObservation } from '../protocol/identity-binding.js';
import { VerifiedRepoBlocks } from '../protocol/native-proof.js';
import { NATIVE_NSID, nativeRef } from '../protocol/native-schema.js';
import { nativePath, readNativeRecord, reconstructNativeBytes, } from '../protocol/native-wire.js';
import { nativeAuthorityFrontier, nativeAuthorityPrefix, assertNativeAuthorityContext, } from './native-authority.js';
import { contradictNativePrefix, assertNativePrefixPrior, nativePrefixEntry, } from './native-prefix.js';
const authenticated = new WeakMap();
function invalid(message) {
    throw new ProtocolError('envelope', message);
}
function unavailable(message) {
    throw new AtseqError('content_unavailable', message);
}
export function authenticatedAuthorityEntry(value, prior) {
    const data = value && typeof value === 'object' ? authenticated.get(value) : undefined;
    if (!data)
        invalid('Expected authenticated authority entry capability');
    if (prior !== undefined && data.prior !== prior)
        invalid('Authenticated entry differs from exact interpreted prior');
    return data;
}
async function membership(repo, path, cid) {
    const result = await repo.lookup(path, cid);
    if (result.kind === 'missing')
        unavailable('Required native proof block is missing');
    if (result.kind === 'absent')
        invalid('Selected native root proves required authority record absent');
    return result.bytes;
}
async function content(reader, cid) {
    const raw = await reader.get(cid);
    if (toString(createSync(CODEC_DCBOR, raw)) !== cid)
        unavailable('Fetched content differs from requested CID');
    return readNativeRecord(NATIVE_NSID.content, cid, raw);
}
async function retainedBytes(reader, cid, maximumBytes) {
    return reconstructNativeBytes(await content(reader, cid), reader, maximumBytes);
}
/** The prefix owns publication/signatures/uniqueness; this owner finishes participant evidence. */
export async function authenticateAuthorityEntry(options) {
    const { prefix, prior } = options;
    const readerFailures = new Set();
    const reader = {
        async get(cid) {
            try {
                return await options.reader.get(cid);
            }
            catch (error) {
                readerFailures.add(error);
                throw error;
            }
        },
    };
    const frontier = nativeAuthorityFrontier(prior);
    const retainedPrefix = nativeAuthorityPrefix(prior);
    if (retainedPrefix)
        assertNativePrefixPrior(prefix, retainedPrefix);
    const { anchor, policy: configuredPolicy, row: checked } = nativePrefixEntry(prefix, frontier.position + 1);
    assertNativeAuthorityContext(prior, checked.entry);
    const request = checked.entry.request;
    const account = request.$type === nativeRef('accountOperation') ? request : null;
    const intent = account ? null : request.intent;
    const recovery = intent?.operation.$type === nativeRef('recoverParticipant') ? intent.operation : null;
    let observation = null;
    try {
        if (account || recovery) {
            const descriptorCid = checked.descriptorCid;
            const observed = checked.descriptor;
            const principal = account?.principal ?? recovery.target;
            const policy = configuredPolicy;
            if (policy.$type !== nativeRef('observationPolicy') ||
                policy.algorithm !== 'atseq-account-observation-v1' ||
                policy.checkpoint !== 'native-publication-v1')
                unavailable('Unsupported appointed observation policy');
            async function method(ref) {
                if (ref.$type === nativeRef('plcAudit')) {
                    if (!principal.startsWith('did:plc:') ||
                        ref.source !== `${policy.plcDirectory}/${principal}/log/audit` ||
                        !ref.selectedTip)
                        invalid('PLC evidence routing/method differs from appointed policy');
                    return {
                        assuranceClass: 'plc-audit-v1',
                        auditBytes: await retainedBytes(reader, ref.bytes.$link, 1024 * 1024),
                        selectedTipCid: ref.selectedTip.$link,
                    };
                }
                if (ref.$type !== nativeRef('webDocument') ||
                    !policy.allowWeb ||
                    !isDidWeb(principal) ||
                    ref.source !== didWebToUrl(principal).href)
                    invalid('Web evidence routing/method differs from appointed policy');
                return {
                    assuranceClass: 'web-observation-v1',
                    documentBytes: await retainedBytes(reader, ref.bytes.$link, 32 * 1024),
                };
            }
            const before = await deriveIdentityBinding(principal, await method(observed.before));
            const after = await deriveIdentityBinding(principal, await method(observed.after));
            if (!sameIdentityObservation(before, after) ||
                before.signingKeyDid !== observed.binding.signingKeyDid ||
                before.pdsOrigin !== observed.binding.pdsOrigin)
                invalid('Retained binding changed or differs from descriptor');
            const blocks = new VerifiedRepoBlocks();
            let participant, proofBytes = 0;
            for (const proof of observed.proofs) {
                const bytes = await retainedBytes(reader, proof.$link, 32 * 1024 * 1024 - proofBytes);
                proofBytes += bytes.length;
                participant = await blocks.authenticate({
                    carBytes: bytes,
                    expectedDid: principal,
                    trustedSigningKeyDid: before.signingKeyDid,
                    expectedRoot: observed.repositoryRoot.$link,
                });
            }
            if (!participant)
                invalid('Observation lacks native proof');
            const selected = new Map(observed.records.map((row) => [row.path, row.cid.$link]));
            const required = new Set();
            async function record(collection, key) {
                const path = nativePath(collection, key), cid = selected.get(path);
                if (!cid)
                    invalid('Observation omits an exact required subject record');
                required.add(path);
                return readNativeRecord(collection, key, await membership(participant, path, cid));
            }
            let current = null, grant = null, revoke = null;
            const epochs = [];
            if (account?.operation.$type === nativeRef('revokeGrant')) {
                const reference = account.operation.revoke;
                const path = nativePath(NATIVE_NSID.revoke, reference.id);
                if (selected.get(path) !== reference.cid.$link)
                    invalid('Revoke subject CID differs from operation');
                revoke = await record(NATIVE_NSID.revoke, reference.id);
            }
            else {
                current = await record(NATIVE_NSID.epochCurrent, 'self');
                let next = current.epoch.$link;
                const expected = account?.expectedEpoch?.$link ?? null;
                const visited = new Set();
                // An initial import/recovery needs only the exact current transition.
                for (;;) {
                    if (visited.has(next))
                        invalid('Cyclic epoch evidence');
                    visited.add(next);
                    const epoch = await record(NATIVE_NSID.epoch, next);
                    epochs.push({ cid: next, record: epoch });
                    if (epochs.length === 1 && epoch.id.$bytes !== current.id.$bytes)
                        invalid('Current epoch pointer ID differs from transition');
                    if (recovery ||
                        expected === null ||
                        next === expected ||
                        epoch.previous === null ||
                        epoch.previous.$link === expected)
                        break;
                    next = epoch.previous.$link;
                }
                if (account?.operation.$type === nativeRef('admitGrant')) {
                    const reference = account.operation.grant;
                    if (selected.get(nativePath(NATIVE_NSID.grant, reference.id)) !== reference.cid.$link)
                        invalid('Grant subject CID differs from operation');
                    grant = await record(NATIVE_NSID.grant, reference.id);
                }
                else if (account?.operation?.epoch?.$link !== current.epoch.$link &&
                    !recovery)
                    invalid('Advance epoch differs from selected current pointer');
                if (recovery && recovery.epoch.$link !== current.epoch.$link)
                    invalid('Recovery epoch differs from selected pointer');
            }
            if (required.size !== selected.size)
                invalid('Observation includes unrelated subject records');
            observation = deepFreeze({
                cid: descriptorCid,
                principal,
                root: participant.root,
                rev: participant.rev,
                signingKeyDid: before.signingKeyDid,
                pdsOrigin: before.pdsOrigin,
                assuranceClass: before.assuranceClass,
                epochs,
                current,
                grant,
                revoke,
            });
        }
    }
    catch (error) {
        // Only observed verification failures from owned evidence establish contradiction.
        // A reader throwing the same public constructor/code is still a local failure.
        if (!readerFailures.has(error) &&
            error instanceof ProtocolError &&
            error.constructor === ProtocolError &&
            error.kind === 'invalid_input')
            contradictNativePrefix(prefix, checked.entry.position, error.code);
        throw error;
    }
    const capability = Object.freeze({});
    authenticated.set(capability, Object.freeze({
        ...deepFreeze({
            entry: checked.entry,
            requestCid: checked.requestCid,
            entryCid: checked.entryCid,
            observation,
            publicationAssurance: checked.publicationAssurance,
        }),
        prior,
        prefix,
    }));
    return capability;
}
//# sourceMappingURL=native-authority-evidence.js.map