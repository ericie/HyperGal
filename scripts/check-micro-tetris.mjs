// Exercise startup density, legal single-piece gravity, and animated row clearing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../pieces/058-micro-tetris/', import.meta.url);
const recipes = fs.readFileSync(new URL('recipes.js', root), 'utf8');
const source = fs.readFileSync(new URL('tetris.js', root), 'utf8').replace(/\}\)\(\);\s*$/, `
  globalThis.check = { advance, clearRows, reset, fits, spawn,
    get clearing() { return clearing; }, get active() { return active; }, get locked() { return locked; },
    get cleared() { return cleared; }, get generation() { return generation; },
    get board() { return board; } };
})();`);

for (const [width, height] of [[390, 844], [1200, 800], [391, 845], [40, 128], [32, 128], [10, 32], [7, 24], [1, 16]]) {
  let seed = 56;
  const math = Object.create(Math);
  math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const context = { fillRect() {} };
  const canvas = { getContext: () => context, addEventListener() {}, setAttribute() {}, dataset: {}, style: {} };
  const env = { Math: math, window: {}, document: { querySelector: () => canvas, hidden: false },
    innerWidth: width, innerHeight: height, matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame() {}, addEventListener() {}, setTimeout, clearTimeout };
  vm.createContext(env);
  vm.runInContext(recipes, env);
  vm.runInContext(source, env);
  const check = env.check;
  const columns = Math.max(1, Math.ceil(width / 4));
  const rows = Math.max(16, Math.ceil(height / 4));
  assert.equal(canvas.width, columns * 4);
  assert.equal(canvas.height, rows * 4);
  assert.equal(canvas.style.width, `${columns * 4}px`);
  assert.equal(canvas.style.height, `${rows * 4}px`);
  function checkEntry(piece) {
    const span = 1 + Math.max(...piece.piece.cells.map(([x]) => x));
    assert.equal(piece.x, Math.floor((columns - span) / 2), 'every piece starts horizontally centered');
    assert.equal(piece.y + Math.max(...piece.piece.cells.map(([, y]) => y)), rows - 1,
      'every piece enters at the top');
    assert.equal(piece.phase, 'falling', 'gravity starts immediately on entry');
    assert.ok(check.fits(piece.piece, piece.x, piece.y), 'entry never overlaps the stack');
  }
  function checkStartup() {
    const occupied = check.board.filter(Boolean).length;
    if (columns >= 5) {
      assert.ok(occupied > 0 && occupied <= columns * rows * .005 + 4,
        'starts with a sparse stack occupying at most about 0.5% of the board');
      for (let row = 0; row < rows; row++) {
        assert.ok(check.board.subarray(row * columns, (row + 1) * columns).some(value => value === 0),
          'every seeded row has gaps');
      }
      const depth = Math.max(4, Math.floor(rows * .1));
      assert.ok(check.board.subarray(depth * columns).every(value => value === 0),
        'starting blocks stay close to the floor');
      if (columns > 16) {
        const heights = [];
        for (let x = 0; x < columns; x++) {
          let top = depth - 1;
          while (top >= 0 && !check.board[top * columns + x]) top--;
          heights.push(top + 1);
        }
        assert.ok(Math.max(...heights) - Math.min(...heights) >= 2, 'stack has an uneven skyline');
        const unsupported = check.board.some((color, index) => {
          if (!color) return false;
          const x = index % columns, y = Math.floor(index / columns);
          return (x === 0 || !check.board[index - 1]) &&
            (x === columns - 1 || !check.board[index + 1]) &&
            (y === 0 || !check.board[index - columns]) && !check.board[index + columns];
        });
        assert.ok(!unsupported, 'settled pieces stay connected instead of becoming isolated pixels');
      }
    } else assert.equal(occupied, 0, 'extremely narrow fields start empty');
    assert.equal(check.locked, 0, 'seed pieces do not count as live drops');
    assert.equal(check.cleared, 0, 'seed rows do not clear on opening');
    checkEntry(check.active);
    return occupied;
  }
  let initialCells = checkStartup();
  let totalCleared = 0, totalLocked = 0, nudges = 0, turns = 0, reversals = 0;
  let decisiveDrops = 0, uncertainDrops = 0;
  const observed = new WeakSet();
  const directions = new WeakMap();
  // Wider fields need more single drops to complete a full-width row.
  for (let i = 0; i < Math.max(6000, columns * 80); i++) {
    if (check.clearing) {
      const before = check.cleared;
      const count = check.clearing.rows.length;
      const generation = check.generation;
      check.advance(1);
      if (check.generation !== generation) initialCells = checkStartup();
      else assert.equal(check.cleared, before + count, 'blink finishes before collapse');
      totalCleared += count;
      continue;
    }
    const falling = check.active;
    assert.ok(falling && !Array.isArray(falling), 'exactly one active tetromino');
    if (!observed.has(falling)) {
      observed.add(falling);
      if (falling.detour) uncertainDrops++;
      else decisiveDrops++;
    }
    const previousX = falling.x, previousTravel = falling.travel;
    const previousTop = falling.y + Math.max(...falling.piece.cells.map(([, y]) => y));
    const previousRotation = falling.rotation;
    const lockedBefore = check.locked;
    const generation = check.generation;
    check.advance(.05);
    if (check.generation !== generation) {
      initialCells = checkStartup();
      continue;
    }
    if (check.locked === lockedBefore) {
      assert.equal(check.active, falling, 'no new piece before contact');
      const top = falling.y + Math.max(...falling.piece.cells.map(([, y]) => y));
      assert.ok(top <= previousTop, 'moves and rotations never lift the falling piece');
      assert.ok(Math.abs((previousTop - previousTravel) - (top - falling.travel) - .05 * rows / 2.4) < 1e-6,
        'gravity advances at the same rate during movement, rotation, and hesitation');
      if (falling.rotation !== previousRotation) {
        turns++;
        const count = falling.shape.rotations.length;
        const delta = (falling.rotation - previousRotation + count) % count;
        assert.ok(delta === 1 || delta === count - 1, 'turns one quarter-turn at a time in either direction');
      }
      if (falling.x !== previousX) {
        nudges++;
        assert.ok(Math.abs(falling.x - previousX) <= Math.ceil(.05 / falling.nudgeInterval) + 2,
          'horizontal movement stays bounded and never teleports');
        const direction = Math.sign(falling.x - previousX);
        if (directions.has(falling) && directions.get(falling) !== direction) reversals++;
        directions.set(falling, direction);
      }
      assert.ok(check.fits(falling.piece, falling.x, falling.y), 'never overlaps the stack');
    } else {
      totalLocked++;
      assert.equal(check.locked, lockedBefore + 1, 'only one piece locks per drop');
      for (const [dx, dy] of falling.piece.cells) {
        assert.equal(check.board[(falling.y + dy) * columns + falling.x + dx], falling.piece.color,
          'all four squares lock at the falling shape’s location');
      }
      for (const [dx, dy] of falling.piece.cells) check.board[(falling.y + dy) * columns + falling.x + dx] = 0;
      assert.ok(check.fits(falling.piece, falling.x, falling.y) &&
        !check.fits(falling.piece, falling.x, falling.y - 1), 'locks only on real contact after falling');
      for (const [dx, dy] of falling.piece.cells) check.board[(falling.y + dy) * columns + falling.x + dx] = falling.piece.color;
      if (check.active) checkEntry(check.active);
      for (let y = 0; y < rows; y++) {
        const row = check.board.subarray(y * columns, (y + 1) * columns);
        assert.ok(row.some(value => value === 0) || check.clearing?.rows.includes(y), 'full rows wait for their blink');
      }
      assert.equal(check.board.filter(Boolean).length, initialCells + check.locked * 4 - check.cleared * columns,
        'only completed rows disappear');
    }
  }
  assert.ok(totalLocked > 100, 'continues dropping and locking pieces from the partly played stack');
  if (columns >= 5) {
    assert.ok(nudges > 0, 'pieces visibly nudge from center to their destinations');
    assert.ok(turns > 0, 'pieces visibly rotate while falling');
    assert.ok(decisiveDrops > 0 && uncertainDrops > 0, 'mixes direct drops with occasional indecision');
    if (columns > 16) assert.ok(reversals > 0, 'some drops reconsider their horizontal direction');
  }
  console.log(`${width} × ${height}: ${totalLocked} single drops, ${totalCleared} cleared rows, ${reversals} direction changes`);

  // Nonadjacent full rows blink, then collapse; incomplete rows retain their cells.
  check.reset();
  check.board.fill(0);
  check.board.fill(1, 0, columns);
  check.board.fill(2, 2 * columns, 3 * columns);
  if (columns > 1) check.board[columns] = 3;
  check.clearRows();
  assert.equal(check.clearing.rows.length, 2);
  check.advance(.1);
  assert.equal(check.cleared, 0, 'rows remain during blink');
  check.advance(1);
  assert.equal(check.cleared, 2);
  assert.equal(check.board[0], columns > 1 ? 3 : 0);
  assert.ok(check.board.subarray(columns).every(value => value === 0));
  check.reset();
  check.board.fill(0);
  check.board.fill(1, 0, columns * 4);
  check.clearRows();
  assert.equal(check.clearing.rows.length, 4);
  check.advance(.4);
  assert.equal(check.cleared, 0, 'four-line blink lasts longer');
  check.advance(.4);
  assert.equal(check.cleared, 4, 'four lines collapse together');

  check.board.fill(1);
  const generation = check.generation;
  check.spawn();
  assert.equal(check.generation, generation + 1, 'top-out starts a fresh partly played stack');
  checkStartup();
  for (let layout = 0; layout < 20; layout++) {
    check.reset();
    checkStartup();
  }
}
