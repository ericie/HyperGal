// The eleven configurable parameters, carried over from the fxhash build.
// Defaults are drawn from the seeded generator in the original order, so an
// unconfigured load is the same roll the platform would have made at mint.

// Random helpers, verbatim from the shipped bundle.
function rand(low, high) {
  if (Array.isArray(low)) {
    // Like p5.js random(array)
    return randchoice(low);
  }
  if (low === undefined) {
    low = 0;
    high = 1;
  }
  else if (high === undefined) {
    high = low;
    low = 0;
  }
  return $fx.rand() * (high - low) + low;
}

function randint(low, high) {
  return Math.floor(rand(low, high));
}

function randchoice(list) {
  return list[randint(list.length)];
}

function randBool() {
  return (randint(2) == 1) ? true : false;
}

// The twenty palettes the piece offers. Each is built at runtime from the
// custom properties in styles.css; all twenty resolve. The filter below is a
// guard, not a fix — if a palette's properties ever go missing, the sketch
// would throw on an undefined palette rather than simply skip it, so an
// unbuildable name is dropped from the menu instead of being offered.
const ADVERTISED_PALETTES = [
  "Arctic",
  "Art Deco",
  "Camouflage",
  "Color Clash",
  "Crimson Clash",
  "Hokusai",
  "Mint Watermelon",
  "Monotone Cool",
  "Fire",
  "Nordic",
  "Cotton Candy",
  "Rainbow",
  "Viking",
  "Hot Pink",
  "Terminal Green",
  "Terminal Amber",
  "Monet",
  "Constructivist",
  "Black And White",
  "Cyberpunk",
];

const PALETTES = (() => {
  const root = getComputedStyle(document.documentElement);
  const defined = ADVERTISED_PALETTES.filter((name) => {
    const key = name.replace(/\s+/g, '-').toLowerCase();
    return root.getPropertyValue(`--${key}-background`).trim() !== '';
  });
  const dropped = ADVERTISED_PALETTES.filter((n) => !defined.includes(n));
  if (dropped.length) {
    console.warn('Palettes with no colours defined in styles.css:', dropped);
  }
  return defined;
})();

$fx.params([
  {
    id: "anim_speed",
    name: "Animation Speed",
    type: "number",
    options: { min: 1, max: 1000, step: 1 },
    default: rand(90, 1000),
  },
  {
    id: "chaos",
    name: "Chaos Amplifier",
    type: "number",
    options: { min: .5, max: 1.5, step: 0.1 },
    default: rand(.7, 1.5),
  },
  {
    id: "color_palette",
    name: "Color Palette",
    type: "select",
    options: { options: PALETTES },
    default: randchoice(PALETTES),
  },
  {
    id: "curved_lines",
    name: "Curved Lines",
    type: "boolean",
    default: randBool(),
  },
  {
    id: "line_complexity",
    name: "Line Complexity",
    type: "number",
    options: { min: 8, max: 110, step: 1 },
    default: rand(40, 110),
  },
  {
    id: "line_weight",
    name: "Line Weight",
    type: "select",
    options: { options: ["Faint", "Very Light", "Light", "Regular", "Medium", "Heavy"] },
    default: randchoice(["Faint", "Very Light", "Light", "Regular", "Medium", "Heavy"]),
  },
  {
    id: "line_space",
    name: "Line Space",
    type: "select",
    options: { options: ["Close", "Normal", "Loose"] },
    default: randchoice(["Close", "Normal", "Loose"]),
  },
  {
    id: "layout_mode",
    name: "Layout Mode",
    type: "select",
    options: { options: ["Even", "Erratic", "Center"] },
    default: randchoice(["Even", "Erratic", "Center"]),
  },
  {
    id: "peak_height",
    name: "Peak Height",
    type: "select",
    options: { options: ["Very Low", "Low", "Medium", "High"] },
    default: randchoice(["Low", "Medium", "High"]),
  },
  {
    id: "valleys_on",
    name: "Valleys On",
    type: "boolean",
    default: randBool(),
  },
  {
    id: "wave_offset",
    name: "Wave Offset",
    type: "number",
    options: { min: .0001, max: .2, step: 0.0001 },
    default: rand(.0001, .2),
  },
])

$fx.features({
  "Animation Speed": $fx.getParam("anim_speed"),
  "Chaos Amplifier": $fx.getParam("chaos"),
  "Color Palette": $fx.getParam("color_palette"),
  "Curved Lines": $fx.getParam("curved_lines"),
  "Line Complexity": $fx.getParam("line_complexity"),
  "Line Weight": $fx.getParam("line_weight"),
  "Line Spacing": $fx.getParam("line_space"),
  "Layout Mode": $fx.getParam("layout_mode"),
  "Peak Height": $fx.getParam("peak_height"),
  "Valleys On": $fx.getParam("valleys_on"),
  "Wave Offset": $fx.getParam("wave_offset"),
})
