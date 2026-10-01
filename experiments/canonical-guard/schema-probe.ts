import { ValidationError } from '@atproto/lexicon';
import { Schemas } from '../../src/definition/schemas.ts';

/** Exercise unchanged real wrappers with controlled validator outcomes. */
export function wrapperCases() {
  const cases = [
    {
      name: 'mutates input and returns alias',
      make: () => ({ n: 1 }),
      validate: (v: any) => {
        v.n = 2;
        return v;
      },
    },
    {
      name: 'mutates input and returns equal distinct object',
      make: () => ({ n: 1 }),
      validate: (v: any) => {
        v.n = 2;
        return { n: 2 };
      },
    },
    { name: 'distinct coercion', make: () => ({ n: 1 }), validate: () => ({ n: 2 }) },
    {
      name: 'mutates alias to negative zero',
      make: () => ({ n: 1 }),
      validate: (v: any) => {
        v.n = -0;
        return v;
      },
    },
    {
      name: 'ValidationError maps to schema_value',
      make: () => ({ n: 1 }),
      validate: () => {
        throw new ValidationError('controlled invalid value');
      },
    },
    {
      name: 'host fault remains host fault',
      make: () => ({ n: 1 }),
      validate: () => {
        throw new Error('controlled host fault');
      },
    },
    {
      name: 'descriptor proxy across successive walks',
      make: () => {
        let n = 0;
        return new Proxy(
          { n: 1 },
          {
            getOwnPropertyDescriptor(target, key) {
              const desc = Reflect.getOwnPropertyDescriptor(target, key)!;
              if (key === 'n') desc.value = ++n;
              return desc;
            },
          },
        );
      },
      validate: (v: any) => v,
    },
  ];
  return ['validate', 'queryParams', 'queryResult'].flatMap((route) =>
    cases.map((entry) => {
      const receiver = Object.create(Schemas.prototype);
      receiver.lexicons = {
        validate(_ref: string, value: unknown) {
          return { success: true, value: entry.validate(value) };
        },
        assertValidXrpcParams(_ref: string, value: unknown) {
          return entry.validate(value);
        },
        assertValidXrpcOutput(_ref: string, value: unknown) {
          return entry.validate(value);
        },
      };
      try {
        receiver[route]('ai.generalbusiness.atseq.experiment', entry.make());
        return { route, name: entry.name, accepted: true };
      } catch (error) {
        const e = error as any;
        return {
          route,
          name: entry.name,
          accepted: false,
          code: e.code ?? null,
          kind: e.kind ?? null,
          message: e.message,
        };
      }
    }),
  );
}
