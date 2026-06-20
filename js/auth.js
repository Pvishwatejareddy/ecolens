/* ============================================
   ECOLENS — AUTH & SESSION MANAGEMENT
   ============================================ */

// ── GET CURRENT USER ──
function getCurrentUser() {
  const user = localStorage.getItem('ecolens_user');
  return user ? JSON.parse(user) : null;
}

// ── REQUIRE LOGIN ──
function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

// ── LOGOUT ──
function logout() {
  // Only remove session — keep all user data safe!
  localStorage.removeItem('ecolens_user');
  window.location.href = 'login.html';
}

// ── UPDATE USER ──
function updateUser(updates) {
  const user = getCurrentUser();
  if (!user) return;

  const updated = { ...user, ...updates };
  localStorage.setItem('ecolens_user', JSON.stringify(updated));

  // Also update in users array
  const users = JSON.parse(
    localStorage.getItem('ecolens_users') || '[]'
  );
  const idx = users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    users[idx] = updated;
    localStorage.setItem('ecolens_users',
      JSON.stringify(users));
  }

  return updated;
}

// ── GOOGLE LOGIN (persistent — one account only) ──
function handleGoogleLogin() {
  const users = JSON.parse(
    localStorage.getItem('ecolens_users') || '[]'
  );

  // Check if Google demo user already exists
  const existing = users.find(
    u => u.email === 'demo@ecolens.app'
  );

  if (existing) {
    // Always return the SAME existing account!
    localStorage.setItem('ecolens_user',
      JSON.stringify(existing));
  } else {
    // First time only — create one Google demo account
    const newGoogleUser = {
      id:        'google_demo_001',
      name:      'Eco Explorer',
      firstName: 'Eco',
      lastName:  'Explorer',
      email:     'demo@ecolens.app',
      avatar:    '🌿',
      city:      'India',
      joined:    new Date().toISOString(),
      streak:    0,
      badges:    ['🌱'],
      totalLogs: 0,
    };
    users.push(newGoogleUser);
    localStorage.setItem('ecolens_users',
      JSON.stringify(users));
    localStorage.setItem('ecolens_user',
      JSON.stringify(newGoogleUser));
  }

  // Show success overlay if it exists on page
  const overlay = document.getElementById('successOverlay');
  if (overlay) overlay.classList.add('show');

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1800);
}

// ── POPULATE NAV USER INFO ──
function populateNav() {
  const user = getCurrentUser();
  if (!user) return;

  const avatarEls = document.querySelectorAll('.nav-avatar');
  avatarEls.forEach(el => {
    el.textContent = user.avatar || '🌱';
  });

  const nameEls = document.querySelectorAll('.nav-user-name');
  nameEls.forEach(el => {
    el.textContent = user.firstName || user.name;
  });

  const streakEls =
    document.querySelectorAll('.nav-streak-count');
  streakEls.forEach(el => {
    el.textContent = user.streak || 0;
  });
}

