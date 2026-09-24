// Check the shipped composer and renderer without a browser dependency.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../pieces/019-city-of-signs/city.js', import.meta.url), 'utf8');
const events = {};
let geometryCalls = 0;
const context = new Proxy({}, {
  get: (_, method) => (...args) => {
    geometryCalls++;
    for (const arg of args) if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `${method} has finite geometry`);
    if (method === 'ellipse') assert.ok(args[2] >= 0 && args[3] >= 0, 'nonnegative ellipse radii');
  },
  set: () => true
});
const canvas = { getContext: () => context, dataset: {}, addEventListener: (name, callback) => events[name] = callback };
const env = {
  document: { getElementById: () => canvas }, location: { search: '?seed=1907' }, URLSearchParams, Math,
  innerWidth: 1254, innerHeight: 1254, devicePixelRatio: 2,
  addEventListener: (name, callback) => events[name] = callback
};
vm.createContext(env);
vm.runInContext(source.replace(/\}\)\(\);\s*$/, 'globalThis.test = { compose, drawCity, blocks, library, resize, profileAt, contentBox, drawBlock, scaffoldLifts }; })();'), env);
const { compose, drawCity, blocks, library, profileAt, contentBox, drawBlock, scaffoldLifts } = env.test;
const roles = ['base', 'chamber', 'crown', 'connector'];
assert.equal(new Set(blocks.map(b => b.id)).size, blocks.length);
for (const role of roles) assert.ok(blocks.some(b => b.role === role), role);
const rejected = new Set(['crane-roof', 'external-stair', 'fan', 'swell', 'striped-orb', 'basement-entry', 'public-concourse']);
const active = blocks.filter(b => !b.catalogOnly);
assert.ok(active.every(b => !rejected.has(b.id)), 'rejected blocks are excluded');
assert.ok(!library['crane-roof'], 'crane removed from the catalog');
assert.ok(!library['external-stair'], 'switchback stair removed from the catalog');
assert.equal(new Set(active.map(b => b.catalogNumber)).size, active.length, 'review numbers are unique');
for (const [number, id] of [[3,'tenant-entry'],[5,'scaffold-lifts'],[9,'water-tank'],[11,'plant-room'],[15,'porthole-bays'],[16,'conduit-wall'],[21,'commercial-front'],[22,'stepped-terraces'],[23,'duct-deck']])
  assert.equal(library[id].catalogNumber, number, 'review number survives replacements');
