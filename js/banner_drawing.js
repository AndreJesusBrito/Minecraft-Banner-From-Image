
/**
 * taken from https://colorswall.com/palette/3847/
 * @type {string[]}
 */
const colors = [
  "#f9ffff",
  "#9c9d97",
  "#474f52",
  "#1d1c21",
  "#ffd83d",
  "#f9801d",
  "#b02e26",
  "#825432",
  "#80c71f",
  "#5d7c15",
  "#3ab3da",
  "#169c9d",
  "#3c44a9",
  "#f38caa",
  "#c64fbd",
  "#8932b7",
];

/**
 * @param {CanvasImageSource} image
 * @param {string} color
 * @param {CanvasRenderingContext2D} canvasCtx
 */
function drawPattern(image, color, canvasCtx, colorCanvasCtx, maskCanvasCtx) {
  // clear canvas old data from other patterns
  maskCanvasCtx.globalCompositeOperation = "source-over";
  maskCanvasCtx.clearRect(0, 0, maskCanvasCtx.canvas.width, maskCanvasCtx.canvas.height);
  colorCanvasCtx.globalCompositeOperation = "source-over";

  // fill with the color
  colorCanvasCtx.fillStyle = color;
  colorCanvasCtx.fillRect(0,0, colorCanvasCtx.canvas.width, colorCanvasCtx.canvas.height);

  // blend the pattern with the color
  colorCanvasCtx.globalCompositeOperation = "multiply";
  colorCanvasCtx.drawImage(image, 1,1,21,41, 0,0,21,41);

  // draw pattern mask
  maskCanvasCtx.drawImage(image, 1,1,21,41, 0,0,21,41);

  // draw blenden pattern in the mask
  maskCanvasCtx.globalCompositeOperation = "source-in";
  maskCanvasCtx.drawImage(colorCanvasCtx.canvas, 0,0);

  // canvasCtx.globalCompositeOperation = "darken";
  canvasCtx.drawImage(maskCanvasCtx.canvas, 0,0);

  // restore default composite operation
  canvasCtx.globalCompositeOperation = "source-over";
}
