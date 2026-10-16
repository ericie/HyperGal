// Check the shipped simulation: ballistics, volleys, hazards, persistence and pause.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../pieces/059-moon-orchard/orchard.js', import.meta.url), 'utf8').replace(/\}\)\(\);\s*$/, `
  globalThis.check = {
    update, draw, resize, save, toggle, crater,
    get state() { return {w,h,ground,planet,shots,obstacles,ufos,bombs,trees,time,rotation,jump,jumps,craters,paused}; },
    set scene(s) { if (s.obstacles) obstacles=s.obstacles; if (s.bombs) bombs=s.bombs; if (s.shots) shots=s.shots; if (s.ufos) ufos=s.ufos; },
  };
})();`);
function setup(width = 1280, height = 720, storage = new Map(), reduced = false) {
  let seed = 59, frame;
  const math = Object.create(Math);
  math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const events = {}, attributes = {}, colors = new Set();
  const context = new Proxy({}, {get: (o,k) => o[k] ?? (() => {}), set: (o,k,v) => {if(k === 'fillStyle' || k === 'strokeStyle') colors.add(v); o[k]=v; return true;}});
  const canvas = {getContext: () => context, dataset: {}, addEventListener: (k,v) => events[k]=v, setAttribute: (k,v) => attributes[k]=v};
  const env = {Math: math, innerWidth: width, innerHeight: height, document: {querySelector: () => canvas, hidden: false, activeElement: canvas, addEventListener: (k,v) => events[k]=v},
    localStorage: {getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v)}, matchMedia: () => ({matches: reduced}),
    addEventListener: (k,v) => events[k]=v, requestAnimationFrame: f => {frame=f;}};
  vm.createContext(env); vm.runInContext(source, env);
  return {env, check: env.check, events, attributes, colors, storage, frame: t => frame(t)};
}
for (const [width,height] of [[1280,720],[390,844],[844,390]]) {
  const sim = setup(width,height), {check} = sim;
  assert.ok(check.state.planet.r > check.state.w, 'moon wider than screen');
  assert.ok(check.state.planet.y < -check.state.h * .5, 'moon center far offscreen');
  assert.ok(check.state.planet.y + check.state.planet.r < check.state.h * .25, 'only shallow limb visible');
  const bursts = [];
  let previous = new Set(), maxJump = 0, sawSmall = false, sawBig = false;
  for(let i=0;i<60*120;i++) {
    check.update(1/60);
    const s = check.state;
    const fresh = s.shots.filter(shot => !previous.has(shot));
    if(fresh.length) bursts.push(s.time);
    previous = new Set(s.shots);
    for(const shot of s.shots) assert.ok(shot.up ? shot.vx === 0 && shot.vy < 0 : shot.vx > 0 && shot.vy === 0, 'shots have no diagonal velocity');
    maxJump = Math.max(maxJump,s.jump);
    sawSmall ||= s.obstacles.some(o => o.kind === 'rock' && o.size < 16);
    sawBig ||= s.obstacles.some(o => o.kind === 'rock' && o.size > 22);
    if(i % 60 === 0) check.draw();
  }
  const intervals = bursts.slice(1).map((t,i) => t - bursts[i]);
  assert.ok(intervals.filter(t => t < .15).length > 50, 'closely spaced shots within bursts');
  assert.ok(intervals.filter(t => t > 1).length > 20, 'clear rest between bursts');
  assert.ok(maxJump > 30 && maxJump < 40, 'short controlled hops');
  assert.ok(sawSmall && sawBig, 'both rock sizes spawn');
  assert.ok(check.state.craters > 0, 'UFO bombs reach ground and make holes');
  assert.ok(check.state.trees.length > 0, 'vertical shots plant on the oversized moon');
  assert.deepEqual([...sim.colors].sort(), ['#000','#fff'], 'all drawing colors monochrome');
  check.save();
  const restored = setup(width,height,sim.storage);
  assert.equal(restored.check.state.trees.length,check.state.trees.length,'orchard survives reload');
  assert.equal(restored.check.state.time,check.state.time,'growth time survives reload');
  sim.events.keydown({code:'Space', repeat:false, preventDefault(){}});
  const frozen = check.state.time;
  sim.frame(1000); sim.frame(1033); sim.frame(1066);
  assert.equal(check.state.time,frozen,'pause freezes simulation');
  sim.events.keydown({code:'Space', repeat:true, preventDefault(){}});
  assert.equal(check.state.paused,true,'held Space does not flicker pause');
  sim.env.innerWidth = height; sim.env.innerHeight = width; check.resize();
  assert.equal(check.state.trees.length,restored.check.state.trees.length,'resize preserves forest');
  console.log(`${width} × ${height}: 2 minutes; ${check.state.craters} bomb craters, ${check.state.trees.length} trees, peak hop ${maxJump.toFixed(1)}px; burst fire, persistence and pause passed.`);
}
const sim = setup(), {check} = sim, {ground,w} = check.state;
check.scene = {obstacles: [], ufos: [], bombs: [{x:w*.7,y:ground-1,vx:0,vy:100}], shots: []};
check.update(.02);
assert.ok(check.state.obstacles.some(o => o.kind === 'pit' && o.bomb), 'bomb impact leaves a pit');
const x = check.state.obstacles[0].x;
check.update(.1);
assert.ok(check.state.obstacles[0].x < x, 'new crater scrolls with terrain');
check.scene = {obstacles: [{x:w*.23+20,kind:'pit',size:28}], bombs: [], shots: []};
check.update(.02);
assert.ok(check.state.jump > 0, 'autopilot jumps bomb-created terrain hazards');
const rock = {x:w*.7,kind:'rock',size:26,hp:3};
check.scene = {obstacles:[rock],shots:[],ufos:[]};
for(let i=0;i<3;i++) {
  check.scene = {shots:[{x:rock.x-2,y:ground-13,vx:270,vy:0,up:false}]};
  check.update(.01);
  assert.equal(check.state.obstacles.length, i < 2 ? 1 : 0, 'large rock takes a full three-hit volley');
}
const small = {x:w*.7,kind:'rock',size:11,hp:1};
check.scene = {obstacles:[small],shots:[{x:small.x-2,y:ground-10,vx:270,vy:0,up:false}],ufos:[]};
check.update(.01);
assert.equal(check.state.obstacles.length,0,'low forward shot breaks the smallest rock in one hit');
const reduced = setup(390,844,new Map(),true);
reduced.frame(1000); reduced.frame(1033);
assert.equal(reduced.check.state.time,0,'reduced motion starts paused');
const failedStorage = new Map(); failedStorage.set = () => {throw new Error('storage blocked');};
setup(390,844,failedStorage).check.save();
console.log('Bomb-to-crater interaction, three-hit rocks, reduced motion and unavailable storage passed.');
