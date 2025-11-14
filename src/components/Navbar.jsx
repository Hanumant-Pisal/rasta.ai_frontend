import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate("/profile"); 
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white text-gray-800 shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            
            <h1 
              className="text-lg sm:text-xl font-bold cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all"
              onClick={() => navigate("/")}
            >
              Trellio-Lite
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline-block text-sm font-medium text-gray-800">
                    {user.name}
                  </span>
                  
                  <svg 
                    className={`h-4 w-4 text-gray-600 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm  text-gray-700 border-b border-gray-100">
                      <div className="font-medium ">{user.name}</div>
                      <div className="text-xs text-blue-600">
                        {user.role === 'owner' ? 'Project Owner' : 'Team Member'}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
}
