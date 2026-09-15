(() => {
  'use strict';

  const bathCanvas = document.getElementById('bath');
  const pigmentCanvas = document.getElementById('stage');
  const effectsCanvas = document.getElementById('effects');
  const pigmentContext = pigmentCanvas.getContext('2d', { alpha: true });
  const effectsContext = effectsCanvas.getContext('2d', { alpha: true });
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

  const PALETTES = [
    ['#173e59', '#47758a', '#86a7ae', '#d3dfdc', '#f0eee4', '#9a6654', '#597965', '#b59455'],
    ['#10385f', '#315f87', '#7497b1', '#afc3cf', '#d9e2e2', '#497f7b', '#846777', '#aa8a55'],
    ['#213f4f', '#52756f', '#96aaa0', '#d8ddd1', '#ece9da', '#75576f', '#9b7156', '#5b7f85'],
    ['#182f4a', '#496b88', '#98adbd', '#d7dddc', '#ebe8df', '#8d554b', '#707a5d', '#a58250'],
    ['#153f52', '#3c7380', '#7da2a8', '#c1d2cf', '#e2e7df', '#a26c61', '#887f5e', '#586d83'],
    ['#2e3d43', '#5b716e', '#9baba2', '#d8d9cd', '#ebe6d7', '#895a48', '#92713f', '#536a5b']
  ];
  const FALL_DURATION = 560;
  const SPREAD_DURATION = 1680;
  const MAX_CANVAS_PIXELS = 1450000;
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
    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform float u_seed;
    uniform vec3 u_color_0;
    uniform vec3 u_color_1;
    uniform vec3 u_color_2;
    uniform vec3 u_color_3;
    uniform vec3 u_color_4;

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
      color = mix(color, u_color_1, smoothstep(0.10, 0.15, t));
      color = mix(color, u_color_2, smoothstep(0.24, 0.30, t));
      color = mix(color, u_color_3, smoothstep(0.42, 0.50, t));
      color = mix(color, u_color_4, smoothstep(0.59, 0.68, t));
      color = mix(color, u_color_2, smoothstep(0.77, 0.83, t));
      color = mix(color, u_color_1, smoothstep(0.89, 0.94, t));
      color = mix(color, u_color_0, smoothstep(0.97, 0.995, t));
      return color;
    }
    void main() {
      float aspect = u_resolution.x / max(1.0, u_resolution.y);
      float seedPhase = u_seed * 0.071;
      vec2 p = (v_uv - 0.5) * vec2(aspect, 1.0) * 2.0;
      p = softVortex(p, vec2(-0.48 * aspect, 0.17), 0.92, 0.72 + sin(seedPhase) * 0.09);
      p = softVortex(p, vec2(0.43 * aspect, -0.34), 0.78, -0.60);
      p = softVortex(p, vec2(0.25 * aspect, 0.65), 0.57, 0.34);
      p = softVortex(p, vec2(0.08 * aspect, 0.34), 0.88, -0.46);
      float broadA = fbm(p * 0.54 + vec2(seedPhase, 0.0));
      float broadB = fbm(p * 0.72 + vec2(6.4, seedPhase * 0.4));
      vec2 q = p + vec2(broadA - 0.5, broadB - 0.5) * vec2(0.54, 0.38);
      q.x += sin(q.y * 1.34 + broadB * 2.3 + seedPhase) * 0.38;
      q.y += sin(q.x * 0.84 - broadA * 1.8 - seedPhase * 0.37) * 0.15;
      float field = q.x * 0.59 + q.y * 0.27;
      field += sin(q.y * 1.62 + seedPhase * 0.53) * 0.31;
      field += sin(q.x * 0.78 - q.y * 0.31 - seedPhase * 0.24) * 0.19;
      field += (broadA - 0.5) * 0.82 + (broadB - 0.5) * 0.36;
      field += (noise2(q * 2.35 + vec2(1.8, seedPhase)) - 0.5) * 0.17;
      float phase = field * 2.08 + (noise2(q * 8.4 + seedPhase) - 0.5) * 0.038;
      vec3 color = blueBands(fract(phase));
      float threadPhase = abs(fract(phase * 3.35 + noise2(q * 3.8) * 0.08) - 0.5);
      float mineralThread = 1.0 - smoothstep(0.012, 0.030, threadPhase);
      color = mix(color, u_color_0, mineralThread * 0.16);
      color += (noise2(q * 7.2 + vec2(seedPhase, -seedPhase)) - 0.5) * vec3(0.045, 0.052, 0.056);
      color += (hash21(gl_FragCoord.xy + p * 17.0) - 0.5) * 0.024;
      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let seed = seedFromLocation();
  let random = mulberry32(seed);
  let bathRevision = 0;
  let paused = motionPreference.matches;
  let activeDrop = null;
  let dropQueue = [];
  let nextDropAt = 0;
  let lastFrameAt = 0;
  let lastSimulationPaint = 0;
  let inkWell = { x: 0.68, y: 0.76 };
  let panelDrag = null;
  let resizeTimer = 0;

  const gl = bathCanvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance'
  });
  const baseRenderer = gl ? createWebGLBase(gl) : createCanvasBase();

  if (pageParams.get('panel') === '0') document.body.classList.add('no-panel');
  bindControls();
  bindPanel();
  addEventListener('resize', onResize, { passive: true });
  addEventListener('keydown', onKeyDown);
  pigmentCanvas.addEventListener('pointerdown', onBathPointer);
  reseedButton.addEventListener('click', reseed);
  motionPreference.addEventListener('change', onMotionPreference);
  updatePanel();
  resetBath();
  requestAnimationFrame(tick);

  function createWebGLBase(context) {
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
      seed: context.getUniformLocation(program, 'u_seed'),
      colors: Array.from({ length: 5 }, (_, index) =>
        context.getUniformLocation(program, `u_color_${index}`)
      )
    };
    return {
      render() {
        context.viewport(0, 0, bathCanvas.width, bathCanvas.height);
        context.useProgram(program);
        context.bindBuffer(context.ARRAY_BUFFER, buffer);
        context.enableVertexAttribArray(position);
        context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
        context.uniform2f(uniforms.resolution, bathCanvas.width, bathCanvas.height);
        context.uniform1f(uniforms.seed, (seed % 100000) / 997);
        const palette = currentPalette();
        for (let index = 0; index < 5; index++) {
          context.uniform3fv(uniforms.colors[index], hexToUnitRgb(palette[index]));
        }
        context.drawArrays(context.TRIANGLES, 0, 6);
      },
      revealWater() {
        const water = hexToUnitRgb(currentPalette()[3]);
        context.clearColor(water[0], water[1], water[2], 1);
        context.clear(context.COLOR_BUFFER_BIT);
      }
    };
  }

  function createCanvasBase() {
    const context = bathCanvas.getContext('2d', { alpha: false });
    const field = document.createElement('canvas');
    const fieldContext = field.getContext('2d', { alpha: false });
    return {
      render() {
        const sampleWidth = Math.min(520, Math.max(280, Math.round(width * 0.58)));
        const sampleHeight = Math.max(200, Math.round(sampleWidth * height / Math.max(1, width)));
        field.width = sampleWidth;
        field.height = sampleHeight;
        const image = fieldContext.createImageData(sampleWidth, sampleHeight);
        const palette = currentPalette().slice(0, 5).map(hexToRgb);
        for (let y = 0; y < sampleHeight; y++) {
          for (let x = 0; x < sampleWidth; x++) {
            const u = x / Math.max(1, sampleWidth - 1);
            const v = y / Math.max(1, sampleHeight - 1);
            const aspect = width / Math.max(1, height);
            let px = (u - 0.5) * aspect * 2;
            let py = (0.5 - v) * 2;
            px += Math.sin(py * 1.4 + seed * 0.0001) * 0.34 + cpuFbm(px * 0.7, py * 0.7) * 0.42;
            py += Math.sin(px * 0.92) * 0.12;
            const phase = (px * 0.72 + py * 0.12 + cpuFbm(px * 1.7, py * 1.7) * 0.78) * 2.08;
            const color = samplePalette(palette, phase - Math.floor(phase));
            const grain = (cpuHash(x, y) - 0.5) * 7;
            const offset = (y * sampleWidth + x) * 4;
            image.data[offset] = clamp(Math.round(color[0] + grain), 0, 255);
            image.data[offset + 1] = clamp(Math.round(color[1] + grain), 0, 255);
            image.data[offset + 2] = clamp(Math.round(color[2] + grain), 0, 255);
            image.data[offset + 3] = 255;
          }
        }
        fieldContext.putImageData(image, 0, 0);
        context.clearRect(0, 0, bathCanvas.width, bathCanvas.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(field, 0, 0, bathCanvas.width, bathCanvas.height);
      },
      revealWater() {
        context.fillStyle = currentPalette()[3];
        context.fillRect(0, 0, bathCanvas.width, bathCanvas.height);
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
    activeDrop = null;
    dropQueue = [];
    bathRevision = 0;
    resizeCanvases();
    baseRenderer.render();
    pigmentContext.clearRect(0, 0, pigmentCanvas.width, pigmentCanvas.height);
    pigmentContext.drawImage(
      bathCanvas,
      0,
      0,
      bathCanvas.width,
      bathCanvas.height,
      0,
      0,
      pigmentCanvas.width,
      pigmentCanvas.height
    );
    baseRenderer.revealWater();
    effectsContext.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
    seedPigment();
    nextDropAt = performance.now() + nextDropDelay() * 0.72;
    lastFrameAt = performance.now();
    updateBathNumber();
  }

  function seedPigment() {
    // A cropped bank of hairline pigment echoes the dense lower passage in
    // the photographic reference without opening on a giant concentric pool.
    const palette = currentPalette().map(hexToRgb);
    const w = pigmentCanvas.width;
    const h = pigmentCanvas.height;
    pigmentContext.save();
    pigmentContext.lineCap = 'round';
    pigmentContext.lineJoin = 'round';

    const pale = palette[3];
    pigmentContext.strokeStyle = `rgba(${pale[0]}, ${pale[1]}, ${pale[2]}, 0.72)`;
    pigmentContext.lineWidth = h * 0.23;
    pigmentContext.beginPath();
    pigmentContext.moveTo(-w * 0.08, h * 0.92);
    pigmentContext.bezierCurveTo(w * 0.18, h * 0.77, w * 0.43, h * 0.91, w * 0.60, h * 0.82);
    pigmentContext.bezierCurveTo(w * 0.77, h * 0.72, w * 0.91, h * 0.93, w * 1.08, h * 0.77);
    pigmentContext.stroke();

    const inkOrder = [
      1, 2, 5, 3, 6, 2, 4, 7, 1, 3, 5, 2, 6, 0, 4, 7, 2, 1, 5, 3,
      6, 2, 7, 1, 4, 5, 2, 6, 3, 7, 1, 5, 2, 4, 6, 0, 7, 2, 5, 3
    ];
    const currentPhase = random() * Math.PI * 2;
    inkOrder.forEach((paletteIndex, index) => {
      const lineRandom = random();
      const phase = currentPhase + (random() - 0.5) * 0.42;
      const baseY = h * (0.735 + index * 0.0071);
      const amplitude = h * (0.006 + lineRandom * 0.010);
      const color = palette[paletteIndex];
      pigmentContext.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${paletteIndex >= 5 ? 0.88 : 0.64})`;
      pigmentContext.lineWidth = Math.max(0.9 * dpr, h * (paletteIndex >= 5 ? 0.0024 : 0.0016));
      pigmentContext.beginPath();
      const steps = 92;
      for (let step = 0; step <= steps; step++) {
        const nx = step / steps;
        const curlA = Math.exp(-Math.pow((nx - 0.62) / 0.17, 2));
        const curlB = Math.exp(-Math.pow((nx - 0.86) / 0.10, 2));
        const y = baseY +
          Math.sin(nx * Math.PI * 1.55 + currentPhase) * h * 0.046 +
          Math.sin(nx * Math.PI * 2.2 + phase) * amplitude +
          Math.sin(nx * Math.PI * 5.4 - phase * 0.43) * amplitude * 0.31 +
          curlA * Math.sin(nx * Math.PI * 8.0 + phase) * h * 0.022 +
          curlB * Math.sin(nx * Math.PI * 13.0 - phase) * h * 0.018;
        const x = (nx * 1.16 - 0.08) * w;
        if (step === 0) pigmentContext.moveTo(x, y);
        else pigmentContext.lineTo(x, y);
      }
      pigmentContext.stroke();
    });
    pigmentContext.restore();
    inkWell = { x: 0.64, y: 0.82 };
    bathRevision = inkOrder.length;
  }

  function makeDrop(x, y, radius, pigment, manual) {
    const palette = currentPalette();
    return {
      x,
      y,
      radius,
      pigment,
      color: pigment === null ? null : hexToRgb(palette[5 + pigment]),
      manual,
      shapeSeed: random() * Math.PI * 2,
      variation: 0.08 + Number(controls.sizeVariation.value) / 600,
      push: Number(controls.repulsion.value) / 100,
      startedAt: 0,
      prepared: false,
      source: null,
      output: null,
      region: null
    };
  }

  function queueDrop(drop) {
    bathRevision++;
    updateBathNumber();
    if (paused) {
      prepareDrop(drop);
      renderDrop(drop, 1);
      status.textContent = 'Ink spread across the still bath and displaced the earlier pigment.';
      return;
    }
    dropQueue.push(drop);
    if (!activeDrop) beginNextDrop(performance.now());
  }

  function beginNextDrop(time) {
    activeDrop = dropQueue.shift() || null;
    if (!activeDrop) return;
    activeDrop.startedAt = time;
    lastSimulationPaint = 0;
  }

  function prepareDrop(drop) {
    if (drop.prepared) return;
    const centerX = drop.x * pigmentCanvas.width;
    const centerY = drop.y * pigmentCanvas.height;
    const radius = drop.radius * Math.min(pigmentCanvas.width, pigmentCanvas.height);
    const extent = radius * (2.55 + drop.push * 0.24) + 8;
    const left = clamp(Math.floor(centerX - extent), 0, pigmentCanvas.width - 1);
    const top = clamp(Math.floor(centerY - extent), 0, pigmentCanvas.height - 1);
    const right = clamp(Math.ceil(centerX + extent), left + 1, pigmentCanvas.width);
    const bottom = clamp(Math.ceil(centerY + extent), top + 1, pigmentCanvas.height);
    drop.region = {
      left,
      top,
      width: right - left,
      height: bottom - top,
      centerX: centerX - left,
      centerY: centerY - top,
      radius
    };
    drop.source = pigmentContext.getImageData(left, top, right - left, bottom - top);
    drop.output = pigmentContext.createImageData(right - left, bottom - top);
    drop.prepared = true;
  }

  function renderDrop(drop, progress) {
    prepareDrop(drop);
    const region = drop.region;
    const source = drop.source.data;
    const outputImage = drop.output;
    const output = outputImage.data;
    output.set(source);
    const eased = 1 - Math.pow(1 - clamp(progress, 0, 1), 3);
    const front = region.radius * (0.035 + eased * 0.965);
    const pushBand = region.radius * (0.52 + drop.push * 0.20);
    const shove = region.radius * 0.42 * drop.push * eased;

    for (let y = 0; y < region.height; y++) {
      const dy = y - region.centerY;
      for (let x = 0; x < region.width; x++) {
        const dx = x - region.centerX;
        const distance = Math.hypot(dx, dy);
        if (distance < 0.001) continue;
        const angle = Math.atan2(dy, dx);
        // Broad, low-frequency contour drift avoids the gear-like scallops of
        // the old vector treatment while keeping every displacement continuous.
        const contour = 1 + drop.variation * (
          Math.sin(angle * 2 + drop.shapeSeed) * 0.62 +
          Math.sin(angle * 3 - drop.shapeSeed * 0.73) * 0.25 +
          Math.sin(angle * 5 + drop.shapeSeed * 1.31) * 0.13
        );
        const localFront = front * contour;
        const localBand = pushBand * contour;
        const outerEdge = localFront + localBand;
        if (distance > outerEdge) continue;
        const targetOffset = (y * region.width + x) * 4;
        let red = source[targetOffset];
        let green = source[targetOffset + 1];
        let blue = source[targetOffset + 2];
        let alpha = source[targetOffset + 3];

        if (distance < localFront && !drop.color) {
          const edgeKeep = smoothstep(localFront * 0.90, localFront, distance);
          alpha *= mix(0.13, 1, edgeKeep);
        } else if (distance >= localFront) {
          const bandPosition = clamp((distance - localFront) / localBand, 0, 1);
          const displacement = shove * Math.pow(Math.sin(Math.PI * bandPosition), 2);
          const sourceRadius = Math.max(0, distance - displacement);
          const sourceX = region.centerX + dx / distance * sourceRadius;
          const sourceY = region.centerY + dy / distance * sourceRadius;
          if (sourceX >= 0 && sourceX < region.width && sourceY >= 0 && sourceY < region.height) {
            const x0 = clamp(Math.floor(sourceX), 0, region.width - 1);
            const y0 = clamp(Math.floor(sourceY), 0, region.height - 1);
            const x1 = Math.min(region.width - 1, x0 + 1);
            const y1 = Math.min(region.height - 1, y0 + 1);
            const tx = sourceX - x0;
            const ty = sourceY - y0;
            const offset00 = (y0 * region.width + x0) * 4;
            const offset10 = (y0 * region.width + x1) * 4;
            const offset01 = (y1 * region.width + x0) * 4;
            const offset11 = (y1 * region.width + x1) * 4;
            red = bilinearChannel(source, offset00, offset10, offset01, offset11, 0, tx, ty);
            green = bilinearChannel(source, offset00, offset10, offset01, offset11, 1, tx, ty);
            blue = bilinearChannel(source, offset00, offset10, offset01, offset11, 2, tx, ty);
            alpha = bilinearChannel(source, offset00, offset10, offset01, offset11, 3, tx, ty);
          }
        }

        if (drop.color) {
          const rim = 1 - smoothstep(
            region.radius * 0.006,
            region.radius * 0.026,
            Math.abs(distance - localFront)
          );
          const innerThread = 1 - smoothstep(
            region.radius * 0.005,
            region.radius * 0.018,
            Math.abs(distance - (localFront - region.radius * 0.036))
          );
          const outerThread = 1 - smoothstep(
            region.radius * 0.004,
            region.radius * 0.014,
            Math.abs(distance - (localFront + region.radius * 0.030))
          );
          const floatingFilm = distance < localFront
            ? 1 - smoothstep(localFront * 0.88, localFront, distance)
            : 0;
          const mottling = 0.92 + 0.05 * Math.sin(angle * 7 + drop.shapeSeed * 2.3) +
            0.03 * Math.sin(distance * 0.075 + angle * 3 - drop.shapeSeed);
          const depositAlpha = clamp(
            (floatingFilm * 0.96 + rim * 0.26 + innerThread * 0.05 + outerThread * 0.03) * mottling,
            0,
            0.96
          );
          const oldAlpha = alpha / 255;
          const combinedAlpha = depositAlpha + oldAlpha * (1 - depositAlpha);
          if (combinedAlpha > 0.0001) {
            red = (drop.color[0] * depositAlpha + red * oldAlpha * (1 - depositAlpha)) / combinedAlpha;
            green = (drop.color[1] * depositAlpha + green * oldAlpha * (1 - depositAlpha)) / combinedAlpha;
            blue = (drop.color[2] * depositAlpha + blue * oldAlpha * (1 - depositAlpha)) / combinedAlpha;
            alpha = combinedAlpha * 255;
          }
        }
        output[targetOffset] = clamp(Math.round(red), 0, 255);
        output[targetOffset + 1] = clamp(Math.round(green), 0, 255);
        output[targetOffset + 2] = clamp(Math.round(blue), 0, 255);
        output[targetOffset + 3] = clamp(Math.round(alpha), 0, 255);
      }
    }
    pigmentContext.putImageData(outputImage, region.left, region.top);
  }

  function tick(time) {
    const delta = lastFrameAt ? Math.min(64, time - lastFrameAt) : 16;
    lastFrameAt = time;
    effectsContext.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
    if (!paused && time >= nextDropAt) {
      addAutomaticDrop();
      nextDropAt = time + nextDropDelay();
    }
    if (activeDrop && !paused) {
      const age = time - activeDrop.startedAt;
      if (age < FALL_DURATION) {
        drawFallingDrop(activeDrop, age / FALL_DURATION);
      } else {
        if (!activeDrop.prepared) prepareDrop(activeDrop);
        const spreadProgress = (age - FALL_DURATION) / SPREAD_DURATION;
        if (time - lastSimulationPaint >= 1000 / 30 || spreadProgress >= 1) {
          renderDrop(activeDrop, Math.min(1, spreadProgress));
          lastSimulationPaint = time;
        }
        drawImpact(activeDrop, Math.min(1, spreadProgress));
        if (spreadProgress >= 1) {
          activeDrop = null;
          beginNextDrop(time + Math.min(delta, 32));
        }
      }
    } else if (dropQueue.length) {
      beginNextDrop(time);
    }
    requestAnimationFrame(tick);
  }

  function drawFallingDrop(drop, progress) {
    const eased = progress * progress;
    const x = drop.x * effectsCanvas.width;
    const targetY = drop.y * effectsCanvas.height;
    const y = mix(targetY - effectsCanvas.height * 0.30, targetY, eased);
    const radius = Math.max(5 * dpr, drop.radius * Math.min(width, height) * dpr * 0.065);
    const color = drop.color || [218, 226, 225];
    effectsContext.save();
    effectsContext.shadowColor = 'rgba(8, 34, 55, 0.34)';
    effectsContext.shadowBlur = radius * mix(2.5, 0.7, progress);
    effectsContext.shadowOffsetY = radius * mix(1.8, 0.35, progress);
    effectsContext.fillStyle = `rgb(${color[0]} ${color[1]} ${color[2]})`;
    effectsContext.beginPath();
    effectsContext.ellipse(x, y, radius, radius * mix(1.2, 0.88, progress), 0, 0, Math.PI * 2);
    effectsContext.fill();
    effectsContext.shadowColor = 'transparent';
    effectsContext.fillStyle = 'rgba(245, 247, 240, 0.68)';
    effectsContext.beginPath();
    effectsContext.arc(x - radius * 0.27, y - radius * 0.31, radius * 0.23, 0, Math.PI * 2);
    effectsContext.fill();
    effectsContext.restore();
  }

  function bilinearChannel(data, offset00, offset10, offset01, offset11, channel, tx, ty) {
    const top = mix(data[offset00 + channel], data[offset10 + channel], tx);
    const bottom = mix(data[offset01 + channel], data[offset11 + channel], tx);
    return mix(top, bottom, ty);
  }

  function drawImpact(drop, progress) {
    const x = drop.x * effectsCanvas.width;
    const y = drop.y * effectsCanvas.height;
    const radius = drop.radius * Math.min(effectsCanvas.width, effectsCanvas.height) *
      (0.05 + (1 - Math.pow(1 - progress, 3)) * 0.95);
    effectsContext.strokeStyle = `rgba(235, 241, 237, ${(1 - progress) * 0.44})`;
    effectsContext.lineWidth = Math.max(1, 1.4 * dpr);
    effectsContext.beginPath();
    effectsContext.arc(x, y, radius, 0, Math.PI * 2);
    effectsContext.stroke();
  }

  function addAutomaticDrop() {
    if (random() < 0.13) inkWell = { x: 0.12 + random() * 0.76, y: 0.14 + random() * 0.70 };
    queueDrop(makeDrop(
      clamp(inkWell.x + (random() - 0.5) * 0.035, 0.04, 0.96),
      clamp(inkWell.y + (random() - 0.5) * 0.035, 0.04, 0.96),
      dropRadius() * (0.84 + random() * 0.28),
      bathRevision % 3,
      false
    ));
  }

  function onBathPointer(event) {
    const rect = pigmentCanvas.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0.02, 0.98);
    const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0.02, 0.98);
    inkWell = { x, y };
    queueDrop(makeDrop(x, y, dropRadius(), bathRevision % 3, true));
    status.textContent = 'Ink falling—impact will push the floating pigment outward.';
  }

  function dropRadius() {
    return clamp(0.058 + Number(controls.dropSize.value) / 920, 0.075, 0.17);
  }

  function nextDropDelay() {
    return 60000 / Number(controls.tempo.value) * (0.78 + random() * 0.58);
  }

  function resizeCanvases() {
    width = Math.max(1, innerWidth);
    height = Math.max(1, innerHeight);
    const pixelRatio = devicePixelRatio || 1;
    const budgetRatio = Math.sqrt(MAX_CANVAS_PIXELS / Math.max(1, width * height));
    dpr = Math.min(1.25, pixelRatio, Math.max(1, budgetRatio));
    [bathCanvas, pigmentCanvas, effectsCanvas].forEach((canvas) => {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    });
  }

  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeTimer = 0;
      resetBath();
      clampPanel();
    }, 140);
  }

  function bindControls() {
    Object.values(controls).forEach((control) => control.addEventListener('input', updatePanel));
    paletteSelect.addEventListener('change', () => {
      resetBath();
      updatePanel();
      status.textContent = `${paletteSelect.selectedOptions[0].textContent} pigments loaded.`;
    });
  }

  function updatePanel() {
    updateRange(controls.tempo, `${controls.tempo.value}/min`);
    updateRange(controls.dropSize, `${Math.round(dropRadius() * 100)}%`);
    updateRange(controls.sizeVariation, `${controls.sizeVariation.value}%`);
    updateRange(controls.repulsion, `${controls.repulsion.value}%`);
    updateBathNumber();
  }

  function updateRange(input, text) {
    const row = input.closest('.range-row');
    const min = Number(input.min);
    const max = Number(input.max);
    row.style.setProperty('--progress', `${(Number(input.value) - min) / (max - min) * 100}%`);
    const output = row.querySelector('output');
    output.value = text;
    output.textContent = text;
  }

  function updateBathNumber() {
    bathNumber.textContent = `BATH ${String(seed % 10000).padStart(4, '0')} · INK ${String(bathRevision).padStart(3, '0')}`;
  }

  function bindPanel() {
    collapseButton.addEventListener('click', () => {
      const collapsed = panel.classList.toggle('is-collapsed');
      collapseButton.setAttribute('aria-expanded', String(!collapsed));
      collapseButton.setAttribute('aria-label', collapsed ? 'Expand marbling controls' : 'Collapse marbling controls');
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
      if (panelDrag && event.pointerId === panelDrag.pointerId) movePanelDuringDrag(event.clientX, event.clientY);
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
    if (panelHeader.hasPointerCapture(event.pointerId)) panelHeader.releasePointerCapture(event.pointerId);
    panelDrag = null;
  }

  function movePanelDuringDrag(clientX, clientY) {
    const margin = 8;
    const left = clamp(panelDrag.left + clientX - panelDrag.startX, margin, Math.max(margin, innerWidth - panelDrag.width - margin));
    const top = clamp(panelDrag.top + clientY - panelDrag.startY, margin, Math.max(margin, innerHeight - panelDrag.height - margin));
    panelDrag.nextLeft = left;
    panelDrag.nextTop = top;
    panel.style.transform = `translate3d(${left - panelDrag.left}px, ${top - panelDrag.top}px, 0)`;
  }

  function clampPanel() {
    if (!panel.style.left && !panel.style.top) return;
    const rect = panel.getBoundingClientRect();
    const margin = 8;
    panel.style.left = `${Math.round(clamp(rect.left, margin, Math.max(margin, innerWidth - rect.width - margin)))}px`;
    panel.style.top = `${Math.round(clamp(rect.top, margin, Math.max(margin, innerHeight - rect.height - margin)))}px`;
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
      if (paused && activeDrop) {
        renderDrop(activeDrop, 1);
        activeDrop = null;
      }
      if (paused) settleQueuedDrops();
      status.textContent = paused ? 'Bath paused. New drops settle immediately.' : 'Bath active.';
    }
  }

  function onMotionPreference(event) {
    paused = event.matches;
    if (paused && activeDrop) {
      renderDrop(activeDrop, 1);
      activeDrop = null;
    }
    if (paused) settleQueuedDrops();
    status.textContent = paused ? 'A finished still bath is shown for reduced motion.' : 'Bath active.';
  }

  function currentPalette() {
    return PALETTES[Number(paletteSelect.value)] || PALETTES[1];
  }

  function settleQueuedDrops() {
    while (dropQueue.length) {
      const drop = dropQueue.shift();
      prepareDrop(drop);
      renderDrop(drop, 1);
    }
  }

  function samplePalette(palette, t) {
    const stops = [0, 0.12, 0.27, 0.47, 0.64, 0.80, 0.92, 1];
    const colors = [palette[0], palette[1], palette[2], palette[3], palette[4], palette[2], palette[1], palette[0]];
    let index = 0;
    while (index < stops.length - 2 && t > stops[index + 1]) index++;
    const local = smoothstep(stops[index], stops[index + 1], t);
    return [
      mix(colors[index][0], colors[index + 1][0], local),
      mix(colors[index][1], colors[index + 1][1], local),
      mix(colors[index][2], colors[index + 1][2], local)
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
    return mix(
      mix(cpuHash(ix, iy), cpuHash(ix + 1, iy), ux),
      mix(cpuHash(ix, iy + 1), cpuHash(ix + 1, iy + 1), ux),
      uy
    );
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

  function hexToRgb(value) {
    const number = parseInt(value.slice(1), 16);
    return [number >> 16 & 255, number >> 8 & 255, number & 255];
  }

  function hexToUnitRgb(value) {
    return new Float32Array(hexToRgb(value).map((channel) => channel / 255));
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
