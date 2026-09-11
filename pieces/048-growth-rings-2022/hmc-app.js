let comp, compElem, buffer, bufferElem, bg, fg, bgElem, fgElem, params, obstacle;
var strategy, preySystem, predatorSystem, bgGrid, growthCircle, obsWidth = 300,
  stage = {
    w: 1920,
    h: 1920
  },
  centerPoint = {
    x: stage.w / 2,
    y: stage.h / 2
  };

function init(e, t) {
  comp = document.getElementById("hmcComp").getContext("2d"), compElem = document.getElementById("hmcComp"), stage.w = compElem.width, stage.h = compElem.height, buffer = document.getElementById("hmcBuffer").getContext("2d"), bufferElem = document.getElementById("hmcBuffer"), bg = document.getElementById("hmcBackground").getContext("2d"), bgElem = document.getElementById("hmcBackground"), fg = document.getElementById("hmcForeground").getContext("2d"), fgElem = document.getElementById("hmcForeground");
  const a = Math.round(fxrand() * (palletList.length - 1)),
    r = palletList[a],
    s = Math.floor(20 * fxrand()) + 3;
  this.layoutTypes = ["Center", "Center", "Center", "Center", "Center", "Spread", "Passage", "Void", "Joined", "Four_Voids", "Diagonal_Passage_1", "Diagonal_Passage_2"];
  const o = Math.floor(fxrand() * layoutTypes.length);
  let m = this.layoutTypes[o];
  window.$fxhashFeatures.pallet = r.name, window.$fxhashFeatures.foreground = m, window.$fxhashFeatures.gridSize = s, this.systemParams = {
    comp,
    canvas: comp,
    canvasElem: compElem,
    bg,
    fg,
    buffer,
    bufferElem,
    stage,
    growthType: "half",
    size: 30,
    sizeMin: 120,
    sizeMax: 280,
    colors: r,
    variance: "extreme",
    thicknessMin: 1,
    thicknessMax: 8,
    fade: .75,
    distanceMax: 800,
    seperate: !0,
    layout: m,
    gridSize: s,
    gridRealMax: 23,
    gridMin: 3
  }, (growthCircle = new GrowthCircle(this.systemParams)).init(), growthCircle.draw(), (bgGrid = new bgGrid).init({
    cols: s,
    rows: s,
    stage,
    canvas: comp,
    canvasElem: compElem,
    background: bg,
    buffer,
    bufferElem
  }), this.circleLayers = [];
  let i = document.getElementById("library");
  for (let e = 0; e < 10; e++) {
    let t = document.createElement("canvas"),
      a = t.getContext("2d"),
      r = "layerSlice_" + e;
    t.setAttribute("id", r), t.setAttribute("height", stage.w), t.setAttribute("width", stage.h), i.appendChild(t);
    let s = {
      id: r,
      elem: t,
      canvas: a
    };
    this.circleLayers.push(s), this.systemParams.comp = s.canvas, this.systemParams.seperate = !1, this.systemParams.layout = this.layoutTypes[0], (growthCircle = new GrowthCircle(this.systemParams)).init(), growthCircle.draw()
  }
  for (; 1 != bgGrid.filled;) {
    let e = Math.floor(fxrand() * this.circleLayers.length),
      t = this.circleLayers[e];
    bgGrid.scatterFill({
      circle: t
    })
  }
  composite()
}
let request;
const performAnimation = () => {
  update(), request = requestAnimationFrame(performAnimation)
};

function update() {}

function composite() {
  fg.drawImage(bgElem, 0, 0, stage.w, stage.h), fg.drawImage(compElem, 0, 0, stage.w, stage.h)
}
