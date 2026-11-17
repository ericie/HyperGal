// Bake safe moving-traffic crossings once; playback performs no route search.
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const path=root+'Issues/arcade/frogs-attract.js',source=fs.readFileSync(path,'utf8');
const planner=" const routes=[];\n // Search complete future crossings, including moving cars and already reserved paths.\n // A small beam bounds work while retaining escapes that a greedy hop would miss.\n for(let id=0;id<16;id++){\n  const start=id*.15,col=(id*7+7)%16,color=pigments[id%pigments.length];\n  let beam=[{nodes:[{x:40+col*48,y:576}],score:0}],finished=null;\n  for(let step=0;step<29;step++){\n   const time=start+step*.52,slices=[];\n   for(let k=0;k<=8;k++){\n    const dt=.52*k/8,tt=time+dt;\n    slices.push({p:ease(k/8),cars:carsAt(tt),frogs:routes.map(r=>atRoute(r,tt)).filter(Boolean)});\n   }\n   const next=new Map();\n   for(const candidate of beam){\n    const a=candidate.nodes.at(-1),moves=a.y<=48?[[0,0]]:[[-48,-48],[0,-48],[48,-48],[-48,0],[48,0],[0,0],[-48,48],[0,48],[48,48]];\n    for(const [dx,dy] of moves){const b={x:a.x+dx,y:a.y+dy};if(b.x<28||b.x>772||b.y<48||b.y>576)continue;\n     let safe=true;\n     for(const slice of slices){const x=mix(a.x,b.x,slice.p),y=mix(a.y,b.y,slice.p);\n      if(slice.cars.some(v=>Math.abs(y-v.y)<23&&Math.abs(x-v.x)<v.w/2+11)||slice.frogs.some(f=>Math.hypot(f.x-x,f.y-y)<24)){safe=false;break;}\n     }\n     if(!safe)continue;\n     const score=(576-b.y)*4-Math.abs(b.x-(80+hash(id+37)*640))*.05+(dx===0?1:0),key=b.x+':'+b.y;\n     if(!next.has(key)||score>next.get(key).score)next.set(key,{nodes:[...candidate.nodes,b],score});\n    }\n   }\n   beam=[...next.values()].sort((a,b)=>b.score-a.score).slice(0,80);\n   if(!beam.length)throw Error('No reserved crossing for frog '+id+' at '+step);\n  }\n  finished=beam[0];routes.push({id,start,color,nodes:finished.nodes});\n }\n";
const env={window:{}};vm.createContext(env);
vm.runInContext(fs.readFileSync(root+'Issues/arcade/film-kit.js','utf8'),env);
vm.runInContext(source.slice(0,source.indexOf(' // BEGIN RESERVED ROUTES'))+planner+'\nwindow.plannedRoutes=routes;\n})();',env);
const generated=' // BEGIN RESERVED ROUTES\n // Preplanned by scripts/build-frogs-attract-routes.mjs; no startup search.\n const routes='+JSON.stringify(env.window.plannedRoutes)+';\n // END RESERVED ROUTES';
const next=source.replace(/ \/\/ BEGIN RESERVED ROUTES[\s\S]*? \/\/ END RESERVED ROUTES/,generated);
if(process.argv.includes('--check')){if(next!==source)throw Error('Stale frog crossing routes');console.log('Reserved frog routes are current.');}
else{fs.writeFileSync(path,next);console.log('Baked '+env.window.plannedRoutes.length+' safe crossing routes.');}
