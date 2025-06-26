import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Mail, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';

export const PendingApprovalPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Clock className="w-16 h-16 text-yellow-500" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Approval Pending
            </h1>
            
            <div className="space-y-4 text-gray-600">
              <p>
                Your account is waiting for admin approval.
              </p>
              <p>
                You'll receive access once an administrator reviews your request.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Mail className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Registered Email
                  </span>
                </div>
                <p className="text-blue-700 font-semibold">{user?.email}</p>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 mr-2" />
                Account created successfully
              </div>
              
              <div className="flex items-center justify-center text-sm text-yellow-600">
                <Clock className="w-4 h-4 mr-2" />
                Waiting for admin approval
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={logout}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};