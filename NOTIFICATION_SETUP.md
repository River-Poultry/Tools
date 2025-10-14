# Vaccination Reminder System Setup Guide

This guide will help you set up SMS and WhatsApp vaccination reminders for the River Poultry Tools backend.

## 🚀 Features

- **SMS Reminders** via Twilio
- **WhatsApp Reminders** via WhatsApp Business API
- **Automated Scheduling** - Reminders sent 1 day before vaccination
- **Background Processing** with Celery
- **Retry Logic** for failed deliveries
- **Comprehensive Analytics** and monitoring

## 📋 Prerequisites

1. **Twilio Account** for SMS notifications
2. **WhatsApp Business API** access
3. **Redis Server** for Celery task queue
4. **Python 3.8+** with Django

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
pip install celery redis twilio requests
```

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-number-id

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### 3. Start Redis Server

```bash
# Install Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# Start Redis
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:alpine
```

### 4. Start Celery Worker

```bash
# In your project directory
celery -A river_poultry_backend worker --loglevel=info
```

### 5. Start Celery Beat (for scheduled tasks)

```bash
# In a separate terminal
celery -A river_poultry_backend beat --loglevel=info
```

## 📱 API Endpoints

### Reminder Management

```bash
# Get reminder statistics
GET /api/notifications/stats/

# List all reminders
GET /api/notifications/reminders/

# Send immediate reminder
POST /api/notifications/send-now/{vaccination_plan_id}/
{
    "reminder_types": ["sms", "whatsapp"]
}

# Create scheduled reminder
POST /api/notifications/create-schedule/{vaccination_plan_id}/
{
    "reminder_types": ["sms", "whatsapp"],
    "days_before": 1
}

# Retry failed reminder
POST /api/notifications/reminders/{reminder_id}/retry/

# Get upcoming reminders
GET /api/notifications/upcoming/
```

### Example Usage

```bash
# Send immediate SMS and WhatsApp reminder
curl -X POST \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reminder_types": ["sms", "whatsapp"]}' \
  http://localhost:8000/api/notifications/send-now/1/

# Create scheduled reminder for tomorrow
curl -X POST \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reminder_types": ["sms", "whatsapp"], "days_before": 1}' \
  http://localhost:8000/api/notifications/create-schedule/1/
```

## 🔄 Automated Processing

### Daily Reminder Processing

The system automatically processes reminders daily. You can also run it manually:

```bash
# Process daily reminders
python manage.py process_reminders

# Process with retry and cleanup
python manage.py process_reminders --retry-failed --cleanup
```

### Cron Job Setup

Add to your crontab for automated daily processing:

```bash
# Run daily at 8 AM
0 8 * * * cd /path/to/your/project && python manage.py process_reminders
```

## 📊 Monitoring and Analytics

### Reminder Statistics

```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/notifications/stats/
```

Response:
```json
{
    "total_reminders": 150,
    "sent_reminders": 140,
    "pending_reminders": 5,
    "failed_reminders": 5,
    "sms_reminders": 75,
    "whatsapp_reminders": 75,
    "email_reminders": 0,
    "success_rate": 96.55
}
```

### Admin Interface

Access the Django admin at `http://localhost:8000/admin/` to:
- View all reminders
- Monitor delivery status
- Retry failed reminders
- Manage vaccination plans

## 🛠️ Troubleshooting

### Common Issues

1. **Redis Connection Error**
   ```bash
   # Check if Redis is running
   redis-cli ping
   # Should return "PONG"
   ```

2. **Celery Worker Not Processing Tasks**
   ```bash
   # Check Celery worker status
   celery -A river_poultry_backend inspect active
   ```

3. **SMS/WhatsApp Not Sending**
   - Verify API credentials
   - Check phone number format
   - Review error logs in Django admin

### Logs

Check logs for debugging:

```bash
# Celery worker logs
celery -A river_poultry_backend worker --loglevel=debug

# Django logs
python manage.py runserver --verbosity=2
```

## 🔐 Security Considerations

1. **API Keys**: Store securely in environment variables
2. **Phone Numbers**: Validate and sanitize input
3. **Rate Limiting**: Implement to prevent abuse
4. **Message Content**: Sanitize user-generated content

## 📈 Performance Optimization

1. **Redis Configuration**: Tune for your workload
2. **Celery Workers**: Scale based on message volume
3. **Database Indexing**: Add indexes for frequent queries
4. **Message Queuing**: Use priority queues for urgent reminders

## 🚀 Production Deployment

### Environment Setup

```bash
# Production environment variables
export TWILIO_ACCOUNT_SID="your-production-sid"
export TWILIO_AUTH_TOKEN="your-production-token"
export WHATSAPP_ACCESS_TOKEN="your-production-token"
export CELERY_BROKER_URL="redis://your-redis-server:6379/0"
```

### Process Management

Use a process manager like Supervisor or systemd:

```ini
# /etc/supervisor/conf.d/celery.conf
[program:celery]
command=celery -A river_poultry_backend worker --loglevel=info
directory=/path/to/your/project
user=your-user
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/celery/worker.log
```

## 📞 Support

For issues or questions:
1. Check the logs first
2. Verify API credentials
3. Test with a simple message
4. Contact the development team

## 🎯 Next Steps

1. Set up your Twilio and WhatsApp accounts
2. Configure the environment variables
3. Start Redis and Celery workers
4. Test with a sample vaccination plan
5. Monitor the reminder delivery

The system is now ready to send automated vaccination reminders via SMS and WhatsApp! 🐔📱




