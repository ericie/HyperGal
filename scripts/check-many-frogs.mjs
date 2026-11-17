// Collision equivalence, autonomous lifecycle, rendering cache and timing checks.
// No browser dependency: simulation work is measured separately from rasterization.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { performance } from 'node:perf_hooks';

const target = new URL('../pieces/038-many-frogs/index.html', import.meta.url);
function simulation(file = target, reduced = false) {
  const html = fs.readFileSync(file, 'utf8');
  const source = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const events = {}, frames = new Map();
  let frameId = 0, surfaces = 0, clock = 0, textDraws = 0;
  const noop = () => {};
  const paints = [];
  const counter = { textContent: '' };
  const context = new Proxy({globalAlpha: 1}, {
    get: (o, k) => o[k] ?? (k === 'fillText' ? () => textDraws++ : ['fill', 'fillRect', 'stroke', 'strokeRect'].includes(k)
      ? () => paints.push({kind: k, color: k.startsWith('stroke') ? o.strokeStyle : o.fillStyle, alpha: o.globalAlpha, width: o.lineWidth}) : noop),
    set: (o, k, v) => (o[k] = v, true)
  });
  const canvas = () => { surfaces++; return { getContext: () => context, style: {} }; };
  const env = {
    Math, console, performance: { now: () => clock },
    Date: class extends Date { static now() { return 1000000; } },
    window: { innerWidth: 1126, innerHeight: 1056, devicePixelRatio: 1,
      matchMedia: () => ({ matches: reduced }), addEventListener: (name, fn) => events[name] = fn },
    document: { querySelector: selector => selector === '#remaining-frogs' ? counter : canvas(), createElement: canvas, hidden: false,
      addEventListener: (name, fn) => events[name] = fn },
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id)
  };
  vm.createContext(env);
  vm.runInContext(source.replace('window.__manyFrogs = {', `window.__test = {
    update, draw, getLane, laneObjectsAt, laneDanger, hitsVehicleAt, addDeathMark,
    updateDeathMarks, completeCrossing, crossingX, destinationY, movementTarget, positionDanger, shoreApproachScore,
    worldToScreenY, screenToWorldY, hopY, steeringTarget, vehicleSteeringAt,
    get moves() { return moveOptions; },
    ageFrog, killFrog, beginHop, frogBodyScale, drawVehicle, drawDeathMarks,
    get frogs() { return frogs; }, get marks() { return deathMarks; },
    get rows() { return ROWS; }, get cols() { return COLS; }
  }; window.__manyFrogs = {`), env);
  return { env, events, frames, paints, counter, api: env.window.__manyFrogs, test: env.window.__test,
    get surfaces() { return surfaces; }, get textDraws() { return textDraws; },
    frame(dt = 1000 / 60) {
      clock += dt;
      const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(clock));
    }
  };
}

