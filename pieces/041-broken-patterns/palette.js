// Colour-theory palettes.
//
// The original picked a hand-written {line, ground} pair at random. Most were
// good; eleven of the seventy sat under 0.30 lightness separation in OKLab and
// came out muddy. This replaces the lottery with a scheme: choose a relationship
// between ground and ink, then place both in OKLCH so the separation is
// guaranteed rather than hoped for.
//
// The hue vocabulary is drawn from the original palettes — their peaks were
// gold, blue, cyan, red, green and magenta — so the range still looks like the
// same artist picked it.
window.HGPalette = (() => {
  'use strict';

  // ---- OKLCH <-> sRGB -----------------------------------------------------
  const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

  function oklchToRgb(L, C, h) {
    const hr = (h * Math.PI) / 180;
    const a = C * Math.cos(hr);
    const b = C * Math.sin(hr);

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;

    const R = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const B = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    return [R, G, B].map(toGamma);
  }

  const inGamut = (rgb) => rgb.every((v) => v >= -0.001 && v <= 1.001);

  // Reduce chroma until the colour actually exists in sRGB. Without this, a
  // vivid hue at an extreme lightness clips and comes back a different colour.
  function toRgb255(L, C, h) {
    let lo = 0, hi = C;
    if (inGamut(oklchToRgb(L, C, h))) lo = C;
    else {
      for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2;
        if (inGamut(oklchToRgb(L, mid, h))) lo = mid; else hi = mid;
      }
    }
    return oklchToRgb(L, lo, h).map((v) => Math.max(0, Math.min(255, Math.round(v * 255))));
  }

  function rgbToOklch(r, g, b) {
    const R = toLinear(r / 255), G = toLinear(g / 255), B = toLinear(b / 255);
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    return { L, C: Math.hypot(a, bb), h: (Math.atan2(bb, a) * 180 / Math.PI + 360) % 360 };
  }

  // ---- the artist's hue vocabulary ---------------------------------------
  // Measured from the original seventy palettes: the hues that actually recur.
  const HUE_POOL = [
    28,   // red
    45,   // vermilion
    62,   // hunter orange
    85,   // amber
    105,  // gold
    142,  // green
    165,  // jade
    195,  // cyan / glacier
    225,  // sky
    264,  // blue
    290,  // indigo
    328   // magenta
  ];

  // ---- schemes ------------------------------------------------------------
  // Each describes how the ink relates to the ground, in hue degrees.
  const SCHEMES = [
    { name: 'Complementary',       weight: 3, offsets: [0, 180] },
    { name: 'Split Complementary', weight: 3, offsets: [150, 210] },
    { name: 'Triadic',             weight: 2, offsets: [120, 240] },
    { name: 'Analogous',           weight: 2, offsets: [26, -26], minSeparation: 0.42 },
    { name: 'Monochrome',          weight: 2, offsets: [0], minSeparation: 0.46 },
    { name: 'Accented Neutral',    weight: 2, offsets: [0, 180], neutralGround: true }
  ];

  // ---- naming -------------------------------------------------------------
  // So the generated titles still read like titles.
  const HUE_NAMES = [
    [20, 'Crimson'], [45, 'Red'], [70, 'Orange'], [95, 'Amber'], [120, 'Gold'],
    [138, 'Chartreuse'], [160, 'Green'], [180, 'Jade'], [205, 'Teal'],
    [232, 'Cyan'], [252, 'Sky'], [280, 'Blue'], [305, 'Indigo'],
    [330, 'Violet'], [350, 'Magenta'], [361, 'Crimson']
  ];

  function nameFor({ L, C, h }) {
    // At the extremes the hue stops being legible, so stop pretending.
    if (L < 0.13) return 'Ink';
    if (L > 0.94) return 'Chalk';
    if (C < 0.035) {
      if (L < 0.22) return 'Charcoal';
      if (L < 0.40) return 'Slate';
      if (L < 0.62) return 'Ash';
      if (L < 0.85) return 'Bone';
      return 'Chalk';
    }
    let base = 'Grey';
    for (const [limit, label] of HUE_NAMES) { if (h < limit) { base = label; break; } }

    let qualifier = '';
    if (L < 0.28) qualifier = 'Deep';
    else if (L < 0.45) qualifier = 'Dark';
    else if (L > 0.86) qualifier = 'Pale';
    else if (L > 0.72) qualifier = 'Light';
    else if (C > 0.16) qualifier = 'Bright';

    if (C < 0.075 && !qualifier) qualifier = 'Muted';
    return qualifier ? `${qualifier} ${base}` : base;
  }

  // ---- generation ---------------------------------------------------------
  const pick = (rand, list) => list[Math.floor(rand() * list.length)];

  function pickScheme(rand) {
    const total = SCHEMES.reduce((n, s) => n + s.weight, 0);
    let r = rand() * total;
    for (const s of SCHEMES) { r -= s.weight; if (r < 0) return s; }
    return SCHEMES[0];
  }

  /**
   * build(rand, opts) -> { scheme, ground, inks, separation }
   *   rand      seeded 0..1 generator
   *   inkCount  how many ink colours to return (default 1)
   *   minSeparation  floor on |ΔL| between ground and every ink (default 0.32)
   */
  function build(rand, opts = {}) {
    const inkCount = opts.inkCount || 1;
    const scheme = opts.scheme
      ? SCHEMES.find((s) => s.name === opts.scheme) || pickScheme(rand)
      : pickScheme(rand);
    const floor = opts.minSeparation || scheme.minSeparation || 0.32;

    const baseHue = pick(rand, HUE_POOL) + (rand() * 14 - 7);

    // Dark ground with light ink, or the reverse. Both were in the original.
    // A piece can insist: the glow in A Record of Pursuit only reads as bloom
    // over a dark field, and turns to smudge over a light one.
    const darkGround = opts.darkGround !== undefined ? opts.darkGround : rand() < 0.62;

    // Kept off the extremes: a ground at L 0.05 is just black and loses its
    // hue, which the originals never did — Dark Glacier and Midnight still
    // read as coloured.
    const groundL = darkGround ? 0.15 + rand() * 0.17 : 0.78 + rand() * 0.14;
    const groundC = scheme.neutralGround
      ? 0.012 + rand() * 0.022
      : (darkGround ? 0.045 + rand() * 0.075 : 0.035 + rand() * 0.085);

    const ground = { L: groundL, C: groundC, h: baseHue };

    const inks = [];
    for (let i = 0; i < inkCount; i++) {
      // Cycle the scheme's own offsets. Extra inks vary in lightness and chroma
      // rather than wandering off in hue — otherwise a six-ink "Monochrome"
      // would fan from blue to crimson and the name would lie.
      //
      // With a single ink there is no set to spread, so take the offset that
      // sits furthest from the ground: one ink at the ground's own hue would be
      // a monochrome pairing whatever the scheme is called.
      const away = (o) => Math.abs(((o % 360) + 540) % 360 - 180);
      const base = inkCount === 1
        ? scheme.offsets.reduce((a, b) => (away(b) > away(a) ? b : a))
        : scheme.offsets[i % scheme.offsets.length];
      const offset = base + (rand() * 10 - 5);
      const h = (baseHue + offset + 360) % 360;

      // Far enough from the ground in lightness that the pairing reads, spread
      // across the available room so a set of inks is not all one value.
      const step = inkCount > 1 ? (i / (inkCount - 1)) : rand();
      const room = 0.30;
      let L = darkGround
        ? Math.min(0.96, groundL + floor + step * room)
        : Math.max(0.06, groundL - floor - step * room);
      const C = 0.09 + rand() * 0.13;

      inks.push({ L, C, h });
    }

    const decorate = (c) => ({
      oklch: c,
      rgb: toRgb255(c.L, c.C, c.h),
      name: nameFor(c)
    });

    const outGround = decorate(ground);
    const outInks = inks.map(decorate);

    return {
      scheme: scheme.name,
      ground: outGround,
      inks: outInks,
      separation: Math.min(...outInks.map((k) => Math.abs(k.oklch.L - ground.L)))
    };
  }

  return { build, rgbToOklch, oklchToRgb, toRgb255, nameFor, SCHEMES, HUE_POOL };
})();
