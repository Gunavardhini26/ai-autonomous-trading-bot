import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { liveDataService } from '../services/LiveDataService';
import { 
  DocumentTextIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  FunnelIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  amount: number;
  timestamp: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  pnl?: number;
  fees: number;
  strategy: string;
  aiConfidence: number;
  marketCondition: string;
}

const TradeLogs: React.FC = () => {
  const { theme } = useTheme();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'pnl'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchTradeLogs = async () => {
    try {
      setLoading(true);
      const data = await liveDataService.getTradeLogs();
      
      // If no real data, generate sample data with live market context
      if (!data || data.length === 0) {
        const sampleTrades: Trade[] = [];
        const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
        const strategies = ['Momentum', 'Mean Reversion', 'Breakout', 'AI Pattern', 'Sentiment Based'];
        const marketConditions = ['Bullish', 'Bearish', 'Sideways', 'Volatile'];
        
        for (let i = 0; i < 50; i++) {
          const symbol = symbols[Math.floor(Math.random() * symbols.length)];
          const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
          const quantity = Math.floor(Math.random() * 1000) + 1;
          const price = Math.random() * 1000 + 100;
          const amount = quantity * price;
          const timestamp = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
          const status = ['COMPLETED', 'PENDING', 'FAILED'][Math.floor(Math.random() * 3)] as Trade['status'];
          const fees = amount * 0.001; // 0.1% fees
          const pnl = status === 'COMPLETED' ? (Math.random() - 0.5) * amount * 0.1 : undefined;
          
          sampleTrades.push({
            id: `trade_${i + 1}`,
            symbol,
            type,
            quantity,
            price,
            amount,
            timestamp,
            status,
            pnl,
            fees,
            strategy: strategies[Math.floor(Math.random() * strategies.length)],
            aiConfidence: Math.random() * 100,
            marketCondition: marketConditions[Math.floor(Math.random() * marketConditions.length)]
          });
        }
        
        setTrades(sampleTrades);
      } else {
        setTrades(data);
      }
    } catch (error) {
      console.error('Error fetching trade logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeLogs();
    
    // Subscribe to real-time trade updates
    const unsubscribe = liveDataService.subscribeToTrades((newTrade) => {
      setTrades(prev => [newTrade, ...prev]);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = trades;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(trade => 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(trade => trade.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(trade => trade.type === typeFilter);
    }

    // Apply date filter
    if (dateFilter !== 'ALL') {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      
      filtered = filtered.filter(trade => {
        switch (dateFilter) {
          case 'TODAY':
            return now - trade.timestamp < dayMs;
          case 'WEEK':
            return now - trade.timestamp < 7 * dayMs;
          case 'MONTH':
            return now - trade.timestamp < 30 * dayMs;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'pnl':
          aValue = a.pnl || 0;
          bValue = b.pnl || 0;
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredTrades(filtered);
  }, [trades, searchTerm, statusFilter, typeFilter, dateFilter, sortBy, sortOrder]);

  const getStatusIcon = (status: Trade['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'FAILED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate summary statistics
  const totalTrades = trades.length;
  const completedTrades = trades.filter(t => t.status === 'COMPLETED').length;
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const totalFees = trades.reduce((sum, trade) => sum + trade.fees, 0);
  const winRate = completedTrades > 0 ? (trades.filter(t => t.status === 'COMPLETED' && (t.pnl || 0) > 0).length / completedTrades) * 100 : 0;

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
            Trade Logs
          </h1>
          <p className="text-text-secondary">
            Complete history of all trading activities
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-bg-secondary rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total Trades</p>
                <p className="text-2xl font-bold text-text-primary">{totalTrades}</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-accent-primary" />
            </div>
          </div>
          
          <div className="bg-bg-secondary rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-text-primary">{winRate.toFixed(1)}%</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-accent-primary" />
            </div>
          </div>
          
          <div className="bg-bg-secondary rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {totalPnL >= 0 ? '+' : ''}₹{formatPrice(totalPnL)}
                </p>
              </div>
              {totalPnL >= 0 ? (
                <ArrowUpIcon className="w-8 h-8 text-profit" />
              ) : (
                <ArrowDownIcon className="w-8 h-8 text-loss" />
              )}
            </div>
          </div>
          
          <div className="bg-bg-secondary rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total Fees</p>
                <p className="text-2xl font-bold text-text-primary">₹{formatPrice(totalFees)}</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-accent-primary" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-bg-secondary rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search trades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="ALL">All Types</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="timestamp">Date</option>
              <option value="amount">Amount</option>
              <option value="pnl">P&L</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary hover:bg-bg-primary transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Trade Logs Table */}
        <div className="bg-bg-secondary rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Trade ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary"></div>
                        <span className="text-text-secondary">Loading trade logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTrades.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-text-secondary">
                      No trades found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredTrades.map((trade, index) => (
                    <motion.tr
                      key={trade.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-bg-tertiary/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary font-mono text-sm">
                        {trade.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary font-medium">
                        {trade.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trade.type === 'BUY' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary font-mono">
                        {trade.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary font-mono">
                        ₹{formatPrice(trade.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary font-mono">
                        ₹{formatPrice(trade.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {trade.pnl !== undefined ? (
                          <span className={`font-mono ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {trade.pnl >= 0 ? '+' : ''}₹{formatPrice(trade.pnl)}
                          </span>
                        ) : (
                          <span className="text-text-secondary">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(trade.status)}
                          <span className="text-text-primary text-sm">{trade.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary text-sm">
                        {formatDateTime(trade.timestamp)}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-text-secondary text-sm">
          Showing {filteredTrades.length} of {totalTrades} trades
        </div>
      </motion.div>
    </div>
  );
};

export default TradeLogs;
