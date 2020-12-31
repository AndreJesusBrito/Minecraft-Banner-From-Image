/**
 * Base genetic algorithm class
 * @abstract
 * @template T
 */
export class Genetic {

  /**
   * @param {T[]} population array with initial population
   * @param {number} probBestReplace probability to the best to be put in the population
   * @param {function(): number} randomGen a random generator in the interval [0,1)
   */
  constructor(population, probBestReplace, randomGen) {
    this.population = population;
    this.probBestReplace = probBestReplace;
    this.random = randomGen;

    this._stats = {
      best: this.population[0],
      generationBest: null,
      generationBestFitness: 0,
      totalFitness: 0,
    }
  }

  /**
   * @abstract
   * @returns {T[]} the selected individuals (same size as original)
   */
  select(population, fitness, random) {
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

  get averageFitness() {
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
    let currentBestFitness = -Infinity;
    let generationBestFitness;

    for (const individual of this.population) {
      const individualFitness = this.fitness(individual);

      // update generation best
      if (individualFitness > currentBestFitness) {
        currentBest = individual;

        currentBestFitness = individualFitness;
        generationBestFitness = individualFitness;
      }

      totalFitness += individualFitness;
    }

    this._stats.totalFitness = totalFitness;
    this._stats.generationBest = currentBest;
    this._stats.generationBestFitness = generationBestFitness;

    // update global best if there was an
    // improvement in the current generation
    if (currentBestFitness > this.fitness(this._stats.best)) {
      this._stats.best = currentBest;
    }
  }

  nextGeneration() {
    const selected = this.select(this.population, this.fitness, this.random);

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

      const children = this.crossover(selected[r1], selected[r2], this.random);

      this.mutation(children[0], this.random);
      this.mutation(children[1], this.random);

      newPopulation.push(children[0], children[1]);
    }

    this.population = newPopulation;

    if (this.random() < this.probBestReplace(this)) {
      const pos = Math.floor(this.random()) * this.population.length;
      this.population[pos] = this._stats.best;
    }

  }

}
