export declare function readHostToken(path: string): Promise<string>;
export declare function hostToken(directory: string): Promise<{
    path: string;
    token: string;
}>;
export declare function acceptsHostToken(value: string | undefined, expected: string): boolean;
//# sourceMappingURL=token.d.ts.map