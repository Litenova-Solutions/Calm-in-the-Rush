import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = resolve(root, 'packages/content/assets/scenes');
const destination = resolve(root, 'apps/web/public/media/scenes');
const expectedParent = resolve(root, 'apps/web/public/media');

const destinationRelativeToParent = relative(expectedParent, destination);
if (isAbsolute(destinationRelativeToParent) || destinationRelativeToParent.startsWith('..')) {
  throw new Error(`Refusing to clean unexpected destination: ${destination}`);
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
console.log(`Synced scene media to ${relative(root, destination)}`);
