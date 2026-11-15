(() => {
  'use strict';
  const canvas = document.getElementById('kaleidoscope');
  const ctx = canvas.getContext('2d', { alpha: false });
  const source = document.createElement('canvas');
  const ink = source.getContext('2d');
  const filtered = document.createElement('canvas');
  const filterInk = filtered.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2, DEG = Math.PI / 180;
  const palettes = {
    candy: ['#ff548f', '#ffcc49', '#48f1df', '#b486ff', '#ff814d', '#7baaff'],
    mineral: ['#149486', '#b467b6', '#e2c28b', '#395cbb', '#85d5b5', '#de758e'],
    amber: ['#f5b244', '#c76b23', '#ffdc89', '#883b36', '#e7dfb6', '#b98854'],
    lagoon: ['#42dac6', '#1a6d9b', '#a6eed5', '#6a71c0', '#d1ebc0', '#bf76a0'],
    glass: ['#d0e9f4', '#aabfd6', '#e8d4ac', '#8cadd1', '#e9e8ef', '#b0d6d0'],
    stained: ['#f53343', '#286cdb', '#f7bd22', '#169a6b', '#a249b4', '#ef7135']
  };
  const definitions = [];
  const range = (key, label, value, min, max, step, unit = '') => ({key, label, value, min, max, step, unit, type: 'range'});
  const choice = (key, label, value, options) => ({key, label, value, options, type: 'select'});
  function group(name, fields) { fields.forEach(field => definitions.push({...field, group: name})); }
  group('optics', [
    choice('mirror', 'Mirror system', 'field', [['field','Full field'],['mandala','Two-mirror mandala'],['lattice','Three-mirror tessellation'],['box','Four-mirror chamber'],['tapered','Tapered mirror tunnel']]),
    range('points', 'Mirror points', 6, 3, 24, 1),
    range('angle', 'Mirror rotation', 0, -180, 180, 1, '°'),
    range('zoom', 'Magnification', 100, 30, 240, 1, '%'),
    range('aperture', 'Aperture', 92, 30, 100, 1, '%'),
    range('centerX', 'Optical center X', 0, -50, 50, 1, '%'),
    range('centerY', 'Optical center Y', 0, -50, 50, 1, '%'),
    range('depth', 'Tunnel depth', 6, 2, 12, 1),
    range('twist', 'Tunnel twist', 8, -60, 60, 1, '°'),
    range('reflectivity', 'Mirror reflectivity', 90, 40, 100, 1, '%')
  ]);
  group('objects', [
    choice('cell', 'Object cell', 'dry', [['dry','Dry fragments'],['oil','Liquid suspension'],['wand','Gravity wand'],['wheels','Counter-rotating wheels'],['image','Teleidoscope · image']]),
    choice('material', 'Material', 'prisms', [['prisms','Dichroic prisms'],['beads','Lampworked glass beads'],['liquid','Liquid & bubbles'],['filaments','Glass filaments'],['mineral','Agate & minerals'],['foil','Metal foil & mica']]),
    range('density', 'Object density', 100, 10, 220, 1, '%'),
    range('size', 'Object size', 100, 25, 240, 1, '%'),
    range('glitter', 'Glitter', 100, 0, 180, 1, '%'),
    range('transparency', 'Transparency', 25, 0, 95, 1, '%'),
    range('iridescence', 'Thin-film interference', 80, 0, 100, 1, '%'),
    range('separation', 'Wheel separation', 35, 0, 100, 1, '%'),
    range('cellAngle', 'Cell rotation', 0, -180, 180, 1, '°')
  ]);
  group('light', [
    choice('palette', 'Palette', 'candy', [['candy','Candy glass'],['mineral','Mineral'],['amber','Amber & brass'],['lagoon','Lagoon'],['glass','Clear glass'],['stained','Stained glass']]),
    choice('lighting', 'Illumination', 'transmitted', [['transmitted','Transmitted light'],['side','Side-lit / dark field'],['polarized','Crossed polarizers']]),
    {key:'background',label:'Background',value:'#100c29',type:'color'},
    range('hue', 'Hue rotation', 0, 0, 360, 1, '°'),
    range('saturation', 'Saturation', 100, 0, 160, 1, '%'),
    range('exposure', 'Light intensity', 100, 30, 180, 1, '%'),
    range('glow', 'Edge glow', 45, 0, 100, 1, '%'),
    range('polarizer', 'Polarizer angle', 45, 0, 180, 1, '°'),
    range('vignette', 'Vignette', 0, 0, 100, 1, '%')
  ]);
  group('motion', [
    range('speed', 'Time scale', 100, 0, 300, 1, '%'),
    range('spin', 'Scope rotation', 4.87, -20, 20, 0.01, '°/s'),
    range('cellSpin', 'Cell rotation speed', 0, -30, 30, 0.1, '°/s'),
    range('drift', 'Internal drift', 100, 0, 300, 1, '%'),
    range('tumble', 'Object tumble', 100, 0, 300, 1, '%'),
    range('viscosity', 'Liquid viscosity', 65, 0, 100, 1, '%'),
    range('gravity', 'Gravity', 0, 0, 100, 1, '%'),
    range('flow', 'Liquid current', 50, 0, 150, 1, '%')
  ]);
  const defaults = Object.fromEntries(definitions.map(d => [d.key, d.value]));
  const presets = {
    original: {name:'Original · glitter & prisms', values:{}},
    brewster: {name:'Brewster · dry glass', values:{mirror:'mandala',points:5,material:'beads',density:160,glitter:10,palette:'stained',background:'#07080e',spin:1.2,cellSpin:2,gravity:45,size:90}},
    oil: {name:'Oil cell · liquid suspension', values:{mirror:'mandala',points:7,cell:'oil',material:'liquid',glitter:8,palette:'lagoon',background:'#060e18',size:165,density:135,spin:0.4,viscosity:84,flow:80,gravity:18,transparency:45,glow:65}},
    darkfield: {name:'Dark field · lampworked beads', values:{mirror:'mandala',points:8,cell:'oil',material:'beads',lighting:'side',background:'#030507',palette:'mineral',glitter:0,spin:-0.4,cellSpin:1.8,density:145,size:145,glow:80,viscosity:75}},
    tapered: {name:'Tapered · infinite chamber', values:{mirror:'tapered',points:5,material:'prisms',depth:9,twist:14,palette:'mineral',background:'#080a14',glitter:25,spin:1.1,reflectivity:95,size:130,zoom:130}},
    tessellation: {name:'Three mirror · tessellation', values:{mirror:'lattice',material:'beads',points:3,palette:'stained',background:'#090b18',glitter:15,density:135,size:135,zoom:100,spin:0.7,cellSpin:2}},
    four: {name:'Four mirror · glass lattice', values:{mirror:'box',material:'filaments',palette:'glass',background:'#070d18',glitter:20,density:130,size:145,zoom:90,spin:1.3,cellSpin:3,glow:65}},
    wand: {name:'Gravity wand · brass & mica', values:{mirror:'mandala',points:6,cell:'wand',material:'foil',palette:'amber',background:'#100c09',density:160,size:110,glitter:25,gravity:80,viscosity:60,spin:0.2,cellSpin:0,cellAngle:-75,glow:20}},
    wheels: {name:'Wheel scope · overlapping glass', values:{cell:'wheels',material:'prisms',separation:65,spin:0,cellSpin:7,density:145,size:145,glitter:0,palette:'stained',points:5,transparency:50}},
    polarized: {name:'Polariscope · interference', values:{mirror:'mandala',points:9,cell:'oil',material:'liquid',lighting:'polarized',polarizer:60,palette:'mineral',background:'#06060b',glitter:0,size:190,density:140,spin:0.5,cellSpin:2.2,iridescence:100,transparency:10}},
    agate: {name:'Agate · mineral sections', values:{mirror:'tapered',points:7,material:'mineral',palette:'amber',background:'#100b0b',glitter:0,spin:0.3,cellSpin:1,density:155,size:165,twist:-5,depth:5,glow:15}},
    filaments: {name:'Filaments · stained glass', values:{mirror:'mandala',points:11,material:'filaments',palette:'stained',background:'#06080d',glitter:5,size:185,density:170,spin:-0.6,cellSpin:2,glow:70}}
  };
  let settings = {...defaults}, seedText = new URLSearchParams(location.search).get('seed') || 'confetti';
  let width = 1, height = 1, radius = 1, scale = 1, time = 0, previous = 0, frame = 0;
  let scopeTurn = 0, cellTurn = 0, paused = motion.matches, repaint = 0;
  let shards = [], prisms = [], glitter = [], films = [], objects = [], image = null;
  let selectedPreset = 'original', seed = 0;
  function validate(input) {
    const result = {};
    for (const d of definitions) {
      const v = input?.[d.key];
      if (d.type === 'range' && typeof v === 'number' && Number.isFinite(v)) result[d.key] = Math.max(d.min, Math.min(d.max, Math.round(v / d.step) * d.step));
      if (d.type === 'select' && d.options.some(o => o[0] === v)) result[d.key] = v;
      if (d.type === 'color' && /^#[\da-f]{6}$/i.test(v)) result[d.key] = v;
    }
    return result;
  }
  try {
    const raw = new URLSearchParams(location.hash.slice(1)).get('scope');
    if (raw && raw.length < 12000) {
      const saved = JSON.parse(raw);
      settings = {...defaults, ...validate(saved.settings)};
      if (typeof saved.seed === 'string') seedText = saved.seed.slice(0,128);
      if (Number.isFinite(saved.time)) time = Math.max(0, Math.min(saved.time, 86400));
      if (Number.isFinite(saved.scopeTurn)) scopeTurn = saved.scopeTurn % TAU;
      if (Number.isFinite(saved.cellTurn)) cellTurn = saved.cellTurn % TAU;
      selectedPreset = 'custom';
    }
  } catch { /* Invalid links fall back to the original arrangement. */ }
  function reseed(suffix) {
    seed = 2166136261;
    for (const c of seedText + suffix) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619) >>> 0;
  }
  function random() {
    seed += 0x6D2B79F5;
    let n = seed;
    n = Math.imul(n ^ n >>> 15, n | 1);
    n ^= n + Math.imul(n ^ n >>> 7, n | 61);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  }
  function arrange() {
    reseed('shards');
    shards = Array.from({length:Math.round(180 * settings.density / 100)}, (_, i) => ({
      r:0.04 + random()*1.08, a:random()*TAU, size:0.012 + random()*0.055,
      phase:random()*TAU, speed:(0.014 + random()*0.025)*(i%2 ? 1 : -1),
      sides:[3,4,6][i%3], color:i%6, hollow:i%4===0, index:i
    }));
    reseed('films'); films = Array.from({length:16}, (_,i)=>makeFilm(i));
    reseed('prisms');
    prisms = Array.from({length:Math.round(100*settings.density/100)}, (_,i)=>({
      r:0.04+random()*1.12, a:random()*TAU, size:0.035+random()**1.4*0.20,
      phase:random()*TAU, speed:(0.008+random()*0.018)*(i%2?1:-1), film:films[i%16], color:i%6, index:i
    }));
    reseed('glitter');
    glitter = Array.from({length:Math.round(4200*settings.glitter/100)}, (_,i)=>({
      r:Math.sqrt(random())*1.2, a:random()*TAU, size:0.0007+random()**3*0.005,
      phase:random()*TAU, speed:0.006+random()*0.022, color:i%6, flare:i%37===0, index:i
    }));
    reseed('objects');
    objects = Array.from({length:Math.round(180*settings.density/100)}, (_,i)=>({
      r:Math.sqrt(random())*1.15, a:random()*TAU, size:0.018+random()**1.5*0.12,
      phase:random()*TAU, speed:(0.009+random()*0.03)*(i%2?1:-1),color:i%6,index:i,
      sprite:makeObject(i)
    }));
  }
  function polygon(x,y,r,sides,angle) {
    ink.beginPath();
    for(let j=0;j<sides;j++) {
      const a=angle+TAU*j/sides, px=x+Math.cos(a)*r, py=y+Math.sin(a)*r;
      if(j===0) ink.moveTo(px,py); else ink.lineTo(px,py);
    }
    ink.closePath();
  }
  function makeFilm(index) {
    const film = document.createElement('canvas');
    film.width = film.height = 256;
    const f = film.getContext('2d');
    const phase = random() * TAU;
    const sides = [3, 4, 6, 8][index % 4];
    const hue = index * 137.508 % 360;
    function contour(k) {
      f.beginPath();
      for (let j = 0; j < sides; j++) {
        const a = j / sides * TAU + phase;
        const r = k;
        const x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r;
        if (j === 0) f.moveTo(x, y); else f.lineTo(x, y);
      }
      f.closePath();
    }
    contour(107);
    f.save(); f.clip();
    const body = f.createRadialGradient(100, 87, 4, 129, 130, 121);
    body.addColorStop(0, `hsla(${hue + 70},100%,80%,0.06)`);
    body.addColorStop(0.48, `hsla(${hue},100%,54%,0.14)`);
    body.addColorStop(0.77, `hsla(${hue + 45},100%,66%,0.35)`);
    body.addColorStop(0.90, `hsla(${hue + 155},100%,70%,0.8)`);
    body.addColorStop(0.97, `hsla(${hue + 250},100%,64%,0.95)`);
    body.addColorStop(1, `hsla(${hue},100%,90%,0.1)`);
    f.fillStyle = body; f.fillRect(0, 0, 256, 256);
    // Thin-film interference: many nested, changing-hue contours at the rim.
    for (let j = 0; j < 18; j++) {
      contour(107 - j * 1.45);
      const ribbon = f.createLinearGradient(25, 40 + j * 3, 229, 210 - j * 2);
      ribbon.addColorStop(0, `hsla(${hue + j * 14},100%,78%,${0.65 - j * 0.025})`);
      ribbon.addColorStop(0.45, `hsla(${hue + 150 + j * 10},100%,60%,0.04)`);
      ribbon.addColorStop(1, `hsla(${hue + 260 + j * 12},100%,74%,0.6)`);
      f.strokeStyle = ribbon; f.lineWidth = 1.4; f.stroke();
    }
    const shine = f.createRadialGradient(81, 61, 0, 81, 61, 66);
    shine.addColorStop(0, '#fffceaaa'); shine.addColorStop(0.25, '#fffce922'); shine.addColorStop(1, '#fffcea00');
    f.fillStyle = shine; f.fillRect(0, 0, 256, 256);
    f.restore();
    contour(107); f.strokeStyle = '#fff5dd99'; f.lineWidth = 0.8; f.stroke();
    return film;
  }
  // All material detail is cached; only placement and optical transforms run per frame.
  function makeObject(index) {
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 192;
    const f = sprite.getContext('2d'), color = palettes[settings.palette][index%6];
    const hue = index * 137.508 % 360, material = settings.material;
    f.translate(96,96);
    const contour = (r) => {
      f.beginPath();
      if (material === 'beads') f.arc(0,0,r,0,TAU);
      else {
        const n = material === 'foil' ? 7 : 64;
        for(let j=0;j<=n;j++) {
          const a=j/n*TAU;
          const wobble=1+0.13*Math.sin(a*3+index)+0.08*Math.sin(a*5+index*2);
          const x=Math.cos(a)*r*wobble, y=Math.sin(a)*r*wobble*0.82;
          if(j===0) f.moveTo(x,y); else f.lineTo(x,y);
        }
        f.closePath();
      }
    };
    if(material==='filaments') {
      f.rotate(index*1.93);
      const g=f.createLinearGradient(-8,0,8,0);
      g.addColorStop(0,color+'30');g.addColorStop(.35,color);g.addColorStop(.5,'#fff5dd');g.addColorStop(.7,color);g.addColorStop(1,color+'20');
      f.fillStyle=g; f.beginPath();f.roundRect(-7,-80,14,160,7);f.fill();
      f.strokeStyle=color;f.lineWidth=2;f.beginPath();f.ellipse(0,-60,21,14,0,0,TAU);f.stroke();
      f.beginPath();f.ellipse(0,58,14,10,0,0,TAU);f.stroke();
    } else {
      contour(70); f.save(); f.clip();
      const body=f.createRadialGradient(-24,-28,0,8,12,92);
      body.addColorStop(0,'#fff5dd');body.addColorStop(.12,color+'a0');body.addColorStop(.55,color+'20');body.addColorStop(.8,color+'d0');body.addColorStop(1,color);
      f.fillStyle=body;f.fillRect(-96,-96,192,192);
      if(material==='mineral') {
        f.fillStyle=color;f.fillRect(-96,-96,192,192);
        for(let j=0;j<24;j++) {
          contour(74-j*2.6); f.strokeStyle=j%4===0?'#fff5ddaa':j%3===0?'#20162caa':color;
          f.lineWidth=1.4+j%3; f.stroke();
        }
      } else if(material==='foil') {
        for(let j=0;j<7;j++) {
          f.beginPath();f.moveTo(0,0);f.lineTo(Math.cos(j/7*TAU)*90,Math.sin(j/7*TAU)*90);
          f.lineTo(Math.cos((j+1)/7*TAU)*90,Math.sin((j+1)/7*TAU)*90);f.closePath();
          f.fillStyle=j%2?'#fff5dd80':'#100c2960';f.fill();
        }
      } else {
        for(let j=0;j<12;j++) {
          contour(70-j*1.5);f.strokeStyle=`hsla(${hue+j*17},95%,75%,${settings.iridescence/100*(.75-j*.04)})`;f.lineWidth=1.4;f.stroke();
        }
        if(material==='beads') {
          f.beginPath();f.ellipse(-18,-30,18,9,-.6,0,TAU);f.fillStyle='#fff5dd9a';f.fill();
          f.beginPath();f.arc(12,14,36,.1,1.9);f.strokeStyle=color;f.lineWidth=2.5;f.stroke();
          f.beginPath();f.arc(0,0,6,0,TAU);f.fillStyle='#100c29a0';f.fill();
        }
      }
      f.restore();contour(70);f.strokeStyle='#fff5ddbb';f.lineWidth=1;f.stroke();
    }
    return sprite;
  }
  function position(b, front=false) {
    const s=settings, liquid=s.cell==='oil'||s.cell==='wand';
    const viscosity=liquid ? 1/(1+s.viscosity*.055) : 1;
    const t=time*3.5*viscosity, drift=s.drift/100;
    const a=b.a+t*b.speed*drift+cellTurn+s.cellAngle*DEG;
    let r=b.r+.095*Math.sin(t*.095+b.phase)*drift;
    let x=Math.cos(a)*r,y=Math.sin(a)*r;
    if(s.cell==='oil') {
      x+=.12*Math.sin(t*.13+b.phase)*s.flow/100;
      y+=.12*Math.cos(t*.17+b.phase*1.4)*s.flow/100;
      y+=(.9-y)*s.gravity/150;
    } else if(s.cell==='wand') {
      const along=((b.r*2.1+t*(.015+s.gravity*.0007))%2.4)-1.2;
      const across=Math.sin(b.a)*(.12+.12*s.flow/100);
      const angle=cellTurn+s.cellAngle*DEG;
      x=across*Math.cos(angle)-along*Math.sin(angle);
      y=across*Math.sin(angle)+along*Math.cos(angle);
    } else if(s.cell==='wheels') {
      const sign=b.index%2?1:-1;
      const wheel=b.a+sign*(cellTurn+t*.06)+s.cellAngle*DEG;
      r=b.r*.72;
      x=Math.cos(wheel)*r+sign*s.separation*.004;
      y=Math.sin(wheel)*r;
    } else {
      y+=(.95-y)*s.gravity/150;
    }
    return {x,y,rotation:b.phase+time*3.5*b.speed*1.8*s.tumble/100+cellTurn*(front?-1:1)};
  }
  function inMirror(x,y,size) {
    if(settings.mirror==='lattice'||settings.mirror==='box') return true;
    const slice=TAU/(settings.points*2);
    return x>-size&&y>-size&&y<x*Math.tan(slice)+size*1.2;
  }
  function alpha(rotation) {
    const s=settings;
    const polarized=s.lighting==='polarized'?(.03+.97*Math.sin(rotation-s.polarizer*DEG)**2):1;
    return (1-s.transparency/100)*polarized;
  }
  function drawPrisms(front) {
    for(let i=0;i<prisms.length;i++) {
      if((i%3===0)!==front) continue;
      const b=prisms[i],p=position(b,front),size=b.size*settings.size/100;
      if(!inMirror(p.x,p.y,size*1.4)) continue;
      ink.save();ink.translate(p.x,p.y);ink.rotate(p.rotation);
      const breath=1+.08*Math.sin(time*.77+b.phase);ink.scale(breath,breath);
      ink.globalAlpha=alpha(p.rotation)*(front?1:.85);
      // A flat glass body remains when interference is turned down.
      polygon(0,0,size*.84,[3,4,6,8][i%4],0);
      ink.fillStyle=palettes[settings.palette][b.color]+'45';ink.fill();
      ink.globalAlpha*=settings.iridescence/100;
      ink.drawImage(b.film,-size,-size,size*2,size*2);ink.restore();
    }
  }
  function drawGlitter(front) {
    ink.save();ink.globalCompositeOperation='screen';
    for(let i=0;i<glitter.length;i++) {
      if((i%3===0)!==front) continue;
      const g=glitter[i],p=position(g,front),size=g.size*settings.size/100;
      if(!inMirror(p.x,p.y,size*5)) continue;
      ink.globalAlpha=(.25+(.5+.5*Math.sin(time*.9+g.phase))*.7)*alpha(p.rotation);
      ink.fillStyle=palettes[settings.palette][g.color];
      polygon(p.x,p.y,size,4,p.rotation);ink.fill();
      if(g.flare) {
        ink.fillStyle='#fffbe6';
        ink.fillRect(p.x-size*3,p.y-size*.22,size*6,size*.44);
        ink.fillRect(p.x-size*.22,p.y-size*3,size*.44,size*6);
      }
    }
    ink.restore();
  }
  function drawObjects() {
    for(const b of objects) {
      const p=position(b),size=b.size*settings.size/100*(settings.material==='filaments'?1.5:1);
      if(!inMirror(p.x,p.y,size*1.5)) continue;
      ink.save();ink.translate(p.x,p.y);ink.rotate(p.rotation);
      ink.globalAlpha=alpha(p.rotation);
      if(settings.lighting==='side') ink.globalCompositeOperation='screen';
      ink.shadowColor=palettes[settings.palette][b.color];
      ink.shadowBlur=source.width*.00015*settings.glow;
      ink.drawImage(b.sprite,-size,-size,size*2,size*2);ink.restore();
    }
  }
  function drawSource() {
    const s=source.width/2;
    ink.setTransform(s,0,0,s,s,s);ink.globalAlpha=1;ink.globalCompositeOperation='source-over';
    ink.fillStyle=settings.background;ink.fillRect(-1,-1,2,2);
    if(settings.lighting==='transmitted') {
      const light=ink.createRadialGradient(.25,.1,0,0,0,1.2);
      light.addColorStop(0,palettes[settings.palette][3]+'35');light.addColorStop(1,settings.background+'00');
      ink.fillStyle=light;ink.fillRect(-1,-1,2,2);
    }
    if(settings.cell==='image'&&image) {
      ink.save();ink.rotate(cellTurn+settings.cellAngle*DEG);
      const cover=2/Math.min(image.width,image.height);
      const iw=image.width*cover,ih=image.height*cover;
      const pan=Math.max(0,iw-2)*.35*Math.sin(time*.09*settings.drift/100);
      ink.drawImage(image,-iw/2+pan,-ih/2,iw,ih);ink.restore();return;
    }
    drawGlitter(false);
    if(settings.material==='prisms') {
      drawPrisms(false);
      for(const b of shards) {
        const p=position(b),size=b.size*settings.size/100*(1+.16*Math.sin(time*.63+b.phase));
        if(!inMirror(p.x,p.y,size*1.3)) continue;
        const color=palettes[settings.palette][b.color];
        polygon(p.x,p.y,size,b.sides,p.rotation);
        ink.globalAlpha=alpha(p.rotation);ink.fillStyle=color;ink.strokeStyle=color;ink.lineWidth=.003;
        ink.shadowColor=color;ink.shadowBlur=s*.0002*settings.glow;
        if(b.hollow) ink.stroke();else ink.fill();ink.shadowBlur=0;
        ink.strokeStyle='#fff5dd';ink.lineWidth=.0016;ink.stroke();
        if(!b.hollow) {polygon(p.x,p.y,size*.56,b.sides,p.rotation);ink.globalAlpha*=.35;ink.fillStyle='#fffbe6';ink.fill();}
      }
      ink.globalAlpha=1;drawPrisms(true);
    } else drawObjects();
    drawGlitter(true);ink.globalAlpha=1;
  }
  function rosette(texture,r,turn,inner=0,reflection=1) {
    const slice=TAU/(settings.points*2), zoom=settings.zoom/100;
    for(let i=0;i<settings.points*2;i++) {
      ctx.save();ctx.rotate(turn+i*slice);
      if(i%2) {ctx.rotate(slice);ctx.scale(1,-1);}
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,-.0006,slice+.0006);ctx.closePath();
      if(inner) {ctx.moveTo(inner,0);ctx.arc(0,0,inner,0,TAU,true);}
      ctx.clip('evenodd');
      ctx.globalAlpha=reflection*(1-(1-settings.reflectivity/100)*((i%2)*.3));
      ctx.drawImage(texture,-r*zoom,-r*zoom,r*zoom*2,r*zoom*2);ctx.restore();
    }
  }
  // Three mirrors: reflect an equilateral object triangle through a triangular lattice.
  // Three-color lattice vertices guarantee the same texture coordinate on shared edges.
  function tessellate(texture,turn) {
    const side=Math.min(width,height)*.48*settings.zoom/100, h=side*Math.sqrt(3)/2;
    ctx.save();ctx.rotate(turn);
    const rows=Math.ceil(radius/h)+2, cols=Math.ceil(radius/side)+rows;
    const point=(i,j)=>({x:(i+j*.5)*side,y:j*h,color:((i+2*j)%3+3)%3});
    function triangle(vertices) {
      const centerX=vertices.reduce((a,p)=>a+p.x,0)/3,centerY=vertices.reduce((a,p)=>a+p.y,0)/3;
      if(Math.hypot(centerX,centerY)>radius+side) return;
      const v=[...vertices].sort((a,b)=>a.color-b.color),p=v[0],q=v[1],r=v[2];
      ctx.save();ctx.beginPath();
      vertices.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.clip();
      ctx.transform((q.x-p.x)/side,(q.y-p.y)/side,(r.x-(p.x+q.x)/2)/h,(r.y-(p.y+q.y)/2)/h,p.x,p.y);
      ctx.drawImage(texture,-side*.5,-side*.5,side*2,side*2);ctx.restore();
    }
    for(let j=-rows;j<=rows;j++) for(let i=-cols;i<=cols;i++) {
      triangle([point(i,j),point(i+1,j),point(i,j+1)]);
      triangle([point(i+1,j),point(i+1,j+1),point(i,j+1)]);
    }
    ctx.restore();
  }
  function box(texture,turn) {
    const size=Math.min(width,height)*.40*settings.zoom/100, count=Math.ceil(radius/size)+2;
    ctx.save();ctx.rotate(turn);
    for(let y=-count;y<=count;y++) for(let x=-count;x<=count;x++) {
      ctx.save();ctx.translate(x*size,y*size);ctx.scale(x%2?-1:1,y%2?-1:1);
      ctx.drawImage(texture,-size/2,-size/2,size+.4,size+.4);ctx.restore();
    }
    ctx.restore();
  }
  function draw() {
    drawSource();let texture=source;
    if(settings.hue!==0||settings.saturation!==100||settings.exposure!==100) {
      filterInk.setTransform(1,0,0,1,0,0);filterInk.clearRect(0,0,filtered.width,filtered.height);
      filterInk.filter=`hue-rotate(${settings.hue}deg) saturate(${settings.saturation}%) brightness(${settings.exposure}%)`;
      filterInk.drawImage(source,0,0);texture=filtered;
    }
    ctx.setTransform(scale,0,0,scale,0,0);ctx.globalAlpha=1;
    ctx.fillStyle=settings.background;ctx.fillRect(0,0,width,height);
    ctx.translate(width*(.5+settings.centerX/100),height*(.5+settings.centerY/100));
    const turn=scopeTurn+settings.angle*DEG-Math.PI/2;
    const r=Math.min(width,height)*.5*settings.aperture/100;
    if(settings.mirror==='lattice') tessellate(texture,turn);
    else if(settings.mirror==='box') box(texture,turn);
    else if(settings.mirror==='tapered') {
      for(let i=0;i<settings.depth;i++) {
        const outer=r*.73**i,inner=i===settings.depth-1?0:outer*.73;
        rosette(texture,outer,turn+i*settings.twist*DEG,inner,(settings.reflectivity/100)**i);
      }
    } else rosette(texture,settings.mirror==='mandala'?r:radius,turn);
    if(settings.vignette) {
      ctx.setTransform(scale,0,0,scale,width/2,height/2);
      const g=ctx.createRadialGradient(0,0,Math.min(width,height)*.08,0,0,radius);
      g.addColorStop(0,'#00000000');g.addColorStop(1,`rgba(0,0,0,${settings.vignette/100})`);
      ctx.fillStyle=g;ctx.fillRect(-width/2,-height/2,width,height);
    }
  }
  function resize() {
    width=innerWidth;height=innerHeight;scale=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
    radius=Math.hypot(width*(1+Math.abs(settings.centerX)/50),height*(1+Math.abs(settings.centerY)/50))/2+2;
    const resolution=Math.min(1400,Math.ceil(Math.hypot(width,height)*scale));
    source.width=source.height=filtered.width=filtered.height=resolution;draw();
  }
  function invalidate() {
    if(!repaint) repaint=requestAnimationFrame(()=>{repaint=0;draw();});
  }
  function tick(now) {
    frame=0;if(paused||document.hidden) return;
    if(previous) {
      const dt=Math.min((now-previous)/1000,.05)*settings.speed/100;
      time+=dt;scopeTurn=(scopeTurn+dt*settings.spin*DEG)%TAU;cellTurn=(cellTurn+dt*settings.cellSpin*DEG)%TAU;
    }
    previous=now;draw();frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);frame=0;previous=0;
    const b=document.getElementById('pause');
    b.setAttribute('aria-label',paused?'Play kaleidoscope':'Pause kaleidoscope');
    b.title=paused?'Play (Space)':'Pause (Space)';
    b.querySelector('path').setAttribute('d',paused?'m9 5 10 7-10 7Z':'M9 5v14M15 5v14');
    b.querySelector('svg').style.fill=paused?'currentColor':'none';
    if(!paused&&!document.hidden&&settings.speed>0) frame=requestAnimationFrame(tick);
  }
  function save() {
    draw();canvas.toBlob(blob=>{
      if(!blob) return;const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='kaleidoscope.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
  }
  function set(values) {
    const next=validate(values),needsObjects=['density','glitter','material','palette','iridescence'].some(k=>k in next&&next[k]!==settings[k]);
    Object.assign(settings,next);selectedPreset='custom';
    if(needsObjects) arrange();
    if('speed' in next) sync();
    if('centerX' in next||'centerY' in next) resize();else invalidate();
  }
  function preset(key) {
    if(!presets[key]) return;
    settings={...defaults,...presets[key].values};selectedPreset=key;
    time=scopeTurn=cellTurn=0;arrange();resize();sync();
  }
  function rearrange() {
    seedText=globalThis.crypto?.randomUUID?.()||String(Date.now());time=scopeTurn=cellTurn=0;arrange();invalidate();
  }
  function link() {
    const url=new URL(location.href);url.searchParams.delete('seed');
    url.hash=new URLSearchParams({scope:JSON.stringify({settings,seed:seedText,time,scopeTurn,cellTurn})}).toString();
    return url.href;
  }
  let drag=null;
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0) return;
    drag={id:event.pointerId,x:event.clientX,angle:settings.cellAngle};canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id) return;
    const angle=((drag.angle+(event.clientX-drag.x)*.35+540)%360)-180;
    set({cellAngle:Math.round(angle)});dispatchEvent(new Event('scopechange'));
  });
  const endDrag=()=>{drag=null;};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
  document.getElementById('pause').addEventListener('click',()=>{paused=!paused;sync();});
  document.getElementById('save').addEventListener('click',save);
  addEventListener('keydown',event=>{
    if(event.target.closest?.('input,select,textarea,button')||event.ctrlKey||event.metaKey||event.altKey) return;
    if(event.code==='Space') {event.preventDefault();paused=!paused;sync();}
    if(event.key.toLowerCase()==='s') save();
    if(event.key.toLowerCase()==='r') rearrange();
  });
  addEventListener('resize',resize);document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',()=>{paused=motion.matches;sync();});
  window.Kaleidoscope={definitions,presets,defaults,set,preset,rearrange,link,
    get settings(){return {...settings};},get selectedPreset(){return selectedPreset;},get hasImage(){return image!==null;},
    async loadImage(file) {
      const url=URL.createObjectURL(file);
      try {
        const loaded=new Image();loaded.src=url;await loaded.decode();
        if(!loaded.naturalWidth) throw new Error('Image has no pixels');
        // Bound uploaded images as well as procedural textures.
        const surface=document.createElement('canvas'),ratio=Math.min(1,2048/Math.max(loaded.width,loaded.height));
        surface.width=Math.max(1,Math.round(loaded.width*ratio));surface.height=Math.max(1,Math.round(loaded.height*ratio));
        surface.getContext('2d').drawImage(loaded,0,0,surface.width,surface.height);image=surface;set({cell:'image'});
      } finally {URL.revokeObjectURL(url);}
    }
  };
  arrange();resize();sync();
})();
