// Type definitions for AI Trading Bot
// Comprehensive type system for the entire application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  country: string;
  timezone: string;
  connectedBrokers: BrokerConnection[];
  settings: UserSettings;
  subscription: SubscriptionPlan;
  createdAt: string;
  updatedAt: string;
}

export interface BrokerConnection {
  id: string;
  broker: BrokerType;
  status: BrokerStatus;
  segments: TradingSegment[];
  lastUpdated: string;
  isDefault: boolean;
  credentials: BrokerCredentials;
  limits: BrokerLimits;
}

export type BrokerType = 'angel_one' | 'zerodha' | 'binance' | 'upstox' | 'groww' | 'paytm_money';
export type BrokerStatus = 'connected' | 'expired' | 'invalid' | 'connecting' | 'disconnected';
export type TradingSegment = 'equity' | 'futures' | 'options' | 'crypto' | 'commodities' | 'forex';

export interface BrokerCredentials {
  apiKey: string;
  secret: string;
  clientCode?: string;
  userId?: string;
  totp?: string;
  pin?: string;
}

export interface BrokerLimits {
  maxOrderValue: number;
  maxOrdersPerDay: number;
  maxPositions: number;
  allowedSegments: TradingSegment[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'alert';
  language: string;
  currency: string;
  notifications: NotificationSettings;
  trading: TradingSettings;
  security: SecuritySettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  orderUpdates: boolean;
  priceAlerts: boolean;
  newsUpdates: boolean;
  aiSignals: boolean;
}

export interface TradingSettings {
  defaultOrderType: OrderType;
  defaultProductType: ProductType;
  riskManagement: RiskManagementSettings;
  autoTrade: boolean;
  paperTrading: boolean;
  maxRiskPerTrade: number;
  maxDailyLoss: number;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  allowedIPs: string[];
  loginAlerts: boolean;
}

export interface RiskManagementSettings {
  enabled: boolean;
  maxPositionSize: number;
  maxLeverage: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
}

export interface SubscriptionPlan {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  validUntil: string;
  features: string[];
  limits: PlanLimits;
}

export interface PlanLimits {
  maxStrategies: number;
  maxWatchlistItems: number;
  maxBacktestPeriod: number;
  apiCallsPerDay: number;
  realTimeData: boolean;
}

// Market Data Types
export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: string;
  exchange: string;
  segment: TradingSegment;
}

export interface HistoricalData {
  symbol: string;
  interval: TimeInterval;
  data: OHLCV[];
}

export interface OHLCV {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

// Trading Types
export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  productType: ProductType;
  validity: OrderValidity;
  status: OrderStatus;
  filledQuantity: number;
  remainingQuantity: number;
  averagePrice?: number;
  brokerOrderId?: string;
  exchangeOrderId?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop_loss' | 'stop_loss_limit' | 'bracket' | 'cover';
export type ProductType = 'delivery' | 'intraday' | 'margin' | 'bo' | 'co' | 'nrml' | 'mis';
export type OrderValidity = 'day' | 'gtc' | 'ioc' | 'fok';
export type OrderStatus = 'pending' | 'open' | 'partial' | 'filled' | 'cancelled' | 'rejected' | 'expired';

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  unrealizedPnl: number;
  realizedPnl: number;
  productType: ProductType;
  segment: TradingSegment;
  exchange: string;
  instrument: string;
  expiry?: string;
  strike?: number;
  optionType?: 'call' | 'put';
}

export interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  value: number;
  productType: ProductType;
  segment: TradingSegment;
  exchange: string;
  instrument: string;
}

// Portfolio Types
export interface Portfolio {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  availableMargin: number;
  usedMargin: number;
  collateral: number;
  positions: Position[];
  holdings: Holding[];
  allocation: PortfolioAllocation;
}

export interface PortfolioAllocation {
  equity: number;
  futures: number;
  options: number;
  crypto: number;
  commodities: number;
  cash: number;
}

// AI & Analytics Types
export interface AIStrategy {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  parameters: StrategyParameters;
  performance: StrategyPerformance;
  status: StrategyStatus;
  createdAt: string;
  updatedAt: string;
  backtestResults?: BacktestResult[];
}

export type StrategyType = 'momentum' | 'mean_reversion' | 'breakout' | 'arbitrage' | 'ml_based' | 'sentiment_based';
export type StrategyStatus = 'active' | 'paused' | 'stopped' | 'backtesting' | 'optimizing';

export interface StrategyParameters {
  symbols: string[];
  timeframe: TimeInterval;
  indicators: TechnicalIndicator[];
  entryConditions: Condition[];
  exitConditions: Condition[];
  riskManagement: RiskManagementSettings;
  maxPositions: number;
  capitalAllocation: number;
}

