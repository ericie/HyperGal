// A crack leads to a name cut out of masonry; a Tetris clears its support.
(() => {
 'use strict';const K=window.ArcadeFilmKit,{clamp,mix,ease,mod,hash,rect,cells}=K;
 const duration=22.2,still=6.5,titleAt=5.2,bg='#090b10',cell=4,face=3.6,closeZoom=5,width=1024,height=1792,cols=width/cell,rows=height/cell;
 const colors=['#76c9cd','#d6bb6a','#af93d4','#83b995','#cf7d8a','#7598cf','#cf9b74'];
 const panAt=1,panEnd=5.2,focusAt=8.2,focusEnd=9,faultAt=13.25,pullAt=14.2,pullEnd=15.4,fallAt=14.2,fallEnd=17.2,resetAt=17.8,resetEnd=20.2;
 const words=['BITSY','BLOCKS'],title=cells(words,4,140,2),wallTitle=title.map(p=>({...p,x:Math.round((p.x+112)/4)*4,y:p.y+400}));
 const anchors=[[640,544],[704,544],[800,544],[880,500],[960,524],[1056,468],[1152,516],[1248,480],[1344,548],[1440,500],[1536,560],[1632,516],[1792,540]];
 function crackX(y){const i=Math.max(0,Math.min(anchors.length-2,anchors.findIndex((a,j)=>j<anchors.length-1&&y>=a[0]&&y<=anchors[j+1][0]))),a=anchors[i],b=anchors[i+1];if(y<=640)return 544;if(y>=1792)return 540;return Math.round(mix(a[1],b[1],(y-a[0])/(b[0]-a[0]))/4)*4;}
 const well={x:504,y:704,cols:20,rows:24};
 const grid=new Uint8Array(cols*rows),voids=new Uint8Array(cols*rows);
 // One packed 4x4 group consists of four legal tetrominoes; rotated groups vary the wall.
 const pattern=[[0,0,0,1],[2,0,3,1],[2,2,3,1],[2,3,3,1]];
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const gx=Math.floor(c/4),gy=Math.floor(r/4),seed=Math.floor(hash(gx+gy*64)*700),turn=seed%4;let x=c%4,y=r%4;for(let n=0;n<turn;n++)[x,y]=[3-y,x];grid[r*cols+c]=1+(seed+pattern[y][x]*2)%7;}
 for(const p of wallTitle)for(let r=p.y/cell;r<(p.y+p.size)/cell;r++)for(let c=p.x/cell;c<(p.x+p.size)/cell;c++)voids[r*cols+c]=1;
 for(let r=151;r<rows;r++){const y=r*4+2,x=crackX(y),half=y<704?12:4+((r>>4)%3===0?2:0);for(let c=0;c<cols;c++)if(Math.abs(c*4+2-x)<=half)voids[r*cols+c]=1;}
 for(let r=well.y/4;r<(well.y+well.rows*4)/4;r++)for(let c=well.x/4;c<(well.x+well.cols*4)/4;c++)voids[r*cols+c]=1;
 for(let i=0;i<grid.length;i++)if(voids[i])grid[i]=0;
 let board=Array.from({length:24},()=>Array(20).fill(0));for(let y=20;y<24;y++)for(let x=0;x<20;x++)if(x!==9)board[y][x]=1+(x+y)%7;
 const shapes=[[[0,0],[1,0],[2,0],[1,1]],[[0,0],[1,0],[0,1],[1,1]],[[0,0],[0,1],[0,2],[0,3]]],events=[];
 for(let id=0;id<3;id++){const shape=shapes[id],target=[3,15,9][id],spawn=[9.2,10.4,11.6][id],land=[10.2,11.45,12.9][id];let y=0;const fits=row=>shape.every(([x,dy])=>row+dy<24&&!board[row+dy][target+x]);while(fits(y+1))y++;
  const before=board.map(r=>r.slice());shape.forEach(([x,dy])=>board[y+dy][target+x]=id+1);const full=board.map((r,y)=>r.every(Boolean)?y:-1).filter(y=>y>=0),locked=board.map(r=>r.slice());board=board.filter((_,y)=>!full.includes(y));while(board.length<24)board.unshift(Array(20).fill(0));events.push({id,shape,target,row:y,spawn,land,clear:land+(full.length?.35:.1),full,before,locked,after:board.map(r=>r.slice())});
 }
 function cameraAt(t){const pan=ease((t-panAt)/(panEnd-panAt)),cy=mix(1420,572,pan),follow=crackX(cy),titleX=mix(follow,512,ease((pan-.65)/.35));let cx=titleX,y=cy,zoom=closeZoom;
  if(t>=focusAt){const p=ease((t-focusAt)/(focusEnd-focusAt));cx=mix(512,544,p);y=mix(572,752,p);}
  if(t>=pullAt){const p=ease((t-pullAt)/(pullEnd-pullAt));cx=mix(544,512,p);y=mix(752,572,p);zoom=mix(closeZoom,1,p);}
  if(t>=fallEnd){const p=ease((t-fallEnd)/(resetAt-fallEnd));cx=mix(512,crackX(1420),p);y=mix(572,1420,p);zoom=mix(1,closeZoom,p);}
  return {x:cx,y,zoom};
 }
 function gameAt(t){const e=events.find(e=>t<e.clear)||events.at(-1),active=t>=e.spawn&&t<e.land,p=clamp((t-e.spawn)/(e.land-e.spawn));return {board:t<e.land?e.before:t<e.clear?e.locked:e.after,active:active?{id:e.id,shape:e.shape,x:mix(9,e.target,ease((p-.16)/.46)),y:mix(-3,e.row,p)}:null,flash:t>=events[2].land&&t<events[2].clear,cleared:t>=events[2].clear};}
 const particles=[];
 function addParticle(id,x,y,color){particles.push({id,x,y,color,vx:(x-512)*.12+(hash(id+7)-.5)*46,vy:10+hash(id+31)*25,delay:(872-y)*.0006+hash(id+83)*.16});}
 for(let r=68;r<218;r++)for(let c=28;c<228;c++){const color=grid[r*cols+c];if(!color||(r>=196&&r<200))continue;addParticle(r*cols+c,c*4,r*4,color);}
 events.at(-1).after.forEach((row,y)=>row.forEach((color,x)=>{if(color)addParticle(grid.length+y*20+x,well.x+x*4,well.y+y*4,color);}));
 function particleAt(p,t){const age=Math.max(0,t-fallAt-p.delay);return {x:p.x+p.vx*age,y:p.y+p.vy*age+220*age*age};}
 function stateAt(seconds){const t=mod(seconds,duration);return {t,camera:cameraAt(t),game:gameAt(t),rebuild:ease((t-resetAt)/(resetEnd-resetAt)),phase:t<panAt?'crack':t<panEnd?'follow-crack':t<focusAt?'void-title':t<focusEnd?'approach-play':t<faultAt?'play-tetris':t<fallAt?'fault':t<fallEnd?'fall':t<resetAt?'empty':t<resetEnd?'rebuild':'crack'};}
 function drawWall(c,camera){const left=Math.max(0,Math.floor((camera.x-400/camera.zoom)/cell)),right=Math.min(cols,Math.ceil((camera.x+400/camera.zoom)/cell)),top=Math.max(0,Math.floor((camera.y-300/camera.zoom)/cell)),bottom=Math.min(rows,Math.ceil((camera.y+300/camera.zoom)/cell));
  for(let color=1;color<=7;color++){c.fillStyle=colors[color-1];for(let r=top;r<bottom;r++)for(let x=left;x<right;x++)if(grid[r*cols+x]===color)c.fillRect(x*4,r*4,face,face);}
 }
 function draw(canvas,seconds){const s=stateAt(seconds),c=canvas.getContext('2d');c.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);c.imageSmoothingEnabled=false;c.globalAlpha=1;c.fillStyle=bg;c.fillRect(0,0,800,600);
  if(s.t>=fallAt&&s.t<fallEnd){c.save();c.translate(400,300);c.scale(s.camera.zoom,s.camera.zoom);c.translate(-s.camera.x,-s.camera.y);for(let color=1;color<=7;color++){c.fillStyle=colors[color-1];for(const p of particles){if(p.color!==color)continue;const q=particleAt(p,s.t);if((q.y-s.camera.y)*s.camera.zoom<304&&(q.x-s.camera.x)*s.camera.zoom>-404&&(q.x-s.camera.x)*s.camera.zoom<404)c.fillRect(q.x,q.y,face,face);}}c.restore();return s;}
  if(s.t>=fallEnd&&s.t<resetAt)return s;
  c.save();if(s.t>=resetAt){c.beginPath();c.rect(0,600*(1-s.rebuild),800,600*s.rebuild);c.clip();}
  c.translate(400,300);c.scale(s.camera.zoom,s.camera.zoom);c.translate(-s.camera.x,-s.camera.y);drawWall(c,s.camera);
  if(s.t<fallAt){const g=s.game;
   if(g.flash||g.cleared){const y=well.y+20*4;rect(c,0,y,width,16,g.flash&&Math.floor(s.t*18)%2?'#f2f0dc':bg);}
   rect(c,well.x,well.y,80,96,bg);g.board.forEach((row,y)=>row.forEach((v,x)=>{if(v&&(!g.flash||y<20||Math.floor(s.t*18)%2))rect(c,well.x+x*4,well.y+y*4,face,face,colors[v-1]);}));
   if(g.active)for(const [x,y] of g.active.shape)rect(c,well.x+(g.active.x+x)*4,well.y+(g.active.y+y)*4,face,face,colors[g.active.id]);
  }
  c.restore();return s;
 }
 window.TetrisAttract={draw,stateAt,duration,still,titleAt,title,wallTitle,words,grid,voids,colors,cols,rows,cell,width,height,well,events,shapes,crackX,cameraAt,gameAt,particles,particleAt,face,closeZoom,panAt,panEnd,focusAt,focusEnd,faultAt,pullAt,pullEnd,fallAt,fallEnd,resetAt,resetEnd};
})();
