/**
 * @class
 * @extends Genetic<Banner>
 * @inheritdoc
 */
class BannerGenetic extends Genetic {

  constructor(totalColors, totalPatterns, population, probBestReplace, randomGen) {
    super(population, probBestReplace, randomGen);
    this.totalColors = totalColors;
    this.totalPatterns = totalPatterns;

    /**
     * @type {WeakMap<Banner, OffscreenCanvasRenderingContext2D>}
     */
    this.contexts = new WeakMap();

    /**
     * Objective banner data to compute fitness
     * @type {ImageData}
     */
    this.referenceData = null;
  }

  /**
   * @override
   */
  select() {
    const roullete = this.population.map(this.fitness.bind(this));
    const totalFitness = roullete.reduce((a,b) => a + b);

    const selection = new Set();
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

      /**
       * @type {Banner}
       */
      const selectedBanner = this.population[currentPos-1];
      selection.add(selectedBanner);

      // if duplicate, clone banner
      if (selection.size === i) {
        selection.add(selectedBanner.clone());
      }

    }

    return [...selection];
  };


  /**
   * @override
   * @inheritdoc
   */
  fitness(individual) {
    let error = 0;

    const context = this.contexts.get(individual);
    const referenceData = this.referenceData.data;
    const imageData = context.getImageData(0,0, context.canvas.width, context.canvas.height);
    const data = imageData.data;

    // get color error
    for (let i = 0; i < data.length; i += 4) {
      error += (referenceData[i]   - data[i]  )**2;
      error += (referenceData[i+1] - data[i+1])**2;
      error += (referenceData[i+2] - data[i+2])**2;

      const referenceMax = Math.max(referenceData[i], referenceData[i+1], referenceData[i+2]);
      const referenceMin = Math.min(referenceData[i], referenceData[i+1], referenceData[i+2]);

      const dataMax = Math.max(data[i], data[i+1], data[i+2]);
      const dataMin = Math.min(data[i], data[i+1], data[i+2]);

      error += (Math.abs(referenceMax - referenceMin) - Math.abs(dataMax - dataMin))**2;
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
   * @param {Banner} individual
   */
  mutation(individual) {
    const bannerPatterns = individual.patterns;

    // random pattern/color mutation
    for (let i = 0; i < bannerPatterns.length; i++) {
      if (this.random() < 0.15) {

        // if pos is even then is a color
        // if is odd then is a pattern or layer termination
        const range = i % 2 === 0 ? this.totalColors : this.totalPatterns;

        // mutate at pos i
        bannerPatterns[i] = Math.floor(range * this.random());
      }
    }

    // layer exchange mutation
    for (let i = 1; i < bannerPatterns.length - 2; i += 2) {
      if (this.random() < 0.05) {

        const direction = 4 * Math.round(this.random() + 0.05) - 2;

        if (i + direction >= 0) {
          const temp = bannerPatterns[i];
          bannerPatterns[i] = bannerPatterns[i + direction];

          bannerPatterns[i + direction] = temp;
        }
        const temp = bannerPatterns[i + 1];
        bannerPatterns[i + 1] = bannerPatterns[i + direction + 1];
        bannerPatterns[i + direction + 1] = temp;
      }
    }

  };

}
