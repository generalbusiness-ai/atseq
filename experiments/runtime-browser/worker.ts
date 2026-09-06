import { runRuntimeCorpus } from '../runtime-corpus.ts';
runRuntimeCorpus().then(results => postMessage({ results }), error => postMessage({ error: String(error) }));
