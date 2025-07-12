import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// Live API Configuration - Real endpoints only
const API_CONFIG = {
  ANGEL_ONE: {
    BASE_URL: 'https://apiconnect.angelbroking.com',
    LOGIN_URL: 'https://smartapi.angelbroking.com/publisher-login',
    WS_URL: 'wss://smartapisocket.angelone.in/smart-stream'
  },
  BINANCE: {
    REST_URL: 'https://api.binance.com/api/v3',
    WS_URL: 'wss://stream.binance.com:9443/ws'
  },
  ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query'
  },
  NEWS_API: {
    BASE_URL: 'https://newsapi.org/v2'
  },
  LOCAL_BACKEND: 'http://localhost:8000'
};

export interface LiveTick {
  symbol: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  chng: number;
  chng_percent: number;
  timestamp: string;
}

export interface OrderData {
  order_id: string;
  symbol: string;
  quantity: number;
  price: number;
  order_type: 'BUY' | 'SELL';
  order_status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  timestamp: string;
}

export interface AISignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  target_price: number;
  stop_loss: number;
  timestamp: string;
  reasoning: string;
}

export interface PortfolioData {
  total_value: number;
  available_cash: number;
  unrealized_pnl: number;
  realized_pnl: number;
  day_pnl: number;
  positions: Position[];
}

export interface Position {
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  pnl: number;
  pnl_percent: number;
  side: 'LONG' | 'SHORT';
}

export interface NewsItem {
  title: string;
  description: string;
  source: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentiment_score: number;
  timestamp: string;
  impact_score: number;
}

export class LiveDataService {
  private angelOneWS: WebSocket | null = null;
  private binanceWS: WebSocket | null = null;
  private socket: Socket | null = null;
  private subscribers: Map<string, Set<Function>> = new Map();
  private authToken: string | null = null;

  constructor() {
    this.initializeConnections();
  }

  private initializeConnections() {
    // Initialize Socket.IO connection for backend communication
    this.socket = io(API_CONFIG.LOCAL_BACKEND, {
      transports: ['websocket'],
      autoConnect: false
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to backend WebSocket');
    });

    this.socket.on('market_tick', (data: LiveTick) => {
      this.notifySubscribers('market_tick', data);
    });

    this.socket.on('order_update', (data: OrderData) => {
      this.notifySubscribers('order_update', data);
    });

    this.socket.on('ai_signal', (data: AISignal) => {
      this.notifySubscribers('ai_signal', data);
    });

    this.socket.on('portfolio_update', (data: PortfolioData) => {
      this.notifySubscribers('portfolio_update', data);
    });
  }

