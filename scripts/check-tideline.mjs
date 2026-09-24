// Two-shore wave geometry, dye deposits and lifecycle checks against the
// shipped sketch, with a canvas stub.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../pieces/054-tideline/tideline.js', import.meta.url), 'utf8');
function simulation(width, height, seed = 'tideline', reduced = false) {
  const noop = () => {}, events = {}, frames = new Map();
  const context = () => {
    const count = {};
    return new Proxy({ count }, { get: (target, k) => k === 'count' ? target.count : k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) })
      : (...args) => { count[k] = (count[k] || 0) + 1; return k === 'createPattern' ? { pattern: true } : undefined; }, set: () => true });
  };
  const surface = () => { const c = context(); return { getContext: () => c, addEventListener: (k, fn) => events[k] = fn, dataset: {}, width: 0, height: 0 }; };
  const canvas = surface();
  let id = 0;
  const env = { Math, URLSearchParams, location: { search: `?seed=${seed}` }, innerWidth: width, innerHeight: height, devicePixelRatio: 2,
    document: { getElementById: () => canvas, createElement: surface, hidden: false, addEventListener: (k, fn) => events[k] = fn },
    addEventListener: (k, fn) => events[k] = fn, matchMedia: () => ({ matches: reduced, addEventListener: noop }),
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; }, cancelAnimationFrame: i => frames.delete(i), setTimeout: noop, clearTimeout: noop };
  vm.createContext(env);
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, `globalThis.test = { fit, fastForward, shoreAt, seaAt, frontAt, reachAt,
    get shores() { return shores; }, get waves() { return waves; }, get history() { return history; }, get launched() { return launched; },
    get clock() { return clock; }, get columns() { return columns; }, get stain() { return stainCtx.count; } }; })();`), env);
  const sketch = env.test;
  return { env, events, canvas, frames, sketch,
    line(shore, t = sketch.clock) { return sketch.seaAt(shore, t, new Float32Array(sketch.columns)); },
    advance(time) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(time)); },
    run(seconds, fps = 30) { let t = this.time || 0; for (let i = 0; i < seconds * fps; i++) { t += 1000 / fps; this.advance(t); } this.time = t; },
    key(key) { events.keydown({ key, preventDefault: noop }); } };
}
// A wave's excursion from its own still water, in page pixels, column by column.
function excursions(sim, wave, line = wave.crest) {
  const sea = sim.line(wave.shore, wave.peak || sim.sketch.clock), out = [];
  for (let i = 0; i < sim.sketch.columns; i++) out.push((sea[i] - line[i]) * wave.shore.dir);
  return out;
}

const DEPOSITS = 11;
let samples = 0, surges = 0, quietest = 1, checked = 0;

// Every wave that turns is inspected once: its crest must be a continuous
// line lying up the shore from its own still water, and no further than a
// wave of that size can run.
function checkWave(sim, wave, w, h) {
  checked++;
  assert.ok(wave.reach >= 0.02 && wave.reach <= 1.1 && wave.up > 0 && wave.down > wave.up, 'plausible run-up and timing');
  assert.ok(wave.lobes.length >= 2 && wave.lobes.length <= 32 && wave.lobes.every(l => l.s > 0), 'lobes are a run of scallops');
  assert.ok(wave.color.every(Number.isFinite) && wave.color[1] <= 60, 'a muted pigment');
  const out = excursions(sim, wave);
  let peak = 0;
  for (let i = 0; i < out.length; i++) {
    samples++;
    assert.ok(Number.isFinite(wave.crest[i]), 'finite crest');
    assert.ok(out[i] > -0.4 * h - 10, 'the crest lies up the shore from its own water');
    assert.ok(out[i] < wave.run * 1.15 + 1, 'and no further than a wave can run');
    if (i) assert.ok(Math.abs(out[i] - out[i - 1]) < 0.16 * h + 3, 'the front is continuous');
    peak = Math.max(peak, out[i]);
  }
  // A narrow surge dies away along the shore instead of running its whole
  // width, so later waves overlap it in patches.
  if (wave.span < 1 && w > 10) {
    surges++; quietest = Math.min(quietest, Math.min(...out) / peak);
    if (wave.span < 0.45) assert.ok(Math.min(...out) < 0.25 * peak, 'a narrow surge fades along the shore');
  }
}
function sweep(sim, seconds, w, h) {
  const seen = new Set();
  for (let step = 0; step < seconds / 3; step++) {
    sim.run(3);
    for (const wave of sim.sketch.history) if (!seen.has(wave)) { seen.add(wave); checkWave(sim, wave, w, h); }
  }
  return seen;
}

