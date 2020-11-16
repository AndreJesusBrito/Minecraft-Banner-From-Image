export class Banner {

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


  render(drawPattern, canvasContext, colorMap, patternMap) {

    // render base
    drawPattern(
      // patternMap.base,
      patternMap[0],
      colorMap[this.patterns[0]],
      canvasContext
    );

    // paint pattern layers
    for (let i = 1; i < this.patterns.length; i += 2) {

      // stop if no more layers to paint
      if (this.patterns[i] === 0) {
        break;
      }

      drawPattern(
        patternMap[this.patterns[i]],
        colorMap[this.patterns[i + 1]],
        canvasContext
      );
    }

  }

}
