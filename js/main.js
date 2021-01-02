import {Banner, BannerGenetic} from './Banner.js'
import {loadPatterns} from './pattern_loader.js'
import {colors, drawPattern} from './banner_drawing.js'


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


loadPatterns().then((patterns) => {
  const initialPopulation = [];

  for (let i = 0; i < 100; i++) {
    const banner = Banner.newRandom(2, colors.length, patterns.length);

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
    Math.random
  );


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
