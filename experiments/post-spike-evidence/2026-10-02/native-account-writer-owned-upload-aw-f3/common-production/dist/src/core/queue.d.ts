/** Serialize work while allowing a rejected operation to be retried later. */
export declare class SerialQueue {
    private tail;
    run<T>(operation: () => Promise<T>): Promise<T>;
    idle(): Promise<void>;
}
//# sourceMappingURL=queue.d.ts.map