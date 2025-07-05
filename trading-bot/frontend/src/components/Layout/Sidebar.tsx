import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon,
  ChartBarIcon,
  BeakerIcon,
  CpuChipIcon,
  ClipboardDocumentListIcon,
  NewspaperIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Live Feed', href: '/live-feed', icon: ChartBarIcon },
  { name: 'Strategy Lab', href: '/strategy-lab', icon: BeakerIcon },
  { name: 'AI Monitor', href: '/ai-monitor', icon: CpuChipIcon },
  { name: 'Trade Logs', href: '/trade-logs', icon: ClipboardDocumentListIcon },
  { name: 'News & Sentiment', href: '/news-sentiment', icon: NewspaperIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-trading-accent text-white'
                    : 'text-gray-300 hover:text-white hover:bg-trading-secondary'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Trading Mode Indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-trading-secondary rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Trading Mode</span>
            <span className="text-sm font-medium text-trading-warning">Paper</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
