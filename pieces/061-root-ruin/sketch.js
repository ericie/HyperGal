(() => {
'use strict';
const {Engine,Bodies,Body,Composite,Vertices,Events}=Matter;
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
const ink='#191c18',paper='#f1eee5',W=1200,H=850,floor=735;
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
let engine,rocks=[],plants=[],fruits=[],seeds=[],dust=[],time=0,last=0,accumulator=0,scale=1,ox=0,oy=0;
let quietUntil=0,nextBirth=0,lastFracture=-100,hero=null,cameraX=W/2,cameraZoom=1;
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,fractures=0,impactQueue=new Set();
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;scale=Math.min(innerWidth/W,innerHeight/H);ox=(innerWidth-W*scale)/2;oy=(innerHeight-H*scale)/2;}
function world(b,p){const c=Math.cos(b.angle),s=Math.sin(b.angle);return {x:b.position.x+p.x*c-p.y*s,y:b.position.y+p.x*s+p.y*c};}
function local(b,p){const c=Math.cos(b.angle),s=Math.sin(b.angle),x=p.x-b.position.x,y=p.y-b.position.y;return {x:x*c+y*s,y:-x*s+y*c};}
function polygon(v){ctx.beginPath();ctx.moveTo(v[0].x,v[0].y);for(let i=1;i<v.length;i++)ctx.lineTo(v[i].x,v[i].y);ctx.closePath();}
function clip(poly,n,c){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a.x*n.x+a.y*n.y-c,db=b.x*n.x+b.y*n.y-c;if(da<=1e-8)out.push({x:a.x,y:a.y});if((da<0)!==(db<0)){const t=da/(da-db);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}return out;}
function makeRock(vertices,options={}){const center=Vertices.centre(vertices),body=Bodies.fromVertices(center.x,center.y,[vertices],{density:.006,friction:.82,frictionStatic:1.2,restitution:.035,frictionAir:.004,slop:.02,isStatic:!!options.fixed},false,0,0,0);
 const rock={body,depth:options.depth||0,stress:0,strength:rand(.95,1.25),born:time,cells:null};body.plugin.rock=rock;rocks.push(rock);Composite.add(engine.world,body);return rock;}
// Voronoi clipping partitions the parent's actual volume. No area is deleted.
function planFracture(rock){if(rock.cells)return rock.cells;const b=rock.body,poly=b.vertices.map(v=>local(b,v)),center=Vertices.centre(poly),radius=Math.sqrt(b.area),n=3,sites=[];
 const phase=rand(0,Math.PI*2);for(let i=0;i<n;i++){const a=phase+i*Math.PI*2/n,r=radius*rand(.17,.29);sites.push({x:center.x+Math.cos(a)*r,y:center.y+Math.sin(a)*r});}
 const cells=sites.map((site,i)=>{let v=poly;for(let j=0;j<n;j++){if(i===j)continue;const other=sites[j],normal={x:other.x-site.x,y:other.y-site.y},c=(other.x*other.x+other.y*other.y-site.x*site.x-site.y*site.y)/2;v=clip(v,normal,c);if(v.length<3)break;}return v;});
 if(cells.some(v=>v.length<3||Vertices.area(v)<280))return null;
 rock.cells=cells;return cells;}
function fracture(rock){if(!rocks.includes(rock)||rocks.length>100||rock.body.area<1600||rock.depth>=4)return false;const cells=planFracture(rock);if(!cells)return false;
 const b=rock.body,velocity=Body.getVelocity(b),omega=Body.getAngularVelocity(b),attachments=plants.filter(p=>p.rock===rock).map(p=>({p,base:plantBase(p),angle:plantAngle(p)}));
 const pieces=cells.map(v=>v.map(p=>world(b,p)));
 Composite.remove(engine.world,b);rocks=rocks.filter(r=>r!==rock);
 const children=pieces.map(v=>makeRock(v,{depth:rock.depth+1}));
 for(const child of children){const q=child.body,dx=q.position.x-b.position.x,dy=q.position.y-b.position.y;
 // A small root wedge separates the fracture. Gravity and contacts do the rest.
 Body.setVelocity(q,{x:velocity.x-omega*dy+dx*.0007,y:velocity.y+omega*dx+dy*.0007});Body.setAngularVelocity(q,omega);
 if(attachments.length){const radius=Math.sqrt(b.area);child.wedge={until:time+2.2,point:local(q,attachments[0].base),force:{x:dx/radius*.00045,y:dy/radius*.00045}};}}

 for(const {p,base,angle} of attachments){const inward={x:base.x-Math.sin(angle)*3,y:base.y+Math.cos(angle)*3};let child=children.find(r=>Vertices.contains(r.body.vertices,inward));
 if(!child)child=children.reduce((best,r)=>Math.hypot(r.body.position.x-base.x,r.body.position.y-base.y)<Math.hypot(best.body.position.x-base.x,best.body.position.y-base.y)?r:best);
 p.rock=child;p.anchor=local(child.body,base);p.orientation=angle-child.body.angle;}
 for(let i=0;i<10;i++)dust.push({x:b.position.x+rand(-20,20),y:b.position.y+rand(-20,20),vx:rand(-12,12),vy:rand(-8,5),life:rand(.5,1.5)});
 fractures++;lastFracture=time;return true;}
function reset(){if(engine){Events.off(engine);Engine.clear(engine);}engine=Engine.create({enableSleeping:true,positionIterations:10,velocityIterations:8});engine.gravity.y=1;engine.gravity.scale=.00055;
 rocks=[];plants=[];fruits=[];seeds=[];dust=[];time=0;accumulator=0;fractures=0;impactQueue.clear();quietUntil=0;nextBirth=0;lastFracture=-100;hero=null;cameraX=W/2;cameraZoom=1;
 Composite.add(engine.world,[Bodies.rectangle(600,floor+35,1400,70,{isStatic:true,friction:.85}),Bodies.rectangle(-135,400,70,1000,{isStatic:true}),Bodies.rectangle(1335,400,70,1000,{isStatic:true})]);
 // One dominant, off-centre formation; lower outcrops leave a valley for seeds.
 const mirror=Math.random()<.35,dx=rand(-20,20),rise=rand(-16,16);
 function formation(points){const v=points.map(([x,y])=>({x:mirror?W-x:x+dx,y:y+rise*(y<floor?1:0)}));return makeRock(Vertices.hull(v),{fixed:true});}
 const start=formation([[80,floor],[135,590],[210,446],[310,370],[440,397],[540,470],[650,floor]]);
 formation([[742,floor],[770,662],[860,615],[940,641],[1010,floor]]);
 formation([[1035,floor],[1080,560],[1160,515],[1215,572],[1260,floor]]);
 const x=mirror?W-(425+dx):425+dx;addPlant(ground(x),0);hero=plants[0];hero.hero=true;hero.height=110;hero.lean=-24;hero.petals=5;hero.leafCount=3;hero.age=3;
 Events.on(engine,'collisionStart',event=>{for(const pair of event.pairs){const a=pair.bodyA,b=pair.bodyB,speed=Math.hypot(a.velocity.x-b.velocity.x,a.velocity.y-b.velocity.y);if(speed<8.5)continue;for(const body of [a,b]){const r=body.plugin.rock;if(r&&!body.isStatic&&r.depth<3&&body.area>3500&&time-r.born>8)impactQueue.add(r);}}});}
function ground(x){let hit=null;for(const rock of rocks){const v=rock.body.vertices;if(x<rock.body.bounds.min.x||x>rock.body.bounds.max.x)continue;for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length];if(x<Math.min(a.x,b.x)||x>Math.max(a.x,b.x)||Math.abs(b.x-a.x)<.001)continue;const y=a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x);if(!hit||y<hit.y)hit={x,y,rock};}}return hit;}
function addPlant(hit,generation){if(!hit||plants.filter(p=>!p.dead).length>=9||time<quietUntil)return;const b=hit.rock.body;plants.push({rock:hit.rock,anchor:local(b,hit),orientation:-b.angle,age:0,height:rand(62,96),lean:rand(-24,22),hero:false,petals:Math.floor(rand(4,7)),leafCount:Math.floor(rand(3,6)),shape:rand(.7,1.3),period:rand(72,88),generation,cycle:0,dead:false,roots:Array.from({length:4},()=>({dx:rand(-65,65),dy:rand(50,125)}))});}
function plantBase(p){return world(p.rock.body,p.anchor);}
function plantAngle(p){return p.rock.body.angle+p.orientation;}
function plantHeight(p){return (p.height+Math.min(25,p.age*.09))*ease(p.age/18);}
function plantPoint(p,x,y){const base=plantBase(p),a=plantAngle(p);return {x:base.x+x*Math.cos(a)-y*Math.sin(a),y:base.y+x*Math.sin(a)+y*Math.cos(a)};}
function plantTop(p){return plantPoint(p,p.lean*ease(p.age/18),-plantHeight(p));}
function killPlant(p){if(p.dead)return;p.dead=true;p.died=time;p.deathHeight=plantHeight(p);quietUntil=Math.max(quietUntil,time+(p.hero?24:14));const top=plantTop(p);for(let i=0;i<3;i++)dust.push({x:top.x+rand(-8,8),y:top.y,vx:rand(-20,20),vy:rand(-8,10),life:rand(.6,1.5)});}
function checkBurials(){for(const p of plants){if(p.dead)continue;const base=plantBase(p),top=plantTop(p);if(base.y>floor+5||top.y>floor+8){killPlant(p);continue;}for(const r of rocks){if(r===p.rock)continue;const b=r.body;if(b.bounds.max.x<Math.min(base.x,top.x)-2||b.bounds.min.x>Math.max(base.x,top.x)+2||b.bounds.max.y<Math.min(base.y,top.y)||b.bounds.min.y>Math.max(base.y,top.y))continue;
 if([.12,.25,.4,.55,.7,.85,1].some(t=>Vertices.contains(b.vertices,{x:base.x+(top.x-base.x)*t,y:base.y+(top.y-base.y)*t}))){killPlant(p);break;}}}}
