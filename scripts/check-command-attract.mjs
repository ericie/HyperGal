// Check actual pixel silhouettes at contact, rebound direction and a stable title.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const source=fs.readFileSync(fileURLToPath(new URL('../Issues/arcade/command-attract.js',import.meta.url)),'utf8');
const context=new Proxy({}, {get:(target,key)=>target[key]??(()=>{}),set:(target,key,value)=>(target[key]=value,true)});
const canvas=()=>({width:320,height:240,getContext:()=>context});
const env={window:{},document:{createElement:canvas}};
vm.createContext(env);
vm.runInContext(source.replace('window.CommandAttract={','window.testGlyphs=glyphs;window.CommandAttract={'),env);
const art=env.window.CommandAttract,glyphs=env.window.testGlyphs;
const pixels=letter=>{
 const result=new Set();
 if(!letter.visible)return result;
 glyphs[letter.char].forEach((row,y)=>[...row].forEach((bit,x)=>{
  if(bit!=='1')return;
  for(let a=0;a<6;a++)for(let b=0;b<6;b++){
   const xx=Math.round(letter.x)+x*6+a,yy=Math.round(letter.y)+y*6+b;
   if(xx>=0&&xx<320&&yy>=0&&yy<240)result.add(yy*320+xx);
  }
 }));
 return result;
};
const final=art.titleState(art.still);
assert.equal(final.length,13);
assert.equal(final.filter(l=>l.side===0).map(l=>l.char).join(''),'MUTUAL');
assert.equal(final.filter(l=>l.side===1).map(l=>l.char).join(''),'COMMAND');
assert(final.every(l=>l.phase==='settled'));
assert.deepEqual(art.titleState(art.fadeAt-.1),final,'the finished letters must stop');
for(let i=0;i<6;i++){
 const top=final.find(l=>l.side===0&&l.index===i),bottom=final.find(l=>l.side===1&&l.index===i);
 assert.equal(top.impactAt,bottom.impactAt);
 const at=art.titleState(top.impactAt),upper=at.find(l=>l.side===0&&l.index===i),lower=at.find(l=>l.side===1&&l.index===i);
 const a=pixels(upper),b=pixels(lower);
 assert(![...a].some(p=>b.has(p)),`pair ${i} must not penetrate at contact`);
 assert([...a].some(p=>b.has(p+320)||b.has(p-320)||b.has(p+1)||b.has(p-1)),`pair ${i} must visibly touch`);
 const before=art.titleState(top.impactAt-.005),after=art.titleState(top.impactAt+.005);
 assert(before.find(l=>l.side===0&&l.index===i).y<upper.y);
 assert(before.find(l=>l.side===1&&l.index===i).y>lower.y);
 assert(after.find(l=>l.side===0&&l.index===i).y<upper.y,'upper letter must recoil upward');
 assert(after.find(l=>l.side===1&&l.index===i).y>lower.y,'lower letter must recoil downward');
 if(i>0)assert(top.impactAt>final.find(l=>l.side===0&&l.index===i-1).impactAt,'contacts must arrive in order');
}
let titleFrames=0;
for(let t=art.titleAt;t<art.titleSettledAt+.15;t+=1/240){
 const occupied=new Map();
 for(const [i,letter] of art.titleState(t).entries())for(const p of pixels(letter)){
  assert(!occupied.has(p),`letters ${occupied.get(p)}/${i} penetrate at ${t}`);occupied.set(p,i);
 }
 titleFrames++;
}
const surface=canvas();
assert.equal(art.draw(surface,4.9).exchange.warning,'MISSILES INCOMING');
const together=art.draw(surface,4.9).exchanges;
assert.equal(together.length,2);
assert.equal(together[0].inverted,true);assert.equal(together[1].inverted,false);
assert.equal(together[0].answer,'Both');assert.equal(together[1].answer,'Both');
assert.notEqual(together[0].panelColor,together[1].panelColor);
for(const console of together){
 const channels=console.panelColor.match(/[a-f\d]{2}/g).map(n=>parseInt(n,16)/255);
 assert(Math.max(...channels)>.8,'console backgrounds must be brightly saturated');
 assert.equal(console.textColor,'#ffffff');assert.equal(console.textSize,2,'all console lines use the same size');
 const linear=channels.map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
 const luminance=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
 assert(1.05/(luminance+.05)>=4.5,'white console text must remain readable');
}
let staggeredFrames=0;
let priorTop=6,priorBottom=126;
for(let t=0;t<art.landEntryAt;t+=1/120){
 const state=art.draw(surface,t),[top,bottom]=state.exchanges;
 const delayedBottom=art.draw(surface,Math.max(0,t-art.consoleLag)).exchanges[1];
 for(const field of ['warning','prompt','question','answer']){
  assert(top[field].length<=bottom[field].length,'bottom console always leads');
  assert.equal(top[field],delayedBottom[field],'top typing follows the bottom by the authored lag');
  if(top[field].length<bottom[field].length)staggeredFrames++;
 }
 assert(top.bounds.y+top.bounds.height<bottom.bounds.y,'panels must remain separate');
 assert(top.bounds.y<=priorTop&&bottom.bounds.y>=priorBottom,'consoles leave toward their respective screen edges');
 assert.equal(state.landOffsets,undefined,'lands must wait for consoles to leave');
 priorTop=top.bounds.y;priorBottom=bottom.bounds.y;
}
assert(staggeredFrames>100,'typing must visibly differ, rather than reveal in sync');
const [topGone,bottomGone]=art.draw(surface,art.landEntryAt-.001).exchanges;
assert(topGone.bounds.y+topGone.bounds.height<0&&bottomGone.bounds.y>240,'both consoles must clear before the lands');
let previousOffsets=[-56,56];
for(let t=art.landEntryAt;t<=art.combatAt;t+=1/120){
 const state=art.draw(surface,t),[top,bottom]=state.landOffsets;
 assert.equal(state.exchanges,null);
 assert(top<=0&&bottom>=0&&Math.abs(top+bottom)<1e-8,'lands enter together from top and bottom');
 assert(top>=previousOffsets[0]-1e-8&&bottom<=previousOffsets[1]+1e-8,'both lands move inward');
 previousOffsets=[top,bottom];
}
assert(art.draw(surface,art.combatAt).landOffsets.every(value=>value===0));
const departing=art.draw(surface,art.landExitAt+.4);
assert(departing.landOffsets[0]<0&&departing.landOffsets[1]>0);
assert.equal(art.draw(surface,art.landExitAt+art.landExitDuration+.001).phase,'cleared');
assert(art.titleState(art.titleAt-.001).every(l=>!l.visible),'lands clear before letters enter');
assert.equal(art.draw(surface,art.still).phase,'title');
let missiles=0,defenses=0,impacts=0;
for(let t=art.combatAt;t<art.landExitAt;t+=1/24){const state=art.draw(surface,t);missiles+=state.missiles;defenses+=state.interceptors;impacts+=state.impacts;}
assert(missiles>0&&defenses>0&&impacts>0,'brief combat must show attack, defense and impacts');
console.log({consoles:2,typingLag:art.consoleLag,staggeredFrames,whiteTextSize:2,verticalLandEntry:true,letters:13,pairedContacts:6,titleFrames,combat:{missiles,defenses,impacts},stableStill:art.still});
