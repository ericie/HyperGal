// Native film semantics, camera continuity, reverse-Breakout contacts and wiring.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=fs.readFileSync(root+'Issues/arcade/unbreakable-attract.js','utf8');
const env={window:{}};vm.createContext(env);vm.runInContext(source,env);
const art=env.window.UnbreakableAttract;
const context=new Proxy({},{get:(obj,key)=>obj[key]||((...args)=>{
 for(const value of args)if(typeof value==='number')assert(Number.isFinite(value),`nonfinite ${key}`);
}),set:(obj,key,value)=>(obj[key]=value,true)});
const canvas={width:800,height:600,getContext:()=>context};
const opening=art.draw(canvas,0);
assert.equal(opening.title.letters.filter(l=>l.row===0).map(l=>l.char).join(''),'UNBRE');
assert.equal(opening.title.letters.filter(l=>l.row===1).map(l=>l.char).join(''),'AKABLE');
assert(opening.title.complete);
for(const row of [0,1]){
 const letters=opening.title.letters.filter(l=>l.row===row);
 assert.equal(letters[0].x,6);assert(Math.abs(letters.at(-1).x+letters.at(-1).width-794)<1e-9);
 assert(letters.every(l=>l.height===291));
 for(let i=1;i<letters.length;i++)assert(Math.abs(letters[i].x-letters[i-1].x-letters[i-1].width-4)<1e-9);
}
let samples=0,lastCamera=art.cameraState(0);
for(let t=0;t<art.duration;t+=1/120){
 const state=art.draw(canvas,t),c=state.camera;
 assert(c.pitch>=.24-1e-9&&c.pitch<=Math.PI/2+1e-9);
 assert(Math.abs(c.z-lastCamera.z)<.34,'continuous bounded camera travel');
 assert(Math.abs(c.pitch-lastCamera.pitch)<.02,'no projection snap');
 if(t>art.playAt&&t<art.clearAt){
  assert(Math.abs(c.pitch-Math.PI/2)<1e-9);assert(state.ballPoint&&state.paddlePoints);
  assert(state.ballPoint.every(Number.isFinite));
 }
 lastCamera=c;samples++;
}
assert(art.cameraState(art.diveAt).pitch<.25,'steep wall');
assert(art.cameraState(art.flattenAt).z-art.cameraState(art.diveAt).z>120,'long dolly');
for(const boundary of [art.tiltAt,art.diveAt,art.flattenAt,art.playAt,art.clearAt]){
 const a=art.cameraState(boundary-1e-7),b=art.cameraState(boundary+1e-7);
 for(const key of ['pitch','z','distance','roll'])assert(Math.abs(a[key]-b[key])<1e-5,`camera boundary ${boundary} ${key}`);
}
let lastBricks=0,lastHits=0,lastBounces=0;
for(let t=6.8;t<art.typeAt;t+=1/240){
 const g=art.gameState(t);assert(g.x>=7-1e-6&&g.x<=793+1e-6);assert(g.y<=543+1e-6);
 assert(g.placed.length>=lastBricks&&g.placed.length-lastBricks<=1,'only add one brick per contact');
 assert(g.placed.length<=g.hits&&g.hits>=lastHits&&g.bounces>=lastBounces);
 const cells=new Set(g.placed.map(d=>d.col+':'+d.y));assert.equal(cells.size,g.placed.length,'no duplicate cells');
 for(const d of g.placed){
  const nearX=Math.max(d.col*50,Math.min((d.col+1)*50,g.x)),nearY=Math.max(d.y,Math.min(d.y+24,g.y));
  assert(Math.hypot(g.x-nearX,g.y-nearY)>=7-.01,'brick must wait until ball clears');
 }
 if(g.bounces>lastBounces)assert(Math.abs(g.x-g.paddleX)<=40,'paddle catches ball');
 lastBricks=g.placed.length;lastHits=g.hits;lastBounces=g.bounces;
}
assert(lastHits>=8&&lastBounces>=7&&lastBricks>=8,'sustained reverse gameplay');
for(let i=0;i<11;i++)assert.equal(art.titleState(art.typeAt+i*art.cadence+.001).count,i+1,'ordered title typing');
assert.equal(art.draw(canvas,art.typeAt-.001).visibleBricks,0,'empty field before retyping');
assert(art.draw(canvas,23).title.complete);
assert.deepEqual(art.draw(canvas,art.duration),opening,'loop repeats exact state');
assert.deepEqual(art.draw(canvas,-1),art.draw(canvas,art.duration-1));
assert.deepEqual(art.draw(canvas,1),art.draw(canvas,art.still));
for(const route of ['Issues/index.html','Issues/arcade/index.html','Issues/arcade/unbreakable-test.html']){
 const html=fs.readFileSync(root+route,'utf8');assert(html.includes('unbreakable-attract.js'));
 assert(html.indexOf('unbreakable-attract.js')<html.indexOf('attract-player.js'));
}
assert(fs.readFileSync(root+'Issues/arcade.js','utf8').includes("'003-unbreakable':'unbreakable'"));
assert(fs.readFileSync(root+'Issues/arcade/attract-player.js','utf8').includes('unbreakable:window.UnbreakableAttract'));
assert(fs.readFileSync(root+'Issues/arcade/index.html','utf8').includes('data-game="unbreakable" data-attract="unbreakable"'));
assert.equal(JSON.parse(fs.readFileSync(root+'Issues/arcade/unbreakable-test.meta.json','utf8')).wip,true);
assert.equal(JSON.parse(fs.readFileSync(root+'pieces/003-unbreakable/meta.json','utf8')).wip,false);
console.log({samples,hits:lastHits,paddleBounces:lastBounces,addedBricks:lastBricks,letters:11,rows:['UNBRE','AKABLE'],loop:art.duration});
