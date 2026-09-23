/* Tideline — waves carry fresh dye up a pale shore and leave it behind. */
(() => {
  'use strict';
  const canvas = document.getElementById('shore');
  const ctx = canvas.getContext('2d');
  const stain = document.createElement('canvas'), stainCtx = stain.getContext('2d');
  const wet = document.createElement('canvas'), wetCtx = wet.getContext('2d');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2, SPACING = 3, DRY = 26, SOFTNESS = 12;
  // Natural dyes as [hue, saturation, lightness]: indigo, woad, madder,
  // cochineal, weld, saffron, verdigris, logwood, walnut, rose madder,
  // sage and peacock teal.
  const DYES = [[222, 45, 38], [212, 38, 50], [6, 55, 48], [340, 52, 44], [47, 62, 52], [30, 75, 55],
    [165, 38, 44], [275, 32, 45], [28, 35, 38], [350, 48, 62], [95, 22, 48], [190, 45, 42]];
  // Dye settles where the water lingers: strongest just below the line it
  // reached, then thinner bands down the slope. [depth, alpha] per band.
  const DEPOSIT = [[2, 0.14], [4, 0.08], [7, 0.06], [11, 0.05], [16, 0.045], [23, 0.04], [32, 0.035], [44, 0.03],
    [60, 0.028], [80, 0.026], [105, 0.024], [135, 0.022], [170, 0.02], [210, 0.018]];
  let width, height, dpr, scale, random, columns, xs, sea;
  let seed = new URLSearchParams(location.search).get('seed') || freshSeed();
  let clock = 0, frame = 0, lastTime = null, paused = false, resizeTimer;
  let waves = [], history = [], launched = 0, nextLaunch = 0, usedDyes = [];
  let tidePhase = 0, swellPhase = 0, seaFrom, seaTarget, seaSince = 0;
  const lobeScratch = new Float32Array(32);
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
  function css([h, s, l], alpha, shade = 0) {
    return `hsla(${h.toFixed(1)}, ${s.toFixed(1)}%, ${Math.max(0, Math.min(100, l + shade)).toFixed(1)}%, ${alpha})`;
  }
  function mix(a, b, t) {
    const turn = ((b[0] - a[0] + 540) % 360) - 180;
    return [(a[0] + turn * t + 360) % 360, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  function dye() {
    let index;
    do index = Math.floor(random() * DYES.length); while (usedDyes.includes(index));
    usedDyes = [index, ...usedDyes].slice(0, 3);
    const [h, s, l] = DYES[index];
    return [(h + between(-7, 7) + 360) % 360, s + between(-6, 6), l + between(-5, 5)];
  }

  // The still water at the foot of the shore breathes with a slow tide and a
  // small ripple, so every wave is measured from a line that is itself alive.
  function shoreAt(t) { return height * (0.885 + 0.035 * Math.sin(TAU * t / 320 + tidePhase)); }
  function seaAt(t, out) {
    const base = shoreAt(t);
    for (let i = 0; i < columns; i++) {
      const x = xs[i] / scale;
      out[i] = base + scale * (3.5 * Math.sin(x * 0.012 + t * 0.6) + 2.2 * Math.sin(x * 0.027 - t * 0.45 + 1.7) + 1.2 * Math.sin(x * 0.061 + t * 1.1 + 0.4));
    }
    return out;
  }
  // A wave is a run of rounded lobes joined at cusps. Its reach up the slope
  // decelerates on the way up and gathers speed on the way back.
  function makeWave(born, aim) {
    const shore = shoreAt(born);
    let reach = (0.1 + 0.72 * random() ** 1.5) * (0.85 + 0.2 * Math.sin(launched * 0.5 + swellPhase));
    if (random() < 0.015) reach = 1.08;
    if (!launched) reach = Math.max(reach, 0.42);
    const count = Math.max(2, Math.round(width / (190 * scale) + between(-0.5, 1)));
    const lobes = [];
    for (let j = 0; j < count; j++) lobes.push({ c: (j + between(0.2, 0.8)) / count, s: between(0.65, 1.05) / count, h: between(0.45, 1),
      drift: between(-0.006, 0.006), wobble: between(0, TAU), rate: between(0.25, 0.6) });
    if (aim) {
      reach = Math.max(0.1, Math.min(1.08, (shore - aim.y) / shore / 0.98));
      const lobe = lobes.reduce((a, b) => Math.abs(a.c - aim.x) < Math.abs(b.c - aim.x) ? a : b);
      lobe.c = aim.x; lobe.h = 1; lobe.drift = 0;
    }
    const up = between(3.2, 5) * (0.75 + 0.45 * Math.min(1, reach)), down = up * between(1.3, 1.7);
    return { color: dye(), reach, shore, born, up, down, lobes, ripple: between(0, TAU), front: new Float32Array(columns), crest: null, peak: 0 };
  }
  function reachAt(wave, tau) {
    return tau < wave.up ? 1 - (1 - tau / wave.up) ** 2 : Math.max(0, 1 - ((tau - wave.up) / wave.down) ** 2);
  }
  function profileAt(wave, i, tau) {
    const xi = xs[i] / width, lobes = wave.lobes;
    let top = -Infinity, sum = 0;
    for (let j = 0; j < lobes.length; j++) {
      const lobe = lobes[j], d = (xi - lobe.c - lobe.drift * tau) / lobe.s;
      const v = lobe.h * (1 + 0.08 * Math.sin(lobe.wobble + lobe.rate * tau)) * Math.exp(-(Math.abs(d) ** 2.6));
      lobeScratch[j] = v; if (v > top) top = v;
    }
    for (let j = 0; j < lobes.length; j++) sum += Math.exp((lobeScratch[j] - top) * SOFTNESS);
    const p = top + Math.log(sum) / SOFTNESS;
    const x = xs[i] / scale;
    return 0.62 + 0.38 * p + 0.015 * Math.sin(x * 0.028 + tau * 2.1 + wave.ripple) + 0.008 * Math.sin(x * 0.067 - tau * 1.6 + wave.ripple);
  }
  function frontAt(wave, tau, seaLine, out) {
    const rise = reachAt(wave, tau) * wave.reach * wave.shore;
    for (let i = 0; i < columns; i++) out[i] = seaLine[i] - rise * profileAt(wave, i, tau);
    return out;
  }

  function trace(context, line, offset) {
    context.moveTo(-4, line[0] + offset);
    for (let i = 0; i < columns; i++) context.lineTo(xs[i], line[i] + offset);
    context.lineTo(width + 4, line[columns - 1] + offset);
  }
  function region(context, line, offset) {
    context.beginPath(); trace(context, line, offset);
    context.lineTo(width + 4, height + 4); context.lineTo(-4, height + 4); context.closePath();
  }
  function band(context, line, top, bottom) {
    context.beginPath(); trace(context, line, top);
    context.lineTo(width + 4, line[columns - 1] + bottom);
    for (let i = columns - 1; i >= 0; i--) context.lineTo(xs[i], line[i] + bottom);
    context.lineTo(-4, line[0] + bottom); context.closePath();
  }
  function stamp(wave) {
    const k = scale * (0.7 + 0.6 * Math.min(1, wave.reach));
    stainCtx.fillStyle = css(wave.color, 0.02);
    region(stainCtx, wave.crest, 0); stainCtx.fill();
    for (const [depth, alpha] of DEPOSIT) {
      stainCtx.fillStyle = css(wave.color, alpha);
      band(stainCtx, wave.crest, 0, depth * k); stainCtx.fill();
    }
    // The rim dries darkest, the way a ring forms at the edge of a spill.
    stainCtx.beginPath(); trace(stainCtx, wave.crest, 0.6 * scale);
    stainCtx.strokeStyle = css(wave.color, 0.36, -10); stainCtx.lineWidth = 1.3 * scale;
    stainCtx.lineJoin = stainCtx.lineCap = 'round'; stainCtx.stroke();
  }
  function sand() {
    const tile = document.createElement('canvas');
    tile.width = tile.height = 128;
    const t = tile.getContext('2d'), pixels = t.createImageData(128, 128), grain = generator(seed + ':sand');
    for (let i = 0; i < pixels.data.length; i += 4) {
      const n = (grain() - 0.5) * 12;
      pixels.data[i] = 236 + n; pixels.data[i + 1] = 227 + n; pixels.data[i + 2] = 208 + n; pixels.data[i + 3] = 255;
    }
    t.putImageData(pixels, 0, 0);
    stainCtx.save(); stainCtx.setTransform(1, 0, 0, 1, 0, 0);
    stainCtx.fillStyle = stainCtx.createPattern(tile, 'repeat'); stainCtx.fillRect(0, 0, stain.width, stain.height);
    stainCtx.restore();
  }

  function seaNow() { return mix(seaFrom, seaTarget, Math.min(1, (clock - seaSince) / 2.5)); }
  function turn(wave) {
    const seaLine = seaAt(wave.born + wave.up, new Float32Array(columns));
    wave.crest = frontAt(wave, wave.up, seaLine, new Float32Array(columns));
    wave.peak = wave.born + wave.up;
    stamp(wave); history.push(wave);
  }
  function launch(aim) {
    const wave = makeWave(clock, aim);
    frontAt(wave, 0, sea, wave.front);
    waves.push(wave); launched++;
    seaFrom = seaNow(); seaTarget = wave.color; seaSince = clock;
    if (!aim) nextLaunch = clock + between(4.5, 9);
    return wave;
  }
  function advance(dt) {
    clock += dt;
    if (clock >= nextLaunch) launch();
    seaAt(clock, sea);
    for (const wave of waves) {
      const tau = clock - wave.born;
      if (!wave.crest && tau >= wave.up) turn(wave);
      frontAt(wave, tau, sea, wave.front);
    }
    waves = waves.filter(w => clock - w.born < w.up + w.down);
    history = history.filter(w => clock - w.peak < DRY);
  }
  // Skip ahead: several waves have already come and gone, their dye is on
  // the sand and the last few patches are still drying.
  function fastForward(count) {
    for (let i = count; i > 0; i--) {
      const wave = makeWave(clock - i * 7 - 4);
      launched++; turn(wave);
      seaFrom = seaTarget = wave.color; seaSince = clock;
    }
    history = history.filter(w => clock - w.peak < DRY).sort((a, b) => a.peak - b.peak);
  }
  function render() {
    ctx.drawImage(stain, 0, 0, width, height);
    // Freshly uncovered sand is dark with water and dries back over DRY seconds.
    if (history.length) {
      wetCtx.fillStyle = '#fff'; wetCtx.fillRect(0, 0, width, height);
      for (const wave of history) {
        const w = Math.max(0, 1 - (clock - wave.peak) / DRY) ** 1.4;
        wetCtx.fillStyle = `rgb(${Math.round(255 - 40 * w)}, ${Math.round(255 - 48 * w)}, ${Math.round(255 - 62 * w)})`;
        region(wetCtx, wave.crest, 0); wetCtx.fill();
      }
      ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(wet, 0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.fillStyle = css(seaNow(), 1, -8); region(ctx, sea, 0); ctx.fill();
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.beginPath(); trace(ctx, sea, 0); ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'; ctx.lineWidth = 2 * scale; ctx.stroke();
    for (const wave of waves) {
      const tau = clock - wave.born, r = reachAt(wave, tau);
      // Thin water at the leading edge lets the sand show through; the sheet
      // thickens a few steps behind the front.
      ctx.fillStyle = css(wave.color, 0.22, -4);
      for (let k = 0; k < 8; k++) { region(ctx, wave.front, k * 5 * scale); ctx.fill(); }
      const foam = tau < wave.up ? 1 - 0.5 * tau / wave.up : 0.5 * r;
      ctx.beginPath(); trace(ctx, wave.front, 0);
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.08 + 0.12 * foam).toFixed(3)})`; ctx.lineWidth = (3 + 11 * foam) * scale; ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.25 + 0.5 * foam).toFixed(3)})`; ctx.lineWidth = (1.2 + 4.5 * foam) * scale; ctx.stroke();
    }
  }

  function state() {
    canvas.dataset.state = reducedMotion.matches ? 'still' : paused ? 'paused' : 'running';
    canvas.dataset.seed = seed; canvas.dataset.waves = launched;
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = null; }
  function schedule() {
    state();
    if (!frame && !paused && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(tick);
  }
  function tick(time) {
    frame = 0;
    const dt = lastTime === null ? 0 : Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;
    advance(dt); render(); schedule();
  }
  function fit(preserve = false) {
    stop();
    let kept = null;
    if (preserve && width) {
      kept = document.createElement('canvas'); kept.width = stain.width; kept.height = stain.height;
      kept.getContext('2d').drawImage(stain, 0, 0);
    }
    width = Math.max(1, innerWidth); height = Math.max(1, innerHeight); dpr = Math.min(devicePixelRatio || 1, 2);
    scale = Math.max(0.75, Math.min(1.4, Math.sqrt(width * height / 1000000)));
    for (const c of [canvas, stain, wet]) { c.width = Math.round(width * dpr); c.height = Math.round(height * dpr); }
    for (const c of [ctx, stainCtx, wetCtx]) c.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.ceil(width / SPACING) + 1;
    xs = Float32Array.from({ length: columns }, (_, i) => i * SPACING);
    sea = new Float32Array(columns);
    waves = []; history = [];
    if (kept) stainCtx.drawImage(kept, 0, 0, width, height);
    else {
      random = generator(seed);
      tidePhase = between(0, TAU); swellPhase = between(0, TAU); usedDyes = [];
      clock = 0; launched = 0; nextLaunch = 0.6; seaFrom = seaTarget = [205, 20, 62]; seaSince = 0;
      sand();
      if (reducedMotion.matches) fastForward(30);
    }
    seaAt(clock, sea); render(); schedule();
  }
  function restart() { seed = freshSeed(); paused = false; fit(); }
  function summon(aim) {
    const wave = launch(aim);
    if (reducedMotion.matches) { turn(wave); wave.peak = clock - DRY; waves = []; }
    if (paused || reducedMotion.matches) render();
    state();
  }
  function skip() {
    fastForward(12);
    if (paused || reducedMotion.matches) render();
    state();
  }
  function save() {
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.download = `tideline-${seed}.png`; link.href = url; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }
  canvas.addEventListener('click', event => summon({ x: event.clientX / width, y: Math.min(event.clientY, shoreAt(clock) - 10) }));
  addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'r' || key === 'enter' || key === 's' || key === 'f') event.preventDefault();
    if (key === 'enter') summon();
    if (key === 'r') restart();
    if (key === ' ') { paused = !paused; stop(); schedule(); }
    if (key === 'f') skip();
    if (key === 's') save();
  });
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => fit(true), 180); });
  document.addEventListener('visibilitychange', () => { stop(); schedule(); });
  reducedMotion.addEventListener('change', () => { stop(); schedule(); });
  fit();
})();
