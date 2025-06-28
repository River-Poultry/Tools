# Railway Deployment Guide

## Quick Deploy to Railway

### Step 1: Prepare Your Repository
Your repository is already prepared with the necessary configuration files:
- `railway.json` - Railway configuration
- `Procfile` - Process definition
- `runtime.txt` - Python version specification
- Updated `settings.py` - Production-ready settings

### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
   - Sign up with your GitHub account
   - Click "New Project"

2. **Connect Your Repository**
   - Select "Deploy from GitHub repo"
   - Choose your `portfolio-manager` repository
   - Click "Deploy Now"

3. **Add PostgreSQL Database**
   - In your project dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable

4. **Configure Environment Variables**
   - Go to your project's "Variables" tab
   - Add the following variables:

```bash
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=your-app-name.railway.app
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=PRUDEV II <noreply@prudev.org>
```

5. **Deploy**
   - Railway will automatically deploy your application
   - You can monitor the deployment in the "Deployments" tab

### Step 3: Access Your Application

- Your app will be available at: `https://your-app-name.railway.app`
- The deployment typically takes 2-5 minutes

### Step 4: Create Superuser

1. Go to your Railway project dashboard
2. Click on your web service
3. Go to "Settings" → "Custom Domains"
4. Add your custom domain if desired

## Alternative: Render Deployment

If you prefer Render, follow these steps:

1. **Go to [Render.com](https://render.com)**
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && python manage.py migrate && python manage.py collectstatic --noinput && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT`
   - **Environment:** Python 3

5. **Add PostgreSQL Database**
   - Create a new PostgreSQL service
   - Link it to your web service

## Environment Variables for Production

Set these in your hosting platform:

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database (Railway/Render will set this automatically)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Email Settings
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=PRUDEV II <noreply@prudev.org>

# CORS Settings
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## Post-Deployment Checklist

- [ ] Application is accessible at your domain
- [ ] Database migrations are applied
- [ ] Static files are served correctly
- [ ] Email functionality works
- [ ] File uploads work
- [ ] Create a superuser account
- [ ] Test all major functionality

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check the build logs in Railway/Render
   - Ensure all dependencies are in `requirements.txt`

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is set correctly
   - Check if PostgreSQL service is running

3. **Static Files Not Loading**
   - Ensure `collectstatic` command runs
   - Check `STATIC_ROOT` and `STATIC_URL` settings

4. **CORS Errors**
   - Update `CORS_ALLOWED_ORIGINS` with your frontend domain
   - Ensure CORS middleware is enabled

## Cost Estimation

### Railway:
- **Free Tier:** $0/month (limited resources)
- **Production:** $5-20/month

### Render:
- **Free Tier:** $0/month (with limitations)
- **Production:** $7-25/month

## Next Steps

1. **Set up a custom domain** (optional)
2. **Configure SSL certificates** (automatic on Railway/Render)
3. **Set up monitoring and logging**
4. **Configure backups for your database**
5. **Set up CI/CD for automatic deployments**

Your application is now production-ready! 🚀 