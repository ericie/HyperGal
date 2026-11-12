// Exercise the actual renderer and control events without requiring a browser.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../pieces/017-knot-work/knot.js', import.meta.url), 'utf8');
const noop = () => {};
function simulation(width, height, query = '?seed=studio', topologyOnly = false) {
  const events = new Map(), frames = [], gradients = [];
  const listen = target => Object.assign(target, { addEventListener: (name, fn) => events.set(`${target.id}:${name}`, fn) });
  const colors = { color1: '#33260f', color2: '#33260f', color3: '#33260f', paper: '#e9ddc6', gradientEnd: '#b84a36' };
  const bounds = { padTop: [0, 40], padRight: [0, 40], padBottom: [0, 40], padLeft: [0, 40], lines: [1, 3], density: [60, 160], weight: [20, 70], gap: [2, 22], warp: [0, 100], cycles: [1, 6] };
  const inputs = Object.fromEntries(Object.keys({ ...bounds, ...colors, gradient: false }).map(name => [name, { name, type: name === 'gradient' ? 'checkbox' : name in colors ? 'color' : name === 'lines' ? 'radio' : name.startsWith('pad') ? 'number' : 'range', min: bounds[name]?.[0], max: bounds[name]?.[1], validity: { valid: true } }]));
  const fields = {};
  const form = listen({ id: 'settings', elements: { namedItem: key => inputs[key] }, querySelector: key => fields[key] ||= {} });
  const handle = listen({ id: 'handle', setPointerCapture: noop });
  const panel = listen({ id: 'controls', style: {}, offsetWidth: 292, offsetHeight: 800, querySelector: key => key === '.drag-handle' ? handle : { focus: noop }, getBoundingClientRect: () => ({ left: 100, top: 16 }) });
  let strokes = 0;
  const context = new Proxy({}, {
    get: (target, key) => key === 'createLinearGradient' ? (...coords) => {
      assert.ok(coords.every(Number.isFinite), 'finite gradient geometry');
      const stops = []; gradients.push(stops);
      return { addColorStop: (at, color) => stops.push({ at, color }) };
    } : key === 'stroke' ? () => { strokes++; } : (...args) => {
      for (const arg of args) if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `finite ${key}`);
    },
    set: () => true,
  });
  const canvas = listen({ id: 'stage', getContext: () => context, style: {} });
  const outputs = {};
  const button = listen({ id: 'new-knot' });
  const env = { Math, URLSearchParams, URL, location: { search: query, href: `http://localhost/pieces/017-knot-work/${query}` },
    history: { replaceState: (_, __, url) => { env.location.href = String(url); } }, innerWidth: width, innerHeight: height, devicePixelRatio: 2,
    document: { getElementById: key => ({ stage: canvas, settings: form, controls: panel, 'new-knot': button }[key] || (outputs[key] ||= {})) },
    addEventListener: (name, fn) => events.set(`window:${name}`, fn), requestAnimationFrame: fn => { frames.push(fn); return frames.length; } };
  vm.createContext(env);
  const instrumented = source.replace('    const loops = traceLoops(tiles, geo);', '    globalThis.weave = { tiles, geo }; const loops = traceLoops(tiles, geo);')
    .replace('    scene.paths = scene.loops.map(sampleLoop);', topologyOnly ? '    return;' : '    scene.paths = scene.loops.map(sampleLoop);');
  vm.runInContext(instrumented.replace(/\}\)\(\);\s*$/,  'globalThis.test = { get scene() { return scene; }, settings, colorAt, compose, sampleLoop, cellCmds, edgeMid, connectWeave, get seed() { return seed; } }; })();'), env);
  return { ...env.test, get scene() { return env.test.scene; }, get seed() { return env.test.seed; }, get weave() { return env.weave; }, env, events, gradients, fields, outputs, inputs, panel, get strokes() { return strokes; },
    input(name, value) { const input = inputs[name]; input.value = String(value); input.checked = Boolean(value); events.get('settings:input')({ target: input }); events.get('settings:change')(); while (frames.length) frames.shift()(); },
    fire(id, event, data = { preventDefault: noop }) { events.get(`${id}:${event}`)(data); } };
}
// Independently trace every closed cord, then build a graph whose edges are
// actual cross tiles shared by two cords. The graph must be connected; merely
// checking a loop's size or whether it self-crosses misses detached islands.
function wovenComponents({ tiles, geo }) {
  const { rows, cols, sides } = geo;
  const edges = ['n', 'e', 's', 'w'];
  const opposite = { n: 's', e: 'w', s: 'n', w: 'e' };
  const routes = { cross: opposite, a: { n: 'w', w: 'n', e: 's', s: 'e' }, b: { n: 'e', e: 'n', s: 'w', w: 's' } };
  const owner = new Map();
  const key = (r, c, edge) => `${r}:${c}:${edge}`;
  let loops = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (const edge of edges) {
    if (owner.has(key(r, c, edge))) continue;
    const loop = loops++;
    let row = r, col = c, inlet = edge;
    while (!owner.has(key(row, col, inlet))) {
      const out = routes[tiles[row][col]][inlet];
      owner.set(key(row, col, inlet), loop);
      owner.set(key(row, col, out), loop);
      if (out === 'n') {
        if (row) { row--; inlet = 's'; } else { col = sides.top.pair[col]; inlet = 'n'; }
      } else if (out === 's') {
        if (row < rows - 1) { row++; inlet = 'n'; } else { col = sides.bottom.pair[col]; inlet = 's'; }
      } else if (out === 'w') {
        if (col) { col--; inlet = 'e'; } else { row = sides.left.pair[row]; inlet = 'w'; }
      } else {
        if (col < cols - 1) { col++; inlet = 'w'; } else { row = sides.right.pair[row]; inlet = 'e'; }
      }
    }
    assert.equal(owner.get(key(row, col, inlet)), loop, 'each routed cord closes on itself');
  }
  assert.equal(owner.size, rows * cols * 4, 'all tile ports are retained');
  const links = Array.from({ length: loops }, () => new Set());
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    if (tiles[row][col] !== 'cross') continue;
    const a = owner.get(key(row, col, 'n')), b = owner.get(key(row, col, 'e'));
    links[a].add(b); links[b].add(a);
  }
  const seen = new Set();
  let components = 0;
  for (let loop = 0; loop < loops; loop++) {
    if (seen.has(loop)) continue;
    components++;
    const stack = [loop];
    while (stack.length) {
      const next = stack.pop();
      if (seen.has(next)) continue;
      seen.add(next);
      stack.push(...links[next]);
    }
  }
  return { components, loops };
}

