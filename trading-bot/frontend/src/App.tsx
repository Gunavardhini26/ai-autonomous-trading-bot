import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import LoginNew from './pages/LoginNew';
import LayoutNew from './components/LayoutNew';
import DashboardNew from './pages/DashboardNew';
import BrokerManagement from './pages/BrokerManagement';
import LiveMarketNew from './pages/LiveMarketNew';
import TradeLogsNew from './pages/TradeLogsNew';
import StrategyLabNew from './pages/StrategyLabNew';
import AITrainingNew from './pages/AITrainingNew';
import SentimentNew from './pages/SentimentNew';
import OrdersNew from './pages/OrdersNew';
import PortfolioNew from './pages/PortfolioNew';
import SettingsNew from './pages/SettingsNew';
import WalletNew from './pages/WalletNew';
import PaperTradingNew from './pages/PaperTradingNew';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/login" element={<LoginNew />} />
              <Route path="/" element={<LayoutNew />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardNew />} />
                <Route path="brokers" element={<BrokerManagement />} />
                <Route path="market" element={<LiveMarketNew />} />
                <Route path="orders" element={<OrdersNew />} />
                <Route path="portfolio" element={<PortfolioNew />} />
                <Route path="wallet" element={<WalletNew />} />
                <Route path="paper-mode" element={<PaperTradingNew />} />
                <Route path="trade-logs" element={<TradeLogsNew />} />
                <Route path="strategy-lab" element={<StrategyLabNew />} />
                <Route path="ai-training" element={<AITrainingNew />} />
                <Route path="sentiment" element={<SentimentNew />} />
                <Route path="settings" element={<SettingsNew />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
