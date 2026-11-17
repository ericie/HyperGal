// The yellow car finds daylight in gray traffic, then passes under its title.
(() => {
 'use strict';const K=window.ArcadeFilmKit,{mix,ease,mod,hash,begin,rect,poly,line,cells}=K;
 const duration=21,still=17,titleAt=12.3,lanes=[240,320,400,480,560];
 function heroAt(t){let lane=2;if(t>3)lane=mix(2,3,ease((t-3)/.9));if(t>6.6)lane=mix(3,2,ease((t-6.6)/.9));if(t>9.2)lane=mix(2,1,ease((t-9.2)/.9));return {x:lanes[0]+lane*80,y:430,lane,signal:t>2.5&&t<3.9||t>6.1&&t<7.5||t>8.7&&t<10.1};}
 const traffic=[];
 for(let i=0;i<65&&traffic.length<17;i++){
  const v={lane:i%5,start:hash(i+83)*1100,speed:54+(i%5)*4,truck:i%6===0};let safe=true;
  for(let t=0;t<duration;t+=.04){const h=heroAt(t),y=mod(v.start+t*v.speed,1100)-220;if(Math.abs(lanes[v.lane]-h.x)<45&&Math.abs(y-h.y)<(v.truck?102:72)){safe=false;break;}}
  if(safe&&!traffic.some(a=>a.lane===v.lane&&Math.min(Math.abs(a.start-v.start),1100-Math.abs(a.start-v.start))<165))traffic.push(v);
 }
 const title=cells(['HAPPINESS','HUNTER'],11,161,3);
 function stateAt(seconds){const t=mod(seconds,duration);return {t,hero:heroAt(t),traffic:traffic.map(v=>({...v,x:lanes[v.lane],y:mod(v.start+t*v.speed,1100)-220})),sign:ease((t-titleAt)/1.25),phase:t<3?'close-car':t<titleAt?'overtake':'title'};}
 function car(c,x,y,hero=false,truck=false){
  const color=hero?'#ffd52b':'#89939c',h=truck?106:62,w=truck?37:31;
  rect(c,x-w/2-4,y-h/2+10,5,12,'#090d13');rect(c,x+w/2-1,y-h/2+10,5,12,'#090d13');rect(c,x-w/2-4,y+h/2-22,5,12,'#090d13');rect(c,x+w/2-1,y+h/2-22,5,12,'#090d13');
  rect(c,x-w/2+3,y-h/2+4,w,h,'#111820');rect(c,x-w/2,y-h/2,w,h,color);
  rect(c,x-w/2+3,y-h/2+5,w-6,12,'#1e2c3e');rect(c,x-w/2+5,y+h/2-13,w-10,7,'#1e2c3e');
  rect(c,x-w/2+4,y-h/2+4,w-8,2,'#e0e6e5');rect(c,x-w/2+3,y-h/2,6,3,'#fff5bb');rect(c,x+w/2-9,y-h/2,6,3,'#fff5bb');
  if(truck){rect(c,x-w/2+2,y-h/2+24,w-4,h-28,'#b6bec4');for(let yy=y-h/2+30;yy<y+h/2-5;yy+=9)rect(c,x-w/2+4,yy,w-8,1,'#7b858e');}
  else rect(c,x-w/2+4,y-h/2+21,w-8,h-38,hero?'#ffe96b':'#b5bec6');
 }
 function draw(canvas,seconds){const {c,t,alpha}=begin(canvas,seconds,duration,'#173d2b'),s=stateAt(t),z=mix(3.7,1,ease(t/3));
  c.save();c.translate(400,385);c.scale(z,z);c.translate(-s.hero.x,-430);
  for(let y=-200;y<900;y+=110){const yy=y+mod(t*110,110);rect(c,0,yy,800,55,'#204a31');for(let x=10;x<800;x+=28)line(c,[[x,yy],[x,yy+100]],'#2c5234');}
  rect(c,192,-300,416,1300,'#1a2029');
  for(const x of [194,604])rect(c,x,-300,3,1300,'#eee9cc');
  for(let i=1;i<5;i++)for(let y=-140;y<900;y+=78)rect(c,200+i*80-2,y+mod(t*148,78),3,38,'#dadfdc');
  s.traffic.sort((a,b)=>a.y-b.y).forEach(v=>car(c,v.x,v.y,false,v.truck));car(c,s.hero.x,s.hero.y,true);
  if(s.hero.signal&&Math.floor(t*6)%2)rect(c,s.hero.x+(s.hero.lane>2?14:-18),s.hero.y-25,5,6,'#ff970f');
  c.restore();
  if(s.sign>0){const dy=-440*(1-s.sign);c.save();c.translate(0,dy);
   line(c,[[80,600],[80,117],[720,117],[720,600]],'#7f9990',8);rect(c,48,131,704,260,'#091c17');rect(c,54,137,692,248,'#eceacf');rect(c,59,142,682,238,'#1d5e3c');
   title.forEach(p=>rect(c,p.x,p.y,p.size,p.size,p.row?'#ffd52b':'#fffbe6'));c.restore();
  }
  c.globalAlpha=alpha;c.restore();return s;
 }
 window.HappinessAttract={draw,stateAt,duration,still,titleAt,title,traffic,heroAt};
})();
