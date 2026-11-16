import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../pieces/003-unbreakable/index.html', import.meta.url), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function simulation(width, height, seed) {
  const noop = () => {};
  const context = new Proxy({}, { get: () => noop, set: () => true });
  const canvas = { style: {}, getContext: () => context };
  const env = {
    Math: Object.assign(Object.create(Math), { random: () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    } }),
    document: { getElementById: () => canvas },
    window: { innerWidth: width, innerHeight: height, devicePixelRatio: 1 },
    performance: { now: () => 0 },
    addEventListener: noop, requestAnimationFrame: () => 1, cancelAnimationFrame: noop,
  };
  vm.createContext(env);
  vm.runInContext(`${source}
    globalThis.game = {
      reset, draw, recoverBall,
      step: () => updatePhysics(PHYSICS_STEP),
      get bricks() { return bricks; },
      get cols() { return numCols; },
      get front() { return front; },
      get ball() { return ball; },
      get stats() { return impactStats; },
      get focus() { return buildFocus; },
      get gridY() { return gridY; },
    };
  `, env);
  return env.game;
}

function hsv(color) {
  assert.match(color, /^#[0-9a-f]{6}$/i, 'brick has a valid hex shade');
  const [r, g, b] = color.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), chroma = max - min;
  const sector = max === r ? (g - b) / chroma : max === g ? (b - r) / chroma + 2 : (r - g) / chroma + 4;
  return { hue: ((sector * 60) % 360 + 360) % 360, saturation: chroma / max, brightness: max };
}

function assertShade(color, index) {
  const shade = hsv(color);
  const expectedHue = ((30 + index * 3) % 360 + 360) % 360;
  const error = Math.abs(((shade.hue - expectedHue + 540) % 360) - 180);
  assert.ok(error < 1.5, `brick ${index} advances the gradient to ${expectedHue} degrees`);
  assert.ok(shade.saturation >= 0.37 && shade.saturation <= 0.73, 'saturation stays within its range');
  assert.ok(shade.brightness >= 0.598 && shade.brightness <= 0.952, 'brightness stays within its range');
  return shade;
}

const focusRegions = new Set();
const cases = [[1440, 1000], [390, 844], [844, 390]].flatMap(([width, height]) =>
  [1, 2026, 99].map(seed => [width, height, seed]));
for (const [width, height, seed] of cases) {
  const game = simulation(width, height, seed);
  for (const brick of game.bricks) assertShade(brick.color, brick.row * game.cols + brick.c);
  assertShade(game.ball.color, 0);
  const observed = new Map();
  const depositedColors = [];
  const targetCells = 241;
  let lastCells = -1;
  let steps = 0;
  let uneven = 0;
  let level = 0;
  let previousHits = 0;
  let fourRowSections = 0;
  while (game.stats.cells < targetCells && steps++ < 1_000_000) {
    game.step();
    if (game.stats.hits > previousHits) {
      const hitColumn = Math.floor(game.ball.x / (width / game.cols));
      assert.equal(hitColumn, game.ball.targetCol, 'ball reaches the column where the brick is added');
      previousHits = game.stats.hits;
    }
    if (steps % 12 === 0) {
      for (const brick of game.bricks) {
        const left = brick.c * width / game.cols;
        const top = game.gridY + brick.row * 24;
        const x = Math.max(left, Math.min(left + width / game.cols, game.ball.x));
        const y = Math.max(top, Math.min(top + 24, game.ball.y));
        if (Math.hypot(game.ball.x - x, game.ball.y - y) < 6.8) assert.fail(
          `ball clears the stepped wall (seed ${seed}, brick ${game.stats.cells}, column ${brick.c})`);
      }
    }
    if (game.stats.cells === lastCells) continue;
    if (game.stats.cells > 0) {
      const deposited = game.bricks.at(-1);
      depositedColors.push(assertShade(deposited.color, game.stats.cells - 1));
    }
    lastCells = game.stats.cells;
    for (const brick of game.bricks) {
      const key = `${brick.c}:${brick.row}`;
      if (observed.has(key)) assert.equal(brick.color, observed.get(key), 'older bricks retain their color');
      observed.set(key, brick.color);
    }
    const spread = Math.max(...game.front) - Math.min(...game.front);
    assert.ok(spread <= 5, `growth stays near the four-row lead: ${spread}`);
    if (spread > 1) uneven++;
    else level++;
    if (spread >= 4 && game.front.filter(row => row >= Math.min(...game.front) + 3).length >= 2) fourRowSections++;
    if (game.focus !== null) focusRegions.add(Math.round((game.focus - 0.18) / 0.32));
    game.draw();
  }
  assert.equal(game.stats.cells, targetCells, 'physics builds through two complete hue sweeps and wraps again');
  for (const channel of ['saturation', 'brightness']) {
    const values = depositedColors.map(shade => shade[channel]);
    assert.ok(Math.max(...values) - Math.min(...values) > 0.25, `${channel} varies independently across bricks`);
    assert.ok(values.some((value, i) => i > 0 && value < values[i - 1]) &&
      values.some((value, i) => i > 0 && value > values[i - 1]), `${channel} varies in both directions`);
  }
  assert.equal(game.stats.misses, 0);
  assert.equal(game.stats.recoveries, 0);
  assert.ok(uneven > 5, 'regional runs visibly build ahead before a row is complete');
  assert.ok(fourRowSections > 0, 'sections build four rows ahead before lower areas catch up');
  assert.ok(level > 5, 'catch-up passes return the wall to a broadly level front');

  // Relaunching without a completed brick must keep its planned color.
  game.recoverBall();
  const nextColor = game.ball.color;
  assertShade(nextColor, targetCells);
  game.recoverBall();
  assert.equal(game.ball.color, nextColor);

  game.reset();
  assert.equal(game.stats.cells, 0);
  for (const brick of game.bricks) assertShade(brick.color, brick.row * game.cols + brick.c);
  assertShade(game.ball.color, 0);
  assert.equal('trail' in game.ball, false, 'ball stays trail-free');
  console.log(`${width}×${height}, seed ${seed}: 241 bricks, hue sweeps, randomized shades, regional growth, physical clearance, and restart passed`);
}
assert.deepEqual([...focusRegions].sort(), [0, 1, 2], 'building visits left, center, and right');
