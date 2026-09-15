// Geometry and lifecycle checks against the shipped sketch, with a canvas stub.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../pieces/051-agate/agate.js', import.meta.url), 'utf8');
function simulation(width, height, seed = 'agate', reduced = false) {
  const noop = () => {}, events = {}, frames = new Map();
  const context = new Proxy({}, { get: (_, k) => k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }) : noop, set: () => true });
  const surface = () => ({ getContext: () => context, addEventListener: noop, dataset: {} });
  const canvas = surface();
  let id = 0;
  const env = { Math, URLSearchParams, location: { search: `?seed=${seed}` }, innerWidth: width, innerHeight: height, devicePixelRatio: 1,
    document: { getElementById: () => canvas, createElement: surface, hidden: false, addEventListener: (k, fn) => events[k] = fn },
    addEventListener: (k, fn) => events[k] = fn, matchMedia: () => ({ matches: reduced, addEventListener: noop }),
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; }, cancelAnimationFrame: i => frames.delete(i), setTimeout: noop, clearTimeout: noop };
  vm.createContext(env);
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, `globalThis.test = { fit, finish, get cells() { return cells; }, get strokes() { return strokes; }, get pens() { return pens; }, get completed() { return completed; } }; })();`), env);
  return { env, events, canvas, frames, sketch: env.test,
    advance(time) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(time)); },
    key(key) { events.keydown({ key, preventDefault: noop }); } };
}
function contains(poly, x, y) {
  return poly.every((p, i) => { const q = poly[(i + 1) % poly.length]; return (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]) >= -1e-6; });
}
let samples = 0;
for (const [w, h] of [[390, 844], [1440, 900], [2560, 720], [320, 1800]]) {
  for (const seed of ['agate', 'stone', 'bands']) {
    const sim = simulation(w, h, seed, true);
    assert.equal(sim.canvas.dataset.state, 'complete');
    assert.equal(sim.frames.size, 0);
    const assigned = sim.sketch.pens.flatMap(p => p.queue);
    assert.equal(new Set(assigned).size, sim.sketch.strokes.length, 'each spiral belongs to exactly one pen');
    assert.equal(assigned.length, sim.sketch.strokes.length, 'all spirals are scheduled');
    for (let y = 0; y <= h; y += 23) for (let x = 0; x <= w; x += 23) {
      assert.ok(sim.sketch.cells.some(p => contains(p, x, y)), `uncovered cell at ${x},${y}`); samples++;
    }
    for (const x of [0, w]) for (const y of [0, h]) assert.ok(sim.sketch.cells.some(p => contains(p, x, y)));
    for (const stroke of sim.sketch.strokes) {
      assert.ok(stroke.length > 0 && Number.isFinite(stroke.length));
      const parent = sim.sketch.cells.find(poly => contains(poly, ...stroke.points[0]));
      assert.ok(parent);
      for (let i = 0; i < stroke.points.length; i++) {
        const p = stroke.points[i];
        assert.ok(p.every(Number.isFinite), 'finite geometry');
        assert.ok(contains(parent, ...p), 'spiral stays in its own cell');
        if (i) assert.ok(p[2] >= stroke.points[i - 1][2], 'monotonic pen distance');
      }
    }
  }
}
const sim = simulation(390, 844);
const duplicate = simulation(390, 844);
assert.equal(JSON.stringify(sim.sketch.strokes), JSON.stringify(duplicate.sketch.strokes), 'seed reproduces geometry');
sim.advance(1000); sim.advance(1050);
assert.equal(sim.sketch.pens.length, 6, 'six simultaneous drawing points on mobile');
assert.ok(sim.sketch.pens.every(p => p.distance === 14 && p.current === 0), 'every pen starts immediately at 280 CSS pixels per second');
assert.equal(sim.sketch.completed, 0, 'each pen draws its own continuous spiral');
const starts = sim.sketch.pens.map(p => p.queue[0].points[0]);
assert.ok(Math.max(...starts.map(p => p[0])) - Math.min(...starts.map(p => p[0])) > 390 * 0.6, 'starts span the width');
assert.ok(Math.max(...starts.map(p => p[1])) - Math.min(...starts.map(p => p[1])) > 844 * 0.6, 'starts span the height');
sim.key(' ');
assert.equal(sim.canvas.dataset.state, 'paused'); assert.equal(sim.frames.size, 0);
sim.key(' '); sim.advance(3000); sim.advance(3050);
assert.ok(sim.sketch.pens.every(p => p.distance === 28), 'pause does not fast-forward any pen');
sim.env.document.hidden = true; sim.events.visibilitychange(); assert.equal(sim.frames.size, 0);
sim.env.document.hidden = false; sim.events.visibilitychange(); sim.advance(9000); sim.advance(9050);
assert.ok(sim.sketch.pens.every(p => p.distance === 42), 'hidden time does not fast-forward any pen');
const fraction = sim.sketch.pens.reduce((sum, p) => sum + p.distance / p.queue[0].length, 0) / sim.sketch.strokes.length;
sim.key(' '); sim.env.innerWidth = 1440; sim.env.innerHeight = 900; sim.sketch.fit(true);
assert.equal(sim.canvas.dataset.state, 'paused', 'resize preserves pause');
assert.equal(sim.sketch.pens.length, 12, 'desktop uses twelve pens');
const resizedFraction = sim.sketch.pens.reduce((sum, p) => sum + p.current + p.distance / p.queue[p.current].length, 0) / sim.sketch.strokes.length;
assert.ok(Math.abs(fraction - resizedFraction) < 1e-8, 'resize restores all growth fronts at the existing fraction');
sim.key('f'); assert.equal(sim.canvas.dataset.state, 'complete'); assert.equal(sim.frames.size, 0);
sim.env.innerWidth = 1440; sim.env.innerHeight = 900; sim.sketch.fit(true);
assert.equal(sim.canvas.dataset.state, 'complete'); assert.equal(sim.canvas.width, 1440);
sim.key('r'); assert.equal(sim.canvas.dataset.state, 'growing'); assert.notEqual(sim.canvas.dataset.seed, 'agate');
// A small real timeline reaches completion without requesting a further frame.
const tiny = simulation(150, 150);
let time = 0;
while (tiny.frames.size && time < 1000000) { tiny.advance(time); time += 50; }
assert.equal(tiny.canvas.dataset.state, 'complete'); assert.equal(tiny.frames.size, 0);
console.log(`Passed: ${samples} coverage samples across 12 layouts; contained spirals, deterministic seeds, concurrent pen speed and spatial distribution, pause, visibility, finish, resize, restart, natural completion.`);
