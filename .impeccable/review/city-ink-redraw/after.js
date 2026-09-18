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
  let seed = params.has('seed')
    ? Number(params.get('seed')) >>> 0
    : Math.floor(Math.random() * 0x100000000) >>> 0;

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
    // Parapets have a cap, a plinth and a few substantial uprights.
    const weight = Math.max(0.9, Math.min(w / 65, 2));
    const posts = Math.min(count, Math.max(2, Math.floor(w / 9)));
    line(x, y, x + w, y, color, weight * 1.35);
    line(x, y + h, x + w, y + h, color, weight * 1.8);
    for (let i = 0; i <= posts; i++) line(x + w * i / posts, y, x + w * i / posts, y + h, color, weight);
  }

  function portal(x, y, w, h, ink, paper) {
    arch(x, y, w, h, ink);
    // An offset inner opening gives the threshold a wall thickness.
    arch(x + w * 0.15, y + h * 0.1, w * 0.69, h * 0.9, paper);
    arch(x + w * 0.29, y + h * 0.18, w * 0.55, h * 0.82, ink);
    rect(x - w * 0.09, y + h, w * 1.18, h * 0.045, ink);
  }

  function stairRun(x, y, w, rise, ink, paper, steps = 8) {
    // Both endpoints are landings; the stepped upper edge is the walking route.
    const run = w / steps, lift = rise / steps;
    const points = [[x, y + rise]];
    for (let i = 0; i < steps; i++) {
      points.push([x + i * run, y + rise - (i + 1) * lift]);
      points.push([x + (i + 1) * run, y + rise - (i + 1) * lift]);
    }
    points.push([x + w, y + rise + lift * 1.2], [x, y + rise + lift * 1.2]);
    polygon(points, ink);
    for (let i = 1; i < steps; i++)
      line(x + i * run, y + rise - i * lift, x + w, y + rise - i * lift, paper, Math.max(0.7, rise / 100));
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
    for (let i = 0; i < 3; i++) polygon([[i * w / 3, h * 0.16], [(i + 0.5) * w / 3, 0], [(i + 1) * w / 3, h * 0.16]], ink);
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
  define('shutter', 'Shuttered passage', 'base', ({ w, h, ink, paper }) => {
    rect(0, 0, w, h, paper);
    rect(w * 0.025, h * 0.06, w * 0.95, h * 0.055, ink);
    portal(w * 0.28, h * 0.21, w * 0.45, h * 0.73, ink, paper);
    for (let i = 0; i < 6; i++) {
      rect(w * 0.075, h * (0.25 + i * 0.1), w * 0.11, h * 0.045, ink);
      rect(w * 0.83, h * (0.25 + i * 0.1), w * 0.09, h * 0.045, ink);
    }
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
  define('fan', 'Fan-vaulted assembly hall', 'chamber', ({ w, h, ink, paper, variant }) => {
    ctx.save();
    if (variant % 2) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    const ox = w * 0.07, oy = h * 0.79;
    const rx = w * 0.86, ry = Math.min(h * 0.73, w * 1.19);
    const point = (a, r = 1) => [ox + Math.cos(a) * rx * r, oy + Math.sin(a) * ry * r];
    path(() => {
      ctx.moveTo(ox, oy); ctx.lineTo(ox, oy - ry);
      ctx.ellipse(ox, oy, rx, ry, 0, -Math.PI / 2, 0);
      ctx.closePath();
    }, ink);
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + 0.055 + i * Math.PI / 14;
      path(() => {
        ctx.moveTo(...point(a + 0.055, 0.12));
        ctx.lineTo(...point(a, 0.86));
        ctx.quadraticCurveTo(...point(a + 0.072, 0.98), ...point(a + 0.143, 0.86));
        ctx.closePath();
      }, paper);
    }
    rect(w * 0.04, oy, w * 0.93, h * 0.042, ink);
    rect(w * 0.09, oy + h * 0.065, w * 0.79, h * 0.145, ink);
    for (let i = 0; i < 4; i++) sash(w * (0.125 + i * 0.18), oy + h * 0.085, w * 0.15, h * 0.1, paper, ink, 1);
    line(w * 0.04, h * 0.985, w * 0.97, h * 0.985, ink, Math.max(1, w * 0.018));
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
      for (let j = 0; j < 2; j++) sash(w * (0.13 + (right - 0.29) * j), h * t - ww, ww * 1.5, ww * 2.1, ink, paper, 1);
      if (i % 3 === variant % 3) ellipse(w * (right + 0.11), h * t, w * 0.025, w * 0.025, paper);
    }
  }, { narrow: false, hero: true });
  define('balconies', 'Inhabited galleries', 'chamber', ({ w, h, ink, paper, variant }) => {
    const rows = clamp(Math.round(h / w * 1.3), 1, 3), step = h / rows;
    for (let i = 0; i < rows; i++) {
      const x = (i + variant) % 2 ? w * 0.35 : w * 0.09;
      const floor = i * step + step * 0.78;
      portal(x, i * step + step * 0.12, w * 0.25, step * 0.54, ink, paper);
      rect(x - w * 0.035, floor - step * 0.12, w * 0.52, step * 0.12, paper);
      rail(x - w * 0.035, floor - step * 0.12, w * 0.52, step * 0.12, ink, 4);
      polygon([[x + w * 0.025, floor], [x + w * 0.15, floor], [x + w * 0.025, floor + step * 0.1]], ink);
      arch(x + w * 0.33, i * step + step * 0.22, w * 0.055, step * 0.2, ink);
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
  define('loggia', 'Deep colonnaded loggia', 'chamber', ({ w, h, ink, paper, variant }) => {
    const floor = h * 0.82, n = variant % 2 ? 3 : 4;
    rect(w * 0.055, h * 0.14, w * 0.89, h * 0.035, ink);
    for (let i = 0; i < n; i++) {
      const aw = w * 0.79 / n, x = w * 0.1 + i * aw;
      arch(x, h * 0.23, aw * 0.77, floor - h * 0.23, ink);
      arch(x + aw * 0.2, h * 0.3, aw * 0.5, floor - h * 0.3, paper);
      rect(x + aw * 0.42, h * 0.42, aw * 0.28, floor - h * 0.42, ink);
    }
    rect(w * 0.05, floor, w * 0.9, h * 0.045, ink);
    rail(w * 0.08, floor - h * 0.12, w * 0.84, h * 0.12, ink, n * 2);
    line(w * 0.1, h * 0.94, w * 0.91, h * 0.94, ink, Math.max(0.8, w * 0.012));
  }, { narrow: false });

  define('recess-hall', 'Hall with an inner stair', 'chamber', ({ w, h, ink, paper, variant }) => {
    ctx.save(); if (variant % 2) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    arch(w * 0.08, h * 0.08, w * 0.82, h * 0.83, ink);
    arch(w * 0.16, h * 0.15, w * 0.67, h * 0.76, paper);
    polygon([[w * 0.16,h * 0.33],[w * 0.25,h * 0.41],[w * 0.25,h * 0.91],[w * 0.16,h * 0.91]], ink);
    const floor = h * 0.63;
    portal(w * 0.6, h * 0.3, w * 0.15, floor - h * 0.3, ink, paper);
    rect(w * 0.53, floor, w * 0.3, h * 0.032, ink);
    stairRun(w * 0.24, floor, w * 0.34, h * 0.28, ink, paper, 7);
    rail(w * 0.53, floor - h * 0.075, w * 0.28, h * 0.075, ink, 3);
    rect(w * 0.045, h * 0.91, w * 0.89, h * 0.035, ink);
    line(w * 0.1, h * 0.98, w * 0.91, h * 0.98, ink, Math.max(0.8, w * 0.012));
    ctx.restore();
  }, { narrow: false });

  define('roof-court', 'Setback roof court', 'chamber', ({ w, h, ink, paper, variant }) => {
    ctx.save(); if (variant % 2) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    rect(w * 0.05, h * 0.06, w * 0.39, h * 0.63, ink);
    portal(w * 0.14, h * 0.33, w * 0.2, h * 0.36, paper, ink);
    rect(w * 0.035, h * 0.045, w * 0.43, h * 0.028, ink);
    arch(w * 0.21, h * 0.15, w * 0.065, h * 0.12, paper);
    rect(w * 0.045, h * 0.72, w * 0.91, h * 0.045, ink);
    rail(w * 0.44, h * 0.62, w * 0.5, h * 0.1, ink, 5);
    polygon([[w * 0.44,h * 0.765],[w * 0.94,h * 0.765],[w * 0.44,h * 0.94]], ink);
    ctx.restore();
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
    ellipse(w * 0.47, h * 0.44, Math.min(w * 0.51,h * 0.32), h * 0.32, ink);
    ctx.save(); path(() => ctx.rect(w * 0.47, 0, w, h)); ctx.clip();
    ellipse(w * 0.47, h * 0.44, Math.min(w * 0.49,h * 0.31), h * 0.31, paper);
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

  define('roof-terrace', 'Roof terrace and stair house', 'crown', ({ w, h, ink, paper, variant }) => {
    const houseX = variant % 2 ? w * 0.51 : w * 0.12;
    rect(houseX, h * 0.27, w * 0.32, h * 0.6, ink);
    rect(houseX - w * 0.035, h * 0.23, w * 0.39, h * 0.04, ink);
    portal(houseX + w * 0.06, h * 0.49, w * 0.17, h * 0.38, paper, ink);
    rect(houseX + w * 0.06, h * 0.05, w * 0.055, h * 0.18, ink);
    rect(houseX + w * 0.04, h * 0.035, w * 0.095, h * 0.025, ink);
    rect(w * 0.015, h * 0.89, w * 0.97, h * 0.065, ink);
    rail(w * 0.045, h * 0.76, w * 0.91, h * 0.13, ink, 8);
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

  // Tokyo's character comes from occupied floors, exposed circulation and the
  // working roofscape. Sign faces are deliberately wordless.
  function boxDoor(x, y, w, h, ink, paper) {
    rect(x, y, w, h, ink);
    rect(x + w * 0.12, y + h * 0.06, w * 0.7, h * 0.94, paper);
    rect(x + w * 0.23, y + h * 0.12, w * 0.59, h * 0.88, ink);
    rect(x + w * 0.31, y + h * 0.22, w * 0.42, h * 0.35, paper);
    rect(x + w * 0.68, y + h * 0.64, w * 0.035, h * 0.075, paper);
  }
  // Frames, infill and hardware use separate weights. Detail counts follow
  // their rendered size, so a narrow bay does not become a gray mesh.
  function sash(x, y, w, h, ink, paper, panes = 2, variant = 0) {
    const frame = Math.min(w, h) * 0.055, pw = (w - frame * 2) / panes;
    rect(x, y, w, h, ink);
    rect(x + frame, y + frame, w - frame * 2, h - frame * 2, paper);
    for (let i = 0; i < panes; i++) {
      const px = x + frame + i * pw, mode = (variant + i) % 4;
      rect(px + frame * 0.55, y + frame * 1.7, pw - frame, h - frame * 3.4, ink);
      if (mode !== 3) {
        const curtain = mode === 1 ? 0.64 : mode === 2 ? 0.36 : 0.88;
        rect(px + frame * 1.25, y + frame * 2.4, Math.max(0, pw - frame * 2.4), (h - frame * 4.8) * curtain, paper);
        if (w > 36 && h > 16 && mode === 1) {
          for (let j = 1; j < 4; j++) line(px + pw * j / 4, y + frame * 2.4, px + pw * j / 4, y + h * 0.56, ink, Math.min(0.65, w * 0.005));
        }
      }
    }
    // Two sliding tracks and a projecting sill, not a single outline.
    line(x, y + h * 0.91, x + w, y + h * 0.91, paper, Math.min(0.9, h * 0.024));
    rect(x - w * 0.025, y + h, w * 1.05, h * 0.035, ink);
  }
  function condenser(x, y, w, h, ink, paper) {
    // Keep the fan circular and the case proportioned, even in a shallow slot.
    const cw = Math.min(w, h * 1.65), ch = Math.min(h * 0.88, cw * 0.64);
    const equipmentHeight = ch * 1.13;
    y += h - equipmentHeight;
    h = equipmentHeight;
    const cx = x + cw * 0.37, cy = y + ch * 0.49, r = ch * 0.36;
    rect(x, y, cw, ch, ink);
    rect(x + cw * 0.035, y + ch * 0.055, cw * 0.93, ch * 0.87, paper);
    ellipse(cx, cy, r, r, ink);
    if (cw > 10) {
      const bars = clamp(Math.floor(r * 1.5), 4, 11);
      for (let i = 1; i < bars; i++) {
        const dx = r * (i * 2 / bars - 1), dy = Math.sqrt(Math.max(0, r * r - dx * dx));
        line(cx + dx, cy - dy, cx + dx, cy + dy, paper, Math.min(0.65, cw * 0.014));
      }
      for (const f of [-0.45, 0.45]) line(cx - r * 0.88, cy + r * f, cx + r * 0.88, cy + r * f, paper, Math.min(0.65, cw * 0.014));
      ellipse(cx, cy, r * 0.13, r * 0.13, paper);
    }
    line(x + cw * 0.77, y + ch * 0.17, x + cw * 0.77, y + ch * 0.79, ink, cw * 0.012);
    rect(x + cw * 0.81, y + ch * 0.18, cw * 0.095, ch * 0.05, ink);
    for (const f of [0.13, 0.77]) {
      rect(x + cw * f, y + ch, cw * 0.055, h - ch, ink);
      rect(x + cw * (f - 0.04), y + h * 0.97, cw * 0.15, h * 0.03, ink);
    }
    line(x + cw * 0.94, y + ch * 0.74, x + cw, y + h * 0.94, ink, cw * 0.022);
    return [x + cw, y + h * 0.94]; // Actual service outlet after fitting the case.
  }
  function conduit(points, ink, paper, weight) {
    const route = () => points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    path(route, null, ink, weight);
    if (weight > 2.4) path(route, null, paper, weight * 0.34);
  }
  function louvers(x, y, w, h, ink, paper, vertical = false) {
    rect(x, y, w, h, ink);
    const n = clamp(Math.floor((vertical ? w : h) / 3.5), 3, 18);
    for (let i = 1; i < n; i++) {
      if (vertical) rect(x + w * i / n, y + h * 0.05, w / n * 0.28, h * 0.9, paper);
      else rect(x + w * 0.04, y + h * i / n, w * 0.92, h / n * 0.28, paper);
    }
  }
  function signBox(x, y, w, h, ink, paper, divisions = 1) {
    rect(x, y, w, h, ink);
    rect(x + w * 0.09, y + h * 0.035, w * 0.72, h * 0.93, paper);
    for (let i = 1; i < divisions; i++) rect(x, y + h * i / divisions, w * 0.84, h * 0.025, ink);
  }
  // Architectural ink studies. Coordinates share a 100-unit facade width;
  // isotropic scaling keeps railings, circular fans and line weights consistent.
  // Paper is the sunlit wall; black describes a recess, return or underside.
  function inkLine(x,y,xx,yy,weight=0.42,color=BLACK) { line(x,y,xx,yy,color,weight); }
  function inkFace(points,fill=WHITE,weight=0.5) {
    path(()=>{points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();},fill,BLACK,weight);
  }
  function inkRect(x,y,w,h,fill=WHITE,weight=0.45) {
    inkFace([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],fill,weight);
  }
  function wall(h) {
    rect(0,0,100,h,WHITE);
    rect(84,0,16,h,BLACK);
    inkLine(1,0,1,h,0.65); inkLine(84,0,84,h,0.7);
    // A fine return edge survives inside the dark party-wall gap.
    inkLine(96,0,96,h,0.3,WHITE);
  }
  function sill(x,y,w,depth=4,thickness=1.6) {
    inkFace([[x,y],[x+depth,y-depth*.42],[x+w+depth,y-depth*.42],[x+w,y]]);
    inkFace([[x,y],[x+w,y],[x+w,y+thickness],[x,y+thickness]]);
    polygon([[x+w,y],[x+w+depth,y-depth*.42],[x+w+depth,y+thickness+depth*.2],[x+w,y+thickness]],BLACK);
    polygon([[x,y+thickness],[x+w,y+thickness],[x+w-1.5,y+thickness+2.4],[x+3,y+thickness+2.4]],BLACK);
  }
  function inkRail(x,y,w,rh,depth=5,color=BLACK,posts=4) {
    const back=-depth*.42;
    for(const lift of [0,rh*.5,rh]) {
      inkLine(x,y-lift,x+w,y-lift,.5,color);
      inkLine(x+w,y-lift,x+w+depth,y+back-lift,.5,color);
    }
    for(let i=0;i<=posts;i++) inkLine(x+w*i/posts,y,x+w*i/posts,y-rh,.45,color);
    inkLine(x+w+depth,y+back,x+w+depth,y+back-rh,.45,color);
  }
  function inkWindow(x,y,w,h,variant=0,panes=2,hood=true) {
    if(h<=0 || w<=0) return;
    if(h<5 || w<6) { inkRect(x,y,w,h,BLACK,.3); return; }
    inkRect(x,y,w,h,BLACK,.55);
    // One fine metal frame, then an offset dark reveal and unequally lit panes.
    inkRect(x+1.1,y+1.1,w-2.2,h-2.2,WHITE,.32);
    const pw=(w-3.8)/panes;
    for(let i=0;i<panes;i++) {
      const px=x+1.9+i*pw, ph=h-3.8;
      rect(px,y+1.9,pw-.65,ph,BLACK);
      if((i+variant)%4!==0) {
        const light=(i+variant)%3===0?.48:.83;
        rect(px+.55,y+2.5,pw-1.7,Math.max(.2,ph*light-1),WHITE);
        if((i+variant)%3===1 && pw>8) for(let j=1;j<4;j++) inkLine(px+pw*j/4,y+2.6,px+pw*j/4,y+2.6+ph*light-1,.19);
      }
      if(i) inkLine(px-.45,y+1.3,px-.45,y+h-1.1,.55);
    }
    inkLine(x+.5,y+h-1,x+w-.5,y+h-1,.35,WHITE);
    sill(x-.8,y+h,w+1.6,1.3,.65);
    if(hood) {
      inkFace([[x-1.2,y-.8],[x+2,y-2.5],[x+w+2.5,y-2.5],[x+w+.5,y-.8]]);
      inkLine(x-1,y-.2,x+w+.8,y-.2,.8);
    }
  }
  function inkDoor(x,y,w,h,glass=false) {
    inkRect(x,y,w,h,BLACK);
    inkRect(x+1.3,y+1.2,w-2.6,h-1.2,WHITE,.3);
    if(glass) {
      rect(x+2.5,y+2.5,w-5,h*.62,BLACK);
      rect(x+3.1,y+3.1,(w-6)*.46,h*.52,WHITE);
      inkLine(x+w*.5,y+2.5,x+w*.5,y+h*.66,.4,WHITE);
    } else inkRect(x+w*.22,y+h*.12,w*.5,h*.23,BLACK,.3);
    inkLine(x+w-3,y+h*.58,x+w-3,y+h*.69,.8);
    inkLine(x,y+h,x+w,y+h,.8);
  }
  function inkAC(x,y,w,ground) {
    const hh=w*.64, foot=w*.08;
    // y is the available upper boundary; fit below it without stretching fans.
    const bodyHeight=Math.min(hh,Math.max(.5,ground-y-foot)), bodyWidth=bodyHeight/.64;
    const yy=ground-bodyHeight-foot, r=bodyHeight*.34, cx=x+bodyWidth*.36;
    inkFace([[x+bodyWidth,yy],[x+bodyWidth+1.7,yy-1],[x+bodyWidth+1.7,ground-foot-1],[x+bodyWidth,ground-foot]],BLACK);
    inkRect(x,yy,bodyWidth,bodyHeight);
    ellipse(cx,yy+bodyHeight*.49,r,r,WHITE,BLACK,.35);
    const n=clamp(Math.round(bodyWidth*.6),5,15);
    for(let i=1;i<n;i++) {
      const dx=r*(i*2/n-1),dy=Math.sqrt(Math.max(0,r*r-dx*dx));
      inkLine(cx+dx,yy+bodyHeight*.49-dy,cx+dx,yy+bodyHeight*.49+dy,.22);
    }
    inkLine(x+bodyWidth*.76,yy+1.3,x+bodyWidth*.76,ground-foot-1.3,.25);
    rect(x+bodyWidth*.82,yy+bodyHeight*.15,bodyWidth*.1,bodyHeight*.07,BLACK);
    for(const f of [.13,.76]) {inkRect(x+bodyWidth*f,ground-foot,bodyWidth*.07,foot);inkLine(x+bodyWidth*(f-.05),ground,x+bodyWidth*(f+.16),ground,.65);}
    return [x+bodyWidth+1.7,yy+bodyHeight*.77];
  }
  function inkPipe(points,weight=1.1) {
    conduit(points,BLACK,WHITE,weight);
    if(weight>1.6) path(()=>points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)),null,WHITE,weight*.46);
  }
  function inkVent(x,y,w,h) {
    inkRect(x,y,w,h);
    for(let i=1;i<=5;i++) inkLine(x+1,y+h*i/6,x+w-1,y+h*i/6,.4);
  }
  function inkSign(x,y,w,h) {
    inkFace([[x+w,y],[x+w+2,y-1],[x+w+2,y+h-1],[x+w,y+h]],BLACK);
    inkRect(x,y,w,h);
    inkLine(x+1,y+1,x+w-1,y+1,.22);
  }
  function inkBalcony(x,y,w,rh,variant=0) {
    const depth=6;
    // Black soffit/recess is continuous; the guard rail remains delicate.
    rect(x+depth,y-rh*2.85,w-depth,rh*2.85,BLACK);
    inkWindow(x+depth+4,y-rh*2.65,w*.57,rh*2.22,variant,2,false);
    if(w>45) inkAC(x+w*.74,y-rh*.8,w*.19,y-.4);
    sill(x,y,w,depth,2.3);
    inkRail(x,y-.4,w,rh,depth,BLACK,Math.max(3,Math.floor(w/15)));
    // On the dark recess the back guard catches white light.
    inkRail(x+depth+1,y-.5,w-depth-2,rh-1,0,WHITE,Math.max(3,Math.floor(w/15)));
  }
  function inkAntenna(x,deck,height) {
    inkLine(x,deck,x,deck-height,.65);
    inkLine(x,deck-height*.15,x-6,deck,.3);
    for(let i=0;i<3;i++) {
      const yy=deck-height*(.9-i*.13), span=11-i*1.4;
      inkLine(x-span,yy-2,x+span,yy+2,.42);
      for(let j=-2;j<=2;j++) inkLine(x+j*span/3-1.4,yy+j*.55-2,x+j*span/3+1.4,yy+j*.55+2,.32);
    }
  }
  function roofDeck(h) { sill(0,h-3,94,5,3); }
  function tokyo(id,name,role,draw,options={}) {
    define(id,name,role,(block)=>{
      const scale=block.w/100;
      ctx.save(); ctx.scale(scale,scale);
      let h=block.h/scale;
      if(role==='crown') {
        const limits={'water-tank':98,'sign-gantry':75,'plant-room':57,'antenna-roof':105,'tile-eaves':32,'duct-deck':76};
        const fitted=Math.min(h,limits[id]);
        ctx.translate(0,h-fitted); h=fitted;
      }
      if(role==='chamber'||role==='base') wall(h);
      draw({h,variant:block.variant||0});
      ctx.restore();
    },{collection:'tokyo',...options});
  }

  tokyo('shop-lobby','Glazed corner shop + recessed side entrance','base',({h,variant})=>{
    const y=h*.28, bottom=h-2;
    rect(8,y,67,bottom-y,BLACK);
    inkWindow(11,y+2,43,(bottom-y)*.77,variant,3,false);
    inkDoor(60,y+2,12,bottom-y-2,true);
    inkSign(10,h*.05,49,h*.13);
    sill(4,y-1,76,7,1.8);
    inkVent(67,h*.07,10,h*.08);
    inkLine(79,0,79,bottom,.75);
    inkRect(6,bottom,77,2);
    inkRect(7,bottom*.76,5,bottom*.16);
    inkLine(9,bottom*.8,9,bottom*.86,.3);
  });
  tokyo('roller-shop','Rolled steel shutter + dark alley doorway','base',({h})=>{
    const top=h*.25,bottom=h-2;
    inkRect(6,top,53,bottom-top,BLACK);
    inkRect(8,top+1.5,49,bottom-top-2);
    for(let y=top+3;y<bottom;y+=Math.max(1.5,h*.025)) inkLine(8,y,57,y,.3);
    inkLine(28,bottom-3,36,bottom-3,.7);
    rect(65,top,19,bottom-top,BLACK);
    inkDoor(69,top+3,12,bottom-top-3);
    inkSign(7,h*.04,51,h*.13);
    sill(3,top-2,79,5,1.5);
    inkPipe([[62,0],[62,h-2]],1.1);
    inkRect(3,bottom,81,2);
  });
  tokyo('tenant-entry','Shadowed tenant entrance + mail slots','base',({h})=>{
    rect(17,h*.18,48,h*.8,BLACK);
    inkFace([[17,h*.18],[24,h*.24],[24,h-2],[17,h-2]]);
    inkDoor(26,h*.27,31,h*.73-2,true);
    sill(12,h*.18,57,6,1.8);
    inkSign(27,h*.045,28,h*.085);
    for(let i=0;i<4;i++) {inkRect(69,h*(.34+i*.1),9,h*.075);inkLine(70,h*(.36+i*.1),76,h*(.36+i*.1),.45);}
    inkRect(8,h*.48,5,h*.13);rect(9,h*.5,3,h*.025,BLACK);
    inkRect(13,h-2,57,2);
  });
  tokyo('tenant-floors','Narrow tenant floors + blade signs','chamber',({h,variant})=>{
    const n=clamp(Math.round(h/43),1,7), fh=h/n;
    for(let i=0;i<n;i++) {
      const y=i*fh;
      inkWindow(10,y+fh*.19,48,fh*.42,i+variant,3);
      inkSign(11,y+fh*.7,44,Math.min(6,fh*.15));
      inkLine(72,y+fh*.19,84,y+fh*.19,.8);inkLine(72,y+fh*.59,84,y+fh*.59,.8);
      inkSign(76,y+fh*.12,11,fh*.55);
      inkLine(1,y+fh-.5,84,y+fh-.5,.28);
    }
    inkPipe([[66,0],[66,h]],.85);
  });
  function stairTowerLayout(w,h,variant) {
    const count=clamp(Math.round(h/w*1.5),2,5),top=h*.1,rise=h*.85/count;
    return Array.from({length:count},(_,i)=>({from:[w*((i+variant)%2?.16:.65),top+i*rise],to:[w*((i+variant)%2?.65:.16),top+(i+1)*rise]}));
  }
  tokyo('external-stair','Steel switchback stair in a deep side court','chamber',({h,variant})=>{
    const flights=stairTowerLayout(100,h,variant),rh=Math.min(9,(flights[0].to[1]-flights[0].from[1])*.2);
    rect(9,0,62,h,BLACK);
    for(const {from,to} of flights) {
      const [x,y]=from,dx=to[0]-x,dy=to[1]-y,n=clamp(Math.round(dy/3),7,18);
      const pts=[[x,y]];
      for(let j=0;j<n;j++) {pts.push([x+dx*(j+1)/n,y+dy*j/n],[x+dx*(j+1)/n,y+dy*(j+1)/n]);}
      pts.push([to[0],to[1]+1.2],[x,y+1.2]);
      inkFace(pts,WHITE,.35);
      inkLine(x,y-rh,to[0],to[1]-rh,.55,WHITE);
      for(let j=0;j<=6;j++) inkLine(x+dx*j/6,y+dy*j/6,x+dx*j/6,y+dy*j/6-rh,.4,WHITE);
    }
    for(const [x,y] of [flights[0].from,...flights.map(f=>f.to)]) {
      const left=x<40;
      if(!left) inkDoor(72,y-Math.min(25,h*.14),9,Math.min(25,h*.14));
      sill(left?9:63,y,left?10:21,3,1);
      inkRail(left?9:63,y,left?10:21,rh,3,WHITE,2);
    }
    inkLine(7,0,7,h,.8);inkLine(69,0,69,h,.7,WHITE);
  },{narrow:false,hero:true});
  tokyo('balcony-stack','Cantilevered balconies + fine steel guards','chamber',({h,variant})=>{
    const n=clamp(Math.round(h/48),1,6),fh=h/n;
    for(let i=0;i<n;i++) {
      const y=(i+1)*fh-5,rh=Math.min(11,fh*.22);
      inkBalcony(4,y,79,rh,i+variant);
      inkLine(74,i*fh,74,y-rh*2.85,.5);
    }
  });
  tokyo('service-wall','Sunlit plaster + small offset windows','chamber',({h,variant})=>{
    const n=clamp(Math.round(h/57),1,6),fh=h/n;
    inkPipe([[74,0],[74,h]],1.1);
    for(let i=0;i<n;i++) {
      const y=i*fh, wx=(i+variant)%2?36:12;
      inkWindow(wx,y+fh*.18,26,Math.min(19,fh*.32),variant+i,2);
      if(i%2===0) {
        const ground=y+fh*.8,port=inkAC(16,y+fh*.5,21,ground);
        inkPipe([port,[48,port[1]],[51,ground+2],[74,ground+2]],.8);
        inkVent(57,y+fh*.17,9,6);
      }
      inkLine(1,y+fh-.5,72,y+fh-.5,.23);
      inkLine(72,y+fh*.54,76,y+fh*.54,.7);
    }
  });
  tokyo('setback-rooms','Roof terrace + staggered apartment volumes','chamber',({h,variant})=>{
    const deck=h*.55;
    rect(1,0,83,deck,WHITE);
    inkFace([[12,0],[57,0],[57,deck],[12,deck]]);
    polygon([[57,0],[67,0],[67,deck],[57,deck]],BLACK);
    inkWindow(23,deck*.2,24,Math.min(22,deck*.36),variant,2);
    const port=inkAC(67,deck*.65,13,deck-1);
    inkPipe([port,[82,port[1]],[82,deck]],.65);
    sill(5,deck,79,6,2);
    inkRail(62,deck,21,Math.min(10,deck*.23),5,BLACK,2);
    inkWindow(14,deck+(h-deck)*.3,43,Math.min(23,(h-deck)*.4),variant+1,3);
    inkPipe([[74,deck+3],[74,h]],.9);
  },{narrow:false});
  tokyo('water-tank','Sunlit rooftop tank + anchored steel frame','crown',({h})=>{
    const deck=h-3,top=h*.19,bottom=h*.62,tx=25,tw=43;
    for(const x of [29,64]) {inkLine(x,bottom,x,deck,1.25);inkLine(x-3,deck,x+3,deck,.8);}
    inkLine(29,bottom+3,64,deck,.6);inkLine(64,bottom+3,29,deck,.6);
    inkFace([[tx,top],[tx+tw,top],[tx+tw,bottom],[tx,bottom]]);
    polygon([[tx+tw-8,top],[tx+tw,top],[tx+tw,bottom],[tx+tw-8,bottom]],BLACK);
    ellipse(tx+tw/2,top,tw/2,Math.min(3,h*.035),WHITE,BLACK,.5);
    for(let i=1;i<4;i++) inkLine(tx,top+(bottom-top)*i/4,tx+tw-8,top+(bottom-top)*i/4,.25);
    for(const f of [.25,.5,.75]) inkLine(tx+tw*f,top+2,tx+tw*f,bottom,.25);
    inkRect(40,top-h*.075,12,h*.05);sill(38,top-h*.075,16,2,.8);
    for(const x of [15,21]) inkLine(x,top,x,deck,.65);
    for(let y=top+2;y<deck;y+=Math.max(3,h*.065)) inkLine(15,y,21,y,.5);
    inkPipe([[68,bottom-4],[78,bottom-4],[81,bottom-1],[81,deck]],1.3);
    roofDeck(h);
  });
  tokyo('sign-gantry','Rooftop billboard + exposed rear bracing','crown',({h})=>{
    const bottom=h*.66;
    for(const x of [19,73]) inkLine(x,bottom,x,h-3,1.2);
    inkLine(19,bottom,73,h-3,.55);inkLine(73,bottom,19,h-3,.55);
    inkSign(8,h*.12,75,bottom-h*.12);
    for(const x of [16,41,69]) {inkLine(x,h*.12,x+3,h*.03,.5);inkRect(x+1,h*.025,5,1.5,BLACK);}
    inkLine(12,bottom-2,80,bottom-2,.3);
    roofDeck(h);
  },{narrow:false});
  tokyo('plant-room','White roof house + maintenance landing','crown',({h})=>{
    const deck=h-3,top=h*.23;
    inkFace([[44,top],[80,top],[80,deck],[44,deck]]);
    polygon([[80,top],[90,top-4],[90,deck],[80,deck]],BLACK);
    sill(42,top,40,7,1.3);
    inkDoor(54,top+(deck-top)*.24,17,(deck-top)*.76);
    inkAC(10,deck-Math.min(20,h*.35),25,deck);
    inkRail(3,deck,35,Math.min(10,h*.22),4,BLACK,3);
    roofDeck(h);
  });
  tokyo('antenna-roof','Antenna, aerial cables + roof parapet','crown',({h})=>{
    const deck=h-3,house=h*.68;
    inkRect(10,house,45,deck-house);
    polygon([[55,house],[64,house-3],[64,deck],[55,deck]],BLACK);
    sill(8,house,49,5,1.3);
    inkAntenna(39,house,h*.62);
    inkWindow(18,house+4,19,Math.max(3,(deck-house)*.49),1,2,false);
    inkRail(66,deck,24,Math.min(10,h*.2),4,BLACK,3);
    roofDeck(h);
  });
  tokyo('noren-shop','Old timber shop + shallow tiled eave','base',({h,variant})=>{
    const top=h*.36,bottom=h-2;
    rect(7,top,69,bottom-top,BLACK);
    inkWindow(45,top+3,27,(bottom-top)*.56,variant,2,false);
    inkDoor(12,top+3,23,bottom-top-3,true);
    for(let i=0;i<3;i++) inkFace([[10+i*9,top],[18+i*9,top],[18+i*9,top+h*.18+(i%2)],[10+i*9,top+h*.17]]);
    inkFace([[3,top-2],[10,top-h*.12],[77,top-h*.12],[83,top-2]],BLACK);
    for(let i=0;i<3;i++) inkLine(5+i,top-2-i*h*.035,81-i,top-2-i*h*.035,.35,WHITE);
    for(let x=8;x<80;x+=5) inkLine(x,top-2,x+3,top-h*.12,.28,WHITE);
    inkSign(13,h*.055,50,h*.1);
    inkPipe([[80,0],[80,bottom]],1);
    inkRect(4,bottom,80,2);
  });
  tokyo('marquee-shop','Projecting shop canopy + shaded stair entry','base',({h})=>{
    const top=h*.42;
    inkRect(7,top,54,h-top-2);
    for(let y=top+2;y<h-2;y+=Math.max(1.8,h*.025)) inkLine(8,y,60,y,.28);
    rect(66,top,18,h-top,BLACK);
    for(let i=0;i<6;i++) inkLine(67,h-2-i*(h-top)*.08,81,h-2-i*(h-top)*.08,.45,WHITE);
    inkFace([[2,h*.16],[9,h*.1],[64,h*.1],[59,h*.16]]);
    inkSign(2,h*.16,57,h*.2);
    for(let i=0;i<3;i++) inkLine(3,h*(.19+i*.055),58,h*(.19+i*.055),.28);
    polygon([[2,h*.36],[59,h*.36],[65,h*.31],[65,h*.43],[8,h*.45]],BLACK);
    inkSign(71,h*.06,13,h*.27);
    inkRect(2,h-2,82,2);
  },{narrow:false});
  tokyo('porthole-bays','Concrete circular openings + recessed glazing','chamber',({h,variant})=>{
    const n=clamp(Math.round(h/43),1,6),fh=h/n,r=Math.min(11,fh*.28);
    for(let i=0;i<n;i++) {
      const cy=(i+.46)*fh;
      for(let j=0;j<2;j++) {
        const cx=24+j*37;
        ellipse(cx,cy,r,r,BLACK);
        ellipse(cx-.8,cy-.4,r-1.2,r-1.2,WHITE,BLACK,.3);
        ctx.save();ctx.beginPath();ctx.ellipse(cx-.8,cy-.4,r-1.4,r-1.4,0,0,TAU);ctx.clip();
        rect(cx-r,cy-r,r*2,r*((i+j+variant)%2?.7:1.15),BLACK);
        inkLine(cx,cy-r,cx,cy+r,.5);inkLine(cx-r,cy+r*.35,cx+r,cy+r*.35,.4);
        ctx.restore();
      }
      inkLine(1,(i+1)*fh-.5,84,(i+1)*fh-.5,.22);
    }
    inkPipe([[78,0],[78,h]],.75);
  },{narrow:false});
  tokyo('conduit-wall','Service conduits + connected meter cabinets','chamber',({h,variant})=>{
    inkWindow(10,h*.12,33,h*.19,variant,2);
    inkRect(53,h*.04,16,h*.07);
    const boxes=Array.from({length:3},(_,i)=>({x:8+i*15,y:h*(i===1?.43:.4),w:11,hh:h*.115}));
    // Draw complete routes before cabinets; no clearance masks can sever them.
    boxes.forEach((b,i)=>{
      const x=56+i*4,yy=h*(.65+i*.035),mx=b.x+b.w*.6,bottom=b.y+b.hh;
      inkPipe([[x,h*.11],[x,h*.48],[x+3,h*.5],[x+3,yy-2],[x+1,yy],[mx+2,yy],[mx,yy-2],[mx,bottom]],.85);
      inkRect(b.x,b.y,b.w,b.hh);
      inkLine(b.x+b.w-2,b.y+b.hh*.4,b.x+b.w-2,b.y+b.hh*.62,.6);
      inkRect(mx-1,bottom,2,1.4,BLACK);
    });
    for(const y of [.18,.48,.79]) inkVent(72,h*y,9,h*.055);
    const ground=h*.92,port=inkAC(12,h*.78,27,ground);
    inkPipe([port,[49,port[1]],[52,h*.93],[71,h*.93]],1.3);
    inkRect(71,h*.9,10,h*.06);
    // Sparse material seams stay subordinate to utility routing.
    for(const f of [.35,.76,.98]) inkLine(1,h*f,83,h*f,.18);
  },{narrow:false});
  tokyo('louver-front','Alley galleries + shuttered window bays','chamber',({h,variant})=>{
    const n=clamp(Math.round(h/57),1,5),fh=h/n;
    for(let i=0;i<n;i++) {
      const y=i*fh,ground=y+fh*.28;
      rect(6,y,76,fh*.32,BLACK);
      inkAC(12,y+1,22,ground);inkAC(48,y+1,25,ground);
      for(let x=9;x<81;x+=5) inkLine(x,y,x,ground+1,.3,WHITE);
      sill(4,ground+2,80,5,1.5);
      for(let j=0;j<3;j++) {
        const x=8+j*25,yy=y+fh*.43,hh=fh*.48;
        if((i+j+variant)%3===0) inkWindow(x,yy,21,hh,variant,2,false);
        else {inkRect(x,yy,21,hh,BLACK);for(let k=1;k<11;k++) inkLine(x+1,yy+hh*k/11,x+20,yy+hh*k/11,.42,WHITE);inkLine(x+10.5,yy,x+10.5,yy+hh,.6,WHITE);}
      }
      inkLine(1,y+fh-1,84,y+fh-1,.25);
    }
  },{narrow:false});
  tokyo('glass-ribs','Glazed passage + exposed straight steel ribs','chamber',({h})=>{
    rect(8,0,69,h,BLACK);
    const cols=5,rows=clamp(Math.round(h/18),2,16),rh=h/rows;
    for(let i=0;i<cols;i++) for(let j=0;j<rows;j++) {
      const x=11+i*12.7,y=j*rh+1;
      inkRect(x,y,11,rh-2,WHITE,.28);
      if((i+j)%4===0) rect(x,y,11,rh*.52,BLACK);
      else {rect(x,y,1.3,rh-2,BLACK);inkLine(x,y+rh*.72,x+11,y+rh*.72,.25);}
    }
    for(const x of [8,33.4,58.8,77]) {inkLine(x,0,x,h,1.1);inkLine(x+1,0,x+1,h,.3,WHITE);}
    const deck=h*.69;
    sill(5,deck,78,5,2.2);inkRail(7,deck,74,Math.min(10,h*.11),4,BLACK,7);
  },{narrow:false});
  tokyo('tile-eaves','Low tiled roof + timber gable','crown',({h})=>{
    const base=h-3,peak=Math.max(2,h*.3);
    inkFace([[7,base],[48,peak+4],[87,base]]);
    for(const x of [30,48,66]) inkLine(x,base,x,peak+Math.abs(x-48)*.65+4,.65);
    const roof=[[0,base-2],[12,base-5],[48,peak],[82,base-6],[98,base-2],[96,base+1],[81,base-2],[48,peak+4],[13,base-1],[1,base+1]];
    inkFace(roof,BLACK);
    for(let i=1;i<4;i++) {
      const y=peak+(base-peak)*i/4;
      inkLine(48-(48*i/4),y,48,y-2,.28,WHITE);inkLine(48,y-2,48+(47*i/4),y,.28,WHITE);
    }
    inkLine(46,peak-2,50,peak-2,1.7);
    roofDeck(h);
  });
  tokyo('commercial-front','Stacked glazed tenants + slim sign tower','chamber',({h,variant})=>{
    const n=clamp(Math.round(h/39),2,7),fh=h/n;
    for(let i=0;i<n;i++) {
      const y=i*fh;
      rect(7,y+fh*.13,62,fh*.56,BLACK);
      inkWindow(9,y+fh*.17,56,fh*.44,i+variant,4,false);
      inkSign(8,y+fh*.73,59,fh*.15);
      sill(3,y+fh-.9,76,5,1);
    }
    inkSign(74,h*.05,14,h*.89);
    for(let i=1;i<n+1;i++) inkLine(74,h*.05+h*.89*i/(n+1),88,h*.05+h*.89*i/(n+1),.4);
    for(let i=0;i<n;i++) inkLine(69,(i+.5)*fh,74,(i+.5)*fh,.75);
  },{narrow:false,hero:true});
  tokyo('stepped-terraces','Staggered terraces + slender balcony returns','chamber',({h,variant})=>{
    const n=clamp(Math.round(h/48),2,5),fh=h/n;
    for(let i=0;i<n;i++) {
      const x=26-i*20/(n-1),y=(i+1)*fh-4,rh=Math.min(10,fh*.2);
      inkBalcony(x,y,83-x,rh,i+variant);
      if(i>0) inkRail(x,i*fh-4,20/(n-1),rh,3,BLACK,1);
      inkLine(x+5,i*fh,x+5,y-rh*2.85,.4);
    }
  },{narrow:false,hero:true});
  tokyo('duct-deck','Rooftop ventilation + steel service platform','crown',({h})=>{
    const deck=h-3,box=h*.64;
    inkRect(17,box,62,deck-box);
    polygon([[79,box],[87,box-3],[87,deck],[79,deck]],BLACK);
    inkVent(23,box+3,24,Math.max(3,deck-box-6));
    inkRect(54,box+3,18,Math.max(3,deck-box-6));
    for(let i=0;i<3;i++) {
      const x=25+i*20,top=h*(.15+i*.1);
      inkRect(x,top,5,box-top);
      rect(x+3.5,top,1.5,box-top,BLACK);
      inkFace([[x-2,top],[x+5,top],[x+5,top+3],[x-2,top+3]]);
      rect(x-2,top+.6,2,1.7,BLACK);
      for(let y=top+6;y<box;y+=8) inkLine(x-.5,y,x+5.5,y,.4);
    }
    for(const x of [7,12]) inkLine(x,h*.52,x,deck,.5);
    for(let y=h*.55;y<deck;y+=Math.max(3,h*.07)) inkLine(7,y,12,y,.4);
    inkRail(3,deck,89,Math.min(10,h*.2),4,BLACK,8);
    roofDeck(h);
  },{narrow:false});

  const library = Object.fromEntries(blocks.map(block => [block.id, block]));
  // Review numbers stay stable across revisions; 20 (crane) is retired.
  const catalogSlots = ['shop-lobby','roller-shop','tenant-entry','tenant-floors',
    'external-stair','balcony-stack','service-wall','setback-rooms','water-tank',
    'sign-gantry','plant-room','antenna-roof','noren-shop','marquee-shop',
    'porthole-bays','conduit-wall','louver-front','glass-ribs','tile-eaves',null,
    'commercial-front','stepped-terraces','duct-deck'];
  for (const block of blocks) {
    block.catalogOnly = block.collection !== 'tokyo';
    block.catalogNumber = catalogSlots.indexOf(block.id) + 1;
  }
  const family = role => blocks.filter(block => block.role === role && !block.catalogOnly);

  function compose(w, h, value) {
    const random = randomFactory(value);
    const count = clamp(Math.round(w / h * 7), 5, 16);
    const widths = Array.from({ length: count }, (_, i) => (i % 3 === 1 ? pick(random, [0.36, 0.44, 0.55]) : pick(random, [0.85, 1.2, 1.7])));
    const total = widths.reduce((a, b) => a + b, 0), margin = Math.min(w, h) * 0.009;
    let x = margin;
    const baseLine = h - margin;
    const broad = widths.map((v, i) => v > 0.7 ? i : -1).filter(i => i >= 0);
    const facadePosition = Math.floor(broad.length / 2);
    const featureBlocks = new Map([
      [broad[facadePosition], 'commercial-front'],
      [broad[broad.length > 3 ? 1 : 0], 'external-stair'],
      [broad[broad.length > 3 ? broad.length - 2 : broad.length - 1], 'stepped-terraces']
    ]);
    let previousCrown = '', previousBase = '';
    const crownUsage = new Map();
    const towers = widths.map((ratio, index) => {
      const bw = (w - 2 * margin) * ratio / total;
      const top = h * (featureBlocks.get(index) === 'commercial-front' ? 0.19 : 0.17 + random() * 0.24);
      const baseTop = baseLine - h * (0.10 + random() * 0.045);
      const paper = WHITE, ink = BLACK;
      const narrow = ratio < 0.7;
      let crownOptions = family('crown').filter(b => (!narrow || b.narrow) && b.id !== previousCrown);
      const leastUsed = Math.min(...crownOptions.map(b => crownUsage.get(b.id) || 0));
      crownOptions = crownOptions.filter(b => (crownUsage.get(b.id) || 0) === leastUsed);
      const tower = { x, w: bw, top, baseTop, baseLine, paper, ink, index, modules: [],
        base: pick(random, family('base').filter(b => b.id !== previousBase && (!narrow || b.narrow))).id,
        crown: pick(random, crownOptions).id,
        crownTop: Math.max(h * 0.015, top - h * (0.075 + random() * 0.16)), variant: Math.floor(random() * 12),
        profile: 'straight',
        lean: (random() < 0.5 ? -1 : 1) * bw * 0.075 };
      if (featureBlocks.get(index) === 'commercial-front') tower.profile = 'straight';
      previousCrown = tower.crown; previousBase = tower.base;
      crownUsage.set(tower.crown,(crownUsage.get(tower.crown)||0)+1);
      const crownRatio = tower.crown === 'plant-room' ? 0.65 : tower.crown === 'duct-deck' ? 0.72 : 1.25;
      tower.crownTop = Math.max(h * 0.018, top - Math.min(top - tower.crownTop, bw * crownRatio, tower.crown === 'plant-room' ? h * 0.1 : h * 0.18));
      x += bw;
      const available = baseTop - top;
      const hero = featureBlocks.has(index);
      let ids;
      if (hero) {
        ids = [pick(random, ['tenant-floors', 'setback-rooms', 'porthole-bays', 'glass-ribs']), featureBlocks.get(index), pick(random, ['tenant-floors', 'balcony-stack', 'louver-front', 'conduit-wall'])];
      } else if (narrow) {
        ids = ['service-wall', 'tenant-floors', 'service-wall'];
      } else {
        ids = pick(random, [
          ['tenant-floors', 'balcony-stack', 'tenant-floors'],
          ['setback-rooms', 'external-stair', 'tenant-floors'],
          ['balcony-stack', 'service-wall', 'setback-rooms'],
          ['porthole-bays', 'porthole-bays', 'louver-front'],
          ['glass-ribs', 'tenant-floors', 'conduit-wall'],
          ['balcony-stack', 'balcony-stack', 'conduit-wall']
        ]);
      }
      const fractions = ids.map(id => library[id].hero ? 2.3 : 0.85 + random() * 0.5);
      const facadeAt = ids.indexOf('commercial-front');
      const facadeHeight = facadeAt < 0 ? 0 : Math.min(available * 0.54, bw * 1.5);
      const sum = fractions.reduce((a, b, i) => a + (i === facadeAt ? 0 : b), 0);
      let y = top;
      ids.forEach((id, i) => {
        const hh = i === ids.length - 1 ? baseTop - y : i === facadeAt ? facadeHeight : (available - facadeHeight) * fractions[i] / sum;
        tower.modules.push({ id, x: tower.x, y, w: bw, h: hh, paper, ink, variant: Math.floor(random() * 12) });
        y += hh;
      });
      return tower;
    });
    // The city is assembled from whole facade blocks. No secondary room is
    // overlaid across them: circulation belongs to its own stair/balcony block.
    return { towers, connectors: [], seed: value };
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
      l = [0.17, 0.17, 0.0, 0.0][i] + offset * (1 - i / 4);
      r = [0.88, 1.0, 1.0, 1.0][i] + offset * (1 - i / 4);
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
    const inset = 0;
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
      if (tower.paper === WHITE) { towerOutline(tower); ctx.strokeStyle = BLACK; ctx.lineWidth = Math.max(0.45, Math.min(0.85, w / 1800)); ctx.stroke(); }
    }
    for (const tower of layout.towers) drawBlock({ id: tower.crown, x: tower.x, y: tower.crownTop, w: tower.w, h: tower.top - tower.crownTop, ink: BLACK, paper: WHITE, variant: tower.variant }, false);
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
    const selected = params.get('all') === 'true' ? blocks : blocks.filter(block => !block.catalogOnly);
    selected.sort((a, b) => (a.catalogNumber || 1000) - (b.catalogNumber || 1000));
    const examples = [...selected, { id: 'city-example', name: 'Composed city', role: 'composition' }];
    document.getElementById('debug-count').textContent = `${selected.length} blocks · street entrances, occupied floors, working rooftops`;
    const previews = examples.map((block, index) => {
      const figure = document.createElement('figure'); figure.className = 'debug-specimen'; figure.id = `block-${block.catalogNumber || block.id}`;
      const preview = document.createElement('canvas'); preview.className = 'debug-specimen-canvas';
      preview.setAttribute('role', 'img'); preview.setAttribute('aria-label', block.name);
      const caption = document.createElement('figcaption'); caption.className = 'debug-caption';
      const number = document.createElement('span'); number.className = 'debug-number'; number.textContent = block.catalogNumber ? String(block.catalogNumber).padStart(2, '0') : block.role === 'composition' ? '—' : `A${String(index - catalogSlots.filter(Boolean).length + 1).padStart(2, '0')}`;
      const label = document.createElement('span');
      const name = document.createElement('span'); name.className = 'debug-name'; name.textContent = block.name;
      const group = document.createElement('span'); group.className = 'debug-group'; group.textContent = `${block.role} · ${block.id}${block.catalogOnly ? ' · study' : ''}`;
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
