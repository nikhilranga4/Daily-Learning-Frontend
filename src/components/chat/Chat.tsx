// components/chat/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Paperclip,
  Image,
  File as FileIcon,
  Download,
  Reply,
  ArrowLeft,
  User,
  Shield,
  Check,
  CheckCheck,
  X,
  Edit3,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { chatApi, ChatMessage, ConversationData, Conversation } from '../../lib/chatApi';
import toast from 'react-hot-toast';

// Skeleton Loader Components
const ImageSkeleton = () => (
  <div className="relative">
    <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500">Loading image...</p>
      </div>
    </div>
  </div>
);

const FileSkeleton = () => (
  <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg animate-pulse">
    <div className="w-10 h-10 bg-gray-300 rounded"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
    <div className="w-8 h-8 bg-gray-300 rounded"></div>
  </div>
);

interface ChatProps {
  currentUser: {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    profilePicture?: string;
  };
  onBack: () => void;
}

// Message Bubble Component
interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onReply: (message: ChatMessage) => void;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (mimeType: string) => React.ReactNode;
  onImageClick: (imageData: { url: string; fileName: string; fileId?: string }) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  showDateSeparator?: boolean;
  dateLabel?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  getFileIcon,
  onImageClick,
  showDateSeparator,
  dateLabel,
}) => {
  // All hooks must be called unconditionally
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [fileLoading, setFileLoading] = useState(true);

  if (message.isDeleting) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} my-2`}>
        <div className="flex items-center space-x-2 bg-gray-100 text-gray-500 text-xs px-3 py-2 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Deleting...</span>
        </div>
      </div>
    );
  }

  if (message.isDeleted) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 text-gray-700 italic text-xs px-3 py-1 rounded-full">
          This message was deleted
        </div>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Simulate file loading completion for non-image files
  useEffect(() => {
    if (message.messageType === 'file') {
      const timer = setTimeout(() => {
        setFileLoading(false);
      }, 800); // Simulate loading time

      return () => clearTimeout(timer);
    }
  }, [message.messageType]);

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative py-4`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Date Separator */}
      {showDateSeparator && (
        <div className="w-full text-center text-xs text-gray-500 mb-2">
          {dateLabel}
        </div>
      )}
      
      {/* Action buttons - always render but control visibility */}
      <div 
        className={`absolute top-0 z-10 flex items-center space-x-1 p-1 bg-white border rounded-full shadow-sm transition-opacity ${
          isHovered || message.isDeleting ? 'opacity-100' : 'opacity-0'
        } ${isOwn ? 'right-0' : 'left-0'}`}
      >
        <button
          onClick={() => onReply(message)}
          className="p-1.5 text-black hover:bg-gray-200 rounded-full"
          title="Reply"
        >
          <Reply className="w-4 h-4" />
        </button>
        {isOwn && (
          <>
            <button
              onClick={() => onEdit(message)}
              className="p-1.5 text-black hover:bg-gray-200 rounded-full"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(message._id)}
              className="p-1.5 text-black hover:bg-gray-200 rounded-full"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Reply indicator */}
        {message.replyTo && (
          <div className={`mb-1 text-xs text-gray-500 ${isOwn ? 'text-right' : 'text-left'}`}>
            <div className="bg-gray-100 rounded p-2 border-l-2 border-gray-300">
              <span className="font-medium">Replying to:</span>
              <p className="truncate">
                {message.replyTo.messageType === 'file'
                  ? `📎 ${message.replyTo.fileName}`
                  : message.replyTo.message}
              </p>
            </div>
          </div>
        )}

        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 border border-gray-200'
          }`}
        >
          {/* File attachment */}
          {message.messageType !== 'text' && message.fileUrl && (
            <div className="mb-2">
              {message.messageType === 'image' ? (
                <div className="relative">
                  {imageLoading && <ImageSkeleton />}
                  {imageError && (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-sm">Image unavailable</p>
                        <button
                          onClick={() => {
                            setImageError(false);
                            setImageLoading(true);
                          }}
                          className="text-blue-500 text-xs mt-1 hover:underline"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                  {!imageError && (
                    <img
                      id={`msg-img-${message._id}`}
                      src={message.fileUrl}
                      alt={message.fileName}
                      className={`max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${
                        imageLoading ? 'opacity-0 absolute' : 'opacity-100'
                      }`}
                      style={{ maxHeight: '200px' }}
                      onLoad={() => {
                        setImageLoading(false);
                        setImageError(false);
                      }}
                      onClick={() => {
                        if (!imageLoading && message.fileUrl) {
                          onImageClick({
                            url: message.fileUrl,
                            fileName: message.fileName || 'Image'
                          });
                        }
                      }}
                      onError={() => {
                        console.error('Image failed to load. URL:', message.fileUrl);
                        setImageError(true);
                        setImageLoading(false);
                      }}
                    />
                  )}
                  {!imageLoading && !imageError && (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="relative">
                  {fileLoading && <FileSkeleton />}
                  <div
                    className={`flex items-center space-x-2 p-2 rounded transition-opacity ${
                      isOwn ? 'bg-blue-700' : 'bg-gray-50'
                    } ${fileLoading ? 'opacity-0 absolute' : 'opacity-100'}`}
                  >
                    {getFileIcon(message.fileMimeType || '')}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{message.fileName}</p>
                      {message.fileSize && (
                        <p className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                          {formatFileSize(message.fileSize)}
                        </p>
                      )}
                    </div>
                    <a
                      href={message.fileUrl}
                      download={message.fileName}
                      className={`p-1 rounded hover:bg-opacity-70 ${
                        isOwn ? 'hover:bg-blue-800' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message text */}
          {message.message && message.messageType === 'text' && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.message}
            </p>
          )}

          {/* Text message with file attachment */}
          {message.message &&
           message.messageType !== 'text' &&
           message.fileUrl &&
           message.message !== message.fileName &&
           message.message.trim() !== '' && (
            <p className="text-sm whitespace-pre-wrap break-words mt-2">
              {message.message}
            </p>
          )}

          {/* Message footer */}
          <div
            className={`flex items-center justify-end mt-2 text-xs ${
              isOwn ? 'text-blue-200' : 'text-gray-500'
            }`}
          >
            <div className="flex items-center space-x-1">
              <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                {formatTime(message.createdAt)}
              </span>
              {isOwn && (
                <>
                  {message.isRead ? (
                    <CheckCheck className="w-4 h-4 ml-1" />
                  ) : (
                    <Check className="w-4 h-4 ml-1" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function to format file sizes
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// User List Modal Component
interface UserListModalProps {
  users: Array<{
    _id: string;
    name?: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
  }>;
  onSelectUser: (userId: string) => void;
  onClose: () => void;
}

const UserListModal: React.FC<UserListModalProps> = ({ users, onSelectUser, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Select User</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-80">
          {users.map((user) => (
            <motion.div
              key={user._id}
              whileHover={{ backgroundColor: '#f9fafb' }}
              className="p-4 border-b border-gray-100 cursor-pointer"
              onClick={() => onSelectUser(user._id)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

// Confirmation Modal Component
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{children}</p>
        <div className="flex justify-end space-x-3">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger">
            Delete
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const Chat: React.FC<ChatProps> = ({ currentUser, onBack }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [allUsers, setAllUsers] = useState<Array<{
    _id: string;
    name?: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
  }>>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    fileName: string;
    fileId?: string;
  } | null>(null);
  const [modalImageLoading, setModalImageLoading] = useState(true);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    messageId: string | null;
  }>({
    isOpen: false,
    messageId: null,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
    if (currentUser.isAdmin) {
      fetchAllUsers();
    }
  }, [currentUser.isAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getUserConversations();
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await chatApi.getAllUsers();
      setAllUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchConversation = async (otherUserId: string) => {
    try {
      setLoading(true);
      const response = await chatApi.getConversation(otherUserId);
      setSelectedConversation(response.data.data);
      const messages = response.data.data.messages || [];

      setMessages(messages);
      setSelectedUserId(otherUserId);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedUserId) return;

    try {
      setSending(true);
      const response = await chatApi.sendMessage({
        receiverId: selectedUserId,
        message: newMessage.trim() || undefined,
        file: selectedFile || undefined,
        replyTo: replyTo?._id
      });

      const sentMessage = response.data.data;
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      setSelectedFile(null);
      setReplyTo(null);

      // Update conversations list
      await fetchConversations();

      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileIcon className="w-4 h-4" />;
  };

  const handleEditMessage = (message: ChatMessage) => {
    // TODO: Implement edit functionality
    console.log('Edit message:', message);
    toast.success('Edit functionality coming soon!');
  };

  const handleDeleteMessage = async () => {
    const messageId = deleteConfirmState.messageId;
    if (!messageId) return;

    try {
      setDeleteConfirmState({ isOpen: false, messageId: null });
      
      // Remove message immediately (optimistic update)
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      await chatApi.deleteMessage(messageId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
      
      // Re-add message if deletion failed
      setMessages(prev => {
        const deletedMessage = messages.find(msg => msg._id === messageId);
        return deletedMessage 
          ? [...prev, { ...deletedMessage, isDeleting: false }]
          : prev;
      });
    }
  };

  const openDeleteConfirmation = (messageId: string) => {
    setDeleteConfirmState({ isOpen: true, messageId });
  };

  // Helper function to determine if date separator should be shown
  const shouldShowDateSeparator = (currentMessage: ChatMessage, previousMessage?: ChatMessage) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();

    return currentDate !== previousDate;
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const startNewConversation = (userId: string) => {
    setSelectedUserId(userId);
    setMessages([]);
    setSelectedConversation({
      messages: [],
      otherUser: (() => {
        const foundUser = allUsers.find(u => u._id === userId);
        return {
          _id: userId,
          name: foundUser?.name || foundUser?.email?.split('@')[0] || 'Unknown User',
          email: foundUser?.email || 'unknown@example.com',
          isAdmin: foundUser?.isAdmin || false,
          profilePicture: undefined
        };
      })(),
      pagination: { page: 1, limit: 50, hasMore: false }
    });
    setShowUserList(false);
  };

  if (loading && !selectedConversation) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">
                {currentUser.isAdmin ? 'Admin Chat' : 'Chat with Admin'}
              </h1>
            </div>
          </div>

          {currentUser.isAdmin && (
            <Button
              onClick={() => setShowUserList(!showUserList)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <User className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversations List */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Conversations</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No conversations yet</p>
                {currentUser.isAdmin && (
                  <p className="text-sm mt-1">Start a new conversation with a user</p>
                )}
              </div>
            ) : (
              conversations.map((conversation) => (
                <motion.div
                  key={conversation.participant._id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className={`p-4 border-b border-gray-100 cursor-pointer ${
                    selectedUserId === conversation.participant._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => fetchConversation(conversation.participant._id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        {conversation.participant.isAdmin ? (
                          <Shield className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.participant.name || conversation.participant.email.split('@')[0]}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.participant.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.lastMessage.messageType === 'file'
                          ? `📎 ${conversation.lastMessage.fileName}`
                          : conversation.lastMessage.message
                        }
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversation.lastMessage.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    {selectedConversation.otherUser.isAdmin ? (
                      <Shield className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {selectedConversation.otherUser.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.otherUser.isAdmin ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={message.senderId._id === currentUser._id}
                      onReply={setReplyTo}
                      formatFileSize={formatFileSize}
                      getFileIcon={getFileIcon}
                      onImageClick={setSelectedImage}
                      onEdit={handleEditMessage}
                      onDelete={openDeleteConfirmation}
                      showDateSeparator={shouldShowDateSeparator(message, messages[index - 1])}
                      dateLabel={getDateLabel(message.createdAt)}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                {replyTo && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Reply className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Replying to {replyTo.senderId.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(null)}
                      >
                        ×
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 truncate">
                      {replyTo.messageType === 'file' ? `📎 ${replyTo.fileName}` : replyTo.message}
                    </p>
                  </div>
                )}

                {selectedFile && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(selectedFile.type)}
                        <span className="text-sm text-gray-700">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({formatFileSize(selectedFile.size)})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeSelectedFile}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={1}
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt,.csv,.zip,.rar"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>

                    <Button
                      onClick={sendMessage}
                      disabled={(!newMessage.trim() && !selectedFile) || sending}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
                    >
                      {sending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User List Modal for Admin */}
      {showUserList && currentUser.isAdmin && (
        <UserListModal
          users={allUsers}
          onSelectUser={startNewConversation}
          onClose={() => setShowUserList(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState({ isOpen: false, messageId: null })}
        onConfirm={handleDeleteMessage}
        title="Delete Message?"
      >
        Are you sure you want to permanently delete this message? This action cannot be undone.
      </ConfirmationModal>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - positioned inside screen */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-20 bg-black bg-opacity-70 rounded-full p-3 shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Image Container */}
            <div className="flex flex-col items-center justify-center w-full h-full max-w-[90vw] max-h-[90vh]">
              {/* Image Display */}
              <div className="relative flex-1 flex items-center justify-center w-full">
                {/* Loading spinner for modal image */}
                {modalImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 border-4 border-white border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-white text-sm">Loading full image...</p>
                    </div>
                  </div>
                )}

                <img
                  src={selectedImage.url}
                  alt={selectedImage.fileName}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  style={{
                    maxHeight: 'calc(90vh - 120px)', // Leave space for info panel
                    maxWidth: '90vw'
                  }}
                  onLoad={() => setModalImageLoading(false)}
                  onLoadStart={() => setModalImageLoading(true)}
                  onError={() => {
                    setModalImageLoading(false);
                  }}
                />
              </div>

              {/* Image info and actions - fixed at bottom */}
              <div className="mt-4 bg-black bg-opacity-80 text-white p-4 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-medium mb-3 text-center truncate max-w-[80vw]">
                  {selectedImage.fileName}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <a
                    href={selectedImage.url}
                    download={selectedImage.fileName}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <a
                    href={selectedImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
