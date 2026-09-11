function PreySystem(t) {
  this.params = t, this.canvas = this.params.myLayer, this.background = this.params.bg, this.foreground = this.params.fg, this.bgShapeMix = this.params.bgShapeMix, this.wordShapeMix = this.params.wordShapeMix, this.buffer = this.params.buffer, this.bufferElem = this.params.bufferElem, this.layerObj = this.params.layerObj, this.systemSize = 400, this.growthType = this.params.growthType, this.wordTargList = [], this.introMode = !0, this.wordTargetMin = 2200, this.shapeTypes = ["circle", "rectangle", "triangle"], this.eraserMode = !1
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
}, PreySystem.prototype.addNew = function(t) {
  let e = this.params;
  e.type = this.growthType, e.colors = this.colors, e.highlight = this.highlight, e.d = 20, e.canvas = this.canvas, e.background = this.background, e.foreground = this.foreground, e.buffer = this.buffer, e.bufferElem = this.bufferElem, e.compositeCall = this.params.compositeCall, e.shapeTypes = this.shapeTypes, e.wordShapeMix = this.wordShapeMix, e.bgShapeMix = this.bgShapeMix, e.eraserMode = this.eraserMode, e.introMode = this.introMode, e.stage = this.stage, e.wordTargList = this.wordTargList;
  let i = new Prey(e);
  this.preyList.push(i)
}, PreySystem.prototype.resetWordList = function(t) {
  this.wordTargList = [], this.eraserMode = !1, this.introMode = !1
}, PreySystem.prototype.setEraserMode = function(t) {
  this.eraserMode = !0
}, PreySystem.prototype.update = function(t) {}, PreySystem.prototype.buildTargetList = function() {
  if (this.buffer)
    for (let t = 0; t < 50; t++) {
      let t = {
        x: 0,
        y: 0
      };
      t.x = fxrand() * stage.w, t.y = fxrand() * stage.h, myPixelCheck = this.buffer.getImageData(t.x, t.y, 1, 1), 0 != myPixelCheck.data[3] && this.wordTargList.push({
        x: t.x,
        y: t.y
      })
    }
}, PreySystem.prototype.draw = function() {
  1 != this.introMode && this.wordTargList && this.wordTargList.length < this.wordTargetMin && this.buildTargetList(), renderQueue.add({
    type: "clear",
    canvas: this.canvas,
    height: this.stage.h,
    width: this.stage.w,
    location: {
      x: 0,
      y: 0
    }
  });
  for (let t = 0; t < this.preyList.length; t++) {
    const e = this.preyList[t];
    1 == e.alive && e.draw()
  }
  for (let t = 0; t < this.preyList.length; t++)
    if (1 == this.preyList[t].alive);
    else {
      let e = this.preyList.splice(t, 1);
      e = 0, this.addNew(), this.preyList.sort(((t, e) => t.lifeRemaining - e.lifeRemaining))
    }
}, Prey.prototype.reset = function() {
  this.life = 0, this.position = this.pickNewLocation(this.mode), this.rMax = this.params.sizeMin + this.sizeRange * fxrand(), this.currentR = 0, this.currentA = 360 * fxrand(), this.oldLoc = new Vector(this.position.x, this.position.y), this.startPos = new Vector(this.position.x, this.position.y), this.angleSpeed = .03, this.textureOffset = {
    x: (stage.w - 100) * fxrand(),
    y: (stage.h - 100) * fxrand(),
    a: .25 * fxrand()
  }, this.makeTexture({
    drawCanvas: this.canvas
  }), this.circleRMax = 1 * (this.params.sizeMin + this.sizeRange * fxrand())
}, Prey.prototype.die = function() {
  this.alive = !1
}, Prey.prototype.draw = function() {
  this.life++, this.lifeRemaining = this.maxLife - this.life, 1 == this.splitGeneration && this.generation, this.life < this.delayLife || (this.life < this.delayLife + this.growLife ? this.drawShape() : 1 == this.alive && (this.drawShape({
    holding: !0,
    die: !0
  }), this.die()))
}, Prey.prototype.pickColor = function(t) {
  let e = t[Math.floor(fxrand() * t.length)];
  return this.textureNum = Math.floor(6 * fxrand()), this.textureNum > 5 && (this.textureState = !1), e.color
}, Prey.prototype.drawShadow = function(t) {
  let e = t.xOffset / t.steps,
    i = t.yOffset / t.steps,
    s = t.alpha / t.steps,
    r = this.currentR * t.shadowScale,
    h = t.drawCanvas;
  for (let a = 0; a < t.steps; a++) h.fillStyle = `rgba(0,0,0,${s})`, h.beginPath(), h.arc(this.position.x + e * a, this.position.y + i * a, r, 0, 2 * Math.PI), h.closePath(), h.fill()
}, Prey.prototype.makeTexture = function(t) {
  let e = t.drawCanvas;
  this.pattern = e.createPattern(texture.getElem(), "repeat");
  let i = new DOMMatrix([1, .2, .8, 1, 0, 0]);
  this.pattern.setTransform(i.translate(this.textureOffset.x, this.textureOffset.y))
}, Prey.prototype.drawTexture = function(t) {
  let e = t.drawCanvas;
  e.fillStyle = this.pattern, e.globalAlpha = this.textureOffset.a, e.beginPath(), e.arc(this.position.x, this.position.y, this.currentR, 0, 2 * Math.PI), e.closePath(), e.fill(), e.globalAlpha = 1
}, Prey.prototype.drawShape = function(t) {
  let e = this.canvas,
    i = !1;
  if (t && 1 == t.holding && (i = !0), 0 == i) {
    let t = this.maxD / this.growLife;
    this.currentR += t
  }
  if (t && 1 == t.die && (e = this.background), this.position.x = this.startPos.x, this.position.y = this.startPos.y, "circle" == this.shapeType) renderQueue.add({
    type: "drawCircle",
    canvas: e,
    height: this.currentR,
    width: this.currentR,
    color: this.color,
    alpha: this.currentA,
    rotation: this.rotation,
    position: this.position,
    shadow: !0,
    texture: this.textureState,
    textureNumber: this.textureNum
  });
  else if ("rectangle" == this.shapeType) {
    let t = this.heightMod * this.currentR,
      i = this.widthMod * this.currentR;
    renderQueue.add({
      type: "drawRect",
      canvas: e,
      height: t,
      width: i,
      color: this.color,
      alpha: this.currentA,
      rotation: this.rotation,
      position: {
        x: this.position.x - this.currentR / 2,
        y: this.position.y - this.currentR / 2
      },
      shadow: !0,
      texture: this.textureState,
      textureNumber: this.textureNum
    })
  } else if ("triangle" == this.shapeType) {
    let t = this.heightMod * this.currentR,
      i = this.widthMod * this.currentR;
    renderQueue.add({
      type: "drawTriangle",
      canvas: e,
      height: t,
      width: i,
      color: this.color,
      alpha: this.currentA,
      rotation: this.rotation,
      position: {
        x: this.position.x - this.currentR / 2,
        y: this.position.y - this.currentR / 2
      },
      shadow: !0,
      texture: this.textureState,
      textureNumber: this.textureNum
    })
  }
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
