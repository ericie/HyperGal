(() => {
  'use strict';
  const bathCanvas = document.getElementById('bath');
  const pigmentCanvas = document.getElementById('stage');
  const effectsCanvas = document.getElementById('effects');
  const effectsContext = effectsCanvas.getContext('2d');
  const panel = document.querySelector('.water-panel');
  const panelHeader = panel.querySelector('.panel-header');
  const collapseButton = document.getElementById('collapse-panel');
  const reseedButton = document.getElementById('reseed');
  const bathNumber = document.getElementById('bath-number');
  const status = document.getElementById('status');
  const paletteSelect = document.getElementById('palette');
  const pageParams = new URLSearchParams(location.search);
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const controls = {
    tempo: document.getElementById('tempo'),
    dropSize: document.getElementById('drop-size'),
    sizeVariation: document.getElementById('size-variation'),
    repulsion: document.getElementById('repulsion')
  };
  const PALETTES = [
    ['#173e59', '#47758a', '#86a7ae', '#d3dfdc', '#f0eee4', '#9a6654', '#597965', '#b59455'],
    ['#10385f', '#315f87', '#7497b1', '#afc3cf', '#d9e2e2', '#497f7b', '#846777', '#aa8a55'],
    ['#213f4f', '#52756f', '#96aaa0', '#d8ddd1', '#ece9da', '#75576f', '#9b7156', '#5b7f85'],
    ['#182f4a', '#496b88', '#98adbd', '#d7dddc', '#ebe8df', '#8d554b', '#707a5d', '#a58250'],
    ['#153f52', '#3c7380', '#7da2a8', '#c1d2cf', '#e2e7df', '#a26c61', '#887f5e', '#586d83'],
    ['#2e3d43', '#5b716e', '#9baba2', '#d8d9cd', '#ebe6d7', '#895a48', '#92713f', '#536a5b']
  ];

  const FALL_DURATION = 720;
  const SPREAD_DURATION = 4200;
  const MAX_CANVAS_PIXELS = 1800000;
  let width=1, height=1, dpr=1;
  let seed=seedFromLocation(), random=mulberry32(seed);
  let bathRevision=0, paused=motionPreference.matches;
  let activeDrop=null, dropQueue=[], nextDropAt=0, lastFrameAt=0, accumulator=0;
  let inkWell={x:.64,y:.63}, panelDrag=null, resizeTimer=0;
  let surface;
  try { surface=window.createMarblingSurface(bathCanvas); }
  catch(error) {
    status.textContent='The pigment surface could not start. Please reload the bath.';
    console.error(error);
    return;
  }
  if(pageParams.get('panel')==='0') document.body.classList.add('no-panel');
  bindControls(); bindPanel();
  addEventListener('resize',onResize,{passive:true});
  addEventListener('keydown',onKeyDown);
  pigmentCanvas.addEventListener('pointerdown',onBathPointer);
  reseedButton.addEventListener('click',reseed);
  motionPreference.addEventListener('change',onMotionPreference);
  document.addEventListener('visibilitychange',()=>{lastFrameAt=0;accumulator=0;});
  bathCanvas.addEventListener('webglcontextlost',(event)=>{
    event.preventDefault(); paused=true;
    status.textContent='The water surface paused because graphics were interrupted. Reload to restore it.';
  });
  updatePanel(); resetBath(); requestAnimationFrame(tick);

  function resetBath() {
    random=mulberry32(seed);activeDrop=null;dropQueue=[];bathRevision=0;
    resizeCanvases();
    surface.reset(seed,currentPalette().map(value=>Array.from(hexToUnitRgb(value))));
    surface.display();
    effectsContext.clearRect(0,0,effectsCanvas.width,effectsCanvas.height);
    inkWell={x:.54+random()*.19,y:.48+random()*.26};
    nextDropAt=2.2;lastFrameAt=0;accumulator=0;
    updateBathNumber();
  }

  function makeDrop(x,y,radius,pigment,manual) {
    return {x,y,radius,pigment,manual,id:bathRevision+1,
      color:Array.from(hexToUnitRgb(currentPalette()[pigment])),
      variation:Number(controls.sizeVariation.value)/100,
      push:Number(controls.repulsion.value)/100,
      age:0, previousArea:0};
  }

  function queueDrop(drop) {
    bathRevision++;updateBathNumber();
    if(paused) {settleDrop(drop);return;}
    // A held pointer must not build an unbounded queue behind long blooms.
    if(dropQueue.length<8) dropQueue.push(drop);
    if(!activeDrop) activeDrop=dropQueue.shift();
  }

  function settleDrop(drop) {
    const target=drop.radius*drop.radius*drop.push;
    surface.step(0,{...drop,area:Math.max(0,target-drop.previousArea),progress:1});
    surface.display();
    effectsContext.clearRect(0,0,effectsCanvas.width,effectsCanvas.height);
  }

  function advanceDrop(dt) {
    if(!activeDrop && dropQueue.length) activeDrop=dropQueue.shift();
    if(!activeDrop) return null;
    const drop=activeDrop;
    drop.age+=dt*1000;
    if(drop.age<FALL_DURATION) return null;
    const progress=Math.min(1,(drop.age-FALL_DURATION)/SPREAD_DURATION);
    // Area grows smoothly. Inject a small core on every step; the previous
    // steps' color is transported outward along with every other pigment.
    const spread=1-Math.pow(1-progress,2.4);
    const area=drop.radius*drop.radius*drop.push*spread;
    const increment=Math.max(0,area-drop.previousArea);
    drop.previousArea=area;
    const event={...drop,area:increment,progress};
    if(progress>=1) activeDrop=null;
    return event;
  }

  function tick(time) {
    const delta=lastFrameAt?Math.min(.08,(time-lastFrameAt)/1000):0;
    lastFrameAt=time;
    if(document.hidden) {requestAnimationFrame(tick);return;}
    effectsContext.clearRect(0,0,effectsCanvas.width,effectsCanvas.height);
    if(!paused) {
      nextDropAt-=delta;
      if(nextDropAt<=0) {addAutomaticDrop();nextDropAt=nextDropDelay();}
      accumulator+=delta;
      const step=surface.kind==='webgl'?1/30:1/15;
      let painted=false;
      while(accumulator>=step) {
        surface.step(step,advanceDrop(step));
        accumulator-=step;painted=true;
      }
      if(painted) surface.display();
      if(activeDrop && activeDrop.age<FALL_DURATION) drawFallingDrop(activeDrop,activeDrop.age/FALL_DURATION);
    }
    requestAnimationFrame(tick);
  }

  function drawFallingDrop(drop,progress) {
    // A tiny descending bead is the only mark above the surface.
    const x=drop.x*effectsCanvas.width;
    const y=drop.y*effectsCanvas.height-(1-progress*progress)*Math.min(width,height)*.13*dpr;
    const r=(3.0+(1-progress)*1.2)*dpr;
    const color=drop.color.map(c=>Math.round(c*255));
    effectsContext.save();
    effectsContext.globalAlpha=.42+progress*.58;
    effectsContext.fillStyle='rgb('+color.join(',')+')';
    effectsContext.beginPath();effectsContext.ellipse(x,y,r,r*(1.18-progress*.18),0,0,Math.PI*2);effectsContext.fill();
    effectsContext.restore();
  }

  function addAutomaticDrop() {
    // Neighboring deposits interact, then the well wanders to another current.
    if(random()<.48) inkWell={x:.17+random()*.67,y:.20+random()*.61};
    const pigments=[2,3,5,2,1,3,7,2,3,1,6,3];
    const pigment=pigments[bathRevision%pigments.length];
    queueDrop(makeDrop(
      clamp(inkWell.x+(random()-.5)*.065,.08,.92),
      clamp(inkWell.y+(random()-.5)*.065,.08,.92),
      dropRadius()*(.64+random()*.49)*(pigment>=5?.48:.76),pigment,false
    ));
  }

  function onBathPointer(event) {
    const rect=pigmentCanvas.getBoundingClientRect();
    const x=clamp((event.clientX-rect.left)/rect.width,.015,.985);
    const y=clamp((event.clientY-rect.top)/rect.height,.015,.985);
    inkWell={x,y};
    const pigments=[5,7,6,2,3,1];
    queueDrop(makeDrop(x,y,dropRadius(),pigments[bathRevision%pigments.length],true));
    status.textContent='A drop of pigment is spreading through the water.';
  }

  function dropRadius() {return .028+Number(controls.dropSize.value)/1200;}
  function nextDropDelay() {return 60/Number(controls.tempo.value)*(.78+random()*.44);}
  function resizeCanvases() {
    width=Math.max(1,innerWidth);height=Math.max(1,innerHeight);
    dpr=Math.min(devicePixelRatio||1,1.5,Math.sqrt(MAX_CANVAS_PIXELS/(width*height)));
    [bathCanvas,pigmentCanvas,effectsCanvas].forEach(canvas=>{
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      canvas.style.width=width+'px';canvas.style.height=height+'px';
    });
  }
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{resetBath();clampPanel();},180);
  }
  function bindControls() {
    Object.values(controls).forEach((control) => control.addEventListener('input', updatePanel));
    paletteSelect.addEventListener('change', () => {
      resetBath();
      updatePanel();
      status.textContent = `${paletteSelect.selectedOptions[0].textContent} pigments loaded.`;
    });
  }

  function updatePanel() {
    updateRange(controls.tempo, `${controls.tempo.value}/min`);
    updateRange(controls.dropSize, `${Math.round(dropRadius() * 100)}%`);
    updateRange(controls.sizeVariation, `${controls.sizeVariation.value}%`);
    updateRange(controls.repulsion, `${controls.repulsion.value}%`);
    updateBathNumber();
  }

  function updateRange(input, text) {
    const row = input.closest('.range-row');
    const min = Number(input.min);
    const max = Number(input.max);
    row.style.setProperty('--progress', `${(Number(input.value) - min) / (max - min) * 100}%`);
    const output = row.querySelector('output');
    output.value = text;
    output.textContent = text;
  }

  function updateBathNumber() {
    bathNumber.textContent = `BATH ${String(seed % 10000).padStart(4, '0')} · INK ${String(bathRevision).padStart(3, '0')}`;
  }

  function bindPanel() {
    collapseButton.addEventListener('click', () => {
      const collapsed = panel.classList.toggle('is-collapsed');
      collapseButton.setAttribute('aria-expanded', String(!collapsed));
      collapseButton.setAttribute('aria-label', collapsed ? 'Expand marbling controls' : 'Collapse marbling controls');
      collapseButton.title = collapsed ? 'Expand controls' : 'Collapse controls';
      clampPanel();
    });
    panelHeader.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      const rect = panel.getBoundingClientRect();
      panelDrag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        nextLeft: rect.left,
        nextTop: rect.top
      };
      panel.classList.add('is-dragging');
      panelHeader.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    panelHeader.addEventListener('pointermove', (event) => {
      if (panelDrag && event.pointerId === panelDrag.pointerId) movePanelDuringDrag(event.clientX, event.clientY);
    });
    panelHeader.addEventListener('pointerup', endPanelDrag);
    panelHeader.addEventListener('pointercancel', endPanelDrag);
  }

  function endPanelDrag(event) {
    if (!panelDrag || event.pointerId !== panelDrag.pointerId) return;
    panel.style.left = `${Math.round(panelDrag.nextLeft)}px`;
    panel.style.top = `${Math.round(panelDrag.nextTop)}px`;
    panel.style.transform = '';
    panel.classList.remove('is-dragging');
    if (panelHeader.hasPointerCapture(event.pointerId)) panelHeader.releasePointerCapture(event.pointerId);
    panelDrag = null;
  }

  function movePanelDuringDrag(clientX, clientY) {
    const margin = 8;
    const left = clamp(panelDrag.left + clientX - panelDrag.startX, margin, Math.max(margin, innerWidth - panelDrag.width - margin));
    const top = clamp(panelDrag.top + clientY - panelDrag.startY, margin, Math.max(margin, innerHeight - panelDrag.height - margin));
    panelDrag.nextLeft = left;
    panelDrag.nextTop = top;
    panel.style.transform = `translate3d(${left - panelDrag.left}px, ${top - panelDrag.top}px, 0)`;
  }

  function clampPanel() {
    if (!panel.style.left && !panel.style.top) return;
    const rect = panel.getBoundingClientRect();
    const margin = 8;
    panel.style.left = `${Math.round(clamp(rect.left, margin, Math.max(margin, innerWidth - rect.width - margin)))}px`;
    panel.style.top = `${Math.round(clamp(rect.top, margin, Math.max(margin, innerHeight - rect.height - margin)))}px`;
  }

  function reseed() {
    const value = Math.floor(Math.random() * 0x7fffffff).toString(36);
    seed = hashString(value);
    try {
      const url = new URL(location.href);
      url.searchParams.set('seed', value);
      history.replaceState(null, '', url);
    } catch (error) {
      // A fresh bath still works when history is unavailable on file://.
    }
    resetBath();
    status.textContent = `New mineral bath ${String(seed % 10000).padStart(4, '0')}.`;
  }

  function onKeyDown(event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = event.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      reseed();
    } else if (event.key === ' ') {
      event.preventDefault();
      paused = !paused;
      if (paused && activeDrop) {
        settleDrop(activeDrop);
        activeDrop = null;
      }
      if (paused) settleQueuedDrops();
      status.textContent = paused ? 'Bath paused. New drops settle immediately.' : 'Bath active.';
    }
  }

  function onMotionPreference(event) {
    paused = event.matches;
    if (paused && activeDrop) {
      settleDrop(activeDrop);
      activeDrop = null;
    }
    if (paused) settleQueuedDrops();
    status.textContent = paused ? 'A finished still bath is shown for reduced motion.' : 'Bath active.';
  }

  function currentPalette() {
    return PALETTES[Number(paletteSelect.value)] || PALETTES[1];
  }

  function settleQueuedDrops() {
    while (dropQueue.length) {
      const drop = dropQueue.shift();
      settleDrop(drop);
    }
  }


  function seedFromLocation() {
    const value = pageParams.get('seed');
    return value ? hashString(value) : Math.floor(Math.random() * 0x7fffffff);
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index++) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(value) {
    return () => {
      let next = (value += 0x6d2b79f5);
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hexToRgb(value) {
    const number = parseInt(value.slice(1), 16);
    return [number >> 16 & 255, number >> 8 & 255, number & 255];
  }

  function hexToUnitRgb(value) {
    return new Float32Array(hexToRgb(value).map((channel) => channel / 255));
  }


  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
