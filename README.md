# Your Doctor SD 🏥

> San Diego's free, community-driven doctor finder.

## What's in this project

- **Home** — Landing page with search, specialties, and provider callout
- **Search** — Filter doctors by specialty, neighborhood, gender, language, and availability
- **Profile** — Individual doctor page with community updates and hours
- **Claim** — 4-step form for providers to claim their free listing

## How to run locally

You'll need [Node.js](https://nodejs.org) installed (version 16 or higher).

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm start
```

The app will open at `http://localhost:3000`.

## How to deploy to Vercel (free)

### Step 1 — Push to GitHub
1. Create a free account at [github.com](https://github.com)
2. Create a new repository called `your-doctor-sd`
3. Upload this entire folder to the repository

### Step 2 — Deploy on Vercel
1. Create a free account at [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your `your-doctor-sd` GitHub repository
4. Leave all settings as default — Vercel detects React automatically
5. Click **Deploy**

Your site will be live at `your-doctor-sd.vercel.app` in about 60 seconds. 🎉

### Step 3 — Custom domain (optional)
Buy `yourdoctorsd.com` (~$12/year) from Namecheap or Google Domains, then connect it in Vercel under **Project Settings → Domains**.

## Next steps after launch

- **Real NPI data** — Once hosted, connect the NPI registry API from a backend (no more CORS issues)
- **Database** — Store claimed listings, community reports, and photos (Supabase is free and beginner-friendly)
- **Email verification** — Send confirmation emails when providers claim listings (Resend.com is free)
- **Google Maps** — Embed real maps on doctor profiles using the Google Maps API

## Tech stack

- React 18
- React Router 6
- Deployed on Vercel (free tier)
- No backend required to start

---

Built with ♥ for San Diego.
