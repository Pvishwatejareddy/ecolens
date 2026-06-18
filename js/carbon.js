/* ============================================
   ECOLENS — CARBON CALCULATION ENGINE
   ============================================ */

// ── EMISSION FACTORS (kg CO₂) ──
const CARBON = {

  transport: {
    car:        0.21,  // per km
    motorcycle: 0.11,
    bus:        0.089,
    train:      0.041,
    flight:     0.255,
    walk:       0,
    cycle:      0,
    none:       0,
  },

  food: {
    beef:        3.0,   // per meal
    chicken:     0.9,
    fish:        0.7,
    vegetarian:  0.4,
    vegan:       0.2,
  },

  energy: {
    electricity: 0.82,  // per kWh (India grid)
    solar:       0.05,  // per kWh
    ac_per_hour: 1.2,   // per hour of AC use
  },

  shopping: {
    clothing:    10.0,  // per item
    electronics: 70.0,  // per device
    delivery:    0.5,   // per order
    groceries:   0.5,   // per kg
  },

  // Global averages for comparison
  averages: {
    global_daily: 12.9,
    india_daily:  5.2,
    target_daily: 3.0,  // Paris Agreement target
  },
};

// ── MAIN CALCULATION ──
function calculateCarbon(log) {
  const result = {
    transport: 0,
    food:      0,
    energy:    0,
    shopping:  0,
    total:     0,
  };

  // Transport
  const transportFactor =
    CARBON.transport[log.transportMode] ??
    CARBON.transport.car;
  result.transport =
    transportFactor * (log.transportKm || 0);

  // Food
  const foodFactor =
    CARBON.food[log.foodType] ??
    CARBON.food.vegetarian;
  result.food = foodFactor * (log.meals || 3);

  // Energy
  let energyKwh = log.electricityKwh || 0;
  if (log.usedAC) energyKwh += 4; // avg AC usage
  const factor = log.usedSolar
    ? CARBON.energy.solar
    : CARBON.energy.electricity;
  result.energy = energyKwh * factor;

  // Shopping
  result.shopping =
    (log.groceriesKg    || 0) * CARBON.shopping.groceries +
    (log.boughtClothing    ? CARBON.shopping.clothing    : 0) +
    (log.boughtElectronics ? CARBON.shopping.electronics : 0) +
    (log.onlineDelivery    ? CARBON.shopping.delivery    : 0);

  // Total
  result.total = Object.values(result)
    .reduce((sum, v) => sum + v, 0);
  result.total = Math.round(result.total * 100) / 100;

  return result;
}

// ── SCORE RATING ──
function getCarbonRating(total) {
  if (total < 3)    return {
    level: 'excellent',
    label: '🌟 Excellent',
    color: 'var(--sage)',
    message: 'You\'re a true eco champion today!',
  };
  if (total < 7)    return {
    level: 'good',
    label: '✅ Good',
    color: 'var(--moss)',
    message: 'Well below the global average. Keep it up!',
  };
  if (total < 12.9) return {
    level: 'average',
    label: '👍 Below Average',
    color: 'var(--amber)',
    message: 'Below global avg. Small changes go a long way!',
  };
  return {
    level: 'high',
    label: '⚠️ High',
    color: 'var(--coral)',
    message: 'Check your AI insights to reduce tomorrow!',
  };
}

// ── COMPARISON ──
function compareToAverages(total) {
  const global = CARBON.averages.global_daily;
  const india  = CARBON.averages.india_daily;
  const target = CARBON.averages.target_daily;

  return {
    vsGlobal:  ((global - total) / global * 100).toFixed(0),
    vsIndia:   ((india  - total) / india  * 100).toFixed(0),
    vsTarget:  ((target - total) / target * 100).toFixed(0),
    betterThanGlobal: total < global,
    betterThanIndia:  total < india,
    atTarget:         total <= target,
  };
}

// ── TREES EQUIVALENT ──
function treesEquivalent(totalCarbonKg) {
  // One tree absorbs ~21kg CO₂/year = ~0.057kg/day
  return (totalCarbonKg / 21).toFixed(1);
}

// ── WEEKLY SUMMARY ──
function getWeeklySummary(logs) {
  if (!logs || logs.length === 0) return null;

  const totals = logs.map(l => l.carbon);
  const avg    = totals.reduce((a,b) => a + b, 0) / totals.length;
  const best   = Math.min(...totals);
  const worst  = Math.max(...totals);
  const trend  = totals.length > 1
    ? totals[totals.length-1] - totals[0]
    : 0;

  return {
    avg:        Math.round(avg * 100) / 100,
    best:       Math.round(best * 100) / 100,
    worst:      Math.round(worst * 100) / 100,
    trend,
    improving:  trend < 0,
    totalDays:  logs.length,
    totalCarbon: totals.reduce((a,b) => a+b, 0).toFixed(1),
  };
}

