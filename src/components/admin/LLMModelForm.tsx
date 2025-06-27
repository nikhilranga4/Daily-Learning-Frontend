import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { llmApi, LLMModel } from '../../lib/llmApi';
import toast from 'react-hot-toast';

interface LLMModelFormProps {
  model?: LLMModel | null;
  onClose: () => void;
  onSave: () => void;
}

export const LLMModelForm: React.FC<LLMModelFormProps> = ({ model, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    provider: 'openai' as const,
    apiKey: '',
    baseUrl: '',
    modelId: '',
    maxTokens: 4000,
    temperature: 0.7,
    systemPrompt: 'You are a helpful AI assistant.',
    isActive: true,
    isDefault: false,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (model) {
      // Fetch full model data with API key for editing
      fetchModelData(model._id);
    }
  }, [model]);

  const fetchModelData = async (modelId: string) => {
    try {
      setLoading(true);
      const response = await llmApi.admin.getLLMModel(modelId);
      const modelData = response.data.data;
      
      setFormData({
        name: modelData.name || '',
        displayName: modelData.displayName || '',
        provider: modelData.provider || 'openai',
        apiKey: modelData.apiKey || '',
        baseUrl: modelData.baseUrl || '',
        modelId: modelData.modelId || '',
        maxTokens: modelData.maxTokens || 4000,
        temperature: modelData.temperature || 0.7,
        systemPrompt: modelData.systemPrompt || 'You are a helpful AI assistant.',
        isActive: modelData.isActive !== undefined ? modelData.isActive : true,
        isDefault: modelData.isDefault || false,
        description: modelData.description || '',
      });
    } catch (error) {
      console.error('Error fetching model data:', error);
      toast.error('Failed to load model data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.apiKey.trim()) {
      newErrors.apiKey = 'API key is required';
    }

    if (!formData.modelId.trim()) {
      newErrors.modelId = 'Model ID is required';
    }

    if (formData.maxTokens < 1 || formData.maxTokens > 100000) {
      newErrors.maxTokens = 'Max tokens must be between 1 and 100,000';
    }

    if (formData.temperature < 0 || formData.temperature > 2) {
      newErrors.temperature = 'Temperature must be between 0 and 2';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (model) {
        await llmApi.admin.updateLLMModel(model._id, formData);
        toast.success('Model updated successfully');
      } else {
        await llmApi.admin.createLLMModel(formData);
        toast.success('Model created successfully');
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving model:', error);
      toast.error(error.response?.data?.message || 'Failed to save model');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const providerOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {model ? 'Edit LLM Model' : 'Add New LLM Model'}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., gpt-4-turbo"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.displayName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., GPT-4 Turbo"
                    />
                    {errors.displayName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.displayName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Provider and Model ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider *
                    </label>
                    <select
                      value={formData.provider}
                      onChange={(e) => handleInputChange('provider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {providerOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model ID *
                    </label>
                    <input
                      type="text"
                      value={formData.modelId}
                      onChange={(e) => handleInputChange('modelId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.modelId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., gpt-4-turbo-preview"
                    />
                    {errors.modelId && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.modelId}
                      </p>
                    )}
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key *
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.apiKey ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter API key"
                  />
                  {errors.apiKey && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.apiKey}
                    </p>
                  )}
                </div>

                {/* Base URL (for custom providers) */}
                {formData.provider === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base URL
                    </label>
                    <input
                      type="url"
                      value={formData.baseUrl}
                      onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://api.example.com/v1"
                    />
                  </div>
                )}

                {/* Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={formData.maxTokens}
                      onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.maxTokens ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="1"
                      max="100000"
                    />
                    {errors.maxTokens && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.maxTokens}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature
                    </label>
                    <input
                      type="number"
                      value={formData.temperature}
                      onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.temperature ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                      max="2"
                      step="0.1"
                    />
                    {errors.temperature && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.temperature}
                      </p>
                    )}
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Prompt
                  </label>
                  <textarea
                    value={formData.systemPrompt}
                    onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="System prompt for the AI model"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Optional description of the model"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Set as Default</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{model ? 'Update' : 'Create'} Model</span>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
