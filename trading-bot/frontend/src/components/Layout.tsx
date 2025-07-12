import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ChartBarIcon, 
  HomeIcon, 
  DocumentTextIcon, 
  BeakerIcon, 
  CpuChipIcon, 
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  PowerIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/market-feed', icon: ChartBarIcon, label: 'Market Feed' },
    { path: '/trade-logs', icon: DocumentTextIcon, label: 'Trade Logs' },
    { path: '/strategy-lab', icon: BeakerIcon, label: 'Strategy Lab' },
    { path: '/ai-training', icon: CpuChipIcon, label: 'AI Training' },
    { path: '/sentiment-feed', icon: ChatBubbleBottomCenterTextIcon, label: 'Sentiment' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' }
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Top Navigation Bar */}
      <nav className="bg-bg-secondary border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-accent-primary">
                  AI Trading Bot
                </h1>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                        isActive
                          ? 'bg-accent-primary text-white'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </motion.button>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                className="p-2 rounded-md text-text-secondary hover:text-red-500 hover:bg-bg-tertiary"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <PowerIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center space-x-2 ${
                    isActive
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export { Layout };
export default Layout;
