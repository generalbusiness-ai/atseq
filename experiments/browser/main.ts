import './style.css';
import { localView, totalsSchemas, totalFold, summaryQuery, baseInput } from '../fixtures.ts';
import { resolveView, type ViewNode } from '../../src/ui/inlay.ts';
import type { FixtureResult } from '../corpus.ts';

const started = performance.now();
let worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
let nextID = 0;
const pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
worker.onmessage = ({ data }) => {
  const request = pending.get(data.id); if (!request) return;
  clearTimeout(request.timer); pending.delete(data.id);
  if (data.error) request.reject(Object.assign(new Error(data.error.message), { code: data.error.code })); else request.resolve(data.result);
};
function call(kind: string, args: Record<string, unknown> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = ++nextID;
    const timer = setTimeout(() => {
      worker.terminate();
      for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error('Evaluation paused: worker watchdog expired. Sample state was preserved. Reload to retry.')); }
      pending.clear();
    }, 15_000);
    pending.set(id, { resolve, reject, timer }); worker.postMessage({ id, kind, ...args });
  });
}
const app = document.querySelector<HTMLDivElement>('#app')!;
const actionStatus = document.querySelector<HTMLParagraphElement>('#action-status')!;
const input = structuredClone(baseInput);
const probe = { ready: false, loadMs: 0, submissions: 0, fixtures: [] as FixtureResult[], run: async () => await call('corpus'), render: async (summary: string) => draw(summary) };
(window as any).atseqExperiment = probe;
document.querySelector('#definition')!.textContent = JSON.stringify({ schemas: totalsSchemas, fold: totalFold, query: summaryQuery, view: localView() }, null, 2);

function primitive(node: ViewNode): Node {
  if (typeof node === 'string') return document.createTextNode(node);
  if (node.type === 'test.atseq.ui.Action') {
    if (node.props.action !== 'add' || typeof node.props.label !== 'string') throw new Error('Unknown experiment action');
    const form = document.createElement('form');
    const label = document.createElement('label'); label.textContent = 'Amount';
    const field = document.createElement('input'); field.name = 'delta'; field.type = 'number'; field.min = '1'; field.max = '100'; field.step = '1'; field.required = true; field.value = '3'; label.append(field);
    const button = document.createElement('button'); button.type = 'submit'; button.textContent = node.props.label;
    form.append(label, button);
    form.onsubmit = async event => {
      event.preventDefault(); if (button.disabled) return;
      button.disabled = true; actionStatus.textContent = 'Checking sample action…';
      try {
        probe.submissions++;
        const result = await call('fold', { source: totalFold, schemas: totalsSchemas, stateSchema: 'test.atseq.totals', actionSchema: 'test.atseq.totals#add', input: { ...input, act: { delta: Number(field.value) } } });
        if (result.decision === 'effective') { input.state = result.state; await draw(); actionStatus.textContent = 'Applied to sample data. Nothing was published.'; }
        else actionStatus.textContent = `Not applied: ${result.reason}`;
      } catch (error) { actionStatus.textContent = (error as Error).message; }
      finally { button.disabled = false; }
    };
    return form;
  }
  const element = document.createElement(node.type === 'test.atseq.ui.Text' ? 'p' : 'div');
  if (node.type === 'test.atseq.ui.Text') element.className = 'view-text';
  element.append(...node.children.map(primitive)); return element;
}
async function draw(summary?: string) {
  const query = await call('query', { source: summaryQuery, input: { params: {}, state: input.state } });
  const tree = await resolveView(localView(), { summary: summary ?? query.value.summary });
  app.replaceChildren(...tree.map(primitive));
}
document.querySelector<HTMLButtonElement>('#checks')!.onclick = async event => {
  const button = event.target as HTMLButtonElement; button.disabled = true;
  const status = document.querySelector('#check-status')!; status.textContent = 'Running shared cases in a browser worker…';
  try {
    probe.fixtures = await probe.run();
    const failed = probe.fixtures.filter(f => !f.passed);
    status.textContent = failed.length ? `${failed.length} checks failed: ${failed.map(f => f.name).join(', ')}` : `${probe.fixtures.length} checks passed in this browser.`;
  } catch (error) { status.textContent = (error as Error).message; }
  finally { button.disabled = false; }
};
await draw(); probe.ready = true; probe.loadMs = performance.now() - started;
