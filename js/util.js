function random(min, max) {
  return min + Math.floor((max + 1 - min) * (1 - Math.random()));
}
