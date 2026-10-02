/** Method-specific retained evidence only; no descriptor/operation wire encoding. */
export type IdentityEvidence = {
    readonly assuranceClass: 'plc-audit-v1';
    readonly auditBytes: Uint8Array;
    readonly selectedTipCid: string;
} | {
    readonly assuranceClass: 'web-observation-v1';
    readonly documentBytes: Uint8Array;
};
export declare const WEB_EVIDENCE_LIMITS: Readonly<{
    bytes: number;
    arrayEntries: 64;
}>;
/** Same pure extraction for online observation and retained offline interpretation. */
export declare function deriveIdentityBinding(principal: string, evidence: IdentityEvidence): Promise<Readonly<{
    selectedTipCid: string;
    signingKeyDid: `did:key:${string}`;
    pdsOrigin: string;
    principal: `did:plc:${string}` | `did:web:${string}`;
    assuranceClass: "plc-audit-v1";
}> | Readonly<{
    signingKeyDid: `did:key:${string}`;
    pdsOrigin: string;
    principal: `did:plc:${string}` | `did:web:${string}`;
    assuranceClass: "web-observation-v1";
}>>;
/** Online before/after comparison, independent of clocks or repository heads. */
export declare function sameIdentityObservation(before: Awaited<ReturnType<typeof deriveIdentityBinding>>, after: Awaited<ReturnType<typeof deriveIdentityBinding>>): boolean;
//# sourceMappingURL=identity-binding.d.ts.map