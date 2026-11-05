// The foreground is a bank of three-frame title films, not running game embeds.
(() => {
  const art = window.ArcadeAttractArt;
  if (!art) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.attract-toggle');
  const player = document.querySelector('.player');
  const holds = [1800, 1050, 1450];
  const states = [...document.querySelectorAll('.poster')].map((link, i) => ({
    link, canvas: link.querySelector('canvas'), key: link.dataset.game,
    phase: 0, visible: false, focused: false, scrubbing: false, loaded: false, loading: false,
    next: performance.now() + 300 + i * 173, offset: i * 173 % 650, size: ''
  }));
  let paused = false;
  let timer = null;
  let ready = false;

  function render(s) {
    if (!ready || !s.visible) return;
    if (!s.loaded) {
      if (!s.loading) {
        s.loading = true;
        art.load(s.key).then(() => {
          s.loaded = true; s.phase = 0;
          s.next = performance.now() + holds[0] + s.offset;
          render(s); schedule();
        }).catch(() => { s.loading = false; });
      }
      return;
    }
    const bounds = s.link.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(Math.min(1400, bounds.width * scale)));
    const height = Math.max(1, Math.round(width / Number(s.link.dataset.ratio)));
    const size = `${width}:${height}`;
    if (s.size !== size) { s.canvas.width = width; s.canvas.height = height; s.size = size; }
    art.draw(s.canvas, s.key, s.phase);
    s.canvas.dataset.frame = s.phase;
    s.link.classList.add('attract-ready');
  }
  function running() { return ready && !paused && !preference.matches && !document.hidden && !player.open; }
  function schedule() {
    clearTimeout(timer); timer = null;
    if (!running()) return;
    const active = states.filter(s => s.visible && s.loaded && !s.focused && !s.scrubbing);
    if (!active.length) return;
    const now = performance.now();
    timer = setTimeout(tick, Math.max(80, Math.min(...active.map(s => s.next - now))));
  }
  function tick() {
    const now = performance.now();
    for (const s of states) {
      if (!s.visible || !s.loaded || s.focused || s.scrubbing || now < s.next) continue;
      s.phase = (s.phase + 1) % 3;
      s.next = now + holds[s.phase];
      render(s);
    }
    schedule();
  }
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const s = states.find(s => s.link === entry.target);
      s.visible = entry.isIntersecting;
      if (s.visible) { s.next = performance.now() + holds[s.phase] + s.offset; render(s); }
      else { s.canvas.width = 1; s.canvas.height = 1; s.size = ''; s.link.classList.remove('attract-ready'); }
    }
    schedule();
  }, { rootMargin: '120px 0px' });
  const resize = new ResizeObserver(entries => {
    for (const entry of entries) render(states.find(s => s.link === entry.target));
  });
  for (const s of states) {
    s.link.style.setProperty('--spill', art.palettes[s.key][0]);
    visibility.observe(s.link); resize.observe(s.link);
    s.link.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || preference.matches) return;
      s.scrubbing = true;
      const b = s.link.getBoundingClientRect();
      const frame = Math.max(0, Math.min(2, Math.floor((event.clientX - b.left) / b.width * 3)));
      if (frame !== s.phase) { s.phase = frame; render(s); }
      schedule();
    });
    s.link.addEventListener('pointerleave', () => { s.scrubbing = false; s.next = performance.now() + holds[s.phase]; schedule(); });
    s.link.addEventListener('focus', () => { s.focused = true; s.phase = 0; render(s); schedule(); });
    s.link.addEventListener('blur', () => { s.focused = false; s.next = performance.now() + holds[s.phase]; schedule(); });
  }
  toggle.hidden = false;
  function syncToggle() {
    const stopped = paused || preference.matches;
    toggle.disabled = preference.matches;
    toggle.setAttribute('aria-pressed', String(stopped));
    toggle.setAttribute('aria-label', preference.matches ? 'Attract-screen loops paused for reduced motion' : paused ? 'Play attract-screen loops' : 'Pause attract-screen loops');
    document.body.classList.toggle('attract-paused', stopped);
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    syncToggle();
    states.forEach(s => { s.next = performance.now() + holds[s.phase]; });
    schedule();
  });
  preference.addEventListener('change', () => {
    if (preference.matches) states.forEach(s => { s.phase = 0; render(s); });
    syncToggle();
    schedule();
  });
  document.addEventListener('visibilitychange', () => { states.forEach(s => s.next = performance.now() + holds[s.phase]); schedule(); });
  new MutationObserver(schedule).observe(player, { attributes: true, attributeFilter: ['open'] });
  syncToggle();
  Promise.all(['Bangers','Rubik Dirt','Permanent Marker'].map(face => document.fonts.load(`100px '${face}'`))).then(() => {
    ready = true; states.forEach(render); schedule();
  }).catch(() => { /* Static first frames remain usable if the local face fails. */ });
})();
