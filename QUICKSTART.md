# ✅ Supabase Quick Setup Checklist

## 1️⃣ Create Account
- [ ] Go to https://supabase.com
- [ ] Sign up (GitHub or email)
- [ ] **No credit card needed!** ✅

## 2️⃣ Create Project
- [ ] Click "New Project"
- [ ] Name: `hushd-app`
- [ ] Set database password (save it!)
- [ ] Choose region
- [ ] Wait 2 mins for setup

## 3️⃣ Create Table
- [ ] Click "Table Editor"
- [ ] Click "Create a new table"
- [ ] Name: `moods`
- [ ] **Disable RLS** (for now)
- [ ] Add columns (see SUPABASE_SETUP.md)
- [ ] Click "Save"

### Quick Columns Setup:
```
id (int8, primary key, auto)
created_at (timestamptz, default: now())
user_id (uuid)
lat (float8)
lng (float8)
city (text)
emoji (text)
mood (text)
caption (text)
expires_at (timestamptz)
relates (int4, default: 0)
letters (int4, default: 0)
```

## 4️⃣ Enable Anonymous Auth
- [ ] Click "Authentication"
- [ ] Click "Providers"
- [ ] Find "Anonymous"
- [ ] Toggle "Enable"
- [ ] Save

## 5️⃣ Get Credentials
- [ ] Click ⚙️ Settings
- [ ] Click "API"
- [ ] Copy "Project URL"
- [ ] Copy "anon public" key

## 6️⃣ Update Code
- [ ] Open `src/supabase.js`
- [ ] Paste your URL
- [ ] Paste your anon key
- [ ] Save file

## 7️⃣ Enable Realtime
- [ ] Go to "Database" → "Replication"
- [ ] Find `moods` table
- [ ] Toggle "Enable Realtime"
- [ ] Save

## 8️⃣ Test
- [ ] Run `npm run dev`
- [ ] Drop a mood
- [ ] Open incognito
- [ ] See mood appear! 🎉

---

## Your Credentials

```javascript
// Paste in src/supabase.js
const supabaseUrl = 'https://xxxxx.supabase.co'
const supabaseAnonKey = 'eyJhbGc...'
```

---

## ✅ All Done?

Your app is now:
- 🌍 Live globally
- 🔥 Real-time
- 🤫 Anonymous
- 🆓 **100% FREE!**

Deploy: `vercel`
