import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  RefreshCw,
  Eye,
  EyeOff,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface WalletBalance {
  total: number;
  available: number;
  used: number;
  pnl: number;
  pnlPercentage: number;
}

interface BrokerBalance {
  id: string;
  name: string;
  balance: number;
  used: number;
  available: number;
  pnl: number;
  status: 'connected' | 'disconnected' | 'error';
}

interface MarginData {
  equity: number;
  commodity: number;
  currency: number;
  utilized: number;
  available: number;
}

const WalletNew: React.FC = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with real API calls
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    total: 125000.50,
    available: 45000.25,
    used: 80000.25,
    pnl: 5234.75,
    pnlPercentage: 4.36
  });

  const [brokerBalances, setBrokerBalances] = useState<BrokerBalance[]>([
    {
      id: 'zerodha',
      name: 'Zerodha',
      balance: 75000,
      used: 45000,
      available: 30000,
      pnl: 3200,
      status: 'connected'
    },
    {
      id: 'angelone',
      name: 'Angel One',
      balance: 50000,
      used: 35000,
      available: 15000,
      pnl: 2034.75,
      status: 'connected'
    },
    {
      id: 'binance',
      name: 'Binance',
      balance: 250.50,
      used: 250.25,
      available: 0.25,
      pnl: 0,
      status: 'disconnected'
    }
  ]);

  const [marginData, setMarginData] = useState<MarginData>({
    equity: 100000,
    commodity: 25000,
    currency: 0,
    utilized: 80000.25,
    available: 44999.75
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const formatCurrency = (amount: number, hideValue: boolean = false) => {
    if (hideValue) return '₹ ****';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number, hideValue: boolean = false) => {
    if (hideValue) return '****';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <Wallet className="h-8 w-8 text-rose-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage funds, margin, and broker accounts</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overall Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Total Portfolio Value</h2>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="1D">1D</option>
              <option value="1W">1W</option>
              <option value="1M">1M</option>
              <option value="3M">3M</option>
              <option value="1Y">1Y</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Balance</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(walletBalance.total, !isBalanceVisible)}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
            <p className="text-2xl font-semibold text-green-600">
              {formatCurrency(walletBalance.available, !isBalanceVisible)}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">P&L Today</p>
            <div className="flex items-center space-x-2">
              <p className={`text-2xl font-semibold ${walletBalance.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(walletBalance.pnl, !isBalanceVisible)}
              </p>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm ${
                walletBalance.pnl >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {walletBalance.pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{!isBalanceVisible ? '**%' : `${walletBalance.pnlPercentage}%`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broker Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-rose-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Broker Accounts</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {brokerBalances.map((broker) => (
              <div key={broker.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      broker.status === 'connected' ? 'bg-green-500' : 
                      broker.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <h4 className="font-medium text-gray-900 dark:text-white">{broker.name}</h4>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-lg ${
                    broker.status === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    broker.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {broker.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Balance</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(broker.balance, !isBalanceVisible)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Available</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(broker.available, !isBalanceVisible)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">P&L</p>
                    <p className={`font-medium ${broker.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(broker.pnl, !isBalanceVisible)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Margin Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-rose-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Margin Overview</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Margin Utilization */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Margin Utilized</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {!isBalanceVisible ? '**%' : `${((marginData.utilized / (marginData.utilized + marginData.available)) * 100).toFixed(1)}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(marginData.utilized / (marginData.utilized + marginData.available)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Used: {formatCurrency(marginData.utilized, !isBalanceVisible)}
                </span>
                <span className="text-green-600">
                  Available: {formatCurrency(marginData.available, !isBalanceVisible)}
                </span>
              </div>
            </div>

            {/* Segment-wise Margin */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Segment-wise Limits</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Equity</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(marginData.equity, !isBalanceVisible)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Commodity</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(marginData.commodity, !isBalanceVisible)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Currency</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(marginData.currency, !isBalanceVisible)}
                  </span>
                </div>
              </div>
            </div>

            {/* Margin Warning */}
            {((marginData.utilized / (marginData.utilized + marginData.available)) * 100) > 80 && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  High margin utilization. Consider reducing positions or adding funds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center justify-center space-x-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <ArrowDownLeft className="h-5 w-5 text-green-600" />
          <span className="font-medium text-gray-900 dark:text-white">Add Funds</span>
        </button>
        
        <button className="flex items-center justify-center space-x-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <ArrowUpRight className="h-5 w-5 text-red-600" />
          <span className="font-medium text-gray-900 dark:text-white">Withdraw</span>
        </button>
        
        <button className="flex items-center justify-center space-x-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <PieChart className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900 dark:text-white">View Reports</span>
        </button>
      </div>
    </div>
  );
};

export default WalletNew;
