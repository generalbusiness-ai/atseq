import { chartExport } from '../archive/chart.js';
import { element, button } from './forms.js';
function download(name, data, type) {
    const url = URL.createObjectURL(new Blob([new Uint8Array(data)], { type })), a = element('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function archivePanel(snapshot, binding, evaluator, visible, tell, failure) {
    const panel = element('section', undefined, 'card');
    panel.append(element('h2', 'Keep a copy'), element('p', `App and verified history through entry ${snapshot.projection.frontier.position}. Includes definitions and data. Replay needs this installed runtime; signing keys are excluded.`, 'muted'));
    panel.append(button('Download app and verified history', async () => {
        if (!visible())
            return;
        tell('Verifying source and replaying the chosen prefix for export…');
        try {
            const result = await evaluator.call('exportArchive', { session: binding }, 120_000);
            if (!visible())
                return;
            download('application.atseq.json', result.bytes, 'application/json');
            tell(`Exported verified history through entry ${result.head.position}. The app remains open.`);
        }
        catch (error) {
            if (visible())
                failure(error);
        }
    }));
    return panel;
}
export function queryExport(value, source, visible, failure) {
    const panel = element('div'), datasets = Object.entries(value && typeof value === 'object' ? value : {}).filter(([, rows]) => Array.isArray(rows) &&
        rows.length &&
        rows.length <= 100 &&
        rows.every((row) => row && typeof row === 'object' && !Array.isArray(row)));
    for (const [name, data] of datasets) {
        const rows = data, labels = Object.keys(rows[0]).filter((key) => rows.every((row) => typeof row[key] === 'string')), values = Object.keys(rows[0]).filter((key) => rows.every((row) => Number.isSafeInteger(row[key])));
        if (!labels.length || !values.length)
            continue;
        const card = element('section', undefined, 'card'), label = element('select'), metric = element('select'), result = element('div');
        label.setAttribute('aria-label', 'Chart labels');
        metric.setAttribute('aria-label', 'Chart values');
        for (const key of labels) {
            const option = element('option', key);
            option.value = key;
            label.append(option);
        }
        for (const key of values) {
            const option = element('option', key);
            option.value = key;
            metric.append(option);
        }
        card.append(element('h3', `Chart or table: ${name}`), label, metric, button('Draw chart', () => {
            if (!visible())
                return;
            try {
                const exported = chartExport(rows, label.value, metric.value, source), picture = element('img');
                picture.alt = `${metric.value} by ${label.value}; values are in the accompanying table`;
                picture.style.width = '100%';
                picture.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(exported.svg);
                const table = element('table'), header = element('tr');
                header.append(element('th', label.value), element('th', metric.value));
                table.append(header);
                for (const row of rows) {
                    const tr = element('tr');
                    tr.append(element('td', String(row[label.value])), element('td', String(row[metric.value])));
                    table.append(tr);
                }
                result.replaceChildren(picture, table, button('Download SVG', () => {
                    if (visible())
                        download('query.svg', new TextEncoder().encode(exported.svg), 'image/svg+xml');
                }), button('Download table', () => {
                    if (visible())
                        download('query.html', new TextEncoder().encode(exported.html), 'text/html');
                }));
            }
            catch (error) {
                failure(error);
            }
        }), result);
        panel.append(card);
    }
    return panel;
}
//# sourceMappingURL=exports.js.map