# CBTV Deployment Guide (GoDaddy Domain)

This guide explains how to move your website from the preview environment to your GoDaddy domain (**chazzyboo.com**).

## 1. Prerequisites
- A GitHub account.
- A Railway.app account (Recommended for Full-Stack Node.js apps).
- Access to your GoDaddy DNS settings.

## 2. Prepare the Code
1. Download the project files.
2. Create a new repository on GitHub (e.g., `chazzyboo-cbtv`).
3. Push your code to this repository.

## 3. Deploy to Railway.app
1. Log in to [Railway.app](https://railway.app).
2. Click **+ New Project** > **Deploy from GitHub repo**.
3. Select your repository.
4. Railway will automatically detect the settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Go to the **Variables** tab and add your secrets:
   - `GEMINI_API_KEY`: (Your key)
   - `VITE_WP_API_URL`: (Your WordPress URL)
   - `YOUTUBE_API_KEY`: (Optional)
   - `INSTAGRAM_ACCESS_TOKEN`: (Optional)

## 4. Connect GoDaddy Domain
1. In Railway, go to **Settings** > **Domains**.
2. Click **Custom Domain** and enter `chazzyboo.com`.
3. Railway will provide two records. Copy them.
4. Log in to **GoDaddy** > **DNS Management**.
5. Update your records:
   - **A Record (@)**: Change `WebsiteBuilder Site` to the IP Address from Railway.
   - **CNAME (www)**: Change `chazzyboo.com` to the Alias URL from Railway.

## 5. Final Verification
- Wait 1-24 hours for DNS propagation.
- Visit `https://chazzyboo.com` to see your live broadcast.

---
*Signal established. Broadcast initiated.*
