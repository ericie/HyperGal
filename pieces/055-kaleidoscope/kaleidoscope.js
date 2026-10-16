(() => {
  'use strict';
  const canvas = document.getElementById('kaleidoscope');
  const ctx = canvas.getContext('2d', { alpha: false });
  const source = document.createElement('canvas');
  const ink = source.getContext('2d');
  const pauseButton = document.getElementById('pause');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  const slice = TAU / 12;
  const MOTION_SPEED = 3.5;
  const colors = ['#ff548f', '#ffcc49', '#48f1df', '#b486ff', '#ff814d', '#7baaff'];
  let width, height, radius, scale, time = 0, previous = 0, frame = 0;
  let paused = motion.matches;
  let seed = 2166136261;
  const seedText = new URLSearchParams(location.search).get('seed') || 'confetti';
  for (const char of seedText) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  function random() {
    seed += 0x6D2B79F5;
    let n = seed;
    n = Math.imul(n ^ n >>> 15, n | 1);
    n ^= n + Math.imul(n ^ n >>> 7, n | 61);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  }
  let shards, prisms, glitter;
  function arrange() {
    shards = Array.from({ length: 180 }, (_, i) => ({
      r: 0.04 + random() * 1.08, a: random() * TAU,
      size: 0.012 + random() * 0.055, phase: random() * TAU,
      speed: (0.014 + random() * 0.025) * (i % 2 ? 1 : -1),
      sides: [3, 4, 6][i % 3], color: colors[i % colors.length],
      hollow: i % 4 === 0
    }));
    const films = Array.from({ length: 16 }, (_, i) => makeFilm(i));
    prisms = Array.from({ length: 100 }, (_, i) => ({
      r: 0.04 + random() * 1.12, a: random() * TAU,
      size: 0.035 + random() ** 1.4 * 0.20,
      phase: random() * TAU, speed: (0.008 + random() * 0.018) * (i % 2 ? 1 : -1),
      film: films[i % films.length]
    }));
    glitter = Array.from({ length: 4200 }, (_, i) => ({
      r: Math.sqrt(random()) * 1.2, a: random() * TAU,
      size: 0.0007 + random() ** 3 * 0.005,
      phase: random() * TAU, speed: 0.006 + random() * 0.022,
      color: colors[i % colors.length], flare: i % 37 === 0
    }));
  }
  function polygon(x, y, r, sides, angle) {
    ink.beginPath();
    for (let j = 0; j < sides; j++) {
      const a = angle + TAU * j / sides;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (j === 0) ink.moveTo(px, py); else ink.lineTo(px, py);
    }
    ink.closePath();
  }
  // Cache faceted translucent films; animate their position, scale and rotation.
  function makeFilm(index) {
    const film = document.createElement('canvas');
    film.width = film.height = 256;
    const f = film.getContext('2d');
    const phase = random() * TAU;
    const sides = [3, 4, 6, 8][index % 4];
    const hue = index * 137.508 % 360;
    function contour(k) {
      f.beginPath();
      for (let j = 0; j < sides; j++) {
        const a = j / sides * TAU + phase;
        const r = k;
        const x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r;
        if (j === 0) f.moveTo(x, y); else f.lineTo(x, y);
      }
      f.closePath();
    }
    contour(107);
    f.save(); f.clip();
    const body = f.createRadialGradient(100, 87, 4, 129, 130, 121);
    body.addColorStop(0, `hsla(${hue + 70},100%,80%,0.06)`);
    body.addColorStop(0.48, `hsla(${hue},100%,54%,0.14)`);
    body.addColorStop(0.77, `hsla(${hue + 45},100%,66%,0.35)`);
    body.addColorStop(0.90, `hsla(${hue + 155},100%,70%,0.8)`);
    body.addColorStop(0.97, `hsla(${hue + 250},100%,64%,0.95)`);
    body.addColorStop(1, `hsla(${hue},100%,90%,0.1)`);
    f.fillStyle = body; f.fillRect(0, 0, 256, 256);
    // Thin-film interference: many nested, changing-hue contours at the rim.
    for (let j = 0; j < 18; j++) {
      contour(107 - j * 1.45);
      const ribbon = f.createLinearGradient(25, 40 + j * 3, 229, 210 - j * 2);
      ribbon.addColorStop(0, `hsla(${hue + j * 14},100%,78%,${0.65 - j * 0.025})`);
      ribbon.addColorStop(0.45, `hsla(${hue + 150 + j * 10},100%,60%,0.04)`);
      ribbon.addColorStop(1, `hsla(${hue + 260 + j * 12},100%,74%,0.6)`);
      f.strokeStyle = ribbon; f.lineWidth = 1.4; f.stroke();
    }
    const shine = f.createRadialGradient(81, 61, 0, 81, 61, 66);
    shine.addColorStop(0, '#fffceaaa'); shine.addColorStop(0.25, '#fffce922'); shine.addColorStop(1, '#fffcea00');
    f.fillStyle = shine; f.fillRect(0, 0, 256, 256);
    f.restore();
    contour(107); f.strokeStyle = '#fff5dd99'; f.lineWidth = 0.8; f.stroke();
    return film;
  }
  function inMirror(x, y, size) {
    return x > -size && y > -size && y < x * Math.tan(slice) + size * 1.2;
  }
  function drawPrisms(front) {
    for (let i = 0; i < prisms.length; i++) {
      if ((i % 3 === 0) !== front) continue;
      const b = prisms[i], a = b.a + time * MOTION_SPEED * b.speed;
      const r = b.r + 0.10 * Math.sin(time * MOTION_SPEED * 0.075 + b.phase);
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (!inMirror(x, y, b.size * 1.3)) continue;
      const breath = Math.sin(time * MOTION_SPEED * 0.22 + b.phase);
      ink.save(); ink.translate(x, y); ink.rotate(b.phase + time * MOTION_SPEED * b.speed * 0.7);
      ink.scale(1 + breath * 0.08, 1 + breath * 0.08);
      ink.globalAlpha = front ? 0.9 : 0.75;
      ink.drawImage(b.film, -b.size, -b.size, b.size * 2, b.size * 2);
      ink.restore();
    }
  }
  function drawGlitter(front) {
    ink.save(); ink.globalCompositeOperation = 'screen';
    for (let i = 0; i < glitter.length; i++) {
      if ((i % 3 === 0) !== front) continue;
      const g = glitter[i], a = g.a + time * MOTION_SPEED * g.speed * (front ? -1 : 1);
      const r = g.r + 0.025 * Math.sin(time * MOTION_SPEED * 0.16 + g.phase);
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (!inMirror(x, y, g.size * 5)) continue;
      const shimmer = 0.5 + 0.5 * Math.sin(time * 0.9 + g.phase);
      ink.globalAlpha = 0.25 + shimmer * 0.7;
      ink.fillStyle = g.color;
      polygon(x, y, g.size, 4, g.phase + time * MOTION_SPEED * 0.08);
      ink.fill();
      if (g.flare) {
        ink.fillStyle = '#fffbe6';
        ink.fillRect(x - g.size * 3, y - g.size * 0.22, g.size * 6, g.size * 0.44);
        ink.fillRect(x - g.size * 0.22, y - g.size * 3, g.size * 0.44, g.size * 6);
      }
    }
    ink.restore();
  }
  function draw() {
    const s = source.width / 2;
    ink.setTransform(s, 0, 0, s, s, s);
    ink.fillStyle = '#100c29';
    ink.fillRect(-1, -1, 2, 2);
    // A broad pool of colored light behind the sharply cut glass.
    const light = ink.createRadialGradient(0.25, 0.1, 0, 0, 0, 1.2);
    light.addColorStop(0, '#352057');
    light.addColorStop(0.6, '#191039');
    light.addColorStop(1, '#100c29');
    ink.fillStyle = light;
    ink.fillRect(-1, -1, 2, 2);
    drawPrisms(false);
    drawGlitter(false);
    for (const shard of shards) {
      // Drift through the mirror wedge; reflected cuts continually recombine.
      const a = shard.a + time * MOTION_SPEED * shard.speed;
      const r = shard.r + 0.095 * Math.sin(time * MOTION_SPEED * 0.095 + shard.phase);
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      const size = shard.size * (1 + 0.16 * Math.sin(time * MOTION_SPEED * 0.18 + shard.phase));
      if (!inMirror(x, y, size * 1.3)) continue;
      const rotation = shard.phase + time * MOTION_SPEED * shard.speed * 1.8;
      polygon(x, y, size, shard.sides, rotation);
      ink.globalAlpha = shard.hollow ? 0.8 : 0.72;
      ink.fillStyle = shard.color;
      ink.strokeStyle = shard.color;
      ink.lineWidth = 0.003;
      ink.shadowColor = shard.color;
      ink.shadowBlur = s * 0.009;
      if (shard.hollow) ink.stroke(); else ink.fill();
      ink.shadowBlur = 0;
      ink.globalAlpha = 0.85;
      ink.strokeStyle = '#fff5dd';
      ink.lineWidth = 0.0016;
      ink.stroke();
      if (!shard.hollow) {
        polygon(x, y, size * 0.56, shard.sides, rotation);
        ink.globalAlpha = 0.25;
        ink.fillStyle = '#fffbe6';
        ink.fill();
      }
      ink.globalAlpha = 1;
    }
    drawPrisms(true);
    drawGlitter(true);
    ctx.setTransform(scale, 0, 0, scale, width * scale / 2, height * scale / 2);
    ctx.fillStyle = '#100c29';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    const turn = time * 0.085 - Math.PI / 2;
    for (let i = 0; i < 12; i++) {
      ctx.save();
      ctx.rotate(turn + i * slice);
      if (i % 2) { ctx.rotate(slice); ctx.scale(1, -1); }
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, -0.0007, slice + 0.0007);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(source, -radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    }
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    radius = Math.hypot(width, height) / 2 + 2;
    source.width = source.height = Math.min(1600, Math.ceil(radius * scale * 2));
    draw();
  }
  function tick(now) {
    frame = 0;
    if (paused || document.hidden) return;
    if (previous) time += Math.min((now - previous) / 1000, 0.05);
    previous = now;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    pauseButton.textContent = paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-label', paused ? 'Play kaleidoscope' : 'Pause kaleidoscope');
    if (!paused && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function save() {
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'kaleidoscope.png'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  pauseButton.addEventListener('click', () => { paused = !paused; sync(); });
  document.getElementById('save').addEventListener('click', save);
  addEventListener('keydown', event => {
    if (event.target instanceof HTMLButtonElement || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.code === 'Space') { event.preventDefault(); paused = !paused; sync(); }
    if (event.key.toLowerCase() === 's') save();
    if (event.key.toLowerCase() === 'r') { arrange(); draw(); }
  });
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', () => { paused = motion.matches; sync(); });
  arrange(); resize(); sync();
})();
