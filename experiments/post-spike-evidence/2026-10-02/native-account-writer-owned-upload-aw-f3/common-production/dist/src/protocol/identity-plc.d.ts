export declare const PLC_EVIDENCE_LIMITS: Readonly<{
    bytes: number;
    rows: 512;
    operationBytes: 7500;
    entries: 64;
}>;
/** Authenticates retained history, not directory completeness or currentness. */
export declare function verifyPlcAudit(principal: string, raw: Uint8Array, selectedTipCid: string): Promise<Readonly<{
    selectedTipCid: string;
    signingKeyDid: `did:key:${string}`;
    pdsOrigin: string;
}>>;
//# sourceMappingURL=identity-plc.d.ts.map