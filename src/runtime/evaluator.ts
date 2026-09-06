import jsonata from 'jsonata';
import { InterpretationError, PROFILE } from './profile.ts';
import { canonicalJson, jsonCopy, safeName, type Json } from './values.ts';

const functions = new Set(['abs', 'ceil', 'floor', 'round', 'count', 'sum', 'min', 'max', 'length', 'exists', 'not', 'lookup', 'append', 'merge', 'contains', 'substring']);
const nodes = new Set(['path', 'name', 'string', 'number', 'value', 'variable', 'binary', 'unary', 'function', 'block', 'bind', 'condition', 'filter']);
const operators = new Set(['+', '-', '*', '/', '%', '=', '!=', '<', '<=', '>', '>=', 'and', 'or', 'in', '&']);
type Ast = Record<string, any>;

function checkAst(ast: unknown): void {
  let count = 0;
  const locals = new Set<string>();
  const reads: string[] = [];
  function walk(value: unknown, depth: number, parent?: Ast, field?: string) {
    if (!value || typeof value !== 'object') return;
    if (depth > PROFILE.astDepth || ++count > PROFILE.astNodes) throw new InterpretationError('source_complexity', 'Program AST exceeds the profile');
    if (Array.isArray(value)) { value.forEach(v => walk(v, depth + 1, parent, field)); return; }
    const node = value as Ast;
    if (typeof node.type === 'string') {
      if (!nodes.has(node.type)) throw new InterpretationError('unsupported_expression', `JSONata ${node.type} is outside the profile`);
      if (node.type === 'binary' && !operators.has(node.value)) throw new InterpretationError('unsupported_expression', `Operator ${node.value} is outside the profile`);
      if (node.type === 'unary' && !['[', '{', '-'].includes(node.value)) throw new InterpretationError('unsupported_expression', `Unary ${node.value} is outside the profile`);
      if (node.type === 'function' && (node.procedure?.type !== 'variable' || !functions.has(node.procedure.value))) throw new InterpretationError('unsupported_function', 'Only the named pure profile functions can be called');
      if (node.type === 'variable') {
        const name = node.value as string;
        const isCall = parent?.type === 'function' && field === 'procedure';
        // Only context, root and declared data locals are readable. The host
        // never exposes caller bindings, and callable aliases are not admitted.
        if (!isCall && name !== '' && name !== '$') reads.push(name);
      }
      if (node.type === 'bind' && (node.lhs?.type !== 'variable' || !node.lhs.value || node.lhs.value === '$' || functions.has(node.lhs.value))) throw new InterpretationError('unsupported_variable', 'Cannot replace the root or a profile function');
      if (node.type === 'bind') locals.add(node.lhs.value);
      if (node.type === 'name' && !safeName(node.value)) throw new InterpretationError('reserved_key', `Reserved property ${node.value}`);
      if (node.type === 'number' && !Number.isSafeInteger(node.value)) throw new InterpretationError('wire_number', 'Only safe integer literals are admitted');
    }
    for (const [key, v] of Object.entries(node)) walk(v, depth + 1, node, key);
  }
  walk(ast, 0);
  for (const name of reads) if (!locals.has(name) || functions.has(name)) throw new InterpretationError('unsupported_variable', `Variable $${name} is outside the profile`);
}

export interface Evaluation { value: Json; steps: number; inspectedBytes: number }

/** One pinned engine in host and browser. No user callbacks or external bindings. */
export async function evaluate(source: string, input: unknown): Promise<Evaluation> {
  if (new TextEncoder().encode(source).length > PROFILE.programBytes) throw new InterpretationError('source_bytes', 'Program exceeds 64 KiB');
  const ownedInput = jsonCopy(input);
  let expression: jsonata.Expression;
  try { expression = jsonata(source, { stack: PROFILE.evaluationDepth, sequence: PROFILE.sequenceLength }); }
  catch (error) { throw new InterpretationError('invalid_source', String((error as Error).message)); }
  checkAst(expression.ast());
  let steps = 0, inspectedBytes = 0;
  const charge = (bytes: number) => { if ((inspectedBytes += bytes) > PROFILE.inspectionBytes) throw new InterpretationError('inspection_budget', 'Intermediate encoded-byte inspection budget exhausted'); };
  // The pinned engine exposes symbol hooks. These are host-owned and cannot be
  // addressed from JSONata; their behavior is covered in the shared corpus.
  const assign = expression.assign as (name: string | symbol, value: unknown) => void;
  assign(Symbol.for('jsonata.__evaluate_entry'), () => {
    if (++steps > PROFILE.evaluationSteps) throw new InterpretationError('step_budget', 'Evaluation step budget exhausted');
  });
  assign(Symbol.for('jsonata.__evaluate_exit'), (node: Ast, _input: unknown, _environment: unknown, result: unknown) => {
    // The procedure variable is an engine-owned function object, never data.
    if (node.type === 'variable' && functions.has(node.value)) return;
    if (result !== undefined) canonicalJson(result, PROFILE.intermediateBytes, PROFILE.inputDepth, charge, true);
  });
  try {
    const value = await expression.evaluate(ownedInput);
    if (value === undefined) throw new InterpretationError('absent_result', 'Expression produced no JSON value');
    return { value: jsonCopy(value, PROFILE.outputBytes, true), steps, inspectedBytes };
  } catch (error) {
    if (error instanceof InterpretationError) throw error;
    const code = (error as { code?: string }).code;
    if (code === 'D1011') throw new InterpretationError('evaluation_depth', 'Engine evaluation nesting limit reached');
    if (code === 'D2014' || code === 'D2015') throw new InterpretationError('sequence_limit', 'Engine sequence length limit reached');
    throw new InterpretationError('engine_error', String((error as Error).message));
  }
}

export type FoldResult = { decision: 'effective'; state: Json } | { decision: 'ineffective'; reason: string; message?: string };
export async function fold(source: string, input: { meta: Json; act: Json; state: Json }): Promise<FoldResult> {
  canonicalJson(input.act, PROFILE.actionBytes);
  canonicalJson(input.state, PROFILE.stateBytes);
  const { value } = await evaluate(source, input);
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new InterpretationError('fold_output', 'Fold must return an outcome object');
  const keys = Object.keys(value).sort().join(',');
  if (value.decision === 'effective' && keys === 'decision,state') {
    if (!value.state || Array.isArray(value.state) || typeof value.state !== 'object') throw new InterpretationError('fold_output', 'State must be an object');
    canonicalJson(value.state, PROFILE.stateBytes);
    return value as FoldResult;
  }
  if (value.decision === 'ineffective' && (keys === 'decision,reason' || keys === 'decision,message,reason') && typeof value.reason === 'string' && /^[a-z][a-z0-9_]{0,63}$/.test(value.reason) && (value.message === undefined || typeof value.message === 'string')) return value as FoldResult;
  throw new InterpretationError('fold_output', 'Invalid decision, state, reason, or extra outcome field');
}
