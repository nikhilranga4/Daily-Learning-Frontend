import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { adminApi } from '../../lib/api';
import { User } from '../../types';
import toast from 'react-hot-toast';

export const UserManagement: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingResponse, allUsersResponse] = await Promise.all([
        adminApi.getPendingUsers(),
        adminApi.getAllUsers(),
      ]);
      setPendingUsers(pendingResponse.data);
      setAllUsers(allUsersResponse.data);
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.approveUser(userId);
      toast.success('User approved successfully');
      fetchData(); // Refresh data
    } catch (error) {
      toast.error('Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.rejectUser(userId);
      toast.success('User rejected');
      fetchData(); // Refresh data
    } catch (error) {
      toast.error('Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const approvedUsers = allUsers.filter(user => user.approval_status === 'approved');
  const rejectedUsers = allUsers.filter(user => user.approval_status === 'rejected');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="text-center py-6">
            <Users className="w-8 h-8 mx-auto text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Total Users</h3>
            <p className="text-2xl font-bold text-blue-600">{allUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-6">
            <UserCheck className="w-8 h-8 mx-auto text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Approved</h3>
            <p className="text-2xl font-bold text-green-600">{approvedUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-6">
            <div className="w-8 h-8 mx-auto bg-yellow-600 rounded-full flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-6">
            <UserX className="w-8 h-8 mx-auto text-red-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">{rejectedUsers.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-800">Pending User Approvals ({pendingUsers.length})</h2>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Pending Approvals</h3>
              <p className="text-gray-500">All users have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold text-gray-800">{user.email}</h4>
                    <p className="text-sm text-gray-600">Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {user.authProvider}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveUser(user._id)}
                      loading={actionLoading === user._id}
                      disabled={actionLoading !== null}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRejectUser(user._id)}
                      loading={actionLoading === user._id}
                      disabled={actionLoading !== null}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
