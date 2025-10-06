// Analytics Service for tracking tool usage and dashboard metrics
export interface ToolUsageEvent {
  id: string;
  toolName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  action: 'view' | 'calculate' | 'download' | 'export';
  metadata?: {
    poultryType?: string;
    batchSize?: number;
    calculationType?: string;
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
  };
  recentActivity: {
    toolName: string;
    action: string;
    timestamp: Date;
    userAgent?: string;
  }[];
  popularPoultryTypes: {
    type: string;
    count: number;
  }[];
  monthlyStats: {
    month: string;
    usage: number;
    downloads: number;
  }[];
}

class AnalyticsService {
  private baseUrl: string;
  private sessionId: string;

  constructor() {
    // In production, this would be your actual backend URL
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track tool usage events
  async trackToolUsage(event: Omit<ToolUsageEvent, 'id' | 'sessionId' | 'timestamp'>): Promise<void> {
    const fullEvent: ToolUsageEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      timestamp: new Date(),
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
      };

      const recentActivity = events
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
        .map(event => ({
          toolName: event.toolName,
          action: event.action,
          timestamp: new Date(event.timestamp),
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

      return {
        totalUsers: this.getUniqueUsers(events),
        totalSessions: this.getUniqueSessions(events),
        toolUsage,
        recentActivity,
        popularPoultryTypes,
        monthlyStats,
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
      });
    }

    return months;
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
      },
      recentActivity: [],
      popularPoultryTypes: [],
      monthlyStats: [],
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
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
