export function nativeDiscoveryFixtureFile(
  kind: 'component' | 'original' | 'few' | 'many',
): Promise<{ path: string; raw: Buffer }>;
