import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Brain,
  Calendar,
  User,
  BookOpen,
  Star,
  Lightbulb,
  Target,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { adminApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface DailyKnowledge {
  _id: string;
  knowledgeTopic: string;
  date: string;
  contentType: 'Concept' | 'Tutorial' | 'Best Practice' | 'Tips & Tricks' | 'Deep Dive';
  isGenerated: boolean;
  generatedAt?: string;
  createdBy: {
    _id: string;
    email: string;
  };
  createdAt: string;
}

export const KnowledgeManagement: React.FC = () => {
  const [knowledgeTopics, setKnowledgeTopics] = useState<DailyKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTopic, setEditingTopic] = useState<DailyKnowledge | null>(null);
  const [newTopic, setNewTopic] = useState({
    knowledgeTopic: '',
    date: '',
    contentType: 'Concept' as const
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const knowledgeRes = await adminApi.getDailyKnowledge();
      setKnowledgeTopics(knowledgeRes);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async () => {
    try {
      if (!newTopic.knowledgeTopic || !newTopic.date) {
        toast.error('Please fill in all required fields');
        return;
      }

      await adminApi.addDailyKnowledge(newTopic);
      toast.success('Knowledge topic added successfully');
      setShowAddDialog(false);
      setNewTopic({
        knowledgeTopic: '',
        date: '',
        contentType: 'Concept'
      });
      fetchData();
    } catch (error: any) {
      console.error('Error adding topic:', error);
      if (error.response?.data?.error === 'DUPLICATE_DATE') {
        toast.error('A knowledge topic already exists for this date');
      } else {
        toast.error('Failed to add knowledge topic');
      }
    }
  };

  const handleEditTopic = async () => {
    if (!editingTopic) return;

    try {
      await adminApi.updateDailyKnowledge(editingTopic._id, {
        knowledgeTopic: editingTopic.knowledgeTopic,
        date: editingTopic.date,
        contentType: editingTopic.contentType
      });
      toast.success('Knowledge topic updated successfully');
      setEditingTopic(null);
      fetchData();
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update knowledge topic');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge topic?')) return;

    try {
      await adminApi.deleteDailyKnowledge(id);
      toast.success('Knowledge topic deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('Failed to delete knowledge topic');
    }
  };



  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'Concept': return <Brain className="w-4 h-4" />;
      case 'Tutorial': return <BookOpen className="w-4 h-4" />;
      case 'Best Practice': return <Star className="w-4 h-4" />;
      case 'Tips & Tricks': return <Lightbulb className="w-4 h-4" />;
      case 'Deep Dive': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'Concept': return 'text-blue-600 bg-blue-50';
      case 'Tutorial': return 'text-purple-600 bg-purple-50';
      case 'Best Practice': return 'text-green-600 bg-green-50';
      case 'Tips & Tricks': return 'text-orange-600 bg-orange-50';
      case 'Deep Dive': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
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
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Knowledge Management</h2>
          <p className="text-gray-600">Manage daily knowledge topics and content</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Topic</span>
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      {(showAddDialog || editingTopic) && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <h3 className="text-lg font-semibold">
              {editingTopic ? 'Edit Knowledge Topic' : 'Add New Knowledge Topic'}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Knowledge Topic *
                </label>
                <input
                  type="text"
                  value={editingTopic ? editingTopic.knowledgeTopic : newTopic.knowledgeTopic}
                  onChange={(e) => {
                    if (editingTopic) {
                      setEditingTopic({ ...editingTopic, knowledgeTopic: e.target.value });
                    } else {
                      setNewTopic({ ...newTopic, knowledgeTopic: e.target.value });
                    }
                  }}
                  placeholder="Enter knowledge topic (e.g., 'Clean Code Principles')"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={editingTopic ? editingTopic.date : newTopic.date}
                  onChange={(e) => {
                    if (editingTopic) {
                      setEditingTopic({ ...editingTopic, date: e.target.value });
                    } else {
                      setNewTopic({ ...newTopic, date: e.target.value });
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  value={editingTopic ? editingTopic.contentType : newTopic.contentType}
                  onChange={(e) => {
                    const contentType = e.target.value as 'Concept' | 'Tutorial' | 'Best Practice' | 'Tips & Tricks' | 'Deep Dive';
                    if (editingTopic) {
                      setEditingTopic({ ...editingTopic, contentType });
                    } else {
                      setNewTopic({ ...newTopic, contentType });
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Concept">Concept</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Best Practice">Best Practice</option>
                  <option value="Tips & Tricks">Tips & Tricks</option>
                  <option value="Deep Dive">Deep Dive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingTopic(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingTopic ? handleEditTopic : handleAddTopic}
              >
                {editingTopic ? 'Update Topic' : 'Add Topic'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Topics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {knowledgeTopics.map((topic) => (
          <motion.div
            key={topic._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`h-full border-l-4 ${
              topic.isGenerated ? 'border-l-green-500' : 'border-l-blue-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${getContentTypeColor(topic.contentType)}`}>
                      {getContentTypeIcon(topic.contentType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {topic.contentType}
                      </h3>
                      <p className="text-sm text-gray-600">Daily Knowledge</p>
                    </div>
                  </div>
                  {topic.isGenerated && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <h4 className="font-medium text-gray-800 mb-3 line-clamp-2">
                  {topic.knowledgeTopic}
                </h4>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(topic.date).toLocaleDateString()}</span>
                    </div>
                    {topic.isGenerated && (
                      <div className="flex items-center text-green-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Generated</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>{topic.createdBy.email}</span>
                  </div>
                </div>

                <div className="flex justify-between space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTopic(topic)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteTopic(topic._id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {knowledgeTopics.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Knowledge Topics Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by adding your first daily knowledge topic.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Topic
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
