// Run against the shipped sketch; expose internals only inside this VM.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../pieces/063-counterform/counterform.js', import.meta.url), 'utf8');
function simulation(width, height, reduced = false) {
  const events = {}, frames = new Map(), paths = [];
  let next = 0, coordinates = 0, downloads = 0;
  const noop = () => {};
  const context = new Proxy({}, {get: () => noop, set: () => true});
  class Path {
    constructor() { this.points = []; paths.push(this); }
    check(values) {
      assert.ok(values.every(Number.isFinite), 'all rendered coordinates are finite');
      coordinates += values.length;
      this.points.push(values);
    }
    moveTo(...values) { this.check(values); }
    quadraticCurveTo(...values) { this.check(values); }
    ellipse(...values) {
      this.check(values);
      assert.ok(values[2] >= 0 && values[3] >= 0, 'eye socket radii are nonnegative');
    }
    closePath() {}
  }
  const surface = () => ({getContext: () => context,
    addEventListener: (key, fn) => events[key] = fn,
    toBlob: fn => fn({}), click: () => downloads++});
  const canvas = surface();
  const preference = {matches: reduced, addEventListener: (_, fn) => events.motion = fn};
  const env = {Math, Path2D: Path, innerWidth: width, innerHeight: height, devicePixelRatio: 3,
    document: {querySelector: () => canvas, createElement: surface, hidden: false,
      addEventListener: (key, fn) => events[key] = fn},
    matchMedia: () => preference, addEventListener: (key, fn) => events[key] = fn,
    requestAnimationFrame: fn => { frames.set(++next, fn); return next; },
    cancelAnimationFrame: id => frames.delete(id),
    URL: {createObjectURL: () => 'blob:test', revokeObjectURL: noop}, setTimeout: noop};
  vm.createContext(env);
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, `
    globalThis.sketch = {sceneAt, openingAt, morphState, recognition, passage, contour, paletteAt,
      render(t) { time = t; draw(); }, get time() { return time; }};
  })();`), env);
  return {env, events, frames, paths, preference, canvas, sketch: env.sketch,
    get coordinates() { return coordinates; }, get downloads() { return downloads; },
    advance(now) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(now)); },
    key(code, extra = {}) { events.keydown({code, preventDefault: noop, ...extra}); }};
}

let coordinates = 0;
for (const [width, height] of [[1440, 1000], [390, 844], [844, 390], [320, 1800], [1, 1]]) {
  const sim = simulation(width, height, true);
  assert.equal(sim.frames.size, 0, 'reduced motion starts still');
  assert.equal(sim.canvas.width, width * 2, 'backing pixel ratio is capped');
  let minSpread = Infinity, maxSpread = 0, contacts = 0, recoils = 0, escaped = 0;
  for (let t = 0; t <= 400; t += 2) {
    sim.paths.length = 0;
    sim.sketch.render(t);
    const poses = sim.sketch.sceneAt(t);
    assert.ok(Math.max(...poses.map(p => p.r)) / Math.min(...poses.map(p => p.r)) > 6,
      'large cropped bodies coexist with much smaller bodies');
    const spread = Math.hypot(poses[2].x - poses[6].x, poses[2].y - poses[6].y);
    minSpread = Math.min(minSpread, spread); maxSpread = Math.max(maxSpread, spread);
    for (let i = 0; i < poses.length; i++) {
      const pose = poses[i];
      contacts += pose.contacts.filter(c => c.pull > .25).length;
      recoils += pose.contacts.filter(c => c.recoil > .15).length;
      const openings = sim.sketch.openingAt(pose, t, i);
      if (openings?.aperture.r > pose.r * .04
        && Math.hypot(openings.aperture.x - pose.x, openings.aperture.y - pose.y) > pose.r * 1.1) escaped++;
    }
  }
  assert.ok(contacts > 50 && recoils > 10, 'encounters produce pull and a trailing recovery');
  assert.ok(escaped > 10, 'openings visibly escape their parent contours');
  assert.ok(maxSpread > minSpread * 1.8, 'the field changes between gathered and dispersed states');
  coordinates += sim.coordinates;
}

