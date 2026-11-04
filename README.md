# 🔍 LeadFinder – Business Lead Discovery Platform

A modern SaaS-style tool to find real businesses **without websites** so your agency can pitch them digital services.

---

## 🚀 Quick Start

### 1. Double-click `start.bat`
This opens two terminals — one for the backend and one for the frontend — then launches your browser at **http://localhost:5173**.

### 2. Manual Start

**Backend** (Terminal 1):
```bash
cd server
npx ts-node-dev --respawn --transpile-only src/index.ts
```

**Frontend** (Terminal 2):
```bash
cd client
npm run dev
```

Then open **http://localhost:5173**

---

## 🔑 SerpAPI Key (Required for Live Search)

1. Go to [serpapi.com](https://serpapi.com) and create a **free account**
2. Copy your API key from the [dashboard](https://serpapi.com/manage-api-key)
3. Open `server/.env` and set:
   ```
   SERP_API_KEY=your_key_here
   ```
4. Restart the backend

> **Free plan:** 100 searches/month — enough for testing. Paid plans unlock more.
> **Without a key**, the search returns 0 results — no fake data is ever generated.

---

## 📂 Project Structure

```
Chasmish Tool/
├── client/                 # React 19 + Vite + Tailwind CSS frontend
│   └── src/
│       ├── pages/          # Dashboard, FindLeads, AllLeads, SavedLeads, Team, Export, Settings
│       ├── components/     # Layout, Sidebar, Header, LeadCard, PitchModal
│       ├── context/        # ThemeContext (dark/light + agency name)
│       └── types.ts        # Shared TypeScript types
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── routes/         # leads, search, team, export, pitch
│   │   ├── services/       # googlePlaces, websiteVerifier, leadScorer
│   │   ├── database.ts     # lowdb JSON database
│   │   └── index.ts        # Express app entry
│   ├── data/leads.json     # Auto-created database file
│   └── .env                # API keys
└── start.bat               # One-click launcher
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔍 Business Search | SerpAPI Google Maps — real businesses worldwide |
| ✅ Website Verification | HTTP checks + smart slug guessing |
| 🚫 Auto-exclusion | Businesses with websites are excluded automatically |
| 📊 Quality Score | 0–100 score based on available data |
| 💬 AI Pitch Generator | WhatsApp, Instagram DM, or Email pitch |
| 📋 Lead Management | Status tracking, notes, team assignment |
| 📤 Export | CSV, XLSX, JSON |
| 🌙 Dark/Light Mode | Toggle in header |
| 👥 Team Management | Add agents, assign leads |
| 🔢 Custom Categories | Type any category not in the list |

---

## 🌐 Website Verification Logic

1. If SerpAPI returns a website URL → check if it's social media (excluded) → verify reachability
2. If no URL from API → try common slug variants (`business.com`, `www.business.com`, etc.)
3. Only businesses confirmed to have **no reachable website** are included
4. Unverified or uncertain → **excluded** from results

> Social media (Facebook, Instagram, TikTok, etc.) is **never** counted as an official website.

---

## 📊 Lead Quality Score

| Factor | Points |
|---|---|
| Has phone number | +20 |
| Has email | +15 |
| Has social media | +10 |
| Website confirmed absent | +30 |
| Has description | +10 |
| Has Google Maps | +10 |
| Has address | +5 |

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS 4, Recharts
- **Backend**: Node.js, Express, TypeScript, ts-node-dev
- **Database**: lowdb (JSON — no native builds required)
- **APIs**: SerpAPI (Google Maps search)
- **Export**: xlsx (XLSX + CSV)

