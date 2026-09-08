// A small vanilla-JS drawing runtime for this piece — the replacement for p5.js.
//
// It implements only what this sketch calls, and it follows p5 1.5.0 exactly
// wherever the result is visible:
//
//   * colour keeps both p5's rounded 0–255 "levels" and its unrounded internal
//     array, because p5 prints rgb() from the rounded values but alpha from the
//     unrounded one. The per-frame background fade depends on that alpha.
//   * tint()/image() reproduce p5's per-pixel multiply, which is how the white
//     offscreen quilt is recoloured every frame.
//   * lerpColor() interpolates from the rounded levels, as p5 does.
//   * the canvas is backed at the display's pixel density with a scaled
//     context, matching p5's default.
(() => {
  'use strict';

  const ROUND = 'round', SQUARE = 'butt', PROJECT = 'square';
  const CLOSE = 'close', RGB = 'rgb', ENTER = 13;
  const density = Math.ceil(window.devicePixelRatio) || 1;

  // ---- colour ------------------------------------------------------------
  const parseCanvas = document.createElement('canvas').getContext('2d');

  class Colour {
    constructor(arr) {
      this._array = arr;                                  // 0–1 floats
      this.levels = arr.map((f) => Math.round(f * 255));  // 0–255 ints
    }
    setAlpha(a) {
      this._array[3] = a / 255;
      this.levels[3] = Math.round(a);
    }
    toString() {
      // p5 prints the rounded channels but the raw alpha.
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

  const lerp = (a, b, t) => a + (b - a) * t;

  function lerpColour(c1, c2, amt) {
    // p5 interpolates the rounded levels, not the raw array.
    const from = c1.levels.map((l) => l / 255);
    const to = c2.levels.map((l) => l / 255);
    const t = Math.max(Math.min(amt, 1), 0);
    return colour(
      lerp(from[0], to[0], t) * 255,
      lerp(from[1], to[1], t) * 255,
      lerp(from[2], to[2], t) * 255,
      lerp(from[3], to[3], t) * 255
    );
  }

  // ---- a drawing surface -------------------------------------------------
  class Surface {
    constructor(w, h, attach) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.doFill = true;
      this.doStroke = true;
      this.fillColour = colour(255);
      this.strokeColour = colour(0);
      this.tintLevels = null;
      this.stack = [];
      this.verts = [];
      if (attach) {
        this.canvas.style.display = 'block';
        document.body.appendChild(this.canvas);
      }
      this.setSize(w, h);
    }

    setSize(w, h) {
      this.width = w;
      this.height = h;
      this.canvas.width = w * density;
      this.canvas.height = h * density;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      // Resizing resets the context, so re-apply the density scale and style.
      this.ctx.setTransform(density, 0, 0, density, 0, 0);
      this.ctx.fillStyle = this.fillColour.toString();
      this.ctx.strokeStyle = this.strokeColour.toString();
      // p5 opens every renderer with a round cap; the raw canvas default is
      // butt, which shifts a handful of pixels at each stroke end.
      this.ctx.lineCap = this.capStyle || ROUND;
    }

    fill(...a) { this.doFill = true; this.fillColour = colour(...a); this.ctx.fillStyle = this.fillColour.toString(); return this; }
    noFill() { this.doFill = false; return this; }
    stroke(...a) { this.doStroke = true; this.strokeColour = colour(...a); this.ctx.strokeStyle = this.strokeColour.toString(); return this; }
    noStroke() { this.doStroke = false; return this; }
    strokeWeight(w) { this.ctx.lineWidth = w; return this; }
    strokeCap(c) {
      if (c === ROUND || c === SQUARE || c === PROJECT) { this.capStyle = c; this.ctx.lineCap = c; }
      return this;
    }
    colorMode() { return this; }
    color(...a) { return colour(...a); }

    push() {
      this.ctx.save();
      this.stack.push({
        doFill: this.doFill, doStroke: this.doStroke,
        fillColour: this.fillColour, strokeColour: this.strokeColour,
        tintLevels: this.tintLevels
      });
      return this;
    }
    pop() {
      this.ctx.restore();
      const s = this.stack.pop();
      if (s) Object.assign(this, s);
      return this;
    }
    translate(x, y) { this.ctx.translate(x, y); return this; }
    scale(x, y = x) { this.ctx.scale(x, y); return this; }

    background(...a) {
      // p5 fills a rect under the current transform and does not clear, so a
      // colour with alpha composites over what is already there.
      const prev = this.ctx.fillStyle;
      this.ctx.fillStyle = colour(...a).toString();
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = prev;
      return this;
    }

    clear() {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
      return this;
    }

    _fillStrokeClose(close) {
      if (close) this.ctx.closePath();
      if (this.doFill) this.ctx.fill();
      if (this.doStroke) this.ctx.stroke();
    }

    beginShape() { this.verts = []; return this; }
    vertex(x, y) { this.verts.push([x, y]); return this; }
    endShape(mode) {
      const close = mode === CLOSE;
      const v = this.verts;
      if (v.length) {
        // p5 appends a copy of the first vertex when closing, so the path
        // returns to its start with a real line segment and the start/end
        // corner is stroked as a join rather than two caps meeting. Dropping
        // this loses a little edge coverage on every shape.
        if (close) { v.push(v[0]); v.push(v[0]); }
        this.ctx.beginPath();
        this.ctx.moveTo(v[0][0], v[0][1]);
        for (let i = 1; i < v.length; i++) this.ctx.lineTo(v[i][0], v[i][1]);
        this._fillStrokeClose(close);
      }
      this.verts = [];
      return this;
    }

    rect(x, y, w, h) {
      this.ctx.beginPath();
      this.ctx.rect(x, y, w, h);
      this._fillStrokeClose(true);
      return this;
    }
    triangle(x1, y1, x2, y2, x3, y3) {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.lineTo(x3, y3);
      this._fillStrokeClose(true);
      return this;
    }
    line(x1, y1, x2, y2) {
      if (!this.doStroke) return this;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
      return this;
    }

    tint(...a) { this.tintLevels = colour(...a).levels; return this; }
    noTint() { this.tintLevels = null; return this; }

    // p5 1.5 tints with composite operations on a canvas cached against the
    // source, not a per-pixel loop. That distinction is the whole frame budget
    // here: this runs on every frame over the full-size offscreen quilt.
    _tinted(src) {
      if (!src.tintCanvas) src.tintCanvas = document.createElement('canvas');
      const t = src.tintCanvas;
      t.width = src.canvas.width;
      t.height = src.canvas.height;
      const tc = t.getContext('2d');
      const tint = this.tintLevels;
      tc.save();
      tc.clearRect(0, 0, t.width, t.height);

      if (tint[0] < 255 || tint[1] < 255 || tint[2] < 255) {
        // Multiply destroys the alpha channel, so p5 first forces the image to
        // full opacity while preserving its colour (luminosity then color),
        // multiplies in the tint, then restores the original alpha.
        tc.drawImage(src.canvas, 0, 0);
        tc.globalCompositeOperation = 'luminosity';
        tc.drawImage(src.canvas, 0, 0);
        tc.globalCompositeOperation = 'color';
        tc.drawImage(src.canvas, 0, 0);
        tc.globalCompositeOperation = 'multiply';
        tc.fillStyle = `rgb(${tint[0]}, ${tint[1]}, ${tint[2]})`;
        tc.fillRect(0, 0, t.width, t.height);
        tc.globalCompositeOperation = 'destination-in';
        tc.globalAlpha = tint[3] / 255;
        tc.drawImage(src.canvas, 0, 0);
      } else {
        // Alpha-only tint needs none of that.
        tc.globalAlpha = tint[3] / 255;
        tc.drawImage(src.canvas, 0, 0);
      }

      tc.restore();
      return t;
    }

    image(src, dx, dy) {
      const cnv = this.tintLevels ? this._tinted(src) : src.canvas;
      const s = cnv.width / src.width;
      this.ctx.drawImage(cnv, 0, 0, s * src.width, s * src.height, dx, dy, src.width, src.height);
      return this;
    }

    save(name, ext) {
      const a = document.createElement('a');
      a.download = `${name || 'canvas'}.${ext || 'png'}`;
      a.href = this.canvas.toDataURL(ext === 'jpg' ? 'image/jpeg' : 'image/png');
      a.click();
    }
  }

  // ---- globals bound to the main surface ---------------------------------
  let main = null;

  const bind = (name) => (...args) => main[name](...args);
  const names = ['background', 'fill', 'noFill', 'stroke', 'noStroke', 'strokeWeight',
    'strokeCap', 'colorMode', 'push', 'pop', 'translate', 'scale', 'beginShape',
    'vertex', 'endShape', 'rect', 'triangle', 'line', 'tint', 'noTint', 'image', 'clear'];
  for (const n of names) window[n] = bind(n);

  window.createCanvas = (w, h) => {
    main = new Surface(w, h, true);
    window.drawingContext = main.ctx;
    window.width = w;
    window.height = h;
    return { canvas: main.canvas, elt: main.canvas };
  };
  window.createGraphics = (w, h) => new Surface(w, h, false);
  window.resizeCanvas = (w, h) => { main.setSize(w, h); window.width = w; window.height = h; };
  window.color = colour;
  window.lerpColor = lerpColour;

  // p5 exposes the maths it wraps as globals. This sketch reaches for ceil()
  // and lerp(); the rest are p5's same thin wrappers, kept so a code path I
  // did not exercise cannot trip over a missing name.
  Object.assign(window, {
    lerp,
    abs: Math.abs, ceil: Math.ceil, floor: Math.floor, round: Math.round,
    min: Math.min, max: Math.max, sqrt: Math.sqrt, pow: Math.pow,
    sin: Math.sin, cos: Math.cos, atan2: Math.atan2,
    sq: (n) => n * n,
    constrain: (n, l, h) => Math.max(Math.min(n, h), l),
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    map: (n, a, b, c, d) => ((n - a) / (b - a)) * (d - c) + c,
    norm: (n, a, b) => (n - a) / (b - a),
    radians: (d) => d * (Math.PI / 180),
    degrees: (r) => r * (180 / Math.PI),
    PI: Math.PI, TWO_PI: Math.PI * 2, HALF_PI: Math.PI / 2
  });
  window.saveCanvas = (a, b, c) =>
    (a instanceof Surface || a === undefined || typeof a === 'string')
      ? main.save(typeof a === 'string' ? a : b, typeof a === 'string' ? b : c)
      : main.save(b, c);
  Object.assign(window, { ROUND, SQUARE, PROJECT, CLOSE, RGB, ENTER });

  // ---- lifecycle ---------------------------------------------------------
  let looping = true, targetFps = 60, lastFrame = 0;

  window.frameRate = (fps) => { targetFps = fps; };
  window.noLoop = () => { looping = false; };
  window.loop = () => { looping = true; };
  window.isLooping = () => looping;
  window.redraw = () => { if (typeof draw === 'function') draw(); };

  function tick(now) {
    requestAnimationFrame(tick);
    if (!looping) return;
    if (now - lastFrame < 1000 / targetFps - 0.5) return;
    lastFrame = now;
    if (typeof draw === 'function') draw();
  }

  function start() {
    window.windowWidth = window.innerWidth;
    window.windowHeight = window.innerHeight;
    if (typeof setup === 'function') setup();
    // p5 runs one frame straight after setup even if setup called noLoop().
    if (typeof draw === 'function') draw();
    requestAnimationFrame(tick);
  }

  // DOM ready rather than window load: load also waits on deferred
  // subresources, which would leave a single-frame render blank.
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