function checkBounds(sim, width, height) {
  const { scene, settings } = sim;
  assert.equal(wovenComponents(sim.weave).components, 1, 'all cords belong to the same interlaced network');
  const { fx, fy, x, y, cx, cy } = scene.fit;
  assert.ok(fx > 0 && fy > 0 && Number.isFinite(fx) && Number.isFinite(fy));
  const radiusX = scene.band / 2 * fx;
  const radiusY = scene.band / 2 * fy;
  for (const path of scene.paths) {
    assert.ok(path.length > 0);
    assert.ok(Math.hypot(path.points[0].x - path.points.at(-1).x, path.points[0].y - path.points.at(-1).y) < 1e-5, 'cords close');
    for (const p of path.points) {
      const px = x + (p.x - cx) * fx, py = y + (p.y - cy) * fy;
      assert.ok(px - radiusX >= width * settings.padLeft / 100 - 1e-6);
      assert.ok(px + radiusX <= width * (1 - settings.padRight / 100) + 1e-6);
      assert.ok(py - radiusY >= height * settings.padTop / 100 - 1e-6);
      assert.ok(py + radiusY <= height * (1 - settings.padBottom / 100) + 1e-6);
    }
  }
  assert.ok(scene.crossings.every(c => c.path && Number.isFinite(c.distance)), 'each crossing repaints an original loop');
}
for (const [w, h] of [[1440, 900], [390, 844], [320, 568], [2400, 600]]) {
  const sim = simulation(w, h);
  checkBounds(sim, w, h);
  // Padding is an exact, independent margin, not a minimum contain box.
  const projected = axis => {
    const fit = sim.scene.fit;
    const scale = axis === 'x' ? fit.fx : fit.fy;
    const center = axis === 'x' ? fit.cx : fit.cy;
    return sim.scene.paths.flatMap(path => path.points.map(p => fit[axis] + (p[axis] - center) * scale));
  };
  const extent = axis => {
    const points = projected(axis);
    const radius = sim.scene.band / 2 * (axis === 'x' ? sim.scene.fit.fx : sim.scene.fit.fy);
    return [Math.min(...points) - radius, Math.max(...points) + radius];
  };
  const horizontal = JSON.stringify(projected('x'));
  sim.input('padTop', 17);
  sim.input('padBottom', 17);
  assert.equal(JSON.stringify(projected('x')), horizontal, 'top/bottom edits leave every horizontal coordinate fixed');
  assert.ok(Math.abs(extent('y')[0] - h * .17) < 1e-6);
  assert.ok(Math.abs(extent('y')[1] - h * .83) < 1e-6);
  const vertical = JSON.stringify(projected('y'));
  sim.input('padLeft', 12);
  sim.input('padRight', 23);
  assert.equal(JSON.stringify(projected('y')), vertical, 'left/right edits leave every vertical coordinate fixed');
  assert.ok(Math.abs(extent('x')[0] - w * .12) < 1e-6);
  assert.ok(Math.abs(extent('x')[1] - w * .77) < 1e-6);
  checkBounds(sim, w, h);
  sim.fire('settings', 'reset');
  const duplicate = simulation(w, h);
  assert.equal(JSON.stringify(sim.scene.paths), JSON.stringify(duplicate.scene.paths), 'deterministic geometry');
  for (const lines of [1, 2, 3]) {
    sim.input('lines', lines);
    sim.input('gradient', true);
    checkBounds(sim, w, h);
    assert.ok(sim.gradients.length > 0);
    assert.equal(sim.fields['.gradient-fields'].hidden, false);
    assert.equal(sim.fields['[data-color="color3"]'].hidden, lines < 3);
    const path = sim.scene.paths[0];
    assert.equal(sim.colorAt(0, 0, path.length), sim.colorAt(0, path.length, path.length), 'gradient is seamless at loop closure');
  }
  for (const [name, value] of [['padLeft', 40], ['padTop', 35], ['padBottom', 40], ['padRight', 32], ['density', 160], ['weight', 70], ['gap', 22], ['warp', 100]]) sim.input(name, value);
  checkBounds(sim, w, h);
  // Regression: the two rounded turns in a tile must never merge, even at
  // maximum weight and irregularity. Measure actual warped centerlines rather
  // than duplicating the renderer's clearance formula.
  for (const warp of [0, 100]) {
    sim.input('warp', warp);
    for (const [row, col] of [[0, 0], [3, 5], [12, 18]]) {
      for (const [type, a, b] of [['a', ['w', 'n'], ['e', 's']], ['b', ['w', 's'], ['e', 'n']]]) {
        const turn = edges => {
          const start = sim.edgeMid(row, col, edges[0], sim.scene.s);
          return sim.sampleLoop([{ op: 'M', ...start }, ...sim.cellCmds(type, row, col, ...edges, sim.scene.s)]).points;
        };
        const first = turn(a), second = turn(b);
        let distance = Infinity;
        for (const p of first) for (const q of second) distance = Math.min(distance, Math.hypot(p.x - q.x, p.y - q.y));
        assert.ok(distance > sim.scene.band * 1.05, `opposing ${type} bends stay separate at max weight (${w}x${h}, warp ${warp})`);
      }
    }
  }
  const saved = new URL(sim.env.location.href).search;
  const restored = simulation(w, h, saved);
  assert.equal(JSON.stringify(sim.settings), JSON.stringify(restored.settings), 'URL restores all drawing settings');
  assert.equal(JSON.stringify(sim.scene.paths), JSON.stringify(restored.scene.paths), 'URL restores geometry');
  const seed = sim.seed;
  sim.fire('new-knot', 'click');
  assert.notEqual(sim.seed, seed);
  assert.equal(sim.settings.lines, 3, 'reseed preserves settings');
  sim.fire('settings', 'reset');
  assert.equal(sim.settings.lines, 2);
  assert.equal(sim.settings.gradient, false);
  assert.equal(sim.settings.padLeft, 5);
  assert.equal(sim.settings.density, 100);
  assert.ok(!new URL(sim.env.location.href).searchParams.has('lines'), 'reset clears custom URL settings');
  sim.panel.open = true;
  sim.fire('controls', 'keydown', { key: 'Escape' });
  assert.equal(sim.panel.open, false);
}
const malformed = simulation(390, 844, '?seed=invalid&lines=999&padTop=NaN&padLeft=-100&density=Infinity&color1=oops');
assert.equal(malformed.settings.lines, 3);
assert.equal(malformed.settings.padTop, 5);
assert.equal(malformed.settings.padLeft, 0);
assert.equal(malformed.settings.density, 100);
assert.equal(malformed.settings.color1, '#33260f');
// A deliberate regression fixture has both isolated border ovals and an
// interior four-tile ring. The cleanup must reroute them, not hide their paths.
const topology = simulation(390, 844, '?seed=topology', true);
const pairing = { pair: [1, 0, 3, 2, 5, 4], level: [1, 1, 1, 1, 1, 1], maxLevel: 1, pretzel: null };
const fixture = { tiles: Array.from({ length: 6 }, () => Array(6).fill('cross')),
  geo: { rows: 6, cols: 6, sides: { top: pairing, bottom: pairing, left: pairing, right: pairing } } };
