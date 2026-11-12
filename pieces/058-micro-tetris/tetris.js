(() => {
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  const recipes = window.MICRO_TETRIS_RECIPES;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cellSize = 4;
  const colors = ['#090b10', '#76c9cd', '#d6bb6a', '#af93d4', '#83b995', '#cf7d8a', '#7598cf', '#cf9b74'];
  const shapes = Array.from({ length: 7 }, (_, i) => {
    const rotations = new Map();
    for (const recipe of recipes) for (const piece of recipe) {
      if (piece.color !== i + 1) continue;
      rotations.set(JSON.stringify(piece.cells), piece.cells);
    }
    return { color: i + 1, rotations: [...rotations.values()] };
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
    const depth = Math.min(height - 4, Math.ceil(height * .7));
    const patches = Array.from({ length: Math.max(3, Math.ceil(width * depth / 1600)) }, () => {
      const radiusX = 9 + Math.random() * 16, radiusY = 6 + Math.random() * 12;
      return {
        x: Math.random() * width, y: Math.random() * Math.max(1, depth - radiusY),
        radiusX, radiusY, strength: .25 + Math.random() * .75,
        color: 1 + Math.floor(Math.random() * (colors.length - 1))
      };
    });
    const cells = [];
    for (let y = 0; y < depth; y++) {
      const gap = Math.floor(Math.random() * width);
      for (let x = 0; x < width; x++) {
        if (x === gap) continue;
        let weight = .002, strongest = 0, color = 1;
        for (const patch of patches) {
          const distance = ((x - patch.x) / patch.radiusX) ** 2 + ((y - patch.y) / patch.radiusY) ** 2;
          const influence = Math.max(0, 1 - distance) ** 2 * patch.strength;
          weight += influence;
          if (influence > strongest) { strongest = influence; color = patch.color; }
        }
        // Nearby squares often share a color; individual positions stay random.
        // Variable patches and broad empty areas break up the uniform static.
        if (!strongest || Math.random() < .12) color = 1 + Math.floor(Math.random() * (colors.length - 1));
        cells.push({ index: y * width + x, color,
          priority: -Math.log(Math.max(Number.EPSILON, Math.random())) / weight });
      }
    }
    cells.sort((a, b) => a.priority - b.priority);
    const count = Math.floor(width * height * .08);
    for (const cell of cells.slice(0, count)) board[cell.index] = cell.color;
  }
  function columnStats(x) {
    let top = height - 1;
    while (top >= 0 && !board[top * width + x]) top--;
    let holes = 0;
    for (let y = 0; y < top; y++) if (!board[y * width + x]) holes++;
    return { height: top + 1, holes };
  }
  function planPiece() {
    const available = shapes.filter(shape => shape.rotations.some(cells =>
      Math.max(...cells.map(([x]) => x)) < width));
    const shape = available[Math.floor(Math.random() * available.length)];
    const columns = Array.from({ length: width }, (_, x) => columnStats(x));
    let best = null;
    for (const cells of shape.rotations) {
      const piece = { color: shape.color, cells };
      const span = 1 + Math.max(...cells.map(([x]) => x));
      const top = height - 1 - Math.max(...cells.map(([, y]) => y));
      for (let x = 0; x <= width - span; x++) {
        if (!fits(piece, x, top)) continue;
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
        if (!best || score < best.score) best = { piece, x, y: top, travel: 0, score };
      }
    }
    return best;
  }
  function spawn() {
    if (clearing) return;
    active = planPiece();
    // A fresh scattered field keeps the artwork playing after a top-out.
    if (!active) reset();
  }
  function advance(seconds) {
    if (clearing) {
      clearing.elapsed += seconds;
      if (clearing.elapsed >= clearing.duration) { collapseRows(); spawn(); }
      return;
    }
    if (!active) spawn();
    if (!active) return;
    // One visible top-to-bottom drop, checking every cell so frames cannot
    // skip through the stack. A full-height fall takes about 0.8 seconds.
    active.travel += seconds * height / .8;
    while (active.travel >= 1) {
      active.travel--;
      if (fits(active.piece, active.x, active.y - 1)) active.y--;
      if (!fits(active.piece, active.x, active.y - 1)) {
        lock();
        spawn();
        break;
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
