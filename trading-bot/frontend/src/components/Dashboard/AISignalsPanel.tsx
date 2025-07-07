import React from 'react';

interface AISignalsPanelProps {
  signals: any[];
}

const AISignalsPanel: React.FC<AISignalsPanelProps> = ({ signals }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">🤖 AI Trading Signals</h3>
      <div className="space-y-3">
        {signals.length > 0 ? (
          signals.map((signal, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <span className="font-medium">{signal.symbol || 'SYMBOL'}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  signal.signal_type === 'BUY' ? 'bg-green-100 text-green-800' :
                  signal.signal_type === 'SELL' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {signal.signal_type || 'HOLD'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Confidence: {((signal.confidence || 0.5) * 100).toFixed(1)}%
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No signals available</p>
        )}
      </div>
    </div>
  );
};

export default AISignalsPanel;
