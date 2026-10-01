export function createGuard(
  compiled: string,
  error: typeof import('../../src/core/profile.ts').InterpretationError,
  profile: typeof import('../../src/core/profile.ts').PROFILE,
  encoder?: typeof TextEncoder,
): typeof import('../../src/core/values.ts').canonicalJson;
