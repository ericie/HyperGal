// Collision equivalence, autonomous lifecycle, rendering cache and timing checks.
// No browser dependency: simulation work is measured separately from rasterization.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { performance } from 'node:perf_hooks';

const target = new URL('../pieces/038-many-frogs/index.html', import.meta.url);
function simulation(file = target, reduced = false) {
  const html = fs.readFileSync(file, 'utf8');
  const source = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const events = {}, frames = new Map();
  let frameId = 0, surfaces = 0, clock = 0;
  const noop = () => {};
  const context = new Proxy({}, { get: (o, k) => o[k] ?? noop, set: (o, k, v) => (o[k] = v, true) });
  const canvas = () => { surfaces++; return { getContext: () => context, style: {} }; };
  const env = {
    Math, console, performance: { now: () => clock },
    Date: class extends Date { static now() { return 1000000; } },
    window: { innerWidth: 1126, innerHeight: 1056, devicePixelRatio: 1,
      matchMedia: () => ({ matches: reduced }), addEventListener: (name, fn) => events[name] = fn },
    document: { querySelector: canvas, createElement: canvas, hidden: false,
      addEventListener: (name, fn) => events[name] = fn },
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id)
  };
  vm.createContext(env);
  vm.runInContext(source.replace('window.__manyFrogs = {', `window.__test = {
    update, draw, getLane, laneObjectsAt, laneDanger, hitsVehicleAt, hitsBikeAt,
    hitsTrainAt, supportingRiverObjectAt, alligatorHeadAt, addBloodStain,
    get frogs() { return frogs; }, get stains() { return bloodStains; }
  }; window.__manyFrogs = {`), env);
  return { env, events, frames, api: env.window.__manyFrogs, test: env.window.__test,
    get surfaces() { return surfaces; },
    frame(dt = 1000 / 60) {
      clock += dt;
      const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(clock));
    }
  };
}

const sim = simulation();
let samples = 0;
for (let row = 6; row < 240; row++) {
  const lane = sim.test.getLane(row);
  if (lane.type === 'grass') continue;
  for (let i = 0; i < 120; i++) {
    const x = (i * 1.71371) % 21, at = i * .91331;
    const objects = sim.test.laneObjectsAt(lane, at);
    if (lane.type === 'river') {
      const kind = o => ((o.id + Math.abs(row)) % 7 + 7) % 7 === 0;
      const supported = objects.find(o => {
        const lo = kind(o) && lane.direction < 0 ? o.x + o.length * .18 : o.x + .24;
        const hi = kind(o) && lane.direction > 0 ? o.x + o.length * .82 : o.x + o.length - .24;
        return x > lo && x < hi;
      });
      const head = objects.some(o => kind(o) && (lane.direction > 0
        ? x >= o.x + o.length * .82 && x <= o.x + o.length
        : x >= o.x && x <= o.x + o.length * .18));
      assert.equal(sim.test.supportingRiverObjectAt(lane, x, at)?.id, supported?.id);
      assert.equal(sim.test.alligatorHeadAt(lane, x, at), head);
    } else {
      const radius = lane.type === 'bike' ? .16 : .24;
      const expected = objects.some(o => x > o.x - radius && x < o.x + o.length + radius);
      const hit = lane.type === 'bike' ? sim.test.hitsBikeAt : lane.type === 'rail' ? sim.test.hitsTrainAt : sim.test.hitsVehicleAt;
      assert.equal(hit(lane, x, at), expected);
      // Dense temporal oracle: a new analytic landing window must never miss a hit.
      const duration = .19;
      const dangerous = Array.from({ length: 25 }, (_, n) => at + n * duration / 24).some(t =>
        sim.test.laneObjectsAt(lane, t).some(o => x > o.x - radius && x < o.x + o.length + radius));
      if (dangerous) assert.equal(sim.test.laneDanger(lane, x, at, duration), 100);
    }
    samples++;
  }
}

// Static surfaces and dry pigment reuse raster impressions between frames.
sim.test.draw();
const terrainSurfaces = sim.surfaces;
sim.test.draw();
assert.equal(sim.surfaces, terrainSurfaces);
sim.test.addBloodStain(sim.test.frogs[0], 'mower');
sim.test.draw();
const stainSurfaces = sim.surfaces;
sim.test.draw();
assert.equal(sim.surfaces, stainSurfaces, 'stationary pigment is not repainted');

sim.frame();
sim.env.document.hidden = true; sim.events.visibilitychange();
assert.equal(sim.frames.size, 0, 'hidden page stops its RAF');
const before = JSON.stringify(sim.api.getState());
sim.frame(5000);
assert.equal(JSON.stringify(sim.api.getState()), before, 'hidden page does not advance');
sim.env.document.hidden = false; sim.events.visibilitychange();
assert.equal(sim.frames.size, 1, 'visibility resumes one RAF');
sim.frame();
assert.equal(sim.frames.size, 1, 'no duplicate RAF loop');

for (const reduced of [false, true]) {
  const run = simulation(target, reduced);
  for (let i = 0; i < 1200; i++) run.test.update(1 / 60);
  const state = run.api.getState();
  assert.ok(state.topFrogY > 10, 'frogs autonomously progress');
  assert.ok(state.frogs.every(f => Number.isFinite(f.x) && Number.isFinite(f.y)));
  run.api.eliminateAll();
  assert.equal(run.api.getState().live, 0);
  for (let i = 0; i < 250; i++) run.test.update(1 / 60);
  assert.equal(run.api.getState().round, state.round + 1, 'aftermath returns to a new cohort');
  assert.equal(run.api.getState().live, 12);
  run.env.window.innerWidth = 390; run.env.window.innerHeight = 844; run.events.resize();
  run.test.draw();
}

// Long-running accumulation has a finite memory budget.
const accumulation = simulation();
for (let i = 0; i < 660; i++) accumulation.test.addBloodStain(accumulation.test.frogs[0], 'mower');
accumulation.test.update(1 / 60);
assert.equal(accumulation.test.stains.length, 640);
console.log(`Passed ${samples} collision samples, continuous traffic windows, pigment/terrain caching, visibility, normal/reduced-motion lifecycle, resize, and bounded stain history.`);

if (process.argv.includes('--benchmark')) {
  const files = [target];
  const baseline = process.argv.find(arg => arg.startsWith('--baseline='))?.slice(11);
  if (baseline) files.unshift(baseline);
  const results = [];
  for (const file of files) {
    const run = simulation(file), times = [];
    for (let i = 0; i < 3600; i++) {
      const start = performance.now(); run.test.update(1 / 60); times.push(performance.now() - start);
    }
    times.sort((a, b) => a - b);
    results.push({ file: String(file), mean: times.reduce((a,b)=>a+b,0)/times.length,
      p95: times[3420], p99: times[3564], max: times.at(-1), state: run.api.getState() });
  }
  if (baseline) assert.deepEqual(JSON.parse(JSON.stringify(results[0].state)), JSON.parse(JSON.stringify(results[1].state)), 'same seeded 60-second outcome');
  console.log(JSON.stringify(results.map(({ state, ...result }) => ({...result, live: state.live, totalFrogs: state.totalFrogs, topFrogY: state.topFrogY})), null, 2));
}
