(() => {
  'use strict';
  const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');
  const TAU = Math.PI * 2, key = 'hypergal-moon-orchard-v1';
  let trees = [], time = 0, rotation = 0, paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const s = JSON.parse(localStorage.getItem(key));
    if (s && Number.isFinite(s.time) && Number.isFinite(s.rotation) && Array.isArray(s.trees)) {
      time = s.time; rotation = s.rotation;
      trees = s.trees.filter(t => Array.isArray(t) && t.length === 5 && t.every(Number.isFinite));
    }
  } catch (_) {}
  let w, h, ground, planet, scroll = 0, last = 0, shotClock = 0, obstacleClock = 1, ufoClock = 3, saveClock = 0;
  let shots = [], obstacles = [], ufos = [], bombs = [], sparks = [], jump = 0, velocity = 0;
  let distance = 0, jumps = 0;
  const rand = (a,b) => a + Math.random() * (b-a);
  const buggyX = () => w * .23;
  function save() { try { localStorage.setItem(key, JSON.stringify({time, rotation, trees})); } catch (_) {} }
  function resize() {
    const oldW = w || innerWidth, oldH = h || innerHeight;
    w = Math.min(800, innerWidth); h = Math.round(innerHeight * w / innerWidth);
    canvas.width = w; canvas.height = h; ground = h * .84;
    const radius = Math.min(h*.205,w*.30);
    planet = {x:w*.51, y:Math.max(h*.245,radius+38), r:radius};
    shots.forEach(s => {s.x *= w/oldW; s.y *= h/oldH;});
    obstacles.forEach(o => o.x *= w/oldW);
    ufos.forEach(u => {u.x *= w/oldW;u.y *= h/oldH;});
    bombs.forEach(b => {b.x *= w/oldW;b.y *= h/oldH;});
  }
  function burst(x,y,color,n=12) { for(let i=0;i<n;i++) sparks.push({x,y,vx:rand(-45,45),vy:rand(-65,20),life:rand(.2,.65),color}); }
  function plant(x,y) {
    const a = Math.atan2(y-planet.y,x-planet.x)-rotation;
    trees.push([a,time,rand(11,27),Math.random(),Math.random()]);
    burst(x,y,'#b0edb3',6);
  }
  function update(dt) {
    time += dt; rotation += dt*.025; scroll += dt*66; distance += dt*66;
    const bx = buggyX();
    obstacles.forEach(o => o.x -= dt*66);
    const threat = obstacles.find(o => o.x > bx-10 && o.x < bx+65 && (o.kind==='pit' || o.x < bx+44));
    const bombThreat = bombs.some(b => Math.abs(b.x-bx)<32 && b.y>ground-115 && b.y<ground-30);
    if(jump===0 && (threat || bombThreat)) {velocity=215; jump=.1;jumps++;}
    if(jump>0) {jump+=velocity*dt;velocity-=285*dt;if(jump<=0){jump=0;velocity=0;}}
    shotClock-=dt;
    if(shotClock<=0) {
      shotClock=.64;
      const x=bx+4,y=ground-22-jump, target=planet.x+Math.sin(time*.23)*planet.r*.65;
      const dx=target-x,dy=planet.y-y,len=Math.hypot(dx,dy);
      shots.push({x,y,vx:dx/len*240,vy:dy/len*240,up:true});
      shots.push({x:bx+22,y:ground-13-jump,vx:245,vy:0,up:false});
    }
    obstacleClock-=dt;
    if(obstacleClock<=0) {obstacleClock=rand(2.5,4);obstacles.push({x:w+40,kind:Math.random()<.55?'pit':'rock',size:rand(17,28)});}
    ufoClock-=dt;
    if(ufoClock<=0) {ufoClock=rand(5,8);ufos.push({x:w+35,y:ground-rand(100,150),phase:rand(0,TAU),drop:1.1});}
    ufos.forEach(u=>{u.x-=dt*38;u.drop-=dt;if(u.drop<=0){u.drop=rand(1.4,2.5);bombs.push({x:u.x,y:u.y+8,vx:-25,vy:42});}});
    bombs.forEach(b=>{b.x+=b.vx*dt;b.vy+=dt*36;b.y+=b.vy*dt;if(b.y>=ground){b.dead=true;burst(b.x,ground,'#da8167');}});
    for(const s of shots) {
      s.x+=s.vx*dt;s.y+=s.vy*dt;
      if(s.up && Math.hypot(s.x-planet.x,s.y-planet.y)<=planet.r) {plant(s.x,s.y);s.dead=true;continue;}
      const rock=obstacles.find(o=>o.kind==='rock'&&!o.dead&&Math.abs(s.x-o.x)<o.size*.65&&s.y>ground-o.size&&s.y<ground);
      const ufo=ufos.find(u=>!u.dead&&Math.abs(s.x-u.x)<17&&Math.abs(s.y-u.y)<9);
      const bomb=bombs.find(b=>!b.dead&&Math.hypot(s.x-b.x,s.y-b.y)<7);
      if(rock||ufo||bomb){const hit=rock||ufo||bomb;hit.dead=true;s.dead=true;burst(s.x,s.y,rock?'#cbbb9d':'#efae86');}
    }
    shots=shots.filter(s=>!s.dead&&s.x<w+10&&s.y>-10);
    obstacles=obstacles.filter(o=>!o.dead&&o.x>-45);ufos=ufos.filter(u=>!u.dead&&u.x>-35);bombs=bombs.filter(b=>!b.dead&&b.x>-10);
    sparks.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=dt*75;p.life-=dt;});sparks=sparks.filter(p=>p.life>0);
    saveClock+=dt;if(saveClock>4){save();saveClock=0;}
  }
  function rect(x,y,a,b,color) {ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),a,b);}
  function circle(x,y,r,color) {ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  function mountain(y,amp,step,speed,color) {
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,ground);
    for(let x=-step;x<=w+step;x+=step){const v=x+scroll*speed;ctx.lineTo(x,y-Math.abs(Math.sin(v*.009)+Math.sin(v*.021)*.5)*amp);}
    ctx.lineTo(w,ground);ctx.fill();
  }
  function drawTree(t) {
    const age=Math.max(0,time-t[1]),g=Math.min(1,.07+age/22),size=t[2]*g;
    ctx.save();ctx.translate(planet.x,planet.y);ctx.rotate(t[0]+rotation-Math.PI/2);ctx.translate(0,planet.r-1);
    // Local +Y points out of the globe, keeping every root fixed to its surface.
    rect(-1,0,2,size,'#c0ad83');
    const colors=['#71b68a','#9ac887','#468d80','#b8ce92'];
    ctx.fillStyle=colors[Math.floor(t[3]*colors.length)%colors.length];
    if(t[4]<.55) {for(let i=0;i<3;i++){const y=size*(.38+i*.23),r=size*(.33-i*.065);ctx.beginPath();ctx.moveTo(-r,y);ctx.lineTo(0,y+size*.42);ctx.lineTo(r,y);ctx.fill();}}
    else {circle(0,size*.8,size*.26,ctx.fillStyle);circle(-size*.17,size*.65,size*.19,ctx.fillStyle);circle(size*.17,size*.7,size*.20,ctx.fillStyle);}
    ctx.restore();
  }
  function draw() {
    rect(0,0,w,h,'#090e1b');
    for(let i=0;i<110;i++){const x=((i*137.51)%1)*w,y=((i*83.37)%1)*ground;rect(x,y,i%8===0?2:1,1,i%3?'#3b4658':'#788394');}
    circle(planet.x,planet.y,planet.r+3,'#283e42');
    circle(planet.x,planet.y,planet.r,'#506b65');
    ctx.save();ctx.beginPath();ctx.arc(planet.x,planet.y,planet.r-1,0,TAU);ctx.clip();
    ctx.translate(planet.x,planet.y);ctx.rotate(rotation);
    for(let i=0;i<36;i++){const a=i*2.399,r=Math.sqrt((i+.5)/36)*planet.r;circle(Math.cos(a)*r,Math.sin(a)*r,8+(i%5)*3,i%3?'#58786d':'#405c59');circle(Math.cos(a)*r+2,Math.sin(a)*r-2,4+(i%5)*2,'#4b6861');}
    ctx.restore();
    trees.forEach(drawTree);
    mountain(ground-52,27,22,.18,'#172333');mountain(ground-28,18,17,.38,'#29333d');
    rect(0,ground,w,h-ground,'#645c57');rect(0,ground,w,2,'#c3b49a');rect(0,ground+5,w,2,'#383b40');
    for(let i=0;i<90;i++){const x=((i*47-scroll)%(w+30)+(w+30))%(w+30);rect(x,ground+12+(i*17)%Math.max(1,h-ground-16),i%4+1,1,'#84796a');}
    obstacles.forEach(o=>{if(o.kind==='pit'){rect(o.x-o.size/2,ground,o.size,13,'#090e1b');rect(o.x-o.size/2-3,ground,3,4,'#d3bba1');rect(o.x+o.size/2,ground,3,4,'#d3bba1');}else{ctx.fillStyle='#9c9184';ctx.beginPath();ctx.moveTo(o.x-o.size*.6,ground);ctx.lineTo(o.x-o.size*.35,ground-o.size*.7);ctx.lineTo(o.x+2,ground-o.size);ctx.lineTo(o.x+o.size*.5,ground-o.size*.45);ctx.lineTo(o.x+o.size*.6,ground);ctx.fill();rect(o.x-4,ground-o.size*.7,5,3,'#cbbc9e');}});
    ufos.forEach(u=>{const y=u.y+Math.sin(time*3+u.phase)*3;rect(u.x-7,y-7,14,5,'#96bfc3');rect(u.x-15,y-2,30,5,'#bd8db8');rect(u.x-10,y+3,20,2,'#644e83');for(let i=0;i<3;i++)rect(u.x-9+i*8,y,3,2,'#f2d8a7');});
    bombs.forEach(b=>{rect(b.x-2,b.y-4,4,7,'#e4a077');rect(b.x-1,b.y-9,2,3,'#a35564');});
    shots.forEach(s=>rect(s.x-1,s.y-1,s.up?2:6,s.up?5:2,s.up?'#d6efb2':'#ffcd86'));
    const bx=buggyX(),by=ground-jump;
    rect(bx-17,ground+2,35,2,'#38383c');
    ctx.save();ctx.translate(Math.round(bx),Math.round(by));
    for(const x of [-13,0,13]){circle(x,-4,5,'#111927');circle(x,-4,3,'#9a9cad');const a=scroll*.12;rect(x+Math.cos(a)*2,-4+Math.sin(a)*2,1,1,'#e0d8bb');}
    rect(-20,-15,40,8,'#d9b185');rect(-15,-18,27,4,'#ecceb0');rect(-5,-27,15,9,'#769ea5');rect(-3,-25,10,6,'#c1dde0');rect(5,-31,3,6,'#edd5ad');rect(16,-17,12,3,'#d4d3b7');rect(-22,-13,3,4,'#dc7d68');
    ctx.restore();
    sparks.forEach(p=>rect(p.x,p.y,2,2,p.color));
    ctx.font='9px monospace';ctx.fillStyle='#a7b5b4';ctx.textBaseline='top';
    ctx.fillText('MOON ORCHARD',14,14);
    ctx.fillStyle='#7e9b8f';ctx.fillText(String(trees.length).padStart(5,'0')+' TREES',14,28);
    ctx.fillStyle='#d0bea5';ctx.fillText('PATROL '+String(Math.floor(distance/100)).padStart(5,'0'),14,h-18);
    ctx.textAlign='right';ctx.fillStyle='#919694';ctx.fillText(paused?'PAUSED · SPACE TO RESUME':'AUTOPILOT',w-14,h-18);ctx.textAlign='left';
    canvas.dataset.trees=trees.length;canvas.dataset.jumps=jumps;
  }
  function toggle(){paused=!paused;canvas.setAttribute('aria-pressed',String(paused));draw();}
  canvas.addEventListener('click',toggle);
  addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();toggle();}if(e.code==='KeyS'){draw();const a=document.createElement('a');a.download='moon-orchard.png';a.href=canvas.toDataURL('image/png');a.click();}});
  addEventListener('resize',resize);addEventListener('pagehide',save);
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)save();});
  canvas.setAttribute('aria-pressed',String(paused));resize();
  function frame(now){const dt=last?Math.min((now-last)/1000,.04):0;last=now;if(!paused&&!document.hidden)update(dt);draw();requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
})();
