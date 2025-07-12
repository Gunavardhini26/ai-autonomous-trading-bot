// API Service Utilities
// Centralized API service for all HTTP requests

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS, ERROR_MESSAGES } from '../config/api';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
            refresh_token: refreshToken
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiService = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },
  
  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },
  
  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },
  
  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
  
  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },
};

// Authentication API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    return apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },
  
  register: async (userData: { name: string; email: string; password: string }) => {
    return apiService.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },
  
  logout: async () => {
    return apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
  
  getCurrentUser: async () => {
    return apiService.get(API_ENDPOINTS.AUTH.ME);
  },
  
  refreshToken: async (refreshToken: string) => {
    return apiService.post(API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken });
  },
};

// Market Data API
export const marketAPI = {
  getLivePrices: async (symbols: string[]) => {
    return apiService.post(API_ENDPOINTS.MARKET.LIVE_PRICES, { symbols });
  },
  
  getHistoricalData: async (symbol: string, period: string) => {
    return apiService.get(`${API_ENDPOINTS.MARKET.HISTORICAL_DATA}?symbol=${symbol}&period=${period}`);
  },
  
  getWatchlist: async () => {
    return apiService.get(API_ENDPOINTS.MARKET.WATCHLIST);
  },
  
  updateWatchlist: async (symbols: string[]) => {
    return apiService.post(API_ENDPOINTS.MARKET.WATCHLIST, { symbols });
  },
  
  getSectors: async () => {
    return apiService.get(API_ENDPOINTS.MARKET.SECTORS);
  },
  
  getIndices: async () => {
    return apiService.get(API_ENDPOINTS.MARKET.INDICES);
  },
};

// Trading API
export const tradingAPI = {
  placeOrder: async (orderData: any) => {
    return apiService.post(API_ENDPOINTS.TRADING.PLACE_ORDER, orderData);
  },
  
  cancelOrder: async (orderId: string) => {
    return apiService.delete(`${API_ENDPOINTS.TRADING.CANCEL_ORDER}/${orderId}`);
  },
  
  modifyOrder: async (orderId: string, modifications: any) => {
    return apiService.put(`${API_ENDPOINTS.TRADING.MODIFY_ORDER}/${orderId}`, modifications);
  },
  
  getOrderHistory: async (limit?: number) => {
    return apiService.get(`${API_ENDPOINTS.TRADING.ORDER_HISTORY}?limit=${limit || 50}`);
  },
  
  getTradeHistory: async (limit?: number) => {
    return apiService.get(`${API_ENDPOINTS.TRADING.TRADE_HISTORY}?limit=${limit || 50}`);
  },
  
  getPositions: async () => {
    return apiService.get(API_ENDPOINTS.TRADING.POSITIONS);
  },
  
  getHoldings: async () => {
    return apiService.get(API_ENDPOINTS.TRADING.HOLDINGS);
  },
};

// Portfolio API
export const portfolioAPI = {
  getOverview: async () => {
    return apiService.get(API_ENDPOINTS.PORTFOLIO.OVERVIEW);
  },
  
  getPerformance: async (period?: string) => {
    return apiService.get(`${API_ENDPOINTS.PORTFOLIO.PERFORMANCE}?period=${period || '1M'}`);
  },
  
  getAllocation: async () => {
    return apiService.get(API_ENDPOINTS.PORTFOLIO.ALLOCATION);
  },
  
  getAnalytics: async () => {
    return apiService.get(API_ENDPOINTS.PORTFOLIO.ANALYTICS);
  },
};

// AI Engine API
export const aiAPI = {
  getPredictions: async (symbols: string[]) => {
    return apiService.post(API_ENDPOINTS.AI.PREDICTIONS, { symbols });
  },
  
  getStrategies: async () => {
    return apiService.get(API_ENDPOINTS.AI.STRATEGIES);
  },
  
  backtest: async (strategy: any, period: string) => {
    return apiService.post(API_ENDPOINTS.AI.BACKTEST, { strategy, period });
  },
  
  optimizeStrategy: async (strategyId: string, parameters: any) => {
    return apiService.post(API_ENDPOINTS.AI.OPTIMIZE, { strategy_id: strategyId, parameters });
  },
  
  trainModel: async (modelConfig: any) => {
    return apiService.post(API_ENDPOINTS.AI.TRAIN, modelConfig);
  },
  
  getSentiment: async (symbol: string) => {
    return apiService.get(`${API_ENDPOINTS.AI.SENTIMENT}?symbol=${symbol}`);
  },
};

