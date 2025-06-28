# Portfolio Manager - Deployment Guide

## Overview
This guide explains how to deploy the Portfolio Manager application in production.

## Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL (for production)
- SMTP server (for email functionality)

## Backend Deployment

### 1. Environment Setup
Copy the example environment file and configure it:
```bash
cd backend
cp env.example .env
```

Edit `.env` with your production values:
```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-secure-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database Settings
DB_NAME=portfolio_manager
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=PRUDEV II <noreply@prudev.org>
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 4. Static Files
```bash
python manage.py collectstatic
```

### 5. Run with Production Settings
```bash
python manage.py runserver --settings=backend.production
```

## Frontend Deployment

### 1. Environment Setup
Create a `.env` file in the frontend directory:
```bash
cd frontend
echo "REACT_APP_API_URL=http://yourdomain.com" > .env
```

### 2. Build for Production
```bash
npm run build
```

### 3. Serve Static Files
The built files will be in `frontend/build/` and can be served by any web server.

## Security Considerations

### 1. File Upload Security
- File size limit: 10MB
- Allowed file types: .xlsx, .xls
- Content validation using python-magic

### 2. CORS Configuration
- Only allows specific origins
- Configured for React development and production

### 3. Email Security
- Use app passwords for Gmail
- Configure proper SMTP settings
- Email timeout and error handling

## Performance Optimizations

### 1. Database
- Batch processing for large Excel uploads (100 records per batch)
- Use PostgreSQL for production
- Configure database connection pooling

### 2. File Uploads
- Bulk create operations for better performance
- Error handling and rollback on failures

## Monitoring and Logging

### 1. Application Logs
- Logs stored in `backend/logs/django.log`
- Configure log rotation in production

### 2. Error Tracking
- Email failures are logged but don't break the application
- File upload errors are tracked and reported

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS_ALLOWED_ORIGINS includes your frontend domain
2. **Email Failures**: Check SMTP settings and app passwords
3. **File Upload Errors**: Verify file size and type restrictions
4. **Database Connection**: Ensure PostgreSQL is running and accessible

### Debug Mode
For debugging, set `DEBUG=True` in your environment variables.

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrated and superuser created
- [ ] Static files collected
- [ ] Email settings configured
- [ ] CORS settings updated for production domain
- [ ] File upload limits configured
- [ ] Logging configured
- [ ] Security headers enabled
- [ ] Frontend built and deployed
- [ ] SSL certificate installed (recommended) 