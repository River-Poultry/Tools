# Backend Hosting Guide - River Poultry Tools

## Overview
The River Poultry Tools backend is a Django application that needs to be hosted separately from the Vercel frontend. This guide covers the best hosting options for the Django backend.

## Backend Location
- **Path**: `/Users/RICHOBUKU/river-poultry-tools-backend/river-poultry-backend`
- **Type**: Django application with PostgreSQL database
- **Features**: Email service, authentication, API endpoints

## Recommended Hosting Options

### 1. Railway (Recommended)
**Best for**: Easy deployment, automatic scaling, good free tier

#### Setup:
```bash
cd "/Users/RICHOBUKU/river-poultry-tools-backend/river-poultry-backend"

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Environment Variables:
- `SECRET_KEY` - Django secret key
- `EMAIL_HOST_USER` - Zoho Mail username
- `EMAIL_HOST_PASSWORD` - Zoho Mail password
- `DEFAULT_FROM_EMAIL` - From email address
- `CORS_ALLOWED_ORIGINS` - Frontend URL

### 2. Render
**Best for**: Free tier, easy setup, good documentation

#### Setup:
1. Connect GitHub repository
2. Create new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python manage.py runserver 0.0.0.0:$PORT`

#### Environment Variables:
Same as Railway above.

### 3. DigitalOcean App Platform
**Best for**: Reliable hosting, good performance, reasonable pricing

#### Setup:
1. Create new app
2. Connect GitHub repository
3. Configure build and run commands
4. Set environment variables

### 4. Heroku (Alternative)
**Best for**: Mature platform, extensive documentation

#### Setup:
```bash
# Install Heroku CLI
# Create Procfile
echo "web: python manage.py runserver 0.0.0.0:\$PORT" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

## Environment Variables Required

### Required Variables:
```bash
SECRET_KEY=your-django-secret-key
EMAIL_HOST_USER=hello@riverpoultry.com
EMAIL_HOST_PASSWORD=your-zoho-app-password
DEFAULT_FROM_EMAIL=hello@riverpoultry.com
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

### Optional Variables:
```bash
DEBUG=False
ALLOWED_HOSTS=your-backend-domain.com
DB_NAME=river_poultry
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432
```

## Database Setup

### For Production:
Most hosting platforms provide PostgreSQL databases:
- **Railway**: Automatic PostgreSQL addon
- **Render**: PostgreSQL addon available
- **DigitalOcean**: Managed PostgreSQL database

### Database Migration:
```bash
python manage.py migrate
python manage.py collectstatic
```

## Email Configuration

The backend uses Zoho Mail for sending emails:

### Zoho Mail Settings:
- **SMTP Host**: `smtp.zoho.com`
- **Port**: `587`
- **Security**: `STARTTLS`
- **Username**: `hello@riverpoultry.com`
- **Password**: Your Zoho app password

### Test Email Sending:
```bash
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'hello@riverpoultry.com', ['test@example.com'])
```

## API Endpoints

The backend provides these endpoints:

### Authentication:
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/password-reset/` - Password reset
- `POST /api/auth/password-reset-confirm/` - Password reset confirm

### Other Endpoints:
- `GET /api/operations/` - Operations data
- `GET /api/vaccinations/` - Vaccination data
- `GET /api/notifications/` - Notification management
- `GET /api/analytics/` - Analytics data
- `GET /api/inventory/` - Inventory data

## Frontend Integration

After deploying the backend:

1. **Get the backend URL** from your hosting platform
2. **Update frontend environment variable**:
   ```bash
   vercel env add REACT_APP_API_URL
   # Enter: https://your-backend-domain.com/api
   ```
3. **Test the connection** by visiting the frontend

## Troubleshooting

### Common Issues:

#### 1. CORS Errors
**Error**: `Access to fetch at 'backend-url' from origin 'frontend-url' has been blocked by CORS policy`

**Solution**: Add frontend URL to `CORS_ALLOWED_ORIGINS`:
```bash
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

#### 2. Database Connection Errors
**Error**: `django.db.utils.OperationalError: could not connect to server`

**Solution**: 
- Check database credentials
- Ensure database is running
- Verify connection string

#### 3. Email Sending Failures
**Error**: `SMTPAuthenticationError: (535, '5.7.8 Authentication failed')`

**Solution**:
- Verify Zoho Mail credentials
- Check if app password is used (not regular password)
- Test SMTP connection

#### 4. Static Files Not Loading
**Error**: `404 Not Found` for static files

**Solution**:
```bash
python manage.py collectstatic
```

## Monitoring and Maintenance

### Health Checks:
- Monitor API endpoints: `GET /api/health`
- Check database connectivity
- Monitor email sending
- Track error logs

### Performance Monitoring:
- Monitor response times
- Track memory usage
- Monitor database performance
- Check error rates

## Cost Comparison

### Free Tiers:
- **Railway**: $5/month after free tier
- **Render**: Free tier available
- **DigitalOcean**: $5/month minimum
- **Heroku**: No free tier (paid only)

### Recommended:
- **Railway** for easy deployment
- **Render** for free tier
- **DigitalOcean** for production

## Next Steps

1. **Choose hosting platform** based on your needs
2. **Deploy backend** using chosen platform
3. **Configure environment variables**
4. **Test API endpoints**
5. **Update frontend** with backend URL
6. **Test email functionality**
7. **Monitor performance**
