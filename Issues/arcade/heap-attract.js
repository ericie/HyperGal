// A fixed close-up of six summit blocks, their flag, and the sun defending them.
(() => {
 'use strict';const K=window.ArcadeFilmKit,{clamp,mix,ease,mod,poly,line,disc}=K;
 const duration=10,still=2.7,titleAt=0,title=[],bg='#140d32',halfW=100,halfH=36,sideH=72;
 const nodePoint=p=>({x:400+(p.col*2-p.r)*halfW,y:230+p.r*(halfH+sideH)});
 const board=Array.from({length:3},(_,r)=>Array.from({length:r+1},(_,col)=>({r,col,...nodePoint({r,col})}))).flat();
 const flag={x:446,baseY:230,pole:172,width:232,height:106};
 const attacks=[{id:0,side:-1,spawn:.8,enter:1.5,climb:2.3,hit:2.95,bottom:{r:2,col:0},upper:{r:1,col:0}},{id:1,side:1,spawn:4.6,enter:5.3,climb:6.1,hit:6.75,bottom:{r:2,col:2},upper:{r:1,col:1}}];
 const sunRoute=[{at:0,r:0,col:0},{at:2.4,r:0,col:0},{at:2.95,r:1,col:0},{at:3.45,r:2,col:0},{at:3.95,r:1,col:0},{at:4.45,r:0,col:0},{at:6.2,r:0,col:0},{at:6.75,r:1,col:1},{at:7.25,r:2,col:2},{at:7.75,r:1,col:1},{at:8.25,r:0,col:0},{at:10,r:0,col:0}];
 function hop(a,b,p,height){p=clamp(p);return {x:mix(a.x,b.x,p),groundY:mix(a.y,b.y,p),lift:Math.sin(p*Math.PI)*height,p};}
 function sunAt(t){const i=Math.max(0,sunRoute.findIndex((p,j)=>j<sunRoute.length-1&&t>=p.at&&t<sunRoute[j+1].at)),a=sunRoute[i],b=sunRoute[i+1],moving=a.r!==b.r||a.col!==b.col,p=clamp((t-a.at)/(b.at-a.at)),pos=hop(nodePoint(a),nodePoint(b),p,moving?62:0);return {...pos,y:pos.groundY-47-pos.lift,radius:42,moving,from:{r:a.r,col:a.col},to:{r:b.r,col:b.col},landAt:b.at};}
 function blobAt(a,t){if(t<a.spawn||t>=a.hit+.36)return null;const bottom=nodePoint(a.bottom),upper=nodePoint(a.upper);let pos;
  if(t<a.enter)pos=hop({x:400+a.side*335,y:660},bottom,(t-a.spawn)/(a.enter-a.spawn),55);
  else if(t<a.climb)pos=hop(bottom,upper,(t-a.enter)/(a.climb-a.enter),48);
  else pos={x:upper.x,groundY:upper.y,lift:0,p:1};
  const squash=t>=a.hit?clamp((t-a.hit)/.22):0;return {id:a.id,...pos,y:pos.groundY-18-pos.lift,squash,alpha:1-clamp((t-a.hit-.12)/.24),alive:t<a.hit};
 }
 function stateAt(seconds){const t=mod(seconds,duration),claims=new Map(board.map(b=>[b.r+':'+b.col,'yellow']));
  for(const a of attacks){if(t>=a.enter&&t<(a.id?7.25:3.45))claims.set(a.bottom.r+':'+a.bottom.col,'blue');if(t>=a.climb&&t<a.hit)claims.set(a.upper.r+':'+a.upper.col,'blue');}
  return {t,claims,sun:sunAt(t),blobs:attacks.map(a=>blobAt(a,t)).filter(Boolean),impacts:attacks.filter(a=>t>=a.hit&&t<a.hit+.5).map(a=>({...nodePoint(a.upper),id:a.id,age:t-a.hit})),phase:'summit-defense'};
 }
 function cube(c,b,owner){const {x,y}=b,colors=owner==='blue'?['#3e8ef4','#174c9a','#246ac2']:['#f7dd35','#a28a12','#d0b21c'];
  poly(c,[[x-halfW,y],[x,y+halfH],[x,y+halfH+sideH],[x-halfW,y+sideH]],colors[1]);poly(c,[[x+halfW,y],[x,y+halfH],[x,y+halfH+sideH],[x+halfW,y+sideH]],colors[2]);poly(c,[[x,y-halfH],[x+halfW,y],[x,y+halfH],[x-halfW,y]],colors[0]);
  line(c,[[x,y-halfH],[x+halfW,y],[x,y+halfH],[x-halfW,y],[x,y-halfH]],'#21162e',2);line(c,[[x,y+halfH],[x,y+halfH+sideH]],'#21162e',2);
 }
 function drawFlag(c,t){const f=flag,y=f.baseY-f.pole,flutter=Math.sin(t*Math.PI*2/5)*7;line(c,[[f.x,f.baseY],[f.x,y-3]],'#d4c5f5',5);c.fillStyle='#fff15b';c.beginPath();c.moveTo(f.x+2,y);c.bezierCurveTo(f.x+f.width*.4,y-13,f.x+f.width*.65,y+17+flutter,f.x+f.width,y+flutter);c.lineTo(f.x+f.width,y+f.height+flutter);c.bezierCurveTo(f.x+f.width*.65,y+f.height+17+flutter,f.x+f.width*.4,y+f.height-13,f.x+2,y+f.height);c.closePath();c.fill();}
 function shadow(c,p,size){c.fillStyle='#0a071e';c.beginPath();c.ellipse(p.x,p.groundY+8,size*(1-p.lift/200),size*.19,0,0,Math.PI*2);c.fill();}
 function drawSun(c,s,t){shadow(c,s,42);c.save();c.translate(s.x,s.y);const landing=s.moving?Math.abs(Math.cos(s.p*Math.PI))**8:0;c.scale(1+landing*.12,1-landing*.1);const rays=Array.from({length:24},(_,i)=>{const a=i*Math.PI/12-Math.PI/2+Math.sin(t*Math.PI*2/5)*.035,r=i%2?40:59;return [Math.cos(a)*r,Math.sin(a)*r];});poly(c,rays,'#ffd34e');disc(c,0,0,42,'#ff9c3d');disc(c,-2,-4,39,'#fff15b');
  const gaze=s.to.col<s.from.col||s.to.r>s.from.r&&s.to.col===0?-2:2;for(const x of [-13,13]){c.fillStyle='#fffdf2';c.beginPath();c.ellipse(x,-8,8,11,0,0,Math.PI*2);c.fill();disc(c,x+gaze,-6,3.8,'#120b2c');}c.strokeStyle='#120b2c';c.lineWidth=3.6;c.lineCap='round';c.beginPath();c.arc(0,10,11,.15*Math.PI,.85*Math.PI);c.stroke();c.restore();}
 function drawBlob(c,b){shadow(c,b,23);c.save();c.globalAlpha=b.alpha;c.translate(b.x,b.groundY-18-b.lift+b.squash*18);c.scale(1+b.squash*.9,1-b.squash*.86);const size=29;c.fillStyle='#4898ff';c.beginPath();c.moveTo(size*.16,-size*1.6);c.bezierCurveTo(size*.04,-size*.94,-size*.85,-size*.58,-size*.76,-size*.06);c.bezierCurveTo(-size*.72,size*.64,size*.64,size*.71,size*.76,size*.04);c.bezierCurveTo(size*.89,-size*.54,size*.31,-size*.8,size*.16,-size*1.6);c.closePath();c.fill();c.restore();}
 function draw(canvas,seconds){const s=stateAt(seconds),c=canvas.getContext('2d');c.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);c.globalAlpha=1;c.fillStyle=bg;c.fillRect(0,0,800,600);for(const b of board)cube(c,b,s.claims.get(b.r+':'+b.col));drawFlag(c,s.t);
  const actors=[...s.blobs.map(b=>({groundY:b.groundY,draw:()=>drawBlob(c,b)})),{groundY:s.sun.groundY,draw:()=>drawSun(c,s.sun,s.t)}];actors.sort((a,b)=>a.groundY-b.groundY).forEach(a=>a.draw());
  for(const p of s.impacts){c.globalAlpha=1-p.age/.5;for(let i=0;i<7;i++){const a=i*Math.PI*2/7,r=12+p.age*90;disc(c,p.x+Math.cos(a)*r,p.y-10+Math.sin(a)*r*.5,4*(1-p.age/.5),'#94caff');}}c.globalAlpha=1;return s;
 }
 window.HeapAttract={draw,stateAt,duration,still,titleAt,title,board,flag,attacks,sunRoute,nodePoint,sunAt,blobAt,halfW,halfH,sideH};
})();
