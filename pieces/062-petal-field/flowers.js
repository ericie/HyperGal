(() => {
  'use strict';
  const field = document.getElementById('field');
  const status = document.getElementById('status');
  const pause = document.getElementById('pause');
  const palettes = [[345, 48, 65], [18, 70, 66], [40, 73, 65], [270, 25, 65], [157, 25, 53], [6, 52, 57]];
  let flowers, width, height, ratio, coverage, cover, complete, paused = false, last = 0, budget = 0, petals = 0;
  const random = (a, b) => a + Math.random() * (b - a);
  const color = (f, light, shift = 0) => `hsl(${f.hue + shift} ${f.saturation}% ${light}%)`;
  function start() {
    width = innerWidth; height = innerHeight; ratio = Math.min(devicePixelRatio || 1, 2);
    field.replaceChildren(); petals = 0; complete = false; budget = 0;
    coverage = document.createElement('canvas');
    coverage.width = Math.ceil(width / 5); coverage.height = Math.ceil(height / 5);
    cover = coverage.getContext('2d', { willReadFrequently: true });
    cover.scale(coverage.width / width, coverage.height / height);
    const count = Math.floor(random(2, 11));
    flowers = Array.from({ length: count }, (_, z) => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      canvas.style.zIndex = z; canvas.setAttribute('aria-hidden', 'true'); field.append(canvas);
      const ctx = canvas.getContext('2d'); ctx.scale(ratio, ratio);
      const [hue, saturation, light] = palettes[Math.floor(random(0, palettes.length))];
      const radius = random(16, Math.max(25, Math.min(width, height) * .095));
      const f = { canvas, ctx, z, hue: hue + random(-8, 8), saturation, light, radius,
        x: random(width * .08, width * .92), y: random(height * .08, height * .92),
        row: 0, index: 0, phase: random(0, Math.PI * 2), size: random(22, 48) };
      for (const c of [ctx, cover]) {
        c.beginPath(); c.arc(f.x, f.y, radius, 0, Math.PI * 2);
        c.fillStyle = c === ctx ? color(f, 28) : '#000'; c.fill();
      }
      ctx.strokeStyle = color(f, 79); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(f.x, f.y, radius * .78, 0, Math.PI * 2); ctx.stroke();
      return f;
    });
    field.dataset.flowers = count;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      while (!complete) grow();
    }
    update();
  }
  function petal(f) {
    const r = f.radius + f.row * f.size * .56;
    const length = f.size * (1.45 + .12 * Math.sin(f.row));
    const count = Math.max(9, Math.ceil(Math.PI * 2 * (r + length * .4) / (f.size * .45)));
    const angle = f.phase + f.index * Math.PI * 2 / count + (f.row % 2) * Math.PI / count;
    const breadth = f.size * random(.55, .72);
    const path = new Path2D();
    path.moveTo(r - f.size * .7, 0);
    path.bezierCurveTo(r + length * .15, -breadth, r + length, -breadth * .8, r + length, 0);
    path.bezierCurveTo(r + length, breadth * .8, r + length * .15, breadth, r - f.size * .7, 0);
    for (const c of [f.ctx, cover]) {
      c.save(); c.translate(f.x, f.y); c.rotate(angle);
      // New rows grow behind earlier rows, preserving the whole flower's center.
      c.globalCompositeOperation = c === f.ctx ? 'destination-over' : 'source-over';
      if (c === f.ctx) {
        c.strokeStyle = color(f, Math.max(25, f.light - 24)); c.lineWidth = 1.2;
        c.stroke(path);
      }
      c.fillStyle = c === f.ctx ? color(f, f.light + 7 * Math.sin(f.row * .85), 5 * Math.sin(f.row * .6)) : '#000';
      c.fill(path); c.restore();
    }
    f.index++; petals++;
    if (f.index === count) { f.index = 0; f.row++; }
  }
  function grow() {
    flowers.forEach(petal);
    if (petals % (flowers.length * 24) === 0) {
      const pixels = cover.getImageData(0, 0, coverage.width, coverage.height).data;
      complete = true;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] < 250) { complete = false; break; }
      if (complete) update();
    }
  }
  function update() {
    field.dataset.state = complete ? 'complete' : paused ? 'paused' : 'growing';
    status.textContent = `${flowers.length} flowers · ${complete ? 'in full bloom' : paused ? 'paused' : 'unfolding'}`;
    pause.textContent = paused ? 'Resume' : 'Pause';
    pause.disabled = complete;
  }
  function toggle() { if (!complete) { paused = !paused; update(); } }
  function save() {
    const canvas = document.createElement('canvas'); canvas.width = flowers[0].canvas.width; canvas.height = flowers[0].canvas.height;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#eee5d4'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    flowers.forEach(f => ctx.drawImage(f.canvas, 0, 0));
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'petal-field.png'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  pause.addEventListener('click', toggle);
  document.getElementById('restart').addEventListener('click', start);
  document.getElementById('save').addEventListener('click', save);
  addEventListener('keydown', e => {
    if (e.target.closest('button') || e.repeat) return;
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (e.key.toLowerCase() === 'r') start();
    if (e.key.toLowerCase() === 's') save();
  });
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(start, 160); });
  function frame(time) {
    const elapsed = Math.min(100, time - last); last = time;
    if (!paused && !complete && !document.hidden) {
      budget += elapsed * .045;
      while (budget >= 1 && !complete) { grow(); budget--; }
    }
    requestAnimationFrame(frame);
  }
  start(); requestAnimationFrame(frame);
})();
