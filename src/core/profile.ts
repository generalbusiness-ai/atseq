/** Normative bounds for atseq-jsonata-v1. */
export const PROFILE = Object.freeze({
  id: 'atseq-jsonata-v1',
  stateBytes: 128 * 1024,
  inputBytes: 256 * 1024,
  outputBytes: 256 * 1024,
  actionBytes: 32 * 1024,
  programBytes: 64 * 1024,
  definitionBytes: 512 * 1024,
  definitionFiles: 64,
  inputDepth: 32,
  astNodes: 4096,
  astDepth: 64,
  evaluationDepth: 64,
  evaluationSteps: 100_000,
  sequenceLength: 16_384,
  intermediateBytes: 1024 * 1024,
  inspectionBytes: 16 * 1024 * 1024,
  foldMessageLength: 1024,
  viewNodes: 2048,
  viewDepth: 24,
});

export { InterpretationError } from './errors.ts';