function dropFruit(p){if(fruits.length>=12)return;const top=plantTop(p),body=Bodies.circle(top.x,top.y+3,7,{density:.0005,friction:.35,frictionStatic:.8,restitution:.2,frictionAir:.003});Body.setVelocity(body,Body.getVelocity(p.rock.body));Composite.add(engine.world,body);fruits.push({body,x:top.x,y:top.y,age:0,rest:0,melt:0,generation:p.generation+1,spawned:false});}
function puff(f){for(let i=0;i<3&&seeds.length<24;i++)seeds.push({x:f.x+rand(-9,9),y:f.y-6,vx:rand(-30,30),vy:rand(-60,-35),drift:rand(-25,25),phase:rand(0,6.28),age:0,generation:f.generation});}
function step(dt){time+=dt;
 // Roots prise the split open for a moment, applying force at the root pocket.
 // Equal, mass-weighted forces transfer into rotation and contact with neighbours.
 for(const r of rocks){if(r.wedge&&time<r.wedge.until){const fade=1-ease((time-(r.wedge.until-2.2))/2.2);Body.applyForce(r.body,world(r.body,r.wedge.point),{x:r.wedge.force.x*r.body.mass*fade,y:r.wedge.force.y*r.body.mass*fade});}}
 Engine.update(engine,dt*1000);
 for(const r of impactQueue)if(time-lastFracture>10&&time>quietUntil)fracture(r);impactQueue.clear();
 for(const p of plants){if(p.dead)continue;p.age+=dt*(time<quietUntil?.15:1);const r=p.rock;if(r.body.area>1600&&r.depth<4){if(time>quietUntil)r.stress+=dt*.012*ease((p.age-38)/55);if(r.stress>.25&&!r.cells)planFracture(r);if(r.stress>=r.strength&&time-lastFracture>12&&time>quietUntil){if(!fracture(r))r.stress=0;}}
 const period=p.hero?72:p.period,cycle=Math.floor(Math.max(0,p.age-12)/period),phase=Math.max(0,p.age-12)%period;if(phase>=42&&cycle>=p.cycle){p.cycle=cycle+1;dropFruit(p);}}
 checkBurials();
 for(const f of fruits){f.age+=dt;if(f.melt){f.melt+=dt;if(f.melt>3.5&&!f.spawned){f.spawned=true;puff(f);}continue;}f.x=f.body.position.x;f.y=f.body.position.y;const speed=Body.getSpeed(f.body);f.rest=speed<.12?f.rest+dt:0;if(f.rest>3.5||(f.age>14&&speed<.4)){f.melt=.001;Composite.remove(engine.world,f.body);}}
 for(const s of seeds){s.age+=dt;const oldY=s.y,wind=22*Math.sin(time*.025)+14*Math.sin(time*.08)+s.drift;s.vx+=(wind-s.vx)*dt*.55;const target=s.age<2.5?-18:s.age<12?3:13;s.vy+=(target+Math.sin(s.age*2+s.phase)*3-s.vy)*dt*.9;s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.age>2.5&&s.vy>0){const hit=ground(s.x);if(hit&&oldY<=hit.y+3&&s.y>=hit.y-1){if(time>=nextBirth&&time>=quietUntil&&!plants.some(p=>Math.hypot(plantBase(p).x-s.x,plantBase(p).y-s.y)<65)){const count=plants.length;addPlant(hit,s.generation);if(plants.length>count)nextBirth=time+18;}s.landed=true;}}}
 seeds=seeds.filter(s=>!s.landed&&s.age<65&&s.x>-60&&s.x<W+60);fruits=fruits.filter(f=>f.melt<6);plants=plants.filter(p=>!p.dead||time-p.died<75);
 if(fractures){let left=0,right=W;for(const p of plants){const top=plantTop(p),base=plantBase(p);left=Math.min(left,top.x-35,base.x-35);right=Math.max(right,top.x+35,base.x+35);}const targetZoom=Math.min(1,W/(right-left+30)),follow=1-Math.exp(-dt*.7);cameraZoom+=(targetZoom-cameraZoom)*follow;cameraX+=((left+right)/2-cameraX)*follow;}
 for(const d of dust){d.life-=dt;d.vy+=100*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;}dust=dust.filter(d=>d.life>0).slice(-250);}
