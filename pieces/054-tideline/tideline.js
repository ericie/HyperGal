/* Tideline — two shores wash dye at each other and leave it on the sand. */
(() => {
  'use strict';
  const canvas = document.getElementById('shore');
  const ctx = canvas.getContext('2d');
  const stain = document.createElement('canvas'), stainCtx = stain.getContext('2d');
  const wet = document.createElement('canvas'), wetCtx = wet.getContext('2d');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2, SPACING = 5, DRY = 26, SOFTNESS = 12, INSET = 0.115, LOBES = 32;
  // The strength of a natural dye, as [saturation, lightness]: indigo, woad,
  // madder, cochineal, weld, saffron, verdigris, logwood, walnut, rose madder,
  // sage and peacock teal. Hue comes from the shore that sends the wave.
  const DYES = [[34, 38], [29, 50], [40, 48], [38, 44], [45, 52], [52, 55],
    [29, 44], [24, 45], [27, 38], [35, 62], [17, 48], [34, 42]];
  // Dye settles where the water lingers: strongest right behind the line it
  // reached, falling away quickly back down the slope, so each wave keeps its
  // own edge instead of washing the whole shore. Depths are fractions of the
  // height; [depth, alpha] per band.
  const DEPOSIT = [[0.003, 0.085], [0.007, 0.05], [0.013, 0.036], [0.021, 0.028], [0.032, 0.022], [0.047, 0.018],
    [0.067, 0.015], [0.093, 0.012], [0.126, 0.01], [0.167, 0.008], [0.216, 0.006]];
  let width, height, dpr, scale, random, columns, xs, grain;
  let seed = new URLSearchParams(location.search).get('seed') || freshSeed();
  let clock = 0, frame = 0, lastTime = null, paused = false, resizeTimer;
  let shores = [], waves = [], history = [], launched = 0, usedDyes = [];
  let wetAt = -1, wetCount = -1;
  const lobeScratch = new Float32Array(LOBES);
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
  // Each shore works from a hue that creeps around the wheel, and the two
  // stay on opposite sides of it. Waves vary around their shore's hue, so
  // colours blend within a family instead of silting up into brown, and the
  // whole palette turns over the course of minutes.
  function dye(shore) {
    let index;
    do index = Math.floor(random() * DYES.length); while (usedDyes.includes(index));
    usedDyes = [index, ...usedDyes].slice(0, 3);
    const [s, l] = DYES[index];
    const hue = (shore.hue + between(-32, 32) + 360) % 360;
    shore.hue = (shore.hue + between(5, 17)) % 360;
    return [hue, s + between(-6, 6), l + between(-5, 5)];
  }

  // Two shores face each other across the sand, one along the bottom edge and
  // one along the top. A shore's `dir` points from its water into the field:
  // +1 runs up the page, -1 runs down it. Everything below is written once,
  // in terms of dir, and works from either side.
  function makeShore(dir) {
    return { dir, line: new Float32Array(columns), tide: between(0, TAU), swell: between(0, TAU),
      period: between(280, 360), next: dir > 0 ? 0.6 : between(2.5, 4.5), launched: 0, hue: 0,
      from: [205, 20, 62], target: [205, 20, 62], since: 0 };
  }
  // The still water breathes with a slow tide, so every wave is measured from
  // a line that is itself alive.
  function shoreAt(shore, t) {
    const depth = height * (INSET + 0.035 * Math.sin(TAU * t / shore.period + shore.tide));
    return shore.dir > 0 ? height - depth : depth;
  }
  function seaAt(shore, t, out) {
    const base = shoreAt(shore, t), phase = shore.tide;
    for (let i = 0; i < columns; i++) {
      const x = xs[i] / scale;
      out[i] = base - shore.dir * scale * (3.5 * Math.sin(x * 0.012 + t * 0.6 + phase)
        + 2.2 * Math.sin(x * 0.027 - t * 0.45 + 1.7 + phase) + 1.2 * Math.sin(x * 0.061 + t * 1.1 + 0.4 + phase));
    }
    return out;
  }
  // A wave is a run of rounded lobes joined at cusps. Scallops run from broad
  // tongues to a fine frill, so no two waves share a scale.
  function makeWave(shore, born, aim) {
    const run = height * (1 - INSET);
    // Some waves run the whole width; others surge along one stretch of it,
    // so the marks overlap in patches instead of stacking as full-width bands.
    // A surge along a short stretch does not run as far up the sand.
    const span = random() < 0.4 ? 1 : between(0.3, 0.8);
    let mid = between(span / 2 - 0.12, 1 - span / 2 + 0.12);
    let reach = (0.12 + 0.78 * random() ** 1.5) * (0.85 + 0.2 * Math.sin(shore.launched * 0.5 + shore.swell)) * span ** 1.2;
    if (random() < 0.02) reach = 1.05 * span ** 1.2;
    if (!shore.launched) reach = Math.max(reach, 0.4);
    const count = Math.max(2, Math.min(LOBES, Math.round(width * span / (190 * scale) * between(0.6, 2.4) + between(-0.5, 1))));
    const lobes = [];
    for (let j = 0; j < count; j++) lobes.push({ c: mid + span * ((j + between(0.2, 0.8)) / count - 0.5),
      s: span * between(0.65, 1.05) * (span < 1 ? 1.9 : 1) / count, h: between(0.45, 1),
      drift: between(-0.006, 0.006), wobble: between(0, TAU), rate: between(0.25, 0.6) });
    if (aim) {
      reach = Math.max(0.08, Math.min(1.05, Math.abs(aim.y - shoreAt(shore, born)) / run));
      const lobe = lobes.reduce((a, b) => Math.abs(a.c - aim.x) < Math.abs(b.c - aim.x) ? a : b);
      lobe.c = aim.x; lobe.h = 1; lobe.drift = 0;
      if (Math.abs(aim.x - mid) > span / 2) { mid = aim.x; for (const l of lobes) l.c = mid + (l.c - lobe.c); lobe.c = mid; }
    }
    const up = between(3.2, 5) * (0.75 + 0.45 * Math.min(1, reach)), down = up * between(1.3, 1.7);
    // A full-width wave advances everywhere, so its scallops ride on a base.
    // A surge has none: its ends fall away with the lobes themselves.
    return { shore, color: dye(shore), reach, run, born, up, down, lobes, span, mid, base: span >= 1 ? 0.62 : 0,
      ripple: between(0, TAU),
      front: new Float32Array(columns), crest: null, peak: 0 };
  }
  // The run-up decelerates on the way out and gathers speed on the way back.
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
    const x = xs[i] / scale, body = wave.base + (1 - wave.base) * p;
    return body + (0.015 * Math.sin(x * 0.028 + tau * 2.1 + wave.ripple) + 0.008 * Math.sin(x * 0.067 - tau * 1.6 + wave.ripple)) * Math.min(1, body * 3);
  }
  function frontAt(wave, tau, seaLine, out) {
    const rise = reachAt(wave, tau) * wave.reach * wave.run;
    for (let i = 0; i < columns; i++) out[i] = seaLine[i] - wave.shore.dir * rise * profileAt(wave, i, tau);
    return out;
  }

  // Offsets are given as depths behind the front; dir turns them into page
  // coordinates, and a region closes onto that shore's own edge.
  function trace(context, line, offset) {
    context.moveTo(-4, line[0] + offset);
    for (let i = 0; i < columns; i++) context.lineTo(xs[i], line[i] + offset);
    context.lineTo(width + 4, line[columns - 1] + offset);
  }
  function region(context, line, dir, offset = 0) {
    const edge = dir > 0 ? height + 4 : -4;
    context.beginPath(); trace(context, line, offset * dir);
    context.lineTo(width + 4, edge); context.lineTo(-4, edge); context.closePath();
  }
  function band(context, line, dir, near, far) {
    context.beginPath(); trace(context, line, near * dir);
    context.lineTo(width + 4, line[columns - 1] + far * dir);
    for (let i = columns - 1; i >= 0; i--) context.lineTo(xs[i], line[i] + far * dir);
    context.lineTo(-4, line[0] + far * dir); context.closePath();
  }
  // Sun and salt take the old dye back toward bare sand between waves, so the
  // shore keeps a rolling memory instead of silting up.
  function weather() {
    stainCtx.save(); stainCtx.setTransform(1, 0, 0, 1, 0, 0);
    stainCtx.globalAlpha = 0.009; stainCtx.fillStyle = grain;
    stainCtx.fillRect(0, 0, stain.width, stain.height); stainCtx.restore();
  }
  function stamp(wave) {
    const dir = wave.shore.dir, k = height * (0.55 + 0.75 * Math.min(1, wave.reach));
    weather();
    for (const [depth, alpha] of DEPOSIT) {
      stainCtx.fillStyle = css(wave.color, alpha * 1.7);
      band(stainCtx, wave.crest, dir, 0, depth * k); stainCtx.fill();
    }
    // The rim dries darkest, the way a ring forms at the edge of a spill.
    stainCtx.beginPath(); trace(stainCtx, wave.crest, 0.6 * scale * dir);
    stainCtx.strokeStyle = css(wave.color, 0.36, -10); stainCtx.lineWidth = 1.3 * scale;
    stainCtx.lineJoin = stainCtx.lineCap = 'round'; stainCtx.stroke();
  }
  function sand() {
    const tile = document.createElement('canvas');
    tile.width = tile.height = 128;
    const t = tile.getContext('2d'), pixels = t.createImageData(128, 128), noise = generator(seed + ':sand');
    for (let i = 0; i < pixels.data.length; i += 4) {
      const n = (noise() - 0.5) * 12;
      pixels.data[i] = 236 + n; pixels.data[i + 1] = 227 + n; pixels.data[i + 2] = 208 + n; pixels.data[i + 3] = 255;
    }
    t.putImageData(pixels, 0, 0);
    grain = stainCtx.createPattern(tile, 'repeat');
    stainCtx.save(); stainCtx.setTransform(1, 0, 0, 1, 0, 0);
    stainCtx.fillStyle = grain; stainCtx.fillRect(0, 0, stain.width, stain.height);
    stainCtx.restore();
  }

  // Freshly uncovered sand is dark with water and dries back over DRY seconds.
  function paintWet() {
    wetCtx.fillStyle = '#fff'; wetCtx.fillRect(0, 0, width, height);
    // Overlapping wet patches take the wettest value rather than compounding.
    wetCtx.globalCompositeOperation = 'darken';
    for (const wave of history) {
      const w = Math.max(0, 1 - (clock - wave.peak) / DRY) ** 1.4;
      wetCtx.fillStyle = `rgb(${Math.round(255 - 40 * w)}, ${Math.round(255 - 48 * w)}, ${Math.round(255 - 62 * w)})`;
      region(wetCtx, wave.crest, wave.shore.dir); wetCtx.fill();
    }
    wetCtx.globalCompositeOperation = 'source-over';
    wetAt = clock; wetCount = history.length;
  }
  function seaNow(shore) { return mix(shore.from, shore.target, Math.min(1, (clock - shore.since) / 2.5)); }
  function turn(wave) {
    const seaLine = seaAt(wave.shore, wave.born + wave.up, new Float32Array(columns));
    wave.crest = frontAt(wave, wave.up, seaLine, new Float32Array(columns));
    wave.peak = wave.born + wave.up;
    stamp(wave); history.push(wave);
  }
  function launch(shore, aim) {
    const wave = makeWave(shore, clock, aim);
    frontAt(wave, 0, seaAt(shore, clock, shore.line), wave.front);
    waves.push(wave); launched++; shore.launched++;
    shore.from = seaNow(shore); shore.target = wave.color; shore.since = clock;
    if (!aim) shore.next = clock + between(5, 10);
    return wave;
  }
  function advance(dt) {
    clock += dt;
    for (const shore of shores) {
      if (clock >= shore.next) launch(shore);
      seaAt(shore, clock, shore.line);
    }
    for (const wave of waves) {
      const tau = clock - wave.born;
      if (!wave.crest && tau >= wave.up) turn(wave);
      frontAt(wave, tau, wave.shore.line, wave.front);
    }
    waves = waves.filter(w => clock - w.born < w.up + w.down);
    history = history.filter(w => clock - w.peak < DRY);
  }
  // Skip ahead: waves have come and gone from both shores, their dye is on
  // the sand and the last few patches are still drying.
  function fastForward(count) {
    for (let i = count; i > 0; i--) {
      const shore = shores[i % shores.length];
      const wave = makeWave(shore, clock - i * 3.5 - 4);
      launched++; shore.launched++; turn(wave);
      shore.from = shore.target = wave.color; shore.since = clock;
    }
    history = history.filter(w => clock - w.peak < DRY).sort((a, b) => a.peak - b.peak);
    // A still shore is a finished one: nothing is left damp on it.
    if (reducedMotion.matches) history = [];
  }
  function render() {
    ctx.drawImage(stain, 0, 0, width, height);
    if (history.length) {
      // Sand dries over half a minute, far slower than a frame, so the tint is
      // repainted a few times a second and blended in every frame.
      if (history.length !== wetCount || clock - wetAt >= 0.15 || clock < wetAt) paintWet();
      ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(wet, 0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.lineJoin = ctx.lineCap = 'round';
    for (const shore of shores) {
      const [h, sat, l] = seaNow(shore);
      ctx.fillStyle = css([h, sat * 0.78, l], 1, -9); region(ctx, shore.line, shore.dir); ctx.fill();
      ctx.beginPath(); trace(ctx, shore.line, 0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'; ctx.lineWidth = 2 * scale; ctx.stroke();
    }
    for (const wave of waves) {
      const tau = clock - wave.born, r = reachAt(wave, tau), dir = wave.shore.dir;
      // Thin water at the leading edge lets the sand show through; the sheet
      // thickens a few steps behind the front.
      ctx.fillStyle = css(wave.color, 0.14, -4);
      for (let k = 0; k < 3; k++) { region(ctx, wave.front, dir, k * 9 * scale); ctx.fill(); }
      const foam = tau < wave.up ? 1 - 0.5 * tau / wave.up : 0.5 * r;
      ctx.beginPath(); trace(ctx, wave.front, 0);
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.07 + 0.1 * foam).toFixed(3)})`; ctx.lineWidth = (3 + 8 * foam) * scale; ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.22 + 0.42 * foam).toFixed(3)})`; ctx.lineWidth = (1.1 + 3 * foam) * scale; ctx.stroke();
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
    waves = []; history = []; wetAt = -1; wetCount = -1;
    if (kept) { stainCtx.drawImage(kept, 0, 0, width, height); shores = shores.map(s => ({ ...s, line: new Float32Array(columns) })); }
    else {
      random = generator(seed);
      clock = 0; launched = 0; usedDyes = [];
      shores = [makeShore(1), makeShore(-1)];
      // Kept apart on the wheel, but off exact complements, which read loud.
      const hue = between(0, 360), apart = between(95, 150) * (random() < 0.5 ? -1 : 1);
      shores[0].hue = hue; shores[1].hue = (hue + apart + 360) % 360;
      for (const shore of shores) shore.from = shore.target = [shore.hue, 18, 60];
      sand();
      if (reducedMotion.matches) fastForward(30);
    }
    for (const shore of shores) seaAt(shore, clock, shore.line);
    render(); schedule();
  }
  function restart() { seed = freshSeed(); paused = false; fit(); }
  // A tap is answered by whichever shore is nearer, so the wave arrives from
  // the closest water and stops where it was asked to.
  function summon(aim) {
    const shore = aim ? shores.reduce((a, b) => Math.abs(aim.y - shoreAt(a, clock)) < Math.abs(aim.y - shoreAt(b, clock)) ? a : b)
      : shores[launched % shores.length];
    const wave = launch(shore, aim);
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
  canvas.addEventListener('click', event => summon({ x: event.clientX / width, y: event.clientY }));
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
