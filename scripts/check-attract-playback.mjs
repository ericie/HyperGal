// Shared asynchronous artwork readiness must preserve synchronous-film behavior.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../Issues/arcade/attract-player.js',import.meta.url),'utf8');
const node=()=>({attributes:{},dataset:{},listeners:{},classes:new Set(),classList:{},addEventListener(k,f){this.listeners[k]=f},setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},hasAttribute(k){return k in this.attributes}});
function setup(reduceInitially=false){
 let loaded=false,reduced=reduceInitially,intersection,mediaChange,visibilityChange,timer,now=0,resolve;
 const ready=new Promise(r=>resolve=r),calls={onward:[],asteroids:[]},toggle=node(),player={open:false},mutations=[];
 toggle.classList.contains=()=>false;toggle.setAttribute('aria-pressed','false');
 const links=['onward','asteroids'].map(key=>{
  const link=node(),canvas={width:1,height:1,dataset:{},getBoundingClientRect:()=>({width:320,height:240})};link.dataset.attract=key;link.querySelector=()=>canvas;link.classList.add=c=>link.classes.add(c);link.classList.remove=c=>link.classes.delete(c);return link;
 });
 const env={window:{OnwardAttract:{duration:22.4,still:17.5,ready,draw(c,t){calls.onward.push(t);return {ready:loaded};}},AsteroidsAttract:{duration:20,still:11,draw(c,t){calls.asteroids.push(t);}}},
 document:{hidden:false,querySelectorAll:()=>links,querySelector:s=>s==='.player'?player:toggle,addEventListener(k,f){visibilityChange=f;}},devicePixelRatio:2,
 matchMedia:()=>({get matches(){return reduced},addEventListener(k,f){mediaChange=f;}}),performance:{now:()=>now},
 setTimeout(f){timer=f;return 1},clearTimeout(){timer=null},IntersectionObserver:class{constructor(f){intersection=f;}observe(){}},ResizeObserver:class{observe(){}},MutationObserver:class{constructor(f){this.f=f;}observe(target){mutations.push({target,fn:this.f});}}};
 vm.createContext(env);vm.runInContext(source,env);
 return {links,calls,toggle,env,player,mutations,get timer(){return timer},show(){intersection(links.map(target=>({target,isIntersecting:true})));},tick(){now+=120;const fn=timer;assert(fn);fn();},async load(){loaded=true;resolve(true);await ready;await Promise.resolve();},reduce(){reduced=true;mediaChange();},hide(){intersection(links.map(target=>({target,isIntersecting:false})));},visibilityChange:()=>visibilityChange()};
}
const sim=setup();sim.show();assert(!sim.links[0].classes.has('attract-ready'));assert(sim.links[1].classes.has('attract-ready'));
sim.tick();sim.tick();assert(sim.calls.onward.every(t=>t===0),'cloud loading must not skip the opening');assert(sim.calls.asteroids.at(-1)>0,'existing films continue while new film loads');
await sim.load();assert(sim.links[0].classes.has('attract-ready'));assert.equal(sim.calls.onward.at(-1),0);sim.tick();assert(sim.calls.onward.at(-1)>0);
assert.equal(sim.links[0].querySelector().width,480);
sim.links[0].listeners.focus();assert.equal(sim.calls.onward.at(-1),17.5);sim.links[0].listeners.blur();
sim.toggle.listeners.click();assert.equal(sim.timer,null);sim.toggle.listeners.click();assert(sim.timer);
sim.env.document.hidden=true;sim.visibilityChange();assert.equal(sim.timer,null);sim.env.document.hidden=false;sim.visibilityChange();assert(sim.timer);
sim.player.open=true;sim.mutations.find(m=>m.target===sim.player).fn();assert.equal(sim.timer,null);sim.player.open=false;sim.mutations.find(m=>m.target===sim.player).fn();assert(sim.timer);
sim.reduce();assert.equal(sim.calls.onward.at(-1),17.5);assert.equal(sim.calls.asteroids.at(-1),11);assert.equal(sim.timer,null);
sim.hide();assert(sim.links.every(l=>l.querySelector().width===1&&l.querySelector().height===1));
const still=setup(true);still.show();assert(!still.links[0].classes.has('attract-ready'));await still.load();assert(still.links[0].classes.has('attract-ready'));assert.equal(still.calls.onward.at(-1),17.5);assert.equal(still.timer,null);
console.log('Readiness/fallback, held opening clock, legacy playback, reduced-motion load, pause, focus, hidden/player/offscreen suspension and DPR sizing pass.');
