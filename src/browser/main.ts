import { chartExport, type ChartSource } from '../archive/chart.ts';
import './style.css';
import { ARCHIVE_LIMIT } from '../archive/limits.ts';
import { ACTIVATE } from '../definition/control.ts';
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
  receipt?: any; outcome?: any; error?: string; source?: number[];
}
interface ChangeDraft { source: number[]; expected: string; comparison: any }
let changeDraft: ChangeDraft | undefined, applying = false;
const api = new AtseqClient(location.origin), store = await DeviceStore.open(), evaluator = new Evaluator();
const content = document.querySelector<HTMLDivElement>('#content')!, status = document.querySelector<HTMLParagraphElement>('#status')!;
const identityDialog = document.querySelector<HTMLDialogElement>('#identity-dialog')!;
let identity = await store.get<Identity>('identity'), current: Invitation | undefined, snapshot: any, definition: DefinitionInfo | undefined;
let draft: Draft | undefined, preview: any, flushing = false, refreshing = false, refreshAgain = false;
let editorArea: HTMLElement | undefined, localWorkGeneration = 0;
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
    } catch (error) { tell(`Draft retained. ${error instanceof ApiError && error.status >= 400 && error.status < 500 ? `Starting was refused: ${error.message}` : navigator.onLine ? 'Starting could not be confirmed; retry this same draft.' : 'Offline — start when this device reconnects.'}`); }
    finally { start.disabled = false; }
  }, 'primary');
  publication.append(start); content.replaceChildren(heading, card, publication, inspect('Inspect definition', definition), button('Cancel local preview work', () => { evaluator.cancel(); tell('Preview cancelled. Source remains saved on this device.'); }));
}
async function openApp(invitation: Invitation) {
  current = invitation; draft = undefined; editorArea = undefined; snapshot = undefined; definition = undefined; history.replaceState(null, '', `/#${new URLSearchParams({ ...invitation })}`);
  changeDraft = await store.get<ChangeDraft>(`change:${invitation.app}`);
  const retained = await store.get<any>(`verified:${invitation.app}:${invitation.genesis}`);
  if (retained) try {
    snapshot = await evaluator.call('sync', { invitation, input: retained }, 120_000); definition = snapshot.definition;
    await drawApp(); tell('Saved state on this device. Checking for newer entries…');
  } catch { tell('Saved inputs failed verification. Fetching a verified prefix…'); }
  await refresh();
}
async function refresh() {
  if (!current) return;
  if (refreshing) { refreshAgain = true; return; }
  refreshing = true;
  document.querySelectorAll<HTMLButtonElement>('button[data-refresh]').forEach(button => { button.disabled = true; });
  const invitation = { ...current }, generation = localWorkGeneration;
  try {
    tell('Checking retained history and interpreting updates…');
    const input = await api.call('sync', invitation);
    if (generation !== localWorkGeneration) return;
    const checked = await evaluator.call('sync', { invitation, input }, 120_000);
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
    await store.update<Pending>(`outbox:${pending.app}:${pending.cid}`, previous => ({ ...(previous ?? pending), status: observed.outcome.$type === 'test.atseq.defs#effective' ? 'applied' : 'not-applied', outcome: observed.outcome, receipt: { position: observed.position, entry: observed.entry, intent: observed.intent }, error: undefined }));
  }
}
async function flush() {
  if (flushing) return; flushing = true;
  try {
    for (const pending of await store.list<Pending>('outbox:')) {
      if (pending.status !== 'queued') continue;
      try {
        const recorded = await api.call('submit', { block: bytes(new Uint8Array(pending.block)) });
        await store.update<Pending>(`outbox:${pending.app}:${pending.cid}`, previous => previous && ['applied', 'not-applied'].includes(previous.status) ? previous : { ...(previous ?? pending), status: 'recorded', receipt: recorded.receipt, error: undefined });
      } catch (error) {
        const refused = error instanceof ApiError && error.status >= 400 && error.status < 500;
        await store.update<Pending>(`outbox:${pending.app}:${pending.cid}`, previous => previous && ['recorded', 'applied', 'not-applied'].includes(previous.status) ? previous : { ...(previous ?? pending), status: refused ? 'refused' : pending.status, error: refused ? error.message : 'Reply uncertain. The original signed action is retained for retry.' });
      }
    }
    await refresh();
  } finally { flushing = false; }
}
function primitive(node: ViewNode, area: HTMLElement): Node {
  if (typeof node === 'string') return document.createTextNode(node);
  if (node.type === 'test.atseq.ui.Action') {
    if (typeof node.props.action !== 'string' || typeof node.props.label !== 'string' || !definition?.manifest.actions.some(a => a.ref === node.props.action)) throw new Error('View names an unavailable action');
    const action = button(node.props.label, () => openAction(node.props.action as string, area)); action.disabled = Boolean(snapshot?.stalled); return action;
  }
  if (!['test.atseq.ui.Panel', 'test.atseq.ui.Text'].includes(node.type)) throw new Error('Unknown view primitive');
  const target = element(node.type === 'test.atseq.ui.Text' ? 'p' : 'div'); target.append(...node.children.map(child => primitive(child, area))); return target;
}
function openAction(ref: string, area: HTMLElement, initial?: Record<string, Json>) {
  if (snapshot?.stalled) { tell('Interpretation is paused. Your queued work is retained; refresh when its source is available.'); return; }
  if (!identity) { showIdentity(() => openAction(ref, area, initial)); return; }
  const pinned = { ...current! }, pinnedDefinition = definition!.cid;
  const form = actionForm(definition!, ref, 'Save action', async payload => {
    if (snapshot?.stalled) throw new Error('Interpretation is paused. Retained work is unchanged.');
    if (current?.app !== pinned.app || definition?.cid !== pinnedDefinition) throw new Error('App changed. Review this action with the current form.');
    await evaluator.call('validateAction', { action: ref, payload });
    if (current?.app !== pinned.app || definition?.cid !== pinnedDefinition) throw new Error('App changed while validating. Review the current form.');
    const prepared = await prepareIntent(identity!, pinned, pinnedDefinition, ref, payload);
    await store.enqueue<Pending>(pinned.app, prepared.cid, { ...prepared, ...pinned, status: 'queued' });
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
  for (const action of definition.manifest.actions) { const control = button(action.ref.split('#').at(-1)!, () => openAction(action.ref, formArea)); control.disabled = Boolean(snapshot.stalled); actions.append(control); }
  workspace.prepend(element('h2', 'Participate'), actions);
  const queryArea = element('section', undefined, 'card'); queryArea.append(element('h2', 'Queries'));
  for (const query of definition.manifest.queries) {
    const result = element('div'), schema = resolveSchema(definition, query.ref);
    queryArea.append(element('h3', query.name), schemaForm(definition, schema.parameters ?? { properties: {} }, 'Run query', async params => {
      const pinned = { ...current! }, cid = definition!.cid;
      const response = await evaluator.call('query', { name: query.name, params }); result.replaceChildren(element('p', `Interpreted through entry ${response.frontier.position}`, 'muted'), element('pre', JSON.stringify(response.result, null, 2)));
      if (response.result.$type === 'test.atseq.defs#queryAvailable') result.append(queryExport(response.result.value, { ...pinned, definition: cid, position: response.frontier.position, entry: response.frontier.entry.$link, query: query.name, params }));
    }), result);
  }
  const activity = element('section', undefined, 'card'); activity.append(element('h2', 'Activity'));
  const pending = await store.list<Pending>(`outbox:${current.app}:`);
  const labels = { queued: 'Queued on device', recorded: 'Saved, awaiting interpretation', applied: 'Applied', 'not-applied': 'Not applied', refused: 'Transport refused · retained on device' };
  for (const item of pending) {
    const row = element('div', undefined, 'activity'); row.append(element('strong', labels[item.status]), element('p', item.signed.intent.action));
    if (item.outcome?.reason) row.append(element('p', item.outcome.reason)); if (item.error) row.append(element('p', item.error, 'error'));
    if (item.outcome?.reason === 'definition_changed') {
      row.append(element('p', 'This queued action used the previous app definition. Its original entry is kept. Review a replacement before saving again.', 'muted'));
      if (item.source) row.append(button('Review update again', () => compareChange(item.source!).catch(failure)));
      else if (definition.manifest.actions.some(action => action.ref === item.signed.intent.action)) row.append(button('Review with updated form', () => openAction(item.signed.intent.action, formArea, item.signed.intent.payload)));
    }
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
  content.replaceChildren(title, controls, workspace, queryArea, activity, changePanel(), archivePanel(), inspect('Verified state and frontier', snapshot.projection), inspect('Inspect definition', definition));
  try { const binding = definition.manifest.views[0]; if (binding) view.replaceChildren(...(await evaluator.call('view', { name: binding.name })).map((node: ViewNode) => primitive(node, formArea))); }
  catch (error) { view.replaceChildren(element('p', `View unavailable: ${(error as Error).message}`, 'muted')); }
}
async function compareChange(source: number[]) {
  if (!current || !definition) throw new Error('Open an app first');
  const target = { ...current }, expected = definition.cid;
  tell('Checking the candidate and replaying the existing prefix…');
  const comparison = await evaluator.call('compareDefinition', { source, expected }, 120_000);
  const proposed = { source, expected, comparison };
  await store.set(`change:${target.app}`, proposed);
  if (current.app === target.app) { changeDraft = proposed; await drawApp(); tell('Candidate checked. Existing data is preserved. Apply explicitly to retain and activate it.'); }
}
function changePanel(): HTMLElement {
  const panel = element('section', undefined, 'card'); panel.append(element('h2', 'Change this app'));
  const label = element('label', 'Import updated definition CAR'), file = element('input'); file.type = 'file'; file.accept = '.car'; file.setAttribute('aria-label', 'Import updated definition CAR');
  file.onchange = async () => { const source = file.files?.[0]; if (!source) return; try { if (source.size > 512 * 1024) throw new Error('Definition exceeds 512 KiB'); await compareChange([...new Uint8Array(await source.arrayBuffer())]); } catch (error) { failure(error); } };
  label.append(file); panel.append(label);
  if (!changeDraft || !current || !definition) { panel.append(element('p', 'Preview an update that keeps the current data schema and runtime. A grant from genesis is required to apply it.', 'muted')); return panel; }
  const proposed = changeDraft, target = { ...current }, comparison = proposed.comparison;
  panel.append(element('p', `${comparison.current.manifest.title} → ${comparison.candidate.manifest.title}`), element('p', 'State schema matches · existing prefix replays · current data is preserved', 'tag'));
  const additions = (key: 'actions' | 'queries' | 'views', identity: 'ref' | 'name') => comparison.candidate.manifest[key].filter((next: any) => !comparison.current.manifest[key].some((old: any) => old[identity] === next[identity])).map((value: any) => value[identity]);
  panel.append(inspect('Inspect changes', { newActions: additions('actions', 'ref'), newQueries: additions('queries', 'name'), newViews: additions('views', 'name'), expected: proposed.expected, candidate: comparison.candidate.cid }));
  const moved = proposed.expected !== definition.cid, authorized = identity && snapshot.genesis.activationKeys.includes(identity.publicKey);
  if (moved) panel.append(element('p', 'The app changed after this comparison. Refresh it before applying.', 'error'), button('Refresh comparison', () => compareChange(proposed.source).catch(failure)));
  if (!authorized) panel.append(element('p', 'This device does not hold an initial app-update grant. You can keep and inspect the proposal.', 'muted'));
  const apply = button('Apply change', async () => {
    if (!identity || !authorized || moved || apply.disabled || applying) return; applying = true; apply.disabled = true;
    try {
      const staged = await api.call('stageDefinition', { ...target, expected: proposed.expected, source: bytes(new Uint8Array(proposed.source)) });
      if (staged.candidate.cid !== comparison.candidate.cid || JSON.stringify(staged.closure) !== JSON.stringify(comparison.closure)) throw new Error('Retained candidate differs from the reviewed source');
      const payload = { expected: proposed.expected, definition: comparison.candidate.cid, closure: comparison.closure };
      const prepared = await prepareIntent(identity, target, proposed.expected, ACTIVATE, payload);
      await store.enqueue<Pending>(target.app, prepared.cid, { ...prepared, ...target, source: proposed.source, status: 'queued' });
      await store.set(`change:${target.app}`, undefined); if (current?.app === target.app) changeDraft = undefined;
      tell('Update queued on this device. Waiting for its recorded outcome.'); await drawApp(); await flush();
    } catch (error) { tell(`Proposal retained. ${(error as Error).message}`); }
    finally { applying = false; await drawApp(); }
  }, 'primary');
  apply.disabled = moved || !authorized || applying; panel.append(element('p', 'Apply retains this source on the test PDS and submits a signed activation. The new definition starts after that entry.', 'muted'), apply);
  return panel;
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

function download(name: string, data: Uint8Array, type: string) {
  const url = URL.createObjectURL(new Blob([new Uint8Array(data)], { type })), a = element('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function archivePanel() {
  const panel = element('section', undefined, 'card'); panel.append(element('h2', 'Keep a copy'), element('p', `App and verified history through entry ${snapshot.projection.frontier.position}. Includes definitions and data. Replay needs this installed runtime; signing keys are excluded.`, 'muted'));
  panel.append(button('Download app and verified history', async () => {
    tell('Verifying source and replaying the chosen prefix for export…');
    try { const result = await evaluator.call('exportArchive', {}, 120_000); download('application.atseq.json', result.bytes, 'application/json'); tell(`Exported verified history through entry ${result.head.position}. The app remains open.`); }
    catch (error) { failure(error); }
  }));
  return panel;
}
document.querySelector<HTMLInputElement>('#import-archive')!.onchange = async event => {
  const input = event.target as HTMLInputElement, file = input.files?.[0]; if (!file) return;
  try {
    if (file.size > ARCHIVE_LIMIT) throw new Error('Archive exceeds 48 MiB');
    tell('Verifying the archive and replaying its retained history…');
    const checked = await evaluator.call('importArchive', { source: new Uint8Array(await file.arrayBuffer()) }, 120_000);
    const invitation = { app: checked.input.genesis.app, genesis: checked.input.genesisCid };
    await store.set(`verified:${invitation.app}:${invitation.genesis}`, checked.input);
    await store.update<any[]>('apps', previous => [...(previous ?? []).filter(app => app.app !== invitation.app), { ...invitation, title: 'Imported application' }]);
    await openApp(invitation); await applications();
  } catch (error) { failure(error); } finally { input.value = ''; }
};
if ('serviceWorker' in navigator) { void navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready).then(() => { document.querySelector('#offline-ready')!.textContent = 'Shell saved for offline use'; }).catch(() => { document.querySelector('#offline-ready')!.textContent = 'Offline shell is not saved'; }); }

function queryExport(value: any, source: ChartSource) {
  const panel = element('div'), datasets = Object.entries(value ?? {}).filter(([, rows]) => Array.isArray(rows) && rows.length && rows.length <= 100 && rows.every(row => row && typeof row === 'object' && !Array.isArray(row)));
  for (const [name, data] of datasets) {
    const rows = data as Record<string, unknown>[], labels = Object.keys(rows[0]!).filter(key => rows.every(row => typeof row[key] === 'string')), values = Object.keys(rows[0]!).filter(key => rows.every(row => Number.isSafeInteger(row[key])));
    if (!labels.length || !values.length) continue;
    const card = element('section', undefined, 'card'), label = element('select'), metric = element('select'), result = element('div');
    label.setAttribute('aria-label', 'Chart labels'); metric.setAttribute('aria-label', 'Chart values');
    for (const key of labels) { const option = element('option', key); option.value = key; label.append(option); }
    for (const key of values) { const option = element('option', key); option.value = key; metric.append(option); }
    card.append(element('h3', `Chart or table: ${name}`), label, metric, button('Draw chart', () => {
      try {
        const exported = chartExport(rows, label.value, metric.value, source), picture = element('img'); picture.alt = `${metric.value} by ${label.value}; values are in the accompanying table`; picture.style.width = '100%'; picture.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(exported.svg);
        const table = element('table'), header = element('tr'); header.append(element('th', label.value), element('th', metric.value)); table.append(header);
        for (const row of rows) { const tr = element('tr'); tr.append(element('td', String(row[label.value])), element('td', String(row[metric.value]))); table.append(tr); }
        result.replaceChildren(picture, table, button('Download SVG', () => download('query.svg', new TextEncoder().encode(exported.svg), 'image/svg+xml')), button('Download table', () => download('query.html', new TextEncoder().encode(exported.html), 'text/html')));
      } catch(error) { failure(error); }
    }), result); panel.append(card);
  }
  return panel;
}

document.querySelector('#cancel-work')!.addEventListener('click', () => { localWorkGeneration++; evaluator.cancel('Local work cancelled. Retained history and pending actions are unchanged. Refresh to rebuild.'); tell('Local work cancelled. Retained history and pending actions are unchanged. Refresh to rebuild.'); });
