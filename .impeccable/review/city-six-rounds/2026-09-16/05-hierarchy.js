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
      const ww = Math.min(cw * (variant % 2 ? 0.29 : 0.36), ch * 0.25);
      const hh = Math.min(ch * 0.68, ww * (variant % 3 === 0 ? 3.1 : 2.35));
      arch(x + cw * (col + 0.5) - ww / 2, y + ch * row + (ch - hh) * 0.3, ww, hh, ink);
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
    windows(w * 0.06, h * 0.05, w * 0.88, h * 0.93, w < h * 0.25 ? 2 : 3, clamp(Math.round(h / w * 2.4), 2, 7), ink, variant);
  });
  define('long-slits', 'Cathedral slots', 'chamber', ({ w, h, ink }) => {
    for (let i = 0; i < 3; i++) arch(w * (0.17 + i * 0.25), h * 0.09, w * 0.09, h * 0.81, ink);
  });
  define('fan', 'Unfolding fan chamber', 'chamber', ({ w, h, ink, paper, variant }) => {
    rect(0, 0, w, h, ink);
    ctx.save();
    if (variant % 2) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    const ox = w * 0.06, oy = h * 0.95;
    const rx = w * 0.9, ry = Math.min(h * 0.91, w * 1.28);
    const point = (a, r = 1) => [ox + Math.cos(a) * rx * r, oy + Math.sin(a) * ry * r];
    for (let i = 0; i < 7; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 14;
      const a = point(angle + 0.018, 0.92), tip = point(angle + 0.105, 1.08), b = point(angle + 0.198, 0.92);
      path(() => {
        ctx.moveTo(ox, oy); ctx.lineTo(...a);
        ctx.quadraticCurveTo(...tip, ...b); ctx.closePath();
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
    const edge = t => 0.63 + 0.21 * Math.sin(t * TAU - 0.7);
    path(() => {
      ctx.moveTo(w * 0.04, 0);
      for (let i = 0; i <= 60; i++) ctx.lineTo(w * edge(i / 60), h * i / 60);
      ctx.lineTo(w * 0.04, h); ctx.closePath();
    }, paper);
    const rows = clamp(Math.round(h / w * 3), 4, 9);
    for (let i = 0; i < rows; i++) {
      const t = (i + 0.5) / rows, right = edge(t), ww = w * 0.06;
      for (let j = 0; j < 3; j++) arch(w * (0.12 + (right - 0.24) * j / 2), h * t - ww, ww, ww * 2.4, ink);
      if (i % 3 === variant % 3) ellipse(w * (right + 0.11), h * t, w * 0.025, w * 0.025, paper);
    }
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
    const n = clamp(Math.round(h / w * 1.7), 2, 8), step = h / n;
    line(w * 0.5, 0, w * 0.5, h, ink, Math.max(0.8, w * 0.014));
    for (let i = 0; i < n; i++) {
      const ww = Math.min(w * (0.71 + (i % 2) * 0.17), step * 1.9);
      bowl((w - ww) / 2, i * step + step * 0.12, ww, Math.min(step * 0.62, ww * 0.45), ink);
      if (variant % 2) rail(w * 0.2, i * step - step * 0.06, w * 0.6, step * 0.1, ink, 5);
    }
  });
  define('split-disks', 'Split disk spine', 'chamber', ({ w, h, ink, paper, variant }) => {
    const n = clamp(Math.round(h / w), 2, 7), step = h / n;
    line(w / 2, 0, w / 2, h, ink, Math.max(0.8, w * 0.016));
    for (let i = 0; i < n; i++) {
      const rx = Math.min(w * 0.35, step * 0.42), cy = (i + 0.5) * step;
      ellipse(w / 2, cy, rx, rx, ink);
      ctx.save(); path(() => ctx.rect((i + variant) % 2 ? 0 : w / 2, i * step, w / 2, step)); ctx.clip();
      ellipse(w / 2, cy, rx - Math.min(rx * 0.2, Math.max(0.8, w * 0.015)), rx - Math.min(rx * 0.2, Math.max(0.8, w * 0.015)), paper);
      ctx.restore();
    }
  });
  define('teeth', 'Sideways scallops', 'chamber', ({ w, h, ink, paper, variant }) => {
    rect(0, 0, w, h, ink);
    const n = clamp(Math.round(h / w * 1.6), 3, 8), step = h / n;
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

  define('terraced-court', 'Terraced courtyard', 'chamber', ({ w, h, ink, paper, variant }) => {
    const mirror = variant % 2;
    ctx.save(); if (mirror) { ctx.translate(w,0); ctx.scale(-1,1); }
    rect(w * 0.06, h * 0.58, w * 0.78, h * 0.42, ink);
    arch(w * 0.22, h * 0.63, w * 0.44, h * 0.37, paper);
    rect(w * 0.06, h * 0.14, w * 0.35, h * 0.45, ink);
    windows(w * 0.1, h * 0.17, w * 0.27, h * 0.34, 2, 2, paper);
    rail(w * 0.06, h * 0.045, w * 0.35, h * 0.1, ink, 5);
    line(w * 0.21, 0, w * 0.21, h * 0.045, ink, 1);
    ellipse(w * 0.21, h * 0.01, w * 0.025, w * 0.025, ink);
    for (let i = 0; i < 6; i++) rect(w * (0.42 + i * 0.069), h * (0.56 - i * 0.05), w * 0.069, h * (0.04 + i * 0.05), ink);
    ctx.restore();
  }, { narrow: false });
  define('offset-arcades', 'Offset arcade balconies', 'chamber', ({ w, h, ink, paper, variant }) => {
    const rows = 3, fh = h / rows;
    for (let i = 0; i < rows; i++) {
      const x = (i + variant) % 2 ? w * 0.31 : w * 0.04;
      rect(x, i * fh + fh * 0.05, w * 0.65, fh * 0.61, ink);
      windows(x + w * 0.04, i * fh + fh * 0.1, w * 0.57, fh * 0.58, 3, 1, paper);
      bowl(x, i * fh + fh * 0.66, w * 0.65, fh * 0.21, ink);
      line(x + w * 0.32, i * fh + fh * 0.87, x + w * 0.32, (i+1) * fh, ink, 1);
    }
  });
  define('pleated-vault', 'Pleated vault', 'chamber', ({ w, h, ink, paper }) => {
    path(() => {
      ctx.moveTo(w * 0.06,h); ctx.lineTo(w * 0.06,h * 0.52);
      ctx.bezierCurveTo(w * 0.06,h * 0.18,w * 0.53,h * 0.17,w * 0.9,0);
      ctx.lineTo(w * 0.95,h); ctx.closePath();
    }, ink);
    for (let i = 0; i < 5; i++) {
      const x = w * (0.15 + i * 0.15), y = h * (0.48 - i * 0.055);
      arch(x, y, w * 0.06, h * 0.96 - y, paper);
    }
  }, { narrow: false });
  define('fluted-dome', 'Fluted dome', 'crown', ({ w, h, ink, paper }) => {
    rect(w * 0.18,h * 0.69,w * 0.64,h * 0.31,ink);
    windows(w * 0.24,h * 0.73,w * 0.52,h * 0.24,3,1,paper);
    path(() => {
      ctx.moveTo(0,h * 0.7); ctx.bezierCurveTo(-w * 0.12,h * 0.4,w * 0.5,h * 0.42,w * 0.5,h * 0.07);
      ctx.bezierCurveTo(w * 0.5,h * 0.42,w * 1.12,h * 0.4,w,h * 0.7);ctx.closePath();
    }, ink);
    for (let i = 1; i < 5; i++) line(w * (0.25 + i * 0.1),h * 0.46,w * (i / 5),h * 0.68,paper,Math.max(1,w * 0.035));
    line(w * 0.5,0,w * 0.5,h * 0.09,ink,1);
    ellipse(w * 0.5,h * 0.015,w * 0.024,w * 0.024,ink);
  });
  define('sail-pavilion', 'Floating sail pavilion', 'crown', ({ w, h, ink, paper }) => {
    path(() => {
      ctx.moveTo(-w * 0.12,h * 0.24); ctx.lineTo(w * 1.12,h * 0.24);
      ctx.bezierCurveTo(w * 0.79,h * 0.48,w * 0.88,h * 0.72,w * 0.79,h * 0.84);
      ctx.quadraticCurveTo(w * 0.5,h * 1.06,w * 0.21,h * 0.84);
      ctx.bezierCurveTo(w * 0.12,h * 0.72,w * 0.21,h * 0.48,-w * 0.12,h * 0.24);
    }, ink);
    for(let i=0;i<4;i++) arch(w*(0.22+i*0.15),h*0.36,w*0.08,h*0.44,paper);
    line(w*0.61,0,w*0.61,h*0.24,ink,1);
    ellipse(w*0.61,h*0.015,w*0.032,w*0.032,ink);
    rail(w*0.19,h*0.77,w*0.62,h*0.12,paper,9);
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

  define('bridge', 'Arched skybridge', 'connector', ({ w, h, ink, paper }) => {
    // The opening clears the walls beneath the span, making a shared courtyard.
    path(() => {
      ctx.moveTo(w * 0.08, h); ctx.lineTo(w * 0.08, h * 0.63);
      ctx.bezierCurveTo(w * 0.24, h * 0.2, w * 0.76, h * 0.2, w * 0.92, h * 0.63);
      ctx.lineTo(w * 0.92, h); ctx.closePath();
    }, paper);
    path(() => {
      ctx.moveTo(0, h * 0.2); ctx.lineTo(w, h * 0.2); ctx.lineTo(w, h * 0.75);
      ctx.lineTo(w * 0.88, h * 0.75);
      ctx.bezierCurveTo(w * 0.78, h * 0.32, w * 0.22, h * 0.32, w * 0.12, h * 0.75);
      ctx.lineTo(0, h * 0.75); ctx.closePath();
    }, ink);
    rail(w * 0.035, 0, w * 0.93, h * 0.2, ink, clamp(Math.round(w / 8), 6, 22));
  });
  define('hanging-bowl', 'Hanging crescent', 'connector', ({ w, h, ink, paper }) => {
    line(w * 0.1, 0, w * 0.1, h * 0.36, ink, 1.2);
    line(w * 0.9, 0, w * 0.9, h * 0.36, ink, 1.2);
    bowl(0, h * 0.35, w, h * 0.6, ink);
    for (let i = 0; i < 5; i++) arch(w * (0.2 + i * 0.12), h * 0.4, w * 0.045, h * 0.22, paper);
  });
  define('cross-stair', 'Crossing stair', 'connector', ({ w, h, ink, paper, variant }) => {
    ctx.save();
    if (variant % 2) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    const steps = 12, sw = w / steps, sh = h * 0.67 / steps;
    const pts = [[0, h * 0.15]];
    for (let i = 0; i < steps; i++) { pts.push([i * sw, h * 0.15 + i * sh]); pts.push([(i + 1) * sw, h * 0.15 + i * sh]); }
    pts.push([w, h], [0, h * 0.34]);
    polygon(pts, paper);
    path(() => { pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.closePath(); }, null, ink, Math.max(0.8,w/180));
    line(0, 0, w, h * 0.67, ink, 1.1);
    for (let i = 0; i <= steps; i++) line(i * sw, i * sh, i * sw, h * 0.15 + i * sh, ink, 0.8);
    ctx.restore();
  });

  const library = Object.fromEntries(blocks.map(block => [block.id, block]));
  const family = role => blocks.filter(block => block.role === role);

  function compose(w, h, value) {
    const random = randomFactory(value);
    const count = clamp(Math.round(w / h * 9), 5, 20);
    const widths = Array.from({ length: count }, (_, i) => (i % 3 === 1 ? pick(random, [0.36, 0.44, 0.55]) : pick(random, [0.85, 1.2, 1.7])));
    const total = widths.reduce((a, b) => a + b, 0), margin = Math.min(w, h) * 0.009;
    let x = margin;
    const baseLine = h - margin;
    const broad = widths.map((v, i) => v > 0.7 ? i : -1).filter(i => i >= 0);
    const fanPosition = Math.floor(broad.length / 2);
    const featureBlocks = new Map([
      [broad[fanPosition], 'fan'],
      [broad[broad.length > 3 ? 1 : 0], 'folding-stair'],
      [broad[broad.length > 3 ? broad.length - 2 : broad.length - 1], 'swell']
    ]);
    let previousCrown = '', previousBase = '', orbCount = 0;
    const crownUsage = new Map();
    const towers = widths.map((ratio, index) => {
      const bw = (w - 2 * margin) * ratio / total;
      const top = h * (0.14 + random() * 0.25);
      const baseTop = baseLine - h * (0.08 + random() * 0.045);
      const paper = index % 2 ? WHITE : BLACK, ink = inverse(paper);
      const narrow = ratio < 0.7;
      let crownOptions = family('crown').filter(b => (!narrow || b.narrow) && b.id !== previousCrown &&
        (b.id !== 'striped-orb' || (orbCount < 2 && index > 0 && index < count - 1)) &&
        (b.id !== 'half-moon' || (index > 0 && index < count - 1)));
      const leastUsed = Math.min(...crownOptions.map(b => crownUsage.get(b.id) || 0));
      crownOptions = crownOptions.filter(b => (crownUsage.get(b.id) || 0) === leastUsed);
      const tower = { x, w: bw, top, baseTop, baseLine, paper, ink, index, modules: [],
        base: pick(random, family('base').filter(b => b.id !== previousBase)).id,
        crown: pick(random, crownOptions).id,
        crownTop: Math.max(h * 0.015, top - h * (0.075 + random() * 0.16)), variant: Math.floor(random() * 12),
        profile: narrow ? 'straight' : pick(random, ['terrace', 'terrace', 'curve', 'straight']),
        lean: (random() < 0.5 ? -1 : 1) * bw * 0.16 };
      previousCrown = tower.crown; previousBase = tower.base;
      crownUsage.set(tower.crown,(crownUsage.get(tower.crown)||0)+1);
      if (tower.crown === 'striped-orb') orbCount++;
      const crownRatio = tower.crown === 'striped-orb' ? 0.96 : tower.crown === 'half-moon' ? 1.35 : 1.6;
      tower.crownTop = Math.max(h * 0.018, top - Math.min(top - tower.crownTop, bw * crownRatio));
      x += bw;
      const available = baseTop - top;
      const hero = featureBlocks.has(index);
      let ids;
      if (hero) {
        const id = featureBlocks.get(index);
        ids = [pick(random, ['arcade', 'offset-arcades']), id, pick(random, ['arcade', 'terraced-court']), pick(random, ['balconies', 'pleated-vault'])];
      } else {
        const candidates = narrow ? ['arcade', 'split-disks', 'bowls', 'pleats', 'dot-slots', 'long-slits'] : ['arcade', 'offset-arcades', 'terraced-court', 'pleated-vault', 'balconies', 'long-slits', 'dot-slots', 'lantern-neck', 'teeth'];
        ids = Array.from({ length: narrow ? pick(random, [3, 4]) : pick(random, [4, 5, 6]) }, () => pick(random, candidates));
        for (let i = 1; i < ids.length; i++) if (ids[i] === ids[i - 1]) ids[i] = 'arcade';
      }
      const fractions = ids.map(id => library[id].hero ? 2.6 : 0.5 + random() * 0.6);
      const fanAt = ids.indexOf('fan');
      const fanHeight = fanAt < 0 ? 0 : Math.min(available * 0.53, bw * 1.38);
      const sum = fractions.reduce((a, b, i) => a + (i === fanAt ? 0 : b), 0);
      let y = top;
      ids.forEach((id, i) => {
        const hh = i === ids.length - 1 ? baseTop - y : i === fanAt ? fanHeight : (available - fanHeight) * fractions[i] / sum;
        const flip = false;
        tower.modules.push({ id, x: tower.x, y, w: bw, h: hh, paper: flip ? ink : paper, ink: flip ? paper : ink, variant: Math.floor(random() * 12) });
        y += hh;
      });
      return tower;
    });
    const connectors = [];
    for (let i = 0; i < towers.length - 1; i += 3) {
      const a = towers[i], b = towers[i + 1];
      let yy = Math.max(a.top, b.top) + (Math.min(a.baseTop,b.baseTop) - Math.max(a.top,b.top)) * (0.25 + (i % 3) * 0.1 + random() * 0.3);
      const broadSpan = Math.floor(i / 3) % 3 === 2;
      const bridgeW = broadSpan ? a.w * 0.78 + b.w * 0.95 : a.w * 0.46 + b.w * 0.68;
      const bridgeH = Math.min(h * 0.11, bridgeW * 0.48);
      const fan = [...a.modules,...b.modules].find(m=>m.id === 'fan');
      if (fan && yy < fan.y + fan.h && yy + bridgeH > fan.y) yy = fan.y + fan.h + h * 0.005;
      if (yy + bridgeH >= Math.min(a.baseTop,b.baseTop)) yy = Math.max(a.top,b.top) + h * 0.01;
      connectors.push({ id: ['bridge','cross-stair','hanging-bowl'][Math.floor(i / 3) % 3], x: a.x + a.w * (broadSpan ? 0.22 : 0.54), y: yy, w: bridgeW, h: bridgeH, ink: BLACK, paper: WHITE, variant: i });
    }
    return { towers, connectors, seed: value };
  }

  function drawBlock(block, clip = true) {
    ctx.save(); ctx.translate(block.x || 0, block.y || 0);
    if (clip) { path(() => ctx.rect(0, 0, block.w, block.h)); ctx.clip(); }
    library[block.id].draw(block);
    ctx.restore();
  }
  // Exterior profiles belong to whole buildings, not to individual motif tiles.
  function profileAt(tower, t) {
    const offset = tower.lean / tower.w;
    let l = 0, r = 1;
    if (tower.profile === 'curve') {
      l = 0.05 + 0.16 * Math.sin(t * TAU + 0.5) + offset * (1 - t);
      r = 0.94 + 0.18 * Math.sin(t * TAU - 0.4) + offset * (1 - t);
    } else if (tower.profile === 'terrace') {
      const i = t < 0.22 ? 0 : t < 0.53 ? 1 : t < 0.78 ? 2 : 3;
      l = [0.2, 0.03, -0.12, 0.03][i] + offset * (1 - i / 4);
      r = [0.88, 1.03, 0.91, 1.08][i] + offset * (1 - i / 4);
    }
    if (t > 0.94) { const k = (1 - t) / 0.06; l *= k; r = 1 + (r - 1) * k; }
    return [tower.x + l * tower.w, tower.x + r * tower.w];
  }
  function towerOutline(tower) {
    const hh = tower.baseTop - tower.top;
    const ts = tower.profile === 'terrace' ? [0,0.21999,0.22,0.52999,0.53,0.77999,0.78,0.94,1] : Array.from({length:81},(_,i)=>i/80);
    ctx.beginPath();
    ts.forEach((t,i)=>{ const [l] = profileAt(tower,t); if(i)ctx.lineTo(l,tower.top+t*hh);else ctx.moveTo(l,tower.top); });
    ts.slice().reverse().forEach(t=>ctx.lineTo(profileAt(tower,t)[1],tower.top+t*hh));
    ctx.closePath();
  }
  function contentBox(tower, block) {
    const full = tower.baseTop - tower.top;
    let left = -Infinity, right = Infinity;
    for (let i = 0; i <= 20; i++) {
      const t = clamp((block.y + block.h * (0.02 + i * 0.048) - tower.top) / full,0,1);
      const [l,r] = profileAt(tower,t); left = Math.max(left,l); right = Math.min(right,r);
    }
    const inset = Math.min(tower.w * 0.045,(right-left)*0.05);
    return {...block, x:left+inset, w:Math.max(tower.w*0.25,right-left-inset*2)};
  }
  function drawCity(layout, w, h) {
    rect(0, 0, w, h, WHITE);
    for (const tower of layout.towers) {
      ctx.save(); towerOutline(tower);
      ctx.fillStyle = tower.paper; ctx.fill();
      ctx.clip();
      for (const block of tower.modules) {
        rect(block.x, block.y, block.w, block.h, block.paper);
        drawBlock(contentBox(tower, block));
      }
      ctx.restore();
      if (tower.paper === WHITE) { towerOutline(tower); ctx.strokeStyle = BLACK; ctx.lineWidth = Math.max(0.8, w / 1400); ctx.stroke(); }
    }
    for (const tower of layout.towers) drawBlock({ id: tower.crown, x: tower.x + tower.lean * 0.4, y: tower.crownTop, w: tower.w, h: tower.top - tower.crownTop, ink: BLACK, paper: WHITE, variant: tower.variant }, false);
    for (const block of layout.connectors) drawBlock(block);
    for (const tower of layout.towers) {
      drawBlock({ id: tower.base, x: tower.x, y: tower.baseTop, w: tower.w, h: tower.baseLine - tower.baseTop, ink: tower.ink, paper: tower.paper, variant: tower.variant });
      line(tower.x, tower.baseTop, tower.x, tower.baseLine, tower.ink, Math.max(0.7, w / 1500));
    }
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
