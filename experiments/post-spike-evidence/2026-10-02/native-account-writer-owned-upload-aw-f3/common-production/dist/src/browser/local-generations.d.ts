import { type LocalLimits, type LocalGenerations } from '../core/local-generations.ts';
/** Origin-trusted raw storage only; no deserialization creates protocol authority. */
export declare function openLocalGenerations(name: string, scope: string, policy?: Partial<LocalLimits>): Promise<LocalGenerations>;
//# sourceMappingURL=local-generations.d.ts.map