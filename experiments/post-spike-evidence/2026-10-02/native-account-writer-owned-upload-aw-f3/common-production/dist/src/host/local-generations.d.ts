import { type LocalLimits, type LocalGenerations } from '../core/local-generations.ts';
/** Opaque bytes, not replay/authority capabilities. One caller-selected scope per file. */
export declare function openLocalGenerations(path: string, scope: string, policy?: Partial<LocalLimits>): Promise<LocalGenerations>;
//# sourceMappingURL=local-generations.d.ts.map