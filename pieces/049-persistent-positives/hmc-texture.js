var textureStage = {
  w: 1920,
  h: 1920
};

function TextureObject(e) {
  this.createCanvas();
  let t = "lineSpray";
  e && e.type && (t = e.type), this.drawTexture({
    type: t
  })
}
TextureObject.prototype.createCanvas = function(e) {
  let t = document.getElementById("library"),
    r = document.createElement("canvas"),
    a = r.getContext("2d"),
    n = "texture_1";
  r.setAttribute("id", n), r.setAttribute("height", textureStage.w / 8), r.setAttribute("width", textureStage.h / 8), t.appendChild(r), this.layerObj = {
    id: n,
    elem: r,
    canvas: a
  }
}, TextureObject.prototype.drawTexture = function(e) {
  type = e.type, this[type]()
}, TextureObject.prototype.spray = function() {
  let e = this.layerObj.canvas;
  for (let t = 0; t < 200; t++) {
    let t = fxrand() * textureStage.w / 8,
      r = fxrand() * textureStage.h / 8,
      a = .49 * fxrand() + .01,
      n = 7.5 * fxrand() + .5;
    fillstyle = "rgba(0,0,0," + a + ")", e.beginPath(), e.arc(t, r, n / 2, 0, 2 * Math.PI, !1), e.closePath(), e.fill()
  }
}, TextureObject.prototype.lineSpray = function() {
  let e = this.layerObj.canvas;
  for (let t = 0; t < 200; t++) {
    let t = fxrand() * textureStage.w / 7,
      r = fxrand() * textureStage.h / 7,
      a = fxrand() * textureStage.w / 7,
      n = fxrand() * textureStage.h / 7,
      o = fxrand(),
      l = (fxrand(), 3 * fxrand()),
      i = 4 * fxrand() + 1,
      s = 6 * fxrand() + 8;
    e.strokeStyle = "rgba(0,0,0," + o + ")", e.lineWidth = l, e.setLineDash([i, s]), e.beginPath(), e.moveTo(t, r), e.lineTo(a, n), e.stroke()
  }
}, TextureObject.prototype.lineSimple = function() {
  let e = this.layerObj.canvas,
    t = textureStage.w / 7,
    r = t / 80;
  for (let a = 0; a < t / r; a++) {
    let n = a * r,
      o = 0,
      l = a * r,
      i = t,
      s = .5 * fxrand() + .5,
      c = 2 * fxrand();
    fxrand(), fxrand(), e.strokeStyle = "rgba(0,0,0," + s + ")", e.lineWidth = c, e.beginPath(), e.moveTo(n, o), e.lineTo(l, i), e.stroke()
  }
}, TextureObject.prototype.lineGrid = function() {
  let e = this.layerObj.canvas,
    t = textureStage.w / 7,
    r = t / 40;
  for (let a = 0; a < t / r; a++) {
    let n = a * r,
      o = 0,
      l = a * r,
      i = t,
      s = .5;
    e.strokeStyle = "rgba(0,0,0," + s + ")", e.beginPath(), e.moveTo(n, o), e.lineTo(l, i), e.stroke()
  }
  for (let a = 0; a < t / r; a++) {
    let n = 0,
      o = a * r,
      l = t,
      i = a * r,
      s = .75;
    e.strokeStyle = "rgba(0,0,0," + s + ")", e.beginPath(), e.moveTo(n, o), e.lineTo(l, i), e.stroke()
  }
}, TextureObject.prototype.circleGrid = function() {
  let e = 0,
    t = 0,
    r = this.layerObj.canvas;
  for (; t < textureStage.h;) {
    for (; e < textureStage.w;) r.fillStyle = "rgba(0,0,0,.4)", r.beginPath(), r.arc(e, t, 5, 0, 2 * Math.PI, !1), r.closePath(), r.fill(), e += 20;
    t += 20, e = 0
  }
}, TextureObject.prototype.gradient = function() {
  let e = this.layerObj.canvas,
    t = textureStage.w / 8;
  const r = e.createLinearGradient(0, 0, t, 0);
  r.addColorStop(0, "rgba(0,0,0,1)"), r.addColorStop(.25, "rgba(0,0,0,0)"), r.addColorStop(1, "rgba(0,0,0,1)"), e.fillStyle = r, e.beginPath(), e.rect(0, 0, t, t), e.closePath(), e.fill(), e.fillStyle = "rgba(255,255,0,.5)", colorToObj(e.fillStyle)
}, TextureObject.prototype.getTexture = function() {}, TextureObject.prototype.getCanvas = function() {
  return this.layerObj.canvas
}, TextureObject.prototype.getElem = function() {
  return this.layerObj.elem
};
