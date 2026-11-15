// Exercise the shipped artwork without a browser: movement, hazards and controls.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../pieces/059-moon-orchard/orchard.js', import.meta.url), 'utf8').replace(/\}\)\(\);\s*$/, `
  globalThis.check = {
    update, draw, resize, toggle, crater, collision, explode, updateWreck, terrainY, partBounds, makeRover, beginWave, updateWaves, spawnSaucer, ufoY, UFO_TYPES, spawnTurret, updateTurrets, fireWeapons, gunMuzzles, activeBurstCount, firingOpportunity, targetPosition, segmentBox, updateDepthLayers, drawDepthLayer, depthBase, buildingExit, fillCityGround,
    stepWreck(dt, moving=false) {const travel=moving?SPEED*dt:0; scroll+=travel; obstacles.forEach(o=>o.x-=travel); updateWreck(dt,travel);},
    buggyX: () => rovers[0].x,
    quiet() { obstacleClock=ufoClock=turretClock=1e6; ufos=[]; turretShots=[]; waveQueue=[]; obstacles=obstacles.filter(o=>o.kind!=='turret'&&!o.intro); rovers.forEach(r=>r.shotClock=1e6); },
    isolate() { rovers=[rovers[0]]; },
    get state() { const r=rovers[0]; return {w,h,ground,scroll,shots,sparks,obstacles,ufos,bombs,time,jump:r.jump,jumps,craters,paused,roverX:r.x,roverVX:r.vx,crashTime:r.crashTime,deaths,wreck,lastCrash:r.lastCrash,rovers,phase,cycle,grownBuildings,waveNumber,waveQueue,turretShots,depthLayers}; },
    set scene(s) { const r=rovers[0]; if(s.obstacles) obstacles=s.obstacles; if(s.bombs) bombs=s.bombs; if(s.shots) shots=s.shots; if(s.ufos) ufos=s.ufos; if(s.turretShots) turretShots=s.turretShots; if(s.time !== undefined) time=s.time; if(s.roverX !== undefined) r.x=s.roverX; if(s.roverVX !== undefined) r.vx=s.roverVX; if(s.jump !== undefined) r.jump=s.jump; if(s.velocity !== undefined) r.velocity=s.velocity; },
  };
})();`);
function setup(width = 1280, height = 720, reduced = false) {
  let seed = 59, frame, textCalls = 0;
  const math = Object.create(Math);
  math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const events = {}, attributes = {}, colors = new Set();
  const context = new Proxy({fillText: () => textCalls++, strokeText: () => textCalls++}, {
    get: (o,k) => o[k] ?? (() => {}),
    set: (o,k,v) => {if(k === 'fillStyle') colors.add(v); o[k]=v; return true;}
  });
  const canvas = {getContext: () => context, dataset: {}, addEventListener: (k,v) => events[k]=v, setAttribute: (k,v) => attributes[k]=v};
  const env = {Math: math, innerWidth: width, innerHeight: height, document: {querySelector: () => canvas, hidden: false, activeElement: canvas, addEventListener: (k,v) => events[k]=v},
    matchMedia: () => ({matches: reduced}), addEventListener: (k,v) => events[k]=v, requestAnimationFrame: f => {frame=f;}};
  vm.createContext(env); vm.runInContext(source, env);
  return {env, check: env.check, events, attributes, colors, canvas, get textCalls() {return textCalls;}, frame: t => frame(t)};
}
if (!process.argv.includes('--debris-only')) {
for (const [width,height] of [[1280,720],[390,844],[844,390]]) {
  const sim = setup(width,height), {check} = sim;
  assert.equal(check.state.rovers.length,1,'exactly one buggy');
  assert.ok(check.state.ufos.length===3,'opening three-scout formation');
  let aliveSum=0, saucerSum=0; const encounteredTypes=new Set(); let sawTurret=false, sawTurretShot=false;
  const shotLog=[];
  let previous = new Set(), maxJump = 0, sawSmall = false, sawBig = false;
  let minX = Infinity, maxX = -Infinity, previousX = check.buggyX(), forward = false, backward = false;
  for(let i=0;i<60*180;i++) {
    check.update(1/60);
    const s = check.state, x = check.buggyX();
    s.ufos.forEach(u=>encounteredTypes.add(u.type));
    sawTurret ||= s.obstacles.some(o=>o.kind==='turret'); sawTurretShot ||= s.turretShots.length>0;
    assert.ok(s.obstacles.filter(o=>o.kind==='turret').length<=3 && s.turretShots.length<=8,'turret traffic is bounded');
    aliveSum+=s.rovers.filter(r=>!r.crashTime).length; saucerSum+=s.ufos.length;
    forward ||= x > previousX + .01; backward ||= x < previousX - .01; previousX = x;
    minX = Math.min(minX,x); maxX = Math.max(maxX,x);
    for(const r of s.rovers) assert.ok(r.x>=20 && r.x<=s.w-22,'every buggy stays in bounds');
    assert.ok(s.ufos.length<=6 && s.bombs.length<=4,'crowd sizes remain bounded');
    const fresh = s.shots.filter(shot => shot.owner===0 && !previous.has(shot));
    if(fresh.length) {
      assert.equal(fresh.length,2,'each trigger releases both cannons together');
      assert.equal(fresh[0].burstId,fresh[1].burstId,'paired rounds share one burst');
      shotLog.push(...fresh);
    }
    previous = new Set(s.shots);
    for(const shot of s.shots) assert.ok((shot.vx===320 && shot.vy===0)||(shot.vx===0 && shot.vy===-320),'shots travel only straight forward or upward');
    assert.ok(check.activeBurstCount()<=3 && s.shots.length<=6,'at most three paired bursts remain airborne');
    maxJump = Math.max(maxJump,s.jump);
    sawSmall ||= s.obstacles.some(o => o.kind === 'rock' && o.size < 16);
    sawBig ||= s.obstacles.some(o => o.kind === 'rock' && o.size > 22);
    if(i % 120 === 0) check.draw();
  }
  assert.ok(aliveSum/10800>=.25 && saucerSum/10800<=6,'the patrol and slower rebirth sequence both run with fewer saucers');
  assert.equal(encounteredTypes.size,4,'all four UFO types appear during natural waves');
  assert.ok(sawTurret && sawTurretShot,'ground turrets spawn and fire during natural play');
  assert.ok(shotLog.length>30,'paired fixed firing occurs throughout natural play');
  assert.ok(shotLog.filter(s=>s.hit).length/shotLog.length>.1,'fixed paired bursts connect with real threats');
  assert.ok(forward && backward && maxX-minX > check.state.w*.08, 'rover travels both directions over a substantial range');
  assert.ok(maxJump > 55 && maxJump < 64, 'controlled automatic hops');
  assert.ok(sawSmall && sawBig, 'both rock sizes spawn');
  assert.ok(check.state.deaths > 0 && check.state.deaths <= 30, 'occasional crashes rather than repeated routine collisions');
  for (const color of ['#000000','#1024ff','#00a4bc','#00d950','#ffa65c','#ff00b8']) assert.ok(sim.colors.has(color), 'reference palette is rendered');
  assert.equal(sim.textCalls,0,'no canvas text or score');
  sim.events.keydown({code:'Space', repeat:false, preventDefault(){}});
  const frozen = check.state.time, frozenX = check.buggyX();
  sim.frame(1000); sim.frame(1033); sim.frame(1066);
  assert.equal(check.state.time,frozen,'pause freezes simulation');
  assert.equal(check.buggyX(),frozenX,'pause freezes horizontal movement');
  sim.events.keydown({code:'Space', repeat:true, preventDefault(){}});
  assert.equal(check.state.paused,true,'held Space does not flicker pause');
  sim.env.innerWidth = height; sim.env.innerHeight = width; check.resize();
  assert.ok(Number.isFinite(check.buggyX()) && check.buggyX()>=20 && check.buggyX()<=check.state.w-22,'resize keeps rover in bounds');
  console.log(`${width} × ${height}: 3 minutes; movement both ways, ${check.state.craters} bomb craters, ${check.state.jumps} hops, ${check.state.deaths} crashes; ${shotLog.filter(s=>s.hit).length}/${shotLog.length} shots hit; fixed paired fire, palette, pause and resize passed.`);
}
const sim = setup(), {check} = sim; check.isolate(); check.quiet(); const {ground,w}=check.state;
check.scene = {obstacles: [], ufos: [], bombs: [{x:w*.7,y:ground-1,vx:0,vy:100}], shots: []};
check.update(.02);
const crater = check.state.obstacles.find(o => o.kind === 'pit' && o.bomb);
assert.ok(crater,'bomb impact leaves a pit');
const oldX = crater.x;
check.update(.1);
assert.ok(crater.x < oldX,'crater scrolls with terrain');
const pit = {x:check.buggyX()+140,kind:'pit',size:34};
check.scene = {obstacles: [pit], bombs: [], shots: [], ufos: []};
for(let i=0;i<150;i++) check.update(.02);
assert.ok(check.state.jumps > 0,'moving autopilot jumps the crater');
assert.ok(check.state.obstacles.includes(pit),'jump and gunfire leave crater intact');
assert.equal(pit.size,34,'crater is never filled or shrunk');
const rock = {x:w*.8,kind:'rock',size:26,hp:3};
check.scene = {obstacles:[rock],shots:[],ufos:[]};
for(let i=0;i<3;i++) {
  check.scene = {shots:[{x:rock.x-2,y:ground-15,vx:270,vy:0,up:false}]};
  check.update(.01);
  assert.equal(check.state.obstacles.length,i<2?1:0,'large rock takes three hits');
}
const small = {x:w*.8,kind:'rock',size:11,hp:1};
check.scene = {obstacles:[small],shots:[{x:small.x-2,y:ground-7,vx:270,vy:0,up:false}],ufos:[]};
check.update(.01);
assert.equal(check.state.obstacles.length,0,'small rock breaks in one hit');
const reduced = setup(390,844,true);
reduced.frame(1000); reduced.frame(1033);
assert.equal(reduced.check.state.time,0,'reduced motion starts paused');
sim.env.document.hidden = true;
const frozen = check.state.time;
sim.frame(2000); sim.frame(2033);
assert.equal(check.state.time,frozen,'background tab does not advance simulation');
console.log('Crater permanence, moving hazard detection, rock durability, reduced motion and hidden-tab pause passed.');

// A visible hazard must be cleared while moving either forward or backward.
for (const width of [390, 1280]) for (const phase of [0,2,4,6,8,10]) for (const kind of ['pit','rock']) {
  const c=setup(width,720).check;
  c.isolate(); c.quiet();
  const x=c.state.w*.3;
  c.scene={time:phase,roverX:x,roverVX:phase<6?30:-30,obstacles:[{x:x+160,kind,size:kind==='pit'?38:26,hp:3}],ufos:[],bombs:[],shots:[]};
  for(let i=0;i<360;i++) c.update(1/60);
  assert.equal(c.state.deaths,0,`autopilot clears ${kind} at phase ${phase}, width ${width}`);
}
console.log('Isolated hazards cleared in both travel directions and across all drift phases.');

// Collisions are fatal, and a successful jump over the same hole is safe.
for (const kind of ['pit','rock','bomb']) {
  const c=setup().check;
  c.isolate(); c.quiet();
  const {roverX,ground}=c.state;
  c.scene={obstacles:kind==='bomb'?[]:[{x:roverX+(kind==='pit'?12:0),kind,size:34,hp:3}],bombs:kind==='bomb'?[{x:roverX,y:ground-15,vx:0,vy:32}]:[],ufos:[],shots:[]};
  c.update(1/60);
  assert.equal(c.state.deaths,1,`${kind} contact blows up the rover`);
  assert.ok(c.state.crashTime>0 && c.state.wreck.length>0,'crash emits visible flying wreckage');
  assert.equal(c.state.shots.length,0,'destroyed rover stops firing');
  for(let i=0;i<45;i++) c.update(1/60);
  assert.equal(c.state.deaths,1,'one collision causes one explosion');
  c.scene={obstacles:[],bombs:[],shots:[],ufos:[]};
  for(let i=0;i<900;i++) c.update(1/60);
  assert.equal(c.state.crashTime,0,'rover respawns automatically');
  assert.ok(!c.collision(c.buggyX(),c.state.jump),'respawn is on clear ground');
}
const over=setup().check;
over.isolate(); over.quiet();
over.scene={jump:40,velocity:0,obstacles:[{x:over.buggyX(),kind:'pit',size:34}]};
over.update(1/60);
assert.equal(over.state.deaths,0,'clearing a crater in the air is safe');
const pausedCrash=setup();
pausedCrash.check.isolate(); pausedCrash.check.quiet();
pausedCrash.check.scene={obstacles:[{x:pausedCrash.check.buggyX(),kind:'rock',size:26,hp:3}]};
pausedCrash.check.update(1/60);
pausedCrash.check.toggle();
const remaining=pausedCrash.check.state.crashTime;
pausedCrash.frame(1000);pausedCrash.frame(1033);
assert.equal(pausedCrash.check.state.crashTime,remaining,'pause freezes explosion and respawn timer');
console.log('Fatal pit/rock/bomb hits, safe clearance, wreckage, one explosion per crash, automatic recovery and paused crashes passed.');
for (const dt of [1/30,1/25]) for (const kind of ['pit','rock']) {
  const c=setup().check;
  c.isolate(); c.quiet();
  c.scene={time:8,roverX:150,roverVX:-30,obstacles:[{x:310,kind,size:kind==='pit'?38:26,hp:3}],ufos:[],bombs:[],shots:[]};
  for(let t=0;t<6;t+=dt)c.update(dt);
  assert.equal(c.state.deaths,0,`${kind} is cleared at ${Math.round(1/dt)}fps`);
}
console.log('30/25fps hazard clearance passed.');
const recovery=setup().check;recovery.quiet();
const victim=recovery.state.rovers[0];
recovery.scene={obstacles:[{x:victim.x+12,kind:'pit',size:20}]};
recovery.update(1/60);
assert.ok(victim.crashTime>0,'single buggy can crash');
assert.equal(recovery.state.rovers.length,1,'crash does not create extra buggies');
recovery.scene={obstacles:[],bombs:[]};
for(let i=0;i<900;i++)recovery.update(1/60);
assert.equal(recovery.state.crashTime,0,'new rover emerges from the origin');
assert.ok(recovery.state.rovers[0].generation>0,'a new rover replaces the old one');
assert.equal(recovery.state.rovers.length,1,'exactly one buggy after recovery');
console.log('Single-buggy population and recovery passed.');

}
// Wreckage uses actual buggy parts, travels in every direction, and stays put
// in terrain coordinates after friction brings it to rest.
for (const dt of [1/60,1/30,1/25]) {
  const c=setup().check;c.isolate();c.quiet();
  const r=c.state.rovers[0];r.x=c.state.w*.8;r.jump=30;
  c.explode(r,{kind:'rock'});
  const parts=[...c.state.wreck];
  assert.equal(parts.filter(p=>p.kind==='wheel').length,3,'three recognizable wheels detach');
  for(const kind of ['chassis','cockpit','cannon','mast','axle']) assert.ok(parts.some(p=>p.kind===kind),`${kind} detaches`);
  assert.ok(parts.some(p=>p.vx>20) && parts.some(p=>p.vx< -20),'parts fly left and right on screen');
  assert.ok(parts.some(p=>p.vy>20) && parts.some(p=>p.vy< -20),'parts fly up and down');
  for(let t=0;t<4;t+=dt)c.stepWreck(dt);
  const resting=c.state.wreck.filter(p=>p.settled);
  assert.ok(resting.length>=3,'wreckage lands and remains visible');
  assert.ok(c.state.wreck.every(p=>p.settled),'all visible parts eventually settle');
  const anchors=resting.map(p=>({p,worldX:p.x+c.state.scroll,y:p.y,angle:p.angle}));
  for(let t=0;t<.3;t+=dt)c.stepWreck(dt,true);
  for(const {p,worldX,y,angle} of anchors) {
    assert.ok(Math.abs(p.x+c.state.scroll-worldX)<1e-8,'resting piece is anchored to the moving terrain');
    assert.equal(p.y,y,'resting piece does not sink or bounce');
    assert.equal(p.angle,angle,'resting piece stops spinning');
    assert.equal(p.vx,0);assert.equal(p.vy,0);assert.equal(p.spin,0);
  }
}
const craterDebris=setup().check;craterDebris.isolate();craterDebris.quiet();
const r=craterDebris.state.rovers[0];
r.x=craterDebris.state.w*.8;r.jump=20;craterDebris.explode(r,{kind:'pit'});
// Place one real wheel into a crater with no lateral motion.
const wheel=craterDebris.state.wreck.find(p=>p.kind==='wheel');
craterDebris.state.wreck.splice(0,craterDebris.state.wreck.length,wheel);
wheel.x=r.x;wheel.y=craterDebris.state.ground-25;wheel.vx=0;wheel.vy=0;wheel.spin=0;wheel.angle=0;
craterDebris.scene={obstacles:[{x:r.x,kind:'pit',size:38}]};
for(let i=0;i<180;i++)craterDebris.stepWreck(1/60);
assert.ok(wheel.settled && wheel.y>craterDebris.state.ground,'wheel settles inside the hole');
const oldY=wheel.y;craterDebris.scene={obstacles:[{x:wheel.x,kind:'pit',size:60}]};
craterDebris.stepWreck(1/60);
assert.equal(wheel.settled,false,'new deeper damage releases resting wreckage');
for(let i=0;i<120;i++)craterDebris.stepWreck(1/60);
assert.ok(wheel.settled && wheel.y>oldY,'wheel comes to rest on the new crater floor');
console.log('Recognizable debris, full-direction blast, bouncing/settling at 60/30/25fps, terrain anchoring and crater floors passed.');

// Death halts all terrain, then actual settled parts become buildings and one
// ordinary building that releases the rover. The next rover must drive out before scrolling resumes.
for (const dt of [1/60,1/30,1/25]) {
  const sim=setup(), c=sim.check;c.quiet();
  const old=c.state.rovers[0];old.x=c.state.w*.45;old.jump=20;
  c.scene={obstacles:[{x:c.state.w-30,kind:'rock',size:12,hp:1}]};
  c.explode(old,{kind:'pit'});
  const frozenScroll=c.state.scroll, obstacle=c.state.obstacles[0], obstacleX=obstacle.x;
  const seen=new Set([c.state.phase]);let emergingStart=null, origin=null;
  let complete=false;
  for(let t=0;t<20;t+=dt){
    const before=c.state.phase;
    c.update(dt);const s=c.state;seen.add(s.phase);
    if(before!=='driving') {
      assert.equal(s.scroll,frozenScroll,'auto-scroll stays stopped throughout rebirth');
      assert.equal(obstacle.x,obstacleX,'terrain stays fixed while parts grow');
    }
    if(s.phase==='growing') {
      assert.ok(s.cycle.parts.every(p=>p.settled),'growth waits for every part to settle');
      assert.equal(s.cycle.buildings.length,s.cycle.parts.length,'each piece becomes a building');
      assert.equal(s.cycle.buildings.filter(b=>b.spawn).length,1,'exactly one compact garage releases the rover');
      origin=s.cycle.origin;
      s.cycle.buildings.forEach((b,i)=>{
        assert.equal(b.height,b.spawn?34:3*(b.source.kind==='wheel'?64+i*8:36+i%4*8),'compact garage preserves the large neighboring towers');
        assert.equal(b.width,b.spawn?44:3*(14+i%3*4),'garage is narrower than its former 60px width');
        assert.equal(b.door,0,'garage shutter stays closed while buildings grow');
      });
    }
    if(s.phase==='emerging') {
      if(emergingStart===null)emergingStart=s.roverX;
      assert.equal(s.cycle.buildings.every(b=>b.growth===1),true,'all buildings finish growing before the garage opens');
      assert.equal(s.rovers[0].generation,1,'the replacement rover is a new generation');
      if(s.cycle.age<.5){assert.ok(origin.door<1,'garage shutter opens before departure');assert.equal(s.roverX,c.buildingExit(origin)-44,'buggy waits for the shutter');}
      else assert.equal(origin.door,1,'shutter is clear before the buggy rolls out');
      assert.ok(s.roverX>=emergingStart,'rover drives outward through the origin');
    }
    if(before==='emerging' && s.phase==='driving'){
      assert.ok(s.roverX>c.buildingExit(origin)+17,'rover clears the garage before patrol resumes');
      const x=origin.x;c.update(dt);
      assert.ok(c.state.scroll>frozenScroll,'auto-scroll resumes after emergence');
      assert.ok(Math.abs(origin.x-(x-66*dt))<1e-8,'grown buildings stay in the world as driving resumes');
      assert.equal(c.state.rovers.length,1,'there is still exactly one rover');
      complete=true;break;
    }
  }
  assert.ok(complete,'whole rebirth cycle completes');
  assert.deepEqual([...seen],['settling','growing','emerging','driving']);
}
const pausedGrowth=setup();pausedGrowth.check.quiet();
pausedGrowth.check.explode(pausedGrowth.check.state.rovers[0],{kind:'rock'});
for(let i=0;i<600 && pausedGrowth.check.state.phase!=='growing';i++)pausedGrowth.check.update(1/60);
assert.equal(pausedGrowth.check.state.phase,'growing');
pausedGrowth.check.toggle();const age=pausedGrowth.check.state.cycle.age;
pausedGrowth.frame(1000);pausedGrowth.frame(1033);
assert.equal(pausedGrowth.check.state.cycle.age,age,'pause freezes building growth');
console.log('Stopped scrolling, all-part settlement gate, alien growth, compact-garage emergence, resumed patrol and paused growth passed.');

// A growing foreground foundation fills its overlapping hole, while nearby
// uncovered ground damage remains. Collision and terrain use the same depth.
for(const dt of [1/60,1/25]) {
 const c=setup().check;c.quiet();
 const covered={kind:'pit',x:104,size:34},untouched={kind:'pit',x:c.state.w-15,size:22};
 c.scene={obstacles:[covered,untouched],bombs:[],roverX:140};
 c.explode(c.state.rovers[0],{kind:'pit'});
 c.state.cycle.parts.forEach((p,i)=>{
  p.x=100+i*6;p.angle=0;p.vx=p.vy=p.spin=0;p.settled=true;
  const [width,height]=c.partBounds(p);
  p.y=Math.min(c.terrainY(p.x),c.terrainY(p.x-width*.35),c.terrainY(p.x+width*.35))-height/2;
 });
 const depth=c.terrainY(104)-c.state.ground,neighborDepth=c.terrainY(untouched.x)-c.state.ground;
 assert.ok(depth>10);
 for(let i=0;i<60 && c.state.phase==='settling';i++)c.update(dt);
 assert.equal(c.state.phase,'growing');assert.ok(c.state.obstacles.includes(covered),'hole persists until growth starts');
 for(let t=0;t<.4;t+=dt)c.update(dt);
 assert.ok(covered.fill>0 && covered.fill<1,'hole fills gradually with the growing foundation');
 assert.ok(c.terrainY(104)>c.state.ground && c.terrainY(104)<c.state.ground+depth,'physical floor rises with the visible fill');
 for(let i=0;i<240 && c.state.phase==='growing';i++)c.update(dt);
 assert.equal(c.state.phase,'emerging');
 assert.ok(!c.state.obstacles.includes(covered),'filled hole is removed as a hazard');
 assert.equal(c.terrainY(104),c.state.ground,'filled hole is solid level ground');
 assert.equal(c.collision(104,0),null,'filled hole cannot kill the buggy');
 assert.ok(c.state.cycle.buildings.every(b=>b.base<=c.state.ground),'city foundations rise out of filled holes');
 assert.ok(c.state.obstacles.includes(untouched),'uncovered hole remains');
 assert.equal(c.terrainY(untouched.x)-c.state.ground,neighborDepth,'nearby uncovered depth stays unchanged');
 c.crater(104,30);
 assert.ok(c.terrainY(104)>c.state.ground,'a later bomb can damage the restored ground again');
}
console.log('City-covered holes fill visibly and physically, foundations rise, nearby holes remain, and later bombs can reopen ground.');

// Growing cities blast neighboring hazards once, not only objects directly
// beneath their foundations. Nearby holes fill; distant hazards survive.
const clearance=setup().check;clearance.quiet();
const rockNear={kind:'rock',x:258,size:26,hp:3},turretNear={kind:'turret',x:146,size:18,hp:3};
const pitNear={kind:'pit',x:255,size:20},rockFar={kind:'rock',x:400,size:26,hp:3},pitFar={kind:'pit',x:440,size:20};
clearance.scene={obstacles:[rockNear,turretNear,pitNear,rockFar,pitFar]};
const city={x:200,width:60,growth:.5,base:clearance.state.ground};
clearance.fillCityGround([city]);
assert.ok(rockNear.dead&&turretNear.dead,'nearby armored rock and turret explode regardless of hit points');
assert.ok(!clearance.state.obstacles.includes(rockNear)&&!clearance.state.obstacles.includes(turretNear),'exploded hazards leave collision geometry');
assert.ok(pitNear.cityBlast&&pitNear.fill>0,'a neighboring hole is blasted and starts filling');
const sparkCount=clearance.state.sparks.length;
assert.equal(sparkCount,72,'each of the three hazards emits a visible explosion');
clearance.fillCityGround([city]);
assert.equal(clearance.state.sparks.length,sparkCount,'one city growth encounter produces only one blast per hazard');
city.growth=1;clearance.fillCityGround([city]);
assert.ok(!clearance.state.obstacles.includes(pitNear),'blasted neighboring hole finishes as solid ground');
assert.equal(clearance.terrainY(pitNear.x),clearance.state.ground);
assert.ok(clearance.state.obstacles.includes(rockFar)&&clearance.state.obstacles.includes(pitFar),'distant hazards are preserved');
assert.equal(rockFar.hp,3);assert.ok(!pitFar.fill&&!pitFar.cityBlast);
console.log('City growth blasts neighboring turrets, rocks and holes once, clears collisions, and preserves distant hazards.');

// Every generation uses one body hue with matching darker tires and inherited wreckage colors.
const colored=setup().check;colored.quiet();
const paintLuminance = hex => {
  const linear=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
};
const paintContrast = (a,b) => (Math.max(paintLuminance(a),paintLuminance(b))+.05)/(Math.min(paintLuminance(a),paintLuminance(b))+.05);
let lastColor=null;
for(let generation=0;generation<32;generation++) {
  const r=colored.makeRover(0,generation);
  assert.ok(['#ff00b8','#ff2548','#d43bff','#ff5a00'].includes(r.color),'every buggy generation contrasts with the blue/cyan/green landscape');
  assert.ok(paintLuminance(r.color)>.18,'buggy paint stays vivid instead of muddy');
  const rgb=[1,3,5].map(i=>parseInt(r.color.slice(i,i+2),16));assert.equal(Math.max(...rgb),255,'every paint has a fully saturated arcade channel');
  assert.equal(new Set(r.tireColors).size,1,'all tires share one darker shade');
  assert.notEqual(r.color,r.tireColors[0],'tires are darker than the body');
  for(const i of [1,3,5])assert.ok(Math.abs(parseInt(r.tireColors[0].slice(i,i+2),16)-parseInt(r.color.slice(i,i+2),16)*.55)<=.5,'tire RGB channels preserve the body hue at lower brightness');
  assert.notEqual(r.color,lastColor,'successive rover generations change body color');lastColor=r.color;
}
const original=colored.state.rovers[0];original.x=colored.state.w*.45;original.jump=20;
colored.explode(original,{kind:'rock'});
const wheelParts=colored.state.cycle.parts.filter(p=>p.kind==='wheel');
wheelParts.forEach((part,i)=>{
 assert.equal(part.color,original.tireColors[i],'detached wheel retains its darker matching tire paint');
 assert.equal(part.palette.K,part.color,'actual rubber sprite uses inherited tire paint');
});
colored.state.cycle.parts.filter(p=>p.kind!=='wheel').forEach(p=>assert.equal(p.color,original.color,'body wreckage retains rover paint'));
for(let i=0;i<1200 && colored.state.phase!=='emerging';i++)colored.update(1/60);
assert.equal(colored.state.phase,'emerging');
const lineage=colored.state.grownBuildings.map(b=>({b,color:b.color}));
lineage.forEach(({b,color})=>assert.equal(color,b.source.color,'building facade inherits the source part color'));
for(let i=0;i<600 && colored.state.phase!=='driving';i++)colored.update(1/60);
assert.equal(colored.state.phase,'driving');
assert.notEqual(colored.state.rovers[0].color,original.color,'new rover emerges in new paint');
lineage.forEach(({b,color})=>assert.equal(b.color,color,'old buildings keep their inherited color after the next generation appears'));

// UFO variants really differ in flight, armor and ordnance, and shots consume
// their armor one hit at a time rather than merely changing sprite color.
for(const type of ['scout','bomber','dart','carrier']) {
 const c=setup().check;c.quiet();
 c.spawnSaucer({type,x:c.state.w*.65,direction:-1,slot:0});
 const u=c.state.ufos[0],hp=u.hp;u.drop=1e6;
 for(let i=0;i<hp;i++) {
  c.scene={shots:[{x:u.x,y:c.ufoY(u),vx:0,vy:0,up:true}]};c.update(.001);
  assert.equal(c.state.ufos.includes(u),i<hp-1,`${type} needs its full armor hit count`);
 }
}
const formation=setup().check;formation.quiet();formation.beginWave();
assert.equal(formation.state.waveQueue.length,3,'bomber wave schedules a formation');
formation.updateWaves(.01);assert.equal(formation.state.ufos.length,1,'first wave member enters');
formation.updateWaves(.2);assert.equal(formation.state.ufos.length,1,'formation arrivals are staggered');
formation.updateWaves(.25);assert.equal(formation.state.ufos.length,2,'next member follows');
formation.updateWaves(.4);assert.equal(formation.state.ufos.length,3,'whole formation enters');
const wave=formation.state.waveNumber;
formation.updateWaves(20);assert.equal(formation.state.waveNumber,wave,'next wave waits for survivors to leave');
formation.scene={ufos:[]};formation.updateWaves(12);
assert.equal(formation.state.waveNumber,wave+1,'quiet gap ends with a new wave');
const delays=formation.state.waveQueue.map(u=>u.delay);
formation.explode(formation.state.rovers[0],{kind:'rock'});formation.updateWaves(10);
assert.deepEqual(formation.state.waveQueue.map(u=>u.delay),delays,'wave arrivals pause through the rebirth sequence');
console.log('Body hues, darker matching tires, wreck/building color inheritance, four UFO armor types, staggered waves, quiet gaps and rebirth-safe arrivals passed.');

// Real ground emplacements aim in both directions, fire, take damage and stop
// fighting while the death/building/origin sequence is being played out.
const guns=setup().check;guns.quiet();
guns.scene={roverX:100,roverVX:0};
const gun=guns.spawnTurret(300);
assert.ok(gun && gun.hp===3,'armored turret spawns on flat ground');
guns.updateTurrets(.7);
assert.equal(guns.state.turretShots.length,1,'turret fires from its aimed barrel');
assert.ok(guns.state.turretShots[0].vx<0 && gun.flash>0,'left-facing shot has visible recoil/flash');
guns.scene={roverX:420,roverVX:0};
for(let i=0;i<14;i++)guns.updateTurrets(.4);
assert.ok(gun.aim>-.1,'barrel turns when the rover passes to the right');
assert.ok(guns.state.turretShots.some(s=>s.vx>0),'turret can fire right');
guns.scene={jump:45};guns.updateTurrets(.3);
assert.ok(gun.aim<-.1,'barrel elevates to track an airborne rover');
const clock=gun.fireClock, shots=guns.state.turretShots.length;
guns.explode(guns.state.rovers[0],{kind:'rock'});guns.updateTurrets(3);
assert.equal(gun.fireClock,clock,'turret firing pauses during rebirth');
assert.equal(guns.state.turretShots.length,shots,'no new turret fire during rebirth');

const armored=setup().check;armored.quiet();const emplacement=armored.spawnTurret(300);
for(let i=0;i<3;i++) {
 armored.scene={shots:[{x:emplacement.x,y:armored.state.ground-12,vx:0,vy:0,up:false}]};
 armored.update(.001);
 assert.equal(armored.state.obstacles.includes(emplacement),i<2,'three actual bullet hits destroy the turret');
}
const interception=setup().check;interception.quiet();
interception.scene={turretShots:[{kind:'turret-shot',x:300,y:interception.state.ground-9,vx:0,vy:0}],shots:[{x:300,y:interception.state.ground-9,vx:0,vy:0,up:false}]};
interception.update(.001);
assert.equal(interception.state.turretShots.length,0,'buggy bullets intercept turret rounds');
const impact=setup().check;impact.quiet();
impact.scene={turretShots:[{kind:'turret-shot',x:impact.buggyX(),y:impact.state.ground-10,vx:0,vy:0}]};
impact.update(1/60);
assert.equal(impact.state.deaths,1,'turret projectile contact is fatal');
assert.equal(impact.state.phase,'settling','turret hit triggers the full rebirth sequence');
const ground=setup().check;ground.quiet();
ground.scene={obstacles:[{x:300,kind:'pit',size:38}]};
assert.equal(ground.spawnTurret(300),null,'turrets cannot spawn inside holes');
ground.scene={obstacles:[]};const blasted=ground.spawnTurret(300);ground.crater(300,32);
assert.equal(blasted.dead,true,'a bomb crater can destroy an emplacement');
console.log('Turret placement, tracking, aimed shots, three-hit armor, interception, physical impact, crater destruction and rebirth ceasefire passed.');
for(const width of [390,1280]) for(const dt of [1/60,1/25]) {
 const c=setup(width,720).check;c.quiet();const x=c.state.w*.3;
 c.scene={roverX:x,roverVX:30};const turret=c.spawnTurret(x+160);turret.fireClock=1e6;
 for(let t=0;t<6;t+=dt)c.update(dt);
 assert.equal(c.state.deaths,0,'autopilot clears an emplacement at desktop and phone frame rates');
}
console.log('Turret obstacle clearance at 60/25fps on desktop and phone passed.');

// The fixed cannons share one trigger and three airborne burst slots.
const idle=setup().check;idle.quiet();idle.scene={obstacles:[],bombs:[],ufos:[],turretShots:[]};
idle.state.rovers[0].shotClock=0;
for(let i=0;i<120;i++)idle.update(1/60);
assert.equal(idle.state.shots.length,0,'no blind firing into empty sky or terrain');
const paired=setup().check;paired.quiet();const pr=paired.state.rovers[0];pr.shotClock=0;
paired.scene={obstacles:[{x:paired.state.w*.7,kind:'rock',size:26,hp:99}]};
for(let i=0;i<3;i++) {
 paired.fireWeapons(pr,.3);
 const burst=paired.state.shots.slice(-2);
 assert.equal(burst.length,2,'one trigger creates two shots');
 assert.equal(burst[0].burstId,burst[1].burstId,'both cannons share the burst');
 assert.deepEqual(Array.from(burst,s=>[s.vx,s.vy]),[[320,0],[0,-320]],'forward and up axes are fixed');
}
assert.equal(paired.activeBurstCount(),3);
paired.fireWeapons(pr,.3);assert.equal(paired.state.shots.length,6,'fourth airborne burst is blocked');
const first=paired.state.shots[0].burstId;
paired.scene={shots:paired.state.shots.filter((s,i)=>i!==0)};
paired.fireWeapons(pr,.3);
assert.equal(paired.state.shots.length,5,'losing one round does not free its paired burst slot');
paired.scene={shots:paired.state.shots.filter(s=>s.burstId!==first)};
paired.fireWeapons(pr,.3);
assert.equal(paired.state.shots.length,6,'a slot opens only after both rounds in its burst are gone');
assert.equal(paired.activeBurstCount(),3);
assert.ok(!('guns' in pr),'buggy has no independent swiveling gun state');

const fixedHit=setup().check;fixedHit.quiet();fixedHit.scene={obstacles:[],roverX:100};
fixedHit.spawnSaucer({type:'scout',x:115,direction:-1,slot:0});
const crossing=fixedHit.state.ufos[0];crossing.y=fixedHit.state.ground-100;crossing.drop=1e6;
fixedHit.state.rovers[0].shotClock=0;
for(let i=0;i<180 && fixedHit.state.ufos.includes(crossing);i++)fixedHit.update(1/60);
assert.ok(!fixedHit.state.ufos.includes(crossing),'a UFO crossing the upward lane is physically hit');

// A fast projectile crossing a whole target in one frame must still hit.
const swept=setup().check;swept.quiet();
const tiny={x:250,kind:'rock',size:11,hp:1};
swept.scene={obstacles:[tiny],shots:[{x:235,y:swept.state.ground-6,vx:900,vy:0,up:false}]};
swept.update(.04);
assert.ok(!swept.state.obstacles.includes(tiny),'swept collision catches a target crossed between frames');
console.log('Fixed up/forward paired shots, shared trigger, three airborne burst slots, partial-pair retention, real UFO hit and swept collisions passed.');

// Depth ships hover and occasionally drop tiny decorative bombs in their own plane.
for(const [width,height] of [[1280,720],[390,844],[844,390]]) for(const dt of [1/60,1/25]) {
 const sim=setup(width,height),c=sim.check,foreground=c.state.ufos.slice();
 for(let t=0;t<60;t+=dt) {
  c.updateDepthLayers(dt,66*dt);
  for(const layer of c.state.depthLayers) {
   assert.ok(layer.ufos.length<=2,'atmospheric scenery stays bounded');
   for(const key of ['shots','debris','sparks','fired','kills','cities','cityClock','sprouts'])assert.ok(!(key in layer),'depth planes have no combat damage or growing cities');
   assert.ok(layer.bombs.length<=2 && layer.impacts.length<=3,'decorative drops and impacts stay bounded');
   for(const u of layer.ufos)assert.ok(Number.isFinite(u.x)&&Number.isFinite(u.y),'hovering positions stay finite');
  }
 }
 for(const layer of c.state.depthLayers) {
  sim.colors.clear();c.drawDepthLayer(layer);
  const allowed=new Set([layer.body,layer.shade,layer.light,'#000000']);
  for(const color of sim.colors)assert.ok(allowed.has(color),`${layer.name} scenery retains its palette`);
 }
 assert.deepEqual(c.state.ufos,foreground,'atmosphere does not touch foreground UFOs');
 assert.equal(sim.env.Math.random(),setup(width,height).env.Math.random(),'atmosphere does not consume foreground randomness');
 if(dt===1/60)console.log(`${width} × ${height}: hovering layers, rare decorative drops, no damage or city growth, and palette isolation passed.`);
}
const ambient=setup().check;ambient.quiet();ambient.scene={obstacles:[],bombs:[],shots:[]};
for(const layer of ambient.state.depthLayers) {
 const u=layer.ufos[0],x=u.x,y=u.y;
 ambient.scene={shots:[{x:u.x,y:u.y,vx:0,vy:0,life:2.4}]};ambient.update(.02);
 assert.ok(layer.ufos.includes(u)&&!u.dead,'a foreground shot overlapping a background UFO cannot hit it');
 for(let i=0;i<120;i++)ambient.updateDepthLayers(1/60,0);
 assert.ok(Math.abs(u.x-x)<10&&Math.abs(u.y-y)<4,'atmospheric ships hover gently when camera is still');
 assert.ok(Math.abs(u.x-x)>.05||Math.abs(u.y-y)>.05,'hovering has visible movement');
}
const parallax=setup().check;
for(const layer of parallax.state.depthLayers) {
 layer.clock=1e6;
 const u=layer.ufos[0],x=u.homeX;
 parallax.updateDepthLayers(.02,1.32);
 assert.ok(Math.abs(u.homeX-(x-1.32*layer.parallax-.02*2*layer.scale))<1e-8,'atmospheric ship anchor follows its layer camera and slow drift');
 const held=u.homeX;parallax.updateDepthLayers(.02,0);
 assert.ok(Math.abs(u.homeX-(held-.02*2*layer.scale))<1e-8,'stopped camera leaves only slow atmospheric drift');
}
const dimensions=setup(),before=dimensions.check.state.depthLayers.map(layer=>({base:dimensions.check.depthBase(layer),x:layer.ufos[0].x,y:layer.ufos[0].y}));
dimensions.env.innerWidth=390;dimensions.env.innerHeight=844;dimensions.check.resize();
dimensions.check.state.depthLayers.forEach((layer,i)=>{
 assert.ok(Math.abs(layer.ufos[0].x-before[i].x*390/480)<1e-8,'resize preserves horizontal depth placement');
 assert.ok(Math.abs(layer.ufos[0].y-(before[i].y+dimensions.check.depthBase(layer)-before[i].base))<1e-8,'resize anchors aerial depth actors to their own landscape');
});
console.log('Layer-specific parallax, stopped-camera anchoring, resize and foreground random-stream isolation passed.');

// Forward travel stays regular; screen drift is a slow correction to the camera.
for(const width of [390,1280]) {
 const c=setup(width,720).check;c.quiet();c.scene={obstacles:[],bombs:[],shots:[],ufos:[],turretShots:[]};
 let previous=c.state.roverVX,min=Infinity,max=-Infinity,forward=false,backward=false;
 for(let i=0;i<36*60;i++) {
  c.update(1/60);const vx=c.state.roverVX;
  assert.ok(Math.abs(vx-previous)<=54/60+1e-8,'cruise has bounded smooth acceleration');previous=vx;
  min=Math.min(min,66+vx);max=Math.max(max,66+vx);forward ||= vx>.5;backward ||= vx<-.5;
 }
 assert.ok(min>=56 && max<=78,'clear-road progress stays near its steady 66px/s rate');
 assert.ok(forward&&backward,'gentle screen drift still travels both ways');
 const r=c.state.rovers[0],ports=c.gunMuzzles(r);
 assert.ok(ports[0].x>r.x && ports[1].y<c.state.ground-r.jump-21,'fixed cannon ports face forward and up');
}
console.log('Steady forward cruise, gentle bidirectional drift, bounded acceleration and fixed cannon geometry passed.');
