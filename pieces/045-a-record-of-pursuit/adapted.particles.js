// Line Drawing Particle System
// Eric Ishii Eckhardt
// http://ishiieckhardt.com
//

var _r;
var _g;
var _b;
var _a = .5;
var rad = 100;
var particleList;
var system;
var particleColor;
var systemSize = 32;//32;//16;//250;
var lots = true;
var hashMatch = false;

var pcMode = false;
var fadeStage = false;
var grayScale = false;
var clearLayer01 = true;

var dx = 2;
var dy = 4;
var lineColor = 'rgba(255,0,100,.2)';
var particleCount = 0;
var particleList = {}; 

var paused = false;
var autopilot = {on:true, interval:2*1000, range:500};
var targLoc, systemTarg;
var lineW = 3.5;

var centerX = 960; // recomputed by layoutTargets() once the canvas is sized
var centerY = 960;

var gridUnit = 512;
var gridMargin = 384/2;

var targetList = {
	Grid_1_1: {
		name:"Grid_1_1",
		parent:{x:384,y:384},
		x:centerX,
		y:centerX,
		r:10,
		v:.2,
		a:0,
		orbitR:50
	},
	Grid_1_2: {
		name:"Grid_1_2",
		parent:{x:768,y:384},
		x:centerX,
		y:centerX,
		r:10,
		v:.3,
		a:0,
		orbitR:50
	},
	Grid_1_3: {
		name:"Grid_1_3",
		parent:{x:1152,y:384},
		x:centerX,
		y:centerX,
		r:10,
		v:.4,
		a:0,
		orbitR:50
	},
	Grid_1_4: {
		name:"Grid_1_4",
		parent:{x:1536,y:384},
		x:centerX,
		y:centerX,
		r:10,
		v:.5,
		a:0,
		orbitR:50
	},
	
	Grid_2_1: {
		name:"Grid_2_1",
		parent:{x:384,y:768},
		x:centerX,
		y:centerX,
		r:10,
		v:.6,
		a:0,
		orbitR:50
	},
	Grid_2_2: {
		name:"Grid_2_2",
		parent:{x:768,y:768},
		x:centerX,
		y:centerX,
		r:10,
		v:.3,
		a:0,
		orbitR:50
	},
	Grid_2_3: {
		name:"Grid_2_3",
		parent:{x:1152,y:768},
		x:centerX,
		y:centerX,
		r:10,
		v:.3,
		a:0,
		orbitR:50
	},
	Grid_2_4: {
		name:"Grid_2_4",
		parent:{x:1536,y:768},
		x:centerX,
		y:centerX,
		r:10,
		v:.3,
		a:0,
		orbitR:50
	},

	Grid_3_1: {
		name:"Grid_3_1",
		parent:{x:384,y:1152},
		x:centerX,
		y:centerX,
		r:10,
		v:.3,
		a:0,
		orbitR:50
	},
	Grid_3_2: {
		name:"Grid_3_2",
		parent:{x:768,y:1152},
		x:centerX,
		y:centerX,
		r:10,
		v:.3,
		a:0,
		orbitR:50
	},
	Grid_3_3: {
		name:"Grid_3_3",
		parent:{x:1152,y:1152},
		x:centerX,
		y:centerX,
		r:10,
		v:.3,
		a:0,
		orbitR:50
	},
	Grid_3_4: {
		name:"Grid_3_4",
		parent:{x:1536,y:1152},
		x:centerX,
		y:centerX,
		r:10,
		v:.3,
		a:0,
		orbitR:50
	},

	Grid_4_1: {
		name:"Grid_4_1",
		parent:{x:384,y:1536},
		x:centerX,
		y:centerX,
		r:10,
		v:.4,
		a:0,
		orbitR:50
	},
	Grid_4_2: {
		name:"Grid_4_2",
		parent:{x:768,y:1536},
		x:centerX,
		y:centerX,
		r:10,
		v:.5,
		a:0,
		orbitR:50
	},
	Grid_4_3: {
		name:"Grid_4_3",
		parent:{x:1152,y:1536},
		x:centerX,
		y:centerX,
		r:10,
		v:.6,
		a:0,
		orbitR:50
	},
	Grid_4_4: {
		name:"Grid_4_4",
		parent:{x:1536,y:1536},
		x:centerX,
		y:centerX,
		r:10,
		v:.5,
		a:0,
		orbitR:50
	}

}

// The sixteen targets are written at fifths of a 1920 square. Rescale those
// positions onto the real canvas so the grid spans the window, keeping each
// target's own velocity and radius exactly as written.
var stageScale = 1;
var travelScale = 1;

