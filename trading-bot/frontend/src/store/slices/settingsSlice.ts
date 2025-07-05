import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserSettings {
  theme: 'dark' | 'light';
  notifications: {
    email: boolean;
    push: boolean;
    trading_alerts: boolean;
    news_alerts: boolean;
    ai_signals: boolean;
  };
  trading: {
    default_quantity: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    auto_stop_loss: boolean;
    stop_loss_percentage: number;
    auto_take_profit: boolean;
    take_profit_percentage: number;
  };
  ai: {
    lstm_enabled: boolean;
    rl_enabled: boolean;
    confidence_threshold: number;
    max_positions: number;
  };
  display: {
    chart_interval: '1m' | '5m' | '15m' | '1h' | '1d';
    show_technical_indicators: boolean;
    show_volume: boolean;
    decimal_places: number;
  };
}

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  notifications: {
    email: true,
    push: true,
    trading_alerts: true,
    news_alerts: false,
    ai_signals: true,
  },
  trading: {
    default_quantity: 1,
    risk_level: 'MEDIUM',
    auto_stop_loss: true,
    stop_loss_percentage: 5,
    auto_take_profit: false,
    take_profit_percentage: 10,
  },
  ai: {
    lstm_enabled: true,
    rl_enabled: false,
    confidence_threshold: 0.7,
    max_positions: 5,
  },
  display: {
    chart_interval: '5m',
    show_technical_indicators: true,
    show_volume: true,
    decimal_places: 2,
  },
};

const initialState: SettingsState = {
  settings: defaultSettings,
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(state.settings));
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<UserSettings['notifications']>>) => {
      state.settings.notifications = { ...state.settings.notifications, ...action.payload };
      localStorage.setItem('userSettings', JSON.stringify(state.settings));
    },
    updateTradingSettings: (state, action: PayloadAction<Partial<UserSettings['trading']>>) => {
      state.settings.trading = { ...state.settings.trading, ...action.payload };
      localStorage.setItem('userSettings', JSON.stringify(state.settings));
    },
    updateAISettings: (state, action: PayloadAction<Partial<UserSettings['ai']>>) => {
      state.settings.ai = { ...state.settings.ai, ...action.payload };
      localStorage.setItem('userSettings', JSON.stringify(state.settings));
    },
    updateDisplaySettings: (state, action: PayloadAction<Partial<UserSettings['display']>>) => {
      state.settings.display = { ...state.settings.display, ...action.payload };
      localStorage.setItem('userSettings', JSON.stringify(state.settings));
    },
    loadSettings: (state) => {
      const saved = localStorage.getItem('userSettings');
      if (saved) {
        try {
          state.settings = { ...defaultSettings, ...JSON.parse(saved) };
        } catch (error) {
          console.error('Failed to parse saved settings:', error);
        }
      }
    },
    resetSettings: (state) => {
      state.settings = defaultSettings;
      localStorage.removeItem('userSettings');
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.settings.theme = action.payload;
      localStorage.setItem('userSettings', JSON.stringify(state.settings));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  updateSettings,
  updateNotificationSettings,
  updateTradingSettings,
  updateAISettings,
  updateDisplaySettings,
  loadSettings,
  resetSettings,
  setTheme,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;
