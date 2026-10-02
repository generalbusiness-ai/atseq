export declare const nativeFoundationDescriptor: Readonly<{
    name: string;
    version: number;
    status: string;
    schemas: readonly {
        lexicon: 1;
        id: `${string}.${string}.${string}`;
        revision?: number | undefined;
        description?: string | undefined;
        defs: Record<string, import("@atproto/lexicon").LexUserType>;
    }[];
    bytes: string;
    signing: string;
    retry: string;
    positions: string;
    metadata: string[];
    content: string;
    exclusions: string[];
}>;
//# sourceMappingURL=native-contract.d.ts.map