import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { portfolio } = useSelector((state: RootState) => state.trading);
  const { liveData } = useSelector((state: RootState) => state.market);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="text-sm text-gray-400">
          Welcome back, {user?.username}
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <h3 className="text-sm font-medium text-gray-400">Total Value</h3>
          <p className="text-2xl font-bold text-white">
            ₹{portfolio.total_value.toLocaleString()}
          </p>
        </div>
        
        <div className="metric-card">
          <h3 className="text-sm font-medium text-gray-400">Available Balance</h3>
          <p className="text-2xl font-bold text-white">
            ₹{portfolio.available_balance.toLocaleString()}
          </p>
        </div>
        
        <div className="metric-card">
          <h3 className="text-sm font-medium text-gray-400">Day P&L</h3>
          <p className={`text-2xl font-bold ${portfolio.day_pnl >= 0 ? 'price-up' : 'price-down'}`}>
            ₹{portfolio.day_pnl.toLocaleString()}
          </p>
        </div>
        
        <div className="metric-card">
          <h3 className="text-sm font-medium text-gray-400">Total P&L</h3>
          <p className={`text-2xl font-bold ${portfolio.total_pnl >= 0 ? 'price-up' : 'price-down'}`}>
            ₹{portfolio.total_pnl.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn-primary">Place Order</button>
          <button className="btn-secondary">View Positions</button>
          <button className="btn-secondary">AI Signals</button>
          <button className="btn-secondary">News Feed</button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Market Overview</h2>
        <div className="space-y-2">
          {Object.entries(liveData).slice(0, 5).map(([symbol, data]) => (
            <div key={symbol} className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="font-medium text-white">{symbol}</span>
              <div className="text-right">
                <div className="text-white">₹{data.price.toFixed(2)}</div>
                <div className={`text-sm ${data.change >= 0 ? 'price-up' : 'price-down'}`}>
                  {data.change >= 0 ? '+' : ''}{data.change_percent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
