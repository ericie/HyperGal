// Verify the complete visible bodies, including interpolated movement between steps.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const env={window:{}};vm.createContext(env);vm.runInContext(fs.readFileSync(fileURLToPath(new URL('../Issues/arcade/snake-attract.js',import.meta.url)),'utf8'),env);
const art=env.window.SnakeAttract;assert.equal(art.snakeCount,36);
assert(art.pullbackDuration<1.4,'pullback must be faster');
assert(art.bodyWidths.every(width=>width>.46),'every line must be thicker');
assert.equal(new Set(art.bodyWidths).size,1,'all snakes must have uniform thickness');
const initial=art.sample(art.settleAt),size=Math.max(...art.bodyWidths);
assert(art.settleAt<art.pullbackAt,'snakes must settle before zoom begins');
for(const time of [art.settleAt,4.4,4.7,5.05,9])assert.deepEqual(art.sample(time),initial,'title must stay fixed from before zoom until breakup');
for(const time of [.5,1.5,2.5]){
 const before=art.sample(time),after=art.sample(time+.1);
 assert(before.every((body,i)=>body.some((p,j)=>Math.hypot(p[0]-after[i][j][0],p[1]-after[i][j][1])>1e-5)),'every snake must travel during the perspective opening');
}
const parents=initial.map((_,i)=>i);
const root=i=>parents[i]===i?i:(parents[i]=root(parents[i]));
for(let i=0;i<initial.length;i++)for(let j=i+1;j<initial.length;j++){
 const reach=(art.bodyWidths[i]+art.bodyWidths[j])/2;
 const touching=initial[i].some(a=>initial[j].some(b=>{
  const x=Math.abs(a[0]-b[0]),z=Math.abs(a[1]-b[1]);
  return Math.abs(x-reach)<1e-6&&z<reach-1e-6||Math.abs(z-reach)<1e-6&&x<reach-1e-6;
 }));
 if(touching)parents[root(j)]=root(i);
}
assert.equal(new Set(parents.map((_,i)=>root(i))).size,14,'all pieces of each glyph must join edge-to-edge without joining other letters');
const glyphs=new Map();
initial.forEach((body,i)=>{const id=root(i);if(!glyphs.has(id))glyphs.set(id,[]);glyphs.get(id).push(...body);});
const heights=[...glyphs.values()].map(points=>Math.max(...points.map(p=>p[1]))-Math.min(...points.map(p=>p[1]))+size);
assert.equal(heights.filter(h=>Math.abs(h-5.6)<1e-6).length,13,'all thirteen letters must have the same ground height');
assert.equal(heights.filter(h=>Math.abs(h-1.6)<1e-6).length,1,'apostrophe keeps its punctuation height');
const ctx=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
const canvas={width:800,height:600,getContext:()=>ctx};
let mouseClearance=Infinity;
for(let t=0;t<art.pullbackAt;t+=1/240){
 const state=art.draw(canvas,t);
 for(const body of art.sample(t))for(const p of body){
  const clearance=Math.max(Math.abs(p[0]-state.mouse[0]),Math.abs(p[1]-state.mouse[1]))-size/2-.28;
  mouseClearance=Math.min(mouseClearance,clearance);
  assert(clearance>.1,'entire mouse must sit on clear ground, away from every snake');
 }
}
let frames=0,minClearance=Infinity;
for(let t=0;t<=art.exitAt+.1;t+=1/240){
 if(t>art.settleAt&&t<art.escapeAt)continue;
 const cells=new Map(),bodies=art.sample(t);
 for(const [i,body] of bodies.entries()){
  const width=art.bodyWidths[i];
  const seen=new Map();
  for(const [j,[x,z]] of body.entries()){
   const key=x.toFixed(6)+':'+z.toFixed(6);
   assert(!seen.has(key)||j-seen.get(key)<=1,`self-backtrack at ${t}, snake ${i}`);
   seen.set(key,j);
  }
  if(frames%3===0){
   const corners=body.filter((p,j)=>j===0||j===body.length-1||Math.abs((p[0]-body[j-1][0])*(body[j+1][1]-p[1])-(p[1]-body[j-1][1])*(body[j+1][0]-p[0]))>1e-8);
   const segments=corners.slice(1).map((p,j)=>({x0:Math.min(p[0],corners[j][0])-width/2,x1:Math.max(p[0],corners[j][0])+width/2,z0:Math.min(p[1],corners[j][1])-width/2,z1:Math.max(p[1],corners[j][1])+width/2}));
   for(let a=0;a<segments.length;a++)for(let b=a+2;b<segments.length;b++){
    const p=segments[a],q=segments[b];
    assert(!(p.x0<q.x1-1e-6&&q.x0<p.x1-1e-6&&p.z0<q.z1-1e-6&&q.z0<p.z1-1e-6),`self-intersection at ${t}, snake ${i}, segments ${a}/${b}`);
   }
  }
 }
 for(const [i,body] of bodies.entries())for(const [j,[x,z]] of body.entries()){
  const a=Math.floor(x/size),b=Math.floor(z/size);
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)for(const p of cells.get(`${a+dx}:${b+dz}`)||[]){
   if(p.i===i&&Math.abs(p.j-j)<Math.ceil(3*art.bodyWidths[i]/.2))continue;
   const separation=Math.max(Math.abs(p.x-x),Math.abs(p.z-z));
   const clearance=(art.bodyWidths[p.i]+art.bodyWidths[i])/2;
   if(p.i!==i)minClearance=Math.min(minClearance,separation-clearance);
   assert(separation>=clearance-.00001,`overlap at t=${t.toFixed(4)} bodies ${p.i}/${i} points ${p.j}/${j} separation ${separation}`);
  }
  const key=`${a}:${b}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push({x,z,i,j});
 }
 frames++;
}
assert(art.sample(art.exitAt).every(body=>body.every(([x,z])=>x< -24.8||x>24.8||z< -18.8||z>19.8)));
assert.deepEqual(art.sample(10.5),art.sample(10.5));
console.log({snakes:36,collisionSamples:frames,minClearance:Math.max(0,minClearance),mouseClearance,letterHeight:5.6,widths:[...new Set(art.bodyWidths)],settleAt:art.settleAt,pullbackSeconds:art.pullbackDuration,exitAt:art.exitAt});
