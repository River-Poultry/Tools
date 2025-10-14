# River Poultry Tools - Backend API

A comprehensive Django REST API for poultry farm management, featuring user authentication, vaccination scheduling, push notifications, and automated reminder systems.

## 🚀 Features

- **User Management**: Registration, authentication, password reset
- **Vaccination System**: Schedule, track, and manage poultry vaccinations
- **Push Notifications**: Real-time notifications via PWA
- **Automated Reminders**: Smart vaccination and vitamin care reminders
- **Admin Dashboard**: Complete management interface
- **Email Integration**: Zoho Mail integration for notifications
- **Analytics**: Usage tracking and reporting

## 🛠️ Technology Stack

- **Framework**: Django 5.2.1
- **API**: Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: Token-based authentication
- **Email**: Zoho Mail SMTP
- **Push Notifications**: VAPID keys + pywebpush
- **Task Queue**: Celery + Redis
- **CORS**: django-cors-headers

## 📦 Installation

### Prerequisites
- Python 3.8+
- pip
- Virtual environment (recommended)

### Quick Start

1. **Clone and navigate to backend**
   ```bash
   cd river-poultry-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env_example.txt .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   EMAIL_HOST_PASSWORD=your-zoho-app-password
   VAPID_PRIVATE_KEY=your-vapid-private-key
   VAPID_PUBLIC_KEY=your-vapid-public-key
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Required |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Allowed hosts | `localhost,127.0.0.1` |
| `EMAIL_HOST_USER` | Email username | `hello@riverpoultry.com` |
| `EMAIL_HOST_PASSWORD` | Email app password | Required |
| `VAPID_PRIVATE_KEY` | VAPID private key | Required |
| `VAPID_PUBLIC_KEY` | VAPID public key | Required |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |

### Email Setup (Zoho Mail)

1. Create Zoho Mail account
2. Generate app password
3. Configure SMTP settings in `.env`

### VAPID Keys Generation

```bash
python generate_vapid_keys.py
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/register/` | User registration |
| POST | `/api/auth/password-reset/` | Request password reset |
| POST | `/api/auth/password-reset-confirm/` | Confirm password reset |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/subscriptions/` | Get user subscriptions |
| POST | `/api/notifications/subscribe/` | Subscribe to notifications |
| GET | `/api/notifications/messages/` | Get notification messages |
| POST | `/api/notifications/messages/` | Send notification (admin) |

### Vaccination Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vaccinations/plans/` | Get vaccination plans |
| POST | `/api/vaccinations/plans/` | Create vaccination plan |
| GET | `/api/vaccinations/reminders/stats/` | Get reminder statistics |
| POST | `/api/vaccinations/plans/{id}/reminders/create/` | Create reminder schedule |

## 🗄️ Database Models

### Core Models

- **User**: Extended user model with additional fields
- **PoultryOperation**: Farm operation details
- **VaccinationPlan**: Vaccination scheduling
- **VaccinationReminder**: Automated reminders
- **PushSubscription**: PWA notification subscriptions
- **NotificationMessage**: Notification content

## 🔔 Push Notification System

### Features
- **VAPID Integration**: Secure push notifications
- **Service Worker**: Handles notification display
- **Automated Reminders**: Vaccination and vitamin care
- **Admin Management**: Send custom notifications

### Reminder Types
1. **Day Before**: Vaccination preparation reminder
2. **Day Of**: Vaccination day notification
3. **Day After**: Vitamin care reminder
4. **Follow-up**: Daily vitamin reminders (days 2-5)

## 🚀 Management Commands

```bash
# Send vaccination reminders
python manage.py send_vaccination_reminders

# Setup sample data
python setup_vaccination_reminders.py

# Test notifications
python manage.py test_notifications
```

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test users
python manage.py test vaccinations
python manage.py test notifications
```

## 📊 Admin Interface

Access the admin interface at: `http://localhost:8000/admin/`

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Admin Features
- User management
- Vaccination plan oversight
- Notification management
- Analytics dashboard
- System configuration

## 🔒 Security Features

- **Token Authentication**: Secure API access
- **CORS Protection**: Cross-origin request handling
- **Email Verification**: Password reset security
- **VAPID Security**: Encrypted push notifications
- **Input Validation**: Comprehensive data validation

## 📈 Performance

- **Database Optimization**: Efficient queries and indexing
- **Caching**: Redis-based caching for improved performance
- **Async Tasks**: Celery for background processing
- **Static Files**: Optimized static file serving

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `DEBUG=False`
   - Configure production database
   - Set secure `SECRET_KEY`
   - Configure production email settings

2. **Database**
   - Migrate to PostgreSQL
   - Run migrations
   - Create production superuser

3. **Static Files**
   ```bash
   python manage.py collectstatic
   ```

4. **Web Server**
   - Configure Nginx/Apache
   - Set up SSL certificates
   - Configure WSGI server (Gunicorn)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: hello@riverpoultry.com
- Create an issue in the repository
- Check the documentation files

---

**Built with ❤️ for poultry farmers worldwide** 🐔
