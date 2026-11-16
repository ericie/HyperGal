// Original, repeatable vector floor patterns. The supplied blacklight carpet
// photo informs only the entrance's colors and geometric vocabulary.
// No photographed pixels, people, lettering or traced motifs are included.
import {writeFileSync} from 'node:fs';

const out = new URL('../Issues/arcade/assets/', import.meta.url);
const n = x => +x.toFixed(2);
function random(seed) {
  return () => {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
}
function svg(name,size,ground,content) {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n<!-- Original code-authored repeating geometry; scripts/build-arcade-patterns.mjs -->\n<path fill="${ground}" d="M0 0h${size}v${size}H0z"/>\n${content}\n</svg>\n`;
  writeFileSync(new URL(name,out),source);
  console.log(`${name}: ${Buffer.byteLength(source).toLocaleString()} bytes`);
}
function flecks(r,size,count,colors,opacity) {
  const paths=colors.map(()=>[]);
  for(let i=0;i<count;i++) {
    const x=n(r()*size),y=n(r()*size),w=n(1+r()*3.1),h=n(1+r()*3.1);
    paths[Math.floor(r()*colors.length)].push(`M${x} ${y}l${w} -.7 .6 ${h} -${w} .5z`);
  }
  return paths.map((p,i)=>`<path fill="${colors[i]}" opacity="${opacity}" d="${p.join('')}"/>`).join('\n');
}
function wrapped(shape,x,y,angle,size) {
  let result='';
  for(const dx of [-size,0,size]) for(const dy of [-size,0,size]) {
    if(x+dx < -110 || x+dx > size+110 || y+dy < -110 || y+dy > size+110) continue;
    result+=`<g transform="translate(${n(x+dx)} ${n(y+dy)}) rotate(${n(angle)})">${shape}</g>`;
  }
  return result;
}

// An irregular scatter, not a grid: fine colored tufts, larger chips,
// open coils, rings and hollow diamonds. Edge copies make the repeat seamless.
{
  const r=random(61743),s=800;
  const colors=['#ed29d7','#7755ff','#87d85b','#42bfa9','#ee795c','#a6a3ce'];
  let content=flecks(r,s,1150,colors,.42);
  const curls=[
    'M-62 18C-91-23-27-43-28-7S19 40 24 2 68-27 69 6',
    'M-66 4C-72-33-33-38-29-7S13 30 13 0 51-32 55-4 82 19 88 1',
    'M-31-67C18-66 31-34-6-26S-33 11-5 15 38 48 2 66',
    'M-62-16C-51-48-6-43-7-12S-37 18-7 21 16-14 31-8 47 27 68 13'
  ];
  // Jittered cells keep the large shapes from piling up, without a visible repeat grid.
  for(let row=0;row<6;row++) for(let col=0;col<6;col++) {
    const x=(col+.15+r()*.7)*s/6,y=(row+.15+r()*.7)*s/6;
    const color=colors[Math.floor(r()*5)],kind=Math.floor(r()*5),angle=r()*360;
    let shape;
    if(kind<2) shape=`<path d="${curls[Math.floor(r()*curls.length)]}" fill="none" stroke="${color}" stroke-width="${n(4+r()*2)}" stroke-linecap="round" opacity=".68"/>`;
    if(kind===2) shape=`<circle r="${n(10+r()*10)}" fill="none" stroke="${color}" stroke-width="4" opacity=".64"/>`;
    if(kind===3) shape=`<path d="M-13-13H13V13H-13z" fill="none" stroke="${color}" stroke-width="4" opacity=".62"/>`;
    if(kind===4) shape=`<path d="M-13 12 0-16 14 12z" fill="${color}" opacity=".67"/>`;
    content+=wrapped(shape,x,y,angle,s);
  }
  for(let i=0;i<80;i++) {
    const x=n(r()*s),y=n(r()*s),d=n(4+r()*6),color=colors[Math.floor(r()*colors.length)];
    const shape=i%3===0?`<circle r="${d/2}" fill="none" stroke="${color}" stroke-width="2.5"/>`:
      i%3===1?`<path d="M-${d/2} -${d/2}h${d}v${d}h-${d}z" fill="${color}"/>`:
      `<path d="M-${d} ${d/2} 0-${d} ${d} ${d/2}z" fill="${color}"/>`;
    content+=wrapped(`<g opacity=".65">${shape}</g>`,x,y,r()*360,s);
  }
  svg('blacklight-carpet.svg',s,'#090711',content);
}

// Broad, interlocking angular ribbons: a quieter violet passage.
{
  const s=560,r=random(9185);
  let content=flecks(r,s,280,['#34304d','#3d2851','#223640'],.36);
  const paths=[
    'M-65 68H75V8H149V135H234V65H334V-30',
    'M286-35V49H402V146H511V84H610',
    'M-40 294H51V204H148V314H256V234H365V345H462V245H605',
    'M-45 491H82V419H187V544H286V435H392V512H477V402H605'
  ];
  content+=paths.map((d,i)=>`<path d="${d}" fill="none" stroke="${i%2?'#231c38':'#22213e'}" stroke-width="35"/><path d="${d}" fill="none" stroke="#544366" stroke-opacity=".35" stroke-width="1.5"/>`).join('');
  svg('violet-ribbons.svg',s,'#0c0a15',content);
}

// Dark teal/plum woven checks; the hatching is part of the floor tile.
{
  const s=320,cell=80;
  let content='';
  for(let row=0;row<4;row++) for(let col=0;col<4;col++) {
    const x=col*cell,y=row*cell,odd=(col+row)%2;
    content+=`<path fill="${odd?'#12231f':'#181923'}" d="M${x} ${y}h80v80h-80z"/>`;
    let d='';
    for(let i=5;i<80;i+=9) d+=odd?`M${x+i} ${y+5}v70`:`M${x+5} ${y+i}h70`;
    content+=`<path d="${d}" fill="none" stroke="${odd?'#254037':'#343142'}" stroke-opacity=".38" stroke-width="1.2"/>`;
  }
  svg('woven-checks.svg',s,'#101817',content);
}

// Circular rubber-floor studs, drawn as flat concentric cuts, without shading.
{
  const s=320,r=random(4051);
  let content=flecks(r,s,100,['#49303d','#352b40'],.23);
  for(let row=0;row<4;row++) for(let col=0;col<4;col++) {
    const x=40+col*80,y=40+row*80;
    content+=`<circle cx="${x}" cy="${y}" r="27" fill="#20151f"/><circle cx="${x}" cy="${y}" r="22" fill="none" stroke="#49273d" stroke-opacity=".6" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="12" fill="none" stroke="#301c2d" stroke-width="1"/>`;
  }
  svg('plum-studs.svg',s,'#100c13',content);
}
