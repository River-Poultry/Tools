# Zoho SMTP Email Setup Guide

## Overview

This guide explains how to set up and use the Zoho SMTP email service for sending budget reports from the River Poultry Tools application.

## Prerequisites

- Zoho Mail account (hello@riverpoultry.com)
- App-specific password generated from Zoho

## How It Works

The email system uses a two-tier architecture:

1. **Frontend (React)**: Collects user data and generates PDF reports
2. **Backend (Node.js/Express)**: Handles email sending via Zoho SMTP

This approach keeps email credentials secure on the server side and provides better error handling.

## Setup Instructions

### 1. Generate Zoho App-Specific Password

1. Log in to [Zoho Mail](https://mail.zoho.com)
2. Go to Settings → Security → App Passwords
3. Click "Generate New Password"
4. Enter a name (e.g., "River Poultry Tools")
5. Copy the generated password (format: `XXXX XXXX XXXX`)
6. Remove spaces: `XXXXXXXXXXXX`

### 2. Configure Backend Environment

The app-specific password is already configured in `/backend/.env`:

```env
ZOHO_EMAIL=hello@riverpoultry.com
ZOHO_APP_PASSWORD=T0jzF5ftG4ug
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Start the Backend Server

```bash
cd backend
npm start
```

The server will start on port 5001 and automatically test the SMTP connection.

### 5. Start the Frontend

In a separate terminal:

```bash
npm start
```

The frontend will run on port 3000 and connect to the backend API.

## Testing the Email Service

### Test SMTP Connection

```bash
cd backend
node -e "const emailService = require('./emailService'); emailService.testConnection();"
```

Expected output: `✓ SMTP connection successful - Ready to send emails`

### Send a Test Email

1. Navigate to the Budget Calculator
2. Fill out the form completely
3. Enter your email address in the contact info
4. Click "Email Report"
5. Check your inbox for the email with PDF attachment

## Troubleshooting

### Email Not Sending

**Problem**: Error message "Failed to send email"

**Solutions**:
1. Check that backend server is running (`npm start` in `/backend`)
2. Verify SMTP credentials in `/backend/.env`
3. Check backend console for error messages
4. Ensure port 5001 is not blocked by firewall

### SMTP Connection Failed

**Problem**: `✗ SMTP connection failed`

**Solutions**:
1. Verify app-specific password is correct (no spaces)
2. Check that Zoho account is active
3. Ensure internet connection is stable
4. Try regenerating the app-specific password

### CORS Errors

**Problem**: Frontend cannot connect to backend

**Solutions**:
1. Verify `CORS_ORIGIN` in `/backend/.env` matches frontend URL
2. Default is `http://localhost:3000`
3. Update if using different port or domain

### Fallback Mode Activates

**Problem**: Email opens in default mail client instead of sending automatically

**Solutions**:
1. This is expected behavior when backend is unavailable
2. Start the backend server to enable automatic sending
3. The PDF will be downloaded - attach it manually to the email

## Email Template Customization

To customize the email template, edit `/src/config/email.ts`:

```typescript
export const EMAIL_CONFIG = {
  FROM_EMAIL: 'hello@riverpoultry.com',
  FROM_NAME: 'River Poultry & SmartVet',
  SUBJECT_TEMPLATE: 'Your Poultry Budget Report - River Poultry & SmartVet',
  COMPANY_NAME: 'River Poultry & SmartVet',
  COMPANY_WEBSITE: 'www.riverpoultry.com',
  COMPANY_COLOR: '#286844',
  COMPANY_BG_COLOR: '#f1f2b0'
};
```

## Security Notes

- ✅ Email credentials are stored securely in backend `.env` file
- ✅ Never commit `.env` file to version control
- ✅ App-specific passwords can be revoked anytime from Zoho settings
- ✅ Backend validates all email requests before sending

## API Endpoints

### POST `/api/send-email`

Sends an email with PDF attachment.

**Request Body**:
```json
{
  "to": "recipient@example.com",
  "recipientName": "Customer Name",
  "subject": "Email Subject",
  "htmlContent": "<html>...</html>",
  "pdfBase64": "base64_encoded_pdf",
  "pdfFilename": "report.pdf"
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "<message-id>",
  "message": "Email sent successfully to recipient@example.com"
}
```

### GET `/api/test-connection`

Tests SMTP connection.

**Response**:
```json
{
  "success": true,
  "message": "SMTP connection successful"
}
```

### GET `/health`

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "message": "Email service is running"
}
```

## Production Deployment

For production deployment:

1. Update `CORS_ORIGIN` in `/backend/.env` to your production frontend URL
2. Set `NODE_ENV=production`
3. Use environment variables for sensitive data
4. Consider using a process manager like PM2 for the backend
5. Set up HTTPS for secure communication

## Support

For issues or questions, contact the development team or refer to:
- [Zoho Mail API Documentation](https://www.zoho.com/mail/help/api/)
- [Nodemailer Documentation](https://nodemailer.com/)
