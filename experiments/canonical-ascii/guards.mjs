/** Compile externally; inject the same profile/error class in each realm. */
export function createGuard(compiled, InterpretationError, PROFILE, TextEncoderClass = TextEncoder) {
  const local = compiled.replace(/^import .*?;\s*$/gm, '').replace(/^export /gm, '');
  return new Function('InterpretationError', 'PROFILE', 'TextEncoder', local + '\nreturn canonicalJson;')(
    InterpretationError,
    PROFILE,
    TextEncoderClass,
  );
}
