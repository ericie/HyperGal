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
    update, draw, getLane, laneObjectsAt, laneDanger, hitsVehicleAt, addBloodStain,
    updateBloodStains, addVehicleSmear, touchCounter, counterX, spawnFrogBrood,
    get frogs() { return frogs; }, get stains() { return bloodStains; },
    get rows() { return ROWS; }, get cols() { return COLS; }
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
const COLS = sim.test.cols, ROWS = sim.test.rows;
const state0 = sim.api.getState();

// The board is one fixed screen: field, road band, field.
assert.equal(state0.fieldRows * 2 + state0.roadRows, ROWS, 'the three bands fill the board');
assert.equal(state0.roadHeightFraction, .8, 'the road band holds exactly 80% of screen height');
for (let row = 0; row < ROWS; row++) {
  const expected = row >= state0.fieldRows && row < state0.fieldRows + state0.roadRows ? 'road' : 'grass';
  assert.equal(sim.test.getLane(row).type, expected, `row ${row} is ${expected}`);
}

let samples = 0;
for (let row = 0; row < ROWS; row++) {
  const lane = sim.test.getLane(row);
  if (lane.type === 'grass') continue;
  for (let i = 0; i < 120; i++) {
    const x = (i * 1.71371) % COLS, at = i * .91331;
    const objects = sim.test.laneObjectsAt(lane, at);
    const radius = .24;
    const expected = objects.some(o => x > o.x - radius && x < o.x + o.length + radius);
    assert.equal(sim.test.hitsVehicleAt(lane, x, at), expected);
    // Dense temporal oracle: the analytic landing window must never miss a hit.
    const duration = .19;
    const dangerous = Array.from({ length: 25 }, (_, n) => at + n * duration / 24).some(t =>
      sim.test.laneObjectsAt(lane, t).some(o => x > o.x - radius && x < o.x + o.length + radius));
    if (dangerous) assert.equal(sim.test.laneDanger(lane, x, at, duration), 100);
    samples++;
  }
}

// Static surfaces and dry pigment reuse raster impressions between frames.
sim.test.draw();
const terrainSurfaces = sim.surfaces;
sim.test.draw();
assert.equal(sim.surfaces, terrainSurfaces);
sim.test.addBloodStain(sim.test.frogs[0], 'traffic');
sim.test.draw();
const stainSurfaces = sim.surfaces;
sim.test.draw();
assert.equal(sim.surfaces, stainSurfaces, 'stationary pigment is not repainted');

// Pigment moves only after contact, follows either traffic direction, and can
// be worked again after the former five-car limit. A car transfers only once.
for (const direction of [-1, 1]) {
  const paint = simulation();
  const road = Array.from({length: paint.test.rows}, (_, row) => paint.test.getLane(row))
    .find(lane => lane.type === 'road' && lane.direction === direction);
  const car = paint.test.laneObjectsAt(road, 0).find(item => item.x > 2 && item.x + item.length < paint.test.cols - 2);
  paint.test.addBloodStain({...paint.test.frogs[0], x: car.x + car.length / 2, y: road.row}, 'traffic');
  const stain = paint.test.stains[0];
  assert.equal(stain.dragDistance, 0);
  paint.test.updateBloodStains(1 / 60);
  assert.equal(stain.smearPasses, 1, 'actual vehicle contact triggers transfer');
  assert.equal(Math.sign(stain.dragTargetX), direction, 'pool follows traffic');
  assert.ok(stain.poolStrength < 1 && stain.dragDistance > 1, 'pool becomes a long diluted wash');
  paint.test.updateBloodStains(1 / 60);
  assert.equal(stain.smearPasses, 1, 'continuous contact is one pass');
  paint.test.draw();
  const cached = stain.smearPrint, surfaces = paint.surfaces;
  paint.test.draw();
  assert.equal(stain.smearPrint, cached);
  assert.equal(paint.surfaces, surfaces, 'the blended impression is cached');
  const firstLength = stain.dragDistance;
  for (let pass = 1; pass <= 8; pass++) paint.test.addVehicleSmear(stain, road, {...car, id: car.id + pass});
  assert.equal(stain.smearPasses, 9);
  assert.ok(stain.dragDistance > firstLength && stain.dragDistance <= 6.5);
  assert.equal(stain.smearPrint, null, 'new transfer invalidates the blend cache');
  paint.test.addBloodStain({...paint.test.frogs[0], x: car.x, y: 0}, 'grass');
  paint.test.updateBloodStains(1 / 60);
  assert.equal(paint.test.stains[1].smearPasses, 0, 'traffic never drags pigment out of a field');
}

