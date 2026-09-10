const directionOptions = ["90", "45", "Noise", "Random", "Scribble"];

function weightedPick(optionsWithWeights) {
  const totalWeight = optionsWithWeights.reduce((sum, o) => sum + o.weight, 0);
  let r = $fx.rand() * totalWeight;
  for (let { value, weight } of optionsWithWeights) {
    if (r < weight) return value;
    r -= weight;
  }
}

$fx.params([
  {
    id: "evolutionDirection",
    name: "Evolution Direction",
    type: "select",
    // options: { options: ["Top-Down", "Bottom-Up", "Spiral-In", "Spiral-Out"] },
    options: { options: ["Top-Down", "Spiral-In"] },
  },
  {
    id: "layoutMode",
    name: "Layout Mode",
    type: "select",
    options: { options: ["Circle", "Square", "Diamond", "Triangle"] },
  },
  {
    id: "directionMode",
    name: "Direction Mode",
    type: "select",
    options: { options: ["90", "45", "Noise", "Random", "Scribble"] },
  },  
  {
    id: "lineWeightMode",
    name: "Line Weight",
    type: "select",
    options: { options: ["Hairline", "Thin", "Medium"] },
  },
  {
    id: "containerSize",
    name: "Container Size",
    type: "number",
    options: { min: 0.55, max: 1.0, step: 0.05 },
  },
  {
    id: "showShape",
    name: "Shape BG",
    type: "boolean",
  },
  {
    id: "burstMode",
    name: "Burst Mode",
    type: "select",
    options: { options: ["None", "Last", "A Few", "Several"] }
  },
  {
    id: "fillAmount",
    name: "Fill Amount",
    type: "select",
    default: "Medium",
    options: { options: ["Light", "Medium", "Full"] }
  },  
  {
    id: "palette",
    name: "Color Palette",
    type: "select",
    options: {
      options: [
        "Nordic", "OlivePink", "BlueGray", "SunsetPop", "SoftTech", "Citrus",
        "Peach", "Aqua", "NeoMint", "DigitalLavender",
        "BlackFluoro", "DeepMoss", "CoralDream", "MidnightNeon",
        "ArtDecoGold", "PlastiPastel", "OliveCream", "Pumpkin", "MistBlue",
        "CharcoalSage", "IndigoPlum", "CreamCherry", "AcidGrid", "DuskFade",
        "MochaLuxury", "EtherealBlues", "WarmYellows", "CreamyPastels", 
        "BoldRedFusion", "MonoBlue", 
        "MintMint", "DigitalSunset", "MetalVibe", "VibrantCandy", 
        "NaturalHarmony", "RetroFuturism", "Minimalism", "Burgundy", 
        "RoyalContrast", "CocoaAndMarshmallow", "MutedNeutralsAndCoral"
      ]
    }
  },
  {
    id: "rowSize",
    name: "Grid Size",
    type: "select",
    options: { options: ["2", "3", "4", "5", "6", "7", "8", "9","10","11"] },
  },
  {
    id: "paddingMode",
    name: "Padding",
    type: "select",
    options: { options: ["None", "Some", "Alot"] },
  }
]);

