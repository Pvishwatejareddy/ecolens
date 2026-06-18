/* ============================================
   ECOLENS — CHARTS & VISUALIZATION
   ============================================ */

// ── GLOBAL CHART DEFAULTS ──
if (typeof Chart !== 'undefined') {
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.color       = '#606C38';
  Chart.defaults.plugins.tooltip.backgroundColor = '#283618';
  Chart.defaults.plugins.tooltip.titleColor      = '#FEFAE0';
  Chart.defaults.plugins.tooltip.bodyColor       =
    'rgba(254,250,224,0.8)';
  Chart.defaults.plugins.tooltip.padding         = 12;
  Chart.defaults.plugins.tooltip.cornerRadius    = 10;
}

// ── COLOR PALETTE ──
const CHART_COLORS = {
  moss:      '#606C38',
  mossDark:  '#283618',
  amber:     '#DDA15E',
  sienna:    '#BC6C25',
  sky:       '#48CAE4',
  sage:      '#52B788',
  coral:     '#E63946',
  cream:     '#FEFAE0',
  parchment: '#FAEDCD',

  // Gradients (used for fills)
  greenGrad:  ['rgba(96,108,56,0.15)', 'rgba(96,108,56,0)'],
  amberGrad:  ['rgba(221,161,94,0.15)','rgba(221,161,94,0)'],
};

// ── HELPER: Create gradient ──
function makeGradient(ctx, colors, height = 300) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  return grad;
}

// ── HELPER: Get color by score ──
function scoreColor(val) {
  if (val < 5)    return CHART_COLORS.sage;
  if (val < 10)   return CHART_COLORS.amber;
  return CHART_COLORS.coral;
}

