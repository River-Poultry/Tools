const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const emailService = require('./emailService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for PDF attachments
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Email service is running' });
});

// Test SMTP connection endpoint
app.get('/api/test-connection', async (req, res) => {
    try {
        const isConnected = await emailService.testConnection();
        if (isConnected) {
            res.json({ success: true, message: 'SMTP connection successful' });
        } else {
            res.status(500).json({ success: false, message: 'SMTP connection failed' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
    try {
        const {
            to,
            recipientName,
            subject,
            htmlContent,
            pdfBase64,
            pdfFilename,
        } = req.body;

        // Validate required fields
        if (!to || !subject || !htmlContent || !pdfBase64) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to, subject, htmlContent, or pdfBase64',
            });
        }

        // Send email
        const result = await emailService.sendBudgetReport({
            to,
            recipientName,
            subject,
            htmlContent,
            pdfBase64,
            pdfFilename,
        });

        res.json(result);
    } catch (error) {
        console.error('Error in /api/send-email:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send email',
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`\n🚀 Email service running on port ${PORT}`);
    console.log(`📧 Using email: ${process.env.ZOHO_EMAIL}`);
    console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}\n`);

    // Test SMTP connection on startup
    await emailService.testConnection();
});

module.exports = app;
