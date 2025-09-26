Zoho Mail Setup Instructions
This document explains how to configure Zoho Mail API for sending emails from the Poultry Budget Calculator.

Prerequisites
A Zoho Mail account with API access
A domain configured with Zoho Mail (e.g., smartvet.africa)
Step 1: Create Zoho API Application
Go to Zoho API Console
Click "Add Client" and select "Server-based Applications"
Fill in the application details:
Client Name: River Poultry Budget Calculator
Homepage URL: https://www.riverpoultry.com
Authorized Redirect URIs: https://www.riverpoultry.com
Click "Create"
Note down the Client ID and Client Secret
Step 2: Generate Access Token
In the API Console, go to your application
Click "Generate Code" under "Client Secret"
Copy the generated code
Use this URL to get the authorization code:
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoMail.messages.CREATE&client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI&access_type=offline
Replace YOUR_CLIENT_ID and YOUR_REDIRECT_URI with your actual values
Visit the URL in your browser and authorize the application
Copy the authorization code from the redirect URL
Step 3: Exchange Code for Access Token
Use this curl command to get the access token:

curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=YOUR_REDIRECT_URI" \
  -d "code=AUTHORIZATION_CODE"
Replace the placeholders with your actual values.

Step 4: Configure the Application
Open src/config/email.ts
Replace YOUR_ZOHO_ACCESS_TOKEN with your actual access token:
export const EMAIL_CONFIG = {
  // ... other config
  ZOHO_ACCESS_TOKEN: 'your_actual_access_token_here',
  // ... rest of config
};
Step 5: Test Email Functionality
Start the application: npm start
Complete a budget calculation
Enter an email address in the contact form
Click "Send by Email"
Check if the email is sent successfully
Troubleshooting
Common Issues
"Zoho Mail not configured" error

Make sure you've replaced the placeholder token in email.ts
Verify the token is valid and not expired
"Failed to send email" error

Check if your Zoho Mail account has API access enabled
Verify the domain is properly configured in Zoho Mail
Ensure the access token has the correct scopes
CORS errors

Zoho Mail API should be called from your backend, not directly from the frontend
Consider implementing a backend proxy for the email API calls
Token Refresh
Access tokens expire after a certain period. To refresh:

Use the refresh token (if you have one) to get a new access token
Or repeat the authorization process to get a new token
Security Notes
Never commit access tokens to version control
Use environment variables for sensitive configuration
Consider implementing token refresh logic for production use
For production, implement the email sending on the backend to avoid exposing tokens
Fallback Behavior
If Zoho Mail is not configured or fails, the application will:

Download the PDF to the user's device
Open the default email client with pre-filled content
Prompt the user to attach the PDF manually
This ensures the functionality works even without proper API configuration.