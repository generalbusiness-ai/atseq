export class Evaluator {
  private worker!: Worker;
  private id = 0;
  private pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  constructor() { this.start(); }
  private start() {
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = ({ data }) => {
      const request = this.pending.get(data.id); if (!request) return;
      clearTimeout(request.timer); this.pending.delete(data.id);
      if (data.error) request.reject(Object.assign(new Error(data.error.message), { code: data.error.code })); else request.resolve(data.result);
    };
    this.worker.onerror = () => this.cancel('Worker failed; retained inputs are unchanged. Refresh to rebuild.');
  }
  call(kind: string, args: Record<string, unknown> = {}) {
    return new Promise<any>((resolve, reject) => {
      const id = ++this.id, timer = setTimeout(() => this.cancel('Evaluation timed out; retained inputs are unchanged. Refresh to rebuild.'), 15_000);
      this.pending.set(id, { resolve, reject, timer }); this.worker.postMessage({ id, kind, ...args });
    });
  }
  cancel(message = 'Preview cancelled. Retained inputs are unchanged.') {
    this.worker.terminate();
    for (const item of this.pending.values()) { clearTimeout(item.timer); item.reject(new Error(message)); }
    this.pending.clear(); this.start();
  }
}
