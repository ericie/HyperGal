// Patchwork Geometry — Eric Ishii Eckhardt, 2023, for HyperMedia Club.
// Ported from the fxhash package PatchworkGeom. The drawing code is the
// shipped version; setup() is split so a new hash can rebuild the quilt
// without tearing down the canvas. fxrand() is provided by index.html.

let config = {
  gridBorder: false,
  depthLayer: false,
  depthLayerCount: 4,
  layoutType: "random",
  hSym: false, // add hSym property to config
  vSym: false, // add vSym property to config
  transitionType: "allFade", // add transitionType property to config
}

let backgroundColor;
let strokeColor;
let offscreenCanvas;
let layer2Color, layer1Color;
let hSym, vSym;
let transitionType;
let gridUpdated = false;
let changeSpeed = "slow";
let cycleTime, changePerc;
let mainCanvas;
let paused = false;

function preload() {
  // colorPalette = loadJSON("colors.json");
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas(mainCanvas, 'PatchworkGeom', 'jpg');
  }
  if (key === 'p' || key === 'P') {
    paused = !paused;
  }
  if (key === 'r' || key === 'R' || key === ' ' || keyCode === ENTER) {
    newQuilt();
  }
}

function mousePressed() {
  newQuilt();
}

// A new hash, then rebuild. The canvas and the draw loop keep running.
function newQuilt() {
  window.reseed();
  gridUpdated = false;
  buildQuilt();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) redraw();
}





function setup() {
  mainCanvas = createCanvas(windowWidth, windowHeight);
  offscreenCanvas = createGraphics(windowWidth, windowHeight);
  mainCanvas.canvas.setAttribute('tabindex', '0');
  mainCanvas.canvas.setAttribute('aria-describedby', 'instructions');
  mainCanvas.canvas.setAttribute(
    'aria-label',
    'Patchwork Geometry: a mirrored quilt of triangles and bars that continually re-pieces itself.'
  );

  buildQuilt();

  // A static quilt for anyone who has asked not to see motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) noLoop();
}

// Everything that depends on the hash. Called again on reseed, so the canvas
// itself is never rebuilt. preSetUpGrid() stays the first fxrand() consumer,
// which keeps the random sequence identical to the shipped build.
function buildQuilt() {
  preSetUpGrid();

  setSymmetry();
  setTransitionType();

  // hSym = true;
  // vSym = true;

  config.hSym = hSym;
  config.vSym = vSym;
  config.transitionType = transitionType;

  setColors();
  calculateGrid();
  noStroke();
  strokeCap(SQUARE);
  setUpGrid(hSym, vSym);

  let strokeColorColor = color(strokeColor[0],strokeColor[1],strokeColor[2]);
  let bgColorColor = color(backgroundColor[0],backgroundColor[1],backgroundColor[2]);
  
  layer1Color = lerpColor(bgColorColor, strokeColorColor, .33);
  layer2Color = lerpColor(bgColorColor, strokeColorColor, .66);

  setUpParticles();
  background(backgroundColor);

  // Set Visible Properties
  // window.$fxhashFeatures = {
  //   symmetry:null,
  //   gridSize:null,
  //   colorPallet:null,
  //   refreshSpeed:null,
  //   refreshStyle:null
  // }
  window.$fxhashFeatures = {
    symmetry:null,
    gridSize:null,
    colorPallet:null,
    refreshSpeed:null,
    refreshStyle:null
  }

  // SYMMETRY
  if (hSym && vSym) {
    window.$fxhashFeatures.symmetry = "both";
  } else if (hSym) {
    window.$fxhashFeatures.symmetry = "horizontal";
  } else if (vSym) {
    window.$fxhashFeatures.symmetry = "vertical";
  } else {
    window.$fxhashFeatures.symmetry = "none";
  }
  
  window.$fxhashFeatures.gridSize = gridWidth;
  window.$fxhashFeatures.colorPallet = chosenPalette.name;
  window.$fxhashFeatures.refreshSpeed = cycleSpeed;
  window.$fxhashFeatures.refreshStyle = transitionType;

  if (transitionType =="fadingLayers"){
    window.$fxhashFeatures.colorPallet = "everthing";
  }
  if (window.debugMode) console.log(window.fxhash, window.$fxhashFeatures);
}

// New function to randomly set hSym and vSym
function setSymmetry() {
  hSym = EeRandom([true, false]);
  vSym = EeRandom([true, false]);
}

