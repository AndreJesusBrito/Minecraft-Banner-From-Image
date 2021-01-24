
class Banner {

  /**
   * @param {number} maxLayers how many pattern layers at maximum
   * @param {*} totalColors total number of colors
   * @param {*} totalPatterns total number of patterns
   * @returns {Banner} returns a random generated banner
   */
  static newRandom(maxLayers, totalColors, totalPatterns, random = Math.random) {
    const patterns = [];

    const size = maxLayers * 2 + 1;

    // choose random colors
    for (let i = 0; i < size; i += 2) {
      patterns[i] = Math.floor(random() * (totalColors));
    }

    // choose random patterns
    for (let i = 1; i < size; i += 2) {
      patterns[i] = Math.floor(random() * totalPatterns);
    }

    return new Banner(maxLayers, patterns);
  }

  /**
   * @param {number} maxLayers
   * @param {number[]} initialPatterns
   */
  constructor(maxLayers, initialPatterns) {

    /**
     * @type {number}
     */
    this._maxLayers = maxLayers;

    /**
     * @type {number[]}
     */
    this.patterns = new Array(maxLayers * 2 + 1).fill(0);

    // fill initial pattern data
    let i = 0;
    const minDataLength = Math.min(this.patterns.length, initialPatterns.length);
    while (i < minDataLength) {
      this.patterns[i] = initialPatterns[i];
      i++;
    }

  }


  get maxLayers() {
    return this._maxLayers;
  }

  set maxLayers(max) {
    this.patterns.length = max * 2 + 1;
    this._maxLayers = max;
  }

  /**
   * @param {function} drawPattern function to draw each pattern
   * @param {OffscreenCanvasRenderingContext2D} canvasContext context to draw
   * @param {string[]} colors array with the colors codes
   * @param {ImageBitmap[]} patterns array with the pattern images
   */
  render(drawPattern, canvasContext, colors, patterns, colorCanvasCtx, maskCanvasCtx) {

    // render base
    drawPattern(
      // patterns.base,
      patterns[0],
      colors[this.patterns[0]],
      canvasContext,
      colorCanvasCtx,
      maskCanvasCtx
    );

    // paint pattern layers
    for (let i = 1; i < this.patterns.length; i += 2) {

      // stop if no more layers to paint
      if (this.patterns[i] === 0) {
        continue;
      }

      drawPattern(
        patterns[this.patterns[i]],
        colors[this.patterns[i + 1]],
        canvasContext,
        colorCanvasCtx,
        maskCanvasCtx
      );
    }

  }

}
