// Normal adjacent-cube defense, simultaneous threats, and reduced motion.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../pieces/026-top-of-the-heap/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];

function simulation(seed, reduced, width = 780, height = 1000) {
  let shadowLandings = 0, summitBreaches = 0;
  const canvas = { style: {}, getContext: () => ({ setTransform() {} }), addEventListener() {} };
  const env = {
    innerWidth: width, innerHeight: height, devicePixelRatio: 1,
    Date: { now: () => seed },
    matchMedia: () => ({ matches: reduced, addEventListener() {} }),
    addEventListener() {}, requestAnimationFrame: () => 1,
    document: {
      getElementById: id => id === 'stage' ? canvas : { textContent: '' },
      documentElement: { style: { setProperty() {} } }, addEventListener() {},
    },
    recordClaim(row, owner) {
      if (owner !== 'shadow') return;
      shadowLandings++;
      if (row === 0) summitBreaches++;
    },
  };
  const instrumented = script.replace('function claimCube(row, column, owner) {',
    'function claimCube(row, column, owner) { recordClaim(row, owner);')
    .replace('      })();', `globalThis.test = {
      update, territoryPercentages,
      get state() { return { ball, players, yellowCount, totalCubes, rows }; },
      threatenSummit() {
        nextWaveAt = Infinity;
        waveRemaining = 0;
        ball.row = 5;
        ball.column = 2;
        ball.from = nodePoint(ball.row, ball.column);
        ball.to = nodePoint(4, ball.column - 1);
        ball.nextRow = 4;
        ball.nextColumn = ball.column - 1;
        ball.mode = 'bounce';
        ball.duration = 0.4;
        players = [0, 4].map((column, index) => ({
          id: 'threat-' + index, row: 4, column,
          from: nodePoint(4, column), to: nodePoint(3, Math.min(3, column)),
          startedAt: matchTime, duration: reducedMotion ? 1.18 : 0.62,
          nextColumn: Math.min(3, column), hue: 30, driftPhase: 0,
          entering: false, waiting: false, dead: false,
        }));
      }
    }; })();`);
  vm.createContext(env);
  vm.runInContext(instrumented, env);
  return { api: env.test, get shadowLandings() { return shadowLandings; }, get summitBreaches() { return summitBreaches; } };
}

let shadowLandings = 0, summitBreaches = 0;
const seenIcons = new Set();
for (const reduced of [false, true]) {
  const urgent = simulation(1000000, reduced);
  urgent.api.threatenSummit();
  urgent.api.update(0.04);
  assert.equal(urgent.api.state.ball.nextRow, 4,
    'a threat never retargets an in-flight hop to the summit');
  for (let frame = 0; frame < 600; frame++) urgent.api.update(1 / 30);
  assert.equal(urgent.api.state.players.length, 0, 'both approaching hazards are intercepted');
  assert.equal(urgent.summitBreaches, 0, 'simultaneous threats cannot pass the sun');
  assert(urgent.api.state.yellowCount > 1, 'the sun claims more territory after defending');

  for (let seed = 1; seed <= 24; seed++) {
    const mobile = seed % 2 === 0;
    const sim = simulation(seed * 55555, reduced, mobile ? 390 : 1280, mobile ? 844 : 800);
    for (let frame = 0; frame < 4500; frame++) {
      sim.api.update(frame % 2 ? 0.04 : 1 / 30);
      const state = sim.api.state;
      assert(state.ball.nextRow >= 0, 'sun stays on the heap');
      if (state.ball.mode === 'bounce') {
        const b = state.ball;
        const distance = Math.abs(b.column - b.nextColumn) +
          Math.abs((b.row - b.column) - (b.nextRow - b.nextColumn));
        assert(distance <= 1, 'every sun hop lands on the same or an adjacent cube');
      }
      for (const hazard of state.players) seenIcons.add(hazard.icon);
      assert(state.players.length <= 6, 'wave population remains bounded');
    }
    assert.equal(Object.values(sim.api.territoryPercentages()).reduce((a, b) => a + b, 0), 100);
    shadowLandings += sim.shadowLandings;
    summitBreaches += sim.summitBreaches;
  }
}
assert.deepEqual([...seenIcons].sort(), ['cigarette', 'dagger', 'gun', 'skull', 'whiskey']);
assert(shadowLandings > 1000, 'long matches exercise sustained hazards pressure');
assert.equal(summitBreaches, 0, 'ordinary hops protect the summit throughout the sampled matches');
console.log(JSON.stringify({ matches: 48, shadowLandings, summitBreaches, simultaneousThreats: 'passed', reducedMotion: 'passed' }));
