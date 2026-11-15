// Play native vector films only while their artwork links are in view.
(() => {
  const films={asteroids:window.AsteroidsAttract,snake:window.SnakeAttract,warlords:window.WarlordsAttract,command:window.CommandAttract,unbreakable:window.UnbreakableAttract};
  const links=[...document.querySelectorAll('[data-attract]')].filter(link=>films[link.dataset.attract]);
  if(!links.length)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=document.querySelector('.attract-toggle, .attract-pause');
  const sharedToggle=toggle?.classList.contains('attract-toggle');
  const player=document.querySelector('.player');
  const states=links.map(link=>({link,art:films[link.dataset.attract],canvas:link.querySelector('canvas'),visible:false,focused:false,time:0,size:''}));
  let paused=false,timer=null,last=0;
  function stopped(){return paused||reduce.matches||document.hidden||player?.open||toggle?.getAttribute('aria-pressed')==='true';}
  function render(s){
    if(!s.visible)return;
    const bounds=s.canvas.getBoundingClientRect(),scale=Math.min(devicePixelRatio||1,1.5);
    const width=Math.max(1,Math.round(Math.min(1400,bounds.width*scale))),height=Math.round(width*.75),size=`${width}:${height}`;
    if(s.size!==size){s.canvas.width=width;s.canvas.height=height;s.size=size;}
    const time=reduce.matches||s.focused?s.art.still:s.time;
    s.art.draw(s.canvas,time);s.canvas.dataset.time=time.toFixed(3);
    s.link.classList.add('attract-ready');
  }
  function schedule(){
    clearTimeout(timer);timer=null;last=performance.now();
    if(!stopped()&&states.some(s=>s.visible&&!s.focused))timer=setTimeout(tick,1000/24);
  }
  function tick(){
    const now=performance.now(),elapsed=Math.min(.15,(now-last)/1000);
    for(const s of states)if(s.visible&&!s.focused){s.time=(s.time+elapsed)%s.art.duration;render(s);}
    schedule();
  }
  const visibility=new IntersectionObserver(entries=>{
    for(const entry of entries){
      const s=states.find(s=>s.link===entry.target);s.visible=entry.isIntersecting;
      if(s.visible)render(s);
      else{s.canvas.width=1;s.canvas.height=1;s.size='';s.link.classList.remove('attract-ready');}
    }
    schedule();
  });
  const resize=new ResizeObserver(entries=>{
    for(const entry of entries)render(states.find(s=>s.canvas===entry.target));
  });
  for(const s of states){
    visibility.observe(s.link);resize.observe(s.canvas);
    s.link.addEventListener('focus',()=>{s.focused=true;render(s);schedule();});
    s.link.addEventListener('blur',()=>{s.focused=false;render(s);schedule();});
  }
  function sync(){
    if(toggle&&!sharedToggle){
      toggle.hidden=false;toggle.disabled=reduce.matches;
      toggle.setAttribute('aria-pressed',String(paused||reduce.matches));
      if(!toggle.hasAttribute('data-icon'))toggle.textContent=reduce.matches?'Motion paused':paused?'Play animation':'Pause animation';
      toggle.setAttribute('aria-label',reduce.matches?'Attract animations paused for reduced motion':paused?'Play attract animations':'Pause attract animations');
    }
    states.forEach(render);schedule();
  }
  if(toggle){
    if(sharedToggle)new MutationObserver(schedule).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
    else toggle.addEventListener('click',()=>{paused=!paused;sync();});
  }
  if(player)new MutationObserver(schedule).observe(player,{attributes:true,attributeFilter:['open']});
  reduce.addEventListener('change',sync);
  document.addEventListener('visibilitychange',schedule);
  sync();
})();
