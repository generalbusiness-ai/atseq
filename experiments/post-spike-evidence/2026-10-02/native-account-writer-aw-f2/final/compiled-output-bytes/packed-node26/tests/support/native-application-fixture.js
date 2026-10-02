/** New genuine supported-source publications; historical I2 fixtures remain byte-exact. */
import sourceVectors from "../../../../testdata/native-source/source-identity-vectors.json" with { type: 'json' };
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { create, CODEC_RAW, toString } from '@atcute/cid';
import { AuthorityHarness, authorityRepo, grantId } from "./native-authority-fixture.js";
import { NATIVE_NSID, nativeRef } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/protocol/native-schema.js";
import { NativeAnchor, nativeGenesisPath, nativeEntryPath, nativeHeadPath, } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/protocol/native-wire.js";
import { authenticateRepo } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/protocol/native-proof.js";
import { contentCid, encodeBlock, link } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/protocol/wire.js";
import { openNativeApplication, openNativeAuthority, } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/application/native-authority.js";
import { assessNativeGenesisSource, nativeSourceAction, readNativeSourceAction, } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/definition/native-source.js";
import { NATIVE_SOURCE_CONTRACT } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/definition/native-source-contract.js";
import { AtseqError } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/core/errors.js";
import { canonicalJson } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/core/values.js";
export const applicationAction = 'ai.generalbusiness.atseq.example#act';
export async function applicationSource(options = {}) {
    const original = sourceVectors[0];
    const manifest = structuredClone(original.manifest);
    const named = new Map(original.files.map((file) => [file.path, Uint8Array.from(atob(file.base64), (char) => char.charCodeAt(0))]));
    const encoder = new TextEncoder();
    named.set('fold.jsonata', encoder.encode(options.fold ??
        '{"decision":"effective","state":{"count":state.count+act.amount,"description":state.description}}'));
    if (options.initial)
        named.set('initial.json', encoder.encode(JSON.stringify(options.initial)));
    if (options.role)
        manifest.actions[0].authorization = { $type: nativeRef('requiredRole'), role: options.role };
    const schema = JSON.parse(new TextDecoder().decode(named.get('schemas.json')));
    schema.defs.status = {
        type: 'query',
        parameters: { type: 'params', properties: {} },
        output: { encoding: 'application/json', schema: { type: 'ref', ref: '#state' } },
    };
    if (options.stateChange)
        schema.defs.state.properties.count.maximum = 99;
    named.set('schemas.json', encoder.encode(JSON.stringify(schema)));
    named.set('query.jsonata', encoder.encode('state'));
    manifest.queries = [{ name: 'status', ref: 'ai.generalbusiness.atseq.example#status', program: 'query.jsonata' }];
    if (options.semanticMismatch)
        manifest.profile = link(NATIVE_SOURCE_CONTRACT.evaluator);
    manifest.files = await Promise.all([...named].map(async ([path, raw]) => ({ path, cid: toString(await create(CODEC_RAW, raw)) })));
    const root = await contentCid(manifest);
    const blocks = new Map([[root, encodeBlock(manifest)]]);
    for (const file of manifest.files)
        blocks.set(file.cid, named.get(file.path));
    const reader = {
        async get(cid) {
            const raw = blocks.get(cid);
            if (!raw)
                throw new AtseqError('content_unavailable', 'Missing fixture source');
            return new Uint8Array(raw);
        },
    };
    let execution = '';
    if (!options.semanticMismatch) {
        const facts = await assessNativeGenesisSource(root, reader);
        if (facts.kind !== 'admitted')
            throw new Error('Fixture source not admitted');
        execution = readNativeSourceAction(nativeSourceAction(facts.definition, applicationAction)).execution;
    }
    return { root, closure: [...blocks.keys()].sort(), blocks, reader, execution };
}
export async function nativeApplicationFixture() {
    const base = await applicationSource(), role = await applicationSource({ role: 'member', initial: { count: 77, description: 'other' } });
    const denied = await applicationSource({
        fold: '{"decision":"ineffective","reason":"invalid_activation","message":"authored"}',
    });
    const malformed = await applicationSource({
        fold: '{"decision":"ineffective","source":"framework","reason":"invalid_action"}',
    });
    const invalidState = await applicationSource({
        fold: '{"decision":"effective","state":{"count":-1,"description":"demo"}}',
    });
    const incompatible = await applicationSource({ stateChange: true });
    const mismatch = await applicationSource({ semanticMismatch: true, fold: '$map([1],function($v){$v})' });
    const legalMessage = '🚀'.repeat(1024);
    const message = await applicationSource({
        fold: JSON.stringify({ decision: 'ineffective', reason: 'denied', message: legalMessage }),
    });
    const overMessage = await applicationSource({
        fold: JSON.stringify({ decision: 'ineffective', reason: 'denied', message: legalMessage + '🚀' }),
    });
    const unicode = await applicationSource({ fold: '{"decision":"ineffective","reason":"denied","message":"\\ud800"}' });
    const variants = [base, role, denied, malformed, invalidState, incompatible, mismatch, message, overMessage, unicode];
    const sourceBlocks = new Map(variants.flatMap((source) => [...source.blocks]));
    const h = await AuthorityHarness.create();
    const recoveryOnly = await h.device.exportPublicKey('did');
    const unappointed = await P256PrivateKeyExportable.createKeypair();
    const genesis = {
        ...h.anchor.genesis,
        semantics: link(NATIVE_SOURCE_CONTRACT.native),
        definition: link(base.root),
        control: [
            ...h.anchor.genesis.control,
            { principal: h.actor.principal, actorKey: recoveryOnly, powers: ['recover'] },
        ]
            .map((row) => ({ ...row, powers: [...row.powers] }))
            .sort((a, b) => (JSON.stringify([a.principal, a.actorKey]) < JSON.stringify([b.principal, b.actorKey]) ? -1 : 1)),
    };
    const genesisCid = await contentCid(genesis);
    h.anchor = await NativeAnchor.from(genesis, { app: genesis.app, genesis: genesisCid });
    h.state = await openNativeAuthority(h.anchor);
    h.appRecords.clear();
    h.appRecords.set(nativeGenesisPath(genesisCid), encodeBlock(genesis));
    h.appRecords.set(nativeHeadPath(genesisCid), encodeBlock({
        $type: NATIVE_NSID.head,
        version: 2,
        app: genesis.app,
        genesis: link(genesisCid),
        position: 0,
        entry: link(genesisCid),
    }));
    const reader = {
        async get(cid) {
            const raw = sourceBlocks.get(cid);
            if (!raw)
                throw new AtseqError('content_unavailable', 'Missing fixture source');
            return new Uint8Array(raw);
        },
    };
    const app = await openNativeApplication({ anchor: h.anchor, sourceReader: reader });
    const vectors = [];
    const evidence = {
        assuranceClass: 'plc-audit-v1',
        auditBytes: new TextEncoder().encode(JSON.stringify(h.app.rows)),
        selectedTipCid: h.app.selectedTipCid,
    };
    let expectedCount = 0, expectedDefinition = base.root;
    async function append(name, request, outcome, count = expectedCount, definition = expectedDefinition) {
        const prior = app.snapshot().authority;
        const entry = {
            $type: NATIVE_NSID.entry,
            version: 2,
            app: genesis.app,
            genesis: link(genesisCid),
            position: prior.frontier.position + 1,
            prev: link(prior.frontier.entry),
            request,
        };
        const entryCid = await contentCid(entry);
        h.appRecords.set(nativeEntryPath(genesisCid, entry.position), encodeBlock(entry));
        h.appRecords.set(nativeHeadPath(genesisCid), encodeBlock({
            $type: NATIVE_NSID.head,
            version: 2,
            app: genesis.app,
            genesis: link(genesisCid),
            position: entry.position,
            entry: link(entryCid),
        }));
        const proof = await authorityRepo(h.app.principal, h.app.key, h.appRecords, entry.position);
        const appRepo = await authenticateRepo({
            carBytes: proof.car,
            expectedDid: h.app.principal,
            trustedSigningKeyDid: h.app.signing,
        });
        const result = await app.process({
            entry,
            appRepo,
            reader: h.reader(),
            appIdentity: { before: evidence, after: evidence },
        });
        if (canonicalJson(result.outcome) !== canonicalJson(outcome))
            throw new Error(name + ': wrong outcome ' + JSON.stringify(result));
        const expected = app.snapshot();
        if (canonicalJson(expected.state) !== canonicalJson({ count, description: 'demo' }) ||
            expected.definition !== definition)
            throw new Error(name + ': independent state/source oracle differs');
        expectedCount = count;
        expectedDefinition = definition;
        vectors.push({ name, entry, appCar: [...proof.car], expected });
    }
    const yes = { decision: 'effective' }, no = (reason) => ({ decision: 'ineffective', source: 'framework', reason });
    const ep = await h.epoch(1), id = grantId(1);
    const actions = variants
        .filter((source) => source.execution)
        .map((source) => ({ action: applicationAction, execution: link(source.execution) }));
    actions.push({ action: 'ai.generalbusiness.atseq.example#missing', execution: link(base.execution) });
    const scopes = [
        ...new Map(actions.map((pair) => [JSON.stringify([pair.action, pair.execution.$link]), pair])).entries(),
    ]
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([, pair]) => pair);
    const grantCid = await h.account(NATIVE_NSID.grant, id, {
        $type: NATIVE_NSID.grant,
        version: 1,
        id,
        app: genesis.app,
        genesis: link(genesisCid),
        epoch: link(ep),
        actorKey: await h.device.exportPublicKey('did'),
        actions: scopes,
        assignRoles: ['member'],
    });
    const grant = { id, cid: link(grantCid) };
    const act = async (execution = base.execution, payload = { amount: 1 }, action = applicationAction, reference = grant) => h.signed({
        $type: nativeRef('act'),
        action,
        execution: link(execution),
        payload,
        grant: reference,
        epoch: link(ep),
    });
    await append('unadmitted grant beats absent action', await act(base.execution, { amount: 1 }, 'ai.generalbusiness.atseq.example#missing'), no('grant_unadmitted'));
    const prior = app.snapshot().authority;
    const admission = {
        $type: nativeRef('accountOperation'),
        app: genesis.app,
        genesis: link(genesisCid),
        position: prior.frontier.position + 1,
        prev: link(prior.frontier.entry),
        principal: h.actor.principal,
        expectedEpoch: null,
        expectedObservation: null,
        operation: { $type: nativeRef('admitGrant'), grant },
        observation: link(genesisCid),
    };
    admission.observation = link(await h.observe(admission, [
        `${NATIVE_NSID.epochCurrent}/self`,
        `${NATIVE_NSID.epoch}/${ep}`,
        `${NATIVE_NSID.grant}/${id}`,
    ]));
    await append('authentic participant grant admission', admission, yes);
    await append('effective action increments owned state', await act(base.execution, { amount: 2 }), yes, 2);
    await append('known action absence beats execution', await act(base.execution, { amount: 1 }, 'ai.generalbusiness.atseq.example#missing'), no('unknown_action'));
    await append('one grant immutable CID mismatch', await act(base.execution, { amount: 1 }, applicationAction, { id, cid: link(base.root) }), no('grant_conflict'));
    await append('one grant exact signed pair scope', await act(base.root), no('grant_scope'));
    await append('stale grant epoch beats wrong signer', await h.signed({
        $type: nativeRef('act'),
        action: applicationAction,
        execution: link(base.execution),
        payload: { amount: 1 },
        grant,
        epoch: link(base.root),
    }, h.control), no('grant_epoch'));
    await append('wrong grant signer beats pair scope', await h.signed({
        $type: nativeRef('act'),
        action: applicationAction,
        execution: link(base.root),
        payload: { amount: 1 },
        grant,
        epoch: link(ep),
    }, h.control), no('grant_signer'));
    await append('input schema rejection is framework invalid_action', await act(base.execution, { amount: 11 }), no('invalid_action'));
    const controlContext = () => {
        const state = app.snapshot().authority;
        return {
            position: state.frontier.position + 1,
            prev: link(state.frontier.entry),
            controlTip: link(state.control.tip),
        };
    };
    const activate = (target, expected = expectedDefinition, closure = target.closure) => h.signed({
        $type: nativeRef('activate'),
        ...controlContext(),
        expected: link(expected),
        definition: link(target.root),
        closure,
    }, h.control);
    const activationContext = {
        $type: nativeRef('activate'),
        ...controlContext(),
        expected: link(expectedDefinition),
        definition: link(role.root),
        closure: role.closure,
    };
    await append('control context stale before target fetch', await h.signed({ ...activationContext, position: 999 }, h.control), no('control_context_stale'));
    await append('control tip stale before target fetch', await h.signed({ ...activationContext, ...controlContext(), controlTip: link(role.root) }, h.control), no('control_tip_stale'));
    await append('control unappointed before target fetch', await h.signed({ ...activationContext, ...controlContext() }, unappointed), no('control_unappointed'));
    await append('control power before target fetch', await h.signed({ ...activationContext, ...controlContext() }, h.device), no('control_power'));
    await append('stale expected source before fetch', await activate(role, base.root === expectedDefinition ? role.root : base.root), no('definition_changed'));
    await append('semantic mismatch before unsupported target program', await activate(mismatch), no('incompatible_definition'));
    await append('changed state-only projection incompatible', await activate(incompatible), no('incompatible_definition'));
    await append('complete signed omission cannot use global pool repair', await activate(role, expectedDefinition, role.closure.filter((cid) => cid !== role.closure.find((cid) => cid !== role.root))), no('invalid_activation'));
    await append('activation retains current state instead of new initial', await activate(role), yes, 2, role.root);
    await append('same-source activation has no invented no-op denial', await activate(role), yes);
    await append('changed derived execution', await act(base.execution), no('execution_changed'));
    const roleDisable = {
        $type: nativeRef('setRole'),
        ...controlContext(),
        target: h.actor.principal,
        role: 'member',
        enabled: false,
        expectedAssignment: link(genesisCid),
    };
    await append('govern disables genesis role', await h.signed(roleDisable, h.control), yes);
    await append('missing role beats changed execution', await act(base.execution), no('role_missing'));
    await append('govern re-enables role at exact revision', await h.signed({
        ...roleDisable,
        ...controlContext(),
        enabled: true,
        expectedAssignment: link(app.snapshot().authority.roles[0].revision),
    }, h.control), yes);
    await append('eligible current role action', await act(role.execution, { amount: 3 }), yes, 5);
    await append('activate authored denial', await activate(denied), yes, 5, denied.root);
    await append('authored framework-looking reason remains fold namespace', await act(denied.execution), {
        decision: 'ineffective',
        reason: 'invalid_activation',
        message: 'authored',
        source: 'fold',
    });
    await append('activate malformed fold output source', await activate(malformed), yes, 5, malformed.root);
    await append('fold cannot inject framework provenance', await act(malformed.execution), no('fold_failed/fold_output'));
    await append('activate successor rejection source', await activate(invalidState), yes, 5, invalidState.root);
    await append('successor schema failure retains current state', await act(invalidState.execution), no('fold_failed/schema_value'));
    await append('activate exact bounded Unicode denial', await activate(message), yes, 5, message.root);
    await append('1024 astral code points and 4096 bytes retained exactly', await act(message.execution), {
        decision: 'ineffective',
        source: 'fold',
        reason: 'denied',
        message: legalMessage,
    });
    await append('activate over-bound Unicode message source', await activate(overMessage), yes, 5, overMessage.root);
    await append('one code point over message bound is fold_failed', await act(overMessage.execution), no('fold_failed/fold_message'));
    await append('activate escaped surrogate literal source', await activate(unicode), yes, 5, unicode.root);
    await append('malformed surrogate output is fold_failed/unicode', await act(unicode.execution), no('fold_failed/unicode'));
    await append('activate original action source again', await activate(base), yes, 5, base.root);
    await append('effective action after multiple activations', await act(base.execution, { amount: 4 }), yes, 9);
    const revokeCid = await h.account(NATIVE_NSID.revoke, id, {
        $type: NATIVE_NSID.revoke,
        version: 1,
        id,
        app: genesis.app,
        genesis: link(genesisCid),
    });
    const current = app.snapshot().authority, principal = current.principals.find((row) => row.principal === h.actor.principal);
    const revoke = {
        $type: nativeRef('accountOperation'),
        app: genesis.app,
        genesis: link(genesisCid),
        position: current.frontier.position + 1,
        prev: link(current.frontier.entry),
        principal: h.actor.principal,
        expectedEpoch: link(principal.epoch),
        expectedObservation: link(principal.observation.cid),
        operation: { $type: nativeRef('revokeGrant'), revoke: { id, cid: link(revokeCid) } },
        observation: link(genesisCid),
    };
    revoke.observation = link(await h.observe(revoke, [`${NATIVE_NSID.revoke}/${id}`]));
    await append('terminal grant revocation through authentic account observation', revoke, yes);
    await append('revocation beats known action absence', await act(base.execution, { amount: 1 }, 'ai.generalbusiness.atseq.example#missing'), no('grant_revoked'));
    const repeated = {
        ...vectors.at(-1).entry,
        position: vectors.length + 1,
        prev: link(await contentCid(vectors.at(-1).entry)),
    };
    h.appRecords.set(nativeEntryPath(genesisCid, repeated.position), encodeBlock(repeated));
    h.appRecords.set(nativeHeadPath(genesisCid), encodeBlock({
        $type: NATIVE_NSID.head,
        version: 2,
        app: genesis.app,
        genesis: link(genesisCid),
        position: repeated.position,
        entry: link(await contentCid(repeated)),
    }));
    const duplicate = await authorityRepo(h.app.principal, h.app.key, h.appRecords, repeated.position);
    return {
        duplicateCar: [...duplicate.car],
        genesis,
        genesisCid,
        appKey: h.app.signing,
        appIdentity: { auditBytes: [...evidence.auditBytes], selectedTipCid: evidence.selectedTipCid },
        sourceBlocks: [...sourceBlocks].map(([cid, raw]) => [cid, [...raw]]),
        retainedContent: [...h.content].map(([cid, raw]) => [cid, [...raw]]),
        vectors,
    };
}
