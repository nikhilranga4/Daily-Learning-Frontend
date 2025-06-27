import React from 'react';
import { motion } from 'framer-motion';
import { X, Star, Zap, Brain, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LLMModel } from '../../lib/llmApi';

interface LLMModelSelectorProps {
  models: LLMModel[];
  selectedModel: LLMModel | null;
  onSelect: (model: LLMModel) => void;
  onClose: () => void;
}

export const LLMModelSelector: React.FC<LLMModelSelectorProps> = ({
  models,
  selectedModel,
  onSelect,
  onClose,
}) => {
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'openrouter':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deepseek':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'gemini':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getModelCapabilities = (model: LLMModel) => {
    const capabilities = [];

    if (model.maxTokens && model.maxTokens >= 8000) {
      capabilities.push({ icon: Brain, label: 'Long Context', color: 'text-purple-600' });
    }

    if (model.temperature !== undefined) {
      if (model.temperature <= 0.3) {
        capabilities.push({ icon: Settings, label: 'Precise', color: 'text-blue-600' });
      } else if (model.temperature >= 0.8) {
        capabilities.push({ icon: Zap, label: 'Creative', color: 'text-orange-600' });
      }
    }

    return capabilities;
  };

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
        className="w-full max-w-4xl max-h-[80vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Select AI Model</h2>
                <p className="text-gray-600 text-sm">Choose the AI model for your conversation</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {models.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No AI models available</p>
                <p className="text-sm text-gray-400">Contact your administrator to add models</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map((model) => {
                  const isSelected = selectedModel?._id === model._id;
                  const capabilities = getModelCapabilities(model);
                  
                  return (
                    <motion.div
                      key={model._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => onSelect(model)}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white fill-current" />
                          </div>
                        </div>
                      )}

                      {/* Default badge */}
                      {model.isDefault && !isSelected && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Default
                          </span>
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{getProviderIcon(model.provider)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {model.displayName}
                            </h3>
                            <p className="text-sm text-gray-600">{model.name}</p>
                          </div>
                        </div>

                        {/* Provider badge */}
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getProviderColor(model.provider)}`}>
                            {model.provider}
                          </span>
                          {capabilities.map((capability, index) => {
                            const Icon = capability.icon;
                            return (
                              <div
                                key={index}
                                className="flex items-center space-x-1 text-xs text-gray-600"
                              >
                                <Icon className={`w-3 h-3 ${capability.color}`} />
                                <span>{capability.label}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Description */}
                        {model.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {model.description}
                          </p>
                        )}

                        {/* Configuration details */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Max Tokens:</span>
                            <span className="ml-1">{model.maxTokens?.toLocaleString() || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-medium">Temperature:</span>
                            <span className="ml-1">{model.temperature || 'N/A'}</span>
                          </div>
                        </div>

                        {/* System prompt preview */}
                        {model.systemPrompt &&
                         model.systemPrompt.trim() &&
                         model.systemPrompt !== 'You are a helpful AI assistant.' && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-600">System Prompt:</span>
                            <p className="text-gray-500 mt-1 line-clamp-2">
                              {model.systemPrompt}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              {selectedModel && (
                <Button onClick={() => onSelect(selectedModel)}>
                  Use {selectedModel.displayName}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
