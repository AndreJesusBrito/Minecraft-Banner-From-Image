
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
function drawPattern(image, color, canvasCtx) {
  const colorCanvas = document.createElement("canvas");
  const colorCanvasCtx = colorCanvas.getContext('2d');
  colorCanvas.width = canvasCtx.canvas.width;
  colorCanvas.height = canvasCtx.canvas.height;


  // fill with the color
  colorCanvasCtx.fillStyle = color;
  colorCanvasCtx.fillRect(0,0, colorCanvas.width, colorCanvas.height);

  // blend the pattern with the color
  colorCanvasCtx.globalCompositeOperation = "multiply";
  colorCanvasCtx.drawImage(image, 1,1,21,41, 0,0,21,41);

  const maskCanvas = document.createElement("canvas");
  const maskCanvasCtx = maskCanvas.getContext('2d');
  maskCanvas.width = canvasCtx.canvas.width;
  maskCanvas.height = canvasCtx.canvas.height;

  // draw pattern mask
  maskCanvasCtx.drawImage(image, 1,1,21,41, 0,0,21,41);

  // draw blenden pattern in the mask
  maskCanvasCtx.globalCompositeOperation = "source-in";
  maskCanvasCtx.drawImage(colorCanvas, 0,0);

  // canvasCtx.globalCompositeOperation = "darken";
  canvasCtx.drawImage(maskCanvas, 0,0);

  // restore default composite operation
  canvasCtx.globalCompositeOperation = "source-over";
}
