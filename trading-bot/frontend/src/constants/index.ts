// Constants for AI Trading Bot
// Central location for all application constants

// Application Constants
export const APP_NAME = 'AI Trading Bot';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Lightning-fast AI-powered trading platform for Indian stock market';

// API Constants
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
export const API_TIMEOUT = 30000;
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000;

// Authentication Constants
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_DATA_KEY = 'user_data';
export const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

// Market Constants
export const MARKET_HOURS = {
  OPEN: { hour: 9, minute: 15 },
  CLOSE: { hour: 15, minute: 30 },
  PRE_OPEN: { hour: 9, minute: 0 },
  AFTER_HOURS: { hour: 16, minute: 0 }
};

export const MARKET_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday

export const DEFAULT_SYMBOLS = [
  'NIFTY50',
  'BANKNIFTY',
  'RELIANCE',
  'TCS',
  'HDFCBANK',
  'INFY',
  'HINDUNILVR',
  'ITC',
  'SBIN',
  'BHARTIARTL'
];

export const INDICES = [
  { symbol: 'NIFTY50', name: 'NIFTY 50' },
  { symbol: 'BANKNIFTY', name: 'BANK NIFTY' },
  { symbol: 'FINNIFTY', name: 'FIN NIFTY' },
  { symbol: 'MIDCPNIFTY', name: 'MIDCAP NIFTY' },
  { symbol: 'SENSEX', name: 'SENSEX' },
  { symbol: 'BANKEX', name: 'BANKEX' }
];

// Trading Constants
export const ORDER_TYPES = [
  { value: 'market', label: 'Market' },
  { value: 'limit', label: 'Limit' },
  { value: 'stop_loss', label: 'Stop Loss' },
  { value: 'stop_loss_limit', label: 'Stop Loss Limit' }
];

export const PRODUCT_TYPES = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'intraday', label: 'Intraday' },
  { value: 'margin', label: 'Margin' }
];

export const ORDER_VALIDITY = [
  { value: 'day', label: 'Day' },
  { value: 'gtc', label: 'GTC' },
  { value: 'ioc', label: 'IOC' }
];

export const SEGMENTS = [
  { value: 'equity', label: 'Equity', color: '#3B82F6' },
  { value: 'futures', label: 'Futures', color: '#F59E0B' },
  { value: 'options', label: 'Options', color: '#8B5CF6' },
  { value: 'crypto', label: 'Crypto', color: '#10B981' },
  { value: 'commodities', label: 'Commodities', color: '#EF4444' }
];

export const EXCHANGES = [
  { value: 'NSE', label: 'NSE' },
  { value: 'BSE', label: 'BSE' },
  { value: 'MCX', label: 'MCX' },
  { value: 'NCDEX', label: 'NCDEX' }
];

// Broker Constants
export const SUPPORTED_BROKERS = [
  {
    id: 'angel_one',
    name: 'Angel One',
    logo: '/assets/brokers/angel-one.png',
    segments: ['equity', 'futures', 'options', 'commodities'],
    features: ['Real-time data', 'Auto-trading', 'Options chain'],
    commission: 0.03
  },
  {
    id: 'zerodha',
    name: 'Zerodha',
    logo: '/assets/brokers/zerodha.png',
    segments: ['equity', 'futures', 'options', 'commodities'],
    features: ['Real-time data', 'Auto-trading', 'Options chain'],
    commission: 0.03
  },
  {
    id: 'upstox',
    name: 'Upstox',
    logo: '/assets/brokers/upstox.png',
    segments: ['equity', 'futures', 'options'],
    features: ['Real-time data', 'Auto-trading'],
    commission: 0.02
  },
  {
    id: 'binance',
    name: 'Binance',
    logo: '/assets/brokers/binance.png',
    segments: ['crypto'],
    features: ['Real-time data', 'Auto-trading', 'Spot & Futures'],
    commission: 0.1
  }
];

// Chart Constants
export const CHART_INTERVALS = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
  { value: '1M', label: '1M' }
];

export const CHART_TYPES = [
  { value: 'candlestick', label: 'Candlestick' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'bar', label: 'Bar' }
];

