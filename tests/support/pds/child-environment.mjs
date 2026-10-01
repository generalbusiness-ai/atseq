// The fixture needs OS paths, not the caller's service, exporter or Node preload settings.
const osKeys = ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'WINDIR', 'TMPDIR', 'TMP', 'TEMP'];

export function fixtureChildEnvironment(inherited = process.env) {
  const env = {};
  for (const key of osKeys) if (typeof inherited[key] === 'string') env[key] = inherited[key];
  return { ...env, TZ: 'UTC', LOG_ENABLED: 'false', OTEL_SDK_DISABLED: 'true' };
}
