import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const docsRoot = resolve(root, 'docs');
const files = [];

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.name.endsWith('.md')) files.push(path);
  }
}

await collect(docsRoot);
const ids = new Set();
for (const file of files) {
  const source = await readFile(file, 'utf8');
  if (/[^\x00-\x7F]/.test(source)) throw new Error(`Non-ASCII prose in ${file}`);
  if (!source.match(/^# /m)) throw new Error(`Missing top heading in ${file}`);
  if (source.startsWith('---\n')) {
    const end = source.indexOf('\n---\n', 4);
    if (end < 0) throw new Error(`Invalid metadata block in ${file}`);
    const metadata = JSON.parse(source.slice(4, end));
    if (!metadata.kind || (!metadata.status && !metadata.specStatus))
      throw new Error(`Metadata needs kind and specification status in ${file}`);
    for (const id of metadata.acceptanceIds ?? []) {
      ids.add(id);
    }
  }
  for (const match of source.matchAll(/\[(AC-[A-Z0-9-]+)\]/g)) ids.add(match[1]);
  const links = [...source.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
  for (const link of links) {
    if (link.replace(/^</, '').startsWith('http') || link.startsWith('#')) continue;
    const target = resolve(join(file, '..'), link);
    try {
      await readFile(target);
    } catch {
      throw new Error(`Broken documentation link ${link} in ${file}`);
    }
  }
}

console.log(`Validated ${files.length} documentation files and ${ids.size} acceptance IDs.`);
