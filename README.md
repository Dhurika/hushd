# 🤫 Hushd — React Web App

> Send your feelings into the world. A stranger might just write back.

## Setup

```bash
# 1. Install deps
npm install

# 2. Configure Supabase (REQUIRED - 100% FREE!)
# See SUPABASE_SETUP.md for detailed instructions
# Edit src/supabase.js with your Supabase credentials

# 3. Run locally
npm run dev
# → opens at http://localhost:5173

# 4. Build for production
npm run build
```

## Deploy to Vercel (free, 2 mins)

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel
# follow the prompts → live URL in 60 seconds
```

### Option B — GitHub + Vercel UI
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import repo
3. Framework: Vite
4. Click Deploy → done ✅

## Screens

| Route | Screen |
|-------|--------|
| `/` | Live mood map — tap dots, filter by mood |
| `/drop` | Drop your mood on the map (deprecated - now in sidebar) |
| `/write` | Write anonymous letter to a mood dot |
| `/letters` | Inbox — letters received + reply |

## Tech Stack

- **Frontend**: React + Vite
- **Map**: Leaflet + OpenStreetMap
- **Database**: Supabase (PostgreSQL + Real-time)
- **Auth**: Supabase Anonymous Auth
- **Hosting**: Vercel

## Features

✅ Real-time global mood map
✅ Anonymous users (no signup)
✅ Moods auto-expire after 6 hours
✅ Send anonymous letters
✅ Reply to moods
✅ Filter by mood type
✅ Location-based drops

Built with 🤫 by Dhuriii
