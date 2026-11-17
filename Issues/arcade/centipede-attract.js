// A hard-edged chain splits into two living chains and leaves a mushroom.
(() => {
 'use strict';const K=window.ArcadeFilmKit,{clamp,mix,ease,mod,hash,begin,rect,poly,line,disc,cells}=K;
 const duration=20.4,still=16,titleAt=12.2,bg='#061016',colors=['#38ff5d','#ff4fd8','#22c8ff','#ffc400'];
 const title=cells(['ONLY','CENTIPEDE'],12,174,2);
 function path(d){const row=Math.floor(d/773),u=mod(d,773),across=Math.min(690,u);return {x:row%2?745-across:55+across,y:148+row*83+Math.max(0,u-690)};}
 const hit=path(6*155-5*23);
 const mushrooms=Array.from({length:27},(_,i)=>({x:55+hash(i)*690,y:136+hash(i+700)*334,color:colors[i%4]}));
 function stateAt(seconds){const t=mod(seconds,duration),split=t>=6;
  const chain=Array.from({length:15},(_,i)=>{const p=path(t*155-i*23);return {...p,id:i,visible:!(split&&i===5),y:p.y+(split&&i>5?65*ease((t-6)/.8):0),color:colors[0]};}).filter(p=>p.visible&&p.y>90&&p.y<540);
  return {t,phase:t<3?'approach':t<6?'hunt':t<titleAt?'split':'title',split,chain,hit,mushrooms:split?[...mushrooms,{...hit,color:colors[0]}]:mushrooms,title: t>=titleAt};
 }
 function segment(c,x,y,size,color,head=false){
  poly(c,[[x-size,y-size*.48],[x-size*.6,y-size*.8],[x+size*.55,y-size*.8],[x+size,y-size*.4],[x+size,y+size*.45],[x+size*.55,y+size*.8],[x-size*.55,y+size*.8],[x-size,y+size*.4]],color);
  rect(c,x-size*.55,y-size*.6,size*1.1,2,'#ffffff');
  line(c,[[x-size*.6,y+size*.65],[x-size*.8,y+size*1.25]],color,2);line(c,[[x+size*.6,y+size*.65],[x+size*.8,y+size*1.25]],color,2);
  if(head){rect(c,x+size*.3,y-size*.35,2.5,2.5,bg);rect(c,x+size*.3,y+size*.15,2.5,2.5,bg);}
 }
 function mushroom(c,x,y,size,color){rect(c,x-size*.22,y,size*.44,size*.7,color);poly(c,[[x-size,y],[x-size*.8,y-size*.6],[x-size*.4,y-size*.85],[x+size*.4,y-size*.85],[x+size*.8,y-size*.6],[x+size,y]],color);rect(c,x-size*.6,y-size*.5,size*.6,1.5,'#ffffff');}
 function draw(canvas,seconds){const {c,t,alpha}=begin(canvas,seconds,duration,bg),s=stateAt(t),zoom=mix(3,1,ease(t/3));
  c.save();c.translate(400,300);c.scale(zoom,zoom);const lead=path(t*155),pull=ease(t/3);c.translate(-mix(lead.x,400,pull),-mix(lead.y,300,pull));
  const fade=1-.84*ease((t-titleAt)/1.2);c.globalAlpha=alpha*fade;
  for(let x=0;x<800;x+=40)line(c,[[x,0],[x,600]],'#0a2129');for(let y=0;y<600;y+=40)line(c,[[0,y],[800,y]],'#0a2129');
  s.mushrooms.forEach(m=>mushroom(c,m.x,m.y,9,m.color));
  s.chain.slice().reverse().forEach(p=>segment(c,p.x,p.y,10,p.color,p.id===0||s.split&&p.id===6));
  if(t>8)for(let i=0;i<14;i++){const p=path(165*(t-8)-i*23);if(p.y>100&&p.y<530)segment(c,800-p.x,600-p.y,9,colors[1],i===0);}
  const shot=clamp((t-5.55)/.45),gx=t<6?hit.x:400+Math.sin(t*.8)*270;
  poly(c,[[gx-18,565],[gx-7,559],[gx-4,546],[gx+4,546],[gx+7,559],[gx+18,565]],'#9bffe0');
  poly(c,[[400-18,35],[400-7,41],[400-4,54],[400+4,54],[400+7,41],[400+18,35]],'#ff8dbc');
  if(t>=5.55&&t<6)rect(c,hit.x-1,mix(546,hit.y,shot),2,12,'#fff09b');
  if(t>=6&&t<6.3){const r=(t-6)*65;for(let i=0;i<10;i++)disc(c,hit.x+Math.cos(i*2.4)*r,hit.y+Math.sin(i*2.4)*r,1.6,colors[0]);}
  c.restore();c.globalAlpha=alpha;
  for(const p of title){const a=ease((t-titleAt-p.index*.055-p.row*.2)/.65);if(!a)continue;
   rect(c,p.x,p.y+35*(1-a),p.size-1,(p.size-1)*a,colors[p.row?0:1]);
   if(p.id%9===0&&a===1)mushroom(c,p.x+6,p.y+4,5,colors[p.row?0:1]);
  }
  c.restore();return s;
 }
 window.CentipedeAttract={draw,stateAt,duration,still,titleAt,title};
})();
