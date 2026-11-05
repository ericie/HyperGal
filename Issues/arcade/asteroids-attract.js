// Twenty seconds of vector parts assembling into letters. No bitmap frames or simulation.
(() => {
  const duration=20, still=11, TAU=Math.PI*2;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const mix=(a,b,p)=>a+(b-a)*p;
  const wrap=(n,m)=>((n%m)+m)%m;
  const glyphs={
    A:[[[0,6],[0,2],[2,0],[4,2],[4,6]],[[0,3],[4,3]]],
    S:[[[4,0],[0,0],[0,3],[4,3],[4,6],[0,6]]],
    T:[[[0,0],[4,0]],[[2,0],[2,6]]],
    E:[[[4,0],[0,0],[0,6],[4,6]],[[0,3],[3,3]]],
    R:[[[0,6],[0,0],[3,0],[4,1],[4,2],[3,3],[0,3]],[[2,3],[4,6]]],
    O:[[[1,0],[3,0],[4,1],[4,5],[3,6],[1,6],[0,5],[0,1],[1,0]]],
    I:[[[0,0],[4,0]],[[2,0],[2,6]],[[0,6],[4,6]]],
    D:[[[0,0],[2,0],[4,2],[4,4],[2,6],[0,6],[0,0]]],
    M:[[[0,6],[0,0],[2,3],[4,0],[4,6]]],
    B:[[[0,0],[3,0],[4,1],[4,2],[3,3],[0,3],[3,3],[4,4],[4,5],[3,6],[0,6],[0,0]]],
    L:[[[0,0],[0,6],[4,6]]]
  };
  const parts=[];
  function word(text,x,y,width,height,row){
    const unit=width/(text.length*5.6-1.6), sy=height/6;
    [...text].forEach((letter,i)=>(glyphs[letter]||[]).forEach((stroke,s)=>{
      const points=stroke.map(([a,b])=>[x+(i*5.6+a)*unit,y+b*sy]);
      const group=1+(i+s+row)%3;
      for(let j=0;j<points.length-1;j+=group){
        const path=points.slice(j,Math.min(points.length,j+group+1));
        const index=parts.length, seed=index*1.731+row*9.17;
        const hinged=index%3!==0;
        const vertices=[path[0]];
        for(let k=1;k<path.length;k++){
          if(hinged)vertices.push([(path[k-1][0]+path[k][0])/2,(path[k-1][1]+path[k][1])/2]);
          vertices.push(path[k]);
        }
        const edges=vertices.slice(1).map((p,k)=>({
          length:Math.hypot(p[0]-vertices[k][0],p[1]-vertices[k][1]),
          angle:Math.atan2(p[1]-vertices[k][1],p[0]-vertices[k][0])
        }));
        const start=-.8+row*1.05+i*.245+s*.14+(j/group)*.2+(index%4)*.07;
        const margin=index%5===0?30:160+(index%5)*33, side=index%4;
        const acrossX=45+(Math.sin(seed*2.21)*.5+.5)*710,acrossY=45+(Math.cos(seed*1.63)*.5+.5)*510;
        const origin=side===0?[-margin,acrossY]:side===1?[800+margin,acrossY]:side===2?[acrossX,-margin]:[acrossX,600+margin];
        const center=path.reduce((sum,p)=>[sum[0]+p[0]/path.length,sum[1]+p[1]/path.length],[0,0]);
        const blastAngle=Math.atan2((center[1]-260)*2.4,center[0]-400)+Math.sin(seed*3.8)*.36;
        parts.push({edges,target:path[0],hinged,seed,start,travel:2.25+(index%4)*.16,
          origin,blastAngle,blastSpeed:360+(index%7)*55,blastSpin:(index%2?1:-1)*(2.6+index%5*1.3),
          rotation:Math.sin(seed*4.3)*2.2,gap:[Math.cos(seed)*8,Math.sin(seed)*8]});
      }
    }));
  }
  word('ASTEROIDS',75,183,650,66,0);
  word('ASSEMBLE',113,278,574,53,1);
  const rocks=Array.from({length:6},(_,i)=>Array.from({length:11},(_,j)=>{
    const a=j/11*TAU,r=.82+Math.sin(j*9.23+i*4.72)*.16+(j%3)*.055;
    return[Math.cos(a)*r,Math.sin(a)*r];
  }));
  const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
  const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
  function span(shape,y){
    const xs=[];
    for(let i=0;i<shape.length;i++){
      const a=shape[i],b=shape[(i+1)%shape.length];
      if(y<Math.min(a[1],b[1])-1e-7||y>Math.max(a[1],b[1])+1e-7)continue;
      if(Math.abs(b[1]-a[1])<1e-7){xs.push(a[0],b[0]);continue;}
      xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
    }
    return xs.length?[Math.min(...xs),Math.max(...xs)]:null;
  }
  const clusters=Array.from({length:3},(_,pair)=>{
    const aRadius=49+pair*14,bRadius=42+pair*11;
    const a=rocks[pair*2].map(([x,y])=>[x*aRadius,y*aRadius]);
    const b=rocks[pair*2+1].map(([x,y])=>[x*bRadius,y*bRadius]);
    let distance=-Infinity;
    for(const y of [...a,...b].map(p=>p[1])){
      const left=span(a,y),right=span(b,y);if(!left||!right)continue;
      const separation=left[1]-right[0];
      if(separation>distance)distance=separation;
    }
    return {a,b,distance};
  });
  function inside(p,polygon){
    let hit=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const a=polygon[i],b=polygon[j];
      if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;
    }
    return hit;
  }
  // Split at intersections, keeping only external edges: merged rocks lose their inner seams.
  function boundary(a,b){
    const lines=[];
    for(let i=0;i<a.length;i++){
      const p=a[i],q=a[(i+1)%a.length],r=sub(q,p),cuts=[0,1];
      for(let j=0;j<b.length;j++){
        const u=b[j],v=b[(j+1)%b.length],s=sub(v,u),den=cross(r,s);
        if(Math.abs(den)<1e-8)continue;
        const d=sub(u,p),t=cross(d,s)/den,z=cross(d,r)/den;
        if(t>0&&t<1&&z>=0&&z<=1)cuts.push(t);
      }
      cuts.sort((x,y)=>x-y);
      for(let j=0;j<cuts.length-1;j++){
        const lo=cuts[j],hi=cuts[j+1],mid=(lo+hi)/2;
        if(!inside([p[0]+r[0]*mid,p[1]+r[1]*mid],b))
          lines.push([[p[0]+r[0]*lo,p[1]+r[1]*lo],[p[0]+r[0]*hi,p[1]+r[1]*hi]]);
      }
    }
    return lines;
  }
  function asteroidPair(pair,time){
    const phase=wrap(time+pair*duration/3,duration),cluster=clusters[pair];
    const x=-180+phase*58,y=112+pair*168+Math.sin(phase*.22+pair)*30;
    const separation=cluster.distance+mix(72,-cluster.distance*.28,ease((phase-3.8)/2.8));
    const angle=phase*.035,spin=phase*.07*(1-ease((phase-3.4)/2));
    const project=(px,py)=>[x+px*Math.cos(angle)-py*Math.sin(angle),y+px*Math.sin(angle)+py*Math.cos(angle)];
    const polygon=(shape,offset,rotation)=>shape.map(([a,b])=>project(a*Math.cos(rotation)-b*Math.sin(rotation)+offset,a*Math.sin(rotation)+b*Math.cos(rotation)));
    return {a:polygon(cluster.a,-separation/2,spin),b:polygon(cluster.b,separation/2,-spin),centers:[project(-separation/2,0),project(separation/2,0)]};
  }
  function inFrame(points){
    return Math.max(...points.map(p=>p[0]))>=0&&Math.min(...points.map(p=>p[0]))<=800&&Math.max(...points.map(p=>p[1]))>=0&&Math.min(...points.map(p=>p[1]))<=600;
  }
  // Shards are wedges of the actual asteroid polygons, not extra explosion graphics.
  const rockFragments=[];
  for(let pair=0;pair<3;pair++){
    const state=asteroidPair(pair,14.6);
    [state.a,state.b].forEach((polygon,body)=>{
      for(let first=0;first<polygon.length;first+=4){
        const points=[state.centers[body],...Array.from({length:Math.min(4,polygon.length-first)+1},(_,j)=>polygon[(first+j)%polygon.length])];
        if(!inFrame(points))continue;
        const center=points.reduce((sum,p)=>[sum[0]+p[0]/points.length,sum[1]+p[1]/points.length],[0,0]);
        const index=rockFragments.length;
        const angle=Math.atan2(center[1]-state.centers[body][1],center[0]-state.centers[body][0])+Math.sin(index*2.7)*.2;
        rockFragments.push({center,points:points.map(p=>sub(p,center)),angle,speed:320+index%5*37,spin:(index%2?1:-1)*(1.2+index%4*.6)});
      }
    });
  }
  function draw(canvas,time=still){
    const c=canvas.getContext('2d',{alpha:false}),t=wrap(time,duration);
    c.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);
    c.globalAlpha=1;c.globalCompositeOperation='source-over';c.shadowBlur=0;
    c.fillStyle='#000';c.fillRect(0,0,800,600);c.lineCap='round';c.lineJoin='round';
    function path(points,color,width,alpha=1){
      c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
      c.strokeStyle=color;c.lineWidth=width;c.globalAlpha=alpha;c.stroke();
    }
    const exploding=t>=14.6&&t<18.5,clock=t>=18.5?t-duration:t;
    let visibleParts=0,visibleAsteroidFragments=0;
    if(exploding){
      const age=t-14.6;
      for(const fragment of rockFragments){
        const distance=fragment.speed*age+40*age*age,rotation=fragment.spin*age;
        const x=fragment.center[0]+Math.cos(fragment.angle)*distance,y=fragment.center[1]+Math.sin(fragment.angle)*distance;
        const points=fragment.points.map(([a,b])=>[x+a*Math.cos(rotation)-b*Math.sin(rotation),y+a*Math.sin(rotation)+b*Math.cos(rotation)]);
        if(!inFrame(points))continue;
        visibleAsteroidFragments++;path([...points,points[0]],'#b8d5c7',.95,.4);
      }
    }else{
      // Plain outlines coalesce; their internal overlap edges are never drawn.
      const alpha=t>=18.5?ease((t-18.5)/1.5):1;
      for(let pair=0;pair<3;pair++){
        const {a,b}=asteroidPair(pair,t);
        for(const line of [...boundary(a,b),...boundary(b,a)])path(line,'#b8d5c7',.95,.4*alpha);
      }
    }
    // A ballistic burst replaces reversal: fragments tumble out of the frame and stay out.
    for(let index=0;index<parts.length;index++){
      const p=parts[index],progress=exploding?1:clamp((clock-p.start)/p.travel);
      const approach=ease(progress/.78),lock=ease((progress-.82)/.18);
      const drift=1-approach,arc=Math.sin(approach*Math.PI);
      let x=mix(p.origin[0],p.target[0],approach)+p.gap[0]*approach*(1-lock)+Math.sin(p.seed)*arc*45+Math.sin(TAU*t/duration+p.seed)*6*drift;
      let y=mix(p.origin[1],p.target[1],approach)+p.gap[1]*approach*(1-lock)+Math.cos(p.seed)*arc*35+Math.cos(TAU*t/duration+p.seed)*6*drift;
      let rotation=p.rotation*(1-ease(progress/.8));
      const fold=p.hinged?(1-ease((progress-.18)/.76))*1.25:0;
      const since=clock-p.start-p.travel,impact=!exploding&&since>=0&&since<.4?Math.exp(-since*12):0;
      if(exploding){const age=t-14.6,distance=p.blastSpeed*age+60*age*age;x+=Math.cos(p.blastAngle)*distance;y+=Math.sin(p.blastAngle)*distance;rotation=p.blastSpin*age;}
      const points=[[0,0]];
      p.edges.forEach((edge,j)=>{
        const angle=edge.angle+fold*Math.sin(p.seed+j*2.12)*(j%2?-.95:1);
        const last=points.at(-1);points.push([last[0]+Math.cos(angle)*edge.length,last[1]+Math.sin(angle)*edge.length]);
      });
      const cos=Math.cos(rotation),sin=Math.sin(rotation),world=points.map(([a,b])=>[x+a*cos-b*sin,y+a*sin+b*cos]);
      if(!inFrame(world))continue;
      visibleParts++;
      c.save();c.translate(x+impact*Math.sin(since*28)*1.2,y);c.rotate(rotation);
      path(points,p.hinged&&progress<.98?'#d3ffdc':'#f0fff6',2.05+impact*.8);
      // Brief close-set jaws show the local mechanical clamp, then disappear.
      if(impact>.08){
        const end=points.at(-1),gap=2+impact*5;
        path([[end[0]-3,end[1]-gap],[end[0]+3,end[1]-gap]],'#ff775c',1,impact);
        path([[end[0]-3,end[1]+gap],[end[0]+3,end[1]+gap]],'#ff775c',1,impact);
      }
      c.restore();
    }
    c.globalAlpha=1;return {visibleParts,totalParts:parts.length,visibleAsteroidFragments,exploding};
  }
  window.AsteroidsAttract={draw,duration,still};
})();
