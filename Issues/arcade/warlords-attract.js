// Four original cannons, one continuous camera tour. No game instance is loaded.
(() => {
  'use strict';
  const duration=24,still=18,TAU=Math.PI*2;
  const dwell=3.6,pan=.28,step=dwell+pan,titleStart=15.4,blastAt=16.05,titleScale=.78;
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
  const noise=(x,y,frame)=>{let n=Math.imul(x+frame*73,374761393)^Math.imul(y-frame*31,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
  const embers=Array.from({length:62},(_,i)=>{
    const a=-Math.PI+noise(i,4,0)*Math.PI;
    return {angle:a,speed:100+noise(i,9,0)*360,life:.7+noise(i,12,0)*2.4,size:i%3===0?6:3};
  });
  function blast(ctx,age){
    if(age<0||age>3.2)return 0;
    const cell=8,frame=Math.floor(age*18);let fireCells=0;
    ctx.save();ctx.beginPath();ctx.rect(0,0,800,532);ctx.clip();
    // Flat, coarse sprite smoke. No gradients or shaded objects.
    if(age>.25&&age<2.8){
      const p=age-.25,rx=100+140*(1-Math.exp(-p*4)),ry=55+80*(1-Math.exp(-p*3)),cy=350-p*70;
      ctx.globalAlpha=.7*(1-ease((age-1.1)/1.7));
      for(let y=Math.floor((cy-ry*1.2)/cell)*cell;y<cy+ry*1.2;y+=cell)for(let x=400-rx*1.2;x<400+rx*1.2;x+=cell){
        const dx=(x-400)/rx,dy=(y-cy)/ry,n=noise(Math.floor(x/cell),y/cell,frame>>1);
        if(dx*dx+dy*dy<.9+n*.24){ctx.fillStyle=n>.56?'#3d3029':'#261f1d';ctx.fillRect(Math.floor(x/cell)*cell,y,cell,cell);}
      }
    }
    // White-hot impact grows into jagged yellow, orange and red fire.
    if(age<1.6){
      const bloom=1-Math.exp(-age*7),rx=16+270*bloom,ry=12+165*bloom,cy=370-120*(1-Math.exp(-age*3));
      ctx.globalAlpha=1-ease((age-.85)/.75);
      for(let y=Math.floor((cy-ry*1.25)/cell)*cell;y<cy+ry*1.25;y+=cell)for(let x=Math.floor((400-rx*1.25)/cell)*cell;x<400+rx*1.25;x+=cell){
        const dx=(x-400)/rx,dy=(y-cy)/ry,r=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
        const n=noise(x/cell,y/cell,frame),edge=1+.1*Math.sin(angle*7+age*8)+.07*Math.sin(angle*13-age*4);
        if(r>edge+n*.12)continue;
        const heat=1-r*.72+n*.2-age*.42;
        ctx.fillStyle=heat>.91?'#fff4c2':heat>.72?'#ffdf63':heat>.52?'#ffae28':heat>.3?'#fa641b':heat>.13?'#cc3217':'#7b2116';
        ctx.fillRect(x,y,cell,cell);fireCells++;
      }
    }
    if(age<.8){
      const radius=330*(1-Math.exp(-age*7));ctx.globalAlpha=1-age/.8;ctx.fillStyle='#ffb837';
      for(let i=0;i<100;i++){const a=i/100*TAU;ctx.fillRect(Math.round((400+Math.cos(a)*radius)/4)*4,Math.round((370+Math.sin(a)*radius*.13)/4)*4,8,4);}
    }
    for(const ember of embers){
      if(age>ember.life)continue;
      const x=400+Math.cos(ember.angle)*ember.speed*age,y=370+Math.sin(ember.angle)*ember.speed*age+105*age*age;
      if(x<0||x>800||y<0||y>532)continue;
      ctx.globalAlpha=1-age/ember.life;ctx.fillStyle=age<.25?'#fff4c2':age<1?'#ffae28':'#dd4c19';ctx.fillRect(Math.round(x/4)*4,Math.round(y/4)*4,ember.size,ember.size);
    }
    ctx.restore();return fireCells;
  }
  function title(ctx,t){
    const age=t-blastAt;
    const u=clamp((t-titleStart)/(blastAt-titleStart));
    const offset=age<0?-430*(1-u*u):0;
    const impulse=age>=0?Math.exp(-age*12):0;
    const shakeX=Math.sin(Math.max(0,age)*71)*4*impulse,shakeY=Math.sin(Math.max(0,age)*91)*3*impulse;
    const squash=1-.09*impulse*Math.sin(Math.max(0,age)*27);
    const fireCells=blast(ctx,age);
    ctx.save();ctx.translate(400+shakeX,265+offset+shakeY);ctx.scale(titleScale,titleScale*squash);ctx.translate(-400,-265);
    ctx.lineJoin='miter';ctx.lineCap='butt';
    // The whole word remains one object before, during and after impact.
    for(const [color,width] of [['#070a12',20],['#eff6e9',12]]){
      ctx.strokeStyle=color;ctx.lineWidth=width;
      for(const path of titlePaths){ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
    }
    ctx.restore();return {fireCells,titleOffset:offset,blastAge:age};
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
    let impact={fireCells:0,titleOffset:0,blastAge:-1};
    if(t>=titleStart&&!returning)impact=title(ctx,t);
    ctx.fillStyle='#000';ctx.fillRect(0,532,800,68);
    ctx.strokeStyle='#d6e9db';lettering(ctx,'0¢ TO PLAY',259,546,5.1,2);
    return{phase:tour?(progress>0?'pan':'turret'):returning?'return':t<blastAt?'drop':t<blastAt+2.8?'blast':'title',turret:tour?index:null,panProgress:progress,scale,firingMask,activeShots:activeShots.length,visibleGuns,titleScale,titleIntact:true,...impact};
  }
  window.WarlordsAttract={draw,duration,still};
})();
