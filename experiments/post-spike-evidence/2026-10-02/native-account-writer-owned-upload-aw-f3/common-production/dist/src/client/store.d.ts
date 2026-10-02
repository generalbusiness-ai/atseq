/** Device data only. Application views never receive this capability. */
export declare class DeviceStore {
    private readonly db;
    private constructor();
    static open(name?: string): Promise<DeviceStore>;
    get<T>(key: string): Promise<T | undefined>;
    update<T>(key: string, change: (previous: T | undefined) => T): Promise<T>;
    set<T>(key: string, value: T): Promise<T>;
    enqueue<T extends {
        status: string;
    }>(app: string, cid: string, value: T): Promise<T & {
        order: number;
    }>;
    list<T>(prefix: string): Promise<T[]>;
    delete(key: string): Promise<void>;
    close(): void;
}
export interface Draft {
    id: string;
    revision: number;
    source: number[];
    creationId: string;
    activationKeys?: string[];
    published?: {
        app: string;
        genesis: string;
    };
}
export declare function saveDraft(store: DeviceStore, draft: Draft, expectedRevision: number | undefined): Promise<Draft>;
//# sourceMappingURL=store.d.ts.map