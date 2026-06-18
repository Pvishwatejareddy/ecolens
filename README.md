# 🌍 EcoLens — AI-Powered Carbon Footprint Tracker

> Know Your Carbon. Change Your World.

## 🎯 Challenge
Hack2Skill Challenge 3 — Design a solution that helps 
individuals understand, track, and reduce their carbon 
footprint through simple actions and personalized insights.

## 🌿 What is EcoLens?
EcoLens is a beautiful, AI-powered web application that 
makes carbon tracking personal, visual and motivating.

## ✨ Key Features
- 🌍 **Live 3D Earth Globe** — Reacts to your daily carbon score
- 🤖 **Gemini AI Carbon Coach** — 3 personalized daily tips
- 📝 **2-Minute Daily Logger** — Transport, food, energy, shopping
- 📊 **Smart Analytics** — Weekly/monthly carbon trends
- 🏅 **Badge System** — Duolingo-style eco achievements
- 🔥 **Streak Tracking** — Daily motivation system
- 📱 **Fully Responsive** — Works on mobile & desktop

## 🎨 Design Decisions
- **Theme:** Light & Organic — warm cream, moss green, amber
- **Fonts:** Playfair Display + DM Sans (premium editorial feel)
- **3D:** Three.js with NASA-style realistic Earth textures
- **Colors:** Earth & Sky palette — not a typical green app

## 🧠 Chosen Vertical
**Individual Carbon Tracking** — focused on daily lifestyle 
choices that make up 45% of personal carbon footprints.

## 🔧 How It Works
1. User signs up and sees their personal 3D Earth
2. Logs daily activity in 2 minutes (transport/food/energy/shopping)
3. Gemini AI analyzes the log and gives 3 personalized tips
4. Earth globe changes color based on carbon score
5. User earns badges and builds daily streaks
6. History page shows weekly/monthly progress charts

## 💡 Approach & Logic
- **Carbon calculations** based on real IPCC emission factors
- **Indian grid average** (0.82 kg CO₂/kWh) used for energy
- **Personalized AI** prompts include user city and actual habits
- **Gamification** increases daily retention and habit formation
- **localStorage** for zero-backend, privacy-first data storage

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| 3D Globe | Three.js (r128) |
| AI Engine | Google Gemini 1.5 Flash API |
| Charts | Chart.js |
| Auth | localStorage session management |
| Hosting | GitHub Pages |
| Fonts | Google Fonts (Playfair Display + DM Sans) |

## 📁 Project Structure

ecolens/

├── index.html          # Landing page with 3D globe

├── onboarding.html     # 5-step intro flow

├── login.html          # Authentication

├── signup.html         # User registration

├── dashboard.html      # Main hub with globe + stats

├── log.html            # Daily carbon logger

├── insights.html       # Gemini AI tips

├── history.html        # Charts & trends

├── badges.html         # Achievement system

├── profile.html        # User settings

├── css/

│   ├── global.css      # Design system & variables

│   └── components.css  # Reusable UI components

└── js/

├── auth.js         # Login/signup/session

├── carbon.js       # Emission calculations

├── charts.js       # Chart configurations

└── globe.js        # Three.js 3D Earth

## 🌱 Assumptions Made
- Average Indian household electricity: 5-10 kWh/day
- Indian grid emission factor: 0.82 kg CO₂/kWh
- Average meal carbon based on food type
- Transport emissions per km from standard IPCC data
- Data stored locally for privacy (no server needed)

## 🚀 Live Demo
👉 [https://pvishwatejareddy.github.io/ecolens](https://pvishwatejareddy.github.io/ecolens)

## 👩‍💻 Built By
**P Vishwa Teja** — Hack2Skill Challenge 3
Built with 💚 for a greener planet