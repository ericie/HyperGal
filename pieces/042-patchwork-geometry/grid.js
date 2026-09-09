//grid.js file

let cellSize;
let gridWidth;
let gridHeight;
let gridList = [];

function preSetUpGrid(){
    gridWidth = 2 * Math.floor(EeRandom() * 25) + 4;
}
// A colour index per cell, alongside the shape index. Tinting the whole
// offscreen layer one colour meant every cell changed together, which read as
// a blink; holding the colour per cell lets one cell change at a time.
let cellInk = [];

function setUpGrid(hSymmetry, vSymmetry){   
    // hSymmetry = true;
    // vSymmetry = true;

    for (let i = 0; i < gridWidth; i++) {
    gridList[i] = [];
    cellInk[i] = [];
    
        for (let j = 0; j < gridHeight; j++) {
            if(hSymmetry && i >= gridWidth/2){
                gridList[i][j] = gridList[gridWidth-1-i][j];
                cellInk[i][j] = cellInk[gridWidth-1-i][j];
                gridList[i][j].flipH = true;
            }
            else if(vSymmetry && j >= gridHeight/2){
                gridList[i][j] = gridList[i][gridHeight-1-j];
                cellInk[i][j] = cellInk[i][gridHeight-1-j];
                gridList[i][j].flipV = true;
            }
            else if (hSymmetry && vSymmetry) {
                if(i > gridWidth/2 && j >= gridHeight/2) {
                    gridList[i][j] = gridList[gridWidth-1-i][gridHeight-1-j];
                    cellInk[i][j] = cellInk[gridWidth-1-i][gridHeight-1-j];
                    gridList[i][j].flipH = true;
                    gridList[i][j].flipV = true;
                }
                else if(i > gridWidth/2) {
                    gridList[i][j] = gridList[gridWidth-1-i][j];
                    cellInk[i][j] = cellInk[gridWidth-1-i][j];
                    gridList[i][j].flipH = true;
                }
                else if(j >= gridHeight/2) {
                    gridList[i][j] = gridList[i][gridHeight-1-j];
                    cellInk[i][j] = cellInk[i][gridHeight-1-j];
                    gridList[i][j].flipV = true;
                }
                else {
                    gridList[i][j] = Math.floor(EeRandom() * newShapeList.length);
                    cellInk[i][j] = pickInk();
                }
            }
            else {
                gridList[i][j] = Math.floor(EeRandom() * newShapeList.length);
                cellInk[i][j] = pickInk();
                // if (transitionType && transitionType != "stackingLayers" && EeRandom() < .8){
                //     let blankCell = {name: "blank", path: [0,0,0,0,0,0,0,0]}
                //     gridList[i][j] = 0;
                // }
            }
        }
    }

    if (hSymmetry){
        changePerc *= .5;
    }
    if (vSymmetry){
        changePerc *= .5;
    }

}

let gridTime = 0;
let refreshType = "all";
let index = 0;
let shapeCounter = 0;
let wipeDirection = "horizontal";
// let transitions = ["allFade", "cursorWipe", "randomBits", "stackingLayers"];
//                   

function updateCell(cX, cY){
    let shapeNum = Math.floor(EeRandom() * newShapeList.length);
    let inkNum = pickInk();
    gridList[cX][cY] = shapeNum;
    cellInk[cX][cY] = inkNum;

    let oppX = gridWidth - cX - 1;
    let oppY = gridHeight - cY - 1;

    if (hSym) {
        // reflect horizontal
        gridList[oppX][cY] = shapeNum;
            cellInk[oppX][cY] = inkNum;

        //gridList[i][j] = gridList[gridWidth-1-i][j];
        //gridList[i][j].flipH = true;
    }
    if (vSym) {
        // reflect vertical
        gridList[cX][oppY] = shapeNum;
            cellInk[cX][oppY] = inkNum;
    }
    if (hSym && vSym) {
        // reflect horizontal and vertical
        gridList[oppX][oppY] = shapeNum;
            cellInk[oppX][oppY] = inkNum;
    }

}

