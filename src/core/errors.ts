/** Stable error codes are shared by protocol, interpretation and transport. */
export const ERROR_CODES = Object.freeze({
  absent_result: 'invalid_input',
  already_provisioned: 'invalid_input',
  anchor: 'invalid_input',
  content: 'invalid_input',
  content_corrupt: 'transient',
  content_missing: 'transient',
  creation_conflict: 'invalid_input',
  creation_id: 'invalid_input',
  definition_binding: 'invalid_input',
  definition_changed: 'invalid_input',
  definition_duplicate: 'invalid_input',
  definition_manifest: 'invalid_input',
  definition_path: 'invalid_input',
  definition_size: 'invalid_input',
  dependency_mismatch: 'runtime_fault',
  duplicate_retry: 'invalid_input',
  engine_error: 'runtime_fault',
  engine_input: 'invalid_input',
  envelope: 'invalid_input',
  evaluation_depth: 'invalid_input',
  external_view: 'invalid_input',
  fold_message: 'invalid_input',
  fold_output: 'invalid_input',
  fork: 'invalid_input',
  head: 'invalid_input',
  incompatible_definition: 'invalid_input',
  input: 'invalid_input',
  inspection_budget: 'invalid_input',
  invalid_activation: 'invalid_input',
  invalid_schema: 'invalid_input',
  invalid_source: 'invalid_input',
  key: 'invalid_input',
  missing_history: 'invalid_input',
  noncanonical: 'invalid_input',
  origin: 'invalid_input',
  path: 'invalid_input',
  payload: 'invalid_input',
  persistence_failed: 'transient',
  position: 'invalid_input',
  predecessor: 'invalid_input',
  replay: 'invalid_input',
  reserved_key: 'invalid_input',
  retry_conflict: 'invalid_input',
  rollback: 'invalid_input',
  runtime_fault: 'runtime_fault',
  schema_coercion: 'invalid_input',
  schema_count: 'invalid_input',
  schema_value: 'invalid_input',
  sequence_limit: 'invalid_input',
  signature: 'invalid_input',
  source_bytes: 'invalid_input',
  source_car: 'invalid_input',
  source_complexity: 'invalid_input',
  source_json: 'invalid_input',
  source_pool_limit: 'invalid_input',
  source_size: 'invalid_input',
  source_utf8: 'invalid_input',
  step_budget: 'invalid_input',
  sum_overflow: 'invalid_input',
  target: 'invalid_input',
  unicode: 'invalid_input',
  unknown_component: 'invalid_input',
  unknown_primitive: 'invalid_input',
  unknown_query: 'invalid_input',
  unknown_view: 'invalid_input',
  unsupported_expression: 'invalid_input',
  unsupported_function: 'invalid_input',
  unsupported_runtime: 'invalid_input',
  unsupported_schema: 'invalid_input',
  unsupported_variable: 'invalid_input',
  value_bytes: 'invalid_input',
  value_depth: 'invalid_input',
  view_limit: 'invalid_input',
  view_props: 'invalid_input',
  view_source: 'invalid_input',
  wire_bytes: 'invalid_input',
  wire_cid: 'invalid_input',
  wire_depth: 'invalid_input',
  wire_key: 'invalid_input',
  wire_number: 'invalid_input',
  wire_size: 'invalid_input',
  wire_value: 'invalid_input',
} as const);
export type ErrorCode = keyof typeof ERROR_CODES;
export type ErrorKind = (typeof ERROR_CODES)[ErrorCode];
export class AtseqError extends Error {
  readonly kind: ErrorKind;
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AtseqError';
    this.kind = ERROR_CODES[code];
  }
}
export class InterpretationError extends AtseqError {
  constructor(code: ErrorCode, message: string) {
    super(code, message);
    this.name = 'InterpretationError';
  }
}
export class ProtocolError extends AtseqError {
  constructor(code: ErrorCode, message: string) {
    super(code, message);
    this.name = 'ProtocolError';
  }
}
export function errorCode(error: unknown): ErrorCode {
  return error instanceof AtseqError ? error.code : 'runtime_fault';
}
export function errorKind(error: unknown): ErrorKind {
  return ERROR_CODES[errorCode(error)];
}

export const INTERPRETATION_CODES = Object.freeze([
  'absent_result',
  'content_corrupt',
  'content_missing',
  'definition_binding',
  'definition_duplicate',
  'definition_manifest',
  'definition_path',
  'definition_size',
  'engine_input',
  'envelope',
  'evaluation_depth',
  'external_view',
  'fold_message',
  'fold_output',
  'fork',
  'incompatible_definition',
  'inspection_budget',
  'invalid_activation',
  'invalid_schema',
  'invalid_source',
  'noncanonical',
  'persistence_failed',
  'reserved_key',
  'rollback',
  'schema_coercion',
  'schema_count',
  'schema_value',
  'sequence_limit',
  'source_bytes',
  'source_car',
  'source_complexity',
  'source_json',
  'source_pool_limit',
  'source_size',
  'step_budget',
  'sum_overflow',
  'unicode',
  'unknown_component',
  'unknown_primitive',
  'unknown_query',
  'unknown_view',
  'unsupported_expression',
  'unsupported_function',
  'unsupported_runtime',
  'unsupported_schema',
  'unsupported_variable',
  'value_bytes',
  'value_depth',
  'view_limit',
  'view_props',
  'view_source',
  'wire_bytes',
  'wire_cid',
  'wire_depth',
  'wire_key',
  'wire_number',
  'wire_size',
  'wire_value',
] as const);
export const interpretationErrorTags = Object.freeze(
  Object.fromEntries(INTERPRETATION_CODES.map((code) => [code, ERROR_CODES[code]])),
);
export function interpretationCode(error: unknown): ErrorCode {
  const code = errorCode(error);
  return (INTERPRETATION_CODES as readonly string[]).includes(code) ? code : 'runtime_fault';
}
