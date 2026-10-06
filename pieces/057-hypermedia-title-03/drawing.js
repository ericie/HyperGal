(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.querySelector('svg');
  const dots = document.querySelector('#dots');
  const lines = document.querySelector('#lines');
  const turtle = document.querySelector('#turtle');
  const pauseButton = document.querySelector('#pause');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');

  // Each letter starts at the previous letter's exit: actual pen strokes,
  // rather than the two edges of a font outline. Backtracking forms the loops.
  const letters = {
    H: [83, 'M0,0 C6,-25 15,-62 22,-86 C15,-62 6,-25 0,0 C3,-12 7,-28 11,-43 C25,-47 43,-47 57,-43 C61,-57 65,-74 69,-86 C62,-60 53,-25 49,-6 C46,9 70,1 83,-10'],
    y: [48, 'M0,-10 C8,-20 13,-40 17,-39 C21,-37 5,-5 14,-4 C23,-3 31,-26 36,-38 C28,-11 18,36 6,39 C-8,43 0,20 17,9 C30,0 40,-3 48,-10'],
    p: [49, 'M0,-10 C10,-23 20,-48 17,-37 L1,39 C7,15 19,-41 33,-38 C51,-34 35,-4 24,-4 C16,-4 20,-17 26,-19 C29,-9 39,-2 49,-10'],
    e: [36, 'M0,-10 C24,-20 30,-39 20,-37 C8,-36 5,-17 12,-7 C18,3 29,-3 36,-10'],
    r: [38, 'M0,-10 C9,-20 15,-38 16,-39 C22,-23 31,-29 28,-34 C25,-24 22,-3 29,-4 C33,-5 35,-8 38,-10'],
    m: [68, 'M0,-10 C8,-21 15,-41 16,-38 L7,-5 C17,-29 27,-44 32,-36 C36,-31 23,-4 25,-4 C35,-29 46,-43 51,-35 C55,-29 42,-4 50,-4 C57,-4 61,-5 68,-10'],
    d: [51, 'M0,-10 C11,-30 29,-48 32,-33 C35,-18 13,5 10,-9 C6,-24 24,-44 32,-33 C41,-55 52,-88 44,-88 C35,-88 28,-22 29,-8 C31,5 43,-4 51,-10'],
    i: [27, 'M0,-10 C10,-24 17,-39 16,-36 C13,-25 6,-6 12,-4 C17,-2 22,-5 27,-10'],
    a: [48, 'M0,-10 C12,-31 30,-48 33,-33 C34,-18 13,5 10,-9 C6,-24 25,-44 33,-33 L25,-9 C22,3 36,-1 48,-10'],
    C: [72, 'M0,-10 C15,-23 47,-40 59,-65 C72,-91 49,-91 31,-72 C11,-51 4,-15 15,-3 C27,11 56,3 72,-10'],
    l: [35, 'M0,-10 C20,-31 41,-86 27,-88 C13,-90 8,-26 11,-10 C13,4 25,-2 35,-10'],
    u: [48, 'M0,-10 C10,-25 18,-42 17,-38 C13,-23 5,-5 13,-4 C24,-2 32,-25 37,-38 C31,-23 25,-6 32,-4 C37,-2 43,-6 48,-10'],
    b: [48, 'M0,-10 C19,-29 38,-85 25,-88 C13,-91 9,-31 12,-12 C15,7 36,-11 34,-30 C32,-42 19,-37 21,-26 C24,-15 40,-5 48,-10']
  };
  function element(tag, attributes, parent) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    parent.append(node);
    return node;
  }
  const strokes = [];
  let x = 0;
  for (const character of 'Hypermedia Club') {
    if (character === ' ') { x += 44; continue; }
    const [advance, d] = letters[character];
    const guide = element('path', { d, visibility: 'hidden' }, svg);
    const length = guide.getTotalLength();
    const count = Math.ceil(length / 7);
    const points = Array.from({ length: count + 1 }, (_, index) => {
      const point = guide.getPointAtLength(index / count * length);
      return { x: point.x + x, y: point.y };
    });
    guide.remove();
    strokes.push(points);
    // The i's tittle is a tiny pen stroke, visited before moving on to a.
    if (character === 'i') strokes.push([{ x: x + 20, y: -53 }, { x: x + 21, y: -55 }]);
    x += advance;
  }
  svg.setAttribute('viewBox', `-25 -115 ${x + 60} 235`);
  const segments = [];
  let total = 0;
  for (const points of strokes) {
    const line = element('polyline', { points: points.map(p => `${p.x},${p.y}`).join(' ') }, lines);
    let length = 0;
    points.forEach((point, index) => {
      // Keep the fine drawing geometry while showing half as many dots.
      if (index % 2 === 0) element('circle', { cx: point.x, cy: point.y, r: 1.55, class: 'dot' }, dots);
      if (!index) return;
      const previous = points[index - 1];
      const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
      segments.push({ from: previous, to: point, start: total, end: total + distance });
      total += distance;
      length += distance;
    });
    line.style.strokeDasharray = `${length} ${length}`;
    line.style.strokeDashoffset = length;
    line.dataset.start = total - length;
    line.dataset.length = length;
  }
  let elapsed = 0;
  let last = null;
  let paused = motion.matches;
  const leadIn = 1600;
  const duration = total / 115 * 1000;
  const hold = 4500;
  function render(distance) {
    for (const line of lines.children) {
      const length = Number(line.dataset.length);
      line.style.strokeDashoffset = length - Math.max(0, Math.min(length, distance - Number(line.dataset.start)));
    }
    const segment = segments.find(s => s.end >= distance) || segments[segments.length - 1];
    const t = Math.max(0, Math.min(1, (distance - segment.start) / (segment.end - segment.start)));
    const x = segment.from.x + (segment.to.x - segment.from.x) * t;
    const y = segment.from.y + (segment.to.y - segment.from.y) * t;
    const angle = Math.atan2(segment.to.y - segment.from.y, segment.to.x - segment.from.x) * 180 / Math.PI;
    turtle.setAttribute('transform', `translate(${x} ${y}) rotate(${angle})`);
  }
  function updateControls() {
    pauseButton.textContent = paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-pressed', String(paused));
  }
  function frame(now) {
    if (last !== null && !paused && !document.hidden) elapsed += Math.min(now - last, 100);
    last = now;
    if (elapsed > leadIn + duration + hold) elapsed = 0;
    render(Math.max(0, Math.min(total, (elapsed - leadIn) / duration * total)));
    requestAnimationFrame(frame);
  }
  function toggle() { paused = !paused; updateControls(); }
  function replay() { elapsed = 0; paused = false; updateControls(); render(0); }
  pauseButton.addEventListener('click', toggle);
  document.querySelector('#replay').addEventListener('click', replay);
  document.addEventListener('keydown', event => {
    if (event.target.closest('button')) return;
    if (event.code === 'Space') { event.preventDefault(); toggle(); }
    if (event.key.toLowerCase() === 'r') replay();
  });
  motion.addEventListener('change', event => { paused = event.matches; updateControls(); });
  updateControls();
  render(0);
  requestAnimationFrame(frame);
})();
