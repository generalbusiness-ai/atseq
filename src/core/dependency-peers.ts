/** Independently reviewed optional typechecking peer; never a runtime edge. */
export const NON_EXECUTED_PEERS = Object.freeze([
  Object.freeze({ package: 'valibot', version: '1.5.0', peer: 'typescript', purpose: 'optional typechecking only' }),
]);
export function isNonExecutedPeer(manifest: Record<string, any>, name: string): boolean {
  return (
    manifest.name === 'valibot' &&
    manifest.version === '1.5.0' &&
    name === 'typescript' &&
    manifest.peerDependencies?.typescript === '>=5' &&
    manifest.peerDependenciesMeta?.typescript?.optional === true
  );
}
