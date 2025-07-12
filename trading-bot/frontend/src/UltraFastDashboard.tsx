import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './index.css';

// Ultra-fast components with minimal re-renders
const UltraFastDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>({});
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // WebSocket connection with reconnection
  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      setConnected(true);
      console.log('🔌 WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'market_update' || data.type === 'price_update') {
          setMarketData(data.data);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    ws.onclose = () => {
      setConnected(false);
      console.log('🔌 WebSocket disconnected, reconnecting...');
      setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return ws;
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [marketRes, portfolioRes] = await Promise.all([
        fetch('http://localhost:8000/api/market-data'),
        fetch('http://localhost:8000/api/portfolio')
      ]);
      
      const marketData = await marketRes.json();
      const portfolioData = await portfolioRes.json();
      
      setMarketData(marketData.data || []);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const ws = connectWebSocket();
    
    return () => {
      ws.close();
    };
  }, [fetchData, connectWebSocket]);

  // Memoized components for performance
  const MarketDataTable = useMemo(() => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Market Data</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">{connected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Symbol</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Change</th>
              <th className="text-right py-2">Volume</th>
            </tr>
          </thead>
          <tbody>
            {marketData.map((item, index) => (
              <tr key={`${item.symbol}-${index}`} className="border-b hover:bg-gray-50">
                <td className="py-2 font-medium">{item.symbol}</td>
                <td className="py-2 text-right">₹{item.price?.toFixed(2)}</td>
                <td className={`py-2 text-right ${item.change?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {item.change}
                </td>
                <td className="py-2 text-right text-gray-600">{item.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lastUpdate && (
        <div className="mt-4 text-sm text-gray-500">
          Last updated: {lastUpdate}
        </div>
      )}
    </div>
  ), [marketData, connected, lastUpdate]);

  const PortfolioCard = useMemo(() => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
      <h2 className="text-xl font-bold mb-4">Portfolio</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm opacity-80">Total Value</div>
          <div className="text-2xl font-bold">₹{portfolio.total_value?.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm opacity-80">Day P&L</div>
          <div className={`text-xl font-bold ${portfolio.day_pnl?.startsWith('+') ? 'text-green-300' : 'text-red-300'}`}>
            {portfolio.day_pnl}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-sm opacity-80">Day Change</div>
        <div className={`text-lg font-semibold ${portfolio.day_change?.startsWith('+') ? 'text-green-300' : 'text-red-300'}`}>
          {portfolio.day_change}
        </div>
      </div>
    </div>
  ), [portfolio]);

  const QuickActions = useMemo(() => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
          Buy Order
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
          Sell Order
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
          Watchlist
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
          Analytics
        </button>
      </div>
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">AI Trading Bot Ultra</h1>
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">v2.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {connected ? 'Real-time' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Section */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {PortfolioCard}
              {QuickActions}
            </div>
          </div>

          {/* Market Data Section */}
          <div className="lg:col-span-2">
            {MarketDataTable}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Active Orders</div>
            <div className="text-2xl font-bold text-blue-600">12</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Completed Today</div>
            <div className="text-2xl font-bold text-green-600">8</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Win Rate</div>
            <div className="text-2xl font-bold text-purple-600">73%</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Avg Return</div>
            <div className="text-2xl font-bold text-orange-600">+2.4%</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UltraFastDashboard;