function layoutTargets(w, h) {
	// Radii, speeds and line widths were all tuned against a 1920 square. The
	// grid now spans whatever shape the window is, so the tighter of the two
	// spacings sets one scale that everything else is measured in — otherwise
	// the marks stay 1920-sized and crowd each other in a short window.
	stageScale = Math.min(w, h) / 1920;
	// Crossing the frame is a different problem from sitting in a cell: in a
	// wide window the journey is long, so the approach is paced against the
	// larger dimension. Otherwise the swarm is still straggling in a minute later.
	travelScale = Math.max(w, h) / 1920;
	centerX = w / 2;
	centerY = h / 2;
	for (const key in targetList) {
		const t = targetList[key];
		if (t.basisParent === undefined) {
			t.basisParent = { x: t.parent.x, y: t.parent.y };
		}
		t.parent.x = (t.basisParent.x / 1920) * w;
		t.parent.y = (t.basisParent.y / 1920) * h;
	}
}

var targetOrder = [
	"Grid_1_1","Grid_1_2","Grid_1_3","Grid_1_4",
	"Grid_2_4","Grid_3_4","Grid_4_4",
	"Grid_4_3","Grid_4_2","Grid_4_1",
	"Grid_3_1","Grid_2_1","Grid_3_2","Grid_3_3",
	"Grid_2_3","Grid_2_2"	
]

var palette_01 = {
	bg:'rgb(0, 40, 12)',
	lines:['rgb(98, 251, 204)', 'rgb(68, 237, 182)', 'rgb(7, 209, 139)', 'rgb(5, 173, 111)','rgb(141, 42, 255)','rgb(95, 0, 206)','rgb(116, 0, 250)']
}
palette_01 = {
	bg:'rgb(0, 40, 40)',
	lines:['rgb(98, 251, 204,.2)']
}
var palette_02 = {
	bg:'rgb(0, 40, 40)',
	lines:['rgb(60, 60, 234,.2)']
}

//////////
// NAMED COLORS

// The six hand-written palettes below are no longer read at runtime — the
// scheme generator in palette.js replaced them. They are kept because the
// hue vocabulary it works from was measured out of these colours.
palette_00 = {
	bg:[
		{
			name:'Dark Glacier',
			color:'rgb(0, 40, 40)'
		},
		{
			name:'Vibrant Brown',
			color:'rgb(50, 10, 10)'
		},
		{
			name:'Midnight',
			color:'rgb(20, 20, 45)'
		},
		{
			name:'Deep Lavendar',
			color:'rgb(50, 20, 58)'
		},
		{
			name:'Parchment',
			color:'rgb(240, 242, 220)'
		},
		{
			name:'Dark Chocolate',
			color:'rgb(48, 17, 6)'
		},
	],
	lines:[	'rgb(103, 196, 205)','rgb(182, 224, 227)','rgb(111, 213, 222)','rgb(85, 164, 171)',
			'rgb(196, 73, 75)','rgb(242, 162, 164)','rgb(240, 89, 91)','rgb(242, 109, 111)'
	],
	lineColorNames: ['Cyan',"Coral"]
}

palette_01 = {
	bg:[
		{
			name:'Deep Mauve',
			color:'rgb(63, 51, 92)'
		},
		{
			name:'Coffee',
			color:'rgb(40, 25, 25)'
		},
		{
			name:'Midnight',
			color:'rgb(20, 20, 45)'
		},
		{
			name:'Deep Lavendar',
			color:'rgb(50, 20, 58)'
		},
		{
			name:'Vibrant Olive',
			color:'rgb(40, 77, 34)'
		},
		{
			name:'Dark Chocolate',
			color:'rgb(48, 17, 6)'
		},
	],
	lines:[	'rgb(232, 186, 109)','rgb(242, 168, 104)','rgb(219, 151, 114)','rgb(209, 167, 93)',
			'rgb(150, 122, 219)','rgb(203, 194, 225)','rgb(115, 94, 168)','rgb(125, 124, 242)'
	],
	lineColorNames: ['Light Orange',"Lavendar"]
}

palette_02 = {
	bg:[
		{
			name:'Deep Mauve',
			color:'rgb(63, 51, 92)'
		},
		{
			name:'Dull Cadet',
			color:'rgb(90, 140, 190)'
		},
		{
			name:'Midnight',
			color:'rgb(20, 20, 45)'
		},
		{
			name:'Deep Lavendar',
			color:'rgb(50, 20, 58)'
		},
		{
			name:'Vibrant Olive',
			color:'rgb(30, 67, 24)'
		},
		{
			name:'Dark Chocolate',
			color:'rgb(48, 17, 6)'
		},
	],
	lines:[	'rgb(219, 86, 204)','rgb(255, 46, 211)','rgb(255, 166, 255)','rgb(179, 32, 179)',
			'rgb(75, 219, 125)','rgb(144, 225, 173)','rgb(120, 217, 126)','rgb(139, 255, 184)'
	],
	lineColorNames: ['Magenta',"Mint"]
}

