// Exercise the shipped planner through repeated build/recovery cycles.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../pieces/056-micro-tetris/', import.meta.url);
const recipes = fs.readFileSync(new URL('recipes.js', root), 'utf8');
const source = fs.readFileSync(new URL('tetris.js', root), 'utf8').replace(/\}\)\(\);\s*$/, `
  globalThis.check = { advance,
    get hot() { return hot; }, get cycles() { return cycles; },
    get cleared() { return cleared; }, get lanes() { return lanes; },
    get board() { return board; } };
})();`);

for (const [width, height] of [[390, 844], [1200, 800], [7, 24], [1, 16]]) {
  let seed = 56;
  const math = Object.create(Math);
  math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const context = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {}, fillRect() {} };
  const canvas = { getContext: () => context, addEventListener() {}, setAttribute() {}, dataset: {} };
  const env = { Math: math, window: {}, document: { querySelector: () => canvas, hidden: false },
    innerWidth: width, innerHeight: height, matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame() {}, addEventListener() {}, setTimeout, clearTimeout };
  vm.createContext(env);
  vm.runInContext(recipes, env);
  vm.runInContext(source, env);
  assert.equal(canvas.width, width);
  assert.equal(canvas.height, height);
  assert.ok(env.check.board.some(value => value !== 0), 'starts partially filled');
  let sawHot = false, peak = 0;
  for (let i = 0; i < 18000; i++) {
    // The shipped lock() rejects any overlap or out-of-bounds placement.
    env.check.advance(.05);
    sawHot ||= env.check.hot;
    const highest = Math.max(...env.check.lanes.map(lane => lane.base + 4));
    peak = Math.max(peak, highest);
    assert.ok(highest < height, 'never reaches the top');
  }
  assert.ok(env.check.cleared > height, 'clears more than a screen of full-width rows');
  if (width >= 4) {
    assert.ok(sawHot, 'enters a hot streak');
    assert.ok(env.check.cycles >= 2, 'recovers and repeats');
  }
  console.log(`${width} × ${height}: 15 minutes, ${env.check.cycles} recovery cycles, ${env.check.cleared} rows cleared, peak ${peak}px; no overlaps or top-out`);
}
