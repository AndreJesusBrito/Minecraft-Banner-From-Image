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
    const referenceData = this.referenceData.data;
    const imageData = context.getImageData(0,0, context.canvas.width, context.canvas.height);
    const data = imageData.data;

    // get color error
    for (let i = 0; i < data.length; i += 4) {
      error += (referenceData[i]   - data[i]  )**2;
      error += (referenceData[i+1] - data[i+1])**2;
      error += (referenceData[i+2] - data[i+2])**2;
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
