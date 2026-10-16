/* Apical — native WebGL. Geometry, camera math and shaders are local. */
(() => {
'use strict';
const canvas = document.querySelector('canvas');
const error = document.querySelector('#error');
const gl = canvas.getContext('webgl', {antialias:true, preserveDrawingBuffer:true, alpha:false});
function fail(message) { error.hidden=false; error.textContent=message; }
if (!gl) { fail('This browser could not start WebGL. Try opening this piece in a browser with hardware acceleration enabled.'); return; }
const vertexSource = `
attribute vec3 position, normal, color;
uniform mat4 viewProjection;
varying vec3 vNormal, vColor, vPosition;
void main(){vNormal=normal;vColor=color;vPosition=position;gl_Position=viewProjection*vec4(position,1.0);}`;
const fragmentSource = `
precision mediump float;
varying vec3 vNormal,vColor,vPosition;
uniform vec3 eye;
uniform float fogReach;
void main(){
 vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;
 vec3 light=normalize(vec3(-0.6,1.0,0.8));
 float diffuse=max(dot(n,light),0.0);
 float back=max(dot(-n,light),0.0);
 vec3 c=vColor*(0.48+0.52*diffuse)+vec3(0.12,0.14,0.035)*back;
 float fog=smoothstep(12.0+fogReach,28.0+fogReach,distance(eye,vPosition));
 gl_FragColor=vec4(mix(c,vec3(0.933,0.918,0.871),fog),1.0);
}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
let program;
try {program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexSource));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentSource));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}catch(e){fail('The plant renderer could not start: '+e.message);return;}
gl.useProgram(program);
const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
for(const [i,name] of ['position','normal','color'].entries()){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,36,i*12);}
const matrixLocation=gl.getUniformLocation(program,'viewProjection'),eyeLocation=gl.getUniformLocation(program,'eye'),fogLocation=gl.getUniformLocation(program,'fogReach');
gl.enable(gl.DEPTH_TEST);gl.clearColor(.933,.918,.871,1);
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>add(mul(a,1-t),mul(b,t));
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
function multiply(a,b){const c=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)c[j*4+i]+=a[k*4+i]*b[j*4+k];return c;}
function camera(eye,target,aspect){const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);const view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];const f=1/Math.tan(.68/2),near=.1,far=Math.max(60,eye[1]+30);return multiply([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0],view);}
let vertices=[];
function triangle(a,b,c,color, normals){const n=norm(cross(sub(b,a),sub(c,a)));for(const [i,p] of [a,b,c].entries())vertices.push(...p,...(normals?normals[i]:n),...color);}
function tube(a,b,ra,rb,color,sides=7){const axis=norm(sub(b,a)),u=norm(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);for(let i=0;i<sides;i++){const radial=t=>add(mul(u,Math.cos(t)),mul(v,Math.sin(t)));const n=radial(i/sides*Math.PI*2),m=radial((i+1)/sides*Math.PI*2);const p=add(a,mul(n,ra)),q=add(a,mul(m,ra)),r=add(b,mul(n,rb)),s=add(b,mul(m,rb));triangle(p,q,r,color,[n,m,n]);triangle(q,s,r,color,[m,m,n]);}}
function leaf(base,direction,length,width,opening,hue){if(opening<.005)return;const d=norm(direction),side=norm(cross(d,[0,1,0]));const bladeNormal=norm(cross(side,d));let prev;
 for(let i=0;i<=10;i++){const t=i/10;const center=add(base,add(mul(d,length*t*opening),[0,Math.sin(t*Math.PI)*length*.18*opening,0]));const w=Math.pow(Math.sin(t*Math.PI),.85)*width*opening;const fold=(1-opening)*w*2+w*.16;const row=[add(center,add(mul(side,-w),mul(bladeNormal,fold))),center,add(center,add(mul(side,w),mul(bladeNormal,fold)))];if(prev)for(let j=0;j<2;j++){const c=j===0?hue:mul(hue,.9);triangle(prev[j],prev[j+1],row[j],c);triangle(prev[j+1],row[j+1],row[j],c);}if(prev)tube(prev[1],center,.009*opening,.007*opening,[.52,.61,.25],4);prev=row;}}
// Five curved petals rise as a bud, then spread around a golden center.
function flower(base,theta,size,opening,color) {
 if(size<.005)return;
 const axis=norm([Math.cos(theta)*.3,1,Math.sin(theta)*.3]);
 const u=norm(cross(axis,[1,0,0])),v=cross(axis,u);
 const center=add(base,mul(axis,.32*size));
 tube(base,center,.022*size,.016*size,[.30,.43,.19],6);
 for(let petal=0;petal<5;petal++) {
  const angle=theta+petal*Math.PI*2/5;
  const radial=add(mul(u,Math.cos(angle)),mul(v,Math.sin(angle)));
  const side=cross(axis,radial);
  const sepalTip=add(center,add(mul(radial,.16*size),mul(axis,.07*size)));
  triangle(add(center,mul(side,.035*size)),add(center,mul(side,-.035*size)),sepalTip,[.32,.46,.19]);
  let previous;
  for(let i=0;i<=8;i++) {
   const t=i/8,curve=Math.sin(Math.PI*t);
   const outward=.52*t*opening+.06*curve;
   const rise=.48*t*(1-opening)+.12*curve-.045*t*t*opening;
   const middle=add(center,add(mul(radial,outward*size),mul(axis,rise*size)));
   const width=Math.pow(Math.max(0,curve),.7)*.20*size*(.22+.78*opening);
   const row=[add(middle,add(mul(side,-width),mul(axis,.06*curve*size))),middle,add(middle,add(mul(side,width),mul(axis,.06*curve*size)))];
   const shade=mix(mul(color,.80),color,t);
   if(previous)for(let j=0;j<2;j++) {
    triangle(previous[j],previous[j+1],row[j],shade);
    triangle(previous[j+1],row[j+1],row[j],shade);
   }
   previous=row;
  }
 }
 if(opening>.05) {
  const top=add(center,mul(axis,.08*size));
  for(let i=0;i<12;i++) {
   const point=angle=>add(center,mul(add(mul(u,Math.cos(angle)),mul(v,Math.sin(angle))),.105*size*opening));
   triangle(top,point(i*Math.PI/6),point((i+1)*Math.PI/6),[.91,.66,.17]);
  }
 }
}
const FLOWER_COLORS=[[.96,.66,.64],[.98,.88,.71],[.82,.51,.65]];
// One full camera orbit every 45 seconds of growth.
const ORBIT_SPEED = Math.PI * 2 / 45;
const BASE_LOOK_PERIOD = 45 * 1.5;
// Ease down for five seconds, linger, then ease back to the shoot.
function baseLookAmount() {
 const elapsed=time-12,phase=elapsed%BASE_LOOK_PERIOD;
 const until=BASE_LOOK_PERIOD-phase;
 if(until<7)return ease((7-until)/5);
 if(elapsed>=BASE_LOOK_PERIOD&&phase<7)return ease((7-phase)/5);
 return 0;
}
const stemPosition=index=>[Math.sin(index*.47)*.65,index*1.15,Math.cos(index*.39)*.6];
let seed,rng,nodes,baseNodes,time,paused=false,last=0,focus,contextLost=false;
function random(){rng|=0;rng=rng+0x6D2B79F5|0;let t=Math.imul(rng^rng>>>15,1|rng);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
function newNode(){const prev=nodes[nodes.length-1];const index=prev.index+1,angle=index*2.39996+random()*.5;const p=stemPosition(index);const branches=[];for(let k=0;k<2;k++){const theta=angle+k*Math.PI*.85;const length=1.8+random()*1.6;const path=[p];for(let j=1;j<=5;j++){const f=j/5;path.push(add(p,[Math.cos(theta+f*.2)*length*f, .35*length*f+f*f*.8,Math.sin(theta+f*.2)*length*f]));}const flowerHash=(Math.imul(index*2+k+1,1597334677)^seed)>>>0;branches.push({path,theta,length,flower:flowerHash%100<36,flowerColor:FLOWER_COLORS[(flowerHash>>>8)%FLOWER_COLORS.length],tint:[.19+random()*.09,.34+random()*.1,.13+random()*.04]});}const node={p,index,birth:index*3,branches};nodes.push(node);if(index<=6)baseNodes.push(node);}
function reset(){seed=new Uint32Array(1);crypto.getRandomValues(seed);seed=seed[0];rng=seed;nodes=[{p:[0,0,.6],index:0,birth:0,branches:[]}];baseNodes=[nodes[0]];time=12;focus=[0,2,0];while(nodes.at(-1).birth<time+6)newNode();focus=add(nodes.find(n=>n.index===Math.floor(time/3)).p,[0,-2.1,0]);last=0;document.querySelector('#readout').textContent='';}
function geometry(lookDown){vertices=[];const tipIndex=Math.floor(time/3);while(nodes.at(-1).index<tipIndex+2)newNode();while(nodes.length>36&&nodes[1].index<tipIndex-30)nodes.shift();let tip=nodes[0].p;
 // Keep the original base and reconstruct a bounded, coarse lower stalk.
 const visible=lookDown>0? [...baseNodes.filter(n=>n.index<nodes[0].index),...nodes]:nodes;
 for(let i=1;i<visible.length;i++){const node=visible[i],prev=visible[i-1];
 if(node.index-prev.index>1){const step=Math.max(1,Math.ceil((node.index-prev.index)/120));let a=prev.p;for(let index=prev.index+step;index<node.index;index+=step){const b=stemPosition(index);tube(a,b,.09,.09,[.26,.39,.17]);a=b;}tube(a,node.p,.09,.09,[.26,.39,.17]);tip=node.p;}const growth=clamp((time-prev.birth)/3);if(growth<=0)continue;const end=mix(prev.p,node.p,growth);if(node.index-prev.index===1)tube(prev.p,end,.09,.09*(1-.8*(1-growth)),[.26,.39,.17]);tip=end;
 if(node.p[1]<time/3*1.15-13 && !(lookDown>0&&node.index<=6))continue;
 for(const branch of node.branches){const age=time-node.birth-1;if(age<=0)continue;for(let j=1;j<branch.path.length;j++){const g=ease((age-(j-1)*.65)/1.7);if(g<=0)continue;const a=branch.path[j-1],b=mix(a,branch.path[j],g);tube(a,b,.044*(1-(j-1)/6),.044*(1-j/6)*g,[.30,.43,.19]);if(j>=2){const alternate=j%2?1:-1;const theta=branch.theta+alternate*1.05;const opening=ease((age-j*.65-.5)/3.5);leaf(b,[Math.cos(theta),.25+(.5*(1-opening)),Math.sin(theta)],.9+(j===3?.5:.15),.26,opening,branch.tint);}}
 if(branch.flower) {
  flower(branch.path[5],branch.theta,ease((age-5)/2),ease((age-8)/5),branch.flowerColor);
 } else {
  const opening=ease((age-4.3)/4);leaf(branch.path[5],[Math.cos(branch.theta),.55,Math.sin(branch.theta)],1.25,.27,opening,branch.tint);
 }
 }
 }
 // Two tender folded leaves at the leading shoot.
 const angle=tipIndex*2.39996;for(let k=0;k<2;k++)leaf(tip,[Math.cos(angle+k*2.7)*.45,1,Math.sin(angle+k*2.7)*.45],.55,.12,.55,[.48,.58,.22]);
 if(time<35||lookDown>0){for(let i=0;i<64;i++){const a=i/64*Math.PI*2,b=(i+1)/64*Math.PI*2;triangle([0,-.04,0],[Math.cos(a)*2.4,-.04,Math.sin(a)*2.4],[Math.cos(b)*2.4,-.04,Math.sin(b)*2.4],[.85,.84,.76]);}}
 return tip;
}
function resize(){const dpr=Math.min(devicePixelRatio||1,2);const w=Math.round(innerWidth*dpr),h=Math.round(innerHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);}
function render(dt=0){if(contextLost)return;resize();const lookDown=baseLookAmount();const tip=geometry(lookDown);const target=add(tip,[0,-2.1,0]);focus=mix(focus,target,1-Math.exp(-dt*1.8));const angle=time*ORBIT_SPEED;const distance=innerWidth<600?12:10;const eye=add(focus,[Math.cos(angle)*distance,3.3,Math.sin(angle)*distance]);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(matrixLocation,false,camera(eye,mix(focus,[0,0,.6],lookDown),canvas.width/canvas.height));gl.uniform3fv(eyeLocation,eye);gl.uniform1f(fogLocation,Math.max(0,Math.hypot(...sub(eye,[0,0,.6]))-12)*lookDown);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,vertices.length/9);document.querySelector('#readout').textContent=`SEED ${seed.toString(16).toUpperCase().padStart(8,'0')}  /  ${tip[1].toFixed(1)} m`;}
function frame(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!paused&&!document.hidden)time+=dt;render(paused?0:dt);requestAnimationFrame(frame);}
function toggle(){paused=!paused;document.querySelector('#pause').textContent=paused?'Resume':'Pause';document.querySelector('#pause').setAttribute('aria-pressed',String(paused));}
function save(){render();canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`apical-${seed.toString(16)}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');}
document.querySelector('#pause').onclick=toggle;document.querySelector('#restart').onclick=reset;document.querySelector('#save').onclick=save;
addEventListener('keydown',e=>{if(e.target.closest('button')||e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Space'){e.preventDefault();toggle();}if(e.key.toLowerCase()==='r')reset();if(e.key.toLowerCase()==='s')save();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;fail('The graphics context was interrupted. Reload this page to grow a new plant.');});
if(matchMedia('(prefers-reduced-motion: reduce)').matches){paused=true;document.querySelector('#pause').textContent='Resume';}
document.querySelector('#pause').setAttribute('aria-pressed',String(paused));reset();requestAnimationFrame(frame);
})();