function ellipse(x,y,rx,ry,a=0){ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),a,0,Math.PI*2);ctx.fill();}
function leaf(x,y,size,dir){ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+dir*size*.2,y-size*.9,x+dir*size,y-size*.8,x+dir*size,y-size*.55);ctx.bezierCurveTo(x+dir*size*.8,y-size*.05,x+dir*size*.3,y+size*.1,x,y);ctx.fill();}
function drawPlant(p){const base=plantBase(p);ctx.save();ctx.translate(base.x,base.y);ctx.rotate(plantAngle(p));ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineCap='round';
 if(p.dead){const since=time-p.died,wilt=ease(since/12),h=p.deathHeight;ctx.globalAlpha=1-ease((since-55)/20);ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(p.lean*.4,-h*.4,p.lean+30*wilt,-h*.9,p.lean+48*wilt,-h*(1-.58*wilt));ctx.stroke();leaf(p.lean*.3,-h*.35,12,-1);ellipse(p.lean+48*wilt,-h*(1-.58*wilt),3,5,.7*wilt);ctx.restore();return;}
 const g=ease(p.age/18),height=plantHeight(p),x=p.lean*g,y=-height;
 // The first stem has a recognisable crook and one long, downward-curled leaf.
 ctx.lineWidth=1.6+.8*g;ctx.beginPath();ctx.moveTo(0,2);ctx.bezierCurveTo(p.hero?12:-5,-height*.35,x-12,y+height*.3,x,y);ctx.stroke();
 for(let i=0;i<p.leafCount;i++){const u=.24+i*.17,dir=i%2?1:-1,size=(p.hero?(i===0?29:18):17*p.shape)*g*ease((p.age-3-i*3)/13);ctx.save();ctx.translate(x*u,-height*u);ctx.rotate(p.hero&&i===0?-.65:dir*.12);leaf(0,0,size,dir);ctx.restore();}
 const period=p.hero?72:p.period,phase=Math.max(0,p.age-12)%period;
 if(p.age>12&&phase<42){const opening=ease((phase-4)/9)*(1-ease((phase-28)/8)),fruit=ease((phase-34)/7);ctx.save();ctx.translate(x,y);ctx.rotate(p.hero?-.22:.12);for(let i=0;i<p.petals;i++){const a=i*Math.PI*2/p.petals;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(-2,0);ctx.bezierCurveTo(-8*opening,-8*opening,-4*opening,-19*opening,0,-23*opening-3);ctx.bezierCurveTo(6*opening,-17*opening,8*opening,-5*opening,2,0);ctx.fill();ctx.restore();}ellipse(0,fruit*4,3+4*fruit,4+5*fruit);ctx.restore();}
 // A single visitor arrives slowly, rests, and then leaves the flower alone.
 if(phase>15&&phase<28&&p.age>12){const arriving=ease((phase-15)/5),leaving=ease((phase-24)/4);ctx.save();ctx.translate(x+(phase<20?-180*(1-arriving):240*leaving),y-12-(phase<20?50*(1-arriving):110*leaving));const wing=phase<20||phase>24?Math.sin(time*40)*.5:0;ellipse(-2,-6,6,2,-.5-wing);ellipse(3,-7,5,2,.4+wing);ellipse(0,0,6,3);ellipse(5,-1,2,2);ctx.restore();}ctx.restore();}
