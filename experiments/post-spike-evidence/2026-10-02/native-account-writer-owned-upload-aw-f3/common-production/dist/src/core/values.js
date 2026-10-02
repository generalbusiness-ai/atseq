import { InterpretationError, PROFILE } from './profile.js';
const encoder = new TextEncoder();
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
export function safeName(name) {
    return !forbidden.has(name) && !name.startsWith('_jsonata_');
}
/** Validate without coercion; canonical JSON is for evaluation caps, not wire signing. */
export function canonicalJson(value, maxBytes = PROFILE.inputBytes, maxDepth = PROFILE.inputDepth, charge, engineArrays = false, intermediate = false) {
    let bytes = 0;
    const active = new Set();
    function token(text, ascii = false) {
        const size = ascii ? text.length : encoder.encode(text).length;
        charge?.(size);
        bytes += size;
        if (bytes > maxBytes)
            throw new InterpretationError('value_bytes', `Value exceeds ${maxBytes} UTF-8 bytes`);
        return text;
    }
    function walk(v, depth, path) {
        if (v === null || typeof v === 'boolean')
            return token(String(v), true);
        if (typeof v === 'number') {
            if (!Number.isSafeInteger(v) || (!intermediate && Object.is(v, -0)))
                throw new InterpretationError('wire_number', `${path}: expected safe integer, excluding negative zero`);
            return token(String(v), true);
        }
        if (typeof v === 'string') {
            if (!v.isWellFormed())
                throw new InterpretationError('unicode', `${path}: unpaired surrogate`);
            return token(JSON.stringify(v));
        }
        if (!v || typeof v !== 'object')
            throw new InterpretationError('wire_value', `${path}: unsupported value`);
        if (depth >= maxDepth)
            throw new InterpretationError('value_depth', `${path}: container depth exceeds ${maxDepth}`);
        if (active.has(v))
            throw new InterpretationError('wire_value', `${path}: cycle`);
        active.add(v);
        if (Object.getOwnPropertySymbols(v).length)
            throw new InterpretationError('wire_value', `${path}: symbol property`);
        let result;
        if (Array.isArray(v)) {
            if (Object.getPrototypeOf(v) !== Array.prototype)
                throw new InterpretationError('wire_value', `${path}: expected plain array`);
            for (const key of Object.keys(v)) {
                if (/^(0|[1-9][0-9]*)$/.test(key) && Number(key) < v.length)
                    continue;
                if (engineArrays && ['sequence', 'outerWrapper', 'keepSingleton', 'cons', 'tupleStream', 'push'].includes(key))
                    continue;
                throw new InterpretationError('wire_value', `${path}: extra array property ${key}`);
            }
            token('[', true);
            const parts = [];
            for (let i = 0; i < v.length; i++) {
                if (i)
                    token(',', true);
                if (!Object.hasOwn(v, i))
                    throw new InterpretationError('wire_value', `${path}: sparse array`);
                const desc = Object.getOwnPropertyDescriptor(v, i);
                if (!('value' in desc))
                    throw new InterpretationError('wire_value', `${path}/${i}: accessor`);
                parts.push(walk(desc.value, depth + 1, `${path}/${i}`));
            }
            token(']', true);
            result = `[${parts.join(',')}]`;
        }
        else {
            if (Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null)
                throw new InterpretationError('wire_value', `${path}: expected plain object`);
            token('{', true);
            const parts = [];
            for (const key of Object.keys(v).sort()) {
                if (!safeName(key))
                    throw new InterpretationError('reserved_key', `${path}/${key}: reserved in this profile`);
                if (!key.isWellFormed())
                    throw new InterpretationError('unicode', `${path}: invalid Unicode key`);
                if (parts.length)
                    token(',', true);
                const name = token(JSON.stringify(key));
                token(':', true);
                const desc = Object.getOwnPropertyDescriptor(v, key);
                if (!('value' in desc))
                    throw new InterpretationError('wire_value', `${path}/${key}: accessor`);
                parts.push(`${name}:${walk(desc.value, depth + 1, `${path}/${key}`)}`);
            }
            token('}', true);
            result = `{${parts.join(',')}}`;
        }
        active.delete(v);
        return result;
    }
    return walk(value, 0, '$');
}
export function jsonCopy(value, maxBytes, engineArrays = false) {
    return JSON.parse(canonicalJson(value, maxBytes, undefined, undefined, engineArrays));
}
//# sourceMappingURL=values.js.map