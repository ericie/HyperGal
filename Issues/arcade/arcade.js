// Printed matter drifts behind the frame-cut foreground. No continuous game loads.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const wall = document.querySelector('.wall');
  const scraps = [...document.querySelectorAll('.scrap')];
  let pending = false;
  function paint() {
    pending = false;
    if (preference.matches || document.hidden || document.querySelector('.player[open]')) return;
    wall.style.setProperty('--wall-drift', `${scrollY * .045}px`);
    for (const scrap of scraps) {
      const distance = scrollY + innerHeight / 2 - scrap.offsetTop;
      scrap.style.setProperty('--drift', `${Math.max(-110, Math.min(110, distance * .09))}px`);
    }
  }
  function schedule() { if (!pending && !preference.matches) { pending = true; requestAnimationFrame(paint); } }
  preference.addEventListener('change', () => {
    wall.style.removeProperty('--wall-drift');
    scraps.forEach(s => s.style.removeProperty('--drift'));
    schedule();
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', schedule);
  schedule();
})();
