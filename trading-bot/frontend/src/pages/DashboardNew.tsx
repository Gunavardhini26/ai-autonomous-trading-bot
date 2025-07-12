import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  Zap,
  Bot,
  Pause,
  Play,
  RotateCcw,
  RefreshCw,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

interface MarketData {
  symbol: string;
  current_price: number;
  change_percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: string;
}

interface Portfolio {
  total_value: number;
  total_pnl: number;
  paper_balance: number;
  positions_count: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, trend, loading }) => {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    down: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    neutral: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h3>
        <div className={`p-2 rounded-lg ${trendColors[trend]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="space-y-2">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
            <div className={`text-sm flex items-center space-x-1 ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : 
              trend === 'down' ? 'text-red-600 dark:text-red-400' : 
              'text-slate-600 dark:text-slate-400'
            }`}>
              {trend === 'up' && <TrendingUp className="w-4 h-4" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4" />}
              <span>{change}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  pnl: number;
  time: string;
}

interface BotStatus {
  status: 'ON' | 'LEARNING' | 'DISABLED' | 'PAUSED';
  accuracy: number;
  latency: number;
  lastUpdate: string;
}

const DashboardNew: React.FC = () => {
  const { user } = useAuth();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const headers = {
          'Authorization': `Bearer ${token}`
        };

        // Fetch market data
        const marketResponse = await fetch('http://localhost:8000/api/market/live', { headers });
        if (marketResponse.ok) {
          const marketResult = await marketResponse.json();
          setMarketData(marketResult.data);
        }

        // Fetch portfolio summary
        const portfolioResponse = await fetch('http://localhost:8000/api/portfolio/summary', { headers });
        if (portfolioResponse.ok) {
          const portfolioResult = await portfolioResponse.json();
          setPortfolio(portfolioResult);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${user.id}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      setLastUpdate(new Date().toLocaleTimeString());
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'market_update') {
          setMarketData(data.data);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
    };
    
    return () => {
      ws.close();
    };
  }, [user]);

  const topGainers = marketData
    .filter(item => item.change_percent > 0)
    .sort((a, b) => b.change_percent - a.change_percent)
    .slice(0, 3);

  const topLosers = marketData
    .filter(item => item.change_percent < 0)
    .sort((a, b) => a.change_percent - b.change_percent)
    .slice(0, 3);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isConnected ? 'Live market data' : 'Offline'} • Last update: {lastUpdate}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Portfolio Value"
          value={portfolio ? `₹${portfolio.total_value.toLocaleString()}` : '₹0'}
          change={portfolio ? `₹${portfolio.total_pnl.toFixed(2)}` : '₹0'}
          icon={DollarSign}
          trend={portfolio && portfolio.total_pnl > 0 ? 'up' : portfolio && portfolio.total_pnl < 0 ? 'down' : 'neutral'}
          loading={loading}
        />
        <MetricCard
          title="Paper Balance"
          value={portfolio ? `₹${portfolio.paper_balance.toLocaleString()}` : '₹100,000'}
          change="Paper Trading"
          icon={Target}
          trend="neutral"
          loading={loading}
        />
        <MetricCard
          title="Active Positions"
          value={portfolio ? portfolio.positions_count.toString() : '0'}
          change="Positions"
          icon={BarChart3}
          trend="neutral"
          loading={loading}
        />
        <MetricCard
          title="Market Status"
          value={isConnected ? 'Live' : 'Offline'}
          change={marketData.length > 0 ? `${marketData.length} stocks` : 'No data'}
          icon={Activity}
          trend={isConnected ? 'up' : 'down'}
          loading={loading}
        />
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            Top Gainers
          </h3>
          <div className="space-y-3">
            {topGainers.map((stock, index) => (
              <div key={stock.symbol} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{stock.symbol}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">₹{stock.current_price.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600 dark:text-green-400">
                    +{stock.change_percent.toFixed(2)}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Vol: {(stock.volume / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
            Top Losers
          </h3>
          <div className="space-y-3">
            {topLosers.map((stock, index) => (
              <div key={stock.symbol} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{stock.symbol}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">₹{stock.current_price.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-red-600 dark:text-red-400">
                    {stock.change_percent.toFixed(2)}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Vol: {(stock.volume / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <div className="text-green-600 dark:text-green-400 font-medium">Buy Order</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Place buy order</div>
          </button>
          <button className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <div className="text-red-600 dark:text-red-400 font-medium">Sell Order</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Place sell order</div>
          </button>
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <div className="text-blue-600 dark:text-blue-400 font-medium">Watchlist</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Manage watchlist</div>
          </button>
          <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <div className="text-purple-600 dark:text-purple-400 font-medium">AI Signals</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">View AI signals</div>
          </button>
        </div>
      </div>
    </div>
  );
};
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [botStatus, setBotStatus] = useState<BotStatus>({
    status: 'ON',
    accuracy: 94.2,
    latency: 12,
    lastUpdate: new Date().toISOString()
  });

  const [metrics, setMetrics] = useState({
    totalPnL: { value: '+₹12,450', change: '+15.2%', trend: 'up' as const },
    todayPnL: { value: '+₹850', change: '+8.5%', trend: 'up' as const },
    activeTrades: { value: '3', change: '2 pending', trend: 'neutral' as const },
    successRate: { value: '78%', change: '+2.1%', trend: 'up' as const }
  });

  const [recentTrades, setRecentTrades] = useState<Trade[]>([
    { id: '1', symbol: 'RELIANCE', type: 'BUY', quantity: 50, price: 2450, pnl: 125, time: '10:30 AM' },
    { id: '2', symbol: 'TCS', type: 'SELL', quantity: 25, price: 3200, pnl: 200, time: '11:15 AM' },
    { id: '3', symbol: 'HDFC', type: 'BUY', quantity: 30, price: 1650, pnl: -50, time: '12:00 PM' },
    { id: '4', symbol: 'INFY', type: 'SELL', quantity: 40, price: 1450, pnl: 175, time: '12:30 PM' }
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBotAction = (action: 'pause' | 'resume' | 'refresh') => {
    setBotStatus(prev => ({
      ...prev,
      status: action === 'pause' ? 'PAUSED' : action === 'resume' ? 'ON' : prev.status,
      lastUpdate: new Date().toISOString()
    }));
  };

  const getStatusColor = (status: BotStatus['status']) => {
    switch (status) {
      case 'ON': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'LEARNING': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'DISABLED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back, {user?.name || 'Trader'}! Here's your trading overview.
          </p>
        </div>
        
        {/* Bot Control */}
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(botStatus.status)}`}>
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>AI Bot: {botStatus.status}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {botStatus.status === 'ON' ? (
              <button
                onClick={() => handleBotAction('pause')}
                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                title="Pause AI Bot"
              >
                <Pause className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => handleBotAction('resume')}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Resume AI Bot"
              >
                <Play className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={() => handleBotAction('refresh')}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Refresh Token"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total P&L"
          value={metrics.totalPnL.value}
          change={metrics.totalPnL.change}
          icon={TrendingUp}
          trend={metrics.totalPnL.trend}
          loading={loading}
        />
        <MetricCard
          title="Today's P&L"
          value={metrics.todayPnL.value}
          change={metrics.todayPnL.change}
          icon={Activity}
          trend={metrics.todayPnL.trend}
          loading={loading}
        />
        <MetricCard
          title="Active Trades"
          value={metrics.activeTrades.value}
          change={metrics.activeTrades.change}
          icon={Target}
          trend={metrics.activeTrades.trend}
          loading={loading}
        />
        <MetricCard
          title="Success Rate"
          value={metrics.successRate.value}
          change={metrics.successRate.change}
          icon={TrendingUp}
          trend={metrics.successRate.trend}
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trades */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent Trades</h3>
              <button className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      trade.type === 'BUY' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 
                      'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {trade.type === 'BUY' ? 'B' : 'S'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{trade.symbol}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {trade.type} {trade.quantity} @ ₹{trade.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-semibold ${
                      trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{trade.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Status & Performance */}
        <div className="space-y-6">
          {/* AI Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">AI Performance</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Model Accuracy</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{botStatus.accuracy}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Avg. Latency</span>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{botStatus.latency}ms</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Data Processing</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 dark:text-green-400 font-medium">Live</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Risk Management</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Next Training</span>
                <span className="text-slate-600 dark:text-slate-400">2h 15m</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <RotateCcw className="w-5 h-5" />
                <span>Switch to Paper Mode</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                <Pause className="w-5 h-5" />
                <span>Pause All Strategies</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <Zap className="w-5 h-5" />
                <span>Force Refresh Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNew;
