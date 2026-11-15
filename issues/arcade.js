(() => {
  'use strict';
  const filmVersions = {"asteroids":"90329faa21f5","snake":"fe104eaab242","warlords":"9f7d3e93c329","command":"29c81dfcea06","unbreakable":"16cfd4faefdd"};
  const pieces = (window.HMC_MANIFEST?.pieces || [])
    .filter(piece => piece.category === 'games' && piece.wip === false && !piece.rejected)
    .sort((a,b) => a.slug.localeCompare(b.slug));
  const floor = document.getElementById('cabinets');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0,Math.min(1,n));
  const films = {'008-vectrex-asteroids':'asteroids','007-hydra':'snake','005-only-invaders':'warlords','009-mutual-command':'command','003-unbreakable':'unbreakable'};
  const layouts = [
    {kind:'entry',slugs:['008-vectrex-asteroids','003-unbreakable','005-only-invaders']},
    {kind:'crossing',slugs:['038-many-frogs','059-moon-orchard','009-mutual-command','012-happiness-hunter']},
    {kind:'counterflow',slugs:['016-up-mario','013-paddle','058-micro-tetris','006-only-centipede']},
    {kind:'deck',slugs:['007-hydra','025-cloudcutter','014-to-big-for-this-world','026-top-of-the-heap']}
  ];
  const ratios = {'016-up-mario':'3/4','058-micro-tetris':'3/2','059-moon-orchard':'16/9'};
  const bySlug = new Map(pieces.map(piece => [piece.slug,piece]));
  const zones = [];
  let imageIndex = 0;
  function makeWork(piece) {
    const item = document.createElement('li');
    item.className = 'cabinet';
    item.dataset.slug = piece.slug;
    item.style.setProperty('--screen-ratio',ratios[piece.slug] || '1');
    const link = document.createElement('a');
    link.className = 'piece-link';
    link.href = `../pieces/${encodeURIComponent(piece.slug)}/index.html`;
    link.setAttribute('aria-label',piece.title);
    const image = document.createElement('img');
    image.src = `../pieces/${encodeURIComponent(piece.slug)}/${encodeURIComponent(piece.thumbnail || 'thumbnail.jpg')}`;
    image.alt = '';
    image.width = 800; image.height = 600;
    image.loading = imageIndex++ < 2 ? 'eager' : 'lazy';
    image.decoding = 'async';
    const film = films[piece.slug];
    if (film) {
      item.id = film;
      link.dataset.attract = film;
      image.src = `arcade/assets/${film}-attract.png?v=${filmVersions[film]}`;
      const media = document.createElement('div');
      media.className = 'attract-media';
      const canvas = document.createElement('canvas');
      canvas.width = 1; canvas.height = 1;
      canvas.setAttribute('aria-hidden','true');
      media.append(image,canvas); link.append(media);
    } else link.append(image);
    item.append(link);
    return item;
  }
  function makeList(className,works) {
    const list = document.createElement('ol');
    list.className = `zone-works ${className}`;
    works.forEach(piece => list.append(makeWork(piece)));
    return list;
  }
  function makeZone(layout,works) {
    const el = document.createElement('div');
    el.className = `scroll-zone zone--${layout.kind}`;
    el.dataset.zone = layout.kind;
    const state = {el,kind:layout.kind,travel:0,progress:0};
    if (layout.kind === 'entry' || layout.kind === 'extra') {
      el.append(makeList('',works));
    } else {
      const stage = document.createElement('div');
      stage.className = 'zone-sticky';
      state.stage = stage;
      if (layout.kind === 'counterflow') {
        const lanes = document.createElement('div'); lanes.className = 'counter-lanes';
        const split = Math.ceil(works.length/2);
        state.lanes = [makeList('counter-lane',works.slice(0,split)),makeList('counter-lane',works.slice(split))];
        lanes.append(...state.lanes); stage.append(lanes);
      } else {
        state.track = makeList(layout.kind === 'deck' ? 'deck-list' : 'zone-track',works);
        stage.append(state.track);
      }
      el.append(stage);
    }
    state.items = [...el.querySelectorAll('.cabinet')];
    state.items.forEach((item,i) => { item.dataset.zoneIndex = i; });
    floor.append(el); zones.push(state);
    el.addEventListener('focusin',event => {
      if (event.target.matches(':focus-visible')) revealFocus(state,event.target.closest('.cabinet'));
    });
  }
  const placed = new Set();
  layouts.forEach(layout => {
    const works = layout.slugs.map(slug => bySlug.get(slug)).filter(Boolean);
    works.forEach(piece => placed.add(piece.slug));
    if (works.length) makeZone(layout,works);
  });
  const remaining = pieces.filter(piece => !placed.has(piece.slug));
  if (remaining.length) makeZone({kind:'extra'},remaining);

  const entrance = document.querySelector('.entrance');
  const toggle = document.querySelector('.attract-pause');
  let signHeight = 1, queued = false, covered = false;
  function syncNeon() {
    document.documentElement.classList.toggle('neon-paused',
      covered || document.hidden || reduce.matches || toggle?.getAttribute('aria-pressed') === 'true');
  }
  function measure() {
    document.documentElement.classList.toggle('scroll-flat',reduce.matches);
    signHeight = entrance.offsetHeight;
    for (const zone of zones) {
      if (!zone.stage || reduce.matches) continue;
      const h = zone.stage.offsetHeight;
      if (zone.kind === 'crossing') zone.travel = Math.max(0,zone.track.scrollWidth-zone.stage.clientWidth);
      if (zone.kind === 'counterflow') {
        zone.laneMotion = zone.lanes.map((lane,i) => {
          const top = h*.3, bottom = Math.min(h*.7-lane.offsetHeight,top-h*.35);
          return i ? {start:bottom,end:top} : {start:top,end:bottom};
        });
        zone.travel = Math.max(h*.4,...zone.laneMotion.map(lane => Math.abs(lane.end-lane.start)))*1.1;
      }
      if (zone.kind === 'deck') zone.travel = h*.75*Math.max(1,zone.items.length-1);
      zone.el.style.setProperty('--travel',`${Math.round(zone.travel)}px`);
    }
    update();
  }
  function drawZone(zone) {
    const rect = zone.el.getBoundingClientRect();
    if (zone.kind === 'entry') {
      zone.el.style.setProperty('--zone-progress',clamp(-rect.top/Math.max(1,rect.height)).toFixed(4));
      return;
    }
    if (!zone.stage || reduce.matches) return;
    const p = clamp(-rect.top/Math.max(1,zone.travel));
    zone.progress = p;
    if (zone.kind === 'crossing') zone.track.style.setProperty('--track-x',`${(-p*zone.travel).toFixed(2)}px`);
    if (zone.kind === 'counterflow') zone.lanes.forEach((lane,i) => {
      const motion = zone.laneMotion[i];
      lane.style.setProperty('--lane-y',`${(motion.start+(motion.end-motion.start)*p).toFixed(2)}px`);
    });
    if (zone.kind === 'deck') {
      const step = p*Math.max(1,zone.items.length-1),h = zone.stage.offsetHeight;
      zone.items.forEach((item,i) => {
        const d = step-i, exit = clamp(d), behind = Math.max(0,-d);
        item.style.setProperty('--deck-x',`${(behind*18-exit*item.offsetWidth*.16).toFixed(2)}px`);
        item.style.setProperty('--deck-y',`${(behind*24-exit*h*1.15).toFixed(2)}px`);
        item.style.setProperty('--deck-scale',(1-Math.min(3,behind)*.055).toFixed(4));
        item.style.setProperty('--deck-alpha',(1-clamp((exit-.5)*2)).toFixed(4));
        item.style.zIndex = zone.items.length-i;
        item.style.pointerEvents = d < .9 ? 'auto' : 'none';
      });
    }
  }
  function update() {
    queued = false;
    const p = clamp(scrollY/Math.max(1,signHeight*.9));
    const fade = p*p*(3-2*p);
    entrance.style.setProperty('--sign-level',(1-fade).toFixed(3));
    covered = p === 1; syncNeon();
    if (!reduce.matches) zones.forEach(drawZone);
  }
  function queueUpdate() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  function revealFocus(zone,item) {
    if (!item || !zone.stage || reduce.matches) return;
    let p = zone.progress;
    if (zone.kind === 'crossing') {
      p = clamp((item.offsetLeft+item.offsetWidth/2-zone.stage.clientWidth/2)/Math.max(1,zone.travel));
    } else if (zone.kind === 'counterflow') {
      const lane = item.parentElement,i = zone.lanes.indexOf(lane),motion = zone.laneMotion[i];
      const y = zone.stage.offsetHeight/2-item.offsetTop-item.offsetHeight/2;
      p = clamp((y-motion.start)/(motion.end-motion.start || 1));
    } else if (zone.kind === 'deck') {
      p = Number(item.dataset.zoneIndex)/Math.max(1,zone.items.length-1);
    }
    const top = scrollY+zone.el.getBoundingClientRect().top+p*zone.travel;
    scrollTo({top,behavior:'instant'}); update();
  }
  addEventListener('scroll',queueUpdate,{passive:true});
  addEventListener('resize',measure);
  addEventListener('pageshow',measure);
  document.addEventListener('visibilitychange',syncNeon);
  reduce.addEventListener('change',() => {
    const focused = document.activeElement;
    measure();
    if (focused?.classList.contains('piece-link')) focused.scrollIntoView({block:'center',behavior:'instant'});
  });
  if (toggle) new MutationObserver(syncNeon).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
  measure();
})();
