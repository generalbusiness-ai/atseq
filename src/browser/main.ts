import { retainVerified } from './verified.ts';
import type { Operations } from './protocol.ts';
import { PROFILE } from '../core/profile.ts';
import { installHostAccess, hostMessage } from './host-access.ts';
import { NSID } from '../core/nsids.ts';
import { drawDraft as renderDraft, retainDraft } from './drafts.ts';
import { archivePanel, queryExport } from './exports.ts';
import './style.css';
import { ARCHIVE_LIMIT } from '../archive/limits.ts';
import { changePanel, type ChangeDraft } from './changes.ts';
import { fromBytes } from '@atcute/cbor';
import { AtseqClient } from '../client/api.ts';
import { DeviceStore, type Draft } from '../client/store.ts';
import type { Invitation } from '../protocol/log.ts';
import { createDeviceIdentity, prepareDeviceIntent, deviceIdentity, type DeviceIdentity } from './identity.ts';
import { Outbox, type Pending } from './outbox.ts';
import { SessionGeneration, sameSession, type AppSession } from './session.ts';
import type { AppSnapshot, Preview } from './protocol.ts';
import type { RetainedInput } from '../archive/archive.ts';
import { bytes } from '../protocol/wire.ts';
import type { Json } from '../core/values.ts';
import { resolveSchema, type DefinitionInfo } from '../client/definition.ts';
import type { ViewNode } from '../view/inlay.ts';
import { Evaluator } from './evaluator.ts';
import { element, button, actionForm, schemaForm } from './forms.ts';

interface AppInvitation extends Invitation {
  title: string;
}
let changeDraft: ChangeDraft | undefined,
  applying = false;
const accessFragment = new URLSearchParams(location.hash.slice(1)),
  access = accessFragment.get('host-token');
if (access) {
  sessionStorage.setItem('atseq.host-token', access);
  accessFragment.delete('host-token');
  history.replaceState(
    null,
    '',
    location.pathname + location.search + (accessFragment.size ? '#' + accessFragment : ''),
  );
}
const api = new AtseqClient(location.origin, access ?? sessionStorage.getItem('atseq.host-token') ?? undefined),
  store = await DeviceStore.open(),
  evaluator = new Evaluator((message) => tell(message)),
  sessions = new SessionGeneration(),
  outbox = new Outbox(store, api);
installHostAccess(api);
const content = document.querySelector<HTMLDivElement>('#content')!,
  status = document.querySelector<HTMLParagraphElement>('#status')!;
const identityDialog = document.querySelector<HTMLDialogElement>('#identity-dialog')!;
let identity = await deviceIdentity(store),
  current: Invitation | undefined,
  snapshot: AppSnapshot | undefined,
  definition: DefinitionInfo | undefined;
let draft: Draft | undefined,
  preview: Preview | undefined,
  refreshing = false,
  refreshAgain = false;
let editorArea: HTMLElement | undefined,
  localWorkGeneration = 0,
  drawVersion = 0;
