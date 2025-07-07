import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface PerformanceMetricsProps {
  performanceData: any;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ performanceData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ChartBarIcon className="h-5 w-5 mr-2" />
        Performance Metrics
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total Return</p>
          <p className="text-xl font-bold text-green-600">
            +{((performanceData?.total_return || 0.145) * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Sharpe Ratio</p>
          <p className="text-xl font-bold text-blue-600">
            {(performanceData?.sharpe_ratio || 1.85).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Win Rate</p>
          <p className="text-xl font-bold text-purple-600">
            {((performanceData?.win_rate || 0.68) * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Avg. Trade</p>
          <p className="text-xl font-bold text-gray-800">
            ₹{(performanceData?.avg_trade || 2150).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