// ── CATEGORY BREAKDOWN ──
function getCategoryBreakdown(logs) {
  if (!logs || logs.length === 0) return null;

  let transport = 0, food = 0, energy = 0, shopping = 0;

  logs.forEach(log => {
    const result = calculateCarbon(log);
    transport += result.transport;
    food      += result.food;
    energy    += result.energy;
    shopping  += result.shopping;
  });

  const total = transport + food + energy + shopping;

  return {
    transport: {
      total: transport.toFixed(1),
      pct:   total > 0
        ? ((transport/total)*100).toFixed(0) : 0,
    },
    food: {
      total: food.toFixed(1),
      pct:   total > 0
        ? ((food/total)*100).toFixed(0) : 0,
    },
    energy: {
      total: energy.toFixed(1),
      pct:   total > 0
        ? ((energy/total)*100).toFixed(0) : 0,
    },
    shopping: {
      total: shopping.toFixed(1),
      pct:   total > 0
        ? ((shopping/total)*100).toFixed(0) : 0,
    },
    total: total.toFixed(1),
  };
}

// ── TOP EMITTER ──
function getTopEmitter(log) {
  const result = calculateCarbon(log);
  const cats   = {
    transport: result.transport,
    food:      result.food,
    energy:    result.energy,
    shopping:  result.shopping,
  };

  const top = Object.entries(cats)
    .sort((a, b) => b[1] - a[1])[0];

  const labels = {
    transport: '🚗 Transport',
    food:      '🥗 Food',
    energy:    '⚡ Energy',
    shopping:  '🛍️ Shopping',
  };

  return {
    category: top[0],
    label:    labels[top[0]],
    value:    top[1].toFixed(1),
  };
}

// ── REDUCTION TIPS (offline fallback) ──
function getQuickTips(log) {
  const tips = [];
  const result = calculateCarbon(log);

  // Transport tips
  if (result.transport > 3) {
    if (log.transportMode === 'car') {
      tips.push({
        icon:   '🚌',
        title:  'Try public transport tomorrow',
        saving: (result.transport * 0.6).toFixed(1) + ' kg CO₂',
      });
    }
    if (log.transportKm > 20) {
      tips.push({
        icon:   '🏠',
        title:  'Consider work from home',
        saving: (result.transport * 0.8).toFixed(1) + ' kg CO₂',
      });
    }
  }

  // Food tips
  if (log.foodType === 'beef') {
    tips.push({
      icon:   '🥗',
      title:  'Replace one beef meal with chicken',
      saving: '2.1 kg CO₂',
    });
  }
  if (log.foodType !== 'vegan' && log.foodType !== 'vegetarian') {
    tips.push({
      icon:   '🌱',
      title:  'Try a plant-based day this week',
      saving: '1.5 kg CO₂',
    });
  }

  // Energy tips
  if (log.usedAC) {
    tips.push({
      icon:   '🌡️',
      title:  'Set AC to 24°C instead of 18°C',
      saving: '0.8 kg CO₂',
    });
  }
  if (log.electricityKwh > 10) {
    tips.push({
      icon:   '💡',
      title:  'Switch to LED bulbs if you haven\'t',
      saving: '0.5 kg CO₂/day',
    });
  }

  // Shopping tips
  if (log.boughtClothing) {
    tips.push({
      icon:   '👕',
      title:  'Try thrift stores next time',
      saving: '~8 kg CO₂ per item',
    });
  }
  if (log.onlineDelivery) {
    tips.push({
      icon:   '📦',
      title:  'Batch your deliveries together',
      saving: '0.3 kg CO₂ per order',
    });
  }

  return tips.slice(0, 3);
}

// ── MONTHLY GOAL ──
function getMonthlyGoal(logs) {
  if (!logs || logs.length === 0) return null;

  const avg    = logs.reduce((s,l) => s+l.carbon, 0)
    / logs.length;
  const target = CARBON.averages.target_daily;
  const pct    = Math.min((target / avg) * 100, 100);

  return {
    currentAvg: avg.toFixed(1),
    target:     target,
    progress:   pct.toFixed(0),
    onTrack:    avg <= target * 1.5,
  };
}

// ── FORMAT CO2 ──
function formatCO2(kg) {
  if (kg >= 1000) return (kg / 1000).toFixed(1) + ' tonnes';
  return kg.toFixed(1) + ' kg';
}

// ── EXPORT ──
window.CARBON         = CARBON;
window.calculateCarbon   = calculateCarbon;
window.getCarbonRating   = getCarbonRating;
window.compareToAverages = compareToAverages;
window.treesEquivalent   = treesEquivalent;
window.getWeeklySummary  = getWeeklySummary;
window.getCategoryBreakdown = getCategoryBreakdown;
window.getTopEmitter     = getTopEmitter;
window.getQuickTips      = getQuickTips;
window.getMonthlyGoal    = getMonthlyGoal;
window.formatCO2         = formatCO2;