# Content Editor (CMS) Setup

The site now uses **[Eleventy](https://www.11ty.dev/)** (a build step) plus **[Sveltia CMS](https://sveltiacms.app/)** so non-technical editors can change the site's text without touching code.

- Editable text lives in `src/_data/site.json`.
- The page (`src/index.njk`) is built from that data into static HTML in `_site/`.
- Editors manage the text at **`/admin`**, logging in with GitHub. Their edits are committed to this repo, and Vercel rebuilds and redeploys automatically.

Every edit is a normal git commit, so nothing is ever lost — anything can be undone.

---

## Part 1 — One-time developer setup (TJ)

These steps are done once in the GitHub and Vercel dashboards. No secrets live in the code.

### 1. Create a GitHub OAuth App
1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
   (or visit https://github.com/settings/developers)
2. Fill in:
   - **Application name:** `Shire's Market CMS` (any name)
   - **Homepage URL:** `https://shiresfarmersmarket.com`
   - **Authorization callback URL:** `https://shiresfarmersmarket.com/callback`
     ⚠️ This must be exact. It must match your production domain + `/callback`.
3. Click **Register application**.
4. Copy the **Client ID**, then click **Generate a new client secret** and copy the secret.

### 2. Add the secrets to Vercel
1. Vercel → your project → **Settings → Environment Variables**
2. Add (Production, and Preview if you like):
   - `GITHUB_CLIENT_ID` = your client ID
   - `GITHUB_CLIENT_SECRET` = your client secret
   - *(optional)* `OAUTH_SCOPE` = `repo,user` (default). If this repo is **public**, you can use `public_repo,user` for tighter permissions.
3. **Redeploy** so the functions pick up the variables.

### 3. Give each editor access
1. Each editor creates a free GitHub account at https://github.com/signup
2. This repo → **Settings → Collaborators** → add each editor with **Write** access.
3. They accept the email invitation.

### 4. Deploy
Commit and push these changes. Vercel runs the Eleventy build and deploys. The editor is then live at:

**https://shiresfarmersmarket.com/admin**

> If your production domain is different, update `base_url` in `src/admin/config.yml` and the OAuth App callback URL to match.

---

## Part 2 — How to edit the site (for the market team)

1. Go to **https://shiresfarmersmarket.com/admin**
2. Click **Login with GitHub** and approve access (first time only).
3. Click **Website Content → Home Page**.
4. Edit any of the labeled fields:
   - **Season Banner** — the green banner near the top
   - **Top of Page (Hero)** — headline, schedule, location, button
   - **About Section** — paragraphs and the features list
   - **For Vendors** — the three benefit cards
   - **Sign-Up Section** — intro text and booth options
   - **Market Dates** — the Saturdays vendors can pick on the form
   - **Contact Section** — address, hours, phone, email, links
5. Click **Publish**. Your changes go live on the website in **1–2 minutes** — refresh the page to see them.

**Updating market dates:** open **Market Dates**, then add, remove, or edit rows.
Each date has two parts — *Form Value* (short, like `6/13`) and *Shown on Form* (friendly, like `June 13`). The sign-up form's date checkboxes are generated from this list automatically.

You can only change text — you can't break the page layout. And since every change is saved in history, anything can be undone.

---

## Local development (TJ)

```bash
npm install      # one time
npm run dev      # local preview with live reload at http://localhost:8080
npm run build    # production build into _site/
```

## How it fits together

- `src/index.njk` — the page template (reads from `site.json`)
- `src/_data/site.json` — all editable text (what the CMS writes to)
- `src/admin/` — the Sveltia CMS app + field config
- `api/auth.js`, `api/callback.js` — GitHub login (OAuth) handled by Vercel functions
- `vercel.json` — build settings + routes `/auth` and `/callback` to the functions
- The vendor form still posts to the existing Make.com webhook; the copyright year still auto-updates via `script.js`.

## Troubleshooting

- **Login popup closes without signing in** — confirm `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` are set in Vercel and that you redeployed; confirm the OAuth App callback URL is exactly `https://shiresfarmersmarket.com/callback`.
- **"Not authorized" / can't save** — the GitHub user must be a repo collaborator with Write access.
- **Changes not showing** — wait 1–2 minutes for Vercel to rebuild, then hard-refresh.

## Security notes

- The GitHub client secret stays in Vercel environment variables — it is never sent to the browser.
- Login uses CSRF protection (a `state` value tied to a short-lived `HttpOnly` cookie).
- Only people you add as repo collaborators can log in or change anything.