const palettes = {
  // Original palettes
  Nordic: {
    bg: "#f4f4f4",
    shape: "#dfe7e4",
    line: "#2f3e46"
  },
  OlivePink: {
    bg: "#fbeee0",
    shape: "#d4a373",
    line: "#6a4c93"
  },
  BlueGray: {
    bg: "#e0e0e0",
    shape: "#bbdefb",
    line: "#0d47a1"
  },
  SunsetPop: {
    bg: "#fff3e0",
    shape: "#ffccbc",
    line: "#d84315"
  },
  SoftTech: {
    bg: "#f0f4f8",
    shape: "#cfe2f3",
    line: "#495057"
  },
  Citrus: {
    bg: "#fcf8ec",
    shape: "#ffeb99",
    line: "#ff6f00"
  },

  // New palettes with some revised as low contrast
  Peach: { // Revised from CoralDream
    bg: "#ffd8cb",
    shape: "#fcbfbd",
    line: "#8a5465"  // Lower contrast from original dark line
  },
  Aqua: { // Original version
    bg: "#0f2a44",
    shape: "#58c5d4",
    line: "#ffffff"
  },
  NeoMint: { // Original version
    bg: "#e0f5ec",
    shape: "#b7e4c7",
    line: "#1b4332"
  },
  DigitalLavender: { // Original version
    bg: "#eae4f2",
    shape: "#d1c4e9",
    line: "#4a148c"
  },
  BlackFluoro: { // Original version
    bg: "#111111",
    shape: "#333333",
    line: "#00ffcc"
  },
  DeepMoss: { // Kept original, lower contrast
    bg: "#1d2d20",
    shape: "#4d5d3b",
    line: "#89998e"  // Less contrast from original bright line
  },
  CoralDream: { // Kept original, lower contrast
    bg: "#ffe8e0",
    shape: "#e6fffa",
    line: "#d19289"  // Muted version of coral
  },
  MidnightNeon: { // Kept original, lower contrast
    bg: "#050505",
    shape: "#202020",
    line: "#a649a6"  // Muted version of bright magenta
  },
  ArtDecoGold: { // Original version
    bg: "#1c1c1c",
    shape: "#4a4a4a",
    line: "#f7c873"
  },
  PlastiPastel: { // Original version
    bg: "#e0f7fa",
    shape: "#cfd8dc",
    line: "#00acc1"
  },
  OliveCream: { // Original version
    bg: "#eae7dc",
    shape: "#d8cfc4",
    line: "#606c38"
  },
  Pumpkin: { // Original version
    bg: "#ea5c2b",
    shape: "#c74316",
    line: "#fdf0e6"
  },
  MistBlue: { // Original version
    bg: "#dae3e5",
    shape: "#b9cbd4",
    line: "#102a43"
  },
  CharcoalSage: { // Original version
    bg: "#2e2e2e",
    shape: "#4e5d4e",
    line: "#f0fff0"
  },
  IndigoPlum: { // Kept original, lower contrast
    bg: "#2c1e4a",
    shape: "#6247aa",
    line: "#a889d2"  // Less contrast than original
  },
  CreamCherry: { // Original version
    bg: "#faf3dd",
    shape: "#ffcdb2",
    line: "#6a040f"
  },
  AcidGrid: { // Revised from BlackFluoro
    bg: "#ff00ff",
    shape: "#05b540",
    line: "#FFFF00"  // Muted version of the bright color
  },
  DuskFade: { // Original version
    bg: "#2f2d53",
    shape: "#6c608e",
    line: "#f8edeb"
  },
  
  // New 2025 trend palettes with some revised as low contrast
  MochaLuxury: { // Revised version
    bg: "#3D3027",
    shape: "#1f1610", // Closer to bg
    line: "#b09f96"   // Lower contrast
  },
  EtherealBlues: { // Original version
    bg: "#C3D9E5",
    shape: "#DCEEF7",
    line: "#084869"
  },
  WarmYellows: { // Original version
    bg: "#F9D371",
    shape: "#D9A324",
    line: "#594516"
  },
  CreamyPastels: { // Revised from DigitalLavender
    bg: "#F2E8D9",
    shape: "#DAC3B3",
    line: "#A78B6A"  // Lower contrast
  },
  BoldRedFusion: { // Original version
    bg: "#b50b0b",
    shape: "#9e0d0d",
    line: "#ff4242"
  },
  MonoBlue: { // Revised from AquaTech
    bg: "#051E3E",
    shape: "#2F5F87", 
    line: "#5d89b3"  // Less bright than original
  },
  MintMint: { // Revised, lower contrast
    bg: "#ADEBB3",
    shape: "#c3f7c8", // Muted green closer to bg
    line: "#558B71"   // Lower contrast
  },
  DigitalSunset: { // Original version
    bg: "#0A101B",
    shape: "#F97A57",
    line: "#58855C"
  },
  MetalVibe: { // Original version
    bg: "#212121",
    shape: "#757575",
    line: "#D4AF37"
  },
  VibrantCandy: { // Original version
    bg: "#6F4AE7",
    shape: "#FF61D8",
    line: "#F9F871"
  },
  NaturalHarmony: { // Original version
    bg: "#594516",
    shape: "#BDA55D",
    line: "#F9F4E3"
  },
  RetroFuturism: { // Original version
    bg: "#001F54",
    shape: "#034078",
    line: "#FEFCFB"
  },
  Minimalism: { // Original version
    bg: "#000000",
    shape: "#FF0000",
    line: "#FFFFFF"
  },
  Burgundy: { // Original version
    bg: "#5E3A3A",
    shape: "#522f2f",
    line: "#D9C3B0"
  },
  RoyalContrast: { // Revised from DuskFade
    bg: "#22223B",
    shape: "#38385c",
    line: "#b9b0bd"  // Lower contrast than original
  },
  CocoaAndMarshmallow: { // Revised version
    bg: "#543a2a",
    shape: "#8C6954", // More muted, closer to bg
    line: "#b3a694"   // Lower contrast
  },
  MutedNeutralsAndCoral: { // Original version
    bg: "#e0dbd7",
    shape: "#B8A99A",
    line: "#f7f4f2"
  }
};


