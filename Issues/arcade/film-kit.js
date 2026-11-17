// Shared geometry only. Each attract film owns its scene, camera and pacing.
(() => {
 'use strict';
 const clamp=n=>Math.max(0,Math.min(1,n)),mix=(a,b,p)=>a+(b-a)*p,ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 const mod=(n,m)=>(n%m+m)%m,hash=n=>{let x=Math.imul(n+97,1597334677);x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return ((x^(x>>>16))>>>0)/4294967296;};
 const font={A:['01110','11011','11011','11111','11011','11011','11011'],B:['11110','11011','11011','11110','11011','11011','11110'],C:['01111','11000','11000','11000','11000','11000','01111'],D:['11110','11011','11011','11011','11011','11011','11110'],E:['11111','11000','11000','11110','11000','11000','11111'],F:['11111','11000','11000','11110','11000','11000','11000'],G:['01111','11000','11000','11011','11011','11011','01110'],H:['11011','11011','11011','11111','11011','11011','11011'],I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00011','00011','00011','11011','11011','01110'],K:['11011','11011','11110','11100','11110','11011','11011'],L:['11000','11000','11000','11000','11000','11000','11111'],M:['11011','11111','11111','11011','11011','11011','11011'],N:['11001','11101','11101','11011','11011','11011','11001'],O:['01110','11011','11011','11011','11011','11011','01110'],P:['11110','11011','11011','11110','11000','11000','11000'],Q:['01110','11011','11011','11011','11111','01110','00011'],R:['11110','11011','11011','11110','11100','11010','11011'],S:['01111','11000','11000','01110','00011','00011','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['11011','11011','11011','11011','11011','11011','01110'],V:['11011','11011','11011','11011','11011','01110','00100'],W:['11011','11011','11011','11011','11111','11111','01010'],X:['11011','11011','01110','00100','01110','11011','11011'],Y:['11011','11011','01110','00100','00100','00100','00100'],Z:['11111','00011','00110','01100','11000','11000','11111'],' ':['00000','00000','00000','00000','00000','00000','00000']};
 function cells(lines,size,y,gap=2){
  const all=[];let id=0;
  lines.forEach((word,row)=>{const width=(word.length*6-1)*size,x=(800-width)/2;
   [...word].forEach((char,i)=>{if(!font[char])throw Error('Unknown glyph '+char);font[char].forEach((bits,r)=>[...bits].forEach((bit,c)=>{if(bit==='1')all.push({x:x+(i*6+c)*size,y:y+row*(7+gap)*size+r*size,size,char,index:i,row,id:id++});}));});
  });return all;
 }
 function begin(canvas,time,duration,bg){
  const t=mod(time,duration),c=canvas.getContext('2d');c.setTransform(canvas.width/800,0,0,canvas.height/600,0,0);c.globalAlpha=1;c.fillStyle=bg;c.fillRect(0,0,800,600);c.save();c.globalAlpha=ease(t/.5)*(1-ease((t-duration+1.2)/1.2));return {c,t,alpha:c.globalAlpha};
 }
 function rect(c,x,y,w,h,color){if(w<=0||h<=0)return;c.fillStyle=color;c.fillRect(x,y,w,h);}
 function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fill();}
 function line(c,points,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}
 function disc(c,x,y,r,color){if(r<=0)return;c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 function round(c,x,y,w,h,r,color){if(w<=0||h<=0)return;c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
 window.ArcadeFilmKit={clamp,mix,ease,mod,hash,font,cells,begin,rect,poly,line,disc,round};
})();
