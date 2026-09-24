/* Negative Fill — silver waves, curls and stipple on charcoal paper. */
(() => {
  'use strict';
  const canvas = document.getElementById('drawing');
  const ctx = canvas.getContext('2d');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  let width, height, dpr, random, strokes = [], pockets = [], grid, columns, rows;
  let seed = new URLSearchParams(location.search).get('seed') || freshSeed();
  let frame = 0, lastTime = null, pens = [], completed = 0;
  let paused = false, resizeTimer;
  const speed = 190;
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

  // A small occupancy map lets new marks tuck against earlier motifs. No
  // paint is erased: every visible mark is planned before the pens start.
  const resolution = 2;
  function index(x, y) {
    const col = Math.floor(x / resolution), row = Math.floor(y / resolution);
    return col < 0 || row < 0 || col >= columns || row >= rows ? -1 : row * columns + col;
  }
  function free(x, y) { const i = index(x, y); return i >= 0 && grid[i] === 0; }
  function claim(x, y, radius, value = 1) {
    for (let row = Math.max(0, Math.floor((y - radius) / resolution)); row <= Math.min(rows - 1, Math.ceil((y + radius) / resolution)); row++) {
      for (let col = Math.max(0, Math.floor((x - radius) / resolution)); col <= Math.min(columns - 1, Math.ceil((x + radius) / resolution)); col++) {
        if ((col * resolution + 1 - x) ** 2 + (row * resolution + 1 - y) ** 2 <= radius ** 2) grid[row * columns + col] ||= value;
      }
    }
  }
  function add(points, weight, kind, center) {
    if (points.length < 2) return;
    let length = 0;
    const path = points.map((p, i) => {
      if (i) length += Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]);
      return [p[0], p[1], length];
    });
    if (length < (kind === 'dot' ? 0.05 : weight * 1.6)) return;
    const shade = between(210, 238) | 0;
    strokes.push({ points: path, length, center, weight, kind, ink: `rgb(${shade}, ${shade}, ${shade - 7})` });
  }
  function clipped(points, weight, kind, center, accepts = free) {
    let segment = [];
    for (const p of points) {
      if (accepts(...p)) segment.push(p);
      else { if (segment.length > 2) add(segment, weight, kind, center); segment = []; }
    }
    if (segment.length > 2) add(segment, weight, kind, center);
  }
  function plan() {
    strokes = []; pockets = [];
    columns = Math.ceil(width / resolution); rows = Math.ceil(height / resolution);
    grid = new Uint8Array(columns * rows);
    const scale = Math.max(0.8, Math.min(1.2, Math.sqrt(width * height / 850000)));
    const area = width * height;
    // Irregular unmarked islands provide breathing room between the dense bands.
    const pocketCount = Math.max(2, Math.round(area / (75000 * scale * scale)));
    for (let i = 0; i < pocketCount; i++) {
      const x = between(0, width), y = between(0, height), radius = between(16, 34) * scale;
      pockets.push({ x, y, radius });
      claim(x, y, radius, 2);
      for (let k = 0; k < 3; k++) {
        const a = between(0, TAU);
        claim(x + Math.cos(a) * radius * 0.65, y + Math.sin(a) * radius * 0.65, radius * between(0.5, 0.8), 2);
      }
    }
    // Long spiral-ended stems are the landmarks. Their reserved dark margin
    // remains visible when the fans later grow up to them.
    const curls = Math.max(3, Math.round(area / (28000 * scale * scale)));
    const placed = [];
    for (let i = 0; i < curls; i++) {
      let x, y;
      for (let attempt = 0; attempt < 24; attempt++) {
        x = between(0, width); y = between(0, height);
        if (free(x, y) && placed.every(p => Math.hypot(x - p[0], y - p[1]) > 70 * scale)) break;
      }
      if (!free(x, y)) continue;
      placed.push([x, y]);
      const angle = between(0, TAU), hand = random() < 0.5 ? -1 : 1, radius = between(16, 24) * scale;
      const local = [];
      const turns = 1.65, end = turns * TAU;
      for (let j = 0; j <= 230; j++) {
        const t = end * j / 230, r = 1.2 + (radius - 1.2) * j / 230;
        local.push([r * Math.cos(t), r * Math.sin(t)]);
      }
      const last = local.at(-1), tangent = end + Math.PI / 2;
      const stemLength = between(48, 90) * scale;
      for (let j = 1; j <= 100; j++) {
        const t = j / 100, bend = Math.sin(t * Math.PI) * radius * 0.8;
        local.push([last[0] + Math.cos(tangent) * stemLength * t + Math.cos(end) * bend,
          last[1] + Math.sin(tangent) * stemLength * t + Math.sin(end) * bend]);
      }
      const points = local.map(p => [x + p[0] * Math.cos(angle) - p[1] * hand * Math.sin(angle), y + p[0] * Math.sin(angle) + p[1] * hand * Math.cos(angle)]);
      clipped(points, 1.8 * scale, 'curl', [x, y]);
      // An outer echo follows the stem and the outside of the curled head.
      const echo = points.slice(135).map((p, j, list) => {
        const a = list[Math.max(0, j - 1)], b = list[Math.min(list.length - 1, j + 1)];
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        return [p[0] + (b[1] - a[1]) / d * 5.3 * scale * hand, p[1] - (b[0] - a[0]) / d * 5.3 * scale * hand];
      });
      clipped(echo, 1.6 * scale, 'curl', [x, y]);
      for (const path of [points, echo]) for (let j = 0; j < path.length; j += 2) claim(...path[j], 4.2 * scale);
    }
    // Place a fan on open paper, then let subsequent fans fit its rounded edge.
    // Best-of-five sampling fills the large gaps first without a repeating grid.
    const count = Math.ceil(area / (1150 * scale * scale));
    for (let i = 0; i < count; i++) {
      let best = null, bestScore = -1;
      for (let trial = 0; trial < 5; trial++) {
        const x = between(-12, width + 12), y = between(-12, height + 12), r = between(23, 49) * scale;
        let score = 0;
        for (let j = 0; j < 32; j++) {
          const a = j * 2.39996, d = Math.sqrt((j + 0.5) / 32) * r;
          if (free(x + Math.cos(a) * d, y + Math.sin(a) * d)) score++;
        }
        if (score > bestScore) { best = { x, y, r }; bestScore = score; }
      }
      if (bestScore < 3) continue;
      motif(best, scale, bestScore / 32);
    }
    // Small fields of stipple knit together the remaining seams.
    const spacing = 6.4 * scale;
    for (let y = 1; y < height; y += spacing) for (let x = 1; x < width; x += spacing) {
      const px = x + between(-0.7, 0.7), py = y + between(-0.7, 0.7);
      if (free(px, py) && free(px - 2, py) && free(px + 2, py) && free(px, py - 2) && free(px, py + 2))
        add([[px, py], [px + 0.12, py + 0.12]], between(1.6, 2.3) * scale, 'dot', [px, py]);
    }
    makePens();
  }
  function motif({ x, y, r }, scale, openness) {
    const choice = random(), kind = choice < 0.19 ? 'dot' : choice < 0.30 && openness < 0.75 ? 'silver' : 'fan';
    const center = [x, y], phase = between(0, TAU), weight = between(1.5, 2.05) * scale;
    const accepts = (px, py) => (px - x) ** 2 + (py - y) ** 2 < (r - 1.6) ** 2 && free(px, py);
    if (kind === 'dot') {
      const gap = between(5.8, 7) * scale;
      for (let row = -Math.ceil(r / gap); row <= Math.ceil(r / gap); row++) {
        for (let col = -Math.ceil(r / gap); col <= Math.ceil(r / gap); col++) {
          const u = (col + (row % 2) * 0.5) * gap, v = row * gap * 0.87;
          const px = x + u * Math.cos(phase) - v * Math.sin(phase), py = y + u * Math.sin(phase) + v * Math.cos(phase);
          if (accepts(px, py) && accepts(px + 2, py) && accepts(px - 2, py) && accepts(px, py + 2) && accepts(px, py - 2))
            add([[px, py], [px + 0.12, py + 0.15]], between(1.9, 2.6) * scale, kind, center);
        }
      }
    } else if (kind === 'silver') {
      // Closely spaced pen hatching creates a luminous solid patch progressively.
      for (let v = -r; v <= r; v += 1.15 * scale) {
        const points = [];
        for (let u = -r; u <= r; u += 1.2) points.push([x + u * Math.cos(phase) - v * Math.sin(phase), y + u * Math.sin(phase) + v * Math.cos(phase)]);
        clipped(points, 1.65 * scale, kind, center, accepts);
      }
    } else {
      const cx = x + Math.cos(phase) * r * 0.86, cy = y + Math.sin(phase) * r * 0.86;
      const gap = between(5, 6.5) * scale;
      for (let radius = gap * 0.7; radius < r * 1.9; radius += gap) {
        const points = [], steps = Math.ceil(TAU * radius / 1.25);
        for (let j = 0; j <= steps; j++) {
          const a = phase + Math.PI + TAU * (j / steps - 0.5);
          const rr = radius + Math.sin(a * 3 + phase) * 0.28 + Math.sin(a * 7 - phase) * 0.13;
          points.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
        }
        clipped(points, weight, kind, center, accepts);
      }
    }
    claim(x, y, r);
  }
  function paper() {
    ctx.fillStyle = '#242526';
    ctx.fillRect(0, 0, width, height);
    const tile = document.createElement('canvas');
    tile.width = tile.height = 128;
    const t = tile.getContext('2d'), pixels = t.createImageData(128, 128);
    const grain = generator(seed + ':paper');
    for (let i = 0; i < pixels.data.length; i += 4) {
      const n = (grain() - 0.5) * 9;
      pixels.data[i] = 36 + n; pixels.data[i + 1] = 37 + n; pixels.data[i + 2] = 38 + n; pixels.data[i + 3] = 255;
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
    pens = origins.map(origin => ({ origin, queue: [], current: 0, distance: 0, segment: 1, dwell: 0 }));
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
  function next(pen) { completed++; pen.current++; pen.distance = 0; pen.segment = 1; pen.dwell = 0; }
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
      let stroke = pen.queue[pen.current];
      if (!stroke && steal(pen)) stroke = pen.queue[pen.current];
      if (!stroke) continue;
      drawTo(pen, Math.min(stroke.length, pen.distance + dt * speed));
      if (pen.distance >= stroke.length) {
        pen.dwell += dt;
        if (stroke.kind !== 'dot' || pen.dwell >= 0.04) next(pen);
      }
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
      link.download = `negative-fill-${seed}.png`; link.href = url; link.click();
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