export interface TechnicalIndicator {
  name: string;
  parameters: Record<string, any>;
}

export interface Condition {
  type: 'price' | 'indicator' | 'pattern' | 'volume' | 'time';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'cross_above' | 'cross_below';
  value: number | string;
  indicator?: string;
}

export interface StrategyPerformance {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  calmarRatio: number;
  sortinoRatio: number;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  performance: StrategyPerformance;
  trades: Trade[];
  equity: EquityCurve[];
  drawdown: DrawdownCurve[];
}

export interface Trade {
  id: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  entryTime: string;
  exitTime: string;
  pnl: number;
  pnlPercent: number;
  commission: number;
  strategy: string;
  signal: string;
}

export interface EquityCurve {
  timestamp: string;
  equity: number;
  drawdown: number;
}

export interface DrawdownCurve {
  timestamp: string;
  drawdown: number;
  drawdownPercent: number;
}

export interface AIPrediction {
  symbol: string;
  prediction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  targetPrice: number;
  timeHorizon: string;
  factors: PredictionFactor[];
  timestamp: string;
}

export interface PredictionFactor {
  factor: string;
  importance: number;
  value: number;
}

export interface SentimentAnalysis {
  symbol: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  sources: SentimentSource[];
  timestamp: string;
}

export interface SentimentSource {
  source: 'news' | 'social' | 'analyst' | 'earnings';
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  count: number;
}

// News & Data Types
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  author: string;
  url: string;
  publishedAt: string;
  symbols: string[];
  sentiment: SentimentAnalysis;
  categories: string[];
  tags: string[];
}

export interface MarketAlert {
  id: string;
  type: AlertType;
  symbol: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  action?: string;
}

export type AlertType = 'price' | 'volume' | 'news' | 'technical' | 'ai_signal' | 'risk' | 'system';

// Wallet & Transactions
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  availableBalance: number;
  blockedBalance: number;
  currency: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: TransactionStatus;
  createdAt: string;
  completedAt?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'trade' | 'commission' | 'dividend' | 'interest' | 'transfer';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Paper Trading Types
export interface PaperTradingAccount {
  id: string;
  userId: string;
  initialBalance: number;
  currentBalance: number;
  totalPnl: number;
  totalPnlPercent: number;
  totalTrades: number;
  winRate: number;
  maxDrawdown: number;
  createdAt: string;
  resetAt?: string;
}

// System & Configuration Types
export interface SystemStatus {
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  services: ServiceStatus[];
  lastUpdated: string;
}

export interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency: number;
  uptime: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface MarketDataUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface OrderUpdate {
  orderId: string;
  status: OrderStatus;
  filledQuantity: number;
  averagePrice?: number;
  timestamp: string;
}

export interface PositionUpdate {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  timestamp: string;
}

export interface AccountUpdate {
  availableMargin: number;
  usedMargin: number;
  totalPnl: number;
  timestamp: string;
}

// UI/UX Types
export interface Theme {
  mode: 'light' | 'dark' | 'alert';
  colors: ThemeColors;
  typography: Typography;
  spacing: Spacing;
  shadows: Shadows;
  breakpoints: Breakpoints;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  bull: string;
  bear: string;
  neutral: string;
}

export interface Typography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    loose: number;
  };
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Breakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface UIState {
  loading: boolean;
  error: string | null;
  success: string | null;
  theme: 'light' | 'dark' | 'alert';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notifications: MarketAlert[];
  selectedSymbol: string | null;
  selectedTimeframe: TimeInterval;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event Types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: number;
  source: string;
}

export interface TradeEvent extends AppEvent {
  type: 'trade_executed' | 'trade_cancelled' | 'trade_modified';
  payload: {
    orderId: string;
    symbol: string;
    side: OrderSide;
    quantity: number;
    price: number;
  };
}

export interface MarketEvent extends AppEvent {
  type: 'price_update' | 'volume_spike' | 'circuit_breaker';
  payload: {
    symbol: string;
    price: number;
    change: number;
    volume: number;
  };
}

export interface AIEvent extends AppEvent {
  type: 'signal_generated' | 'strategy_triggered' | 'prediction_updated';
  payload: {
    strategyId?: string;
    symbol: string;
    signal: string;
    confidence: number;
  };
}

export interface SystemEvent extends AppEvent {
  type: 'system_alert' | 'maintenance_start' | 'maintenance_end';
  payload: {
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
}

export default {
  // Export all types for easy import
};
