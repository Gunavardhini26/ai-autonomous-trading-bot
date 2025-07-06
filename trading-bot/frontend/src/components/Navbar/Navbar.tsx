import React from 'react';

const Navbar: React.FC = () => {
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 bg-gray-800">
          <h1 className="text-white text-xl font-bold">🤖 AI Trading</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          <a href="/dashboard" className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-gray-700">
            Dashboard
          </a>
          <a href="/portfolio" className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-gray-700">
            Portfolio
          </a>
          <a href="/trading" className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-gray-700">
            Trading
          </a>
          <a href="/analytics" className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-gray-700">
            Analytics
          </a>
          <a href="/settings" className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-gray-700">
            Settings
          </a>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
