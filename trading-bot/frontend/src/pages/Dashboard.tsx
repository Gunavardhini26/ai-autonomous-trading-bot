import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { liveDataService, PortfolioData, LiveTick, AISignal } from '../services/LiveDataService';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [marketTicks, setMarketTicks] = useState<Map<string, LiveTick>>(new Map());
  const [aiSignals, setAiSignals] = useState<AISignal[]>([]);
  const [botStatus, setBotStatus] = useState<'TRAINING' | 'TRADING' | 'STANDBY' | 'PAUSED' | 'ERROR'>('STANDBY');
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'>('CONNECTING');
  const [subscribedSymbols] = useState(['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK']);

  const themeClasses = {
    light: {
      bg: 'bg-light-primary',
      cardBg: 'bg-light-secondary',
      text: 'text-light-text',
      accent: 'text-light-accent',
      border: 'border-light-border',
      success: 'text-light-success',
      warning: 'text-light-warning',
      error: 'text-light-error'
    },
    dark: {
      bg: 'bg-dark-primary',
      cardBg: 'bg-dark-secondary',
      text: 'text-dark-text',
      accent: 'text-dark-accent',
      border: 'border-dark-border',
      success: 'text-dark-success',
      warning: 'text-dark-warning',
      error: 'text-dark-error'
    },
    alert: {
      bg: 'bg-alert-primary',
      cardBg: 'bg-alert-secondary',
      text: 'text-alert-text',
      accent: 'text-alert-accent',
      border: 'border-alert-border',
      success: 'text-alert-success',
      warning: 'text-alert-warning',
      error: 'text-alert-error'
    }
  };

  const currentTheme = themeClasses[theme];

  // Live data subscriptions
  useEffect(() => {
    const setupLiveData = async () => {
      try {
        // Set up WebSocket subscriptions
        liveDataService.subscribe('market_tick', (tick: LiveTick) => {
          setMarketTicks(prev => new Map(prev.set(tick.symbol, tick)));
        });

        liveDataService.subscribe('portfolio_update', (data: PortfolioData) => {
          setPortfolioData(data);
        });

        liveDataService.subscribe('ai_signal', (signal: AISignal) => {
          setAiSignals(prev => [signal, ...prev.slice(0, 9)]);
        });

        // Initial data fetch
        const [portfolio, signals, botStatusData] = await Promise.all([
          liveDataService.getPortfolio(),
          liveDataService.getAISignals(),
          liveDataService.getBotStatus()
        ]);

        setPortfolioData(portfolio);
        setAiSignals(signals);
        setBotStatus(botStatusData.status);
        setConnectionStatus('CONNECTED');

      } catch (error) {
        console.error('Failed to setup live data:', error);
        setConnectionStatus('DISCONNECTED');
      }
    };

    setupLiveData();

    // Cleanup subscriptions
    return () => {
      liveDataService.disconnect();
    };
  }, []);

  // Bot control functions
  const handleBotControl = useCallback(async (action: 'START' | 'STOP' | 'PAUSE' | 'RESUME') => {
    try {
      await liveDataService.controlBot(action);
      const statusData = await liveDataService.getBotStatus();
      setBotStatus(statusData.status);
    } catch (error) {
      console.error('Failed to control bot:', error);
    }
  }, []);

  // Connection status indicator
  const ConnectionIndicator = () => (
    <div className="flex items-center space-x-2">
      <motion.div
        animate={{
          scale: connectionStatus === 'CONNECTED' ? [1, 1.2, 1] : 1,
          opacity: connectionStatus === 'DISCONNECTED' ? 0.5 : 1
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-3 h-3 rounded-full ${
          connectionStatus === 'CONNECTED' ? 'bg-green-500' :
          connectionStatus === 'CONNECTING' ? 'bg-yellow-500' : 'bg-red-500'
        }`}
      />
      <span className={`text-sm ${currentTheme.text}`}>
        {connectionStatus === 'CONNECTED' ? 'Live Data Connected' :
         connectionStatus === 'CONNECTING' ? 'Connecting...' : 'Disconnected'}
      </span>
    </div>
  );

  // Portfolio summary card
  const PortfolioCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${currentTheme.cardBg} ${currentTheme.border} border rounded-xl p-6 shadow-lg`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-lg font-semibold ${currentTheme.text}`}>Portfolio</h3>
        <ConnectionIndicator />
      </div>
      
      {portfolioData ? (
        <div className="space-y-4">
          <div>
            <p className={`text-sm ${currentTheme.text} opacity-70`}>Total Value</p>
            <motion.p
              key={portfolioData.total_value}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-3xl font-bold ${currentTheme.text}`}
            >
              ₹{portfolioData.total_value.toLocaleString()}
            </motion.p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs ${currentTheme.text} opacity-70`}>Day P&L</p>
              <p className={`text-lg font-semibold ${
                portfolioData.day_pnl >= 0 ? currentTheme.success : currentTheme.error
              }`}>
                {portfolioData.day_pnl >= 0 ? '+' : ''}₹{portfolioData.day_pnl.toLocaleString()}
              </p>
            </div>
            <div>
              <p className={`text-xs ${currentTheme.text} opacity-70`}>Available Cash</p>
              <p className={`text-lg font-semibold ${currentTheme.text}`}>
                ₹{portfolioData.available_cash.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-pulse space-y-4">
          <div className={`h-8 ${currentTheme.border} bg-opacity-20 rounded`}></div>
          <div className={`h-6 ${currentTheme.border} bg-opacity-20 rounded w-3/4`}></div>
        </div>
      )}
    </motion.div>
  );

  // Market ticker
  const MarketTicker = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${currentTheme.cardBg} ${currentTheme.border} border rounded-xl p-6 shadow-lg`}
    >
      <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4`}>Live Market</h3>
      
      <div className="space-y-3">
        {subscribedSymbols.map(symbol => {
          const tick = marketTicks.get(symbol);
          return (
            <motion.div
              key={symbol}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between items-center py-2"
            >
              <span className={`font-medium ${currentTheme.text}`}>{symbol}</span>
              <div className="text-right">
                {tick ? (
                  <>
                    <motion.p
                      key={tick.ltp}
                      initial={{ scale: 1.1, color: tick.chng >= 0 ? '#10b981' : '#ef4444' }}
                      animate={{ scale: 1 }}
                      className={`font-semibold ${currentTheme.text}`}
                    >
                      ₹{tick.ltp.toFixed(2)}
                    </motion.p>
                    <p className={`text-sm ${
                      tick.chng >= 0 ? currentTheme.success : currentTheme.error
                    }`}>
                      {tick.chng >= 0 ? '+' : ''}{tick.chng_percent.toFixed(2)}%
                    </p>
                  </>
                ) : (
                  <div className="animate-pulse">
                    <div className={`h-4 w-16 ${currentTheme.border} bg-opacity-20 rounded mb-1`}></div>
                    <div className={`h-3 w-12 ${currentTheme.border} bg-opacity-20 rounded`}></div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // AI Signals panel
  const AISignalsPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`${currentTheme.cardBg} ${currentTheme.border} border rounded-xl p-6 shadow-lg`}
    >
      <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4`}>AI Signals</h3>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        <AnimatePresence>
          {aiSignals.map((signal, index) => (
            <motion.div
              key={`${signal.symbol}-${signal.timestamp}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-3 rounded-lg ${currentTheme.border} border`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`font-semibold ${currentTheme.text}`}>{signal.symbol}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  signal.signal === 'BUY' ? 'bg-green-500 text-white' :
                  signal.signal === 'SELL' ? 'bg-red-500 text-white' :
                  'bg-yellow-500 text-black'
                }`}>
                  {signal.signal}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`${currentTheme.text} opacity-70`}>
                  Confidence: {signal.confidence}%
                </span>
                <span className={`${currentTheme.text} opacity-70`}>
                  Target: ₹{signal.target_price}
                </span>
              </div>
              <p className={`text-xs ${currentTheme.text} opacity-60 mt-2`}>
                {signal.reasoning}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {aiSignals.length === 0 && (
          <div className={`text-center py-8 ${currentTheme.text} opacity-50`}>
            <p>No active signals</p>
            <p className="text-xs mt-1">AI is analyzing market conditions...</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Bot control panel
  const BotControlPanel = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className={`${currentTheme.cardBg} ${currentTheme.border} border rounded-xl p-6 shadow-lg`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${currentTheme.text}`}>Bot Control</h3>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            botStatus === 'TRADING' ? 'bg-green-500 text-white' :
            botStatus === 'TRAINING' ? 'bg-blue-500 text-white' :
            botStatus === 'STANDBY' ? 'bg-yellow-500 text-black' :
            botStatus === 'PAUSED' ? 'bg-orange-500 text-white' :
            'bg-red-500 text-white'
          }`}
        >
          {botStatus}
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleBotControl(botStatus === 'TRADING' ? 'STOP' : 'START')}
          className={`py-3 px-4 rounded-lg font-medium transition-colors ${
            botStatus === 'TRADING'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {botStatus === 'TRADING' ? 'Stop' : 'Start'} Trading
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleBotControl(botStatus === 'PAUSED' ? 'RESUME' : 'PAUSE')}
          disabled={botStatus === 'STANDBY'}
          className={`py-3 px-4 rounded-lg font-medium transition-colors ${
            botStatus === 'STANDBY'
              ? `${currentTheme.border} border ${currentTheme.text} opacity-50 cursor-not-allowed`
              : `bg-blue-500 hover:bg-blue-600 text-white`
          }`}
        >
          {botStatus === 'PAUSED' ? 'Resume' : 'Pause'}
        </motion.button>
      </div>

      <div className="mt-4 pt-4 border-t border-opacity-20">
        <div className="flex justify-between text-sm">
          <span className={`${currentTheme.text} opacity-70`}>Uptime</span>
          <span className={`${currentTheme.text}`}>2h 34m</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className={`${currentTheme.text} opacity-70`}>Orders Today</span>
          <span className={`${currentTheme.text}`}>47</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${currentTheme.bg} transition-colors duration-300`}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${currentTheme.cardBg} ${currentTheme.border} border-b px-6 py-4`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center"
            >
              <span className="text-white font-bold">AI</span>
            </motion.div>
            <div>
              <h1 className={`text-xl font-bold ${currentTheme.text}`}>Trading Dashboard</h1>
              <p className={`text-sm ${currentTheme.text} opacity-70`}>
                Autonomous AI Trading System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${currentTheme.border} border ${currentTheme.text} hover:bg-opacity-10 hover:bg-gray-500 transition-colors`}
            >
              {theme === 'light' ? '🌙' : theme === 'dark' ? '🚨' : '☀️'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Dashboard Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <PortfolioCard />
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${currentTheme.cardBg} ${currentTheme.border} border rounded-xl p-4 text-center shadow-lg`}
              >
                <p className={`text-sm ${currentTheme.text} opacity-70`}>Today's Trades</p>
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`text-2xl font-bold ${currentTheme.text}`}
                >
                  47
                </motion.p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${currentTheme.cardBg} ${currentTheme.border} border rounded-xl p-4 text-center shadow-lg`}
              >
                <p className={`text-sm ${currentTheme.text} opacity-70`}>Win Rate</p>
                <p className={`text-2xl font-bold ${currentTheme.success}`}>73.2%</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${currentTheme.cardBg} ${currentTheme.border} border rounded-xl p-4 text-center shadow-lg`}
              >
                <p className={`text-sm ${currentTheme.text} opacity-70`}>Avg. Return</p>
                <p className={`text-2xl font-bold ${currentTheme.text}`}>+2.4%</p>
              </motion.div>
            </div>
            
            <MarketTicker />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <BotControlPanel />
            <AISignalsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
