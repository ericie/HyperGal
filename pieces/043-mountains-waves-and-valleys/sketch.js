// Mountains Waves and Valleys — Eric Ishii Eckhardt, 2024.
// The shipped fxhash sketch. setup() is split so the control panel can
// re-form the piece from new parameter values without rebuilding the
// canvas; $fx is provided by fx.js, the parameters by params.js.

let world = {};

// Define color palettes
let chosenPalette
let waveNoiseScale;
let fxColorPalette; // Done
let fxLineWeightType; // Done
let fxLineSpace; // Done
let fxPeakHeight;
let fxChaos;
let layoutMode; // Set this to the desired layout mode
let maxLines = 80; // Maximum number of lines
const MIN_LINE_COUNT = 20;
let maxPoints = 70;
let animationOffset = 0;
let animationSpeed = 0.00025; // Adjust this for faster or slower animation
let frameRateChecks = 0;
let lastCheckTime = 0;
let xScale;
let lines;
let ctx;
let frameCount = 0;
let valleys_on, line_complexity, curved_lines;

function getFXParams() {
  fxColorPalette = $fx.getParam("color_palette");
  fxLineWeightType = $fx.getParam("line_weight");
  fxLineSpace = $fx.getParam("line_space");
  fxPeakHeight = $fx.getParam("peak_height");
  fxChaos = $fx.getParam("chaos");
  curved_lines = $fx.getParam("curved_lines");
  layoutMode = $fx.getParam("layout_mode");
  fxWaveOffset = $fx.getParam("wave_offset");
  // startNoise = $fx.getParam("noise_start");
  animationSpeed = $fx.getParam("anim_speed");
  animationSpeed = map(animationSpeed, 0, 1000, .00005, .00025);
  valleys_on = $fx.getParam("valleys_on");
  line_complexity = $fx.getParam("line_complexity");
}

function setLineParams(){
  lineHeight = $fx.rand() * 2.0 + .5;
  lineHeight = setLineHeight(fxLineWeightType);
  adjustForTightnessParam();

  // Reset the dash and cap first: the branches below only ever set them, and
  // with a live control panel a stale dash would follow you to another weight.
  ctx.setLineDash([]);
  strokeCap(ROUND);

  maxPoints = line_complexity;
  if (fxLineWeightType == "Faint"){
    ctx.setLineDash([1, 3]);
    strokeCap('square');
  }
  if (fxLineWeightType == "Very Light"){
    ctx.setLineDash([14, 4]);
    strokeCap('square');
  }
  if (fxLineWeightType == "Heavy"){
    // Gets kind of blinky
    // animationSpeed *= .8;
  }
  
  strokeWeight(lineHeight);
  xScale = width/maxPoints;
}

function setSpacing() {
  // world.lineSpace = getRandomLineSpaceMultiplier();
  world.lineOffsetStart = 40;
  lines = [];
  for (let i = 0; i < maxLines; i++){
    lastLine = false;
    if (i == maxLines - 1){lastLine = true;}
    // lines.push({x:0, y:0, linePoints:[], lastLine:lastLine, waveOffset:($fx.rand() * fxWaveOffset) - ($fx.rand() * fxWaveOffset)});
    lines.push({x:0, y:0, linePoints:[], lastLine:lastLine, waveOffset:fxWaveOffset});
  }
  
  yoff = 0; 
  world.yScale = setPeakHeight();
  world.yChaos = fxChaos;
}

function setup() {
  $fx.rand.reset();
  $fx.randminter.reset();
  randomSeed($fx.rand() * 2**32);
  noiseSeed($fx.rand() * 2**32);

  const c = createCanvas(windowWidth, windowHeight); // Set canvas to full window size
  c.canvas.setAttribute('tabindex', '0');
  c.canvas.setAttribute('aria-describedby', 'instructions');
  c.canvas.setAttribute(
    'aria-label',
    'Mountains Waves and Valleys: layered noise lines forming ridgelines across the field.'
  );
  ctx = drawingContext;
  frameRate(30);

  // The palettes come from custom properties, which never change.
  createPalettesFromCSSArray();
  applyParams();

  // A single settled frame for anyone who has asked not to see motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) noLoop();
}

// Everything downstream of the eleven parameters. Called on load, and again
// whenever the control panel changes a value, so the piece re-forms in place.
function applyParams() {
  getFXParams();

  const key = fxColorPalette.replace(/\s+/g, '_').toLowerCase();
  chosenPalette = newPalettes[key];
  if (!chosenPalette) {
    // styles.css defines no colours under this name, so there is nothing to
    // paint with. params.js filters these out; this is the last line of defence.
    console.warn('No palette defined for', fxColorPalette);
    return false;
  }

  background(chosenPalette.background);
  fill(chosenPalette.background);
  if (!valleys_on){
    noFill()
  }
  colors = chosenPalette.colors;

  setLineParams();
  setSpacing();
  initLinesDone = false; // let initLines() recompute layout and spacing
  return true;
}

