import { runNativeWireCorpus } from '../native-wire-corpus.ts';
runNativeWireCorpus()
  .then((results) => {
    (window as any).nativeWireResults = results;
  })
  .catch((error) => {
    (window as any).nativeWireFailure = String(error);
  });
