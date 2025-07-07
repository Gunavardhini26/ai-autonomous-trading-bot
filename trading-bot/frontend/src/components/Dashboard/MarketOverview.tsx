import React from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

interface MarketOverviewProps {
  marketData: any;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ marketData }) => {
  const indices = [
    { name: 'NIFTY 50', value: 19500, change: +125.30, percent: +0.65 },
    { name: 'SENSEX', value: 65800, change: +420.15, percent: +0.64 },
    { name: 'BANKNIFTY', value: 43200, change: -85.20, percent: -0.20 }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <GlobeAltIcon className="h-5 w-5 mr-2" />
        Market Overview
      </h3>
      <div className="space-y-3">
        {indices.map((index, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">{index.name}</p>
              <p className="text-sm text-gray-600">{index.value.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className={`font-medium ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
              </p>
              <p className={`text-sm ${index.percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ({index.percent >= 0 ? '+' : ''}{index.percent.toFixed(2)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketOverview;
