#!/usr/bin/env node
// Render gallery thumbnails from the actual pieces. Playwright is a development
// tool only; the gallery and artworks remain dependency-free static files.
import { readdir, readFile, mkdir, writeFile, copyFile, access } from 'node:fs/promises';
import { dirname, join, resolve, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at < 0 ? fallback : args[at + 1];
};
const base = option('--base-url', 'http://127.0.0.1:8000');
const size = Number(option('--size', '720'));
const wait = Number(option('--wait', '6000'));
const only = option('--only', '').split(',').filter(Boolean);
const output = resolve(option('--output', join(root, 'output', `thumbnails-${Date.now()}`)));
const modulePath = option('--playwright', process.env.PLAYWRIGHT_MODULE);
const require = createRequire(import.meta.url);
const { chromium } = modulePath
  ? await import(pathToFileURL(resolve(modulePath)).href)
  : require('playwright');
if (!Number.isInteger(size) || size < 100 || !Number.isFinite(wait) || wait < 0) {
  throw new Error('Invalid --size or --wait.');
}

const pieces = [];
for (const entry of await readdir(join(root, 'pieces'), { withFileTypes: true })) {
  if (!entry.isDirectory() || /^[_.]/.test(entry.name)) continue;
  const directory = join(root, 'pieces', entry.name);
  const meta = JSON.parse(await readFile(join(directory, 'meta.json'), 'utf8'));
  if (only.length && !only.includes(entry.name)) continue;
  if (!meta.thumbnail || !['.jpg', '.jpeg', '.png'].includes(extname(meta.thumbnail))) {
    throw new Error(`Missing or unsupported thumbnail: ${entry.name}`);
  }
  pieces.push({ slug: entry.name, thumbnail: meta.thumbnail });
}
pieces.sort((a, b) => a.slug.localeCompare(b.slug));
await mkdir(output, { recursive: true });

// Back up the current files, including any uncommitted thumbnail edits.
for (const piece of pieces) {
  const directory = join(output, 'backup', piece.slug);
  await mkdir(directory, { recursive: true });
  await copyFile(join(root, 'pieces', piece.slug, piece.thumbnail), join(directory, piece.thumbnail));
}

const hiddenControls = [
  '#controls', '#panel-root', '#palette-panel', '.gestalt-panel',
  '.marble-panel', '.lichen-panel', '.water-panel', '#river-panel',
  '.river-panel', '#garden-panel', '.garden-panel', '#grain-controls',
  '#palette', '#handles', '#caption', '.caption', '#buildBadge',
  '#debug-grid', '#debug-view', '.debug-grid', '.instructions'
].join(',');
const seeds = {
  '019-city-of-signs': '1907', '023-marbled-water': 'water-v14',
  '050-strega-nona': 'olive', '052-negative-fill': 'negative-fill',
  '053-loaded-brush': 'loaded-brush', '054-tideline': 'weld',
  '056-mount-fuji': 'fuji'
};
const waits = { '050-strega-nona': 18000, '051-agate': 18000, '052-negative-fill': 20000 };
const browser = await chromium.launch({ headless: true });
const results = [];
let next = 0;
async function worker() {
  while (next < pieces.length) {
    const piece = pieces[next++];
    const context = await browser.newContext({
      viewport: { width: size, height: size }, deviceScaleFactor: 1,
      reducedMotion: 'no-preference', colorScheme: 'light'
    });
    const page = await context.newPage();
    const errors = [], failures = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
    });
    const url = new URL(`/pieces/${piece.slug}/index.html`, base);
    url.searchParams.set('seed', seeds[piece.slug] || String(parseInt(piece.slug, 10) * 1009));
    url.searchParams.set('panel', '0');
    if (piece.slug === '040-moss-eaters') url.searchParams.set('preview', 'mature');
    try {
      await page.route('**/*', route => {
        const request = new URL(route.request().url());
        return /^https?:$/.test(request.protocol) && request.origin !== url.origin
          ? route.abort() : route.continue();
      });
      const response = await page.goto(url.href, { waitUntil: 'load', timeout: 60000 });
      if (!response?.ok()) throw new Error(`Page returned ${response?.status()}`);
      await page.addStyleTag({ content: `${hiddenControls}{visibility:hidden!important;pointer-events:none!important}` });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(waits[piece.slug] || wait);
      const directory = join(output, 'rendered', piece.slug);
      await mkdir(directory, { recursive: true });
      const type = extname(piece.thumbnail) === '.png' ? 'png' : 'jpeg';
      const destination = join(directory, piece.thumbnail);
      await page.screenshot({ path: destination, type, ...(type === 'jpeg' && { quality: 88 }), timeout: 60000 });
      const result = { ...piece, url: url.href, size, errors, failures, capturedAt: new Date().toISOString(), file: destination };
      results.push(result);
      console.log(`${results.length}/${pieces.length} ${piece.slug}${errors.length || failures.length ? ' — REVIEW ERRORS' : ''}`);
    } catch (error) {
      results.push({ ...piece, error: error.message, errors, failures });
      console.error(`FAILED ${piece.slug}: ${error.message}`);
    } finally {
      await context.close();
    }
    await writeFile(join(output, 'report.json'), JSON.stringify(results, null, 2) + '\n');
  }
}
try {
  await Promise.all([worker(), worker()]);
} finally {
  await browser.close();
}
if (results.some(result => result.error || result.errors.length || result.failures.length)) {
  process.exitCode = 1;
  console.error(`Review ${join(output, 'report.json')} before replacing thumbnails.`);
} else if (args.includes('--write')) {
  for (const result of results) {
    await access(result.file);
    await copyFile(result.file, join(root, 'pieces', result.slug, result.thumbnail));
  }
  console.log(`Updated ${results.length} thumbnails. Backups: ${join(output, 'backup')}`);
}
console.log(`Capture output: ${output}`);
