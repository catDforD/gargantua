(function (root) {
  const SIZE = 28;

  const STROKES = {
    '0': [[[0.50, 0.06], [0.70, 0.12], [0.79, 0.32], [0.80, 0.54], [0.77, 0.76], [0.62, 0.90], [0.40, 0.92], [0.24, 0.80], [0.20, 0.56], [0.21, 0.32], [0.32, 0.13], [0.50, 0.06]]],
    '1': [[[0.52, 0.06], [0.56, 0.92]]],
    '2': [[[0.24, 0.28], [0.36, 0.12], [0.62, 0.08], [0.76, 0.18], [0.74, 0.36], [0.56, 0.56], [0.26, 0.80], [0.20, 0.90], [0.80, 0.90]]],
    '3': [[[0.26, 0.16], [0.52, 0.07], [0.74, 0.16], [0.72, 0.38], [0.52, 0.48], [0.74, 0.58], [0.76, 0.80], [0.56, 0.91], [0.28, 0.86]]],
    '4': [[[0.62, 0.06], [0.24, 0.64], [0.82, 0.64]], [[0.62, 0.06], [0.62, 0.92]]],
    '5': [[[0.76, 0.08], [0.26, 0.08], [0.22, 0.42], [0.54, 0.42], [0.76, 0.54], [0.77, 0.78], [0.56, 0.91], [0.26, 0.87]]],
    '6': [[[0.68, 0.08], [0.42, 0.18], [0.26, 0.48], [0.24, 0.74], [0.38, 0.90], [0.60, 0.91], [0.74, 0.78], [0.72, 0.58], [0.56, 0.48], [0.34, 0.50], [0.24, 0.62]]],
    '7': [[[0.20, 0.08], [0.80, 0.08], [0.42, 0.92]]],
    '8': [[[0.50, 0.06], [0.28, 0.14], [0.28, 0.34], [0.50, 0.47], [0.72, 0.34], [0.72, 0.14], [0.50, 0.06]], [[0.50, 0.47], [0.24, 0.58], [0.24, 0.78], [0.50, 0.92], [0.76, 0.78], [0.76, 0.58], [0.50, 0.47]]],
    '9': [[[0.74, 0.30], [0.62, 0.10], [0.40, 0.07], [0.24, 0.18], [0.24, 0.36], [0.40, 0.47], [0.62, 0.44], [0.74, 0.30]], [[0.74, 0.30], [0.72, 0.58], [0.60, 0.80], [0.42, 0.91]]],
  };

  function segmentDistance(px, py, ax, ay, bx, by) {
    const vx = bx - ax;
    const vy = by - ay;
    const wx = px - ax;
    const wy = py - ay;
    const len2 = vx * vx + vy * vy;
    const t = len2 === 0 ? 0 : Math.min(1, Math.max(0, (wx * vx + wy * vy) / len2));
    const dx = wx - t * vx;
    const dy = wy - t * vy;
    return Math.hypot(dx, dy);
  }

  function rasterize(strokes, width) {
    const half = width / 2;
    const aa = 0.9;
    const out = new Float32Array(SIZE * SIZE);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        let d = Infinity;
        for (const stroke of strokes) {
          for (let i = 0; i < stroke.length - 1; i++) {
            const dist = segmentDistance(
              x + 0.5, y + 0.5,
              stroke[i][0] * SIZE, stroke[i][1] * SIZE,
              stroke[i + 1][0] * SIZE, stroke[i + 1][1] * SIZE
            );
            if (dist < d) d = dist;
          }
        }
        out[y * SIZE + x] = Math.min(1, Math.max(0, 1 - (d - half) / aa));
      }
    }
    return out;
  }

  function preset(name, width) {
    return rasterize(STROKES[name], width === undefined ? 2.4 : width);
  }

  const api = { SIZE, rasterize, preset, digits: Object.keys(STROKES) };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.NNDigits = api;
})(typeof window !== 'undefined' ? window : globalThis);
