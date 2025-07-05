import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import marketSlice from './slices/marketSlice';
import tradingSlice from './slices/tradingSlice';
import aiSlice from './slices/aiSlice';
import newsSlice from './slices/newsSlice';
import settingsSlice from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    market: marketSlice,
    trading: tradingSlice,
    ai: aiSlice,
    news: newsSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
