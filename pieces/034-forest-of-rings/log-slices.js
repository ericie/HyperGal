'use strict';

// All views sample this one 3D material field. X/Y cross the log; Z runs
// lengthwise. Each 1 cm slab shows its face nearest the core.
const RADIUS = 12;
const LENGTH = 60;
const RING_COUNT = 48;
const CUT_COUNT = RADIUS * 2;
const CUT_MS = 950;
const PALETTE = ['#f2dc8f', '#d0a248', '#c26736', '#8c2f37', '#215a4a', '#19382c'];
const BARK = [32, 43, 30];
const SCAR = [58, 28, 20];
const params = new URLSearchParams(location.search);
const debug = params.get('debug') === 'true';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const endCanvas = document.getElementById('end-grain');
const endCtx = endCanvas.getContext('2d');
const grid = document.getElementById('slices');
const depthInput = document.getElementById('depth');
const depthValue = document.getElementById('depth-value');
const playButton = document.getElementById('play');
const statusText = document.getElementById('status');
const cards = [];
let seed = params.get('seed') || Math.random().toString(36).slice(2, 10);
let log;
let endTexture;
let textures = [];
const frameCache = new Map();
const ANGLE_STEPS = 192;
let selected = 1;
let progress = 0.25;
let running = true;
let lastTime = 0;
let raf = 0;

function randomFor(value) {
  let state = 2166136261;
  for (const ch of value) state = Math.imul(state ^ ch.charCodeAt(0), 16777619);
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function buildLog(value) {
  const random = randomFor(value);
  const phase = random() * Math.PI * 2;
  const boundaries = [0];
  const colors = [];
  let lastColor = Math.floor(random() * PALETTE.length);
  let weather = 0;
  for (let year = 1; year <= RING_COUNT; year++) {
    weather = weather * 0.6 + (random() - 0.5) * 0.65;
    const growth = (1.2 - year / RING_COUNT * 0.35) * (1 + weather);
    boundaries.push(boundaries[year - 1] + growth);
    lastColor = (lastColor + 1 + Math.floor(random() * (PALETTE.length - 1))) % PALETTE.length;
    const hex = PALETTE[lastColor];
    colors.push([1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)));
  }
  const total = boundaries[RING_COUNT];
  const history = Array.from({ length: RING_COUNT }, (_, year) => ({
    lean: 0.5 * Math.sin(year * 0.09 + phase) + (random() - 0.5) * 0.18,
    ripple: random() * 0.22 + 0.08,
    phase: phase + year * 0.025,
  }));
  const scars = [
    { angle: phase + 0.7, year: 19 + Math.floor(random() * 7), width: 0.25,
      z: 0.12, length: 0.52, drift: 0.38 },
    { angle: phase + 3.2, year: 33 + Math.floor(random() * 6), width: 0.16,
      z: 0.66, length: 0.38, drift: -0.3 },
  ];
  const climate = {
    sunAngle: phase + 0.3,
    windFrom: phase + 2.4 + random() * 0.55,
    sunlight: 0.48 + random() * 0.16,
    windLoad: 0.32 + random() * 0.16,
  };
  // Strength changes between seasons; prevailing directions persist for life.
  for (let year = 0; year < RING_COUNT; year++) {
    history[year].sun = 0.85 + 0.12 * Math.sin(year * 0.16 + phase);
    history[year].wind = 0.78 + 0.18 * Math.sin(year * 0.11 - phase);
  }
  return { phase, boundaries: boundaries.map(v => v / total), colors, history, scars, climate };
} 

function angleGap(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }

