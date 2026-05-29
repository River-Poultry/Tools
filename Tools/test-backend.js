#!/usr/bin/env node

// Simple test script to verify backend connectivity
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

async function testBackendConnectivity() {
  console.log('🔍 Testing Backend Connectivity...');
  console.log('Base URL:', BASE_URL);

  try {
    // Test health endpoint
    const healthUrl = BASE_URL.replace('/api', '') + '/api/health';
    console.log('Testing health endpoint:', healthUrl);
    
    const healthResponse = await fetch(healthUrl);
    console.log('Health response status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('⚠️ Health check failed:', healthResponse.status, healthResponse.statusText);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }

  try {
    // Test authentication endpoint
    console.log('Testing authentication endpoint...');
    const authResponse = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'test', password: 'test' }),
    });

    console.log('Auth response status:', authResponse.status);
    
    if (authResponse.status === 400 || authResponse.status === 401) {
      console.log('✅ Authentication endpoint is working (invalid credentials handled correctly)');
    } else if (authResponse.ok) {
      console.log('✅ Authentication endpoint is working (unexpected success)');
    } else {
      console.log('❌ Authentication endpoint error:', authResponse.status, authResponse.statusText);
    }
  } catch (error) {
    console.log('❌ Authentication test error:', error.message);
  }

  try {
    // Test password reset endpoint
    console.log('Testing password reset endpoint...');
    const resetResponse = await fetch(`${BASE_URL}/auth/password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    console.log('Password reset response status:', resetResponse.status);
    
    if (resetResponse.ok) {
      const resetData = await resetResponse.json();
      console.log('✅ Password reset endpoint is working:', resetData);
    } else {
      const errorData = await resetResponse.json();
      console.log('⚠️ Password reset endpoint response:', resetResponse.status, errorData);
    }
  } catch (error) {
    console.log('❌ Password reset test error:', error.message);
  }

  try {
    // Test email service endpoint
    console.log('Testing email service endpoint...');
    const emailResponse = await fetch(`${BASE_URL}/notifications/send-report-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_email: 'test@example.com',
        report_type: 'budget',
        report_data: { test: 'data' },
        pdf_content: 'dGVzdA==', // base64 for 'test'
        pdf_filename: 'test.pdf',
        farmer_name: 'Test Farmer',
        farmer_phone: '+1234567890',
        email_config: {
          from_email: 'noreply@riverpoultry.com',
          from_name: 'River Poultry & SmartVet',
          smtp_host: 'smtp.zoho.com',
          smtp_port: 587,
          smtp_user: 'noreply@riverpoultry.com',
          smtp_pass: 'h4tuM10XRp0Y',
          smtp_secure: false
        },
        email_content: '<h1>Test Email</h1>',
        subject: 'Test Report'
      })
    });

    console.log('Email service response status:', emailResponse.status);
    
    if (emailResponse.ok) {
      const emailData = await emailResponse.json();
      console.log('✅ Email service endpoint is working:', emailData);
    } else {
      const errorData = await emailResponse.json();
      console.log('⚠️ Email service endpoint response:', emailResponse.status, errorData);
    }
  } catch (error) {
    console.log('❌ Email service test error:', error.message);
  }

  console.log('\n📊 Backend Connectivity Test Complete!');
}

// Run the test
testBackendConnectivity().catch(console.error);
