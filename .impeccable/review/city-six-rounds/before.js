(() => {
  'use strict';

  const canvas = document.getElementById('city');
  let ctx = canvas.getContext('2d', { alpha: false });
  const params = new URLSearchParams(location.search);
  const debug = params.get('debug') === 'true';
  const BLACK = '#000', WHITE = '#fff', TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = (random, list) => list[Math.floor(random() * list.length)];
  const inverse = color => color === BLACK ? WHITE : BLACK;
  let width, height, dpr, city;
  let seed = Number(params.get('seed') || 1907) >>> 0;

  function randomFactory(value) {
    return () => {
      value = (value + 0x6d2b79f5) | 0;
      let t = Math.imul(value ^ (value >>> 15), 1 | value);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rect(x, y, w, h, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  function path(draw, fill, stroke, weight = 1) {
    ctx.beginPath(); draw();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = weight; ctx.stroke(); }
  }
  function polygon(points, fill) {
    path(() => { points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); }, fill);
  }
  function line(x, y, xx, yy, color, weight = 1) {
    path(() => { ctx.moveTo(x, y); ctx.lineTo(xx, yy); }, null, color, weight);
  }
  function ellipse(x, y, rx, ry, fill, stroke, weight) {
    path(() => ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, TAU), fill, stroke, weight);
  }
  function arch(x, y, w, h, fill) {
    const r = Math.min(w / 2, h * 0.48);
    path(() => {
      ctx.moveTo(x, y + h); ctx.lineTo(x, y + r);
      ctx.bezierCurveTo(x, y - r / 3, x + w, y - r / 3, x + w, y + r);
      ctx.lineTo(x + w, y + h); ctx.closePath();
    }, fill);
  }
  function bowl(x, y, w, h, fill) {
    path(() => {
      ctx.moveTo(x, y); ctx.lineTo(x + w, y);
      ctx.bezierCurveTo(x + w * 0.92, y + h * 1.32, x + w * 0.08, y + h * 1.32, x, y);
    }, fill);
  }
  function rail(x, y, w, h, color, count = 7) {
    const weight = Math.max(0.65, Math.min(w / 100, 1.5));
    line(x, y, x + w, y, color, weight);
    line(x, y + h, x + w, y + h, color, weight);
    for (let i = 0; i <= count; i++) line(x + w * i / count, y, x + w * i / count, y + h, color, weight);
  }
  function windows(x, y, w, h, columns, rows, ink, variant = 0) {
    const cw = w / columns, ch = h / rows;
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      const ww = cw * (variant % 2 ? 0.36 : 0.42);
      arch(x + cw * (col + 0.5) - ww / 2, y + ch * row, ww, ch * 0.76, ink);
    }
  }

  // Each drawing is local to its allotted box. Role and width constraints live
  // with the drawing, so the composer and the specimen catalog use one library.
  const blocks = [];
  function define(id, name, role, draw, options = {}) {
    const block = { id, name, role, draw, narrow: true, ...options };
    blocks.push(block);
    return block;
  }

  define('scallop-door', 'Scalloped threshold', 'base', ({ w, h, ink, paper }) => {
    rect(0, 0, w, h, paper);
    const n = Math.max(3, Math.round(w / h * 4));
    rect(0, 0, w, h * 0.16, ink);
    for (let i = 0; i < n; i++) bowl(i * w / n, h * 0.16, w / n, h * 0.15, ink);
    arch(w * 0.16, h * 0.42, w * 0.68, h * 0.58, ink);
    arch(w * 0.21, h * 0.48, w * 0.58, h * 0.52, paper);
    line(w / 2, h * 0.58, w / 2, h, ink, Math.max(1, w * 0.013));
  });
  define('curtain', 'Split curtain pavilion', 'base', ({ w, h, ink, paper }) => {
    rect(0, 0, w, h, ink);
    path(() => { ctx.moveTo(0, h * 0.23); ctx.quadraticCurveTo(w / 2, -h * 0.2, w, h * 0.23); ctx.closePath(); }, paper);
    rect(w * 0.06, h * 0.23, w * 0.88, h * 0.035, paper);
    path(() => {
      ctx.moveTo(w * 0.09, h * 0.3); ctx.lineTo(w * 0.47, h * 0.3);
      ctx.quadraticCurveTo(w * 0.47, h * 0.69, w * 0.09, h * 0.85); ctx.closePath();
      ctx.moveTo(w * 0.53, h * 0.3); ctx.lineTo(w * 0.91, h * 0.3);
      ctx.lineTo(w * 0.91, h * 0.85); ctx.quadraticCurveTo(w * 0.53, h * 0.69, w * 0.53, h * 0.3);
    }, paper);
    arch(w * 0.42, h * 0.77, w * 0.16, h * 0.23, paper);
  });
  define('sawtooth-gate', 'Sawtooth gateway', 'base', ({ w, h, ink, paper }) => {
    rect(0, 0, w, h, paper);
    for (let i = 0; i < 3; i++) polygon([[i * w / 3, h * 0.29], [(i + 0.5) * w / 3, 0], [(i + 1) * w / 3, h * 0.29]], ink);
    path(() => {
      ctx.moveTo(w * 0.1, h); ctx.lineTo(w * 0.1, h * 0.65);
      ctx.quadraticCurveTo(w * 0.1, h * 0.48, w * 0.5, h * 0.36);
      ctx.quadraticCurveTo(w * 0.9, h * 0.48, w * 0.9, h * 0.65);
      ctx.lineTo(w * 0.9, h); ctx.closePath();
    }, ink);
  });
  define('stair-door', 'Stepped recess', 'base', ({ w, h, ink, paper }) => {
    rect(0, 0, w, h, paper);
    arch(w * 0.13, h * 0.04, w * 0.74, h * 0.96, ink);
    for (let i = 0; i < 6; i++) rect(w * 0.13, h * (0.95 - i * 0.075), w * (0.71 - i * 0.095), h * 0.04, paper);
  });
  define('shutter', 'Comb shutter', 'base', ({ w, h, ink, paper, variant }) => {
    rect(0, 0, w, h, ink);
    rect(w * 0.06, h * 0.04, w * 0.88, h * 0.13, paper);
    const n = variant % 2 ? 7 : 5;
    for (let i = 0; i < n; i++) rect(w * 0.1, h * (0.27 + i * 0.73 / n), w * 0.8, h * 0.34 / n, paper);
  });
  define('split-entry', 'Unequal doorways', 'base', ({ w, h, ink, paper }) => {
    rect(0, 0, w, h, paper);
    rect(0, 0, w, h * 0.12, ink);
    arch(w * 0.08, h * 0.3, w * 0.28, h * 0.7, ink);
    arch(w * 0.47, h * 0.2, w * 0.44, h * 0.8, ink);
    rect(w * 0.65, h * 0.63, w * 0.025, h * 0.37, paper);
  });

  define('arcade', 'Unequal arcades', 'chamber', ({ w, h, ink, variant }) => {
    windows(w * 0.05, h * 0.09, w * 0.9, h * 0.86, w < h * 0.4 ? 2 : 3, variant % 2 + 2, ink, variant);
  });
  define('long-slits', 'Cathedral slots', 'chamber', ({ w, h, ink }) => {
    windows(w * 0.08, h * 0.05, w * 0.84, h * 0.92, 3, 1, ink);
  });
  define('fan', 'Unfolding fan chamber', 'chamber', ({ w, h, ink, paper, variant }) => {
    rect(0, 0, w, h, ink);
    // Curved, tapering blades share a hinge but never become a pictogram.
    ctx.save();
    if (variant % 2) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    const ox = w * 0.09, oy = h * 0.92;
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i * 0.265;
      const da = 0.105;
      const point = angle => [ox + Math.cos(angle) * w * 0.84, oy + Math.sin(angle) * h * 0.87];
      const p = point(a), q = point(a + da * 1.9);
      path(() => {
        ctx.moveTo(ox, oy); ctx.lineTo(...p);
        ctx.bezierCurveTo(p[0] + w * 0.09, p[1] - h * 0.055, q[0] + w * 0.06, q[1] - h * 0.03, ...q);
        ctx.closePath();
      }, paper);
    }
    ctx.restore();
  }, { narrow: false, hero: true });
  define('folding-stair', 'Folding stair ribbon', 'chamber', ({ w, h, ink, paper, variant }) => {
    rect(0, 0, w, h, ink);
    const flights = clamp(Math.round(h / w * 1.7), 2, 5), fh = h / flights;
    for (let f = 0; f < flights; f++) {
      ctx.save(); ctx.translate(0, f * fh);
      if ((f + variant) % 2) { ctx.translate(w, 0); ctx.scale(-1, 1); }
      const points = [[w * 0.05, 0], [w * 0.3, 0], [w * 0.94, fh * 0.76], [w * 0.94, fh], [w * 0.73, fh]];
      for (let i = 6; i >= 0; i--) {
        points.push([w * (0.05 + i * 0.097), fh * (0.12 + i * 0.12)]);
        points.push([w * (0.05 + i * 0.097), fh * i * 0.12]);
      }
      polygon(points, paper);
      arch(w * 0.71, fh * 0.04, w * 0.075, fh * 0.25, paper);
      arch(w * 0.82, fh * 0.04, w * 0.075, fh * 0.25, paper);
      rail(w * 0.05, fh * 0.02, w * 0.24, fh * 0.12, ink, 4);
      ctx.restore();
    }
  }, { narrow: false, hero: true });
  define('swell', 'Swelling wall', 'chamber', ({ w, h, ink, paper, variant }) => {
    rect(0, 0, w, h, ink);
    path(() => {
      ctx.moveTo(w * 0.12, 0);
      ctx.bezierCurveTo(w * 1.15, h * 0.25, -w * 0.18, h * 0.6, w * 0.92, h);
      ctx.lineTo(w * 0.05, h); ctx.closePath();
    }, paper);
    ctx.save();
    path(() => {
      ctx.moveTo(w * 0.12, 0); ctx.bezierCurveTo(w * 1.15, h * 0.25, -w * 0.18, h * 0.6, w * 0.92, h);
      ctx.lineTo(w * 0.05, h); ctx.closePath();
    }); ctx.clip();
    windows(w * 0.03, h * 0.06, w * 0.75, h * 0.92, 3, variant % 2 + 4, ink);
    ctx.restore();
  }, { narrow: false, hero: true });
  define('balconies', 'Suspended balconies', 'chamber', ({ w, h, ink, paper, variant }) => {
    const rows = clamp(Math.round(h / w * 1.6), 2, 4), step = h / rows;
    for (let i = 0; i < rows; i++) {
      const x = (i + variant) % 2 ? w * 0.35 : w * 0.07;
      arch(x, i * step + step * 0.05, w * 0.24, step * 0.56, ink);
      rect(x - w * 0.045, i * step + step * 0.63, w * 0.57, step * 0.2, paper);
      rail(x - w * 0.045, i * step + step * 0.63, w * 0.57, step * 0.2, ink, 7);
    }
  });
  define('bowls', 'Floating scallop stack', 'chamber', ({ w, h, ink, variant }) => {
    const n = clamp(Math.round(h / w * 1.8), 3, 7), step = h / n;
    line(w * 0.5, 0, w * 0.5, h, ink, Math.max(0.8, w * 0.014));
    for (let i = 0; i < n; i++) {
      const ww = w * (0.77 + (i % 2) * 0.17);
      bowl((w - ww) / 2, i * step + step * 0.04, ww, step * 0.75, ink);
      if (variant % 2) rail(w * 0.2, i * step - step * 0.06, w * 0.6, step * 0.1, ink, 5);
    }
  });
  define('split-disks', 'Split disk spine', 'chamber', ({ w, h, ink, paper, variant }) => {
    const n = clamp(Math.round(h / w), 2, 7), step = h / n;
    line(w / 2, 0, w / 2, h, ink, Math.max(0.8, w * 0.016));
    for (let i = 0; i < n; i++) {
      const rx = Math.min(w * 0.46, step * 0.48), cy = (i + 0.5) * step;
      ellipse(w / 2, cy, rx, step * 0.46, ink);
      ctx.save(); path(() => ctx.rect((i + variant) % 2 ? 0 : w / 2, i * step, w / 2, step)); ctx.clip();
      ellipse(w / 2, cy, rx - Math.max(0.8, w * 0.02), step * 0.46 - Math.max(0.8, w * 0.02), paper);
      ctx.restore();
    }
  });
  define('teeth', 'Sideways scallops', 'chamber', ({ w, h, ink, paper, variant }) => {
    rect(0, 0, w, h, ink);
    const n = clamp(Math.round(h / w * 1.4), 3, 7), step = h / n;
    for (let i = 0; i < n; i++) ellipse(variant % 2 ? 0 : w, (i + 0.5) * step, w * 0.79, step * 0.49, paper);
  });
  define('pleats', 'Pleated wall', 'chamber', ({ w, h, ink, variant }) => {
    const n = variant % 2 ? 7 : 5;
    for (let i = 0; i < n; i++) polygon([[w * i / n, 0], [w * (i + 0.4) / n, h * 0.06], [w * (i + 0.8) / n, h], [w * (i + 0.3) / n, h * 0.9]], ink);
  });
  define('dot-slots', 'Dots into slots', 'chamber', ({ w, h, ink, variant }) => {
    const columns = w > h * 0.35 ? 3 : 1;
    for (let row = 0; row < 5; row++) for (let col = 0; col < columns; col++) {
      const x = w * (col + 0.5) / columns, y = h * (row + 0.5) / 5;
      const r = Math.min(w / columns * 0.19, h * 0.045);
      if (row > 2 && variant % 2) arch(x - r, y - r, r * 2, h * 0.12, ink);
      else ellipse(x, y, r, r, ink);
    }
  });
  define('lantern-neck', 'Flared chamber', 'chamber', ({ w, h, ink, paper }) => {
    path(() => {
      ctx.moveTo(0, 0); ctx.lineTo(w, 0);
      ctx.bezierCurveTo(w * 0.6, h * 0.3, w * 0.8, h * 0.7, w * 0.87, h);
      ctx.lineTo(w * 0.13, h); ctx.bezierCurveTo(w * 0.2, h * 0.7, w * 0.4, h * 0.3, 0, 0);
    }, ink);
    windows(w * 0.17, h * 0.2, w * 0.66, h * 0.65, 3, 1, paper);
  }, { narrow: false });

  define('striped-orb', 'Striped sky vessel', 'crown', ({ w, h, ink, paper }) => {
    const cy = h * 0.37, rx = w * 0.61, ry = h * 0.27;
    rail(w * 0.32, h * 0.66, w * 0.36, h * 0.34, ink, 2);
    line(w * 0.32, h, w * 0.68, h * 0.66, ink, 1.2);
    line(w * 0.68, h, w * 0.32, h * 0.66, ink, 1.2);
    ellipse(w * 0.5, cy, rx, ry, paper, ink, 1);
    ctx.save(); path(() => ctx.ellipse(w * 0.5, cy, rx, ry, 0, 0, TAU)); ctx.clip();
    for (let i = -3; i <= 3; i++) {
      const x = w * (0.47 + i * 0.18), bend = i * w * 0.025;
      path(() => {
        ctx.moveTo(x, cy - ry); ctx.bezierCurveTo(x + bend, cy - ry * 0.3, x + bend, cy + ry * 0.3, x, cy + ry);
        ctx.lineTo(x + w * 0.085, cy + ry); ctx.bezierCurveTo(x + w * 0.085 + bend, cy + ry * 0.3, x + w * 0.085 + bend, cy - ry * 0.3, x + w * 0.085, cy - ry); ctx.closePath();
      }, ink);
    }
    ctx.restore();
    line(w * 0.62, 0, w * 0.62, h * 0.11, ink, 1);
    ellipse(w * 0.62, h * 0.018, w * 0.027, w * 0.027, ink);
  }, { narrow: false });
  define('mobile', 'Balancing mobile', 'crown', ({ w, h, ink, paper, variant }) => {
    line(w * 0.43, h * 0.14, w * 0.43, h, ink, 1.2);
    line(w * 0.08, h * 0.3, w * 0.93, h * 0.43, ink, 1.1);
    polygon([[w * 0.54, h * 0.39], [w * 0.93, h * 0.03], [w * 0.93, h * 0.46]], ink);
    rect(w * 0.08, h * 0.08, w * 0.26, h * 0.2, ink);
    ellipse(w * 0.43, h * 0.32, w * 0.027, w * 0.027, ink);
    bowl(w * 0.04, h * 0.67, w * 0.92, h * 0.3, ink);
    if (variant % 2) rect(w * 0.21, h * 0.7, w * 0.08, h * 0.14, paper);
  });
  define('spindle', 'Slender spindle', 'crown', ({ w, h, ink }) => {
    line(w / 2, 0, w / 2, h, ink, 1.1);
    polygon([[w * 0.04, h], [w * 0.5, h * 0.59], [w * 0.96, h]], ink);
    polygon([[w * 0.5, h * 0.16], [w * 0.76, h * 0.29], [w * 0.5, h * 0.42], [w * 0.24, h * 0.29]], ink);
    ellipse(w / 2, h * 0.53, w * 0.14, h * 0.045, ink);
    ellipse(w / 2, h * 0.035, w * 0.037, w * 0.037, ink);
  });
  define('cup-stack', 'Cantilevered cups', 'crown', ({ w, h, ink }) => {
    line(w * 0.5, h * 0.02, w * 0.5, h, ink, 1.2);
    for (let i = 0; i < 3; i++) bowl(w * (0.18 - i * 0.05), h * (0.18 + i * 0.26), w * (0.64 + i * 0.1), h * 0.2, ink);
    ellipse(w * 0.5, h * 0.03, w * 0.05, w * 0.05, ink);
  });
  define('half-moon', 'Off-center moon', 'crown', ({ w, h, ink, paper }) => {
    line(w * 0.42, 0, w * 0.42, h, ink, 1.2);
    ellipse(w * 0.47, h * 0.44, w * 0.51, h * 0.32, ink);
    ctx.save(); path(() => ctx.rect(w * 0.47, 0, w, h)); ctx.clip();
    ellipse(w * 0.47, h * 0.44, w * 0.48, h * 0.31, paper);
    ctx.restore();
    rail(w * 0.27, h * 0.81, w * 0.4, h * 0.19, ink, 3);
  });
  define('pavilion', 'Needle pavilion', 'crown', ({ w, h, ink, paper }) => {
    rect(w * 0.22, h * 0.65, w * 0.56, h * 0.35, ink);
    windows(w * 0.25, h * 0.76, w * 0.5, h * 0.21, 3, 1, paper);
    polygon([[0, h * 0.65], [w * 0.52, h * 0.24], [w, h * 0.65]], ink);
    line(w * 0.52, h * 0.035, w * 0.52, h * 0.24, ink, 1);
    ellipse(w * 0.52, h * 0.04, w * 0.045, w * 0.045, ink);
  });

  define('bridge', 'Slender bridge', 'connector', ({ w, h, ink, paper }) => {
    rect(0, h * 0.7, w, h * 0.13, paper);
    rail(0, h * 0.22, w, h * 0.49, ink, Math.max(5, Math.round(w / 6)));
    line(0, h * 0.83, w, h * 0.83, ink, 1);
  });
  define('hanging-bowl', 'Hanging crescent', 'connector', ({ w, h, ink }) => {
    line(w * 0.1, 0, w * 0.1, h * 0.36, ink, 1);
    line(w * 0.9, 0, w * 0.9, h * 0.36, ink, 1);
    bowl(0, h * 0.35, w, h * 0.6, ink);
  });

  const library = Object.fromEntries(blocks.map(block => [block.id, block]));
  const family = role => blocks.filter(block => block.role === role);

  function compose(w, h, value) {
    const random = randomFactory(value);
    const count = clamp(Math.round(w / h * 11), 5, 22);
    const widths = Array.from({ length: count }, (_, i) => (i % 3 === 1 ? pick(random, [0.45, 0.55, 0.65]) : pick(random, [0.9, 1.15, 1.35])));
    const total = widths.reduce((a, b) => a + b, 0), margin = Math.min(w, h) * 0.009;
    let x = margin;
    const baseLine = h - margin;
    const broad = widths.map((v, i) => v > 0.7 ? i : -1).filter(i => i >= 0);
    const fanPosition = Math.floor(broad.length / 2);
    const featureBlocks = new Map([
      [broad[fanPosition], 'fan'],
      [broad[0], 'folding-stair'],
      [broad[broad.length - 1], 'swell']
    ]);
    let previousCrown = '', previousBase = '', orbCount = 0;
    const towers = widths.map((ratio, index) => {
      const bw = (w - 2 * margin) * ratio / total;
      const top = h * (0.14 + random() * 0.13);
      const baseTop = baseLine - h * (0.11 + random() * 0.035);
      const paper = index % 2 ? WHITE : BLACK, ink = inverse(paper);
      const narrow = ratio < 0.7;
      const crownOptions = family('crown').filter(b => (!narrow || b.narrow) && b.id !== previousCrown &&
        (b.id !== 'striped-orb' || (orbCount < 2 && index > 0 && index < count - 1)) &&
        (b.id !== 'half-moon' || (index > 0 && index < count - 1)));
      const tower = { x, w: bw, top, baseTop, baseLine, paper, ink, index, modules: [],
        base: pick(random, family('base').filter(b => b.id !== previousBase)).id,
        crown: pick(random, crownOptions).id,
        crownTop: h * (0.014 + random() * 0.035), variant: Math.floor(random() * 12) };
      previousCrown = tower.crown; previousBase = tower.base;
      if (tower.crown === 'striped-orb') orbCount++;
      x += bw;
      const available = baseTop - top;
      const hero = featureBlocks.has(index);
      let ids;
      if (hero) {
        const id = featureBlocks.get(index);
        ids = random() < 0.5 ? [id, pick(random, ['arcade', 'balconies', 'dot-slots'])] : [pick(random, ['arcade', 'long-slits']), id];
      } else {
        const candidates = family('chamber').filter(b => !b.hero && (!narrow || b.narrow));
        ids = Array.from({ length: narrow ? pick(random, [2, 3]) : pick(random, [2, 3, 4]) }, () => pick(random, candidates).id);
        for (let i = 1; i < ids.length; i++) if (ids[i] === ids[i - 1]) ids[i] = 'arcade';
      }
      const fractions = ids.map(id => library[id].hero ? 2.2 : 0.8 + random() * 0.65);
      const sum = fractions.reduce((a, b) => a + b, 0);
      let y = top;
      ids.forEach((id, i) => {
        const hh = i === ids.length - 1 ? baseTop - y : available * fractions[i] / sum;
        const flip = random() < 0.24;
        tower.modules.push({ id, x: tower.x, y, w: bw, h: hh, paper: flip ? ink : paper, ink: flip ? paper : ink, variant: Math.floor(random() * 12) });
        y += hh;
      });
      return tower;
    });
    const connectors = [];
    for (let i = 1; i < towers.length - 1; i += 4) {
      const a = towers[i], b = towers[i + 1];
      const yy = h * (0.32 + random() * 0.3);
      connectors.push({ id: random() < 0.65 ? 'bridge' : 'hanging-bowl', x: a.x + a.w * 0.72, y: yy, w: (a.w + b.w) * 0.3, h: Math.min(a.w, b.w) * 0.27, ink: BLACK, paper: WHITE, variant: 0 });
    }
    return { towers, connectors, seed: value };
  }

  function drawBlock(block, clip = true) {
    ctx.save(); ctx.translate(block.x || 0, block.y || 0);
    if (clip) { path(() => ctx.rect(0, 0, block.w, block.h)); ctx.clip(); }
    library[block.id].draw(block);
    ctx.restore();
  }
  function drawCity(layout, w, h) {
    rect(0, 0, w, h, WHITE);
    for (const tower of layout.towers) {
      rect(tower.x, tower.top, tower.w, tower.baseLine - tower.top, tower.paper);
      for (const block of tower.modules) {
        rect(block.x, block.y, block.w, block.h, block.paper);
        drawBlock(block);
      }
      drawBlock({ id: tower.base, x: tower.x, y: tower.baseTop, w: tower.w, h: tower.baseLine - tower.baseTop, ink: tower.ink, paper: tower.paper, variant: tower.variant });
      // A fine seam keeps adjacent inverted bases legible without framing rooms.
      line(tower.x, tower.baseTop, tower.x, tower.baseLine, tower.ink, Math.max(0.7, w / 1500));
    }
    // Crowns are deliberately free to overhang their bay; their tops remain in frame.
    for (const tower of layout.towers) drawBlock({ id: tower.crown, x: tower.x, y: tower.crownTop, w: tower.w, h: tower.top - tower.crownTop, ink: BLACK, paper: WHITE, variant: tower.variant }, false);
    for (const block of layout.connectors) drawBlock(block);
    line(w * 0.009, h - Math.min(w, h) * 0.009, w * 0.991, h - Math.min(w, h) * 0.009, BLACK, 1);
  }

  function resize() {
    width = Math.max(1, innerWidth); height = Math.max(1, innerHeight);
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
    city = compose(width, height, seed);
    drawCity(city, width, height);
    canvas.dataset.seed = String(seed);
  }
  function rebuild() {
    seed = (seed + 1 + Math.floor(Math.random() * 1000000)) >>> 0;
    resize();
  }

  function catalog() {
    document.documentElement.classList.add('debug-mode');
    document.body.classList.add('debug-mode');
    document.getElementById('debug-catalog').hidden = false;
    const grid = document.getElementById('debug-grid');
    const examples = [...blocks, { id: 'city-example', name: 'Composed city', role: 'composition' }];
    document.getElementById('debug-count').textContent = `${blocks.length} blocks · bases, chambers, crowns, connectors`;
    const previews = examples.map((block, index) => {
      const figure = document.createElement('figure'); figure.className = 'debug-specimen';
      const preview = document.createElement('canvas'); preview.className = 'debug-specimen-canvas';
      preview.setAttribute('role', 'img'); preview.setAttribute('aria-label', block.name);
      const caption = document.createElement('figcaption'); caption.className = 'debug-caption';
      const number = document.createElement('span'); number.className = 'debug-number'; number.textContent = String(index + 1).padStart(2, '0');
      const label = document.createElement('span');
      const name = document.createElement('span'); name.className = 'debug-name'; name.textContent = block.name;
      const group = document.createElement('span'); group.className = 'debug-group'; group.textContent = `${block.role} · ${block.id}`;
      label.append(name, group); caption.append(number, label); figure.append(preview, caption); grid.append(figure);
      return { preview, block };
    });
    const render = () => {
      const previous = ctx;
      for (const { preview, block } of previews) {
        const box = preview.getBoundingClientRect(), scale = Math.min(devicePixelRatio || 1, 2);
        preview.width = Math.round(box.width * scale); preview.height = Math.round(box.height * scale);
        ctx = preview.getContext('2d', { alpha: false }); ctx.setTransform(scale, 0, 0, scale, 0, 0);
        rect(0, 0, box.width, box.height, WHITE);
        if (block.role === 'composition') drawCity(compose(box.width, box.height, 1907), box.width, box.height);
        else {
          const bw = box.width * 0.58;
          const bh = block.role === 'base' ? box.height * 0.5 : block.role === 'connector' ? box.height * 0.25 : box.height * 0.8;
          drawBlock({ id: block.id, x: (box.width - bw) / 2, y: (box.height - bh) / 2, w: bw, h: bh, ink: BLACK, paper: WHITE, variant: 0 }, block.role !== 'crown');
        }
      }
      ctx = previous;
    };
    render(); addEventListener('resize', render, { passive: true });
  }

  if (debug) catalog();
  else {
    resize();
    canvas.addEventListener('click', rebuild);
    canvas.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); rebuild(); }
    });
    addEventListener('resize', resize, { passive: true });
  }
})();
