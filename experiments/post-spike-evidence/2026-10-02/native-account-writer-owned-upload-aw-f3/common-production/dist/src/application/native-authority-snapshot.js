/** Closed snapshot DATA validation. This cannot mint accepted authority. */
import { readAuthorityData } from './native-authority-data.js';
export function readNativeAuthoritySnapshot(value, anchor, maximumBytes = 32 * 1024 * 1024) {
    return readAuthorityData(value, anchor, false, maximumBytes);
}
//# sourceMappingURL=native-authority-snapshot.js.map