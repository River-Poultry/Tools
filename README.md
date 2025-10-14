# River Poultry Tools

A comprehensive poultry management system with inventory tracking, vaccination scheduling, and notification management.

## Architecture

- **Frontend**: React 19 with TypeScript, Material-UI
- **Backend**: Django 5.2 with Django REST Framework
- **Database**: PostgreSQL (production), SQLite (development)
- **Deployment**: Vercel (frontend), Railway/Heroku (backend)

## Quick Start

### Backend Setup

```bash
cd river-poultry-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env_example.txt .env
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd Tools
npm install
cp env.example .env
npm start
```

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_VAPID_PUBLIC_KEY=your-vapid-key
```

## Features

- **Inventory Management**: Track feed, medications, equipment
- **Vaccination Scheduling**: Automated reminders and tracking
- **User Management**: Role-based access control
- **Push Notifications**: Real-time alerts and reminders
- **Analytics Dashboard**: Performance metrics and insights

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Railway/Heroku)
1. Connect GitHub repository
2. Set environment variables
3. Configure database and Redis
4. Deploy

## Security

- HTTPS enforced in production
- Secure session cookies
- CSRF protection enabled
- Environment-based configuration
- VAPID keys for push notifications

## License

Private - River Poultry Management System
