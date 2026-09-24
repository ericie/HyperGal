/* Agate — packed polygon spirals, drawn as continuous pen strokes. */
(() => {
  'use strict';
  const canvas = document.getElementById('drawing');
  const ctx = canvas.getContext('2d');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  let width, height, dpr, random, cells = [], strokes = [];
  let seed = new URLSearchParams(location.search).get('seed') || freshSeed();
  let frame = 0, lastTime = null, pens = [], completed = 0;
  let paused = false, resizeTimer, pass = 0;
  const speed = 280;
  const PAPER = '#f4f0e7';
  // Every line is drawn twice: a stroke three times the width in the paper
  // colour, clearing a channel through whatever is already down, then the ink
  // along the middle of it, leaving a clear margin of paper either side. Without the channel a plate's lines cross everything beneath them and
  // the colours knit into one flat weave; with it each plate reads as a layer
  // lying over the last.
  //
  // The channel runs ahead of the ink rather than under it. Laying it from
  // where the ink stopped would bite back into the ink already down — a round
  // cap of the wider stroke covers the narrower one's end — and nick the line
  // at every frame boundary.
  const CHANNEL = 3;
  const LEAD = 9;
  // When a field of stones is finished the pens start again on a fresh packing
  // and lay it over the last in another ink, the way one colour is printed over
  // another. Earlier ink is never covered or wiped, and the page keeps taking
  // plates until it has nothing left to take.
  //
  // Every plate after the base takes only some of its cells, because a plate at
  // the base's density fills every channel and the two collapse into one flat
  // texture with neither field readable.
  //
  // Coverage falls away steeply as the plates stack — roughly two cells in
  // five, then one in four, then one in six. Each plate's channels cut the
  // lines under it, so plates that all arrived at the first overprint's weight
  // would saw the base field into dashes and the structure it drew would be
  // gone by the fourth colour. Thinning them means the later plates land as
  // accents on a field that still reads.
  //
  // The scale is varied but stays near the base's. A stone's spiral is one
  // continuous stroke that one pen has to draw end to end, so its length sets
  // how long its whole plate takes however many pens are on the page: stones
  // that keep growing leave a single pen crawling through an enormous coil
  // while the rest of the page stands finished. Wider-spaced turns keep the
  // overprints' coils short enough to stay in step with each other.
  const MAX_PLATES = 6;
  const STEPS = [1.4, 1.1, 1.6, 1.25, 1.5];
  // The inks are held close to the base field's weight. Lighter colours read
  // as pale confetti once several plates are down: at arm's length the eye
  // averages them and the structure the first plate drew goes with it.
  const INKS = [
    [[44, 61], [41, 55], [38, 49]],       // near-black, the base field
    [[136, 158], [46, 62], [38, 50]],     // iron oxide
    [[32, 50], [50, 70], [104, 130]],     // indigo
    [[146, 166], [108, 122], [42, 56]],   // dark gold
    [[38, 56], [92, 108], [88, 102]],     // verdigris
    [[92, 112], [44, 60], [84, 102]],     // plum
  ];
  function plate(index) {
    const n = index - 1;
    return {
      step: index ? STEPS[n % STEPS.length] : 1,
      gap: index ? 2.4 : 1,
      coverage: index ? 0.42 * Math.pow(0.64, n) : 1,
      ink: INKS[index % INKS.length],
    };
  }
  const between = (a, b) => a + random() * (b - a);
  function freshSeed() { return Math.random().toString(36).slice(2, 10); }
  function generator(value) {
    let n = 2166136261;
    for (const c of value) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
    return () => {
      n += 0x6D2B79F5;
      let t = Math.imul(n ^ n >>> 15, 1 | n);
      t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Clip a convex cell against a half-plane, keeping exact shared boundaries.
  function clip(poly, nx, ny, limit) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const da = a[0] * nx + a[1] * ny - limit;
      const db = b[0] * nx + b[1] * ny - limit;
      if (da <= 0) out.push(a);
      if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
        const t = da / (da - db);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  }
  function area(poly) {
    return Math.abs(poly.reduce((sum, p, i) => {
      const q = poly[(i + 1) % poly.length];
      return sum + p[0] * q[1] - p[1] * q[0];
    }, 0)) / 2;
  }
  function plan() {
    const step = Math.max(49, Math.min(79, Math.sqrt(width * height / 230))) * plate(pass).step;
    const margin = step;
    const sites = [];
    const count = Math.ceil((width + margin * 2) * (height + margin * 2) / (step * step));
    // A small best-candidate sample yields varied sizes without a visible grid.
    for (let i = 0; i < count; i++) {
      let best, bestDistance = -1;
      for (let k = 0; k < 9; k++) {
        const p = [between(-margin, width + margin), between(-margin, height + margin)];
        let nearest = Infinity;
        for (const q of sites) nearest = Math.min(nearest, (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2);
        if (nearest > bestDistance) { best = p; bestDistance = nearest; }
      }
      sites.push(best);
    }
    cells = [];
    for (const p of sites) {
      let poly = [[-margin, -margin], [width + margin, -margin], [width + margin, height + margin], [-margin, height + margin]];
      for (const q of sites) {
        if (p === q) continue;
        poly = clip(poly, q[0] - p[0], q[1] - p[1], (q[0] ** 2 + q[1] ** 2 - p[0] ** 2 - p[1] ** 2) / 2);
        if (poly.length < 3) break;
      }
      if (poly.length < 3) continue;
      // Occasional diagonal cuts add the reference's little triangular stones.
      if (poly.length >= 5 && random() < 0.32) {
        const pivot = Math.floor(random() * poly.length);
        poly = poly.slice(pivot).concat(poly.slice(0, pivot));
        const a = poly.slice(0, 3), b = [poly[0], ...poly.slice(2)];
        if (Math.min(area(a), area(b)) > step * step * 0.13) { cells.push(a, b); continue; }
      }
      cells.push(poly);
    }
    // An overprint takes only some of its stones, so the plate underneath stays
    // readable between them. A plate that covers every cell buries the one
    // below it and the two read as a single flat texture.
    const { coverage } = plate(pass);
    if (coverage < 1) cells = cells.filter(() => random() < coverage);
    strokes = cells.map(spiral).filter(Boolean);
    // Keep the seeded geometry order stable before distributing it to pens.
    strokes.sort((a, b) => a.order - b.order);
    makePens();
  }
  function spiral(poly) {
    const center = poly.reduce((c, p) => [c[0] + p[0] / poly.length, c[1] + p[1] / poly.length], [0, 0]);
    if (Math.max(...poly.map(p => p[0])) < 0 || Math.min(...poly.map(p => p[0])) > width ||
        Math.max(...poly.map(p => p[1])) < 0 || Math.min(...poly.map(p => p[1])) > height) return null;
    const edges = poly.map((p, i) => {
      const q = poly[(i + 1) % poly.length], length = Math.hypot(q[0] - p[0], q[1] - p[1]);
      return { nx: (q[1] - p[1]) / length, ny: (p[0] - q[0]) / length, p };
    }).filter(e => Number.isFinite(e.nx));
    const clearance = c => Math.min(...edges.map(e => e.nx * (e.p[0] - c[0]) + e.ny * (e.p[1] - c[1])));
    // Find the deepest point: offsets can collapse neatly into a small core.
    let radius = clearance(center);
    for (let stride = radius / 3; stride > 0.06; stride *= 0.5) {
      for (let repeat = 0; repeat < 8; repeat++) {
        let improved = false;
        for (let i = 0; i < 8; i++) {
          const c = [center[0] + Math.cos(i * TAU / 8) * stride, center[1] + Math.sin(i * TAU / 8) * stride];
          const r = clearance(c);
          if (r > radius) { center[0] = c[0]; center[1] = c[1]; radius = r; improved = true; }
        }
        if (!improved) break;
      }
    }
    const gap = between(3.7, 4.7) * plate(pass).gap, inset = gap * 0.48;
    if (radius < inset + 1) return null;
    const turns = (radius - inset - 0.45) / gap;
    const phase = between(0, TAU), direction = random() < 0.5 ? -1 : 1;
    const steps = Math.ceil(turns * 180), points = [];
    let length = 0;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, angle = phase + direction * turns * TAU * t;
      const dx = Math.cos(angle), dy = Math.sin(angle), depth = inset + t * turns * gap;
      let r = Infinity;
      for (const e of edges) {
        const dot = e.nx * dx + e.ny * dy;
        if (dot > 0.00001) r = Math.min(r, (e.nx * (e.p[0] - center[0]) + e.ny * (e.p[1] - center[1]) - depth) / dot);
      }
      const wobble = (Math.sin(angle * 7 + phase) * 0.11 + Math.sin(angle * 17 - t * 9) * 0.055) * Math.min(1, r / 3);
      const p = [center[0] + dx * (r + wobble), center[1] + dy * (r + wobble)];
      if (points.length) length += Math.hypot(p[0] - points.at(-1)[0], p[1] - points.at(-1)[1]);
      points.push([...p, length]);
    }
    const [r, g, b] = plate(pass).ink;
    return { points, length, center, weight: between(0.9, 1.16),
      ink: `rgb(${between(...r) | 0}, ${between(...g) | 0}, ${between(...b) | 0})`,
      order: Math.hypot(center[0] * 0.8, height - center[1]) + Math.sin(center[0] / 110) * 24 + between(-18, 18) };
  }
  function paper() {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, width, height);
    const tile = document.createElement('canvas');
    tile.width = tile.height = 128;
    const t = tile.getContext('2d'), pixels = t.createImageData(128, 128);
    const grain = generator(seed + ':paper');
    for (let i = 0; i < pixels.data.length; i += 4) {
      const n = (grain() - 0.5) * 7;
      pixels.data[i] = 244 + n; pixels.data[i + 1] = 240 + n; pixels.data[i + 2] = 231 + n; pixels.data[i + 3] = 255;
    }
    t.putImageData(pixels, 0, 0);
    ctx.fillStyle = ctx.createPattern(tile, 'repeat');
    ctx.fillRect(0, 0, width, height);
  }
  function makePens() {
    // Many pens at once. The page fills from dozens of fronts rather than a
    // handful, which is what makes the drawing arrive quickly; each pen still
    // draws its own line at its own pace, so nothing is rushed on the page.
    const count = Math.min(strokes.length, Math.max(24, Math.min(112, Math.round(width * height / 16000))));
    const candidates = strokes.filter(s => s.points[0][0] > width * 0.06 && s.points[0][0] < width * 0.94 &&
      s.points[0][1] > height * 0.06 && s.points[0][1] < height * 0.94);
    const pool = candidates.length >= count ? candidates : strokes;
    const origins = [];
    // Farthest-point placement makes activity visible across the whole page
    // immediately, including narrow screens, without an underlying row pattern.
    // Each stroke carries its distance to the nearest origin so far rather than
    // rescanning them all, which keeps placing a hundred pens off the load.
    const nearest = new Map(pool.map(stroke => [stroke, Infinity]));
    for (let i = 0; i < count; i++) {
      let best, bestScore = -Infinity;
      for (const stroke of pool) {
        const [x, y] = stroke.center;
        const score = origins.length ? nearest.get(stroke) : -Math.hypot(x - width * 0.43, y - height * 0.53);
        if (score > bestScore) { best = stroke; bestScore = score; }
      }
      origins.push(best);
      nearest.set(best, -Infinity);
      for (const stroke of pool) {
        const d = Math.hypot(stroke.center[0] - best.center[0], stroke.center[1] - best.center[1]);
        if (d < nearest.get(stroke)) nearest.set(stroke, d);
      }
    }
    pens = origins.map(origin => ({ origin, queue: [], current: 0, distance: 0, segment: 1,
      cleared: 0, channel: { segment: 1 } }));
    for (const stroke of strokes) {
      let nearest = pens[0], distance = Infinity;
      for (const pen of pens) {
        const d = Math.hypot(stroke.center[0] - pen.origin.center[0], stroke.center[1] - pen.origin.center[1]);
        if (d < distance) { nearest = pen; distance = d; }
      }
      nearest.queue.push(stroke);
    }
    for (const pen of pens) {
      const distance = s => Math.hypot(s.center[0] - pen.origin.center[0], s.center[1] - pen.origin.center[1]);
      pen.queue.sort((a, b) => distance(a) - distance(b));
    }
    completed = 0;
  }
  // A pen that has drawn out its own neighbourhood takes work from whichever
  // pen has the most left rather than standing idle. Without it the drawing
  // ends up waiting on whoever was dealt the densest corner, with a single
  // front still crawling long after the rest of the page is finished.
  function steal(pen) {
    let from = null, most = 0;
    for (const other of pens) {
      const left = other.queue.length - other.current - 1;
      if (left > most) { most = left; from = other; }
    }
    if (!from) return false;
    // Take the one nearest where this pen left off, so it carries on drawing
    // in one place instead of jumping across the page.
    const at = (pen.queue[pen.current - 1] || pen.origin).center;
    let index = -1, best = Infinity;
    for (let i = from.current + 1; i < from.queue.length; i++) {
      const d = Math.hypot(from.queue[i].center[0] - at[0], from.queue[i].center[1] - at[1]);
      if (d < best) { best = d; index = i; }
    }
    if (index < 0) return false;
    pen.queue.push(from.queue.splice(index, 1)[0]);
    return true;
  }
  // `cursor` carries its own place in the point list, so the ink and the
  // channel ahead of it walk the same stroke independently.
  function pointAt(stroke, cursor, at) {
    const p = stroke.points;
    while (cursor.segment < p.length - 1 && p[cursor.segment][2] < at) cursor.segment++;
    const a = p[cursor.segment - 1], b = p[cursor.segment];
    const t = Math.max(0, Math.min(1, (at - a[2]) / (b[2] - a[2] || 1)));
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  function trace(stroke, cursor, from, to) {
    ctx.beginPath(); ctx.moveTo(...pointAt(stroke, cursor, from));
    while (cursor.segment < stroke.points.length && stroke.points[cursor.segment][2] <= to) {
      const p = stroke.points[cursor.segment]; ctx.lineTo(p[0], p[1]); cursor.segment++;
    }
    cursor.segment = Math.min(cursor.segment, stroke.points.length - 1);
    ctx.lineTo(...pointAt(stroke, cursor, to));
  }
  function drawTo(pen, end) {
    const stroke = pen.queue[pen.current];
    ctx.lineJoin = ctx.lineCap = 'round';
    const clearTo = Math.min(stroke.length, end + LEAD);
    if (clearTo > pen.cleared) {
      trace(stroke, pen.channel, pen.cleared, clearTo);
      ctx.strokeStyle = PAPER; ctx.lineWidth = stroke.weight * CHANNEL; ctx.stroke();
      pen.cleared = clearTo;
    }
    trace(stroke, pen, pen.distance, end);
    ctx.strokeStyle = stroke.ink; ctx.lineWidth = stroke.weight; ctx.stroke();
    pen.distance = end;
  }
  function next(pen) {
    completed++; pen.current++; pen.distance = 0; pen.segment = 1;
    pen.cleared = 0; pen.channel.segment = 1;
  }
  // Each pass packs the page again from its own seed, so the two fields of
  // stones fall differently and neither traces the other.
  function startPass(index) {
    pass = index;
    random = generator(index ? `${seed}:pass${index}` : seed);
    plan();
  }
  // Plates keep coming until one has nothing left to draw, or the page has
  // taken as many as it is going to. A plate that comes back empty is the
  // signal that the coverage has thinned out to nothing.
  function nextPass() {
    const settled = pass;
    while (pass + 1 < MAX_PLATES) {
      startPass(pass + 1);
      if (strokes.length) return true;
    }
    // Nothing left to print — on a small page the thinnest plates can come
    // back with no stones at all. Put the last plate that did have some back
    // in hand, marked finished, so the drawing ends holding what is on the
    // paper rather than an empty plan. Its geometry replans from the same
    // seed, and nothing is drawn again.
    if (pass !== settled) {
      startPass(settled);
      for (const pen of pens) pen.current = pen.queue.length;
      completed = strokes.length;
    }
    return false;
  }
  function drainPass() {
    for (const pen of pens) while (pen.current < pen.queue.length) {
      drawTo(pen, pen.queue[pen.current].length); next(pen);
    }
  }
  function state() {
    canvas.dataset.state = completed >= strokes.length ? 'complete' : paused ? 'paused' : 'growing';
    canvas.dataset.seed = seed;
    canvas.dataset.pens = pens.length;
    canvas.dataset.pass = pass + 1;
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = null; }
  function schedule() {
    if (completed >= strokes.length) nextPass();
    state();
    if (!frame && !paused && !document.hidden && completed < strokes.length) frame = requestAnimationFrame(tick);
  }
  function tick(time) {
    frame = 0;
    const dt = lastTime === null ? 0 : Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;
    if (dt) for (const pen of pens) {
      let stroke = pen.queue[pen.current];
      if (!stroke && steal(pen)) stroke = pen.queue[pen.current];
      if (!stroke) continue;
      drawTo(pen, Math.min(stroke.length, pen.distance + dt * speed));
      if (pen.distance >= stroke.length) next(pen);
    }
    schedule();
  }
  function finish() {
    stop();
    do drainPass(); while (nextPass());
    state();
  }
  function fit(preserve = false) {
    const resumePass = preserve ? pass : 0;
    const progress = preserve && strokes.length ? pens.reduce((sum, pen) => sum + pen.current +
      (pen.queue[pen.current] ? pen.distance / pen.queue[pen.current].length : 0), 0) / strokes.length : 0;
    stop();
    width = Math.max(1, innerWidth); height = Math.max(1, innerHeight); dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paper();
    // Passes already finished are settled ink: lay each down again in full
    // before the pass in hand is restored to its own fraction.
    for (let i = 0; i < resumePass; i++) { startPass(i); drainPass(); }
    startPass(resumePass);
    for (const pen of pens) {
      const restore = Math.floor(progress * pen.queue.length);
      while (pen.current < restore) { drawTo(pen, pen.queue[pen.current].length); next(pen); }
      if (pen.current < pen.queue.length && progress > 0) {
        drawTo(pen, (progress * pen.queue.length - restore) * pen.queue[pen.current].length);
      }
    }
    if (reducedMotion.matches) finish(); else schedule();
  }
  function restart() { seed = freshSeed(); paused = false; fit(); }
  function save() {
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.download = `agate-${seed}.png`; link.href = url; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }
  canvas.addEventListener('click', restart);
  addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'r' || key === 'enter' || key === 's' || key === 'f') event.preventDefault();
    if (key === 'r' || key === 'enter') restart();
    if (key === ' ') { paused = !paused; stop(); schedule(); }
    if (key === 's') save();
    if (key === 'f') finish();
  });
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => fit(true), 180); });
  document.addEventListener('visibilitychange', () => { stop(); schedule(); });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finish(); });
  fit();
})();
