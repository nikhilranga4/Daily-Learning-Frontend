import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { BookOpen } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-lg">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Daily Learning Platform
          </h1>
          <p className="text-blue-100">
            Master programming through daily practice
          </p>
        </motion.div>
        
        {/* Auth Form */}
        {isLogin ? (
          <LoginForm onToggleForm={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleForm={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};