palette_03 = {
	bg:[
		{
			name:'Periwinkle',
			color:'rgb(89, 109, 255)'
		},
		{
			name:'Latte',
			color:'rgb(100, 85, 85)'
		},
		{
			name:'Pale Lavendar',
			color:'rgb(200, 140, 230)'
		},
		{
			name:'Sky Gray',
			color:'rgb(100, 125, 160)'
		},
		{
			name:'Light Ochre',
			color:'rgb(195, 145, 80)'
		},
		{
			name:'Pale Rose',
			color:'rgb(210, 100, 100)'
		},
	],
	lines:[	'rgb(0, 24, 217)','rgb(0, 10, 89)','rgb(0, 16, 145)','rgb(0, 19, 166)',
			'rgb(240, 240, 230)','rgb(230, 230, 220)','rgb(255, 255, 255)'
	],
	lineColorNames: ['Bright Blue',"Eggshell"]
}

palette_04 = {
	bg:[
		{
			name:'Ochre',
			color:'rgb(163, 129, 35)'
		},
		{
			name:'Deep Green',
			color:'rgb(5, 20, 0)'
		},
		{
			name:'Turned Earth',
			color:'rgb(40, 40, 00)'
		},
		{
			name:'Sky Gray',
			color:'rgb(100, 125, 160)'
		},
		{
			name:'Light Ochre',
			color:'rgb(225, 160, 100)'
		},
		{
			name:'Pale Rose',
			color:'rgb(250, 200, 200)'
		},
	],
	lines:[	'rgb(255, 232, 60)','rgb(250, 250, 90)','rgb(255, 255, 220)','rgb(255, 255, 160)',
			'rgb(45, 84, 35)','rgb(35, 100, 35)','rgb(15, 85, 5)','rgb(160, 180, 150)'
	],
	lineColorNames: ['Gold',"Drab"]
}

palette_05 = {
	bg:[
		{
			name:'French Gray',
			color:'rgb(140, 130, 120)'
		},
		{
			name:'Parchment',
			color:'rgb(255, 255, 230)'
		},
		{
			name:'Charcoal',
			color:'rgb(40, 40, 40)'
		},
		{
			name:'Mustard',
			color:'rgb(255, 205, 79)'
		},
		{
			name:'Dull Cadet',
			color:'rgb(90, 140, 190)'
		},
		{
			name:'Pale Rose',
			color:'rgb(180, 110, 110)'
		},
	],
	lines:[	'rgb(0, 24, 255)','rgb(0, 255, 89)','rgb(255, 255, 20)','rgb(0, 255, 255)','rgb(255, 72, 200)',
			'rgb(255, 150, 0)','rgb(255, 150, 120)','rgb(240, 180, 240)','rgb(207, 146, 17)'
	],
	lineColorNames: ['Wild Style']
}

var palettePile = [
	palette_00, palette_01, palette_02, palette_03, palette_04, palette_05
]

// The hashTable that sat here mapped thirty-six minted hashes to fixed
// palette-and-ground pairs, and getMatchingPalette() honoured it. Those
// palettes no longer exist, so neither could survive meaningfully. Both
// remain in the Record-of-Pursuit repository.

var pNum, preset, colorList, myBGNum, myBG, lineColors, titleParts;

// Everything the hash decides about colour, in a function so a new hash can be
// dealt in without reloading the page.
//
// The original drew one of six hand-written palettes and one of its six grounds
// at random, so some iterations came out as near-neighbours with nothing
// separating line from field. A scheme now picks the relationship first and
// places the colours in OKLCH, which guarantees they hold apart.
function selectPalette() {
	const chosen = HGPalette.build(fxrand, { inkCount: 8, minSeparation: 0.34, darkGround: true });

	colorList = chosen.inks.map((ink) => 'rgb(' + ink.rgb.join(', ') + ')');
	myBG = 'rgb(' + chosen.ground.rgb.join(', ') + ')';

	// Two names carry the title, as they always did.
	const names = [];
	for (const ink of chosen.inks) {
		if (!names.includes(ink.name)) names.push(ink.name);
		if (names.length === 2) break;
	}
	lineColors = names.length > 1 ? names[0] + ' & ' + names[1] : names[0];

	titleParts = {
		lineCount: systemSize,
		lineColor: lineColors,
		background: chosen.ground.name,
		scheme: chosen.scheme,
		title: systemSize + ' ' + lineColors + ' Lines Seeking on a ' + chosen.ground.name + ' Field'
	};
}

