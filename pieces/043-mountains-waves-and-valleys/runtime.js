// A small vanilla-JS drawing runtime for this piece — the replacement for p5.js.
//
// It implements only what sketch.js actually calls, and it implements the two
// things that decide what the artwork looks like exactly as p5 1.5.0 did:
//
//   * noise() / noiseSeed() — p5's Perlin implementation, four octaves with
//     0.5 amplitude falloff over a 4096-entry table filled from an LCG. Any
//     other noise function draws a different artwork, so this is a transcription
//     rather than a substitute.
//   * curveVertex() — p5 converts Catmull-Rom control points to cubic Béziers
//     inside endShape(). The "Curved Lines" parameter depends on that exact
//     conversion, including its habit of drawing nothing under four points.
//
// Everything else is thin wrapping over CanvasRenderingContext2D.
(() => {
  'use strict';

  // ---- constants ---------------------------------------------------------
  const ROUND = 'round';
  const SQUARE = 'butt';
  const PROJECT = 'square';
  const CLOSE = 'close';
  const ENTER = 13;

  // ---- colour ------------------------------------------------------------
  // Parsing goes through the canvas so any CSS colour resolves to the same
  // 8-bit levels the browser would give p5.
  const parseCanvas = document.createElement('canvas').getContext('2d');

  class Colour {
    constructor(levels) { this.levels = levels; }
    toString() {
      const [r, g, b, a] = this.levels;
      return `rgba(${r},${g},${b},${a / 255})`;
    }
    setAlpha(a) { this.levels[3] = a; }
  }

  function colour(...args) {
    if (args[0] instanceof Colour) return new Colour([...args[0].levels]);
    if (Array.isArray(args[0])) args = args[0];

    if (typeof args[0] === 'string') {
      parseCanvas.fillStyle = '#000';
      parseCanvas.fillStyle = args[0];
      const s = parseCanvas.fillStyle;
      if (s.startsWith('#')) {
        return new Colour([
          parseInt(s.slice(1, 3), 16),
          parseInt(s.slice(3, 5), 16),
          parseInt(s.slice(5, 7), 16),
          255
        ]);
      }
      const n = s.match(/[\d.]+/g).map(Number);
      return new Colour([n[0], n[1], n[2], Math.round((n[3] ?? 1) * 255)]);
    }

    const n = args.map(Number);
    if (n.length === 1) return new Colour([n[0], n[0], n[0], 255]);
    if (n.length === 2) return new Colour([n[0], n[0], n[0], n[1]]);
    return new Colour([n[0], n[1], n[2], n[3] ?? 255]);
  }

  // ---- Perlin noise, transcribed from p5 1.5.0 ---------------------------
  const PERLIN_YWRAPB = 4, PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
  const PERLIN_ZWRAPB = 8, PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
  const PERLIN_SIZE = 4095;
  const perlinOctaves = 4;
  const perlinAmpFalloff = 0.5;
  const scaledCosine = (i) => 0.5 * (1.0 - Math.cos(i * Math.PI));
  let perlin = null;

  function noiseSeed(seed) {
    // The same Lehmer-variant LCG p5 uses to fill the gradient table.
    const m = 4294967296, a = 1664525, c = 1013904223;
    let z = (seed == null ? Math.random() * m : seed) >>> 0;
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
      z = (a * z + c) % m;
      perlin[i] = z / m;
    }
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

  // p5's random() is never called by this sketch, but randomSeed() is, and it
  // consumes a value from the hash stream. Kept so that stream is unchanged.
  function randomSeed() {}

  // ---- drawing state -----------------------------------------------------
  let canvas = null, ctx = null;
  let doFill = true, doStroke = true;
  let fillColour = colour(255), strokeColour = colour(0);
  let vertices = [], isCurve = false;

  function applyFill() { ctx.fillStyle = fillColour.toString(); }
  function applyStroke() { ctx.strokeStyle = strokeColour.toString(); }

  const api = {
    createCanvas(w, h) {
      canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.style.display = 'block';
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
      window.drawingContext = ctx;
      api._sizeChanged(w, h);
      return { canvas, elt: canvas };
    },

    resizeCanvas(w, h) {
      canvas.width = w;
      canvas.height = h;
      api._sizeChanged(w, h);
      // A resized 2D context loses its state; restore what the sketch set.
      applyFill();
      applyStroke();
    },

    _sizeChanged(w, h) { window.width = w; window.height = h; },

    background(...args) {
      const c = colour(...args);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = c.toString();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    },

    fill(...args) { doFill = true; fillColour = colour(...args); applyFill(); },
    noFill() { doFill = false; },
    stroke(...args) { doStroke = true; strokeColour = colour(...args); applyStroke(); },
    noStroke() { doStroke = false; },
    strokeWeight(w) { ctx.lineWidth = w; },
    strokeCap(cap) {
      if (cap === ROUND || cap === SQUARE || cap === PROJECT) ctx.lineCap = cap;
    },

    beginShape() { vertices = []; isCurve = false; },
    vertex(x, y) { vertices.push([x, y]); },
    curveVertex(x, y) { isCurve = true; vertices.push([x, y]); },

    endShape(mode) {
      const close = mode === CLOSE;
      const n = vertices.length;

      if (isCurve) {
        // p5 draws nothing at all with fewer than four control points.
        if (n > 3) {
          const s = 1; // 1 - curveTightness, and curveTightness defaults to 0
          ctx.beginPath();
          ctx.moveTo(vertices[1][0], vertices[1][1]);
          let i;
          for (i = 1; i + 2 < n; i++) {
            const v = vertices[i];
            const c1x = v[0] + (s * vertices[i + 1][0] - s * vertices[i - 1][0]) / 6;
            const c1y = v[1] + (s * vertices[i + 1][1] - s * vertices[i - 1][1]) / 6;
            const c2x = vertices[i + 1][0] + (s * vertices[i][0] - s * vertices[i + 2][0]) / 6;
            const c2y = vertices[i + 1][1] + (s * vertices[i][1] - s * vertices[i + 2][1]) / 6;
            ctx.bezierCurveTo(c1x, c1y, c2x, c2y, vertices[i + 1][0], vertices[i + 1][1]);
          }
          if (close) ctx.lineTo(vertices[i + 1][0], vertices[i + 1][1]);
          fillStrokeClose(close);
        }
      } else if (n > 0) {
        ctx.beginPath();
        // lineTo on an empty path behaves as moveTo, which is what p5 relies on.
        for (const v of vertices) ctx.lineTo(v[0], v[1]);
        fillStrokeClose(close);
      }
      vertices = [];
      isCurve = false;
    },

    map: (n, a, b, c, d) => ((n - a) / (b - a)) * (d - c) + c,
    color: colour,
    noise,
    noiseSeed,
    randomSeed,

    saveCanvas(name, ext) {
      const a = document.createElement('a');
      a.download = `${name || 'canvas'}.${ext || 'png'}`;
      a.href = canvas.toDataURL(ext === 'jpg' ? 'image/jpeg' : 'image/png');
      a.click();
    }
  };

  function fillStrokeClose(close) {
    if (close) ctx.closePath();
    if (doFill) ctx.fill();
    if (doStroke) ctx.stroke();
  }

  // ---- lifecycle ---------------------------------------------------------
  let looping = true, targetFps = 60, lastFrame = 0, rafId = 0;

  Object.assign(window, api, { ROUND, SQUARE, PROJECT, CLOSE, ENTER });
  window.frameRate = (fps) => { targetFps = fps; };
  window.noLoop = () => { looping = false; };
  window.loop = () => { looping = true; };
  window.isLooping = () => looping;
  window.redraw = () => { if (typeof draw === 'function') draw(); };

  function tick(now) {
    rafId = requestAnimationFrame(tick);
    if (!looping) return;
    if (now - lastFrame < 1000 / targetFps - 0.5) return;
    lastFrame = now;
    if (typeof draw === 'function') draw();
  }

  function start() {
    window.windowWidth = window.innerWidth;
    window.windowHeight = window.innerHeight;
    if (typeof setup === 'function') setup();
    // p5 runs one frame immediately after setup, even when setup called
    // noLoop() — that first frame is what a reduced-motion viewer sees.
    if (typeof draw === 'function') draw();
    rafId = requestAnimationFrame(tick);
  }

  // DOM ready, not window load: load also waits on deferred subresources, and
  // a piece that draws a single frame would sit blank until they settle.
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
