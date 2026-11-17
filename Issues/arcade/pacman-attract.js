// A look back, a clean escape, then the giant consumes the title and its dot row.
(() => {
 'use strict';const K=window.ArcadeFilmKit,{clamp,mix,ease,mod,line,disc}=K;
 const duration=14.8,still=2.2,titleAt=0,bg='#08031c',giantRadius=800;
 const enterAt=.8,feedEnd=4,lookAt=4.4,runAt=5.1,chaseAt=6.9,giantEnd=10.5,resetAt=11.2,feedSpeed=95,runSpeed=390,dotY=530;
 const words=['TO BIG','FOR THIS','WORLD'],unit=16;
 // Continuous title strokes retain the current blue outlined lettering.
 const glyphs={
  T:[[[0,0],[5,0]],[[2.5,0],[2.5,7]]],
  O:[[[1,0],[4,0],[5,1],[5,6],[4,7],[1,7],[0,6],[0,1],[1,0]]],
  B:[[[0,7],[0,0],[3.5,0],[5,1],[5,2.5],[3.5,3.5],[0,3.5]],[[3.5,3.5],[5,4.5],[5,6],[3.5,7],[0,7]]],
  I:[[[.5,0],[4.5,0]],[[2.5,0],[2.5,7]],[[.5,7],[4.5,7]]],
  G:[[[5,1],[4,0],[1,0],[0,1],[0,6],[1,7],[4,7],[5,6],[5,4],[2.8,4]]],
  F:[[[0,7],[0,0],[5,0]],[[0,3.5],[4,3.5]]],
  R:[[[0,7],[0,0],[3.5,0],[5,1],[5,2.5],[3.5,3.5],[0,3.5]],[[2.5,3.5],[5,7]]],
  H:[[[0,0],[0,7]],[[5,0],[5,7]],[[0,3.5],[5,3.5]]],
  S:[[[5,0],[1,0],[0,1],[0,2.5],[1,3.5],[4,3.5],[5,4.5],[5,6],[4,7],[0,7]]],
  W:[[[0,0],[.5,7],[2.5,4],[4.5,7],[5,0]]],
  L:[[[0,0],[0,7],[5,7]]],
  D:[[[0,0],[3.5,0],[5,1.5],[5,5.5],[3.5,7],[0,7],[0,0]]]
 };
 const letters=[],walls=[];
 words.forEach((word,row)=>{const x=(800-(word.length*6-1)*unit)/2,y=48+row*148;
  [...word].forEach((char,index)=>{if(char===' ')return;const strokes=glyphs[char].map(ps=>ps.map(([xx,yy])=>[x+(index*6+xx)*unit,y+yy*unit]));letters.push({char,row,index,x:x+index*6*unit,y,strokes});walls.push(...strokes);});
 });
 const pellets=Array.from({length:27},(_,id)=>({id,x:49+id*27,y:dotY}));
 const distanceToSegment=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],p=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy));return Math.hypot(x-a[0]-p*dx,y-a[1]-p*dy);};
 const root=Float64Array.from({length:301},(_,i)=>Math.sqrt(giantRadius**2-(i*2-300)**2));
 const giantX=age=>-1040+800*age;
 function mouth(age){const p=mod(age,.56);return p<.09?0:.43*Math.sin((p-.09)/(.56-.09)*Math.PI)**2;}
 function sweep(t){
  const edges=new Float64Array(301);edges.fill(-2000);
  if(t<chaseAt)return edges;
  const age=Math.min(t,giantEnd)-chaseAt,base=Math.floor(age/.56)*.56,lastClosed=base+Math.min(.09,age-base);
  for(let y=0;y<301;y++)edges[y]=giantX(lastClosed)+root[y];
  // The last closed bite contains every earlier bite. Only this jaw cycle needs sampling.
  const steps=Math.floor((age-lastClosed)*240+1e-9);
  for(let i=1;i<=steps;i++){const at=lastClosed+i/240,m=mouth(at),x=giantX(at),tan=Math.tan(m);
   for(let y=0;y<301;y++){const jaw=m<1e-6?root[y]:Math.min(root[y],Math.abs(y*2-300)/tan);edges[y]=Math.max(edges[y],x+jaw);}
  }
  return edges;
 }
 function stateAt(seconds){
  const t=mod(seconds,duration),reset=t>=resetAt,age=Math.max(0,t-runAt),feedX=-22+feedSpeed*Math.max(0,Math.min(t,feedEnd)-enterAt),runDistance=runSpeed*(age-.13*(1-Math.exp(-age/.13))),x=t<runAt?feedX:282+runDistance;
  const edges=sweep(t),small={x,y:dotY,radius:10,angle:t<lookAt?0:t<runAt?Math.PI:0,mouth:t>=feedEnd&&t<runAt?.13:.16+.27*Math.abs(Math.sin(t*11)),speed:t<enterAt?0:t<feedEnd?feedSpeed:t<runAt?0:runSpeed*(1-Math.exp(-age/.13))};
  small.exited=small.x-small.radius>800;small.visible=t>=enterAt&&!reset&&!small.exited&&t<giantEnd;
  const giantAge=t-chaseAt,giant={visible:t>=chaseAt&&t<giantEnd,x:giantX(Math.max(0,giantAge)),y:300,radius:giantRadius,mouth:mouth(Math.max(0,giantAge))};
  return {t,phase:reset?'rebuild':t>=giantEnd?'empty':t>=chaseAt?'giant':t>=runAt?'escape':t>=lookAt?'look-back':t>=feedEnd?'pause':t>=enterAt?'feed':'title',small,giant,edges,
   rebuild:reset?ease((t-resetAt)/2):1,pellets:pellets.map(p=>({...p,eaten:!reset&&(p.x<=x+10||edges[Math.round(p.y/2)]>=p.x+4)}))};
 }
 let world;
 function trace(c,ps,amount,color,width){if(amount<=0)return;const lengths=ps.slice(1).map((p,i)=>Math.hypot(p[0]-ps[i][0],p[1]-ps[i][1])),total=lengths.reduce((a,b)=>a+b,0);let left=total*amount;const points=[ps[0]];
  for(let i=0;i<lengths.length;i++){const p=clamp(left/lengths[i]);points.push([mix(ps[i][0],ps[i+1][0],p),mix(ps[i][1],ps[i+1][1],p)]);left-=lengths[i];if(p<1)break;}line(c,points,color,width);
 }
 function pac(c,p,angle,m){c.save();c.translate(p.x,p.y);c.rotate(angle);c.fillStyle='#ffe641';c.beginPath();c.moveTo(0,0);c.arc(0,0,p.radius,m,Math.PI*2-m);c.closePath();c.fill();
  // The eye makes the stopped backward glance readable at the small actor's scale.
  c.restore();disc(c,p.x+Math.cos(angle)*p.radius*.3,p.y-p.radius*.32,p.radius>100?16:1.7,bg);}
 function draw(canvas,seconds){const s=stateAt(seconds),c=canvas.getContext('2d');c.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);c.globalAlpha=1;c.fillStyle=bg;c.fillRect(0,0,800,600);
  if(!world)world=document.createElement('canvas');if(world.width!==800||world.height!==600){world.width=800;world.height=600;}const w=world.getContext('2d');w.setTransform(1,0,0,1,0,0);w.globalAlpha=1;w.globalCompositeOperation='source-over';w.clearRect(0,0,800,600);w.lineJoin='round';w.lineCap='round';
  const reset=s.phase==='rebuild';
  walls.forEach((ps,i)=>{const a=reset?ease((s.t-resetAt-i*.005)/1.5):1;trace(w,ps,a,'#334bff',10);trace(w,ps,a,bg,5);});
  s.pellets.forEach(p=>{if(!p.eaten)disc(w,p.x,p.y,2.8*(reset?ease((s.t-resetAt-1.4)/.6):1),'#fff1b4');});
  if(s.small.visible)pac(w,s.small,s.small.angle,s.small.mouth);
  if(!reset&&s.t>=chaseAt){w.globalCompositeOperation='destination-out';w.fillStyle='#000000';w.beginPath();w.moveTo(-2000,0);for(let i=0;i<s.edges.length;i++)w.lineTo(s.edges[i],i*2);w.lineTo(-2000,600);w.closePath();w.fill();w.globalCompositeOperation='source-over';}
  c.drawImage(world,0,0);
  if(s.giant.visible){pac(c,s.giant,0,s.giant.mouth);}
  return s;
 }
 window.PacmanAttract={draw,stateAt,duration,still,titleAt,title:letters,words,walls,pellets,giantRadius,feedEnd,lookAt,runAt,chaseAt,giantEnd,resetAt,enterAt,feedSpeed,runSpeed,dotY,sweep,distanceToSegment};
})();
