import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { liveDataService } from '../services/LiveDataService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    clientId: '',
    password: '',
    totp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingText, setLoadingText] = useState('');

  // Dynamic loading text animation
  useEffect(() => {
    if (isLoading) {
      const loadingStates = [
        'Connecting to Angel One...',
        'Authenticating credentials...',
        'Establishing secure session...',
        'Fetching portfolio data...',
        'Initializing trading dashboard...'
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        setLoadingText(loadingStates[index]);
        index = (index + 1) % loadingStates.length;
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!formData.clientId || !formData.password || !formData.totp) {
        throw new Error('All fields are required');
      }

      if (formData.totp.length !== 6) {
        throw new Error('TOTP must be 6 digits');
      }

      // Attempt Angel One authentication
      const success = await liveDataService.authenticateAngelOne(
        formData.clientId,
        formData.password,
        formData.totp
      );

      if (success) {
        // Store auth state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('loginTime', new Date().toISOString());
        
        // Simulate additional setup time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        onLoginSuccess();
      } else {
        throw new Error('Invalid credentials or TOTP');
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const themeClasses = {
    light: {
      bg: 'bg-light-primary',
      cardBg: 'bg-light-secondary',
      text: 'text-light-text',
      border: 'border-light-border',
      accent: 'text-light-accent',
      button: 'bg-light-accent hover:bg-opacity-90'
    },
    dark: {
      bg: 'bg-dark-primary',
      cardBg: 'bg-dark-secondary',
      text: 'text-dark-text',
      border: 'border-dark-border',
      accent: 'text-dark-accent',
      button: 'bg-dark-accent hover:bg-opacity-90'
    },
    alert: {
      bg: 'bg-alert-primary',
      cardBg: 'bg-alert-secondary',
      text: 'text-alert-text',
      border: 'border-alert-border',
      accent: 'text-alert-accent',
      button: 'bg-alert-accent hover:bg-opacity-90'
    }
  }[theme];

  if (isLoading) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${themeClasses.cardBg} p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4`}
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className={`w-16 h-16 border-4 ${themeClasses.border} border-t-transparent rounded-full mx-auto mb-6`}
            />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-2xl font-bold ${themeClasses.text} mb-4`}
            >
              Connecting to Trading Systems
            </motion.h2>
            <motion.p
              key={loadingText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`${themeClasses.text} opacity-75`}
            >
              {loadingText}
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center px-4`}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className={`${themeClasses.cardBg} rounded-2xl shadow-2xl p-8`}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className={`w-16 h-16 ${themeClasses.button} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
              AI Trading Bot
            </h1>
            <p className={`${themeClasses.text} opacity-75`}>
              Connect with Angel One SmartAPI
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                Client ID
              </label>
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg ${themeClasses.cardBg} ${themeClasses.border} border ${themeClasses.text} focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all duration-200`}
                placeholder="Enter your Angel One Client ID"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 rounded-lg ${themeClasses.cardBg} ${themeClasses.border} border ${themeClasses.text} focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.text} opacity-60 hover:opacity-100 transition-opacity`}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                TOTP (6 digits)
              </label>
              <input
                type="text"
                name="totp"
                value={formData.totp}
                onChange={handleInputChange}
                maxLength={6}
                className={`w-full px-4 py-3 rounded-lg ${themeClasses.cardBg} ${themeClasses.border} border ${themeClasses.text} focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all duration-200 font-mono text-center text-lg tracking-widest`}
                placeholder="000000"
                required
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              type="submit"
              disabled={isLoading}
              className={`w-full ${themeClasses.button} text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:scale-100`}
            >
              {isLoading ? 'Connecting...' : 'Connect to Angel One'}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center space-x-2 text-xs opacity-60">
              <span className={themeClasses.text}>Powered by</span>
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMjIgN0wxMiAxMkwyIDdMMTIgMloiIGZpbGw9IiNlMTFkNDgiLz4KPHBhdGggZD0iTTIgMTdMMTIgMjJMMjIgMTciIGZpbGw9IiNlMTFkNDgiLz4KPHBhdGggZD0iTTIgMTJMMTIgMTdMMjIgMTIiIGZpbGw9IiNlMTFkNDgiLz4KPC9zdmc+"
                alt="Angel One"
                className="w-4 h-4"
              />
              <span className={themeClasses.text}>Angel One SmartAPI</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