function activeSession(): AppSession | undefined {
  return current && definition ? { ...current, definition: definition.cid } : undefined;
}
function stillCurrent(generation: number, binding?: AppSession) {
  return sessions.current(generation) && (!binding || sameSession(binding, activeSession()));
}
let afterIdentity: (() => void) | undefined;
function tell(message: string) {
  status.textContent = message;
}
function failure(error: unknown) {
  tell(hostMessage(error));
}
function inspect(label: string, value: unknown) {
  const details = element('details'),
    pre = element('pre', JSON.stringify(value, null, 2));
  details.append(element('summary', label), pre);
  return details;
}
function showIdentity(next?: () => void) {
  afterIdentity = next;
  identityDialog.showModal();
  identityDialog.querySelector('input')!.focus();
}
function drawIdentity() {
  const root = document.querySelector('#identity')!;
  root.replaceChildren(
    identity
      ? element('span', `${identity.name} · this device`, 'muted')
      : button('Create identity', () => showIdentity()),
  );
}
document.querySelector('#identity-cancel')!.addEventListener('click', () => identityDialog.close());
document.querySelector<HTMLFormElement>('#identity-form')!.onsubmit = async (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement,
    submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  if (submit.disabled) return;
  submit.disabled = true;
  try {
    const made = await createDeviceIdentity(String(new FormData(form).get('name')));
    identity = await store.update<DeviceIdentity>('identity', (existing) => existing ?? made);
    drawIdentity();
    identityDialog.close();
    afterIdentity?.();
    afterIdentity = undefined;
  } catch (error) {
    document.querySelector('#identity-error')!.textContent = (error as Error).message;
  } finally {
    submit.disabled = false;
  }
};
async function applications() {
  let apps = (await store.get<AppInvitation[]>('apps')) ?? [];
  try {
    const incoming: AppInvitation[] = (await api.call('list')).apps;
    apps = await store.update<AppInvitation[]>('apps', (previous) => {
      const known = new Map((previous ?? []).map((app) => [app.app, app]));
      for (const app of incoming)
        if (!known.has(app.app) || known.get(app.app)!.genesis === app.genesis) known.set(app.app, app);
      return [...known.values()];
    });
  } catch {
    /* Last seen invitations remain usable offline. */
  }
  const nav = document.querySelector('#applications')!;
  nav.replaceChildren(
    ...apps.map((app) => button(app.title, () => openApp({ app: app.app, genesis: app.genesis }).catch(failure))),
  );
}
async function knownInvitations(): Promise<Invitation[]> {
  return store.list<Invitation>('pin:');
}
async function pinInvitation(invitation: Invitation) {
  if ((await knownInvitations()).some((pin) => pin.app === invitation.app && pin.genesis !== invitation.genesis))
    throw new Error('Application differs from the pinned invitation');
  await store.update<Invitation>(`pin:${invitation.app}`, (previous) => {
    if (previous && previous.genesis !== invitation.genesis)
      throw new Error('Application differs from the pinned invitation');
    return previous ?? invitation;
  });
}
async function importDraft(raw: Uint8Array) {
  const generation = sessions.begin();
  evaluator.select();
  current = undefined;
  const retained = await retainDraft(store, evaluator, raw);
  if (!stillCurrent(generation)) return;
  const checked = retained.checked;
  draft = retained.draft;
  if (draft.published) {
    await openApp(draft.published);
    return;
  }
  current = undefined;
  preview = checked;
  definition = checked.definition;
  drawDraft();
  tell('Draft · saved on this device. Nothing has been published.');
}
document.querySelector<HTMLInputElement>('#import')!.onchange = async (event) => {
  const input = event.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > PROFILE.definitionBytes) throw new Error('Definition CAR exceeds 512 KiB');
    await importDraft(new Uint8Array(await file.arrayBuffer()));
  } catch (error) {
    failure(error);
  } finally {
    input.value = '';
  }
};
function drawDraft() {
  if (!draft || !preview) return;
  const generation = sessions.capture();
  renderDraft({
    draft,
    preview,
    content,
    evaluator,
    store,
    api,
    identity: () => identity,
    visible: () => stillCurrent(generation),
    setDraft: (value) => {
      draft = value;
    },
    setPreview: (value) => {
      preview = value;
    },
    redraw: drawDraft,
    tell,
    inspect,
    showIdentity,
    applications,
    openApp,
  });
}
async function openApp(invitation: Invitation) {
  const generation = sessions.begin();
  evaluator.select();
  current = { ...invitation };
  draft = undefined;
  editorArea = undefined;
  snapshot = undefined;
  definition = undefined;
  content.replaceChildren(element('p', 'Verifying this invitation…'));
  history.replaceState(null, '', `/#${new URLSearchParams({ ...invitation })}`);
  changeDraft = await store.get<ChangeDraft>(`change:${invitation.app}`);
  if (!stillCurrent(generation)) return;
  const retained = await store.get<RetainedInput>(`verified:${invitation.app}:${invitation.genesis}`);
  if (!stillCurrent(generation)) return;
  if (retained)
    try {
      const checked = await evaluator.restore(
        { ...invitation, definition: retained.genesis.definition.$link },
        retained,
      );
      if (!stillCurrent(generation)) return;
      await pinInvitation(invitation);
      if (!stillCurrent(generation)) return;
      snapshot = checked;
      definition = checked.definition;
      await drawApp();
      if (stillCurrent(generation)) tell('Saved state on this device. Checking for newer entries…');
    } catch (error) {
      if (!stillCurrent(generation)) return;
      content.replaceChildren(
        element('h1', 'Saved state unavailable'),
        element('p', 'Saved history is retained. Retry to rebuild it before checking the host.'),
        button('Retry', () => refresh()),
      );
      failure(error);
      return;
    }
  if (stillCurrent(generation)) await refresh();
}
async function refresh() {
  if (!current) return;
  if (refreshing) {
    refreshAgain = true;
    return;
  }
  refreshing = true;
  document.querySelectorAll<HTMLButtonElement>('button[data-refresh]').forEach((button) => {
    button.disabled = true;
  });
  const invitation = { ...current },
    generation = sessions.capture(),
    workGeneration = localWorkGeneration;
  try {
    tell('Checking retained history and interpreting updates…');
    const input: RetainedInput = await api.call('sync', invitation);
    if (!stillCurrent(generation) || workGeneration !== localWorkGeneration) return;
    const checked = await evaluator.call(
      'sync',
      { session: activeSession() ?? { ...invitation, definition: input.genesis.definition.$link }, input },
      120_000,
    );
    if (!stillCurrent(generation)) return;
    await pinInvitation(invitation);
    if (!stillCurrent(generation)) return;
    // Only worker-verified inputs become the device's canonical cache.
    await retainVerified(store, input);
    if (!stillCurrent(generation)) return;
    snapshot = checked;
    definition = checked.definition;
    await outbox.reconcile(checked);
    if (!stillCurrent(generation)) return;
    await drawApp();
    if (!stillCurrent(generation)) return;
    tell(
      checked.stalled
        ? `Saved through ${checked.head.position}; interpretation paused at ${checked.stalled.position}: ${checked.stalled.code}`
        : `Verified through entry ${checked.projection.frontier.position}.`,
    );
  } catch (error) {
    if (!stillCurrent(generation)) return;
    if (snapshot) {
      await drawApp();
      if (!stillCurrent(generation)) return;
      tell(
        `${navigator.onLine ? `Latest data unavailable: ${hostMessage(error)}.` : 'Offline.'} Showing saved state through entry ${snapshot.projection.frontier.position}. Pending actions stay on this device.`,
      );
    } else {
      content.replaceChildren(
        element('h1', 'App unavailable'),
        element(
          'p',
          'No verified state is saved on this device. The invitation is retained; retry when its source is available.',
        ),
        button('Retry', () => refresh()),
      );
      failure(error);
    }
  } finally {
    refreshing = false;
    document.querySelectorAll<HTMLButtonElement>('button[data-refresh]').forEach((button) => {
      button.disabled = false;
    });
    if (current && (refreshAgain || !stillCurrent(generation))) {
      refreshAgain = false;
      await refresh();
    }
  }
}
async function flush() {
  await outbox.flush();
  await refresh();
}
function primitive(node: ViewNode, area: HTMLElement): Node {
  if (typeof node === 'string') return document.createTextNode(node);
  if (node.type === NSID.uiAction) {
    if (
      typeof node.props.action !== 'string' ||
      typeof node.props.label !== 'string' ||
      !definition?.manifest.actions.some((a) => a.ref === node.props.action)
    )
      throw new Error('View names an unavailable action');
    const action = button(node.props.label, () => openAction(node.props.action as string, area));
    action.disabled = Boolean(snapshot?.stalled);
    return action;
  }
  if (!([NSID.uiPanel, NSID.uiText] as readonly string[]).includes(node.type))
    throw new Error('Unknown view primitive');
  const target = element(node.type === NSID.uiText ? 'p' : 'div');
  target.append(...node.children.map((child) => primitive(child, area)));
  return target;
}
function openAction(ref: string, area: HTMLElement, initial?: Record<string, Json>) {
  if (snapshot?.stalled) {
    tell('Interpretation is paused. Your queued work is retained; refresh when its source is available.');
    return;
  }
  if (!identity) {
    showIdentity(() => openAction(ref, area, initial));
    return;
  }
  const pinned = { ...current! },
    pinnedDefinition = definition!.cid,
    binding = activeSession()!,
    generation = sessions.capture();
  const form = actionForm(
    definition!,
    ref,
    'Save action',
    async (payload) => {
      if (snapshot?.stalled) throw new Error('Interpretation is paused. Retained work is unchanged.');
      if (!stillCurrent(generation, binding)) throw new Error('App changed. Review this action with the current form.');
      await evaluator.call('validateAction', { session: binding, action: ref, payload });
      if (!stillCurrent(generation, binding)) throw new Error('App changed while validating. Review the current form.');
      const prepared = await prepareDeviceIntent(identity!, pinned, pinnedDefinition, ref, payload);
      await store.enqueue<Pending>(pinned.app, prepared.cid, { ...prepared, ...pinned, status: 'queued' });
      if (!stillCurrent(generation, binding)) {
        void flush().catch(failure);
        return;
      }
      tell('Queued on this device. Waiting for a verified receipt.');
      area.replaceChildren();
      await drawApp();
      await flush();
    },
    initial,
  );
  area.replaceChildren(element('h3', ref.split('#').at(-1)), form);
  (form.querySelector('input,textarea,select') as HTMLElement | null)?.focus();
}
async function drawApp() {
  if (!current || !definition || !snapshot) return;
  const binding = activeSession()!,
    generation = sessions.capture(),
    version = ++drawVersion;
  const visible = () => stillCurrent(generation, binding) && version === drawVersion;
  const title = element('div');
  title.append(
    element('h1', definition.manifest.title),
    element(
      'p',
      `Saved through ${snapshot.head.position} · interpreted through ${snapshot.projection.frontier.position}`,
      'muted',
    ),
  );
  const controls = element('div', undefined, 'row controls');
  const refreshButton = button('Refresh', () => refresh());
  refreshButton.dataset.refresh = '';
  refreshButton.disabled = refreshing;
  controls.append(
    refreshButton,
    button('Retry pending actions', () => flush()),
    button('Forget this invitation', async () => {
      if (!visible()) return;
      await store.delete(`pin:${binding.app}`);
      await store.delete(`verified:${binding.app}:${binding.genesis}`);
      await store.update<Invitation[]>('apps', (previous) => (previous ?? []).filter((app) => app.app !== binding.app));
      if (!visible()) return;
      sessions.begin();
      evaluator.select();
      current = undefined;
      snapshot = undefined;
      definition = undefined;
      history.replaceState(null, '', '/');
      content.replaceChildren(element('p', 'Invitation forgotten. Signed work remains on this device.'));
      await applications();
    }),
  );
  const workspace = element('section', undefined, 'card'),
    formArea = (editorArea ??= element('div')),
    view = element('div', undefined, 'view');
  workspace.append(view, formArea);
  const actions = element('div', undefined, 'row');
  for (const action of definition.manifest.actions) {
    const control = button(action.ref.split('#').at(-1)!, () => openAction(action.ref, formArea));
    control.disabled = Boolean(snapshot.stalled);
    actions.append(control);
  }
  workspace.prepend(element('h2', 'Participate'), actions);
  const queryArea = element('section', undefined, 'card');
  queryArea.append(element('h2', 'Queries'));
  for (const query of definition.manifest.queries) {
    const result = element('div'),
      schema = resolveSchema(definition, query.ref);
    queryArea.append(
      element('h3', query.name),
      schemaForm(definition, schema.parameters ?? { properties: {} }, 'Run query', async (params) => {
        if (!visible()) throw new Error('App changed. Open its current query form.');
        const pinned = { app: binding.app, genesis: binding.genesis },
          cid = binding.definition;
        const response = await evaluator.call('query', { session: binding, name: query.name, params });
        if (!visible()) return;
        result.replaceChildren(
          element('p', `Interpreted through entry ${response.frontier.position}`, 'muted'),
          element('pre', JSON.stringify(response.result, null, 2)),
        );
        if (response.result.$type === NSID.defsQueryAvailable)
          result.append(
            queryExport(
              response.result.value,
              {
                ...pinned,
                definition: cid,
                position: response.frontier.position,
                entry: response.frontier.entry.$link,
                query: query.name,
                params,
              },
              visible,
              failure,
            ),
          );
      }),
      result,
    );
  }
  const activity = element('section', undefined, 'card');
  activity.append(element('h2', 'Activity'));
  const pending = (await store.list<Pending>(`outbox:${binding.app}:`)).filter((p) => p.genesis === binding.genesis);
  if (!visible()) return;
  const labels = {
    queued: 'Queued on device',
    recorded: 'Saved, awaiting interpretation',
    applied: 'Applied',
    'not-applied': 'Not applied',
    refused: 'Transport refused · retained on device',
  };
  for (const item of pending) {
    const row = element('div', undefined, 'activity');
    row.append(element('strong', labels[item.status]), element('p', item.signed.intent.action));
    if (item.status === 'refused')
      row.append(
        button('Resend original signed action', async () => {
          if (!visible()) return;
          await outbox.resend(item);
          if (visible()) await refresh();
        }),
      );
    if (item.outcome && 'reason' in item.outcome) row.append(element('p', item.outcome.reason));
    if (item.error) row.append(element('p', item.error, 'error'));
    if (item.outcome && 'reason' in item.outcome && item.outcome.reason === 'definition_changed') {
      row.append(
        element(
          'p',
          'This queued action used the previous app definition. Its original entry is kept. Review a replacement before saving again.',
          'muted',
        ),
      );
      if (item.source) row.append(button('Review update again', () => compareChange(item.source!).catch(failure)));
      else if (definition.manifest.actions.some((action) => action.ref === item.signed.intent.action))
        row.append(
          button('Review with updated form', () =>
            openAction(item.signed.intent.action, formArea, item.signed.intent.payload),
          ),
        );
    }
    row.append(
      inspect('Intent, receipt and effect', {
        intent: item.signed.intent,
        receipt: item.receipt ?? null,
        outcome: item.outcome ?? null,
      }),
    );
    activity.append(row);
  }
  const waiting = pending.filter((p) => ['queued', 'recorded'].includes(p.status));
  if (waiting.length) {
    const estimated = element('section', undefined, 'card');
    estimated.append(
      element('h2', 'Pending preview'),
      element(
        'p',
        'Estimated from this device’s queue. Other participants can change the result before these actions are recorded.',
        'muted',
      ),
    );
    try {
      estimated.append(
        element(
          'pre',
          JSON.stringify(
            await evaluator.call('previewPending', { session: binding, intents: waiting.map((p) => p.signed.intent) }),
            null,
            2,
          ),
        ),
      );
    } catch (error) {
      estimated.append(element('p', `Preview unavailable: ${(error as Error).message}`, 'muted'));
    }
    queryArea.prepend(estimated);
  }
  if (!visible()) return;
  const own = new Set(pending.map((p) => p.cid));
  for (const outcome of snapshot.projection.outcomes.filter((o) => !own.has(o.intent))) {
    const row = element('div', undefined, 'activity');
    row.append(
      element(
        'strong',
        `Entry ${outcome.position} · ${outcome.outcome.$type.endsWith('#effective') ? 'Applied' : 'Not applied'}`,
      ),
      inspect('Recorded effect', outcome),
    );
    activity.append(row);
  }
  if (!pending.length && !snapshot.projection.outcomes.length)
    activity.append(element('p', 'No actions yet. Reading this app creates no signature or commitment.', 'muted'));
  content.replaceChildren(
    title,
    controls,
    workspace,
    queryArea,
    activity,
    changePanel({
      changeDraft,
      current,
      definition,
      snapshot,
      api,
      store,
      identity: () => identity,
      applying: () => applying,
      setApplying: (value) => {
        applying = value;
      },
      clearDraft: () => {
        changeDraft = undefined;
      },
      visible,
      tell,
      failure,
      inspect,
      compareChange,
      drawApp,
      flush,
    }),
    archivePanel(snapshot, binding, evaluator, visible, tell, failure),
    inspect('Verified state and frontier', snapshot.projection),
    inspect('Inspect definition', definition),
  );
  try {
    const selectedView = definition.manifest.views[0];
    if (selectedView) {
      const tree = await evaluator.call('view', { session: binding, name: selectedView.name });
      if (!visible()) return;
      view.replaceChildren(...tree.map((node) => primitive(node, formArea)));
    }
  } catch (error) {
    if (!visible()) return;
    view.replaceChildren(element('p', `View unavailable: ${(error as Error).message}`, 'muted'));
  }
}
async function compareChange(source: number[]) {
  if (!current || !definition) throw new Error('Open an app first');
  const target = { ...current },
    expected = definition.cid,
    binding = activeSession()!,
    generation = sessions.capture();
  tell('Checking the candidate and replaying the existing prefix…');
  const comparison = await evaluator.call('compareDefinition', { session: binding, source, expected }, 120_000);
  const proposed = { source, expected, comparison };
  await store.set(`change:${target.app}`, proposed);
  if (stillCurrent(generation, binding)) {
    changeDraft = proposed;
    await drawApp();
    if (!stillCurrent(generation, binding)) return;
    tell('Candidate checked. Existing data is preserved. Apply explicitly to retain and activate it.');
  }
}
window.addEventListener('hashchange', () => {
  const target = new URLSearchParams(location.hash.slice(1));
  if (target.get('app') && target.get('genesis'))
    void openApp({ app: target.get('app')!, genesis: target.get('genesis')! }).catch(failure);
});
window.addEventListener('online', () => {
  void flush().catch(failure);
});
document.querySelector('#cancel-work')!.addEventListener('click', () => {
  localWorkGeneration++;
  evaluator.cancel('Local work cancelled. Retained history and pending actions are unchanged. Refresh to rebuild.');
  tell('Local work cancelled. Retained history and pending actions are unchanged. Refresh to rebuild.');
});

