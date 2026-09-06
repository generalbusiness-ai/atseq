import { runProtocolCorpus } from '../protocol-corpus.ts';
try {
  const results = await runProtocolCorpus();
  (window as any).protocolResults = results;
  document.querySelector('#status')!.textContent = `${results.filter(r => r.passed).length}/${results.length} protocol fixtures passed`;
} catch (error) {
  (window as any).protocolFailure = String((error as Error).stack);
}