selectPalette();

function draw() {
	
	ctx.fillStyle = 'rgba(0,0,0,1)';
	
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	// layer04.clearRect(0, 0, WIDTH, HEIGHT);
	// layer03.clearRect(0, 0, 1920, 1920);
	// layer02.clearRect(0, 0, 1920, 1920);
	layer01.clearRect(0, 0, WIDTH, HEIGHT);

	// UPDATE PARTICLE SYSTEM
	if (system && paused != true){
		system.update();
	}
		
	// const shadowOffset = 10;
	// this.shadAlpha = .1;

	// // Draw Shadow 1
	// layer03.globalCompositeOperation = "source-over"; 
	// layer03.drawImage(layer01Elem,shadowOffset,shadowOffset,1920,1920);
	// layer03.globalCompositeOperation = "source-in";
	// layer03.fillStyle = "hsla(0,0%,0%,"+this.shadAlpha+")";  // saturation at 100%
	// layer03.fillRect(0,0,1920,1920);  // apply the comp filter

	// // Draw Shadow 2
	// layer04.globalCompositeOperation = "source-over";
	// layer04.drawImage(layer02Elem,shadowOffset,shadowOffset,1920,1920);
	// layer04.globalCompositeOperation = "source-in";
	// layer04.fillStyle = "hsla(0,0%,0%,"+this.shadAlpha+")";  // saturation at 100%
	// layer04.fillRect(0,0,1920,1920);  // apply the comp filter

	// layer03.globalCompositionOperation = "overlay";
	// layer04.globalCompositionOperation = "screen";
	// layer03.globalCompositionOperation = "screen";
	// layer02.globalCompositionOperation = "screen";
	// layer01.globalCompositionOperation = "screen";
	layer02.globalCompositeOperation = "source-over"; 

	// Copy 1 into 3
	// layer04.fillStyle = myBG;//'rgba(100,250,250,1)';
	// layer04.fillRect(0, 0, 1920, 1920);
	
	var scaleFactorUp = 1.002;
	var scaleFactorDown = .999;
	var scaleAmount = (WIDTH * scaleFactorUp)-WIDTH;
	var scaleHalf = scaleAmount / 2;
	
	var scaleAmountDown = (WIDTH * scaleFactorDown)-WIDTH
	var scaleHalfDown = scaleAmountDown / 2;

	// layer04.scale(1, 1);
	// layer04.scale(scalefactor, scaleFactor);

	var sx = 0;
	var sy = 0;
	var sWidth = WIDTH;
	var sHeight = HEIGHT;
	var dx = 0-scaleHalf/2;
	var dy = 0-scaleHalf/2;
	var dWidth = WIDTH + scaleHalf;
	var dHeight = HEIGHT + scaleHalf;
	// layer02.save();
	// layer01.save();
	// layer02.globalCompositionOperation = "source-over";
	// layer01Elem.globalAlpha = 0.01;
	// layer02Elem.globalAlpha = 0.01;
	// layer01.globalAlpha = 0.01;
	// layer02.globalAlpha = 0.01;
	// layer02.drawImage(layer04Elem,0,0,1920,1920);
	// layer02.drawImage(layer01Elem,0,0,1920,1920);
	// layer02.drawImage(layer01Elem,2,0,1920,1920);
	// layer02.restore()
	// layer01.restore();

	// layer02.fillStyle = "hsla(0,0%,0%,.10)";
	// layer02.fillRect(0,0,1920,1920); 

	layer04.clearRect(0, 0, WIDTH, HEIGHT);
	layer04.globalCompositionOperation = "overlay";
	// layer03.globalCompositionOperation = "source-over";
	
	// layer04.drawImage(layer03Elem, sx, sy, sWidth, sHeight, (Math.abs(scaleHalfDown)), (Math.abs(scaleHalfDown)), (1920 * scaleFactorDown), (1920 * scaleFactorDown));
	// layer04.drawImage(layer03Elem, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

	// layer04.drawImage(layer03Elem,0-scaleHalf,0-scaleHalf,1920+scaleHalf,1920+scaleHalf)

	// layer03.clearRect(0, 0, 1920, 1920);
	// layer04.globalAlpha = .2;
	
	// layer04.fillStyle = "hsla(0,0%,0%,.02)";
	// layer04.fillRect(0,0,1920,1920); 

	const diffuseRate = 10;
	// layer04.globalAlpha = 0.25;
	
	layer04.drawImage(layer02Elem, 0, 0, WIDTH, HEIGHT)
	// layer04.drawImage(layer02Elem,diffuseRate,			diffuseRate,				1920+diffuseRate,		1920+diffuseRate)
	// layer04.drawImage(layer02Elem,0-diffuseRate,		0-diffuseRate,				1920-diffuseRate,		1920-diffuseRate)
	// layer04.drawImage(layer02Elem,0-diffuseRate,		diffuseRate,				1920+diffuseRate,		1920)
	// layer04.drawImage(layer02Elem,0,					0-diffuseRate,				1920,					1920-diffuseRate)

	// layer04.fillRect(0,0,1920,1920); 

	// layer04.drawImage(layer03Elem,2,0,1922,1920)
	// layer04.drawImage(layer03Elem,0,2,1920,1922)


	// layer03.drawImage(layer04Elem,0,0,1920,1920)
	
	// layer03.drawImage(layer01Elem,0,0,1920,1920);
	// layer03.drawImage(layer02Elem,0,0,1920,1920);
	
	// Copy 3 into 4

	// layer04.globalAlpha = 0.25;
	// layer04.drawImage(layer03Elem,0,0,1920,1920)
	
	// layer03.drawImage(layer01Elem,0,0,1920,1920);
	// layer03.drawImage(layer02Elem,0,0,1920,1920);
	
	// Blur 4
	// layer04.filter = 'blur(20px)';

	// layer04._blurRect(0,100,1920,1920, 2)
	// Copy 4 into 3
	// var blurredData = layer04.getImageData(0,0,1920,1920);
	// layer03.drawImage(layer04Elem,0,0,1920,1920);
	
	// Composite Layers
	// ctx.drawImage(layer04Elem, 0, 0, 1920,1920);
	ctx.drawImage(layer01Elem, 0, 0, WIDTH, HEIGHT);
	// ctx.drawImage(layer02Elem, 0, 0, 1920,1920);
}

