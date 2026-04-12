# RNT Mobile PWA - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Cloudflare account (free tier works)
- Git (for Git-based deployment)

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit http://localhost:5173/

## Build for Production

```bash
npm run build
```

Output is in the `build/` directory.

---

## Deploy to Cloudflare Pages

### Option 1: Git Integration (Recommended)

This is the best approach for automatic deployments.

**1. Push to GitHub/GitLab**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/rnt-mobile.git
git push -u origin main
```

**2. Connect to Cloudflare Pages**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** → **Create application**
3. Click **Create Pages application**
4. Select **Connect to Git**
5. Authorize Cloudflare to access your GitHub/GitLab
6. Select your repository
7. Configure build settings:
   - **Framework preset**: SvelteKit
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `./` (or `/`)

**3. Environment Variables (Optional)**

If you add environment variables later, go to Settings → Environment Variables.

**4. Deploy**

Click **Save and Deploy**. Your site will be live at `https://rnt-mobile.pages.dev/`

---

### Option 2: Wrangler CLI

**1. Install Wrangler**

```bash
npm install -g wrangler
```

**2. Login to Cloudflare**

```bash
wrangler login
```

**3. Deploy**

```bash
# Build first
npm run build

# Deploy
wrangler pages deploy build

# Or create a project first
wrangler pages project create rnt-mobile
wrangler pages deploy build
```

---

### Option 3: Direct Upload

1. Build the project: `npm run build`
2. Go to https://pages.cloudflare.com/
3. Create a new project
4. Select "Direct upload"
5. Drag the `build/` folder into the upload area

---

## Custom Domain Setup

### Using a Subdomain (e.g., events.rhein-neckar-tango.de)

1. In Cloudflare Dashboard, go to your **Pages** project
2. Click **Custom domains**
3. Enter your subdomain (e.g., `events.rhein-neckar-tango.de`)
4. Click **Verify DNS record**
5. Cloudflare will automatically add the necessary DNS record

**Note:** Your domain must be registered with Cloudflare for automatic DNS setup.

### Using Cloudflare Registrar (Recommended)

If your domain is registered elsewhere, transfer it to Cloudflare Registrar for:
- Free WHOIS privacy
- Free Cloudflare proxy
- Unified dashboard

---

## Configuration for Cloudflare Pages

### svelte.config.js

The project already uses `@sveltejs/adapter-static` which works perfectly with Cloudflare Pages.

### wrangler.toml (Optional)

Create `wrangler.toml` in the root for custom configuration:

```toml
name = "rnt-mobile"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./build"
```

---

## CI/CD Pipeline

### GitHub Actions (Automatic Deploys)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: rnt-mobile
          directory: build
```

### Required Secrets

In your GitHub repository, add these secrets:

1. **CLOUDFLARE_API_TOKEN**: 
   - Go to Cloudflare Dashboard → Profile → API Tokens
   - Click **Create Token** → **Edit Cloudflare Workers** template
   - Or create a custom token with **Account** permissions: `Cloudflare Pages: Edit`

2. **CLOUDFLARE_ACCOUNT_ID**:
   - Found in Cloudflare Dashboard URL: `https://dash.cloudflare.com/ACCOUNT_ID/pages`
   - Or in the Overview tab of any Workers & Pages project

---

## Troubleshooting

### Build Fails

- Check Node version: `node --version` (needs 18+)
- Clear cache: `rm -rf node_modules && npm install`
- Check build output: `npm run build`

### 404 on Subpages

This shouldn't happen with the static adapter, but if it does:
1. Go to Pages project settings
2. Enable "Serve static assets"
3. Check build directory path is correct

### Map Not Loading

The Leaflet map requires HTTPS. Cloudflare Pages provides free SSL automatically.

---

## PWA Features

Users can install the app on their devices:

- **iOS**: Tap Share → "Add to Home Screen"
- **Android**: Chrome will prompt to install, or use menu → "Install app"

---

## Features

- Event list with filtering (Milonga, Practica, Workshop, Kurs)
- Date filtering (Today, 7 days, Month, All)
- Calendar view with event indicators
- Venue map with OpenStreetMap
- Event images from RNT WordPress
- Pull-to-refresh
- Offline-capable (PWA with service worker)
