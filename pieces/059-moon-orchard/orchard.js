(() => {
  'use strict';
  const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');
  const C = {
    black: '#000000', white: '#ffffff', blue: '#1024ff', cyan: '#00a4bc',
    green: '#00d950', shade: '#00a000', peach: '#ffa65c', earth: '#bf7838',
    magenta: '#d500c8', window: '#00bce8', yellow: '#dce000', red: '#ff3000', rock: '#8c7100', turret: '#a04018'
  };
  const SPEED = 66, GRAVITY = 420, LIFT = 225, ACCELERATION = 54, BUGGY_COUNT = 1, MAX_SAUCERS = 6;
  const CITY_SCALE = .9;
  const SHOT_SPEED = 320, MAX_BURSTS = 3, FIRE_GAP = .22;
  // Vivid warm arcade paints; no perimeter outline.
  const ROVER_COLORS = ['#ff00b8', '#ff2548', '#d43bff', '#ff5a00'];
  const UFO_TYPES = {
    scout: {speed: 44, hp: 1, payload: 1, interval: 3.8, amplitude: 4, frequency: 3, width: 26, height: 12},
    bomber: {speed: 28, hp: 2, payload: 2, interval: 3.4, amplitude: 3, frequency: 2, width: 32, height: 14},
    dart: {speed: 58, hp: 1, payload: 1, interval: 3.2, amplitude: 10, frequency: 4.4, width: 22, height: 8},
    carrier: {speed: 24, hp: 3, payload: 2, interval: 4.2, amplitude: 5, frequency: 1.7, width: 36, height: 16}
  };
  const UFO_WAVES = [
    ['scout','scout','scout'],
    ['bomber','scout','bomber'],
    ['dart','dart','dart','scout'],
    ['carrier','bomber','dart','scout','scout']
  ];
  const PARTS = {
    wheel: ['..KKK..','.KKCKK.','KKCCCKK','KCCWCCK','KKCCCKK','.KKCKK.','..KKK..'],
    chassis: ['MMMMMMMMMMM','MMMMMMMMMMM','MMKKKKKMMMM','MMMMMMMMMMM'],
    cockpit: ['..MMMM..','.MWWWWM.','MWWWWWMM','MMMMMMMM'],
    cannon: ['MMMMKKKKKKK','MMMMMMMMMMM'],
    mast: ['M','M','K','M','M','M','M'],
    axle: ['MMMMMMMMM','.KK...KK.'],
    panel: ['MMMMM','MMMM.','MMM..']
  };
  const PART_COLORS = {K: C.black, C: C.black, W: C.black, M: C.magenta};
  let w, h, ground, scroll = 0, time = 0, last = 0;
  let obstacleClock = .6, ufoClock = .5, turretClock = 16, bombClock = .8, jumps = 0, craters = 0, deaths = 0;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let shots = [], obstacles = [], ufos = [], bombs = [], sparks = [], turretShots = [];
  let rovers = [], wreck = [], grownBuildings = [];
  let phase = 'driving', cycle = null;
  let waveNumber = 0, waveQueue = [];
  let depthLayers = [], nextBurstId = 0, turretGroup = 0;
  const roadSpeed = () => phase === 'driving' ? SPEED : 0;
  function makeRover(id, generation = 0) {
    const color = ROVER_COLORS[generation % ROVER_COLORS.length], tireColor=darkenPaint(color);
    return {id, x: 0, vx: 0, jump: 0, velocity: 0, crashTime: 0, maneuver: null,
      shotClock: .15 + id*.14, jumps: 0, deaths: 0, generation,
      shotFlash: 0,
      wheelTravel: 0, lastCrash: null, color,
      windowColor: C.black,
      tireColors: [tireColor,tireColor,tireColor]};
  }
  function darkenPaint(color) {
    return '#'+[1,3,5].map(i=>Math.round(parseInt(color.slice(i,i+2),16)*.55).toString(16).padStart(2,'0')).join('');
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  const mod = (n, m) => (n % m + m) % m;
  // The camera supplies the forward travel; slow lane drift avoids repeatedly
  // braking and sprinting across the screen. Hazards can still request a trim.
  const cruiseX = t => w * (.235 - .045 * Math.cos(t * Math.PI / 12));
  const boundX = x => Math.max(20, Math.min(w - 22, x));
  const approach = (value, target, amount) => value + Math.max(-amount, Math.min(amount, target - value));
  const ufoY = (u, ahead = 0) => {
    const spec = UFO_TYPES[u.type] || UFO_TYPES.scout;
    return Math.max(14, Math.min(ground-40, u.y + Math.sin((time+ahead)*spec.frequency+u.phase)*spec.amplitude));
  };

  // Atmospheric ships drift through each landscape, with a
  // separate random stream that never changes the foreground patrol.
  function depthRandom(layer, a = 0, b = 1) {
    layer.seed = (Math.imul(layer.seed,1664525)+1013904223) >>> 0;
    return a+(b-a)*layer.seed/4294967296;
  }
  const depthBase = layer => ground-(layer.name==='distant' ? Math.min(h*.25,85)*.6 : -2);
  const depthHeight = layer => Math.min(h*(layer.name==='distant' ? .15 : .23),layer.name==='distant' ? 46 : 68);
  function depthUfo(layer, initial = false) {
    if(layer.ufos.length>=2)return;
    const homeX=initial ? w*(layer.name==='distant' ? .66 : .84) : w+8;
    const homeY=depthBase(layer)-depthHeight(layer)-depthRandom(layer,28,57)*layer.scale;
    layer.ufos.push({x:homeX,y:homeY,homeX,homeY,phase:depthRandom(layer,0,Math.PI*2),
      type:Math.floor(depthRandom(layer,0,3)),drop:depthRandom(layer,5,10)});
  }
  function depthUfoSize(layer,u) {
    const width=u.type===1 ? 28 : u.type===2 ? 22 : 26;
    return {width:Math.max(5,Math.round(width*layer.ufoScale)),height:layer.name==='distant' ? 3 : 4};
  }
  function makeDepthLayers() {
    depthLayers=[
      {name:'distant',parallax:.18,scale:.55,ufoScale:.27,body:C.cyan,shade:C.blue,light:C.window,seed:19059},
      {name:'middle',parallax:.46,scale:.82,ufoScale:.43,body:C.green,shade:C.shade,light:C.yellow,seed:59019}
    ].map(layer=>({...layer,ufos:[],bombs:[],impacts:[],clock:6,age:0}));
    for(const layer of depthLayers) {
      depthUfo(layer,true);
    }
  }
  function updateDepthLayers(dt,travel) {
    for(const layer of depthLayers) {
      const drift=travel*layer.parallax;
      layer.age+=dt;layer.clock-=dt;
      if(layer.clock<=0){depthUfo(layer);layer.clock=depthRandom(layer,7,11);}
      for(const u of layer.ufos) {
        u.homeX-=drift+dt*layer.scale*2;
        u.x=u.homeX+Math.sin(layer.age*.45+u.phase)*3*layer.scale;
        u.y=u.homeY+Math.sin(layer.age*.7+u.phase)*2*layer.scale;
        u.drop-=dt;
        if(u.drop<=0 && u.x>8 && u.x<w-8 && layer.bombs.length<2) {
          layer.bombs.push({x:u.x,y:u.y+3,vy:12*layer.scale});
          u.drop=depthRandom(layer,11,20);
        }
      }
      layer.ufos=layer.ufos.filter(u=>u.x>-16);
      for(const b of layer.bombs) {
        b.vy+=dt*30*layer.scale;b.y+=b.vy*dt;
        if(b.y>=depthBase(layer)-2) {
          b.dead=true;layer.impacts.push({x:b.x,y:depthBase(layer)-2,life:.35});
        }
      }
      layer.bombs=layer.bombs.filter(b=>!b.dead);
      layer.impacts.forEach(p=>p.life-=dt);
      layer.impacts=layer.impacts.filter(p=>p.life>0).slice(-3);
    }
  }
  function drawSimpleSaucer(x,y,width,height,body,canopy,rim=body) {
    // A dome and a flat disc, with no engines, windows or ornamental trim.
    const left=Math.round(x-width/2),top=Math.round(y-height/2);
    const cap=Math.max(1,Math.floor(height*.3)),edge=Math.max(1,Math.floor(height*.2));
    const bottom=height>=4 ? Math.max(1,Math.floor(height*.2)) : 0;
    const band=height-cap-edge-bottom;
    const tier=(fraction,y,h,color)=>{
      const span=Math.max(1,Math.round(width*fraction));
      rect(left+Math.floor((width-span)/2),y,span,h,color);
    };
    tier(.36,top,cap,canopy);
    tier(.72,top+cap,band,body);
    tier(1,top+cap+band,edge,rim);
    if(bottom)tier(.54,top+cap+band+edge,bottom,body);
  }
  function drawDepthLayer(layer) {
    const size=layer.name==='distant'?1:2;
    layer.bombs.forEach(b=>rect(b.x,b.y,size,size+1,layer.body));
    layer.impacts.forEach(p=>{
      rect(p.x-size,p.y,size*3,1,layer.shade);
      rect(p.x,p.y-(p.life>.18?2:1),size,1,layer.body);
    });
    for(const u of layer.ufos) {
      const size=depthUfoSize(layer,u);
      drawSimpleSaucer(u.x,u.y,size.width,size.height,layer.body,layer.body,layer.shade);
    }
  }

  function targetPosition(target, kind, ahead = 0) {
    if (kind === 'ufo') {
      const spec=UFO_TYPES[target.type] || UFO_TYPES.scout;
      const vy=target.estimatedVy ?? Math.cos(time*spec.frequency+target.phase)*spec.amplitude*spec.frequency;
      return {x:target.x+target.vx*ahead,y:Math.max(14,Math.min(ground-40,ufoY(target)+vy*ahead))};
    }
    if (kind === 'bomb') return {x:target.x+target.vx*ahead,y:target.y+target.vy*ahead+24*ahead*ahead};
    if (kind === 'turret-shot') return {x:target.x+(target.vx-SPEED)*ahead,y:target.y+target.vy*ahead};
    return {x:target.x-SPEED*ahead,y:ground-(kind === 'turret' ? 9 : target.size*.5)};
  }
  function gunMuzzles(r) {
    return [{x:r.x+25,y:ground-r.jump-10,vx:SHOT_SPEED,vy:0},
      {x:r.x-4,y:ground-r.jump-28,vx:0,vy:-SHOT_SPEED}];
  }
  function activeBurstCount() {
    return new Set(shots.filter(s=>!s.dead && s.burstId!==undefined).map(s=>s.burstId)).size;
  }
  // Relative swept segments avoid missing a small target between frames.
  function segmentBox(ax, ay, bx, by, halfW, halfH) {
    let enter=0, leave=1;
    for (const [a,b,half] of [[ax,bx,halfW],[ay,by,halfH]]) {
      const d=b-a;
      if (Math.abs(d)<1e-8) {if (Math.abs(a)>half) return null; continue;}
      const t1=(-half-a)/d, t2=(half-a)/d;
      enter=Math.max(enter,Math.min(t1,t2));leave=Math.min(leave,Math.max(t1,t2));
      if (enter>leave) return null;
    }
    return enter;
  }
  function incomingTime(r, target, kind) {
    for (let t=0;t<=1.5;t+=.1) {
      const p=targetPosition(target,kind,t), lift=Math.max(0,r.jump+r.velocity*t-GRAVITY*t*t/2);
      if (Math.abs(p.x-(r.x+r.vx*t))<32 && Math.abs(p.y-(ground-lift-10))<24) return t;
    }
    return Infinity;
  }
  function firingOpportunity() {
    return [...obstacles,...ufos,...bombs,...turretShots]
      .some(target=>!target.dead && target.kind!=='pit' && target.x>=0 && target.x<=w);
  }
  function fireWeapons(r, dt) {
    r.shotClock=Math.max(0,r.shotClock-dt);r.shotFlash=Math.max(0,r.shotFlash-dt);
    if(phase!=='driving' || r.shotClock>0 || activeBurstCount()>=MAX_BURSTS || !firingOpportunity())return;
    const burstId=nextBurstId++;
    for(const muzzle of gunMuzzles(r))shots.push({...muzzle,owner:r.id,burstId,life:2.4,fresh:true});
    r.shotFlash=.07;r.shotClock=FIRE_GAP;
  }
  function shotImpact(s) {
    let first=null;
    const test=(target,kind,x,y,width,height) => {
      if (target.dead) return;
      const t=segmentBox(s.prevX-(target.prevX ?? x),s.prevY-(target.prevY ?? y),s.x-x,s.y-y,width+1,height+1);
      if (t!==null && (!first || t<first.t)) first={target,kind,t};
    };
    for (const o of obstacles) if (o.kind!=='pit') test(o,o.kind,o.x,ground-o.size/2,o.size*.65,o.size/2);
    for (const u of ufos) {const spec=UFO_TYPES[u.type] || UFO_TYPES.scout;test(u,'ufo',u.x,ufoY(u),spec.width/2,spec.height/2);}
    for (const b of bombs) test(b,'bomb',b.x,b.y,5,6);
    for (const bolt of turretShots) test(bolt,'turret-shot',bolt.x,bolt.y,4,3);
    return first;
  }

  function collision(x, lift, ahead = 0, margin = 0) {
    for (const o of obstacles) {
      if (o.dead) continue;
      const ox = o.x - SPEED * ahead;
      if (o.kind === 'pit') {
        if(pitDepth(o)<=3)continue;
        if (lift < 3 + margin && [-10, 12].some(wheel => Math.abs(x + wheel - ox) < o.size / 2 - 1 + margin)) return o;
      } else if (Math.abs(x - ox) < 16 + o.size * .6 + margin && lift < o.size - 2 + margin) return o;
    }
    for (const shot of turretShots) {
      if (shot.dead) continue;
      const sx = shot.x+(shot.vx-SPEED)*ahead, sy = shot.y+shot.vy*ahead;
      if (Math.abs(sx-x)<19+margin && sy>ground-lift-27-margin && sy<ground-lift+4+margin) return shot;
    }
    for (const b of bombs) {
      if (b.dead) continue;
      const bx = b.x + b.vx * ahead, by = b.y + b.vy * ahead + 24 * ahead * ahead;
      if (by < ground) {
        if (Math.abs(bx - x) < 19 + margin && by > ground - lift - 27 - margin && by < ground - lift + 4 + margin) return b;
      } else {
        // The bomb's eventual crater scrolls after impact, like actual terrain.
        const impact = (-b.vy + Math.sqrt(b.vy * b.vy + 96 * (ground - b.y))) / 48;
        const pitX = b.x + b.vx * impact - SPEED * (ahead - impact);
        if (lift < 3 + margin && [-10, 12].some(wheel => Math.abs(x + wheel - pitX) < 18 + margin)) return b;
      }
    }
    return null;
  }
  function drive(r, dt) {
    const patrolX=x=>Math.max(20,Math.min(w*.42,x));
    if(r.maneuver) {
      const plan=r.maneuver;
      const newThreat=bombs.some(b=>!b.dead && !plan.seen.has(b) && Number.isFinite(incomingTime(r,b,'bomb')))
        || turretShots.some(s=>!s.dead && !plan.seen.has(s) && Number.isFinite(incomingTime(r,s,'turret-shot')));
      if(time>plan.until || (plan.launched && r.jump===0) || plan.focus?.dead || newThreat)r.maneuver=null;
    }
    if(r.generation===0) {
      // The beginner reacts to nearby hazards, but does not rehearse landings
      // or predict the craters that airborne bombs will leave.
      const preferred=Math.max(-10,Math.min(12,(cruiseX(time)-r.x)*.5));
      r.vx=approach(r.vx,preferred,ACCELERATION*dt);
      r.x=patrolX(r.x+r.vx*dt);r.wheelTravel+=r.vx*dt;
      const near=obstacles.filter(o=>!o.dead && (o.kind!=='pit'||pitDepth(o)>3) && o.x>r.x-18)
        .sort((a,b)=>a.x-b.x)[0];
      const danger=near && near.x-r.x<(near.kind==='pit'?32:45)+near.size*.25;
      const overhead=bombs.some(b=>Math.abs(b.x-r.x)<28 && b.y>ground-65 && b.y<ground-r.jump-28);
      if(r.jump===0 && (danger||overhead)) {r.velocity=LIFT;r.jump=.1;jumps++;r.jumps++;}
      return;
    }
    let best=null;
    if(!r.maneuver) {
      const target = cruiseX(time + .35, r);
      const preferred = Math.max(-10, Math.min(12, (target - r.x) * .5));
      const focus=obstacles.filter(o=>!o.dead && o.x>r.x-16-o.size*.6).sort((a,b)=>a.x-b.x)[0];
      const evading=bombs.some(b=>!b.dead && Number.isFinite(incomingTime(r,b,'bomb')))
        || turretShots.some(s=>!s.dead && Number.isFinite(incomingTime(r,s,'turret-shot')));
      // Rehearse takeoff AND landing. Backing off is useful when a second pit
      // would arrive during descent, while accelerating helps clear wide gaps.
      for (const speed of [preferred, -20, -10, 8, 16, 24, 36, 48]) {
        for (const delay of [Infinity, 0, .12, .28, .48, .72, 1]) {
          if ((r.jump > 0 || (!focus && !evading)) && delay !== Infinity) continue;
          let x = r.x, vx = r.vx, lift = r.jump, vy = r.velocity, unsafe = 0, launched = false;
          let flight = r.jump > 0, settled = 0, elapsed = 0;
          const horizon = delay === Infinity ? 1.6 : delay + 2 * LIFT / GRAVITY + .2;
          for (let t = .04; t <= horizon; t += .04) {
            elapsed = t;
            vx = approach(vx, speed, ACCELERATION * .04);
            x = patrolX(x + vx * .04);
            if (!launched && lift === 0 && t >= delay) {vy = LIFT; lift = .1; launched = true; flight = true;}
            if (lift > 0) {
              lift = Math.max(0, lift + vy * .04 - GRAVITY * .04 * .04 / 2);
              vy = lift ? vy - GRAVITY * .04 : 0;
            }
            if (collision(x, lift, t, 6)) {unsafe = 100000 + Math.max(0, 3 - t) * 10000; break;}
            // Check a stable touchdown, then allow the next decision to plan
            // another hop instead of insisting on a single leap over everything.
            if (flight && lift === 0) {settled += .04; if (settled >= .36) break;}
          }
          // A hop that lands before its obstacle merely postpones the problem.
          // Require the rehearsed maneuver to clear it, rather than hopping twice.
          if(launched && focus && !evading && focus.x-SPEED*elapsed>x-16-focus.size*.6-6)unsafe+=100000;
          const score = unsafe + Math.abs(speed - preferred) * .18 + Math.abs(speed-r.vx)*.1
            + Math.abs(x - cruiseX(time + elapsed, r)) * .3 + Math.max(0,x-w*.35)**2*.5 + (delay === Infinity ? 0 : 10 + (1 - delay) * .3);
          if (!best || score < best.score) best = {speed, delay, score};
        }
      }
      // Commit a rehearsed takeoff and speed through landing. Reconsidering the
      // throttle every frame used to undo the jump plan and produce stop/start.
      if(Number.isFinite(best.delay) && best.score<100000)r.maneuver={speed:best.speed,focus,
        seen:new Set([...bombs,...turretShots]),launchAt:time+best.delay,
        until:time+best.delay+2*LIFT/GRAVITY+.3,launched:false};
    }
    const plan=r.maneuver;
    r.vx = approach(r.vx, plan ? plan.speed : best.speed, ACCELERATION * dt);
    r.x = patrolX(r.x + r.vx * dt);
    r.wheelTravel += r.vx*dt;
    if (r.jump === 0 && (plan ? !plan.launched && time>=plan.launchAt : best.delay === 0 && best.score<100000)) {
      r.velocity = LIFT; r.jump = .1; jumps++; r.jumps++;if(plan)plan.launched=true;
    }
  }
  function explode(r, hazard) {
    if (phase !== 'driving') return;
    phase = 'settling'; cycle = {parts: [], buildings: [], origin: null, age: 0, still: 0};
    r.lastCrash = {kind: hazard.kind || 'bomb', time, x: r.x, lift: r.jump};
    const inherited = r.vx;
    r.crashTime = 1; deaths++; r.deaths++; r.vx = 0;
    burst(r.x, ground - r.jump - 7, 28);
    const pieces = [['wheel',-10,-3],['wheel',0,-3],['wheel',12,-3],
      ['chassis',-8,-8],['chassis',6,-9],['cockpit',2,-14],
      ['cannon',15,-10],['mast',-4,-22],['axle',-3,-4],['panel',-13,-11]];
    pieces.forEach(([kind, dx, dy], i) => {
      const angle = i * 2.399963 + rand(-.16, .16), speed = rand(75, 155);
      const color = kind === 'wheel' ? r.tireColors[i] : r.color;
      const palette = kind === 'wheel'
        ? {K: color, C: C.black, W: color, M: color}
        : {K: C.black, C: color, W: r.windowColor, M: color};
      const part = {kind, color, palette, x: r.x + dx, y: ground - r.jump + dy,
        // The camera has stopped; the blast spreads out from the crash.
        vx: Math.cos(angle) * speed + inherited * .25,
        vy: Math.sin(angle) * speed, angle: rand(0, Math.PI * 2),
        spin: rand(5, 14) * (i % 2 ? -1 : 1), bounces: 0, settled: false};
      wreck.push(part); cycle.parts.push(part);
    });
    r.jump = 0; r.velocity = 0; r.shotClock = .25;
  }
  function startGrowth() {
    const candidates = cycle.parts.filter(p => p.x >= 44 && p.x <= w - 88);
    const roots = candidates.length ? candidates : cycle.parts;
    const originRoot = [...roots].sort((a,b) =>
      ((a.kind === 'chassis' ? 0 : 20) + Math.abs(a.x-w*.45)*.1) -
      ((b.kind === 'chassis' ? 0 : 20) + Math.abs(b.x-w*.45)*.1))[0];
    cycle.buildings = cycle.parts.map((part, i) => {
      const spawn = part === originRoot;
      const x = spawn ? Math.max(44, Math.min(w*.23, part.x)) : part.x;
      const deck = spawn ? Math.max(14, ...obstacles.filter(o => !o.dead && (o.kind === 'rock' || o.kind === 'turret') && o.x > x-35 && o.x < x+90).map(o => o.size+7)) : 0;
      const b = {x, base: part.y + partBounds(part)[1]/2, source: part,
        color: part.color, height: spawn ? 34 : CITY_SCALE*3*(part.kind === 'wheel' ? 64+i*8 : 36+i%4*8),
        width: spawn ? 44 : CITY_SCALE*3*(14 + i%3*4), style:mod(i*3+deaths+Math.floor(scroll/200),5), tiers: part.kind === 'wheel' ? 2 : 3,
        spawn, deck, door: 0, growth: 0, delay: spawn ? 0 : i*.045};
      part.building = b;
      if (spawn) cycle.origin = b;
      grownBuildings.push(b);
      return b;
    });
    phase = 'growing'; cycle.age = 0;
  }
  function updateCycle(dt) {
    if (!cycle) return;
    cycle.age += dt;
    if (phase === 'settling') {
      const atRest = cycle.parts.every(p => p.settled) && bombs.length === 0;
      cycle.still = atRest ? cycle.still + dt : 0;
      if (cycle.still >= .35) startGrowth();
    } else if (phase === 'growing') {
      cycle.buildings.forEach(b => b.growth = Math.max(0, Math.min(1, (cycle.age-b.delay)/2.6)));
      fillCityGround(cycle.buildings);
      if (cycle.buildings.every(b => b.growth === 1)) {
        const previous=rovers[0],r=makeRover(0,previous.generation+1);
        r.x=buildingExit(cycle.origin)-44;r.jump=cycle.origin.deck;
        rovers[0]=r;phase='emerging';cycle.age=0;
      }
    } else if (phase === 'emerging') {
      cycle.origin.door=Math.min(1,cycle.age/.5);
      const r = rovers[0], t = Math.max(0,Math.min(1,(cycle.age-.5)/1.8)), eased = t*t*(3-2*t);
      const x = buildingExit(cycle.origin) - 44 + 66*eased;
      r.wheelTravel += Math.abs(x-r.x); r.x = x; r.jump = cycle.origin.deck;
      if (t === 1) {
        r.vx = 0; r.velocity = 0; r.shotClock = .4;
        phase = 'driving'; cycle = null;
        obstacleClock=Math.max(obstacleClock,6);turretClock=Math.max(turretClock,14);ufoClock=Math.max(ufoClock,6);
      }
    }
  }
  function fillCityGround(buildings) {
    for(const hazard of obstacles) {
      if(hazard.dead)continue;
      for(const b of buildings) {
        if(b.growth<=0)continue;
        const g=1-(1-b.growth)**3,width=b.width*(.35+.65*g);
        const left=b.x-width*.45,right=b.x+width*.55;
        const half=hazard.size*(hazard.kind==='pit' ? .5 : .65);
        if(hazard.x+half<=left-18 || hazard.x-half>=right+18)continue;
        if(!hazard.cityBlast) {
          hazard.cityBlast=true;
          burst(hazard.x,ground-(hazard.kind==='pit' ? 1 : hazard.size*.5),24);
        }
        if(hazard.kind==='pit')hazard.fill=Math.max(hazard.fill??0,g);
        else {hazard.dead=true;break;}
      }
      if(hazard.kind==='pit' && (hazard.fill??0)>=1)hazard.dead=true;
    }
    obstacles=obstacles.filter(o=>!o.dead);
    // Foundations rise with the restored ground instead of staying sunken in
    // the crater where their source parts originally settled.
    buildings.forEach(b=>{b.base=Math.min(b.base,terrainY(b.x));});
  }

  function resize() {
    const oldW = w, oldGround = ground, oldBases=depthLayers.map(depthBase);
    w = Math.min(480, innerWidth); h = Math.round(innerHeight * w / innerWidth);
    canvas.width = w; canvas.height = h; ground = Math.round(h * .84);
    ctx.imageSmoothingEnabled = false;
    if (oldW) {
      const scale = w / oldW, shift = ground - oldGround;
      rovers.forEach(r => {r.x = boundX(r.x * scale); r.vx *= scale;});
      shots.forEach(s => {s.x *= scale; s.y += shift;});
      obstacles.forEach(o => o.x *= scale);
      ufos.forEach(u => {u.x *= scale; u.y += shift;});
      bombs.forEach(b => {b.x *= scale; b.y += shift;});
      turretShots.forEach(s => {s.x *= scale; s.y += shift;});
      sparks.forEach(p => {p.x *= scale; p.y += shift;});
      wreck.forEach(p => {p.x *= scale; p.y += shift;});
      grownBuildings.forEach(b => {
        b.x = b.spawn ? Math.max(44, Math.min(w*.23, b.x*scale)) : b.x*scale;
        b.base += shift;
      });
      depthLayers.forEach((layer,i)=>{
        const dy=depthBase(layer)-oldBases[i];
        for(const u of layer.ufos){u.x*=scale;u.homeX*=scale;u.y+=dy;u.homeY+=dy;}
        for(const b of [...layer.bombs,...layer.impacts]){b.x*=scale;b.y+=dy;}
      });
    } else {
      rovers = Array.from({length: BUGGY_COUNT}, (_, id) => makeRover(id));
      rovers.forEach(r => r.x = boundX(cruiseX(0, r)));
      // Open into an occupied sky rather than waiting for a single visitor.
      beginWave(true);
      makeDepthLayers();
    }
    draw();
  }
  function burst(x, y, n = 12) {
    const colors = [C.red, C.yellow, C.magenta, C.white];
    for (let i = 0; i < n; i++) sparks.push({x, y, vx: rand(-45, 45), vy: rand(-65, 20), life: rand(.2, .65), color: colors[i % colors.length]});
  }
  function crater(x, size) {
    const near = obstacles.find(o => o.kind === 'pit' && Math.abs(o.x - x) < (o.size + size) / 2);
    if (near) {near.size = Math.min(40, Math.max(near.size, size));near.fill=0;near.cityBlast=false;}
    else obstacles.push({x, kind: 'pit', size, bomb: true});
    obstacles.forEach(o => {if ((o.kind === 'rock' || o.kind === 'turret') && Math.abs(o.x - x) < size / 2) o.dead = true;});
    craters++; burst(x, ground, 22);
  }
  function pitDepth(o) {return Math.min(28,o.size*.7)*(1-(o.fill??0));}
  function pitProfile(o) {
    const x = o.x, size = o.size, depth = pitDepth(o);
    const left = x - size / 2, right = x + size / 2;
    return [[left,ground-2],[left+4,ground+4],[left+7,ground+depth*.65],
      [x-3,ground+depth],[x+4,ground+depth],[right-5,ground+depth*.6],[right,ground-2]];
  }
  function terrainY(x) {
    let floor = ground;
    for (const o of obstacles) {
      if (o.dead || o.kind !== 'pit' || Math.abs(x - o.x) > o.size / 2 + 1) continue;
      const edge = pitProfile(o);
      for (let i = 1; i < edge.length; i++) {
        const [ax, ay] = edge[i - 1], [bx, by] = edge[i];
        if (x >= ax && x <= bx) floor = Math.max(floor, ay + (by - ay) * (x - ax) / (bx - ax));
      }
    }
    return floor;
  }
  function partBounds(p) {
    const sprite = PARTS[p.kind], quarter = mod(Math.round(p.angle / (Math.PI / 2)), 4);
    return quarter % 2 ? [sprite.length, sprite[0].length] : [sprite[0].length, sprite.length];
  }
  function updateWreck(dt, travel = roadSpeed()*dt) {
    for (const p of wreck) {
      const [width, height] = partBounds(p);
      p.x += p.vx * dt - travel;
      if (p.building) continue;
      const floor = Math.min(terrainY(p.x), terrainY(p.x - width*.35), terrainY(p.x + width*.35));
      if (p.settled) {
        // New bomb damage can remove the ground under an existing wreck.
        if (floor > p.y + height / 2 + 1) p.settled = false;
        else {p.y = floor - height / 2; continue;}
      }
      p.y += p.vy * dt + 150 * dt * dt; p.vy += 300 * dt;
      p.angle += p.spin * dt;
      const radius = partBounds(p)[1] / 2;
      if (p.y + radius >= floor && p.vy >= 0) {
        p.y = floor - radius;
        if (p.vy > 26 && p.bounces < 3) {
          p.vy *= -.34; p.vx *= .58; p.spin *= .6; p.bounces++;
        } else {
          p.vy = 0;
          p.vx = approach(p.vx, 0, (p.kind === 'wheel' ? 45 : 115) * dt);
          p.spin = p.kind === 'wheel' ? p.vx / 3.5 : approach(p.spin, 0, 18 * dt);
          if (Math.abs(p.vx) < 2 && Math.abs(p.spin) < .6) {
            p.vx = 0; p.spin = 0; p.settled = true;
            p.angle = Math.round(p.angle / (Math.PI / 2)) * (Math.PI / 2);
            p.y = floor - partBounds(p)[1] / 2;
          }
        }
      }
    }
    // Wreckage has no lifetime: only pieces left behind the camera are removed.
    wreck = wreck.filter(p => p.x > -48 || (cycle && cycle.parts.includes(p)));
  }
  function spawnSaucer({type = 'scout', x, direction = -1, slot = 0, wave = waveNumber} = {}) {
    if (ufos.length >= MAX_SAUCERS) return false;
    const spec = UFO_TYPES[type], rank = Math.min(10, Math.max(0, wave-1));
    ufos.push({type, wave, hp: spec.hp, hit: 0,
      x: x ?? (direction < 0 ? w+25 : -25),
      y: Math.max(22, ground*(.23 + slot%3*.13)),
      vx: direction*(spec.speed+rank*1.25), phase: slot*1.25,
      drop: .8 + slot*.24, payload: spec.payload});
    return true;
  }
  function beginWave(initial = false) {
    const pattern = UFO_WAVES[waveNumber % UFO_WAVES.length];
    const direction = -1;
    waveNumber++;
    const formation = pattern.map((type, slot) => ({type, slot, wave: waveNumber,
      direction,
      delay: slot*.4}));
    if (initial) formation.forEach((member, i) => spawnSaucer({...member, x:w*(.68+i*.12)}));
    else waveQueue.push(...formation);
    ufoClock = rand(6,11);
  }
  function updateWaves(dt) {
    if (phase !== 'driving') return;
    if (waveQueue.length) {
      waveQueue.forEach(member => member.delay -= dt);
      while (waveQueue.length && waveQueue[0].delay <= 0 && ufos.length < MAX_SAUCERS) spawnSaucer(waveQueue.shift());
    } else if (ufos.length === 0) {
      ufoClock -= dt;
      if (ufoClock <= 0) beginWave();
    }
  }
  function spawnTurret(x = w+35) {
    if (obstacles.filter(o => !o.dead && o.kind === 'turret').length >= 3) return null;
    if (obstacles.some(o => !o.dead && Math.abs(o.x-x)<o.size/2+32)) return null;
    if (grownBuildings.some(b => Math.abs(b.x-x)<(b.spawn ? 50 : b.width/2+22))) return null;
    const turret = {kind:'turret',x,size:18,hp:3,aim:-Math.PI,fireClock:.65,flash:0,hit:0};
    obstacles.push(turret);
    return turret;
  }
  function updateTurrets(dt) {
    for (const t of obstacles) if (t.kind === 'turret') {
      t.flash = Math.max(0,t.flash-dt); t.hit = Math.max(0,t.hit-dt);
    }
    if (phase !== 'driving') return;
    turretClock -= dt;
    if (turretClock <= 0) {
      if(!turretGroup)turretGroup=Math.random()<.6 ? 1 : 2;
      if(spawnTurret()) {
        turretGroup--;
        turretClock=turretGroup ? rand(1.8,3.4) : rand(16,32);
      } else turretClock=rand(2,4);
    }
    const r = rovers[0];
    for (const t of obstacles) {
      if (t.dead || t.kind !== 'turret') continue;
      const pivotY = ground-11, targetY = Math.min(pivotY-.01, ground-r.jump-10);
      const aim = Math.atan2(targetY-pivotY, r.x+r.vx*.2-t.x);
      t.aim = approach(t.aim,aim,2.4*dt); t.fireClock -= dt;
      const distance = Math.abs(r.x-t.x);
      if (t.fireClock <= 0 && distance>42 && distance<Math.min(350,w*.9) && Math.abs(t.aim-aim)<.18 && turretShots.length<8) {
        const cx = Math.cos(t.aim), sy = Math.sin(t.aim);
        turretShots.push({kind:'turret-shot',x:t.x+cx*15,y:pivotY+sy*15,vx:cx*105,vy:sy*105});
        t.fireClock = rand(3.2,4.8); t.flash = .13;
      }
    }
  }
  function update(dt) {
    obstacles.forEach(o => {o.prevX=o.x;o.prevY=ground-o.size/2;});
    ufos.forEach(u => {u.prevX=u.x;u.prevY=ufoY(u);});
    bombs.forEach(b => {b.prevX=b.x;b.prevY=b.y;});
    turretShots.forEach(b => {b.prevX=b.x;b.prevY=b.y;});
    time += dt;
    const r = rovers[0];
    const contact = phase === 'driving' && collision(r.x, r.jump);
    if (contact) explode(r, contact);
    const travel = roadSpeed()*dt;
    scroll += travel;
    updateDepthLayers(dt,travel);
    obstacles.forEach(o => o.x -= travel);
    grownBuildings.forEach(b => b.x -= travel);
    if (phase === 'driving') {
      drive(r, dt);
      if (r.jump > 0) {
        r.jump += r.velocity * dt - GRAVITY * dt * dt / 2;
        r.velocity -= GRAVITY * dt;
        if (r.jump <= 0) {r.jump = 0; r.velocity = 0;}
      }
    }
    if (phase === 'driving') obstacleClock -= dt;
    if (obstacleClock <= 0) {
      obstacleClock = rand(4.8, 8.2);
      const pit = Math.random() < .25, big = Math.random() < .3;
      obstacles.push({x: w + 35, kind: pit ? 'pit' : 'rock', size: pit ? rand(26, 38) : big ? rand(23, 27) : rand(11, 14), hp: big ? 3 : 1});
    }
    updateTurrets(dt);
    updateWaves(dt);
    if(phase==='driving')bombClock-=dt;
    ufos.forEach(u => {
      const spec = UFO_TYPES[u.type] || UFO_TYPES.scout;
      u.x += dt*u.vx; u.drop -= dt; u.hit = Math.max(0, u.hit-dt);
      if (u.prevY !== undefined && dt>0) u.estimatedVy=(ufoY(u)-u.prevY)/dt;
      if (phase === 'driving' && bombClock<=0 && u.drop <= 0 && u.payload > 0 && u.x > r.x+65 && u.x < w-22 && bombs.length < 3) {
        u.drop = spec.interval;bombClock=rand(2.8,4.4);
        const y=ufoY(u)+8;
        bombs.push({x:u.x,y,vx:0,vy:32,type:u.type});u.payload--;
      }
    });
    bombs.forEach(b => {
      b.x += b.vx * dt; b.vy += dt * 48; b.y += b.vy * dt;
      if (b.y >= ground) {b.dead = true; crater(b.x, b.type === 'dart' ? rand(22,28) : b.type === 'carrier' ? rand(34,40) : rand(28,38));}
    });
    turretShots.forEach(s => {s.x += s.vx*dt-travel; s.y += s.vy*dt;});
    if (phase === 'driving') fireWeapons(r,dt);
    for (const s of shots) {
      if (s.fresh) {s.fresh=false;continue;}
      s.prevX=s.x;s.prevY=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;
      s.life=(s.life ?? 2.4)-dt;
      const impact=shotImpact(s);
      if (!impact) continue;
      const hit=impact.target;
      s.x=s.prevX+(s.x-s.prevX)*impact.t;s.y=s.prevY+(s.y-s.prevY)*impact.t;
      if (impact.kind==='rock' || impact.kind==='turret') {
        hit.hp--;hit.dead=hit.hp<=0;if(impact.kind==='turret')hit.hit=.12;
      } else if (impact.kind==='ufo') {
        hit.hp=(hit.hp ?? 1)-1;hit.hit=.12;hit.dead=hit.hp<=0;
      } else hit.dead=true;
      s.dead=true;s.hit=true;
      burst(s.x,s.y,hit.dead?12:4);
    }
    // Hits are physical, never a random chance to die. Late bomb impacts and
    // impossible landings can beat the planner; routine hazards should not.
    for (const r of rovers) {
      const hit = phase === 'driving' && collision(r.x, r.jump);
      if (hit) explode(r, hit);
    }
    shots = shots.filter(s => !s.dead && s.life > 0 && s.x > -10 && s.x < w + 10 && s.y > -10 && s.y < h + 10);
    obstacles = obstacles.filter(o => !o.dead && o.x > -45);
    ufos = ufos.filter(u => !u.dead && u.x > -35 && u.x < w + 35);
    bombs = bombs.filter(b => !b.dead && b.x > -10);
    turretShots = turretShots.filter(s => !s.dead && s.x>-20 && s.x<w+20 && s.y>-20 && s.y<ground+2);
    sparks.forEach(p => {p.x += p.vx * dt; p.y += p.vy * dt; p.vy += dt * 75; p.life -= dt;});
    sparks = sparks.filter(p => p.life > 0);
    updateWreck(dt, travel);
    updateCycle(dt);
    grownBuildings = grownBuildings.filter(b => b.x > -100);
  }
  function rect(x, y, width, height, color = C.white) {
    ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(width), Math.ceil(height));
  }
  // Scan-convert silhouettes into whole pixels so even diagonal facets remain crisp.
  function shape(points, color, step = 1) {
    const top = Math.floor(Math.min(...points.map(p => p[1])) / step) * step;
    const bottom = Math.ceil(Math.max(...points.map(p => p[1])));
    for (let y = top; y < bottom; y += step) {
      const hits = [], mid = y + step / 2;
      for (let i = 0; i < points.length; i++) {
        const a = points[i], b = points[(i + 1) % points.length];
        if ((a[1] <= mid && b[1] > mid) || (b[1] <= mid && a[1] > mid)) hits.push(a[0] + (mid - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      hits.sort((a, b) => a - b);
      for (let i = 0; i + 1 < hits.length; i += 2) rect(Math.floor(hits[i] / step) * step, y, Math.max(step, Math.ceil((hits[i + 1] - hits[i]) / step) * step), step, color);
    }
  }
  function distantCity(x, base, height, variant) {
    // Compact blue/cyan skylines sit in mountain valleys, behind the hills.
    height*=CITY_SCALE;
    const theme=mod(variant,7),count=4+theme%3;
    for (let i = 0; i < count; i++) {
      const bx = x + i*(10+theme%3)*CITY_SCALE, width = (8 + (i+theme)%3*2)*CITY_SCALE;
      const tall = height * (.48 + mod(i * 3 + variant, 5) * .13);
      const roof=mod(i+theme,3);
      if(roof===0)rect(bx+2,base-tall-4,width-4,4,C.cyan);
      else if(roof===1)rect(bx+width*.5,base-tall-6,2,6,C.blue);
      rect(bx, base - tall, width, tall, C.blue);
      rect(bx + 2, base - tall + 2, width - 2, tall - 2, C.cyan);
      if (i % 3 === 0) rect(bx + 4, base - tall - 12, 1, 8, C.window);
      for (let y = base - tall + 6; y < base - 3; y += 7) {
        for (let wx = 3; wx < width - 1; wx += 4) rect(bx + wx, y, 2, 2, C.blue);
      }
    }
    rect(x-3,base-4,(count*(10+theme%3)+3)*CITY_SCALE,5,C.blue);
  }
  function cityTower(x, base, height, width, tiers, paint = null, style = 0) {
    const body = paint?.body ?? C.green, edge = paint?.edge ?? C.yellow, shadow = paint?.shadow ?? C.shade;
    const windows=(left,top,span,tall,gap=7)=>{
      for(let y=top+6;y<top+tall-3;y+=gap)for(let px=left+3;px<left+span-3;px+=6)rect(px,y,2,2,C.black);
    };
    if(style!==0) {
      if(style===1) {
        // Terraces step inward rather than repeating round balconies.
        for(let i=0;i<4;i++) {
          const span=width*(1-i*.19),tall=height*(.27+i*.22),left=x-span*.5;
          rect(left,base-tall,span,tall,body);
          windows(left,base-tall,span,height*.2,8);
        }
      } else if(style===2) {
        // Unequal twin spires share a short elevated bridge.
        const span=width*.3;
        rect(x-width*.46,base-height*.82,span,height*.82,body);
        rect(x+width*.14,base-height,span,height,body);
        rect(x-width*.3,base-height*.4,width*.6,height*.07,body);
        windows(x-width*.46,base-height*.82,span,height*.82);
        windows(x+width*.14,base-height,span,height);
      } else if(style===3) {
        // A broad stepped dome on a narrow column.
        rect(x-width*.14,base-height*.72,width*.28,height*.72,body);
        const dome=[[x-width*.5,base-height*.58],[x-width*.5,base-height*.78],
          [x-width*.34,base-height*.94],[x-width*.1,base-height],[x+width*.2,base-height],
          [x+width*.45,base-height*.86],[x+width*.5,base-height*.64],[x+width*.3,base-height*.53],[x-width*.3,base-height*.53]];
        shape(dome,body,2);windows(x-width*.42,base-height*.9,width*.84,height*.3);
        rect(x-width*.22,base-height*.65,width*.44,2,shadow);
      } else {
        // Narrow offset stacks, with ledges at different heights.
        rect(x-width*.2,base-height,width*.4,height,body);
        for(let i=0;i<3;i++) {
          const left=x-width*(i%2?.48:.12),top=base-height*(.25+i*.28);
          rect(left,top,width*.6,height*.13,body);windows(left,top,width*.6,height*.13,6);
        }
      }
      rect(x-width*.45,base-7,width,8,body);
      return;
    }
    rect(x - 3, base - height, 8, height, edge);
    rect(x - 4, base - height, 6, height, body);
    rect(x, base - height - 10, 2, 12, edge);
    for (let i = 0; i < tiers; i++) {
      const y = base - height * (.24 + i * .3);
      const radius = width * (.5 - i * .055), half = Math.max(6, height * .105);
      const pod = [[-radius,-half*.25],[-radius*.72,-half*.8],[-radius*.28,-half],
        [radius*.35,-half],[radius*.8,-half*.6],[radius,-half*.1],
        [radius,half*.35],[radius*.65,half*.8],[-radius*.6,half*.8],[-radius,half*.3]];
      shape(pod.map(([px,py]) => [x + px + 3, y + py + 1]), edge, 2);
      shape(pod.map(([px,py]) => [x + px, y + py]), body, 2);
      rect(x - radius*.7, y + half*.45, radius*1.25, 2, shadow);
      for (let wx = -radius*.65; wx < radius*.7; wx += 5) rect(x + wx, y - 2, 3, 2, C.black);
      if (half > 7) for (let wx = -radius*.45; wx < radius*.5; wx += 5) rect(x + wx, y + 3, 2, 2, C.black);
    }
    rect(x - width*.45, base - 7, width, 8, body);
  }
  function hillCity(x, base, height, variant) {
    const theme=mod(variant,7),scale=CITY_SCALE;
    height*=scale;
    cityTower(x,base,height*(.64+theme%3*.08),(24+theme%2*5)*scale,2,null,theme%5);
    cityTower(x+(28+theme%3*3)*scale,base,height*(.48+theme%4*.09),32*scale,3,null,(theme+2)%5);
    cityTower(x+(58+theme%2*7)*scale,base,height*(.82+theme%2*.15),27*scale,3,null,(theme+4)%5);
    if(theme%2===0) {
      rect(x-6*scale,base-height*.2,70*scale,3,C.shade);
      rect(x-6*scale,base-height*.2,70*scale,2,C.green);
    }
  }
  const buildingExit = b => b.x+b.width*(b.spawn ? .5 : .55);
  function alienBuilding(b) {
    if(b.growth<=0)return;
    const g=1-(1-b.growth)**3,height=b.height*g,width=b.width*(.35+.65*g);
    const floor=b.spawn ? b.base+(ground-b.deck-b.base)*g : b.base;
    if(b.spawn) {
      // A low, compact garage: 44px wide instead of the former 60px facade.
      const x=b.x,right=x+width*.5;
      shape([[x-width*.5,floor],[x-width*.5,floor-25*g],[x-width*.32,floor-height],
        [x+width*.28,floor-height],[right,floor-27*g],[right,floor]],b.color);
      rect(x-width*.29,floor-height+4*g,width*.58,2*g,C.black);
      rect(right-26*g,floor-29*g,24*g,29*g,C.black);
      rect(x-width*.5-2,floor,width+4,2,b.color);
      for(const post of [x-width*.5+2,right-2])rect(post,floor+2,2,Math.max(0,ground-floor-2),b.color);
      rect(right-26*g,floor-29*g,24*g,29*g*(1-b.door),b.color);
      const shutter=29*g*(1-b.door);
      for(let y=floor-29*g+3;y<floor-29*g+shutter-1;y+=4)rect(right-24*g,y,20*g,1,C.black);
      return;
    }
    cityTower(b.x,floor,height,width,b.tiers,{body:b.color,edge:C.black,shadow:C.black},b.style);
    // The other wreck fragments retain their large windowed towers.
    rect(b.x-width*.45,floor-28*g,width,28*g+Math.max(0,b.base-floor),b.color);
    for(let x=b.x-width*.35;x<b.x+width*.45;x+=9)rect(x,floor-22*g,3,3,C.black);
    if(b.source.kind==='wheel' && g>.35)wreckPart({...b.source,x:b.x,y:floor-height*.54,angle:0});
  }
  function landscape() {
    const height = Math.min(h * .48, 174), base = ground + 2;
    const nearHeight = Math.min(h * .25, 85);
    const peaks = [[-20,.76],[7,.42],[23,.5],[39,.68],[58,.61],[76,.28],[88,.05],[101,.18],[110,.12],[120,.46],[140,.62],[159,.69],[177,.54],[194,.31],[207,.18],[220,.43],[238,.53],[251,.81],[269,.72],[283,.41],[299,.6],[319,.63],[340,.78]];
    const offset = mod(scroll * .18, 340);
    for (let tile = -1; tile * 340 - offset < w; tile++) {
      const x = tile * 340 - offset;
      const at = p => [x + p[0], base - height * (1 - p[1])];
      shape([...peaks.map(at), [x + 340, base], [x - 20, base]], C.cyan, 2);
      for (const [px, py, foot] of [[88,.05,140],[207,.18,250],[283,.41,322],[7,.42,45]]) {
        shape([[x+px,base-height*(1-py)],[x+px+8,base-height*(1-py)+12],[x+px+3,base-height*.48],[x+foot,base-height*.23],[x+px+14,base-height*.29],[x+px-4,base-height*.47]], C.blue, 2);
      }
      for (let i = 0; i < 24; i++) {
        const px = (i * 47 + 11) % 330, py = base - height * (.12 + (i % 4) * .055);
        rect(x + px, py, 3 + i % 4, 2, C.blue);
      }
      distantCity(x + 236, ground - nearHeight*.22, Math.min(54, h*.16), tile + Math.floor(scroll*.18/340));
    }
    drawDepthLayer(depthLayers[0]);
    const nearOffset = mod(scroll * .46, 290);
    for (let tile = -1; tile * 290 - nearOffset < w; tile++) {
      const x = tile * 290 - nearOffset;
      const worldTile = tile + Math.floor(scroll*.46/290);
      // Draw before the hill silhouette so foothills conceal the foundations.
      if (mod(worldTile, 2) === 0) hillCity(x + 132, ground + 4, Math.min(98, h*.29), worldTile);
      const hills = [[-12,0],[23,.23],[61,.78],[76,.87],[95,.62],[126,.46],[145,.07],[180,.24],[214,.59],[229,.68],[255,.3],[290,0]];
      shape([...hills.map(([px, py]) => [x + px, ground - nearHeight * py]), [x+290, ground+8], [x-12,ground+8]], C.green, 2);
      shape([[x+76,ground-nearHeight*.87],[x+126,ground-nearHeight*.46],[x+96,ground-nearHeight*.44],[x+104,ground-nearHeight*.52]], C.shade, 2);
      shape([[x+229,ground-nearHeight*.68],[x+276,ground-nearHeight*.13],[x+245,ground-nearHeight*.22],[x+252,ground-nearHeight*.29]], C.shade, 2);
      for (let i = 0; i < 7; i++) rect(x + 27 + i * 9, ground - nearHeight * (.2 + i * .07), 7 + i % 3 * 2, 2, C.shade);
    }
    drawDepthLayer(depthLayers[1]);
  }
  function road() {
    rect(0, ground, w, h - ground, C.peach);
    // A broken pixel lip moves at terrain speed, ahead of both mountain layers.
    for (let x = -8; x <= w + 8; x += 4) {
      const cell = Math.floor((x + scroll) / 4);
      const lip = mod(cell * 7 + Math.floor(cell / 3), 4);
      rect(x, ground - 2, 4, lip, C.green);
    }
    obstacles.forEach(o => {
      const x = Math.round(o.x), size = Math.round(o.size);
      if (o.kind === 'pit') {
        const edge = pitProfile(o);
        shape(edge.map(([px,py]) => [px,py+2]), C.earth, 2);
        shape(edge, C.green, 2);
      } else if (o.kind === 'turret') {
        drawTurret(o);
      } else {
        shape([[x-size*.65,ground],[x-size*.5,ground-size*.6],[x-size*.16,ground-size],[x+size*.3,ground-size*.82],[x+size*.6,ground-size*.35],[x+size*.65,ground]], C.rock, 2);
        rect(x-size*.23,ground-size*.73,4,3,C.earth);
        rect(x+size*.1,ground-size*.48,4,3,C.black);
        rect(x-size*.3,ground-5,5,2,C.black);
      }
    });
  }
  function drawTurret(t) {
    const x = Math.round(t.x), body = t.hit>0 ? C.white : C.turret, pivotY = ground-11;
    // A crude fixed pedestal and pipe, with no tank hull, tracks or sensors.
    shape([[x-10,ground],[x-8,ground-5],[x-4,ground-8],[x+5,ground-8],[x+9,ground-3],[x+10,ground]],body);
    rect(x-4,ground-10,8,7,body);rect(x-3,ground-14,6,5,body);
    const length = t.flash>0 ? 11 : 14, cx = Math.cos(t.aim), sy = Math.sin(t.aim);
    for (let d=1;d<=length;d++) rect(x+cx*d-1,pivotY+sy*d-1,3,3,body);
    rect(x-1,pivotY-1,2,2,C.black);
    if (t.flash>0) {
      rect(x+cx*16-1,pivotY+sy*16-1,3,3,C.yellow);
      rect(x+cx*18,pivotY+sy*18,2,2,C.red);
    }
  }
  function rover(r) {
    ctx.save(); ctx.translate(Math.round(r.x), Math.round(ground - r.jump));
    // Compact original sprite, drawn on whole pixels rather than scaled paths.
    const hull = [[-16,-5],[-16,-10],[-12,-12],[-5,-12],[-1,-16],[6,-16],[12,-12],[17,-11],[18,-7],[14,-5]];
    shape(hull,r.color);
    rect(0,-15,6,1,r.windowColor); rect(-2,-14,10,1,r.windowColor);
    rect(9,-11,6,4,C.black);
    drawRoverGuns(r);
    rect(-11,-11,4,1,C.black); rect(-16,-8,3,1,r.color);
    for (const [i,x] of [-10,0,12].entries()) {
      shape([[x-3,-5],[x-1,-7],[x+2,-7],[x+4,-4],[x+3,0],[x-2,0],[x-4,-2]], r.tireColors[i]);
      rect(x-1,-5,3,3,C.black);
      rect(x,-4,1,1,r.color);
      if ((Math.floor((scroll + r.wheelTravel) / 4) + r.id) % 2) rect(x-3,-4,1,2,C.black);
      else rect(x+1,-6,2,1,C.black);
    }
    ctx.restore();
  }
  function drawRoverGuns(r) {
    rect(12,-11,13,3,r.color);
    rect(-5,-28,3,13,r.color);
    if(r.shotFlash>0) {
      rect(26,-11,3,3,C.white);
      rect(-5,-31,3,3,C.white);
    }
  }
  function wreckPart(p) {
    const sprite = PARTS[p.kind], quarter = mod(Math.round(p.angle / (Math.PI / 2)), 4);
    const [width, height] = partBounds(p);
    const left = Math.round(p.x - width / 2), top = Math.round(p.y - height / 2);
    for (let y = 0; y < sprite.length; y++) for (let x = 0; x < sprite[y].length; x++) {
      const color = (p.palette || PART_COLORS)[sprite[y][x]];
      if (!color) continue;
      let dx = x, dy = y;
      if (quarter === 1) {dx = sprite.length - 1 - y; dy = x;}
      else if (quarter === 2) {dx = sprite[0].length - 1 - x; dy = sprite.length - 1 - y;}
      else if (quarter === 3) {dx = y; dy = sprite[0].length - 1 - x;}
      rect(left + dx, top + dy, 1, 1, color);
    }
  }
  function drawUfo(u) {
    const spec=UFO_TYPES[u.type] || UFO_TYPES.scout;
    const paint={scout:C.yellow,bomber:C.red,dart:C.window,carrier:C.magenta};
    drawSimpleSaucer(u.x,ufoY(u),spec.width,spec.height,u.hit>0 ? C.white : paint[u.type] || C.yellow,C.cyan);
  }
  function drawBomb(b) {
    if (b.type === 'dart') {
      rect(b.x-1,b.y-7,2,9,C.window);rect(b.x-3,b.y-4,6,3,C.magenta);
    } else if (b.type === 'bomber' || b.type === 'carrier') {
      const color = b.type === 'carrier' ? C.magenta : C.red;
      rect(b.x-1,b.y-8,2,4,C.yellow);rect(b.x-3,b.y-4,6,7,color);
      rect(b.x-1,b.y-2,2,3,C.white);rect(b.x-2,b.y+3,4,2,color);
    } else {
      rect(b.x-1,b.y-7,2,9,C.red);rect(b.x-4,b.y-7,2,3,C.magenta);rect(b.x+3,b.y-7,2,3,C.magenta);
    }
  }
  function draw() {
    rect(0, 0, w, h, C.black);
    landscape(); road();
    grownBuildings.filter(b => !b.spawn && b.source.kind !== 'wheel').forEach(alienBuilding);
    grownBuildings.filter(b => !b.spawn && b.source.kind === 'wheel').forEach(alienBuilding);
    grownBuildings.filter(b => b.spawn).forEach(alienBuilding);
    ufos.forEach(drawUfo);
    bombs.forEach(drawBomb);
    turretShots.forEach(s => {rect(s.x-3,s.y-2,7,4,C.red);rect(s.x-1,s.y-1,3,2,C.yellow);});
    shots.forEach(s => {
      const length=Math.hypot(s.vx,s.vy)||1;
      for(let d=0;d<5;d++)rect(s.x-s.vx/length*d,s.y-s.vy/length*d,1,1);
    });
    rovers.forEach(r => {
      if (r.crashTime || (phase === 'emerging' && cycle.origin.door<1)) return;
      if (phase === 'emerging') {
        ctx.save(); ctx.beginPath(); ctx.rect(buildingExit(cycle.origin)-26, 0, w, h); ctx.clip();
        rover(r); ctx.restore();
      } else rover(r);
    });
    wreck.forEach(p => {if (!p.building || p.building.growth < .18) wreckPart(p);});
    sparks.forEach(p => rect(p.x,p.y,2,2,p.color));
    // Machine-readable diagnostics never appear over the artwork.
    canvas.dataset.buggyX = rovers[0].x.toFixed(2);
    canvas.dataset.buggies = rovers.length;
    canvas.dataset.alive = rovers.filter(r => !r.crashTime).length;
    canvas.dataset.saucers = ufos.length;
    canvas.dataset.jumps = jumps; canvas.dataset.craters = craters;
    canvas.dataset.deaths = deaths; canvas.dataset.state = phase;
    canvas.dataset.scroll = scroll.toFixed(3);
    canvas.dataset.buildings = grownBuildings.length;
    canvas.dataset.spawnBuildings = grownBuildings.filter(b => b.spawn).length;
    canvas.dataset.generation = rovers[0].generation;
    canvas.dataset.roverColor = rovers[0].color;
    canvas.dataset.tireColors = rovers[0].tireColors.join(',');
    canvas.dataset.wave = waveNumber;
    canvas.dataset.ufoTypes = [...new Set(ufos.map(u=>u.type))].join(',');
    canvas.dataset.turrets = obstacles.filter(o => !o.dead && o.kind === 'turret').length;
    canvas.dataset.turretShots = turretShots.length;
    canvas.dataset.bursts = activeBurstCount();
    canvas.dataset.depthUfos = depthLayers.map(layer=>layer.ufos.length).join(',');
    canvas.dataset.wreckage = wreck.length; canvas.dataset.restingParts = wreck.filter(p => p.settled).length;
  }
  function toggle() {paused = !paused; canvas.setAttribute('aria-pressed', String(paused)); draw();}
  canvas.addEventListener('click', toggle);
  addEventListener('keydown', e => {
    if (e.code === 'Space' || (e.code === 'Enter' && document.activeElement === canvas)) {e.preventDefault(); if (!e.repeat) toggle();}
    if (e.code === 'KeyS') {draw(); const a = document.createElement('a'); a.download = 'lunar-landgrab.png'; a.href = canvas.toDataURL('image/png'); a.click();}
  });
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {last = 0;});
  canvas.setAttribute('aria-pressed', String(paused)); resize();
  function frame(now) {const dt = last ? Math.min((now - last) / 1000, .04) : 0; last = now; if (!paused && !document.hidden) update(dt); draw(); requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
})();
