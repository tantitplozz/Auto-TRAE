/**
 * ✅ Trae AI Agent System - API Service
 * Advanced API client with authentication, error handling, and real-time updates
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// ✅ API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Agent Types
export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'busy' | 'error';
  stealthConfig: StealthConfig;
  lastActive: string;
  detectionScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface StealthConfig {
  useProxy: boolean;
  proxyRotation: boolean;
  fingerprintSpoofing: boolean;
  behaviorEmulation: boolean;
  sessionWarming: boolean;
  detectionThreshold: number;
}

// ✅ Purchase Types
export interface Purchase {
  id: string;
  agentId: string;
  productUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseRequest {
  agentId: string;
  productUrl: string;
  config?: {
    maxPrice?: number;
    quantity?: number;
    priority?: 'low' | 'medium' | 'high';
    stealthConfig?: Partial<StealthConfig>;
  };
}

// ✅ Session Types
export interface Session {
  id: string;
  agentId: string;
  fingerprint: string;
  trustScore: number;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
}

// ✅ AI Decision Types
export interface AIDecision {
  id: string;
  agentId: string;
  context: string;
  decision: any;
  confidence: number;
  reasoning: string;
  createdAt: string;
}

// ✅ Task Queue Types
export interface TaskStatus {
  id: string;
  type: 'purchase' | 'warmup' | 'stealth_check' | 'fingerprint_test';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ✅ Load tokens from localStorage
    this.loadTokens();

    // ✅ Request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ✅ Response interceptor for error handling and token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshAccessToken();
            return this.api(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ✅ Token Management
  private loadTokens(): void {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokens(accessToken: string, refreshToken?: string): void {
    this.token = accessToken;
    localStorage.setItem('access_token', accessToken);
    
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  private clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // ✅ Authentication Methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: any; tokens: any }>> {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;
      
      this.saveTokens(accessToken, refreshToken);
      
      return {
        success: true,
        data: { user, tokens: { accessToken, refreshToken } }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }

  async register(userData: { email: string; password: string; name: string }): Promise<ApiResponse<{ user: any }>> {
    try {
      const response = await this.api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post('/auth/refresh', {
      refreshToken: this.refreshToken
    });

    const { accessToken, refreshToken } = response.data.data;
    this.saveTokens(accessToken, refreshToken);
  }

  logout(): void {
    this.clearTokens();
  }

  // ✅ Agent Management
  async getAgents(): Promise<ApiResponse<Agent[]>> {
    try {
      const response = await this.api.get('/agents');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch agents'
      };
    }
  }

  async getAgent(id: string): Promise<ApiResponse<Agent>> {
    try {
      const response = await this.api.get(`/agents/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch agent'
      };
    }
  }

  async createAgent(agentData: Partial<Agent>): Promise<ApiResponse<Agent>> {
    try {
      const response = await this.api.post('/agents', agentData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create agent'
      };
    }
  }

  async updateAgent(id: string, agentData: Partial<Agent>): Promise<ApiResponse<Agent>> {
    try {
      const response = await this.api.put(`/agents/${id}`, agentData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update agent'
      };
    }
  }

  async deleteAgent(id: string): Promise<ApiResponse<void>> {
    try {
      await this.api.delete(`/agents/${id}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete agent'
      };
    }
  }

  // ✅ Purchase Management
  async getPurchases(page = 1, limit = 20): Promise<PaginatedResponse<Purchase>> {
    try {
      const response = await this.api.get(`/purchases?page=${page}&limit=${limit}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch purchases',
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }
  }

  async createPurchase(purchaseData: CreatePurchaseRequest): Promise<ApiResponse<Purchase>> {
    try {
      const response = await this.api.post('/purchases', purchaseData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create purchase'
      };
    }
  }

  async getPurchase(id: string): Promise<ApiResponse<Purchase>> {
    try {
      const response = await this.api.get(`/purchases/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch purchase'
      };
    }
  }

  async cancelPurchase(id: string): Promise<ApiResponse<Purchase>> {
    try {
      const response = await this.api.post(`/purchases/${id}/cancel`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel purchase'
      };
    }
  }

  // ✅ Task Management
  async getTaskStatus(taskId: string): Promise<ApiResponse<TaskStatus>> {
    try {
      const response = await this.api.get(`/tasks/${taskId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch task status'
      };
    }
  }

  async executeTask(taskType: string, taskData: any): Promise<ApiResponse<TaskStatus>> {
    try {
      const response = await this.api.post('/tasks/execute', {
        type: taskType,
        data: taskData
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to execute task'
      };
    }
  }

  // ✅ Session Management
  async getSessions(agentId?: string): Promise<ApiResponse<Session[]>> {
    try {
      const url = agentId ? `/sessions?agentId=${agentId}` : '/sessions';
      const response = await this.api.get(url);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch sessions'
      };
    }
  }

  // ✅ AI Decisions
  async getAIDecisions(agentId?: string): Promise<ApiResponse<AIDecision[]>> {
    try {
      const url = agentId ? `/ai-decisions?agentId=${agentId}` : '/ai-decisions';
      const response = await this.api.get(url);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch AI decisions'
      };
    }
  }

  // ✅ Analytics and Monitoring
  async getAnalytics(timeRange = '24h'): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/analytics?range=${timeRange}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch analytics'
      };
    }
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/health');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch system health'
      };
    }
  }

  // ✅ Utility Methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  // ✅ File Upload
  async uploadFile(file: File, endpoint: string): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'File upload failed'
      };
    }
  }
}

// ✅ Export singleton instance
export const apiService = new ApiService();
export default apiService;