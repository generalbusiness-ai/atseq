/** Own imported contract data before recursively freezing its public descriptor. */
export function deepFreeze(value) {
    const copy = structuredClone(value);
    function freeze(node) {
        if (node && typeof node === 'object') {
            Object.values(node).forEach(freeze);
            Object.freeze(node);
        }
    }
    freeze(copy);
    return copy;
}
//# sourceMappingURL=freeze.js.map