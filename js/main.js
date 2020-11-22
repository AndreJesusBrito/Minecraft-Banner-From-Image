import {Banner} from './Banner.js'
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
  for (let i = 0; i < 100; i++) {
    const myBanner = new Banner(5, [
      random(0, 16),
      random(1, patterns.length - 1),
      random(0, colors.length - 1),

      random(0, patterns.length - 1),
      random(0, colors.length - 1),

      random(0, patterns.length - 1),
      random(0, colors.length - 1),

      random(0, patterns.length - 1),
      random(0, colors.length - 1),
    ]);

    const bannerCanvas = document.createElement("canvas");
    bannerCanvas.width = 20;
    bannerCanvas.height = 40;

    const bannerContext = bannerCanvas.getContext('2d');
    document.body.append(bannerCanvas);


    myBanner.render(drawPattern, bannerContext, colors, patterns);

    bannerCanvasContexts.push(bannerContext);

  }

});
