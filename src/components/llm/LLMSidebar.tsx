import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageCircle,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { LLMConversation } from '../../lib/llmApi';

interface LLMSidebarProps {
  conversations: LLMConversation[];
  currentConversation: LLMConversation | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onUpdateTitle: (conversationId: string, newTitle: string) => void;
}

export const LLMSidebar: React.FC<LLMSidebarProps> = ({
  conversations,
  currentConversation,
  isOpen,
  onToggle,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUpdateTitle,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (conversation: LLMConversation) => {
    setEditingId(conversation._id);
    setEditTitle(conversation.title);
  };

  const saveTitle = () => {
    if (editingId && editTitle.trim()) {
      onUpdateTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const groupConversationsByDate = (conversations: LLMConversation[]) => {
    const groups: { [key: string]: LLMConversation[] } = {};
    const now = new Date();

    conversations.forEach(conv => {
      const date = new Date(conv.lastMessageAt);
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      let groupKey: string;
      if (diffInDays === 0) {
        groupKey = 'Today';
      } else if (diffInDays === 1) {
        groupKey = 'Yesterday';
      } else if (diffInDays < 7) {
        groupKey = 'This Week';
      } else if (diffInDays < 30) {
        groupKey = 'This Month';
      } else {
        groupKey = 'Older';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(conv);
    });

    return groups;
  };

  const conversationGroups = groupConversationsByDate(conversations);
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={`fixed top-4 z-50 transition-all duration-300 ${
          isOpen ? 'left-80' : 'left-4'
        }`}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 bg-white border-r border-gray-200 flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <Button
                onClick={onNewConversation}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs text-gray-400">Start a new chat to begin</p>
                </div>
              ) : (
                <div className="p-2">
                  {groupOrder.map(groupName => {
                    const groupConversations = conversationGroups[groupName];
                    if (!groupConversations || groupConversations.length === 0) {
                      return null;
                    }

                    return (
                      <div key={groupName} className="mb-4">
                        <div className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <Calendar className="w-3 h-3" />
                          <span>{groupName}</span>
                        </div>
                        
                        <div className="space-y-1">
                          {groupConversations.map(conversation => (
                            <motion.div
                              key={conversation._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`group relative rounded-lg transition-colors ${
                                currentConversation?._id === conversation._id
                                  ? 'bg-blue-50 border border-blue-200'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div
                                className="p-3 cursor-pointer"
                                onClick={() => onSelectConversation(conversation._id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    {editingId === conversation._id ? (
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="text"
                                          value={editTitle}
                                          onChange={(e) => setEditTitle(e.target.value)}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') saveTitle();
                                            if (e.key === 'Escape') cancelEditing();
                                          }}
                                          className="flex-1 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          autoFocus
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            saveTitle();
                                          }}
                                          className="p-1 h-auto"
                                        >
                                          <Check className="w-3 h-3 text-green-600" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            cancelEditing();
                                          }}
                                          className="p-1 h-auto"
                                        >
                                          <X className="w-3 h-3 text-red-600" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        <h3 className="text-sm font-medium text-gray-800 truncate">
                                          {conversation.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-1">
                                          <p className="text-xs text-gray-500">
                                            {conversation.llmModelId.displayName}
                                          </p>
                                          <span className="text-xs text-gray-400">
                                            {formatDate(conversation.lastMessageAt)}
                                          </span>
                                        </div>
                                        {conversation.messages.length > 0 && (
                                          <p className="text-xs text-gray-400 mt-1 truncate">
                                            {conversation.messages[conversation.messages.length - 1].content.substring(0, 50)}
                                            {conversation.messages[conversation.messages.length - 1].content.length > 50 ? '...' : ''}
                                          </p>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {editingId !== conversation._id && (
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditing(conversation);
                                        }}
                                        className="p-1 h-auto"
                                      >
                                        <Edit3 className="w-3 h-3 text-gray-500" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteConversation(conversation._id);
                                        }}
                                        className="p-1 h-auto"
                                      >
                                        <Trash2 className="w-3 h-3 text-red-500" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                <p>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
