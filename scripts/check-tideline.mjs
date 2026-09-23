// Wave geometry, dye deposits and lifecycle checks against the shipped sketch, with a canvas stub.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../pieces/054-tideline/tideline.js', import.meta.url), 'utf8');
function simulation(width, height, seed = 'tideline', reduced = false) {
  const noop = () => {}, events = {}, frames = new Map(), calls = [];
  const context = () => {
    const count = {};
    calls.push(count);
    return new Proxy({ count }, { get: (target, k) => k === 'count' ? target.count : k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) })
      : (...args) => { count[k] = (count[k] || 0) + 1; return k === 'createPattern' ? {} : undefined; }, set: () => true });
  };
  const surface = () => { const c = context(); return { getContext: () => c, addEventListener: (k, fn) => events[k] = fn, dataset: {}, width: 0, height: 0 }; };
  const canvas = surface();
  let id = 0;
  const env = { Math, URLSearchParams, location: { search: `?seed=${seed}` }, innerWidth: width, innerHeight: height, devicePixelRatio: 2,
    document: { getElementById: () => canvas, createElement: surface, hidden: false, addEventListener: (k, fn) => events[k] = fn },
    addEventListener: (k, fn) => events[k] = fn, matchMedia: () => ({ matches: reduced, addEventListener: noop }),
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; }, cancelAnimationFrame: i => frames.delete(i), setTimeout: noop, clearTimeout: noop };
  vm.createContext(env);
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, `globalThis.test = { fit, fastForward, summon, shoreAt, seaAt, frontAt, reachAt,
    get waves() { return waves; }, get history() { return history; }, get launched() { return launched; }, get clock() { return clock; },
    get columns() { return columns; }, get sea() { return sea; }, get stain() { return stainCtx.count; } }; })();`), env);
  return { env, events, canvas, frames, calls, sketch: env.test,
    advance(time) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(time)); },
    run(seconds, fps = 30) { let t = this.time || 0; for (let i = 0; i < seconds * fps; i++) { t += 1000 / fps; this.advance(t); } this.time = t; },
    key(key) { events.keydown({ key, preventDefault: noop }); } };
}

let samples = 0;
for (const [w, h] of [[390, 844], [1440, 900], [2560, 720], [320, 1800], [1, 1]]) {
  for (const seed of ['tideline', 'madder', 'indigo']) {
    const sim = simulation(w, h, seed, true);
    assert.equal(sim.canvas.dataset.state, 'still');
    assert.equal(sim.frames.size, 0, 'reduced motion never animates');
    assert.equal(sim.sketch.launched, 30, 'a still shore already carries thirty waves');
    assert.equal(sim.sketch.waves.length, 0);
    assert.ok(sim.sketch.stain.fill >= 30 * 15 && sim.sketch.stain.stroke >= 30, 'every wave deposits its bands and rim');
    assert.ok(sim.sketch.history.length > 0 && sim.sketch.history.length <= 6, 'only the last few patches are still drying');
    for (const wave of sim.sketch.history) {
      assert.ok(wave.reach >= 0.06 && wave.reach <= 1.2 && wave.up > 0 && wave.down > wave.up, 'plausible run-up and timing');
      assert.ok(wave.lobes.length >= 2 && wave.lobes.every(l => l.c >= 0 && l.c <= 1 && l.s > 0), 'lobes span the width');
      assert.ok(wave.color.every(Number.isFinite));
      const seaLine = sim.sketch.seaAt(wave.peak, new Float32Array(sim.sketch.columns));
      for (let i = 0; i < sim.sketch.columns; i++) {
        samples++;
        assert.ok(Number.isFinite(wave.crest[i]), 'finite crest');
        assert.ok(wave.crest[i] <= seaLine[i] + 0.01 && wave.crest[i] > -0.3 * h - 10, 'the crest lies up the shore from the sea');
        if (i) assert.ok(Math.abs(wave.crest[i] - wave.crest[i - 1]) < 0.12 * h + 3, 'the front is continuous');
      }
    }
    for (const t of [0, 80, 160, 240]) assert.ok(sim.sketch.shoreAt(t) >= 0.85 * h - 0.01 && sim.sketch.shoreAt(t) <= 0.92 * h + 0.01, 'the tide stays near the foot');
  }
}
const a = simulation(1440, 900, 'tideline', true), b = simulation(1440, 900, 'tideline', true);
const record = sim => JSON.stringify(sim.sketch.history.map(w => [w.color, w.reach, w.lobes, Array.from(w.crest)]));
assert.equal(record(a), record(b), 'a seed reproduces the same waves');
assert.notEqual(record(a), record(simulation(1440, 900, 'weld', true)), 'another seed differs');

