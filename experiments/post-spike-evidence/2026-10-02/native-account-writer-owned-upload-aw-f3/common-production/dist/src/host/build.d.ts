/** Cache only this installed shell; never XRPC replies, credentials or archives. */
export declare function buildShell(outDir: string): Promise<{
    root: string;
    cache: string;
    files: string[];
    provenance: unknown;
}>;
//# sourceMappingURL=build.d.ts.map