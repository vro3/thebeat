# TheBeat - Production Ready

AI-powered intelligence dashboard for VR Creative Group. Orchestrates sales intelligence, SEO strategy, venue research, and competitive analysis.

**Status:** ✅ Ready for Netlify deployment  
**Live URL:** (see DEPLOYMENT.md for setup)

---

## What's Included

- **Headhunter (Sales)**: Event radar + agency discovery
- **SEO Vulture**: Keyword strategy + content studio + rank tracking
- **Social Listener**: Brand monitoring + competitor watch
- **Post-Show Ops**: Event analysis + proposal generator
- **Master Data Sheet**: Unified intelligence database

All powered by OpenAI API (GPT-4o).

---

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local`:**
   ```
   VITE_OPENAI_API_KEY=sk-your-api-key-here
   ```

3. **Run dev server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

### Deploy to Netlify

Follow **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step instructions.

---

## Updated Files

These files have been updated for OpenAI integration and production deployment:

- ✅ `geminiService.ts` - Now uses OpenAI API (v2.0)
- ✅ `vite.config.ts` - Proper env var handling (v2.0)
- ✅ `netlify.toml` - Build configuration (v1.0)
- ✅ `.env.example` - Template for environment variables
- ✅ `.gitignore` - Protects your API key
- ✅ `DEPLOYMENT.md` - Full deployment guide

All other files remain unchanged and compatible.

---

## API Key Security

Your OpenAI API key is:
- ✓ Never committed to GitHub (see `.gitignore`)
- ✓ Only stored securely in Netlify environment
- ✓ Never exposed in browser code
- ✓ Safe for production use

See DEPLOYMENT.md → "Security" for details.

---

## Data Architecture

- **Frontend:** React + Vite (runs in browser)
- **Data Storage:** Browser localStorage (per device)
- **API:** OpenAI GPT-4o (for content generation)
- **Deployment:** Netlify (free tier + custom domain optional)

No backend database—all data stays in your browser. To add persistent storage, follow Netlify's Firebase or Supabase guide.

---

## Features

### Sales Intelligence
- Event radar with auto-scoring (Fortune 500 detection)
- Agency discovery and outreach drafting
- Lead CRM with AI pitch generation
- Partner tracking and ROI calculation

### Content Strategy
- SEO keyword clustering
- AI outline generation
- Full content drafting (Educational, Case Study, etc.)
- Rank tracking
- Backlink prospecting + pitch generation

### Market Intelligence
- Social media mention monitoring
- Competitor analysis and tracking
- Sentiment detection

### Operations
- Post-show analysis (venue + client insights)
- Proposal outline generator
- Standard operating procedures

---

## Performance & Costs

**OpenAI API Costs:**
- ~$0.003 per request (GPT-4o)
- ~$0.30 per 100 requests
- Monitor at: https://platform.openai.com/usage

**Netlify Hosting:**
- Free tier: 100GB/month bandwidth
- Builds: Unlimited with GitHub integration
- Custom domain: $12.99/month (optional)

---

## Stack

- **React 18** with TypeScript
- **Vite** (fast build tool)
- **Tailwind CSS** (styling)
- **Recharts** (data visualization)
- **Lucide Icons** (UI icons)
- **OpenAI GPT-4o** (AI backbone)
- **Netlify** (hosting)

---

## File Structure

```
src/
├── components/
│   ├── App.tsx              Main app
│   ├── Dashboard.tsx        Overview
│   ├── Headhunter.tsx       Sales intel
│   ├── SeoVulture.tsx       Content strategy
│   ├── SocialListener.tsx   Market watch
│   ├── PostShowOps.tsx      Operations
│   ├── GoogleSheetView.tsx  Data lake
│   └── Navbar.tsx
├── services/
│   ├── geminiService.ts     ✅ UPDATED: OpenAI API calls
│   └── storageService.ts    localStorage management
├── utils/
│   ├── csv.ts              CSV export
│   └── companyData.ts      Fortune 500 list
├── types.ts                Shared types
└── index.tsx               Entry point
```

---

## Known Limitations

- No persistent backend (data resets per browser/device)
- No user authentication (public tool)
- No file uploads (just text input)
- localStorage ~5-10MB limit per site

### To Add Later:
- User accounts + authentication
- Persistent database (Firebase, Supabase, MongoDB)
- Real Gmail/LinkedIn integration
- File storage (images, PDFs, etc.)

---

## Deployment Checklist

- [ ] OpenAI API key ready (https://platform.openai.com/api-keys)
- [ ] GitHub account with repo created
- [ ] Netlify account connected to GitHub
- [ ] Environment variable `VITE_OPENAI_API_KEY` set in Netlify
- [ ] Build completes without errors
- [ ] Live URL is accessible

See **DEPLOYMENT.md** for detailed steps.

---

## Support & Documentation

- **Netlify Docs:** https://docs.netlify.com
- **OpenAI API:** https://platform.openai.com/docs
- **Vite Guide:** https://vitejs.dev/guide/
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## License

Private project for TheBeat.

---

**Ready to go live?** Follow [DEPLOYMENT.md](./DEPLOYMENT.md) 🚀
