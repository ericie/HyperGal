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
  let frameId = 0, surfaces = 0, clock = 0, textDraws = 0;
  const noop = () => {};
  const paints = [];
  const context = new Proxy({globalAlpha: 1}, {
    get: (o, k) => o[k] ?? (k === 'fillText' ? () => textDraws++ : ['fill', 'fillRect'].includes(k)
      ? () => paints.push({kind: k, color: o.fillStyle, alpha: o.globalAlpha}) : noop),
    set: (o, k, v) => (o[k] = v, true)
  });
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
    updateBloodStains, completeCrossing, turnaroundX, shoreApproachScore, spawnFrogBrood, admitFrog,
    ageFrog, recordFrogPath, killFrog, beginHop, frogBodyScale, drawFrogPaths, drawVehicle,
    get paths() { return frogPaths; },
    get frogs() { return frogs; }, get stains() { return bloodStains; },
    get rows() { return ROWS; }, get cols() { return COLS; }
  }; window.__manyFrogs = {`), env);
  return { env, events, frames, paints, api: env.window.__manyFrogs, test: env.window.__test,
    get surfaces() { return surfaces; }, get textDraws() { return textDraws; },
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

// Survival strengthens the complete route and body, then freezes that history
// at death. Offspring inherit a hue, but start with their own young pigment.
const history = simulation();
const painter = history.test.frogs[0];
history.test.recordFrogPath(painter);
painter.y = 1;
history.test.recordFrogPath(painter);
const route = painter.path;
const firstColor = painter.color;
history.test.ageFrog(painter, 30);
assert.ok(route.strength > 0.6, 'the entire existing path deepens with survival');
assert.notEqual(painter.color, firstColor, 'a survivor becomes more vivid');
assert.equal(route.pigment.frog, painter.color, 'body and history keep one pigment identity');
history.test.addBloodStain({...painter, maturity: 0}, 'grass');
history.test.addBloodStain(painter, 'grass');
assert.ok(history.test.stains[1].scale > history.test.stains[0].scale * 2.5,
  'a veteran leaves a substantially larger death splash');
history.test.spawnFrogBrood(painter, {row: 1, x: painter.x, y: 1, id: 'age-test', seed: 12});
assert.ok(history.test.frogs.slice(-3).every(child => child.age === 0 && child.color === painter.basePigment.frog),
  'newborns start young in their parent’s original hue');
history.test.killFrog(painter, 'grass');
const frozenStrength = route.strength;
history.test.update(1);
assert.equal(route.strength, frozenStrength, 'a dead frog’s path stops strengthening');
assert.equal(route.alive, false);
history.api.eliminateAll();
for (let i = 0; i < 140; i++) history.test.update(1 / 60);
assert.ok(history.test.paths.includes(route), 'history survives continuing arrivals');
const oldX = route.points[0].x;
history.env.window.innerWidth = 390;
history.events.resize();
assert.ok(route.points[0].x < oldX, 'saved routes rebase onto a narrower board');
assert.ok(route.points.every(point => Number.isFinite(point.x) && Number.isFinite(point.y)));

// Young routes begin nearly invisible, then visibly deepen in the renderer.
const ink = simulation();
const author = ink.test.frogs[0];
ink.test.recordFrogPath(author);
author.y = 1;
ink.test.recordFrogPath(author);
ink.test.drawFrogPaths();
const faint = Math.max(...ink.paints.map(paint => paint.alpha));
assert.ok(faint < 0.02, 'new paths start as faint pigment deposits');
ink.paints.length = 0;
ink.test.ageFrog(author, 60);
ink.test.update(0.11);
ink.test.drawFrogPaths();
const strong = Math.max(...ink.paints.map(paint => paint.alpha));
assert.ok(strong > 0.25 && strong > faint * 10, 'survival builds a much stronger painted route');
assert.equal(ink.test.frogBodyScale(author), ink.test.frogBodyScale({crossings: 0}),
  'survival alone changes color and paths, not frog size');

// Passing traffic in either direction leaves pigment stationary and stays pale.
for (const direction of [-1, 1]) {
  const paint = simulation();
  const lane = Array.from({length: paint.test.rows}, (_, row) => paint.test.getLane(row))
    .find(lane => lane.type === 'road' && lane.direction === direction);
  const car = paint.test.laneObjectsAt(lane, 0).find(item => item.x > 2 && item.x + item.length < paint.test.cols - 2);
  paint.test.drawVehicle(lane, car, 0);
  const neutral = paint.paints.map(item => item.color);
  paint.paints.length = 0;
  const frog = paint.test.frogs[0];
  frog.x = car.x + car.length / 2;
  frog.y = lane.row;
  paint.test.ageFrog(frog, 60);
  paint.test.killFrog(frog, 'traffic');
  const stain = paint.test.stains[0];
  const before = JSON.stringify(stain);
  for (let i = 0; i < 300; i++) paint.test.update(1 / 60);
  assert.equal(JSON.stringify(stain), before, 'cars leave death impressions in place without smearing or dilution');
  paint.test.drawVehicle(lane, car, 0);
  assert.deepEqual(paint.paints.map(item => item.color), neutral, 'a car stays pale after striking a frog and passing its paint');
}

// Arrivals continue on a clock while the first frog is still crossing.
const flow = simulation();
const first = flow.test.frogs[0];
for (let i = 0; i < 360; i++) flow.test.update(1 / 60);
assert.ok(flow.api.getState().streamArrivals >= 7, 'new frogs enter before a win or cohort extinction');
assert.equal(first.crossings, 0, 'the first frog has not needed to win to admit others');
assert.ok(flow.test.frogs.some(frog => frog.age < first.age), 'young arrivals coexist with older survivors');
assert.equal(new Set(flow.test.frogs.map(frog => frog.id)).size, flow.test.frogs.length, 'stream identities stay unique');
const arrivalsBeforeDeaths = flow.api.getState().streamArrivals;
flow.api.eliminateAll();
for (let i = 0; i < 60; i++) flow.test.update(1 / 60);
assert.ok(flow.api.getState().streamArrivals > arrivalsBeforeDeaths, 'admission resumes on its cadence after extinction');
assert.ok(flow.test.frogs.every(frog => frog.alive), 'dead simulation bodies are retired while their marks remain');
const crowded = simulation();
for (let i = 0; i < 100; i++) crowded.test.admitFrog();
assert.ok(crowded.api.getState().live <= crowded.api.getState().populationLimit, 'stream admission has a bounded live population');
assert.equal(crowded.test.admitFrog(), false, 'a full entrance waits for space without overlapping births');

// Any column can complete a crossing. Each return also grows the frog once,
// and each win chooses a substantially different safe-bank departure column.
const contacts = simulation();
const frog = contacts.test.frogs[0];
const newbornSize = contacts.test.frogBodyScale(frog);
contacts.test.completeCrossing(frog);
assert.equal(frog.crossings, 0, 'initial spawning is not a return trip');
frog.y = contacts.test.rows - 1;
contacts.test.completeCrossing(frog);
contacts.test.completeCrossing(frog);
assert.equal(frog.crossings, 1, 'an arrival increments exactly once at any column');
const firstWinSize = contacts.test.frogBodyScale(frog);
assert.ok(newbornSize < 0.3 && firstWinSize > newbornSize, 'a small newborn grows after its first winning pass');
assert.equal(frog.heading, -1);
assert.ok(frog.repositioning);
assert.ok(Math.abs(contacts.test.turnaroundX(frog) - frog.x) >= contacts.test.cols * 0.24,
  'a survivor targets a distinctly different departure column');
const step = Math.sign(contacts.test.turnaroundX(frog) - frog.x);
assert.ok(contacts.test.shoreApproachScore(frog, frog.x, frog.y, frog.x + step, frog.y) >
  contacts.test.shoreApproachScore(frog, frog.x, frog.y, frog.x, frog.y - 1),
  'route scoring favors shifting along the bank before returning to traffic');
frog.y = 0;
contacts.test.completeCrossing(frog);
contacts.test.completeCrossing(frog);
assert.equal(frog.crossings, 2);
assert.ok(contacts.test.frogBodyScale(frog) > firstWinSize, 'the successful return grows the frog again');
const returnSize = contacts.test.frogBodyScale(frog);
contacts.test.completeCrossing(frog);
assert.equal(contacts.test.frogBodyScale(frog), returnSize, 'resting at an end cannot repeatedly grow a frog');
const beforeBrood = contacts.test.frogs.length;
contacts.test.spawnFrogBrood(frog, {row: 1, x: frog.x, y: 1, id: 'test', seed: 12});
assert.equal(contacts.test.frogs.length, beforeBrood + 3);
assert.ok(contacts.test.frogs.slice(-3).every(child => child.crossings === 0), 'offspring start with no wins');

// Resizing during a hop preserves growth and normalized departure targets.
const resizeRun = simulation();
const moving = resizeRun.test.frogs[0];
moving.hop = 0.4; moving.nextMoveAt = Infinity;
moving.crossings = 3;
moving.turnaroundU = 0.8;
resizeRun.env.window.innerWidth = 390; resizeRun.env.window.innerHeight = 844;
resizeRun.events.resize();
assert.ok(Number.isFinite(moving.nextMoveAt), 'a resized hop resumes planning');
assert.equal(moving.crossings, 3);
assert.equal(moving.turnaroundU, 0.8);
assert.equal(resizeRun.api.getState().roadHeightFraction, .8);
resizeRun.env.window.innerWidth = 844; resizeRun.env.window.innerHeight = 390;
resizeRun.events.resize();
assert.equal(resizeRun.api.getState().roadHeightFraction, .8, 'short landscape view uses actual screen height');
assert.equal(sim.textDraws, 0, 'the sketch renders no counters or other visible text');

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
  let reachedTop = false, turnedBack = false, mostCrossings = 0, offBoard = false, shiftedDeparture = false;
  const wonAt = new Map();
  for (let i = 0; i < 6000; i++) {
    run.test.update(1 / 60);
    const live = run.api.getState().frogs.filter(f => f.alive);
    if (live.some(f => f.y >= rows - 1)) reachedTop = true;
    if (reachedTop && live.some(f => f.heading < 0)) turnedBack = true;
    if (live.some(f => f.y < 0 || f.y > rows - 1)) offBoard = true;
    live.forEach(frog => {
      if (frog.repositioning && !wonAt.has(frog.id)) wonAt.set(frog.id, frog.x);
      if (wonAt.has(frog.id) && Math.abs(frog.x - wonAt.get(frog.id)) >= run.test.cols * 0.2) shiftedDeparture = true;
    });
    mostCrossings = Math.max(mostCrossings, ...live.map(f => f.crossings));
  }
  const state = run.api.getState();
  assert.ok(reachedTop, 'a frog reaches the top field');
  assert.ok(turnedBack, 'reaching the top field turns a frog around');
  assert.ok(state.frogs.every(f => Number.isFinite(f.x) && Number.isFinite(f.y)));
  assert.ok(!offBoard, 'frogs stay on the board');
  assert.ok(mostCrossings >= 2, `a frog completes a round trip (saw ${mostCrossings} turns)`);
  assert.ok(shiftedDeparture, 'survivors actually relocate horizontally between passes');
  assert.ok(state.streamArrivals > 20, 'new frogs continue entering during survivor crossings');
  const arrivals = state.streamArrivals;
  run.api.eliminateAll();
  assert.equal(run.api.getState().live, 0);
  for (let i = 0; i < 120; i++) run.test.update(1 / 60);
  assert.ok(run.api.getState().streamArrivals > arrivals, 'the clock continues admitting after the last death');
  assert.ok(run.api.getState().live > 0, 'the stream remains active');
  run.env.window.innerWidth = 390; run.env.window.innerHeight = 844; run.events.resize();
  assert.ok(run.api.getState().frogs.every(f => f.x <= run.api.getState().columns - 0.25),
    'a resize keeps every frog on the narrower board');
  run.test.draw();
  assert.equal(run.api.getState().roadHeightFraction, .8, 'mobile keeps the 80% road');
  assert.equal(run.textDraws, 0, 'normal and reduced-motion views remain wordless');
  for (let i = 0; i < 120; i++) run.test.update(1 / 60);
}

// Long-running accumulation has a finite memory budget.
const accumulation = simulation();
for (let i = 0; i < 660; i++) accumulation.test.addBloodStain(accumulation.test.frogs[0], 'traffic');
accumulation.test.update(1 / 60);
assert.equal(accumulation.test.stains.length, 640);
const archive = simulation();
for (let i = 0; i < 160; i++) {
  const frog = {...archive.test.frogs[0], id: i, path: null, x: 3, y: archive.api.getState().fieldRows};
  archive.test.recordFrogPath(frog);
  frog.x += 1;
  archive.test.recordFrogPath(frog);
  frog.path.alive = false;
}
assert.equal(archive.test.paths.length, 128, 'old completed paths have a bounded archive');
const looping = archive.test.frogs[0];
archive.test.recordFrogPath(looping);
for (let i = 0; i < 1100; i++) {
  looping.x += i % 2 ? -1 : 1;
  archive.test.recordFrogPath(looping);
}
assert.ok(looping.path.points.length <= 1024, 'an exceptionally long life has bounded route geometry');
console.log(`Passed ${samples} collision samples, lifetime pigment and splash growth, persistent paths, newborn color reset, growth per winning pass, faint-to-strong route rendering, stationary paint under traffic, pale cars, 80% road layout, continuous arrivals before wins, changing departure columns, no visible text, caches, visibility, normal/reduced-motion lifecycle, resize, and bounded stain/path history.`);

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
