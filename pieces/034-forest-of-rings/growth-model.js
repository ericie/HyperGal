'use strict';

// Adapted from ../015-growth-rings/index.html. Keep the original pure growth
// model here so this piece remains portable and 015 itself stays untouched.
const GrowthRingsModel = (() => {
      const TAU = Math.PI * 2;
      const TARGET_AGE = 200;
      const SAMPLE_COUNT = 320;
      const YOUNG_OUTLINE_POINTS = 14;
      const DEFAULT_RING_SECONDS = 0.22;
      const RING_TONES = [-0.24, -0.16, -0.08, 0, 0.1, 0.2, 0.3];
      const DAMAGE_KINDS = ['fire', 'pest'];
      const PALETTES = {
        debug: {
          name: 'Debug',
          colors: [
            { name: 'Debug Wheat', color: [255, 215, 123, 0.5] },
            { name: 'Debug Pale Yellow', color: [255, 255, 100, 0.5] },
            { name: 'Debug Blue', color: [0, 75, 255, 0.5] },
            { name: 'Debug Purple', color: [255, 0, 44, 0.5] },
            { name: 'Debug Burlywood', color: [222, 184, 135, 0.5] },
          ],
        },
        hokusai: {
          name: 'Hokusai',
          colors: [
            { name: 'Wheat', color: [255, 215, 123] },
            { name: 'Pale Yellow', color: [255, 255, 179] },
            { name: 'Prussian Blue', color: [0, 75, 135] },
            { name: 'Tyrian Purple', color: [168, 0, 44] },
            { name: 'Burlywood', color: [222, 184, 135] },
          ],
        },
        gucci: {
          name: 'Gucci',
          colors: [
            { name: 'Dark Red', color: [102, 0, 34] },
            { name: 'Gold', color: [255, 204, 0] },
            { name: 'Teal', color: [0, 204, 153] },
            { name: 'Charcoal', color: [51, 51, 51] },
            { name: 'White', color: [255, 255, 255] },
          ],
        },
        renaissance: {
          name: 'Renaissance',
          colors: [
            { name: 'Chestnut', color: [120, 31, 2] },
            { name: 'Pale Brown', color: [206, 159, 105] },
            { name: 'Crimson', color: [204, 36, 29] },
            { name: 'Peach', color: [255, 218, 121] },
            { name: 'Eggshell', color: [249, 247, 229] },
          ],
        },
        nature_photo: {
          name: 'Nature Photo',
          colors: [
            { name: 'Pine Green', color: [0, 62, 51] },
            { name: 'Khaki', color: [235, 196, 94] },
            { name: 'Beige', color: [210, 190, 147] },
            { name: 'Lavender Grey', color: [203, 202, 211] },
            { name: 'Grey Green', color: [167, 190, 182] },
          ],
        },
        vapor_wave: {
          name: 'Vapor Wave',
          colors: [
            { name: 'Light Pink', color: [255, 179, 246] },
            { name: 'Deep Purple', color: [106, 0, 255] },
            { name: 'Electric Blue', color: [0, 255, 251] },
            { name: 'Yellow', color: [255, 252, 0] },
            { name: 'Neon Orange', color: [255, 110, 0] },
          ],
        },
      };
      function xmur3(str) {
        let h = 1779033703 ^ str.length;
        for (let i = 0; i < str.length; i++) {
          h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
          h = (h << 13) | (h >>> 19);
        }
        return function nextHash() {
          h = Math.imul(h ^ (h >>> 16), 2246822507);
          h = Math.imul(h ^ (h >>> 13), 3266489909);
          return (h ^= h >>> 16) >>> 0;
        };
      }

      function mulberry32(a) {
        return function nextRandom() {
          let t = (a += 0x6d2b79f5);
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      function clamp(value, min, max) {
        return value < min ? min : value > max ? max : value;
      }

      function lerp(a, b, t) {
        return a + (b - a) * t;
      }

      function easeOutQuart(t) {
        const u = clamp(t, 0, 1);
        return 1 - Math.pow(1 - u, 4);
      }

      function smootherStep(t) {
        const u = clamp(t, 0, 1);
        return u * u * u * (u * (u * 6 - 15) + 10);
      }

      function angleDelta(a, b) {
        return Math.atan2(Math.sin(a - b), Math.cos(a - b));
      }

      function unit(angle) {
        return { x: Math.cos(angle), y: Math.sin(angle) };
      }

      function resolvePalette(requested) {
        const aliases = {
          nature: 'nature_photo',
          naturephoto: 'nature_photo',
          nature_photo: 'nature_photo',
          vapor: 'vapor_wave',
          vaporwave: 'vapor_wave',
          vapor_wave: 'vapor_wave',
        };
        const key = normalizePaletteId(requested || 'hokusai');
        return PALETTES[aliases[key] || key] || PALETTES.hokusai;
      }

      function normalizePaletteId(value) {
        return String(value || '')
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
      }

      function makeSceneColors(palette) {
        const swatches = palette.colors.map((entry) => rgbFromEntry(entry));
        const byLight = swatches.slice().sort((a, b) => relativeLuma(a) - relativeLuma(b));
        const dark = byLight[0];
        const light = byLight[byLight.length - 1];
        const paperRgb = mixRgb(light, [255, 255, 255], 0.64);
        const inkRgb = mixRgb(dark, [0, 0, 0], 0.72);
        const windRgb = swatches[2] || dark;
        const warmRgb = swatches[3] || swatches[1] || light;
        const groundRgb = swatches[4] || swatches[0] || dark;
        const fireRgb = mixRgb(warmRgb, [190, 32, 16], 0.22);
        const pestRgb = mixRgb(windRgb, inkRgb, 0.28);
        const rainRgb = mixRgb(windRgb, light, 0.34);

        return {
          paper: rgbCss(paperRgb),
          paperRgb,
          paperClear: rgbaCss(paperRgb, 0.92),
          ink: rgbCss(inkRgb),
          inkRgb,
          inkSoft: rgbaCss(inkRgb, 0.66),
          grid: rgbaCss(inkRgb, 0.085),
          gridStrong: rgbaCss(inkRgb, 0.18),
          contour: rgbaCss(inkRgb, 0.22),
          contourSoft: rgbaCss(inkRgb, 0.12),
          sun: rgbCss(warmRgb),
          wind: rgbCss(windRgb),
          slope: rgbCss(groundRgb),
          tempCold: rgbCss(windRgb),
          tempColdRgb: windRgb,
          tempHot: rgbCss(warmRgb),
          tempHotRgb: warmRgb,
          fire: rgbCss(fireRgb),
          fireRgb,
          pest: rgbCss(pestRgb),
          pestRgb,
          rain: rgbCss(rainRgb),
          rainRgb,
          active: rgbCss(light),
        };
      }

      function rgbFromEntry(entry) {
        const color = entry.color;
        return [color[0], color[1], color[2], color.length > 3 ? color[3] : 1];
      }

      function relativeLuma(rgb) {
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      }

      function mixRgb(a, b, t) {
        const u = clamp(t, 0, 1);
        return [
          Math.round(lerp(a[0], b[0], u)),
          Math.round(lerp(a[1], b[1], u)),
          Math.round(lerp(a[2], b[2], u)),
          a.length > 3 ? a[3] : 1,
        ];
      }

      function rgbCss(rgb) {
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      }

      function rgbaCss(rgb, alpha) {
        const sourceAlpha = rgb.length > 3 ? rgb[3] : 1;
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${clamp(alpha * sourceAlpha, 0, 1)})`;
      }


  function create(seed, paletteName = 'hokusai') {
    const activePalette = resolvePalette(paletteName);
    const COLORS = makeSceneColors(activePalette);
    const hash = xmur3(String(seed));
    const model = makeModel(mulberry32(hash()), hash());
    const colors = model.rings.map(ring => {
      const base = rgbFromEntry(activePalette.colors[ring.colorIndex]);
      return mixRgb(base, ring.tone < 0 ? COLORS.inkRgb : COLORS.paperRgb, Math.abs(ring.tone));
    });
    return { ...model, colors, palette: activePalette.name, scene: COLORS,
      swatches: activePalette.colors.map(rgbFromEntry) };
      function makeModel(random, salt) {
        const colorRandom = mulberry32((salt ^ 0x9e3779b9) >>> 0);
        const forces = makeForces(random);
        const organicField = makeOrganicField(random);
        const angles = Array.from({ length: SAMPLE_COUNT }, (_, i) => (i / SAMPLE_COUNT) * TAU);
        const boundaries = [new Array(SAMPLE_COUNT).fill(0.018)];
        const rings = [{ salt, temp: 0, rainfall: 0, stress: 0, meanWidth: 0, colorIndex: 0, tone: 0 }];
        const damageEvents = makeDamageEvents(random);
        const soilPhase = random() * TAU;
        const grainPhase = random() * TAU;
        const rainPhase = random() * TAU;
        const cambiumMemory = new Array(SAMPLE_COUNT).fill(0);
        const deformationMemory = new Array(SAMPLE_COUNT).fill(0);
        const regionalMemory = new Array(SAMPLE_COUNT).fill(0);
        let climateMemory = random() * 0.4 - 0.2;
        let rainfallMemory = random() * 0.7 - 0.35;
        let lastColorIndex = -1;
        let lastToneIndex = -1;
        const weatherSummary = { minRainfall: Infinity, maxRainfall: -Infinity, dryYears: 0, wetYears: 0 };

        for (let year = 1; year <= TARGET_AGE; year++) {
          climateMemory = climateMemory * 0.68 + (random() * 2 - 1) * 0.42;
          rainfallMemory = rainfallMemory * 0.46 + (random() * 2 - 1) * 0.88;
          const slowCycle = Math.sin(year * 0.071 + forces.temperaturePhase) * 0.56;
          const fastCycle = Math.sin(year * 0.39 + forces.temperaturePhase * 1.7) * 0.18;
          const rainCycle = Math.sin(year * 0.093 + rainPhase) * 0.64 + Math.sin(year * 0.31 + rainPhase * 0.6) * 0.28;
          const droughtShock = random() < 0.062 ? -lerp(0.48, 1.36, random()) : 0;
          const wetShock = random() < 0.058 ? lerp(0.4, 1.2, random()) : 0;
          const rainfallSignal = clamp(rainCycle + rainfallMemory + droughtShock + wetShock, -1.95, 1.9);
          const ageTaper = Math.exp(-year / 155);
          const temperatureSignal = clamp(
            (forces.temperatureMean - 7) / 17 + (slowCycle + fastCycle + climateMemory) * forces.temperatureVolatility,
            -1.35,
            1.35
          );
          weatherSummary.minRainfall = Math.min(weatherSummary.minRainfall, rainfallSignal);
          weatherSummary.maxRainfall = Math.max(weatherSummary.maxRainfall, rainfallSignal);
          if (rainfallSignal < -0.62) weatherSummary.dryYears += 1;
          if (rainfallSignal > 0.62) weatherSummary.wetYears += 1;
          const wetSurge = Math.pow(clamp((rainfallSignal - 0.18) / 1.5, 0, 1), 1.18);
          const droughtDrag = Math.pow(clamp((-rainfallSignal - 0.22) / 1.55, 0, 1), 1.08);

          const midAgeDip = 1 - 0.15 * Math.exp(-Math.pow((year - 62) / 44, 2));
          const baseGrowth =
            (2.22 +
              1.62 * ageTaper +
              Math.sin(year * 0.043 + soilPhase) * 0.28 +
              Math.sin(year * 0.17 + grainPhase) * 0.18) *
            midAgeDip;
          const rawAnnualWeatherSignal =
            1 +
            rainfallSignal * 0.54 +
            wetSurge * 1.18 -
            droughtDrag * 0.48 +
            temperatureSignal * 0.16 +
            (random() - 0.5) * (0.4 + wetSurge * 0.34);
          const youthResponse = lerp(0.38, 1, smootherStep((year - 8) / 34));
          const oldAgeResponse = lerp(1, 0.38, smootherStep((year - 92) / 108));
          const weatherSensitivity = youthResponse * oldAgeResponse;
          const annualWeatherSignal = 1 + (rawAnnualWeatherSignal - 1) * weatherSensitivity;
          const annualWeatherWidth = clamp(
            annualWeatherSignal >= 1
              ? 1 + (annualWeatherSignal - 1) * 1.16
              : 1 - (1 - annualWeatherSignal) * 1.68,
            0.09,
            2.6
          );
          const previous = boundaries[year - 1];
          let boundary = new Array(SAMPLE_COUNT);
          let widthTotal = 0;
          const ageIrregularity = ageIrregularityFor(year);
          const regionalNoise = smoothLoop(
            Array.from({ length: SAMPLE_COUNT }, () => random() * 2 - 1),
            2,
            0.76
          );

          for (let i = 0; i < SAMPLE_COUNT; i++) {
            const a = angles[i];
            const detailT = ageIrregularityFor(year);
            regionalMemory[i] = clamp(regionalMemory[i] * 0.82 + regionalNoise[i] * 0.28, -0.72, 0.72);
            // Wound geometry persists for decades without becoming a permanent
            // annual growth penalty. This lets later rings gradually close over
            // old fire and pest scars instead of deepening the same cleft forever.
            deformationMemory[i] *= 0.982;
            const sunBias = forces.sunPower * (0.16 * Math.cos(a - forces.sunAngle) + 0.035 * Math.cos(2 * (a - forces.sunAngle)));
            const windBias =
              forces.windExposure *
              (-0.19 * Math.cos(a - forces.windFrom) + 0.055 * Math.cos(2 * (a - forces.windFrom + 0.4)));
            const slopeBias = forces.groundPower * (0.2 * Math.cos(a - forces.slopeDown) - 0.035 * Math.cos(3 * (a - forces.slopeDown)));
            const soilBias =
              0.045 * Math.sin(a * 3 + soilPhase) +
              0.034 * lerp(0.08, 1, detailT) * Math.sin(a * 7 - year * 0.045 + grainPhase) +
              0.023 * lerp(0, 1, detailT) * Math.sin(a * 13 + year * 0.075 + soilPhase * 0.6);
            const climateBias = temperatureSignal * 0.035 * Math.sin(a * 2 + year * 0.08 + forces.temperaturePhase);
            const rainfallBias =
              rainfallSignal * (0.044 + wetSurge * 0.065) * Math.sin(a * 5 - year * 0.12 + rainPhase) +
              wetSurge * 0.052 * Math.sin(a * 9 + year * 0.19 + rainPhase * 1.7);
            const organicBias = organicGrowthBias(organicField, year, a);
            const memoryBias = cambiumMemory[i] * lerp(0.22, 1.05, ageIrregularity);
            const regionalBias = regionalMemory[i] * lerp(0.22, 0.42, detailT);
            const deformationBias = deformationMemory[i] * lerp(0.7, 1.15, detailT);
            const stress =
              sunBias +
              windBias +
              slopeBias +
              soilBias +
              climateBias +
              rainfallBias +
              organicBias +
              memoryBias +
              regionalBias +
              deformationBias;
            const increment = baseGrowth * annualWeatherWidth * clamp(1 + stress, 0.28, 1.92);
            boundary[i] = previous[i] + increment;
            widthTotal += increment;

            const cambiumNudge =
              organicBias * 0.42 +
              soilBias * 0.26 +
              rainfallBias * 0.34 +
              (sunBias + windBias + slopeBias) * 0.08;
            cambiumMemory[i] = clamp(cambiumMemory[i] * 0.985 + cambiumNudge * lerp(0.006, 0.026, ageIrregularity), -0.62, 0.58);
          }

          boundary = smoothLoop(boundary, 2, lerp(0.86, 0.18, ageIrregularity));
          const activeIncidents = damageEvents.filter((event) => {
            const influenceYears = event.duration + (event.kind === 'pest' ? event.healingYears : 0);
            return year >= event.year && year < event.year + influenceYears;
          });
          if (activeIncidents.length) {
            boundary = applyDamageIncidents(
              boundary,
              previous,
              angles,
              activeIncidents,
              widthTotal / SAMPLE_COUNT,
              year,
              deformationMemory
            );
          }
          boundaries.push(boundary);
          const stressIndex =
            Math.abs(forces.sunPower) +
            forces.windExposure +
            forces.groundPower +
            Math.abs(temperatureSignal) * 0.45 +
            Math.abs(rainfallSignal) * 0.35;
          const colorIndex = nextRandomIndex(activePalette.colors.length, lastColorIndex, colorRandom);
          const toneIndex = nextRandomIndex(RING_TONES.length, lastToneIndex, colorRandom);
          lastColorIndex = colorIndex;
          lastToneIndex = toneIndex;
          rings.push({
            salt,
            temp: temperatureSignal,
            rainfall: rainfallSignal,
            stress: stressIndex,
            meanWidth: widthTotal / SAMPLE_COUNT,
            colorIndex,
            tone: clamp(RING_TONES[toneIndex] + (colorRandom() - 0.5) * 0.055, -0.3, 0.34),
          });
        }

        const maxRadius = Math.max(...boundaries[TARGET_AGE]);
        for (const boundary of boundaries) {
          for (let i = 0; i < boundary.length; i++) boundary[i] /= maxRadius;
        }

        return { angles, boundaries, rings, forces, organicField, damageEvents, weatherSummary, salt };
      }

      function nextRandomIndex(length, previous, random) {
        if (length <= 1) return 0;
        let index = Math.floor(random() * length);
        if (index === previous) {
          index = (index + 1 + Math.floor(random() * (length - 1))) % length;
        }
        return index;
      }

      function makeForces(random) {
        const latitude = random() < 0.52 ? lerp(12, 67, random()) : -lerp(8, 49, random());
        const solarElevation = clamp(88 - Math.abs(latitude) * 0.83 + (random() * 8 - 4), 18, 86);
        const hemisphereSun = latitude >= 0 ? Math.PI / 2 : -Math.PI / 2;
        const sunAngle = hemisphereSun + (random() - 0.5) * (0.34 + (1 - Math.abs(latitude) / 70) * 0.48);
        const windFrom = random() * TAU;
        const windExposure = lerp(0.28, 0.92, Math.pow(random(), 0.72));
        const temperatureMean = lerp(-4.5, 20.5, random());
        const temperatureVolatility = lerp(0.18, 0.82, random());
        const temperaturePhase = random() * TAU;
        const slopeMagnitude = lerp(3.5, 18.5, Math.pow(random(), 0.65));
        const slopeDown = random() * TAU;
        return {
          latitude,
          solarElevation,
          sunAngle,
          sunPower: clamp((90 - solarElevation) / 80 + 0.18, 0.18, 0.82),
          windFrom,
          windExposure,
          temperatureMean,
          temperatureVolatility,
          temperaturePhase,
          slopeMagnitude,
          slopeDown,
          groundPower: slopeMagnitude / 22,
        };
      }

      function makeOrganicField(random) {
        const waves = [];
        const waveCount = 7;
        for (let i = 0; i < waveCount; i++) {
          const order = i + 1;
          waves.push({
            order,
            phase: random() * TAU,
            drift: lerp(-0.018, 0.018, random()),
            amplitude: lerp(0.018, 0.07, random()) / Math.sqrt(order),
          });
        }
        return {
          leanAngle: random() * TAU,
          leanStrength: lerp(0.09, 0.23, random()),
          ovalAngle: random() * TAU,
          ovalStrength: lerp(0.04, 0.12, random()),
          knotAngle: random() * TAU,
          knotStrength: lerp(0.035, 0.105, random()),
          waves,
        };
      }

      function organicGrowthBias(field, year, angle) {
        const t = year / TARGET_AGE;
        const detailT = ageIrregularityFor(year);
        let bias = field.leanStrength * Math.cos(angle - field.leanAngle) * (0.45 + t * 0.95);
        bias += field.ovalStrength * Math.cos(2 * (angle - field.ovalAngle)) * (0.75 + 0.25 * Math.sin(year * 0.026));
        bias +=
          field.knotStrength *
          Math.exp(-Math.pow(angleDelta(angle, field.knotAngle + Math.sin(year * 0.011) * 0.2), 2) / 0.12) *
          Math.sin(year * 0.037 + field.knotAngle);
        for (const wave of field.waves) {
          const envelope = 0.65 + 0.35 * Math.sin(year * 0.019 * wave.order + wave.phase * 0.3);
          const detailGate = wave.order <= 2 ? 1 : smootherStep(detailT * 1.35 - (wave.order - 3) * 0.09);
          bias += wave.amplitude * detailGate * envelope * Math.sin(angle * wave.order + wave.phase + year * wave.drift);
        }
        return clamp(bias, -0.34, 0.38);
      }

      function ageIrregularityFor(year) {
        return smootherStep((year - 20) / 155);
      }

      function makeDamageEvents(random) {
        const events = [
          makeDamageEvent('fire', random, 0),
          makeDamageEvent('pest', random, 1),
        ];
        const extraCount = 2 + Math.floor(random() * 2);
        for (let i = 0; i < extraCount; i++) {
          events.push(makeDamageEvent(DAMAGE_KINDS[Math.floor(random() * DAMAGE_KINDS.length)], random, i + 2));
        }
        events.sort((a, b) => a.year - b.year);
        for (let i = 0; i < events.length; i++) events[i].lane = i % 3;
        return events;
      }

      function makeDamageEvent(kind, random, index) {
        const fire = kind === 'fire';
        const severityRoll = fire ? Math.pow(random(), 0.72) : Math.pow(random(), 0.82);
        const minSeverity = fire ? 0.32 : 0.08;
        const maxSeverity = fire ? 0.96 : 0.86;
        const severity = lerp(minSeverity, maxSeverity, severityRoll);
        const severityT = clamp((severity - minSeverity) / (maxSeverity - minSeverity), 0, 1);
        const duration = clamp(Math.round(lerp(1, 5, Math.pow(severityT, 0.72)) + (random() - 0.5) * 1.25), 1, 5);
        return {
          kind,
          year: Math.floor(lerp(13, TARGET_AGE - 13, random())),
          angle: random() * TAU,
          width: fire ? lerp(0.2, 0.46, random()) : lerp(0.08, 0.34, random()),
          duration,
          healingYears: fire ? 0 : Math.round(lerp(5, 11, severityT)),
          severity,
          seed: random() * 1000 + index * 17,
          lane: 0,
        };
      }

      function applyDamageIncidents(boundary, previous, angles, events, meanWidth, year, deformationMemory) {
        const out = boundary.slice();
        for (let i = 0; i < out.length; i++) {
          const a = angles[i];
          let bite = 0;
          let callus = 0;
          let memoryShift = 0;

          for (const event of events) {
            const eventAge = year - event.year;
            const durationT = event.duration <= 1 ? 0 : eventAge / (event.duration - 1);
            const timeFalloff = event.kind === 'fire'
              ? Math.exp(-eventAge / Math.max(1, event.duration * 0.7))
              : 0.72 + 0.28 * Math.sin((durationT + 0.15) * Math.PI);
            const angular = angleDelta(a, event.angle);
            const angularFalloff = Math.exp(-(angular * angular) / (event.width * event.width));
            const irregular = 0.72 + 0.28 * Math.sin(event.seed + i * 2.17 + eventAge * 1.9);

            if (event.kind === 'fire') {
              // Fire arrests the cambium locally, then eases into recovery. The
              // old first-year heat spike made a mechanically flat notch several
              // ring widths deep, which read as a cut rather than a burn scar.
              const heatPulse = 1 + 0.22 * Math.exp(-eventAge * 1.6);
              bite += meanWidth * event.severity * 3.1 * heatPulse * timeFalloff * angularFalloff * irregular;
              const edgeDistance = Math.abs(Math.abs(angular) - event.width * 1.05);
              const edgeWidth = Math.max(0.034, event.width * 0.26);
              const edgeFalloff = Math.exp(-(edgeDistance * edgeDistance) / (edgeWidth * edgeWidth));
              callus += meanWidth * event.severity * 0.95 * smootherStep((eventAge + 1) / Math.max(2, event.duration)) * edgeFalloff;
              memoryShift += -event.severity * 0.045 * heatPulse * angularFalloff + event.severity * 0.038 * edgeFalloff;
            } else if (eventAge < event.duration) {
              const migration = Math.sin(event.seed + eventAge * 1.4) * event.width * 0.22;
              const movingFalloff = Math.exp(-Math.pow(angleDelta(a, event.angle + migration), 2) / (event.width * event.width));
              const mottled = movingFalloff * (0.52 + 0.48 * Math.sin(a * 19 + event.seed + eventAge * 2.4));
              const outbreak = 0.7 + 0.3 * Math.sin((durationT + 0.08) * Math.PI);
              bite += meanWidth * event.severity * 3.7 * outbreak * Math.max(0, mottled) * irregular;
              callus += meanWidth * event.severity * 0.48 * movingFalloff * Math.max(0, Math.sin(a * 11 - event.seed + eventAge));
              memoryShift +=
                -event.severity * 0.05 * outbreak * Math.max(0, mottled) +
                event.severity * 0.026 * movingFalloff * Math.max(0, Math.sin(a * 11 - event.seed + eventAge));
            } else {
              // After the infestation passes, two callus lips grow around the
              // wound and meet over it. Their accumulated radial growth forms
              // a rounded boil instead of leaving a perforated notch.
              const healingT = clamp((eventAge - event.duration + 1) / event.healingYears, 0, 1);
              const closure = smootherStep(healingT);
              const lipOffset = event.width * lerp(0.78, 0.1, closure);
              const lipWidth = Math.max(0.032, event.width * lerp(0.3, 0.48, closure));
              const lipDistance = Math.abs(angular) - lipOffset;
              const lips = Math.exp(-(lipDistance * lipDistance) / (lipWidth * lipWidth));
              const domeWidth = Math.max(0.05, event.width * lerp(0.82, 1.28, closure));
              const dome = Math.exp(-(angular * angular) / (domeWidth * domeWidth));
              const healingPulse = lerp(1.45, 0.42, closure);
              const wrappedGrowth = lips * (1 - closure * 0.28) + dome * closure * 0.72;
              callus += meanWidth * event.severity * healingPulse * wrappedGrowth;
              memoryShift += event.severity * 0.018 * wrappedGrowth * (1 - closure * 0.55);
            }
          }

          deformationMemory[i] = clamp(deformationMemory[i] + memoryShift * 2.35, -0.78, 0.68);
          const incidentCenter = bite > callus;
          const minAdvance = meanWidth * (incidentCenter ? 0.09 : 0.12);
          out[i] = Math.max(previous[i] + minAdvance, out[i] - bite + callus);
        }
        return smoothLoop(out, 1, 0.36);
      }

      function smoothLoop(values, passes, strength = 1) {
        let out = values.slice();
        const amount = clamp(strength, 0, 1);
        for (let pass = 0; pass < passes; pass++) {
          const next = new Array(out.length);
          for (let i = 0; i < out.length; i++) {
            const a = out[(i - 1 + out.length) % out.length];
            const b = out[i];
            const c = out[(i + 1) % out.length];
            const smoothed = a * 0.24 + b * 0.52 + c * 0.24;
            next[i] = lerp(b, smoothed, amount);
          }
          out = next;
        }
        return out;
      }


  }
  return { create };
})();
