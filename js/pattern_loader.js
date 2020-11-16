export const patternMap = {
  "base": null,
  "border": null,
  "bricks": null,
  "circle": null,
  "creeper": null,
  "cross": null,
  "curly_border": null,
  "diagonal_left": null,
  "diagonal_right": null,
  "diagonal_up_left": null,
  "diagonal_up_right": null,
  "flower": null,
  "globe": null,
  "gradient": null,
  "gradient_up": null,
  "half_horizontal": null,
  "half_horizontal_bottom": null,
  "half_vertical": null,
  "half_vertical_right": null,
  "mojang": null,
  "piglin": null,
  "rhombus": null,
  "skull": null,
  "small_stripes": null,
  "square_bottom_left": null,
  "square_bottom_right": null,
  "square_top_left": null,
  "square_top_right": null,
  "straight_cross": null,
  "stripe_bottom": null,
  "stripe_center": null,
  "stripe_downleft": null,
  "stripe_downright": null,
  "stripe_left": null,
  "stripe_middle": null,
  "stripe_right": null,
  "stripe_top": null,
  "triangles_bottom": null,
  "triangles_top": null,
  "triangle_bottom": null,
  "triangle_top": null
};


export async function loadPatterns() {
  return new Promise(function (resolve) {
    const names = Object.getOwnPropertyNames(patternMap);

    /**
     * @type {HTMLImageElement[]}
     */
    const patterns = [];

    for (const name of names) {
      const image = new Image();
      image.src = "img/banner_patterns/" + name + ".png";

      patternMap[name] = image;
      patterns.push(image);
    }

    const interval = setInterval(function () {
      let allLoaded = true;

      for (let i = 0; i < patterns.length && allLoaded; i++) {
        if(!patterns[i].complete) {
          allLoaded = false;
        }
      }

      if (allLoaded) {
        clearInterval(interval);
        resolve(patterns);
      }
    }, 10);

  });
}
