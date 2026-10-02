import { applicationDescriptor, engineDescriptor, logDescriptor } from '../core/contracts.js';
import { deepFreeze } from '../core/freeze.js';
import { contentCid } from './wire.js';
export const applicationRuntimeDescriptor = deepFreeze(applicationDescriptor);
export const applicationRuntimeCid = () => contentCid(applicationRuntimeDescriptor);
/** This interpreter supports only log/application v2 and the unchanged JSONata v1 contract. */
export async function supportedProfiles() {
    return deepFreeze([
        { name: logDescriptor.name, cid: await contentCid(logDescriptor), role: 'log' },
        { name: engineDescriptor.name, cid: await contentCid(engineDescriptor), role: 'evaluator' },
        { name: applicationDescriptor.name, cid: await contentCid(applicationDescriptor), role: 'application' },
    ]);
}
//# sourceMappingURL=identity.js.map