export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  timestamp?: string;
}

export interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  type: 'long' | 'short';
}

export interface AISignal {
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timestamp: string;
  reason: string;
}

export interface Portfolio {
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  positions: Position[];
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'cancelled';
}
