import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { aiAPI } from '../../services/api';

interface AISignal {
  id: string;
  symbol: string;
  signal_type: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  predicted_price: number;
  model_type: 'LSTM' | 'RL';
  created_at: string;
}

interface ModelPerformance {
  model_type: 'LSTM' | 'RL';
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  total_predictions: number;
  correct_predictions: number;
  last_updated: string;
}

interface AIState {
  signals: AISignal[];
  modelPerformance: { [key: string]: ModelPerformance };
  lstmEnabled: boolean;
  rlEnabled: boolean;
  isTraining: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AIState = {
  signals: [],
  modelPerformance: {},
  lstmEnabled: true,
  rlEnabled: false,
  isTraining: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAISignals = createAsyncThunk(
  'ai/fetchSignals',
  async (symbol?: string) => {
    const response = await aiAPI.getSignals(symbol);
    return response;
  }
);

export const fetchModelPerformance = createAsyncThunk(
  'ai/fetchModelPerformance',
  async () => {
    const response = await aiAPI.getModelPerformance();
    return response;
  }
);

export const trainLSTMModel = createAsyncThunk(
  'ai/trainLSTM',
  async (symbol: string) => {
    const response = await aiAPI.trainLSTMModel(symbol);
    return response;
  }
);

export const trainRLAgent = createAsyncThunk(
  'ai/trainRL',
  async (symbol: string) => {
    const response = await aiAPI.trainRLAgent(symbol);
    return response;
  }
);

export const generatePrediction = createAsyncThunk(
  'ai/generatePrediction',
  async (data: { symbol: string; model_type: 'LSTM' | 'RL' }) => {
    const response = await aiAPI.generatePrediction(data);
    return response;
  }
);

export const updateModelSettings = createAsyncThunk(
  'ai/updateSettings',
  async (settings: { lstm_enabled: boolean; rl_enabled: boolean }) => {
    const response = await aiAPI.updateSettings(settings);
    return settings;
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addSignal: (state, action: PayloadAction<AISignal>) => {
      state.signals.unshift(action.payload);
      // Keep only the latest 100 signals
      if (state.signals.length > 100) {
        state.signals = state.signals.slice(0, 100);
      }
    },
    toggleLSTM: (state) => {
      state.lstmEnabled = !state.lstmEnabled;
    },
    toggleRL: (state) => {
      state.rlEnabled = !state.rlEnabled;
    },
    setTrainingStatus: (state, action: PayloadAction<boolean>) => {
      state.isTraining = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch AI signals
      .addCase(fetchAISignals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAISignals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signals = action.payload;
      })
      .addCase(fetchAISignals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch AI signals';
      })
      // Fetch model performance
      .addCase(fetchModelPerformance.fulfilled, (state, action) => {
        state.modelPerformance = action.payload;
      })
      // Train LSTM model
      .addCase(trainLSTMModel.pending, (state) => {
        state.isTraining = true;
        state.error = null;
      })
      .addCase(trainLSTMModel.fulfilled, (state) => {
        state.isTraining = false;
      })
      .addCase(trainLSTMModel.rejected, (state, action) => {
        state.isTraining = false;
        state.error = action.error.message || 'Failed to train LSTM model';
      })
      // Train RL agent
      .addCase(trainRLAgent.pending, (state) => {
        state.isTraining = true;
        state.error = null;
      })
      .addCase(trainRLAgent.fulfilled, (state) => {
        state.isTraining = false;
      })
      .addCase(trainRLAgent.rejected, (state, action) => {
        state.isTraining = false;
        state.error = action.error.message || 'Failed to train RL agent';
      })
      // Generate prediction
      .addCase(generatePrediction.fulfilled, (state, action) => {
        state.signals.unshift(action.payload);
      })
      // Update settings
      .addCase(updateModelSettings.fulfilled, (state, action) => {
        state.lstmEnabled = action.payload.lstm_enabled;
        state.rlEnabled = action.payload.rl_enabled;
      });
  },
});

export const { 
  clearError, 
  addSignal, 
  toggleLSTM, 
  toggleRL, 
  setTrainingStatus 
} = aiSlice.actions;
export default aiSlice.reducer;
