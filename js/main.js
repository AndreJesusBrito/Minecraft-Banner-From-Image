import {Banner, BannerGenetic} from './Banner.js'
import {loadPatterns} from './pattern_loader.js'
import {colors, drawPattern} from './banner_drawing.js'
import {LCG_random_factory} from './util.js'


/**
 * @type {HTMLCanvasElement}
 */
const previewCanvas = document.createElement("canvas");
previewCanvas.width = 20;
previewCanvas.height = 40;

document.body.append(previewCanvas);

const previewCtx = previewCanvas.getContext("2d", { alpha: false });
window["previewCtx"] = previewCtx;

/**
 * Maps the banners with they canvas
 * @type {CanvasRenderingContext2D[]}
 */
const bannerCanvasContexts = [];


const random_seed = Math.floor(Math.random() * 124717);
console.log("The random seed is ", random_seed);
const random = LCG_random_factory(random_seed);

loadPatterns().then((patterns) => {
  const initialPopulation = [];

  const maxLayers = 1;

  // setup objective reference image
  const referenceBanner = Banner.newRandom(maxLayers, colors.length, patterns.length, random);
  referenceBanner.render(drawPattern, previewCtx, colors, patterns);
  const referenceData = previewCtx.getImageData(0,0,previewCtx.canvas.width, previewCtx.canvas.height);


  for (let i = 0; i < 100; i++) {
    const banner = Banner.newRandom(maxLayers, colors.length, patterns.length, random);

    const bannerCanvas = document.createElement("canvas");
    bannerCanvas.width = 20;
    bannerCanvas.height = 40;

    const bannerContext = bannerCanvas.getContext('2d', { alpha: false });
    document.body.append(bannerCanvas);

    initialPopulation.push(banner);

    banner.render(drawPattern, bannerContext, colors, patterns);

    bannerCanvasContexts.push(bannerContext);

  }


  const genetic = new BannerGenetic(
    colors.length, patterns.length,
    initialPopulation,
    () => .5,
    random
  );

  // set objective reference data
  genetic.referenceData = referenceData;


  // set initial population canvas contexts
  for (let i = 0; i < bannerCanvasContexts.length; i++) {
    const banner = genetic.population[i];
    const context = bannerCanvasContexts[i];
    genetic.contexts.set(banner, context);
  }

  window["genetic"] = genetic;

  setInterval(() => {
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
      banner.render(drawPattern, bannerContext, colors, patterns);
    }

  }, 500);

});
