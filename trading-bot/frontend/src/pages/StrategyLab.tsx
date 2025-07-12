import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { liveDataService } from '../services/LiveDataService';
import { 
  BeakerIcon, 
  PlayIcon, 
  PauseIcon,
  StopIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  LightBulbIcon,
  CpuChipIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'MOMENTUM' | 'MEAN_REVERSION' | 'BREAKOUT' | 'ARBITRAGE' | 'AI_PATTERN';
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED' | 'BACKTESTING';
  parameters: Record<string, any>;
  performance: {
    totalTrades: number;
    winRate: number;
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    avgTradeTime: number;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  allocatedCapital: number;
  createdAt: number;
  lastUpdated: number;
}

interface BacktestResult {
  strategyId: string;
  period: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  trades: Array<{
    date: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    pnl: number;
  }>;
}

const StrategyLab: React.FC = () => {
  const { theme } = useTheme();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'parameters' | 'backtest' | 'performance'>('overview');

  // New strategy form
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    type: 'MOMENTUM' as Strategy['type'],
    riskLevel: 'MEDIUM' as Strategy['riskLevel'],
    allocatedCapital: 100000,
    parameters: {}
  });

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const data = await liveDataService.getStrategies();
      
      // If no real data, generate sample strategies
      if (!data || data.length === 0) {
        const sampleStrategies: Strategy[] = [
          {
            id: 'momentum_1',
            name: 'Momentum Breakout',
            description: 'Trades based on price momentum and volume breakouts',
            type: 'MOMENTUM',
            status: 'ACTIVE',
            parameters: {
              rsiThreshold: 70,
              volumeMultiplier: 1.5,
              stopLoss: 0.02,
              takeProfit: 0.05,
              timeframe: '1h'
            },
            performance: {
              totalTrades: 156,
              winRate: 67.3,
              totalReturn: 23.4,
              maxDrawdown: 8.2,
              sharpeRatio: 1.8,
              avgTradeTime: 4.2
            },
            riskLevel: 'MEDIUM',
            allocatedCapital: 500000,
            createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
            lastUpdated: Date.now() - 2 * 60 * 60 * 1000
          },
          {
            id: 'mean_reversion_1',
            name: 'Mean Reversion Pro',
            description: 'Identifies overbought/oversold conditions for contrarian trades',
            type: 'MEAN_REVERSION',
            status: 'ACTIVE',
            parameters: {
              rsiLower: 30,
              rsiUpper: 70,
              bollinger_period: 20,
              bollinger_std: 2,
              minVolume: 1000000
            },
            performance: {
              totalTrades: 203,
              winRate: 58.1,
              totalReturn: 18.7,
              maxDrawdown: 12.1,
              sharpeRatio: 1.4,
              avgTradeTime: 6.8
            },
            riskLevel: 'LOW',
            allocatedCapital: 300000,
            createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
            lastUpdated: Date.now() - 1 * 60 * 60 * 1000
          },
          {
            id: 'ai_pattern_1',
            name: 'AI Pattern Recognition',
            description: 'Deep learning model for pattern recognition and prediction',
            type: 'AI_PATTERN',
            status: 'BACKTESTING',
            parameters: {
              model_version: 'v2.1',
              confidence_threshold: 0.8,
              lookback_period: 50,
              feature_set: ['price', 'volume', 'volatility', 'sentiment'],
              rebalance_frequency: 'daily'
            },
            performance: {
              totalTrades: 89,
              winRate: 74.2,
              totalReturn: 31.8,
              maxDrawdown: 6.3,
              sharpeRatio: 2.1,
              avgTradeTime: 2.1
            },
            riskLevel: 'HIGH',
            allocatedCapital: 750000,
            createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
            lastUpdated: Date.now() - 30 * 60 * 1000
          }
        ];
        
        setStrategies(sampleStrategies);
        setSelectedStrategy(sampleStrategies[0]);
      } else {
        setStrategies(data);
        setSelectedStrategy(data[0]);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const runBacktest = async (strategyId: string) => {
    try {
      setIsBacktesting(true);
      const result = await liveDataService.runBacktest(strategyId);
      
      // If no real data, generate sample backtest result
      if (!result) {
        const sampleResult: BacktestResult = {
          strategyId,
          period: '2023-01-01 to 2023-12-31',
          initialCapital: 1000000,
          finalCapital: 1287000,
          totalReturn: 28.7,
          maxDrawdown: 9.3,
          sharpeRatio: 1.9,
          totalTrades: 234,
          winRate: 64.5,
          profitFactor: 1.7,
          trades: Array.from({ length: 50 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            symbol: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'][Math.floor(Math.random() * 4)],
            type: Math.random() > 0.5 ? 'BUY' : 'SELL',
            quantity: Math.floor(Math.random() * 1000) + 1,
            price: Math.random() * 1000 + 100,
            pnl: (Math.random() - 0.5) * 10000
          }))
        };
        setBacktestResults(sampleResult);
      } else {
        setBacktestResults(result);
      }
    } catch (error) {
      console.error('Error running backtest:', error);
    } finally {
      setIsBacktesting(false);
    }
  };

  const toggleStrategy = async (strategyId: string) => {
    try {
      const strategy = strategies.find(s => s.id === strategyId);
      if (!strategy) return;

      const newStatus = strategy.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      
      // Update local state
      setStrategies(prev => 
        prev.map(s => 
          s.id === strategyId 
            ? { ...s, status: newStatus, lastUpdated: Date.now() }
            : s
        )
      );

      // Update selected strategy if it's the one being toggled
      if (selectedStrategy?.id === strategyId) {
        setSelectedStrategy(prev => 
          prev ? { ...prev, status: newStatus, lastUpdated: Date.now() } : null
        );
      }

      // Call API to update strategy status
      await liveDataService.updateStrategyStatus(strategyId, newStatus);
    } catch (error) {
      console.error('Error toggling strategy:', error);
    }
  };

  const createStrategy = async () => {
    try {
      const strategy: Strategy = {
        id: `strategy_${Date.now()}`,
        ...newStrategy,
        status: 'STOPPED',
        performance: {
          totalTrades: 0,
          winRate: 0,
          totalReturn: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
          avgTradeTime: 0
        },
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      setStrategies(prev => [...prev, strategy]);
      setShowCreateModal(false);
      setNewStrategy({
        name: '',
        description: '',
        type: 'MOMENTUM',
        riskLevel: 'MEDIUM',
        allocatedCapital: 100000,
        parameters: {}
      });

      // Call API to create strategy
      await liveDataService.createStrategy(strategy);
    } catch (error) {
      console.error('Error creating strategy:', error);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const getStatusColor = (status: Strategy['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-500';
      case 'PAUSED':
        return 'text-yellow-500';
      case 'STOPPED':
        return 'text-red-500';
      case 'BACKTESTING':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getRiskColor = (risk: Strategy['riskLevel']) => {
    switch (risk) {
      case 'LOW':
        return 'text-green-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      case 'HIGH':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Strategy Lab
              </h1>
              <p className="text-text-secondary">
                Create, test, and optimize your trading strategies
              </p>
            </div>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-accent-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-secondary transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Strategy</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy List */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border-primary">
                <h2 className="text-lg font-semibold text-text-primary">Strategies</h2>
              </div>
              <div className="divide-y divide-border-primary">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary mx-auto mb-2"></div>
                    <span className="text-text-secondary">Loading strategies...</span>
                  </div>
                ) : (
                  strategies.map((strategy) => (
                    <motion.div
                      key={strategy.id}
                      onClick={() => setSelectedStrategy(strategy)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-bg-tertiary ${
                        selectedStrategy?.id === strategy.id ? 'bg-bg-tertiary' : ''
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-text-primary">{strategy.name}</h3>
                        <span className={`text-xs font-medium ${getStatusColor(strategy.status)}`}>
                          {strategy.status}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm mb-2 line-clamp-2">
                        {strategy.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{strategy.type}</span>
                        <span className={`font-medium ${getRiskColor(strategy.riskLevel)}`}>
                          {strategy.riskLevel} Risk
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-text-secondary">
                          {strategy.performance.totalTrades} trades
                        </span>
                        <span className={`font-medium ${
                          strategy.performance.totalReturn >= 0 ? 'text-profit' : 'text-loss'
                        }`}>
                          {strategy.performance.totalReturn >= 0 ? '+' : ''}{strategy.performance.totalReturn.toFixed(1)}%
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Strategy Details */}
          <div className="lg:col-span-2">
            {selectedStrategy ? (
              <div className="bg-bg-secondary rounded-lg">
                {/* Strategy Header */}
                <div className="p-6 border-b border-border-primary">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary mb-2">
                        {selectedStrategy.name}
                      </h2>
                      <p className="text-text-secondary">{selectedStrategy.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => toggleStrategy(selectedStrategy.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedStrategy.status === 'ACTIVE'
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {selectedStrategy.status === 'ACTIVE' ? (
                          <>
                            <PauseIcon className="w-4 h-4" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-4 h-4" />
                            <span>Start</span>
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => runBacktest(selectedStrategy.id)}
                        disabled={isBacktesting}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <BeakerIcon className="w-4 h-4" />
                        <span>{isBacktesting ? 'Running...' : 'Backtest'}</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Strategy Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-bg-tertiary rounded-lg p-3">
                      <p className="text-text-secondary text-sm">Total Return</p>
                      <p className={`text-lg font-bold ${
                        selectedStrategy.performance.totalReturn >= 0 ? 'text-profit' : 'text-loss'
                      }`}>
                        {selectedStrategy.performance.totalReturn >= 0 ? '+' : ''}{selectedStrategy.performance.totalReturn.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3">
                      <p className="text-text-secondary text-sm">Win Rate</p>
                      <p className="text-lg font-bold text-text-primary">
                        {selectedStrategy.performance.winRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3">
                      <p className="text-text-secondary text-sm">Sharpe Ratio</p>
                      <p className="text-lg font-bold text-text-primary">
                        {selectedStrategy.performance.sharpeRatio.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3">
                      <p className="text-text-secondary text-sm">Max Drawdown</p>
                      <p className="text-lg font-bold text-loss">
                        -{selectedStrategy.performance.maxDrawdown.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-border-primary">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'overview', label: 'Overview', icon: EyeIcon },
                      { id: 'parameters', label: 'Parameters', icon: AdjustmentsHorizontalIcon },
                      { id: 'backtest', label: 'Backtest', icon: BeakerIcon },
                      { id: 'performance', label: 'Performance', icon: ChartBarIcon }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab.id
                              ? 'border-accent-primary text-accent-primary'
                              : 'border-transparent text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Strategy Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Type</p>
                            <p className="text-text-primary font-medium">{selectedStrategy.type}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Risk Level</p>
                            <p className={`font-medium ${getRiskColor(selectedStrategy.riskLevel)}`}>
                              {selectedStrategy.riskLevel}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Allocated Capital</p>
                            <p className="text-text-primary font-medium">
                              ₹{selectedStrategy.allocatedCapital.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Status</p>
                            <p className={`font-medium ${getStatusColor(selectedStrategy.status)}`}>
                              {selectedStrategy.status}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Performance Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-bg-tertiary rounded-lg p-4">
                            <p className="text-text-secondary text-sm mb-1">Total Trades</p>
                            <p className="text-2xl font-bold text-text-primary">
                              {selectedStrategy.performance.totalTrades}
                            </p>
                          </div>
                          <div className="bg-bg-tertiary rounded-lg p-4">
                            <p className="text-text-secondary text-sm mb-1">Avg Trade Time</p>
                            <p className="text-2xl font-bold text-text-primary">
                              {selectedStrategy.performance.avgTradeTime.toFixed(1)}h
                            </p>
                          </div>
                          <div className="bg-bg-tertiary rounded-lg p-4">
                            <p className="text-text-secondary text-sm mb-1">Last Updated</p>
                            <p className="text-sm text-text-primary">
                              {new Date(selectedStrategy.lastUpdated).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'parameters' && (
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Strategy Parameters</h3>
                      <div className="bg-bg-tertiary rounded-lg p-4">
                        <pre className="text-text-primary text-sm overflow-x-auto">
                          {JSON.stringify(selectedStrategy.parameters, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {activeTab === 'backtest' && (
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Backtest Results</h3>
                      {backtestResults ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-bg-tertiary rounded-lg p-4">
                              <p className="text-text-secondary text-sm mb-1">Total Return</p>
                              <p className={`text-2xl font-bold ${
                                backtestResults.totalReturn >= 0 ? 'text-profit' : 'text-loss'
                              }`}>
                                {backtestResults.totalReturn >= 0 ? '+' : ''}{backtestResults.totalReturn.toFixed(1)}%
                              </p>
                            </div>
                            <div className="bg-bg-tertiary rounded-lg p-4">
                              <p className="text-text-secondary text-sm mb-1">Win Rate</p>
                              <p className="text-2xl font-bold text-text-primary">
                                {backtestResults.winRate.toFixed(1)}%
                              </p>
                            </div>
                            <div className="bg-bg-tertiary rounded-lg p-4">
                              <p className="text-text-secondary text-sm mb-1">Sharpe Ratio</p>
                              <p className="text-2xl font-bold text-text-primary">
                                {backtestResults.sharpeRatio.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="bg-bg-tertiary rounded-lg p-4">
                            <p className="text-text-secondary text-sm mb-2">Test Period: {backtestResults.period}</p>
                            <p className="text-text-secondary text-sm mb-2">
                              Initial Capital: ₹{backtestResults.initialCapital.toLocaleString()}
                            </p>
                            <p className="text-text-secondary text-sm">
                              Final Capital: ₹{backtestResults.finalCapital.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BeakerIcon className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                          <p className="text-text-secondary">No backtest results available</p>
                          <p className="text-text-secondary text-sm">Run a backtest to see detailed results</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'performance' && (
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Performance Analysis</h3>
                      <div className="text-center py-8">
                        <ChartBarIcon className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                        <p className="text-text-secondary">Performance charts coming soon</p>
                        <p className="text-text-secondary text-sm">Real-time performance visualization</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-bg-secondary rounded-lg p-8 text-center">
                <BeakerIcon className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">Select a strategy to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Strategy Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-bg-secondary rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-bold text-text-primary mb-4">Create New Strategy</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-1">Name</label>
                  <input
                    type="text"
                    value={newStrategy.name}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    placeholder="Enter strategy name"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-1">Description</label>
                  <textarea
                    value={newStrategy.description}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    placeholder="Enter strategy description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-1">Type</label>
                  <select
                    value={newStrategy.type}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="MOMENTUM">Momentum</option>
                    <option value="MEAN_REVERSION">Mean Reversion</option>
                    <option value="BREAKOUT">Breakout</option>
                    <option value="ARBITRAGE">Arbitrage</option>
                    <option value="AI_PATTERN">AI Pattern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-1">Risk Level</label>
                  <select
                    value={newStrategy.riskLevel}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-1">Allocated Capital</label>
                  <input
                    type="number"
                    value={newStrategy.allocatedCapital}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, allocatedCapital: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    placeholder="Enter allocated capital"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-bg-tertiary text-text-primary rounded-lg font-medium hover:bg-bg-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createStrategy}
                  className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-secondary transition-colors"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StrategyLab;
