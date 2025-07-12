import React from 'react';
import { MarketData } from '../../types/market';

interface PortfolioChartProps {
  data: MarketData[];
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
  // Simple chart representation using CSS
  const generateChartData = () => {
    if (data.length === 0) return [];
    
    const prices = data.slice(0, 20).map(d => d.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const range = maxPrice - minPrice;
    
    return prices.map((price, index) => ({
      x: (index / (prices.length - 1)) * 100,
      y: range > 0 ? ((price - minPrice) / range) * 100 : 50,
      price
    }));
  };

  const chartData = generateChartData();
  const currentValue = data.length > 0 ? data[0].price : 0;
  const change = data.length > 1 ? ((data[0].price - data[1].price) / data[1].price) * 100 : 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 600, color: '#ffffff' }}>
          ${currentValue.toLocaleString()}
        </div>
        <div style={{ 
          fontSize: '1rem', 
          color: change >= 0 ? '#48bb78' : '#f56565',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>{change >= 0 ? '↗' : '↘'}</span>
          <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative', background: '#2d3748', borderRadius: '8px', padding: '1rem' }}>
        {chartData.length > 0 ? (
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4299e1" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#4299e1" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            
            {/* Chart line */}
            <polyline
              fill="none"
              stroke="#4299e1"
              strokeWidth="2"
              points={chartData.map(point => `${point.x},${100 - point.y}`).join(' ')}
            />
            
            {/* Area under curve */}
            <polygon
              fill="url(#areaGradient)"
              points={`0,100 ${chartData.map(point => `${point.x},${100 - point.y}`).join(' ')} 100,100`}
            />
            
            {/* Data points */}
            {chartData.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={100 - point.y}
                r="3"
                fill="#4299e1"
                style={{ cursor: 'pointer' }}
              />
            ))}
          </svg>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: '#a0aec0' 
          }}>
            No data available
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>24h High</div>
          <div style={{ fontWeight: 600, color: '#48bb78' }}>
            ${data.length > 0 ? Math.max(...data.slice(0, 24).map(d => d.price)).toLocaleString() : '0'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>24h Low</div>
          <div style={{ fontWeight: 600, color: '#f56565' }}>
            ${data.length > 0 ? Math.min(...data.slice(0, 24).map(d => d.price)).toLocaleString() : '0'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Volume</div>
          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>
            {data.length > 0 ? data[0].volume.toLocaleString() : '0'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;
