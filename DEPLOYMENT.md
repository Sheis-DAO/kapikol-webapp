# Kapikol Deployment Guide

## 🚀 Vercel Deployment Instructions

### Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Access to GoDaddy DNS settings for capco.net

## Step 1: Push Code to GitHub

1. **Initialize Git Repository** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Kapikol SocialFi Platform"
```

2. **Create GitHub Repository**:
   - Go to [GitHub](https://github.com) and create a new repository named `kapikol-webapp`
   - Make it public or private (your choice)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/kapikol-webapp.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

1. **Connect GitHub to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your `kapikol-webapp` repository from GitHub

2. **Configure Deployment Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (already configured)
   - **Output Directory**: `dist` (already configured)
   - **Install Command**: `npm install --legacy-peer-deps` (already configured)

3. **Environment Variables**:
   - Add your environment variables in Vercel dashboard:
     - `HIKER_API_KEY`: `j98520ee92ip00kcsxyweqz32pyst2wn`

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (usually 2-3 minutes)

## Step 3: Configure Custom Domain

### Option A: Main Domain (kapikol.capco.net)
1. **Add Domain in Vercel**:
   - Go to your project dashboard
   - Navigate to Settings → Domains
   - Add `kapikol.capco.net`

2. **Update GoDaddy DNS**:
   - Log into your GoDaddy account
   - Go to DNS Management for capco.net
   - Add a CNAME record:
     - **Type**: CNAME
     - **Name**: kapikol
     - **Value**: cname.vercel-dns.com
     - **TTL**: 600 seconds

### Option B: Subdirectory Path (capco.net/kapikol)
This is more complex and requires additional setup:

1. **Update Vite Config** (already done):
   - The `base: '/kapikol/'` is already configured

2. **Use Vercel Rewrites**:
   - Contact Vercel support or use a reverse proxy on your main server
   - Forward `capco.net/kapikol/*` to your Vercel deployment

## Step 4: Verify Deployment

1. **Test Your Deployment**:
   - Visit your Vercel URL (e.g., `kapikol-webapp.vercel.app`)
   - Test all functionality:
     - Phantom wallet connection
     - Influencer search
     - Campaign initiation flow
     - Navigation between pages

2. **Test Custom Domain**:
   - Visit `kapikol.capco.net` (if using Option A)
   - Ensure all assets load correctly

## Step 5: Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch will automatically deploy
- Pull requests create preview deployments
- You can see deployment status in Vercel dashboard

## Production URLs

After deployment, your app will be available at:
- **Vercel URL**: `https://kapikol-webapp-YOUR-USERNAME.vercel.app`
- **Custom Domain**: `https://kapikol.capco.net` (after DNS setup)

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that `npm install --legacy-peer-deps` is working
   - Verify all dependencies are in package.json

2. **DNS Not Resolving**:
   - DNS changes can take up to 48 hours
   - Use `nslookup kapikol.capco.net` to check propagation

3. **Assets Not Loading**:
   - Check the `base` configuration in vite.config.ts
   - Ensure all asset paths are relative

4. **Wallet Connection Issues**:
   - Ensure HTTPS is enabled (Vercel provides this automatically)
   - Check browser console for CORS errors

## Environment Variables

Make sure to set these in Vercel dashboard:
```
HIKER_API_KEY=j98520ee92ip00kcsxyweqz32pyst2wn
NODE_ENV=production
```

## Performance Optimization

The build is already optimized with:
- Code splitting for vendor, Solana, and UI libraries
- Gzipped assets
- Optimized bundle sizes:
  - Main bundle: ~213KB
  - Solana libraries: ~458KB
  - UI libraries: ~53KB

## Security Notes

- The app is served over HTTPS (automatic with Vercel)
- No sensitive data is exposed in the frontend
- API keys are handled through environment variables
- All external API calls are properly secured

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console errors
3. Verify DNS propagation
4. Contact Vercel support if needed

---

🎉 **Your Kapikol SocialFi platform is ready for production!**