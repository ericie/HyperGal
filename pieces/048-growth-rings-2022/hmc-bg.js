function bgGrid() {}
bgGrid.prototype.init = function(t) {
  this.cols = t.cols, this.rows = t.rows, this.stage = t.stage, this.canvas = t.canvas, this.canvasElem = t.canvasElem, this.background = t.background, this.buffer = t.buffer, this.fillEasy = "rbga(0,0,0,0)", this.fillMid = "rbga(0,0,0,.15)", this.fillHard = "rbga(0,0,0,.3)", this.filled = !1, this.cellWidth = this.stage.w / this.cols, this.cellHeight = this.stage.h / this.rows, this.grid = [], this.fillGrid = [], this.cutPos = 0;
  for (let t = 0; t < this.rows; t++) {
    let t = [],
      i = [];
    for (let l = 0; l < this.cols; l++) {
      let l = Math.floor(3 * fxrand());
      t.push(l), i.push(1)
    }
    this.grid.push(t), this.fillGrid.push(i)
  }
}, bgGrid.prototype.findPoint = function(t) {}, bgGrid.prototype.scatterFill = function(t) {
  this.canvasElem = t.circle.elem;
  let i = Math.floor(fxrand() * this.fillGrid.length),
    l = this.fillGrid[i],
    s = Math.floor(fxrand() * l.length),
    h = Math.floor(4 * fxrand());
  0 != this.fillGrid[i][s] && (this.fillCell(i, s, h), this.fillGrid[i][s] = 0);
  let e = 0;
  for (let t = 0; t < this.fillGrid.length; t++) {
    let i = this.fillGrid[t];
    for (let t = 0; t < i.length; t++) e += i[t]
  }
  0 == e && (this.filled = !0)
};
const cutOrder = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
bgGrid.prototype.fillCell = function(t, i, l) {
  let s = t,
    h = i,
    e = this.cutPos;
  this.cutPos++, this.cutPos > 3 && (this.cutPos = 0);
  let r = this.grid[s][h];
  this.background.fillStyle = 0 == r ? "rgba(0,0,0,.2)" : 1 == r ? "rgba(0,0,0,.1)" : 2 == r ? "rgba(0,0,0,.3)" : "red", mySquare = {
    x: h * this.cellWidth,
    y: s * this.cellHeight
  }, this.background.fillRect(mySquare.x, mySquare.y, this.cellWidth, this.cellHeight);
  let o = 20 * fxrand(),
    c = 960 - this.cellWidth - o,
    a = 960 - this.cellHeight - o;
  const d = stage.w / 2,
    f = stage.h / 2;
  0 == e && (c = d - this.cellWidth - o, a = f - this.cellHeight - o), 1 == e && (c = d + o, a = f - this.cellHeight - o), 2 == e && (c = d - this.cellWidth - o, a = f + o), 3 == e && (c = d + o, a = f + o);
  const g = this.cellWidth,
    n = this.cellHeight,
    u = mySquare.y,
    b = mySquare.x,
    p = this.cellWidth,
    y = this.cellHeight;
  this.background.drawImage(this.canvasElem, c, a, g, n, b, u, p, y)
}, bgGrid.prototype.drawGrid = function() {
  console.log("DRAW IT!"), this.cutPos = 0
};
