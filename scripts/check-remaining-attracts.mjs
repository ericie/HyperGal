// Native film mechanics, deterministic seeking, finite drawing and complete Arcade wiring.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const films=[['centipede','CentipedeAttract','006-only-centipede','Only Centipede'],['happiness','HappinessAttract','012-happiness-hunter','Happiness Hunter'],['paddle','PaddleAttract','013-paddle','Paddle'],['pacman','PacmanAttract','014-to-big-for-this-world','To Big for This World'],['cloudcutter','CloudcutterAttract','025-cloudcutter','Cloudcutter'],['heap','HeapAttract','026-top-of-the-heap','Top of the Heap'],['frogs','FrogsAttract','038-many-frogs','Many Frogs'],['tetris','TetrisAttract','058-micro-tetris','Bitsy Blocks']];
let drawCalls=0,textCalls=0;
const ctx=new Proxy({globalAlpha:1,fillText(){textCalls++;}},{get:(o,k)=>o[k]??((...args)=>{for(const n of args)if(typeof n==='number')assert(Number.isFinite(n),'nonfinite '+String(k));drawCalls++;}),set:(o,k,v)=>(o[k]=v,true)});
const canvas=()=>({width:800,height:600,getContext:()=>ctx}),env={window:{},document:{createElement:canvas}};vm.createContext(env);
vm.runInContext(fs.readFileSync(root+'Issues/arcade/film-kit.js','utf8'),env);
const summaries=[];
for(const [key,name,slug,title] of films){
 vm.runInContext(fs.readFileSync(root+'Issues/arcade/'+key+'-attract.js','utf8'),env);const a=env.window[name];assert(a&&a.still<a.duration-1.2&&a.still>=0);
 assert.deepEqual(a.stateAt(a.duration),a.stateAt(0));assert.deepEqual(a.stateAt(-.25),a.stateAt(a.duration-.25));assert.deepEqual(a.stateAt(a.still),a.stateAt(a.still));
 for(const p of a.title)if(p.strokes){for(const stroke of p.strokes)for(const [x,y] of stroke)assert(x>=0&&x<=800&&y>=0&&y<=600);}else assert(p.x>=0&&p.y>=0&&p.x+p.size<=800&&p.y+p.size<=600,'title fits '+key);
 let samples=0;for(let t=0;t<a.duration;t+=1/60){a.draw(canvas(),t);samples++;}
 const html=fs.readFileSync(root+'Issues/arcade/'+key+'-test.html','utf8');assert(html.indexOf('film-kit.js')<html.indexOf(key+'-attract.js'));assert(html.indexOf(key+'-attract.js')<html.indexOf('attract-player.js'));assert(html.includes('data-attract="'+key+'"'));assert(html.includes('../../pieces/'+slug+'/index.html'));
 assert.equal(JSON.parse(fs.readFileSync(root+'Issues/arcade/'+key+'-test.meta.json','utf8')).wip,true);
 const meta=JSON.parse(fs.readFileSync(root+'pieces/'+slug+'/meta.json','utf8'));assert.equal(meta.title,title);assert.equal(meta.wip,false);
 for(const page of ['Issues/index.html','Issues/arcade/index.html','Issues/arcade/remaining-test.html']){const s=fs.readFileSync(root+page,'utf8');assert(s.indexOf('film-kit.js')<s.indexOf(key+'-attract.js'));assert(s.indexOf(key+'-attract.js')<s.indexOf('attract-player.js'));}
 assert(fs.readFileSync(root+'Issues/arcade.js','utf8').includes("'"+slug+"':'"+key+"'"));assert(fs.readFileSync(root+'Issues/arcade/attract-player.js','utf8').includes(key+':window.'+name));
 assert(fs.readFileSync(root+'Issues/arcade/index.html','utf8').includes('data-game="'+key+'" data-attract="'+key+'"'));
 summaries.push({key,samples,titleCells:a.title.length});
}
const E=env.window;
const before=E.CentipedeAttract.stateAt(5.99),after=E.CentipedeAttract.stateAt(6);
assert(!before.split&&after.split);assert.equal(after.mushrooms.length,before.mushrooms.length+1);assert(!after.chain.some(p=>p.id===5));assert(after.chain.some(p=>p.id===6));
let highwaySamples=0;
for(let t=0;t<21;t+=.025){const s=E.HappinessAttract.stateAt(t);assert(s.traffic.length>=12);
 for(const a of s.traffic){assert(!(Math.abs(a.x-s.hero.x)<45&&Math.abs(a.y-s.hero.y)<(a.truck?102:72)),'hero overtakes through a clear gap');
 for(const b of s.traffic)if(a!==b&&a.lane===b.lane&&a.y>-110&&a.y<710&&b.y>-110&&b.y<710)assert(Math.abs(a.y-b.y)>(a.truck?53:31)+(b.truck?53:31)+5,'same lane traffic spacing');}highwaySamples++;
}
const paddle=E.PaddleAttract;assert.equal(paddle.stateAt(8).merge,1);assert(paddle.stateAt(8).paddle.height>paddle.sourceLimits.paddleHeight);assert(paddle.ballSpecs.every(b=>b.speed>paddle.sourceLimits.ballSpeed));for(const spec of paddle.ballSpecs)for(let n=0;n<10;n++){const hit=paddle.impact(spec,n),ball=paddle.ballAt(spec,hit.at);assert(Math.abs(ball.y-hit.y)<.001);assert(Math.abs(ball.x-hit.x)<.001);}
const pac=E.PacmanAttract;assert.equal(Array.from(pac.words).join(' '),'TO BIG FOR THIS WORLD');assert.equal(pac.giantRadius,800);assert.equal(pac.stateAt(4.7).small.angle,Math.PI);assert(pac.stateAt(6).small.speed>pac.feedSpeed*3);assert(pac.stateAt(10.8).pellets.every(p=>p.eaten));
const cloud=E.CloudcutterAttract;assert.equal(Array.from(cloud.words).join(' '),'CLOUD CUTTER');assert(cloud.shots.filter(s=>s.hit).length>10);assert.equal(cloud.stateAt(cloud.healedAt).wounds.length,0);assert.equal(cloud.stateAt(cloud.healAt).heal,1);assert.equal(cloud.stateAt(cloud.healedAt).heal,0);
const heap=E.HeapAttract;assert.equal(heap.board.length,6);assert.equal(heap.title.length,0);assert.equal(heap.stateAt(2.7).claims.get('1:0'),'blue');assert.equal(heap.stateAt(3).claims.get('1:0'),'yellow');for(const attack of heap.attacks){const sun=heap.sunAt(attack.hit),target=heap.nodePoint(attack.upper);assert(Math.abs(sun.x-target.x)<.001&&Math.abs(sun.groundY-target.y)<.001,'sun lands on actual climber');}
const frogs=E.FrogsAttract;assert.equal(frogs.routes.length,16);assert(frogs.routes.every(r=>r.nodes.some(n=>n.y<=48)),'all crossing routes reach the far bank');let crossingSamples=0;
for(let t=.001;t<12.5;t+=.025){const s=frogs.stateAt(t);for(const f of s.frogs){for(const v of s.cars)assert(!(Math.abs(f.y-v.y)<20&&Math.abs(f.x-v.x)<v.w/2+9),'frog clears moving traffic along entire hop');for(const other of s.frogs)if(f.id<other.id)assert(Math.hypot(f.x-other.x,f.y-other.y)>=18,'reserved frogs never stack');}crossingSamples++;}
const tetris=E.TetrisAttract;assert.equal(Array.from(tetris.words).join(' '),'BITSY BLOCKS');assert.equal(tetris.events.at(-1).full.length,4);for(const e of tetris.events){assert.equal(e.shape.length,4);assert(e.shape.every(([x,y])=>!e.before[e.row+y][e.target+x]));assert(e.after.every(row=>!row.every(Boolean)));}assert(tetris.stateAt(10).camera.zoom>4);
assert.equal(textCalls,0,'no font-dependent text');assert.equal(JSON.parse(fs.readFileSync(root+'Issues/arcade/remaining-test.meta.json','utf8')).wip,true);
console.log(JSON.stringify({films:summaries,highwaySamples,crossingSamples,drawCalls,fontTextCalls:textCalls},null,2));