const sim = simulation(1440, 900);
assert.equal(sim.canvas.dataset.state, 'running'); assert.equal(sim.sketch.launched, 0);
sim.run(1);
assert.equal(sim.sketch.launched, 1, 'the first wave sets out within a second');
const first = sim.sketch.waves[0];
assert.ok(first.reach >= 0.42, 'the opening wave is a proper one');
let previousRise = -1;
for (let s = 0; s < 8; s++) {
  sim.run(0.5);
  const tau = sim.sketch.clock - first.born, rise = sim.sketch.reachAt(first, tau);
  if (tau < first.up) assert.ok(rise > previousRise, 'the uprush keeps climbing');
  previousRise = rise;
  for (let i = 0; i < sim.sketch.columns; i += 7) { samples++; assert.ok(first.front[i] <= sim.sketch.sea[i] + 0.01 && Number.isFinite(first.front[i])); }
}
sim.run(first.up + 0.2 - (sim.sketch.clock - first.born));
assert.ok(first.crest, 'the wave turns at the top of its run and leaves its dye');
assert.ok(sim.sketch.history.includes(first));
assert.equal(sim.sketch.reachAt(first, first.up + first.down), 0, 'the backwash returns to the sea');
const deposits = sim.sketch.stain.fill;
sim.run(first.down + 0.5);
assert.ok(!sim.sketch.waves.includes(first), 'a drained wave is retired');
assert.ok(sim.sketch.history.includes(first), 'its wet patch is still drying');
sim.run(30);
assert.ok(!sim.sketch.history.includes(first), 'and dries out within half a minute');
assert.ok(sim.sketch.launched >= 4 && sim.sketch.stain.fill > deposits, 'waves keep arriving and staining');

sim.key(' '); const pausedAt = sim.sketch.clock;
assert.equal(sim.canvas.dataset.state, 'paused'); assert.equal(sim.frames.size, 0);
sim.key(' '); sim.run(2); assert.ok(sim.sketch.clock - pausedAt > 1.5 && sim.sketch.clock - pausedAt < 2.2, 'resume does not fast-forward');
sim.env.document.hidden = true; sim.events.visibilitychange(); assert.equal(sim.frames.size, 0);
const hiddenAt = sim.sketch.clock;
sim.env.document.hidden = false; sim.events.visibilitychange(); sim.run(1); assert.ok(sim.sketch.clock - hiddenAt < 1.2, 'a hidden tab does not advance');

const before = { launched: sim.sketch.launched, clock: sim.sketch.clock };
sim.env.innerWidth = 390; sim.env.innerHeight = 844; sim.sketch.fit(true);
assert.equal(sim.sketch.columns, Math.ceil(390 / 3) + 1);
assert.equal(sim.sketch.launched, before.launched); assert.equal(sim.sketch.clock, before.clock);
assert.ok(sim.sketch.stain.drawImage >= 1, 'the stained sand is carried over to the new size');
assert.equal(sim.canvas.dataset.state, 'running');
sim.run(1);

const launchedBefore = sim.sketch.launched;
sim.key('f'); assert.equal(sim.sketch.launched, launchedBefore + 12, 'F skips ahead a dozen waves');
sim.key('Enter'); assert.equal(sim.sketch.launched, launchedBefore + 13, 'Enter sends a wave');
sim.events.click({ clientX: 100, clientY: 300 });
const aimed = sim.sketch.waves.at(-1);
assert.equal(sim.sketch.launched, launchedBefore + 14, 'a tap sends a wave');
const lobe = aimed.lobes.reduce((p, q) => Math.abs(p.c - 100 / 390) < Math.abs(q.c - 100 / 390) ? p : q);
assert.ok(Math.abs(lobe.c - 100 / 390) < 1e-6 && lobe.h === 1, 'the tapped spot gets the tallest lobe');
const crest = sim.sketch.frontAt(aimed, aimed.up, sim.sketch.seaAt(aimed.born + aimed.up, new Float32Array(sim.sketch.columns)), new Float32Array(sim.sketch.columns));
assert.ok(Math.abs(crest[Math.round(100 / 3)] - 300) < 0.08 * 844, 'and the wave reaches about that height');

sim.key(' ');
sim.events.click({ clientX: 200, clientY: 200 });
const pausedWave = sim.sketch.waves.at(-1);
for (let i = 0; i < sim.sketch.columns; i += 5) assert.ok(Math.abs(pausedWave.front[i] - sim.sketch.sea[i]) < 0.01, 'a wave sent while paused starts at the sea line');
sim.key(' ');
sim.key('r');
assert.notEqual(sim.canvas.dataset.seed, 'tideline'); assert.equal(sim.sketch.launched, 0); assert.equal(sim.sketch.clock, 0);
assert.equal(sim.canvas.dataset.state, 'running');

const still = simulation(390, 844, 'tideline', true);
still.events.click({ clientX: 200, clientY: 400 });
assert.equal(still.sketch.launched, 31); assert.equal(still.sketch.waves.length, 0, 'a still shore stamps a tapped wave at once');
assert.equal(still.frames.size, 0);

const long = simulation(1440, 900, 'long');
long.run(600, 20);
assert.ok(long.sketch.launched > 55 && long.sketch.launched < 140, `ten minutes brings a steady procession (${long.sketch.launched})`);
assert.ok(long.sketch.waves.length <= 5 && long.sketch.history.length <= 8, 'nothing accumulates but dye');
assert.ok(long.sketch.history.every(w => long.sketch.clock - w.peak < 26));
console.log(`Passed: ${samples} front samples across 15 still layouts and live runs; deposits, determinism, uprush and backwash, drying, pause, visibility, resize, skip, Enter, tap aim, paused tap, restart, ten-minute run.`);
