var x = 150;
var y = 150;
var oldX = 150;
var oldY = 150;

var ctx, layer01, layer02, layer01Elem, layer02Elem;
var ctCanvas;
var WIDTH = 2000;
var HEIGHT = 1000;

var intervalID = 0;
var fps = 60//60;

var cursorX = 1920;
var cursorY = 1920;
var fadeRate = .02;
var showLog = false; // console output only when the page asks for it
if (window.debugMode) showLog = true;
var fullWindowMode = false;

var maxW = 1920;
var maxH = 1920;


function init() {
  	//ctx = $('#canvas')[0].getContext('2d');
	ctx = document.getElementById('canvas').getContext('2d');
	layer01 = document.getElementById('layer01').getContext('2d');
	layer02 = document.getElementById('layer02').getContext('2d');
	layer03 = document.getElementById('layer03').getContext('2d');
	layer04 = document.getElementById('layer04').getContext('2d');
	layer01Elem = document.getElementById('layer01');
	layer02Elem = document.getElementById('layer02');
	layer03Elem = document.getElementById('layer03');
	layer04Elem = document.getElementById('layer04');

	ctCanvas = document.getElementById("canvas");

	// ctCanvas = document.getElementById("canvas");
	HEIGHT =  window.innerHeight;
 	WIDTH =  window.innerWidth;
	// ctCanvas = document.getElementById("canvas");

	// initCanvasSize();
	// ctCanvas.setProperty('width',  2000);

	if (fullWindowMode == false){
		if (HEIGHT > WIDTH){
			WIDTH = HEIGHT;
		} else {
			HEIGHT = WIDTH;
		}
	}

	ctCanvas.addEventListener('mousemove', e => {
		let ratioW = maxW / WIDTH;
		let ratioW2 =  ctCanvas.width / ctCanvas.offsetWidth;
		let ratioH = maxH / HEIGHT;
		// console.log("RATIO:", e, ratioW, ratioW2);
		// let myOffset = {x:(maxW - window.innerWidth), y:(maxH - window.innerHeight)};
		let myLoc = {offsetX:e.offsetX*ratioW2, offsetY:e.offsetY*ratioW2};
		onMouseMove(myLoc)
	});

	intervalId = setInterval(draw, 1000 / fps);
	return intervalId;

}

function initCanvasSize(){
	HEIGHT =  window.innerHeight;
	WIDTH =  window.innerWidth;

	
	if (fullWindowMode == false){
		if (HEIGHT > WIDTH){
			WIDTH = HEIGHT;
		} else {
			HEIGHT = WIDTH;
		}
	}

	if (WIDTH > 1920){
		WIDTH = 1920;
		HEIGHT = 1920;
	}
	ctCanvas.width = WIDTH;
	ctCanvas.height = HEIGHT;

	log(window.innerHeight);
}

function onMouseMove(evt) {
	// console.log("DRAW", evt.pageX, evt.offsetX);
  cursorX = evt.offsetX;
  cursorY = evt.offsetY;
}

function line(x,y,r) {
	ctx.lineWidth = 1;
	ctx.strokeStyle = lineColor;
    ctx.beginPath();
    ctx.moveTo(oldX,oldY);
    ctx.lineTo(x,y);
    ctx.stroke();
	
	oldX = x;
	oldY = y;
}

function circle(x,y,r,layer) {
	if (!layer) { layer = ctx };
	layer.beginPath();
	layer.arc(x, y, r, 0, Math.PI*2, true);
	layer.closePath();
	layer.fill();
}


function rect(x,y,w,h) {
  ctx.beginPath();
  ctx.rect(x,y,w,h);
  ctx.closePath();
  ctx.fill();
}

function fade() {
  ctx.fillStyle = "rgba(0, 0, 255, "+fadeRate+")"
  ctx.beginPath();
  ctx.rect(0,0,maxW,maxH);
  ctx.closePath();
  ctx.fill();
}


// double-dog-leg hypothenuse approximation
// http://forums.parallax.com/discussion/147522/dog-leg-hypotenuse-approximation
function hypot(a, b) {
	a = Math.abs(a)
	b = Math.abs(b)
	var lo = Math.min(a, b)
	var hi = Math.max(a, b)
	return hi + 3 * lo / 32 + Math.max(0, 2 * lo - hi) / 8 + Math.max(0, 4 * lo - hi) / 16
}

function clear(_layer) {
	_layer.clearRect(0, 0, WIDTH, HEIGHT);
}

// document.addEventListener('mousemove', e => {
//   onMouseMove(e)
// });

// Logging that i can turn off
function log(m){
	if (showLog){
		console.log(m);
	}
}


