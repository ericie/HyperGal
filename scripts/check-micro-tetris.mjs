// Exercise single-piece gravity, animated row clearing, and scattered initial packing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../pieces/058-micro-tetris/', import.meta.url);
const recipes = fs.readFileSync(new URL('recipes.js', root), 'utf8');
const source = fs.readFileSync(new URL('tetris.js', root), 'utf8').replace(/\}\)\(\);\s*$/, `
  globalThis.check = { advance, clearRows, reset, fits,
    get clearing() { return clearing; }, get active() { return active; }, get locked() { return locked; },
    get cleared() { return cleared; }, get lanes() { return lanes; },
    get board() { return board; } };
})();`);

for (const [width, height] of [[390, 844], [1200, 800], [391, 845], [10, 32], [7, 24], [1, 16]]) {
  let seed = 56;
  const math = Object.create(Math);
  math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const context = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {}, fillRect() {} };
  const canvas = { getContext: () => context, addEventListener() {}, setAttribute() {}, dataset: {}, style: {} };
  const env = { Math: math, window: {}, document: { querySelector: () => canvas, hidden: false },
    innerWidth: width, innerHeight: height, matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame() {}, addEventListener() {}, setTimeout, clearTimeout };
  vm.createContext(env);
  vm.runInContext(recipes, env);
  vm.runInContext(source, env);
  const check = env.check;
  const columns = Math.max(1, Math.ceil(width / 2));
  const rows = Math.max(16, Math.ceil(height / 2));
  assert.equal(canvas.width, columns);
  assert.equal(canvas.height, rows);
  assert.equal(canvas.style.width, `${columns * 2}px`);
  assert.equal(canvas.style.height, `${rows * 2}px`);
  const initialCells = check.board.filter(Boolean).length;
  const initialDepth = columns > 4 ? Math.max(4, Math.floor(rows * .32 / 4) * 4) : 0;
  if (columns > 4) {
    assert.ok(initialCells > 0, 'starts with scattered blocks');
    const tops = Array.from({ length: columns }, (_, x) => {
      let top = -1;
      for (let y = 0; y < rows; y++) if (check.board[y * columns + x]) top = y;
      return top;
    });
    assert.ok(new Set(tops).size > 2, 'starting skyline is uneven');
  }
  assert.equal(check.locked, 0, 'seed pieces do not count as live drops');
  assert.equal(check.cleared, 0, 'no seeded lines disappear at startup');

  let clearedBefore = 0;
  for (let i = 0; i < 48000; i++) {
    if (check.clearing) {
      const before = check.cleared;
      const count = check.clearing.rows.length;
      check.advance(1);
      assert.equal(check.cleared, before + count, 'blink finishes before collapse');
      clearedBefore = check.cleared;
      continue;
    }
    const falling = check.active;
    assert.ok(falling && !Array.isArray(falling), 'exactly one active tetromino');
    const previousY = falling.y;
    const lockedBefore = check.locked;
    check.advance(.05);
    if (check.locked === lockedBefore) {
      assert.equal(check.active, falling, 'no new piece before contact');
      assert.ok(falling.y < previousY, 'falls down from the top');
      assert.ok(check.fits(falling.piece, falling.x, falling.y), 'never overlaps the stack');
    } else {
      assert.equal(check.locked, lockedBefore + 1, 'only one piece locks per drop');
      assert.equal(falling.y, falling.lane.base + falling.piece.y -
        (falling.lane.cursor === 0 ? 4 : 0) + (check.cleared - clearedBefore),
        'lands on the planned packing surface');
      if (check.active) assert.equal(check.active.y + Math.max(...check.active.piece.cells.map(([, y]) => y)), rows - 1,
        'next piece starts at the top');
      let occupied = 0;
      for (let y = 0; y < rows; y++) {
        const row = check.board.subarray(y * columns, (y + 1) * columns);
        assert.ok(row.some(value => value === 0) || check.clearing?.rows.includes(y), 'full rows wait for their blink');
        occupied += row.filter(Boolean).length;
      }
      assert.equal(occupied, initialCells + check.locked * 4 - check.cleared * columns, 'only completed rows disappear');

    }
    clearedBefore = check.cleared;
  }
  assert.ok(check.cleared > 4, 'repeatedly clears lines from the scattered stack');
  console.log(`${width} × ${height}: 40 minutes, ${check.locked} single drops, ${check.cleared} animated cleared rows`);

  // Nonadjacent full rows blink, then collapse; incomplete rows retain their cells.
  check.reset();
  check.board.fill(0);
  check.board.fill(1, 0, columns);
  check.board.fill(2, 2 * columns, 3 * columns);
  if (columns > 1) check.board[columns] = 3;
  check.clearRows();
  assert.equal(check.cleared, 0);
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
}

