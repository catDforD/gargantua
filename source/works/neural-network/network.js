(function (root) {
  const SIZE = 28;
  const PIXELS = SIZE * SIZE;

  const DETECTORS = [
    { name: 'H1', cy: 5, cx: 9, angle: 0, len: 13 },
    { name: 'H2', cy: 5, cx: 19, angle: 0, len: 13 },
    { name: 'H3', cy: 14, cx: 9, angle: 0, len: 13 },
    { name: 'H4', cy: 14, cx: 19, angle: 0, len: 13 },
    { name: 'H5', cy: 23, cx: 9, angle: 0, len: 13 },
    { name: 'H6', cy: 23, cx: 19, angle: 0, len: 13 },
    { name: 'V1', cy: 9, cx: 6, angle: 90, len: 13 },
    { name: 'V2', cy: 19, cx: 6, angle: 90, len: 13 },
    { name: 'V3', cy: 9, cx: 14, angle: 90, len: 13 },
    { name: 'V4', cy: 19, cx: 14, angle: 90, len: 13 },
    { name: 'V5', cy: 9, cx: 22, angle: 90, len: 13 },
    { name: 'V6', cy: 19, cx: 22, angle: 90, len: 13 },
    { name: 'D1', cy: 9, cx: 9, angle: 45, len: 14 },
    { name: 'D2', cy: 9, cx: 19, angle: -45, len: 14 },
    { name: 'D3', cy: 19, cx: 9, angle: -45, len: 14 },
    { name: 'D4', cy: 19, cx: 19, angle: 45, len: 14 },
  ];

  const LAYER2 = [
    { name: 'topBar', terms: { H1: 1, H2: 1 } },
    { name: 'midBar', terms: { H3: 1, H4: 1 } },
    { name: 'botBar', terms: { H5: 1, H6: 1 } },
    { name: 'leftBar', terms: { V1: 1, V2: 1 } },
    { name: 'rightBar', terms: { V5: 1, V6: 1 } },
    { name: 'centerBar', terms: { V3: 1, V4: 1 } },
    { name: 'topLoop', terms: { H1: 1, H2: 1, V1: 1, V5: 1 }, thresh: 0.6 },
    { name: 'bottomLoop', terms: { H5: 1, H6: 1, V2: 1, V6: 1 }, thresh: 0.6 },
    { name: 'topLeftCorner', terms: { H1: 1, V1: 1 }, thresh: 0.55 },
    { name: 'topRightCorner', terms: { H2: 1, V5: 1 }, thresh: 0.55 },
    { name: 'bottomLeftCorner', terms: { H5: 1, V2: 1 }, thresh: 0.55 },
    { name: 'bottomRightCorner', terms: { H6: 1, V6: 1 }, thresh: 0.55 },
    { name: 'diagTL', terms: { D1: 1 } },
    { name: 'diagTR', terms: { D2: 1 } },
    { name: 'diagBL', terms: { D3: 1 } },
    { name: 'diagBR', terms: { D4: 1 } },
  ];

  const LAYER3 = [
    { digit: '0', terms: { topBar: 0.617, midBar: -0.15, botBar: 0.676, leftBar: 0.798, rightBar: 0.798, centerBar: -0.265, topLoop: 1.004, bottomLoop: 1.048, topLeftCorner: 0.763, topRightCorner: 0.765, bottomLeftCorner: 0.793, bottomRightCorner: 0.79, diagTL: 0.087, diagTR: 0.083, diagBL: 0.089, diagBR: 0.091 }, bias: -2.795 },
    { digit: '1', terms: { topBar: 0.515, midBar: 0.092, botBar: 0.533, leftBar: -0.401, rightBar: -0.56, centerBar: 1.84, topLoop: -0.72, bottomLoop: -0.689, topLeftCorner: 0.146, topRightCorner: 0.068, bottomLeftCorner: 0.141, bottomRightCorner: 0.114, diagTL: 0.445, diagTR: 0.605, diagBL: 0.452, diagBR: 0.723 }, bias: -1.156 },
    { digit: '2', terms: { topBar: 1.031, midBar: -0.17, botBar: 0.91, leftBar: 0.221, rightBar: 0.375, centerBar: 0.118, topLoop: 1.02, bottomLoop: 0.449, topLeftCorner: 0.776, topRightCorner: 0.961, bottomLeftCorner: 0.728, bottomRightCorner: 0.435, diagTL: 0.315, diagTR: 0.717, diagBL: 0.717, diagBR: 0.143 }, bias: -3.061 },
    { digit: '3', terms: { topBar: 0.865, midBar: 0.225, botBar: 0.943, leftBar: -0.076, rightBar: 0.846, centerBar: -0.112, topLoop: 0.708, bottomLoop: 0.84, topLeftCorner: 0.538, topRightCorner: 0.847, bottomLeftCorner: 0.523, bottomRightCorner: 0.987, diagTL: 0.225, diagTR: 0.676, diagBL: 0.204, diagBR: 0.574 }, bias: -3.085 },
    { digit: '4', terms: { topBar: 0.488, midBar: 0.084, botBar: -0.462, leftBar: -0.304, rightBar: -0.505, centerBar: 0.921, topLoop: -0.888, bottomLoop: -1.231, topLeftCorner: -0.107, topRightCorner: 0.221, bottomLeftCorner: -0.201, bottomRightCorner: -0.222, diagTL: 0.404, diagTR: 0.463, diagBL: 0.983, diagBR: 1.143 }, bias: -0.275 },
    { digit: '5', terms: { topBar: 0.103, midBar: 0.55, botBar: 0.986, leftBar: 0.682, rightBar: 0.665, centerBar: -0.163, topLoop: 0.228, bottomLoop: 1.114, topLeftCorner: 0.74, topRightCorner: 0.207, bottomLeftCorner: 0.738, bottomRightCorner: 1.096, diagTL: 0.762, diagTR: 0.122, diagBL: 0.079, diagBR: 0.559 }, bias: -2.964 },
    { digit: '6', terms: { topBar: 0.551, midBar: 0.945, botBar: 0.872, leftBar: 0.591, rightBar: 0.132, centerBar: -0.055, topLoop: -0.115, bottomLoop: 1.061, topLeftCorner: 0.344, topRightCorner: 0.324, bottomLeftCorner: 1.038, bottomRightCorner: 0.836, diagTL: 0.628, diagTR: 0.108, diagBL: 0.445, diagBR: 0.83 }, bias: -2.987 },
    { digit: '7', terms: { topBar: 1.063, midBar: -0.084, botBar: 0.602, leftBar: -0.188, rightBar: 0.176, centerBar: 0.807, topLoop: 0.711, bottomLoop: -0.611, topLeftCorner: 0.625, topRightCorner: 1.183, bottomLeftCorner: 0.336, bottomRightCorner: 0.024, diagTL: 0.209, diagTR: 1.2, diagBL: 0.27, diagBR: 0.454 }, bias: -2.372 },
    { digit: '8', terms: { topBar: 0.389, midBar: 0.546, botBar: 0.828, leftBar: 0.585, rightBar: 0.585, centerBar: -0.265, topLoop: 0.279, bottomLoop: 1.089, topLeftCorner: 0.471, topRightCorner: 0.471, bottomLeftCorner: 0.884, bottomRightCorner: 0.884, diagTL: 0.685, diagTR: 0.685, diagBL: 0.575, diagBR: 0.575 }, bias: -3.243 },
    { digit: '9', terms: { topBar: 0.668, midBar: 0.671, botBar: 0.665, leftBar: 0.387, rightBar: 0.492, centerBar: -0.056, topLoop: 0.839, bottomLoop: -0.074, topLeftCorner: 1.091, topRightCorner: 0.729, bottomLeftCorner: 0.354, bottomRightCorner: 0.527, diagTL: 1.029, diagTR: 0.846, diagBL: 0.145, diagBR: 0.632 }, bias: -3.131 },
  ];

  function detectorWeights(spec) {
    const angle = (spec.angle * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const L = spec.len === undefined ? 13 : spec.len;
    const alongSigma = L / 2.2;
    const coreSigma = 2.4;
    const flankSigma = 5.2;
    const dots = new Float32Array(PIXELS);
    let norm = 0;
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const dx = x + 0.5 - spec.cx;
        const dy = y + 0.5 - spec.cy;
        const along = dx * cos + dy * sin;
        const perp = -dx * sin + dy * cos;
        const extent = Math.exp(-(along * along) / (2 * alongSigma * alongSigma));
        const core = Math.exp(-(perp * perp) / (2 * coreSigma * coreSigma)) * extent;
        const flank = Math.exp(-(perp * perp) / (2 * flankSigma * flankSigma)) * extent;
        const w = core - 0.5 * flank;
        dots[y * SIZE + x] = w;
        norm += w * w;
      }
    }
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < dots.length; i++) dots[i] /= norm;
    return dots;
  }

  function dense(terms, names, gain) {
    const row = new Float32Array(names.length);
    names.forEach((name, i) => {
      if (terms[name]) row[i] = terms[name] * gain;
    });
    return row;
  }

  function biasFor(terms, gain, thresh) {
    let total = 0;
    let negative = 0;
    for (const key in terms) {
      if (terms[key] > 0) total += terms[key];
      else negative += -terms[key];
    }
    return -((thresh === undefined ? 0.6 : thresh) * total - 0.5 * negative) * gain;
  }

  function build(gain) {
    const g = gain === undefined ? 1 : gain;
    const l1 = { names: DETECTORS.map((d) => d.name), W: [], b: new Float32Array(DETECTORS.length) };
    l1.b.fill(-0.45);
    DETECTORS.forEach((spec) => l1.W.push(detectorWeights(spec)));

    const l2names = LAYER2.map((n) => n.name);
    const l2 = { names: l2names, W: [], b: new Float32Array(LAYER2.length) };
    LAYER2.forEach((spec, i) => {
      l2.W.push(dense(spec.terms, l1.names, g));
      l2.b[i] = biasFor(spec.terms, g, spec.thresh);
    });

    const l3names = LAYER3.map((n) => n.digit);
    const l3 = { names: l3names, W: [], b: new Float32Array(LAYER3.length) };
    LAYER3.forEach((spec, i) => {
      l3.W.push(dense(spec.terms, l2names, g));
      l3.b[i] = spec.bias === undefined ? biasFor(spec.terms, g, spec.thresh) : spec.bias * g;
    });

    return { l1, l2, l3, pixelCount: PIXELS, parameterCount: parameterCount(), detectorSpecs: DETECTORS };
  }

  function parameterCount() {
    return (
      DETECTORS.length * PIXELS + DETECTORS.length +
      LAYER2.length * DETECTORS.length + LAYER2.length +
      LAYER3.length * LAYER2.length + LAYER3.length
    );
  }

  function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  function relu(z) {
    return z > 0 ? z : 0;
  }

  function layerForward(layer, input) {
    const z = new Float32Array(layer.names.length);
    const a = new Float32Array(layer.names.length);
    const activate = layer.act === 'relu' ? relu : sigmoid;
    layer.W.forEach((row, i) => {
      let sum = layer.b[i];
      for (let j = 0; j < row.length; j++) sum += row[j] * input[j];
      z[i] = sum;
      a[i] = activate(sum);
    });
    return { z, a };
  }

  function forward(net, input) {
    const one = layerForward(net.l1, input);
    const two = layerForward(net.l2, one.a);
    const three = layerForward(net.l3, two.a);
    return { input, l1: one, l2: two, l3: three };
  }

  function fromTrained(payload) {
    const names = (layer, index) => {
      if (layer.act === 'sigmoid') return '0123456789'.slice(0, layer.W.length).split('');
      return layer.W.map((row, i) => `h${index + 1}-${i + 1}`);
    };
    const layers = payload.layers.map((layer, index) => ({
      names: names(layer, index),
      act: layer.act,
      W: layer.W.map((row) => Float32Array.from(row)),
      b: Float32Array.from(layer.b),
    }));
    const parameterCount = layers.reduce((sum, layer) => sum + layer.W.length * layer.W[0].length + layer.W.length, 0);
    return { l1: layers[0], l2: layers[1], l3: layers[2], pixelCount: PIXELS, parameterCount, trained: true };
  }

  const api = { SIZE, PIXELS, build, fromTrained, forward, sigmoid, relu, parameterCount, DETECTORS, LAYER2, LAYER3 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.NNNetwork = api;
})(typeof window !== 'undefined' ? window : globalThis);
