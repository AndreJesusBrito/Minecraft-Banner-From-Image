/**
 * Base genetic algorithm class
 * @abstract
 * @template T
 */
class Genetic {

  /**
   * @param {T[]} population array with initial population
   * @param {number} probBestReplace probability to the best to be put in the population
   * @param {function(): number} randomGen a random generator in the interval [0,1)
   */
  constructor(population, probBestReplace, randomGen) {
    this.population = population;
    this.probBestReplace = probBestReplace;
    this.random = randomGen;

    // init stats
    this._resetStats();

    /**
     * @type {number}
     */
    this.tolerance = null;

    /**
     * @type {number}
     */
    this.toleranceCount = 0;
  }

  /**
   * @abstract
   * @returns {T[]} the selected individuals (same size as original)
   */
  select() {
    throw Error("select not implemented");
  }

  /**
   * @abstract
   * @param {T} individual invidual to get fitness
   * @returns {number} the fitness of individual
   */
  fitness(individual) {
    throw Error("fitness not implemented");
  }

  /**
   * @abstract
   * @param {T} parent1 first individual
   * @param {T} parent2 second individual
   * @returns {T[2]} array with the two children generated
   */
  crossover(parent1, parent2) {
    throw Error("crossover not implemented");
  }

  /**
   * @abstract
   * @param {T} individual
   */
  mutation(individual) {
    throw Error("mutation not implemented");
  }


  get populationSize() {
    return this.population.length;
  }

  get averageFitness() {
    return this._stats.totalFitness / this.population.length;
  }

  get totalFitness() {
    return this._stats.totalFitness;
  }

  get best() {
    return this._stats.best;
  }

  get generationBest() {
    return this._stats.generationBest;
  }

  get generationBestFitness() {
    return this._stats.generationBestFitness;
  }

  get generationCount() {
    return this._stats.generationCount;
  }

  _resetStats() {
    this._stats = {
      best: this.population[0],      // TODO take the best
      currentBestFitness: -Infinity, // TODO ^
      generationBest: null,
      generationBestFitness: 0,
      totalFitness: 0,
      generationCount: 0,
    }
  }

  _getShuffleIndexes(selected) {
    const shuffledOrder = [];
    for (let i = 0; i < selected.length; i++) {
      shuffledOrder[i] = i;
    }
    for (let i = 0; i < selected.length; i++) {
      const r1 = Math.floor(this.random() * selected.length);
      const r2 = Math.floor(this.random() * selected.length);

      const temp = shuffledOrder[r1];
      shuffledOrder[r1] = shuffledOrder[r2];
      shuffledOrder[r2] = temp;
    }
    return shuffledOrder;
  }

  _updateStats() {
    let totalFitness = 0;
    let currentBest;
    let generationBestFitness = -Infinity;

    for (const individual of this.population) {
      const individualFitness = this.fitness(individual);

      // update generation best
      if (individualFitness > generationBestFitness) {
        currentBest = individual;

        generationBestFitness = individualFitness;
      }

      totalFitness += individualFitness;
    }

    this._stats.totalFitness = totalFitness;
    this._stats.generationBest = currentBest;
    this._stats.generationBestFitness = generationBestFitness;
    this._stats.generationCount++;

    // update global best if there was an
    // improvement in the current generation
    if (generationBestFitness > this._stats.currentBestFitness) {
      this._stats.best = currentBest;
      this._stats.currentBestFitness = generationBestFitness;
      this.toleranceCount = 0;
    }
  }

  nextGeneration() {
    const selected = this.select();

    // best replacement
    // if (best) {
    //   const randomPos = Math.floor(Math.random() * this.population.length);
    //   this.population[randomPos] = best;
    // }

    this._updateStats();

    const shuffledOrder = this._getShuffleIndexes(selected);

    const newPopulation = [];
    for (let i = 1; i < selected.length; i += 2) {
      const r1 = shuffledOrder[i-1];
      const r2 = shuffledOrder[i];

      const children = this.crossover(selected[r1], selected[r2]);

      this.mutation(children[0]);
      this.mutation(children[1]);

      newPopulation.push(children[0], children[1]);
    }

    this.population = newPopulation;

    if (this.random() < this.probBestReplace) {
      const pos = Math.floor(this.random()) * this.population.length;
      this.population[pos] = this.best;
    }

  }

}
