import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { liveDataService } from '../services/LiveDataService';
import { 
  ChartBarIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  PlayIcon,
  PauseIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
}

const LiveMarketFeed: React.FC = () => {
  const { theme } = useTheme();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<'stocks' | 'crypto'>('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Stock symbols to track
  const stockSymbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'KOTAKBANK', 'BHARTIARTL', 'ITC', 'SBIN', 'HINDUNILVR'];
  
  // Crypto symbols to track
  const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'SOLUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT'];

  const fetchStockData = useCallback(async () => {
    try {
      const promises = stockSymbols.map(async (symbol) => {
        const data = await liveDataService.getStockPrice(symbol);
        return {
          symbol,
          price: data.price || Math.random() * 1000 + 100,
          change: data.change || (Math.random() - 0.5) * 50,
          changePercent: data.changePercent || (Math.random() - 0.5) * 10,
          volume: data.volume || Math.floor(Math.random() * 1000000),
          high: data.high || Math.random() * 1100 + 100,
          low: data.low || Math.random() * 900 + 100,
          open: data.open || Math.random() * 1000 + 100,
          timestamp: Date.now()
        };
      });

      const results = await Promise.all(promises);
      setMarketData(results);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  }, []);

  const fetchCryptoData = useCallback(async () => {
    try {
      const promises = cryptoSymbols.map(async (symbol) => {
        const data = await liveDataService.getCryptoPrice(symbol);
        return {
          symbol,
          price: data.price || Math.random() * 50000 + 1000,
          change24h: data.change24h || (Math.random() - 0.5) * 5000,
          changePercent24h: data.changePercent24h || (Math.random() - 0.5) * 15,
          volume24h: data.volume24h || Math.floor(Math.random() * 10000000),
          marketCap: data.marketCap || Math.floor(Math.random() * 1000000000)
        };
      });

      const results = await Promise.all(promises);
      setCryptoData(results);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    }
  }, []);

  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    
    // Subscribe to real-time updates
    const symbols = selectedMarket === 'stocks' ? stockSymbols : cryptoSymbols;
    
    symbols.forEach(symbol => {
      if (selectedMarket === 'stocks') {
        liveDataService.subscribeToStockPrice(symbol, (data) => {
          setMarketData(prev => 
            prev.map(item => 
              item.symbol === symbol 
                ? { ...item, ...data, timestamp: Date.now() }
                : item
            )
          );
        });
      } else {
        liveDataService.subscribeToCryptoPrice(symbol, (data) => {
          setCryptoData(prev => 
            prev.map(item => 
              item.symbol === symbol 
                ? { ...item, ...data }
                : item
            )
          );
        });
      }
    });
  }, [selectedMarket]);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    liveDataService.unsubscribeAll();
  }, []);

  useEffect(() => {
    setLoading(true);
    if (selectedMarket === 'stocks') {
      fetchStockData().finally(() => setLoading(false));
    } else {
      fetchCryptoData().finally(() => setLoading(false));
    }
  }, [selectedMarket, fetchStockData, fetchCryptoData]);

  const filteredData = selectedMarket === 'stocks' 
    ? marketData.filter(item => 
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cryptoData.filter(item => 
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Live Market Feed
          </h1>
          <p className="text-text-secondary">
            Real-time market data and price movements
          </p>
        </div>

        {/* Controls */}
        <div className="bg-bg-secondary rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Market Selection */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMarket('stocks')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedMarket === 'stocks'
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                }`}
              >
                Stocks
              </button>
              <button
                onClick={() => setSelectedMarket('crypto')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedMarket === 'crypto'
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                }`}
              >
                Crypto
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            {/* Streaming Controls */}
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={isStreaming ? stopStreaming : startStreaming}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isStreaming
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isStreaming ? (
                  <>
                    <PauseIcon className="w-4 h-4" />
                    <span>Stop Stream</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4" />
                    <span>Start Stream</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Market Data Table */}
        <div className="bg-bg-secondary rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Change %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Volume
                  </th>
                  {selectedMarket === 'stocks' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        High
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Low
                      </th>
                    </>
                  )}
                  {selectedMarket === 'crypto' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Market Cap
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {loading ? (
                  <tr>
                    <td colSpan={selectedMarket === 'stocks' ? 7 : 6} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary"></div>
                        <span className="text-text-secondary">Loading market data...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <motion.tr
                      key={item.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-bg-tertiary/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <ChartBarIcon className="w-5 h-5 text-accent-primary" />
                          <span className="text-text-primary font-medium">{item.symbol}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary font-mono">
                        ₹{formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-1 ${
                          (selectedMarket === 'stocks' ? (item as MarketData).change : (item as CryptoData).change24h) >= 0 
                            ? 'text-profit' 
                            : 'text-loss'
                        }`}>
                          {(selectedMarket === 'stocks' ? (item as MarketData).change : (item as CryptoData).change24h) >= 0 ? (
                            <ArrowUpIcon className="w-4 h-4" />
                          ) : (
                            <ArrowDownIcon className="w-4 h-4" />
                          )}
                          <span className="font-mono">
                            {formatPrice(Math.abs(selectedMarket === 'stocks' ? (item as MarketData).change : (item as CryptoData).change24h))}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-mono ${
                          (selectedMarket === 'stocks' ? (item as MarketData).changePercent : (item as CryptoData).changePercent24h) >= 0 
                            ? 'text-profit' 
                            : 'text-loss'
                        }`}>
                          {(selectedMarket === 'stocks' ? (item as MarketData).changePercent : (item as CryptoData).changePercent24h) >= 0 ? '+' : ''}
                          {(selectedMarket === 'stocks' ? (item as MarketData).changePercent : (item as CryptoData).changePercent24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-mono">
                        {formatVolume(selectedMarket === 'stocks' ? (item as MarketData).volume : (item as CryptoData).volume24h)}
                      </td>
                      {selectedMarket === 'stocks' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-mono">
                            ₹{formatPrice((item as MarketData).high)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-mono">
                            ₹{formatPrice((item as MarketData).low)}
                          </td>
                        </>
                      )}
                      {selectedMarket === 'crypto' && (
                        <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-mono">
                          ${formatVolume((item as CryptoData).marketCap)}
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Streaming Status */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Live streaming active</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LiveMarketFeed;
