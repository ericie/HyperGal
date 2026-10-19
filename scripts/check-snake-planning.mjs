import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html = fs.readFileSync(new URL('../pieces/007-hydra/index.html', import.meta.url), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(source);
const node = { getContext: () => ({}) };
const context = vm.createContext({ document: { getElementById: () => node }, matchMedia: () => ({ matches: false }), assert, console });
vm.runInContext(source.slice(0, source.indexOf("      palettePanel.addEventListener")) + `
GW = 40; GH = 40;
const leader = {body: Array.from({length:20}, (_,i)=>({x:20-i,y:20})), dir:{x:1,y:0},grow:0,eatStreak:0,aggression:0.8};
snakes = [leader]; mouse = {x:28,y:20};
assert.equal(isPlanningLeader(leader), true);
assert.equal(isPlanningLeader({...leader,body:leader.body.slice(0,9)}), false);
let future = futureBodyAfter(leader,{x:21,y:20},false);
assert.equal(leaderSurvivalHorizon(leader,future[0],future,leader.dir,24,0),24,'open route survives deep lookahead');
assert.equal(leaderFoodRouteSafe(leader,future[0],future,leader.dir,0,20),true,'open food route remains escapable');
// A one-cell corridor ends at food. Body growth prevents the tail opening it.
const walls = [];
for(let x=0;x<40;x++) { walls.push({x,y:19},{x,y:21}); }
walls.push({x:29,y:20});
snakes = [leader,{body:walls,dir:{x:1,y:0}}];
assert.equal(leaderFoodRouteSafe(leader,future[0],future,leader.dir,50,20),false,'reject food at sealed corridor end');
assert.equal(leaderSurvivalHorizon(leader,future[0],future,leader.dir,24,50),7,'detect corridor death beyond old seven-step search');
// Growth from food must be included in future survival, not just existing growth.
assert.equal(leaderSurvivalHorizon(leader,future[0],future,leader.dir,24,0),7,'food growth does not invent a corridor exit');
console.log('Snake planning: syntax, leader selection, open routes, trapped food, and deep dead ends passed.');
`, context);
