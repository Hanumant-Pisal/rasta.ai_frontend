import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings, 
  BarChart2,
  ChevronRight,
  X
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: BarChart2, path: '/analytics' },
  { name: 'Projects', icon: FolderKanban, path: '/projects' },
  { name: 'Team', icon: Users, path: '/team', requiresOwner: true },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        w-64 bg-gradient-to-br from-blue-600 to-indigo-800 h-screen fixed left-0 top-0 pt-16 shadow-lg z-50
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-20 right-4 text-white hover:bg-white/10 p-2 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

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
                onClick={onClose}
                className={`
                  flex items-center justify-between px-4 py-3 sm:py-4 rounded-lg transition-colors
                  text-sm sm:text-base font-medium
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
    </>
  );
};

export default Sidebar;