const contacts = simulation();
const frog = contacts.test.frogs[0];
contacts.test.touchCounter(frog);
assert.equal(frog.bottomTouches, 0, 'initial spawning is not a return trip');
frog.y = contacts.test.rows - 1;
frog.x = contacts.test.counterX(frog) + 1;
contacts.test.touchCounter(frog);
assert.equal(frog.topTouches, 0, 'touching a different column does not count');
frog.x = contacts.test.counterX(frog);
contacts.test.touchCounter(frog);
contacts.test.touchCounter(frog);
assert.equal(frog.topTouches, 1, 'one touch increments exactly once');
assert.equal(frog.heading, -1);
frog.y = 0;
contacts.test.touchCounter(frog);
contacts.test.touchCounter(frog);
assert.equal(frog.bottomTouches, 1);
assert.equal(frog.crossings, 2);
const parent = contacts.test.frogs[2];
contacts.test.spawnFrogBrood(parent, {row: 1, x: parent.x, y: 1, id: 'test', seed: 12});
assert.equal(contacts.test.frogs.length, state0.totalFrogs + 3);
assert.equal(new Set(contacts.test.frogs.map(item => item.homeU)).size, contacts.test.frogs.length,
  'every child receives its own paired counter column');
assert.ok(contacts.test.frogs.slice(-3).every(child => child.topTouches === 0 && child.bottomTouches === 0));

// Resizing during a hop must not leave its former Infinity think-time parked.
const resizeRun = simulation();
const moving = resizeRun.test.frogs[0];
moving.hop = 0.4; moving.nextMoveAt = Infinity;
moving.topTouches = 2; moving.bottomTouches = 1;
resizeRun.env.window.innerWidth = 390; resizeRun.env.window.innerHeight = 844;
resizeRun.events.resize();
assert.ok(Number.isFinite(moving.nextMoveAt), 'a resized hop resumes planning');
assert.equal(moving.topTouches, 2);
assert.equal(moving.bottomTouches, 1);
assert.equal(resizeRun.api.getState().roadHeightFraction, .8);
const counterPositions = resizeRun.api.getState().frogs.map(f => f.counterX).sort((a, b) => a - b);
assert.ok(counterPositions.every((x, index) => !index || x - counterPositions[index - 1] >= .7),
  'a wide cohort resizes without crowded counter markers');
resizeRun.env.window.innerWidth = 844; resizeRun.env.window.innerHeight = 390;
resizeRun.events.resize();
assert.equal(resizeRun.api.getState().roadHeightFraction, .8, 'short landscape view uses actual screen height');

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
  const rows = run.test.rows;
  let reachedTop = false, turnedBack = false, mostCrossings = 0, offBoard = false;
  for (let i = 0; i < 6000; i++) {
    run.test.update(1 / 60);
    const live = run.api.getState().frogs.filter(f => f.alive);
    if (live.some(f => f.y >= rows - 1)) reachedTop = true;
    if (reachedTop && live.some(f => f.heading < 0)) turnedBack = true;
    if (live.some(f => f.y < 0 || f.y > rows - 1)) offBoard = true;
    mostCrossings = Math.max(mostCrossings, ...live.map(f => f.crossings));
  }
  const state = run.api.getState();
  assert.ok(reachedTop, 'a frog reaches the top field');
  assert.ok(turnedBack, 'reaching the top field turns a frog around');
  assert.ok(state.frogs.every(f => Number.isFinite(f.x) && Number.isFinite(f.y)));
  assert.ok(!offBoard, 'frogs stay on the board');
  assert.ok(mostCrossings >= 2, `a frog completes a round trip (saw ${mostCrossings} turns)`);
  assert.ok(state.frogs.every(f => f.topTouches + f.bottomTouches === f.crossings), 'counters match completed trips');
  run.api.eliminateAll();
  assert.equal(run.api.getState().live, 0);
  for (let i = 0; i < 250; i++) run.test.update(1 / 60);
  assert.equal(run.api.getState().round, state.round + 1, 'aftermath returns to a new cohort');
  assert.ok(run.api.getState().live > 0, 'a new cohort enters');
  assert.ok(run.api.getState().frogs.every(f => f.topTouches === 0 && f.bottomTouches === 0), 'new cohort resets counters');
  run.env.window.innerWidth = 390; run.env.window.innerHeight = 844; run.events.resize();
  assert.ok(run.api.getState().frogs.every(f => f.x <= run.api.getState().columns - 0.25),
    'a resize keeps every frog on the narrower board');
  run.test.draw();
  assert.equal(run.api.getState().roadHeightFraction, .8, 'mobile keeps the 80% road');
  assert.ok(run.api.getState().frogs.every(f => f.counterX >= .45 && f.counterX <= run.test.cols - .45),
    'paired counters follow their columns on resize');
  for (let i = 0; i < 120; i++) run.test.update(1 / 60);
}

// Long-running accumulation has a finite memory budget.
const accumulation = simulation();
for (let i = 0; i < 660; i++) accumulation.test.addBloodStain(accumulation.test.frogs[0], 'traffic');
accumulation.test.update(1 / 60);
assert.equal(accumulation.test.stains.length, 640);
console.log(`Passed ${samples} collision samples, 80% road layout, paired contact counters, offspring counters, directional pigment transfer and caching, shuttle turnaround, visibility, normal/reduced-motion lifecycle, resize, and bounded stain history.`);

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
