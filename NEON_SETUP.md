# Neon Database Setup Guide

## Why Neon?
- **Free tier**: 512MB storage, perfect for personal projects
- **PostgreSQL**: Works with your existing Drizzle schema
- **Serverless**: Automatically scales and sleeps when not in use
- **Easy setup**: Just sign up with GitHub

## Step-by-Step Setup

### 1. Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Click "Sign up" and choose "Continue with GitHub"
3. Authorize the Neon app

### 2. Create Database Project
1. Click "Create a project"
2. Project name: `boardgame-tracker`
3. Database name: `boardgame_tracker` (or keep default)
4. Region: Choose closest to your users
5. Click "Create project"

### 3. Get Connection String
1. After project creation, you'll see the connection details
2. Copy the "Connection string" - it includes everything you need
3. Example: `postgresql://david:abc123@ep-cool-lab-123456.us-east-2.aws.neon.tech/boardgame_tracker?sslmode=require`

### 4. Test Connection (Optional)
You can test locally before deploying:
```bash
# Update your .env.local with the Neon URL
DATABASE_URL="postgresql://your-neon-connection-string"

# Test the connection
npm run db:push
```

## Neon Dashboard Features
- **Query Editor**: Run SQL directly in the browser
- **Monitoring**: See connection and query stats
- **Branching**: Create database branches for testing (pro feature)

## Free Tier Limits
- **Storage**: 512MB (plenty for thousands of games and plays)
- **Compute**: 100 hours/month active time
- **Projects**: 1 project
- **Databases**: 1 database per project

For most personal board game collections, this is more than enough!

## Next Steps
Once you have your Neon connection string, continue with the main deployment guide to set up GitHub and Vercel.