const sim = simulation();
const state0 = sim.api.getState();
assert.equal(state0.rows, 5);
assert.equal(state0.roadRows, 1, 'exactly one traffic lane is visible');
assert.ok(Math.abs(state0.roadHeightFraction-0.78)<1e-12);
assert.ok(state0.initialFrogs>=24,'the whole group is already present on load');
assert.equal(state0.live,state0.initialFrogs);assert.equal(Number(sim.counter.textContent),state0.initialFrogs);
for(const heading of [1,-1]) {
  const group=state0.frogs.filter(frog=>frog.heading===heading);
  assert.equal(group.length,state0.initialFrogs/2,'each bank starts with exactly half the frogs');
  assert.ok(group.every(frog=>heading>0 ? sim.test.worldToScreenY(frog.y)>1056*.89 : sim.test.worldToScreenY(frog.y)<1056*.11));
}
const road = sim.test.getLane(state0.fieldRows);
for (let row=0;row<state0.rows;row++) {
  assert.equal(sim.test.getLane(row).type, row===state0.fieldRows?'road':'grass');
}
assert.equal(road.direction, 1, 'traffic has one consistent direction');
let samples=0;
for(let i=0;i<300;i++) {
  const x=(i*1.71371)%sim.test.cols, at=i*.11331, duration=.32;
  const expected=sim.test.laneObjectsAt(road,at).some(car=>x>car.x-.16&&x<car.x+car.length+.16);
  assert.equal(sim.test.hitsVehicleAt(road,x,at),expected);
  const swept=Array.from({length:33},(_,n)=>at+n*duration/32).some(t=>
    sim.test.laneObjectsAt(road,t).some(car=>x>car.x-.16&&x<car.x+car.length+.16));
  if(swept) assert.equal(sim.test.laneDanger(road,x,at,duration),100);
  samples++;
}
// Individual dimensions and speeds vary; followers remain behind leaders.
const profiles=new Map();
for(let i=0;i<240;i++) {
  const at=i*.137;
  const cars=sim.test.laneObjectsAt(road,at);
  cars.forEach(car=>profiles.set(car.id,car));
  const visible=cars.filter(car=>car.x<sim.test.cols&&car.x+car.length>0).sort((a,b)=>a.x-b.x);
  for(let n=1;n<visible.length;n++) {
    assert.ok(visible[n-1].x+visible[n-1].length<=visible[n].x-.35+1e-8,
      'different speeds never let a follower overlap a leader inside the view');
  }
}
const lengths=[...profiles.values()].map(car=>car.length), speeds=[...profiles.values()].map(car=>car.speed);
assert.ok(Math.max(...lengths)/Math.min(...lengths)>1.5,'cars visibly vary in length');
assert.ok(Math.max(...speeds)/Math.min(...speeds)>1.4,'cars visibly vary in travel speed');
assert.ok(new Set([...profiles.values()].map(car=>car.height.toFixed(3))).size>5,'body widths vary too');
const oldCars=sim.test.laneObjectsAt(road,0).map(car=>({id:car.id,x:car.x,speed:car.speed}));
sim.test.laneObjectsAt(road,1000);
assert.ok(road.profiles.size<=256,'traffic history has a bounded profile cache');
assert.deepEqual(sim.test.laneObjectsAt(road,0).map(car=>({id:car.id,x:car.x,speed:car.speed})),oldCars,
  'forecast and render queries reproduce identical trajectories');
const screenAtTop=sim.test.worldToScreenY(2.5),screenAtBottom=sim.test.worldToScreenY(1.5);
assert.ok(Math.abs((screenAtBottom-screenAtTop)/1056-.78)<1e-12,'road occupies 78% of screen height');
for(const y of [-.35,.5,1.5,1.8,2.5,3.5,state0.exitY]) {
  assert.ok(Math.abs(sim.test.screenToWorldY(sim.test.worldToScreenY(y))-y)<1e-10);
}
const halfway=sim.test.hopY(1.2,2.1,.5);
assert.ok(Math.abs(sim.test.worldToScreenY(halfway)-(sim.test.worldToScreenY(1.2)+sim.test.worldToScreenY(2.1))/2)<1e-8,
  'hops travel smoothly across the stretched road and narrow banks');

// Drivers choose the clear side; rendered displacement and collision geometry agree.
const dodge=simulation(), dodgeLane=dodge.test.getLane(2);
const dodgeCar=dodge.test.laneObjectsAt(dodgeLane,0).find(car=>car.id===0);
assert.ok(dodge.test.steeringTarget(dodgeCar,[{offset:.35,time:.7}],0)<0,'dodge upward around a lower frog');
assert.ok(dodge.test.steeringTarget(dodgeCar,[{offset:-.35,time:.7}],0)>0,'dodge downward around an upper frog');
assert.equal(dodge.test.steeringTarget(dodgeCar,[],0),0,'empty roads need no swerve');
dodgeLane.steering.set(dodgeCar.id,{offset:.4,target:.9,atTime:0});
const steeringBefore=JSON.stringify([...dodgeLane.steering]);
for(let i=0;i<160;i++) {
  const x=(i*1.371)%dodge.test.cols,offset=-1.9+(i*1.119)%3.8,at=.23;
  const expected=dodge.test.laneObjectsAt(dodgeLane,at).some(car=>{
    const dx=x-car.x-car.length/2,dy=offset-car.offset;
    const along=dx*Math.cos(car.angle)+dy*Math.sin(car.angle);
    const across=-dx*Math.sin(car.angle)+dy*Math.cos(car.angle);
    return Math.hypot(Math.max(0,Math.abs(along)-car.length/2),Math.max(0,Math.abs(across)-car.height/2))<.16;
  });
  const y=dodge.test.screenToWorldY(dodge.test.worldToScreenY(2)+offset*1056/5);
  assert.equal(dodge.test.positionDanger(x,y,at,0)===100,expected,'collisions follow the translated, rotated car');
}
assert.equal(JSON.stringify([...dodgeLane.steering]),steeringBefore,'forecast queries never change steering');
sim.test.draw();const surfaces=sim.surfaces;sim.test.draw();assert.equal(sim.surfaces,surfaces);
assert.equal(sim.textDraws,0,'the canvas has no text overlays');

