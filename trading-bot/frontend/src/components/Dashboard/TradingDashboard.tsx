import React, { useState, useEffect } from 'react';
import { LiveDataService } from '../../services/LiveDataService';
import { AISignalsPanel } from '../AI/AISignalsPanel';
import { PortfolioChart } from '../Charts/PortfolioChart';
import { PositionsTable } from '../Portfolio/PositionsTable';
import { MarketData, Position, AISignal } from '../../types/market';

const TradingDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [portfolio, setPortfolio] = useState({ totalValue: 0, pnl: 0, pnlPercent: 0 });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const dataService = new LiveDataService();
    
    // Initialize connections
    dataService.connect();
    setIsConnected(true);

    // Fetch initial data
    const fetchData = async () => {
      try {
        const [marketResponse, portfolioResponse, signalsResponse] = await Promise.all([
          fetch('http://localhost:8000/api/market/live'),
          fetch('http://localhost:8000/api/portfolio'),
          fetch('http://localhost:8000/api/ai/signals')
        ]);

        if (marketResponse.ok) {
          const marketData = await marketResponse.json();
          setMarketData(marketData.symbols || []);
        }

        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          setPortfolio({
            totalValue: portfolioData.total_value || 0,
            pnl: portfolioData.daily_pnl || 0,
            pnlPercent: portfolioData.daily_pnl ? (portfolioData.daily_pnl / portfolioData.total_value * 100) : 0
          });
          
          // Convert backend positions to frontend format
          const convertedPositions = (portfolioData.positions || []).map((pos: any) => ({
            symbol: pos.symbol,
            quantity: pos.quantity,
            entryPrice: pos.avgPrice,
            currentPrice: pos.currentPrice,
            pnl: pos.pnl,
            pnlPercent: pos.pnlPercent,
            type: pos.side.toLowerCase()
          }));
          setPositions(convertedPositions);
        }

        if (signalsResponse.ok) {
          const signalsData = await signalsResponse.json();
          const convertedSignals = (signalsData.signals || []).map((signal: any) => ({
            symbol: signal.symbol,
            type: signal.signal,
            confidence: signal.confidence,
            timestamp: signal.timestamp,
            reason: `Target: ${signal.target}, Stop Loss: ${signal.stopLoss}`
          }));
          setSignals(convertedSignals);
        }

        // Mock positions for now since there's no positions endpoint
        setPositions([
          {
            symbol: 'RELIANCE',
            quantity: 10,
            entryPrice: 2450,
            currentPrice: 2465,
            pnl: 150,
            pnlPercent: 0.61,
            type: 'long'
          },
          {
            symbol: 'TCS',
            quantity: 5,
            entryPrice: 3850,
            currentPrice: 3820,
            pnl: -150,
            pnlPercent: -0.78,
            type: 'long'
          }
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsConnected(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000); // Update every second

    return () => {
      clearInterval(interval);
      dataService.disconnect();
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    background: '#0d1421',
    color: '#ffffff',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    overflow: 'auto'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#1a2332',
    borderBottom: '1px solid #2d3748'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '1rem',
    padding: '1rem',
    height: 'calc(100vh - 100px)'
  };

  const sectionStyle: React.CSSProperties = {
    background: '#1a2332',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    padding: '1rem',
    overflow: 'auto'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>{isConnected ? '🟢' : '🔴'}</span>
          <span>{isConnected ? 'Live Data Connected' : 'Connection Lost'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Portfolio Value:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>${portfolio.totalValue.toLocaleString()}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            color: portfolio.pnl >= 0 ? '#48bb78' : '#f56565'
          }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>${portfolio.pnl.toLocaleString()}</span>
            <span style={{ fontSize: '0.9rem' }}>({portfolio.pnlPercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      <div style={gridStyle}>
        <div style={{ ...sectionStyle, gridRow: 'span 2' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0' }}>
            Portfolio Performance
          </h3>
          <PortfolioChart data={marketData} />
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0' }}>
            AI Trading Signals
          </h3>
          <AISignalsPanel signals={signals} />
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0' }}>
            Current Positions
          </h3>
          <PositionsTable positions={positions} />
        </div>
      </div>

      <div style={{ 
        padding: '1rem 2rem', 
        background: '#1a2332',
        borderTop: '1px solid #2d3748'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#e2e8f0' }}>Market Overview</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '0.5rem' 
        }}>
          {marketData.slice(0, 8).map((data, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem',
              background: '#2d3748',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{data.symbol}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#ffffff' }}>${data.price.toFixed(2)}</div>
                <div style={{ 
                  fontSize: '0.8rem',
                  color: data.change >= 0 ? '#48bb78' : '#f56565'
                }}>
                  {data.change >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
