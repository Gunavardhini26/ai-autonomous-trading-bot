import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { liveDataService } from '../services/LiveDataService';

interface LoginProps {
  onLogin: (token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    clientId: '',
    password: '',
    totp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'credentials' | 'totp'>('credentials');

  const themeClasses = {
    light: {
      bg: 'bg-light-primary',
      cardBg: 'bg-light-secondary',
      text: 'text-light-text',
      accent: 'text-light-accent',
      border: 'border-light-border'
    },
    dark: {
      bg: 'bg-dark-primary',
      cardBg: 'bg-dark-secondary',
      text: 'text-dark-text',
      accent: 'text-dark-accent',
      border: 'border-dark-border'
    },
    alert: {
      bg: 'bg-alert-primary',
      cardBg: 'bg-alert-secondary',
      text: 'text-alert-text',
      accent: 'text-alert-accent',
      border: 'border-alert-border'
    }
  };

  const currentTheme = themeClasses[theme];

  useEffect(() => {
    // Check if user is already authenticated
    const savedToken = localStorage.getItem('angel_one_token');
    if (savedToken) {
      onLogin(savedToken);
    }
  }, [onLogin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    setStep('totp');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.totp) {
      setError('Please enter TOTP code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await liveDataService.authenticateAngelOne(
        formData.clientId,
        formData.password,
        formData.totp
      );

      if (success) {
        const token = localStorage.getItem('angel_one_token');
        if (token) {
          onLogin(token);
        }
      } else {
        setError('Authentication failed. Please check your credentials.');
        setStep('credentials');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
      setStep('credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
    />
  );

  return (
    <div className={`min-h-screen flex items-center justify-center ${currentTheme.bg} transition-colors duration-300`}>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(225, 29, 72, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(225, 29, 72, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 80%, rgba(225, 29, 72, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(225, 29, 72, 0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="w-full h-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 w-full max-w-md mx-4`}
      >
        {/* Login Card */}
        <div className={`${currentTheme.cardBg} ${currentTheme.border} border rounded-2xl shadow-2xl p-8 backdrop-blur-lg`}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-white">AI</span>
            </motion.div>
            <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>
              AI Trading Bot
            </h1>
            <p className={`${currentTheme.text} opacity-70 text-sm`}>
              Autonomous trading powered by artificial intelligence
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.form
                key="credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleCredentialsSubmit}
                className="space-y-6"
              >
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    Angel One Client ID
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${currentTheme.cardBg} ${currentTheme.border} border ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200`}
                    placeholder="Enter your client ID"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    Password
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${currentTheme.cardBg} ${currentTheme.border} border ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200`}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                >
                  Continue
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="totp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleLogin}
                className="space-y-6"
              >
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    TOTP Code
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="totp"
                    value={formData.totp}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${currentTheme.cardBg} ${currentTheme.border} border ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 text-center text-xl tracking-wider`}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className={`text-xs ${currentTheme.text} opacity-60 mt-2 text-center`}>
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setStep('credentials')}
                    className={`flex-1 ${currentTheme.border} border ${currentTheme.text} py-3 rounded-lg font-semibold hover:bg-opacity-10 hover:bg-gray-500 transition-all duration-200`}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? <LoadingSpinner /> : 'Login'}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Angel One Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${currentTheme.cardBg} ${currentTheme.border} border`}>
              <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className={`text-xs ${currentTheme.text} opacity-70`}>
                Powered by Angel SmartAPI
              </span>
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center"
          >
            <p className={`text-xs ${currentTheme.text} opacity-50 leading-relaxed`}>
              🔒 Your credentials are securely encrypted and never stored on our servers.
              We use Angel One's official OAuth API for authentication.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