function ringProfiles(frame) {
  const profiles = new Float32Array(ANGLE_STEPS * (RING_COUNT + 1));
  for (let a = 0; a < ANGLE_STEPS; a++) {
    const angle = a / ANGLE_STEPS * Math.PI * 2;
    const scarWeights = frame.scars.map(scar => {
      const gap = angleGap(angle, scar.angle);
      return { wound: Math.exp(-0.5 * (gap / scar.width) ** 2) * scar.strength,
        shoulder: Math.exp(-0.5 * ((Math.abs(gap) - scar.width * 1.8) / (scar.width * 0.7)) ** 2) * scar.strength };
    });
    const base = a * (RING_COUNT + 1);
    let sum = 0;
    for (let year = 0; year < RING_COUNT; year++) {
      const season = log.history[year];
      // The first eight rings are smooth. Later seasons add deformation
      // to the preceding ring, never reshape the already-grown interior.
      const maturity = Math.max(0, (year - 7) / (RING_COUNT - 8));
      let growth = 1 + maturity * (
        log.climate.sunlight * season.sun * Math.cos(angle - log.climate.sunAngle)
        + log.climate.windLoad * season.wind * Math.cos(angle - log.climate.windFrom - Math.PI)
        + season.lean * 0.15 * Math.cos(angle - log.phase - frame.t * 0.6)
        + season.ripple * 1.2 * Math.sin(angle * 3 + season.phase + frame.t)
        + 0.12 * Math.sin(angle * 7 - season.phase * 1.7 + frame.t * 2));
      for (let k = 0; k < frame.scars.length; k++) {
        const age = year - frame.scars[k].year;
        // Growth stalls at an injury; later layers build around its shoulders.
        const injury = age < 0 ? 0 : Math.exp(-0.5 * (age / 3.8) ** 2);
        const healing = age < 0 ? 0 : Math.exp(-0.5 * ((age - 5) / 5.5) ** 2);
        growth += -scarWeights[k].wound * injury * 0.95
          + scarWeights[k].shoulder * healing * 0.7;
      }
      sum += RADIUS * (log.boundaries[year + 1] - log.boundaries[year]) * Math.max(0.12, growth);
      profiles[base + year + 1] = sum;
    }
  }
  // Fit the completed log with one affine transform shared by every ring.
  // Per-angle normalization would force the bark smooth and imprint all
  // later injuries backward onto the core; never normalize individual rays.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let a = 0; a < ANGLE_STEPS; a++) {
    const angle = a / ANGLE_STEPS * Math.PI * 2;
    const outer = profiles[a * (RING_COUNT + 1) + RING_COUNT] / 0.985;
    const x = Math.cos(angle) * outer, y = Math.sin(angle) * outer;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  frame.profileScaleX = frame.radius * 1.96 / (maxX - minX);
  frame.profileScaleY = frame.radius * 1.96 / (maxY - minY);
  frame.pithX = -(minX + maxX) / 2 * frame.profileScaleX;
  frame.pithY = -(minY + maxY) / 2 * frame.profileScaleY;
  return profiles;
}

function logFrame(z) {
  if (frameCache.has(z)) return frameCache.get(z);
  const t = z / LENGTH;
  const frame = {
    t,
    x: RADIUS * 0.045 * Math.sin(Math.PI * t) * Math.cos(t * 2.1 + log.phase),
    y: -RADIUS * 0.012 * Math.sin(Math.PI * t) ** 2,
    radius: RADIUS * (1 - 0.02 * t),
    scars: log.scars.map(scar => ({ ...scar,
      angle: scar.angle + scar.drift * Math.sin(t * 3),
      strength: Math.exp(-0.5 * ((t - scar.z) / scar.length) ** 2),
    })),
  };
  frame.profiles = ringProfiles(frame);
  frameCache.set(z, frame);
  return frame;
}

function materialAt(x, y, frame) {
  const dx = (x - frame.x - frame.pithX) / frame.profileScaleX;
  const dy = (y - frame.y - frame.pithY) / frame.profileScaleY;
  const angle = Math.atan2(dy, dx);
  const radius = Math.hypot(dx, dy);
  const angularIndex = ((angle / (Math.PI * 2) + 1) % 1) * ANGLE_STEPS;
  const first = Math.floor(angularIndex), mix = angularIndex - first;
  const a = first * (RING_COUNT + 1), b = ((first + 1) % ANGLE_STEPS) * (RING_COUNT + 1);
  const boundary = year => frame.profiles[a + year] * (1 - mix) + frame.profiles[b + year] * mix;
  const woodEdge = boundary(RING_COUNT);
  if (radius > woodEdge / 0.985) return null;
  if (radius > woodEdge) return { ring: RING_COUNT, shade: 1, color: BARK };
  let low = 1, high = RING_COUNT;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (boundary(mid) < radius) low = mid + 1;
    else high = mid;
  }
  const inner = boundary(low - 1), outer = boundary(low);
  const position = (radius - inner) / (outer - inner);
  const age = low - 1 + position;
  for (const scar of frame.scars) {
    if (age < scar.year) continue;
    // The scar starts at the injury year and tapers into later growth only.
    const gap = angleGap(angle, scar.angle + 0.035 * Math.sin(age * 1.9 + frame.t * 8));
    const across = gap / (scar.width * 1.1 * scar.strength);
    const along = (age - scar.year - 3.2 * scar.strength) / (3.2 * scar.strength);
    const wound = across * across + along * along;
    if (wound < 1) return { ring: low - 1, shade: wound < 0.48 ? 0.55 : 1, color: SCAR };
  }
  return { ring: low - 1, shade: position > 0.88 ? 0.73 : 1, color: log.colors[low - 1] };
}

