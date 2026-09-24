// Geometry and lifecycle checks against the shipped sketch, with a canvas stub.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../pieces/052-negative-fill/negative-fill.js', import.meta.url), 'utf8');
function simulation(width, height, seed = 'negative-fill', reduced = false) {
  const noop = () => {}, events = {}, frames = new Map();
  const context = new Proxy({}, { get: (_, k) => k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }) : noop, set: () => true });
  const surface = () => ({ getContext: () => context, addEventListener: (k, fn) => events[k] = fn, dataset: {} });
  const canvas = surface();
  let id = 0;
  const env = { Math, URLSearchParams, location: { search: `?seed=${seed}` }, innerWidth: width, innerHeight: height, devicePixelRatio: 1,
    document: { getElementById: () => canvas, createElement: surface, hidden: false, addEventListener: (k, fn) => events[k] = fn },
    addEventListener: (k, fn) => events[k] = fn, matchMedia: () => ({ matches: reduced, addEventListener: noop }),
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; }, cancelAnimationFrame: i => frames.delete(i), setTimeout: noop, clearTimeout: noop };
  vm.createContext(env);
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, `globalThis.test = { fit, finish, get grid() { return grid; }, get pockets() { return pockets; }, get strokes() { return strokes; }, get pens() { return pens; }, get completed() { return completed; } }; })();`), env);
  return { env, events, canvas, frames, sketch: env.test,
    advance(time) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(time)); },
    key(key) { events.keydown({ key, preventDefault: noop }); } };
}

let samples = 0;
for (const [w, h] of [[390, 844], [1440, 900], [2560, 720], [320, 1800], [1, 1]]) {
  for (const seed of ['negative-fill', 'silver', 'waves']) {
    const sim = simulation(w, h, seed, true);
    assert.equal(sim.canvas.dataset.state, 'complete');
    assert.equal(sim.frames.size, 0);
    const assigned = sim.sketch.pens.flatMap(p => p.queue);
    assert.equal(new Set(assigned).size, sim.sketch.strokes.length, 'every mark belongs to exactly one pen');
    assert.equal(assigned.length, sim.sketch.strokes.length, 'all marks are scheduled');
    if (w > 10) {
      const kinds = new Set(sim.sketch.strokes.map(s => s.kind));
      for (const kind of ['curl', 'fan', 'silver', 'dot']) assert.ok(kinds.has(kind), kind + ' is present');
      const reserved = sim.sketch.grid.filter(n => n === 2).length / sim.sketch.grid.length;
      assert.ok(reserved > 0.01 && reserved < 0.3, 'open pockets survive');
      assert.ok(sim.sketch.grid.filter(n => n === 0).length / sim.sketch.grid.length < 0.15, 'pattern covers the surrounding paper');
    }
    for (const stroke of sim.sketch.strokes) {
      assert.ok(stroke.length > 0 && Number.isFinite(stroke.length));
      for (let i = 0; i < stroke.points.length; i++) {
        const p = stroke.points[i]; samples++;
        assert.ok(p.every(Number.isFinite), 'finite geometry');
        assert.ok(p[0] >= 0 && p[0] < w + 2 && p[1] >= 0 && p[1] < h + 2, 'marks stay inside the surface');
        if (i) assert.ok(p[2] >= stroke.points[i - 1][2], 'monotonic pen distance');
        for (const pocket of sim.sketch.pockets) assert.ok(Math.hypot(p[0] - pocket.x, p[1] - pocket.y) >= pocket.radius - 1.5, 'pocket center remains unmarked');
      }
    }
  }
}
const sim = simulation(390, 844);
assert.equal(JSON.stringify(sim.sketch.strokes), JSON.stringify(simulation(390, 844).sketch.strokes), 'seed reproduces geometry');
const snapshot = () => JSON.stringify(sim.sketch.pens.map(p => [p.current, p.distance]));
sim.advance(1000); sim.advance(1050);
assert.equal(sim.sketch.pens.length, 24);
assert.ok(sim.sketch.pens.every(p => p.distance > 0 || p.current > 0), 'all pens start drawing');
sim.key(' '); const pausedAt = snapshot();
assert.equal(sim.canvas.dataset.state, 'paused'); assert.equal(sim.frames.size, 0);
sim.key(' '); sim.advance(3000); assert.equal(snapshot(), pausedAt, 'resume does not fast-forward');
sim.advance(3050); assert.notEqual(snapshot(), pausedAt);
sim.env.document.hidden = true; sim.events.visibilitychange(); assert.equal(sim.frames.size, 0);
const hiddenAt = snapshot();
sim.env.document.hidden = false; sim.events.visibilitychange(); sim.advance(9000); assert.equal(snapshot(), hiddenAt);
sim.key(' '); sim.env.innerWidth = 1440; sim.env.innerHeight = 900; sim.sketch.fit(true);
assert.equal(sim.canvas.dataset.state, 'paused');
sim.key('f'); assert.equal(sim.canvas.dataset.state, 'complete'); assert.equal(sim.frames.size, 0);
sim.env.innerWidth = 390; sim.env.innerHeight = 844; sim.sketch.fit(true);
assert.equal(sim.canvas.dataset.state, 'complete');
sim.key('r'); assert.equal(sim.canvas.dataset.state, 'growing'); assert.notEqual(sim.canvas.dataset.seed, 'negative-fill');
const beforeTap = sim.canvas.dataset.seed; sim.events.click(); assert.notEqual(sim.canvas.dataset.seed, beforeTap);
const tiny = simulation(150, 150);
const planned = new Set(tiny.sketch.strokes);
let time = 0;
while (tiny.frames.size && time < 1000000) { tiny.advance(time); time += 50; }
assert.equal(tiny.canvas.dataset.state, 'complete'); assert.equal(tiny.frames.size, 0);
// Idle pens take work from whoever has most left. Marks move between queues,
// so the set must still be every mark exactly once, each drawn exactly once.
const drawn = tiny.sketch.pens.flatMap(p => p.queue);
assert.equal(drawn.length, tiny.sketch.strokes.length, 'stealing neither loses nor duplicates a mark');
assert.equal(new Set(drawn).size, planned.size, 'every planned mark ends in exactly one queue');
assert.ok(drawn.every(s => planned.has(s)), 'no mark is invented while stealing');
assert.equal(tiny.sketch.completed, planned.size, 'every mark is drawn once');
assert.ok(tiny.sketch.pens.every(p => p.current === p.queue.length), 'no pen is left holding work');
console.log(`Passed: ${samples} path points across 15 seeded layouts; motif coverage, reserved negative space, determinism, concurrent growth, pause, visibility, finish, resize, restart, tap, natural completion.`);