// Success is recorded once, then the frog walks away without a return or death.
const finish=simulation();
for(const heading of [1,-1]) {
  const winner=finish.test.frogs.find(frog=>frog.heading===heading);
  winner.y=finish.test.destinationY(winner);
  finish.test.completeCrossing(winner);finish.test.completeCrossing(winner);
  assert.equal(winner.crossings,1);assert.equal(winner.heading,heading);assert.equal(winner.crossed,true);
  assert.equal(finish.test.marks.length,0,'success does not create a death mark');
  winner.y=heading>0?finish.api.getState().exitY:finish.api.getState().bottomExitY;
  finish.test.completeCrossing(winner);
  assert.equal(winner.alive,false);assert.equal(winner.finished,true);
}
assert.equal(finish.api.getState().totalCrossings,2);
assert.equal(finish.api.getState().totalExited,2);assert.equal(finish.api.getState().totalDeaths,0);

// A fixed group starts together; only traffic deaths reduce the counter.
const flow=simulation(), first=flow.test.frogs[0];first.nextMoveAt=Infinity;
const initial=flow.api.getState().initialFrogs;
for(let i=0;i<360;i++)flow.test.update(1/60);
assert.equal(first.crossings,0);
assert.equal(flow.api.getState().totalFrogs,initial,'no additional frogs arrive');
assert.equal(new Set(flow.test.frogs.map(frog=>frog.id)).size,flow.test.frogs.length);
const beforeHit=flow.api.getState().remaining;
flow.test.killFrog(first,'traffic');assert.equal(Number(flow.counter.textContent),beforeHit-1);
flow.test.killFrog(first,'traffic');assert.equal(Number(flow.counter.textContent),beforeHit-1,'a hit is counted once');
flow.api.eliminateAll();
for(let i=0;i<90;i++)flow.test.update(1/60);
assert.equal(flow.api.getState().live,0,'no frogs replenish after the group is gone');
assert.equal(flow.api.getState().totalFrogs,initial);
assert.equal(flow.api.getState().remaining,flow.api.getState().totalExited,'successful frogs remain counted');
const empty=simulation();empty.api.eliminateAll();
assert.equal(empty.counter.textContent,'0');empty.api.restart();
assert.equal(Number(empty.counter.textContent),empty.api.getState().initialFrogs,'restart restores the group');
assert.equal(empty.api.getState().totalDeaths,0);
assert.equal(Number(finish.counter.textContent),finish.api.getState().initialFrogs,'success and exit never reduce the counter');

// Frogs may occupy and traverse the same space without blocking each other.
const crowd=simulation();
const neighbors=crowd.test.frogs.slice(0,2);
for(const frog of neighbors) {
  frog.x=frog.fromX=frog.toX=1;frog.y=frog.fromY=frog.toY=.25;
  crowd.test.beginHop(frog,'up',{x:1,y:.75});
  assert.equal(frog.hop,0,'overlapping frogs can start the same hop');
}
crowd.test.update(.12);
assert.ok(neighbors.every(frog=>frog.alive&&frog.y>.25),'overlapping frogs can move together');
assert.equal(neighbors[0].y,neighbors[1].y);

