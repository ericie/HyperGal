// Validate published paths against Git, even on a case-insensitive filesystem.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = execFileSync('git', ['ls-files', '--cached', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const tracked = new Set(files);
const folded = new Map();
const errors = [];
for (const file of files) {
  const key = file.toLowerCase();
  if (folded.has(key) && folded.get(key) !== file) errors.push(`Case collision: ${folded.get(key)} / ${file}`);
  folded.set(key, file);
}
let checked = 0;
function check(file, url) {
  if (!url || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return;
  let pathname = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  if (!pathname) return;
  pathname = pathname.startsWith('/') ? pathname.slice(1) : posix.join(posix.dirname(file), pathname);
  pathname = posix.normalize(pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  checked++;
  if (!tracked.has(pathname)) errors.push(`${file}: ${url} → ${pathname}${folded.has(pathname.toLowerCase()) ? ` (Git has ${folded.get(pathname.toLowerCase())})` : ' (not tracked)'}`);
}
for (const file of files.filter(file => file.startsWith('Issues/') && /\.(?:html|css)$/.test(file))) {
  const source = readFileSync(resolve(root, file), 'utf8');
  const pattern = file.endsWith('.html') ? /\b(?:src|href)=["']([^"']+)["']/g : /url\(\s*["']?([^\s"')]+)["']?\s*\)/g;
  for (const match of source.matchAll(pattern)) check(file, match[1]);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Arcade paths pass: ${checked} local references, exact Git casing, no case collisions.`);