function initParticleSystem(){
	system = new ParticleSystem();
	system.init(systemSize);
	// document.getElementById("canvas").style.setProperty('background-color',  myBG);
	document.getElementById("HMCmain").style.setProperty('background-color',  myBG);
}

function ParticleSystem(){
}

ParticleSystem.prototype.init = function(_systemSize){
	this.list = [];
	var i = 0;
	for(i=0; i < _systemSize; i++){
		this.createParticle(i);
	}

	setTimeout(() => {fxpreview()}, 9000);
}

ParticleSystem.prototype.createParticle = function(_id){
	var newParticle = new Particle();
	newParticle.init(_id);
	this.list.push(newParticle);
}

var autoRetargetTime;
ParticleSystem.prototype.update = function(){
	this.moveTargets();

	var i = 0;
	for(i = 0; i < systemSize; i++){
		this.list[i].draw();
	}
}


function getNewTarg(_num){

	var tList = Object.entries(targetList);
	var tNum
	// _num = null;
	if (_num == null){
		tNum = Math.floor(fxrand()*tList.length);
		tTarg = tList[tNum];
		return tTarg[1].name;
	} else {
		return targetOrder[_num];
	}

}

ParticleSystem.prototype.moveTargets = function(){

	for (const [n, t] of Object.entries(targetList)) {
		var targObj, hardCenter;
		
		if (typeof t.parent === 'string') {
			targObj = targetList[t.parent];
			hardCenter = {x:targObj.x, y:targObj.y};
		} else if (t.parent === false){
			hardCenter = {x:WIDTH/4,y:HEIGHT/2};
		} else if (typeof t.parent === 'object') {
			hardCenter = {x:t.parent.x, y:t.parent.y};
		}

		var dd = t.v;
		if (dd > 0){
			t.a += Math.acos(1-Math.pow(dd/t.r,2)/2);
		} else {
			t.a -= Math.acos(1-Math.pow(dd/t.r,2)/2);
		}

		var newX = hardCenter.x;// + t.orbitR * Math.cos(t.a);
		var newY = hardCenter.y;// + t.orbitR * Math.sin(t.a);

		t.x = newX;
		t.y = newY;
	}

}

function Particle(_id){
	// Particle
}

var particleCount = {
	type: {
		orbit:0,
		wander:0,
		spiral:0
	},
	thickness: {
		hairline: 0,
		thin: 0,
		medium: 0,
		thick: 0
	}
};

