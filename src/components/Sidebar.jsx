import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings, 
  BarChart2,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { name: 'Analytics', icon: BarChart2, path: '/analytics' },
  { name: 'Projects', icon: FolderKanban, path: '/projects' },
  { name: 'Team', icon: Users, path: '/team', requiresOwner: true },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 pt-16 shadow-sm z-30">
      <div className="p-4">
        
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
          
            if (item.requiresOwner && user?.role !== 'owner') {
              return null;
            }
            
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center">
                  <Icon 
                    className={`w-5 h-5 mr-3 ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`} 
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-500" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
