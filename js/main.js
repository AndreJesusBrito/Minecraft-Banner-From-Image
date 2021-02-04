/**
 * @type {HTMLInputElement}
 */
const startBtn = document.getElementById('startBtn');

/**
 * @type {HTMLInputElement}
 */
const toleranceInput = document.getElementById('toleranceInput');

/**
 * @type {HTMLInputElement}
 */
const populationSizeInput = document.getElementById('populationSizeInput');

/**
 * @type {HTMLInputElement}
 */
const maxLayersInput = document.getElementById('maxLayersInput');

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



const geneticWorker = new Worker('./js/genetic_worker.js');



geneticWorker.onmessage = function(e) {
  console.log("ready to go", e);
  geneticWorker.postMessage({message: 'start'});
}


loadPatterns().then((patterns) => {

  startBtn.disabled = false;

  startBtn.addEventListener('click', () => {

    // don't run if disabled
    if (startBtn.disabled) return;

    startBtn.disabled = true;

    /**
     * @type {OffscreenCanvas[]}
     */
    const populationOffsetCanvas = [];
    for (let i = 0; i < Number(populationSizeInput.value); i++) {
      const bannerCanvas = createBannerCanvas();
      document.body.append(bannerCanvas);
      populationOffsetCanvas.push(bannerCanvas.transferControlToOffscreen());
    }

    geneticWorker.postMessage({
      message: 'init',

      tolerance: Number(toleranceInput.value),
      populationSize: Number(populationSizeInput.value),
      maxLayers: Number(maxLayersInput.value),

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

});
