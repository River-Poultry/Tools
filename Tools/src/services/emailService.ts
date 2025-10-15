import { EMAIL_CONFIG, isZohoMailConfigured } from '../config/email';

export interface EmailAttachment {
  name: string;
  content: string; // base64 encoded
  contentType: string;
}

export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  attachments?: EmailAttachment[];
  farmerName?: string;
  farmerPhone?: string;
}

export interface ReportEmailData {
  reportType: 'budget' | 'vaccination' | 'house-design' | 'nutrition';
  farmerName?: string;
  farmerEmail: string;
  farmerPhone?: string;
  reportData: any;
  pdfBlob: Blob;
  fileName: string;
}

class EmailService {
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

  private generateReportEmailTemplate(data: ReportEmailData): string {
    const { reportType, farmerName, reportData } = data;
    
    const reportTitles = {
      budget: 'Poultry Budget Report',
      vaccination: 'Poultry Vaccination Schedule',
      'house-design': 'Poultry House Design Report',
      nutrition: 'Poultry Nutrition Report'
    };

    const reportDescriptions = {
      budget: 'detailed budget analysis with cost breakdowns and profit projections',
      vaccination: 'comprehensive vaccination schedule with timing and administration details',
      'house-design': 'custom house design specifications with ventilation and space requirements',
      nutrition: 'nutritional analysis and feeding recommendations'
    };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${EMAIL_CONFIG.COMPANY_BG_COLOR}; padding: 20px; text-align: center;">
          <h2 style="color: ${EMAIL_CONFIG.COMPANY_COLOR}; margin: 0;">${EMAIL_CONFIG.COMPANY_NAME}</h2>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: ${EMAIL_CONFIG.COMPANY_COLOR};">Your ${reportTitles[reportType]}</h3>
          <p>Dear ${farmerName || 'Valued Customer'},</p>
          <p>Thank you for using our Poultry Tools! Please find attached your ${reportDescriptions[reportType]}.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: ${EMAIL_CONFIG.COMPANY_COLOR}; margin-top: 0;">Report Summary:</h4>
            ${this.generateReportSummary(reportType, reportData)}
          </div>
          
          <p>This report has been generated based on industry best practices and your specific requirements. Keep this document for your records and reference.</p>
          
          <p>If you have any questions about your report or need assistance with poultry farming, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          <strong>${EMAIL_CONFIG.COMPANY_NAME} Team</strong></p>
        </div>
        <div style="background-color: ${EMAIL_CONFIG.COMPANY_BG_COLOR}; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>Powered by ${EMAIL_CONFIG.COMPANY_NAME} | ${EMAIL_CONFIG.COMPANY_WEBSITE}</p>
        </div>
      </div>
    `;
  }

  private generateReportSummary(reportType: string, reportData: any): string {
    switch (reportType) {
      case 'budget':
        return `
          <ul>
            <li><strong>Bird Type:</strong> ${reportData.birdType || 'N/A'}</li>
            <li><strong>Number of Birds:</strong> ${reportData.numBirds?.toLocaleString() || 'N/A'}</li>
            <li><strong>Production Period:</strong> ${reportData.productionPeriod || 'N/A'} ${reportData.ageUnit || ''}</li>
            <li><strong>Total Costs:</strong> ${reportData.totalCosts || 'N/A'}</li>
            <li><strong>Net Profit:</strong> ${reportData.netProfit || 'N/A'}</li>
          </ul>
        `;
      case 'vaccination':
        return `
          <ul>
            <li><strong>Poultry Type:</strong> ${reportData.type || 'N/A'}</li>
            <li><strong>Batch Size:</strong> ${reportData.batchSize?.toLocaleString() || 'N/A'}</li>
            <li><strong>Total Vaccinations:</strong> ${reportData.vaccines?.length || 0} vaccines</li>
            <li><strong>Arrival Date:</strong> ${reportData.arrivalDate || 'N/A'}</li>
            <li><strong>Estimated Sale Date:</strong> ${reportData.saleDate || 'N/A'}</li>
          </ul>
        `;
      case 'house-design':
        return `
          <ul>
            <li><strong>Poultry Type:</strong> ${reportData.type || 'N/A'}</li>
            <li><strong>Number of Birds:</strong> ${reportData.birds?.toLocaleString() || 'N/A'}</li>
            <li><strong>Required Space:</strong> ${reportData.requiredSpace || 'N/A'} m²</li>
            <li><strong>House Dimensions:</strong> ${reportData.dimensions || 'N/A'}</li>
            <li><strong>Ventilation Area:</strong> ${reportData.ventilationArea || 'N/A'} m²</li>
          </ul>
        `;
      case 'nutrition':
        return `
          <ul>
            <li><strong>Feed Type:</strong> ${reportData.feedType || 'N/A'}</li>
            <li><strong>Age Group:</strong> ${reportData.ageGroup || 'N/A'}</li>
            <li><strong>Daily Intake:</strong> ${reportData.dailyIntake || 'N/A'}</li>
            <li><strong>Total Feed Required:</strong> ${reportData.totalFeed || 'N/A'}</li>
            <li><strong>Estimated Cost:</strong> ${reportData.estimatedCost || 'N/A'}</li>
          </ul>
        `;
      default:
        return '<p>Report details are included in the attached PDF.</p>';
    }
  }

  async sendReportEmail(data: ReportEmailData): Promise<{ success: boolean; message: string }> {
    try {
      // Check if email is provided
      if (!data.farmerEmail) {
        return {
          success: false,
          message: 'Email address is required to send the report.'
        };
      }

      // Check if Zoho Mail is configured
      if (!isZohoMailConfigured()) {
        return {
          success: false,
          message: 'Email service is not configured. Please contact support.'
        };
      }

      // Convert PDF blob to base64
      const base64PDF = await this.convertBlobToBase64(data.pdfBlob);

      // Generate email content
      const htmlContent = this.generateReportEmailTemplate(data);

      // Prepare email data
      const emailData = {
        from: {
          email: EMAIL_CONFIG.FROM_EMAIL,
          name: EMAIL_CONFIG.FROM_NAME
        },
        to: [
          {
            email: data.farmerEmail,
            name: data.farmerName || 'Customer'
          }
        ],
        subject: `${EMAIL_CONFIG.COMPANY_NAME} - Your ${this.getReportTitle(data.reportType)}`,
        htmlContent,
        attachments: [
          {
            name: data.fileName,
            content: base64PDF,
            contentType: "application/pdf"
          }
        ]
      };

      // Send email via Zoho Mail API
      const response = await fetch(EMAIL_CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${EMAIL_CONFIG.ZOHO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Report sent successfully to your email!'
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: `Failed to send email: ${errorData.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        message: 'An error occurred while sending the email. Please try again.'
      };
    }
  }

  private getReportTitle(reportType: string): string {
    const titles = {
      budget: 'Budget Report',
      vaccination: 'Vaccination Schedule',
      'house-design': 'House Design Report',
      nutrition: 'Nutrition Report'
    };
    return titles[reportType as keyof typeof titles] || 'Report';
  }

  // Fallback method for when email is not configured
  async sendReportEmailFallback(data: ReportEmailData): Promise<{ success: boolean; message: string }> {
    // This could be implemented to use a different email service
    // or to store the report for manual sending
    return {
      success: false,
      message: 'Email service is not available. Please download the report manually.'
    };
  }
}

export const emailService = new EmailService();