// Broker API
export const brokerAPI = {
  connect: async (brokerData: any) => {
    return apiService.post(API_ENDPOINTS.BROKER.CONNECT, brokerData);
  },
  
  disconnect: async (brokerId: string) => {
    return apiService.delete(`${API_ENDPOINTS.BROKER.DISCONNECT}/${brokerId}`);
  },
  
  getStatus: async () => {
    return apiService.get(API_ENDPOINTS.BROKER.STATUS);
  },
  
  getAccounts: async () => {
    return apiService.get(API_ENDPOINTS.BROKER.ACCOUNTS);
  },
  
  syncData: async (brokerId: string) => {
    return apiService.post(`${API_ENDPOINTS.BROKER.SYNC}/${brokerId}`);
  },
};

// News API
export const newsAPI = {
  getLatest: async (limit?: number) => {
    return apiService.get(`${API_ENDPOINTS.NEWS.LATEST}?limit=${limit || 20}`);
  },
  
  search: async (query: string, limit?: number) => {
    return apiService.get(`${API_ENDPOINTS.NEWS.SEARCH}?q=${query}&limit=${limit || 20}`);
  },
  
  getSentiment: async (symbol: string) => {
    return apiService.get(`${API_ENDPOINTS.NEWS.SENTIMENT}?symbol=${symbol}`);
  },
  
  getAnalysis: async (symbol: string) => {
    return apiService.get(`${API_ENDPOINTS.NEWS.ANALYSIS}?symbol=${symbol}`);
  },
};

// Paper Trading API
export const paperAPI = {
  getAccount: async () => {
    return apiService.get(API_ENDPOINTS.PAPER.ACCOUNT);
  },
  
  getOrders: async () => {
    return apiService.get(API_ENDPOINTS.PAPER.ORDERS);
  },
  
  getPositions: async () => {
    return apiService.get(API_ENDPOINTS.PAPER.POSITIONS);
  },
  
  getHistory: async () => {
    return apiService.get(API_ENDPOINTS.PAPER.HISTORY);
  },
  
  resetAccount: async () => {
    return apiService.post(API_ENDPOINTS.PAPER.RESET);
  },
};

// Wallet API
export const walletAPI = {
  getBalance: async () => {
    return apiService.get(API_ENDPOINTS.WALLET.BALANCE);
  },
  
  getTransactions: async (limit?: number) => {
    return apiService.get(`${API_ENDPOINTS.WALLET.TRANSACTIONS}?limit=${limit || 50}`);
  },
  
  deposit: async (amount: number, method: string) => {
    return apiService.post(API_ENDPOINTS.WALLET.DEPOSIT, { amount, method });
  },
  
  withdraw: async (amount: number, method: string) => {
    return apiService.post(API_ENDPOINTS.WALLET.WITHDRAW, { amount, method });
  },
  
  transfer: async (recipient: string, amount: number) => {
    return apiService.post(API_ENDPOINTS.WALLET.TRANSFER, { recipient, amount });
  },
};

// Settings API
export const settingsAPI = {
  getUserSettings: async () => {
    return apiService.get(API_ENDPOINTS.SETTINGS.USER);
  },
  
  updateUserSettings: async (settings: any) => {
    return apiService.put(API_ENDPOINTS.SETTINGS.USER, settings);
  },
  
  getTradingSettings: async () => {
    return apiService.get(API_ENDPOINTS.SETTINGS.TRADING);
  },
  
  updateTradingSettings: async (settings: any) => {
    return apiService.put(API_ENDPOINTS.SETTINGS.TRADING, settings);
  },
  
  getNotificationSettings: async () => {
    return apiService.get(API_ENDPOINTS.SETTINGS.NOTIFICATIONS);
  },
  
  updateNotificationSettings: async (settings: any) => {
    return apiService.put(API_ENDPOINTS.SETTINGS.NOTIFICATIONS, settings);
  },
};

export default apiService;
