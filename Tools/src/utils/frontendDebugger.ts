// Debug utility for testing frontend functionality
export class FrontendDebugger {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';
  }

  // Test API connectivity
  async testAPIConnectivity(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Testing API connectivity...');
      console.log('Base URL:', this.baseUrl);

      // Test health endpoint (if available)
      const healthResponse = await fetch(`${this.baseUrl.replace('/api', '')}/api/health`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        return {
          success: true,
          message: 'API is reachable',
          details: healthData
        };
      } else {
        return {
          success: false,
          message: `API health check failed: ${healthResponse.status} ${healthResponse.statusText}`
        };
      }
    } catch (error) {
      console.error('API connectivity test failed:', error);
      return {
        success: false,
        message: `API connectivity failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Test password reset functionality
  async testPasswordReset(testEmail: string = 'test@example.com'): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Testing password reset functionality...');
      
      const response = await fetch(`${this.baseUrl}/auth/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Password reset request sent successfully',
          details: result
        };
      } else {
        return {
          success: false,
          message: `Password reset failed: ${result.error || result.message || response.statusText}`,
          details: result
        };
      }
    } catch (error) {
      console.error('Password reset test failed:', error);
      return {
        success: false,
        message: `Password reset test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Test email service functionality
  async testEmailService(testEmail: string = 'test@example.com'): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Testing email service functionality...');
      
      // Create a mock PDF blob for testing
      const mockPDFBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      
      const testData = {
        to_email: testEmail,
        report_type: 'budget',
        report_data: {
          birdType: 'Broiler',
          numBirds: 1000,
          productionPeriod: 45,
          ageUnit: 'days',
          totalCosts: '$5,000',
          netProfit: '$2,500'
        },
        pdf_content: await this.convertBlobToBase64(mockPDFBlob),
        pdf_filename: 'test-report.pdf',
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
        email_content: '<h1>Test Email Content</h1>',
        subject: 'Test Report - River Poultry & SmartVet'
      };

      const response = await fetch(`${this.baseUrl}/notifications/send-report-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Email service test successful',
          details: result
        };
      } else {
        return {
          success: false,
          message: `Email service test failed: ${result.message || result.error || response.statusText}`,
          details: result
        };
      }
    } catch (error) {
      console.error('Email service test failed:', error);
      return {
        success: false,
        message: `Email service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Test authentication endpoints
  async testAuthentication(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Testing authentication endpoints...');
      
      // Test login endpoint (with invalid credentials to avoid actual login)
      const loginResponse = await fetch(`${this.baseUrl}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'test', password: 'test' }),
      });

      const loginResult = await loginResponse.json();

      if (loginResponse.status === 400 || loginResponse.status === 401) {
        // Expected for invalid credentials
        return {
          success: true,
          message: 'Authentication endpoint is working (invalid credentials handled correctly)',
          details: loginResult
        };
      } else if (loginResponse.ok) {
        return {
          success: true,
          message: 'Authentication endpoint is working (unexpected success with test credentials)',
          details: loginResult
        };
      } else {
        return {
          success: false,
          message: `Authentication endpoint error: ${loginResponse.status} ${loginResponse.statusText}`,
          details: loginResult
        };
      }
    } catch (error) {
      console.error('Authentication test failed:', error);
      return {
        success: false,
        message: `Authentication test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Convert blob to base64 (helper method)
  private async convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  }

  // Run all tests
  async runAllTests(): Promise<{ [key: string]: { success: boolean; message: string; details?: any } }> {
    console.log('🚀 Running all frontend debug tests...');
    
    const results = {
      apiConnectivity: await this.testAPIConnectivity(),
      authentication: await this.testAuthentication(),
      passwordReset: await this.testPasswordReset(),
      emailService: await this.testEmailService()
    };

    console.log('📊 Test Results:', results);
    return results;
  }

  // Generate debug report
  generateDebugReport(results: { [key: string]: { success: boolean; message: string; details?: any } }): string {
    const report = `
# Frontend Debug Report

## Environment
- **Base URL**: ${this.baseUrl}
- **Environment**: ${process.env.NODE_ENV || 'development'}
- **Timestamp**: ${new Date().toISOString()}

## Test Results

### API Connectivity
- **Status**: ${results.apiConnectivity.success ? '✅ PASS' : '❌ FAIL'}
- **Message**: ${results.apiConnectivity.message}
${results.apiConnectivity.details ? `- **Details**: ${JSON.stringify(results.apiConnectivity.details, null, 2)}` : ''}

### Authentication
- **Status**: ${results.authentication.success ? '✅ PASS' : '❌ FAIL'}
- **Message**: ${results.authentication.message}
${results.authentication.details ? `- **Details**: ${JSON.stringify(results.authentication.details, null, 2)}` : ''}

### Password Reset
- **Status**: ${results.passwordReset.success ? '✅ PASS' : '❌ FAIL'}
- **Message**: ${results.passwordReset.message}
${results.passwordReset.details ? `- **Details**: ${JSON.stringify(results.passwordReset.details, null, 2)}` : ''}

### Email Service
- **Status**: ${results.emailService.success ? '✅ PASS' : '❌ FAIL'}
- **Message**: ${results.emailService.message}
${results.emailService.details ? `- **Details**: ${JSON.stringify(results.emailService.details, null, 2)}` : ''}

## Summary
- **Total Tests**: 4
- **Passed**: ${Object.values(results).filter(r => r.success).length}
- **Failed**: ${Object.values(results).filter(r => !r.success).length}

## Recommendations
${Object.entries(results).map(([key, result]) => 
  !result.success ? `- Fix ${key}: ${result.message}` : ''
).filter(Boolean).join('\n') || '- All tests passed! 🎉'}
    `;

    return report;
  }
}

// Export instance for easy use
export const frontendDebugger = new FrontendDebugger();
