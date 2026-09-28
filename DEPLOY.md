# Deploying to Vercel (free tier)

## What you need first

### 1. A free MongoDB Atlas database
The site stores products, categories, inquiries and site content in MongoDB.
Your local `mongodb://127.0.0.1:27017` will **not** work once deployed.

1. Go to https://www.mongodb.com/atlas and create a free account
2. Create a **free (M0)** cluster
3. Under **Database Access** create a user (e.g. `agrigrid`) with a password
4. Under **Network Access** click *Allow access from anywhere* → `0.0.0.0/0`
   - Vercel's serverless IPs change constantly, so you must allow all IPs
5. Click **Connect** → *Drivers* → copy the connection string

It looks like:
```
mongodb+srv://agrigrid:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 2. Strong secrets

Generate a long random secret (run this in PowerShell):

```powershell
-join ((48..57 + 65..90 + 97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

Use the result as `ADMIN_SESSION_SECRET`, and pick a strong `ADMIN_PASSWORD`.

### 3. Your Telegram bot values
From your `.env.local`:
- `TELEGRAM_BOT_TOKEN` — the bot token
- `TELEGRAM_CHAT_ID` — the chat id (-1003997352897)

These keep working in production; product images upload to Telegram and are
served from there, so no disk storage is needed on the host.

---

## Deploying

### Option A — Import from GitHub (easiest, auto-updates)

1. Push this folder to a **private** GitHub repository:
   ```powershell
   git remote add origin https://github.com/<your-user>/tejas-polymers.git
   git branch -M main
   git push -u origin main
   ```
2. Go to https://vercel.com → **Add New → Project** → import the repo
   (Vercel detects Next.js automatically)
3. Add these under **Environment Variables**:

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | your Atlas connection string |
   | `ADMIN_PASSWORD` | your strong password |
   | `ADMIN_SESSION_SECRET` | your random secret |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now, set after first deploy |
   | `TELEGRAM_BOT_TOKEN` | your bot token |
   | `TELEGRAM_CHAT_ID` | `-1003997352897` |

4. Click **Deploy**. Your site appears at `https://tejas-polymers.vercel.app`

5. Once live, set `NEXT_PUBLIC_SITE_URL` to that URL and redeploy so SEO
   (sitemap, canonical tags, OG image) uses the real domain.

### Option B — Drag and drop (no GitHub needed)

1. Run `npm run build` in this folder
2. Go to https://vercel.com/new and **upload the project folder**
   (Vercel reads the `.next` output)

---

## After going live

1. **Set the real domain** — Vercel dashboard → *Settings → Domains*, add your
   domain and update the DNS records it shows.

2. **Seed the database** (your local products won't be on Atlas). Either run
   `npm run seed` locally against Atlas, or add products through the admin panel:
   ```powershell
   # temporarily point .env.local at Atlas, then:
   npm run seed
   ```

3. **Submit the sitemap** to Google Search Console:
   `https://yourdomain.com/sitemap.xml`

4. **Claim your Google Business Profile** using the same name, address and
   phone as the site — this drives local map results.

5. **Revoke the bot token** — it was pasted into a chat, so regenerate it via
   @BotFather `/revoke` and update the Vercel env var.

---

## Local production preview

```powershell
npm run build
npm run start
```
