// Custom React Hooks for AI Trading Bot
// Comprehensive collection of reusable hooks

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  MarketData, 
  Order, 
  Position, 
  Portfolio, 
  NewsArticle, 
  AIStrategy,
  AIPrediction,
  SentimentAnalysis,
  MarketAlert,
  SystemStatus
} from '../types';
import { 
  marketAPI, 
  tradingAPI, 
  portfolioAPI, 
  newsAPI, 
  aiAPI, 
  brokerAPI 
} from '../services/api';
import { 
  useMarketDataWebSocket, 
  useOrderUpdatesWebSocket, 
  usePositionUpdatesWebSocket 
} from '../services/websocket';
import { debounce, throttle } from '../utils';

// Market Data Hooks
export const useMarketData = (symbols: string[]) => {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { marketData: wsMarketData, isConnected } = useMarketDataWebSocket(symbols);
  
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const data = await marketAPI.getLivePrices(symbols);
        setMarketData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (symbols.length > 0) {
      fetchMarketData();
    }
  }, [symbols]);
  
  // Update with WebSocket data
  useEffect(() => {
    if (isConnected && wsMarketData) {
      setMarketData(prev => ({ ...prev, ...wsMarketData }));
    }
  }, [wsMarketData, isConnected]);
  
  const getPrice = useCallback((symbol: string) => {
    return marketData[symbol]?.price || 0;
  }, [marketData]);
  
  const getChange = useCallback((symbol: string) => {
    return marketData[symbol]?.change || 0;
  }, [marketData]);
  
  const getChangePercent = useCallback((symbol: string) => {
    return marketData[symbol]?.changePercent || 0;
  }, [marketData]);
  
  return {
    marketData,
    loading,
    error,
    isConnected,
    getPrice,
    getChange,
    getChangePercent,
    refresh: () => {
      setMarketData({});
      setLoading(true);
      setError(null);
    }
  };
};

export const useHistoricalData = (symbol: string, interval: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await marketAPI.getHistoricalData(symbol, interval);
        setData(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (symbol && interval) {
      fetchData();
    }
  }, [symbol, interval]);
  
  return { data, loading, error };
};

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const data = await marketAPI.getWatchlist();
        setWatchlist(data.symbols);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWatchlist();
  }, []);
  
  const addToWatchlist = useCallback(async (symbol: string) => {
    try {
      const newWatchlist = [...watchlist, symbol];
      await marketAPI.updateWatchlist(newWatchlist);
      setWatchlist(newWatchlist);
    } catch (err: any) {
      setError(err.message);
    }
  }, [watchlist]);
  
  const removeFromWatchlist = useCallback(async (symbol: string) => {
    try {
      const newWatchlist = watchlist.filter(s => s !== symbol);
      await marketAPI.updateWatchlist(newWatchlist);
      setWatchlist(newWatchlist);
    } catch (err: any) {
      setError(err.message);
    }
  }, [watchlist]);
  
  return {
    watchlist,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist: (symbol: string) => watchlist.includes(symbol)
  };
};

// Trading Hooks
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { orders: wsOrders } = useOrderUpdatesWebSocket();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await tradingAPI.getOrderHistory();
        setOrders(data.orders);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Update with WebSocket data
  useEffect(() => {
    if (wsOrders.length > 0) {
      setOrders(prev => {
        const updated = [...prev];
        wsOrders.forEach(wsOrder => {
          const index = updated.findIndex(order => order.id === wsOrder.id);
          if (index >= 0) {
            updated[index] = wsOrder;
          } else {
            updated.unshift(wsOrder);
          }
        });
        return updated;
      });
    }
  }, [wsOrders]);
  
  const placeOrder = useCallback(async (orderData: any) => {
    try {
      const response = await tradingAPI.placeOrder(orderData);
      setOrders(prev => [response.order, ...prev]);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);
  
  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      await tradingAPI.cancelOrder(orderId);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);
  
  const modifyOrder = useCallback(async (orderId: string, modifications: any) => {
    try {
      const response = await tradingAPI.modifyOrder(orderId, modifications);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? response.order : order
      ));
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);
  
  return {
    orders,
    loading,
    error,
    placeOrder,
    cancelOrder,
    modifyOrder,
    pendingOrders: orders.filter(order => order.status === 'pending'),
    filledOrders: orders.filter(order => order.status === 'filled'),
    cancelledOrders: orders.filter(order => order.status === 'cancelled')
  };
};

export const usePositions = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { positions: wsPositions } = usePositionUpdatesWebSocket();
  
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const data = await tradingAPI.getPositions();
        setPositions(data.positions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPositions();
  }, []);
  
  // Update with WebSocket data
  useEffect(() => {
    if (wsPositions.length > 0) {
      setPositions(wsPositions);
    }
  }, [wsPositions]);
  
  const totalPnL = useMemo(() => {
    return positions.reduce((sum, position) => sum + position.pnl, 0);
  }, [positions]);
  
  const totalUnrealizedPnL = useMemo(() => {
    return positions.reduce((sum, position) => sum + position.unrealizedPnl, 0);
  }, [positions]);
  
  return {
    positions,
    loading,
    error,
    totalPnL,
    totalUnrealizedPnL,
    longPositions: positions.filter(p => p.side === 'long'),
    shortPositions: positions.filter(p => p.side === 'short')
  };
};

