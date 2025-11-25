const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with Zoho SMTP configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_APP_PASSWORD,
    },
});

// Test SMTP connection
const testConnection = async () => {
    try {
        await transporter.verify();
        console.log('✓ SMTP connection successful - Ready to send emails');
        return true;
    } catch (error) {
        console.error('✗ SMTP connection failed:', error.message);
        return false;
    }
};

/**
 * Send budget report email with PDF attachment
 * @param {Object} emailData - Email data object
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.recipientName - Recipient name
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.htmlContent - HTML email content
 * @param {string} emailData.pdfBase64 - Base64 encoded PDF
 * @param {string} emailData.pdfFilename - PDF filename
 * @returns {Promise<Object>} - Email send result
 */
const sendBudgetReport = async (emailData) => {
    const {
        to,
        recipientName = 'Customer',
        subject,
        htmlContent,
        pdfBase64,
        pdfFilename = 'Poultry_Budget_Report.pdf',
    } = emailData;

    // Validate required fields
    if (!to || !subject || !htmlContent || !pdfBase64) {
        throw new Error('Missing required email fields: to, subject, htmlContent, or pdfBase64');
    }

    // Email options
    const mailOptions = {
        from: {
            name: process.env.EMAIL_FROM_NAME || 'River Poultry & SmartVet',
            address: process.env.EMAIL_FROM || process.env.ZOHO_EMAIL,
        },
        to: {
            name: recipientName,
            address: to,
        },
        subject: subject,
        html: htmlContent,
        attachments: [
            {
                filename: pdfFilename,
                content: pdfBase64,
                encoding: 'base64',
                contentType: 'application/pdf',
            },
        ],
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✓ Email sent successfully:', info.messageId);
        return {
            success: true,
            messageId: info.messageId,
            message: `Email sent successfully to ${to}`,
        };
    } catch (error) {
        console.error('✗ Error sending email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Send a test email to verify configuration
 * @param {string} testEmail - Email address to send test to
 * @returns {Promise<Object>} - Test result
 */
const sendTestEmail = async (testEmail) => {
    const testHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f1f2b0; padding: 20px; text-align: center;">
        <h2 style="color: #286844; margin: 0;">River Poultry & SmartVet</h2>
      </div>
      <div style="padding: 20px;">
        <h3 style="color: #286844;">Email Service Test</h3>
        <p>This is a test email to verify that the Zoho SMTP email service is working correctly.</p>
        <p>If you received this email, the email service is configured properly!</p>
        <p>Best regards,<br>
        <strong>River Poultry & SmartVet Team</strong></p>
      </div>
      <div style="background-color: #f1f2b0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>Powered by River Poultry & SmartVet | www.riverpoultry.com</p>
      </div>
    </div>
  `;

    return sendBudgetReport({
        to: testEmail,
        recipientName: 'Test User',
        subject: 'Test Email - River Poultry Email Service',
        htmlContent: testHtml,
        pdfBase64: '', // No attachment for test
    });
};

module.exports = {
    sendBudgetReport,
    sendTestEmail,
    testConnection,
};