// A new hash rerolls every parameter, exactly as a fresh mint would have.
function newIteration() {
  $fx._reseed();
  $fx.rand.reset();
  $fx.randminter.reset();
  randomSeed($fx.rand() * 2**32);
  noiseSeed($fx.rand() * 2**32);
  applyParams();
  if (window.syncPanel) window.syncPanel();
  if (!isLooping()) redraw();
}

function keyPressed() {
  // Ignore keys meant for the control panel's own inputs.
  if (document.activeElement && document.activeElement.closest &&
      document.activeElement.closest('.panel-root')) return;

  if (key === 's' || key === 'S') {
    saveCanvas('MountainsWavesAndValleys', 'png');
  }
  if (key === 'r' || key === 'R' || key === ' ' || keyCode === ENTER) {
    newIteration();
  }
}

function mousePressed(event) {
  // Clicks inside the control panel are the panel's business, not a reseed.
  if (event && event.target && event.target.closest &&
      event.target.closest('.panel-root')) return;
  newIteration();
}

function draw() {
  $fx.rand.reset();
  $fx.randminter.reset();
  randomSeed($fx.rand() * 2**32);
  noiseSeed($fx.rand() * 2**32);

  // Reset Color
  background(chosenPalette.background);
  frameCount++;
  // console.log(Math.round(millis() % 1000) );
  // if (Math.round(millis() % 1000) >= 920) {
  //   let currentFrameRate = frameRate();
  //   console.log("Current FPS:", currentFrameRate, width);
  // }

  
  // fill(chosenPalette.background);

  calculateLinePoints(); // Calculate all points for the lines
  drawLinesFromPoints(); // Draw all lines from pre-calculated points
}

let initLinesDone = false;
let startY, endY, endX, lineCount, spacing, baseAmplitude, amplitude, yNoise, evenSpacing, erraticVariance, maximumSparseSpacing;
function initLines(){
  if (initLinesDone) return;
  startY = 0-height * 0.1;
  endY = height * 1.1;
  lineCount = 0;
  spacing = lineHeight + world.lineSpace;
  initLinesDone = true;
  baseAmplitude = waveNoiseScale;
  amplitude = baseAmplitude * fxChaos;
  endX = width * 1.15;

  // Use for Erratic mode
  evenSpacing = (height * 1.2) / maxLines;
  erraticVariance = evenSpacing*3;

  switch (layoutMode) {
    case 'Even':
      // Evenly spaced lines
      spacing = (height * 1.2) / maxLines;
      break;
    case 'Erratic':
      // Random spacing - handled during line generation
      break;
    case 'Center':
      // Center within 3/4 of the height
      let totalHeight = height * 0.65;
      spacing = totalHeight / maxLines;
      startY = (height - totalHeight) / 2;
      endY = startY + totalHeight;
      break;
  }

  if (layoutMode === 'Erratic' && fxLineWeightType === "Heavy") {
    startY = $fx.rand() * (height * .05) + height * .03;
  }

  // Keep even the widest erratic gaps dense enough to draw the line-count floor.
  maximumSparseSpacing = (endY - startY) / (MIN_LINE_COUNT - 1);

  initLinesDone = true;
}

function calculateLinePoints() {

  initLines();
  lineCount = 0;
  yNoise = yoff; 

  for (let y = startY; y <= endY; y += spacing) {
    lineCount++;
    if (lineCount > maxLines) break;

    let lineNoiseOffset;
    try {
      lineNoiseOffset = lines[lineCount].waveOffset;; 
    } catch (error) {
      lineNoiseOffset = 0;
    }
    lineNoiseOffset = fxWaveOffset;

    let pointCount = 0;
    for (let x = 0; x <= endX; x += xScale) {
      pointCount++;
      // let yWave = map(noise(x * amplitude, yNoise + (lineNoiseOffset+y*.5) ), 0, 1, -amplitude * 0.25, amplitude);
      let yWave = map(noise(x * amplitude, yNoise + (lineCount*lineNoiseOffset + pointCount*lineNoiseOffset*2) ), 0, 1, -amplitude * 0.25, amplitude);
      let yValue = y + yWave;
      // let yValue = y + yWave * sin(x * (world.yScale * world.yChaos + lineNoiseOffset));

      let realLineOffset = lineNoiseOffset;
      if (pointCount <= 3){ realLineOffset = 0;}
      // console.log("linePoints",pointCount);
      try {
        // if (pointCount === 1){lineNoiseOffset = 0;}
        lines[lineCount-1].linePoints[pointCount-1] = {x:x+(lineCount*realLineOffset), y:yValue};
      } catch (error) {
        lines[lineCount-1].linePoints.push({x:x, y:yValue});
      }

      yNoise += animationSpeed;
    }

    // Erratic mode spacing adjustment
    if (layoutMode === 'Erratic') {
      // console.log("Erratic mode");
      // spacing = (lineHeight + world.lineSpace) * ($fx.rand() * (5 - 0.5) + 0.5);
      spacing = (evenSpacing/3) + ($fx.rand() * erraticVariance);
      if (fxLineWeightType == "Heavy") {
        spacing = (evenSpacing/4) + ($fx.rand() * (erraticVariance/3) );

      }
      spacing = Math.min(spacing, maximumSparseSpacing);
    }
    yoff += animationSpeed * fxChaos;
  }

}

