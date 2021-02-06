importScripts(
  'util.js',
  'Genetic.js',
  'banner_drawing.js',
  'Banner.js',
  'Banner_Genetic.js',
);

// control variable if the genetic algorithm is running
let running = false;

// control variable if the genetic algorithm already found
let done = false;


const random_seed = Math.floor(Math.random() * 124717);
console.log("The random seed is ", random_seed);
const random = LCG_random_factory(random_seed);



/**
 * @type {OffscreenCanvasRenderingContext2D}
 */
let referenceCtx = null;

/**
 * @type {OffscreenCanvasRenderingContext2D}
 */
let colorOffscreenCtx = null;
/**
 * @type {OffscreenCanvasRenderingContext2D}
 */
let maskOffscreenCtx = null;


/**
 * @type {ImageBitmap[]}
 */
let patterns = [];

/**
 * Maps the banners with they canvas
 * @type {OffscreenCanvasRenderingContext2D[]}
 */
const bannerCanvasContexts = [];


/**
 * @type {BannerGenetic}
 */
let genetic = null;



let maxLayers;
let tolerance;
let populationSize;



// setup objective reference image
let referenceBanner = null;




function init(data) {
  maxLayers = data.maxLayers;
  tolerance = data.tolerance;
  populationSize = data.populationSize;


  referenceCtx = data.referenceCanvas.getContext('2d', { alpha: true });

  // banner render helper canvas
  colorOffscreenCtx = data.colorOffscreenCanvas.getContext('2d');
  maskOffscreenCtx = data.maskOffscreenCanvas.getContext('2d');

  patterns = data.patterns;

  for (const canvas of data.populationCanvas) {
    bannerCanvasContexts.push(canvas.getContext('2d', { alpha: true }));
  }

  referenceBanner = Banner.newRandom(maxLayers, colors.length, patterns.length, random)
  referenceBanner.render(drawPattern, referenceCtx, colors, patterns, colorOffscreenCtx, maskOffscreenCtx);

  // TEMP add some delay to draw the reference banner
  setTimeout(() => {
  postMessage({message: 'ready'});
  }, 0);
}

function getRandomPopulation() {
  const initialPopulation = [];
  for (let i = 0; i < populationSize; i++) {
    const banner = Banner.newRandom(maxLayers, colors.length, patterns.length, random);

    initialPopulation.push(banner);

    banner.render(drawPattern, bannerCanvasContexts[i], colors, patterns, colorOffscreenCtx, maskOffscreenCtx);
  }
  return initialPopulation;
}

function start() {
  const referenceData = referenceCtx.getImageData(0,0,referenceCtx.canvas.width, referenceCtx.canvas.height);

  done = false;

  const initialPopulation = getRandomPopulation();

  genetic = new BannerGenetic(
    colors.length, patterns.length,
    initialPopulation,
    () => .5,
    random
  );

  genetic.tolerance = tolerance;

  // set objective reference data
  genetic.referenceData = referenceData;


  // set initial population canvas contexts
  for (let i = 0; i < bannerCanvasContexts.length; i++) {
    const banner = genetic.population[i];
    const context = bannerCanvasContexts[i];
    genetic.contexts.set(banner, context);
  }

  resume();
}


async function resume() {
  running = true;

  let best = genetic.best;

  const bestsFitness = [];
  const averageFitness = [];

  while (genetic.toleranceCount < genetic.tolerance && running ) {
    genetic.nextGeneration();

    // pass the contexts to the new generation
    for (let i = 0; i < bannerCanvasContexts.length; i++) {
      const banner = genetic.population[i];
      const context = bannerCanvasContexts[i];
      genetic.contexts.set(banner, context);
    }

    // TEMP render all banners
    for (const banner of genetic.population) {
      const bannerContext = genetic.contexts.get(banner);
      banner.render(drawPattern, bannerContext, colors, patterns, colorOffscreenCtx, maskOffscreenCtx);
    }

    bestsFitness.push(1/Math.sqrt(genetic.generationBestFitness));
    averageFitness.push(1/Math.sqrt(genetic.averageFitness));

    genetic.toleranceCount++;


    if (genetic.best !== best) {
      best = genetic.best;

      console.log("new best found");

      postMessage({message: 'new_best', patterns: genetic.best.patterns});

      // if the global solution is found then stop
      if (genetic.generationBestFitness === Infinity) break;
    }

  }

  console.log("done");
  console.table(bestsFitness);
  console.table(averageFitness);

}


onmessage = function(e) {
  const message = e.data.message;

  switch (message) {
    case 'init':
      init(e.data);
      break;
    case 'start':
      const banners = getRandomPopulation();
      for (let i = 0; i < populationSize; i++) {
        const banner = banners[i];
        banner.render(drawPattern, bannerCanvasContexts[i], colors, patterns, colorOffscreenCtx, maskOffscreenCtx);
      }
      start();
      break;
  }
}