for (const h of [28, 60, 100, 240, 425, 900]) {
  const decks = scaffoldLifts(h);
  assert.ok(decks.length >= 3, 'a scaffold carries at least two lifts');
  assert.equal(decks[0], 0);
  assert.ok(Math.abs(decks[decks.length - 1] - h) < 0.00001, 'the frame reaches both edges, so stacked blocks meet');
  for (let i = 0; i < decks.length - 1; i++)
    assert.ok(decks[i + 1] > decks[i], 'deck levels rise in order');
}
const used = new Set(), featuresSeen = new Set();
let layouts = 0;
for (const [w, h] of [[1254, 1254], [1440, 900], [390, 844], [320, 1800], [2560, 720], [1, 1]]) {
  for (let seed = 0; seed < 80; seed++) {
    const city = compose(w, h, seed);
    assert.equal(JSON.stringify(city), JSON.stringify(compose(w, h, seed)), 'seed reproduces composition');
    assert.ok(city.towers.length >= 2 && city.towers.length <= 24, 'building count follows from the bay size');
    assert.ok(city.towers.every(t => t.profile !== 'curve'), 'swelling silhouettes are retired');
    assert.ok(city.towers.every(t => t.paper === '#fff' && t.ink === '#000'), 'sunlit walls keep a consistent palette across buildings');
    const features = new Set();
    let right = Math.min(w, h) * 0.009;
    // One bay is the same width for every building in a composition, so a
    // window is drawn at one size whether its building is narrow or broad.
    const bayWidths = city.towers.map(t => t.w / t.bays);
    for (const bw of bayWidths) {
      assert.ok(Math.abs(bw - bayWidths[0]) < 0.00001, 'every building uses the same bay width');
      assert.ok(bw > 0 && Number.isFinite(bw), 'bay width is positive and finite');
    }
    for (const tower of city.towers) {
      assert.ok(Number.isInteger(tower.bays) && tower.bays >= 1 && tower.bays <= 4, 'buildings are a whole number of bays');
      assert.ok(Math.abs(tower.w - bayWidths[0] * tower.bays) < 0.00001, 'building width is its bay count');
      assert.ok(Math.abs(tower.x - right) < 0.00001, 'bays meet without gaps or overlap');
      right += tower.w;
      assert.ok(tower.w > 0 && tower.top > tower.crownTop && tower.baseTop > tower.top);
      assert.ok(tower.baseLine <= h && tower.crownTop >= 0);
      if (tower.bays === 1) assert.ok(library[tower.base].narrow && library[tower.crown].narrow, 'single-bay buildings only take blocks that fit one bay');
      assert.equal(library[tower.base].role, 'base');
      assert.equal(library[tower.base].collection, 'tokyo', 'street level uses the Tokyo block vocabulary');
      assert.ok(!library[tower.crown].catalogOnly, 'legacy roof ornaments remain in the archive');
      assert.equal(library[tower.crown].role, 'crown');
      used.add(tower.base); used.add(tower.crown);
      let y = tower.top;
      for (const block of tower.modules) {
        assert.equal(library[block.id].role, 'chamber', 'storefronts never appear upstairs');
        assert.ok(!library[block.id].catalogOnly, 'archived chambers do not leak into the city');
        assert.ok(Math.abs(block.y - y) < 0.00001 && block.h > 0);
        assert.ok(block.ink !== block.paper);
        assert.ok(['#000', '#fff'].includes(block.ink));
        const box = contentBox(tower, block);
        assert.ok(box.w > 0 && Number.isFinite(box.x), 'usable content width inside tower profile');
        for (let i = 0; i <= 20; i++) {
          const t = (block.y + block.h * (0.02 + i * 0.048) - tower.top) / (tower.baseTop - tower.top);
          const [left, right] = profileAt(tower, t);
          assert.ok(box.x >= left - 0.00001 && box.x + box.w <= right + 0.00001, 'openings fit curved and stepped exteriors');
        }
        features.add(block.id); used.add(block.id); y += block.h;
      }
      assert.ok(Math.abs(y - tower.baseTop) < 0.00001, 'stack stops at its dedicated base');
    }
    assert.ok(right <= w + 0.00001);
    // A small canvas holds fewer broad buildings than there are feature
    // facades, so each composition carries at least one and the sweep as a
    // whole must reach all three.
    const present = ['commercial-front', 'scaffold-lifts', 'stepped-terraces'].filter(f => features.has(f));
    assert.ok(present.length >= 1, 'every composition carries a feature facade');
    for (const f of present) featuresSeen.add(f);
    for (const connector of city.connectors) {
      assert.equal(library[connector.id].role, 'connector'); used.add(connector.id);
      assert.ok(connector.x >= 0 && connector.x + connector.w <= w + 0.00001, 'connections stay within the canvas');
      assert.ok(connector.y >= 0 && connector.y + connector.h < city.towers[0].baseLine, 'connections stay above the ground');
    }
    assert.ok(!('courts' in city), 'secondary rooms cannot overlay and slice complete facade blocks');
    drawCity(city, w, h); layouts++;
  }
}
for (const feature of ['commercial-front', 'scaffold-lifts', 'stepped-terraces'])
  assert.ok(featuresSeen.has(feature), `${feature} appears across the sweep`);
for (const block of blocks) {
  if (!block.catalogOnly) assert.ok(used.has(block.id), `${block.id} is reachable by the composer`);
  // Studies remain renderable in the catalog, even when not used in a city.
  for (const [w, h] of [[150, 240], [40, 170], [280, 80]])
    drawBlock({ id: block.id, x: 0, y: 0, w, h, ink: '#000', paper: '#fff', variant: 1 });
}
assert.equal(canvas.dataset.seed, '1907');
const beforeClick = canvas.dataset.seed; events.click(); assert.notEqual(canvas.dataset.seed, beforeClick);
for (const key of ['Enter', ' ']) {
  const before = canvas.dataset.seed;
  let prevented = false;
  events.keydown({ key, preventDefault: () => prevented = true });
  assert.ok(prevented); assert.notEqual(canvas.dataset.seed, before);
}
const beforeResize = canvas.dataset.seed;
env.innerWidth = 390; env.innerHeight = 844; events.resize();
assert.equal(canvas.dataset.seed, beforeResize, 'resize preserves seed');
assert.equal(canvas.width, 780); assert.equal(canvas.height, 1688);
console.log(`Passed ${layouts} seeded layouts, ${blocks.length} catalog blocks, ${geometryCalls} finite drawing calls; Tokyo blocks, whole facade blocks, ground-only bases, three feature chambers, deterministic layout, click/keyboard regeneration and DPR resize.`);
