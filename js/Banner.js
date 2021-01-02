import { Genetic } from "./Genetic.js";

export class Banner {

  /**
   * @param {number} maxLayers how many pattern layers at maximum
   * @param {*} totalColors total number of colors
   * @param {*} totalPatterns total number of patterns
   * @returns {Banner} returns a random generated banner
   */
  static newRandom(maxLayers, totalColors, totalPatterns) {
    const patterns = [];

    const size = maxLayers * 2 + 1;

    // choose random colors
    for (let i = 0; i < size; i += 2) {
      patterns[i] = Math.floor(Math.random() * (totalColors));
    }

    // choose random patterns
    for (let i = 1; i < size; i += 2) {
      patterns[i] = Math.floor(Math.random() * totalPatterns);
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
   * @param {CanvasRenderingContext2D} canvasContext context to draw
   * @param {string[]} colors array with the colors codes
   * @param {HTMLImageElement[]} patterns array with the pattern images
   */
  render(drawPattern, canvasContext, colors, patterns) {

    // render base
    drawPattern(
      // patterns.base,
      patterns[0],
      colors[this.patterns[0]],
      canvasContext
    );

    // paint pattern layers
    for (let i = 1; i < this.patterns.length; i += 2) {

      // stop if no more layers to paint
      if (this.patterns[i] === 0) {
        break;
      }

      drawPattern(
        patterns[this.patterns[i]],
        colors[this.patterns[i + 1]],
        canvasContext
      );
    }

  }

}





/**
 * @class
 * @extends Genetic<Banner>
 * @inheritdoc
 */
export class BannerGenetic extends Genetic {

  constructor(totalColors, totalPatterns, population, probBestReplace, randomGen) {
    super(population, probBestReplace, randomGen);
    this.totalColors = totalColors;
    this.totalPatterns = totalPatterns;

    /**
     * @type {WeakMap<Banner, CanvasRenderingContext2D>}
     */
    this.contexts = new WeakMap();

  }

  /**
   * @override
   */
  select() {
    const roullete = this.population.map(this.fitness.bind(this));
    const totalFitness = roullete.reduce((a,b) => a + b);

    const selection = [];
    const k = 1 / this.population.length;
    const globalPointer = this.random() * totalFitness;

    for (let i = 0; i < this.population.length; i++) {
      const pointer = (globalPointer + k * i) % totalFitness;
      let acummutator = 0;
      let currentPos = 0;
      while (acummutator < pointer) {
        acummutator += roullete[currentPos++];
      }

      if (currentPos === 0) currentPos = 1;

      selection.push(this.population[currentPos-1]);
    }

    return selection;
  };


  /**
   * @override
   * @inheritdoc
   */
  fitness(individual) {
    let error = 0;

    const context = this.contexts.get(individual);
    const data = context.getImageData(0,0, context.canvas.width, context.canvas.height).data;

    for (let i = 0; i < data.length; i += 4) {
      error += (255 - data[i])**2;

      error += data[i+1]**2;
      error += data[i+2]**2;
    }

    return 1/error;
  }


  /**
   * @override
   */
  crossover(parent1, parent2) {
    const child1Genes = [];
    const child2Genes = [];

    const co_point = Math.floor(this.random() * (parent1.patterns.length-1) + 1);

    for (let i = 0; i < co_point; i++) {
      child1Genes.push(parent1.patterns[i]);
      child2Genes.push(parent2.patterns[i]);
    }
    for (let i = co_point; i < parent1.length; i++) {
      child1Genes.push(parent2.patterns[i]);
      child2Genes.push(parent1.patterns[i]);
    }

    const child1 = new Banner(parent1.maxLayers, child1Genes);
    const child2 = new Banner(parent2.maxLayers, child2Genes);

    return [child1, child2];
  }


  /**
   * @override
   */
  mutation(individual) {
    if (this.random() < 0.2) {
      const bannerPatterns = individual.patterns;

      // choose a random gene to mutate
      const pos = Math.floor(this.random() * bannerPatterns.length);

      // if pos is even then is a color
      // if is odd then is a pattern or layer termination
      const range = pos % 2 === 0 ? this.totalColors : this.totalPatterns;

      // mutate at pos
      bannerPatterns[pos] = Math.floor(range * this.random());
    }
  };

}
