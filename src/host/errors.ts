import { AtseqError } from '../core/errors.ts';
import { PdsError } from './pds.ts';

export class HostError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HostError';
  }
}

// A refusal is final only when these bytes cannot be a valid signed request.
const finalInput = new Set([
  'input',
  'envelope',
  'signature',
  'key',
  'payload',
  'wire_bytes',
  'wire_cid',
  'wire_depth',
  'wire_key',
  'wire_number',
  'wire_size',
  'wire_value',
  'noncanonical',
]);
const integrity = new Set([
  'anchor',
  'content',
  'head',
  'fork',
  'missing_history',
  'position',
  'predecessor',
  'replay',
  'rollback',
  'unsupported_runtime',
]);

/** Stable codes distinguish a bad request from an unavailable verified result. */
export function hostFailure(error: unknown) {
  let status = 503,
    code = 'runtime_fault',
    message = 'Could not establish a valid result',
    permanent = false;
  if (error instanceof HostError) ({ status, code, message } = error);
  else if (error instanceof PdsError) {
    code = error.code === 'AuthenticationUnavailable' ? 'host_authentication' : 'pds_unavailable';
    message = error.code;
  } else if (error instanceof AtseqError) {
    code = error.code;
    message = `${error.code}: ${error.message}`;
    if (error.kind === 'invalid_input' && !integrity.has(code)) {
      status = code === 'definition_changed' ? 409 : 400;
      permanent = finalInput.has(code);
    }
  } else if ((error as { code?: unknown } | null)?.code === 'ENOENT') {
    code = 'content_missing';
    message = 'Local content is missing';
  }
  return { status, body: { error: status < 500 ? 'InvalidRequest' : 'Unavailable', code, message, permanent } };
}
