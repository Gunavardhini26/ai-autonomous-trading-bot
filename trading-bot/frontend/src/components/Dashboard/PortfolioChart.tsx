import React from 'react';

interface PortfolioChartProps {
  data: any;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">📈 Portfolio Performance</h3>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
        <p className="text-gray-500">Chart visualization coming soon...</p>
      </div>
    </div>
  );
};

export default PortfolioChart;
