(() => {
  'use strict';
  const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');
  const TAU = Math.PI * 2, key = 'hypergal-moon-orchard-v1';
  const WHITE = '#fff', BLACK = '#000', SPEED = 66, GRAVITY = 420;
  let moonHoles = [], trees = [], time = 0, rotation = 0, paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const s = JSON.parse(localStorage.getItem(key));
    if (s && Number.isFinite(s.time) && Number.isFinite(s.rotation) && Array.isArray(s.trees)) {
      time = s.time; rotation = s.rotation;
      moonHoles = Array.isArray(s.moonHoles) ? s.moonHoles.filter(v => Array.isArray(v) && v.length === 2 && v.every(Number.isFinite) && v[1] > 0 && v[1] <= 30) : [];
      trees = s.trees.filter(t => Array.isArray(t) && t.length === 5 && t.every(Number.isFinite));
    }
  } catch (_) {}
  let w, h, ground, planet, scroll = 0, last = 0, shotClock = .3, volley = 0;
  let obstacleClock = .6, ufoClock = 2, saveClock = 0;
  let shots = [], obstacles = [], ufos = [], bombs = [], sparks = [], jump = 0, velocity = 0;
  let distance = 0, jumps = 0, craters = 0, hopFired = false;
  const repairSaucer = {x: 40, direction: 1, beam: null};
  const moonY = x => planet.y + Math.sqrt(Math.max(0, planet.r ** 2 - (x - planet.x) ** 2));
  const rand = (a, b) => a + Math.random() * (b - a);
  const buggyX = () => w * .23;
  const ufoY = u => u.y + Math.sin(time * 3 + u.phase) * 3;
  let holeScore = 0;
  const seenHoles = new WeakSet();
  function countVisibleHoles() {
    const see = hole => {if (!seenHoles.has(hole)) {seenHoles.add(hole); holeScore++;}};
    obstacles.forEach(o => {
      if (!o.dead && o.kind === 'pit' && o.x + o.size / 2 >= 0 && o.x - o.size / 2 <= w) see(o);
    });
    moonHoles.forEach(hole => {
      const angle = hole[0] + rotation, x = planet.x + Math.cos(angle) * planet.r;
      const y = planet.y + Math.sin(angle) * planet.r;
      if (Math.sin(angle) > 0 && x + hole[1] >= 0 && x - hole[1] <= w && y >= 0 && y - hole[1] <= h) see(hole);
    });
  }
  function filledHole(hole) {
    if (seenHoles.delete(hole)) holeScore--;
  }
  function save() { try { localStorage.setItem(key, JSON.stringify({time, rotation, trees, moonHoles})); } catch (_) {} }
  function resize() {
    const oldW = w, oldGround = ground;
    // Keep sprites legible on phones and expose more terrain on wide screens.
    w = Math.min(800, innerWidth); h = Math.round(innerHeight * w / innerWidth);
    canvas.width = w; canvas.height = h; ground = Math.round(h * .84);
    const radius = Math.max(w * 1.55, h * 1.1);
    planet = {x: w * .5, y: h * .22 - radius, r: radius};
    if (oldW) {
      const scale = w / oldW, shift = ground - oldGround;
      shots.forEach(s => {s.x *= scale; s.y += shift;});
      obstacles.forEach(o => o.x *= scale);
      ufos.forEach(u => {u.x *= scale; u.y += shift;});
      bombs.forEach(b => {b.x *= scale; b.y += shift;});
      sparks.forEach(p => {p.x *= scale; p.y += shift;});
    }
    draw();
  }
  function burst(x, y, n = 12) {
    for (let i = 0; i < n; i++) sparks.push({x, y, vx: rand(-45, 45), vy: rand(-65, 20), life: rand(.2, .65)});
  }
  function plant(x, y) {
    const angle = Math.atan2(y - planet.y, x - planet.x) - rotation;
    const near = moonHoles.find(v => Math.abs(Math.atan2(Math.sin(v[0] - angle), Math.cos(v[0] - angle))) * planet.r < 14);
    if (near) near[1] = Math.min(30, near[1] + 4);
    else moonHoles.push([angle, 16]);
    countVisibleHoles();
    burst(x, y, 8);
  }
  function fireHop() {
    const x = buggyX(), y = ground - jump;
    shots.push({x: x + 6, y: y - 31, vx: 0, vy: -270, up: true});
    shots.push({x: x + 29, y: y - 10, vx: 270, vy: 0, up: false});
    shots.push({x, y: y - 1, vx: -SPEED, vy: 270, down: true});
  }
  function crater(x, size) {
    const near = obstacles.find(o => o.kind === 'pit' && Math.abs(o.x - x) < (o.size + size) / 2);
    if (near) near.size = Math.min(32, Math.max(near.size, size));
    else obstacles.push({x, kind: 'pit', size, bomb: true});
    obstacles.forEach(o => {if (o.kind === 'rock' && Math.abs(o.x - x) < size / 2) o.dead = true;});
    countVisibleHoles();
    craters++; burst(x, ground, 22);
  }
  function update(dt) {
    time += dt; rotation += dt * .008; scroll += dt * SPEED; distance += dt * SPEED;
    const bx = buggyX();
    obstacles.forEach(o => o.x -= dt * SPEED);
    const threat = obstacles.some(o => !o.dead && o.x + o.size / 2 > bx - 12 && o.x - o.size / 2 < bx + 27);
    if (jump === 0 && threat) {velocity = 180; jump = .1; jumps++; hopFired = false;}
    if (jump > 0) {
      jump += velocity * dt - GRAVITY * dt * dt / 2; velocity -= GRAVITY * dt;
      if (jump <= 0) {jump = 0; velocity = 0;}
    }
    if (jump > 12 && !hopFired && obstacles.some(o => !o.dead && o.kind === 'pit' && Math.abs(o.x - bx) < o.size / 2)) {
      fireHop(); hopFired = true;
    }
    repairSaucer.x += repairSaucer.direction * dt * 58;
    if (repairSaucer.x > w - 22 || repairSaucer.x < 22) {
      repairSaucer.x = Math.max(22, Math.min(w - 22, repairSaucer.x)); repairSaucer.direction *= -1;
    }
    countVisibleHoles();
    repairSaucer.beam = null;
    moonHoles = moonHoles.filter(hole => {
      const angle = hole[0] + rotation, x = planet.x + Math.cos(angle) * planet.r;
      if (Math.sin(angle) > 0 && Math.abs(x - repairSaucer.x) < 20) {
        repairSaucer.beam = {x, y: moonY(x)}; hole[1] -= dt * 22;
      }
      if (hole[1] <= 0) filledHole(hole);
      return hole[1] > 0;
    });
    shotClock -= dt;
    if (shotClock <= 0) {
      if (volley === 0) volley = 3;
      shots.push({x: bx + 6, y: ground - 31 - jump, vx: 0, vy: -270, up: true});
      shots.push({x: bx + 29, y: ground - 10 - jump, vx: 270, vy: 0, up: false});
      volley--;
      shotClock += volley ? .11 : 1.2;
    }
    obstacleClock -= dt;
    if (obstacleClock <= 0) {
      obstacleClock = rand(1.8, 3.1);
      const pit = Math.random() < .25, big = Math.random() < .45;
      obstacles.push({x: w + 35, kind: pit ? 'pit' : 'rock', size: pit ? rand(22, 30) : big ? rand(23, 27) : rand(11, 14), hp: big ? 3 : 1});
    }
    ufoClock -= dt;
    if (ufoClock <= 0) {
      ufoClock = rand(4.8, 7);
      const flight = Math.min(145, (ground - h * .22) * .45);
      ufos.push({x: w + 35, y: ground - flight + rand(-12, 12), phase: rand(0, TAU), drop: rand(.7, 1.6), payload: 2});
    }
    ufos.forEach(u => {
      u.x -= dt * 46; u.drop -= dt;
      if (u.drop <= 0 && u.payload > 0) {
        u.drop = rand(1.8, 3.2);
        if (u.x < w - 20 && u.x > bx + 35 && Math.random() < .7) {
          bombs.push({x: u.x, y: ufoY(u) + 8, vx: -22, vy: 32}); u.payload--;
        }
      }
    });
    bombs.forEach(b => {
      b.x += b.vx * dt; b.vy += dt * 48; b.y += b.vy * dt;
      if (b.y >= ground) {b.dead = true; crater(b.x, rand(25, 31));}
    });
    for (const s of shots) {
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.up && Math.hypot(s.x - planet.x, s.y - planet.y) <= planet.r) {plant(s.x, s.y); s.dead = true; continue;}
      if (s.down) {
        if (s.y >= ground) {
          const pit = obstacles.find(o => !o.dead && o.kind === 'pit' && Math.abs(o.x - s.x) <= o.size / 2 + 3);
          if (pit) {filledHole(pit); pit.dead = true; burst(s.x, ground, 10);}
          s.dead = true;
        }
        continue;
      }
      const rock = obstacles.find(o => o.kind === 'rock' && !o.dead && Math.abs(s.x - o.x) < o.size * .65 && s.y > ground - o.size && s.y < ground);
      const ufo = ufos.find(u => !u.dead && Math.abs(s.x - u.x) < 17 && Math.abs(s.y - ufoY(u)) < 9);
      const bomb = bombs.find(b => !b.dead && Math.hypot(s.x - b.x, s.y - b.y) < 7);
      if (rock || ufo || bomb) {
        const hit = rock || ufo || bomb;
        if (rock) {rock.hp--; rock.dead = rock.hp <= 0;}
        else hit.dead = true;
        s.dead = true; burst(s.x, s.y, rock && !rock.dead ? 4 : 12);
      }
    }
    shots = shots.filter(s => !s.dead && s.x < w + 10 && s.y > -10 && s.y < h + 10);
    obstacles = obstacles.filter(o => !o.dead && o.x > -45);
    ufos = ufos.filter(u => !u.dead && u.x > -35);
    bombs = bombs.filter(b => !b.dead && b.x > -10);
    sparks.forEach(p => {p.x += p.vx * dt; p.y += p.vy * dt; p.vy += dt * 75; p.life -= dt;});
    sparks = sparks.filter(p => p.life > 0);
    saveClock += dt; if (saveClock > 4) {save(); saveClock = 0;}
  }
  function rect(x, y, a, b, color = WHITE) {ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), a, b);}
  function line(points, color = WHITE) {
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath();
    points.forEach(([x, y], i) => {if (i) ctx.lineTo(Math.round(x) + .5, Math.round(y) + .5); else ctx.moveTo(Math.round(x) + .5, Math.round(y) + .5);});
    ctx.stroke();
  }
  function circle(x, y, r, color = WHITE) {ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();}
  function mountain() {
    const points = [];
    for (let x = -20; x <= w + 20; x += 20) {
      const v = x + scroll * .22;
      points.push([x, ground - 24 - Math.abs(Math.sin(v * .009) + Math.sin(v * .021) * .5) * 26]);
    }
    line(points);
  }
  function drawTree(t) {
    const angle = t[0] + rotation, x = planet.x + Math.cos(angle) * planet.r, y = planet.y + Math.sin(angle) * planet.r;
    if (x < -30 || x > w + 30 || y < -30 || y > h) return;
    const size = t[2] * Math.min(1, .15 + Math.max(0, time - t[1]) / 18);
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle - Math.PI / 2);
    rect(-1, 0, 2, size);
    if (t[4] < .55) {
      for (let i = 0; i < 3; i++) {
        const y = size * (.3 + i * .22), r = size * (.32 - i * .065);
        line([[-r, y], [0, y + size * .35], [r, y]]);
      }
    } else {
      line([[-size * .32, size * .48], [0, size * .7], [size * .3, size * .48]]);
      line([[-size * .23, size * .72], [0, size], [size * .22, size * .73]]);
    }
    ctx.restore();
  }
  function draw() {
    countVisibleHoles();
    rect(0, 0, w, h, BLACK);
    for (let i = 0; i < 55; i++) {
      const x = ((i * 137.51) % 1) * w, y = ((i * 83.37) % 1) * ground;
      if (Math.hypot(x - planet.x, y - planet.y) > planet.r + 12) rect(x, y, 1, 1);
    }
    // Draw only the visible limb: the moon's center and almost all its mass
    // sit beyond the screen. Interior crater arcs rotate with the orchard.
    ctx.save(); ctx.beginPath(); ctx.arc(planet.x, planet.y, planet.r, 0, TAU); ctx.clip();
    rect(0, 0, w, h, BLACK);
    for (let i = 0; i < 170; i++) {
      const a = i * 2.399 + rotation, r = planet.r - 16 - (i % 5) * 24;
      const x = planet.x + Math.cos(a) * r, y = planet.y + Math.sin(a) * r;
      if (x < -30 || x > w + 30 || y < -30 || y > h * .24) continue;
      ctx.strokeStyle = WHITE; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y, 9 + i % 13, 3 + i % 5, a - Math.PI / 2, .2, Math.PI * 1.65); ctx.stroke();
    }
    ctx.restore();
    const rim = [];
    for (let x = 0; x <= w; x += 2) {
      let depth = 0;
      for (const hole of moonHoles) {
        const angle = hole[0] + rotation, hx = planet.x + Math.cos(angle) * planet.r;
        if (Math.sin(angle) > 0 && Math.abs(x - hx) < hole[1]) depth = Math.max(depth, Math.sqrt(hole[1] ** 2 - (x - hx) ** 2) * .7);
      }
      rim.push([x, moonY(x) - depth]);
    }
    line(rim); trees.forEach(drawTree);
    mountain();
    rect(0, ground, w, 2);
    for (let i = 0; i < 45; i++) {
      const x = ((i * 47 - scroll) % (w + 30) + w + 30) % (w + 30);
      rect(x, ground + 10 + (i * 17) % Math.max(1, h - ground - 30), i % 3 + 1, 1);
    }
    obstacles.forEach(o => {
      if (o.kind === 'pit') {
        const left = o.x - o.size / 2, right = o.x + o.size / 2;
        rect(left, ground, Math.ceil(o.size), 17, BLACK);
        line([[left - 3, ground], [left, ground + 2], [left + 5, ground + 12], [right - 5, ground + 12], [right, ground + 2], [right + 3, ground]]);
      } else {
        const points = [[o.x - o.size * .65, ground], [o.x - o.size * .55, ground - o.size * .55], [o.x - o.size * .15, ground - o.size], [o.x + o.size * .35, ground - o.size * .8], [o.x + o.size * .65, ground - o.size * .35], [o.x + o.size * .65, ground]];
        ctx.fillStyle = BLACK; ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.fill();
        line(points); line([[o.x - o.size * .15, ground - o.size + 3], [o.x + 1, ground - o.size * .48], [o.x - o.size * .25, ground - 3]]);
      }
    });
    const repairY = moonY(repairSaucer.x) + 35;
    if (repairSaucer.beam) line([[repairSaucer.x - 6, repairY - 8], [repairSaucer.beam.x, repairSaucer.beam.y - 7], [repairSaucer.x + 6, repairY - 8]]);
    [...ufos, {x: repairSaucer.x, y: repairY, phase: -time * 3}].forEach(u => {
      const y = ufoY(u);
      rect(u.x - 5, y - 8, 10, 2); rect(u.x - 8, y - 6, 16, 4);
      rect(u.x - 15, y - 2, 30, 4); rect(u.x - 10, y + 2, 20, 2);
      for (let i = 0; i < 3; i++) rect(u.x - 9 + i * 8, y - 1, 3, 2, BLACK);
      rect(u.x - 8, y + 6, 3, 2); rect(u.x + 5, y + 6, 3, 2);
    });
    bombs.forEach(b => {rect(b.x - 1, b.y - 8, 2, 4); rect(b.x - 3, b.y - 3, 6, 5); rect(b.x - 1, b.y + 2, 2, 2);});
    shots.forEach(s => rect(s.x - 1, s.y - 1, s.up || s.down ? 2 : 5, s.up || s.down ? 5 : 2));
    const bx = buggyX(), by = ground - jump;
    ctx.save(); ctx.translate(Math.round(bx), Math.round(by));
    for (const x of [-13, 0, 13]) {
      circle(x, -4, 5); circle(x, -4, 3, BLACK);
      const a = scroll * .12; rect(x + Math.cos(a) * 2, -4 + Math.sin(a) * 2, 1, 1);
    }
    rect(-20, -15, 40, 8); rect(-15, -18, 27, 4); rect(-5, -27, 15, 9);
    rect(-3, -25, 10, 6, BLACK); rect(5, -31, 3, 6); rect(16, -12, 12, 3); rect(-22, -13, 3, 4);
    rect(-15, -13, 25, 2, BLACK); ctx.restore();
    sparks.forEach(p => rect(p.x, p.y, 2, 2));
    ctx.fillStyle = WHITE; ctx.font = '12px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    const scoreText = 'HOLES ' + holeScore;
    rect(10, 10, ctx.measureText(scoreText).width + 12, 24, BLACK);
    ctx.fillStyle = WHITE; ctx.fillText(scoreText, 16, 16);
    canvas.dataset.holeScore = holeScore;
    canvas.dataset.moonHoles = moonHoles.length; canvas.dataset.trees = trees.length; canvas.dataset.jumps = jumps; canvas.dataset.craters = craters;
  }
  function toggle() {paused = !paused; canvas.setAttribute('aria-pressed', String(paused)); draw();}
  canvas.addEventListener('click', toggle);
  addEventListener('keydown', e => {
    if (e.code === 'Space' || (e.code === 'Enter' && document.activeElement === canvas)) {e.preventDefault(); if (!e.repeat) toggle();}
    if (e.code === 'KeyS') {draw(); const a = document.createElement('a'); a.download = 'moon-orchard.png'; a.href = canvas.toDataURL('image/png'); a.click();}
  });
  addEventListener('resize', resize); addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => {last = 0; if (document.hidden) save();});
  canvas.setAttribute('aria-pressed', String(paused)); resize();
  function frame(now) {const dt = last ? Math.min((now - last) / 1000, .04) : 0; last = now; if (!paused && !document.hidden) update(dt); draw(); requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
})();
