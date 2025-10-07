// Analytics Service for tracking tool usage and dashboard metrics
export interface ToolUsageEvent {
  id: string;
  toolName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  action: 'view' | 'calculate' | 'download' | 'export' | 'calendar_add' | 'email_send';
  metadata?: {
    poultryType?: string;
    batchSize?: number;
    calculationType?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
      timezone?: string;
    };
    device?: {
      type: 'mobile' | 'tablet' | 'desktop';
      os?: string;
      browser?: string;
    };
    [key: string]: any;
  };
}

export interface DashboardMetrics {
  totalUsers: number;
  totalSessions: number;
  toolUsage: {
    vaccination: number;
    roomMeasurement: number;
    budgetCalculator: number;
    pdfDownloader: number;
    calendarIntegration: number;
  };
  recentActivity: {
    toolName: string;
    action: string;
    timestamp: Date;
    userAgent?: string;
    location?: string;
  }[];
  popularPoultryTypes: {
    type: string;
    count: number;
  }[];
  monthlyStats: {
    month: string;
    usage: number;
    downloads: number;
    calendarAdds: number;
  }[];
  locationStats: {
    country: string;
    count: number;
    percentage: number;
  }[];
  deviceStats: {
    type: 'mobile' | 'tablet' | 'desktop';
    count: number;
    percentage: number;
  }[];
  calendarIntegrationStats: {
    platform: 'google' | 'outlook' | 'apple' | 'ics';
    count: number;
  }[];
}

class AnalyticsService {
  private baseUrl: string;
  private sessionId: string;
  private userLocation: any = null;
  private deviceInfo: any = null;

