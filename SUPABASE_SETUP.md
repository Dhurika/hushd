# 🚀 Supabase Setup Guide - 100% FREE!

## Why Supabase?
- ✅ **Completely FREE** - No credit card required
- ✅ **Real-time database** - Like Firebase
- ✅ **Anonymous auth** - No signup needed
- ✅ **Better free tier** - 500MB database, 2GB bandwidth
- ✅ **Open source** - Self-hostable

---

## Step 1: Create Supabase Account (1 min)

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (or email)
4. **No credit card needed!** ✅

---

## Step 2: Create New Project (2 mins)

1. Click **"New Project"**
2. Fill in:
   - **Name**: `hushd-app`
   - **Database Password**: (generate strong password - save it!)
   - **Region**: Choose closest to your users
3. Click **"Create new project"**
4. Wait 2 minutes for setup ⏳

---

## Step 3: Create Moods Table

1. Click **"Table Editor"** in left sidebar
2. Click **"Create a new table"**
3. Table name: `moods`
4. **Disable RLS** (Row Level Security) for now
5. Add these columns:

| Column Name | Type | Default | Extra |
|------------|------|---------|-------|
| `id` | `int8` | Auto | Primary Key ✅ |
| `created_at` | `timestamptz` | `now()` | - |
| `user_id` | `uuid` | - | - |
| `lat` | `float8` | - | - |
| `lng` | `float8` | - | - |
| `city` | `text` | - | - |
| `emoji` | `text` | - | - |
| `mood` | `text` | - | - |
| `caption` | `text` | - | - |
| `expires_at` | `timestamptz` | - | - |
| `relates` | `int4` | `0` | - |
| `letters` | `int4` | `0` | - |

6. Click **"Save"**

---

## Step 4: Enable Anonymous Auth

1. Click **"Authentication"** in left sidebar
2. Click **"Providers"**
3. Find **"Anonymous"**
4. Toggle **"Enable Anonymous sign-ins"**
5. Click **"Save"**

---

## Step 5: Get Your Credentials

1. Click **⚙️ Settings** in left sidebar
2. Click **"API"**
3. Copy these two values:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
```

---

## Step 6: Update Your Code

Open `src/supabase.js` and replace:

```javascript
const supabaseUrl = 'https://xxxxx.supabase.co'  // ← Your Project URL
const supabaseAnonKey = 'eyJhbGc...'             // ← Your anon key
```

**OR** create `.env` file:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Step 7: Enable Realtime (Important!)

1. Go to **"Database"** → **"Replication"**
2. Find `moods` table
3. Toggle **"Enable Realtime"**
4. Click **"Save"**

This makes moods appear instantly on the map! 🔥

---

## Step 8: Test It! 🎉

```bash
npm run dev
```

1. Open http://localhost:5173
2. Allow location
3. Drop a mood
4. Open in incognito/another browser
5. **See the mood appear in real-time!** 🌍

---

## Step 9: Set Up Auto-Delete (Optional)

Create a PostgreSQL function to auto-delete expired moods:

1. Go to **"SQL Editor"**
2. Click **"New query"**
3. Paste this:

```sql
-- Create function to delete expired moods
CREATE OR REPLACE FUNCTION delete_expired_moods()
RETURNS void AS $$
BEGIN
  DELETE FROM moods WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule it to run every hour
SELECT cron.schedule(
  'delete-expired-moods',
  '0 * * * *',  -- Every hour
  'SELECT delete_expired_moods();'
);
```

4. Click **"Run"**

Now expired moods auto-delete every hour! ⏰

---

## Troubleshooting

### "Invalid API key"
→ Check you copied the **anon public** key, not the service_role key

### "Table does not exist"
→ Make sure table name is exactly `moods` (lowercase)

### Moods not appearing
→ Check browser console for errors
→ Verify Realtime is enabled for `moods` table

### "Anonymous sign-ins are disabled"
→ Go to Authentication → Providers → Enable Anonymous

---

## Free Tier Limits

Supabase Free Plan includes:
- ✅ **500 MB database** storage
- ✅ **2 GB bandwidth** per month
- ✅ **50,000 monthly active users**
- ✅ **Unlimited API requests**
- ✅ **Real-time subscriptions**

**Perfect for your app!** You won't hit these limits during testing. 🎯

---

## Database Structure

```javascript
moods {
  id: 1,
  created_at: "2024-01-15T10:30:00Z",
  user_id: "uuid-here",
  lat: 40.7128,
  lng: -74.0060,
  city: "New York",
  emoji: "😄",
  mood: "happy",
  caption: "feeling great!",
  expires_at: "2024-01-15T16:30:00Z",  // 6 hours later
  relates: 0,
  letters: 0
}
```

---

## Next Steps

✅ **Deploy to Vercel:**
```bash
npm install -g vercel
vercel
```

✅ **Add Row Level Security (RLS):**
- Prevent users from deleting others' moods
- See Supabase docs for RLS policies

✅ **Monitor Usage:**
- Dashboard → Settings → Usage
- Track database size, bandwidth

---

## 🎉 Done!

Your app now has:
- 🌍 Real-time global mood map
- 🤫 Anonymous users
- ⏰ Auto-expiring moods (6 hours)
- 💾 Cloud database
- 🆓 **100% FREE - No credit card ever!**

**Questions?** Check [Supabase Docs](https://supabase.com/docs)