for (const [w, h] of [[390, 844], [1440, 900], [2560, 720], [320, 1800], [1, 1]]) {
  for (const seed of ['tideline', 'madder', 'indigo']) {
    const still = simulation(w, h, seed, true);
    const [bottom, top] = still.sketch.shores;
    assert.equal(still.canvas.dataset.state, 'still');
    assert.equal(still.frames.size, 0, 'reduced motion never animates');
    assert.equal(still.sketch.launched, 30, 'a still shore already carries thirty waves');
    assert.equal(still.sketch.history.length, 0, 'a still shore is a dry one');
    assert.equal(bottom.dir, 1); assert.equal(top.dir, -1);
    assert.equal(bottom.launched, 15); assert.equal(top.launched, 15, 'both shores send waves');
    assert.ok(still.sketch.stain.fill >= 30 * DEPOSITS && still.sketch.stain.stroke >= 30, 'every wave lays its bands and rim');
    // The two shores face each other across a field of bare sand.
    for (const t of [0, 90, 180, 270]) {
      const a = still.sketch.shoreAt(bottom, t), b = still.sketch.shoreAt(top, t);
      assert.ok(a > h * 0.84 && a < h + 0.01, 'the bottom water stays at the bottom');
      assert.ok(b < h * 0.16 && b > -0.01, 'the top water stays at the top');
      assert.ok(a - b > h * 0.68, 'and they leave the sand between them');
    }
    sweep(simulation(w, h, seed), 60, w, h);
  }
}
assert.ok(checked > 100, `waves were inspected across every layout (${checked})`);
assert.ok(surges > 20, `surges along part of the shore are common (${surges})`);
assert.ok(quietest < 0.12, `and some leave the sand beside them untouched (${quietest.toFixed(3)})`);

const record = sim => JSON.stringify([...sweep(sim, 30, 1440, 900)].map(w => [w.color, w.reach, w.span, w.lobes, Array.from(w.crest)]));
assert.equal(record(simulation(1440, 900, 'tideline')), record(simulation(1440, 900, 'tideline')), 'a seed reproduces the same waves');
assert.notEqual(record(simulation(1440, 900, 'tideline')), record(simulation(1440, 900, 'weld')), 'another seed differs');
const hues = simulation(1440, 900, 'tideline', true).sketch.shores.map(s => s.hue);
const apart = Math.abs(((hues[0] - hues[1] + 540) % 360) - 180);
assert.ok(apart >= 90 && apart <= 155, `the two shores start on different sides of the colour wheel (${apart.toFixed(0)} degrees)`);

