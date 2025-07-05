import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { marketAPI } from '../../services/api';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: string;
}

interface TechnicalIndicator {
  symbol: string;
  indicator_type: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  timestamp: string;
}

interface MarketState {
  liveData: { [symbol: string]: MarketData };
  watchlist: string[];
  technicalIndicators: { [symbol: string]: TechnicalIndicator[] };
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: MarketState = {
  liveData: {},
  watchlist: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ITC'],
  technicalIndicators: {},
  isConnected: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMarketData = createAsyncThunk(
  'market/fetchMarketData',
  async (symbols: string[]) => {
    const response = await marketAPI.getLiveData(symbols);
    return response;
  }
);

export const fetchTechnicalIndicators = createAsyncThunk(
  'market/fetchTechnicalIndicators',
  async (symbol: string) => {
    const response = await marketAPI.getTechnicalIndicators(symbol);
    return { symbol, data: response };
  }
);

export const addToWatchlist = createAsyncThunk(
  'market/addToWatchlist',
  async (symbol: string) => {
    await marketAPI.addToWatchlist(symbol);
    return symbol;
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'market/removeFromWatchlist',
  async (symbol: string) => {
    await marketAPI.removeFromWatchlist(symbol);
    return symbol;
  }
);

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    updateLiveData: (state, action: PayloadAction<MarketData>) => {
      state.liveData[action.payload.symbol] = action.payload;
    },
    updateConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setWatchlist: (state, action: PayloadAction<string[]>) => {
      state.watchlist = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch market data
      .addCase(fetchMarketData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketData.fulfilled, (state, action) => {
        state.isLoading = false;
        action.payload.forEach((data: MarketData) => {
          state.liveData[data.symbol] = data;
        });
      })
      .addCase(fetchMarketData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch market data';
      })
      // Fetch technical indicators
      .addCase(fetchTechnicalIndicators.fulfilled, (state, action) => {
        state.technicalIndicators[action.payload.symbol] = action.payload.data;
      })
      // Add to watchlist
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        if (!state.watchlist.includes(action.payload)) {
          state.watchlist.push(action.payload);
        }
      })
      // Remove from watchlist
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.watchlist = state.watchlist.filter(symbol => symbol !== action.payload);
      });
  },
});

export const { updateLiveData, updateConnectionStatus, clearError, setWatchlist } = marketSlice.actions;
export default marketSlice.reducer;