// Every candidate and actual hop stays on a horizontal or vertical axis.
const free=simulation(), explorer=free.test.frogs[0];
assert.ok(free.test.moves.every(move=>move.dx===0||move.dy===0),'diagonal choices are absent');
for(const move of free.test.moves) {
  const landing=free.test.movementTarget(explorer,explorer.x,2,move);
  if(move.dx===0)assert.equal(landing.x,explorer.x,'vertical hops have no horizontal drift');
  if(move.dy===0)assert.equal(landing.y,2,'horizontal hops have no vertical drift');
}
const up=free.test.moves.find(move=>move.direction==='up');
const traveler={...explorer,y:1.5,decision:0};
let crossingHops=0;
while(traveler.y<2.5 && crossingHops<20) {
  const landing=free.test.movementTarget(traveler,traveler.x,traveler.y,up);
  traveler.y=landing.y;traveler.decision++;crossingHops++;
}
assert.ok(crossingHops>=9&&crossingHops<=13,'crossing the road takes multiple short hops');
const down=free.test.moves.find(move=>move.direction==='down');
const descending={...explorer,heading:-1,y:2.5,decision:0};
let downwardHops=0;
while(descending.y>1.5&&downwardHops<20) {
  const landing=free.test.movementTarget(descending,descending.x,descending.y,down);
  assert.equal(landing.x,descending.x);assert.ok(landing.y<descending.y);
  descending.y=landing.y;descending.decision++;downwardHops++;
}
assert.ok(downwardHops>=9&&downwardHops<=13,'downward crossings use the same short cardinal hops');
const hop=free.test.movementTarget(explorer,explorer.x,explorer.y,up);
assert.ok(hop.y>explorer.y);assert.equal(hop.x,explorer.x);
free.test.beginHop(explorer,up.direction,hop);
assert.equal(explorer.toX,hop.x);assert.equal(explorer.toY,hop.y);assert.ok(Number.isFinite(explorer.facingAngle));
const car=free.test.laneObjectsAt(road,0).find(car=>car.x>0);
assert.equal(free.test.positionDanger(car.x+.4,road.row,0,0),100);

// Frogs grow more vibrant with age; death marks remain simple, uniform strokes.
const ink=simulation(), author=ink.test.frogs[0];
const youngColor=author.color;ink.test.ageFrog(author,60);assert.notEqual(author.color,youngColor);
const young={...author,age:0,maturity:0}, old={...author,age:120,maturity:1};
ink.test.addDeathMark(young,'traffic');ink.test.addDeathMark(old,'traffic');
ink.paints.length=0;ink.test.drawDeathMarks();
assert.equal(ink.paints.length,2);assert.ok(ink.paints.every(mark=>mark.kind==='stroke'));
assert.equal(ink.paints[0].width,ink.paints[1].width,'age does not enlarge a death mark');

// Cars are outline-only, stay neutral, and never smear an existing death mark.
const paint=simulation(), victim=paint.test.frogs[0];
const drawnCar={...car,x:1};
paint.paints.length=0;paint.test.drawVehicle(road,drawnCar,0);
assert.ok(paint.paints.length>0&&paint.paints.every(mark=>mark.kind.startsWith('stroke')),'transparent cars draw only outlines');
const neutral=paint.paints.map(mark=>mark.color);paint.paints.length=0;
victim.x=car.x+car.length/2;victim.y=road.row;paint.test.killFrog(victim,'traffic');
const stain=paint.test.marks[0], before=JSON.stringify(stain);
for(let i=0;i<120;i++)paint.test.update(1/60);
assert.equal(JSON.stringify(stain),before);
paint.test.drawVehicle(road,drawnCar,0);assert.deepEqual(paint.paints.map(mark=>mark.color),neutral);

// Hidden tabs pause the round, then resume one animation loop.
sim.frame();sim.env.document.hidden=true;sim.events.visibilitychange();
assert.equal(sim.frames.size,0);const hidden=JSON.stringify(sim.api.getState());sim.frame(5000);
assert.equal(JSON.stringify(sim.api.getState()),hidden);
sim.env.document.hidden=false;sim.events.visibilitychange();assert.equal(sim.frames.size,1);
sim.frame();assert.equal(sim.frames.size,1);

