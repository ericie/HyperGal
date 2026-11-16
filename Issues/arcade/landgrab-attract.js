// A cheerful lunar city rises from foundations under working construction cranes.
(() => {
  'use strict';
  const duration=23.4,still=18,titleAt=14.8,panAt=19.4,ground=254;
  const C={black:'#000000',white:'#ffffff',cyan:'#00a4bc',blue:'#1024ff',green:'#00d950',shade:'#00a000',peach:'#ffa65c',earth:'#bf7838',yellow:'#dce000'};
  const clamp=n=>Math.max(0,Math.min(1,n)),mix=(a,b,p)=>a+(b-a)*p;
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const wrap=n=>{const t=n%duration;return t<0?t+duration:t;};
  // Broad, distinct footprints: four civic blocks behind four low workplaces.
  const buildings=[
    {id:'terraces',site:0,x:12,width:68,base:244,height:116,style:'terrace',color:'#ff5a00',shade:'#a93215',start:.2,buildFor:4.4},
    {id:'apartments',site:0,x:104,width:64,base:244,height:136,style:'slab',color:C.cyan,shade:C.blue,start:2.2,buildFor:4.8},
    {id:'civic',site:1,x:202,width:62,base:244,height:108,style:'bridge',color:'#ff00b8',shade:'#8c0065',start:4.6,buildFor:4.4},
    {id:'observatory',site:1,x:302,width:80,base:244,height:128,style:'pyramid',color:C.yellow,shade:'#898c00',start:6.4,buildFor:5},
    {id:'hangar',site:0,x:20,width:82,base:260,height:54,style:'hangar',color:'#ff5a00',shade:'#a93215',start:1,buildFor:3.8},
    {id:'atrium',site:0,x:126,width:66,base:260,height:68,style:'atrium',color:'#ff00b8',shade:'#8c0065',start:3.2,buildFor:4.1},
    {id:'workshop',site:1,x:218,width:75,base:260,height:57,style:'sawtooth',color:C.cyan,shade:C.blue,start:5.4,buildFor:4},
    {id:'offices',site:1,x:315,width:64,base:260,height:76,style:'offset',color:'#ff5a00',shade:'#a93215',start:7.4,buildFor:4.3}
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
        foundation:clamp((t-b.start+.6)/.6),door:b.style==='hangar'?ease((t-6)/.8):0};
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
    return {t,pan,structures,letters,cranes,phase:t<12?'construction':t<titleAt?'finishing':t<panAt?'city-title':'next-site'};
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
    function windowGrid(x,y,w,h,columns=4){
      const step=(w-12)/columns;
      for(let yy=y+9;yy<y+h-8;yy+=14)for(let col=0;col<columns;col++){
        const xx=x+6+col*step;
        rect(xx,yy,step-4,6,C.blue);rect(xx,yy,step-4,1,C.cyan);
        if((Math.floor(t*1.5)+col+Math.floor(yy/14))%7<2)rect(xx+1,yy+2,Math.max(2,step-6),3,C.yellow);
      }
    }
    function block(x,y,w,h,b,columns=4){
      rect(x,y,w,h,b.color);rect(x+w-5,y+3,5,h-3,b.shade);
      rect(x+3,y,Math.max(1,w-8),2,C.peach);
      for(let yy=y+19;yy<y+h-4;yy+=14)rect(x+2,yy,w-7,2,b.shade);
      windowGrid(x,y,w-3,h,columns);
      rect(x-2,y+h-5,w+4,5,b.shade);
    }
    function facade(b){
      const {x,base:y,width:w,height:h}=b,top=y-h;
      if(b.style==='terrace'){
        block(x,top+44,w,h-44,b,5);block(x+7,top+22,w-14,29,b,4);block(x+15,top,w-30,29,b,3);
        rect(x+20,top-4,w-40,4,b.shade);
      }else if(b.style==='slab'){
        block(x,top,w,h,b,4);rect(x-3,top-3,w+6,4,b.shade);
        rect(x+8,top-9,15,6,b.color);rect(x+40,top-7,12,4,b.color);
        rect(x+w*.44,y-19,10,15,C.blue);rect(x+w*.44,y-19,10,2,C.yellow);
      }else if(b.style==='bridge'){
        block(x,top+14,25,h-14,b,2);block(x+35,top,27,h,b,2);
        block(x+21,top+42,21,19,b,2);rect(x+25,y-25,10,25,C.blue);
        rect(x+2,top+10,21,4,b.shade);rect(x+38,top-4,21,4,b.shade);
      }else if(b.style==='pyramid'){
        block(x,top+72,w,h-72,b,6);block(x+8,top+48,w-16,29,b,5);
        block(x+18,top+24,w-36,29,b,3);block(x+27,top,w-54,29,b,2);
        rect(x+33,top-5,w-66,5,C.peach);
      }else if(b.style==='hangar'){
        shape([[x,y],[x,top+18],[x+9,top+6],[x+20,top],[x+w-20,top],[x+w-9,top+6],[x+w,top+18],[x+w,y]],b.color);
        rect(x+3,top+20,w-6,5,b.shade);rect(x+20,top+20,w-40,h-20,C.blue);
        rect(x+20,top+20,w-40,(h-20)*(1-b.door),b.shade);
        for(let yy=top+24;yy<top+20+(h-20)*(1-b.door);yy+=5)rect(x+22,yy,w-44,1,C.peach);
        rect(x+23,top+10,w-46,5,C.yellow);rect(x-3,y-4,w+6,4,b.shade);
      }else if(b.style==='atrium'){
        block(x,top+10,w,h-10,b,4);rect(x-3,top+7,w+6,4,b.shade);
        rect(x+13,top,40,9,b.color);rect(x+18,top+2,30,3,C.peach);
        rect(x+23,top+24,21,h-24,C.blue);rect(x+25,top+26,17,h-28,C.cyan);
        for(let yy=top+34;yy<y-2;yy+=11)rect(x+24,yy,19,2,C.blue);
        rect(x+32,top+25,2,h-25,C.blue);
      }else if(b.style==='sawtooth'){
        rect(x,top+14,w,h-14,b.color);
        for(let i=0;i<3;i++){
          const xx=x+i*25;shape([[xx,top+15],[xx+21,top],[xx+25,top+3],[xx+25,top+15]],b.color);
          rect(xx+21,top+3,3,12,C.peach);rect(xx+4,top+20,15,7,C.blue);rect(xx+4,top+20,15,2,C.yellow);
        }
        rect(x,top+32,w,3,b.shade);rect(x+w-17,y-19,12,19,C.blue);
        rect(x-3,y-4,w+6,4,b.shade);
      }else{
        block(x,top+28,w,h-28,b,4);block(x+14,top,w-14,34,b,3);
        rect(x+10,top+25,w-6,4,b.shade);rect(x+20,top-4,w-20,4,b.shade);
        rect(x+8,y-17,12,17,C.blue);rect(x+7,y-20,14,3,C.yellow);
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
