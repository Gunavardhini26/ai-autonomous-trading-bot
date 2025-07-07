import React, { useState, useEffect, useCallback } from 'react';
// import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import PortfolioChart from './PortfolioChart';
import AISignalsPanel from './AISignalsPanel';
import RiskMetrics from './RiskMetrics';
import PerformanceMetrics from './PerformanceMetrics';
import MarketOverview from './MarketOverview';
import TradingActivity from './TradingActivity';

interface DashboardData {
  portfolio: {
    totalValue: number;
    totalPnL: number;
    totalPnLPercent: number;
    positions: any[];
    dailyPnL: number;
  };
  risk: {
    portfolioRisk: number;
    var95: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  ai_signals: any[];
  timestamp: number;
}

const AdvancedDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const { socket, isConnected } = useWebSocket();

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/dashboard');
      const data = await response.json();
      setDashboardData(data);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (socket) {
      socket.on('portfolio_update', (data) => {
        setDashboardData(prev => prev ? { ...prev, portfolio: data } : null);
        setLastUpdate(new Date());
      });

      socket.on('ai_signals', (data) => {
        setDashboardData(prev => prev ? { ...prev, ai_signals: data } : null);
      });

      socket.emit('subscribe', { type: 'get_portfolio' });
      socket.emit('subscribe', { type: 'get_signals' });
    }
  }, [socket]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Unable to load dashboard data. Please try refreshing.
        </p>
      </div>
    );
  }

  const { portfolio, risk, ai_signals } = dashboardData;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🤖 AI Trading Dashboard
          </h1>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            Last updated: {lastUpdate.toLocaleTimeString()}
            <div className={`ml-4 flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover:scale-105 transform"
        >
          Refresh Data
        </button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(portfolio.totalValue)}
          change={portfolio.totalPnL}
          changePercent={portfolio.totalPnLPercent}
          icon={ChartBarIcon}
          color="blue"
        />
        <MetricCard
          title="Daily P&L"
          value={formatCurrency(portfolio.dailyPnL)}
          change={portfolio.dailyPnL}
          icon={portfolio.dailyPnL >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
          color={portfolio.dailyPnL >= 0 ? "green" : "red"}
        />
        <MetricCard
          title="Portfolio Risk"
          value={formatPercent(risk.portfolioRisk)}
          subtitle={`VaR 95%: ${formatCurrency(risk.var95)}`}
          icon={ExclamationTriangleIcon}
          color="yellow"
        />
        <MetricCard
          title="Sharpe Ratio"
          value={risk.sharpeRatio?.toFixed(2) || 'N/A'}
          subtitle={`Max DD: ${formatPercent(risk.maxDrawdown)}`}
          icon={SparklesIcon}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Chart - Large */}
        <div className="lg:col-span-2">
          <PortfolioChart data={portfolio} />
        </div>
        
        {/* AI Signals Panel */}
        <div>
          <AISignalsPanel signals={ai_signals} />
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskMetrics riskData={risk} />
        <PerformanceMetrics performanceData={performance} />
      </div>

      {/* Full Width Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MarketOverview marketData={{}} />
        <TradingActivity activities={[]} />
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changePercent?: number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changePercent,
  subtitle,
  icon: Icon,
  color
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} bg-white shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {formatCurrency(Math.abs(change))}
              {changePercent !== undefined && ` (${formatPercent(changePercent)})`}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${colorClasses[color].split(' ')[1]}`} />
      </div>
    </div>
  );
};

export default AdvancedDashboard;
