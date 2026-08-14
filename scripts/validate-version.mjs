import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const version = (await readFile(resolve(root, 'VERSION'), 'utf8')).trim();
const semver =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

if (!semver.test(version)) throw new Error(`VERSION is not valid Semantic Versioning: ${version}`);

const manifests = ['package.json', 'apps/web/package.json', 'packages/config/package.json'];

for (const relativePath of manifests) {
  const manifest = JSON.parse(await readFile(resolve(root, relativePath), 'utf8'));
  if (manifest.version !== version)
    throw new Error(`${relativePath} has ${manifest.version}; expected ${version}`);
}

console.log(`Version ${version} is valid and consistent across ${manifests.length} manifests.`);
