// lib/llmApi.ts
import { api } from './api';

export interface LLMModel {
  _id: string;
  name: string;
  displayName: string;
  provider: 'openai' | 'anthropic' | 'openrouter' | 'deepseek' | 'gemini' | 'custom';
  apiKey?: string; // Only included for admin editing
  baseUrl?: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  isActive: boolean;
  isDefault: boolean;
  description: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  lastUsed?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LLMConversation {
  _id: string;
  userId: string;
  llmModelId: {
    _id: string;
    name: string;
    displayName: string;
    provider: string;
  };
  title: string;
  messages: LLMMessage[];
  isActive: boolean;
  totalTokens: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LLMMessage {
  _id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
}

export interface LLMStats {
  totalModels: number;
  activeModels: number;
  totalConversations: number;
  activeConversations: number;
  providerStats: Array<{
    _id: string;
    count: number;
    totalUsage: number;
  }>;
  topModels: Array<{
    _id: string;
    name: string;
    displayName: string;
    usageCount: number;
    lastUsed?: string;
  }>;
}

export const llmApi = {
  // User APIs
  getAvailableModels: () => api.get('/api/llm/models'),
  
  createConversation: (data: { modelId: string; title?: string }) =>
    api.post('/api/llm/conversations', data),
  
  getUserConversations: (page = 1, limit = 20) =>
    api.get(`/api/llm/conversations?page=${page}&limit=${limit}`),
  
  getConversation: (conversationId: string) =>
    api.get(`/api/llm/conversations/${conversationId}`),
  
  sendMessage: (conversationId: string, message: string, modelId?: string) =>
    api.post(`/api/llm/conversations/${conversationId}/messages`, { message, modelId }),
  
  updateConversationTitle: (conversationId: string, title: string) =>
    api.put(`/api/llm/conversations/${conversationId}/title`, { title }),
  
  deleteConversation: (conversationId: string) =>
    api.delete(`/api/llm/conversations/${conversationId}`),
  
  getUserStats: () => api.get('/api/llm/stats'),

  getConversationHistory: (conversationId: string) =>
    api.get(`/api/llm/conversations/${conversationId}/history`),

  restoreConversation: (conversationId: string, fileId: string) =>
    api.post(`/api/llm/conversations/${conversationId}/restore/${fileId}`),

  validateModel: (modelId: string) =>
    api.get(`/api/llm/validate/${modelId}`),

  // Admin APIs
  admin: {
    getLLMModels: () => api.get('/api/llm/admin/models'),
    
    getLLMModel: (id: string) => api.get(`/api/llm/admin/models/${id}`),
    
    createLLMModel: (data: Partial<LLMModel>) =>
      api.post('/api/llm/admin/models', data),
    
    updateLLMModel: (id: string, data: Partial<LLMModel>) =>
      api.put(`/api/llm/admin/models/${id}`, data),
    
    deleteLLMModel: (id: string) =>
      api.delete(`/api/llm/admin/models/${id}`),
    
    setDefaultLLMModel: (id: string) =>
      api.put(`/api/llm/admin/models/${id}/default`),
    
    getLLMStats: () => api.get('/api/llm/admin/stats'),
  },
};
