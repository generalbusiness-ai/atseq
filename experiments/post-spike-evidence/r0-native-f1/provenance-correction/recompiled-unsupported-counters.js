const encode = (value) => new TextEncoder().encode(JSON.stringify(value));
const assert = (value, label) => {
    if (!value)
        throw Error('Counter prototype: ' + label);
};
export function counterAlternatives(history, fixture) {
    const nativeReceipts = history.map((row) => ({
        position: row.position,
        request: row.request,
        entry: row.entry,
        entryBytes: row.entryBytes,
        requestBytes: row.requestBytes,
    }));
    const byKey = new Map();
    for (const row of history)
        if (row.actor)
            byKey.set(row.actor.actorKey, (byKey.get(row.actor.actorKey) ?? 0) + 1);
    const marks = fixture.oracle.authority.grants.map((row) => ({
        namespace: [fixture.genesis.app, fixture.genesisCid, row.principal, row.id, row.cid, row.grant.actorKey],
        mark: byKey.get(row.grant.actorKey) ?? 0,
        retired: row.revoked,
    }));
    // Receipt/content storage remains in every alternative, including retired namespaces.
    const cases = [];
    for (const mode of ['consecutive', 'increasing']) {
        const accepted = new Map();
        let high = 0;
        function submit(counter, content, evidence = true) {
            const old = accepted.get(counter);
            if (old)
                return !evidence
                    ? 'unavailable_old_evidence'
                    : old.content === content
                        ? 'original_receipt'
                        : 'content_conflict';
            if (!Number.isSafeInteger(counter) || counter < 1)
                return 'invalid_counter';
            if (counter <= high)
                return 'stale_unused_counter';
            if (mode === 'consecutive' && counter !== high + 1)
                return 'counter_gap';
            accepted.set(counter, { content, receipt: counter });
            high = counter;
            return 'ordered';
        }
        const higher = submit(2, 'second'), lower = submit(1, 'first');
        assert(higher === (mode === 'consecutive' ? 'counter_gap' : 'ordered'), 'cancel/reorder higher');
        assert(lower === (mode === 'consecutive' ? 'ordered' : 'stale_unused_counter'), 'stranded lower');
        const used = mode === 'consecutive' ? 1 : 2;
        assert(submit(used, mode === 'consecutive' ? 'first' : 'second') === 'original_receipt', 'old exact receipt');
        assert(submit(used, 'clone') === 'content_conflict', 'clone/content conflict');
        assert(submit(used, 'clone', false) === 'unavailable_old_evidence', 'old evidence unavailable');
        cases.push({
            mode,
            higher,
            lower,
            exact: 'original_receipt',
            clone: 'content_conflict',
            missing: 'unavailable_old_evidence',
        });
    }
    return {
        unsupportedAlternative: true,
        productionNonceContractUnchanged: true,
        marks: marks.length,
        retiredMarks: marks.filter((row) => row.retired).length,
        counterMarkJsonBytes: encode(marks).length,
        retainedOriginalReceiptPointerJsonBytes: encode(nativeReceipts).length,
        originalNativeContentAndProofsStillRequired: true,
        sharedOriginalNativeContentBytes: fixture.costs.originalEntryBytes + fixture.costs.originalNestedRequestBytes,
        sharedNativeProofBytes: fixture.costs.participantCarBytes,
        exactOriginalContentAndReceiptPointersRetainedInFrozenFixture: true,
        cases,
        renewal: 'new immutable grant namespace; old receipt/mark retained; same signer reused adopted nonce still conflicts',
        rotation: 'new signer is new intent; never re-sign or retarget queued consent; repo-key/PDS rotation does not reset grant counter',
        namespaceExhaustion: 'safe integer exhausted; no wraparound; explicit new binding required',
    };
}
export async function allocatorProbe(open) {
    let a = await open('counter'), b;
    const metadata = encode({ unsupportedCounterAllocator: true });
    try {
        const first = await a.commit(null, metadata, [{ kind: 'pending', key: 'mark', value: encode({ next: 1 }) }]);
        b = await open('counter');
        const attempts = await Promise.allSettled([
            a.commit(first, metadata, [{ kind: 'pending', key: 'mark', value: encode({ next: 2 }) }]),
            b.commit(first, metadata, [{ kind: 'pending', key: 'mark', value: encode({ next: 2 }) }]),
        ]);
        assert(attempts.filter((x) => x.status === 'fulfilled').length === 1, 'one concurrent allocator wins');
        const rejected = attempts.find((x) => x.status === 'rejected');
        assert(rejected?.reason?.code === 'conflict', 'clone stale CAS rejected');
        await b.close();
        b = undefined;
        await a.close();
        a = await open('counter');
        const current = (await a.current());
        const durable = JSON.parse(new TextDecoder().decode(await a.row(current.id, 'pending', 'mark')));
        assert(durable.next === 2, 'durable allocator after restart');
        const next = await a.commit(current.id, metadata, [{ kind: 'pending', key: 'mark', value: encode({ next: 3 }) }]);
        // Cancellation keeps allocation, not an ordered receipt; a consecutive consumer must handle the gap explicitly.
        const exhausted = await a.commit(next, metadata, [
            { kind: 'pending', key: 'mark', value: encode({ next: Number.MAX_SAFE_INTEGER }) },
        ]);
        const value = JSON.parse(new TextDecoder().decode(await a.row(exhausted, 'pending', 'mark')));
        assert(!Number.isSafeInteger(value.next + 1), 'finite exhaustion refuses wraparound');
        return {
            unsupportedAlternative: true,
            concurrentWinners: 1,
            staleCloneCode: 'conflict',
            durableNextAfterReopen: 2,
            cancelledReservationRetained: true,
            exhaustion: 'requires_new_binding',
            nativeNonceAndReceiptsUnchanged: true,
        };
    }
    finally {
        await b?.close();
        await a.close();
    }
}