function drawFaults(r){if(!r.cells||r.stress<.35)return;const original=r.body.vertices,progress=ease((r.stress-.35)/(r.strength-.35)),segments=[];
 for(const cell of r.cells){const v=cell.map(p=>world(r.body,p));for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};let boundary=false;for(let j=0;j<original.length;j++){const p=original[j],q=original[(j+1)%original.length],dx=q.x-p.x,dy=q.y-p.y,t=clamp(((mid.x-p.x)*dx+(mid.y-p.y)*dy)/(dx*dx+dy*dy),0,1);if(Math.hypot(mid.x-p.x-dx*t,mid.y-p.y-dy*t)<.5)boundary=true;}if(!boundary&&!segments.some(e=>Math.hypot(e.mid.x-mid.x,e.mid.y-mid.y)<1))segments.push({a,b,mid});}}
 const root=plants.find(p=>!p.dead&&p.rock===r),origin=root?plantBase(root):r.body.position;segments.sort((a,b)=>Math.hypot(a.mid.x-origin.x,a.mid.y-origin.y)-Math.hypot(b.mid.x-origin.x,b.mid.y-origin.y));
 ctx.lineWidth=.7;for(let i=0;i<segments.length;i++){let {a,b}=segments[i];if(Math.hypot(b.x-origin.x,b.y-origin.y)<Math.hypot(a.x-origin.x,a.y-origin.y))[a,b]=[b,a];const t=clamp(progress*segments.length-i,0,1);if(!t)continue;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);ctx.stroke();}}
