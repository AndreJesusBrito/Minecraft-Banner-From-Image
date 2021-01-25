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


// const random_seed = 88799;
const random_seed = Math.floor(Math.random() * 124717);
console.log("The random seed is ", random_seed);
const random = LCG_random_factory(random_seed);


/**
 * @type {OffscreenCanvasRenderingContext2D}
 */
let previewCtx = null;

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



let maxLayers = 2;



// setup objective reference image
let referenceBanner = null;




function init(data) {
  referenceCtx = data.referenceCanvas.getContext('2d', { alpha: true });
  previewCtx = data.previewCanvas.getContext('2d', { alpha: true });

  // banner render helper canvas
  colorOffscreenCtx = data.colorOffscreenCanvas.getContext('2d');
  maskOffscreenCtx = data.maskOffscreenCanvas.getContext('2d');

  patterns = data.patterns;

  for (const canvas of data.populationCanvas) {
    bannerCanvasContexts.push(canvas.getContext('2d', { alpha: true }));
  }

  postMessage('ready');
}

function getRandomPopulation() {
  const initialPopulation = [];
  for (let i = 0; i < 100; i++) {
    const banner = Banner.newRandom(maxLayers, colors.length, patterns.length, random);

    initialPopulation.push(banner);

    banner.render(drawPattern, bannerCanvasContexts[i], colors, patterns, colorOffscreenCtx, maskOffscreenCtx);
  }
  return initialPopulation;
}

function start() {
  referenceBanner = Banner.newRandom(maxLayers, colors.length, patterns.length, random)
  referenceBanner.render(drawPattern, referenceCtx, colors, patterns, colorOffscreenCtx, maskOffscreenCtx);
  const referenceData = referenceCtx.getImageData(0,0,referenceCtx.canvas.width, referenceCtx.canvas.height);

  done = false;

  const initialPopulation = getRandomPopulation();

  genetic = new BannerGenetic(
    colors.length, patterns.length,
    initialPopulation,
    () => .5,
    random
  );

  genetic.tolerance = 100;

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


function resume() {
  running = true;

  let best = genetic.best;

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

    console.log(1/genetic.generationBestFitness);
    genetic.toleranceCount++;


    if (genetic.best !== best) {
      best = genetic.best;
      best.render(drawPattern, previewCtx, colors, patterns, colorOffscreenCtx, maskOffscreenCtx);
      console.log("new best event goes here");
    }

  }
}


onmessage = function(e) {
  const message = e.data.message;

  switch (message) {
    case 'init':
      init(e.data);
      break;
    case 'start':
      const banners = getRandomPopulation();
      for (let i = 0; i < 100; i++) {
        const banner = banners[i];
        banner.render(drawPattern, bannerCanvasContexts[i], colors, patterns, colorOffscreenCtx, maskOffscreenCtx);
      }
      start();
      break;
  }
}
