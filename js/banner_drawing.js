
/**
 * @type {string[]}
 */
const colors = [
  "#fcfcfc", // white
  "#fc8f20", // orange
  "#de57d3", // magenta
  "#41c8f3", // light blue
  "#fcf144", // yellow
  "#8fde23", // lime
  "#fc9bbe", // pink
  "#4f585c", // gray
  "#afafa9", // light gray
  "#19aeae", // cyan
  "#9938cd", // purple
  "#434cbe", // blue
  "#925e38", // brown
  "#698a19", // green
  "#c5332a", // red
  "#202025", // black
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
