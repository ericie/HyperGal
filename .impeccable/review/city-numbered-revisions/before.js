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
  function tokyo(id, name, role, draw, options = {}) {
    define(id, name, role, draw, { collection: 'tokyo', ...options });
  }

  tokyo('shop-lobby', 'Shopfront + upstairs entrance', 'base', ({ w, h, ink, paper }) => {
    rect(0, 0, w, h, paper);
    rect(w * 0.025, h * 0.1, w * 0.95, h * 0.075, ink);
    signBox(w * 0.07, h * 0.02, w * 0.56, h * 0.13, ink, paper);
    rect(w * 0.07, h * 0.27, w * 0.56, h * 0.68, ink);
    sash(w * 0.1, h * 0.31, w * 0.33, h * 0.56, paper, ink, 2);
    boxDoor(w * 0.45, h * 0.31, w * 0.14, h * 0.64, paper, ink);
    boxDoor(w * 0.73, h * 0.31, w * 0.19, h * 0.64, ink, paper);
    signBox(w * 0.75, h * 0.21, w * 0.15, h * 0.065, ink, paper);
    rect(w * 0.065, h * 0.96, w * 0.88, h * 0.04, ink);
  });
  tokyo('roller-shop', 'Roller shutter + side passage', 'base', ({ w, h, ink, paper, variant }) => {
    rect(0, 0, w, h, paper);
    rect(w * 0.04, h * 0.04, w * 0.88, h * 0.16, ink);
    rect(w * 0.08, h * 0.075, w * 0.53, h * 0.075, paper);
    rect(w * 0.07, h * 0.25, w * 0.57, h * 0.68, ink);
    louvers(w * 0.09, h * 0.28, w * 0.53, h * 0.62, ink, paper);
    rect(w * 0.73, h * 0.26, w * 0.22, h * 0.74, ink);
    boxDoor(w * 0.79, h * 0.39, w * 0.12, h * 0.53, paper, ink);
    for (let i = 0; i < 3; i++) rect(w * 0.735, h * (0.97 - i * 0.028), w * 0.21, h * 0.012, paper);
    if (variant % 2) rect(w * 0.68, h * 0.04, w * 0.025, h * 0.93, ink);
  });
  tokyo('basement-entry', 'Basement stair + tenant directory', 'base', ({ w, h, ink, paper }) => {
    rect(0, 0, w, h, paper);
    rect(w * 0.08, h * 0.22, w * 0.6, h * 0.78, ink);
    rect(w * 0.14, h * 0.28, w * 0.46, h * 0.68, paper);
    for (let i = 0; i < 7; i++) rect(w * (0.14 + i * 0.038), h * (0.92 - i * 0.08), w * (0.46 - i * 0.038), h * 0.04, ink);
    boxDoor(w * 0.41, h * 0.3, w * 0.15, h * 0.19, ink, paper);
    signBox(w * 0.76, h * 0.12, w * 0.17, h * 0.61, ink, paper, 5);
    polygon([[w * 0.045,h * 0.14],[w * 0.62,h * 0.14],[w * 0.7,h * 0.22],[w * 0.08,h * 0.22]], ink);
    rail(w * 0.1, h * 0.075, w * 0.56, h * 0.06, ink, 4);
  });

  tokyo('tenant-floors', 'Stacked businesses + projecting signs', 'chamber', ({ w, h, ink, paper, variant }) => {
    const n = clamp(Math.round(h / w * 1.6), 2, 5), fh = h / n;
    const mirror = variant % 2;
    ctx.save(); if (mirror) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    for (let i = 0; i < n; i++) {
      const y = fh * i, setback = i % 2 ? w * 0.055 : 0;
      rect(w * 0.055 + setback, y + fh * 0.08, w * 0.71 - setback, fh * 0.038, ink);
      sash(w * 0.07 + setback, y + fh * 0.2, w * 0.56 - setback, fh * 0.4, ink, paper, 2 + (i + variant) % 2, i + variant);
      if ((i + variant) % 3 === 0) rect(w * 0.08 + setback, y + fh * 0.43, w * 0.53 - setback, fh * 0.1, ink);
      signBox(w * 0.07 + setback, y + fh * 0.68, w * (i % 2 ? 0.37 : 0.56), fh * 0.15, ink, paper);
      rect(w * 0.71, y + fh * 0.3, w * 0.1, fh * 0.027, ink);
      rect(w * 0.71, y + fh * 0.64, w * 0.1, fh * 0.027, ink);
      signBox(w * 0.79, y + fh * 0.19, w * 0.16, fh * 0.57, ink, paper, i % 2 + 1);
      rect(w * 0.04, y + fh * 0.95, w * 0.7, fh * 0.05, ink);
    }
    ctx.restore();
  });
  tokyo('external-stair', 'Exposed switchback stair tower', 'chamber', ({ w, h, ink, paper, variant }) => {
    const n = clamp(Math.round(h / w * 1.5), 2, 5), fh = h / n;
    rect(w * 0.05, 0, w * 0.025, h, ink);
    rect(w * 0.68, 0, w * 0.025, h, ink);
    for (let i = 0; i < n; i++) {
      ctx.save(); ctx.translate(0, i * fh);
      const top = fh * 0.16, rise = fh * 0.72, x = w * 0.09, sw = w * 0.54;
      ctx.save();
      if ((i + variant) % 2) { ctx.translate(w * 0.72, 0); ctx.scale(-1, 1); }
      // Open steel flights have a diagonal underside; no solid zigzag ribbon.
      const steps = 9, points = [[x, top + rise]];
      for (let j = 0; j < steps; j++) {
        points.push([x + j * sw / steps, top + rise - (j + 1) * rise / steps]);
        points.push([x + (j + 1) * sw / steps, top + rise - (j + 1) * rise / steps]);
      }
      points.push([x + sw, top + fh * 0.075], [x, top + rise + fh * 0.075]);
      polygon(points, ink);
      line(x, top + rise - fh * 0.14, x + sw, top - fh * 0.14, ink, Math.max(0.8, w * 0.012));
      for (let j = 0; j <= 5; j++) line(x + j * sw / 5, top + rise * (1 - j / 5), x + j * sw / 5, top + rise * (1 - j / 5) - fh * 0.14, ink, Math.max(0.7, w * 0.009));
      ctx.restore();
      rect(w * 0.04, top + rise, w * 0.92, fh * 0.045, ink);
      boxDoor(w * 0.77, top + fh * 0.28, w * 0.16, fh * 0.44, ink, paper);
      rail(w * 0.7, top + rise - fh * 0.13, w * 0.25, fh * 0.13, ink, 3);
      ctx.restore();
    }
  }, { narrow: false, hero: true });
  tokyo('balcony-stack', 'Recessed balconies + sliding screens', 'chamber', ({ w, h, ink, paper, variant }) => {
    const n = clamp(Math.round(h / w * 1.5), 2, 5), fh = h / n;
    rect(w * 0.035, 0, w * 0.045, h, ink);
    rect(w * 0.93, 0, w * 0.035, h, ink);
    for (let i = 0; i < n; i++) {
      const y = fh * i, flip = (i + variant) % 2;
      rect(w * 0.085, y + fh * 0.05, w * 0.84, fh * 0.79, ink);
      sash(w * (flip ? 0.33 : 0.13), y + fh * 0.12, w * 0.48, fh * 0.52, paper, ink, 3, i + variant);
      condenser(w * (flip ? 0.13 : 0.69), y + fh * 0.46, w * 0.18, fh * 0.24, paper, ink);
      rect(w * 0.1, y + fh * 0.72, w * 0.81, fh * 0.09, paper);
      rect(w * 0.085, y + fh * 0.87, w * 0.84, fh * 0.075, ink);
      // The fine upper rail sits above broad, alternating privacy panels.
      const posts = clamp(Math.floor(w / 8), 4, 14);
      for (let j = 0; j <= posts; j++) rect(w * (0.1 + 0.81 * j / posts), y + fh * 0.55, w * 0.008, fh * 0.25, paper);
      for (const f of [0.55, 0.6, 0.65]) rect(w * 0.1, y + fh * f, w * 0.81, fh * 0.012, paper);
      rect(w * (flip ? 0.58 : 0.11), y + fh * 0.65, w * 0.31, fh * 0.15, paper);
      rect(w * 0.91, y + fh * 0.1, w * 0.012, fh * 0.7, paper);
    }
  });
  tokyo('service-wall', 'Quiet wall + offset windows and pipework', 'chamber', ({ w, h, ink, paper, variant }) => {
    const rows = clamp(Math.round(h / w * 1.2), 2, 5), fh = h / rows;
    conduit([[w * 0.79,0],[w * 0.79,h * 0.88],[w * 0.73,h * 0.92],[w * 0.13,h * 0.92]], ink, paper, w * 0.027);
    for (let i = 0; i < rows; i++) {
      const y = i * fh, offset = (i + variant) % 2;
      const wx = w * (offset ? 0.38 : 0.13);
      sash(wx, y + fh * 0.15, w * 0.28, fh * 0.3, ink, paper, 2, i + variant);
      if (offset) {
        louvers(w * 0.14, y + fh * 0.08, w * 0.12, fh * 0.13, ink, paper);
        condenser(w * 0.35, y + fh * 0.55, w * 0.3, Math.min(fh * 0.27, w * 0.21), ink, paper);
        conduit([[w * 0.63,y + fh * 0.68],[w * 0.69,y + fh * 0.68],[w * 0.73,y + fh * 0.74],[w * 0.79,y + fh * 0.74]], ink, paper, w * 0.014);
      } else if (w > 26) {
        for (let j = 0; j < 5; j++) line(wx + w * (0.02 + j * 0.06), y + fh * 0.14, wx + w * (0.02 + j * 0.06), y + fh * 0.48, ink, w * 0.009);
      }
      line(w * 0.07, y + fh * 0.96, w * 0.69, y + fh * 0.96, ink, Math.min(0.7, w * 0.007));
      rect(w * 0.765, y + fh * 0.38, w * 0.05, fh * 0.012, ink);
    }
  });
  tokyo('setback-rooms', 'Setback tenants + roof landing', 'chamber', ({ w, h, ink, paper, variant }) => {
    ctx.save(); if (variant % 2) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    rect(w * 0.07, h * 0.06, w * 0.47, h * 0.49, ink);
    sash(w * 0.14, h * 0.14, w * 0.32, h * 0.17, paper, ink, 2);
    boxDoor(w * 0.34, h * 0.35, w * 0.13, h * 0.2, paper, ink);
    rect(w * 0.07, h * 0.6, w * 0.84, h * 0.045, ink);
    rail(w * 0.54, h * 0.5, w * 0.35, h * 0.1, ink, 4);
    condenser(w * 0.65, h * 0.34, w * 0.19, h * 0.11, ink, paper);
    rect(w * 0.1, h * 0.68, w * 0.77, h * 0.29, ink);
    sash(w * 0.18, h * 0.74, w * 0.58, h * 0.15, paper, ink, 3);
    ctx.restore();
  }, { narrow: false });

  tokyo('water-tank', 'Elevated rooftop water tank', 'crown', ({ w, h, ink, paper, variant }) => {
    const tx = w * (variant % 2 ? 0.35 : 0.18), tw = w * 0.49;
    const cap = Math.min(h * 0.055, tw * 0.15);
    rect(tx, h * 0.15, tw, h * 0.4, ink);
    ellipse(tx + tw / 2, h * 0.15, tw / 2, cap, ink);
    ellipse(tx + tw / 2, h * 0.55, tw / 2, cap, ink);
    line(tx + tw * 0.12, h * 0.21, tx + tw * 0.12, h * 0.46, paper, Math.max(1, tw * 0.025));
    rect(tx + tw * 0.38, h * 0.06, tw * 0.24, h * 0.07, ink);
    for (const f of [0.12, 0.88]) line(tx + tw * f, h * 0.53, tx + tw * f, h * 0.9, ink, Math.max(1.2, w * 0.022));
    line(tx + tw * 0.12, h * 0.56, tx + tw * 0.88, h * 0.88, ink, Math.max(0.9, w * 0.012));
    line(tx + tw * 0.88, h * 0.56, tx + tw * 0.12, h * 0.88, ink, Math.max(0.9, w * 0.012));
    rect(w * 0.04, h * 0.92, w * 0.92, h * 0.045, ink);
    rail(w * 0.05, h * 0.8, w * 0.21, h * 0.12, ink, 3);
    line(tx + tw, h * 0.4, w * 0.92, h * 0.4, ink, Math.max(1, w * 0.022));
    line(w * 0.92, h * 0.4, w * 0.92, h, ink, Math.max(1, w * 0.022));
  });
  tokyo('sign-gantry', 'Billboard face + steel gantry', 'crown', ({ w, h, ink, paper, variant }) => {
    const bx = w * 0.06, bw = w * 0.88, by = h * 0.07, bh = h * 0.58;
    signBox(bx, by, bw, bh, ink, paper);
    if (variant % 2) {
      rect(bx + bw * 0.09, by + bh * 0.68, bw * 0.72, bh * 0.14, ink);
      rect(bx + bw * 0.12, by + bh * 0.72, bw * 0.58, bh * 0.05, paper);
    }
    for (const f of [0.18, 0.82]) line(w * f, h * 0.64, w * f, h * 0.94, ink, Math.max(1.2, w * 0.025));
    line(w * 0.18, h * 0.65, w * 0.82, h * 0.92, ink, Math.max(0.9, w * 0.013));
    line(w * 0.82, h * 0.65, w * 0.18, h * 0.92, ink, Math.max(0.9, w * 0.013));
    rect(w * 0.025, h * 0.94, w * 0.95, h * 0.045, ink);
  }, { narrow: false });
  tokyo('plant-room', 'Lift overrun + rooftop equipment', 'crown', ({ w, h, ink, paper, variant }) => {
    const x = variant % 2 ? w * 0.08 : w * 0.5;
    rect(x, h * 0.2, w * 0.39, h * 0.7, ink);
    boxDoor(x + w * 0.075, h * 0.51, w * 0.19, h * 0.39, paper, ink);
    rect(x - w * 0.025, h * 0.16, w * 0.44, h * 0.04, ink);
    const cx = variant % 2 ? w * 0.61 : w * 0.08;
    condenser(cx, h * 0.65, w * 0.26, h * 0.2, ink, paper);
    rect(w * 0.04, h * 0.92, w * 0.92, h * 0.05, ink);
    rail(w * 0.04, h * 0.8, w * 0.92, h * 0.12, ink, 7);
  });
  tokyo('antenna-roof', 'Antenna mast + maintenance roof', 'crown', ({ w, h, ink, paper }) => {
    rect(w * 0.12, h * 0.67, w * 0.53, h * 0.27, ink);
    sash(w * 0.2, h * 0.73, w * 0.24, h * 0.12, paper, ink, 2);
    line(w * 0.58, h * 0.035, w * 0.58, h * 0.68, ink, Math.max(1, w * 0.018));
    line(w * 0.25, h * 0.14, w * 0.87, h * 0.28, ink, Math.max(0.9, w * 0.012));
    for (let i = 0; i < 4; i++) line(w * (0.34 + i * 0.13), h * (0.12 + i * 0.03), w * (0.3 + i * 0.13), h * (0.23 + i * 0.03), ink, Math.max(0.8, w * 0.011));
    line(w * 0.58, h * 0.45, w * 0.28, h * 0.67, ink, Math.max(0.7, w * 0.01));
    rect(w * 0.04, h * 0.94, w * 0.92, h * 0.035, ink);
    rail(w * 0.7, h * 0.76, w * 0.24, h * 0.17, ink, 3);
  });

  // Photo studies: each facade gets a construction system of its own.
  tokyo('noren-shop', 'Old shop + noren and tiled canopy', 'base', ({ w, h, ink, paper, variant }) => {
    rect(0, 0, w, h, paper);
    rect(w * 0.05, h * 0.08, w * 0.88, h * 0.12, ink);
    rect(w * 0.08, h * 0.1, w * 0.7, h * 0.055, paper);
    for (let i = 0; i < 3; i++) rect(w * 0.06, h * (0.25 + i * 0.055), w * 0.87, h * 0.025, ink);
    const tiles = clamp(Math.floor(w / 7), 5, 17);
    for (let i = 0; i < tiles; i++) ellipse(w * (0.08 + i * 0.83 / tiles), h * 0.39, w * 0.018, Math.min(w * 0.018, h * 0.018), ink);
    rect(w * 0.08, h * 0.43, w * 0.44, h * 0.55, ink);
    boxDoor(w * 0.3, h * 0.48, w * 0.19, h * 0.48, paper, ink);
    for (let i = 0; i < 3; i++) rect(w * (0.1 + i * 0.13), h * 0.45, w * 0.115, h * (0.19 + (i % 2) * 0.04), paper);
    sash(w * 0.59, h * 0.47, w * 0.3, h * 0.29, ink, paper, 2, variant);
    // Window notices are blank slips with different proportions.
    rect(w * 0.61, h * 0.54, w * 0.06, h * 0.11, paper);
    rect(w * 0.77, h * 0.61, w * 0.07, h * 0.09, paper);
    for (let i = 0; i < 3; i++) line(w * 0.57, h * (0.82 + i * 0.055), w * 0.91, h * (0.82 + i * 0.055), ink, h * 0.006);
    conduit([[w * 0.96,h * 0.11],[w * 0.96,h * 0.87],[w * 0.9,h * 0.93]], ink, paper, w * 0.017);
    rect(w * 0.05, h * 0.98, w * 0.91, h * 0.02, ink);
  });
  tokyo('marquee-shop', 'Stepped marquee + shutter and side stair', 'base', ({ w, h, ink, paper }) => {
    rect(0, 0, w, h, paper);
    rect(w * 0.035, h * 0.11, w * 0.73, h * 0.32, ink);
    for (let i = 0; i < 4; i++) rect(w * 0.055, h * (0.15 + i * 0.071), w * 0.69, h * 0.012, paper);
    rect(w * 0.15, h * 0.17, w * 0.49, h * 0.19, paper);
    rect(w * 0.17, h * 0.19, w * 0.45, h * 0.15, ink);
    louvers(w * 0.09, h * 0.47, w * 0.61, h * 0.48, ink, paper);
    rect(w * 0.77, h * 0.45, w * 0.18, h * 0.53, ink);
    for (let i = 0; i < 5; i++) rect(w * 0.79, h * (0.74 + i * 0.047), w * 0.14, h * 0.012, paper);
    signBox(w * 0.8, h * 0.04, w * 0.14, h * 0.32, ink, paper, 2);
    // A little menu case belongs to the side entrance.
    rect(w * 0.67, h * 0.76, w * 0.11, h * 0.2, paper);
    sash(w * 0.68, h * 0.78, w * 0.09, h * 0.12, ink, paper, 1);
    rect(w * 0.04, h * 0.97, w * 0.91, h * 0.03, ink);
  }, { narrow: false });

  tokyo('porthole-bays', 'Paired round bays + open stair landings', 'chamber', ({ w, h, ink, paper, variant }) => {
    const n = clamp(Math.round(h / w * 1.5), 2, 5), fh = h / n;
    rect(w * 0.07, h * 0.02, w * 0.7, h * 0.96, ink);
    const r = Math.min(w * 0.115, fh * 0.34);
    for (let i = 0; i < n; i++) {
      const cy = (i + 0.49) * fh;
      for (let j = 0; j < 2; j++) {
        const cx = w * (0.25 + j * 0.33);
        ellipse(cx, cy, r, r, paper);
        ellipse(cx, cy, r * 0.89, r * 0.89, ink);
        ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.83, r * 0.83, 0, 0, TAU); ctx.clip();
        if (j === 0) {
          // A circular opening cut through an exterior stairwell.
          polygon([[cx-r,cy+r],[cx+r,cy-r*0.5],[cx+r,cy-r*0.25],[cx-r,cy+r*1.25]], paper);
          line(cx-r,cy-r*0.17,cx+r,cy-r*0.17,paper,r*0.06);
          for (let k = -2; k <= 2; k++) line(cx + k*r*0.38,cy-r*0.17,cx+k*r*0.38,cy+r,paper,r*0.035);
        } else {
          rect(cx-r,cy-r,r*2,r*(1.1+(i+variant)%2*0.4),paper);
          for (let k = -2; k <= 2; k++) line(cx+k*r*0.33,cy-r,cx+k*r*0.33,cy+r,ink,r*0.025);
          line(cx,cy-r,cx,cy+r,ink,r*0.07);
        }
        ctx.restore();
      }
      sash(w * 0.81, cy - fh * 0.24, w * 0.13, fh * 0.44, ink, paper, 1, i);
      line(w * 0.79, (i + 0.95) * fh, w * 0.96, (i + 0.95) * fh, ink, w * 0.007);
    }
  }, { narrow: false });
  tokyo('conduit-wall', 'Tiled service wall + meter boxes and routed conduits', 'chamber', ({ w, h, ink, paper, variant }) => {
    // Large panel joints give the pipe routes a quiet architectural field.
    const cols = clamp(Math.floor(w / 18), 3, 8), rows = clamp(Math.floor(h / 20), 3, 10);
    const fine = Math.min(0.65, w * 0.005);
    for (let i = 0; i <= cols; i++) line(w*(0.07+i*0.86/cols),h*0.02,w*(0.07+i*0.86/cols),h*0.97,ink,fine);
    for (let i = 0; i <= rows; i++) line(w*0.07,h*(0.02+i*0.95/rows),w*0.93,h*(0.02+i*0.95/rows),ink,fine);
    // Clear pads behind equipment stop joints showing through the cases.
    rect(w*0.13,h*0.13,w*0.38,h*0.25,paper);
    sash(w*0.15,h*0.15,w*0.32,h*0.2,ink,paper,2,variant);
    for (let i=0;i<3;i++) {
      const px=w*(0.56+i*0.045), yy=h*(0.66+i*0.035);
      conduit([[px,0],[px,h*0.43],[px+w*0.035,h*0.47],[px+w*0.035,yy-h*0.025],[px+w*0.005,yy],[w*(0.2+i*0.13),yy],[w*(0.17+i*0.13),yy-h*0.035],[w*(0.17+i*0.13),h*0.52]],ink,paper,w*0.012);
    }
    for(let i=0;i<3;i++) {
      const x=w*(0.105+i*0.13), y=h*(i===1?0.43:0.4);
      rect(x-w*0.015,y-h*0.015,w*0.13,h*0.15,paper);
      rect(x,y,w*0.1,h*0.12,ink);
      rect(x+w*0.009,y+h*0.007,w*0.079,h*0.104,paper);
      rect(x+w*0.071,y+h*0.054,w*0.009,h*0.025,ink);
    }
    for (const y of [0.17,0.47,0.81]) {
      rect(w*0.76,h*(y-0.015),w*0.17,h*0.105,paper);
      louvers(w*0.775,h*y,w*0.14,h*0.075,ink,paper);
    }
    rect(w*0.13,h*0.78,w*0.37,h*0.18,paper);
    condenser(w*0.16,h*0.79,w*0.3,Math.min(h*0.17,w*0.2),ink,paper);
    conduit([[w*0.47,h*0.85],[w*0.53,h*0.85],[w*0.57,h*0.89],[w*0.91,h*0.89]],ink,paper,w*0.019);
  }, { narrow: false });
  tokyo('louver-front', 'Alley shutters + clustered air conditioners', 'chamber', ({ w, h, ink, paper, variant }) => {
    const rows = clamp(Math.round(h / w * 1.4), 1, 4), fh = h / rows;
    for (let i=0;i<rows;i++) {
      const y=i*fh;
      rect(w*0.05,y+fh*0.04,w*0.9,fh*0.35,ink);
      louvers(w*0.07,y+fh*0.055,w*0.86,fh*0.28,paper,ink,true);
      condenser(w*0.1,y+fh*0.13,w*0.24,Math.min(fh*0.23,w*0.16),paper,ink);
      condenser(w*0.57,y+fh*0.11,w*0.29,Math.min(fh*0.26,w*0.2),paper,ink);
      line(w*0.09,y+fh*0.37,w*0.91,y+fh*0.37,paper,fh*0.012);
      rect(w*0.045,y+fh*0.42,w*0.91,fh*0.085,ink);
      rect(w*0.065,y+fh*0.43,w*0.86,fh*0.012,paper);
      for(let j=0;j<3;j++) {
        const x=w*(0.08+j*0.29), closed=(i+j+variant)%3!==0;
        if(closed) louvers(x,y+fh*0.54,w*0.255,fh*0.4,ink,paper);
        else sash(x,y+fh*0.54,w*0.255,fh*0.4,ink,paper,2,variant);
      }
      conduit([[w*0.965,y+fh*0.03],[w*0.965,y+fh*0.81],[w*0.92,y+fh*0.87]],ink,paper,w*0.014);
      rect(w*0.055,y+fh*0.97,w*0.88,fh*0.025,ink);
    }
  }, { narrow: false });
  tokyo('glass-ribs', 'Glazed atrium + structural ribs', 'chamber', ({ w, h, ink, paper }) => {
    rect(w*0.06,h*0.035,w*0.88,h*0.93,ink);
    rect(w*0.1,h*0.06,w*0.8,h*0.88,paper);
    const cols=clamp(Math.floor(w/15),4,9), rows=clamp(Math.floor(h/23),3,12);
    for(let i=1;i<cols;i++) line(w*(0.1+i*0.8/cols),h*0.06,w*(0.1+i*0.8/cols),h*0.94,ink,w*0.009);
    for(let i=1;i<rows;i++) line(w*0.1,h*(0.06+i*0.88/rows),w*0.9,h*(0.06+i*0.88/rows),ink,h*0.006);
    for(let i=0;i<3;i++) {
      const x=w*(0.16+i*0.28);
      path(()=>{ctx.moveTo(x,h*0.94);ctx.bezierCurveTo(x+w*0.18,h*0.68,x+w*0.18,h*0.34,x,h*0.06);},null,ink,w*0.035);
    }
    // One occupied gallery interrupts the continuous glazing.
    rect(w*0.08,h*0.66,w*0.84,h*0.038,ink);
    rail(w*0.12,h*0.57,w*0.76,h*0.09,ink,9);
  }, { narrow: false });

  tokyo('tile-eaves', 'Layered tile roof + geometric ridge crest', 'crown', ({ w, h, ink, paper }) => {
    const roofHeight = Math.min(h, w * 0.72);
    ctx.translate(0, h - roofHeight);
    h = roofHeight;
    const roof = (offset, color) => path(()=>{
      ctx.moveTo(w*0.04,h*(0.79+offset));
      ctx.bezierCurveTo(w*0.22,h*(0.75+offset),w*0.37,h*(0.35+offset),w*0.5,h*(0.16+offset));
      ctx.bezierCurveTo(w*0.63,h*(0.35+offset),w*0.78,h*(0.75+offset),w*0.96,h*(0.79+offset));
      ctx.lineTo(w*0.96,h*(0.84+offset));
      ctx.bezierCurveTo(w*0.78,h*(0.81+offset),w*0.63,h*(0.42+offset),w*0.5,h*(0.24+offset));
      ctx.bezierCurveTo(w*0.37,h*(0.42+offset),w*0.22,h*(0.81+offset),w*0.04,h*(0.84+offset));ctx.closePath();
    },color);
    polygon([[w*0.15,h*0.91],[w*0.5,h*0.35],[w*0.85,h*0.91]],ink);
    polygon([[w*0.28,h*0.85],[w*0.5,h*0.5],[w*0.72,h*0.85]],paper);
    roof(0,ink);roof(0.065,ink);roof(0.13,ink);
    ellipse(w*0.5,h*0.15,w*0.034,Math.min(w*0.034,h*0.047),ink);
    ellipse(w*0.5,h*0.15,w*0.016,Math.min(w*0.016,h*0.022),paper);
    rect(w*0.487,h*0.035,w*0.026,h*0.08,ink);
    rect(w*0.16,h*0.94,w*0.68,h*0.035,ink);
  }, { narrow: false });
  tokyo('crane-roof', 'Construction crane + braced mast and cab', 'crown', ({ w, h, ink, paper }) => {
    const weight=w*0.018;
    for(const x of [0.42,0.57]) line(w*x,h*0.29,w*x,h*0.96,ink,weight);
    for(let i=0;i<4;i++) {
      const y=h*(0.3+i*0.16);
      line(w*0.42,y,w*0.57,y+h*0.16,ink,weight*0.6);
      line(w*0.57,y,w*0.42,y+h*0.16,ink,weight*0.6);
    }
    polygon([[w*0.08,h*0.27],[w*0.85,h*0.035],[w*0.91,h*0.09],[w*0.13,h*0.33]],ink);
    for(let i=1;i<8;i++) polygon([[w*(0.1+i*0.095),h*(0.277-i*0.029)],[w*(0.168+i*0.095),h*(0.257-i*0.029)],[w*(0.151+i*0.095),h*(0.307-i*0.029)]],paper);
    rect(w*0.23,h*0.33,w*0.54,h*0.16,ink);
    sash(w*0.57,h*0.345,w*0.18,h*0.115,paper,ink,2);
    rail(w*0.28,h*0.55,w*0.43,h*0.08,ink,5);
    rect(w*0.27,h*0.64,w*0.45,h*0.025,ink);
    line(w*0.85,h*0.12,w*0.85,h*0.75,ink,weight*0.5);
    path(()=>{ctx.moveTo(w*0.85,h*0.75);ctx.lineTo(w*0.85,h*0.79);ctx.lineTo(w*0.82,h*0.81);ctx.lineTo(w*0.8,h*0.78);},null,ink,weight);
    rect(w*0.15,h*0.96,w*0.7,h*0.035,ink);
  }, { narrow: false });

  const library = Object.fromEntries(blocks.map(block => [block.id, block]));
  // Keep the earlier vocabulary inspectable without mixing it into the city.
  const retained = new Set(['fan', 'swell', 'striped-orb']);
  for (const block of blocks) block.catalogOnly = block.collection !== 'tokyo' && !retained.has(block.id);
  const family = role => blocks.filter(block => block.role === role && !block.catalogOnly);

  function compose(w, h, value) {
    const random = randomFactory(value);
    const count = clamp(Math.round(w / h * 7), 5, 16);
    const widths = Array.from({ length: count }, (_, i) => (i % 3 === 1 ? pick(random, [0.36, 0.44, 0.55]) : pick(random, [0.85, 1.2, 1.7])));
    const total = widths.reduce((a, b) => a + b, 0), margin = Math.min(w, h) * 0.009;
    let x = margin;
    const baseLine = h - margin;
    const broad = widths.map((v, i) => v > 0.7 ? i : -1).filter(i => i >= 0);
    const fanPosition = Math.floor(broad.length / 2);
    const featureBlocks = new Map([
      [broad[fanPosition], 'fan'],
      [broad[broad.length > 3 ? 1 : 0], 'external-stair'],
      [broad[broad.length > 3 ? broad.length - 2 : broad.length - 1], 'swell']
    ]);
    let previousCrown = '', previousBase = '', orbCount = 0;
    const crownUsage = new Map();
    const towers = widths.map((ratio, index) => {
      const bw = (w - 2 * margin) * ratio / total;
      const top = h * (featureBlocks.get(index) === 'fan' ? 0.19 : 0.17 + random() * 0.24);
      const baseTop = baseLine - h * (0.10 + random() * 0.045);
      const paper = [BLACK, WHITE, WHITE, BLACK, BLACK, WHITE][index % 6], ink = inverse(paper);
      const narrow = ratio < 0.7;
      let crownOptions = family('crown').filter(b => (!narrow || b.narrow) && b.id !== previousCrown && (b.id !== 'crane-roof' || !crownUsage.has(b.id)) &&
        (b.id !== 'striped-orb' || (orbCount < 1 && index > 0 && index < count - 1)) &&
        (!['half-moon','sail-pavilion'].includes(b.id) || (index > 0 && index < count - 1)));
      const leastUsed = Math.min(...crownOptions.map(b => crownUsage.get(b.id) || 0));
      crownOptions = crownOptions.filter(b => (crownUsage.get(b.id) || 0) === leastUsed);
      const tower = { x, w: bw, top, baseTop, baseLine, paper, ink, index, modules: [],
        base: pick(random, family('base').filter(b => b.id !== previousBase && (!narrow || b.narrow))).id,
        crown: pick(random, crownOptions).id,
        crownTop: Math.max(h * 0.015, top - h * (0.075 + random() * 0.16)), variant: Math.floor(random() * 12),
        profile: narrow ? 'straight' : featureBlocks.get(index) === 'swell' ? 'curve' : pick(random, ['terrace', 'straight', 'straight']),
        lean: (random() < 0.5 ? -1 : 1) * bw * 0.075 };
      if (featureBlocks.get(index) === 'fan') tower.profile = 'straight';
      previousCrown = tower.crown; previousBase = tower.base;
      crownUsage.set(tower.crown,(crownUsage.get(tower.crown)||0)+1);
      if (tower.crown === 'striped-orb') orbCount++;
      const crownRatio = tower.crown === 'plant-room' ? 0.65 : tower.crown === 'striped-orb' ? 0.96 : 1.25;
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
      const fanAt = ids.indexOf('fan');
      const fanHeight = fanAt < 0 ? 0 : Math.min(available * 0.54, bw * 1.5);
      const sum = fractions.reduce((a, b, i) => a + (i === fanAt ? 0 : b), 0);
      let y = top;
      ids.forEach((id, i) => {
        const hh = i === ids.length - 1 ? baseTop - y : i === fanAt ? fanHeight : (available - fanHeight) * fractions[i] / sum;
        tower.modules.push({ id, x: tower.x, y, w: bw, h: hh, paper, ink, variant: Math.floor(random() * 12) });
        y += hh;
      });
      return tower;
    });
    // Shared rooms are planned between buildings. The opening, landings and
    // walking route are one object, so a bridge cannot be pasted across a window.
    const courts = [];
    for (let i = 0; i < towers.length - 1; i += 3) {
      const a = towers[i], b = towers[i + 1];
      const left = a.x + a.w * 0.09, right = b.x + b.w * 0.94;
      const cw = right - left;
      let ch = Math.min(h * 0.22, cw * 0.72);
      const low = Math.min(a.baseTop, b.baseTop) - h * 0.035;
      let yy = low - ch - h * (i % 2 ? 0.075 : 0.005);
      const fan = [...a.modules, ...b.modules].find(m => m.id === 'fan');
      if (fan && yy < fan.y + fan.h && yy + ch > fan.y) {
        yy = fan.y + fan.h + h * 0.018;
        ch = Math.min(ch, low - yy);
      }
      if (ch < Math.min(h * 0.045, cw * 0.12)) continue;
      courts.push({ x: left, y: yy, w: cw, h: ch, leftTower: i, rightTower: i + 1,
        variant: Math.floor(random() * 2), ink: BLACK, paper: WHITE });
    }
    return { towers, courts, connectors: [], seed: value };
  }

  function drawCourt({ x, y, w, h, variant }) {
    ctx.save(); ctx.translate(x, y);
    if (variant % 2) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    // A shared service court: exposed stair, occupied landings and a roof walk.
    // The rectangular shaft replaces the previous monumental vaulted gallery.
    rect(-w * 0.012, -h * 0.035, w * 1.024, h * 1.07, WHITE);
    rect(0, h * 0.12, w, h * 0.91, BLACK);
    rect(w * 0.06, h * 0.22, w * 0.88, h * 0.82, WHITE);
    polygon([[w * 0.06,h * 0.22],[w * 0.14,h * 0.3],[w * 0.14,h * 1.03],[w * 0.06,h * 1.03]], BLACK);
    rail(w * 0.02, h * 0.005, w * 0.96, h * 0.105, BLACK, 10);
    rect(-w * 0.012, h * 0.12, w * 1.024, h * 0.035, BLACK);
    const upperFloor = h * 0.61, lowerFloor = h * 0.96;
    boxDoor(w * 0.72, h * 0.32, w * 0.15, upperFloor - h * 0.32, BLACK, WHITE);
    sash(w * 0.2, h * 0.32, w * 0.32, h * 0.19, BLACK, WHITE, 3);
    rect(w * 0.14, upperFloor, w * 0.75, h * 0.043, BLACK);
    rail(w * 0.15, upperFloor - h * 0.08, w * 0.48, h * 0.08, BLACK, 5);
    stairRun(w * 0.23, upperFloor + h * 0.043, w * 0.45, lowerFloor - upperFloor - h * 0.043, BLACK, WHITE, 8);
    boxDoor(w * 0.76, h * 0.75, w * 0.11, h * 0.21, BLACK, WHITE);
    rect(w * 0.1, lowerFloor, w * 0.84, h * 0.028, BLACK);
    condenser(w * 0.2, h * 0.73, w * 0.17, h * 0.1, BLACK, WHITE);
    rect(w * 0.9, h * 0.24, w * 0.014, h * 0.7, BLACK);
    rect(0, h * 1.025, w, h * 0.035, BLACK);
    ctx.restore();
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
    const inset = Math.min(tower.w * 0.045,(right-left)*0.05);
    return {...block, x:left+inset, w:Math.max(tower.w*0.25,right-left-inset*2)};
  }
  function drawCity(layout, w, h) {
    rect(0, 0, w, h, WHITE);
    for (const tower of layout.towers) {
      ctx.save(); towerOutline(tower);
      ctx.fillStyle = tower.paper; ctx.fill();
      ctx.clip();
      const shared = layout.courts.find(c => c.leftTower === tower.index || c.rightTower === tower.index);
      if (shared) {
        path(() => {
          ctx.rect(tower.x - tower.w, tower.top, tower.w * 3, Math.max(0, shared.y - tower.top - shared.h * 0.035));
          ctx.rect(tower.x - tower.w, shared.y + shared.h * 1.075, tower.w * 3, Math.max(0, tower.baseTop - shared.y - shared.h * 1.075));
        });
        ctx.clip();
      }
      for (const block of tower.modules) {
        rect(block.x, block.y, block.w, block.h, block.paper);
        drawBlock(contentBox(tower, block));
      }
      ctx.restore();
      if (tower.paper === WHITE) { towerOutline(tower); ctx.strokeStyle = BLACK; ctx.lineWidth = Math.max(1.1, Math.min(1.8, w / 900)); ctx.stroke(); }
    }
    for (const tower of layout.towers) drawBlock({ id: tower.crown, x: tower.x + tower.lean * 0.4, y: tower.crownTop, w: tower.w, h: tower.top - tower.crownTop, ink: BLACK, paper: WHITE, variant: tower.variant }, false);
    for (const block of layout.connectors) drawBlock(block);
    for (const court of layout.courts) drawCourt(court);
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
    selected.sort((a, b) => Number(b.collection === 'tokyo') - Number(a.collection === 'tokyo'));
    const examples = [...selected, { id: 'city-example', name: 'Composed city', role: 'composition' }];
    document.getElementById('debug-count').textContent = `${selected.length} blocks · street entrances, occupied floors, working rooftops`;
    const previews = examples.map((block, index) => {
      const figure = document.createElement('figure'); figure.className = 'debug-specimen';
      const preview = document.createElement('canvas'); preview.className = 'debug-specimen-canvas';
      preview.setAttribute('role', 'img'); preview.setAttribute('aria-label', block.name);
      const caption = document.createElement('figcaption'); caption.className = 'debug-caption';
      const number = document.createElement('span'); number.className = 'debug-number'; number.textContent = String(index + 1).padStart(2, '0');
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
