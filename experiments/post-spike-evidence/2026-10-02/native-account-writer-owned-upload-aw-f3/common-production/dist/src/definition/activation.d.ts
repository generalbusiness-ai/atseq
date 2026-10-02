import { LoadedDefinition } from './load.ts';
import { type SourceReader } from './source.ts';
import { type Json } from '../core/values.ts';
import type { Activation } from './control.ts';
export declare function compatibleDefinition(current: LoadedDefinition, next: LoadedDefinition, state: Json): void;
export declare function activationCandidate(current: LoadedDefinition, payload: Activation, reader: SourceReader, state: Json): Promise<LoadedDefinition>;
//# sourceMappingURL=activation.d.ts.map