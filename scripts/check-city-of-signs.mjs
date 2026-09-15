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
vm.runInContext(source.replace(/\}\)\(\);\s*$/, 'globalThis.test = { compose, drawCity, blocks, library, resize }; })();'), env);
const { compose, drawCity, blocks, library } = env.test;
const roles = ['base', 'chamber', 'crown', 'connector'];
assert.equal(new Set(blocks.map(b => b.id)).size, blocks.length);
for (const role of roles) assert.ok(blocks.some(b => b.role === role), role);
const used = new Set();
let layouts = 0;
for (const [w, h] of [[1254, 1254], [1440, 900], [390, 844], [320, 1800], [2560, 720], [1, 1]]) {
  for (let seed = 0; seed < 80; seed++) {
    const city = compose(w, h, seed);
    assert.equal(JSON.stringify(city), JSON.stringify(compose(w, h, seed)), 'seed reproduces composition');
    assert.ok(city.towers.length >= 5 && city.towers.length <= 22);
    const features = new Set();
    let right = Math.min(w, h) * 0.009;
    for (const tower of city.towers) {
      assert.ok(Math.abs(tower.x - right) < 0.00001, 'bays meet without gaps or overlap');
      right += tower.w;
      assert.ok(tower.w > 0 && tower.top > tower.crownTop && tower.baseTop > tower.top);
      assert.ok(tower.baseLine <= h && tower.crownTop >= 0);
      assert.equal(library[tower.base].role, 'base');
      assert.equal(library[tower.crown].role, 'crown');
      used.add(tower.base); used.add(tower.crown);
      let y = tower.top;
      for (const block of tower.modules) {
        assert.equal(library[block.id].role, 'chamber', 'storefronts never appear upstairs');
        assert.ok(Math.abs(block.y - y) < 0.00001 && block.h > 0);
        assert.ok(block.ink !== block.paper);
        assert.ok(['#000', '#fff'].includes(block.ink));
        features.add(block.id); used.add(block.id); y += block.h;
      }
      assert.ok(Math.abs(y - tower.baseTop) < 0.00001, 'stack stops at its dedicated base');
    }
    assert.ok(right <= w + 0.00001);
    for (const feature of ['fan', 'folding-stair', 'swell']) assert.ok(features.has(feature), `${feature} survives every aspect ratio`);
    for (const connector of city.connectors) {
      assert.equal(library[connector.id].role, 'connector'); used.add(connector.id);
    }
    drawCity(city, w, h); layouts++;
  }
}
for (const block of blocks) assert.ok(used.has(block.id), `${block.id} is reachable by the composer`);
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
console.log(`Passed ${layouts} seeded layouts, ${blocks.length} reachable blocks, ${geometryCalls} finite drawing calls; ground-only bases, three feature chambers, deterministic layout, click/keyboard regeneration and DPR resize.`);
