# GitHub Repository Setup Commands

After creating a new repository on GitHub, run these commands:

```bash
# Add your GitHub repository as remote origin (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

## Example:
If your GitHub username is `davidfeldman` and you name the repo `board-game-tracker`, the command would be:

```bash
git remote add origin https://github.com/davidfeldman/board-game-tracker.git
git branch -M main
git push -u origin main
```

## After Pushing to GitHub:

1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. Configure environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `NEXTAUTH_URL`: https://your-app-name.vercel.app
   - `NEXTAUTH_SECRET`: MDRBQYnRZICI7uGHz06NemqoLEKDFXxcuCImkSywvpY=
5. Deploy!

Your app will be live and ready to use with the Neon database.
