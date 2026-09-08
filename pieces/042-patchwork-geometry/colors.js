const colorPalettes = {
    miyabi: { 
        name:"Miyabi",
        list: [
        {name: "sakura", en: "cherry blossom", color: [255, 153, 153]},
        {name: "mizu", en: "water", color: [153, 204, 255]},
        {name: "kuro", en: "black", color: [0, 0, 0]},
        {name: "shiro", en: "white", color: [255, 255, 255]},
        {name: "kinari", en: "golden", color: [255, 204, 153]},
        {name: "midori", en: "green", color: [51, 153, 102]},
        {name: "beni", en: "crimson", color: [255, 51, 51]},
        {name: "kikyo", en: "bellflower", color: [255, 102, 178]},
        {name: "sora", en: "sky", color: [31, 133, 235]},
        {name: "kiiro", en: "yellow", color: [255, 153, 51]}
    ],
    bg: [
        { name: "sakura", en: "cherry blossom", color: [255, 215, 215] },
        { name: "mizu", en: "water", color: [183, 206, 240] },
        { name: "kuro", en: "black", color: [90, 90, 90] },
        { name: "shiro", en: "white", color: [230, 230, 230] },
        { name: "kinari", en: "golden", color: [255, 240, 210] },
        { name: "midori", en: "green", color: [215, 240, 224] },
        { name: "beni", en: "crimson", color: [255, 224, 224] },
        { name: "kikyo", en: "bellflower", color: [240, 215, 236] },
        { name: "sora", en: "sky", color: [200, 230, 255] },
        { name: "kiiro", en: "yellow", color: [255, 240, 200] }
    ]},
    iro_e: { 
        name:"IroE",
        list: [
        {name: "aka", en: "red", color: [235, 0, 0]},
        {name: "ao", en: "blue-green", color: [0, 153, 153]},
        {name: "ki", en: "yellow", color: [255, 153, 0]},
        {name: "midori", en: "green", color: [0, 153, 51]},
        {name: "murasaki", en: "purple", color: [153, 0, 153]},
        {name: "shiro", en: "white", color: [255, 255, 255]},
        {name: "sora", en: "sky", color: [51, 153, 255]},
        {name: "sumire", en: "violet", color: [153, 0, 255]},
        {name: "tsutsuji", en: "azalea", color: [255, 102, 178]},
        {name: "yamabuki", en: "yellow rose", color: [255, 255, 0]}
    ],
    bg: [
        {name: "aka", en: "red", color: [0, 205, 205]},
        {name: "ao", en: "blue-green", color: [255, 102, 102]},
        {name: "ki", en: "yellow", color: [102, 102, 255]},
        {name: "midori", en: "green", color: [102, 102, 255]},
        {name: "murasaki", en: "purple", color: [255, 102, 102]},
        {name: "shiro", en: "white", color: [102, 102, 102]},
        {name: "sora", en: "sky", color: [255, 153, 0]},
        {name: "sumire", en: "violet", color: [255, 255, 0]},
        {name: "tsutsuji", en: "azalea", color: [0, 153, 76]},
        {name: "yamabuki", en: "yellow rose", color: [255, 0, 255]}
    ]},
    nordic: { 
        name:"Nordic",
        list: [
            { name: "YukiArashi", en: "Snow Storm", color: [255, 255, 255] },
            { name: "Fjordu", en: "Fjord", color: [105, 210, 231] },
            { name: "Aisubergu", en: "Iceberg", color: [200, 255, 255] },
            { name: "Aurora", en: "Aurora", color: [255, 179, 71] },
            { name: "Mossu", en: "Moss", color: [174, 213, 129] },
            { name: "Pine", en: "Pine", color: [34, 139, 34] },
            { name: "TasogareTaiyou", en: "Midnight Sun", color: [255, 215, 0] },
            { name: "ArashiNoKumo", en: "Storm Cloud", color: [128, 128, 128] },
            { name: "Seburu", en: "Sable", color: [139, 69, 19] },
            { name: "Abyssu", en: "Abyss", color: [25, 25, 112] }
          ],
          bg: [
            { name: "Frost", en: "frost", color: [214, 237, 255] },
            { name: "Stone", en: "stone", color: [229, 229, 229] },
            { name: "Ice", en: "ice", color: [234, 248, 248] },
            { name: "Sunset", en: "sunset", color: [255, 223, 198] },
            { name: "Mint", en: "mint", color: [211, 245, 221] },
            { name: "Taupe", en: "taupe", color: [72, 60, 50] },
            { name: "Dusk", en: "dusk", color: [206, 220, 230] },
            { name: "Ash", en: "ash", color: [200, 200, 200] },
            { name: "Charcoal", en: "charcoal", color: [94, 96, 98] },
            { name: "Navy", en: "navy", color: [22, 54, 92] }
    ]},
    colorClash: { 
        name:"Color Clash",
        list: [
            {name: "Fuchsia Flash", en: "Neon Pink", color: [255, 0, 102]},
            {name: "Lime Lightning", en: "Neon Green", color: [0, 255, 102]},
            {name: "Gucci 1", en: "Powerclash", color: [28, 180, 104]},
            {name: "Yellow Zest", en: "Neon Yellow", color: [255, 255, 102]},
            {name: "Blue Blaze", en: "Neon Blue", color: [51, 153, 255]},
            {name: "Purple Pop", en: "Neon Purple", color: [178, 102, 255]},
            {name: "Red Rush", en: "Neon Red", color: [255, 0, 0]},
            {name: "Aqua Arc", en: "Neon Cyan", color: [0, 255, 255]},
            {name: "Lemon Luminance", en: "Neon Lime", color: [153, 255, 51]},
            {name: "Magenta Mayhem", en: "Neon Magenta", color: [255, 0, 255]}
        ],
        bg: [
            {name: "Turquoise Thunder", en: "Turquoise", color: [64, 224, 208]},
            {name: "Sunrise Shock", en: "Orange", color: [255, 69, 0]},
            {name: "Gucci 2", en: "Gucci 2", color: [244, 116, 66]},
            {name: "Electric Emerald", en: "Green", color: [50, 205, 50]},
            {name: "Sapphire Strike", en: "Sapphire", color: [15, 82, 186]},
            {name: "Raspberry Riot", en: "Pink", color: [255, 20, 147]},
            {name: "Platinum Pulse", en: "Gray", color: [230, 230, 250]},
            {name: "Neon Noir", en: "Black", color: [0, 0, 0]},
            {name: "Golden Glare", en: "Gold", color: [255, 215, 0]},
            {name: "Violet Voltage", en: "Violet", color: [238, 130, 238]}
        ]
    },
    pastelEarth: { 
        name:"Pastel Earth",
        list: [
            {name: "Mintto", en: "mint", color: [204, 255, 204]},
            {name: "Rakka Pinku", en: "light pink", color: [255, 204, 229]},
            {name: "Rabenda", en: "lavender", color: [204, 178, 229]},
            {name: "Aoi", en: "light blue", color: [178, 204, 229]},
            {name: "Remon", en: "lemon", color: [255, 255, 204]},
            {name: "Piichi", en: "peach", color: [255, 204, 204]},
            {name: "Yaki Daidaiiro", en: "burnt orange", color: [255, 178, 128]},
            {name: "Shiena", en: "sienna", color: [204, 153, 102]},
            {name: "Oribu", en: "olive", color: [178, 178, 102]},
            {name: "Rinrin Midori", en: "forest green", color: [102, 153, 102]}
        ],
        bg: [
            {name: "Suihitsu", en: "soot", color: [77, 77, 77]},
            {name: "SoraIro", en: "sky color", color: [153, 204, 187]},
            {name: "Ginnezumi", en: "silver gray", color: [153, 153, 153]},
            {name: "Araigaki", en: "pale persimmon", color: [255, 204, 153]},
            {name: "Amarancha", en: "amaranth", color: [178, 102, 125]},
            {name: "Rikyūcha", en: "tea brown", color: [128, 85, 51]},
            {name: "Fujinezumi", en: "wisteria gray", color: [136, 128, 153]},
            {name: "Kobaiiro", en: "dark plum", color: [102, 0, 51]},
            {name: "Uguisu", en: "bush warbler", color: [102, 153, 0]},
            {name: "Koikurenai", en: "deep crimson", color: [153, 51, 51]}
        ]
    }
};

