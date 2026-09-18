'use strict';

// All views sample this one 3D material field. X/Y cross the log; Z runs
// lengthwise. Each 0.125 cm slab shows its face nearest the core.
const RADIUS = 12;
const LENGTH = 60;
const RING_COUNT = 200;
const SLICE_THICKNESS = 0.125;
const CUT_COUNT = RADIUS * 2 / SLICE_THICKNESS;
const CUT_MS = 950 / 8;
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
const ANGLE_STEPS = 320;
let selected = 1;
let progress = 0.25;
let running = true;
let lastTime = 0;
let raf = 0;

function buildLog(value) {
  const reference = GrowthRingsModel.create(value, params.get('palette') || 'hokusai');
  const profiles = new Float32Array(ANGLE_STEPS * (RING_COUNT + 1));
  const bark = new Float32Array(ANGLE_STEPS);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let a = 0; a < ANGLE_STEPS; a++) {
    const angle = a / ANGLE_STEPS * Math.PI * 2;
    let previous = 0;
    for (let year = 0; year <= RING_COUNT; year++) {
      // The source's contour smoothing can create tiny local overlaps. Clamp
      // those for unambiguous volumetric sampling without changing the silhouette.
      previous = Math.max(previous + 0.00001, reference.boundaries[year][a] * RADIUS);
      profiles[a * (RING_COUNT + 1) + year] = previous;
    }
    const texture = 0.72 + 0.18 * Math.sin(angle * 7 + reference.salt * 0.013)
      + 0.1 * Math.sin(angle * 17 - reference.salt * 0.021);
    bark[a] = previous + RADIUS * 0.05 * texture;
    const x = Math.cos(angle) * bark[a], y = Math.sin(angle) * bark[a];
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const scale = RADIUS * 2 / (maxY - minY);
  const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
  const worldWidth = (maxX - minX) * scale;
  return { reference, profiles, bark, scale, centerX, centerY, worldWidth,
    colors: reference.colors, phase: reference.forces.temperaturePhase,
    climate: { sunAngle: -reference.forces.sunAngle, windFrom: -reference.forces.windFrom } };
}

function logFrame(z) {
  if (frameCache.has(z)) return frameCache.get(z);
  const t = z / LENGTH;
  const frame = {
    t,
    x: RADIUS * 0.025 * Math.sin(Math.PI * t) * Math.cos(t * 2.1 + log.phase),
    y: -RADIUS * 0.004 * Math.sin(Math.PI * t) ** 2,
    scale: log.scale * (1 - 0.008 * t),
    twist: Math.sin(Math.PI * t) * 0.025,
  };
  frameCache.set(z, frame);
  return frame;
}

function materialAt(x, y, frame) {
  // 015 uses screen-space Y down. Invert here so its orientation and forces
  // match the reference when viewed through our Y-up volume coordinates.
  const dx = (x - frame.x) / frame.scale + log.centerX;
  const dy = -(y - frame.y) / frame.scale + log.centerY;
  const angle = Math.atan2(dy, dx) + frame.twist;
  const radius = Math.hypot(dx, dy);
  const angularIndex = ((angle / (Math.PI * 2) + 1) % 1) * ANGLE_STEPS;
  const first = Math.floor(angularIndex), next = (first + 1) % ANGLE_STEPS;
  const mix = angularIndex - first;
  const a = first * (RING_COUNT + 1), b = next * (RING_COUNT + 1);
  const boundary = year => log.profiles[a + year] * (1 - mix) + log.profiles[b + year] * mix;
  const barkEdge = log.bark[first] * (1 - mix) + log.bark[next] * mix;
  if (radius > barkEdge) return null;
  const woodEdge = boundary(RING_COUNT);
  if (radius > woodEdge) {
    const position = (radius - woodEdge) / (barkEdge - woodEdge);
    return { ring: RING_COUNT + 1, shade: 1,
      color: position > 0.67 && position < 0.73 ? log.reference.scene.paperRgb : log.reference.scene.inkRgb };
  }
  if (radius < boundary(0)) return { ring: 0, shade: 1, color: [255, 247, 227] };
  let low = 1, high = RING_COUNT;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (boundary(mid) < radius) low = mid + 1;
    else high = mid;
  }
  const inner = boundary(low - 1), outer = boundary(low);
  const position = (radius - inner) / (outer - inner);
  const shade = position > 0.92 && low % 5 === 0 ? (low % 25 === 0 ? 0.55 : 0.8) : 1;
  return { ring: low, shade, color: log.colors[low] };
}

function applyPalette() {
  const scene = log.reference.scene;
  document.documentElement.style.setProperty('--field', scene.paper);
  document.documentElement.style.setProperty('--paper', scene.paper);
  document.documentElement.style.setProperty('--ink', scene.ink);
}

