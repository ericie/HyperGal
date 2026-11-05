// Three cut-up screen states per game. Original illustrated plates, no running games.
(() => {
  const base = new URL('assets/raw/', document.currentScript.src);
  const works = {
    asteroids: { title:['ASTEROIDS','ASSEMBLE'], ink:'#f7edce', acid:'#f4ff00', color:'#203ef4', crop:[.53,.65], font:'Permanent Marker', cut:0 },
    pacman: { title:['TO BIG','FOR THIS WORLD'], ink:'#d9ff00', acid:'#9d36ed', color:'#c8f500', crop:[.5,.65], font:'Bangers', cut:1 },
    cloudcutter: { title:['CLOUDCUTTER'], ink:'#b9ffff', acid:'#ff391e', color:'#1fc9dc', crop:[.56,.64], font:'Permanent Marker', cut:2 },
    frogs: { title:['MANY','FROGS'], ink:'#c9ff37', acid:'#ff634a', color:'#6ee624', crop:[.5,.62], font:'Rubik Dirt', cut:1 },
    heap: { title:['TOP OF','THE HEAP'], ink:'#ffa421', acid:'#fa48a3', color:'#ff7831', crop:[.55,.64], font:'Bangers', cut:0 },
    moon: { title:['MOON','ORCHARD'], ink:'#c6f9ff', acid:'#ee249d', color:'#3b3a93', crop:[.5,.66], font:'Rubik Dirt', cut:2 },
    invaders: { title:['ONLY','INVADERS'], ink:'#aeff27', acid:'#fb6c1f', color:'#76ed2d', crop:[.5,.65], font:'Permanent Marker', cut:0 },
    centipede: { title:['ONLY','CENTIPEDE'], ink:'#f7f025', acid:'#f84b37', color:'#193fab', crop:[.5,.66], font:'Bangers', cut:2 },
    snake: { title:['SNAKE','PIT'], ink:'#f9e8c5', acid:'#fc26ab', color:'#16d4c4', crop:[.5,.64], font:'Rubik Dirt', cut:1 },
    command: { title:['MUTUAL','COMMAND'], ink:'#fff234', acid:'#f42b21', color:'#ed3b25', crop:[.52,.68], font:'Rubik Dirt', cut:0 },
    happiness: { title:['HAPPINESS','HUNTER'], ink:'#ff44b6', acid:'#caff41', color:'#f33499', crop:[.5,.65], font:'Permanent Marker', cut:2 },
    paddle: { title:['PADDLE'], ink:'#d4ffff', acid:'#f63523', color:'#e93621', crop:[.5,.65], font:'Permanent Marker', cut:1 },
    mario: { title:['MANY','MARIO'], ink:'#fff226', acid:'#ed261e', color:'#253ced', crop:[.5,.66], font:'Bangers', cut:0 },
    unbreakable: { title:['UNBREAKABLE'], ink:'#d5ffff', acid:'#fa22a1', color:'#eb2998', crop:[.5,.63], font:'Rubik Dirt', cut:1 },
    tetris: { title:['MICRO','TETRIS'], ink:'#caff2c', acid:'#7d28f4', color:'#7034d9', crop:[.53,.64], font:'Bangers', cut:2 }
  };
  const images = new Map(), pending = new Map();
  function load(key) {
    if (pending.has(key)) return pending.get(key);
    const image = new Image();
    const promise = new Promise((resolve,reject) => {
      image.onload = () => { images.set(key,image); resolve(image); };
      image.onerror = () => { pending.delete(key); reject(new Error(`Attract art unavailable: ${key}`)); };
    });
    image.src = new URL(`${key}.jpg`,base).href;
    pending.set(key,promise); return promise;
  }
  function draw(canvas,key,phase=0) {
    const image=images.get(key), work=works[key];
    if (!image || !work) return false;
    const c=canvas.getContext('2d',{alpha:false}), w=canvas.width,h=canvas.height;
    c.resetTransform(); c.globalAlpha=1; c.globalCompositeOperation='source-over'; c.filter='none';
    c.fillStyle='#080909';c.fillRect(0,0,w,h);
    if (phase===0) { c.drawImage(image,0,0,w,h); return true; }
    const iw=image.naturalWidth,ih=image.naturalHeight;
    const crop=(x,y,cw,ch,dx,dy,dw,dh) => c.drawImage(image,Math.max(0,Math.min(iw-cw,x)),Math.max(0,Math.min(ih-ch,y)),cw,ch,dx,dy,dw,dh);
    if (phase===1) {
      // Jump inside the illustrated world, away from its first title composition.
      const cw=iw*.58,ch=ih*.58;
      crop(iw*work.crop[0]-cw/2,ih*work.crop[1]-ch/2,cw,ch,0,0,w,h);
      c.globalCompositeOperation='multiply';c.fillStyle=work.acid;c.globalAlpha=.28;c.fillRect(0,0,w,h);
      c.globalCompositeOperation='source-over';c.globalAlpha=1;
      title(c,work,image,w,h,work.cut===2?.56:.07,work.cut===2?.36:.36,-.035);
    } else {
      // A different edit per family: split panorama, vertical splice, or punched strips.
      if(work.cut===0) {
        crop(iw*.08,ih*.4,iw*.84,ih*.46,0,h*.18,w,h*.64);
        crop(iw*.3,ih*.52,iw*.48,ih*.22,w*.56,0,w*.44,h*.34);
        crop(0,ih*.75,iw*.55,ih*.25,-w*.08,h*.73,w*.67,h*.34);
      } else if(work.cut===1) {
        for(let i=0;i<3;i++)crop(iw*(.13+i*.19),ih*.34,iw*.28,ih*.64,w*i/3,0,w/3+1,h);
      } else {
        crop(iw*.12,ih*.3,iw*.76,ih*.58,0,0,w,h);
        c.fillStyle='#080909';c.fillRect(0,h*.3,w,h*.22);
        crop(iw*.24,ih*.48,iw*.55,ih*.19,0,h*.33,w,h*.16);
      }
      title(c,work,image,w,h,.59,.32,.025);
    }
    return true;
  }
  function title(output,work,image,w,h,top,depth,angle) {
    const layer=document.createElement('canvas');layer.width=w;layer.height=h;
    const c=layer.getContext('2d');
    c.save();c.translate(w*.065,h*top);c.rotate(angle);
    const lineH=h*depth/work.title.length;
    work.title.forEach((text,i)=>{
      c.save();c.translate(0,i*lineH);
      c.font=`100px '${work.font}'`;c.textBaseline='alphabetic';
      const metrics=c.measureText(text), cap=(metrics.actualBoundingBoxAscent||80);
      const textWidth=w*.85;
      c.scale(textWidth/Math.max(metrics.width,metrics.actualBoundingBoxRight+metrics.actualBoundingBoxLeft),lineH*.86/cap);
      c.lineJoin='round';c.strokeStyle='#080909';c.lineWidth=11;c.strokeText(text,0,cap);
      c.fillStyle=work.ink;c.fillText(text,0,cap);c.restore();
    });c.restore();
    // Let the plate's actual coarse ink bite through the added lettering.
    c.globalCompositeOperation='source-atop';c.globalAlpha=.24;
    c.drawImage(image,0,0,w,h);
    output.drawImage(layer,0,0);
  }
  window.ArcadeAttractArt={draw,load,loadAll:()=>Promise.all(Object.keys(works).map(load)),palettes:Object.fromEntries(Object.entries(works).map(([k,v])=>[k,[v.color,v.ink,v.acid]]))};
})();
