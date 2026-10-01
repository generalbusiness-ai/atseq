import { InterpretationError, PROFILE } from '../../src/core/profile.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { createGuard } from './candidates.mjs';

export type Guard = typeof import('../../src/core/values.ts').canonicalJson;
type Case = {
  name: string;
  make: () => unknown;
  options?: [number?, number?, unknown?, boolean?, boolean?];
  chargeFault?: number;
  mutate?: boolean;
};
const nested = (depth: number) => {
  let value: unknown = 0;
  while (depth--) value = [value];
  return value;
};
function descriptor(value: object, key: string, desc: PropertyDescriptor) {
  Object.defineProperty(value, key, desc);
  return value;
}

export function hostileCases(): Case[] {
  const cases: Case[] = [
    { name: 'sorted keys and Unicode', make: () => ({ z: '🦉', a: 'é\u0000\\"', 中: 1 }) },
    { name: 'null prototype', make: () => Object.assign(Object.create(null), { a: true }) },
    { name: 'safe integer limits', make: () => [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER] },
    { name: 'unsafe integer', make: () => [Number.MAX_SAFE_INTEGER + 1] },
    { name: 'negative zero', make: () => ({ a: -0 }) },
    {
      name: 'intermediate negative zero',
      make: () => ({ a: -0 }),
      options: [undefined, undefined, undefined, false, true],
    },
    { name: 'NaN', make: () => NaN },
    { name: 'infinity', make: () => Infinity },
    { name: 'undefined', make: () => undefined },
    { name: 'bigint', make: () => 1n },
    { name: 'function', make: () => () => 0 },
    { name: 'symbol', make: () => Symbol('x') },
    { name: 'unpaired high surrogate', make: () => '\ud800' },
    { name: 'unpaired low surrogate', make: () => '\udfff' },
    { name: 'bad Unicode key', make: () => ({ ['\ud800']: 1 }) },
    { name: 'reserved key', make: () => ({ constructor: 1 }) },
    { name: 'reserved JSONata key', make: () => ({ _jsonata_x: 1 }) },
    {
      name: 'enumerable accessor',
      make: () =>
        descriptor({}, 'a', {
          enumerable: true,
          get() {
            throw new Error('getter ran');
          },
        }),
    },
    {
      name: 'nonenumerable accessor',
      make: () =>
        descriptor({ a: 1 }, 'ignored', {
          get() {
            throw new Error('getter ran');
          },
        }),
    },
    {
      name: 'nonenumerable toJSON',
      make: () =>
        descriptor({ a: 1 }, 'toJSON', {
          value() {
            throw new Error('toJSON ran');
          },
        }),
    },
    { name: 'object symbol', make: () => ({ [Symbol('x')]: 1 }) },
    { name: 'custom prototype', make: () => Object.assign(Object.create({}), { a: 1 }) },
    { name: 'array custom prototype', make: () => Object.setPrototypeOf([1], {}) },
    { name: 'array extra property', make: () => Object.assign([1], { extra: 2 }) },
    {
      name: 'engine array accepted annotation',
      make: () => Object.assign([1], { sequence: true }),
      options: [undefined, undefined, undefined, true],
    },
    {
      name: 'engine array bad annotation',
      make: () => Object.assign([1], { nope: true }),
      options: [undefined, undefined, undefined, true],
    },
    { name: 'array hole', make: () => [1, , 3] },
    {
      name: 'array accessor',
      make: () =>
        descriptor([1], '0', {
          enumerable: true,
          get() {
            throw new Error('getter ran');
          },
        }),
    },
    {
      name: 'cycle',
      make: () => {
        const a: any = {};
        a.child = a;
        return a;
      },
    },
    {
      name: 'shared noncyclic reference',
      make: () => {
        const a = { x: 1 };
        return [a, a];
      },
    },
    { name: 'slash error path', make: () => ({ 'a/b': { '~c': undefined } }) },
    { name: 'charge mutates upcoming property', make: () => ({ a: 1, b: 2 }), mutate: true },
    {
      name: 'descriptor proxy values vary',
      make: () => {
        let reads = 0;
        return new Proxy(
          { a: 1 },
          {
            getOwnPropertyDescriptor(target, key) {
              const desc = Reflect.getOwnPropertyDescriptor(target, key)!;
              if (key === 'a') desc.value = ++reads;
              return desc;
            },
          },
        );
      },
    },
    {
      name: 'proxy descriptor host fault',
      make: () =>
        new Proxy(
          { a: 1 },
          {
            getOwnPropertyDescriptor() {
              throw new Error('test descriptor fault');
            },
          },
        ),
    },
  ];
  for (const bytes of [0, 1, 2, 3, 4, 5, 7, 8, 9, 10])
    cases.push({ name: `UTF-8 limit ${bytes}`, make: () => ({ a: '🦉' }), options: [bytes] });
  for (const depth of [0, 1, 31, 32, 33]) cases.push({ name: `depth ${depth}`, make: () => nested(depth) });
  for (const call of [1, 2, 3, 4, 5])
    cases.push({ name: `charge failure ${call}`, make: () => ({ a: [1, 2] }), chargeFault: call });
  return cases;
}