//////

// === PARAMS ===
// These were const at the top level, which meant a parameter change needed a
// page reload. They are let now, and everything derived from them lives in
// applyParams(), so the control panel can re-form the piece in place. The
// derivations themselves are unchanged and in the original order.
let evolutionDirection, layoutMode, directionMode, lineWeightMode, containerSize;
let paletteName, showShape, burstMode, fillAmount, paddingMode;
let gridSize, rows, cols, totalCells;

// === STYLES & CANVAS ===
let cellW, cellH, gridOffsetX, gridOffsetY, palette;
const drawInterval  = 1;
const fadeInFrames  = 0;
const fps           = 60;
let showGrid        = false;
let drawDone        = false;
const bgFillColor   = [0, 0, 0, 10]; // RGBA, soft black

let padding, burstCount, fillFactor, maxSteps, growthRate, adjustedFill, featuresObj;
const minFillFactor  = 0.45;
const maxFillFactor  = 10;
const fillDecay      = 2;
const minCells       = 4;
const maxCells       = 121;
const minFill        = 0.00001;
const maxFill        = 8;

function applyParams() {
  evolutionDirection = $fx.getParam("evolutionDirection");
  layoutMode         = $fx.getParam("layoutMode");
  directionMode      = $fx.getParam("directionMode");
  lineWeightMode     = $fx.getParam("lineWeightMode");
  containerSize      = $fx.getParam("containerSize");
  paletteName        = $fx.getParam("palette");
  showShape          = $fx.getParam("showShape");
  burstMode          = $fx.getParam("burstMode");
  fillAmount         = $fx.getParam("fillAmount");
  paddingMode        = $fx.getParam("paddingMode");
  gridSize           = parseInt($fx.getParam("rowSize"), 10);

  palette            = palettes[paletteName];

  // === PADDING ===
  if (paddingMode === "None")      padding = 10;
  else if (paddingMode === "Some") padding = 30;
  else if (paddingMode === "Alot") padding = 50;

  // Keep every cell square at the size established by the shorter axis. The
  // longer axis adds only complete cells. Any leftover room stays outside the
  // centered grid so its horizontal and vertical cell spacing remain equal.
  const canvasWidth = typeof width === "number" ? width : window.innerWidth;
  const canvasHeight = typeof height === "number" ? height : window.innerHeight;
  const drawWidth = Math.max(1, canvasWidth - padding * 2);
  const drawHeight = Math.max(1, canvasHeight - padding * 2);
  const targetCellSize = Math.min(drawWidth, drawHeight) / gridSize;
  const wholeCellsThatFit = available => Math.max(
    gridSize,
    Math.floor(available / targetCellSize + 1e-9)
  );

  if (drawWidth >= drawHeight) {
    rows = gridSize;
    cols = wholeCellsThatFit(drawWidth);
  } else {
    cols = gridSize;
    rows = wholeCellsThatFit(drawHeight);
  }

  cellW = cellH = targetCellSize;
  gridOffsetX = (canvasWidth - cols * cellW) / 2;
  gridOffsetY = (canvasHeight - rows * cellH) / 2;
  totalCells = cols * rows;

  // === BURST LOGIC ===
  const burstMap = {
    "None": 0,
    "Last": 1,
    "A Few": Math.ceil(rows * 0.5),
    "Several": Math.ceil(rows * 0.75),
  };
  burstCount = burstMap[burstMode];

  // === FILL AMOUNT MAPPING ===
  const fillMap = {
    "Light":  0.5,
    "Medium": 1.0,
    "Full":   2.0,
  };
  fillFactor     = fillMap[fillAmount] || 1.0;

  // === FILL SCALING ===
  maxSteps       = 121 * 0.15;

  const t        = Math.min(1, Math.max(0, (totalCells - minCells) / (maxCells - minCells)));
  const fillRatio = Math.pow(1 - t, 4.5);
  growthRate     = Math.max(minFill, Math.floor(maxFill * fillRatio));

  const fillMod  = fillFactor * Math.pow(1 - t, fillDecay);
  adjustedFill   = minFillFactor + (maxFillFactor - minFillFactor) * fillMod;

  // === FX FEATURES EXPORT ===
  featuresObj = {
    evolutionDirection,
    layoutMode,
    directionMode,
    lineWeightMode,
    containerSize,
    palette: paletteName,
    rowSize: gridSize,
    gridDimensions: `${cols}x${rows}`,
    padding: paddingMode,
  };
}

