import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

// Import all pages
import LoginNew from './pages/LoginNew';
import DashboardNew from './pages/DashboardNew';
import BrokerManagement from './pages/BrokerManagement';
import LiveMarketNew from './pages/LiveMarketNew';
import OrdersNew from './pages/OrdersNew';
import PortfolioNew from './pages/PortfolioNew';
import WalletNew from './pages/WalletNew';
import PaperTradingNew from './pages/PaperTradingNew';
import TradeLogsNew from './pages/TradeLogsNew';
import StrategyLabNew from './pages/StrategyLabNew';
import AITrainingNew from './pages/AITrainingNew';
import SentimentNew from './pages/SentimentNew';
import SettingsNew from './pages/SettingsNew';

// Icons
import {
  LayoutDashboard,
  TrendingUp,
  ScrollText,
  FlaskConical,
  Brain,
  Radio,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  AlertTriangle,
  Wallet,
  Target,
  Plus,
  Minus,
  Activity,
  Users,
  BarChart3,
  LineChart,
  PieChart,
  DollarSign,
  TrendingDown
} from 'lucide-react';

// Navigation items
const navigationItems = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, emoji: '📊' },
  { id: 'market', name: 'Live Market', path: '/market', icon: TrendingUp, emoji: '📈' },
  { id: 'orders', name: 'Orders', path: '/orders', icon: FileText, emoji: '📋' },
  { id: 'portfolio', name: 'Portfolio', path: '/portfolio', icon: Briefcase, emoji: '💼' },
  { id: 'wallet', name: 'Wallet', path: '/wallet', icon: Wallet, emoji: '💰' },
  { id: 'paper-mode', name: 'Paper Trading', path: '/paper-mode', icon: Target, emoji: '🎯' },
  { id: 'trade-logs', name: 'Trade Logs', path: '/trade-logs', icon: ScrollText, emoji: '📜' },
  { id: 'strategy-lab', name: 'Strategy Lab', path: '/strategy-lab', icon: FlaskConical, emoji: '🧪' },
  { id: 'ai-training', name: 'AI Training', path: '/ai-training', icon: Brain, emoji: '🤖' },
  { id: 'sentiment', name: 'Sentiment', path: '/sentiment', icon: Radio, emoji: '💭' },
  { id: 'brokers', name: 'Brokers', path: '/brokers', icon: Wifi, emoji: '🔗' },
  { id: 'settings', name: 'Settings', path: '/settings', icon: Settings, emoji: '⚙️' }
];

// Complete Layout Component
const CompleteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const location = useLocation();

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${user.id}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('🔌 WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'market_update') {
          setMarketData(data.data);
        } else if (data.type === 'notification') {
          setNotifications(prev => [data, ...prev.slice(0, 9)]);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log('🔌 WebSocket disconnected');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const currentPath = location.pathname;
  const currentItem = navigationItems.find(item => item.path === currentPath);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-xl border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI Trading Bot</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Complete v1.0</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              
              return (
                <a
                  key={item.id}
                  href={item.path}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  <span className="text-xs">{item.emoji}</span>
                </a>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Menu className="w-5 h-5 text-slate-500" />
              </button>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {currentItem?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-500 hover:text-slate-700 cursor-pointer" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              
              {/* Theme Toggle */}
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <Sun className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <CompleteLayout>{children}</CompleteLayout>;
};

// Main App Component
const CompleteApp: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen">
            <Routes>
              <Route path="/login" element={<LoginNew />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardNew />
                </ProtectedRoute>
              } />
              <Route path="/market" element={
                <ProtectedRoute>
                  <LiveMarketNew />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrdersNew />
                </ProtectedRoute>
              } />
              <Route path="/portfolio" element={
                <ProtectedRoute>
                  <PortfolioNew />
                </ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute>
                  <WalletNew />
                </ProtectedRoute>
              } />
              <Route path="/paper-mode" element={
                <ProtectedRoute>
                  <PaperTradingNew />
                </ProtectedRoute>
              } />
              <Route path="/trade-logs" element={
                <ProtectedRoute>
                  <TradeLogsNew />
                </ProtectedRoute>
              } />
              <Route path="/strategy-lab" element={
                <ProtectedRoute>
                  <StrategyLabNew />
                </ProtectedRoute>
              } />
              <Route path="/ai-training" element={
                <ProtectedRoute>
                  <AITrainingNew />
                </ProtectedRoute>
              } />
              <Route path="/sentiment" element={
                <ProtectedRoute>
                  <SentimentNew />
                </ProtectedRoute>
              } />
              <Route path="/brokers" element={
                <ProtectedRoute>
                  <BrokerManagement />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsNew />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default CompleteApp;
