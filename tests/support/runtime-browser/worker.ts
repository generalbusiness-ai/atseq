import { runRuntimeCorpus } from '../runtime-corpus.ts';
import { runSourceDocumentCorpus } from '../source-document-corpus.ts';
runRuntimeCorpus()
  .then(async (results) => [...results, ...(await runSourceDocumentCorpus())])
  .then(
    (results) => postMessage({ results }),
    (error) => postMessage({ error: String(error) }),
  );
