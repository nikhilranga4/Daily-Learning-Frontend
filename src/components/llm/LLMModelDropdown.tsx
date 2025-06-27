import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Bot, Check } from 'lucide-react';
import { LLMModel } from '../../lib/llmApi';

interface LLMModelDropdownProps {
  models: LLMModel[];
  selectedModel: LLMModel | null;
  onSelect: (model: LLMModel) => void;
  disabled?: boolean;
}

export const LLMModelDropdown: React.FC<LLMModelDropdownProps> = ({
  models,
  selectedModel,
  onSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        return 'text-green-600';
      case 'anthropic':
        return 'text-purple-600';
      case 'openrouter':
        return 'text-blue-600';
      case 'deepseek':
        return 'text-indigo-600';
      case 'gemini':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (models.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-500">
        <Bot className="w-4 h-4" />
        <span>No models available</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500'
        }`}
      >
        {selectedModel ? (
          <>
            <span className="text-lg">{getProviderIcon(selectedModel.provider)}</span>
            <div className="flex flex-col items-start min-w-0">
              <span className="font-medium text-gray-800 truncate max-w-32">
                {selectedModel.displayName}
              </span>
              <span className={`text-xs ${getProviderColor(selectedModel.provider)}`}>
                {selectedModel.provider}
              </span>
            </div>
          </>
        ) : (
          <>
            <Bot className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Select Model</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            <div className="p-2">
              {models.map((model) => (
                <button
                  key={model._id}
                  onClick={() => {
                    onSelect(model);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                    selectedModel?._id === model._id
                      ? 'bg-purple-50 text-purple-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{getProviderIcon(model.provider)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 truncate">
                        {model.displayName}
                      </span>
                      {selectedModel?._id === model._id && (
                        <Check className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className={getProviderColor(model.provider)}>
                        {model.provider}
                      </span>
                      {model.isDefault && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    {model.description && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {model.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