function raster(w, h, coordinate) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const context = canvas.getContext('2d');
  const pixels = context.createImageData(w, h);
  for (let row = 0; row < h; row++) {
    const sample = coordinate(row, h);
    const frame = logFrame(sample.z);
    for (let col = 0; col < w; col++) {
      const x = ((col + 0.5) / w * 2 - 1) * RADIUS;
      const material = materialAt(x, sample.y, frame);
      if (!material) continue;
      const i = (row * w + col) * 4;
      pixels.data[i] = material.color[0] * material.shade;
      pixels.data[i + 1] = material.color[1] * material.shade;
      pixels.data[i + 2] = material.color[2] * material.shade;
      pixels.data[i + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}

function makeTextures() {
  frameCache.clear();
  endTexture = raster(480, 480, (row, h) => ({ y: (1 - (row + 0.5) / h * 2) * RADIUS, z: 0 }));
  textures = Array.from({ length: CUT_COUNT }, (_, i) => {
    const nearSide = i < RADIUS;
    const topY = RADIUS - i;
    const bottomY = topY - 1;
    // View both halves from their core-facing cut surface. The far-side
    // slabs otherwise end with a tangent plane at -12 cm and an empty face.
    const faceY = nearSide ? bottomY : topY;
    return {
      face: raster(320, 480, (row, h) => ({ y: faceY, z: row / (h - 1) * LENGTH })),
      // Orient the exact 1 cm end-grain strip so its bottom edge meets
      // the displayed face, including after we cross the core.
      cap: raster(320, 28, (row, h) => ({
        y: nearSide ? topY - row / (h - 1) : bottomY + row / (h - 1), z: 0,
      })),
    };
  });
}

function drawEnd() {
  const size = endCanvas.width;
  const pad = size * 0.06;
  const span = size - pad * 2;
  endCtx.clearRect(0, 0, size, size);
  endCtx.drawImage(endTexture, pad, pad, span, span);
  const outerY = RADIUS - selected + 1;
  const innerY = RADIUS - selected;
  const top = pad + (RADIUS - outerY) / (RADIUS * 2) * span;
  const bottom = pad + (RADIUS - innerY) / (RADIUS * 2) * span;
  endCtx.save();
  endCtx.globalCompositeOperation = 'source-atop';
  endCtx.fillStyle = 'rgba(241,237,207,.5)';
  endCtx.fillRect(pad, top, span, bottom - top);
  endCtx.restore();
  endCtx.strokeStyle = '#f1edcf';
  endCtx.lineWidth = 5;
  for (const y of [top, bottom]) {
    endCtx.beginPath(); endCtx.moveTo(pad - 6, y); endCtx.lineTo(size - pad + 6, y); endCtx.stroke();
  }
  endCtx.strokeStyle = '#14251c'; endCtx.lineWidth = 2;
  for (const y of [top, bottom]) {
    endCtx.beginPath(); endCtx.moveTo(pad - 6, y); endCtx.lineTo(size - pad + 6, y); endCtx.stroke();
  }
  endCtx.fillStyle = '#14251c';
  const core = logFrame(0);
  endCtx.beginPath();
  endCtx.arc(size / 2 + (core.x + core.pithX) / (RADIUS * 2) * span,
    size / 2 - (core.y + core.pithY) / (RADIUS * 2) * span, 3, 0, Math.PI * 2);
  endCtx.fill();
  const displayAngle = angle => Math.atan2(Math.sin(angle) * core.profileScaleY,
    Math.cos(angle) * core.profileScaleX);
  const compass = angle => ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'][
    (Math.round(angle / (Math.PI / 4)) + 8) % 8];
  const sun = displayAngle(log.climate.sunAngle), wind = displayAngle(log.climate.windFrom);
  document.getElementById('sun-direction').textContent = `Sun · ${compass(sun)}`;
  document.getElementById('wind-direction').textContent = `Wind from ${compass(wind)}`;
  document.getElementById('sun-arrow').style.transform = `rotate(${-sun}rad)`;
  document.getElementById('wind-arrow').style.transform = `rotate(${-wind - Math.PI}rad)`;
  endCanvas.setAttribute('aria-label', `Top-down end grain with 48 rings. Sun toward ${compass(sun)}; wind from ${compass(wind)}. Selected 1 cm slab lies ${selected - 1} to ${selected} cm inward from the bark.`);
}

function drawCard(index) {
  const card = cards[index];
  const context = card.canvas.getContext('2d');
  const w = card.canvas.width, h = card.canvas.height;
  context.clearRect(0, 0, w, h);
  const amount = Math.max(0, Math.min(1, progress - index));
  const scale = h / card.canvas.getBoundingClientRect().height;
  const faceH = h - 38 * scale, faceW = faceH * RADIUS * 2 / LENGTH * 0.25;
  const x = (w - faceW) / 2, y = 30 * scale;
  if (amount > 0) {
    context.drawImage(textures[index].cap, x, 4 * scale, faceW, 16 * scale);
    context.save();
    context.beginPath(); context.rect(0, y, w, faceH * amount); context.clip();
    context.drawImage(textures[index].face, x, y, faceW, faceH);
    context.restore();
    if (amount < 1) {
      context.strokeStyle = '#14251c'; context.lineWidth = 1;
      context.beginPath(); context.moveTo(x, y + faceH * amount); context.lineTo(x + faceW, y + faceH * amount); context.stroke();
    }
  } else {
    context.strokeStyle = '#adbaaa'; context.setLineDash([2, 5]);
    context.beginPath(); context.moveTo(w / 2, y); context.lineTo(w / 2, y + faceH); context.stroke();
    context.setLineDash([]);
  }
  card.button.classList.toggle('pending', amount === 0);
  card.button.setAttribute('aria-pressed', String(selected === index + 1));
}

function render() {
  drawEnd();
  cards.forEach((_, i) => drawCard(i));
  depthInput.value = selected;
  depthValue.textContent = `${selected} cm`;
  playButton.textContent = running ? 'Pause cuts' : progress >= CUT_COUNT ? 'Replay cuts' : 'Resume cuts';
  const status = progress >= CUT_COUNT ? `All ${CUT_COUNT} slices shown, from bark through the core to the opposite bark.`
    : running ? `Cutting ${Math.ceil(progress)} of ${CUT_COUNT} · 1 cm per slice`
    : `Paused · ${Math.floor(progress)} of ${CUT_COUNT} cuts complete`;
  if (statusText.textContent !== status) statusText.textContent = status;
}

function stop() { running = false; cancelAnimationFrame(raf); raf = 0; }
function tick(now) {
  if (!running || document.hidden) return;
  const previous = Math.ceil(progress);
  progress = Math.min(CUT_COUNT, progress + Math.min(now - lastTime, 100) / CUT_MS);
  lastTime = now;
  selected = Math.max(1, Math.ceil(progress));
  if (progress >= CUT_COUNT) running = false;
  // Only the moving saw cut needs repainting within a slice.
  if (previous !== selected || !running) render();
  else drawCard(selected - 1);
  if (running) raf = requestAnimationFrame(tick);
}
function play() { running = true; lastTime = performance.now(); render(); raf = requestAnimationFrame(tick); }
function replay() { stop(); progress = reducedMotion.matches ? CUT_COUNT : 0.25; selected = 1; if (reducedMotion.matches) render(); else play(); }
function selectCut(cut) { stop(); selected = cut; progress = Math.max(progress, cut); render(); }
function showAll() { stop(); progress = CUT_COUNT; selected = CUT_COUNT; render(); }
function fit() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  for (const card of cards) {
    const rect = card.canvas.getBoundingClientRect();
    card.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    card.canvas.height = Math.max(1, Math.round(rect.height * dpr));
  }
  render();
}

