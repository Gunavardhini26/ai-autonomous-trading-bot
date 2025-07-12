import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  PieChart
} from 'lucide-react';

interface PaperTradingStats {
  totalPnL: number;
  todayPnL: number;
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
  currentCapital: number;
  initialCapital: number;
}

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  timestamp: string;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  pnl: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'cancelled';
}

const PaperTradingNew: React.FC = () => {
  const [isPaperMode, setIsPaperMode] = useState(true);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  // Mock data - replace with real API calls
  const [stats, setStats] = useState<PaperTradingStats>({
    totalPnL: 12450.75,
    todayPnL: 850.25,
    totalTrades: 145,
    winRate: 68.5,
    avgWin: 245.30,
    avgLoss: -156.20,
    maxDrawdown: -2340.50,
    sharpeRatio: 1.85,
    currentCapital: 112450.75,
    initialCapital: 100000
  });

  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      symbol: 'RELIANCE',
      quantity: 50,
      side: 'BUY',
      entryPrice: 2456.75,
      currentPrice: 2478.30,
      pnl: 1077.50,
      pnlPercentage: 0.88,
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      symbol: 'TCS',
      quantity: 25,
      side: 'BUY',
      entryPrice: 3890.20,
      currentPrice: 3875.45,
      pnl: -368.75,
      pnlPercentage: -0.38,
      timestamp: '2024-01-15T11:15:00Z'
    }
  ]);

  const [recentTrades, setRecentTrades] = useState<Trade[]>([
    {
      id: '1',
      symbol: 'INFY',
      side: 'SELL',
      quantity: 30,
      price: 1456.80,
      pnl: 720.30,
      timestamp: '2024-01-15T09:45:00Z',
      status: 'completed'
    },
    {
      id: '2',
      symbol: 'HDFC',
      side: 'BUY',
      quantity: 15,
      price: 1678.90,
      pnl: -234.50,
      timestamp: '2024-01-15T09:30:00Z',
      status: 'completed'
    }
  ]);

  const handleTogglePaperMode = () => {
    setIsPaperMode(!isPaperMode);
    // Here you would typically call an API to switch modes
  };

  const handleStartStopSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
    // Here you would start/stop the paper trading simulation
  };

  const handleResetSimulation = () => {
    // Reset all paper trading data
    setStats(prev => ({
      ...prev,
      currentCapital: prev.initialCapital,
      totalPnL: 0,
      todayPnL: 0,
      totalTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    }));
    setPositions([]);
    setRecentTrades([]);
  };

  const formatCurrency = (amount: number, hideValue: boolean = false) => {
    if (hideValue) return '₹ ****';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number, hideValue: boolean = false) => {
    if (hideValue) return '****';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatPercentage = (num: number, hideValue: boolean = false) => {
    if (hideValue) return '**%';
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <Target className="h-8 w-8 text-rose-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paper Trading</h1>
            <p className="text-gray-600 dark:text-gray-400">Practice trading with virtual funds</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* Paper Mode Toggle */}
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Paper Mode</span>
            <button
              onClick={handleTogglePaperMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPaperMode ? 'bg-rose-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPaperMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mode Indicator */}
      <div className={`p-4 rounded-lg border ${
        isPaperMode 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
      }`}>
        <div className="flex items-center space-x-3">
          {isPaperMode ? (
            <Target className="h-5 w-5 text-blue-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <div>
            <h3 className={`font-medium ${
              isPaperMode ? 'text-blue-900 dark:text-blue-200' : 'text-red-900 dark:text-red-200'
            }`}>
              {isPaperMode ? 'Paper Trading Mode Active' : 'Live Trading Mode Active'}
            </h3>
            <p className={`text-sm ${
              isPaperMode ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {isPaperMode 
                ? 'All trades are simulated with virtual funds. No real money is at risk.' 
                : 'Warning: You are trading with real money. All trades will be executed live.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Simulation Controls */}
      {isPaperMode && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <Activity className="h-5 w-5 text-rose-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Simulation Controls</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isSimulationRunning 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {isSimulationRunning ? 'RUNNING' : 'STOPPED'}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleStartStopSimulation}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                  isSimulationRunning
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSimulationRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isSimulationRunning ? 'Stop' : 'Start'}</span>
              </button>
              
              <button
                onClick={handleResetSimulation}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Overview</h3>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="1D">1D</option>
            <option value="1W">1W</option>
            <option value="1M">1M</option>
            <option value="3M">3M</option>
            <option value="1Y">1Y</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Capital</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.currentCapital, !isBalanceVisible)}
            </p>
            <div className={`flex items-center space-x-1 text-sm ${
              stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.totalPnL >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{formatCurrency(stats.totalPnL, !isBalanceVisible)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Today's P&L</p>
            <p className={`text-2xl font-bold ${stats.todayPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.todayPnL, !isBalanceVisible)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatNumber(stats.totalTrades)} total trades
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPercentage(stats.winRate, !isBalanceVisible)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Avg Win: {formatCurrency(stats.avgWin, !isBalanceVisible)}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {!isBalanceVisible ? '**' : stats.sharpeRatio.toFixed(2)}
            </p>
            <p className="text-sm text-red-600">
              Max DD: {formatCurrency(stats.maxDrawdown, !isBalanceVisible)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Positions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <PieChart className="h-5 w-5 text-rose-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Open Positions</h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">({positions.length})</span>
            </div>
          </div>
          
          <div className="p-6">
            {positions.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No open positions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">{position.symbol}</h4>
                        <span className={`text-xs px-2 py-1 rounded-lg ${
                          position.side === 'BUY' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {position.side}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {position.quantity} shares
                        </span>
                      </div>
                      <div className={`text-right ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <p className="font-medium">
                          {formatCurrency(position.pnl, !isBalanceVisible)}
                        </p>
                        <p className="text-sm">
                          {formatPercentage(position.pnlPercentage, !isBalanceVisible)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Entry Price</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(position.entryPrice, !isBalanceVisible)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Current Price</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(position.currentPrice, !isBalanceVisible)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-rose-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Trades</h3>
            </div>
          </div>
          
          <div className="p-6">
            {recentTrades.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No recent trades</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">{trade.symbol}</h4>
                        <span className={`text-xs px-2 py-1 rounded-lg ${
                          trade.side === 'BUY' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {trade.side}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{trade.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Quantity</p>
                        <p className="font-medium text-gray-900 dark:text-white">{trade.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Price</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(trade.price, !isBalanceVisible)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">P&L</p>
                        <p className={`font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(trade.pnl, !isBalanceVisible)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-5 w-5 text-rose-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Paper Trading Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Initial Capital
            </label>
            <input
              type="number"
              value={stats.initialCapital}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onChange={(e) => setStats(prev => ({ ...prev, initialCapital: Number(e.target.value) }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Commission per Trade
            </label>
            <input
              type="number"
              defaultValue="20"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slippage (%)
            </label>
            <input
              type="number"
              defaultValue="0.1"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperTradingNew;
