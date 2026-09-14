let comp, compElem, buffer, bufferElem, bg, fg, bgElem, fgElem, params, obstacle;
var strategy, preySystem, predatorSystem, textRender, obsWidth = 300,
  stage = {
    w: 2920,
    h: 2920,
    scale: 1
  },
  centerPoint = {
    x: stage.w / 2,
    y: stage.h / 2
  };
let texture, layoutTime, layoutMaxTime, layoutPauseTime, renderQueue, request, featureList = {};

function init(e) {
  compElem = document.getElementById("hmcComp"), bufferElem = document.getElementById("hmcBuffer"), bgElem = document.getElementById("hmcBackground"), comp = compElem.getContext("2d"), buffer = bufferElem.getContext("2d"), bg = bgElem.getContext("2d"), stage.w = e.w, stage.h = e.h, stage.scale = e.scale || 1, comp.setTransform(stage.scale, 0, 0, stage.scale, 0, 0), buffer.setTransform(stage.scale, 0, 0, stage.scale, 0, 0), bg.setTransform(stage.scale, 0, 0, stage.scale, 0, 0), layoutMaxTime = 1600, layoutPauseTime = 1e3, layoutTime = Math.round(.8 * (layoutMaxTime + layoutPauseTime));
  const t = Math.round(fxrand() * (palletList.length - 1));
  let a = palletList[t];
  texture = new TextureObject({
    type: "lineSimple"
  }), renderQueue = new RenderQueue({
    stage,
    canvas: comp
  });
  let n = [{
      id: "even",
      name: "Even Mix"
    }, {
      id: "even",
      name: "Even Mix"
    }, {
      id: "even",
      name: "Even Mix"
    }, {
      id: "all-circles",
      name: "All Circles"
    }, {
      id: "all-triangles",
      name: "All Triangles"
    }, {
      id: "all-rectangles",
      name: "All Rectangles"
    }, {
      id: "right-angles",
      name: "Right Angles"
    }],
    r = n[Math.round(fxrand() * (n.length - 1))],
    m = n[Math.round(fxrand() * (n.length - 1))];
  this.systemParams = {
    comp,
    bg,
    buffer,
    bufferElem,
    growthType: "fill",
    size: 500,
    sizeMin: 30,
    sizeMax: 80,
    variance: "extreme",
    thicknessMin: .5,
    thicknessMax: 4,
    fade: .75,
    distanceMax: 800,
    compositeCall: updateBG,
    renderQueue,
    colors: a,
    bgShapeMix: r.id,
    wordShapeMix: m.id
  }, bg.fillStyle = a.background.color, bg.fillRect(0, 0, stage.w, stage.h), textRender = new TextRender(this.systemParams);
  let s = document.getElementById("library"),
    i = document.createElement("canvas"),
    l,
    o = "layer_0";
  i.setAttribute("id", o), i.setAttribute("height", Math.max(1, Math.round(stage.h * stage.scale))), i.setAttribute("width", Math.max(1, Math.round(stage.w * stage.scale))), s.appendChild(i), l = i.getContext("2d"), l.setTransform(stage.scale, 0, 0, stage.scale, 0, 0);
  let u = {
    id: o,
    elem: i,
    canvas: l
  };
  this.systemParams.myLayer = l, this.systemParams.layerObj = u, this.newSystem = new PreySystem(this.systemParams), this.newSystem.init(stage, a), featureList.pallet = a.name, featureList.word = textRender.getWord(), featureList.posterLayout = textRender.getLayout(), featureList.bgShapes = r.name, featureList.wordShapes = m.name, addFeatures(featureList), request = requestAnimationFrame(performAnimation)
}
const performAnimation = () => {
  update(), request = requestAnimationFrame(performAnimation)
};

function update(present = !0) {
  layoutTime++, layoutTime > layoutMaxTime && layoutTime < layoutMaxTime + 2 && this.newSystem.setEraserMode(), layoutTime > layoutMaxTime + layoutPauseTime && (textRender.pickLayout(), this.newSystem.resetWordList(), layoutTime = 0, textRender.draw()), this.newSystem.update(), this.newSystem.draw(), renderQueue.update(), present && composite()
}

function updateBG() {
  renderQueue.add({
    type: "updateBG",
    canvas: comp,
    bgElem,
    sourceElem: bgElem
  })
}

function composite() {
  comp.clearRect(0, 0, stage.w, stage.h), comp.drawImage(bgElem, 0, 0, stage.w, stage.h);
  let e = this.newSystem.layerObj.elem;
  comp.drawImage(e, 0, 0, stage.w, stage.h), textRender.fontLoaded() && !textRender.firstDraw() && textRender.draw()
}

function colorToObj(e) {
  let t = e,
    a = ["red", "green", "blue", "alpha"],
    n = t.slice(t.indexOf("(") + 1, t.indexOf(")")).split(", "),
    r = new Object;
  return n.forEach(((e, t) => {
    r[a[t]] = e
  })), r
}
