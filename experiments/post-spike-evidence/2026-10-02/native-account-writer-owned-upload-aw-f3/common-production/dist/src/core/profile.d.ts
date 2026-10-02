/** Normative bounds for atseq-jsonata-v1. */
export declare const PROFILE: Readonly<{
    id: "atseq-jsonata-v1";
    stateBytes: number;
    inputBytes: number;
    outputBytes: number;
    actionBytes: number;
    programBytes: number;
    definitionBytes: number;
    definitionFiles: 64;
    inputDepth: 32;
    astNodes: 4096;
    astDepth: 64;
    evaluationDepth: 64;
    evaluationSteps: 100000;
    sequenceLength: 16384;
    intermediateBytes: number;
    inspectionBytes: number;
    foldMessageLength: 1024;
    viewNodes: 2048;
    viewDepth: 24;
}>;
export { InterpretationError } from './errors.ts';
//# sourceMappingURL=profile.d.ts.map