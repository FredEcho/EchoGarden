# GitHub Pages Deployment Guide

This guide explains how to deploy EchoGarden to GitHub Pages.

## Quick Setup

1. **Enable GitHub Pages in your repository:**
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "GitHub Actions" as the source

2. **The deployment will happen automatically:**
   - When you push to the `main` branch, GitHub Actions will build and deploy your site
   - Your site will be available at: `https://yourusername.github.io/EchoGarden/`

## What's Included

### Static Demo Version
- **Landing Page**: Beautiful marketing page with community stats
- **Demo Mode**: Interactive demo showing how the app works
- **Sample Data**: Pre-populated with example help requests and categories
- **Responsive Design**: Works on all devices

### Features Available in Demo
- ✅ Community statistics display
- ✅ Category browsing
- ✅ Sample help requests
- ✅ Garden visualization
- ✅ Responsive design
- ✅ Cookie consent system

### Features Requiring Backend
- ❌ User authentication
- ❌ Creating help requests
- ❌ Responding to requests
- ❌ Real-time updates
- ❌ User profiles

## File Structure for Deployment

```
.github/workflows/deploy.yml    # GitHub Actions workflow
client/public/404.html          # SPA redirect for GitHub Pages
_redirects                      # Netlify-style redirects (if needed)
```

## Custom Domain

To use a custom domain like `echogarden.app`:

1. Update the `cname` in `.github/workflows/deploy.yml`
2. Add a `CNAME` file to your repository root with your domain
3. Configure DNS to point to GitHub Pages

## Local Development vs Production

- **Local**: Full app with backend server
- **GitHub Pages**: Static demo version with sample data
- **Production**: Can be deployed to any static hosting service

## Troubleshooting

### Site Shows README Instead of App
- Make sure GitHub Actions workflow is enabled
- Check that the workflow completed successfully
- Verify the build output is in the correct directory

### 404 Errors on Page Refresh
- The `404.html` file handles SPA routing
- Make sure it's in the `client/public/` directory

### Assets Not Loading
- Check the `base` path in `vite.config.ts`
- Ensure all assets are in the correct build directory

## Manual Deployment

If you need to deploy manually:

```bash
npm run build:client
# Copy dist/public/* to your hosting service
```

## Support

For issues with deployment, check:
1. GitHub Actions logs
2. Browser console for errors
3. Network tab for failed requests
