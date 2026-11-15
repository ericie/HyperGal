// Two consoles choose Both; combat gives way to an opposing letter collision.
(() => {
  'use strict';
  const duration=21.4,still=18.5,TAU=Math.PI*2;
  const consoleLag=.35,consoleExitAt=5.2,landEntryAt=5.9,combatAt=6.7;
  const landExitAt=10.9,landExitDuration=.8,titleAt=11.9,letterCadence=.62,flight=.58,rebound=.95;
  const titleSettledAt=titleAt+6*letterCadence+flight+rebound,fadeAt=20.6;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const out=n=>1-Math.pow(1-clamp(n),4);
  const mix=(a,b,p)=>a+(b-a)*p;
  const wrap=(n,m)=>{const value=n%m;return value<0?value+m:value;};
  const palettes=[
    {ink:'#ff4a76',city:'#ff8b3d',detail:'#401018',missile:'#ffdd5d',trail:'#ff6c4b'},
    {ink:'#41f6c0',city:'#28b7ff',detail:'#061b22',missile:'#8bfff0',trail:'#5dffeb'},
    {ink:'#a879ff',city:'#ef69ff',detail:'#1c0831',missile:'#f4b8ff',trail:'#cc7dff'}
  ];
  // Authored pixel characters keep the console independent of font loading.
  const glyphs={
    A:['01110','10001','10001','11111','10001','10001','10001'],
    B:['11110','10001','10001','11110','10001','10001','11110'],
    C:['01111','10000','10000','10000','10000','10000','01111'],
    D:['11110','10001','10001','10001','10001','10001','11110'],
    E:['11111','10000','10000','11110','10000','10000','11111'],
    F:['11111','10000','10000','11110','10000','10000','10000'],
    G:['01111','10000','10000','10111','10001','10001','01110'],
    I:['111','010','010','010','010','010','111'],
    K:['10001','10010','10100','11000','10100','10010','10001'],
    L:['10000','10000','10000','10000','10000','10000','11111'],
    M:['10001','11011','10101','10101','10001','10001','10001'],
    N:['10001','11001','11001','10101','10011','10011','10001'],
    O:['01110','10001','10001','10001','10001','10001','01110'],
    P:['11110','10001','10001','11110','10000','10000','10000'],
    R:['11110','10001','10001','11110','10100','10010','10001'],
    S:['01111','10000','10000','01110','00001','00001','11110'],
    T:['11111','00100','00100','00100','00100','00100','00100'],
    U:['10001','10001','10001','10001','10001','10001','01110'],
    ' ':['000','000','000','000','000','000','000'],
    '?':['01110','10001','00001','00010','00100','00000','00100'],
    e:['00000','00000','01110','10001','11111','10000','01110'],
    h:['10000','10000','10110','11001','10001','10001','10001'],
    n:['00000','00000','11110','10001','10001','10001','10001'],
    o:['00000','00000','01110','10001','10001','10001','01110'],
    p:['00000','00000','11110','10001','11110','10000','10000'],
    r:['00000','00000','10110','11001','10000','10000','10000'],
    s:['00000','00000','01111','10000','01110','00001','11110'],
    t:['00100','00100','11111','00100','00100','00101','00010']
  };
  function text(ctx,value,x,y,size,color){
    ctx.fillStyle=color;
    for(const char of value){
      const rows=glyphs[char]||glyphs[' '];
      rows.forEach((row,j)=>[...row].forEach((bit,i)=>{if(bit==='1')ctx.fillRect(x+i*size,y+j*size,size,size);}));
      x+=(rows[0].length+1)*size;
    }
    return x;
  }
  function terminal(ctx,age,inverted,slideY=0){
    const offset=Math.round(slideY),panelColor=inverted?'#d01657':'#1462d8',ink='#ffffff',size=2;
    age-=inverted?consoleLag:0;
    ctx.save();ctx.translate(0,offset);
    if(inverted){ctx.translate(320,120);ctx.rotate(Math.PI);}
    else ctx.translate(0,120);
    ctx.fillStyle=panelColor;ctx.fillRect(12,6,296,108);
    // Plain bracket geometry frames the text without adding interface copy.
    ctx.strokeStyle=ink;ctx.lineWidth=1;ctx.globalAlpha=.5;
    for(const [x,y,dx,dy] of [[16,10,1,1],[304,10,-1,1],[16,110,1,-1],[304,110,-1,-1]]){
      ctx.beginPath();ctx.moveTo(x,y+dy*6);ctx.lineTo(x,y);ctx.lineTo(x+dx*10,y);ctx.stroke();
    }
    ctx.globalAlpha=1;
    const typed=(value,start)=>value.slice(0,Math.floor(Math.max(0,age-start)*24));
    const warning=typed('MISSILES INCOMING',.55);
    text(ctx,warning,25,17,size,ink);
    if(age>1.25){ctx.fillStyle=ink;ctx.fillRect(25,34,Math.round(268*out((age-1.25)/.35)),1);}
    const prompt=typed('Response',1.65);
    const cursor=text(ctx,prompt,25,42,size,ink);
    if(age>1.65&&age<4.1&&Math.floor(age*2)%2===0){ctx.fillStyle=ink;ctx.fillRect(cursor+4,54,10,2);}
    const question=typed('ATTACK or DEFEND?',2.65);
    text(ctx,question,25,65,size,ink);
    const answer=typed('Both',4.05);
    text(ctx,answer,25,89,size,ink);
    ctx.restore();
    return {warning,prompt,question,answer,inverted,panelColor,textColor:ink,textSize:size,bounds:{x:12,y:(inverted?6:126)+offset,width:296,height:108}};
  }
  let seed=901;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const stars=Array.from({length:64},()=>({x:Math.floor(random()*320),y:30+Math.floor(random()*180),a:.12+random()*.4}));
  const cities=Array.from({length:7},(_,i)=>({x:24+i*45.3,battery:[1,3,5].includes(i),
    blocks:Array.from({length:4},(_,j)=>({x:j*5-10,w:4,h:8+Math.floor(random()*14)}))}));
  const attacks=[];
  for(let wave=0;wave<26;wave++)for(let side=0;side<2;side++){
    const launch=.7+wave*.43+side*.04;
    const sx=cities[[1,3,5][Math.floor(random()*3)]].x;
    const target=Math.floor(random()*7),tx=cities[target].x+(random()-.5)*10;
    const flight=2.1+random()*1.35,intercept=wave%4!==0;
    const fraction=.42+random()*.23;
    attacks.push({side,launch,sx,tx,target,flight,intercept,fraction,
      defenderX:cities[[1,3,5][Math.floor(random()*3)]].x});
  }
  function line(ctx,a,b,color,alpha=1){
    ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(Math.round(a[0])+.5,Math.round(a[1])+.5);ctx.lineTo(Math.round(b[0])+.5,Math.round(b[1])+.5);ctx.stroke();ctx.globalAlpha=1;
  }
  function blast(ctx,x,y,r,age,color,opacity=1){
    if(age<0||age>.9)return;
    const p=age/.9,radius=Math.max(1,Math.round(r*Math.sin(p*Math.PI))),inner=Math.max(0,radius-2);
    ctx.fillStyle=color;ctx.globalAlpha=(1-p)*opacity;
    for(let yy=-radius;yy<=radius;yy++)for(let xx=-radius;xx<=radius;xx++){
      const d=xx*xx+yy*yy;
      if(d<=radius*radius&&d>=inner*inner&&((xx-yy)&1)===0)ctx.fillRect(Math.round(x)+xx,Math.round(y)+yy,1,1);
    }
    ctx.globalAlpha=(1-p)*.75*opacity;ctx.fillStyle='#fff2a2';
    if(age<.2)ctx.fillRect(Math.round(x)-2,Math.round(y)-2,5,5);
    for(let i=0;i<8;i++){
      const a=i/8*TAU,reach=age*(20+i%3*13);
      ctx.fillRect(Math.round(x+Math.cos(a)*reach),Math.round(y+Math.sin(a)*reach),1,1);
    }
    ctx.globalAlpha=1;
  }
  function background(ctx,opacity=1){
    ctx.fillStyle='#03030a';ctx.fillRect(0,0,320,240);
    stars.forEach(s=>{ctx.globalAlpha=s.a*opacity;ctx.fillStyle='#7492ff';ctx.fillRect(s.x,s.y,1,1);});ctx.globalAlpha=1;
  }
  function battle(ctx,age,departure=0,entry=1){
    background(ctx);
    const activePalettes=palettes;
    let impacts=0,missiles=0,interceptors=0;
    const damage=[Array(7).fill(0),Array(7).fill(0)];
    attacks.forEach(a=>{
      if(a.intercept||age<a.launch+a.flight)return;
      damage[1-a.side][a.target]++;
    });
    for(let side=0;side<2;side++){
      const palette=activePalettes[side],dir=side===0?1:-1,y=side===0?27:213;
      const offset=(side===0?-1:1)*56*(departure+1-entry);
      ctx.save();ctx.translate(0,Math.round(offset));ctx.fillStyle=palette.ink;
      ctx.fillRect(0,side===0?0:y,320,27);
      for(const [i,city] of cities.entries()){
        const loss=damage[side][i],x=Math.round(city.x);
        const rect=(xx,yy,w,h)=>ctx.fillRect(Math.round(xx),Math.round(dir>0?yy:yy-h),w,h);
        if(loss>=2){ctx.fillStyle=palette.detail;for(let j=0;j<5;j++)rect(x-10+j*4,y,3,2+j%3);continue;}
        if(city.battery){
          ctx.fillStyle=palette.ink;
          rect(x-9,y,18,4);rect(x-6,y+dir*4,12,4);rect(x-3,y+dir*8,6,5);rect(x-1,y+dir*13,2,4);
        }else{
          for(const b of city.blocks){
            const height=Math.round(b.h*(loss?.52:1));ctx.fillStyle=palette.city;rect(x+b.x,y,b.w,height);
            ctx.fillStyle=palette.detail;for(let wy=3;wy<height-2;wy+=5)rect(x+b.x+1,y+dir*wy,1,1);
          }
        }
      }
      ctx.restore();
    }
    ctx.save();
    const impactAges=attacks.filter(a=>!a.intercept).map(a=>age-a.launch-a.flight).filter(a=>a>=0&&a<.2);
    const kick=impactAges.length?Math.max(...impactAges.map(a=>(1-a/.2))):0;
    ctx.translate(Math.round(Math.sin(age*53)*kick),Math.round(Math.cos(age*61)*kick));
    for(const a of attacks){
      if(a.launch>landExitAt-combatAt)continue;
      const elapsed=age-a.launch;if(elapsed<0)continue;
      const sy=a.side===0?44:196,ty=a.side===0?207:33;
      const p=clamp(elapsed/a.flight),palette=activePalettes[a.side];
      const hitAt=a.flight*a.fraction;
      if(p<1&&(!a.intercept||elapsed<hitAt)){
        const x=mix(a.sx,a.tx,p),y=mix(sy,ty,p);
        line(ctx,[a.sx,sy],[x,y],palette.trail,.7*(1-departure));ctx.globalAlpha=1-departure;ctx.fillStyle=palette.missile;ctx.fillRect(Math.round(x)-1,Math.round(y)-1,2,2);ctx.globalAlpha=1;missiles++;
      }
      if(a.intercept){
        const x=mix(a.sx,a.tx,a.fraction),y=mix(sy,ty,a.fraction),defense=activePalettes[1-a.side];
        const start=hitAt-.48,progress=clamp((elapsed-start)/.48);
        if(elapsed>=start&&elapsed<hitAt){
          const position=[mix(a.defenderX,x,progress),mix(ty,y,progress)];
          line(ctx,[a.defenderX,ty],position,defense.trail,.8*(1-departure));ctx.globalAlpha=1-departure;ctx.fillStyle='#fff2a2';ctx.fillRect(Math.round(position[0]),Math.round(position[1]),2,2);ctx.globalAlpha=1;interceptors++;
        }
        blast(ctx,x,y,15+(a.target%3)*4,elapsed-hitAt,defense.ink,1-departure);
      }else{
        const hitAge=elapsed-a.flight;
        blast(ctx,a.tx,ty,22,hitAge,'#fff2a2',1-departure);
        if(hitAge>=0&&hitAge<.9)impacts++;
      }
    }
    ctx.restore();
    return {missiles,interceptors,impacts,landOffsets:[-56*(departure+1-entry),56*(departure+1-entry)]};
  }
  const titleWords=['MUTUAL','COMMAND'],titleSize=6,titleHeight=42;
  // First contact comes from the actual pixel silhouettes, so a T and M meet
  // without an invisible rectangular gap between their painted pixels.
  const contactDistances=[...titleWords[0]].map((char,i)=>{
    const top=glyphs[char],bottom=glyphs[titleWords[1][i]];
    let distance=0;
    for(let x=0;x<5;x++){
      const a=top.map(row=>row[x]).lastIndexOf('1'),b=bottom.map(row=>row[x]).indexOf('1');
      if(a>=0&&b>=0)distance=Math.max(distance,(a+1-b)*titleSize);
    }
    return distance;
  });
  function titleState(seconds){
    return titleWords.flatMap((word,side)=>[...word].map((char,i)=>{
      const starts=titleAt+i*letterCadence,age=seconds-starts;
      const paired=i<titleWords[0].length,distance=paired?contactDistances[i]:titleHeight;
      const upper=120-(titleHeight+distance)/2,contact=side===0?upper:upper+distance;
      const finalX=(320-(word.length*6-1)*titleSize)/2+i*6*titleSize,finalY=side===0?64:136;
      const collisionX=paired?55+i*36:finalX,impactY=paired?contact:finalY;
      let x=collisionX,y=side===0?-52:252,phase='waiting';
      if(age>=0&&age<flight){phase=side===0?'fall':'rise';y=mix(y,impactY,(age/flight)**2);}
      else if(age>=flight){
        const p=clamp((age-flight)/rebound),kick=paired?78*Math.sin(Math.PI*p)*(1-p)**2:8*Math.sin(Math.PI*p)*(1-p)**2;
        x=mix(collisionX,finalX,out(p));y=mix(impactY,finalY,out(p))+(side===0?-1:1)*kick;
        phase=p===1?'settled':'rebound';
      }
      return {char,side,index:i,x,y,width:30,height:titleHeight,phase,visible:age>=0,paired,impactAt:starts+flight};
    }));
  }
  function title(ctx,t,opacity=1){
    background(ctx,opacity);const letters=titleState(t);ctx.globalAlpha=opacity;
    for(const letter of letters){
      if(!letter.visible)continue;
      text(ctx,letter.char,Math.round(letter.x),Math.round(letter.y),titleSize,palettes[letter.side].ink);
    }
    ctx.globalAlpha=1;return letters;
  }
  let buffer=null;
  function draw(canvas,seconds){
    if(!buffer)buffer=document.createElement('canvas');
    if(buffer.width!==320||buffer.height!==240){buffer.width=320;buffer.height=240;}
    const ctx=buffer.getContext('2d'),t=wrap(seconds,duration);
    ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
    ctx.fillStyle='#03030a';ctx.fillRect(0,0,320,240);
    let phase,exchanges=null,combat=null,letters=null;
    if(t<landEntryAt){
      background(ctx);phase=t<consoleExitAt?'consoles':'consoles-exit';
      const exit=ease((t-consoleExitAt)/(landEntryAt-consoleExitAt));
      exchanges=[terminal(ctx,t,true,-120*exit),terminal(ctx,t,false,120*exit)];
    }else if(t<combatAt){
      phase='deploy';combat=battle(ctx,t-combatAt,0,ease((t-landEntryAt)/(combatAt-landEntryAt)));
    }else if(t<landExitAt){
      phase='battle';combat=battle(ctx,t-combatAt);
    }else if(t<landExitAt+landExitDuration){
      phase='lands-exit';combat=battle(ctx,t-combatAt,ease((t-landExitAt)/landExitDuration));
    }else{
      phase=t<titleAt?'cleared':t<titleSettledAt?'letters':t<fadeAt?'title':'return';
      letters=title(ctx,t,1-ease((t-fadeAt)/.8));
    }
    const screen=canvas.getContext('2d');
    screen.setTransform(1,0,0,1,0,0);screen.imageSmoothingEnabled=false;
    screen.drawImage(buffer,0,0,canvas.width,canvas.height);
    return {phase,exchanges,exchange:exchanges?.[1]||null,letters,...combat};
  }
  window.CommandAttract={draw,duration,still,titleState,consoleLag,consoleExitAt,landEntryAt,combatAt,landExitAt,landExitDuration,titleAt,titleSettledAt,fadeAt};
})();