applyParams();

// === DIRECTION VECTORS ===
const directions = [
  { x: 1,  y: 0 }, { x: -1, y: 0 }, { x: 0,  y: 1 }, { x: 0,  y: -1 },
  { x: 1,  y: 1 }, { x: -1, y: 1 }, { x: 1,  y: -1 }, { x: -1, y: -1 }
];

// === RUNTIME STATE ===
let cells       = [];
let burstQueue  = [];

//////

function updateFeatures(){

  $fx.features(featuresObj);
}

function fxRange(min, max) {
  return min + (max - min) * $fx.rand();
}

function fxPick(array) {
  return array[Math.floor($fx.rand() * array.length)];
}

function randomDirectionMode() {
  const dirOptions = fxPick(["90", "45", "Noise"]);
  // const dirOptions = $fx.getParamDefinition("directionMode").options.options;
  // const dirOptions = $fx.getParam("directionMode");
  return fxPick(directionOptions.filter(d => d !== "Random" && d !== "Scribble"));

  // return fxPick(dirOptions.filter(d => d !== "Random" && d !== "Scribble"));
}

updateFeatures();
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("#canvasWrapper");
  buildPiece();
  frameRate(60);
}

function windowResized() {
  if (windowWidth === width && windowHeight === height) return;
  resizeCanvas(windowWidth, windowHeight);
  if (typeof window.reformPiece === "function") window.reformPiece();
  else {
    applyParams();
    buildPiece();
  }
}

// Everything downstream of the parameters and the hash. Split out of setup()
// so a parameter change or a new hash can re-form the piece without the canvas
// being rebuilt. The body is unchanged apart from clearing the cell lists.
function buildPiece() {
  cells = [];
  burstQueue = [];

  if (window.debugMode) console.log("hash", $fx.hash);
  noiseSeed(parseInt($fx.hash.slice(0, 16), 16));
  palette = palettes[paletteName];

  noFill();
  background(palette.bg);
  
  document.body.style.backgroundColor = darken(palette.bg);
  // document.body.style.backgroundColor = palette.bg;

  const createCell = (x, y, i, spiral = false) => {
    const index = i;
    const steps = floor(map(i, 0, totalCells - 1, 1, 10));
    const isBurst = (index >= totalCells - burstCount);

    // console.log("Burst?",isBurst);
    
    const parent = index > 0 ? cells[index - 1] : null;
    // const cell = new Cell(x * cellW, y * cellH, cellW, parent, steps, isBurst);
    const cell = new Cell(
      gridOffsetX + x * cellW,
      gridOffsetY + y * cellH,
      cellW,
      parent,
      steps,
      isBurst
    );
    // cell.delayFrames = map(i, 0, totalCells, 0, 120); // or scale with row count
    cell.delayFrames = 1;//pow(i / totalCells, 2) * 2;

    cells.push(cell);
    if (isBurst) burstQueue.push(cell); // queue bursts to extend later
  }

  if (evolutionDirection === "Top-Down") {
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) createCell(x, y, y * cols + x);
  } else if (evolutionDirection === "Bottom-Up") {
    for (let y = rows - 1; y >= 0; y--) for (let x = cols - 1; x >= 0; x--) createCell(x, y, (rows - 1 - y) * cols + (cols - 1 - x));
  } else if (["Spiral-In", "Spiral-Out"].includes(evolutionDirection)) {
    let spiral = generateSpiralIndices(cols, rows);
    if (evolutionDirection === "Spiral-Out") spiral.reverse();
    for (let i = 0; i < spiral.length; i++) {
      const { x, y } = spiral[i];
      createCell(x, y, i, true);
    }
  }
}


