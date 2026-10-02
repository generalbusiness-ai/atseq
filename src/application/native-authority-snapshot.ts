/** Closed snapshot DATA validation. This cannot mint accepted authority. */
import { readAuthorityData } from './native-authority-data.ts';
import type { NativeAnchor } from '../protocol/native-wire.ts';
import type { NativeAuthoritySnapshot } from './native-authority-data.ts';
export function readNativeAuthoritySnapshot(
  value: unknown,
  anchor: NativeAnchor,
  maximumBytes = 32 * 1024 * 1024,
): Promise<NativeAuthoritySnapshot> {
  return readAuthorityData(value, anchor, false, maximumBytes);
}