function countSystem(_p, _w){
	particleCount.type[_p]++;
	particleCount.thickness[_w]++;
}

Particle.prototype.init = function(_id){
	setColor(this);
	this.id=_id;

	pursuitList = ["orbit", "wander", "spiral"];
	lineTypeList = ["static","pulse","shake","dashed"];
	lineWidthList = ["hairline","thin","medium","thick"];

	const pNum = Math.round(fxrand()*(pursuitList.length - 1));
	const ltNum = Math.round(fxrand()*(lineTypeList.length - 1));
	const lwNum = Math.round(fxrand()*(lineWidthList.length - 1));

	this.pType = pursuitList[pNum];
	this.lType = lineTypeList[ltNum];
	this.wType = lineWidthList[lwNum];

	countSystem(this.pType, this.wType);

	this.partnerSwap = true;
	this.lineW = fxrand() * 60 + .5;//10;
	if (this.wType == "hairline"){}
	switch(this.wType) {
		case "hairline":
			this.lineW = 4 * stageScale;
		  	break;
		case "thin":
			this.lineW = 8 * stageScale;
		  	break;
		case "medium":
			this.lineW = 12 * stageScale;
			break;
		case "thick":
			this.lineW = 20 * stageScale;
			break;
		case "veryThick":
			this.lineW = 30 * stageScale;
			break;
		default:
		  this.lineW = 10 * stageScale;
	}

	this.lineMaxL = Math.round(fxrand()*15+40);
	this.lineL = this.lineMaxL;
	this.targetRadius = 40 * stageScale;
	this.displayRadius = 20 * stageScale;
	this.maxForceReserve = fxrand()*.45+.05;

	this.spiralGrow = true;
	this.spiralChange = ((fxrand()*.25)+2.75) * stageScale;
	this.orbitSpin = ((fxrand()*.25)+1.75) * stageScale;//fxrand()*1+2.5;
	this.counterClock = false;
	this.wanderWait = 200;

	this.targNum = this.id;

	if (this.id >= 16){
		this.targNum = this.id-16;
	}
	
	this.targName = getNewTarg(this.targNum);
	this.targObj = targetList[this.targName];
	// Enter from beyond the frame at a random point on a random edge, rather
	// than beginning life already sitting on the target. The approach machinery
	// below is unchanged: partnerSwap keeps each line homing on its target until
	// it arrives, then hands over to orbit, spiral or wander. All thirty-two
	// converge on the grid together.
	const entrySpan = Math.max(WIDTH, HEIGHT);
	const entryMargin = entrySpan * 0.14 + fxrand() * entrySpan * 0.33;
	const entryEdge = Math.floor(fxrand() * 4);
	if (entryEdge === 0) {
		this.position = new Vector(fxrand() * WIDTH, -entryMargin);           // above
	} else if (entryEdge === 1) {
		this.position = new Vector(WIDTH + entryMargin, fxrand() * HEIGHT);   // right
	} else if (entryEdge === 2) {
		this.position = new Vector(fxrand() * WIDTH, HEIGHT + entryMargin);   // below
	} else {
		this.position = new Vector(-entryMargin, fxrand() * HEIGHT);          // left
	}
	this.centerPoint = new Vector(this.targObj.x, this.targObj.y);
	this.targetAngle = 0;

	this.velocity = new Vector(0, 0);
	this.acceleration = new Vector(0, 0);
	this.maxSpeed = 3.5 * stageScale;//15;//fxrand()*10+10;
	this.maxForce = 1.25 * stageScale;
	this.timeSwitchMax = 800;//fxrand()*1000+100;//20 * 60;
	this.timeSeeking = 0;
	this.locHistory = [];
	this.squareCorner = 0;
	this.localTarget = new Vector(0, 0);
}


