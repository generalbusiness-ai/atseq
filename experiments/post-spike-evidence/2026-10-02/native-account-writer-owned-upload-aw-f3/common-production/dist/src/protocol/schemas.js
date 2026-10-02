import { deepFreeze } from '../core/freeze.js';
import { Lexicons, jsonToLex, lexToJson } from '@atproto/lexicon';
import defs from '../../lexicons/ai/generalbusiness/atseq/defs.json' with { type: 'json' };
import genesis from '../../lexicons/ai/generalbusiness/atseq/genesis.json' with { type: 'json' };
import entry from '../../lexicons/ai/generalbusiness/atseq/entry.json' with { type: 'json' };
import head from '../../lexicons/ai/generalbusiness/atseq/head.json' with { type: 'json' };
import create from '../../lexicons/ai/generalbusiness/atseq/create.json' with { type: 'json' };
import describe from '../../lexicons/ai/generalbusiness/atseq/describe.json' with { type: 'json' };
import definition from '../../lexicons/ai/generalbusiness/atseq/definition.json' with { type: 'json' };
import submit from '../../lexicons/ai/generalbusiness/atseq/submit.json' with { type: 'json' };
import query from '../../lexicons/ai/generalbusiness/atseq/query.json' with { type: 'json' };
import receipt from '../../lexicons/ai/generalbusiness/atseq/receipt.json' with { type: 'json' };
import { encodeBlock, sameBytes, ProtocolError } from './wire.js';
import { PROFILE } from '../core/profile.js';
export const frameworkLexicons = deepFreeze([
    defs,
    genesis,
    entry,
    head,
    create,
    describe,
    definition,
    submit,
    query,
    receipt,
]);
const lexicons = new Lexicons(structuredClone([...frameworkLexicons]));
/** Lexicon owns the shape; v1 additionally closes framework objects to extra keys. */
export function validateFramework(ref, value) {
    const original = encodeBlock(value);
    function closed(schema, data, expectedType) {
        if (schema.type === 'record')
            return closed(schema.record, data, expectedType);
        if (schema.type === 'ref')
            return closed(lexicons.getDef(schema.ref), data, schema.ref.replace(/^lex:/, ''));
        if (schema.type === 'object') {
            if (!data || typeof data !== 'object' || Array.isArray(data))
                throw new ProtocolError('envelope', 'Expected a framework object');
            if (expectedType && data.$type !== expectedType)
                throw new ProtocolError('envelope', `Expected $type ${expectedType}`);
            for (const [key, child] of Object.entries(data)) {
                if (key === '$type')
                    continue;
                if (key === 'message' && typeof child === 'string' && [...child].length > PROFILE.foldMessageLength)
                    throw new ProtocolError('envelope', 'Framework message exceeds 1024 Unicode code points');
                if (!Object.hasOwn(schema.properties, key))
                    throw new ProtocolError('envelope', `Unknown framework field ${key}`);
                closed(schema.properties[key], child);
            }
        }
        else if (schema.type === 'array' && Array.isArray(data))
            data.forEach((v) => closed(schema.items, v));
    }
    const schema = lexicons.getDef(ref);
    if (!schema)
        throw new ProtocolError('envelope', `Unknown framework schema ${ref}`);
    closed(schema, value, ref);
    const result = lexicons.validate(ref, jsonToLex(value));
    if (!result.success)
        throw new ProtocolError('envelope', result.error.message);
    if (!sameBytes(original, encodeBlock(lexToJson(result.value))))
        throw new ProtocolError('envelope', 'Schema validation changed signed content');
}
//# sourceMappingURL=schemas.js.map