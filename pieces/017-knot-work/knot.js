(() => {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d', { alpha: false });
  const params = new URLSearchParams(location.search);
  const TAU = Math.PI * 2;
  const EDGES = ['n', 'e', 's', 'w'];
  const OPPOSITE = { n: 's', e: 'w', s: 'n', w: 'e' };
  const INWARD = {
    n: { x: 0, y: 1 },
    s: { x: 0, y: -1 },
    e: { x: -1, y: 0 },
    w: { x: 1, y: 0 },
  };
  const NORMAL = {
    top: { x: 0, y: -1 },
    bottom: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const KAPPA = 0.5522847;
  const COLORS = {
    paper: '#e9ddc6',
    paperHot: '#f8f0df',
    paperCool: '#d4c3a5',
    ink: '#33260f',
    fiber: 'rgba(71, 49, 28, 0.13)',
    paleFiber: 'rgba(255, 251, 238, 0.24)',
  };

  const form = document.getElementById('settings');
  const panel = document.getElementById('controls');
  const defaults = {
    padTop: 5, padRight: 5, padBottom: 5, padLeft: 5,
    lines: 2, density: 100, weight: 52, gap: 10, warp: 18,
    color1: '#33260f', color2: '#33260f', color3: '#33260f',
    paper: '#e9ddc6', gradient: false, gradientEnd: '#b84a36', cycles: 1,
  };
  const settings = { ...defaults };
  for (const [key, fallback] of Object.entries(defaults)) {
    if (!params.has(key)) continue;
    const value = params.get(key);
    if (typeof fallback === 'boolean') settings[key] = value === '1';
    else if (typeof fallback === 'string') {
      if (/^#[0-9a-f]{6}$/i.test(value)) settings[key] = value;
    } else {
      const input = form.elements.namedItem(key);
      const min = key === 'lines' ? 1 : Number(input.min);
      const max = key === 'lines' ? 3 : Number(input.max);
      if (value.trim() && Number.isFinite(Number(value))) settings[key] = clamp(Math.round(Number(value)), min, max);
    }
  }
  syncControls();

  let width = 1;
  let height = 1;
  let dpr = 1;
  let seed = params.get('seed') || randomSeed();
  let scene = null;

  resize();
  addEventListener('resize', resize, { passive: true });
  canvas.addEventListener('pointerdown', reseed);
  canvas.addEventListener('keydown', onKeyDown);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', event => {
    const input = event.target;
    if (!Object.hasOwn(defaults, input.name)) return;
    if (input.type === 'number' && (input.value === '' || !input.validity.valid)) return;
    settings[input.name] = input.type === 'checkbox' ? input.checked
      : typeof defaults[input.name] === 'number' ? Number(input.value) : input.value;
    syncControls(false);
    scheduleCompose();
  });
  form.addEventListener('change', () => { syncControls(); saveURL(); });
  form.addEventListener('reset', event => {
    event.preventDefault();
    Object.assign(settings, defaults);
    syncControls();
    saveURL();
    compose();
  });
  document.getElementById('new-knot').addEventListener('click', reseed);
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      panel.open = false;
      panel.querySelector('summary').focus();
    }
  });
  const handle = panel.querySelector('.drag-handle');
  let drag = null;
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const rect = panel.getBoundingClientRect();
    drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  handle.addEventListener('pointermove', event => {
    if (!drag) return;
    positionPanel(event.clientX - drag.x, event.clientY - drag.y);
  });
  handle.addEventListener('pointerup', () => { drag = null; });
  handle.addEventListener('pointercancel', () => { drag = null; });
  panel.addEventListener('toggle', constrainPanel);
  addEventListener('resize', constrainPanel, { passive: true });

  function positionPanel(x, y) {
    panel.style.right = 'auto';
    panel.style.left = `${clamp(x, 8, Math.max(8, innerWidth - panel.offsetWidth - 8))}px`;
    panel.style.top = `${clamp(y, 8, Math.max(8, innerHeight - panel.offsetHeight - 8))}px`;
  }

  function constrainPanel() {
    if (!panel.style.left) return;
    const rect = panel.getBoundingClientRect();
    positionPanel(rect.left, rect.top);
  }

  function syncControls(values = true) {
    for (const [key, value] of Object.entries(settings)) {
      const input = form.elements.namedItem(key);
      if (values) {
        if (typeof value === 'boolean') input.checked = value;
        else input.value = String(value);
      }
      const output = document.getElementById(`${key}-value`);
      if (output) output.value = `${value}${key === 'cycles' ? '' : '%'}`;
    }
    for (let i = 1; i <= 3; i += 1) {
      form.querySelector(`[data-color="color${i}"]`).hidden = i > settings.lines;
    }
    form.querySelector('.gradient-fields').hidden = !settings.gradient;
  }

  function saveURL() {
    const url = new URL(location.href);
    url.searchParams.set('seed', seed);
    for (const [key, value] of Object.entries(settings)) {
      if (value === defaults[key]) url.searchParams.delete(key);
      else url.searchParams.set(key, typeof value === 'boolean' ? '1' : value);
    }
    history.replaceState(null, '', url);
  }

  let pendingFrame = 0;
  function scheduleCompose() {
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => { pendingFrame = 0; compose(); });
  }

  function randomSeed() {
    return Math.floor(Math.random() * 0xffffffff).toString(36);
  }

  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i += 1) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function nextHash() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }

  function mulberry32(a) {
    return function nextRandom() {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomFor(label) {
    return mulberry32(xmur3(`${seed}:${label}`)());
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clampEven(value, min, max) {
    let v = Math.floor(value);
    v -= v % 2;
    return clamp(v, min, max);
  }

  function rand(random, min, max) {
    return min + random() * (max - min);
  }

  function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  function mul(v, k) {
    return { x: v.x * k, y: v.y * k };
  }

  function unitVec(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  function bez(c1, c2, p) {
    return { op: 'C', c1x: c1.x, c1y: c1.y, c2x: c2.x, c2y: c2.y, x: p.x, y: p.y };
  }

  function resize() {
    width = Math.max(1, innerWidth);
    height = Math.max(1, innerHeight);
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    compose();
  }

  function reseed() {
    seed = randomSeed();
    saveURL();
    compose();
  }

  function onKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    reseed();
  }

  function compose() {
    COLORS.paper = settings.paper;
    scene = makeScene();
    scene.paths = scene.loops.map(sampleLoop);
    fitScene();
    scene.crossings.forEach(matchCrossing);
    render();
  }

  function makeScene() {
    const random = randomFor(`scene:${Math.round(width)}x${Math.round(height)}`);
    const minSide = Math.min(width, height);
    const s = clamp(minSide * (width < 620 ? 0.115 : 0.072), 40, 86) * 100 / settings.density;
    const lane = s * 0.85;
    const gap = s * settings.gap / 100;
    const cols = clampEven(Math.round((width * 0.94) / s) - 5, 6, 36);
    const rows = clampEven(Math.round((height * 0.94) / s) - 5, 6, 36);
    const salt = Math.floor(rand(random, 0, 900));
    const hmirror = random() < 0.5;

    const tiles = makeTiles(cols, rows, salt, hmirror);

    const top = symMatching(cols, random, true);
    const bottom = hmirror ? top : symMatching(cols, random, true);
    const left = hmirror ? symMatching(rows, random, false) : plainMatching(rows, random);
    const right = left;
    const warp = makeWarp(random, s);
    // Opposing quarter-turns are only (sqrt(2) - 1) cells apart at
    // their closest point. A band as wide as 70% of a cell collides there.
    // Bound warp compression too, then scale the entire weight range inside
    // that clearance. Every slider value remains useful, including its maximum.
    const compression = warp.amp * Math.hypot(
      0.34 * warp.bx, warp.ax + 0.34 * warp.bx,
      warp.ay + 0.3 * warp.by, 0.3 * warp.by
    );
    const clearance = s * (Math.SQRT2 - 1) * (1 - compression);
    const band = clearance * 0.9 * settings.weight / 70;

    const geo = {
      s,
      lane,
      band,
      gap,
      cols,
      rows,
      sides: { top, bottom, left, right },
      crossings: [],
    };

    connectWeave(tiles, geo, hmirror);
    const loops = traceLoops(tiles, geo);

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (tiles[row][col] !== 'cross') continue;
        const cx = col * s;
        const cy = row * s;
        const horizontal = (row + col) % 2 === 0;
        const over = horizontal
          ? [
              { op: 'M', x: cx - s / 2, y: cy },
              { op: 'L', x: cx + s / 2, y: cy },
            ]
          : [
              { op: 'M', x: cx, y: cy - s / 2 },
              { op: 'L', x: cx, y: cy + s / 2 },
            ];
        geo.crossings.push({ over, blankW: band + gap * 2 });
      }
    }

    return { s, band, gap, loops, crossings: geo.crossings, warp };
  }

  function swapTile(type) {
    if (type === 'a') return 'b';
    if (type === 'b') return 'a';
    return type;
  }

  function makeTiles(cols, rows, salt, hmirror) {
    const tiles = [];
    const halfC = cols / 2;
    for (let row = 0; row < rows; row += 1) {
      tiles.push([]);
      if (hmirror && row >= rows / 2) {
        for (let col = 0; col < cols; col += 1) {
          tiles[row][col] = swapTile(tiles[rows - 1 - row][col]);
        }
        continue;
      }
      for (let col = 0; col < cols; col += 1) {
        if (col >= halfC) {
          tiles[row][col] = swapTile(tiles[row][cols - 1 - col]);
          continue;
        }
        const coarse = noise(Math.floor(col / 3) + 37, Math.floor(row / 3) + 91, salt);
        const crossP = 0.46 + coarse * 0.26;
        const n = noise(col, row, salt);
        tiles[row][col] =
          n < crossP ? 'cross' : noise(col + 513, row + 257, salt) < 0.5 ? 'a' : 'b';
      }
    }
    return tiles;
  }

  function connectWeave(tiles, geo, hmirror) {
    const { cols, rows, sides } = geo;
    // Connectivity here means woven together at crossings, not welded into a
    // single cord. Include the actual border returns: a local 2x2 ring check
    // misses the oval islands made by a border return and two rounded tiles.
    const parent = Array.from({ length: rows * cols * 4 }, (_, i) => i);
    const rank = new Uint8Array(parent.length);
    const id = (row, col, edge) => (row * cols + col) * 4 + EDGES.indexOf(edge);
    const root = value => {
      while (parent[value] !== value) {
        parent[value] = parent[parent[value]];
        value = parent[value];
      }
      return value;
    };
    const join = (a, b) => {
      a = root(a); b = root(b);
      if (a === b) return;
      if (rank[a] < rank[b]) [a, b] = [b, a];
      parent[b] = a;
      if (rank[a] === rank[b]) rank[a] += 1;
    };
    const cross = (row, col) => {
      tiles[row][col] = 'cross';
      for (const edge of EDGES) join(id(row, col, 'n'), id(row, col, edge));
    };
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        for (const edge of EDGES) {
          join(id(row, col, edge), id(row, col, pairedEdge(tiles[row][col], edge)));
          const next = neighborHalf(row, col, edge, rows, cols);
          if (next) join(id(row, col, edge), id(next.row, next.col, next.edge));
          else if (edge === 'n') join(id(row, col, edge), id(0, sides.top.pair[col], edge));
          else if (edge === 's') join(id(row, col, edge), id(rows - 1, sides.bottom.pair[col], edge));
          else if (edge === 'w') join(id(row, col, edge), id(sides.left.pair[row], 0, edge));
          else join(id(row, col, edge), id(sides.right.pair[row], cols - 1, edge));
        }
        if (tiles[row][col] === 'cross') cross(row, col);
      }
    }
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const component = root(id(row, col, 'n'));
        if (EDGES.every(edge => root(id(row, col, edge)) === component)) continue;
        // A crossing incorporates both neighboring components without removing
        // any existing weave connection. Reflect the edit to retain symmetry.
        cross(row, col);
        cross(row, cols - 1 - col);
        if (hmirror) {
          cross(rows - 1 - row, col);
          cross(rows - 1 - row, cols - 1 - col);
        }
      }
    }
  }

  function nonCross(lo, hi, random, out) {
    if (lo >= hi) return;
    const count = (hi - lo + 1) / 2;
    const pick = random() < 0.45 ? 0 : Math.floor(random() * count);
    const j = lo + 1 + pick * 2;
    out.push([lo, j]);
    nonCross(lo + 1, j - 1, random, out);
    nonCross(j + 1, hi, random, out);
  }

  function finishMatching(n, pairsList, pretzelPair) {
    pairsList.sort((p, q) => p.b - p.a - (q.b - q.a));
    for (const p of pairsList) {
      let inner = 0;
      for (const q of pairsList) {
        if (q !== p && q.a > p.a && q.b < p.b) inner = Math.max(inner, q.h);
      }
      p.h = p.cost + inner;
    }
    const pair = new Array(n);
    const level = new Array(n);
    let maxLevel = 1;
    for (const p of pairsList) {
      pair[p.a] = p.b;
      pair[p.b] = p.a;
      level[p.a] = p.h;
      level[p.b] = p.h;
      maxLevel = Math.max(maxLevel, p.h);
    }
    return { pair, level, maxLevel, pretzel: pretzelPair };
  }

  function symMatching(n, random, allowPretzel) {
    const half = n / 2;
    let k = half % 2;
    if (random() < 0.5) k += 2;
    k = Math.min(k, half);
    const pairsList = [];
    let pretzelPair = null;
    for (let t = 0; t < k; t += 1) {
      pairsList.push({ a: half - 1 - t, b: half + t, cost: 1, h: 0 });
    }
    if (allowPretzel && k >= 1 && random() < 0.7) {
      pairsList[0].cost = 3;
      pretzelPair = [half - 1, half];
    }
    const sub = [];
    nonCross(0, half - k - 1, random, sub);
    for (const [a, b] of sub) {
      pairsList.push({ a, b, cost: 1, h: 0 });
      pairsList.push({ a: n - 1 - b, b: n - 1 - a, cost: 1, h: 0 });
    }
    return finishMatching(n, pairsList, pretzelPair);
  }

  function plainMatching(n, random) {
    const sub = [];
    nonCross(0, n - 1, random, sub);
    const pairsList = sub.map(([a, b]) => ({ a, b, cost: 1, h: 0 }));
    return finishMatching(n, pairsList, null);
  }

  function pairedEdge(type, edge) {
    if (type === 'cross') return OPPOSITE[edge];
    if (type === 'a') {
      if (edge === 'w') return 'n';
      if (edge === 'n') return 'w';
      if (edge === 'e') return 's';
      return 'e';
    }
    if (edge === 'w') return 's';
    if (edge === 's') return 'w';
    if (edge === 'e') return 'n';
    return 'e';
  }

  function neighborHalf(row, col, edge, rows, cols) {
    if (edge === 'n') row -= 1;
    else if (edge === 'e') col += 1;
    else if (edge === 's') row += 1;
    else col -= 1;
    if (row < 0 || col < 0 || row >= rows || col >= cols) return null;
    return { row, col, edge: OPPOSITE[edge] };
  }

  function edgeMid(row, col, edge, s) {
    const cx = col * s;
    const cy = row * s;
    if (edge === 'n') return { x: cx, y: cy - s / 2 };
    if (edge === 'e') return { x: cx + s / 2, y: cy };
    if (edge === 's') return { x: cx, y: cy + s / 2 };
    return { x: cx - s / 2, y: cy };
  }

  function cellCmds(type, row, col, edgeFrom, edgeTo, s) {
    const to = edgeMid(row, col, edgeTo, s);
    if (type === 'cross') return [{ op: 'L', x: to.x, y: to.y }];
    const from = edgeMid(row, col, edgeFrom, s);
    const dIn = INWARD[edgeFrom];
    const dOut = INWARD[edgeTo];
    const k = KAPPA * s * 0.5;
    return [
      bez(
        { x: from.x + dIn.x * k, y: from.y + dIn.y * k },
        { x: to.x + dOut.x * k, y: to.y + dOut.y * k },
        to
      ),
    ];
  }

  function borderPoint(geo, side, i) {
    const { s, cols, rows } = geo;
    if (side === 'top') return { x: i * s, y: -s / 2 };
    if (side === 'bottom') return { x: i * s, y: (rows - 1) * s + s / 2 };
    if (side === 'left') return { x: -s / 2, y: i * s };
    return { x: (cols - 1) * s + s / 2, y: i * s };
  }

  function arcCmds(geo, side, p1, p2, level) {
    const N = NORMAL[side];
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const T = unitVec(p1, p2);
    const r = Math.min(geo.s * 0.5, dist / 2);
    const L = level * geo.lane;
    const k = KAPPA * r;
    const a = add(p1, mul(N, L - r));
    const b = add(add(p1, mul(N, L)), mul(T, r));
    const c = add(add(p2, mul(N, L)), mul(T, -r));
    const d = add(p2, mul(N, L - r));
    const cmds = [{ op: 'L', x: a.x, y: a.y }, bez(add(a, mul(N, k)), add(b, mul(T, -k)), b)];
    if (dist - r * 2 > 0.5) cmds.push({ op: 'L', x: c.x, y: c.y });
    cmds.push(bez(add(c, mul(T, k)), add(d, mul(N, k)), d));
    cmds.push({ op: 'L', x: p2.x, y: p2.y });
    return cmds;
  }

  function arcSweepCmds(O, r, a0, sweep) {
    const n = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2)));
    const step = sweep / n;
    const k = (4 / 3) * Math.tan(step / 4);
    const cmds = [];
    for (let i = 0; i < n; i += 1) {
      const f0 = a0 + step * i;
      const f1 = f0 + step;
      const p0 = { x: O.x + r * Math.cos(f0), y: O.y + r * Math.sin(f0) };
      const p1 = { x: O.x + r * Math.cos(f1), y: O.y + r * Math.sin(f1) };
      cmds.push(
        bez(
          { x: p0.x - k * r * Math.sin(f0), y: p0.y + k * r * Math.cos(f0) },
          { x: p1.x + k * r * Math.sin(f1), y: p1.y - k * r * Math.cos(f1) },
          p1
        )
      );
    }
    return cmds;
  }

  function tangentPoint(O, r, P, toward) {
    const d = Math.hypot(P.x - O.x, P.y - O.y);
    const th = Math.atan2(P.y - O.y, P.x - O.x);
    const beta = Math.acos(clamp(r / d, -1, 1));
    let best = null;
    let bestDot = -Infinity;
    for (const phi of [th + beta, th - beta]) {
      const T = { x: O.x + r * Math.cos(phi), y: O.y + r * Math.sin(phi) };
      const dot = (T.x - P.x) * toward.x + (T.y - P.y) * toward.y;
      if (dot > bestDot) {
        bestDot = dot;
        best = { point: T, angle: phi };
      }
    }
    return best;
  }

  function lineIntersect(a1, a2, b1, b2) {
    const d1 = { x: a2.x - a1.x, y: a2.y - a1.y };
    const d2 = { x: b2.x - b1.x, y: b2.y - b1.y };
    const den = d1.x * d2.y - d1.y * d2.x;
    if (Math.abs(den) < 1e-9) return { x: (a2.x + b2.x) / 2, y: (a2.y + b2.y) / 2 };
    const t = ((b1.x - a1.x) * d2.y - (b1.y - a1.y) * d2.x) / den;
    return { x: a1.x + d1.x * t, y: a1.y + d1.y * t };
  }

  function pretzelCmds(geo, side, A, B) {
    const N = NORMAL[side];
    const s = geo.s;
    const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    const O = add(mid, mul(N, s * 1.6));
    const rc = s * 0.42;
    const stub = s * 0.16;
    const A2 = add(A, mul(N, stub));
    const B2 = add(B, mul(N, stub));
    const towardB = unitVec(A2, B2);
    const tA = tangentPoint(O, rc, A2, towardB);
    const tB = tangentPoint(O, rc, B2, mul(towardB, -1));
    const a0 = tA.angle;
    const a1 = tB.angle;
    const travel = unitVec(A2, tA.point);
    const sign =
      travel.x * -Math.sin(a0) + travel.y * Math.cos(a0) > 0 ? 1 : -1;
    let sweep;
    if (sign > 0) sweep = ((a1 - a0) % TAU + TAU) % TAU;
    else sweep = -((((a0 - a1) % TAU) + TAU) % TAU);
    const cmds = [
      { op: 'L', x: A2.x, y: A2.y },
      { op: 'L', x: tA.point.x, y: tA.point.y },
    ];
    cmds.push(...arcSweepCmds(O, rc, a0, sweep));
    cmds.push({ op: 'L', x: B2.x, y: B2.y });
    cmds.push({ op: 'L', x: B.x, y: B.y });

    const X = lineIntersect(A2, tA.point, B2, tB.point);
    const u = unitVec(tB.point, B2);
    const hl = s * 0.45;
    geo.crossings.push({
      over: [
        { op: 'M', x: X.x - u.x * hl, y: X.y - u.y * hl },
        { op: 'L', x: X.x + u.x * hl, y: X.y + u.y * hl },
      ],
      blankW: geo.band + geo.gap * 1.2,
    });
    return cmds;
  }

  function borderJump(geo, row, col, edge) {
    let side;
    let idx;
    if (edge === 'n') {
      side = 'top';
      idx = col;
    } else if (edge === 's') {
      side = 'bottom';
      idx = col;
    } else if (edge === 'w') {
      side = 'left';
      idx = row;
    } else {
      side = 'right';
      idx = row;
    }
    const m = geo.sides[side];
    const j = m.pair[idx];
    const p1 = borderPoint(geo, side, idx);
    const p2 = borderPoint(geo, side, j);
    const isPretzel = m.pretzel && (idx === m.pretzel[0] || idx === m.pretzel[1]);
    const cmds = isPretzel
      ? pretzelCmds(geo, side, p1, p2)
      : arcCmds(geo, side, p1, p2, m.level[idx]);
    let next;
    if (side === 'top') next = { row: 0, col: j, edge: 'n' };
    else if (side === 'bottom') next = { row: geo.rows - 1, col: j, edge: 's' };
    else if (side === 'left') next = { row: j, col: 0, edge: 'w' };
    else next = { row: j, col: geo.cols - 1, edge: 'e' };
    return { cmds, next };
  }

  function hk(row, col, edge) {
    return `${row}:${col}:${edge}`;
  }

  function traceLoops(tiles, geo) {
    const { rows, cols, s } = geo;
    const visited = new Set();
    const loops = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        for (const edge of EDGES) {
          if (visited.has(hk(row, col, edge))) continue;
          const cmds = [];
          let cur = { row, col, edge };
          let first = true;
          for (let guard = 0; guard < rows * cols * 8; guard += 1) {
            const id = hk(cur.row, cur.col, cur.edge);
            if (visited.has(id)) break;
            visited.add(id);
            const type = tiles[cur.row][cur.col];
            const out = pairedEdge(type, cur.edge);
            visited.add(hk(cur.row, cur.col, out));
            if (first) {
              const p0 = edgeMid(cur.row, cur.col, cur.edge, s);
              cmds.push({ op: 'M', x: p0.x, y: p0.y });
              first = false;
            }
            cmds.push(...cellCmds(type, cur.row, cur.col, cur.edge, out, s));
            const nb = neighborHalf(cur.row, cur.col, out, rows, cols);
            if (nb) {
              cur = nb;
              continue;
            }
            const jump = borderJump(geo, cur.row, cur.col, out);
            cmds.push(...jump.cmds);
            cur = jump.next;
          }
          if (cmds.length > 2) {
            cmds.push({ op: 'Z' });
            loops.push(cmds);
          }
        }
      }
    }
    return loops;
  }

  function noise(col, row, salt) {
    let n = (col + 101) * 374761393 + (row + 197) * 668265263 + salt * 1442695041;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function makeWarp(random, s) {
    return {
      amp: s * settings.warp / 1000,
      ax: rand(random, 0.003, 0.006),
      ay: rand(random, 0.003, 0.006),
      bx: rand(random, 0.0015, 0.004),
      by: rand(random, 0.0015, 0.004),
      p1: rand(random, 0, TAU),
      p2: rand(random, 0, TAU),
      p3: rand(random, 0, TAU),
    };
  }

  // Sample the actual warped cord once. Distance belongs to the entire closed
  // loop, so a crossing can repaint the same colors without restarting a gradient.
  function sampleLoop(commands) {
    const raw = [];
    let current;
    let first;
    for (const cmd of commands) {
      if (cmd.op === 'M') {
        current = { x: cmd.x, y: cmd.y };
        first = current;
        raw.push(warpPoint(current.x, current.y));
        continue;
      }
      const end = cmd.op === 'Z' ? first : { x: cmd.x, y: cmd.y };
      const estimate = cmd.op === 'C'
        ? Math.hypot(cmd.c1x - current.x, cmd.c1y - current.y)
          + Math.hypot(cmd.c2x - cmd.c1x, cmd.c2y - cmd.c1y)
          + Math.hypot(end.x - cmd.c2x, end.y - cmd.c2y)
        : Math.hypot(end.x - current.x, end.y - current.y);
      const steps = Math.max(1, Math.ceil(estimate / 4));
      for (let j = 1; j <= steps; j += 1) {
        const t = j / steps, u = 1 - t;
        const x = cmd.op === 'C' ? u ** 3 * current.x + 3 * u * u * t * cmd.c1x + 3 * u * t * t * cmd.c2x + t ** 3 * end.x : current.x + (end.x - current.x) * t;
        const y = cmd.op === 'C' ? u ** 3 * current.y + 3 * u * u * t * cmd.c1y + 3 * u * t * t * cmd.c2y + t ** 3 * end.y : current.y + (end.y - current.y) * t;
        const p = warpPoint(x, y);
        if (Math.hypot(p.x - raw.at(-1).x, p.y - raw.at(-1).y) > 1e-6) raw.push(p);
      }
      current = end;
    }
    const closed = Math.hypot(raw[0].x - raw.at(-1).x, raw[0].y - raw.at(-1).y) < 1e-5;
    let distance = 0;
    raw.forEach((p, i) => {
      if (i) distance += Math.hypot(p.x - raw[i - 1].x, p.y - raw[i - 1].y);
      p.distance = distance;
      const prev = raw[i ? i - 1 : closed ? raw.length - 2 : 0];
      const next = raw[i < raw.length - 1 ? i + 1 : closed ? 1 : i];
      const tangent = unitVec(prev, next);
      p.nx = -tangent.y;
      p.ny = tangent.x;
    });
    return { points: raw, length: distance };
  }

  function fitScene() {
    const points = scene.paths.flatMap(path => path.points);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    // Include the complete stroke envelope, not only the centerline.
    const radius = scene.band / 2;
    minX -= radius; maxX += radius; minY -= radius; maxY += radius;
    const left = width * settings.padLeft / 100;
    const top = height * settings.padTop / 100;
    const availableW = width * (1 - (settings.padLeft + settings.padRight) / 100);
    const availableH = height * (1 - (settings.padTop + settings.padBottom) / 100);
    // Each axis obeys its own pair of margins. A shared contain scale would
    // shrink the width when only top/bottom padding changes (and vice versa).
    const fx = availableW / (maxX - minX);
    const fy = availableH / (maxY - minY);
    scene.fit = { fx, fy, f: Math.min(fx, fy), cx: (minX + maxX) / 2, cy: (minY + maxY) / 2,
      x: left + availableW / 2, y: top + availableH / 2 };
  }

  function matchCrossing(crossing) {
    const [a, b] = crossing.over;
    const center = warpPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
    const direction = unitVec(a, b);
    let best = Infinity;
    scene.paths.forEach(path => {
      for (let i = 1; i < path.points.length; i += 1) {
        const p = path.points[i - 1], q = path.points[i];
        const tangent = unitVec(p, q);
        if (Math.abs(tangent.x * direction.x + tangent.y * direction.y) < 0.8) continue;
        const dx = q.x - p.x, dy = q.y - p.y;
        const t = clamp(((center.x - p.x) * dx + (center.y - p.y) * dy) / (dx * dx + dy * dy), 0, 1);
        const dist = Math.hypot(center.x - p.x - dx * t, center.y - p.y - dy * t);
        if (dist >= best) continue;
        best = dist;
        crossing.path = path;
        crossing.distance = p.distance + (q.distance - p.distance) * t;
      }
    });
  }

  function render() {
    drawPaper();
    drawPaperWear();
    ctx.save();
    ctx.translate(scene.fit.x, scene.fit.y);
    ctx.scale(scene.fit.fx, scene.fit.fy);
    ctx.translate(-scene.fit.cx, -scene.fit.cy);
    for (const path of scene.paths) strokeRibbon(path);
    for (const crossing of scene.crossings) drawCrossing(crossing);
    ctx.restore();
    drawGlaze();
  }

  function colorAt(line, distance, length) {
    const start = settings[`color${line + 1}`];
    if (!settings.gradient) return start;
    // A cosine cycle meets itself at the loop seam with no abrupt color jump.
    const t = (1 - Math.cos(distance / length * TAU * settings.cycles)) / 2;
    const a = parseInt(start.slice(1), 16), b = parseInt(settings.gradientEnd.slice(1), 16);
    const channel = shift => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t);
    return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
  }

  function strokeRibbon(path, from = 0, to = path.length) {
    const count = settings.lines;
    const lineWidth = scene.band / (count * 2 - 1);
    for (let line = 0; line < count; line += 1) {
      const offset = (line - (count - 1) / 2) * lineWidth * 2;
      const points = path.points.map(p => ({ x: p.x + p.nx * offset, y: p.y + p.ny * offset, distance: p.distance }));
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (!settings.gradient) {
        ctx.beginPath();
        let started = false;
        for (let i = 1; i < points.length; i += 1) {
          const p = points[i - 1], q = points[i];
          if (q.distance < from || p.distance > to) continue;
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          ctx.lineTo(q.x, q.y);
        }
        ctx.strokeStyle = settings[`color${line + 1}`];
        ctx.stroke();
      } else {
        for (let i = 1; i < points.length; i += 1) {
          const p = points[i - 1], q = points[i];
          if (q.distance < from || p.distance > to) continue;
          const gradient = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
          gradient.addColorStop(0, colorAt(line, p.distance, path.length));
          gradient.addColorStop(1, colorAt(line, q.distance, path.length));
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = gradient;
          ctx.stroke();
        }
      }
    }
  }

  function drawCrossing(crossing) {
    const [a, b] = crossing.over;
    const center = warpPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
    const direction = unitVec(warpPoint(a.x, a.y), warpPoint(b.x, b.y));
    // Restrict both the knockout and repaint to the crossing. Repaint the
    // original loop slice, preserving its normals, colors, and gradient phase.
    const half = Math.hypot(b.x - a.x, b.y - a.y) / 2 - 1 / scene.fit.f;
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(Math.atan2(direction.y, direction.x));
    ctx.beginPath(); ctx.rect(-half, -crossing.blankW / 2, half * 2, crossing.blankW);
    ctx.clip();
    ctx.fillStyle = COLORS.paper;
    ctx.fillRect(-half, -crossing.blankW / 2, half * 2, crossing.blankW);
    ctx.rotate(-Math.atan2(direction.y, direction.x));
    ctx.translate(-center.x, -center.y);
    if (crossing.path) strokeRibbon(crossing.path, crossing.distance - half - scene.band, crossing.distance + half + scene.band);
    ctx.restore();
  }

  function drawPaper() {
    const random = randomFor(`paper:${Math.round(width / 40)}:${Math.round(height / 40)}`);
    ctx.fillStyle = COLORS.paper;
    ctx.fillRect(0, 0, width, height);

    const fibers = Math.ceil((width * height) / 2850);
    for (let i = 0; i < fibers; i += 1) {
      const x = rand(random, -20, width + 20);
      const y = rand(random, -20, height + 20);
      const len = rand(random, 5, 42);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand(random, -0.22, 0.22));
      ctx.fillStyle = random() > 0.42 ? COLORS.fiber : COLORS.paleFiber;
      ctx.globalAlpha = rand(random, 0.14, 0.48);
      ctx.fillRect(-len * 0.5, -0.45, len, rand(random, 0.5, 1.25));
      ctx.restore();
    }
  }

  function drawGlaze() {
    const wash = ctx.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, COLORS.paperHot);
    wash.addColorStop(0.56, 'rgba(233, 221, 198, 0)');
    wash.addColorStop(1, COLORS.paperCool);
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  function drawPaperWear() {
    const random = randomFor(`wear:${Math.round(width)}:${Math.round(height)}`);
    const flecks = Math.ceil((width * height) / 3600);
    ctx.save();
    for (let i = 0; i < flecks; i += 1) {
      const x = rand(random, 0, width);
      const y = rand(random, 0, height);
      const r = rand(random, 0.35, 2.4);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = random() > 0.7 ? COLORS.paperHot : COLORS.paper;
      ctx.globalAlpha = rand(random, 0.13, 0.5);
      ctx.fill();
    }

    for (let i = 0; i < 10; i += 1) {
      ctx.beginPath();
      const y = rand(random, 0, height);
      ctx.moveTo(rand(random, -40, 20), y);
      ctx.bezierCurveTo(
        width * rand(random, 0.18, 0.35),
        y + rand(random, -20, 20),
        width * rand(random, 0.6, 0.84),
        y + rand(random, -28, 28),
        width + rand(random, -20, 40),
        y + rand(random, -20, 20)
      );
      ctx.strokeStyle = random() > 0.48 ? COLORS.fiber : COLORS.paleFiber;
      ctx.globalAlpha = rand(random, 0.07, 0.17);
      ctx.lineWidth = rand(random, 0.8, 2.2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function warpPoint(x, y) {
    const w = scene.warp;
    return {
      x: x + Math.sin(y * w.ax + w.p1) * w.amp + Math.sin((x + y) * w.bx + w.p2) * w.amp * 0.34,
      y: y + Math.sin(x * w.ay + w.p2) * w.amp + Math.cos((x - y) * w.by + w.p3) * w.amp * 0.3,
    };
  }
})();