function drawSeed(s){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.sin(s.age*1.8+s.phase)*.25+s.vx*.004);ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(0,3);ctx.lineTo(0,-7);for(let i=0;i<9;i++){const a=-Math.PI+Math.PI*i/8,x=Math.cos(a)*8,y=-7+Math.sin(a)*5;ctx.moveTo(0,-6);ctx.lineTo(x,y);ctx.moveTo(x-1,y-1);ctx.lineTo(x+1,y+1);}ctx.stroke();ellipse(0,4,1.4,3);ctx.restore();}
function draw(){ctx.setTransform(canvas.width/innerWidth,0,0,canvas.height/innerHeight,0,0);ctx.fillStyle=paper;ctx.fillRect(0,0,innerWidth,innerHeight);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.translate(W/2,floor);ctx.scale(cameraZoom,cameraZoom);ctx.translate(-cameraX,-floor);ctx.fillStyle=ink;
 for(const p of plants)drawPlant(p);
 for(const r of rocks){ctx.fillStyle=ink;polygon(r.body.vertices);ctx.fill();ctx.save();polygon(r.body.vertices);ctx.clip();ctx.strokeStyle=paper;drawFaults(r);
 for(const p of plants){if(p.dead||p.rock!==r)continue;const base=plantBase(p);ctx.save();ctx.translate(base.x,base.y);ctx.rotate(plantAngle(p));ctx.lineWidth=1;ctx.beginPath();for(const root of p.roots){const g=ease((p.age-18)/75);ctx.moveTo(0,2);ctx.quadraticCurveTo(root.dx*g*.25,root.dy*g*.5,root.dx*g,root.dy*g);}ctx.stroke();ctx.restore();}ctx.restore();}
 for(const f of fruits){ctx.fillStyle=ink;const m=ease(f.melt/3.5);ellipse(f.x,f.y+7*m,7*(1+1.5*m),7*(1-.88*m),f.melt?0:f.body.angle);}
 for(const s of seeds)drawSeed(s);ctx.fillStyle=ink;for(const d of dust){ctx.globalAlpha=clamp(d.life,0,1);ctx.fillRect(d.x,d.y,2,2);}ctx.globalAlpha=1;ctx.restore();}
function save(){draw();canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='root-ruin.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});}
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();paused=!paused;}if(e.key.toLowerCase()==='r')reset();if(e.key.toLowerCase()==='s')save();});addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{last=0;accumulator=0;});
function frame(now){const dt=last?Math.min((now-last)/1000,.08):0;last=now;if(!paused&&!document.hidden){accumulator+=dt;while(accumulator>=1/120){step(1/120);accumulator-=1/120;}}draw();requestAnimationFrame(frame);}
resize();reset();requestAnimationFrame(frame);
})();
