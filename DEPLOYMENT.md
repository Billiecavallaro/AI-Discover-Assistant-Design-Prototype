# GitHub Pages Deployment Guide

## Quick Setup

### Step 1: Install gh-pages package
```bash
npm install gh-pages --save-dev
```

### Step 2: Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: GRaCe AI Assistant"
```

### Step 3: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `Discover-AI-Assistant-Design`
3. Make it **Public** (required for free GitHub Pages)
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Step 4: Connect and Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Discover-AI-Assistant-Design.git
git push -u origin main
```
*(Replace YOUR_USERNAME with your actual GitHub username)*

### Step 5: Deploy to GitHub Pages
```bash
npm run deploy
```

This will:
- Build your project
- Create a `gh-pages` branch
- Deploy the built files to GitHub Pages

### Step 6: Enable GitHub Pages (if needed)
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **gh-pages** branch
4. Click **Save**

### Step 7: Access Your Site
Your site will be live at:
```
https://YOUR_USERNAME.github.io/Discover-AI-Assistant-Design/
```

## Updating Your Site

After making changes to your code:
```bash
git add .
git commit -m "Your commit message"
git push
npm run deploy
```

## Important Notes

- The repository name must match: `Discover-AI-Assistant-Design` (or update the `base` path in `vite.config.ts`)
- The site may take a few minutes to be available after the first deployment
- All future deployments use: `npm run deploy`

