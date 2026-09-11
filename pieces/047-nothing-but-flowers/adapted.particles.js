// Line Drawing Particle System
//

var _r;
var _g;
var _b;
var _a = .5;
var rad = 100;
var particleList;
var system;
var particleColor;
var systemSize; // dealt by selectIteration(): Math.round(fxrand()*30+50)
var lots = true;
// var hashMatch = false;

var dx = 2;
var dy = 4;
var lineColor = 'rgba(255,0,100,.2)';
var particleCount = 0;
var particleList = {}; 

var paused = false;
var targLoc, systemTarg;
var lineW = 3.5;

const centerX = 1920/2;
const centerY = 1920/2;

var gridUnit = 512;
var gridMargin = 384/2;

var targetList = {};
var targetShapes = ["circle","ring","ring","ring","square","fill","frame","sides"];
var targetShape = targetShapes[4]; // dealt by selectIteration()

var showSolarSystem = false;

//////////
// NAMED COLORS

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



palette_Mono00 = {
	bg:[
		{
			name:'Vibrant Olive',
			color:'rgb(30, 67, 24)'
		},
	],
	lines:[	'rgb(60, 97, 54)','rgb(80, 117, 74)','rgb(100, 137, 94)','rgb(20, 57, 14)'
	],
	lineColorNames: ['Light Olive']
}

palette_Mono01 = {
	bg:[
		{
			name:'Periwinkle',
			color:'rgb(89, 109, 205)'
		},
	],
	lines:[	'rgb(109, 129, 225)', 'rgb(129, 149, 245)', 'rgb(149, 169, 255)', 'rgb(69, 89, 185)'
	],
	lineColorNames: ['Periwinkle Mono']
}

palette_Mono02 = {
	bg:[
		{
			name:'Mustard',
			color:'rgb(255, 205, 79)'
		},
	],
	lines:[	'rgb(235, 175, 49)', 'rgb(225, 165, 39)', 'rgb(255, 225, 99)'
	],
	lineColorNames: ['Butter']
}
palette_Mono03 = {
	bg:[
		{
			name:'Parchment',
			color:'rgb(235, 235, 210)'
		},
	],
	lines:[	'rgb(225, 225, 190)','rgb(205, 205, 170)','rgb(195, 195, 160)','rgb(255, 255, 255)'
	],
	lineColorNames: ['Linen']
}

