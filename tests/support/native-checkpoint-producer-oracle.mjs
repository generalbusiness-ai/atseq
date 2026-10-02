// Separate golden encoder: @ipld/dag-cbor + multiformats, no Atseq production imports.
import { format } from 'prettier';
import { readFile, writeFile } from 'node:fs/promises';
import { encode } from '@ipld/dag-cbor';
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';
const input = JSON.parse(await readFile('.atseq-local/native-checkpoint-producer/independent-input.json', 'utf8'));
const nsid = 'ai.generalbusiness.atseq.content';
const recordMap = new Map();
const counters = { records: 0, recordBytes: 0, chunks: 0, manifests: 0, pages: 0, payloadBytes: 0 };
const hex = (raw) => Buffer.from(raw).toString('hex');
function lex(value) {
  if (value && typeof value === 'object') {
    if ('$link' in value) return CID.parse(value.$link);
    if ('$bytes' in value) return Uint8Array.from(Buffer.from(value.$bytes, 'base64'));
    if (Array.isArray(value)) return value.map(lex);
    return Object.fromEntries(Object.entries(value).map(([key, row]) => [key, lex(row)]));
  }
  return value;
}
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
    .join(',')}}`;
}
async function record(value, kind) {
  const raw = encode(lex(value));
  const cid = CID.createV1(0x71, await sha256.digest(raw)).toString();
  if (!recordMap.has(cid)) {
    recordMap.set(cid, { path: `${nsid}/${cid}`, cid, hex: hex(raw) });
    counters.records++;
    counters.recordBytes += raw.length;
    counters[kind]++;
  }
  return cid;
}
async function payload(raw) {
  const chunks = [];
  for (let offset = 0; offset < raw.length; offset += 32768)
    chunks.push({
      $link: await record(
        {
          $type: nsid,
          version: 1,
          body: {
            $type: 'ai.generalbusiness.atseq.defs#byteChunk',
            bytes: {
              $bytes: Buffer.from(raw.subarray(offset, offset + 32768))
                .toString('base64')
                .replace(/=+$/, ''),
            },
          },
        },
        'chunks',
      ),
    });
  const cid = await record(
    {
      $type: nsid,
      version: 1,
      body: { $type: 'ai.generalbusiness.atseq.defs#byteManifest', byteLength: raw.length, chunks },
    },
    'manifests',
  );
  counters.payloadBytes += raw.length;
  return { cid, hex: hex(raw) };
}
async function table(kind, originals, through) {
  const pages = [];
  const counts = [];
  let parts = [];
  let size = 2;
  async function flush() {
    if (!parts.length) return;
    pages.push(await payload(Buffer.from(`[${parts.join(',')}]`)));
    counts.push(parts.length);
    counters.pages++;
    parts = [];
    size = 2;
  }
  for (const original of originals) {
    const raw = Buffer.from(original, 'base64');
    if (size + raw.length + (parts.length ? 1 : 0) > 131072) await flush();
    parts.push(raw.toString());
    size += raw.length + (parts.length > 1 ? 1 : 0);
  }
  await flush();
  const data = {
    format: 'atseq-checkpoint-table',
    version: 1,
    ...input.scope,
    kind,
    through,
    rows: originals.length,
    pages: pages.map((page, index) => ({ payload: page.cid, rows: counts[index] })),
  };
  return { ...(await payload(Buffer.from(canonical(data)))), pages };
}
const tables = {
  history: await table('history', input.history, input.head),
  sources: await table('sources', input.sources, input.head),
  evidence: await table('evidence', input.evidence, input.head),
  outcomes: await table('outcomes', input.outcomes, input.frontier),
};
for (const original of input.payloads) await payload(Buffer.from(original, 'base64'));
const state = await payload(Buffer.from(input.state, 'base64')),
  authority = await payload(Buffer.from(input.authority, 'base64')),
  producer = await payload(Buffer.from(input.producer, 'base64'));
const assertion = await payload(
  Buffer.from(
    canonical({
      format: 'atseq-checkpoint-assertion',
      version: 1,
      ...input.scope,
      head: input.head,
      frontier: input.frontier,
      definition: input.definition,
      state: state.cid,
      authority: authority.cid,
      producer: producer.cid,
      history: tables.history.cid,
      sources: tables.sources.cid,
      evidence: tables.evidence.cid,
      outcomes: tables.outcomes.cid,
      stall: input.stall,
    }),
  ),
);
const result = {
  assertion,
  tables,
  records: [...recordMap.values()].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)),
  counters,
};
await writeFile(
  'tests/vectors/native-checkpoint-producer.json',
  await format(JSON.stringify(result), { ...JSON.parse(await readFile('.prettierrc.json', 'utf8')), parser: 'json' }),
);
console.log(JSON.stringify({ assertion: assertion.cid, ...counters }));