function draw() {
  background(palette.bg);
  noStroke();
  fill(palette.bg);
  rect(0, 0, width, height);

    if (showGrid) drawGrid(cols, rows, cellW, cellH);
    for (let cell of cells) {
      // if (frameCount >= cell.delayFrames) {
        cell.draw(frameCount - cell.delayFrames);
      // }
    }      
  
    // if (frameCount % drawInterval === 0) {
      for (let cell of cells) {
        // if (frameCount >= cell.delayFrames) {
          cell.drawIndex++;
        // }
      }
    // } 
    
}

function drawGrid(cols, rows, cellW, cellH) {
  stroke(200);
  strokeWeight(.5);
  for (let x = 0; x <= cols; x++) {
    line(x * cellW, 0, x * cellW, height);
  }
  for (let y = 0; y <= rows; y++) {
    line(0, y * cellH, width, y * cellH);
  }
}

function generateSpiralIndices(cols, rows) {
  const spiral = [];
  let left = 0, right = cols - 1, top = 0, bottom = rows - 1;

  while (left <= right && top <= bottom) {
    for (let x = left; x <= right; x++) spiral.push({ x, y: top });
    top++;
    for (let y = top; y <= bottom; y++) spiral.push({ x: right, y });
    right--;
    if (top <= bottom) {
      for (let x = right; x >= left; x--) spiral.push({ x, y: bottom });
      bottom--;
    }
    if (left <= right) {
      for (let y = bottom; y >= top; y--) spiral.push({ x: left, y });
      left++;
    }
  }

  return spiral;
}



