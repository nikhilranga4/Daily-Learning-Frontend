// components/chat/ChatButton.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Chat } from './Chat';
import { chatApi } from '../../lib/chatApi';

interface ChatButtonProps {
  currentUser: {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    profilePicture?: string;
  };
}

export const ChatButton: React.FC<ChatButtonProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread messages count
    fetchUnreadCount();

    // Set up polling for new messages (every 30 seconds)
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await chatApi.getUserConversations();
      const conversations = response.data.data || [];
      const totalUnread = conversations.reduce((sum: number, conv: any) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't show error to user, just log it
      setUnreadCount(0);
    }
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset unread count when opening chat
      setUnreadCount(0);
    }
  };

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <Chat currentUser={currentUser} onBack={() => setIsOpen(false)} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Button
        onClick={handleToggleChat}
        className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}

        {/* Pulse animation for new messages */}
        {unreadCount > 0 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-blue-400 rounded-full opacity-30"
          />
        )}
      </Button>
    </motion.div>
  );
};

export default ChatButton;
