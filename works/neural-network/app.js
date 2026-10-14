(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const SIZE = 28;
  const net = window.NNTrainedWeights ? NNNetwork.fromTrained(window.NNTrainedWeights) : NNNetwork.build(1);
  const input = new Float32Array(SIZE * SIZE);

  const COL = { input: 76, h1: 252, h2: 406, out: 546 };
  const NODES = {
    input: [46, 256, 374, 584, 11],
    h1: [52, 568, 16],
    h2: [52, 568, 16],
    out: [118, 502, 10],
  };

  function spread(y0, y1, count) {
    const step = (y1 - y0) / (count - 1);
    return Array.from({ length: count }, (_, i) => y0 + i * step);
  }

  function inputRows() {
    const [a0, a1, b0, b1, n] = NODES.input;
    return spread(a0, a1, n).concat(spread(b0, b1, n));
  }

  function el(name, attrs) {
    const node = document.createElementNS(NS, name);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  }

  const svg = document.getElementById('net');
  const links = el('g');
  const fan = el('g');
  const discs = el('g');
  svg.append(links, fan, discs);

  const rows = { input: inputRows(), h1: spread(...NODES.h1), h2: spread(...NODES.h2), out: spread(...NODES.out) };
  const nodes = { l1: [], l2: [], l3: [] };
  const activation = { l1: new Float32Array(16), l2: new Float32Array(16), l3: new Float32Array(10) };
  const zScore = { l1: new Float32Array(16), l2: new Float32Array(16), l3: new Float32Array(10) };

  function line(x1, y1, x2, y2, opacity) {
    return el('line', { x1, y1, x2, y2, stroke: '#e8e6e3', 'stroke-width': 0.5, 'stroke-opacity': opacity });
  }

  rows.input.forEach((y) => rows.h1.forEach((y2) => links.append(line(COL.input, y, COL.h1, y2, 0.055))));
  rows.h1.forEach((y) => rows.h2.forEach((y2) => links.append(line(COL.h1, y, COL.h2, y2, 0.06))));
  rows.h2.forEach((y) => rows.out.forEach((y2) => links.append(line(COL.h2, y, COL.out, y2, 0.075))));

  function disc(x, y, r) {
    const circle = el('circle', { cx: x, cy: y, r, fill: '#000', stroke: '#e8e6e3', 'stroke-width': 1 });
    discs.append(circle);
    return circle;
  }

  const inputDiscs = rows.input.map((y) => disc(COL.input, y, 3.6));
  rows.h1.forEach((y, i) => nodes.l1.push(disc(COL.h1, y, 7)));
  rows.h2.forEach((y, i) => nodes.l2.push(disc(COL.h2, y, 7)));
  rows.out.forEach((y, i) => {
    nodes.l3.push(disc(COL.out, y, 8));
    const label = el('text', { x: COL.out + 20, y: y + 4, fill: '#7d7a76', 'font-size': 12 });
    label.textContent = String(i);
    discs.append(label);
  });

  const spine = COL.input - 22;
  const tip = COL.input - 34;
  const brace = el('path', {
    d: `M ${spine + 10} 74 Q ${spine} 74 ${spine} 90 L ${spine} 297 Q ${spine} 315 ${tip} 315 Q ${spine} 315 ${spine} 333 L ${spine} 540 Q ${spine} 556 ${spine + 10} 556`,
    fill: 'none',
    stroke: '#7d7a76',
    'stroke-width': 1,
  });
  const count = el('text', { x: COL.input - 62, y: 320, fill: '#7d7a76', 'font-size': 12 });
  count.textContent = '784';
  const dots = el('text', { x: COL.input - 5, y: 324, fill: '#7d7a76', 'font-size': 16 });
  dots.textContent = '⋮';
  discs.append(brace, count, dots);

  const grid = document.getElementById('grid');
  const gridCtx = grid.getContext('2d');
  const bars = document.getElementById('bars');
  const barsCtx = bars.getContext('2d');
  const inputCanvas = document.getElementById('input');
  const inputCtx = inputCanvas.getContext('2d');
  const zOut = document.getElementById('zval');
  const aOut = document.getElementById('aval');
  const actLabel = document.getElementById('actlabel');
  const biasSlider = document.getElementById('bias');

  const baseBias = { l1: Float32Array.from(net.l1.b), l2: Float32Array.from(net.l2.b), l3: Float32Array.from(net.l3.b) };
  let selected = { layer: 'l1', index: 0, weights: net.l1.W[0], bias: net.l1.b, activation: null };

  const SHAPES = {
    sigmoid: { fn: (z) => 1 / (1 + Math.exp(-z)), label: '\u03c3(z)' },
    relu: { fn: (z) => Math.max(0, z), label: 'ReLU(z)' },
  };

  function softmax(values) {
    const peak = Math.max(...values);
    const exps = Array.from(values, (v) => Math.exp(v - peak));
    const total = exps.reduce((sum, v) => sum + v, 0);
    return exps.map((v) => v / total);
  }

  function intensity(layer, a) {
    return layer === 'l3' ? a : a / (a + 5);
  }

  function paintInput() {
    const image = inputCtx.createImageData(SIZE, SIZE);
    for (let i = 0; i < input.length; i++) {
      const v = Math.round(input[i] * 255);
      image.data[i * 4] = v;
      image.data[i * 4 + 1] = v;
      image.data[i * 4 + 2] = v;
      image.data[i * 4 + 3] = 255;
    }
    inputCtx.putImageData(image, 0, 0);
  }

  function paintDiscs(layer, values) {
    nodes[layer].forEach((circle, i) => {
      const a = intensity(layer, values[i]);
      circle.setAttribute('fill', `rgba(232,230,227,${(0.06 + 0.9 * a).toFixed(3)})`);
      circle.setAttribute('r', (6 + 3.4 * a).toFixed(2));
      const on = selected.layer === layer && selected.index === i;
      circle.setAttribute('stroke', on ? '#4f9bd8' : '#e8e6e3');
      circle.setAttribute('stroke-width', on ? 1.6 : 0.7);
      circle.setAttribute('stroke-opacity', on ? 1 : 0.55);
    });
  }

  function paintFan() {
    fan.replaceChildren();
    if (selected.layer === 'l1') {
      const row = net.l1.W[selected.index];
      let max = 0;
      for (let i = 0; i < row.length; i++) max = Math.max(max, Math.abs(row[i]));
      const target = { x: COL.h1, y: rows.h1[selected.index] };
      for (let p = 0; p < row.length; p++) {
        const strength = Math.abs(row[p]) / max;
        if (strength < 0.34) continue;
        const x = COL.input + ((p % SIZE) - 13.5) * 1.6;
        const y = 315 + (Math.floor(p / SIZE) - 13.5) * 1.6;
        fan.append(
          el('line', {
            x1: x, y1: y, x2: target.x, y2: target.y,
            stroke: row[p] > 0 ? '#6fae6b' : '#c06a5e',
            'stroke-width': 0.45,
            'stroke-opacity': (0.04 + 0.22 * strength).toFixed(3),
          })
        );
      }
      return;
    }
    const prev = selected.layer === 'l2' ? { layer: 'l1', x: COL.h1, rows: rows.h1, w: net.l2.W } : { layer: 'l2', x: COL.h2, rows: rows.h2, w: net.l3.W };
    const row = prev.w[selected.index];
    let max = 0;
    for (let i = 0; i < row.length; i++) max = Math.max(max, Math.abs(row[i]));
    const target = { x: selected.layer === 'l2' ? COL.h2 : COL.out, y: selected.layer === 'l2' ? rows.h2[selected.index] : rows.out[selected.index] };
    prev.rows.forEach((y, i) => {
      const strength = Math.abs(row[i]) / max;
      if (strength < 0.08) return;
      fan.append(
        el('line', {
          x1: prev.x, y1: y, x2: target.x, y2: target.y,
          stroke: row[i] > 0 ? '#6fae6b' : '#c06a5e',
          'stroke-width': 0.9,
          'stroke-opacity': (0.1 + 0.55 * strength).toFixed(3),
        })
      );
    });
  }

  function paintInspector(out) {
    const isGrid = selected.layer === 'l1';
    grid.style.display = isGrid ? 'block' : 'none';
    bars.style.display = isGrid ? 'none' : 'block';
    barsCtx.clearRect(0, 0, 160, 160);
    if (isGrid) {
      const row = selected.weights;
      let max = 0;
      for (let i = 0; i < row.length; i++) max = Math.max(max, Math.abs(row[i]));
      const image = gridCtx.createImageData(SIZE, SIZE);
      for (let i = 0; i < row.length; i++) {
        const t = Math.min(1, Math.abs(row[i]) / max);
        image.data[i * 4] = row[i] > 0 ? 111 + t * 60 : 192;
        image.data[i * 4 + 1] = row[i] > 0 ? 174 : 106 - t * 30;
        image.data[i * 4 + 2] = row[i] > 0 ? 107 : 94 - t * 20;
        image.data[i * 4 + 3] = Math.round(255 * (0.15 + 0.85 * t));
      }
      gridCtx.putImageData(image, 0, 0);
      return;
    }
    barsCtx.fillStyle = 'rgba(232,230,227,0.25)';
    barsCtx.fillRect(4, 136, 152, 1);
    if (selected.layer === 'l3') {
      const probs = softmax(out.l3.z);
      const best = probs.indexOf(Math.max(...probs));
      barsCtx.font = '11px ui-sans-serif, system-ui, sans-serif';
      barsCtx.textAlign = 'center';
      probs.forEach((value, i) => {
        const height = Math.max(1.5, value * 122);
        barsCtx.fillStyle = i === best ? '#4f9bd8' : 'rgba(232,230,227,0.45)';
        barsCtx.fillRect(7 + i * 15, 136 - height, 11, height);
        barsCtx.fillStyle = i === best ? '#4f9bd8' : 'rgba(232,230,227,0.35)';
        barsCtx.fillText(String(i), 13 + i * 15, 152);
      });
      return;
    }
    const row = selected.weights;
    let max = 0;
    for (let i = 0; i < row.length; i++) max = Math.max(max, Math.abs(row[i]));
    rows.h1.forEach((_, i) => {
      const value = row[i] || 0;
      const height = Math.max(1, (Math.abs(value) / max) * 128);
      barsCtx.fillStyle = value > 0 ? '#6fae6b' : '#c06a5e';
      barsCtx.fillRect(4 + i * 9.7, 136 - height, 7, height);
    });
  }

  function render() {
    const out = NNNetwork.forward(net, input);
    Object.assign(activation.l1, out.l1.a);
    Object.assign(activation.l2, out.l2.a);
    Object.assign(activation.l3, out.l3.a);
    Object.assign(zScore.l1, out.l1.z);
    Object.assign(zScore.l2, out.l2.z);
    Object.assign(zScore.l3, out.l3.z);
    selected.activation = selected.layer === 'l1' ? out.l1.a : selected.layer === 'l2' ? out.l2.a : out.l3.a;

    inputDiscs.forEach((circle, i) => {
      const v = input[Math.floor((i / inputDiscs.length) * input.length)] || 0;
      circle.setAttribute('fill', `rgba(232,230,227,${(0.05 + 0.85 * v).toFixed(3)})`);
    });
    paintDiscs('l1', out.l1.a);
    paintDiscs('l2', out.l2.a);
    paintDiscs('l3', out.l3.a);

    const best = Array.from(out.l3.a).indexOf(Math.max(...out.l3.a));
    nodes.l3.forEach((circle, i) => {
      if (i !== best) return;
      circle.setAttribute('stroke', '#4f9bd8');
      circle.setAttribute('stroke-width', 1.6);
      circle.setAttribute('stroke-opacity', 1);
    });

    const z = selected.layer === 'l1' ? out.l1.z[selected.index] : selected.layer === 'l2' ? out.l2.z[selected.index] : out.l3.z[selected.index];
    const shape = selected.layer === 'l3' ? SHAPES.sigmoid : SHAPES.relu;
    zOut.textContent = z.toFixed(2);
    aOut.textContent = shape.fn(z).toFixed(2);
    paintFan();
    paintInspector(out);
  }

  function select(layer, index) {
    selected.bias[selected.index] = baseBias[selected.layer][selected.index];
    const weights = layer === 'l1' ? net.l1.W[index] : layer === 'l2' ? net.l2.W[index] : net.l3.W[index];
    const bias = layer === 'l1' ? net.l1.b : layer === 'l2' ? net.l2.b : net.l3.b;
    selected = { layer, index, weights, bias };
    actLabel.textContent = (layer === 'l3' ? SHAPES.sigmoid : SHAPES.relu).label;
    render();
    const span = Math.max(3, Math.abs(zScore[layer][index]) * 1.6);
    biasSlider.min = String(-span);
    biasSlider.max = String(span);
    biasSlider.step = String(span / 60);
    biasSlider.value = '0';
  }

  const pickable = { l1: nodes.l1, l2: nodes.l2, l3: nodes.l3 };
  Object.keys(pickable).forEach((layer) => {
    pickable[layer].forEach((circle, i) => {
      circle.style.cursor = 'pointer';
      circle.addEventListener('click', () => select(layer, i));
    });
  });

  biasSlider.addEventListener('input', () => {
    selected.bias[selected.index] = baseBias[selected.layer][selected.index] + Number(biasSlider.value);
    render();
  });

  let drawing = false;
  let previous = null;

  function point(event) {
    const box = inputCanvas.getBoundingClientRect();
    return { x: ((event.clientX - box.left) / box.width) * SIZE, y: ((event.clientY - box.top) / box.height) * SIZE };
  }

  function dab(x, y) {
    const radius = 1.7;
    const minX = Math.max(0, Math.floor(x - radius));
    const maxX = Math.min(SIZE - 1, Math.ceil(x + radius));
    const minY = Math.max(0, Math.floor(y - radius));
    const maxY = Math.min(SIZE - 1, Math.ceil(y + radius));
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const d = Math.hypot(px + 0.5 - x, py + 0.5 - y);
        const v = Math.max(0, 1 - Math.max(0, d - 0.7) / (radius - 0.7));
        const index = py * SIZE + px;
        input[index] = Math.max(input[index], Math.min(1, v * 1.15));
      }
    }
  }

  function strokeTo(event) {
    const next = point(event);
    if (!previous) {
      dab(next.x, next.y);
    } else {
      const steps = Math.max(1, Math.round(Math.hypot(next.x - previous.x, next.y - previous.y) * 2));
      for (let i = 1; i <= steps; i++) {
        dab(previous.x + ((next.x - previous.x) * i) / steps, previous.y + ((next.y - previous.y) * i) / steps);
      }
    }
    previous = next;
    paintInput();
    render();
  }

  inputCanvas.addEventListener('pointerdown', (event) => {
    drawing = true;
    previous = null;
    try {
      inputCanvas.setPointerCapture(event.pointerId);
    } catch (error) {
      // synthetic events have no capturable pointer
    }
    strokeTo(event);
  });
  inputCanvas.addEventListener('pointermove', (event) => {
    if (drawing) strokeTo(event);
  });
  inputCanvas.addEventListener('pointerup', () => {
    drawing = false;
    previous = null;
  });

  function load(values) {
    input.set(values);
    paintInput();
    render();
  }

  const presets = document.getElementById('presets');
  NNDigits.digits.forEach((digit) => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const values = NNDigits.preset(digit, 2.4);
    const image = canvas.getContext('2d').createImageData(SIZE, SIZE);
    for (let i = 0; i < values.length; i++) {
      const v = Math.round(values[i] * 255);
      image.data[i * 4] = v;
      image.data[i * 4 + 1] = v;
      image.data[i * 4 + 2] = v;
      image.data[i * 4 + 3] = 255;
    }
    canvas.getContext('2d').putImageData(image, 0, 0);
    canvas.title = digit;
    canvas.addEventListener('click', () => load(values));
    presets.append(canvas);
  });

  const clear = document.createElement('button');
  clear.className = 'clear';
  clear.textContent = '×';
  clear.addEventListener('click', () => load(new Float32Array(SIZE * SIZE)));
  presets.append(clear);

  load(NNDigits.preset('7', 2.4));
  select('l1', 0);

  window.NNLab = { select, load, forward: () => NNNetwork.forward(net, input) };
})();