let chosenPalette;
function setColors() {
    let paletteNames = Object.keys(colorPalettes);
    let randomPaletteName = paletteNames[Math.floor(EeRandom() * paletteNames.length)];
    chosenPalette = colorPalettes[randomPaletteName];
    
    let randomColorIndex = Math.floor(EeRandom() * chosenPalette.list.length);
    let chosenColor = chosenPalette.list[randomColorIndex];
    // console.log(chosenPalette,randomColorIndex,chosenColor);

    // let randomBgIndex = Math.floor(EeRandom() * chosenPalette.list.length);
    // let chosenBg = chosenPalette.list[randomBgIndex]//chosenPalette.list[randomBgIndex];
    
    // // Keep generating new background color until it's different from the chosen color
    // while (randomBgIndex === randomColorIndex) {
    //   randomBgIndex = Math.floor(EeRandom() * chosenPalette.list.length);
    //   chosenBg = chosenPalette.list[randomBgIndex];
    // }

    let chosenBg = chosenPalette.bg[randomColorIndex];
  
    // let dynamicBg = color(255 - chosenColor.color[0], 255 - chosenColor.color[1], 255 - chosenColor.color[2]);
  
    // let strokeIndex = chosenColor.color;
    strokeColor = chosenColor.color;
    backgroundColor = chosenBg.color;
    debugColors(strokeColor, backgroundColor)
  }
  
  function debugColors(sc, bg) {
    if (window.debugMode) console.log("stroke color: ", sc, sc.color);
    if (window.debugMode) console.log("background color: ", bg.color);
  }
  