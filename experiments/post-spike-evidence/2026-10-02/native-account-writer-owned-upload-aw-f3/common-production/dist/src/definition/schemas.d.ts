/** Uses the ecosystem's runtime data validator; this is a profile check, not a new IDL. */
export declare class Schemas {
    private readonly lexicons;
    constructor(documents: unknown[]);
    validate(ref: string, value: unknown): void;
    queryParams(ref: string, value: unknown): void;
    queryResult(ref: string, value: unknown): void;
    private xrpc;
}
//# sourceMappingURL=schemas.d.ts.map