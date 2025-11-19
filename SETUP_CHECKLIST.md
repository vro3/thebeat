# TheBeat - Setup Checklist (30 Minutes)

Follow these steps in order to get your app live on Netlify.

---

## ✅ Step 1: Get Your OpenAI API Key (2 min)

- [ ] Go to https://platform.openai.com/api-keys
- [ ] Log in with your OpenAI account
- [ ] Click "Create new secret key"
- [ ] Copy the key (starts with `sk-`)
- [ ] **Paste it somewhere safe** (password manager, secure note)
  - Do NOT paste in chat or commit to GitHub

**You now have:** Your API key (safe location)

---

## ✅ Step 2: Prepare Your GitHub Repo (5 min)

### If you DON'T have a GitHub account:
- [ ] Go to https://github.com/signup
- [ ] Create account
- [ ] Verify email

### If you DO have GitHub:
- [ ] Go to https://github.com/new
- [ ] Create new repository
  - Name: `thebeat`
  - Description: "AI intelligence dashboard for event production"
  - **Make it PUBLIC** (free tier requirement)
  - Skip "Initialize with README"
- [ ] Click "Create repository"

### Push your code to GitHub:

**On your computer:**

```bash
# Go to your project folder
cd /path/to/your/project

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: TheBeat with OpenAI integration"

# Add GitHub remote (replace YOUR-USERNAME and REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/thebeat.git

# Create main branch and push
git branch -M main
git push -u origin main
```

**Verify:** Go to your GitHub repo URL. You should see your code there.

**You now have:** Code on GitHub

---

## ✅ Step 3: Set Up Netlify (10 min)

### Create Netlify Account:
- [ ] Go to https://netlify.com
- [ ] Click "Sign up"
- [ ] Choose "GitHub" as provider
- [ ] Authorize Netlify to access your repos
- [ ] You'll be logged in

### Connect Your Repo:
- [ ] Click **"New site from Git"** (or "Add new site")
- [ ] Select **GitHub** as provider
- [ ] Search for your repo name: `thebeat`
- [ ] Click to select it

### Configure Build Settings:
You should see these (they're auto-detected):
- **Owner:** Your name ✓
- **Branch to deploy:** `main` ✓
- **Build command:** `npm run build` ✓
- **Publish directory:** `dist` ✓

These are correct. Don't change them.

### Add Environment Variable (CRITICAL):
- [ ] Look for **"Show advanced"** or **"Environment"** section
- [ ] Click **"Add environment variable"**
- [ ] Fill in:
  - **Key:** `VITE_OPENAI_API_KEY`
  - **Value:** Paste your API key from Step 1 (sk-xxxxx...)
- [ ] Click "Save" or "Add"

### Deploy:
- [ ] Click **"Deploy site"**
- [ ] Wait for build to complete (2-3 minutes)
- [ ] When it says "Site is live", click the URL

**You now have:** A live site at `https://your-site.netlify.app`

---

## ✅ Step 4: Test It Works

- [ ] Open your Netlify URL in browser
- [ ] Try clicking "Radar" → "Scan" button
- [ ] Wait for it to generate events
- [ ] Try typing in other sections

If it works → **You're done!** 🎉

If something fails:
- [ ] Check Netlify "Deployments" → "Deploy log"
- [ ] Look for red error messages
- [ ] Most common: Missing API key → Add it in Netlify settings

---

## ✅ Step 5: Next Time You Make Changes

```bash
# Make changes to files
# Then commit and push:

git add .
git commit -m "Description of your changes"
git push origin main
```

Netlify automatically redeploys when you push. No other steps needed.

---

## Reference: Your Live URLs

Once deployed:
- **Live Site:** `https://your-site-name.netlify.app`
- **Netlify Dashboard:** https://app.netlify.com
- **Your Repo:** `https://github.com/your-username/thebeat`

---

## Troubleshooting

### "Build failed"
- Go to Netlify → Deployments → Click failed build
- Read the error in the Deploy log
- Most likely: Missing files or dependency issue
- **Fix:** Make sure all updated files are in your repo

### "API not working"
- Check Netlify → Site settings → Environment
- Confirm `VITE_OPENAI_API_KEY` is set with your actual key (sk-...)
- Redeploy site (Netlify → Deployments → "Trigger deploy")

### "Blank page or 404"
- Clear browser cache (Cmd+Shift+Del or Ctrl+Shift+Del)
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check Netlify → Deployments → Confirm "Published" status

---

## Files You Need

Make sure these files are in your GitHub repo:

✅ Required (updated for production):
- `geminiService.ts` (v2.0)
- `vite.config.ts` (v2.0)
- `netlify.toml` (v1.0)
- `.gitignore`
- `.env.example`

✅ Original (unchanged):
- `App.tsx`
- `Dashboard.tsx`
- `Headhunter.tsx`
- `SeoVulture.tsx`
- `SocialListener.tsx`
- `PostShowOps.tsx`
- `Navbar.tsx`
- All other component files
- `types.ts`
- `storageService.ts`
- `package.json`
- `index.html`
- `index.tsx`

---

## You're Done When:

✅ Repo is on GitHub  
✅ Netlify site is deployed  
✅ Live URL works  
✅ API calls generate data  
✅ Changes auto-deploy when you push

**Total time: 30 minutes**

---

## What Happens Now

- Your app runs on Netlify (free)
- Each user gets their own browser storage
- OpenAI API calls cost ~$0.003 each
- No monthly hosting fees
- Auto-deploys when you push to GitHub

---

Need help? Check:
- DEPLOYMENT.md (detailed guide)
- README.md (overview)
- Netlify docs: https://docs.netlify.com
