function RenderQueue(e) {
  this.queue = [], this.shadow = {
    offset: {
      x: 8,
      y: 8
    },
    position: {},
    alpha: .4,
    scale: 1.05,
    color: "rgba(0,0,0,.2)",
    steps: 2
  }, this.texture01 = new TextureObject({
    type: "lineSimple"
  }), this.texture02 = new TextureObject({
    type: "lineSpray"
  }), this.texture03 = new TextureObject({
    type: "circleGrid"
  }), this.texture04 = new TextureObject({
    type: "spray"
  }), this.texture05 = new TextureObject({
    type: "lineGrid"
  }), this.textureList = [this.makeTexture({
    canvas: e.canvas,
    texture: this.texture01
  }), this.makeTexture({
    canvas: e.canvas,
    texture: this.texture02
  }), this.makeTexture({
    canvas: e.canvas,
    texture: this.texture03
  }), this.makeTexture({
    canvas: e.canvas,
    texture: this.texture04
  }), this.makeTexture({
    canvas: e.canvas,
    texture: this.texture05
  })]
}
RenderQueue.prototype.getExample = function() {
  return {
    type: "simpleCircle",
    canvas: "canvas Object",
    width: 100,
    position: {
      x: 100,
      y: 100
    },
    color: "rgba(255,155,100,1)",
    shadow: !0,
    texture: !0,
    textureNumber: 1,
    opacity: 1,
    string: "TEST",
    effect: "source-over"
  }
}, RenderQueue.prototype.add = function(e) {
  this.queue.push(e)
}, RenderQueue.prototype.update = function() {
  for (let e = 0; e < this.queue.length; e++) {
    const t = this.queue[e];
    this[t.type](t)
  }
  this.queue = []
}, RenderQueue.prototype.makeTexture = function(e) {
  return e.canvas.createPattern(e.texture.getElem(), "repeat")
}, RenderQueue.prototype.drawCircle = function(e) {
  let t = e.canvas,
    i = this.shadow;
  if (t.save(), t.translate(e.position.x, e.position.y), t.rotate(e.rotation * Math.PI / 180), e.position = {
      x: 0,
      y: 0
    }, 1 == e.shadow) {
    let a = i.offset.x / i.steps,
      s = i.offset.y / i.steps,
      o = i.alpha / i.steps,
      r = 1 * e.width;
    for (let l = 0; l < i.steps; l++) t.fillStyle = `rgba(0,0,0,${o})`, t.beginPath(), t.arc(e.position.x + a * l, e.position.y + s * l, r, 0, 2 * Math.PI), t.closePath(), t.fill()
  }
  t.fillStyle = e.color, t.beginPath(), t.arc(e.position.x, e.position.y, e.width, 0, 2 * Math.PI), t.closePath(), t.fill(), 1 == e.texture && (t.fillStyle = this.textureList[e.textureNumber], t.globalAlpha = .25, t.beginPath(), t.arc(e.position.x, e.position.y, e.width, 0, 2 * Math.PI), t.closePath(), t.fill(), t.globalAlpha = 1), t.restore()
}, RenderQueue.prototype.drawRect = function(e) {
  let t = e.canvas,
    i = this.shadow;
  t.save(), t.translate(e.position.x, e.position.y), t.rotate(e.rotation * Math.PI / 180), e.position = {
    x: 0,
    y: 0
  };
  let a = {
    x: e.position.x - e.width / 2,
    y: e.position.y - e.height
  };
  if (1 == e.shadow) {
    let s = i.offset.x / i.steps,
      o = i.offset.y / i.steps,
      r = i.alpha / i.steps,
      l = e.height * i.scale,
      n = e.width * i.scale;
    for (let e = 0; e < i.steps; e++) t.fillStyle = `rgba(0,0,0,${r})`, t.beginPath(), t.rect(a.x + s * e, a.y + o * e, n, l), t.closePath(), t.fill()
  }
  t.fillStyle = e.color, t.beginPath(), t.rect(a.x, a.y, e.width, e.height), t.closePath(), t.fill(), 1 == e.texture && (t.fillStyle = this.textureList[e.textureNumber], t.globalAlpha = .15, t.beginPath(), t.rect(a.x, a.y, e.width, e.height), t.closePath(), t.fill(), t.globalAlpha = 1), t.restore()
}, RenderQueue.prototype.drawTriangle = function(e) {
  let t = e.canvas,
    i = this.shadow;
  t.save(), t.translate(e.position.x, e.position.y), e.position.x = 0, e.position.y = 0, t.rotate(e.rotation * Math.PI / 180);
  let a = {
      x: e.position.x,
      y: e.position.y - e.height / 2
    },
    s = {
      x: e.position.x - e.width / 2,
      y: e.position.y + e.height / 2
    },
    o = {
      x: e.position.x + e.width / 2,
      y: e.position.y + e.height / 2
    };
  if (1 == e.shadow) {
    let e = i.offset.x / i.steps,
      r = i.offset.y / i.steps,
      l = i.alpha / i.steps;
    for (let n = 0; n < i.steps; n++) t.fillStyle = `rgba(0,0,0,${l})`, t.beginPath(), t.moveTo(a.x + e * n, a.y + r * n), t.lineTo(s.x + e * n, s.y + r * n), t.lineTo(o.x + e * n, o.y + r * n), t.closePath(), t.fill()
  }
  t.fillStyle = e.color, t.beginPath(), t.moveTo(a.x, a.y), t.lineTo(s.x, s.y), t.lineTo(o.x, o.y), t.closePath(), t.fill(), 1 == e.texture && (t.fillStyle = this.textureList[e.textureNumber], t.globalAlpha = .15, t.beginPath(), t.moveTo(a.x, a.y), t.lineTo(s.x, s.y), t.lineTo(o.x, o.y), t.closePath(), t.fill(), t.globalAlpha = 1), t.restore()
}, RenderQueue.prototype.clear = function(e) {
  e.canvas.clearRect(0, 0, stage.w, stage.h)
}, RenderQueue.prototype.updateBG = function(e) {
  e.canvas.clearRect(0, 0, stage.w, stage.h), e.canvas.drawImage(e.bgElem, 0, 0, stage.w, stage.h)
}, RenderQueue.prototype.composite = function(e) {
  e.canvas.clearRect(0, 0, stage.w, stage.h), e.canvas.drawImage(e.bgElem, 0, 0, stage.w, stage.h), e.canvas.drawImage(e.sourceElem, 0, 0, stage.w, stage.h)
};
