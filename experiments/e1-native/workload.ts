/** Experiment plans only. N counts all ordered entries, including authority and activation. */
export type Workload = {
  n: number;
  actors: 1 | 16;
  growing: boolean;
  activation: boolean;
  invalidAction: boolean;
};
export type PlannedEntry =
  | { position: number; kind: 'admit'; actor: number }
  | { position: number; kind: 'activate'; source: 1 }
  | { position: number; kind: 'act'; actor: number; amount: number; source: 0 | 1; valid: boolean };
export const sizes = [100, 1000, 10_000] as const;
export const deltas = [0, 1, 100, 1000] as const;
export function matrix() {
  return sizes.flatMap((n) =>
    deltas.map((delta) => ({
      n,
      delta,
      base: n - delta,
      target: n,
      valid: delta <= n,
      reason: delta <= n ? null : 'delta exceeds final ordered-entry count',
    })),
  );
}
export function plan(input: Workload): PlannedEntry[] {
  if (!Number.isSafeInteger(input.n) || input.n <= input.actors + Number(input.activation) || input.n > 16_384)
    throw new Error('Fixture needs actions after setup and must respect sequenceLength=16384');
  const rows: PlannedEntry[] = [];
  for (let actor = 0; actor < input.actors; actor++) rows.push({ position: rows.length + 1, kind: 'admit', actor });
  const activationPosition = input.activation ? input.actors + 1 + Math.floor((input.n - input.actors) / 2) : -1;
  let action = 0;
  for (let position = rows.length + 1; position <= input.n; position++) {
    if (position === activationPosition) rows.push({ position, kind: 'activate', source: 1 });
    else {
      action++;
      const valid = !input.invalidAction || action !== 3;
      rows.push({
        position,
        kind: 'act',
        actor: (action - 1) % input.actors,
        amount: valid ? 1 + ((action - 1) % 10) : 11,
        source: position > activationPosition && activationPosition > 0 ? 1 : 0,
        valid,
      });
    }
  }
  return rows;
}
/** Independent ordinary-TypeScript oracle: no evaluator, interpreter, source output or snapshots. */
export function oracle(input: Workload, rows = plan(input), through = input.n) {
  let count = 0,
    source = 0;
  const values: number[] = [];
  const admitted: number[] = [];
  const outcomes: { position: number; decision: 'effective' | 'ineffective'; reason?: string }[] = [];
  for (const row of rows) {
    if (row.position > through) break;
    if (row.kind === 'admit') admitted.push(row.actor);
    else if (row.kind === 'activate') source = row.source;
    else if (row.valid) {
      const amount = row.amount * (row.source === 1 ? 2 : 1);
      count += amount;
      if (input.growing) values.push(amount);
    }
    outcomes.push(
      row.kind === 'act' && !row.valid
        ? { position: row.position, decision: 'ineffective', reason: 'invalid_action' }
        : { position: row.position, decision: 'effective' },
    );
  }
  return {
    state: input.growing ? { count, description: 'demo', values } : { count, description: 'demo' },
    source,
    admitted,
    outcomes,
    orderedEntries: outcomes.length,
    actions: rows.filter((row) => row.position <= through && row.kind === 'act').length,
  };
}
export function selectedPositions(input: Workload) {
  return [...new Set([0, input.n, ...deltas.filter((delta) => delta <= input.n).map((delta) => input.n - delta)])].sort(
    (a, b) => a - b,
  );
}
/** Fixed-width injective experiment IDs, not a production nonce generator. */
export function unique16(namespace: number, sequence: number) {
  if (
    !Number.isSafeInteger(namespace) ||
    namespace < 0 ||
    namespace > 0xffff_ffff ||
    !Number.isSafeInteger(sequence) ||
    sequence < 0
  )
    throw new Error('Invalid fixture ID');
  const raw = new Uint8Array(16),
    view = new DataView(raw.buffer);
  view.setUint32(0, 0x45314631); // E1F1
  view.setUint32(4, namespace);
  view.setBigUint64(8, BigInt(sequence));
  return raw;
}
