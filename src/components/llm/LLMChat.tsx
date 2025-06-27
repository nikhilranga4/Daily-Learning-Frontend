import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Plus,
  MessageCircle,
  Bot,
  User,
  Trash2,
  Edit3,
  ArrowLeft,
  Settings,
  Loader,
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { llmApi, LLMModel, LLMConversation, LLMMessage } from '../../lib/llmApi';
import { LLMMessageComponent } from './LLMMessageComponent';
import { LLMSidebar } from './LLMSidebar';
import { LLMModelSelector } from './LLMModelSelector';
import { LLMModelDropdown } from './LLMModelDropdown';
import toast from 'react-hot-toast';

interface LLMChatProps {
  currentUser: {
    _id: string;
    name: string;
    email: string;
  };
  onBack?: () => void;
}

export const LLMChat: React.FC<LLMChatProps> = ({ currentUser, onBack }) => {
  const [conversations, setConversations] = useState<LLMConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<LLMConversation | null>(null);
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModelSelector, setShowModelSelector] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [modelsRes, conversationsRes] = await Promise.all([
        llmApi.getAvailableModels(),
        llmApi.getUserConversations(),
      ]);

      const models = modelsRes.data.data || [];
      const conversations = conversationsRes.data.data || [];

      setAvailableModels(models);
      setConversations(conversations);

      // Set default model
      const defaultModel = models.find((m: LLMModel) => m.isDefault) || models[0];
      if (defaultModel) {
        setSelectedModel(defaultModel);
      }

      // Load first conversation if exists
      if (conversations.length > 0) {
        await loadConversation(conversations[0]._id);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await llmApi.getConversation(conversationId);
      setCurrentConversation(response.data.data);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const createNewConversation = async () => {
    if (!selectedModel && availableModels.length > 0) {
      setShowModelSelector(true);
      return;
    }

    try {
      const response = await llmApi.createConversation({
        modelId: selectedModel?._id || '', // Backend will handle empty modelId
        title: 'New Conversation',
      });

      const newConversation = response.data.data;
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);

      // Update selected model if it wasn't set
      if (!selectedModel && newConversation.llmModelId) {
        const model = availableModels.find(m => m._id === newConversation.llmModelId._id);
        if (model) {
          setSelectedModel(model);
        }
      }

      toast.success('New conversation created');
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create conversation';
      toast.error(errorMessage);

      // If no models available, show model selector
      if (errorMessage.includes('No active LLM models')) {
        toast.error('No AI models are configured. Please contact your administrator.');
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentConversation || sending || !selectedModel) return;

    const userMessage = message.trim();
    setMessage('');
    setSending(true);

    // Add user message to UI immediately
    const tempUserMessage: LLMMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setCurrentConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, tempUserMessage],
    } : null);

    try {
      console.log(`📤 Sending message with model: ${selectedModel?.displayName} (${selectedModel?._id})`);

      const response = await llmApi.sendMessage(
        currentConversation._id,
        userMessage,
        selectedModel?._id
      );
      const updatedConversation = response.data.data.conversation;

      setCurrentConversation(updatedConversation);

      // Update conversations list
      setConversations(prev =>
        prev.map(conv =>
          conv._id === updatedConversation._id ? updatedConversation : conv
        )
      );

      // Don't show success toast for normal operation
    } catch (error: any) {
      console.error('Error sending message:', error);

      const errorMessage = error.response?.data?.message || 'Failed to send message';
      toast.error(errorMessage);

      // Remove the temporary user message on error
      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: prev.messages.slice(0, -1),
      } : null);

      // Handle specific error cases
      if (errorMessage.includes('data policy')) {
        toast.error('Model requires privacy settings configuration. Please try a different model or contact admin.');
        setShowModelSelector(true);
      } else if (errorMessage.includes('quota exceeded') || errorMessage.includes('insufficient credits')) {
        toast.error('API quota exceeded. Please try a different model or contact admin.');
        setShowModelSelector(true);
      } else if (errorMessage.includes('authentication failed')) {
        toast.error('API authentication failed. Please contact admin to check API key configuration.');
      } else if (errorMessage.includes('not available') || errorMessage.includes('Invalid or inactive LLM model')) {
        toast.error('The selected AI model is no longer available. Please select a different model.');
        setShowModelSelector(true);
      } else if (errorMessage.includes('Unable to connect')) {
        toast.error('Unable to connect to AI service. Please check your internet connection and try again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await llmApi.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const updateConversationTitle = async (conversationId: string, newTitle: string) => {
    try {
      await llmApi.updateConversationTitle(conversationId, newTitle);
      
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId ? { ...conv, title: newTitle } : conv
        )
      );
      
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, title: newTitle } : null);
      }
      
      toast.success('Title updated');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleModelChange = async (model: LLMModel) => {
    console.log(`🔄 Changing model to: ${model.displayName} (${model._id})`);

    try {
      // Validate the model before using it
      const response = await llmApi.validateModel(model._id);
      console.log(`✅ Model validation successful:`, response.data);

      setSelectedModel(model);

      // If there's a current conversation and it's using a different model,
      // log the change for debugging
      if (currentConversation && currentConversation.llmModelId._id !== model._id) {
        console.log(`Model changed from ${currentConversation.llmModelId.displayName} to ${model.displayName}`);
        toast.success(`Switched to ${model.displayName}`);
      }
    } catch (error: any) {
      console.error('Model validation failed:', error);

      // Try to use the model anyway if it's in the available models list
      if (availableModels.find(m => m._id === model._id)) {
        console.log(`⚠️  Validation failed but model exists in list, using anyway`);
        setSelectedModel(model);
        toast.warning(`Using ${model.displayName} (validation warning)`);
      } else {
        toast.error(`Failed to switch to ${model.displayName}: ${error.response?.data?.message || 'Model not available'}`);
        return;
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <LLMSidebar
        conversations={conversations}
        currentConversation={currentConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectConversation={loadConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onUpdateTitle={updateConversationTitle}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              
              <div className="flex items-center space-x-3">
                <Bot className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {currentConversation?.title || 'AI Assistant'}
                  </h1>
                  {(currentConversation?.llmModelId || selectedModel) && (
                    <p className="text-sm text-gray-600">
                      {currentConversation?.llmModelId
                        ? `${currentConversation.llmModelId.displayName} • ${currentConversation.llmModelId.provider}`
                        : `${selectedModel?.displayName} • ${selectedModel?.provider}`
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModelSelector(true)}
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Model</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!currentConversation ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                  Welcome to AI Assistant
                </h2>
                <p className="text-gray-500 mb-6">
                  Start a new conversation to begin chatting with AI
                </p>
                <Button onClick={createNewConversation} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Conversation</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {currentConversation.messages.map((msg, index) => (
                <LLMMessageComponent
                  key={index}
                  message={msg}
                  isUser={msg.role === 'user'}
                  currentUser={currentUser}
                />
              ))}
              
              {sending && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>AI is thinking...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {currentConversation && (
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Model Selector Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">AI Model:</span>
                  <LLMModelDropdown
                    models={availableModels}
                    selectedModel={selectedModel}
                    onSelect={handleModelChange}
                    disabled={sending}
                  />
                  {currentConversation && selectedModel &&
                   currentConversation.llmModelId._id !== selectedModel._id && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Model changed - new messages will use {selectedModel.displayName}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedModel && (
                    <span>
                      Max: {selectedModel.maxTokens?.toLocaleString() || 'N/A'} tokens •
                      Temp: {selectedModel.temperature || 'N/A'}
                    </span>
                  )}
                </div>
              </div>

              {/* Input Row */}
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      adjustTextareaHeight();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedModel ? `Ask ${selectedModel.displayName}...` : "Type your message..."}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={1}
                    disabled={sending}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending || !selectedModel}
                  className="flex items-center space-x-2 px-6 py-3"
                >
                  {sending ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Send</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Selector Modal */}
      <AnimatePresence>
        {showModelSelector && (
          <LLMModelSelector
            models={availableModels}
            selectedModel={selectedModel}
            onSelect={(model) => {
              setSelectedModel(model);
              setShowModelSelector(false);
            }}
            onClose={() => setShowModelSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
