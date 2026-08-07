import { readFile, readdir } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceExtensions = new Set(['.css', '.js', '.jsx', '.mjs', '.ts', '.tsx']);
const webVisualExceptions = new Set([
  resolve(root, 'apps/web/app/manifest.ts'),
  resolve(root, 'apps/web/app/opengraph-image.tsx'),
]);
const experienceNativeException = resolve(root, 'packages/experience');
const nativePlayerException = resolve(root, 'apps/mobile/components/NativePlayer.tsx');
const violations = [];

function displayPath(file) {
  return relative(root, file).replaceAll('\\', '/');
}

function lineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

function addViolation(file, source, index, message) {
  violations.push(`${displayPath(file)}:${lineNumber(source, index)} ${message}`);
}

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.next' ||
      entry.name === '.expo' ||
      entry.name === 'dist' ||
      entry.name === 'public'
    )
      continue;
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(file)));
    else if (sourceExtensions.has(extname(entry.name))) files.push(file);
  }
  return files;
}

const appFiles = await collect(resolve(root, 'apps'));
const packageFiles = await collect(resolve(root, 'packages'));
const webFiles = appFiles.filter((file) => file.startsWith(resolve(root, 'apps/web/app')));

for (const file of [...appFiles, ...packageFiles]) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/tamagui|@tamagui/gi)) {
    addViolation(file, source, match.index, 'legacy Tamagui reference is not allowed');
  }
}

for (const file of [...appFiles, ...packageFiles]) {
  if (file.startsWith(resolve(root, 'packages/ui'))) continue;
  const source = await readFile(file, 'utf8');
  const allowedReactNativeImport =
    file.startsWith(experienceNativeException) || file === nativePlayerException;
  const importPattern =
    /(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"](react-native-paper|react-native-safe-area-context|lucide-react-native|react-native)(?:['"]|\/)/g;
  for (const match of source.matchAll(importPattern)) {
    if (match[1] === 'react-native' && allowedReactNativeImport) continue;
    addViolation(file, source, match.index, `direct ${match[1]} import must stay behind @calm/ui`);
  }
}

for (const file of webFiles) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/['"](@calm\/ui\/[^'"]+)['"]/g)) {
    if (match[1] === '@calm/ui/theme.css') continue;
    addViolation(file, source, match.index, 'package-internal @calm/ui import is not allowed');
  }
  if (webVisualExceptions.has(file)) continue;
  for (const match of source.matchAll(/#[0-9a-f]{3,8}\b|rgba?\s*\(/gi)) {
    addViolation(file, source, match.index, 'raw color literal must come from @calm/ui tokens');
  }
  for (const match of source.matchAll(/\bstyle\s*=\s*\{\s*\{/g)) {
    addViolation(file, source, match.index, 'inline style object is not allowed in web routes');
  }
  for (const match of source.matchAll(/<(button|input|textarea|select|dialog)\b/g)) {
    addViolation(
      file,
      source,
      match.index,
      `raw ${match[1]} control must use an @calm/ui primitive`,
    );
  }
}

if (violations.length > 0) {
  console.error('UI governance check failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log('UI governance check passed for web routes and frontend packages.');
}
