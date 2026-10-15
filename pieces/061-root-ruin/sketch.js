(() => {
'use strict';
const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');
const ink = '#191c18', paper = '#f1eee5', W = 1200, H = 850, floor = 735;
let chunks = [], bodies = [], bonds = [], plants = [], fruits = [], dust = [], time = 0, accumulator = 0, last = 0;
let paused = matchMedia('(prefers-reduced-motion: reduce)').matches, scale = 1, ox = 0, oy = 0, nextId = 0;
const rand = (a,b) => a + Math.random()*(b-a), clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const ease = v => { v = clamp(v,0,1); return v*v*(3-2*v); };
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*d);canvas.height=Math.round(innerHeight*d);scale=Math.min(innerWidth/W,innerHeight/H);ox=(innerWidth-W*scale)/2;oy=(innerHeight-H*scale)/2;ctx.setTransform(d,0,0,d,0,0);}
function world(body,p){const c=Math.cos(body.a),s=Math.sin(body.a);return {x:body.x+p.x*c-p.y*s,y:body.y+p.x*s+p.y*c};}
function local(body,p){const c=Math.cos(body.a),s=Math.sin(body.a),x=p.x-body.x,y=p.y-body.y;return {x:x*c+y*s,y:-x*s+y*c};}
function surface(x){return floor-260*Math.pow(Math.max(0,1-Math.pow((x-600)/455,2)),.8);}
function reset(){
 chunks=[];bodies=[];bonds=[];plants=[];fruits=[];dust=[];time=0;accumulator=0;nextId=0;
 const points=[],edgeMap=new Map(), cols=18,rows=7;
 for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){
 const x=145+c*910/cols;points.push({x,y:surface(x)+(floor-surface(x))*r/rows});}
 function triangle(ids){const v=ids.map(i=>points[i]); const area=Math.abs((v[1].x-v[0].x)*(v[2].y-v[0].y)-(v[2].x-v[0].x)*(v[1].y-v[0].y));if(area<15)return;
 const x=v.reduce((s,p)=>s+p.x,0)/3,y=v.reduce((s,p)=>s+p.y,0)/3;
 const b={id:bodies.length,x,y,initialX:x,initialY:y,vx:0,vy:0,a:0,spin:rand(-.4,.4),fixed:ids.every(i=>points[i].y>floor-42),supported:true,verts:v.map(p=>({x:p.x-x,y:p.y-y})),edges:[]};b.chunk={id:chunks.length,x,y,initialX:x,vx:0,vy:0,a:0,spin:0,loose:false,load:0,strength:rand(.8,1.5),bodies:[b]};b.offset={x:0,y:0};chunks.push(b.chunk);bodies.push(b);bodies.push(b);
 for(let k=0;k<3;k++){const a=ids[k],z=ids[(k+1)%3],key=[Math.min(a,z),Math.max(a,z)].join(':');const prev=edgeMap.get(key);if(prev){const bond={a:prev.body,b,dx:x-prev.body.x,dy:y-prev.body.y,damage:0,broken:false,mid:{x:(points[a].x+points[z].x)/2,y:(points[a].y+points[z].y)/2},ea:prev.k,eb:k};bonds.push(bond);b.edges[k]=bond;prev.body.edges[prev.k]=bond;}else edgeMap.set(key,{body:b,k});}}
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const i=r*(cols+1)+c;triangle([i,i+1,i+cols+1]);triangle([i+1,i+cols+2,i+cols+1]);}
 const hit=ground(600);addPlant(hit,0);plants[0].age=1.5;updateSupport();
}
function ground(x,chunk=null){let best=null;
 for(const b of bodies){if(chunk&&b.chunk!==chunk)continue;const v=b.verts.map(p=>world(b,p));for(let k=0;k<3;k++){const p=v[k],q=v[(k+1)%3];if(x<Math.min(p.x,q.x)||x>Math.max(p.x,q.x)||Math.abs(q.x-p.x)<.01)continue;const y=p.y+(q.y-p.y)*(x-p.x)/(q.x-p.x);if(y<floor+2&&(!best||y<best.y))best={x,y,body:b,slope:(q.y-p.y)/(q.x-p.x)};}}
 return best;
}
function addPlant(hit,generation){if(!hit||plants.length>=48)return;const p={id:nextId++,body:hit.body,anchor:local(hit.body,hit),age:0,generation,height:rand(80,125)/(1+generation*.035),lean:rand(-17,17),cycle:0,roots:[],born:time};
 for(let i=0;i<5;i++)p.roots.push({dx:rand(-90,90),dy:rand(60,160),bend:rand(-20,20),length:0});plants.push(p);}
