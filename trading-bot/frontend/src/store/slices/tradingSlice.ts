import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tradingAPI } from '../../services/api';

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  pnl_percent: number;
  side: 'BUY' | 'SELL';
  created_at: string;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  order_type: 'MARKET' | 'LIMIT';
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  created_at: string;
  executed_at?: string;
}

interface TradingState {
  positions: Position[];
  trades: Trade[];
  portfolio: {
    total_value: number;
    available_balance: number;
    invested_amount: number;
    day_pnl: number;
    total_pnl: number;
  };
  tradingMode: 'paper' | 'live';
  autoTradingEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: TradingState = {
  positions: [],
  trades: [],
  portfolio: {
    total_value: 0,
    available_balance: 0,
    invested_amount: 0,
    day_pnl: 0,
    total_pnl: 0,
  },
  tradingMode: 'paper',
  autoTradingEnabled: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPositions = createAsyncThunk(
  'trading/fetchPositions',
  async () => {
    const response = await tradingAPI.getPositions();
    return response;
  }
);

export const fetchTrades = createAsyncThunk(
  'trading/fetchTrades',
  async () => {
    const response = await tradingAPI.getTrades();
    return response;
  }
);

export const fetchPortfolio = createAsyncThunk(
  'trading/fetchPortfolio',
  async () => {
    const response = await tradingAPI.getPortfolio();
    return response;
  }
);

export const placeTrade = createAsyncThunk(
  'trading/placeTrade',
  async (tradeData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    order_type: 'MARKET' | 'LIMIT';
    price?: number;
  }) => {
    const response = await tradingAPI.placeTrade(tradeData);
    return response;
  }
);

export const closePosition = createAsyncThunk(
  'trading/closePosition',
  async (positionId: string) => {
    const response = await tradingAPI.closePosition(positionId);
    return response;
  }
);

export const toggleAutoTrading = createAsyncThunk(
  'trading/toggleAutoTrading',
  async (enabled: boolean) => {
    const response = await tradingAPI.setAutoTrading(enabled);
    return response;
  }
);

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTradingMode: (state, action: PayloadAction<'paper' | 'live'>) => {
      state.tradingMode = action.payload;
    },
    updatePosition: (state, action: PayloadAction<Position>) => {
      const index = state.positions.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.positions[index] = action.payload;
      } else {
        state.positions.push(action.payload);
      }
    },
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.unshift(action.payload);
    },
    updatePortfolio: (state, action: PayloadAction<Partial<TradingState['portfolio']>>) => {
      state.portfolio = { ...state.portfolio, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch positions
      .addCase(fetchPositions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.positions = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch positions';
      })
      // Fetch trades
      .addCase(fetchTrades.fulfilled, (state, action) => {
        state.trades = action.payload;
      })
      // Fetch portfolio
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.portfolio = action.payload;
      })
      // Place trade
      .addCase(placeTrade.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(placeTrade.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trades.unshift(action.payload);
      })
      .addCase(placeTrade.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to place trade';
      })
      // Toggle auto trading
      .addCase(toggleAutoTrading.fulfilled, (state, action) => {
        state.autoTradingEnabled = action.payload.enabled;
      });
  },
});

export const { 
  clearError, 
  setTradingMode, 
  updatePosition, 
  addTrade, 
  updatePortfolio 
} = tradingSlice.actions;
export default tradingSlice.reducer;
