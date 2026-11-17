(() => {
  'use strict';
  const filmVersions = {"asteroids":"90329faa21f5","snake":"fe104eaab242","warlords":"9f7d3e93c329","command":"29c81dfcea06","unbreakable":"360b62235a24","landgrab":"16cc627b04a1","onward":"dcfe310424e6","centipede":"d5c4f416b0e2","happiness":"744b06920848","paddle":"508f9333e3b4","pacman":"843dd2d97acd","cloudcutter":"99103cf9d917","heap":"e92e5eecfbc1","frogs":"019fe98558e3","tetris":"b069bb5745c8"};
  const pieces = (window.HMC_MANIFEST?.pieces || [])
    .filter(piece => piece.category === 'games' && piece.wip === false && !piece.rejected)
    .sort((a,b) => a.slug.localeCompare(b.slug));
  const floor = document.getElementById('cabinets');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width:700px)');
  const clamp = n => Math.max(0,Math.min(1,n));
  const ease = n => n*n*(3-2*n);
  const hold = .35;
  function stageStep(progress,count) {
    let time = clamp(progress)*(Math.max(0,count-1)+count*hold);
    for(let i=0;i<count;i++) {
      if(time<=hold || i===count-1) return i;
      time-=hold;
      if(time<=1) return i+ease(time);
      time-=1;
    }
    return 0;
  }
  const holdPoint = (index,count) => (index*(1+hold)+hold/2)/(Math.max(0,count-1)+count*hold);
  const films = {'008-vectrex-asteroids':'asteroids','007-hydra':'snake','005-only-invaders':'warlords','009-mutual-command':'command','003-unbreakable':'unbreakable','059-moon-orchard':'landgrab','016-up-mario':'onward','006-only-centipede':'centipede','012-happiness-hunter':'happiness','013-paddle':'paddle','014-to-big-for-this-world':'pacman','025-cloudcutter':'cloudcutter','026-top-of-the-heap':'heap','038-many-frogs':'frogs','058-micro-tetris':'tetris'};
  const layouts = [
    {kind:'entry',slugs:['008-vectrex-asteroids','003-unbreakable','005-only-invaders']},
    {kind:'crossing',slugs:['038-many-frogs','059-moon-orchard']},
    {kind:'counterflow',slugs:['009-mutual-command','012-happiness-hunter','016-up-mario','013-paddle','058-micro-tetris','006-only-centipede','007-hydra','025-cloudcutter','014-to-big-for-this-world','026-top-of-the-heap']}
  ];
  const ratios = {'016-up-mario':'3/4','058-micro-tetris':'3/2','059-moon-orchard':'16/9'};
  const bySlug = new Map(pieces.map(piece => [piece.slug,piece]));
  const zones = [];
  const sectionNames = {entry:'Opening',crossing:'Side Scroll',counterflow:'Counterflow',grid:'Grid',extra:'More Games'};
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
    el.id = sectionNames[layout.kind].toLowerCase().replaceAll(' ','-');
    el.setAttribute('role','region');
    el.setAttribute('aria-label',sectionNames[layout.kind]);
    const state = {el,kind:layout.kind,travel:0,progress:0};
    if (layout.kind === 'entry' || layout.kind === 'grid' || layout.kind === 'extra') {
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
        state.track = makeList('zone-track',works);
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

  let queued = false;
  function measure() {
    document.documentElement.classList.toggle('scroll-flat',reduce.matches);
    for (const zone of zones) {
      if (!zone.stage || reduce.matches) continue;
      zone.headHeight = 0;
      zone.el.style.setProperty('--head-height',`${zone.headHeight}px`);
      const h = zone.stage.offsetHeight;
      if (zone.kind === 'crossing') {
        const width = zone.stage.clientWidth;
        zone.track.style.setProperty('--track-pad-start',`${Math.max(0,(width-zone.items[0].offsetWidth)/2)}px`);
        zone.track.style.setProperty('--track-pad-end',`${Math.max(0,(width-zone.items.at(-1).offsetWidth)/2)}px`);
        zone.anchors = zone.items.map(item => item.offsetLeft+item.offsetWidth/2-width/2);
        zone.travel = Math.max(0,zone.anchors.at(-1)-zone.anchors[0])*(narrow.matches?.86:.9);
      }
      if (zone.kind === 'counterflow') {
        zone.mobileFlow = narrow.matches;
        if(zone.mobileFlow) zone.travel = 0;
        else {
          zone.laneMotion = zone.lanes.map((lane,i) => {
            const top = h*.3, bottom = Math.min(h*.7-lane.offsetHeight,top-h*.35);
            return i ? {start:bottom,end:top} : {start:top,end:bottom};
          });
          zone.travel = Math.max(h*.4,...zone.laneMotion.map(lane => Math.abs(lane.end-lane.start)))*1.65;
        }
      }
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
    const p = clamp(-(rect.top+zone.headHeight)/Math.max(1,zone.travel));
    zone.progress = p;
    if (zone.kind === 'crossing') {
      const step = stageStep(p,zone.items.length),i = Math.max(0,Math.min(zone.items.length-2,Math.floor(step)));
      const from = zone.anchors[i],to = zone.anchors[i+1] ?? from;
      zone.track.style.setProperty('--track-x',`${(-(from+(to-from)*(step-i))).toFixed(2)}px`);
    }
    if (zone.kind === 'counterflow') {
      const opening = ease(clamp((innerHeight*.88-rect.top)/(innerHeight*.48)));
      zone.el.style.setProperty('--door-inset',`${(50*(1-opening)).toFixed(3)}%`);
      if(!zone.mobileFlow) zone.lanes.forEach((lane,i) => {
        const motion = zone.laneMotion[i];
        lane.style.setProperty('--lane-y',`${(motion.start+(motion.end-motion.start)*p).toFixed(2)}px`);
      });
    }
  }
  function update() {
    queued = false;
    if (!reduce.matches) zones.forEach(drawZone);
  }
  function queueUpdate() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  function revealFocus(zone,item) {
    if (!item) return;
    if (!zone.stage || reduce.matches) {
      item.scrollIntoView({block:'center',behavior:'instant'}); update(); return;
    }
    let p = zone.progress;
    if (zone.kind === 'crossing') {
      p = holdPoint(Number(item.dataset.zoneIndex),zone.items.length);
    } else if (zone.kind === 'counterflow') {
      if(zone.mobileFlow) {
        item.scrollIntoView({block:'center',behavior:'instant'}); update(); return;
      }
      const lane = item.parentElement,i = zone.lanes.indexOf(lane),motion = zone.laneMotion[i];
      const y = zone.stage.offsetHeight/2-item.offsetTop-item.offsetHeight/2;
      p = clamp((y-motion.start)/(motion.end-motion.start || 1));
    }
    const top = scrollY+zone.el.getBoundingClientRect().top+zone.headHeight+p*zone.travel;
    scrollTo({top,behavior:'instant'}); update();
  }
  addEventListener('scroll',queueUpdate,{passive:true});
  addEventListener('resize',measure);
  addEventListener('pageshow',measure);
  reduce.addEventListener('change',() => {
    const focused = document.activeElement;
    measure();
    if (focused?.classList.contains('piece-link')) focused.scrollIntoView({block:'center',behavior:'instant'});
  });
  const marquee = document.querySelector('.arcade-wordmark');
  const pause = document.querySelector('.attract-pause');
  let marqueeVisible = false;
  function syncMarquee() {
    document.documentElement.classList.toggle('marquee-running',
      marqueeVisible && !document.hidden && !reduce.matches && pause?.getAttribute('aria-pressed') !== 'true');
  }
  new IntersectionObserver(entries => {
    marqueeVisible = entries[0].isIntersecting; syncMarquee();
  }).observe(marquee);
  if (pause) new MutationObserver(syncMarquee).observe(pause,{attributes:true,attributeFilter:['aria-pressed']});
  document.addEventListener('visibilitychange',syncMarquee);
  reduce.addEventListener('change',syncMarquee);
  measure();
})();