// ── WEEKLY LINE CHART ──
function createWeeklyChart(canvasId, logs, days = 7) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');

  // Build labels & data
  const labels = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toLocaleDateString('en-IN',
      { weekday: 'short', day: 'numeric' });
  });

  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const log = logs.find(l => l.date === d.toDateString());
    return log ? log.carbon : null;
  });

  const gradient = makeGradient(ctx,
    CHART_COLORS.greenGrad, 280);

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label:            'Your CO₂',
          data,
          borderColor:      CHART_COLORS.moss,
          backgroundColor:  gradient,
          borderWidth:      2.5,
          pointBackgroundColor: data.map(v =>
            v === null ? 'transparent' : scoreColor(v)),
          pointRadius:      5,
          pointHoverRadius: 8,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension:          0.4,
          fill:             true,
          spanGaps:         true,
        },
        {
          label:       'Global avg (12.9 kg)',
          data:        Array(days).fill(12.9),
          borderColor: CHART_COLORS.coral,
          borderWidth: 1.5,
          borderDash:  [6, 4],
          pointRadius: 0,
          fill:        false,
        },
        {
          label:       'India avg (5.2 kg)',
          data:        Array(days).fill(5.2),
          borderColor: CHART_COLORS.amber,
          borderWidth: 1.5,
          borderDash:  [4, 3],
          pointRadius: 0,
          fill:        false,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        intersect: false,
        mode:      'index',
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.dataset.label === 'Your CO₂') {
                return ctx.parsed.y !== null
                  ? ` ${ctx.parsed.y} kg CO₂`
                  : ' No log';
              }
              return ` ${ctx.dataset.label}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid:        { color: 'rgba(96,108,56,0.06)' },
          ticks: {
            color:    CHART_COLORS.moss,
            callback: v => v + ' kg',
            font:     { size: 11 },
          },
        },
        x: {
          grid:  { display: false },
          ticks: {
            color: CHART_COLORS.moss,
            font:  { size: 10 },
          },
        },
      },
    },
  });
}

// ── DONUT CHART (Category Breakdown) ──
function createDonutChart(canvasId, breakdown) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !breakdown) return null;

  const ctx = canvas.getContext('2d');

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['🚗 Transport','🥗 Food','⚡ Energy','🛍️ Shopping'],
      datasets: [{
        data: [
          parseFloat(breakdown.transport.total),
          parseFloat(breakdown.food.total),
          parseFloat(breakdown.energy.total),
          parseFloat(breakdown.shopping.total),
        ],
        backgroundColor: [
          CHART_COLORS.sky,
          CHART_COLORS.sage,
          CHART_COLORS.amber,
          CHART_COLORS.sienna,
        ],
        borderColor:  '#fff',
        borderWidth:  3,
        hoverOffset:  10,
      }],
    },
    options: {
      responsive:  true,
      cutout:      '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color:     CHART_COLORS.mossDark,
            padding:   16,
            usePointStyle: true,
            font: { size: 11, weight: '600' },
          },
        },
        tooltip: {
          callbacks: {
            label: ctx =>
              ` ${ctx.parsed.toFixed(1)} kg CO₂` +
              ` (${breakdown[
                ['transport','food','energy','shopping']
                [ctx.dataIndex]
              ].pct}%)`,
          },
        },
      },
    },
  });
}

// ── BAR CHART (Daily CO2 by category) ──
function createStackedBar(canvasId, logs) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const ctx  = canvas.getContext('2d');
  const days = 7;

  const labels = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  });

  const getData = (key) => Array.from(
    { length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const log = logs.find(l => l.date === d.toDateString());
      if (!log) return 0;
      const result = calculateCarbon(log);
      return parseFloat(result[key].toFixed(2));
    });

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label:           '🚗 Transport',
          data:            getData('transport'),
          backgroundColor: CHART_COLORS.sky,
          borderRadius:    { topLeft: 0, topRight: 0 },
          borderSkipped:   false,
        },
        {
          label:           '🥗 Food',
          data:            getData('food'),
          backgroundColor: CHART_COLORS.sage,
          borderSkipped:   false,
        },
        {
          label:           '⚡ Energy',
          data:            getData('energy'),
          backgroundColor: CHART_COLORS.amber,
          borderSkipped:   false,
        },
        {
          label:           '🛍️ Shopping',
          data:            getData('shopping'),
          backgroundColor: CHART_COLORS.sienna,
          borderRadius:    { topLeft: 6, topRight: 6 },
          borderSkipped:   false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
          grid:    { display: false },
          ticks:   { color: CHART_COLORS.moss },
        },
        y: {
          stacked:     true,
          beginAtZero: true,
          grid:        { color: 'rgba(96,108,56,0.06)' },
          ticks: {
            color:    CHART_COLORS.moss,
            callback: v => v + ' kg',
          },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color:         CHART_COLORS.mossDark,
            padding:       12,
            usePointStyle: true,
            font:          { size: 11, weight: '600' },
          },
        },
        tooltip: {
          callbacks: {
            footer: items => {
              const total = items.reduce(
                (s, i) => s + i.parsed.y, 0);
              return `Total: ${total.toFixed(1)} kg CO₂`;
            },
          },
        },
      },
    },
  });
}

// ── MINI SPARKLINE ──
function createSparkline(canvasId, data, color = '#606C38') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels:   data.map((_, i) => i),
      datasets: [{
        data,
        borderColor:     color,
        borderWidth:     2,
        pointRadius:     0,
        tension:         0.4,
        fill:            true,
        backgroundColor: color + '18',
        spanGaps:        true,
      }],
    },
    options: {
      responsive:  true,
      animation:   false,
      plugins: { legend: { display: false },
                 tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false, beginAtZero: true },
      },
    },
  });
}

// ── GAUGE CHART (Score Ring via Canvas) ──
function drawScoreGauge(canvasId, score, maxScore = 20) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  const cx     = canvas.width  / 2;
  const cy     = canvas.height / 2;
  const radius = Math.min(cx, cy) - 20;
  const pct    = Math.min(score / maxScore, 1);
  const start  = -Math.PI * 1.25;
  const end    = start + (Math.PI * 2.5 * pct);
  const color  = score < 5  ? CHART_COLORS.sage
               : score < 10 ? CHART_COLORS.amber
               :               CHART_COLORS.coral;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI*1.25, Math.PI*0.25);
  ctx.strokeStyle = CHART_COLORS.parchment;
  ctx.lineWidth   = 14;
  ctx.lineCap     = 'round';
  ctx.stroke();

  // Fill
  if (pct > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, end);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 14;
    ctx.lineCap     = 'round';
    ctx.stroke();
  }

  // Center text
  ctx.fillStyle  = CHART_COLORS.mossDark;
  ctx.font       = `bold ${radius * 0.45}px 'DM Sans'`;
  ctx.textAlign  = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(score.toFixed(1), cx, cy - 8);

  ctx.fillStyle  = CHART_COLORS.moss;
  ctx.font       = `${radius * 0.22}px 'DM Sans'`;
  ctx.fillText('kg CO₂', cx, cy + radius * 0.3);
}

// ── EXPORT ──
window.createWeeklyChart  = createWeeklyChart;
window.createDonutChart   = createDonutChart;
window.createStackedBar   = createStackedBar;
window.createSparkline    = createSparkline;
window.drawScoreGauge     = drawScoreGauge;
window.CHART_COLORS       = CHART_COLORS;
window.scoreColor         = scoreColor;