export const useHoldings = () => {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true);
        const data = await tradingAPI.getHoldings();
        setHoldings(data.holdings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHoldings();
  }, []);
  
  const totalValue = useMemo(() => {
    return holdings.reduce((sum, holding) => sum + holding.value, 0);
  }, [holdings]);
  
  const totalPnL = useMemo(() => {
    return holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  }, [holdings]);
  
  return {
    holdings,
    loading,
    error,
    totalValue,
    totalPnL
  };
};

// Portfolio Hooks
export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const data = await portfolioAPI.getOverview();
        setPortfolio(data.portfolio);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolio();
  }, []);
  
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await portfolioAPI.getOverview();
      setPortfolio(data.portfolio);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    portfolio,
    loading,
    error,
    refresh
  };
};

export const usePortfolioPerformance = (period: string = '1M') => {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const data = await portfolioAPI.getPerformance(period);
        setPerformance(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerformance();
  }, [period]);
  
  return { performance, loading, error };
};

// AI & Analytics Hooks
export const useAIStrategies = () => {
  const [strategies, setStrategies] = useState<AIStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        setLoading(true);
        const data = await aiAPI.getStrategies();
        setStrategies(data.strategies);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStrategies();
  }, []);
  
  const createStrategy = useCallback(async (strategyData: any) => {
    try {
      const response = await aiAPI.createStrategy(strategyData);
      setStrategies(prev => [...prev, response.strategy]);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);
  
  const updateStrategy = useCallback(async (strategyId: string, updates: any) => {
    try {
      const response = await aiAPI.updateStrategy(strategyId, updates);
      setStrategies(prev => prev.map(s => 
        s.id === strategyId ? response.strategy : s
      ));
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);
  
  const deleteStrategy = useCallback(async (strategyId: string) => {
    try {
      await aiAPI.deleteStrategy(strategyId);
      setStrategies(prev => prev.filter(s => s.id !== strategyId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);
  
  return {
    strategies,
    loading,
    error,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    activeStrategies: strategies.filter(s => s.status === 'active')
  };
};

export const useAIPredictions = (symbols: string[]) => {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const data = await aiAPI.getPredictions(symbols);
        setPredictions(data.predictions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (symbols.length > 0) {
      fetchPredictions();
    }
  }, [symbols]);
  
  const getPrediction = useCallback((symbol: string) => {
    return predictions.find(p => p.symbol === symbol);
  }, [predictions]);
  
  return {
    predictions,
    loading,
    error,
    getPrediction,
    bullishPredictions: predictions.filter(p => p.prediction === 'bullish'),
    bearishPredictions: predictions.filter(p => p.prediction === 'bearish')
  };
};

export const useSentimentAnalysis = (symbol: string) => {
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true);
        const data = await aiAPI.getSentiment(symbol);
        setSentiment(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (symbol) {
      fetchSentiment();
    }
  }, [symbol]);
  
  return { sentiment, loading, error };
};

// News Hooks
export const useNews = (limit: number = 20) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await newsAPI.getLatest(limit);
        setNews(data.articles);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, [limit]);
  
  const searchNews = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const data = await newsAPI.search(query);
      setNews(data.articles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    news,
    loading,
    error,
    searchNews,
    positiveNews: news.filter(n => n.sentiment.sentiment === 'positive'),
    negativeNews: news.filter(n => n.sentiment.sentiment === 'negative')
  };
};

// Broker Hooks
export const useBrokerStatus = () => {
  const [brokerStatus, setBrokerStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBrokerStatus = async () => {
      try {
        setLoading(true);
        const data = await brokerAPI.getStatus();
        setBrokerStatus(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrokerStatus();
  }, []);
  
  return { brokerStatus, loading, error };
};

// Utility Hooks
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue] as const;
};

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<() => void>();
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current?.(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

export const useKeyboardShortcut = (targetKey: string, callback: () => void) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        callback();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [targetKey, callback]);
};

export const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, callback]);
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<MarketAlert[]>([]);
  
  const addNotification = useCallback((notification: MarketAlert) => {
    setNotifications(prev => [...prev, notification]);
  }, []);
  
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
    unreadCount: notifications.filter(n => !n.read).length
  };
};

// Export all hooks
export default {
  useMarketData,
  useHistoricalData,
  useWatchlist,
  useOrders,
  usePositions,
  useHoldings,
  usePortfolio,
  usePortfolioPerformance,
  useAIStrategies,
  useAIPredictions,
  useSentimentAnalysis,
  useNews,
  useBrokerStatus,
  useDebounce,
  useLocalStorage,
  useInterval,
  useOnlineStatus,
  useKeyboardShortcut,
  useClickOutside,
  useNotifications,
};
