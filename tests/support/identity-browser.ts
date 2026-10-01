export { identityCorpus } from './identity-corpus.ts';
import { deriveIdentityBinding } from '../../src/protocol/identity-binding.ts';

export async function sharedIdentityFixtures(
  fixtures: {
    principal: string;
    key: string;
    audit: number[];
    selectedTipCid: string;
  }[],
) {
  const checked: string[] = [];
  for (const fixture of fixtures) {
    const binding = await deriveIdentityBinding(fixture.principal, {
      assuranceClass: 'plc-audit-v1',
      auditBytes: new Uint8Array(fixture.audit),
      selectedTipCid: fixture.selectedTipCid,
    });
    if (
      binding.assuranceClass !== 'plc-audit-v1' ||
      binding.signingKeyDid !== fixture.key ||
      binding.selectedTipCid !== fixture.selectedTipCid
    )
      throw new Error('Shared Node identity fixture differs in Chromium');
    checked.push(binding.principal);
  }
  return checked;
}