  constructor() {
    // In production, this would be your actual backend URL
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.sessionId = this.generateSessionId();
    this.initializeLocationAndDevice();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeLocationAndDevice(): Promise<void> {
    // Detect device information
    this.deviceInfo = this.detectDevice();
    
    // Get user location (with privacy consent)
    try {
      this.userLocation = await this.getUserLocation();
    } catch (error) {
      console.log('Location access denied or unavailable');
    }
  }

  private detectDevice() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
    
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';

    // Detect OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Detect Browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return {
      type: deviceType,
      os,
      browser
    };
  }

  private async getUserLocation(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      // Use IP-based location as fallback
      this.getLocationFromIP().then(resolve).catch(reject);
    });
  }

  private async getLocationFromIP(): Promise<any> {
    try {
      // Using a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        country: data.country_name,
        region: data.region,
        city: data.city,
        timezone: data.timezone,
        ip: data.ip
      };
    } catch (error) {
      console.error('Failed to get location from IP:', error);
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    }
  }

  // Track tool usage events
  async trackToolUsage(event: Omit<ToolUsageEvent, 'id' | 'sessionId' | 'timestamp'>): Promise<void> {
    const fullEvent: ToolUsageEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      timestamp: new Date(),
      metadata: {
        ...event.metadata,
        location: this.userLocation,
        device: this.deviceInfo
      }
    };

    try {
      // In a real application, this would send data to your backend
      // For now, we'll store it in localStorage for demonstration
      const existingEvents = this.getStoredEvents();
      existingEvents.push(fullEvent);
      localStorage.setItem('tool_usage_events', JSON.stringify(existingEvents));

      // Simulate API call
      console.log('Tracking tool usage:', fullEvent);
      
      // In production, you would make an actual API call:
      // await fetch(`${this.baseUrl}/analytics/track`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(fullEvent),
      // });
    } catch (error) {
      console.error('Failed to track tool usage:', error);
    }
  }

  // Get dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // In production, this would fetch from your backend
      const events = this.getStoredEvents();
      
      // Calculate metrics from stored events
      const toolUsage = {
        vaccination: events.filter(e => e.toolName === 'vaccination').length,
        roomMeasurement: events.filter(e => e.toolName === 'roomMeasurement').length,
        budgetCalculator: events.filter(e => e.toolName === 'budgetCalculator').length,
        pdfDownloader: events.filter(e => e.toolName === 'pdfDownloader').length,
        calendarIntegration: events.filter(e => e.action === 'calendar_add').length,
      };

      const recentActivity = events
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
        .map(event => ({
          toolName: event.toolName,
          action: event.action,
          timestamp: new Date(event.timestamp),
          location: event.metadata?.location ? 
            `${event.metadata.location.city}, ${event.metadata.location.country}` : 
            'Unknown'
        }));

      const poultryTypeCounts = events
        .filter(e => e.metadata?.poultryType)
        .reduce((acc, event) => {
          const type = event.metadata!.poultryType!;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const popularPoultryTypes = Object.entries(poultryTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Generate monthly stats for the last 6 months
      const monthlyStats = this.generateMonthlyStats(events);

      // Calculate location statistics
      const locationStats = this.calculateLocationStats(events);
      
      // Calculate device statistics
      const deviceStats = this.calculateDeviceStats(events);
      
      // Calculate calendar integration statistics
      const calendarIntegrationStats = this.calculateCalendarIntegrationStats(events);

      return {
        totalUsers: this.getUniqueUsers(events),
        totalSessions: this.getUniqueSessions(events),
        toolUsage,
        recentActivity,
        popularPoultryTypes,
        monthlyStats,
        locationStats,
        deviceStats,
        calendarIntegrationStats,
      };
    } catch (error) {
      console.error('Failed to get dashboard metrics:', error);
      // Return default metrics
      return this.getDefaultMetrics();
    }
  }

  private getStoredEvents(): ToolUsageEvent[] {
    try {
      const stored = localStorage.getItem('tool_usage_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getUniqueUsers(events: ToolUsageEvent[]): number {
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean));
    return uniqueUsers.size || 1; // Default to 1 if no users tracked
  }

  private getUniqueSessions(events: ToolUsageEvent[]): number {
    const uniqueSessions = new Set(events.map(e => e.sessionId));
    return uniqueSessions.size || 1; // Default to 1 if no sessions tracked
  }

  private generateMonthlyStats(events: ToolUsageEvent[]) {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
      });

      months.push({
        month: monthName,
        usage: monthEvents.length,
        downloads: monthEvents.filter(e => e.action === 'download').length,
        calendarAdds: monthEvents.filter(e => e.action === 'calendar_add').length,
      });
    }

    return months;
  }

  private calculateLocationStats(events: ToolUsageEvent[]) {
    const locationCounts = events
      .filter(e => e.metadata?.location?.country)
      .reduce((acc, event) => {
        const country = event.metadata!.location!.country!;
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const total = Object.values(locationCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(locationCounts)
      .map(([country, count]) => ({
        country,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateDeviceStats(events: ToolUsageEvent[]) {
    const deviceCounts = events
      .filter(e => e.metadata?.device?.type)
      .reduce((acc, event) => {
        const deviceType = event.metadata!.device!.type!;
        acc[deviceType] = (acc[deviceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const total = Object.values(deviceCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(deviceCounts)
      .map(([type, count]) => ({
        type: type as 'mobile' | 'tablet' | 'desktop',
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateCalendarIntegrationStats(events: ToolUsageEvent[]) {
    const calendarEvents = events.filter(e => e.action === 'calendar_add');
    const platformCounts = calendarEvents
      .filter(e => e.metadata?.platform)
      .reduce((acc, event) => {
        const platform = event.metadata!.platform!;
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(platformCounts)
      .map(([platform, count]) => ({
        platform: platform as 'google' | 'outlook' | 'apple' | 'ics',
        count
      }))
      .sort((a, b) => b.count - a.count);
  }

  private getDefaultMetrics(): DashboardMetrics {
    return {
      totalUsers: 1,
      totalSessions: 1,
      toolUsage: {
        vaccination: 0,
        roomMeasurement: 0,
        budgetCalculator: 0,
        pdfDownloader: 0,
        calendarIntegration: 0,
      },
      recentActivity: [],
      popularPoultryTypes: [],
      monthlyStats: [],
      locationStats: [],
      deviceStats: [],
      calendarIntegrationStats: [],
    };
  }

  // Track vaccination schedule generation
  async trackVaccinationSchedule(poultryType: string, batchSize?: number): Promise<void> {
    await this.trackToolUsage({
      toolName: 'vaccination',
      action: 'calculate',
      metadata: {
        poultryType,
        batchSize,
        calculationType: 'vaccination_schedule',
      },
    });
  }

  // Track room measurement calculation
  async trackRoomMeasurement(roomType: string, dimensions: any): Promise<void> {
    await this.trackToolUsage({
      toolName: 'roomMeasurement',
      action: 'calculate',
      metadata: {
        roomType,
        dimensions,
        calculationType: 'room_measurement',
      },
    });
  }

  // Track budget calculation
  async trackBudgetCalculation(poultryType: string, budgetType: string): Promise<void> {
    await this.trackToolUsage({
      toolName: 'budgetCalculator',
      action: 'calculate',
      metadata: {
        poultryType,
        budgetType,
        calculationType: 'budget_calculation',
      },
    });
  }

  // Track PDF download
  async trackPdfDownload(toolName: string, documentType: string): Promise<void> {
    await this.trackToolUsage({
      toolName: 'pdfDownloader',
      action: 'download',
      metadata: {
        documentType,
        sourceTool: toolName,
      },
    });
  }

  // Track calendar integration usage
  async trackCalendarIntegration(
    toolName: string, 
    platform: 'google' | 'outlook' | 'apple' | 'ics',
    eventType: string
  ): Promise<void> {
    await this.trackToolUsage({
      toolName,
      action: 'calendar_add',
      metadata: {
        platform,
        eventType,
        calendarIntegration: true,
      },
    });
  }

  // Track email sending
  async trackEmailSend(toolName: string, emailType: string): Promise<void> {
    await this.trackToolUsage({
      toolName,
      action: 'email_send',
      metadata: {
        emailType,
      },
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
