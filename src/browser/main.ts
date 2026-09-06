import './style.css';
import { fromBytes } from '@atcute/cbor';
import { AtseqClient, ApiError } from '../client/api.ts';
import { DeviceStore, saveDraft, type Draft } from '../client/store.ts';
import { createIdentity, prepareIntent, type Identity, type Invitation } from '../client/identity.ts';
import { bytes } from '../protocol/wire.ts';
import type { Json } from '../runtime/values.ts';
import { resolveSchema, type DefinitionInfo } from '../client/definition.ts';
import type { ViewNode } from '../ui/inlay.ts';
import { Evaluator } from './evaluator.ts';
import { element, button, actionForm, schemaForm } from './forms.ts';

interface Pending {
  cid: string; block: number[]; signed: any; app: string; genesis: string;
  status: 'queued' | 'recorded' | 'applied' | 'not-applied' | 'refused';
  receipt?: any; outcome?: any; error?: string;
}
const api = new AtseqClient(location.origin), store = await DeviceStore.open(), evaluator = new Evaluator();
const content = document.querySelector<HTMLDivElement>('#content')!, status = document.querySelector<HTMLParagraphElement>('#status')!;
const identityDialog = document.querySelector<HTMLDialogElement>('#identity-dialog')!;
let identity = await store.get<Identity>('identity'), current: Invitation | undefined, snapshot: any, definition: DefinitionInfo | undefined;
let draft: Draft | undefined, preview: any, flushing = false, refreshing = false, refreshAgain = false;
let editorArea: HTMLElement | undefined;
let afterIdentity: (() => void) | undefined;
function tell(message: string) { status.textContent = message; }
function failure(error: unknown) { tell((error as Error).message); }
function inspect(label: string, value: unknown) { const details = element('details'), pre = element('pre', JSON.stringify(value, null, 2)); details.append(element('summary', label), pre); return details; }
function showIdentity(next?: () => void) { afterIdentity = next; identityDialog.showModal(); identityDialog.querySelector('input')!.focus(); }
function drawIdentity() {
  const root = document.querySelector('#identity')!;
  root.replaceChildren(identity ? element('span', `${identity.name} · this device`, 'muted') : button('Create identity', () => showIdentity()));
}
document.querySelector('#identity-cancel')!.addEventListener('click', () => identityDialog.close());
document.querySelector<HTMLFormElement>('#identity-form')!.onsubmit = async event => {
  event.preventDefault(); const form = event.currentTarget as HTMLFormElement, submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  if (submit.disabled) return; submit.disabled = true;
  try { const made = await createIdentity(String(new FormData(form).get('name'))); identity = await store.update<Identity>('identity', existing => existing ?? made); drawIdentity(); identityDialog.close(); afterIdentity?.(); afterIdentity = undefined; }
  catch (error) { document.querySelector('#identity-error')!.textContent = (error as Error).message; }
  finally { submit.disabled = false; }
};
async function applications() {
  let apps = await store.get<any[]>('apps') ?? [];
  try { apps = (await api.call('list')).apps; await store.set('apps', apps); } catch { /* Last seen invitations remain usable offline. */ }
  const nav = document.querySelector('#applications')!;
  nav.replaceChildren(...apps.map(app => button(app.title, () => openApp({ app: app.app, genesis: app.genesis }).catch(failure))));
}
async function importDraft(raw: Uint8Array) {
  const checked = await evaluator.call('preview', { source: [...raw] });
  const prior = await store.get<string>(`draft-source:${checked.definition.cid}`);
  draft = prior ? await store.get<Draft>(`draft:${prior}`) : undefined;
  if (!draft) {
    const id = crypto.randomUUID(); draft = await saveDraft(store, { id, revision: 0, creationId: crypto.randomUUID(), source: [...raw] }, undefined);
    await store.set(`draft-source:${checked.definition.cid}`, id);
  }
  if (draft.published) { await openApp(draft.published); return; }
  current = undefined; preview = checked; definition = checked.definition; drawDraft(); tell('Draft · saved on this device. Nothing has been published.');
}
document.querySelector<HTMLInputElement>('#import')!.onchange = async event => {
  const input = event.target as HTMLInputElement, file = input.files?.[0]; if (!file) return;
  try { if (file.size > 512 * 1024) throw new Error('Definition CAR exceeds 512 KiB'); await importDraft(new Uint8Array(await file.arrayBuffer())); }
  catch (error) { failure(error); } finally { input.value = ''; }
};
function drawDraft() {
  if (!draft || !preview || !definition) return;
  const heading = element('div'); heading.append(element('span', 'Draft · only here', 'tag'), element('h1', definition.manifest.title));
  const card = element('section', undefined, 'card'); card.append(element('h2', 'Try this app with sample data'), element('p', 'Sample actions stay in this preview. Starting the app uses its declared initial state.', 'muted'));
  for (const action of definition.manifest.actions) {
    card.append(button(action.ref.split('#').at(-1)!, () => {
      const form = actionForm(definition!, action.ref, 'Try sample action', async payload => {
        tell('Evaluating sample data…');
        const result = await evaluator.call('preview', { source: draft!.source, action: action.ref, payload, state: preview.state });
        preview = result; drawDraft(); tell(result.outcome?.decision === 'ineffective' ? `Sample not applied: ${result.outcome.reason}` : 'Sample applied locally. Nothing was published.');
      });
      formArea.replaceChildren(form); form.querySelector('input,textarea,select')?.scrollIntoView({ block: 'nearest' });
    }));
  }
  const formArea = element('div');
  const renderPreview = (node: ViewNode): Node => {
    if (typeof node === 'string') return document.createTextNode(node);
    if (node.type === 'test.atseq.ui.Action') return button(String(node.props.label), () => {
      const ref = String(node.props.action);
      if (!definition!.manifest.actions.some(a => a.ref === ref)) { tell('View names an unavailable action'); return; }
      formArea.replaceChildren(actionForm(definition!, ref, 'Try sample action', async payload => {
        preview = await evaluator.call('preview', { source: draft!.source, action: ref, payload, state: preview.state }); drawDraft(); tell('Sample evaluated locally. Nothing was published.');
      }));
    });
    const nodeElement = element(node.type === 'test.atseq.ui.Text' ? 'p' : 'div'); nodeElement.append(...node.children.map(renderPreview)); return nodeElement;
  };
  for (const view of preview.views ?? []) { const area = element('div', undefined, 'view'); area.append(...(view.tree ?? []).map(renderPreview)); if (view.error) area.append(element('p', `View unavailable: ${view.error}`, 'muted')); card.append(area); }
  card.append(formArea, inspect('Sample state', preview.state));
  const publication = element('section', undefined, 'card'); publication.append(element('h2', 'Start this app'), element('p', 'Destination: Test PDS · public demo data'), element('p', 'The definition and future signed actions will be retained on this test PDS. Use synthetic examples. Your local identity receives the initial app-update grant.', 'muted'));
  const start = button(draft.activationKeys ? 'Retry starting this app' : 'Start this app', async () => {
    if (!identity) { showIdentity(drawDraft); return; }
    if (start.disabled) return; start.disabled = true;
    try {
      // The publication attempt freezes its source, grants and creation ID before
      // network I/O. A later retry cannot silently choose a different identity.
      const frozen = await store.update<Draft>(`draft:${draft!.id}`, previous => {
        if (!previous || previous.revision !== draft!.revision) throw new Error('Draft revision changed. Reopen the preview.');
        return { ...previous, activationKeys: previous.activationKeys ?? [identity!.publicKey] };
      }); draft = frozen;
      tell('Starting on the test PDS…');
      const created = await api.call('create', { source: bytes(new Uint8Array(frozen.source)), activationKeys: frozen.activationKeys }, frozen.creationId);
      const invitation = { app: created.genesis.app, genesis: created.genesisCid.$link };
      await store.update<Draft>(`draft:${frozen.id}`, previous => ({ ...previous!, published: invitation }));
      await applications(); await openApp(invitation); tell('App started. Sample actions were kept in the preview.');
    } catch (error) { tell(`Draft retained. ${navigator.onLine ? 'Starting could not be confirmed; retry this same draft.' : 'Offline — start when this device reconnects.'}`); }
    finally { start.disabled = false; }
  }, 'primary');
  publication.append(start); content.replaceChildren(heading, card, publication, inspect('Inspect definition', definition), button('Cancel local preview work', () => { evaluator.cancel(); tell('Preview cancelled. Source remains saved on this device.'); }));
}
async function openApp(invitation: Invitation) {
  current = invitation; draft = undefined; editorArea = undefined; snapshot = undefined; definition = undefined; history.replaceState(null, '', `/#${new URLSearchParams({ ...invitation })}`);
  const retained = await store.get<any>(`verified:${invitation.app}:${invitation.genesis}`);
  if (retained) try {
    snapshot = await evaluator.call('sync', { invitation, input: retained }); definition = snapshot.definition;
    await drawApp(); tell('Saved state on this device. Checking for newer entries…');
  } catch { tell('Saved inputs failed verification. Fetching a verified prefix…'); }
  await refresh();
}
async function refresh() {
  if (!current) return;
  if (refreshing) { refreshAgain = true; return; }
  refreshing = true;
  document.querySelectorAll<HTMLButtonElement>('button[data-refresh]').forEach(button => { button.disabled = true; });
  const invitation = { ...current };
  try {
    const input = await api.call('sync', invitation), checked = await evaluator.call('sync', { invitation, input });
    // Only worker-verified inputs become the device's canonical cache.
    await store.set(`verified:${invitation.app}:${invitation.genesis}`, input);
    if (current?.app !== invitation.app) return;
    snapshot = checked; definition = checked.definition; await reconcile(); await drawApp();
    tell(checked.stalled ? `Saved through ${checked.head.position}; interpretation paused at ${checked.stalled.position}: ${checked.stalled.code}` : `Verified through entry ${checked.projection.frontier.position}.`);
  } catch (error) {
    if (snapshot && current?.app === invitation.app) { await drawApp(); tell(`${navigator.onLine ? `Latest data unavailable: ${(error as Error).message}.` : 'Offline.'} Showing saved state through entry ${snapshot.projection.frontier.position}. Pending actions stay on this device.`); }
    else { content.replaceChildren(element('h1', 'App unavailable'), element('p', 'No verified state is saved on this device. The invitation is retained; retry when its source is available.'), button('Retry', () => refresh())); failure(error); }
  } finally {
    refreshing = false; document.querySelectorAll<HTMLButtonElement>('button[data-refresh]').forEach(button => { button.disabled = false; });
    if (current && (refreshAgain || current.app !== invitation.app)) { refreshAgain = false; await refresh(); }
  }
}
async function reconcile() {
  if (!current || !snapshot) return;
  for (const pending of await store.list<Pending>(`outbox:${current.app}:`)) {
    const observed = snapshot.projection.outcomes.find((o: any) => o.intent === pending.cid);
    if (!observed) continue;
    await store.set(`outbox:${pending.app}:${pending.cid}`, { ...pending, status: observed.outcome.$type === 'test.atseq.defs#effective' ? 'applied' : 'not-applied', outcome: observed.outcome, receipt: { position: observed.position, entry: observed.entry, intent: observed.intent }, error: undefined });
  }
}
async function flush() {
  if (flushing) return; flushing = true;
  try {
    for (const pending of await store.list<Pending>('outbox:')) {
      if (!['queued', 'recorded'].includes(pending.status)) continue;
      try {
        const recorded = await api.call('submit', { block: bytes(new Uint8Array(pending.block)) });
        await store.set(`outbox:${pending.app}:${pending.cid}`, { ...pending, status: 'recorded', receipt: recorded.receipt, error: undefined });
      } catch (error) {
        const refused = error instanceof ApiError && error.status >= 400 && error.status < 500;
        await store.set(`outbox:${pending.app}:${pending.cid}`, { ...pending, status: refused ? 'refused' : pending.status, error: refused ? error.message : 'Reply uncertain. The original signed action is retained for retry.' });
      }
    }
    await refresh();
  } finally { flushing = false; }
}
function primitive(node: ViewNode, area: HTMLElement): Node {
  if (typeof node === 'string') return document.createTextNode(node);
  if (node.type === 'test.atseq.ui.Action') {
    if (typeof node.props.action !== 'string' || typeof node.props.label !== 'string' || !definition?.manifest.actions.some(a => a.ref === node.props.action)) throw new Error('View names an unavailable action');
    return button(node.props.label, () => openAction(node.props.action as string, area));
  }
  if (!['test.atseq.ui.Panel', 'test.atseq.ui.Text'].includes(node.type)) throw new Error('Unknown view primitive');
  const target = element(node.type === 'test.atseq.ui.Text' ? 'p' : 'div'); target.append(...node.children.map(child => primitive(child, area))); return target;
}
function openAction(ref: string, area: HTMLElement, initial?: Record<string, Json>) {
  if (!identity) { showIdentity(() => openAction(ref, area, initial)); return; }
  const pinned = { ...current! }, pinnedDefinition = definition!.cid;
  const form = actionForm(definition!, ref, 'Save action', async payload => {
    if (current?.app !== pinned.app || definition?.cid !== pinnedDefinition) throw new Error('App changed. Review this action with the current form.');
    if ((await store.list<Pending>(`outbox:${pinned.app}:`)).filter(p => ['queued', 'recorded'].includes(p.status)).length >= 100) throw new Error('This device already has 100 waiting actions. Resolve them before adding another.');
    await evaluator.call('validateAction', { action: ref, payload });
    const prepared = await prepareIntent(identity!, pinned, pinnedDefinition, ref, payload);
    await store.set<Pending>(`outbox:${pinned.app}:${prepared.cid}`, { ...prepared, ...pinned, status: 'queued' });
    tell('Queued on this device. Waiting for a verified receipt.'); area.replaceChildren(); await drawApp(); await flush();
  }, initial);
  area.replaceChildren(element('h3', ref.split('#').at(-1)), form); (form.querySelector('input,textarea,select') as HTMLElement | null)?.focus();
}
async function drawApp() {
  if (!current || !definition || !snapshot) return;
  const title = element('div'); title.append(element('h1', definition.manifest.title), element('p', `Saved through ${snapshot.head.position} · interpreted through ${snapshot.projection.frontier.position}`, 'muted'));
  const controls = element('div', undefined, 'row controls'); const refreshButton = button('Refresh', () => refresh()); refreshButton.dataset.refresh = ''; refreshButton.disabled = refreshing; controls.append(refreshButton, button('Retry pending actions', () => flush()));
  const workspace = element('section', undefined, 'card'), formArea = editorArea ??= element('div'), view = element('div', undefined, 'view');
  workspace.append(view, formArea);
  const actions = element('div', undefined, 'row');
  for (const action of definition.manifest.actions) actions.append(button(action.ref.split('#').at(-1)!, () => openAction(action.ref, formArea)));
  workspace.prepend(element('h2', 'Participate'), actions);
  const queryArea = element('section', undefined, 'card'); queryArea.append(element('h2', 'Queries'));
  for (const query of definition.manifest.queries) {
    const result = element('div'), schema = resolveSchema(definition, query.ref);
    queryArea.append(element('h3', query.name), schemaForm(definition, schema.parameters ?? { properties: {} }, 'Run query', async params => {
      const response = await evaluator.call('query', { name: query.name, params }); result.replaceChildren(element('p', `Interpreted through entry ${response.frontier.position}`, 'muted'), element('pre', JSON.stringify(response.result, null, 2)));
    }), result);
  }
  const activity = element('section', undefined, 'card'); activity.append(element('h2', 'Activity'));
  const pending = await store.list<Pending>(`outbox:${current.app}:`);
  const labels = { queued: 'Queued on device', recorded: 'Saved, awaiting interpretation', applied: 'Applied', 'not-applied': 'Not applied', refused: 'Transport refused · retained on device' };
  for (const item of pending) {
    const row = element('div', undefined, 'activity'); row.append(element('strong', labels[item.status]), element('p', item.signed.intent.action));
    if (item.outcome?.reason) row.append(element('p', item.outcome.reason)); if (item.error) row.append(element('p', item.error, 'error'));
    row.append(inspect('Intent, receipt and effect', { intent: item.signed.intent, receipt: item.receipt ?? null, outcome: item.outcome ?? null })); activity.append(row);
  }
  const waiting = pending.filter(p => ['queued', 'recorded'].includes(p.status));
  if (waiting.length) {
    const estimated = element('section', undefined, 'card'); estimated.append(element('h2', 'Pending preview'), element('p', 'Estimated from this device’s queue. Other participants can change the result before these actions are recorded.', 'muted'));
    try { estimated.append(element('pre', JSON.stringify(await evaluator.call('previewPending', { intents: waiting.map(p => p.signed.intent) }), null, 2))); }
    catch (error) { estimated.append(element('p', `Preview unavailable: ${(error as Error).message}`, 'muted')); }
    queryArea.prepend(estimated);
  }
  const own = new Set(pending.map(p => p.cid));
  for (const outcome of snapshot.projection.outcomes.filter((o: any) => !own.has(o.intent))) {
    const row = element('div', undefined, 'activity'); row.append(element('strong', `Entry ${outcome.position} · ${outcome.outcome.$type.endsWith('#effective') ? 'Applied' : 'Not applied'}`), inspect('Recorded effect', outcome)); activity.append(row);
  }
  if (!pending.length && !snapshot.projection.outcomes.length) activity.append(element('p', 'No actions yet. Reading this app creates no signature or commitment.', 'muted'));
  content.replaceChildren(title, controls, workspace, queryArea, activity, inspect('Verified state and frontier', snapshot.projection), inspect('Inspect definition', definition));
  try { const binding = definition.manifest.views[0]; if (binding) view.replaceChildren(...(await evaluator.call('view', { name: binding.name })).map((node: ViewNode) => primitive(node, formArea))); }
  catch (error) { view.replaceChildren(element('p', `View unavailable: ${(error as Error).message}`, 'muted')); }
}
window.addEventListener('hashchange', () => {
  const target = new URLSearchParams(location.hash.slice(1));
  if (target.get('app') && target.get('genesis')) void openApp({ app: target.get('app')!, genesis: target.get('genesis')! }).catch(failure);
});
window.addEventListener('online', () => { void flush().catch(failure); });
drawIdentity(); await applications();
const previewCid = new URLSearchParams(location.search).get('preview'), invitation = new URLSearchParams(location.hash.slice(1));
try {
  if (previewCid) { const retained = await api.call('readDraft', { definition: previewCid }); await importDraft(fromBytes(retained.source)); }
  else if (invitation.get('app') && invitation.get('genesis')) await openApp({ app: invitation.get('app')!, genesis: invitation.get('genesis')! });
  else { const empty = element('div', undefined, 'empty'); empty.append(element('h1', 'An app for the purpose at hand.'), element('p', 'Open a definition from your agent to try it locally, or return to an application in the sidebar.'), element('p', 'Your application brings its own schemas, actions and views. This host supplies the log and the interpreter.', 'muted')); content.replaceChildren(empty); }
} catch (error) { failure(error); }
