import { hostMessage } from './host-access.ts';
import { NSID } from '../core/nsids.ts';
import { ApiError, type AtseqClient } from '../client/api.ts';
import { saveDraft, type DeviceStore, type Draft } from '../client/store.ts';
import { bytes } from '../protocol/wire.ts';
import type { Invitation } from '../protocol/log.ts';
import type { ViewNode } from '../view/inlay.ts';
import type { DeviceIdentity } from './identity.ts';
import type { Evaluator } from './evaluator.ts';
import type { Preview } from './protocol.ts';
import { element, button, actionForm } from './forms.ts';
export interface DraftContext {
  draft: Draft;
  preview: Preview;
  content: HTMLElement;
  evaluator: Evaluator;
  store: DeviceStore;
  api: AtseqClient;
  identity: () => DeviceIdentity | undefined;
  visible: () => boolean;
  setDraft: (draft: Draft) => void;
  setPreview: (preview: Preview) => void;
  redraw: () => void;
  tell: (message: string) => void;
  inspect: (label: string, value: unknown) => HTMLElement;
  showIdentity: (next: () => void) => void;
  applications: () => Promise<void>;
  openApp: (invitation: Invitation) => Promise<void>;
}
export async function retainDraft(store: DeviceStore, evaluator: Evaluator, raw: Uint8Array) {
  const checked = await evaluator.call('preview', { source: raw });
  const prior = await store.get<string>(`draft-source:${checked.definition.cid}`);
  let draft = prior ? await store.get<Draft>(`draft:${prior}`) : undefined;
  if (!draft) {
    draft = await saveDraft(
      store,
      { id: crypto.randomUUID(), revision: 0, creationId: crypto.randomUUID(), source: [...raw] },
      undefined,
    );
    await store.set(`draft-source:${checked.definition.cid}`, draft.id);
  }
  return { draft, checked };
}
export function drawDraft(ctx: DraftContext) {
  let { draft, preview } = ctx;
  const definition = preview.definition;
  const { content, evaluator, store, api, tell, inspect, visible } = ctx;
  const heading = element('div');
  heading.append(element('span', 'Draft · only here', 'tag'), element('h1', definition.manifest.title));
  const card = element('section', undefined, 'card');
  card.append(
    element('h2', 'Try this app with sample data'),
    element('p', 'Sample actions stay in this preview. Starting the app uses its declared initial state.', 'muted'),
  );
  for (const action of definition.manifest.actions) {
    card.append(
      button(action.ref.split('#').at(-1)!, () => {
        const form = actionForm(definition!, action.ref, 'Try sample action', async (payload) => {
          if (!visible()) return;
          tell('Evaluating sample data…');
          const result = await evaluator.call('preview', {
            source: draft!.source,
            action: action.ref,
            payload,
            state: preview!.state,
          });
          if (!visible()) return;
          preview = result;
          ctx.setPreview(result);
          ctx.redraw();
          tell(
            result.outcome?.decision === 'ineffective'
              ? `Sample not applied: ${result.outcome.reason}`
              : 'Sample applied locally. Nothing was published.',
          );
        });
        formArea.replaceChildren(form);
        form.querySelector('input,textarea,select')?.scrollIntoView({ block: 'nearest' });
      }),
    );
  }
  const formArea = element('div');
  const renderPreview = (node: ViewNode): Node => {
    if (typeof node === 'string') return document.createTextNode(node);
    if (node.type === NSID.uiAction)
      return button(String(node.props.label), () => {
        const ref = String(node.props.action);
        if (!definition!.manifest.actions.some((a) => a.ref === ref)) {
          tell('View names an unavailable action');
          return;
        }
        formArea.replaceChildren(
          actionForm(definition!, ref, 'Try sample action', async (payload) => {
            if (!visible()) return;
            const result = await evaluator.call('preview', {
              source: draft!.source,
              action: ref,
              payload,
              state: preview!.state,
            });
            if (!visible()) return;
            ctx.setPreview(result);
            ctx.redraw();
            tell('Sample evaluated locally. Nothing was published.');
          }),
        );
      });
    const nodeElement = element(node.type === NSID.uiText ? 'p' : 'div');
    nodeElement.append(...node.children.map(renderPreview));
    return nodeElement;
  };
  for (const view of preview.views ?? []) {
    const area = element('div', undefined, 'view');
    area.append(...(view.tree ?? []).map(renderPreview));
    if (view.error) area.append(element('p', `View unavailable: ${view.error}`, 'muted'));
    card.append(area);
  }
  card.append(formArea, inspect('Sample state', preview.state));
  const publication = element('section', undefined, 'card');
  publication.append(
    element('h2', 'Start this app'),
    element('p', 'Destination: Test PDS · public demo data'),
    element(
      'p',
      'The definition and future signed actions will be retained on this test PDS. Use synthetic examples. Your local identity receives the initial app-update grant.',
      'muted',
    ),
  );
  const start = button(
    draft.activationKeys ? 'Retry starting this app' : 'Start this app',
    async () => {
      if (!visible()) return;
      const identity = ctx.identity();
      if (!identity) {
        ctx.showIdentity(() => {
          if (visible()) ctx.redraw();
        });
        return;
      }
      if (start.disabled) return;
      start.disabled = true;
      try {
        // The publication attempt freezes its source, grants and creation ID before
        // network I/O. A later retry cannot silently choose a different identity.
        const frozen = await store.update<Draft>(`draft:${draft!.id}`, (previous) => {
          if (!previous || previous.revision !== draft!.revision)
            throw new Error('Draft revision changed. Reopen the preview.');
          return { ...previous, activationKeys: previous.activationKeys ?? [identity!.publicKey] };
        });
        draft = frozen;
        if (!visible()) return;
        ctx.setDraft(frozen);
        tell('Starting on the test PDS…');
        const created = await api.call(
          'create',
          { source: bytes(new Uint8Array(frozen.source)), activationKeys: frozen.activationKeys },
          frozen.creationId,
        );
        const invitation = { app: created.genesis.app, genesis: created.genesisCid.$link };
        await store.update<Draft>(`draft:${frozen.id}`, (previous) => ({ ...previous!, published: invitation }));
        await ctx.applications();
        if (!visible()) return;
        await ctx.openApp(invitation);
        tell('App started. Sample actions were kept in the preview.');
      } catch (error) {
        if (!visible()) return;
        tell(
          `Draft retained. ${error instanceof ApiError && error.code === 'host_token' ? hostMessage(error) : error instanceof ApiError && error.permanent ? `Starting was refused: ${error.message}` : navigator.onLine ? 'Starting could not be confirmed; retry this same draft.' : 'Offline — start when this device reconnects.'}`,
        );
      } finally {
        start.disabled = false;
      }
    },
    'primary',
  );
  publication.append(start);
  content.replaceChildren(
    heading,
    card,
    publication,
    inspect('Inspect definition', definition),
    button('Cancel local preview work', () => {
      if (!visible()) return;
      evaluator.cancel();
      tell('Preview cancelled. Source remains saved on this device.');
    }),
  );
}
