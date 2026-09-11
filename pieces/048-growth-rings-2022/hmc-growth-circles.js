function GrowthCircle(s) {
  this.params = s, this.canvas = this.params.comp, this.canvasElem = this.params.canvasElem, this.background = this.params.bg, this.foreground = this.params.fg, this.buffer = this.params.buffer, this.bufferElem = this.params.bufferElem, this.seperate = this.params.seperate, this.systemSize = this.params.size, this.growthType = this.params.growthType, this.colors = this.params.colors, this.maxR = Math.max(stage.w, stage.h) / 2, this.growMax = 25, this.growMin = 10, this.growDiff = this.growMax - this.growMin, this.rings = [], this.ringPoints = [], this.layout = this.params.layout, this.canvas.clearRect(0, 0, this.bufferElem.width, this.bufferElem.height), this.gridSize = this.params.gridSize, this.gridCols = this.params.gridCols, this.gridRows = this.params.gridRows, this.gridRealMax = this.params.gridRealMax, this.gridMin = this.params.gridMin
}
GrowthCircle.prototype.init = function() {
  this.position = new Vector(stage.w / 2, stage.h / 2), console.log("LAYOUT", this.layout), this.ringPos = new Vector(this.position.x, this.position.y), this.r = 5, this.targR = this.r, this.a = 0, this.startA = this.a
}, GrowthCircle.prototype.drawCircle = function(s, t) {
  new Vector(stage.w / 2, stage.h / 2);
  for (let s = this.ringPoints.length - 1; s >= 0; s--) {
    const t = this.ringPoints[s];
    this.canvas.beginPath(), this.canvas.moveTo(t[0].x, t[0].y);
    for (let s = 0; s < t.length; s++) {
      const a = t[s];
      this.canvas.lineTo(a.x, a.y)
    }
    let a = Math.floor(256 * fxrand()),
      i = Math.floor(256 * fxrand()),
      e = Math.floor(256 * fxrand()),
      h = Math.floor(fxrand() * this.colors.list.length);
    a = this.colors.list[h].color.red, i = this.colors.list[h].color.green, e = this.colors.list[h].color.blue;
    const r = .7;
    this.colorVar = "rgba(" + a + "," + i + "," + e + ",1)", this.colorVarDark = "rgba(" + a * r + "," + i * r + "," + e * r + ",1)", this.canvas.lineWidth = 9, this.canvas.shadowColor = "transparent", this.canvas.shadowBlur = 0, 1 == this.seperate && s == this.ringPoints.length - 1 && "void_2" != this.layout && (a = this.colors.shadow.color.red, i = this.colors.shadow.color.green, e = this.colors.shadow.color.blue, this.canvas.shadowColor = "rgba(" + a + "," + i + "," + e + ",0.45)", this.canvas.shadowBlur = 55, a = this.colors.seperator.color.red, i = this.colors.seperator.color.green, e = this.colors.seperator.color.blue, this.colorVar = "rgba(" + a + "," + i + "," + e + ",1)", this.colorVarDark = "rgba(" + a + "," + i + "," + e + ",1)", this.canvas.lineWidth = 0), this.canvas.strokeStyle = this.colorVarDark, this.canvas.stroke(), this.canvas.fillStyle = this.colorVar, this.canvas.fill()
  }
}, GrowthCircle.prototype.buildCircle = function(s, t) {
  this.r;
  let a = [],
    i = [],
    e = 0,
    h = t,
    r = h,
    o = h;
  for (; this.a <= 2 * Math.PI;) {
    let t = .5,
      l = fxrand();
    if (l < .02) {
      let s = 60;
      o = h + fxrand() * s - fxrand() * s
    }
    l < .01 && (o = r), this.a > 2 * Math.PI - 1.2 && s > 0 && (o = r, t = .75), this.a > 2 * Math.PI - .2 && s > 0 && (t = Math.abs((h - r) / 5), o = r), Math.abs(h - o) > t && (o > h ? h += t : o < h && (h -= t, h < r / 2 && (h = r / 2))), s > 0 && (this.r = this.rings[s - 1][e] + h, e++);
    let g = this.r;
    this.ringPos.x = this.position.x + g * Math.cos(this.a), this.ringPos.y = this.position.y + g * Math.sin(this.a), a.push(g), i.push({
      x: this.ringPos.x,
      y: this.ringPos.y
    }), this.a += .02
  }
  this.rings.push(a), this.ringPoints.push(i), this.a = 0
}, GrowthCircle.prototype.update = function() {}, GrowthCircle.prototype.draw = function() {
  let s = 0;
  for (1 == this.seperate && (this.maxR = .28 * Math.min(stage.w, stage.h)); this.r < this.maxR;) {
    let t = fxrand() * this.growDiff + this.growMin;
    const a = 20;
    1 == this.seperate && this.maxR - this.r < a && (t += a), this.buildCircle(s, t), s++, this.r += t
  }
  if (this.drawCircle(), "Spread" == this.layout) {
    this.buffer.drawImage(this.canvasElem, 0, 0, stage.w, stage.h), this.canvas.clearRect(0, 0, stage.w, stage.h);
    let s = .2 * fxrand() + .58,
      t = .2 * fxrand() + .58,
      a = .2 * fxrand() + .58,
      i = (stage.w, stage.w, stage.w * a);
    this.canvas.drawImage(this.bufferElem, stage.w - stage.w * s / 2 * .8, stage.h / 2 - stage.h * s / 2, stage.w * s, stage.h * s), this.canvas.drawImage(this.bufferElem, 0 - stage.w * t / 2 * 1.2, stage.h / 2 - stage.h * t / 2, stage.w * t, stage.h * t), this.canvas.drawImage(this.bufferElem, stage.w / 2 - i / 2, stage.h / 2 - stage.h * a / 2, stage.w * a, stage.h * a)
  }
  if ("Passage" == this.layout && (this.buffer.drawImage(this.canvasElem, 0, 0, stage.w, stage.h), this.canvas.clearRect(0, 0, stage.w, stage.h), this.canvas.drawImage(this.bufferElem, 0, .45 * stage.h, 1.2 * stage.w, 1.2 * stage.h), this.canvas.drawImage(this.bufferElem, 0, 0 - .6 * stage.h, 1.2 * stage.w, 1.2 * stage.h)), "Void" == this.layout) {
    this.buffer.drawImage(this.canvasElem, 0, 0, stage.w, stage.h), this.canvas.clearRect(0, 0, stage.w, stage.h), this.canvas.fillStyle = "white";
    let s = Math.min(stage.w, stage.h) / 5;
    this.canvas.beginPath(), this.canvas.ellipse(stage.w / 2, .5 * stage.h, s, s, Math.PI, 0, 2 * Math.PI), this.canvas.fill()
  }
  if ("Joined" == this.layout) {
    this.buffer.drawImage(this.canvasElem, 0, 0, stage.w, stage.h), this.canvas.clearRect(0, 0, stage.w, stage.h), red = this.colors.shadow.color.red, grn = this.colors.shadow.color.green, blu = this.colors.shadow.color.blue;
    let s = "rgba(" + red + "," + grn + "," + blu + ",1)",
      t = "rgba(" + red + "," + grn + "," + blu + ",0.45)";
    red = this.colors.seperator.color.red, grn = this.colors.seperator.color.green, blu = this.colors.seperator.color.blue;
    let a = "rgba(" + red + "," + grn + "," + blu + ",1)",
      i = "rgba(" + red + "," + grn + "," + blu + ",0.45)";
    this.canvas.fillStyle = s, this.canvas.shadowColor = i, this.canvas.shadowBlur = 55;
    let e = .4,
      h = Math.min(stage.w, stage.h) / 5.5;
    this.canvas.beginPath(), this.canvas.ellipse(stage.w * e, stage.h * e, h, h, Math.PI, 0, 2 * Math.PI), this.canvas.closePath(), this.canvas.fill(), this.canvas.fillStyle = a, this.canvas.shadowColor = t, this.canvas.shadowBlur = 55, this.canvas.beginPath(), this.canvas.ellipse(stage.w - stage.w * e, stage.h - stage.h * e, h, h, Math.PI, 0, 2 * Math.PI), this.canvas.closePath(), this.canvas.fill(), this.canvas.fillStyle = t, this.canvas.beginPath(), this.canvas.ellipse(stage.w * e, stage.h * e, h, h, Math.PI, 0, 2 * Math.PI), this.canvas.closePath(), this.canvas.fill()
  }
  if ("Four_Voids" == this.layout) {
    this.buffer.drawImage(this.canvasElem, 0, 0, stage.w, stage.h), this.canvas.clearRect(0, 0, stage.w, stage.h);
    let s = this.gridSize % 2 == 0,
      tx = Math.round(stage.w / this.gridCols),
      ty = Math.round(stage.h / this.gridRows),
      t = Math.min(tx, ty),
      a = this.gridSize / this.gridRealMax,
      i = Math.round(.25 * this.gridSize * a);
    this.canvas.fillStyle = "white";
    let e = i * t / 2;
    0 == s ? e < t / 6.66666 && (e = t / 6.66666) : e < t / 4 && (e = t / 4);
    let k = Math.round(this.gridSize / 4);
    0 == s && (k = Math.round(this.gridSize / 3.333333333));
    let h = tx * k,
      v = ty * k;
    this.canvas.beginPath(), this.canvas.ellipse(h, v, e, e, Math.PI, 0, 2 * Math.PI), this.canvas.ellipse(stage.w - h, v, e, e, Math.PI, 0, 2 * Math.PI), this.canvas.closePath(), this.canvas.fill(), this.canvas.beginPath(), this.canvas.ellipse(h, stage.h - v, e, e, Math.PI, 0, 2 * Math.PI), this.canvas.ellipse(stage.w - h, stage.h - v, e, e, Math.PI, 0, 2 * Math.PI), this.canvas.fill()
  }
  if ("Diagonal_Passage_1" == this.layout) {
    this.buffer.drawImage(this.canvasElem, 0, 0, stage.w, stage.h), this.canvas.clearRect(0, 0, stage.w, stage.h);
    let s = 1.4;
    this.canvas.drawImage(this.bufferElem, stage.w - stage.w * s / 2, stage.h - stage.h * s / 2, stage.w * s, stage.h * s), this.canvas.drawImage(this.bufferElem, 0 - stage.w * s / 2, 0 - stage.h * s / 2, stage.w * s, stage.h * s)
  }
  if ("Diagonal_Passage_2" == this.layout) {
    this.buffer.drawImage(this.canvasElem, 0, 0, stage.w, stage.h), this.canvas.clearRect(0, 0, stage.w, stage.h);
    let s = 1.4;
    this.canvas.drawImage(this.bufferElem, stage.w - stage.w * s / 2, 0 - stage.h * s / 2, stage.w * s, stage.h * s), this.canvas.drawImage(this.bufferElem, 0 - stage.w * s / 2, stage.h - stage.h * s / 2, stage.w * s, stage.h * s)
  }
};
