(() => {
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  const recipes = window.MICRO_TETRIS_RECIPES;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cellSize = 4;
  const colors = ['#090b10', '#76c9cd', '#d6bb6a', '#af93d4', '#83b995', '#cf7d8a', '#7598cf', '#cf9b74'];
  function normalizeCells(cells) {
    const left = Math.min(...cells.map(([x]) => x));
    const bottom = Math.min(...cells.map(([, y]) => y));
    return cells.map(([x, y]) => [x - left, y - bottom]).sort(([ax, ay], [bx, by]) => ax - bx || ay - by);
  }
  const shapes = Array.from({ length: 7 }, (_, i) => {
    const rotations = [];
    let cells = normalizeCells(recipes.flat().find(piece => piece.color === i + 1).cells);
    for (let turn = 0; turn < 4; turn++) {
      if (!rotations.some(rotation => JSON.stringify(rotation) === JSON.stringify(cells))) rotations.push(cells);
      cells = normalizeCells(cells.map(([x, y]) => [y, -x]));
    }
    // Use a low, familiar entry orientation, then retain clockwise turn order.
    const first = rotations.reduce((best, rotation, index) =>
      Math.max(...rotation.map(([, y]) => y)) < Math.max(...rotations[best].map(([, y]) => y)) ? index : best, 0);
    return { color: i + 1, rotations: [...rotations.slice(first), ...rotations.slice(0, first)] };
  });
  let width, height, board;
  let generation = 0;
  let active = null, paused = motion.matches, last = null, drawn = 0;
  let cleared = 0, locked = 0, clearing = null;

  function fits(piece, x, y) {
    return piece.cells.every(([dx, dy]) => {
      const column = x + dx, row = y + dy;
      return column >= 0 && column < width && row >= 0 && row < height && !board[row * width + column];
    });
  }
  function lock() {
    const { piece, x, y } = active;
    if (!fits(piece, x, y) || fits(piece, x, y - 1)) throw new Error('Invalid tetromino contact');
    for (const [dx, dy] of piece.cells) board[(y + dy) * width + x + dx] = piece.color;
    locked++;
    active = null;
    clearRows();
  }
  function clearRows() {
    const rows = [];
    for (let y = 0; y < height; y++) {
      if (board.subarray(y * width, (y + 1) * width).every(Boolean)) rows.push(y);
    }
    if (rows.length) clearing = { rows, elapsed: 0, duration: rows.length === 4 ? .72 : .38 };
  }
  function collapseRows() {
    let write = 0;
    for (let read = 0; read < height; read++) {
      const row = board.subarray(read * width, (read + 1) * width);
      if (row.every(value => value !== 0)) continue;
      if (write !== read) board.copyWithin(write * width, read * width, (read + 1) * width);
      write++;
    }
    const count = height - write;
    board.fill(0, write * width);
    cleared += count;
    clearing = null;
  }
  function reset() {
    width = Math.max(1, Math.ceil(innerWidth / cellSize));
    height = Math.max(16, Math.ceil(innerHeight / cellSize));
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    canvas.style.width = `${width * cellSize}px`;
    canvas.style.height = `${height * cellSize}px`;
    board = new Uint8Array(width * height);
    generation++;
    active = null;
    clearing = null;
    cleared = 0; locked = 0; last = null;
    seedRows();
    spawn();
    render();
  }
  function seedRows() {
    if (width < 5) return;
    const depth = Math.max(4, Math.floor(height * .1));
    const skyline = new Uint32Array(width);
    const turns = Math.max(1, Math.floor(width * height * .005 / 4));
    for (let turn = 0; turn < turns; turn++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const mistake = Math.random() < .25;
      let best = null;
      // Rehearse imperfect play: try to keep rows level, but sometimes bridge
      // gaps or choose a poor rotation. Every seeded piece really drops and lands.
      for (let attempt = 0; attempt < 40; attempt++) {
        const cells = shape.rotations[Math.floor(Math.random() * shape.rotations.length)];
        const span = 1 + Math.max(...cells.map(([x]) => x));
        if (span > width) continue;
        const x = Math.floor(Math.random() * (width - span + 1));
        const y = Math.max(0, ...cells.map(([dx, dy]) => skyline[x + dx] - dy));
        const top = y + 1 + Math.max(...cells.map(([, dy]) => dy));
        if (top > depth) continue;
        let holes = 0, unevenness = 0;
        for (let dx = 0; dx < span; dx++) {
          const bottom = Math.min(...cells.filter(([cx]) => cx === dx).map(([, dy]) => dy));
          holes += y + bottom - skyline[x + dx];
          unevenness += Math.abs(top - skyline[x + dx]);
        }
        const score = top + holes * (mistake ? .05 : 1.8) + unevenness * .15 +
          Math.random() * (mistake ? 8 : 2);
        if (!best || score < best.score) best = { cells, x, y, score };
      }
      if (!best) continue;
      for (const [dx, dy] of best.cells) {
        board[(best.y + dy) * width + best.x + dx] = shape.color;
        skyline[best.x + dx] = Math.max(skyline[best.x + dx], best.y + dy + 1);
      }
      // Completed historical lines disappear before the live animation starts.
      clearRows();
      if (clearing) {
        collapseRows();
        for (let x = 0; x < width; x++) skyline[x] = columnStats(x).height;
      }
    }
    cleared = 0;
  }

  function columnStats(x) {
    let top = height - 1;
    while (top >= 0 && !board[top * width + x]) top--;
    let holes = 0;
    for (let y = 0; y < top; y++) if (!board[y * width + x]) holes++;
    return { height: top + 1, holes };
  }
  function entryPose(shape, rotation) {
    const piece = { color: shape.color, cells: shape.rotations[rotation] };
    const span = 1 + Math.max(...piece.cells.map(([x]) => x));
    return { piece, x: Math.floor((width - span) / 2),
      y: height - 1 - Math.max(...piece.cells.map(([, y]) => y)) };
  }
  function planPiece() {
    const available = shapes.filter(shape => shape.rotations.some(cells =>
      Math.max(...cells.map(([x]) => x)) < width));
    const shape = available[Math.floor(Math.random() * available.length)];
    const columns = Array.from({ length: width }, (_, x) => columnStats(x));
    const startRotation = shape.rotations.findIndex(cells => Math.max(...cells.map(([x]) => x)) < width);
    let best = null;
    for (let turns = 0; turns < shape.rotations.length; turns++) {
      const rotation = (startRotation + turns) % shape.rotations.length;
      const pose = entryPose(shape, rotation);
      if (!fits(pose.piece, pose.x, pose.y)) break;
      const { piece, y: top } = pose;
      const cells = piece.cells;
      // Require an open entry corridor. During the actual fall, every move
      // and turn is checked again at the piece's current height.
      let left = pose.x, right = pose.x;
      while (fits(piece, left - 1, top)) left--;
      while (fits(piece, right + 1, top)) right++;
      for (let x = left; x <= right; x++) {
        let y = top;
        while (fits(piece, x, y - 1)) y--;
        const touchedColumns = new Set(cells.map(([dx]) => x + dx));
        const touchedRows = new Set(cells.map(([, dy]) => y + dy));
        for (const [dx, dy] of cells) board[(y + dy) * width + x + dx] = shape.color;
        const updated = new Map([...touchedColumns].map(column => [column, columnStats(column)]));
        let score = 0;
        const edges = new Set();
        for (const [column, next] of updated) {
          score += (next.height - columns[column].height) * .5 + (next.holes - columns[column].holes) * 8;
          if (column > 0) edges.add(column - 1);
          if (column < width - 1) edges.add(column);
        }
        for (const edge of edges) {
          const left = updated.get(edge) || columns[edge];
          const right = updated.get(edge + 1) || columns[edge + 1];
          score += (Math.abs(left.height - right.height) -
            Math.abs(columns[edge].height - columns[edge + 1].height)) * .7;
        }
        for (const row of touchedRows) {
          if (board.subarray(row * width, (row + 1) * width).every(Boolean)) score -= width * 4;
        }
        score += y * .01 + Math.random() * .001;
        for (const [dx, dy] of cells) board[(y + dy) * width + x + dx] = 0;
        if (!best || score < best.score) best = { shape, startRotation, targetRotation: rotation, targetX: x, score };
      }
    }
    return best;
  }
  function spawn() {
    if (clearing) return;
    const plan = planPiece();
    // A blocked center is a top-out, even if a remote column is still open.
    if (!plan) { reset(); return; }
    const pose = entryPose(plan.shape, plan.startRotation);
    const nudgeInterval = Math.min(.035, 1.1 / width);
    const reactionTime = .04 + Math.random() * .08;
    let detour = null, hesitation = null;
    if (width >= 5 && Math.random() < .45) {
      const direction = Math.sign(plan.targetX - pose.x) || (Math.random() < .5 ? -1 : 1);
      const offset = 2 + Math.floor(Math.random() * Math.min(7, width * .08));
      const kind = Math.floor(Math.random() * 3);
      const wrongRotations = plan.shape.rotations.map((_, index) => index)
        .filter(index => index !== plan.targetRotation && index !== plan.startRotation);
      if (kind === 2 && wrongRotations.length) {
        detour = { x: plan.targetX, rotation: wrongRotations[Math.floor(Math.random() * wrongRotations.length)],
          until: .28 + Math.random() * .18, hold: 0, reachedAt: null };
      } else if (kind === 1) {
        detour = { x: plan.targetX + direction * offset, rotation: plan.targetRotation,
          until: .9, hold: .08 + Math.random() * .09, reachedAt: null };
      } else {
        detour = { x: pose.x - direction * offset, rotation: plan.startRotation,
          until: .2 + Math.random() * .15, hold: 0, reachedAt: null };
      }
      if (Math.random() < .5) {
        const start = .3 + Math.random() * .2;
        hesitation = { start, end: start + .08 + Math.random() * .1 };
      }
    }
    active = { ...plan, ...pose, rotation: plan.startRotation, phase: 'falling',
      age: 0, travel: 0, turnTime: 0, nudgeTime: 0, nudgeInterval,
      turnInterval: .1 + Math.random() * .06, reactionTime, detour, hesitation };
  }
  function steer(piece, seconds) {
    piece.age += seconds;
    if (piece.age < piece.reactionTime ||
        (piece.hesitation && piece.age >= piece.hesitation.start && piece.age < piece.hesitation.end)) return;
    if (piece.detour && (piece.age >= piece.detour.until ||
        (piece.detour.reachedAt !== null && piece.age >= piece.detour.reachedAt + piece.detour.hold))) {
      piece.detour = null;
    }
    const goal = piece.detour || { x: piece.targetX, rotation: piece.targetRotation };
    piece.turnTime += seconds;
    if (piece.rotation !== goal.rotation && piece.turnTime >= piece.turnInterval) {
      const count = piece.shape.rotations.length;
      const clockwise = (goal.rotation - piece.rotation + count) % count;
      const rotation = (piece.rotation + (clockwise <= count / 2 ? 1 : count - 1)) % count;
      const next = { color: piece.piece.color, cells: piece.shape.rotations[rotation] };
      const oldSpan = 1 + Math.max(...piece.piece.cells.map(([x]) => x));
      const newSpan = 1 + Math.max(...next.cells.map(([x]) => x));
      const top = piece.y + Math.max(...piece.piece.cells.map(([, y]) => y));
      const x = piece.x + Math.floor((oldSpan - newSpan) / 2);
      const y = top - Math.max(...next.cells.map(([, dy]) => dy));
      // A turn keeps the falling top edge fixed; it never lifts the piece.
      for (const kick of [0, -1, 1]) {
        if (!fits(next, x + kick, y)) continue;
        Object.assign(piece, { piece: next, rotation, x: x + kick, y });
        break;
      }
      piece.turnTime = 0;
    }
    const span = 1 + Math.max(...piece.piece.cells.map(([x]) => x));
    const goalX = Math.max(0, Math.min(width - span, goal.x));
    piece.nudgeTime += seconds;
    while (piece.x !== goalX && piece.nudgeTime >= piece.nudgeInterval) {
      const x = piece.x + Math.sign(goalX - piece.x);
      if (!fits(piece.piece, x, piece.y)) { piece.nudgeTime = 0; break; }
      piece.x = x;
      piece.nudgeTime -= piece.nudgeInterval;
    }
    // Don't bank movement during a hesitation or while already at the goal.
    if (piece.x === goalX) piece.nudgeTime = 0;
    if (piece.detour && piece.detour.hold && piece.x === goalX && piece.rotation === goal.rotation &&
        piece.detour.reachedAt === null) piece.detour.reachedAt = piece.age;
  }
  function advance(seconds) {
    if (clearing) {
      clearing.elapsed += seconds;
      if (clearing.elapsed >= clearing.duration) { collapseRows(); spawn(); }
      return;
    }
    if (!active) spawn();
    if (!active) return;
    const falling = active;
    // Small shared time steps keep controls and gravity concurrent. Thinking,
    // changing direction, and rotating never suspend or reset the fall clock.
    let remaining = seconds;
    while (remaining > 1e-9 && active === falling) {
      const step = Math.min(remaining, 1 / 120);
      remaining -= step;
      steer(falling, step);
      falling.travel += step * height / 2.4;
      while (falling.travel >= 1) {
        falling.travel--;
        if (fits(falling.piece, falling.x, falling.y - 1)) falling.y--;
        if (!fits(falling.piece, falling.x, falling.y - 1)) {
          lock();
          spawn();
          break;
        }
      }
    }
  }
  function drawCell(x, y, color) {
    context.fillStyle = colors[color];
    // A one-pixel seam keeps all four squares legible, even within one shape.
    context.fillRect(x * cellSize, (height - 1 - y) * cellSize, cellSize - 1, cellSize - 1);
  }
  function render() {
    context.fillStyle = colors[0];
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < board.length; i++) {
      if (board[i]) drawCell(i % width, Math.floor(i / width), board[i]);
    }
    if (active) {
      for (const [dx, dy] of active.piece.cells) drawCell(active.x + dx, active.y + dy, active.piece.color);
    }
    if (clearing) {
      const t = clearing.elapsed / clearing.duration;
      const tetris = clearing.rows.length === 4;
      const blinkEnd = tetris ? .65 : 1;
      const bright = Math.floor(t * (tetris ? 8 : 4)) % 2 === 0;
      for (const row of clearing.rows) {
        const y = (height - 1 - row) * cellSize;
        if (t < blinkEnd) {
          context.fillStyle = bright ? '#edf9ef' : colors[0];
          const swell = tetris && bright ? 1.5 * cellSize : 0;
          context.fillRect(0, y - swell, canvas.width, cellSize + swell * 2);
        } else {
          const shrink = 1 - (t - blinkEnd) / (1 - blinkEnd);
          context.fillStyle = colors[0];
          context.fillRect(0, y, canvas.width, cellSize);
          context.fillStyle = '#edf9ef';
          context.fillRect(canvas.width * (1 - shrink) / 2, y, canvas.width * shrink, cellSize);
        }
      }
    }
    canvas.dataset.clearing = clearing ? clearing.rows.length : 0;
    canvas.dataset.cleared = cleared;
    canvas.dataset.locked = locked;
    canvas.dataset.active = active ? 1 : 0;
  }

  function frame(now) {
    const seconds = last === null ? 0 : Math.min(.05, (now - last) / 1000);
    last = now;
    if (!paused && !document.hidden) advance(seconds);
    if (now - drawn > 1000 / 30 && !paused) { render(); drawn = now; }
    requestAnimationFrame(frame);
  }
  function toggle() { paused = !paused; canvas.setAttribute('aria-pressed', String(paused)); }
  canvas.addEventListener('click', toggle);
  addEventListener('keydown', event => {
    if (event.code === 'Space') { event.preventDefault(); toggle(); }
    if (event.key.toLowerCase() === 'r') reset();
  });
  let resizing;
  addEventListener('resize', () => { clearTimeout(resizing); resizing = setTimeout(reset, 120); });
  motion.addEventListener('change', event => { paused = event.matches; canvas.setAttribute('aria-pressed', String(paused)); });
  canvas.setAttribute('aria-pressed', String(paused));
  reset();
  requestAnimationFrame(frame);
})();
