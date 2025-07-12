// Utility Functions for AI Trading Bot
// Comprehensive utility functions for the entire application

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { MarketData, OHLCV, Position, Order, Portfolio } from '../types';

// Number formatting utilities
export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCompactNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${formatNumber(value, decimals)}%`;
};

export const formatVolume = (volume: number): string => {
  if (volume >= 10000000) {
    return `${formatNumber(volume / 10000000, 2)}Cr`;
  } else if (volume >= 100000) {
    return `${formatNumber(volume / 100000, 2)}L`;
  } else if (volume >= 1000) {
    return `${formatNumber(volume / 1000, 2)}K`;
  }
  return formatNumber(volume, 0);
};

// Date and time utilities
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm:ss');
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm:ss');
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(d)) {
    return `Today ${format(d, 'HH:mm')}`;
  } else if (isYesterday(d)) {
    return `Yesterday ${format(d, 'HH:mm')}`;
  } else {
    return formatDistanceToNow(d, { addSuffix: true });
  }
};

export const isMarketOpen = (): boolean => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 60 + minute;
  
  // Monday to Friday
  if (day >= 1 && day <= 5) {
    // Market hours: 9:15 AM to 3:30 PM
    const marketStart = 9 * 60 + 15; // 9:15 AM
    const marketEnd = 15 * 60 + 30;  // 3:30 PM
    return time >= marketStart && time <= marketEnd;
  }
  
  return false;
};

export const getMarketStatus = (): 'open' | 'closed' | 'pre_market' | 'after_market' => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 60 + minute;
  
  // Weekend
  if (day === 0 || day === 6) {
    return 'closed';
  }
  
  const preMarketStart = 9 * 60;      // 9:00 AM
  const marketStart = 9 * 60 + 15;    // 9:15 AM
  const marketEnd = 15 * 60 + 30;     // 3:30 PM
  const afterMarketEnd = 16 * 60;     // 4:00 PM
  
  if (time >= preMarketStart && time < marketStart) {
    return 'pre_market';
  } else if (time >= marketStart && time <= marketEnd) {
    return 'open';
  } else if (time > marketEnd && time <= afterMarketEnd) {
    return 'after_market';
  } else {
    return 'closed';
  }
};

// Color utilities
export const getChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-500';
};

export const getChangeBgColor = (change: number): string => {
  if (change > 0) return 'bg-green-100 text-green-800';
  if (change < 0) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
};

export const getPnLColor = (pnl: number): string => {
  if (pnl > 0) return 'text-green-500';
  if (pnl < 0) return 'text-red-500';
  return 'text-gray-500';
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'filled':
    case 'completed':
    case 'active':
    case 'connected':
      return 'text-green-500';
    case 'pending':
    case 'processing':
    case 'connecting':
      return 'text-yellow-500';
    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'disconnected':
      return 'text-red-500';
    case 'expired':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

// Data validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const isValidSymbol = (symbol: string): boolean => {
  const symbolRegex = /^[A-Z0-9]+$/;
  return symbolRegex.test(symbol) && symbol.length >= 1 && symbol.length <= 20;
};

export const isValidPrice = (price: number): boolean => {
  return price > 0 && price <= 100000000 && !isNaN(price);
};

export const isValidQuantity = (quantity: number): boolean => {
  return quantity > 0 && quantity <= 100000000 && Number.isInteger(quantity);
};

// Data transformation utilities
export const calculatePnL = (
  positions: Position[],
  type: 'realized' | 'unrealized' | 'total' = 'total'
): number => {
  return positions.reduce((total, position) => {
    switch (type) {
      case 'realized':
        return total + position.realizedPnl;
      case 'unrealized':
        return total + position.unrealizedPnl;
      case 'total':
      default:
        return total + position.pnl;
    }
  }, 0);
};

export const calculatePortfolioValue = (portfolio: Portfolio): number => {
  const holdingsValue = portfolio.holdings.reduce((sum, holding) => sum + holding.value, 0);
  const positionsValue = portfolio.positions.reduce((sum, position) => 
    sum + (position.quantity * position.currentPrice), 0
  );
  return holdingsValue + positionsValue + portfolio.availableMargin;
};

export const calculateWinRate = (trades: any[]): number => {
  if (trades.length === 0) return 0;
  const winningTrades = trades.filter(trade => trade.pnl > 0);
  return (winningTrades.length / trades.length) * 100;
};

export const calculateSharpeRatio = (returns: number[], riskFreeRate: number = 0.05): number => {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  return (avgReturn - riskFreeRate) / stdDev;
};

export const calculateMaxDrawdown = (equityCurve: number[]): number => {
  if (equityCurve.length === 0) return 0;
  
  let maxDrawdown = 0;
  let peak = equityCurve[0];
  
  for (let i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i] > peak) {
      peak = equityCurve[i];
    } else {
      const drawdown = (peak - equityCurve[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }
  
  return maxDrawdown * 100;
};

// Technical analysis utilities
export const calculateSMA = (data: number[], period: number): number[] => {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
};

export const calculateEMA = (data: number[], period: number): number[] => {
  const ema = [];
  const multiplier = 2 / (period + 1);
  ema[0] = data[0];
  
  for (let i = 1; i < data.length; i++) {
    ema[i] = (data[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
  }
  
  return ema;
};

export const calculateRSI = (data: number[], period: number = 14): number[] => {
  const rsi = [];
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < data.length; i++) {
    const difference = data[i] - data[i - 1];
    gains.push(difference > 0 ? difference : 0);
    losses.push(difference < 0 ? -difference : 0);
  }
  
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    const rs = avgGain / avgLoss;
    const rsiValue = 100 - (100 / (1 + rs));
    rsi.push(rsiValue);
  }
  
  return rsi;
};

export const calculateBollingerBands = (
  data: number[], 
  period: number = 20, 
  multiplier: number = 2
): { upper: number[], middle: number[], lower: number[] } => {
  const sma = calculateSMA(data, period);
  const upper = [];
  const lower = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    upper.push(sma[i - period + 1] + (stdDev * multiplier));
    lower.push(sma[i - period + 1] - (stdDev * multiplier));
  }
  
  return { upper, middle: sma, lower };
};

// Chart utilities
export const prepareChartData = (data: OHLCV[]): any => {
  return data.map(candle => ({
    time: candle.timestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
  }));
};

export const calculateCandleColor = (open: number, close: number): string => {
  return close >= open ? '#10B981' : '#EF4444';
};

// Storage utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage:', error);
  }
};

// URL utilities
export const generateShareableLink = (
  symbol: string, 
  timeframe: string, 
  indicators: string[] = []
): string => {
  const params = new URLSearchParams({
    symbol,
    timeframe,
    indicators: indicators.join(','),
  });
  
  return `${window.location.origin}/market?${params.toString()}`;
};

export const parseUrlParams = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

// Debounce and throttle utilities
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const unique = <T>(array: T[], key?: keyof T): T[] => {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
  return [...new Set(array)];
};

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error.response) {
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Max attempts exceeded');
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Download utilities
export const downloadFile = (data: any, filename: string, type: string = 'application/json'): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const csv = [headers, ...rows].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Environment utilities
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTablet = (): boolean => {
  return /iPad|Android/i.test(navigator.userAgent) && !isMobile();
};

export const isDesktop = (): boolean => {
  return !isMobile() && !isTablet();
};

// Random utilities
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateOrderId = (): string => {
  return `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Export all utilities
export default {
  formatNumber,
  formatCurrency,
  formatCompactNumber,
  formatPercentage,
  formatVolume,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  isMarketOpen,
  getMarketStatus,
  getChangeColor,
  getChangeBgColor,
  getPnLColor,
  getStatusColor,
  isValidEmail,
  isValidPhone,
  isValidSymbol,
  isValidPrice,
  isValidQuantity,
  calculatePnL,
  calculatePortfolioValue,
  calculateWinRate,
  calculateSharpeRatio,
  calculateMaxDrawdown,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  prepareChartData,
  calculateCandleColor,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  generateShareableLink,
  parseUrlParams,
  debounce,
  throttle,
  chunk,
  groupBy,
  unique,
  handleApiError,
  retry,
  copyToClipboard,
  downloadFile,
  downloadCSV,
  isDevelopment,
  isProduction,
  isMobile,
  isTablet,
  isDesktop,
  generateId,
  generateOrderId,
  sleep,
};
