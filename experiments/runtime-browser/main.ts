const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
worker.onmessage = ({ data }) => {
  if (data.results) (window as any).runtimeResults = data.results;
  else (window as any).runtimeFailure = data.error;
  document.querySelector('#status')!.textContent = data.results ? 'Runtime checks finished.' : 'Runtime checks failed.';
  worker.terminate();
};
worker.onerror = event => { (window as any).runtimeFailure = event.message; worker.terminate(); };