function slicePlane(index) {
  const top = RADIUS - index * SLICE_THICKNESS;
  const bottom = top - SLICE_THICKNESS;
  return { top, bottom, face: index < CUT_COUNT / 2 ? bottom : top };
}

function depthLabel(cut) { return `${Number((cut * SLICE_THICKNESS).toFixed(3))} cm`; }

function raster(w, h, coordinate, xMin = -RADIUS, xMax = RADIUS) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const context = canvas.getContext('2d');
  const pixels = context.createImageData(w, h);
  for (let row = 0; row < h; row++) {
    const sample = coordinate(row, h);
    const frame = logFrame(sample.z);
    for (let col = 0; col < w; col++) {
      const x = xMin + (col + 0.5) / w * (xMax - xMin);
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

let sharedXMin = -RADIUS, sharedXMax = RADIUS;
let widestSliceWidth = RADIUS * 2;
function makeTextures() {
  frameCache.clear();
  const margin = RADIUS * 0.05;
  sharedXMin = -log.worldWidth / 2 - margin;
  sharedXMax = log.worldWidth / 2 + margin;
  // Use one physical X range for every slice, computed from the whole log.
  textures = Array.from({ length: CUT_COUNT }, (_, i) => {
    const plane = slicePlane(i);
    return {
      face: raster(320, 480, (row, h) => ({ y: plane.face, z: row / (h - 1) * LENGTH }), sharedXMin, sharedXMax),
      cap: raster(320, 28, (row, h) => ({
        y: i < CUT_COUNT / 2 ? plane.top - row / (h - 1) * SLICE_THICKNESS
          : plane.bottom + row / (h - 1) * SLICE_THICKNESS, z: 0,
      }), sharedXMin, sharedXMax),
    };
  });
  let left = 320, right = -1, widest = 0;
  for (const texture of textures) {
    const { face } = texture;
    let sliceLeft = 320, sliceRight = -1;
    const pixels = face.getContext('2d').getImageData(0, 0, 320, 480).data;
    for (let row = 0; row < 480; row++) for (let col = 0; col < 320; col++) {
      if (pixels[(row * 320 + col) * 4 + 3]) {
        sliceLeft = Math.min(sliceLeft, col); sliceRight = Math.max(sliceRight, col);
      }
    }
    left = Math.min(left, sliceLeft); right = Math.max(right, sliceRight);
    texture.widthFraction = Math.max(0, sliceRight - sliceLeft + 1) / 320;
    widest = Math.max(widest, sliceRight - sliceLeft + 1);
  }
  const range = sharedXMax - sharedXMin;
  widestSliceWidth = widest / 320 * range;
  const origin = sharedXMin;
  sharedXMin = origin + left / 320 * range;
  sharedXMax = origin + (right + 1) / 320 * range;
  // The end-grain camera uses the same physical scale on both axes.
  const extent = Math.max(log.worldWidth, RADIUS * 2) * 0.53;
  endTexture = raster(900, 900, (row, h) => ({ y: (1 - (row + 0.5) / h * 2) * extent, z: 0 }), -extent, extent);
  endTexture.worldExtent = extent;
}

function drawEnd() {
  const size = endCanvas.width;
  const pad = size * 0.06;
  const span = size - pad * 2;
  endCtx.clearRect(0, 0, size, size);
  endCtx.drawImage(endTexture, pad, pad, span, span);
  const plane = slicePlane(selected - 1);
  const extent = endTexture.worldExtent;
  const top = pad + (extent - plane.top) / (extent * 2) * span;
  const bottom = pad + (extent - plane.bottom) / (extent * 2) * span;
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
  endCtx.arc(size / 2 + (core.x - log.centerX * core.scale) / (extent * 2) * span,
    size / 2 - (core.y + log.centerY * core.scale) / (extent * 2) * span, 3, 0, Math.PI * 2);
  endCtx.fill();
  const displayAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
  const compass = angle => ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'][
    (Math.round(angle / (Math.PI / 4)) + 8) % 8];
  const sun = displayAngle(log.climate.sunAngle), wind = displayAngle(log.climate.windFrom);
  document.getElementById('sun-direction').textContent = `Sun · ${compass(sun)}`;
  document.getElementById('wind-direction').textContent = `Wind from ${compass(wind)}`;
  document.getElementById('sun-arrow').style.transform = `rotate(${-sun}rad)`;
  document.getElementById('wind-arrow').style.transform = `rotate(${-wind - Math.PI}rad)`;
  endCanvas.setAttribute('aria-label', `Top-down end grain with ${RING_COUNT} rings. Sun toward ${compass(sun)}; wind from ${compass(wind)}. Selected ${SLICE_THICKNESS} cm slab lies ${depthLabel(selected - 1)} to ${depthLabel(selected)} inward from the bark.`);
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
  depthValue.textContent = depthLabel(selected);
  playButton.textContent = running ? 'Pause cuts' : progress >= CUT_COUNT ? 'Replay cuts' : 'Resume cuts';
  const status = progress >= CUT_COUNT ? `All ${CUT_COUNT} slices shown, from bark through the core to the opposite bark.`
    : running ? `Cutting ${Math.ceil(progress)} of ${CUT_COUNT} · ${SLICE_THICKNESS} cm per slice`
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
    button.setAttribute('aria-label', `Slice ${i}: ${depthLabel(i - 1)} to ${depthLabel(i)} from bark${i === CUT_COUNT / 2 ? ', reaches the log midplane' : i === CUT_COUNT ? ', opposite bark' : ''}`);
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    const caption = document.createElement('span'); caption.className = 'slice-caption';
    const number = document.createElement('span'); number.textContent = String(i).padStart(2, '0');
    const depth = document.createElement('span'); depth.textContent = i === CUT_COUNT / 2 ? `${depthLabel(i)} · mid` : i === CUT_COUNT ? `${depthLabel(i)} · bark` : depthLabel(i);
    caption.append(number, depth); button.append(canvas, caption); grid.append(button);
    cards.push({ button, canvas });
    button.addEventListener('click', () => selectCut(i));
  }
  depthInput.addEventListener('input', () => selectCut(Number(depthInput.value)));
  playButton.addEventListener('click', () => { if (running) { stop(); render(); } else if (progress >= CUT_COUNT) replay(); else play(); });
  document.getElementById('show-all').addEventListener('click', showAll);
  document.getElementById('new-log').addEventListener('click', () => {
    stop(); seed = Math.random().toString(36).slice(2, 10);
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('debug', 'true'); nextParams.set('seed', seed);
    nextParams.delete('cut'); nextParams.delete('all');
    history.replaceState(null, '', `${location.pathname}?${nextParams}`);
    log = buildLog(seed); applyPalette(); makeTextures(); replay();
  });
  addEventListener('resize', fit);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else if (running) { lastTime = performance.now(); raf = requestAnimationFrame(tick); } });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) showAll(); });

  log = buildLog(seed);
  applyPalette();
  makeTextures();
  const requestedCut = Number(params.get('cut'));
  if (reducedMotion.matches || params.get('all') === '1') { progress = CUT_COUNT; selected = CUT_COUNT; running = false; }
  else if (Number.isInteger(requestedCut) && requestedCut >= 1 && requestedCut <= CUT_COUNT) { progress = requestedCut; selected = requestedCut; running = false; }
  fit();
  if (running) play();

}

