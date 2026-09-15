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
let texture, layoutTime, layoutMaxTime, layoutPauseTime, renderQueue, request, lastAnimationTime = 0, performanceBadge, performanceWindowStart = 0, performanceFrameCount = 0, performanceUpdateTime = 0, featureList = {};

function init(e) {
  compElem = document.getElementById("hmcComp"), bufferElem = document.getElementById("hmcBuffer"), bgElem = document.getElementById("hmcBackground"), comp = compElem.getContext("2d"), buffer = bufferElem.getContext("2d"), bg = bgElem.getContext("2d"), stage.w = e.w, stage.h = e.h, stage.scale = e.scale || 1, stage.frameStep = e.frameStep || 1, lastAnimationTime = 0, performanceBadge = document.getElementById("buildBadge"), performanceWindowStart = 0, performanceFrameCount = 0, performanceUpdateTime = 0, comp.setTransform(stage.scale, 0, 0, stage.scale, 0, 0), buffer.setTransform(stage.scale, 0, 0, stage.scale, 0, 0), bg.setTransform(stage.scale, 0, 0, stage.scale, 0, 0), layoutMaxTime = 1600, layoutPauseTime = 1e3, layoutTime = Math.round(.8 * (layoutMaxTime + layoutPauseTime));
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
  let i = document.getElementById("hmcLive"),
    l = i.getContext("2d"),
    o = "hmcLive";
  l.setTransform(stage.scale, 0, 0, stage.scale, 0, 0);
  let u = {
    id: o,
    elem: i,
    canvas: l
  };
  this.systemParams.myLayer = l, this.systemParams.layerObj = u, this.newSystem = new PreySystem(this.systemParams), this.newSystem.init(stage, a), featureList.pallet = a.name, featureList.word = textRender.getWord(), featureList.posterLayout = textRender.getLayout(), featureList.bgShapes = r.name, featureList.wordShapes = m.name, addFeatures(featureList)
}
const performAnimation = e => {
  const t = stage.frameStep || 1,
    a = 1e3 / 60 * t;
  if (0 == lastAnimationTime || e - lastAnimationTime >= a - 1) {
    lastAnimationTime = e;
    const a = performance.now();
    update(!1, t), reportPerformance(e, performance.now() - a)
  }
  request = requestAnimationFrame(performAnimation)
};

function reportPerformance(t, e) {
  0 == performanceWindowStart && (performanceWindowStart = t), performanceFrameCount++, performanceUpdateTime += e;
  const a = t - performanceWindowStart;
  if (a >= 1e3 && performanceBadge) {
    const t = Math.round(1e3 * performanceFrameCount / a),
      e = (performanceUpdateTime / performanceFrameCount).toFixed(1);
    performanceBadge.textContent = `PP PERF TEST · v5.1 · ${t} FPS · ${e} MS`, performanceBadge.dataset.fps = t, performanceBadge.dataset.updateMs = e, performanceWindowStart = 0, performanceFrameCount = 0, performanceUpdateTime = 0
  }
}

function startAnimation() {
  lastAnimationTime = 0, request = requestAnimationFrame(performAnimation)
}

function bakeLiveLayer(liveShapeLimit) {
  const liveLayer = this.newSystem.layerObj.elem;
  bg.drawImage(liveLayer, 0, 0, stage.w, stage.h), this.newSystem.canvas.clearRect(0, 0, stage.w, stage.h), this.newSystem.reduceToLiveShapeLimit(liveShapeLimit), this.newSystem.enableIncrementalRendering(3)
}

function update(present = !0, frameStep = 1, renderLive = !0) {
  const e = layoutTime;
  layoutTime += frameStep, e <= layoutMaxTime && layoutTime > layoutMaxTime && this.newSystem.setEraserMode(), layoutTime > layoutMaxTime + layoutPauseTime && (textRender.pickLayout(), this.newSystem.resetWordList(), layoutTime = 0, textRender.draw()), this.newSystem.update(frameStep), this.newSystem.draw(frameStep, renderLive), renderQueue.update(), textRender.fontLoaded() && !textRender.firstDraw() && textRender.draw(), present && composite()
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
  comp.drawImage(e, 0, 0, stage.w, stage.h)
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
