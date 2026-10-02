/** Internal native-format preparation; not registered with current supportedProfiles. */
import { isAtprotoDid } from '@atproto/did';
import { Lexicons, jsonToLex, lexToJson } from '@atproto/lexicon';
import { deepFreeze } from '../core/freeze.js';
import definition from '../../lexicons/ai/generalbusiness/atseq/definition.json' with { type: 'json' };
import { encodeBlock, ProtocolError, sameBytes } from './wire.js';
const prefix = 'ai.generalbusiness.atseq';
export const NATIVE_NSID = deepFreeze({
    genesis: `${prefix}.genesis`,
    head: `${prefix}.head`,
    entry: `${prefix}.entry`,
    definition: `${prefix}.definition`,
    epoch: `${prefix}.epoch`,
    epochCurrent: `${prefix}.epochCurrent`,
    grant: `${prefix}.grant`,
    revoke: `${prefix}.revoke`,
    file: `${prefix}.file`,
    content: `${prefix}.content`,
    defs: `${prefix}.defs`,
});
export const nativeRef = (name) => `ai.generalbusiness.atseq.defs#${name}`;
const str = (maxLength, format) => ({
    type: 'string',
    maxLength,
    ...(format ? { format } : {}),
});
const integer = (maximum, minimum = 0) => ({ type: 'integer', minimum, maximum });
const cid = { type: 'cid-link' };
const did = str(2048, 'did'), key = str(128, 'did'), bool = { type: 'boolean' };
const binary = (length, minimum = length) => ({ type: 'bytes', minLength: minimum, maxLength: length });
const ref = (name) => ({ type: 'ref', ref: nativeRef(name) });
const array = (items, maxLength, minLength = 0) => ({
    type: 'array',
    items,
    maxLength,
    minLength,
});
const object = (properties, nullable = []) => ({
    type: 'object',
    required: Object.keys(properties),
    ...(nullable.length ? { nullable } : {}),
    properties,
});
const union = (...names) => ({ type: 'union', closed: true, refs: names.map(nativeRef) });
const pair = object({ principal: did, actorKey: key });
const grantId = str(26), role = str(64), scope = object({ action: str(300), execution: cid });
const appointment = object({
    principal: did,
    actorKey: key,
    powers: array({ type: 'string', enum: ['certify', 'govern', 'recover'] }, 3, 1),
});
const context = { position: integer(Number.MAX_SAFE_INTEGER, 1), prev: cid, controlTip: cid };
const grantContext = { grant: object({ id: grantId, cid }), epoch: cid };
const evidence = union('plcAudit', 'webDocument');
const binding = object({ signingKeyDid: key, pdsOrigin: str(2048, 'uri') });
const definitions = {
    path: object({ collection: str(317, 'nsid'), rkey: str(512, 'record-key') }),
    act: object({ ...grantContext, action: str(300), execution: cid, payload: { type: 'unknown' } }),
    assignRole: object({ ...grantContext, target: did, role, enabled: bool, expectedAssignment: cid }, [
        'expectedAssignment',
    ]),
    setControl: object({ ...context, control: array(appointment, 16) }),
    // Shape preparation only. Power transitions belong to the separately reviewed authority reducer.
    setRecovery: object({ ...context, recovery: array(pair, 16, 1) }),
    setOwner: object({ ...context, owner: did }, ['owner']),
    setRole: object({ ...context, target: did, role, enabled: bool, expectedAssignment: cid }, ['expectedAssignment']),
    activate: object({ ...context, expected: cid, definition: cid, closure: array(str(128, 'cid'), 64, 1) }),
    recoverParticipant: object({ ...context, target: did, expectedEpoch: cid, expectedObservation: cid, epoch: cid, observation: cid }, ['expectedEpoch', 'expectedObservation']),
    recoverGovernance: object({ ...context, governance: array(pair, 16) }),
    intent: object({
        version: { type: 'integer', const: 2 },
        app: did,
        genesis: cid,
        principal: did,
        actorKey: key,
        nonce: binary(16),
        operation: union('act', 'assignRole', 'setControl', 'setRecovery', 'setOwner', 'setRole', 'activate', 'recoverParticipant', 'recoverGovernance'),
    }),
    signedRequest: object({ intent: ref('intent'), sig: binary(64) }),
    admitGrant: object({ grant: object({ id: grantId, cid }) }),
    advanceEpoch: object({ epoch: cid }),
    revokeGrant: object({ revoke: object({ id: grantId, cid }) }),
    accountOperation: object({
        app: did,
        genesis: cid,
        position: integer(Number.MAX_SAFE_INTEGER, 1),
        prev: cid,
        principal: did,
        expectedEpoch: cid,
        expectedObservation: cid,
        operation: union('admitGrant', 'advanceEpoch', 'revokeGrant'),
        observation: cid,
    }, ['expectedEpoch', 'expectedObservation']),
    receipt: object({
        version: { type: 'integer', const: 2 },
        app: did,
        genesis: cid,
        request: cid,
        position: integer(Number.MAX_SAFE_INTEGER, 1),
        entry: cid,
        publication: object({ root: cid, binding: cid, proofs: array(cid, 16, 1), head: cid }, ['head']),
    }),
    byteChunk: object({ bytes: binary(32 * 1024, 1) }),
    byteManifest: object({ byteLength: integer(32 * 1024 * 1024), chunks: array(cid, 1024) }),
    observationPolicy: object({
        algorithm: { type: 'string', const: 'atseq-account-observation-v1' },
        plcDirectory: str(2048, 'uri'),
        allowWeb: bool,
        checkpoint: { type: 'string', const: 'native-publication-v1' },
    }),
    plcAudit: object({ bytes: cid, source: str(2048, 'uri'), selectedTip: cid }),
    webDocument: object({ bytes: cid, source: str(2048, 'uri') }),
    observation: object({
        policy: cid,
        principal: did,
        context: object({ app: did, genesis: cid, position: integer(Number.MAX_SAFE_INTEGER, 1), prev: cid, subject: cid }),
        binding,
        before: evidence,
        after: evidence,
        repositoryRoot: cid,
        records: array(object({ path: str(1024), cid }), 16, 1),
        proofs: array(cid, 16, 1),
        observedAt: str(24, 'datetime'),
    }),
    appBinding: object({ policy: cid, principal: did, binding, before: evidence, after: evidence, repositoryRoot: cid }),
    openParticipation: object({}),
    requiredRole: object({ role }),
    actionContract: object({
        semantics: cid,
        schemas: object({ stateRoot: str(300), actionRoot: str(300), closure: cid }),
        fold: str(128, 'cid'),
        authorization: union('openParticipation', 'requiredRole'),
    }),
};
const record = (name, properties, nullable = [], literal) => ({
    lexicon: 1,
    id: `${prefix}.${name}`,
    defs: {
        main: {
            type: 'record',
            key: literal ? `literal:${literal}` : 'any',
            record: object({ version: { type: 'integer', const: ['genesis', 'head', 'entry'].includes(name) ? 2 : 1 }, ...properties }, nullable),
        },
    },
});
const appScope = { app: did, genesis: cid };
const nativeDefinition = structuredClone(definition);
nativeDefinition.defs.main = { type: 'record', key: 'any', record: nativeDefinition.defs.main };
nativeDefinition.defs.main.record.properties.version.const = 2;
nativeDefinition.defs.action.required.push('authorization');
nativeDefinition.defs.action.properties.authorization = union('openParticipation', 'requiredRole');
export const nativeLexicons = deepFreeze([
    { lexicon: 1, id: NATIVE_NSID.defs, defs: definitions },
    record('genesis', {
        app: did,
        creation: binary(16),
        semantics: cid,
        definition: cid,
        observationPolicy: cid,
        control: array(appointment, 16),
        recoverGovernance: bool,
        owner: did,
        roles: array(object({ principal: did, role }), 63),
    }, ['owner']),
    record('head', { ...appScope, position: integer(Number.MAX_SAFE_INTEGER), entry: cid }),
    record('entry', {
        ...appScope,
        position: integer(Number.MAX_SAFE_INTEGER, 1),
        prev: cid,
        request: union('signedRequest', 'accountOperation'),
    }),
    record('epoch', { id: binary(16), previous: cid }, ['previous']),
    record('epochCurrent', { epoch: cid, id: binary(16) }, [], 'self'),
    record('grant', {
        id: grantId,
        ...appScope,
        epoch: cid,
        actorKey: key,
        actions: array(scope, 63),
        assignRoles: array(role, 63),
    }),
    record('revoke', { id: grantId, ...appScope }),
    record('file', { cid: str(128, 'cid'), bytes: cid }),
    record('content', {
        body: union('byteChunk', 'byteManifest', 'observationPolicy', 'observation', 'appBinding', 'actionContract'),
    }),
    nativeDefinition,
]);
const registry = new Lexicons(structuredClone([...nativeLexicons]));
const typed = new Set(Object.keys(definitions).map(nativeRef));
const withoutLex = (value) => value.replace(/^lex:/, '');
/** Account syntax only; identity ownership/currentness requires retained I1 evidence. */
export function validateNativeAccountDid(value) {
    if (typeof value !== 'string' ||
        value.length > 2048 ||
        !isAtprotoDid(value) ||
        (value.startsWith('did:web:') && /%3a/i.test(value)))
        throw new ProtocolError('envelope', 'Expected PLC or hostname-only web account DID');
}
/** Strict owned shape. This does not establish native publication or interpret authority. */
export function validateNativeShape(ref, value) {
    const original = encodeBlock(value);
    function close(schema, data, expectedType) {
        if (!schema)
            throw new ProtocolError('envelope', 'Unknown native schema');
        if (schema.type === 'string' && schema.format === 'did' && schema.maxLength === 2048)
            validateNativeAccountDid(data);
        if (schema.type === 'record')
            return close(schema.record, data, expectedType);
        if (schema.type === 'ref') {
            const target = withoutLex(schema.ref);
            return close(registry.getDef(schema.ref), data, expectedType ?? (typed.has(target) ? target : undefined));
        }
        if (schema.type === 'union') {
            if (!data || !schema.refs.map(withoutLex).includes(data.$type))
                throw new ProtocolError('envelope', 'Unknown native union member');
            return close(registry.getDef(data.$type), data, data.$type);
        }
        if (schema.type === 'object') {
            if (!data || typeof data !== 'object' || Array.isArray(data))
                throw new ProtocolError('envelope', 'Expected native object');
            if (expectedType && data.$type !== expectedType)
                throw new ProtocolError('envelope', `Expected ${expectedType}`);
            for (const [field, child] of Object.entries(data)) {
                if (field === '$type' && expectedType)
                    continue;
                if (!Object.hasOwn(schema.properties, field))
                    throw new ProtocolError('envelope', `Unknown native field ${field}`);
                if (child === null && schema.nullable?.includes(field))
                    continue;
                close(schema.properties[field], child);
            }
        }
        else if (schema.type === 'array' && Array.isArray(data))
            data.forEach((child) => close(schema.items, child));
    }
    close(registry.getDef(ref), value, ref);
    const result = registry.validate(ref, jsonToLex(value));
    if (!result.success)
        throw new ProtocolError('envelope', result.error.message);
    if (!sameBytes(original, encodeBlock(lexToJson(result.value))))
        throw new ProtocolError('envelope', 'Native validation changed content');
}
//# sourceMappingURL=native-schema.js.map