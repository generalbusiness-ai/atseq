import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { P256PrivateKeyExportable, Secp256k1PrivateKeyExportable } from '@atcute/crypto';
import { deriveDidFromGenesisOp, signOperation, signTombstone, } from '@atcute/did-plc';
import { fromBase64Url, toBase64Url, toBase58Btc } from '@atcute/multibase';
import { Point } from '@noble/secp256k1';
import { AtseqError } from "../../../aw-f3/installed-consumer-final/node_modules/atseq/dist/src/core/errors.js";
import { deriveIdentityBinding, sameIdentityObservation } from "../../../aw-f3/installed-consumer-final/node_modules/atseq/dist/src/protocol/identity-binding.js";
import { parseIdentityJson } from "../../../aw-f3/installed-consumer-final/node_modules/atseq/dist/src/protocol/identity-json.js";
const encode = (value) => new TextEncoder().encode(JSON.stringify(value));
const cid = (value) => CID.toString(CID.createSync(CID.CODEC_DCBOR, CBOR.encode(value)));
function check(value, message) {
    if (!value)
        throw new Error(message);
}
async function rejects(operation, name, code = 'input') {
    let caught;
    try {
        await operation();
    }
    catch (error) {
        caught = error;
    }
    check(caught instanceof AtseqError && caught.code === code, `${name}: expected ${code} error, got ${String(caught)}`);
}
export async function plcIdentityFixture(type = 'p256') {
    const key = await (type === 'p256' ? P256PrivateKeyExportable : Secp256k1PrivateKeyExportable).createKeypair();
    const recovery = await P256PrivateKeyExportable.createKeypair();
    const signing = await key.exportPublicKey('did');
    const recoveryDid = await recovery.exportPublicKey('did');
    const unsigned = {
        type: 'plc_operation',
        prev: null,
        rotationKeys: [recoveryDid, signing],
        verificationMethods: { atproto: signing },
        alsoKnownAs: ['at://alice.example'],
        services: { atproto_pds: { type: 'AtprotoPersonalDataServer', endpoint: 'https://pds.example' } },
    };
    const genesis = await signOperation(unsigned, key), principal = await deriveDidFromGenesisOp(genesis);
    const row = (operation, createdAt) => ({
        did: principal,
        operation,
        cid: cid(operation),
        createdAt,
        nullified: false,
    });
    const first = row(genesis, '2026-10-01T00:00:00.000Z');
    const next = await signOperation({ ...unsigned, prev: first.cid, alsoKnownAs: ['at://renamed.example'] }, key);
    const second = row(next, '2026-10-01T00:01:00.000Z');
    return { key, recovery, principal, signing, unsigned, rows: [first, second], selectedTipCid: second.cid };
}
export async function identityCorpus() {
    const cases = [];
    const passed = (name) => cases.push(name);
    check(parseIdentityJson(encode({ id: 'good', nested: [{ name: 1 }] }), 100).id === 'good', 'JSON roundtrip');
    passed('strict retained JSON positive');
    for (const [name, raw] of [
        ['duplicate names', '{"id":1,"id":2}'],
        ['escaped duplicate names', '{"id":1,"\\u0069d":2}'],
        ['nested duplicate names', '{"a":[{"x":1,"x":2}]}'],
        ['comment', '{/* no */"id":1}'],
        ['trailing comma', '{"id":1,}'],
        ['trailing value', '{}{}'],
        ['empty JSON', ''],
        ['deep JSON', '['.repeat(33) + '0' + ']'.repeat(33)],
    ]) {
        await rejects(() => parseIdentityJson(new TextEncoder().encode(raw), 1000), name, name === 'deep JSON' ? 'content_unavailable' : 'input');
        passed(name);
    }
    await rejects(() => parseIdentityJson(new Uint8Array([0xef, 0xbb, 0xbf, 0x7b, 0x7d]), 100), 'BOM');
    passed('UTF-8 BOM rejected');
    await rejects(() => parseIdentityJson(new Uint8Array([0x22, 0xc3, 0x22]), 100), 'invalid UTF8');
    passed('fatal UTF-8');
    await rejects(() => parseIdentityJson(encode({}), 1), 'byte budget', 'content_unavailable');
    passed('response budget before parsing');
    check(Array.isArray(parseIdentityJson(new TextEncoder().encode('['.repeat(32) + '0' + ']'.repeat(32)), 100)), 'depth32 boundary');
    passed('JSON depth32 accepted');
    const fixtures = [];
    for (const type of ['p256', 'secp256k1']) {
        const fixture = await plcIdentityFixture(type);
        fixtures.push(fixture);
        const evidence = {
            assuranceClass: 'plc-audit-v1',
            auditBytes: encode(fixture.rows),
            selectedTipCid: fixture.selectedTipCid,
        };
        const full = await deriveIdentityBinding(fixture.principal, evidence);
        check(full.signingKeyDid === fixture.signing &&
            full.pdsOrigin === 'https://pds.example' &&
            full.assuranceClass === 'plc-audit-v1', 'PLC binding differs');
        await rejects(() => deriveIdentityBinding(fixture.principal, { ...evidence, selectedTipCid: fixture.rows[0].cid }), 'full-log older selection');
        passed(`${type} whole-log canonical tip, earlier selection rejected`);
        const truncated = await deriveIdentityBinding(fixture.principal, {
            ...evidence,
            auditBytes: encode([fixture.rows[0]]),
            selectedTipCid: fixture.rows[0].cid,
        });
        check(truncated.signingKeyDid === full.signingKeyDid && truncated.pdsOrigin === full.pdsOrigin, 'truncated authentic history changed binding');
        check(!sameIdentityObservation(truncated, full), 'equal key/PDS hid PLC tip change');
        passed(`${type} truncated authenticity is not latestness; before/after compares tips`);
        const wrongIssuer = fixture.rows.map((row) => ({ ...row, did: 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa' }));
        await rejects(() => deriveIdentityBinding(fixture.principal, { ...evidence, auditBytes: encode(wrongIssuer) }), 'wrong issuer');
        passed(`${type} exact genesis DID and row issuer`);
        await rejects(() => deriveIdentityBinding('did:plc:aaaaaaaaaaaaaaaaaaaaaaaa', { ...evidence, auditBytes: encode(wrongIssuer) }), 'invented principal binding');
        passed(`${type} signed genesis cannot invent another principal`);
        const changedSignature = fixture.rows.map((row, index) => {
            if (!index)
                return row;
            const operation = { ...row.operation, sig: 'A'.repeat(86) };
            return { ...row, operation, cid: cid(operation) };
        });
        await rejects(() => deriveIdentityBinding(fixture.principal, { ...evidence, auditBytes: encode(changedSignature) }), 'invalid signature');
        passed(`${type} invalid operation signature`);
        const original = fixture.rows[1], bytes = fromBase64Url(original.operation.sig);
        const order = type === 'p256'
            ? 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n
            : 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
        let scalar = 0n;
        for (const byte of bytes.subarray(32))
            scalar = scalar * 256n + BigInt(byte);
        let high = order - scalar;
        for (let index = 63; index >= 32; index--) {
            bytes[index] = Number(high & 255n);
            high >>= 8n;
        }
        const highOperation = { ...original.operation, sig: toBase64Url(bytes) }, highCid = cid(highOperation);
        await rejects(() => deriveIdentityBinding(fixture.principal, {
            ...evidence,
            selectedTipCid: highCid,
            auditBytes: encode([fixture.rows[0], { ...original, operation: highOperation, cid: highCid }]),
        }), 'high-S signature');
        passed(`${type} valid-hash high-S signature rejected`);
        const paddedOperation = { ...original.operation, sig: original.operation.sig + '=' }, paddedCid = cid(paddedOperation);
        await rejects(() => deriveIdentityBinding(fixture.principal, {
            ...evidence,
            selectedTipCid: paddedCid,
            auditBytes: encode([fixture.rows[0], { ...original, operation: paddedOperation, cid: paddedCid }]),
        }), 'padded signature');
        passed(`${type} canonical unpadded signature encoding`);
        const tombstone = await signTombstone({ type: 'plc_tombstone', prev: original.cid }, fixture.key);
        const tombstoneCid = cid(tombstone), tombstoneRows = [
            ...fixture.rows,
            {
                did: fixture.principal,
                operation: tombstone,
                cid: tombstoneCid,
                nullified: false,
                createdAt: '2026-10-01T00:03:00.000Z',
            },
        ];
        for (const selectedTipCid of [original.cid, tombstoneCid])
            await rejects(() => deriveIdentityBinding(fixture.principal, { ...evidence, auditBytes: encode(tombstoneRows), selectedTipCid }), 'tombstone tip');
        passed(`${type} tombstone tip cannot select older active operation`);
        const duplicate = [...fixture.rows, fixture.rows[1]];
        await rejects(() => deriveIdentityBinding(fixture.principal, { ...evidence, auditBytes: encode(duplicate) }), 'duplicate CID');
        passed(`${type} duplicate operation CID`);
        const falseNullified = fixture.rows.map((row, index) => (index ? { ...row, nullified: true } : row));
        await rejects(() => deriveIdentityBinding(fixture.principal, { ...evidence, auditBytes: encode(falseNullified) }), 'false unsigned nullification');
        passed(`${type} nullification annotations checked`);
        const recoveredOperation = await signOperation({ ...fixture.unsigned, prev: fixture.rows[0].cid }, fixture.recovery);
        const recovered = {
            did: fixture.principal,
            operation: recoveredOperation,
            cid: cid(recoveredOperation),
            nullified: false,
            createdAt: '2026-10-01T00:02:00.000Z',
        };
        const recoveryRows = [fixture.rows[0], { ...fixture.rows[1], nullified: true }, recovered];
        const recoveryResult = await deriveIdentityBinding(fixture.principal, {
            ...evidence,
            auditBytes: encode(recoveryRows),
            selectedTipCid: recovered.cid,
        });
        check(recoveryResult.signingKeyDid === fixture.signing, 'recovery binding differs');
        await rejects(() => deriveIdentityBinding(fixture.principal, {
            ...evidence,
            auditBytes: encode(recoveryRows.map((r, i) => (i === 2 ? { ...r, createdAt: '2026-10-01T00:01:00.000Z' } : r))),
            selectedTipCid: recovered.cid,
        }), 'equal-time recovery');
        passed(`${type} higher-priority recovery and strict timestamp ordering`);
        const altered = fixture.rows.map((row, index) => index ? { ...row, operation: { ...row.operation, unknown: true } } : row);
        await rejects(() => deriveIdentityBinding(fixture.principal, { ...evidence, auditBytes: encode(altered) }), 'unknown signed field');
        passed(`${type} no lossy signed-field projection`);
    }
    const fixture = fixtures[0];
    for (const [name, auditBytes] of [
        ['PLC total response budget', new Uint8Array(1024 * 1024 + 1)],
        ['PLC row budget', encode(Array.from({ length: 513 }, () => fixture.rows[0]))],
        [
            'PLC operation array budget',
            encode([
                {
                    ...fixture.rows[0],
                    operation: {
                        ...fixture.unsigned,
                        sig: fixture.rows[0].operation.sig,
                        alsoKnownAs: Array.from({ length: 65 }, () => 'at://a.example'),
                    },
                },
            ]),
        ],
        [
            'PLC operation byte budget',
            encode([
                {
                    ...fixture.rows[0],
                    operation: {
                        ...fixture.unsigned,
                        sig: fixture.rows[0].operation.sig,
                        alsoKnownAs: ['at://' + 'a'.repeat(7600)],
                    },
                },
            ]),
        ],
    ]) {
        await rejects(() => deriveIdentityBinding(fixture.principal, {
            assuranceClass: 'plc-audit-v1',
            auditBytes,
            selectedTipCid: fixture.selectedTipCid,
        }), name, 'content_unavailable');
        passed(name);
    }
    const principal = 'did:web:alice.example';
    const document = {
        id: principal,
        verificationMethod: [
            { id: '#atproto', controller: principal, type: 'Multikey', publicKeyMultibase: fixture.signing.slice(8) },
        ],
        service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.example/' }],
    };
    const web = (doc = document) => deriveIdentityBinding(principal, { assuranceClass: 'web-observation-v1', documentBytes: encode(doc) });
    const firstWeb = await web();
    check(firstWeb.signingKeyDid === fixture.signing &&
        firstWeb.pdsOrigin === 'https://pds.example' &&
        firstWeb.assuranceClass === 'web-observation-v1', 'web binding differs');
    check(sameIdentityObservation(firstWeb, await web({ ...document, alsoKnownAs: ['at://renamed.example'] })), 'unrelated web field changed binding');
    passed('web observation assurance and ignored unrelated metadata');
    await rejects(() => web({ ...document, id: 'did:web:wrong.example' }), 'wrong document DID');
    passed('web exact document DID');
    await rejects(() => deriveIdentityBinding('did:web:alice.example:path', {
        assuranceClass: 'web-observation-v1',
        documentBytes: encode(document),
    }), 'path web DID');
    passed('ATproto hostname web restriction');
    await rejects(() => deriveIdentityBinding(principal, {
        assuranceClass: 'plc-audit-v1',
        auditBytes: encode(fixture.rows),
        selectedTipCid: fixture.selectedTipCid,
    }), 'method substitution');
    passed('typed assurance cannot substitute method');
    const qualified = {
        ...document,
        verificationMethod: document.verificationMethod.map((k) => ({ ...k, id: `${principal}#atproto` })),
        service: document.service.map((s) => ({ ...s, id: `${principal}#atproto_pds` })),
    };
    check((await web(qualified)).signingKeyDid === fixture.signing, 'qualified fragment differs');
    passed('relative and own-DID fragments');
    await rejects(() => web({
        ...document,
        verificationMethod: document.verificationMethod.map((k) => ({ ...k, controller: 'did:web:wrong.example' })),
    }), 'wrong controller');
    passed('web key controller');
    await rejects(() => web({
        ...document,
        verificationMethod: document.verificationMethod.map((k) => ({ ...k, type: { toString: null } })),
    }), 'object-valued controller type');
    passed('web controller type is not coerced');
    for (const endpoint of [
        'http://pds.example',
        'https://user:pass@pds.example',
        'https://pds.example/path',
        'https://pds.example?x',
        'https://pds.example#x',
    ]) {
        await rejects(() => web({ ...document, service: [{ ...document.service[0], serviceEndpoint: endpoint }] }), endpoint);
    }
    passed('HTTPS origin endpoint rules');
    await rejects(() => web({
        ...document,
        service: [{ ...document.service[0], serviceEndpoint: 'https://pds.example/path' }, document.service[0]],
    }), 'bad first service');
    passed('first matching bad service cannot fall through');
    await rejects(() => web({ ...document, service: [{ ...document.service[0], type: 'OtherService' }, document.service[0]] }), 'bad type at first ATproto service ID');
    passed('first ATproto service ID with bad type cannot fall through');
    await rejects(() => web({
        ...document,
        verificationMethod: [
            { ...document.verificationMethod[0], controller: 'did:web:foreign.example' },
            document.verificationMethod[0],
        ],
    }), 'foreign controller at first ATproto key ID');
    passed('first ATproto key ID with foreign controller cannot fall through');
    await rejects(() => web({
        ...document,
        verificationMethod: [
            { ...document.verificationMethod[0], type: 'JsonWebKey2020' },
            document.verificationMethod[0],
        ],
    }), 'unsupported type at first ATproto key ID');
    passed('first ATproto key ID with unsupported JsonWebKey2020 cannot fall through');
    await rejects(() => web({ ...document, service: Array.from({ length: 65 }, () => document.service[0]) }), 'array budget', 'content_unavailable');
    passed('web service array budget');
    await rejects(() => deriveIdentityBinding(principal, {
        assuranceClass: 'web-observation-v1',
        documentBytes: new Uint8Array(32 * 1024 + 1),
    }), 'web response budget', 'content_unavailable');
    passed('web response byte budget');
    for (const [index, type] of ['p256', 'secp256k1'].entries()) {
        const fixture = fixtures[index], raw = await fixture.key.exportPublicKey('raw');
        let legacy;
        if (type === 'secp256k1')
            legacy = Point.fromBytes(raw).toBytes(false);
        else {
            const jwk = await fixture.key.exportPublicKey('jwk');
            const imported = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, [
                'verify',
            ]);
            legacy = new Uint8Array(await crypto.subtle.exportKey('raw', imported));
        }
        const method = {
            ...document.verificationMethod[0],
            type: type === 'p256' ? 'EcdsaSecp256r1VerificationKey2019' : 'EcdsaSecp256k1VerificationKey2019',
            publicKeyMultibase: `z${toBase58Btc(legacy)}`,
        };
        check((await web({ ...document, verificationMethod: [method] })).signingKeyDid === fixture.signing, 'legacy key equivalence differs');
        passed(`${type} web legacy/modern canonical key equivalence`);
        const offCurve = new Uint8Array(65);
        offCurve[0] = 4;
        await rejects(() => web({ ...document, verificationMethod: [{ ...method, publicKeyMultibase: `z${toBase58Btc(offCurve)}` }] }), `${type} web off-curve point`);
        passed(`${type} web off-curve legacy point rejected`);
    }
    const legacyUnsigned = {
        type: 'create',
        prev: null,
        signingKey: fixture.signing,
        recoveryKey: await fixture.recovery.exportPublicKey('did'),
        handle: 'legacy.example',
        service: 'pds.example',
    };
    const legacy = { ...legacyUnsigned, sig: toBase64Url(await fixture.key.sign(CBOR.encode(legacyUnsigned))) };
    const legacyDid = await deriveDidFromGenesisOp(legacy), legacyCid = cid(legacy);
    const legacyResult = await deriveIdentityBinding(legacyDid, {
        assuranceClass: 'plc-audit-v1',
        selectedTipCid: legacyCid,
        auditBytes: encode([
            { did: legacyDid, cid: legacyCid, operation: legacy, nullified: false, createdAt: '2026-10-01T00:00:00.000Z' },
        ]),
    });
    check(legacyResult.signingKeyDid === fixture.signing && legacyResult.pdsOrigin === 'https://pds.example', 'legacy exact bytes/normalization differs');
    passed('legacy genesis exact DID/signature before maintained normalization');
    return cases;
}
