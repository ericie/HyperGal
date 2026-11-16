// Deep course, continuous projection, supported jumps and a correctly framed title rush.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),images=[];
class ImageStub{constructor(){images.push(this);}set src(value){this.url=value;}}
let textCalls=0;
const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),fillText(){textCalls++;}}, {get:(o,k)=>o[k]??((...args)=>{for(const n of args)if(typeof n==='number')assert(Number.isFinite(n),`nonfinite ${k}`);}),set:(o,k,v)=>(o[k]=v,true)});
const env={window:{},URL,Image:ImageStub,document:{currentScript:{src:'http://localhost:8000/Issues/arcade/onward-attract.js'}}};vm.createContext(env);vm.runInContext(fs.readFileSync(root+'Issues/arcade/onward-attract.js','utf8'),env);
const art=env.window.OnwardAttract,canvas={width:800,height:600,getContext:()=>ctx};
assert.equal(art.draw(canvas,1).ready,false,'retain static fallback before clouds decode');
assert.equal(images.length,3);
for(const img of images){assert(img.url.startsWith('http://localhost:8000/Issues/arcade/assets/onward-cloud-'));assert(fs.existsSync(root+new URL(img.url).pathname.slice(1)));img.naturalWidth=1856;img.naturalHeight=832;img.onload();}
assert.equal(await art.ready,true);assert.equal(art.draw(canvas,1).ready,true);
assert.equal(art.platforms.length,210);assert.equal(new Set(art.platforms.map(p=>p.type)).size,3);
assert(Math.max(...art.platforms.map(p=>p.z))>7500,'platforms stretch far into the sky');
assert(art.cameraState(3).y-art.cameraState(0).y>350,'visible upward camera flight');
assert.equal(art.routes.length,14);assert.equal(new Set(art.routes.map(r=>r.shape)).size,3);
let landings=0,maxAirSpeed=0;
for(const route of art.routes)for(let n=0;n<16;n++){
 const node=route.nodes[n],target=route.nodes[n+1],from=art.platforms[node.platform],to=art.platforms[target.platform];
 const launch=n*(route.wait+route.flight)+route.wait-route.delay;
 const a=art.runnerState(route,launch),b=art.runnerState(route,launch+route.flight);
 assert(Math.abs(a.y-from.y)<1e-6&&Math.abs(b.y-to.y)<1e-6,'feet leave and reach actual ledges');
 const mx=p=>p.x+(p.type==='moving'?Math.sin((launch+route.flight)*.72+p.id)*20:0);
 assert(Math.abs(b.x-(mx(to)+target.offset))<1e-6,'landing tracks its moving destination');
 assert(Math.abs(target.offset)<=to.width/2-23.9,'landing remains inside platform edges');
 const mid=art.runnerState(route,launch+route.flight/2);
 assert(mid.y>to.y,'every jump has a real arc over its destination');
 const speed=Math.abs(b.x-a.x)/route.flight;maxAirSpeed=Math.max(maxAirSpeed,speed);assert(speed<=320,'reachable lateral jump speed');
 const descending=art.runnerState(route,launch+route.flight-.001);assert(descending.y>to.y,'land from above');landings++;
}
let samples=0,minVisible=14;
for(let t=0;t<art.duration;t+=1/120){
 const s=art.draw(canvas,t),c=s.camera;assert(s.ready&&s.runners.length===14);
 assert(c.perspective>=0&&c.perspective<=1&&c.zoom>=1&&c.zoom<=9);
 if(t>=art.playAt&&t<=art.rushAt){
  assert.equal(c.perspective,0);assert.equal(c.pitch,0);
  const visible=s.runners.filter(r=>Math.abs(r.x)<425&&Math.abs(r.y-c.y)<330).length;minVisible=Math.min(minVisible,visible);
 }
 samples++;
}
assert(minVisible>=8,'a real crowd remains visible in flat play');
for(const boundary of [art.flatAt,art.playAt,art.rushAt,art.titleAt]){
 const a=art.cameraState(boundary-1e-7),b=art.cameraState(boundary+1e-7);
 for(const key of ['x','y','z','pitch','perspective','zoom'])assert(Math.abs(a[key]-b[key])<.001,`no camera snap at ${boundary}/${key}`);
}
let priorY=90;
for(let t=art.rushAt;t<=art.titleAt;t+=1/120){
 const c=art.cameraState(t),y=300-(art.titleY-c.y)*c.zoom;
 assert(y>=89.999&&y<=300.001&&y>=priorY-1e-7,'title stays in frame as the camera rushes toward it');priorY=y;
}
const final=art.draw(canvas,art.still);assert.deepEqual(Array.from(final.titleLines),['ONWARD','&','UPWARD']);
assert.equal(final.camera.zoom,9);assert.equal(textCalls,0,'title uses authored geometry');
assert.deepEqual(art.stateAt(art.duration),art.stateAt(0));assert.deepEqual(art.stateAt(-1),art.stateAt(art.duration-1));
for(const page of ['Issues/index.html','Issues/arcade/index.html','Issues/arcade/onward-test.html']){
 const html=fs.readFileSync(root+page,'utf8');assert(html.includes('onward-attract.js'));assert(html.indexOf('onward-attract.js')<html.indexOf('attract-player.js'));
}
assert(fs.readFileSync(root+'Issues/arcade.js','utf8').includes("'016-up-mario':'onward'"));
assert(fs.readFileSync(root+'Issues/arcade/attract-player.js','utf8').includes('onward:window.OnwardAttract'));
assert(fs.readFileSync(root+'Issues/arcade/index.html','utf8').includes('data-game="mario" data-attract="onward"'));
const meta=JSON.parse(fs.readFileSync(root+'pieces/016-up-mario/meta.json','utf8'));assert.equal(meta.wip,false);assert.equal(meta.title,'Always Moving Up');
assert.equal(JSON.parse(fs.readFileSync(root+'Issues/arcade/onward-test.meta.json','utf8')).wip,true);
console.log({samples,platforms:210,runners:14,verifiedLandings:landings,maxAirSpeed,minVisibleInFlatPlay:minVisible,title:['ONWARD','&','UPWARD'],still:art.still});
