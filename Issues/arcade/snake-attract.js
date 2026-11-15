// 36 uniform snakes arrive on the ground, settle into type, then escape.
(() => {
  'use strict';
  const still=9;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
  const mix=(a,b,p)=>a+(b-a)*p;
  const lerp=(a,b,p)=>a.map((v,i)=>mix(v,b[i],p));
  const cell=.2,bodyWidth=.8,escapeAt=9.6,escapeSpeed=16,settleAt=3.8,pullbackAt=4.4,pullbackDuration=.65;
  const strokes={
    S:[[[4,0],[0,0],[0,3],[1,3]],[[2,3],[4,3],[4,6],[0,6]]],
    N:[[[0,6],[0,0],[1,0],[1,2],[2,2],[2,4],[3,4],[3,6],[4,6],[4,0]]],
    A:[[[0,6],[0,0],[4,0],[4,6]],[[1,3],[3,3]]],
    K:[[[0,0],[0,6]],[[1,3],[2,3],[2,2],[3,2],[3,1],[4,1],[4,0]],[[1,4],[2,4],[2,5],[3,5],[3,6],[4,6]]],
    E:[[[4,0],[0,0],[0,6],[4,6]],[[1,3],[4,3]]],
    W:[[[0,0],[0,6],[2,6],[2,4],[4,4],[4,6],[6,6],[6,0]]],
    R:[[[1,3],[4,3],[4,0],[0,0],[0,6]],[[2,4],[3,4],[3,5],[4,5],[4,6]]],
    L:[[[0,0],[0,6],[4,6]]],
    "'": [[[0,0],[0,1]]]
  };
  const fragments=[];
  const directions=[[1,0],[0,1],[-1,0],[0,-1]];
  function lineWord(text,z,unit,firstLetter){
    const advance=c=>c===' '?4:c==="'"?2:c==='W'?8:6;
    const width=([...text].reduce((sum,c)=>sum+advance(c),0)-1)*unit;
    let x=-width/2,letter=firstLetter;
    for(const char of text){
      if(strokes[char]){
        const color=letter++%2?'#c5f637':'#55ece2';
        for(const stroke of strokes[char]){
          const squares=[stroke[0]];
          for(const end of stroke.slice(1)){
            let [a,b]=squares.at(-1);
            while(a!==end[0]||b!==end[1]){a+=Math.sign(end[0]-a);b+=Math.sign(end[1]-b);squares.push([a,b]);}
          }
          fragments.push({squares:squares.map(([a,b])=>[Math.round((x+(a+.5)*unit)/cell),Math.round((z+(b+.5)*unit)/cell)]),width:unit,color});
        }
      }
      x+=advance(char)*unit;
    }
  }
  lineWord('SNAKES',.6,bodyWidth,0);
  lineWord("WE'RE ALL",-7.4,bodyWidth,6);
  // Split between complete adjacent stroke cells, never through overlapping caps.
  // Every initial cell belongs to exactly one snake; touching edges close letters.
  while(fragments.length<36){
    const index=fragments.reduce((best,f,i)=>f.squares.length>fragments[best].squares.length?i:best,0);
    const f=fragments[index],middle=Math.floor(f.squares.length/2);
    fragments.splice(index,1,{...f,squares:f.squares.slice(0,middle)},{...f,squares:f.squares.slice(middle)});
  }
  fragments.forEach(f=>{
    f.track=[f.squares[0]];
    for(const end of f.squares.slice(1)){
      let [x,z]=f.track.at(-1);
      while(x!==end[0]||z!==end[1]){x+=Math.sign(end[0]-x);z+=Math.sign(end[1]-z);f.track.push([x,z]);}
    }
    f.length=f.track.length;delete f.squares;
  });
  // Precomputed collision-free exits; regenerate with scripts/plan-snake-attract.mjs.
  const evacuation = ["D4,L3n,","L3r,","L4,D3n,","Uc,L3f,","D3r,","R4,D3n,","U4,R4,D3j,","D3r,","D3r,","D3r,","R4,U3n,","D3r,","L4,D3n,","D3r,","R4,D3n,","U4,R3n,","D3r,","L3r,","U4,L4,U4,L3f,","D4,L3n,","U2,L3p,","L4,Ue,L39,","D8,L3j,","R2,U4,L4,U3h,","L4,U3n,","U3r,","L4,U3n,","R4,Uc,R8,U33,","L4,U3n,","R6,U3l,","R2,U3p,","U3r,","D4,Ro,D4,R2v,","D4,L4,U3j,","R4,D4,R3j,","R3r,"];
  const schedules=fragments.map((f,i)=>{
    const times=[0];let progress=0;
    for(const run of evacuation[i].split(',').filter(Boolean)){
      const direction='RDLU'.indexOf(run[0]),count=parseInt(run.slice(1),36);
      for(let step=0;step<count;step++){
        if(direction>=0){const head=f.track.at(-1),d=directions[direction];f.track.push([head[0]+d[0],head[1]+d[1]]);progress++;}
        times.push(progress);
      }
    }
    return times;
  });
  const exitFrame=schedules[0].length-1;
  const exitAt=escapeAt+exitFrame*cell/escapeSpeed,returnAt=Math.max(13.2,exitAt+.8),duration=returnAt+1.8;
  const frames=Array.from({length:exitFrame+1},(_,frame)=>schedules.map(times=>times[frame]));
  function sample(seconds){
    // Retrace safe routes into the letters. Every vertex travels along its own
    // continuous track; the title is fully stationary before the camera rises.
    const arrival=1.15*(1-smooth(seconds/settleAt));
    const elapsed=(seconds<settleAt?arrival:Math.max(0,seconds-escapeAt))*escapeSpeed/cell;
    const frame=Math.min(frames.length-1,Math.floor(elapsed)),next=Math.min(frames.length-1,frame+1),fraction=elapsed-Math.floor(elapsed);
    return fragments.map((f,i)=>{
      const offset=mix(frames[frame][i],frames[next][i],fraction),step=Math.floor(offset),p=offset-step;
      const points=f.track.slice(step,step+f.length);
      if(p>1e-9){
        points[0]=lerp(f.track[step],f.track[step+1],p);
        points.push(lerp(f.track[step+f.length-1],f.track[Math.min(f.track.length-1,step+f.length)],p));
      }
      return points.map(point=>point.map(v=>v*cell));
    });
  }
  function draw(canvas,seconds){
    const ctx=canvas.getContext('2d');
    const t=((seconds%duration)+duration)%duration;
    ctx.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);
    ctx.fillStyle='#000';ctx.fillRect(0,0,800,600);
    const bodies=sample(t),heads=bodies.map(body=>body.at(-1));
    // Follow an arriving snake from ground level, with the mouse on clear ground.
    const returning=smooth((t-returnAt)/1.8);
    const head=(t<escapeAt?bodies:sample(settleAt))[0][0];
    const mouse=[-8.4,-1.2];
    let yaw=Math.atan2(mouse[0]-head[0],-(mouse[1]-head[1]));
    // Turn toward the bird's-eye orientation while climbing; no cut or crossfade.
    const rise=smooth((t-pullbackAt)/pullbackDuration);
    const reveal=rise*(1-returning);
    if(yaw>Math.PI)yaw-=Math.PI*2;
    yaw*=1-reveal;
    const pitch=mix(.22,Math.PI/2-.0001,reveal);
    const forward=[Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)];
    const right=[Math.cos(yaw),0,Math.sin(yaw)];
    const up=[Math.sin(yaw)*Math.sin(pitch),Math.cos(pitch),-Math.cos(yaw)*Math.sin(pitch)];
    const target=lerp([head[0]+Math.sin(yaw)*3.8,0,head[1]-Math.cos(yaw)*3.8],[0,0,-1],reveal);
    const distance=mix(3.8,35.5,reveal);
    const camera=target.map((v,i)=>v-forward[i]*distance);
    const focal=580,cy=mix(278,282,reveal);
    function view(p){
      const q=p.map((v,i)=>v-camera[i]);
      return [q.reduce((a,v,i)=>a+v*right[i],0),q.reduce((a,v,i)=>a+v*up[i],0),q.reduce((a,v,i)=>a+v*forward[i],0)];
    }
    function screen(p){return [400+p[0]*focal/p[2],cy-p[1]*focal/p[2]];}
    function segment(a,b,color,width=1){
      let av=view(a),bv=view(b);const near=.12;
      if(av[2]<near&&bv[2]<near)return;
      if(av[2]<near)av=lerp(av,bv,(near-av[2])/(bv[2]-av[2]));
      if(bv[2]<near)bv=lerp(bv,av,(near-bv[2])/(av[2]-bv[2]));
      const pa=screen(av),pb=screen(bv);
      ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...pa);ctx.lineTo(...pb);ctx.stroke();
    }
    function polygon(points,fill,stroke){
      let vs=points.map(view),clipped=[];
      for(let i=0;i<vs.length;i++){
        const a=vs[i],b=vs[(i+1)%vs.length];
        if(a[2]>=.12)clipped.push(a);
        if((a[2]>=.12)!==(b[2]>=.12))clipped.push(lerp(a,b,(.12-a[2])/(b[2]-a[2])));
      }
      if(!clipped.length)return;
      ctx.beginPath();clipped.map(screen).forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();
      if(fill){ctx.fillStyle=fill;ctx.fill();}
      if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
    }
    // One actual world grid survives the change in camera, down to the final still.
    const gridAlpha=mix(.67,.27,reveal);
    for(let i=-65;i<=65;i++){
      const major=i%5===0;
      segment([i,0,-65],[i,0,65],`rgba(30,100,137,${gridAlpha*(major?1:.48)})`,major?1:.65);
      segment([-65,0,i],[65,0,i],`rgba(30,100,137,${gridAlpha*(major?1:.48)})`,major?1:.65);
    }
    if(t<exitAt)bodies.forEach((body,i)=>{
      const f=fragments[i],points=[];
      // Keep each snake one uninterrupted rectangular line, including turns.
      for(let j=0;j<body.length;j++){
        const p=body[j],position=p;
        if(j>1&&j<body.length-1){
          const a=body[j-1],b=body[j+1];
          if(Math.abs((p[0]-a[0])*(b[1]-p[1])-(p[1]-a[1])*(b[0]-p[0]))<1e-9)continue;
        }
        points.push(position);
      }
      const r=f.width/2;
      for(let j=0;j<points.length-1;j++){
        const a=points[j],b=points[j+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
        if(length<.00001)continue;
        const nx=-dz/length*r,nz=dx/length*r;
        polygon([[a[0]+nx,.04,a[1]+nz],[b[0]+nx,.04,b[1]+nz],[b[0]-nx,.04,b[1]-nz],[a[0]-nx,.04,a[1]-nz]],f.color);
        polygon([[a[0]-r,.04,a[1]-r],[a[0]+r,.04,a[1]-r],[a[0]+r,.04,a[1]+r],[a[0]-r,.04,a[1]+r]],f.color);
      }
      const end=points.at(-1);
      polygon([[end[0]-r,.04,end[1]-r],[end[0]+r,.04,end[1]-r],[end[0]+r,.04,end[1]+r],[end[0]-r,.04,end[1]+r]],f.color);
    });
    ctx.globalAlpha=1;
    // Same .24s hard blink/.10s off as the original game's one-cell mouse.
    const cursorVisible=t<pullbackAt&&(t%.24)<.14;
    if(cursorVisible){
      const edge=offset=>[mouse[0]+right[0]*offset,mouse[1]+right[2]*offset];
      const a=edge(-.28),b=edge(.28);
      polygon([[a[0],.03,a[1]],[b[0],.03,b[1]],[b[0],.75,b[1]],[a[0],.75,a[1]]],'#efffea');
    }
    return {phase:t<pullbackAt?'hunt':t<pullbackAt+pullbackDuration?'pullback':t<escapeAt?'title':t<exitAt?'escape':t<returnAt?'clear':'return',reveal,cursorVisible,cursorHeight:.72,mouse,heads};
  }
  window.SnakeAttract={draw,duration,still,sample,bodyWidth,snakeCount:fragments.length,settleAt,escapeAt,exitAt,returnAt,pullbackAt,pullbackDuration,bodyWidths:fragments.map(f=>f.width)};
})();
