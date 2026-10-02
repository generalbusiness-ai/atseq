import { isUtf8 } from '../core/utf8.js';
import { ProtocolError } from '../protocol/wire.js';
/** One bounded JSON request parser for host procedures. */
export async function readInput(req, limit) {
    if (req.headers['content-type']?.split(';')[0] !== 'application/json')
        throw new ProtocolError('input', 'Expected JSON');
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        size += chunk.length;
        if (size > limit)
            throw new ProtocolError('input', 'Request exceeds transport limit');
        chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks);
    if (!isUtf8(raw))
        throw new ProtocolError('input', 'Expected UTF-8 JSON');
    const text = new TextDecoder('utf-8', { fatal: true }).decode(raw);
    try {
        return JSON.parse(text);
    }
    catch (error) {
        if (!(error instanceof SyntaxError))
            throw error;
        throw new ProtocolError('input', 'Expected valid JSON');
    }
}
//# sourceMappingURL=input.js.map