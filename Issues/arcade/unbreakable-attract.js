// A type slab becomes a long brick wall, then the reverse-Breakout machine.
(() => {
  'use strict';
  const duration=20.2,still=1,tiltAt=2.2,diveAt=3.8,flattenAt=4.5,playAt=5.4,clearAt=12.6,typeAt=14.1,cadence=.32;
  const titleCenter=-126,wallTop=titleCenter-6,firstWallRow=Math.ceil((wallTop+4)*50/24);
  const palette=['#781f02','#ce9f69','#cc241d','#ffda79','#f9f7e5'],ground='#160f18';
  const clamp=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const mix=(a,b,p)=>a+(b-a)*p;
  const wrap=n=>{const t=n%duration;return t<0?t+duration:t;};
  // Solid block faces with slit counters. Holes may open through an outer edge.
  const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  const cuts={
    U:[rect(.39,-.01,.22,.79)],
    N:[[[.32,0],[.49,0],[.68,.63]],[[.32,.37],[.51,1],[.68,1]]],
    B:[rect(.44,.19,.15,.22),rect(.44,.59,.15,.22),[[1.01,.44],[.83,.5],[1.01,.56]]],
    R:[rect(.43,.18,.17,.23),[[.36,1],[.49,.65],[.67,1]],[[1,.47],[.82,.54],[1,.86]]],
    E:[rect(.39,.285,.62,.065),rect(.39,.65,.62,.065)],
    A:[rect(.435,.18,.13,.31),rect(.405,.69,.19,.32)],
    K:[[[.43,.45],[1,-.01],[.59,-.01]],[[.43,.55],[.59,1.01],[1,1.01]],[[.85,.5],[1,.34],[1,.66]]],
    L:[rect(.43,-.01,.58,.73)]
  };
  const letters=['UNBRE','AKABLE'].flatMap((word,row)=>{
    const width=(788-(word.length-1)*4)/word.length;
    return [...word].map((char,index)=>({char,row,index,x:6+index*(width+4),y:6+row*297,width,height:291}));
  });
  function titleState(t){
    const count=t<typeAt?11:Math.min(11,Math.max(0,Math.floor((t-typeAt)/cadence)+1));
    return {count,letters:letters.map((letter,i)=>({...letter,visible:i<count})),complete:count===11};
  }
  // A fixed-step authored run preserves Unbreakable's defining rule: hits add
  // complete cells after the returning ball clears them. No bricks are broken.
  const cols=16,brickW=50,brickH=24,ballR=7,paddleY=550,step=1/120;
  const frames=[],deposits=[],front=Array(cols).fill(240);
  let ball={x:175,y:paddleY-ballR,vx:170,vy:-450,color:3},paddleX=ball.x,phase='up',pending=null,hits=0,bounces=0;
  let target=3;
  function launchBall(){
    const lowest=Math.min(...front);
    const available=front.map((y,c)=>({y,c})).filter(v=>v.y===lowest);
    target=available.reduce((a,b)=>Math.abs((b.c+.5)*brickW-ball.x)<Math.abs((a.c+.5)*brickW-ball.x)?b:a).c;
    const dx=(target+.5)*brickW-ball.x,dy=paddleY-ballR-front[target]-ballR;
    ball.vx=dx/Math.hypot(dx,dy)*480;ball.vy=-Math.sqrt(480**2-ball.vx**2);phase='up';
  }
  launchBall();
  for(let n=0;n<=1800;n++){
    const age=n*step;
    frames.push({x:ball.x,y:ball.y,color:ball.color,paddleX,hits,bounces,deposits:deposits.length});
    ball.x+=ball.vx*step;ball.y+=ball.vy*step;
    if(ball.x<ballR){ball.x=2*ballR-ball.x;ball.vx=Math.abs(ball.vx);}
    if(ball.x>800-ballR){ball.x=2*(800-ballR)-ball.x;ball.vx=-Math.abs(ball.vx);}
    if(phase==='up'&&ball.y<=front[target]+ballR){
      ball.y=front[target]+ballR;ball.vy=Math.abs(ball.vy);phase='down';hits++;
      pending={col:target,y:front[target],color:ball.color};ball.color=(ball.color+2)%5;
    }
    if(pending&&ball.y-ballR>pending.y+brickH){
      deposits.push({...pending,at:age+step});front[pending.col]+=brickH;pending=null;
    }
    // Track the ball with a bounded continuous paddle path, including wall bounces.
    paddleX+=Math.max(-900*step,Math.min(900*step,(ball.x-paddleX)*(1-Math.exp(-14*step))));
    paddleX=Math.max(40,Math.min(760,paddleX));
    if(phase==='down'&&ball.y>=paddleY-ballR){
      ball.y=paddleY-ballR;paddleX=Math.max(40,Math.min(760,ball.x));bounces++;launchBall();
    }
  }
  function gameState(t){
    const age=clamp((t-(playAt-3.2))/15)*15,index=Math.min(frames.length-2,Math.floor(age/step)),p=age/step-index;
    const a=frames[index],b=frames[index+1];
    return {...a,x:mix(a.x,b.x,p),y:mix(a.y,b.y,p),paddleX:mix(a.paddleX,b.paddleX,p),age,placed:deposits.filter(d=>d.at<=age)};
  }
  function cameraState(t){
    const tilt=ease((t-tiltAt)/(diveAt-tiltAt)),travel=ease((t-diveAt)/(playAt-diveAt)),flat=ease((t-flattenAt)/(playAt-flattenAt));
    const pitch=mix(Math.PI/2,.24,tilt)+(Math.PI/2-.24)*flat,distance=mix(12,18,tilt)-6*flat;
    // Move the eye itself toward the machine while flattening, rather than
    // pushing it beyond the paddle and only then rotating back overhead.
    const eye=mix(titleCenter+18*Math.cos(.24),2,travel);
    const z=t<diveAt?titleCenter:eye-distance*Math.cos(pitch);
    return {pitch,z,distance,eyeZ:z+distance*Math.cos(pitch),roll:-.12*tilt*(1-flat),travel,flat};
  }
  function draw(canvas,seconds){
    const t=wrap(seconds),ctx=canvas.getContext('2d'),camera=cameraState(t),game=gameState(t);
    ctx.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);ctx.globalAlpha=1;
    ctx.fillStyle=ground;ctx.fillRect(0,0,800,600);
    const clear=ease((t-clearAt)/1.5),focal=600;
    const sin=Math.sin(camera.pitch),cos=Math.cos(camera.pitch),rollCos=Math.cos(camera.roll),rollSin=Math.sin(camera.roll);
    // The camera looks up the wall as its eye travels down toward the machine.
    function project(x,z,height=0){
      const dz=z-camera.z,depth=camera.distance-dz*cos-height*sin;
      if(depth<.3)return null;
      const xx=x*focal/depth,yy=(dz*sin-height*cos)*focal/depth;
      return [400+xx*rollCos-yy*rollSin,300+xx*rollSin+yy*rollCos];
    }
    function quad(x,z,w,h,height=.01){
      const points=[project(x,z,height),project(x+w,z,height),project(x+w,z+h,height),project(x,z+h,height)];
      if(points.some(p=>!p))return null;
      if(points.every(p=>p[0]<-2)||points.every(p=>p[0]>802)||points.every(p=>p[1]<-2)||points.every(p=>p[1]>602))return null;
      return points;
    }
    function path(points){
      if(!points)return;
      ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);ctx.closePath();
    }
    function patch(x,z,w,h,color,height=.01){
      const points=quad(x,z,w,h,height);if(!points)return;
      ctx.fillStyle=color;ctx.beginPath();path(points);ctx.fill();
    }
    const world=(x,y)=>[(x-400)/50,(y-300)/50+2];
    const masonry=[];
    const wallShift=-clear*17;
    // Cull rows behind the eye, and tiny far masonry, before emitting polygons.
    const first=Math.max(firstWallRow,Math.floor((camera.z-100+4)*50/24)+2);
    const last=Math.min(9,Math.ceil((camera.z+camera.distance/Math.max(.01,cos)+4)*50/24));
    function brick(col,y,color){
      const [x,z]=world(col*50+1,y+1);
      const points=quad(x,z+wallShift,.96,.44);if(!points)return;
      masonry.push({x,z:z+wallShift,color,points});
    }
    if(t<typeAt){
      for(let row=first;row<=last;row++)for(let col=0;col<cols;col++){
        const y=row*24;if(y>=240)continue;
        const code=((Math.imul(row+317,37)^Math.imul(col+3,71))>>>0)%5;
        brick(col,y,code);
      }
      for(const deposit of game.placed)brick(deposit.col,deposit.y,deposit.color);
      for(let color=0;color<5;color++){
        ctx.fillStyle=palette[color];ctx.beginPath();for(const b of masonry)if(b.color===color)path(b.points);ctx.fill();
      }
      ctx.fillStyle='rgba(255,255,255,.20)';ctx.beginPath();
      for(const b of masonry)path(quad(b.x,b.z,.96,.06));ctx.fill();
      ctx.fillStyle='rgba(22,15,24,.32)';ctx.beginPath();
      for(const b of masonry)path(quad(b.x,b.z+.40,.96,.04));ctx.fill();
    }
    // The title is painted on a real plane in the wall, not a screen-space layer.
    const typing=t>=typeAt,title=titleState(t),titleZ=typing?2:titleCenter;
    if(typing||t<playAt){
      patch(-8,titleZ-6,16,12,ground,.025);
      for(const letter of title.letters){
        if(!letter.visible)continue;
        const x=(letter.x-400)/50,z=titleZ+(letter.y-300)/50,w=letter.width/50,h=letter.height/50;
        patch(x,z,w,h,palette[4],.03);
        for(const cut of cuts[letter.char]){
          const points=cut.map(([a,b])=>project(x+a*w,z+b*h,.032));
          if(points.some(p=>!p))continue;
          ctx.fillStyle=ground;ctx.beginPath();path(points);ctx.fill();
        }
      }
    }
    let ballPoint=null,paddlePoints=null;
    if(t<typeAt){
      const [px,pz]=world(game.paddleX-40,paddleY-6),exit=clear*10;
      paddlePoints=quad(px,pz+exit,1.6,.24,.07);
      ctx.fillStyle=palette[game.color];ctx.beginPath();path(paddlePoints);ctx.fill();
      patch(px,pz+exit,1.6,.06,palette[4],.075);
      // Short physical trail follows the same analytic run at fixed time offsets.
      for(let i=5;i>=1;i--){
        const old=gameState(t-i*.016),[x,z]=world(old.x,old.y);const p=project(x,z+exit,.08);
        if(!p)continue;
        const rr=project(x+ballR/50,z+exit,.08);if(!rr)continue;
        ctx.globalAlpha=(1-i/6)*.30;ctx.fillStyle=palette[old.color];ctx.beginPath();ctx.arc(p[0],p[1],Math.max(.3,Math.hypot(rr[0]-p[0],rr[1]-p[1])*(1-i/8)),0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
      const [x,z]=world(game.x,game.y);ballPoint=project(x,z+exit,.10);const edge=project(x+ballR/50,z+exit,.1);
      if(ballPoint&&edge){
        const radius=Math.max(.4,Math.hypot(edge[0]-ballPoint[0],edge[1]-ballPoint[1]));
        ctx.fillStyle=palette[game.color];ctx.beginPath();ctx.arc(...ballPoint,radius,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=palette[4];ctx.beginPath();ctx.arc(ballPoint[0]-radius*.25,ballPoint[1]-radius*.25,radius*.45,0,Math.PI*2);ctx.fill();
      }
    }
    return {phase:t<tiltAt?'title':t<diveAt?'tilt':t<flattenAt?'dive':t<playAt?'flatten':t<clearAt?'play':t<typeAt?'clear':'type',camera,title,game:{x:game.x,y:game.y,paddleX:game.paddleX,hits:game.hits,bounces:game.bounces,bricks:game.placed.length},visibleBricks:masonry.length,ballPoint,paddlePoints,clear};
  }
  window.UnbreakableAttract={draw,duration,still,cameraState,gameState,titleState,tiltAt,diveAt,flattenAt,playAt,clearAt,typeAt,cadence};
})();
