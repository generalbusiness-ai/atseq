export declare class HostError extends Error {
    readonly code: string;
    readonly status: number;
    constructor(code: string, status: number, message: string);
}
/** Stable codes distinguish a bad request from an unavailable verified result. */
export declare function hostFailure(error: unknown): {
    status: number;
    body: {
        error: string;
        code: string;
        message: string;
        permanent: boolean;
    };
};
//# sourceMappingURL=errors.d.ts.map