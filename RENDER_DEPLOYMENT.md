# Render Deployment Guide for Portfolio Manager

This guide will help you deploy your Django Portfolio Manager application to Render.

## Prerequisites

1. A GitHub account with your code pushed to a repository
2. A Render account (free tier available)

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub with the following structure:
```
portfolio-manager/
├── backend/
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── portfolio/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
└── render.yaml
```

## Step 2: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file and create the services

### Option B: Manual Deployment

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `portfolio-manager-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python manage.py migrate && gunicorn backend.wsgi:application`
   - **Plan**: Free

5. Add Environment Variables:
   - `DEBUG`: `False`
   - `SECRET_KEY`: Generate a new secret key
   - `ALLOWED_HOSTS`: `.onrender.com`

## Step 3: Set Up PostgreSQL Database

1. In Render Dashboard, click "New" → "PostgreSQL"
2. Configure:
   - **Name**: `portfolio-manager-db`
   - **Database**: `portfolio_manager`
   - **User**: `portfolio_manager_user`
   - **Plan**: Free

3. Copy the connection string and add it as an environment variable:
   - `DATABASE_URL`: `postgresql://user:password@host:port/database`

## Step 4: Deploy Frontend (Optional)

If you want to deploy the React frontend separately:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `portfolio-manager-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Environment Variable**: `REACT_APP_API_URL` = your backend URL

## Step 5: Configure Environment Variables

In your backend service, add these environment variables:

### Required Variables:
- `DEBUG`: `False`
- `SECRET_KEY`: Your Django secret key
- `DATABASE_URL`: PostgreSQL connection string
- `ALLOWED_HOSTS`: `.onrender.com`

### Optional Variables:
- `EMAIL_HOST`: Your SMTP server
- `EMAIL_PORT`: SMTP port (usually 587)
- `EMAIL_HOST_USER`: Your email
- `EMAIL_HOST_PASSWORD`: Your email password
- `EMAIL_USE_TLS`: `True`

## Step 6: Update Frontend Configuration

Update your frontend's `src/config.js` to use the production API URL:

```javascript
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
};

export default config;
```

## Step 7: Test Your Deployment

1. Visit your backend URL: `https://your-app-name.onrender.com`
2. Test the API endpoints
3. Check the admin interface
4. Verify database connections

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check the build logs in Render
   - Ensure all dependencies are in `requirements.txt`
   - Verify Python version compatibility

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correctly set
   - Check if the database service is running
   - Ensure migrations are applied

3. **Static Files Not Loading**:
   - Run `python manage.py collectstatic` in build command
   - Check `STATIC_ROOT` and `STATIC_URL` settings

4. **CORS Issues**:
   - Update `CORS_ALLOWED_ORIGINS` in settings
   - Add your frontend domain to allowed origins

### Useful Commands:

```bash
# Check build logs
# View in Render dashboard

# Test locally with production settings
python manage.py runserver --settings=backend.production

# Collect static files
python manage.py collectstatic --noinput
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DEBUG` | Enable debug mode | `False` |
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `ALLOWED_HOSTS` | Allowed domains | `.onrender.com` |
| `EMAIL_HOST` | SMTP server | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_HOST_USER` | Email username | `your-email@gmail.com` |
| `EMAIL_HOST_PASSWORD` | Email password | `your-app-password` |

## Security Considerations

1. **Never commit sensitive data** like secret keys or database passwords
2. **Use environment variables** for all configuration
3. **Enable HTTPS** (automatic on Render)
4. **Set DEBUG=False** in production
5. **Use strong secret keys**
6. **Regularly update dependencies**

## Monitoring and Maintenance

1. **Set up logging** to monitor application health
2. **Configure alerts** for service downtime
3. **Regular backups** of your database
4. **Monitor resource usage** on the free tier
5. **Update dependencies** regularly

## Cost Optimization

- **Free tier limits**: 750 hours/month for web services
- **Database**: 1GB storage on free tier
- **Static sites**: Unlimited on free tier
- **Consider upgrading** if you exceed limits

## Support

- [Render Documentation](https://render.com/docs)
- [Django Deployment Guide](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [Render Community](https://community.render.com/) 