const sim = simulation(1440, 1000);
const channels = color => color.match(/\d+/g).map(Number);
const initialPalette = sim.sketch.paletteAt(0);
assert.equal(initialPalette.paper, 'rgb(186, 255, 0)');
assert.equal(initialPalette.ink, 'rgb(240, 0, 184)');
let previous = null;
for (let t = 0; t <= 180; t += .1) {
  const palette = sim.sketch.paletteAt(t);
  const inks = [channels(palette.paper), channels(palette.ink)];
  for (const color of inks) {
    assert.ok(color.every(n => Number.isFinite(n) && n >= 0 && n <= 255));
    assert.equal(Math.min(...color), 0, 'the hue circuit stays fully saturated');
  }
  assert.ok(Math.hypot(...inks[0].map((v, i) => v - inks[1][i])) > 200,
    'the two inks stay distinct throughout the circuit');
  if (previous) assert.ok(inks.every((color, i) => color.every((v, j) => Math.abs(v - previous[i][j]) <= 2)),
    'palette changes remain smooth, including across hue-sector and cycle boundaries');
  previous = inks;
}
assert.equal(sim.sketch.paletteAt(90).paper, initialPalette.paper, 'the palette loops seamlessly');
assert.equal(sim.sketch.paletteAt(90).ink, initialPalette.ink);
assert.notEqual(sim.sketch.paletteAt(15).paper, initialPalette.paper, 'color evolves with artwork time');
// Resolve all three silhouettes, with substantially longer abstract intervals.
for (let i = 0; i < 8; i++) {
  const kinds = new Set(); let recognizable = 0;
  for (let t = 0; t < 300; t += .5) {
    const morph = sim.sketch.morphState(t, i);
    if (sim.sketch.recognition(morph) > .83) { recognizable++; kinds.add(morph.kind); }
  }
  assert.equal(kinds.size, 3, 'hearts, cats and skulls all remain in the vocabulary');
  assert.ok(recognizable > 0 && recognizable < 90, 'clear silhouettes are fleeting');
}
// Compare the visible aperture on either side of its renewal, not its hidden predecessor.
for (const i of [0, 2, 4, 6]) {
  const t = 89 + i * 7 - i * 19 - 9;
  const beforePose = sim.sketch.sceneAt(t - .00001)[i];
  const afterPose = sim.sketch.sceneAt(t + .00001)[i];
  const before = sim.sketch.openingAt(beforePose, t - .00001, i).renewal;
  const after = sim.sketch.openingAt(afterPose, t + .00001, i).aperture;
  assert.ok(Math.hypot(before.x - after.x, before.y - after.y) < .01, 'renewal has no center jump');
  assert.ok(Math.abs(before.r - after.r) < .01, 'renewal has no radius jump');
}
// A neighbor changes the actual contour; this is more than overlapping stock paths.
const body = sim.sketch.sceneAt(8).find(p => p.contacts.some(c => c.pull > .4));
assert.ok(body);
const makePath = pose => { sim.paths.length = 0; sim.sketch.contour(new sim.env.Path2D(), pose, 8); return JSON.stringify(sim.paths[0].points); };
assert.notEqual(makePath(body), makePath({...body, contacts: []}), 'contact deforms the drawn boundary');

sim.advance(1000); sim.advance(1100); assert.ok(sim.sketch.time > 0);
sim.key('Space'); const frozen = sim.sketch.time;
assert.equal(sim.frames.size, 0); sim.advance(9000); assert.equal(sim.sketch.time, frozen);
sim.env.innerWidth = 390; sim.env.innerHeight = 844; sim.events.resize();
assert.equal(sim.sketch.time, frozen); assert.equal(sim.frames.size, 0, 'resizing preserves pause');
sim.key('Enter'); sim.advance(12000); assert.equal(sim.sketch.time, frozen, 'resume does not fast-forward');
sim.advance(12100); assert.ok(sim.sketch.time > frozen);
sim.env.document.hidden = true; sim.events.visibilitychange(); assert.equal(sim.frames.size, 0);
const hiddenAt = sim.sketch.time;
sim.env.document.hidden = false; sim.events.visibilitychange(); sim.advance(30000);
assert.equal(sim.sketch.time, hiddenAt, 'hidden time is excluded');
sim.preference.matches = true; sim.events.motion(); assert.equal(sim.frames.size, 0);
sim.key('KeyS'); assert.equal(sim.downloads, 1, 'PNG export remains available while paused');
sim.events.click(); assert.equal(sim.frames.size, 1, 'explicit click can resume a reduced-motion still');
const meta = JSON.parse(fs.readFileSync(new URL('../pieces/063-counterform/meta.json', import.meta.url)));
assert.equal(meta.wip, true);
console.log(`Passed: ${coordinates.toLocaleString()} finite coordinates across 5 viewports and 400 seconds; smooth saturated palette cycles, contact deformation, recovery, detached openings, renewal continuity, scale/density changes, fleeting silhouettes, pause/resume, resize, hidden tabs, reduced motion, save and WIP.`);
