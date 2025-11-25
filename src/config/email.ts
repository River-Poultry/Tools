// Email configuration for Backend API
export const EMAIL_CONFIG = {
  // Backend API endpoint
  BACKEND_API_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001',

  // Email settings
  FROM_EMAIL: 'hello@riverpoultry.com',
  FROM_NAME: 'River Poultry & SmartVet',

  // Email templates
  SUBJECT_TEMPLATE: 'Your Poultry Budget Report - River Poultry & SmartVet',

  // Company branding
  COMPANY_NAME: 'River Poultry & SmartVet',
  COMPANY_WEBSITE: 'www.riverpoultry.com',
  COMPANY_COLOR: '#286844',
  COMPANY_BG_COLOR: '#f1f2b0'
};

// Email template generator
export const generateEmailTemplate = (data: {
  birdType: string;
  numBirds: number;
  productionPeriod: number;
  ageUnit: string;
  totalCosts: string;
  netProfit: string;
  contactPhone?: string;
}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${EMAIL_CONFIG.COMPANY_BG_COLOR}; padding: 20px; text-align: center;">
        <h2 style="color: ${EMAIL_CONFIG.COMPANY_COLOR}; margin: 0;">${EMAIL_CONFIG.COMPANY_NAME}</h2>
      </div>
      <div style="padding: 20px;">
        <h3 style="color: ${EMAIL_CONFIG.COMPANY_COLOR};">Your Poultry Budget Report</h3>
        <p>Dear ${data.contactPhone ? 'Farmer' : 'Customer'},</p>
        <p>Thank you for using our Poultry Budget Calculator! Please find attached your detailed budget report.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: ${EMAIL_CONFIG.COMPANY_COLOR}; margin-top: 0;">Report Summary:</h4>
          <ul>
            <li><strong>Bird Type:</strong> ${data.birdType}</li>
            <li><strong>Number of Birds:</strong> ${data.numBirds.toLocaleString()}</li>
            <li><strong>Production Period:</strong> ${data.productionPeriod} ${data.ageUnit}</li>
            <li><strong>Total Costs:</strong> ${data.totalCosts}</li>
            <li><strong>Net Profit:</strong> ${data.netProfit}</li>
          </ul>
        </div>
        
        <p>This report includes detailed cost breakdowns, revenue projections, and profit analysis based on industry standards.</p>
        
        <p>If you have any questions about your budget or need assistance with poultry farming, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>
        <strong>${EMAIL_CONFIG.COMPANY_NAME} Team</strong></p>
      </div>
      <div style="background-color: ${EMAIL_CONFIG.COMPANY_BG_COLOR}; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>Powered by ${EMAIL_CONFIG.COMPANY_NAME} | ${EMAIL_CONFIG.COMPANY_WEBSITE}</p>
      </div>
    </div>
  `;
};
