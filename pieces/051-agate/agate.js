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
  let paused = false, resizeTimer;
  const speed = 280;
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
    const step = Math.max(49, Math.min(79, Math.sqrt(width * height / 230)));
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
    const gap = between(3.7, 4.7), inset = gap * 0.48;
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
    return { points, length, center, weight: between(0.9, 1.16), ink: `rgb(${between(44, 61) | 0}, ${between(41, 55) | 0}, ${between(38, 49) | 0})`,
      order: Math.hypot(center[0] * 0.8, height - center[1]) + Math.sin(center[0] / 110) * 24 + between(-18, 18) };
  }
  function paper() {
    ctx.fillStyle = '#f4f0e7';
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
    const count = Math.min(strokes.length, Math.max(6, Math.min(16, Math.round(width * height / 110000))));
    const candidates = strokes.filter(s => s.points[0][0] > width * 0.06 && s.points[0][0] < width * 0.94 &&
      s.points[0][1] > height * 0.06 && s.points[0][1] < height * 0.94);
    const pool = candidates.length >= count ? candidates : strokes;
    const origins = [];
    // Farthest-point placement makes activity visible across the whole page
    // immediately, including narrow screens, without an underlying row pattern.
    for (let i = 0; i < count; i++) {
      let best, bestScore = -Infinity;
      for (const stroke of pool) {
        if (origins.includes(stroke)) continue;
        const [x, y] = stroke.center;
        const score = origins.length ? Math.min(...origins.map(o => Math.hypot(x - o.center[0], y - o.center[1])))
          : -Math.hypot(x - width * 0.43, y - height * 0.53);
        if (score > bestScore) { best = stroke; bestScore = score; }
      }
      origins.push(best);
    }
    pens = origins.map(origin => ({ origin, queue: [], current: 0, distance: 0, segment: 1 }));
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
  function pointAt(stroke, pen, at) {
    const p = stroke.points;
    while (pen.segment < p.length - 1 && p[pen.segment][2] < at) pen.segment++;
    const a = p[pen.segment - 1], b = p[pen.segment];
    const t = Math.max(0, Math.min(1, (at - a[2]) / (b[2] - a[2] || 1)));
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  function drawTo(pen, end) {
    const stroke = pen.queue[pen.current], start = pointAt(stroke, pen, pen.distance);
    ctx.beginPath(); ctx.moveTo(...start);
    while (pen.segment < stroke.points.length && stroke.points[pen.segment][2] <= end) {
      const p = stroke.points[pen.segment]; ctx.lineTo(p[0], p[1]); pen.segment++;
    }
    pen.segment = Math.min(pen.segment, stroke.points.length - 1);
    ctx.lineTo(...pointAt(stroke, pen, end));
    ctx.strokeStyle = stroke.ink; ctx.lineWidth = stroke.weight;
    ctx.lineJoin = ctx.lineCap = 'round'; ctx.stroke();
    pen.distance = end;
  }
  function next(pen) { completed++; pen.current++; pen.distance = 0; pen.segment = 1; }
  function state() {
    canvas.dataset.state = completed >= strokes.length ? 'complete' : paused ? 'paused' : 'growing';
    canvas.dataset.seed = seed;
    canvas.dataset.pens = pens.length;
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = null; }
  function schedule() {
    state();
    if (!frame && !paused && !document.hidden && completed < strokes.length) frame = requestAnimationFrame(tick);
  }
  function tick(time) {
    frame = 0;
    const dt = lastTime === null ? 0 : Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;
    if (dt) for (const pen of pens) {
      const stroke = pen.queue[pen.current];
      if (!stroke) continue;
      drawTo(pen, Math.min(stroke.length, pen.distance + dt * speed));
      if (pen.distance >= stroke.length) next(pen);
    }
    schedule();
  }
  function finish() {
    stop();
    for (const pen of pens) while (pen.current < pen.queue.length) {
      drawTo(pen, pen.queue[pen.current].length); next(pen);
    }
    state();
  }
  function fit(preserve = false) {
    const progress = preserve && strokes.length ? pens.reduce((sum, pen) => sum + pen.current +
      (pen.queue[pen.current] ? pen.distance / pen.queue[pen.current].length : 0), 0) / strokes.length : 0;
    stop();
    width = Math.max(1, innerWidth); height = Math.max(1, innerHeight); dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    random = generator(seed); plan(); paper();
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
