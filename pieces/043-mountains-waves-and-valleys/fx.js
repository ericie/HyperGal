// Mountains Waves and Valleys — Eric Ishii Eckhardt, 2024, for HyperMedia Club.
//
// A stand-in for fxhash's SDK, which the piece was built against and which no
// longer exists. It provides only what the sketch actually uses: a seeded,
// resettable generator, the parameter store, and the feature record.
//
// fxhash's base58 hash format and sfc32 generator are kept verbatim, and the
// parameter defaults are drawn in the original order. The standalone edition
// intentionally narrows a few parameter bounds, so old hashes stay stable here
// but do not necessarily reproduce their fxhash-era starting configuration.
(() => {
  'use strict';

  const ALPHABET = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

  function sfc32(a, b, c, d) {
    return () => {
      a |= 0; b |= 0; c |= 0; d |= 0;
      var t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = c << 21 | c >>> 11;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
  }

  const b58dec = (s) => [...s].reduce(
    (p, c) => p * ALPHABET.length + ALPHABET.indexOf(c) | 0, 0
  );

  function seedsFrom(hash) {
    const trunc = hash.slice(2);
    const parts = trunc.match(new RegExp('.{' + ((trunc.length / 4) | 0) + '}', 'g'));
    if (!parts || parts.length < 4) return null;
    return parts.slice(0, 4).map(b58dec);
  }

  function newHash() {
    return 'oo' + Array(49).fill(0)
      .map(() => ALPHABET[(Math.random() * ALPHABET.length) | 0]).join('');
  }

  // A generator that can be wound back to the start of its sequence, which the
  // sketch does at the top of every setup() and draw().
  function resettable(seeds) {
    let fn = sfc32(...seeds);
    const r = () => fn();
    r.reset = () => { fn = sfc32(...seeds); };
    return r;
  }

  const search = new URLSearchParams(location.search);
  let hash = search.get('hash') || newHash();
  let seeds = seedsFrom(hash);
  if (!seeds) { hash = newHash(); seeds = seedsFrom(hash); }

  const definitions = [];
  const values = {};
  const listeners = [];
  let featureRecord = {};

  // Read a URL override for a parameter, coerced to the parameter's type.
  function override(def) {
    if (!search.has(def.id)) return undefined;
    const raw = search.get(def.id);
    if (def.type === 'number') {
      const n = Number(raw);
      return Number.isFinite(n) ? clampToStep(def, n) : undefined;
    }
    if (def.type === 'boolean') return raw === 'true' || raw === '1';
    if (def.type === 'select') {
      const opts = def.options.options;
      // Accept either the option's name or its index.
      if (opts.includes(raw)) return raw;
      const i = Number(raw);
      return Number.isInteger(i) && opts[i] !== undefined ? opts[i] : undefined;
    }
    return raw;
  }

  function clampToStep(def, n) {
    const { min, max, step } = def.options || {};
    if (min === undefined) return n;
    const bounded = Math.min(max, Math.max(min, n));
    if (!step) return bounded;
    const snapped = min + Math.round((bounded - min) / step) * step;
    // Steps like 0.0001 accumulate float noise; trim to the step's precision.
    const places = (String(step).split('.')[1] || '').length;
    return Number(snapped.toFixed(places));
  }

  function randomValue(def, rnd) {
    if (def.type === 'number') {
      const { min, max } = def.options;
      return clampToStep(def, min + rnd() * (max - min));
    }
    if (def.type === 'boolean') return rnd() < 0.5;
    if (def.type === 'select') {
      const opts = def.options.options;
      return opts[Math.floor(rnd() * opts.length)];
    }
    return undefined;
  }

  const $fx = {
    hash,
    minter: 'hypermedia.club',
    iteration: 1,
    inputBytes: null,
    context: 'standalone',

    rand: resettable(seeds),
    // A second stream, seeded off the first so it is stable per hash.
    randminter: resettable(seeds.map((s, i) => (s ^ (0x9e3779b9 * (i + 1))) | 0)),

    params(defs) {
      definitions.length = 0;
      definitions.push(...defs);
      for (const def of defs) {
        const fromUrl = override(def);
        const value = fromUrl !== undefined ? fromUrl : def.default;
        // Numbers arrive from rand() unrounded; the declared step is what the
        // minting form would have snapped them to, and what the panel shows.
        values[def.id] = def.type === 'number' ? clampToStep(def, value) : value;
      }
    },

    getParam: (id) => values[id],
    getParams: () => definitions,
    getDefinitions: () => definitions,
    getRawParams: () => ({ ...values }),
    stringifyParams: (p) => JSON.stringify(p, null, 2),

    // Fresh values for the panel's randomise button — interface, not artwork,
    // so this deliberately does not touch the seeded streams.
    getRandomParam: (id) => randomValue(definitions.find((d) => d.id === id), Math.random),

    features(f) { featureRecord = f; },
    getFeatures: () => featureRecord,

    on(evt, pre, post) { listeners.push({ evt, pre, post }); },

    emit(evt, updates) {
      if (evt !== 'params:update') return;
      Object.assign(values, updates);
      for (const l of listeners) {
        if (l.evt !== evt) continue;
        const optIn = l.pre ? l.pre(updates) : true;
        if (l.post) l.post(optIn, updates);
      }
    },

    // Not part of the fxhash SDK — used by the control panel and by reseeding.
    _newHash: newHash,
    _reseed(next) {
      $fx.hash = hash = next || newHash();
      seeds = seedsFrom(hash) || seedsFrom((hash = $fx.hash = newHash()));
      $fx.rand = resettable(seeds);
      $fx.randminter = resettable(seeds.map((s, i) => (s ^ (0x9e3779b9 * (i + 1))) | 0));
      for (const def of definitions) values[def.id] = randomValue(def, $fx.rand);
      $fx.rand.reset();
    }
  };

  window.$fx = $fx;
  window.debugMode = search.has('debug');
})();