  // Angel One Authentication (OAuth Integration)
  async authenticateAngelOne(clientId: string, password: string, totp: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_CONFIG.ANGEL_ONE.BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`, {
        clientcode: clientId,
        password: password,
        totp: totp
      });

      if (response.data && response.data.data && response.data.data.jwtToken) {
        const token = response.data.data.jwtToken;
        this.authToken = token;
        if (token) {
          localStorage.setItem('angel_one_token', token);
        }
        this.connectWebSockets();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Angel One authentication failed:', error);
      return false;
    }
  }

  private connectWebSockets() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  // Public method to connect all services
  connect() {
    try {
      // Connect WebSocket to backend
      this.connectWebSockets();
      
      console.log('✅ LiveDataService connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect LiveDataService:', error);
      return false;
    }
  }

  // Subscribe to live data events
  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);
  }

  unsubscribe(event: string, callback: Function) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event)!.delete(callback);
    }
  }

  private notifySubscribers(event: string, data: any) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event)!.forEach(callback => callback(data));
    }
  }

  // Live Portfolio Data
  async getPortfolio(): Promise<PortfolioData> {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/portfolio`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      throw error;
    }
  }

  // Live Market Data
  async getMarketData(symbols: string[]): Promise<LiveTick[]> {
    try {
      const response = await axios.post(`${API_CONFIG.LOCAL_BACKEND}/api/market/live`, {
        symbols
      }, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      throw error;
    }
  }

  // Place Orders
  async placeOrder(orderData: {
    symbol: string;
    quantity: number;
    price: number;
    order_type: 'BUY' | 'SELL';
    order_variety: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  }) {
    try {
      const response = await axios.post(`${API_CONFIG.LOCAL_BACKEND}/api/orders/place`, orderData, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to place order:', error);
      throw error;
    }
  }

  // Get AI Signals
  async getAISignals(): Promise<AISignal[]> {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/ai/signals`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch AI signals:', error);
      throw error;
    }
  }

  // Get Trade History
  async getTradeHistory(limit: number = 100): Promise<OrderData[]> {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/trades/history?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trade history:', error);
      throw error;
    }
  }

  // Get News Feed
  async getNewsFeed(limit: number = 20): Promise<NewsItem[]> {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/news/feed?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch news feed:', error);
      throw error;
    }
  }

  // Bot Control
  async getBotStatus() {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/bot/status`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bot status:', error);
      throw error;
    }
  }

  async controlBot(action: 'START' | 'STOP' | 'PAUSE' | 'RESUME') {
    try {
      const response = await axios.post(`${API_CONFIG.LOCAL_BACKEND}/api/bot/control`, {
        action
      }, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to control bot:', error);
      throw error;
    }
  }

  // Stock and Crypto Price Methods
  async getStockPrice(symbol: string) {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/stocks/${symbol}/price`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stock price for ${symbol}:`, error);
      throw error;
    }
  }

  async getCryptoPrice(symbol: string) {
    try {
      const response = await axios.get(`${API_CONFIG.BINANCE.REST_URL}/ticker/24hr?symbol=${symbol}`);
      return {
        price: parseFloat(response.data.lastPrice),
        change24h: parseFloat(response.data.priceChange),
        changePercent24h: parseFloat(response.data.priceChangePercent),
        volume24h: parseFloat(response.data.volume),
        marketCap: parseFloat(response.data.lastPrice) * parseFloat(response.data.volume)
      };
    } catch (error) {
      console.error(`Failed to fetch crypto price for ${symbol}:`, error);
      throw error;
    }
  }

  // Trade Logs
  async getTradeLogs() {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/trades`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trade logs:', error);
      throw error;
    }
  }

  // Strategy Management
  async getStrategies() {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/strategies`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      throw error;
    }
  }

  async createStrategy(strategy: any) {
    try {
      const response = await axios.post(`${API_CONFIG.LOCAL_BACKEND}/api/strategies`, strategy, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create strategy:', error);
      throw error;
    }
  }

  async updateStrategyStatus(strategyId: string, status: string) {
    try {
      const response = await axios.patch(`${API_CONFIG.LOCAL_BACKEND}/api/strategies/${strategyId}/status`, {
        status
      }, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update strategy status:', error);
      throw error;
    }
  }

  async runBacktest(strategyId: string) {
    try {
      const response = await axios.post(`${API_CONFIG.LOCAL_BACKEND}/api/strategies/${strategyId}/backtest`, {}, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to run backtest:', error);
      throw error;
    }
  }

  // AI Models Management
  async getAIModels() {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/ai/models`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch AI models:', error);
      throw error;
    }
  }

  async getTrainingMetrics(modelId: string) {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/ai/models/${modelId}/metrics`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch training metrics:', error);
      throw error;
    }
  }

  async getTrainingLogs(modelId: string) {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/ai/models/${modelId}/logs`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch training logs:', error);
      throw error;
    }
  }

  async startTraining(modelId: string) {
    try {
      const response = await axios.post(`${API_CONFIG.LOCAL_BACKEND}/api/ai/models/${modelId}/train`, {}, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to start training:', error);
      throw error;
    }
  }

  async pauseTraining(modelId: string) {
    try {
      const response = await axios.post(`${API_CONFIG.LOCAL_BACKEND}/api/ai/models/${modelId}/pause`, {}, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to pause training:', error);
      throw error;
    }
  }

  async deployModel(modelId: string) {
    try {
      const response = await axios.post(`${API_CONFIG.LOCAL_BACKEND}/api/ai/models/${modelId}/deploy`, {}, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to deploy model:', error);
      throw error;
    }
  }

  // User Profile and Settings
  async getUserProfile() {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(profile: any) {
    try {
      const response = await axios.put(`${API_CONFIG.LOCAL_BACKEND}/api/user/profile`, profile, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async getTradingSettings() {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/user/trading-settings`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trading settings:', error);
      throw error;
    }
  }

  async updateTradingSettings(settings: any) {
    try {
      const response = await axios.put(`${API_CONFIG.LOCAL_BACKEND}/api/user/trading-settings`, settings, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update trading settings:', error);
      throw error;
    }
  }

  async getNotificationSettings() {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/user/notification-settings`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      throw error;
    }
  }

  async updateNotificationSettings(settings: any) {
    try {
      const response = await axios.put(`${API_CONFIG.LOCAL_BACKEND}/api/user/notification-settings`, settings, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }

  async getAPICredentials() {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/user/api-credentials`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API credentials:', error);
      throw error;
    }
  }

  async addAPICredential(credential: any) {
    try {
      const response = await axios.post(`${API_CONFIG.LOCAL_BACKEND}/api/user/api-credentials`, credential, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add API credential:', error);
      throw error;
    }
  }

  async removeAPICredential(id: string) {
    try {
      const response = await axios.delete(`${API_CONFIG.LOCAL_BACKEND}/api/user/api-credentials/${id}`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to remove API credential:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await axios.post(`${API_CONFIG.LOCAL_BACKEND}/api/user/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }

  // Sentiment Analysis
  async getSentimentData() {
    try {
      const response = await axios.get(`${API_CONFIG.LOCAL_BACKEND}/api/sentiment`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sentiment data:', error);
      throw error;
    }
  }

  subscribeToSentiment(callback: (sentiment: any) => void) {
    this.subscribe('new_sentiment', callback);
    
    // Start WebSocket subscription for sentiment
    if (this.socket) {
      this.socket.on('new_sentiment', (sentiment) => {
        this.notifySubscribers('new_sentiment', sentiment);
      });
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe('new_sentiment', callback);
    };
  }

  subscribeToTrades(callback: (trade: any) => void) {
    this.subscribe('trade_update', callback);
    
    // Start WebSocket subscription for trades
    if (this.socket) {
      this.socket.on('trade_update', (trade) => {
        this.notifySubscribers('trade_update', trade);
      });
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe('trade_update', callback);
    };
  }

  subscribeToStockPrice(symbol: string, callback: (data: any) => void) {
    this.subscribe(`stock_${symbol}`, callback);
    
    // Start WebSocket subscription for specific stock
    if (this.socket) {
      this.socket.emit('subscribe_stock', symbol);
      this.socket.on(`stock_${symbol}`, (data) => {
        this.notifySubscribers(`stock_${symbol}`, data);
      });
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(`stock_${symbol}`, callback);
      if (this.socket) {
        this.socket.emit('unsubscribe_stock', symbol);
      }
    };
  }

  subscribeToCryptoPrice(symbol: string, callback: (data: any) => void) {
    this.subscribe(`crypto_${symbol}`, callback);
    
    // Start WebSocket subscription for specific crypto
    if (this.socket) {
      this.socket.emit('subscribe_crypto', symbol);
      this.socket.on(`crypto_${symbol}`, (data) => {
        this.notifySubscribers(`crypto_${symbol}`, data);
      });
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(`crypto_${symbol}`, callback);
      if (this.socket) {
        this.socket.emit('unsubscribe_crypto', symbol);
      }
    };
  }

  unsubscribeAll() {
    this.subscribers.clear();
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Disconnect all connections
  disconnect() {
    try {
      // Disconnect Socket.IO
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // Disconnect Angel One WebSocket
      if (this.angelOneWS) {
        this.angelOneWS.close();
        this.angelOneWS = null;
      }

      // Disconnect Binance WebSocket
      if (this.binanceWS) {
        this.binanceWS.close();
        this.binanceWS = null;
      }

      // Clear subscribers
      this.subscribers.clear();

      // Clear auth token
      this.authToken = null;
      localStorage.removeItem('angel_one_token');

      console.log('✅ All connections disconnected');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }
}

export const liveDataService = new LiveDataService();
