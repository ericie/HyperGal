(() => {
  'use strict';
  const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');
  const C = {
    black:'#25232b',white:'#fff0d3',sky:'#dcc3f5',
    cyan:'#b7a8c9',blue:'#89769e',distantLight:'#ccbedb',
    green:'#7fc9ba',shade:'#428e83',middleLight:'#acdccc',
    peach:'#ffedca',earth:'#8f7565',pipe:'#eee6d5',
    magenta:'#ed4c95',window:'#a8dcd5',yellow:'#f8ec4e',red:'#f4773b',orange:'#ff792e',rock:'#b9b0a4',turret:'#ae5f3a'
  };
  const SPEED = 66, GRAVITY = 294, LIFT = 157.5, ACCELERATION = 54, BUGGY_COUNT = 1, MAX_SAUCERS = 6;
  const CITY_SCALE = .9;
  const SHOT_SPEED = 320, MAX_BURSTS = 3, FIRE_GAP = .22;
  // Vivid warm arcade paints; no perimeter outline.
  const ROVER_COLORS = ['#ff792e', '#ed4c95', '#b271e5', '#ed5949'];
  const UFO_TYPES = {
    scout: {speed: 44, hp: 1, payload: 1, interval: 3.8, amplitude: 4, frequency: 3, width: 26, height: 12},
    bomber: {speed: 28, hp: 2, payload: 2, interval: 3.4, amplitude: 3, frequency: 2, width: 32, height: 14},
    dart: {speed: 58, hp: 1, payload: 1, interval: 3.2, amplitude: 10, frequency: 4.4, width: 22, height: 8},
    carrier: {speed: 24, hp: 3, payload: 2, interval: 4.2, amplitude: 5, frequency: 1.7, width: 36, height: 16},
    triad: {speed: 34, hp: 4, payload: 4, interval: 1.1, amplitude: 8, frequency: 2.8, width: 26, height: 20}
  };
  const UFO_WAVES = [
    ['scout','scout','scout'],
    ['bomber','scout','bomber'],
    ['dart','dart','dart','scout'],
    ['carrier','triad','dart','scout'],
    ['triad','bomber','triad']
  ];
  // Distances are world beats: close chips share a hop, then landing space
  // separates the next jump or firing phrase. Gaps between phrases vary.
  const GROUND_PATTERNS = [
    {name:'step-hop',beats:[[0,'rock',12,1],[94,'rock',7,1],[212,'pit',26]]},
    {name:'rattle',beats:[[0,'rock',6,1],[20,'rock',8,1],[126,'rock',14,1],[256,'pit',30]]},
    {name:'double-hop',beats:[[0,'pit',24],[118,'pit',26],[252,'rock',7,1],[274,'rock',6,1]]},
    {name:'heavy',beats:[[0,'rock',24,3],[60,'rock',12,1],[162,'pit',32],[290,'rock',8,1],[310,'rock',7,1]]},
    {name:'offbeat',beats:[[0,'rock',11,1],[42,'rock',12,1],[146,'pit',26],[260,'rock',8,1],[280,'rock',6,1]]}
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
  let depthLayers = [], nextBurstId = 0, turretGroup = 0, groundPattern = 0;
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
      {name:'distant',parallax:.18,scale:.55,ufoScale:.27,body:C.cyan,shade:C.blue,light:C.distantLight,seed:19059},
      {name:'middle',parallax:.46,scale:.82,ufoScale:.43,body:C.green,shade:C.shade,light:C.middleLight,seed:59019}
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
  function drawSimpleSaucer(x,y,width,height,body,canopy,ink=C.black) {
    curve(p=>{p.moveTo(x-width*.23,y);p.bezierCurveTo(x-width*.22,y-height*.7,x+width*.19,y-height*.7,x+width*.23,y);p.closePath();},canopy,ink,.65);
    oval(x,y+height*.05,width*.5,height*.23,body,ink,.7);
    curve(p=>{p.moveTo(x-width*.46,y);p.quadraticCurveTo(x,y-height*.24,x+width*.46,y);},null,ink,.5);
    oval(x,y+height*.16,width*.095,height*.075,ink===C.black?C.orange:ink,ink,.4);
  }
  function drawDepthLayer(layer) {
    const size=layer.name==='distant'?1:1.4;
    layer.bombs.forEach(b=>oval(b.x,b.y,size*.65,size,layer.body,layer.shade,.35));
    layer.impacts.forEach(p=>{line(p.x-size,p.y,p.x+size,p.y,layer.shade,.5);});
    for(const u of layer.ufos){const size=depthUfoSize(layer,u);drawSimpleSaucer(u.x,u.y,size.width,size.height,layer.body,layer.body,layer.shade);}
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
    const r=rovers[0];
    return [...obstacles,...ufos,...bombs,...turretShots]
      .some(target=>!target.dead && target.kind!=='pit' && target.x>=0 && target.x<=w
        && (!['rock','turret'].includes(target.kind) || (target.x>r.x && r.jump+10<=target.size+1)));
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
      } else {
        // Lower hops clear tall rocks closely; retain wider reaction margins
        // for pits, projectiles and the smaller rhythmic ground hazards.
        const clearance=o.kind==='rock'&&o.size>18?Math.min(margin,2):margin;
        if(Math.abs(x-ox)<16+o.size*.6+clearance && lift<o.size-2+clearance)return o;
      }
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
      else if(plan.launched && r.jump>0 && plan.speed>12) {
        // A phrase may need a short boost, not a sprint all the way through
        // touchdown. Rehearse easing back once the whole landing stays clear.
        const preferred=Math.max(-10,Math.min(12,(cruiseX(time+.35)-r.x)*.5));
        const remaining=(r.velocity+Math.sqrt(r.velocity*r.velocity+2*GRAVITY*r.jump))/GRAVITY;
        let x=r.x,vx=r.vx,lift=r.jump,vy=r.velocity,safe=true;
        for(let t=.04;t<=remaining+.36;t+=.04) {
          vx=approach(vx,preferred,ACCELERATION*.04);x=patrolX(x+vx*.04);
          lift=Math.max(0,lift+vy*.04-GRAVITY*.04*.04/2);vy=lift?vy-GRAVITY*.04:0;
          if(collision(x,lift,t,7)){safe=false;break;}
        }
        if(safe)plan.speed=preferred;
      }
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
    const ratio=Math.min(2,globalThis.devicePixelRatio||1);
    canvas.width=Math.round(innerWidth*ratio);canvas.height=Math.round(innerHeight*ratio);
    ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
    ctx.lineCap='round';ctx.lineJoin='round';ctx.imageSmoothingEnabled=true;
    ground = Math.round(h * .84);
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
      drop: (type==='triad'?.55:.8) + slot*.24, payload: spec.payload});
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
  function spawnGroundPattern(index=groundPattern++) {
    const pattern=GROUND_PATTERNS[mod(index,GROUND_PATTERNS.length)];
    for(const [offset,kind,size,hp]of pattern.beats) {
      obstacles.push({x:w+35+offset,kind,size,hp,chip:kind==='rock'&&size<10,pattern:pattern.name,beat:offset});
    }
    return (pattern.beats[pattern.beats.length-1][0]+rand(198,264))/SPEED;
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
    if (phase==='driving' && obstacleClock<=0)obstacleClock=spawnGroundPattern();
    updateTurrets(dt);
    updateWaves(dt);
    if(phase==='driving')bombClock-=dt;
    ufos.forEach(u => {
      const spec = UFO_TYPES[u.type] || UFO_TYPES.scout;
      u.x += dt*u.vx; u.drop -= dt; u.hit = Math.max(0, u.hit-dt);
      if (u.prevY !== undefined && dt>0) u.estimatedVy=(ufoY(u)-u.prevY)/dt;
      if (phase === 'driving' && (u.type==='triad'||bombClock<=0) && u.drop <= 0 && u.payload > 0 && u.x > r.x+65 && u.x < w-22 && bombs.length < 3) {
        u.drop = spec.interval;bombClock=u.type==='triad'?Math.max(bombClock,.8):rand(2.8,4.4);
        const y=ufoY(u)+(u.type==='triad'?14:8);
        bombs.push({x:u.x,y,vx:0,vy:u.type==='triad'?50:32,type:u.type});u.payload--;
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
  // Draw in the existing physics coordinates, at the display's full resolution.
  function rect(x,y,width,height,color=C.white) {ctx.fillStyle=color;ctx.fillRect(x,y,width,height);}
  function inkPath(points,fill,stroke=C.black,lineWidth=.75,close=true) {
    ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    if(close)ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
  }
  function curve(draw,fill,stroke=C.black,lineWidth=.75) {
    ctx.beginPath();draw(ctx);if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
  }
  function oval(x,y,rx,ry,fill,stroke=C.black,lineWidth=.7) {
    curve(p=>p.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2),fill,stroke,lineWidth);
  }
  function line(x,y,x2,y2,color=C.black,width=.65) {inkPath([[x,y],[x2,y2]],null,color,width,false);}
  function box(x,y,width,height,fill,stroke=C.black,radius=1,lineWidth=.65) {
    curve(p=>p.roundRect(x,y,Math.max(.1,width),Math.max(.1,height),Math.max(0,Math.min(radius,width/2,height/2))),fill,stroke,lineWidth);
  }
  function tint(color,amount=.28) {
    return '#'+[1,3,5].map(i=>Math.round(parseInt(color.slice(i,i+2),16)*(1-amount)+parseInt(C.white.slice(i,i+2),16)*amount).toString(16).padStart(2,'0')).join('');
  }
  function shape(points,color,step=1) {inkPath(points,color,null);}
  function alienWindow(x,y,width,height,variant,paint) {
    const ink=paint.ink||C.black,rim=paint.light||tint(paint.body,.48);
    ctx.save();ctx.translate(x,y);
    const aperture=q=>{
      if(variant%3===0) {
        // An asymmetrical kidney aperture, with a tight inset rim.
        q.moveTo(-width*.34,-height*.5);
        q.bezierCurveTo(width*.32,-height*.7,width*.64,-height*.22,width*.25,height*.03);
        q.bezierCurveTo(-width*.05,height*.15,width*.24,height*.58,-width*.23,height*.5);
        q.bezierCurveTo(-width*.58,height*.38,-width*.57,-height*.25,-width*.34,-height*.5);
      }else if(variant%3===1) {
        q.moveTo(-width*.4,-height*.3);q.quadraticCurveTo(-width*.14,-height*.57,width*.35,-height*.5);
        q.lineTo(width*.47,height*.31);q.quadraticCurveTo(width*.14,height*.56,-width*.24,height*.45);q.closePath();
      }else{
        q.moveTo(-width*.42,height*.45);q.lineTo(-width*.29,-height*.32);
        q.bezierCurveTo(-width*.1,-height*.66,width*.4,-height*.55,width*.42,-height*.07);
        q.lineTo(width*.32,height*.43);q.closePath();
      }
    };
    curve(aperture,ink,ink,1.6);curve(aperture,ink,rim,.75);
    if(variant%3===2){line(-width*.02,-height*.37,width*.07,height*.42,rim,.65);line(width*.05,-height*.04,width*.34,-height*.12,rim,.55);}
    ctx.restore();
  }
  function cityTower(x,base,height,width,tiers,paint=null,style=0) {
    const p=paint||{body:C.green,ink:C.shade,shade:C.shade,light:C.middleLight,mono:true};
    const body=p.body,ink=p.ink||C.black,shadow=p.shade||darkenPaint(body),light=p.light||tint(body,.45);
    let podIndex=0;
    const pod=(cx,cy,span,tall)=>{
      if(!p.mono)tall=Math.min(tall,span*.42);
      curve(q=>{q.moveTo(cx-span*.5,cy+tall*.12);q.bezierCurveTo(cx-span*.58,cy-tall*.6,cx-span*.27,cy-tall*.9,cx+span*.03,cy-tall*.9);q.bezierCurveTo(cx+span*.46,cy-tall*.95,cx+span*.6,cy-tall*.24,cx+span*.46,cy+tall*.18);q.bezierCurveTo(cx+span*.25,cy+tall*.54,cx-span*.3,cy+tall*.52,cx-span*.5,cy+tall*.12);q.closePath();},body,ink,.7);
      if(p.mono) {
        const count=Math.max(2,Math.min(5,Math.floor(span/7)));
        for(let i=0;i<count;i++)oval(cx+(i-(count-1)/2)*span*.65/count,cy-tall*.27,Math.max(.4,span*.018),Math.max(.6,tall*.07),ink,null);
      }else{
        const count=span>32?3:2,variant=style+podIndex++;
        for(let i=0;i<count;i++) {
          const offset=(i-(count-1)/2)*span*.23;
          const wh=tall*(i===0?.62:i===1?.82:.45);
          alienWindow(cx+offset,cy-tall*(i===1?.22:.3),Math.max(2.3,span*(i===0?.105:.13)),Math.max(2.8,wh),variant+i,{...p,ink,light});
        }
        // Short offset seams suggest assembled chambers, rather than mouths.
        if(variant%2===0)inkPath([[cx+span*.29,cy],[cx+span*.32,cy+tall*.2],[cx+span*.22,cy+tall*.3]],null,ink,.4,false);
      }
    };
    const stem=(cx,top,span=width*.24)=>{
      if(!p.mono)span*=1.3;
      curve(q=>{q.moveTo(cx-span*.7,base);q.bezierCurveTo(cx-span*1.2,base-height*.23,cx-span*.2,base-height*.34,cx-span*.68,base-height*.46);q.bezierCurveTo(cx-span*.95,base-height*.59,cx-span*.28,top+8,cx-span*.5,top);q.lineTo(cx+span*.45,top);q.bezierCurveTo(cx+span*.24,top+10,cx+span*.96,base-height*.56,cx+span*.65,base-height*.43);q.bezierCurveTo(cx+span*.25,base-height*.29,cx+span*.9,base-height*.15,cx+span*.7,base);if(!p.mono)q.closePath();},body,ink,.7);
    };
    if(style===2) {
      stem(x-width*.26,base-height*.72,width*.22);stem(x+width*.25,base-height*.9,width*.22);
      pod(x-width*.26,base-height*.66,width*.48,height*.12);pod(x+width*.25,base-height*.83,width*.53,height*.13);
      box(x-width*.17,base-height*.42,width*.4,height*.045,body,ink,1,.55);
    } else if(style===3) {
      stem(x,base-height*.72,width*.3);pod(x,base-height*.68,width,height*.24);

    } else if(style===1) {
      stem(x,base-height*.82,width*.45);
      for(let i=0;i<3;i++)pod(x+(i%2?width*.12:-width*.1),base-height*(.23+i*.25),width*(.98-i*.17),height*.12);
    } else if(style===4) {
      stem(x,base-height*.9,width*.23);
      for(let i=0;i<3;i++)pod(x+(i%2?-width*.2:width*.13),base-height*(.2+i*.28),width*(.68+i*.08),height*.1);
    } else {
      stem(x,base-height*.86,width*.28);
      for(let i=0;i<tiers;i++)pod(x+Math.sin(i*2.3)*width*.08,base-height*(.2+i*(.64/Math.max(1,tiers-1))),width*(1-i*.12),height*.115);
    }
    // Bent antennae, asymmetric balconies and pipe loops stay architectural.
    if(style%2===0){line(x+width*.12,base-height*.92,x+width*.15,base-height-4,ink,.65);if(!p.mono)line(x+width*.15,base-height-4,x+width*.22,base-height-6,ink,.55);}
    if(!p.mono && style===1) {
      const y=base-height*.4;
      curve(q=>{q.moveTo(x+width*.25,y);q.bezierCurveTo(x+width*.7,y-8,x+width*.69,y+9,x+width*.35,y+8);},null,ink,.7);
      box(x+width*.18,y+5,width*.39,3,light,ink,1,.6);
      for(let i=0;i<4;i++)line(x+width*(.22+i*.09),y+1,x+width*(.22+i*.09),y+5,ink,.4);
    }
    if(!p.mono && style===2) {
      box(x-width*.17,base-height*.45,width*.34,height*.08,body,ink,.7,.5);
      alienWindow(x,base-height*.41,width*.16,height*.055,2,{...p,ink,light});
    }
    if(!p.mono && style===4)for(let i=0;i<3;i++)for(let j=0;j<3;j++)box(x-width*.16+i*3,base-height*.32+j*3,3,3,(i+j)%2?body:light,ink,0,.35);
    curve(q=>{q.moveTo(x-width*.47,base);q.quadraticCurveTo(x,base-8,x+width*.52,base);q.closePath();},body,p.mono?null:ink,.7);
  }
  function distantCity(x,base,height,variant) {
    const theme=mod(variant,7),p={body:C.cyan,ink:C.blue,shade:C.blue,light:C.distantLight,mono:true};
    for(let i=0;i<4;i++)cityTower(x+i*12,base,height*CITY_SCALE*(.55+mod(theme+i*3,5)*.1),12*CITY_SCALE,2,p,mod(theme+i,5));
  }
  function hillCity(x,base,height,variant) {
    const theme=mod(variant,7),p={body:C.green,ink:C.shade,shade:C.shade,light:C.middleLight,mono:true};
    for(let i=0;i<3;i++)cityTower(x+i*26*CITY_SCALE,base,height*CITY_SCALE*(.65+mod(theme+i,4)*.1),(25+i%2*6)*CITY_SCALE,2+i%2,p,mod(theme+i*2,5));
  }
  const buildingExit=b=>b.x+b.width*(b.spawn ? .5 : .55);
  function alienBuilding(b) {
    if(b.growth<=0)return;
    const g=1-(1-b.growth)**3,height=b.height*g,width=b.width*(.35+.65*g);
    const floor=b.spawn?b.base+(ground-b.deck-b.base)*g:b.base;
    if(b.spawn) {
      const x=b.x,right=x+width*.5,top=floor-height;
      curve(q=>{q.moveTo(x-width*.5,floor);q.lineTo(x-width*.5,top+9*g);q.quadraticCurveTo(x-width*.4,top-1,x-width*.17,top);q.lineTo(x+width*.24,top);q.quadraticCurveTo(right,top+2,right,top+10*g);q.lineTo(right,floor);q.closePath();},b.color);
      const bayX=right-26*g,bayY=floor-29*g;
      box(bayX,bayY,24*g,29*g,C.black,C.black,4*g);
      const shutter=29*g*(1-b.door);
      if(shutter>.1){box(bayX,bayY,24*g,shutter,tint(b.color),C.black,1);for(let y=bayY+3;y<bayY+shutter-1;y+=4)line(bayX+1,y,bayX+23*g,y,C.black,.55);}
      line(x-width*.5-2,floor+1,right+2,floor+1,C.black,.8);
      for(const post of [x-width*.5+2,right-2])line(post,floor+2,post,ground,b.color,2);
      alienWindow(x-width*.31,top+height*.43,Math.max(1,4*g),Math.max(1,10*g),2,{body:b.color,ink:C.black,light:tint(b.color,.5)});
      return;
    }
    cityTower(b.x,floor,height,width,b.tiers,{body:b.color,ink:C.black,shade:darkenPaint(b.color),light:tint(b.color,.48)},b.style);
    if(b.source.kind==='wheel' && g>.35)wreckPart({...b.source,x:b.x,y:floor-height*.49,angle:0});
  }
  function landscape() {
    const height=Math.min(h*.48,174),base=ground+2,nearHeight=Math.min(h*.25,85);
    // One continuous silhouette: deliberate shoulders, not sampled edge noise.
    // Matching endpoints keep the repeating range free of tile seams.
    const peaks=[[0,.56],[16,.63],[35,.77],[55,.72],[70,.55],[80,.3],[88,.05],[98,.17],[109,.13],[118,.4],[135,.59],[157,.68],[175,.57],[193,.34],[207,.18],[222,.42],[238,.53],[252,.78],[269,.69],[283,.41],[300,.59],[321,.66],[340,.56]];
    const offset=mod(scroll*.18,340);
    const ridge=[];
    for(let tile=-1;tile*340-offset<w;tile++){
      const x=tile*340-offset;
      for(const [px,py]of peaks.slice(0,-1))ridge.push([x+px,base-height*(1-py)]);
    }
    inkPath([...ridge,[ridge.at(-1)[0]+20,ground+3],[ridge[0][0],ground+3]],C.cyan,null);
    inkPath(ridge,null,C.blue,.65,false);
    for(let tile=-1;tile*340-offset<w;tile++){
      const x=tile*340-offset;
      const fold=points=>inkPath(points.map(([px,py])=>[x+px,base-height*(1-py)]),null,C.blue,.55,false);
      // Each fold starts at its summit; short branches meet real shoulders.
      fold([[88,.05],[91,.33],[87,.48],[104,.62],[125,.7]]);
      fold([[91,.33],[109,.13]]);
      fold([[207,.18],[203,.4],[213,.55],[232,.65]]);
      fold([[203,.4],[193,.34]]);
      fold([[283,.41],[280,.59],[294,.69]]);
      distantCity(x+236,ground-nearHeight*.22,Math.min(54,h*.16),tile+Math.floor(scroll*.18/340));
    }
    drawDepthLayer(depthLayers[0]);
    // Middle-plane activity is occluded by the nearer hill silhouettes.
    drawDepthLayer(depthLayers[1]);
    const nearOffset=mod(scroll*.46,290);
    for(let tile=-1;tile*290-nearOffset<w;tile++){
      const x=tile*290-nearOffset,world=tile+Math.floor(scroll*.46/290);
      if(mod(world,2)===0)hillCity(x+132,ground+3,Math.min(98,h*.29),world);
      curve(q=>{q.moveTo(x-12,ground+3);q.bezierCurveTo(x+10,ground-nearHeight*.1,x+33,ground-nearHeight*.8,x+76,ground-nearHeight*.86);q.bezierCurveTo(x+95,ground-nearHeight*.72,x+120,ground-nearHeight*.38,x+145,ground-nearHeight*.07);q.bezierCurveTo(x+172,ground-nearHeight*.12,x+194,ground-nearHeight*.69,x+229,ground-nearHeight*.67);q.bezierCurveTo(x+252,ground-nearHeight*.51,x+265,ground-nearHeight*.11,x+290,ground+3);q.closePath();},C.green,C.shade,.65);
      curve(q=>{q.moveTo(x+76,ground-nearHeight*.8);q.quadraticCurveTo(x+98,ground-nearHeight*.57,x+115,ground-nearHeight*.51);},null,C.shade,.55);
    }
  }
  function road() {
    rect(0,ground,w,h-ground,C.peach);
    const lip=[];for(let x=-8;x<w+8;x+=8)lip.push([x,ground+Math.sin((x+scroll)*.17)*.55]);
    inkPath(lip,null,C.black,.7,false);
    const offset=mod(scroll,110);
    for(let x=-110-offset;x<w;x+=110){
      inkPath([[x+10,ground+12],[x+15,ground+10],[x+22,ground+11],[x+18,ground+13],[x+10,ground+12]],C.peach,C.earth,.5);
      inkPath([[x+54,ground+(h-ground)*.56],[x+63,ground+(h-ground)*.56-2],[x+68,ground+(h-ground)*.56-1],[x+78,ground+(h-ground)*.56-4]],null,C.earth,.55,false);
    }
    obstacles.forEach(o=>{
      if(o.kind==='pit'){
        const edge=pitProfile(o);
        inkPath(edge,C.green,null);
        inkPath(edge,null,C.black,.75,false);
        inkPath(edge.map(([x,y])=>[x,y+1.5]),null,C.earth,.6,false);
      }else if(o.kind==='turret')drawTurret(o);
      else{
        const x=o.x,s=o.size;
        if(o.chip) {
          inkPath([[x-s*.75,ground],[x-s*.4,ground-s*.45],[x-s*.12,ground-s],[x+s*.28,ground-s*.7],[x+s*.78,ground]],C.rock,C.black,.65);
          line(x-s*.12,ground-s,x+s*.12,ground-s*.24,C.black,.4);
        }else{
          inkPath([[x-s*.65,ground],[x-s*.5,ground-s*.6],[x-s*.16,ground-s],[x+s*.3,ground-s*.82],[x+s*.6,ground-s*.35],[x+s*.65,ground]],C.rock,C.black,.8);
          line(x-s*.16,ground-s,x+s*.06,ground-s*.48,C.black,.5);
          line(x+s*.06,ground-s*.48,x+s*.47,ground-s*.25,C.black,.5);
        }
      }
    });
  }
  function drawTurret(t) {
    const x=t.x,body=t.hit>0?C.white:C.turret,pivotY=ground-11;
    curve(q=>{q.moveTo(x-10,ground);q.quadraticCurveTo(x-5,ground-2,x-4,ground-9);q.quadraticCurveTo(x-3,ground-15,x+2,ground-14);q.quadraticCurveTo(x+6,ground-12,x+5,ground-6);q.lineTo(x+10,ground);q.closePath();},body);
    ctx.save();ctx.translate(x,pivotY);ctx.rotate(t.aim);
    const length=t.flash>0?11:14;
    box(1,-1.8,length,3.6,C.pipe,C.black,.8);
    for(let d=4;d<length;d+=4)line(d,-1.6,d,1.6,C.black,.45);
    oval(length,0,.8,1.8,C.black,C.black,.4);ctx.restore();
    oval(x,pivotY,1.7,1.7,body,C.black,.5);
    if(t.flash>0){const cx=Math.cos(t.aim),sy=Math.sin(t.aim);oval(x+cx*17,pivotY+sy*17,1.5,1.5,C.yellow,C.black,.5);}
  }
  function rover(r) {
    ctx.save();ctx.translate(r.x,ground-r.jump);
    curve(q=>{q.moveTo(-16,-5);q.lineTo(-17,-10);q.quadraticCurveTo(-17,-12,-13,-12);q.lineTo(-5,-12);q.lineTo(-1,-17);q.quadraticCurveTo(2,-18,7,-16);q.lineTo(12,-12);q.lineTo(17,-11);q.quadraticCurveTo(20,-9,17,-6);q.lineTo(13,-5);q.closePath();},r.color);
    inkPath([[-1,-15.5],[5,-15.5],[9,-12],[-3,-12]],r.windowColor,C.black,.65);
    line(2,-15,4,-12,C.pipe,.65);
    for(let x=-12;x<-6;x+=2)line(x,-9,x,-6.5,C.black,.45);
    curve(q=>{q.moveTo(-12,-3);q.quadraticCurveTo(1,1,13,-3);},null,C.black,1.8);
    curve(q=>{q.moveTo(-12,-3);q.quadraticCurveTo(1,1,13,-3);},null,C.pipe,.9);
    drawRoverGuns(r);
    for(const [i,x]of[-10,0,12].entries()){
      ctx.save();ctx.translate(x,-3);ctx.rotate((scroll+r.wheelTravel)/4.4);
      oval(0,0,4.4,4.2,r.tireColors[i],C.black,.8);
      for(let j=0;j<8;j++){const a=j*Math.PI/4;line(Math.cos(a)*3.3,Math.sin(a)*3.2,Math.cos(a)*4,Math.sin(a)*3.8,C.black,.5);}
      oval(0,0,2.1,2.1,C.black,C.black,.5);oval(0,0,.9,.9,r.color,null);ctx.restore();
    }
    ctx.restore();
  }
  function drawRoverGuns(r) {
    // Flared roots merge into the chassis; both openings stay on their axes.
    const paint=r.color;
    curve(q=>{q.moveTo(10,-12.1);q.quadraticCurveTo(14,-12.3,18,-12.2);q.lineTo(25,-12.2);q.lineTo(25,-7.8);q.lineTo(17,-7.8);q.quadraticCurveTo(13,-7.6,10,-6.7);},paint,C.black,.65);
    line(21,-12,21,-8,C.black,.4);
    oval(25,-10,.9,2.25,C.black,C.black,.55);
    curve(q=>{q.moveTo(-8,-12.1);q.quadraticCurveTo(-6.6,-16,-6.3,-20);q.lineTo(-6.3,-28);q.lineTo(-1.7,-28);q.lineTo(-1.7,-20);q.quadraticCurveTo(-1.5,-16,-.2,-14);},paint,C.black,.65);
    line(-6.1,-24,-1.9,-24,C.black,.4);
    oval(-4,-28,2.3,.85,C.black,C.black,.55);
    if(r.shotFlash>0){line(27,-10,29,-10,C.yellow,1.8);line(-4,-30,-4,-32,C.yellow,1.8);}
  }
  function wreckPart(p) {
    const [width,height]=partBounds(p);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
    if(p.kind==='wheel'){
      oval(0,0,3.25,3.25,p.color,C.black,.65);oval(0,0,1.45,1.45,C.black,null);oval(0,0,.6,.6,p.color,null);
      for(let i=0;i<6;i++){const a=i*Math.PI/3;line(Math.cos(a)*2.4,Math.sin(a)*2.4,Math.cos(a)*3,Math.sin(a)*3,C.black,.4);}
    }else if(p.kind==='cannon'||p.kind==='mast'){
      box(-width*.45,-height*.4,width*.9,Math.max(1,height*.8),p.color,C.black,.5,.55);
      line(-width*.2,-height*.4,-width*.2,height*.4,C.black,.4);
    }else{
      inkPath([[-width*.5,-height*.4],[width*.25,-height*.5],[width*.5,height*.1],[width*.25,height*.5],[-width*.4,height*.4]],p.color,C.black,.55);
      if(p.kind==='cockpit')box(-width*.18,-height*.2,width*.4,height*.38,C.black,C.black,.5,.35);
    }
    ctx.restore();
  }
  function drawUfo(u) {
    const spec=UFO_TYPES[u.type]||UFO_TYPES.scout;
    if(u.type==='triad') {
      const y=ufoY(u),body=u.hit>0?C.white:C.window;
      const nodes=[[0,-4.5],[-6,4.5],[6,4.5]];
      inkPath(nodes.map(([dx,dy])=>[u.x+dx,y+dy]),null,C.black,1.2);
      for(const [dx,dy]of nodes) {
        oval(u.x+dx,y+dy,5.4,5.4,body,C.black,.75);
        oval(u.x+dx,y+dy,1.15,1.15,C.orange,C.black,.4);
        curve(p=>{p.moveTo(u.x+dx+1.7,y+dy-3.3);p.quadraticCurveTo(u.x+dx+3.8,y+dy-1.8,u.x+dx+3.6,y+dy+.8);},null,C.black,.4);
      }
      return;
    }
    const paint={scout:C.yellow,bomber:C.orange,dart:C.pipe,carrier:C.magenta};
    const body=u.hit>0?C.white:paint[u.type]||C.yellow;
    drawSimpleSaucer(u.x,ufoY(u),spec.width,spec.height,body,tint(body,.3),C.black);
  }
  function drawBomb(b) {
    oval(b.x,b.y,2.6,4.4,C.pipe,C.black,.7);
    box(b.x-.9,b.y-6,1.8,2,C.black,C.black,.2,.5);
    rect(b.x-2.4,b.y-.8,4.8,1.8,b.type==='carrier'?C.magenta:C.yellow);
    line(b.x-2.4,b.y-.9,b.x+2.4,b.y-.9,C.black,.4);line(b.x-2.4,b.y+1,b.x+2.4,b.y+1,C.black,.4);
  }
  function draw() {
    rect(0,0,w,h,C.sky);landscape();road();
    grownBuildings.filter(b=>!b.spawn&&b.source.kind!=='wheel').forEach(alienBuilding);
    grownBuildings.filter(b=>!b.spawn&&b.source.kind==='wheel').forEach(alienBuilding);
    grownBuildings.filter(b=>b.spawn).forEach(alienBuilding);
    ufos.forEach(drawUfo);bombs.forEach(drawBomb);
    turretShots.forEach(s=>{oval(s.x,s.y,2.5,1.2,C.orange,C.black,.5);});
    shots.forEach(s=>{const length=Math.hypot(s.vx,s.vy)||1;line(s.x-s.vx/length*4,s.y-s.vy/length*4,s.x,s.y,C.black,1.55);line(s.x-s.vx/length*4,s.y-s.vy/length*4,s.x,s.y,C.yellow,.8);});
    rovers.forEach(r=>{
      if(r.crashTime||(phase==='emerging'&&cycle.origin.door<1))return;
      if(phase==='emerging'){ctx.save();ctx.beginPath();ctx.rect(buildingExit(cycle.origin)-26,0,w,h);ctx.clip();rover(r);ctx.restore();}else rover(r);
    });
    wreck.forEach(p=>{if(!p.building||p.building.growth<.18)wreckPart(p);});
    sparks.forEach(p=>{const l=Math.hypot(p.vx,p.vy)||1;line(p.x,p.y,p.x-p.vx/l*2.5,p.y-p.vy/l*2.5,C.black,1.1);line(p.x,p.y,p.x-p.vx/l*2.5,p.y-p.vy/l*2.5,p.color,.7);});
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
