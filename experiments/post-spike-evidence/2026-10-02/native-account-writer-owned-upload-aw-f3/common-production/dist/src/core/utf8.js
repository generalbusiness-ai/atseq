/** Check UTF-8 bytes without relying on an engine's TextDecoder diagnostics. */
export function isUtf8(bytes) {
    for (let i = 0; i < bytes.length;) {
        const first = bytes[i++];
        if (first < 0x80)
            continue;
        let remaining, minimum = 0x80, maximum = 0xbf;
        if (first >= 0xc2 && first <= 0xdf)
            remaining = 1;
        else if (first >= 0xe0 && first <= 0xef) {
            remaining = 2;
            if (first === 0xe0)
                minimum = 0xa0; // No overlong encodings.
            if (first === 0xed)
                maximum = 0x9f; // No surrogate code points.
        }
        else if (first >= 0xf0 && first <= 0xf4) {
            remaining = 3;
            if (first === 0xf0)
                minimum = 0x90;
            if (first === 0xf4)
                maximum = 0x8f; // At most U+10FFFF.
        }
        else
            return false;
        if (i + remaining > bytes.length || bytes[i] < minimum || bytes[i] > maximum)
            return false;
        i++;
        while (--remaining > 0) {
            const next = bytes[i++];
            if (next < 0x80 || next > 0xbf)
                return false;
        }
    }
    return true;
}
//# sourceMappingURL=utf8.js.map