Particle.prototype.draw = function(){
	
	this.timeSeeking++;
	if (this.timeSeeking > this.timeSwitchMax){
		this.partnerSwap = true;
		// this.maxSpeed = 3.5 * stageScale; //15;//fxrand()*10+10;
		// this.maxForce = 5;//1.25;
		// this.lineL = 1;
		if (this.id >= 16){
			this.targNum--;
		} else {
			this.targNum++;
		}
		if (this.targNum < 0 ){
			this.targNum = targetOrder.length - 1;
		}
		if (this.targNum >= targetOrder.length){
			this.targNum = 0
		}
		this.targName = getNewTarg(this.targNum);
		this.targObj = targetList[this.targName];
		this.timeSeeking = 0;
	} else {
		//this.lineL = this.lineMaxL
	}

	// Arrive at partner
	if (this.partnerSwap == true && this.position.dist(this.targObj) < 40 * stageScale){
		this.partnerSwap = false;
		this.centerPoint.x = this.targObj.x;
		this.centerPoint.y = this.targObj.y;
	}

	// ALERT! Something went wrong assigning a behavior 
	if (this.pType != "wander" && this.pType != "orbit" && this.pType != "spiral"){
		// this.pType = "orbit";
		console.log("NOT KNOWN!", this.pType);
	}
	// this.pType = "spiral";


	this.targetVector = new Vector(this.targObj.x, this.targObj.y);
	if (this.partnerSwap == false){
		// this.lineL = 30;
		if (this.lineL < this.lineMaxL){
			this.lineL+=.05;
		}
		this.maxSpeed = 3.5 * stageScale;//15;//fxrand()*10+10;
		this.maxForce = 1.25 * stageScale;
		this.orbit();
		
	} else {
		this.maxForce = .2 * travelScale;
		this.maxSpeed = 5 * travelScale;
		const halfLength = 10;//Math.ceil(this.lineL / 3);  
				if (this.lineL > halfLength){
			this.lineL-=2;
		}

		this.locHistory = this.locHistory.splice(-this.lineL);
	}	

	// Seek
	let force = new Vector(0,0);
	force = this.targetVector.sub(this.position);
	force = force.sub(this.velocity);

	force = force.limit(this.maxForce);

	// Apply Force
	this.acceleration = this.acceleration.add(force);
	
	// Locomotion
	this.velocity = this.velocity.add(this.acceleration);
	this.velocity = this.velocity.limit(this.maxSpeed);

	this.position = this.position.add(this.velocity);
	this.acceleration.set(0,0);
	
	this.updateHistory(this.position);
	this.render(this.position, this.id);

}

Particle.prototype.orbit = function(_pType){
	var targetRadius = this.targetRadius;

	if (this.pType == "orbit"){
		this.maxForce = .5 * stageScale;
		var dd = this.orbitSpin;//2.5;//t.v;
		this.lineL = this.lineMaxL * 1.5;
		if (this.id > 16){
			dd *= -1;
			targetRadius *= 1.3;
		}
		
		// if (this.set == "16" ){ dd = dd * -1; }
		if (dd > 0){
			this.targetAngle += Math.acos(1-Math.pow(dd/targetRadius,2)/2);
		} else {
			this.targetAngle -= Math.acos(1-Math.pow(dd/targetRadius,2)/2);
		}

		this.localTarget.x = this.centerPoint.x + targetRadius * Math.cos(this.targetAngle);
		this.localTarget.y = this.centerPoint.y + targetRadius * Math.sin(this.targetAngle);
		this.targetVector = this.localTarget;
	}

	if (this.pType == "spiral"){
		this.maxForce = this.maxForceReserve * stageScale;
		var dd = this.orbitSpin;//1.5;//t.v;
		this.lineL = this.lineMaxL * 1.15;

		var minD = 2 * stageScale;

		var spiralChange = .01 * stageScale;//this.spiralChange;//.2;
		if (this.spiralGrow == true && this.displayRadius < this.targetRadius) {
			this.displayRadius += this.spiralChange;
			// this.lineW += fxrand()*3-fxrand()*3;
			dd *= -1;
		}
		if (this.spiralGrow == true && this.displayRadius >= this.targetRadius){
			this.spiralGrow = false;
		}

		if (this.spiralGrow == false && this.displayRadius > minD) {
			this.displayRadius -= this.spiralChange;
			// this.lineW += fxrand()*3-fxrand()*3;
		}
		if (this.spiralGrow == false && this.displayRadius <= minD){
			this.spiralGrow = true;
		}

		
		if (this.displayRadius < minD){
			this.displayRadius = minD;
		}

		// if (this.set == "16" ){ dd = dd * -1; }
		if (dd > 0){
			this.targetAngle += Math.acos(1-Math.pow(dd/this.displayRadius,2)/2);
		} else {
			this.targetAngle -= Math.acos(1-Math.pow(dd/this.displayRadius,2)/2);
		}

		// if (this.lType == "shake"){
		// 	var shakeA = 30;
		// 	var shakeR = fxrand()*shakeA - fxrand()*shakeA;
		// 	targetRadius += shakeR;
		// }

		this.localTarget.x = this.centerPoint.x + this.displayRadius * Math.cos(this.targetAngle);
		this.localTarget.y = this.centerPoint.y + this.displayRadius * Math.sin(this.targetAngle);
		this.targetVector = this.localTarget;
	}


	if (this.pType == "wander"){
		this.maxForce = .5 * stageScale;
		var dd = 1.05 * stageScale;//t.v;
		this.lineL = this.lineMaxL * 1.75;
		this.displayRadius = this.targetRadius * 1.15;

		if (this.id > 16){
			dd *= -1;
			this.displayRadius = this.targetRadius * 1.4;
		}
		
		// if (this.set == "16" ){ dd = dd * -1; }
		if (dd > 0){
			this.targetAngle += Math.acos(1-Math.pow(dd/this.displayRadius,2)/2);
		} else {
			this.targetAngle -= Math.acos(1-Math.pow(dd/this.displayRadius,2)/2);
		}

		// if (this.lType == "shake"){
			var shakeA = 50;
			var shakeR = fxrand()*shakeA - fxrand()*shakeA;
			targetRadius += shakeR;
		// }

		this.localTarget.x = this.centerPoint.x + targetRadius * Math.cos(this.targetAngle);
		this.localTarget.y = this.centerPoint.y + targetRadius * Math.sin(this.targetAngle);
		this.targetVector = this.localTarget;
	}
}
Particle.prototype.updateHistory = function(_newLoc){
	this.locHistory.push(_newLoc);
	if (this.locHistory.length > this.lineL){
		this.locHistory.shift();
	}
}

