/** A candidate profile. S0 evidence must pass before this becomes a wire identity. */
export const PROFILE = Object.freeze({
  id: 'atseq-jsonata-js-2.2.2-candidate-1',
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
  inspectedNodes: 2_000_000,
});

export class InterpretationError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'InterpretationError'; }
}
