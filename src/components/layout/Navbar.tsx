import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Settings, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Daily Learning
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Account Button */}
            <Button
              variant={location.pathname === '/account' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                console.log('Navigating to account page...');
                navigate('/account');
              }}
              className={`flex items-center space-x-2 transition-all duration-200 ${
                location.pathname === '/account'
                  ? 'shadow-md ring-2 ring-blue-200'
                  : 'hover:shadow-sm'
              }`}
              title="View Account & Assessment History"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{user?.email}</span>
              <span className="text-sm font-medium sm:hidden">Account</span>
            </Button>

            {/* Admin Button */}
            {user?.isAdmin && (
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};