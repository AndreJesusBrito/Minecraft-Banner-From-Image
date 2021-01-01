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

const previewCtx = previewCanvas.getContext("2d");

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

    const bannerContext = bannerCanvas.getContext('2d');
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

  window["genetic"] = genetic;

  setInterval(() => {
    genetic.nextGeneration();

    for (let i = 0; i < bannerCanvasContexts.length; i++) {
      const banner = genetic.population[i];
      const bannerContext = bannerCanvasContexts[i];
      banner.render(drawPattern, bannerContext, colors, patterns);
    }

  }, 500);

});
