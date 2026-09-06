import { fromBytes } from '@atcute/cbor';
import { fold } from '../runtime/evaluator.ts';
import { Folder } from '../runtime/folder.ts';
import { Anchor } from '../protocol/log.ts';
import { SourceBundle } from '../definition/source.ts';
import { LoadedDefinition } from '../definition/load.ts';
import { describeDefinition, previewSource } from '../client/definition.ts';
import { Applications } from '../runtime/apps.ts';

let apps = new Applications(), folder: Folder | undefined, definition: LoadedDefinition | undefined;
let queue: Promise<unknown> = Promise.resolve();
self.onmessage = ({ data }) => { queue = queue.then(() => handle(data)); };
async function handle(data: any) {
  try {
    let result;
    switch (data.kind) {
      case 'preview': result = await previewSource(new Uint8Array(data.source), data.action, data.payload, data.state); break;
      case 'sync': {
        const input = data.input;
        if (input.genesis.app !== data.invitation.app || input.genesisCid !== data.invitation.genesis) throw new Error('Host response differs from the pinned invitation');
        const source = await SourceBundle.read(fromBytes(input.source));
        const anchor = await Anchor.from(input.genesis, data.invitation.genesis);
        folder = await apps.open(anchor.genesis, anchor.cid, source);
        definition = await LoadedDefinition.load(anchor.genesis.definition.$link, source);
        result = { ...await folder.catchUp(input.head, input.entries), definition: await describeDefinition(definition) }; break;
      }
      case 'previewPending': {
        if (!folder || !definition) throw new Error('Open an app first');
        const base = folder.snapshot().projection; let state = structuredClone(base.state); const outcomes = [];
        if (data.intents.length > 100) throw new Error('Pending preview is limited to 100 actions');
        for (const [offset, intent] of data.intents.entries()) {
          if (intent.definition.$link !== definition.cid) { outcomes.push({ decision: 'ineffective', reason: 'definition_changed' }); continue; }
          const binding = definition.manifest.actions.find(a => a.ref === intent.action); if (!binding) throw new Error('Unknown queued action');
          definition.schemas.validate(binding.ref, intent.payload);
          const outcome = await fold(definition.text(binding.fold), { state, act: intent.payload, meta: { app: base.app, position: base.frontier.position + offset + 1, actorKey: intent.actorKey, definition: definition.cid } });
          if (outcome.decision === 'effective') { definition.schemas.validate(definition.manifest.state.ref, outcome.state); state = outcome.state; outcomes.push({ decision: 'effective' }); }
          else outcomes.push(outcome);
        }
        result = { state, outcomes, basedOn: base.frontier }; break;
      }
      case 'validateAction': {
        if (!definition || !definition.manifest.actions.some(a => a.ref === data.action)) throw new Error('Unknown action');
        definition.schemas.validate(data.action, data.payload); result = true; break;
      }
      case 'query': if (!folder) throw new Error('Open an app first'); result = await folder.query(data.name, data.params); break;
      case 'view': {
        if (!folder || !definition) throw new Error('Open an app first');
        const binding = definition.manifest.views.find(v => v.name === data.name); if (!binding) throw new Error('Unknown view');
        const query = binding.query ? await folder.query(binding.query, data.params ?? {}) : undefined;
        if (query && query.result.$type !== 'test.atseq.defs#queryAvailable') throw new Error('View query is unavailable; supply its required parameters');
        const props = query ? query.result.value : {};
        if (!props || Array.isArray(props) || typeof props !== 'object') throw new Error('View query must supply object properties');
        result = await definition.view(data.name, props as any); break;
      }
      case 'reset': apps = new Applications(); folder = undefined; definition = undefined; result = true; break;
      default: throw new Error('Unknown worker operation');
    }
    self.postMessage({ id: data.id, result });
  } catch (error) { self.postMessage({ id: data.id, error: { code: (error as any).code ?? 'unavailable', message: (error as Error).message } }); }
}