export const TECHNICAL_INDICATORS = [
  { value: 'sma', label: 'SMA', category: 'Moving Averages' },
  { value: 'ema', label: 'EMA', category: 'Moving Averages' },
  { value: 'rsi', label: 'RSI', category: 'Momentum' },
  { value: 'macd', label: 'MACD', category: 'Momentum' },
  { value: 'bollinger', label: 'Bollinger Bands', category: 'Volatility' },
  { value: 'stochastic', label: 'Stochastic', category: 'Momentum' },
  { value: 'atr', label: 'ATR', category: 'Volatility' },
  { value: 'volume', label: 'Volume', category: 'Volume' }
];

// AI & Strategy Constants
export const STRATEGY_TYPES = [
  { value: 'momentum', label: 'Momentum', description: 'Trend following strategy' },
  { value: 'mean_reversion', label: 'Mean Reversion', description: 'Counter-trend strategy' },
  { value: 'breakout', label: 'Breakout', description: 'Price breakout strategy' },
  { value: 'arbitrage', label: 'Arbitrage', description: 'Risk-free profit strategy' },
  { value: 'ml_based', label: 'ML Based', description: 'Machine learning strategy' },
  { value: 'sentiment_based', label: 'Sentiment Based', description: 'News sentiment strategy' }
];

export const RISK_LEVELS = [
  { value: 'low', label: 'Low', color: 'green', maxRisk: 2 },
  { value: 'medium', label: 'Medium', color: 'yellow', maxRisk: 5 },
  { value: 'high', label: 'High', color: 'red', maxRisk: 10 }
];

export const BACKTESTING_PERIODS = [
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '1Y', label: '1 Year' },
  { value: '2Y', label: '2 Years' },
  { value: '5Y', label: '5 Years' }
];

// Theme Constants
export const THEMES = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'alert', label: 'Alert', icon: 'alert-triangle' }
];

export const THEME_COLORS = {
  light: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    text: '#1f2937',
    accent: '#e11d48',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#e2e8f0'
  },
  dark: {
    primary: '#111827',
    secondary: '#1f2937',
    tertiary: '#374151',
    text: '#f9fafb',
    accent: '#e11d48',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#4b5563'
  },
  alert: {
    primary: '#1e0b0b',
    secondary: '#2d1212',
    tertiary: '#3d1818',
    text: '#ffebeb',
    accent: '#ff1f3d',
    success: '#ff6b6b',
    warning: '#ff8e53',
    error: '#ff4757',
    border: '#ff6b6b'
  }
};

// Notification Constants
export const NOTIFICATION_TYPES = [
  { value: 'price', label: 'Price Alerts', icon: 'trending-up' },
  { value: 'volume', label: 'Volume Alerts', icon: 'bar-chart' },
  { value: 'news', label: 'News Updates', icon: 'newspaper' },
  { value: 'technical', label: 'Technical Signals', icon: 'activity' },
  { value: 'ai_signal', label: 'AI Signals', icon: 'brain' },
  { value: 'risk', label: 'Risk Alerts', icon: 'alert-triangle' },
  { value: 'system', label: 'System Updates', icon: 'settings' }
];

