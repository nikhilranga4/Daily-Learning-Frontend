import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { adminApi } from '../../lib/api';
import { ProgrammingLanguage } from '../../types';
import toast from 'react-hot-toast';

export const LanguageManagement: React.FC = () => {
  const [languages, setLanguages] = useState<ProgrammingLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLanguageName, setNewLanguageName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getLanguages();
      setLanguages(response.data);
    } catch (error) {
      toast.error('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLanguageName.trim()) {
      toast.error('Language name cannot be empty');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminApi.addLanguage({ name: newLanguageName });
      toast.success('Language added successfully');
      setNewLanguageName('');
      fetchLanguages(); // Refresh the list
    } catch (error) {
      toast.error('Failed to add language');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Language List */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-800">Programming Languages ({languages.length})</h2>
        </CardHeader>
        <CardContent>
          {languages.length === 0 ? (
            <p className="text-gray-500">No languages added yet.</p>
          ) : (
            <ul className="space-y-2">
              {languages.map(lang => (
                <li key={lang._id} className="flex items-center p-2 bg-gray-50 rounded-md">
                  <Code className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="font-medium text-gray-700">{lang.name}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add Language Form */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-800">Add New Language</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddLanguage} className="space-y-4">
            <div>
              <label htmlFor="languageName" className="block text-sm font-medium text-gray-700 mb-1">
                Language Name
              </label>
              <Input
                id="languageName"
                type="text"
                value={newLanguageName}
                onChange={e => setNewLanguageName(e.target.value)}
                placeholder="e.g., JavaScript"
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Language
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
