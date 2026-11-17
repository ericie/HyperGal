// Broad architectural construction, no destruction, and shared loop wiring.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
let pixelTextCalls=0;
const context=new Proxy({fillText(){pixelTextCalls++;}},{get:(o,k)=>o[k]??((...args)=>{for(const n of args)if(typeof n==='number')assert(Number.isFinite(n),`nonfinite ${k}`);}),set:(o,k,v)=>(o[k]=v,true)});
const canvas=()=>({width:400,height:300,getContext:()=>context});
const env={window:{},document:{createElement:canvas}};vm.createContext(env);
vm.runInContext(fs.readFileSync(root+'Issues/arcade/landgrab-attract.js','utf8'),env);
const art=env.window.LandgrabAttract,surface=canvas();
const initial=art.stateAt(0),completed=art.stateAt(art.still);
assert.equal(initial.structures.length,8);
assert(initial.structures.every(b=>b.builtHeight===0),'city must be built during the film');
assert.equal(new Set(completed.structures.map(b=>b.style)).size,8,'eight distinct architectural profiles');
assert(completed.structures.every(b=>b.width>=60),'broad buildings replace narrow spindles');
for(const row of [completed.structures.slice(0,4),completed.structures.slice(4)]){
 for(let i=1;i<row.length;i++)assert(row[i].x>row[i-1].x+row[i-1].width,'each row has separated footprints');
}
assert(completed.structures.every(b=>b.x>=0&&b.x+b.width<=400));
assert.deepEqual(Array.from(completed.structures,b=>b.style),['barrel','dome','pods','dish','hangar','greenhouse','solar','airlock'],'recognizable lunar modules replace terrestrial towers');
assert(completed.structures.every(b=>b.height<=106),'habitats stay low');
assert(!/function part\(|site\.pop|s\.parts/.test(fs.readFileSync(root+'Issues/arcade/landgrab-attract.js','utf8')),'no debris renderer');
let previous=art.stateAt(0),frames=0,constructionFrames=0;
for(let t=0;t<art.duration;t+=1/120){
 const s=art.draw(surface,t);assert.equal(s.structures.length,8);
 assert(!("parts" in s)&&!("explosions" in s),"no destruction in the attract film");
 if(s.buggy.visible){
  const garage=s.structures.find(b=>b.style==='hangar');
  assert.equal(garage.progress,1,'departure follows completed construction');assert.equal(garage.door,1,'door clears before buggy moves');
  assert(s.buggy.x>=previous.buggy.x,'buggy departs forward');
  assert(s.buggy.y>=259&&s.buggy.y<=281,'buggy follows apron onto road');
 }
 s.structures.forEach((b,i)=>{
  assert(b.builtHeight>=previous.structures[i].builtHeight,'buildings grow without shrinking');
  assert(b.builtHeight<=b.height&&b.progress>=0&&b.progress<=1);
  if(b.progress<1)assert.equal(b.builtHeight%6,0,'floors are erected in solid steps');
  if(b.progress>0&&b.progress<1)constructionFrames++;
  if(b.door>0)assert.equal(b.progress,1,'finish garage before opening');
 });
 assert(s.pan>=previous.pan,'one continuous departure');
 assert(s.letters.every(l=>l.rows>=0&&l.rows<=7));
 previous=s;frames++;
}
assert(constructionFrames>3000,'construction is sustained, not a quick decorative reveal');
const hangar=state=>state.structures.find(b=>b.style==='hangar');
assert.equal(hangar(art.stateAt(11.8)).door,0);
assert.equal(hangar(art.stateAt(12.6)).door,1,'finished hangar clears before departure');
assert.equal(art.stateAt(12.59).buggy.visible,false);
const launch=art.stateAt(12.6).buggy;
assert.equal(launch.visible,true);assert.equal(launch.x,61);assert.equal(launch.y,259);
assert(launch.x-16>=40&&launch.x+18<=82,'buggy fits actual garage opening');
assert.equal(art.stateAt(13.8).buggy.y,281,'wheels reach road');
assert(art.stateAt(18.99).buggy.x-16>400,'buggy fully drives offscreen before hiding');
assert.equal(art.stateAt(19).buggy.visible,false);assert(art.stateAt(art.still).buggy.visible,'still includes departing buggy');
const a=art.stateAt(4).cranes[0],b=art.stateAt(4.2).cranes[0];
assert(a&&b&&Math.abs(a.hook-b.hook)>3&&Math.abs(a.reach-b.reach)>3,'crane must move its beam through the working site');
assert.equal(art.stateAt(11).cranes.length,2);assert.equal(art.stateAt(art.still).cranes.length,0);
const final=art.stateAt(art.still);
assert(final.structures.every(b=>b.progress===1));assert.equal(final.letters.length,13);
assert.equal(final.letters.filter(l=>l.row===0).map(l=>l.char).join(''),'LUNAR');
assert.equal(final.letters.filter(l=>l.row===1).map(l=>l.char).join(''),'LANDGRAB');
assert(final.letters.every(l=>l.rows===7));
assert.deepEqual(art.stateAt(art.duration),art.stateAt(0));
assert.deepEqual(art.stateAt(-1),art.stateAt(art.duration-1));
assert.deepEqual(art.draw(surface,art.still),art.draw(surface,art.still));
assert.equal(pixelTextCalls,0,'authored pixel title has no font dependency');
for(const page of ['Issues/index.html','Issues/arcade/index.html','Issues/arcade/landgrab-test.html']){
 const html=fs.readFileSync(root+page,'utf8');assert(html.includes('landgrab-attract.js'));assert(html.indexOf('landgrab-attract.js')<html.indexOf('attract-player.js'));
}
assert(fs.readFileSync(root+'Issues/arcade.js','utf8').includes("'059-moon-orchard':'landgrab'"));
assert(fs.readFileSync(root+'Issues/arcade/attract-player.js','utf8').includes('landgrab:window.LandgrabAttract'));
assert(fs.readFileSync(root+'Issues/arcade/index.html','utf8').includes('data-game="moon" data-attract="landgrab"'));
const meta=JSON.parse(fs.readFileSync(root+'pieces/059-moon-orchard/meta.json','utf8'));assert.equal(meta.title,'Lunar Landgrab');assert.equal(meta.wip,false);
assert.equal(JSON.parse(fs.readFileSync(root+'Issues/arcade/landgrab-test.meta.json','utf8')).wip,true);
assert(fs.readFileSync(root+'pieces/059-moon-orchard/orchard.js','utf8').includes("a.download = 'lunar-landgrab.png'"));
assert(!fs.readFileSync(root+'pieces/059-moon-orchard/index.html','utf8').includes('Lunar Founder'));
console.log({frames,constructionSamples:constructionFrames,buildings:8,architecturalProfiles:8,explosions:0,titleLetters:13,duration:art.duration,still:art.still});
