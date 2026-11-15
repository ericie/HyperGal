(() => {
  'use strict';

  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const maskCtx = mask.getContext('2d');
  const reverse = document.createElement('canvas');
  const reverseCtx = reverse.getContext('2d');
  const tau = Math.PI * 2;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width, height, unit, band, ratio;
  let time = 0;
  let last = null;
  let frame = 0;
  let paused = motion.matches;

  // Normalized centers, radius, phase, elongation and an optional inner opening.
  // The cropped ring and its small visitor anchor the changing scale of the field.
  const bodies = [
    [.04, .19, .48, .5, 1.12, .46],
    [.46, .21, .095, 2.1, .85, 0],
    [1.04, .24, .255, 4.2, 1.16, .47],
    [.30, .57, .18, 1.8, 1.12, 0],
    [.73, .50, .22, 5.3, .83, .43],
    [-.06, .82, .072, 3.4, 1.25, 0],
    [.48, .96, .32, .8, 1.05, .46],
    [1.05, .84, .062, 2.7, .86, 0]
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

  const mix = (a, b, t) => a + (b - a) * t;
  const fract = x => x - Math.floor(x);

  function morphState(t, index) {
    const cycle = (t + index * 13.7 + 12) / (71 + index * 3);
    return {
      kind: (Math.floor(cycle) + index) % silhouettes.length,
      part: fract(cycle),
      clarity: index % 3 === 0 ? .98 : .89
    };
  }

  function recognition(state, angle = 0) {
    // Features arrive and leave unevenly; only the brief crest resolves together.
    const lag = .065 * Math.sin(angle + .7) * (1 - smooth(.58, .62, state.part))
      + .05 * Math.cos(angle - .5) * smooth(.65, .73, state.part);
    const p = state.part - lag;
    return state.clarity * smooth(.46, .62, p) * (1 - smooth(.65, .77, p));
  }

  function passage(t) {
    const p = fract((t + 22) / 67);
    // Slow approach, held near-contact, quicker transit, release, wide return.
    const stops = [[0, -1.65], [.27, -1.02], [.39, -.90], [.48, .90], [.65, 1.65], [1, -1.65]];
    let segment = 0;
    while (p > stops[segment + 1][0]) segment++;
    const a = stops[segment], b = stops[segment + 1];
    const u = smooth(a[0], b[0], p);
    return {
      x: mix(a[1], b[1], u),
      y: .10 + .06 * Math.sin(p * tau) + (segment === 4 ? 1.65 * Math.sin(Math.PI * u) : 0),
      squeeze: smooth(.37, .42, p) * (1 - smooth(.49, .58, p))
    };
  }

  function posesAt(t) {
    const part = fract((t + 17) / 127);
    const crowd = smooth(.08, .29, part) * (1 - smooth(.43, .75, part));
    const cx = width * (.50 + .16 * Math.sin(t * .018));
    const cy = height * (.49 + .17 * Math.sin(t * .015 + 1));
    const poses = bodies.map(([nx, ny, size, phase, elongation, opening], index) => {
      const flow = t + 4.2 * Math.sin(t * .12 + phase);
      const initial = Math.acos(2 * ny - 1) * (index % 2 ? -1 : 1);
      const circulation = flow * tau / (104 + index * 9) + initial;
      const x = nx * width + Math.sin(flow * .043 + phase) * unit * .19;
      const y = height * .5 + Math.cos(circulation) * (height * .55 + unit * .12);
      return {
        x: mix(x, cx + (nx - .5) * unit * .77, crowd * .78),
        y: mix(y, cy + Math.sin(phase + t * .026) * unit * .36, crowd * .70),
        r: size * unit * (1 + .085 * Math.sin(t * .13 + phase)) * (1 - crowd * .13),
        phase, opening, morph: morphState(t, index),
        stretch: 1 + (elongation - 1) * .35 + .11 * Math.sin(flow * .14 + phase),
        rotation: .24 * Math.sin(flow * .067 + phase),
        contacts: []
      };
    });
    const visit = passage(t);
    const ring = poses[0], visitor = poses[1];
    visitor.x = ring.x + ring.r * visit.x;
    visitor.y = ring.y + ring.r * visit.y;
    visitor.stretch = 1 + visit.squeeze * .38;
    return poses;
  }

  function encounter(distance, radius) {
    const gap = distance / radius;
    return smooth(.48, .88, gap) * (1 - smooth(1.04, 1.64, gap));
  }

  function sceneAt(t) {
    const poses = posesAt(t);
    const recent = posesAt(t - .3), memory = posesAt(t - 4.5);
    poses.forEach((pose, index) => {
      // The aperture trails its body's actual path, including the crowd's drift.
      pose.lagX = Math.max(-.17, Math.min(.17, (memory[index].x - pose.x) * .36 / pose.r));
      pose.lagY = Math.max(-.17, Math.min(.17, (memory[index].y - pose.y) * .36 / pose.r));
    });
    for (let i = 0; i < poses.length; i++) {
      for (let j = i + 1; j < poses.length; j++) {
        const a = poses[i], b = poses[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const radius = a.r + b.r;
        const contact = encounter(distance, radius);
        const oldDistance = Math.hypot(recent[j].x - recent[i].x, recent[j].y - recent[i].y);
        const approaching = smooth(-.015, .015, (oldDistance - distance) / (.3 * unit));
        const past = encounter(Math.hypot(memory[j].x - memory[i].x,
          memory[j].y - memory[i].y), memory[i].r + memory[j].r);
        const recoil = past * (1 - contact) * (1 - approaching);
        if (contact < .001 && recoil < .001) continue;
        const direction = Math.atan2(dy, dx);
        a.contacts.push({direction, pull: contact * (.65 + .35 * approaching), recoil, other: b});
        b.contacts.push({direction: direction + Math.PI,
          pull: contact * (.65 + .35 * approaching), recoil, other: a});
      }
    }
    return poses;
  }

  function hueColor(hue, peak) {
    const sector = ((hue % 360 + 360) % 360) / 60;
    const x = peak * (1 - Math.abs(sector % 2 - 1));
    const channels = [[peak, x, 0], [x, peak, 0], [0, peak, x],
      [0, x, peak], [x, 0, peak], [peak, 0, x]][Math.floor(sector)];
    return `rgb(${channels.map(Math.round).join(', ')})`;
  }

  function paletteAt(t) {
    // A continuous 90-second hue circuit. Keep both inks fully saturated and
    // separated in hue instead of crossfading through dull intermediate colors.
    const turn = t * 4;
    return {paper: hueColor(120 - 60 * 186 / 255 + turn, 255),
      ink: hueColor(360 - 60 * 184 / 240 + turn, 240)};
  }

  function stripes(target, inverted, {paper, ink}) {
    target.fillStyle = inverted ? ink : paper;
    target.fillRect(0, 0, width, height);
    target.fillStyle = inverted ? paper : ink;
    // Center an ink band, keeping stripe edges on backing-store pixel boundaries.
    const start = Math.round((width / 2 - band / 2) * ratio) / ratio;
    for (let x = start - Math.ceil(width / band) * band; x < width; x += band * 2) {
      target.fillRect(x, 0, band, height);
    }
  }

  function contour(path, pose, t, opening = false) {
    const {x, y, r, phase, stretch, rotation, morph, contacts} = pose;
    const points = [];
    const cosine = Math.cos(rotation), sine = Math.sin(rotation);
    for (let i = 0; i < count; i++) {
      const angle = i / count * tau;
      const blob = 1
        + (opening ? .09 : .16) * Math.sin(3 * angle + phase + t * .16)
        + .085 * Math.cos(2 * angle - phase + t * .11)
        + .035 * Math.sin(5 * angle + phase * 2 - t * .09);
      const blend = opening ? 0 : recognition(morph, angle);
      let radial = mix(blob, silhouettes[morph.kind][i], blend);
      const bearing = Math.atan2(-Math.cos(angle) / stretch, Math.sin(angle) * stretch) + rotation;
      let deformation = 0;
      for (const contact of contacts) {
        const offset = bearing - contact.direction;
        const tip = Math.exp(11 * (Math.cos(offset) - 1));
        const shoulders = Math.exp(22 * (Math.cos(offset - .43) - 1))
          + Math.exp(22 * (Math.cos(offset + .43) - 1));
        // A narrow reaching neck, pulled shoulders, then a trailing indentation.
        deformation += contact.pull * (.43 * tip - .09 * shoulders)
          - contact.recoil * .13 * Math.exp(7 * (Math.cos(offset) - 1));
      }
      radial = Math.max(.12, radial + Math.max(-.24, Math.min(.43, deformation)));
      const px = Math.sin(angle) * r * radial * stretch;
      const py = -Math.cos(angle) * r * radial / stretch;
      points.push([
        x + px * cosine - py * sine,
        y + px * sine + py * cosine
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

  function openingAt(pose, t, index) {
    if (!pose.opening) return null;
    const {x, y, r, phase, contacts} = pose;
    const p = fract((t + index * 19 + 9) / (89 + index * 7));
    // An opening reaches the rim, slips outside as a small body and dwindles.
    // A new opening grows inside while its predecessor is still departing.
    const escape = smooth(.37, .62, p);
    const fade = 1 - smooth(.68, .84, p);
    const angle = phase + .38 * Math.sin(t * .028 + phase);
    let ox = .15 * Math.sin((t - 3.5) * .08 + phase) + pose.lagX;
    let oy = .13 * Math.cos((t - 3.5) * .063 + phase) + pose.lagY;
    let pull = 0;
    for (const contact of contacts) {
      const weight = contact.pull * Math.min(1, contact.other.r / r * 2);
      ox += Math.cos(contact.direction) * weight * .16;
      oy += Math.sin(contact.direction) * weight * .16;
      pull = Math.max(pull, contact.pull);
    }
    const originX = ox, originY = oy;
    const reach = escape * 1.55;
    ox = ox * (1 - escape) + Math.cos(angle) * reach;
    oy = oy * (1 - escape) + Math.sin(angle) * reach;
    const skull = pose.morph.kind === 2 ? smooth(.35, .94, recognition(pose.morph)) : 0;
    const radius = r * pose.opening * mix(1, .37, escape) * fade * (1 - skull);
    const aperture = {
      ...pose, x: x + r * ox, y: y + r * oy, r: radius,
      phase: phase + 2.1,
      stretch: 1 + .20 * Math.sin(t * .057 + phase) + pull * .19,
      rotation: angle + Math.sin(t * .06) * .4
    };
    const renewal = smooth(.65, .86, p) * (1 - skull);
    return {
      aperture,
      renewal: {...aperture, x: x + r * originX,
        y: y + r * originY,
        r: r * pose.opening * renewal}
    };
  }

  function draw() {
    maskCtx.clearRect(0, 0, width, height);
    maskCtx.globalCompositeOperation = 'xor';
    maskCtx.fillStyle = '#fff';
    sceneAt(time).forEach((pose, index) => {
      const {x, y, r, rotation, morph} = pose;
      const path = new Path2D();
      contour(path, pose, time);
      const openings = openingAt(pose, time, index);
      if (openings) {
        for (const hole of [openings.aperture, openings.renewal]) {
          if (hole.r > .001) contour(path, hole, time, true);
        }
      }
      const skull = morph.kind === 2 ? smooth(.30, .94, recognition(morph)) : 0;
      if (skull > .001) {
        const feature = (dx, dy, rx, ry, angle, delay) => {
          const emergence = smooth(delay, 1, skull);
          const fx = x + r * (dx * Math.cos(rotation) - dy * Math.sin(rotation));
          const fy = y + r * (dx * Math.sin(rotation) + dy * Math.cos(rotation));
          path.moveTo(fx + rx * r * emergence * Math.cos(angle), fy + rx * r * emergence * Math.sin(angle));
          path.ellipse(fx, fy, rx * r * emergence, ry * r * emergence, angle, 0, tau);
          path.closePath();
        };
        feature(-.34, -.08, .235, .255, rotation + .16, 0);
        feature(.34, -.08, .235, .255, rotation - .16, .20);
        feature(0, .35, .095, .13, rotation, .38);
      }
      maskCtx.fill(path, 'evenodd');
    });

    const palette = paletteAt(time);
    reverseCtx.globalCompositeOperation = 'source-over';
    stripes(reverseCtx, true, palette);
    reverseCtx.globalCompositeOperation = 'destination-in';
    reverseCtx.drawImage(mask, 0, 0, width, height);
    stripes(ctx, false, palette);
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
