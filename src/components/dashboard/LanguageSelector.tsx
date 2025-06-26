import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Play, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { examApi } from '../../lib/api';
import { ProgrammingLanguage } from '../../types';
import toast from 'react-hot-toast';

interface LanguageSelectorProps {
  onLanguageSelect: (languageId: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect }) => {
  const [languages, setLanguages] = useState<ProgrammingLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchLanguages();
  }, []);
  
  const fetchLanguages = async () => {
    try {
      console.log('Fetching languages...');
      const response = await examApi.getLanguages();
      console.log('Languages response:', response);
      // Map the response to match the ProgrammingLanguage type
      const formattedLanguages = response.data.map((lang: { _id: string; name: string }) => ({
        _id: lang._id,
        name: lang.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      setLanguages(formattedLanguages);
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast.error('Failed to load programming languages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const languageIcons: Record<string, string> = {
    Python: '🐍',
    Java: '☕',
    JavaScript: '⚡',
    'C++': '⚙️',
    React: '⚛️',
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Choose Your Programming Language
        </h1>
        <p className="text-gray-600 text-lg">
          Select a language to start today's assessment
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((language, index) => (
          <motion.div
            key={language._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
              <CardHeader className="text-center pb-2">
                <div className="text-4xl mb-3">
                  {languageIcons[language.name as keyof typeof languageIcons] || <Code className="w-12 h-12 mx-auto text-blue-600" />}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{language.name}</h3>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>15-20 MCQs</span>
                  </div>
                  <div className="flex items-center">
                    <Play className="w-4 h-4 mr-1" />
                    <span>~30 mins</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                    if (!/^[0-9a-fA-F]{24}$/.test(language._id)) {
                      console.error('Invalid language ID:', language._id);
                      return;
                    }
                    console.log('Selected language ID:', language._id);
                    onLanguageSelect(language._id);
                  }}
                  className="w-full"
                >
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {languages.length === 0 && (
        <div className="text-center py-12">
          <Code className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Programming Languages Available
          </h3>
          <p className="text-gray-500">
            Please contact your administrator to add programming languages.
          </p>
        </div>
      )}
    </motion.div>
  );
};