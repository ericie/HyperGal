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
  function checkStartup() {
    const occupied = check.board.filter(Boolean).length;
    if (columns >= 5) {
      assert.ok(Math.abs(occupied / check.board.length - .08) <= 1 / check.board.length,
        '8% of board cells start occupied, rounded to a single square');
      for (let row = 0; row < rows; row++) {
        assert.ok(check.board.subarray(row * columns, (row + 1) * columns).some(value => value === 0),
          'every seeded row has gaps');
      }
      assert.ok(check.board.subarray((rows - 4) * columns).every(value => value === 0),
        'leaves room for the first falling shape');
      if (columns > 16) {
        const seededRows = Array.from({ length: rows }, (_, row) =>
          check.board.subarray(row * columns, (row + 1) * columns).some(Boolean)).filter(Boolean).length;
        assert.ok(seededRows >= rows * .2 && seededRows <= rows * .7 + 1,
          'spreads the sparse squares across a deeper, irregular field');
        const isolated = check.board.some((color, index) => {
          if (!color) return false;
          const x = index % columns;
          return (x === 0 || check.board[index - 1] !== color) &&
            (x === columns - 1 || check.board[index + 1] !== color) &&
            check.board[index - columns] !== color && check.board[index + columns] !== color;
        });
        assert.ok(isolated, 'startup includes isolated squares instead of only complete shapes');
      }
    } else assert.equal(occupied, 0, 'extremely narrow fields start empty');
    assert.equal(check.locked, 0, 'seed pieces do not count as live drops');
    assert.equal(check.cleared, 0, 'seed rows do not clear on opening');
    return occupied;
  }
  let initialCells = checkStartup();
  let totalCleared = 0, totalLocked = 0;
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
    const previousY = falling.y;
    const lockedBefore = check.locked;
    const generation = check.generation;
    check.advance(.05);
    if (check.generation !== generation) {
      initialCells = checkStartup();
      continue;
    }
    if (check.locked === lockedBefore) {
      assert.equal(check.active, falling, 'no new piece before contact');
      assert.ok(falling.y < previousY, 'falls down from the top');
      assert.ok(check.fits(falling.piece, falling.x, falling.y), 'never overlaps the stack');
    } else {
      totalLocked++;
      assert.equal(check.locked, lockedBefore + 1, 'only one piece locks per drop');
      for (const [dx, dy] of falling.piece.cells) {
        assert.equal(check.board[(falling.y + dy) * columns + falling.x + dx], falling.piece.color,
          'all four squares lock at the falling shape’s location');
      }
      if (check.active) assert.equal(check.active.y + Math.max(...check.active.piece.cells.map(([, y]) => y)), rows - 1,
        'next piece starts at the top');
      for (let y = 0; y < rows; y++) {
        const row = check.board.subarray(y * columns, (y + 1) * columns);
        assert.ok(row.some(value => value === 0) || check.clearing?.rows.includes(y), 'full rows wait for their blink');
      }
      assert.equal(check.board.filter(Boolean).length, initialCells + check.locked * 4 - check.cleared * columns,
        'only completed rows disappear');
    }
  }
  assert.ok(totalLocked > 100, 'continues dropping and locking pieces from the scattered field');
  assert.ok(totalCleared > 0 || check.generation > 1,
    'a scattered field either clears lines or restarts after topping out');
  console.log(`${width} × ${height}: ${totalLocked} single drops, ${totalCleared} animated cleared rows`);

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
  assert.equal(check.generation, generation + 1, 'top-out starts a fresh scattered field');
  checkStartup();
  for (let layout = 0; layout < 20; layout++) {
    check.reset();
    checkStartup();
  }
}
