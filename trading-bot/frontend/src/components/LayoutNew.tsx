import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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
  Target
} from 'lucide-react';

interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, emoji: '🧠' },
  { id: 'market', name: 'Live Market', path: '/market', icon: TrendingUp, emoji: '📊' },
  { id: 'orders', name: 'Orders', path: '/orders', icon: FileText, emoji: '�' },
  { id: 'portfolio', name: 'Portfolio', path: '/portfolio', icon: Briefcase, emoji: '💼' },
  { id: 'wallet', name: 'Wallet', path: '/wallet', icon: Wallet, emoji: '💰' },
  { id: 'paper-mode', name: 'Paper Trading', path: '/paper-mode', icon: Target, emoji: '🎯' },
  { id: 'trade-logs', name: 'Trade Logs', path: '/trade-logs', icon: ScrollText, emoji: '�' },
  { id: 'strategy-lab', name: 'Strategy Lab', path: '/strategy-lab', icon: FlaskConical, emoji: '⚙️' },
  { id: 'ai-training', name: 'AI Training', path: '/ai-training', icon: Brain, emoji: '🧬' },
  { id: 'sentiment', name: 'Sentiment', path: '/sentiment', icon: Radio, emoji: '�' },
  { id: 'brokers', name: 'Brokers', path: '/brokers', icon: Wifi, emoji: '🔗' },
  { id: 'settings', name: 'Settings', path: '/settings', icon: Settings, emoji: '⚙️' }
];

const LayoutNew: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const location = useLocation();

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
              <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI Trading</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">v2.0.0</p>
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
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
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-r-2 border-rose-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                    }
                  `}
                >
                  <span className="text-base">{item.emoji}</span>
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.id === 'orders' && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Theme</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-lg ${theme === 'light' ? 'bg-rose-100 text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('alert')}
                  className={`p-2 rounded-lg ${theme === 'alert' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Connection</span>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {currentItem?.name || 'AI Trading Bot'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default LayoutNew;
