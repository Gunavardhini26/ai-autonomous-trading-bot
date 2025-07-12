import React from 'react';
import { Position } from '../../types/market';

interface PositionsTableProps {
  positions: Position[];
}

export const PositionsTable: React.FC<PositionsTableProps> = ({ positions }) => {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {positions.length > 0 ? (
        <div style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', 
            gap: '0.5rem',
            padding: '0.5rem',
            borderBottom: '1px solid #2d3748',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#a0aec0',
            textTransform: 'uppercase'
          }}>
            <div>Symbol</div>
            <div>Quantity</div>
            <div>Entry Price</div>
            <div>Current Price</div>
            <div>P&L</div>
          </div>
          
          {/* Rows */}
          {positions.map((position, index) => (
            <div 
              key={index}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', 
                gap: '0.5rem',
                padding: '0.75rem 0.5rem',
                borderBottom: index < positions.length - 1 ? '1px solid #2d3748' : 'none',
                fontSize: '0.9rem',
                alignItems: 'center'
              }}
            >
              <div style={{ fontWeight: 600, color: '#e2e8f0' }}>
                {position.symbol}
                <span style={{ 
                  marginLeft: '0.5rem', 
                  fontSize: '0.7rem', 
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                  background: position.type === 'long' ? '#48bb78' : '#f56565',
                  color: '#ffffff'
                }}>
                  {position.type.toUpperCase()}
                </span>
              </div>
              
              <div style={{ color: '#e2e8f0' }}>
                {position.quantity.toLocaleString()}
              </div>
              
              <div style={{ color: '#e2e8f0' }}>
                ${position.entryPrice.toFixed(2)}
              </div>
              
              <div style={{ color: '#e2e8f0' }}>
                ${position.currentPrice.toFixed(2)}
              </div>
              
              <div style={{ 
                color: position.pnl >= 0 ? '#48bb78' : '#f56565',
                fontWeight: 600
              }}>
                <div>${position.pnl.toFixed(2)}</div>
                <div style={{ fontSize: '0.8rem' }}>
                  ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: '#a0aec0',
          textAlign: 'center',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ fontSize: '3rem', opacity: 0.3 }}>📊</div>
          <div>No open positions</div>
          <div style={{ fontSize: '0.8rem' }}>Start trading to see your positions here</div>
        </div>
      )}
    </div>
  );
};

export default PositionsTable;
