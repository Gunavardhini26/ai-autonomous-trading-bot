import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
  
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
};

// Market API
export const marketAPI = {
  getLiveData: async (symbols: string[]) => {
    const response = await apiClient.post('/market/live-data', { symbols });
    return response.data;
  },
  
  getHistoricalData: async (symbol: string, interval: string, period: string) => {
    const response = await apiClient.get(`/market/historical/${symbol}`, {
      params: { interval, period }
    });
    return response.data;
  },
  
  getTechnicalIndicators: async (symbol: string) => {
    const response = await apiClient.get(`/market/indicators/${symbol}`);
    return response.data;
  },
  
  searchSymbols: async (query: string) => {
    const response = await apiClient.get('/market/search', {
      params: { query }
    });
    return response.data;
  },
  
  addToWatchlist: async (symbol: string) => {
    const response = await apiClient.post('/market/watchlist', { symbol });
    return response.data;
  },
  
  removeFromWatchlist: async (symbol: string) => {
    const response = await apiClient.delete(`/market/watchlist/${symbol}`);
    return response.data;
  },
  
  getWatchlist: async () => {
    const response = await apiClient.get('/market/watchlist');
    return response.data;
  },
};

// Trading API
export const tradingAPI = {
  getPositions: async () => {
    const response = await apiClient.get('/trading/positions');
    return response.data;
  },
  
  getTrades: async () => {
    const response = await apiClient.get('/trading/trades');
    return response.data;
  },
  
  getPortfolio: async () => {
    const response = await apiClient.get('/trading/portfolio');
    return response.data;
  },
  
  placeTrade: async (tradeData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    order_type: 'MARKET' | 'LIMIT';
    price?: number;
  }) => {
    const response = await apiClient.post('/trading/place-order', tradeData);
    return response.data;
  },
  
  closePosition: async (positionId: string) => {
    const response = await apiClient.post(`/trading/close-position/${positionId}`);
    return response.data;
  },
  
  setAutoTrading: async (enabled: boolean) => {
    const response = await apiClient.post('/trading/auto-trading', { enabled });
    return response.data;
  },
  
  getAutoTradingStatus: async () => {
    const response = await apiClient.get('/trading/auto-trading/status');
    return response.data;
  },
};

// AI API
export const aiAPI = {
  getSignals: async (symbol?: string) => {
    const response = await apiClient.get('/ai/signals', {
      params: symbol ? { symbol } : {}
    });
    return response.data;
  },
  
  getModelPerformance: async () => {
    const response = await apiClient.get('/ai/model-performance');
    return response.data;
  },
  
  trainLSTMModel: async (symbol: string) => {
    const response = await apiClient.post('/ai/train-lstm', { symbol });
    return response.data;
  },
  
  trainRLAgent: async (symbol: string) => {
    const response = await apiClient.post('/ai/train-rl', { symbol });
    return response.data;
  },
  
  generatePrediction: async (data: { symbol: string; model_type: 'LSTM' | 'RL' }) => {
    const response = await apiClient.post('/ai/predict', data);
    return response.data;
  },
  
  updateSettings: async (settings: { lstm_enabled: boolean; rl_enabled: boolean }) => {
    const response = await apiClient.post('/ai/settings', settings);
    return response.data;
  },
  
  getModelStatus: async () => {
    const response = await apiClient.get('/ai/model-status');
    return response.data;
  },
};

// News API
export const newsAPI = {
  getNews: async (params?: { symbol?: string; limit?: number }) => {
    const response = await apiClient.get('/news', { params });
    return response.data;
  },
  
  analyzeSentiment: async (articleId: string) => {
    const response = await apiClient.post(`/news/analyze-sentiment/${articleId}`);
    return response.data;
  },
  
  getSentimentAnalysis: async (symbol?: string) => {
    const response = await apiClient.get('/news/sentiment', {
      params: symbol ? { symbol } : {}
    });
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  getUserSettings: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },
  
  updateUserSettings: async (settings: any) => {
    const response = await apiClient.put('/settings', settings);
    return response.data;
  },
  
  resetSettings: async () => {
    const response = await apiClient.delete('/settings');
    return response.data;
  },
};

export default apiClient;
