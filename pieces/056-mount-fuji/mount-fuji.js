/* Mount Fuji — a fixed landscape using Loaded Brush’s paint renderer.
   Derived from 053-loaded-brush; each mark is laid down by a brush loaded with a
   gradient of paint and lit as a relief. Three WebGL2 passes: the primed
   linen (once per resize), the paint deposit (colour + height, drawn as a
   ribbon along the path) and the lighting (normals, cast shadows, occlusion
   and wet specular from the height field). */
(() => {
  'use strict';
  const canvas = document.getElementById('painting');
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  const floatTargets = gl && (gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
  if (!gl || !floatTargets) {
    document.getElementById('fallback').hidden = false;
    document.getElementById('palette').hidden = true;
    canvas.hidden = true;
    return;
  }
  const params = new URLSearchParams(location.search);
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const STRIDE = 28; // x, y, s, t, half width, turn, curvature

  // ---------------------------------------------------------------- state
  let seed = params.get('seed') || 'fuji';
  const state = {
    points: [],                 // { x, y, pressure } as fractions of the viewport
    stops: [{ at: 0, color: '#1d3d9b' }, { at: 1, color: '#f7f4ec' }],
    mode: 'across',             // gradient across the brush face, or along the stroke
    width: 150, thickness: 1, load: 1.2, light: 225,
  };
  let width = 0, height = 0, scale = 1, texW = 0, texH = 0;
  let ribbon = null, length = 0, samples = [];
  const reveal = Infinity;

  function seedNumber(text) {
    let n = 2166136261;
    for (const c of text) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
    return (n >>> 0) % 4096 / 4096 * 100 + 1;
  }

  // ---------------------------------------------------------------- colour
  const srgbToLinear = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const linearToSrgb = c => c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  function hexToLinear(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => srgbToLinear(v / 255));
  }
  function linearToHex(rgb) {
    return '#' + rgb.map(c => Math.round(clamp(linearToSrgb(c), 0, 1) * 255).toString(16).padStart(2, '0')).join('');
  }
  // Pigments are mixed in Oklab so a blue-to-white ramp stays clean instead of
  // dipping through grey the way a straight RGB blend does.
  function toOklab([r, g, b]) {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  }
  function fromOklab([L, a, b]) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  }
  function sampleGradient(g) {
    const stops = [...state.stops].sort((a, b) => a.at - b.at);
    if (g <= stops[0].at) return hexToLinear(stops[0].color);
    for (let i = 1; i < stops.length; i++) {
      if (g <= stops[i].at) {
        const span = stops[i].at - stops[i - 1].at;
        const u = span > 0 ? (g - stops[i - 1].at) / span : 1;
        const a = toOklab(hexToLinear(stops[i - 1].color)), b = toOklab(hexToLinear(stops[i].color));
        return fromOklab(a.map((v, k) => v + (b[k] - v) * u)).map(v => clamp(v, 0, 1));
      }
    }
    return hexToLinear(stops[stops.length - 1].color);
  }

  // ---------------------------------------------------------------- shaders
  const glslPrelude = `#version 300 es
    precision highp float;
    precision highp int;
    const float PI = 3.14159265359;
    const float TAU = 6.28318530718;
    uint pcg(uint v) { v = v * 747796405u + 2891336453u; uint w = ((v >> ((v >> 28u) + 4u)) ^ v) * 277803737u; return (w >> 22u) ^ w; }
    float hash(vec2 p) { uvec2 q = uvec2(ivec2(floor(p)) + 32768); return float(pcg(q.x + pcg(q.y))) / 4294967295.0; }
    vec2 grad(vec2 i) { float a = hash(i) * TAU; return vec2(cos(a), sin(a)); }
    // Gradient noise, roughly -1..1, quintic fade.
    float noise(vec2 p) {
      vec2 i = floor(p), f = p - i;
      vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
      float a = dot(grad(i), f);
      float b = dot(grad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
      float c = dot(grad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
      float d = dot(grad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 1.5;
    }
    vec3 toLinear(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
    vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
  `;
  const screenVertex = `${glslPrelude}
    void main() {
      vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
      gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
    }`;

  // Primed linen: a plain weave of wavering threads under a thin gesso. The
  // alpha channel is the weave height, later scaled to CSS pixels.
  const groundFragment = `${glslPrelude}
    uniform float u_scale, u_seed;
    out vec4 o_ground;
    void main() {
      vec2 c = gl_FragCoord.xy / u_scale;
      vec2 sd = vec2(u_seed * 7.1, u_seed * 3.3);
      // threads waver and vary in thickness, so the weave never tiles
      vec2 w = c + vec2(2.2 * noise(vec2(c.y * 0.02, 3.1) + sd) + 0.8 * noise(vec2(c.y * 0.09, 5.2) + sd),
                        2.2 * noise(vec2(c.x * 0.02, 7.7) + sd) + 0.8 * noise(vec2(c.x * 0.09, 9.4) + sd));
      float period = 4.6;
      vec2 cell = floor(w / period), f = fract(w / period);
      float over = mod(cell.x + cell.y, 2.0);
      float vx = sin(f.x * PI) * (0.72 + 0.28 * noise(vec2(cell.x * 0.9, 0.3) + sd));
      float hy = sin(f.y * PI) * (0.72 + 0.28 * noise(vec2(0.3, cell.y * 0.9) + sd));
      float top = over > 0.5 ? vx : hy, under = over > 0.5 ? hy : vx;
      float weave = max(top, under * 0.6);
      float fibre = over > 0.5 ? noise(vec2(c.x * 1.3, c.y * 0.2) + sd) : noise(vec2(c.x * 0.2, c.y * 1.3) + sd);
      float slub = 0.12 * noise(c * 0.012 + sd);
      float h = clamp(weave * (0.85 + slub) + 0.06 * fibre + 0.08, 0.0, 1.0);
      float mottle = 0.985 + 0.012 * noise(c * 0.03 + sd) + 0.008 * noise(c * 0.3 + sd);
      vec3 albedo = toLinear(vec3(0.935, 0.912, 0.862)) * (0.94 + 0.06 * h) * mottle;
      o_ground = vec4(albedo, h);
    }`;

  const depositVertex = `${glslPrelude}
    in vec2 a_position;   // CSS px
    in vec2 a_st;         // arc length, signed offset across (px)
    in float a_hw;        // local half width (px)
    in vec2 a_frame;      // cumulative turn (rad), curvature (1/px)
    uniform vec2 u_size;  // CSS px
    out vec2 v_st;
    out vec2 v_frame;
    out float v_hw;
    void main() {
      v_st = a_st; v_hw = a_hw; v_frame = a_frame;
      gl_Position = vec4(a_position.x / u_size.x * 2.0 - 1.0, 1.0 - a_position.y / u_size.y * 2.0, 0.0, 1.0);
    }`;

  // The paint field, evaluated in stroke space (s along, t across). Height
  // and coverage come from hair-scale relief, edge lips of pushed paint, the
  // landing bulge, the hair-by-hair run-out and the lift at the end.
  const depositFragment = `${glslPrelude}
    in vec2 v_st;
    in vec2 v_frame;
    in float v_hw;
    uniform float u_length, u_reveal, u_seed, u_thickness, u_load;
    uniform int u_mode;
    uniform sampler2D u_gradient, u_ground;
    layout(location = 0) out vec4 o_paint;
    layout(location = 1) out vec4 o_relief;
    // A narrow V cut wherever a noise field crosses zero: one dragged hair.
    float groove(float n, float k) { return pow(max(0.0, 1.0 - abs(n)), k); }
    void main() {
      float s = v_st.x, t = v_st.y, hw = max(v_hw, 1.0), L = u_length;
      vec2 sd = vec2(u_seed * 13.7, u_seed * 5.3);
      float tn = t / hw, side = tn < 0.0 ? -1.0 : 1.0;

      // Around a bend every hair runs its own distance. For a hair offset t
      // from the path, that distance grows by (1 - t * curvature) per step,
      // so its travel is s - t * (total turn). Hairs on the inside of the
      // bend crawl and pile paint up; hairs on the outside race and stretch
      // theirs thin. Where the turn is tighter than the offset the brush is
      // pivoting, and those hairs scrub back over paint already laid down.
      float turn = v_frame.x, curve = v_frame.y;
      float stretch = 1.0 - t * curve;
      float pivot = 1.0 - smoothstep(0.06, 0.55, stretch);
      float crowd = 1.0 - smoothstep(0.1, 1.05, stretch);   // how bunched the hairs are here
      float pace = max(abs(stretch), 0.12);
      float pile = clamp(pow(1.0 / pace, 0.55), 0.5, 2.0) * mix(1.0, 0.7, pivot);
      // Paint wicks sideways between the hairs, so the difference in what
      // they hold saturates instead of growing with every degree of the turn;
      // without that a hairpin leaves one half of the brush soaking wet.
      float carried = 1.3 * tanh(turn / 1.3);
      float travelled = max(s - t * carried, 0.0);
      // The ridges a hair leaves belong to the hair, so they shift with it
      // around a bend — but only partly: the paint is standing on the canvas,
      // not riding the brush, so a hard turn skews the grain, it does not
      // shear it into a lattice.
      float grain = s - t * turn * 0.3;

      // the brush lifts over the last half width: narrower, thinner
      float lifting = smoothstep(L - hw * 1.3, L + hw * 0.2, s);
      float lift = 1.0 - lifting;
      float at = abs(tn) / mix(0.8, 1.0, lift);

      // hairs wander a little as the stroke travels
      float drift = 1.6 * noise(vec2(grain * 0.003, 1.7) + sd) + 0.8 * noise(vec2(grain * 0.009, t * 0.012) + sd * 1.1);
      float b = t + drift;
      float clump = noise(vec2(b * 0.022, grain * 0.0012) + sd * 1.3);
      float n1 = noise(vec2(b * 0.06, grain * 0.0012) + sd * 2.1);
      float n2 = noise(vec2(b * 0.14, grain * 0.0025) + sd * 3.3);
      float n2b = noise(vec2(b * 0.11, grain * 0.002) + sd * 5.7);
      float n3 = noise(vec2(b * 0.32, grain * 0.005) + sd * 4.7);
      float n4 = noise(vec2(b * 0.07, grain * 0.004) + sd * 9.1);
      // grooves come in families: broad, two sets of hairs, fine; strong in
      // some bands of the brush and nearly absent where the paint stayed
      // smooth, and each groove fades in and out along its run
      float mask = smoothstep(-0.7, 0.7, clump + 0.6 * n4);
      float run = 0.5 + 0.5 * noise(vec2(b * 0.1 + 40.0, grain * 0.008) + sd);
      float runB = 0.5 + 0.5 * noise(vec2(b * 0.09 + 80.0, grain * 0.007) + sd * 1.7);
      float kA = mix(4.0, 11.0, 0.5 + 0.5 * noise(vec2(b * 0.14 + 120.0, 0.7) + sd));
      float kB = mix(4.0, 11.0, 0.5 + 0.5 * noise(vec2(b * 0.11 + 160.0, 0.3) + sd));
      float grooves = 0.3 * groove(n1, 3.0) * run + 0.55 * groove(n2, kA) * run * mix(0.3, 1.0, mask)
        + 0.45 * groove(n2b, kB) * runB * mix(1.0, 0.4, mask) + 0.15 * groove(n3, 7.0) * mask;
      float undulate = 0.14 * clump + 0.05 * n1 + 0.03 * n2 + 0.015 * noise(vec2(b * 0.5, grain * 0.3) + sd * 2.9);
      // scrubbed ground: the pivoting hairs churn their own grooves away and
      // leave short curved smears instead
      float churn = groove(noise(vec2(b * 0.16, grain * 0.06) + sd * 11.3), 4.0);
      grooves = mix(grooves, 0.35 * churn, pivot);
      undulate = mix(undulate, 0.22 * noise(vec2(b * 0.08, grain * 0.03) + sd * 12.7), pivot * 0.8);

      // irregular edges with stray hairs and a lip of paint pushed aside
      float wander = 0.05 * noise(vec2(grain * 0.012, side * 7.0) + sd) + 0.025 * noise(vec2(grain * 0.04, side * 3.0) + sd);
      float edge = (1.0 + wander) * (1.0 - 0.42 * crowd * crowd);
      float stray = max(0.0, n2) * 0.05 + max(0.0, n3) * 0.03;
      float inside = 1.0 - smoothstep(edge + stray - 0.035 - 0.3 * pivot, edge + stray + 0.01, at);
      float lip = exp(-pow((at - (edge - 0.08)) / 0.09, 2.0)) * (0.6 + 0.4 * noise(vec2(grain * 0.025, side * 11.0) + sd));

      // the landing: a rounded front and a bulge of fresh paint with its own lip
      float bevel = sqrt(max(0.0, 1.0 - at * at * at));
      float front = -hw * (0.06 + 0.24 * bevel) + hw * 0.035 * noise(vec2(t * 0.06, 3.3) + sd);
      float startCov = smoothstep(front - 2.5, front + 1.0, s);
      float landing = 1.0 + 0.3 * exp(-max(0.0, s - front) / (hw * 0.6));
      float frontLip = 0.5 * exp(-pow((s - front - hw * 0.07) / (hw * 0.08), 2.0));

      // paint runs out hair by hair; a dry hair only catches the weave's crests
      float loadB = 0.9 + 0.1 * noise(vec2(b * 0.2, 2.2) + sd * 5.1) - 0.08 * at * at;
      float remaining = loadB * u_load - travelled / L;
      float weave = texelFetch(u_ground, ivec2(gl_FragCoord.xy), 0).a;
      float streak = noise(vec2(b * 0.45, grain * 0.02) + sd * 6.3);
      float deposit = remaining - 0.45 * lifting * lifting - 0.3 * pivot * (0.55 + 0.9 * abs(streak))
        + 0.1 * (weave - 0.6) + (0.12 + 0.2 * lifting) * streak + 0.04 * n3 - 0.06 * grooves;
      float alive = smoothstep(0.0, 0.05, deposit);
      float thin = clamp(remaining * 2.5 + 0.25, 0.15, 1.0) * mix(1.0, 0.35, lifting);

      // the end of the stroke and, while animating, the moving front
      float endEdge = L + hw * (0.35 * bevel + 0.03 * noise(vec2(t * 0.08, 9.1) + sd));
      float endCov = 1.0 - smoothstep(endEdge - 2.0, endEdge + 1.0, s);
      float revealEdge = u_reveal - hw * (0.05 + 0.2 * bevel) + hw * 0.035 * noise(vec2(t * 0.06, 5.1) + sd);
      float revealCov = 1.0 - smoothstep(revealEdge - 1.5, revealEdge + 1.0, s);

      // A hair that is pivoting rather than travelling drags as much paint
      // away as it leaves, whatever it still holds, so the ground it covers
      // comes out in skids with the canvas between them.
      float cov = inside * startCov * endCov * revealCov * alive;
      cov *= mix(1.0, 0.28 + 0.72 * smoothstep(-0.45, 0.45, streak), pivot);
      if (cov < 0.002) discard;

      float unit = u_thickness * (4.0 + hw * 0.08);
      float ridgeAmp = mix(0.6, 1.0, smoothstep(0.0, hw * 0.9, s));
      float slab = 0.8 + undulate - 0.55 * grooves * ridgeAmp;
      float h = max(0.0, unit * thin * pile * (slab * landing + 0.9 * lip + frontLip));

      // each hair drags its own sample of the loaded gradient; streaks of the
      // neighbouring colour cross over, the mixing grows along the stroke, and
      // a pivoting brush smears its load together
      float gpos = u_mode == 0 ? (tn * 0.5 + 0.5) : clamp(travelled / L, 0.0, 1.0);
      float mixing = 0.07 * noise(vec2(b * 0.25, grain * 0.003) + sd * 6.1) + 0.06 * noise(vec2(b * 0.08, grain * 0.002) + sd * 7.3) * (0.3 + 0.7 * travelled / L);
      mixing += 0.22 * pivot * noise(vec2(b * 0.06, grain * 0.02) + sd * 13.1);
      gpos = clamp(gpos + mixing, 0.0, 1.0);
      vec3 pigment = toLinear(texture(u_gradient, vec2(gpos, 0.5)).rgb) * (0.97 + 0.04 * n2);
      float gloss = 0.75 + 0.25 * noise(vec2(b * 0.05, grain * 0.01) + sd * 8.7);

      o_paint = vec4(pigment, cov);
      o_relief = vec4(h, gloss, 0.0, cov);
    }`;

  // Lighting of the combined height field: a warm key light with cast
  // shadows marched across the relief, a cool fill, occlusion in the grooves,
  // and a wet two-lobe specular with a soft window reflection.
  const shadeFragment = `${glslPrelude}
    uniform sampler2D u_paint, u_relief, u_ground;
    uniform vec2 u_size;
    uniform float u_scale;
    uniform vec3 u_light;
    out vec4 o_color;
    const float WEAVE = 0.32;
    float heightAt(ivec2 p) {
      p = clamp(p, ivec2(0), ivec2(u_size) - 1);
      vec4 r = texelFetch(u_relief, p, 0);
      float g = texelFetch(u_ground, p, 0).a * WEAVE;
      return g * (1.0 - 0.9 * smoothstep(0.0, 1.2, r.r)) + r.r;
    }
    float heightAt(vec2 p) { return heightAt(ivec2(floor(p + 0.5))); }
    float ggx(float NdH, float NdL, float NdV, float rough) {
      float a = rough * rough, a2 = a * a;
      float d = NdH * NdH * (a2 - 1.0) + 1.0;
      float D = a2 / (PI * d * d);
      float k = (rough + 1.0) * (rough + 1.0) / 8.0;
      float G = (NdV / (NdV * (1.0 - k) + k)) * (NdL / (NdL * (1.0 - k) + k));
      return D * G / max(4.0 * NdL * NdV, 1e-3);
    }
    vec3 shoulder(vec3 x) { return mix(x, 0.75 + 0.25 * (1.0 - exp(-(x - 0.75) / 0.25)), step(0.75, x)); }
    void main() {
      ivec2 p = ivec2(gl_FragCoord.xy);
      vec2 pf = vec2(p);
      vec4 paint = texelFetch(u_paint, p, 0);
      vec4 relief = texelFetch(u_relief, p, 0);
      vec4 ground = texelFetch(u_ground, p, 0);
      float cov = clamp(paint.a, 0.0, 1.0);
      vec3 pigment = cov > 0.0005 ? paint.rgb / cov : vec3(0.0);
      float gloss = cov > 0.0005 ? clamp(relief.g / cov, 0.0, 1.0) : 0.0;
      vec3 albedo = mix(ground.rgb, pigment, cov);
      float rough = mix(0.72, mix(0.36, 0.17, gloss), cov);

      float h0 = heightAt(p);
      float hl = heightAt(p + ivec2(-1, 0)), hr = heightAt(p + ivec2(1, 0));
      float hd = heightAt(p + ivec2(0, -1)), hu = heightAt(p + ivec2(0, 1));
      vec3 N = normalize(vec3((hl - hr) * u_scale * 0.5, (hd - hu) * u_scale * 0.5, 1.0));

      vec3 L = normalize(u_light);
      vec2 dir = normalize(L.xy);
      float tanE = L.z / max(length(L.xy), 1e-4);
      float occ = 0.0;
      for (int k = 1; k <= 28; k++) {
        float d = float(k) * 1.2;
        occ = max(occ, (heightAt(pf + dir * d * u_scale) - h0 - d * tanE) / (d + 2.0));
      }
      float shadow = 1.0 - smoothstep(0.0, 0.5, occ);

      float ao = 0.0;
      for (int k = 0; k < 8; k++) {
        float a = float(k) * TAU / 8.0;
        vec2 d = vec2(cos(a), sin(a));
        ao += max(0.0, heightAt(pf + d * 2.0 * u_scale) - h0) / 2.0;
        ao += max(0.0, heightAt(pf + d * 6.0 * u_scale) - h0) / 6.0;
      }
      ao = 1.0 - clamp(ao / 16.0 * 1.1, 0.0, 0.6);

      vec3 V = vec3(0.0, 0.0, 1.0);
      vec3 H = normalize(L + V);
      float NdL = max(dot(N, L), 0.0), NdV = max(dot(N, V), 1e-3), NdH = max(dot(N, H), 0.0), VdH = max(dot(V, H), 0.0);
      vec3 key = vec3(1.0, 0.96, 0.9) * 1.15;
      vec3 fillDir = normalize(vec3(-L.xy * 0.6, 1.0));
      vec3 fill = vec3(0.6, 0.66, 0.75) * 0.35 * max(dot(N, fillDir), 0.0);
      vec3 ambient = vec3(0.42, 0.44, 0.48) * ao * (0.6 + 0.4 * N.z);
      vec3 diffuse = albedo * (key * NdL * shadow + fill + ambient);
      float F = 0.04 + 0.96 * pow(1.0 - VdH, 5.0);
      float spec = (ggx(NdH, NdL, NdV, rough) + 0.35 * ggx(NdH, NdL, NdV, 0.55)) * F * NdL;
      vec3 specular = key * shadow * spec;
      float fres = 0.04 + 0.5 * pow(1.0 - NdV, 4.0);
      vec3 env = mix(vec3(0.18, 0.19, 0.21), vec3(0.55, 0.57, 0.6), clamp(N.y * 0.5 + 0.5 + N.x * 0.2, 0.0, 1.0)) * (1.0 - rough) * fres * 2.0 * ao;
      vec3 color = shoulder(diffuse + specular + env);
      color = toSRGB(clamp(color, 0.0, 1.0)) + (hash(pf) - 0.5) / 255.0;
      o_color = vec4(color, 1.0);
    }`;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  function program(vertex, fragment) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const uniforms = {};
    for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) {
      const name = gl.getActiveUniform(p, i).name;
      uniforms[name] = gl.getUniformLocation(p, name);
    }
    return { p, u: uniforms };
  }
  let groundProgram, depositProgram, shadeProgram;

  // ---------------------------------------------------------------- targets
  function texture(w, h, filter = gl.NEAREST) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  let groundTex, paintTex, reliefTex, groundFbo, depositFbo, gradientTex, emptyVao, ribbonVao, ribbonBuffer;
  // Everything the GPU holds is created here so a lost context can be rebuilt.
  function initGL() {
    groundProgram = program(screenVertex, groundFragment);
    depositProgram = program(depositVertex, depositFragment);
    shadeProgram = program(screenVertex, shadeFragment);
    gradientTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, gradientTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    emptyVao = gl.createVertexArray();
    ribbonVao = gl.createVertexArray();
    ribbonBuffer = gl.createBuffer();
    gl.bindVertexArray(ribbonVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, ribbonBuffer);
    for (const [name, size, offset] of [['a_position', 2, 0], ['a_st', 2, 8], ['a_hw', 1, 16], ['a_frame', 2, 20]]) {
      const loc = gl.getAttribLocation(depositProgram.p, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE, offset);
    }
    gl.bindVertexArray(null);
    groundTex = paintTex = reliefTex = groundFbo = depositFbo = null;
    buildGradient();
    fit();
  }

  function buildGradient() {
    const n = 128, data = new Uint8Array(n * 4);
    for (let i = 0; i < n; i++) {
      const rgb = sampleGradient(i / (n - 1));
      for (let k = 0; k < 3; k++) data[i * 4 + k] = Math.round(clamp(linearToSrgb(rgb[k]), 0, 1) * 255);
      data[i * 4 + 3] = 255;
    }
    gl.bindTexture(gl.TEXTURE_2D, gradientTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

  }

  function fit() {
    width = Math.max(1, innerWidth);
    height = Math.max(1, innerHeight);
    // Supersample: at least 2 texels per CSS pixel keeps the wet highlights
    // from shimmering, capped so the largest displays stay within reason.
    scale = clamp(devicePixelRatio || 1, 2, 3);
    scale = Math.max(1, Math.min(scale, Math.sqrt(10e6 / (width * height))));
    texW = Math.round(width * scale);
    texH = Math.round(height * scale);
    canvas.width = texW;
    canvas.height = texH;
    for (const t of [groundTex, paintTex, reliefTex]) if (t) gl.deleteTexture(t);
    for (const f of [groundFbo, depositFbo]) if (f) gl.deleteFramebuffer(f);
    groundTex = texture(texW, texH);
    paintTex = texture(texW, texH);
    reliefTex = texture(texW, texH);
    groundFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, groundFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, groundTex, 0);
    depositFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depositFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, paintTex, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, reliefTex, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('incomplete framebuffer');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    paintGround();
  }

  function paintGround() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, groundFbo);
    gl.viewport(0, 0, texW, texH);
    gl.useProgram(groundProgram.p);
    gl.uniform1f(groundProgram.u.u_scale, scale);
    gl.uniform1f(groundProgram.u.u_seed, seedNumber(seed));
    gl.bindVertexArray(emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // ---------------------------------------------------------------- the path
  function mulberry(a) {
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function lattice(seedValue) {
    const r = mulberry(seedValue), v = Float32Array.from({ length: 256 }, () => r() * 2 - 1);
    return x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return v[i & 255] * (1 - u) + v[i + 1 & 255] * u; };
  }
  // Centripetal Catmull-Rom through the control points, sampled every ~2 px,
  // then nudged by a slow hand tremor so even a two-point stroke is not ruled.
  function samplePath() {
    const pts = state.points.map(p => ({ x: p.x * width, y: p.y * height, pressure: p.pressure }));
    if (pts.length < 2) pts.push({ x: pts[0].x + 1, y: pts[0].y, pressure: pts[0].pressure });
    const n = pts.length;
    const at = i => i < 0 ? { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y }
      : i >= n ? { x: 2 * pts[n - 1].x - pts[n - 2].x, y: 2 * pts[n - 1].y - pts[n - 2].y } : pts[i];
    const knot = (a, b) => Math.max(1e-3, Math.sqrt(Math.hypot(b.x - a.x, b.y - a.y)));
    const out = [];
    for (let i = 0; i < n - 1; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      const t0 = 0, t1 = knot(p0, p1), t2 = t1 + knot(p1, p2), t3 = t2 + knot(p2, p3);
      const steps = Math.max(2, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 2));
      for (let k = 0; k < steps; k++) {
        const u = k / steps, t = t1 + (t2 - t1) * u;
        const lerp = (a, b, ta, tb) => { const w = (t - ta) / (tb - ta); return { x: a.x + (b.x - a.x) * w, y: a.y + (b.y - a.y) * w }; };
        const A1 = lerp(p0, p1, t0, t1), A2 = lerp(p1, p2, t1, t2), A3 = lerp(p2, p3, t2, t3);
        const B1 = lerp(A1, A2, t0, t2), B2 = lerp(A2, A3, t1, t3);
        const C = lerp(B1, B2, t1, t2);
        out.push({ x: C.x, y: C.y, pressure: p1.pressure + (p2.pressure - p1.pressure) * u, u: i + u });
      }
    }
    const last = pts[n - 1];
    out.push({ x: last.x, y: last.y, pressure: last.pressure, u: n - 1 });
    measure(out);
    const tremor = lattice(seedNumber(seed) * 1000 | 0);
    for (const q of out) {
      const w = 2.2 * tremor(q.s / 140) + 0.9 * tremor(q.s / 45 + 100);
      q.x += q.nx * w; q.y += q.ny * w;
    }
    measure(out);
    return out;
  }
  function measure(out) {
    let s = 0;
    for (let i = 0; i < out.length; i++) {
      if (i) s += Math.hypot(out[i].x - out[i - 1].x, out[i].y - out[i - 1].y);
      out[i].s = s;
    }
    for (let i = 0; i < out.length; i++) {
      const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)];
      let tx = b.x - a.x, ty = b.y - a.y;
      const len = Math.hypot(tx, ty) || 1;
      tx /= len; ty /= len;
      out[i].tx = tx; out[i].ty = ty; out[i].nx = -ty; out[i].ny = tx;
    }
    // Cumulative turn, unwrapped, and the curvature that goes with it. The
    // shader needs both: the turn tells each hair how far it has run, the
    // curvature how fast it is running just here.
    out[0].turn = 0;
    for (let i = 1; i < out.length; i++) {
      const p = out[i - 1], q = out[i];
      let d = Math.atan2(p.tx * q.ty - p.ty * q.tx, p.tx * q.tx + p.ty * q.ty);
      q.turn = p.turn + d;
    }
    // Curvature over a short span, so the hand tremor does not read as one.
    const span = 3;
    for (let i = 0; i < out.length; i++) {
      const a = out[Math.max(0, i - span)], b = out[Math.min(out.length - 1, i + span)];
      out[i].curve = (b.turn - a.turn) / Math.max(b.s - a.s, 1e-3);
    }
  }
  // The paint surface is a ribbon of the brush's offsets. Around a bend no
  // offset may reach past the centre of curvature: beyond it the ribbon folds
  // through itself and the stroke frame turns inside out. Rather than cut the
  // ribbon there, the inside of it is squeezed — the offsets crowd toward the
  // pivot and never reach it, which is what the inner hairs of a turning brush
  // actually do. The shader is told the true offset, so it knows those hairs
  // are bunched and piles their paint up accordingly. The ribbon is drawn in
  // columns across its width so this squeeze stays accurate between its edges.
  const FOLD = 0.8, COLUMNS = 12;
  function buildRibbon() {
    samples = samplePath();
    length = samples[samples.length - 1].s;
    const first = samples[0], last = samples[samples.length - 1];
    const halfWidth = q => state.width / 2 * q.pressure;
    const rows = [];
    const row = (q, x, y, s, curve) => ({ x, y, s, curve, tx: q.tx, ty: q.ty, nx: q.nx, ny: q.ny, hw: halfWidth(q), turn: q.turn });
    // room before the landing and after the lift, along the end tangents
    for (let d = Math.ceil(0.5 * halfWidth(first)); d > 0; d -= 2) rows.push(row(first, first.x - first.tx * d, first.y - first.ty * d, -d, 0));
    for (const q of samples) rows.push(row(q, q.x, q.y, q.s, q.curve));
    for (let d = 2; d <= 0.4 * halfWidth(last) + 2; d += 2) rows.push(row(last, last.x + last.tx * d, last.y + last.ty * d, last.s + d, 0));

    // Where the offset would cross the centre of curvature it is eased onto
    // it instead; the far side of the brush is left alone.
    const squeeze = (r, t) => {
      if (!r.curve) return t;
      const limit = FOLD / r.curve;
      if (limit > 0 ? t <= 0 : t >= 0) return t;
      return limit * Math.tanh(t / limit);
    };
    const data = new Float32Array(COLUMNS * rows.length * 2 * (STRIDE / 4));
    let at = 0;
    for (let c = 0; c < COLUMNS; c++) {
      for (const r of rows) {
        const ext = r.hw * 1.45 + 6;
        for (const edge of [c, c + 1]) {
          const t = ext * (2 * edge / COLUMNS - 1), g = squeeze(r, t);
          data.set([r.x + r.nx * g, r.y + r.ny * g, r.s, t, r.hw, r.turn, r.curve], at);
          at += STRIDE / 4;
        }
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, ribbonBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    ribbon = { columns: COLUMNS, stride: rows.length * 2 };
  }

  // ---------------------------------------------------------------- render
  function render() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, depositFbo);
    gl.viewport(0, 0, texW, texH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const [index, stroke] of composition().entries()) {
    state.points = stroke.points; state.width = stroke.width;
    state.stops = stroke.colors.map((color, i, colors) => ({ color, at: i / (colors.length - 1) }));
    state.thickness = stroke.thickness; state.load = stroke.load;
    gl.activeTexture(gl.TEXTURE0);
    buildGradient(); buildRibbon();
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(depositProgram.p);
    gl.uniform2f(depositProgram.u.u_size, width, height);
    gl.uniform1f(depositProgram.u.u_length, Math.max(length, 1));
    gl.uniform1f(depositProgram.u.u_reveal, Number.isFinite(reveal) ? reveal : length + state.width * 2);
    gl.uniform1f(depositProgram.u.u_seed, seedNumber(seed + index));
    gl.uniform1f(depositProgram.u.u_thickness, state.thickness);
    gl.uniform1f(depositProgram.u.u_load, state.load);
    gl.uniform1i(depositProgram.u.u_mode, state.mode === 'across' ? 0 : 1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, gradientTex); gl.uniform1i(depositProgram.u.u_gradient, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, groundTex); gl.uniform1i(depositProgram.u.u_ground, 1);
    gl.bindVertexArray(ribbonVao);
    for (let c = 0; c < ribbon.columns; c++) gl.drawArrays(gl.TRIANGLE_STRIP, c * ribbon.stride, ribbon.stride);
    gl.disable(gl.BLEND);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, texW, texH);
    gl.useProgram(shadeProgram.p);
    gl.uniform2f(shadeProgram.u.u_size, texW, texH);
    gl.uniform1f(shadeProgram.u.u_scale, scale);
    const azimuth = state.light * Math.PI / 180, elevation = 28 * Math.PI / 180;
    gl.uniform3f(shadeProgram.u.u_light, Math.cos(azimuth) * Math.cos(elevation), -Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation));
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, paintTex); gl.uniform1i(shadeProgram.u.u_paint, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, reliefTex); gl.uniform1i(shadeProgram.u.u_relief, 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, groundTex); gl.uniform1i(shadeProgram.u.u_ground, 2);
    gl.bindVertexArray(emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // The painting is composed in a 1200 × 800 studio space. Fit the whole
  // landscape on portrait screens rather than cropping the mountain.
  function composition() {
    const unit = Math.min(width / 1200, height / 800);
    const ox = (width - 1200 * unit) / 2, oy = (height - 800 * unit) / 2;
    const marks = [];
    const random = mulberry(Math.floor(seedNumber(seed) * 10000));
    const stroke = (points, brush, colors, thickness = 0.85, load = 2.2) => marks.push({
      points: points.map(([x, y, pressure = 1]) => ({ x: (ox + x * unit) / width, y: (oy + y * unit) / height, pressure })),
      width: brush * unit, colors, thickness, load
    });
    // Every mark is a short bent ribbon. No broad base fills or long strokes:
    // the image is built entirely from overlapping, individually loaded dabs.
    const pick = palette => palette[Math.floor(random()*palette.length)];
    const dab = (x,y,angle,len,brush,colors,bend=0.22,thickness=0.85) => {
      const points=[];
      for(let k=0;k<5;k++) {
        const t=k/4, along=(t-0.5)*len, across=Math.sin(t*Math.PI)*len*bend;
        points.push([x+Math.cos(angle)*along-Math.sin(angle)*across,
          y+Math.sin(angle)*along+Math.cos(angle)*across, [0.65,1,1,0.85,0.4][k]]);
      }
      stroke(points,brush,colors,thickness,1.75);
    };
    const sky=[['#193f74','#386fa1','#639cbd'],['#234781','#487eae','#92b6c6'],
      ['#234f85','#638faa','#b9c9c5'],['#183b70','#30699b','#73a6ba']];
    const gold=[['#b7822d','#e6bd54','#f9df8c'],['#cc9d39','#f0ce68','#fff0b2']];
    // A flowing field curls around two eddies. Staggered rows are jittered so
    // the short marks knit together instead of forming a ruled grid.
    for(let row=0;row<26;row++) for(let col=0;col<37;col++) {
      const x=104+col*27+(row%2)*13+random()*12, y=99+row*16+random()*10;
      const dx=x-822,dy=(y-227)*1.3;
      const swirl=Math.atan2(dy,dx)+Math.PI/2;
      const weight=Math.exp(-(dx*dx+dy*dy)/95000);
      const wave=0.24*Math.sin(x/85+y/65);
      const angle=wave*(1-weight)+swirl*weight;
      dab(x,y,angle,33+random()*20,17+random()*5,pick(sky),0.16+random()*0.17,0.7);
    }
    // Broken golden curls orbit the sun; each arc remains a separate short mark.
    for(let ring=0;ring<4;ring++) {
      const radius=63+ring*20, count=Math.round(radius/4);
      for(let i=0;i<count;i++) {
        const angle=i/count*Math.PI*2;
        if(ring>1 && random()<0.3) continue;
        dab(848+Math.cos(angle)*radius,211+Math.sin(angle)*radius*0.73,
          Math.atan2(Math.cos(angle)*0.73,-Math.sin(angle)),23+random()*14,8+random()*4,
          ring<2?pick(gold):['#548d9f','#9ebbad','#ddd5a0'],0.22,0.95);
      }
    }
    for(let radius=4;radius<49;radius+=10) {
      const count=Math.max(4,Math.round(radius/3));
      for(let i=0;i<count;i++) {
        const angle=i/count*Math.PI*2;
        dab(848+Math.cos(angle)*radius,211+Math.sin(angle)*radius,
          angle+Math.PI/2,18+random()*10,13,pick(gold),0.3,1.15);
      }
    }
    const mountain=[['#183665','#365794','#6686b0'],['#284773','#4b72a4','#86a8bf'],
      ['#283862','#555988','#9293ad'],['#174b72','#327698','#71a3b2']];
    const snow=[['#8ba7b9','#d9dfd4','#fff0b6'],['#7598b8','#c1d3d4','#f6eed0'],
      ['#9eaebf','#e9e7d5','#fff5d6']];
    // Dense little hooks follow the slope. An irregular snow line leaves blue
    // gullies rather than laying a continuous white cap over the mountain.
    for(let y=292;y<537;y+=12) {
      const v=(y-287)/250, left=572-v*337, right=627+v*354;
      for(let x=left+7;x<right;x+=15) {
        const px=x+random()*7, py=y+random()*7;
        const direction=Math.atan2(250,(px-601)*2.4);
        const snowLine=350+18*Math.sin(px*0.095)+9*Math.sin(px*0.21);
        const colors=py<snowLine?pick(snow):pick(mountain);
        dab(px,py,direction,24+random()*17,13+random()*5,colors,
          (px<600?1:-1)*(0.12+random()*0.14),1.05);
      }
    }
    const hills=[['#173d48','#366663','#759078'],['#244550','#4b7775','#91a089'],
      ['#253b56','#3b657b','#73989b']];
    for(let row=0;row<5;row++) for(let col=0;col<46;col++) {
      const x=102+col*22+random()*10;
      const y=514+row*12-17*Math.sin(x/96)+random()*7;
      dab(x,y,-0.17*Math.cos(x/96),25+random()*13,17,pick(hills),0.27,0.95);
    }
    const lake=[['#1d506b','#3e849c','#8ab7be'],['#275a7b','#669bb5','#b1c7ca'],
      ['#24477d','#4a7faa','#91b0c8'],['#286476','#65a2ac','#b4cec2']];
    for(let row=0;row<12;row++) for(let col=0;col<32;col++) {
      const x=105+col*31+(row%2)*12+random()*10, y=564+row*13+random()*8;
      const reflection=Math.abs(x-850)<(19+(y-564)*0.24) && random()<0.65;
      dab(x,y,0.12*Math.sin(x/65+y/35),30+random()*20,14+random()*5,
        reflection?pick(gold):pick(lake),(random()<0.5?-1:1)*(0.17+random()*0.14),0.9);
    }
    const grasses=[['#283f37','#5b743e','#9ca15a'],['#354b3c','#809059','#c5b96c'],
      ['#3e543f','#8a9b62','#ddc986']];
    for(let i=0;i<145;i++) {
      const left=i<95, x=left?102+random()*267:902+random()*192;
      const y=702+random()*30-15*Math.sin(x/80);
      dab(x,y,-1.15+random()*0.8,22+random()*27,8+random()*7,pick(grasses),0.2+random()*0.2,1.05);
    }
    return marks;
  }
  function save() {
    canvas.toBlob(blob => {
      if (!blob) return;
      const url=URL.createObjectURL(blob), link=document.createElement('a');
      link.href=url; link.download=`mount-fuji-${seed}.png`; link.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
  }
  $('save').addEventListener('click',save);
  addEventListener('keydown',event=>{
    if (event.key.toLowerCase()==='s' && !event.ctrlKey && !event.metaKey) {event.preventDefault();save();}
  });
  let resizeTimer;
  addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{fit();render();},150);
  });
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();});
  canvas.addEventListener('webglcontextrestored',()=>{initGL();render();});
  try { initGL(); render(); document.body.dataset.ready='true'; }
  catch (error) { $('fallback').hidden=false; canvas.hidden=true; $('palette').hidden=true; console.error(error); }
})();
