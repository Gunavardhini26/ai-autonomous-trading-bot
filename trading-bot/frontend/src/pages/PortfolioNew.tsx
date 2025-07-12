import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Activity,
  Target,
  AlertTriangle,
  Eye,
  RefreshCw,
  Download
} from 'lucide-react';

interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  exchange: 'NSE' | 'BSE';
  segment: 'EQUITY' | 'FO' | 'COMMODITY' | 'CURRENCY';
  isin: string;
}

interface PortfolioSummary {
  totalValue: number;
  totalInvestment: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

interface AllocationData {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

const PortfolioNew: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'equity' | 'fo' | 'commodity' | 'currency'>('equity');
  const [holdings, setHoldings] = useState<Holding[]>([
    {
      symbol: 'RELIANCE',
      quantity: 100,
      avgPrice: 2450.00,
      currentPrice: 2485.50,
      marketValue: 248550,
      pnl: 3550,
      pnlPercent: 1.45,
      exchange: 'NSE',
      segment: 'EQUITY',
      isin: 'INE002A01018'
    },
    {
      symbol: 'TCS',
      quantity: 50,
      avgPrice: 3400.00,
      currentPrice: 3421.80,
      marketValue: 171090,
      pnl: 1090,
      pnlPercent: 0.64,
      exchange: 'NSE',
      segment: 'EQUITY',
      isin: 'INE467B01029'
    },
    {
      symbol: 'INFY',
      quantity: 75,
      avgPrice: 1580.00,
      currentPrice: 1567.90,
      marketValue: 117592.50,
      pnl: -907.50,
      pnlPercent: -0.77,
      exchange: 'NSE',
      segment: 'EQUITY',
      isin: 'INE009A01021'
    },
    {
      symbol: 'HDFC',
      quantity: 200,
      avgPrice: 1700.00,
      currentPrice: 1678.30,
      marketValue: 335660,
      pnl: -4340,
      pnlPercent: -1.28,
      exchange: 'NSE',
      segment: 'EQUITY',
      isin: 'INE040A01034'
    },
    {
      symbol: 'ICICI',
      quantity: 150,
      avgPrice: 970.00,
      currentPrice: 987.65,
      marketValue: 148147.50,
      pnl: 2647.50,
      pnlPercent: 1.82,
      exchange: 'NSE',
      segment: 'EQUITY',
      isin: 'INE090A01021'
    }
  ]);

  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValue: 1021040,
    totalInvestment: 1000000,
    totalPnL: 21040,
    totalPnLPercent: 2.10,
    dayChange: 8450,
    dayChangePercent: 0.83
  });

  const [allocationData, setAllocationData] = useState<AllocationData[]>([
    { sector: 'Technology', value: 288682.50, percentage: 28.3, color: '#3b82f6' },
    { sector: 'Oil & Gas', value: 248550, percentage: 24.3, color: '#10b981' },
    { sector: 'Banking', value: 483807.50, percentage: 47.4, color: '#f59e0b' }
  ]);

  // Real-time price updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHoldings(prev => prev.map(holding => {
        const newPrice = holding.currentPrice + (Math.random() - 0.5) * 20;
        const newMarketValue = holding.quantity * newPrice;
        const investment = holding.quantity * holding.avgPrice;
        const newPnL = newMarketValue - investment;
        const newPnLPercent = (newPnL / investment) * 100;

        return {
          ...holding,
          currentPrice: newPrice,
          marketValue: newMarketValue,
          pnl: newPnL,
          pnlPercent: newPnLPercent
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update portfolio summary when holdings change
  useEffect(() => {
    const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
    const totalInvestment = holdings.reduce((sum, holding) => sum + (holding.quantity * holding.avgPrice), 0);
    const totalPnL = totalValue - totalInvestment;
    const totalPnLPercent = (totalPnL / totalInvestment) * 100;

    setPortfolioSummary(prev => ({
      ...prev,
      totalValue,
      totalInvestment,
      totalPnL,
      totalPnLPercent
    }));
  }, [holdings]);

  const filteredHoldings = holdings.filter(holding => holding.segment === activeTab.toUpperCase());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your investments and portfolio performance
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(portfolioSummary.totalValue)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-2xl font-bold ${
                    portfolioSummary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatNumber(portfolioSummary.totalPnL)}
                  </p>
                  <span className={`flex items-center text-sm ${
                    portfolioSummary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {portfolioSummary.totalPnL >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(portfolioSummary.totalPnLPercent).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                portfolioSummary.totalPnL >= 0 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                {portfolioSummary.totalPnL >= 0 ? (
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Day Change</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-2xl font-bold ${
                    portfolioSummary.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatNumber(portfolioSummary.dayChange)}
                  </p>
                  <span className={`flex items-center text-sm ${
                    portfolioSummary.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {portfolioSummary.dayChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(portfolioSummary.dayChangePercent).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Target className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Invested</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(portfolioSummary.totalInvestment)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Holdings</h3>
                
                {/* Segment Tabs */}
                <div className="mt-4">
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                      {[
                        { key: 'equity', label: 'Equity', count: holdings.filter(h => h.segment === 'EQUITY').length },
                        { key: 'fo', label: 'F&O', count: holdings.filter(h => h.segment === 'FO').length },
                        { key: 'commodity', label: 'Commodity', count: holdings.filter(h => h.segment === 'COMMODITY').length },
                        { key: 'currency', label: 'Currency', count: holdings.filter(h => h.segment === 'CURRENCY').length }
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
                          <span>{tab.label}</span>
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Instrument
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Avg Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        LTP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        P&L
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredHoldings.map((holding) => (
                      <tr key={holding.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {holding.symbol}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {holding.exchange}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {holding.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{holding.avgPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{holding.currentPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center space-x-1 ${
                            holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {holding.pnl >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <div>
                              <div className="text-sm font-medium">
                                {formatCurrency(holding.pnl)}
                              </div>
                              <div className="text-xs">
                                ({holding.pnlPercent.toFixed(2)}%)
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(holding.marketValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Asset Allocation & Risk Analysis */}
          <div className="space-y-6">
            {/* Asset Allocation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Asset Allocation
              </h3>
              
              {/* Pie Chart Placeholder */}
              <div className="h-48 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sector Allocation Chart</p>
                </div>
              </div>

              <div className="space-y-3">
                {allocationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.sector}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.percentage}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatNumber(item.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Risk Analysis
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Portfolio Beta</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">1.23</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">1.45</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</span>
                  <span className="text-sm font-medium text-red-600">-8.5%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Volatility (30D)</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">18.2%</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Risk Alert
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      High concentration in Banking sector (47.4%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioNew;
