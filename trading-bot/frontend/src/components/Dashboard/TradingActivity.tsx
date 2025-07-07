import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface TradingActivityProps {
  activities: any[];
}

const TradingActivity: React.FC<TradingActivityProps> = ({ activities }) => {
  const sampleActivities = [
    { time: '10:30 AM', action: 'BUY', symbol: 'RELIANCE', quantity: 10, price: 2450 },
    { time: '11:15 AM', action: 'SELL', symbol: 'TCS', quantity: 5, price: 3680 },
    { time: '02:45 PM', action: 'BUY', symbol: 'HDFC', quantity: 8, price: 1580 }
  ];

  const data = activities.length > 0 ? activities : sampleActivities;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2" />
        Recent Trading Activity
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {data.map((activity, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">{activity.time}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                activity.action === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {activity.action}
              </span>
              <span className="font-medium">{activity.symbol}</span>
            </div>
            <div className="text-right">
              <p className="text-sm">Qty: {activity.quantity}</p>
              <p className="text-xs text-gray-600">₹{activity.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradingActivity;