fixture.tiles[0][0] = 'b'; fixture.tiles[1][0] = 'a';
fixture.tiles[0][5] = 'a'; fixture.tiles[1][5] = 'b';
fixture.tiles[2][2] = 'a'; fixture.tiles[2][3] = 'b';
fixture.tiles[3][2] = 'b'; fixture.tiles[3][3] = 'a';
assert.ok(wovenComponents(fixture).components >= 4, 'fixture reproduces detached border ovals and an interior ring');
topology.connectWeave(fixture.tiles, fixture.geo, false);
assert.equal(wovenComponents(fixture).components, 1, 'border ovals and interior rings are woven into the composition');
let topologyCases = 0;
for (const [w, h] of [[390, 844], [1440, 900], [2400, 600]]) {
  for (let seed = 0; seed < 24; seed++) for (const density of [60, 100, 160]) {
    const sim = simulation(w, h, `?seed=connect-${seed}&density=${density}`, true);
    const graph = wovenComponents(sim.weave);
    assert.equal(graph.components, 1, `no detached island at ${w}x${h}, seed ${seed}, density ${density}`);
    assert.equal(graph.loops, sim.scene.loops.length, 'independent traversal agrees with every rendered cord');
    const { tiles, geo } = sim.weave;
    for (let r = 0; r < geo.rows; r++) for (let c = 0; c < geo.cols; c++) {
      const opposite = tiles[r][geo.cols - 1 - c];
      assert.equal(tiles[r][c], opposite === 'a' ? 'b' : opposite === 'b' ? 'a' : opposite, 'horizontal symmetry survives rerouting');
    }
    topologyCases++;
  }
}
console.log(`Passed: ${topologyCases} seeded layouts with no disconnected islands; border-oval/interior-ring regression; four viewport sizes and existing drawing/control checks.`);
console.log('Passed: four viewport sizes; closed cords, exact independent padding on both axes, single/double/triple lines, path gradients, crossing repaint, non-overlapping bends at maximum weight, URL restoration, reseed, reset, Escape, and invalid parameters.');
