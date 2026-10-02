/** A bounded data export built from an already verified query result. */
export interface ChartSource {
    app: string;
    genesis: string;
    definition: string;
    position: number;
    entry: string;
    query: string;
    params: unknown;
}
export declare function chartExport(rows: Record<string, unknown>[], label: string, value: string, source: ChartSource): {
    svg: string;
    html: string;
    metadata: {
        format: string;
        version: number;
        source: ChartSource;
        label: string;
        value: string;
        rows: Record<string, unknown>[];
    };
};
//# sourceMappingURL=chart.d.ts.map