(() => {
  'use strict';
  const scope=window.Kaleidoscope;
  const panel=document.getElementById('controls'),body=document.getElementById('panel-body');
  const toggle=document.getElementById('hide'),grip=document.getElementById('move');
  const preset=document.getElementById('preset'),fields=document.getElementById('fields');
  const feedback=document.getElementById('feedback');
  const tabs=[...document.querySelectorAll('[role="tab"]')],inputs=new Map(),outputs=new Map();
  let collapsed=true,drag=null,feedbackTimer=0;
  for(const [key,value] of Object.entries(scope.presets)) preset.add(new Option(value.name,key));
  const custom=new Option('Custom','custom');custom.disabled=true;preset.add(custom);
  function disabled(key,s) {
    const radial=!['box','lattice'].includes(s.mirror),image=s.cell==='image';
    if(['points','reflectivity'].includes(key)) return !radial;
    if(key==='aperture') return !['mandala','tapered'].includes(s.mirror);
    if(['depth','twist'].includes(key)) return s.mirror!=='tapered';
    if(key==='separation') return s.cell!=='wheels';
    if(key==='viscosity'||key==='flow') return !['oil','wand'].includes(s.cell);
    if(key==='gravity') return !['dry','oil','wand'].includes(s.cell);
    if(key==='polarizer') return s.lighting!=='polarized'||image;
    if(key==='iridescence') return image||!['prisms','beads','liquid'].includes(s.material);
    if(key==='lighting') return image;
    if(['material','density','size','glitter','transparency','tumble','glow','palette'].includes(key)) return image;
    return false;
  }
  function display(d,v) {
    if(d.key==='points') return `${v} · ${Math.round(180/v*10)/10}°`;
    return `${Number(v.toFixed(d.step<.1?2:d.step<1?1:0))}${d.unit}`;
  }
  for(const tab of tabs) {
    const group=tab.getAttribute('aria-controls'),section=document.createElement('div');
    section.id=group;section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',tab.id);
    section.hidden=group!=='optics';
    for(const d of scope.definitions.filter(d=>d.group===group)) {
      const field=document.createElement('div');field.className='field';
      const label=document.createElement('label');label.htmlFor=d.key;label.textContent=d.label;field.append(label);
      const input=document.createElement(d.type==='select'?'select':'input');input.id=d.key;input.name=d.key;
      if(d.type==='select') d.options.forEach(([value,label])=>input.add(new Option(label,value)));
      else {
        input.type=d.type;
        if(d.type==='range') {
          input.min=d.min;input.max=d.max;input.step=d.step;
          const output=document.createElement('output');output.htmlFor=d.key;output.setAttribute('aria-hidden','true');
          field.append(output);outputs.set(d.key,output);
        }
      }
      input.addEventListener('input',()=>{
        scope.set({[d.key]:d.type==='range'?Number(input.value):input.value});sync();
        if(d.key==='cell'&&input.value==='image'&&!scope.hasImage) notice('Choose a teleidoscope image below.');
      });
      field.append(input);section.append(field);inputs.set(d.key,input);
    }
    if(group==='objects') {
      const field=document.createElement('div');field.className='field image-field';
      const label=document.createElement('label');label.htmlFor='object-image';label.textContent='Teleidoscope image';
      const input=document.createElement('input');input.id='object-image';input.type='file';input.accept='image/*';
      input.addEventListener('change',async()=>{
        const file=input.files[0];if(!file) return;
        input.disabled=true;
        try {await scope.loadImage(file);sync();notice('Image loaded.');}
        catch {notice('Could not read image. Choose another image.');}
        finally {input.disabled=false;input.value='';}
      });field.append(label,input);section.append(field);
    }
    fields.append(section);
  }
  function sync() {
    const s=scope.settings;
    for(const d of scope.definitions) {
      const input=inputs.get(d.key);input.value=s[d.key];input.disabled=disabled(d.key,s);
      const output=outputs.get(d.key);if(output) output.textContent=display(d,s[d.key]);
    }
    preset.value=scope.selectedPreset;
  }
  function selectTab(tab,focus=false) {
    tabs.forEach(t=>{
      const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;
      document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;
    });fields.scrollTop=0;if(focus) tab.focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectTab(tab));
    tab.addEventListener('keydown',event=>{
      let next=index;
      if(event.key==='ArrowRight') next=(index+1)%tabs.length;
      else if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
      else if(event.key==='Home') next=0;
      else if(event.key==='End') next=tabs.length-1;
      else return;
      event.preventDefault();selectTab(tabs[next],true);
    });
  });
  function notice(text) {
    clearTimeout(feedbackTimer);feedback.textContent=text;feedback.hidden=false;
    feedbackTimer=setTimeout(()=>{feedback.hidden=true;},6000);
  }
  function clampPosition(x,y) {
    const rect=panel.getBoundingClientRect();
    panel.style.left=Math.max(12,Math.min(x,innerWidth-rect.width-12))+'px';
    panel.style.top=Math.max(12,Math.min(y,innerHeight-rect.height-12))+'px';panel.style.right='auto';
  }
  function collapse(value) {
    if(value&&panel.contains(document.activeElement)) toggle.focus();
    collapsed=value;panel.classList.toggle('collapsed',collapsed);body.hidden=collapsed;
    toggle.setAttribute('aria-expanded',String(!collapsed));
    if(panel.style.left) {const r=panel.getBoundingClientRect();clampPosition(r.left,r.top);}
  }
  toggle.addEventListener('click',()=>collapse(!collapsed));
  document.addEventListener('pointerdown',event=>{
    if(!collapsed&&!panel.contains(event.target)) collapse(true);
  });
  grip.addEventListener('pointerdown',event=>{
    if(event.button!==0) return;
    const r=panel.getBoundingClientRect();drag={id:event.pointerId,x:event.clientX-r.left,y:event.clientY-r.top};
    grip.setPointerCapture(event.pointerId);event.preventDefault();
  });
  grip.addEventListener('pointermove',event=>{
    if(drag&&event.pointerId===drag.id) clampPosition(event.clientX-drag.x,event.clientY-drag.y);
  });
  const stop=()=>{drag=null;};grip.addEventListener('pointerup',stop);grip.addEventListener('pointercancel',stop);
  grip.addEventListener('keydown',event=>{
    const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},direction=directions[event.key];
    if(!direction) return;
    event.preventDefault();const r=panel.getBoundingClientRect(),step=event.shiftKey?40:10;
    clampPosition(r.left+direction[0]*step,r.top+direction[1]*step);
  });
  addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||event.target.closest?.('input,select,textarea')) return;
    if(event.key.toLowerCase()==='h') {collapse(!collapsed);toggle.focus();}
    if(event.key==='Escape'&&!collapsed) {collapse(true);toggle.focus();}
  });
  new ResizeObserver(()=>{
    if(panel.style.left) {const r=panel.getBoundingClientRect();clampPosition(r.left,r.top);}
  }).observe(panel);
  addEventListener('resize',()=>{if(panel.style.left){const r=panel.getBoundingClientRect();clampPosition(r.left,r.top);}});
  preset.addEventListener('change',()=>{scope.preset(preset.value);sync();});
  document.getElementById('shuffle').addEventListener('click',()=>scope.rearrange());
  document.getElementById('reset').addEventListener('click',()=>{scope.preset('initial');sync();notice('Initial settings restored.');});
  document.getElementById('share').addEventListener('click',async()=>{
    const link=scope.link();
    try {
      await navigator.clipboard.writeText(link);
      notice(scope.settings.cell==='image'?'Link copied. Load the image separately.':'Settings link copied.');
    } catch {
      clearTimeout(feedbackTimer);feedback.hidden=false;feedback.textContent='Copy settings link:';
      const input=document.createElement('input');input.type='text';input.readOnly=true;input.value=link;
      input.setAttribute('aria-label','Settings link');feedback.append(input);input.focus();input.select();
    }
  });
  addEventListener('scopechange',sync);collapse(collapsed);sync();
  if(scope.settings.cell==='image'&&!scope.hasImage) notice('Load the teleidoscope image in Objects.');
})();
