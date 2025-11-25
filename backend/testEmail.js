const emailService = require('./emailService');

// Test email configuration
const testEmail = 'hello@riverpoultry.com'; // Change this to your test email

console.log('Testing Zoho SMTP Email Service...\n');

// Test 1: Connection test
console.log('Test 1: Testing SMTP connection...');
emailService.testConnection()
    .then(() => {
        console.log('✓ Connection test passed\n');

        // Test 2: Send test email
        console.log('Test 2: Sending test email to:', testEmail);
        return emailService.sendBudgetReport({
            to: testEmail,
            recipientName: 'Test User',
            subject: 'Test Email - River Poultry Budget Calculator',
            htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f1f2b0; padding: 20px; text-align: center;">
            <h2 style="color: #286844; margin: 0;">River Poultry & SmartVet</h2>
          </div>
          <div style="padding: 20px;">
            <h3 style="color: #286844;">Email Service Test</h3>
            <p>This is a test email to verify that the Zoho SMTP email service is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Backend Server: Running ✓</li>
              <li>SMTP Connection: Successful ✓</li>
              <li>Email Service: Operational ✓</li>
            </ul>
            <p>If you received this email with the PDF attachment, the email service is configured properly!</p>
            <p>Best regards,<br>
            <strong>River Poultry & SmartVet Team</strong></p>
          </div>
          <div style="background-color: #f1f2b0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Powered by River Poultry & SmartVet | www.riverpoultry.com</p>
          </div>
        </div>
      `,
            // Simple test PDF (base64 encoded "Test PDF")
            pdfBase64: 'JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlIC9QYWdlCi9QYXJlbnQgMSAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL0NvbnRlbnRzIDQgMCBSCi9SZXNvdXJjZXMgPDwvRm9udCA8PC9GMSA1IDAgUj4+Pj4+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNDQ+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKFRlc3QgUERGKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2E+PgplbmRvYmoKMSAwIG9iago8PC9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZwovUGFnZXMgMSAwIFI+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMzE4IDAwMDAwIG4NCjAwMDAwMDAzNzUgMDAwMDAgbg0KMDAwMDAwMDAxMCAwMDAwMCBuDQowMDAwMDAwMTI1IDAwMDAwIG4NCjAwMDAwMDAyMTcgMDAwMDAgbg0KdHJhaWxlcgo8PC9TaXplIDYKL1Jvb3QgMiAwIFI+PgpzdGFydHhyZWYKNDI0CiUlRU9G',
            pdfFilename: 'test_report.pdf'
        });
    })
    .then((result) => {
        console.log('✓ Email sent successfully!');
        console.log('  Message ID:', result.messageId);
        console.log('  Message:', result.message);
        console.log('\n✅ All tests passed! Email service is working correctly.');
        console.log('\nCheck your inbox at:', testEmail);
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Test failed:', error.message);
        console.error('\nPlease check:');
        console.error('1. Backend .env file has correct ZOHO_APP_PASSWORD');
        console.error('2. Email address is correct');
        console.error('3. Internet connection is working');
        process.exit(1);
    });
