(() => {
  'use strict';

  const canvas = document.getElementById('stage');
  const panel = document.querySelector('.water-panel');
  const panelHeader = panel.querySelector('.panel-header');
  const collapseButton = document.getElementById('collapse-panel');
  const reseedButton = document.getElementById('reseed');
  const bathNumber = document.getElementById('bath-number');
  const status = document.getElementById('status');
  const paletteSelect = document.getElementById('palette');
  const pageParams = new URLSearchParams(location.search);
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

  const controls = {
    tempo: document.getElementById('tempo'),
    dropSize: document.getElementById('drop-size'),
    sizeVariation: document.getElementById('size-variation'),
    repulsion: document.getElementById('repulsion')
  };

  const MAX_EDDIES = 12;
  const MAX_CANVAS_PIXELS = 2600000;
  const PALETTES = [
    ['#173e59', '#47758a', '#86a7ae', '#d3dfdc', '#f0eee4', '#9a6654', '#597965', '#b59455'],
    ['#10385f', '#315f87', '#7497b1', '#afc3cf', '#d9e2e2', '#2e7975', '#79606b', '#a28651'],
    ['#213f4f', '#52756f', '#96aaa0', '#d8ddd1', '#ece9da', '#75576f', '#9b7156', '#5b7f85'],
    ['#182f4a', '#496b88', '#98adbd', '#d7dddc', '#ebe8df', '#8d554b', '#707a5d', '#a58250'],
    ['#153f52', '#3c7380', '#7da2a8', '#c1d2cf', '#e2e7df', '#a26c61', '#887f5e', '#586d83'],
    ['#2e3d43', '#5b716e', '#9baba2', '#d8d9cd', '#ebe6d7', '#895a48', '#92713f', '#536a5b']
  ];

  const VERTEX_SHADER = `
    attribute vec2 a_position;
    varying vec2 v_uv;

    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `
    precision highp float;

    #define MAX_EDDIES 12

    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_seed;
    uniform float u_flow;
    uniform int u_eddy_count;
    uniform vec4 u_eddies[MAX_EDDIES];
    uniform vec3 u_color_0;
    uniform vec3 u_color_1;
    uniform vec3 u_color_2;
    uniform vec3 u_color_3;
    uniform vec3 u_color_4;
    uniform vec3 u_accent_0;
    uniform vec3 u_accent_1;
    uniform vec3 u_accent_2;

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32 + u_seed * 0.013);
      return fract(p.x * p.y);
    }

    float noise2(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
        mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      mat2 turn = mat2(0.80, 0.60, -0.60, 0.80);
      for (int octave = 0; octave < 4; octave++) {
        value += amplitude * noise2(p);
        p = turn * p * 2.03 + vec2(9.17, 3.41);
        amplitude *= 0.5;
      }
      return value;
    }

    vec2 rotateAround(vec2 p, vec2 center, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      vec2 d = p - center;
      return center + vec2(d.x * c - d.y * s, d.x * s + d.y * c);
    }

    vec2 softVortex(vec2 p, vec2 center, float radius, float strength) {
      vec2 d = p - center;
      float influence = exp(-dot(d, d) / max(0.001, radius * radius));
      return rotateAround(p, center, strength * influence);
    }

    vec3 blueBands(float t) {
      vec3 color = u_color_0;
      color = mix(color, u_color_1, smoothstep(0.10, 0.135, t));
      color = mix(color, u_color_2, smoothstep(0.235, 0.285, t));
      color = mix(color, u_color_3, smoothstep(0.43, 0.49, t));
      color = mix(color, u_color_4, smoothstep(0.60, 0.655, t));
      color = mix(color, u_color_2, smoothstep(0.77, 0.815, t));
      color = mix(color, u_color_1, smoothstep(0.885, 0.925, t));
      color = mix(color, u_color_0, smoothstep(0.965, 0.992, t));
      return color;
    }

    float fineVein(float phase, float position, float width) {
      float distanceToVein = abs(fract(phase) - position);
      return 1.0 - smoothstep(width, width * 2.4, distanceToVein);
    }

    void main() {
      float aspect = u_resolution.x / max(1.0, u_resolution.y);
      vec2 p = (v_uv - 0.5) * vec2(aspect, 1.0) * 2.0;
      vec2 original = p;
      float seedPhase = u_seed * 0.071;

      for (int index = 0; index < MAX_EDDIES; index++) {
        float active = 1.0 - step(float(u_eddy_count), float(index));
        vec4 eddy = u_eddies[index];
        vec2 center = (eddy.xy - 0.5) * vec2(aspect, 1.0) * 2.0;
        p = softVortex(
          p,
          center,
          max(0.025, eddy.z * 2.0),
          eddy.w * active * u_flow
        );
      }

      float drift = u_time * 0.012;
      p = softVortex(
        p,
        vec2(-0.48 * aspect + sin(seedPhase) * 0.12, 0.17),
        0.92,
        0.72 + sin(seedPhase * 1.7) * 0.09
      );
      p = softVortex(
        p,
        vec2(0.43 * aspect, -0.34 + cos(seedPhase) * 0.08),
        0.78,
        -0.60
      );
      p = softVortex(
        p,
        vec2(0.25 * aspect, 0.65),
        0.57,
        0.34
      );
      p = softVortex(
        p,
        vec2(0.08 * aspect, 0.34),
        0.88,
        -0.46
      );

      float broadA = fbm(p * 0.54 + vec2(seedPhase, drift));
      float broadB = fbm(p * 0.72 + vec2(6.4 - drift, seedPhase * 0.4));
      vec2 q = p;
      q += vec2(broadA - 0.5, broadB - 0.5) * vec2(0.54, 0.38);
      q.x += sin(q.y * 1.34 + broadB * 2.3 + seedPhase) * 0.38;
      q.y += sin(q.x * 0.84 - broadA * 1.8 - seedPhase * 0.37) * 0.15;

      float broadField = q.x * 0.59 + q.y * 0.27;
      broadField += sin(q.y * 1.62 + seedPhase * 0.53) * 0.31;
      broadField += sin(q.x * 0.78 - q.y * 0.31 - seedPhase * 0.24) * 0.19;
      broadField += (broadA - 0.5) * 0.82;
      broadField += (broadB - 0.5) * 0.36;
      broadField += (noise2(q * 2.35 + vec2(1.8, seedPhase)) - 0.5) * 0.17;

      float phase = broadField * 2.08;
      phase += (noise2(q * 8.4 + vec2(seedPhase, 5.1)) - 0.5) * 0.038;
      float band = fract(phase);
      vec3 color = blueBands(band);

      float ribbonDetail = phase * 4.25 + noise2(q * 4.0 + seedPhase) * 0.22;
      float darkThread = fineVein(ribbonDetail, 0.16, 0.010);
      float paleThread = fineVein(ribbonDetail, 0.54, 0.013);
      color = mix(color, u_color_0, darkThread * 0.27);
      color = mix(color, u_color_4, paleThread * 0.21);

      vec2 accentPoint = vec2(0.68, 0.17);
      vec2 accentDelta = (v_uv - accentPoint) * vec2(1.05, 2.85);
      float accentShape = length(accentDelta);
      accentShape += (noise2(v_uv * 4.2 + seedPhase) - 0.5) * 0.16;
      float accentMask = smoothstep(0.58, 0.18, accentShape);
      float accentPhase = phase * 7.4 + noise2(q * 5.2 + vec2(4.0, seedPhase)) * 0.34;
      float tealVein = fineVein(accentPhase, 0.18, 0.017);
      float plumVein = fineVein(accentPhase, 0.43, 0.013);
      float ochreVein = fineVein(accentPhase, 0.70, 0.019);
      color = mix(color, u_accent_0, tealVein * accentMask * 0.92);
      color = mix(color, u_accent_1, plumVein * accentMask * 0.88);
      color = mix(color, u_accent_2, ochreVein * accentMask * 0.86);

      float pigmentCloud = noise2(q * 7.2 + vec2(seedPhase, -seedPhase)) - 0.5;
      color += pigmentCloud * vec3(0.045, 0.052, 0.056);

      vec2 fleckCell = floor(gl_FragCoord.xy / 9.0);
      vec2 fleckLocal = fract(gl_FragCoord.xy / 9.0);
      float fleckChance = step(0.982, hash21(fleckCell + 19.0));
      vec2 fleckCenter = vec2(
        hash21(fleckCell + 2.3),
        hash21(fleckCell + 8.1)
      );
      float fleck = (1.0 - smoothstep(0.035, 0.15, length(fleckLocal - fleckCenter))) * fleckChance;
      float fleckTone = step(0.42, hash21(fleckCell + 31.0));
      color = mix(color, mix(u_color_0, u_color_4, fleckTone), fleck * 0.28);

      float grain = hash21(gl_FragCoord.xy + original * 17.0) - 0.5;
      color += grain * 0.024;
      color = clamp(color, 0.0, 1.0);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let seed = seedFromLocation();
  let random = mulberry32(seed);
  let bathRevision = 0;
  let eddies = [];
  let nextEddyAt = 0;
  let elapsedTime = 0;
  let lastFrameAt = 0;
  let lastPaintAt = 0;
  let paused = motionPreference.matches;
  let dirty = true;
  let panelDrag = null;
  let resizeTimer = 0;

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance'
  });
  const renderer = gl ? createWebGLRenderer(gl) : createCanvasFallback();

  if (pageParams.get('panel') === '0') {
    document.body.classList.add('no-panel');
  }

  bindControls();
  bindPanel();
  updatePanel();
  resetBath();
  if (renderer.animated) requestAnimationFrame(tick);

  addEventListener('resize', onResize, { passive: true });
  addEventListener('keydown', onKeyDown);
  canvas.addEventListener('pointerdown', onBathPointer);
  reseedButton.addEventListener('click', reseed);
  motionPreference.addEventListener('change', onMotionPreference);

  function createWebGLRenderer(context) {
    const vertexShader = compileShader(context, context.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(context, context.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = context.createProgram();
    context.attachShader(program, vertexShader);
    context.attachShader(program, fragmentShader);
    context.linkProgram(program);

    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      throw new Error(`Unable to link the marbling shader: ${context.getProgramInfoLog(program)}`);
    }

    const buffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      context.STATIC_DRAW
    );

    const position = context.getAttribLocation(program, 'a_position');
    const uniforms = {
      resolution: context.getUniformLocation(program, 'u_resolution'),
      time: context.getUniformLocation(program, 'u_time'),
      seed: context.getUniformLocation(program, 'u_seed'),
      flow: context.getUniformLocation(program, 'u_flow'),
      eddyCount: context.getUniformLocation(program, 'u_eddy_count'),
      eddies: context.getUniformLocation(program, 'u_eddies[0]'),
      colors: Array.from({ length: 5 }, (_, index) =>
        context.getUniformLocation(program, `u_color_${index}`)
      ),
      accents: Array.from({ length: 3 }, (_, index) =>
        context.getUniformLocation(program, `u_accent_${index}`)
      )
    };
    const packedEddies = new Float32Array(MAX_EDDIES * 4);

    return {
      animated: true,
      resize() {
        context.viewport(0, 0, canvas.width, canvas.height);
      },
      render() {
        context.useProgram(program);
        context.bindBuffer(context.ARRAY_BUFFER, buffer);
        context.enableVertexAttribArray(position);
        context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

        packEddies(packedEddies);
        context.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        context.uniform1f(uniforms.time, elapsedTime);
        context.uniform1f(uniforms.seed, (seed % 100000) / 997.0);
        context.uniform1f(uniforms.flow, Number(controls.repulsion.value) / 100);
        context.uniform1i(uniforms.eddyCount, Math.min(eddies.length, MAX_EDDIES));
        context.uniform4fv(uniforms.eddies, packedEddies);

        const palette = currentPalette();
        for (let index = 0; index < 5; index++) {
          context.uniform3fv(uniforms.colors[index], palette[index]);
        }
        for (let index = 0; index < 3; index++) {
          context.uniform3fv(uniforms.accents[index], palette[index + 5]);
        }

        context.drawArrays(context.TRIANGLES, 0, 6);
      }
    };
  }

  function createCanvasFallback() {
    const context = canvas.getContext('2d', { alpha: false });
    const field = document.createElement('canvas');
    const fieldContext = field.getContext('2d', { alpha: false });

    return {
      animated: false,
      resize() {},
      render() {
        const sampleWidth = Math.min(360, Math.max(180, Math.round(width * 0.36)));
        const sampleHeight = Math.max(180, Math.round(sampleWidth * height / Math.max(1, width)));
        field.width = sampleWidth;
        field.height = sampleHeight;
        const image = fieldContext.createImageData(sampleWidth, sampleHeight);
        const palette = currentPalette();

        for (let y = 0; y < sampleHeight; y++) {
          for (let x = 0; x < sampleWidth; x++) {
            const u = x / Math.max(1, sampleWidth - 1);
            const v = 1 - y / Math.max(1, sampleHeight - 1);
            const aspect = width / Math.max(1, height);
            let px = (u - 0.5) * aspect * 2;
            let py = (v - 0.5) * 2;
            const sweep = Math.sin(py * 1.45 + seed * 0.0001) * 0.34;
            px += sweep + cpuFbm(px * 0.75, py * 0.75) * 0.42;
            py += Math.sin(px * 0.92) * 0.12;
            const phase = (px * 0.72 + py * 0.12 + cpuFbm(px * 1.7, py * 1.7) * 0.78) * 2.08;
            const band = phase - Math.floor(phase);
            let color = sampleBluePalette(palette, band);
            const accentDistance = Math.hypot((u - 0.68) * 1.05, (v - 0.17) * 2.85);
            if (accentDistance < 0.48) {
              const accentBand = phase * 7.4 - Math.floor(phase * 7.4);
              if (Math.abs(accentBand - 0.18) < 0.018) color = palette[5];
              if (Math.abs(accentBand - 0.43) < 0.014) color = palette[6];
              if (Math.abs(accentBand - 0.70) < 0.02) color = palette[7];
            }
            const grain = (cpuHash(x, y) - 0.5) * 7;
            const offset = (y * sampleWidth + x) * 4;
            image.data[offset] = clamp(Math.round(color[0] * 255 + grain), 0, 255);
            image.data[offset + 1] = clamp(Math.round(color[1] * 255 + grain), 0, 255);
            image.data[offset + 2] = clamp(Math.round(color[2] * 255 + grain), 0, 255);
            image.data[offset + 3] = 255;
          }
        }

        fieldContext.putImageData(image, 0, 0);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(field, 0, 0, canvas.width, canvas.height);
      }
    };
  }

  function compileShader(context, type, source) {
    const shader = context.createShader(type);
    context.shaderSource(shader, source);
    context.compileShader(shader);
    if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
      throw new Error(`Unable to compile the marbling shader: ${context.getShaderInfoLog(shader)}`);
    }
    return shader;
  }

  function resetBath() {
    random = mulberry32(seed);
    elapsedTime = 0;
    lastFrameAt = 0;
    lastPaintAt = 0;
    eddies = [];
    bathRevision = 0;
    resizeCanvas();
    seedComposition();
    nextEddyAt = performance.now() + nextEddyDelay() * 0.8;
    invalidate();
    updateBathNumber();
  }

  function seedComposition() {
    const count = 3 + Math.floor(random() * 3);
    for (let index = 0; index < count; index++) {
      const lowerCurrent = index === 0;
      eddies.push({
        x: lowerCurrent ? 0.63 + random() * 0.12 : 0.12 + random() * 0.76,
        y: lowerCurrent ? 0.12 + random() * 0.16 : 0.12 + random() * 0.76,
        radius: lowerCurrent ? 0.19 + random() * 0.05 : 0.11 + random() * 0.09,
        strength: (random() < 0.5 ? -1 : 1) * (0.20 + random() * 0.22),
        born: -3,
        lifetime: Infinity,
        permanent: true
      });
    }
  }

  function resizeCanvas() {
    width = Math.max(1, innerWidth);
    height = Math.max(1, innerHeight);
    const pixelRatio = devicePixelRatio || 1;
    const budgetRatio = Math.sqrt(MAX_CANVAS_PIXELS / (width * height));
    dpr = Math.min(2, pixelRatio, Math.max(1, budgetRatio));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    renderer.resize();
  }

  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeTimer = 0;
      resizeCanvas();
      invalidate();
    }, 120);
  }

  function tick(time) {
    if (!lastFrameAt) lastFrameAt = time;
    const delta = Math.min(0.05, Math.max(0, (time - lastFrameAt) / 1000));
    lastFrameAt = time;

    if (!paused && renderer.animated) {
      elapsedTime += delta;
      if (time >= nextEddyAt) addAutomaticEddy(time);
      pruneEddies();
      if (time - lastPaintAt >= 1000 / 30) dirty = true;
    }

    if (dirty) {
      renderer.render();
      dirty = false;
      lastPaintAt = time;
    }
    if (renderer.animated) requestAnimationFrame(tick);
  }

  function addAutomaticEddy(time) {
    const variation = Number(controls.sizeVariation.value) / 100;
    const baseRadius = 0.065 + Number(controls.dropSize.value) / 1000;
    const scale = 1 + (random() * 2 - 1) * variation * 0.58;
    addEddy(
      0.07 + random() * 0.86,
      0.07 + random() * 0.86,
      clamp(baseRadius * scale, 0.055, 0.22),
      (random() < 0.5 ? -1 : 1) * (0.24 + random() * 0.30),
      false
    );
    nextEddyAt = time + nextEddyDelay();
  }

  function addEddy(x, y, radius, strength, manual) {
    if (eddies.length >= MAX_EDDIES) {
      const oldestTransient = eddies.findIndex((eddy) => !eddy.permanent);
      if (oldestTransient >= 0) eddies.splice(oldestTransient, 1);
    }

    eddies.push({
      x,
      y,
      radius,
      strength,
      born: paused ? elapsedTime - 1.4 : elapsedTime,
      lifetime: paused ? Infinity : manual ? 28 : 22,
      permanent: paused
    });
    bathRevision++;
    updateBathNumber();
    invalidate();
  }

  function packEddies(target) {
    target.fill(0);
    eddies.slice(0, MAX_EDDIES).forEach((eddy, index) => {
      const age = Math.max(0, elapsedTime - eddy.born);
      const attack = eddy.permanent ? 1 : smoothstep(0, 1.35, age);
      const release = eddy.permanent
        ? 1
        : 1 - smoothstep(eddy.lifetime * 0.62, eddy.lifetime, age);
      const offset = index * 4;
      target[offset] = eddy.x;
      target[offset + 1] = eddy.y;
      target[offset + 2] = eddy.radius;
      target[offset + 3] = eddy.strength * attack * release;
    });
  }

  function pruneEddies() {
    eddies = eddies.filter((eddy) =>
      eddy.permanent || elapsedTime - eddy.born <= eddy.lifetime
    );
  }

  function nextEddyDelay() {
    const interval = 60000 / Number(controls.tempo.value);
    return interval * (0.72 + random() * 0.72) * (random() < 0.12 ? 1.8 : 1);
  }

  function onBathPointer(event) {
    canvas.focus({ preventScroll: true });
    const rect = canvas.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0.02, 0.98);
    const y = clamp(1 - (event.clientY - rect.top) / Math.max(1, rect.height), 0.02, 0.98);
    const variation = Number(controls.sizeVariation.value) / 100;
    const radius = (0.065 + Number(controls.dropSize.value) / 1000) *
      (1 + (random() * 2 - 1) * variation * 0.45);
    addEddy(
      x,
      y,
      clamp(radius, 0.055, 0.22),
      (random() < 0.5 ? -1 : 1) * (0.42 + random() * 0.26),
      true
    );
    status.textContent = 'A new eddy is bending the mineral current.';
  }

  function bindControls() {
    Object.values(controls).forEach((control) => {
      control.addEventListener('input', () => {
        updatePanel();
        invalidate();
      });
    });
    paletteSelect.addEventListener('change', () => {
      updatePanel();
      invalidate();
      status.textContent = `${paletteSelect.selectedOptions[0].textContent} pigments loaded.`;
    });
  }

  function updatePanel() {
    updateRange(controls.tempo, `${controls.tempo.value}/min`);
    updateRange(controls.dropSize, `${(Number(controls.dropSize.value) / 10).toFixed(1)}%`);
    updateRange(controls.sizeVariation, `${controls.sizeVariation.value}%`);
    updateRange(controls.repulsion, `${controls.repulsion.value}%`);
    updateBathNumber();
  }

  function updateRange(input, text) {
    const row = input.closest('.range-row');
    const min = Number(input.min);
    const max = Number(input.max);
    const progress = ((Number(input.value) - min) / (max - min)) * 100;
    row.style.setProperty('--progress', `${progress}%`);
    const output = row.querySelector('output');
    output.value = text;
    output.textContent = text;
  }

  function updateBathNumber() {
    bathNumber.textContent =
      `BATH ${String(seed % 10000).padStart(4, '0')}` +
      ` · EDDIES ${String(bathRevision).padStart(3, '0')}`;
  }

  function bindPanel() {
    collapseButton.addEventListener('click', () => {
      const collapsed = panel.classList.toggle('is-collapsed');
      collapseButton.setAttribute('aria-expanded', String(!collapsed));
      collapseButton.setAttribute(
        'aria-label',
        collapsed ? 'Expand marbling controls' : 'Collapse marbling controls'
      );
      collapseButton.title = collapsed ? 'Expand controls' : 'Collapse controls';
      clampPanel();
    });

    panelHeader.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      const rect = panel.getBoundingClientRect();
      panelDrag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        nextLeft: rect.left,
        nextTop: rect.top
      };
      panel.classList.add('is-dragging');
      panelHeader.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    panelHeader.addEventListener('pointermove', (event) => {
      if (!panelDrag || event.pointerId !== panelDrag.pointerId) return;
      movePanelDuringDrag(event.clientX, event.clientY);
    });
    panelHeader.addEventListener('pointerup', endPanelDrag);
    panelHeader.addEventListener('pointercancel', endPanelDrag);
  }

  function endPanelDrag(event) {
    if (!panelDrag || event.pointerId !== panelDrag.pointerId) return;
    panel.style.left = `${Math.round(panelDrag.nextLeft)}px`;
    panel.style.top = `${Math.round(panelDrag.nextTop)}px`;
    panel.style.transform = '';
    panel.classList.remove('is-dragging');
    if (panelHeader.hasPointerCapture(event.pointerId)) {
      panelHeader.releasePointerCapture(event.pointerId);
    }
    panelDrag = null;
  }

  function movePanelDuringDrag(clientX, clientY) {
    const margin = 8;
    const maxLeft = Math.max(margin, innerWidth - panelDrag.width - margin);
    const maxTop = Math.max(margin, innerHeight - panelDrag.height - margin);
    const left = clamp(panelDrag.left + clientX - panelDrag.startX, margin, maxLeft);
    const top = clamp(panelDrag.top + clientY - panelDrag.startY, margin, maxTop);
    panelDrag.nextLeft = left;
    panelDrag.nextTop = top;
    panel.style.transform =
      `translate3d(${left - panelDrag.left}px, ${top - panelDrag.top}px, 0)`;
  }

  function clampPanel() {
    if (!panel.style.left && !panel.style.top) return;
    const rect = panel.getBoundingClientRect();
    const margin = 8;
    const maxLeft = Math.max(margin, innerWidth - rect.width - margin);
    const maxTop = Math.max(margin, innerHeight - rect.height - margin);
    panel.style.left = `${Math.round(clamp(rect.left, margin, maxLeft))}px`;
    panel.style.top = `${Math.round(clamp(rect.top, margin, maxTop))}px`;
  }

  function reseed() {
    const value = Math.floor(Math.random() * 0x7fffffff).toString(36);
    seed = hashString(value);
    try {
      const url = new URL(location.href);
      url.searchParams.set('seed', value);
      history.replaceState(null, '', url);
    } catch (error) {
      // A fresh bath still works when history is unavailable on file://.
    }
    resetBath();
    status.textContent = `New mineral bath ${String(seed % 10000).padStart(4, '0')}.`;
  }

  function onKeyDown(event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = event.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      reseed();
    } else if (event.key === ' ') {
      event.preventDefault();
      paused = !paused;
      lastFrameAt = performance.now();
      invalidate();
      status.textContent = paused ? 'Bath paused.' : 'Bath flowing.';
    }
  }

  function onMotionPreference(event) {
    paused = event.matches;
    lastFrameAt = performance.now();
    invalidate();
    status.textContent = paused
      ? 'A finished still bath is shown for reduced motion.'
      : 'Bath flowing.';
  }

  function currentPalette() {
    const selected = PALETTES[Number(paletteSelect.value)] || PALETTES[1];
    return selected.map(hexToUnitRgb);
  }

  function invalidate() {
    dirty = true;
    if (!renderer.animated) requestAnimationFrame(tick);
  }

  function sampleBluePalette(palette, t) {
    const stops = [0, 0.12, 0.26, 0.46, 0.63, 0.79, 0.91, 1];
    const colors = [palette[0], palette[1], palette[2], palette[3], palette[4], palette[2], palette[1], palette[0]];
    let index = 0;
    while (index < stops.length - 2 && t > stops[index + 1]) index++;
    const local = smoothstep(stops[index], stops[index + 1], t);
    return [
      colors[index][0] + (colors[index + 1][0] - colors[index][0]) * local,
      colors[index][1] + (colors[index + 1][1] - colors[index][1]) * local,
      colors[index][2] + (colors[index + 1][2] - colors[index][2]) * local
    ];
  }

  function cpuFbm(x, y) {
    let value = 0;
    let amplitude = 0.5;
    for (let octave = 0; octave < 4; octave++) {
      value += amplitude * cpuValueNoise(x, y);
      const nextX = x * 1.6 + y * 1.2 + 7.3;
      y = -x * 1.2 + y * 1.6 + 3.1;
      x = nextX;
      amplitude *= 0.5;
    }
    return value - 0.5;
  }

  function cpuValueNoise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = cpuHash(ix, iy);
    const b = cpuHash(ix + 1, iy);
    const c = cpuHash(ix, iy + 1);
    const d = cpuHash(ix + 1, iy + 1);
    return mix(mix(a, b, ux), mix(c, d, ux), uy);
  }

  function cpuHash(x, y) {
    const value = Math.sin(x * 127.1 + y * 311.7 + seed * 0.00013) * 43758.5453;
    return value - Math.floor(value);
  }

  function seedFromLocation() {
    const value = pageParams.get('seed');
    return value ? hashString(value) : Math.floor(Math.random() * 0x7fffffff);
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index++) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(value) {
    return () => {
      let next = (value += 0x6d2b79f5);
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hexToUnitRgb(value) {
    const number = parseInt(value.slice(1), 16);
    return new Float32Array([
      (number >> 16 & 255) / 255,
      (number >> 8 & 255) / 255,
      (number & 255) / 255
    ]);
  }

  function mix(a, b, amount) {
    return a + (b - a) * amount;
  }

  function smoothstep(edge0, edge1, value) {
    const amount = clamp((value - edge0) / Math.max(0.00001, edge1 - edge0), 0, 1);
    return amount * amount * (3 - 2 * amount);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
