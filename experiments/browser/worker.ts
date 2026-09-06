import { runCorpus } from '../corpus.ts';
import { evaluate, fold } from '../../src/runtime/evaluator.ts';
import { Schemas } from '../../src/definition/schemas.ts';

self.onmessage = async ({ data }) => {
  try {
    let result: unknown;
    if (data.kind === 'corpus') result = await runCorpus();
    else if (data.kind === 'fold') {
      const schemas = new Schemas(data.schemas);
      schemas.validate(data.stateSchema, data.input.state);
      schemas.validate(data.actionSchema, data.input.act);
      result = await fold(data.source, data.input);
      if ((result as any).decision === 'effective') schemas.validate(data.stateSchema, (result as any).state);
    } else if (data.kind === 'query') result = await evaluate(data.source, data.input);
    else throw new Error('Unknown experiment operation');
    self.postMessage({ id: data.id, result });
  } catch (error) { self.postMessage({ id: data.id, error: { code: (error as any).code ?? 'worker_error', message: (error as Error).message } }); }
};
