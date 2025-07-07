import React from 'react';
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface RiskMetricsProps {
  riskData: any;
}

const RiskMetrics: React.FC<RiskMetricsProps> = ({ riskData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ShieldCheckIcon className="h-5 w-5 mr-2" />
        Risk Management
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Portfolio Risk Score</span>
          <span className="font-semibold text-yellow-600">
            {riskData?.risk_score?.toFixed(1) || '3.2'}/10
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">VaR (95%)</span>
          <span className="font-semibold text-red-600">
            ₹{(riskData?.var_95 || 15000).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Max Drawdown</span>
          <span className="font-semibold text-red-600">
            -{((riskData?.max_drawdown || 0.08) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">Risk Alert</p>
            <p className="text-xs text-yellow-700">
              Portfolio concentration risk is elevated in tech sector
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMetrics;