class Cell {
  constructor(cx, cy, size, parent = null, steps = 3, isBurst = false) {
    this.cx = cx;
    this.cy = cy;
    this.size = size;
    this.paths = [];
    this.drawIndex = 0;
    this.isBurst = isBurst;
  
    
    if (parent) {
      // this.paths = parent.paths.map(path => path.map(p => ({ ...p })));
      this.paths = parent.paths.map(path => {
        const newPath = path.map(p => ({ ...p }));
        newPath.directionMode = path.directionMode; // preserve directionMode
        return newPath;
      });
      
    } else {
      // const start = { x: this.size / 2, y: this.size / 2 };
      // const end = { x: start.x + 10, y: start.y + 10 };
      // const path = [start, end];
      const start = this.randomPoint();
      const angle = $fx.rand() * TWO_PI;
      const length = 5 + $fx.rand() * 10;
      let end = {
        x: start.x + cos(angle) * length,
        y: start.y + sin(angle) * length
      };
      end = this.constrainPoint(end.x, end.y);
      const path = [start, end];

      path.directionMode = directionMode === "Random" ? randomDirectionMode() : directionMode;
      path.noiseSeedX = $fx.rand() * 1000;
      path.noiseSeedY = $fx.rand() * 1000;
      path.noiseScale = 0.02 + ($fx.rand() - 0.5) * 0.01;

      this.paths.push(path);
    }
  
    if (window.debugMode) console.log(totalCells)
    let stepsPerPath = 3;
    if (totalCells <= (2*2)) {
      growthRate = 6;
      stepsPerPath = 5
    } else if (totalCells == (3*3)) {
        growthRate = 5; 
        stepsPerPath = 4
    } else if (totalCells == (4*4)) {
        growthRate = 3; 
    } else if (totalCells == (5*5)) {
        growthRate = 2; 
        stepsPerPath = 2
    } else if (totalCells == (6*6)) {
        growthRate = 1; 
        stepsPerPath = 2
    } else if (totalCells == (7*7)) {
        growthRate = .000001; 
        stepsPerPath = 1
    } else if (totalCells == (8*8)) {
        growthRate = .000001; 
        stepsPerPath = 1
    } else if (totalCells == (9*9)) {
      growthRate = .000001; 
       stepsPerPath = 1
    } else if (totalCells >= (10*10)) {
      growthRate = .000001;  
      stepsPerPath = 1
    } else {
      growthRate = .000001; 
    }
  
    if (directionMode === "Scribble") {
      if (totalCells == (7*7) ) {
        growthRate = 0;
        stepsPerPath = 4;
      } else if (totalCells == (8*8) ) {
          growthRate = 0;
          stepsPerPath = 3;
      } else if (totalCells >= (9*9) ) {
          growthRate = 0;
          stepsPerPath = 2.5;
      } else {
        stepsPerPath *= .25
      }
  
      // console.log("stepsPerPathONE", stepsPerPath, adjustedFill);
      // stepsPerPath *= adjustedFill;
  
      let curveFillFactor = map(fillFactor, 0.5, 2.0, 0.7, 1.3);
      stepsPerPath *= curveFillFactor;

      // Adjust burst cells specifically in Curve mode
      // if (isBurst && burstMode != "Last") {
      //   stepsPerPath *= .5;
      // }
      
      // noiseObject = { min: 0.02, max: 0.5, scale: 0.05 };
      if (window.debugMode) console.log("stepsPerPathTWO", stepsPerPath, adjustedFill);
      this.addPaths(growthRate);
  
      let maxStepsPerPath = stepsPerPath + 1;
      let noiseObject = null;

      this.extendPaths(
        isBurst ? Math.min(stepsPerPath, maxStepsPerPath) : stepsPerPath,
        isBurst,
        noiseObject
      );
    } else {
      growthRate *= adjustedFill;

      // if (isBurst){
      //   stepsPerPath = 30;
      //   growthRate = 20;
      // }
      // stepsPerPath *= 1;
      if (burstMode == "Last" && isBurst){
        growthRate *= 1.4;
        stepsPerPath *= 1.8;
        if (totalCells >= (8*8)){
          stepsPerPath *= 2;
          growthRate *= 1.5;
        }
        
      } else if (burstMode == "Several" && isBurst){
        growthRate *= 0.5;
        stepsPerPath *= 0.75;
        if (totalCells >= (8*8)){
          stepsPerPath *= 0.9;
          growthRate *= .9;
        }
      }

      let noiseObject = null;
      if ((directionMode === "Noise")){
        if (isBurst){
          growthRate *= 0.5;
          stepsPerPath *= 0.75;
          if (totalCells >= (8*8)){
            stepsPerPath *= 0.9;
            growthRate *= .9;
          }
        }
        noiseObject = { min: 0.02, max: 0.5, scale: 0.05 };
      }

      if ((directionMode === "Random")){
        if (isBurst){
          growthRate *= 0.25;
          stepsPerPath *= 0.5;
          if (totalCells >= (8*8)){
            stepsPerPath *= 0.6;
            growthRate *= .35;
          }
        }
        noiseObject = { min: 0.07, max: 0.5, scale: 0.05 };
      }

      // Adjust burst cells
      // if (isBurst && burstMode != "Last") {
      //   stepsPerPath *= .5;
      // }
      let maxStepsPerPath = stepsPerPath + 1;

  

      this.addPaths(growthRate);
      if (window.debugMode) console.log("directionMode", directionMode, noiseObject);
      // isBurst = false;
      this.extendPaths(
        isBurst ? Math.min(stepsPerPath, maxStepsPerPath) : stepsPerPath,
        isBurst,
        noiseObject
      );
    }

  }  
  
  randomPoint() {
    const cx = this.size / 2;
    const cy = this.size / 2;
    const r = (this.size * containerSize) / 2;
  
    if (layoutMode === "Circle") {
      const angle = $fx.rand()*TWO_PI;
      const dist = sqrt($fx.rand()) * r; // uniform in circle
      const x = cx + cos(angle) * dist;
      const y = cy + sin(angle) * dist;
      return { x, y };
    } else if (layoutMode === "Square") {
      const margin = this.size * (1 - containerSize) / 2;
      const x = margin + $fx.rand() * (this.size - 2 * margin);
      const y = margin + $fx.rand() * (this.size - 2 * margin);
      return { x, y };
    }
  
    // fallback: sample full cell, then constrain as before
    return this.constrainPoint($fx.rand()*this.size, $fx.rand()*this.size);
  }
  
  

    addPaths(n) {
      for (let i = 0; i < n; i++) {
        const path = [this.randomPoint()];
        path.directionMode = (directionMode === "Random") ? randomDirectionMode() : directionMode;
        this.paths.push(path);
      }
    }

