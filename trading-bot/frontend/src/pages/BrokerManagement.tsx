import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Wifi,
  WifiOff,
  Settings,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface BrokerConfig {
  id: string;
  name: string;
  logo: string;
  segments: string[];
  fields: {
    name: string;
    type: 'text' | 'password' | 'number';
    label: string;
    placeholder: string;
    required: boolean;
  }[];
}

const brokerConfigs: BrokerConfig[] = [
  {
    id: 'angel_one',
    name: 'Angel One',
    logo: '🔸',
    segments: ['Equity', 'F&O', 'Commodities'],
    fields: [
      { name: 'clientId', type: 'text', label: 'Client ID', placeholder: 'Enter your client ID', required: true },
      { name: 'password', type: 'password', label: 'Password', placeholder: 'Enter your password', required: true },
      { name: 'apiKey', type: 'text', label: 'API Key', placeholder: 'Enter API key', required: true },
      { name: 'totp', type: 'text', label: 'TOTP', placeholder: 'Enter TOTP (if enabled)', required: false }
    ]
  },
  {
    id: 'zerodha',
    name: 'Zerodha Kite',
    logo: '🟧',
    segments: ['Equity', 'F&O', 'Commodities'],
    fields: [
      { name: 'apiKey', type: 'text', label: 'API Key', placeholder: 'Enter Kite API key', required: true },
      { name: 'apiSecret', type: 'password', label: 'API Secret', placeholder: 'Enter API secret', required: true },
      { name: 'requestToken', type: 'text', label: 'Request Token', placeholder: 'Enter request token', required: true }
    ]
  },
  {
    id: 'binance',
    name: 'Binance',
    logo: '🟡',
    segments: ['Crypto'],
    fields: [
      { name: 'apiKey', type: 'text', label: 'API Key', placeholder: 'Enter Binance API key', required: true },
      { name: 'apiSecret', type: 'password', label: 'API Secret', placeholder: 'Enter API secret', required: true }
    ]
  },
  {
    id: 'upstox',
    name: 'Upstox',
    logo: '🟣',
    segments: ['Equity', 'F&O', 'Commodities'],
    fields: [
      { name: 'apiKey', type: 'text', label: 'API Key', placeholder: 'Enter Upstox API key', required: true },
      { name: 'apiSecret', type: 'password', label: 'API Secret', placeholder: 'Enter API secret', required: true },
      { name: 'redirectUri', type: 'text', label: 'Redirect URI', placeholder: 'Enter redirect URI', required: true }
    ]
  }
];

const BrokerManagement: React.FC = () => {
  const { user, connectBroker, disconnectBroker, isLoading, error } = useAuth();
  const [showAddBroker, setShowAddBroker] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<BrokerConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const connectedBrokers = user?.connectedBrokers || [];

  const handleAddBroker = () => {
    setShowAddBroker(true);
    setSelectedBroker(null);
    setFormData({});
  };

  const handleSelectBroker = (broker: BrokerConfig) => {
    setSelectedBroker(broker);
    setFormData({});
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBroker) return;

    const success = await connectBroker({
      broker: selectedBroker.id,
      ...formData
    });

    if (success) {
      setShowAddBroker(false);
      setSelectedBroker(null);
      setFormData({});
    }
  };

  const handleDisconnect = async (brokerId: string) => {
    if (window.confirm('Are you sure you want to disconnect this broker?')) {
      await disconnectBroker(brokerId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'expired': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'invalid': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'connecting': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Broker Connections</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your broker connections for multi-platform trading
          </p>
        </div>
        
        <button
          onClick={handleAddBroker}
          className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Broker</span>
        </button>
      </div>

      {/* Connected Brokers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectedBrokers.map((broker) => (
          <div key={broker.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {brokerConfigs.find(b => b.id === broker.broker)?.logo || '🔗'}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {brokerConfigs.find(b => b.id === broker.broker)?.name || broker.broker}
                  </h3>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(broker.status)}`}>
                    {broker.status === 'connected' && <Wifi className="w-3 h-3 mr-1" />}
                    {broker.status === 'expired' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {broker.status === 'invalid' && <WifiOff className="w-3 h-3 mr-1" />}
                    {broker.status.charAt(0).toUpperCase() + broker.status.slice(1)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Settings className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDisconnect(broker.id)}
                  className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {broker.segments.map((segment) => (
                  <span
                    key={segment}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-md"
                  >
                    {segment}
                  </span>
                ))}
              </div>
              
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Last updated: {new Date(broker.lastUpdated).toLocaleDateString()}
              </div>
              
              {broker.isDefault && (
                <div className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
                  <Check className="w-4 h-4" />
                  <span>Default broker</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {connectedBrokers.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No brokers connected</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Connect your first broker to start trading across multiple platforms
            </p>
            <button
              onClick={handleAddBroker}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Broker</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Broker Modal */}
      {showAddBroker && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddBroker(false)}></div>

            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-800 shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  {selectedBroker ? `Connect ${selectedBroker.name}` : 'Choose a Broker'}
                </h3>
                <button
                  onClick={() => setShowAddBroker(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  ✕
                </button>
              </div>

              {!selectedBroker ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brokerConfigs.map((broker) => (
                    <button
                      key={broker.id}
                      onClick={() => handleSelectBroker(broker)}
                      className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-rose-300 dark:hover:border-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all text-left"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl">{broker.logo}</div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">{broker.name}</h4>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {broker.segments.map((segment) => (
                          <span
                            key={segment}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded"
                          >
                            {segment}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                      <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {selectedBroker.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={field.type === 'password' && !showPasswords[field.name] ? 'password' : 'text'}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                          className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                        {field.type === 'password' && (
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(field.name)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          >
                            {showPasswords[field.name] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setSelectedBroker(null)}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors"
                    >
                      {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>{isLoading ? 'Connecting...' : 'Connect Broker'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerManagement;
