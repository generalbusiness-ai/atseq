export declare const NATIVE_FRAMEWORK_REASONS: readonly ["authority_stale", "authority_unchanged", "control_context_stale", "control_map_limit", "control_power", "control_tip_stale", "control_unappointed", "control_unchanged", "definition_changed", "epoch_conflict", "epoch_reused", "execution_changed", "grant_conflict", "grant_epoch", "grant_revoked", "grant_scope", "grant_signer", "grant_unadmitted", "incompatible_definition", "invalid_action", "invalid_activation", "observation_conflict", "observation_rollback", "recovery_epoch_reused", "role_missing", "role_owner", "role_scope", "role_stale", "role_unchanged", "unknown_action"];
export declare const NATIVE_FOLD_FAILURE_CODES: readonly ["absent_result", "engine_input", "evaluation_depth", "fold_message", "fold_output", "inspection_budget", "reserved_key", "schema_coercion", "schema_value", "sequence_limit", "step_budget", "sum_overflow", "unicode", "value_bytes", "value_depth", "wire_number", "wire_value"];
export type NativeFrameworkReason = (typeof NATIVE_FRAMEWORK_REASONS)[number] | `fold_failed/${(typeof NATIVE_FOLD_FAILURE_CODES)[number]}`;
export type NativeOutcomeData = {
    decision: 'effective';
} | {
    decision: 'ineffective';
    source: 'framework';
    reason: NativeFrameworkReason;
} | {
    decision: 'ineffective';
    source: 'fold';
    reason: string;
    message?: string;
};
/** Exact adopted D3 branches; no support registry or execution/provenance classifier. */
export declare function readNativeOutcome(value: unknown): NativeOutcomeData;
//# sourceMappingURL=native-outcome.d.ts.map