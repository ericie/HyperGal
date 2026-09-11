var x = 150;
var y = 150;
var oldX = 150;
var oldY = 150;

var ctx, layer01, layer02, layer01Elem, layer02Elem;
var ctCanvas;
var WIDTH = 2000;
var HEIGHT = 1000;

var intervalID = 0;
var fps =60//60;

var cursorX = 1920;
var cursorY = 1920;
var fadeRate = .02;
var showLog = false;
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
	layer05 = document.getElementById('layer05').getContext('2d');
	layer01Elem = document.getElementById('layer01');
	layer02Elem = document.getElementById('layer02');
	layer03Elem = document.getElementById('layer03');
	layer04Elem = document.getElementById('layer04');
	layer05Elem = document.getElementById('layer05');

	// console.log("Just once right?");
	// layer04.fillStyle = "hsla(0,0%,0%,.01)";
	// layer04.fillRect(0,0,1920,1920); 
	// layer03.fillStyle = "hsla(0,0%,0%,.001)";
	// layer03.fillRect(0,0,1920,1920); 
	// layer02.fillStyle = "hsla(0,0%,0%,.01)";
	// layer02.fillRect(0,0,1920,1920); 

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

	// intervalId = setInterval(draw, 1000 / fps);
	// return intervalId;
	requestAnimationFrame(performAnimation);
}

let request;

const performAnimation = () => {
	// console.log("ANIM");
	draw();
	request = requestAnimationFrame(performAnimation)
	//animate something
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

// Logging that i can turn off
function log(m){
	if (showLog){
		console.log(m);
	}
}


