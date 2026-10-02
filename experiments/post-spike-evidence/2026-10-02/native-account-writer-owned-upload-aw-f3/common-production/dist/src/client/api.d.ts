export { serviceSchemas, BODY_LIMIT, responseBytes } from '../transport/api.ts';
export declare class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly permanent: boolean;
    constructor(status: number, code: string, message: string, permanent?: boolean);
}
export declare class AtseqClient {
    private hostToken?;
    readonly origin: string;
    constructor(origin: string, hostToken?: string | undefined);
    setHostToken(token: string | undefined): void;
    call(name: string, input?: Record<string, unknown>, creationId?: string): Promise<any>;
}
//# sourceMappingURL=api.d.ts.map