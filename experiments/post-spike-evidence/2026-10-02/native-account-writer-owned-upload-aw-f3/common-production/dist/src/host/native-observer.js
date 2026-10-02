/** Host observation assertions. No observer signature, authority verdict or public support registration. */
import { didWebToUrl, isDidWeb } from '@atproto/did';
import { AtseqError, ProtocolError } from '../core/errors.js';
import { deepFreeze } from '../core/freeze.js';
import { deriveIdentityBinding, sameIdentityObservation } from '../protocol/identity-binding.js';
import { identityObject, parseIdentityJson } from '../protocol/identity-json.js';
import { PLC_EVIDENCE_LIMITS } from '../protocol/identity-plc.js';
import { NativeObserverCar } from '../protocol/native-observer-car.js';
import { NATIVE_NSID, nativeRef } from '../protocol/native-schema.js';
import { NativeAnchor, nativePath, nativeGenesisPath, nativeEntryPath, nativeObservationSubject, nativeRetryIdentity, readNativeRecord, readNativeValue, verifyNativeEntryContents, } from '../protocol/native-wire.js';
import { contentCid, encodeBlock, bytes, link } from '../protocol/wire.js';
import { nativeAuthoritySnapshot, nativeAuthorityPrefix, } from '../application/native-authority.js';
import { nativePrefixHas } from '../application/native-prefix.js';
import { IdentityFetch } from './identity-fetch.js';
const preparations = new WeakMap(), captures = new WeakMap();
function invalid(message) {
    throw new ProtocolError('envelope', message);
}
function unavailable(message) {
    throw new AtseqError('content_unavailable', message);
}
class SubjectFailure {
    refusal;
    constructor(refusal) {
        this.refusal = refusal;
    }
}
class Restart {
}
function ownedSubject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        invalid('Expected omitted-observation subject');
    return structuredClone(value);
}
function cancellation(signal) {
    if (signal !== undefined && !(signal instanceof AbortSignal))
        invalid('Expected cancellation signal');
    if (signal?.aborted)
        unavailable('Observation canceled');
}
function timestamp(value) {
    const result = value ?? new Date().toISOString();
    if (typeof result !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(result) ||
        !Number.isFinite(new Date(result).getTime()) ||
        new Date(result).toISOString() !== result)
        invalid('Invalid observation diagnostic timestamp');
    return result;
}
export class NativeObserver {
    #anchor;
    #policy;
    constructor(anchor, policy) {
        this.#anchor = anchor;
        this.#policy = policy;
    }
    static async fromAnchor(anchor, reader) {
        const checked = await NativeAnchor.from(anchor.genesis, { app: anchor.genesis.app, genesis: anchor.cid });
        const cid = checked.genesis.observationPolicy.$link;
        const content = await readNativeRecord(NATIVE_NSID.content, cid, await reader.get(cid));
        if (content.body.$type !== nativeRef('observationPolicy') ||
            content.body.algorithm !== 'atseq-account-observation-v1' ||
            content.body.checkpoint !== 'native-publication-v1')
            unavailable('Unsupported appointed observation policy');
        return new NativeObserver(checked, content.body);
    }
    #prepare(prior, subject, principal) {
        const snapshot = nativeAuthoritySnapshot(prior);
        if (snapshot.app !== this.#anchor.genesis.app ||
            snapshot.genesis !== this.#anchor.cid ||
            subject.app !== snapshot.app ||
            subject.genesis.$link !== snapshot.genesis)
            invalid('Observation subject differs from captured scope');
        const account = subject.$type === nativeRef('accountOperation') ? subject : null;
        const intent = account ? null : subject;
        const context = account ?? intent.operation;
        if (snapshot.frontier.position === Number.MAX_SAFE_INTEGER ||
            context.position !== snapshot.frontier.position + 1 ||
            context.prev.$link !== snapshot.frontier.entry)
            invalid('Observation subject differs from captured frontier');
        const expected = snapshot.principals.find((row) => row.principal === principal);
        if ((context.expectedEpoch?.$link ?? null) !== (expected?.epoch ?? null) ||
            (context.expectedObservation?.$link ?? null) !== (expected?.observation?.cid ?? null))
            invalid('Observation subject differs from captured epoch or floor');
        const prefix = nativeAuthorityPrefix(prior);
        if (intent && prefix && nativePrefixHas(prefix, 'retries', nativeRetryIdentity(intent), snapshot.frontier.position))
            invalid('Actor nonce already occurs in accepted history');
        const preparation = Object.freeze({});
        preparations.set(preparation, { owner: this, prior, snapshot, subject, principal });
        return preparation;
    }
    async prepareAccount(prior, value) {
        const subject = ownedSubject(value);
        if (Object.hasOwn(subject, 'observation'))
            invalid('Fresh preparation requires omitted observation');
        const checked = await readNativeValue(nativeRef('accountOperation'), {
            ...subject,
            observation: link(this.#anchor.cid),
        });
        return this.#prepare(prior, checked, checked.principal);
    }
    async prepareRecovery(prior, value) {
        const subject = ownedSubject(value), operation = subject.operation;
        if (!identityObject(operation) ||
            operation.$type !== nativeRef('recoverParticipant') ||
            Object.hasOwn(operation, 'observation'))
            invalid('Expected fresh omitted-observation recovery intent');
        const checked = await readNativeValue(nativeRef('intent'), {
            ...subject,
            operation: { ...operation, observation: link(this.#anchor.cid) },
        });
        const recovery = checked.operation;
        return this.#prepare(prior, checked, recovery.target);
    }
    #preparation(preparation) {
        const data = preparation && typeof preparation === 'object' ? preparations.get(preparation) : undefined;
        if (!data || data.owner !== this)
            invalid('Expected owned observation preparation');
        return data;
    }
    #capture(capture) {
        const data = capture && typeof capture === 'object' ? captures.get(capture) : undefined;
        if (!data || data.owner !== this)
            invalid('Expected owned observation capture');
        return data;
    }
    readCapture(capture) {
        const data = this.#capture(capture);
        return {
            kind: data.kind,
            principal: data.principal,
            root: data.root,
            rev: data.rev,
            assuranceClass: data.assuranceClass,
            policy: data.policy,
            descriptor: data.descriptor,
            proofs: [...data.proofs],
            completed: structuredClone(data.completed),
            blocks: new Map([...data.blocks].map(([cid, raw]) => [cid, new Uint8Array(raw)])),
        };
    }
    assertCapturePrior(capture, current) {
        const data = this.#capture(capture);
        nativeAuthoritySnapshot(current); // Reject snapshots and reconstructed capability lookalikes.
        if (data.prior === null || data.prior !== current)
            invalid('Observation capture differs from current accepted prior');
    }
    async #method(principal, fetch, signal) {
        cancellation(signal);
        fetch.assertActive(signal);
        let evidence, source, raw;
        if (principal.startsWith('did:plc:')) {
            source = this.#policy.plcDirectory + '/' + principal + '/log/audit';
            raw = await fetch.bytesFrom(source, PLC_EVIDENCE_LIMITS.bytes, signal);
            const parsed = parseIdentityJson(raw, PLC_EVIDENCE_LIMITS.bytes);
            if (!Array.isArray(parsed) || !parsed.length)
                invalid('Expected nonempty PLC audit');
            if (parsed.length > PLC_EVIDENCE_LIMITS.rows)
                unavailable('PLC audit row budget exceeded');
            const last = parsed.at(-1);
            if (!identityObject(last) || typeof last.cid !== 'string')
                invalid('PLC audit lacks candidate tip');
            evidence = { assuranceClass: 'plc-audit-v1', auditBytes: raw, selectedTipCid: last.cid };
        }
        else {
            if (!this.#policy.allowWeb || !isDidWeb(principal))
                unavailable('Appointed policy does not support this principal');
            source = didWebToUrl(principal).href;
            raw = await fetch.bytesFrom(source, 32 * 1024, signal);
            evidence = { assuranceClass: 'web-observation-v1', documentBytes: raw };
        }
        return { evidence, raw, source, binding: await deriveIdentityBinding(principal, evidence) };
    }
    #endpoint(method, name, parameters) {
        const url = new URL('/xrpc/com.atproto.sync.' + name, method.binding.pdsOrigin);
        for (const [key, value] of parameters)
            url.searchParams.append(key, value);
        return url;
    }
    async #selection(method, fetch, path, signal) {
        fetch.assertActive(signal);
        const [collection, rkey] = path.split('/');
        let raw, recovered = false;
        try {
            raw = await fetch.bytesFrom(this.#endpoint(method, 'getRecord', [
                ['did', method.binding.principal],
                ['collection', collection],
                ['rkey', rkey],
            ]), 32 * 1024 * 1024, signal);
        }
        catch (error) {
            if (!(error instanceof AtseqError) || error.code !== 'content_unavailable' || signal?.aborted)
                throw error;
            fetch.assertActive(signal);
            recovered = true;
            raw = await fetch.bytesFrom(this.#endpoint(method, 'getRepo', [['did', method.binding.principal]]), 32 * 1024 * 1024, signal);
        }
        const car = new NativeObserverCar(raw);
        return { car, repo: await car.authenticate(method.binding.principal, method.binding.signingKeyDid), recovered };
    }
    async #recover(selection, method, fetch, signal) {
        fetch.assertActive(signal);
        if (selection.recovered)
            unavailable('Selected observation proof remains incomplete');
        const raw = await fetch.bytesFrom(this.#endpoint(method, 'getRepo', [['did', method.binding.principal]]), 32 * 1024 * 1024, signal);
        const car = new NativeObserverCar(raw), repo = await car.authenticate(method.binding.principal, method.binding.signingKeyDid);
        if (repo.root !== selection.repo.root)
            throw new Restart();
        return { car, repo, recovered: true };
    }
    async #paths(selection, method, fetch, paths, signal) {
        if (new Set(paths).size > 16)
            unavailable('Observation requires more than sixteen subject records');
        for (;;) {
            cancellation(signal);
            fetch.assertActive(signal);
            const missing = new Set();
            for (const path of paths) {
                const found = await selection.repo.lookup(path);
                if (found.kind === 'missing')
                    missing.add(found.cid);
            }
            if (!missing.size)
                return selection;
            try {
                const requested = [...missing].sort();
                for (let offset = 0; offset < requested.length; offset += 64) {
                    const round = requested.slice(offset, offset + 64);
                    const raw = await fetch.bytesFrom(this.#endpoint(method, 'getBlocks', [
                        ['did', method.binding.principal],
                        ...round.map((cid) => ['cids[]', cid]),
                    ]), 32 * 1024 * 1024, signal);
                    selection.car.addExact(raw, round);
                }
                selection.repo = await selection.car.authenticate(method.binding.principal, method.binding.signingKeyDid);
            }
            catch (error) {
                if (!(error instanceof AtseqError) || error.code !== 'content_unavailable' || signal?.aborted)
                    throw error;
                selection = await this.#recover(selection, method, fetch, signal);
            }
        }
    }
    async #record(selection, path, expectedCid, selected) {
        const found = await selection.repo.lookup(path);
        if (found.kind === 'missing')
            unavailable('Required observation proof block is missing');
        if (found.kind === 'absent')
            throw new SubjectFailure(deepFreeze({ code: 'subject_absent', path, expectedCid, observedCid: null, root: selection.repo.root }));
        if (expectedCid !== null && found.cid !== expectedCid)
            throw new SubjectFailure(deepFreeze({ code: 'subject_replaced', path, expectedCid, observedCid: found.cid, root: selection.repo.root }));
        const [collection, rkey] = path.split('/');
        const value = await readNativeRecord(collection, rkey, found.bytes);
        selected.set(path, found.cid);
        return value;
    }
    async #accountProof(preparation, before, fetch, signal) {
        const subject = preparation.subject, account = subject.$type === nativeRef('accountOperation') ? subject : null;
        const recovery = account ? null : subject.operation;
        const operation = account?.operation;
        const pointerPath = nativePath(NATIVE_NSID.epochCurrent, 'self');
        const primary = operation?.$type === nativeRef('admitGrant')
            ? nativePath(NATIVE_NSID.grant, operation.grant.id)
            : operation?.$type === nativeRef('revokeGrant')
                ? nativePath(NATIVE_NSID.revoke, operation.revoke.id)
                : pointerPath;
        let selection = await this.#selection(before, fetch, primary, signal);
        const selected = new Map();
        if (operation?.$type === nativeRef('revokeGrant')) {
            selection = await this.#paths(selection, before, fetch, [primary], signal);
            await this.#record(selection, primary, operation.revoke.cid.$link, selected);
        }
        else {
            // D3-1: prove and compare the pointer before any target absence/replacement diagnostic.
            selection = await this.#paths(selection, before, fetch, [pointerPath, ...(operation?.$type === nativeRef('admitGrant') ? [primary] : [])], signal);
            const current = await this.#record(selection, pointerPath, null, selected);
            const target = recovery?.epoch.$link ?? (operation?.$type === nativeRef('advanceEpoch') ? operation.epoch.$link : null);
            if (target !== null && target !== current.epoch.$link)
                invalid(recovery
                    ? 'Recovery epoch differs from selected pointer'
                    : 'Advance epoch differs from selected current pointer');
            const expected = account?.expectedEpoch?.$link ?? null;
            let next = current.epoch.$link;
            const visited = new Set();
            for (;;) {
                if (visited.has(next))
                    invalid('Cyclic observation epoch evidence');
                visited.add(next);
                const path = nativePath(NATIVE_NSID.epoch, next);
                // Batch known grant + all discovered epoch paths; shared missing nodes deduplicate.
                const paths = [...selected.keys(), path, ...(operation?.$type === nativeRef('admitGrant') ? [primary] : [])];
                selection = await this.#paths(selection, before, fetch, paths, signal);
                const epoch = await this.#record(selection, path, next, selected);
                if (visited.size === 1 && epoch.id.$bytes !== current.id.$bytes)
                    invalid('Current epoch pointer ID differs from transition');
                if (recovery ||
                    expected === null ||
                    next === expected ||
                    epoch.previous === null ||
                    epoch.previous.$link === expected)
                    break;
                next = epoch.previous.$link;
            }
            if (operation?.$type === nativeRef('admitGrant'))
                await this.#record(selection, primary, operation.grant.cid.$link, selected);
        }
        return { selection, selected };
    }
    async #retain(raw, blocks) {
        const chunks = [];
        for (let offset = 0; offset < raw.length; offset += 32 * 1024)
            chunks.push(link(await this.#stash({ $type: nativeRef('byteChunk'), bytes: bytes(raw.slice(offset, offset + 32 * 1024)) }, blocks)));
        return this.#stash({ $type: nativeRef('byteManifest'), byteLength: raw.length, chunks }, blocks);
    }
    async #stash(body, blocks) {
        const value = await readNativeValue(NATIVE_NSID.content, { $type: NATIVE_NSID.content, version: 1, body });
        const cid = await contentCid(value);
        blocks.set(cid, encodeBlock(value));
        return cid;
    }
    async #methodRef(method, blocks) {
        const retained = link(await this.#retain(method.raw, blocks));
        return method.evidence.assuranceClass === 'plc-audit-v1'
            ? {
                $type: nativeRef('plcAudit'),
                bytes: retained,
                source: method.source,
                selectedTip: link(method.evidence.selectedTipCid),
            }
            : { $type: nativeRef('webDocument'), bytes: retained, source: method.source };
    }
    #mint(data) {
        const capability = Object.freeze({});
        captures.set(capability, { ...data, owner: this });
        return capability;
    }
    async observePrepared(preparation, options = {}) {
        const data = this.#preparation(preparation), observedAt = timestamp(options.observedAt);
        cancellation(options.signal);
        const fetch = new IdentityFetch();
        for (let attempt = 0; attempt < 3; attempt++) {
            const before = await this.#method(data.principal, fetch, options.signal);
            let proof;
            let failure;
            try {
                proof = await this.#accountProof(data, before, fetch, options.signal);
            }
            catch (error) {
                if (error instanceof Restart)
                    continue;
                if (!(error instanceof SubjectFailure) && !(error instanceof AtseqError && error.kind === 'invalid_input'))
                    throw error;
                failure = error;
            }
            const after = await this.#method(data.principal, fetch, options.signal);
            if (!sameIdentityObservation(before.binding, after.binding))
                continue;
            fetch.assertActive(options.signal);
            if (failure instanceof SubjectFailure)
                return { kind: 'refused', refusal: failure.refusal };
            if (failure !== undefined)
                throw failure;
            if (!proof)
                throw new AtseqError('runtime_fault', 'Observation proof result is missing');
            cancellation(options.signal);
            const blocks = new Map();
            const beforeRef = await this.#methodRef(before, blocks), afterRef = await this.#methodRef(after, blocks);
            const proofCid = await this.#retain(await proof.selection.car.bytes(), blocks);
            const subject = data.subject, account = subject.$type === nativeRef('accountOperation') ? subject : null;
            const context = account ?? subject.operation;
            const descriptor = await this.#stash({
                $type: nativeRef('observation'),
                policy: this.#anchor.genesis.observationPolicy,
                principal: data.principal,
                context: {
                    app: subject.app,
                    genesis: subject.genesis,
                    position: context.position,
                    prev: context.prev,
                    subject: link(await nativeObservationSubject(subject)),
                },
                binding: { signingKeyDid: before.binding.signingKeyDid, pdsOrigin: before.binding.pdsOrigin },
                before: beforeRef,
                after: afterRef,
                repositoryRoot: link(proof.selection.repo.root),
                records: [...proof.selected]
                    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
                    .map(([path, cid]) => ({ path, cid: link(cid) })),
                proofs: [link(proofCid)],
                observedAt,
            }, blocks);
            const completed = structuredClone(subject);
            if (account)
                completed.observation = link(descriptor);
            else
                completed.operation = {
                    ...completed.operation,
                    observation: link(descriptor),
                };
            const prefix = nativeAuthorityPrefix(data.prior);
            if (prefix &&
                (nativePrefixHas(prefix, 'descriptors', descriptor, data.snapshot.frontier.position) ||
                    (account &&
                        nativePrefixHas(prefix, 'requests', await contentCid(completed), data.snapshot.frontier.position))))
                invalid('Completed observation or account request occurs twice in accepted history');
            fetch.assertActive(options.signal);
            return {
                kind: 'captured',
                capture: this.#mint({
                    kind: 'account',
                    prior: data.prior,
                    principal: data.principal,
                    root: proof.selection.repo.root,
                    rev: proof.selection.repo.rev,
                    assuranceClass: before.binding.assuranceClass,
                    policy: this.#anchor.genesis.observationPolicy.$link,
                    descriptor,
                    proofs: [proofCid],
                    completed,
                    blocks,
                }),
            };
        }
        unavailable('Observation binding or selected root kept changing');
    }
    async observeApp(entry, options = {}) {
        const checked = entry === undefined ? null : await verifyNativeEntryContents(entry, this.#anchor);
        const genesisPath = nativeGenesisPath(this.#anchor.cid), entryPath = checked ? nativeEntryPath(this.#anchor.cid, checked.entry.position) : null;
        const fetch = new IdentityFetch();
        cancellation(options.signal);
        for (let attempt = 0; attempt < 3; attempt++) {
            const before = await this.#method(this.#anchor.genesis.app, fetch, options.signal);
            let selection, failure;
            try {
                selection = await this.#selection(before, fetch, entryPath ?? genesisPath, options.signal);
                selection = await this.#paths(selection, before, fetch, [genesisPath, ...(entryPath ? [entryPath] : [])], options.signal);
                const selected = new Map();
                await this.#record(selection, genesisPath, this.#anchor.cid, selected);
                if (entryPath)
                    await this.#record(selection, entryPath, checked.entryCid, selected);
            }
            catch (error) {
                if (error instanceof Restart)
                    continue;
                if (!(error instanceof SubjectFailure) && !(error instanceof AtseqError && error.kind === 'invalid_input'))
                    throw error;
                failure = error;
            }
            const after = await this.#method(this.#anchor.genesis.app, fetch, options.signal);
            if (!sameIdentityObservation(before.binding, after.binding))
                continue;
            fetch.assertActive(options.signal);
            if (failure instanceof SubjectFailure)
                return { kind: 'refused', refusal: failure.refusal };
            if (failure !== undefined)
                throw failure;
            if (!selection)
                throw new AtseqError('runtime_fault', 'App observation proof result is missing');
            cancellation(options.signal);
            const blocks = new Map();
            const beforeRef = await this.#methodRef(before, blocks), afterRef = await this.#methodRef(after, blocks);
            const proofCid = await this.#retain(await selection.car.bytes(), blocks);
            const descriptor = await this.#stash({
                $type: nativeRef('appBinding'),
                policy: this.#anchor.genesis.observationPolicy,
                principal: this.#anchor.genesis.app,
                binding: { signingKeyDid: before.binding.signingKeyDid, pdsOrigin: before.binding.pdsOrigin },
                before: beforeRef,
                after: afterRef,
                repositoryRoot: link(selection.repo.root),
            }, blocks);
            fetch.assertActive(options.signal);
            return {
                kind: 'captured',
                capture: this.#mint({
                    kind: 'app',
                    prior: null,
                    principal: this.#anchor.genesis.app,
                    root: selection.repo.root,
                    rev: selection.repo.rev,
                    assuranceClass: before.binding.assuranceClass,
                    policy: this.#anchor.genesis.observationPolicy.$link,
                    descriptor,
                    proofs: [proofCid],
                    completed: null,
                    blocks,
                }),
            };
        }
        unavailable('App observation binding or selected root kept changing');
    }
}
//# sourceMappingURL=native-observer.js.map