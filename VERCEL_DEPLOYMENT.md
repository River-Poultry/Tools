# Vercel Deployment Guide for River Poultry Tools

This guide will help you deploy your React frontend to Vercel with all necessary fixes.

## Prerequisites

1. A GitHub account with your code pushed to a repository
2. A Vercel account (free tier available)
3. Your backend API deployed separately (e.g., on Render, Railway, or Heroku)

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub with the following structure:
```
River-Poultry/Tools/
├── package.json
├── vercel.json
├── .vercelignore
├── public/
└── src/
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project root:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - What's your project's name? `river-poultry-tools`
   - In which directory is your code located? `./`

### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

## Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### Required Variables:
- `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-backend.onrender.com`)

### Optional Variables:
- `REACT_APP_ENVIRONMENT`: `production`

## Step 4: Deployment Fixes Applied

The following fixes have been applied to resolve common Vercel deployment issues:

### 1. Vercel Configuration (`vercel.json`)
- Proper build configuration for Create React App
- SPA routing support for React Router
- Environment variable configuration
- Build command optimization

### 2. Package.json Updates
- Added `vercel-build` script
- Specified Node.js and npm engine requirements
- Optimized for Vercel's build process

### 3. Vercel Ignore File (`.vercelignore`)
- Excludes unnecessary files from deployment
- Reduces build time and deployment size
- Prevents backend files from being deployed

### 4. Build Optimization
- Proper static file serving
- React Router compatibility
- Environment variable handling

## Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. Test all navigation routes
3. Verify API calls to your backend
4. Check that all tools work correctly

## Troubleshooting

### Common Issues Fixed:

1. **404 Errors on Refresh**:
   - Fixed with proper SPA routing in `vercel.json`
   - All routes now redirect to `index.html`

2. **Build Failures - "react-scripts: command not found"**:
   - Fixed with `npx react-scripts build` in build command
   - Added proper `npm ci` install command
   - Created `.npmrc` for proper npm configuration
   - Specified Node.js version requirements
   - Optimized dependencies with package-lock.json

3. **Environment Variables**:
   - Proper configuration in `vercel.json`
   - Clear documentation for required variables

4. **Static File Serving**:
   - Proper build output directory configuration
   - Optimized file serving

5. **Dependency Installation Issues**:
   - Added `.npmrc` configuration file
   - Used `npm ci` for reliable, reproducible builds
   - Ensured package-lock.json is properly used

### Useful Commands:

```bash
# Test build locally
npm run build

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://your-backend.onrender.com` |
| `REACT_APP_ENVIRONMENT` | Environment | `production` |

## Security Considerations

1. **API URLs**: Use HTTPS URLs for your backend API
2. **CORS**: Configure your backend to allow requests from your Vercel domain
3. **Environment Variables**: Never commit sensitive data to your repository
4. **HTTPS**: Vercel automatically provides HTTPS for all deployments

## Performance Optimizations

1. **Build Optimization**: Vercel automatically optimizes your React build
2. **CDN**: Vercel uses a global CDN for fast content delivery
3. **Caching**: Static assets are automatically cached
4. **Image Optimization**: Consider using Vercel's image optimization features

## Monitoring and Maintenance

1. **Analytics**: Enable Vercel Analytics to monitor performance
2. **Logs**: Check function logs in the Vercel dashboard
3. **Updates**: Vercel automatically redeploys on git push
4. **Custom Domain**: Add a custom domain in project settings

## Cost Optimization

- **Free Tier**: Includes 100GB bandwidth and unlimited deployments
- **Pro Tier**: $20/month for additional features and higher limits
- **Team Tier**: $20/user/month for team collaboration

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