// ── STREAK MANAGEMENT ──
function checkAndUpdateStreak() {
  const user = getCurrentUser();
  if (!user) return;

  const today     = new Date().toDateString();
  const lastLogin = user.lastLoginDate;

  // Already updated today
  if (lastLogin === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday =
    lastLogin === yesterday.toDateString();

  // Continue streak if logged in yesterday,
  // otherwise reset to 1
  const newStreak = wasYesterday
    ? (user.streak || 0) + 1
    : 1;

  updateUser({
    streak:        newStreak,
    lastLoginDate: today,
  });

  checkBadgeUnlocks(newStreak);
  return newStreak;
}

// ── BADGE DEFINITIONS ──
const BADGES = {
  streak_3: {
    id: 'streak_3', emoji: '⚡',
    name: 'Eco Spark',
    desc: '3 day streak!',
    color: '#f4d03f',
  },
  streak_7: {
    id: 'streak_7', emoji: '🔥',
    name: 'Green Flame',
    desc: '7 day streak!',
    color: '#e67e22',
  },
  streak_30: {
    id: 'streak_30', emoji: '👑',
    name: 'Forest Guardian',
    desc: '30 day streak!',
    color: '#606C38',
  },
  streak_100: {
    id: 'streak_100', emoji: '💎',
    name: 'EcoLens Legend',
    desc: '100 day streak!',
    color: '#a29bfe',
  },
  first_log: {
    id: 'first_log', emoji: '🌱',
    name: 'First Breath',
    desc: 'Logged first day!',
    color: '#52B788',
  },
  earth_watch: {
    id: 'earth_watch', emoji: '🌍',
    name: 'Earth Watcher',
    desc: '3 days logged',
    color: '#48CAE4',
  },
  low_carbon: {
    id: 'low_carbon', emoji: '🍃',
    name: 'Tiny Steps',
    desc: 'Under 5kg CO₂!',
    color: '#2D6A4F',
  },
  plant_power: {
    id: 'plant_power', emoji: '🥗',
    name: 'Plant Powered',
    desc: '7 meat-free days',
    color: '#52B788',
  },
  pedal_hero: {
    id: 'pedal_hero', emoji: '🚲',
    name: 'Pedal Hero',
    desc: '5 zero-drive days',
    color: '#fd79a8',
  },
  sun_chaser: {
    id: 'sun_chaser', emoji: '☀️',
    name: 'Sun Chaser',
    desc: 'Used solar energy',
    color: '#f9ca24',
  },
  neutral: {
    id: 'neutral', emoji: '🌿',
    name: 'Carbon Neutral',
    desc: 'Monthly avg <3kg',
    color: '#6ab04c',
  },
  sharer: {
    id: 'sharer', emoji: '⭐',
    name: 'Climate Champion',
    desc: 'Shared your report',
    color: '#e17055',
  },
};

// ── CHECK BADGE UNLOCKS ──
function checkBadgeUnlocks(streak) {
  const user = getCurrentUser();
  if (!user) return;

  const earned   = user.badges || [];
  const toUnlock = [];

  if (streak >= 3   && !earned.includes('streak_3'))
    toUnlock.push('streak_3');
  if (streak >= 7   && !earned.includes('streak_7'))
    toUnlock.push('streak_7');
  if (streak >= 30  && !earned.includes('streak_30'))
    toUnlock.push('streak_30');
  if (streak >= 100 && !earned.includes('streak_100'))
    toUnlock.push('streak_100');

  if (toUnlock.length > 0) {
    const newBadges = [...earned, ...toUnlock];
    updateUser({ badges: newBadges });
    toUnlock.forEach(b => showBadgeToast(BADGES[b]));
  }
}

// ── UNLOCK SINGLE BADGE ──
function unlockBadge(badgeId) {
  const user = getCurrentUser();
  if (!user) return;

  const earned = user.badges || [];
  if (earned.includes(badgeId)) return;

  const newBadges = [...earned, badgeId];
  updateUser({ badges: newBadges });
  showBadgeToast(BADGES[badgeId]);
}

// ── TOAST NOTIFICATION ──
function showToast(message, type = 'success',
  duration = 3500) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

function showBadgeToast(badge) {
  if (!badge) return;
  showToast(
    `<span style="font-size:1.4rem">${badge.emoji}</span>
     <div>
       <div style="font-weight:700;font-size:0.9rem">
         Badge Unlocked: ${badge.name}!
       </div>
       <div style="font-size:0.78rem;opacity:0.8">
         ${badge.desc}
       </div>
     </div>`,
    'success',
    4000
  );
}

// ── ECO FACTS ──
const ECO_FACTS = [
  { icon: '🌿',
    fact: 'A single tree absorbs ~21 kg of CO₂ per year.' },
  { icon: '🚗',
    fact: 'Driving 1km emits ~0.21kg CO₂. Walking = zero!' },
  { icon: '🥩',
    fact: 'One beef burger = 3kg CO₂ — same as 365 phone charges.' },
  { icon: '💡',
    fact: 'LED bulbs use 75% less energy than incandescent ones.' },
  { icon: '✈️',
    fact: 'A single flight can double your annual carbon footprint.' },
  { icon: '🛍️',
    fact: 'Fashion industry produces 10% of global CO₂ emissions.' },
  { icon: '🌊',
    fact: 'Oceans absorb 25% of all CO₂ humans produce.' },
  { icon: '☀️',
    fact: 'Solar panels save ~1.3 tonnes of CO₂ per year.' },
  { icon: '🥗',
    fact: 'Plant-based diet cuts food emissions by up to 73%.' },
  { icon: '📱',
    fact: 'Your smartphone uses ~0.003 kg CO₂ per hour of use.' },
  { icon: '🚿',
    fact: 'A 5-min shower uses 35L of water. Baths use 150L.' },
  { icon: '♻️',
    fact: 'Recycling one aluminium can saves enough energy for 3hrs of TV.' },
];

function getRandomFact() {
  return ECO_FACTS[
    Math.floor(Math.random() * ECO_FACTS.length)
  ];
}

function renderFactCard(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const fact = getRandomFact();
  container.innerHTML = `
    <div class="fact-card">
      <div class="fact-icon">${fact.icon}</div>
      <div>
        <div class="fact-label">🌿 Eco Fact</div>
        <div class="fact-text">${fact.fact}</div>
      </div>
    </div>
  `;
}

// ── EMISSION FACTORS (kg CO₂) ──
const EMISSION_FACTORS = {
  // Transport (per km)
  car:         0.21,
  electric:    0.05,
  motorcycle:  0.11,
  bus:         0.089,
  train:       0.041,
  flight:      0.255,
  walk:        0,
  cycle:       0,
  none:        0,

  // Food (per meal)
  beef:        3.0,
  chicken:     0.9,
  fish:        0.7,
  vegetarian:  0.4,
  vegan:       0.2,

  // Energy (per kWh)
  electricity: 0.82,
  solar:       0.05,

  // Shopping
  clothing:    10.0,
  electronics: 70.0,
  groceries:   0.5,
};

// ── CALCULATE DAILY CARBON ──
function calculateDailyCarbon(log) {
  let total = 0;

  // Transport
  const mode = log.transportMode || 'car';
  total += (EMISSION_FACTORS[mode] ?? 0.21) *
    (log.transportKm || 0);

  // Food
  const foodType = log.foodType || 'vegetarian';
  total += (EMISSION_FACTORS[foodType] ?? 0.4) *
    (log.meals || 3);

  // Energy
  let kwh = log.electricityKwh || 0;
  if (log.usedAC) kwh += 4;
  const energyFactor = log.usedSolar
    ? EMISSION_FACTORS.solar
    : EMISSION_FACTORS.electricity;
  total += kwh * energyFactor;

  // Shopping
  if (log.boughtClothing)
    total += EMISSION_FACTORS.clothing;
  if (log.boughtElectronics)
    total += EMISSION_FACTORS.electronics;
  if (log.onlineDelivery)
    total += 0.5;
  total += (log.groceriesKg || 0) *
    EMISSION_FACTORS.groceries;

  return Math.round(total * 100) / 100;
}

// ── SAVE DAILY LOG ──
function saveDailyLog(logData) {
  const user = getCurrentUser();
  if (!user) return;

  const today  = new Date().toDateString();
  const carbon = calculateDailyCarbon(logData);

  const entry = {
    date:    today,
    carbon,
    ...logData,
    savedAt: new Date().toISOString(),
  };

  const key  = `ecolens_logs_${user.id}`;
  const logs = JSON.parse(
    localStorage.getItem(key) || '[]'
  );

  const todayIdx = logs.findIndex(l => l.date === today);
  if (todayIdx !== -1) {
    logs[todayIdx] = entry;
  } else {
    logs.push(entry);
    updateUser({ totalLogs: (user.totalLogs || 0) + 1 });

    if ((user.totalLogs || 0) === 0)
      unlockBadge('first_log');
    if ((user.totalLogs || 0) >= 2)
      unlockBadge('earth_watch');
  }

  localStorage.setItem(key, JSON.stringify(logs));

  if (carbon < 5) unlockBadge('low_carbon');
  if (window.updateGlobeScore)
    window.updateGlobeScore(carbon);

  return { entry, carbon };
}

// ── GET USER LOGS ──
function getUserLogs(days = 7) {
  const user = getCurrentUser();
  if (!user) return [];

  const key  = `ecolens_logs_${user.id}`;
  const logs = JSON.parse(
    localStorage.getItem(key) || '[]'
  );

  return logs.slice(-days);
}

// ── GET TODAY'S LOG ──
function getTodayLog() {
  const user = getCurrentUser();
  if (!user) return null;

  const today = new Date().toDateString();
  const key   = `ecolens_logs_${user.id}`;
  const logs  = JSON.parse(
    localStorage.getItem(key) || '[]'
  );

  return logs.find(l => l.date === today) || null;
}

// ── SLIDEOUT ANIMATION ──
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to   { transform: translateX(120px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ── AUTO INIT ──
document.addEventListener('DOMContentLoaded', () => {
  populateNav();
  checkAndUpdateStreak();
});