function observe(guard: Guard, entry: Case) {
  const value: any = entry.make(),
    charges: number[] = [],
    options = entry.options ?? [];
  let fault: Record<string, unknown> | undefined, text: string | undefined;
  const charge = (size: number) => {
    charges.push(size);
    if (entry.mutate && charges.length === 2) value.b = 3;
    if (entry.chargeFault === charges.length)
      throw new InterpretationError('inspection_budget', 'test charge exhausted');
  };
  try {
    // Its TypeScript default infers literal 32; also exercise numeric JS limits.
    text = guard(value, options[0], options[1] as 32 | undefined, charge, options[3], options[4]);
  } catch (error) {
    const e = error as any;
    fault = { name: e.name, code: e.code ?? null, kind: e.kind ?? null, message: e.message };
  }
  return { text: text ?? null, fault: fault ?? null, charges };
}

export function differential(compiled: Record<string, string>) {
  const guards = Object.fromEntries(
    Object.entries(compiled).map(([name, code]) => [name, createGuard(code, InterpretationError, PROFILE) as Guard]),
  );
  guards.sourceBaseline = guards.baseline!;
  guards.baseline = canonicalJson;
  let state = 0x5eedc0de;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
  const value = (depth = 0): any => {
    const pick = next() % (depth >= 3 ? 4 : 6);
    if (pick === 0) return null;
    if (pick === 1) return (next() % 20001) - 10000;
    if (pick === 2) return Boolean(next() % 2);
    if (pick === 3) return ['ascii', 'é', '中', '🦉', '\\"\n', '\u0000'][next() % 6]!.repeat(next() % 5);
    if (pick === 4) return Array.from({ length: next() % 5 }, () => value(depth + 1));
    return Object.fromEntries(Array.from({ length: next() % 5 }, (_, i) => [`field${i}`, value(depth + 1)]));
  };
  const cases = hostileCases();
  for (let i = 0; i < 1000; i++) {
    const fixture = value();
    cases.push({
      name: `seeded value ${i}`,
      make: () => structuredClone(fixture),
      options: [next() % 256, next() % 6],
    });
  }
  const comparisons = Object.fromEntries(
    Object.keys(guards)
      .filter((name) => name !== 'baseline')
      .map((name) => [name, { cases: 0, mismatches: [] as string[] }]),
  );
  const hostileOutcomes = [];
  for (const entry of cases) {
    const baseline = observe(guards.baseline!, entry);
    if (!entry.name.startsWith('seeded')) hostileOutcomes.push({ name: entry.name, baseline });
    for (const [name, record] of Object.entries(comparisons)) {
      const candidate = observe(guards[name]!, entry);
      record.cases++;
      if (JSON.stringify(candidate) !== JSON.stringify(baseline)) record.mismatches.push(entry.name);
    }
  }
  return { seed: '0x5eedc0de', comparisons, hostileOutcomes };
}