for(const reduced of [false,true]) {
  const run=simulation(target,reduced);
  const startingGroup=[...run.test.frogs], originalHeadings=startingGroup.map(frog=>frog.heading);
  let swerves=0;
  for(let i=0;i<3600;i++) {
    run.test.update(1/60);
    if(i%10===0) for(const car of run.test.laneObjectsAt(run.test.getLane(2),(i+1)/60)) {
      const halfHeight=(car.height*Math.cos(car.angle)+car.length*Math.abs(Math.sin(car.angle)))/2;
      assert.ok(Math.abs(car.offset)+halfHeight<=3.9/2,'steering keeps every corner on the road');
      assert.ok(Math.abs(car.angle)<=.18+1e-8,'steering remains bounded');
      if(Math.abs(car.offset)>.05)swerves++;
    }
  }
  assert.ok(swerves>0,'drivers react to actual crossing frogs');
  const state=run.api.getState();
  assert.equal(state.totalFrogs,state.initialFrogs,'the group remains finite');
  assert.equal(state.remaining,state.initialFrogs-state.totalDeaths);
  assert.equal(Number(run.counter.textContent),state.remaining);
  assert.equal(state.live+state.totalExited+state.totalDeaths,state.initialFrogs);
  assert.ok(state.totalCrossings>0,'some attempts make it across');
  assert.ok(state.totalExited>0,'successful frogs actually leave the view');
  assert.ok(state.totalDeaths>0,'traffic still catches some attempts');
  assert.ok(startingGroup.every((frog,i)=>frog.heading===originalHeadings[i]&&frog.crossings<=1),'each frog keeps its crossing direction');
  for(const heading of [1,-1])assert.ok(startingGroup.some(frog=>frog.heading===heading&&frog.finished),'frogs exit successfully in both directions');
  assert.ok(state.frogs.every(frog=>Number.isFinite(frog.x)&&frog.y>=state.bottomExitY&&frog.y<=state.exitY));
  assert.ok(state.live<=state.initialFrogs);
  for(const [width,height] of [[390,844],[844,390],[1440,900]]) {
    run.env.window.innerWidth=width;run.env.window.innerHeight=height;run.events.resize();run.test.draw();
    const resized=run.api.getState();assert.equal(resized.roadRows,1);assert.equal(resized.rows,5);
    assert.ok(Math.abs(resized.roadHeightFraction-.78)<1e-12);assert.equal(run.textDraws,0);
    assert.equal(resized.initialFrogs,state.initialFrogs,'resize never adds frogs or resets the counter');
    assert.equal(resized.remaining,state.remaining);
    assert.ok(resized.frogs.every(frog=>frog.x>=.25&&frog.x<=resized.columns-.25));
  }
}

// Death marks remain bounded even without movement history.
const history=simulation();
for(let i=0;i<660;i++)history.test.addDeathMark(history.test.frogs[0],'traffic');
history.test.update(1/60);assert.equal(history.test.marks.length,640);
console.log(`Passed ${samples} collision/swept-window samples, ${crossingHops}-hop road crossing, 78% one-lane layout, per-car size/speed variation, following gaps, finite starting group and death-only counter, single-pass success and exit in both directions, traffic deaths, cardinal-only hops without drift, neutral cars, stationary X marks, retained death marks, hidden-tab pause, responsive resize, counter-only visible text, and normal/reduced-motion lifecycle.`);

if (process.argv.includes('--benchmark')) {
  const files = [target];
  const baseline = process.argv.find(arg => arg.startsWith('--baseline='))?.slice(11);
  if (baseline) files.unshift(baseline);
  const results = [];
  for (const file of files) {
    const run = simulation(file), times = [];
    for (let i = 0; i < 3600; i++) {
      const start = performance.now(); run.test.update(1 / 60); times.push(performance.now() - start);
    }
    times.sort((a, b) => a - b);
    results.push({ file: String(file), mean: times.reduce((a,b)=>a+b,0)/times.length,
      p95: times[3420], p99: times[3564], max: times.at(-1), state: run.api.getState() });
  }
  if (baseline) assert.deepEqual(JSON.parse(JSON.stringify(results[0].state)), JSON.parse(JSON.stringify(results[1].state)), 'same seeded 60-second outcome');
  console.log(JSON.stringify(results.map(({ state, ...result }) => ({...result, live: state.live, totalFrogs: state.totalFrogs, topFrogY: state.topFrogY})), null, 2));
}
