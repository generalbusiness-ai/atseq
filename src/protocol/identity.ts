import { applicationDescriptor, engineDescriptor, logDescriptor } from '../core/contracts.ts';
import { deepFreeze } from '../core/freeze.ts';
import { contentCid } from './wire.ts';

export const applicationRuntimeDescriptor = deepFreeze(applicationDescriptor);
export const applicationRuntimeCid = () => contentCid(applicationRuntimeDescriptor);

/** This installed interpreter deliberately supports only the v1 semantic contract. */
export async function supportedProfiles() {
  return deepFreeze([
    { name: logDescriptor.name, cid: await contentCid(logDescriptor), role: 'log' },
    { name: engineDescriptor.name, cid: await contentCid(engineDescriptor), role: 'evaluator' },
    { name: applicationDescriptor.name, cid: await contentCid(applicationDescriptor), role: 'application' },
  ]);
}
