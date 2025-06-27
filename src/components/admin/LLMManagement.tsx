import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Activity,
  Settings,
  Brain,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { llmApi, LLMModel, LLMStats } from '../../lib/llmApi';
import { LLMModelForm } from './LLMModelForm';
import toast from 'react-hot-toast';

interface LLMManagementProps {
  currentUser: {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  };
}

export const LLMManagement: React.FC<LLMManagementProps> = ({ currentUser }) => {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [stats, setStats] = useState<LLMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modelsRes, statsRes] = await Promise.all([
        llmApi.admin.getLLMModels(),
        llmApi.admin.getLLMStats(),
      ]);

      setModels(modelsRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (error) {
      console.error('Error fetching LLM data:', error);
      toast.error('Failed to load LLM data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (modelId: string) => {
    try {
      await llmApi.admin.setDefaultLLMModel(modelId);
      toast.success('Default model updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error setting default model:', error);
      toast.error('Failed to set default model');
    }
  };

  const handleDelete = async (modelId: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete "${modelName}"?`)) {
      return;
    }

    try {
      await llmApi.admin.deleteLLMModel(modelId);
      toast.success('Model deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete model');
    }
  };

  const toggleApiKeyVisibility = (modelId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [modelId]: !prev[modelId],
    }));
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'anthropic':
        return '🧠';
      case 'openrouter':
        return '🔀';
      case 'deepseek':
        return '🔍';
      case 'gemini':
        return '💎';
      default:
        return '⚙️';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800';
      case 'openrouter':
        return 'bg-blue-100 text-blue-800';
      case 'deepseek':
        return 'bg-indigo-100 text-indigo-800';
      case 'gemini':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">LLM Management</h1>
            <p className="text-gray-600">Manage AI models and configurations</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingModel(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Model</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Models</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalModels}</p>
                </div>
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Models</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeModels}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversations</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalConversations}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Chats</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.activeConversations}</p>
                </div>
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Models List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-800">LLM Models</h2>
        </CardHeader>
        <CardContent className="p-0">
          {models.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No LLM models configured yet.</p>
              <p className="text-sm">Add your first model to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {models.map((model) => (
                <motion.div
                  key={model._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getProviderIcon(model.provider)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                            <span>{model.displayName}</span>
                            {model.isDefault && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            {!model.isActive && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                Inactive
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{model.name} • {model.modelId}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${getProviderColor(model.provider)}`}>
                          {model.provider}
                        </span>
                        <span>Max Tokens: {model.maxTokens}</span>
                        <span>Temperature: {model.temperature}</span>
                        <span>Usage: {model.usageCount}</span>
                        {model.lastUsed && (
                          <span>Last Used: {new Date(model.lastUsed).toLocaleDateString()}</span>
                        )}
                      </div>

                      {model.description && (
                        <p className="text-sm text-gray-600 mt-2">{model.description}</p>
                      )}

                      {/* API Key Display */}
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="text-xs text-gray-500">API Key:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {showApiKeys[model._id] 
                            ? model.apiKey || '••••••••••••••••'
                            : '••••••••••••••••'
                          }
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility(model._id)}
                          className="p-1"
                        >
                          {showApiKeys[model._id] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!model.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(model._id)}
                          className="flex items-center space-x-1"
                        >
                          <StarOff className="w-4 h-4" />
                          <span>Set Default</span>
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingModel(model);
                          setShowForm(true);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(model._id, model.displayName)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <LLMModelForm
            model={editingModel}
            onClose={() => {
              setShowForm(false);
              setEditingModel(null);
            }}
            onSave={() => {
              setShowForm(false);
              setEditingModel(null);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
