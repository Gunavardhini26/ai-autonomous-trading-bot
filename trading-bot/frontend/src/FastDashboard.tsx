import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Settings, LogOut } from 'lucide-react';

// Fast loading trading dashboard
const FastDashboard = () => {
  const [marketData, setMarketData] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fast data loading
    const loadData = async () => {
      try {
        const [marketRes, portfolioRes] = await Promise.all([
          fetch('/api/market/live-prices'),
          fetch('/api/portfolio/overview')
        ]);
        
        const marketData = await marketRes.json();
        const portfolioData = await portfolioRes.json();
        
        setMarketData(marketData.data || []);
        setPortfolio(portfolioData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading AI Trading Bot...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Trading Bot</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-700 rounded">
            <Settings size={20} />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(portfolio?.total_value || 0)}</p>
              </div>
              <DollarSign className="text-blue-500" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Day P&L</p>
                <p className={`text-2xl font-bold ${getChangeColor(portfolio?.day_pnl || 0)}`}>
                  {formatCurrency(portfolio?.day_pnl || 0)}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Total P&L</p>
                <p className={`text-2xl font-bold ${getChangeColor(portfolio?.total_pnl || 0)}`}>
                  {formatCurrency(portfolio?.total_pnl || 0)}
                </p>
              </div>
              <Activity className="text-purple-500" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Available Margin</p>
                <p className="text-2xl font-bold">{formatCurrency(portfolio?.available_margin || 0)}</p>
              </div>
              <BarChart3 className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>

        {/* Market Data */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Market Data</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3">Symbol</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-right p-3">Change</th>
                  <th className="text-right p-3">Volume</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-3 font-medium">{item.symbol}</td>
                    <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                    <td className={`p-3 text-right ${getChangeColor(item.change)}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">{item.volume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastDashboard;