drawIdentity();
const startupHasWork = (await store.list<Pending>('outbox:')).some((pending) => pending.status === 'queued'),
  startupFlush = outbox.flush();
await applications();
const previewCid = new URLSearchParams(location.search).get('preview'),
  invitation = new URLSearchParams(location.hash.slice(1));
try {
  if (previewCid) {
    const retained = await api.call('readDraft', { definition: previewCid });
    await importDraft(fromBytes(retained.source));
  } else if (invitation.get('app') && invitation.get('genesis'))
    await openApp({ app: invitation.get('app')!, genesis: invitation.get('genesis')! });
  else {
    const empty = element('div', undefined, 'empty');
    empty.append(
      element('h1', 'An app for the purpose at hand.'),
      element('p', 'Open a definition from your agent to try it locally, or return to an application in the sidebar.'),
      element(
        'p',
        'Your application brings its own schemas, actions and views. This host supplies the log and the interpreter.',
        'muted',
      ),
    );
    content.replaceChildren(empty);
  }
} catch (error) {
  failure(error);
}
void startupFlush
  .then(() => {
    if (startupHasWork) return refresh();
  })
  .catch(failure);

document.querySelector<HTMLInputElement>('#import-archive')!.onchange = async (event) => {
  const input = event.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  const generation = sessions.capture();
  try {
    if (file.size > ARCHIVE_LIMIT) throw new Error('Archive exceeds 48 MiB');
    tell('Verifying the archive and replaying its retained history…');
    const archiveEvaluator = new Evaluator();
    let checked: Operations['importArchive']['result'];
    try {
      checked = await archiveEvaluator.call(
        'importArchive',
        { source: new Uint8Array(await file.arrayBuffer()), expected: await knownInvitations() },
        120_000,
      );
      const pinned = { app: checked.input.genesis.app, genesis: checked.input.genesisCid };
      const saved = await store.get<RetainedInput>(`verified:${pinned.app}:${pinned.genesis}`);
      if (saved) {
        archiveEvaluator.select();
        const floor = await archiveEvaluator.restore({ ...pinned, definition: saved.genesis.definition.$link }, saved);
        await archiveEvaluator.call('sync', { session: floor.session, input: checked.input }, 120_000);
      }
    } finally {
      archiveEvaluator.dispose();
    }
    if (!stillCurrent(generation)) return;
    const invitation = { app: checked.input.genesis.app, genesis: checked.input.genesisCid };
    await pinInvitation(invitation);
    await retainVerified(store, checked.input);
    await store.update<AppInvitation[]>('apps', (previous) => [
      ...(previous ?? []).filter((app) => app.app !== invitation.app),
      { ...invitation, title: 'Imported application' },
    ]);
    if (!stillCurrent(generation)) return;
    await openApp(invitation);
    await applications();
  } catch (error) {
    failure(error);
  } finally {
    input.value = '';
  }
};
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker
    .register('/sw.js')
    .then(() => navigator.serviceWorker.ready)
    .then(() => {
      document.querySelector('#offline-ready')!.textContent = 'Shell saved for offline use';
    })
    .catch(() => {
      document.querySelector('#offline-ready')!.textContent = 'Offline shell is not saved';
    });
}
