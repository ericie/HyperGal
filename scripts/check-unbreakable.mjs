import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../pieces/003-unbreakable/index.html', import.meta.url), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function simulation(width, height) {
  const noop = () => {};
  const context = new Proxy({}, { get: () => noop, set: () => true });
  const canvas = { style: {}, getContext: () => context };
  const env = {
    document: { getElementById: () => canvas },
    window: { innerWidth: width, innerHeight: height, devicePixelRatio: 1 },
    performance: { now: () => 0 },
    addEventListener: noop, requestAnimationFrame: () => 1, cancelAnimationFrame: noop,
  };
  vm.createContext(env);
  vm.runInContext(`${source}
    globalThis.game = {
      rainbow: RAINBOW, reset, draw, recoverBall,
      step: () => updatePhysics(PHYSICS_STEP),
      get bricks() { return bricks; },
      get cols() { return numCols; },
      get front() { return front; },
      get ball() { return ball; },
      get stats() { return impactStats; },
    };
  `, env);
  return env.game;
}

for (const [width, height] of [[1440, 1000], [390, 844]]) {
  const game = simulation(width, height);
  const expected = ['#ef4545', '#f58335', '#f5ce45', '#a8d948', '#44bd72', '#34b7a0',
    '#3cbed5', '#478fe0', '#6864d9', '#a05bce', '#d958b0', '#ed5680'];
  assert.deepEqual(Array.from(game.rainbow), expected, 'palette follows rainbow order');
  assert.ok(game.bricks.every(brick => expected.includes(brick.color)), 'opening wall uses the rainbow');
  const observed = new Map();
  const targetCells = game.cols * 20;
  let lastCells = -1;
  let steps = 0;
  while (game.stats.cells < targetCells && steps++ < 1_000_000) {
    game.step();
    if (game.stats.cells === lastCells) continue;
    if (game.stats.cells > 0) {
      const deposited = game.bricks.at(-1);
      assert.equal(deposited.color, expected[(game.stats.cells - 1) % expected.length],
        'each completed brick advances exactly one rainbow color, including across rows');
    }
    lastCells = game.stats.cells;
    for (const brick of game.bricks) {
      const key = `${brick.c}:${brick.row}`;
      assert.ok(expected.includes(brick.color), `brick ${key} uses a rainbow color`);
      if (observed.has(key)) assert.equal(brick.color, observed.get(key), 'older bricks retain their color');
      observed.set(key, brick.color);
    }
    assert.ok(Math.max(...game.front) - Math.min(...game.front) <= 1, 'growth stays level');
    game.draw();
  }
  assert.equal(game.stats.cells, targetCells, 'physics builds through repeated rainbow cycles');
  assert.equal(game.stats.misses, 0);
  assert.equal(game.stats.recoveries, 0);

  // Relaunching without a completed brick must not skip a rainbow color.
  game.recoverBall();
  const nextColor = expected[targetCells % expected.length];
  assert.equal(game.ball.color, nextColor);
  game.recoverBall();
  assert.equal(game.ball.color, nextColor);

  game.reset();
  assert.equal(game.stats.cells, 0);
  assert.ok(game.bricks.every(brick => expected.includes(brick.color)));
  assert.equal(game.ball.color, expected[0], 'restart begins at red');
  assert.equal('trail' in game.ball, false, 'ball stays trail-free');
  console.log(`${width}×${height}: 20 rows, per-brick rainbow order, preserved colors, recovery, and restart passed`);
}
