// A ground-level hunt becomes a word made from the same snake paths.
(() => {
  'use strict';
  const duration=22,still=15;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
  const mix=(a,b,p)=>a+(b-a)*p;
  const lerp=(a,b,p)=>a.map((v,i)=>mix(v,b[i],p));
  const letters=[
    [[4,0],[0,0],[0,3.5],[4,3.5],[4,7],[0,7]],
    [[0,7],[0,0],[4,7],[4,0]],
    [[0,7],[0,0],[4,0],[4,7],[4,3.5],[0,3.5]],
    [[0,0],[0,7],[0,3.5],[4,0],[0,3.5],[4,7]],
    [[4,0],[0,0],[0,7],[4,7],[0,7],[0,3.5],[3,3.5]],
    [[4,0],[0,0],[0,3.5],[4,3.5],[4,7],[0,7]],
    [[0,0],[0,4.7]]
  ];
  letters[0].reverse();
  const snakes=letters.map((path,i)=>{
    const points=path.map(([x,z])=>[x+i*6-18,z-3.5]);
    const spans=points.slice(1).map((p,j)=>Math.hypot(p[0]-points[j][0],p[1]-points[j][1]));
    return {points,spans,length:spans.reduce((a,b)=>a+b,0),color:i%2?'#c5f637':'#55ece2'};
  });
  function along(s,d){
    d=Math.max(0,Math.min(s.length,d));
    for(let i=0;i<s.spans.length;i++){
      if(d<=s.spans[i])return lerp(s.points[i],s.points[i+1],d/s.spans[i]);
      d-=s.spans[i];
    }
    return s.points.at(-1);
  }
  function route(s,limit){
    const points=[s.points[0]];let distance=0;
    for(let i=0;i<s.spans.length;i++){
      if(distance+s.spans[i]>=limit){points.push(along(s,limit));break;}
      points.push(s.points[i+1]);distance+=s.spans[i];
    }
    return points;
  }
  function draw(canvas,seconds){
    const ctx=canvas.getContext('2d');
    const t=((seconds%duration)+duration)%duration;
    ctx.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);
    ctx.fillStyle='#000';ctx.fillRect(0,0,800,600);
    // The chase runs along the first S. Other snakes write their own paths nearby.
    const returning=smooth((t-19.5)/2.5);
    const chase=clamp(t/10.8)*(1-returning),headDistance=mix(1.4,snakes[0].length,chase);
    const head=along(snakes[0],headDistance);
    const ahead=along(snakes[0],Math.min(snakes[0].length,headDistance+1.1));
    const behind=along(snakes[0],Math.max(0,headDistance-.9));
    let yaw=Math.atan2(ahead[0]-behind[0],-(ahead[1]-behind[1]));
    // Turn toward the bird's-eye orientation while climbing; no cut or crossfade.
    const rise=smooth((t-6)/6);
    const reveal=rise*(1-returning);
    if(yaw>Math.PI)yaw-=Math.PI*2;
    yaw*=1-reveal;
    const pitch=mix(.105,Math.PI/2-.0001,reveal);
    const forward=[Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)];
    const right=[Math.cos(yaw),0,Math.sin(yaw)];
    const up=[Math.sin(yaw)*Math.sin(pitch),Math.cos(pitch),-Math.cos(yaw)*Math.sin(pitch)];
    const target=lerp([head[0]+Math.sin(yaw)*3.8,0,head[1]-Math.cos(yaw)*3.8],[1,0,0],reveal);
    const distance=mix(3.8,34,reveal);
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
    const growth=mix(clamp(.12+t/11.6),.12,returning);
    snakes.forEach((s,index)=>{
      const limit=index===0?mix(headDistance,s.length,reveal):s.length*growth;
      const path=route(s,limit);
      for(let j=0;j<path.length-1;j++){
        const a=path[j],b=path[j+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
        if(len<.001)continue;
        const nx=-dz/len*.21,nz=dx/len*.21;
        const points=[[a[0]+nx,.035,a[1]+nz],[b[0]+nx,.035,b[1]+nz],[b[0]-nx,.035,b[1]-nz],[a[0]-nx,.035,a[1]-nz]];
        polygon(points,s.color,s.color);
        // Light-cycle ribbon walls are flat wireframes, disappearing at overhead.
        const wall=.64*(1-reveal);
        if(wall>.02&&index!==0){
          polygon([[a[0],0,a[1]],[b[0],0,b[1]],[b[0],wall,b[1]],[a[0],wall,a[1]]],index%2?'#14320d80':'#08433e80');
          segment([a[0],wall,a[1]],[b[0],wall,b[1]],s.color,1.4);
        }
      }
      // The heads and tiny black eyes identify the strokes as living snakes.
      const p=along(s,limit),back=along(s,Math.max(0,limit-.3));
      const angle=Math.atan2(p[1]-back[1],p[0]-back[0]);
      const headPoint=(x,z)=>[p[0]+Math.cos(angle)*x-Math.sin(angle)*z,.075,p[1]+Math.sin(angle)*x+Math.cos(angle)*z];
      if(index!==0||reveal>.12){
        polygon([headPoint(-.3,-.29),headPoint(.35,-.29),headPoint(.35,.29),headPoint(-.3,.29)],s.color);
        for(const side of [-1,1])polygon([headPoint(.12,side*.14-.055),headPoint(.24,side*.14-.055),headPoint(.24,side*.14+.055),headPoint(.12,side*.14+.055)],'#001916');
      }
    });
    // The dot belongs to the exclamation snake; it shares the ground plane.
    if(growth>.85)polygon([[17.72,.04,2.7],[18.28,.04,2.7],[18.28,.04,3.3],[17.72,.04,3.3]],'#55ece2');
    const mouseDistance=Math.min(snakes[0].length,headDistance+2.1);
    const mouse=along(snakes[0],mouseDistance);
    const mouseBack=along(snakes[0],Math.max(0,mouseDistance-.2));
    const ma=Math.atan2(mouse[1]-mouseBack[1],mouse[0]-mouseBack[0]);
    const mp=(x,z)=>[mouse[0]+Math.cos(ma)*x-Math.sin(ma)*z,.13,mouse[1]+Math.sin(ma)*x+Math.cos(ma)*z];
    // Authored integer silhouette: pointed nose, two ears, and a kinked tail.
    const shape=[[-.35,-.18],[-.12,-.18],[-.12,-.32],[.10,-.32],[.10,-.18],[.32,-.11],[.46,0],[.32,.11],[.10,.18],[.10,.32],[-.12,.32],[-.12,.18],[-.35,.18]];
    if(chase<.99){
      polygon(shape.map(([x,z])=>mp(x,z)),'#ff826b');
      segment(mp(-.35,0),mp(-.65,0),'#ff826b',2);
      segment(mp(-.65,0),mp(-.78,-.18),'#ff826b',2);
      polygon([mp(.18,-.08),mp(.25,-.08),mp(.25,0),mp(.18,0)],'#000');
    }
    // A constant play message remains outside the moving field.
    ctx.fillStyle='#000';ctx.fillRect(210,532,380,68);
    const glyphs={
      '0':[[[0,0],[3,0],[3,5],[0,5],[0,0]]],
      '¢':[[[3,1],[0,1],[0,4],[3,4]],[[1.5,0],[1.5,5]]],
      T:[[[0,0],[4,0]],[[2,0],[2,5]]],O:[[[0,0],[3,0],[3,5],[0,5],[0,0]]],
      P:[[[0,5],[0,0],[3,0],[3,2.5],[0,2.5]]],L:[[[0,0],[0,5],[3,5]]],
      A:[[[0,5],[0,0],[3,0],[3,5]],[[0,2.5],[3,2.5]]],Y:[[[0,0],[1.5,2.5],[3,0]],[[1.5,2.5],[1.5,5]]]
    };
    ctx.strokeStyle='#d6e9db';ctx.lineWidth=2;ctx.lineJoin='miter';ctx.lineCap='butt';
    const text='0¢ TO PLAY',unit=6,advance=27,start=400-(text.length*advance-8)/2;
    [...text].forEach((char,i)=>(glyphs[char]||[]).forEach(path=>{ctx.beginPath();path.forEach(([x,y],j)=>j?ctx.lineTo(start+i*advance+x*unit,552+y*unit):ctx.moveTo(start+i*advance+x*unit,552+y*unit));ctx.stroke();}));
    return {phase:t<6?'hunt':t<12?'pullback':t<19.5?'word':'return',reveal,mouseVisible:chase<.99};
  }
  window.SnakeAttract={draw,duration,still};
})();
