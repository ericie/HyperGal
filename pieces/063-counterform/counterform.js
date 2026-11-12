(() => {
  'use strict';

  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const maskCtx = mask.getContext('2d');
  const reverse = document.createElement('canvas');
  const reverseCtx = reverse.getContext('2d');
  const paper = '#f3efda';
  const ink = '#650b79';
  const tau = Math.PI * 2;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width, height, unit, band, ratio;
  let time = 0;
  let last = null;
  let frame = 0;
  let paused = motion.matches;

  // Normalized centers, radius, phase, elongation and an optional inner opening.
  const bodies = [
    [.08, .10, .23, .5, 1.25, 0],
    [.49, .15, .15, 2.1, .85, .42],
    [.94, .18, .29, 4.2, 1.16, .48],
    [.29, .46, .28, 1.8, 1.12, 0],
    [.73, .50, .23, 5.3, .83, .40],
    [.02, .78, .18, 3.4, 1.25, 0],
    [.50, .88, .30, .8, 1.05, .46],
    [.98, .94, .17, 2.7, .86, 0]
  ];
  const count = 128;
  const smooth = (a, b, x) => {
    const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };

  function roundedOutline(vertices) {
    const points = [];
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const a = vertices[(i + n - 1) % n];
      const b = vertices[i];
      const c = vertices[(i + 1) % n];
      const d = vertices[(i + 2) % n];
      for (let step = 0; step < 12; step++) {
        const t = step / 12;
        points.push([0, 1].map(axis => .5 * (
          2 * b[axis] + (-a[axis] + c[axis]) * t
          + (2 * a[axis] - 5 * b[axis] + 4 * c[axis] - d[axis]) * t * t
          + (-a[axis] + 3 * b[axis] - 3 * c[axis] + d[axis]) * t * t * t
        )));
      }
    }
    return points;
  }

  // Sample each silhouette along the same rays so morphs never twist or jump.
  function radialOutline(points) {
    return Array.from({length: count}, (_, i) => {
      const angle = i / count * tau;
      const dx = Math.sin(angle), dy = -Math.cos(angle);
      let radius = Infinity;
      for (let j = 0; j < points.length; j++) {
        const [px, py] = points[j];
        const q = points[(j + 1) % points.length];
        const ex = q[0] - px, ey = q[1] - py;
        const cross = dx * ey - dy * ex;
        if (Math.abs(cross) < 1e-9) continue;
        const distance = (px * ey - py * ex) / cross;
        const along = (px * dy - py * dx) / cross;
        if (distance > 0 && along >= 0 && along <= 1) radius = Math.min(radius, distance);
      }
      return Number.isFinite(radius) ? radius : 1;
    });
  }

  const heart = Array.from({length: 256}, (_, i) => {
    const a = i / 256 * tau;
    return [Math.sin(a) ** 3,
      -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16 - .10];
  });
  const silhouettes = [
    radialOutline(heart),
    radialOutline(roundedOutline([
      [0, -.64], [.39, -.65], [.83, -1.02], [.86, -.36],
      [.98, .05], [.82, .56], [.43, .81], [0, .86],
      [-.43, .81], [-.82, .56], [-.98, .05], [-.86, -.36],
      [-.83, -1.02], [-.39, -.65]
    ])),
    radialOutline(roundedOutline([
      [0, -1], [.55, -.89], [.89, -.54], [.96, -.04],
      [.83, .34], [.56, .47], [.48, .87], [.20, .94],
      [0, .89], [-.20, .94], [-.48, .87], [-.56, .47],
      [-.83, .34], [-.96, -.04], [-.89, -.54], [-.55, -.89]
    ]))
  ];

  function morphState(t, index) {
    const cycle = (t + index * 7 + 3) / 46;
    const part = cycle - Math.floor(cycle);
    return {
      kind: (Math.floor(cycle) + index) % silhouettes.length,
      blend: .97 * smooth(.20, .39, part) * (1 - smooth(.51, .73, part))
    };
  }

  function stripes(target, inverted) {
    target.fillStyle = inverted ? ink : paper;
    target.fillRect(0, 0, width, height);
    target.fillStyle = inverted ? paper : ink;
    // Center a purple band, keeping stripe edges on backing-store pixel boundaries.
    const start = Math.round((width / 2 - band / 2) * ratio) / ratio;
    for (let x = start - Math.ceil(width / band) * band; x < width; x += band * 2) {
      target.fillRect(x, 0, band, height);
    }
  }

  function contour(path, x, y, r, phase, stretch, rotation, t, blend = 0, kind = 0) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const angle = i / count * tau;
      const blob = 1
        + .18 * Math.sin(3 * angle + phase + t * .22)
        + .10 * Math.cos(2 * angle - phase + t * .17)
        + .045 * Math.sin(5 * angle + phase * 2 - t * .12);
      const radial = blob * (1 - blend) + silhouettes[kind][i] * blend;
      const px = Math.sin(angle) * r * radial * stretch;
      const py = -Math.cos(angle) * r * radial / stretch;
      points.push([
        x + px * Math.cos(rotation) - py * Math.sin(rotation),
        y + px * Math.sin(rotation) + py * Math.cos(rotation)
      ]);
    }
    // Midpoint quadratic segments make a smooth closed contour without a seam.
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const start = mid(points[count - 1], points[0]);
    path.moveTo(...start);
    for (let i = 0; i < count; i++) {
      const next = mid(points[i], points[(i + 1) % count]);
      path.quadraticCurveTo(...points[i], ...next);
    }
    path.closePath();
  }

  function draw() {
    maskCtx.clearRect(0, 0, width, height);
    maskCtx.globalCompositeOperation = 'xor';
    maskCtx.fillStyle = '#fff';
    bodies.forEach(([nx, ny, size, phase, elongation, opening], index) => {
      const {kind, blend} = morphState(time, index);
      const initial = Math.acos(2 * ny - 1) * (index % 2 ? -1 : 1);
      const circulation = time * tau / (100 + index * 7) + initial;
      const x = nx * width + Math.sin(time * .085 + phase) * unit * .10
        + Math.sin(circulation * 2 + phase) * unit * .045;
      const y = height * .5 + Math.cos(circulation) * (height * .5 + unit * .04);
      const r = size * unit * (1 + .07 * Math.sin(time * .19 + phase));
      const speed = Math.abs(Math.sin(circulation));
      const stretch = 1 + ((elongation - 1) * .4 - speed * .13
        + Math.sin(time * .15 + phase) * .10) * (1 - blend * .8);
      const rotation = Math.sin(time * .075 + phase) * .32 * (1 - blend * .85);
      const path = new Path2D();
      contour(path, x, y, r, phase, stretch, rotation, time, blend, kind);
      // Ring openings dissolve as the skull's two sockets and nasal opening emerge.
      const skull = kind === 2 ? smooth(.05, .90, blend) : 0;
      const hollow = opening * (1 - skull);
      if (hollow > .005) {
        contour(path, x, y - r * .025, r * hollow,
          phase + 1.2, stretch, rotation, time, blend, kind);
      }
      if (skull > .001) {
        const feature = (dx, dy, rx, ry, angle) => {
          const fx = x + r * (dx * Math.cos(rotation) - dy * Math.sin(rotation));
          const fy = y + r * (dx * Math.sin(rotation) + dy * Math.cos(rotation));
          path.moveTo(fx + rx * r * skull * Math.cos(angle), fy + rx * r * skull * Math.sin(angle));
          path.ellipse(fx, fy, rx * r * skull, ry * r * skull, angle, 0, tau);
          path.closePath();
        };
        feature(-.34, -.08, .235, .255, rotation + .16);
        feature(.34, -.08, .235, .255, rotation - .16);
        feature(0, .35, .095, .13, rotation);
      }
      maskCtx.fill(path, 'evenodd');
    });

    reverseCtx.globalCompositeOperation = 'source-over';
    stripes(reverseCtx, true);
    reverseCtx.globalCompositeOperation = 'destination-in';
    reverseCtx.drawImage(mask, 0, 0, width, height);
    stripes(ctx, false);
    ctx.drawImage(reverse, 0, 0, width, height);
  }

  function resize() {
    width = innerWidth;
    height = innerHeight;
    ratio = Math.min(devicePixelRatio || 1, 2);
    unit = Math.min(width, height);
    band = Math.max(12, Math.round(unit / 17 * ratio)) / ratio;
    for (const surface of [canvas, mask, reverse]) {
      surface.width = Math.round(width * ratio);
      surface.height = Math.round(height * ratio);
      surface.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    draw();
  }

  function tick(now) {
    frame = 0;
    if (paused || document.hidden) return;
    if (last !== null) time += Math.min((now - last) / 1000, .1);
    last = now;
    draw();
    frame = requestAnimationFrame(tick);
  }

  function schedule() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = null;
    if (!paused && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function toggle() {
    paused = !paused;
    schedule();
  }

  function save() {
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'counterform.png';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  canvas.addEventListener('click', toggle);
  addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      toggle();
    } else if (event.code === 'KeyS') save();
  });
  motion.addEventListener('change', () => {
    paused = motion.matches;
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  addEventListener('resize', resize);
  resize();
  schedule();
})();
