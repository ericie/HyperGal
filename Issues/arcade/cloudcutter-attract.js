// The title is cloud material: a blue can wounds it, then the same clouds heal.
(() => {
 'use strict';const K=window.ArcadeFilmKit,{clamp,mix,ease,mod,hash,rect,poly,line,disc}=K;
 const duration=19.8,still=2.2,titleAt=0,flightAt=3,flightEnd=9.4,healAt=10.4,healedAt=17.2;
 const sky='#48a7f5',words=['CLOUD','CUTTER'],unit=17,verticalUnit=23.5,advance=131,canScale=.8,muzzle=106*canScale,bodyRadius=38*canScale;
 const glyphs={
  C:[[[4,.5],[3.2,0],[1,0],[0,1],[0,5],[1,6],[3.2,6],[4,5.5]]],
  L:[[[0,0],[0,6],[4,6]]],
  O:[[[1,0],[3,0],[4,1],[4,5],[3,6],[1,6],[0,5],[0,1],[1,0]]],
  U:[[[0,0],[0,5],[1,6],[3,6],[4,5],[4,0]]],
  D:[[[0,6],[0,0],[2.8,0],[4,1.3],[4,4.7],[2.8,6],[0,6]]],
  T:[[[0,0],[4,0]],[[2,0],[2,6]]],
  E:[[[4,0],[0,0],[0,6],[4,6]],[[0,3],[3.4,3]]],
  R:[[[0,6],[0,0],[3,0],[4,1],[4,2],[3,3],[0,3]],[[2,3],[4,6]]]
 };
 const letters=[],lobes=[];
 words.forEach((word,row)=>{const start=(800-((word.length-1)*advance+4*unit))/2,y=78+row*272;
  [...word].forEach((char,index)=>{const strokes=glyphs[char].map(ps=>ps.map(([x,yy])=>[start+index*advance+x*unit,y+yy*verticalUnit]));const letter={char,row,index,strokes};letters.push(letter);
   for(const ps of strokes)for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(length/25);
    for(let j=0;j<=n;j++){const id=lobes.length,p=j/n;lobes.push({x:mix(a[0],b[0],p)+(hash(id+71)-.5)*4,y:mix(a[1],b[1],p)+(hash(id+217)-.5)*4,r:25.5+hash(id+row*901)*5,row,index,id});}
   }
  });
 });
 const buckets=new Map();for(const l of lobes){for(let y=Math.floor((l.y-l.r)/48);y<=Math.floor((l.y+l.r)/48);y++)for(let x=Math.floor((l.x-l.r)/48);x<=Math.floor((l.x+l.r)/48);x++){const key=x+':'+y;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(l);}}
 function pristineAt(x,y){return (buckets.get(Math.floor(x/48)+':'+Math.floor(y/48))||[]).some(l=>(l.x-x)**2+(l.y-y)**2<=l.r*l.r);}
 function flightY(x){return 310-112*Math.cos(clamp(x/800)*Math.PI);}
 function canAt(t){const x=mix(-220,1060,clamp((t-flightAt)/(flightEnd-flightAt))),u=clamp(x/800),angle=Math.atan(112*Math.PI/800*Math.sin(u*Math.PI));return {x,y:flightY(x),angle,visible:t>=flightAt&&t<flightEnd};}
 const shots=[];
 function distanceToSegment(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,p=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1));return Math.hypot(x-ax-p*dx,y-ay-p*dy);}
 function hullCuts(x,y,t,radius=bodyRadius){const can=canAt(t),end=can.x+80*canScale;if(t<flightAt)return false;
  return x<=end?Math.abs(y-flightY(x))<=radius:Math.hypot(x-end,y-flightY(end))<=radius;
 }
 function cutAt(x,y,t,beforeId=Infinity){
  if(hullCuts(x,y,t))return true;
  return shots.some(s=>s.id<beforeId&&s.hit&&s.impactAt<=t&&distanceToSegment(x,y,s.x,s.y,s.hit.x,s.hit.y)<s.radius);
 }
 // One centered gun; the next shot waits until the preceding round hits or leaves.
 let nextShot=3.25;
 while(nextShot<flightEnd-.3){
  const at=nextShot,can=canAt(at),angle=can.angle,cos=Math.cos(angle),sin=Math.sin(angle),x=can.x+muzzle*cos,y=can.y+muzzle*sin;
  let hit=null,distance=Math.min(920,Math.max(0,(824-x)/cos));
  for(let d=0;d<=distance;d+=3){const xx=x+cos*d,yy=y+sin*d,time=at+d/760;
   if(pristineAt(xx,yy)&&!cutAt(xx,yy,time)){hit={x:xx,y:yy};distance=d;break;}
  }
  const impactAt=at+distance/760;
  shots.push({id:shots.length,at,x,y,angle,speed:760,distance,hit,impactAt,radius:32+hash(shots.length+419)*6});
  nextShot=Math.max(at+.22,impactAt+.08);
 }
 function healing(t){return 1-ease((t-healAt)/(healedAt-healAt));}
 function visibleAt(x,y,t){const heal=healing(t);if(!pristineAt(x,y))return false;if(heal===0)return true;if(hullCuts(x,y,t,bodyRadius*heal))return false;
  return !shots.some(s=>s.hit&&s.impactAt<=t&&distanceToSegment(x,y,s.x,s.y,s.hit.x,s.hit.y)<s.radius*heal);
 }
 function stateAt(seconds){const t=mod(seconds,duration),heal=healing(t),can=canAt(t);
  return {t,can,heal,hullEnd:t>=flightAt?can.x+80*canScale:-250,
   wounds:shots.filter(s=>s.hit&&t>=s.impactAt&&heal>0).map(s=>({id:s.id,x:s.hit.x,y:s.hit.y,radius:s.radius*heal,fromX:s.x,fromY:s.y,impactAt:s.impactAt})),
   bullets:shots.filter(s=>t>=s.at&&t<s.impactAt).map(s=>({...s,x:s.x+Math.cos(s.angle)*(t-s.at)*s.speed,y:s.y+Math.sin(s.angle)*(t-s.at)*s.speed})),
   impacts:shots.filter(s=>s.hit&&t>=s.impactAt&&t<s.impactAt+.55).map(s=>({...s,age:t-s.impactAt})),
   phase:t<flightAt?'cloud-title':t<flightEnd?'firing-pass':t<healAt?'wounded':t<healedAt?'healing':'restored'};
 }
 let pristine,layer;
 function makeClouds(){
  pristine=document.createElement('canvas');pristine.width=800;pristine.height=600;const c=pristine.getContext('2d');c.clearRect(0,0,800,600);
  for(const l of lobes)disc(c,l.x,l.y,l.r,'#bfe2fa');
  c.globalCompositeOperation='source-atop';
  for(const l of lobes)disc(c,l.x,l.y-2,l.r*.96,'#deefff');
  for(const l of lobes)disc(c,l.x-1,l.y-6,l.r*.80,'#f7fbff');
  c.globalCompositeOperation='source-over';
  layer=document.createElement('canvas');layer.width=800;layer.height=600;
 }
 function blueCan(c,can,t){const {x,y,angle}=can;c.save();c.translate(x,y);c.rotate(angle);c.scale(canScale,canScale);
  poly(c,[[-82,-20],[-142-8*Math.sin(t*49),-7],[-122,0],[-148-5*Math.cos(t*42),9],[-82,21]],'#ffe23b');
  poly(c,[[-84,-11],[-124,0],[-84,11]],'#fff6b0');
  rect(c,-78,-33,156,66,'#0047ff');rect(c,-73,12,145,18,'#0035c8');rect(c,-69,-28,136,6,'#3f8aff');rect(c,-67,-18,130,3,'#2d70ff');
  c.fillStyle='#0031af';c.beginPath();c.ellipse(-78,0,13,33,0,0,Math.PI*2);c.fill();
  c.fillStyle='#82b9ff';c.beginPath();c.ellipse(78,0,15,33,0,0,Math.PI*2);c.fill();c.fillStyle='#1765ef';c.beginPath();c.ellipse(80,0,10,26,0,0,Math.PI*2);c.fill();
  rect(c,85,-4,20,8,'#002fba');rect(c,99,-3,6,6,'#b8deff');
  for(const shot of shots)if(t>=shot.at&&t<shot.at+.045){poly(c,[[106,-3],[124,-8],[118,0],[128,5],[106,3]],'#fff3a3');}
  c.restore();
 }
 function draw(canvas,seconds){const s=stateAt(seconds),c=canvas.getContext('2d');c.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);c.globalAlpha=1;c.fillStyle=sky;c.fillRect(0,0,800,600);if(!pristine)makeClouds();
  const l=layer.getContext('2d');l.setTransform(1,0,0,1,0,0);l.globalAlpha=1;l.globalCompositeOperation='source-over';l.clearRect(0,0,800,600);l.drawImage(pristine,0,0);
  l.globalCompositeOperation='destination-out';
  if(s.t>=flightAt&&s.heal>0){l.lineCap='round';l.lineJoin='round';const ps=[];for(let x=-240;x<s.hullEnd;x+=8)ps.push([x,flightY(x)]);ps.push([s.hullEnd,flightY(s.hullEnd)]);line(l,ps,'#000000',bodyRadius*2*s.heal);}
  for(const w of s.wounds){line(l,[[w.fromX,w.fromY],[w.x,w.y]],'#000000',w.radius*2);disc(l,w.x,w.y,w.radius,'#000000');}l.globalCompositeOperation='source-over';c.drawImage(layer,0,0);
  for(const p of s.impacts){for(let i=0;i<7;i++){const a=i*2.399+p.id*.8,r=15+p.age*(65+hash(i+p.id)*50),x=p.hit.x+Math.cos(a)*r,y=p.hit.y+Math.sin(a)*r+p.age*p.age*55;c.globalAlpha=1-p.age/.55;disc(c,x,y,(4+hash(i+188)*5)*(1-p.age/.55),'#f7fbff');}}
  c.globalAlpha=1;
  for(const b of s.bullets){line(c,[[b.x-Math.cos(b.angle)*18,b.y-Math.sin(b.angle)*18],[b.x,b.y]],'#1749a9',3);line(c,[[b.x-Math.cos(b.angle)*10,b.y-Math.sin(b.angle)*10],[b.x,b.y]],'#fff3ac',1.5);}
  if(s.can.visible)blueCan(c,s.can,s.t);
  return s;
 }
 window.CloudcutterAttract={draw,stateAt,duration,still,titleAt,title:letters,words,lobes,shots,pristineAt,flightY,canAt,healing,flightAt,flightEnd,healAt,healedAt,bodyRadius,canScale,muzzle,verticalUnit,distanceToSegment,hullCuts,cutAt,visibleAt};
})();
