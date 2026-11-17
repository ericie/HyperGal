// Whole spinning glyphs slam together, then squash into the paddle.
(() => {
 'use strict';const K=window.ArcadeFilmKit,{clamp,mix,ease,mod,line,rect,cells}=K;
 const duration=20,still=.8,titleAt=0,spinAt=1.4,spinEnd=5,crashAt=5.48,mergeEnd=6.05,rallyAt=7,rallyEnd=16,unfoldAt=16.7,unfoldEnd=18.2;
 const title=cells(['PADDLE'],18,0),columns=5,rows=Math.ceil(title.length/columns),paddleWidth=32,paddleHeight=rows*7;
 const cylinder={x:400,y:300,radius:330,depth:52,halfHeight:63};
 const sourceLimits={paddleWidth:16,paddleHeight:140,ballSpeed:560};
 const ballSpecs=[920,1120,1320].map((speed,id)=>({id,speed,radius:6,period:(800-paddleWidth-12)/speed,first:7.55+id*.23,side:id%2?-1:1}));
 const fold=(n,lo=58,hi=542)=>{const w=hi-lo,u=mod(n-lo,w*2);return lo+(u<w?u:2*w-u);};
 function paddleY(t){if(t<rallyAt)return 300;const raw=300+120*Math.sin((t-rallyAt)*1.65)*ease((t-rallyAt)/1.2);if(t<=rallyEnd)return raw;const end=300+120*Math.sin((rallyEnd-rallyAt)*1.65);return mix(end,300,ease((t-rallyEnd)/.7));}
 function impact(spec,n){const at=spec.first+n*spec.period,side=spec.side*(n%2?-1:1),offset=((spec.id+n)%2?-1:1)*(42+(n%3)*9);return {at,side,x:400+side*(paddleWidth/2+spec.radius),y:paddleY(at)+offset,paddleY:paddleY(at),offset};}
 function ballAt(spec,t){
  const spawn=spec.first-400/spec.speed;if(t<spawn||t>rallyEnd+.2)return null;
  if(t<spec.first){const hit=impact(spec,0),age=t-hit.at;return {id:spec.id,speed:spec.speed,radius:spec.radius,x:hit.x-hit.side*spec.speed*age,y:fold(hit.y+(spec.id-1)*240*age),lap:-1,direction:-hit.side};}
  const lap=Math.floor((t-spec.first)/spec.period+1e-9),from=impact(spec,lap),to=impact(spec,lap+1),p=clamp((t-from.at)/spec.period);
  const rawY=lap%3===1?1084-to.y:lap%3===2?116-to.y:to.y;
  return {id:spec.id,speed:spec.speed,radius:spec.radius,x:mod(from.x+from.side*spec.speed*(t-from.at),800),y:fold(mix(from.y,rawY,p)),lap,direction:from.side};
 }
 function rotation(t){const p=ease((t-spinAt)/(spinEnd-spinAt));return p===1?0:p*Math.PI*2;}
 function mergeAt(t){return ease((t-spinEnd)/(mergeEnd-spinEnd))*(1-ease((t-unfoldAt)/(unfoldEnd-unfoldAt)));}
 function project(u,v,angle){const theta=u/315*1.14+angle;return {x:400+330*Math.sin(theta),y:300+v+52*Math.cos(theta),z:Math.cos(theta)};}
 function formationAt(t){
  const at=t<unfoldAt?t:mix(mergeEnd,spinEnd,ease((t-unfoldAt)/(unfoldEnd-unfoldAt))),crash=clamp((at-spinEnd)/(crashAt-spinEnd))**2,squash=clamp((at-crashAt)/(mergeEnd-crashAt)),pressure=ease(squash);
  return {at,crash,squash,pressure,width:mix(90,paddleWidth,pressure)-18*Math.sin(squash*Math.PI),height:mix(126,paddleHeight,pressure)+28*Math.sin(squash*Math.PI),wire:1-ease((at-spinEnd)/(crashAt-spinEnd))};
 }
 function tilesAt(t){const angle=rotation(t),f=formationAt(t),py=paddleY(t);
  return title.map((cell,id)=>{const u=cell.x-400,v=cell.y-63,corners=[[u,v],[u+cell.size,v],[u+cell.size,v+cell.size],[u,v+cell.size]],glyphLeft=85+cell.index*108,localX=cell.x-glyphLeft-45,inflate=9*f.pressure;
   const left=Math.max(-45,localX-inflate),right=Math.min(45,localX+cell.size+inflate),top=cell.y-63,bottom=top+cell.size;
   const target=[[left,top],[right,top],[right,bottom],[left,bottom]].map(([x,y])=>[400+x*f.width/90,py+y*f.height/126]);
   const surface=corners.map(([u,v])=>project(u,v,angle));
   return {id,char:cell.char,index:cell.index,z:mix(project(u+9,v+9,angle).z,1,f.crash),points:surface.map((p,i)=>[mix(p.x,target[i][0],f.crash),mix(p.y,target[i][1],f.crash)])};
  });
 }
 function stateAt(seconds){const t=mod(seconds,duration),merge=mergeAt(t),balls=ballSpecs.map(b=>ballAt(b,t)).filter(Boolean);return {t,formation:formationAt(t),rotation:rotation(t),merge,tiles:tilesAt(t),paddle:{x:400,y:paddleY(t),width:paddleWidth,height:paddleHeight},balls,ballAlpha:1-ease((t-15.8)/.4),
  phase:t<spinAt?'cylinder-title':t<spinEnd?'spin':t<crashAt?'crash':t<mergeEnd?'squash':t<rallyEnd+.2?'fast-rally':t<unfoldAt?'recenter':t<unfoldEnd?'unfold':'cylinder-title'};}
 function wire(c,t,opacity){if(opacity<=0)return;c.globalAlpha=opacity;
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2+rotation(t),x=400+330*Math.sin(a),dy=52*Math.cos(a);line(c,[[x,300-cylinder.halfHeight+dy],[x,300+cylinder.halfHeight+dy]],Math.cos(a)<0?'#292929':'#666666',1);}
  for(const y of [300-cylinder.halfHeight,300+cylinder.halfHeight]){c.beginPath();c.ellipse(400,y,330,52,0,0,Math.PI*2);c.strokeStyle='#9d9d9d';c.lineWidth=1.6;c.stroke();}c.globalAlpha=1;
 }
 function fillTiles(c,tiles,front){c.beginPath();let any=false;for(const tile of tiles){if((tile.z>=0)!==front)continue;any=true;tile.points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();}if(any){c.fillStyle=front?'#ffffff':'#333333';c.fill();}}
 function draw(canvas,seconds){const s=stateAt(seconds),c=canvas.getContext('2d');c.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);c.globalAlpha=1;c.fillStyle='#000000';c.fillRect(0,0,800,600);
  wire(c,s.t,s.formation.wire);fillTiles(c,s.tiles,false);fillTiles(c,s.tiles,true);
  c.globalAlpha=s.merge*.7;line(c,[[0,52],[800,52]],'#cfcfcf',1.5);line(c,[[0,548],[800,548]],'#cfcfcf',1.5);c.globalAlpha=1;
  for(const b of s.balls){const spec=ballSpecs[b.id];for(let i=13;i>=1;i--){const past=ballAt(spec,s.t-i*.0055);if(!past)continue;c.globalAlpha=(1-i/14)*.18*s.ballAlpha;for(const dx of [-800,0,800])if(past.x+dx>-7&&past.x+dx<807)rect(c,past.x+dx-4,past.y-4,8,8,'#ffffff');}
   c.globalAlpha=s.ballAlpha;for(const dx of [-800,0,800])if(b.x+dx>-7&&b.x+dx<807)rect(c,b.x+dx-6,b.y-6,12,12,'#ffffff');
   const n=Math.round((s.t-spec.first)/spec.period),hit=impact(spec,n),age=s.t-hit.at;if(n>=0&&age>=0&&age<.065){c.globalAlpha=(1-age/.065)*s.ballAlpha;rect(c,hit.x-hit.side*7-1,hit.y-12,2,24,'#ffffff');}
  }
  c.globalAlpha=1;return s;
 }
 window.PaddleAttract={draw,stateAt,duration,still,titleAt,title,ballAt,ballSpecs,impact,paddleY,tilesAt,project,rotation,mergeAt,formationAt,cylinder,sourceLimits,spinAt,spinEnd,crashAt,mergeEnd,rallyAt,rallyEnd,unfoldAt,unfoldEnd};
})();
