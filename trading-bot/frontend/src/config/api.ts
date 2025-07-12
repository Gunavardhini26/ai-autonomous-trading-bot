// API Configuration for AI Trading Bot
// This file centralizes all API endpoints and configurations

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// API Base URLs
export const API_CONFIG = {
  BASE_URL: isDevelopment 
    ? 'http://localhost:8000/api' 
    : process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  
  WS_URL: isDevelopment 
    ? 'ws://localhost:8000/ws' 
    : process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws',
  
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  // Market Data
  MARKET: {
    LIVE_PRICES: '/market/live-prices',
    HISTORICAL_DATA: '/market/historical',
    WATCHLIST: '/market/watchlist',
    SECTORS: '/market/sectors',
    INDICES: '/market/indices',
    FUTURES: '/market/futures',
    OPTIONS: '/market/options',
    CRYPTO: '/market/crypto',
    COMMODITIES: '/market/commodities',
  },
  
  // Trading
  TRADING: {
    PLACE_ORDER: '/trading/place-order',
    CANCEL_ORDER: '/trading/cancel-order',
    MODIFY_ORDER: '/trading/modify-order',
    ORDER_HISTORY: '/trading/order-history',
    TRADE_HISTORY: '/trading/trade-history',
    POSITIONS: '/trading/positions',
    HOLDINGS: '/trading/holdings',
  },
  
  // Portfolio
  PORTFOLIO: {
    OVERVIEW: '/portfolio/overview',
    PERFORMANCE: '/portfolio/performance',
    ALLOCATION: '/portfolio/allocation',
    ANALYTICS: '/portfolio/analytics',
    REPORTS: '/portfolio/reports',
  },
  
  // AI Engine
  AI: {
    PREDICTIONS: '/ai/predictions',
    STRATEGIES: '/ai/strategies',
    BACKTEST: '/ai/backtest',
    OPTIMIZE: '/ai/optimize',
    TRAIN: '/ai/train',
    MODELS: '/ai/models',
    SENTIMENT: '/ai/sentiment',
  },
  
  // Broker Management
  BROKER: {
    CONNECT: '/broker/connect',
    DISCONNECT: '/broker/disconnect',
    STATUS: '/broker/status',
    ACCOUNTS: '/broker/accounts',
    SYNC: '/broker/sync',
  },
  
  // News & Sentiment
  NEWS: {
    LATEST: '/news/latest',
    SEARCH: '/news/search',
    SENTIMENT: '/news/sentiment',
    ANALYSIS: '/news/analysis',
  },
  
  // Settings
  SETTINGS: {
    USER: '/settings/user',
    TRADING: '/settings/trading',
    NOTIFICATIONS: '/settings/notifications',
    SECURITY: '/settings/security',
    EXPORT: '/settings/export',
    IMPORT: '/settings/import',
  },
  
  // Paper Trading
  PAPER: {
    ACCOUNT: '/paper/account',
    ORDERS: '/paper/orders',
    POSITIONS: '/paper/positions',
    HISTORY: '/paper/history',
    RESET: '/paper/reset',
  },
  
  // Wallet
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    DEPOSIT: '/wallet/deposit',
    WITHDRAW: '/wallet/withdraw',
    TRANSFER: '/wallet/transfer',
  },
};

// WebSocket Event Types
export const WS_EVENTS = {
  MARKET_DATA: 'market_data',
  ORDER_UPDATE: 'order_update',
  POSITION_UPDATE: 'position_update',
  ACCOUNT_UPDATE: 'account_update',
  NEWS_UPDATE: 'news_update',
  AI_SIGNAL: 'ai_signal',
  SYSTEM_STATUS: 'system_status',
  ERROR: 'error',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  BROKER_ERROR: 'Broker connection error. Please check your credentials.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction.',
  ORDER_FAILED: 'Order placement failed. Please try again.',
};

export default API_CONFIG;
