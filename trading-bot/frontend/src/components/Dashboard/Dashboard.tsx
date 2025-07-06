import React, { useState, useEffect } from 'react';
import { ChartBarIcon, CpuChipIcon, ExclamationTriangleIcon, TrendingUpIcon } from '@heroicons/react/24/outline';

interface DashboardData {
  portfolio: {
    totalValue: number;
    totalPnL: number;
    totalPnLPercent: number;
    dailyPnL: number;
  };
  risk: {
    portfolioRisk: number;
    var95: number;
    sharpeRatio: number;
  };
  aiSignals: any[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard');
        const result = await response.json();
        setData(result);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🤖 AI Trading Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time overview of your AI-powered trading portfolio</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(data.portfolio.totalValue)}
          change={data.portfolio.totalPnL}
          changePercent={data.portfolio.totalPnLPercent}
          icon={ChartBarIcon}
          color="blue"
        />
        <MetricCard
          title="Daily P&L"
          value={formatCurrency(data.portfolio.dailyPnL)}
          change={data.portfolio.dailyPnL}
          icon={data.portfolio.dailyPnL >= 0 ? TrendingUpIcon : ExclamationTriangleIcon}
          color={data.portfolio.dailyPnL >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Portfolio Risk"
          value={formatPercent(data.risk.portfolioRisk)}
          subtitle={`VaR 95%: ${formatCurrency(data.risk.var95)}`}
          icon={ExclamationTriangleIcon}
          color="yellow"
        />
        <MetricCard
          title="Sharpe Ratio"
          value={data.risk.sharpeRatio?.toFixed(2) || 'N/A'}
          icon={CpuChipIcon}
          color="purple"
        />
      </div>

      {/* AI Signals Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🤖 Latest AI Signals</h2>
        {data.aiSignals && data.aiSignals.length > 0 ? (
          <div className="space-y-3">
            {data.aiSignals.slice(0, 5).map((signal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{signal.symbol}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${
                    signal.signal_type === 'BUY' ? 'bg-green-100 text-green-800' :
                    signal.signal_type === 'SELL' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {signal.signal_type}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Confidence: {(signal.confidence * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No active signals</p>
        )}
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

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changePercent, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} bg-white shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}
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

export default Dashboard;
