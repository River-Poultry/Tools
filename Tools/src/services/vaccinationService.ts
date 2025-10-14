// Vaccination Service for connecting to backend vaccination APIs

export interface VaccinationTemplate {
  id: number;
  poultry_type: string;
  vaccine_name: string;
  age_days: number;
  route: string;
  dosage: string;
  notes: string;
  is_required: boolean;
  is_active: boolean;
}

export interface VaccinationPlan {
  id: number;
  operation: number;
  vaccine_name: string;
  scheduled_date: string;
  age_days: number;
  route: string;
  dosage: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled' | 'cancelled';
  completed_at?: string;
  completed_by?: string;
  actual_dosage_used?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VaccinationReminder {
  id: number;
  vaccination_plan: number;
  reminder_type: 'email' | 'sms' | 'whatsapp' | 'push' | 'calendar';
  days_before: number;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  is_sent: boolean;
  sent_at?: string;
  message?: string;
  recipient_phone?: string;
  recipient_email?: string;
  whatsapp_number?: string;
  created_at: string;
  updated_at: string;
}

class VaccinationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';
  }

  // Get vaccination templates by poultry type
  async getVaccinationTemplates(poultryType: string): Promise<VaccinationTemplate[]> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      // Try to get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/vaccinations/templates/${poultryType}/`, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error(`Failed to fetch templates for ${poultryType}:`, response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching vaccination templates:', error);
      return [];
    }
  }

  // Get vaccination plans for a user
  async getVaccinationPlans(): Promise<VaccinationPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vaccinations/plans/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch vaccination plans:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching vaccination plans:', error);
      return [];
    }
  }

  // Get upcoming vaccinations
  async getUpcomingVaccinations(): Promise<VaccinationPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vaccinations/upcoming/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Return the upcoming_vaccinations array from the response
        return data.upcoming_vaccinations || [];
      } else {
        console.error('Failed to fetch upcoming vaccinations:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching upcoming vaccinations:', error);
      return [];
    }
  }

  // Get overdue vaccinations
  async getOverdueVaccinations(): Promise<VaccinationPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vaccinations/overdue/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Return the overdue_vaccinations array from the response
        return data.overdue_vaccinations || [];
      } else {
        console.error('Failed to fetch overdue vaccinations:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching overdue vaccinations:', error);
      return [];
    }
  }

  // Get vaccination statistics
  async getVaccinationStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/vaccinations/stats/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch vaccination stats:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching vaccination stats:', error);
      return null;
    }
  }

  // Create vaccination plan from template
  async createVaccinationPlanFromTemplate(operationId: number, poultryType: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/vaccinations/create-from-template/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation_id: operationId,
          poultry_type: poultryType
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to create vaccination plans:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error creating vaccination plans:', error);
      return null;
    }
  }

  // Mark vaccination as completed
  async completeVaccination(vaccinationId: number, completedBy: string, actualDosage?: string, notes?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/vaccinations/plans/${vaccinationId}/complete/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed_by: completedBy,
          actual_dosage_used: actualDosage,
          completion_notes: notes
        })
      });

      if (response.ok) {
        return true;
      } else {
        console.error('Failed to complete vaccination:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error completing vaccination:', error);
      return false;
    }
  }

  // Get vaccination reminders
  async getVaccinationReminders(): Promise<VaccinationReminder[]> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/reminders/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch vaccination reminders:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching vaccination reminders:', error);
      return [];
    }
  }
}

export const vaccinationService = new VaccinationService();
