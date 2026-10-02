/** One bounded observation reservation, shared across complete retries. No credentials or redirects. */
export declare class IdentityFetch {
    private readonly deadline;
    private readonly fetch;
    private requests;
    private bytes;
    private active;
    constructor();
    /** Check the same reservation after offline verification or evidence construction. */
    assertActive(signal?: AbortSignal): void;
    bytesFrom(url: string | URL, maximumBytes: number, signal?: AbortSignal): Promise<Uint8Array>;
}
//# sourceMappingURL=identity-fetch.d.ts.map