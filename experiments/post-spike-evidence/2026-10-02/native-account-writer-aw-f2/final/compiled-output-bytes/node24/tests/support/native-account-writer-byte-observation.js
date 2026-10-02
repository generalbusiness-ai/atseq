/** Test-only observation of actual owned stream reads, retaining counts only. */
export function observeStreamByteCounts() {
    const prototype = ReadableStreamDefaultReader.prototype;
    const original = prototype.read;
    const indexes = new WeakMap();
    const sizes = [];
    const observed = async function () {
        const result = await original.call(this);
        if (result.value instanceof Uint8Array) {
            let index = indexes.get(this);
            if (index === undefined) {
                index = sizes.length;
                indexes.set(this, index);
                sizes.push(0);
            }
            sizes[index] = sizes[index] + result.value.length;
        }
        return result;
    };
    prototype.read = observed;
    return () => {
        if (prototype.read !== observed)
            throw new Error('Test byte observer was replaced');
        prototype.read = original;
        return [...sizes];
    };
}
