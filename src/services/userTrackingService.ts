// User Tracking Service for capturing user contact information and tool usage
export interface UserLead {
    id: string;
    timestamp: Date;
    toolName: 'vaccination' | 'roomMeasurement' | 'budgetCalculator';
    action: 'pdf_download' | 'email_request' | 'calendar_export';

    // Contact Information
    contactInfo: {
        email?: string;
        phone?: string;
        countryCode?: string;
    };

    // Tool-specific data
    toolData: {
        // Vaccination
        poultryType?: string;
        arrivalDate?: string;
        vaccineCount?: number;

        // Room Measurement
        roomDimensions?: any;
        capacity?: number;

        // Budget Calculator
        birdType?: string;
        numBirds?: number;
        productionPeriod?: number;
        totalCosts?: number;
        netProfit?: number;
    };

    // Session info
    sessionId: string;
    userAgent: string;
    referrer?: string;
}

class UserTrackingService {
    private apiEndpoint: string;
    private sessionId: string;

    constructor() {
        // In production, this should be your backend API endpoint
        this.apiEndpoint = process.env.REACT_APP_TRACKING_API || 'http://localhost:3001/api/leads';
        this.sessionId = this.generateSessionId();
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Track user lead when they download PDF or request email
     */
    async trackUserLead(lead: Omit<UserLead, 'id' | 'timestamp' | 'sessionId' | 'userAgent' | 'referrer'>): Promise<void> {
        const fullLead: UserLead = {
            ...lead,
            id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            referrer: document.referrer || undefined,
        };

        try {
            // Store locally first (as backup)
            this.storeLeadLocally(fullLead);

            // Send to backend API
            await this.sendToBackend(fullLead);

            // Also send to Google Sheets (if configured)
            await this.sendToGoogleSheets(fullLead);

            console.log('User lead tracked successfully:', fullLead);
        } catch (error) {
            console.error('Failed to track user lead:', error);
            // Even if API fails, we have local backup
        }
    }

    /**
     * Store lead in localStorage as backup
     */
    private storeLeadLocally(lead: UserLead): void {
        try {
            const existingLeads = this.getStoredLeads();
            existingLeads.push(lead);

            // Keep only last 100 leads in localStorage to avoid storage limits
            const recentLeads = existingLeads.slice(-100);
            localStorage.setItem('user_leads', JSON.stringify(recentLeads));
        } catch (error) {
            console.error('Failed to store lead locally:', error);
        }
    }

    /**
     * Get all stored leads from localStorage
     */
    getStoredLeads(): UserLead[] {
        try {
            const stored = localStorage.getItem('user_leads');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    /**
     * Send lead to backend API
     */
    private async sendToBackend(lead: UserLead): Promise<void> {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lead),
            });

            if (!response.ok) {
                throw new Error(`Backend API error: ${response.status}`);
            }
        } catch (error) {
            // If backend is not available, fail silently (we have local backup)
            console.warn('Backend API not available, lead stored locally only');
        }
    }

    /**
     * Send lead to Google Sheets (alternative to backend)
     * This uses Google Apps Script Web App as endpoint
     */
    private async sendToGoogleSheets(lead: UserLead): Promise<void> {
        const googleSheetsUrl = process.env.REACT_APP_GOOGLE_SHEETS_URL;

        if (!googleSheetsUrl) {
            return; // Google Sheets not configured
        }

        try {
            // Format data for Google Sheets
            const sheetData = {
                timestamp: lead.timestamp.toISOString(),
                tool: lead.toolName,
                action: lead.action,
                email: lead.contactInfo.email || '',
                phone: lead.contactInfo.phone ? `${lead.contactInfo.countryCode}${lead.contactInfo.phone}` : '',
                poultryType: lead.toolData.poultryType || '',
                birdType: lead.toolData.birdType || '',
                numBirds: lead.toolData.numBirds || '',
                totalCosts: lead.toolData.totalCosts || '',
                netProfit: lead.toolData.netProfit || '',
                userAgent: lead.userAgent,
            };

            await fetch(googleSheetsUrl, {
                method: 'POST',
                mode: 'no-cors', // Google Apps Script requires this
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sheetData),
            });
        } catch (error) {
            console.warn('Failed to send to Google Sheets:', error);
        }
    }

    /**
     * Export all leads as CSV
     */
    exportLeadsAsCSV(): string {
        const leads = this.getStoredLeads();

        if (leads.length === 0) {
            return 'No leads to export';
        }

        // CSV headers
        const headers = [
            'Timestamp',
            'Tool',
            'Action',
            'Email',
            'Phone',
            'Poultry Type',
            'Bird Type',
            'Number of Birds',
            'Total Costs',
            'Net Profit',
            'User Agent',
        ];

        // CSV rows
        const rows = leads.map(lead => [
            new Date(lead.timestamp).toISOString(),
            lead.toolName,
            lead.action,
            lead.contactInfo.email || '',
            lead.contactInfo.phone ? `${lead.contactInfo.countryCode}${lead.contactInfo.phone}` : '',
            lead.toolData.poultryType || '',
            lead.toolData.birdType || '',
            lead.toolData.numBirds || '',
            lead.toolData.totalCosts || '',
            lead.toolData.netProfit || '',
            lead.userAgent,
        ]);

        // Combine headers and rows
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        return csv;
    }

    /**
     * Download leads as CSV file
     */
    downloadLeadsCSV(): void {
        const csv = this.exportLeadsAsCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user_leads_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Get lead statistics
     */
    getLeadStats() {
        const leads = this.getStoredLeads();

        return {
            total: leads.length,
            byTool: {
                vaccination: leads.filter(l => l.toolName === 'vaccination').length,
                roomMeasurement: leads.filter(l => l.toolName === 'roomMeasurement').length,
                budgetCalculator: leads.filter(l => l.toolName === 'budgetCalculator').length,
            },
            byAction: {
                pdfDownload: leads.filter(l => l.action === 'pdf_download').length,
                emailRequest: leads.filter(l => l.action === 'email_request').length,
                calendarExport: leads.filter(l => l.action === 'calendar_export').length,
            },
            withEmail: leads.filter(l => l.contactInfo.email).length,
            withPhone: leads.filter(l => l.contactInfo.phone).length,
            last24Hours: leads.filter(l => {
                const leadTime = new Date(l.timestamp).getTime();
                const now = Date.now();
                return now - leadTime < 24 * 60 * 60 * 1000;
            }).length,
        };
    }
}

// Export singleton instance
export const userTrackingService = new UserTrackingService();
export default userTrackingService;
