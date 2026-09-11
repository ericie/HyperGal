var textWidth, textCanvas, textFont, letterPercent, fontPath = "",
  fontName = "",
  textFontLoaded = !1;

function TextRender(t) {
  this.canvas = t.buffer, this.textBaseline = 450, this.textPad = 50, this.layout = !1, this.color = t.colors.highlight.color, this.drawn = !1, wordList = ["HOPE", "LOVE", "GIVE", "MAKE", "GROW", "LIVE"];
  const e = Math.floor(fxrand() * wordList.length);
  this.word = wordList[e], this.resetLayout = !0, this.prep = !0, this.pickLayout()
}
TextRender.prototype.getWord = function() {
  return this.word
}, TextRender.prototype.getLayout = function() {
  return this.layoutName
}, TextRender.prototype.pickLayout = function() {
  if (layoutOptions = [{
      id: "top",
      percent: .2,
      name: "Top"
    }, {
      id: "center",
      percent: .2,
      name: "Center"
    }, {
      id: "bottom",
      percent: .2,
      name: "Bottom"
    }, {
      id: "centerPlus",
      percent: .35,
      name: "Center Plus"
    }, {
      id: "bigFour",
      percent: .5,
      name: "Big Four Letters"
    }, {
      id: "diagonalTLBR",
      percent: .3,
      name: "Diagonal Top Left"
    }, {
      id: "diagonalBLTR",
      percent: .3,
      name: "Diagonal Bottom Left"
    }, {
      id: "vertical0",
      percent: .25,
      name: "Vertical Left"
    }, {
      id: "vertical1",
      percent: .25,
      name: "Vertical Center"
    }, {
      id: "vertical2",
      percent: .25,
      name: "Vertical Right"
    }, {
      id: "repeater",
      percent: .55,
      name: "Repeat Twice"
    }], this.resetLayout) {
    let t = Math.floor(fxrand() * layoutOptions.length);
    this.layout = layoutOptions[t].id, this.layoutName = layoutOptions[t].name, letterPercent = layoutOptions[t].percent, this.resetLayout = !1
  }
  this.prep || (this.canvas.clearRect(0, 0, stage.w, stage.h), this.draw(), this.resetLayout = !0), this.prep = !1
}, TextRender.prototype.fontLoaded = function() {
  return textFontLoaded
}, TextRender.prototype.firstDraw = function() {
  return this.drawn
}, TextRender.prototype.draw = function() {
  1 == textFontLoaded && (this.drawn = !0, this.canvas.fillStyle = this.color, this.canvas.font = "600px " + textFont.family, this.myText = this.word, "top" == this.layout ? (this.canvas.font = "500px " + textFont.family, this.canvas.fillText(this.myText[0], stage.w / 2 - 740, stage.h * 600 / 1920), this.canvas.fillText(this.myText[1], stage.w / 2 - 340, stage.h * 600 / 1920), this.canvas.fillText(this.myText[2], stage.w / 2 + 60, stage.h * 600 / 1920), this.canvas.fillText(this.myText[3], stage.w / 2 + 460, stage.h * 600 / 1920)) : "repeater" == this.layout ? (this.canvas.font = "700px " + textFont.family, this.canvas.fillText(this.myText, stage.w / 2 - 860, stage.h * 800 / 1920), this.canvas.fillText(this.myText, stage.w / 2 - 860, stage.h * 1600 / 1920)) : "centerPlus" == this.layout ? (this.canvas.fillText(this.myText[0], 240, stage.h / 2 + this.textBaseline / 2), this.canvas.fillText(this.myText[1], stage.w / 2 - this.textBaseline / 2 + 50, stage.h / 2 - this.textBaseline / 2 + 140), this.canvas.fillText(this.myText[2], stage.w / 2 - this.textBaseline / 2, stage.h / 2 + this.textBaseline + 60), this.canvas.fillText(this.myText[3], stage.w - this.textBaseline - 200, stage.h / 2 + this.textBaseline / 2)) : "center" == this.layout ? (this.canvas.fillText(this.myText[0], stage.w / 2 - 750, stage.h / 2 + this.textBaseline / 2), this.canvas.fillText(this.myText[1], stage.w / 2 - 375, stage.h / 2 + this.textBaseline / 2), this.canvas.fillText(this.myText[2], stage.w / 2 + 25, stage.h / 2 + this.textBaseline / 2), this.canvas.fillText(this.myText[3], stage.w / 2 + 400, stage.h / 2 + this.textBaseline / 2)) : "vertical0" == this.layout ? (this.canvas.font = "500px " + textFont.family, this.canvas.fillText(this.myText[0], stage.w / 2 - 500, stage.h / 2 + this.textBaseline / 2 - 740), this.canvas.fillText(this.myText[1], stage.w / 2 - 500, stage.h / 2 + this.textBaseline / 2 - 270), this.canvas.fillText(this.myText[2], stage.w / 2 - 500, stage.h / 2 + this.textBaseline / 2 + 200), this.canvas.fillText(this.myText[3], stage.w / 2 - 500, stage.h / 2 + this.textBaseline / 2 + 650)) : "vertical1" == this.layout ? (this.canvas.font = "500px " + textFont.family, this.canvas.fillText(this.myText[0], stage.w / 2 - 150, stage.h / 2 + this.textBaseline / 2 - 740), this.canvas.fillText(this.myText[1], stage.w / 2 - 150, stage.h / 2 + this.textBaseline / 2 - 270), this.canvas.fillText(this.myText[2], stage.w / 2 - 150, stage.h / 2 + this.textBaseline / 2 + 200), this.canvas.fillText(this.myText[3], stage.w / 2 - 150, stage.h / 2 + this.textBaseline / 2 + 650)) : "vertical2" == this.layout ? (this.canvas.font = "500px " + textFont.family, this.canvas.fillText(this.myText[0], stage.w / 2 + 250, stage.h / 2 + this.textBaseline / 2 - 749), this.canvas.fillText(this.myText[1], stage.w / 2 + 250, stage.h / 2 + this.textBaseline / 2 - 270), this.canvas.fillText(this.myText[2], stage.w / 2 + 250, stage.h / 2 + this.textBaseline / 2 + 200), this.canvas.fillText(this.myText[3], stage.w / 2 + 250, stage.h / 2 + this.textBaseline / 2 + 650)) : "diagonalTLBR" == this.layout ? (this.canvas.fillText(this.myText[0], stage.w / 2 - 800, stage.h / 2 + this.textBaseline / 2 - 600), this.canvas.fillText(this.myText[1], stage.w / 2 - 400, stage.h / 2 + this.textBaseline / 2 - 200), this.canvas.fillText(this.myText[2], stage.w / 2 + 0, stage.h / 2 + this.textBaseline / 2 + 200), this.canvas.fillText(this.myText[3], stage.w / 2 + 400, stage.h / 2 + this.textBaseline / 2 + 600)) : "diagonalBLTR" == this.layout ? (this.canvas.fillText(this.myText[0], stage.w / 2 - 800, stage.h / 2 + this.textBaseline / 2 + 600), this.canvas.fillText(this.myText[1], stage.w / 2 - 400, stage.h / 2 + this.textBaseline / 2 + 200), this.canvas.fillText(this.myText[2], stage.w / 2 + 0, stage.h / 2 + this.textBaseline / 2 - 200), this.canvas.fillText(this.myText[3], stage.w / 2 + 400, stage.h / 2 + this.textBaseline / 2 - 600)) : "bigFour" == this.layout ? (this.canvas.font = "1000px " + textFont.family, this.canvas.fillText(this.myText[0], stage.w / 2 - 700, stage.h / 2 + this.textBaseline / 2 - 350), this.canvas.fillText(this.myText[1], stage.w / 2 + 100, stage.h / 2 + this.textBaseline / 2 - 350), this.canvas.fillText(this.myText[2], stage.w / 2 - 700, stage.h / 2 + this.textBaseline / 2 + 550), this.canvas.fillText(this.myText[3], stage.w / 2 + 100, stage.h / 2 + this.textBaseline / 2 + 550)) : "bottom" == this.layout && (this.canvas.font = "500px " + textFont.family, this.canvas.fillText(this.myText[0], stage.w / 2 - 740, stage.h * 1700 / 1920), this.canvas.fillText(this.myText[1], stage.w / 2 - 340, stage.h * 1700 / 1920), this.canvas.fillText(this.myText[2], stage.w / 2 + 60, stage.h * 1700 / 1920), this.canvas.fillText(this.myText[3], stage.w / 2 + 460, stage.h * 1700 / 1920)))
}, (textFont = new FontFace("Space Mono", 'url("assets/Space_Mono/SpaceMono-Regular.ttf")')).load().then((function(t) {
  document.fonts.add(t), textFontLoaded = !0
}), (t => {
  console.error(t)
}));