    constrainPoint(x, y) {
      const cx = this.size / 2;
      const cy = this.size / 2;
    
      if (layoutMode === "Circle") {
        const r = this.size * (containerSize / 2);
        let dx = x - cx;
        let dy = y - cy;
        const d = sqrt(dx * dx + dy * dy);
        if (d > r) {
          dx *= r / d;
          dy *= r / d;
          x = cx + dx;
          y = cy + dy;
        }
      } else if (layoutMode === "Square") {
        const margin = this.size * (1 - containerSize) / 2 + $fx.rand() * containerSize;
        x = constrain(x, margin, this.size - margin);
        y = constrain(y, margin, this.size - margin);
        // const edgeSoftness = this.size * 0.05;
        // x = constrain(x, margin + edgeSoftness, this.size - margin - edgeSoftness);
        // y = constrain(y, margin + edgeSoftness, this.size - margin - edgeSoftness);

      } else if (layoutMode === "Diamond") {
        const r = this.size * (containerSize / 2);
        let dx = abs(x - cx);
        let dy = abs(y - cy);
        if (dx + dy > r) {
          const scale = r / (dx + dy);
          x = cx + (x - cx) * scale;
          y = cy + (y - cy) * scale;
        }
      } else if (layoutMode === "Triangle") {
        const r = this.size * containerSize;
        const baseY = this.size * (1 - containerSize) / 2;
        const topY = baseY + r;
    
        // Clamp to triangle bounds
        let px = constrain(x, cx - r / 2, cx + r / 2);
        let py = constrain(y, baseY, topY);
        let dx = abs(px - cx);
        let maxDx = (py - baseY) * (r / 2) / (topY - baseY);
        if (dx > maxDx) {
          px = cx + (px < cx ? -1 : 1) * maxDx;
        }
    
        x = px;
        y = py;
      }
    
      return { x, y };
    }    
    
    extendPaths(stepsPerPath, burstMode, noiseObject) {
      if (window.debugMode) console.log("Extend Paths", stepsPerPath, burstMode);
      for (let path of this.paths) {
        if (path.length === 0) continue;
    
        const pathMode = path.directionMode || "Random";
    
        if (pathMode === "Scribble") {
          if (!path.spiralCenter) {
            path.spiralCenter = { x: path[0].x, y: path[0].y };
            path.angle = $fx.rand() * TWO_PI;
          }
    
          let burstMultiplier = burstMode ? 1.5 : 1.0;
    
          for (let i = 0; i < stepsPerPath; i++) {
            const prev = path[path.length - 1];
            let angleStep = PI / 12 + (i / stepsPerPath) * PI / 10;
            path.angle += angleStep * burstMultiplier;
    
            let radius = this.size * 0.8 * burstMultiplier;
    
            let cx = path.spiralCenter.x + cos(path.angle) * radius;
            let cy = path.spiralCenter.y + sin(path.angle) * radius;
    
            const target = this.randomPoint();
            cx = target.x;
            cy = target.y;
    
            let radMod = 0.05;
            if (burstMode) {
              radMod *= rows * .75;
              // console.log("rows", rows, radMod);
            }
            
            let ctrl = {
              x: (prev.x + cx) / 2 + fxRange(-radius * radMod, radius * radMod),
              y: (prev.y + cy) / 2 + fxRange(-radius * radMod, radius * radMod),
            };

            const constrainedCtrl = burstMode ? ctrl : this.constrainPoint(ctrl.x, ctrl.y);
            const constrainedEnd = burstMode ? { x: cx, y: cy } : this.constrainPoint(cx, cy);
    
            path.push({ x: constrainedCtrl.x, y: constrainedCtrl.y, ctrl: true });
            path.push(constrainedEnd);
          }
        } else {
          let x = path[path.length - 1].x;
          let y = path[path.length - 1].y;
    
          for (let i = 0; i < stepsPerPath; i++) {
            let step = this.size / 25;
            let burstFactor = burstMode ? 1.5 : 1.0;
            step *= burstFactor;
    
            let dx = 0, dy = 0;
    
            if (pathMode === "90") {
              const dir = fxPick(directions.slice(0, 4));
              dx = dir.x * step;
              dy = dir.y * step;
            } else if (pathMode === "45") {
              const dir = fxPick(directions);
              dx = dir.x * step;
              dy = dir.y * step;
            } else if (pathMode === "Noise") {
              let stepJitter = 1;
              let noiseJitter = 1;

              if (burstMode) {
                // 0.8x to 1.3x of base step
                stepJitter = 0.6 * $fx.rand();
                noiseJitter = $fx.rand() * 1.5;
              }
              const noiseScale = noiseObject.min + ($fx.rand() - 0.5) * 0.005 * noiseJitter;
              const angle = noise(x * noiseScale, y * noiseScale, i * 0.05) * TWO_PI;

              dx = cos(angle) * (step * stepJitter);
              dy = sin(angle) * (step * stepJitter);
            }
    
            x += dx;
            y += dy;
    
            const p = burstMode ? { x, y } : this.constrainPoint(x, y);
            path.push(p);
            x = p.x;
            y = p.y;
          }
        }
      }
    }        
  
