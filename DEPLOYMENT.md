# TheBeat - Netlify Deployment Guide

## Overview
This guide walks you through deploying your React app to Netlify with your OpenAI API key secured.

---

## Step 1: Prepare Your GitHub Repository

### 1a. Create a new GitHub repo (or use existing)
- Go to https://github.com/new
- Name: `thebeat` (or whatever you prefer)
- Make it **Public** (free tier requirement for Netlify)
- Click "Create repository"

### 1b. Push your code to GitHub

**On your computer, in your project folder:**

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: TheBeat"

# Add GitHub as remote (replace YOUR-USERNAME and REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/thebeat.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Your files are now on GitHub.** ✓

---

## Step 2: Set Up Netlify

### 2a. Sign up / Log in to Netlify
- Go to https://netlify.com
- Click "Sign up" or log in
- Choose "GitHub" as your provider
- Authorize Netlify to access your GitHub repos

### 2b. Create a new site from GitHub

1. Click **"New site from Git"**
2. Select **GitHub** as your git provider
3. Search for your repo: `thebeat`
4. Click to select it
5. You'll see build settings:
   - **Branch to deploy:** `main` ✓
   - **Build command:** `npm run build` ✓
   - **Publish directory:** `dist` ✓
   - Leave these as-is

### 2c. Add your OpenAI API Key

**Before clicking "Deploy":**

1. Scroll down to **"Environment"**
2. Click **"Add Environment Variable"**
3. Fill in:
   - **Key:** `VITE_OPENAI_API_KEY`
   - **Value:** Paste your OpenAI API key (sk-xxxxx...)
4. Click "Save"
5. Now click **"Deploy site"**

Netlify will now:
- Download your code from GitHub
- Install dependencies
- Build the app
- Deploy to a live URL

**This takes 2-3 minutes.** ✓

---

## Step 3: Your Site is Live!

Once deployment completes, Netlify will show you a URL like:
```
https://thebeat-xyz.netlify.app
```

That's your public URL. Share it, bookmark it, use it.

---

## Step 4: Making Updates

When you make changes to your code:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

2. **Netlify automatically detects the push and redeploys** ✓

No manual steps needed—just push to GitHub and it's live in ~2 minutes.

---

## Step 5: Monitor & Troubleshoot

**To check deployment status:**
- Go to your Netlify site dashboard
- Click "Deployments"
- See build logs, status, and live URL

**If something fails:**
- Click the failed deployment
- Scroll to "Deploy log"
- Read error messages (usually clear)
- Common issues:
  - Missing `npm install` (fixed: update package.json dependencies)
  - API key not set in Netlify env (fixed: add it in Step 2c)
  - Port issues (not relevant—Netlify handles this)

---

## Important Notes

### Security
✓ Your API key is **only stored in Netlify**, encrypted  
✓ It's **never** committed to GitHub  
✓ It's **never** exposed in your code  
✓ Each user's data stays in their **browser** (localStorage)

### Data Storage
- No backend database currently
- Data saved to browser's localStorage
- Data persists per device/browser
- To add a database later: ask for instructions

### Limits
- OpenAI API calls cost money (~$0.003 per request)
- Monitor usage at https://platform.openai.com/usage
- Set up billing alerts if needed

---

## Troubleshooting Checklist

- [ ] GitHub repo created and code pushed?
- [ ] Netlify account created?
- [ ] Site connected to GitHub?
- [ ] `VITE_OPENAI_API_KEY` added to Netlify environment?
- [ ] Deployment completed successfully?
- [ ] Live URL working?

---

## Next Steps (Optional)

Once live, you can:
- **Add a custom domain** (Netlify settings → Domain management)
- **Add authentication** (Netlify Identity or Auth0)
- **Add a backend database** (Firebase, Supabase, MongoDB)
- **Monitor performance** (Netlify Analytics)

For now, you have a fully functional, publicly accessible app. 🎉

---

## Questions?

- Netlify docs: https://docs.netlify.com
- OpenAI API docs: https://platform.openai.com/docs
- Vite docs: https://vitejs.dev
