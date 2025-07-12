import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Search,
  Calendar,
  Clock,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';

interface TradeLog {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  pnlPercent?: number;
  entryTime: Date;
  exitTime?: Date;
  strategy: string;
  status: 'OPEN' | 'CLOSED' | 'STOPPED';
  exchange: 'NSE' | 'BSE' | 'MCX';
  segment: 'EQUITY' | 'FO' | 'COMMODITY' | 'CURRENCY';
  commission: number;
  netPnl?: number;
}

const TradeLogsNew: React.FC = () => {
  const { theme } = useTheme();
  const [trades, setTrades] = useState<TradeLog[]>([
    {
      id: 'TRD001',
      symbol: 'RELIANCE',
      type: 'BUY',
      quantity: 100,
      entryPrice: 2450.00,
      exitPrice: 2485.50,
      pnl: 3550,
      pnlPercent: 1.45,
      entryTime: new Date('2025-07-10T09:15:00'),
      exitTime: new Date('2025-07-10T11:30:00'),
      strategy: 'AI_MOMENTUM',
      status: 'CLOSED',
      exchange: 'NSE',
      segment: 'EQUITY',
      commission: 25.50,
      netPnl: 3524.50
    },
    {
      id: 'TRD002',
      symbol: 'TCS',
      type: 'SELL',
      quantity: 50,
      entryPrice: 3450.00,
      exitPrice: 3421.80,
      pnl: -1410,
      pnlPercent: -0.82,
      entryTime: new Date('2025-07-10T10:00:00'),
      exitTime: new Date('2025-07-10T12:15:00'),
      strategy: 'MEAN_REVERSION',
      status: 'CLOSED',
      exchange: 'NSE',
      segment: 'EQUITY',
      commission: 18.75,
      netPnl: -1428.75
    },
    {
      id: 'TRD003',
      symbol: 'BANKNIFTY',
      type: 'BUY',
      quantity: 25,
      entryPrice: 48450.00,
      entryTime: new Date('2025-07-10T13:00:00'),
      strategy: 'BREAKOUT',
      status: 'OPEN',
      exchange: 'NSE',
      segment: 'FO',
      commission: 0
    },
    {
      id: 'TRD004',
      symbol: 'INFY',
      type: 'BUY',
      quantity: 75,
      entryPrice: 1580.00,
      exitPrice: 1567.90,
      pnl: -907.50,
      pnlPercent: -0.77,
      entryTime: new Date('2025-07-10T14:30:00'),
      exitTime: new Date('2025-07-10T15:45:00'),
      strategy: 'SUPPORT_RESISTANCE',
      status: 'STOPPED',
      exchange: 'NSE',
      segment: 'EQUITY',
      commission: 15.25,
      netPnl: -922.75
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filters, setFilters] = useState({
    status: '',
    strategy: '',
    segment: '',
    exchange: '',
    type: ''
  });

  const strategies = ['AI_MOMENTUM', 'MEAN_REVERSION', 'BREAKOUT', 'SUPPORT_RESISTANCE', 'SCALPING'];

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.strategy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || trade.status === filters.status;
    const matchesStrategy = !filters.strategy || trade.strategy === filters.strategy;
    const matchesSegment = !filters.segment || trade.segment === filters.segment;
    const matchesExchange = !filters.exchange || trade.exchange === filters.exchange;
    const matchesType = !filters.type || trade.type === filters.type;

    return matchesSearch && matchesStatus && matchesStrategy && matchesSegment && matchesExchange && matchesType;
  });

  const totalPnL = trades.filter(t => t.netPnl).reduce((sum, trade) => sum + (trade.netPnl || 0), 0);
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => (t.netPnl || 0) > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return 'Active';
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const exportTrades = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Trade ID,Symbol,Type,Quantity,Entry Price,Exit Price,P&L,Entry Time,Exit Time,Strategy,Status,Exchange,Segment,Commission,Net P&L\n"
      + filteredTrades.map(trade => 
          `${trade.id},${trade.symbol},${trade.type},${trade.quantity},${trade.entryPrice},${trade.exitPrice || ''},${trade.pnl || ''},${trade.entryTime.toISOString()},${trade.exitTime?.toISOString() || ''},${trade.strategy},${trade.status},${trade.exchange},${trade.segment},${trade.commission},${trade.netPnl || ''}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trade_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Trade Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive trading history and performance analytics
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={exportTrades}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalPnL)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                totalPnL >= 0 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTrades}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{winRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Winning Trades</p>
                <p className="text-2xl font-bold text-green-600">{winningTrades}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Losing: {totalTrades - winningTrades}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by symbol, trade ID, or strategy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                  <option value="STOPPED">Stopped</option>
                </select>

                <select
                  value={filters.strategy}
                  onChange={(e) => setFilters(prev => ({ ...prev, strategy: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Strategies</option>
                  {strategies.map(strategy => (
                    <option key={strategy} value={strategy}>{strategy}</option>
                  ))}
                </select>

                <select
                  value={filters.segment}
                  onChange={(e) => setFilters(prev => ({ ...prev, segment: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Segments</option>
                  <option value="EQUITY">Equity</option>
                  <option value="FO">F&O</option>
                  <option value="COMMODITY">Commodity</option>
                  <option value="CURRENCY">Currency</option>
                </select>

                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Buy & Sell</option>
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>

                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trades Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trade Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entry/Exit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Strategy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {trade.symbol}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {trade.id} • {trade.exchange} • {trade.segment}
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          trade.type === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                               : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {trade.type} {trade.quantity}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Entry: ₹{trade.entryPrice.toFixed(2)}
                        </div>
                        {trade.exitPrice && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Exit: ₹{trade.exitPrice.toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {trade.entryTime.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trade.netPnl !== undefined ? (
                        <div className={`flex items-center space-x-1 ${
                          trade.netPnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.netPnl >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <div>
                            <div className="text-sm font-medium">
                              {formatCurrency(trade.netPnl)}
                            </div>
                            <div className="text-xs">
                              ({trade.pnlPercent?.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDuration(trade.entryTime, trade.exitTime)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                     bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {trade.strategy.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.status === 'CLOSED' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        trade.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredTrades.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No trades found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No trades match your current filters or search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeLogsNew;
