/** Read a small owner-only file without following a symlink. */
export declare function readPrivateFile(path: string): Promise<string>;
/** Create once, then read the retained file; a restart never rotates credentials. */
export declare function ensurePrivateFile(path: string, value: string): Promise<string>;
//# sourceMappingURL=private.d.ts.map