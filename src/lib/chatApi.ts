// lib/chatApi.ts
import { api } from './api';

export interface ChatMessage {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    isAdmin: boolean;
  };
  receiverId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    isAdmin: boolean;
  };
  message: string;
  messageType: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  googleDriveFileId?: string;
  isRead: boolean;
  readAt?: string;
  replyTo?: {
    _id: string;
    message: string;
    messageType: string;
    fileName?: string;
  };
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  isDeleting?: boolean;
}

export interface Conversation {
  participant: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    isAdmin: boolean;
  };
  lastMessage: ChatMessage;
  unreadCount: number;
}

export interface ConversationData {
  messages: ChatMessage[];
  otherUser: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    isAdmin: boolean;
  };
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export const chatApi = {
  // Send a message
  sendMessage: async (data: {
    receiverId: string;
    message?: string;
    file?: File;
    replyTo?: string;
  }) => {
    const formData = new FormData();
    formData.append('receiverId', data.receiverId);

    if (data.message) {
      formData.append('message', data.message);
    }

    if (data.file) {
      formData.append('file', data.file);
    }

    if (data.replyTo) {
      formData.append('replyTo', data.replyTo);
    }

    return api.post('/api/chat/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get conversation with another user
  getConversation: async (otherUserId: string, page = 1, limit = 50) => {
    return api.get(`/api/chat/conversation/${otherUserId}?page=${page}&limit=${limit}`);
  },

  // Get all conversations for current user
  getUserConversations: async () => {
    return api.get('/api/chat/conversations');
  },

  // Get all users (for admin)
  getAllUsers: async () => {
    return api.get('/api/chat/users');
  },

  // Mark message as read
  markMessageAsRead: async (messageId: string) => {
    return api.put(`/api/chat/read/${messageId}`);
  },

  // Delete message
  deleteMessage: async (messageId: string) => {
    return api.delete(`/api/chat/message/${messageId}`);
  },
};

export default chatApi;
