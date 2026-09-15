function PreySystem(t) {
  this.params = t, this.canvas = this.params.myLayer, this.background = this.params.bg, this.foreground = this.params.fg, this.bgShapeMix = this.params.bgShapeMix, this.wordShapeMix = this.params.wordShapeMix, this.buffer = this.params.buffer, this.bufferElem = this.params.bufferElem, this.layerObj = this.params.layerObj, this.systemSize = Math.round(400 * stage.w * stage.h / (1920 * 1920)), this.growthType = this.params.growthType, this.wordTargList = [], this.wordMask = null, this.introMode = !0, this.wordTargetMin = 2200, this.shapeTypes = ["circle", "rectangle", "triangle"], this.eraserMode = !1, this.clearCommand = {
    type: "clear",
    canvas: this.canvas
  }
}

function Prey(t) {
  this.compositeCall = t.compositeCall, this.maxLife = 240 * fxrand() + 30, this.lifeRemaining = this.maxLife, this.minLife = .5 * this.maxLife, this.delayLife = 0, this.delayDeath = 0, this.growLife = this.maxLife - this.delayDeath - this.delayLife, this.splitGeneration = !1, this.alive = !0, this.clearRemains = !1, this.limboCount = 0, this.growLife < this.minLife && (this.splitGeneration = !0, this.maxLife *= 2, this.growLife = this.minLife * (.5 * fxrand()) + .5 * this.minLife, this.delayDeath = this.maxLife - this.growLife - this.delayLife), this.maxD = 45 * fxrand() + 10, this.eraserMode = t.eraserMode, this.life = 0, this.params = t, this.stage = this.params.stage, this.fade = t.fade, this.distanceMax = t.distanceMax, this.sizeRange = t.sizeMax - t.sizeMin, this.rotation = 360 * fxrand(), this.heightMod = 2 * fxrand() + .5, this.widthMod = 2 * fxrand() + .15;
  let e = t.shapeTypes,
    i = t.wordShapeMix,
    s = t.bgShapeMix;
  this.shapeType = e[Math.floor(e.length * fxrand())], "all-circles" == s && (this.shapeType = "circle"), "all-rectangles" == s && (this.shapeType = "rectangle"), "all-triangles" == s && (this.shapeType = "triangle"), "right-angles" == s && (this.shapeType = "rectangle", this.rotation = 90, fxrand() > .5 && (this.rotation = 0)), "triangle" == this.shapeType && (this.heightMod *= 1.25, this.widthMod *= 1.25), this.wordSeeker = !1;
  let r = .3;
  letterPercent && (r = letterPercent), 1 == this.eraserMode && (r *= 1.5), 1 * fxrand() < r && 0 == this.eraserMode && (this.wordSeeker = !0, this.maxD = 24, this.rotation = 360 * fxrand(), this.shapeType = e[Math.floor(e.length * fxrand())], "all-circles" == i && (this.shapeType = "circle"), "all-rectangles" == i && (this.shapeType = "rectangle"), "all-triangles" == i && (this.shapeType = "triangle"), "right-angles" == i && (this.shapeType = "rectangle", this.rotation = 90, fxrand() > .5 && (this.rotation = 0)), "rectangle" == this.shapeType && (this.maxD = 28), "triangle" == this.shapeType && (this.maxD = 28, this.heightMod = 1.6, this.widthMod = 1.6)), this.colors = t.colors, this.highlight = t.highlight, this.color = this.pickColor(this.colors), this.mode = t.growthType, this.position = this.pickNewLocation(this.mode), this.rMax = t.sizeMin + this.sizeRange * fxrand(), this.wordTargList = t.wordTargList, this.canvas = t.canvas, this.background = t.bg, this.foreground = t.fg, fxrand(), this.canvas = t.myLayer, this.layerObj = t.layerObj, this.buffer = t.buffer, this.bufferElem = t.bufferElem, this.reset()
}
PreySystem.prototype.init = function(t, e) {
  this.stage = t, this.preyList = [];
  for (let t = 0; t < this.systemSize; t++) this.colors = e.list, this.highlight = e.highlight, this.addNew(t);
  this.preyList.sort(((t, e) => t.maxLife - e.maxLife))
}, PreySystem.prototype.prepareParams = function() {
  let e = this.params;
  e.type = this.growthType, e.colors = this.colors, e.highlight = this.highlight, e.d = 20, e.canvas = this.canvas, e.background = this.background, e.foreground = this.foreground, e.buffer = this.buffer, e.bufferElem = this.bufferElem, e.compositeCall = this.params.compositeCall, e.shapeTypes = this.shapeTypes, e.wordShapeMix = this.wordShapeMix, e.bgShapeMix = this.bgShapeMix, e.eraserMode = this.eraserMode, e.introMode = this.introMode, e.stage = this.stage, e.wordTargList = this.wordTargList;
  return e
}, PreySystem.prototype.addNew = function(t) {
  this.preyList.push(new Prey(this.prepareParams()))
}, PreySystem.prototype.reduceToLiveShapeLimit = function(t) {
  const e = Math.min(this.preyList.length, Math.max(0, t)),
    i = this.preyList;
  if (e >= i.length) return;
  const s = i.length / Math.max(1, e),
    r = new Array(e);
  for (let t = 0; t < e; t++) r[t] = i[Math.floor(t * s)];
  this.preyList = r, this.systemSize = e
}, PreySystem.prototype.enableIncrementalRendering = function(t) {
  this.renderBatchCount = Math.max(1, Math.round(t)), this.renderBatchIndex = 0, this.background = this.canvas, this.params.bg = this.canvas;
  for (let e = 0; e < this.preyList.length; e++) this.preyList[e].renderBatch = e % this.renderBatchCount, this.preyList[e].background = this.canvas
}, PreySystem.prototype.recycle = function(t) {
  // Reinitialize the object in place so its render-command storage survives
  // instead of becoming JavaScript garbage.
  t.wordTargList = null, Prey.call(t, this.prepareParams());
  return t
}, PreySystem.prototype.resetWordList = function(t) {
  this.wordTargList = [], this.wordMask = null, this.eraserMode = !1, this.introMode = !1
}, PreySystem.prototype.setEraserMode = function(t) {
  this.eraserMode = !0
}, PreySystem.prototype.update = function(t) {}, PreySystem.prototype.buildTargetList = function(t = 1) {
  if (this.buffer) {
    if (!this.wordMask) {
      const t = this.bufferElem.width,
        e = this.bufferElem.height,
        i = this.buffer.getImageData(0, 0, t, e).data,
        s = new Uint8Array(t * e);
      let r = !1;
      for (let e = 0, t = 3; t < i.length; e++, t += 4) s[e] = i[t], i[t] && (r = !0);
      if (!r) return;
      this.wordMask = {
        alpha: s,
        width: t,
        height: e,
        scaleX: t / stage.w,
        scaleY: e / stage.h
      }
    }
    const e = this.wordMask;
    for (let a = 0; a < 50 * t; a++) {
      const t = fxrand() * stage.w,
        r = fxrand() * stage.h,
        i = Math.min(e.width - 1, Math.floor(t * e.scaleX)),
        s = Math.min(e.height - 1, Math.floor(r * e.scaleY));
      0 != e.alpha[s * e.width + i] && this.wordTargList.push({
        x: t,
        y: r
      })
    }
  }
}, PreySystem.prototype.draw = function(frameStep = 1, renderLive = !0) {
  const batchCount = renderLive ? this.renderBatchCount || 1 : 1,
    batch = batchCount > 1 ? this.renderBatchIndex++ % batchCount : 0,
    preyFrameStep = frameStep * batchCount;
  1 != this.introMode && this.wordTargList && this.wordTargList.length < this.wordTargetMin && this.buildTargetList(frameStep), renderLive && 1 == batchCount && renderQueue.add(this.clearCommand);
  for (let index = 0; index < this.preyList.length; index++) {
    const prey = this.preyList[index];
    1 == prey.alive && (1 == batchCount || prey.renderBatch == batch) && prey.draw(preyFrameStep, renderLive)
  }
  let a = !1;
  for (let e = 0; e < this.preyList.length; e++)
    1 != this.preyList[e].alive && (this.preyList[e] = this.recycle(this.preyList[e]), a = !0);
  // Several shapes often expire in one frame. Restore lifespan ordering once
  // after all replacements instead of repeatedly sorting the whole population.
  a && this.preyList.sort(((t, e) => t.lifeRemaining - e.lifeRemaining))
}, PreySystem.prototype.drawCurrentFrame = function() {
  renderQueue.add(this.clearCommand);
  for (let t = 0; t < this.preyList.length; t++) 1 == this.preyList[t].alive && this.preyList[t].drawShape(0);
  renderQueue.update()
}, Prey.prototype.reset = function() {
  this.life = 0, this.position = this.pickNewLocation(this.mode), this.rMax = this.params.sizeMin + this.sizeRange * fxrand(), this.currentR = 0, this.currentA = 360 * fxrand(), this.startPos = new Vector(this.position.x, this.position.y);
  // Preserve the original seeded random sequence. These four values formerly
  // fed unused per-shape texture and radius fields.
  fxrand(), fxrand(), fxrand(), fxrand()
}, Prey.prototype.die = function() {
  this.alive = !1
}, Prey.prototype.draw = function(t = 1, e = !0) {
  const i = this.life,
    s = this.delayLife + this.growLife,
    r = Math.max(i + 1, Math.ceil(this.delayLife)),
    h = Math.min(i + t, Math.ceil(s) - 1),
    a = Math.max(0, h - r + 1);
  this.life += t, this.lifeRemaining = this.maxLife - this.life, 1 == this.splitGeneration && this.generation, this.life < this.delayLife || (this.life < s ? e ? this.drawShape(a) : a > 0 && (this.currentR += a * this.maxD / this.growLife) : 1 == this.alive && (a > 0 && (this.currentR += a * this.maxD / this.growLife), this.drawShape(0, !0), this.die()))
}, Prey.prototype.pickColor = function(t) {
  let e = t[Math.floor(fxrand() * t.length)];
  return this.textureNum = Math.floor(6 * fxrand()), this.textureNum > 5 && (this.textureState = !1), e.color
}, Prey.prototype.drawShape = function(t = 1, e = !1) {
  let i = e ? this.background : this.canvas;
  t > 0 && (this.currentR += this.maxD / this.growLife * t), this.position.x = this.startPos.x, this.position.y = this.startPos.y;
  const s = e ? "finalCommand" : "liveCommand",
    r = this[s] || (this[s] = {
      position: {
        x: 0,
        y: 0
      },
      shadow: !0
    }),
    h = "circle" == this.shapeType;
  r.type = h ? "drawCircle" : "rectangle" == this.shapeType ? "drawRect" : "drawTriangle", r.canvas = i, r.height = h ? this.currentR : this.heightMod * this.currentR, r.width = h ? this.currentR : this.widthMod * this.currentR, r.color = this.color, r.alpha = this.currentA, r.rotation = this.rotation, r.position.x = h ? this.position.x : this.position.x - this.currentR / 2, r.position.y = h ? this.position.y : this.position.y - this.currentR / 2, r.texture = this.textureState, r.textureNumber = this.textureNum, renderQueue.add(r)
}, Prey.prototype.pickNewLocation = function(t) {
  let e = new Vector(0, 0);
  if (this.distanceMax = this.params.distanceMax, e.x = fxrand() * this.params.stage.w, e.y = fxrand() * this.params.stage.h, this.color = this.pickColor(this.colors), this.textureState = !0, this.wordSeeker && null != this.wordTargList && this.wordTargList.length > 50) {
    let t = this.wordTargList[Math.floor(this.wordTargList.length * fxrand())];
    if (e = e = new Vector(t.x, t.y), 0 == this.eraserMode) {
      const t = colorToObj(this.highlight.color),
        e = .08 * fxrand() + .96,
        i = {
          red: t.red * e,
          blue: t.blue * e,
          green: t.green * e
        },
        s = .9,
        r = 1.05,
        h = {
          red: i.red * s,
          blue: i.blue * s,
          green: i.green * s
        },
        a = {
          red: i.red * r,
          blue: i.blue * r,
          green: i.green * r
        },
        o = this.canvas.createLinearGradient(0, 0, 40, 0);
      o.addColorStop(0, `rgba(${a.red},${a.green},${a.blue},1)`), o.addColorStop(1, `rgba(${h.red},${h.green},${h.blue},1)`), this.color = o, this.textureState = !1
    }
  }
  return e
};
