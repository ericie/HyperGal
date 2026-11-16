// A platform course opens into deep sky, flattens into a crowd, then rushes onward.
(() => {
  'use strict';
  const duration=22.4,still=17.5,flatAt=3.8,playAt=5.8,rushAt=12.8,titleAt=14.8;
  const C={sky:'#A9E4FF',haze:'#DDF6FF',white:'#FFFDFC',mint:'#B7E8D9',pink:'#EEA2A7',pinkShade:'#D97882',lilac:'#CBB9F0',ink:'#66507D',night:'#49385F',navy:'#26345E'};
  const clamp=n=>Math.max(0,Math.min(1,n)),mix=(a,b,p)=>a+(b-a)*p;
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const wrap=n=>{const t=n%duration;return t<0?t+duration:t;};
  const cloudFiles={bank:'onward-cloud-bank.d97eb745edf0.png',tower:'onward-cloud-tower.1a377d7948ef.png',wisps:'onward-cloud-wisps.b5a3a24b08aa.png'};
  const clouds={};let imagesReady=false,imagesFailed=false;
  const scriptURL=document.currentScript?.src||location.href;
  const ready=Promise.all(Object.entries(cloudFiles).map(([name,file])=>new Promise(resolve=>{
    const img=new Image();img.decoding='async';
    img.onload=()=>{clouds[name]=img;resolve(true);};img.onerror=()=>{imagesFailed=true;resolve(false);};
    img.src=new URL('assets/'+file,scriptURL).href;
  }))).then(results=>{imagesReady=results.every(Boolean);return imagesReady;});
  const hash=n=>{let x=Math.imul(n+101,1597334677);x^=x>>>16;return (x>>>0)/4294967296;};
  const platforms=Array.from({length:70},(_,row)=>Array.from({length:3},(_,lane)=>{
    const id=row*3+lane;
    return {id,row,lane,x:(lane-1)*252+Math.sin(row*1.71+lane*2)*65,y:row*96,z:row*112+lane*30,
      width:168+Math.floor(hash(id)*45),depth:74,type:id%5===2?'crumble':id%7===3?'moving':'solid'};
  })).flat();
  const byId=id=>platforms[id];
  const platformX=(p,t)=>p.x+(p.type==='moving'?Math.sin(t*.72+p.id)*20:0);
  const routes=Array.from({length:14},(_,id)=>{
    const row=id%6,platform=byId(row*3+id%3),nodes=[{platform:platform.id,offset:(hash(id+300)-.5)*70}];
    for(let step=1;step<38;step++){
      const prev=nodes.at(-1),from=byId(prev.platform),fromX=from.x+prev.offset;
      const choices=platforms.filter(p=>p.row===row+step).map(p=>{
        const direction=(step+id)%2?1:-1,desired=fromX+direction*(130+hash(id*91+step)*75);
        const x=Math.max(p.x-p.width/2+24,Math.min(p.x+p.width/2-24,desired));
        return {platform:p.id,offset:x-p.x,distance:Math.abs(x-fromX),score:Math.abs(Math.abs(x-fromX)-175)+(Math.sign(x-fromX)===direction?0:50)};
      }).filter(p=>p.distance<=218).sort((a,b)=>a.score-b.score);
      if(!choices.length)throw new Error('Unreachable Onward route');
      nodes.push({platform:choices[0].platform,offset:choices[0].offset});
    }
    return {id,nodes,wait:.25+(id%4)*.045,flight:.82,delay:id*.035,shape:id%3,
      color:'rgb('+[26,35,68].map((v,i)=>Math.round(v+([78,106,168][i]-v)*hash(id*9173))).join(',')+')'};
  });
  const gameCamera=t=>680+Math.max(0,t-playAt)*82;
  const titleY=gameCamera(rushAt)+210;
  function cameraState(t){
    const rise=ease(t/3.4),flat=ease((t-flatAt)/(playAt-flatAt)),rush=ease((t-rushAt)/(titleAt-rushAt));
    const zoom=mix(1,9,rush);
    const y=t<playAt?mix(-80,680,ease(t/playAt)):t<rushAt?gameCamera(t):titleY-210*(1-rush)/zoom;
    return {x:mix(-70,0,rise),y,z:mix(-560,-160,rise),pitch:mix(.28,.42,rise)*(1-flat),perspective:1-flat,
      zoom,flat,rush,opacity:ease(t/.55)*(1-ease((t-20.8)/1.6))};
  }
  function runnerState(route,t){
    const period=route.wait+route.flight,age=Math.max(0,t+route.delay),step=Math.min(route.nodes.length-2,Math.floor(age/period)),local=age-step*period;
    const a=route.nodes[step],b=route.nodes[step+1],from=byId(a.platform),to=byId(b.platform),launch=step*period+route.wait-route.delay;
    const p=clamp((local-route.wait)/route.flight),air=local>=route.wait;
    const ax=platformX(from,air?launch:t)+a.offset,bx=platformX(to,launch+route.flight)+b.offset;
    const vertical=(to.y-from.y)/route.flight+600*route.flight;
    return {id:route.id,shape:route.shape,color:route.color,phase:air?'jump':'stand',p,
      x:air?mix(ax,bx,p):ax,y:air?from.y+vertical*(p*route.flight)-600*(p*route.flight)**2:from.y,
      z:air?mix(from.z,to.z,p):from.z,from:from.id,to:to.id,facing:Math.sign(bx-ax)||1,
      squash:air?0:Math.exp(-local/.065)*.27};
  }
  function stateAt(seconds){
    const t=wrap(seconds);return {t,camera:cameraState(t),runners:routes.map(r=>runnerState(r,t)),
      phase:t<flatAt?'rise':t<playAt?'flatten':t<rushAt?'crowd':t<titleAt?'rush':'title'};
  }
  const glyphs={
    O:{round:true},
    N:{outer:[[0,0],[1.6,0],[3.4,4.2],[3.4,0],[5,0],[5,7],[3.4,7],[1.6,2.8],[1.6,7],[0,7]]},
    W:{outer:[[0,0],[1.5,0],[2,4.7],[2.5,2.5],[3,4.7],[3.5,0],[5,0],[4.2,7],[2.9,7],[2.5,5.4],[2.1,7],[.8,7]]},
    A:{outer:[[0,7],[1.2,0],[3.8,0],[5,7],[3.4,7],[3.1,5.6],[1.9,5.6],[1.6,7]],holes:[[[2.5,2],[2,4.2],[3,4.2]]]},
    R:{outer:[[0,0],[4,0],[5,1],[5,3.6],[4,4.2],[5,7],[3.2,7],[2,4.5],[1.6,4.5],[1.6,7],[0,7]],holes:[[[1.6,1.5],[3.1,1.5],[3.4,1.8],[3.4,2.8],[3.1,3.1],[1.6,3.1]]]},
    D:{outer:[[0,0],[3.3,0],[5,1.6],[5,5.4],[3.3,7],[0,7]],holes:[[[1.6,1.5],[3,1.5],[3.5,2],[3.5,5],[3,5.5],[1.6,5.5]]]},
    U:{outer:[[0,0],[1.6,0],[1.6,4.9],[2.2,5.5],[2.8,5.5],[3.4,4.9],[3.4,0],[5,0],[5,5.7],[3.7,7],[1.3,7],[0,5.7]]},
    P:{outer:[[0,0],[4,0],[5,1],[5,3.6],[4,4.6],[1.6,4.6],[1.6,7],[0,7]],holes:[[[1.6,1.5],[3.1,1.5],[3.4,1.8],[3.4,2.8],[3.1,3.1],[1.6,3.1]]]}
  };
  function draw(canvas,seconds){
    if(!imagesReady)return {ready:false,failed:imagesFailed};
    const s=stateAt(seconds),t=s.t,cam=s.camera,ctx=canvas.getContext('2d');
    ctx.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);ctx.globalAlpha=1;
    const sky=ctx.createLinearGradient(0,0,0,600);sky.addColorStop(0,'#8EDBFA');sky.addColorStop(.56,C.sky);sky.addColorStop(1,'#C9F0FF');ctx.fillStyle=sky;ctx.fillRect(0,0,800,600);
    const drift=Math.sin(t/duration*Math.PI*2);
    function cloud(img,x,y,w,alpha=1){
      const h=w*(img.naturalHeight||img.height)/(img.naturalWidth||img.width);
      ctx.globalAlpha=alpha;ctx.drawImage(img,Math.round(x-w/2),Math.round(y-h/2),Math.round(w),Math.round(h));ctx.globalAlpha=1;
    }
    cloud(clouds.wisps,350+drift*15,145,980,.58);
    cloud(clouds.tower,880-drift*20,430,530,.83);
    cloud(clouds.bank,350+drift*25,645,1000,.92);
    ctx.save();ctx.globalAlpha=cam.opacity;
    const sin=Math.sin(cam.pitch),cos=Math.cos(cam.pitch),focal=800*cam.zoom,courseOpacity=1-ease((cam.rush-.4)/.5);
    function view(x,y,z){
      const dy=y-cam.y,dz=z-cam.z,depth=dy*sin+dz*cos;
      return [x-cam.x,dy*cos-dz*sin,mix(800,depth,cam.perspective)];
    }
    const screen=p=>[400+p[0]*focal/p[2],300-p[1]*focal/p[2]];
    function project(x,y,z){const p=view(x,y,z);return p[2]>35?{point:screen(p),scale:focal/p[2],depth:p[2]}:null;}
    function poly(points,fill,stroke,alpha=1){
      const vs=points.map(p=>view(...p)),clipped=[];
      for(let i=0;i<vs.length;i++){
        const a=vs[i],b=vs[(i+1)%vs.length];if(a[2]>=35)clipped.push(a);
        if((a[2]>=35)!==(b[2]>=35)){const p=(35-a[2])/(b[2]-a[2]);clipped.push(a.map((v,j)=>mix(v,b[j],p)));}
      }
      if(clipped.length<3)return;const ps=clipped.map(screen);
      if(ps.every(p=>p[0]<-10)||ps.every(p=>p[0]>810)||ps.every(p=>p[1]<-10)||ps.every(p=>p[1]>610))return;
      ctx.globalAlpha=cam.opacity*alpha*courseOpacity;ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();
      ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=Math.min(3,Math.max(.5,cam.zoom*1.5));ctx.lineJoin='round';ctx.stroke();}
      ctx.globalAlpha=cam.opacity;
    }
    function platform(p){
      if(!courseOpacity)return;
      const x=platformX(p,t)-p.width/2,y=p.y,z=p.z,d=p.depth,w=p.width;
      const depth=view(x+w/2,y,z)[2],haze=mix(1,.14,clamp((depth-900)/5000)*cam.perspective);
      const face=p.type==='crumble'?C.pink:p.type==='moving'?C.lilac:C.mint;
      const shade=p.type==='crumble'?C.pinkShade:p.type==='moving'?'#a68dce':'#86b9b2';
      if(p.type==='crumble'){
        const n=Math.max(4,Math.round(w/23));
        for(let i=0;i<n;i++){
          const xx=x+i*w/n+.8,ww=w/n-1.6;
          poly([[xx,y,z-d/2],[xx+ww,y,z-d/2],[xx+ww,y-16,z-d/2],[xx,y-16,z-d/2]],i%2?shade:face,C.ink,haze);
        }
      }else poly([[x,y,z-d/2],[x+w,y,z-d/2],[x+w,y-14,z-d/2],[x,y-14,z-d/2]],face,C.ink,haze);
      const plane=cam.y>y?y:y-14;
      poly([[x,plane,z-d/2],[x+w,plane,z-d/2],[x+w,plane,z+d/2],[x,plane,z+d/2]],cam.y>y?face:shade,C.ink,haze);
      poly([[x+w,y,z-d/2],[x+w,y,z+d/2],[x+w,y-14,z+d/2],[x+w,y-14,z-d/2]],shade,C.ink,haze);
    }
    function runner(r){
      if(!courseOpacity)return;
      const p=project(r.x,r.y,r.z);if(!p||p.scale<.055||p.point[0]<-100||p.point[0]>900||p.point[1]<-100||p.point[1]>800)return;
      const alpha=mix(1,.25,clamp((p.depth-900)/5000)*cam.perspective);
      ctx.save();ctx.globalAlpha=cam.opacity*alpha*courseOpacity;ctx.translate(...p.point);ctx.scale(p.scale*.8*r.facing*(1+r.squash*.7),p.scale*.8*(1-r.squash));
      const gait=Math.sin(t*13+r.id),rising=r.phase==='jump'&&r.p<.55;
      ctx.strokeStyle=r.color;ctx.lineWidth=5;ctx.lineCap='round';
      for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*5,-17);ctx.lineTo(side*(r.phase==='jump'?9:6+gait*3),rising?-8:-3);ctx.lineTo(side*10,rising?-5:0);ctx.stroke();}
      ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-14,-29);ctx.lineTo(-22,-25-(rising?5:gait*2));ctx.moveTo(14,-29);ctx.lineTo(22,-25-(rising?3:-gait*2));ctx.stroke();
      ctx.fillStyle=r.color;ctx.beginPath();
      if(r.shape===1){
        ctx.moveTo(-1,-46);ctx.bezierCurveTo(-11.5,-46,-19.2,-38.5,-19.2,-29);ctx.bezierCurveTo(-19.2,-19.4,-12,-11.8,-1.5,-11.8);ctx.bezierCurveTo(8.8,-11.8,17.8,-19.6,17.8,-29.5);ctx.bezierCurveTo(17.8,-39.2,9,-46,-1,-46);
      }else if(r.shape===2){
        ctx.moveTo(-3.5,-39.8);ctx.quadraticCurveTo(-12.4,-29,-15,-17.6);ctx.quadraticCurveTo(-19.2,-13.4,-11.5,-12.8);ctx.quadraticCurveTo(-.5,-9,10.5,-12.8);ctx.quadraticCurveTo(18.2,-13.4,14,-18);ctx.quadraticCurveTo(13,-29,6.5,-39.4);ctx.quadraticCurveTo(2,-45.6,-3.5,-39.8);
      }else{
        ctx.moveTo(-10,-44.6);ctx.quadraticCurveTo(0,-49,9,-45.6);ctx.quadraticCurveTo(16,-45.5,16.9,-38.5);ctx.quadraticCurveTo(21.5,-31,17.7,-23);ctx.quadraticCurveTo(18,-16,11,-15.4);ctx.quadraticCurveTo(-.5,-11.3,-12,-14.8);ctx.quadraticCurveTo(-19,-15,-18.4,-22);ctx.quadraticCurveTo(-22,-30,-17.6,-37.5);ctx.quadraticCurveTo(-17,-44,-10,-44.6);
      }
      ctx.closePath();ctx.fill();
      const eyes=r.shape===2?[-.8,4.4]:[1,6.8],eyeY=r.shape===2?-32.8:-37;
      for(const x of eyes){ctx.fillStyle=C.white;ctx.beginPath();ctx.ellipse(x,eyeY,2.35,2.95,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#141A2E';ctx.beginPath();ctx.ellipse(x+.55,eyeY+.25,1.05,1.55,0,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
    const items=platforms.map(p=>({kind:'platform',value:p,depth:view(p.x,p.y,p.z)[2]})).concat(s.runners.map(r=>({kind:'runner',value:r,depth:view(r.x,r.y,r.z)[2]})));
    items.sort((a,b)=>cam.flat>.999?(a.kind===b.kind?b.depth-a.depth:a.kind==='platform'?-1:1):b.depth-a.depth);
    for(const item of items)if(item.kind==='platform')platform(item.value);else runner(item.value);
    if(t>=playAt){
      const sign=project(0,titleY,1800);
      if(sign){
        const [x,y]=sign.point,scale=sign.scale;
        if(y>-700&&y<1200){
          ctx.globalAlpha=cam.opacity;const width=180*scale,height=width*(clouds.bank.naturalHeight||clouds.bank.height)/(clouds.bank.naturalWidth||clouds.bank.width);
          ctx.drawImage(clouds.bank,x-width/2,y-height*.25,width,height);
          ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle=C.navy;
          function path(points){points.forEach(([xx,yy],i)=>i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy));ctx.closePath();}
          function word(value,yy){
            [...value].forEach((char,i)=>{ctx.save();ctx.translate(-35+i*12,yy);ctx.scale(2,2);ctx.beginPath();const g=glyphs[char];
              if(g.round){ctx.roundRect(0,0,5,7,1.2);ctx.roundRect(1.6,1.5,1.8,4,.4);}else{path(g.outer);for(const hole of g.holes||[])path(hole);}
              ctx.fill('evenodd');ctx.restore();});
          }
          word('ONWARD',-25);word('UPWARD',11);
          ctx.save();ctx.translate(-3.75,-5.25);ctx.scale(1.5,1.5);ctx.strokeStyle=C.navy;ctx.lineWidth=1.35;ctx.lineCap='round';ctx.lineJoin='round';
          ctx.beginPath();ctx.moveTo(4.9,6.5);ctx.lineTo(1.4,3.1);ctx.bezierCurveTo(-.1,1.6,1,-.1,2.5,.4);ctx.bezierCurveTo(4.4,1,3.6,2.6,1.6,3.7);ctx.bezierCurveTo(-1.6,5.5,.9,8.1,3.1,6.1);ctx.lineTo(4.8,3.8);ctx.stroke();ctx.restore();ctx.restore();
        }
      }
    }
    ctx.restore();
    return {...s,ready:true,platformCount:platforms.length,titleLines:['ONWARD','&','UPWARD'],titleY};
  }
  window.OnwardAttract={draw,ready,stateAt,cameraState,runnerState,duration,still,flatAt,playAt,rushAt,titleAt,platforms,routes,titleY,cloudFiles};
})();