function startDebug() {
for (let i = 1; i <= CUT_COUNT; i++) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'slice';
  button.setAttribute('aria-label', `Slice ${i}: ${i - 1} to ${i} cm from bark${i === RADIUS ? ', reaches the log midplane' : i === CUT_COUNT ? ', opposite bark' : ''}`);
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const caption = document.createElement('span'); caption.className = 'slice-caption';
  const number = document.createElement('span'); number.textContent = String(i).padStart(2, '0');
  const depth = document.createElement('span'); depth.textContent = i === RADIUS ? `${i} cm · mid` : i === CUT_COUNT ? `${i} cm · bark` : `${i} cm`;
  caption.append(number, depth); button.append(canvas, caption); grid.append(button);
  cards.push({ button, canvas });
  button.addEventListener('click', () => selectCut(i));
}
depthInput.addEventListener('input', () => selectCut(Number(depthInput.value)));
playButton.addEventListener('click', () => { if (running) { stop(); render(); } else if (progress >= CUT_COUNT) replay(); else play(); });
document.getElementById('show-all').addEventListener('click', showAll);
document.getElementById('new-log').addEventListener('click', () => {
  stop(); seed = Math.random().toString(36).slice(2, 10);
  history.replaceState(null, '', `${location.pathname}?debug=true&seed=${seed}`);
  log = buildLog(seed); makeTextures(); replay();
});
addEventListener('resize', fit);
document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else if (running) { lastTime = performance.now(); raf = requestAnimationFrame(tick); } });
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) showAll(); });

