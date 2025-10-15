# Deploy in 3 Steps (10 minutes)

I've set up everything. You just need to do 3 quick steps to get it live:

## Step 1: Create GitHub Repository (2 minutes)

1. Go to https://github.com/new
2. Repository name: `team-tracker`
3. Make it **Public** or **Private** (your choice)
4. **Don't** initialize with README
5. Click **Create repository**

Then run these commands in your terminal:

```bash
cd ~/team-tracker
git remote add origin https://github.com/YOUR-USERNAME/team-tracker.git
git push -u origin main
```

(Replace `YOUR-USERNAME` with your actual GitHub username)

## Step 2: Create Supabase Database (3 minutes)

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Give it a name: `team-tracker`
4. Create a database password (save it somewhere)
5. Choose a region close to you
6. Click **Create new project** (wait 2 minutes for it to set up)

Once ready:
1. Go to **Settings** (left sidebar) → **API**
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy the **anon public** key (long string)

Then set up the database:
1. Go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `~/team-tracker/supabase/schema.sql` on your computer
4. Copy ALL the SQL and paste it into Supabase
5. Click **Run** (bottom right)

## Step 3: Deploy to Vercel (5 minutes)

1. Go to https://vercel.com/signup
2. Sign up with your GitHub account
3. Once logged in, click **Add New** → **Project**
4. Select your `team-tracker` repository
5. Click **Deploy** (but WAIT, don't click yet!)

**BEFORE clicking Deploy**, click **Environment Variables** and add these two:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL from Step 2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 2 |

6. NOW click **Deploy**

Wait 2-3 minutes. When done, you'll get a URL like `team-tracker.vercel.app`

## You're Done!

Visit your URL and you have a working team tracker that:
- Works on any device (Mac, Windows, phone, tablet)
- Your whole team can access
- Updates in real-time
- Is totally free (for normal team sizes)

## Optional: Use Your Own Domain

In Vercel:
1. Go to your project → **Settings** → **Domains**
2. Add your domain (like `tracker.yourcompany.com`)
3. Follow the DNS instructions

---

**Need help?** The README has troubleshooting tips, or just ask me!
