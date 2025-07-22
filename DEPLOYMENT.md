# Deployment Guide

## 1. Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New project"
3. Enter project name: `boardgame-tracker`
4. Choose a strong database password (save it!)
5. Select a region close to your users
6. Click "Create new project"

### Get Database Connection String
1. Go to Settings → Database in your Supabase dashboard
2. Find "Connection string" section
3. Copy the URI format connection string
4. Replace `[YOUR-PASSWORD]` with your actual database password

Example: `postgresql://postgres:your_password@db.abc123.supabase.co:5432/postgres`

## 2. GitHub Repository

### Create GitHub Repository
1. Go to [github.com](https://github.com) and create a new repository
2. Name it `boardgame-tracker` (or your preferred name)
3. Make it public or private (your choice)
4. Don't initialize with README (we already have files)

### Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/boardgame-tracker.git
git branch -M main
git push -u origin main
```

## 3. Vercel Deployment

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click "Add New..." → "Project"
3. Import your `boardgame-tracker` repository
4. Click "Deploy" (it will fail first time - that's okay!)

### Configure Environment Variables
In your Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add these variables:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.abc123.supabase.co:5432/postgres
NEXTAUTH_SECRET=your-very-long-random-secret-string
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### Generate NEXTAUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## 4. Database Migration

After deployment, you need to set up the database schema:

### Option A: Use Drizzle Push (Recommended)
1. Clone your deployed repository locally
2. Update `.env.local` with production DATABASE_URL
3. Run: `npx drizzle-kit push`

### Option B: Manual SQL (if needed)
Execute the SQL from `src/lib/db/migrations/0000_curvy_black_crow.sql` in your Supabase SQL editor.

## 5. Final Steps

1. **Redeploy**: After setting environment variables, trigger a new deployment in Vercel
2. **Test**: Visit your app URL and test registration/login
3. **Add Games**: Try adding games from BGG and logging plays

## Troubleshooting

- **Build fails**: Check environment variables are set correctly
- **Database errors**: Verify DATABASE_URL format and password
- **Auth errors**: Ensure NEXTAUTH_SECRET is set and NEXTAUTH_URL matches your domain
- **BGG API issues**: The BGG XML API can be slow, be patient with searches

Your app will be live at: `https://your-project-name.vercel.app`
