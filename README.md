# 🤫 Hushd — React Web App

> Send your feelings into the world. A stranger might just write back.

## Setup

```bash
# 1. Install deps
npm install

# 2. Run locally
npm run dev
# → opens at http://localhost:5173

# 3. Build for production
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
| `/drop` | Drop your mood on the map |
| `/write` | Write anonymous letter to a mood dot |
| `/letters` | Inbox — letters received + reply |

## Next: Firebase (real-time data)
```bash
npm install firebase
```
- Replace mock data in `src/data/moods.js` with Firestore reads
- Add anonymous auth with Firebase Auth
- Add push notifications with Firebase Cloud Messaging

Built with 🤫 by Dhuriii