export const ALERT_SEVERITIES = [
  { value: 'low', label: 'Low', color: 'blue' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' }
];

// UI Constants
export const SIDEBAR_WIDTH = 280;
export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;
export const DESKTOP_BREAKPOINT = 1280;

export const PAGINATION_SIZES = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;

export const ANIMATION_DURATION = 300;
export const DEBOUNCE_DELAY = 500;
export const THROTTLE_DELAY = 100;

// Data Refresh Intervals
export const REFRESH_INTERVALS = {
  MARKET_DATA: 1000,        // 1 second
  PORTFOLIO: 5000,          // 5 seconds
  ORDER_STATUS: 2000,       // 2 seconds
  NEWS: 30000,              // 30 seconds
  SENTIMENT: 60000,         // 1 minute
  AI_SIGNALS: 10000,        // 10 seconds
  SYSTEM_STATUS: 30000      // 30 seconds
};

// File Upload Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/json',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Validation Constants
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  SYMBOL: /^[A-Z0-9]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

export const INPUT_LIMITS = {
  SYMBOL_LENGTH: { min: 1, max: 20 },
  QUANTITY: { min: 1, max: 100000000 },
  PRICE: { min: 0.01, max: 100000000 },
  WATCHLIST_SIZE: 50,
  STRATEGY_NAME: { min: 3, max: 50 },
  DESCRIPTION: { min: 10, max: 500 }
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
  SYMBOL_NOT_FOUND: 'Symbol not found. Please check the symbol name.',
  INVALID_QUANTITY: 'Invalid quantity. Please enter a valid number.',
  INVALID_PRICE: 'Invalid price. Please enter a valid price.',
  MARKET_CLOSED: 'Market is closed. Order will be placed when market opens.',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit of 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a valid file.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number and special character.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_CANCELLED: 'Order cancelled successfully!',
  ORDER_MODIFIED: 'Order modified successfully!',
  BROKER_CONNECTED: 'Broker connected successfully!',
  BROKER_DISCONNECTED: 'Broker disconnected successfully!',
  STRATEGY_CREATED: 'Strategy created successfully!',
  STRATEGY_UPDATED: 'Strategy updated successfully!',
  STRATEGY_DELETED: 'Strategy deleted successfully!',
  WATCHLIST_UPDATED: 'Watchlist updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  DATA_EXPORTED: 'Data exported successfully!',
  BACKUP_CREATED: 'Backup created successfully!',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully!'
};

// Feature Flags
export const FEATURE_FLAGS = {
  PAPER_TRADING: true,
  CRYPTO_TRADING: true,
  OPTIONS_TRADING: true,
  ALGO_TRADING: true,
  SOCIAL_TRADING: false,
  ADVANCED_CHARTS: true,
  AI_PREDICTIONS: true,
  SENTIMENT_ANALYSIS: true,
  NEWS_FEED: true,
  PORTFOLIO_ANALYTICS: true,
  RISK_MANAGEMENT: true,
  BACKTESTING: true,
  STRATEGY_BUILDER: true,
  MOBILE_TRADING: true,
  VOICE_COMMANDS: false,
  DARK_POOLS: false,
  LEVEL_2_DATA: false
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic market data',
      'Limited strategies',
      'Basic analytics',
      'Email support'
    ],
    limits: {
      strategies: 3,
      watchlistItems: 25,
      backtestPeriod: '3M',
      apiCallsPerDay: 1000,
      realTimeData: false
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 999,
    features: [
      'Real-time market data',
      'Unlimited strategies',
      'Advanced analytics',
      'Priority support',
      'Mobile app'
    ],
    limits: {
      strategies: 10,
      watchlistItems: 100,
      backtestPeriod: '1Y',
      apiCallsPerDay: 10000,
      realTimeData: true
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2999,
    features: [
      'All Basic features',
      'AI predictions',
      'Advanced strategies',
      'Portfolio optimization',
      'Risk management',
      'Priority support'
    ],
    limits: {
      strategies: 50,
      watchlistItems: 500,
      backtestPeriod: '5Y',
      apiCallsPerDay: 100000,
      realTimeData: true
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999,
    features: [
      'All Premium features',
      'Custom strategies',
      'Dedicated support',
      'API access',
      'White-label solution',
      'Custom integrations'
    ],
    limits: {
      strategies: -1, // Unlimited
      watchlistItems: -1, // Unlimited
      backtestPeriod: '10Y',
      apiCallsPerDay: -1, // Unlimited
      realTimeData: true
    }
  }
];

// Export default object with all constants
export default {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  API_BASE_URL,
  WS_BASE_URL,
  API_TIMEOUT,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_DATA_KEY,
  SESSION_TIMEOUT,
  MARKET_HOURS,
  MARKET_DAYS,
  DEFAULT_SYMBOLS,
  INDICES,
  ORDER_TYPES,
  PRODUCT_TYPES,
  ORDER_VALIDITY,
  SEGMENTS,
  EXCHANGES,
  SUPPORTED_BROKERS,
  CHART_INTERVALS,
  CHART_TYPES,
  TECHNICAL_INDICATORS,
  STRATEGY_TYPES,
  RISK_LEVELS,
  BACKTESTING_PERIODS,
  THEMES,
  THEME_COLORS,
  NOTIFICATION_TYPES,
  ALERT_SEVERITIES,
  SIDEBAR_WIDTH,
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  DESKTOP_BREAKPOINT,
  PAGINATION_SIZES,
  DEFAULT_PAGE_SIZE,
  ANIMATION_DURATION,
  DEBOUNCE_DELAY,
  THROTTLE_DELAY,
  REFRESH_INTERVALS,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  VALIDATION_RULES,
  INPUT_LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  SUBSCRIPTION_PLANS
};
