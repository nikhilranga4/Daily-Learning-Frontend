// components/admin/AdminChatDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Users,
  Clock,
  Search,
  Filter,
  User,
  Shield,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Chat } from '../chat/Chat';
import { chatApi, Conversation } from '../../lib/chatApi';
import toast from 'react-hot-toast';

interface AdminChatDashboardProps {
  currentUser: {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    profilePicture?: string;
  };
  onBack: () => void;
}

export const AdminChatDashboard: React.FC<AdminChatDashboardProps> = ({ currentUser, onBack }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<Array<{
    _id: string;
    name?: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'recent'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Initialize with empty arrays first to prevent undefined errors
      setConversations([]);
      setAllUsers([]);

      const [conversationsRes, usersRes] = await Promise.all([
        chatApi.getUserConversations(),
        chatApi.getAllUsers()
      ]);

      // Safely set data with fallbacks
      const conversations = Array.isArray(conversationsRes?.data?.data) ? conversationsRes.data.data : [];
      const users = Array.isArray(usersRes?.data?.data) ? usersRes.data.data : [];

      setConversations(conversations);
      setAllUsers(users);

      console.log('✅ Chat data loaded:', { conversations: conversations.length, users: users.length });
    } catch (error) {
      console.error('❌ Error fetching chat data:', error);
      toast.error('Failed to load chat data. Please check if the backend is running.');
      // Ensure arrays are always set to prevent undefined errors
      setConversations([]);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Chat data refreshed');
  };

  const filteredConversations = conversations.filter(conv => {
    // Safe access to participant properties with fallbacks
    const participantName = conv.participant?.name || conv.participant?.email?.split('@')[0] || '';
    const participantEmail = conv.participant?.email || '';

    const matchesSearch = participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participantEmail.toLowerCase().includes(searchTerm.toLowerCase());

    switch (filterType) {
      case 'unread':
        return matchesSearch && conv.unreadCount > 0;
      case 'recent': {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return matchesSearch && conv.lastMessage?.createdAt && new Date(conv.lastMessage.createdAt) > oneDayAgo;
      }
      default:
        return matchesSearch;
    }
  });

  const getUnreadCount = () => {
    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  };

  const getTotalUsers = () => {
    return allUsers.length;
  };

  const getActiveConversations = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return conversations.filter(conv => new Date(conv.lastMessage.createdAt) > oneDayAgo).length;
  };

  const startChat = (userId: string) => {
    setSelectedUserId(userId);
    setShowChat(true);
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (showChat && selectedUserId) {
    return (
      <Chat
        currentUser={currentUser}
        onBack={() => {
          setShowChat(false);
          setSelectedUserId(null);
          fetchData(); // Refresh data when returning from chat
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Admin Chat Management</h1>
            </div>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-bold text-red-600">{getUnreadCount()}</p>
                </div>
                <Clock className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-green-600">{getTotalUsers()}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Today</p>
                  <p className="text-2xl font-bold text-purple-600">{getActiveConversations()}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'unread' | 'recent')}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Conversations</option>
                  <option value="unread">Unread Only</option>
                  <option value="recent">Recent (24h)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Conversations */}
        {filteredConversations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800">Active Conversations</h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.participant._id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className="p-6 cursor-pointer transition-colors"
                    onClick={() => startChat(conversation.participant._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              {conversation.participant?.name || conversation.participant?.email?.split('@')[0] || 'Unknown User'}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{conversation.participant?.email || 'No email'}</p>
                          <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                            {conversation.lastMessage?.messageType === 'file'
                              ? `📎 ${conversation.lastMessage?.fileName || 'File'}`
                              : conversation.lastMessage?.message || 'No message'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {conversation.lastMessage?.createdAt ? formatLastMessageTime(conversation.lastMessage.createdAt) : 'No date'}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Continue Chat
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Users List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">All Users</h2>
              <span className="text-sm text-gray-500">{allUsers.length} users</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {allUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No users found</h3>
                <p className="text-gray-500">
                  Users will appear here when they register for the platform
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {allUsers.map((user) => {
                  const hasActiveConversation = conversations.some(conv => conv.participant?._id === user._id);
                  return (
                    <motion.div
                      key={user._id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      className="p-6 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">
                                {user.name || user.email?.split('@')[0] || 'Unknown User'}
                              </h3>
                              {hasActiveConversation && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                            <p className="text-xs text-gray-400">
                              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {hasActiveConversation ? (
                            <Button
                              onClick={() => startChat(user._id)}
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Continue Chat
                            </Button>
                          ) : (
                            <Button
                              onClick={() => startChat(user._id)}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              size="sm"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Start Chat
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      {showChat && selectedUserId && (
        <div className="fixed inset-0 bg-white z-50">
          <Chat
            currentUser={currentUser}
            onBack={() => {
              setShowChat(false);
              setSelectedUserId(null);
            }}
          />
        </div>
      )}
    </div>
  );
};
