// Four original cannons, one continuous camera tour. No game instance is loaded.
(() => {
  'use strict';
  const duration=24,still=18,TAU=Math.PI*2;
  const dwell=3.6,pan=.28,step=dwell+pan,titleStart=15.4,blastAt=19.8;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const mix=(a,b,p)=>a+(b-a)*p;
  const wrap=(n,m)=>((n%m)+m)%m;
  const colors=['#ff6b9d','#ffb86b','#7cf7c8','#8fb7ff'];
  const lands=[[400,-1440,1500],[2320,260,1590],[400,1960,1500],[-1520,260,1590]];
  const bases=[Math.PI,-Math.PI/2,0,Math.PI/2];
  const glyphs={
    W:[[[0,0],[.7,6],[2,3.3],[3.3,6],[4,0]]],
    A:[[[0,6],[0,2],[2,0],[4,2],[4,6]],[[0,3.5],[4,3.5]]],
    R:[[[0,6],[0,0],[3,0],[4,1],[4,2],[3,3],[0,3]],[[2,3],[4,6]]],
    L:[[[0,0],[0,6],[4,6]]],O:[[[1,0],[3,0],[4,1],[4,5],[3,6],[1,6],[0,5],[0,1],[1,0]]],
    D:[[[0,0],[2,0],[4,2],[4,4],[2,6],[0,6],[0,0]]],S:[[[4,0],[0,0],[0,3],[4,3],[4,6],[0,6]]],
    '0':[[[0,0],[4,0],[4,6],[0,6],[0,0]]],
    '¢':[[[4,1],[0,1],[0,5],[4,5]],[[2,0],[2,6]]],
    T:[[[0,0],[4,0]],[[2,0],[2,6]]],P:[[[0,6],[0,0],[4,0],[4,3],[0,3]]],
    Y:[[[0,0],[2,3],[4,0]],[[2,3],[2,6]]]
  };
  const shots=[];
  for(let side=0;side<4;side++){
    for(const offset of [.8,1.08,1.36,1.8,1.96,2.12,2.28])shots.push({side,at:side*step+offset});
  }
  const stars=Array.from({length:94},(_,i)=>({x:wrap(Math.sin(i*12.73)*8317,800),y:wrap(Math.cos(i*7.31)*5983,520),size:i%11===0?1.8:.9,alpha:.15+(i%7)*.055}));
  function position(side,t){
    const drift=Math.sin(t/duration*TAU+side*1.7)*105;
    const [cx,cy,r]=lands[side];
    if(side%2===0){const x=400+drift,y=cy+(side===0?1:-1)*Math.sqrt(r*r-(x-cx)**2);return{x,y:y+(side===0?7:-7),surface:bases[side]+Math.asin((x-cx)/r)*(side===0?-1:1)};}
    const y=260+drift*.64,x=cx+(side===1?-1:1)*Math.sqrt(r*r-(y-cy)**2);return{x:x+(side===1?-7:7),y,surface:bases[side]+Math.asin((y-cy)/r)*(side===1?-1:1)};
  }
  function shotGeometry(shot){
    const origin=position(shot.side,shot.at),target=position((shot.side+2)%4,shot.at+.8);
    const angle=Math.atan2(target.y-origin.y,target.x-origin.x);
    return{x:origin.x+Math.cos(angle)*27,y:origin.y+Math.sin(angle)*27,dx:Math.cos(angle),dy:Math.sin(angle)};
  }
  shots.forEach(shot=>Object.assign(shot,shotGeometry(shot)));
  function lettering(ctx,text,x,y,unit,width=2,progress=1){
    ctx.lineWidth=width;ctx.lineJoin='miter';ctx.lineCap='butt';
    [...text].forEach((letter,i)=>{
      const visible=clamp(progress*text.length-i);
      if(!visible)return;
      ctx.save();ctx.beginPath();ctx.rect(x+i*5.7*unit-width,y-width,4*unit+width*2,(6*unit+width*2)*visible);ctx.clip();
      for(const path of glyphs[letter]||[]){ctx.beginPath();path.forEach(([a,b],j)=>j?ctx.lineTo(x+(i*5.7+a)*unit,y+b*unit):ctx.moveTo(x+(i*5.7+a)*unit,y+b*unit));ctx.stroke();}
      ctx.restore();
    });
  }
  const titlePaths=[...'WARLORDS'].flatMap((letter,i)=>glyphs[letter].map(path=>path.map(([x,y])=>[32+(i*5.7+x)*16.75,165+y*33.5])));
  const fragments=[];
  for(const path of titlePaths)for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.ceil(length/35);
    for(let j=0;j<count;j++){
      const start=a.map((v,k)=>mix(v,b[k],j/count)),end=a.map((v,k)=>mix(v,b[k],(j+1)/count));
      const center=start.map((v,k)=>(v+end[k])/2),id=fragments.length;
      const angle=Math.atan2((center[1]-265)*2.4,center[0]-400)+Math.sin(id*8.79)*.43;
      fragments.push({start:start.map((v,k)=>v-center[k]),end:end.map((v,k)=>v-center[k]),center,angle,speed:680+(id%9)*85,spin:(id%2?1:-1)*(3+id%7),color:colors[id%4]});
    }
  }
  function title(ctx,t){
    const age=t-blastAt;
    ctx.lineWidth=12;ctx.lineJoin='miter';ctx.lineCap='butt';
    if(age<0){
      const impact=1+.06*(1-ease((t-titleStart)/.22));
      ctx.save();ctx.translate(400,265);ctx.scale(impact,impact);ctx.translate(-400,-265);ctx.strokeStyle='#eff6e9';
      for(const path of titlePaths){ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
      ctx.restore();return 0;
    }
    let visible=0;
    for(const part of fragments){
      const travel=part.speed*age+240*age*age;
      const x=part.center[0]+Math.cos(part.angle)*travel,y=part.center[1]+Math.sin(part.angle)*travel+110*age*age;
      if(x< -50||x>850||y< -50||y>582)continue;
      visible++;
      ctx.save();ctx.translate(x,y);ctx.rotate(part.spin*age);ctx.strokeStyle=age<.075?'#fff':part.color;
      ctx.beginPath();ctx.moveTo(...part.start);ctx.lineTo(...part.end);ctx.stroke();ctx.restore();
    }
    return visible;
  }
  function draw(canvas,seconds){
    const ctx=canvas.getContext('2d'),t=wrap(seconds,duration);
    ctx.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);
    ctx.fillStyle='#000';ctx.fillRect(0,0,800,600);
    const tour=t<titleStart,returning=t>=23.4;
    const cameraTime=returning?0:t,index=Math.min(3,Math.floor(cameraTime/step)),local=cameraTime-index*step;
    const progress=index<3?ease((local-dwell)/pan):0;
    const focusAt=side=>{const p=position(side,t),inward=Math.atan2(260-p.y,400-p.x);return{x:p.x+Math.cos(inward)*57,y:p.y+Math.sin(inward)*57};};
    const from=focusAt(index),to=focusAt(Math.min(3,index+1));
    const scale=2.8,cx=mix(from.x,to.x,progress),cy=mix(from.y,to.y,progress);
    const arenaAlpha=tour?1:returning?ease((t-23.4)/.6):0;
    const activeShots=[];let firingMask=0,visibleGuns=0;
    if(arenaAlpha>0){
    ctx.save();ctx.beginPath();ctx.rect(0,0,800,532);ctx.clip();
    ctx.globalAlpha=arenaAlpha;ctx.fillStyle='#070a12';ctx.fillRect(0,0,800,532);
    ctx.translate(400,260);ctx.scale(scale,scale);ctx.translate(-cx,-cy);
    // Stable star coordinates make the camera movement tangible.
    for(const star of stars){ctx.fillStyle=`rgba(200,224,255,${star.alpha})`;ctx.fillRect(star.x,star.y,star.size,star.size);}
    lands.forEach(([x,y,r],i)=>{ctx.fillStyle=colors[i];ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();});
    shots.forEach(shot=>{
      const age=wrap(t-shot.at,duration),distance=age*290;
      if(age>1.82)return;
      const x=shot.x+shot.dx*distance,y=shot.y+shot.dy*distance;
      ctx.strokeStyle=colors[shot.side];ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(x-shot.dx*12,y-shot.dy*12);ctx.lineTo(x,y);ctx.stroke();
      ctx.fillStyle=colors[shot.side];ctx.fillRect(x-2.5,y-2.5,5,5);activeShots.push(shot.side);
    });
    colors.forEach((color,side)=>{
      const p=position(side,t),aim=position((side+2)%4,t+.8),angle=Math.atan2(aim.y-p.y,aim.x-p.x);
      const screenX=400+(p.x-cx)*scale,screenY=260+(p.y-cy)*scale;
      if(screenX> -30&&screenX<830&&screenY> -30&&screenY<562)visibleGuns++;
      const ages=shots.filter(s=>s.side===side).map(s=>wrap(t-s.at,duration));
      const age=Math.min(...ages),kick=Math.max(0,1-age/.20),flash=Math.max(0,1-age/.10);
      if(flash>0)firingMask|=1<<side;
      ctx.save();ctx.translate(p.x-Math.cos(angle)*kick*3.5,p.y-Math.sin(angle)*kick*3.5);ctx.rotate(p.surface);
      // Same three stepped body rectangles and barrel as the source work.
      ctx.fillStyle=color;ctx.fillRect(-21,4,42,7);ctx.fillRect(-14,-3,28,9);ctx.fillRect(-8,-10,16,11);ctx.restore();
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle+Math.PI/2);ctx.fillStyle=color;
      ctx.fillRect(-3,-24+kick*4,6,24-kick*4);ctx.fillRect(-5,-26+kick*4,10,4);ctx.restore();
      if(flash>0){
        ctx.save();ctx.translate(p.x+Math.cos(angle)*29,p.y+Math.sin(angle)*29);
        ctx.globalAlpha=flash;ctx.fillStyle='#eff9ee';ctx.beginPath();ctx.arc(0,0,4+flash*3,0,TAU);ctx.fill();ctx.restore();
      }
      // Forty-three source ammunition marks; empty slots remain as outlines.
      const horizontal=side%2===0,spent=shots.filter(s=>s.side===side&&s.at<t).length;
      for(let i=0;i<43;i++){
        const along=(horizontal?190:75)+i*(horizontal?10:9),x=horizontal?along:side===1?783:10,y=horizontal?(side===0?10:503):along;
        ctx.fillStyle='#edf1ed';ctx.strokeStyle='#edf1ed44';ctx.lineWidth=.7;
        if(i<43-spent)ctx.fillRect(x,y,horizontal?7:6,horizontal?6:6);else ctx.strokeRect(x,y,7,6);
      }
    });
    ctx.restore();
    }
    let visibleFragments=0;
    if(t>=titleStart&&!returning)visibleFragments=title(ctx,t);
    ctx.fillStyle='#000';ctx.fillRect(0,532,800,68);
    ctx.strokeStyle='#d6e9db';lettering(ctx,'0¢ TO PLAY',259,546,5.1,2);
    return{phase:tour?(progress>0?'pan':'turret'):returning?'return':t<blastAt?'title':'explode',turret:tour?index:null,panProgress:progress,scale,firingMask,activeShots:activeShots.length,visibleGuns,visibleFragments,totalFragments:fragments.length};
  }
  window.WarlordsAttract={draw,duration,still};
})();