log = buildLog(seed);
makeTextures();
const requestedCut = Number(params.get('cut'));
if (reducedMotion.matches || params.get('all') === '1') { progress = CUT_COUNT; selected = CUT_COUNT; running = false; }
else if (Number.isInteger(requestedCut) && requestedCut >= 1 && requestedCut <= CUT_COUNT) { progress = requestedCut; selected = requestedCut; running = false; }
fit();
if (running) play();

}

// The public view presents finished faces; the diagnostic study retains
// the cutting animation, caps, ring diagram, and controls at ?debug=true.
const SLIDE_MS = 1200;
let slideIndex = 0;
let slideElapsed = 0;
let slideRunning = !reducedMotion.matches;
let slideFrame = 0;
let slideLastTime = 0;
const presentation = document.getElementById('presentation');

function drawPresentation() {
  const context = presentation.getContext('2d');
  const w = presentation.width, h = presentation.height;
  context.fillStyle = '#dbe6db';
  context.fillRect(0, 0, w, h);
  // Keep the same quarter-width proportions as the study, now full height.
  const width = h * RADIUS * 2 / LENGTH * 0.25;
  context.drawImage(textures[slideIndex].face, (w - width) / 2, 0, width, h);
  presentation.setAttribute('aria-label', `Wood slice ${slideIndex + 1} of ${CUT_COUNT}. ${slideRunning ? 'Playing' : 'Paused'}. Click or press Space to ${slideRunning ? 'pause' : 'play'}; use arrow keys to browse.`);
}

function fitPresentation() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  presentation.width = Math.max(1, Math.round(innerWidth * dpr));
  presentation.height = Math.max(1, Math.round(innerHeight * dpr));
  drawPresentation();
}

function advanceSlides(elapsed) {
  slideElapsed += elapsed;
  const steps = Math.floor(slideElapsed / SLIDE_MS);
  if (steps) {
    slideIndex = (slideIndex + steps) % CUT_COUNT;
    slideElapsed %= SLIDE_MS;
    drawPresentation();
  }
}

function presentationTick(now) {
  if (!slideRunning || document.hidden) return;
  advanceSlides(Math.max(0, now - slideLastTime));
  slideLastTime = now;
  slideFrame = requestAnimationFrame(presentationTick);
}

function setPresentationRunning(value) {
  cancelAnimationFrame(slideFrame);
  slideRunning = value;
  slideLastTime = performance.now();
  drawPresentation();
  if (value && !document.hidden) slideFrame = requestAnimationFrame(presentationTick);
}

function startPresentation() {
  log = buildLog(seed);
  makeTextures();
  const cut = Number(params.get('cut'));
  slideIndex = Number.isInteger(cut) && cut >= 1 && cut <= CUT_COUNT ? cut - 1 : 0;
  fitPresentation();
  presentation.addEventListener('click', () => setPresentationRunning(!slideRunning));
  presentation.addEventListener('keydown', event => {
    if (event.code === 'Space') {
      event.preventDefault(); setPresentationRunning(!slideRunning);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); setPresentationRunning(false);
      slideIndex = (slideIndex + (event.key === 'ArrowRight' ? 1 : CUT_COUNT - 1)) % CUT_COUNT;
      slideElapsed = 0; drawPresentation();
    }
  });
  addEventListener('resize', fitPresentation);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(slideFrame);
    if (!document.hidden && slideRunning) {
      slideLastTime = performance.now();
      slideFrame = requestAnimationFrame(presentationTick);
    }
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) setPresentationRunning(false);
  });
  setPresentationRunning(slideRunning);
}

if (debug) startDebug();
else startPresentation();
