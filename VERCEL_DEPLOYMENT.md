# Vercel Deployment Guide

Your board game tracker app is now ready to deploy to Vercel! Follow these steps:

## Step 1: Go to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign in with your GitHub account

## Step 2: Import Your Repository
1. Click "New Project" or "Add New Project"
2. Import your repository: `djfeld01/board-game-tracker`
3. Vercel will automatically detect it's a Next.js project

## Step 3: Configure Environment Variables
Before deploying, add these environment variables in Vercel:

### Required Environment Variables:
```
DATABASE_URL=postgresql://neondb_owner:npg_d7gmajxYC3Do@ep-small-star-ael1y7ey-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_SECRET=MDRBQYnRZICI7uGHz06NemqoLEKDFXxcuCImkSywvpY=

NEXTAUTH_URL=https://your-app-name.vercel.app
```

**Note:** Replace `your-app-name` in `NEXTAUTH_URL` with your actual Vercel deployment URL.

## Step 4: Deploy
1. Click "Deploy"
2. Vercel will build and deploy your app
3. Once deployed, update the `NEXTAUTH_URL` environment variable with your actual Vercel URL

## Step 5: Update NEXTAUTH_URL
After your first deployment:
1. Copy your Vercel app URL (e.g., `https://board-game-tracker-xyz.vercel.app`)
2. Go to Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` with your actual URL
4. Redeploy the app

## Your App Features:
✅ User authentication with NextAuth.js
✅ Board game collection management
✅ BoardGameGeek API integration
✅ Play logging with scoring system
✅ Edit and delete games/plays
✅ Dashboard with statistics
✅ Responsive design

## Database:
✅ PostgreSQL via Neon (already migrated and ready)
✅ All tables created and configured

## Troubleshooting:
- If authentication doesn't work, make sure `NEXTAUTH_URL` matches your Vercel domain exactly
- If database connection fails, verify the `DATABASE_URL` is correct
- Check Vercel's function logs for any runtime errors

## Success! 
Once deployed, you'll have a fully functional board game tracker app live on the internet!

Your repository: https://github.com/djfeld01/board-game-tracker