const sim = simulation(1440, 900);
const [bottom, top] = sim.sketch.shores;
assert.equal(sim.canvas.dataset.state, 'running'); assert.equal(sim.sketch.launched, 0);
sim.run(1);
assert.equal(sim.sketch.launched, 1, 'the first wave sets out within a second');
const first = sim.sketch.waves[0];
assert.equal(first.shore, bottom); assert.ok(first.reach >= 0.4, 'and is a proper one');
let previous = -1;
for (let s = 0; s < 8; s++) {
  sim.run(0.5);
  const tau = sim.sketch.clock - first.born, rise = sim.sketch.reachAt(first, tau);
  if (tau < first.up) assert.ok(rise > previous, 'the uprush keeps climbing');
  previous = rise;
  for (const v of excursions(sim, first, first.front)) { samples++; assert.ok(v > -0.5 && Number.isFinite(v), 'the wave never runs behind its own water'); }
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
assert.ok(sim.sketch.stain.fill > deposits + DEPOSITS, 'waves keep arriving and staining');
assert.ok(bottom.launched > 1 && top.launched > 1, 'both shores keep sending');
assert.notEqual(bottom.hue, top.hue, 'each shore keeps its own drifting colour');

sim.key(' '); const pausedAt = sim.sketch.clock;
assert.equal(sim.canvas.dataset.state, 'paused'); assert.equal(sim.frames.size, 0);
sim.key(' '); sim.run(2); assert.ok(sim.sketch.clock - pausedAt > 1.5 && sim.sketch.clock - pausedAt < 2.2, 'resume does not fast-forward');
sim.env.document.hidden = true; sim.events.visibilitychange(); assert.equal(sim.frames.size, 0);
const hiddenAt = sim.sketch.clock;
sim.env.document.hidden = false; sim.events.visibilitychange(); sim.run(1); assert.ok(sim.sketch.clock - hiddenAt < 1.2, 'a hidden tab does not advance');

const before = { launched: sim.sketch.launched, clock: sim.sketch.clock };
sim.env.innerWidth = 390; sim.env.innerHeight = 844; sim.sketch.fit(true);
assert.equal(sim.sketch.columns, Math.ceil(390 / 5) + 1);
assert.equal(sim.sketch.launched, before.launched); assert.equal(sim.sketch.clock, before.clock);
assert.equal(sim.sketch.shores[0].line.length, sim.sketch.columns, 'the shores are rebuilt at the new width');
assert.ok(sim.sketch.stain.drawImage >= 1, 'the stained sand is carried over to the new size');
assert.equal(sim.canvas.dataset.state, 'running');
sim.run(1);

const was = sim.sketch.launched;
sim.key('f'); assert.equal(sim.sketch.launched, was + 12, 'F skips ahead a dozen waves');
assert.equal(sim.sketch.shores[0].launched + sim.sketch.shores[1].launched, sim.sketch.launched, 'every wave belongs to a shore');
sim.key('Enter'); assert.equal(sim.sketch.launched, was + 13, 'Enter sends a wave');
// A tap is answered by the nearer shore, and the wave stops where it was asked to.
for (const [y, expected, name] of [[120, sim.sketch.shores[1], 'top'], [700, sim.sketch.shores[0], 'bottom']]) {
  sim.events.click({ clientX: 100, clientY: y });
  const aimed = sim.sketch.waves.at(-1);
  assert.equal(aimed.shore, expected, `a tap near the ${name} is answered from the ${name}`);
  const crest = sim.sketch.frontAt(aimed, aimed.up, sim.line(aimed.shore, aimed.born + aimed.up), new Float32Array(sim.sketch.columns));
  assert.ok(Math.abs(crest[Math.round(100 / 5)] - y) < 0.1 * 844, 'and the wave reaches about that far');
}
sim.key(' ');
sim.events.click({ clientX: 200, clientY: 300 });
const held = sim.sketch.waves.at(-1);
for (const v of excursions(sim, held, held.front)) assert.ok(Math.abs(v) < 0.01, 'a wave sent while paused starts at its own water');
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
assert.ok(long.sketch.launched > 110 && long.sketch.launched < 260, `ten minutes brings a steady procession (${long.sketch.launched})`);
assert.ok(long.sketch.waves.length <= 8 && long.sketch.history.length <= 12, 'nothing accumulates but dye');
assert.ok(long.sketch.history.every(w => long.sketch.clock - w.peak < 26));
const shares = long.sketch.shores.map(s => s.launched / long.sketch.launched);
assert.ok(Math.min(...shares) > 0.35, `both shores stay busy (${shares.map(v => v.toFixed(2)).join(' / ')})`);
// Old dye is weathered back toward bare sand, so the shore keeps a rolling
// memory: the sand pattern is refreshed once per wave.
assert.ok(long.sketch.stain.fillRect >= long.sketch.launched - long.sketch.waves.length, 'every wave that turns weathers what came before');
console.log(`Passed: ${checked} waves and ${samples} front samples across 15 layouts; two facing shores, deposits, weathering, determinism, colour separation, surges, uprush and backwash, drying, pause, visibility, resize, skip, Enter, tap aim, paused tap, restart, ten-minute run.`);