Particle.prototype.render = function(_to,_id){

	// console.log("FROM TO:",_from.x, _to.x)
	var _x = _to.x;
	var _y = _to.y;

	var lastLoc = this.locHistory[0];
	var particleLayer = layer01;
	particleLayer.lineCap = "round";
	particleLayer.lineJoin = "round";
	particleLayer.lineWidth = this.lineW;

	particleLayer.shadowOffsetX = 1;
	particleLayer.shadowOffsetY = 1;
	particleLayer.shadowColor = myBG;
	particleLayer.shadowBlur = 10;


	// particleLayer.setLineDash([this.lineW*4, this.lineW*2]);
	// particleLayer.fillStyle = "rgb(255,255,0);";
	// circle(_to.x,_to.y,10,particleLayer);

	// particleLayer.fillStyle = this.color;
	// circle(_x,_y,40,particleLayer);

	
	var tempLineW = this.lineW;

	particleLayer.strokeStyle = this.color;
    particleLayer.beginPath();
    particleLayer.moveTo(lastLoc.x,lastLoc.y);

	for (let i = 1; i < this.locHistory.length; i++) {
		const iLoc = this.locHistory[i];
		
		
		particleLayer.lineTo(iLoc.x,iLoc.y);
		// tempLineW -= .1;
		if (this.lType == "shake"){
			var shakeW = fxrand()*10 - fxrand()*10;
			shakeW = 0;
			particleLayer.lineWidth = tempLineW + shakeW;
		} else {
			particleLayer.lineWidth = tempLineW;
		}
		
	}

    particleLayer.stroke();
	
	////////////////////
	// History Layer

	var historyLayer = layer02;
	historyLayer.lineCap = "round";
	historyLayer.lineJoin = "round";
	historyLayer.lineWidth = this.lineW;
	
	// historyLayer.shadowOffsetX = 10;
	// historyLayer.shadowOffsetY = 10;
	// historyLayer.shadowColor = this.color;
	// historyLayer.shadowBlur = 20;

	var historyColor = this.color;
	historyColor = historyColor.slice(0, 3) + "a" + historyColor.slice(3);
	var HCL = historyColor.length;
	historyColor = historyColor.slice(0, HCL-1) + ", .1" + historyColor.slice(HCL-1);

	if (this.partnerSwap == false){
		historyLayer.strokeStyle = historyColor;
		historyLayer.beginPath();
		historyLayer.moveTo(lastLoc.x,lastLoc.y);

		for (let i = 1; i < this.locHistory.length; i++) {
			const iLoc = this.locHistory[i];
			
			
			historyLayer.lineTo(iLoc.x,iLoc.y);
			// tempLineW -= .1;
			if (this.lType == "shake"){
				var shakeW = fxrand()*10 - fxrand()*10;
				shakeW = 0;
				historyLayer.lineWidth = tempLineW + shakeW;
			} else {
				historyLayer.lineWidth = tempLineW;
			}
			
		}

		historyLayer.stroke();
	}
}




// Chooses Grayscale or color image
function setColor(targ){
	var c = Math.round(fxrand() * (colorList.length-1));
	var myColor = colorList[c];
	targ.color = myColor;
}


function controlLineWidth(_num){
	//systemSize = _num;
	lineW = _num;
	//initParticleSystem();
}

function controlSystemSize(_num){
	systemSize = _num;
	initParticleSystem();
}

