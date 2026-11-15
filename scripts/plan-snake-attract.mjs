// Re-plan the 36 adjoining letter strokes offline; playback only decodes routes.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const path = fileURLToPath(new URL('../Issues/arcade/snake-attract.js', import.meta.url));
const source = readFileSync(path, 'utf8');
const marker = '  // Precomputed collision-free exits';
const prefix = source.slice(0, source.indexOf(marker));
if (!prefix) throw new Error('Missing evacuation marker');
const env = {};
vm.createContext(env);
vm.runInContext(prefix + 'globalThis.geometry={fragments,cell};})();', env);
function plan(fragments,cell) {
  const directions=[[1,0],[0,1],[-1,0],[0,-1]];
  const minX=-135,minZ=-110,cols=271,rows=221,total=cols*rows;
  const index=(x,z)=>(z-minZ)*cols+x-minX;
  const inGrid=(x,z)=>x>=minX&&x<minX+cols&&z>=minZ&&z<minZ+rows;
  const widths=[...new Set(fragments.map(f=>f.width))];
  function occupied(points,reach){
    const cells=new Set();
    const radius=Math.ceil(reach/cell-1e-8)-1;
    // Strict interior reservations allow the title's initial edges to touch.
    for(const [x,z] of points)for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++)if(inGrid(x+dx,z+dz))cells.add(index(x+dx,z+dz));
    return cells;
  }
  const travel=new Uint16Array(fragments.length),frames=[travel.slice()];
  const visited=new Uint32Array(total),parents=new Int32Array(total),queue=new Int32Array(total);
  let search=0;
  function nextStep(f,own,counts,body){
    const head=body.at(-1),[x,z]=head;
    if(x<=minX)return [x-1,z];if(x>=minX+cols-1)return [x+1,z];
    if(z<=minZ)return [x,z-1];if(z>=minZ+rows-1)return [x,z+1];
    // Ignore only the neck in the snake's own clearance mask; the rest of its
    // body is an obstacle too. Other snakes' entire bodies remain reserved.
    const self=occupied(body.slice(0,-Math.ceil(2*f.width/cell)-1),f.width);
    const blocked=id=>counts[id]-(own.has(id)?1:0)+(self.has(id)?1:0)>0;
    const start=index(x,z);let read=0,write=1,goal=-1;queue[0]=start;visited[start]=++search;
    const previous=body.at(-2),dx=x-previous[0],dz=z-previous[1];
    const forward=directions.findIndex(d=>d[0]===dx&&d[1]===dz);
    let straight=0;
    for(let j=body.length-1;j>0;j--){
      if(body[j][0]-body[j-1][0]!==dx||body[j][1]-body[j-1][1]!==dz)break;
      straight++;
    }
    const order=forward<0?[0,1,2,3]:[forward,(forward+1)%4,(forward+3)%4,(forward+2)%4];
    while(read<write){
      const current=queue[read++],cx=current%cols,cz=Math.floor(current/cols);
      if(cx===0||cx===cols-1||cz===0||cz===rows-1){goal=current;break;}
      for(const d of order){
        if(current===start&&forward>=0&&d===(forward+2)%4)continue;
        if(current===start&&forward>=0&&straight<Math.ceil(f.width/cell)&&d!==forward)continue;
        const [a,b]=directions[d],nx=cx+a,nz=cz+b;
        if(nx<0||nx>=cols||nz<0||nz>=rows)continue;
        const next=nz*cols+nx;
        if(visited[next]===search||blocked(next))continue;
        visited[next]=search;parents[next]=current;queue[write++]=next;
      }
    }
    if(goal<0)return null;
    while(parents[goal]!==start&&goal!==start)goal=parents[goal];
    return [goal%cols+minX,Math.floor(goal/cols)+minZ];
  }
  const outside=p=>p[0]*cell< -24.8||p[0]*cell>24.8||p[1]*cell< -18.8||p[1]*cell>19.8;
  let exitFrame=0;
  for(let tick=0;tick<520;tick++){
    const bodies=fragments.map((f,i)=>f.track.slice(travel[i],travel[i]+f.length));
    const masks=widths.map(width=>bodies.map((body,i)=>occupied(body,(fragments[i].width+width)/2)));
    const counts=widths.map(()=>new Uint8Array(total));
    masks.forEach((group,g)=>group.forEach(mask=>{for(const id of mask)counts[g][id]++;}));
    for(let i=0;i<fragments.length;i++){
      const f=fragments[i],body=bodies[i];
      const group=widths.indexOf(f.width);
      const step=nextStep(f,masks[group][i],counts[group],body);
      if(!step)continue;
      f.track.push(step);travel[i]++;
      // Reserve the old and new bodies for the whole step, including turns.
      for(let g=0;g<widths.length;g++){
        const updated=occupied(f.track.slice(travel[i],travel[i]+f.length),(f.width+widths[g])/2);
        for(const id of updated)if(!masks[g][i].has(id))counts[g][id]++;
      }
    }
    frames.push(travel.slice());
    if(fragments.every((f,i)=>f.track.slice(travel[i],travel[i]+f.length).every(outside))){exitFrame=tick+1;break;}
  }
  if(!exitFrame)throw new Error('Snake evacuation did not clear all 36 bodies: '+JSON.stringify(fragments.map((f,i)=>({i,travel:travel[i],head:f.track.at(-1),length:f.length,clear:f.track.slice(travel[i],travel[i]+f.length).every(outside)})).filter(f=>!f.clear)));

  return {fragments,frames,exitFrame};
}
const {fragments,frames}=plan(env.geometry.fragments,env.geometry.cell);
const routes=fragments.map((f,i)=>{
  let moves='';
  for(let frame=1;frame<frames.length;frame++){
    if(frames[frame][i]===frames[frame-1][i]){moves+='.';continue;}
    const head=f.track[f.length-1+frames[frame][i]],previous=f.track[f.length-2+frames[frame][i]];
    moves+=head[0]>previous[0]?'R':head[0]<previous[0]?'L':head[1]>previous[1]?'D':'U';
  }
  return moves.replace(/(.)\1*/g,run=>run[0]+run.length.toString(36)+',');
});
const line='const evacuation = '+JSON.stringify(routes)+';';
const updated=source.replace(/const evacuation = \[[^;]*\];/,line);
if(updated===source && process.argv.includes('--check')) console.log('Snake exit routes are current.');
else if(process.argv.includes('--check')){console.error('Snake exit routes are stale. Run node scripts/plan-snake-attract.mjs');process.exitCode=1;}
else {writeFileSync(path,updated);console.log(`Planned ${fragments.length} exits across ${frames.length-1} motion steps.`);}
