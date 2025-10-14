# Email and Push Notification Setup Guide

## 📧 Email Configuration (Zoho Mail)

### 1. Create Environment File
Create a `.env` file in the `river-poultry-backend` directory with the following content:

```bash
# Email Settings for Zoho Mail
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=hello@riverpoultry.com
EMAIL_HOST_PASSWORD=your-zoho-app-password
DEFAULT_FROM_EMAIL=hello@riverpoultry.com
SERVER_EMAIL=hello@riverpoultry.com

# VAPID Settings for Push Notifications
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_ADMIN_EMAIL=hello@riverpoultry.com
```

### 2. Zoho Mail Setup Steps

1. **Login to Zoho Mail Admin Console**
   - Go to https://mailadmin.zoho.com/
   - Login with your Zoho account

2. **Create App Password**
   - Go to Security → App Passwords
   - Create a new app password for "River Poultry Tools"
   - Copy the generated password (you'll need this for `EMAIL_HOST_PASSWORD`)

3. **Enable SMTP Access**
   - Go to Mail Settings → SMTP/IMAP
   - Enable SMTP access for `hello@riverpoultry.com`

4. **Test Email Configuration**
   ```bash
   cd river-poultry-backend
   python manage.py shell
   ```
   ```python
   from django.core.mail import send_mail
   send_mail(
       'Test Email',
       'This is a test email from River Poultry Tools.',
       'hello@riverpoultry.com',
       ['your-email@example.com'],
       fail_silently=False,
   )
   ```

## 📱 Push Notifications Setup

### 1. Generate VAPID Keys
Run the VAPID key generation script:
```bash
cd river-poultry-backend
python generate_vapid_keys.py
```

This will output:
```
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_PUBLIC_KEY=your-public-key-here
```

### 2. Update Environment File
Add the generated keys to your `.env` file:
```bash
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_ADMIN_EMAIL=hello@riverpoultry.com
```

### 3. Frontend Configuration
The frontend will automatically use the VAPID public key from the backend API.

## 🔧 Push Notification Workflow

### How Push Notifications Work:

1. **User Subscription**: Users subscribe to push notifications through the frontend
2. **Automatic Reminders**: The system automatically creates reminder schedules when vaccinations are scheduled
3. **Scheduled Sending**: Reminders are sent at the appropriate times:
   - Day before vaccination
   - Day of vaccination  
   - Day after vaccination (vitamin care reminder)
   - Days 2-5 after vaccination (vitamin care follow-up)

### Push Notifications are NOT Hardcoded:

- **Templates**: Pre-defined message templates for different reminder types
- **Content**: Dynamic content based on vaccination details
- **Scheduling**: Automatic scheduling based on vaccination dates
- **Targeting**: Sent to users who have subscribed to push notifications

### Admin Dashboard Features:

1. **View Subscriptions**: See all users who have subscribed to push notifications
2. **Send Manual Notifications**: Create and send custom notifications
3. **View Delivery Status**: Track which notifications were delivered successfully
4. **Manage Templates**: Customize notification templates

## 🚀 Testing the Setup

### 1. Test Email
```bash
# Test password reset
curl -X POST -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}' \
  http://127.0.0.1:8000/api/auth/password-reset/
```

### 2. Test Push Notifications
1. Login to the frontend
2. Go to your profile → Notification Settings
3. Enable push notifications
4. Create a vaccination plan
5. The system will automatically create reminder schedules

### 3. Test Reminder System
```bash
# Dry run to see what would be sent
python manage.py send_vaccination_reminders --dry-run

# Send actual reminders
python manage.py send_vaccination_reminders
```

## 📋 Required Information

To complete the setup, you'll need:

1. **Zoho Mail Credentials**:
   - Email: `hello@riverpoultry.com`
   - App Password: (generate from Zoho admin console)

2. **VAPID Keys**: (generate using the script)

3. **Domain Configuration**: (if using custom domain)

## 🔍 Troubleshooting

### Email Issues:
- Check Zoho Mail app password is correct
- Verify SMTP settings in Zoho admin console
- Check firewall/network restrictions

### Push Notification Issues:
- Verify VAPID keys are correctly set
- Check browser notification permissions
- Ensure HTTPS in production (required for push notifications)

### Common Errors:
- `SMTPAuthenticationError`: Check email credentials
- `WebPushException`: Check VAPID keys and subscription validity
- `Permission denied`: Check browser notification permissions
