// Dependency-free behavior regression checks. Run: node scripts/check-mario.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../pieces/016-up-mario/index.html', import.meta.url), 'utf8');
const source = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
function simulation(seed = 'competence', width = 1280, height = 720, reduced = false, hazards = false) {
  const noop = () => {};
  const paint = new Proxy(noop, { get: () => paint, apply: () => paint, set: () => true });
  const canvas = { getContext: () => paint, style: {}, addEventListener: noop };
  const sandbox = {
    URLSearchParams, Math, Date, Set, Map, Image: class {},
    location: { search: `?seed=${seed}` }, innerWidth: width, innerHeight: height, devicePixelRatio: 1,
    document: { getElementById: id => id === 'stage' ? canvas : {} },
    matchMedia: () => ({ matches: reduced, addEventListener: noop }),
    requestAnimationFrame: () => 1, cancelAnimationFrame: noop, addEventListener: noop,
  };
  vm.createContext(sandbox);
  // Expose the real sketch only inside this test VM; no test API ships in the piece.
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, `globalThis.sim = {
    update, render, routeToPlatform, chooseMarioBuddyTarget, launchMarioBuddy,
    steerMarioBuddy, updateMarioBuddies, landingBounds, committedMarioRoute,
    updatePlatformStates, breakCloudPlatform, cloudLayerPositions, chooseMarioWalkIn, startMarioWalkIn,
    marioEntryCeiling, highestMario, marioIsOnStage, canPlacePlatform,
    updateHero, updateCamera, updateBarrels, defeatMario, barrelHitsMario, sceneScreenY,
    disableBarrels() { nextBarrelAt = Infinity; barrelWarning = null; barrels = []; },
    advanceClock(seconds) { simTime += seconds; },
    get state() { return { hero, buddies, platforms, simTime, bestHeight, barrels, barrelWarning, cameraY }; },
    get visible() { return [hero, ...buddies].filter(r => !r.dead && !r.entryPending && marioIsOnStage(r)).length; }
  }; })();`), sandbox);
  if (!hazards) sandbox.sim.disableBarrels();
  return sandbox.sim;
}
const platform = (id, x, y, w) => ({ id, x, y, w, type: 'ink', moving: false });
{
  const sim = simulation();
  const from = platform(101, 100, 100, 240);
  const to = platform(102, 370, 210, 150);
  const buddy = { id: 1, x: 130, y: 100, grounded: true, platformId: 101 };
  const route = sim.routeToPlatform(from, to, 650, buddy);
  assert.ok(route && route.launchX > buddy.x + 100, 'long jumps require a run-up');
  sim.launchMarioBuddy(buddy, from, route);
  assert.equal(buddy.grounded, true, 'cannot launch before reaching the takeoff point');
  buddy.x = route.launchX;
  sim.launchMarioBuddy(buddy, from, route);
  assert.equal(buddy.grounded, false);
  assert.equal(buddy.landingX, route.landingX, 'preserve the planned landing point');
  sim.state.platforms.splice(0, sim.state.platforms.length, from, to);
  sim.state.buddies.splice(0, sim.state.buddies.length, buddy);
  for (let i = 0; i < 60 && !buddy.grounded; i++) sim.updateMarioBuddies(1 / 60);
  assert.equal(buddy.platformId, to.id, 'a lined-up lateral jump lands on its target');
}
{
  const sim = simulation('narrow', 390);
  const from = platform(101, -126, 100, 176);
  const to = platform(102, -126, 214, 195);
  assert.ok(sim.routeToPlatform(from, to, 650, { x: 26 }), 'small visible shelf remains usable');
}
{
  const sim = simulation();
  const ledge = platform(101, 230, 100, 140);
  sim.state.platforms.splice(0, sim.state.platforms.length, ledge);
  const buddy = { id: 1, x: 200, y: 220, vy: -80, vx: -40, falling: true, targetId: null };
  sim.steerMarioBuddy(buddy, 1 / 60);
  assert.equal(buddy.targetId, ledge.id, 'a falling runner finds a reachable recovery ledge');
  assert.equal(buddy.falling, false);
}
{
  const sim = simulation('edge-traffic', 390);
  const from = platform(101, -33.35536788031459, 100, 86.71073576062918);
  const to = platform(102, 117.41814768417757, 199.62631015852094, 112.20435866713524);
  sim.state.platforms.splice(0, sim.state.platforms.length, from, to);
  sim.state.buddies.splice(0, sim.state.buddies.length,
    { id: 50, x: 150, y: to.y, grounded: true, platformId: to.id });
  for (const x of [-30, 20, 50]) {
    for (let id = 1; id <= 12; id++) {
      assert.ok(sim.routeToPlatform(from, to, 650, { id, x }),
        'crowding cannot round a reachable edge jump out of range');
    }
  }
}
// Traffic must not turn a chosen jump into a new decision every frame.
{
  const sim = simulation();
  const from = platform(101, 100, 100, 200);
  const to = platform(102, 330, 200, 220);
  const onward = platform(103, 350, 300, 180);
  sim.state.platforms.splice(0, sim.state.platforms.length, from, to, onward);
  const runner = { id: 1, x: 220, y: 100, grounded: true, platformId: from.id };
  const neighbor = { id: 2, x: 250, y: 100, grounded: true, platformId: from.id };
  sim.state.buddies.splice(0, sim.state.buddies.length, runner, neighbor);
  const chosen = sim.committedMarioRoute(from, runner);
  const other = sim.committedMarioRoute(from, neighbor);
  assert.ok(Math.abs(chosen.landingX - other.landingX) >= 26, 'reserve separate landing spaces');
  neighbor.platformId = to.id;
  neighbor.x = chosen.landingX;
  assert.equal(sim.committedMarioRoute(from, runner), chosen, 'traffic does not make the runner dither');
  to.collapsed = true;
  assert.notEqual(sim.committedMarioRoute(from, runner)?.target.id, to.id, 'invalidate a collapsed target');
}
{
  const sim = simulation();
  const from = platform(101, 100, 200, 240);
  const below = platform(102, 160, 100, 100);
  sim.state.platforms.splice(0, sim.state.platforms.length, from, below);
  assert.equal(sim.routeToPlatform(from, below, 650, { id: 1, x: 220 }), null,
    'reject a downward jump that catches its starting shelf again');
}
// Keep a clear gap between platform bodies, including their full motion
// range and the footprint a shrinking cloud will occupy after regrowth.
function assertPlatformSpacing(platforms) {
  for (let i = 0; i < platforms.length; i++) {
    const a = platforms[i];
    for (const b of platforms.slice(i + 1)) {
      if (Math.abs(a.y - b.y) >= 42) continue;
      const left = p => Math.min(p.x, p.baseX ?? p.x) - (p.travel || 0);
      const right = p => Math.max(p.x + p.w, (p.baseX ?? p.x) + (p.baseW ?? p.w)) + (p.travel || 0);
      const gap = Math.max(left(a) - right(b), left(b) - right(a));
      assert.ok(gap >= 18, `platforms ${a.id}/${b.id} must not stack or overlap`);
    }
  }
}
{
  const sim = simulation('crowd', 390);
  assertPlatformSpacing(sim.state.platforms); // Previously a branch sat directly on the next main ledge.
  const solid = platform(101, 100, 300, 150);
  const bricks = { ...platform(102, 100, 300.25, 150), type: 'crumble' };
  sim.state.platforms.splice(0, sim.state.platforms.length, solid);
  assert.equal(sim.canPlacePlatform(bricks), false, 'reject bricks directly over a solid ledge');
  assert.equal(sim.canPlacePlatform(bricks, 'relaxed'), false, 'edge extensions cannot bypass spacing');
  const moving = { ...platform(103, 300, 310, 100), moving: true, travel: 80 };
  assert.equal(sim.canPlacePlatform(moving), false, 'reserve the complete horizontal motion range');
}
// Cloud landings retain their erosion and recovery without a crowd impact
// destroying the entire platform on one frame.
{
  const sim = simulation();
  const cloud = { ...platform(101, 100, 100, 240), type: 'cloud', baseX: 100, baseW: 240 };
  sim.state.platforms.splice(0, sim.state.platforms.length, cloud);
  const buddy = { id: 1, x: 220, y: 100, localX: 120, grounded: true, platformId: cloud.id };
  sim.state.buddies.splice(0, sim.state.buddies.length, buddy);
  for (let i = 0; i < 4; i++) sim.breakCloudPlatform(cloud);
  assert.ok(!cloud.collapseAt, 'a group landing shares one cloud impact');
  assert.ok(cloud.w < cloud.baseW, 'cloud landings shed chunks');
  sim.advanceClock(4.2);
  sim.updatePlatformStates();
  assert.equal(cloud.w, cloud.baseW, 'partially eroded clouds regrow');
  assert.equal(cloud.x + buddy.localX, buddy.x, 'regrowth preserves a standing runner position');
}
{
  const sim = simulation('parallax');
  const far = { y: 0.4, parallax: 0.12 };
  const near = { y: 0.4, parallax: 0.48 };
  const shift = (part, camera) => sim.cloudLayerPositions(part, 720, 200, camera)[0];
  assert.ok(Math.abs(shift(far, 100) - shift(far, 0) - 12) < 0.001, 'far clouds scroll with ascent');
  assert.ok(Math.abs(shift(near, 100) - shift(near, 0) - 48) < 0.001, 'near clouds move faster');
  assert.ok(shift(near, -100) < shift(near, 0), 'descending reverses the same parallax');
  const seam = (720 * 1.35 - 720 * near.y) / near.parallax;
  assert.ok(Math.abs(shift(near, seam + 0.01) - shift(near, seam - 0.01)) < 0.02,
    'repeating cloud layers cross the wrap without a visible jump');
  for (const altitude of [-1e6, 0, 1e6]) {
    const positions = sim.cloudLayerPositions(near, 720, 1000, altitude);
    assert.ok(positions.length <= 2 && positions.every(Number.isFinite), 'endless sky uses bounded copies');
  }
  const reduced = simulation('parallax', 1280, 720, true);
  const gentleShift = reduced.cloudLayerPositions(near, 720, 200, 100)[0] -
    reduced.cloudLayerPositions(near, 720, 200, 0)[0];
  assert.ok(gentleShift > 0 && gentleShift < 12, 'reduced motion softens background travel');
}
// Entrances rotate instead of repeatedly pouring out of one shelf.
{
  const sim = simulation('entrance-spacing');
  const left = platform(101, -220, 300, 500);
  const nearby = platform(102, -220, 350, 500);
  const right = platform(103, 1080, 250, 500);
  sim.state.platforms.splice(0, sim.state.platforms.length, left, nearby, right);
  sim.state.buddies.splice(0);
  Object.assign(sim.state.hero, { x: 600, y: 600, grounded: true, groundId: null });
  const entrant = { id: 1 };
  sim.startMarioWalkIn(entrant, left, 1);
  sim.state.buddies.push(entrant);
  assert.equal(sim.chooseMarioWalkIn()?.platform.id, right.id,
    'use another side while the previous entrance area rests');
  sim.state.platforms.pop();
  assert.equal(sim.chooseMarioWalkIn(), null, 'wait instead of using the same or neighboring shelf');
  sim.advanceClock(8.1);
  sim.state.platforms.splice(1);
  assert.equal(sim.chooseMarioWalkIn(), null, 'do not queue behind a runner still walking in');
  Object.assign(entrant, { entryFrom: null, entryPending: false, platformId: null, grounded: false });
  assert.equal(sim.chooseMarioWalkIn()?.platform.id, left.id,
    'an entrance becomes reusable after cooldown and the earlier arrival clears');
}
// New arrivals never inherit the lead, including while the leader falls.
{
  const sim = simulation('entrance-height');
  const below = platform(101, -220, 300, 500);
  const level = platform(102, -220, 500, 500);
  const above = platform(103, -220, 600, 500);
  sim.state.platforms.splice(0, sim.state.platforms.length, below, level, above);
  sim.state.buddies.splice(0);
  Object.assign(sim.state.hero, { x: 400, y: 500, grounded: true, groundId: level.id });
  assert.equal(sim.chooseMarioWalkIn()?.platform.id, below.id, 'only a shelf below the leader is eligible');
  sim.state.platforms.splice(0, 1);
  assert.equal(sim.chooseMarioWalkIn(), null, 'wait when all entrances are at or above the leader');
  sim.state.platforms.unshift(below);
  const entrant = { id: 1 };
  sim.startMarioWalkIn(entrant, below, 1);
  sim.state.buddies.push(entrant);
  const outsideX = entrant.x;
  sim.state.hero.y = 250;
  sim.updateMarioBuddies(1 / 60);
  assert.equal(entrant.x, outsideX, 'an inbound runner waits when the leader falls below its entrance');
  assert.ok(!sim.marioIsOnStage(entrant), 'waiting runner remains offscreen');
  assert.equal(sim.highestMario().id, 0, 'a waiting entrant cannot become the camera leader');
  sim.state.hero.y = 500;
  for (let i = 0; i < 120 && entrant.entryPending; i++) sim.updateMarioBuddies(1 / 60);
  assert.equal(entrant.entryPending, false, 'the runner can walk in once the leader is higher again');
  assert.ok(entrant.y < sim.state.hero.y, 'admission remains below the leader');
  sim.state.buddies.splice(0);
  Object.assign(sim.state.hero, { y: -2000, vy: -980, grounded: false, groundId: null });
  assert.ok(sim.chooseMarioWalkIn(), 'an exhausted run may restart from an available shelf');
}
// Barrels are a separate hazard layer; the original route checks below run
// without hazards so deliberate deaths cannot conceal navigation regressions.
{
  const sim = simulation('warning', 1280, 720, false, true);
  sim.advanceClock(6);
  sim.updateBarrels(0);
  assert.ok(sim.state.barrelWarning, 'a drop is announced first');
  assert.equal(sim.state.barrels.length, 0, 'the warning itself is harmless');
  sim.advanceClock(0.84);
  sim.updateBarrels(0);
  assert.equal(sim.state.barrels.length, 0, 'the full warning precedes the drop');
  sim.advanceClock(0.02);
  sim.updateBarrels(0);
  assert.equal(sim.state.barrels.length, 1, 'one barrel follows the warning');
  assert.ok(sim.sceneScreenY(sim.state.barrels[0].y) < 0, 'barrels begin beyond the top edge');
}
{
  const sim = simulation('swept-hit');
  const runner = { id: 1, x: 220, y: 100, previousX: 220, previousY: 100 };
  const barrel = { x: 220, y: 70, previousX: 220, previousY: 200, vx: 100, radius: 17 };
  assert.ok(sim.barrelHitsMario(barrel, runner), 'a fast falling barrel cannot tunnel through a Mario');
  assert.equal(sim.barrelHitsMario(barrel, { ...runner, x: 280, previousX: 280 }), false, 'a near miss is safe');
  assert.equal(sim.barrelHitsMario(barrel, { ...runner, entryPending: true }), false, 'waiting entrants cannot be killed offscreen');
  assert.equal(sim.barrelHitsMario(barrel, { ...runner, dead: true }), false, 'one death cannot retrigger');
}
{
  const sim = simulation('barrel-roll');
  const ledge = platform(101, 100, 100, 160);
  sim.state.platforms.splice(0, sim.state.platforms.length, ledge);
  sim.state.buddies.splice(0);
  Object.assign(sim.state.hero, { x: 1000, y: 700, previousX: 1000, previousY: 700 });
  const barrel = { id: 1, x: 160, y: 240, previousX: 160, previousY: 240, vx: 100, vy: -400,
    radius: 17, rotation: 0, bornAt: 0, platformId: null };
  sim.state.barrels.push(barrel);
  for (let i = 0; i < 20; i++) sim.updateBarrels(1 / 60);
  assert.equal(barrel.platformId, ledge.id, 'falling barrels land on solid ledges');
  assert.equal(barrel.y, ledge.y + barrel.radius);
  for (let i = 0; i < 90; i++) sim.updateBarrels(1 / 60);
  assert.equal(barrel.platformId, null, 'a rolling barrel leaves the platform edge');
  assert.ok(barrel.y < ledge.y, 'it resumes falling instead of hovering at the edge');
}
{
  const sim = simulation('knockout');
  const survivor = sim.state.buddies[0];
  sim.state.buddies.splice(1);
  Object.assign(sim.state.hero, { x: 220, y: 500, previousY: 500, grounded: true });
  Object.assign(survivor, { x: 300, y: 350, previousY: 350, grounded: true });
  const barrel = { x: 220, vx: 100 };
  sim.defeatMario(sim.state.hero, barrel);
  assert.ok(sim.state.hero.dead && !sim.state.hero.grounded, 'a hit kills the lead Mario');
  assert.equal(sim.highestMario().id, survivor.id, 'camera leadership passes to a survivor immediately');
  for (let i = 0; i < 120; i++) sim.updateHero(1 / 60);
  assert.ok(sim.state.hero.dead && !sim.state.hero.grounded, 'a knocked-out Mario cannot land or recover');
  sim.defeatMario(survivor, barrel);
  assert.equal(sim.highestMario(), null, 'dead bodies cannot keep leading the camera');
  const camera = sim.state.cameraY;
  sim.updateCamera(1 / 60);
  assert.equal(sim.state.cameraY, camera, 'hold the scene when the whole pack is knocked out');
  assert.equal(sim.marioEntryCeiling(), Infinity, 'a full wipe allows a fresh entrance');
  const shelf = platform(101, -220, 300, 500);
  sim.state.platforms.splice(0, sim.state.platforms.length, shelf);
  sim.startMarioWalkIn(sim.state.hero, shelf, 1);
  assert.ok(!sim.state.hero.dead && sim.state.hero.entryPending, 'the hero can return through an offscreen entrance');
  assert.ok(!sim.marioIsOnStage(sim.state.hero), 'revival does not pop into the visible scene');
  for (let i = 0; i < 120 && sim.state.hero.entryPending; i++) sim.updateHero(1 / 60);
  assert.ok(!sim.state.hero.entryPending && sim.state.hero.grounded, 'the revived hero walks into play');
}
const results = [];
for (const width of [1280, 390]) {
  for (const seed of ['competence', 'summer', 'crowd']) {
    const sim = simulation(seed, width);
    const tracking = new Map();
    const generatedTypes = new Map();
    let attempts = 0, successes = 0, visible = 0;
    for (let frame = 0; frame < 5400; frame++) {
      const before = [sim.state.hero, ...sim.state.buddies].map(r => ({ ...r }));
      sim.update(1 / 60);
      const runners = [sim.state.hero, ...sim.state.buddies];
      assert.ok(sim.state.buddies.filter(b => b.entryPending ||
        (b.entryFrom && !sim.marioIsOnStage(b))).length <= 2, 'at most two offscreen arrivals at once');
      for (let i = 0; i < before.length; i++) {
        const a = before[i], b = runners[i];
        assert.ok(Number.isFinite(b.x) && Number.isFinite(b.y), 'finite runner physics');
        if (b.entryPending && b.entryStartedAt === sim.state.simTime) {
          assert.ok(b.y < sim.marioEntryCeiling(), 'scheduled entrance stays below the active leader');
        }
        if (a.entryPending && !b.entryPending) {
          const established = runners.filter(r => r.id !== b.id && !r.entryPending);
          const stillInPlay = established.some(r => r.grounded || r.vy >= 0 || sim.marioIsOnStage(r));
          if (stillInPlay) assert.ok(b.y < Math.max(...established.map(r => r.y)),
            'a runner cannot enter the scene above the existing leader');
        }
        if (a.grounded && !b.grounded && b.vy > 0) { attempts++; tracking.set(b.id, a.y); }
        if (!a.grounded && b.grounded) {
          if (b.y > tracking.get(b.id) + 25) successes++;
          tracking.delete(b.id);
        }
      }
      visible += sim.visible;
      if (frame % 300 === 0) {
        sim.render();
        assertPlatformSpacing(sim.state.platforms);
        for (const platform of sim.state.platforms) generatedTypes.set(platform.id, platform.type);
      }
    }
    const types = [...generatedTypes].sort((a, b) => a[0] - b[0]).map(([, type]) => type);
    assert.ok(types.every(type => type === 'ink' || type === 'crumble' || type === 'cloud'), 'only solid, crumbly, and cloud platforms generate');
    for (let i = 0; i + 20 <= types.length; i += 20) {
      assert.equal(new Set(types.slice(i, i + 20)).size, 3, 'all three materials appear throughout the climb');
    }
    const rate = successes / attempts;
    assert.ok(rate > 0.8, `${seed}/${width}: most jumps should gain a ledge (${rate})`);
    assert.ok(sim.state.bestHeight > 5000, `${seed}/${width}: keep progressing through the mixed course`);
    // The height rule takes priority over replenishing the crowd: some runs
    // must wait for a lower entrance instead of spawning ahead of the leader.
    assert.ok(visible / 5400 > 4, `${seed}/${width}: retain company through legal entrances`);
    results.push({ seed, width, upwardLandings: `${Math.round(rate * 100)}%`, height: Math.round(sim.state.bestHeight) });
  }
}
// Check slower frames independently of render rate.
const slow = simulation('summer', 390, 844);
for (let i = 0; i < 1800; i++) slow.update(1 / 30);
slow.render();
assert.ok(slow.state.bestHeight > 4000, '30 fps still climbs');
const hazardResults = [];
for (const width of [1280, 390]) {
  for (const seed of ['competence', 'summer', 'crowd']) {
    const sim = simulation(seed, width, 720, false, true);
    let deaths = 0, returns = 0;
    for (let frame = 0; frame < 5400; frame++) {
      const before = [sim.state.hero, ...sim.state.buddies].map(r => ({ ...r }));
      sim.update(1 / 60);
      const runners = [sim.state.hero, ...sim.state.buddies];
      assert.ok(sim.state.barrels.length <= 3, 'barrel population remains bounded');
      for (const barrel of sim.state.barrels) assert.ok(Number.isFinite(barrel.x) && Number.isFinite(barrel.y));
      for (let i = 0; i < before.length; i++) {
        const a = before[i], b = runners[i];
        assert.ok(Number.isFinite(b.x) && Number.isFinite(b.y));
        if (b.dead && !a.dead) deaths++;
        if (a.dead && !b.dead) {
          returns++;
          assert.ok(b.entryPending && !sim.marioIsOnStage(b), 'defeated Marios return only offscreen');
        }
        if (b.entryPending && b.entryStartedAt === sim.state.simTime) {
          assert.ok(b.y < sim.marioEntryCeiling(), 'barrel casualties do not bypass entrance height rules');
        }
      }
      const leader = sim.highestMario();
      assert.ok(!leader || (!leader.dead && !leader.entryPending));
      if (frame % 300 === 0) sim.render();
    }
    assert.ok(deaths > 0, 'barrels can actually kill runners during play');
    assert.ok(returns > 0, 'the crowd recovers from casualties');
    assert.ok(sim.state.bestHeight > 2500, 'the climb continues with live hazards');
    hazardResults.push({ seed, width, deaths, returns, height: Math.round(sim.state.bestHeight) });
  }
}
const slowHazards = simulation('summer', 390, 844, false, true);
for (let i = 0; i < 1800; i++) slowHazards.update(1 / 30);
assert.ok(slowHazards.state.bestHeight > 2500, 'barrel collisions also work at 30 fps');
console.table(hazardResults);
console.table(results);
console.log('Mario behavior checks passed.');
