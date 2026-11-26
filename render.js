const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
  .map(value => (value + .5) / 16);

export function renderField(image, palette, field, time) {
  const {width, height, data} = image;
  const aspectCorrection = height / width;
  for (let y = 0; y < height; y++) {
    const v = (y / height - .5) * aspectCorrection;
    const matrixRow = (y & 3) * 4;
    for (let x = 0; x < width; x++) {
      const value = field(x / width - .5, v, time, aspectCorrection);
      const level = (value < 0 ? 0 : value > .999 ? .999 : value) * 4;
      const base = level | 0;
      const index = level - base > bayer[matrixRow + (x & 3)] ? base + 1 : base;
      const color = palette[index];
      const pixel = (y * width + x) * 4;
      data[pixel] = color[0];
      data[pixel + 1] = color[1];
      data[pixel + 2] = color[2];
      data[pixel + 3] = 255;
    }
  }
}

export function renderLoopFrame(image, palette, scene, time, duration) {
  const {fn,loopSeconds} = scene;
  if (loopSeconds === duration) {
    renderField(image, palette, fn, time);
    return;
  }

  const blend = time / duration;
  const field = (u, v, _time, aspect) => (1 - blend) * fn(u, v, time + 100, aspect)
    + blend * fn(u, v, time + 100 - duration, aspect);
  renderField(image, palette, field, time);
}
