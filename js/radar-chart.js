/**
 * radar-chart.js
 * Canvas APIで5軸レーダーチャートを描画する
 */
const RadarChart = (() => {
  const LABELS = ['酸味', '苦味', 'コク', '香り', '甘み'];
  const KEYS = ['acidity', 'bitterness', 'body', 'aroma', 'sweetness'];
  const MAX_SCORE = 5;

  /**
   * レーダーチャートを描画する
   * @param {string|HTMLCanvasElement} canvasIdOrEl - canvas要素またはそのID
   * @param {Object} scores - { acidity, bitterness, body, aroma, sweetness }
   * @param {Object} [opts] - オプション
   */
  function draw(canvasIdOrEl, scores, opts = {}) {
    const canvas = typeof canvasIdOrEl === 'string'
      ? document.getElementById(canvasIdOrEl)
      : canvasIdOrEl;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = opts.size || 280;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.36;
    const numAxes = KEYS.length;
    const angleStep = (Math.PI * 2) / numAxes;
    const startAngle = -Math.PI / 2;

    // Colors
    const mainColor = opts.color || '#4FB8E0';
    const bgColor = opts.bgColor || '#F8FBFD';
    const gridColor = opts.gridColor || '#E3EDF3';
    const labelColor = opts.labelColor || '#2C3E50';
    const fillColor = opts.fillColor || 'rgba(79, 184, 224, 0.2)';

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();

    // Grid rings
    for (let ring = 1; ring <= MAX_SCORE; ring++) {
      const r = (ring / MAX_SCORE) * radius;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = ring === MAX_SCORE ? 1.5 : 0.8;
      ctx.stroke();
    }

    // Axes
    for (let i = 0; i < numAxes; i++) {
      const angle = startAngle + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Data area
    ctx.beginPath();
    for (let i = 0; i < numAxes; i++) {
      const key = KEYS[i];
      const val = Math.min(scores[key] || 0, MAX_SCORE);
      const r = (val / MAX_SCORE) * radius;
      const angle = startAngle + i * angleStep;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Data points
    for (let i = 0; i < numAxes; i++) {
      const key = KEYS[i];
      const val = Math.min(scores[key] || 0, MAX_SCORE);
      const r = (val / MAX_SCORE) * radius;
      const angle = startAngle + i * angleStep;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = mainColor;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Labels
    ctx.font = '500 12px "Noto Sans JP", sans-serif';
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < numAxes; i++) {
      const angle = startAngle + i * angleStep;
      const labelR = radius + 24;
      const x = cx + labelR * Math.cos(angle);
      const y = cy + labelR * Math.sin(angle);
      ctx.fillText(LABELS[i], x, y);
    }
  }

  return { draw };
})();
