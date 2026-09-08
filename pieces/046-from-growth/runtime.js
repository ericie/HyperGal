// A small vanilla-JS drawing runtime for this piece — the replacement for p5.js.
//
// It implements only what sketch.js calls. The parts that decide what the
// artwork looks like are transcriptions of p5 1.x rather than substitutes:
//
//   * noise() / noiseSeed() — p5's Perlin: four octaves at 0.5 amplitude
//     falloff over a 4096-entry table filled from a Lehmer LCG. The whole
//     drawing direction comes out of this, so it has to be the same function.
//   * curveVertex() — p5 converts Catmull-Rom control points to cubic Béziers
//     inside endShape(), and draws nothing under four control points.
//   * endShape(CLOSE) appends the first vertex twice before closePath(), so the
//     start corner strokes as a join rather than two caps meeting.
//   * colour keeps p5's rounded 0-255 levels and its unrounded array, since p5
//     prints rgb() from the rounded values but alpha from the unrounded one.
//   * every renderer opens with strokeCap(ROUND); raw canvas defaults to butt.
(() => {
  'use strict';

  const ROUND = 'round', SQUARE = 'butt', PROJECT = 'square';
  const CLOSE = 'close', ENTER = 13;
  const density = Math.ceil(window.devicePixelRatio) || 1;

  // ---- colour ------------------------------------------------------------
  const parseCanvas = document.createElement('canvas').getContext('2d');

  class Colour {
    constructor(arr) {
      this._array = arr;
      this.levels = arr.map((f) => Math.round(f * 255));
    }
    setAlpha(a) { this._array[3] = a / 255; this.levels[3] = Math.round(a); }
    toString() {
      const l = this.levels;
      return `rgba(${l[0]},${l[1]},${l[2]},${this._array[3]})`;
    }
  }

  function colour(...args) {
    if (args[0] instanceof Colour) return new Colour([...args[0]._array]);
    if (Array.isArray(args[0])) args = args[0];

    if (typeof args[0] === 'string') {
      parseCanvas.fillStyle = '#000';
      parseCanvas.fillStyle = args[0];
      const s = parseCanvas.fillStyle;
      if (s.startsWith('#')) {
        return new Colour([
          parseInt(s.slice(1, 3), 16) / 255,
          parseInt(s.slice(3, 5), 16) / 255,
          parseInt(s.slice(5, 7), 16) / 255,
          1
        ]);
      }
      const n = s.match(/[\d.]+/g).map(Number);
      return new Colour([n[0] / 255, n[1] / 255, n[2] / 255, n[3] ?? 1]);
    }

    const n = args.map(Number);
    if (n.length === 1) return new Colour([n[0] / 255, n[0] / 255, n[0] / 255, 1]);
    if (n.length === 2) return new Colour([n[0] / 255, n[0] / 255, n[0] / 255, n[1] / 255]);
    return new Colour([n[0] / 255, n[1] / 255, n[2] / 255, (n[3] ?? 255) / 255]);
  }

  // ---- Perlin noise, transcribed from p5 ---------------------------------
  const PERLIN_YWRAPB = 4, PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
  const PERLIN_ZWRAPB = 8, PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
  const PERLIN_SIZE = 4095;
  const perlinOctaves = 4;
  const perlinAmpFalloff = 0.5;
  const scaledCosine = (i) => 0.5 * (1.0 - Math.cos(i * Math.PI));
  let perlin = null;

  function noiseSeed(seed) {
    const m = 4294967296, a = 1664525, c = 1013904223;
    let z = (seed == null ? Math.random() * m : seed) >>> 0;
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) { z = (a * z + c) % m; perlin[i] = z / m; }
  }

  function noise(x, y = 0, z = 0) {
    if (perlin == null) {
      perlin = new Array(PERLIN_SIZE + 1);
      for (let i = 0; i < PERLIN_SIZE + 1; i++) perlin[i] = Math.random();
    }
    if (x < 0) x = -x;
    if (y < 0) y = -y;
    if (z < 0) z = -z;

    let xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    let xf = x - xi, yf = y - yi, zf = z - zi;
    let rxf, ryf, r = 0, ampl = 0.5, n1, n2, n3;

    for (let o = 0; o < perlinOctaves; o++) {
      let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
      rxf = scaledCosine(xf);
      ryf = scaledCosine(yf);

      n1 = perlin[of & PERLIN_SIZE];
      n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
      n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
      n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
      n1 += ryf * (n2 - n1);

      of += PERLIN_ZWRAP;
      n2 = perlin[of & PERLIN_SIZE];
      n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
      n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
      n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
      n2 += ryf * (n3 - n2);

      n1 += scaledCosine(zf) * (n2 - n1);
      r += n1 * ampl;
      ampl *= perlinAmpFalloff;

      xi <<= 1; xf *= 2;
      yi <<= 1; yf *= 2;
      zi <<= 1; zf *= 2;
      if (xf >= 1.0) { xi++; xf--; }
      if (yf >= 1.0) { yi++; yf--; }
      if (zf >= 1.0) { zi++; zf--; }
    }
    return r;
  }

  // ---- drawing -----------------------------------------------------------
  let canvas = null, ctx = null;
  let doFill = true, doStroke = true;
  let fillColour = colour(255), strokeColour = colour(0);
  let capStyle = ROUND;
  let verts = [], isCurve = false;

  function fillStrokeClose(close) {
    if (close) ctx.closePath();
    if (doFill) ctx.fill();
    if (doStroke) ctx.stroke();
  }

  function sizeTo(w, h) {
    window.width = w;
    window.height = h;
    canvas.width = w * density;
    canvas.height = h * density;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    // Setting .width clears the context state, so restore it.
    ctx.setTransform(density, 0, 0, density, 0, 0);
    ctx.fillStyle = fillColour.toString();
    ctx.strokeStyle = strokeColour.toString();
    ctx.lineCap = capStyle;
  }

  const api = {
    createCanvas(w, h) {
      canvas = document.createElement('canvas');
      canvas.style.display = 'block';
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
      window.drawingContext = ctx;
      sizeTo(w, h);
      // p5 hands back a wrapper; the sketch only uses .parent() and
      // .removeAttribute(), so those are all it needs to answer to.
      return {
        canvas, elt: canvas,
        parent(sel) {
          const host = typeof sel === 'string' ? document.querySelector(sel) : sel;
          if (host) host.appendChild(canvas);
          return this;
        },
        removeAttribute(name) { canvas.removeAttribute(name); return this; }
      };
    },
    resizeCanvas(w, h) { sizeTo(w, h); },

    background(...a) {
      const prev = ctx.fillStyle;
      ctx.fillStyle = colour(...a).toString();
      ctx.fillRect(0, 0, window.width, window.height);
      ctx.fillStyle = prev;
    },

    fill(...a) { doFill = true; fillColour = colour(...a); ctx.fillStyle = fillColour.toString(); },
    noFill() { doFill = false; },
    stroke(...a) { doStroke = true; strokeColour = colour(...a); ctx.strokeStyle = strokeColour.toString(); },
    noStroke() { doStroke = false; },
    strokeWeight(w) { ctx.lineWidth = w; },
    strokeCap(c) { if (c === ROUND || c === SQUARE || c === PROJECT) { capStyle = c; ctx.lineCap = c; } },

    push() { ctx.save(); stack.push({ doFill, doStroke, fillColour, strokeColour, capStyle }); },
    pop() {
      ctx.restore();
      const s = stack.pop();
      if (s) ({ doFill, doStroke, fillColour, strokeColour, capStyle } = s);
    },
    translate(x, y) { ctx.translate(x, y); },
    rotate(a) { ctx.rotate(a); },
    scale(x, y = x) { ctx.scale(x, y); },

    beginShape() { verts = []; isCurve = false; },
    vertex(x, y) { verts.push([x, y]); },
    curveVertex(x, y) { isCurve = true; verts.push([x, y]); },

    endShape(mode) {
      const close = mode === CLOSE;
      const v = verts;

      if (isCurve) {
        // p5 draws nothing at all with fewer than four control points.
        if (v.length > 3) {
          const s = 1; // 1 - curveTightness, which defaults to 0
          ctx.beginPath();
          ctx.moveTo(v[1][0], v[1][1]);
          let i;
          for (i = 1; i + 2 < v.length; i++) {
            const c1x = v[i][0] + (s * v[i + 1][0] - s * v[i - 1][0]) / 6;
            const c1y = v[i][1] + (s * v[i + 1][1] - s * v[i - 1][1]) / 6;
            const c2x = v[i + 1][0] + (s * v[i][0] - s * v[i + 2][0]) / 6;
            const c2y = v[i + 1][1] + (s * v[i][1] - s * v[i + 2][1]) / 6;
            ctx.bezierCurveTo(c1x, c1y, c2x, c2y, v[i + 1][0], v[i + 1][1]);
          }
          if (close) ctx.lineTo(v[i + 1][0], v[i + 1][1]);
          fillStrokeClose(close);
        }
      } else if (v.length) {
        if (close) { v.push(v[0]); v.push(v[0]); }
        ctx.beginPath();
        ctx.moveTo(v[0][0], v[0][1]);
        for (let i = 1; i < v.length; i++) ctx.lineTo(v[i][0], v[i][1]);
        fillStrokeClose(close);
      }
      verts = [];
      isCurve = false;
    },

    rect(x, y, w, h) {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      if (doFill) ctx.fill();
      if (doStroke) ctx.stroke();
    },
    // p5's default ellipseMode is CENTER: x,y is the middle, w,h are diameters.
    ellipse(x, y, w, h = w) {
      ctx.beginPath();
      ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
      if (doFill) ctx.fill();
      if (doStroke) ctx.stroke();
    },
    line(x1, y1, x2, y2) {
      if (!doStroke) return;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },

    color: colour,
    noise,
    noiseSeed,
    saveCanvas(name, ext) {
      const a = document.createElement('a');
      a.download = `${name || 'canvas'}.${ext || 'png'}`;
      a.href = canvas.toDataURL(ext === 'jpg' ? 'image/jpeg' : 'image/png');
      a.click();
    }
  };

  const stack = [];

  // p5 exposes the maths it wraps as globals.
  Object.assign(window, api, {
    ROUND, SQUARE, PROJECT, CLOSE, ENTER,
    lerp: (a, b, t) => a + (b - a) * t,
    map: (n, a, b, c, d) => ((n - a) / (b - a)) * (d - c) + c,
    constrain: (n, l, h) => Math.max(Math.min(n, h), l),
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    norm: (n, a, b) => (n - a) / (b - a),
    sq: (n) => n * n,
    abs: Math.abs, ceil: Math.ceil, floor: Math.floor, round: Math.round,
    min: Math.min, max: Math.max, sqrt: Math.sqrt, pow: Math.pow,
    sin: Math.sin, cos: Math.cos, tan: Math.tan, atan2: Math.atan2,
    radians: (d) => d * (Math.PI / 180), degrees: (r) => r * (180 / Math.PI),
    PI: Math.PI, TWO_PI: Math.PI * 2, HALF_PI: Math.PI / 2
  });

  // ---- lifecycle ---------------------------------------------------------
  let looping = true, targetFps = 60, lastFrame = 0;
  window.frameCount = 0;

  window.frameRate = (fps) => { targetFps = fps; };
  window.noLoop = () => { looping = false; };
  window.loop = () => { looping = true; };
  window.isLooping = () => looping;
  window.redraw = () => { if (typeof draw === 'function') { window.frameCount++; draw(); } };

  function tick(now) {
    requestAnimationFrame(tick);
    if (!looping) return;
    if (now - lastFrame < 1000 / targetFps - 0.5) return;
    lastFrame = now;
    window.frameCount++;
    if (typeof draw === 'function') draw();
  }

  function start() {
    window.windowWidth = window.innerWidth;
    window.windowHeight = window.innerHeight;
    if (typeof setup === 'function') setup();
    // p5 runs one frame straight after setup, even if setup called noLoop().
    window.frameCount++;
    if (typeof draw === 'function') draw();
    requestAnimationFrame(tick);
  }

  // DOM ready, not window load: load also waits on deferred subresources, and
  // a single-frame render would sit blank until they settle.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.addEventListener('resize', () => {
    window.windowWidth = window.innerWidth;
    window.windowHeight = window.innerHeight;
    if (typeof windowResized === 'function') windowResized();
  });
  window.addEventListener('keydown', (e) => {
    window.key = e.key;
    window.keyCode = e.keyCode;
    if (typeof keyPressed === 'function') keyPressed(e);
  });
  window.addEventListener('mousedown', (e) => {
    if (typeof mousePressed === 'function') mousePressed(e);
  });

  window.windowWidth = window.innerWidth;
  window.windowHeight = window.innerHeight;
})();
