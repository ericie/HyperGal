// Run with Node only. Tests the actual drawing geometry and animation lifecycle.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../pieces/050-strega-nona/strega-nona.js', import.meta.url), 'utf8');
function simulation(width, height, seed = 'olive', reduced = false) {
  const noop = () => {};
  const context = new Proxy({}, { get: (_, key) => key === 'createImageData'
    ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }) : noop, set: () => true });
  const surface = () => ({ getContext: () => context, addEventListener: noop, dataset: {} });
  const canvas = surface(), events = {}, frames = new Map();
  let frameId = 0;
  const env = {
    Math, URLSearchParams, location: { search: `?seed=${seed}` },
    innerWidth: width, innerHeight: height, devicePixelRatio: 1,
    document: { getElementById: () => canvas, createElement: surface, hidden: false,
      addEventListener: (name, fn) => events[name] = fn },
    addEventListener: (name, fn) => events[name] = fn,
    matchMedia: () => ({ matches: reduced, addEventListener: noop }),
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id), setTimeout: noop, clearTimeout: noop,
  };
  vm.createContext(env);
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, `globalThis.test = {
    fit, get shapes() { return shapes; }, get elapsed() { return elapsed; }, get strokes() { return strokes; }, get duration() { return totalDuration; }, get completed() { return completed; }, get pens() { return penCount; }, get active() { return activeStrokes; }
  }; })();`), env);
  return { env, events, canvas, frames, sketch: env.test,
    advance(time) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(time)); } };
}
let points = 0;
for (const [w, h] of [[390, 844], [1440, 900], [2560, 720], [320, 1800]]) {
  for (const seed of ['olive', 'pasta', 'garden']) {
    const sim = simulation(w, h, seed, true);
    const fans = sim.sketch.shapes.filter(s => !s.stem);
    // Include exact edges and corners, and conservatively subtract wobble.
    for (let y = 0; y <= h; y += 10) for (let x = 0; x <= w; x += 10) {
      assert.ok(fans.some(s => Math.hypot(x - s.x, (y - s.y) / s.aspect) <= s.radius - 1),
        `uncovered paper at ${x},${y} in ${w}x${h}/${seed}`);
      points++;
    }
    for (const x of [0, w]) for (const y of [0, h]) {
      assert.ok(fans.some(s => Math.hypot(x - s.x, (y - s.y) / s.aspect) <= s.radius - 1), 'corners covered');
    }
    assert.equal(sim.canvas.dataset.state, 'complete');
    assert.ok(sim.sketch.strokes.length > 0, 'visible strokes fill the plan');
    const penEnds = new Map();
    const shapePens = new Map();
    for (let i = 0; i < sim.sketch.strokes.length; i++) {
      const stroke = sim.sketch.strokes[i];
      assert.ok(stroke.duration >= 0.22, 'every line has visible drawing time');
      assert.ok(stroke.length > 2.5, 'no disconnected ink specks');
      assert.ok(stroke.start >= (penEnds.get(stroke.pen) || 0), 'each pen draws only one line at a time');
      penEnds.set(stroke.pen, stroke.end);
      if (shapePens.has(stroke.shapeId)) assert.equal(stroke.pen, shapePens.get(stroke.shapeId), 'one pen stays with its shape');
      shapePens.set(stroke.shapeId, stroke.pen);
    }
    assert.equal(sim.frames.size, 0, 'reduced motion has no animation loop');
  }
}
const sim = simulation(390, 844);
assert.equal(sim.canvas.dataset.state, 'growing');
sim.advance(1000); sim.advance(1100);
assert.equal(sim.sketch.completed, 0, 'a tenth of a second cannot blink in an entire line');
assert.ok(sim.sketch.strokes[0].length > 100, 'the first gesture is a continuous leading curl');
for (let t = 1200; t <= 2000; t += 100) sim.advance(t);
assert.ok(sim.sketch.active.length >= 3, 'several points are drawing within the first second');
const event = { code: 'Space', key: ' ', preventDefault() {} };
sim.events.keydown(event);
assert.equal(sim.canvas.dataset.state, 'paused');
assert.equal(sim.frames.size, 0);
sim.events.keydown(event);
sim.advance(2100); sim.advance(2200);
assert.ok(sim.sketch.elapsed > 0.1, 'resume advances');
sim.env.document.hidden = true;
sim.events.visibilitychange();
assert.equal(sim.frames.size, 0, 'hidden tab suspends drawing');
sim.env.document.hidden = false;
sim.events.visibilitychange();
let t = 2300;
const deadline = sim.sketch.duration * 1000 + 5000;
while (sim.frames.size && t < deadline) {
  const previous = sim.sketch.completed;
  sim.advance(t); t += 100;
  assert.ok(sim.sketch.completed - previous <= sim.sketch.pens, 'each pen completes at most one line on a slow frame');
  assert.ok(sim.sketch.active.length <= sim.sketch.pens, 'bounded active drawing points');
}
assert.equal(sim.canvas.dataset.state, 'complete', 'natural growth finishes');
assert.equal(sim.frames.size, 0, 'finished drawing holds without rendering');
sim.env.innerWidth = 1440;
sim.env.innerHeight = 900;
sim.sketch.fit(true);
assert.equal(sim.canvas.width, 1440);
assert.equal(sim.canvas.dataset.state, 'complete', 'resizing complete art keeps it complete');
sim.events.keydown({ key: 'r', preventDefault() {} });
assert.equal(sim.canvas.dataset.state, 'growing', 'restart begins fresh growth');
console.log(`Passed: ${points.toLocaleString()} coverage samples across 12 compositions; concurrent pens, per-pen line sequencing, reduced motion, pause/resume, visibility, completion, resize, restart.`);
