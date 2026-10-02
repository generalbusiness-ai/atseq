export declare const packageRoot: string;
export declare const integrityEnvironment = "node";
export declare function installedTree(path: string, installationRoot?: string): Record<string, string>;
export declare function resolvedPackage(parent: string, name: string, installationRoot?: string): string | undefined;
type DependencyEdge = {
    parent: string;
    name: string;
    target: string;
};
export declare function resolveDependencyEdges(edges: readonly DependencyEdge[], installationRoot?: string): string[][];
export declare function verifyInstalledDependencies(force?: boolean, installationRoot?: string): void;
export {};
//# sourceMappingURL=node.d.ts.map