// New function to randomly set the transition type
function setTransitionType() {
  let animations = ["fade", "snap", "rando", "stack"];
  animType = EeRandom(animations);


  let transitions = ["allFade", "cursorWipe", "randomBits", "stackingLayers","fadingLayers"];
  transitionType = EeRandom(transitions);

  let cycleSpeeds = ["verySlow", "slow", "normal", "fast", "veryFast"];
  cycleSpeed = EeRandom(cycleSpeeds);

  switch(cycleSpeed) {
    case "verySlow":
      cycleTime = 110;
      if (transitionType =="cursorWipe"){ cycleTime = 60; }
      break;
    case "slow":
      cycleTime = 80;
      if (transitionType =="cursorWipe"){ cycleTime = 50; }
      break;
    case "normal":
      cycleTime = 50;
      if (transitionType =="cursorWipe"){ cycleTime = 15; }
      break;
    case "fast":
      cycleTime = 7;
      if (transitionType =="fadingLayers"){
        cycleTime = 35;
      }
      break;
    case "veryFast":
      cycleTime = 7;
      if (transitionType =="cursorWipe"){ cycleTime = 2; }
      if (transitionType =="fadingLayers"){ cycleTime = 25;}
      break;
    default:
      cycleTime = 50;
      break;
  }

  let changeVolumeType = ["little", "normal", "alot"];
  changePerc = EeRandom(changeVolumeType);

  switch(changeVolumeType) {
    case "little":
      changePerc = .01;
      break;
    case "normal":
      changePerc = .05;
      break;
    case "alot":
      changePerc = .1;
      break;
    default:
      changePerc = .05;
      break;
  }

  
}


function draw() {
  // background(backgroundColor);
  // background(255,255,255,10);
  // let backgroundColor = color(255, 0, 0); // create a color variable
  // let bgFade = color(red(backgroundColor), green(backgroundColor), blue(backgroundColor), 10); // add an alpha value of 50
  // background(bgFade);
  // blendMode(BLEND);

  if (transitionType && transitionType != "stackingLayers"){
    colorMode(RGB, 255);
    let bgFade = color(backgroundColor);
    bgFade.setAlpha(EeRandom(23,33));
    background(bgFade);
  }

  // fill(bgFade);
  // rect(0, 0, windowWidth, windowHeight);

  // updateParticles();
  
  offscreenCanvas.clear();
  // if (gridUpdated != true){
    updateGrid(0, offscreenCanvas);
    gridUpdated = true;
  // }

  if (config.depthLayer == true){
    tint(layer1Color);
    image(offscreenCanvas, 4, 10);
    tint(layer2Color);
    image(offscreenCanvas, 2, 5);
  }
  tint(strokeColor[0],strokeColor[1],strokeColor[2]);
  image(offscreenCanvas, 0, 0);

}

function calculateGrid() {
  cellSize = width / gridWidth;
  // gridHeight = ceil(height / cellSize);
  gridHeight = ceil(height / cellSize / 2) * 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateGrid();
}

//  {name: "halfCircleLeft", path: function(){arc(0, 50, 50, 50, -HALF_PI, HALF_PI)}},
// {name: "halfCircleRight", path: function(){arc(100, 50, 50, 50, HALF_PI, -HALF_PI)}},


class Particle {
  constructor() {
    this.x = EeRandom(width);
    this.y = EeRandom(-height, -50);
    this.h = EeRandom(50)+50;
    this.speed = EeRandom(3, 6);
  }

  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = EeRandom(-height, -50);
      this.x = EeRandom(width);
    }
  }

  show() {
    strokeWeight(cellSize/10);
    // stroke([255, 255, 255,50]);
    stroke(layer1Color);
    line(this.x, this.y, this.x, this.y + this.h);
    strokeWeight(0);
  }
}

let firstRandom = EeRandom();
function EeRandom(a, b) {
  // try {
  //   let testRand = fxrand();
  //   console.log("FX Rand available",testRand);
  // } 
  // catch(err) {
  //   console.log("No FX Rand available");
  // }

  // if (a instanceof Array) {
  //   return a[Math.floor(Math.random() * a.length)];
  // } else if (typeof a === 'undefined') {
  //   return Math.random();
  // } else if (typeof b === 'undefined') {
  //   return Math.random() * a;
  // } else {
  //   return a + Math.random() * (b - a);
  // }

  if (a instanceof Array) {
    return a[Math.floor(fxrand() * a.length)];
  } else if (typeof a === 'undefined') {
    return fxrand();
  } else if (typeof b === 'undefined') {
    return fxrand() * a;
  } else {
    return a + fxrand() * (b - a);
  }

}