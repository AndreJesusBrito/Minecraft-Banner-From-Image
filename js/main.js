
function createBannerCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 20;
  canvas.height = 40;
  return canvas;
}


/**
 * @type {HTMLCanvasElement}
 */
const referenceCanvas = createBannerCanvas();
document.body.append(referenceCanvas);
const referenceOffscreenCanvas = referenceCanvas.transferControlToOffscreen();

/**
 * @type {HTMLCanvasElement}
 */
const previewCanvas = createBannerCanvas();
document.body.append(previewCanvas);
const previewOffscreenCanvas = previewCanvas.transferControlToOffscreen();



/**
 * banner render helper canvas
 * @type {HTMLCanvasElement}
 */
const colorCanvasCtx = createBannerCanvas();
const colorOffscreenCanvas = colorCanvasCtx.transferControlToOffscreen();

/**
 * banner render helper canvas
 * @type {HTMLCanvasElement}
 */
const maskCanvasCtx = createBannerCanvas();
const maskOffscreenCanvas = maskCanvasCtx.transferControlToOffscreen();





/**
 * @type {OffscreenCanvas[]}
 */
const populationOffsetCanvas = [];
for (let i = 0; i < 100; i++) {
  const bannerCanvas = createBannerCanvas();
  document.body.append(bannerCanvas);
  populationOffsetCanvas.push(bannerCanvas.transferControlToOffscreen());
}

const geneticWorker = new Worker('./js/genetic_worker.js');



geneticWorker.onmessage = function(e) {
  console.log("ready to go", e);
  geneticWorker.postMessage({message: 'start'});
}


loadPatterns().then((patterns) => {
  geneticWorker.postMessage({
    message: 'init',
    referenceCanvas: referenceOffscreenCanvas,
    previewCanvas: previewOffscreenCanvas,
    populationCanvas: populationOffsetCanvas,
    colorOffscreenCanvas,
    maskOffscreenCanvas,
    patterns: patterns,
  }, [
    referenceOffscreenCanvas,
    previewOffscreenCanvas,
    colorOffscreenCanvas,
    maskOffscreenCanvas,
    ...populationOffsetCanvas,
    ...patterns
  ]);
});
