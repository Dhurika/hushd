# 🔧 Troubleshooting Guide

## Common Errors & Solutions

### ❌ "Failed to drop mood. Check Supabase config."

This means one of these issues:

---

## 1️⃣ Table Doesn't Exist

**Error in console:**
```
relation "public.moods" does not exist
```

**Solution:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy contents of `supabase-schema.sql`
3. Paste and click **Run**
4. Wait for "Success" message

**OR** create table manually:
1. Go to **Table Editor**
2. Click **New table**
3. Name: `moods`
4. Add all columns from `SUPABASE_SETUP.md`

---

## 2️⃣ Anonymous Auth Not Enabled

**Error in console:**
```
Anonymous sign-ins are disabled
```

**Solution:**
1. Go to Supabase Dashboard → **Authentication**
2. Click **Providers**
3. Find **Anonymous**
4. Toggle **Enable Anonymous sign-ins** ON
5. Click **Save**

---

## 3️⃣ Wrong Credentials

**Error in console:**
```
Invalid API key
```

**Solution:**
1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy **Project URL** (should be `https://xxxxx.supabase.co`)
3. Copy **anon public** key (NOT service_role!)
4. Open `src/supabase.js`
5. Replace both values
6. Save and refresh browser

---

## 4️⃣ Realtime Not Enabled

**Symptoms:**
- Mood drops successfully
- But doesn't appear on map immediately
- Need to refresh page to see it

**Solution:**
1. Go to Supabase Dashboard → **Database** → **Replication**
2. Find `moods` table
3. Toggle **Enable Realtime** ON
4. Click **Save**

---

## 5️⃣ RLS (Row Level Security) Blocking

**Error in console:**
```
new row violates row-level security policy
```

**Solution:**
1. Go to Supabase Dashboard → **Table Editor**
2. Click on `moods` table
3. Click **⚙️** (settings icon)
4. Find **Enable Row Level Security (RLS)**
5. Toggle it **OFF** (for testing)
6. Click **Save**

**Note:** For production, keep RLS ON and add proper policies.

---

## 🔍 How To Debug

### Step 1: Open Browser Console
- Press **F12** (Windows) or **Cmd+Option+I** (Mac)
- Click **Console** tab

### Step 2: Try Dropping a Mood
- Pick a mood
- Click "drop now"
- Watch console for messages

### Step 3: Look For These Messages

**✅ Success:**
```
🔄 Starting mood drop...
✅ User authenticated: abc-123-xyz
📤 Sending mood data: {...}
✅ Mood dropped successfully!
```

**❌ Auth Error:**
```
🔄 Starting mood drop...
❌ Auth error: Anonymous sign-ins are disabled
```
→ Enable Anonymous Auth (see #2 above)

**❌ Table Error:**
```
🔄 Starting mood drop...
✅ User authenticated: abc-123-xyz
📤 Sending mood data: {...}
❌ Supabase error: relation "public.moods" does not exist
```
→ Create table (see #1 above)

**❌ RLS Error:**
```
❌ Supabase error: new row violates row-level security policy
```
→ Disable RLS (see #5 above)

---

## 🧪 Test Supabase Connection

Create a test file to verify connection:

**test-supabase.html**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Supabase</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <h1>Supabase Connection Test</h1>
  <button onclick="testConnection()">Test Connection</button>
  <pre id="result"></pre>

  <script>
    const supabase = window.supabase.createClient(
      'YOUR_SUPABASE_URL',
      'YOUR_ANON_KEY'
    )

    async function testConnection() {
      const result = document.getElementById('result')
      result.textContent = 'Testing...\n'

      // Test 1: Auth
      try {
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) throw error
        result.textContent += '✅ Auth works! User ID: ' + data.user.id + '\n'
      } catch (e) {
        result.textContent += '❌ Auth failed: ' + e.message + '\n'
        return
      }

      // Test 2: Table exists
      try {
        const { data, error } = await supabase.from('moods').select('*').limit(1)
        if (error) throw error
        result.textContent += '✅ Table exists!\n'
      } catch (e) {
        result.textContent += '❌ Table error: ' + e.message + '\n'
        return
      }

      // Test 3: Insert
      try {
        const { data, error } = await supabase.from('moods').insert({
          user_id: (await supabase.auth.getUser()).data.user.id,
          lat: 40.7128,
          lng: -74.0060,
          city: 'Test City',
          emoji: '😄',
          mood: 'happy',
          caption: 'test',
          expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          relates: 0,
          letters: 0
        }).select()
        if (error) throw error
        result.textContent += '✅ Insert works!\n'
        result.textContent += '\n🎉 Everything is working!'
      } catch (e) {
        result.textContent += '❌ Insert failed: ' + e.message + '\n'
      }
    }
  </script>
</body>
</html>
```

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] Supabase project is created
- [ ] `moods` table exists with all columns
- [ ] Anonymous auth is enabled
- [ ] Realtime is enabled for `moods` table
- [ ] RLS is disabled (for testing)
- [ ] Credentials are correct in `src/supabase.js`
- [ ] Browser console shows detailed error
- [ ] Tried refreshing the page

---

## 🆘 Still Not Working?

1. **Check browser console** - Press F12, look for red errors
2. **Copy the exact error message**
3. **Check which step fails** (auth, insert, etc.)
4. **Verify table structure** matches `supabase-schema.sql`

**Most common issue:** Table doesn't exist or RLS is blocking inserts!

---

## ✅ Success Looks Like This

**Console output:**
```
🔄 Starting mood drop...
✅ User authenticated: 12345678-1234-1234-1234-123456789012
📤 Sending mood data: {user_id: "...", lat: 40.7128, ...}
✅ Mood dropped successfully! [{id: 1, ...}]
```

**On screen:**
- Rocket animation plays 🚀
- "Mood dropped! 🌍" message appears
- Redirects to map
- Mood appears on map instantly

---

**Need more help? Check the error message in console and match it to the solutions above!** 🔍
