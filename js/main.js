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

const bestsSection = document.getElementById('bestSection');

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
const previewCtx = previewCanvas.getContext('2d');



/**
 * banner render helper canvas
 * @type {HTMLCanvasElement}
 */
const colorCanvas = createBannerCanvas();
const colorOffscreenCanvas = colorCanvas.transferControlToOffscreen();

/**
 * banner render helper canvas
 * @type {HTMLCanvasElement}
 */
const maskCanvas = createBannerCanvas();
const maskOffscreenCanvas = maskCanvas.transferControlToOffscreen();



/**
 * banner render helper canvas
 * @type {CanvasRenderingContext2D}
 */
const colorCanvasCtxMain = createBannerCanvas().getContext('2d');

/**
 * banner render helper canvas
 * @type {CanvasRenderingContext2D}
 */
const maskCanvasCtxMain = createBannerCanvas().getContext('2d');



const geneticWorker = new Worker('./js/genetic_worker.js');

let patternsData;


geneticWorker.onmessage = function(e) {
  const message = e.data.message;

  switch (message) {
    case 'ready':
      console.log("ready to go", e);
      geneticWorker.postMessage({message: 'start'});
      break;

    case 'new_best':
      const banner = new Banner(Number(maxLayersInput.value), e.data.patterns);

      // draw evolution mini banner
      const canvas = createBannerCanvas();
      const ctx = canvas.getContext('2d');
      banner.render(drawPattern, ctx, colors, patternsData, colorCanvasCtxMain, maskCanvasCtxMain);
      bestsSection.append(canvas);

      // render in best preview canvas
      banner.render(drawPattern, previewCtx, colors, patternsData, colorCanvasCtxMain, maskCanvasCtxMain);
      break;
  }
}


loadPatterns().then((patterns) => {

  // load patterns for main worker
  loadPatterns().then(patterns => {
    patternsData = patterns;
  });


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
      populationCanvas: populationOffsetCanvas,
      colorOffscreenCanvas,
      maskOffscreenCanvas,
      patterns: patterns,
    }, [
      referenceOffscreenCanvas,
      colorOffscreenCanvas,
      maskOffscreenCanvas,
      ...populationOffsetCanvas,
      ...patterns
    ]);
  });

});