function updateGrid(offset, canv){
    // transitionType = "stackingLayers";

    gridTime++;
    if (gridTime > cycleTime && paused == false){
        gridTime = 0;
        if (transitionType == "allFade"){
            setUpGrid(hSym, vSym);
        } else if (transitionType == "cursorWipe"){
            
            // let index = 0;
            shapeCounter++;
            // Horizontal
            if (wipeDirection == "horizontal"){
                for (let i = 0; i < gridHeight; i++) {
                    for (let j = 0; j < gridWidth; j++) {
                        if (i * gridWidth + j == shapeCounter) {
                            updateCell(j,i); 
                        }
                    }
                }
            } else {
                // Vertical
                for (let i = 0; i < gridWidth; i++) {
                    for (let j = 0; j < gridHeight; j++) {
                        if (i * gridWidth + j == shapeCounter) {
                            updateCell(i,j);
                        }
                    }
                }
            }


            // shapeCounter++;

            if (shapeCounter >= gridWidth * gridHeight) {
                shapeCounter = 0;
            }
        } else if (transitionType == "randomBits"){
            let randBitCount = Math.ceil((gridHeight*gridWidth)*changePerc);
            for (let i = 0; i < randBitCount; i++) {
                let randomX = Math.floor(EeRandom() * gridWidth);
                let randomY = Math.floor(EeRandom() * gridHeight);
                updateCell(randomX, randomY);
            }
        } else if (transitionType == "stackingLayers"){
            let randBitCount = 10;//Math.ceil((gridHeight*gridWidth)*.8);
            for (let i = 0; i < gridWidth; i++) {
                // gridList[i] = [];
                for (let j = 0; j < gridHeight; j++) {
                    gridList[i][j] = 0;
                    cellInk[i][j] = cellInk[i][j] || 0
                }
            }

            for (let i = 0; i < randBitCount; i++) {

                // setColors();
                // Change Color
                // Draw New Cells
                let randomX = Math.floor(EeRandom() * gridWidth);
                let randomY = Math.floor(EeRandom() * gridHeight);
                updateCell(randomX, randomY);
            }

            // setColors();
            // setUpGrid(hSym, vSym);
        } else if (transitionType == "fadingLayers"){
            // strokeColor = 
            setColors();
            setUpGrid(hSym, vSym);
        } else {
            setUpGrid(hSym, vSym);
        }
    }

    for (let i = 0; i < gridWidth; i++) {
    // gridList[i] = [];
    
        for (let j = 0; j < gridHeight; j++) {
        // gridList[i][j] = Math.floor(EeRandom() * newShapeList.length);
        
        // Depth Layers
        if (config.gridBorder == true){
            strokeWeight(.1);
            stroke(strokeColor);
        }

        fill(255, 255, 255, 0);
        rect(i * cellSize, j * cellSize, cellSize, cellSize);
        drawShape(cellSize, i, j, offset, canv);
        // canv.triangle(0,0,50,0,150,50);
        // randomShape.path();
        }
    }
}

