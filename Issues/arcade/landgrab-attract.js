// A cheerful lunar city rises from foundations under working construction cranes.
(() => {
  'use strict';
  const duration=23.4,still=18,titleAt=14.8,panAt=19.4,ground=254;
  const C={black:'#000000',white:'#ffffff',cyan:'#00a4bc',blue:'#1024ff',green:'#00d950',shade:'#00a000',peach:'#ffa65c',earth:'#bf7838',yellow:'#dce000'};
  const clamp=n=>Math.max(0,Math.min(1,n)),mix=(a,b,p)=>a+(b-a)*p;
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const wrap=n=>{const t=n%duration;return t<0?t+duration:t;};
  // Low pressure habitats, service modules and observatories in two depth planes.
  const buildings=[
    {id:'habitat',x:12,width:74,base:244,height:80,style:'barrel',start:.2,buildFor:4.4},
    {id:'command',x:108,width:72,base:244,height:102,style:'dome',start:2.2,buildFor:4.8},
    {id:'laboratory',x:202,width:72,base:244,height:74,style:'pods',start:4.6,buildFor:4.4},
    {id:'observatory',x:300,width:82,base:244,height:106,style:'dish',start:6.4,buildFor:5},
    {id:'hangar',x:20,width:82,base:260,height:48,style:'hangar',start:1,buildFor:3.8},
    {id:'greenhouse',x:122,width:72,base:260,height:43,style:'greenhouse',start:3.2,buildFor:4.1},
    {id:'power',x:216,width:76,base:260,height:45,style:'solar',start:5.4,buildFor:4},
    {id:'airlock',x:314,width:66,base:260,height:48,style:'airlock',start:7.4,buildFor:4.3}
  ];
  const glyphs={
    A:['01110','11011','11011','11111','11011','11011','11011'],
    B:['11110','11011','11011','11110','11011','11011','11110'],
    D:['11110','11011','11011','11011','11011','11011','11110'],
    G:['01111','11000','11000','11011','11011','11011','01110'],
    L:['11000','11000','11000','11000','11000','11000','11111'],
    N:['11001','11101','11101','11011','11011','11011','11001'],
    R:['11110','11011','11011','11110','11100','11010','11011'],
    U:['11011','11011','11011','11011','11011','11011','01110']
  };
  function stateAt(seconds){
    const t=wrap(seconds),pan=400*ease((t-panAt)/(duration-panAt));
    const structures=buildings.map(b=>{
      const progress=clamp((t-b.start)/b.buildFor),height=Math.floor(b.height*ease(progress)/6)*6;
      return {...b,progress,builtHeight:progress===1?b.height:height,
        foundation:clamp((t-b.start+.6)/.6),door:b.style==='hangar'?ease((t-11.8)/.8):0};
    });
    const letters=['LUNAR','LANDGRAB'].flatMap((word,row)=>[...word].map((char,i)=>{
      const age=t-titleAt-i*.08-row*.18;
      return {char,row,index:i,x:(400-(word.length*6-1)*5)/2+i*30,y:16+row*42,rows:Math.min(7,Math.max(0,Math.floor(age/.09)))};
    }));
    const cranes=[{mast:91,left:25,right:187,color:'#ff5a00',phase:0},
      {mast:288,left:211,right:381,color:'#ff00b8',phase:1.4}].flatMap((crane,index)=>{
      if(t>13.7)return [];
      const age=Math.max(0,t-(index?3.8:0));
      return [{...crane,index,roof:100,hook:mix(crane.left+10,crane.right-10,.5+.5*Math.sin(age*1.4+crane.phase)),
        reach:22+(.5+.5*Math.cos(age*1.8+crane.phase))*65}];
    });
    const departure=clamp((t-12.6)/6.4),apron=clamp((t-12.6)/1.1);
    const buggy={visible:t>=12.6&&t<19,x:mix(61,438,departure**1.15),y:mix(259,281,ease(apron)),travel:377*departure**1.15};
    return {t,pan,structures,letters,cranes,buggy,phase:t<11.8?'construction':t<12.6?'airlock':t<titleAt?'departure':t<panAt?'city-title':'next-site'};
  }

  let buffer;
  function draw(canvas,seconds){
    if(!buffer)buffer=document.createElement('canvas');
    if(buffer.width!==400||buffer.height!==300){buffer.width=400;buffer.height=300;}
    const ctx=buffer.getContext('2d'),s=stateAt(seconds),t=s.t;
    ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;
    const rect=(x,y,w,h,color)=>{if(w<=0||h<=0)return;ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));};
    function shape(points,color){
      const pixels=points.map(([x,y])=>[Math.round(x),Math.round(y)]);
      const top=Math.min(...pixels.map(p=>p[1])),bottom=Math.max(...pixels.map(p=>p[1]));
      for(let y=top;y<bottom;y++){
        const hits=[];
        for(let i=0;i<pixels.length;i++){
          const a=pixels[i],b=pixels[(i+1)%pixels.length],scan=y+.5;
          if((a[1]<=scan&&b[1]>scan)||(b[1]<=scan&&a[1]>scan))hits.push(a[0]+(scan-a[1])/(b[1]-a[1])*(b[0]-a[0]));
        }
        hits.sort((a,b)=>a-b);
        for(let i=0;i+1<hits.length;i+=2)rect(Math.floor(hits[i]),y,Math.ceil(hits[i+1])-Math.floor(hits[i]),1,color);
      }
    }
    function line(x,y,xx,yy,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(Math.round(x)+.5,Math.round(y)+.5);ctx.lineTo(Math.round(xx)+.5,Math.round(yy)+.5);ctx.stroke();}
    rect(0,0,400,300,C.black);
    // A periodic landscape returns to the same view at the loop boundary.
    const drift=18*Math.sin(t/duration*Math.PI*2);
    for(let x=-150;x<550;x+=144){
      const a=x-drift*.18;
      shape([[a,ground],[a+24,221],[a+39,185],[a+49,177],[a+66,208],[a+87,197],[a+109,149],[a+122,182],[a+150,ground]],C.cyan);
      shape([[a+109,149],[a+113,181],[a+143,ground],[a+128,228],[a+119,229]],C.blue);
      shape([[a+49,177],[a+52,210],[a+85,ground],[a+65,235]],C.blue);
    }
    for(let x=-180;x<600;x+=184){
      const a=x-drift*.46;
      shape([[a,ground],[a+22,235],[a+48,217],[a+65,224],[a+87,198],[a+105,213],[a+136,231],[a+159,213],[a+184,ground]],C.green);
      shape([[a+87,198],[a+105,213],[a+96,226],[a+111,230],[a+92,222]],C.shade);
      for(let i=0;i<5;i++){
        const bx=a+122+i*7,by=230-(i*7%23);rect(bx,by,5,ground-by,C.shade);rect(bx,by,4,2,C.yellow);
      }
    }
    rect(0,ground,400,46,C.peach);rect(0,ground+4,400,2,C.earth);
    ctx.save();ctx.translate(-Math.round(s.pan),0);
    const M={shell:'#f5e7cb',light:'#fff7e5',seam:'#acb8c8',shadow:'#59678b',glass:'#78f0ef',dark:'#15275e',orange:'#ff750d'};
    function pressureHull(x,y,w,h){
      shape([[x,y+h],[x,y+12],[x+5,y+5],[x+14,y],[x+w-14,y],[x+w-5,y+5],[x+w,y+12],[x+w,y+h]],M.shell);
      rect(x+5,y+h-7,w-10,7,M.shadow);rect(x+5,y+7,3,h-14,M.light);
      rect(x+w-7,y+10,4,h-17,M.seam);
    }
    function ports(x,y,count,step=13){
      for(let i=0;i<count;i++){
        const xx=x+i*step;rect(xx,y,8,9,M.shadow);rect(xx+2,y+2,4,5,M.dark);rect(xx+2,y+2,4,2,M.glass);
      }
    }
    function hatch(x,y,w,h){
      rect(x-2,y-2,w+4,h+2,M.shadow);rect(x,y,w,h,M.dark);
      rect(x+2,y+2,w-4,2,M.glass);rect(x+w-4,y+h-8,2,4,C.yellow);
    }
    function ribs(x,y,w,h,count){
      for(let i=1;i<count;i++){const xx=x+w*i/count;rect(xx,y+5,2,h-12,M.seam);rect(xx-1,y+5,1,h-12,M.light);}
    }
    function dish(x,y){
      rect(x-2,y+12,4,24,M.shadow);
      shape([[x-21,y],[x-16,y+12],[x-8,y+18],[x+3,y+17],[x+17,y+5],[x+21,y-4],[x+10,y+3],[x,y+7],[x-10,y+6]],M.shell);
      line(x-16,y+2,x+12,y-5,M.light,2);line(x-5,y+8,x+7,y-10,M.seam,2);rect(x+5,y-12,5,4,M.orange);
    }
    function facade(b){
      const {x,base:y,width:w,height:h}=b,top=y-h;
      if(b.style==='barrel'){
        pressureHull(x,top+16,w,h-16);ribs(x,top+16,w,h-16,5);
        ports(x+11,top+39,4);rect(x+15,top+13,w-30,5,M.shadow);
        pressureHull(x+18,top,w-36,17);rect(x+23,top+5,w-46,3,C.cyan);
        hatch(x+29,y-26,16,20);
      }else if(b.style==='dome'){
        pressureHull(x+4,top+47,w-8,h-47);
        shape([[x,top+49],[x+3,top+32],[x+12,top+18],[x+24,top+10],[x+w-24,top+10],[x+w-12,top+18],[x+w-3,top+32],[x+w,top+49]],M.shell);
        rect(x+2,top+45,w-4,6,M.shadow);
        line(x+24,top+12,x+17,top+44,M.seam,2);line(x+w-24,top+12,x+w-17,top+44,M.seam,2);
        rect(x+w/2-2,top+1,3,12,M.seam);rect(x+w/2-4,top,7,3,C.yellow);
        ports(x+13,top+57,4);hatch(x+w/2-8,y-25,16,19);
      }else if(b.style==='pods'){
        pressureHull(x,top+4,28,h-4);pressureHull(x+w-28,top+4,28,h-4);
        pressureHull(x+22,top+32,w-44,25);ribs(x+23,top+33,w-46,24,4);
        ports(x+10,top+24,1);ports(x+w-18,top+24,1);
        rect(x+8,top,12,5,M.orange);rect(x+w-20,top,12,5,M.orange);
        hatch(x+8,y-23,12,17);hatch(x+w-20,y-23,12,17);
      }else if(b.style==='dish'){
        pressureHull(x,top+58,w,h-58);ribs(x,top+58,w,h-58,5);ports(x+13,top+70,4);
        rect(x+33,top+45,15,14,M.seam);dish(x+40,top+11);
        rect(x+w-10,top+22,2,37,M.seam);rect(x+w-14,top+27,10,2,M.shell);rect(x+w-13,top+34,8,2,M.shell);
      }else if(b.style==='hangar'){
        pressureHull(x,top,w,h);ribs(x,top,w,h,6);
        rect(x+15,top+11,w-30,h-11,M.shadow);rect(x+20,top+14,w-40,h-14,M.dark);
        rect(x+20,top+14,w-40,(h-14)*(1-b.door),M.seam);
        for(let yy=top+18;yy<top+14+(h-14)*(1-b.door);yy+=5)rect(x+22,yy,w-44,1,M.light);
        rect(x+19,top+10,w-38,3,M.orange);rect(x+10,y-12,3,6,C.green);rect(x+w-13,y-12,3,6,C.green);
      }else if(b.style==='greenhouse'){
        shape([[x,y-5],[x,top+18],[x+8,top+6],[x+18,top],[x+w-18,top],[x+w-8,top+6],[x+w,top+18],[x+w,y-5]],M.glass);
        rect(x,y-7,w,7,M.shadow);rect(x+2,y-15,w-4,8,C.shade);
        for(let i=0;i<6;i++){const xx=x+7+i*10;rect(xx,y-22-(i%2)*3,4,10,C.green);rect(xx-2,y-24-(i%2)*3,8,3,C.green);}
        for(let i=0;i<5;i++){const xx=x+8+i*14;line(xx,top+7,xx,y-7,M.shell,2);}
        rect(x,top+20,w,2,M.shell);line(x+18,top,x+w-18,top,M.light,2);
      }else if(b.style==='solar'){
        pressureHull(x+18,top+25,40,h-25);rect(x+29,top+32,18,4,C.cyan);
        for(let i=0;i<2;i++){
          const xx=x+i*42;rect(xx+15,top+17,3,18,M.shadow);
          shape([[xx,top],[xx+31,top],[xx+35,top+20],[xx+4,top+20]],M.seam);
          shape([[xx+2,top+2],[xx+29,top+2],[xx+32,top+18],[xx+5,top+18]],C.blue);
          for(let j=1;j<4;j++)line(xx+2+j*7,top+2,xx+5+j*7,top+18,C.cyan);
          line(xx+4,top+10,xx+30,top+10,C.cyan);
        }
      }else if(b.style==='airlock'){
        pressureHull(x,top+8,w,h-8);ribs(x,top+8,w,h-8,5);
        pressureHull(x+21,top,26,h);hatch(x+26,top+11,16,h-16);
        rect(x+29,top+14,10,7,C.cyan);rect(x+24,top+1,20,3,M.orange);
        ports(x+7,top+21,1);ports(x+w-15,top+21,1);
      }
    }
    function building(b){
      if(b.foundation<=0)return;
      // Broad foundations and distinct footprints keep every structure grounded.
      rect(b.x-3,b.base-3,(b.width+6)*b.foundation,6,C.earth);
      if(b.builtHeight>0){
        ctx.save();ctx.beginPath();ctx.rect(b.x-5,b.base-b.builtHeight-12,b.width+10,b.builtHeight+16);ctx.clip();
        facade(b);ctx.restore();
      }
      if(b.progress<1&&b.foundation===1){
        const frame=Math.min(b.height,b.builtHeight+15),top=b.base-frame;
        for(let x=b.x+2;x<=b.x+b.width-2;x+=Math.max(12,Math.floor(b.width/3)))rect(x,top,2,frame-b.builtHeight+2,C.yellow);
        rect(b.x,top,b.width,2,C.yellow);
        if(b.builtHeight>0)rect(b.x,b.base-b.builtHeight,b.width,2,C.peach);
      }
    }
    function district(state,offset=0){
      ctx.save();ctx.translate(offset,0);
      if(state.structures[4].progress===1){
        shape([[40,260],[82,260],[96,282],[40,282]],M.seam);
        line(43,263,43,279,M.light);line(81,263,91,279,M.light);
      }
      state.structures.slice(0,4).forEach(building);
      state.structures.slice(4).forEach(building);
      // Crane trolleys carry construction beams between broad active sites.
      for(const {mast,roof,hook,reach,color,left,right} of state.cranes){
        rect(mast,roof,3,ground-roof,C.yellow);rect(left,roof,right-left,3,C.yellow);
        line(mast,roof-12,left,roof,C.yellow);line(mast,roof-12,right-5,roof,C.yellow);
        rect(mast-4,roof-6,12,6,color);rect(left+3,roof+3,16,7,color);
        rect(hook-3,roof-2,7,5,C.yellow);line(hook,roof+3,hook,roof+reach,C.white);
        rect(hook-11,roof+reach,23,4,color);rect(hook-1,roof+reach-4,3,4,C.yellow);
      }
      ctx.restore();
    }
    district(s);
    if(s.buggy.visible){
      const b=s.buggy;ctx.save();ctx.translate(Math.round(b.x),Math.round(b.y));
      // Original compact three-wheel silhouette, now leaving its working outpost.
      shape([[-16,-5],[-16,-10],[-12,-12],[-5,-12],[-1,-16],[6,-16],[12,-12],[17,-11],[18,-7],[14,-5]],M.light);
      rect(0,-15,6,1,C.cyan);rect(-2,-14,10,1,C.cyan);rect(9,-11,6,4,M.dark);
      rect(-11,-11,4,1,M.orange);rect(-13,-23,1,12,M.seam);rect(-14,-24,3,2,C.yellow);
      rect(-16,-7,31,2,M.orange);
      for(const x of [-10,0,12]){
        shape([[x-3,-5],[x-1,-7],[x+2,-7],[x+4,-4],[x+3,0],[x-2,0],[x-4,-2]],M.dark);
        rect(x-1,-5,3,3,M.seam);rect(x,-4,1,1,C.cyan);
        if(Math.floor(b.travel/3)%2)rect(x-3,-4,1,2,M.light);else rect(x+1,-6,2,1,M.light);
      }
      ctx.restore();
    }
    // The next construction site rolls in, giving the camera move a clean loop.
    if(s.pan>0)district(stateAt(0),400);
    // Letter floors are erected from the baseline upward in the cleared sky.
    for(const letter of s.letters){
      for(let row=7-letter.rows;row<7;row++)for(let col=0;col<5;col++)if(glyphs[letter.char][row][col]==='1')rect(letter.x+col*5,letter.y+row*5,5,5,letter.row?C.yellow:C.white);
    }
    ctx.restore();
    const target=canvas.getContext('2d');target.setTransform(1,0,0,1,0,0);target.imageSmoothingEnabled=false;target.drawImage(buffer,0,0,canvas.width,canvas.height);
    return s;
  }
  window.LandgrabAttract={draw,stateAt,duration,still,titleAt,panAt};
})();