function drawLinesFromPoints() {

  for (let i = 0; i < lines.length; i++) {
    let points = lines[i].linePoints;

    let colorIndex = i % colors.length;
    stroke(colors[colorIndex]);

    // Color the last line the same as the background
    if (lines[i].lastLine && fxLineWeightType != "Heavy"){
      stroke(chosenPalette.background);
    }

    beginShape();
    for (let j = 0; j < points.length; j++) {
      let point = points[j];
      if (curved_lines){
        if (j === 0) {curveVertex(-50, point.y);}
        curveVertex(point.x, point.y);
      } else {
        vertex(point.x, point.y);
      }

    }
    endShape();
  }
}


// Make sure the sketch resizes when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function adjustForTightnessParam(){
  if (fxLineWeightType == "Heavy" && maxPoints > 40) {
    maxPoints = 40;
  }

  switch (fxLineSpace) {
    case "Close":
      maxLines = 110;
      if (fxLineWeightType == "Heavy") {
        animationSpeed *= 2;
        maxLines = 35;
      }
      break;
    case "Normal":
      maxLines = 80;
      if (fxLineWeightType == "Heavy") {
        maxLines = 12;
        animationSpeed *= 4;
      }
      break;
  }

  maxLines = Math.max(maxLines, MIN_LINE_COUNT);
}

function setLineHeight() {
  let lineHeight;
  switch (fxLineWeightType) {
    case "Faint":
      lineHeight = 0.8; // Just an example value, adjust as needed
      break;
    case "Very Light":
      lineHeight = .8; // Adjust as needed
      break;
    case "Light":
      lineHeight = .8; // Adjust as needed
      break;
    case "Regular":
      lineHeight = 1.2; // Adjust as needed
      break;
    case "Medium":
      lineHeight = 2; // Adjust as needed
      break;
    case "Heavy":
      lineHeight = 40; // Adjust as needed
      break;
    default:
      lineHeight = 1; // Default value if none match
  }
  return lineHeight;
}

function setPeakHeight() {
  let peakHeight;
  
  //$fx.rand() * (0.05 - 0.001) + 0.001;
  //options: ["Very Low", "Low", "Medium", "High"],
  switch (fxPeakHeight) {
    case "Very Low":
      peakHeight = $fx.rand() * (0.0025 - 0.001) + 0.0015;
      waveNoiseScale = 20;
      break;
    case "Low":
      peakHeight = $fx.rand() * (0.045 - 0.0015) + 0.0015
      waveNoiseScale = 60;
      break;
    case "Medium":
      peakHeight = $fx.rand() * (0.055 - 0.001) + 0.001
      waveNoiseScale = 75;
      break;
    case "High":
      peakHeight = .07; //$fx.rand() * (0.070 - 0.002) + 0.003
      waveNoiseScale = 80;
      break;
    default:
      peakHeight = lineHeight = .75; // Default value if none match
  }
  return peakHeight;
}


let newPalettes = {}; // This will hold all your dynamically constructed palettes

function capitalizeWords(str) {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function createPaletteFromCSS(paletteName) {
  try {
    let root = getComputedStyle(document.documentElement);
    let formattedPaletteName = capitalizeWords(paletteName.replace(/_/g, ' '));
    let cssPaletteName = paletteName.replace(/_/g, '-');
    let palette = {
      name: formattedPaletteName,
      background: '',
      colors: []
    };

    // Fetch and assign the background and fill properties
    palette.background = color(root.getPropertyValue(`--${cssPaletteName}-background`).trim());
    // palette.fill = color(root.getPropertyValue(`--${paletteName}-fill`).trim() || palette.background); // Fallback to background if fill is not defined

    // Iteratively fetch color properties
    let i = 0;
    while (true) {
      let colorValue = root.getPropertyValue(`--${cssPaletteName}-color-${i}`).trim();
      if (colorValue === '') break; // Exit the loop if no more colors are found
      palette.colors.push(color(colorValue)); // Add the color to the palette
      i++;
    }

    // Add the constructed palette to the newPalettes object
    newPalettes[paletteName] = palette;
    // console.log(`${paletteName} palette added successfully.`);
  } catch (error) {
    console.error(`Error creating palette from CSS: ${error}`);
  }
}

/* For Dev. Build colors from CSS file */
function createPalettesFromCSSArray() {
  // const colorPaletteParam = $fx.getParams().find(p => p.id === "color_palette");
  // console.log("--- Color Palette Param:", $fx.getParam() );
  const paletteArray = [
    'arctic',
    'art_deco',
    'camouflage',
    'color_clash',
    'constructivist',
    'crimson_clash',
    'fauvism',
    'hokusai',
    'mint_watermelon',
    'monotone_cool',
    'fire',
    'nordic',
    'cotton_candy',
    'rainbow',
    'tiger',
    'viking',
    'terminal_green',
    'terminal_amber',
    'hot_pink',
    'monet',
    'constructivist',
    "black_and_white",
    "cyberpunk",
  ];
  paletteArray.forEach(paletteName => {
    createPaletteFromCSS(paletteName);
  });
}
