export interface OutputPolicy {
    overwrite?: boolean;
    protectedFiles?: string[];
    sourceDirectory?: string;
}
/** Resolve aliases even when the leaf or some parent directories do not exist. */
export declare function canonicalPath(path: string): Promise<string>;
export declare function checkOutput(path: string, policy?: OutputPolicy): Promise<string>;
/** Publish complete 0600 output atomically, with exclusive creation by default. */
export declare function writeOutput(path: string, data: string | Uint8Array, policy?: OutputPolicy): Promise<void>;
//# sourceMappingURL=output.d.ts.map