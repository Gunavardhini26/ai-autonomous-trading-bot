import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Search,
  Trash2,
  RotateCcw,
  Plus
} from 'lucide-react';

interface Order {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  quantity: number;
  price: number;
  executedQty: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED' | 'PARTIAL';
  timestamp: Date;
  validity: 'DAY' | 'IOC' | 'GTD';
  exchange: 'NSE' | 'BSE' | 'MCX';
  segment: 'EQUITY' | 'FO' | 'COMMODITY' | 'CURRENCY';
  avgPrice?: number;
  rejectionReason?: string;
}

const OrdersNew: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'today' | 'all' | 'failed' | 'cancelled'>('today');
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD001',
      symbol: 'RELIANCE',
      type: 'BUY',
      orderType: 'LIMIT',
      quantity: 100,
      price: 2485.50,
      executedQty: 100,
      status: 'EXECUTED',
      timestamp: new Date('2025-07-10T09:30:00'),
      validity: 'DAY',
      exchange: 'NSE',
      segment: 'EQUITY',
      avgPrice: 2485.50
    },
    {
      id: 'ORD002',
      symbol: 'TCS',
      type: 'SELL',
      orderType: 'MARKET',
      quantity: 50,
      price: 3421.80,
      executedQty: 25,
      status: 'PARTIAL',
      timestamp: new Date('2025-07-10T10:15:00'),
      validity: 'DAY',
      exchange: 'NSE',
      segment: 'EQUITY',
      avgPrice: 3420.50
    },
    {
      id: 'ORD003',
      symbol: 'BANKNIFTY',
      type: 'BUY',
      orderType: 'SL',
      quantity: 25,
      price: 48500.00,
      executedQty: 0,
      status: 'PENDING',
      timestamp: new Date('2025-07-10T11:00:00'),
      validity: 'DAY',
      exchange: 'NSE',
      segment: 'FO'
    },
    {
      id: 'ORD004',
      symbol: 'INFY',
      type: 'BUY',
      orderType: 'LIMIT',
      quantity: 75,
      price: 1567.90,
      executedQty: 0,
      status: 'CANCELLED',
      timestamp: new Date('2025-07-10T12:30:00'),
      validity: 'DAY',
      exchange: 'NSE',
      segment: 'EQUITY'
    },
    {
      id: 'ORD005',
      symbol: 'HDFC',
      type: 'SELL',
      orderType: 'MARKET',
      quantity: 200,
      price: 1678.30,
      executedQty: 0,
      status: 'REJECTED',
      timestamp: new Date('2025-07-10T13:45:00'),
      validity: 'DAY',
      exchange: 'NSE',
      segment: 'EQUITY',
      rejectionReason: 'Insufficient margin'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    segment: '',
    exchange: '',
    type: ''
  });

  // Real-time order updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(order => {
        if (order.status === 'PENDING' && Math.random() > 0.7) {
          return {
            ...order,
            status: Math.random() > 0.5 ? 'EXECUTED' : 'PARTIAL',
            executedQty: Math.random() > 0.5 ? order.quantity : Math.floor(order.quantity * Math.random()),
            avgPrice: order.price + (Math.random() - 0.5) * 5
          };
        }
        return order;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'EXECUTED': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'PARTIAL': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'REJECTED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'EXECUTED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'PARTIAL': return <AlertCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || order.status === filters.status;
    const matchesSegment = !filters.segment || order.segment === filters.segment;
    const matchesExchange = !filters.exchange || order.exchange === filters.exchange;
    const matchesType = !filters.type || order.type === filters.type;

    const today = new Date();
    const orderDate = order.timestamp;
    const isToday = orderDate.toDateString() === today.toDateString();

    switch (activeTab) {
      case 'today': return matchesSearch && matchesStatus && matchesSegment && matchesExchange && matchesType && isToday;
      case 'all': return matchesSearch && matchesStatus && matchesSegment && matchesExchange && matchesType;
      case 'failed': return matchesSearch && (order.status === 'REJECTED' || order.status === 'CANCELLED') && matchesSegment && matchesExchange && matchesType;
      case 'cancelled': return matchesSearch && order.status === 'CANCELLED' && matchesSegment && matchesExchange && matchesType;
      default: return true;
    }
  });

  const exportOrders = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Order ID,Symbol,Type,Order Type,Quantity,Price,Executed Qty,Status,Timestamp,Exchange,Segment\n"
      + filteredOrders.map(order => 
          `${order.id},${order.symbol},${order.type},${order.orderType},${order.quantity},${order.price},${order.executedQty},${order.status},${order.timestamp.toISOString()},${order.exchange},${order.segment}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and track all your trading orders
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={exportOrders}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowPlaceOrder(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 
                       text-white rounded-lg font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Place Order</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by symbol or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="EXECUTED">Executed</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <select
                  value={filters.segment}
                  onChange={(e) => setFilters(prev => ({ ...prev, segment: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Segments</option>
                  <option value="EQUITY">Equity</option>
                  <option value="FO">F&O</option>
                  <option value="COMMODITY">Commodity</option>
                  <option value="CURRENCY">Currency</option>
                </select>

                <select
                  value={filters.exchange}
                  onChange={(e) => setFilters(prev => ({ ...prev, exchange: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Exchanges</option>
                  <option value="NSE">NSE</option>
                  <option value="BSE">BSE</option>
                  <option value="MCX">MCX</option>
                </select>

                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Buy & Sell</option>
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'today', label: 'Today', count: orders.filter(o => o.timestamp.toDateString() === new Date().toDateString()).length },
                { key: 'all', label: 'All Orders', count: orders.length },
                { key: 'failed', label: 'Failed', count: orders.filter(o => o.status === 'REJECTED' || o.status === 'CANCELLED').length },
                { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'CANCELLED').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type & Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.symbol}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.id} • {order.exchange} • {order.segment}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.type === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                               : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {order.type}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {order.executedQty}/{order.quantity} • {order.orderType}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{order.price.toFixed(2)}
                        </div>
                        {order.avgPrice && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Avg: ₹{order.avgPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </div>
                      {order.rejectionReason && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {order.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {order.status === 'PENDING' && (
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        {(order.status === 'CANCELLED' || order.status === 'REJECTED') && (
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'today' ? "You haven't placed any orders today." : "No orders match your current filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersNew;
