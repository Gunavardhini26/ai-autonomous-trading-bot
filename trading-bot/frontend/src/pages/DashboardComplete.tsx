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
    .filter((item: MarketData) => item.change_percent > 0)
    .sort((a: MarketData, b: MarketData) => b.change_percent - a.change_percent)
    .slice(0, 3);

  const topLosers = marketData
    .filter((item: MarketData) => item.change_percent < 0)
    .sort((a: MarketData, b: MarketData) => a.change_percent - b.change_percent)
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

export default DashboardNew;
