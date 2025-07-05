import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  BellIcon, 
  CogIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

import { RootState, AppDispatch } from '../../store/store';
import { logoutUser } from '../../store/slices/authSlice';

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isConnected } = useSelector((state: RootState) => state.market);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <nav className="navbar h-16 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="text-xl font-bold text-trading-accent">
          AI Trading Bot
        </Link>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-trading-success' : 'bg-trading-danger'}`} />
          <span className="text-sm text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-trading-danger rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-300">{user?.username}</span>
          </div>
          
          <Link
            to="/settings"
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <CogIcon className="w-5 h-5" />
          </Link>
          
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-trading-danger transition-colors"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
