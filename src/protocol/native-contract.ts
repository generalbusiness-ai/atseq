/** Internal conformance input, deliberately absent from current supportedProfiles(). */
import { deepFreeze } from '../core/freeze.ts';
import { nativeLexicons } from './native-schema.ts';

export const nativeFoundationDescriptor = deepFreeze({
  name: 'atseq-native-foundation-preparation',
  version: 1,
  status: 'not an adopted application semantic profile',
  schemas: nativeLexicons,
  bytes: 'strict existing canonical CBOR, 64 KiB block/128 KiB JSON/depth 32',
  signing: 'P-256 SHA-256 compact low-S over complete unsigned intent bytes',
  retry: 'unsigned intent CID first; app/genesis/canonical actorKey/16-byte nonce tuple',
  positions: 'positive safe integer, canonical fixed 16 decimal digits, full genesis CID prefix',
  metadata: ['app', 'genesis', 'position', 'principal', 'execution'],
  content: 'public exact response bytes, flat 32 KiB chunks, explicit length, CID verification',
  exclusions: [
    'native commit/publication authentication is separate',
    'I1 method-policy/descriptor proof acceptance is separate',
    'I2 grant and control authority interpretation is separate',
    'semantic descriptor objects and adopted expected CIDs remain integration gates',
    'existing service/profile/dependency approvals are unchanged',
  ],
});