    draw(globalFrameCount) {
      push();
      translate(this.cx, this.cy);
    
      if (showShape) {
        noStroke();
        fill(palette.shape);
        const r = this.size * containerSize / 2;
        const cx = this.size / 2;
        const cy = this.size / 2;
    
        if (layoutMode === "Circle") ellipse(cx, cy, r * 2, r * 2);
        else if (layoutMode === "Square") rect(cx - r, cy - r, r * 2, r * 2);
        else if (layoutMode === "Diamond") {
          beginShape();
          vertex(cx, cy - r); vertex(cx + r, cy); vertex(cx, cy + r); vertex(cx - r, cy);
          endShape(CLOSE);
        } else if (layoutMode === "Triangle") {
          const topY = cy - r, baseY = cy + r;
          beginShape();
          vertex(cx, topY); vertex(cx - r, baseY); vertex(cx + r, baseY);
          endShape(CLOSE);
        }
      }
    
      noFill();
    
      const segmentInterval = drawInterval;
    
      for (let path of this.paths) {
        if (path.length < 2) continue;
    
        // CURVE MODE
        if (path.directionMode === "Scribble") {
          beginShape();
          for (let i = 0; i < path.length; i++) {
            const pt = path[i];
            const segmentStart = i * segmentInterval;
            const segmentEnd = segmentStart + fadeInFrames;
    
            if (globalFrameCount < segmentStart) continue;
    
            let alpha = 255;
            if (globalFrameCount < segmentEnd) {
              alpha = map(globalFrameCount, segmentStart, segmentEnd, 0, 255);
            }
    
            let lineColor = color(palette.line);
            lineColor.setAlpha(alpha);
            stroke(lineColor);
            strokeWeight(getLineWeight());
    
            curveVertex(pt.x, pt.y);
          }
          endShape();
        } 
        // ALL OTHER MODES
        else {
          for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const curr = path[i];
            const segmentStart = i * segmentInterval;
            const segmentEnd = segmentStart + fadeInFrames;
    
            if (globalFrameCount < segmentStart) continue;
    
            let alpha = 255;
            if (globalFrameCount < segmentEnd) {
              alpha = map(globalFrameCount, segmentStart, segmentEnd, 0, 255);
            }
    
            let lineColor = color(palette.line);
            lineColor.setAlpha(alpha);
            stroke(lineColor);
            strokeWeight(getLineWeight());
    
            line(prev.x, prev.y, curr.x, curr.y);
          }
        }
      }
    
      pop();
    }    
        
    
  }
  
  // generateSVG() and drawCellToSVG() lived here. They rendered the piece a
  // second time through p5.svg's SVG backend for the S-key vector export.
  // That backend is a whole alternate renderer, not something the vanilla
  // runtime provides, so the export is not carried over — see README.

  function keyPressed() {
    if (key === 'g') {
      showGrid = !showGrid;
    } else if (key === 'h') {
      showShape = !showShape;
    }
  }
 

  function getLineWeight() {
    switch (lineWeightMode) {
      case "Hairline": return 0.20;
      case "Thin":     return 0.45;
      case "Medium":   return 0.75;
      case "Thick":    return 1.0;
      default:         return 0.45;
    }
  }

  function darken(hex, factor = 0.9) {
    const num = parseInt(hex.replace("#", ""), 16);
    let r = ((num >> 16) & 255) * factor;
    let g = ((num >> 8) & 255) * factor;
    let b = (num & 255) * factor;
    return `rgb(${r}, ${g}, ${b})`;
  }
