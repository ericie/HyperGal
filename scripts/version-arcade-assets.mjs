// Refresh static asset URLs without changing filenames or adding runtime requests.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const films = ['asteroids', 'snake', 'warlords', 'command', 'unbreakable', 'landgrab', 'onward'];
const pages = ['Issues/index.html', 'Issues/about.html', 'Issues/arcade/index.html',
  'Issues/arcade/attract-test.html', 'Issues/arcade/snake-test.html',
  'Issues/arcade/warlords-test.html', 'Issues/arcade/command-test.html', 'Issues/arcade/unbreakable-test.html', 'Issues/arcade/landgrab-test.html', 'Issues/arcade/onward-test.html'];
const pending = new Map();
const read = path => pending.get(path) ?? readFileSync(path, 'utf8');
const hash = path => createHash('sha256').update(pending.get(path) ?? readFileSync(path)).digest('hex').slice(0, 12);
const update = (path, content) => {
  if (content !== readFileSync(path, 'utf8')) pending.set(path, content);
};

// Update this dependency first, so its own hash includes the current PNG hashes.
const versions = Object.fromEntries(films.map(film => [film, hash(resolve(root, `Issues/arcade/assets/${film}-attract.png`))]));
const gallery = resolve(root, 'Issues/arcade.js');
const source = read(gallery);
if (!/const filmVersions = \{[^;]*\};/.test(source)) throw new Error('Missing filmVersions map in Issues/arcade.js');
update(gallery, source.replace(/const filmVersions = \{[^;]*\};/, `const filmVersions = ${JSON.stringify(versions)};`));

for (const page of pages) {
  const path = resolve(root, page);
  update(path, read(path).replace(/\b(src|href)="([^"?#]+)(?:\?v=[a-f\d]+)?"/g, (attribute, name, url) => {
    if (!/\.(?:js|css)$/.test(url) && !/-attract\.png$/.test(url)) return attribute;
    if (/^(?:[a-z]+:|\/\/)/i.test(url)) return attribute;
    return `${name}="${url}?v=${hash(resolve(dirname(path), url))}"`;
  }));
}

if (check) {
  if (pending.size) {
    console.error(`Stale Arcade asset URLs: ${[...pending.keys()].map(path => path.slice(root.length + 1)).join(', ')}\nRun: node scripts/version-arcade-assets.mjs`);
    process.exitCode = 1;
  } else console.log('Arcade asset versions are current.');
} else {
  for (const [path, content] of pending) writeFileSync(path, content);
  console.log(`Updated Arcade asset versions in ${pending.size} files.`);
}
