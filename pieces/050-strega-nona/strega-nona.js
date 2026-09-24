/* Strega Nona — a self-contained, seeded, growing ink drawing. */
(() => {
  'use strict';
  const canvas = document.getElementById('drawing');
  const ctx = canvas.getContext('2d');
  const paper = document.createElement('canvas');
  const paperCtx = paper.getContext('2d');
  const settled = document.createElement('canvas');
  const settledCtx = settled.getContext('2d');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  let width, height, dpr, random, shapes, seed, frame = 0, lastTime = 0;
  let elapsed = 0, paused = false, completed = 0, resizeTimer;
  let strokes = [], totalDuration = 0, penCount = 0;
  let nextStroke = 0, activeStrokes = [];
  const penSpeed = 190; // CSS pixels per second, independent of frame rate.

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
  const between = (a, b) => a + random() * (b - a);
  const newSeed = () => Math.random().toString(36).slice(2, 10);

  function makePaper() {
    // A small seeded fiber tile: subtle variation from the reference's paper,
    // baked once, never filtered or regenerated in the animation loop.
    const tile = document.createElement('canvas');
    tile.width = tile.height = 192;
    const t = tile.getContext('2d');
    const pixels = t.createImageData(192, 192);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const grain = between(-3.8, 3.8);
      pixels.data[i] = 245 + grain;
      pixels.data[i + 1] = 242 + grain;
      pixels.data[i + 2] = 233 + grain;
      pixels.data[i + 3] = 255;
    }
    t.putImageData(pixels, 0, 0);
    paperCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paperCtx.fillStyle = paperCtx.createPattern(tile, 'repeat');
    paperCtx.fillRect(0, 0, width, height);
    settledCtx.drawImage(paper, 0, 0, width, height);
  }

  function circlePoints(shape, radius) {
    const points = [];
    const steps = Math.max(36, Math.ceil(radius * 1.6));
    for (let j = 0; j <= steps; j++) {
      const a = j / steps * TAU;
      const wobble = Math.sin(a * 3 + shape.phase) * 0.7
        + Math.sin(a * 7 - shape.phase) * 0.3;
      const r = radius + wobble * Math.min(1, radius / 12);
      points.push([shape.x + Math.cos(a) * r, shape.y + Math.sin(a) * r * shape.aspect]);
    }
    return points;
  }

  function makeShape(x, y, radius, order) {
    const shape = {
      x, y, radius, order, phase: between(0, TAU), aspect: between(0.91, 1.09),
      ink: `rgba(${Math.round(between(121, 141))}, ${Math.round(between(137, 150))}, 65, ${between(0.68, 0.85)})`,
      weight: between(1.05, 1.4), paths: [],
    };
    const gap = between(5, 6.8);
    const spiral = random() < 0.24;
    // Plan outer curves first, then follow each previous mark inward.
    // Only the visible portions become ink; nothing is erased during drawing.
    for (let r = radius; r > (spiral ? radius * 0.39 : 2); r -= gap) {
      shape.paths.push(circlePoints(shape, r));
    }
    if (spiral) {
      const r = radius * 0.39 - gap * 0.45;
      const turns = r / gap;
      const points = [];
      for (let i = 0; i <= 240; i++) {
        const p = i / 240;
        const a = shape.phase + p * turns * TAU;
        points.push([x + Math.cos(a) * r * (1 - p), y + Math.sin(a) * r * (1 - p) * shape.aspect]);
      }
      shape.paths.push(points);
    }
    shape.outline = circlePoints(shape, radius + 2.3);
    return shape;
  }

  function build() {
    random = generator(seed);
    makePaper();
    shapes = [];
    // Overscan and a guaranteed minimum radius cover corners as well as the
    // middle. Jitter and alternating rows break up the underlying packing.
    const step = Math.max(42, Math.min(64, Math.sqrt(width * height / 270)));
    const origin = { x: width * between(0.25, 0.75), y: height + step };
    const rows = Math.ceil(height / (step * 0.85)) + 4;
    const cols = Math.ceil(width / step) + 5;
    for (let row = -2; row < rows; row++) {
      for (let col = -2; col < cols; col++) {
        const x = (col + (row % 2) * 0.5) * step + between(-0.2, 0.2) * step;
        const y = row * step * 0.85 + between(-0.19, 0.19) * step;
        const radius = step * between(1.02, 1.38);
        const order = Math.hypot((x - origin.x) * 0.8, y - origin.y)
          + Math.sin(x / (step * 2.8)) * step * 0.6 + between(-0.66, 0.66) * step;
        shapes.push(makeShape(x, y, radius, order));
      }
    }
    shapes.sort((a, b) => a.order - b.order);
    // Longer coiled stems lead the fans. Their footprints are reserved in
    // the plan, and their strokes enter the queue when their bases are inked.
    const fans = [{ x: origin.x, y: height + 5, order: 0, starter: true, ink: shapes[0].ink, weight: shapes[0].weight }, ...shapes];
    const stems = [];
    for (let i = 0; i < fans.length; i++) {
      const s = fans[i];
      if (!s.starter && (random() > 0.045 || s.x < 20 || s.x > width - 20 || s.y < 20 || s.y > height - 20)) continue;
      const paths = [];
      const angle = s.starter ? -Math.PI / 2 + between(-0.3, 0.3) : between(-2.8, -0.3);
      const length = step * (s.starter ? 2.6 : between(2.2, 3.6));
      const curlRadius = step * between(0.34, 0.5);
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const transform = (x, y) => [s.x + x * cos - y * sin, s.y + x * sin + y * cos];
      const outerRadius = curlRadius + 11;
      const backbone = [];
      for (let j = 0; j <= 180; j++) {
        const t = j / 180;
        backbone.push(transform(t * length, Math.sin(t * TAU) * Math.sin(t * Math.PI) ** 2 * step * 0.28));
      }
      for (let line = -2; line <= 2; line++) {
        const points = [];
        for (let j = 0; j <= 180; j++) {
          const t = j / 180;
          const x = t * length;
          const y = Math.sin(t * TAU) * Math.sin(t * Math.PI) ** 2 * step * 0.28 + line * 5.5;
          const approach = (Math.atan2(x - length, curlRadius - y) + TAU) % TAU;
          const coilEdge = outerRadius - 6 * approach / TAU;
          if (line > -2 && Math.hypot(x - length, y - curlRadius) < coilEdge + 1.3) break;
          points.push(transform(x, y));
        }
        if (line === -2) {
          const turns = (outerRadius - 1.5) / 6;
          for (let j = 1; j <= 600; j++) {
            const t = j / 600, a = t * TAU * turns;
            const r = outerRadius * (1 - t) + 1.5 * t;
            points.push(transform(length + Math.sin(a) * r, curlRadius - Math.cos(a) * r));
          }
        }
        paths.push(points);
      }
      const head = transform(length, curlRadius);
      // Keep each curl intact: ribbons may meet fans, never cut another curl.
      const samples = [...paths[2].filter((_, i) => i % 8 === 0), head];
      if (stems.some(other => samples.some(p => other.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < step * 0.95)))) continue;
      stems.push(samples);
      // Match the five strands' actual outline, with a flat end at the base.
      // A chain of masking disks left an empty semicircle past every stem.
      const margin = 12.1;
      const ribbonOutline = [
        ...backbone.map(p => [p[0] + sin * margin, p[1] - cos * margin]),
        ...backbone.slice().reverse().map(p => [p[0] - sin * margin, p[1] + cos * margin]),
      ];
      ribbonOutline.push(ribbonOutline[0]);
      shapes.push({ paths, backbone, ribbonOutline, stem: true, head, headRadius: outerRadius + 1.7, ink: s.ink, weight: s.weight,
        order: s.order + step * 3.3, drawOrder: s.starter ? -10000 : s.order + step * 0.2 });
    }
    shapes.sort((a, b) => a.order - b.order);
    prepareStrokes();
    completed = 0;
    nextStroke = 0;
    activeStrokes = [];
  }

  function prepareStrokes() {
    // Resolve overlaps BEFORE drawing. This ownership map only plans the
    // visible lines; it is never displayed or painted onto the artwork.
    const owners = new Uint32Array(width * height);
    function disk(x, y, radius, id) {
      for (let row = Math.max(0, Math.floor(y - radius)); row <= Math.min(height - 1, Math.ceil(y + radius)); row++) {
        const span = Math.sqrt(Math.max(0, radius * radius - (row + 0.5 - y) ** 2));
        const left = Math.max(0, Math.ceil(x - span - 0.5));
        const right = Math.min(width - 1, Math.floor(x + span - 0.5));
        if (left <= right) owners.fill(id, row * width + left, row * width + right + 1);
      }
    }
    function polygon(points, id) {
      const ys = points.map(p => p[1]);
      const first = Math.max(0, Math.floor(Math.min(...ys)));
      const last = Math.min(height - 1, Math.ceil(Math.max(...ys)));
      for (let row = first; row <= last; row++) {
        const y = row + 0.5, crosses = [];
        for (let i = 1; i < points.length; i++) {
          const a = points[i - 1], b = points[i];
          if ((a[1] > y) !== (b[1] > y)) crosses.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
        }
        crosses.sort((a, b) => a - b);
        for (let i = 0; i + 1 < crosses.length; i += 2) {
          const left = Math.max(0, Math.ceil(crosses[i] - 0.5));
          const right = Math.min(width - 1, Math.floor(crosses[i + 1] - 0.5));
          if (left <= right) owners.fill(id, row * width + left, row * width + right + 1);
        }
      }
    }
    shapes.forEach((shape, i) => { shape.id = i + 1; });
    // Reserve coiled stems so surrounding fans meet them without crossings.
    [...shapes.filter(s => !s.stem), ...shapes.filter(s => s.stem)].forEach(shape => {
      if (shape.stem) {
        polygon(shape.ribbonOutline, shape.id);
        disk(...shape.head, shape.headRadius, shape.id);
      } else polygon(shape.outline, shape.id);
    });
    // A tendril grows only after the neighboring ink at its base exists.
    for (const shape of shapes) {
      if (!shape.stem || shape.drawOrder < -1000) continue;
      const base = shape.backbone[0];
      let anchorOrder = -Infinity;
      shape.dependencies = new Set();
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * TAU;
        const x = Math.floor(base[0] + Math.cos(a) * 23);
        const y = Math.floor(base[1] + Math.sin(a) * 23);
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const neighbor = shapes[owners[y * width + x] - 1];
        if (neighbor && !neighbor.stem) {
          anchorOrder = Math.max(anchorOrder, neighbor.order);
          shape.dependencies.add(neighbor.id);
        }
      }
      if (Number.isFinite(anchorOrder)) shape.drawOrder = anchorOrder + 0.01;
    }
    strokes = [];
    totalDuration = 0;
    function add(points, shape) {
      if (points.length < 2) return;
      const lengths = [0];
      for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
      const length = lengths[lengths.length - 1];
      if (length < 2.5) return;
      const duration = Math.max(0.22, length / penSpeed);
      strokes.push({ points, lengths, length, ink: shape.ink, weight: shape.weight,
        start: totalDuration, end: totalDuration + duration, duration, shapeId: shape.id });
      totalDuration += duration;
    }
    for (const shape of [...shapes].sort((a, b) => (a.drawOrder ?? a.order) - (b.drawOrder ?? b.order))) for (const path of shape.paths) {
      let run = [];
      for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
        for (let j = 0; j < steps; j++) {
          const t = j / steps;
          const point = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
          const x = Math.floor(point[0]), y = Math.floor(point[1]);
          if (x >= 0 && x < width && y >= 0 && y < height && owners[y * width + x] === shape.id) run.push(point);
          else if (run.length) { add(run, shape); run = []; }
        }
      }
      add(run, shape);
    }
    schedulePens();
  }

  function schedulePens() {
    // Each pen completes one local fan or tendril, one line at a time.
    // Other pens work on neighboring shapes along the expanding front.
    // Many pens at once, scaled to the paper rather than fixed, so a large
    // screen is not left drawing one shape at a time across ten times the
    // area. Each pen still crosses its own fan at a hand's pace.
    penCount = Math.max(16, Math.min(128, Math.round(width * height / 12000)));
    // The whole set is on the paper within the first second however many there
    // are, instead of a stagger that grows with the count.
    const pens = Array.from({ length: penCount }, (_, id) => ({ id, free: id * (0.96 / penCount) }));
    const groups = new Map();
    const finishTimes = new Map();
    for (const stroke of strokes) {
      if (!groups.has(stroke.shapeId)) groups.set(stroke.shapeId, []);
      groups.get(stroke.shapeId).push(stroke);
    }
    for (const [shapeId, lines] of groups) {
      const shape = shapes[shapeId - 1];
      const pen = pens.reduce((first, next) => next.free < first.free ? next : first);
      let start = pen.free;
      // A coiled branch waits for the ink around its base, even when those
      // neighboring fans are being drawn by several different pens.
      for (const dependency of shape.dependencies || []) start = Math.max(start, finishTimes.get(dependency) || 0);
      const pace = 0.92 + (pen.id % 5) * 0.04;
      for (const stroke of lines) {
        stroke.pen = pen.id;
        stroke.duration = Math.max(0.22, stroke.length / (penSpeed * pace));
        stroke.start = start;
        stroke.end = start + stroke.duration;
        start = stroke.end;
      }
      pen.free = start;
      finishTimes.set(shapeId, start);
    }
    strokes.sort((a, b) => a.start - b.start);
    totalDuration = Math.max(...pens.map(pen => pen.free));
  }

  function drawStroke(context, stroke, progress) {
    if (progress <= 0) return;
    const distance = stroke.length * Math.min(1, progress);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = stroke.ink;
    context.lineWidth = stroke.weight;
    context.beginPath();
    context.moveTo(...stroke.points[0]);
    for (let i = 1; i < stroke.points.length; i++) {
      const a = stroke.points[i - 1], b = stroke.points[i];
      if (stroke.lengths[i] <= distance) context.lineTo(...b);
      else {
        const t = (distance - stroke.lengths[i - 1]) / (stroke.lengths[i] - stroke.lengths[i - 1]);
        context.lineTo(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
        break;
      }
    }
    context.stroke();
  }

  function render() {
    while (nextStroke < strokes.length && elapsed + 1e-8 >= strokes[nextStroke].start) {
      activeStrokes.push(strokes[nextStroke++]);
    }
    activeStrokes = activeStrokes.filter(stroke => {
      if (elapsed + 1e-8 < stroke.end) return true;
      drawStroke(settledCtx, stroke, 1);
      completed++;
      return false;
    });
    ctx.drawImage(settled, 0, 0, width, height);
    for (const stroke of activeStrokes) drawStroke(ctx, stroke, (elapsed - stroke.start) / stroke.duration);
    canvas.dataset.state = completed === strokes.length ? 'complete' : paused ? 'paused' : 'growing';
  }

  function tick(time) {
    frame = 0;
    if (paused || document.hidden) return;
    if (lastTime) elapsed += Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;
    render();
    if (completed < strokes.length) frame = requestAnimationFrame(tick);
  }

  function play() {
    lastTime = 0;
    if (!frame && !paused && !document.hidden && completed < strokes.length) frame = requestAnimationFrame(tick);
  }

  function fit(keepProgress = false) {
    const progress = keepProgress && totalDuration > 0 ? Math.min(1, elapsed / totalDuration) : 0;
    cancelAnimationFrame(frame);
    frame = 0;
    width = innerWidth;
    height = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    for (const surface of [canvas, paper, settled]) {
      surface.width = Math.round(width * dpr);
      surface.height = Math.round(height * dpr);
      surface.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    build();
    elapsed = reducedMotion.matches ? totalDuration : progress * totalDuration;
    render();
    play();
  }

  function restart() {
    seed = newSeed();
    paused = false;
    fit();
  }

  function save() {
    canvas.toBlob(blob => {
      if (!blob) return;
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.download = `strega-nona-${seed}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  canvas.addEventListener('click', restart);
  addEventListener('keydown', event => {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.code === 'Space') {
      event.preventDefault();
      paused = !paused;
      if (paused) { cancelAnimationFrame(frame); frame = 0; render(); }
      else play();
    } else if (event.key.toLowerCase() === 'r' || event.key === 'Enter') {
      event.preventDefault();
      restart();
    } else if (event.key.toLowerCase() === 's') save();
  });
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => fit(true), 150);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else play();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      elapsed = totalDuration;
      cancelAnimationFrame(frame);
      frame = 0;
      render();
    }
  });
  seed = new URLSearchParams(location.search).get('seed') || newSeed();
  fit();
})();
