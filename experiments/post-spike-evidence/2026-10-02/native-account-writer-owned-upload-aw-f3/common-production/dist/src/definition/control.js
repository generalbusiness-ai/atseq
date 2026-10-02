import { AtseqError } from '../core/errors.js';
import { NSID } from '../core/nsids.js';
import { Lexicons, ValidationError } from '@atproto/lexicon';
import { fromString, toString, CODEC_DCBOR, CODEC_RAW } from '@atcute/cid';
import schema from '../../lexicons/ai/generalbusiness/atseq/activate.json' with { type: 'json' };
import { InterpretationError } from '../core/profile.js';
import { isCidInputError, link } from '../protocol/wire.js';
export const ACTIVATE = NSID.activate;
const lexicons = new Lexicons([schema]);
export function activationPayload(value) {
    try {
        const valid = lexicons.validate(ACTIVATE, value);
        if (!valid.success ||
            !value ||
            typeof value !== 'object' ||
            Object.keys(value).some((k) => !['expected', 'definition', 'closure'].includes(k)))
            throw new InterpretationError('invalid_activation', 'Invalid activation payload');
        const payload = structuredClone(value);
        link(payload.expected);
        link(payload.definition);
        if (!payload.closure.includes(payload.definition) ||
            new Set(payload.closure).size !== payload.closure.length ||
            payload.closure.join(',') !== [...payload.closure].sort().join(','))
            throw new InterpretationError('invalid_activation', 'Invalid activation payload');
        for (const cid of payload.closure) {
            let parsed;
            try {
                parsed = fromString(cid);
            }
            catch (error) {
                if (!isCidInputError(error))
                    throw error;
                throw new InterpretationError('invalid_activation', 'Invalid source CID');
            }
            if (![CODEC_RAW, CODEC_DCBOR].includes(parsed.codec) || toString(parsed) !== cid)
                throw new InterpretationError('invalid_activation', 'Invalid source CID');
        }
        return payload;
    }
    catch (error) {
        if (!(error instanceof AtseqError) && !(error instanceof ValidationError) && !isCidInputError(error))
            throw error;
        if (error instanceof AtseqError && error.kind !== 'invalid_input')
            throw error;
        throw new InterpretationError('invalid_activation', 'Activation must name expected/new definition CIDs and a sorted, unique source closure');
    }
}
//# sourceMappingURL=control.js.map