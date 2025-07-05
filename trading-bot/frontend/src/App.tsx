import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { RootState, AppDispatch } from './store/store';
import { getCurrentUser } from './store/slices/authSlice';
import { loadSettings } from './store/slices/settingsSlice';

import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import { LiveFeed, StrategyLab, AIMonitor, TradeLogs, NewsSentiment, Settings } from './pages/pages';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';

import webSocketService from './services/websocket';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, token } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.settings.settings);

  useEffect(() => {
    // Load user settings from localStorage
    dispatch(loadSettings());

    // Check for existing token and validate it
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  useEffect(() => {
    // Connect to WebSocket when authenticated
    if (isAuthenticated) {
      webSocketService.connect();
      
      // Subscribe to basic updates
      webSocketService.subscribeToTradingUpdates();
      webSocketService.subscribeToAISignals();
      webSocketService.subscribeToNews();

      return () => {
        webSocketService.disconnect();
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.className = theme;
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trading-dark flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="live-feed" element={<LiveFeed />} />
          <Route path="strategy-lab" element={<StrategyLab />} />
          <Route path="ai-monitor" element={<AIMonitor />} />
          <Route path="trade-logs" element={<TradeLogs />} />
          <Route path="news-sentiment" element={<NewsSentiment />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Toast notifications */}
      <Toaster
        position=\"top-right\"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#374151' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            border: theme === 'dark' ? '1px solid #4b5563' : '1px solid #d1d5db',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
