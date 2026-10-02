export interface WriterLease {
    readHead(): unknown;
    saveHead(value: unknown): void;
    close(): void;
}
/** Kernel-backed local lease and last-observed head cache, never application state. */
export declare function acquireWriterLease(directory: string, app: string): WriterLease;
//# sourceMappingURL=lease.d.ts.map