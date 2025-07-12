import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  Zap,
  AlertTriangle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Globe,
  Database,
  Activity
} from 'lucide-react';

interface APIConfig {
  provider: string;
  apiKey: string;
  secret: string;
  isActive: boolean;
}

const SettingsNew: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('trading');
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});

  const [tradingSettings, setTradingSettings] = useState({
    maxLossPerTrade: 1000,
    dailyLimit: 10000,
    maxExposurePercent: 20,
    stopLossPercent: 5,
    takeProfitPercent: 10,
    mode: 'paper' as 'paper' | 'live',
    autoTrading: true,
    riskLevel: 'medium' as 'low' | 'medium' | 'high'
  });

  const [apiConfigs, setApiConfigs] = useState<APIConfig[]>([
    {
      provider: 'Angel One',
      apiKey: 'ak_live_***************',
      secret: '***************',
      isActive: true
    },
    {
      provider: 'Alpha Vantage',
      apiKey: 'av_demo_***************',
      secret: '',
      isActive: true
    },
    {
      provider: 'News API',
      apiKey: 'news_***************',
      secret: '',
      isActive: true
    }
  ]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    pnlAlerts: true,
    newsAlerts: false,
    systemAlerts: true
  });

  const [systemSettings, setSystemSettings] = useState({
    autoReconnect: true,
    dataRefreshRate: 1000,
    logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
    enableTelemetry: true,
    cacheSize: 100
  });

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const updateApiConfig = (provider: string, field: string, value: string | boolean) => {
    setApiConfigs(prev => prev.map(config => 
      config.provider === provider ? { ...config, [field]: value } : config
    ));
  };

  const saveSettings = () => {
    // Implement save logic
    console.log('Saving settings...');
  };

  const resetToDefaults = () => {
    // Implement reset logic
    console.log('Resetting to defaults...');
  };

  const tabs = [
    { id: 'trading', label: 'Trading', icon: <Activity className="h-4 w-4" /> },
    { id: 'risk', label: 'Risk Management', icon: <Shield className="h-4 w-4" /> },
    { id: 'api', label: 'API Keys', icon: <Key className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'system', label: 'System', icon: <SettingsIcon className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure your trading bot and platform preferences
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={saveSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 
                       text-white font-medium rounded-lg"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              
              {/* Trading Settings */}
              {activeTab === 'trading' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trading Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Trading Mode
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="paper"
                            checked={tradingSettings.mode === 'paper'}
                            onChange={(e) => setTradingSettings(prev => ({ ...prev, mode: e.target.value as any }))}
                            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Paper Trading</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="live"
                            checked={tradingSettings.mode === 'live'}
                            onChange={(e) => setTradingSettings(prev => ({ ...prev, mode: e.target.value as any }))}
                            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Live Trading</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Risk Level
                      </label>
                      <select
                        value={tradingSettings.riskLevel}
                        onChange={(e) => setTradingSettings(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="low">Conservative</option>
                        <option value="medium">Moderate</option>
                        <option value="high">Aggressive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Auto Trading</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enable automated trade execution based on AI signals
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tradingSettings.autoTrading}
                        onChange={(e) => setTradingSettings(prev => ({ ...prev, autoTrading: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                    peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer 
                                    dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                                    after:transition-all dark:border-gray-600 peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Risk Management */}
              {activeTab === 'risk' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Management</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Loss Per Trade (₹)
                      </label>
                      <input
                        type="number"
                        value={tradingSettings.maxLossPerTrade}
                        onChange={(e) => setTradingSettings(prev => ({ ...prev, maxLossPerTrade: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Daily Loss Limit (₹)
                      </label>
                      <input
                        type="number"
                        value={tradingSettings.dailyLimit}
                        onChange={(e) => setTradingSettings(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Exposure (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={tradingSettings.maxExposurePercent}
                        onChange={(e) => setTradingSettings(prev => ({ ...prev, maxExposurePercent: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stop Loss (%)
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="20"
                        step="0.1"
                        value={tradingSettings.stopLossPercent}
                        onChange={(e) => setTradingSettings(prev => ({ ...prev, stopLossPercent: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Risk Warning</h4>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                          These settings directly impact your trading risk. Ensure you understand the implications before making changes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Configuration</h3>
                  
                  <div className="space-y-4">
                    {apiConfigs.map((config, index) => (
                      <div key={config.provider} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">{config.provider}</h4>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.isActive}
                              onChange={(e) => updateApiConfig(config.provider, 'isActive', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                          peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer 
                                          dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                                          after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                                          after:transition-all dark:border-gray-600 peer-checked:bg-rose-600"></div>
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              API Key
                            </label>
                            <div className="relative">
                              <input
                                type={showApiKeys[config.provider] ? 'text' : 'password'}
                                value={config.apiKey}
                                onChange={(e) => updateApiConfig(config.provider, 'apiKey', e.target.value)}
                                className="w-full pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => toggleApiKeyVisibility(config.provider)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showApiKeys[config.provider] ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {config.secret && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Secret Key
                              </label>
                              <input
                                type="password"
                                value={config.secret}
                                onChange={(e) => updateApiConfig(config.provider, 'secret', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {key === 'email' && 'Receive notifications via email'}
                            {key === 'push' && 'Browser push notifications'}
                            {key === 'sms' && 'SMS notifications for critical alerts'}
                            {key === 'orderUpdates' && 'Notifications for order status changes'}
                            {key === 'pnlAlerts' && 'Alerts for significant P&L changes'}
                            {key === 'newsAlerts' && 'Market news and sentiment alerts'}
                            {key === 'systemAlerts' && 'System status and maintenance alerts'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                        peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer 
                                        dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                                        after:transition-all dark:border-gray-600 peer-checked:bg-rose-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', desc: 'Clean white interface' },
                        { value: 'dark', label: 'Dark', desc: 'Easy on the eyes' },
                        { value: 'alert', label: 'Alert', desc: 'Red warning theme' }
                      ].map((themeOption) => (
                        <button
                          key={themeOption.value}
                          onClick={() => setTheme(themeOption.value as any)}
                          className={`p-4 rounded-lg border-2 text-left transition-colors ${
                            theme === themeOption.value
                              ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900 dark:text-white mb-1">
                            {themeOption.label}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {themeOption.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* System */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Data Refresh Rate (ms)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="10000"
                        value={systemSettings.dataRefreshRate}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, dataRefreshRate: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Log Level
                      </label>
                      <select
                        value={systemSettings.logLevel}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, logLevel: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="debug">Debug</option>
                        <option value="info">Info</option>
                        <option value="warn">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Auto Reconnect</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Automatically reconnect to WebSocket on connection loss
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.autoReconnect}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, autoReconnect: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                      peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer 
                                      dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                      after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                                      after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                                      after:transition-all dark:border-gray-600 peer-checked:bg-rose-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Enable Telemetry</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Share anonymous usage data to help improve the platform
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.enableTelemetry}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, enableTelemetry: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                      peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer 
                                      dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                      after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                                      after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                                      after:transition-all dark:border-gray-600 peer-checked:bg-rose-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* WebSocket Status */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        WebSocket Connected
                      </span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Last reconnect: Never • Uptime: 2h 15m
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsNew;
