import { ApplicationHost } from './application.ts';
export declare function startApplicationService(host: ApplicationHost, options?: {
    port?: number;
    staticRoot?: string;
}): Promise<{
    url: string;
    tokenFile: string;
    close(): Promise<void>;
}>;
//# sourceMappingURL=http.d.ts.map