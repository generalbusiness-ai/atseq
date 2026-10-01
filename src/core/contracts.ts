import { deepFreeze } from './freeze.ts';
import schema0 from '../../lexicons/ai/generalbusiness/atseq/activate.json';
import schema1 from '../../lexicons/ai/generalbusiness/atseq/compareDefinition.json';
import schema2 from '../../lexicons/ai/generalbusiness/atseq/create.json';
import schema3 from '../../lexicons/ai/generalbusiness/atseq/definition.json';
import schema4 from '../../lexicons/ai/generalbusiness/atseq/defs.json';
import schema5 from '../../lexicons/ai/generalbusiness/atseq/describe.json';
import schema6 from '../../lexicons/ai/generalbusiness/atseq/entry.json';
import schema7 from '../../lexicons/ai/generalbusiness/atseq/genesis.json';
import schema8 from '../../lexicons/ai/generalbusiness/atseq/head.json';
import schema9 from '../../lexicons/ai/generalbusiness/atseq/list.json';
import schema10 from '../../lexicons/ai/generalbusiness/atseq/preview.json';
import schema11 from '../../lexicons/ai/generalbusiness/atseq/query.json';
import schema12 from '../../lexicons/ai/generalbusiness/atseq/readDraft.json';
import schema13 from '../../lexicons/ai/generalbusiness/atseq/receipt.json';
import schema14 from '../../lexicons/ai/generalbusiness/atseq/source.json';
import schema15 from '../../lexicons/ai/generalbusiness/atseq/stageDefinition.json';
import schema16 from '../../lexicons/ai/generalbusiness/atseq/submit.json';
import schema17 from '../../lexicons/ai/generalbusiness/atseq/sync.json';
import schema18 from '../../lexicons/ai/generalbusiness/atseq/validateDraft.json';
import { PROFILE } from './profile.ts';
import { NSID_PREFIX } from './nsids.ts';
import { interpretationErrorTags } from './errors.ts';
/** Descriptions are editorial; all Lexicon validation fields are semantic. */
function semantic(value: any): any {
  if (Array.isArray(value)) return value.map(semantic);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => k !== 'description')
        .map(([k, v]) => [k, semantic(v)]),
    );
  return value;
}
export const logDescriptor = deepFreeze({
  name: 'atseq-log-v1',
  version: 1,
  namespace: NSID_PREFIX,
  wire: {
    model: 'AT Protocol data model',
    encoding: 'canonical DAG-CBOR',
    cid: 'CIDv1 dag-cbor sha2-256 base32',
    blockBytes: 65536,
    jsonBytes: 131072,
    depth: 32,
    numbers: 'safe integers excluding negative zero',
    bytes: 'canonical unpadded base64',
    keys: 'closed framework objects; only $type, $bytes, $link reserved forms',
  },
  signatures: {
    algorithm: 'P-256 SHA-256',
    format: '64-byte compact low-S',
    keys: 'canonical compressed did:key',
    actor: 'sign canonical intent block',
    sequencer: 'sign entry excluding sig',
  },
  order: [
    'invitation pins app DID and genesis CID',
    'genesis pins sequencer and activation keys',
    'positions are contiguous positive safe integers',
    'prev names the preceding canonical block; position zero names genesis',
    'head chooses a complete verified prefix',
    'retry identity is app, actorKey, nonce; same identity must bind the same intent CID',
  ],
  lexicons: [
    schema0,
    schema1,
    schema2,
    schema3,
    schema4,
    schema5,
    schema6,
    schema7,
    schema8,
    schema9,
    schema10,
    schema11,
    schema12,
    schema13,
    schema14,
    schema15,
    schema16,
    schema17,
    schema18,
  ].map(semantic),
});
export const engineDescriptor = deepFreeze({
  name: 'atseq-jsonata-v1',
  version: 1,
  language: 'JSONata expression semantics for the admitted pure subset',
  functions: [
    'abs',
    'ceil',
    'floor',
    'round',
    'count',
    'sum',
    'min',
    'max',
    'length',
    'exists',
    'not',
    'lookup',
    'append',
    'merge',
    'contains',
    'substring',
  ],
  nodes: [
    'path',
    'name',
    'string',
    'number',
    'value',
    'variable',
    'binary',
    'unary',
    'function',
    'block',
    'bind',
    'condition',
    'filter',
  ],
  operators: ['+', '-', '*', '/', '%', '=', '!=', '<', '<=', '>', '>=', 'and', 'or', 'in', '&'],
  limits: PROFILE,
  values: [
    'plain owned JSON; well-formed Unicode; no cycles, accessors, symbols, sparse arrays or reserved property names',
    'input and output integers must be safe and exclude negative zero',
    'intermediate negative zero is inspected as zero; other non-safe integers fail',
    'sum uses exact integer accumulation and rejects any unsafe intermediate sum',
    'no external bindings, callbacks, time, randomness, lambdas, recursive calls or callable aliases',
    'AST limits count containers; evaluation depth counts active AST ancestor nesting, never concurrent siblings',
    'inspection budget charges every encoded token at each evaluated data result',
    'undefined final result fails; engine sequence metadata is stripped at output',
  ],
  fold: [
    'effective result has exactly decision and object state within state bounds',
    'ineffective result has decision and reason, optionally message',
    'reason matches [a-z][a-z0-9_]{0,63}; message has at most 1024 Unicode code points',
  ],
  errors: interpretationErrorTags,
});
export const applicationDescriptor = deepFreeze({
  name: 'atseq-app-v1',
  version: 1,
  log: logDescriptor,
  evaluator: engineDescriptor,
  definition: [
    'manifest is closed Lexicon data with immutable retained raw-CID source files',
    'source closure is sorted and unique, bounded and hash-verified',
    'all action, state and query schemas are checked without coercion',
    'initial state and programs are preflighted; views use only retained local Inlay templates and registered primitives',
  ],
  fold: [
    'entries are interpreted once in verified order',
    'wrong definition, unknown action, invalid action and unauthorized activation are ineffective',
    'deterministic program, schema, state and bounds errors record fold_failed/<code> and retain prior state',
    'only tagged restorable content errors or persistence failure pause the interpretation frontier',
    'state, outcome, definition and frontier commit together',
    'head may be ahead of the interpretation frontier',
  ],
  activation: [
    'genesis activation keys authorize the control action',
    'expected definition must equal the active definition',
    'complete retained closure is fetched before validation',
    'activation requires identical runtime and complete state schema; migrations are unavailable',
    'invalid available activation is ineffective; restorable missing or corrupt content pauses and can retry',
  ],
  query: 'query failure is unavailable and never advances or changes state',
  views: {
    primitives: ['Panel', 'Text', 'Action'].map((name) => `${NSID_PREFIX}.ui.${name}`),
    external: 'no network, XRPC, ambient keys or scripts',
  },
});
