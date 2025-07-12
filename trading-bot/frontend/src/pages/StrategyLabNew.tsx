import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Play,
  Pause,
  Save,
  Download,
  Upload,
  Plus,
  Trash2,
  Settings,
  Brain,
  TrendingUp,
  Target,
  Zap,
  Code,
  FlaskConical
} from 'lucide-react';

interface StrategyRule {
  id: string;
  type: 'CONDITION' | 'ACTION';
  indicator: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  mode: 'RULE_BASED' | 'LSTM' | 'RL';
  rules: StrategyRule[];
  isActive: boolean;
  performance: {
    backtestReturns: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
}

const StrategyLabNew: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'build' | 'backtest' | 'live'>('build');
  const [strategyMode, setStrategyMode] = useState<'RULE_BASED' | 'LSTM' | 'RL'>('RULE_BASED');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);

  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: 'STRAT001',
      name: 'AI Momentum Strategy',
      description: 'Machine learning based momentum strategy with RSI confirmation',
      mode: 'LSTM',
      rules: [],
      isActive: true,
      performance: {
        backtestReturns: 23.5,
        sharpeRatio: 1.8,
        maxDrawdown: -8.2,
        winRate: 68.5
      }
    },
    {
      id: 'STRAT002',
      name: 'Mean Reversion',
      description: 'Rule-based mean reversion with Bollinger Bands',
      mode: 'RULE_BASED',
      rules: [
        { id: 'R1', type: 'CONDITION', indicator: 'RSI', operator: '<', value: '30' },
        { id: 'R2', type: 'CONDITION', indicator: 'BB_LOWER', operator: '>', value: 'CLOSE', logicalOperator: 'AND' },
        { id: 'R3', type: 'ACTION', indicator: 'BUY', operator: '=', value: '100' }
      ],
      isActive: false,
      performance: {
        backtestReturns: 15.2,
        sharpeRatio: 1.2,
        maxDrawdown: -5.8,
        winRate: 72.3
      }
    }
  ]);

  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    rules: [] as StrategyRule[]
  });

  const indicators = ['RSI', 'MACD', 'SMA', 'EMA', 'BB_UPPER', 'BB_LOWER', 'VWAP', 'VOLUME', 'CLOSE', 'OPEN', 'HIGH', 'LOW'];
  const operators = ['>', '<', '>=', '<=', '=', '!=', 'CROSSES_ABOVE', 'CROSSES_BELOW'];
  const actions = ['BUY', 'SELL', 'HOLD', 'STOP_LOSS', 'TAKE_PROFIT'];

  const addRule = (type: 'CONDITION' | 'ACTION') => {
    const newRule: StrategyRule = {
      id: `R${Date.now()}`,
      type,
      indicator: type === 'CONDITION' ? 'RSI' : 'BUY',
      operator: '>',
      value: '',
      logicalOperator: type === 'CONDITION' ? 'AND' : undefined
    };
    setNewStrategy(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
  };

  const removeRule = (ruleId: string) => {
    setNewStrategy(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId)
    }));
  };

  const updateRule = (ruleId: string, field: string, value: string) => {
    setNewStrategy(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const saveStrategy = () => {
    if (!newStrategy.name || newStrategy.rules.length === 0) return;
    
    const strategy: Strategy = {
      id: `STRAT${Date.now()}`,
      name: newStrategy.name,
      description: newStrategy.description,
      mode: strategyMode,
      rules: newStrategy.rules,
      isActive: false,
      performance: {
        backtestReturns: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0
      }
    };
    
    setStrategies(prev => [...prev, strategy]);
    setNewStrategy({ name: '', description: '', rules: [] });
  };

  const runBacktest = () => {
    setIsSimulating(true);
    // Simulate backtest
    setTimeout(() => {
      setIsSimulating(false);
    }, 3000);
  };

  const getModeIcon = (mode: Strategy['mode']) => {
    switch (mode) {
      case 'RULE_BASED': return <Settings className="h-4 w-4" />;
      case 'LSTM': return <Brain className="h-4 w-4" />;
      case 'RL': return <Zap className="h-4 w-4" />;
    }
  };

  const getModeColor = (mode: Strategy['mode']) => {
    switch (mode) {
      case 'RULE_BASED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'LSTM': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'RL': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Strategy Lab
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Build, test, and deploy AI-powered trading strategies
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'build', label: 'Strategy Builder', icon: <FlaskConical className="h-4 w-4" /> },
                { key: 'backtest', label: 'Backtesting', icon: <TrendingUp className="h-4 w-4" /> },
                { key: 'live', label: 'Live Trading', icon: <Play className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy Builder */}
          <div className="lg:col-span-2">
            {activeTab === 'build' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Create New Strategy
                  </h3>
                  
                  {/* Strategy Mode Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Strategy Mode
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { mode: 'RULE_BASED', label: 'Rule-Based', desc: 'Logic-based conditions' },
                        { mode: 'LSTM', label: 'LSTM Model', desc: 'Deep learning predictions' },
                        { mode: 'RL', label: 'Reinforcement Learning', desc: 'AI reward optimization' }
                      ].map((option) => (
                        <button
                          key={option.mode}
                          onClick={() => setStrategyMode(option.mode as any)}
                          className={`p-3 rounded-lg border-2 text-left transition-colors ${
                            strategyMode === option.mode
                              ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {getModeIcon(option.mode as any)}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {option.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {option.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strategy Details */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Strategy Name
                      </label>
                      <input
                        type="text"
                        value={newStrategy.name}
                        onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter strategy name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newStrategy.description}
                        onChange={(e) => setNewStrategy(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your strategy"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Rule Builder (for Rule-based mode) */}
                {strategyMode === 'RULE_BASED' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Rules</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addRule('CONDITION')}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 
                                   text-white text-sm rounded-lg"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Condition</span>
                        </button>
                        <button
                          onClick={() => addRule('ACTION')}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 
                                   text-white text-sm rounded-lg"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Action</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {newStrategy.rules.map((rule, index) => (
                        <div
                          key={rule.id}
                          className={`p-4 rounded-lg border-2 ${
                            rule.type === 'CONDITION' 
                              ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                              : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rule.type === 'CONDITION'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            }`}>
                              {rule.type}
                            </span>
                            <button
                              onClick={() => removeRule(rule.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <select
                              value={rule.indicator}
                              onChange={(e) => updateRule(rule.id, 'indicator', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            >
                              {(rule.type === 'CONDITION' ? indicators : actions).map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>

                            <select
                              value={rule.operator}
                              onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            >
                              {operators.map(op => (
                                <option key={op} value={op}>{op}</option>
                              ))}
                            </select>

                            <input
                              type="text"
                              value={rule.value}
                              onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                              placeholder="Value"
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />

                            {rule.type === 'CONDITION' && index < newStrategy.rules.filter(r => r.type === 'CONDITION').length - 1 && (
                              <select
                                value={rule.logicalOperator || 'AND'}
                                onChange={(e) => updateRule(rule.id, 'logicalOperator', e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              >
                                <option value="AND">AND</option>
                                <option value="OR">OR</option>
                              </select>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {newStrategy.rules.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Add conditions and actions to build your strategy</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Model Configuration (for LSTM/RL modes) */}
                {(strategyMode === 'LSTM' || strategyMode === 'RL') && (
                  <div className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      {strategyMode} Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Lookback Period
                        </label>
                        <input
                          type="number"
                          placeholder="60"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Features
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <option>OHLCV + Technical Indicators</option>
                          <option>Price Data Only</option>
                          <option>Custom Feature Set</option>
                        </select>
                      </div>
                      {strategyMode === 'RL' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Reward Function
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option>Sharpe Ratio</option>
                              <option>Total Return</option>
                              <option>Risk-Adjusted Return</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Action Space
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option>Discrete (Buy/Sell/Hold)</option>
                              <option>Continuous (Position Size)</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={saveStrategy}
                    disabled={!newStrategy.name || (strategyMode === 'RULE_BASED' && newStrategy.rules.length === 0)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-rose-600 
                             hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                             text-white font-medium rounded-lg"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Strategy</span>
                  </button>
                </div>
              </div>
            )}

            {/* Backtesting Tab */}
            {activeTab === 'backtest' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Strategy Backtesting
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Strategy
                    </label>
                    <select
                      value={selectedStrategy}
                      onChange={(e) => setSelectedStrategy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Choose a strategy</option>
                      {strategies.map(strategy => (
                        <option key={strategy.id} value={strategy.id}>{strategy.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={runBacktest}
                  disabled={isSimulating || !selectedStrategy}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 
                           hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                           text-white font-medium rounded-lg mb-6"
                >
                  {isSimulating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Running Backtest...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Run Backtest</span>
                    </>
                  )}
                </button>

                {/* Backtest Results Placeholder */}
                <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Backtest results will appear here
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Live Trading Tab */}
            {activeTab === 'live' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Live Strategy Deployment
                </h3>
                
                <div className="space-y-4">
                  {strategies.map(strategy => (
                    <div key={strategy.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getModeColor(strategy.mode)}`}>
                          {getModeIcon(strategy.mode)}
                          <span>{strategy.mode.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{strategy.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{strategy.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          strategy.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {strategy.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {strategy.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Strategy List & Performance */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                My Strategies
              </h3>
              
              <div className="space-y-3">
                {strategies.map(strategy => (
                  <div key={strategy.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {strategy.name}
                      </h4>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getModeColor(strategy.mode)}`}>
                        {getModeIcon(strategy.mode)}
                        <span>{strategy.mode}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Returns:</span>
                        <span className={`ml-1 font-medium ${strategy.performance.backtestReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {strategy.performance.backtestReturns.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Win Rate:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {strategy.performance.winRate.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Sharpe:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {strategy.performance.sharpeRatio.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Max DD:</span>
                        <span className="ml-1 font-medium text-red-600">
                          {strategy.performance.maxDrawdown.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                                 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Upload className="h-4 w-4" />
                  <span>Import Strategy</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                                 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="h-4 w-4" />
                  <span>Export All</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 
                                 text-white rounded-lg">
                  <Brain className="h-4 w-4" />
                  <span>AI Strategy Generator</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyLabNew;
