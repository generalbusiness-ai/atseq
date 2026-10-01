/** Stable error codes are shared by protocol, interpretation and transport. */
export const INTERPRETATION_ERRORS = Object.freeze({
  absent_result: 'invalid_input',
  content_corrupt: 'transient',
  content_missing: 'transient',
  definition_binding: 'invalid_input',
  definition_duplicate: 'invalid_input',
  definition_manifest: 'invalid_input',
  definition_path: 'invalid_input',
  definition_size: 'invalid_input',
  engine_input: 'invalid_input',
  envelope: 'invalid_input',
  evaluation_depth: 'invalid_input',
  external_view: 'invalid_input',
  fold_message: 'invalid_input',
  fold_output: 'invalid_input',
  fork: 'invalid_input',
  incompatible_definition: 'invalid_input',
  inspection_budget: 'invalid_input',
  invalid_activation: 'invalid_input',
  invalid_schema: 'invalid_input',
  invalid_source: 'invalid_input',
  noncanonical: 'invalid_input',
  persistence_failed: 'transient',
  reserved_key: 'invalid_input',
  rollback: 'invalid_input',
  schema_coercion: 'invalid_input',
  schema_count: 'invalid_input',
  schema_value: 'invalid_input',
  sequence_limit: 'invalid_input',
  source_bytes: 'invalid_input',
  source_car: 'invalid_input',
  source_complexity: 'invalid_input',
  source_json: 'invalid_input',
  source_pool_limit: 'invalid_input',
  source_size: 'invalid_input',
  source_utf8: 'invalid_input',
  step_budget: 'invalid_input',
  sum_overflow: 'invalid_input',
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
export const HOST_ERRORS = Object.freeze({
  content_unavailable: 'transient',
  archive: 'invalid_input',
  archive_incomplete: 'invalid_input',
  archive_inventory: 'invalid_input',
  archive_pin: 'invalid_input',
  archive_runtime: 'invalid_input',
  archive_size: 'invalid_input',
  file_exists: 'invalid_input',
  protected_file: 'invalid_input',
  source_output: 'invalid_input',

  already_provisioned: 'invalid_input',
  anchor: 'invalid_input',
  content: 'invalid_input',
  creation_conflict: 'invalid_input',
  creation_id: 'invalid_input',
  definition_changed: 'invalid_input',
  dependency_mismatch: 'runtime_fault',
  duplicate_retry: 'invalid_input',
  engine_error: 'runtime_fault',
  head: 'invalid_input',
  input: 'invalid_input',
  key: 'invalid_input',
  missing_history: 'invalid_input',
  native_proof_limit: 'transient',
  origin: 'invalid_input',
  path: 'invalid_input',
  payload: 'invalid_input',
  position: 'invalid_input',
  predecessor: 'invalid_input',
  replay: 'invalid_input',
  retry_conflict: 'invalid_input',
  runtime_fault: 'runtime_fault',
  signature: 'invalid_input',
  target: 'invalid_input',
} as const);
export const ERROR_CODES = Object.freeze({ ...INTERPRETATION_ERRORS, ...HOST_ERRORS });
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

export const INTERPRETATION_CODES = Object.freeze(
  Object.keys(INTERPRETATION_ERRORS) as (keyof typeof INTERPRETATION_ERRORS)[],
);
export const interpretationErrorTags = INTERPRETATION_ERRORS;
export function interpretationCode(error: unknown): ErrorCode {
  const code = errorCode(error);
  if (!Object.hasOwn(INTERPRETATION_ERRORS, code))
    throw new AtseqError('runtime_fault', 'A host-only error reached interpretation');
  return code;
}
