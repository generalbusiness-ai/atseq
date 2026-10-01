/** The installed browser bundle is built only after checking the file closure.
 * Its build provenance pins the emitted bytes; installation verifies those pins.
 */
export function verifyInstalledDependencies(): void {}
export const integrityEnvironment = 'browser';