palette_03 = {
	bg:[
		{
			name:'Periwinkle',
			color:'rgb(89, 109, 205)'
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
			name:'Turned Earth',
			color:'rgb(40, 40, 00)'
		},
		{
			name:'Mustard',
			color:'rgb(255, 205, 79)'
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
	palette_Mono00, palette_Mono01, palette_Mono02, palette_Mono03, palette_00, palette_03, palette_04, palette_05, palette_05,
]
// palettePile = [
// 	palette_04
// ]

var pNum, colorList, myBGNum, myBG, lineColors, titleParts;

// Everything the hash decides before the system starts, in a function so a new
// hash can be dealt in without reloading the page. The four draws happen in the
// order the original made them at the top level of this file: line count,
// target shape, palette, ground.
function selectIteration() {
	systemSize = Math.round(fxrand()*30+50);//30;//32;//16;//250;
	targetShape = targetShapes[Math.floor(fxrand()*(targetShapes.length))];
	pNum = Math.round(fxrand() * (palettePile.length-1));

	// pNum = 5;
	colorList = palettePile[pNum].lines;
	myBGNum = Math.round(fxrand() * (palettePile[pNum].bg.length-1));

	//myBGNum = 1
	myBG = palettePile[pNum].bg[myBGNum].color;

	//////

	lineColors = palettePile[pNum].lineColorNames;
	if (lineColors.length > 1){
		lineColors = lineColors[0] + " & " + lineColors[1];
	} else {
		lineColors = lineColors[0];
	}

	titleParts = {
		lineCount: systemSize,
		lineColor: lineColors,
		shape: capitalizeFirstLetter(targetShape),
		background: palettePile[pNum].bg[myBGNum].name,
		title: systemSize + " "+ lineColors +" Lines Seeking Targets on a " + capitalizeFirstLetter(targetShape),
	}
}

selectIteration();

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// console.log("TITLES::", titleParts);

function draw() {

	ctx.clearRect(0, 0, 1920, 1920);
	layer01.clearRect(0, 0, 1920, 1920);
	ctx.fillStyle = myBG;
	ctx.fillRect(0, 0, maxW, maxH);

	// UPDATE PARTICLE SYSTEM
	if (system && paused != true){
		system.update();
	}

	// Composite Layers
	// ctx.drawImage(layer05Elem, 0, 0, 1920,1920);
	ctx.drawImage(layer04Elem, 0, 0, 1920,1920);
	// ctx.drawImage(layer02Elem, 0, 0, 1920,1920);
	// layer01.globalCompositeOperation = 'source-in';
	// layer01.drawImage(layer05Elem, 0, 0, 1920, 1920);
	// layer01.globalCompositeOperation = "source-over";
	ctx.drawImage(layer01Elem, 0, 0, 1920,1920);
	
	// Targets to show
	if (showSolarSystem == true){
		layer03.globalCompositeOperation = "source-over";
		layer03.clearRect(0, 0, 1920, 1920);
		layer03.fillStyle = 'rgba(255,0,0,1)';
		var tList = Object.entries(targetList);
		for (let sb = 0; sb < tList.length; sb++) {
			const sbObj = tList[sb];
			circle(sbObj[1].x, sbObj[1].y, sbObj[1].r, layer03);
		}
		ctx.drawImage(layer03Elem, 0, 0, 1920,1920);
	}
}

function initParticleSystem(){
	system = new ParticleSystem();
	system.initTargets();
	system.moveTargets();
	system.init(systemSize);
	// document.getElementById("canvas").style.setProperty('background-color',  myBG);
	document.getElementById("HMCmain").style.setProperty('background-color',  myBG);
}

function ParticleSystem(){
}

ParticleSystem.prototype.initTargets = function() {
	targetList = {
		Sun: {
			name:"Sun",
			parent:false,
			x:centerX,
			y:centerX,
			r:50,
			v:.1,
			a:0,
			orbitR:0
		}
	}

	let targetCount = Math.round(fxrand()*8+15)
	
	let largeDone = 0;
	let largeMax = 3;
	let mediumDone = 0;
	let mediumMax = 3;

	if (targetShape == "ring"){
		largeMax = targetCount;
	}

	if (targetShape == "fill" || targetShape == "frame" || targetShape == "sides" || targetShape == "square" ){
		targetCount = 500;
	}

	for (let newTarg = 0; newTarg < targetCount; newTarg++) {
		let maxRad = 420;//1920/2 - 400;
		let minRad = 120;
		if (largeDone < largeMax){
			minRad = 400;
			largeDone++;
		} else if (mediumDone < mediumMax){
			minRad = 300;
			mediumDone++;
		}

		const planetChance = .80;
		let maxVel = .05;
		let minVel = .01;

		let ntTarg = "Sun";
		if (fxrand() > planetChance){
			// Pick a random solar body to orbit
			// const listCount = targetList.length;
			// const moonWho = Math.round(fxhash()*targetList.length-1);
			maxRad = 50;
			minRad = 30;
			ntTarg = getNewTarg(); //targeList[moonWho].name;
		}

		let ntVel = fxrand()*maxVel + minVel;
		if (fxrand() > .5){ ntVel *= -1; }

		let ntOrbit = fxrand()*maxRad + minRad;
		let radiusMod = 1 - ((ntOrbit / maxRad)*.1);
		if (fxrand() > planetChance){
			radiusMod = 1;
		}

		ntVel *= radiusMod;
		
		let ntAngle = Math.round(fxrand()*360);
		
		let ntName = "SolarBody_"+newTarg;
		// if (fxrand() > planetChance){
		// 	// Pick a random solar body to orbit
		// 	// const listCount = targetList.length;
		// 	// const moonWho = Math.round(fxhash()*targetList.length-1);
		// 	ntTarg = getNewTarg(); //targeList[moonWho].name;
		// }


		var newTargObj = {
			name: ntName,
			x: centerX,
			y: centerY,
			v: ntVel,
			a: ntAngle,
			r: 10,
			parent: ntTarg,
			orbitR: ntOrbit
		}

		targetList[ntName] = newTargObj;

	}

	this.targetBuildComplete = true;
}

ParticleSystem.prototype.init = function(_systemSize){
	// Chance of pure scribble strain = 1 in 32
	const pureChance = Math.round(fxrand()*32);

	let pureStrain = false;
	if (pureChance == 1){ pureStrain = true}

	this.list = [];
	var i = 0;
	// for(i=0; i < _systemSize; i++){
	// 	this.createParticle(i, pureStrain);
	// }
	

	percentSystem();
	setTimeout(() => {fxpreview()}, 30000);
}


ParticleSystem.prototype.createParticle = function(_id, _pureStrain){
	var newParticle = new Particle();
	newParticle.init(_id, _pureStrain);
	this.list.push(newParticle);
}

var autoRetargetTime;

let delayTime = 10;
ParticleSystem.prototype.update = function(){
	
	if (delayTime > 4){
		delayTime = 0;
		if (this.list.length < systemSize){
			this.createParticle(1, false);
		}
	}
	delayTime++;

	if (this.targetBuildComplete){
		this.moveTargets();
	}

	var i = 0;
	// for(i = 0; i < systemSize; i++){
		for(i = 0; i < this.list.length-1; i++){
		this.list[i].draw();
	}
}


function getNewTarg(_num){

	var tList = Object.entries(targetList);
	var tNum
	// _num = null;
	if (tList.length > 1){
		tNum = Math.floor(fxrand()*(tList.length-1)+1);
		tTarg = tList[tNum];
		return tTarg[1].name;
	} else {
		tTarg = tList[0];
		return tTarg[1].name;
	}



}

let resetSquare = true;
let resetSquareCount = 0;
ParticleSystem.prototype.moveTargets = function(){

	for (const [n, t] of Object.entries(targetList)) {

		

		var targObj = targetList[t.parent];
		
		
		var hardCenter = {x:1920/2,y:1920/2}; // Used for the sun
		if (targObj){
			hardCenter = {x:targObj.x, y:targObj.y};
		}

		// increase the angle of rotation
		var dd = t.v; //.05;
		if (t.v > 0){
			t.a += Math.acos(1-Math.pow(dd/t.r,2)/2);
		} else {
			t.a -= Math.acos(1-Math.pow(dd/t.r,2)/2);
		}
		// var hardCenter = 1920/2 //{x:targetList[t.parent].x, y:targetList[t.parent].y}; //1920/2;
		// calculate the new ball.x / ball.y
		var newX = hardCenter.x + t.orbitR * Math.cos(t.a);
		var newY = hardCenter.y + t.orbitR * Math.sin(t.a);

		if (targetShape == "square" || targetShape == "fill" || targetShape == "sides" || targetShape == "frame"){ 
			if (resetSquare == true){
				let pad = 400;
				if (targetShape == "fill"){
					pad = 0;
				}
				newX = fxrand() * (maxW-pad*2) + pad;
				newY = fxrand() * (maxH-pad*2) + pad;

				if (targetShape == "sides"){
					pad = 600;
					if (fxrand() > .5){
						// Right Side
						newY = maxH - (fxrand() * pad);	
						newX = (fxrand() * maxW);		
					} else {
						// Left Side
						newY = (fxrand() * pad);
						newX = (fxrand() * maxW);		
					}
					// if (fxrand() > .5){
					// 	// Top
					// 	newY = maxH - (fxrand() * pad);		
					// } else {
					// 	// Bottom
					// 	newY = (fxrand() * pad);
					// }
				}

				if (targetShape == "frame"){
					let side = Math.floor(fxrand()*4);

					if (side == 0){
						// Right Side
						newX = maxW - (fxrand() * pad);
						newY = (fxrand() * (maxH - pad*2))+pad;		
					} else if (side == 1){
						// Left Side
						newX = (fxrand() * pad);
						newY = (fxrand() * (maxH - pad*2))+pad;		
					} else if (side == 2){
						// Top
						newX = (fxrand() * maxW);
						newY = (fxrand() * pad);
					} else {
						// Bottom
						newX = (fxrand() * maxW);
						newY = maxH - (fxrand() * pad);
					}
					if (n == "Sun" || n == "SolarBody_0" || n == "SolarBody_1" || n == "SolarBody_2" || n == "SolarBody_3"){
						newX = maxW / 2 + (fxrand() * 60) - (fxrand() * 60);
						newY = maxH / 2 + (fxrand() * 60) - (fxrand() * 60);
					}

				}

			} else {
				// stay put
				newX = t.x;
				newY = t.y;
			}

		}

		t.x = newX;
		t.y = newY;

	}

	if (targetShape == "square" || targetShape == "fill" || targetShape == "sides" || targetShape == "frame"){
		resetSquare = false;
		resetSquareCount++;
		if (resetSquareCount > 4020){
			resetSquare = true;
			resetSquareCount = 0;
		}
	}

}

function Particle(_id){
	// Particle
}

var particleCount = {
	type: {
		orbit:0,
		wander:0,
		spiral:0,
		follow:0
	},
	thickness: {
		hairline: 0,
		thin: 0,
		medium: 0,
		thick: 0
	}
};
var particlePercent = {
	type: {
		orbit:"0%",
		wander:"0%",
		spiral:"0%",
		follow:"0%"
	},
	thickness: {
		hairline:"0%",
		thin:"0%",
		medium:"0%",
		thick:"0%"
	}
};

function countSystem(_p, _w){
	particleCount.type[_p]++;
	particleCount.thickness[_w]++;
}
function percentSystem(){
	particlePercent.type.orbit = Math.round((particleCount.type.orbit / systemSize)*100) + "%";
	particlePercent.type.wander = Math.round((particleCount.type.wander / systemSize)*100) + "%";
	particlePercent.type.spiral = Math.round((particleCount.type.spiral / systemSize)*100) + "%";
	particlePercent.type.follow = Math.round((particleCount.type.follow / systemSize)*100) + "%";

	particlePercent.thickness.hairline = Math.round((particleCount.thickness.hairline / systemSize)*100) + "%";
	particlePercent.thickness.thin = Math.round((particleCount.thickness.thin / systemSize)*100) + "%";
	particlePercent.thickness.medium = Math.round((particleCount.thickness.medium / systemSize)*100) + "%";
	particlePercent.thickness.thick = Math.round((particleCount.thickness.thick / systemSize)*100) + "%";

	if (particlePercent.type.wander == "100%"){
		titleParts.title = systemSize + " "+ lineColors +" Lines Scribbling on a " + palettePile[pNum].bg[myBGNum].name + " Field"
	}
	
}

Particle.prototype.init = function(_id, _pureStrain){

	setColor(this);
	this.id=_id;

	pursuitList = ["wander","orbit","spiral","follow"];
	pursuitList = ["wander"];
	// lineTypeList = ["static","pulse","shake","dashed"];
	lineWidthList = ["hairline","thin","medium","thick","veryThick"];
	//_pureStrain = true;
	if (_pureStrain == true){
		pursuitList = ["wander"];
	}
	const pNum = Math.round(fxrand()*(pursuitList.length - 1));
	// const ltNum = Math.round(fxrand()*(lineTypeList.length - 1));
	const lwNum = Math.round(fxrand()*(lineWidthList.length - 1));

	this.pType = pursuitList[pNum];
	this.orbitAngle = 0;
	this.orbitRad = fxrand() * 100 + 20;
	this.orbitDD = fxrand()*3+1;//6.05;
	this.wType = lineWidthList[lwNum];

	countSystem(this.pType, this.wType);

	this.partnerSwap = true;
	this.lineW = fxrand() * 60 + .5;//10;
	if (this.wType == "hairline"){}
	switch(this.wType) {
		case "hairline":
			this.lineW = 2;
		  	break;
		case "thin":
			this.lineW = 6;
		  	break;
		case "medium":
			this.lineW = 12;
			break;
		case "thick":
			this.lineW = 18;
			break;
		case "veryThick":
			this.lineW = 24;
			break;
		default:
		  this.lineW = 10;
	}

	this.lineMaxL = 5; // Math.round(fxrand()*15+40);
	this.lineL = this.lineMaxL;
	this.targetRadius = 240;
	this.wanderRadius = fxrand()*60+50;
	this.wanderShake = fxrand()*50+50;
	this.wanderDD = fxrand()*1.75+.75//2.5;//.75;//fxrand()*1.5+.5;
	this.displayRadius = 20;
	this.maxForceReserve = fxrand()*.45+.05;

	this.spiralGrow = true;
	this.spiralChange = (fxrand()*.25)+2.75;
	this.orbitSpin = (fxrand()*.25)+1.75;//fxrand()*1+2.5;
	this.counterClock = false;
	this.wanderWait = 200;

	this.targNum = this.id;

	// if (this.id >= 16){
	// 	this.targNum = this.id-16;
	// }
	
	this.targName = getNewTarg();
	this.targObj = targetList[this.targName];
	const startOffsetR = 100;
	const startOffsetX = (fxrand() * startOffsetR) - (fxrand() * startOffsetR);
	const startOffsetY = (fxrand() * startOffsetR) - (fxrand() * startOffsetR);
	this.position = new Vector(this.targObj.x + startOffsetX, this.targObj.y + startOffsetY); //new Vector(fxrand()*1320+300, fxrand()*1320+300); //new Vector(this.targObj.x, this.targObj.y);
	
	this.centerPoint = new Vector(this.targObj.x, this.targObj.y);
	this.targetAngle = fxrand() * (Math.PI * 2);

	this.velocity = new Vector(0, 0);
	this.acceleration = new Vector(0, 0);
	this.maxSpeed = 9.5;//15;//fxrand()*10+10;
	this.maxForce = 2.25;
	this.timeSwitchMax = fxrand()*700+600;//800;
	this.timeSeeking = 0;
	this.locHistory = [];
	this.squareCorner = 0;
	this.localTarget = new Vector(0, 0);

	this.historyColor = this.color;
	this.historyColor = this.historyColor.slice(0, 3) + "a" + this.historyColor.slice(3);
	var HCL = this.historyColor.length;
	this.historyColor = this.historyColor.slice(0, HCL-1) + ", .5" + this.historyColor.slice(HCL-1);

	this.historyLayer = layer04;
	this.historyLayer.lineCap = "round";
	this.historyLayer.lineJoin = "round";
	this.historyLayer.lineWidth = this.lineW;

	this.particleLayer = layer01;
	this.particleLayer.lineCap = "round";
	this.particleLayer.lineJoin = "round";
	this.particleLayer.lineWidth = this.lineW;
}


Particle.prototype.draw = function(){
	
	// Pick a partner
	this.timeSeeking++;
	if (this.timeSeeking > this.timeSwitchMax){
		this.partnerSwap = true;
		this.targName = getNewTarg();
		this.targObj = targetList[this.targName];
		this.timeSeeking = 0;
	} else {
		//this.lineL = this.lineMaxL
	}

	// Arrive at partner
	if (this.partnerSwap == true && this.position.dist(this.targObj) < 80){
		this.partnerSwap = false;
		this.centerPoint.x = this.targObj.x;
		this.centerPoint.y = this.targObj.y;
	}

	
	if (this.partnerSwap == false){
		// Orbit target
		this.orbit();
	} else {
		// or seek target
		this.targetVector = new Vector(this.targObj.x, this.targObj.y);
	}	

	
	// 

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
	/*
	if (this.pType == "follow"){
		if (!this.targObj){
			this.targName = getNewTarg();
			this.targObj = targetList[this.targName];
		}

		if (!this.targetVector){
			this.targetVector = new Vector(this.targObj.x, this.targObj.y);
		}
		this.targetVector.x = this.targObj.x;
		this.targetVector.y = this.targObj.y;
	}

	if (this.pType == "orbit"){

		let orbitCenter = {x:this.targObj.x, y:this.targObj.y};

		// increase the angle of rotation
		let orbitRad = this.orbitRad;
		let dd = this.orbitDD;

		this.orbitAngle += Math.acos(1-Math.pow(dd/orbitRad,2)/2);
		var newX = orbitCenter.x + orbitRad * Math.cos(this.orbitAngle);
		var newY = orbitCenter.y + orbitRad * Math.sin(this.orbitAngle);

		this.localTarget.x = newX;
		this.localTarget.y = newY;

		this.targetVector = this.localTarget;
	}

	if (this.pType == "spiral"){
		var dd = 3;

		var minD = 2;
		var spiralChange = .1;
		if (this.spiralGrow == true && this.displayRadius < this.targetRadius) {
			this.displayRadius += this.spiralChange;
		}
		if (this.spiralGrow == true && this.displayRadius >= this.targetRadius){
			this.spiralGrow = false;
		}

		if (this.spiralGrow == false && this.displayRadius > minD) {
			this.displayRadius -= this.spiralChange;
		}
		if (this.spiralGrow == false && this.displayRadius <= minD){
			this.spiralGrow = true;
		}

		
		if (this.displayRadius < minD){
			this.displayRadius = minD;
		}

		if (dd > 0){
			this.targetAngle += Math.acos(1-Math.pow(dd/this.displayRadius,2)/2);
		} else {
			this.targetAngle -= Math.acos(1-Math.pow(dd/this.displayRadius,2)/2);
		}

		let spiralCenter = {x:this.targObj.x, y:this.targObj.y};
		this.localTarget.x = spiralCenter.x + this.displayRadius * Math.cos(this.targetAngle);
		this.localTarget.y = spiralCenter.y + this.displayRadius * Math.sin(this.targetAngle);
		this.targetVector = this.localTarget;
	}
	*/

	if (this.pType == "wander"){
		// this.maxForce = .5;
		var dd = this.wanderDD;

		if (dd > 0){
			this.targetAngle += Math.acos(1-Math.pow(dd/this.wanderRadius,2)/2);
		} else {
			this.targetAngle -= Math.acos(1-Math.pow(dd/this.wanderRadius,2)/2);
		}

		// if (this.lType == "shake"){
			var shakeA = this.wanderShake;
			var shakeR = fxrand()*shakeA - fxrand()*shakeA;
			var tempRadius = this.wanderRadius + shakeR;
		// }

		this.localTarget.x = this.centerPoint.x + tempRadius * Math.cos(this.targetAngle);
		this.localTarget.y = this.centerPoint.y + tempRadius * Math.sin(this.targetAngle);
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

	
	var _x = _to.x;
	var _y = _to.y;

	var lastLoc = this.locHistory[0];


	var transpColor = this.color;
	var tempLineW = this.lineW;
	this.particleLayer.strokeStyle = transpColor;

	// if (this.partnerSwap == false){
	// 	this.particleLayer.strokeStyle = this.color;
	// }
	
    this.particleLayer.beginPath();
    this.particleLayer.moveTo(lastLoc.x,lastLoc.y);

	for (let i = 1; i < this.locHistory.length; i++) {
		const iLoc = this.locHistory[i];	
		
		this.particleLayer.lineTo(iLoc.x,iLoc.y);
		// tempLineW -= .1;
		this.particleLayer.lineWidth = tempLineW;
		
	}

    this.particleLayer.stroke();
	
	////////////////////
	// History Layer



	if (this.partnerSwap == false || this.pType == "follow"){

		// Shadow
		this.historyLayer.strokeStyle = myBG;
		this.historyLayer.beginPath();
		this.historyLayer.moveTo(lastLoc.x+tempLineW,lastLoc.y+tempLineW);

		for (let i = 1; i < this.locHistory.length; i++) {
			const iLoc = this.locHistory[i];
			this.historyLayer.lineTo(iLoc.x+tempLineW,iLoc.y+tempLineW);
			this.historyLayer.lineWidth = 3;			
		}

		this.historyLayer.stroke();
		this.historyLayer.strokeStyle = this.historyColor;
		this.historyLayer.beginPath();
		this.historyLayer.moveTo(lastLoc.x,lastLoc.y);

		for (let i = 1; i < this.locHistory.length; i++) {
			const iLoc = this.locHistory[i];
			this.historyLayer.lineTo(iLoc.x,iLoc.y);
			this.historyLayer.lineWidth = tempLineW;			
		}

		this.historyLayer.stroke();
	}
}




// Chooses Grayscale or color image
function setColor(targ){
	var c = Math.round(fxrand() * (colorList.length-1));
	var myColor = colorList[c];
	targ.color = myColor;
	// Eraser Lines
	const eraserChance = fxrand();
	if (eraserChance > .85){
		targ.color = myBG;
	}
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

