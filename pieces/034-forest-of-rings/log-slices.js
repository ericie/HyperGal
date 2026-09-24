'use strict';

// All views sample this one 3D material field. X/Y cross the log; Z runs
// lengthwise. Each 0.125 cm slab shows its face nearest the core.
const RADIUS = 12;
const LENGTH = 60;
const RING_COUNT = 200;
const SLICE_THICKNESS = 0.125;
const CUT_COUNT = RADIUS * 2 / SLICE_THICKNESS;
const CUT_MS = 950 / 8;
// Each ring opens pale and porous in spring and closes dense and dark in late
// summer. The step at the closing boundary is what the eye reads as grain.
const LATEWOOD_DEPTH = 0.42;
const LATEWOOD_FALLOFF = 3;
const params = new URLSearchParams(location.search);
const debug = params.get('debug') === 'true';
// The saw enters on a bias, so every cut climbs through the rings as it runs
// down the log instead of lying parallel to them. That crossing is what opens
// flat stripes into cathedral grain. Stored as cm of depth gained per cm of
// length; the panel works in the equivalent angle, which is what the eye reads.
// Steeper closes the arches into squat concentric ovals, shallower stretches
// them until the face is nearly straight grain again.
const DEFAULT_ANGLE = 1.1;
const degreesToTilt = degrees => Math.tan(degrees * Math.PI / 180);
const tiltToDegrees = tilt => Math.atan(tilt) * 180 / Math.PI;
let cutTilt = Number(params.get('tilt') ?? degreesToTilt(DEFAULT_ANGLE));
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

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const TAU = Math.PI * 2;
const toLinear = c => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const toSrgb = c => Math.round(255 * clamp(c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055, 0, 1));

// Ring colour is mixed in OKLCh rather than RGB. Straight RGB blending drains
// the chroma out of every step between a warm swatch and a cool one, which
// turned the whole midsection of the log grey. Polar blending holds the
// chroma up and swings the hue the short way round — here through red and
// magenta rather than through green — so the wood stays wood the whole way.
function srgbToOklch(rgb) {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return { L, C: Math.hypot(A, B), H: Math.atan2(B, A) };
}

function oklchToSrgb({ L, C, H }) {
  const A = Math.cos(H) * C, B = Math.sin(H) * C;
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3;
  return [
    toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ];
}

// Order the palette light to dark and space the stops by lightness, so the
// heart-to-bark fade reads as one even gradient rather than five equal bands.
function heartToBarkStops(swatches) {
  const sorted = swatches.map(entry => srgbToOklch(entry.slice(0, 3))).sort((a, b) => b.L - a.L);
  const lightest = sorted[0].L;
  const span = lightest - sorted[sorted.length - 1].L || 1;
  return sorted.map(stop => ({ ...stop, at: (lightest - stop.L) / span }));
}

function sampleRamp(stops, t, lift = 0) {
  const depth = clamp(t, 0, 1);
  let i = 1;
  while (i < stops.length - 1 && stops[i].at < depth) i++;
  const inner = stops[i - 1], outer = stops[i];
  const mix = outer.at === inner.at ? 0 : (depth - inner.at) / (outer.at - inner.at);
  // Take the short way around the hue circle so the blend never crosses grey.
  let turn = (outer.H - inner.H) % TAU;
  if (turn > Math.PI) turn -= TAU; else if (turn < -Math.PI) turn += TAU;
  return oklchToSrgb({
    L: clamp(inner.L + (outer.L - inner.L) * mix + lift, 0, 1),
    C: inner.C + (outer.C - inner.C) * mix,
    H: inner.H + turn * mix,
  });
}

// Ring colour follows distance from the pith, not the reference model's random
// palette index, so the log fades continuously from pale heartwood to dark
// bark. Ring width still modulates it: a wide ring is an easy year and stays a
// little brighter, a narrow one darkens.
function ringColors(reference, radiusSum) {
  const stops = heartToBarkStops(reference.swatches);
  const outermost = radiusSum[RING_COUNT] || 1;
  const widths = reference.rings.map(ring => ring.meanWidth).slice(1).sort((a, b) => a - b);
  const median = widths[widths.length >> 1] || 1;
  return reference.rings.map((ring, year) => sampleRamp(stops,
    year === 0 ? 0 : radiusSum[year] / outermost,
    0.05 * (clamp(ring.meanWidth / median, 0.5, 1.6) - 1)));
}

