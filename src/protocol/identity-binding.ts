import { isAtprotoDid } from '@atproto/did';
import { assertDependencies } from '../core/dependencies.ts';
import { identityInput, identityObject, identityResourceLimit, parseIdentityJson } from './identity-json.ts';
import { identityPdsOrigin, normalizeIdentityController } from './identity-key.ts';
import { verifyPlcAudit } from './identity-plc.ts';

/** Method-specific retained evidence only; no descriptor/operation wire encoding. */
export type IdentityEvidence =
  | { readonly assuranceClass: 'plc-audit-v1'; readonly auditBytes: Uint8Array; readonly selectedTipCid: string }
  | { readonly assuranceClass: 'web-observation-v1'; readonly documentBytes: Uint8Array };
export const WEB_EVIDENCE_LIMITS = Object.freeze({ bytes: 32 * 1024, arrayEntries: 64 });
function ownFragment(value: unknown, principal: string, fragment: string) {
  return value === `#${fragment}` || value === `${principal}#${fragment}`;
}
function documentArray(doc: Record<string, unknown>, name: string): unknown[] {
  const value = doc[name];
  if (value === undefined) return [];
  if (!Array.isArray(value)) identityInput('Web identity array has invalid type');
  if (value.length > WEB_EVIDENCE_LIMITS.arrayEntries) identityResourceLimit('Web identity array exceeds budget');
  return value;
}
async function deriveWeb(principal: string, raw: Uint8Array) {
  const doc = parseIdentityJson(raw, WEB_EVIDENCE_LIMITS.bytes);
  if (!identityObject(doc) || !Object.hasOwn(doc, 'id') || doc.id !== principal)
    identityInput('Web document DID differs from principal');
  const methods = documentArray(doc, 'verificationMethod'),
    services = documentArray(doc, 'service');
  const key = methods.find((value) => identityObject(value) && ownFragment(value.id, principal, 'atproto'));
  if (!identityObject(key) || key.controller !== principal)
    identityInput('Web document lacks usable ATproto signing key');
  const signingKeyDid = await normalizeIdentityController(key);
  const service = services.find((value) => identityObject(value) && ownFragment(value.id, principal, 'atproto_pds'));
  if (!identityObject(service) || service.type !== 'AtprotoPersonalDataServer')
    identityInput('Web document lacks ATproto PDS service');
  return { signingKeyDid, pdsOrigin: identityPdsOrigin(service.serviceEndpoint) };
}
/** Same pure extraction for online observation and retained offline interpretation. */
export async function deriveIdentityBinding(principal: string, evidence: IdentityEvidence) {
  assertDependencies();
  if (!isAtprotoDid(principal)) identityInput('Unsupported ATproto account principal');
  if (!evidence || typeof evidence !== 'object') identityInput('Expected typed retained identity evidence');
  if (evidence.assuranceClass === 'plc-audit-v1') {
    if (!principal.startsWith('did:plc:')) identityInput('PLC assurance requires a PLC principal');
    return Object.freeze({
      principal,
      assuranceClass: evidence.assuranceClass,
      ...(await verifyPlcAudit(principal, evidence.auditBytes, evidence.selectedTipCid)),
    });
  }
  if (evidence.assuranceClass !== 'web-observation-v1' || !principal.startsWith('did:web:'))
    identityInput('Web observation requires a hostname web principal');
  return Object.freeze({
    principal,
    assuranceClass: evidence.assuranceClass,
    ...(await deriveWeb(principal, evidence.documentBytes)),
  });
}
/** Online before/after comparison, independent of clocks or repository heads. */
export function sameIdentityObservation(
  before: Awaited<ReturnType<typeof deriveIdentityBinding>>,
  after: Awaited<ReturnType<typeof deriveIdentityBinding>>,
) {
  if (before.principal !== after.principal || before.assuranceClass !== after.assuranceClass) return false;
  if (before.assuranceClass === 'plc-audit-v1' && after.assuranceClass === 'plc-audit-v1')
    return before.selectedTipCid === after.selectedTipCid;
  return before.signingKeyDid === after.signingKeyDid && before.pdsOrigin === after.pdsOrigin;
}
