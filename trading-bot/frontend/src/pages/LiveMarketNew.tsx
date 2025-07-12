import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Eye,
  Activity,
  BarChart3,
  Zap,
  Search,
  Star,
  Filter
} from 'lucide-react';

interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
}

interface OrderBookLevel {
  price: number;
  quantity: number;
  orders: number;
}

interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

const LiveMarketNew: React.FC = () => {
  const { theme } = useTheme();
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { symbol: 'RELIANCE', price: 2485.50, change: 23.75, changePercent: 0.97, volume: 1234567, high: 2495.20, low: 2460.10 },
    { symbol: 'TCS', price: 3421.80, change: -12.45, changePercent: -0.36, volume: 987654, high: 3450.00, low: 3410.25 },
    { symbol: 'INFY', price: 1567.90, change: 8.90, changePercent: 0.57, volume: 654321, high: 1575.40, low: 1555.20 },
    { symbol: 'HDFC', price: 1678.30, change: -5.60, changePercent: -0.33, volume: 456789, high: 1690.80, low: 1670.50 },
    { symbol: 'ICICI', price: 987.65, change: 15.25, changePercent: 1.57, volume: 789123, high: 995.40, low: 980.20 }
  ]);

  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [
      { price: 2484.50, quantity: 125, orders: 3 },
      { price: 2484.00, quantity: 250, orders: 7 },
      { price: 2483.75, quantity: 180, orders: 4 },
      { price: 2483.50, quantity: 320, orders: 9 },
      { price: 2483.00, quantity: 150, orders: 5 }
    ],
    asks: [
      { price: 2485.50, quantity: 200, orders: 6 },
      { price: 2486.00, quantity: 175, orders: 4 },
      { price: 2486.25, quantity: 300, orders: 8 },
      { price: 2486.75, quantity: 125, orders: 3 },
      { price: 2487.00, quantity: 220, orders: 7 }
    ]
  });

  const [indicators, setIndicators] = useState({
    rsi: 67.8,
    macd: 12.5,
    bb_upper: 2495.40,
    bb_lower: 2470.20,
    vwap: 2478.90
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist(prev => prev.map(item => ({
        ...item,
        price: item.price + (Math.random() - 0.5) * 10,
        change: item.change + (Math.random() - 0.5) * 2,
        changePercent: item.changePercent + (Math.random() - 0.5) * 0.1
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredWatchlist = watchlist.filter(item =>
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Live Market Feed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time market data with advanced charting and order book
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Watchlist Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Watchlist
                  </h3>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search symbols..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                             focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {filteredWatchlist.map((item) => (
                  <div
                    key={item.symbol}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSymbol === item.symbol
                        ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.symbol}
                      </span>
                      <Star className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        ₹{item.price.toFixed(2)}
                      </span>
                      <div className={`flex items-center space-x-1 ${
                        item.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span className="text-xs font-medium">
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedSymbol}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{watchlist.find(item => item.symbol === selectedSymbol)?.price.toFixed(2)}
                      </span>
                      <span className={`flex items-center space-x-1 ${
                        (watchlist.find(item => item.symbol === selectedSymbol)?.change || 0) >= 0 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(watchlist.find(item => item.symbol === selectedSymbol)?.change || 0) >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {watchlist.find(item => item.symbol === selectedSymbol)?.changePercent.toFixed(2)}%
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      1D
                    </button>
                    <button className="px-3 py-1 text-xs bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 rounded">
                      1W
                    </button>
                    <button className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      1M
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="p-4">
                <div className="h-80 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      TradingView Chart Integration
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Real-time OHLCV data with technical indicators
                    </p>
                  </div>
                </div>
              </div>

              {/* Indicators */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">RSI</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {indicators.rsi}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">MACD</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {indicators.macd}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">BB Upper</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {indicators.bb_upper}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">BB Lower</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {indicators.bb_lower}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">VWAP</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {indicators.vwap}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Book & Quick Trade */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Book */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order Book
                </h3>
              </div>
              <div className="p-4">
                {/* Asks */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-red-600 mb-2">ASKS</div>
                  <div className="space-y-1">
                    {orderBook.asks.reverse().map((ask, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-red-600 font-medium">₹{ask.price}</span>
                        <span className="text-gray-600 dark:text-gray-400">{ask.quantity}</span>
                        <span className="text-gray-500 dark:text-gray-500">{ask.orders}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spread */}
                <div className="py-2 border-y border-gray-200 dark:border-gray-600 mb-4">
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Spread: ₹{(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}
                  </div>
                </div>

                {/* Bids */}
                <div>
                  <div className="text-xs font-medium text-green-600 mb-2">BIDS</div>
                  <div className="space-y-1">
                    {orderBook.bids.map((bid, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-green-600 font-medium">₹{bid.price}</span>
                        <span className="text-gray-600 dark:text-gray-400">{bid.quantity}</span>
                        <span className="text-gray-500 dark:text-gray-500">{bid.orders}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Trade */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Trade
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    placeholder="Market price"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                    BUY
                  </button>
                  <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                    SELL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMarketNew;