// The public view presents finished faces; the diagnostic study retains
// the cutting animation, caps, ring diagram, and controls at ?debug=true.
const SLIDE_MS = 150;
let slideIndex = 0;
let slideElapsed = 0;
let slideRunning = !reducedMotion.matches;
let slideFrame = 0;
let slideLastTime = 0;
const presentation = document.getElementById('presentation');
const presentationFaces = new Map();

function presentationFraming() {
  // One scale in both axes preserves the modeled wood's proportions. Keep
  // the established width and crop the long log instead of squashing its height.
  const scale = presentation.width * 0.9 / widestSliceWidth;
  const visibleLength = Math.min(LENGTH, presentation.height / scale);
  return {
    scale,
    width: (sharedXMax - sharedXMin) * scale,
    height: visibleLength * scale,
    zMin: 0,
    zMax: visibleLength,
  };
}

function presentationFace(index) {
  if (presentationFaces.has(index)) return presentationFaces.get(index);
  // Every frame uses the same coordinates and scale: no per-slice zoom.
  const faceY = slicePlane(index).face;
  const view = presentationFraming();
  const face = raster(Math.min(1280, Math.max(640, Math.round(view.width))),
    720, (row, height) => ({ y: faceY, z: view.zMin + row / (height - 1) * (view.zMax - view.zMin) }), sharedXMin, sharedXMax);
  presentationFaces.set(index, face);
  if (presentationFaces.size > 3) presentationFaces.delete(presentationFaces.keys().next().value);
  return face;
}

function drawPresentation() {
  const context = presentation.getContext('2d');
  const w = presentation.width, h = presentation.height;
  context.fillStyle = log.reference.scene.paper;
  context.fillRect(0, 0, w, h);
  // One physical scale for the whole sequence: only the widest face reaches 90%.
  const view = presentationFraming();
  context.drawImage(presentationFace(slideIndex), (w - view.width) / 2,
    (h - view.height) / 2, view.width, view.height);
  presentation.setAttribute('aria-label', `Wood slice ${slideIndex + 1} of ${CUT_COUNT}. ${slideRunning ? 'Playing' : 'Paused'}. Click or press Space to ${slideRunning ? 'pause' : 'play'}; use arrow keys to browse.`);
}

function fitPresentation() {
  presentationFaces.clear();
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
  applyPalette();
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
