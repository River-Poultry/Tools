export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  admin_role: string;
  is_admin: boolean;
  is_staff: boolean;
  farm_name?: string;
  country?: string;
  region?: string;
  experience_level: string;
  subscription_plan: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  farm_name?: string;
  country?: string;
  region?: string;
  experience_level?: string;
}

export interface UserStats {
  total_operations: number;
  active_operations: number;
  total_vaccinations: number;
  upcoming_vaccinations: number;
}

export interface UserDashboard {
  user: User;
  stats: UserStats;
}

class AuthService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.token = localStorage.getItem('auth_token');
  }

  // Authentication methods
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    try {
      // Clean up the data and add required fields
      const registrationData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password_confirm: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        farm_name: userData.farm_name || null,
        country: userData.country || null,
        region: userData.region || null,
        experience_level: userData.experience_level || 'beginner',
        phone: null, // Add missing phone field
        farm_size: null, // Add missing farm_size field
      };
      
      const response = await fetch(`${this.baseUrl}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } else {
        const errorData = await response.json();
        console.error('Registration error response:', errorData);
        
        // Handle different types of validation errors
        if (errorData.username) {
          throw new Error(`Username: ${Array.isArray(errorData.username) ? errorData.username[0] : errorData.username}`);
        }
        if (errorData.email) {
          throw new Error(`Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`);
        }
        if (errorData.password) {
          throw new Error(`Password: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`);
        }
        if (errorData.non_field_errors) {
          throw new Error(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
        }
        
        throw new Error(errorData.error || errorData.detail || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${this.baseUrl}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  // User data methods
  async getUserDashboard(): Promise<UserDashboard> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/dashboard/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch user dashboard');
      }
    } catch (error) {
      console.error('Get user dashboard error:', error);
      throw error;
    }
  }

  async getMyToolUsage(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/my-tool-usage/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch tool usage');
      }
    } catch (error) {
      console.error('Get tool usage error:', error);
      throw error;
    }
  }

  async getMyVaccinations(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/my-vaccinations/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch vaccinations');
      }
    } catch (error) {
      console.error('Get vaccinations error:', error);
      throw error;
    }
  }

  async getMyOperations(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/my-operations/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch operations');
      }
    } catch (error) {
      console.error('Get operations error:', error);
      throw error;
    }
  }

  async getMyAnalytics(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/my-analytics/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Get analytics error:', error);
      throw error;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return this.token;
  }

  // Password reset methods
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send password reset email');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  async confirmPasswordReset(uid: string, token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/password-reset-confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
          new_password: newPassword,
          new_password_confirm: newPassword,
        }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset confirm error:', error);
      throw error;
    }
  }

  // Update analytics service to include user context
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    
    return headers;
  }

  async updateUserProfile(userId: number, profileData: any): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/profile/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return await response.json();
  }
}

export const authService = new AuthService();

