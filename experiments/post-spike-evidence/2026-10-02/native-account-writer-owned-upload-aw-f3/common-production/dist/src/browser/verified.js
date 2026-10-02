/** Call only with worker-verified inputs. The transaction preserves a concurrently saved floor. */
export function retainVerified(store, input, current) {
    return store.update(`verified:${input.genesis.app}:${input.genesisCid}`, (previous) => {
        if (current && !current())
            throw new Error('App changed before saving verified history');
        if (previous) {
            const position = previous.head.position;
            if (position > input.head.position)
                throw new Error('Chosen prefix is behind saved history');
            const cid = position === 0
                ? input.genesisCid
                : position === input.head.position
                    ? input.head.entry.$link
                    : input.entries.find((entry) => entry.position === position + 1)?.prev.$link;
            if (cid !== previous.head.entry.$link)
                throw new Error('Chosen prefix forks from saved history');
        }
        return input;
    });
}
//# sourceMappingURL=verified.js.map