let newShapeList = [
    {name: "blank", path: [0,0,0,0,0,0,0,0]},
    {name: "rectangle", path: [0,0,0,100,100,100,100,0]},
    {name: "rectangle", path: [0,0,0,100,100,100,100,0]},
    {name: "rectangle", path: [0,0,0,100,100,100,100,0]},
    {name: "rectangle", path: [0,0,0,100,100,100,100,0]},
    {name: "rightTriangleTopLeft", path: [0,0,0,100,100,0]},
    {name: "rightTriangleTopRight", path: [0,0,100,0,100,100]},
    {name: "rightTriangleBottomLeft", path: [0,0,100,0,0,100]},
    {name: "rightTriangleBottomRight", path: [0,0,100,0,100,100]},
    {name: "rightTriangleSmallTopLeft", path: [0,0,0,50,50,0]},
    {name: "rightTriangleSmallTopRight", path: [0,0,50,0,50,50]},
    {name: "rightTriangleSmallBottomLeft", path: [0,0,50,0,0,50]},
    {name: "rightTriangleSmallTopLeft_TopRight", path: [0,0,0,50,50,0], path2: [50,0,100,0,100,50]},
    {name: "rightTriangleSmallBottomRight", path: [0,0,50,0,50,50]},
    {name: "halfWidthHalfHeightTopLeft", path: [0,0,0,50,50,50,50,0]},
    {name: "halfWidthHalfHeightTopRight", path: [50,0,50,50,100,50,100,0]},
    {name: "halfWidthHalfHeightBottomLeft", path: [0,50,0,100,50,100,50,50]},
    {name: "halfWidthHalfHeightBottomRight", path: [50,50,50,100,100,100,100,50]},
    {name: "halfWidthFullHeightLeft", path: [0,0,50,0,50,100,0,100]},
    {name: "halfWidthFullHeightRight", path: [50,0,100,0,100,100,50,100]},
    {name: "fullWidthHalfHeightTop", path: [0,0,100,0,100,50,0,50]},
    {name: "fullWidthHalfHeightBottom", path: [0,50,100,50,100,100,0,100]}
  ];

// let newShapeList = [
//     {name: "rightTriangleSmallTopLeft_TopRight",  path: [0,0,0,50,50,0], path2: [50,0,100,0,100,50]},
// ];

  function drawShape(cellWidth, cellX, cellY, offsetStep, canv) {
    // canv = createGraphics(windowWidth, windowHeight);
    // offset = 1;
    // let randomShape = shapeList[Math.floor(EeRandom() * shapeList.length)];
    let offsetLength = cellWidth / 20;
    let offsetX = 0;
    let offsetY = 0;
    //let myAlpha = 255;
    // let flipH =  true;

    if (offsetStep){
        offsetX = (offsetLength*.75) * offsetStep;
        offsetY = offsetLength * offsetStep;
        //myAlpha = 255 - (70 * offsetStep);
    }

    let randomShapeNum = gridList[cellX][cellY];
    let randomShape = newShapeList[randomShapeNum];
    let path = newShapeList[randomShapeNum].path;
    let flipH =  gridList[cellX][cellY].flipH
    if (cellX  >= gridWidth/2) flipH = true;
    
    let flipV =  gridList[cellX][cellY].flipV
    if (cellY  >= gridHeight/2){
        flipV = true;
        // canv.color = 120;
    }

    let path2 = false;
    if (newShapeList[randomShapeNum].path2 != null){
        path2 = newShapeList[randomShapeNum].path2;
    }

    // let myColor = [strokeColor[0], strokeColor[1], strokeColor[2], myAlpha]

    // console.log(canv);

    // Each cell carries its own colour, so the quilt is many-coloured at any
    // instant and a refresh changes only the cells it touches.
    const ink = inkAt(cellX, cellY);
    canv.strokeWeight(.1);
    canv.stroke(ink[0], ink[1], ink[2]);
    canv.fill(ink[0], ink[1], ink[2]);
    
    // if (flipV) canv.fill(100);

    canv.push();
    
    canv.translate(cellX * cellWidth + offsetX, cellY * cellWidth + offsetY);
    if (flipH) canv.translate(cellWidth, 0);
    if (flipV) canv.translate(0, cellWidth);
    canv.scale(cellWidth / 100);
    
    canv.beginShape();
    
    for (let i = 0; i < path.length; i += 2) {
        let x = path[i];
        let y = path[i+1];
        if (flipH) x = -x;
        if (flipV) y = -y;
        canv.vertex(x, y);
    }

    canv.endShape(CLOSE);
    canv.pop();
    

    
    // if (path2){
    //     canv.push();
    //     canv.beginShape();
    //     canv.translate(cellX * cellWidth + offsetX, cellY * cellWidth + offsetY);
    //     canv.scale(cellWidth / 100);
    //     for (let i = 0; i < path2.length; i += 2) {
    //         canv.vertex(path2[i], path2[i+1]);
    //     }
    //     canv.endShape(CLOSE);
    //     canv.pop();
    // }
  }
  