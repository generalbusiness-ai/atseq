/** Closed native outcome DATA. A parsed namespace does not prove its producer. */
import { canonicalJson } from '../core/values.js';
import { ProtocolError } from '../core/errors.js';
export const NATIVE_FRAMEWORK_REASONS = Object.freeze([
    'authority_stale',
    'authority_unchanged',
    'control_context_stale',
    'control_map_limit',
    'control_power',
    'control_tip_stale',
    'control_unappointed',
    'control_unchanged',
    'definition_changed',
    'epoch_conflict',
    'epoch_reused',
    'execution_changed',
    'grant_conflict',
    'grant_epoch',
    'grant_revoked',
    'grant_scope',
    'grant_signer',
    'grant_unadmitted',
    'incompatible_definition',
    'invalid_action',
    'invalid_activation',
    'observation_conflict',
    'observation_rollback',
    'recovery_epoch_reused',
    'role_missing',
    'role_owner',
    'role_scope',
    'role_stale',
    'role_unchanged',
    'unknown_action',
]);
export const NATIVE_FOLD_FAILURE_CODES = Object.freeze([
    'absent_result',
    'engine_input',
    'evaluation_depth',
    'fold_message',
    'fold_output',
    'inspection_budget',
    'reserved_key',
    'schema_coercion',
    'schema_value',
    'sequence_limit',
    'step_budget',
    'sum_overflow',
    'unicode',
    'value_bytes',
    'value_depth',
    'wire_number',
    'wire_value',
]);
const framework = new Set([
    ...NATIVE_FRAMEWORK_REASONS,
    ...NATIVE_FOLD_FAILURE_CODES.map((code) => `fold_failed/${code}`),
]);
function fail(message) {
    throw new ProtocolError('envelope', message);
}
function closed(value, names) {
    if (!value ||
        typeof value !== 'object' ||
        Array.isArray(value) ||
        Object.keys(value).length !== names.length ||
        names.some((key) => !Object.hasOwn(value, key)))
        fail('Unknown or missing outcome fields');
}
/** Exact adopted D3 branches; no support registry or execution/provenance classifier. */
export function readNativeOutcome(value) {
    const owned = JSON.parse(canonicalJson(value, 128 * 1024, 32));
    if (owned?.decision === 'effective') {
        closed(owned, ['decision']);
    }
    else if (owned?.decision === 'ineffective' && owned.source === 'framework') {
        closed(owned, ['decision', 'source', 'reason']);
        if (typeof owned.reason !== 'string' || !framework.has(owned.reason))
            fail('Unsupported framework outcome reason');
    }
    else if (owned?.decision === 'ineffective' && owned.source === 'fold') {
        closed(owned, Object.hasOwn(owned, 'message') ? ['decision', 'source', 'reason', 'message'] : ['decision', 'source', 'reason']);
        if (typeof owned.reason !== 'string' || !/^[a-z][a-z0-9_]{0,63}$/.test(owned.reason))
            fail('Invalid authored fold reason');
        if (Object.hasOwn(owned, 'message') &&
            (typeof owned.message !== 'string' ||
                !owned.message.isWellFormed() ||
                [...owned.message].length > 1024 ||
                new TextEncoder().encode(owned.message).length > 4096))
            fail('Invalid authored fold message');
    }
    else
        fail('Unsupported outcome branch');
    return owned;
}
//# sourceMappingURL=native-outcome.js.map