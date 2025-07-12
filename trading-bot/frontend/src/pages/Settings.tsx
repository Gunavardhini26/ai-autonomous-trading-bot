import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { liveDataService } from '../services/LiveDataService';
import { 
  Cog6ToothIcon, 
  UserIcon, 
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  country: string;
  timezone: string;
  avatar?: string;
  createdAt: number;
  lastLogin: number;
  isVerified: boolean;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
}

interface TradingSettings {
  maxPositionSize: number;
  maxDailyLoss: number;
  maxOpenPositions: number;
  riskPerTrade: number;
  autoStopLoss: boolean;
  autoTakeProfit: boolean;
  defaultStopLoss: number;
  defaultTakeProfit: number;
  tradingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  allowedMarkets: string[];
  blacklistedSymbols: string[];
}

interface NotificationSettings {
  email: {
    trades: boolean;
    alerts: boolean;
    reports: boolean;
    news: boolean;
    security: boolean;
  };
  push: {
    trades: boolean;
    alerts: boolean;
    reports: boolean;
    news: boolean;
    security: boolean;
  };
  sms: {
    trades: boolean;
    alerts: boolean;
    security: boolean;
  };
}

interface APICredentials {
  id: string;
  name: string;
  provider: 'ANGEL_ONE' | 'BINANCE' | 'ALPHA_VANTAGE' | 'NEWS_API';
  apiKey: string;
  apiSecret?: string;
  isActive: boolean;
  lastUsed: number;
  rateLimit: number;
}

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'trading' | 'notifications' | 'security' | 'api'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tradingSettings, setTradingSettings] = useState<TradingSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [apiCredentials, setApiCredentials] = useState<APICredentials[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApiForm, setShowApiForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newApiCredential, setNewApiCredential] = useState({
    name: '',
    provider: 'ANGEL_ONE' as APICredentials['provider'],
    apiKey: '',
    apiSecret: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileData = await liveDataService.getUserProfile();
      if (!profileData) {
        // Sample profile data
        setProfile({
          id: 'user_1',
          username: 'trader_pro',
          email: 'trader@example.com',
          fullName: 'John Doe',
          phone: '+91 9876543210',
          country: 'India',
          timezone: 'Asia/Kolkata',
          createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now() - 2 * 60 * 60 * 1000,
          isVerified: true,
          plan: 'PRO'
        });
      } else {
        setProfile(profileData);
      }

      // Fetch trading settings
      const tradingData = await liveDataService.getTradingSettings();
      if (!tradingData) {
        // Sample trading settings
        setTradingSettings({
          maxPositionSize: 100000,
          maxDailyLoss: 10000,
          maxOpenPositions: 5,
          riskPerTrade: 2,
          autoStopLoss: true,
          autoTakeProfit: true,
          defaultStopLoss: 2,
          defaultTakeProfit: 5,
          tradingHours: {
            start: '09:15',
            end: '15:30',
            timezone: 'Asia/Kolkata'
          },
          allowedMarkets: ['NSE', 'BSE', 'CRYPTO'],
          blacklistedSymbols: []
        });
      } else {
        setTradingSettings(tradingData);
      }

      // Fetch notification settings
      const notificationData = await liveDataService.getNotificationSettings();
      if (!notificationData) {
        // Sample notification settings
        setNotificationSettings({
          email: {
            trades: true,
            alerts: true,
            reports: true,
            news: false,
            security: true
          },
          push: {
            trades: true,
            alerts: true,
            reports: false,
            news: false,
            security: true
          },
          sms: {
            trades: false,
            alerts: true,
            security: true
          }
        });
      } else {
        setNotificationSettings(notificationData);
      }

      // Fetch API credentials
      const apiData = await liveDataService.getAPICredentials();
      if (!apiData) {
        // Sample API credentials
        setApiCredentials([
          {
            id: 'api_1',
            name: 'Angel One Production',
            provider: 'ANGEL_ONE',
            apiKey: 'AO_***************',
            apiSecret: '***************',
            isActive: true,
            lastUsed: Date.now() - 60 * 60 * 1000,
            rateLimit: 1000
          },
          {
            id: 'api_2',
            name: 'Binance Trading',
            provider: 'BINANCE',
            apiKey: 'BN_***************',
            apiSecret: '***************',
            isActive: true,
            lastUsed: Date.now() - 30 * 60 * 1000,
            rateLimit: 1200
          }
        ]);
      } else {
        setApiCredentials(apiData);
      }

    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      await liveDataService.updateUserProfile(profile);
      // Show success message
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveTradingSettings = async () => {
    if (!tradingSettings) return;
    
    try {
      setSaving(true);
      await liveDataService.updateTradingSettings(tradingSettings);
      // Show success message
    } catch (error) {
      console.error('Error saving trading settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    if (!notificationSettings) return;
    
    try {
      setSaving(true);
      await liveDataService.updateNotificationSettings(notificationSettings);
      // Show success message
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const addAPICredential = async () => {
    try {
      const newCredential: APICredentials = {
        id: `api_${Date.now()}`,
        ...newApiCredential,
        isActive: true,
        lastUsed: 0,
        rateLimit: 1000
      };

      setApiCredentials(prev => [...prev, newCredential]);
      setShowApiForm(false);
      setNewApiCredential({
        name: '',
        provider: 'ANGEL_ONE',
        apiKey: '',
        apiSecret: ''
      });

      await liveDataService.addAPICredential(newCredential);
    } catch (error) {
      console.error('Error adding API credential:', error);
    }
  };

  const removeAPICredential = async (id: string) => {
    try {
      setApiCredentials(prev => prev.filter(api => api.id !== id));
      await liveDataService.removeAPICredential(id);
    } catch (error) {
      console.error('Error removing API credential:', error);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      await liveDataService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      // Show success message
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'trading', label: 'Trading', icon: ChartBarIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'api', label: 'API Keys', icon: LockClosedIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Settings
          </h1>
          <p className="text-text-secondary">
            Manage your account, trading preferences, and security settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-bg-secondary rounded-lg overflow-hidden">
              <div className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-accent-primary text-white'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-bg-secondary rounded-lg">
              {/* Profile Tab */}
              {activeTab === 'profile' && profile && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Profile Information</h2>
                    <motion.button
                      onClick={saveProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-secondary transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-text-secondary text-sm mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, fullName: e.target.value } : null)}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary text-sm mb-2">Username</label>
                      <input
                        type="text"
                        value={profile.username}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, username: e.target.value } : null)}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary text-sm mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary text-sm mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary text-sm mb-2">Country</label>
                      <select
                        value={profile.country}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, country: e.target.value } : null)}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      >
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-text-secondary text-sm mb-2">Timezone</label>
                      <select
                        value={profile.timezone}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, timezone: e.target.value } : null)}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/Toronto">America/Toronto</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border-primary">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-bg-tertiary rounded-lg p-4">
                        <p className="text-text-secondary text-sm">Plan</p>
                        <p className="text-text-primary font-semibold">{profile.plan}</p>
                      </div>
                      <div className="bg-bg-tertiary rounded-lg p-4">
                        <p className="text-text-secondary text-sm">Account Created</p>
                        <p className="text-text-primary font-semibold">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-bg-tertiary rounded-lg p-4">
                        <p className="text-text-secondary text-sm">Last Login</p>
                        <p className="text-text-primary font-semibold">
                          {new Date(profile.lastLogin).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trading Tab */}
              {activeTab === 'trading' && tradingSettings && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Trading Settings</h2>
                    <motion.button
                      onClick={saveTradingSettings}
                      disabled={saving}
                      className="px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-secondary transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Risk Management</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-text-secondary text-sm mb-2">Max Position Size (₹)</label>
                          <input
                            type="number"
                            value={tradingSettings.maxPositionSize}
                            onChange={(e) => setTradingSettings(prev => prev ? { ...prev, maxPositionSize: Number(e.target.value) } : null)}
                            className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm mb-2">Max Daily Loss (₹)</label>
                          <input
                            type="number"
                            value={tradingSettings.maxDailyLoss}
                            onChange={(e) => setTradingSettings(prev => prev ? { ...prev, maxDailyLoss: Number(e.target.value) } : null)}
                            className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm mb-2">Max Open Positions</label>
                          <input
                            type="number"
                            value={tradingSettings.maxOpenPositions}
                            onChange={(e) => setTradingSettings(prev => prev ? { ...prev, maxOpenPositions: Number(e.target.value) } : null)}
                            className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm mb-2">Risk Per Trade (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={tradingSettings.riskPerTrade}
                            onChange={(e) => setTradingSettings(prev => prev ? { ...prev, riskPerTrade: Number(e.target.value) } : null)}
                            className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Auto Orders</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-text-primary">Auto Stop Loss</label>
                          <button
                            onClick={() => setTradingSettings(prev => prev ? { ...prev, autoStopLoss: !prev.autoStopLoss } : null)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              tradingSettings.autoStopLoss ? 'bg-accent-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                tradingSettings.autoStopLoss ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-text-primary">Auto Take Profit</label>
                          <button
                            onClick={() => setTradingSettings(prev => prev ? { ...prev, autoTakeProfit: !prev.autoTakeProfit } : null)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              tradingSettings.autoTakeProfit ? 'bg-accent-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                tradingSettings.autoTakeProfit ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-text-secondary text-sm mb-2">Default Stop Loss (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={tradingSettings.defaultStopLoss}
                              onChange={(e) => setTradingSettings(prev => prev ? { ...prev, defaultStopLoss: Number(e.target.value) } : null)}
                              className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-text-secondary text-sm mb-2">Default Take Profit (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={tradingSettings.defaultTakeProfit}
                              onChange={(e) => setTradingSettings(prev => prev ? { ...prev, defaultTakeProfit: Number(e.target.value) } : null)}
                              className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Trading Hours</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-text-secondary text-sm mb-2">Start Time</label>
                          <input
                            type="time"
                            value={tradingSettings.tradingHours.start}
                            onChange={(e) => setTradingSettings(prev => prev ? { 
                              ...prev, 
                              tradingHours: { ...prev.tradingHours, start: e.target.value } 
                            } : null)}
                            className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm mb-2">End Time</label>
                          <input
                            type="time"
                            value={tradingSettings.tradingHours.end}
                            onChange={(e) => setTradingSettings(prev => prev ? { 
                              ...prev, 
                              tradingHours: { ...prev.tradingHours, end: e.target.value } 
                            } : null)}
                            className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm mb-2">Timezone</label>
                          <select
                            value={tradingSettings.tradingHours.timezone}
                            onChange={(e) => setTradingSettings(prev => prev ? { 
                              ...prev, 
                              tradingHours: { ...prev.tradingHours, timezone: e.target.value } 
                            } : null)}
                            className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                          >
                            <option value="Asia/Kolkata">Asia/Kolkata</option>
                            <option value="America/New_York">America/New_York</option>
                            <option value="Europe/London">Europe/London</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && notificationSettings && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Notification Settings</h2>
                    <motion.button
                      onClick={saveNotificationSettings}
                      disabled={saving}
                      className="px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-secondary transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>

                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        {Object.entries(notificationSettings.email).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <label className="text-text-primary capitalize">{key}</label>
                            <button
                              onClick={() => setNotificationSettings(prev => prev ? {
                                ...prev,
                                email: { ...prev.email, [key]: !value }
                              } : null)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                value ? 'bg-accent-primary' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Push Notifications</h3>
                      <div className="space-y-3">
                        {Object.entries(notificationSettings.push).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <label className="text-text-primary capitalize">{key}</label>
                            <button
                              onClick={() => setNotificationSettings(prev => prev ? {
                                ...prev,
                                push: { ...prev.push, [key]: !value }
                              } : null)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                value ? 'bg-accent-primary' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SMS Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">SMS Notifications</h3>
                      <div className="space-y-3">
                        {Object.entries(notificationSettings.sms).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <label className="text-text-primary capitalize">{key}</label>
                            <button
                              onClick={() => setNotificationSettings(prev => prev ? {
                                ...prev,
                                sms: { ...prev.sms, [key]: !value }
                              } : null)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                value ? 'bg-accent-primary' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-text-primary mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Password</h3>
                      <motion.button
                        onClick={() => setShowPasswordForm(true)}
                        className="px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-secondary transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Change Password
                      </motion.button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-primary">Enable 2FA for enhanced security</p>
                          <p className="text-text-secondary text-sm">Protect your account with an additional layer of security</p>
                        </div>
                        <button
                          className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                        >
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Theme</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-primary">Dark Mode</p>
                          <p className="text-text-secondary text-sm">Toggle between light and dark themes</p>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            theme === 'dark' ? 'bg-accent-primary' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">API Keys</h2>
                    <motion.button
                      onClick={() => setShowApiForm(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-secondary transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Add API Key</span>
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {apiCredentials.map((api) => (
                      <div key={api.id} className="bg-bg-tertiary rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${api.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            <h3 className="text-text-primary font-medium">{api.name}</h3>
                            <span className="px-2 py-1 bg-bg-secondary text-text-secondary text-xs rounded">
                              {api.provider}
                            </span>
                          </div>
                          <motion.button
                            onClick={() => removeAPICredential(api.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </motion.button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-text-secondary">API Key</p>
                            <p className="text-text-primary font-mono">{api.apiKey}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Rate Limit</p>
                            <p className="text-text-primary">{api.rateLimit}/min</p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Last Used</p>
                            <p className="text-text-primary">
                              {api.lastUsed ? new Date(api.lastUsed).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-bg-secondary rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-bold text-text-primary mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="flex-1 px-4 py-2 bg-bg-tertiary text-text-primary rounded-lg font-medium hover:bg-bg-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={changePassword}
                  className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-secondary transition-colors"
                >
                  Change Password
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* API Key Form Modal */}
        {showApiForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-bg-secondary rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-bold text-text-primary mb-4">Add API Key</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={newApiCredential.name}
                    onChange={(e) => setNewApiCredential(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    placeholder="Enter API key name"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Provider</label>
                  <select
                    value={newApiCredential.provider}
                    onChange={(e) => setNewApiCredential(prev => ({ ...prev, provider: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="ANGEL_ONE">Angel One</option>
                    <option value="BINANCE">Binance</option>
                    <option value="ALPHA_VANTAGE">Alpha Vantage</option>
                    <option value="NEWS_API">News API</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-2">API Key</label>
                  <input
                    type="text"
                    value={newApiCredential.apiKey}
                    onChange={(e) => setNewApiCredential(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-2">API Secret (Optional)</label>
                  <input
                    type="password"
                    value={newApiCredential.apiSecret}
                    onChange={(e) => setNewApiCredential(prev => ({ ...prev, apiSecret: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    placeholder="Enter API secret"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowApiForm(false)}
                  className="flex-1 px-4 py-2 bg-bg-tertiary text-text-primary rounded-lg font-medium hover:bg-bg-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addAPICredential}
                  className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-secondary transition-colors"
                >
                  Add API Key
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;
