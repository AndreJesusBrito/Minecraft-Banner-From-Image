import {random} from './util.js'
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

loadPatterns().then((patterns) => {
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

  myBanner.render(drawPattern, previewCtx, colors, patterns);
});