function updateSupport(){
 for(const b of bodies)b.supported=b.fixed&&!b.chunk.loose;
 let changed=true;while(changed){changed=false;for(const e of bonds){if(e.broken||e.a.chunk.loose||e.b.chunk.loose)continue;if(e.a.supported!==e.b.supported){e.a.supported=e.b.supported=true;changed=true;}}}
 for(const b of bodies)if(!b.supported&&!b.chunk.loose)release(b.chunk);
}
function fracture(e){if(e.broken)return;e.broken=true;const x=(e.a.x+e.b.x)/2,y=(e.a.y+e.b.y)/2;for(let i=0;i<3;i++)dust.push({x,y,vx:rand(-25,25),vy:rand(-30,5),life:rand(.4,1.4)});}
function release(chunk){
 chunk.loose=true;const dir=chunk.initialX<600?-1:1;
 chunk.vx=dir*rand(45,70);chunk.vy=0;chunk.spin=rand(-1.2,1.2);
 for(const b of chunk.bodies)for(const e of b.edges)if(e)fracture(e);
 for(const b of chunk.bodies)b.supported=false;
}
function syncChunk(chunk){const c=Math.cos(chunk.a),s=Math.sin(chunk.a);for(const b of chunk.bodies){b.x=chunk.x+b.offset.x*c-b.offset.y*s;b.y=chunk.y+b.offset.x*s+b.offset.y*c;b.a=chunk.a;}}
function plantBase(p){const anchor=world(p.body,p.anchor),hit=ground(anchor.x,p.body.chunk);return {x:anchor.x,y:hit?hit.y:anchor.y};}
function step(dt){
 const rootTick=Math.floor((time+dt)*15)!==Math.floor(time*15);
 time+=dt;
 // Unbroken hill sections are rigid. Root pressure travels through the rock;
 // exposed flanks shed first, then the next unsupported section crumbles.
 const pressureSources=rootTick?plants.map(p=>({base:plantBase(p),force:ease((p.age-8)/25)})):[];
 for(const chunk of chunks){
 if(!chunk.loose){
 if(rootTick){let pressure=0;for(const p of pressureSources)pressure+=p.force/(1+Math.abs(p.base.x-chunk.initialX)/160);chunk.load+=pressure*(1/15)*.035;}
 const exposed=Math.abs(chunk.initialX-600)>390||chunk.bodies[0].edges.some(e=>e&&(e.a.chunk.loose||e.b.chunk.loose));
 if(exposed&&chunk.load>chunk.strength)release(chunk);
 else continue;
 }
 chunk.vy+=150*dt;chunk.x+=chunk.vx*dt;chunk.y+=chunk.vy*dt;
 chunk.a+=chunk.spin*dt;syncChunk(chunk);
 const bottom=Math.max(...chunk.bodies.flatMap(b=>b.verts.map(v=>world(b,v).y)));
 if(bottom>floor){chunk.y-=bottom-floor;chunk.vy=-Math.abs(chunk.vy)*.12;chunk.vx*=Math.exp(-1.8*dt);
 chunk.spin*=Math.exp(-4*dt);syncChunk(chunk);}
 if(chunk.x<70||chunk.x>1130){chunk.x=clamp(chunk.x,70,1130);chunk.vx=0;syncChunk(chunk);}
 }
 for(const p of plants){p.age+=dt;const base=plantBase(p),grow=ease(p.age/6);
 for(const root of p.roots){root.length=ease((p.age-2)/32)*(1+.65*ease((p.age-32)/100));if(root.length<=0)continue;
 // Root tips widen their path as they grow; the damage is applied to real mesh bonds.
 const tip={x:base.x+root.dx*root.length,y:base.y+root.dy*root.length};
 if(!rootTick)continue;
 for(const e of bonds){if(e.broken)continue;const mid={x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2},rx=tip.x-base.x,ry=tip.y-base.y;
 const u=clamp(((mid.x-base.x)*rx+(mid.y-base.y)*ry)/(rx*rx+ry*ry||1),0,1),dist=Math.hypot(mid.x-base.x-rx*u,mid.y-base.y-ry*u);
 if(dist<12&&mid.y>base.y+12){e.damage+=(1/15)*.022*grow;if(e.damage>=1)fracture(e);}}
 }
 const cycle=Math.floor(Math.max(0,p.age-3)/24),phase=Math.max(0,p.age-3)%24;
 if(phase>=17&&cycle>=p.cycle){p.cycle=cycle+1;if(fruits.length<80){const top=plantTop(p);fruits.push({x:top.x,y:top.y+8,vx:(Math.random()<.5?-1:1)*rand(32,55),vy:0,r:9,age:0,rest:0,rotation:0,melt:0,generation:p.generation+1,spawned:false});}}
 }
 for(const f of fruits){f.age+=dt;if(f.melt>0){f.melt+=dt;if(f.melt>2.3&&!f.spawned){f.spawned=true;for(let i=0;i<3;i++){const x=clamp(f.x+(i-1)*rand(15,25),155,1045);const hit=ground(x);if(hit&&Math.abs(hit.y-f.y)<70)addPlant(hit,f.generation);}}continue;}
 f.vy+=180*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.rotation+=f.vx*dt/f.r;
 const hit=ground(f.x);if(hit&&f.y+f.r>=hit.y&&f.y-f.r<hit.y+35){f.y=hit.y-f.r;f.vy=0;f.vx+=hit.slope*105*dt;f.vx*=Math.exp(-.9*dt);f.rest+=dt;
 // Surface friction catches fruit even on the flank, so the seeds have time to take hold.
 if(f.rest>4){f.vx*=Math.exp(-7*dt);if(Math.abs(f.vx)<5)f.melt=.001;}}
 else if(f.y+f.r>=floor){f.y=floor-f.r;f.vy=0;f.vx*=.94;f.rest+=dt;if(f.rest>2)f.melt=.001;}
 if(f.x<100||f.x>1100){f.x=clamp(f.x,100,1100);f.vx*=-.4;}}
 fruits=fruits.filter(f=>f.melt<5);for(const d of dust){d.life-=dt;d.vy+=100*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;}dust=dust.filter(d=>d.life>0).slice(-300);
 if(Math.floor(time*4)!==Math.floor((time-dt)*4))updateSupport();
}
function plantHeight(p){return p.height+Math.min(85,Math.max(0,p.age-6)*.42);}
function plantTop(p){const base=plantBase(p),g=ease(p.age/6);return {x:base.x+p.lean*g,y:base.y-plantHeight(p)*g};}
function ellipse(x,y,rx,ry,a=0){ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),a,0,Math.PI*2);ctx.fill();}
function leaf(x,y,size,dir){ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+dir*size*.2,y-size*.9,x+dir*size,y-size*.8,x+dir*size,y-size*.55);ctx.bezierCurveTo(x+dir*size*.8,y-size*.05,x+dir*size*.3,y+size*.1,x,y);ctx.fill();}
function drawPlant(p){const base=plantBase(p),top=plantTop(p),g=ease(p.age/6);ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineWidth=3*g+.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(base.x,base.y+2);ctx.bezierCurveTo(base.x-6,base.y-plantHeight(p)*g*.4,top.x+5,top.y+25,top.x,top.y);ctx.stroke();
 for(let i=0;i<4;i++){const u=.25+i*.14;leaf(base.x+p.lean*g*u,base.y-plantHeight(p)*g*u,22*g*ease((p.age-i*.6)/4),i%2?1:-1);}
 const phase=Math.max(0,p.age-3)%24;
 if(p.age>3&&phase<17){const opening=ease((phase-1)/3)*(1-ease((phase-10)/3));const fruit=ease((phase-12)/3);
 for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/2;ellipse(top.x+Math.cos(a)*10*opening,top.y+Math.sin(a)*10*opening,3+6*opening,3+3*opening,a);}ellipse(top.x,top.y+fruit*5,4+5*fruit,5+7*fruit);}
 if(phase>5&&phase<12&&p.age>3){let x,y,a=0;const arrival=ease((phase-5)/2),depart=ease((phase-9)/3);if(phase<7){x=top.x-170*(1-arrival);y=top.y-55*(1-arrival)+Math.sin(phase*6)*5*(1-arrival);}else{x=top.x+230*depart;y=top.y-12-100*depart;a=-depart*.4;}ctx.save();ctx.translate(x,y);ctx.rotate(a);const wing=phase<7||phase>9?Math.sin(time*45)*.6:0;ellipse(-2,-7,7,3,-.5-wing);ellipse(3,-8,6,3,.4+wing);ellipse(0,0,8,4);ellipse(7,-1,3,3);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(9,-2);ctx.lineTo(12,-5);ctx.moveTo(-2,3);ctx.lineTo(-3,7);ctx.moveTo(3,3);ctx.lineTo(5,7);ctx.stroke();ctx.restore();}
}
function draw(){ctx.save();ctx.setTransform(canvas.width/innerWidth,0,0,canvas.height/innerHeight,0,0);ctx.fillStyle=paper;ctx.fillRect(0,0,innerWidth,innerHeight);ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.fillStyle=ink;
 ctx.fillRect(90,floor,1020,1);
 for(const b of bodies){const v=b.verts.map(p=>world(b,p));ctx.beginPath();ctx.moveTo(v[0].x,v[0].y);ctx.lineTo(v[1].x,v[1].y);ctx.lineTo(v[2].x,v[2].y);ctx.closePath();ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=.8;ctx.stroke();}
 // Ivory root incisions reveal the otherwise black underground silhouette.
 ctx.save();ctx.beginPath();for(const b of bodies){const v=b.verts.map(p=>world(b,p));ctx.moveTo(v[0].x,v[0].y);ctx.lineTo(v[1].x,v[1].y);ctx.lineTo(v[2].x,v[2].y);ctx.closePath();}ctx.clip();
 ctx.strokeStyle=paper;ctx.lineCap='round';for(const p of plants){const base=plantBase(p);for(const r of p.roots){const l=r.length;if(l<=0)continue;ctx.lineWidth=1.2+2*l;ctx.beginPath();ctx.moveTo(base.x,base.y+4);ctx.quadraticCurveTo(base.x+r.dx*l*.2+r.bend*l,base.y+r.dy*l*.5,base.x+r.dx*l,base.y+r.dy*l);ctx.stroke();}}
 for(const e of bonds)if(e.damage>.25&&!e.broken){const b=e.a,k=e.ea,p=world(b,b.verts[k]),q=world(b,b.verts[(k+1)%3]);ctx.strokeStyle=paper;ctx.lineWidth=e.damage*1.8;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+(q.x-p.x)*e.damage,p.y+(q.y-p.y)*e.damage);ctx.stroke();}
 ctx.restore();for(const p of plants)drawPlant(p);
 ctx.fillStyle=ink;for(const f of fruits){const m=ease(f.melt/2);ctx.save();ctx.translate(f.x,f.y+f.r*m);ctx.rotate(f.melt?0:f.rotation);ellipse(0,0,f.r*(1+1.6*m),f.r*(1-.88*m));if(!f.melt){ctx.lineWidth=1.5;ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(2,-12);ctx.stroke();}ctx.restore();if(f.melt>1.6){for(let i=0;i<3;i++)ellipse(f.x+(i-1)*16,f.y+f.r-1,2.5,1.8);}}
 for(const d of dust){ctx.globalAlpha=clamp(d.life,0,1);ctx.fillRect(d.x,d.y,2,2);}ctx.globalAlpha=1;ctx.restore();
}
function toggle(){paused=!paused;}
function save(){draw();canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='root-ruin.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});}
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();toggle();}if(e.key.toLowerCase()==='r')reset();if(e.key.toLowerCase()==='s')save();});addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{last=0;accumulator=0;});
function frame(now){const elapsed=last?Math.min((now-last)/1000,.08):0;last=now;if(!paused&&!document.hidden){accumulator+=elapsed;while(accumulator>=1/120){step(1/120);accumulator-=1/120;}}draw();requestAnimationFrame(frame);}
resize();reset();requestAnimationFrame(frame);
})();