function cutY(face, z, center) { return face + cutTilt * (z - center); }

function buildLog(value) {
  const reference = GrowthRingsModel.create(value, params.get('palette') || 'hokusai');
  const profiles = new Float32Array(ANGLE_STEPS * (RING_COUNT + 1));
  const bark = new Float32Array(ANGLE_STEPS);
  const radiusSum = new Float64Array(RING_COUNT + 1);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let a = 0; a < ANGLE_STEPS; a++) {
    const angle = a / ANGLE_STEPS * Math.PI * 2;
    let previous = 0;
    for (let year = 0; year <= RING_COUNT; year++) {
      // The source's contour smoothing can create tiny local overlaps. Clamp
      // those for unambiguous volumetric sampling without changing the silhouette.
      previous = Math.max(previous + 0.00001, reference.boundaries[year][a] * RADIUS);
      profiles[a * (RING_COUNT + 1) + year] = previous;
      radiusSum[year] += previous;
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
    colors: ringColors(reference, radiusSum), phase: reference.forces.temperaturePhase,
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

// materialAt runs a few million times per frame once the face is supersampled,
// so it reports its hit through these instead of allocating a result object and
// a boundary closure on every sample. That garbage, not the arithmetic, was the
// bulk of the cost.
const PITH_COLOR = [255, 247, 227];
let sampleR = 0, sampleG = 0, sampleB = 0;
let ringHint = 1;
let profiles = null, ringColorTable = null, barkProfile = null, inkRgb = null, paperRgb = null;

function bindSampler() {
  profiles = log.profiles;
  ringColorTable = log.colors;
  barkProfile = log.bark;
  inkRgb = log.reference.scene.inkRgb;
  paperRgb = log.reference.scene.paperRgb;
}

function emit(color, shade) {
  sampleR = color[0] * shade; sampleG = color[1] * shade; sampleB = color[2] * shade;
  return true;
}

function materialAt(x, y, frame) {
  // 015 uses screen-space Y down. Invert here so its orientation and forces
  // match the reference when viewed through our Y-up volume coordinates.
  const dx = (x - frame.x) / frame.scale + log.centerX;
  const dy = -(y - frame.y) / frame.scale + log.centerY;
  const angle = Math.atan2(dy, dx) + frame.twist;
  const radius = Math.sqrt(dx * dx + dy * dy);
  const angularIndex = ((angle / TAU + 1) % 1) * ANGLE_STEPS;
  const first = Math.floor(angularIndex), next = (first + 1) % ANGLE_STEPS;
  const mix = angularIndex - first, keep = 1 - mix;
  const a = first * (RING_COUNT + 1), b = next * (RING_COUNT + 1);
  const barkEdge = barkProfile[first] * keep + barkProfile[next] * mix;
  if (radius > barkEdge) return false;
  const woodEdge = profiles[a + RING_COUNT] * keep + profiles[b + RING_COUNT] * mix;
  if (radius > woodEdge) {
    const position = (radius - woodEdge) / (barkEdge - woodEdge);
    return emit(position > 0.67 && position < 0.73 ? paperRgb : inkRgb, 1);
  }
  if (radius < profiles[a] * keep + profiles[b] * mix) return emit(PITH_COLOR, 1);
  // Neighbouring samples almost always land in the same ring or the next one
  // over, so walk from the last hit instead of binary searching 200 rings from
  // scratch. Boundaries increase strictly with ring index, so only one of these
  // loops ever runs and it lands on the same ring the search would have.
  let low = ringHint;
  if (low < 1) low = 1; else if (low > RING_COUNT) low = RING_COUNT;
  while (low > 1 && profiles[a + low - 1] * keep + profiles[b + low - 1] * mix >= radius) low--;
  while (low < RING_COUNT && profiles[a + low] * keep + profiles[b + low] * mix < radius) low++;
  ringHint = low;
  const inner = profiles[a + low - 1] * keep + profiles[b + low - 1] * mix;
  const outer = profiles[a + low] * keep + profiles[b + low] * mix;
  const position = (radius - inner) / (outer - inner);
  return emit(ringColorTable[low], 1 - LATEWOOD_DEPTH * position ** LATEWOOD_FALLOFF);
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

function raster(w, h, coordinate, xMin = -RADIUS, xMax = RADIUS, samples = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const context = canvas.getContext('2d');
  const pixels = context.createImageData(w, h);
  if (samples <= 1) {
    for (let row = 0; row < h; row++) {
      const sample = coordinate(row, h);
      const frame = logFrame(sample.z);
      for (let col = 0; col < w; col++) {
        const x = xMin + (col + 0.5) / w * (xMax - xMin);
        if (!materialAt(x, sample.y, frame)) continue;
        const i = (row * w + col) * 4;
        pixels.data[i] = sampleR;
        pixels.data[i + 1] = sampleG;
        pixels.data[i + 2] = sampleB;
        pixels.data[i + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
    return canvas;
  }
  const span = xMax - xMin;
  const step = 1 / samples;
  const accumulator = new Float32Array(w * 4);
  for (let row = 0; row < h; row++) {
    accumulator.fill(0);
    {
      const sample = coordinate(row, h);
      const frame = logFrame(sample.z);
      for (let col = 0; col < w; col++) {
        for (let sx = 0; sx < samples; sx++) {
          const x = xMin + (col + (sx + 0.5) * step) / w * span;
          if (!materialAt(x, sample.y, frame)) continue;
          const a = col * 4;
          accumulator[a] += sampleR;
          accumulator[a + 1] += sampleG;
          accumulator[a + 2] += sampleB;
          accumulator[a + 3] += 255;
        }
      }
    }
    for (let col = 0; col < w; col++) {
      const a = col * 4, i = (row * w + col) * 4;
      const cover = accumulator[a + 3];
      if (!cover) continue;
      // Weight colour by coverage so partly-empty edge pixels keep their hue
      // instead of being dragged toward black by the misses.
      const hits = cover / 255;
      pixels.data[i] = accumulator[a] / hits;
      pixels.data[i + 1] = accumulator[a + 1] / hits;
      pixels.data[i + 2] = accumulator[a + 2] / hits;
      pixels.data[i + 3] = cover / samples;
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
      face: raster(320, 480, (row, h) => {
        const z = row / (h - 1) * LENGTH;
        return { y: cutY(plane.face, z, LENGTH / 2), z };
      }, sharedXMin, sharedXMax),
      // The cap is the slab's end grain at z = 0, where the bias cut sits
      // half a log-length shallower than its nominal depth.
      cap: raster(320, 28, (row, h) => ({
        y: cutY(i < CUT_COUNT / 2 ? plane.top - row / (h - 1) * SLICE_THICKNESS
          : plane.bottom + row / (h - 1) * SLICE_THICKNESS, 0, LENGTH / 2), z: 0,
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
    log = buildLog(seed); bindSampler(); applyPalette(); makeTextures(); replay();
  });
  addEventListener('resize', fit);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else if (running) { lastTime = performance.now(); raf = requestAnimationFrame(tick); } });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) showAll(); });

  log = buildLog(seed);
  bindSampler();
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
// One sample per pixel aliases badly at shallow cut angles: the rings run
// almost vertically at roughly a pixel wide, so each column flickers between
// neighbouring rings and the face fills with broken vertical dashes. Extra
// samples across x average those rings together and the grain goes continuous.
// The aliasing is horizontal only — even at the steepest cut the face moves
// less than a ring per row — so samples buy nothing spent on the other axis.
// They cost linearly, so the tier follows what the piece is doing: a settled
// frame earns the expensive one, a moving one does not.
const QUALITY = [
  { scale: 0.45, samples: 1 },  // 0 · the angle is being dragged
  { scale: 1, samples: 2 },     // 1 · playing, inside the 150 ms slide budget
  { scale: 1, samples: 4 },     // 2 · settled, and worth the full cost
];
const REFINE_MS = 350;
let qualityLevel = 1;
let refineTimer = 0;

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
  const cached = presentationFaces.get(index);
  // A coarser cut stands in until something better is warranted; a finer one
  // already on hand is always good enough.
  if (cached && cached.level >= qualityLevel) return cached;
  // Every frame uses the same coordinates and scale: no per-slice zoom.
  const faceY = slicePlane(index).face;
  const view = presentationFraming();
  // Bias the cut around the middle of what is on screen, so the stated depth
  // is true at frame centre and the arches open symmetrically above and below.
  const center = (view.zMin + view.zMax) / 2;
  const tier = QUALITY[qualityLevel];
  const face = raster(
    Math.round(Math.min(1280, Math.max(640, Math.round(view.width))) * tier.scale),
    Math.round(720 * tier.scale), (row, height) => {
      const z = view.zMin + row / (height - 1) * (view.zMax - view.zMin);
      return { y: cutY(faceY, z, center), z };
    }, sharedXMin, sharedXMax, tier.samples);
  face.level = qualityLevel;
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
  scheduleRefine();
}

// Playing re-arms this every 150 ms so it never fires; a frame that stays put
// gets cut again at the finest tier.
function scheduleRefine() {
  if (qualityLevel >= QUALITY.length - 1) return;
  clearTimeout(refineTimer);
  refineTimer = setTimeout(() => {
    qualityLevel = QUALITY.length - 1;
    drawPresentation();
  }, REFINE_MS);
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
  // Playing cannot afford the finest cut at 150 ms a slide; drop back a tier.
  if (value) qualityLevel = 1;
  slideRunning = value;
  slideLastTime = performance.now();
  drawPresentation();
  if (value && !document.hidden) slideFrame = requestAnimationFrame(presentationTick);
}

// Cut-angle panel. Re-cutting the visible face is cheap, but the shared framing
// numbers come from makeTextures and are not recomputed here: across the whole
// slider range the widest slice moves by about three pixels in twelve hundred,
// so the frame holds still while the grain changes, which is what you want when
// judging the angle.
const controls = document.getElementById('grain-controls');
const tiltInput = document.getElementById('tilt');
const tiltReadout = document.getElementById('tilt-value');
let idleTimer = 0;
let panelHidden = false;
let queuedTilt = null;
let tiltFrame = 0;

function showPanel() {
  if (panelHidden) return;
  controls.dataset.idle = 'false';
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    // Never fade out from under a thumb that is still on the control.
    if (controls.contains(document.activeElement) || controls.matches(':hover')) showPanel();
    else controls.dataset.idle = 'true';
  }, 2800);
}

function applyTilt(value, draft) {
  cutTilt = value;
  qualityLevel = draft ? 0 : 1;
  presentationFaces.clear();
  tiltReadout.textContent = `${tiltToDegrees(value).toFixed(1)}\u00b0`;
  // drawPresentation arms the refine timer, so a drag that ends without a
  // change event still recovers the sharp cut on its own.
  drawPresentation();
}

// Coalesce to one cut per frame; input events outrun a 70 ms raster otherwise.
function queueTilt(value, draft) {
  queuedTilt = { value, draft };
  if (tiltFrame) return;
  tiltFrame = requestAnimationFrame(() => {
    tiltFrame = 0;
    const next = queuedTilt;
    queuedTilt = null;
    applyTilt(next.value, next.draft);
  });
}

function startPanel() {
  tiltInput.value = tiltToDegrees(cutTilt).toFixed(1);
  tiltReadout.textContent = `${tiltToDegrees(cutTilt).toFixed(1)}\u00b0`;
  tiltInput.addEventListener('input', () => {
    // Browsing the angle pauses playback, the same as browsing the depth does.
    if (slideRunning) setPresentationRunning(false);
    queueTilt(degreesToTilt(Number(tiltInput.value)), true);
    showPanel();
  });
  tiltInput.addEventListener('change', () => {
    queueTilt(degreesToTilt(Number(tiltInput.value)), false);
    const next = new URLSearchParams(location.search);
    // The URL carries the model's own quantity; the panel shows the angle.
    next.set('tilt', degreesToTilt(Number(tiltInput.value)).toFixed(5));
    history.replaceState(null, '', `${location.pathname}?${next}`);
  });
  addEventListener('pointermove', showPanel, { passive: true });
  addEventListener('keydown', event => {
    if (event.key !== 'h' && event.key !== 'H') return;
    panelHidden = !panelHidden;
    clearTimeout(idleTimer);
    controls.dataset.idle = String(panelHidden);
    if (!panelHidden) showPanel();
  });
  showPanel();
}

function startPresentation() {
  log = buildLog(seed);
  bindSampler();
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
  startPanel();
  setPresentationRunning(slideRunning);
}

if (debug) startDebug();
else startPresentation();
