import { PROFILE } from '../core/profile.js';
import { ACTIVATE } from '../definition/control.js';
import { bytes } from '../protocol/wire.js';
import { prepareDeviceIntent } from './identity.js';
import { element, button } from './forms.js';
export function changePanel(ctx) {
    const { changeDraft, current, definition, snapshot, api, store, tell, failure, compareChange, drawApp, flush, visible, inspect, } = ctx;
    const identity = ctx.identity();
    const panel = element('section', undefined, 'card');
    panel.append(element('h2', 'Change this app'));
    const label = element('label', 'Import updated definition CAR'), file = element('input');
    file.type = 'file';
    file.accept = '.car';
    file.setAttribute('aria-label', 'Import updated definition CAR');
    file.onchange = async () => {
        const source = file.files?.[0];
        if (!source || !visible())
            return;
        try {
            if (source.size > PROFILE.definitionBytes)
                throw new Error('Definition exceeds 512 KiB');
            const raw = [...new Uint8Array(await source.arrayBuffer())];
            if (!visible())
                return;
            await compareChange(raw);
        }
        catch (error) {
            if (visible())
                failure(error);
        }
    };
    label.append(file);
    panel.append(label);
    if (!changeDraft || !current || !definition) {
        panel.append(element('p', 'Preview an update that keeps the current data schema and runtime. A grant from genesis is required to apply it.', 'muted'));
        return panel;
    }
    const proposed = changeDraft, target = { ...current }, comparison = proposed.comparison;
    panel.append(element('p', `${comparison.current.manifest.title} → ${comparison.candidate.manifest.title}`), element('p', 'State schema matches · existing prefix replays · current data is preserved', 'tag'));
    const additions = (key) => {
        const names = (info) => info.manifest[key].map((value) => ('ref' in value ? value.ref : value.name));
        const previous = new Set(names(comparison.current));
        return names(comparison.candidate).filter((name) => !previous.has(name));
    };
    panel.append(inspect('Inspect changes', {
        newActions: additions('actions'),
        newQueries: additions('queries'),
        newViews: additions('views'),
        expected: proposed.expected,
        candidate: comparison.candidate.cid,
    }));
    const moved = proposed.expected !== definition.cid, authorized = identity && snapshot.genesis.activationKeys.includes(identity.publicKey);
    if (moved)
        panel.append(element('p', 'The app changed after this comparison. Refresh it before applying.', 'error'), button('Refresh comparison', () => compareChange(proposed.source).catch(failure)));
    if (!authorized)
        panel.append(element('p', 'This device does not hold an initial app-update grant. You can keep and inspect the proposal.', 'muted'));
    const apply = button('Apply change', async () => {
        if (!visible() || !identity || !authorized || moved || apply.disabled || ctx.applying())
            return;
        ctx.setApplying(true);
        apply.disabled = true;
        try {
            const staged = await api.call('stageDefinition', {
                ...target,
                expected: proposed.expected,
                source: bytes(new Uint8Array(proposed.source)),
            });
            if (staged.candidate.cid !== comparison.candidate.cid ||
                JSON.stringify(staged.closure) !== JSON.stringify(comparison.closure))
                throw new Error('Retained candidate differs from the reviewed source');
            const payload = {
                expected: proposed.expected,
                definition: comparison.candidate.cid,
                closure: comparison.closure,
            };
            const prepared = await prepareDeviceIntent(identity, target, proposed.expected, ACTIVATE, payload);
            await store.enqueue(target.app, prepared.cid, {
                ...prepared,
                ...target,
                source: proposed.source,
                status: 'queued',
            });
            await store.set(`change:${target.app}`, undefined);
            if (!visible()) {
                void flush().catch(failure);
                return;
            }
            ctx.clearDraft();
            tell('Update queued on this device. Waiting for its recorded outcome.');
            await drawApp();
            await flush();
        }
        catch (error) {
            if (visible())
                tell(`Proposal retained. ${error.message}`);
        }
        finally {
            ctx.setApplying(false);
            if (visible())
                await drawApp();
        }
    }, 'primary');
    apply.disabled = moved || !authorized || ctx.applying();
    panel.append(element('p', 'Apply retains this source on the test PDS and submits a signed activation. The new definition starts after that entry.', 'muted'), apply);
    return panel;
}
//# sourceMappingURL=changes.js.map