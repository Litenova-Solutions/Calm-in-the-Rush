import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface ProductBriefDocument {
  metadata: Record<string, unknown>;
  markdown: string;
  sourcePath: string;
}

export async function readProductBrief(): Promise<ProductBriefDocument> {
  const sourcePath = resolve(process.cwd(), '../../docs/product/brief.md');
  const source = await readFile(sourcePath, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('Product brief metadata block is missing.');
  const metadata = JSON.parse(match[1]) as Record<string, unknown>;
  return { metadata, markdown: match[2].trim(), sourcePath };
}
