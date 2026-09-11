function addFeatures(e) {
  let a = {
    pallet: "Default",
    word: "Word",
    bgShapes: "Evenly distrubuted shapes",
    wordShapes: "All circles",
    posterLayout: "Center"
  };
  e && e.pallet && (a.pallet = e.pallet), e && e.word && (a.word = e.word), e && e.bgShapes && (a.bgShapes = e.bgShapes), e && e.wordShapes && (a.wordShapes = e.wordShapes), e && e.posterLayout && (a.posterLayout = e.posterLayout), window.$fxhashFeatures.colors = a.pallet, window.$fxhashFeatures.word = a.word, window.$fxhashFeatures.shapes_in_background = a.bgShapes, window.$fxhashFeatures.shapes_in_word = a.wordShapes, window.$fxhashFeatures.intial_layout = a.posterLayout, console.log("FXHash Features:", window.$fxhashFeatures)
}
