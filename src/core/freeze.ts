/** Own imported contract data before recursively freezing its public descriptor. */
export function deepFreeze<T>(value: T): Readonly<T> {
  const copy = structuredClone(value);
  function freeze(node: unknown): void {
    if (node && typeof node === 'object') {
      Object.values(node).forEach(freeze);
      Object.freeze(node);
    }
  }
  freeze(copy);
  return copy;
}
