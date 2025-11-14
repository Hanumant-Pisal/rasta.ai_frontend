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
  { name: 'Dashboard', icon: BarChart2, path: '/analytics' },
  { name: 'Projects', icon: FolderKanban, path: '/projects' },
  { name: 'Team', icon: Users, path: '/team', requiresOwner: true },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  return (
    <div className="w-66 bg-gradient-to-br from-blue-600 to-indigo-800 h-screen fixed left-0 top-0 pt-16 shadow-sm z-30">
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
                  flex items-center justify-between px-4 py-4 rounded-lg transition-colors
                  text-base font-medium
                  ${isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-blue-100 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <div className="flex items-center">
                  <Icon 
                    className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-blue-200'}`} 
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
