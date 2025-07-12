import React from 'react';
import { AISignal } from '../../types/market';

interface AISignalsPanelProps {
  signals: AISignal[];
}

export const AISignalsPanel: React.FC<AISignalsPanelProps> = ({ signals }) => {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {signals.length > 0 ? (
        signals.slice(0, 5).map((signal, index) => (
          <div
            key={index}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: '#2d3748',
              borderRadius: '6px',
              borderLeft: '3px solid #4299e1'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{signal.symbol}</span>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: signal.type === 'BUY' ? '#48bb78' : '#f56565',
                color: '#ffffff'
              }}>
                {signal.type}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#a0aec0' }}>
              <span>Confidence: {signal.confidence}%</span>
              <span>{new Date(signal.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', color: '#a0aec0', padding: '2rem' }}>
          No active signals
        </div>
      )}
    </div>
  );
};

export default AISignalsPanel;
