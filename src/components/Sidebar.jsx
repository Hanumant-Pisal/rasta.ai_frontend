import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  BarChart2,
  ChevronRight,
  X
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: BarChart2, path: '/analytics' },
  { name: 'Projects', icon: FolderKanban, path: '/projects' },
  { name: 'Team', icon: Users, path: '/team', requiresOwner: true },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  return (
    <>
    
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      
      <div className={`
        w-64 bg-gradient-to-br from-blue-600 to-indigo-800 h-screen fixed left-0 top-0 shadow-lg z-50
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
       
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <Link to="/analytics" className="flex items-center">
            <span className="text-xl font-bold text-white tracking-tight">Trellio-Lite</span>
          </Link>
          
          
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
